import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Check, ChevronUp, ChevronDown, RotateCcw, Save } from 'lucide-react';
import { dbService } from '../services/dbService';
import { NewsArticle } from '../types';

interface SelectHomeNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const SELECTION_KEY = 'home.quickLinks.selectedNews';

export const SelectHomeNewsModal: React.FC<SelectHomeNewsModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [allNews, setAllNews] = useState<NewsArticle[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    Promise.all([
      dbService.getNews(),
      dbService.getContent(SELECTION_KEY, ''),
    ]).then(([news, raw]) => {
      const published = [...news]
        .filter((n) => n.status !== 'Pending')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAllNews(published);
      try {
        const parsed = raw ? JSON.parse(raw) : [];
        setSelectedIds(Array.isArray(parsed) ? parsed.filter((id) => published.some((n) => n.id === id)) : []);
      } catch {
        setSelectedIds([]);
      }
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const toggle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const move = (id: string, dir: -1 | 1) => {
    setSelectedIds((prev) => {
      const idx = prev.indexOf(id);
      const newIdx = idx + dir;
      if (idx < 0 || newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  };

  const handleSave = async () => {
    await dbService.setContent(SELECTION_KEY, JSON.stringify(selectedIds));
    onSaved();
    onClose();
  };

  const handleUseDefault = async () => {
    await dbService.resetContent(SELECTION_KEY);
    onSaved();
    onClose();
  };

  const filtered = allNews.filter((n) => n.title.toLowerCase().includes(search.toLowerCase()));
  const selectedArticles = selectedIds.map((id) => allNews.find((n) => n.id === id)).filter((n): n is NewsArticle => !!n);

  return typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Chọn bài viết hiển thị trên trang chủ (Admin)</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Không chọn bài nào = tự động hiện 6 bài mới nhất.</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4">
          {selectedArticles.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-500 mb-2">
                Đã chọn ({selectedArticles.length}) — thứ tự hiển thị từ trên xuống:
              </div>
              <div className="space-y-1.5">
                {selectedArticles.map((a, i) => (
                  <div key={a.id} className="flex items-center gap-2 bg-pink-50/60 border border-pink-200 rounded-lg px-2.5 py-1.5">
                    <span className="text-[10px] font-bold text-[#E81A7F] w-4 shrink-0">{i + 1}</span>
                    <img src={a.image} alt={a.title} className="w-8 h-8 rounded object-cover shrink-0" />
                    <span className="text-xs font-semibold text-slate-800 truncate flex-1">{a.title}</span>
                    <button type="button" onClick={() => move(a.id, -1)} disabled={i === 0} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => move(a.id, 1)} disabled={i === selectedArticles.length - 1} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => toggle(a.id)} className="p-1 text-red-400 hover:text-red-600 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm bài viết theo tiêu đề..."
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#E81A7F]"
              />
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto border border-slate-100 rounded-xl p-1.5">
              {filtered.map((a) => {
                const checked = selectedIds.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggle(a.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                      checked ? 'bg-pink-50 hover:bg-pink-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded shrink-0 border flex items-center justify-center ${checked ? 'bg-[#E81A7F] border-[#E81A7F]' : 'border-slate-300'}`}>
                      {checked && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <img src={a.image} alt={a.title} className="w-8 h-8 rounded object-cover shrink-0" />
                    <span className="text-xs text-slate-700 truncate flex-1">{a.title}</span>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-xs text-slate-400 text-center py-4">Không tìm thấy bài viết nào.</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 px-5 py-4 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={handleUseDefault}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Dùng mặc định (6 bài mới nhất)</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-[#E81A7F] hover:bg-[#D01370] text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;
};
