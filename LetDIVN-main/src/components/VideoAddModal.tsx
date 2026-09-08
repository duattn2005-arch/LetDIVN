import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Youtube, Save, AlertCircle, Loader2 } from 'lucide-react';
import { dbService } from '../services/dbService';
import { extractYouTubeId, getYouTubeThumbnail, fetchYouTubeTitle } from '../utils/youtube';
import { MediaVideo } from '../types';

interface VideoAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (video: MediaVideo) => void;
}

export const VideoAddModal: React.FC<VideoAddModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [url, setUrl] = useState('');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string | null>(null);
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setUrl('');
      setPreviewId(null);
      setPreviewTitle(null);
      setError(null);
      setIsSaving(false);
    }
  }, [isOpen]);

  // Auto-detect the video ID and fetch its real title as soon as a valid link is pasted.
  useEffect(() => {
    const id = extractYouTubeId(url);
    setPreviewId(id);
    setError(null);
    if (!id) {
      setPreviewTitle(null);
      return;
    }
    let cancelled = false;
    setIsFetchingPreview(true);
    fetchYouTubeTitle(id).then((title) => {
      if (cancelled) return;
      setPreviewTitle(title);
      setIsFetchingPreview(false);
    });
    return () => { cancelled = true; };
  }, [url]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewId) {
      setError('Link YouTube không hợp lệ. Vui lòng dán link dạng youtube.com/watch?v=... hoặc youtu.be/...');
      return;
    }
    try {
      setIsSaving(true);
      setError(null);
      const saved = await dbService.addVideo({
        youtubeId: previewId,
        title: previewTitle || 'Video Let\'s do it! Vietnam',
        thumbnailUrl: getYouTubeThumbnail(previewId)
      });
      if (onSaved) onSaved(saved);
      onClose();
    } catch (err: any) {
      console.error('Lỗi khi lưu video:', err);
      setError(err?.message || 'Không thể lưu video. Vui lòng kiểm tra lại đường truyền và thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  return typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Thêm Video Mới</h3>
              <p className="text-xs text-slate-400">Dán link YouTube — tiêu đề &amp; ảnh sẽ tự lấy về</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Link YouTube *
            </label>
            <input
              type="url"
              required
              autoFocus
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F] focus:ring-2 focus:ring-pink-100"
            />
          </div>

          {previewId && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <img
                src={getYouTubeThumbnail(previewId)}
                alt="preview"
                className="w-24 h-16 object-cover rounded-lg bg-slate-200 shrink-0"
              />
              <div className="min-w-0">
                {isFetchingPreview ? (
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang lấy tiêu đề...
                  </span>
                ) : (
                  <span className="text-sm font-bold text-slate-900 line-clamp-2">
                    {previewTitle || 'Video World Cleanup Day'}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving || !previewId}
              className="px-5 py-2 bg-[#E81A7F] hover:bg-[#D01370] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Thêm Video</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null;
};


