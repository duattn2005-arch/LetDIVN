import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/dbService';
import { CleanupEvent } from '../../types';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { EditableText } from '../EditableText';

interface ProjectsPageProps {
  onSelectProject: (id: string) => void;
  onRegisterVolunteer: (eventId?: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ 
  onSelectProject,
  onRegisterVolunteer 
}) => {
  const { t, language } = useLanguage();
  const [events, setEvents] = useState<CleanupEvent[]>([]);

  useEffect(() => {
    const refresh = () => { dbService.getEvents().then(setEvents); };
    refresh();
    const unsubscribe = dbService.subscribe(refresh);
    return () => unsubscribe();
  }, []);

  const visibleEvents = events.filter(e => e.status !== 'Pending');

  // Registration only stays open through the event's own date — once it's
  // passed, "Register to Participate" is disabled rather than hidden, so the
  // campaign card/history stays visible but can't collect new signups.
  const isRegistrationClosed = (evt: CleanupEvent) => {
    const eventDate = new Date(evt.date);
    if (Number.isNaN(eventDate.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
  };

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-6xl mx-auto space-y-4">
          <EditableText
            contentKey="projects.title"
            defaultValue={t.projectsTitle}
            as="h1"
            className="ref-heading text-3xl sm:text-4xl lg:text-[45px] [text-wrap:balance]"
            render={(v) => <span style={{ color: '#F1138D' }}>{v}</span>}
          />
          <EditableText
            contentKey="projects.subtitle"
            defaultValue={t.projectsSubtitle}
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto [text-wrap:balance]"
          />
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleEvents.map(evt => {
            const isPending = evt.status === 'Pending';
            const closed = isRegistrationClosed(evt);

            return (
              <div
                key={evt.id}
                className={`bg-white rounded-3xl border ${isPending ? 'border-amber-400 ring-2 ring-amber-300/60 bg-amber-50/20' : 'border-slate-200/80'} overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative`}
              >

                <div>
                  <div className="relative aspect-16/10 overflow-hidden bg-slate-900">
                    <img
                      src={evt.image}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

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
                    onClick={() => !closed && onRegisterVolunteer(evt.id)}
                    disabled={closed}
                    title={closed ? (language === 'vi' ? 'Chiến dịch đã diễn ra, không thể đăng ký thêm' : 'This campaign has already taken place') : undefined}
                    className={`flex-1 font-bold text-xs py-2.5 rounded-full shadow-md transition-colors text-center ${
                      closed
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        : 'bg-[#E81A7F] hover:bg-[#D01370] text-white cursor-pointer'
                    }`}
                  >
                    {closed
                      ? <span>{language === 'vi' ? 'Đã kết thúc' : 'Registration Closed'}</span>
                      : <EditableText contentKey="projects.registerBtn" defaultValue={t.projectsJoinBtn} as="span" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};


