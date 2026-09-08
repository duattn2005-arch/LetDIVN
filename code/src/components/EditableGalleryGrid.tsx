import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Edit3, X, Plus, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import { ImageUploadWidget } from './ImageUploadWidget';

interface EditableGalleryGridProps {
  /** Storage key for the whole gallery (persisted as a JSON array of image URLs). */
  contentKey: string;
  defaultImages: string[];
  alt: string;
  /** Applied to each image cell's wrapper (e.g. aspect ratio). */
  cellClassName?: string;
}

/**
 * A gallery grid whose image COUNT an admin can change — add new photos,
 * remove any photo, or swap any photo — unlike EditableImage, which only
 * lets an admin swap a single fixed slot. Meant to be rendered directly
 * inside the parent's grid wrapper (renders a fragment of cells, not its
 * own grid container). The whole list persists as one JSON array under
 * `contentKey`, superseding the static defaults as soon as an admin makes
 * any change.
 */
export const EditableGalleryGrid: React.FC<EditableGalleryGridProps> = ({
  contentKey,
  defaultImages,
  alt,
  cellClassName = 'aspect-square',
}) => {
  const { isAdmin } = useAuth();
  const [images, setImages] = useState<string[]>(defaultImages);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const raw = await dbService.getContent(contentKey, '');
      if (cancelled) return;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setImages(parsed);
            return;
          }
        } catch {
          // fall through to defaults on corrupt/legacy content
        }
      }
      setImages(defaultImages);
    };
    refresh();
    const unsub = dbService.subscribe(refresh);
    return () => {
      cancelled = true;
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentKey]);

  const persist = (next: string[]) => {
    setImages(next);
    dbService.setContent(contentKey, JSON.stringify(next));
  };

  const updateAt = (idx: number, url: string) => {
    const next = [...images];
    next[idx] = url;
    persist(next);
  };

  const removeAt = (idx: number) => {
    if (!window.confirm('Xóa ảnh này khỏi bộ sưu tập?')) return;
    persist(images.filter((_, i) => i !== idx));
  };

  const addImage = (url: string) => {
    persist([...images, url]);
  };

  if (!isAdmin) {
    return (
      <>
        {images.map((src, i) => (
          <div key={i} className={`${cellClassName} bg-slate-900 overflow-hidden`}>
            <img src={src} alt={alt} className="w-full h-full object-cover" />
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {images.map((src, i) => (
        <div key={i} className={`relative group/gal ${cellClassName} bg-slate-900 overflow-hidden`}>
          <img src={src} alt={alt} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => setEditingIndex(i)}
            className="absolute inset-0 bg-black/50 opacity-0 group-hover/gal:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5 cursor-pointer z-10"
          >
            <Edit3 className="w-4 h-4" />
            <span>Đổi ảnh</span>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removeAt(i); }}
            title="Xóa ảnh"
            className="absolute top-1.5 right-1.5 z-20 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover/gal:opacity-100 transition-opacity cursor-pointer shadow"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setAdding(true)}
        className={`${cellClassName} flex flex-col items-center justify-center gap-1 border-2 border-dashed border-slate-300 hover:border-[#E81A7F] hover:bg-pink-50/50 rounded-lg text-slate-400 hover:text-[#E81A7F] transition-colors cursor-pointer`}
      >
        <Plus className="w-6 h-6" />
        <span className="text-[11px] font-bold">Thêm ảnh</span>
      </button>

      {(editingIndex !== null || adding) && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-999999 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => { setEditingIndex(null); setAdding(false); }}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">
                {adding ? 'Thêm ảnh mới (Admin)' : 'Thay đổi ảnh (Admin)'}
              </h4>
              <button
                onClick={() => { setEditingIndex(null); setAdding(false); }}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ImageUploadWidget
              currentImageUrl={editingIndex !== null ? images[editingIndex] : ''}
              onImageSelected={(url) => {
                if (url) {
                  if (adding) addImage(url);
                  else if (editingIndex !== null) updateAt(editingIndex, url);
                }
                setEditingIndex(null);
                setAdding(false);
              }}
            />
            {editingIndex !== null && defaultImages[editingIndex] && defaultImages[editingIndex] !== images[editingIndex] && (
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    updateAt(editingIndex, defaultImages[editingIndex]);
                    setEditingIndex(null);
                  }}
                  className="text-[11px] font-bold text-[#E81A7F] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Khôi phục ảnh gốc</span>
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
