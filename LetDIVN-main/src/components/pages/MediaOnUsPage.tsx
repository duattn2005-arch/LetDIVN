import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, FileText, Sparkles } from 'lucide-react';
import { dbService } from '../../services/dbService';
import { MediaCoverageEntry } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAutoTranslate } from '../../hooks/useAutoTranslate';
import { EditableText } from '../EditableText';
import { MediaCoverageEditorModal } from '../MediaCoverageEditorModal';

// One row of the list — its own component so useAutoTranslate (a fixed hook
// call per row) works regardless of how many rows exist, same reasoning as
// WhatWeDoActivityCard.
const MediaCoverageRow: React.FC<{
  item: MediaCoverageEntry;
  isAdmin: boolean;
  onEdit: (item: MediaCoverageEntry) => void;
  onDelete: (item: MediaCoverageEntry) => void;
}> = ({ item, isAdmin, onEdit, onDelete }) => {
  const translatedTitle = useAutoTranslate(item.title);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 py-6 border-b border-slate-100 last:border-0">
      <img
        src={item.image}
        alt={translatedTitle}
        className="w-full sm:w-40 h-28 rounded-2xl object-cover shrink-0 shadow-sm border border-slate-100"
      />

      <div className="flex items-center gap-8 sm:gap-10">
        <div className="text-center">
          <div className="text-3xl sm:text-4xl font-black text-[#E81A7F] leading-none">{item.articleCount}</div>
          <div className="text-xs text-slate-500 font-semibold mt-1">Article</div>
        </div>
        <div className="text-center">
          <div className="text-3xl sm:text-4xl font-black text-orange-500 leading-none">{item.segmentCount}</div>
          <div className="text-xs text-slate-500 font-semibold mt-1">Segment</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center sm:items-start gap-1.5">
        <a
          href={item.pdfUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-sm px-6 py-2.5 rounded-full shadow-md transition-all"
        >
          <FileText className="w-4 h-4" />
          <span>{translatedTitle}</span>
        </a>
        <span className="text-xs text-slate-400 italic">Click to see media coverage on activities</span>
      </div>

      {isAdmin && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(item)}
            title="Chỉnh sửa"
            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            title="Xóa"
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export const MediaOnUsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();
  const [items, setItems] = useState<MediaCoverageEntry[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaCoverageEntry | null>(null);

  const refresh = () => { dbService.getMediaCoverage().then(setItems); };

  useEffect(() => {
    refresh();
    const unsub = dbService.subscribe(refresh);
    return unsub;
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (item: MediaCoverageEntry) => {
    setEditingItem(item);
    setIsEditorOpen(true);
  };

  const handleDelete = (item: MediaCoverageEntry) => {
    if (window.confirm(`Bạn có chắc muốn xóa mục "${item.title}" không?`)) {
      dbService.deleteMediaCoverage(item.id);
    }
  };

  const handleSave = (data: Omit<MediaCoverageEntry, 'id'> | MediaCoverageEntry) => {
    if ('id' in data && data.id) {
      dbService.updateMediaCoverage(data as MediaCoverageEntry);
    } else {
      dbService.addMediaCoverage(data);
    }
  };

  return (
    <div className="py-16 bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        <div className="text-center max-w-3xl mx-auto space-y-4">
          <EditableText
            contentKey="mediaOnUs.title"
            defaultValue={t.newsPageTitleMedia || 'Media on Us'}
            as="h1"
            className="text-3xl sm:text-4xl lg:text-5xl font-black metallic-title tracking-tight leading-tight [text-wrap:balance]"
          />
          <EditableText
            contentKey="mediaOnUs.subtitle"
            defaultValue="We are delighted to have received enthusiastic and proactive support from the press network in Vietnam. We firmly believe that achieving significant goals is possible only with community support through the influence of the press and social media."
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto [text-wrap:balance]"
          />

          {isAdmin && (
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Mục Báo Chí Mới</span>
              </button>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm flex flex-col items-center gap-2">
            <Sparkles className="w-6 h-6" />
            <span>Chưa có mục báo chí nào được thêm.</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <MediaCoverageRow
                key={item.id}
                item={item}
                isAdmin={isAdmin}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <MediaCoverageEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        itemToEdit={editingItem}
        onSave={handleSave}
      />
    </div>
  );
};
