import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { dbService } from '../../services/dbService';
import { NewsArticle } from '../../types';
import { Calendar, Eye, ArrowLeft, Share2, Sparkles, Plus, Edit3, Trash2, Search, CheckCircle2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { ArticleEditorModal } from '../ArticleEditorModal';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { EditableText } from '../EditableText';

interface NewsPageProps {
  initialCategory?: 'All' | 'Media On Us' | 'News';
}

export const NewsPage: React.FC<NewsPageProps> = ({ initialCategory = 'All' }) => {
  const { isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const [selectedCat, setSelectedCat] = useState<string>(initialCategory);
  const [search, setSearch] = useState<string>('');
  const [newsList, setNewsList] = useState<NewsArticle[]>([]);
  const [newsLoaded, setNewsLoaded] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ARTICLES_PER_PAGE = 9;

  // Editor Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [articleToEdit, setArticleToEdit] = useState<NewsArticle | null>(null);

  const categoryMap: Record<string, string> = {
    'All': t.newsCatAll,
    'News': t.newsCatNews,
    'Media On Us': t.newsCatMedia,
    'Press Release': t.newsCatPress,
    'Impact Story': t.newsCatImpact
  };

  const categories = ['All', 'News', 'Media On Us', 'Press Release', 'Impact Story'];

  const refreshNews = () => {
    dbService.getNews().then((updated) => {
      setNewsList(updated);
      setNewsLoaded(true);
      setSelectedArticle((current) => {
        if (!current) return current;
        return updated.find((a) => a.id === current.id) || current;
      });
    });
  };

  useEffect(() => {
    refreshNews();
    const unsub = dbService.subscribe(refreshNews);
    return () => unsub();
  }, []);

  // Jump back to page 1 whenever the visible set changes shape, so a filter
  // or search never leaves the view stranded on a now-empty later page.
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCat, search]);

  const handleDeleteArticle = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm(language === 'vi' ? 'Bạn có chắc chắn muốn xóa bài viết này không?' : 'Are you sure you want to delete this article?')) {
      await dbService.deleteNews(id);
      if (selectedArticle?.id === id) {
        setSelectedArticle(null);
      }
      refreshNews();
    }
  };

  const handleApproveArticle = async (e: React.MouseEvent, article: NewsArticle) => {
    e.stopPropagation();
    await dbService.approveNews(article.id);
    alert(language === 'vi' ? `Đã phê duyệt bài viết "${article.title}" thành công!` : `Article "${article.title}" approved successfully!`);
    refreshNews();
  };

  const handleOpenEdit = (e: React.MouseEvent, article: NewsArticle) => {
    e.stopPropagation();
    setArticleToEdit(article);
    setIsEditorOpen(true);
  };

  const handleOpenCreate = () => {
    setArticleToEdit(null);
    setIsEditorOpen(true);
  };

  const visibleNews = newsList.filter(n => {
    if (isAdmin) return true;
    return n.status !== 'Pending';
  });

  const filteredNews = visibleNews.filter(n => {
    const matchesCat = selectedCat === 'All' || n.category === selectedCat;
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.summary.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredNews.length / ARTICLES_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedNews = filteredNews.slice((safePage - 1) * ARTICLES_PER_PAGE, safePage * ARTICLES_PER_PAGE);

  const pendingCount = newsList.filter(n => n.status === 'Pending').length;

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-4xl mx-auto space-y-4">
          {selectedCat === 'Media On Us' ? (
            <EditableText
              contentKey="newsPage.titleMedia"
              defaultValue={t.newsPageTitleMedia || 'Press & TV Coverage About Us'}
              as="h1"
              className="text-3xl sm:text-4xl lg:text-5xl font-black metallic-title tracking-tight leading-tight [text-wrap:balance]"
            />
          ) : (
            <EditableText
              contentKey="newsPage.titleDefault"
              defaultValue={t.newsPageTitleDefault || 'News & Environmental Activities'}
              as="h1"
              className="text-3xl sm:text-4xl lg:text-5xl font-black metallic-title tracking-tight leading-tight [text-wrap:balance]"
            />
          )}
          <EditableText
            contentKey="newsPage.subtitle"
            defaultValue={t.newsPageSubtitle}
            as="p"
            className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto [text-wrap:balance]"
            multiline
          />

          {/* Add Article Button (Admin only) */}
          <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
            {isAdmin && (
              <button
                onClick={handleOpenCreate}
                className="px-5 py-2.5 bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-xs rounded-full shadow-md transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span><EditableText contentKey="newsPage.addArticleBtn" defaultValue={t.newsPageAddArticleBtn} as="span" /></span>
              </button>
            )}

            {isAdmin && pendingCount > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold px-3.5 py-2.5 rounded-full animate-pulse">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>{language === 'vi' ? `Có ${pendingCount} bài viết đang chờ duyệt!` : `${pendingCount} article(s) pending review!`}</span>
              </span>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCat(c)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCat === c ? 'bg-[#E81A7F] text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {categoryMap[c] || c}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={language === 'vi' ? 'Tìm kiếm bài viết...' : language === 'ja' ? '記事を検索...' : 'Search articles...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-[#E81A7F]"
              />
            </div>
          </div>
        </div>

        {/* News Grid */}
        {!newsLoaded ? (
          <div className="text-center text-sm text-slate-400 py-16">Loading articles...</div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center text-sm text-slate-400 py-16">No articles match this filter yet.</div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedNews.map(item => {
            const isPending = item.status === 'Pending';

            return (
              <article
                key={item.id}
                onClick={() => setSelectedArticle(item)}
                className={`bg-white ${isPending ? 'ring-2 ring-amber-300/60 bg-amber-50/20 rounded-2xl' : ''} flex flex-col justify-between group cursor-pointer relative`}
              >
                <div>
                  <div className="relative aspect-16/10 overflow-hidden bg-slate-900">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#E81A7F] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-xs">
                      {categoryMap[item.category] || item.category}
                    </div>

                    {/* Status Badge */}
                    {isPending && (
                      <div className="absolute bottom-3 left-3 bg-amber-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <EditableText contentKey="newsPage.pendingBadge" defaultValue={t.newsPagePendingBadge} as="span" />
                      </div>
                    )}

                    {item.source && !isPending && (
                      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-md">
                        <EditableText contentKey="newsPage.sourceLabel" defaultValue={t.newsPageSourceLabel} as="span" /> {item.source}
                      </div>
                    )}

                    {/* Admin Direct Action Buttons on Card */}
                    {isAdmin && (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10 bg-black/70 backdrop-blur-xs p-1.5 rounded-xl shadow-lg">
                        {isPending && (
                          <button
                            onClick={(e) => handleApproveArticle(e, item)}
                            title="Approve this article now"
                            className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-extrabold rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => handleOpenEdit(e, item)}
                          title="Edit article"
                          className="p-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-lg backdrop-blur-xs transition-colors cursor-pointer shadow-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteArticle(e, item.id)}
                          title="Delete article"
                          className="p-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-lg backdrop-blur-xs transition-colors cursor-pointer shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 space-y-2">
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-[#E81A7F] transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="w-3 h-3 text-[#E81A7F]" />
                      {item.date}
                    </span>

                    <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-sm font-bold text-emerald-600 group-hover:underline">
                    <EditableText contentKey="newsPage.readMoreBtn" defaultValue={t.newsPageReadMoreBtn} as="span" /> »
                  </span>
                </div>
              </article>
            );
          })}
        </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-4">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  page === safePage
                    ? 'bg-[#E81A7F] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* Article Editor Modal */}
      <ArticleEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        articleToEdit={articleToEdit}
        onSaved={refreshNews}
      />

      {/* Article Detail View Modal */}
      {selectedArticle && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <button
                onClick={() => setSelectedArticle(null)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#E81A7F] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <EditableText contentKey="newsPage.backToListBtn" defaultValue={t.newsPageBackToListBtn} as="span" />
              </button>

              {isAdmin && (
                <button
                  onClick={(e) => handleOpenEdit(e, selectedArticle)}
                  className="px-3 py-1.5 bg-[#E81A7F] hover:bg-[#D01370] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit this article</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div className="inline-block bg-[#E81A7F] text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full">
                {categoryMap[selectedArticle.category] || selectedArticle.category}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {selectedArticle.title}
              </h2>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>📅 {selectedArticle.date}</span>
                <span>👤 {selectedArticle.author}</span>
                {selectedArticle.source && <span>📰 <EditableText contentKey="newsPage.sourceLabel" defaultValue={t.newsPageSourceLabel} as="span" /> {selectedArticle.source}</span>}
              </div>
            </div>

            <div className="aspect-16/9 rounded-2xl overflow-hidden shadow-md">
              <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-full object-cover" />
            </div>

            <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100/60 text-xs font-semibold text-slate-700 leading-relaxed italic">
              "{selectedArticle.summary}"
            </div>

            <div className="text-sm text-slate-700 leading-relaxed space-y-4 whitespace-pre-line border-t border-slate-100 pt-4">
              {selectedArticle.content}
            </div>

            {selectedArticle.sourceUrl && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <EditableText contentKey="newsPage.sourceOriginalLabel" defaultValue={t.newsPageSourceOriginalLabel} as="span" className="text-slate-500" />
                <a
                  href={selectedArticle.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#E81A7F] font-bold hover:underline"
                >
                  {selectedArticle.source || <EditableText contentKey="newsPage.defaultSourceLabel" defaultValue={t.newsPageDefaultSourceLabel} as="span" />} →
                </a>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};


