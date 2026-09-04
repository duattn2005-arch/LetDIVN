import {
  CleanupEvent,
  NewsArticle,
  Partner,
  GalleryItem,
  TeamMember,
  VolunteerRegistration,
  ContactMessage,
  UserProfile,
  MediaVideo,
  WhatWeDoItem,
  WhoWeAreItem
} from '../types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-admin-01',
    name: 'Nguyen Van Hoang (Admin)',
    email: 'admin@letsdoitvietnam.org',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    provider: 'email',
    joinedAt: '2022-03-15',
    eventsAttended: 28,
    trashCollectedKg: 1450,
    city: 'Hanoi'
  },
  {
    id: 'usr-coord-01',
    name: 'Tran Thi Mai Linh',
    email: 'mailinh.tran@letsdoitvietnam.org',
    role: 'coordinator',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    provider: 'google',
    joinedAt: '2023-01-10',
    eventsAttended: 16,
    trashCollectedKg: 820,
    city: 'Ho Chi Minh City'
  },
  {
    id: 'usr-vol-01',
    name: 'Le Quoc Bao',
    phone: '0988123456',
    role: 'volunteer',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    provider: 'phone',
    joinedAt: '2024-05-20',
    eventsAttended: 6,
    trashCollectedKg: 180,
    city: 'Da Nang'
  }
];

