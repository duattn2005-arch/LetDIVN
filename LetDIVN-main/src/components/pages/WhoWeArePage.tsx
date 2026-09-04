import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  Trees, 
  UserCheck, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/dbService';
import { WhoWeAreItem } from '../../types';
import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';
import { WhoWeAreEditorModal } from '../WhoWeAreEditorModal';

export const WhoWeArePage: React.FC<{ onJoin?: () => void }> = () => {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<WhoWeAreItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WhoWeAreItem | null>(null);

  useEffect(() => {
    const refresh = () => {
      dbService.getWhoWeAre().then((res) => {
        if (res && res.length > 0) {
          setItems(res);
        }
      });
    };
    refresh();
    const unsub = dbService.subscribe(refresh);
    return unsub;
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: WhoWeAreItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete section "${title}"?`)) {
      dbService.deleteWhoWeAre(id);
    }
  };

  const handleToggleLayout = (item: WhoWeAreItem) => {
    const newLayout = item.layout === 'image-left' ? 'image-right' : 'image-left';
    dbService.updateWhoWeAre({ ...item, layout: newLayout });
  };

  const handleSaveItem = (data: Omit<WhoWeAreItem, 'id'> | WhoWeAreItem) => {
    if ('id' in data && data.id) {
      dbService.updateWhoWeAre(data as WhoWeAreItem);
    } else {
      dbService.addWhoWeAre(data);
    }
  };

  return (
    <div className="py-10 sm:py-16 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">

        {/* 1. Top Full Banner Image */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-slate-100 aspect-21/9 bg-slate-900">
          <EditableImage
            contentKey="whoWeAre.bannerImage"
            defaultValue="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=2000&auto=format&fit=crop&q=90"
            alt="Let's do it Vietnam Volunteer Group"
            wrapperClassName="w-full h-full"
            className="w-full h-full object-cover"
          />
        </div>

        {/* 2. WHO WE ARE Header & Intro */}
        <div className="text-center max-w-4xl mx-auto space-y-5">
          <EditableText
            contentKey="whoWeAre.mainTitle"
            defaultValue="WHO WE ARE"
            as="h1"
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#E81A7F] tracking-tight uppercase"
          />
          <EditableText
            contentKey="whoWeAre.mainIntro"
            defaultValue="We’re a diverse group of people, all bound together by something even bigger than collecting trash: working together to engage the Vietnam communities and share our passion for the beauty of the natural world."
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl mx-auto"
          />

          {isAdmin && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-full text-xs font-bold text-purple-700">
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Mode: Click text to edit or use buttons below to manage sections</span>
            </div>
          )}
        </div>

        {/* 3. 3 Core Values (Clean, Natural, Authentic) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 max-w-5xl mx-auto text-center pt-2">
          {/* Clean */}
          <div className="space-y-3 px-4 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-[#E81A7F] shadow-xs">
              <Leaf className="w-6 h-6" />
            </div>
            <EditableText
              contentKey="whoWeAre.valCleanTitle"
              defaultValue="Clean"
              as="h3"
              className="text-lg sm:text-xl font-bold text-slate-900"
            />
            <EditableText
              contentKey="whoWeAre.valCleanDesc"
              defaultValue="We take pride in engaging with beauty and its power to ignite inspiration."
              as="p"
              multiline
              className="text-xs sm:text-sm text-slate-600 leading-relaxed"
            />
          </div>

          {/* Natural */}
          <div className="space-y-3 px-4 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-[#E81A7F] shadow-xs">
              <Trees className="w-6 h-6" />
            </div>
            <EditableText
              contentKey="whoWeAre.valNaturalTitle"
              defaultValue="Natural"
              as="h3"
              className="text-lg sm:text-xl font-bold text-slate-900"
            />
            <EditableText
              contentKey="whoWeAre.valNaturalDesc"
              defaultValue="We draw inspiration from the unparalleled beauty of the natural world and promote its integration into our constructed surroundings."
              as="p"
              multiline
              className="text-xs sm:text-sm text-slate-600 leading-relaxed"
            />
          </div>

          {/* Authentic */}
          <div className="space-y-3 px-4 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-[#E81A7F] shadow-xs">
              <UserCheck className="w-6 h-6" />
            </div>
            <EditableText
              contentKey="whoWeAre.valAuthenticTitle"
              defaultValue="Authentic"
              as="h3"
              className="text-lg sm:text-xl font-bold text-slate-900"
            />
            <EditableText
              contentKey="whoWeAre.valAuthenticDesc"
              defaultValue="Embracing our identity, we proudly showcase our passion as a local, ethical, imperfect, and authentic entity."
              as="p"
              multiline
              className="text-xs sm:text-sm text-slate-600 leading-relaxed"
            />
          </div>
        </div>

        {/* 3b. Wide Community Photo */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-slate-100 aspect-21/9 bg-slate-900">
          <EditableImage
            contentKey="whoWeAre.midImage"
            defaultValue="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=2000&auto=format&fit=crop&q=90"
            alt="Let's do it Vietnam volunteers at a cleanup event"
            wrapperClassName="w-full h-full"
            className="w-full h-full object-cover"
          />
        </div>

        {/* 4. Promoting Sustainability and Community Action */}
        <div className="text-center max-w-4xl mx-auto space-y-4 pt-6 sm:pt-10">
          <EditableText
            contentKey="whoWeAre.section2Title"
            defaultValue="Promoting Sustainability and Community Action"
            as="h2"
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#E81A7F] tracking-tight"
          />
          <EditableText
            contentKey="whoWeAre.section2Desc"
            defaultValue="Let’s Do It Vietnam is a vibrant and dedicated organization committed to environmental sustainability and community action. As part of the global Let’s Do It World movement, we focus on addressing waste management issues, promoting recycling, and fostering a cleaner, greener Vietnam. Our activities range from large-scale cleanup events to educational campaigns, engaging volunteers and communities across the country."
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-4xl mx-auto"
          />

          {/* Admin Add New Section Button */}
          {isAdmin && (
            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={handleOpenAdd}
                className="bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Section (Image & Text)</span>
              </button>
            </div>
          )}
        </div>

        {/* 5. Dynamic Story / Article Sections */}
        <div className="space-y-16 sm:space-y-24 max-w-6xl mx-auto">
          {items.map((item) => {
            const isImageLeft = item.layout !== 'image-right';

            return (
              <div
                key={item.id}
                className="relative bg-white rounded-3xl p-4 sm:p-8 border border-slate-100 hover:border-slate-200 shadow-xs hover:shadow-lg transition-all group"
              >
                {/* Admin Quick Action Floating Bar */}
                {isAdmin && (
                  <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-md">
                    <button
                      type="button"
                      onClick={() => handleToggleLayout(item)}
                      className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                      title="Swap Side (Left / Right)"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Swap Side</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                      title="Edit Section"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                      title="Delete Section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                )}

                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${
                  isImageLeft ? '' : 'lg:grid-flow-dense'
                }`}>
                  {/* Image Column */}
                  <div className={`lg:col-span-6 ${isImageLeft ? '' : 'lg:col-start-7'}`}>
                    <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-slate-100 aspect-4/3 bg-slate-100 group-hover:shadow-xl transition-all">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Text Column */}
                  <div className={`lg:col-span-6 space-y-4 ${isImageLeft ? '' : 'lg:col-start-1'}`}>
                    <h3 className="text-2xl sm:text-3xl font-bold text-[#E81A7F] tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
                      {item.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Admin Add/Edit Modal */}
      <WhoWeAreEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        itemToEdit={editingItem}
        onSave={handleSaveItem}
      />
    </div>
  );
};
