import React, { useState, useEffect, useRef } from 'react';
import { dbService } from '../../services/dbService';
import { Calendar, MapPin, Users, Trash2, ArrowLeft, CheckCircle2, ShieldCheck, Share2, Sparkles, Edit3, ExternalLink, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { EventEditorModal } from '../EventEditorModal';
import { EditableText } from '../EditableText';
import { CleanupEvent } from '../../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ProjectDetailPageProps {
  projectId: string;
  onBack: () => void;
  onRegisterVolunteer: (eventId: string) => void;
  onOpenWorldCleanupDay: () => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  projectId,
  onBack,
  onRegisterVolunteer,
  onOpenWorldCleanupDay,
}) => {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState<CleanupEvent[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const refresh = () => { dbService.getEvents().then(setEvents); };
    refresh();
    const unsubscribe = dbService.subscribe(refresh);
    return () => unsubscribe();
  }, []);

  const event = events.find(e => e.id === projectId) || events[0];

  // Leaflet map setup for specific project
  useEffect(() => {
    if (!mapContainerRef.current || !event) return;

    const coords = event.coordinates || { lat: 21.0285, lng: 105.8542 };

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer('https://mt1.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      }).addTo(map);

      setTimeout(() => {
        map.invalidateSize();
      }, 150);

      // Custom Pin Icon
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute -inset-2 bg-pink-500/40 rounded-full animate-ping"></div>
            <div class="w-10 h-10 rounded-full bg-[#E81A7F] flex items-center justify-center text-white shadow-xl border-2 border-white">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
      });

      L.marker([coords.lat, coords.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`<strong>${event.title}</strong><br/>📍 ${event.location}`)
        .openPopup();

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([coords.lat, coords.lng], 14);
    }
  }, [event]);

  if (!event) return null;

  const percent = Math.min(100, Math.round((event.registeredCount / event.targetVolunteers) * 100));

  return (
    <div className="py-12 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Top bar: Back Button & Admin Edit Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#E81A7F] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <EditableText contentKey="projectDetail.backBtn" defaultValue="Back to Project List" as="span" />
          </button>

          {isAdmin && (
            <button
              onClick={() => setIsEditorOpen(true)}
              className="inline-flex items-center gap-2 bg-[#E81A7F] hover:bg-[#D01370] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Campaign (Admin)</span>
            </button>
          )}
        </div>

        {/* Hero Banner Image */}
        <div className="relative aspect-21/9 rounded-3xl overflow-hidden shadow-2xl bg-slate-900">
          <img 
            src={event.bannerImage || event.image} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="inline-block bg-[#E81A7F] text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full">
              {event.category}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black">{event.title}</h1>
            <p className="text-xs sm:text-sm text-slate-200">{event.location}</p>
          </div>
        </div>

        {/* 2-Column Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <EditableText contentKey="projectDetail.descTitle" defaultValue="Description & Campaign Goals" as="h3" className="text-2xl font-bold text-slate-900 mb-3" />
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
              {event.category === 'World Cleanup Day' && (
                <button
                  onClick={onOpenWorldCleanupDay}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#E81A7F] hover:underline cursor-pointer"
                >
                  <span>Learn more about the World Cleanup Day movement</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Schedule & Meeting Point */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#E81A7F]" />
                <EditableText contentKey="projectDetail.scheduleTitle" defaultValue="Detailed Schedule" as="span" />
              </h3>
              <div className="space-y-2.5 text-xs text-slate-700">
                {event.schedule && event.schedule.length > 0 ? (
                  event.schedule.map((item, idx) => (
                    <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-start gap-3.5 hover:border-pink-200 transition-colors">
                      <span className="font-extrabold text-[#E81A7F] text-xs bg-pink-50 px-2.5 py-1 rounded-lg shrink-0 border border-pink-100">
                        {item.time}
                      </span>
                      <span className="text-slate-800 font-medium leading-relaxed pt-0.5">
                        {item.activity}
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-start gap-3.5">
                      <span className="font-extrabold text-[#E81A7F] text-xs bg-pink-50 px-2.5 py-1 rounded-lg shrink-0 border border-pink-100">
                        {event.time.split('-')[0]?.trim() || '07:00'}
                      </span>
                      <span className="text-slate-800 font-medium leading-relaxed pt-0.5">
                        <EditableText contentKey="projectDetail.defaultSchedule1Activity" defaultValue="Gather at the meeting point:" as="span" /> <strong>{event.meetingPoint || event.location}</strong>, check-in and gear distribution
                      </span>
                    </div>
                    <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-start gap-3.5">
                      <EditableText
                        contentKey="projectDetail.defaultSchedule2Time"
                        defaultValue="07:30"
                        as="span"
                        className="font-extrabold text-[#E81A7F] text-xs bg-pink-50 px-2.5 py-1 rounded-lg shrink-0 border border-pink-100"
                      />
                      <EditableText
                        contentKey="projectDetail.defaultSchedule2Activity"
                        defaultValue="Warm-up, safety briefing, and team assignment by cleanup route"
                        as="span"
                        className="text-slate-800 font-medium leading-relaxed pt-0.5"
                      />
                    </div>
                    <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-start gap-3.5">
                      <EditableText
                        contentKey="projectDetail.defaultSchedule3Time"
                        defaultValue="08:00 - 10:30"
                        as="span"
                        className="font-extrabold text-[#E81A7F] text-xs bg-pink-50 px-2.5 py-1 rounded-lg shrink-0 border border-pink-100"
                      />
                      <EditableText
                        contentKey="projectDetail.defaultSchedule3Activity"
                        defaultValue="Cleanup in progress, sorting recyclable, organic, and hazardous waste"
                        as="span"
                        className="text-slate-800 font-medium leading-relaxed pt-0.5"
                      />
                    </div>
                    <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-start gap-3.5">
                      <EditableText
                        contentKey="projectDetail.defaultSchedule4Time"
                        defaultValue="11:00"
                        as="span"
                        className="font-extrabold text-[#E81A7F] text-xs bg-pink-50 px-2.5 py-1 rounded-lg shrink-0 border border-pink-100"
                      />
                      <EditableText
                        contentKey="projectDetail.defaultSchedule4Activity"
                        defaultValue="Load collected waste onto trucks, weigh the total, take group photos, and wrap up"
                        as="span"
                        className="text-slate-800 font-medium leading-relaxed pt-0.5"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Interactive Real Map for Meeting Location */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#E81A7F]" />
                  <EditableText contentKey="projectDetail.mapTitle" defaultValue="Meeting Point Map" as="span" />
                </h3>
                <a
                  href={event.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-[#E81A7F] hover:underline flex items-center gap-1"
                >
                  <EditableText contentKey="projectDetail.openMapsBtn" defaultValue="Open Google Maps" as="span" />
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md h-72 w-full relative">
                <div ref={mapContainerRef} className="w-full h-full"></div>
              </div>
              <p className="text-xs text-slate-500">
                📍 <strong><EditableText contentKey="projectDetail.meetingAddressLabel" defaultValue="Meeting address:" as="span" /></strong> {event.meetingPoint || event.location}
              </p>
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-5 sticky top-24">
              <div className="space-y-1">
                <EditableText contentKey="projectDetail.progressLabel" defaultValue="Volunteer Recruitment Progress" as="div" className="text-xs text-slate-500 font-bold uppercase" />
                <div className="text-2xl font-black text-slate-900">
                  {event.registeredCount.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ {event.targetVolunteers.toLocaleString()} volunteers</span>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-1">
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#E81A7F] h-full rounded-full" style={{ width: `${percent}%` }}></div>
                </div>
                <div className="text-right text-[11px] font-bold text-[#E81A7F]">{percent}% <EditableText contentKey="projectDetail.percentJoinedSuffix" defaultValue="Joined" as="span" /></div>
              </div>

              <div className="space-y-3 text-xs text-slate-600 pt-3 border-t border-slate-200">
                <div>📅 <strong><EditableText contentKey="projectDetail.dateLabel" defaultValue="Date:" as="span" /></strong> {event.date}</div>
                <div>⏰ <strong><EditableText contentKey="projectDetail.timeLabel" defaultValue="Time:" as="span" /></strong> {event.time}</div>
                <div>📍 <strong><EditableText contentKey="projectDetail.locationLabel" defaultValue="Location:" as="span" /></strong> {event.location}</div>
                <div>👤 <strong><EditableText contentKey="projectDetail.leaderLabel" defaultValue="Team Lead:" as="span" /></strong> {event.leader}</div>
              </div>

              <button
                onClick={() => onRegisterVolunteer(event.id)}
                className="w-full bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-sm py-3.5 rounded-full shadow-lg transition-all cursor-pointer text-center"
              >
                <EditableText contentKey="projectDetail.registerBtn" defaultValue="Register to Join Now" as="span" />
              </button>


            </div>
          </div>

        </div>

      </div>

      {/* Admin Event Editor Modal */}
      <EventEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        eventToEdit={event}
        onSaved={() => {
          dbService.getEvents().then(setEvents);
        }}
      />
    </div>
  );
};


