import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/dbService';
import { NewsArticle } from '../../types';
import { ArrowRight, ArrowLeft, Plus, Edit3, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { ArticleEditorModal } from '../ArticleEditorModal';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';
import { TakeActionStrip } from '../TakeActionStrip';

interface NewsPageProps {
  initialCategory?: 'All' | 'Media On Us' | 'News';
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export const NewsPage: React.FC<NewsPageProps> = ({ initialCategory = 'All' }) => {
  const { isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const [selectedCat, setSelectedCat] = useState<string>(initialCategory);
  const [search, setSearch] = useState<string>('');
  const [newsList, setNewsList] = useState<NewsArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

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

  const categories = ['All', 'News', 'Press Release', 'Impact Story'];

  const refreshNews = () => {
    dbService.getNews().then((updated) => {
      const sorted = [...updated].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setNewsList(sorted);
      setSelectedArticle((current) => {
        if (!current) return current;
        return sorted.find((a) => a.id === current.id) || current;
      });
    });
  };

  useEffect(() => {
    refreshNews();
    const unsub = dbService.subscribe(refreshNews);
    return () => unsub();
  }, []);

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

  const totalPages = Math.max(1, Math.ceil(filteredNews.length / PAGE_SIZE));
  const pagedNews = filteredNews.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCat, search]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const pendingCount = newsList.filter(n => n.status === 'Pending').length;

  return (
    <div className="bg-white">

      {/* Full-width hero banner */}
      <EditableImage
        contentKey="newsPage.heroImage"
        defaultValue="/images/news/hero.png"
        alt="Collected waste"
        wrapperClassName="w-full aspect-21/9 sm:h-[300px] sm:aspect-auto bg-slate-900"
        className="w-full h-full object-cover"
      />

      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {selectedArticle ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-5">
                <h1 className="ref-body" style={{ color: '#6EC1E4', fontWeight: 600, fontSize: '30px', lineHeight: 1.3 }}>
                  {selectedArticle.title}
                </h1>
                <div className="ref-news-date text-xs">{formatDate(selectedArticle.date)}</div>

                {selectedArticle.contentBlocks && selectedArticle.contentBlocks.length > 0 ? (
                  <div className="space-y-5">
                    {selectedArticle.contentBlocks.map((block, i) =>
                      block.type === 'image' ? (
                        <img key={i} src={block.value} alt={selectedArticle.title} className="w-full" />
                      ) : (
                        <p key={i} className="ref-body whitespace-pre-line" style={{ color: '#7A7A7A', fontSize: '18px', lineHeight: 1.32 }}>
                          {block.value}
                        </p>
                      )
                    )}
                  </div>
                ) : (
                  <div className="space-y-5">
                    <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full" />
                    <p className="ref-body whitespace-pre-line" style={{ color: '#7A7A7A', fontSize: '18px', lineHeight: 1.32 }}>
                      {selectedArticle.content}
                    </p>
                  </div>
                )}

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

              <div className="space-y-8">
                {visibleNews.filter((a) => a.id !== selectedArticle.id).slice(0, 5).map((a) => (
                  <div key={a.id} onClick={() => setSelectedArticle(a)} className="space-y-2 cursor-pointer group">
                    <div className="aspect-16/10 overflow-hidden bg-slate-900">
                      <img src={a.image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <h3 className="ref-news-title text-base leading-snug">{a.title}</h3>
                    <div className="ref-news-readmore text-xs">
                      <EditableText contentKey="newsPage.readMoreBtn" defaultValue={t.newsPageReadMoreBtn} as="span" /> »
                    </div>
                    <div className="ref-news-date text-xs">{formatDate(a.date)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
        <>
        <div className="text-center max-w-6xl mx-auto space-y-4">
          {selectedCat === 'Media On Us' ? (
            <EditableText
              contentKey="newsPage.titleMedia"
              defaultValue={t.newsPageTitleMedia || 'Press & TV Coverage About Us'}
              as="h1"
              className="ref-heading text-3xl sm:text-4xl lg:text-[45px] [text-wrap:balance]"
              render={(v) => <span style={{ color: '#F1138D' }}>{v}</span>}
            />
          ) : (
            <EditableText
              contentKey="newsPage.titleDefault"
              defaultValue="News"
              as="h1"
              className="ref-heading text-3xl sm:text-4xl lg:text-[45px] [text-wrap:balance]"
              render={(v) => <span style={{ color: '#F1138D' }}>{v}</span>}
            />
          )}

          {/* Add Article Button (Admin only) */}
          {isAdmin && (
            <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={handleOpenCreate}
                className="px-5 py-2.5 bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-xs rounded-full shadow-md transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span><EditableText contentKey="newsPage.addArticleBtn" defaultValue={t.newsPageAddArticleBtn} as="span" /></span>
              </button>

              {pendingCount > 0 && (
                <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold px-3.5 py-2.5 rounded-full animate-pulse">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>{language === 'vi' ? `Có ${pendingCount} bài viết đang chờ duyệt!` : `${pendingCount} article(s) pending review!`}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pagedNews.map(item => {
            const isPending = item.status === 'Pending';

            return (
              <article
                key={item.id}
                onClick={() => setSelectedArticle(item)}
                className={`bg-white rounded-3xl border ${isPending ? 'border-amber-400 ring-2 ring-amber-300/60 bg-amber-50/20' : 'border-slate-200/80'} overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer relative`}
              >
                <div>
                  <div className="relative aspect-16/10 overflow-hidden bg-slate-900">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Status Badge */}
                    {isPending && (
                      <div className="absolute bottom-3 left-3 bg-amber-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <EditableText contentKey="newsPage.pendingBadge" defaultValue={t.newsPagePendingBadge} as="span" />
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

                  <div className="p-6 space-y-3">
                    <h3 className="ref-news-title text-base sm:text-lg line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    <div className="ref-news-date text-xs">{formatDate(item.date)}</div>

                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <span className="ref-news-readmore text-xs">
                    <EditableText contentKey="newsPage.readMoreBtn" defaultValue={t.newsPageReadMoreBtn} as="span" /> »
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentPage === p ? 'bg-[#E81A7F] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
        </>
        )}

      </div>

      <TakeActionStrip contentKeyPrefix="newsPage" />

      {/* Article Editor Modal */}
      <ArticleEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        articleToEdit={articleToEdit}
        onSaved={refreshNews}
      />
    </div>
  );
};

