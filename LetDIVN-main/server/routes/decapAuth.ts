import { randomBytes } from 'crypto';
import { Router, type Response } from 'express';

// GitHub OAuth for Decap CMS (/admin). Decap opens /api/decap/auth in a popup;
// we send the user to GitHub, GitHub returns to /api/decap/callback, and the
// callback page hands the access token back to the Decap window through the
// postMessage handshake Decap expects. GitHub itself decides who may publish:
// only accounts with write access to the repo can commit.
//
// Needs DECAP_GITHUB_CLIENT_ID / DECAP_GITHUB_CLIENT_SECRET from a GitHub
// OAuth App whose callback URL is https://<your domain>/api/decap/callback.

const STATE_COOKIE = 'decap_oauth_state';

const router = Router();

router.get('/decap/auth', (req, res) => {
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
