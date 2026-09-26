import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import express, { Router, type Response } from 'express';

// GitHub OAuth for Decap CMS (/admin). Decap opens /api/decap/auth in a popup;
// we send the user to GitHub, GitHub returns to /api/decap/callback, and the
// callback page hands the access token back to the Decap window through the
// postMessage handshake Decap expects. GitHub itself decides who may publish:
// only accounts with write access to the repo can commit.
//
// Needs DECAP_GITHUB_CLIENT_ID / DECAP_GITHUB_CLIENT_SECRET from a GitHub
// OAuth App whose callback URL is https://<your domain>/api/decap/callback.
//
// The popup first offers a shared admin login instead: with the right
// DECAP_ADMIN_USERNAME / DECAP_ADMIN_PASSWORD it hands Decap the server's own
// DECAP_ADMIN_GITHUB_TOKEN, so editors need no GitHub account of their own.

const STATE_COOKIE = 'decap_oauth_state';

const router = Router();

const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const failedLogins = new Map<string, { count: number; until: number }>();

router.get('/decap/auth', (req, res) => {
  if (!process.env.DECAP_ADMIN_PASSWORD || !process.env.DECAP_ADMIN_GITHUB_TOKEN) {
    res.redirect(`/api/decap/github?scope=${req.query.scope === 'public_repo' ? 'public_repo' : 'repo'}`);
    return;
  }
  sendLoginForm(res);
});

/**
 * Checks the shared admin username/password (also used by the editor at
 * /admin/, see wpAdmin.ts), locking an IP out for 15 minutes after 5 misses.
 * Returns an error message, or null when the login is right.
 */
export function checkAdminLogin(ip: string, username: string, password: string): string | null {
  const now = Date.now();
  const record = failedLogins.get(ip);
  if (record && record.count >= MAX_FAILED_LOGINS && record.until > now) {
    return 'Sai quá nhiều lần. Vui lòng thử lại sau 15 phút.';
  }

  const expectedUsername = process.env.DECAP_ADMIN_USERNAME || 'admin';
  const expectedPassword = process.env.DECAP_ADMIN_PASSWORD;
  if (!expectedPassword || !process.env.DECAP_ADMIN_GITHUB_TOKEN) {
    return 'Chưa cấu hình tài khoản admin trên server.';
  }

  if (!safeEqual(username, expectedUsername) || !safeEqual(password, expectedPassword)) {
    const count = record && record.until > now ? record.count + 1 : 1;
    failedLogins.set(ip, { count, until: now + LOCKOUT_MS });
    return 'Sai tên đăng nhập hoặc mật khẩu.';
  }

  failedLogins.delete(ip);
  return null;
}

router.post('/decap/login', express.urlencoded({ extended: false }), (req, res) => {
  const error = checkAdminLogin(req.ip || 'unknown', String(req.body?.username ?? ''), String(req.body?.password ?? ''));
  if (error) {
    sendLoginForm(res, error);
    return;
  }
  sendResult(res, 'success', { token: process.env.DECAP_ADMIN_GITHUB_TOKEN!, provider: 'github' });
});

router.get('/decap/github', (req, res) => {
  const clientId = process.env.DECAP_GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(500).send('Chưa cấu hình DECAP_GITHUB_CLIENT_ID trên server.');
    return;
  }
  const state = randomBytes(16).toString('hex');
  res.cookie(STATE_COOKIE, state, { httpOnly: true, sameSite: 'lax', maxAge: 10 * 60 * 1000, path: '/api/decap' });
  // redirect_uri is left out on purpose: GitHub then uses the callback URL
  // registered on the OAuth App, which is correct behind any proxy.
  const params = new URLSearchParams({
    client_id: clientId,
    scope: req.query.scope === 'public_repo' ? 'public_repo' : 'repo',
    state,
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

router.get('/decap/callback', async (req, res) => {
  const { code, state } = req.query;
  const expectedState = req.cookies?.[STATE_COOKIE];
  res.clearCookie(STATE_COOKIE, { path: '/api/decap' });

  if (typeof code !== 'string' || typeof state !== 'string' || !expectedState || state !== expectedState) {
    sendResult(res, 'error', { message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.' });
    return;
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.DECAP_GITHUB_CLIENT_ID,
        client_secret: process.env.DECAP_GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const data = (await tokenRes.json()) as { access_token?: string; error_description?: string };
    if (!data.access_token) {
      sendResult(res, 'error', { message: data.error_description || 'GitHub không cấp quyền truy cập.' });
      return;
    }
    sendResult(res, 'success', { token: data.access_token, provider: 'github' });
  } catch {
    sendResult(res, 'error', { message: 'Không kết nối được tới GitHub.' });
  }
});

/** Compares via fixed-length digests so neither length nor content leaks through timing. */
export function safeEqual(a: string, b: string): boolean {
  const digest = (v: string) => createHash('sha256').update(v).digest();
  return timingSafeEqual(digest(a), digest(b));
}

function escapeHtml(v: string): string {
  return v.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** The popup's admin login form; GitHub login stays available as a link. */
function sendLoginForm(res: Response, error?: string) {
  res.type('html').send(`<!doctype html><html lang="vi"><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Đăng nhập quản trị</title>
<style>
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #eff0f4; font-family: system-ui, sans-serif; color: #1e293b; }
  form { width: 100%; max-width: 320px; margin: 16px; padding: 28px 24px; background: #fff; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,.08); }
  h1 { margin: 0 0 20px; font-size: 20px; text-align: center; }
  label { display: block; margin: 12px 0 4px; font-size: 14px; font-weight: 600; }
  input { box-sizing: border-box; width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 15px; }
  button { width: 100%; margin-top: 20px; padding: 11px; border: 0; border-radius: 8px; background: #E81A7F; color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; }
  .error { margin: 0 0 8px; padding: 8px 10px; border-radius: 8px; background: #fee2e2; color: #b91c1c; font-size: 14px; }
  .alt { display: block; margin-top: 16px; text-align: center; font-size: 13px; color: #64748b; }
</style>
<form method="post" action="/api/decap/login">
  <h1>Đăng nhập quản trị</h1>
  ${error ? `<p class="error">${escapeHtml(error)}</p>` : ''}
  <label for="username">Tên đăng nhập</label>
  <input id="username" name="username" autocomplete="username" required autofocus>
  <label for="password">Mật khẩu</label>
  <input id="password" name="password" type="password" autocomplete="current-password" required>
  <button type="submit">Đăng nhập</button>
  <a class="alt" href="/api/decap/github">Hoặc đăng nhập bằng GitHub</a>
</form></html>`);
}

/** The popup page: announce itself to the Decap window, then reply with the result once Decap answers. */
function sendResult(res: Response, status: 'success' | 'error', payload: Record<string, string>) {
  const message = JSON.stringify(`authorization:github:${status}:${JSON.stringify(payload)}`).replace(/</g, '\\u003c');
  res.type('html').send(`<!doctype html><meta charset="utf-8"><body><script>
(function () {
  var message = ${message};
  function receive(e) {
    if (e.origin !== window.location.origin) return;
    window.removeEventListener('message', receive);
    window.opener.postMessage(message, e.origin);
  }
  window.addEventListener('message', receive);
  window.opener.postMessage('authorizing:github', window.location.origin);
})();
</script></body>`);
}

export default router;
