import {
  CleanupEvent,
  NewsArticle,
  Partner,
  GalleryItem,
  TeamMember,
  VolunteerRegistration,
  ContactMessage,
  MediaVideo,
  WhatWeDoItem,
  WhoWeAreItem,
  MediaCoverageEntry,
  ProjectStaticContent
} from '../types';

type Listener = () => void;

/**
 * Thin REST API client for server/. Everything shown on the site is read-only
 * here: content is edited in Decap CMS (/admin). The only writes are the two
 * public forms (volunteer sign-up, contact message). `subscribe` lets mounted
 * components refetch after one of those, e.g. an event's sign-up count.
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

  private async post<T>(path: string, body: unknown): Promise<T> {
    const result = await this.request<T>(path, { method: 'POST', body: JSON.stringify(body) });
    this.notify();
    return result;
  }

  // --- PAGE TEXT & IMAGES (Decap "Nội dung các trang") ---
  // Fetched once and cached, since a page can have 10-20+ text/image slots —
  // one request beats one per slot.
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

  // --- EVENTS ---
  public getEvents(): Promise<CleanupEvent[]> {
    return this.get('/events');
  }

  // --- VOLUNTEERS ---
  public addVolunteer(volunteer: Omit<VolunteerRegistration, 'id' | 'registeredAt'>): Promise<{ id: string }> {
    return this.post('/volunteers', volunteer);
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
  public addContact(contact: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>): Promise<{ id: string }> {
    return this.post('/contacts', contact);
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

  // --- PROJECT STORY PAGES (keyed by event category) ---
  private projectPagesPromise: Promise<Record<string, ProjectStaticContent>> | null = null;
  public getProjectPages(): Promise<Record<string, ProjectStaticContent>> {
    this.projectPagesPromise ??= this.get<Record<string, ProjectStaticContent>>('/project-pages').catch((err) => {
      this.projectPagesPromise = null;
      throw err;
    });
    return this.projectPagesPromise;
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
    upcomingEventsCount: number;
  }> {
    return this.get('/stats');
  }

}

export const dbService = new DatabaseService();
