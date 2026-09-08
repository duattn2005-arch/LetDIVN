import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, ArrowLeftRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import { CampaignSection } from '../types';
import { WhoWeAreEditorModal } from './WhoWeAreEditorModal';

interface CampaignSectionsProps {
  /** Which campaign page these sections belong to, e.g. 'world-cleanup-day'. */
  page: string;
}

/**
 * Admin-extendable image+text blocks appended to the bottom of a campaign
 * info page. Shared across all five campaign pages instead of hand-rolling
 * the same add/edit/delete UI five times — see WhoWeArePage.tsx for the
 * pattern this was lifted from.
 */
export const CampaignSections: React.FC<CampaignSectionsProps> = ({ page }) => {
  const { isAdmin } = useAuth();
  const [sections, setSections] = useState<CampaignSection[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<CampaignSection | null>(null);

  useEffect(() => {
    const refresh = () => { dbService.getCampaignSections(page).then(setSections); };
    refresh();
    const unsub = dbService.subscribe(refresh);
    return unsub;
  }, [page]);

  const handleOpenAdd = () => {
    setEditingSection(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (section: CampaignSection) => {
    setEditingSection(section);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete section "${title}"?`)) {
      dbService.deleteCampaignSection(id);
    }
  };

  const handleToggleLayout = (section: CampaignSection) => {
    dbService.updateCampaignSection({
      ...section,
      layout: section.layout === 'image-right' ? 'image-left' : 'image-right',
    });
  };

  const handleSave = (data: any) => {
    if (data.id) {
      dbService.updateCampaignSection({ ...data, page });
    } else {
      dbService.addCampaignSection({ ...data, page });
    }
  };

  if (sections.length === 0 && !isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {sections.length > 0 && (
        <div className="space-y-14 mb-14">
          {sections.map((section) => {
            const isImageLeft = section.layout !== 'image-right';
            return (
              <div key={section.id} className="relative group">
                {isAdmin && (
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleToggleLayout(section)}
                      className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Swap Side (Left / Right)"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(section)}
                      className="p-1.5 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit Section"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(section.id, section.title)}
                      className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Delete Section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className={`rounded-2xl overflow-hidden aspect-3/2 bg-slate-100 ${isImageLeft ? '' : 'order-1 lg:order-2'}`}>
                    <img
                      src={section.image}
                      alt={section.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div
                    className={isImageLeft ? '' : 'order-2 lg:order-1'}
                    style={{ textAlign: section.textAlign || 'left' }}
                  >
                    <h3 className="text-xl sm:text-2xl font-black text-[#E81A7F] tracking-tight mb-3">
                      {section.title}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isAdmin && (
        <div className="flex justify-center mb-14">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Section (Image & Text)</span>
          </button>
        </div>
      )}

      <WhoWeAreEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        itemToEdit={editingSection as any}
        onSave={handleSave}
      />
    </div>
  );
};
