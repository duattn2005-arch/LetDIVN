import { randomBytes, scryptSync, timingSafeEqual, createPublicKey, createVerify } from 'crypto';
import type { Request, Response } from 'express';
import { db } from './db/index.js';

export const SESSION_COOKIE = 'ldiv_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// --- Password hashing (server-side only from here on — never trust a
// client-computed hash). scrypt is Node's built-in slow KDF, no extra dep. ---
export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const hash = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHash, 'hex');
  return hash.length === expected.length && timingSafeEqual(hash, expected);
}

// --- Sessions: opaque random token in a DB table, sent as an httpOnly cookie.
// No JWT — a row we can revoke beats a signed blob we can't. ---
export function createSession(userId: string): string {
  const token = randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(
    token,
    userId,
    Date.now() + SESSION_TTL_MS
  );
  return token;
}

export function destroySession(token: string): void {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function getSessionUser(token: string | undefined): any | null {
  if (!token) return null;
  const row = db
    .prepare(
      `SELECT users.data AS data FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.token = ? AND sessions.expires_at > ?`
    )
    .get(token, Date.now()) as { data: string } | undefined;
  return row ? JSON.parse(row.data) : null;
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_TTL_MS,
    path: '/',
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, { path: '/' });
}

// --- Admin allowlist: a server-only env var (never VITE_-prefixed, so it
// never ships in the client bundle) plus emails an existing admin granted
// via the dashboard. Role is decided here, server-side, and nowhere else. ---
function envAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isRootAdminEmail(email: string): boolean {
  return envAdminEmails().includes(email.trim().toLowerCase());
}

export function isAllowedAdminEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (isRootAdminEmail(normalized)) return true;
  const row = db.prepare('SELECT 1 FROM granted_admins WHERE email = ?').get(normalized);
  return !!row;
}

export function getGrantedAdminEmails(): string[] {
  return (db.prepare('SELECT email FROM granted_admins').all() as { email: string }[]).map((r) => r.email);
}

export function grantAdmin(email: string): void {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return;
  db.prepare('INSERT OR IGNORE INTO granted_admins (email) VALUES (?)').run(normalized);
}

export function revokeAdmin(email: string): void {
  db.prepare('DELETE FROM granted_admins WHERE email = ?').run(email.trim().toLowerCase());
}

// --- Password-reset codes (15 min TTL), same scheme as credentials ---
const RESET_CODE_TTL_MS = 15 * 60 * 1000;

export function generateResetCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function saveResetCode(email: string, code: string): void {
  const { salt, hash } = hashPassword(code);
  db.prepare(
    'INSERT INTO reset_codes (email, code_hash, expires_at) VALUES (?, ?, ?) ON CONFLICT(email) DO UPDATE SET code_hash = excluded.code_hash, expires_at = excluded.expires_at'
  ).run(email.trim().toLowerCase(), `${salt}:${hash}`, Date.now() + RESET_CODE_TTL_MS);
}

export function verifyResetCode(email: string, code: string): boolean {
  const row = db.prepare('SELECT code_hash, expires_at FROM reset_codes WHERE email = ?').get(email.trim().toLowerCase()) as
    | { code_hash: string; expires_at: number }
    | undefined;
  if (!row || Date.now() > row.expires_at) return false;
  const [salt, hash] = row.code_hash.split(':');
  return verifyPassword(code, salt, hash);
}

export function clearResetCode(email: string): void {
  db.prepare('DELETE FROM reset_codes WHERE email = ?').run(email.trim().toLowerCase());
}

// --- Express middleware helpers ---
export function currentUserFromRequest(req: Request): any | null {
  const token = (req as any).cookies?.[SESSION_COOKIE];
  return getSessionUser(token);
}

export function requireAdmin(req: Request, res: Response, next: () => void): void {
  const user = currentUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Yêu cầu quyền Admin' });
    return;
  }
  (req as any).user = user;
  next();
}

export function requireAuth(req: Request, res: Response, next: () => void): void {
  const user = currentUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Chưa đăng nhập' });
    return;
  }
  (req as any).user = user;
  next();
}

// --- Google ID token verification (for the redirect-based "Sign In With
// Google" flow used by in-app browsers — see AuthContext.tsx). No popup, so
// no window.opener needed, which is what actually breaks inside Messenger/
// Zalo's embedded browser. Verifies the JWT signature against Google's
// published public keys — no client secret required, since this is an ID
// token (identity only), not an authorization code. ---
let cachedGoogleCerts: { keys: any[]; fetchedAt: number } | null = null;

async function getGoogleCerts(): Promise<any[]> {
  const now = Date.now();
  if (cachedGoogleCerts && now - cachedGoogleCerts.fetchedAt < 60 * 60 * 1000) {
    return cachedGoogleCerts.keys;
  }
  const res = await fetch('https://www.googleapis.com/oauth2/v3/certs');
  const data: any = await res.json();
  cachedGoogleCerts = { keys: data.keys || [], fetchedAt: now };
  return cachedGoogleCerts.keys;
}

function base64UrlToBuffer(input: string): Buffer {
  return Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

export async function verifyGoogleIdToken(
  idToken: string,
  expectedAudience: string,
  expectedNonce?: string | null
): Promise<{ email: string; name: string; picture?: string } | null> {
  const reject = (reason: string, detail?: unknown) => {
    console.error(`[google-id-token] rejected: ${reason}`, detail ?? '');
    return null;
  };
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) return reject('malformed token (not 3 parts)');
    const [headerB64, payloadB64, signatureB64] = parts;

    const header = JSON.parse(base64UrlToBuffer(headerB64).toString('utf8'));
    const payload = JSON.parse(base64UrlToBuffer(payloadB64).toString('utf8'));

    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== 'number' || payload.exp < now) {
      return reject('expired or missing exp', { exp: payload.exp, now });
    }
    if (payload.aud !== expectedAudience) {
      return reject('aud mismatch', { got: payload.aud, expected: expectedAudience });
    }
    if (payload.iss !== 'https://accounts.google.com' && payload.iss !== 'accounts.google.com') {
      return reject('iss mismatch', { got: payload.iss });
    }
    if (!payload.email) return reject('no email claim in payload');
    // Prevents a captured/leaked token being replayed later to log in as the
    // victim — the client generates a fresh nonce per redirect attempt and
    // we require it to come back unchanged inside the signed token.
    if (expectedNonce && payload.nonce !== expectedNonce) {
      return reject('nonce mismatch (possible replay)', { got: payload.nonce });
    }

    const certs = await getGoogleCerts();
    const cert = certs.find((k) => k.kid === header.kid);
    if (!cert) {
      return reject('no matching cert for kid', { kid: header.kid, availableKids: certs.map((k) => k.kid) });
    }

    const publicKey = createPublicKey({ key: cert, format: 'jwk' });
    const verifier = createVerify('RSA-SHA256');
    verifier.update(`${headerB64}.${payloadB64}`);
    const isValid = verifier.verify(publicKey, base64UrlToBuffer(signatureB64));
    if (!isValid) return reject('signature verification failed');

    return { email: payload.email, name: payload.name || payload.email, picture: payload.picture };
  } catch (err) {
    return reject('threw during verification', err instanceof Error ? err.message : err);
  }
}
