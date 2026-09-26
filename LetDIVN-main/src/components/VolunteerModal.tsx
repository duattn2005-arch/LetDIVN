import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle2, ChevronDown, UserPlus, X } from 'lucide-react';
import { dbService } from '../services/dbService';
import { CleanupEvent } from '../types';
import { saveToGoogleSheet, getGoogleAppsScriptUrl } from '../services/googleSheetsService';

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEventId?: string;
}

type JoinAs = 'individual' | 'group' | 'organization';

const NAVY = '#0f1f4b';
const PINK = '#e8197c';

// Solid icons like the design's (paths from Google's Material Icons, Apache-2.0).
const ICON_PATHS = {
  person: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  groups:
    'M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58A2.01 2.01 0 0 0 0 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85A6.95 6.95 0 0 0 20 14c-.39 0-.76.04-1.13.1.4.68.63 1.46.63 2.29V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z',
  apartment:
    'M17 11V3H7v4H3v14h8v-4h2v4h8V11h-4zM7 19H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm4 4H9v-2h2v2zm0-4H9V9h2v2zm0-4H9V5h2v2zm4 8h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm4 12h-2v-2h2v2zm0-4h-2v-2h2v2z',
  assignment:
    'M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z',
  calendar:
    'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z',
  phone:
    'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z',
  mail: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z',
  place: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z',
  work: 'M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z',
  camera:
    'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM9 2 7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z',
  eco: 'M6.05 8.05a7.007 7.007 0 0 0-.02 9.88c1.47-3.4 4.09-6.24 7.36-7.93A15.952 15.952 0 0 0 8.1 16.2c2.6 1.23 5.8.78 7.95-1.37C19.53 11.35 20 3 20 3s-8.35.47-11.83 3.95z',
  box: 'M12 2 3 7v10l9 5 9-5V7l-9-5zm0 2.3L18.7 8 12 11.7 5.3 8 12 4.3zM5 9.7l6 3.3v6.6l-6-3.3V9.7zm8 9.9V13l6-3.3v6.6l-6 3.3z',
};
type IconName = keyof typeof ICON_PATHS;

const Icon: React.FC<{ name: IconName; color: string; className?: string }> = ({ name, color, className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} style={{ color }} fill="currentColor" aria-hidden>
    <path d={ICON_PATHS[name]} />
  </svg>
);

const JOIN_OPTIONS: { value: JoinAs; title: string; icon: IconName }[] = [
  { value: 'individual', title: 'Individual', icon: 'person' },
  { value: 'group', title: 'Group', icon: 'groups' },
  { value: 'organization', title: 'Organization', icon: 'apartment' },
];

const ROLES: { value: string; icon: IconName }[] = [
  { value: 'Clean-up', icon: 'eco' },
  { value: 'Media', icon: 'camera' },
  { value: 'Leader', icon: 'groups' },
  { value: 'Logistics', icon: 'box' },
];

/** The round radio mark in a card's top-right corner. */
const RadioMark: React.FC<{ checked: boolean }> = ({ checked }) => (
  <span
    className="w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 bg-white"
    style={{ borderColor: checked ? PINK : '#8a93a8' }}
    aria-hidden
  >
    {checked && <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PINK }} />}
  </span>
);

/** A green leaf for the header decoration. */
const LeafArt: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg viewBox="0 0 60 80" className={className} style={style} aria-hidden>
    <defs>
      <linearGradient id="vm-leaf" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#a6dc5a" />
        <stop offset="100%" stopColor="#3f9a2c" />
      </linearGradient>
    </defs>
    <path d="M30 2 C 58 18, 60 56, 30 78 C 0 56, 2 18, 30 2 Z" fill="url(#vm-leaf)" />
    <path d="M30 8 C 31 30, 31 52, 30 76" stroke="#2f7d22" strokeWidth="2" fill="none" opacity="0.6" />
  </svg>
);

const SectionTitle: React.FC<{ icon: IconName; children: React.ReactNode }> = ({ icon, children }) => (
  <h4 className="flex items-center gap-3 mb-3 lg:mb-2.5 text-lg sm:text-[22px] lg:text-xl lg:[@media(max-height:820px)]:text-lg font-bold" style={{ color: NAVY }}>
    <Icon name={icon} color={NAVY} className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
    <span>{children}</span>
  </h4>
);

const FieldLabel: React.FC<{ htmlFor: string; children: React.ReactNode; required?: boolean }> = ({ htmlFor, children, required }) => (
  <label htmlFor={htmlFor} className="block mb-1.5 lg:[@media(max-height:820px)]:mb-1 text-[15px] sm:text-base font-medium" style={{ color: NAVY }}>
    {children}
    {required && <span style={{ color: PINK }}> *</span>}
  </label>
);

