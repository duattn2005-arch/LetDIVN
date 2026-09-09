import { makeCollection } from './collection.js';
import type {
  CleanupEvent,
  VolunteerRegistration,
  NewsArticle,
  Partner,
  GalleryItem,
  TeamMember,
  ContactMessage,
  MediaVideo,
  WhatWeDoItem,
  WhoWeAreItem,
  MediaCoverageEntry,
} from '../../src/types.js';

export const events = makeCollection<CleanupEvent>({ table: 'events', idPrefix: 'evt', order: 'created_desc' });
export const volunteers = makeCollection<VolunteerRegistration>({
  table: 'volunteers',
  idPrefix: 'vol',
  order: 'created_desc',
  // `event_id` is a real column (indexed, NOT NULL) alongside the JSON blob —
  // must stay populated on every insert/update or the table's own NOT NULL
  // constraint rejects the row outright.
  extraColumns: (item) => ({ event_id: item.eventId }),
});
export const news = makeCollection<NewsArticle>({ table: 'news', idPrefix: 'news', order: 'created_desc' });
export const partners = makeCollection<Partner>({ table: 'partners', idPrefix: 'part', order: 'sort_order' });
export const gallery = makeCollection<GalleryItem>({ table: 'gallery', idPrefix: 'gal', order: 'created_desc' });
export const team = makeCollection<TeamMember>({ table: 'team', idPrefix: 'tm', order: 'sort_order' });
export const contacts = makeCollection<ContactMessage>({ table: 'contacts', idPrefix: 'msg', order: 'created_desc' });
export const videos = makeCollection<MediaVideo>({ table: 'videos', idPrefix: 'vid', order: 'created_desc' });
export const whatWeDo = makeCollection<WhatWeDoItem>({ table: 'what_we_do', idPrefix: 'wwd', order: 'sort_order' });
export const whoWeAreSections = makeCollection<WhoWeAreItem>({ table: 'who_we_are_sections', idPrefix: 'wwa', order: 'sort_order' });
export const mediaCoverage = makeCollection<MediaCoverageEntry>({ table: 'media_coverage', idPrefix: 'mc', order: 'sort_order' });
