import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Check } from 'lucide-react';
import { MediaCoverageEntry } from '../types';
import { ImageUploadWidget } from './ImageUploadWidget';

interface MediaCoverageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit: MediaCoverageEntry | null;
  onSave: (item: Omit<MediaCoverageEntry, 'id'> | MediaCoverageEntry) => void;
}

export const MediaCoverageEditorModal: React.FC<MediaCoverageEditorModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [articles, setArticles] = useState('0');
  const [segments, setSegments] = useState('0');
  const [image, setImage] = useState('');
  const [pdf, setPdf] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title || '');
      setArticles(String(itemToEdit.articles ?? 0));
      setSegments(String(itemToEdit.segments ?? 0));
      setImage(itemToEdit.image || '');
      setPdf(itemToEdit.pdf || '');
    } else {
      setTitle('');
      setArticles('0');
      setSegments('0');
      setImage('');
      setPdf('');
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên chiến dịch!');
      return;
    }

    const payload = {
      ...(itemToEdit ? { id: itemToEdit.id } : {}),
      title: title.trim(),
      articles: Number(articles) || 0,
      segments: Number(segments) || 0,
      image: image.trim() || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=90',
      pdf: pdf.trim(),
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
                  <span>{itemToEdit ? 'Chỉnh Sửa Mục Truyền Thông (Admin)' : 'Thêm Mục Truyền Thông Mới (Admin)'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nhập thông tin để hiển thị trên trang Media on Us
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
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Tên chiến dịch *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: World Cleanup Day 2026"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-[#E81A7F] focus:ring-2 focus:ring-[#E81A7F]/20 transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Số bài báo (Article)</label>
                  <input
                    type="number"
                    min={0}
                    value={articles}
                    onChange={(e) => setArticles(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-[#E81A7F] focus:ring-2 focus:ring-[#E81A7F]/20 transition-all outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Số phóng sự (Segment)</label>
                  <input
                    type="number"
                    min={0}
                    value={segments}
                    onChange={(e) => setSegments(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-[#E81A7F] focus:ring-2 focus:ring-[#E81A7F]/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Hình ảnh</label>
                <ImageUploadWidget
                  currentImageUrl={image}
                  onImageSelected={(url) => setImage(url)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Link PDF / bài viết truyền thông</label>
                <input
                  type="text"
                  value={pdf}
                  onChange={(e) => setPdf(e.target.value)}
                  placeholder="https://... hoặc /media-coverage/ten-file.pdf"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-[#E81A7F] focus:ring-2 focus:ring-[#E81A7F]/20 transition-all outline-none"
                />
              </div>

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
                  <span>{itemToEdit ? 'Lưu Thay Đổi' : 'Thêm Mục Này'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )
    : null;
};
