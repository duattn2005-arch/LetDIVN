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
  WhatWeDoItem
} from '../types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-admin-01',
    name: 'Nguyễn Văn Hoàng (Admin)',
    email: 'admin@letsdoitvietnam.org',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    provider: 'email',
    joinedAt: '2022-03-15',
    eventsAttended: 28,
    trashCollectedKg: 1450,
    city: 'Hà Nội'
  },
  {
    id: 'usr-coord-01',
    name: 'Trần Thị Mai Linh',
    email: 'mailinh.tran@letsdoitvietnam.org',
    role: 'coordinator',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    provider: 'google',
    joinedAt: '2023-01-10',
    eventsAttended: 16,
    trashCollectedKg: 820,
    city: 'TP. Hồ Chí Minh'
  },
  {
    id: 'usr-vol-01',
    name: 'Lê Quốc Bảo',
    phone: '0988123456',
    role: 'volunteer',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    provider: 'phone',
    joinedAt: '2024-05-20',
    eventsAttended: 6,
    trashCollectedKg: 180,
    city: 'Đà Nẵng'
  }
];

export const INITIAL_EVENTS: CleanupEvent[] = [
  {
    id: 'evt-wcd-2026',
    title: 'World Cleanup Day 2026 - Ngày Hội Dọn Rác Thế Giới',
    category: 'World Cleanup Day',
    date: '2026-09-20',
    time: '06:30 - 11:30',
    location: 'Quảng trường Nhà Hát Lớn & Bờ hồ Hoàn Kiếm, Hà Nội',
    city: 'Hà Nội',
    coordinates: { lat: 21.0285, lng: 105.8542 },
    image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1000&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
    description: 'Sự kiện lớn nhất trong năm của Let\'s do it! Vietnam quy tụ hơn 5,000 tình nguyện viên tham gia thu gom, phân loại và tái chế rác thải trên khắp 63 tỉnh thành cả nước.',
    targetVolunteers: 5000,
    registeredCount: 0,
    trashCollectedKg: 8500,
    status: 'Upcoming',
    leader: 'Nguyễn Văn Hoàng',
    meetingPoint: 'Cổng chính Nhà Hát Lớn Hà Nội, Số 1 Tràng Tiền'
  },
  {
    id: 'evt-green-ocean-danang',
    title: 'Green Ocean Campaign - Chiến dịch Biển Xanh Đà Nẵng',
    category: 'Green Ocean Campaign',
    date: '2026-07-15',
    time: '05:30 - 09:30',
    location: 'Bãi biển Mỹ Khê & Bán đảo Sơn Trà',
    city: 'Đà Nẵng',
    coordinates: { lat: 16.0544, lng: 108.2435 },
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&auto=format&fit=crop&q=80',
    description: 'Thu gom rác thải nhựa đại dương, bảo vệ hệ sinh thái rạn san hô và tuyên truyền hạn chế đồ nhựa một lần cho ngư dân, khách du lịch ven biển.',
    targetVolunteers: 1200,
    registeredCount: 0,
    trashCollectedKg: 3200,
    status: 'Upcoming',
    leader: 'Trần Minh Trí',
    meetingPoint: 'Công viên Biển Đông, Đường Võ Nguyên Giáp, Sơn Trà'
  },
  {
    id: 'evt-env-day-hcm',
    title: 'Ngày Môi Trường Thế Giới 2026 - TP. Hồ Chí Minh',
    category: 'Environmental Day',
    date: '2026-06-05',
    time: '07:00 - 11:00',
    location: 'Công viên Tao Đàn & Dọc Kênh Nhiêu Lộc - Thị Nghè',
    city: 'TP. Hồ Chí Minh',
    coordinates: { lat: 10.7769, lng: 106.6924 },
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1000&auto=format&fit=crop&q=80',
    description: 'Chiến dịch làm sạch không gian công cộng, cải tạo bờ kênh và phát động phong trào sống xanh không rác thải (Zero Waste Life).',
    targetVolunteers: 2500,
    registeredCount: 0,
    trashCollectedKg: 5400,
    status: 'Upcoming',
    leader: 'Trần Thị Mai Linh',
    meetingPoint: 'Khu trung tâm Công viên Tao Đàn, Đường Trương Định, Q.1'
  },
  {
    id: 'evt-wildlife-catba',
    title: 'Bảo Tồn Động Vật Hoang Dã & Dọn Rác Rừng Quốc Gia Cát Bà',
    category: 'Wildlife & Nature',
    date: '2026-08-10',
    time: '06:00 - 12:00',
    location: 'Vườn Quốc Gia Cát Bà & Vịnh Lan Hạ, Hải Phòng',
    city: 'Hải Phòng',
    coordinates: { lat: 20.8033, lng: 106.9996 },
    image: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=1000&auto=format&fit=crop&q=80',
    description: 'Hành trình làm sạch đường mòn trekking xuyên rừng nguyên sinh Cát Bà, bảo vệ môi trường sống của loài Voọc Cát Bà quý hiếm.',
    targetVolunteers: 500,
    registeredCount: 0,
    trashCollectedKg: 1200,
    status: 'Upcoming',
    leader: 'Phạm Thu Hằng',
    meetingPoint: 'Cổng Vườn Quốc Gia Cát Bà, Huyện Cát Hải, Hải Phòng'
  },
  {
    id: 'evt-workshop-zerowaste',
    title: 'Workshop Tái Chế Nhựa & Lối Sống Không Rác Thải',
    category: 'Workshop & Education',
    date: '2026-05-25',
    time: '14:00 - 17:30',
    location: 'Trung tâm Văn hóa Sinh viên TP. Đà Lạt',
    city: 'Lâm Đồng',
    coordinates: { lat: 11.9404, lng: 108.4583 },
    image: 'https://images.unsplash.com/photo-1528190336454-13cd56b45b5a?w=1000&auto=format&fit=crop&q=80',
    description: 'Khóa tập huấn chuyên sâu về kinh tế tuần hoàn, thực hành phân loại rác tại nguồn và tự làm xà phòng hữu cơ từ dầu ăn thừa.',
    targetVolunteers: 300,
    registeredCount: 0,
    trashCollectedKg: 450,
    status: 'Upcoming',
    leader: 'Đỗ Hữu Đức',
    meetingPoint: 'Hội trường Tầng 2, Trung tâm Văn hóa Sinh viên Đà Lạt'
  },
  {
    id: 'evt-nhatrang-coral',
    title: 'Hành Trình Biển Xanh - Dọn Rác Rạn San Hô Vịnh Nha Trang',
    category: 'Green Ocean Campaign',
    date: '2026-07-28',
    time: '06:00 - 11:00',
    location: 'Dọc bãi biển Trần Phú & Đảo Hòn Tre, Nha Trang',
    city: 'Khánh Hòa',
    coordinates: { lat: 12.2388, lng: 109.1967 },
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1000&auto=format&fit=crop&q=80',
    description: 'Chiến dịch lặn biển nhặt rác đáy đại dương và làm sạch bãi tắm du lịch, bảo vệ hệ sinh thái biển vịnh Nha Trang.',
    targetVolunteers: 800,
    registeredCount: 0,
    trashCollectedKg: 2100,
    status: 'Upcoming',
    leader: 'Lê Hoàng Long',
    meetingPoint: 'Quảng trường 2/4, Đường Trần Phú, Lộc Thọ, Nha Trang'
  },
  {
    id: 'evt-cantho-floating',
    title: 'Dòng Sông Xanh Mekong - Chợ Nổi Cái Răng, Cần Thơ',
    category: 'World Cleanup Day',
    date: '2026-09-20',
    time: '05:30 - 10:30',
    location: 'Bến Ninh Kiều & Chợ Nổi Cái Răng, Cần Thơ',
    city: 'Cần Thơ',
    coordinates: { lat: 10.0452, lng: 105.7469 },
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1000&auto=format&fit=crop&q=80',
    description: 'Vớt rác nổi trên sông Cần Thơ và tuyên truyền cho các hộ dân thương hồ không xả rác xuống dòng Mekong.',
    targetVolunteers: 600,
    registeredCount: 0,
    trashCollectedKg: 3800,
    status: 'Upcoming',
    leader: 'Huỳnh Thanh Tùng',
    meetingPoint: 'Tượng đài Bác Hồ, Bến Ninh Kiều, Cần Thơ'
  }
];

