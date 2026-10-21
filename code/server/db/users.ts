import { randomUUID } from 'crypto';
import { db } from './index.js';
import type { UserProfile } from '../../src/types.js';

export function getAllUsers(): UserProfile[] {
  const rows = db.prepare('SELECT data FROM users ORDER BY created_at ASC').all() as { data: string }[];
  return rows.map((r) => JSON.parse(r.data));
}

export function getUserById(id: string): UserProfile | null {
  const row = db.prepare('SELECT data FROM users WHERE id = ?').get(id) as { data: string } | undefined;
  return row ? JSON.parse(row.data) : null;
}

export function getUserByEmail(email: string): UserProfile | null {
  const normalized = email.trim().toLowerCase();
  const row = db.prepare('SELECT data FROM users WHERE email = ?').get(normalized) as { data: string } | undefined;
  return row ? JSON.parse(row.data) : null;
}

/** Insert a brand-new user row (email must not already exist). */
export function insertUser(profile: Omit<UserProfile, 'id'> & { id?: string }): UserProfile {
  const id = profile.id || `usr-${Date.now()}-${randomUUID().slice(0, 6)}`;
  const user: UserProfile = { ...profile, id } as UserProfile;
  const email = user.email ? user.email.trim().toLowerCase() : null;
  db.prepare('INSERT INTO users (id, email, created_at, data) VALUES (?, ?, ?, ?)').run(
    id,
    email,
    Date.now(),
    JSON.stringify(user)
  );
  return user;
}

/** Merge updates into an existing user row by id. */
export function updateUser(id: string, updates: Partial<UserProfile>): UserProfile | null {
  const existing = getUserById(id);
  if (!existing) return null;
  const merged = { ...existing, ...updates, id } as UserProfile;
  const email = merged.email ? merged.email.trim().toLowerCase() : null;
  db.prepare('UPDATE users SET email = ?, data = ? WHERE id = ?').run(email, JSON.stringify(merged), id);
  return merged;
}

export function deleteUser(id: string): boolean {
  const res = db.prepare('DELETE FROM users WHERE id = ?').run(id);
  return res.changes > 0;
}
