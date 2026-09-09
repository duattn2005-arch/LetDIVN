import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/dbService';
import { ProjectStaticContent } from '../ProjectStaticContent';
import { EventLogisticsSection } from '../EventLogisticsSection';
import { CleanupEvent } from '../../types';
import { slugify } from '../../utils/slug';
import { ArrowLeft } from 'lucide-react';

interface ProjectDetailPageProps {
  projectId: string;
  onBack: () => void;
  onRegisterVolunteer: (eventId: string) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  projectId,
  onBack,
  onRegisterVolunteer,
}) => {
  const [events, setEvents] = useState<CleanupEvent[]>([]);

  useEffect(() => {
    const refresh = () => { dbService.getEvents().then(setEvents); };
    refresh();
    const unsubscribe = dbService.subscribe(refresh);
    return () => unsubscribe();
  }, []);

  const event =
    events.find((e) => e.id === projectId) ||
    events.find((e) => e.category === projectId) ||
    events.find((e) => slugify(e.category) === projectId) ||
    events.find((e) => slugify(e.city) === projectId) ||
    events[0];

  if (!event) return null;

  return (
    <div className="bg-white">
      <ProjectStaticContent category={event.category} />

      {/* Event logistics: when/where this specific campaign run happens and how to join it. */}
      <div className="bg-slate-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#E81A7F] transition-colors cursor-pointer mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Project List</span>
          </button>

          <EventLogisticsSection event={event} onRegisterVolunteer={onRegisterVolunteer} />
        </div>
      </div>
    </div>
  );
};
