import { execFileSync } from 'child_process';
import { createHash, createHmac, timingSafeEqual } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Router, type NextFunction, type Request, type Response } from 'express';
import multer from 'multer';
import { parse as parseYaml } from 'yaml';
import { BRANCH, REPO, REPO_APP_DIR, repoPath, invalidateCmsSnapshot, rememberCmsMedia } from '../cmsContent.js';
import { checkAdminLogin } from './decapAuth.js';
import { events, volunteers, contacts } from '../db/collections.js';
import { slugify } from '../../src/utils/slug.js';

// Backend of the WordPress-style editor at /admin/ (src/admin/). It edits the
// same JSON files as Decap (/admin/decap/), described by Decap's config.yml:
// every save is a commit to GitHub made with DECAP_ADMIN_GITHUB_TOKEN, so the
// live site picks it up the same way (server/cmsContent.ts). With
// CMS_SOURCE=local (`npm run dev`) the files on disk are edited instead.
//
// Login is the shared admin username/password of Decap's popup; the session
// is a signed cookie. Every write also needs the X-Requested-With header,
// which a cross-site form can't send.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(__dirname, '..', '..');
const isLocal = () => (process.env.CMS_SOURCE || process.env.NEWS_SOURCE) === 'local';

const router = Router();

// --- Session ------------------------------------------------------------------

const COOKIE = 'wp_admin_session';
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

/** Changing the admin password or token signs everyone out. */
const sessionKey = () =>
  createHash('sha256')
    .update(`wp-admin|${process.env.DECAP_ADMIN_PASSWORD}|${process.env.DECAP_ADMIN_GITHUB_TOKEN}`)
    .digest();

const sign = (payload: string) => createHmac('sha256', sessionKey()).update(payload).digest('hex');

