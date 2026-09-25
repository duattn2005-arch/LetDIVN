import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Check } from 'lucide-react';
import { WhoWeAreItem } from '../types';
import { ImageUploadWidget } from './ImageUploadWidget';

interface WhoWeAreEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit: WhoWeAreItem | null;
  onSave: (item: Omit<WhoWeAreItem, 'id'> | WhoWeAreItem) => void;
}

export const WhoWeAreEditorModal: React.FC<WhoWeAreEditorModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [layout, setLayout] = useState<'image-left' | 'image-right'>('image-left');

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title || '');
      setContent(itemToEdit.content || '');
      setImage(itemToEdit.image || '');
      setLayout(itemToEdit.layout || 'image-left');
    } else {
      setTitle('');
      setContent('');
      setImage('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1000&auto=format&fit=crop&q=80');
      setLayout('image-left');
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a section title!');
      return;
    }
    if (!content.trim()) {
      alert('Please enter the content!');
      return;
    }

    const payload = {
      ...(itemToEdit ? { id: itemToEdit.id } : {}),
      title: title.trim(),
      content: content.trim(),
      image: image.trim() || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1000&auto=format&fit=crop&q=80',
      layout,
    };

    onSave(payload as any);
    onClose();
  };

  return typeof document !== 'undefined'
    ? createPortal(
        <div className="fixed inset-0 z-[999999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 my-8 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#E81A7F]" />
                  <span>{itemToEdit ? 'Edit Section (Admin)' : 'Add New Section (Admin)'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter the image, heading, and description to display on the Who We Are page
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Section Heading *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Where It All Began, Let's Do It Vietnam Today..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-[#E81A7F] focus:ring-2 focus:ring-[#E81A7F]/20 transition-all outline-none"
                />
              </div>

              {/* Layout Option */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Display Layout</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLayout('image-left')}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      layout === 'image-left'
                        ? 'border-[#E81A7F] bg-pink-50 text-[#E81A7F] ring-2 ring-[#E81A7F]/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>🖼️ Image Left — Text Right</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayout('image-right')}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      layout === 'image-right'
                        ? 'border-[#E81A7F] bg-pink-50 text-[#E81A7F] ring-2 ring-[#E81A7F]/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>Text Left — Image Right 🖼️</span>
                  </button>
                </div>
              </div>

              {/* Image Upload Widget */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Featured Image</label>
                <ImageUploadWidget
                  currentImageUrl={image}
                  onImageSelected={(url) => setImage(url)}
                  aspectRatioLabel="4:3 landscape ratio recommended"
                />
              </div>

              {/* Content / Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Content / Story Description *</label>
                <textarea
                  rows={5}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the historical background, milestones, or story for this section..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed focus:bg-white focus:border-[#E81A7F] focus:ring-2 focus:ring-[#E81A7F]/20 transition-all outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#E81A7F] hover:bg-[#D01370] text-white text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{itemToEdit ? 'Save Changes' : 'Add Section'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )
    : null;
};
