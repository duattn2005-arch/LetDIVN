import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { GetInvolvedSection } from './components/GetInvolvedSection';
import { TakeActionStrip } from './components/TakeActionStrip';
import { Footer } from './components/Footer';

// Modals
import { VolunteerModal } from './components/VolunteerModal';
import { PartnerModal } from './components/PartnerModal';

// Dedicated Sub-Pages
import { WhoWeArePage } from './components/pages/WhoWeArePage';
import { WhatWeDoPage } from './components/pages/WhatWeDoPage';
import { OurTeamPage } from './components/pages/OurTeamPage';
import { OurPartnersPage } from './components/pages/OurPartnersPage';
import { ProjectDetailPage } from './components/pages/ProjectDetailPage';
import { CampaignDetailPage } from './components/pages/CampaignDetailPage';
import { NewsPage } from './components/pages/NewsPage';
import { MediaOnUsPage } from './components/pages/MediaOnUsPage';
import { HomeQuickLinksSection } from './components/HomeQuickLinksSection';
import { FullGalleryPage } from './components/pages/FullGalleryPage';
import { MediaVideosPage } from './components/pages/MediaVideosPage';
import { ContactPage } from './components/pages/ContactPage';
import { CleanupMapPage } from './components/pages/CleanupMapPage';
import { ContactBubble } from './components/ContactBubble';
import { dbService } from './services/dbService';
import { CleanupEvent } from './types';
import { slugify } from './utils/slug';

// Every top-level nav destination gets a real, shareable URL, mirroring the
// reference site's pattern (e.g. https://letsdoitvietnam.org/who-we-are/).
const VIEW_PATHS: Record<string, string> = {
  home: '/',
  'who-we-are': '/who-we-are/',
  'what-we-do': '/what-we-do/',
  'our-team': '/our-team/',
  'our-partners': '/our-partners/',
  map: '/cleanup-map/',
  news: '/news/',
  'media-on-us': '/media-on-us/',
  gallery: '/gallery/',
  videos: '/videos/',
  contact: '/contact/',
};

