import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, FileText, ImagePlus, Plus, Trash2, X } from 'lucide-react';
import { api, type Entry, type Field } from './api';
import { MediaLibrary } from './MediaLibrary';
import { defaultsFor, isImageUrl, optionList, renderTemplate } from './util';

// Form controls for the Decap widgets used in config.yml: string, text,
// number, boolean, select, datetime, image, file, hidden, object, list
// (single `field`, `fields` or typed `types`) and relation.

type OnChange = (value: any) => void;

export const isRequired = (f: Field) => f.required !== false && f.widget !== 'hidden' && f.widget !== 'boolean';

export function FieldRow({ field, value, onChange }: { field: Field; value: any; onChange: OnChange }) {
  if (field.widget === 'hidden') return null;
  const nested = field.widget === 'object' || field.widget === 'list';
  return (
    <div className="py-3 border-b border-[#f0f0f1] last:border-b-0">
      {!nested && (
        <label className="block font-semibold text-[#1d2327] mb-1">
          {field.label || field.name}
          {isRequired(field) && <span className="text-[var(--wp-red)]"> *</span>}
        </label>
      )}
      <FieldInput field={field} value={value} onChange={onChange} />
      {field.hint && <p className="mt-1 mb-0 text-[13px] italic text-[var(--wp-muted)]">{field.hint}</p>}
    </div>
  );
}

export function FieldInput({ field, value, onChange }: { field: Field; value: any; onChange: OnChange }) {
  switch (field.widget) {
    case 'text':
      return <AutoTextarea value={value ?? ''} onChange={onChange} />;
    case 'number':
      return (
        <input
          type="number"
          className="wp-input !w-40"
          value={value ?? ''}
          min={field.min}
          max={field.max}
          step={field.value_type === 'float' ? 'any' : 1}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === '' ? undefined : field.value_type === 'float' ? parseFloat(v) : parseInt(v, 10));
          }}
        />
      );
    case 'boolean':
      return (
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          <span>Bật</span>
        </label>
      );
    case 'select':
      return (
        <select className="wp-input !w-auto max-w-full" value={value ?? ''} onChange={(e) => onChange(e.target.value || undefined)}>
          {(!isRequired(field) || value == null || value === '') && <option value="">— Không chọn —</option>}
          {optionList(field.options).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case 'datetime':
      return <input type="date" className="wp-input !w-48" value={String(value ?? '').slice(0, 10)} onChange={(e) => onChange(e.target.value)} />;
    case 'image':
    case 'file':
      return <MediaInput kind={field.widget === 'file' ? 'file' : 'image'} value={value ?? ''} onChange={onChange} />;
    case 'object':
      return <ObjectInput field={field} value={value} onChange={onChange} />;
    case 'list':
      return <ListInput field={field} value={value} onChange={onChange} />;
    case 'relation':
      return <RelationInput field={field} value={value} onChange={onChange} />;
    default:
      return <input className="wp-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
  }
}

function AutoTextarea({ value, onChange }: { value: string; onChange: OnChange }) {
  const rows = Math.min(16, Math.max(3, String(value).split('\n').length + Math.floor(String(value).length / 90)));
  return <textarea className="wp-input" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />;
}