export const INITIAL_EVENTS: CleanupEvent[] = [
  {
    id: 'evt-wcd-2026',
    title: 'World Cleanup Day 2026',
    category: 'World Cleanup Day',
    date: '2026-09-20',
    time: '06:30 - 11:30',
    location: 'Hanoi Opera House Square & Hoan Kiem Lake, Hanoi',
    city: 'Hanoi',
    coordinates: { lat: 21.0285, lng: 105.8542 },
    image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1000&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
    description: 'Let\'s do it! Vietnam\'s biggest event of the year, bringing together over 5,000 volunteers to collect, sort, and recycle waste across all 63 provinces and cities nationwide.',
    targetVolunteers: 5000,
    registeredCount: 0,
    trashCollectedKg: 8500,
    status: 'Upcoming',
    leader: 'Nguyen Van Hoang',
    meetingPoint: 'Main gate of Hanoi Opera House, 1 Trang Tien Street'
  },
  {
    id: 'evt-green-ocean-danang',
    title: 'Green Ocean Campaign - Da Nang',
    category: 'Green Ocean Campaign',
    date: '2026-07-15',
    time: '05:30 - 09:30',
    location: 'My Khe Beach & Son Tra Peninsula',
    city: 'Da Nang',
    coordinates: { lat: 16.0544, lng: 108.2435 },
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&auto=format&fit=crop&q=80',
    description: 'Collecting ocean plastic waste, protecting coral reef ecosystems, and raising awareness among fishermen and coastal tourists about reducing single-use plastics.',
    targetVolunteers: 1200,
    registeredCount: 0,
    trashCollectedKg: 3200,
    status: 'Upcoming',
    leader: 'Tran Minh Tri',
    meetingPoint: 'Bien Dong Park, Vo Nguyen Giap Street, Son Tra'
  },
  {
    id: 'evt-env-day-hcm',
    title: 'World Environment Day 2026 - Ho Chi Minh City',
    category: 'Environmental Day',
    date: '2026-06-05',
    time: '07:00 - 11:00',
    location: 'Tao Dan Park & Along Nhieu Loc - Thi Nghe Canal',
    city: 'Ho Chi Minh City',
    coordinates: { lat: 10.7769, lng: 106.6924 },
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1000&auto=format&fit=crop&q=80',
    description: 'A campaign to clean up public spaces, restore the canal banks, and launch a Zero Waste Life movement.',
    targetVolunteers: 2500,
    registeredCount: 0,
    trashCollectedKg: 5400,
    status: 'Upcoming',
    leader: 'Tran Thi Mai Linh',
    meetingPoint: 'Central area of Tao Dan Park, Truong Dinh Street, District 1'
  },
  {
    id: 'evt-wildlife-catba',
    title: 'Wildlife Conservation & Cleanup at Cat Ba National Park',
    category: 'Wildlife & Nature',
    date: '2026-08-10',
    time: '06:00 - 12:00',
    location: 'Cat Ba National Park & Lan Ha Bay, Hai Phong',
    city: 'Hai Phong',
    coordinates: { lat: 20.8033, lng: 106.9996 },
    image: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=1000&auto=format&fit=crop&q=80',
    description: 'A trekking-trail cleanup through the primeval forest of Cat Ba, protecting the habitat of the rare Cat Ba langur.',
    targetVolunteers: 500,
    registeredCount: 0,
    trashCollectedKg: 1200,
    status: 'Upcoming',
    leader: 'Pham Thu Hang',
    meetingPoint: 'Cat Ba National Park Gate, Cat Hai District, Hai Phong'
  },
  {
    id: 'evt-workshop-zerowaste',
    title: 'Plastic Recycling & Zero Waste Lifestyle Workshop',
    category: 'Workshop & Education',
    date: '2026-05-25',
    time: '14:00 - 17:30',
    location: 'Da Lat Student Cultural Center',
    city: 'Lam Dong',
    coordinates: { lat: 11.9404, lng: 108.4583 },
    image: 'https://images.unsplash.com/photo-1528190336454-13cd56b45b5a?w=1000&auto=format&fit=crop&q=80',
    description: 'An in-depth training course on the circular economy, hands-on source-sorting practice, and making organic soap from used cooking oil.',
    targetVolunteers: 300,
    registeredCount: 0,
    trashCollectedKg: 450,
    status: 'Upcoming',
    leader: 'Do Huu Duc',
    meetingPoint: '2nd Floor Hall, Da Lat Student Cultural Center'
  },
  {
    id: 'evt-nhatrang-coral',
    title: 'Green Ocean Journey - Coral Reef Cleanup, Nha Trang Bay',
    category: 'Green Ocean Campaign',
    date: '2026-07-28',
    time: '06:00 - 11:00',
    location: 'Along Tran Phu Beach & Hon Tre Island, Nha Trang',
    city: 'Khanh Hoa',
    coordinates: { lat: 12.2388, lng: 109.1967 },
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1000&auto=format&fit=crop&q=80',
    description: 'A scuba cleanup campaign to collect ocean-floor debris and clean tourist beaches, protecting the marine ecosystem of Nha Trang Bay.',
    targetVolunteers: 800,
    registeredCount: 0,
    trashCollectedKg: 2100,
    status: 'Upcoming',
    leader: 'Le Hoang Long',
    meetingPoint: '2/4 Square, Tran Phu Street, Loc Tho, Nha Trang'
  },
  {
    id: 'evt-cantho-floating',
    title: 'Green Mekong River - Cai Rang Floating Market, Can Tho',
    category: 'World Cleanup Day',
    date: '2026-09-20',
    time: '05:30 - 10:30',
    location: 'Ninh Kieu Wharf & Cai Rang Floating Market, Can Tho',
    city: 'Can Tho',
    coordinates: { lat: 10.0452, lng: 105.7469 },
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1000&auto=format&fit=crop&q=80',
    description: 'Collecting floating trash on the Can Tho River and raising awareness among floating-market households about not dumping waste into the Mekong.',
    targetVolunteers: 600,
    registeredCount: 0,
    trashCollectedKg: 3800,
    status: 'Upcoming',
    leader: 'Huynh Thanh Tung',
    meetingPoint: 'Uncle Ho Statue, Ninh Kieu Wharf, Can Tho'
  }
];

export const INITIAL_VOLUNTEERS: VolunteerRegistration[] = [];

