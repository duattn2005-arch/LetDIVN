import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Eye, KeyRound, ListOrdered, Pin } from 'lucide-react';
import { api, type Collection, type Field } from './api';
import { useAdmin } from './AdminApp';
import { MetaBox, PageTitle } from './Layout';
import { FieldInput, FieldRow, MediaInput, isRequired } from './fields';
import { RichTextEditor, type Block } from './RichTextEditor';
import { FILE_PATHS, SITE_PATHS, defaultsFor, formatDate, navigate, optionList, slugify, titleField, today } from './util';

// "Sửa bài viết" / "Thêm mới": title and permalink on top, the content
// editor below, metaboxes for the other fields, and the "Xuất bản" box on the
// right — the layout of WordPress's classic post editor.

const SAFE_SLUG = /^[a-z0-9][a-z0-9._-]*$/;

/** Where an entry shows up on the live site. */
function viewUrl(collection: Collection, slug: string | undefined, data: Record<string, any>) {
  if (collection.files) return FILE_PATHS[slug ?? ''] ?? SITE_PATHS[collection.name] ?? '/';
  if (collection.name === 'events' && data.city) return `/explore-campaigns/${slugify(String(data.city))}/`;
  return SITE_PATHS[collection.name] ?? '/';
}

export function EntryEditor({ collection, slug }: { collection: Collection; slug?: string }) {
  const { notify, setDirty } = useAdmin();
  const isNew = !slug;
  const file = collection.files?.find((f) => f.name === slug);
  const fields: Field[] = (file ? file.fields : collection.fields) ?? [];
  const singular = collection.label_singular || collection.label;

  const [loaded, setLoaded] = useState<{ sha?: string; data: Record<string, any> } | null>(null);
  const [data, setData] = useState<Record<string, any>>({});
  const [newSlug, setNewSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [editingSlug, setEditingSlug] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (isNew) {
      const initial = defaultsFor(fields);
      fields.filter((f) => f.widget === 'datetime' && !initial[f.name]).forEach((f) => (initial[f.name] = today()));
      setLoaded({ data: initial });
      setData(initial);
      return;
    }
    api.entry(collection.name, slug!).then(
      (e) => {
        setLoaded({ sha: e.sha, data: e.data });
        setData(e.data);
      },
      (err) => setLoadError(err.message)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection.name, slug]);

  const dirty = !!loaded && JSON.stringify(data) !== JSON.stringify(loaded.data);
  useEffect(() => {
    setDirty(dirty);
    return () => setDirty(false);
  }, [dirty, setDirty]);

  // --- Which field goes where ---------------------------------------------------
  const layout = useMemo(() => {
    const titleF = collection.folder ? fields.find((f) => f.name === titleField(collection)) : undefined;
    const bodyF = fields.find((f) => f.widget === 'list' && f.types);
    const statusF = fields.find((f) => f.name === 'status' && f.widget === 'select' && optionList(f.options).some((o) => o.value === 'Published'));
    const imageF = collection.folder ? fields.find((f) => f.widget === 'image') : undefined;
    const publishF = collection.folder
      ? fields.filter((f) => f !== statusF && (f.widget === 'datetime' || f.widget === 'boolean' || (f.name === 'order' && f.widget === 'number')))
      : [];
    const sideSelects = collection.folder ? fields.filter((f) => f.widget === 'select' && f !== statusF) : [];
    const used = new Set([titleF, bodyF, statusF, imageF, ...publishF, ...sideSelects].filter(Boolean));
    const mainF = fields.filter((f) => !used.has(f) && f.widget !== 'hidden');
    return { titleF, bodyF, statusF, imageF, publishF, sideSelects, mainF };
  }, [collection, fields]);

  const set = (name: string, value: any) => {
    setData((d) => {
      const next = { ...d };
      if (value === undefined) delete next[name];
      else next[name] = value;
      return next;
    });
  };

  // A new entry's file name follows its title until the permalink is edited by hand.
  const title = layout.titleF ? String(data[layout.titleF.name] ?? '') : '';
  useEffect(() => {
    if (isNew && !slugTouched) setNewSlug(slugify(title).slice(0, 80));
  }, [title, isNew, slugTouched]);

  const currentSlug = isNew ? newSlug : slug!;
  const isPending = layout.statusF && data.status === 'Pending';

  const save = useCallback(
    async (status?: 'Published' | 'Pending') => {
      if (!loaded || saving) return;
      const next = { ...data };
      if (status && layout.statusF) next.status = status;

      const missing = fields
        .filter((f) => isRequired(f) && ['string', 'text', 'image', 'datetime', 'select', undefined].includes(f.widget))
        .filter((f) => next[f.name] == null || String(next[f.name]).trim() === '')
        .map((f) => f.label || f.name);
      if (missing.length) {
        notify({ type: 'error', text: `Vui lòng điền: ${missing.join(', ')}.` });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (isNew && !SAFE_SLUG.test(newSlug)) {
        notify({ type: 'error', text: 'Đường dẫn tĩnh chỉ gồm chữ thường không dấu, số và dấu gạch ngang.' });
        return;
      }

      setSaving(true);
      try {
        const res = await api.save(collection.name, currentSlug, next, loaded.sha);
        setLoaded({ sha: res.sha, data: next });
        setData(next);
        setDirty(false);
        const verb = isNew ? (next.status === 'Pending' ? 'Đã lưu bản nháp' : 'Đã đăng') : next.status === 'Pending' ? 'Đã lưu bản nháp' : 'Đã cập nhật';
        notify({
          type: 'success',
          text: (
            <>
              {verb} {file ? `“${file.label}”` : singular}.{' '}
              {next.status !== 'Pending' && (
                <a href={viewUrl(collection, currentSlug, next)} target="_blank" rel="noreferrer">
                  Xem trên website
                </a>
              )}{' '}
              <span className="text-[var(--wp-muted)]">(website cập nhật sau vài giây)</span>
            </>
          ),
        });
        if (isNew) navigate(`/c/${collection.name}/edit/${currentSlug}`);
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err: any) {
        notify({ type: 'error', text: err.message });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } finally {
        setSaving(false);
      }
    },
    [loaded, saving, data, layout.statusF, fields, isNew, newSlug, collection, currentSlug, notify, setDirty, file, singular]
  );

  // Ctrl+S saves, like the WordPress editor.
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const trash = async () => {
    if (!loaded?.sha || !window.confirm(`Xóa vĩnh viễn ${singular} “${title || slug}”? Không thể hoàn tác.`)) return;
    try {
      await api.remove(collection.name, slug!, loaded.sha);
      setDirty(false);
      notify({ type: 'success', text: `Đã xóa ${singular} “${title || slug}”.` });
      navigate(`/c/${collection.name}`);
    } catch (err: any) {
      notify({ type: 'error', text: err.message });
    }
  };

  if (loadError) return <div className="wp-notice wp-notice-error">{loadError}</div>;
  if (!loaded) return <p className="text-[var(--wp-muted)]">Đang tải…</p>;

  const heading = file ? `Sửa trang: ${file.label}` : isNew ? `Thêm ${singular} mới` : `Sửa ${singular}`;

  // --- Right column -----------------------------------------------------------
  const publishBox = (
    <div className="wp-box">
      <div className="wp-box-title">Xuất bản</div>
      <div className="p-3 space-y-3">
        {!isNew && (
          <div className="flex justify-end">
            <a className="wp-btn" href={viewUrl(collection, slug, data)} target="_blank" rel="noreferrer">
              {isPending ? 'Xem trang' : 'Xem trên web'}
            </a>
          </div>
        )}
        {layout.statusF && (
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#8c8f94] shrink-0" />
            <span className="whitespace-nowrap">Trạng thái:</span>
            <select className="wp-input !w-auto !min-h-[28px] !py-0 text-[13px]" value={data.status ?? 'Published'} onChange={(e) => set('status', e.target.value)}>
              {optionList(layout.statusF.options).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.value === 'Published' ? 'Đã xuất bản' : o.value === 'Pending' ? 'Chờ duyệt (bản nháp)' : o.label}
                </option>
              ))}
            </select>
          </div>
        )}
        {layout.publishF.map((f) => (
          <div key={f.name} className="flex items-center gap-2 flex-wrap">
            {f.widget === 'datetime' ? (
              <>
                <CalendarDays className="w-4 h-4 text-[#8c8f94] shrink-0" />
                <span>{f.label}:</span>
                <input type="date" className="wp-input !w-auto !min-h-[28px] !py-0 text-[13px]" value={String(data[f.name] ?? '').slice(0, 10)} onChange={(e) => set(f.name, e.target.value)} />
              </>
            ) : f.widget === 'boolean' ? (
              <label className="flex items-center gap-2 cursor-pointer">
                <Pin className="w-4 h-4 text-[#8c8f94] shrink-0" />
                <input type="checkbox" checked={!!data[f.name]} onChange={(e) => set(f.name, e.target.checked)} />
                {f.label}
              </label>
            ) : (
              <>
                <ListOrdered className="w-4 h-4 text-[#8c8f94] shrink-0" />
                <span>{f.label}:</span>
                <input
                  type="number"
                  className="wp-input !w-20 !min-h-[28px] !py-0 text-[13px]"
                  value={data[f.name] ?? ''}
                  onChange={(e) => set(f.name, e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                />
              </>
            )}
            {f.hint && f.widget === 'number' && <span className="basis-full pl-6 text-[12px] text-[var(--wp-muted)]">{f.hint}</span>}
          </div>
        ))}
        {!isNew && loaded.data.date && !layout.publishF.some((f) => f.widget === 'datetime') && (
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#8c8f94]" /> Ngày: {formatDate(loaded.data.date)}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-[#f6f7f7] border-t border-[#dcdcde]">
        {!isNew && collection.folder && collection.delete !== false ? (
          <button type="button" onClick={trash} className="text-[13px] text-[var(--wp-red)] underline hover:text-[#8a2424]">
            Bỏ vào thùng rác
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          {layout.statusF && (isNew || isPending) && (
            <button type="button" className="wp-btn" disabled={saving} onClick={() => save('Pending')}>
              Lưu nháp
            </button>
          )}
          <button
            type="button"
            className="wp-btn wp-btn-primary"
            disabled={saving}
            onClick={() => save(layout.statusF && (isNew || isPending) ? 'Published' : undefined)}
          >
            {saving ? 'Đang lưu…' : isNew || isPending ? 'Đăng' : 'Cập nhật'}
          </button>
        </div>
      </div>
    </div>
  );

  const selectBox = (f: Field) => {
    const options = optionList(f.options);
    return (
      <MetaBox key={f.name} title={f.label || f.name}>
        {options.length <= 6 ? (
          <div className="space-y-1.5">
            {options.map((o) => (
              <label key={o.value} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name={f.name} checked={(data[f.name] ?? f.default) === o.value} onChange={() => set(f.name, o.value)} />
                {o.label}
              </label>
            ))}
          </div>
        ) : (
          <FieldInput field={f} value={data[f.name]} onChange={(v) => set(f.name, v)} />
        )}
        {f.hint && <p className="mt-2 mb-0 text-[12px] text-[var(--wp-muted)]">{f.hint}</p>}
      </MetaBox>
    );
  };

  return (
    <div>
      <PageTitle
        action={
          collection.folder && collection.create !== false && !isNew ? (
            <a className="wp-btn" href={`#/c/${collection.name}/new`}>
              Thêm mới
            </a>
          ) : undefined
        }
      >
        {heading}
      </PageTitle>

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Main column */}
        <div className="flex-1 min-w-0 w-full space-y-5">
          {layout.titleF && (
            <div>
              <input
                className="wp-input !text-[1.7em] !px-2.5 !py-1.5 !min-h-[48px]"
                placeholder="Thêm tiêu đề"
                value={title}
                onChange={(e) => set(layout.titleF!.name, e.target.value)}
                autoFocus={isNew}
              />
              <div className="mt-2 text-[13px] text-[var(--wp-muted)] flex flex-wrap items-center gap-1.5">
                <span className="font-semibold">Đường dẫn tĩnh:</span>
                {isNew && editingSlug ? (
                  <>
                    <input
                      className="wp-input !w-72 !min-h-[26px] !py-0 text-[13px]"
                      value={newSlug}
                      autoFocus
                      onChange={(e) => {
                        setSlugTouched(true);
                        setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '-'));
                      }}
                    />
                    <button type="button" className="wp-btn wp-btn-sm" onClick={() => setEditingSlug(false)}>
                      OK
                    </button>
                  </>
                ) : (
                  <>
                    <code className="bg-transparent text-[#1d2327]">{currentSlug || '—'}</code>
                    {isNew && (
                      <button type="button" className="wp-btn wp-btn-sm" onClick={() => setEditingSlug(true)}>
                        Chỉnh sửa
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {collection.description && isNew && <p className="m-0 text-[13px] text-[var(--wp-muted)]">{collection.description}</p>}

          {layout.bodyF && (
            <RichTextEditor
              blocks={(Array.isArray(data[layout.bodyF.name]) ? data[layout.bodyF.name] : []) as Block[]}
              onChange={(blocks) => set(layout.bodyF!.name, blocks)}
            />
          )}

          {layout.mainF.length > 0 && (
            <MetaBox title={file ? 'Nội dung trang' : layout.bodyF ? 'Thông tin thêm' : `Thông tin ${singular}`}>
              {file && <p className="mt-0 mb-2 text-[13px] text-[var(--wp-muted)]">Để trống một ô = website dùng chữ/ảnh có sẵn.</p>}
              {layout.mainF.map((f) => (
                <FieldRow key={f.name} field={f} value={data[f.name]} onChange={(v) => set(f.name, v)} />
              ))}
            </MetaBox>
          )}
        </div>

        {/* Right column */}
        <aside className="w-full lg:w-[280px] shrink-0 space-y-5 lg:sticky lg:top-12">
          {publishBox}
          {layout.sideSelects.map(selectBox)}
          {layout.imageF && (
            <MetaBox title={layout.imageF.label || 'Ảnh đại diện'}>
              <MediaInput value={data[layout.imageF.name] ?? ''} onChange={(v) => set(layout.imageF!.name, v)} />
              {layout.imageF.hint && <p className="mt-2 mb-0 text-[12px] text-[var(--wp-muted)]">{layout.imageF.hint}</p>}
            </MetaBox>
          )}
          {dirty && (
            <p className="m-0 text-[12px] text-[var(--wp-muted)] flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> Có thay đổi chưa lưu (Ctrl+S để lưu).
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
