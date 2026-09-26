import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Router } from 'express';
import type {
  CleanupEvent,
  NewsArticle,
  NewsContentBlock,
  MediaVideo,
  Partner,
  TeamMember,
  GalleryItem,
  WhatWeDoItem,
  WhoWeAreItem,
  MediaCoverageEntry,
  ProjectSection,
  ProjectStaticContent,
} from '../src/types.js';
import { extractYouTubeId, getYouTubeThumbnail } from '../src/utils/youtube.js';

// Content managed in Decap CMS (/admin): news, videos, partners, team, ... are
// JSON files under content/<folder>/, which Decap commits to the GitHub repo.
// They are not rows in SQLite any more.
//
// In production the server reads them straight from GitHub (cached briefly),
// so anything published in Decap shows up on the live site within a minute or
// two, with no rebuild or redeploy. `npm run dev` sets CMS_SOURCE=local (see
// vite.config.ts) and reads the files on disk instead, which is also what
// Decap's local_backend writes to.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(__dirname, '..');
const localContentDir = path.join(appRoot, 'content');
const localPublicDir = path.join(appRoot, 'public');
const mediaCacheDir = path.join(__dirname, 'data', 'cms-media-cache');

export const REPO = process.env.CMS_GITHUB_REPO || 'duattn2005-arch/LetDIVN';
export const BRANCH = process.env.CMS_GITHUB_BRANCH || 'main';
/** Folder of this app inside the repo (the repo root holds LetDIVN-main/, code/, ...). */
export const REPO_APP_DIR = process.env.CMS_GITHUB_APP_DIR ?? 'LetDIVN-main';
const CACHE_TTL_MS = 90 * 1000;

export const repoPath = (p: string) => (REPO_APP_DIR ? `${REPO_APP_DIR}/${p}` : p);

type Doc = Record<string, any>;
type Folder = Map<string, Doc>; // file slug -> parsed JSON
type Snapshot = Map<string, Folder>; // content folder name -> files

// --- Local files --------------------------------------------------------------

function readLocalSnapshot(): Snapshot {
  const snapshot: Snapshot = new Map();
  if (!fs.existsSync(localContentDir)) return snapshot;
  for (const dir of fs.readdirSync(localContentDir, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const folder: Folder = new Map();
    for (const name of fs.readdirSync(path.join(localContentDir, dir.name))) {
      if (!name.toLowerCase().endsWith('.json')) continue;
      try {
        folder.set(name.slice(0, -5), JSON.parse(fs.readFileSync(path.join(localContentDir, dir.name, name), 'utf8')));
      } catch (err) {
        console.error(`[cms] Bỏ qua ${dir.name}/${name}: JSON không hợp lệ`, err);
      }
    }
    snapshot.set(dir.name, folder);
  }
  return snapshot;
}

// --- GitHub source -----------------------------------------------------------

function githubHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { 'User-Agent': 'letsdoitvietnam-site', ...extra };
  // Unauthenticated calls share a 60 requests/hour limit per server IP, which
  // the polling alone can use up. A token, or else the Decap OAuth App's own
  // client id/secret, raises that to 5000/hour.
  const token = process.env.CMS_GITHUB_TOKEN || process.env.NEWS_GITHUB_TOKEN;
  const { DECAP_GITHUB_CLIENT_ID: clientId, DECAP_GITHUB_CLIENT_SECRET: clientSecret } = process.env;
  if (token) headers.Authorization = `Bearer ${token}`;
  else if (clientId && clientSecret) headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
  return headers;
}

async function githubJson(url: string, extra: Record<string, string> = {}) {
  const res = await fetch(url, { headers: githubHeaders({ Accept: 'application/vnd.github+json', ...extra }) });
  if (!res.ok && res.status !== 304) throw new Error(`GitHub trả về ${res.status} cho ${url}`);
  return res;
}