export const INITIAL_VOLUNTEERS: VolunteerRegistration[] = [];

export const INITIAL_NEWS: NewsArticle[] = [
  {
    id: 'news-001',
    title: 'Let\'s do it! Vietnam chính thức phát động chiến dịch World Cleanup Day 2026 trên toàn quốc',
    slug: 'lets-do-it-vietnam-phat-dong-world-cleanup-day-2026',
    category: 'Press Release',
    summary: 'Chiến dịch Ngày Hội Dọn Rác Thế Giới 2026 đặt mục tiêu thu hút hơn 100.000 lượt người tham gia tại 63 tỉnh thành, hướng tới một Việt Nam xanh và sạch rác thải nhựa.',
    content: `Hà Nội, ngày 15 tháng 04 năm 2026 — Tổ chức phi lợi nhuận Let's do it! Vietnam hôm nay chính thức công bố kế hoạch triển khai Ngày hội Dọn rác Thế giới (World Cleanup Day 2026). 

Được khởi xướng từ năm 2015, Let's do it! Vietnam đã trở thành ngọn cờ đầu trong phong trào môi trường cộng đồng tại Việt Nam. Năm nay, với thông điệp "Global Impact, Local Action" (Tác động Toàn cầu, Hành động Địa phương), chương trình không chỉ tập trung vào việc dọn sạch các điểm nóng ô nhiễm mà còn chú trọng đào tạo phân loại rác tại nguồn và kết nối mạng lưới tái chế tuần hoàn.

Ban tổ chức kêu gọi sự chung tay của các cơ quan chính quyền, doanh nghiệp, trường đại học và từng cá nhân để cùng nhau tạo nên một ngày hội môi trường lớn nhất trong năm.`,
    author: 'Ban Truyền Thông Let\'s do it! Vietnam',
    date: '2026-04-15',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    source: 'Thông Tấn Xã Việt Nam',
    sourceUrl: 'https://vietnamplus.vn',
    views: 4520,
    featured: true
  },
  {
    id: 'news-002',
    title: 'Đài Truyền Hình Quốc Gia VTV1 đưa tin về hành trình 10 năm hành động vì môi trường của Let\'s do it! Vietnam',
    slug: 'vtv1-dua-tin-hanh-trinh-10-nam-lets-do-it-vietnam',
    category: 'Media On Us',
    summary: 'Phóng sự đặc biệt phát sóng trong chương trình "Vì Tương Lai Xanh" tôn vinh những đóng góp không ngừng nghỉ của hàng chục nghìn bạn trẻ tình nguyện viên.',
    content: `Chương trình "Vì Tương Lai Xanh" phát sóng trên VTV1 đã dành thời lượng 15 phút để phản ánh sinh động hành trình 10 năm (2015 - 2026) của Let's do it! Vietnam. 

Từ một nhóm nhỏ các bạn trẻ đầy nhiệt huyết tại Hà Nội và TP.HCM, đến nay tổ chức đã thiết lập mạng lưới điều phối viên tại hơn 40 tỉnh thành, thu gom và xử lý an toàn hơn 5.000 tấn rác thải các loại. Phóng sự nhấn mạnh sự thay đổi nhận thức rõ rệt của cộng đồng dân cư tại các điểm đen rác thải sau mỗi đợt ra quân.`,
    author: 'VTV News',
    date: '2026-03-28',
    image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop&q=80',
    source: 'VTV1 - Ban Khoa Giáo',
    sourceUrl: 'https://vtv.vn',
    views: 8900,
    featured: true
  },
  {
    id: 'news-003',
    title: 'Hơn 3 tấn rác nhựa được dọn sạch tại bờ biển Cát Bà trong chiến dịch Mùa Hè Xanh',
    slug: 'hon-3-tan-rac-nhua-duoc-don-sach-tai-bo-bien-cat-ba',
    category: 'News',
    summary: 'Sự kiện phối hợp giữa Let\'s do it! Vietnam cùng Ban Quản lý Vườn Quốc gia Cát Bà thu hút 350 tình nguyện viên tham gia làm sạch 4km bờ biển.',
    content: `Trong hai ngày cuối tuần vừa qua, 350 bạn trẻ tình nguyện viên thuộc mạng lưới Let's do it! Vietnam đã cùng người dân địa phương và cán bộ kiểm lâm thực hiện chiến dịch dọn sạch bờ biển vịnh Lan Hạ và đảo Cát Bà.

Tổng lượng rác thu gom ước tính vượt 3.2 tấn, trong đó phần lớn là phao xốp vỡ, lưới đánh cá cũ, chai nhựa và túi ni-lông trôi dạt. Toàn bộ rác thải tái chế được bàn giao cho đơn vị xử lý chuyên trách.`,
    author: 'Phạm Thu Hằng',
    date: '2026-04-02',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    source: 'Báo Môi Trường & Đô Thị',
    sourceUrl: 'https://moitruongvadothi.vn',
    views: 3120,
    featured: false
  },
  {
    id: 'news-004',
    title: 'Báo Dân Trí: Thanh niên Việt Nam và giấc mơ không rác thải nhựa đại dương',
    slug: 'dan-tri-thanh-nien-viet-nam-va-giac-mo-khong-rac-thai-nhua',
    category: 'Media On Us',
    summary: 'Bài viết phỏng vấn các trưởng nhóm điều phối Let\'s do it! Vietnam về chiến lược ứng dụng công nghệ bản đồ số trong việc định vị và xử lý các bãi rác tự phát.',
    content: `Báo Dân Trí số ra ngày 22/04 ghi nhận những sáng kiến đổi mới sáng tạo của đội ngũ công nghệ trẻ tại Let's do it! Vietnam. Việc áp dụng bản đồ số hóa điểm nóng ô nhiễm và hệ thống quản trị dữ liệu tình nguyện viên thời gian thực đã nâng cao hiệu suất điều phối lên gấp 3 lần so với các phương pháp truyền thống.`,
    author: 'Báo Dân Trí',
    date: '2026-04-22',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80',
    source: 'Báo Điện Tử Dân Trí',
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
    description: 'Tập đoàn Unilever đồng hành cùng Let\'s do it! Vietnam trong các chiến dịch giảm rác thải nhựa.',
    joinedYear: 2018
  },
  {
    id: 'ptn-02',
    name: 'Honda Vietnam',
    tier: 'Diamond',
    logo: '/partners/honda.png',
    website: 'https://www.honda.com.vn',
    type: 'Corporate',
    description: 'The Power of Dreams - Honda Vietnam tài trợ phương tiện và trang bị bảo hộ dọn rác.',
    joinedYear: 2019
  },
  {
    id: 'ptn-03',
    name: 'Hilton Hotels & Resorts',
    tier: 'Gold',
    logo: '/partners/hilton.png',
    website: 'https://www.hilton.com',
    type: 'Hospitality',
    description: 'Chuỗi khách sạn Hilton cam kết phát triển bền vững và giảm thiểu rác thải sinh hoạt.',
    joinedYear: 2020
  },
  {
    id: 'ptn-04',
    name: 'Hirdaramani / FGL',
    tier: 'Gold',
    logo: '/partners/hirdaramani.png',
    website: 'https://www.hirdaramani.com',
    type: 'Manufacturing',
    description: 'Đối tác dệt may bền vững tiên phong trong bảo vệ môi trường và chuỗi cung ứng xanh.',
    joinedYear: 2021
  },
  {
    id: 'ptn-05',
    name: 'Quỹ Vì Tương Lai Xanh',
    tier: 'Gold',
    logo: '/partners/tuong-lai-xanh.png',
    website: 'https://vinfutureprize.org',
    type: 'Foundation',
    description: 'Đồng hành cùng các sáng kiến hành động vì môi trường xanh tại Việt Nam.',
    joinedYear: 2022
  },
  {
    id: 'ptn-06',
    name: 'VinUniversity Sustainability',
    tier: 'Gold',
    logo: '/partners/vinuniversity.png',
    website: 'https://vinuni.edu.vn',
    type: 'University',
    description: 'Viện nghiên cứu và trung tâm phát triển bền vững Đại học VinUni.',
    joinedYear: 2021
  },
  {
    id: 'ptn-07',
    name: 'Vingroup',
    tier: 'Diamond',
    logo: '/partners/vingroup.png',
    website: 'https://vingroup.net',
    type: 'Corporate',
    description: 'Tập đoàn Vingroup bảo trợ các chiến dịch vì một Việt Nam xanh - sạch - đẹp.',
    joinedYear: 2019
  },
  {
    id: 'ptn-08',
    name: 'The Body Shop',
    tier: 'Silver',
    logo: '/partners/the-body-shop.png',
    website: 'https://www.thebodyshop.com.vn',
    type: 'Retail',
    description: 'Thương hiệu mỹ phẩm thuần chay tiên phong tái chế bao bì nhựa tại Việt Nam.',
    joinedYear: 2020
  },
  {
    id: 'ptn-09',
    name: 'Easia Travel',
    tier: 'Silver',
    logo: '/partners/easia-travel.png',
    website: 'https://www.easia-travel.com',
    type: 'Travel',
    description: 'Du lịch xanh bền vững và làm sạch các điểm đến du lịch sinh thái.',
    joinedYear: 2021
  },
  {
    id: 'ptn-10',
    name: 'USAID Vietnam',
    tier: 'Diamond',
    logo: '/partners/usaid.png',
    website: 'https://www.usaid.gov/vietnam',
    type: 'International Organization',
    description: 'Cơ quan Phát triển Quốc tế Hoa Kỳ hỗ trợ các chương trình giảm thiểu rác thải nhựa đại dương.',
    joinedYear: 2018
  },
  {
    id: 'ptn-11',
    name: 'YSEALI',
    tier: 'Gold',
    logo: '/partners/yseali.png',
    website: 'https://asean.usmission.gov/yseali/',
    type: 'International Organization',
    description: 'Sáng kiến Thủ lĩnh Trẻ Đông Nam Á - Đồng hành cùng các dự án môi trường thanh niên.',
    joinedYear: 2019
  },
  {
    id: 'ptn-12',
    name: 'United States Embassy Hanoi',
    tier: 'Diamond',
    logo: '/partners/us-embassy.png',
    website: 'https://vn.usembassy.gov/',
    type: 'Diplomatic Mission',
    description: 'Đại sứ quán Hoa Kỳ tại Hà Nội - Tài trợ các chương trình sinh thái và giáo dục cộng đồng.',
    joinedYear: 2017
  },
  {
    id: 'ptn-13',
    name: 'Fuwa3e Enzyme Cleaner',
    tier: 'Gold',
    logo: '/partners/fuwa3e.png',
    website: 'https://fuwa.com.vn',
    type: 'Eco Brand',
    description: 'Chế phẩm sinh học từ dứa lên men - Giải pháp tẩy rửa hữu cơ an toàn cho nguồn nước.',
    joinedYear: 2021
  },
  {
    id: 'ptn-14',
    name: 'Pizza 4P\'s',
    tier: 'Gold',
    logo: '/partners/pizza-4ps.png',
    website: 'https://pizza4ps.com',
    type: 'Restaurant Chain',
    description: 'Chuỗi nhà hàng tiên phong phong trào Nhà Hàng Không Rác Thải (Zero Waste Restaurant).',
    joinedYear: 2020
  },
  {
    id: 'ptn-15',
    name: 'GO! / Big C',
    tier: 'Diamond',
    logo: '/partners/go-bigc.png',
    website: 'https://go-vietnam.vn',
    type: 'Retail',
    description: 'Hệ thống đại siêu thị đồng hành phân loại rác tái chế và sử dụng túi sinh học.',
    joinedYear: 2019
  },
  {
    id: 'ptn-16',
    name: 'The Empyrean Cam Ranh',
    tier: 'Gold',
    logo: '/partners/the-empyrean.png',
    website: 'https://theempyreanhotel.com',
    type: 'Hospitality',
    description: 'Khu nghỉ dưỡng xanh với các chiến dịch dọn sạch bãi biển Cam Ranh định kỳ.',
    joinedYear: 2022
  },
  {
    id: 'ptn-17',
    name: 'Mainetti Vietnam',
    tier: 'Silver',
    logo: '/partners/mainetti.png',
    website: 'https://www.mainetti.com',
    type: 'Packaging',
    description: 'Giải pháp tái chế móc treo và bao bì nhựa tuần hoàn trong ngành thời trang.',
    joinedYear: 2021
  },
  {
    id: 'ptn-18',
    name: '7 Bridges Brewing Co',
    tier: 'Silver',
    logo: '/partners/7-bridges.png',
    website: 'https://7bridgesbrewing.com',
    type: 'F&B',
    description: 'Thương hiệu bia thủ công tiên phong cam kết phát triển bền vững và bảo vệ môi trường.',
    joinedYear: 2022
  },
  {
    id: 'ptn-19',
    name: 'Intrepid Travel',
    tier: 'Gold',
    logo: '/partners/intrepid.png',
    website: 'https://www.intrepidtravel.com',
    type: 'Travel',
    description: 'Tổ chức du lịch mạo hiểm bền vững hàng đầu thế giới với các tour du lịch không rác thải.',
    joinedYear: 2018
  },
  {
    id: 'ptn-20',
    name: 'Luxury Travel',
    tier: 'Silver',
    logo: '/partners/luxury-travel.png',
    website: 'https://luxurytravelvietnam.com',
    type: 'Travel',
    description: 'Dịch vụ lữ hành cao cấp đồng hành cùng các hoạt động bảo tồn sinh thái Việt Nam.',
    joinedYear: 2020
  },
  {
    id: 'ptn-21',
    name: 'Canon Vietnam',
    tier: 'Diamond',
    logo: '/partners/canon.png',
    website: 'https://vn.canon',
    type: 'Technology',
    description: 'Tập đoàn Canon với triết lý Kyosei (Cùng sống và làm việc vì lợi ích chung) tài trợ bảo vệ môi trường.',
    joinedYear: 2016
  },
  {
    id: 'ptn-22',
    name: 'Thế Hệ Xanh (Live & Learn)',
    tier: 'Gold',
    logo: '/partners/the-he-xanh.png',
    website: 'https://livelearn.vn',
    type: 'NGO Network',
    description: 'Mạng lưới thanh niên hành động vì không khí sạch và môi trường xanh bền vững.',
    joinedYear: 2017
  },
  {
    id: 'ptn-23',
    name: 'TH School',
    tier: 'Gold',
    logo: '/partners/th-school.png',
    website: 'https://thschool.edu.vn',
    type: 'Education',
    description: 'Hệ thống trường học sinh thái phát động các phong trào phân loại rác và bảo vệ thiên nhiên cho học sinh.',
    joinedYear: 2021
  },
  {
    id: 'ptn-24',
    name: 'CBTW',
    tier: 'Silver',
    logo: '/partners/cbtw.png',
    website: 'https://cbtw.tech',
    type: 'Technology',
    description: 'Tập đoàn công nghệ toàn cầu hỗ trợ các giải pháp số hóa và chuyển đổi số xanh.',
    joinedYear: 2023
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-01',
    title: 'Đại hội quân Ngày Hội Dọn Rác Thế Giới WCD 2024 tại Nhà Hát Lớn Hà Nội',
    eventName: 'World Cleanup Day 2024',
    year: 2024,
    city: 'Hà Nội',
    imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop&q=80',
    caption: 'Hơn 2.000 tình nguyện viên rực rỡ trong màu áo vàng - xanh truyền thống cùng hô vang khẩu hiệu Let\'s do it! Vietnam.',
    category: 'World Cleanup Day'
  },
  {
    id: 'gal-02',
    title: 'Phân loại rác thải nhựa và tái chế sau chiến dịch dọn sạch bãi biển Mỹ Khê',
    eventName: 'Green Ocean Campaign',
    year: 2024,
    city: 'Đà Nẵng',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    caption: 'Hàng trăm bao rác tái chế được cân đo và bàn giao cho nhà máy xử lý tuần hoàn.',
    category: 'Ocean Cleanups'
  },
  {
    id: 'gal-03',
    title: 'Hành động nhỏ, ý nghĩa lớn: Các bạn nhỏ tình nguyện viên nhí tại TP. Hồ Chí Minh',
    eventName: 'Environmental Day 2024',
    year: 2024,
    city: 'TP. Hồ Chí Minh',
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80',
    caption: 'Thế hệ tương lai cùng gia đình chung tay nhặt sạch rác thải nhựa tại công viên Tao Đàn.',
    category: 'Youth & Community'
  },
  {
    id: 'gal-04',
    title: 'Đội hình thanh niên tình nguyện làm sạch Kênh Nhiêu Lộc - Thị Nghè',
    eventName: 'Clean Up Sai Gon River',
    year: 2023,
    city: 'TP. Hồ Chí Minh',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    caption: 'Các bạn tình nguyện viên không ngại khó khăn vớt rác ven bờ kênh, trả lại vẻ đẹp thơ mộng cho dòng sông.',
    category: 'River Cleanups'
  },
  {
    id: 'gal-05',
    title: 'Workshop đào tạo Điều phối viên Môi trường tại Hà Nội',
    eventName: 'Leader Training Workshop',
    year: 2024,
    city: 'Hà Nội',
    imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&auto=format&fit=crop&q=80',
    caption: 'Tập huấn kỹ năng lãnh đạo nhóm, an toàn lao động và phân loại rác khoa học cho hơn 80 nhóm trưởng.',
    category: 'Workshops & Training'
  },
  {
    id: 'gal-06',
    title: 'Chiến dịch bảo vệ rạn san hô và sinh vật biển Cát Bà',
    eventName: 'Save The Wildlife Cat Ba',
    year: 2023,
    city: 'Hải Phòng',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
    caption: 'Đội lặn tình nguyện phối hợp thu gom ngư cụ đánh bắt bỏ quên dưới đáy biển vịnh Lan Hạ.',
    category: 'Wildlife & Nature'
  }
];

