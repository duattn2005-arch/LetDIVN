import { Router } from 'express';
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  setSessionCookie,
  clearSessionCookie,
  currentUserFromRequest,
  isAllowedAdminEmail,
  generateResetCode,
  saveResetCode,
  verifyResetCode,
  clearResetCode,
  verifyGoogleIdToken,
  SESSION_COOKIE,
} from '../auth.js';
import { db } from '../db/index.js';
import { getAllUsers, getUserByEmail, insertUser, updateUser } from '../db/users.js';
import type { UserProfile } from '../../src/types.js';

const router = Router();

function credentialFor(email: string): { salt: string; hash: string } | null {
  const row = db.prepare('SELECT salt, hash FROM credentials WHERE email = ?').get(email.trim().toLowerCase()) as
    | { salt: string; hash: string }
    | undefined;
  return row || null;
}

function saveCredential(email: string, salt: string, hash: string): void {
  db.prepare(
    'INSERT INTO credentials (email, salt, hash) VALUES (?, ?, ?) ON CONFLICT(email) DO UPDATE SET salt = excluded.salt, hash = excluded.hash'
  ).run(email.trim().toLowerCase(), salt, hash);
}

function roleFor(email: string | undefined, fallback: UserProfile['role']): UserProfile['role'] {
  if (email && isAllowedAdminEmail(email)) return 'admin';
  return fallback === 'admin' ? 'volunteer' : fallback;
}

// Tells the client whether this account is allowed to hold admin at all —
// separate from its current `role`, so the "preview as volunteer" toggle in
// the profile modal can still find its way back to the admin view after a
// purely client-side role flip (see AuthContext.tsx `switchRole`).
function withEligibility(user: UserProfile | null) {
  if (!user) return null;
  return { ...user, isEligibleForAdmin: !!user.email && isAllowedAdminEmail(user.email) };
}

router.post('/register', (req, res) => {
  const { name, email, password, phone } = req.body || {};
  if (!name || !password || (!email && !phone)) {
    return res.status(400).json({ error: 'Thiếu thông tin đăng ký' });
  }
  if (email && getUserByEmail(email)) {
    return res.status(409).json({ error: 'Email này đã được đăng ký' });
  }
  const role = roleFor(email, 'volunteer');
  const user = insertUser({
    name,
    email: email || undefined,
    phone: phone || undefined,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    role,
    provider: 'email',
    joinedAt: new Date().toISOString(),
  });
  if (email) {
    const { salt, hash } = hashPassword(password);
    saveCredential(email, salt, hash);
  }
  const token = createSession(user.id);
  setSessionCookie(res, token);
  res.json({ user: withEligibility(user) });
});

router.post('/login', (req, res) => {
  const { identifier, password } = req.body || {};
  if (!identifier || !password) return res.status(400).json({ error: 'Thiếu thông tin đăng nhập' });

  let user = getUserByEmail(identifier);
  if (!user) {
    user = getAllUsers().find((u) => u.name.toLowerCase() === String(identifier).toLowerCase()) || null;
  }
  if (!user || !user.email) return res.status(401).json({ error: 'Sai email/tên đăng nhập hoặc mật khẩu' });

  const cred = credentialFor(user.email);
  if (!cred || !verifyPassword(password, cred.salt, cred.hash)) {
    return res.status(401).json({ error: 'Sai email/tên đăng nhập hoặc mật khẩu' });
  }

  const newRole = roleFor(user.email, user.role);
  if (newRole !== user.role) user = updateUser(user.id, { role: newRole }) || user;

  const token = createSession(user.id);
  setSessionCookie(res, token);
  res.json({ user: withEligibility(user) });
});

router.post('/logout', (req, res) => {
  const token = (req as any).cookies?.[SESSION_COOKIE];
  if (token) destroySession(token);
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  res.json({ user: withEligibility(currentUserFromRequest(req)) });
});

async function fetchGoogleProfile(accessToken: string): Promise<{ email: string; name: string; picture?: string } | null> {
  try {
    const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!r.ok) return null;
    const data: any = await r.json();
    if (!data.email) return null;
    return { email: data.email, name: data.name || data.email, picture: data.picture };
  } catch {
    return null;
  }
}

