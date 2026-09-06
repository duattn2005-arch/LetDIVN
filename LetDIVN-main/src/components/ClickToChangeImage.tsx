import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Edit3, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ImageUploadWidget } from './ImageUploadWidget';

interface ClickToChangeImageProps {
  src: string;
  alt: string;
  /** Applied to the <img> itself */
  className?: string;
  /** Applied to the wrapping <div> (e.g. to control the container's size) */
  wrapperClassName?: string;
  onChange: (url: string) => void;
}

/**
 * Like EditableImage, but for a photo that lives inside a structured record
 * field (e.g. one entry of a news article's contentBlocks) rather than a
 * standalone dbService content key — the caller decides how to persist the
 * new URL instead of this component writing to a fixed key itself.
 */
export const ClickToChangeImage: React.FC<ClickToChangeImageProps> = ({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  onChange,
}) => {
  const { isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const hasPosition = wrapperClassName.includes('absolute') || wrapperClassName.includes('fixed') || wrapperClassName.includes('relative');
  const positionClass = hasPosition ? '' : 'relative';

  return (
    <div className={`${positionClass} group/img ${wrapperClassName}`}>
      <img src={src} alt={alt} className={className} />

      {isAdmin && (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-sm gap-2 cursor-pointer z-10"
        >
          <Edit3 className="w-5 h-5" />
          <span>Change Image (Admin)</span>
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
              <h4 className="font-bold text-slate-900 text-sm">Change Image (Admin)</h4>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ImageUploadWidget
              currentImageUrl={src}
              onImageSelected={(url) => {
                if (url) onChange(url);
                setIsEditing(false);
              }}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
