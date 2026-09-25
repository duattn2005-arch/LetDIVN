import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';

interface EditableTextProps {
  /** Key this piece of text is stored under in Decap's "Nội dung các trang" (e.g. 'whoWeAre.heroTitle') */
  contentKey: string;
  /** Text shown until it is changed in Decap */
  defaultValue: string;
  /** Wrapper element tag when no custom `render` is given */
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'li' | 'label';
  className?: string;
  multiline?: boolean;
  /** Custom renderer, e.g. to keep the value inside an <a href="mailto:..."> */
  render?: (value: string) => React.ReactNode;
  /** Accepted for older call sites; has no effect. */
  resizable?: boolean;
}

/**
 * A piece of page text editable in Decap CMS (/admin -> "Nội dung các trang").
 * A new contentKey also needs a field in public/admin/config.yml, or it can
 * only ever show its defaultValue. Color / alignment / font size set with the
 * old on-page editor still apply (read-only now).
 */
export const EditableText: React.FC<EditableTextProps> = ({
  contentKey,
  defaultValue,
  as: Tag = 'span',
  className = '',
  render,
}) => {
  const [value, setValue] = useState(defaultValue);
  const [color, setColor] = useState('');
  const [align, setAlign] = useState('');
  const [fontSize, setFontSize] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      dbService.getContent(contentKey, defaultValue),
      dbService.getContent(`${contentKey}__color`, ''),
      dbService.getContent(`${contentKey}__align`, ''),
      dbService.getContent(`${contentKey}__fontSize`, ''),
    ]).then(([nextVal, nextColor, nextAlign, nextFontSize]) => {
      if (cancelled) return;
      setValue(nextVal);
      setColor(nextColor);
      setAlign(nextAlign);
      setFontSize(nextFontSize);
    });
    return () => {
      cancelled = true;
    };
  }, [contentKey, defaultValue]);

  const resolvedValue = (value && value.trim()) ? value : defaultValue;
  const displayStyle: React.CSSProperties | undefined = (color || align || fontSize)
    ? {
        ...(color
          ? {
              color,
              WebkitTextFillColor: color,
              background: 'none',
              animation: 'none',
              filter: 'none',
            }
          : {}),
        ...(align ? { textAlign: align as React.CSSProperties['textAlign'] } : {}),
        ...(fontSize ? { fontSize: `${fontSize}px` } : {}),
      }
    : undefined;

  return render ? (
    <span className={className} style={displayStyle}>{render(resolvedValue)}</span>
  ) : (
    <Tag className={`whitespace-pre-line ${className}`} style={displayStyle}>{resolvedValue}</Tag>
  );
};
