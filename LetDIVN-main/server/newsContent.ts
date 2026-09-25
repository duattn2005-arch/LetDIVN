import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Router } from 'express';
import type { NewsArticle, NewsContentBlock } from '../src/types.js';

// News articles are no longer rows in SQLite — they are JSON files under
// content/news/, written by Decap CMS (/admin) as commits to the GitHub repo.
//
// In production the server reads them straight from GitHub (cached briefly),
// so a post published in Decap shows up on the live site within about a
// minute, with no rebuild or redeploy. `npm run dev` sets NEWS_SOURCE=local
// (see vite.config.ts) and reads the files on disk instead, which is also what
// Decap's local_backend writes to.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(__dirname, '..');
const localNewsDir = path.join(appRoot, 'content', 'news');
const localPublicDir = path.join(appRoot, 'public');
const mediaCacheDir = path.join(__dirname, 'data', 'news-media-cache');

const REPO = process.env.NEWS_GITHUB_REPO || 'duattn2005-arch/LetDIVN';
const BRANCH = process.env.NEWS_GITHUB_BRANCH || 'main';
/** Folder of this app inside the repo (the repo root holds LetDIVN-main/, code/, ...). */
const REPO_APP_DIR = process.env.NEWS_GITHUB_APP_DIR ?? 'LetDIVN-main';
const CACHE_TTL_MS = 60 * 1000;

const repoPath = (p: string) => (REPO_APP_DIR ? `${REPO_APP_DIR}/${p}` : p);

type ArticleFile = Partial<Omit<NewsArticle, 'id' | 'slug' | 'content' | 'views'>>;

function toArticle(fileName: string, doc: ArticleFile): NewsArticle {
  const slug = fileName.replace(/\.json$/i, '');
  const contentBlocks: NewsContentBlock[] = (doc.contentBlocks || []).filter(
    (b): b is NewsContentBlock => !!b && (b.type === 'text' || b.type === 'image') && typeof b.value === 'string' && b.value !== ''
  );
  return {
    id: `news-${slug}`,
    slug,
    title: doc.title || slug,
    category: doc.category || 'News',
    summary: doc.summary || '',
    // Plain-text copy of the body, for consumers that search/preview text.
    content: contentBlocks.filter((b) => b.type === 'text').map((b) => b.value).join('\n\n'),
    contentBlocks,
    author: doc.author || '',
    date: doc.date || '',
    image: doc.image || '',
    source: doc.source || undefined,
    sourceUrl: doc.sourceUrl || undefined,
    views: 0,
    featured: !!doc.featured,
    status: doc.status === 'Pending' ? 'Pending' : 'Published',
  };
}

const byDateDesc = (a: NewsArticle, b: NewsArticle) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);

function readLocalNews(): NewsArticle[] {
  if (!fs.existsSync(localNewsDir)) return [];
  const articles: NewsArticle[] = [];
  for (const name of fs.readdirSync(localNewsDir)) {
    if (!name.toLowerCase().endsWith('.json')) continue;
    try {
      articles.push(toArticle(name, JSON.parse(fs.readFileSync(path.join(localNewsDir, name), 'utf8'))));
    } catch (err) {
      console.error(`[news] Bỏ qua ${name}: JSON không hợp lệ`, err);
    }
  }
  return articles.sort(byDateDesc);
}

// --- GitHub source -----------------------------------------------------------

function githubHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { 'User-Agent': 'letsdoitvietnam-site', ...extra };
  // Optional: raises GitHub's limit from 60 to 5000 requests/hour.
  if (process.env.NEWS_GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.NEWS_GITHUB_TOKEN}`;
  return headers;
}

let listingEtag = '';
let listing: { name: string; sha: string }[] = [];
/** Parsed files keyed by blob sha — a blob's content never changes, so each is fetched once. */
const blobCache = new Map<string, NewsArticle>();
let githubNews: NewsArticle[] | null = null;
let fetchedAt = 0;
let inflight: Promise<void> | null = null;

async function refreshFromGithub(): Promise<void> {
  const url = `https://api.github.com/repos/${REPO}/contents/${repoPath('content/news')}?ref=${encodeURIComponent(BRANCH)}`;
  const res = await fetch(url, {
    headers: githubHeaders({ Accept: 'application/vnd.github+json', ...(listingEtag ? { 'If-None-Match': listingEtag } : {}) }),
  });
  if (res.status === 200) {
    const items = (await res.json()) as { name: string; sha: string; type: string }[];
    listing = items.filter((i) => i.type === 'file' && i.name.toLowerCase().endsWith('.json'));
    listingEtag = res.headers.get('etag') || '';
  } else if (res.status !== 304) {
    throw new Error(`GitHub trả về ${res.status} khi liệt kê bài viết`);
  }

  const articles = await Promise.all(
    listing.map(async ({ name, sha }) => {
      const cached = blobCache.get(sha);
      if (cached) return cached;
      const blobRes = await fetch(`https://api.github.com/repos/${REPO}/git/blobs/${sha}`, {
        headers: githubHeaders({ Accept: 'application/vnd.github.raw+json' }),
      });
      if (!blobRes.ok) throw new Error(`GitHub trả về ${blobRes.status} khi tải ${name}`);
      try {
        const article = toArticle(name, JSON.parse(await blobRes.text()));
        blobCache.set(sha, article);
        return article;
      } catch (err) {
        console.error(`[news] Bỏ qua ${name}: JSON không hợp lệ`, err);
        return null;
      }
    })
  );
  githubNews = articles.filter((a): a is NewsArticle => !!a).sort(byDateDesc);
  fetchedAt = Date.now();
}

/** All articles, newest first. Never throws — falls back to the last good copy, then to the files on disk. */
export async function getNews(): Promise<NewsArticle[]> {
  if (process.env.NEWS_SOURCE === 'local') return readLocalNews();

  if (!githubNews || Date.now() - fetchedAt > CACHE_TTL_MS) {
    inflight ??= refreshFromGithub()
      .catch((err) => console.error('[news] Không đọc được bài viết từ GitHub:', err.message))
      .finally(() => { inflight = null; });
    // Only the very first load has to wait; later refreshes happen in the background.
    if (!githubNews) await inflight;
  }
  return githubNews ?? readLocalNews();
}

// --- Images uploaded through Decap -------------------------------------------

const IMAGE_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
};

/**
 * Serves /images/news/* . Decap commits new images into public/images/news/
 * on GitHub, but the running server only has the files that existed when it
 * was last deployed — so anything missing locally is fetched once from GitHub
 * and cached on disk. Mounted after the static-file handler, so deployed
 * images never reach this.
 */
export const newsMediaRouter = Router();
newsMediaRouter.get('/images/news/*file', async (req, res, next) => {
  const parts = ([] as string[]).concat((req.params as any).file);
  const rel = parts.join('/');
  const ext = path.extname(rel).toLowerCase();
  if (!IMAGE_TYPES[ext] || parts.some((p) => !p || p === '.' || p === '..' || p.includes('\\'))) return next();

  const local = path.join(localPublicDir, 'images', 'news', ...parts);
  if (fs.existsSync(local)) return res.sendFile(local);

  const cached = path.join(mediaCacheDir, ...parts);
  if (fs.existsSync(cached)) return res.type(IMAGE_TYPES[ext]).sendFile(cached);

  try {
    const url = `https://raw.githubusercontent.com/${REPO}/${encodeURIComponent(BRANCH)}/${repoPath('public/images/news/')}${parts.map(encodeURIComponent).join('/')}`;
    const upstream = await fetch(url, { headers: githubHeaders() });
    if (!upstream.ok) return next();
    const body = Buffer.from(await upstream.arrayBuffer());
    fs.mkdirSync(path.dirname(cached), { recursive: true });
    fs.writeFileSync(cached, body);
    res.type(IMAGE_TYPES[ext]).set('Cache-Control', 'public, max-age=86400').send(body);
  } catch (err) {
    next(err);
  }
});
