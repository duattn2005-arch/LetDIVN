import tinymce, { type RawEditorOptions } from 'tinymce';
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
import './tinymce-wp.css';
import contentUiCss from 'tinymce/skins/ui/oxide/content.min.css?inline';
import contentCss from 'tinymce/skins/content/default/content.min.css?inline';
import { api } from './api';
import { prepareUpload } from './util';

// TinyMCE set up the way WordPress's classic editor has it: WordPress's menu
// bar and two toolbar rows, Vietnamese labels, uploads into the media library.
// Shared by the post editor (ClassicEditor) and the multi-line text fields
// (RichTextField). Loaded lazily — it is the heavy part of the admin.

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
  '{0} words': 'Số từ: {0}',
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

/**
 * The options both editors share. `pickFile` opens the media library for the
 * browse button of the image / link dialogs and hands back the chosen URL.
 */
export function wpEditorOptions(pickFile: (kind: 'image' | 'file', resolve: (url: string) => void) => void): RawEditorOptions {
  return {
    language: 'vi',
    skin: false,
    content_css: ['https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap'],
    content_style: CONTENT_STYLE,
    menubar: 'file edit view insert format tools table',
    menu: {
      file: { title: 'File', items: 'preview | print' },
      insert: { title: 'Insert', items: 'image link | charmap hr anchor insertdatetime nonbreaking | inserttable' },
    },
    // WordPress's two rows; full screen sits at the right end of row 1 (tinymce-wp.css).
    toolbar: [
      'blocks bold underline italic blockquote bullist numlist alignleft alignjustify aligncenter alignright link unlink undo redo | fullscreen',
      'fontfamily fontsize outdent indent pastetext removeformat charmap hr forecolor table help',
    ],
    toolbar_mode: 'wrap',
    plugins:
      'advlist anchor autolink autoresize charmap code fullscreen help image insertdatetime link lists nonbreaking preview searchreplace table visualblocks wordcount',
    // autoresize sets the body's side padding itself (1px by default, text against the frame).
    autoresize_overflow_padding: 16,
    block_formats: 'Đoạn văn=p; Tiêu đề 1=h1; Tiêu đề 2=h2; Tiêu đề 3=h3; Tiêu đề 4=h4; Tiêu đề 5=h5; Tiêu đề 6=h6; Định dạng sẵn=pre',
    font_family_formats:
      'Poppins=Poppins,Arial,sans-serif; Arial=arial,helvetica,sans-serif; Roboto=Roboto,sans-serif; Georgia=georgia,serif; Tahoma=tahoma,sans-serif; Times New Roman=times new roman,times,serif; Verdana=verdana,sans-serif',
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
    // Keep "…", "à", "ệ" as they are instead of &hellip; &agrave; ...
    entity_encoding: 'raw',
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
      pickFile(meta.filetype === 'image' ? 'image' : 'file', (url) => callback(url, { alt: '' }));
    },
    help_accessibility: false,
    promotion: false,
    branding: false,
  };
}

export { tinymce };
