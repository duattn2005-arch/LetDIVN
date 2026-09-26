import type { Collection, Field } from './api';
import { slugify } from '../utils/slug';

export { slugify };

/** A hash route like #/c/news/edit/my-post -> ['c', 'news', 'edit', 'my-post']. */
export const parseHash = (hash: string) =>
  hash
    .replace(/^#\/?/, '')
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);

export const navigate = (path: string) => {
  window.location.hash = path;
};

export const optionList = (options: Field['options'] = []) =>
  options.map((o) => (typeof o === 'string' ? { label: o, value: o } : o));

/** Decap's `{{fields.x}}` / `{{x}}` summary templates, with the `| truncate(n)` filter. */
export function renderTemplate(template: string, data: Record<string, any>): string {
  return template
    .replace(/\{\{\s*(?:fields\.)?([\w.]+)\s*(?:\|\s*truncate\((\d+)\))?\s*\}\}/g, (_, key: string, max?: string) => {
      let v: any = key.split('.').reduce((o, k) => (o == null ? o : o[k]), data);
      if (Array.isArray(v)) v = v.join(' ');
      let s = v == null ? '' : String(v);
      if (max && s.length > Number(max)) s = `${s.slice(0, Number(max))}…`;
      return s;
    })
    .replace(/^[\s·—-]+|[\s·—-]+$/g, '')
    .trim();
}

/** Field names used in a collection's summary template, e.g. "{{date}} · {{city}} · {{title}}" -> date, city, title. */
export const summaryFields = (template = '') =>
  [...template.matchAll(/\{\{\s*(?:fields\.)?(\w+)/g)].map((m) => m[1]);

export const titleField = (c: Collection) => c.identifier_field || 'title';

/** A new entry's values: every field's `default`. */
export function defaultsFor(fields: Field[] = []): Record<string, any> {
  const data: Record<string, any> = {};
  for (const f of fields) {
    if (f.default !== undefined) data[f.name] = f.default;
    else if (f.widget === 'boolean') data[f.name] = false;
    else if (f.widget === 'object' && f.fields) data[f.name] = defaultsFor(f.fields);
  }
  return data;
}

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** YYYY-MM-DD -> DD/MM/YYYY. */
export const formatDate = (v: unknown) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v ?? ''));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(v ?? '');
};

export const formatDateTime = (v: unknown) => {
  const d = new Date(String(v ?? ''));
  if (Number.isNaN(d.getTime())) return String(v ?? '');
  return d.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
};

export const formatBytes = (n: number) =>
  n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : n >= 1024 ? `${Math.round(n / 1024)} KB` : `${n} B`;

export const isImageUrl = (url: string) => /\.(jpe?g|png|webp|gif|avif|svg)(\?.*)?$/i.test(url) || url.startsWith('data:image/');

/** WordPress's own words for the collections that match its "Bài viết" and "Trang". */
const WP_LABELS: Record<string, { menu: string; singular: string; all: string; add: string }> = {
  news: { menu: 'Bài viết', singular: 'bài viết', all: 'Tất cả bài viết', add: 'Viết bài mới' },
  pages: { menu: 'Trang', singular: 'trang', all: 'Tất cả các trang', add: 'Thêm trang mới' },
};

export function labelsFor(c: Collection) {
  const singular = c.label_singular || c.label;
  return WP_LABELS[c.name] ?? { menu: c.label, singular, all: `Tất cả ${singular}`, add: `Thêm ${singular} mới` };
}

/** Where each collection shows up on the live site ("Xem" links). */
export const SITE_PATHS: Record<string, string> = {
  news: '/news/',
  events: '/cleanup-map/',
  videos: '/videos/',
  partners: '/our-partners/',
  team: '/our-team/',
  gallery: '/gallery/',
  'what-we-do': '/what-we-do/',
  'who-we-are': '/who-we-are/',
  'media-coverage': '/media-on-us/',
  projects: '/projects/',
  pages: '/',
};

/** Page files ("pages"/"projects" collections) -> the URL of the page they fill. */
export const FILE_PATHS: Record<string, string> = {
  whoWeAre: '/who-we-are/',
  whatWeDo: '/what-we-do/',
  ourTeam: '/our-team/',
  ourPartners: '/our-partners/',
  mediaOnUsPage: '/media-on-us/',
  newsPage: '/news/',
  videosPage: '/videos/',
  fullGallery: '/gallery/',
  contactPage: '/contact/',
  cleanupMap: '/cleanup-map/',
  projects: '/projects/',
  'world-cleanup-day': '/world-cleanup-day/',
  'environmental-day': '/environmental-day/',
  'green-ocean-campaign': '/green-ocean-campaign/',
  'wildlife-nature': '/wildlife-nature/',
  'workshop-education': '/workshop-education/',
};

/** Shrinks big photos before upload (phones make 5-10 MB files); small files and GIFs are left alone. */
export async function prepareUpload(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 1.5 * 1024 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    // PNGs may be transparent (logos), so they become WebP rather than JPEG.
    const type = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/webp';
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, type, 0.85));
    if (!blob || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, type === 'image/jpeg' ? '.jpg' : '.webp');
    return new File([blob], name, { type });
  } catch {
    return file;
  }
}
