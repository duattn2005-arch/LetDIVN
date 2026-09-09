import React, { useState, useEffect } from 'react';
import { Leaf, TreePine, PersonStanding, ShieldCheck, Plus, Edit3, Trash2, ArrowLeftRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/dbService';
import { WhoWeAreItem } from '../../types';
import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';
import { WhoWeAreSectionEditorModal } from '../WhoWeAreSectionEditorModal';

const BRAND_PINK = '#F1138D';

export const WhoWeArePage: React.FC<{ onJoin: () => void }> = () => {
  const { isAdmin } = useAuth();
  const [sections, setSections] = useState<WhoWeAreItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WhoWeAreItem | null>(null);

  useEffect(() => {
    const refresh = () => { dbService.getWhoWeAreSections().then(setSections); };
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
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      dbService.deleteWhoWeAreSection(id);
    }
  };

  const handleToggleLayout = (item: WhoWeAreItem) => {
    const newLayout = item.layout === 'image-left' ? 'image-right' : 'image-left';
    dbService.updateWhoWeAreSection({ ...item, layout: newLayout });
  };

  const handleSaveItem = (data: Omit<WhoWeAreItem, 'id'> | WhoWeAreItem) => {
    if ('id' in data && data.id) {
      dbService.updateWhoWeAreSection(data as WhoWeAreItem);
    } else {
      dbService.addWhoWeAreSection(data);
    }
  };

  return (
    <div className="bg-white">

      {/* Full-width hero banner */}
      <EditableImage
        contentKey="whoWeAre.heroImage"
        defaultValue="/images/who-we-are/hero.jpg"
        alt="Let's Do It Vietnam World Cleanup Day volunteers"
        wrapperClassName="w-full aspect-21/9 sm:h-[420px] sm:aspect-auto bg-slate-900"
        className="w-full h-full object-cover"
      />

      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* Header */}
        <div className="text-center max-w-6xl mx-auto space-y-4">
          <EditableText
            contentKey="whoWeAre.title"
            defaultValue="WHO WE ARE"
            as="h1"
            className="ref-heading text-3xl sm:text-4xl lg:text-[45px] [text-wrap:balance]"
            render={(v) => <span style={{ color: BRAND_PINK }}>{v}</span>}
          />
          <EditableText
            contentKey="whoWeAre.intro"
            defaultValue="We're a diverse group of people, all bound together by something even bigger than collecting trash: working together to engage the Vietnam communities and share our passion for the beauty of the natural world."
            as="p"
            multiline
            className="ref-body text-base sm:text-lg text-slate-500 leading-relaxed [text-wrap:balance]"
          />
          {isAdmin && (
            <div className="flex flex-col items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-full text-xs font-bold text-purple-700">
                <ShieldCheck className="w-4 h-4" />
                <span>Hover over an image/text to edit (Admin)</span>
              </div>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-emerald-500/50 hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Section (Image & Text)</span>
              </button>
            </div>
          )}
        </div>

        {/* Core Values: Clean / Natural / Authentic */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
          <div className="space-y-2 flex flex-col items-center">
            <Leaf className="w-9 h-9" style={{ color: BRAND_PINK }} />
            <EditableText contentKey="whoWeAre.value1Title" defaultValue="Clean" as="h3" className="ref-heading text-lg" render={(v) => <span style={{ color: BRAND_PINK }}>{v}</span>} />
            <EditableText
              contentKey="whoWeAre.value1Desc"
              defaultValue="We take pride in engaging with beauty and its power to ignite inspiration."
              as="p"
              multiline
              className="ref-body text-sm text-slate-500 leading-relaxed"
            />
          </div>
          <div className="space-y-2 flex flex-col items-center">
            <TreePine className="w-9 h-9" style={{ color: BRAND_PINK }} />
            <EditableText contentKey="whoWeAre.value2Title" defaultValue="Natural" as="h3" className="ref-heading text-lg" render={(v) => <span style={{ color: BRAND_PINK }}>{v}</span>} />
            <EditableText
              contentKey="whoWeAre.value2Desc"
              defaultValue="We draw inspiration from the unparalleled beauty of the natural world and promote its integration into our constructed surroundings."
              as="p"
              multiline
              className="ref-body text-sm text-slate-500 leading-relaxed"
            />
          </div>
          <div className="space-y-2 flex flex-col items-center">
            <PersonStanding className="w-9 h-9" style={{ color: BRAND_PINK }} />
            <EditableText contentKey="whoWeAre.value3Title" defaultValue="Authentic" as="h3" className="ref-heading text-lg" render={(v) => <span style={{ color: BRAND_PINK }}>{v}</span>} />
            <EditableText
              contentKey="whoWeAre.value3Desc"
              defaultValue="Embracing our identity, we proudly showcase our passion as a local, ethical, imperfect, and authentic entity."
              as="p"
              multiline
              className="ref-body text-sm text-slate-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Photo strip */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <EditableImage
            contentKey="whoWeAre.stripImage1"
            defaultValue="/images/who-we-are/strip1.jpg"
            alt="Let's Do It Vietnam volunteers"
            wrapperClassName="sm:col-span-3 aspect-video sm:aspect-auto sm:h-[280px] bg-slate-900"
            className="w-full h-full object-cover object-bottom"
          />
          <EditableImage
            contentKey="whoWeAre.stripImage2"
            defaultValue="/images/who-we-are/strip2.jpg"
            alt="Let's Do It Vietnam volunteers"
            wrapperClassName="sm:col-span-2 aspect-video sm:aspect-auto sm:h-[280px] bg-slate-900"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Promoting Sustainability and Community Action (text only) */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <EditableText
            contentKey="whoWeAre.sustainabilityTitle"
            defaultValue="Promoting Sustainability and Community Action"
            as="h2"
            className="ref-heading text-2xl sm:text-3xl lg:text-[45px] [text-wrap:balance]"
            render={(v) => <span style={{ color: BRAND_PINK }}>{v}</span>}
          />
          <EditableText
            contentKey="whoWeAre.sustainabilityDesc"
            defaultValue="Let's Do It Vietnam is a vibrant and dedicated organization committed to environmental sustainability and community action. As part of the global Let's Do It World movement, we focus on addressing waste management issues, promoting recycling, and fostering a cleaner, greener Vietnam. Our activities range from large-scale cleanup events to educational campaigns, engaging volunteers and communities across the country."
            as="p"
            multiline
            className="ref-body text-sm sm:text-base text-slate-600 leading-relaxed"
          />
        </div>

      </div>

      {/* Where It All Began: image left, text right, gray band */}
      <div className="bg-[#F2F2F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr] gap-10 items-center">
          <EditableImage
            contentKey="whoWeAre.sustainabilityImage"
            defaultValue="/images/who-we-are/sustainability.jpg"
            alt="Let's Do It Vietnam cleanup event"
            wrapperClassName="aspect-3/2 p-2 bg-white border border-slate-200 shadow-lg rounded-sm"
            className="w-full h-full object-cover"
          />
          <div className="space-y-3">
            <EditableText
              contentKey="whoWeAre.beganTitle"
              defaultValue="Where It All Began"
              as="h2"
              className="ref-heading text-2xl sm:text-3xl lg:text-[45px] [text-wrap:balance]"
              render={(v) => <span style={{ color: BRAND_PINK }}>{v}</span>}
            />
            <EditableText
              contentKey="whoWeAre.beganDesc"
              defaultValue="Let's Do It Vietnam began as part of the global Let's Do It World movement, which originated in Estonia in 2008 with a massive cleanup event that inspired millions worldwide. Recognizing the urgent need for action in Vietnam, a group of passionate environmentalists and community leaders established Let's Do It Vietnam in 2015."
              as="p"
              multiline
              className="ref-body text-sm sm:text-base text-slate-600 leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Let's Do It Vietnam Today: text left, image right, white background */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
        <div className="space-y-3 order-2 md:order-1">
          <EditableText
            contentKey="whoWeAre.todayTitle"
            defaultValue="Let's Do It Vietnam Today"
            as="h2"
            className="ref-heading text-2xl sm:text-3xl lg:text-[45px] [text-wrap:balance]"
            render={(v) => <span style={{ color: BRAND_PINK }}>{v}</span>}
          />
          <EditableText
            contentKey="whoWeAre.todayDesc"
            defaultValue="Since its inception, Let's Do It Vietnam has grown exponentially, organizing nationwide cleanup events, educational workshops, and awareness campaigns to combat waste and promote environmental sustainability. The organization has mobilized thousands of volunteers, collaborated with local governments, businesses, and schools, and played a pivotal role in shaping a greener future for Vietnam. Through relentless dedication and community engagement, Let's Do It Vietnam continues to inspire positive change and environmental stewardship across the country."
            as="p"
            multiline
            className="ref-body text-sm sm:text-base text-slate-600 leading-relaxed"
          />
        </div>
        <EditableImage
          contentKey="whoWeAre.todayImage"
          defaultValue="/images/who-we-are/today.jpg"
          alt="Let's Do It Vietnam volunteers today"
          wrapperClassName="order-1 md:order-2 aspect-3/2 p-2 bg-white border border-slate-200 shadow-lg rounded-sm"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Admin-added extra sections: alternating image-left / image-right bands */}
      {sections.map((item, idx) => {
        const isImageLeft = item.layout !== 'image-right';

        return (
          <div
            key={item.id}
            className={`relative group ${idx % 2 === 0 ? 'bg-[#F2F2F2]' : 'bg-white'}`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr] gap-10 items-center">
              <div className={isImageLeft ? 'order-1' : 'order-1 md:order-2'}>
                <EditableImage
                  contentKey={`whoWeAre.section.${item.id}.img`}
                  defaultValue={item.image}
                  alt={item.title}
                  wrapperClassName="aspect-3/2 p-2 bg-white border border-slate-200 shadow-lg rounded-sm"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className={`space-y-3 ${isImageLeft ? 'order-2' : 'order-2 md:order-1'}`}>
                <h2 className="ref-heading text-2xl sm:text-3xl lg:text-[45px] [text-wrap:balance]">
                  <EditableText
                    contentKey={`whoWeAre.section.${item.id}.title`}
                    defaultValue={item.title}
                    as="span"
                    render={(v) => <span style={{ color: BRAND_PINK }}>{v}</span>}
                  />
                </h2>
                <div className="ref-body text-sm sm:text-base text-slate-600 leading-relaxed">
                  <EditableText
                    contentKey={`whoWeAre.section.${item.id}.desc`}
                    defaultValue={item.desc}
                    as="p"
                    multiline
                  />
                </div>
              </div>
            </div>

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
                  title="Delete this section"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            )}
          </div>
        );
      })}

      <WhoWeAreSectionEditorModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
        itemToEdit={editingItem}
        onSave={handleSaveItem}
      />

    </div>
  );
};