function upsertGoogleUser(profile: { email: string; name: string; picture?: string }): UserProfile {
  let user = getUserByEmail(profile.email);
  const role = roleFor(profile.email, user?.role || 'volunteer');
  if (user) {
    user = updateUser(user.id, { name: profile.name, avatar: profile.picture || user.avatar, role }) || user;
  } else {
    user = insertUser({
      name: profile.name,
      email: profile.email,
      avatar: profile.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name)}`,
      role,
      provider: 'google',
      joinedAt: new Date().toISOString(),
    });
  }
  return user;
}

router.post('/google', async (req, res) => {
  const { accessToken } = req.body || {};
  if (!accessToken) return res.status(400).json({ error: 'Thiếu accessToken' });
  const profile = await fetchGoogleProfile(accessToken);
  if (!profile) return res.status(401).json({ error: 'Không xác thực được tài khoản Google' });

  const user = upsertGoogleUser(profile);
  const token = createSession(user.id);
  setSessionCookie(res, token);
  res.json({ user: withEligibility(user) });
});

// Redirect-mode Google sign-in — used when the popup flow can't work (in-app
// browsers like Messenger/Zalo sever the popup's connection back to the
// opener). The client does a full top-level navigation to Google itself
// (see AuthContext.tsx) and Google redirects back with the ID token in the
// URL fragment, which never reaches the server — so the client reads it and
// posts it here as plain JSON, same shape as the accessToken /google route.
//
// GOOGLE_CLIENT_ID is read lazily (per-request), not as a module-level
// const: apiRouter.ts calls process.loadEnvFile() itself, but ES module
// imports are hoisted and fully evaluated before the importing module's own
// top-level code runs — so a top-level `const` here would have captured
// process.env before .env was ever loaded, always reading empty.
// envAdminEmails() next door already dodges this the same way.
function googleClientId(): string {
  return process.env.VITE_GOOGLE_CLIENT_ID || '';
}

router.post('/google-idtoken', async (req, res) => {
  const { idToken, nonce } = req.body || {};
  const clientId = googleClientId();
  if (!idToken || !clientId) {
    return res.status(400).json({ error: 'Thiếu idToken hoặc chưa cấu hình Client ID' });
  }
  const profile = await verifyGoogleIdToken(idToken, clientId, nonce);
  if (!profile) return res.status(401).json({ error: 'Không xác thực được tài khoản Google' });

  const user = upsertGoogleUser(profile);
  const token = createSession(user.id);
  setSessionCookie(res, token);
  res.json({ user: withEligibility(user) });
});

async function fetchFacebookProfile(accessToken: string): Promise<{ email?: string; name: string; picture?: string } | null> {
  try {
    const r = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${encodeURIComponent(accessToken)}`
    );
    if (!r.ok) return null;
    const data: any = await r.json();
    if (!data.name) return null;
    return { email: data.email, name: data.name, picture: data.picture?.data?.url };
  } catch {
    return null;
  }
}

router.post('/facebook', async (req, res) => {
  const { accessToken } = req.body || {};
  if (!accessToken) return res.status(400).json({ error: 'Thiếu accessToken' });
  const profile = await fetchFacebookProfile(accessToken);
  if (!profile) return res.status(401).json({ error: 'Không xác thực được tài khoản Facebook' });

  const email = profile.email || `fb_${Date.now()}@no-email.letsdoitvietnam`;
  let user = getUserByEmail(email);
  const role = roleFor(profile.email, user?.role || 'volunteer');
  if (user) {
    user = updateUser(user.id, { name: profile.name, avatar: profile.picture || user.avatar, role }) || user;
  } else {
    user = insertUser({
      name: profile.name,
      email,
      avatar: profile.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name)}`,
      role,
      provider: 'facebook',
      joinedAt: new Date().toISOString(),
    });
  }
  const token = createSession(user.id);
  setSessionCookie(res, token);
  res.json({ user: withEligibility(user) });
});

router.post('/request-reset', (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Thiếu email' });
  const user = getUserByEmail(email);
  if (!user) return res.status(404).json({ error: 'Không tìm thấy tài khoản với email này' });
  const code = generateResetCode();
  saveResetCode(email, code);
  // Code travels back to the client so it can send the reset email itself via
  // EmailJS (kept client-side on purpose — see migration plan). HTTPS covers
  // this in transit; the code is single-use and expires in 15 minutes either way.
  res.json({ ok: true, code, name: user.name });
});

router.post('/reset-password', (req, res) => {
  const { email, code, newPassword } = req.body || {};
  if (!email || !code || !newPassword) return res.status(400).json({ error: 'Thiếu thông tin' });
  if (!verifyResetCode(email, code)) return res.status(400).json({ error: 'Mã xác nhận không đúng hoặc đã hết hạn' });
  const { salt, hash } = hashPassword(newPassword);
  saveCredential(email, salt, hash);
  clearResetCode(email);
  res.json({ ok: true });
});

export default router;