/** An image/file picker: preview, "Chọn ảnh" (media library), remove, and the URL itself. */
export function MediaInput({ value, onChange, kind = 'image' }: { value: string; onChange: OnChange; kind?: 'image' | 'file' }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2">
      {value &&
        (kind === 'image' || isImageUrl(value) ? (
          <button type="button" onClick={() => setOpen(true)} className="block wp-checker border border-[#dcdcde]" title="Đổi ảnh">
            <img src={value} alt="" className="block max-h-44 max-w-full object-contain" />
          </button>
        ) : (
          <a href={value} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 break-all">
            <FileText className="w-4 h-4 shrink-0" /> {decodeURIComponent(value.split('/').pop() || value)}
          </a>
        ))}
      <div className="flex flex-wrap gap-2">
        <button type="button" className="wp-btn wp-btn-sm" onClick={() => setOpen(true)}>
          <ImagePlus className="w-3.5 h-3.5" /> {value ? 'Thay đổi' : kind === 'file' ? 'Chọn tập tin' : 'Chọn ảnh'}
        </button>
        {value && (
          <button type="button" className="text-[13px] text-[var(--wp-red)] underline" onClick={() => onChange('')}>
            Xóa
          </button>
        )}
      </div>
      <input className="wp-input text-[12px] text-[var(--wp-muted)]" placeholder="…hoặc dán đường dẫn" value={value} onChange={(e) => onChange(e.target.value)} />
      {open && (
        <MediaLibrary
          mode="modal"
          kind={kind}
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

function ObjectInput({ field, value, onChange }: { field: Field; value: any; onChange: OnChange }) {
  const [open, setOpen] = useState(!field.collapsed);
  const data = value && typeof value === 'object' ? value : {};
  const summary = field.summary ? renderTemplate(field.summary, data) : '';
  return (
    <div className="border border-[#dcdcde] bg-white">
      <button type="button" onClick={() => setOpen(!open)} className="flex items-center gap-2 w-full px-3 py-2 bg-[#f6f7f7] text-left">
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? '' : '-rotate-90'}`} />
        <span className="font-semibold text-[#1d2327]">{field.label || field.name}</span>
        {!open && summary && <span className="text-[13px] text-[var(--wp-muted)] truncate">— {summary}</span>}
      </button>
      {open && (
        <div className="px-3">
          {(field.fields ?? []).map((f) => (
            <FieldRow key={f.name} field={f} value={data[f.name]} onChange={(v) => onChange({ ...data, [f.name]: v })} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Up / down / remove buttons shared by list rows. */
function RowControls({ index, count, onMove, onRemove }: { index: number; count: number; onMove: (to: number) => void; onRemove: () => void }) {
  const btn = 'p-1 text-[#787c82] hover:text-[var(--wp-blue)] disabled:opacity-30 disabled:hover:text-[#787c82]';
  return (
    <span className="flex items-center shrink-0">
      <button type="button" className={btn} disabled={index === 0} onClick={() => onMove(index - 1)} title="Lên trên">
        <ArrowUp className="w-4 h-4" />
      </button>
      <button type="button" className={btn} disabled={index === count - 1} onClick={() => onMove(index + 1)} title="Xuống dưới">
        <ArrowDown className="w-4 h-4" />
      </button>
      <button type="button" className="p-1 text-[#787c82] hover:text-[var(--wp-red)]" onClick={onRemove} title="Xóa">
        <Trash2 className="w-4 h-4" />
      </button>
    </span>
  );
}

const move = <T,>(list: T[], from: number, to: number) => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

function ListInput({ field, value, onChange }: { field: Field; value: any; onChange: OnChange }) {
  const items: any[] = Array.isArray(value) ? value : [];
  const singular = field.label_singular || 'mục';
  const [picking, setPicking] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const header = (
    <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[#f6f7f7] border-b border-[#dcdcde]">
      <span className="font-semibold text-[#1d2327]">
        {field.label || field.name} <span className="font-normal text-[var(--wp-muted)]">({items.length})</span>
      </span>
    </div>
  );

  // A list of images (photo galleries): a thumbnail grid, filled from the media library.
  if (field.field && field.field.widget === 'image') {
    return (
      <div className="border border-[#dcdcde] bg-white">
        {header}
        <div className="p-3">
          <ul className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(110px,1fr))] p-0 m-0 list-none">
            {items.map((url, i) => (
              <li key={`${url}-${i}`} className="border border-[#dcdcde] bg-white">
                <img src={url} alt="" className="w-full aspect-[4/3] object-cover wp-checker" />
                <div className="flex justify-center">
                  <RowControls index={i} count={items.length} onMove={(to) => onChange(move(items, i, to))} onRemove={() => onChange(items.filter((_, j) => j !== i))} />
                </div>
              </li>
            ))}
          </ul>
          <button type="button" className="wp-btn wp-btn-sm mt-3" onClick={() => setPicking(true)}>
            <Plus className="w-3.5 h-3.5" /> Thêm {singular}
          </button>
        </div>
        {picking && (
          <MediaLibrary
            mode="modal"
            multiple
            buttonLabel="Thêm vào bộ ảnh"
            onSelect={(urls) => {
              onChange([...items, ...urls]);
              setPicking(false);
            }}
            onClose={() => setPicking(false)}
          />
        )}
      </div>
    );
  }

  // A list of single values (paragraphs, bullet lines, ...).
  if (field.field) {
    const inner = field.field;
    return (
      <div className="border border-[#dcdcde] bg-white">
        {header}
        <div className="p-3 space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <FieldInput field={inner} value={item} onChange={(v) => onChange(items.map((x, j) => (j === i ? v : x)))} />
              </div>
              <RowControls index={i} count={items.length} onMove={(to) => onChange(move(items, i, to))} onRemove={() => onChange(items.filter((_, j) => j !== i))} />
            </div>
          ))}
          <button type="button" className="wp-btn wp-btn-sm" onClick={() => onChange([...items, inner.widget === 'object' ? defaultsFor(inner.fields) : ''])}>
            <Plus className="w-3.5 h-3.5" /> Thêm {singular}
          </button>
        </div>
      </div>
    );
  }

  // A list of objects (sections, schedule rows, ...) or typed blocks: collapsible cards.
  const fieldsFor = (item: any): Field[] =>
    field.types ? field.types.find((t) => t.name === item?.type)?.fields ?? [] : field.fields ?? [];
  const summaryOf = (item: any, i: number) => {
    const type = field.types?.find((t) => t.name === item?.type);
    const text =
      (field.summary && renderTemplate(field.summary, item ?? {})) ||
      (type?.summary && renderTemplate(type.summary, item ?? {})) ||
      String(Object.values(item ?? {}).find((v) => typeof v === 'string' && v.trim()) ?? '');
    return `${type ? `${type.label}: ` : ''}${text || `${singular} ${i + 1}`}`;
  };
  const addItem = (type?: Field) => {
    const base = defaultsFor(type ? type.fields : field.fields);
    onChange([...items, type ? { type: type.name, ...base } : base]);
    setOpenIndex(items.length);
  };

  return (
    <div className="border border-[#dcdcde] bg-white">
      {header}
      <div className="p-3 space-y-2">
        {items.map((item, i) => {
          const open = openIndex === i;
          return (
            <div key={i} className="border border-[#dcdcde]">
              <div className="flex items-center gap-2 pl-2 pr-1 bg-white">
                <button type="button" onClick={() => setOpenIndex(open ? null : i)} className="flex-1 min-w-0 flex items-center gap-2 py-2 text-left">
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? '' : '-rotate-90'}`} />
                  <span className="truncate">{summaryOf(item, i)}</span>
                </button>
                <RowControls
                  index={i}
                  count={items.length}
                  onMove={(to) => {
                    onChange(move(items, i, to));
                    if (open) setOpenIndex(to);
                  }}
                  onRemove={() => {
                    if (!window.confirm(`Xóa ${singular} này?`)) return;
                    onChange(items.filter((_, j) => j !== i));
                    setOpenIndex(null);
                  }}
                />
              </div>
              {open && (
                <div className="px-3 border-t border-[#dcdcde] bg-[#fcfcfc]">
                  {fieldsFor(item).map((f) => (
                    <FieldRow key={f.name} field={f} value={item?.[f.name]} onChange={(v) => onChange(items.map((x, j) => (j === i ? { ...x, [f.name]: v } : x)))} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div className="flex flex-wrap gap-2">
          {field.types ? (
            field.types.map((t) => (
              <button key={t.name} type="button" className="wp-btn wp-btn-sm" onClick={() => addItem(t)}>
                <Plus className="w-3.5 h-3.5" /> {t.label}
              </button>
            ))
          ) : (
            <button type="button" className="wp-btn wp-btn-sm" onClick={() => addItem()}>
              <Plus className="w-3.5 h-3.5" /> Thêm {singular}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Picks entries of another collection (e.g. the news shown on the homepage), in order. */
function RelationInput({ field, value, onChange }: { field: Field; value: any; onChange: OnChange }) {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [query, setQuery] = useState('');
  useEffect(() => {
    if (field.collection) api.entries(field.collection).then(setEntries, () => setEntries([]));
  }, [field.collection]);

  const multiple = field.multiple;
  const selected: string[] = multiple ? (Array.isArray(value) ? value : []) : value ? [value] : [];
  const valueOf = (e: Entry) => (!field.value_field || field.value_field === '{{slug}}' ? e.slug : String(e.data[field.value_field] ?? e.slug));
  const labelOf = (v: string) => {
    const e = entries?.find((x) => valueOf(x) === v);
    return e ? (field.display_fields ?? ['title']).map((k) => e.data[k]).filter(Boolean).join(' · ') || v : v;
  };
  const set = (list: string[]) => onChange(multiple ? list : list[0] ?? '');

  const q = query.trim().toLowerCase();
  const options = (entries ?? [])
    .filter((e) => !selected.includes(valueOf(e)))
    .filter((e) => !q || JSON.stringify(e.data).toLowerCase().includes(q))
    .sort((a, b) => String(b.data.date ?? '').localeCompare(String(a.data.date ?? '')))
    .slice(0, 12);

  return (
    <div className="border border-[#dcdcde] bg-white">
      <div className="px-3 py-2 bg-[#f6f7f7] border-b border-[#dcdcde] font-semibold text-[#1d2327]">{field.label}</div>
      <div className="p-3 space-y-2">
        {selected.length > 0 && (
          <ol className="m-0 pl-5 space-y-1">
            {selected.map((v, i) => (
              <li key={v}>
                <div className="flex items-center gap-2">
                  <span className="flex-1 min-w-0 truncate">{labelOf(v)}</span>
                  <RowControls index={i} count={selected.length} onMove={(to) => set(move(selected, i, to))} onRemove={() => set(selected.filter((x) => x !== v))} />
                </div>
              </li>
            ))}
          </ol>
        )}
        {(multiple || !selected.length) && (
          <div>
            <input className="wp-input" placeholder={entries ? 'Tìm để thêm…' : 'Đang tải…'} value={query} onChange={(e) => setQuery(e.target.value)} />
            {q && (
              <ul className="m-0 mt-1 p-0 list-none border border-[#dcdcde] max-h-64 overflow-y-auto">
                {options.length === 0 && <li className="px-3 py-2 text-[var(--wp-muted)]">Không có kết quả.</li>}
                {options.map((e) => (
                  <li key={e.slug}>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-1.5 hover:bg-[#f0f6fc]"
                      onClick={() => {
                        set([...selected, valueOf(e)]);
                        setQuery('');
                      }}
                    >
                      {labelOf(valueOf(e))}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {!multiple && selected.length > 0 && (
          <button type="button" className="text-[13px] text-[var(--wp-red)] underline inline-flex items-center gap-1" onClick={() => set([])}>
            <X className="w-3 h-3" /> Bỏ chọn
          </button>
        )}
      </div>
    </div>
  );
}
