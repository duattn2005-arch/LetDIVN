import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';

interface EditableGalleryGridProps {
  /** Key of this gallery's image list in Decap's "Nội dung các trang". */
  contentKey: string;
  defaultImages: string[];
  alt: string;
  /** Applied to each image cell's wrapper (e.g. aspect ratio). */
  cellClassName?: string;
}

/**
 * A gallery grid whose photos are a list edited in Decap CMS (/admin ->
 * "Nội dung các trang"). Rendered directly inside the parent's grid wrapper
 * (a fragment of cells, not its own grid container). The list arrives as a
 * JSON array of image URLs; until one is saved, defaultImages are shown.
 */
export const EditableGalleryGrid: React.FC<EditableGalleryGridProps> = ({
  contentKey,
  defaultImages,
  alt,
  cellClassName = 'aspect-square',
}) => {
  const [images, setImages] = useState<string[]>(defaultImages);

  useEffect(() => {
    let cancelled = false;
    dbService.getContent(contentKey, '').then((raw) => {
      if (cancelled) return;
      try {
        const parsed = raw ? JSON.parse(raw) : null;
        if (Array.isArray(parsed) && parsed.length > 0) {
          setImages(parsed);
          return;
        }
      } catch {
        // fall through to defaults on corrupt/legacy content
      }
      setImages(defaultImages);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentKey]);

  return (
    <>
      {images.map((src, i) => (
        <div key={i} className={`${cellClassName} bg-slate-900 overflow-hidden`}>
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        </div>
      ))}
    </>
  );
};
