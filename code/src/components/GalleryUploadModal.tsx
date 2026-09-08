import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Image as ImageIcon, Save, AlertCircle } from 'lucide-react';
import { GalleryItem } from '../types';
import { dbService } from '../services/dbService';
import { ImageUploadWidget } from './ImageUploadWidget';

interface GalleryUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: GalleryItem | null;
  onSaved?: (item: GalleryItem) => void;
}

export const GalleryUploadModal: React.FC<GalleryUploadModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
  onSaved,
}) => {
  const [title, setTitle] = useState('');
  const [eventName, setEventName] = useState('World Cleanup Day 2026');
  const [city, setCity] = useState('Hanoi');
  const [year, setYear] = useState(2026);
  const [category, setCategory] = useState('Beach Cleanup');
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title || '');
      setEventName(itemToEdit.eventName || 'World Cleanup Day');
      setCity(itemToEdit.city || 'Hanoi');
      setYear(itemToEdit.year || 2026);
      setCategory(itemToEdit.category || 'Cleanup Activity');
      setCaption(itemToEdit.caption || '');
      setImageUrl(itemToEdit.imageUrl || '');
    } else {
      setTitle('');
      setEventName('World Cleanup Day 2026');
      setCity('Hanoi');
      setYear(new Date().getFullYear());
      setCategory('Community Cleanup');
      setCaption('');
      setImageUrl('https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop&q=80');
    }
    setError(null);
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a title for the photo.');
      return;
    }
    if (!imageUrl.trim()) {
      setError('Please upload an image file from your computer or enter a link.');
      return;
    }

    let saved: GalleryItem;
    if (itemToEdit) {
      saved = await dbService.updateGalleryItem(itemToEdit.id, {
        title,
        eventName,
        year: Number(year),
        city,
        imageUrl,
        caption: caption || title,
        category
      });
    } else {
      saved = await dbService.addGalleryItem({
        title,
        eventName,
        year: Number(year),
        city,
        imageUrl,
        caption: caption || title,
        category
      });
    }

    if (onSaved) onSaved(saved);
    onClose();
  };

  if (!isOpen) return null;

  return typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[999999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-500/20 text-[#E81A7F]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black">
                {itemToEdit ? 'Edit Gallery Image' : 'Upload Photo to Gallery'}
              </h3>
              <p className="text-xs text-slate-400">
                Update real-world photos of volunteer activities and events
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Photo Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Collecting 2 tons of trash on Da Nang beach..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F]"
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <ImageUploadWidget
              currentImageUrl={imageUrl}
              onImageSelected={(val) => setImageUrl(val)}
              label="Choose an image from your device or enter a link *"
              aspectRatioLabel="4:3 or 16:9 ratio"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Province / City
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              >
                <option value="Hanoi">Hanoi</option>
                <option value="Ho Chi Minh City">Ho Chi Minh City</option>
                <option value="Da Nang">Da Nang</option>
                <option value="Hai Phong">Hai Phong</option>
                <option value="Cat Ba">Cat Ba</option>
                <option value="Phu Quoc">Phu Quoc</option>
                <option value="Nha Trang">Nha Trang</option>
                <option value="Can Tho">Can Tho</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Beach Cleanup"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Photo Caption
            </label>
            <textarea
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Describe the moment, an environmental message..."
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#E81A7F] hover:bg-[#D01370] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{itemToEdit ? 'Save Changes' : 'Save to Gallery'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null;
};