// Git objects are immutable, so trees and blobs are cached by sha forever:
// when nothing changed, a refresh costs one conditional request (a 304).
let contentDirEtag = '';
let contentDirs: { name: string; sha: string }[] = [];
const treeCache = new Map<string, { name: string; sha: string }[]>();
const blobCache = new Map<string, Doc | null>();

let githubSnapshot: Snapshot | null = null;
let fetchedAt = 0;
let inflight: Promise<void> | null = null;

async function refreshFromGithub(): Promise<void> {
  const res = await githubJson(
    `https://api.github.com/repos/${REPO}/contents/${repoPath('content')}?ref=${encodeURIComponent(BRANCH)}`,
    contentDirEtag ? { 'If-None-Match': contentDirEtag } : {}
  );
  if (res.status === 200) {
    const items = (await res.json()) as { name: string; sha: string; type: string }[];
    contentDirs = items.filter((i) => i.type === 'dir');
    contentDirEtag = res.headers.get('etag') || '';
  }

  const snapshot: Snapshot = new Map();
  for (const dir of contentDirs) {
    let entries = treeCache.get(dir.sha);
    if (!entries) {
      const tree = (await (await githubJson(`https://api.github.com/repos/${REPO}/git/trees/${dir.sha}`)).json()) as {
        tree: { path: string; sha: string; type: string }[];
      };
      entries = tree.tree
        .filter((e) => e.type === 'blob' && e.path.toLowerCase().endsWith('.json'))
        .map((e) => ({ name: e.path, sha: e.sha }));
      treeCache.set(dir.sha, entries);
    }

    const folder: Folder = new Map();
    await Promise.all(
      entries.map(async ({ name, sha }) => {
        if (!blobCache.has(sha)) {
          const blob = await githubJson(`https://api.github.com/repos/${REPO}/git/blobs/${sha}`, {
            Accept: 'application/vnd.github.raw+json',
          });
          try {
            blobCache.set(sha, JSON.parse(await blob.text()));
          } catch (err) {
            console.error(`[cms] Bỏ qua ${dir.name}/${name}: JSON không hợp lệ`, err);
            blobCache.set(sha, null);
          }
        }
        const doc = blobCache.get(sha);
        if (doc) folder.set(name.slice(0, -5), doc);
      })
    );
    snapshot.set(dir.name, folder);
  }
  githubSnapshot = snapshot;
  fetchedAt = Date.now();
}

/** Never throws — falls back to the last good copy from GitHub, then to the files on disk. */
async function getSnapshot(): Promise<Snapshot> {
  if ((process.env.CMS_SOURCE || process.env.NEWS_SOURCE) === 'local') return readLocalSnapshot();

  if (!githubSnapshot || Date.now() - fetchedAt > CACHE_TTL_MS) {
    inflight ??= refreshFromGithub()
      .catch((err) => console.error('[cms] Không đọc được nội dung từ GitHub:', err.message))
      .finally(() => { inflight = null; });
    // Only the very first load has to wait; later refreshes happen in the background.
    if (!githubSnapshot) await inflight;
  }
  return githubSnapshot ?? readLocalSnapshot();
}

/** Called after the admin editor commits: the next request re-reads GitHub instead of waiting out the cache. */
export function invalidateCmsSnapshot() {
  fetchedAt = 0;
}

async function getFolder(name: string): Promise<[string, Doc][]> {
  return [...((await getSnapshot()).get(name) ?? new Map())];
}

// --- Collections --------------------------------------------------------------

const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));
const num = (v: unknown, fallback = 0) => (Number.isFinite(Number(v)) && v !== '' && v != null ? Number(v) : fallback);

/**
 * A plain list collection: the file's own fields, plus `id` (migrated rows keep
 * their original database id, since other data may reference it) and `slug`
 * (the file name, used to link to the entry in Decap). Sorted by `order`.
 */
