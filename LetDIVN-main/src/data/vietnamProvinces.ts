/**
 * Vietnam's provinces and centrally-run cities, both the 63 of before the
 * 2025 reorganisation and the 34 since 1 July 2025 (Resolution
 * 202/2025/QH15). Each is pinned at its administrative centre; a new
 * province lists the old ones merged into it (`from`), under their names in
 * OLD_PROVINCES.
 */
export interface ProvincePlace {
  name: string;
  lat: number;
  lng: number;
  from?: string[];
}

export const OLD_PROVINCES: ProvincePlace[] = [
  { name: 'Hà Nội', lat: 21.0285, lng: 105.8542 },
  { name: 'Hà Giang', lat: 22.8233, lng: 104.9836 },
  { name: 'Cao Bằng', lat: 22.6657, lng: 106.257 },
  { name: 'Bắc Kạn', lat: 22.147, lng: 105.8348 },
  { name: 'Tuyên Quang', lat: 21.8236, lng: 105.214 },
  { name: 'Lào Cai', lat: 22.4856, lng: 103.9707 },
  { name: 'Điện Biên', lat: 21.386, lng: 103.023 },
  { name: 'Lai Châu', lat: 22.3964, lng: 103.4582 },
  { name: 'Sơn La', lat: 21.3256, lng: 103.9188 },
  { name: 'Yên Bái', lat: 21.7229, lng: 104.9113 },
  { name: 'Hòa Bình', lat: 20.8171, lng: 105.3376 },
  { name: 'Thái Nguyên', lat: 21.5942, lng: 105.848 },
  { name: 'Lạng Sơn', lat: 21.8537, lng: 106.7615 },
  { name: 'Quảng Ninh', lat: 20.9517, lng: 107.08 },
  { name: 'Bắc Giang', lat: 21.2731, lng: 106.1946 },
  { name: 'Phú Thọ', lat: 21.3227, lng: 105.402 },
  { name: 'Vĩnh Phúc', lat: 21.3089, lng: 105.6049 },
  { name: 'Bắc Ninh', lat: 21.1861, lng: 106.0763 },
  { name: 'Hải Dương', lat: 20.9373, lng: 106.3146 },
  { name: 'Hải Phòng', lat: 20.8449, lng: 106.6881 },
  { name: 'Hưng Yên', lat: 20.6464, lng: 106.0511 },
  { name: 'Thái Bình', lat: 20.4463, lng: 106.3366 },
  { name: 'Hà Nam', lat: 20.5411, lng: 105.9139 },
  { name: 'Nam Định', lat: 20.4388, lng: 106.1621 },
  { name: 'Ninh Bình', lat: 20.2506, lng: 105.9745 },
  { name: 'Thanh Hóa', lat: 19.8075, lng: 105.7764 },
  { name: 'Nghệ An', lat: 18.6796, lng: 105.6813 },
  { name: 'Hà Tĩnh', lat: 18.3428, lng: 105.9057 },
  { name: 'Quảng Bình', lat: 17.4689, lng: 106.6223 },
  { name: 'Quảng Trị', lat: 16.8163, lng: 107.1003 },
  { name: 'Thừa Thiên Huế', lat: 16.4637, lng: 107.5909 },
  { name: 'Đà Nẵng', lat: 16.0544, lng: 108.2022 },
  { name: 'Quảng Nam', lat: 15.5736, lng: 108.474 },
  { name: 'Quảng Ngãi', lat: 15.1205, lng: 108.7923 },
  { name: 'Bình Định', lat: 13.7765, lng: 109.2237 },
  { name: 'Phú Yên', lat: 13.0955, lng: 109.3209 },
  { name: 'Khánh Hòa', lat: 12.2388, lng: 109.1967 },
  { name: 'Ninh Thuận', lat: 11.5646, lng: 108.9886 },
  { name: 'Bình Thuận', lat: 10.9289, lng: 108.1021 },
  { name: 'Kon Tum', lat: 14.3498, lng: 108.0005 },
  { name: 'Gia Lai', lat: 13.9833, lng: 108.0 },
  { name: 'Đắk Lắk', lat: 12.6667, lng: 108.05 },
  { name: 'Đắk Nông', lat: 12.0042, lng: 107.6907 },
  { name: 'Lâm Đồng', lat: 11.9404, lng: 108.4583 },
  { name: 'Bình Phước', lat: 11.5349, lng: 106.8832 },
  { name: 'Tây Ninh', lat: 11.31, lng: 106.0983 },
  { name: 'Bình Dương', lat: 10.9804, lng: 106.6519 },
  { name: 'Đồng Nai', lat: 10.9574, lng: 106.8426 },
  { name: 'Bà Rịa - Vũng Tàu', lat: 10.4963, lng: 107.1685 },
  { name: 'TP. Hồ Chí Minh', lat: 10.7769, lng: 106.7009 },
  { name: 'Long An', lat: 10.5359, lng: 106.4137 },
  { name: 'Tiền Giang', lat: 10.36, lng: 106.36 },
  { name: 'Bến Tre', lat: 10.2434, lng: 106.3756 },
  { name: 'Trà Vinh', lat: 9.9347, lng: 106.3453 },
  { name: 'Vĩnh Long', lat: 10.2537, lng: 105.9722 },
  { name: 'Đồng Tháp', lat: 10.4604, lng: 105.6329 },
  { name: 'An Giang', lat: 10.3864, lng: 105.4352 },
  { name: 'Kiên Giang', lat: 10.0125, lng: 105.0809 },
  { name: 'Cần Thơ', lat: 10.0452, lng: 105.7469 },
  { name: 'Hậu Giang', lat: 9.7845, lng: 105.4701 },
  { name: 'Sóc Trăng', lat: 9.6025, lng: 105.9739 },
  { name: 'Bạc Liêu', lat: 9.2941, lng: 105.7278 },
  { name: 'Cà Mau', lat: 9.1769, lng: 105.1524 },
];

