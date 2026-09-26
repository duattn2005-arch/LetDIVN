import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import tinymce, { type Editor } from 'tinymce';
import 'tinymce/models/dom';
import 'tinymce/themes/silver';
import 'tinymce/icons/default';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/autoresize';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/code';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/help';
import 'tinymce/plugins/help/js/i18n/keynav/vi';
import 'tinymce/plugins/image';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/nonbreaking';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/table';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/wordcount';
import 'tinymce-i18n/langs6/vi';
import 'tinymce/skins/ui/oxide/skin.min.css';
import contentUiCss from 'tinymce/skins/ui/oxide/content.min.css?inline';
import contentCss from 'tinymce/skins/content/default/content.min.css?inline';
import { api } from './api';
import { MediaLibrary } from './MediaLibrary';
import { blocksToHtml, cleanHtml, htmlToBlocks, type Block } from './blocks';
import { prepareUpload } from './util';

// The WordPress classic editor: TinyMCE (the editor WordPress itself uses)
// with WordPress's menu bar and two toolbar rows, the "Thêm tệp" media button
// and the "Trực quan" / "Mã" tabs. Loaded lazily — it is the heavy part of
// the admin.

// A few labels worded the way WordPress's Vietnamese translation has them.
tinymce.addI18n('vi', {
  File: 'Tệp tin',
  Edit: 'Chỉnh sửa',
  Tools: 'Các công cụ',
  Paragraph: 'Đoạn văn',
  'Heading 1': 'Tiêu đề 1',
  'Heading 2': 'Tiêu đề 2',
  'Heading 3': 'Tiêu đề 3',
  'Heading 4': 'Tiêu đề 4',
  'Heading 5': 'Tiêu đề 5',
  'Heading 6': 'Tiêu đề 6',
  Preformatted: 'Định dạng sẵn',
  Blockquote: 'Trích dẫn',
  'Paste as text': 'Dán dưới dạng văn bản',
  'Increase indent': 'Tăng thụt lề',
  'Decrease indent': 'Giảm thụt lề',
  'Special character': 'Ký tự đặc biệt',
  'Special character...': 'Ký tự đặc biệt...',
  'Horizontal line': 'Đường kẻ ngang',
  'Words: {0}': 'Số từ: {0}',
  'Bullet list': 'Danh sách không thứ tự',
  'Numbered list': 'Danh sách có thứ tự',
});

/** Styles inside the editing area: roughly how the news page shows an article. */
const CONTENT_STYLE = `
${contentUiCss}
${contentCss}
body { font-family: Poppins, Arial, sans-serif; font-size: 17px; line-height: 1.6; color: #3c434a; max-width: 900px; margin: 16px auto; padding: 0 16px; }
img { max-width: 100%; height: auto; }
.alignleft { float: left; margin: 0.4em 1.4em 0.8em 0; }
.alignright { float: right; margin: 0.4em 0 0.8em 1.4em; }
.aligncenter { display: block; margin-left: auto; margin-right: auto; }
figure.image { display: table; margin: 1em auto; }
figure.image figcaption { display: table-caption; caption-side: bottom; text-align: center; font-size: 14px; color: #646970; padding-top: 4px; }
blockquote { border-left: 4px solid #E81A7F; margin-left: 0; padding-left: 1em; font-style: italic; }
table { border-collapse: collapse; }
table td, table th { border: 1px solid #ccc; padding: 6px 8px; }
`;

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
        target: textarea,
        language: 'vi',
        skin: false,
        content_css: ['https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap'],
        content_style: CONTENT_STYLE,
        menubar: 'file edit view insert format tools table',
        menu: {
          file: { title: 'File', items: 'preview | print' },
          insert: { title: 'Insert', items: 'image link | charmap hr anchor insertdatetime nonbreaking | inserttable' },
        },
        toolbar: [
          'blocks | bold underline italic blockquote | bullist numlist | alignleft alignjustify aligncenter alignright | link unlink | undo redo | fullscreen',
          'fontfamily fontsize | outdent indent | pastetext removeformat | charmap hr | forecolor backcolor | table image | help',
        ],
        toolbar_mode: 'wrap',
        toolbar_sticky: true,
        toolbar_sticky_offset: window.innerWidth >= 768 ? 32 : 46,
        plugins:
          'advlist anchor autolink autoresize charmap code fullscreen help image insertdatetime link lists nonbreaking preview searchreplace table visualblocks wordcount',
        min_height: 520,
        autoresize_bottom_margin: 40,
        block_formats:
          'Đoạn văn=p; Tiêu đề 1=h1; Tiêu đề 2=h2; Tiêu đề 3=h3; Tiêu đề 4=h4; Tiêu đề 5=h5; Tiêu đề 6=h6; Định dạng sẵn=pre',
        font_family_formats:
          'Mặc định (Poppins)=Poppins,Arial,sans-serif; Arial=arial,helvetica,sans-serif; Roboto=Roboto,sans-serif; Georgia=georgia,serif; Tahoma=tahoma,sans-serif; Times New Roman=times new roman,times,serif; Verdana=verdana,sans-serif',
        font_size_formats: '12px 14px 16px 18px 20px 24px 28px 32px 36px 48px',
        color_map: [
          '000000', 'Đen', '3C434A', 'Xám đậm', '7A7A7A', 'Xám', 'FFFFFF', 'Trắng',
          'E81A7F', 'Hồng Let\'s Do It', '6EC1E4', 'Xanh trời', '2271B1', 'Xanh dương', '00A32A', 'Xanh lá',
          'D63638', 'Đỏ', 'DBA617', 'Vàng', 'F1138D', 'Hồng đậm', '8C5A2B', 'Nâu',
        ],
        image_caption: true,
        image_advtab: true,
        image_title: true,
        image_class_list: [
          { title: 'Không căn', value: '' },
          { title: 'Căn trái (chữ bao quanh)', value: 'alignleft' },
          { title: 'Căn giữa', value: 'aligncenter' },
          { title: 'Căn phải (chữ bao quanh)', value: 'alignright' },
        ],
        link_default_protocol: 'https',
        link_assume_external_targets: true,
        convert_urls: false,
        paste_data_images: true,
        automatic_uploads: true,
        // Images dropped or pasted into the editor go to the media library.
        images_upload_handler: async (blobInfo) => {
          const file = new File([blobInfo.blob()], blobInfo.filename() || 'anh.png', { type: blobInfo.blob().type });
          const item = await api.upload(await prepareUpload(file));
          return item.url;
        },
        // The browse button in the image/link dialogs opens the media library.
        file_picker_types: 'image file',
        file_picker_callback: (callback, _value, meta) => {
          setPicker({ mode: 'field', kind: meta.filetype === 'image' ? 'image' : 'file', resolve: (url) => callback(url, { alt: '' }) });
        },
        help_accessibility: false,
        promotion: false,
        branding: false,
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
        <button type="button" className="wp-btn mb-2" onClick={() => setPicker({ mode: 'insert' })} disabled={!ready}>
          <ImagePlus className="w-4 h-4" /> Thêm tệp
        </button>
        <div className="flex">
          {(['visual', 'code'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`px-3 py-1.5 text-[13px] border border-b-0 -mb-px relative ${
                mode === m ? 'bg-[#f6f7f7] border-[#dcdcde] text-[#1d2327] z-[1]' : 'bg-[#ebebeb] border-[#dcdcde] text-[var(--wp-muted)] hover:text-[#1d2327]'
              }`}
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