function isSignedIn(req: Request): boolean {
  if (!process.env.DECAP_ADMIN_PASSWORD) return false;
  const [expires, mac] = String(req.cookies?.[COOKIE] ?? '').split('.');
  if (!expires || !mac || Number(expires) < Date.now()) return false;
  const expected = Buffer.from(sign(expires));
  const given = Buffer.from(mac);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!isSignedIn(req)) {
    res.status(401).json({ error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
    return;
  }
  if (req.method !== 'GET' && req.get('X-Requested-With') !== 'wp-admin') {
    res.status(403).json({ error: 'Yêu cầu không hợp lệ.' });
    return;
  }
  next();
}

const cookieOptions = (req: Request) => ({
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: req.secure || req.get('x-forwarded-proto') === 'https',
  path: '/api/wp',
});

router.post('/wp/login', (req, res) => {
  const username = String(req.body?.username ?? '');
  const error = checkAdminLogin(req.ip || 'unknown', username, String(req.body?.password ?? ''));
  if (error) {
    res.status(401).json({ error });
    return;
  }
  const expires = String(Date.now() + SESSION_MS);
  res.cookie(COOKIE, `${expires}.${sign(expires)}`, { ...cookieOptions(req), maxAge: SESSION_MS });
  res.json({ user: username });
});

router.post('/wp/logout', (req, res) => {
  res.clearCookie(COOKIE, cookieOptions(req));
  res.json({ ok: true });
});

router.get('/wp/me', (req, res) => {
  if (!isSignedIn(req)) {
    res.status(401).json({ error: 'Chưa đăng nhập.' });
    return;
  }
  res.json({ user: process.env.DECAP_ADMIN_USERNAME || 'admin', local: isLocal() });
});

router.use('/wp', requireAdmin);

// --- Collections, from Decap's config.yml ----------------------------------------

type Field = Record<string, any>;
interface Collection {
  name: string;
  label: string;
  label_singular?: string;
  description?: string;
  folder?: string;
  files?: { name: string; label: string; file: string; fields: Field[] }[];
  fields?: Field[];
  create?: boolean;
  delete?: boolean;
  slug?: string;
  identifier_field?: string;
  summary?: string;
  media_folder?: string;
  public_folder?: string;
}

const CONFIG_PATHS = [
  path.join(appRoot, 'public', 'admin', 'decap', 'config.yml'),
  path.join(appRoot, 'dist', 'admin', 'decap', 'config.yml'),
];
let configCache: { mtime: number; collections: Collection[] } | null = null;

function getCollections(): Collection[] {
  const file = CONFIG_PATHS.find((p) => fs.existsSync(p));
  if (!file) throw new Error('Không tìm thấy config.yml của Decap.');
  const mtime = fs.statSync(file).mtimeMs;
  if (configCache?.mtime !== mtime) {
    const config = parseYaml(fs.readFileSync(file, 'utf8'), { maxAliasCount: -1 });
    configCache = { mtime, collections: config.collections ?? [] };
  }
  return configCache.collections;
}

/** config.yml paths are relative to the repo root; everything here is relative to the app folder. */
const appPath = (repoRelative: string) => {
  const p = repoRelative.replace(/^\/+/, '');
  return REPO_APP_DIR && p.startsWith(`${REPO_APP_DIR}/`) ? p.slice(REPO_APP_DIR.length + 1) : p;
};

const SAFE_SLUG = /^[a-z0-9][a-z0-9._-]*$/i;

/** The app-relative JSON file behind one entry, or null if it isn't one this editor may touch. */
function entryFile(collection: Collection, slug: string): string | null {
  let file: string | undefined;
  if (collection.folder) {
    if (!SAFE_SLUG.test(slug)) return null;
    file = `${appPath(collection.folder)}/${slug}.json`;
  } else {
    const entry = collection.files?.find((f) => f.name === slug);
    file = entry && appPath(entry.file);
  }
  return file && file.startsWith('content/') && file.endsWith('.json') && !file.includes('..') ? file : null;
}

function findCollection(req: Request, res: Response): Collection | null {
  const collection = getCollections().find((c) => c.name === req.params.collection);
  if (!collection) res.status(404).json({ error: 'Không có mục này.' });
  return collection ?? null;
}

// --- Storage: GitHub in production, the files on disk with CMS_SOURCE=local -----

class ConflictError extends Error {}

const gitSha = (body: Buffer) => createHash('sha1').update(`blob ${body.length}\0`).update(body).digest('hex');

async function github(method: string, url: string, body?: unknown) {
  const token = process.env.DECAP_ADMIN_GITHUB_TOKEN;
  if (!token) throw new Error('Chưa cấu hình DECAP_ADMIN_GITHUB_TOKEN trên server.');
  return fetch(`https://api.github.com/repos/${REPO}/${url}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'letsdoitvietnam-admin',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

const contentsUrl = (file: string) => `contents/${repoPath(file).split('/').map(encodeURIComponent).join('/')}`;

const blobCache = new Map<string, unknown>();

async function readBlob(sha: string): Promise<unknown> {
  if (!blobCache.has(sha)) {
    const res = await github('GET', `git/blobs/${sha}`);
    if (!res.ok) throw new Error(`GitHub trả về ${res.status}`);
    const blob = (await res.json()) as { content: string };
    blobCache.set(sha, JSON.parse(Buffer.from(blob.content, 'base64').toString('utf8')));
  }
  return blobCache.get(sha);
}

const store = {
  async list(dir: string): Promise<{ slug: string; sha: string; data: any }[]> {
    if (isLocal()) {
      const abs = path.join(appRoot, dir);
      if (!fs.existsSync(abs)) return [];
      return fs
        .readdirSync(abs)
        .filter((n) => n.endsWith('.json'))
        .map((n) => {
          const body = fs.readFileSync(path.join(abs, n));
          return { slug: n.slice(0, -5), sha: gitSha(body), data: JSON.parse(body.toString('utf8')) };
        });
    }
    const res = await github('GET', `${contentsUrl(dir)}?ref=${encodeURIComponent(BRANCH)}`);
    if (res.status === 404) return [];
    if (!res.ok) throw new Error(`GitHub trả về ${res.status}`);
    const items = ((await res.json()) as { name: string; sha: string; type: string }[]).filter(
      (i) => i.type === 'file' && i.name.endsWith('.json')
    );
    return Promise.all(items.map(async (i) => ({ slug: i.name.slice(0, -5), sha: i.sha, data: await readBlob(i.sha) })));
  },

  async read(file: string): Promise<{ sha: string; data: any } | null> {
    if (isLocal()) {
      const abs = path.join(appRoot, file);
      if (!fs.existsSync(abs)) return null;
      const body = fs.readFileSync(abs);
      return { sha: gitSha(body), data: JSON.parse(body.toString('utf8')) };
    }
    const res = await github('GET', `${contentsUrl(file)}?ref=${encodeURIComponent(BRANCH)}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GitHub trả về ${res.status}`);
    const item = (await res.json()) as { sha: string; content: string };
    return { sha: item.sha, data: JSON.parse(Buffer.from(item.content, 'base64').toString('utf8')) };
  },

  /** Writes a file; `sha` is the version being replaced (none = must not exist yet). Returns the new sha. */
  async write(file: string, body: Buffer, sha: string | undefined, message: string): Promise<string> {
    if (isLocal()) {
      const abs = path.join(appRoot, file);
      const current = fs.existsSync(abs) ? gitSha(fs.readFileSync(abs)) : undefined;
      if (current !== sha) throw new ConflictError();
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, body);
      return gitSha(body);
    }
    const res = await github('PUT', contentsUrl(file), { message, content: body.toString('base64'), branch: BRANCH, ...(sha ? { sha } : {}) });
    if (res.status === 409 || res.status === 422) throw new ConflictError();
    if (!res.ok) throw new Error(`GitHub trả về ${res.status}`);
    return ((await res.json()) as { content: { sha: string } }).content.sha;
  },

  async remove(file: string, sha: string, message: string) {
    if (isLocal()) {
      const abs = path.join(appRoot, file);
      if (!fs.existsSync(abs) || gitSha(fs.readFileSync(abs)) !== sha) throw new ConflictError();
      fs.unlinkSync(abs);
      return;
    }
    const res = await github('DELETE', contentsUrl(file), { message, sha, branch: BRANCH });
    if (res.status === 409 || res.status === 422) throw new ConflictError();
    if (!res.ok) throw new Error(`GitHub trả về ${res.status}`);
  },
};

/** Wraps a handler so thrown errors become a JSON message instead of a hung request. */
const handle =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response) =>
    fn(req, res).catch((err) => {
      if (err instanceof ConflictError) {
        res.status(409).json({ error: 'Nội dung này vừa được sửa ở nơi khác (hoặc đường dẫn đã tồn tại). Hãy tải lại trang rồi sửa lại.' });
        return;
      }
      console.error('[wp-admin]', err);
      res.status(500).json({ error: err?.message || 'Lỗi máy chủ.' });
    });

const commitMessage = (verb: string, collection: Collection, slug: string) =>
  `${verb} ${collection.label_singular || collection.label}: ${slug}`;

// --- Entries ----------------------------------------------------------------------

router.get('/wp/config', (req, res) => {
  res.json({ collections: getCollections(), local: isLocal() });
});

router.get(
  '/wp/entries/:collection',
  handle(async (req, res) => {
    const collection = findCollection(req, res);
    if (!collection) return;
    if (!collection.folder) {
      res.json((collection.files ?? []).map((f) => ({ slug: f.name, label: f.label })));
      return;
    }
    res.json(await store.list(appPath(collection.folder)));
  })
);

router.get(
  '/wp/entries/:collection/:slug',
  handle(async (req, res) => {
    const collection = findCollection(req, res);
    if (!collection) return;
    const file = entryFile(collection, String(req.params.slug));
    const entry = file && (await store.read(file));
    // A page file that was never saved is simply empty (the site shows its built-in text).
    if (!entry && file && collection.files) {
      res.json({ slug: req.params.slug, sha: undefined, data: {} });
      return;
    }
    if (!entry) {
      res.status(404).json({ error: 'Không tìm thấy nội dung này.' });
      return;
    }
    res.json({ slug: req.params.slug, ...entry });
  })
);

router.put(
  '/wp/entries/:collection/:slug',
  handle(async (req, res) => {
    const collection = findCollection(req, res);
    if (!collection) return;
    const slug = String(req.params.slug);
    const file = entryFile(collection, slug);
    const data = req.body?.data;
    if (!file || !data || typeof data !== 'object' || Array.isArray(data)) {
      res.status(400).json({ error: 'Dữ liệu không hợp lệ.' });
      return;
    }
    const sha = typeof req.body.sha === 'string' ? req.body.sha : undefined;
    if (!sha && collection.folder && collection.create === false) {
      res.status(403).json({ error: 'Mục này không cho thêm mới.' });
      return;
    }
    const body = Buffer.from(`${JSON.stringify(data, null, 2)}\n`, 'utf8');
    const newSha = await store.write(file, body, sha, commitMessage(sha ? 'Sửa' : 'Thêm', collection, slug));
    invalidateCmsSnapshot();
    res.json({ slug, sha: newSha });
  })
);

router.delete(
  '/wp/entries/:collection/:slug',
  handle(async (req, res) => {
    const collection = findCollection(req, res);
    if (!collection) return;
    const slug = String(req.params.slug);
    const file = entryFile(collection, slug);
    if (!file || !collection.folder || collection.delete === false || typeof req.body?.sha !== 'string') {
      res.status(400).json({ error: 'Không xóa được mục này.' });
      return;
    }
    await store.remove(file, req.body.sha, commitMessage('Xóa', collection, slug));
    invalidateCmsSnapshot();
    res.json({ ok: true });
  })
);

// --- Revisions: the file's commit history ("Bản sửa đổi") -----------------------

interface Revision {
  sha: string;
  date: string;
  author: string;
  message: string;
}

/** The repo checkout this app lives in (for CMS_SOURCE=local). */
const git = (...args: string[]) => execFileSync('git', args, { cwd: appRoot, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });

async function listRevisions(file: string): Promise<Revision[]> {
  if (isLocal()) {
    try {
      return git('log', '-n', '50', '--format=%H%x1f%an%x1f%aI%x1f%s', '--', file)
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [sha, author, date, message] = line.split('\x1f');
          return { sha, author, date, message };
        });
    } catch {
      return [];
    }
  }
  const res = await github('GET', `commits?path=${encodeURIComponent(repoPath(file))}&sha=${encodeURIComponent(BRANCH)}&per_page=50`);
  if (!res.ok) throw new Error(`GitHub trả về ${res.status}`);
  const commits = (await res.json()) as { sha: string; commit: { message: string; author: { name: string; date: string } } }[];
  return commits.map((c) => ({ sha: c.sha, author: c.commit.author.name, date: c.commit.author.date, message: c.commit.message.split('\n')[0] }));
}

async function readRevision(file: string, sha: string): Promise<any> {
  if (isLocal()) return JSON.parse(git('show', `${sha}:${repoPath(file)}`));
  const res = await github('GET', `${contentsUrl(file)}?ref=${sha}`);
  if (!res.ok) throw new Error(`GitHub trả về ${res.status}`);
  const item = (await res.json()) as { content: string };
  return JSON.parse(Buffer.from(item.content, 'base64').toString('utf8'));
}

router.get(
  '/wp/revisions/:collection/:slug',
  handle(async (req, res) => {
    const collection = findCollection(req, res);
    if (!collection) return;
    const file = entryFile(collection, String(req.params.slug));
    if (!file) {
      res.status(400).json({ error: 'Không có mục này.' });
      return;
    }
    res.json(await listRevisions(file));
  })
);

router.get(
  '/wp/revisions/:collection/:slug/:sha',
  handle(async (req, res) => {
    const collection = findCollection(req, res);
    if (!collection) return;
    const file = entryFile(collection, String(req.params.slug));
    const sha = String(req.params.sha);
    if (!file || !/^[0-9a-f]{7,40}$/.test(sha)) {
      res.status(400).json({ error: 'Không có bản sửa đổi này.' });
      return;
    }
    res.json({ data: await readRevision(file, sha) });
  })
);

// --- Media library ------------------------------------------------------------

const MEDIA_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
};

interface MediaItem {
  url: string;
  size: number;
}

let mediaCache: { at: number; items: MediaItem[] } | null = null;
const MEDIA_TTL_MS = 60 * 1000;

function walkLocalMedia(dir: string, url: string, out: MediaItem[]) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walkLocalMedia(abs, `${url}/${entry.name}`, out);
    else if (MEDIA_TYPES[path.extname(entry.name).toLowerCase()]) out.push({ url: `${url}/${entry.name}`, size: fs.statSync(abs).size });
  }
}

async function listMedia(): Promise<MediaItem[]> {
  if (isLocal()) {
    const items: MediaItem[] = [];
    const root = path.join(appRoot, 'public', 'images');
    if (fs.existsSync(root)) walkLocalMedia(root, '/images', items);
    return items;
  }
  if (mediaCache && Date.now() - mediaCache.at < MEDIA_TTL_MS) return mediaCache.items;
  const res = await github('GET', `git/trees/${encodeURIComponent(BRANCH)}?recursive=1`);
  if (!res.ok) throw new Error(`GitHub trả về ${res.status}`);
  const prefix = `${repoPath('public/images')}/`;
  const tree = (await res.json()) as { tree: { path: string; type: string; size?: number }[] };
  const items = tree.tree
    .filter((e) => e.type === 'blob' && e.path.startsWith(prefix) && MEDIA_TYPES[path.extname(e.path).toLowerCase()])
    .map((e) => ({ url: `/images/${e.path.slice(prefix.length)}`, size: e.size ?? 0 }));
  mediaCache = { at: Date.now(), items };
  return items;
}

router.get(
  '/wp/media',
  handle(async (req, res) => {
    res.json(await listMedia());
  })
);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

router.post(
  '/wp/media',
  upload.single('file'),
  handle(async (req, res) => {
    const file = req.file;
    // multer reads the file name as latin1; browsers send UTF-8 ("Ảnh" etc.).
    const originalName = Buffer.from(file?.originalname || '', 'latin1').toString('utf8');
    const ext = path.extname(originalName).toLowerCase();
    if (!file || !MEDIA_TYPES[ext] || ext === '.svg') {
      res.status(400).json({ error: 'Chỉ tải lên được ảnh (JPG, PNG, WebP, GIF, AVIF) hoặc PDF.' });
      return;
    }
    // Uploads go to /images/cms/<year>/<month>/, like WordPress's uploads folder.
    const now = new Date();
    const folder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const base = slugify(path.basename(originalName, ext)).slice(0, 60) || 'anh';
    const name = `${base}-${Date.now().toString(36)}${ext}`;
    const appFile = `public/images/cms/${folder}/${name}`;
    const url = `/images/cms/${folder}/${name}`;

    await store.write(appFile, file.buffer, undefined, `Tải ảnh: ${url}`);
    if (!isLocal()) rememberCmsMedia(url, file.buffer);
    mediaCache?.items.unshift({ url, size: file.size });
    res.json({ url, size: file.size });
  })
);

// --- Sign-ups and messages (SQLite) --------------------------------------------

router.get('/wp/volunteers', (req, res) => {
  res.json(volunteers.getAll());
});

/** The old SQLite events keep a sign-up counter (bumped by POST /api/volunteers). */
function bumpEventCount(eventId: string | undefined, by: number) {
  const event = eventId ? events.getById(eventId) : null;
  if (event) events.update(event.id, { registeredCount: Math.max(0, (event.registeredCount || 0) + by) });
}

const VOLUNTEER_TEXT = ['fullName', 'email', 'phone', 'city', 'eventId', 'eventName', 'ageGroup', 'organizationName', 'preferredRole', 'notes'] as const;
const JOIN_AS = ['individual', 'group', 'organization'];

router.put('/wp/volunteers/:id', (req, res) => {
  const existing = volunteers.getById(String(req.params.id));
  if (!existing) {
    res.status(404).json({ error: 'Không tìm thấy tình nguyện viên này (có thể đã bị xóa).' });
    return;
  }
  const body = req.body ?? {};
  const updates: Record<string, unknown> = {};
  for (const key of VOLUNTEER_TEXT) {
    if (typeof body[key] === 'string') updates[key] = body[key].trim().slice(0, key === 'notes' ? 2000 : 300);
  }
  if (JOIN_AS.includes(body.joinAs)) updates.joinAs = body.joinAs;
  if (body.participants !== undefined) {
    const n = parseInt(body.participants, 10);
    updates.participants = Number.isFinite(n) && n > 0 ? Math.min(n, 100000) : 1;
  }
  if (typeof updates.preferredRole === 'string') updates.skills = updates.preferredRole ? [updates.preferredRole] : [];
  if (!updates.eventId) delete updates.eventId; // event_id is NOT NULL
  const saved = volunteers.update(existing.id, updates as any)!;
  if (saved.eventId !== existing.eventId) {
    bumpEventCount(existing.eventId, -1);
    bumpEventCount(saved.eventId, 1);
  }
  res.json(saved);
});

router.delete('/wp/volunteers/:id', (req, res) => {
  const existing = volunteers.getById(String(req.params.id));
  if (existing && volunteers.delete(existing.id)) bumpEventCount(existing.eventId, -1);
  res.json({ ok: true });
});

router.get('/wp/contacts', (req, res) => {
  res.json(contacts.getAll());
});

router.delete('/wp/contacts/:id', (req, res) => {
  contacts.delete(String(req.params.id));
  res.json({ ok: true });
});

export default router;
