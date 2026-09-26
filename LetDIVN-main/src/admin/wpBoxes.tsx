import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Monitor, Smartphone, X } from 'lucide-react';
import { api, type Entry, type Field, type Revision } from './api';
import { MediaLibrary } from './MediaLibrary';
import { overall, RATING_COLOR, readabilityChecks, seoChecks, SITE_HOST, type Check, type Rating, type SeoInput } from './seo';
import { formatDate, formatDateTime, optionList } from './util';

// The metaboxes of WordPress's post editor, besides "Xuất bản" (EntryEditor):
// Danh mục, Thẻ, Ảnh đại diện, the Yoast-style SEO box, revisions, and the
// "Tùy chọn màn hình" / "Hỗ trợ" tabs at the top of the screen.

export const Dot = ({ rating }: { rating: Rating | 'none' }) => (
  <span className="inline-block w-3 h-3 rounded-full shrink-0" style={{ background: RATING_COLOR[rating] }} />
);

// --- Danh mục ----------------------------------------------------------------------

export function CategoryBox({ field, value, onChange, entries }: { field: Field; value: string; onChange: (v: string) => void; entries: Entry[] | null }) {
  const [tab, setTab] = useState<'all' | 'popular'>('all');
  const options = optionList(field.options);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    (entries ?? []).forEach((e) => (c[e.data?.[field.name]] = (c[e.data?.[field.name]] ?? 0) + 1));
    return c;
  }, [entries, field.name]);
  const shown = tab === 'all' ? options : [...options].filter((o) => counts[o.value]).sort((a, b) => (counts[b.value] ?? 0) - (counts[a.value] ?? 0));
  const current = value ?? field.default;
  return (
    <div>
      <div className="flex text-[13px] -mb-px">
        {(['all', 'popular'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-2.5 py-1.5 border ${tab === t ? 'border-[#dcdcde] border-b-white bg-white text-[#1d2327]' : 'border-transparent text-[var(--wp-blue)]'}`}
          >
            {t === 'all' ? (field.name === 'category' ? 'Tất cả danh mục' : 'Tất cả') : 'Dùng nhiều nhất'}
          </button>
        ))}
      </div>
      <ul className="m-0 p-2.5 list-none border border-[#dcdcde] max-h-52 overflow-y-auto space-y-1.5 bg-white">
        {shown.map((o) => (
          <li key={o.value}>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="radio" name={`cat-${field.name}`} className="mt-1" checked={current === o.value} onChange={() => onChange(o.value)} />
              <span>{o.label}</span>
            </label>
          </li>
        ))}
        {!shown.length && <li className="text-[var(--wp-muted)]">Chưa có.</li>}
      </ul>
      {field.hint && <p className="mt-2 mb-0 text-[12px] text-[var(--wp-muted)]">{field.hint}</p>}
    </div>
  );
}

// --- Thẻ ---------------------------------------------------------------------------

export function TagsBox({ value, onChange, entries }: { value: string[]; onChange: (v: string[]) => void; entries: Entry[] | null }) {
  const [input, setInput] = useState('');
  const [showCloud, setShowCloud] = useState(false);
  const tags = Array.isArray(value) ? value : [];
  const add = (raw: string) => {
    const next = [...tags];
    raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((t) => !next.some((x) => x.toLowerCase() === t.toLowerCase()) && next.push(t));
    onChange(next);
    setInput('');
  };
  const cloud = useMemo(() => {
    const c = new Map<string, number>();
    (entries ?? []).forEach((e) => (Array.isArray(e.data?.tags) ? e.data.tags : []).forEach((t: string) => c.set(t, (c.get(t) ?? 0) + 1)));
    return [...c].sort((a, b) => b[1] - a[1]).slice(0, 40);
  }, [entries]);

  return (
    <div>
      <div className="flex gap-2">
        <input
          className="wp-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add(input);
            }
          }}
        />
        <button type="button" className="wp-btn" onClick={() => add(input)}>
          Thêm
        </button>
      </div>
      <p className="mt-1.5 mb-2 text-[13px] italic text-[var(--wp-muted)]">Phân cách các thẻ bằng dấu phẩy</p>
      <ul className="m-0 p-0 list-none space-y-1">
        {tags.map((t) => (
          <li key={t} className="flex items-start gap-1.5">
            <button type="button" aria-label={`Xóa thẻ ${t}`} onClick={() => onChange(tags.filter((x) => x !== t))} className="mt-0.5 text-[var(--wp-blue)] hover:text-[var(--wp-red)]">
              <X className="w-4 h-4" />
            </button>
            <span>{t}</span>
          </li>
        ))}
      </ul>
      {cloud.length > 0 && (
        <div className="mt-3">
          <button type="button" className="text-[13px] text-[var(--wp-blue)] underline" onClick={() => setShowCloud(!showCloud)}>
            Chọn từ những thẻ được dùng nhiều nhất
          </button>
          {showCloud && (
            <div className="mt-2 flex flex-wrap gap-x-2.5 gap-y-1">
              {cloud.map(([t, n]) => (
                <button key={t} type="button" onClick={() => add(t)} className="text-[var(--wp-blue)] hover:underline" style={{ fontSize: `${Math.min(20, 12 + n * 2)}px` }}>
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Ảnh đại diện ------------------------------------------------------------------

export function FeaturedImageBox({ value, onChange, label = 'ảnh đại diện', hint }: { value: string; onChange: (v: string) => void; label?: string; hint?: string }) {
  const [open, setOpen] = useState(false);
  const noun = label.toLowerCase();
  return (
    <div>
      {value ? (
        <>
          <button type="button" onClick={() => setOpen(true)} className="block w-full wp-checker border border-[#dcdcde]" title={`Sửa hoặc cập nhật ${noun}`}>
            <img src={value} alt="" className="block w-full max-h-64 object-contain" />
          </button>
          <p className="mt-2 mb-1 text-[13px] text-[var(--wp-muted)]">Nhấn vào ảnh để sửa hoặc cập nhật</p>
          <button type="button" className="text-[13px] text-[var(--wp-red)] underline" onClick={() => onChange('')}>
            Xóa {noun}
          </button>
        </>
      ) : (
        <button type="button" className="text-[var(--wp-blue)] underline" onClick={() => setOpen(true)}>
          Đặt {noun}
        </button>
      )}
      {hint && <p className="mt-2 mb-0 text-[12px] text-[var(--wp-muted)]">{hint}</p>}
      {open && (
        <MediaLibrary
          mode="modal"
          title={label.charAt(0).toUpperCase() + label.slice(1)}
          buttonLabel={`Đặt ${noun}`}
          onSelect={([url]) => {
            onChange(url);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

// --- SEO (Yoast-style) ---------------------------------------------------------------

function LengthBar({ length, min, max }: { length: number; min: number; max: number }) {
  const rating: Rating = !length ? 'bad' : length < min ? 'ok' : length > max ? 'bad' : 'good';
  return (
    <div className="h-1.5 mt-1.5 bg-[#dcdcde] rounded">
      <div className="h-full rounded transition-all" style={{ width: `${Math.min(100, (length / (max * 1.15)) * 100)}%`, background: RATING_COLOR[rating] }} />
    </div>
  );
}

function CheckList({ checks }: { checks: Check[] }) {
  const order: Record<Rating, number> = { bad: 0, ok: 1, good: 2 };
  const groups: [Rating, string][] = [
    ['bad', 'Vấn đề'],
    ['ok', 'Cần cải thiện'],
    ['good', 'Kết quả tốt'],
  ];
  return (
    <div className="space-y-3">
      {groups.map(([rating, title]) => {
        const list = checks.filter((c) => c.rating === rating).sort((a, b) => order[a.rating] - order[b.rating]);
        if (!list.length) return null;
        return (
          <div key={rating}>
            <h4 className="m-0 mb-1.5 text-[13px] font-semibold text-[#1d2327]">
              {title} ({list.length})
            </h4>
            <ul className="m-0 p-0 list-none space-y-1.5">
              {list.map((c, i) => (
                <li key={i} className="flex gap-2 items-start text-[13px]">
                  <span className="mt-1">
                    <Dot rating={c.rating} />
                  </span>
                  <span>{c.text}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export function useSeo(input: SeoInput) {
  const seo = useMemo(() => seoChecks(input), [input]);
  const readability = useMemo(() => readabilityChecks(input), [input]);
  return {
    seo,
    readability,
    seoOverall: overall(seo, true, input.keyphrase),
    readabilityOverall: overall(readability),
  };
}

export function SeoBox({
  input,
  image,
  date,
  onChange,
}: {
  input: SeoInput;
  image?: string;
  date?: string;
  onChange: (field: 'seoKeyphrase' | 'seoTitle' | 'seoDescription', value: string) => void;
}) {
  const [tab, setTab] = useState<'seo' | 'readability' | 'social'>('seo');
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');
  const { seo, readability, seoOverall, readabilityOverall } = useSeo(input);
  const title = input.seoTitle || input.title;
  const description = input.description;
  const url = `${SITE_HOST} › news › ${input.slug}`;
  const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n).trimEnd()} …` : s);

  return (
    <div>
      <div className="flex flex-wrap border-b border-[#dcdcde] -mx-3 -mt-3 mb-4 px-3 pt-2 bg-[#f6f7f7]">
        {(
          [
            ['seo', 'SEO', seoOverall.rating],
            ['readability', 'Tính dễ đọc', readabilityOverall.rating],
            ['social', 'Mạng xã hội', null],
          ] as const
        ).map(([key, label, rating]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-3 py-2 -mb-px border text-[14px] ${
              tab === key ? 'bg-white border-[#dcdcde] border-b-white text-[#1d2327]' : 'border-transparent text-[var(--wp-blue)]'
            }`}
          >
            {rating && <Dot rating={rating} />} {label}
          </button>
        ))}
      </div>

      {tab === 'seo' && (
        <div className="space-y-5 max-w-[720px]">
          <div>
            <label className="block font-semibold text-[#1d2327] mb-1">Cụm từ khóa chính</label>
            <input className="wp-input" value={input.keyphrase} onChange={(e) => onChange('seoKeyphrase', e.target.value)} />
            <p className="mt-1 mb-0 text-[13px] text-[var(--wp-muted)]">Cụm từ chính mà bạn muốn người ta tìm thấy bài viết này trên Google.</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-[#1d2327]">Xem trước trên Google</span>
              <div className="flex rounded-full border border-[#8c8f94] overflow-hidden text-[13px]">
                {(['mobile', 'desktop'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDevice(d)}
                    className={`flex items-center gap-1 px-2.5 py-1 ${device === d ? 'bg-[#a4286a] text-white' : 'text-[#1d2327]'}`}
                  >
                    {d === 'mobile' ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
                    {d === 'mobile' ? 'Điện thoại' : 'Máy tính'}
                  </button>
                ))}
              </div>
            </div>
            <div className={`border border-[#dcdcde] rounded-lg bg-white p-4 shadow-sm ${device === 'mobile' ? 'max-w-[400px]' : 'max-w-[600px]'}`} style={{ fontFamily: 'Arial, sans-serif' }}>
              <div className="flex items-center gap-2.5 mb-1.5">
                <img src="/logo.png" alt="" className="w-7 h-7 rounded-full border border-[#ecedef] object-contain bg-white" />
                <div className="leading-tight">
                  <div className="text-[14px] text-[#202124]">Let's Do It! Vietnam</div>
                  <div className="text-[12px] text-[#4d5156]">{url}</div>
                </div>
              </div>
              <div className={`text-[#1a0dab] ${device === 'mobile' ? 'text-[18px]' : 'text-[20px]'} leading-snug`}>{cut(title || 'Tiêu đề bài viết', device === 'mobile' ? 78 : 60)}</div>
              <div className="flex gap-3 mt-1">
                <div className="text-[14px] text-[#4d5156] leading-snug flex-1">
                  {date && <span className="text-[#70757a]">{formatDate(date)} — </span>}
                  {cut(description || 'Hãy nhập mô tả meta ở bên dưới. Nếu để trống, Google sẽ tự lấy một đoạn trong bài.', 156)}
                </div>
                {device === 'mobile' && image && <img src={image} alt="" className="w-[104px] h-[104px] object-cover rounded-lg shrink-0" />}
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#1d2327] mb-1">Tiêu đề SEO</label>
            <input className="wp-input" placeholder={input.title} value={input.seoTitle} onChange={(e) => onChange('seoTitle', e.target.value)} />
            <LengthBar length={title.length} min={30} max={60} />
            <p className="mt-1 mb-0 text-[13px] text-[var(--wp-muted)]">Để trống = dùng tiêu đề bài viết. Nên dưới 60 ký tự ({title.length}).</p>
          </div>

          <div>
            <label className="block font-semibold text-[#1d2327] mb-1">Mô tả meta</label>
            <textarea className="wp-input" rows={3} value={input.description} onChange={(e) => onChange('seoDescription', e.target.value)} />
            <LengthBar length={description.length} min={120} max={156} />
            <p className="mt-1 mb-0 text-[13px] text-[var(--wp-muted)]">Đoạn mô tả hiện dưới tiêu đề trên Google. Nên 120–156 ký tự ({description.length}).</p>
          </div>

          <details open className="border-t border-[#dcdcde] pt-3">
            <summary className="cursor-pointer font-semibold text-[#1d2327] flex items-center gap-2">
              <Dot rating={seoOverall.rating} /> Phân tích SEO: {seoOverall.label}
            </summary>
            <div className="mt-3">
              <CheckList checks={seo} />
            </div>
          </details>
        </div>
      )}

      {tab === 'readability' && (
        <div className="max-w-[720px]">
          <p className="mt-0 flex items-center gap-2 font-semibold text-[#1d2327]">
            <Dot rating={readabilityOverall.rating} /> Phân tích khả năng đọc: {readabilityOverall.label}
          </p>
          <CheckList checks={readability} />
        </div>
      )}

      {tab === 'social' && (
        <div className="max-w-[527px]">
          <p className="mt-0 text-[13px] text-[var(--wp-muted)]">Khi chia sẻ link bài viết lên Facebook, Zalo…, bài sẽ hiện như sau (dùng ảnh đại diện, tiêu đề SEO và mô tả meta):</p>
          <div className="border border-[#dadde1] bg-white" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
            {image ? <img src={image} alt="" className="w-full aspect-[1.91/1] object-cover" /> : <div className="w-full aspect-[1.91/1] bg-[#f0f2f5] flex items-center justify-center text-[#8a8d91] text-[13px]">Chưa có ảnh đại diện</div>}
            <div className="px-3 py-2.5 bg-[#f2f3f5] border-t border-[#dadde1]">
              <div className="text-[12px] uppercase text-[#606770]">{SITE_HOST}</div>
              <div className="text-[16px] font-semibold text-[#1d2129] leading-snug">{cut(title || 'Tiêu đề bài viết', 88)}</div>
              <div className="text-[14px] text-[#606770] leading-snug">{cut(description, 110)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Bản sửa đổi ------------------------------------------------------------------

/** Lists an entry's revisions (its GitHub commits) and restores one into the editor. */
export function RevisionsModal({
  collection,
  slug,
  current,
  fields,
  onRestore,
  onClose,
}: {
  collection: string;
  slug: string;
  current: Record<string, any>;
  fields: Field[];
  onRestore: (data: Record<string, any>) => void;
  onClose: () => void;
}) {
  const [revisions, setRevisions] = useState<Revision[] | null>(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Revision | null>(null);
  const [data, setData] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    api.revisions(collection, slug).then(setRevisions, (e) => setError(e.message));
  }, [collection, slug]);

  useEffect(() => {
    if (!selected) return;
    setData(null);
    api.revision(collection, slug, selected.sha).then((r) => setData(r.data), (e) => setError(e.message));
  }, [selected, collection, slug]);

  const label = (name: string) => fields.find((f) => f.name === name)?.label || name;
  const changed = data ? [...new Set([...Object.keys(data), ...Object.keys(current)])].filter((k) => JSON.stringify(data[k]) !== JSON.stringify(current[k])) : [];

  return (
    <div className="fixed inset-0 z-[1400] bg-black/70 flex items-stretch justify-center p-0 sm:p-8" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-[1100px] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-4 h-[50px] border-b border-[#dcdcde] shrink-0">
          <h2 className="text-[20px] font-semibold text-[#1d2327] m-0">Các bản sửa đổi</h2>
          <button type="button" onClick={onClose} className="p-2 text-[#787c82] hover:text-[var(--wp-blue)]" aria-label="Đóng">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 min-h-0 flex flex-col md:flex-row">
          <ul className="m-0 p-0 list-none md:w-80 shrink-0 border-b md:border-b-0 md:border-r border-[#dcdcde] overflow-y-auto max-h-60 md:max-h-none">
            {error && <li className="p-3 text-[var(--wp-red)]">{error}</li>}
            {!revisions && !error && <li className="p-3 text-[var(--wp-muted)]">Đang tải…</li>}
            {revisions?.map((r, i) => (
              <li key={r.sha}>
                <button
                  type="button"
                  onClick={() => setSelected(r)}
                  className={`w-full text-left px-3 py-2 border-b border-[#f0f0f1] ${selected?.sha === r.sha ? 'bg-[#f0f6fc] border-l-4 border-l-[var(--wp-blue)]' : 'hover:bg-[#f6f7f7]'}`}
                >
                  <div className="font-semibold text-[13px] text-[#1d2327]">
                    {formatDateTime(r.date)} {i === 0 && <span className="font-normal text-[var(--wp-muted)]">(hiện tại)</span>}
                  </div>
                  <div className="text-[12px] text-[var(--wp-muted)] truncate">
                    {r.author} · {r.message}
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <div className="flex-1 min-w-0 overflow-y-auto p-4">
            {!selected ? (
              <p className="text-[var(--wp-muted)] m-0">Chọn một bản sửa đổi bên trái để xem và khôi phục.</p>
            ) : !data ? (
              <p className="text-[var(--wp-muted)] m-0">Đang tải bản sửa đổi…</p>
            ) : (
              <div className="space-y-3">
                <p className="m-0">
                  <strong>{formatDateTime(selected.date)}</strong> bởi {selected.author}
                </p>
                {changed.length === 0 ? (
                  <p className="m-0 text-[var(--wp-muted)]">Bản này giống hệt nội dung đang mở.</p>
                ) : (
                  <>
                    <p className="m-0 text-[13px] text-[var(--wp-muted)]">Khác với nội dung đang mở ở: {changed.map(label).join(', ')}.</p>
                    {changed.map((k) => (
                      <div key={k} className="border border-[#dcdcde]">
                        <div className="px-3 py-1.5 bg-[#f6f7f7] border-b border-[#dcdcde] font-semibold text-[13px]">{label(k)}</div>
                        <div className="grid md:grid-cols-2 text-[12px]">
                          <pre className="m-0 p-2.5 whitespace-pre-wrap break-words bg-[#fcf0f1] max-h-60 overflow-y-auto">{preview(data[k])}</pre>
                          <pre className="m-0 p-2.5 whitespace-pre-wrap break-words bg-[#edfaef] max-h-60 overflow-y-auto">{preview(current[k])}</pre>
                        </div>
                      </div>
                    ))}
                    <p className="m-0 text-[12px] text-[var(--wp-muted)]">Trái (đỏ): bản sửa đổi này · Phải (xanh): nội dung đang mở.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-[#dcdcde] shrink-0">
          <button type="button" className="wp-btn" onClick={onClose}>
            Đóng
          </button>
          <button type="button" className="wp-btn wp-btn-primary" disabled={!data || !changed.length} onClick={() => data && onRestore(data)}>
            Khôi phục bản sửa đổi này
          </button>
        </div>
      </div>
    </div>
  );
}

const preview = (v: unknown) => {
  if (v == null || v === '') return '(trống)';
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && v.every((b) => b && typeof b === 'object' && 'type' in b && 'value' in b))
    return v.map((b: any) => (b.type === 'image' ? `[Ảnh] ${b.value}` : String(b.value).replace(/<[^>]+>/g, ''))).join('\n\n');
  return JSON.stringify(v, null, 2);
};

// --- Tùy chọn màn hình / Hỗ trợ ------------------------------------------------------

export function ScreenMeta({
  boxes,
  hidden,
  onToggle,
  help,
}: {
  boxes: { id: string; title: string }[];
  hidden: string[];
  onToggle: (id: string) => void;
  help: React.ReactNode;
}) {
  const [open, setOpen] = useState<'options' | 'help' | null>(null);
  const tab = (key: 'options' | 'help', label: string) => (
    <button
      type="button"
      onClick={() => setOpen(open === key ? null : key)}
      className={`flex items-center gap-1 px-3 h-7 text-[13px] text-[var(--wp-muted)] bg-white border border-[#dcdcde] border-t-0 rounded-b shadow-sm hover:text-[#1d2327] ${open === key ? 'text-[#1d2327]' : ''}`}
    >
      {label} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open === key ? 'rotate-180' : ''}`} />
    </button>
  );
  return (
    <div className="-mt-5 mb-3">
      {open && (
        <div className="bg-white border border-[#dcdcde] border-t-0 px-5 py-4 shadow-sm">
          {open === 'options' ? (
            <fieldset className="border-0 p-0 m-0">
              <legend className="font-semibold text-[#1d2327] mb-2">Các hộp</legend>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {boxes.map((b) => (
                  <label key={b.id} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={!hidden.includes(b.id)} onChange={() => onToggle(b.id)} />
                    {b.title}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : (
            <div className="text-[13px] leading-relaxed max-w-3xl">{help}</div>
          )}
        </div>
      )}
      <div className="flex justify-end gap-1.5">
        {tab('options', 'Tùy chọn màn hình')}
        {tab('help', 'Hỗ trợ')}
      </div>
    </div>
  );
}
