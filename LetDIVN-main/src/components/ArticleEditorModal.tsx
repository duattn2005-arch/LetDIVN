import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Sparkles, Save, AlertCircle, Calendar, User, Globe, CheckCircle2, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
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
  const [author, setAuthor] = useState(user?.name || 'Let\'s do it! Vietnam Editorial Team');
  const [date, setDate] = useState('');
  const [image, setImage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [newImageDraft, setNewImageDraft] = useState('');
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
      setImages(articleToEdit.images || []);
      setNewImageDraft('');
      setSource(articleToEdit.source || '');
      setSourceUrl(articleToEdit.sourceUrl || '');
      setFeatured(articleToEdit.featured || false);
    } else {
      setTitle('');
      setCategory('News');
      setSummary('');
      setContent('');
      setAuthor(user?.name || 'Let\'s do it! Vietnam Editorial Team');
      setDate(new Date().toISOString().split('T')[0]);
      setImage('https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop&q=80');
      setImages([]);
      setNewImageDraft('');
      setSource('');
      setSourceUrl('');
      setFeatured(false);
    }
    setError(null);
  }, [articleToEdit, isOpen, user]);

  if (!isOpen) return null;

  const handleAddImage = () => {
    if (!newImageDraft.trim()) return;
    setImages((prev) => [...prev, newImageDraft.trim()]);
    setNewImageDraft('');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    setImages((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const updated = [...prev];
      [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter the article title.');
      return;
    }
    if (!summary.trim()) {
      setError('Please enter the article summary.');
      return;
    }
    if (!content.trim()) {
      setError('Please enter the article content.');
      return;
    }
    if (!image.trim()) {
      setError('Please upload a cover image for the article.');
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
        images,
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
        images,
        source,
        sourceUrl,
        featured,
        status: articleStatus
      });
    }

    if (!isAdmin) {
      alert('Your article has been submitted successfully!\n\nThe article is currently "Pending" and will appear publicly on the website as soon as an Administrator (Admin) approves it.');
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
                {articleToEdit ? 'Edit Article' : (isAdmin ? 'Create New Article (Admin)' : 'Submit a New Article')}
              </h3>
              <p className="text-xs text-slate-400">
                {!isAdmin && !articleToEdit ? 'The article will be reviewed by an Administrator before it appears' : 'Manage and publish news and media content'}
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
                Article Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., VTV Feature: World Cleanup Day 2026..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F]"
              >
                <option value="Media On Us">Media On Us (Press/TV)</option>
                <option value="News">News (Activity updates)</option>
                <option value="Press Release">Press Release</option>
                <option value="Impact Story">Impact Story</option>
              </select>
            </div>
          </div>

          {/* Image Upload Widget */}
          <ImageUploadWidget
            currentImageUrl={image}
            onImageSelected={(val) => setImage(val)}
            label="Article Cover Image (Banner)"
            aspectRatioLabel="16:9 ratio recommended"
          />

          {/* Additional Images (shown in the article body, reorderable) */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Additional Images (shown below the article content)
            </label>

            {images.length > 0 && (
              <div className="space-y-2">
                {images.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <img src={url} alt={`Extra ${index + 1}`} className="w-16 h-12 object-cover rounded-lg shrink-0" />
                    <span className="flex-1 text-xs text-slate-500 dark:text-slate-400 truncate">{url}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveImage(index, 'up')}
                        disabled={index === 0}
                        title="Move up"
                        className="p-1.5 text-slate-500 hover:text-[#E81A7F] hover:bg-white dark:hover:bg-slate-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveImage(index, 'down')}
                        disabled={index === images.length - 1}
                        title="Move down"
                        className="p-1.5 text-slate-500 hover:text-[#E81A7F] hover:bg-white dark:hover:bg-slate-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        title="Remove"
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-white dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <ImageUploadWidget
                  currentImageUrl={newImageDraft}
                  onImageSelected={(val) => setNewImageDraft(val)}
                  label=""
                  placeholderText="Upload or paste a URL, then click Add"
                />
              </div>
              <button
                type="button"
                onClick={handleAddImage}
                disabled={!newImageDraft.trim()}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Add
              </button>
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Opening Summary (Lede) <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="A brief 1-2 sentence summary of the main content of the feature or article..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F]"
            ></textarea>
          </div>

          {/* Full Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Article Content <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={6}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="The full content of the article..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm leading-relaxed focus:outline-hidden focus:border-[#E81A7F]"
            ></textarea>
          </div>

          {/* Author, Date, Source */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Author / Editor
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
                Publish Date
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
                Source Outlet (VTV1, Tuoi Tre...)
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g., VTV1 Feature"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Original Article Link (optional)
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
              Mark as featured article (displays with priority at the top of the page)
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#E81A7F] hover:bg-[#D01370] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{articleToEdit ? 'Save Changes' : 'Publish Article'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null;
};