export const NEW_PROVINCES: ProvincePlace[] = [
  { name: 'Hà Nội', lat: 21.0285, lng: 105.8542 },
  { name: 'Huế', lat: 16.4637, lng: 107.5909, from: ['Thừa Thiên Huế'] },
  { name: 'Lai Châu', lat: 22.3964, lng: 103.4582 },
  { name: 'Điện Biên', lat: 21.386, lng: 103.023 },
  { name: 'Sơn La', lat: 21.3256, lng: 103.9188 },
  { name: 'Lạng Sơn', lat: 21.8537, lng: 106.7615 },
  { name: 'Quảng Ninh', lat: 20.9517, lng: 107.08 },
  { name: 'Thanh Hóa', lat: 19.8075, lng: 105.7764 },
  { name: 'Nghệ An', lat: 18.6796, lng: 105.6813 },
  { name: 'Hà Tĩnh', lat: 18.3428, lng: 105.9057 },
  { name: 'Cao Bằng', lat: 22.6657, lng: 106.257 },
  { name: 'Tuyên Quang', lat: 21.8236, lng: 105.214, from: ['Tuyên Quang', 'Hà Giang'] },
  { name: 'Lào Cai', lat: 21.7229, lng: 104.9113, from: ['Lào Cai', 'Yên Bái'] },
  { name: 'Thái Nguyên', lat: 21.5942, lng: 105.848, from: ['Thái Nguyên', 'Bắc Kạn'] },
  { name: 'Phú Thọ', lat: 21.3227, lng: 105.402, from: ['Phú Thọ', 'Vĩnh Phúc', 'Hòa Bình'] },
  { name: 'Bắc Ninh', lat: 21.2731, lng: 106.1946, from: ['Bắc Ninh', 'Bắc Giang'] },
  { name: 'Hưng Yên', lat: 20.6464, lng: 106.0511, from: ['Hưng Yên', 'Thái Bình'] },
  { name: 'Hải Phòng', lat: 20.8449, lng: 106.6881, from: ['Hải Phòng', 'Hải Dương'] },
  { name: 'Ninh Bình', lat: 20.2506, lng: 105.9745, from: ['Ninh Bình', 'Hà Nam', 'Nam Định'] },
  { name: 'Quảng Trị', lat: 17.4689, lng: 106.6223, from: ['Quảng Trị', 'Quảng Bình'] },
  { name: 'Đà Nẵng', lat: 16.0544, lng: 108.2022, from: ['Đà Nẵng', 'Quảng Nam'] },
  { name: 'Quảng Ngãi', lat: 15.1205, lng: 108.7923, from: ['Quảng Ngãi', 'Kon Tum'] },
  { name: 'Gia Lai', lat: 13.7765, lng: 109.2237, from: ['Gia Lai', 'Bình Định'] },
  { name: 'Khánh Hòa', lat: 12.2388, lng: 109.1967, from: ['Khánh Hòa', 'Ninh Thuận'] },
  { name: 'Lâm Đồng', lat: 11.9404, lng: 108.4583, from: ['Lâm Đồng', 'Đắk Nông', 'Bình Thuận'] },
  { name: 'Đắk Lắk', lat: 12.6667, lng: 108.05, from: ['Đắk Lắk', 'Phú Yên'] },
  { name: 'TP. Hồ Chí Minh', lat: 10.7769, lng: 106.7009, from: ['TP. Hồ Chí Minh', 'Bình Dương', 'Bà Rịa - Vũng Tàu'] },
  { name: 'Đồng Nai', lat: 10.9574, lng: 106.8426, from: ['Đồng Nai', 'Bình Phước'] },
  { name: 'Tây Ninh', lat: 10.5359, lng: 106.4137, from: ['Tây Ninh', 'Long An'] },
  { name: 'Cần Thơ', lat: 10.0452, lng: 105.7469, from: ['Cần Thơ', 'Sóc Trăng', 'Hậu Giang'] },
  { name: 'Vĩnh Long', lat: 10.2537, lng: 105.9722, from: ['Vĩnh Long', 'Bến Tre', 'Trà Vinh'] },
  { name: 'Đồng Tháp', lat: 10.36, lng: 106.36, from: ['Đồng Tháp', 'Tiền Giang'] },
  { name: 'Cà Mau', lat: 9.1769, lng: 105.1524, from: ['Cà Mau', 'Bạc Liêu'] },
  { name: 'An Giang', lat: 10.0125, lng: 105.0809, from: ['An Giang', 'Kiên Giang'] },
];

/** The new province an old one became part of. */
export const newProvinceOf = (oldName: string) =>
  NEW_PROVINCES.find((p) => (p.from ?? [p.name]).includes(oldName))?.name;

/** Alphabetical, the Vietnamese way, with "TP." left out of the order. */
export const byProvinceName = (a: ProvincePlace, b: ProvincePlace) =>
  a.name.replace(/^TP\.\s*/, '').localeCompare(b.name.replace(/^TP\.\s*/, ''), 'vi');
