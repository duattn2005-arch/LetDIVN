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

export interface NewsContentBlock {
  /** text = plain paragraphs; html = formatted paragraphs from the admin editor. */
  type: 'text' | 'html' | 'image';
  value: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  category: 'Media On Us' | 'News' | 'Press Release' | 'Impact Story';
  summary: string;
  content: string;
  contentBlocks?: NewsContentBlock[];
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
  /** File name of the entry in Decap CMS (content/<collection>/<slug>.json). */
  slug?: string;
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
  /** File name of the entry in Decap CMS (content/<collection>/<slug>.json). */
  slug?: string;
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
  /** File name of the entry in Decap CMS (content/<collection>/<slug>.json). */
  slug?: string;
  youtubeId: string;
  title: string;
  thumbnailUrl: string;
  addedAt?: string;
}

export interface TeamMember {
  id: string;
  /** File name of the entry in Decap CMS (content/<collection>/<slug>.json). */
  slug?: string;
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
  /** File name of the entry in Decap CMS (content/<collection>/<slug>.json). */
  slug?: string;
  badge?: string;
  title: string;
  desc: string;
  image: string;
  layout?: 'image-left' | 'image-right';
  highlights?: string[];
  order?: number;
}

export interface WhoWeAreItem {
  id: string;
  /** File name of the entry in Decap CMS (content/<collection>/<slug>.json). */
  slug?: string;
  title: string;
  desc: string;
  image: string;
  layout?: 'image-left' | 'image-right';
  order?: number;
}

export interface MediaCoverageEntry {
  id: string;
  /** File name of the entry in Decap CMS (content/<collection>/<slug>.json). */
  slug?: string;
  title: string;
  articleCount: number;
  segmentCount: number;
  image: string;
  pdfUrl: string;
  order?: number;
}

// --- Project story pages ---

export interface ProjectSubColumn {
  heading?: string;
  paragraphs: string[];
}

export interface ProjectSubBlock {
  /** Bold lead-in label — its own short sentence, not inline within `text` (e.g. "Opening Program, Visiting the National Park Museum..." on the YCSW page). */
  title: string;
  text: string;
  gallery?: string[];
  /** Aspect ratio for this sub-block's gallery cells: '3/2' (default), '4/3', '7/2' (wide screenshots), or 'square'. */
  galleryAspect?: '3/2' | '4/3' | '7/2' | 'square';
}

export interface ProjectSection {
  heading?: string;
  paragraphs: string[];
  image?: string;
  /** A photo gallery grid shown under this section's text (e.g. an Elementor gallery widget on the source page). */
  gallery?: string[];
  /** Aspect ratio for this section's gallery cells: '3/2' (default), '4/3', '7/2' (wide screenshots), or 'square'. */
  galleryAspect?: '3/2' | '4/3' | '7/2' | 'square';
  /** Two side-by-side sub-blocks (e.g. "Main activities" | "Direct target audience" on the Green Ocean page). */
  columns?: ProjectSubColumn[];
  /** Render `paragraphs` as a bulleted list (dot-circle icon) instead of plain paragraphs. Explicit, not inferred from length. */
  bulletList?: boolean;
  /** Paragraph alignment; unset uses the layout's default. */
  textAlign?: 'left' | 'center' | 'justify';
  /** Render `heading` like the page's main title (large, centered, title color) instead of the regular small amber sub-heading — matches mid-page "title-style" headings like World Cleanup Day's "From Now and Forever". */
  headingAsTitle?: boolean;
  /** Explicit gray/white band background. The reference site doesn't alternate these on a fixed idx%2 rule — it's per-section design — so default (unset) falls back to alternating by section index, and this overrides it when that default doesn't match. */
  band?: 'gray' | 'white';
  /** Vertically-stacked labeled sub-blocks, each with its own bold title, paragraph, and photo gallery — e.g. YCSW Activity 4's five day-by-day write-ups. Rendered after `paragraphs`. */
  subBlocks?: ProjectSubBlock[];
  /** Extra left-aligned paragraphs rendered after subBlocks — closingParagraphs[0] comes before closingBullets, the rest come after (e.g. a closing summary that mentions a bulleted list in the middle). */
  closingParagraphs?: string[];
  /** A left-aligned bulleted list rendered right after closingParagraphs[0], introduced by closingBulletsLabel. */
  closingBullets?: string[];
  /** Short lead-in line shown directly above closingBullets (e.g. "Key takeaways included:"). */
  closingBulletsLabel?: string;
  /** Renders this section as a single left-aligned "icon + label" row instead of the normal heading/paragraph layout — e.g. each participating organization on the Community Workshop page is its own full-width alternating-band row, not a bulleted list. Ignores heading/paragraphs/image/gallery. */
  personListItem?: string;
}

/** One project story page (/world-cleanup-day/, ...), edited in Decap: content/project-pages/<slug>.json. */
export interface ProjectStaticContent {
  /** CleanupEvent.category this page belongs to. */
  category: string;
  hero: string;
  /** object-position of the hero photo, e.g. "47% 32%". */
  heroPosition?: string;
  kicker?: string;
  title: string;
  /** Main title color, matching each campaign's brand accent on letsdoitvietnam.org. Defaults to brand pink. */
  titleColor?: string;
  sections: ProjectSection[];
}