async function getList<T>(folder: string, idPrefix: string, map: (doc: Doc) => Omit<T, 'id'>): Promise<T[]> {
  return (await getFolder(folder))
    .map(([slug, doc]) => ({ order: num(doc.order), item: { ...map(doc), id: str(doc.id) || `${idPrefix}-${slug}`, slug } as T }))
    .sort((a, b) => a.order - b.order || String((a.item as any).slug).localeCompare((b.item as any).slug))
    .map((x) => x.item);
}

/** Formatted paragraphs (written in the admin editor) as plain text. */
const htmlToText = (html: string) =>
  html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();

export async function getNews(): Promise<NewsArticle[]> {
  const articles = (await getFolder('news')).map(([slug, doc]): NewsArticle => {
    const contentBlocks: NewsContentBlock[] = (Array.isArray(doc.contentBlocks) ? doc.contentBlocks : []).filter(
      (b: any): b is NewsContentBlock => !!b && ['text', 'html', 'image'].includes(b.type) && typeof b.value === 'string' && b.value !== ''
    );
    return {
      // Migrated articles keep their original id: the homepage news picker stores selections by id.
      id: str(doc.id) || `news-${slug}`,
      slug,
      title: str(doc.title) || slug,
      category: doc.category || 'News',
      summary: str(doc.summary),
      // Plain-text copy of the body, for consumers that search/preview text.
      content: contentBlocks
        .filter((b) => b.type !== 'image')
        .map((b) => (b.type === 'html' ? htmlToText(b.value) : b.value))
        .join('\n\n'),
      contentBlocks,
      author: str(doc.author),
      date: str(doc.date),
      image: str(doc.image),
      source: str(doc.source) || undefined,
      sourceUrl: str(doc.sourceUrl) || undefined,
      views: 0,
      featured: !!doc.featured,
      status: doc.status === 'Pending' ? 'Pending' : 'Published',
    };
  });
  return articles.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export const getVideos = () =>
  getList<MediaVideo>('videos', 'vid', (doc) => {
    const youtubeId = extractYouTubeId(str(doc.youtube)) || (/^[\w-]{11}$/.test(str(doc.youtube).trim()) ? str(doc.youtube).trim() : '');
    return {
      youtubeId,
      title: str(doc.title),
      thumbnailUrl: str(doc.thumbnailUrl) || (youtubeId ? getYouTubeThumbnail(youtubeId) : ''),
      addedAt: str(doc.addedAt) || undefined,
    };
  }).then((videos) => videos.filter((v) => v.youtubeId));

export const getPartners = () =>
  getList<Partner>('partners', 'part', (doc) => ({
    name: str(doc.name),
    tier: doc.tier || 'Community',
    logo: str(doc.logo),
    website: str(doc.website),
    type: str(doc.type),
    description: str(doc.description),
    joinedYear: num(doc.joinedYear, new Date().getFullYear()),
    scale: doc.scale != null && doc.scale !== '' ? num(doc.scale, 100) : undefined,
  }));

export const getTeam = () =>
  getList<TeamMember>('team', 'tm', (doc) => ({
    name: str(doc.name),
    role: str(doc.role),
    department: str(doc.department),
    avatar: str(doc.avatar),
    bio: str(doc.bio),
    linkedin: str(doc.linkedin) || undefined,
    facebook: str(doc.facebook) || undefined,
    email: str(doc.email) || undefined,
  }));

export const getGallery = () =>
  getList<GalleryItem>('gallery', 'gal', (doc) => ({
    title: str(doc.title),
    eventName: str(doc.eventName),
    year: num(doc.year, new Date().getFullYear()),
    city: str(doc.city),
    imageUrl: str(doc.imageUrl),
    caption: str(doc.caption),
    category: str(doc.category),
  }));

export const getWhatWeDo = () =>
  getList<WhatWeDoItem>('what-we-do', 'wwd', (doc) => ({
    badge: str(doc.badge) || undefined,
    title: str(doc.title),
    desc: str(doc.desc),
    image: str(doc.image),
    layout: doc.layout === 'image-right' ? 'image-right' : 'image-left',
    highlights: Array.isArray(doc.highlights) ? doc.highlights.map(str).filter(Boolean) : undefined,
    order: num(doc.order),
  }));

export const getWhoWeAre = () =>
  getList<WhoWeAreItem>('who-we-are', 'wwa', (doc) => ({
    title: str(doc.title),
    desc: str(doc.desc),
    image: str(doc.image),
    layout: doc.layout === 'image-right' ? 'image-right' : 'image-left',
    order: num(doc.order),
  }));

export const getMediaCoverage = () =>
  getList<MediaCoverageEntry>('media-coverage', 'mc', (doc) => ({
    title: str(doc.title),
    articleCount: num(doc.articleCount),
    segmentCount: num(doc.segmentCount),
    image: str(doc.image),
    pdfUrl: str(doc.pdfUrl),
    order: num(doc.order),
  }));

export const getEvents = () =>
  getList<CleanupEvent>('events', 'evt', (doc) => {
    const lat = Number(doc.coordinates?.lat);
    const lng = Number(doc.coordinates?.lng);
    return {
      title: str(doc.title),
      category: doc.category || 'World Cleanup Day',
      date: str(doc.date),
      time: str(doc.time),
      location: str(doc.location),
      city: str(doc.city),
      coordinates: Number.isFinite(lat) && Number.isFinite(lng) && (lat || lng) ? { lat, lng } : undefined,
      image: str(doc.image),
      bannerImage: str(doc.bannerImage) || undefined,
      description: str(doc.description),
      targetVolunteers: num(doc.targetVolunteers, 100),
      // Filled in by the /events route from the volunteer sign-ups in SQLite.
      registeredCount: 0,
      trashCollectedKg: num(doc.trashCollectedKg),
      status: ['Ongoing', 'Completed'].includes(doc.status) ? doc.status : 'Upcoming',
      leader: str(doc.leader),
      meetingPoint: str(doc.meetingPoint),
      googleMapsUrl: str(doc.googleMapsUrl) || undefined,
      sheetUrl: str(doc.sheetUrl) || undefined,
      schedule: Array.isArray(doc.schedule)
        ? doc.schedule.map((s: any) => ({ time: str(s?.time), activity: str(s?.activity) })).filter((s: { time: string; activity: string }) => s.time || s.activity)
        : undefined,
    };
  });

// --- Project story pages -------------------------------------------------------

const strList = (v: unknown) => (Array.isArray(v) ? v.map(str).filter((s) => s.trim()) : []);
const aspect = (v: unknown) => (['3/2', '4/3', '7/2', 'square'].includes(v as string) ? (v as ProjectSection['galleryAspect']) : undefined);

/** content/project-pages/<slug>.json, keyed by the CleanupEvent.category each page belongs to. */
export async function getProjectPages(): Promise<Record<string, ProjectStaticContent>> {
  const pages: Record<string, ProjectStaticContent> = {};
  for (const [, doc] of await getFolder('project-pages')) {
    const category = str(doc.category);
    if (!category) continue;
    const sections: ProjectSection[] = (Array.isArray(doc.sections) ? doc.sections : []).map((s: Doc) => ({
      heading: str(s.heading) || undefined,
      headingAsTitle: !!s.headingAsTitle || undefined,
      paragraphs: strList(s.paragraphs),
      bulletList: typeof s.bulletList === 'boolean' ? s.bulletList : undefined,
      textAlign: ['left', 'center', 'justify'].includes(s.textAlign) ? s.textAlign : undefined,
      image: str(s.image) || undefined,
      gallery: strList(s.gallery),
      galleryAspect: aspect(s.galleryAspect),
      columns: (Array.isArray(s.columns) ? s.columns : []).map((c: Doc) => ({ heading: str(c.heading) || undefined, paragraphs: strList(c.paragraphs) })),
      subBlocks: (Array.isArray(s.subBlocks) ? s.subBlocks : []).map((b: Doc) => ({
        title: str(b.title),
        text: str(b.text),
        gallery: strList(b.gallery),
        galleryAspect: aspect(b.galleryAspect),
      })),
      closingParagraphs: strList(s.closingParagraphs),
      closingBulletsLabel: str(s.closingBulletsLabel) || undefined,
      closingBullets: strList(s.closingBullets),
      band: s.band === 'gray' || s.band === 'white' ? s.band : undefined,
      personListItem: str(s.personListItem) || undefined,
    }));
    pages[category] = {
      category,
      hero: str(doc.hero),
      heroPosition: str(doc.heroPosition) || undefined,
      kicker: str(doc.kicker) || undefined,
      title: str(doc.title),
      titleColor: str(doc.titleColor) || undefined,
      sections,
    };
  }
  return pages;
}

// --- Page text and images ------------------------------------------------------

/**
 * Every EditableText / EditableImage / EditableGalleryGrid value, as
 * { contentKey: value }. content/page-content/<prefix>.json holds the fields of
 * one page nested by the rest of the key, e.g. project.wildlife-nature.json ->
 * { section1: { p0 } } is "project.wildlife-nature.section1.p0". Image lists
 * (galleries, the homepage news picks) come back as a JSON array string. Empty
 * fields are left out so the page falls back to the text built into the code.
 */
export async function getPageContent(): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const walk = (key: string, value: unknown) => {
    if (Array.isArray(value)) {
      const list = value.map(str).filter(Boolean);
      if (list.length) out[key] = JSON.stringify(list);
    } else if (value && typeof value === 'object') {
      for (const [name, child] of Object.entries(value)) walk(`${key}.${name}`, child);
    } else if (str(value).trim()) {
      out[key] = str(value);
    }
  };
  for (const [prefix, doc] of await getFolder('page-content')) walk(prefix, doc);
  return out;
}

