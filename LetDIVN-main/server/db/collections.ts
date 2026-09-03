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
} from '../../src/types.js';

export const events = makeCollection<CleanupEvent>({ table: 'events', idPrefix: 'evt', order: 'created_desc' });
export const volunteers = makeCollection<VolunteerRegistration>({
  table: 'volunteers',
  idPrefix: 'vol',
  order: 'created_desc',
  extraColumn: { name: 'event_id', getValue: (item) => item.eventId },
});
export const news = makeCollection<NewsArticle>({ table: 'news', idPrefix: 'news', order: 'created_desc' });
export const partners = makeCollection<Partner>({ table: 'partners', idPrefix: 'part', order: 'sort_order' });
export const gallery = makeCollection<GalleryItem>({ table: 'gallery', idPrefix: 'gal', order: 'created_desc' });
export const team = makeCollection<TeamMember>({ table: 'team', idPrefix: 'tm', order: 'sort_order' });
export const contacts = makeCollection<ContactMessage>({ table: 'contacts', idPrefix: 'msg', order: 'created_desc' });
export const videos = makeCollection<MediaVideo>({ table: 'videos', idPrefix: 'vid', order: 'created_desc' });
export const whatWeDo = makeCollection<WhatWeDoItem>({ table: 'what_we_do', idPrefix: 'wwd', order: 'sort_order' });
