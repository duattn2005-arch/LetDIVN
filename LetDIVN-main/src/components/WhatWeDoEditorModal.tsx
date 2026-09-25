import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Check } from 'lucide-react';
import { WhatWeDoItem } from '../types';
import { ImageUploadWidget } from './ImageUploadWidget';

interface WhatWeDoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit: WhatWeDoItem | null;
  onSave: (item: Omit<WhatWeDoItem, 'id'> | WhatWeDoItem) => void;
}

export const WhatWeDoEditorModal: React.FC<WhatWeDoEditorModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [badge, setBadge] = useState('');
  const [desc, setDesc] = useState('');
  const [image, setImage] = useState('');
  const [layout, setLayout] = useState<'image-left' | 'image-right'>('image-left');
  const [highlightsStr, setHighlightsStr] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title || '');
      setBadge(itemToEdit.badge || '');
      setDesc(itemToEdit.desc || '');
      setImage(itemToEdit.image || '');
      setLayout(itemToEdit.layout || 'image-left');
      setHighlightsStr((itemToEdit.highlights || []).join('\n'));
    } else {
      setTitle('');
      setBadge('');
      setDesc('');
      setImage('/what-we-do-wcd.jpg');
      setLayout('image-left');
      setHighlightsStr('');
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề hoạt động!');
      return;
    }

    const highlights = highlightsStr
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      ...(itemToEdit ? { id: itemToEdit.id } : {}),
      title: title.trim(),
      badge: badge.trim() || 'Hoạt Động Trọng Điểm',
      desc: desc.trim(),
      image: image.trim() || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=90',
      layout,
      highlights,
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
                  <span>{itemToEdit ? 'Chỉnh Sửa Hoạt Động (Admin)' : 'Thêm Hoạt Động Mới (Admin)'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nhập thông tin ảnh, tiêu đề và nội dung để hiển thị trên trang Chúng Tôi Làm Gì
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
              {/* Title & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Tiêu đề hoạt động *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: World Cleanup Day, Chiến dịch giáo dục..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-[#E81A7F] focus:ring-2 focus:ring-[#E81A7F]/20 transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Huy hiệu / Nhãn phân loại</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="VD: Chiến Dịch Toàn Cầu, Tập Huấn..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-[#E81A7F] focus:ring-2 focus:ring-[#E81A7F]/20 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Layout Option */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Bố cục hiển thị</label>
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
                    <span>🖼️ Ảnh Trái — Chữ Phải</span>
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
                    <span>Chữ Trái — Ảnh Phải 🖼️</span>
                  </button>
                </div>
              </div>

              {/* Image Upload Widget */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Hình ảnh đại diện</label>
                <ImageUploadWidget
                  currentImageUrl={image}
                  onImageSelected={(url) => setImage(url)}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nội dung mô tả chi tiết</label>
                <textarea
                  rows={4}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Mô tả ý nghĩa, mục tiêu và tác động của hoạt động..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed focus:bg-white focus:border-[#E81A7F] focus:ring-2 focus:ring-[#E81A7F]/20 transition-all outline-none"
                />
              </div>

              {/* Highlights / Bullet points */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Các điểm nhấn nổi bật (Mỗi dòng 1 điểm)</label>
                <textarea
                  rows={3}
                  value={highlightsStr}
                  onChange={(e) => setHighlightsStr(e.target.value)}
                  placeholder="VD:&#10;5,000+ Tình nguyện viên tham gia&#10;Thu gom hơn 8,500 kg rác thải"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed focus:bg-white focus:border-[#E81A7F] focus:ring-2 focus:ring-[#E81A7F]/20 transition-all outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#E81A7F] hover:bg-[#D01370] text-white text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{itemToEdit ? 'Lưu Thay Đổi' : 'Thêm Hoạt Động'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )
    : null;
};
