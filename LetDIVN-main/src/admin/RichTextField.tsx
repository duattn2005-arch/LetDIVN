import React, { useEffect, useRef, useState } from 'react';
import { type Editor } from 'tinymce';
import { MediaLibrary } from './MediaLibrary';
import { isRichText } from '../utils/richText';
import { tinymce, wpEditorOptions } from './tinymceSetup';

// A multi-line text field (Decap widget "text") edited with the same TinyMCE
// toolbar as posts. The value stays plain text while nothing is formatted —
// so untouched fields and older content keep their exact text — and becomes
// HTML once it has bold, colours, lists... (shown on the site by RichText).

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Stored value -> editor HTML: a blank line starts a paragraph, a single line break is a <br>. */
export function toEditorHtml(value: string): string {
  if (!value) return '';
  if (isRichText(value)) return value;
  return value
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

/** Editor HTML -> stored value: plain text if every paragraph is unformatted, else HTML. */
export function fromEditorHtml(html: string): string {
  const body = new DOMParser().parseFromString(html, 'text/html').body;
  const nodes = Array.from(body.childNodes).filter((n) => n.nodeType !== Node.TEXT_NODE || n.textContent!.trim());
  const isBareP = (n: ChildNode): n is HTMLParagraphElement => n instanceof HTMLParagraphElement && n.attributes.length === 0;
  const isPlainP = (n: ChildNode) => isBareP(n) && Array.from(n.childNodes).every((c) => c.nodeType === Node.TEXT_NODE || c.nodeName === 'BR');
  if (nodes.every(isPlainP)) {
    return nodes
      .map((p) => Array.from(p.childNodes).map((c) => (c.nodeName === 'BR' ? '\n' : c.textContent)).join(''))
      .join('\n\n')
      .replace(/ /g, ' ')
      .trim();
  }
  // One formatted paragraph: keep only its inline content, so it also fits
  // where the site shows the field inside a heading or a <span>.
  if (nodes.length === 1 && isBareP(nodes[0])) return nodes[0].innerHTML;
  return html;
}

export default function RichTextField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  /** The value this field last showed or sent — to tell our own changes from outside ones. */
  const valueRef = useRef(value);
  /** What the editor's content reads back as, so opening a field never counts as an edit. */
  const shownRef = useRef('');
  const [ready, setReady] = useState(false);
  const [picker, setPicker] = useState<{ kind: 'image' | 'file'; resolve: (url: string) => void } | null>(null);

  useEffect(() => {
    let cancelled = false;
    // A fresh textarea per run: React's StrictMode mounts twice, and TinyMCE
    // skips a textarea that another (still starting) editor has claimed.
    const textarea = document.createElement('textarea');
    textarea.value = toEditorHtml(valueRef.current);
    hostRef.current!.appendChild(textarea);
    tinymce
      .init({
        ...wpEditorOptions((kind, resolve) => setPicker({ kind, resolve })),
        target: textarea,
        min_height: 200,
        max_height: 700,
        autoresize_bottom_margin: 16,
        setup: (editor) => {
          editor.on('input change undo redo ExecCommand SetAttrib', () => {
            if (cancelled || editorRef.current !== editor) return;
            const next = fromEditorHtml(editor.getContent());
            if (next === shownRef.current) return;
            shownRef.current = next;
            valueRef.current = next;
            onChangeRef.current(next);
          });
        },
        init_instance_callback: (editor) => {
          if (cancelled) {
            editor.remove();
            return;
          }
          editorRef.current = editor;
          shownRef.current = fromEditorHtml(editor.getContent());
          setReady(true);
          // Poppins arrives after the first measure and makes the text taller.
          editor.getDoc().fonts?.ready.then(() => {
            if (!cancelled) editor.execCommand('mceAutoResize');
          });
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

  // The value changed from outside (rows moved up/down, a revision restored):
  // show it. Our own edits already match valueRef and are left alone.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || value === valueRef.current) return;
    valueRef.current = value;
    editor.setContent(toEditorHtml(value));
    shownRef.current = fromEditorHtml(editor.getContent());
  }, [value, ready]);

  return (
    <div className="wp-classic-editor">
      {!ready && (
        <div className="border border-[#dcdcde] bg-white min-h-[200px] flex items-center justify-center text-[var(--wp-muted)]">
          Đang tải trình soạn thảo…
        </div>
      )}
      <div ref={hostRef} />
      {picker && (
        <MediaLibrary
          mode="modal"
          kind={picker.kind}
          buttonLabel="Chọn"
          onSelect={(urls) => {
            picker.resolve(urls[0]);
            setPicker(null);
          }}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  );
}
