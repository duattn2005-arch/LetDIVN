import fs from 'fs';
import crypto from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';

// Google service-account credentials for server-side Sheets API access.
// Loaded ONLY from local credentials.json (gitignored) or env vars — never hardcoded.
// Get a service account key from https://console.cloud.google.com/iam-admin/serviceaccounts
let SERVICE_ACCOUNT: { client_email: string; private_key: string } | null = null;

try {
  if (fs.existsSync('./credentials.json')) {
    const creds = JSON.parse(fs.readFileSync('./credentials.json', 'utf8'));
    if (creds.client_email && creds.private_key) {
      SERVICE_ACCOUNT = creds;
    }
  } else if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
    SERVICE_ACCOUNT = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }
} catch {
  // leave SERVICE_ACCOUNT null; endpoints below will report a clear error
}

let cachedToken: { token: string; expiresAt: number } | null = null;
const sheetMetaCache: Record<string, { title: string; sheetId: number }> = {};

// Failures here previously vanished silently (client callers treat sheets
// sync as best-effort and swallow errors) — log server-side so a bad
// registration write is actually diagnosable instead of just "missing".
function logSheetsError(endpoint: string, detail: unknown): void {
  console.error(`[google-sheets] ${endpoint} failed:`, detail);
}

async function getGoogleOAuthToken(): Promise<string> {
  if (!SERVICE_ACCOUNT) {
    throw new Error('Missing Google service account credentials. Add a credentials.json file (see .env.example) or set GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.');
  }

  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt > now + 60) {
    return cachedToken.token;
  }

  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: SERVICE_ACCOUNT.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };
  const base64UrlHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64UrlClaim = Buffer.from(JSON.stringify(claimSet)).toString('base64url');
  const signatureInput = `${base64UrlHeader}.${base64UrlClaim}`;

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signatureInput);
  const signature = sign.sign(SERVICE_ACCOUNT.private_key, 'base64url');
  const jwt = `${signatureInput}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const data = await res.json();
  if (data.access_token) {
    cachedToken = { token: data.access_token, expiresAt: now + (data.expires_in || 3600) };
    return data.access_token;
  }
  throw new Error(data.error_description || 'Failed to get Google access token');
}

async function getFirstSheetMeta(spreadsheetId: string, token: string): Promise<{ title: string; sheetId: number }> {
  if (sheetMetaCache[spreadsheetId]) {
    return sheetMetaCache[spreadsheetId];
  }
  try {
    const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title,sheets.properties.sheetId`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const metaData = await metaRes.json();
    const props = metaData.sheets?.[0]?.properties;
    const meta = { title: props?.title || 'Trang tính1', sheetId: props?.sheetId ?? 0 };
    sheetMetaCache[spreadsheetId] = meta;
    return meta;
  } catch {
    return { title: 'Trang tính1', sheetId: 0 };
  }
}

/**
 * Connect/Express-compatible middleware implementing the /api/sheets/* routes.
 * Shared by the Vite dev server (vite.config.ts) and the standalone production
 * server (server.ts) so the two never drift apart.
 */
