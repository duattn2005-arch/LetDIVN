import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/dbService';
import { EventLogisticsSection } from '../EventLogisticsSection';
import { CleanupEvent } from '../../types';
import { slugify } from '../../utils/slug';
import { ArrowLeft } from 'lucide-react';

interface CampaignDetailPageProps {
  campaignId: string;
  onBack: () => void;
  onRegisterVolunteer: (eventId: string) => void;
}

// Schedule/map/registration view for a single dated campaign run — kept
// entirely separate from ProjectDetailPage (the static per-category "project"
// story page). Reached only via /explore-campaigns/<slug>, never via /projects/.
export const CampaignDetailPage: React.FC<CampaignDetailPageProps> = ({
  campaignId,
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
    events.find((e) => e.id === campaignId) ||
    events.find((e) => slugify(e.city) === campaignId) ||
    events[0];

  if (!event) return null;

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#E81A7F] transition-colors cursor-pointer mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Campaign List</span>
        </button>

        {/* Hero card: cover photo with the category badge and event title/location overlaid. */}
        <div className="relative rounded-3xl overflow-hidden mb-8 shadow-lg bg-slate-900">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-64 sm:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
            <span className="inline-block bg-[#E81A7F] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
              {event.category}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight mb-1">{event.title}</h1>
            <p className="text-sm sm:text-base text-white/90">{event.location}</p>
          </div>
        </div>

        <EventLogisticsSection event={event} onRegisterVolunteer={onRegisterVolunteer} />
      </div>
    </div>
  );
};