export const INITIAL_TEAM: TeamMember[] = [
  {
    id: 'tm-01',
    name: 'Nguyễn Văn Hoàng',
    role: 'Chủ Tịch & Trưởng Ban Điều Hành Quốc Gia',
    department: 'Ban Lãnh Đạo (National Board)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    bio: 'Nhà hoạt động xã hội với 10 năm kinh nghiệm dẫn dắt các chiến dịch môi trường quy mô toàn quốc, đại diện Let\'s do it! Vietnam tại hội nghị WCD Toàn Cầu.',
    linkedin: 'https://linkedin.com'
  },
  {
    id: 'tm-02',
    name: 'Trần Thị Mai Linh',
    role: 'Giám Đốc Dự Án Khu Vực Miền Nam',
    department: 'Ban Điều Phối Dự Án',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    bio: 'Chuyên gia quản lý dự án phát triển bền vững, kết nối hơn 30 trường đại học và tổ chức thanh niên tại TP.HCM và các tỉnh Đồng Bằng Sông Cửu Long.',
    facebook: 'https://facebook.com'
  },
  {
    id: 'tm-03',
    name: 'Phạm Minh Trí',
    role: 'Trưởng Ban Đối Ngoại & Tài Trợ Doanh Nghiệp',
    department: 'Ban Hợp Tác & Tài Trợ',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    bio: 'Kinh nghiệm 8 năm trong mảng CSR và ESG cho các tập đoàn đa quốc gia, phụ trách mở rộng mạng lưới nhà tài trợ cho Let\'s do it! Vietnam.',
    linkedin: 'https://linkedin.com'
  },
  {
    id: 'tm-04',
    name: 'Đặng Ngọc Ánh',
    role: 'Giám Đốc Truyền Thông & Marketing Xã Hội',
    department: 'Ban Truyền Thông',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    bio: 'Sáng tạo các chiến dịch viral tiếp cận hơn 5 triệu người trẻ trên mạng xã hội, thúc đẩy thói quen phân loại rác và lối sống xanh.',
    facebook: 'https://facebook.com'
  },
  {
    id: 'tm-05',
    name: 'Lê Quốc Bảo',
    role: 'Trưởng Ban Công Nghệ & Quản Trị Cơ Sở Dữ Liệu',
    department: 'Ban Công Nghệ (Tech Team)',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
    bio: 'Kỹ sư phần mềm phát triển hệ thống bản đồ số hóa rác thải và nền tảng quản trị tình nguyện viên tự động cho tổ chức.',
    linkedin: 'https://linkedin.com'
  }
];