export const INITIAL_NEWS: NewsArticle[] = [
  {
    id: 'news-001',
    title: 'Let\'s do it! Vietnam officially launches the World Cleanup Day 2026 campaign nationwide',
    slug: 'lets-do-it-vietnam-launches-world-cleanup-day-2026',
    category: 'Press Release',
    summary: 'World Cleanup Day 2026 aims to attract over 100,000 participants across 63 provinces and cities, working toward a green Vietnam free of plastic waste.',
    content: `Hanoi, April 15, 2026 — The non-profit organization Let's do it! Vietnam today officially announced its rollout plan for World Cleanup Day 2026.

Founded in 2015, Let's do it! Vietnam has become a leading force in Vietnam's community environmental movement. This year, under the message "Global Impact, Local Action," the program focuses not only on cleaning up pollution hotspots but also on training in source-sorting and building a circular recycling network.

The organizing committee calls on government agencies, businesses, universities, and individuals to join hands in creating the largest environmental event of the year.`,
    author: 'Let\'s do it! Vietnam Communications Team',
    date: '2026-04-15',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    source: 'Vietnam News Agency',
    sourceUrl: 'https://vietnamplus.vn',
    views: 4520,
    featured: true
  },
  {
    id: 'news-002',
    title: 'National broadcaster VTV1 covers Let\'s do it! Vietnam\'s 10-year environmental journey',
    slug: 'vtv1-covers-lets-do-it-vietnam-10-year-journey',
    category: 'Media On Us',
    summary: 'A special feature on the "For a Green Future" program honors the tireless contributions of tens of thousands of young volunteers.',
    content: `The "For a Green Future" program, aired on VTV1, devoted 15 minutes to a vivid portrayal of Let's do it! Vietnam's 10-year journey (2015-2026).

From a small group of passionate young people in Hanoi and Ho Chi Minh City, the organization has grown to a coordinator network spanning more than 40 provinces, safely collecting and processing over 5,000 tons of waste of all kinds. The feature highlighted the marked shift in community awareness at waste hotspots after each cleanup drive.`,
    author: 'VTV News',
    date: '2026-03-28',
    image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop&q=80',
    source: 'VTV1 - Science & Education Department',
    sourceUrl: 'https://vtv.vn',
    views: 8900,
    featured: true
  },
  {
    id: 'news-003',
    title: 'Over 3 tons of plastic waste cleared from Cat Ba coastline during the Green Summer campaign',
    slug: 'over-3-tons-plastic-waste-cleared-cat-ba-coastline',
    category: 'News',
    summary: 'A joint event between Let\'s do it! Vietnam and the Cat Ba National Park Management Board drew 350 volunteers to clean up 4km of coastline.',
    content: `Over the past weekend, 350 young volunteers from the Let's do it! Vietnam network joined local residents and forest rangers in a cleanup campaign along Lan Ha Bay and Cat Ba Island.

The total waste collected was estimated at over 3.2 tons, mostly broken styrofoam floats, old fishing nets, plastic bottles, and drifting plastic bags. All recyclable waste was handed over to a specialized processing unit.`,
    author: 'Pham Thu Hang',
    date: '2026-04-02',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    source: 'Environment & Urban Newspaper',
    sourceUrl: 'https://moitruongvadothi.vn',
    views: 3120,
    featured: false
  },
  {
    id: 'news-004',
    title: 'Dan Tri Newspaper: Vietnamese youth and the dream of an ocean free of plastic waste',
    slug: 'dan-tri-vietnamese-youth-dream-ocean-free-plastic',
    category: 'Media On Us',
    summary: 'An interview with Let\'s do it! Vietnam\'s coordination team leaders about their strategy for using digital mapping technology to locate and address informal dump sites.',
    content: `Dan Tri Newspaper's April 22 issue highlighted the innovative initiatives of Let's do it! Vietnam's young tech team. Applying a digital map of pollution hotspots together with a real-time volunteer data management system has boosted coordination efficiency threefold compared to traditional methods.`,
    author: 'Dan Tri Newspaper',
    date: '2026-04-22',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80',
    source: 'Dan Tri Online Newspaper',
    sourceUrl: 'https://dantri.com.vn',
    views: 5410,
    featured: false
  }
];

