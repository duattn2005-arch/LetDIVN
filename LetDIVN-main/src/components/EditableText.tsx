import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';

interface EditableTextProps {
  /** Key this piece of text is stored under in "Nội dung các trang" (e.g. 'whoWeAre.heroTitle') */
  contentKey: string;
  /** Text shown until it is changed in the admin */
  defaultValue: string;
  /** Element tag (also used around a custom `render`) */
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'li' | 'label';
  className?: string;
  multiline?: boolean;
  /** Custom renderer, e.g. to keep the value inside an <a href="mailto:..."> */
  render?: (value: string) => React.ReactNode;
  /** Accepted for older call sites; has no effect. */
  resizable?: boolean;
}

/**
 * A piece of page text editable in the admin (/admin -> "Trang").
 * A new contentKey also needs a field in public/admin/decap/config.yml, or it
 * can only ever show its defaultValue. Its look comes from the code only: the
 * colour / alignment / size overrides of the old on-page editor are ignored,
 * so the pages match letsdoitvietnam.org.
 */
export const EditableText: React.FC<EditableTextProps> = ({
  contentKey,
  defaultValue,
  as: Tag = 'span',
  className = '',
  render,
}) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    let cancelled = false;
    dbService.getContent(contentKey, defaultValue).then((next) => {
      if (!cancelled) setValue(next);
    });
    return () => {
      cancelled = true;
    };
  }, [contentKey, defaultValue]);

  const resolvedValue = value && value.trim() ? value : defaultValue;

  return render ? (
    <Tag className={className}>{render(resolvedValue)}</Tag>
  ) : (
    <Tag className={`whitespace-pre-line ${className}`}>{resolvedValue}</Tag>
  );
};
