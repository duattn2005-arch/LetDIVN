import React, { useEffect, useState } from 'react';

import { dbService } from '../services/dbService';
import { NewsArticle } from '../types';
import { EditableText } from './EditableText';
import { EditableImage } from './EditableImage';

const BRAND_PINK = '#F1138D';
const SELECTION_KEY = 'home.quickLinks.selectedNews';

const QUICK_LINKS = [
  { key: 'whoWeAre', label: 'Who We Are', image: '/images/home-quicklinks/who-we-are.jpg', view: 'who-we-are' },
  { key: 'whatWeDo', label: 'What We Do', image: '/images/home-quicklinks/what-we-do.jpg', view: 'what-we-do' },
  { key: 'ourPartners', label: 'Our Partners', image: '/images/home-quicklinks/our-partners.jpg', view: 'our-partners' },
  { key: 'mediaOnUs', label: 'Media Coverage', image: '/images/home-quicklinks/media-on-us.jpg', view: 'media-on-us' },
];

/**
 * Full-bleed (edge-to-edge, no side margins) quick-links image grid + latest
 * News preview, mirrored from the top of letsdoitvietnam.org's homepage.
 */
export const HomeQuickLinksSection: React.FC<{ onNavigate: (view: string, extraId?: string) => void }> = ({ onNavigate }) => {
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);

  const refreshNews = () => {
    Promise.all([
      dbService.getNews(),
      dbService.getContent(SELECTION_KEY, ''),
    ]).then(([all, raw]) => {
      const published = [...all]
        .filter((n) => n.status !== 'Pending')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Picked in Decap ("Nội dung các trang" -> Trang chủ): news slugs, or ids of older picks.
      let selectedIds: string[] = [];
      try {
        const parsed = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) selectedIds = parsed;
      } catch {
        // ignore malformed override, fall back to auto below
      }

      if (selectedIds.length > 0) {
        const manual = selectedIds
          .map((id) => published.find((n) => n.slug === id || n.id === id))
          .filter((n): n is NewsArticle => !!n);
        if (manual.length > 0) {
          setLatestNews(manual);
          return;
        }
      }

      setLatestNews(published.slice(0, 8));
    });
  };

  useEffect(() => {
    refreshNews();
    const unsub = dbService.subscribe(refreshNews);
    return () => unsub();
  }, []);

  return (
    <div className="bg-white">
      {/* "EST. 2015" and the title, as on letsdoitvietnam.org */}
      <div className="text-center px-4 pt-[50px] pb-[30px]">
        <EditableText
          contentKey="hero.slide1.est"
          defaultValue="EST. 2015"
          as="p"
          className="font-['Poppins'] text-[18px] font-medium leading-[23.8px] text-[#7A7A7A] mb-[30px]"
        />
        <EditableText
          contentKey="home.quickLinks.title"
          defaultValue="Cultivating the Beautiful in Vietnam"
          as="h2"
          className="ref-heading ref-title-lg"
          render={(v) => <span style={{ color: BRAND_PINK, fontWeight: 400 }}>{v}</span>}
        />
      </div>

      {/* Four photo cards, rounded, the label centred at their foot */}
      <div className="px-[clamp(16px,2.5vw,28.76px)] pt-3 pb-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-7">
        {QUICK_LINKS.map((link) => (
          <div
            key={link.view}
            className="relative h-[220px] sm:h-[310px] overflow-hidden rounded-3xl group shadow-[0_20px_25px_-5px_rgba(0,0,0,0.12),0_8px_10px_-6px_rgba(0,0,0,0.1)]"
          >
            <button onClick={() => onNavigate(link.view)} className="absolute inset-0 z-10 cursor-pointer" aria-label={link.label} />
            <EditableImage
              contentKey={`home.quickLinks.${link.key}Image`}
              defaultValue={link.image}
              alt={link.label}
              wrapperClassName="absolute inset-0"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(11,18,32,0)_45%,rgba(11,18,32,0.5)_72%,rgba(11,18,32,0.9)_100%)]" />
            <EditableText
              contentKey={`home.quickLinks.${link.key}Label`}
              defaultValue={link.label}
              as="h3"
              className="absolute left-0 right-0 bottom-0 z-20 px-4 sm:px-7 pb-5 sm:pb-7 text-center font-['Poppins'] font-bold text-white text-lg sm:text-[26px] leading-[1.2] [text-shadow:0_2px_12px_rgba(0,0,0,0.35)]"
            />
          </div>
        ))}
      </div>

      {latestNews.length > 0 && (
        <div className="px-[clamp(16px,2.5vw,28.76px)] py-2.5">
          <div className="text-center pt-[30px] pb-5">
            <EditableText
              contentKey="home.quickLinks.newsTitle"
              defaultValue="News"
              as="h2"
              className="ref-heading ref-title-lg"
              render={(v) => <span style={{ color: BRAND_PINK, fontWeight: 400 }}>{v}</span>}
            />
          </div>

          <div className="max-w-[1140px] mx-auto pb-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-[30px] gap-y-[35px]">
            {latestNews.map((item) => (
              <article
                key={item.id}
                className="flex flex-col bg-white rounded-3xl overflow-hidden shadow-[0_14px_34px_-14px_rgba(241,19,141,0.22),0_2px_8px_0_rgba(15,23,42,0.04)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_44px_-16px_rgba(241,19,141,0.35),0_2px_8px_0_rgba(15,23,42,0.06)]"
              >
                <button onClick={() => onNavigate('news', item.id)} className="block w-full aspect-[4/3] overflow-hidden bg-slate-100 cursor-pointer mb-5" aria-label={item.title}>
                  <img src={item.image} alt="" loading="lazy" className="w-full h-full object-cover" />
                </button>
                <div className="flex flex-col flex-1 px-6 pt-1 pb-6">
                  <h3 className="font-['Roboto'] text-[18px] font-semibold leading-[1.15] text-[#54595F] pb-2.5">
                    <button onClick={() => onNavigate('news', item.id)} className="text-left cursor-pointer hover:text-[#F1138D] transition-colors">
                      {item.title}
                    </button>
                  </h3>
                  <button
                    onClick={() => onNavigate('news', item.id)}
                    className="mt-auto pt-3 text-left font-['Roboto'] text-xs font-medium text-[#61CE70] cursor-pointer"
                  >
                    Read More »
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
