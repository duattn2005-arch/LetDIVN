import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Menu, X, MapPin } from 'lucide-react';
import { ActiveView } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { EditableText } from './EditableText';
import { dbService } from '../services/dbService';
import { NewsArticle } from '../types';
import '../wp/latest.css';

/** Items of the WordPress menu "Menu trên header" (the theme prints them; none on the Node site). */
const wpMenu: { title: string; url: string }[] =
  (typeof window !== 'undefined' && (window as Window & { ldivnHeaderMenu?: { title: string; url: string }[] }).ldivnHeaderMenu) || [];

const isCurrentPage = (url: string) => {
  const target = new URL(url, window.location.href);
  return !target.hash && target.origin === window.location.origin && target.pathname === window.location.pathname;
};

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
  // In the WordPress build Cleanup Map and Volunteer are links: to the page with the
  // cleanup map plugin's map, and "#volunteer", which opens that plugin's sign-up form.
  const isWordPress = import.meta.env.VITE_WORDPRESS === '1';
  const MapItem: any = isWordPress ? 'a' : 'button';
  const mapItemProps = (after?: () => void) =>
    isWordPress ? { href: '/cleanup-map/', onClick: after } : { onClick: () => { onNavigate('map'); after?.(); } };
  const volunteerItemProps = (after?: () => void) =>
    isWordPress ? { href: '#volunteer', onClick: after } : { onClick: () => { onOpenVolunteer(); after?.(); } };
  // Menu items for those two would show them twice.
  const extraMenu = wpMenu.filter((item) => !/\/cleanup-map\/?$|#volunteer$/.test(item.url));

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // The bar over the header shows the 5 newest posts, as on letsdoitvietnam.org.
  const [latest, setLatest] = useState<NewsArticle[]>([]);
  useEffect(() => {
    const refresh = () => dbService.getNews().then((all) => setLatest(
      all.filter((n) => n.status !== 'Pending').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
    ));
    refresh();
    return dbService.subscribe(refresh);
  }, []);
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
      
      {/* The newest posts running by, as letsdoitvietnam.org's bar (the plugin's latest.css) */}
      {latest.length > 0 && (
        <div className="ldlp" role="region" aria-label="Latest posts">
          <div className="ldlp-in">
            <div className="ldlp-view">
              <div className="ldlp-track">
                {[false, true].map((copy) => (
                  <div className="ldlp-run" key={String(copy)} aria-hidden={copy || undefined}>
                    {latest.map((n) => (
                      <a
                        key={n.id}
                        className="ldlp-item"
                        href={`/news/${n.slug || n.id}/`}
                        tabIndex={copy ? -1 : undefined}
                        onClick={(e) => { e.preventDefault(); onNavigate('news', n.slug || n.id); }}
                      >
                        <span className="ldlp-dot" />
                        {n.title}
                      </a>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
              src="/logo-horizontal.png"
              alt="Let’s do it! Vietnam"
              className="h-11 sm:h-[52px] w-auto object-contain transition-transform group-hover:scale-105"
            />
          </div>

          {/* Desktop Nav Items: Centered and well-spaced across the available width */}
          <nav className="hidden xl:flex flex-1 min-w-0 items-center justify-center gap-1 2xl:gap-3.5 text-[15px] 2xl:text-[17px] font-medium overflow-visible no-scrollbar mx-2 2xl:mx-4">

            {/* 1. Who We Are */}
            <button
              id="nav-who-we-are"
              onClick={() => onNavigate('who-we-are')}
              className={`shrink-0 px-2 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                currentView === 'who-we-are' 
                  ? 'text-[#F1138D] font-semibold bg-pink-50 border border-pink-200/60 shadow-xs' 
                  : 'text-[#1C244B] hover:text-[#F1138D] hover:bg-slate-100/80'
              }`}
            >
              {t.navWhoWeAre}
            </button>

            {/* 2. What We Do */}
            <button
              id="nav-what-we-do"
              onClick={() => onNavigate('what-we-do')}
              className={`shrink-0 px-2 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                currentView === 'what-we-do' 
                  ? 'text-[#F1138D] font-semibold bg-pink-50 border border-pink-200/60 shadow-xs' 
                  : 'text-[#1C244B] hover:text-[#F1138D] hover:bg-slate-100/80'
              }`}
            >
              {t.navWhatWeDo}
            </button>

            {/* 3. Our Team */}
            <button
              id="nav-our-team"
              onClick={() => onNavigate('our-team')}
              className={`shrink-0 px-2 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                currentView === 'our-team' 
                  ? 'text-[#F1138D] font-semibold bg-pink-50 border border-pink-200/60 shadow-xs' 
                  : 'text-[#1C244B] hover:text-[#F1138D] hover:bg-slate-100/80'
              }`}
            >
              {t.navOurTeam}
            </button>

            {/* 4. Our Partners */}
            <button
              id="nav-our-partners"
              onClick={() => onNavigate('our-partners')}
              className={`shrink-0 px-2 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                currentView === 'our-partners' 
                  ? 'text-[#F1138D] font-semibold bg-pink-50 border border-pink-200/60 shadow-xs' 
                  : 'text-[#1C244B] hover:text-[#F1138D] hover:bg-slate-100/80'
              }`}
            >
              {t.navOurPartners}
            </button>

            {/* 5. Other Dropdown (Media On Us, News) */}
            <div className="relative shrink-0" ref={otherRef}>
              <button
                id="nav-other-dropdown-btn"
                onClick={() => setOtherDropdownOpen(!otherDropdownOpen)}
                className={`shrink-0 flex items-center gap-1.5 px-2 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  currentView === 'media-on-us' || currentView === 'news'
                    ? 'text-[#F1138D] font-semibold bg-pink-50 border border-pink-200/60 shadow-xs'
                    : 'text-[#1C244B] hover:text-[#F1138D] hover:bg-slate-100/80'
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
                </div>
              )}
            </div>

            {/* 6. Project Mega Dropdown (5 key campaigns) */}
            <div className="relative shrink-0" ref={projectsRef}>
              <button
                id="nav-projects-dropdown-btn"
                onClick={() => setProjectsDropdownOpen(!projectsDropdownOpen)}
                className={`shrink-0 flex items-center gap-1.5 px-2 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  currentView === 'project-detail'
                    ? 'text-[#F1138D] font-semibold bg-pink-50 border border-pink-200/60 shadow-xs' 
                    : 'text-[#1C244B] hover:text-[#F1138D] hover:bg-slate-100/80'
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

            {/* WordPress menu items (e.g. Cleanup Map, Volunteer) */}
            {extraMenu.map((item) => (
              <a
                key={item.url + item.title}
                href={item.url}
                className={`shrink-0 px-2 py-2 rounded-xl transition-all whitespace-nowrap ${
                  isCurrentPage(item.url)
                    ? 'text-[#F1138D] font-semibold bg-pink-50 border border-pink-200/60 shadow-xs'
                    : 'text-[#1C244B] hover:text-[#F1138D] hover:bg-slate-100/80'
                }`}
              >
                {item.title}
              </a>
            ))}

            {/* 7. Real Cleanup Map (Pin Icon Badge) */}
            <MapItem
              id="nav-cleanup-map"
              {...mapItemProps()}
              title={t.navMap}
              className={`shrink-0 flex items-center gap-1.5 px-2 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                currentView === 'map'
                  ? 'text-[#F1138D] font-semibold bg-pink-50 border border-pink-200 shadow-xs'
                  : 'text-[#1C244B] hover:text-[#F1138D] hover:bg-pink-50/50'
              }`}
            >
              <MapPin className="w-4.5 h-4.5 text-[#E81A7F]" />
              <span>{t.navMap}</span>
            </MapItem>

          </nav>

          {/* Right Action Controls: Volunteer sign-up + Contact Us */}
          {/* Sized like the "Contact us" button on letsdoitvietnam.org: Poppins 16px,
              ~44px tall, 30px side padding, pill-shaped, solid #F1138D. */}
          <div className="hidden xl:flex items-center gap-2.5 2xl:gap-3 shrink-0">

            {/* Volunteer registration button */}
            <MapItem
              id="header-volunteer-btn"
              {...volunteerItemProps()}
              className="inline-flex items-center justify-center h-[42px] 2xl:h-[44px] bg-white border-2 border-[#F1138D] text-[#F1138D] hover:bg-pink-50 text-[15px] 2xl:text-[16px] font-semibold leading-none px-5 2xl:px-[28px] rounded-full transition-all transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              {t.joinVolunteer}
            </MapItem>

            {/* Contact Us button */}
            <button
              id="header-contact-btn"
              onClick={() => onNavigate('contact')}
              className="inline-flex items-center justify-center h-[42px] 2xl:h-[44px] bg-[#F1138D] hover:bg-[#D01370] border-2 border-[#F1138D] hover:border-[#D01370] text-white text-[15px] 2xl:text-[16px] font-semibold leading-none px-5 2xl:px-[28px] rounded-full shadow-md shadow-pink-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              {t.navContactUs}
            </button>
          </div>

          {/* Mobile / Tablet Menu Toggle (Shown when < xl) */}
          <div className="flex xl:hidden items-center gap-3 shrink-0 z-10">
            {/* As letsdoitvietnam.org: Contact Us beside the menu button */}
            <button
              onClick={() => onNavigate('contact')}
              className="hidden sm:inline-flex items-center justify-center h-[42px] px-[30px] rounded-full bg-[#F1138D] hover:bg-[#D01370] text-white font-['Poppins'] text-[16px] leading-none whitespace-nowrap cursor-pointer transition-colors"
            >
              {t.navContactUs}
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

            {/* WordPress menu items in Mobile */}
            {extraMenu.map((item) => (
              <a
                key={item.url + item.title}
                href={item.url}
                onClick={() => setMobileMenuOpen(false)}
                className="text-left px-3 py-2 rounded-lg hover:bg-pink-50 hover:text-[#E81A7F]"
              >
                {item.title}
              </a>
            ))}

            {/* Map in Mobile */}
            <MapItem
              {...mapItemProps(() => setMobileMenuOpen(false))}
              className="text-left px-3 py-2 rounded-lg hover:bg-pink-50 hover:text-[#E81A7F] flex items-center gap-2 font-bold text-[#E81A7F] pt-2 border-t border-slate-100"
            >
              <MapPin className="w-4 h-4" />
              <span>{t.navMap}</span>
            </MapItem>

            {/* Contact Us in Mobile */}
            <button
              onClick={() => { onNavigate('contact'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2 rounded-lg bg-pink-50 text-[#E81A7F] font-bold"
            >
              {t.navContactUs}
            </button>

            {/* Action Buttons in Mobile */}
            <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-100">
              <MapItem
                {...volunteerItemProps(() => setMobileMenuOpen(false))}
                className="py-2.5 px-3 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-emerald-200"
              >
                <span>{t.joinVolunteer}</span>
              </MapItem>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};