export const INITIAL_PARTNERS: Partner[] = [
  {
    id: 'ptn-01',
    name: 'Unilever Vietnam',
    tier: 'Diamond',
    logo: '/partners/unilever.png',
    website: 'https://www.unilever.com.vn',
    type: 'Corporate',
    description: 'Unilever partners with Let\'s do it! Vietnam on campaigns to reduce plastic waste.',
    joinedYear: 2018
  },
  {
    id: 'ptn-02',
    name: 'Honda Vietnam',
    tier: 'Diamond',
    logo: '/partners/honda.png',
    website: 'https://www.honda.com.vn',
    type: 'Corporate',
    description: 'The Power of Dreams - Honda Vietnam sponsors vehicles and cleanup safety gear.',
    joinedYear: 2019
  },
  {
    id: 'ptn-03',
    name: 'Hilton Hotels & Resorts',
    tier: 'Gold',
    logo: '/partners/hilton.png',
    website: 'https://www.hilton.com',
    type: 'Hospitality',
    description: 'The Hilton hotel chain is committed to sustainable development and reducing household waste.',
    joinedYear: 2020
  },
  {
    id: 'ptn-04',
    name: 'Hirdaramani / FGL',
    tier: 'Gold',
    logo: '/partners/hirdaramani.png',
    website: 'https://www.hirdaramani.com',
    type: 'Manufacturing',
    description: 'A sustainable textile partner pioneering environmental protection and green supply chains.',
    joinedYear: 2021
  },
  {
    id: 'ptn-05',
    name: 'Green Future Fund',
    tier: 'Gold',
    logo: '/partners/tuong-lai-xanh.png',
    website: 'https://vinfutureprize.org',
    type: 'Foundation',
    description: 'Supporting green environmental action initiatives across Vietnam.',
    joinedYear: 2022
  },
  {
    id: 'ptn-06',
    name: 'VinUniversity Sustainability',
    tier: 'Gold',
    logo: '/partners/vinuniversity.png',
    website: 'https://vinuni.edu.vn',
    type: 'University',
    description: 'VinUniversity\'s research institute and sustainable development center.',
    joinedYear: 2021
  },
  {
    id: 'ptn-07',
    name: 'Vingroup',
    tier: 'Diamond',
    logo: '/partners/vingroup.png',
    website: 'https://vingroup.net',
    type: 'Corporate',
    description: 'Vingroup sponsors campaigns for a green, clean, and beautiful Vietnam.',
    joinedYear: 2019
  },
  {
    id: 'ptn-08',
    name: 'The Body Shop',
    tier: 'Silver',
    logo: '/partners/the-body-shop.png',
    website: 'https://www.thebodyshop.com.vn',
    type: 'Retail',
    description: 'A vegan cosmetics brand pioneering plastic packaging recycling in Vietnam.',
    joinedYear: 2020
  },
  {
    id: 'ptn-09',
    name: 'Easia Travel',
    tier: 'Silver',
    logo: '/partners/easia-travel.png',
    website: 'https://www.easia-travel.com',
    type: 'Travel',
    description: 'Sustainable green tourism and cleanup of eco-tourism destinations.',
    joinedYear: 2021
  },
  {
    id: 'ptn-10',
    name: 'USAID Vietnam',
    tier: 'Diamond',
    logo: '/partners/usaid.png',
    website: 'https://www.usaid.gov/vietnam',
    type: 'International Organization',
    description: 'The U.S. Agency for International Development supports programs to reduce ocean plastic waste.',
    joinedYear: 2018
  },
  {
    id: 'ptn-11',
    name: 'YSEALI',
    tier: 'Gold',
    logo: '/partners/yseali.png',
    website: 'https://asean.usmission.gov/yseali/',
    type: 'International Organization',
    description: 'The Young Southeast Asian Leaders Initiative - Supporting youth-led environmental projects.',
    joinedYear: 2019
  },
  {
    id: 'ptn-12',
    name: 'United States Embassy Hanoi',
    tier: 'Diamond',
    logo: '/partners/us-embassy.png',
    website: 'https://vn.usembassy.gov/',
    type: 'Diplomatic Mission',
    description: 'The U.S. Embassy in Hanoi - Sponsoring ecological and community education programs.',
    joinedYear: 2017
  },
  {
    id: 'ptn-13',
    name: 'Fuwa3e Enzyme Cleaner',
    tier: 'Gold',
    logo: '/partners/fuwa3e.png',
    website: 'https://fuwa.com.vn',
    type: 'Eco Brand',
    description: 'A bio-enzyme made from fermented pineapple - a safe, organic cleaning solution for water sources.',
    joinedYear: 2021
  },
  {
    id: 'ptn-14',
    name: 'Pizza 4P\'s',
    tier: 'Gold',
    logo: '/partners/pizza-4ps.png',
    website: 'https://pizza4ps.com',
    type: 'Restaurant Chain',
    description: 'A restaurant chain pioneering the Zero Waste Restaurant movement.',
    joinedYear: 2020
  },
  {
    id: 'ptn-15',
    name: 'GO! / Big C',
    tier: 'Diamond',
    logo: '/partners/go-bigc.png',
    website: 'https://go-vietnam.vn',
    type: 'Retail',
    description: 'A hypermarket chain supporting recyclable waste sorting and the use of biodegradable bags.',
    joinedYear: 2019
  },
  {
    id: 'ptn-16',
    name: 'The Empyrean Cam Ranh',
    tier: 'Gold',
    logo: '/partners/the-empyrean.png',
    website: 'https://theempyreanhotel.com',
    type: 'Hospitality',
    description: 'A green resort running regular beach cleanup campaigns in Cam Ranh.',
    joinedYear: 2022
  },
  {
    id: 'ptn-17',
    name: 'Mainetti Vietnam',
    tier: 'Silver',
    logo: '/partners/mainetti.png',
    website: 'https://www.mainetti.com',
    type: 'Packaging',
    description: 'Recycling solutions for hangers and circular plastic packaging in the fashion industry.',
    joinedYear: 2021
  },
  {
    id: 'ptn-18',
    name: '7 Bridges Brewing Co',
    tier: 'Silver',
    logo: '/partners/7-bridges.png',
    website: 'https://7bridgesbrewing.com',
    type: 'F&B',
    description: 'A craft beer brand pioneering commitments to sustainable development and environmental protection.',
    joinedYear: 2022
  },
  {
    id: 'ptn-19',
    name: 'Intrepid Travel',
    tier: 'Gold',
    logo: '/partners/intrepid.png',
    website: 'https://www.intrepidtravel.com',
    type: 'Travel',
    description: 'A leading global sustainable adventure travel company offering zero-waste tours.',
    joinedYear: 2018
  },
  {
    id: 'ptn-20',
    name: 'Luxury Travel',
    tier: 'Silver',
    logo: '/partners/luxury-travel.png',
    website: 'https://luxurytravelvietnam.com',
    type: 'Travel',
    description: 'A premium travel service supporting ecological conservation activities in Vietnam.',
    joinedYear: 2020
  },
  {
    id: 'ptn-21',
    name: 'Canon Vietnam',
    tier: 'Diamond',
    logo: '/partners/canon.png',
    website: 'https://vn.canon',
    type: 'Technology',
    description: 'Canon, guided by its Kyosei philosophy (living and working together for the common good), sponsors environmental protection.',
    joinedYear: 2016
  },
  {
    id: 'ptn-22',
    name: 'Green Generation (Live & Learn)',
    tier: 'Gold',
    logo: '/partners/the-he-xanh.png',
    website: 'https://livelearn.vn',
    type: 'NGO Network',
    description: 'A youth network acting for clean air and a sustainable green environment.',
    joinedYear: 2017
  },
  {
    id: 'ptn-23',
    name: 'TH School',
    tier: 'Gold',
    logo: '/partners/th-school.png',
    website: 'https://thschool.edu.vn',
    type: 'Education',
    description: 'An eco-school system launching waste-sorting and nature-protection initiatives for students.',
    joinedYear: 2021
  },
  {
    id: 'ptn-24',
    name: 'CBTW',
    tier: 'Silver',
    logo: '/partners/cbtw.png',
    website: 'https://cbtw.tech',
    type: 'Technology',
    description: 'A global technology corporation supporting digitalization and green digital transformation solutions.',
    joinedYear: 2023
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-01',
    title: 'World Cleanup Day 2024 Kickoff Rally at Hanoi Opera House',
    eventName: 'World Cleanup Day 2024',
    year: 2024,
    city: 'Hanoi',
    imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop&q=80',
    caption: 'Over 2,000 volunteers in the traditional yellow-and-green colors chanting the Let\'s do it! Vietnam slogan.',
    category: 'World Cleanup Day'
  },
  {
    id: 'gal-02',
    title: 'Sorting and recycling plastic waste after the My Khe Beach cleanup campaign',
    eventName: 'Green Ocean Campaign',
    year: 2024,
    city: 'Da Nang',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    caption: 'Hundreds of bags of recyclable waste were weighed and handed over to a circular processing plant.',
    category: 'Ocean Cleanups'
  },
  {
    id: 'gal-03',
    title: 'Small actions, big impact: young junior volunteers in Ho Chi Minh City',
    eventName: 'Environmental Day 2024',
    year: 2024,
    city: 'Ho Chi Minh City',
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80',
    caption: 'The next generation joins their families to pick up plastic waste at Tao Dan Park.',
    category: 'Youth & Community'
  },
  {
    id: 'gal-04',
    title: 'Youth volunteer team cleans up Nhieu Loc - Thi Nghe Canal',
    eventName: 'Clean Up Sai Gon River',
    year: 2023,
    city: 'Ho Chi Minh City',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    caption: 'Volunteers braved the hard work of pulling trash from the canal banks, restoring the river\'s scenic beauty.',
    category: 'River Cleanups'
  },
  {
    id: 'gal-05',
    title: 'Environmental Coordinator Training Workshop in Hanoi',
    eventName: 'Leader Training Workshop',
    year: 2024,
    city: 'Hanoi',
    imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&auto=format&fit=crop&q=80',
    caption: 'Training in team leadership skills, workplace safety, and scientific waste sorting for more than 80 team leaders.',
    category: 'Workshops & Training'
  },
  {
    id: 'gal-06',
    title: 'Coral reef and marine life protection campaign, Cat Ba',
    eventName: 'Save The Wildlife Cat Ba',
    year: 2023,
    city: 'Hai Phong',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
    caption: 'Volunteer divers worked together to collect abandoned fishing gear from the seabed of Lan Ha Bay.',
    category: 'Wildlife & Nature'
  }
];

