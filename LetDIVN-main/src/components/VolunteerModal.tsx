import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  CalendarDays,
  Camera,
  Car,
  CheckCircle2,
  ChevronDown,
  Layers,
  Mail,
  MapPin,
  Megaphone,
  MessageCircleMore,
  Pencil,
  Phone,
  Plus,
  Send,
  Settings,
  Truck,
  User,
  Users,
  UsersRound,
  X,
  type LucideIcon,
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { CleanupEvent } from '../types';
import { saveToGoogleSheet, getGoogleAppsScriptUrl } from '../services/googleSheetsService';

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEventId?: string;
}

const NAVY = '#1e1b4b';
const PURPLE = '#6d3fe0';

/** Skills, in the two-column order of the form, each with its own icon tile colour. */
const SKILLS: { label: string; Icon: LucideIcon; color: string; tint: string }[] = [
  { label: 'Logistics & Waste Sorting', Icon: Truck, color: '#7c5cff', tint: '#efeaff' },
  { label: 'Photography & Media Production', Icon: Camera, color: '#3b82f6', tint: '#e6f0ff' },
  { label: 'Coordination & Team Management', Icon: Users, color: '#ec4899', tint: '#fde6f1' },
  { label: 'First Aid & Medical Support', Icon: Plus, color: '#ef4470', tint: '#ffe6ec' },
  { label: 'Driving & Waste Transport', Icon: Car, color: '#16a34a', tint: '#e3f6ea' },
  { label: 'English Interpretation', Icon: MessageCircleMore, color: '#14b8a6', tint: '#ddf6f2' },
  { label: 'MC & Eco Tour Guide', Icon: Megaphone, color: '#f97316', tint: '#fff0e2' },
];

