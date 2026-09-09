import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/dbService';
import { MediaCoverageEntry } from '../../types';
import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';
import { TakeActionStrip } from '../TakeActionStrip';
import { MediaCoverageEditorModal } from '../MediaCoverageEditorModal';

const BRAND_PINK = '#F1138D';

export const MediaOnUsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [entries, setEntries] = useState<MediaCoverageEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaCoverageEntry | null>(null);

  useEffect(() => {
    const refresh = () => { dbService.getMediaCoverage().then(setEntries); };
    refresh();
    const unsub = dbService.subscribe(refresh);
    return unsub;
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MediaCoverageEntry) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      dbService.deleteMediaCoverage(id);
    }
  };

  const handleSaveItem = (data: Omit<MediaCoverageEntry, 'id'> | MediaCoverageEntry) => {
    if ('id' in data && data.id) {
      dbService.updateMediaCoverage(data as MediaCoverageEntry);
    } else {
      dbService.addMediaCoverage(data);
    }
  };

  return (
    <div className="bg-white">

      {/* Full-width hero banner */}
      <EditableImage
        contentKey="mediaOnUsPage.heroImage"
        defaultValue="/images/media-on-us/m07.jpg"
        alt="Media coverage"
        wrapperClassName="w-full aspect-21/9 sm:h-[300px] sm:aspect-auto bg-slate-900"
        className="w-full h-full object-cover"
      />

      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        <div className="text-center max-w-6xl mx-auto space-y-4">
          <EditableText
            contentKey="mediaOnUsPage.title"
            defaultValue="Media on Us"
            as="h1"
            className="ref-heading text-3xl sm:text-4xl lg:text-[45px] [text-wrap:balance]"
            render={(v) => <span style={{ color: BRAND_PINK }}>{v}</span>}
          />
          <EditableText
            contentKey="mediaOnUsPage.subtitle"
            defaultValue="We are delighted to have received enthusiastic and proactive support from the press network in Vietnam. We firmly believe that achieving significant goals is possible only with community support through the influence of the press and social media."
            as="p"
            className="ref-body text-sm sm:text-base text-slate-600 leading-relaxed [text-wrap:balance]"
            multiline
          />

          {isAdmin && (
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handleOpenAdd}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-emerald-500/50 hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Coverage Entry</span>
              </button>
            </div>
          )}
        </div>

        <div className="max-w-6xl mx-auto space-y-12">
          {entries.map((entry) => {
            const entryKey = `mediaOnUsPage.entry.${entry.id}`;
            return (
              <div key={entry.id} className="relative group flex flex-wrap items-center gap-x-12 gap-y-5">
                <EditableImage
                  contentKey={`${entryKey}.image`}
                  defaultValue={entry.image}
                  alt={entry.title}
                  wrapperClassName="w-[28rem] aspect-3/2 bg-slate-900 shrink-0"
                  className="w-full h-full object-cover"
                />

                <div className="w-20 text-center shrink-0">
                  <EditableText
                    contentKey={`${entryKey}.articles`}
                    defaultValue={String(entry.articles)}
                    as="div"
                    className="text-5xl sm:text-6xl font-black"
                    render={(v) => <span style={{ color: BRAND_PINK }}>{v}</span>}
                  />
                  <div className="text-base text-slate-500 mt-1">Article</div>
                </div>

                <div className="w-20 text-center shrink-0">
                  <EditableText
                    contentKey={`${entryKey}.segments`}
                    defaultValue={String(entry.segments)}
                    as="div"
                    className="text-5xl sm:text-6xl font-black text-orange-500"
                  />
                  <div className="text-base text-slate-500 mt-1">Segment</div>
                </div>

                <a
                  href={entry.pdf}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-1.5 shrink-0"
                >
                  <span className="inline-flex items-center px-10 py-4 rounded-full text-white text-lg font-bold shadow-sm bg-[#DA1984] hover:bg-[#EBC61C] transition-colors">
                    <EditableText contentKey={`${entryKey}.title`} defaultValue={entry.title} as="span" />
                  </span>
                  <span className="ref-body text-sm italic text-slate-400">Click to see media coverage on activities</span>
                </a>

                {isAdmin && (
                  <div className="absolute top-0 right-0 z-20 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(entry)}
                      className="p-1.5 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                      title="Edit article/segment counts & PDF link"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id, entry.title)}
                      className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                      title="Delete this entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      <TakeActionStrip contentKeyPrefix="mediaOnUsPage" />

      <MediaCoverageEditorModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
        itemToEdit={editingItem}
        onSave={handleSaveItem}
      />
    </div>
  );
};
