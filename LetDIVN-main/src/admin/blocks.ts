import DOMPurify from 'dompurify';

// A news article's body is stored as blocks (NewsContentBlock): plain
// paragraphs ("text"), formatted HTML ("html") and full-width images
// ("image"). The editor shows them as one document and turns it back into
// blocks on every change. Plain paragraphs and lone full-width images keep
// their own block types, so articles written in Decap round-trip unchanged.

export interface Block {
  type: 'text' | 'html' | 'image';
  value: string;
}

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export function blocksToHtml(blocks: Block[] = []): string {
  return blocks
    .map((b) => {
      if (b.type === 'image') return `<p><img src="${escapeHtml(b.value)}" alt=""></p>`;
      if (b.type === 'html') return b.value;
      return b.value
        .split(/\n{2,}/)
        .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
        .join('\n');
    })
    .join('\n');
}

/** What the body may contain: text formatting, headings, lists, links, images, tables. */
const SANITIZE = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'ins', 'sub', 'sup', 'span', 'div', 'code', 'pre',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'hr', 'figure', 'figcaption',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
  ],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'style', 'class', 'width', 'height', 'colspan', 'rowspan', 'id'],
};

export const cleanHtml = (html: string) => DOMPurify.sanitize(html, SANITIZE) as string;

/** A <p>/<div> holding only text and line breaks can stay a plain "text" block. */
const isPlainParagraph = (el: Element) =>
  (el.tagName === 'P' || el.tagName === 'DIV') &&
  !el.getAttribute('style') &&
  !el.getAttribute('class') &&
  [...el.childNodes].every((n) => n.nodeType === Node.TEXT_NODE || (n as Element).tagName === 'BR');

const paragraphText = (el: Element) =>
  [...el.childNodes]
    .map((n) => (n.nodeType === Node.TEXT_NODE ? n.textContent : '\n'))
    .join('')
    .replace(/ /g, ' ')
    .trim();

/**
 * A paragraph that is just one image with no size, alignment or caption: the
 * site shows those full width, so it stays an "image" block. Anything else
 * (resized, aligned, captioned, inside text or a table) stays in the HTML.
 */
function loneImage(el: Element): string | null {
  const img = el.tagName === 'IMG' ? el : el.children.length === 1 && el.children[0].tagName === 'IMG' ? el.children[0] : null;
  if (!img || (el !== img && (!['P', 'DIV'].includes(el.tagName) || (el.textContent || '').trim() || el.getAttribute('style') || el.getAttribute('class')))) return null;
  if (['width', 'height', 'style', 'class', 'title'].some((a) => img.getAttribute(a))) return null;
  if (img.getAttribute('alt')) return null;
  return img.getAttribute('src');
}

export function htmlToBlocks(html: string): Block[] {
  const doc = new DOMParser().parseFromString(`<body>${cleanHtml(html)}</body>`, 'text/html');

  // Loose text/inline tags at the top level (typed into an empty editor) go
  // into one paragraph per run, so a line stays one paragraph.
  const BLOCK_TAGS = /^(P|DIV|H[1-6]|UL|OL|LI|BLOCKQUOTE|HR|IMG|FIGURE|TABLE|PRE)$/;
  let run: HTMLParagraphElement | null = null;
  for (const node of [...doc.body.childNodes]) {
    if (node.nodeType === Node.ELEMENT_NODE && BLOCK_TAGS.test((node as Element).tagName)) {
      run = null;
      continue;
    }
    if (node.nodeType === Node.TEXT_NODE && !(node.textContent || '').trim() && !run) {
      node.remove();
      continue;
    }
    if (!run) {
      run = doc.createElement('p');
      doc.body.insertBefore(run, node);
    }
    run.appendChild(node);
  }

  const blocks: Block[] = [];
  let plain: string[] = [];
  let rich: string[] = [];
  const flush = () => {
    if (plain.length) blocks.push({ type: 'text', value: plain.join('\n\n') });
    if (rich.length) blocks.push({ type: 'html', value: rich.join('\n') });
    plain = [];
    rich = [];
  };

  for (const el of [...doc.body.children]) {
    const image = loneImage(el);
    if (image) {
      flush();
      blocks.push({ type: 'image', value: image });
      continue;
    }
    const empty = !(el.textContent || '').replace(/ /g, ' ').trim() && !el.querySelector('img, hr, table') && el.tagName !== 'HR';
    if (empty) continue; // <p>&nbsp;</p>, <p><br></p>
    if (isPlainParagraph(el)) {
      if (rich.length) flush();
      plain.push(paragraphText(el));
    } else {
      if (plain.length) flush();
      rich.push(el.outerHTML);
    }
  }
  flush();
  return blocks;
}

/** Plain text of the body, for word counts and SEO checks. */
export const blocksToText = (blocks: Block[] = []) =>
  blocks
    .filter((b) => b.type !== 'image')
    .map((b) => (b.type === 'html' ? htmlText(b.value) : b.value))
    .join('\n\n');

/** Text of an HTML fragment, one line per paragraph/heading/list item. */
export const htmlText = (html: string) =>
  new DOMParser()
    .parseFromString(html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|h[1-6]|li|blockquote|tr|td|th|figcaption|pre)>/gi, '$&\n'), 'text/html')
    .body.textContent?.replace(/ /g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim() ?? '';