export const INITIAL_TEAM: TeamMember[] = [
  {
    id: 'tm-01',
    name: 'Nguyen Van Hoang',
    role: 'Chairman & National Executive Director',
    department: 'Leadership (National Board)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    bio: 'A social activist with 10 years of experience leading nationwide environmental campaigns, representing Let\'s do it! Vietnam at the Global WCD conference.',
    linkedin: 'https://linkedin.com'
  },
  {
    id: 'tm-02',
    name: 'Tran Thi Mai Linh',
    role: 'Southern Region Project Director',
    department: 'Project Coordination',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    bio: 'A sustainable development project management expert, connecting over 30 universities and youth organizations across Ho Chi Minh City and the Mekong Delta provinces.',
    facebook: 'https://facebook.com'
  },
  {
    id: 'tm-03',
    name: 'Pham Minh Tri',
    role: 'Head of External Affairs & Corporate Sponsorship',
    department: 'Partnerships & Sponsorship',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    bio: '8 years of experience in CSR and ESG for multinational corporations, responsible for expanding Let\'s do it! Vietnam\'s sponsor network.',
    linkedin: 'https://linkedin.com'
  },
  {
    id: 'tm-04',
    name: 'Dang Ngoc Anh',
    role: 'Director of Communications & Social Marketing',
    department: 'Communications',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    bio: 'Creates viral campaigns reaching over 5 million young people on social media, promoting waste-sorting habits and a green lifestyle.',
    facebook: 'https://facebook.com'
  },
  {
    id: 'tm-05',
    name: 'Le Quoc Bao',
    role: 'Head of Technology & Database Administration',
    department: 'Tech Team',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
    bio: 'A software engineer building the digital waste-hotspot mapping system and automated volunteer management platform for the organization.',
    linkedin: 'https://linkedin.com'
  }
];

