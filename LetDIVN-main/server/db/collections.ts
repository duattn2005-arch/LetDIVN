import { makeCollection } from './collection.js';
import type {
  CleanupEvent,
  VolunteerRegistration,
  ContactMessage,
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
export const contacts = makeCollection<ContactMessage>({ table: 'contacts', idPrefix: 'msg', order: 'created_desc' });
