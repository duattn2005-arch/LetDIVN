import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Building2, CheckCircle2, Sparkles, Send } from 'lucide-react';
import { dbService } from '../services/dbService';

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PartnerModal: React.FC<PartnerModalProps> = ({ isOpen, onClose }) => {
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<'Corporate' | 'NGO' | 'Government' | 'University' | 'Media'>('Corporate');
  const [partnershipType, setPartnershipType] = useState('Financial & equipment sponsorship');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.addPartner({
      name: companyName,
      tier: 'Silver',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300&auto=format&fit=crop&q=80',
      website: 'https://example.com',
      type: type,
      description: `${partnershipType} - Representative: ${contactPerson} (${phone})`,
      joinedYear: new Date().getFullYear(),
      contactPerson,
      email,
      phone
    });
    setSubmitted(true);
  };

  return typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-[#E81A7F] p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1.5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Strategic Partnership & ESG</span>
          </div>
          <h3 className="text-2xl font-black">Register to Become a Partner</h3>
          <p className="text-xs text-white/90 mt-1">Join Let's do it! Vietnam in building a sustainable future</p>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-black text-slate-900">Proposal Received!</h4>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Thank you <strong>{companyName}</strong> for submitting a partnership proposal. Let's do it! Vietnam's External Affairs & ESG team will contact {contactPerson} within 24 hours.
            </p>
            <button
              onClick={() => { setSubmitted(false); onClose(); }}
              className="bg-[#E81A7F] text-white font-bold text-sm px-8 py-3 rounded-full hover:bg-[#D01370]"
            >
              Confirm & Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Organization / Business Name *</label>
              <input
                type="text"
                required
                placeholder="Corporation / Company / University..."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-[#E81A7F]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Representative *</label>
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-[#E81A7F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="0987 654 321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-[#E81A7F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  placeholder="partner@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-[#E81A7F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Organization Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                >
                  <option value="Corporate">Business / Corporation</option>
                  <option value="NGO">Non-Governmental Organization (NGO)</option>
                  <option value="University">University / Research Institute</option>
                  <option value="Government">Government Agency</option>
                  <option value="Media">Press & Media Organization</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Proposed Partnership Type</label>
              <input
                type="text"
                placeholder="e.g., 100M VND to purchase reusable gloves, co-hosting a beach cleanup..."
                value={partnershipType}
                onChange={(e) => setPartnershipType(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-[#E81A7F]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-sm py-3.5 rounded-full shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Partnership Proposal</span>
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  ) : null;
};