export const INITIAL_CONTACTS: ContactMessage[] = [
  {
    id: 'msg-01',
    name: 'Tran Van Long',
    email: 'long.tran@university.edu.vn',
    phone: '0988776655',
    subject: 'Proposal to co-organize a Cleanup Day at the National University dormitory',
    message: 'Hello Let\'s do it! Vietnam organizing committee, we would like to co-organize a cleanup and plastic waste collection day for about 1,000 students at the Block B dormitory.',
    status: 'In Review',
    createdAt: '2026-05-04T15:30:00Z'
  },
  {
    id: 'msg-02',
    name: 'Nguyen Thi Hong',
    email: 'hong.nguyen@greensolutions.vn',
    phone: '0912998877',
    subject: 'Proposal to sponsor gloves and biodegradable trash bags for the WCD 2026 campaign',
    message: 'Our company would like to sponsor 10,000 pairs of reusable gloves and 5,000 environmentally certified waste-sorting bags for cleanup sites in Hanoi and Da Nang.',
    status: 'Replied',
    createdAt: '2026-05-02T09:10:00Z'
  }
];

// Starts empty on purpose: past seed data used made-up YouTube IDs
// (falsely attributed to BBC/AFP/VTV3/VnExpress) whose thumbnails all
// 404 — never fabricate video IDs, let admins add the org's real videos
// via the "Add Video" button on the Videos page.
export const INITIAL_VIDEOS: MediaVideo[] = [];

