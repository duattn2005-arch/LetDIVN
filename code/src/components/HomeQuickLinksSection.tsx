import React, { useEffect, useState } from 'react';
import { dbService } from '../services/dbService';
import { NewsArticle } from '../types';

const BRAND_PINK = '#F1138D';

const QUICK_LINKS = [
  { label: 'Who We Are', image: '/images/home-quicklinks/who-we-are.jpg', view: 'who-we-are' },
  { label: 'What We Do', image: '/images/home-quicklinks/what-we-do.jpg', view: 'what-we-do' },
  { label: 'Our Partners', image: '/images/home-quicklinks/our-partners.jpg', view: 'our-partners' },
  { label: 'Media on Us', image: '/images/home-quicklinks/media-on-us.jpg', view: 'media-on-us' },
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
export const HomeQuickLinksSection: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);

  useEffect(() => {
    dbService.getNews().then((all) => {
      const sorted = [...all]
        .filter((n) => n.status !== 'Pending')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setLatestNews(sorted.slice(0, 6));
    });
  }, []);

  return (
    <div className="bg-white py-12">
      <h2
        className="ref-heading text-3xl sm:text-4xl text-center px-4"
        style={{ color: BRAND_PINK, fontWeight: 400 }}
      >
        Cultivating the Beautiful in Vietnam
      </h2>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4">
        {QUICK_LINKS.map((link) => (
          <button
            key={link.view}
            onClick={() => onNavigate(link.view)}
            className="relative aspect-square sm:aspect-3/4 overflow-hidden group cursor-pointer bg-black"
          >
            <img
              src={link.image}
              alt={link.label}
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <span className="ref-heading absolute bottom-4 left-4 text-white text-base sm:text-lg">
              {link.label}
            </span>
          </button>
        ))}
      </div>

      {latestNews.length > 0 && (
        <>
          <h2
            className="ref-heading text-3xl sm:text-4xl text-center px-4 mt-16"
            style={{ color: BRAND_PINK, fontWeight: 400 }}
          >
            News
          </h2>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-8 px-4 sm:px-8 lg:px-12">
            {latestNews.map((item) => (
              <div key={item.id} className="space-y-3">
                <button onClick={() => onNavigate('news')} className="block w-full aspect-16/9 overflow-hidden bg-slate-900 cursor-pointer">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </button>
                <h3 className="ref-news-title text-base sm:text-lg leading-snug">
                  <button onClick={() => onNavigate('news')} className="text-left cursor-pointer">
                    {item.title}
                  </button>
                </h3>
                <div className="ref-news-date text-xs">{formatDate(item.date)}</div>
                <button
                  onClick={() => onNavigate('news')}
                  className="ref-news-readmore text-xs cursor-pointer"
                >
                  Read More »
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
