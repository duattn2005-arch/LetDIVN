import React from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Facebook, 
  Youtube, 
  Database,
  ArrowRight,
  Heart
} from 'lucide-react';
import { ActiveView } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { EditableText } from './EditableText';
import { GrowingTree } from './GrowingTree';

interface FooterProps {
  onNavigate: (view: any, extraId?: string) => void;
  onOpenVolunteer?: () => void;
  onOpenPartner?: () => void;
  onOpenDbAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenDbAdmin }) => {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-slate-200 text-slate-700 pt-16 pb-12 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Decorative growing forest — small "cây mọc lên" welcome to the footer */}
        <div className="flex items-end justify-center gap-1 sm:gap-2 pb-8">
          <GrowingTree size={30} variant="lime" delay={0} />
          <GrowingTree size={46} variant="emerald" delay={120} />
          <GrowingTree size={60} variant="pink" delay={60} />
          <GrowingTree size={44} variant="emerald" delay={200} />
          <GrowingTree size={28} variant="lime" delay={260} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-slate-100">
          
          {/* Col 1: Logo & Brief */}
          <div className="md:col-span-5 space-y-4">
            <div 
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <img 
                src="/logo-icon.png" 
                alt="Let's do it! Vietnam Icon" 
                className="h-12 w-12 object-contain transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col justify-center">
                <span className="font-serif font-black text-xl tracking-tight text-slate-950 leading-none group-hover:text-[#E81A7F] transition-colors">
                  Let’s do it!
                </span>
                <span className="font-serif font-medium text-sm text-slate-800 tracking-normal leading-tight mt-0.5">
                  Vietnam
                </span>
              </div>
            </div>

            <EditableText
              contentKey="footer.desc"
              defaultValue={t.footerDesc}
              as="p"
              multiline
              className="text-sm text-slate-500 max-w-sm leading-relaxed"
            />

            <div>
              <button
                id="footer-full-contact-link"
                onClick={() => onNavigate('contact')}
                className="text-xs font-bold text-[#E81A7F] hover:text-[#C9136B] underline flex items-center gap-1 cursor-pointer"
              >
                <span>{t.navContactUs}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Col 2: Contact Us */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-base font-bold text-slate-900">
              {t.contactInfo}
            </h4>

            <div className="flex flex-col space-y-3 text-sm text-slate-600">
              {/* Phone 1 */}
              <div>
                <EditableText
                  contentKey="contact.phone1"
                  defaultValue="035.872.6755 (Mr. Sơn)"
                  render={(value) => (
                    <a href={`tel:${value.replace(/\D/g, '')}`} className="flex items-center gap-3 hover:text-[#E81A7F] transition-colors group">
                      <div className="w-7 h-7 rounded-full bg-pink-50 flex items-center justify-center text-[#E81A7F] shrink-0">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium text-slate-700">{value}</span>
                    </a>
                  )}
                />
              </div>

              {/* Phone 2 */}
              <div>
                <EditableText
                  contentKey="contact.phone2"
                  defaultValue="0968.514.882 (Ms. Tú)"
                  render={(value) => (
                    <a href={`tel:${value.replace(/\D/g, '')}`} className="flex items-center gap-3 hover:text-[#E81A7F] transition-colors group">
                      <div className="w-7 h-7 rounded-full bg-pink-50 flex items-center justify-center text-[#E81A7F] shrink-0">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium text-slate-700">{value}</span>
                    </a>
                  )}
                />
              </div>

              {/* Email */}
              <div>
                <EditableText
                  contentKey="contact.email"
                  defaultValue="letsdoitvietnam@gmail.com"
                  render={(value) => (
                    <a href={`mailto:${value.trim()}`} className="flex items-center gap-3 hover:text-[#E81A7F] transition-colors group">
                      <div className="w-7 h-7 rounded-full bg-pink-50 flex items-center justify-center text-[#E81A7F] shrink-0">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium text-slate-700">{value}</span>
                    </a>
                  )}
                />
              </div>

              {/* Address */}
              <div className="flex items-center gap-3 text-slate-600 text-xs">
                <div className="w-7 h-7 rounded-full bg-pink-50 flex items-center justify-center text-[#E81A7F] shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <EditableText contentKey="footer.address" defaultValue="Hà Nội, TP. Hồ Chí Minh & Đà Nẵng, Việt Nam" as="span" className="font-medium text-slate-700 leading-snug" />
              </div>
            </div>

            {/* Official Social Links (Facebook & Instagram Only) */}
            <div className="flex items-center gap-3 pt-1">
              <a 
                href="https://www.facebook.com/LetsDoItVietNam" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full bg-pink-50 hover:bg-[#1877F2] text-[#1877F2] hover:text-white flex items-center justify-center transition-all shadow-xs cursor-pointer"
                title="Let's do it! Vietnam Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://www.instagram.com/letsdoitvietnam/" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full bg-pink-50 hover:bg-[#E1306C] text-[#E1306C] hover:text-white flex items-center justify-center transition-all shadow-xs cursor-pointer"
                title="Let's do it! Vietnam Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 3: Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-base font-bold text-slate-900">
              {t.quickLinks}
            </h4>

            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <button
                  onClick={() => onNavigate('who-we-are')}
                  className="hover:text-[#E81A7F] transition-colors cursor-pointer text-left"
                >
                  {t.navWhoWeAre}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('what-we-do')}
                  className="hover:text-[#E81A7F] transition-colors cursor-pointer text-left"
                >
                  {t.navWhatWeDo}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('our-team')}
                  className="hover:text-[#E81A7F] transition-colors cursor-pointer text-left"
                >
                  {t.navOurTeam}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('our-partners')}
                  className="hover:text-[#E81A7F] transition-colors cursor-pointer text-left"
                >
                  {t.navOurPartners}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('map')}
                  className="hover:text-[#E81A7F] transition-colors cursor-pointer text-left font-bold text-[#E81A7F]"
                >
                  {t.navMap}
                </button>
              </li>

              {/* Only show DB Studio if Admin */}
              {isAdmin && (
                <li>
                  <button
                    onClick={onOpenDbAdmin}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E81A7F] hover:underline cursor-pointer pt-1"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>{t.adminDb}</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>{t.allRightsReserved}</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-600 cursor-pointer">{t.privacyPolicy}</span>
            <span className="hover:text-slate-600 cursor-pointer">{t.termsOfService}</span>
          </div>
        </div>

      </div>
    </footer>
  );
};