export const INITIAL_WHAT_WE_DO: WhatWeDoItem[] = [
  {
    id: 'wwd-1',
    badge: 'Global Campaign',
    title: 'World Cleanup Day',
    desc: 'Every year, we join hands with millions of volunteers across the globe on World Cleanup Day. Armed with gloves and determination, we clean up litter, plastic waste, and debris from streets, parks, and waterways. Together, we’re shaping a cleaner future for Vietnam.',
    image: '/what-we-do-wcd.jpg',
    layout: 'image-left',
    highlights: ['5,000+ volunteers every year', '8,500+ kg of waste collected', '63 provinces nationwide'],
    order: 1
  },
  {
    id: 'wwd-2',
    badge: 'Training & Workshops',
    title: 'Educational Campaigns',
    desc: 'Knowledge is power. We believe that informed citizens can drive change. Through workshops, seminars, and awareness campaigns, we educate people about waste management, recycling, and environmental conservation. Our goal? Empower individuals to take action and protect our planet.',
    image: '/what-we-do-edu.jpg',
    layout: 'image-right',
    highlights: ['Sustainable lifestyle workshops', 'Waste-sorting training', 'Outreach to schools & businesses'],
    order: 2
  },
  {
    id: 'wwd-3',
    badge: 'Community Engagement',
    title: 'Community Engagement',
    desc: 'Our strength lies in our communities. We organize local cleanups, tree planting events, and collaborative projects that bring people together. By fostering a sense of responsibility and camaraderie, we inspire long-term sustainable habits.',
    image: '/what-we-do-comm.jpg',
    layout: 'image-left',
    highlights: ['Neighborhood cleanup activities', 'Urban tree planting', 'Zero-waste living habits'],
    order: 3
  }
];

export const INITIAL_WHO_WE_ARE: WhoWeAreItem[] = [
  {
    id: 'wwa-1',
    title: 'Where It All Began',
    content: 'Let’s Do It Vietnam began as part of the global Let’s Do It World movement, which originated in Estonia in 2008 with a massive cleanup event that inspired millions worldwide. Recognizing the urgent need for action in Vietnam, a group of passionate environmentalists and community leaders established Let’s Do It Vietnam in 2015.',
    image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1000&auto=format&fit=crop&q=80',
    layout: 'image-left',
    order: 1
  },
  {
    id: 'wwa-2',
    title: "Let's Do It Vietnam Today",
    content: 'Since its inception, Let’s Do It Vietnam has grown exponentially, organizing nationwide cleanup events, educational workshops, and awareness campaigns to combat waste and promote environmental sustainability. The organization has mobilized thousands of volunteers, collaborated with local governments, businesses, and schools, and played a pivotal role in shaping a greener future for Vietnam. Through relentless dedication and community engagement, Let\'s Do It Vietnam continues to inspire positive change and environmental stewardship across the country.',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1000&auto=format&fit=crop&q=80',
    layout: 'image-right',
    order: 2
  }
];


