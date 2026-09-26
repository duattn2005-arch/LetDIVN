import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { api, type Collection, type Entry } from './api';
import { useAdmin } from './AdminApp';
import { PageTitle } from './Layout';
import { FILE_PATHS, SITE_PATHS, formatDate, optionList, slugify, summaryFields, titleField } from './util';

// "Tất cả bài viết": the WordPress list table for one collection, with status
// filters, search, a category filter, sortable columns and row actions.

const PER_PAGE = 20;

export function EntryList({ collection }: { collection: Collection }) {
  const { notify } = useAdmin();
  const [entries, setEntries] = useState<(Entry & { label?: string })[] | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const fields = collection.fields ?? [];
  const tField = titleField(collection);
  const imageField = fields.find((f) => f.widget === 'image');
  const statusField = fields.find((f) => f.name === 'status' && f.widget === 'select');
  const categoryField = fields.find((f) => f.name === 'category' && f.widget === 'select');
  const hasDate = fields.some((f) => f.name === 'date');
  const hasOrder = fields.some((f) => f.name === 'order');

  // Columns: the fields in the collection's summary template, besides the title.
  const columns = useMemo(() => {
    const names = summaryFields(collection.summary).filter((n) => n !== tField && n !== 'order');
    if (categoryField && !names.includes('category')) names.unshift('category');
    if (statusField && !names.includes('status') && !statusField.options?.some((o) => (typeof o === 'string' ? o : o.value) === 'Published'))
      names.push('status');
    return names.map((n) => fields.find((f) => f.name === n)).filter(Boolean) as typeof fields;
  }, [collection, fields, tField, categoryField, statusField]);

  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 }>(
    hasDate ? { key: 'date', dir: -1 } : hasOrder ? { key: 'order', dir: 1 } : { key: tField, dir: 1 }
  );

  useEffect(() => {
    // A "files" collection lists its pages straight from the config (below).
    if (collection.folder) api.entries(collection.name).then(setEntries, (err) => setError(err.message));
  }, [collection.name, collection.folder]);

  const isPublishStatus = statusField && optionList(statusField.options).some((o) => o.value === 'Published');
  const statusOf = (e: Entry) => (e.data?.status === 'Pending' ? 'Pending' : 'Published');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (entries ?? [])
      .filter((e) => !status || statusOf(e) === status)
      .filter((e) => !category || e.data?.category === category)
      .filter((e) => !q || JSON.stringify(e.data ?? {}).toLowerCase().includes(q) || (e.label ?? '').toLowerCase().includes(q))
      .sort((a, b) => {
        const va = a.data?.[sort.key] ?? '';
        const vb = b.data?.[sort.key] ?? '';
        const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'vi');
        return cmp * sort.dir;
      });
  }, [entries, query, status, category, sort]);

  useEffect(() => setPage(1), [query, status, category]);

  // --- A "files" collection (Nội dung các trang, Dự án): a simple list of pages. ---
  if (!collection.folder) {
    return (
      <div>
        <PageTitle>{collection.label}</PageTitle>
        {collection.description && <p className="mt-0 text-[var(--wp-muted)]">{collection.description}</p>}
        <table className="wp-table">
          <thead>
            <tr>
              <th>Trang</th>
              <th className="hidden sm:table-cell w-48">Trên website</th>
            </tr>
          </thead>
          <tbody>
            {(collection.files ?? []).map((f) => (
              <tr key={f.name}>
                <td>
                  <a href={`#/c/${collection.name}/edit/${f.name}`} className="font-semibold text-[15px]">
                    {f.label}
                  </a>
                  <div className="row-actions">
                    <a href={`#/c/${collection.name}/edit/${f.name}`}>Chỉnh sửa</a>
                    {' | '}
                    <a href={FILE_PATHS[f.name] ?? SITE_PATHS[collection.name] ?? '/'} target="_blank" rel="noreferrer">
                      Xem
                    </a>
                  </div>
                </td>
                <td className="hidden sm:table-cell text-[13px] text-[var(--wp-muted)]">{FILE_PATHS[f.name] ?? SITE_PATHS[collection.name] ?? '/'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const remove = async (e: Entry) => {
    const name = e.data[tField] || e.slug;
    if (!e.sha || !window.confirm(`Xóa vĩnh viễn “${name}”? Không thể hoàn tác.`)) return;
    try {
      await api.remove(collection.name, e.slug, e.sha);
      setEntries((list) => (list ?? []).filter((x) => x.slug !== e.slug));
      notify({ type: 'success', text: `Đã xóa “${name}”.` });
    } catch (err: any) {
      notify({ type: 'error', text: err.message });
    }
  };

  const viewUrl = (e: Entry) =>
    collection.name === 'events' && e.data.city ? `/explore-campaigns/${slugify(String(e.data.city))}/` : SITE_PATHS[collection.name] ?? '/';

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const shown = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const sortHeader = (key: string, label: string, className = '') => (
    <th key={key} className={className}>
      <button type="button" className="inline-flex items-center gap-1 text-[var(--wp-blue)] hover:text-[var(--wp-blue-dark)]" onClick={() => setSort((s) => ({ key, dir: s.key === key ? ((-s.dir) as 1 | -1) : 1 }))}>
        {label}
        {sort.key === key && (sort.dir === 1 ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
      </button>
    </th>
  );

  const counts = {
    all: entries?.length ?? 0,
    Published: entries?.filter((e) => statusOf(e) === 'Published').length ?? 0,
    Pending: entries?.filter((e) => statusOf(e) === 'Pending').length ?? 0,
  };

  const cell = (e: Entry, name: string) => {
    const f = fields.find((x) => x.name === name);
    const v = e.data[name];
    if (f?.widget === 'datetime') return formatDate(v);
    if (f?.widget === 'select') return optionList(f.options).find((o) => o.value === v)?.label ?? v ?? '—';
    if (v == null || v === '') return '—';
    return String(v);
  };

  const pager = (
    <div className="flex items-center gap-2 text-[13px]">
      <span className="text-[var(--wp-muted)]">{filtered.length} mục</span>
      {pages > 1 && (
        <>
          <button type="button" className="wp-btn wp-btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
            ‹
          </button>
          <span>
            {page} / {pages}
          </span>
          <button type="button" className="wp-btn wp-btn-sm" disabled={page === pages} onClick={() => setPage(page + 1)}>
            ›
          </button>
        </>
      )}
    </div>
  );

  return (
    <div>
      <PageTitle
        action={
          collection.create !== false ? (
            <a className="wp-btn" href={`#/c/${collection.name}/new`}>
              Thêm mới
            </a>
          ) : undefined
        }
      >
        {collection.label}
      </PageTitle>
      {collection.description && <p className="mt-0 mb-3 text-[var(--wp-muted)] text-[13px]">{collection.description}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <ul className="flex flex-wrap gap-1 m-0 p-0 list-none text-[13px] text-[var(--wp-muted)]">
          <li>
            <button type="button" onClick={() => setStatus('')} className={status === '' ? 'font-semibold text-black' : 'text-[var(--wp-blue)]'}>
              Tất cả <span className="text-[var(--wp-muted)] font-normal">({counts.all})</span>
            </button>
          </li>
          {isPublishStatus && (
            <>
              <li>|</li>
              <li>
                <button type="button" onClick={() => setStatus('Published')} className={status === 'Published' ? 'font-semibold text-black' : 'text-[var(--wp-blue)]'}>
                  Đã xuất bản <span className="text-[var(--wp-muted)] font-normal">({counts.Published})</span>
                </button>
              </li>
              <li>|</li>
              <li>
                <button type="button" onClick={() => setStatus('Pending')} className={status === 'Pending' ? 'font-semibold text-black' : 'text-[var(--wp-blue)]'}>
                  Bản nháp <span className="text-[var(--wp-muted)] font-normal">({counts.Pending})</span>
                </button>
              </li>
            </>
          )}
        </ul>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 absolute left-2 top-2 text-[#8c8f94]" />
            <input className="wp-input !pl-8" placeholder={`Tìm ${collection.label_singular || ''}…`} value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        {categoryField ? (
          <select className="wp-input !w-auto" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Tất cả {String(categoryField.label || '').toLowerCase()}</option>
            {optionList(categoryField.options).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : (
          <span />
        )}
        {pager}
      </div>

      {error && <div className="wp-notice wp-notice-error mb-3">{error}</div>}

      <div className="overflow-x-auto">
        <table className="wp-table">
          <thead>
            <tr>
              {imageField && <th className="w-16 hidden sm:table-cell" />}
              {sortHeader(tField, fields.find((f) => f.name === tField)?.label || 'Tiêu đề')}
              {columns.map((c) =>
                c.name === 'date' || c.name === 'year' ? (
                  sortHeader(c.name, c.label || c.name, 'hidden md:table-cell w-32')
                ) : (
                  <th key={c.name} className="hidden md:table-cell">
                    {c.label || c.name}
                  </th>
                )
              )}
              {hasOrder && sortHeader('order', 'Thứ tự', 'hidden sm:table-cell w-20')}
            </tr>
          </thead>
          <tbody>
            {!entries && !error && (
              <tr>
                <td colSpan={9} className="text-[var(--wp-muted)]">
                  Đang tải…
                </td>
              </tr>
            )}
            {entries && shown.length === 0 && (
              <tr>
                <td colSpan={9} className="text-[var(--wp-muted)]">
                  Không tìm thấy mục nào.
                </td>
              </tr>
            )}
            {shown.map((e) => {
              const edit = `#/c/${collection.name}/edit/${e.slug}`;
              return (
                <tr key={e.slug}>
                  {imageField && (
                    <td className="hidden sm:table-cell">
                      {e.data[imageField.name] ? (
                        <img src={e.data[imageField.name]} alt="" loading="lazy" className="w-12 h-12 object-cover wp-checker" />
                      ) : (
                        <span className="block w-12 h-12 bg-[#f0f0f1]" />
                      )}
                    </td>
                  )}
                  <td>
                    <a href={edit} className="font-semibold text-[15px]">
                      {e.data[tField] || e.slug}
                    </a>
                    {isPublishStatus && statusOf(e) === 'Pending' && <strong className="text-[#50575e]"> — Bản nháp</strong>}
                    {e.data.featured && <strong className="text-[#50575e]"> — Nổi bật</strong>}
                    <div className="md:hidden text-[13px] text-[var(--wp-muted)]">{columns.map((c) => cell(e, c.name)).join(' · ')}</div>
                    <div className="row-actions">
                      <a href={edit}>Chỉnh sửa</a>
                      {collection.delete !== false && (
                        <>
                          {' | '}
                          <button type="button" className="text-[var(--wp-red)] hover:underline" onClick={() => remove(e)}>
                            Xóa
                          </button>
                        </>
                      )}
                      {' | '}
                      <a href={viewUrl(e)} target="_blank" rel="noreferrer">
                        Xem
                      </a>
                    </div>
                  </td>
                  {columns.map((c) => (
                    <td key={c.name} className="hidden md:table-cell text-[13px]">
                      {cell(e, c.name)}
                    </td>
                  ))}
                  {hasOrder && <td className="hidden sm:table-cell text-[13px]">{e.data.order ?? '—'}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end mt-2">{pager}</div>
    </div>
  );
}
