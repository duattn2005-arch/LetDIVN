import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Edit3, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import { ImageUploadWidget } from './ImageUploadWidget';

interface EditableImageProps {
  contentKey: string;
  defaultValue: string;
  alt: string;
  /** Applied to the <img> itself */
  className?: string;
  /** Applied to the wrapping <div> (e.g. to control the container's size) */
  wrapperClassName?: string;
}

export const EditableImage: React.FC<EditableImageProps> = ({
  contentKey,
  defaultValue,
  alt,
  className = '',
  wrapperClassName = '',
}) => {
  const { isAdmin } = useAuth();
  const [value, setValue] = useState(defaultValue);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const refresh = () => { dbService.getContent(contentKey, defaultValue).then(setValue); };
    refresh();
    const unsub = dbService.subscribe(refresh);
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentKey, defaultValue]);

  const hasPosition = wrapperClassName.includes('absolute') || wrapperClassName.includes('fixed') || wrapperClassName.includes('relative');
  const positionClass = hasPosition ? '' : 'relative';

  return (
    <div className={`${positionClass} group/img ${wrapperClassName}`}>
      <img src={value} alt={alt} className={className} />

      {isAdmin && (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-sm gap-2 cursor-pointer z-10"
        >
          <Edit3 className="w-5 h-5" />
          <span>Đổi ảnh (Admin)</span>
        </button>
      )}

      {isAdmin && isEditing && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsEditing(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">Thay đổi ảnh (Admin)</h4>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ImageUploadWidget
              currentImageUrl={value}
              onImageSelected={(url) => {
                if (url) {
                  dbService.setContent(contentKey, url);
                }
                setIsEditing(false);
              }}
            />

            {/* Quick 4K Sharp Presets & Reset */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Gợi ý ảnh chất lượng cao (4K/HD):</span>
                <button
                  type="button"
                  onClick={() => {
                    dbService.setContent(contentKey, defaultValue);
                    setIsEditing(false);
                  }}
                  className="text-[#E81A7F] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>↺ Khôi phục ảnh gốc</span>
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Cây xanh 4K', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=2560&auto=format&fit=crop&q=95' },
                  { label: 'Cánh đồng 4K', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=2560&auto=format&fit=crop&q=95' },
                  { label: 'Biển xanh 4K', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2560&auto=format&fit=crop&q=95' },
                  { label: 'Đội ngũ TNV 4K', url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=2560&auto=format&fit=crop&q=95' },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      dbService.setContent(contentKey, preset.url);
                      setIsEditing(false);
                    }}
                    className="group/preset relative aspect-16/10 rounded-lg overflow-hidden border border-slate-200 hover:border-[#E81A7F] hover:ring-2 hover:ring-[#E81A7F]/40 transition-all cursor-pointer shadow-xs"
                    title={`Chọn ${preset.label}`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover group-hover/preset:scale-110 transition-transform duration-300" />
                    <span className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-[9px] font-bold text-center py-0.5 truncate px-1">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};


