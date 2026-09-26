import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, FileText, Search, Upload, X } from 'lucide-react';
import { api, type MediaItem } from './api';
import { PageTitle } from './Layout';
import { formatBytes, isImageUrl, prepareUpload } from './util';

// The media library: a page of its own (#/media) and the "Thêm media" /
// "Chọn ảnh" popup used by the editors. Files live in public/images/ of the
// repo; uploads go to /images/cms/<year>/<month>/.

const PAGE_SIZE = 80;

let cachedItems: MediaItem[] | null = null;

/** Uploaded files first (newest month first), then the rest by folder. */
const sortMedia = (items: MediaItem[]) =>
  [...items].sort((a, b) => {
    const ua = /^\/images\/cms\/\d{4}\//.test(a.url);
    const ub = /^\/images\/cms\/\d{4}\//.test(b.url);
    if (ua !== ub) return ua ? -1 : 1;
    return ua ? b.url.localeCompare(a.url) : a.url.localeCompare(b.url);
  });

const folderOf = (url: string) => url.split('/').slice(2, 3)[0] || '';
const fileName = (url: string) => decodeURIComponent(url.split('/').pop() || url);

export function MediaLibrary({
  mode,
  openUpload = false,
  multiple = false,
  kind = 'image',
  title,
  buttonLabel,
  onSelect,
  onClose,
}: {
  mode: 'page' | 'modal';
  openUpload?: boolean;
  multiple?: boolean;
  /** 'file' also lists and accepts PDFs. */
  kind?: 'image' | 'file';
  title?: string;
  buttonLabel?: string;
  onSelect?: (urls: string[]) => void;
  onClose?: () => void;
}) {
  const [items, setItems] = useState<MediaItem[] | null>(cachedItems);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'upload' | 'library'>(openUpload ? 'upload' : 'library');
  const [query, setQuery] = useState('');
  const [folder, setFolder] = useState('');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<string[]>([]);
  const [uploading, setUploading] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.media().then(
      (list) => {
        cachedItems = sortMedia(list);
        setItems(cachedItems);
      },
      (err) => setError(err.message)
    );
  }, []);

  useEffect(() => {
    if (mode !== 'modal') return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [mode, onClose]);

  const accepted = (url: string) => kind === 'file' || isImageUrl(url);
  const folders = useMemo(() => [...new Set((items ?? []).filter((i) => accepted(i.url)).map((i) => folderOf(i.url)))].sort(), [items]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items ?? []).filter((i) => accepted(i.url) && (!folder || folderOf(i.url) === folder) && (!q || i.url.toLowerCase().includes(q)));
  }, [items, query, folder]);

  const uploadFiles = async (files: FileList | File[]) => {
    const list = [...files];
    if (!list.length) return;
    setTab('library');
    setError('');
    const done: string[] = [];
    for (const original of list) {
      setUploading((u) => [...u, original.name]);
      try {
        const item = await api.upload(await prepareUpload(original));
        done.push(item.url);
        cachedItems = [item, ...(cachedItems ?? []).filter((i) => i.url !== item.url)];
        setItems(cachedItems);
      } catch (err: any) {
        setError(`${original.name}: ${err.message}`);
      } finally {
        setUploading((u) => u.filter((n) => n !== original.name));
      }
    }
    setFolder('');
    setQuery('');
    if (done.length) setSelected(multiple ? (s) => [...s, ...done] : [done[done.length - 1]]);
  };

  const toggle = (url: string) => {
    setSelected((s) => (s.includes(url) ? s.filter((u) => u !== url) : multiple ? [...s, url] : [url]));
  };

  const detail = selected[selected.length - 1];
  const detailItem = items?.find((i) => i.url === detail);

  const uploader = (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        uploadFiles(e.dataTransfer.files);
      }}
      className={`flex flex-col items-center justify-center gap-3 border-4 border-dashed rounded py-16 px-4 text-center ${
        dragOver ? 'border-[var(--wp-blue)] bg-[#f0f6fc]' : 'border-[#c3c4c7] bg-white'
      }`}
    >
      <p className="text-[20px] text-[#1d2327] m-0">Thả tập tin vào đây để tải lên</p>
      <p className="m-0 text-[var(--wp-muted)]">hoặc</p>
      <button type="button" className="wp-btn wp-btn-lg" onClick={() => inputRef.current?.click()}>
        Chọn tập tin
      </button>
      <p className="m-0 text-[13px] text-[var(--wp-muted)]">
        Dung lượng tối đa: 15 MB. Ảnh lớn được tự thu nhỏ trước khi tải lên.
      </p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={kind === 'file' ? 'image/*,application/pdf' : 'image/*'}
        className="hidden"
        onChange={(e) => {
          if (e.target.files) uploadFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <select className="wp-input !w-auto" value={folder} onChange={(e) => setFolder(e.target.value)}>
        <option value="">Tất cả thư mục</option>
        {folders.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>
      <div className="relative ml-auto w-full sm:w-64">
        <Search className="w-4 h-4 absolute left-2 top-2 text-[#8c8f94]" />
        <input className="wp-input !pl-8" placeholder="Tìm kiếm media…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
    </div>
  );

  const grid = (
    <>
      {uploading.length > 0 && (
        <div className="wp-notice wp-notice-info mb-3">Đang tải lên: {uploading.join(', ')}…</div>
      )}
      {error && <div className="wp-notice wp-notice-error mb-3">{error}</div>}
      {!items ? (
        <p className="text-[var(--wp-muted)]">Đang tải thư viện…</p>
      ) : visible.length === 0 ? (
        <p className="text-[var(--wp-muted)]">Không tìm thấy media nào.</p>
      ) : (
        <>
          <ul className="grid gap-2.5 grid-cols-[repeat(auto-fill,minmax(120px,1fr))] p-0 m-0 list-none">
            {visible.slice(0, limit).map((item) => {
              const isSel = selected.includes(item.url);
              return (
                <li key={item.url}>
                  <button
                    type="button"
                    onClick={() => toggle(item.url)}
                    title={fileName(item.url)}
                    className={`relative block w-full aspect-square wp-checker overflow-hidden ${
                      isSel ? 'outline-[3px] outline outline-[var(--wp-blue)] outline-offset-[-3px]' : 'shadow-[inset_0_0_0_1px_rgba(0,0,0,.1)]'
                    }`}
                  >
                    {isImageUrl(item.url) ? (
                      <img src={item.url} alt="" loading="lazy" className="w-full h-full object-contain" />
                    ) : (
                      <span className="flex flex-col items-center justify-center h-full gap-1 p-2 bg-[#f6f7f7] text-[12px] break-all">
                        <FileText className="w-8 h-8 text-[#8c8f94]" />
                        {fileName(item.url)}
                      </span>
                    )}
                    {isSel && (
                      <span className="absolute top-1 right-1 w-6 h-6 bg-[var(--wp-blue)] text-white flex items-center justify-center shadow">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          {visible.length > limit && (
            <div className="text-center mt-4">
              <p className="text-[var(--wp-muted)] text-[13px]">
                Đang hiện {limit} trên {visible.length} tập tin
              </p>
              <button type="button" className="wp-btn" onClick={() => setLimit(limit + PAGE_SIZE)}>
                Tải thêm
              </button>
            </div>
          )}
        </>
      )}
    </>
  );

  const details = detail && (
    <div className="space-y-2 text-[13px]">
      <h3 className="text-[12px] font-semibold uppercase text-[var(--wp-muted)] m-0">Chi tiết tập tin</h3>
      {isImageUrl(detail) && <img src={detail} alt="" className="max-w-full max-h-48 object-contain wp-checker" />}
      <div className="font-semibold break-all">{fileName(detail)}</div>
      {detailItem && detailItem.size > 0 && <div className="text-[var(--wp-muted)]">{formatBytes(detailItem.size)}</div>}
      <label className="block text-[var(--wp-muted)]">Đường dẫn tập tin</label>
      <input className="wp-input text-[12px]" readOnly value={detail} onFocus={(e) => e.target.select()} />
      <div className="flex gap-2">
        <button
          type="button"
          className="wp-btn wp-btn-sm"
          onClick={() => navigator.clipboard?.writeText(new URL(detail, window.location.origin).href)}
        >
          Sao chép URL
        </button>
        <a className="wp-btn wp-btn-sm" href={detail} target="_blank" rel="noreferrer">
          Mở
        </a>
      </div>
    </div>
  );

  if (mode === 'page') {
    return (
      <div>
        <PageTitle
          action={
            <button type="button" className="wp-btn" onClick={() => setTab(tab === 'upload' ? 'library' : 'upload')}>
              <Upload className="w-4 h-4" /> Thêm tập tin mới
            </button>
          }
        >
          Thư viện media
        </PageTitle>
        {tab === 'upload' && <div className="mb-5">{uploader}</div>}
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="flex-1 min-w-0">
            {toolbar}
            {grid}
          </div>
          {details && <aside className="lg:w-72 shrink-0 wp-box p-3 self-start lg:sticky lg:top-12">{details}</aside>}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1400] bg-black/70 flex items-stretch justify-center p-0 sm:p-8" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="bg-white w-full max-w-[1400px] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-4 h-[50px] border-b border-[#dcdcde] shrink-0">
          <h2 className="text-[20px] font-semibold text-[#1d2327] m-0">{title || (kind === 'file' ? 'Chọn tập tin' : 'Chọn ảnh')}</h2>
          <button type="button" onClick={onClose} className="p-2 text-[#787c82] hover:text-[var(--wp-blue)]" aria-label="Đóng">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex gap-4 px-4 border-b border-[#dcdcde] shrink-0">
          {(['upload', 'library'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`py-2.5 -mb-px border-b-4 ${tab === t ? 'border-[var(--wp-blue)] text-[#1d2327] font-semibold' : 'border-transparent text-[var(--wp-blue)]'}`}
            >
              {t === 'upload' ? 'Tải tập tin lên' : 'Thư viện media'}
            </button>
          ))}
        </div>
        <div className="flex-1 min-h-0 flex">
          <div className="flex-1 overflow-y-auto p-4">{tab === 'upload' ? uploader : <>{toolbar}{grid}</>}</div>
          {tab === 'library' && details && <aside className="hidden md:block w-72 shrink-0 border-l border-[#dcdcde] bg-[#f6f7f7] p-4 overflow-y-auto">{details}</aside>}
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[#dcdcde] shrink-0">
          <span className="text-[13px] text-[var(--wp-muted)]">
            {selected.length > 0 && (
              <>
                Đã chọn {selected.length}{' '}
                <button type="button" className="text-[var(--wp-red)] underline" onClick={() => setSelected([])}>
                  Bỏ chọn
                </button>
              </>
            )}
          </span>
          <button type="button" className="wp-btn wp-btn-primary wp-btn-lg" disabled={!selected.length} onClick={() => onSelect?.(selected)}>
            {buttonLabel || 'Chọn'}
          </button>
        </div>
      </div>
    </div>
  );
}
