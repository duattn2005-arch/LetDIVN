/**
 * Vietnam's provinces and centrally-run cities, both the 63 of before the
 * 2025 reorganisation and the 34 since 1 July 2025 (Resolution
 * 202/2025/QH15). Each is pinned at its administrative centre; a new
 * province lists the old ones merged into it (`from`), under their names in
 * OLD_PROVINCES. Names are in English, without diacritics.
 */
export interface ProvincePlace {
  name: string;
  lat: number;
  lng: number;
  from?: string[];
}

export const OLD_PROVINCES: ProvincePlace[] = [
  { name: 'Hanoi', lat: 21.0285, lng: 105.8542 },
  { name: 'Ha Giang', lat: 22.8233, lng: 104.9836 },
  { name: 'Cao Bang', lat: 22.6657, lng: 106.257 },
  { name: 'Bac Kan', lat: 22.147, lng: 105.8348 },
  { name: 'Tuyen Quang', lat: 21.8236, lng: 105.214 },
  { name: 'Lao Cai', lat: 22.4856, lng: 103.9707 },
  { name: 'Dien Bien', lat: 21.386, lng: 103.023 },
  { name: 'Lai Chau', lat: 22.3964, lng: 103.4582 },
  { name: 'Son La', lat: 21.3256, lng: 103.9188 },
  { name: 'Yen Bai', lat: 21.7229, lng: 104.9113 },
  { name: 'Hoa Binh', lat: 20.8171, lng: 105.3376 },
  { name: 'Thai Nguyen', lat: 21.5942, lng: 105.848 },
  { name: 'Lang Son', lat: 21.8537, lng: 106.7615 },
  { name: 'Quang Ninh', lat: 20.9517, lng: 107.08 },
  { name: 'Bac Giang', lat: 21.2731, lng: 106.1946 },
  { name: 'Phu Tho', lat: 21.3227, lng: 105.402 },
  { name: 'Vinh Phuc', lat: 21.3089, lng: 105.6049 },
  { name: 'Bac Ninh', lat: 21.1861, lng: 106.0763 },
  { name: 'Hai Duong', lat: 20.9373, lng: 106.3146 },
  { name: 'Hai Phong', lat: 20.8449, lng: 106.6881 },
  { name: 'Hung Yen', lat: 20.6464, lng: 106.0511 },
  { name: 'Thai Binh', lat: 20.4463, lng: 106.3366 },
  { name: 'Ha Nam', lat: 20.5411, lng: 105.9139 },
  { name: 'Nam Dinh', lat: 20.4388, lng: 106.1621 },
  { name: 'Ninh Binh', lat: 20.2506, lng: 105.9745 },
  { name: 'Thanh Hoa', lat: 19.8075, lng: 105.7764 },
  { name: 'Nghe An', lat: 18.6796, lng: 105.6813 },
  { name: 'Ha Tinh', lat: 18.3428, lng: 105.9057 },
  { name: 'Quang Binh', lat: 17.4689, lng: 106.6223 },
  { name: 'Quang Tri', lat: 16.8163, lng: 107.1003 },
  { name: 'Thua Thien Hue', lat: 16.4637, lng: 107.5909 },
  { name: 'Da Nang', lat: 16.0544, lng: 108.2022 },
  { name: 'Quang Nam', lat: 15.5736, lng: 108.474 },
  { name: 'Quang Ngai', lat: 15.1205, lng: 108.7923 },
  { name: 'Binh Dinh', lat: 13.7765, lng: 109.2237 },
  { name: 'Phu Yen', lat: 13.0955, lng: 109.3209 },
  { name: 'Khanh Hoa', lat: 12.2388, lng: 109.1967 },
  { name: 'Ninh Thuan', lat: 11.5646, lng: 108.9886 },
  { name: 'Binh Thuan', lat: 10.9289, lng: 108.1021 },
  { name: 'Kon Tum', lat: 14.3498, lng: 108.0005 },
  { name: 'Gia Lai', lat: 13.9833, lng: 108.0 },
  { name: 'Dak Lak', lat: 12.6667, lng: 108.05 },
  { name: 'Dak Nong', lat: 12.0042, lng: 107.6907 },
  { name: 'Lam Dong', lat: 11.9404, lng: 108.4583 },
  { name: 'Binh Phuoc', lat: 11.5349, lng: 106.8832 },
  { name: 'Tay Ninh', lat: 11.31, lng: 106.0983 },
  { name: 'Binh Duong', lat: 10.9804, lng: 106.6519 },
  { name: 'Dong Nai', lat: 10.9574, lng: 106.8426 },
  { name: 'Ba Ria - Vung Tau', lat: 10.4963, lng: 107.1685 },
  { name: 'Ho Chi Minh City', lat: 10.7769, lng: 106.7009 },
  { name: 'Long An', lat: 10.5359, lng: 106.4137 },
  { name: 'Tien Giang', lat: 10.36, lng: 106.36 },
  { name: 'Ben Tre', lat: 10.2434, lng: 106.3756 },
  { name: 'Tra Vinh', lat: 9.9347, lng: 106.3453 },
  { name: 'Vinh Long', lat: 10.2537, lng: 105.9722 },
  { name: 'Dong Thap', lat: 10.4604, lng: 105.6329 },
  { name: 'An Giang', lat: 10.3864, lng: 105.4352 },
  { name: 'Kien Giang', lat: 10.0125, lng: 105.0809 },
  { name: 'Can Tho', lat: 10.0452, lng: 105.7469 },
  { name: 'Hau Giang', lat: 9.7845, lng: 105.4701 },
  { name: 'Soc Trang', lat: 9.6025, lng: 105.9739 },
  { name: 'Bac Lieu', lat: 9.2941, lng: 105.7278 },
  { name: 'Ca Mau', lat: 9.1769, lng: 105.1524 },
];

