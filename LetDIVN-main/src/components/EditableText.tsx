import React, { useState, useEffect } from 'react';
import { Edit3, Check, X, Palette, AlignLeft, AlignCenter, AlignRight, AlignJustify, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { dbService } from '../services/dbService';

interface EditableTextProps {
  /** Unique key this piece of text is stored under (e.g. 'whoWeAre.heroTitle') */
  contentKey: string;
  /** Text shown until an admin overrides it */
  defaultValue: string;
  /** Wrapper element tag when no custom `render` is given */
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'li' | 'label';
  className?: string;
  multiline?: boolean;
  /** Custom renderer, e.g. to keep the value inside an <a href="mailto:..."> */
  render?: (value: string) => React.ReactNode;
}

export const EditableText: React.FC<EditableTextProps> = ({
  contentKey,
  defaultValue,
  as: Tag = 'span',
  className = '',
  multiline = false,
  render,
}) => {
  const { isAdmin } = useAuth();
  const { language } = useLanguage();

  const langSpecificKey = language === 'vi' ? contentKey : `${contentKey}__${language}`;
  const colorKey = `${contentKey}__color`;
  const alignKey = `${contentKey}__align`;
  const colorsKey = `${contentKey}__colors`;

  const parseColors = (raw: string): string[] => {
    try {
      const arr = JSON.parse(raw || '[]');
      return Array.isArray(arr) ? arr.filter((c) => typeof c === 'string') : [];
    } catch {
      return [];
    }
  };

  // `value` starts as defaultValue (known synchronously) so there's no flash
  // of blank content while the first fetch is in flight.
  const [value, setValue] = useState(defaultValue);
  const [color, setColor] = useState('');
  const [align, setAlign] = useState('');
  // Custom "chạy nhiều màu" set — 2+ hex colors the gradient animation cycles
  // through. Empty means "use the default built-in rainbow (or the single
  // static `color` above, if one is set)".
  const [colors, setColors] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [draftColor, setDraftColor] = useState(color);
  const [draftAlign, setDraftAlign] = useState(align);
  const [draftColors, setDraftColors] = useState<string[]>(colors);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const [nextVal, nextColor, nextAlign, nextColorsRaw] = await Promise.all([
        dbService.getContent(langSpecificKey, defaultValue),
        dbService.getContent(colorKey, ''),
        dbService.getContent(alignKey, ''),
        dbService.getContent(colorsKey, ''),
      ]);
      if (cancelled) return;
      const nextColors = parseColors(nextColorsRaw);
      setValue(nextVal);
      setColor(nextColor);
      setAlign(nextAlign);
      setColors(nextColors);
      setIsEditing((editing) => {
        if (!editing) {
          setDraft(nextVal);
          setDraftColor(nextColor);
          setDraftAlign(nextAlign);
          setDraftColors(nextColors);
        }
        return editing;
      });
    };
    refresh();
    const unsub = dbService.subscribe(refresh);
    return () => {
      cancelled = true;
      unsub();
    };
  }, [langSpecificKey, defaultValue, contentKey, language, colorKey, alignKey, colorsKey]);

  const handleSave = async () => {
    // An accidentally-cleared field must fall back to the default text, not
    // persist as a permanent blank — dbService.getContent uses `??`, which
    // only falls back on a missing key, so a saved "" would stick forever.
    await Promise.all([
      draft.trim() ? dbService.setContent(langSpecificKey, draft) : dbService.resetContent(langSpecificKey),
      draftColor ? dbService.setContent(colorKey, draftColor) : dbService.resetContent(colorKey),
      draftAlign ? dbService.setContent(alignKey, draftAlign) : dbService.resetContent(alignKey),
      draftColors.length >= 2 ? dbService.setContent(colorsKey, JSON.stringify(draftColors)) : dbService.resetContent(colorsKey),
    ]);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(value);
    setDraftColor(color);
    setDraftAlign(align);
    setDraftColors(colors);
    setIsEditing(false);
  };

  const handleResetToOriginal = async () => {
    await Promise.all([
      dbService.resetContent(langSpecificKey),
      dbService.resetContent(colorKey),
      dbService.resetContent(alignKey),
      dbService.resetContent(colorsKey),
    ]);
    setDraft(defaultValue);
    setDraftColor('');
    setDraftAlign('');
    setDraftColors([]);
    setValue(defaultValue);
    setColor('');
    setAlign('');
    setColors([]);
    setIsEditing(false);
  };

  // Lets an admin start editing by simply highlighting (selecting) some of the
  // displayed text with the mouse, instead of always having to hit the pencil icon.
  const handleMouseUpToEdit = () => {
    if (!isAdmin) return;
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setDraft(value);
      setDraftColor(color);
      setDraftAlign(align);
      setDraftColors(colors);
      setIsEditing(true);
    }
  };

  const startEditing = () => {
    setDraft(value);
    setDraftColor(color);
    setDraftAlign(align);
    setDraftColors(colors);
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl + Enter or Cmd + Enter to quickly save
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  const resolvedValue = (value && value.trim()) ? value : defaultValue;

  // Priority: 2+ custom "running colors" > single static color > (fall through
  // to the default built-in rainbow CSS class, when neither is set).
  const displayStyle: React.CSSProperties | undefined = (colors.length >= 2 || color || align)
    ? {
        ...(colors.length >= 2
          ? {
              backgroundImage: `linear-gradient(90deg, ${[...colors, colors[0]].join(', ')})`,
              backgroundSize: '800px 100%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              animation: 'gradient-flow-pixel 3.5s linear infinite',
              display: 'inline-block',
            }
          : color
          ? {
              color,
              WebkitTextFillColor: color,
              background: 'none',
              animation: 'none',
              filter: 'none',
            }
          : {}),
        ...(align ? { textAlign: align as React.CSSProperties['textAlign'] } : {}),
      }
    : undefined;

  if (!isAdmin) {
    return render ? (
      <span style={displayStyle}>{render(resolvedValue)}</span>
    ) : (
      <Tag className={`whitespace-pre-line ${className}`} style={displayStyle}>{resolvedValue}</Tag>
    );
  }

  if (isEditing) {
    const lineCount = (draft || '').split('\n').length;
    const calcRows = Math.min(8, Math.max(2, lineCount));
    const PRESET_COLORS = [
      { name: 'Đen', hex: '#0f172a' },
      { name: 'Hồng', hex: '#E81A7F' },
      { name: 'Xanh dương', hex: '#2563eb' },
      { name: 'Xanh lá', hex: '#059669' },
      { name: 'Đỏ', hex: '#dc2626' },
      { name: 'Tím', hex: '#7c3aed' },
      { name: 'Cam', hex: '#d97706' },
    ];
    // Colors available for the custom "chạy nhiều màu" mode — the same 8 stops
    // the default built-in rainbow uses, so any subset still looks cohesive.
    const RUN_COLOR_PALETTE = [
      { name: 'Hồng', hex: '#E81A7F' },
      { name: 'Đỏ hồng', hex: '#FF0055' },
      { name: 'Cam', hex: '#FF5E00' },
      { name: 'Vàng', hex: '#FFB700' },
      { name: 'Xanh lá', hex: '#00E676' },
      { name: 'Xanh dương', hex: '#00B0FF' },
      { name: 'Tím', hex: '#7C4DFF' },
      { name: 'Hồng tím', hex: '#E040FB' },
    ];
    const toggleRunColor = (hex: string) => {
      setDraftColor('');
      setDraftColors((prev) => (prev.includes(hex) ? prev.filter((c) => c !== hex) : [...prev, hex]));
    };

    return (
      <span className="relative inline-block w-full align-top bg-purple-50 ring-2 ring-purple-400 rounded-xl p-2.5 not-italic z-30 shadow-lg">
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={calcRows}
          placeholder="Nhập nội dung... (Nhấn Enter để xuống dòng)"
          style={{
            ...(draftColor ? { color: draftColor, WebkitTextFillColor: draftColor } : {}),
            ...(draftAlign ? { textAlign: draftAlign as React.CSSProperties['textAlign'] } : {}),
          }}
          className="w-full bg-white border border-purple-300 rounded-lg p-2 text-sm font-sans resize min-h-[2.5rem] min-w-[10rem]"
          title="Kéo góc dưới bên phải để chỉnh chiều rộng/chiều cao khung"
        />
        <div className="flex items-center flex-wrap justify-between gap-1.5 mt-1.5">
          <div className="flex items-center flex-wrap gap-1.5">
            {/* Rainbow Animated Flowing Gradient Button — resets to the default 8-color rainbow */}
            <button
              type="button"
              onClick={() => { setDraftColor(''); setDraftColors([]); }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                !draftColor && draftColors.length === 0
                  ? 'bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-400 text-white shadow-xs border-transparent scale-105'
                  : 'bg-white border-purple-200 text-slate-700 hover:bg-purple-50'
              }`}
              title="Bật hiệu ứng chữ chạy biến màu cầu vồng mặc định"
            >
              <span>🌈 Chạy màu mặc định</span>
            </button>

            {/* Quick Color Swatches — one static color, disables running colors */}
            <div className="flex items-center gap-1 bg-white border border-purple-200 rounded-lg p-1">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => { setDraftColor(c.hex); setDraftColors([]); }}
                  title={`Chọn màu ${c.name} (${c.hex})`}
                  className={`w-4 h-4 rounded-full transition-transform cursor-pointer border ${
                    draftColors.length === 0 && draftColor.toLowerCase() === c.hex.toLowerCase()
                      ? 'scale-125 ring-2 ring-purple-500 border-white shadow-xs'
                      : 'border-slate-300 hover:scale-115'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>

            {/* Custom Color Picker Input */}
            <label
              className="relative flex items-center gap-1 px-2 py-1 bg-white border border-purple-300 rounded-lg cursor-pointer hover:bg-purple-50"
              title="Chọn mã màu tùy chỉnh bất kỳ"
            >
              <Palette className="w-3.5 h-3.5 text-purple-700" />
              <span
                className="w-3.5 h-3.5 rounded-full border border-slate-300"
                style={{ background: draftColor || '#0f172a' }}
              />
              <input
                type="color"
                value={draftColor || '#0f172a'}
                onChange={(e) => { setDraftColor(e.target.value); setDraftColors([]); }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>

            {draftColor && (
              <button
                type="button"
                onClick={() => setDraftColor('')}
                className="px-2 py-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                title="Bỏ màu tĩnh, quay về hiệu ứng chạy màu mặc định"
              >
                Mặc định
              </button>
            )}

            <div className="flex items-center gap-0.5 bg-white border border-purple-300 rounded-lg p-0.5">
              {([
                { value: 'left', Icon: AlignLeft, label: 'Căn trái' },
                { value: 'center', Icon: AlignCenter, label: 'Căn giữa' },
                { value: 'right', Icon: AlignRight, label: 'Căn phải' },
                { value: 'justify', Icon: AlignJustify, label: 'Căn đều 2 bên' },
              ] as const).map(({ value, Icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDraftAlign(draftAlign === value ? '' : value)}
                  title={label}
                  className={`p-1 rounded-md cursor-pointer transition-colors ${
                    draftAlign === value
                      ? 'bg-purple-600 text-white'
                      : 'text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleResetToOriginal}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg flex items-center gap-1 font-bold text-xs cursor-pointer"
              title="Khôi phục lại bản dịch chuẩn của hệ thống"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục gốc</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1 font-bold text-xs cursor-pointer shadow-xs"
              title="Lưu"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Lưu</span>
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-2.5 py-1 bg-slate-300 hover:bg-slate-400 text-slate-800 rounded-lg flex items-center gap-1 font-bold text-xs cursor-pointer"
              title="Hủy"
            >
              <X className="w-3.5 h-3.5" />
              <span>Hủy</span>
            </button>
          </div>
        </div>

        {/* Custom multi-color running gradient — pick any 2+ colors (or all 8) to cycle through */}
        <div className="w-full flex flex-col gap-1.5 mt-2 pt-2 border-t border-purple-200">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <span className="text-[10px] font-bold text-purple-800">
              🎨 Chạy nhiều màu tùy chọn (chọn 2 → 8 màu, hoặc để trống dùng mặc định):
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => { setDraftColors(RUN_COLOR_PALETTE.map((c) => c.hex)); setDraftColor(''); }}
                className="px-2 py-0.5 text-[10px] font-bold text-purple-700 hover:text-purple-900 hover:bg-purple-100 rounded-md cursor-pointer"
              >
                Chọn tất cả
              </button>
              <button
                type="button"
                onClick={() => setDraftColors([])}
                className="px-2 py-0.5 text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md cursor-pointer"
              >
                Bỏ chọn
              </button>
            </div>
          </div>
          <div className="flex items-center flex-wrap gap-1.5">
            {RUN_COLOR_PALETTE.map((c) => {
              const order = draftColors.indexOf(c.hex);
              const selected = order !== -1;
              return (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => toggleRunColor(c.hex)}
                  title={selected ? `Bỏ ${c.name} khỏi dải chạy màu` : `Thêm ${c.name} vào dải chạy màu`}
                  className={`relative w-6 h-6 rounded-full border-2 cursor-pointer transition-transform ${
                    selected ? 'scale-110 border-white ring-2 ring-purple-500 shadow-xs' : 'border-slate-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {selected && (
                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-purple-700 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                      {order + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {draftColors.length === 1 && (
            <p className="text-[10px] text-amber-600 font-semibold">Chọn thêm ít nhất 1 màu nữa để chạy màu (1 màu sẽ hiển thị tĩnh).</p>
          )}
          {draftColors.length >= 2 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-purple-700 font-semibold shrink-0">Xem trước ({draftColors.length} màu):</span>
              <span
                className="flex-1 h-2.5 rounded-full"
                style={{ background: `linear-gradient(90deg, ${draftColors.join(', ')})` }}
              />
            </div>
          )}
        </div>
      </span>
    );
  }

  // A real <button> here would be invalid HTML (and break click handling) whenever
  // EditableText is used inside another button, which happens throughout the site.
  // A span with button semantics avoids illegal button-in-button nesting everywhere.
  const editBtn = (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => { e.stopPropagation(); startEditing(); }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.stopPropagation();
          e.preventDefault();
          startEditing();
        }
      }}
      title="Sửa nội dung (Admin)"
      className="inline-flex ml-1.5 align-middle p-0.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full ring-1 ring-purple-300 cursor-pointer shadow-2xs transition-all hover:scale-110"
    >
      <Edit3 className="w-3 h-3" />
    </span>
  );

  if (render) {
    return (
      <span
        className="group/edit inline-flex items-center gap-0.5 whitespace-pre-line cursor-text"
        style={displayStyle}
        onMouseUp={handleMouseUpToEdit}
        title="Bôi đen chữ hoặc bấm bút chì để sửa"
      >
        {render(resolvedValue)}
        {editBtn}
      </span>
    );
  }

  return (
    <Tag
      className={`group/edit relative whitespace-pre-line cursor-text ${className}`}
      style={displayStyle}
      onMouseUp={handleMouseUpToEdit}
      title="Bôi đen chữ hoặc bấm bút chì để sửa"
    >
      {resolvedValue}
      {editBtn}
    </Tag>
  );
};


