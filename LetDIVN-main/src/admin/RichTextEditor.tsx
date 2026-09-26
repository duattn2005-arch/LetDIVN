import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ImagePlus,
  Italic,
  Link,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
  Unlink,
  type LucideIcon,
} from 'lucide-react';
import { MediaLibrary } from './MediaLibrary';

// The WordPress "classic editor" for a news article's body. The site stores
// the body as blocks (NewsContentBlock): plain paragraphs ("text"), formatted
// paragraphs ("html") and images ("image"); the editor shows them as one
// document and turns it back into blocks on every change.

export interface Block {
  type: 'text' | 'html' | 'image';
  value: string;
}

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export function blocksToHtml(blocks: Block[] = []): string {
  return blocks
    .map((b) => {
      if (b.type === 'image') return `<p><img src="${escapeHtml(b.value)}"></p>`;
      if (b.type === 'html') return b.value;
      return b.value
        .split(/\n{2,}/)
        .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
        .join('');
    })
    .join('\n');
}

/** Tags the editor keeps (pasted Word/web content is reduced to these). */
const SANITIZE = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'hr', 'span', 'div', 'sub', 'sup'],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'rel', 'style'],
};

export const cleanHtml = (html: string) => DOMPurify.sanitize(html, SANITIZE) as string;

/** A <p>/<div> holding only text and line breaks can stay a plain "text" block. */
const isPlainParagraph = (el: Element) =>
  (el.tagName === 'P' || el.tagName === 'DIV') &&
  !el.getAttribute('style') &&
  [...el.childNodes].every((n) => n.nodeType === Node.TEXT_NODE || (n as Element).tagName === 'BR');

const paragraphText = (el: Element) =>
  [...el.childNodes]
    .map((n) => (n.nodeType === Node.TEXT_NODE ? n.textContent : '\n'))
    .join('')
    .replace(/ /g, ' ')
    .trim();