export const INITIAL_CONTACTS: ContactMessage[] = [
  {
    id: 'msg-01',
    name: 'Trần Văn Long',
    email: 'long.tran@university.edu.vn',
    phone: '0988776655',
    subject: 'Đăng ký phối hợp tổ chức Ngày Hội Dọn Rác tại khuôn viên KTX ĐHQG',
    message: 'Xin chào BTC Let\'s do it! Vietnam, chúng tôi muốn phối hợp tổ chức một ngày dọn dẹp và thu gom rác nhựa cho khoảng 1.000 sinh viên tại KTX khu B.',
    status: 'In Review',
    createdAt: '2026-05-04T15:30:00Z'
  },
  {
    id: 'msg-02',
    name: 'Nguyễn Thị Hồng',
    email: 'hong.nguyen@greensolutions.vn',
    phone: '0912998877',
    subject: 'Đề xuất tài trợ găng tay và túi rác tự hủy sinh học cho chiến dịch WCD 2026',
    message: 'Công ty chúng tôi muốn tài trợ 10.000 đôi găng tay tái sử dụng và 5.000 túi phân loại rác chuẩn môi trường cho các điểm dọn rác ở Hà Nội và Đà Nẵng.',
    status: 'Replied',
    createdAt: '2026-05-02T09:10:00Z'
  }
];

