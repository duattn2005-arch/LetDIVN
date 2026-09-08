import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Plus, Edit3, Trash2, ArrowLeftRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/dbService';
import { WhatWeDoItem } from '../../types';
import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';
import { WhatWeDoEditorModal } from '../WhatWeDoEditorModal';
import { useAutoTranslate, useAutoTranslateList } from '../../hooks/useAutoTranslate';

// Admin-entered content (title/desc/badge/highlights) is free text typed in
// whatever language the admin used, with no per-language storage of its own
// — unlike the site's fixed UI chrome. Split into its own component (rather
// than inlining this in the .map() below) purely so each item's translation
// hooks — a fixed set of hook calls per card — can run per item regardless
// of how many activities or highlight lines it has.
const WhatWeDoActivityCard: React.FC<{
  item: WhatWeDoItem;
  isAdmin: boolean;
  onToggleLayout: (item: WhatWeDoItem) => void;
  onEdit: (item: WhatWeDoItem) => void;
  onDelete: (id: string, title: string) => void;
}> = ({ item, isAdmin, onToggleLayout, onEdit, onDelete }) => {
  const isImageLeft = item.layout !== 'image-right';
  const translatedBadge = useAutoTranslate(item.badge || '');
  const translatedTitle = useAutoTranslate(item.title);
  const translatedDesc = useAutoTranslate(item.desc);
  const translatedHighlights = useAutoTranslateList(item.highlights || []);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
      {/* Admin Quick Action Floating Buttons */}
      {isAdmin && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-md">
          <button
            type="button"
            onClick={() => onToggleLayout(item)}
            className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
            title="Swap image side (left / right)"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Swap side</span>
          </button>
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="p-1.5 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
            title="Edit content & image"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id, item.title)}
            className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
            title="Delete this item"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

        {/* Photo Column */}
        <div className={`lg:col-span-6 ${isImageLeft ? 'lg:order-1' : 'lg:order-2'}`}>
          <div className="rounded-2xl overflow-hidden shadow-md border border-slate-100 aspect-16/10 bg-slate-900 group-hover:shadow-lg transition-shadow">
            <EditableImage
              contentKey={`whatWeDo.${item.id}.img`}
              defaultValue={item.image}
              alt={item.title}
              wrapperClassName="w-full h-full"
              className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Text & Content Column */}
        <div className={`lg:col-span-6 space-y-4 ${isImageLeft ? 'lg:order-2' : 'lg:order-1'}`}>
          {/* Badge */}
          {item.badge && (
            <span className="inline-block bg-pink-100/90 text-[#E81A7F] text-[11px] font-black uppercase px-3 py-1 rounded-full tracking-wide">
              {translatedBadge}
            </span>
          )}

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#E81A7F] leading-tight">
            <EditableText
              contentKey={`whatWeDo.${item.id}.title`}
              defaultValue={translatedTitle}
              as="span"
            />
          </h2>

          {/* Description */}
          <div className="text-sm sm:text-base text-slate-600 leading-relaxed">
            <EditableText
              contentKey={`whatWeDo.${item.id}.desc`}
              defaultValue={translatedDesc}
              as="p"
              multiline
            />
          </div>

          {/* Highlights / Features (if present) */}
          {translatedHighlights.length > 0 && (
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {translatedHighlights.map((hl, hIdx) => (
                <div key={hIdx} className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{hl}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export const WhatWeDoPage: React.FC<{ onExploreProjects: () => void }> = ({ onExploreProjects }) => {
  const { t, language } = useLanguage();
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
    if (window.confirm(language === 'vi' ? `Bạn có chắc muốn xóa hoạt động "${title}" không?` : `Are you sure you want to delete "${title}"?`)) {
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
    <div className="py-14 sm:py-20 bg-slate-50/70 select-none min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* Header Title & Mission statement */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <EditableText
            contentKey="whatWeDo.title"
            defaultValue={t.whatWeDoTitle || (language === 'vi' ? 'CHÚNG TÔI LÀM GÌ' : 'WHAT WE DO')}
            as="h1"
            className="text-4xl sm:text-5xl font-black metallic-title tracking-tight uppercase"
          />
          
          <div className="space-y-2 pt-1">
            <EditableText
              contentKey="whatWeDo.missionSubtitle"
              defaultValue={language === 'vi' ? "Tại Let’s Do It! Vietnam, sứ mệnh của chúng tôi là biến đất nước tươi đẹp của chúng ta thành một nơi trong lành, xanh sạch và đáng sống hơn." : "At Let’s Do It! Vietnam, we’re on a mission to transform our beautiful country into a cleaner, greener haven."}
              as="p"
              multiline
              className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed max-w-3xl mx-auto"
            />
            <EditableText
              contentKey="whatWeDo.differenceSubtitle"
              defaultValue={language === 'vi' ? "Dưới đây là cách chúng tôi tạo nên sự khác biệt:" : "Here’s how we make a difference:"}
              as="p"
              className="text-sm sm:text-base text-slate-500 font-semibold"
            />
          </div>

          {/* Admin Add New Section Button */}
          {isAdmin && (
            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={handleOpenAdd}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-emerald-500/50 hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'vi' ? 'Thêm Hoạt Động Mới (Ảnh & Chữ)' : 'Add New Activity (Image & Text)'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Dynamic List of What We Do Activities */}
        <div className="space-y-10">
          {items.map((item) => (
            <WhatWeDoActivityCard
              key={item.id}
              item={item}
              isAdmin={isAdmin}
              onToggleLayout={handleToggleLayout}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* Process Steps */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-8 shadow-2xl">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <EditableText contentKey="whatWeDo.processTitle" defaultValue="Quy Trình Một Chiến Dịch Dọn Rác Chuẩn Hóa" as="h2" className="text-2xl sm:text-3xl font-black" />
            <p className="text-xs sm:text-sm text-slate-400">
              <EditableText contentKey="whatWeDo.processSubtitlePrefix" defaultValue="Các bước thực hiện an toàn và khoa học của" as="span" /> <span className="whitespace-nowrap">Let's do it! Vietnam</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-center">
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
              <div className="w-8 h-8 rounded-full bg-[#E81A7F] text-white font-black text-sm flex items-center justify-center mx-auto mb-3">1</div>
              <EditableText contentKey="whatWeDo.step1Title" defaultValue="Khảo sát điểm đen" as="h4" className="font-bold text-sm text-white" />
              <EditableText contentKey="whatWeDo.step1Desc" defaultValue="Đo đạc diện tích & phân loại loại hình rác ô nhiễm" as="p" className="text-xs text-slate-400 mt-1" />
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
              <div className="w-8 h-8 rounded-full bg-[#E81A7F] text-white font-black text-sm flex items-center justify-center mx-auto mb-3">2</div>
              <EditableText contentKey="whatWeDo.step2Title" defaultValue="Huy động tình nguyện" as="h4" className="font-bold text-sm text-white" />
              <EditableText contentKey="whatWeDo.step2Desc" defaultValue="Mở cổng đăng ký & trang bị bảo hộ chuyên dụng" as="p" className="text-xs text-slate-400 mt-1" />
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
              <div className="w-8 h-8 rounded-full bg-[#E81A7F] text-white font-black text-sm flex items-center justify-center mx-auto mb-3">3</div>
              <EditableText contentKey="whatWeDo.step3Title" defaultValue="Ra quân & Phân loại" as="h4" className="font-bold text-sm text-white" />
              <EditableText contentKey="whatWeDo.step3Desc" defaultValue="Thu gom & phân loại nhựa, rác hữu cơ, rác độc hại" as="p" className="text-xs text-slate-400 mt-1" />
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
              <div className="w-8 h-8 rounded-full bg-[#E81A7F] text-white font-black text-sm flex items-center justify-center mx-auto mb-3">4</div>
              <EditableText contentKey="whatWeDo.step4Title" defaultValue="Bàn giao & Tái chế" as="h4" className="font-bold text-sm text-white" />
              <EditableText contentKey="whatWeDo.step4Desc" defaultValue="Cân đo khối lượng & chuyển giao nhà máy xử lý" as="p" className="text-xs text-slate-400 mt-1" />
            </div>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={onExploreProjects}
              className="bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-lg hover:shadow-pink-500/25 transition-all inline-flex items-center gap-2 cursor-pointer hover:scale-105"
            >
              <EditableText contentKey="whatWeDo.ctaBtn" defaultValue={t.whatWeDoExploreProjectsBtn} as="span" />
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

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