const fieldClass =
  'w-full h-12 lg:[@media(max-height:820px)]:h-10 pl-12 pr-4 rounded-lg border border-[#cfd6e4] bg-white text-[15px] outline-none transition placeholder:text-slate-400 focus:border-[#e8197c] focus:ring-4 focus:ring-[#e8197c]/10';

const IconField: React.FC<{ icon: IconName; children: React.ReactNode; chevron?: boolean }> = ({ icon, children, chevron }) => (
  <div className="relative">
    <Icon name={icon} color="#4b5570" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" />
    {children}
    {chevron && <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: NAVY }} />}
  </div>
);

export const VolunteerModal: React.FC<VolunteerModalProps> = ({ isOpen, onClose, selectedEventId }) => {
  const [events, setEvents] = useState<CleanupEvent[]>([]);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    dbService.getEvents().then(setEvents);
  }, []);

  const [joinAs, setJoinAs] = useState<JoinAs>('individual');
  const [eventId, setEventId] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('Clean-up');
  const [participants, setParticipants] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isTeam = joinAs !== 'individual';
  const teamWord = joinAs === 'organization' ? 'Organization' : 'Group';

  const resetFormState = () => {
    setJoinAs('individual');
    setFullName('');
    setPhone('');
    setEmail('');
    setBirthYear('');
    setOrganizationName('');
    setAddress('');
    setRole('Clean-up');
    setParticipants('');
    setPhoneError(null);
  };

  // Reset the form when it opens; a "Register" button on a campaign preselects it.
  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setEventId(selectedEventId || '');
      resetFormState();
    }
  }, [isOpen, selectedEventId]);

  // Escape closes; the page behind doesn't scroll while the form is open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const years = Array.from({ length: currentYear - 6 - 1920 + 1 }, (_, i) => currentYear - 6 - i);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
    setPhoneError(digits.length > 0 && digits.length < 10 ? `Phone number must be exactly 10 digits (${digits.length}/10)` : null);
  };

  const handleCloseModal = () => {
    resetFormState();
    onClose();
  };

  /**
   * Saves the sign-up to the site's database and, in the background (not
   * awaited, so CORS never blocks the form), to the Google Sheet. The sheet
   * keeps its columns: a group/organization's name and head count go in
   * "skills". Every field is required.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      return;
    }
    const people = isTeam ? parseInt(participants, 10) : 1;
    if (!(people >= 1)) {
      alert('⚠ Please enter the number of participants.');
      return;
    }

    const eventObj = events.find((ev) => ev.id === eventId);
    const eventTitle = eventObj ? eventObj.title : 'World Cleanup Day 2026';
    const teamLabel = joinAs === 'organization' ? 'Tổ chức' : 'Nhóm';
    const sheetSkills = isTeam ? [role, `${teamLabel}: ${organizationName.trim()}`, `${people} người`] : [role];

    dbService.addVolunteer({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: cleanPhone,
      city: address.trim(),
      eventId,
      eventName: eventTitle,
      ageGroup: birthYear,
      tshirtSize: 'L',
      emergencyContact: cleanPhone,
      skills: [role],
      status: 'Approved',
      joinAs,
      organizationName: isTeam ? organizationName.trim() : undefined,
      participants: people,
      preferredRole: role,
    });

    const effectiveUrl = eventObj?.sheetUrl || getGoogleAppsScriptUrl();
    saveToGoogleSheet(
      {
        name: fullName.trim(),
        phone: cleanPhone,
        email: email.trim(),
        city: address.trim(),
        age: birthYear,
        project: eventTitle,
        skills: sheetSkills,
      },
      effectiveUrl
    ).catch((err) => console.warn('Silent sheet sync:', err));

    setSubmitted(true);
  };

  const overlay =
    'fixed inset-0 z-[999999] bg-slate-900/55 backdrop-blur-md flex items-start sm:items-center justify-center p-3 sm:p-4 lg:p-3 overflow-y-auto animate-in fade-in duration-200';
  const card = 'relative my-auto w-full rounded-[26px] overflow-hidden bg-white shadow-[0_30px_80px_-20px_rgba(15,31,75,0.45)] animate-in zoom-in-95 duration-200';

  const closeButton = (
    <button
      type="button"
      onClick={handleCloseModal}
      className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
      aria-label="Close"
    >
      <X className="w-6 h-6" style={{ color: NAVY }} strokeWidth={2.5} />
    </button>
  );

  const logo = (
    <div className="flex items-center justify-center gap-2.5">
      <img src="/logo-icon-light.png" alt="" className="h-12 w-12 sm:h-[60px] sm:w-[60px] object-contain" />
      <div className="text-left leading-none" style={{ color: NAVY }}>
        <div className="font-serif font-black text-2xl sm:text-[30px] tracking-tight">Let’s do it!</div>
        <div className="font-serif text-lg sm:text-xl mt-1 ml-3">Vietnam</div>
      </div>
    </div>
  );

  if (submitted) {
    return createPortal(
      <div className={overlay}>
        <div className={`${card} max-w-md px-8 py-9 text-center`}>
          {closeButton}
          {logo}
          <div className="w-16 h-16 mx-auto mt-6 mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fde7f1' }}>
            <CheckCircle2 className="w-9 h-9" style={{ color: PINK }} />
          </div>
          <h3 className="text-2xl font-extrabold mb-2" style={{ color: NAVY }}>
            Registration successful!
          </h3>
          <p className="text-[15px] text-slate-600 mb-6">
            Thank you{fullName ? `, ${fullName}` : ''}! Your registration has been recorded. We'll be in touch soon.
          </p>
          <button
            type="button"
            onClick={handleCloseModal}
            className="w-full h-12 rounded-full text-white font-bold text-base shadow-lg hover:brightness-110 transition cursor-pointer"
            style={{ backgroundColor: PINK }}
          >
            Done
          </button>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className={overlay} onMouseDown={(e) => e.target === e.currentTarget && handleCloseModal()}>
      <div role="dialog" aria-modal="true" aria-labelledby="volunteer-modal-title" className={`${card} max-w-[960px] lg:max-w-[1320px] lg:max-h-[calc(100vh-24px)] lg:overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
        {closeButton}

        {/* Header: sky, greenery and leaves on the left, volunteers in a circle on the right */}
        <div className="relative px-5 sm:px-10 pt-7 pb-8 lg:pt-5 lg:pb-8 lg:[@media(max-height:820px)]:pt-3 lg:[@media(max-height:820px)]:pb-6 text-center overflow-hidden" style={{ background: 'linear-gradient(180deg, #e3f0fa 0%, #f3f8fc 55%, #ffffff 100%)' }}>
          <div className="absolute left-2 top-4 w-40 h-16 rounded-full bg-white/80 blur-xl pointer-events-none" />
          <div className="absolute -left-12 top-28 w-48 h-40 rounded-full bg-[#5e9e45]/50 blur-2xl pointer-events-none" />
          <div className="absolute left-20 top-36 w-44 h-32 rounded-full bg-[#8fc26f]/45 blur-2xl pointer-events-none" />
          <div className="absolute left-48 top-44 w-40 h-24 rounded-full bg-[#b9d99b]/40 blur-2xl pointer-events-none" />
          <svg viewBox="0 0 960 80" preserveAspectRatio="none" className="absolute left-0 bottom-0 w-full h-16 pointer-events-none" aria-hidden>
            <path d="M0 80 L0 38 C 120 0, 300 8, 470 60 C 520 74, 560 80, 600 80 Z" fill="#fff" />
            <rect x="0" y="70" width="960" height="10" fill="#fff" />
          </svg>
          <LeafArt className="hidden sm:block absolute left-14 top-16 w-16 h-20 pointer-events-none" style={{ transform: 'rotate(-35deg)' }} />
          <LeafArt className="hidden sm:block absolute left-36 top-24 w-8 h-11 pointer-events-none" style={{ transform: 'rotate(25deg)' }} />

          <div className="hidden sm:block absolute -right-10 -top-8 w-[250px] h-[250px] lg:-top-12 lg:w-[200px] lg:h-[200px] rounded-full overflow-hidden pointer-events-none">
            <img src="/images/who-we-are/hero.jpg" alt="" className="w-full h-full object-cover" style={{ objectPosition: '60% 40%' }} />
          </div>
          <div className="hidden sm:block absolute right-[235px] top-8 lg:right-[185px] lg:top-5 pointer-events-none" aria-hidden>
            <span className="absolute block w-2 h-7 rounded-full rotate-[-30deg]" style={{ backgroundColor: PINK, left: 18, top: 0 }} />
            <span className="absolute block w-2 h-7 rounded-full rotate-[-60deg]" style={{ backgroundColor: PINK, left: 0, top: 22 }} />
            <span className="absolute block w-7 h-2 rounded-full" style={{ backgroundColor: PINK, left: -6, top: 50 }} />
          </div>
          <LeafArt className="hidden sm:block absolute right-[215px] top-[165px] lg:right-[170px] lg:top-[105px] w-9 h-12 pointer-events-none" style={{ transform: 'rotate(-60deg)' }} />

          <div className="relative lg:flex lg:items-center lg:justify-center lg:gap-10">
            {logo}
            <div className="lg:text-left">
              <h3 id="volunteer-modal-title" className="mt-4 lg:mt-0 text-[28px] sm:text-[40px] lg:text-[38px] leading-tight font-extrabold" style={{ color: NAVY }}>
                Register to Volunteer
              </h3>
              <p className="mt-1 text-[15px] sm:text-[17px]" style={{ color: '#34406b' }}>
                Be part of a cleaner, greener and more beautiful Vietnam!
              </p>
              <div className="mx-auto lg:mx-0 mt-4 lg:mt-3 w-16 h-1 rounded-full" style={{ backgroundColor: PINK }} />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-5 sm:px-10 lg:px-12 pb-8 lg:pb-6 lg:[@media(max-height:820px)]:pb-4 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-x-12 gap-y-6 lg:gap-y-5 lg:[@media(max-height:820px)]:gap-y-4">
          {/* Desktop: two columns (choices | details), so the whole form fits on one screen. */}
          <div className="space-y-6 lg:space-y-5 lg:[@media(max-height:820px)]:space-y-4">
            {/* Join as */}
            <section>
              <SectionTitle icon="groups">Join as</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5" role="radiogroup" aria-label="Join as">
                {JOIN_OPTIONS.map(({ value, title, icon }) => {
                  const checked = joinAs === value;
                  return (
                    <label
                      key={value}
                      className="relative flex items-center lg:flex-col lg:items-start gap-3 lg:gap-1 px-4 py-3 lg:p-3 rounded-xl border cursor-pointer transition-colors"
                      style={{ borderColor: checked ? '#f28ab9' : '#dde3ee', backgroundColor: checked ? '#fff0f6' : '#fff', boxShadow: '0 2px 6px rgba(15,31,75,0.05)' }}
                    >
                      <input type="radio" name="joinAs" value={value} checked={checked} onChange={() => setJoinAs(value)} className="sr-only" />
                      <Icon name={icon} color={checked ? PINK : NAVY} className="w-9 h-9 lg:[@media(max-height:820px)]:w-8 lg:[@media(max-height:820px)]:h-8 shrink-0" />
                      <span className="flex-1 pr-6 lg:pr-0 font-bold text-[16px] sm:text-[17px]" style={{ color: NAVY }}>
                        {title}
                      </span>
                      <span className="absolute top-1/2 -translate-y-1/2 right-4 lg:translate-y-0 lg:top-3 lg:right-3">
                        <RadioMark checked={checked} />
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>

            {/* Project */}
            <section>
              <SectionTitle icon="assignment">Project or campaign</SectionTitle>
              <IconField icon="calendar" chevron>
                <select
                  required
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  className={`${fieldClass} appearance-none cursor-pointer pr-12 truncate ${eventId ? '' : 'text-slate-400'}`}
                  style={eventId ? { color: NAVY } : undefined}
                  aria-label="Project or campaign"
                >
                  <option value="" disabled>
                    Select a project or campaign
                  </option>
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.id} style={{ color: NAVY }}>
                      {evt.title}
                    </option>
                  ))}
                </select>
              </IconField>
            </section>

            {/* Preferred role */}
            <section>
              <SectionTitle icon="work">Preferred role</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5" role="radiogroup" aria-label="Preferred role">
                {ROLES.map(({ value, icon }) => {
                  const checked = role === value;
                  return (
                    <label
                      key={value}
                      className="relative flex flex-col items-center justify-center gap-1.5 h-[78px] lg:h-[74px] lg:[@media(max-height:820px)]:h-[68px] rounded-xl border cursor-pointer transition-colors"
                      style={{ borderColor: checked ? '#f28ab9' : '#dde3ee', backgroundColor: checked ? '#fff0f6' : '#fff', boxShadow: '0 2px 6px rgba(15,31,75,0.05)' }}
                    >
                      <input type="radio" name="role" value={value} checked={checked} onChange={() => setRole(value)} className="sr-only" />
                      <Icon name={icon} color={checked ? PINK : NAVY} className="w-8 h-8 lg:[@media(max-height:820px)]:w-7 lg:[@media(max-height:820px)]:h-7" />
                      <span className="font-bold text-[15px] sm:text-base" style={{ color: NAVY }}>
                        {value}
                      </span>
                      <span className="absolute top-3 right-3">
                        <RadioMark checked={checked} />
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="space-y-6 lg:space-y-5 lg:[@media(max-height:820px)]:space-y-4">
            <hr className="border-[#e3e8f0] lg:hidden" />

            {/* Personal information */}
            <section>
              <SectionTitle icon="person">Personal information</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 lg:[@media(max-height:820px)]:gap-y-2.5">
                <div>
                  <FieldLabel htmlFor="vm-name" required>
                    {isTeam ? 'Contact person' : 'Full name'}
                  </FieldLabel>
                  <IconField icon="person">
                    <input
                      id="vm-name"
                      required
                      autoComplete="name"
                      placeholder={isTeam ? 'Enter the contact person’s full name' : 'Enter your full name'}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={fieldClass}
                    />
                  </IconField>
                </div>
                <div>
                  <FieldLabel htmlFor="vm-phone" required>
                    Phone number
                  </FieldLabel>
                  <IconField icon="phone">
                    <input
                      id="vm-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      required
                      maxLength={10}
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={handlePhoneChange}
                      className={`${fieldClass} ${phoneError ? '!border-red-400 !bg-red-50/40' : ''}`}
                    />
                  </IconField>
                  {phoneError && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {phoneError}
                    </p>
                  )}
                </div>
                <div>
                  <FieldLabel htmlFor="vm-email" required>
                    Email address
                  </FieldLabel>
                  <IconField icon="mail">
                    <input id="vm-email" type="email" required autoComplete="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} />
                  </IconField>
                </div>
                <div>
                  <FieldLabel htmlFor="vm-birth" required>
                    Year of birth
                  </FieldLabel>
                  <IconField icon="calendar" chevron>
                    <select
                      id="vm-birth"
                      required
                      value={birthYear}
                      onChange={(e) => setBirthYear(e.target.value)}
                      className={`${fieldClass} appearance-none cursor-pointer pr-12 ${birthYear ? '' : 'text-slate-400'}`}
                      style={birthYear ? { color: NAVY } : undefined}
                    >
                      <option value="" disabled>
                        Select your year of birth
                      </option>
                      {years.map((y) => (
                        <option key={y} value={y} style={{ color: NAVY }}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </IconField>
                </div>
                {/* A group or organization also gives its name, next to the address. */}
                {isTeam && (
                  <div>
                    <FieldLabel htmlFor="vm-org" required>
                      {teamWord} name
                    </FieldLabel>
                    <IconField icon={joinAs === 'organization' ? 'apartment' : 'groups'}>
                      <input
                        id="vm-org"
                        required
                        autoComplete="organization"
                        placeholder={joinAs === 'organization' ? 'Enter your company or organization name' : 'Enter your group name'}
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        className={fieldClass}
                      />
                    </IconField>
                  </div>
                )}
                <div className={isTeam ? '' : 'sm:col-span-2'}>
                  <FieldLabel htmlFor="vm-address" required>
                    Address
                  </FieldLabel>
                  <IconField icon="place">
                    <input id="vm-address" required autoComplete="street-address" placeholder="Enter your address" value={address} onChange={(e) => setAddress(e.target.value)} className={fieldClass} />
                  </IconField>
                </div>
              </div>
            </section>

            {/* Number of participants: always 1 for an individual */}
            <section>
              <SectionTitle icon="groups">Number of participants</SectionTitle>
              <IconField icon="groups">
                <input
                  type="number"
                  min={1}
                  required
                  readOnly={!isTeam}
                  inputMode="numeric"
                  placeholder="Enter number of participants"
                  value={isTeam ? participants : '1'}
                  onChange={(e) => setParticipants(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  className={`${fieldClass} ${isTeam ? '' : '!bg-slate-100 text-slate-500 cursor-not-allowed focus:!border-[#cfd6e4] focus:!ring-0'}`}
                  aria-label="Number of participants"
                />
              </IconField>
            </section>
          </div>

          <div className="lg:col-span-2 flex justify-center pt-1 lg:pt-0">
            <button
              type="submit"
              className="w-full sm:w-[430px] h-12 rounded-full text-white font-bold text-base sm:text-lg shadow-lg shadow-[#e8197c]/30 hover:brightness-110 transition cursor-pointer flex items-center justify-center gap-2.5"
              style={{ backgroundColor: PINK }}
            >
              <UserPlus className="w-5 h-5" />
              <span>Register to Volunteer</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
