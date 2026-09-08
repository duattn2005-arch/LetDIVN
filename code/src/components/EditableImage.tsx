import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Edit3, X, Move, RotateCcw } from 'lucide-react';
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

const DEFAULT_OBJECT_POSITION = '50% 50%';

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const parseObjectPosition = (pos: string): [number, number] => {
  const parts = pos.split(/\s+/).map((p) => parseFloat(p));
  const x = Number.isFinite(parts[0]) ? parts[0] : 50;
  const y = Number.isFinite(parts[1]) ? parts[1] : 50;
  return [x, y];
};

export const EditableImage: React.FC<EditableImageProps> = ({
  contentKey,
  defaultValue,
  alt,
  className = '',
  wrapperClassName = '',
}) => {
  const { isAdmin } = useAuth();
  const positionKey = `${contentKey}__position`;

  const [value, setValue] = useState(defaultValue);
  const [objectPosition, setObjectPosition] = useState(DEFAULT_OBJECT_POSITION);
  const [isEditing, setIsEditing] = useState(false);
  const [draftPosition, setDraftPosition] = useState(DEFAULT_OBJECT_POSITION);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const refresh = () => {
      Promise.all([
        dbService.getContent(contentKey, defaultValue),
        dbService.getContent(positionKey, DEFAULT_OBJECT_POSITION),
      ]).then(([nextVal, nextPos]) => {
        setValue(nextVal);
        setObjectPosition(nextPos);
        setDraftPosition((current) => (isEditingRef.current ? current : nextPos));
      });
    };
    refresh();
    const unsub = dbService.subscribe(refresh);
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentKey, defaultValue, positionKey]);

  // Avoids the refresh effect stomping on an in-progress drag if content
  // changes elsewhere while this modal happens to be open.
  const isEditingRef = useRef(isEditing);
  useEffect(() => {
    isEditingRef.current = isEditing;
  }, [isEditing]);

  const hasPosition = wrapperClassName.includes('absolute') || wrapperClassName.includes('fixed') || wrapperClassName.includes('relative');
  const positionClass = hasPosition ? '' : 'relative';

  const previewRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  const startDrag = (clientX: number, clientY: number) => {
    const [x, y] = parseObjectPosition(draftPosition);
    dragStateRef.current = { startX: clientX, startY: clientY, startPosX: x, startPosY: y };
    setIsDragging(true);
  };

  const moveDrag = useCallback((clientX: number, clientY: number) => {
    const drag = dragStateRef.current;
    const rect = previewRef.current?.getBoundingClientRect();
    if (!drag || !rect) return;
    const dx = clientX - drag.startX;
    const dy = clientY - drag.startY;
    // Dragging the photo right/down should reveal more of its left/top edge
    // (the intuitive "grab the photo and slide it" motion), which means the
    // object-position percentage — which is where inside the *image* aligns
    // with the container — moves the opposite way.
    const nextX = clamp(drag.startPosX - (dx / rect.width) * 100, 0, 100);
    const nextY = clamp(drag.startPosY - (dy / rect.height) * 100, 0, 100);
    setDraftPosition(`${nextX.toFixed(1)}% ${nextY.toFixed(1)}%`);
  }, []);

  const endDrag = useCallback(() => {
    dragStateRef.current = null;
    setIsDragging(false);
    setDraftPosition((finalPos) => {
      dbService.setContent(positionKey, finalPos);
      setObjectPosition(finalPos);
      return finalPos;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionKey]);

  useEffect(() => {
    if (!isDragging) return;
    const onMouseMove = (e: MouseEvent) => moveDrag(e.clientX, e.clientY);
    const onMouseUp = () => endDrag();
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) moveDrag(t.clientX, t.clientY);
    };
    const onTouchEnd = () => endDrag();
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, moveDrag, endDrag]);

  const resetPosition = () => {
    setDraftPosition(DEFAULT_OBJECT_POSITION);
    setObjectPosition(DEFAULT_OBJECT_POSITION);
    dbService.setContent(positionKey, DEFAULT_OBJECT_POSITION);
  };

  const previewClassName = hasPosition ? 'w-full aspect-video bg-slate-900' : wrapperClassName || 'w-full aspect-video bg-slate-900';

  return (
    <div className={`${positionClass} group/img ${wrapperClassName}`}>
      <img src={value} alt={alt} className={className} style={{ objectPosition }} />

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

            {/* Drag-to-reposition (adjusts which part of the photo shows through the crop) */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Move className="w-3.5 h-3.5" />
                  Kéo ảnh để chỉnh vị trí hiển thị
                </span>
                <button
                  type="button"
                  onClick={resetPosition}
                  className="text-[#E81A7F] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Về giữa</span>
                </button>
              </div>
              <div
                ref={previewRef}
                onMouseDown={(e) => {
                  e.preventDefault();
                  startDrag(e.clientX, e.clientY);
                }}
                onTouchStart={(e) => {
                  const t = e.touches[0];
                  if (t) startDrag(t.clientX, t.clientY);
                }}
                className={`relative overflow-hidden rounded-xl border-2 border-dashed border-purple-300 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none ${previewClassName}`}
              >
                <img
                  src={value}
                  alt={alt}
                  draggable={false}
                  className="w-full h-full object-cover pointer-events-none"
                  style={{ objectPosition: draftPosition }}
                />
                <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/40" />
              </div>
              <p className="text-[10px] text-slate-400">Nhấn giữ và kéo trực tiếp trên ảnh, vị trí sẽ tự lưu khi thả chuột.</p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