export const NEW_PROVINCES: ProvincePlace[] = [
  { name: 'Hanoi', lat: 21.0285, lng: 105.8542 },
  { name: 'Hue', lat: 16.4637, lng: 107.5909, from: ['Thua Thien Hue'] },
  { name: 'Lai Chau', lat: 22.3964, lng: 103.4582 },
  { name: 'Dien Bien', lat: 21.386, lng: 103.023 },
  { name: 'Son La', lat: 21.3256, lng: 103.9188 },
  { name: 'Lang Son', lat: 21.8537, lng: 106.7615 },
  { name: 'Quang Ninh', lat: 20.9517, lng: 107.08 },
  { name: 'Thanh Hoa', lat: 19.8075, lng: 105.7764 },
  { name: 'Nghe An', lat: 18.6796, lng: 105.6813 },
  { name: 'Ha Tinh', lat: 18.3428, lng: 105.9057 },
  { name: 'Cao Bang', lat: 22.6657, lng: 106.257 },
  { name: 'Tuyen Quang', lat: 21.8236, lng: 105.214, from: ['Tuyen Quang', 'Ha Giang'] },
  { name: 'Lao Cai', lat: 21.7229, lng: 104.9113, from: ['Lao Cai', 'Yen Bai'] },
  { name: 'Thai Nguyen', lat: 21.5942, lng: 105.848, from: ['Thai Nguyen', 'Bac Kan'] },
  { name: 'Phu Tho', lat: 21.3227, lng: 105.402, from: ['Phu Tho', 'Vinh Phuc', 'Hoa Binh'] },
  { name: 'Bac Ninh', lat: 21.2731, lng: 106.1946, from: ['Bac Ninh', 'Bac Giang'] },
  { name: 'Hung Yen', lat: 20.6464, lng: 106.0511, from: ['Hung Yen', 'Thai Binh'] },
  { name: 'Hai Phong', lat: 20.8449, lng: 106.6881, from: ['Hai Phong', 'Hai Duong'] },
  { name: 'Ninh Binh', lat: 20.2506, lng: 105.9745, from: ['Ninh Binh', 'Ha Nam', 'Nam Dinh'] },
  { name: 'Quang Tri', lat: 17.4689, lng: 106.6223, from: ['Quang Tri', 'Quang Binh'] },
  { name: 'Da Nang', lat: 16.0544, lng: 108.2022, from: ['Da Nang', 'Quang Nam'] },
  { name: 'Quang Ngai', lat: 15.1205, lng: 108.7923, from: ['Quang Ngai', 'Kon Tum'] },
  { name: 'Gia Lai', lat: 13.7765, lng: 109.2237, from: ['Gia Lai', 'Binh Dinh'] },
  { name: 'Khanh Hoa', lat: 12.2388, lng: 109.1967, from: ['Khanh Hoa', 'Ninh Thuan'] },
  { name: 'Lam Dong', lat: 11.9404, lng: 108.4583, from: ['Lam Dong', 'Dak Nong', 'Binh Thuan'] },
  { name: 'Dak Lak', lat: 12.6667, lng: 108.05, from: ['Dak Lak', 'Phu Yen'] },
  { name: 'Ho Chi Minh City', lat: 10.7769, lng: 106.7009, from: ['Ho Chi Minh City', 'Binh Duong', 'Ba Ria - Vung Tau'] },
  { name: 'Dong Nai', lat: 10.9574, lng: 106.8426, from: ['Dong Nai', 'Binh Phuoc'] },
  { name: 'Tay Ninh', lat: 10.5359, lng: 106.4137, from: ['Tay Ninh', 'Long An'] },
  { name: 'Can Tho', lat: 10.0452, lng: 105.7469, from: ['Can Tho', 'Soc Trang', 'Hau Giang'] },
  { name: 'Vinh Long', lat: 10.2537, lng: 105.9722, from: ['Vinh Long', 'Ben Tre', 'Tra Vinh'] },
  { name: 'Dong Thap', lat: 10.36, lng: 106.36, from: ['Dong Thap', 'Tien Giang'] },
  { name: 'Ca Mau', lat: 9.1769, lng: 105.1524, from: ['Ca Mau', 'Bac Lieu'] },
  { name: 'An Giang', lat: 10.0125, lng: 105.0809, from: ['An Giang', 'Kien Giang'] },
];

/** The new province an old one became part of. */
export const newProvinceOf = (oldName: string) =>
  NEW_PROVINCES.find((p) => (p.from ?? [p.name]).includes(oldName))?.name;

/** Alphabetical. */
export const byProvinceName = (a: ProvincePlace, b: ProvincePlace) => a.name.localeCompare(b.name, 'en');
