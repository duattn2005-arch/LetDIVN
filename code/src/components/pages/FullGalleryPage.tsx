import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { dbService } from '../../services/dbService';
import { GalleryItem } from '../../types';
import { Sparkles, MapPin, Calendar, Image as ImageIcon, X, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { GalleryUploadModal } from '../GalleryUploadModal';
import { EditableText } from '../EditableText';

export const FullGalleryPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const refreshGallery = () => {
    dbService.getGallery().then(setGallery);
  };

  useEffect(() => {
    refreshGallery();
    const unsub = dbService.subscribe(refreshGallery);
    return () => unsub();
  }, []);

  const years = ['All', '2026', '2024', '2023', '2022'];

  const filteredGallery = gallery.filter(item => {
    if (selectedYear === 'All') return true;
    return item.year.toString() === selectedYear;
  });

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm(language === 'vi' ? 'Bạn có chắc chắn muốn xóa bức ảnh này khỏi thư viện?' : 'Are you sure you want to delete this photo?')) {
      dbService.deleteGalleryItem(id);
      if (selectedImage?.id === id) {
        setSelectedImage(null);
      }
      refreshGallery();
    }
  };

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <EditableText
            contentKey="fullGallery.title"
            defaultValue={t.fullGalleryTitle}
            as="h1"
            className="text-3xl sm:text-4xl lg:text-5xl font-black metallic-title tracking-tight leading-tight [text-wrap:balance]"
          />
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto [text-wrap:balance]">
            <EditableText contentKey="fullGallery.subtitle" defaultValue={t.fullGallerySubtitle} as="span" />
          </p>
        </div>

        {/* Year Filter & Admin Upload Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex flex-wrap gap-2">
            {years.map(y => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedYear === y
                    ? 'bg-[#E81A7F] text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {y === 'All' ? (
                  <EditableText contentKey="fullGallery.allYearsLabel" defaultValue={t.fullGalleryAllYearsLabel} as="span" />
                ) : (
                  <><EditableText contentKey="fullGallery.yearPrefix" defaultValue={t.fullGalleryYearPrefix} as="span" /> {y}</>
                )}
              </button>
            ))}
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span><EditableText contentKey="fullGallery.uploadBtn" defaultValue={t.fullGalleryUploadBtn} as="span" /> (Admin)</span>
            </button>
          )}
        </div>

        {/* Masonry / Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredGallery.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group relative rounded-3xl overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-300 aspect-4/3 cursor-pointer bg-slate-900"
            >
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />

              {/* Admin delete button on card */}
              {isAdmin && (
                <button
                  onClick={(e) => handleDeleteItem(e, item.id)}
                  title="Xóa ảnh"
                  className="absolute top-3 right-3 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg z-20 shadow cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 mb-1">{item.category} • {item.year}</span>
                <h4 className="font-bold text-sm line-clamp-1">{item.title}</h4>
                <div className="flex items-center gap-1 text-[11px] text-slate-300 mt-1">
                  <MapPin className="w-3 h-3 text-[#E81A7F]" />
                  <span>{item.city}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {selectedImage && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[999999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white hover:text-pink-400 rounded-full z-10 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="aspect-16/10 bg-black flex items-center justify-center">
              <img 
                src={selectedImage.imageUrl} 
                alt={selectedImage.title}
                className="max-h-[70vh] w-auto object-contain mx-auto"
              />
            </div>

            <div className="p-6 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#E81A7F] uppercase tracking-wider">{selectedImage.category}</span>
                  <span className="text-xs text-slate-500">• {selectedImage.year}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{selectedImage.title}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#E81A7F]" />
                  {selectedImage.city}
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={(e) => handleDeleteItem(e, selectedImage.id)}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto border border-red-500/30"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa ảnh khỏi thư viện</span>
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Upload Modal */}
      <GalleryUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSaved={refreshGallery}
      />
    </div>
  );
};


