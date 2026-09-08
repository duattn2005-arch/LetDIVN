import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, ArrowLeftRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/dbService';
import { WhatWeDoItem } from '../../types';
import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';
import { WhatWeDoEditorModal } from '../WhatWeDoEditorModal';
import { TakeActionStrip } from '../TakeActionStrip';

const BRAND_PINK = '#F1138D';

export const WhatWeDoPage: React.FC<{ onExploreProjects: () => void }> = () => {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<WhatWeDoItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WhatWeDoItem | null>(null);

  useEffect(() => {
    const refresh = () => { dbService.getWhatWeDo().then(setItems); };
    refresh();
    const unsub = dbService.subscribe(refresh);
    return unsub;
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: WhatWeDoItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      dbService.deleteWhatWeDo(id);
    }
  };

  const handleToggleLayout = (item: WhatWeDoItem) => {
    const newLayout = item.layout === 'image-left' ? 'image-right' : 'image-left';
    dbService.updateWhatWeDo({ ...item, layout: newLayout });
  };

  const handleSaveItem = (data: Omit<WhatWeDoItem, 'id'> | WhatWeDoItem) => {
    if ('id' in data && data.id) {
      dbService.updateWhatWeDo(data as WhatWeDoItem);
    } else {
      dbService.addWhatWeDo(data);
    }
  };

  return (
    <div className="bg-white select-none min-h-screen">

      {/* Full-width hero banner */}
      <EditableImage
        contentKey="whatWeDo.heroImage"
        defaultValue="/images/what-we-do/hero.jpg"
        alt="Collected recyclable waste"
        wrapperClassName="w-full aspect-21/9 sm:h-[300px] sm:aspect-auto bg-slate-900"
        className="w-full h-full object-cover"
      />

      <div className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Header Title & Mission statement */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <EditableText
            contentKey="whatWeDo.title"
            defaultValue="WHAT WE DO"
            as="h1"
            className="ref-heading text-3xl sm:text-4xl lg:text-[45px]"
            render={(v) => <span style={{ color: BRAND_PINK }}>{v}</span>}
          />

          <EditableText
            contentKey="whatWeDo.missionSubtitle"
            defaultValue="At Let's Do It! Vietnam, we're on a mission to transform our beautiful country into a cleaner, greener haven."
            as="p"
            multiline
            className="ref-body text-sm sm:text-base text-slate-600 leading-relaxed"
          />
          <EditableText
            contentKey="whatWeDo.differenceSubtitle"
            defaultValue="Here's how we make a difference:"
            as="p"
            className="ref-body text-sm sm:text-base text-slate-600"
          />

          {/* Admin Add New Section Button */}
          {isAdmin && (
            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={handleOpenAdd}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-emerald-500/50 hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Activity (Image & Text)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic List of What We Do Activities: alternating image-left / image-right bands */}
      <div>
        {items.map((item, idx) => {
          const isImageLeft = item.layout !== 'image-right';

          return (
            <div
              key={item.id}
              className={`relative group ${idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}`}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr] gap-10 items-center">

                {/* Photo Column */}
                <div className={isImageLeft ? 'order-1' : 'order-1 md:order-2'}>
                  <EditableImage
                    contentKey={`whatWeDo.${item.id}.img`}
                    defaultValue={item.image}
                    alt={item.title}
                    wrapperClassName="aspect-3/2 p-2 bg-white border border-slate-200 shadow-lg rounded-sm"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Text Column */}
                <div className={`space-y-3 ${isImageLeft ? 'order-2' : 'order-2 md:order-1'}`}>
                  <h2 className="ref-heading text-xl sm:text-2xl">
                    <EditableText
                      contentKey={`whatWeDo.${item.id}.title`}
                      defaultValue={item.title}
                      as="span"
                      render={(v) => <span style={{ color: BRAND_PINK }}>{v}</span>}
                    />
                  </h2>
                  <div className="ref-body text-sm sm:text-base text-slate-600 leading-relaxed">
                    <EditableText
                      contentKey={`whatWeDo.${item.id}.desc`}
                      defaultValue={item.desc}
                      as="p"
                      multiline
                    />
                  </div>
                </div>
              </div>

              {/* Admin Quick Action Floating Buttons */}
              {isAdmin && (
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleToggleLayout(item)}
                    className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                    title="Swap image side (left / right)"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Swap side</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                    title="Edit content & image"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                    title="Delete this item"
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

      <TakeActionStrip contentKeyPrefix="whatWeDo" />

      {/* Editor Modal for Adding & Editing Activities */}
      <WhatWeDoEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        itemToEdit={editingItem}
        onSave={handleSaveItem}
      />
    </div>
  );
};
