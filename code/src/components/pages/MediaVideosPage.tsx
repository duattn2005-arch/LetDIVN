import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Trash2, PlayCircle, Youtube } from 'lucide-react';
import { dbService } from '../../services/dbService';
import { MediaVideo } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { EditableText } from '../EditableText';
import { VideoAddModal } from '../VideoAddModal';
import { getYouTubeEmbedUrl } from '../../utils/youtube';

export const MediaVideosPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const [videos, setVideos] = useState<MediaVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<MediaVideo | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const refreshVideos = () => {
    dbService.getVideos().then(setVideos);
  };

  useEffect(() => {
    refreshVideos();
    const unsub = dbService.subscribe(refreshVideos);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!selectedVideo && videos.length > 0) {
      setSelectedVideo(videos[0]);
    } else if (selectedVideo && !videos.find(v => v.id === selectedVideo.id)) {
      setSelectedVideo(videos[0] || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos]);

  const handleDeleteVideo = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const confirmMsg = language === 'vi' ? 'Bạn có chắc chắn muốn xóa video này?' : 'Are you sure you want to delete this video?';
    if (window.confirm(confirmMsg)) {
      dbService.deleteVideo(id);
    }
  };

  return (
    <div className="py-10 sm:py-14 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        <div className="text-center max-w-3xl mx-auto space-y-3">
          <EditableText
            contentKey="videosPage.title"
            defaultValue={t.videosPageTitle}
            as="h2"
            className="text-2xl sm:text-3xl lg:text-4xl font-black metallic-title tracking-tight leading-tight [text-wrap:balance]"
          />
          <EditableText
            contentKey="videosPage.subtitle"
            defaultValue={t.videosPageSubtitle}
            as="p"
            multiline
            className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto [text-wrap:balance]"
          />

          {isAdmin && (
            <div className="pt-1">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn-pill-3d px-6 py-2.5 bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>{t.videosPageAddBtn}</span>
              </button>
            </div>
          )}
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-3xl border border-slate-200/60 shadow-sm space-y-3">
            <Youtube className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-700">{t.videosPageEmptyTitle}</div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">{t.videosPageEmptyDesc}</p>
            <div className="pt-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn-pill-3d px-5 py-2 bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-xs shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.videosPageAddBtn}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">

            {/* Left: Video List */}
            <div className="lg:col-span-4 order-2 lg:order-1 space-y-2.5 glass-card p-4 rounded-3xl border border-white/80 shadow-md">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1 pb-1 border-b border-slate-100">
                <span className="flex items-center gap-1.5">
                  <Youtube className="w-3.5 h-3.5 text-[#E81A7F]" />
                  <span>{videos.length} {t.videosPageCountSuffix}</span>
                </span>
                <span className="text-[10px] text-pink-600 font-mono font-bold bg-pink-50 px-2 py-0.5 rounded-full">HD 1080p</span>
              </div>
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
                {videos.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVideo(v)}
                    className={`w-full text-left flex items-center gap-3 p-2.5 rounded-2xl border transition-all cursor-pointer group ${
                      selectedVideo?.id === v.id
                        ? 'bg-gradient-to-r from-pink-50 to-purple-50/40 border-pink-300 ring-2 ring-pink-400/40 shadow-sm'
                        : 'bg-white/70 hover:bg-white border-slate-100 hover:border-pink-200 shadow-xs'
                    }`}
                  >
                    <div className="relative w-24 h-16 shrink-0 rounded-xl overflow-hidden bg-slate-900 shadow-xs group-hover:scale-105 transition-transform duration-300">
                      <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                        <PlayCircle className="w-6 h-6 text-white drop-shadow-md group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-[#E81A7F] transition-colors">
                        {v.title}
                      </div>
                    </div>
                    {isAdmin && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => handleDeleteVideo(e, v.id)}
                        title="Xóa video"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Big Player with 3D Depth Card */}
            <div className="lg:col-span-8 order-1 lg:order-2">
              {selectedVideo && (
                <div className="glass-card p-2 sm:p-3 rounded-3xl border border-white shadow-xl">
                  <div className="rounded-2xl overflow-hidden bg-black aspect-video relative shadow-inner">
                    <iframe
                      key={selectedVideo.id}
                      src={getYouTubeEmbedUrl(selectedVideo.youtubeId)}
                      title={selectedVideo.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E81A7F] animate-ping shrink-0" />
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {selectedVideo.title}
                      </h3>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono font-semibold shrink-0 bg-slate-100 px-2.5 py-1 rounded-full">
                      YouTube Player
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      <VideoAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaved={(savedVideo) => {
          setSelectedVideo(savedVideo);
          refreshVideos();
        }}
      />
    </div>
  );
};


