import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { api, type Collection, type Entry, type Field } from './api';
import { useAdmin } from './AdminApp';
import { PageTitle } from './Layout';
import { FILE_PATHS, SITE_PATHS, formatDate, labelsFor, optionList, slugify, summaryFields, titleField } from './util';

// "Tất cả bài viết": WordPress's list table — status links, search, bulk
// actions, month and category filters, sortable columns, row actions with
// "Sửa nhanh" (quick edit) and pagination.

const PER_PAGE = 20;
const MONTHS = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

type Row = Entry & { label?: string };

export function EntryList({ collection }: { collection: Collection }) {
  const { notify } = useAdmin();
  const labels = labelsFor(collection);
  const [entries, setEntries] = useState<Row[] | null>(null);
  const [error, setError] = useState('');
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  // Month/category: picked in the dropdowns, applied with "Lọc" (as in WordPress).
  const [monthInput, setMonthInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [month, setMonth] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [checked, setChecked] = useState<string[]>([]);
  const [bulk, setBulk] = useState('');
  const [busy, setBusy] = useState(false);
  const [quickEdit, setQuickEdit] = useState<string | null>(null);

  const fields = collection.fields ?? [];
  const tField = titleField(collection);
  const imageField = fields.find((f) => f.widget === 'image');
  const statusField = fields.find((f) => f.name === 'status' && f.widget === 'select');
  const isPublishStatus = !!statusField && optionList(statusField.options).some((o) => o.value === 'Published');
  const categoryField = fields.find((f) => f.name === 'category' && f.widget === 'select');
  const dateField = fields.find((f) => f.widget === 'datetime');
  const hasOrder = fields.some((f) => f.name === 'order');
  const hasTags = fields.some((f) => f.name === 'tags');
  const hasAuthor = fields.some((f) => f.name === 'author');

  // Columns: author, category, tags (like WordPress), then the fields of the summary template.
  const columns = useMemo(() => {
    const names: string[] = [];
    if (hasAuthor) names.push('author');
    if (categoryField) names.push('category');
    if (hasTags) names.push('tags');
    summaryFields(collection.summary)
      .filter((n) => n !== tField && n !== 'order' && n !== dateField?.name && !names.includes(n))
      .forEach((n) => names.push(n));
    if (statusField && !isPublishStatus && !names.includes('status')) names.push('status');
    return names.map((n) => fields.find((f) => f.name === n)).filter(Boolean) as Field[];
  }, [collection, fields, tField, categoryField, statusField, isPublishStatus, hasTags, hasAuthor, dateField]);

  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 }>(
    dateField ? { key: dateField.name, dir: -1 } : hasOrder ? { key: 'order', dir: 1 } : { key: tField, dir: 1 }
  );

  useEffect(() => {
    // A "files" collection lists its pages straight from the config (below).
    if (collection.folder) api.entries(collection.name).then(setEntries, (err) => setError(err.message));
  }, [collection.name, collection.folder]);

  const statusOf = (e: Entry) => (e.data?.status === 'Pending' ? 'Pending' : 'Published');
  const monthOf = (e: Entry) => String(e.data?.[dateField?.name ?? 'date'] ?? '').slice(0, 7);

  const months = useMemo(
    () => [...new Set((entries ?? []).map(monthOf).filter((m) => /^\d{4}-\d{2}$/.test(m)))].sort().reverse(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (entries ?? [])
      .filter((e) => !status || statusOf(e) === status)
      .filter((e) => !category || e.data?.category === category)
      .filter((e) => !month || monthOf(e) === month)
      .filter((e) => !q || JSON.stringify(e.data ?? {}).toLowerCase().includes(q))
      .sort((a, b) => {
        const va = a.data?.[sort.key] ?? '';
        const vb = b.data?.[sort.key] ?? '';
        const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'vi');
        return cmp * sort.dir;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, query, status, category, month, sort]);

  useEffect(() => {
    setPage(1);
    setChecked([]);
  }, [query, status, category, month]);

  // --- A "files" collection (Trang, Dự án): a simple list of pages. ---
  if (!collection.folder) {
    return (
      <div>
        <PageTitle>{labels.menu}</PageTitle>
        {collection.description && <p className="mt-0 text-[var(--wp-muted)]">{collection.description}</p>}
        <table className="wp-table">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th className="hidden sm:table-cell w-56">Trên website</th>
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

  const nameOf = (e: Entry) => String(e.data?.[tField] || e.slug);

  const remove = async (e: Entry, ask = true) => {
    if (!e.sha || (ask && !window.confirm(`Xóa vĩnh viễn “${nameOf(e)}”? Không thể hoàn tác.`))) return false;
    await api.remove(collection.name, e.slug, e.sha);
    setEntries((list) => (list ?? []).filter((x) => x.slug !== e.slug));
    return true;
  };

  const removeOne = async (e: Entry) => {
    try {
      if (await remove(e)) notify({ type: 'success', text: `Đã xóa “${nameOf(e)}”.` });
    } catch (err: any) {
      notify({ type: 'error', text: err.message });
    }
  };

  const applyBulk = async () => {
    if (bulk !== 'trash' || !checked.length) return;
    const targets = (entries ?? []).filter((e) => checked.includes(e.slug));
    if (!window.confirm(`Xóa vĩnh viễn ${targets.length} ${labels.singular} đã chọn? Không thể hoàn tác.`)) return;
    setBusy(true);
    let done = 0;
    try {
      for (const e of targets) {
        await remove(e, false);
        done++;
      }
      notify({ type: 'success', text: `Đã xóa ${done} ${labels.singular}.` });
    } catch (err: any) {
      notify({ type: 'error', text: `Đã xóa ${done}/${targets.length}. Lỗi: ${err.message}` });
    } finally {
      setChecked([]);
      setBulk('');
      setBusy(false);
    }
  };

  const viewUrl = (e: Entry) =>
    collection.name === 'news'
      ? `/news/${e.slug}/`
      : collection.name === 'events' && e.data?.city
        ? `/explore-campaigns/${slugify(String(e.data.city))}/`
        : SITE_PATHS[collection.name] ?? '/';

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const shown = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const allChecked = shown.length > 0 && shown.every((e) => checked.includes(e.slug));

  const sortHeader = (key: string, label: string, className = '') => (
    <th key={key} className={className}>
      <button
        type="button"
        className="inline-flex items-center gap-1 text-[var(--wp-blue)] hover:text-[var(--wp-blue-dark)]"
        onClick={() => setSort((s) => ({ key, dir: s.key === key ? ((-s.dir) as 1 | -1) : 1 }))}
      >
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

  const cell = (e: Entry, f: Field): React.ReactNode => {
    const v = e.data?.[f.name];
    if (f.name === 'tags') return Array.isArray(v) && v.length ? v.join(', ') : '—';
    if (f.widget === 'datetime') return formatDate(v);
    if (f.widget === 'select') return optionList(f.options).find((o) => o.value === v)?.label ?? v ?? '—';
    if (v == null || v === '') return '—';
    return String(v);
  };

  const pager = (
    <div className="flex items-center gap-1.5 text-[13px]">
      <span className="text-[var(--wp-muted)] mr-1">{filtered.length} mục</span>
      {pages > 1 && (
        <>
          <button type="button" className="wp-btn wp-btn-sm" disabled={page === 1} onClick={() => setPage(1)} aria-label="Trang đầu">
            «
          </button>
          <button type="button" className="wp-btn wp-btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Trang trước">
            ‹
          </button>
          <span className="px-1">
            {page} trên {pages}
          </span>
          <button type="button" className="wp-btn wp-btn-sm" disabled={page === pages} onClick={() => setPage(page + 1)} aria-label="Trang sau">
            ›
          </button>
          <button type="button" className="wp-btn wp-btn-sm" disabled={page === pages} onClick={() => setPage(pages)} aria-label="Trang cuối">
            »
          </button>
        </>
      )}
    </div>
  );

  const statusLink = (value: string, label: string, count: number) => (
    <li>
      <button type="button" onClick={() => setStatus(value)} className={status === value ? 'font-semibold text-black' : 'text-[var(--wp-blue)]'}>
        {label} <span className="text-[var(--wp-muted)] font-normal">({count})</span>
      </button>
    </li>
  );

  const colCount = 2 + (imageField ? 1 : 0) + columns.length + (dateField ? 1 : 0) + (hasOrder ? 1 : 0);

  return (
    <div>
      <PageTitle
        action={
          collection.create !== false ? (
            <a className="wp-btn" href={`#/c/${collection.name}/new`}>
              {collection.name === 'news' ? 'Viết bài mới' : 'Thêm mới'}
            </a>
          ) : undefined
        }
      >
        {labels.menu}
      </PageTitle>
      {collection.description && <p className="mt-0 mb-3 text-[var(--wp-muted)] text-[13px]">{collection.description}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <ul className="flex flex-wrap gap-1 m-0 p-0 list-none text-[13px] text-[var(--wp-muted)]">
          {statusLink('', 'Tất cả', counts.all)}
          {isPublishStatus && (
            <>
              <li>|</li>
              {statusLink('Published', 'Đã xuất bản', counts.Published)}
              {counts.Pending > 0 && (
                <>
                  <li>|</li>
                  {statusLink('Pending', 'Bản nháp', counts.Pending)}
                </>
              )}
            </>
          )}
        </ul>
        <form
          className="flex items-center gap-1.5 w-full sm:w-auto"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(queryInput);
          }}
        >
          <input className="wp-input sm:!w-52" value={queryInput} onChange={(e) => setQueryInput(e.target.value)} aria-label={`Tìm ${labels.singular}`} />
          <button type="submit" className="wp-btn whitespace-nowrap">
            Tìm {labels.singular}
          </button>
        </form>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {collection.delete !== false && (
            <>
              <select className="wp-input !w-auto" value={bulk} onChange={(e) => setBulk(e.target.value)} aria-label="Hành động hàng loạt">
                <option value="">Hành động</option>
                <option value="trash">Bỏ vào thùng rác</option>
              </select>
              <button type="button" className="wp-btn" disabled={busy || !bulk || !checked.length} onClick={applyBulk}>
                {busy ? 'Đang xóa…' : 'Áp dụng'}
              </button>
            </>
          )}
          {dateField && (
            <select className="wp-input !w-auto sm:ml-2" value={monthInput} onChange={(e) => setMonthInput(e.target.value)} aria-label="Lọc theo tháng">
              <option value="">Tất cả các ngày</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {MONTHS[Number(m.slice(5)) - 1]} {m.slice(0, 4)}
                </option>
              ))}
            </select>
          )}
          {categoryField && (
            <select className="wp-input !w-auto" value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} aria-label="Lọc theo danh mục">
              <option value="">Tất cả danh mục</option>
              {optionList(categoryField.options).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
          {(dateField || categoryField) && (
            <button
              type="button"
              className="wp-btn"
              onClick={() => {
                setMonth(monthInput);
                setCategory(categoryInput);
              }}
            >
              Lọc
            </button>
          )}
        </div>
        {pager}
      </div>

      {error && <div className="wp-notice wp-notice-error mb-3">{error}</div>}

      <div className="overflow-x-auto">
        <table className="wp-table">
          <thead>
            <tr>
              <th className="w-8 !px-2">
                <input
                  type="checkbox"
                  aria-label="Chọn tất cả"
                  checked={allChecked}
                  onChange={() => setChecked(allChecked ? [] : shown.map((e) => e.slug))}
                />
              </th>
              {imageField && <th className="w-16 hidden sm:table-cell" />}
              {sortHeader(tField, fields.find((f) => f.name === tField)?.label || 'Tiêu đề')}
              {columns.map((c) => (
                <th key={c.name} className="hidden md:table-cell">
                  {c.name === 'category' ? 'Danh mục' : c.name === 'tags' ? 'Thẻ' : c.label || c.name}
                </th>
              ))}
              {dateField && sortHeader(dateField.name, 'Ngày', 'hidden sm:table-cell w-36')}
              {hasOrder && sortHeader('order', 'Thứ tự', 'hidden sm:table-cell w-20')}
            </tr>
          </thead>
          <tbody>
            {!entries && !error && (
              <tr>
                <td colSpan={colCount} className="text-[var(--wp-muted)]">
                  Đang tải…
                </td>
              </tr>
            )}
            {entries && shown.length === 0 && (
              <tr>
                <td colSpan={colCount} className="text-[var(--wp-muted)]">
                  Không tìm thấy {labels.singular} nào.
                </td>
              </tr>
            )}
            {shown.map((e) =>
              quickEdit === e.slug ? (
                <QuickEditRow
                  key={e.slug}
                  collection={collection}
                  entry={e}
                  colSpan={colCount}
                  onCancel={() => setQuickEdit(null)}
                  onSaved={(updated) => {
                    setEntries((list) => (list ?? []).map((x) => (x.slug === updated.slug ? updated : x)));
                    setQuickEdit(null);
                    notify({ type: 'success', text: `Đã cập nhật “${nameOf(updated)}”.` });
                  }}
                />
              ) : (
                <tr key={e.slug}>
                  <td className="!px-2">
                    <input
                      type="checkbox"
                      aria-label={`Chọn ${nameOf(e)}`}
                      checked={checked.includes(e.slug)}
                      onChange={() => setChecked((c) => (c.includes(e.slug) ? c.filter((x) => x !== e.slug) : [...c, e.slug]))}
                    />
                  </td>
                  {imageField && (
                    <td className="hidden sm:table-cell">
                      {e.data?.[imageField.name] ? (
                        <img src={e.data[imageField.name]} alt="" loading="lazy" className="w-12 h-12 object-cover wp-checker" />
                      ) : (
                        <span className="block w-12 h-12 bg-[#f0f0f1]" />
                      )}
                    </td>
                  )}
                  <td>
                    <a href={`#/c/${collection.name}/edit/${e.slug}`} className="font-semibold text-[15px]">
                      {nameOf(e)}
                    </a>
                    {isPublishStatus && statusOf(e) === 'Pending' && <strong className="text-[#50575e]"> — Bản nháp</strong>}
                    {e.data?.featured && <strong className="text-[#50575e]"> — Nổi bật</strong>}
                    <div className="md:hidden text-[13px] text-[var(--wp-muted)]">{columns.map((c) => cell(e, c)).filter((x) => x !== '—').join(' · ')}</div>
                    <div className="row-actions">
                      <a href={`#/c/${collection.name}/edit/${e.slug}`}>Chỉnh sửa</a>
                      {' | '}
                      <button type="button" className="text-[var(--wp-blue)] hover:underline" onClick={() => setQuickEdit(e.slug)}>
                        Sửa nhanh
                      </button>
                      {collection.delete !== false && (
                        <>
                          {' | '}
                          <button type="button" className="text-[var(--wp-red)] hover:underline" onClick={() => removeOne(e)}>
                            Bỏ vào thùng rác
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
                      {cell(e, c)}
                    </td>
                  ))}
                  {dateField && (
                    <td className="hidden sm:table-cell text-[13px]">
                      {isPublishStatus ? (statusOf(e) === 'Pending' ? 'Sửa lần cuối' : 'Đã xuất bản') : ''}
                      <br />
                      {formatDate(e.data?.[dateField.name])}
                    </td>
                  )}
                  {hasOrder && <td className="hidden sm:table-cell text-[13px]">{e.data?.order ?? '—'}</td>}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end mt-2">{pager}</div>
    </div>
  );
}

/** "Sửa nhanh": title, date, category, tags, status and order edited right in the table. */
function QuickEditRow({
  collection,
  entry,
  colSpan,
  onCancel,
  onSaved,
}: {
  collection: Collection;
  entry: Entry;
  colSpan: number;
  onCancel: () => void;
  onSaved: (entry: Entry) => void;
}) {
  const fields = collection.fields ?? [];
  const has = (name: string) => fields.find((f) => f.name === name);
  const tField = titleField(collection);
  const dateField = fields.find((f) => f.widget === 'datetime');
  const categoryField = fields.find((f) => f.name === 'category' && f.widget === 'select');
  const statusField = fields.find((f) => f.name === 'status' && f.widget === 'select');
  const [data, setData] = useState<Record<string, any>>(entry.data);
  const [tags, setTags] = useState(Array.isArray(entry.data.tags) ? entry.data.tags.join(', ') : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k: string, v: any) => setData((d) => ({ ...d, [k]: v }));

  const save = async () => {
    setSaving(true);
    setError('');
    const next = { ...data };
    if (has('tags')) {
      const list = tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      if (list.length) next.tags = list;
      else delete next.tags;
    }
    try {
      const res = await api.save(collection.name, entry.slug, next, entry.sha);
      onSaved({ slug: entry.slug, sha: res.sha, data: next });
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  const label = 'block text-[13px] text-[var(--wp-muted)] mb-0.5';
  return (
    <tr className="!bg-white">
      <td colSpan={colSpan} className="!p-4 border-y border-[#dcdcde]">
        <h3 className="m-0 mb-3 text-[12px] font-semibold uppercase text-[#1d2327]">Sửa nhanh</h3>
        <div className="grid gap-5 md:grid-cols-3">
          <div className="space-y-2.5">
            <div>
              <label className={label}>Tiêu đề</label>
              <input className="wp-input" value={data[tField] ?? ''} onChange={(e) => set(tField, e.target.value)} />
            </div>
            <div>
              <label className={label}>Đường dẫn</label>
              <input className="wp-input text-[var(--wp-muted)]" value={entry.slug} readOnly />
            </div>
            {dateField && (
              <div>
                <label className={label}>Ngày</label>
                <input type="date" className="wp-input !w-auto" value={String(data[dateField.name] ?? '').slice(0, 10)} onChange={(e) => set(dateField.name, e.target.value)} />
              </div>
            )}
          </div>
          {categoryField && (
            <div>
              <span className={label}>Danh mục</span>
              <div className="border border-[#dcdcde] p-2.5 max-h-44 overflow-y-auto space-y-1.5">
                {optionList(categoryField.options).map((o) => (
                  <label key={o.value} className="flex items-start gap-2 cursor-pointer">
                    <input type="radio" className="mt-1" checked={data.category === o.value} onChange={() => set('category', o.value)} />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-2.5">
            {has('tags') && (
              <div>
                <label className={label}>Thẻ (phân cách bằng dấu phẩy)</label>
                <textarea className="wp-input" rows={3} value={tags} onChange={(e) => setTags(e.target.value)} />
              </div>
            )}
            {statusField && (
              <div>
                <label className={label}>Trạng thái</label>
                <select className="wp-input !w-auto" value={data.status ?? ''} onChange={(e) => set('status', e.target.value)}>
                  {optionList(statusField.options).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.value === 'Published' ? 'Đã xuất bản' : o.value === 'Pending' ? 'Bản nháp' : o.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {has('featured') && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!data.featured} onChange={(e) => set('featured', e.target.checked)} /> Nổi bật (ghim lên đầu)
              </label>
            )}
            {has('order') && (
              <div>
                <label className={label}>Thứ tự</label>
                <input
                  type="number"
                  className="wp-input !w-24"
                  value={data.order ?? ''}
                  onChange={(e) => set('order', e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                />
              </div>
            )}
          </div>
        </div>
        {error && <div className="wp-notice wp-notice-error mt-3">{error}</div>}
        <div className="flex items-center gap-2 mt-4">
          <button type="button" className="wp-btn wp-btn-primary" disabled={saving} onClick={save}>
            {saving ? 'Đang lưu…' : 'Cập nhật'}
          </button>
          <button type="button" className="wp-btn" onClick={onCancel}>
            Hủy
          </button>
        </div>
      </td>
    </tr>
  );
}
