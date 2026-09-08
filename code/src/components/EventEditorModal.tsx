import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, MapPin, Users, Sparkles, Save, AlertCircle, ShieldAlert, CheckCircle2, Globe, Clock, Plus, Trash2 } from 'lucide-react';
import { CleanupEvent } from '../types';
import { dbService } from '../services/dbService';
import { ImageUploadWidget } from './ImageUploadWidget';
import { useAuth } from '../context/AuthContext';

interface EventEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: CleanupEvent | null;
  initialCoordinates?: { lat: number; lng: number } | null;
  initialLocation?: string;
  initialTitle?: string;
  initialCity?: string;
  onSaved?: (event: CleanupEvent) => void;
}

export const EventEditorModal: React.FC<EventEditorModalProps> = ({
  isOpen,
  onClose,
  eventToEdit,
  initialCoordinates,
  initialLocation,
  initialTitle,
  initialCity,
  onSaved,
}) => {
  const { isAdmin, user } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CleanupEvent['category']>('World Cleanup Day');
  const [date, setDate] = useState('2026-09-20');
  const [time, setTime] = useState('07:00 - 11:30');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('Hanoi');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [targetVolunteers, setTargetVolunteers] = useState(500);
  const [status, setStatus] = useState<CleanupEvent['status']>('Upcoming');
  const [leader, setLeader] = useState(user?.name || 'Nguyen Van An');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [scheduleItems, setScheduleItems] = useState<{ time: string; activity: string }[]>([
    { time: '07:00', activity: 'Gather at the meeting point, check in and distribute gear' },
    { time: '07:30', activity: 'Warm-up, safety briefing, and team assignment by cleanup route' },
    { time: '08:00 - 10:30', activity: 'Cleanup in progress, sorting recyclable, organic, and hazardous waste' },
    { time: '11:00', activity: 'Load collected waste onto trucks, weigh the total, take group photos, and wrap up' }
  ]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setCategory(eventToEdit.category);
      setDate(eventToEdit.date);
      setTime(eventToEdit.time);
      setLocation(eventToEdit.location);
      setCity(eventToEdit.city);
      setCoordinates(eventToEdit.coordinates);
      setGoogleMapsUrl(eventToEdit.googleMapsUrl || '');
      setDescription(eventToEdit.description);
      setImage(eventToEdit.image);
      setTargetVolunteers(eventToEdit.targetVolunteers);
      setStatus(eventToEdit.status);
      setLeader(eventToEdit.leader);
      setMeetingPoint(eventToEdit.meetingPoint);
      if (eventToEdit.schedule && eventToEdit.schedule.length > 0) {
        setScheduleItems(eventToEdit.schedule);
      }
    } else {
      setTitle(initialTitle || (initialLocation ? `Cleanup Campaign at ${initialLocation}` : ''));
      setCategory('World Cleanup Day');
      setDate('2026-09-20');
      setTime('07:00 - 11:30');
      setLocation(initialLocation || '');
      setCity(initialCity || 'Hanoi');
      setCoordinates(initialCoordinates || undefined);

      const autoMapUrl = initialCoordinates
        ? `https://www.google.com/maps/search/?api=1&query=${initialCoordinates.lat},${initialCoordinates.lng}`
        : '';
      setGoogleMapsUrl(autoMapUrl);

      setDescription(initialLocation ? `A cleanup and waste-sorting campaign in the ${initialLocation} area.` : '');
      setImage('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80');
      setTargetVolunteers(100);
      setStatus(isAdmin ? 'Upcoming' : 'Pending');
      setLeader(user?.name || 'Nguyen Van An');
      setMeetingPoint(initialLocation ? `Main entrance of ${initialLocation}` : '');
      setScheduleItems([
        { time: '07:00', activity: `Gather at the meeting point: ${initialLocation || 'the meeting point'}, check in and distribute gear` },
        { time: '07:30', activity: 'Warm-up, safety briefing, and team assignment by cleanup route' },
        { time: '08:00 - 10:30', activity: 'Cleanup in progress, sorting recyclable, organic, and hazardous waste' },
        { time: '11:00', activity: 'Load collected waste onto trucks, weigh the total, take group photos, and wrap up' }
      ]);
    }
    setError(null);
  }, [eventToEdit, isOpen, isAdmin, user, initialCoordinates, initialLocation, initialTitle, initialCity]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a campaign name.');
      return;
    }
    if (!location.trim()) {
      setError('Please enter the cleanup location.');
      return;
    }
    if (!image.trim()) {
      setError('Please upload a cover image for the campaign.');
      return;
    }

    const eventStatus: CleanupEvent['status'] = isAdmin ? status : (eventToEdit ? eventToEdit.status : 'Pending');

    let saved: CleanupEvent;
    if (eventToEdit) {
      saved = await dbService.updateEvent(eventToEdit.id, {
        title,
        category,
        date,
        time,
        location,
        city,
        coordinates: coordinates || eventToEdit.coordinates,
        googleMapsUrl: googleMapsUrl.trim() || undefined,
        description,
        image,
        targetVolunteers: Number(targetVolunteers),
        status: eventStatus,
        leader,
        meetingPoint,
        schedule: scheduleItems
      });
    } else {
      saved = await dbService.addEvent({
        title,
        category,
        date,
        time,
        location,
        city,
        coordinates,
        googleMapsUrl: googleMapsUrl.trim() || undefined,
        description,
        image,
        targetVolunteers: Number(targetVolunteers),
        registeredCount: 0,
        status: eventStatus,
        leader,
        meetingPoint,
        schedule: scheduleItems
      });
    }

    if (!isAdmin) {
      alert('Your campaign / cleanup spot has been submitted successfully!\n\nThe post is currently "Pending" and will appear publicly on the map as soon as an Administrator (Admin) approves it.');
    }

    if (onSaved) onSaved(saved);
    onClose();
  };

  if (!isOpen) return null;

  return typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[999999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-500/20 text-[#E81A7F]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black">
                {eventToEdit ? 'Edit Cleanup Campaign' : (isAdmin ? 'Add New Campaign (Admin)' : 'Register a New Cleanup Campaign')}
              </h3>
              <p className="text-xs text-slate-400">
                {!isAdmin && !eventToEdit ? 'The post will be reviewed by an Administrator before it appears publicly' : 'Coordinate cleanup spot details, volunteer targets, and waste sorting'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Campaign / Event Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., World Cleanup Day 2026 - Hanoi"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Event Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              >
                <option value="World Cleanup Day">World Cleanup Day</option>
                <option value="Environmental Day">Environmental Day</option>
                <option value="Green Ocean Campaign">Green Ocean Campaign</option>
                <option value="Young Conservationists">Young Conservationists</option>
                <option value="Community Workshop">Community Workshop</option>
              </select>
            </div>
          </div>

          <ImageUploadWidget
            currentImageUrl={image}
            onImageSelected={(val) => setImage(val)}
            label="Campaign Location Cover Image"
            aspectRatioLabel="16:9 ratio recommended"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Province / City
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              >
                <option value="Hanoi">Hanoi</option>
                <option value="Ho Chi Minh City">Ho Chi Minh City</option>
                <option value="Da Nang">Da Nang</option>
                <option value="Hai Phong">Hai Phong</option>
                <option value="Can Tho">Can Tho</option>
                <option value="Khanh Hoa">Khanh Hoa</option>
                <option value="Binh Dinh">Binh Dinh</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Event Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Time Window
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="07:00 - 11:30"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Specific Cleanup Location
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Long Bien Bridge, Red River Midstream Sandbar..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Meeting / Pickup Point
              </label>
              <input
                type="text"
                value={meetingPoint}
                onChange={(e) => setMeetingPoint(e.target.value)}
                placeholder="e.g., Thong Nhat Park Gate..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Link Google Maps Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#E81A7F]" />
              <span>Attach a Google Maps Link for the Cleanup Location</span>
            </label>
            <input
              type="url"
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              placeholder="e.g., https://maps.app.goo.gl/... or https://www.google.com/maps/search/?api=1&query=..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-hidden focus:border-[#E81A7F]"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              You can paste a share link from Google Maps so volunteers can tap it for direct directions.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Detailed Activity Description & Requirements
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the cleanup plan, recyclable waste sorting..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm leading-relaxed focus:outline-hidden focus:border-[#E81A7F]"
            ></textarea>
          </div>

          {/* Dynamic Schedule Builder for Admin Review */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#E81A7F]" />
                <span>Detailed Schedule (Enter for Admin review)</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setScheduleItems([
                    ...scheduleItems,
                    { time: '08:00', activity: 'Next activity...' }
                  ]);
                }}
                className="px-2.5 py-1 bg-pink-50 dark:bg-pink-950/40 text-[#E81A7F] hover:bg-pink-100 text-[11px] font-bold rounded-lg border border-pink-200 dark:border-pink-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Time Slot</span>
              </button>
            </div>

            <div className="space-y-2">
              {scheduleItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.time}
                    onChange={(e) => {
                      const updated = [...scheduleItems];
                      updated[idx].time = e.target.value;
                      setScheduleItems(updated);
                    }}
                    placeholder="e.g., 07:00 or 08:00 - 10:30"
                    className="w-32 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-[#E81A7F] focus:outline-hidden focus:border-[#E81A7F]"
                  />
                  <input
                    type="text"
                    value={item.activity}
                    onChange={(e) => {
                      const updated = [...scheduleItems];
                      updated[idx].activity = e.target.value;
                      setScheduleItems(updated);
                    }}
                    placeholder="Activity description (e.g., Gather for check-in, begin cleanup...)"
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-[#E81A7F]"
                  />
                  {scheduleItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setScheduleItems(scheduleItems.filter((_, i) => i !== idx));
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      title="Delete this time slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Number of Volunteers
              </label>
              <input
                type="number"
                min={10}
                value={targetVolunteers}
                onChange={(e) => setTargetVolunteers(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Team Leader
              </label>
              <input
                type="text"
                value={leader}
                onChange={(e) => setLeader(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          {isAdmin && (
            <div className="p-4 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#E81A7F]">
                <ShieldAlert className="w-4 h-4" />
                <span>Review & Publish Status (Admin)</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="Upcoming"
                    checked={status === 'Upcoming'}
                    onChange={() => setStatus('Upcoming')}
                    className="text-[#E81A7F] focus:ring-[#E81A7F]"
                  />
                  <span>Publish live (Upcoming)</span>
                </label>
                <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="Pending"
                    checked={status === 'Pending'}
                    onChange={() => setStatus('Pending')}
                    className="text-[#E81A7F] focus:ring-[#E81A7F]"
                  />
                  <span>Pending review</span>
                </label>
                <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="Completed"
                    checked={status === 'Completed'}
                    onChange={() => setStatus('Completed')}
                    className="text-[#E81A7F] focus:ring-[#E81A7F]"
                  />
                  <span>Completed</span>
                </label>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#E81A7F] hover:bg-[#D01370] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{eventToEdit ? 'Save Changes' : (isAdmin ? 'Create Campaign' : 'Submit for Admin Review')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null;
};


