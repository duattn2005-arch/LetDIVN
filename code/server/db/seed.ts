import { db } from './index.js';
import { events, volunteers, news, partners, gallery, team, contacts, videos, whatWeDo } from './collections.js';
import { insertUser } from './users.js';
import { hashPassword } from '../auth.js';
import {
  INITIAL_USERS,
  INITIAL_EVENTS,
  INITIAL_VOLUNTEERS,
  INITIAL_NEWS,
  INITIAL_PARTNERS,
  INITIAL_GALLERY,
  INITIAL_TEAM,
  INITIAL_CONTACTS,
  INITIAL_VIDEOS,
  INITIAL_WHAT_WE_DO,
} from '../../src/data/initialData.js';

/** Runs once per empty collection to ensure seed data is always populated. */
export function seedIfEmpty(): void {
  const tx = db.transaction(() => {
    if (events.count() === 0) INITIAL_EVENTS.forEach((item, i) => events.seedRaw(item, i));
    if (volunteers.count() === 0) INITIAL_VOLUNTEERS.forEach((item, i) => volunteers.seedRaw(item, i));
    if (news.count() === 0) INITIAL_NEWS.forEach((item, i) => news.seedRaw(item, i));
    if (partners.count() === 0) INITIAL_PARTNERS.forEach((item, i) => partners.seedRaw(item, i));
    if (gallery.count() === 0) INITIAL_GALLERY.forEach((item, i) => gallery.seedRaw(item, i));
    if (team.count() === 0) INITIAL_TEAM.forEach((item, i) => team.seedRaw(item, i));
    if (contacts.count() === 0) INITIAL_CONTACTS.forEach((item, i) => contacts.seedRaw(item, i));
    if (videos.count() === 0) INITIAL_VIDEOS.forEach((item, i) => videos.seedRaw(item, i));
    if (whatWeDo.count() === 0) INITIAL_WHAT_WE_DO.forEach((item, i) => whatWeDo.seedRaw(item, i));
    const userCount = (db.prepare('SELECT count(*) as c FROM users').get() as any)?.c || 0;
    if (userCount === 0) INITIAL_USERS.forEach((user) => insertUser(user));

    // Ensure admin@letsdoitvietnam.org always has valid credentials & admin permission
    const adminEmail = 'admin@letsdoitvietnam.org';
    const cred = db.prepare('SELECT email FROM credentials WHERE email = ?').get(adminEmail);
    if (!cred) {
      const { salt, hash } = hashPassword('admin123');
      db.prepare('INSERT OR REPLACE INTO credentials (email, salt, hash) VALUES (?, ?, ?)').run(adminEmail, salt, hash);
    }
    db.prepare('INSERT OR IGNORE INTO granted_admins (email) VALUES (?)').run(adminEmail);
  });
  tx();
}
