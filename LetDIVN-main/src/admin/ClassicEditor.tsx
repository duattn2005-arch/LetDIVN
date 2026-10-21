import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { type Editor } from 'tinymce';
import { MediaLibrary } from './MediaLibrary';
import { blocksToHtml, cleanHtml, htmlToBlocks, type Block } from './blocks';
import { tinymce, wpEditorOptions } from './tinymceSetup';

// The WordPress classic editor: TinyMCE (the editor WordPress itself uses)
// with WordPress's menu bar and two toolbar rows, the "Thêm tệp" media button
// and the "Trực quan" / "Mã" tabs. Loaded lazily — it is the heavy part of
// the admin.

type Picker = { mode: 'insert' } | { mode: 'field'; kind: 'image' | 'file'; resolve: (url: string) => void };

export default function ClassicEditor({ blocks, onChange }: { blocks: Block[]; onChange: (blocks: Block[]) => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const initialHtml = useRef(blocksToHtml(blocks));
  const editorRef = useRef<Editor | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<'visual' | 'code'>('visual');
  const [code, setCode] = useState('');
  const codeRef = useRef<HTMLTextAreaElement>(null);
  const [picker, setPicker] = useState<Picker | null>(null);

  useEffect(() => {
    let cancelled = false;
    // A fresh textarea per run: React's StrictMode mounts twice, and TinyMCE
    // skips a textarea that another (still starting) editor has claimed.
    const textarea = document.createElement('textarea');
    textarea.value = initialHtml.current;
    hostRef.current!.appendChild(textarea);
    const emit = () => {
      const editor = editorRef.current;
      if (editor) onChangeRef.current(htmlToBlocks(editor.getContent()));
    };
    tinymce
      .init({
        ...wpEditorOptions((kind, resolve) => setPicker({ mode: 'field', kind, resolve })),
        target: textarea,
        toolbar_sticky: true,
        toolbar_sticky_offset: window.innerWidth >= 768 ? 32 : 46,
        min_height: 520,
        autoresize_bottom_margin: 40,
        setup: (editor) => {
          editor.on('input change undo redo ExecCommand SetAttrib', () => {
            if (!cancelled) emit();
          });
        },
        init_instance_callback: (editor) => {
          if (cancelled) {
            editor.remove();
            return;
          }
          editorRef.current = editor;
          setReady(true);
        },
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      editorRef.current?.remove();
      editorRef.current = null;
      textarea.remove();
    };
  }, []);

  const insertImages = (urls: string[]) => {
    setPicker(null);
    const html = urls.map((u) => `<p><img src="${u.replace(/"/g, '&quot;')}" alt=""></p>`).join('');
    if (mode === 'code') {
      insertCode(html);
      return;
    }
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    editor.insertContent(html);
    onChangeRef.current(htmlToBlocks(editor.getContent()));
  };

  const switchMode = (next: 'visual' | 'code') => {
    const editor = editorRef.current;
    if (next === mode || !editor) return;
    if (next === 'code') {
      setCode(editor.getContent());
      editor.getContainer().style.display = 'none';
    } else {
      editor.setContent(cleanHtml(code));
      editor.getContainer().style.display = '';
      onChangeRef.current(htmlToBlocks(editor.getContent()));
    }
    setMode(next);
  };

  // --- "Mã" tab: a textarea with WordPress's quicktag buttons --------------------
  const setCodeAndEmit = (value: string) => {
    setCode(value);
    onChangeRef.current(htmlToBlocks(value));
  };

  const insertCode = (before: string, after = '') => {
    const ta = codeRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const next = value.slice(0, s) + before + value.slice(s, e) + after + value.slice(e);
    setCodeAndEmit(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = s + before.length;
      ta.selectionEnd = e + before.length;
    });
  };

  const quicktags: { label: string; title: string; run: () => void; className?: string }[] = [
    { label: 'b', title: 'Đậm', run: () => insertCode('<strong>', '</strong>'), className: 'font-bold' },
    { label: 'i', title: 'Nghiêng', run: () => insertCode('<em>', '</em>'), className: 'italic' },
    {
      label: 'link',
      title: 'Chèn liên kết',
      run: () => {
        const url = window.prompt('Nhập đường dẫn (URL):', 'https://');
        if (url && url !== 'https://') insertCode(`<a href="${url.replace(/"/g, '&quot;')}">`, '</a>');
      },
      className: 'underline',
    },
    { label: 'b-quote', title: 'Trích dẫn', run: () => insertCode('\n<blockquote>', '</blockquote>\n') },
    { label: 'del', title: 'Đoạn bị xóa', run: () => insertCode('<del>', '</del>'), className: 'line-through' },
    { label: 'ins', title: 'Đoạn chèn thêm', run: () => insertCode('<ins>', '</ins>'), className: 'underline' },
    { label: 'img', title: 'Chèn ảnh', run: () => setPicker({ mode: 'insert' }) },
    { label: 'ul', title: 'Danh sách không thứ tự', run: () => insertCode('<ul>\n', '\n</ul>') },
    { label: 'ol', title: 'Danh sách có thứ tự', run: () => insertCode('<ol>\n', '\n</ol>') },
    { label: 'li', title: 'Mục danh sách', run: () => insertCode('\t<li>', '</li>\n') },
    { label: 'code', title: 'Mã', run: () => insertCode('<code>', '</code>'), className: 'font-mono' },
  ];

  return (
    <div className="wp-classic-editor">
      <div className="flex items-end justify-between gap-2 flex-wrap">
        <button type="button" className="wp-btn wp-btn-lg mb-2 !bg-white" onClick={() => setPicker({ mode: 'insert' })} disabled={!ready}>
          <ImagePlus className="w-5 h-5" /> Thêm tệp
        </button>
        <div className="flex">
          {(['visual', 'code'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`wp-switch-editor ${mode === m ? 'is-active' : ''} ${m === 'code' ? 'is-code' : ''}`}
            >
              {m === 'visual' ? 'Trực quan' : 'Mã'}
            </button>
          ))}
        </div>
      </div>

      {!ready && <div className="border border-[#dcdcde] bg-white min-h-[520px] flex items-center justify-center text-[var(--wp-muted)]">Đang tải trình soạn thảo…</div>}
      <div ref={hostRef} />

      {mode === 'code' && (
        <div className="border border-[#dcdcde] bg-white">
          <div className="flex flex-wrap gap-1 p-1.5 bg-[#f6f7f7] border-b border-[#dcdcde]">
            {quicktags.map((q) => (
              <button
                key={q.label}
                type="button"
                title={q.title}
                onClick={q.run}
                className={`px-2 h-7 min-w-[30px] border border-[#c3c4c7] rounded-sm bg-[#f6f7f7] text-[13px] text-[var(--wp-blue)] hover:bg-white hover:border-[#8c8f94] ${q.className ?? ''}`}
              >
                {q.label}
              </button>
            ))}
          </div>
          <textarea
            ref={codeRef}
            className="block w-full min-h-[520px] p-3 font-mono text-[13px] leading-relaxed outline-none resize-y"
            value={code}
            spellCheck={false}
            onChange={(e) => setCodeAndEmit(e.target.value)}
          />
        </div>
      )}

      {picker && (
        <MediaLibrary
          mode="modal"
          multiple={picker.mode === 'insert'}
          kind={picker.mode === 'field' ? picker.kind : 'image'}
          title={picker.mode === 'insert' ? 'Thêm tệp' : undefined}
          buttonLabel={picker.mode === 'insert' ? 'Chèn vào bài viết' : 'Chọn'}
          onSelect={(urls) => {
            if (picker.mode === 'insert') insertImages(urls);
            else {
              picker.resolve(urls[0]);
              setPicker(null);
            }
          }}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  );
}
