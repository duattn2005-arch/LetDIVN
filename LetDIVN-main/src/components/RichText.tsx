import React from 'react';
import { hasBlockTags, isRichText, sanitizeRichText } from '../utils/richText';

type Tag = 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'li' | 'label';

/**
 * Shows a multi-line text field: plain text as before (line breaks kept), or
 * the HTML the admin's rich-text editor produced, sanitised. A <p>/<span>
 * becomes a <div> when the HTML has its own paragraphs or lists.
 */
export function RichText({
  text,
  as: Tag = 'span',
  className = '',
  style,
}: {
  text: string;
  as?: Tag;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (!isRichText(text)) {
    return (
      <Tag className={`whitespace-pre-line ${className}`} style={style}>
        {text}
      </Tag>
    );
  }
  const Wrapper = hasBlockTags(text) && (Tag === 'p' || Tag === 'span' || Tag === 'label') ? 'div' : Tag;
  return <Wrapper className={`rich-text ${className}`} style={style} dangerouslySetInnerHTML={{ __html: sanitizeRichText(text) }} />;
}
