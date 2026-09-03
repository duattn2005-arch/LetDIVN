export type UserRole = 'admin' | 'coordinator' | 'volunteer' | 'guest';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar: string;
  role: UserRole;
  provider: 'google' | 'facebook' | 'phone' | 'email';
  joinedAt: string;
  eventsAttended?: number;
  trashCollectedKg?: number;
  city?: string;
}

export interface VolunteerRegistration {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  eventId: string;
  eventName: string;
  ageGroup: string;
  tshirtSize: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  emergencyContact: string;
  skills: string[];
  status: 'Pending' | 'Approved' | 'Checked-In' | 'Completed' | 'Cancelled';
  registeredAt: string;
  notes?: string;
}

export interface CleanupEvent {
  id: string;
  title: string;
  category: 'World Cleanup Day' | 'Environmental Day' | 'Green Ocean Campaign' | 'Young Conservationists' | 'Community Workshop' | 'Wildlife & Nature' | 'Workshop & Education';
  date: string;
  time: string;
  location: string;
  city: string;
  coordinates?: { lat: number; lng: number };
  image: string;
  bannerImage?: string;
  description: string;
  targetVolunteers: number;
  registeredCount: number;
  trashCollectedKg?: number;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Pending';
  leader: string;
  meetingPoint: string;
  googleMapsUrl?: string;
  sheetUrl?: string;
  schedule?: { time: string; activity: string }[];
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  category: 'Media On Us' | 'News' | 'Press Release' | 'Impact Story';
  summary: string;
  content: string;
  author: string;
  date: string;
  image: string;
  source?: string;
  sourceUrl?: string;
  views: number;
  featured: boolean;
  status?: 'Published' | 'Pending';
}

export interface Partner {
  id: string;
  name: string;
  tier: 'Diamond' | 'Gold' | 'Silver' | 'Community' | 'Media';
  logo: string;
  website: string;
  type: string;
  description: string;
  joinedYear: number;
  contactPerson?: string;
  email?: string;
  phone?: string;
  scale?: number; // Zoom / Scale percentage (e.g. 100, 120, 80)
}

export interface GalleryItem {
  id: string;
  title: string;
  eventName: string;
  year: number;
  city: string;
  imageUrl: string;
  caption: string;
  category: string;
  likes?: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'New' | 'In Review' | 'Replied' | 'Unread' | 'Read';
  createdAt: string;
}

export interface MediaVideo {
  id: string;
  youtubeId: string;
  title: string;
  thumbnailUrl: string;
  addedAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  bio: string;
  linkedin?: string;
  facebook?: string;
  email?: string;
}

export type ActiveView = 
  | 'home'
  | 'who-we-are'
  | 'what-we-do'
  | 'our-team'
  | 'our-partners'
  | 'projects'
  | 'map'
  | 'news'
  | 'media-on-us'
  | 'gallery'
  | 'videos'
  | 'contact'
  | 'project-detail';

export interface WhatWeDoItem {
  id: string;
  badge?: string;
  title: string;
  desc: string;
  image: string;
  layout?: 'image-left' | 'image-right';
  highlights?: string[];
  order?: number;
}


