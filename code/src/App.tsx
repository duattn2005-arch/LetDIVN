import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
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
import { HomeQuickLinksSection } from './components/HomeQuickLinksSection';
import { FullGalleryPage } from './components/pages/FullGalleryPage';
import { MediaVideosPage } from './components/pages/MediaVideosPage';
import { ContactPage } from './components/pages/ContactPage';
import { CleanupMapPage } from './components/pages/CleanupMapPage';
import { ContactBubble } from './components/ContactBubble';
import { dbService } from './services/dbService';
import { CleanupEvent } from './types';
import { slugify } from './utils/slug';

export function AppContent() {
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('evt-wcd-2026');
  const [selectedNewsArticleId, setSelectedNewsArticleId] = useState<string | undefined>(undefined);
  const [events, setEvents] = useState<CleanupEvent[]>([]);

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

  // Only project detail pages get a real, shareable URL (e.g. /da-nang, from
  // the event's city) — every other view stays purely state-driven and
  // resets the address bar back to '/'. Events are fetched here (not just in
  // ProjectDetailPage) so a direct visit to /<slug> and browser back/forward
  // can both resolve which project that slug refers to.
  useEffect(() => {
    const refresh = () => { dbService.getEvents().then(setEvents); };
    refresh();
    const unsubscribe = dbService.subscribe(refresh);
    return () => unsubscribe();
  }, []);

  const resolveSlugToEvent = (path: string, list: CleanupEvent[]) =>
    list.find((e) => e.id === path) || list.find((e) => slugify(e.city) === path);

  // Deep-link support: landing directly on /<slug> opens that project.
  const triedInitialUrlRef = React.useRef(false);
  useEffect(() => {
    if (triedInitialUrlRef.current || events.length === 0) return;
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
    if (path) {
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
    const onPopState = () => {
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
      if (!path) {
        setActiveView('home');
        return;
      }
      const match = resolveSlugToEvent(path, events);
      if (match) {
        setSelectedProjectId(match.id);
        setActiveView('project-detail');
      }
    };
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
    window.history.pushState(null, '', `/${evt ? slugify(evt.city) : slugify(projectId)}`);
  };

  const handleNavigate = (view: string, extraId?: string) => {
    if (view === 'project-detail' && extraId) {
      goToProject(extraId);
    } else if (view.startsWith('project:')) {
      goToProject(view.replace('project:', ''));
    } else if (view === 'news') {
      setSelectedNewsArticleId(extraId);
      setActiveView('news');
      window.history.pushState(null, '', '/');
    } else {
      setActiveView(view);
      window.history.pushState(null, '', '/');
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
    goToProject(projectId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-800 antialiased font-sans relative selection:bg-[#E81A7F] selection:text-white">
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
        {(!activeView || activeView === 'home' || !['who-we-are', 'what-we-do', 'our-team', 'our-partners', 'projects', 'map', 'project-detail', 'news', 'media-on-us', 'gallery', 'videos', 'contact'].includes(activeView)) && (
          <>
            <HeroSection
              onJoinEvent={() => handleOpenVolunteerModal()}
              onExploreProjects={() => handleNavigate('projects')}
              onExploreMap={() => handleNavigate('map')}
            />
            <HomeQuickLinksSection onNavigate={handleNavigate} />
            <AboutSection
              onLearnMore={() => handleNavigate('who-we-are')}
            />
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
          />
        )}

        {activeView === 'news' && (
          <NewsPage initialCategory="All" initialArticleId={selectedNewsArticleId} />
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