export function googleSheetsMiddleware(req: IncomingMessage, res: ServerResponse, next: () => void) {
  // Read data endpoint for live sheet rendering
  if (req.url?.startsWith('/api/sheets/read') && req.method === 'GET') {
    (async () => {
      try {
        const urlObj = new URL(req.url!, 'http://localhost');
        const spreadsheetId = urlObj.searchParams.get('spreadsheetId') || '1NhKYRQwjF3L2rVt9KgVLIjYZVFFUwvuts8uD-8EDVYw';
        const token = await getGoogleOAuthToken();
        const { title: sheetTitle } = await getFirstSheetMeta(spreadsheetId, token);
        const sheetsRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetTitle)}!A1:Z500`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        const data = await sheetsRes.json();
        if (!sheetsRes.ok) logSheetsError('read', data);
        res.writeHead(sheetsRes.ok ? 200 : 400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      } catch (err: any) {
        logSheetsError('read', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err?.message || 'Server error' }));
      }
    })();
    return;
  }

  if (req.url?.startsWith('/api/sheets/append') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const spreadsheetId = parsed.spreadsheetId || '1NhKYRQwjF3L2rVt9KgVLIjYZVFFUwvuts8uD-8EDVYw';

        // 10 cột A -> J: ID, THỜI GIAN, HỌ VÀ TÊN, SĐT, EMAIL, ĐỊA CHỈ, TUỔI, DỰ ÁN, KỸ NĂNG, TRẠNG THÁI
        const rowValues = parsed.rowValues || (parsed.name || parsed.fullName ? [
          parsed.id || `VOL-${Date.now().toString().slice(-6)}`,
          parsed.time || new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
          parsed.name || parsed.fullName || '',
          parsed.phone || '',
          parsed.email || '',
          parsed.city || parsed.address || '',
          parsed.age || parsed.ageGroup || '22 tuổi',
          parsed.project || parsed.eventName || 'World Cleanup Day 2026',
          parsed.skills || '',
          parsed.status || 'Approved'
        ] : null);

        if (!rowValues) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing rowValues or volunteer data' }));
          return;
        }

        const token = await getGoogleOAuthToken();
        const { title: sheetTitle } = await getFirstSheetMeta(spreadsheetId, token);

        const sheetsRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetTitle)}!A1:append?valueInputOption=USER_ENTERED`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              values: [rowValues],
            }),
          }
        );

        const sheetsData = await sheetsRes.json();
        if (!sheetsRes.ok) logSheetsError('append', sheetsData);
        res.writeHead(sheetsRes.ok ? 200 : 400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(sheetsData));
      } catch (err: any) {
        logSheetsError('append', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err?.message || 'Server error' }));
      }
    });
    return;
  }

  if (req.url?.startsWith('/api/sheets/sync-all') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const spreadsheetId = parsed.spreadsheetId || '1NhKYRQwjF3L2rVt9KgVLIjYZVFFUwvuts8uD-8EDVYw';
        const rows = parsed.rows;

        if (!rows || !Array.isArray(rows)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing rows' }));
          return;
        }

        const token = await getGoogleOAuthToken();
        const { title: sheetTitle } = await getFirstSheetMeta(spreadsheetId, token);

        const sheetsRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetTitle)}!A1:append?valueInputOption=USER_ENTERED`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              values: rows,
            }),
          }
        );

        const sheetsData = await sheetsRes.json();
        if (!sheetsRes.ok) logSheetsError('sync-all', sheetsData);
        res.writeHead(sheetsRes.ok ? 200 : 400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(sheetsData));
      } catch (err: any) {
        logSheetsError('sync-all', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err?.message || 'Server error' }));
      }
    });
    return;
  }

  if (req.url?.startsWith('/api/sheets/clear') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const spreadsheetId = parsed.spreadsheetId || '1NhKYRQwjF3L2rVt9KgVLIjYZVFFUwvuts8uD-8EDVYw';

        const token = await getGoogleOAuthToken();
        const { title: sheetTitle } = await getFirstSheetMeta(spreadsheetId, token);

        // Clear every data row but keep the header row (row 1) intact.
        const clearRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetTitle)}!A2:Z10000:clear`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const clearData = await clearRes.json();
        if (!clearRes.ok) logSheetsError('clear', clearData);
        res.writeHead(clearRes.ok ? 200 : 400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(clearData));
      } catch (err: any) {
        logSheetsError('clear', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err?.message || 'Server error' }));
      }
    });
    return;
  }

  if (req.url?.startsWith('/api/sheets/delete-row') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const spreadsheetId = parsed.spreadsheetId || '1NhKYRQwjF3L2rVt9KgVLIjYZVFFUwvuts8uD-8EDVYw';
        const rowNumber = Number(parsed.rowNumber);

        if (!rowNumber || rowNumber < 2) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing or invalid rowNumber (must be >= 2, row 1 is the header)' }));
          return;
        }

        const token = await getGoogleOAuthToken();
        const { sheetId } = await getFirstSheetMeta(spreadsheetId, token);

        // Delete a single row in-place (shifts every row below it up by one).
        const deleteRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              requests: [{
                deleteDimension: {
                  range: {
                    sheetId,
                    dimension: 'ROWS',
                    startIndex: rowNumber - 1,
                    endIndex: rowNumber
                  }
                }
              }]
            }),
          }
        );

        const deleteData = await deleteRes.json();
        if (!deleteRes.ok) logSheetsError('delete-row', deleteData);
        res.writeHead(deleteRes.ok ? 200 : 400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(deleteData));
      } catch (err: any) {
        logSheetsError('delete-row', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err?.message || 'Server error' }));
      }
    });
    return;
  }

  next();
}