const normalizePath = (pathname: string) => {
  const trimmed = pathname.replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}/` : '/';
};

// Addresses the reference site (letsdoitvietnam.org) uses for pages that have
// another name here, so its links keep working. The campaign list pages
// (/projects/, /explore-campaigns/) were removed: the Cleanup Map lists them.
const PATH_ALIASES: Record<string, string> = {
  '/ycsw/': '/wildlife-nature/',
  '/community-workshop/': '/workshop-education/',
  '/contact-us/': '/contact/',
  '/projects/': '/cleanup-map/',
  '/explore-campaigns/': '/cleanup-map/',
};
if (typeof window !== 'undefined') {
  const alias = PATH_ALIASES[normalizePath(window.location.pathname)];
  if (alias) window.history.replaceState(null, '', alias + window.location.search + window.location.hash);
}

const viewForPath = (pathname: string): string | undefined => {
  const normalized = normalizePath(pathname);
  return Object.keys(VIEW_PATHS).find((view) => VIEW_PATHS[view] === normalized);
};

// /explore-campaigns/<slug> is its own URL namespace — kept fully separate
// from per-category project slugs like /world-cleanup-day/.
const CAMPAIGN_BASE_PATH = '/explore-campaigns/';

const campaignSlugFromPath = (pathname: string): string | undefined => {
  const normalized = normalizePath(pathname);
  if (normalized === CAMPAIGN_BASE_PATH || !normalized.startsWith(CAMPAIGN_BASE_PATH)) return undefined;
  return normalized.slice(CAMPAIGN_BASE_PATH.length).replace(/\/+$/, '');
};

// /news/<slug>/ is one article: the file name of its content/news/<slug>.json.
const newsSlugFromPath = (pathname: string): string | undefined => {
  const normalized = normalizePath(pathname);
  if (normalized === VIEW_PATHS.news || !normalized.startsWith(VIEW_PATHS.news)) return undefined;
  return normalized.slice(VIEW_PATHS.news.length).replace(/\/+$/, '') || undefined;
};

export function AppContent() {
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('evt-wcd-2026');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('evt-wcd-2026');
  const [selectedNewsArticleId, setSelectedNewsArticleId] = useState<string | undefined>(undefined);
  const [events, setEvents] = useState<CleanupEvent[]>([]);

  // Modals state
  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
  const [volunteerEventId, setVolunteerEventId] = useState<string | undefined>(undefined);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  // Scroll to top whenever active view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView]);

  // Every nav destination gets a real URL. Project detail pages use a
  // category slug (e.g. /world-cleanup-day/, matching the reference site)
  // since a "project" is the static campaign story, not a specific dated
  // event instance — city/id are kept as fallbacks for older links. Events
  // are fetched here (not just in ProjectDetailPage) so a direct visit to
  // /<slug> and browser back/forward can both resolve which project it is.
  useEffect(() => {
    const refresh = () => { dbService.getEvents().then(setEvents); };
    refresh();
    const unsubscribe = dbService.subscribe(refresh);
    return () => unsubscribe();
  }, []);

  const resolveSlugToEvent = (path: string, list: CleanupEvent[]) =>
    list.find((e) => e.id === path) ||
    list.find((e) => slugify(e.category) === path) ||
    list.find((e) => slugify(e.city) === path);

  const resolveCampaignSlug = (slug: string, list: CleanupEvent[]) =>
    list.find((e) => e.id === slug) || list.find((e) => slugify(e.city) === slug);

  // Resolve the current pathname to a campaign, a static view, or a project,
  // used both on initial load and on browser back/forward.
  const applyPath = (pathname: string) => {
    const newsSlug = newsSlugFromPath(pathname);
    if (newsSlug) {
      setSelectedNewsArticleId(newsSlug);
      setActiveView('news');
      return;
    }
    if (viewForPath(pathname) === 'news') setSelectedNewsArticleId(undefined);
    const campaignSlug = campaignSlugFromPath(pathname);
    if (campaignSlug) {
      const match = resolveCampaignSlug(campaignSlug, events);
      if (match) {
        setSelectedCampaignId(match.id);
        setActiveView('campaign-detail');
        return;
      }
    }
    const staticView = viewForPath(pathname);
    if (staticView) {
      setActiveView(staticView);
      return;
    }
    const path = pathname.replace(/^\/+|\/+$/g, '');
    if (path) {
      const match = resolveSlugToEvent(path, events);
      if (match) {
        setSelectedProjectId(match.id);
        setActiveView('project-detail');
        return;
      }
    }
    setActiveView('home');
  };

  // Deep-link support: landing directly on a static page's URL (e.g.
  // /who-we-are/) opens that page immediately — doesn't need event data.
  useEffect(() => {
    if (campaignSlugFromPath(window.location.pathname)) return;
    const newsSlug = newsSlugFromPath(window.location.pathname);
    if (newsSlug) {
      setSelectedNewsArticleId(newsSlug);
      setActiveView('news');
      return;
    }
    const staticView = viewForPath(window.location.pathname);
    if (staticView && staticView !== 'home') setActiveView(staticView);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Deep-link support: landing directly on /explore-campaigns/<slug> or
  // /<project-slug> resolves once events have loaded (skipped for static pages).
  const triedInitialUrlRef = React.useRef(false);
  useEffect(() => {
    if (triedInitialUrlRef.current || events.length === 0) return;
    const campaignSlug = campaignSlugFromPath(window.location.pathname);
    if (campaignSlug) {
      const match = resolveCampaignSlug(campaignSlug, events);
      if (match) {
        setSelectedCampaignId(match.id);
        setActiveView('campaign-detail');
      }
      triedInitialUrlRef.current = true;
      return;
    }
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
    if (path && !viewForPath(window.location.pathname) && !newsSlugFromPath(window.location.pathname)) {
      const match = resolveSlugToEvent(path, events);
      if (match) {
        setSelectedProjectId(match.id);
        setActiveView('project-detail');
      }
    }
    triedInitialUrlRef.current = true;
  }, [events]);

  // Browser back/forward button support.
  useEffect(() => {
    const onPopState = () => applyPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  const goToProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveView('project-detail');
    // projectId may be an event id (from a project card) or a category name
    // (from the Header's Projects dropdown, which navigates by category so
    // it always resolves to whichever live event currently has it).
    const evt = events.find((e) => e.id === projectId) || events.find((e) => e.category === projectId);
    window.history.pushState(null, '', `/${evt ? slugify(evt.category) : slugify(projectId)}/`);
  };

  const goToCampaign = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setActiveView('campaign-detail');
    const evt = events.find((e) => e.id === campaignId);
    window.history.pushState(null, '', `${CAMPAIGN_BASE_PATH}${evt ? slugify(evt.city) : slugify(campaignId)}/`);
  };

  const handleNavigate = (view: string, extraId?: string) => {
    if (view === 'project-detail' && extraId) {
      goToProject(extraId);
    } else if (view.startsWith('project:')) {
      goToProject(view.replace('project:', ''));
    } else if (view === 'campaign-detail' && extraId) {
      goToCampaign(extraId);
    } else if (view === 'news') {
      setSelectedNewsArticleId(extraId);
      setActiveView('news');
      window.history.pushState(null, '', VIEW_PATHS.news);
    } else {
      setActiveView(view);
      window.history.pushState(null, '', VIEW_PATHS[view] || '/');
    }
  };

  const handleOpenVolunteerModal = (eventId?: string) => {
    setVolunteerEventId(eventId);
    setIsVolunteerModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-800 antialiased font-sans relative selection:bg-[#E81A7F] selection:text-white">
      {/* Global Header */}
      <Header
        activeView={activeView}
        onNavigate={handleNavigate}
        onOpenVolunteer={() => handleOpenVolunteerModal()}
      />

      {/* Main View Router */}
      <main className="flex-grow">
        {/* Fallback to Home if unknown view or activeView === 'home' */}
        {(!activeView || activeView === 'home' || !['who-we-are', 'what-we-do', 'our-team', 'our-partners', 'campaign-detail', 'map', 'project-detail', 'news', 'media-on-us', 'gallery', 'videos', 'contact'].includes(activeView)) && (
          <>
            <HeroSection
              onJoinEvent={() => handleOpenVolunteerModal()}
              onExploreMap={() => handleNavigate('map')}
            />
            <HomeQuickLinksSection onNavigate={handleNavigate} />
            <AboutSection
              onLearnMore={() => handleNavigate('who-we-are')}
            />
            <MediaVideosPage />
            <GetInvolvedSection
              onRegisterVolunteer={() => handleOpenVolunteerModal()}
              onJoinVolunteer={() => handleOpenVolunteerModal()}
              onBecomePartner={() => setIsPartnerModalOpen(true)}
            />
            {/* The reference homepage ends with the four coloured tiles too. */}
            <TakeActionStrip contentKeyPrefix="home" photos={false} />
          </>
        )}

        {activeView === 'who-we-are' && (
          <WhoWeArePage onJoin={() => handleOpenVolunteerModal()} />
        )}

        {activeView === 'what-we-do' && (
          <WhatWeDoPage />
        )}

        {activeView === 'our-team' && (
          <OurTeamPage />
        )}

        {activeView === 'our-partners' && (
          <OurPartnersPage onBecomePartner={() => setIsPartnerModalOpen(true)} />
        )}

        {activeView === 'campaign-detail' && (
          <CampaignDetailPage
            campaignId={selectedCampaignId}
            onBack={() => handleNavigate('map')}
            onRegisterVolunteer={(eventId) => handleOpenVolunteerModal(eventId)}
          />
        )}

        {activeView === 'map' && (
          <CleanupMapPage
            onSelectProject={goToProject}
            onSelectCampaign={goToCampaign}
            onRegisterVolunteer={(eventId) => handleOpenVolunteerModal(eventId)}
          />
        )}

        {activeView === 'project-detail' && (
          <ProjectDetailPage projectId={selectedProjectId} />
        )}

        {activeView === 'news' && (
          <NewsPage
            initialCategory="All"
            initialArticleId={selectedNewsArticleId}
            onArticleChange={(slug) => {
              setSelectedNewsArticleId(slug);
              window.history.pushState(null, '', slug ? `${VIEW_PATHS.news}${slug}/` : VIEW_PATHS.news);
            }}
          />
        )}

        {activeView === 'media-on-us' && (
          <MediaOnUsPage />
        )}

        {activeView === 'gallery' && (
          <FullGalleryPage />
        )}

        {activeView === 'videos' && (
          <MediaVideosPage />
        )}

        {activeView === 'contact' && (
          <ContactPage />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenVolunteer={() => handleOpenVolunteerModal()}
        onOpenPartner={() => setIsPartnerModalOpen(true)}
      />

      {/* Floating Quick Contact Bubble Widget at Bottom Right */}
      <ContactBubble onOpenContactPage={() => handleNavigate('contact')} />



      {/* All System Modals */}
      <VolunteerModal
        isOpen={isVolunteerModalOpen}
        onClose={() => setIsVolunteerModalOpen(false)}
        selectedEventId={volunteerEventId}
      />

      <PartnerModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}


