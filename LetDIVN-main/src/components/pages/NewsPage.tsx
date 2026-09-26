import React, { useState, useEffect, useMemo } from 'react';
import DOMPurify from 'dompurify';
import { dbService } from '../../services/dbService';
import { NewsArticle } from '../../types';
import { ArrowRight, ArrowLeft, Clock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';
import { TakeActionStrip } from '../TakeActionStrip';

interface NewsPageProps {
  initialCategory?: 'All' | 'Media On Us' | 'News';
  /** Show this article (its slug, or its id when clicked from a homepage news card) instead of the list. */
  initialArticleId?: string;
  /** An article was opened (its slug) or closed (undefined), so the URL can follow: /news/<slug>/. */
  onArticleChange?: (slug?: string) => void;
}

/**
 * "Xem trước" in the admin editor opens /news/<slug>/?preview=1 and hands the
 * unsaved article over through localStorage (same site, so same storage).
 */
function readPreview(): NewsArticle | null {
  if (typeof window === 'undefined' || !new URLSearchParams(window.location.search).has('preview')) return null;
  try {
    const p = JSON.parse(localStorage.getItem('wp-admin-preview') || 'null');
    const d = p?.data;
    if (!d) return null;
    return {
      id: 'preview',
      slug: String(p.slug || 'xem-truoc'),
      title: String(d.title || ''),
      category: d.category || 'News',
      summary: String(d.summary || ''),
      content: '',
      contentBlocks: Array.isArray(d.contentBlocks) ? d.contentBlocks.filter((b: any) => b && typeof b.value === 'string' && b.value) : [],
      author: String(d.author || ''),
      date: String(d.date || ''),
      image: String(d.image || ''),
      source: d.source || undefined,
      sourceUrl: d.sourceUrl || undefined,
      views: 0,
      featured: !!d.featured,
      status: d.status === 'Pending' ? 'Pending' : 'Published',
      tags: Array.isArray(d.tags) ? d.tags : undefined,
      seoTitle: d.seoTitle || undefined,
      seoDescription: d.seoDescription || undefined,
    };
  } catch {
    return null;
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Articles are written and edited in the admin (/admin/), not on the page.

export const NewsPage: React.FC<NewsPageProps> = ({ initialCategory = 'All', initialArticleId, onArticleChange }) => {
  const { t, language } = useLanguage();
  const [selectedCat, setSelectedCat] = useState<string>(initialCategory);
  const [search, setSearch] = useState<string>('');
  const [newsList, setNewsList] = useState<NewsArticle[]>([]);
  const preview = useMemo(readPreview, []);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(preview);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

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

  // The article in the URL (/news/<slug>/), or the list when there is none.
  // Drafts ("Pending") are never shown this way, only through a preview.
  useEffect(() => {
    if (preview) return;
    if (!initialArticleId) {
      setSelectedArticle(null);
      return;
    }
    const found = newsList.find((a) => a.status !== 'Pending' && (a.slug === initialArticleId || a.id === initialArticleId));
    if (found) {
      setSelectedArticle(found);
      // Opened by id (a homepage news card): show the article's real address.
      if (initialArticleId !== found.slug) window.history.replaceState(null, '', `/news/${found.slug}/`);
    }
  }, [initialArticleId, newsList, preview]);

  const openArticle = (article: NewsArticle | null) => {
    setSelectedArticle(article);
    if (onArticleChange) onArticleChange(article?.slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Browser tab title and search/social description of the open article.
  useEffect(() => {
    if (!selectedArticle) return;
    const previousTitle = document.title;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.content;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    document.title = `${selectedArticle.seoTitle || selectedArticle.title} – Let's do it! Vietnam`;
    meta.content = selectedArticle.seoDescription || selectedArticle.summary || '';
    return () => {
      document.title = previousTitle;
      if (meta) meta.content = previousDescription ?? '';
    };
  }, [selectedArticle]);

  const visibleNews = newsList.filter(n => n.status !== 'Pending');

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
        wrapperClassName="w-full aspect-21/9 sm:h-[425px] sm:aspect-auto bg-slate-900"
        className="w-full h-full object-cover"
      />

      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {selectedArticle ? (
          <div className="space-y-6">
            {preview && selectedArticle.id === 'preview' && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <strong>Bản xem trước</strong> — nội dung đang soạn trong trang quản trị, có thể chưa được lưu lên website.
              </div>
            )}
            <div className="flex items-center justify-between">
              <button
                onClick={() => openArticle(null)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#E81A7F] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <EditableText contentKey="newsPage.backToListBtn" defaultValue={t.newsPageBackToListBtn} as="span" />
              </button>

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
                      ) : block.type === 'html' ? (
                        <div
                          key={i}
                          className="ref-body news-html"
                          style={{ color: '#7A7A7A', fontSize: '18px', lineHeight: 1.32 }}
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.value) }}
                        />
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

                {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                  <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-slate-500">Tags:</span>
                    {selectedArticle.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                        {tag}
                      </span>
                    ))}
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
                  <div key={a.id} onClick={() => openArticle(a)} className="space-y-2 cursor-pointer group">
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
              className="ref-heading ref-title-lg"
              render={(v) => <span style={{ color: '#F1138D' }}>{v}</span>}
            />
          ) : (
            <EditableText
              contentKey="newsPage.titleDefault"
              defaultValue="News"
              as="h1"
              className="ref-heading ref-title-lg"
              render={(v) => <span style={{ color: '#F1138D' }}>{v}</span>}
            />
          )}

        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pagedNews.map(item => {
            const isPending = item.status === 'Pending';

            return (
              <article
                key={item.id}
                onClick={() => openArticle(item)}
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
    </div>
  );
};