export function htmlToBlocks(html: string): Block[] {
  const doc = new DOMParser().parseFromString(`<body>${cleanHtml(html)}</body>`, 'text/html');
  const blocks: Block[] = [];
  let plain: string[] = [];
  let rich: string[] = [];

  const flush = () => {
    if (plain.length) blocks.push({ type: 'text', value: plain.join('\n\n') });
    if (rich.length) blocks.push({ type: 'html', value: rich.join('') });
    plain = [];
    rich = [];
  };
  const addPlain = (text: string) => {
    if (!text) return;
    if (rich.length) flush();
    plain.push(text);
  };
  const addRich = (outer: string) => {
    if (plain.length) flush();
    rich.push(outer);
  };

  // Text typed straight into an empty editor isn't inside a <p> yet: wrap each
  // run of loose text/inline tags in one, so a line stays one paragraph.
  const BLOCK_TAGS = /^(P|DIV|H[1-6]|UL|OL|LI|BLOCKQUOTE|HR|IMG|FIGURE|TABLE|PRE)$/;
  let run: HTMLParagraphElement | null = null;
  for (const node of [...doc.body.childNodes]) {
    if (node.nodeType === Node.ELEMENT_NODE && BLOCK_TAGS.test((node as Element).tagName)) {
      run = null;
      continue;
    }
    if (!run) {
      run = doc.createElement('p');
      doc.body.insertBefore(run, node);
    }
    run.appendChild(node);
  }

  for (const node of [...doc.body.childNodes]) {
    if (node.nodeType === Node.TEXT_NODE) {
      addPlain((node.textContent || '').replace(/ /g, ' ').trim());
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const el = node as Element;
    const images = el.tagName === 'IMG' ? [el] : [...el.querySelectorAll('img')];
    if (images.length) {
      // Images become their own blocks; any text around them stays before them.
      const rest = el.cloneNode(true) as Element;
      if (el.tagName !== 'IMG') rest.querySelectorAll('img').forEach((i) => i.remove());
      if (el.tagName !== 'IMG' && (rest.textContent || '').trim()) {
        if (isPlainParagraph(rest)) addPlain(paragraphText(rest));
        else addRich(rest.outerHTML);
      }
      flush();
      images.forEach((img) => img.getAttribute('src') && blocks.push({ type: 'image', value: img.getAttribute('src')! }));
      continue;
    }
    if (!(el.textContent || '').trim() && el.tagName !== 'HR') continue; // empty <p><br></p>
    if (isPlainParagraph(el)) addPlain(paragraphText(el));
    else addRich(el.outerHTML);
  }
  flush();
  return blocks;
}

const FORMATS = [
  { value: 'p', label: 'Đoạn văn' },
  { value: 'h2', label: 'Tiêu đề 2' },
  { value: 'h3', label: 'Tiêu đề 3' },
  { value: 'h4', label: 'Tiêu đề 4' },
  { value: 'blockquote', label: 'Trích dẫn' },
];

export function RichTextEditor({ blocks, onChange }: { blocks: Block[]; onChange: (blocks: Block[]) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [mode, setMode] = useState<'visual' | 'code'>('visual');
  const [code, setCode] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [format, setFormat] = useState('p');
  const [words, setWords] = useState(0);

  // Load the article once; after that the DOM is the source of truth.
  useLayoutEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = blocksToHtml(blocks);
    countWords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const countWords = () => {
    const text = mode === 'code' ? code.replace(/<[^>]+>/g, ' ') : editorRef.current?.innerText || '';
    setWords(text.trim() ? text.trim().split(/\s+/).length : 0);
  };

  const emit = () => {
    if (!editorRef.current) return;
    onChange(htmlToBlocks(editorRef.current.innerHTML));
    countWords();
  };

  const refreshState = () => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || !editorRef.current?.contains(sel.anchorNode)) return;
    savedRange.current = sel.getRangeAt(0).cloneRange();
    setActive({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
    });
    const block = String(document.queryCommandValue('formatBlock') || 'p').toLowerCase();
    setFormat(FORMATS.some((f) => f.value === block) ? block : 'p');
  };

  useEffect(() => {
    document.addEventListener('selectionchange', refreshState);
    return () => document.removeEventListener('selectionchange', refreshState);
  });

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFullscreen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen]);

  const restoreSelection = () => {
    const editor = editorRef.current!;
    editor.focus();
    const sel = window.getSelection()!;
    if (savedRange.current && editor.contains(savedRange.current.startContainer)) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    } else {
      // No caret yet: put it at the end.
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  const exec = (command: string, value?: string) => {
    restoreSelection();
    document.execCommand('defaultParagraphSeparator', false, 'p');
    document.execCommand(command, false, value);
    emit();
    refreshState();
  };

  const addLink = () => {
    restoreSelection();
    const current = (window.getSelection()?.anchorNode?.parentElement?.closest('a') as HTMLAnchorElement | null)?.getAttribute('href');
    const url = window.prompt('Nhập đường dẫn (URL):', current || 'https://');
    if (!url || url === 'https://') return;
    exec('createLink', url);
    // Links to other sites open in a new tab.
    editorRef.current?.querySelectorAll('a[href^="http"]').forEach((a) => {
      if (!a.getAttribute('href')!.startsWith(window.location.origin)) {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener');
      }
    });
    emit();
  };

  const insertImages = (urls: string[]) => {
    setMediaOpen(false);
    const html = urls.map((u) => `<p><img src="${escapeHtml(u)}"></p>`).join('') + '<p><br></p>';
    exec('insertHTML', html);
  };

  const switchMode = (next: 'visual' | 'code') => {
    if (next === mode) return;
    if (next === 'code') {
      setCode(prettyHtml(editorRef.current?.innerHTML || ''));
    } else {
      // The editor div is kept mounted (just hidden), so its content can be set right away.
      editorRef.current!.innerHTML = cleanHtml(code);
      emit();
    }
    setMode(next);
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    e.preventDefault();
    if (html) {
      // Keep structure and basic formatting, drop colours, fonts and classes.
      const clean = DOMPurify.sanitize(html, { ...SANITIZE, ALLOWED_ATTR: ['href', 'src', 'alt'] }) as string;
      document.execCommand('insertHTML', false, clean);
    } else {
      document.execCommand(
        'insertHTML',
        false,
        text
          .split(/\n{2,}/)
          .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
          .join('')
      );
    }
    emit();
  };

  // Clicking an image selects it (blue outline) so Delete/Backspace removes it.
  const onClick = (e: React.MouseEvent) => {
    editorRef.current?.querySelectorAll('img.is-selected').forEach((i) => i.classList.remove('is-selected'));
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      target.classList.add('is-selected');
      const range = document.createRange();
      range.selectNode(target);
      const sel = window.getSelection()!;
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  const tool = (Icon: LucideIcon, label: string, onClick: () => void, isActive = false) => (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={isActive}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center rounded-sm border ${
        isActive ? 'bg-[#dcdcde] border-[#8c8f94] text-[#1d2327]' : 'border-transparent text-[#50575e] hover:border-[#8c8f94] hover:bg-white'
      } disabled:opacity-40`}
      disabled={mode === 'code'}
    >
      <Icon className="w-[18px] h-[18px]" />
    </button>
  );

  const sep = <span className="w-px h-6 bg-[#dcdcde] mx-1" />;

  return (
    <div className={fullscreen ? 'fixed inset-0 z-50 bg-white flex flex-col p-3 overflow-auto' : ''}>
      <div className="flex items-end justify-between gap-2 mb-[-1px]">
        <button type="button" className="wp-btn mb-2" onClick={() => setMediaOpen(true)}>
          <ImagePlus className="w-4 h-4" /> Thêm Media
        </button>
        <div className="flex">
          {(['visual', 'code'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`px-3 py-1.5 text-[13px] border border-b-0 ${
                mode === m ? 'bg-[#f6f7f7] border-[#dcdcde] text-[#1d2327]' : 'bg-[#ebebeb] border-transparent text-[var(--wp-muted)] hover:text-[#1d2327]'
              }`}
            >
              {m === 'visual' ? 'Trực quan' : 'Mã'}
            </button>
          ))}
        </div>
      </div>

      <div className={`border border-[#dcdcde] bg-white ${fullscreen ? 'flex-1 flex flex-col' : ''}`}>
        <div className="sticky top-[46px] md:top-8 z-10 flex flex-wrap items-center gap-0.5 px-1.5 py-1 bg-[#f6f7f7] border-b border-[#dcdcde]">
          <select
            className="h-8 px-1.5 mr-1 border border-[#8c8f94] rounded-sm bg-white text-[13px] disabled:opacity-40"
            value={format}
            disabled={mode === 'code'}
            onChange={(e) => exec('formatBlock', e.target.value)}
            aria-label="Định dạng đoạn"
          >
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          {tool(Bold, 'Đậm (Ctrl+B)', () => exec('bold'), active.bold)}
          {tool(Italic, 'Nghiêng (Ctrl+I)', () => exec('italic'), active.italic)}
          {tool(Underline, 'Gạch chân (Ctrl+U)', () => exec('underline'), active.underline)}
          {tool(Strikethrough, 'Gạch ngang', () => exec('strikeThrough'), active.strikeThrough)}
          {sep}
          {tool(List, 'Danh sách không thứ tự', () => exec('insertUnorderedList'), active.insertUnorderedList)}
          {tool(ListOrdered, 'Danh sách có thứ tự', () => exec('insertOrderedList'), active.insertOrderedList)}
          {tool(Quote, 'Trích dẫn', () => exec('formatBlock', format === 'blockquote' ? 'p' : 'blockquote'), format === 'blockquote')}
          {sep}
          {tool(AlignLeft, 'Căn trái', () => exec('justifyLeft'))}
          {tool(AlignCenter, 'Căn giữa', () => exec('justifyCenter'), active.justifyCenter)}
          {tool(AlignRight, 'Căn phải', () => exec('justifyRight'), active.justifyRight)}
          {sep}
          {tool(Link, 'Chèn/sửa liên kết', addLink)}
          {tool(Unlink, 'Gỡ liên kết', () => exec('unlink'))}
          {tool(Minus, 'Đường kẻ ngang', () => exec('insertHorizontalRule'))}
          {tool(RemoveFormatting, 'Xóa định dạng', () => exec('removeFormat'))}
          {sep}
          {tool(Undo2, 'Hoàn tác (Ctrl+Z)', () => exec('undo'))}
          {tool(Redo2, 'Làm lại (Ctrl+Y)', () => exec('redo'))}
          <span className="ml-auto" />
          <button
            type="button"
            title={fullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
            onClick={() => setFullscreen(!fullscreen)}
            className="w-8 h-8 flex items-center justify-center text-[#50575e] hover:text-[var(--wp-blue)]"
          >
            {fullscreen ? <Minimize2 className="w-[18px] h-[18px]" /> : <Maximize2 className="w-[18px] h-[18px]" />}
          </button>
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className={`wp-editor-content ${mode === 'code' ? 'hidden' : ''} ${fullscreen ? 'flex-1 max-w-[840px] w-full mx-auto' : ''}`}
          data-placeholder="Bắt đầu viết nội dung…"
          onInput={emit}
          onPaste={onPaste}
          onClick={onClick}
          onKeyUp={refreshState}
          onMouseUp={refreshState}
        />
        {mode === 'code' && (
          <textarea
            className={`block w-full p-4 font-mono text-[13px] leading-relaxed outline-none resize-y ${fullscreen ? 'flex-1' : 'min-h-[400px]'}`}
            value={code}
            spellCheck={false}
            onChange={(e) => {
              setCode(e.target.value);
              onChange(htmlToBlocks(e.target.value));
            }}
          />
        )}
        <div className="px-3 py-1.5 border-t border-[#dcdcde] bg-[#f6f7f7] text-[12px] text-[var(--wp-muted)]">Số từ: {words}</div>
      </div>

      {mediaOpen && (
        <MediaLibrary mode="modal" multiple title="Thêm media" buttonLabel="Chèn vào bài viết" onSelect={insertImages} onClose={() => setMediaOpen(false)} />
      )}
    </div>
  );
}

/** One block-level element per line, so the "Mã" tab is readable. */
const prettyHtml = (html: string) => html.replace(/>\s*(<(p|h[2-4]|ul|ol|blockquote|hr|div)[\s>])/g, '>\n$1').trim();
