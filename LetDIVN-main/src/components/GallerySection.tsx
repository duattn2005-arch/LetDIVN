import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { GalleryItem } from '../types';
import { dbService } from '../services/dbService';
import { ArrowRight, Eye, MapPin, Calendar, X, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { TiltCard } from './TiltCard';
import { EditableText } from './EditableText';

interface GallerySectionProps {
  onViewAllGallery: () => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ onViewAllGallery }) => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const refresh = () => { dbService.getGallery().then((items) => setGalleryItems(items.slice(0, 6))); };
    refresh();
    const unsub = dbService.subscribe(refresh);
    return unsub;
  }, []);

  return (
    <section className="py-10 sm:py-14 relative z-10 border-b border-slate-200/50 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2.5">
          <EditableText
            contentKey="gallery.title"
            defaultValue={t.galleryTitle || 'Thư Viện Hình Ảnh & Phóng Sự'}
            as="h2"
            className="text-2xl sm:text-3xl lg:text-4xl font-black metallic-title tracking-tight leading-tight"
          />
          <EditableText
            contentKey="gallery.subtitle"
            defaultValue={t.gallerySubtitle}
            as="p"
            className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mx-auto"
          />
        </div>

        {/* Gallery Grid with 3D Tilt Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {galleryItems.map((item) => (
            <TiltCard
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group cursor-pointer border border-white/80 shadow-md hover:shadow-2xl"
            >
              {/* Image with hover zoom & overlay */}
              <div className="relative aspect-4/3 overflow-hidden bg-slate-900">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-xs text-slate-900 rounded-full p-2.5 shadow-md flex items-center gap-1.5 text-xs font-bold transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <Eye className="w-4 h-4 text-[#E81A7F]" />
                    <span>{t.viewDetails}</span>
                  </div>
                </div>

                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#E81A7F]" />
                  <span>{item.city}</span>
                </div>

                <div className="absolute bottom-3 right-3 bg-yellow-400 text-slate-950 text-[11px] font-black px-2 py-0.5 rounded-md shadow-xs">
                  {item.year}
                </div>
              </div>

              {/* Caption with strict line clamps for equal height */}
              <div className="p-4 bg-white/90 backdrop-blur-md">
                <h3 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-[#E81A7F] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {item.caption}
                </p>
              </div>
            </TiltCard>
          ))}
        </div>

        {/* View Full Gallery Link with 3D Pill Button */}
        <div className="text-center mt-8 sm:mt-10">
          <button
            id="view-full-gallery-link"
            onClick={onViewAllGallery}
            className="btn-pill-3d inline-flex items-center gap-2 px-7 py-3 bg-[#E81A7F] hover:bg-[#D01370] text-white text-xs sm:text-sm font-bold shadow-lg cursor-pointer"
          >
            <span>{t.galleryViewAll}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>

      {/* Lightbox Modal rendered at root level */}
      {selectedItem && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[999999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="relative bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-16/10 bg-slate-900">
              <img 
                src={selectedItem.imageUrl} 
                alt={selectedItem.title} 
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 text-xs font-bold text-[#E81A7F] uppercase tracking-wider mb-2">
                <span>{selectedItem.eventName}</span>
                <span>•</span>
                <span>{selectedItem.city} ({selectedItem.year})</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {selectedItem.title}
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {selectedItem.caption}
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};


