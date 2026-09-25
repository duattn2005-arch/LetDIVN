import React, { useState, useEffect, useRef } from 'react';
import { CleanupEvent } from '../types';
import { dbService } from '../services/dbService';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, MapPin, Users, Pencil, Check, X, Plus, Trash2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface EventLogisticsSectionProps {
  event: CleanupEvent;
  onRegisterVolunteer: (eventId: string) => void;
}

// A plain L.marker() relies on Leaflet's default icon image assets, which
// don't resolve correctly in this bundled app (shows as a broken icon). Use
// the same self-contained pulsing pin divIcon as CleanupMapPage instead, so
// this embedded map matches it exactly rather than using a plainer marker.
const meetingPointIcon = L.divIcon({
  className: 'meeting-point-marker',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute -inset-2 bg-pink-500/30 rounded-full animate-ping"></div>
      <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-[#E81A7F] to-[#FF4D9E] flex items-center justify-center text-white shadow-xl border-2 border-white">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

type Align = 'left' | 'center' | 'right';

// Description/schedule/meeting-point are real CleanupEvent fields (edited
// elsewhere via EventEditorModal); saves here go through the same
// dbService.updateEvent so both editing paths stay in sync. Only the
// description's text alignment has no field on CleanupEvent, so it's kept as
// a small per-event content-store override instead of widening the type.
export const EventLogisticsSection: React.FC<EventLogisticsSectionProps> = ({ event, onRegisterVolunteer }) => {
  const { isAdmin } = useAuth();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState(event.description);
  const [descriptionAlign, setDescriptionAlign] = useState<Align>('left');
  const alignKey = `event.${event.id}.descriptionAlign`;

  useEffect(() => {
    let cancelled = false;
    dbService.getContent(alignKey, 'left').then((v) => {
      if (!cancelled) setDescriptionAlign((v === 'center' || v === 'right' ? v : 'left'));
    });
    return () => { cancelled = true; };
  }, [alignKey]);

  useEffect(() => { setDescriptionDraft(event.description); }, [event.description]);

  const saveDescription = async () => {
    await dbService.updateEvent(event.id, { description: descriptionDraft });
    setEditingDescription(false);
  };

  const setAlign = async (align: Align) => {
    setDescriptionAlign(align);
    await dbService.setContent(alignKey, align);
  };

  const [editingSchedule, setEditingSchedule] = useState(false);
  const [scheduleDraft, setScheduleDraft] = useState(event.schedule || []);

  useEffect(() => { setScheduleDraft(event.schedule || []); }, [event.schedule]);

  const saveSchedule = async () => {
    const cleaned = scheduleDraft.filter((s) => s.time.trim() || s.activity.trim());
    await dbService.updateEvent(event.id, { schedule: cleaned });
    setEditingSchedule(false);
  };

  const [editingMeetingPoint, setEditingMeetingPoint] = useState(false);
  const [meetingPointDraft, setMeetingPointDraft] = useState(event.meetingPoint);

  useEffect(() => { setMeetingPointDraft(event.meetingPoint); }, [event.meetingPoint]);

  const saveMeetingPoint = async () => {
    await dbService.updateEvent(event.id, { meetingPoint: meetingPointDraft });
    setEditingMeetingPoint(false);
  };

  // Init/refresh the meeting-point map whenever the resolved event's location changes.
  useEffect(() => {
    if (!event.coordinates || !mapContainerRef.current) return;
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

    const marker = L.marker([lat, lng], { icon: meetingPointIcon }).addTo(mapInstanceRef.current);
    marker.bindPopup(`<strong>${event.title}</strong><br/>${event.meetingPoint || event.location}`).openPopup();

    setTimeout(() => mapInstanceRef.current?.invalidateSize(), 150);

    return () => {
      marker.remove();
    };
  }, [event.id, event.coordinates?.lat, event.coordinates?.lng, event.title, event.meetingPoint, event.location]);

  // Tear down the Leaflet instance entirely on unmount (navigating away).
  useEffect(() => {
    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-8">
        {/* Description & Campaign Goals */}
        <div className="group/desc relative">
          <div className="flex items-center justify-between mb-3">
            <h3 className="ref-heading text-xl sm:text-2xl text-slate-900">Description &amp; Campaign Goals</h3>
            {isAdmin && !editingDescription && (
              <button
                onClick={() => setEditingDescription(true)}
                title="Edit"
                className="opacity-0 group-hover/desc:opacity-100 transition-opacity p-1.5 rounded-lg bg-slate-100 hover:bg-pink-50 text-slate-500 hover:text-[#E81A7F] cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {editingDescription ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                {(['left', 'center', 'right'] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => setAlign(a)}
                    title={`Align ${a}`}
                    className={`p-1.5 rounded-lg border cursor-pointer ${
                      descriptionAlign === a ? 'bg-[#E81A7F] text-white border-[#E81A7F]' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {a === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                    {a === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                    {a === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
              <textarea
                value={descriptionDraft}
                onChange={(e) => setDescriptionDraft(e.target.value)}
                rows={4}
                className="w-full text-sm sm:text-base text-slate-600 border border-slate-300 rounded-xl p-3 focus:outline-hidden focus:border-[#E81A7F]"
              />
              <div className="flex gap-2">
                <button onClick={saveDescription} className="px-3 py-1.5 bg-[#E81A7F] hover:bg-[#D01370] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
                <button
                  onClick={() => { setDescriptionDraft(event.description); setEditingDescription(false); }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="ref-body text-sm sm:text-base text-slate-600 leading-relaxed" style={{ textAlign: descriptionAlign }}>
              {event.description}
            </p>
          )}
        </div>

        {/* Detailed Schedule */}
        {(event.schedule && event.schedule.length > 0) || isAdmin ? (
          <div className="group/sched relative">
            <div className="flex items-center justify-between mb-3">
              <h3 className="ref-heading text-xl sm:text-2xl text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#E81A7F]" />
                Detailed Schedule
              </h3>
              {isAdmin && !editingSchedule && (
                <button
                  onClick={() => setEditingSchedule(true)}
                  title="Edit"
                  className="opacity-0 group-hover/sched:opacity-100 transition-opacity p-1.5 rounded-lg bg-slate-100 hover:bg-pink-50 text-slate-500 hover:text-[#E81A7F] cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {editingSchedule ? (
              <div className="space-y-2">
                {scheduleDraft.map((slot, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <input
                      value={slot.time}
                      onChange={(e) => {
                        const updated = [...scheduleDraft];
                        updated[i] = { ...updated[i], time: e.target.value };
                        setScheduleDraft(updated);
                      }}
                      placeholder="06:30"
                      className="w-24 shrink-0 px-2 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-[#E81A7F]"
                    />
                    <input
                      value={slot.activity}
                      onChange={(e) => {
                        const updated = [...scheduleDraft];
                        updated[i] = { ...updated[i], activity: e.target.value };
                        setScheduleDraft(updated);
                      }}
                      placeholder="Activity"
                      className="flex-1 px-2 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-[#E81A7F]"
                    />
                    <button
                      onClick={() => setScheduleDraft(scheduleDraft.filter((_, idx) => idx !== i))}
                      title="Remove"
                      className="p-2 text-slate-400 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setScheduleDraft([...scheduleDraft, { time: '', activity: '' }])}
                  className="text-xs font-bold text-[#E81A7F] flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add row
                </button>
                <div className="flex gap-2 pt-2">
                  <button onClick={saveSchedule} className="px-3 py-1.5 bg-[#E81A7F] hover:bg-[#D01370] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Save
                  </button>
                  <button
                    onClick={() => { setScheduleDraft(event.schedule || []); setEditingSchedule(false); }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              </div>
            ) : event.schedule && event.schedule.length > 0 ? (
              <div className="space-y-2">
                {event.schedule.map((slot, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white border border-slate-200 rounded-xl p-3">
                    <span className="shrink-0 px-2.5 py-1 bg-pink-50 text-[#E81A7F] font-bold text-xs rounded-lg">{slot.time}</span>
                    <span className="text-sm text-slate-700">{slot.activity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No schedule added yet.</p>
            )}
          </div>
        ) : null}

        {/* Meeting Point Map */}
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
            <div ref={mapContainerRef} className="w-full h-96 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100" />

            <div className="group/mp relative mt-2">
              {editingMeetingPoint ? (
                <div className="flex items-center gap-2">
                  <input
                    value={meetingPointDraft}
                    onChange={(e) => setMeetingPointDraft(e.target.value)}
                    className="flex-1 px-2 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-[#E81A7F]"
                  />
                  <button onClick={saveMeetingPoint} title="Save" className="p-1.5 bg-[#E81A7F] hover:bg-[#D01370] text-white rounded-lg cursor-pointer">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { setMeetingPointDraft(event.meetingPoint); setEditingMeetingPoint(false); }}
                    title="Cancel"
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span><strong>Meeting address:</strong> {event.meetingPoint}</span>
                  {isAdmin && (
                    <button
                      onClick={() => setEditingMeetingPoint(true)}
                      title="Edit"
                      className="opacity-0 group-hover/mp:opacity-100 transition-opacity p-1 rounded-md bg-slate-100 hover:bg-pink-50 text-slate-500 hover:text-[#E81A7F] cursor-pointer ml-1"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  )}
                </p>
              )}
            </div>
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
  );
};
