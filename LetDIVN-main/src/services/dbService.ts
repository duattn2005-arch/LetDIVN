import {
  CleanupEvent,
  NewsArticle,
  Partner,
  GalleryItem,
  TeamMember,
  VolunteerRegistration,
  ContactMessage,
  UserProfile,
  MediaVideo,
  WhatWeDoItem,
  WhoWeAreItem,
  MediaCoverageEntry
} from '../types';

type Listener = () => void;

/**
 * Thin REST API client — this used to be a localStorage wrapper (everything
 * client-side, nothing shared between visitors). It's now a real shared
 * backend (SQLite via Express, see server/). Method names are kept the same
 * as before wherever practical so callers barely changed, just added
 * `await`. `subscribe`/notify still exists so already-mounted components in
 * the same tab refetch right after a mutation, same UX as before — it's
 * just no longer backed by a `storage` write, it's called manually after
 * each successful request.
 */
class DatabaseService {
  private listeners: Set<Listener> = new Set();

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error notifying database listener', err);
      }
    });
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`/api${path}`, {
      credentials: 'include',
      headers: options?.body ? { 'Content-Type': 'application/json' } : undefined,
      ...options,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Yêu cầu thất bại (${res.status})`);
    }
    return res.json();
  }

  private async get<T>(path: string): Promise<T> {
    return this.request<T>(path);
  }

  private async mutate<T>(path: string, method: 'POST' | 'PUT' | 'DELETE', body?: unknown): Promise<T> {
    const result = await this.request<T>(path, { method, body: body !== undefined ? JSON.stringify(body) : undefined });
    this.notify();
    return result;
  }

  // --- SITE CONTENT ---
  // The whole table is fetched once and cached, since a page can have 10-20+
  // editable text/image slots — one request beats one-per-slot.
  private contentCache: Record<string, string> | null = null;
  private contentPromise: Promise<Record<string, string>> | null = null;

  private async loadContent(): Promise<Record<string, string>> {
    if (this.contentCache) return this.contentCache;
    if (!this.contentPromise) {
      this.contentPromise = this.get<Record<string, string>>('/content').then((data) => {
        this.contentCache = data;
        return data;
      });
    }
    return this.contentPromise;
  }

  public async getContent(key: string, fallback: string): Promise<string> {
    const all = await this.loadContent();
    const stored = all[key];
    return stored ? stored : fallback;
  }

  public async setContent(key: string, value: string): Promise<void> {
    await this.mutate(`/content/${encodeURIComponent(key)}`, 'PUT', { value });
    if (this.contentCache) this.contentCache[key] = value;
  }

  public async resetContent(key: string): Promise<void> {
    await this.mutate(`/content/${encodeURIComponent(key)}`, 'DELETE');
    if (this.contentCache) delete this.contentCache[key];
  }

  // --- EVENTS ---
  public getEvents(): Promise<CleanupEvent[]> {
    return this.get('/events');
  }
  public addEvent(event: Omit<CleanupEvent, 'id'>): Promise<CleanupEvent> {
    return this.mutate('/events', 'POST', event);
  }
  public updateEvent(id: string, updates: Partial<CleanupEvent>): Promise<CleanupEvent> {
    return this.mutate(`/events/${encodeURIComponent(id)}`, 'PUT', updates);
  }
  public approveEvent(id: string): Promise<CleanupEvent> {
    return this.updateEvent(id, { status: 'Upcoming' });
  }
  public async deleteEvent(id: string): Promise<boolean> {
    await this.mutate(`/events/${encodeURIComponent(id)}`, 'DELETE');
    return true;
  }

  // --- VOLUNTEERS ---
  public getVolunteers(): Promise<VolunteerRegistration[]> {
    return this.get('/volunteers');
  }
  public addVolunteer(volunteer: Omit<VolunteerRegistration, 'id' | 'registeredAt'>): Promise<VolunteerRegistration> {
    return this.mutate('/volunteers', 'POST', volunteer);
  }
  public updateVolunteer(id: string, updates: Partial<VolunteerRegistration>): Promise<VolunteerRegistration> {
    return this.mutate(`/volunteers/${encodeURIComponent(id)}`, 'PUT', updates);
  }
  public async deleteVolunteer(id: string): Promise<boolean> {
    await this.mutate(`/volunteers/${encodeURIComponent(id)}`, 'DELETE');
    return true;
  }

  // --- NEWS ---
  // Read-only: articles are published through Decap CMS (/admin).
  public getNews(): Promise<NewsArticle[]> {
    return this.get('/news');
  }

  // --- PARTNERS ---
  public getPartners(): Promise<Partner[]> {
    return this.get('/partners');
  }

  // --- GALLERY ---
  public getGallery(): Promise<GalleryItem[]> {
    return this.get('/gallery');
  }

  // --- TEAM ---
  public getTeam(): Promise<TeamMember[]> {
    return this.get('/team');
  }

  // --- CONTACTS ---
  public getContacts(): Promise<ContactMessage[]> {
    return this.get('/contacts');
  }
  public addContact(contact: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>): Promise<ContactMessage> {
    return this.mutate('/contacts', 'POST', contact);
  }
  public updateContactStatus(id: string, status: 'Read' | 'Replied' | 'Unread'): Promise<ContactMessage> {
    return this.mutate(`/contacts/${encodeURIComponent(id)}`, 'PUT', { status });
  }
  public async deleteContact(id: string): Promise<boolean> {
    await this.mutate(`/contacts/${encodeURIComponent(id)}`, 'DELETE');
    return true;
  }

  // --- VIDEOS ---
  public getVideos(): Promise<MediaVideo[]> {
    return this.get('/videos');
  }

  // --- WHAT WE DO ---
  public getWhatWeDo(): Promise<WhatWeDoItem[]> {
    return this.get('/what-we-do');
  }

  // --- WHO WE ARE (extra sections) ---
  public getWhoWeAreSections(): Promise<WhoWeAreItem[]> {
    return this.get('/who-we-are-sections');
  }

  // --- MEDIA COVERAGE (Media on Us entries) ---
  public getMediaCoverage(): Promise<MediaCoverageEntry[]> {
    return this.get('/media-coverage');
  }

  // --- USERS (admin dashboard) ---
  public getUsers(): Promise<(UserProfile & { hasPassword: boolean })[]> {
    return this.get('/users');
  }
  public async deleteUser(id: string): Promise<boolean> {
    await this.mutate(`/users/${encodeURIComponent(id)}`, 'DELETE');
    return true;
  }

  // --- GRANTED ADMINS ---
  public getGrantedAdminEmails(): Promise<string[]> {
    return this.get('/admins');
  }
  public async grantAdmin(email: string): Promise<void> {
    await this.mutate('/admins', 'POST', { email });
  }
  public async revokeAdmin(email: string): Promise<void> {
    await this.mutate(`/admins/${encodeURIComponent(email)}`, 'DELETE');
  }

  // --- STATS ---
  public getStats(): Promise<{
    totalTrashKg: number;
    totalTrashTons: number;
    totalVolunteers: number;
    totalEvents: number;
    totalProvinces: number;
    totalPartners: number;
    totalNews: number;
    pendingVolunteersCount: number;
    upcomingEventsCount: number;
  }> {
    return this.get('/stats');
  }

  // --- FILE UPLOAD ---
  public async uploadFile(file: File | Blob): Promise<string> {
    const formData = new FormData();
    formData.append('file', file, (file as File).name || `pasted-image.${(file.type.split('/')[1] || 'png')}`);
    const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: formData });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Tải ảnh lên thất bại');
    }
    const data = await res.json();
    return data.url;
  }
}

export const dbService = new DatabaseService();