/** The hand holding a heart in the header's right corner. */
const HeartInHand: React.FC = () => (
  <svg viewBox="0 0 200 160" className="w-full h-full" aria-hidden>
    <defs>
      <linearGradient id="vm-heart" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffc1d4" />
        <stop offset="100%" stopColor="#ff5c93" />
      </linearGradient>
      <radialGradient id="vm-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="112" cy="58" r="48" fill="url(#vm-glow)" />
    {/* sparkle lines around the heart */}
    <g stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.9">
      <line x1="112" y1="4" x2="112" y2="14" />
      <line x1="70" y1="24" x2="78" y2="31" />
      <line x1="154" y1="24" x2="146" y2="31" />
      <line x1="60" y1="60" x2="70" y2="60" />
      <line x1="164" y1="60" x2="154" y2="60" />
    </g>
    {/* the heart */}
    <path d="M112 92 C 72 66, 80 32, 100 32 C 108 32, 112 39, 112 43 C 112 39, 116 32, 124 32 C 144 32, 152 66, 112 92 Z" fill="url(#vm-heart)" />
    <path d="M96 42 C 90 44, 88 52, 91 58" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.7" />
    {/* small hearts */}
    <path d="M40 30 C 30 23, 32 14, 37 14 C 39 14, 40 16, 40 17 C 40 16, 41 14, 43 14 C 48 14, 50 23, 40 30 Z" fill="#ff8fb3" opacity="0.85" />
    <path d="M182 86 C 174 80, 176 73, 180 73 C 181.5 73, 182 74.5, 182 75.5 C 182 74.5, 182.5 73, 184 73 C 188 73, 190 80, 182 86 Z" fill="#ff8fb3" opacity="0.85" />
    {/* the open hand, palm up */}
    <path
      d="M34 158 L66 124 C 76 113, 90 108, 106 107 L 148 104 C 158 103, 160 115, 150 117 L 124 121 C 140 121, 158 115, 172 106 C 181 100, 190 110, 181 118 C 164 132, 140 141, 110 143 L 82 145 L 64 160 Z"
      fill="#ffd9e5"
      opacity="0.95"
    />
    <path d="M124 121 L 100 123" stroke="#ff9fbd" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const inputClass =
  'w-full h-14 px-4 rounded-2xl border border-[#dcd8ee] bg-white text-base text-[#1e1b4b] shadow-[0_1px_2px_rgba(30,27,75,0.04)] outline-none transition focus:border-[#7c4dff] focus:ring-4 focus:ring-[#7c4dff]/10 placeholder:text-slate-400';

const Label: React.FC<{ Icon: LucideIcon; children: React.ReactNode; required?: boolean; filled?: boolean; htmlFor?: string }> = ({
  Icon,
  children,
  required,
  filled,
  htmlFor,
}) => (
  <label htmlFor={htmlFor} className="flex items-center gap-3 mb-2.5 text-[17px] sm:text-lg font-semibold" style={{ color: NAVY }}>
    {/* Solid icons: the outline takes the background colour, so inner details (the pin's hole) show. */}
    <Icon className="w-6 h-6 shrink-0" style={{ color: PURPLE }} fill={filled ? 'currentColor' : 'none'} stroke={filled ? '#fff' : 'currentColor'} strokeWidth={filled ? 1.5 : 2} />
    <span>
      {children}
      {required && <span className="text-[#ec3a7c]"> *</span>}
    </span>
  </label>
);

export const VolunteerModal: React.FC<VolunteerModalProps> = ({ isOpen, onClose, selectedEventId }) => {
  const [events, setEvents] = useState<CleanupEvent[]>([]);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    dbService.getEvents().then(setEvents);
  }, []);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [eventId, setEventId] = useState(selectedEventId || events[0]?.id || '');
  const [birthYear, setBirthYear] = useState<string>('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customRole, setCustomRole] = useState('');
  const [notes, setNotes] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Age from the birth year
  const yearNumber = parseInt(birthYear, 10);
  const calculatedAge = !isNaN(yearNumber) && yearNumber >= 1920 && yearNumber <= currentYear ? currentYear - yearNumber : null;

  const resetFormState = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setBirthYear('');
    setSelectedSkills([]);
    setCustomRole('');
    setNotes('');
    setPhoneError(null);
  };

  // Reset the form when the modal opens
  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      if (selectedEventId) {
        setEventId(selectedEventId);
      } else if (events.length > 0) {
        setEventId(events[0].id);
      }
      resetFormState();
    }
  }, [isOpen, selectedEventId, events]);

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

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((list) => (list.includes(skill) ? list.filter((s) => s !== skill) : [...list, skill]));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(digitsOnly);
    // Optional field — only flag an error once they've typed *something* that
    // isn't a complete number yet, never for leaving it blank.
    if (digitsOnly.length > 0 && digitsOnly.length < 10) {
      setPhoneError(`Phone number must be exactly 10 digits (currently ${digitsOnly.length}/10 digits)`);
    } else {
      setPhoneError(null);
    }
  };

  const handleBirthYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBirthYear(e.target.value.replace(/\D/g, '').slice(0, 4));
  };

  const handleCloseModal = () => {
    resetFormState();
    onClose();
  };

  /**
   * Saves the sign-up to the site's database and, in the background (not
   * awaited, so CORS never blocks the form), to the Google Sheet.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Phone number is optional — only validate its format when entered.
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length > 0 && cleanPhone.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits (no more, no less)!');
      alert('⚠ Invalid phone number!\nPlease enter exactly 10 digits (e.g., 0987654321), or leave it blank.');
      return;
    }

    if (calculatedAge === null || calculatedAge < 6 || calculatedAge > 105) {
      alert(`⚠ Invalid birth year!\nPlease enter a birth year between 1920 and ${currentYear - 6}.`);
      return;
    }

    const eventObj = events.find((ev) => ev.id === eventId);
    const finalSkills = [...selectedSkills];
    if (customRole.trim()) finalSkills.push(customRole.trim());

    const eventTitle = eventObj ? eventObj.title : 'World Cleanup Day 2026';
    // The 'age' field carries the birth year itself (e.g. "2004").
    const formData = {
      name: fullName.trim(),
      phone: cleanPhone,
      email: email.trim(),
      city: address.trim() || 'Vietnam',
      age: birthYear,
      project: eventTitle,
      skills: finalSkills,
    };

    dbService.addVolunteer({
      fullName: formData.name,
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      eventId,
      eventName: formData.project,
      ageGroup: birthYear,
      tshirtSize: 'L',
      emergencyContact: formData.phone,
      skills: finalSkills,
      status: 'Approved',
      notes: notes.trim(),
    });

    const effectiveUrl = eventObj?.sheetUrl || getGoogleAppsScriptUrl();
    saveToGoogleSheet(formData, effectiveUrl).catch((err) => {
      console.warn('Silent sheet sync:', err);
    });

    setSubmitted(true);
  };

  const handleDoneAfterSuccess = () => {
    setSubmitted(false);
    onClose();
    resetFormState();
  };

  const overlay = 'fixed inset-0 z-[999999] bg-[#0f0c29]/70 backdrop-blur-md flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200';
  const headerGradient = { backgroundImage: 'linear-gradient(100deg, #2a2c7c 0%, #4b35a0 38%, #9b3f9d 68%, #e2508f 88%, #f06a9c 100%)' };

  // Soft blobs behind the header text, as in the design.
  const blobs = (
    <>
      <div className="absolute -left-10 bottom-0 w-64 h-32 rounded-full bg-[#5a3fb0]/50 blur-2xl pointer-events-none" />
      <div className="absolute left-1/3 -top-16 w-72 h-40 rounded-full bg-[#7b45b8]/40 blur-3xl pointer-events-none" />
      <div className="absolute right-24 top-6 w-56 h-40 rounded-[40%] bg-[#f37bab]/35 blur-2xl pointer-events-none" />
      <div className="absolute right-0 bottom-2 w-72 h-24 rounded-full bg-[#ff9cc0]/40 blur-2xl pointer-events-none" />
    </>
  );

  if (submitted) {
    return createPortal(
      <div className={overlay}>
        <div className="relative my-auto w-full max-w-md rounded-[28px] overflow-hidden bg-white shadow-2xl border border-white/40 animate-in zoom-in-95 duration-200">
          <div className="relative px-8 pt-8 pb-14 text-center text-white overflow-hidden" style={headerGradient}>
            {blobs}
            <div className="relative w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-white" />
            </div>
          </div>
          <div className="relative -mt-7 rounded-t-[28px] bg-white px-8 pt-7 pb-8 text-center">
            <h3 className="text-2xl font-extrabold mb-2" style={{ color: NAVY, fontFamily: 'Poppins, sans-serif' }}>
              Registration Successful!
            </h3>
            <p className="text-[15px] text-slate-600 mb-6">
              Thank you{fullName ? `, ${fullName}` : ''}! Your registration has been recorded and synced. We'll be in touch soon.
            </p>
            <button
              type="button"
              onClick={handleDoneAfterSuccess}
              className="w-full h-14 rounded-2xl text-white font-bold text-base shadow-lg hover:brightness-110 transition cursor-pointer"
              style={headerGradient}
            >
              Done
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className={overlay} onMouseDown={(e) => e.target === e.currentTarget && handleCloseModal()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="volunteer-modal-title"
        className="relative my-auto w-full max-w-[940px] rounded-[28px] overflow-hidden bg-white shadow-[0_30px_80px_-20px_rgba(15,12,41,0.6)] border border-white/40 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 sm:px-11 pt-6 sm:pt-7 pb-14 text-white overflow-hidden" style={headerGradient}>
          {blobs}
          <div className="absolute right-3 top-16 w-24 h-20 sm:right-16 sm:top-6 sm:w-44 sm:h-36 pointer-events-none opacity-90 sm:opacity-100">
            <HeartInHand />
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 z-10 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="relative flex items-center gap-3">
            <img src="/logo-icon-light.png" alt="" className="h-12 w-12 sm:h-16 sm:w-16 object-contain" />
            <div className="leading-none">
              <div className="font-serif font-black text-xl sm:text-[28px] tracking-tight">Let’s do it!</div>
              <div className="font-serif text-base sm:text-[22px] text-white/90 mt-1">Vietnam</div>
            </div>
          </div>
          <h3
            id="volunteer-modal-title"
            className="relative mt-3 sm:mt-4 text-[28px] leading-tight sm:text-[46px] sm:leading-[1.1] font-extrabold tracking-tight pr-24 sm:pr-56"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Register to Join a Project
          </h3>
          <p className="relative mt-1.5 text-sm sm:text-lg text-white/90 pr-24 sm:pr-56">Your information will automatically sync to the Admin's Google Sheets</p>
        </div>

        {/* Body: white panel with rounded top corners over the header */}
        <form onSubmit={handleSubmit} className="relative -mt-7 rounded-t-[28px] bg-white px-5 sm:px-11 pt-7 sm:pt-8 pb-8 space-y-6">
          {/* Project */}
          <div>
            <Label Icon={Layers} required htmlFor="vm-event">
              1. Select the Project / Campaign to Join
            </Label>
            <div className="relative">
              <UsersRound className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 pointer-events-none" style={{ color: PURPLE }} fill="currentColor" stroke="#f6f4ff" strokeWidth={1.5} />
              <select
                id="vm-event"
                required
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full h-[60px] pl-16 pr-12 rounded-2xl border border-[#d9d3f5] bg-[#f6f4ff] text-base sm:text-[17px] font-semibold appearance-none outline-none cursor-pointer truncate focus:border-[#7c4dff] focus:ring-4 focus:ring-[#7c4dff]/10"
                style={{ color: NAVY }}
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: NAVY }} />
            </div>
          </div>

          {/* Name / phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <Label Icon={User} required filled htmlFor="vm-name">
                Full Name
              </Label>
              <input id="vm-name" type="text" required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <Label Icon={Phone} filled htmlFor="vm-phone">
                Phone Number
              </Label>
              <input
                id="vm-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                value={phone}
                onChange={handlePhoneChange}
                className={`${inputClass} ${phoneError ? '!border-red-400 !bg-red-50/50' : phone.length === 10 ? '!border-emerald-500' : ''}`}
              />
              {phoneError && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{phoneError}</span>
                </p>
              )}
            </div>

            {/* Email / birth year */}
            <div>
              <Label Icon={Mail} required htmlFor="vm-email">
                Email Address
              </Label>
              <input id="vm-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </div>
            <div>
              <Label Icon={CalendarDays} required htmlFor="vm-birth">
                Birth Year
              </Label>
              <input
                id="vm-birth"
                type="number"
                required
                min="1920"
                max={currentYear - 6}
                value={birthYear}
                onChange={handleBirthYearChange}
                className={inputClass}
              />
              {birthYear.length === 4 && calculatedAge === null && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">Invalid birth year (must be between 1920 and {currentYear - 6})</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <Label Icon={MapPin} required filled htmlFor="vm-address">
              Address / City
            </Label>
            <input id="vm-address" type="text" required autoComplete="address-level2" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
          </div>

          {/* Skills */}
          <div>
            <Label Icon={Settings}>Skills or roles you'd like to help with:</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
              {SKILLS.map(({ label, Icon, color, tint }) => {
                const checked = selectedSkills.includes(label);
                return (
                  <label
                    key={label}
                    className={`flex items-center gap-4 h-[60px] px-5 rounded-2xl border cursor-pointer transition-colors ${
                      checked ? 'border-[#7c4dff] bg-[#faf7ff]' : 'border-[#e6e3f3] bg-white hover:bg-[#fbfaff]'
                    }`}
                  >
                    <input type="checkbox" checked={checked} onChange={() => handleSkillToggle(label)} className="w-5 h-5 shrink-0 accent-[#6d3fe0] cursor-pointer" />
                    <span className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center" style={{ backgroundColor: tint }}>
                      <Icon
                        className="w-6 h-6"
                        style={{ color }}
                        fill={Icon === Plus ? 'none' : 'currentColor'}
                        stroke={Icon === Plus ? 'currentColor' : tint}
                        strokeWidth={Icon === Plus ? 4 : 1.5}
                      />
                    </span>
                    <span className="text-[15px] sm:text-base" style={{ color: '#2b2a4a' }}>
                      {label}
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="relative mt-3">
              <Pencil className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Other role / skill (if any)..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className={`${inputClass} !pl-14 placeholder:!text-[#2b2a4a]`}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label Icon={MessageCircleMore} filled htmlFor="vm-notes">
              Notes / Additional Message (optional)
            </Label>
            <textarea id="vm-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={`${inputClass} !h-auto py-3 resize-y`} />
          </div>

          <button
            type="submit"
            disabled={phone.length > 0 && phone.length !== 10}
            className="w-full h-14 rounded-2xl text-white font-bold text-base sm:text-lg shadow-lg shadow-[#9b3f9d]/25 hover:brightness-110 transition cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
            style={headerGradient}
          >
            <span>Confirm Volunteer Registration</span>
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};
