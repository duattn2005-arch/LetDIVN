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
  const [city, setCity] = useState('Hà Nội');
  const [year, setYear] = useState(2026);
  const [category, setCategory] = useState('Dọn rác bãi biển');
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title || '');
      setEventName(itemToEdit.eventName || 'World Cleanup Day');
      setCity(itemToEdit.city || 'Hà Nội');
      setYear(itemToEdit.year || 2026);
      setCategory(itemToEdit.category || 'Hoạt động dọn rác');
      setCaption(itemToEdit.caption || '');
      setImageUrl(itemToEdit.imageUrl || '');
    } else {
      setTitle('');
      setEventName('World Cleanup Day 2026');
      setCity('Hà Nội');
      setYear(new Date().getFullYear());
      setCategory('Dọn rác cộng đồng');
      setCaption('');
      setImageUrl('https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop&q=80');
    }
    setError(null);
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tên tiêu đề bức ảnh.');
      return;
    }
    if (!imageUrl.trim()) {
      setError('Vui lòng tải lên tệp ảnh từ máy tính hoặc nhập liên kết.');
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
                {itemToEdit ? 'Chỉnh Sửa Hình Ảnh Gallery' : 'Tải Ảnh Lên Bộ Sưu Tập (Gallery)'}
              </h3>
              <p className="text-xs text-slate-400">
                Cập nhật ảnh hoạt động thực tế của tình nguyện viên và sự kiện
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
              Tiêu đề ảnh <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Thu gom 2 tấn rác tại bãi biển Đà Nẵng..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F]"
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <ImageUploadWidget
              currentImageUrl={imageUrl}
              onImageSelected={(val) => setImageUrl(val)}
              label="Chọn ảnh từ thiết bị của bạn hoặc nhập link *"
              aspectRatioLabel="Tỉ lệ 4:3 hoặc 16:9"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tỉnh / Thành phố
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              >
                <option value="Hà Nội">Hà Nội</option>
                <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Hải Phòng">Hải Phòng</option>
                <option value="Cát Bà">Cát Bà</option>
                <option value="Phú Quốc">Phú Quốc</option>
                <option value="Nha Trang">Nha Trang</option>
                <option value="Cần Thơ">Cần Thơ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Năm diễn ra
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
                Phân loại
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="VD: Dọn rác bãi biển"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Chú thích ảnh (Caption)
            </label>
            <textarea
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Mô tả khoảnh khắc, thông điệp bảo vệ môi trường..."
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#E81A7F] hover:bg-[#D01370] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{itemToEdit ? 'Lưu Thay Đổi' : 'Lưu Vào Thư Viện Ảnh'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null;
};