// --- Images uploaded through Decap -------------------------------------------

const IMAGE_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.pdf': 'application/pdf',
};

/**
 * Serves /images/news/* and /images/cms/*. Decap commits new uploads into
 * public/images/ on GitHub, but the running server only has the files that
 * existed when it was last deployed — so anything missing locally is fetched
 * once from GitHub and cached on disk. Mounted after the static-file handler,
 * so deployed images never reach this.
 */
/**
 * Puts a file just committed under public/images/{cms,news}/ into the media
 * cache, so it is served right away instead of waiting for GitHub's raw CDN.
 */
export function rememberCmsMedia(publicPath: string, body: Buffer) {
  const match = /^\/images\/(cms|news)\/(.+)$/.exec(publicPath);
  if (!match) return;
  const parts = match[2].split('/');
  if (parts.some((p) => !p || p === '.' || p === '..' || p.includes('\\'))) return;
  const cached = path.join(mediaCacheDir, match[1], ...parts);
  fs.mkdirSync(path.dirname(cached), { recursive: true });
  fs.writeFileSync(cached, body);
}

export const cmsMediaRouter = Router();
cmsMediaRouter.get(['/images/news/*file', '/images/cms/*file'], async (req, res, next) => {
  const top = req.path.startsWith('/images/news/') ? 'news' : 'cms';
  const parts = ([] as string[]).concat((req.params as any).file);
  const ext = path.extname(parts[parts.length - 1] || '').toLowerCase();
  if (!IMAGE_TYPES[ext] || parts.some((p) => !p || p === '.' || p === '..' || p.includes('\\'))) return next();

  const local = path.join(localPublicDir, 'images', top, ...parts);
  if (fs.existsSync(local)) return res.sendFile(local);

  const cached = path.join(mediaCacheDir, top, ...parts);
  if (fs.existsSync(cached)) return res.type(IMAGE_TYPES[ext]).sendFile(cached);

  try {
    const url = `https://raw.githubusercontent.com/${REPO}/${encodeURIComponent(BRANCH)}/${repoPath(`public/images/${top}/`)}${parts.map(encodeURIComponent).join('/')}`;
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
