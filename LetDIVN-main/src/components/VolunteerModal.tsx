import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { dbService } from '../services/dbService';
import { CleanupEvent } from '../types';
import { saveToGoogleSheet, getGoogleAppsScriptUrl } from '../services/googleSheetsService';
import { sendNotificationEmail } from '../services/emailService';
import { isEventExpired, formatDate } from '../utils/eventUtils';

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEventId?: string;
}

export const VolunteerModal: React.FC<VolunteerModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedEventId 
}) => {
  const [events, setEvents] = useState<CleanupEvent[]>([]);
  const availableEvents = events.filter(e => !isEventExpired(e.date));
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    dbService.getEvents().then(setEvents);
  }, []);

  // Always start blank — the person registering fills in their own details,
  // regardless of which account (if any) happens to be logged in.
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [eventId, setEventId] = useState(selectedEventId || availableEvents[0]?.id || '');
  const [birthYear, setBirthYear] = useState<string>('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Logistics & Waste Sorting']);
  const [customRole, setCustomRole] = useState('');
  const [notes, setNotes] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Valid birth year range: from 1920 to (current year - 6)
  const yearNumber = parseInt(birthYear, 10);
  const minBirthYear = 1920;
  const maxBirthYear = currentYear - 6;
  const isBirthYearValid = !isNaN(yearNumber) && yearNumber >= minBirthYear && yearNumber <= maxBirthYear;

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

  // Reset form when modal opens — always blank, never pre-filled from the
  // logged-in account, so every registration reflects what the volunteer
  // actually typed.
  useEffect(() => {
    if (isOpen) {
      if (selectedEventId) {
        setEventId(selectedEventId);
      } else if (availableEvents.length > 0) {
        setEventId(availableEvents[0].id);
      }
      resetFormState();
      setIsSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen, selectedEventId, events]);

  if (!isOpen) return null;

  const skillOptions = [
    'Logistics & Waste Sorting',
    'Photography & Media Production',
    'Coordination & Team Management',
    'First Aid & Medical Support',
    'Driving & Waste Transport',
    'English Interpretation',
    'MC & Eco Tour Guide'
  ];

  const handleSkillToggle = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(digitsOnly);

    if (digitsOnly.length > 0 && digitsOnly.length < 10) {
      setPhoneError(`Phone number must be exactly 10 digits (currently ${digitsOnly.length}/10 digits)`);
    } else {
      setPhoneError(null);
    }
  };

  const handleBirthYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
    setBirthYear(digits);
  };

  const handleCloseModal = () => {
    resetFormState();
    onClose();
  };

  /**
   * Form submit handler:
   * 1. Gather all data into formData.
   * 2. Save to the internal database (awaited, so we know it actually succeeded).
   * 3. Call saveToGoogleSheet(formData) independently in the background (best-effort, not awaited).
   * 4. Show the success state in the popup instead of closing it immediately.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // 1. Validate the phone number constraint (exactly 10 digits)
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits (no more, no less)!');
      alert('⚠ Invalid phone number!\nPlease enter exactly 10 digits (e.g., 0987654321).');
      return;
    }

    // 2. Validate birth year
    if (!isBirthYearValid) {
      alert(`⚠ Invalid birth year!\nPlease enter a birth year between ${minBirthYear} and ${maxBirthYear}.`);
      return;
    }

    const eventObj = events.find(ev => ev.id === eventId);
    const finalSkills = [...selectedSkills];
    if (customRole.trim()) {
      finalSkills.push(customRole.trim());
    }

    const eventTitle = eventObj ? eventObj.title : 'World Cleanup Day 2026';

    // Gather all data from the input fields
    const formData = {
      name: fullName.trim(),
      phone: cleanPhone,
      email: email.trim(),
      city: address.trim() || 'Vietnam',
      birthYear: birthYear.trim(),
      project: eventTitle,
      skills: finalSkills
    };

    setIsSubmitting(true);
    try {
      // Save to the internal database — await the real result so we know
      // whether it actually succeeded before showing a success state.
      await dbService.addVolunteer({
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        eventId,
        eventName: formData.project,
        birthYear: formData.birthYear,
        tshirtSize: 'L',
        emergencyContact: formData.phone,
        skills: finalSkills,
        status: 'Approved',
        notes: notes.trim()
      });

      // Get the configured Google Sheet Web App URL
      const eventSheetUrl = eventObj?.sheetUrl || '';
      const globalUrl = getGoogleAppsScriptUrl();
      const effectiveUrl = eventSheetUrl || globalUrl;

      // Sync to Google Sheets in the background — best-effort, never blocks the success UI.
      saveToGoogleSheet(formData, effectiveUrl).catch((err) => {
        console.warn('Silent sheet sync:', err);
      });

      // Send a registration confirmation email in the background (best-effort).
      if (formData.email) {
        const eventWhen = eventObj ? `${eventObj.date} (${eventObj.time})` : '';
        const eventWhere = eventObj?.location || eventObj?.city || '';
        sendNotificationEmail(
          formData.email,
          formData.name,
          `Volunteer registration confirmed - ${eventTitle}`,
          `Hi ${formData.name}, you have successfully registered for the campaign "${eventTitle}"` +
            (eventWhen ? ` happening on ${eventWhen}` : '') +
            (eventWhere ? ` at ${eventWhere}` : '') +
            `. Thank you for joining Let's Do It! Vietnam. We'll notify you by email if the schedule changes.`
        ).catch((err) => {
          console.warn('Silent registration email send failed:', err);
        });
      }

      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch { /* confetti is a visual nicety, never block on it */ }

      setIsSuccess(true);
    } catch (err: any) {
      alert(`⚠ Registration failed!\n${err?.message || 'Something went wrong, please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[999999] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#E81A7F] p-4 sm:p-5 text-white text-center relative shrink-0">
          <button
            onClick={handleCloseModal}
            className="absolute top-3.5 right-3.5 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1.5 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-0.5 rounded-full text-[11px] font-bold mb-1 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Nationwide Volunteer Network</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black">Register to Join a Project</h3>
          <p className="text-[11px] text-white/90">Your information will automatically sync to the Admin's Google Sheets</p>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 scrollbar-thin p-4 sm:p-6">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-black text-slate-900">Registration Successful!</h4>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                Thank you, <strong>{fullName}</strong>, for registering. Your information has been saved and synced to the Admin's Google Sheets.
              </p>
              <button
                onClick={handleCloseModal}
                className="bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-xs px-6 py-2.5 rounded-full cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Event selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                1. Select the Project / Campaign to Join *
              </label>
              <select
                required
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-hidden focus:border-[#E81A7F]"
              >
                {availableEvents.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title} ({evt.city} - {formatDate(evt.date)})
                  </option>
                ))}
              </select>
            </div>

            {/* Personal Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Nguyen Van An"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-[#E81A7F]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Phone Number (exactly 10 digits) *</label>
                  <span className={`text-[10px] font-mono font-bold ${phone.length === 10 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {phone.length}/10 digits
                  </span>
                </div>
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  minLength={10}
                  placeholder="e.g., 0987654321"
                  value={phone}
                  onChange={handlePhoneChange}
                  className={`w-full px-3.5 py-2 border rounded-xl text-xs sm:text-sm font-mono focus:outline-hidden transition-colors ${
                    phoneError 
                      ? 'border-red-400 bg-red-50/50 text-red-900 focus:border-red-500' 
                      : phone.length === 10
                      ? 'border-emerald-500 bg-emerald-50/30 text-emerald-900 focus:border-emerald-600 font-bold'
                      : 'border-slate-300 focus:border-[#E81A7F]'
                  }`}
                />
                {phoneError && (
                  <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{phoneError}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="ban.letsdoit@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-[#E81A7F]"
                />
              </div>

              {/* Birth year */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Birth Year (4 digits) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={minBirthYear}
                    max={maxBirthYear}
                    placeholder="e.g., 2004"
                    value={birthYear}
                    onChange={handleBirthYearChange}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 font-mono focus:outline-hidden focus:border-[#E81A7F]"
                  />
                </div>
                {!isBirthYearValid && birthYear.length === 4 && (
                  <p className="text-[10px] text-red-500 mt-1 font-medium">
                    Invalid birth year (must be between {minBirthYear} and {maxBirthYear})
                  </p>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Address / City *</label>
              <input
                type="text"
                required
                placeholder="e.g., Cau Giay District, Hanoi or Ho Chi Minh City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-[#E81A7F]"
              />
            </div>

            {/* Skills checklist */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Skills or roles you'd like to help with:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                {skillOptions.map((skill) => (
                  <label 
                    key={skill}
                    className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-colors ${
                      selectedSkills.includes(skill) ? 'bg-pink-50 border-[#E81A7F] text-slate-900 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill)}
                      onChange={() => handleSkillToggle(skill)}
                      className="accent-[#E81A7F] w-3.5 h-3.5 rounded"
                    />
                    <span className="text-[11px]">{skill}</span>
                  </label>
                ))}
              </div>

              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Other role / skill (if any)..."
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-[#E81A7F]"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Additional Message (optional)</label>
              <textarea
                placeholder="e.g., I can help prepare drinking water and a PA speaker..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-[#E81A7F]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || (phone.length > 0 && phone.length !== 10)}
              className="w-full bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-xs sm:text-sm py-3 rounded-2xl shadow-lg hover:shadow-pink-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{isSubmitting ? 'Submitting...' : 'Confirm Volunteer Registration'}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
          )}
        </div>

      </div>
    </div>,
    document.body
  ) : null;
};


