import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Save, AlertCircle, ArrowUp, ArrowDown, Trash2, Plus, Image as ImageIcon, Type } from 'lucide-react';
import { NewsArticle, NewsContentBlock } from '../types';
import { dbService } from '../services/dbService';
import { ImageUploadWidget } from './ImageUploadWidget';
import { useAuth } from '../context/AuthContext';

interface ArticleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleToEdit?: NewsArticle | null;
  onSaved?: (article: NewsArticle) => void;
}

// The editor keeps a stable, locally-unique `_key` per block so React can
// track each row across reorders (an index-based key would make React
// reuse/misattribute the wrong <textarea>/<img> when two blocks swap
// places). Stripped again in handleSubmit before saving.
type EditableBlock = NewsContentBlock & { _key: number };
let blockKeySeq = 0;
const nextBlockKey = () => ++blockKeySeq;
const withKeys = (blocks: NewsContentBlock[]): EditableBlock[] =>
  blocks.map((b) => ({ ...b, _key: nextBlockKey() }));

// Reconstructs a block list for articles saved before contentBlocks existed,
// so editing an old article doesn't lose its text or any images added via
// the earlier (images[]-only) version of this feature.
const blocksFromLegacyArticle = (article: NewsArticle): NewsContentBlock[] => {
  if (article.contentBlocks && article.contentBlocks.length > 0) return article.contentBlocks;
  const blocks: NewsContentBlock[] = [{ type: 'text', value: article.content }];
  (article.images || []).forEach((url) => blocks.push({ type: 'image', value: url }));
  return blocks;
};

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
  const [contentBlocks, setContentBlocks] = useState<EditableBlock[]>(() => withKeys([{ type: 'text', value: '' }]));
  const [newBlockImageDraft, setNewBlockImageDraft] = useState('');
  const [author, setAuthor] = useState(user?.name || 'Let\'s do it! Vietnam Editorial Team');
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
      setContentBlocks(withKeys(blocksFromLegacyArticle(articleToEdit)));
      setNewBlockImageDraft('');
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
      setContentBlocks(withKeys([{ type: 'text', value: '' }]));
      setNewBlockImageDraft('');
      setAuthor(user?.name || 'Let\'s do it! Vietnam Editorial Team');
      setDate(new Date().toISOString().split('T')[0]);
      setImage('https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop&q=80');
      setSource('');
      setSourceUrl('');
      setFeatured(false);
    }
    setError(null);
  }, [articleToEdit, isOpen, user]);

  if (!isOpen) return null;

  const updateTextBlock = (index: number, value: string) => {
    setContentBlocks((prev) => prev.map((b, i) => (i === index ? { ...b, type: 'text', value } : b)));
  };

  const addTextBlock = () => {
    setContentBlocks((prev) => [...prev, { type: 'text', value: '', _key: nextBlockKey() }]);
  };

  const addImageBlock = () => {
    if (!newBlockImageDraft.trim()) return;
    setContentBlocks((prev) => [...prev, { type: 'image', value: newBlockImageDraft.trim(), _key: nextBlockKey() }]);
    setNewBlockImageDraft('');
  };

  const removeBlock = (index: number) => {
    setContentBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    setContentBlocks((prev) => {
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
    const plainTextContent = contentBlocks
      .filter((b) => b.type === 'text')
      .map((b) => b.value.trim())
      .filter(Boolean)
      .join('\n\n');
    if (!plainTextContent) {
      setError('Please enter at least one paragraph of article content.');
      return;
    }
    if (!image.trim()) {
      setError('Please upload a cover image for the article.');
      return;
    }

    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const articleStatus: NewsArticle['status'] = isAdmin ? 'Published' : (articleToEdit ? articleToEdit.status : 'Pending');

    const payload = {
      title,
      slug,
      category,
      summary,
      content: plainTextContent,
      contentBlocks: contentBlocks.map(({ _key, ...block }) => block),
      author,
      date,
      image,
      source,
      sourceUrl,
      featured,
      status: articleStatus
    };

    let saved: NewsArticle;
    if (articleToEdit) {
      saved = await dbService.updateNews(articleToEdit.id, payload);
    } else {
      saved = await dbService.addNews(payload);
    }

    if (!isAdmin) {
      alert('Your article has been submitted successfully!\n\nThe article is currently "Pending" and will appear publicly on the website as soon as an Administrator (Admin) approves it.');
    }

    if (onSaved) onSaved(saved);
    onClose();
  };

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

          {/* Article Body: freely-ordered paragraph and image blocks */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Article Body <span className="text-red-500">*</span>
              <span className="font-normal text-slate-400"> — add paragraphs and images in any order</span>
            </label>

            <div className="space-y-2.5">
              {contentBlocks.map((block, index) => (
                <div
                  key={block._key}
                  className="flex items-start gap-2 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <div className="pt-1.5 text-slate-400 shrink-0">
                    {block.type === 'text' ? <Type className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                  </div>

                  {block.type === 'text' ? (
                    <textarea
                      rows={3}
                      value={block.value}
                      onChange={(e) => updateTextBlock(index, e.target.value)}
                      placeholder="Write a paragraph..."
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm leading-relaxed focus:outline-hidden focus:border-[#E81A7F]"
                    />
                  ) : (
                    <img src={block.value} alt={`Block ${index + 1}`} className="flex-1 max-w-40 h-20 object-cover rounded-lg" />
                  )}

                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveBlock(index, 'up')}
                      disabled={index === 0}
                      title="Move up"
                      className="p-1.5 text-slate-500 hover:text-[#E81A7F] hover:bg-white dark:hover:bg-slate-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlock(index, 'down')}
                      disabled={index === contentBlocks.length - 1}
                      title="Move down"
                      className="p-1.5 text-slate-500 hover:text-[#E81A7F] hover:bg-white dark:hover:bg-slate-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(index)}
                      title="Remove"
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-white dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-end gap-2 pt-1">
              <button
                type="button"
                onClick={addTextBlock}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Paragraph
              </button>

              <div className="flex-1 min-w-50">
                <ImageUploadWidget
                  currentImageUrl={newBlockImageDraft}
                  onImageSelected={(val) => setNewBlockImageDraft(val)}
                  label=""
                  placeholderText="Upload or paste an image URL, then click Add Image"
                />
              </div>
              <button
                type="button"
                onClick={addImageBlock}
                disabled={!newBlockImageDraft.trim()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Image
              </button>
            </div>
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
