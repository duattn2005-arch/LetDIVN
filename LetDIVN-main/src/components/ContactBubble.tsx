import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Phone, 
  Mail, 
  Facebook, 
  Instagram, 
  Send, 
  ChevronRight,
  Headphones
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { EditableText } from './EditableText';

interface ContactBubbleProps {
  onOpenContactPage: () => void;
}

export const ContactBubble: React.FC<ContactBubbleProps> = ({ onOpenContactPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bubbleRef.current && !bubbleRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[999] flex flex-col items-end select-none" ref={bubbleRef}>
      
      {/* Expanded Contact Popup Window */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] max-w-[340px] sm:w-88 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden animate-in fade-in-50 zoom-in-95 slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#E81A7F] to-[#FF4D9E] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm leading-tight flex items-center gap-1.5">
                  <span>{t.contactBubbleTitle}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                </h4>
                <p className="text-[11px] text-pink-100 mt-0.5">
                  {t.contactBubbleSubtitle}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title={t.close}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-3.5 space-y-2 max-h-[70vh] overflow-y-auto">
            
            {/* Facebook Fanpage */}
            <a
              href="https://www.facebook.com/LetsDoItVietNam"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2.5 rounded-2xl bg-[#1877F2]/5 hover:bg-[#1877F2]/10 border border-[#1877F2]/20 text-slate-800 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Facebook className="w-4.5 h-4.5 fill-current" />
                </div>
                <div>
                  <EditableText
                    contentKey="contactBubble.fbLabel"
                    defaultValue="Facebook Fanpage"
                    as="div"
                    className="font-bold text-xs text-slate-900 group-hover:text-[#1877F2] transition-colors"
                  />
                  <EditableText
                    contentKey="contactBubble.fbHandle"
                    defaultValue="fb.com/LetsDoItVietNam"
                    as="div"
                    className="text-[11px] text-slate-500"
                  />
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1877F2] group-hover:translate-x-0.5 transition-all" />
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/letsdoitvietnam/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2.5 rounded-2xl bg-[#E1306C]/5 hover:bg-[#E1306C]/10 border border-[#E1306C]/20 text-slate-800 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Instagram className="w-4.5 h-4.5" />
                </div>
                <div>
                  <EditableText
                    contentKey="contactBubble.igLabel"
                    defaultValue="Instagram"
                    as="div"
                    className="font-bold text-xs text-slate-900 group-hover:text-[#E1306C] transition-colors"
                  />
                  <EditableText
                    contentKey="contactBubble.igHandle"
                    defaultValue="@letsdoitvietnam"
                    as="div"
                    className="text-[11px] text-slate-500"
                  />
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#E1306C] group-hover:translate-x-0.5 transition-all" />
            </a>

            {/* Hotline Mr. Sơn */}
            <a
              href="tel:0358726755"
              className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 text-slate-800 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <div>
                  <EditableText
                    contentKey="contactBubble.hotline1Label"
                    defaultValue="Hotline (Mr. Sơn)"
                    as="div"
                    className="font-bold text-xs text-slate-900 group-hover:text-emerald-600 transition-colors"
                  />
                  <EditableText
                    contentKey="contactBubble.hotline1Number"
                    defaultValue="035.872.6755"
                    as="div"
                    className="text-xs font-semibold text-emerald-600"
                  />
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            </a>

            {/* Hotline Ms. Tú */}
            <a
              href="tel:0968514882"
              className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 text-slate-800 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <div>
                  <EditableText
                    contentKey="contactBubble.hotline2Label"
                    defaultValue="Hotline (Ms. Tú)"
                    as="div"
                    className="font-bold text-xs text-slate-900 group-hover:text-emerald-600 transition-colors"
                  />
                  <EditableText
                    contentKey="contactBubble.hotline2Number"
                    defaultValue="0968.514.882"
                    as="div"
                    className="text-xs font-semibold text-emerald-600"
                  />
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            </a>

            {/* Email */}
            <a
              href="mailto:letsdoitvietnam@gmail.com"
              className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 hover:bg-pink-50 border border-slate-200/80 text-slate-800 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <div>
                  <EditableText
                    contentKey="contactBubble.emailLabel"
                    defaultValue="Email"
                    as="div"
                    className="font-bold text-xs text-slate-900 group-hover:text-[#E81A7F] transition-colors"
                  />
                  <EditableText
                    contentKey="contactBubble.emailAddress"
                    defaultValue="letsdoitvietnam@gmail.com"
                    as="div"
                    className="text-[11px] text-slate-500 truncate max-w-[150px]"
                  />
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#E81A7F] group-hover:translate-x-0.5 transition-all" />
            </a>

            {/* Full Form Link */}
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenContactPage();
              }}
              className="w-full mt-1.5 py-2.5 bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-pink-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t.contactBubbleOpenBtn}</span>
            </button>

          </div>
        </div>
      )}

      {/* Messenger-Style Round Floating Chat Bubble */}
      <button
        id="floating-contact-bubble-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative group w-14 h-14 bg-gradient-to-tr from-[#E81A7F] via-[#FF2B8F] to-[#FF4D9E] text-white rounded-full shadow-2xl hover:shadow-pink-500/50 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center border-2 border-white ring-4 ring-pink-400/25"
        title={t.contactBubbleTitle}
        aria-label="Contact support bubble"
      >
        {/* Animated Ripple Pulse Ring */}
        {!isOpen && (
          <span className="absolute -inset-1 rounded-full bg-pink-500/40 animate-ping pointer-events-none"></span>
        )}

        {/* Center Icon */}
        <div className="relative flex items-center justify-center">
          {isOpen ? (
            <X className="w-6 h-6 transition-transform duration-200 rotate-0" />
          ) : (
            <MessageCircle className="w-7 h-7 fill-white/20 transition-transform duration-200 group-hover:scale-105" />
          )}

          {/* Active Online Dot */}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full shadow-xs"></span>
        </div>
      </button>

    </div>
  );
};


