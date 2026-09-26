// Client for server/routes/wpAdmin.ts. Every request carries the session
// cookie and the X-Requested-With header the server requires for writes.

export type Field = {
  name: string;
  label?: string;
  widget?: string;
  required?: boolean;
  hint?: string;
  default?: any;
  options?: (string | { label: string; value: string })[];
  fields?: Field[];
  field?: Field;
  types?: Field[];
  collapsed?: boolean;
  summary?: string;
  label_singular?: string;
  value_type?: 'int' | 'float';
  min?: number;
  max?: number;
  multiple?: boolean;
  collection?: string;
  value_field?: string;
  display_fields?: string[];
  format?: string;
  time_format?: string | false;
};

export interface Collection {
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
}

export interface Entry {
  slug: string;
  sha?: string;
  data: Record<string, any>;
}

/** One commit of an entry's file = one WordPress "bản sửa đổi". */
export interface Revision {
  sha: string;
  date: string;
  author: string;
  message: string;
}

export interface MediaItem {
  url: string;
  size: number;
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

let onUnauthorized: () => void = () => {};
export const setUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn;
};

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const isForm = body instanceof FormData;
  const res = await fetch(`/api/wp${url}`, {
    method,
    credentials: 'same-origin',
    headers: {
      'X-Requested-With': 'wp-admin',
      ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? (isForm ? (body as FormData) : JSON.stringify(body)) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && url !== '/login') onUnauthorized();
    throw new ApiError(json.error || `Lỗi ${res.status}`, res.status);
  }
  return json as T;
}

export const api = {
  me: () => request<{ user: string; local: boolean }>('GET', '/me'),
  login: (username: string, password: string) => request<{ user: string }>('POST', '/login', { username, password }),
  logout: () => request('POST', '/logout'),
  config: () => request<{ collections: Collection[]; local: boolean }>('GET', '/config'),
  entries: (collection: string) => request<(Entry & { label?: string })[]>('GET', `/entries/${collection}`),
  entry: (collection: string, slug: string) => request<Entry>('GET', `/entries/${collection}/${encodeURIComponent(slug)}`),
  save: (collection: string, slug: string, data: Record<string, any>, sha?: string) =>
    request<{ slug: string; sha: string }>('PUT', `/entries/${collection}/${encodeURIComponent(slug)}`, { data, sha }),
  remove: (collection: string, slug: string, sha: string) =>
    request('DELETE', `/entries/${collection}/${encodeURIComponent(slug)}`, { sha }),
  revisions: (collection: string, slug: string) =>
    request<Revision[]>('GET', `/revisions/${collection}/${encodeURIComponent(slug)}`),
  revision: (collection: string, slug: string, sha: string) =>
    request<{ data: Record<string, any> }>('GET', `/revisions/${collection}/${encodeURIComponent(slug)}/${sha}`),
  media: () => request<MediaItem[]>('GET', '/media'),
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<MediaItem>('POST', '/media', form);
  },
  volunteers: () => request<any[]>('GET', '/volunteers'),
  contacts: () => request<any[]>('GET', '/contacts'),
};
