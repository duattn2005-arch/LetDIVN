import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/dbService';
import { CleanupEvent } from '../../types';
import { Calendar, MapPin, Users, ArrowRight, Sparkles, Filter, Plus, Edit3, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { EventEditorModal } from '../EventEditorModal';
import { EditableText } from '../EditableText';

interface ProjectsPageProps {
  onSelectProject: (id: string) => void;
  onRegisterVolunteer: (eventId?: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ 
  onSelectProject,
  onRegisterVolunteer 
}) => {
  const { isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const [events, setEvents] = useState<CleanupEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CleanupEvent | null>(null);

  useEffect(() => {
    const refresh = () => { dbService.getEvents().then(setEvents); };
    refresh();
    const unsubscribe = dbService.subscribe(refresh);
    return () => unsubscribe();
  }, []);

  const handleAddNew = () => {
    setEditingEvent(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (evt: CleanupEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEvent(evt);
    setIsEditorOpen(true);
  };

  const handleApprove = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dbService.approveEvent(id);
    alert(language === 'vi' ? `Đã phê duyệt chiến dịch "${title}" thành công!` : `Approved campaign "${title}" successfully!`);
  };

  const handleDelete = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(language === 'vi' ? `Bạn có chắc chắn muốn xóa chiến dịch "${title}" không?` : `Are you sure you want to delete campaign "${title}"?`)) {
      dbService.deleteEvent(id);
    }
  };

  const categories = [
    'All',
    'World Cleanup Day',
    'Green Ocean Campaign',
    'Environmental Day',
    'Young Conservationists',
    'Community Workshop'
  ];

  const categoryMap: Record<string, string> = {
    'All': t.projectsAllCategoryLabel,
    'World Cleanup Day': t.projectWcd,
    'Green Ocean Campaign': t.projectGreenOcean,
    'Environmental Day': t.projectEnvDay,
    'Young Conservationists': t.projectYoungWildlife,
    'Community Workshop': t.projectWorkshop
  };

  // For regular visitors, only show approved events (not Pending).
  const visibleEvents = events.filter(e => {
    if (isAdmin) return true;
    return e.status !== 'Pending';
  });

  const filteredEvents = visibleEvents.filter(e => {
    if (selectedCategory === 'All') return true;
    return e.category === selectedCategory;
  });

  const pendingCount = events.filter(e => e.status === 'Pending').length;

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <EditableText
            contentKey="projects.title"
            defaultValue={t.projectsTitle}
            as="h1"
            className="text-3xl sm:text-4xl lg:text-5xl font-black metallic-title tracking-tight leading-tight [text-wrap:balance]"
          />
          <EditableText
            contentKey="projects.subtitle"
            defaultValue={t.projectsSubtitle}
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto [text-wrap:balance]"
          />

          {/* Add Project Button */}
          <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => {
                setEditingEvent(null);
                setIsEditorOpen(true);
              }}
              className="px-5 py-2.5 bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-xs rounded-full shadow-md transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span><EditableText contentKey="projects.addBtn" defaultValue={t.projectsAddBtn} as="span" /></span>
            </button>

            {isAdmin && pendingCount > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold px-3.5 py-2.5 rounded-full animate-pulse">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>{language === 'vi' ? `Có ${pendingCount} chiến dịch đang chờ duyệt!` : `${pendingCount} campaign(s) pending review!`}</span>
              </span>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#E81A7F] text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {categoryMap[cat] || cat}
            </button>
          ))}
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map(evt => {
            const isPending = evt.status === 'Pending';

            return (
              <div
                key={evt.id}
                className={`bg-white rounded-3xl border ${isPending ? 'border-amber-400 ring-2 ring-amber-300/60 bg-amber-50/20' : 'border-slate-200/80'} overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative`}
              >
                {/* Admin quick action buttons */}
                {isAdmin && (
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-black/70 backdrop-blur-xs p-1.5 rounded-xl shadow-lg">
                    {isPending && (
                      <button
                        onClick={(e) => handleApprove(evt.id, evt.title, e)}
                        title="Duyệt chiến dịch này ngay"
                        className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-extrabold rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Duyệt</span>
                      </button>
                    )}
                    <button
                      onClick={(e) => handleEdit(evt, e)}
                      title="Sửa chiến dịch"
                      className="p-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-lg backdrop-blur-xs transition-colors cursor-pointer shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(evt.id, evt.title, e)}
                      title="Xóa chiến dịch"
                      className="p-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-lg backdrop-blur-xs transition-colors cursor-pointer shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div>
                  <div className="relative aspect-16/10 overflow-hidden bg-slate-900">
                    <img 
                      src={evt.image} 
                      alt={evt.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#E81A7F] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-xs">
                      {categoryMap[evt.category] || evt.category}
                    </div>

                    {isPending ? (
                      <div className="absolute bottom-3 left-3 bg-amber-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{language === 'vi' ? 'Chờ Duyệt (Pending)' : 'Pending Review'}</span>
                      </div>
                    ) : (
                      <div className="absolute bottom-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                        {evt.status || (language === 'vi' ? 'Sắp diễn ra' : 'Upcoming')}
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-4">
                    <h3 
                      onClick={() => onSelectProject(evt.id)}
                      className="font-black text-lg text-slate-900 group-hover:text-[#E81A7F] transition-colors cursor-pointer line-clamp-2"
                    >
                      {evt.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#E81A7F]" />
                        <span>{evt.date} ({evt.time})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#E81A7F]" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-[#E81A7F]" />
                        <span>{language === 'vi' ? `Đã có ${evt.registeredCount.toLocaleString()} / ${evt.targetVolunteers.toLocaleString()} tình nguyện viên` : `${evt.registeredCount.toLocaleString()} / ${evt.targetVolunteers.toLocaleString()} volunteers registered`}</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-[#E81A7F] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (evt.registeredCount / evt.targetVolunteers) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 flex gap-2">
                  <button
                    onClick={() => onSelectProject(evt.id)}
                    className="flex-1 py-2.5 border border-slate-300 hover:border-slate-400 text-slate-700 font-bold text-xs rounded-full transition-colors cursor-pointer text-center"
                  >
                    <EditableText contentKey="projects.viewDetailsBtn" defaultValue={t.projectsDetailBtn} as="span" />
                  </button>
                  <button
                    onClick={() => onRegisterVolunteer(evt.id)}
                    className="flex-1 bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-xs py-2.5 rounded-full shadow-md transition-colors cursor-pointer text-center"
                  >
                    <EditableText contentKey="projects.registerBtn" defaultValue={t.projectsJoinBtn} as="span" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Event Editor Modal */}
      <EventEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingEvent(null);
        }}
        eventToEdit={editingEvent}
        onSaved={() => {
          dbService.getEvents().then(setEvents);
        }}
      />
    </div>
  );
};


