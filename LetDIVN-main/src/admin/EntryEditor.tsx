import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Eye, History, KeyRound } from 'lucide-react';
import { api, type Collection, type Entry, type Field } from './api';
import { useAdmin } from './AdminApp';
import { MetaBox, PageTitle, storage } from './Layout';
import { FieldInput, FieldRow, isRequired } from './fields';
import { blocksToHtml, blocksToText, type Block } from './blocks';
import { CategoryBox, Dot, FeaturedImageBox, RevisionsModal, ScreenMeta, SeoBox, TagsBox, useSeo } from './wpBoxes';
import { FILE_PATHS, SITE_PATHS, defaultsFor, formatDate, labelsFor, navigate, optionList, slugify, titleField, today } from './util';

// "Sửa bài viết" / "Viết bài mới": WordPress's classic post editor. Title and
// permalink on top, the TinyMCE editor, metaboxes below it and on the right
// (Xuất bản, Danh mục, Thẻ, Ảnh đại diện, SEO...), each movable and
// collapsible, with "Tùy chọn màn hình" to hide them.

const ClassicEditor = React.lazy(() => import('./ClassicEditor'));

const SAFE_SLUG = /^[a-z0-9][a-z0-9._-]*$/;
const SITE = 'https://letsdoitvietnam.online';

/** Where an entry shows up on the live site. */
function viewUrl(collection: Collection, slug: string | undefined, data: Record<string, any>) {
  if (collection.files) return FILE_PATHS[slug ?? ''] ?? SITE_PATHS[collection.name] ?? '/';
  if (collection.name === 'news' && slug) return `/news/${slug}/`;
  if (collection.name === 'events' && data.city) return `/explore-campaigns/${slugify(String(data.city))}/`;
  return SITE_PATHS[collection.name] ?? '/';
}

interface BoxDef {
  id: string;
  title: string;
  node: React.ReactNode;
  flush?: boolean;
}

