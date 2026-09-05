import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CultivatingSection } from './components/CultivatingSection';
import { NewsSection } from './components/NewsSection';
import { GallerySection } from './components/GallerySection';
import { GetInvolvedSection } from './components/GetInvolvedSection';
import { Footer } from './components/Footer';

// Modals
import { AuthModal } from './components/AuthModal';
import { DatabaseAdminModal } from './components/DatabaseAdminModal';
import { VolunteerModal } from './components/VolunteerModal';
import { PartnerModal } from './components/PartnerModal';
import { UserProfileModal } from './components/UserProfileModal';

// Dedicated Sub-Pages
import { WhoWeArePage } from './components/pages/WhoWeArePage';
import { WhatWeDoPage } from './components/pages/WhatWeDoPage';
import { OurTeamPage } from './components/pages/OurTeamPage';
import { OurPartnersPage } from './components/pages/OurPartnersPage';
import { ProjectsPage } from './components/pages/ProjectsPage';
import { ProjectDetailPage } from './components/pages/ProjectDetailPage';
import { NewsPage } from './components/pages/NewsPage';
import { MediaOnUsPage } from './components/pages/MediaOnUsPage';
import { FullGalleryPage } from './components/pages/FullGalleryPage';
import { MediaVideosPage } from './components/pages/MediaVideosPage';
import { ContactPage } from './components/pages/ContactPage';
import { CleanupMapPage } from './components/pages/CleanupMapPage';
import { WorldCleanupDayPage } from './components/pages/WorldCleanupDayPage';
import { EnvironmentalDayPage } from './components/pages/EnvironmentalDayPage';
import { GreenOceanCampaignPage } from './components/pages/GreenOceanCampaignPage';
import { YoungConservationistsPage } from './components/pages/YoungConservationistsPage';
import { CommunityWorkshopPage } from './components/pages/CommunityWorkshopPage';
import { ContactBubble } from './components/ContactBubble';
import { AmbientBackground } from './components/AmbientBackground';

// Keeps the address bar in sync with the current view — so pages are
// bookmarkable/shareable/refreshable and the back/forward buttons work,
// matching a normal (non-SPA) site instead of staying on a single URL.
const VIEW_TO_PATH: Record<string, string> = {
  home: '/',
  'who-we-are': '/who-we-are/',
  'what-we-do': '/what-we-do/',
  'our-team': '/our-team/',
  'our-partners': '/our-partners/',
  projects: '/projects/',
  map: '/cleanup-map/',
  news: '/news/',
  'media-on-us': '/media-on-us/',
  gallery: '/gallery/',
  videos: '/videos/',
  contact: '/contact/',
  'world-cleanup-day': '/world-cleanup-day/',
  'environmental-day': '/environmental-day/',
  'green-ocean-campaign': '/green-ocean-campaign/',
  'young-conservationists': '/young-conservationists/',
  'community-workshop': '/community-workshop/',
};

// Campaign events with their own dedicated info page — /projects/<id>/ for
// these redirects to the info page's own URL instead of the generic
// event-detail (schedule) template.
const PROJECT_ID_TO_INFO_VIEW: Record<string, string> = {
  'evt-wcd-2026': 'world-cleanup-day',
  'evt-env-day-hcm': 'environmental-day',
  'evt-green-ocean-danang': 'green-ocean-campaign',
};

function pathForView(view: string, projectId?: string): string {
  if (view === 'project-detail' && projectId) return `/projects/${encodeURIComponent(projectId)}/`;
  return VIEW_TO_PATH[view] || '/';
}

function parseLocation(): { view: string; projectId?: string } {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/') return { view: 'home' };
  const projectMatch = path.match(/^\/projects\/([^/]+)$/);
  if (projectMatch) {
    const projectId = decodeURIComponent(projectMatch[1]);
    const infoView = PROJECT_ID_TO_INFO_VIEW[projectId];
    if (infoView) {
      // Old/shared link to a campaign that now has its own page — swap the
      // URL itself over rather than just rendering different content at
      // the legacy path, so it stops appearing bookmarkable/shareable.
      window.history.replaceState({}, '', pathForView(infoView));
      return { view: infoView };
    }
    return { view: 'project-detail', projectId };
  }
  const entry = Object.entries(VIEW_TO_PATH).find(([, p]) => p.replace(/\/+$/, '') === path);
  return { view: entry ? entry[0] : 'home' };
}

