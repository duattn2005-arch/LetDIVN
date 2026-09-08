import React, { createContext, useContext, ReactNode } from 'react';

export type Language = 'en';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' }
];

export const englishTranslations = {
  selectLanguage: "Select Language",
  topBarAnnouncement: "World Cleanup Day 2026 is now accepting nationwide volunteer registrations!",
  topBarTagline: "Let's do it! Vietnam - Join hands for a green, clean, zero-waste Vietnam!",
  navWhoWeAre: "Who We Are",
  navWhatWeDo: "What We Do",
  navOurTeam: "Our Team",
  navOurPartners: "Our Partners",
  navProject: "Projects",
  navOther: "Other",
  navMediaOnUs: "Media On Us",
  navNews: "News",
  navVideos: "Videos",
  videosPageBadge: "TAKE ACTION",
  videosPageTitle: "Capturing Change, One Frame at a Time",
  videosPageSubtitle: "Watch TV reports, documentaries, and inspiring stories from Let's do it! Vietnam cleanup campaigns.",
  videosPageCountSuffix: "Videos",
  videosPageAddBtn: "Add New Video",
  videosPageEmptyTitle: "No videos yet",
  videosPageEmptyDesc: "Paste a YouTube link to share a media video",
  navContactUs: "Contact Us",
  navMap: "Cleanup Map",
  projectWcd: "World Cleanup Day",
  projectEnvDay: "Environmental Day",
  projectGreenOcean: "Green Ocean Campaign",
  projectYoungWildlife: "Young Conservationists Save The Wildlife",
  projectWorkshop: "Community Workshop",
  viewAllProjects: "View all campaigns »",
  adminDb: "Database Admin",
  register: "Register",
  login: "Login",
  joinVolunteer: "Volunteer",
  profile: "My Profile",
  logout: "Logout",
  signUpSignIn: "Sign In",
  roleAdmin: "Administrator",
  roleVolunteer: "Volunteer",
  close: "Close",
  privacyPolicy: "Privacy Policy",
  termsOfService: "Terms of Service",
  contactBubbleTitle: "Quick Support",
  contactBubbleSubtitle: "We are here to help",
  contactBubbleOpenBtn: "Open Contact Page",
  heroSlide1Badge: "WORLD CLEANUP DAY 2026 • 10-YEAR JOURNEY FOR THE ENVIRONMENT",
  heroSlide1Title: "WORLD CLEANUP DAY",
  heroSlide1Desc: "Over 5,000 youth, families, and organizations united for a green, clean, and zero-waste Vietnam.",
  registerNowBtn: "Register to Join Now",
  exploreCampaignsBtn: "Explore Campaigns",
  heroSlideTab1: "Main Banner",
  heroSlideTab2: "Global Message",
  heroSlide2Badge: "Global Campaign",
  heroSlide2Title1: "World Cleanup Day:",
  heroSlide2Title2: "Global Impact, Local Action",
  heroSlide2Desc: "Mobilizing thousands of passionate volunteers across Vietnam in environmental protection, trash sorting, and community pride.",
  featureProvinces: "63 Provinces Participating",
  featureCert: "Volunteer Certificate Issued",
  featureGear: "Free Safety Gear Provided",
  joinNextEvent: "Join the Next Event",
  exploreMap: "Explore Cleanup Map",
  aboutBadge: "About the Initiative",
  aboutTitle: "Let's do it! Vietnam Movement",
  aboutP1: "World Cleanup Day is the world's largest civic environmental movement, mobilizing millions of volunteers across 190+ countries.",
  aboutP2: "Since 2015, we not only collect waste but transform community awareness, map pollution hotspots, and build zero-waste habits.",
  statTons: "Tons Trash Collected",
  statTonsSub: "Safely collected and sorted",
  statVolunteers: "Volunteers Engaged",
  statVolunteersSub: "Across 63 provinces in Vietnam",
  statEvents: "Cleanup Events Organized",
  statEventsSub: "Mobilized nationwide",
  whoWeAreBadge: "10-Year Community Journey",
  whoWeAreTitlePrefix: "We Are",
  whoWeAreIntro: "Founded in 2015, Let's do it! Vietnam is a non-profit organization affiliated with the global network Let's Do It World (headquartered in Estonia), with the mission to raise community awareness and call for action towards a green, clean, and zero-waste Vietnam.",
  whoWeAreMissionTitle: "Our Mission",
  whoWeAreMissionDesc: "Connecting and empowering millions of Vietnamese citizens, especially the youth, through nationwide cleanup campaigns, digital hotspot mapping technologies, and sustainable consumption advocacy.",
  whoWeAreVisionTitle: "Vision 2030",
  whoWeAreVisionDesc: "To become the largest civic environmental movement in Vietnam, bringing 100% of urban and coastal waste hotspots into a circular management network while serving as a strategic partner of UNEP.",
  whoWeAreValuesTitle: "Our Core Values",
  whoWeAreVal1Title: "Positive Action",
  whoWeAreVal1Desc: "We don't just raise awareness; we roll up our sleeves and clean up together, turning environmental concern into measurable impact.",
  whoWeAreVal2Title: "Unity & Inclusivity",
  whoWeAreVal2Desc: "Every individual, regardless of age, background, or profession, can contribute meaningfully to nature.",
  whoWeAreVal3Title: "Transparency & Data-Driven",
  whoWeAreVal3Desc: "Digital database tracking precisely every kilogram of waste collected, every grant received, and verified volunteer certificates.",
  whoWeAreCtaTitle: "Ready to Make a Difference?",
  whoWeAreCtaDesc: "Join thousands of passionate volunteers and register for World Cleanup Day 2026 today.",
  whatWeDoBadge: "4 Core Action Pillars",
  whatWeDoTitle: "What We Do",
  whatWeDoIntro: "From picking up litter on local beaches to digitalizing ocean waste data, Let's do it! Vietnam builds comprehensive and sustainable environmental solutions.",
  ourTeamBadge: "Passionate Leadership & Coordinators",
  ourTeamTitle: "Meet Our Team",
  ourTeamIntro: "The dedicated leaders, project managers, and provincial coordinators driving the nationwide zero-waste movement across Vietnam.",
  ourTeamDeptAll: "All Members",
  ourTeamDeptLeadership: "Leadership & Strategy",
  ourTeamDeptOperations: "Field Operations & Logistics",
  ourTeamDeptComm: "Communications & Media",
  ourTeamDeptCoord: "Provincial Coordinators",
  ourPartnersBadge: "Global Network & Strong Alliances",
  ourPartnersTitle: "Our Partners & Sponsors",
  ourPartnersIntro: "We work hand-in-hand with governmental agencies, diplomatic missions, corporations, and non-profits to amplify positive environmental action.",
  ourPartnersTabAll: "All Partners",
  ourPartnersTabStrategic: "Strategic Partners",
  ourPartnersTabCorporate: "Corporate Sponsors",
  ourPartnersTabNgo: "NGO & Community",
  ourPartnersTabGov: "Government & International",
  ourPartnersTabEdu: "Universities & Youth",
  projectsBadge: "Actions For The Planet",
  projectsTitle: "Our Projects & Campaigns",
  projectsIntro: "Discover our annual nationwide cleanup drives, youth environmental workshops, and biodiversity conservation projects.",
  newsBadge: "Updates & Media Releases",
  newsTitle: "Latest News & Stories",
  newsIntro: "Read inspiring stories, campaign recaps, and environmental insights from Let's do it! Vietnam.",
  galleryBadge: "Moments In Action",
  galleryTitle: "Photo Gallery",
  galleryIntro: "Memorable highlights from our community cleanup campaigns across the country.",
  galleryFilterAll: "All Photos",
  galleryFilterCleanup: "Cleanups",
  galleryFilterWorkshop: "Workshops",
  galleryFilterCommunity: "Community",
  galleryFilterNature: "Nature",
  galleryViewAllBtn: "View Full Gallery",
  getInvolvedBadge: "Take Part In The Movement",
  getInvolvedTitle: "How You Can Get Involved",
  getInvolvedIntro: "Whether as an individual volunteer, a corporate partner, or a local coordinator, your contribution helps build a greener Vietnam.",
  getInvolvedCard1Title: "Become a Volunteer",
  getInvolvedCard1Desc: "Join cleanup campaigns in your city and receive official volunteer certification.",
  getInvolvedCard1Btn: "Sign Up as Volunteer",
  getInvolvedCard2Title: "Corporate Partnership",
  getInvolvedCard2Desc: "Partner with us for CSR/ESG environmental initiatives and sustainable employee engagement.",
  getInvolvedCard2Btn: "Become a Partner",
  getInvolvedCard3Title: "Report a Hotspot",
  getInvolvedCard3Desc: "Locate and mark illegal trash sites on our nationwide digital map to help prioritize cleanups.",
  getInvolvedCard3Btn: "Open Cleanup Map",
  footerTagline: "Let's do it! Vietnam - Together for a green, clean, zero-waste Vietnam.",
  footerQuickLinks: "Quick Links",
  footerPrograms: "Core Programs",
  footerContactInfo: "Contact Info",
  footerRights: "All rights reserved. Let's do it! Vietnam is an official national member of Let's Do It World.",
  mapTitle: "Nationwide Cleanup Spot Map",
  mapSubtitle: "Search any place, school, hospital, or landmark to locate directly on the map.",
  mapAddSpotBtn: "Report Cleanup Spot",
  mapSearchPlaceholder: "Search city, province, district, school...",
  mapAllLocations: "All Locations",
  mapCleanedSpots: "Cleaned Spots",
  mapPendingSpots: "Reported / Needs Cleanup",
  mapFilterStatus: "Status",
  mapFilterLevel: "Trash Severity",
  contactPageBadge: "GET IN TOUCH",
  contactPageTitle: "Contact Let's do it! Vietnam",
  contactPageSubtitle: "Have questions about our campaigns, volunteer programs, or partnerships? Reach out to us!",
  contactPageFindUsTitle: "You can find us at",
  contactPageEmailLabel: "EMAIL ADDRESS",
  contactPagePhoneLabel1: "PHONE NUMBER",
  contactPagePhoneLabel2: "PHONE NUMBER",
  contactPhone1Default: "035.872.6755 (Mr. Son)",
  contactPhone2Default: "0968.514.882 (Ms. Tu)",
  contactSubjectOpt1: "Volunteer Registration & Campaign Participation",
  contactSubjectOpt2: "Corporate Partnership & ESG Sponsorship",
  contactSubjectOpt3: "Report Illegal Trash Hotspot",
  contactSubjectOpt4: "General Inquiries & Media",
  contactPageFormTitle: "Send a Message to Our Team",
  contactPageThankYouTitle: "Thank You for Reaching Out!",
  contactPageThankYouMsgPrefix: "Your message has been received. Our team will reply via email ",
  contactPageThankYouMsgSuffix: " as soon as possible.",
  contactPageSendAnotherBtn: "Send Another Message",
  contactPageNameLabel: "Full Name *",
  contactPageEmailFieldLabel: "Email Address *",
  contactPagePhoneFieldLabel: "Phone Number (10 digits)",
  contactPageSubjectLabel: "Subject",
  contactPageMessageLabel: "Message *",
  contactPageSubmitBtn: "Send Message"
};

export const translations = {
  en: englishTranslations,
  vi: englishTranslations,
  fr: englishTranslations,
  ja: englishTranslations,
  ko: englishTranslations,
  zh: englishTranslations,
  de: englishTranslations,
  es: englishTranslations
};

interface LanguageContextType {
  language: Language;
  t: typeof englishTranslations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const language: Language = 'en';
  const t = englishTranslations;

  return (
    <LanguageContext.Provider value={{ language, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