export function EntryEditor({ collection, slug }: { collection: Collection; slug?: string }) {
  const { notify, setDirty } = useAdmin();
  const isNew = !slug;
  const file = collection.files?.find((f) => f.name === slug);
  const fields: Field[] = (file ? file.fields : collection.fields) ?? [];
  const labels = labelsFor(collection);

  const [loaded, setLoaded] = useState<{ sha?: string; data: Record<string, any> } | null>(null);
  const [data, setData] = useState<Record<string, any>>({});
  const [newSlug, setNewSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [editingSlug, setEditingSlug] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [editorKey, setEditorKey] = useState(0);
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [revisionCount, setRevisionCount] = useState<number | null>(null);
  const [showRevisions, setShowRevisions] = useState(false);
  // Which part of the Publish box is being edited ("Chỉnh sửa" links).
  const [editing, setEditing] = useState<'status' | 'visibility' | 'date' | null>(null);
  const [draftValue, setDraftValue] = useState<any>(null);

  // Box layout: order and visibility, remembered per collection.
  const orderKey = `wp-admin-order:${collection.name}`;
  const hiddenKey = `wp-admin-hidden:${collection.name}`;
  const [order, setOrder] = useState<{ main: string[]; side: string[] }>(() => storage.read(orderKey, { main: [], side: [] }));
  const [hidden, setHidden] = useState<string[]>(() => storage.read(hiddenKey, []));

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
    api.revisions(collection.name, slug!).then((r) => setRevisionCount(r.length), () => setRevisionCount(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection.name, slug]);

  const dirty = !!loaded && JSON.stringify(data) !== JSON.stringify(loaded.data);
  useEffect(() => {
    setDirty(dirty);
    return () => setDirty(false);
  }, [dirty, setDirty]);

  // --- Which field goes where ---------------------------------------------------
  const L = useMemo(() => {
    const folder = !!collection.folder;
    const find = (pred: (f: Field) => boolean) => (folder ? fields.find(pred) : undefined);
    const titleF = find((f) => f.name === titleField(collection));
    const bodyF = fields.find((f) => f.widget === 'list' && !!f.types);
    const statusF = find((f) => f.name === 'status' && f.widget === 'select' && optionList(f.options).some((o) => o.value === 'Published'));
    const featuredF = find((f) => f.name === 'featured' && f.widget === 'boolean');
    const dateF = find((f) => f.widget === 'datetime');
    const imageF = find((f) => f.widget === 'image');
    const categoryF = find((f) => f.name === 'category' && f.widget === 'select');
    const tagsF = find((f) => f.name === 'tags' && f.widget === 'list');
    const summaryF = bodyF ? find((f) => f.name === 'summary') : undefined;
    const hasSeo = folder && ['seoKeyphrase', 'seoTitle', 'seoDescription'].every((n) => fields.some((f) => f.name === n));
    const otherSelects = folder ? fields.filter((f) => f.widget === 'select' && f !== statusF && f !== categoryF) : [];
    const attributeF = folder ? fields.filter((f) => (f.name === 'order' && f.widget === 'number') || (f.widget === 'boolean' && f !== featuredF)) : [];
    const used = new Set<Field | undefined>([titleF, bodyF, statusF, featuredF, dateF, imageF, categoryF, tagsF, summaryF, ...otherSelects, ...attributeF]);
    const mainF = fields.filter((f) => !used.has(f) && f.widget !== 'hidden' && !(hasSeo && f.name.startsWith('seo')));
    return { titleF, bodyF, statusF, featuredF, dateF, imageF, categoryF, tagsF, summaryF, hasSeo, otherSelects, attributeF, mainF };
  }, [collection, fields]);

  // Categories ("Dùng nhiều nhất") and tags ("thẻ được dùng nhiều nhất") need the other entries.
  useEffect(() => {
    if (L.categoryF || L.tagsF) api.entries(collection.name).then(setEntries, () => setEntries([]));
  }, [collection.name, L.categoryF, L.tagsF]);

  const set = (name: string, value: any) => {
    setData((d) => {
      const next = { ...d };
      if (value === undefined) delete next[name];
      else next[name] = value;
      return next;
    });
  };

  // A new entry's file name follows its title until the permalink is edited by hand.
  const title = L.titleF ? String(data[L.titleF.name] ?? '') : '';
  useEffect(() => {
    if (isNew && !slugTouched) setNewSlug(slugify(title).slice(0, 80));
  }, [title, isNew, slugTouched]);

  const currentSlug = isNew ? newSlug : slug!;
  const isDraft = !!L.statusF && data.status === 'Pending';
  const bodyValue = L.bodyF ? data[L.bodyF.name] : undefined;
  const blocks: Block[] = useMemo(() => (Array.isArray(bodyValue) ? bodyValue : []), [bodyValue]);

  const seoInput = useMemo(
    () => ({
      keyphrase: String(data.seoKeyphrase ?? ''),
      title,
      seoTitle: String(data.seoTitle ?? ''),
      description: String(data.seoDescription || data.summary || ''),
      slug: currentSlug,
      html: blocksToHtml(blocks),
      text: blocksToText(blocks),
    }),
    [data.seoKeyphrase, data.seoTitle, data.seoDescription, data.summary, title, currentSlug, blocks]
  );
  const seoResult = useSeo(seoInput);

  const save = useCallback(
    async (status?: 'Published' | 'Pending') => {
      if (!loaded || saving) return;
      const next = { ...data };
      if (status && L.statusF) next.status = status;

      // Like WordPress: no excerpt = the start of the article; no featured
      // image = the first image in it.
      if (L.bodyF) {
        const body: Block[] = Array.isArray(next[L.bodyF.name]) ? next[L.bodyF.name] : [];
        if (L.summaryF && !String(next[L.summaryF.name] ?? '').trim()) {
          const intro = blocksToText(body).split(/\n{2,}/).find((p) => p.trim()) ?? '';
          if (intro) next[L.summaryF.name] = intro.length > 220 ? `${intro.slice(0, 220).replace(/\s+\S*$/, '')}…` : intro;
        }
        if (L.imageF && !next[L.imageF.name]) {
          const first = body.find((b) => b.type === 'image')?.value || /<img[^>]+src="([^"]+)"/.exec(blocksToHtml(body))?.[1];
          if (first) next[L.imageF.name] = first;
        }
      }

      // A draft may be saved half-written; only the title is needed.
      const draft = L.statusF && next.status === 'Pending';
      const missing = fields
        .filter((f) => (draft ? f === L.titleF : isRequired(f)) && ['string', 'text', 'image', 'datetime', 'select', undefined].includes(f.widget))
        .filter((f) => next[f.name] == null || String(next[f.name]).trim() === '')
        .map((f) => f.label || f.name);
      if (missing.length) {
        notify({ type: 'error', text: `Vui lòng điền: ${missing.join(', ')}.` });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (isNew && !SAFE_SLUG.test(newSlug)) {
        notify({ type: 'error', text: 'Đường dẫn chỉ gồm chữ thường không dấu, số và dấu gạch ngang.' });
        return;
      }

      setSaving(true);
      try {
        const res = await api.save(collection.name, currentSlug, next, loaded.sha);
        setLoaded({ sha: res.sha, data: next });
        setData(next);
        setDirty(false);
        setRevisionCount((n) => (n ?? 0) + 1);
        const verb = draft ? 'Đã lưu bản nháp' : isNew ? `Đã đăng ${labels.singular}` : `Đã cập nhật ${file ? `trang “${file.label}”` : labels.singular}`;
        notify({
          type: 'success',
          text: (
            <>
              {verb}.{' '}
              {!draft && (
                <a href={viewUrl(collection, currentSlug, next)} target="_blank" rel="noreferrer">
                  Xem {file ? 'trang' : labels.singular}
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
    [loaded, saving, data, L, fields, isNew, newSlug, collection, currentSlug, notify, setDirty, file, labels.singular]
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

  if (loadError) return <div className="wp-notice wp-notice-error">{loadError}</div>;
  if (!loaded) return <p className="text-[var(--wp-muted)]">Đang tải…</p>;

  const trash = async () => {
    if (!loaded.sha || !window.confirm(`Xóa vĩnh viễn ${labels.singular} “${title || slug}”? Không thể hoàn tác.`)) return;
    try {
      await api.remove(collection.name, slug!, loaded.sha);
      setDirty(false);
      notify({ type: 'success', text: `Đã xóa ${labels.singular} “${title || slug}”.` });
      navigate(`/c/${collection.name}`);
    } catch (err: any) {
      notify({ type: 'error', text: err.message });
    }
  };

  /** "Xem trước": the news page shows the unsaved version, handed over through localStorage. */
  const preview = () => {
    if (collection.name !== 'news') {
      window.open(viewUrl(collection, currentSlug, data), 'wp-preview');
      return;
    }
    storage.write('wp-admin-preview', { slug: currentSlug || 'xem-truoc', data });
    window.open(`/news/${currentSlug || 'xem-truoc'}/?preview=1`, 'wp-preview');
  };

  const heading = file ? `Sửa trang: ${file.label}` : isNew ? labels.add : `Sửa ${labels.singular}`;

  // --- Xuất bản ----------------------------------------------------------------------
  const editLink = (what: 'status' | 'visibility' | 'date', initial: any) =>
    editing !== what && (
      <button
        type="button"
        className="text-[var(--wp-blue)] underline ml-1"
        onClick={() => {
          setEditing(what);
          setDraftValue(initial);
        }}
      >
        Chỉnh sửa
      </button>
    );
  const okCancel = (apply: () => void) => (
    <div className="flex items-center gap-2 mt-2">
      <button
        type="button"
        className="wp-btn wp-btn-sm"
        onClick={() => {
          apply();
          setEditing(null);
        }}
      >
        OK
      </button>
      <button type="button" className="text-[var(--wp-blue)] underline text-[13px]" onClick={() => setEditing(null)}>
        Hủy
      </button>
    </div>
  );
  const row = 'flex items-start gap-2 py-1.5';
  const icon = 'w-4 h-4 mt-0.5 text-[#8c8f94] shrink-0';

  const publishBox = (
    <>
      <div className="p-3 space-y-1">
        <div className="flex items-center justify-between gap-2 pb-2">
          {L.statusF && (isNew || isDraft) ? (
            <button type="button" className="wp-btn" disabled={saving} onClick={() => save('Pending')}>
              Lưu nháp
            </button>
          ) : (
            <span />
          )}
          <button type="button" className="wp-btn" onClick={preview}>
            {collection.name === 'news' ? (dirty && !isNew ? 'Xem trước thay đổi' : 'Xem trước') : 'Xem trang'}
          </button>
        </div>

        {L.statusF && (
          <div className={row}>
            <KeyRound className={icon} />
            <div className="flex-1">
              Trạng thái: <strong>{isNew || isDraft ? 'Bản nháp' : 'Đã xuất bản'}</strong>
              {editLink('status', data.status ?? 'Published')}
              {editing === 'status' && (
                <>
                  <select className="wp-input !w-auto !min-h-[28px] !py-0 mt-1.5 text-[13px] block" value={draftValue} onChange={(e) => setDraftValue(e.target.value)}>
                    <option value="Published">Đã xuất bản</option>
                    <option value="Pending">Bản nháp</option>
                  </select>
                  {okCancel(() => set('status', draftValue))}
                </>
              )}
            </div>
          </div>
        )}

        {L.featuredF && (
          <div className={row}>
            <Eye className={icon} />
            <div className="flex-1">
              Hiển thị: <strong>Công khai{data.featured ? ', Nổi bật' : ''}</strong>
              {editLink('visibility', !!data.featured)}
              {editing === 'visibility' && (
                <>
                  <label className="flex items-center gap-2 mt-2">
                    <input type="radio" checked readOnly /> Công khai
                  </label>
                  <label className="flex items-center gap-2 mt-1.5 ml-5">
                    <input type="checkbox" checked={!!draftValue} onChange={(e) => setDraftValue(e.target.checked)} /> Nổi bật (ghim lên đầu)
                  </label>
                  {okCancel(() => set('featured', !!draftValue))}
                </>
              )}
            </div>
          </div>
        )}

        {!isNew && (
          <div className={row}>
            <History className={icon} />
            <div className="flex-1">
              Bản sửa đổi: <strong>{revisionCount ?? '…'}</strong>
              {!!revisionCount && (
                <button type="button" className="text-[var(--wp-blue)] underline ml-1" onClick={() => setShowRevisions(true)}>
                  Xem lại
                </button>
              )}
            </div>
          </div>
        )}

        {L.dateF && (
          <div className={row}>
            <CalendarDays className={icon} />
            <div className="flex-1">
              {isNew || isDraft ? 'Đăng vào' : 'Đã xuất bản lúc'}: <strong>{formatDate(data[L.dateF.name]) || 'ngay lập tức'}</strong>
              {editLink('date', String(data[L.dateF.name] ?? '').slice(0, 10))}
              {editing === 'date' && (
                <>
                  <input type="date" className="wp-input !w-auto !min-h-[28px] !py-0 mt-1.5 text-[13px] block" value={draftValue} onChange={(e) => setDraftValue(e.target.value)} />
                  {okCancel(() => set(L.dateF!.name, draftValue || today()))}
                </>
              )}
            </div>
          </div>
        )}

        {L.hasSeo && (
          <>
            <button type="button" className={`${row} w-full text-left`} onClick={() => document.getElementById('box-seo')?.scrollIntoView({ behavior: 'smooth' })}>
              <span className="mt-1">
                <Dot rating={seoResult.seoOverall.rating} />
              </span>
              <span>
                <span className="text-[var(--wp-blue)] underline">Phân tích SEO</span>: <strong>{seoResult.seoOverall.label}</strong>
              </span>
            </button>
            <button type="button" className={`${row} w-full text-left`} onClick={() => document.getElementById('box-seo')?.scrollIntoView({ behavior: 'smooth' })}>
              <span className="mt-1">
                <Dot rating={seoResult.readabilityOverall.rating} />
              </span>
              <span>
                <span className="text-[var(--wp-blue)] underline">Phân tích khả năng đọc</span>: <strong>{seoResult.readabilityOverall.label}</strong>
              </span>
            </button>
          </>
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
        <button
          type="button"
          className="wp-btn wp-btn-primary wp-btn-lg"
          disabled={saving}
          onClick={() => save(L.statusF && (isNew || isDraft) ? 'Published' : undefined)}
        >
          {saving ? 'Đang lưu…' : isNew || isDraft ? 'Đăng' : 'Cập nhật'}
        </button>
      </div>
    </>
  );

  // --- The other boxes --------------------------------------------------------------
  const side: BoxDef[] = [];
  if (L.categoryF) side.push({ id: 'category', title: 'Danh mục', node: <CategoryBox field={L.categoryF} value={data.category} onChange={(v) => set('category', v)} entries={entries} /> });
  if (L.tagsF) side.push({ id: 'tags', title: 'Thẻ', node: <TagsBox value={data.tags ?? []} onChange={(v) => set('tags', v.length ? v : undefined)} entries={entries} /> });
  if (L.imageF) {
    const imgLabel = L.imageF.name === 'image' && L.bodyF ? 'Ảnh đại diện' : L.imageF.label || 'Ảnh';
    side.push({
      id: 'image',
      title: imgLabel,
      node: <FeaturedImageBox value={data[L.imageF.name] ?? ''} onChange={(v) => set(L.imageF!.name, v)} label={imgLabel} hint={L.imageF.hint} />,
    });
  }
  L.otherSelects.forEach((f) =>
    side.push({ id: `select-${f.name}`, title: f.label || f.name, node: <CategoryBox field={f} value={data[f.name]} onChange={(v) => set(f.name, v)} entries={null} /> })
  );
  if (L.attributeF.length)
    side.push({
      id: 'attributes',
      title: 'Thuộc tính',
      node: (
        <div className="space-y-3">
          {L.attributeF.map((f) =>
            f.widget === 'boolean' ? (
              <label key={f.name} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!data[f.name]} onChange={(e) => set(f.name, e.target.checked)} /> {f.label}
              </label>
            ) : (
              <div key={f.name}>
                <label className="block font-semibold mb-1">{f.label}</label>
                <FieldInput field={f} value={data[f.name]} onChange={(v) => set(f.name, v)} />
                {f.hint && <p className="mt-1 mb-0 text-[12px] text-[var(--wp-muted)]">{f.hint}</p>}
              </div>
            )
          )}
        </div>
      ),
    });

  const main: BoxDef[] = [];
  if (L.hasSeo)
    main.push({
      id: 'seo',
      title: 'SEO',
      node: (
        <SeoBox
          input={{ ...seoInput, description: String(data.seoDescription ?? '') }}
          image={data.image}
          date={data.date}
          onChange={(k, v) => set(k, v || undefined)}
        />
      ),
    });
  if (L.summaryF)
    main.push({
      id: 'summary',
      title: L.summaryF.label || 'Tóm tắt',
      node: (
        <>
          <textarea className="wp-input" rows={4} value={data[L.summaryF.name] ?? ''} onChange={(e) => set(L.summaryF!.name, e.target.value)} />
          <p className="mt-1.5 mb-0 text-[13px] text-[var(--wp-muted)]">{L.summaryF.hint || 'Tóm tắt là phần mô tả ngắn hiện trong danh sách bài viết.'}</p>
        </>
      ),
    });
  if (L.mainF.length) {
    if (L.bodyF && collection.folder) {
      // Next to an article body, each remaining field gets a box of its own (like WordPress's "Tác giả").
      L.mainF.forEach((f) =>
        main.push({
          id: `field-${f.name}`,
          title: f.label || f.name,
          node: <FieldInput field={f} value={data[f.name]} onChange={(v) => set(f.name, v)} />,
        })
      );
    } else {
      main.push({
        id: 'details',
        title: file ? 'Nội dung trang' : `Thông tin ${labels.singular}`,
        node: (
          <>
            {file && <p className="mt-0 mb-2 text-[13px] text-[var(--wp-muted)]">Để trống một ô = website dùng chữ/ảnh có sẵn.</p>}
            {L.mainF.map((f) => (
              <FieldRow key={f.name} field={f} value={data[f.name]} onChange={(v) => set(f.name, v)} />
            ))}
          </>
        ),
      });
    }
  }

  const arrange = (boxes: BoxDef[], saved: string[]) => {
    const rank = (id: string) => (saved.includes(id) ? saved.indexOf(id) : saved.length + boxes.findIndex((b) => b.id === id));
    return [...boxes].sort((a, b) => rank(a.id) - rank(b.id));
  };
  const renderColumn = (col: 'main' | 'side', boxes: BoxDef[]) => {
    const list = arrange(boxes, order[col]);
    const visible = list.filter((b) => !hidden.includes(b.id));
    const move = (id: string, dir: -1 | 1) => {
      const ids = visible.map((b) => b.id);
      const i = ids.indexOf(id);
      const j = i + dir;
      if (j < 0 || j >= ids.length) return;
      [ids[i], ids[j]] = [ids[j], ids[i]];
      const next = { ...order, [col]: [...ids, ...list.map((b) => b.id).filter((x) => !ids.includes(x))] };
      setOrder(next);
      storage.write(orderKey, next);
    };
    return visible.map((b, i) => (
      <div key={b.id} id={`box-${b.id}`}>
        <MetaBox
          id={`${collection.name}:${b.id}`}
          title={b.title}
          flush={b.flush}
          onMoveUp={i > 0 ? () => move(b.id, -1) : undefined}
          onMoveDown={i < visible.length - 1 ? () => move(b.id, 1) : undefined}
        >
          {b.node}
        </MetaBox>
      </div>
    ));
  };

  const permalink = collection.name === 'news' || collection.name === 'events' ? `${SITE}${viewUrl(collection, currentSlug || '…', data)}` : null;

  return (
    <div>
      <ScreenMeta
        boxes={[...side, ...main].map((b) => ({ id: b.id, title: b.title }))}
        hidden={hidden}
        onToggle={(id) => {
          const next = hidden.includes(id) ? hidden.filter((h) => h !== id) : [...hidden, id];
          setHidden(next);
          storage.write(hiddenKey, next);
        }}
        help={
          <>
            <p className="mt-0">
              <strong>Soạn bài:</strong> gõ tiêu đề, rồi viết nội dung trong khung soạn thảo. Dùng thanh công cụ để in đậm, tạo tiêu đề, danh sách, chèn liên kết, bảng… Bấm <em>Thêm tệp</em> để chèn ảnh, hoặc kéo thả ảnh thẳng vào khung soạn thảo.
            </p>
            <p>
              <strong>Xuất bản:</strong> <em>Lưu nháp</em> để lưu mà chưa hiện lên website; <em>Đăng</em> / <em>Cập nhật</em> để đưa lên website (sau vài giây). <em>Xem trước</em> mở bài như trên website, kể cả phần chưa lưu. Phím tắt: Ctrl+S.
            </p>
            <p className="mb-0">
              <strong>Các hộp:</strong> bấm mũi tên ↑ ↓ để đổi vị trí, ▲ để thu gọn; bật/tắt hộp ở <em>Tùy chọn màn hình</em>. <em>Bản sửa đổi</em> cho xem và khôi phục các lần lưu trước.
            </p>
          </>
        }
      />
      <PageTitle
        action={
          collection.folder && collection.create !== false && !isNew ? (
            <a className="wp-btn" href={`#/c/${collection.name}/new`}>
              {collection.name === 'news' ? 'Thêm bài viết' : 'Thêm mới'}
            </a>
          ) : undefined
        }
      >
        {heading}
      </PageTitle>

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Main column */}
        <div className="flex-1 min-w-0 w-full space-y-5">
          {L.titleF && (
            <div>
              <input
                className="wp-input !text-[1.7em] !px-2.5 !py-1.5 !min-h-[48px]"
                placeholder="Thêm tiêu đề"
                value={title}
                onChange={(e) => set(L.titleF!.name, e.target.value)}
                autoFocus={isNew}
              />
              {permalink && (
                <div className="mt-2 text-[13px] text-[var(--wp-muted)] flex flex-wrap items-center gap-1.5 break-all">
                  <span className="font-semibold">Đường dẫn:</span>
                  {isNew && editingSlug ? (
                    <>
                      <span>{SITE}/news/</span>
                      <input
                        className="wp-input !w-64 !min-h-[26px] !py-0 text-[13px]"
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
                      {isNew || isDraft ? (
                        <span className="text-[#1d2327]">{permalink}</span>
                      ) : (
                        <a href={permalink} target="_blank" rel="noreferrer">
                          {permalink}
                        </a>
                      )}
                      {isNew && collection.name === 'news' && (
                        <button type="button" className="wp-btn wp-btn-sm" onClick={() => setEditingSlug(true)}>
                          Chỉnh sửa
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {collection.description && isNew && <p className="m-0 text-[13px] text-[var(--wp-muted)]">{collection.description}</p>}

          {L.bodyF && (
            <Suspense fallback={<div className="border border-[#dcdcde] bg-white min-h-[560px] flex items-center justify-center text-[var(--wp-muted)]">Đang tải trình soạn thảo…</div>}>
              <ClassicEditor key={editorKey} blocks={blocks} onChange={(b) => set(L.bodyF!.name, b)} />
            </Suspense>
          )}

          {renderColumn('main', main)}
        </div>

        {/* Right column */}
        <aside className="w-full lg:w-[280px] shrink-0 space-y-5">
          <MetaBox id={`${collection.name}:publish`} title="Xuất bản" flush>
            {publishBox}
          </MetaBox>
          {renderColumn('side', side)}
          {dirty && <p className="m-0 text-[12px] text-[var(--wp-muted)]">Có thay đổi chưa lưu (Ctrl+S để lưu).</p>}
        </aside>
      </div>

      {showRevisions && slug && (
        <RevisionsModal
          collection={collection.name}
          slug={slug}
          current={data}
          fields={fields}
          onClose={() => setShowRevisions(false)}
          onRestore={(restored) => {
            setData(restored);
            setEditorKey((k) => k + 1);
            setShowRevisions(false);
            notify({ type: 'info', text: 'Đã khôi phục bản sửa đổi vào trình soạn thảo. Bấm “Cập nhật” để lưu lại, hoặc tải lại trang để bỏ qua.' });
          }}
        />
      )}
    </div>
  );
}
