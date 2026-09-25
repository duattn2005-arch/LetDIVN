import React, { useEffect, useState } from 'react';
import { Settings2 } from 'lucide-react';
import { dbService } from '../services/dbService';
import { NewsArticle } from '../types';
import { useAuth } from '../context/AuthContext';
import { EditableText } from './EditableText';
import { EditableImage } from './EditableImage';
import { SelectHomeNewsModal } from './SelectHomeNewsModal';

const BRAND_PINK = '#F1138D';
const SELECTION_KEY = 'home.quickLinks.selectedNews';

const QUICK_LINKS = [
  { key: 'whoWeAre', label: 'Who We Are', image: '/images/home-quicklinks/who-we-are.jpg', view: 'who-we-are' },
  { key: 'whatWeDo', label: 'What We Do', image: '/images/home-quicklinks/what-we-do.jpg', view: 'what-we-do' },
  { key: 'ourPartners', label: 'Our Partners', image: '/images/home-quicklinks/our-partners.jpg', view: 'our-partners' },
  { key: 'mediaOnUs', label: 'Media on Us', image: '/images/home-quicklinks/media-on-us.jpg', view: 'media-on-us' },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Full-bleed (edge-to-edge, no side margins) quick-links image grid + latest
 * News preview, mirrored from the top of letsdoitvietnam.org's homepage.
 */
export const HomeQuickLinksSection: React.FC<{ onNavigate: (view: string, extraId?: string) => void }> = ({ onNavigate }) => {
  const { isAdmin } = useAuth();
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);

  const refreshNews = () => {
    Promise.all([
      dbService.getNews(),
      dbService.getContent(SELECTION_KEY, ''),
    ]).then(([all, raw]) => {
      const published = [...all]
        .filter((n) => n.status !== 'Pending')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      let selectedIds: string[] = [];
      try {
        const parsed = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) selectedIds = parsed;
      } catch {
        // ignore malformed override, fall back to auto below
      }

      if (selectedIds.length > 0) {
        const manual = selectedIds
          .map((id) => published.find((n) => n.id === id))
          .filter((n): n is NewsArticle => !!n);
        if (manual.length > 0) {
          setLatestNews(manual);
          return;
        }
      }

      setLatestNews(published.slice(0, 6));
    });
  };

  useEffect(() => {
    refreshNews();
    const unsub = dbService.subscribe(refreshNews);
    return () => unsub();
  }, []);

  return (
    <div className="bg-white py-12">
      <div className="text-center px-4">
        <EditableText
          contentKey="home.quickLinks.title"
          defaultValue="Cultivating the Beautiful in Vietnam"
          as="h2"
          className="ref-heading text-3xl sm:text-4xl"
          render={(v) => <span style={{ color: BRAND_PINK, fontWeight: 400 }}>{v}</span>}
        />
      </div>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4">
        {QUICK_LINKS.map((link) => (
          <div key={link.view} className="relative aspect-square sm:aspect-3/4 overflow-hidden group">
            <button onClick={() => onNavigate(link.view)} className="absolute inset-0 z-10 cursor-pointer" aria-label={link.label} />
            <EditableImage
              contentKey={`home.quickLinks.${link.key}Image`}
              defaultValue={link.image}
              alt={link.label}
              wrapperClassName="absolute inset-0"
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent pointer-events-none" />
            <EditableText
              contentKey={`home.quickLinks.${link.key}Label`}
              defaultValue={link.label}
              as="span"
              className="ref-heading absolute bottom-4 left-4 z-20"
              render={(v) => <span className="text-white text-base sm:text-lg">{v}</span>}
            />
          </div>
        ))}
      </div>

      {latestNews.length > 0 && (
        <>
          <div className="text-center px-4 mt-16 space-y-2">
            <EditableText
              contentKey="home.quickLinks.newsTitle"
              defaultValue="News"
              as="h2"
              className="ref-heading text-3xl sm:text-4xl"
              render={(v) => <span style={{ color: BRAND_PINK, fontWeight: 400 }}>{v}</span>}
            />
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsSelectModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#E81A7F] cursor-pointer"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Chọn bài viết hiển thị (Admin)</span>
              </button>
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-8 px-4 sm:px-8 lg:px-12">
            {latestNews.map((item) => (
              <div key={item.id} className="space-y-3">
                <button onClick={() => onNavigate('news', item.id)} className="block w-full aspect-16/9 overflow-hidden bg-slate-900 cursor-pointer">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </button>
                <h3 className="ref-news-title text-base sm:text-lg leading-snug">
                  <button onClick={() => onNavigate('news', item.id)} className="text-left cursor-pointer">
                    {item.title}
                  </button>
                </h3>
                <div className="ref-news-date text-xs">{formatDate(item.date)}</div>
                <button
                  onClick={() => onNavigate('news', item.id)}
                  className="ref-news-readmore text-xs cursor-pointer"
                >
                  Read More »
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {isAdmin && (
        <SelectHomeNewsModal
          isOpen={isSelectModalOpen}
          onClose={() => setIsSelectModalOpen(false)}
          onSaved={refreshNews}
        />
      )}
    </div>
  );
};
