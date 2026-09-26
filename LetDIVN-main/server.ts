import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { googleSheetsMiddleware } from './server/googleSheetsMiddleware';
import { apiRouter } from './server/apiRouter';
import { uploadsDir } from './server/routes/upload';
import { cmsMediaRouter, getNews } from './server/cmsContent';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Requests arrive through two proxies: the DDoS-protection service in front of
// the VPS, then nginx. Trusting exactly those two hops makes req.ip the
// visitor's real address (from X-Forwarded-For) — e.g. the admin login's
// "5 wrong passwords" lockout then applies per visitor, not to everyone.
app.set('trust proxy', 2);

// Google Sheets API routes (same handlers used by `npm run dev`).
app.use((req, res, next) => googleSheetsMiddleware(req, res, next));

// Real backend API (auth, events, news, partners, ...) — same router used by
// the Vite dev server plugin, so dev and prod never drift.
app.use('/api', apiRouter);

// Admin-uploaded images (real files on disk, not base64-in-DB).
app.use('/uploads', express.static(uploadsDir));

// Serve the built static site (run `npm run build` first).
const distDir = path.join(__dirname, 'dist');
app.use(express.static(distDir));

// Images committed by Decap CMS after the last deploy (fetched from GitHub).
app.use(cmsMediaRouter);

// SPA fallback: any other GET request serves index.html.
// (Plain app.use instead of a '*' path pattern — Express 5's path-to-regexp
// requires a named wildcard like '/*splat' for bare '*' routes.)
app.use(async (req, res) => {
  if (req.method !== 'GET') {
    res.sendStatus(404);
    return;
  }
  const indexFile = path.join(distDir, 'index.html');
  // /news/<slug>/: put the article's own title, description and image in the
  // page head, for Google and for link previews on Facebook/Zalo (they don't
  // run the app's JavaScript).
  const newsSlug = /^\/news\/([a-z0-9][a-z0-9._-]*)\/?$/i.exec(req.path)?.[1];
  if (newsSlug) {
    try {
      const article = (await getNews()).find((a) => a.slug === newsSlug && a.status !== 'Pending');
      if (article) {
        res.type('html').send(withArticleMeta(fs.readFileSync(indexFile, 'utf8'), article, `${req.get("x-forwarded-proto")?.split(",")[0] || req.protocol}://${req.get("host")}`));
        return;
      }
    } catch (err) {
      console.error('[news meta]', err);
    }
  }
  res.sendFile(indexFile);
});

const escapeAttr = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function withArticleMeta(html: string, a: { slug: string; title: string; summary: string; image: string; seoTitle?: string; seoDescription?: string }, origin: string) {
  const title = `${a.seoTitle || a.title} – Let's do it! Vietnam`;
  const description = (a.seoDescription || a.summary || '').replace(/\s+/g, ' ').trim().slice(0, 300);
  const url = `${origin}/news/${a.slug}/`;
  const image = a.image ? new URL(a.image, origin).href : '';
  const extra = [
    `<meta property="og:url" content="${escapeAttr(url)}" />`,
    image && `<meta property="og:image" content="${escapeAttr(image)}" />`,
    `<link rel="canonical" href="${escapeAttr(url)}" />`,
  ]
    .filter(Boolean)
    .join('\n    ');
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${escapeAttr(description)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escapeAttr(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escapeAttr(description)}$2`)
    .replace(/<meta property="og:type" content="website" \/>/, '<meta property="og:type" content="article" />')
    .replace('</head>', `    ${extra}\n  </head>`);
}

const port = Number(process.env.PORT) || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server đang chạy tại http://0.0.0.0:${port}`);
});


