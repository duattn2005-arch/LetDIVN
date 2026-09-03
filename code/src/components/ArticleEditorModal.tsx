import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Sparkles, Save, AlertCircle, Calendar, User, Globe, CheckCircle2 } from 'lucide-react';
import { NewsArticle } from '../types';
import { dbService } from '../services/dbService';
import { ImageUploadWidget } from './ImageUploadWidget';
import { useAuth } from '../context/AuthContext';

interface ArticleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleToEdit?: NewsArticle | null;
  onSaved?: (article: NewsArticle) => void;
}

export const ArticleEditorModal: React.FC<ArticleEditorModalProps> = ({
  isOpen,
  onClose,
  articleToEdit,
  onSaved,
}) => {
  const { isAdmin, user } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<NewsArticle['category']>('News');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState(user?.name || 'Ban Biên Tập Let\'s do it! Vietnam');
  const [date, setDate] = useState('');
  const [image, setImage] = useState('');
  const [source, setSource] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (articleToEdit) {
      setTitle(articleToEdit.title);
      setCategory(articleToEdit.category);
      setSummary(articleToEdit.summary);
      setContent(articleToEdit.content);
      setAuthor(articleToEdit.author);
      setDate(articleToEdit.date);
      setImage(articleToEdit.image);
      setSource(articleToEdit.source || '');
      setSourceUrl(articleToEdit.sourceUrl || '');
      setFeatured(articleToEdit.featured || false);
    } else {
      setTitle('');
      setCategory('News');
      setSummary('');
      setContent('');
      setAuthor(user?.name || 'Ban Biên Tập Let\'s do it! Vietnam');
      setDate(new Date().toISOString().split('T')[0]);
      setImage('https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop&q=80');
      setSource('');
      setSourceUrl('');
      setFeatured(false);
    }
    setError(null);
  }, [articleToEdit, isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề bài viết.');
      return;
    }
    if (!summary.trim()) {
      setError('Vui lòng nhập tóm tắt bài viết.');
      return;
    }
    if (!content.trim()) {
      setError('Vui lòng nhập nội dung chi tiết bài viết.');
      return;
    }
    if (!image.trim()) {
      setError('Vui lòng tải lên ảnh minh họa cho bài viết.');
      return;
    }

    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const articleStatus: NewsArticle['status'] = isAdmin ? 'Published' : (articleToEdit ? articleToEdit.status : 'Pending');

    let saved: NewsArticle;
    if (articleToEdit) {
      saved = await dbService.updateNews(articleToEdit.id, {
        title,
        slug,
        category,
        summary,
        content,
        author,
        date,
        image,
        source,
        sourceUrl,
        featured,
        status: articleStatus
      });
    } else {
      saved = await dbService.addNews({
        title,
        slug,
        category,
        summary,
        content,
        author,
        date,
        image,
        source,
        sourceUrl,
        featured,
        status: articleStatus
      });
    }

    if (!isAdmin) {
      alert('Bài viết của bạn đã được gửi thành công!\n\nBài viết đang ở trạng thái "Chờ duyệt" và sẽ hiển thị công khai trên website ngay khi Quản trị viên (Admin) phê duyệt.');
    }

    if (onSaved) onSaved(saved);
    onClose();
  };

  if (!isOpen) return null;

  return typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[999999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-500/20 text-[#E81A7F]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black">
                {articleToEdit ? 'Chỉnh Sửa Bài Viết' : (isAdmin ? 'Tạo Bài Viết Mới (Admin)' : 'Đăng Bài Viết Mới')}
              </h3>
              <p className="text-xs text-slate-400">
                {!isAdmin && !articleToEdit ? 'Bài viết sẽ được Quản Trị Viên kiểm duyệt trước khi hiển thị' : 'Quản lý và xuất bản nội dung tin tức, truyền thông'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title & Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tiêu đề bài viết <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Phóng sự VTV: Ngày Hội Dọn Rác Thế Giới 2026..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Chuyên mục <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F]"
              >
                <option value="Media On Us">Media On Us (Báo chí/VTV)</option>
                <option value="News">News (Bản tin hoạt động)</option>
                <option value="Press Release">Press Release (Thông cáo báo chí)</option>
                <option value="Impact Story">Impact Story (Câu chuyện truyền cảm hứng)</option>
              </select>
            </div>
          </div>

          {/* Image Upload Widget */}
          <ImageUploadWidget
            currentImageUrl={image}
            onImageSelected={(val) => setImage(val)}
            label="Ảnh bìa bài viết (Banner minh họa)"
            aspectRatioLabel="Tỉ lệ 16:9 khuyên dùng"
          />

          {/* Summary */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Đoạn tóm tắt mở đầu (Sapo) <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Tóm tắt ngắn 1-2 câu nội dung chính của phóng sự hoặc bài viết..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F]"
            ></textarea>
          </div>

          {/* Full Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nội dung chi tiết bài viết <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={6}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nội dung đầy đủ của bài viết..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm leading-relaxed focus:outline-hidden focus:border-[#E81A7F]"
            ></textarea>
          </div>

          {/* Author, Date, Source */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tác giả / Người biên tập
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Ngày đăng bài
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Đơn vị nguồn (VTV1, Tuổi Trẻ...)
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="VD: VTV1 Phóng sự"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Liên kết bài báo gốc (tùy chọn)
            </label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://vtv.vn/..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="featured-checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 text-[#E81A7F] rounded"
            />
            <label htmlFor="featured-checkbox" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              Đánh dấu bài viết nổi bật (Hiển thị ưu tiên ở đầu trang)
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#E81A7F] hover:bg-[#D01370] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{articleToEdit ? 'Lưu Thay Đổi' : 'Xuất Bản Bài Viết'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null;
};


