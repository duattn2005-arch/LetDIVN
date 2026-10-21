import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';

interface EditableImageProps {
  /** Key this image is stored under in Decap's "Nội dung các trang" */
  contentKey: string;
  defaultValue: string;
  alt: string;
  /** Applied to the <img> itself */
  className?: string;
  /** Applied to the wrapping <div> (e.g. to control the container's size) */
  wrapperClassName?: string;
}

const DEFAULT_OBJECT_POSITION = '50% 50%';

/**
 * A page image editable in Decap CMS (/admin -> "Nội dung các trang"). A
 * crop position set with the old on-page editor still applies (read-only now).
 */
export const EditableImage: React.FC<EditableImageProps> = ({
  contentKey,
  defaultValue,
  alt,
  className = '',
  wrapperClassName = '',
}) => {
  const [value, setValue] = useState(defaultValue);
  const [objectPosition, setObjectPosition] = useState(DEFAULT_OBJECT_POSITION);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      dbService.getContent(contentKey, defaultValue),
      dbService.getContent(`${contentKey}__position`, DEFAULT_OBJECT_POSITION),
    ]).then(([nextVal, nextPos]) => {
      if (cancelled) return;
      setValue(nextVal);
      setObjectPosition(nextPos);
    });
    return () => {
      cancelled = true;
    };
  }, [contentKey, defaultValue]);

  const hasPosition = wrapperClassName.includes('absolute') || wrapperClassName.includes('fixed') || wrapperClassName.includes('relative');
  const positionClass = hasPosition ? '' : 'relative';

  return (
    <div className={`${positionClass} ${wrapperClassName}`}>
      <img src={value} alt={alt} className={className} style={{ objectPosition }} />
    </div>
  );
};
