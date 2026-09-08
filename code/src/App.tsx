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
import { FullGalleryPage } from './components/pages/FullGalleryPage';
import { MediaVideosPage } from './components/pages/MediaVideosPage';
import { ContactPage } from './components/pages/ContactPage';
import { CleanupMapPage } from './components/pages/CleanupMapPage';
import { ContactBubble } from './components/ContactBubble';
import { AmbientBackground } from './components/AmbientBackground';

export function AppContent() {
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('evt-wcd-2026');

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

  const handleNavigate = (view: string, extraId?: string) => {
    if (view === 'project-detail' && extraId) {
      setSelectedProjectId(extraId);
      setActiveView('project-detail');
    } else if (view.startsWith('project:')) {
      const pId = view.replace('project:', '');
      setSelectedProjectId(pId);
      setActiveView('project-detail');
    } else {
      setActiveView(view);
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
    setSelectedProjectId(projectId);
    setActiveView('project-detail');
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
        {(!activeView || activeView === 'home' || !['who-we-are', 'what-we-do', 'our-team', 'our-partners', 'projects', 'map', 'project-detail', 'news', 'media-on-us', 'gallery', 'videos', 'contact'].includes(activeView)) && (
          <>
            <HeroSection
              onJoinEvent={() => handleOpenVolunteerModal()}
              onExploreProjects={() => handleNavigate('projects')}
              onExploreMap={() => handleNavigate('map')}
            />
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
          <NewsPage initialCategory="All" />
        )}

        {activeView === 'media-on-us' && (
          <NewsPage initialCategory="Media On Us" />
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


