import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Menu, X, Sparkles, MapPin } from 'lucide-react';
import { ActiveView } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { EditableText } from './EditableText';

interface HeaderProps {
  currentView?: ActiveView | string;
  activeView?: ActiveView | string;
  onNavigate: (view: any, extraId?: string) => void;
  onOpenVolunteer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView: propCurrentView,
  activeView: propActiveView,
  onNavigate,
  onOpenVolunteer,
}) => {
  const currentView = propCurrentView || propActiveView || 'home';
  const { t } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectsDropdownOpen, setProjectsDropdownOpen] = useState(false);
  const [otherDropdownOpen, setOtherDropdownOpen] = useState(false);

  const projectsRef = useRef<HTMLDivElement>(null);
  const otherRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (projectsRef.current && !projectsRef.current.contains(e.target as Node)) {
        setProjectsDropdownOpen(false);
      }
      if (otherRef.current && !otherRef.current.contains(e.target as Node)) {
        setOtherDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigate by category (not a hardcoded event id) so this always resolves
  // to whichever live event currently has that category, however its id
  // was generated.
  const projectItems = [
    { title: t.projectWcd, id: 'World Cleanup Day' },
    { title: t.projectEnvDay, id: 'Environmental Day' },
    { title: t.projectGreenOcean, id: 'Green Ocean Campaign' },
    { title: t.projectYoungWildlife, id: 'Wildlife & Nature' },
    { title: t.projectWorkshop, id: 'Workshop & Education' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs select-none">
      
      {/* Top Notification & Utility Bar with Smooth Running Marquee */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-3 sm:px-4 overflow-hidden w-full relative">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-2 sm:gap-4 overflow-hidden">
          
          {/* Running Text Marquee Area */}
          <div className="flex-1 overflow-hidden relative flex items-center h-5">
            <div className="animate-marquee-infinite flex items-center gap-8 whitespace-nowrap">
              {/* Track Part 1 */}
              <div className="flex items-center gap-8 shrink-0">
                <span className="font-medium text-slate-200 text-[11px] sm:text-xs flex items-center gap-1.5">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  <EditableText contentKey="header.topAnnouncement" defaultValue={t.topBarAnnouncement} as="span" />
                </span>
                <span className="font-medium text-pink-300 text-[11px] sm:text-xs flex items-center gap-1.5">
                  <span className="flex h-2 w-2 rounded-full bg-[#E81A7F] animate-pulse shrink-0"></span>
                  <EditableText contentKey="header.topTagline" defaultValue={t.topBarTagline} as="span" />
                </span>
              </div>

              {/* Track Part 2 (Seamless loop duplicate) */}
              <div className="flex items-center gap-8 shrink-0" aria-hidden="true">
                <span className="font-medium text-slate-200 text-[11px] sm:text-xs flex items-center gap-1.5">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  <EditableText contentKey="header.topAnnouncement" defaultValue={t.topBarAnnouncement} as="span" />
                </span>
                <span className="font-medium text-pink-300 text-[11px] sm:text-xs flex items-center gap-1.5">
                  <span className="flex h-2 w-2 rounded-full bg-[#E81A7F] animate-pulse shrink-0"></span>
                  <EditableText contentKey="header.topTagline" defaultValue={t.topBarTagline} as="span" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 w-full relative">
        <div className="flex items-center justify-between gap-3 xl:gap-6 h-16 sm:h-20">
          
          {/* Logo: Let's do it! Vietnam (Horizontal Large Layout) */}
          <div 
            id="brand-logo"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group shrink-0 py-1"
          >
            <img 
              src="/logo-icon.png" 
              alt="Let's do it! Vietnam Icon" 
              className="h-10 w-10 sm:h-13 sm:w-13 object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col justify-center whitespace-nowrap">
              <span className="font-serif font-black text-base sm:text-2xl tracking-tight text-slate-950 leading-none group-hover:text-[#E81A7F] transition-colors whitespace-nowrap">
                Let’s do it!
              </span>
              <span className="font-serif font-semibold text-[11px] sm:text-sm text-slate-700 tracking-normal leading-tight mt-0.5 whitespace-nowrap">
                Vietnam
              </span>
            </div>
          </div>

          {/* Desktop Nav Items: Centered and well-spaced across the available width */}
          <nav className="hidden xl:flex flex-1 min-w-0 items-center justify-center gap-2 xl:gap-3.5 2xl:gap-5 text-[14px] xl:text-[15px] 2xl:text-[16px] font-semibold overflow-visible no-scrollbar mx-2 2xl:mx-4">

            {/* 1. Who We Are */}
            <button
              id="nav-who-we-are"
              onClick={() => onNavigate('who-we-are')}
              className={`shrink-0 px-3 2xl:px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                currentView === 'who-we-are' 
                  ? 'text-[#E81A7F] font-bold bg-pink-50 border border-pink-200/60 shadow-xs' 
                  : 'text-slate-700 hover:text-[#E81A7F] hover:bg-slate-100/80 font-semibold'
              }`}
            >
              {t.navWhoWeAre}
            </button>

            {/* 2. What We Do */}
            <button
              id="nav-what-we-do"
              onClick={() => onNavigate('what-we-do')}
              className={`shrink-0 px-3 2xl:px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                currentView === 'what-we-do' 
                  ? 'text-[#E81A7F] font-bold bg-pink-50 border border-pink-200/60 shadow-xs' 
                  : 'text-slate-700 hover:text-[#E81A7F] hover:bg-slate-100/80 font-semibold'
              }`}
            >
              {t.navWhatWeDo}
            </button>

            {/* 3. Our Team */}
            <button
              id="nav-our-team"
              onClick={() => onNavigate('our-team')}
              className={`shrink-0 px-3 2xl:px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                currentView === 'our-team' 
                  ? 'text-[#E81A7F] font-bold bg-pink-50 border border-pink-200/60 shadow-xs' 
                  : 'text-slate-700 hover:text-[#E81A7F] hover:bg-slate-100/80 font-semibold'
              }`}
            >
              {t.navOurTeam}
            </button>

            {/* 4. Our Partners */}
            <button
              id="nav-our-partners"
              onClick={() => onNavigate('our-partners')}
              className={`shrink-0 px-3 2xl:px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                currentView === 'our-partners' 
                  ? 'text-[#E81A7F] font-bold bg-pink-50 border border-pink-200/60 shadow-xs' 
                  : 'text-slate-700 hover:text-[#E81A7F] hover:bg-slate-100/80 font-semibold'
              }`}
            >
              {t.navOurPartners}
            </button>

            {/* 5. Other Dropdown (Media On Us, News) */}
            <div className="relative shrink-0" ref={otherRef}>
              <button
                id="nav-other-dropdown-btn"
                onClick={() => setOtherDropdownOpen(!otherDropdownOpen)}
                className={`shrink-0 flex items-center gap-1.5 px-3 2xl:px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  currentView === 'media-on-us' || currentView === 'news' || currentView === 'gallery' || currentView === 'videos'
                    ? 'text-[#E81A7F] font-bold bg-pink-50 border border-pink-200/60 shadow-xs'
                    : 'text-slate-700 hover:text-[#E81A7F] hover:bg-slate-100/80 font-semibold'
                }`}
              >
                <span>{t.navOther}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${otherDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {otherDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-[100] animate-in fade-in-50 slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => {
                      onNavigate('media-on-us');
                      setOtherDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:text-[#E81A7F] hover:bg-pink-50/60 font-medium transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span>{t.navMediaOnUs}</span>
                    <EditableText contentKey="header.otherMediaLabel" defaultValue="Press →" as="span" className="text-[10px] text-pink-500 font-bold" />
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('news');
                      setOtherDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:text-[#E81A7F] hover:bg-pink-50/60 font-medium transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span>{t.navNews}</span>
                    <EditableText contentKey="header.otherNewsLabel" defaultValue="News →" as="span" className="text-[10px] text-pink-500 font-bold" />
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('videos');
                      setOtherDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:text-[#E81A7F] hover:bg-pink-50/60 font-medium transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span>{t.navVideos}</span>
                    <EditableText contentKey="header.otherVideosLabel" defaultValue="Video →" as="span" className="text-[10px] text-pink-500 font-bold" />
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    onClick={() => {
                      onNavigate('gallery');
                      setOtherDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-600 hover:text-[#E81A7F] hover:bg-pink-50/60 transition-colors cursor-pointer"
                  >
                    <EditableText contentKey="header.otherPhotoGallery" defaultValue="Photo Gallery" as="span" />
                  </button>
                </div>
              )}
            </div>

            {/* 6. Project Mega Dropdown (5 key campaigns) */}
            <div className="relative shrink-0" ref={projectsRef}>
              <button
                id="nav-projects-dropdown-btn"
                onClick={() => setProjectsDropdownOpen(!projectsDropdownOpen)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 2xl:px-4.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  currentView === 'projects' || currentView === 'project-detail'
                    ? 'text-[#E81A7F] font-bold bg-pink-50 border border-pink-200/60 shadow-xs' 
                    : 'text-slate-700 hover:text-[#E81A7F] hover:bg-slate-100/80 font-semibold'
                }`}
              >
                <span>{t.navProject}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${projectsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {projectsDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-[100] animate-in fade-in-50 slide-in-from-top-2 duration-150">
                  <div className="px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {t.navProject}
                  </div>
                  {projectItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate('project-detail', item.id);
                        setProjectsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:text-[#E81A7F] hover:bg-pink-50/60 font-semibold transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span className="truncate pr-2">• {item.title}</span>
                      <span className="text-[10px] text-pink-500 font-bold shrink-0">→</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 7. Real Cleanup Map (Pin Icon Badge) */}
            <button
              id="nav-cleanup-map"
              onClick={() => onNavigate('map')}
              title={t.navMap}
              className={`shrink-0 flex items-center gap-1.5 px-3 2xl:px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                currentView === 'map' 
                  ? 'text-[#E81A7F] font-bold bg-pink-50 border border-pink-200 shadow-xs' 
                  : 'text-slate-700 hover:text-[#E81A7F] hover:bg-pink-50/50 font-semibold'
              }`}
            >
              <MapPin className="w-4.5 h-4.5 text-[#E81A7F]" />
              <span>{t.navMap}</span>
            </button>

          </nav>

          {/* Right Action Controls: Volunteer sign-up + Contact Us */}
          <div className="hidden xl:flex items-center space-x-2.5 2xl:space-x-4 shrink-0">

            {/* Volunteer registration button */}
            <button
              id="header-volunteer-btn"
              onClick={onOpenVolunteer}
              className="flex items-center gap-1.5 bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-xs px-3 2xl:px-4 py-1.5 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.joinVolunteer}</span>
            </button>

            {/* Contact Us button */}
            <button
              id="header-contact-btn"
              onClick={() => onNavigate('contact')}
              className="bg-white border border-[#E81A7F] text-[#E81A7F] hover:bg-pink-50 font-bold text-xs px-3 2xl:px-4 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              {t.navContactUs}
            </button>
          </div>

          {/* Mobile / Tablet Menu Toggle (Shown when < xl) */}
          <div className="flex xl:hidden items-center gap-2 shrink-0 z-10">

            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile / Tablet Drawer Navigation (Shown when < xl) */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top duration-200 shadow-xl">
          <div className="flex flex-col space-y-1 text-sm font-semibold text-slate-800">
            
            <button
              onClick={() => { onNavigate('who-we-are'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2 rounded-lg hover:bg-pink-50 hover:text-[#E81A7F]"
            >
              {t.navWhoWeAre}
            </button>

            <button
              onClick={() => { onNavigate('what-we-do'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2 rounded-lg hover:bg-pink-50 hover:text-[#E81A7F]"
            >
              {t.navWhatWeDo}
            </button>

            <button
              onClick={() => { onNavigate('our-team'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2 rounded-lg hover:bg-pink-50 hover:text-[#E81A7F]"
            >
              {t.navOurTeam}
            </button>

            <button
              onClick={() => { onNavigate('our-partners'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2 rounded-lg hover:bg-pink-50 hover:text-[#E81A7F]"
            >
              {t.navOurPartners}
            </button>

            {/* Other in Mobile */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-400 px-3 uppercase">{t.navOther}</div>
              <button
                onClick={() => { onNavigate('media-on-us'); setMobileMenuOpen(false); }}
                className="w-full text-left px-5 py-1.5 text-xs text-slate-700 hover:text-[#E81A7F]"
              >
                • {t.navMediaOnUs}
              </button>
              <button
                onClick={() => { onNavigate('news'); setMobileMenuOpen(false); }}
                className="w-full text-left px-5 py-1.5 text-xs text-slate-700 hover:text-[#E81A7F]"
              >
                • {t.navNews}
              </button>
              <button
                onClick={() => { onNavigate('videos'); setMobileMenuOpen(false); }}
                className="w-full text-left px-5 py-1.5 text-xs text-slate-700 hover:text-[#E81A7F]"
              >
                • {t.navVideos}
              </button>
            </div>

            {/* Projects in Mobile */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-400 px-3 uppercase">{t.navProject}</div>
              {projectItems.map(p => (
                <button
                  key={p.id}
                  onClick={() => { onNavigate('project-detail', p.id); setMobileMenuOpen(false); }}
                  className="w-full text-left px-5 py-1.5 text-xs text-slate-700 hover:text-[#E81A7F]"
                >
                  • {p.title}
                </button>
              ))}
            </div>

            {/* Map in Mobile */}
            <button
              onClick={() => { onNavigate('map'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2 rounded-lg hover:bg-pink-50 hover:text-[#E81A7F] flex items-center gap-2 font-bold text-[#E81A7F] pt-2 border-t border-slate-100"
            >
              <MapPin className="w-4 h-4" />
              <span>{t.navMap}</span>
            </button>

            {/* Contact Us in Mobile */}
            <button
              onClick={() => { onNavigate('contact'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2 rounded-lg bg-pink-50 text-[#E81A7F] font-bold"
            >
              {t.navContactUs}
            </button>

            {/* Action Buttons in Mobile */}
            <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => { onOpenVolunteer(); setMobileMenuOpen(false); }}
                className="py-2.5 px-3 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-emerald-200"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{t.joinVolunteer}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};