export function AppContent() {
  const [activeView, setActiveView] = useState<string>(() => parseLocation().view);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => parseLocation().projectId || 'evt-wcd-2026');

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  const [isDbAdminModalOpen, setIsDbAdminModalOpen] = useState(false);
  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
  const [volunteerEventId, setVolunteerEventId] = useState<string | undefined>(undefined);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Scroll to top whenever active view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView]);

  // Browser back/forward buttons: re-sync state from the URL instead of
  // navigating (pushState already put it there).
  useEffect(() => {
    const onPopState = () => {
      const { view, projectId } = parseLocation();
      if (projectId) setSelectedProjectId(projectId);
      setActiveView(view);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleNavigate = (view: string, extraId?: string) => {
    let nextView = view;
    let nextProjectId: string | undefined;

    if (view === 'project-detail' && extraId && PROJECT_ID_TO_INFO_VIEW[extraId]) {
      nextView = PROJECT_ID_TO_INFO_VIEW[extraId];
    } else if (view === 'project-detail' && extraId) {
      nextProjectId = extraId;
    } else if (view.startsWith('project:')) {
      nextProjectId = view.replace('project:', '');
      nextView = 'project-detail';
    }

    if (nextProjectId) setSelectedProjectId(nextProjectId);
    setActiveView(nextView);

    const path = pathForView(nextView, nextProjectId);
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  };

  const handleOpenAuth = (tab: 'login' | 'register' = 'login') => {
    setAuthInitialTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleOpenVolunteerModal = (eventId?: string) => {
    setVolunteerEventId(eventId);
    setIsVolunteerModalOpen(true);
  };

  const handleSelectProject = (projectId: string) => {
    handleNavigate('project-detail', projectId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-800 antialiased font-sans relative selection:bg-[#E81A7F] selection:text-white">
      {/* 3D Ambient Particle & Ecological Environment Elements */}
      <AmbientBackground />

      {/* Global Header */}
      <Header
        activeView={activeView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
        onOpenDbAdmin={() => setIsDbAdminModalOpen(true)}
        onOpenVolunteer={() => handleOpenVolunteerModal()}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-grow">
        {/* Fallback to Home if unknown view or activeView === 'home' */}
        {(!activeView || activeView === 'home' || !['who-we-are', 'what-we-do', 'our-team', 'our-partners', 'projects', 'map', 'project-detail', 'news', 'media-on-us', 'gallery', 'videos', 'contact', 'world-cleanup-day', 'environmental-day', 'green-ocean-campaign', 'young-conservationists', 'community-workshop'].includes(activeView)) && (
          <>
            <HeroSection
              onJoinEvent={() => handleOpenVolunteerModal()}
              onExploreProjects={() => handleNavigate('projects')}
              onExploreMap={() => handleNavigate('map')}
            />
            <CultivatingSection onNavigate={handleNavigate} />
            <NewsSection onViewAll={() => handleNavigate('news')} />
            <MediaVideosPage />
            <GallerySection 
              onViewAllGallery={() => handleNavigate('gallery')}
            />
            <GetInvolvedSection
              onRegisterVolunteer={() => handleOpenVolunteerModal()}
              onJoinVolunteer={() => handleOpenVolunteerModal()}
              onBecomePartner={() => setIsPartnerModalOpen(true)}
            />
          </>
        )}

        {activeView === 'who-we-are' && (
          <WhoWeArePage onJoin={() => handleOpenVolunteerModal()} />
        )}

        {activeView === 'what-we-do' && (
          <WhatWeDoPage onExploreProjects={() => handleNavigate('projects')} />
        )}

        {activeView === 'our-team' && (
          <OurTeamPage />
        )}

        {activeView === 'our-partners' && (
          <OurPartnersPage onBecomePartner={() => setIsPartnerModalOpen(true)} />
        )}

        {activeView === 'projects' && (
          <ProjectsPage
            onSelectProject={handleSelectProject}
            onRegisterVolunteer={(eventId) => handleOpenVolunteerModal(eventId)}
            onOpenWorldCleanupDay={() => handleNavigate('world-cleanup-day')}
            onOpenEnvironmentalDay={() => handleNavigate('environmental-day')}
            onOpenGreenOceanCampaign={() => handleNavigate('green-ocean-campaign')}
          />
        )}

        {activeView === 'map' && (
          <CleanupMapPage
            onSelectProject={handleSelectProject}
            onRegisterVolunteer={(eventId) => handleOpenVolunteerModal(eventId)}
          />
        )}

        {activeView === 'project-detail' && (
          <ProjectDetailPage
            projectId={selectedProjectId}
            onBack={() => handleNavigate('projects')}
            onRegisterVolunteer={(eventId) => handleOpenVolunteerModal(eventId)}
            onOpenWorldCleanupDay={() => handleNavigate('world-cleanup-day')}
            onOpenEnvironmentalDay={() => handleNavigate('environmental-day')}
            onOpenGreenOceanCampaign={() => handleNavigate('green-ocean-campaign')}
          />
        )}

        {activeView === 'news' && (
          <NewsPage initialCategory="All" />
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

        {activeView === 'world-cleanup-day' && (
          <WorldCleanupDayPage onBack={() => handleNavigate('projects')} />
        )}

        {activeView === 'environmental-day' && (
          <EnvironmentalDayPage onBack={() => handleNavigate('projects')} />
        )}

        {activeView === 'green-ocean-campaign' && (
          <GreenOceanCampaignPage onBack={() => handleNavigate('projects')} />
        )}

        {activeView === 'young-conservationists' && (
          <YoungConservationistsPage onBack={() => handleNavigate('projects')} />
        )}

        {activeView === 'community-workshop' && (
          <CommunityWorkshopPage onBack={() => handleNavigate('projects')} />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenVolunteer={() => handleOpenVolunteerModal()}
        onOpenPartner={() => setIsPartnerModalOpen(true)}
        onOpenDbAdmin={() => setIsDbAdminModalOpen(true)}
      />

      {/* Floating Quick Contact Bubble Widget at Bottom Right */}
      <ContactBubble onOpenContactPage={() => handleNavigate('contact')} />



      {/* All System Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authInitialTab}
      />

      <DatabaseAdminModal
        isOpen={isDbAdminModalOpen}
        onClose={() => setIsDbAdminModalOpen(false)}
      />

      <VolunteerModal
        isOpen={isVolunteerModalOpen}
        onClose={() => setIsVolunteerModalOpen(false)}
        selectedEventId={volunteerEventId}
      />

      <PartnerModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}


