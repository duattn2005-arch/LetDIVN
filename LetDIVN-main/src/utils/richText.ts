import DOMPurify from 'dompurify';

// Multi-line text fields are edited in the admin with TinyMCE. A value stays
// plain text while it has no formatting, and is stored as HTML once it does
// (bold, colour, lists...), so older plain values keep working unchanged.

const TAG = /<\/?(p|br|strong|b|em|i|u|s|del|ins|sub|sup|a|span|ul|ol|li|h[1-6]|blockquote|code|pre|hr|table|thead|tbody|tr|td|th|img|figure|figcaption)\b[^>]*>/i;
const BLOCK = /<(p|ul|ol|h[1-6]|blockquote|pre|hr|table|figure|div)\b/i;

/** True when the value is HTML from the rich-text editor rather than plain text. */
export const isRichText = (text: string) => TAG.test(text);

/** True when the HTML has block elements (paragraphs, lists...), so it can't sit inside a <p> or <span>. */
export const hasBlockTags = (html: string) => BLOCK.test(html);

export const sanitizeRichText = (html: string) => DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