// Starts empty on purpose: past seed data used made-up YouTube IDs
// (falsely attributed to BBC/AFP/VTV3/VnExpress) whose thumbnails all
// 404 — never fabricate video IDs, let admins add the org's real videos
// via the "Thêm Video" button on the Videos page.
export const INITIAL_VIDEOS: MediaVideo[] = [];

export const INITIAL_WHAT_WE_DO: WhatWeDoItem[] = [
  {
    id: 'wwd-1',
    badge: 'Chiến Dịch Toàn Cầu',
    title: 'World Cleanup Day',
    desc: 'Every year, we join hands with millions of volunteers across the globe on World Cleanup Day. Armed with gloves and determination, we clean up litter, plastic waste, and debris from streets, parks, and waterways. Together, we’re shaping a cleaner future for Vietnam.',
    image: '/what-we-do-wcd.jpg',
    layout: 'image-left',
    highlights: ['5,000+ Tình nguyện viên mỗi năm', 'Thu gom 8,500+ kg rác', '63 Tỉnh thành toàn quốc'],
    order: 1
  },
  {
    id: 'wwd-2',
    badge: 'Tập Huấn & Hội Thảo',
    title: 'Educational Campaigns',
    desc: 'Knowledge is power. We believe that informed citizens can drive change. Through workshops, seminars, and awareness campaigns, we educate people about waste management, recycling, and environmental conservation. Our goal? Empower individuals to take action and protect our planet.',
    image: '/what-we-do-edu.jpg',
    layout: 'image-right',
    highlights: ['Hội thảo lối sống bền vững', 'Tập huấn phân loại rác', 'Lan tỏa đến trường học & doanh nghiệp'],
    order: 2
  },
  {
    id: 'wwd-3',
    badge: 'Kết Nối Cộng Đồng',
    title: 'Community Engagement',
    desc: 'Our strength lies in our communities. We organize local cleanups, tree planting events, and collaborative projects that bring people together. By fostering a sense of responsibility and camaraderie, we inspire long-term sustainable habits.',
    image: '/what-we-do-comm.jpg',
    layout: 'image-left',
    highlights: ['Hoạt động dọn rác khu dân cư', 'Trồng cây xanh đô thị', 'Thói quen sống không rác thải'],
    order: 3
  }
];


