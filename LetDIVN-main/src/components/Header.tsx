import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Menu, 
  X, 
  User, 
  UserPlus,
  LogIn,
  Database, 
  LogOut, 
  ShieldCheck, 
  Globe, 
  Sparkles,
  HeartHandshake,
  MapPin,
  Check
} from 'lucide-react';
import { ActiveView } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FlagIcon } from './FlagIcon';
import { EditableText } from './EditableText';

interface HeaderProps {
  currentView?: ActiveView | string;
  activeView?: ActiveView | string;
  onNavigate: (view: any, extraId?: string) => void;
  onOpenAuth: (tab?: 'login' | 'register') => void;
  onOpenDbAdmin: () => void;
  onOpenVolunteer: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView: propCurrentView,
  activeView: propActiveView,
  onNavigate,
  onOpenAuth,
  onOpenDbAdmin,
  onOpenVolunteer,
  onOpenProfile,
}) => {
  const currentView = propCurrentView || propActiveView || 'home';
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { language, setLanguage, t, currentLangInfo, supportedLanguages } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectsDropdownOpen, setProjectsDropdownOpen] = useState(false);
  const [otherDropdownOpen, setOtherDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const projectsRef = useRef<HTMLDivElement>(null);
  const otherRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (projectsRef.current && !projectsRef.current.contains(e.target as Node)) {
        setProjectsDropdownOpen(false);
      }
      if (otherRef.current && !otherRef.current.contains(e.target as Node)) {
        setOtherDropdownOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const projectItems = [
    { title: t.projectWcd, id: 'evt-wcd-2026' },
    { title: t.projectEnvDay, id: 'evt-env-day-hcm' },
    { title: t.projectGreenOcean, id: 'evt-green-ocean-danang' },
    { title: t.projectYoungWildlife, id: 'evt-wildlife-catba' },
    { title: t.projectWorkshop, id: 'evt-workshop-zerowaste' }
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

          <div className="flex items-center gap-2 sm:gap-3 text-slate-300 shrink-0 z-10 bg-slate-900 pl-2 shadow-[-10px_0_15px_rgba(15,23,42,0.9)]">
            {/* Database Admin Button */}
            {isAdmin && (
              <button
                id="top-bar-db-btn"
                onClick={onOpenDbAdmin}
                className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer bg-purple-900/60 hover:bg-purple-800 text-purple-200 px-2.5 py-0.5 rounded text-[11px] border border-purple-700/50"
              >
                <Database className="w-3 h-3 text-[#E81A7F]" />
                <span className="font-bold">{t.adminDb}</span>
              </button>
            )}
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
                    <EditableText contentKey="header.otherMediaLabel" defaultValue="Báo chí →" as="span" className="text-[10px] text-pink-500 font-bold" />
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('news');
                      setOtherDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:text-[#E81A7F] hover:bg-pink-50/60 font-medium transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span>{t.navNews}</span>
                    <EditableText contentKey="header.otherNewsLabel" defaultValue="Tin tức →" as="span" className="text-[10px] text-pink-500 font-bold" />
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
                  <div className="border-t border-slate-100 mt-1.5 pt-1.5 px-2">
                    <button
                      onClick={() => {
                        onNavigate('projects');
                        setProjectsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-[#E81A7F] hover:bg-pink-50 rounded-xl transition-colors cursor-pointer"
                    >
                      {t.viewAllProjects}
                    </button>
                  </div>
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

          {/* Right Action Controls: Language Switcher + Auth + Contact Us */}
          <div className="hidden xl:flex items-center space-x-2.5 2xl:space-x-4 shrink-0">
            
            {/* Multi-Language Selector Dropdown (Flag Only + Dropdown Arrow) */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 2xl:px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-full text-xs font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
                title={t.selectLanguage}
              >
                <FlagIcon lang={language} className="w-5 h-3.5 rounded-xs shadow-2xs" />
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-[100] animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                    <span>{t.selectLanguage}</span>
                    <Globe className="w-3.5 h-3.5 text-[#E81A7F]" />
                  </div>
                  <div className="py-1.5 space-y-1 max-h-72 overflow-y-auto scrollbar-thin">
                    {supportedLanguages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLanguage(l.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          language === l.code 
                            ? 'bg-pink-50 text-[#E81A7F] font-bold ring-1 ring-pink-200' 
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <FlagIcon lang={l.code} className="w-5 h-3.5 rounded-xs shadow-2xs" />
                          <span>{l.nativeName}</span>
                        </div>
                        {language === l.code && <Check className="w-4 h-4 text-[#E81A7F]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Combined Single Auth Button (Đăng Ký / Đăng Nhập) */}
            {!isAuthenticated ? (
              <button
                id="header-auth-btn"
                onClick={() => onOpenAuth('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-800 hover:text-[#E81A7F] bg-slate-100/90 hover:bg-pink-50 rounded-full border border-slate-200 hover:border-pink-200 transition-all cursor-pointer whitespace-nowrap shadow-2xs group"
                title={t.signUpSignIn}
              >
                <User className="w-3.5 h-3.5 text-[#E81A7F]" />
                <span>{t.signUpSignIn}</span>
              </button>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full cursor-pointer transition-all"
                >
                  <img 
                    src={user?.avatar} 
                    alt={user?.name} 
                    className="w-6 h-6 rounded-full object-cover border border-pink-400"
                  />
                  <span className="text-xs font-bold text-slate-800 max-w-[70px] 2xl:max-w-[90px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && user && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 z-[100] animate-in fade-in-50 zoom-in-95 duration-150">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                      <div className="overflow-hidden">
                        <div className="font-bold text-sm text-slate-900 truncate">{user.name}</div>
                        <div className="text-xs text-slate-500 truncate">{user.email || user.phone}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`inline-block text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {user.role === 'admin' ? t.roleAdmin : t.roleVolunteer}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 space-y-1">
                      <button
                        onClick={() => {
                          onOpenProfile();
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-[#E81A7F]" />
                        <span>{t.profile}</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            onOpenDbAdmin();
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Database className="w-3.5 h-3.5 text-[#E81A7F]" />
                          <span>{t.adminDb}</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t.logout}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Contact Us button */}
            <button
              id="header-contact-btn"
              onClick={() => onNavigate('contact')}
              className="bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-xs px-3 2xl:px-4 py-1.5 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              {t.navContactUs}
            </button>
          </div>

          {/* Mobile / Tablet Menu & Language Toggle (Shown when < xl) */}
          <div className="flex xl:hidden items-center gap-2 shrink-0 z-10">
            
            {/* Mobile Lang Button (Flag Only) */}
            <button
              onClick={() => {
                const currentIndex = supportedLanguages.findIndex((l) => l.code === language);
                const nextLang = supportedLanguages[(currentIndex + 1) % supportedLanguages.length].code;
                setLanguage(nextLang);
              }}
              className="px-2.5 py-1.5 bg-slate-100 rounded-xl text-sm font-bold flex items-center gap-1 border border-slate-200"
              title={t.selectLanguage}
            >
              <FlagIcon lang={language} className="w-5 h-3.5 rounded-xs shadow-2xs" />
            </button>

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

            {/* Unified Auth in Mobile */}
            <div className="pt-2 border-t border-slate-100">
              {!isAuthenticated ? (
                <button
                  onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 text-xs font-bold text-center bg-slate-900 hover:bg-[#E81A7F] text-white rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#E81A7F]" />
                  <span>{t.signUpSignIn}</span>
                </button>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => { onOpenProfile(); setMobileMenuOpen(false); }}
                    className="w-full py-2.5 text-xs font-bold text-center bg-slate-100 text-slate-800 rounded-xl flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4 text-[#E81A7F]" />
                    <span>{t.profile} ({user?.name})</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => { onOpenDbAdmin(); setMobileMenuOpen(false); }}
                      className="w-full py-2.5 text-xs font-bold text-center bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center gap-2 border border-purple-200"
                    >
                      <Database className="w-4 h-4 text-[#E81A7F]" />
                      <span>{t.adminDb}</span>
                    </button>
                  )}
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full py-2 text-xs font-bold text-center bg-red-50 text-red-600 rounded-xl"
                  >
                    {t.logout}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
};


