import React, { useState, useEffect, useRef } from 'react';
import { dbService } from '../../services/dbService';
import { CleanupEvent } from '../../types';
import { slugify } from '../../utils/slug';
import { Calendar, Clock, MapPin, Users, ArrowLeft } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const refresh = () => { dbService.getEvents().then(setEvents); };
    refresh();
    const unsubscribe = dbService.subscribe(refresh);
    return () => unsubscribe();
  }, []);

  const event =
    events.find((e) => e.id === projectId) ||
    events.find((e) => e.category === projectId) ||
    events.find((e) => slugify(e.city) === projectId) ||
    events[0];

  // Init/refresh the meeting-point map whenever the resolved event's location changes.
  useEffect(() => {
    if (!event?.coordinates || !mapContainerRef.current) return;
    const { lat, lng } = event.coordinates;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 15,
        attributionControl: false,
      });
      L.tileLayer('https://mt1.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([lat, lng], 15);
    }

    const marker = L.marker([lat, lng]).addTo(mapInstanceRef.current);
    marker.bindPopup(`<strong>${event.title}</strong><br/>${event.meetingPoint || event.location}`).openPopup();

    setTimeout(() => mapInstanceRef.current?.invalidateSize(), 150);

    return () => {
      marker.remove();
    };
  }, [event?.id, event?.coordinates?.lat, event?.coordinates?.lng, event?.title, event?.meetingPoint, event?.location]);

  // Tear down the Leaflet instance entirely on unmount (navigating away).
  useEffect(() => {
    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  if (!event) return null;

  const eventDate = new Date(event.date);
  const isRegistrationClosed = (() => {
    if (Number.isNaN(eventDate.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
  })();

  const mapsLink =
    event.googleMapsUrl ||
    (event.coordinates ? `https://www.google.com/maps/search/?api=1&query=${event.coordinates.lat},${event.coordinates.lng}` : undefined);

  const joinedPct = Math.min(100, Math.round((event.registeredCount / event.targetVolunteers) * 100));

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#E81A7F] transition-colors cursor-pointer mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Project List</span>
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

        {/* Event logistics: when/where this specific campaign run happens and how to join it. */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="ref-heading text-xl sm:text-2xl text-slate-900 mb-3">Description &amp; Campaign Goals</h3>
                <p className="ref-body text-sm sm:text-base text-slate-600 leading-relaxed">{event.description}</p>
              </div>

              {event.schedule && event.schedule.length > 0 && (
                <div>
                  <h3 className="ref-heading text-xl sm:text-2xl text-slate-900 mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#E81A7F]" />
                    Detailed Schedule
                  </h3>
                  <div className="space-y-2">
                    {event.schedule.map((slot, i) => (
                      <div key={i} className="flex items-start gap-3 bg-white border border-slate-200 rounded-xl p-3">
                        <span className="shrink-0 px-2.5 py-1 bg-pink-50 text-[#E81A7F] font-bold text-xs rounded-lg">{slot.time}</span>
                        <span className="text-sm text-slate-700">{slot.activity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {event.coordinates && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="ref-heading text-xl sm:text-2xl text-slate-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#E81A7F]" />
                      Meeting Point Map
                    </h3>
                    {mapsLink && (
                      <a href={mapsLink} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#E81A7F] hover:underline">
                        Open Google Maps ↗
                      </a>
                    )}
                  </div>
                  <div ref={mapContainerRef} className="w-full h-72 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100" />
                  {event.meetingPoint && (
                    <p className="text-xs text-slate-500 mt-2 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span><strong>Meeting address:</strong> {event.meetingPoint}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:sticky lg:top-24 h-fit bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Volunteer Recruitment Progress</div>
                <div className="text-2xl font-black text-slate-900">
                  {event.registeredCount.toLocaleString()}{' '}
                  <span className="text-sm font-bold text-slate-400">/ {event.targetVolunteers.toLocaleString()} volunteers</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-2">
                  <div
                    className="bg-[#E81A7F] h-full rounded-full transition-all duration-500"
                    style={{ width: `${joinedPct}%` }}
                  />
                </div>
                <div className="text-right text-[11px] font-bold text-slate-400 mt-1">{joinedPct}% Joined</div>
              </div>

              <div className="space-y-2 text-sm text-slate-600 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#E81A7F] shrink-0" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#E81A7F] shrink-0" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#E81A7F] shrink-0" />
                  <span>{event.location}</span>
                </div>
                {event.leader && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#E81A7F] shrink-0" />
                    <span>Team Lead: {event.leader}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => !isRegistrationClosed && onRegisterVolunteer(event.id)}
                disabled={isRegistrationClosed}
                title={isRegistrationClosed ? 'This campaign has already taken place' : undefined}
                className={`w-full py-3 rounded-full font-bold text-sm transition-colors ${
                  isRegistrationClosed
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-[#E81A7F] hover:bg-[#D01370] text-white cursor-pointer shadow-md'
                }`}
              >
                {isRegistrationClosed ? 'Registration Closed' : 'Register to Join Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};


