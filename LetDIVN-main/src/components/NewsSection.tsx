import React, { useEffect, useState } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { dbService } from '../services/dbService';
import { NewsArticle } from '../types';
import { EditableText } from './EditableText';

interface NewsSectionProps {
  onViewAll: () => void;
}

export const NewsSection: React.FC<NewsSectionProps> = ({ onViewAll }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);

  useEffect(() => {
    const refresh = () => {
      dbService.getNews().then((all) => {
        const published = all
          .filter((a) => a.status !== 'Pending')
          .sort((a, b) => (a.date < b.date ? 1 : -1))
          .slice(0, 6);
        setArticles(published);
      });
    };
    refresh();
    const unsub = dbService.subscribe(refresh);
    return unsub;
  }, []);

  if (articles.length === 0) return null;

  return (
    <section className="py-10 sm:py-14 relative z-10 border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center">
          <EditableText
            contentKey="newsSection.title"
            defaultValue="News"
            as="h2"
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#E81A7F] tracking-tight"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {articles.map((item) => (
            <article
              key={item.id}
              onClick={onViewAll}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
              <div className="relative aspect-16/10 overflow-hidden bg-slate-900">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 sm:p-6 space-y-2">
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Calendar className="w-3 h-3 text-[#E81A7F]" />
                  {item.date}
                </span>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#E81A7F] transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h3>
                <div className="pt-1 flex items-center gap-1 text-xs font-bold text-[#E81A7F] group-hover:translate-x-1 transition-transform">
                  <span>Read More</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={onViewAll}
            className="bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
          >
            View All News
          </button>
        </div>
      </div>
    </section>
  );
};
