export interface DistrictItem {
  id: string;
  name: string;
}

export interface ProvinceItem {
  id: string;
  name: string;
  center: [number, number]; // [lat, lng]
  districts: DistrictItem[];
}

export const VIETNAM_PROVINCES_DATA: ProvinceItem[] = [
  {
    id: 'hanoi',
    name: 'Hà Nội',
    center: [21.0285, 105.8542],
    districts: [
      { id: 'hn-all', name: 'Tất cả' },
      { id: 'hn-badinh', name: 'Ba Đình' },
      { id: 'hn-bavi', name: 'Ba Vì' },
      { id: 'hn-bactuliem', name: 'Bắc Từ Liêm' },
      { id: 'hn-caugiay', name: 'Cầu Giấy' },
      { id: 'hn-chuongmy', name: 'Chương Mỹ' },
      { id: 'hn-danphuong', name: 'Đan Phượng' },
      { id: 'hn-donganh', name: 'Đông Anh' },
      { id: 'hn-dongda', name: 'Đống Đa' },
      { id: 'hn-gialam', name: 'Gia Lâm' },
      { id: 'hn-hadong', name: 'Hà Đông' },
      { id: 'hn-haibatrung', name: 'Hai Bà Trưng' },
      { id: 'hn-hoaiduc', name: 'Hoài Đức' },
      { id: 'hn-hoankiem', name: 'Hoàn Kiếm' },
      { id: 'hn-hoangmai', name: 'Hoàng Mai' },
      { id: 'hn-longbien', name: 'Long Biên' },
      { id: 'hn-melinh', name: 'Mê Linh' },
      { id: 'hn-myduc', name: 'Mỹ Đức' },
      { id: 'hn-namtuliem', name: 'Nam Từ Liêm' },
      { id: 'hn-phuxuyen', name: 'Phú Xuyên' },
      { id: 'hn-phuctho', name: 'Phúc Thọ' },
      { id: 'hn-quocoai', name: 'Quốc Oai' },
      { id: 'hn-socson', name: 'Sóc Sơn' },
      { id: 'hn-sontay', name: 'Sơn Tây' },
      { id: 'hn-tayho', name: 'Tây Hồ' },
      { id: 'hn-thachthat', name: 'Thạch Thất' },
      { id: 'hn-thanhoai', name: 'Thanh Oai' },
      { id: 'hn-thanhtri', name: 'Thanh Trì' },
      { id: 'hn-thanhxuan', name: 'Thanh Xuân' },
      { id: 'hn-thuongtin', name: 'Thường Tín' },
      { id: 'hn-ungnhoa', name: 'Ứng Hòa' }
    ]
  },
  {
    id: 'hcm',
    name: 'Hồ Chí Minh',
    center: [10.8231, 106.6297],
    districts: [
      { id: 'hcm-all', name: 'Tất cả' },
      { id: 'hcm-q1', name: 'Quận 1' },
      { id: 'hcm-q3', name: 'Quận 3' },
      { id: 'hcm-q4', name: 'Quận 4' },
      { id: 'hcm-q5', name: 'Quận 5' },
      { id: 'hcm-q6', name: 'Quận 6' },
      { id: 'hcm-q7', name: 'Quận 7' },
      { id: 'hcm-q8', name: 'Quận 8' },
      { id: 'hcm-q10', name: 'Quận 10' },
      { id: 'hcm-q11', name: 'Quận 11' },
      { id: 'hcm-q12', name: 'Quận 12' },
      { id: 'hcm-thuduc', name: 'Thành phố Thủ Đức' },
      { id: 'hcm-binhtan', name: 'Bình Tân' },
      { id: 'hcm-binhthanh', name: 'Bình Thạnh' },
      { id: 'hcm-govap', name: 'Gò Vấp' },
      { id: 'hcm-phunhuan', name: 'Phú Nhuận' },
      { id: 'hcm-tanbinh', name: 'Tân Bình' },
      { id: 'hcm-tanphu', name: 'Tân Phú' },
      { id: 'hcm-binhchanh', name: 'Bình Chánh' },
      { id: 'hcm-cangio', name: 'Cần Giờ' },
      { id: 'hcm-cuchi', name: 'Củ Chi' },
      { id: 'hcm-hocmon', name: 'Hóc Môn' },
      { id: 'hcm-nhabe', name: 'Nhà Bè' }
    ]
  },
  {
    id: 'danang',
    name: 'Đà Nẵng',
    center: [16.0544, 108.2022],
    districts: [
      { id: 'danang-all', name: 'Tất cả' },
      { id: 'danang-sontra', name: 'Sơn Trà (Bán đảo Sơn Trà)' },
      { id: 'danang-haichau', name: 'Hải Châu' },
      { id: 'danang-thanhkhe', name: 'Thanh Khê' },
      { id: 'danang-nguhanhson', name: 'Ngũ Hành Sơn' },
      { id: 'danang-lienchieu', name: 'Liên Chiểu' },
      { id: 'danang-camle', name: 'Cẩm Lệ' },
      { id: 'danang-hoavang', name: 'Hòa Vang' },
      { id: 'danang-hoangsa', name: 'Hoàng Sa' }
    ]
  },
  {
    id: 'haiphong',
    name: 'Hải Phòng',
    center: [20.8449, 106.6881],
    districts: [
      { id: 'hp-all', name: 'Tất cả' },
      { id: 'hp-hongbang', name: 'Hồng Bàng' },
      { id: 'hp-ngoquyen', name: 'Ngô Quyền' },
      { id: 'hp-lechan', name: 'Lê Chân' },
      { id: 'hp-haian', name: 'Hải An' },
      { id: 'hp-kiendan', name: 'Kiến An' },
      { id: 'hp-doson', name: 'Đồ Sơn' },
      { id: 'hp-duongkinh', name: 'Dương Kinh' },
      { id: 'hp-thuynguyen', name: 'Thủy Nguyên' },
      { id: 'hp-anduu', name: 'An Dương' },
      { id: 'hp-anlao', name: 'An Lão' },
      { id: 'hp-kienphu', name: 'Kiến Thụy' },
      { id: 'hp-tienlang', name: 'Tiên Lãng' },
      { id: 'hp-vinhbao', name: 'Vĩnh Bảo' },
      { id: 'hp-catba', name: 'Cát Hải (Cát Bà)' },
      { id: 'hp-bachlongvy', name: 'Bạch Long Vĩ' }
    ]
  },
  {
    id: 'cantho',
    name: 'Cần Thơ',
    center: [10.0452, 105.7469],
    districts: [
      { id: 'ct-all', name: 'Tất cả' },
      { id: 'ct-ninhkieu', name: 'Ninh Kiều' },
      { id: 'ct-binhthuy', name: 'Bình Thủy' },
      { id: 'ct-cairang', name: 'Cái Răng' },
      { id: 'ct-omon', name: 'Ô Môn' },
      { id: 'ct-thotnot', name: 'Thốt Nốt' },
      { id: 'ct-phongdien', name: 'Phong Điền' },
      { id: 'ct-thoilai', name: 'Thới Lai' },
      { id: 'ct-codo', name: 'Cờ Đỏ' },
      { id: 'ct-vinhthanh', name: 'Vĩnh Thạnh' }
    ]
  },
  {
    id: 'ninhbinh',
    name: 'Ninh Bình',
    center: [20.2506, 105.9745],
    districts: [
      { id: 'nb-all', name: 'Tất cả' },
      { id: 'nb-tp', name: 'TP. Ninh Bình' },
      { id: 'nb-tamdiep', name: 'TP. Tam Điệp' },
      { id: 'nb-hoalu', name: 'Hoa Lư (Tràng An)' },
      { id: 'nb-giavien', name: 'Gia Viễn' },
      { id: 'nb-nhoguan', name: 'Nho Quan (Cúc Phương)' },
      { id: 'nb-yenmo', name: 'Yên Mô' },
      { id: 'nb-yenkanh', name: 'Yên Khánh' },
      { id: 'nb-kimson', name: 'Kim Sơn (Phát Diệm)' }
    ]
  },
  {
    id: 'namdinh',
    name: 'Nam Định',
    center: [20.4200, 106.1683],
    districts: [
      { id: 'nd-all', name: 'Tất cả' },
      { id: 'nd-tp', name: 'TP. Nam Định' },
      { id: 'nd-giaothuy', name: 'Giao Thủy (Quất Lâm - Xuân Thủy)' },
      { id: 'nd-haihau', name: 'Hải Hậu (Hải Thịnh)' },
      { id: 'nd-nghiahung', name: 'Nghĩa Hưng' },
      { id: 'nd-namtruc', name: 'Nam Trực' },
      { id: 'nd-trucninh', name: 'Trực Ninh' },
      { id: 'nd-xuantruong', name: 'Xuân Trường' },
      { id: 'nd-vuban', name: 'Vụ Bản' },
      { id: 'nd-yyen', name: 'Ý Yên' },
      { id: 'nd-myloc', name: 'Mỹ Lộc' }
    ]
  },
  {
    id: 'quangninh',
    name: 'Quảng Ninh',
    center: [21.0064, 107.2925],
    districts: [
      { id: 'qn-all', name: 'Tất cả' },
      { id: 'qn-halong', name: 'TP. Hạ Long' },
      { id: 'qn-campha', name: 'TP. Cẩm Phả' },
      { id: 'qn-uongbi', name: 'TP. Uông Bí (Yên Tử)' },
      { id: 'qn-mongcai', name: 'TP. Móng Cái (Trà Cổ)' },
      { id: 'qn-dongtrieu', name: 'Đông Triều' },
      { id: 'qn-quangyen', name: 'Quảng Yên' },
      { id: 'qn-vandon', name: 'Vân Đồn' },
      { id: 'qn-coto', name: 'Cô Tô' },
      { id: 'qn-tiendong', name: 'Tiên Yên' },
      { id: 'qn-ha-coi', name: 'Hải Hà' },
      { id: 'qn-binhlieu', name: 'Bình Liêu' }
    ]
  },
  {
    id: 'khanhhoa',
    name: 'Khánh Hòa',
    center: [12.2388, 109.1967],
    districts: [
      { id: 'kh-all', name: 'Tất cả' },
      { id: 'kh-nhatrang', name: 'TP. Nha Trang' },
      { id: 'kh-camranh', name: 'TP. Cam Ranh' },
      { id: 'kh-ninhhoa', name: 'Thị xã Ninh Hòa' },
      { id: 'kh-vanphong', name: 'Vạn Ninh (Bắc Vân Phong)' },
      { id: 'kh-dienkhanh', name: 'Diên Khánh' },
      { id: 'kh-camlam', name: 'Cam Lâm' },
      { id: 'kh-khanhson', name: 'Khánh Sơn' },
      { id: 'kh-khanhvinh', name: 'Khánh Vĩnh' },
      { id: 'kh-truongsa', name: 'Huyện đảo Trường Sa' }
    ]
  },
  {
    id: 'lamdong',
    name: 'Lâm Đồng',
    center: [11.9404, 108.4583],
    districts: [
      { id: 'ld-all', name: 'Tất cả' },
      { id: 'ld-dalat', name: 'TP. Đà Lạt' },
      { id: 'ld-baoloc', name: 'TP. Bảo Lộc' },
      { id: 'ld-ductrong', name: 'Đức Trọng' },
      { id: 'ld-dilinh', name: 'Di Linh' },
      { id: 'ld-lacduong', name: 'Lạc Dương (Langbiang)' },
      { id: 'ld-donduong', name: 'Đơn Dương' },
      { id: 'ld-lamha', name: 'Lâm Hà' },
      { id: 'ld-baolam', name: 'Bảo Lâm' },
      { id: 'ld-dahuoai', name: 'Đạ Huoai' },
      { id: 'ld-dateh', name: 'Đạ Tẻh' },
      { id: 'ld-cat-tien', name: 'Cát Tiên' }
    ]
  },
  {
    id: 'binhduong',
    name: 'Bình Dương',
    center: [11.1348, 106.6667],
    districts: [
      { id: 'bd-all', name: 'Tất cả' },
      { id: 'bd-thudaumot', name: 'TP. Thủ Dầu Một' },
      { id: 'bd-dian', name: 'TP. Dĩ An' },
      { id: 'bd-thuanan', name: 'TP. Thuận An' },
      { id: 'bd-tanuyen', name: 'TP. Tân Uyên' },
      { id: 'bd-bencat', name: 'TP. Bến Cát' },
      { id: 'bd-baccatanuyen', name: 'Bắc Tân Uyên' },
      { id: 'bd-baubang', name: 'Bàu Bàng' },
      { id: 'bd-dautieng', name: 'Dầu Tiếng' },
      { id: 'bd-phugiao', name: 'Phú Giáo' }
    ]
  },
  {
    id: 'dongnai',
    name: 'Đồng Nai',
    center: [10.9574, 106.8427],
    districts: [
      { id: 'dn-all', name: 'Tất cả' },
      { id: 'dn-bienhoa', name: 'TP. Biên Hòa' },
      { id: 'dn-longkhanh', name: 'TP. Long Khánh' },
      { id: 'dn-longthanh', name: 'Long Thành (Sân bay)' },
      { id: 'dn-nhontrach', name: 'Nhơn Trạch' },
      { id: 'dn-trangbom', name: 'Trảng Bom' },
      { id: 'dn-thongnhat', name: 'Thống Nhất' },
      { id: 'dn-vinhcuu', name: 'Vĩnh Cửu (Trị An)' },
      { id: 'dn-cammy', name: 'Cẩm Mỹ' },
      { id: 'dn-xuanloc', name: 'Xuân Lộc' },
      { id: 'dn-dinhquan', name: 'Định Quán' },
      { id: 'dn-tanphu', name: 'Tân Phú' }
    ]
  },
  {
    id: 'bariavungtau',
    name: 'Bà Rịa - Vũng Tàu',
    center: [10.4967, 107.1689],
    districts: [
      { id: 'brvt-all', name: 'Tất cả' },
      { id: 'brvt-vungtau', name: 'TP. Vũng Tàu' },
      { id: 'brvt-baria', name: 'TP. Bà Rịa' },
      { id: 'brvt-phumy', name: 'Thị xã Phú Mỹ' },
      { id: 'brvt-longdien', name: 'Long Điền' },
      { id: 'brvt-datdo', name: 'Đất Đỏ' },
      { id: 'brvt-xuyenmoc', name: 'Xuyên Mộc (Hồ Tràm)' },
      { id: 'brvt-chauduc', name: 'Châu Đức' },
      { id: 'brvt-condao', name: 'Huyện Côn Đảo' }
    ]
  },
  {
    id: 'kiengiang',
    name: 'Kiên Giang',
    center: [10.0125, 105.0809],
    districts: [
      { id: 'kg-all', name: 'Tất cả' },
      { id: 'kg-phuquoc', name: 'TP. Phú Quốc' },
      { id: 'kg-rachgia', name: 'TP. Rạch Giá' },
      { id: 'kg-hatiên', name: 'TP. Hà Tiên' },
      { id: 'kg-kiendong', name: 'Kiên Lương' },
      { id: 'kg-hondat', name: 'Hòn Đất' },
      { id: 'kg-tanbiep', name: 'Tân Hiệp' },
      { id: 'kg-chauthanh', name: 'Châu Thành' },
      { id: 'kg-giongrieng', name: 'Giồng Riềng' },
      { id: 'kg-govao', name: 'Gò Quao' },
      { id: 'kg-anbien', name: 'An Biên' },
      { id: 'kg-anminh', name: 'An Minh' },
      { id: 'kg-vinhthuan', name: 'Vĩnh Thuận' },
      { id: 'kg-u-minh-thuong', name: 'U Minh Thượng' },
      { id: 'kg-kiengai', name: 'Kiên Hải' },
      { id: 'kg-giangthanh', name: 'Giang Thành' }
    ]
  },
  {
    id: 'thuathienhue',
    name: 'Thừa Thiên Huế',
    center: [16.4637, 107.5909],
    districts: [
      { id: 'tth-all', name: 'Tất cả' },
      { id: 'tth-hue', name: 'TP. Huế (Kinh Thành)' },
      { id: 'tth-huongthuy', name: 'Thị xã Hương Thủy' },
      { id: 'tth-huongtra', name: 'Thị xã Hương Trà' },
      { id: 'tth-phovang', name: 'Phú Vang' },
      { id: 'tth-phuloc', name: 'Phú Lộc (Lăng Cô)' },
      { id: 'tth-quangdien', name: 'Quảng Điền' },
      { id: 'tth-phongdien', name: 'Phong Điền' },
      { id: 'tth-namdong', name: 'Nam Đông' },
      { id: 'tth-aluoi', name: 'A Lưới' }
    ]
  },
  {
    id: 'quangnam',
    name: 'Quảng Nam',
    center: [15.5683, 108.1883],
    districts: [
      { id: 'qnam-all', name: 'Tất cả' },
      { id: 'qnam-hoian', name: 'TP. Hội An (Phố Cổ)' },
      { id: 'qnam-tamky', name: 'TP. Tam Kỳ' },
      { id: 'qnam-dienban', name: 'Thị xã Điện Bàn' },
      { id: 'qnam-duyxuyen', name: 'Duy Xuyên (Mỹ Sơn)' },
      { id: 'qnam-thangbinh', name: 'Thăng Bình' },
      { id: 'qnam-nuithanh', name: 'Núi Thành' }
    ]
  },
  {
    id: 'thanhhoa',
    name: 'Thanh Hóa',
    center: [19.8067, 105.7852],
    districts: [
      { id: 'th-all', name: 'Tất cả' },
      { id: 'th-tp', name: 'TP. Thanh Hóa' },
      { id: 'th-samson', name: 'TP. Sầm Sơn' },
      { id: 'th-nghison', name: 'Thị xã Nghi Sơn' },
      { id: 'th-bimson', name: 'Thị xã Bỉm Sơn' },
      { id: 'th-hoanghoa', name: 'Hoằng Hóa (Hải Tiến)' },
      { id: 'th-quangxuong', name: 'Quảng Xương' },
      { id: 'th-tinhgia', name: 'Nông Cống' },
      { id: 'th-trieuson', name: 'Triệu Sơn' },
      { id: 'th-thoxuan', name: 'Thọ Xuân (Lam Kinh)' },
      { id: 'th-camthuy', name: 'Cẩm Thủy (Suối Cá Thần)' },
      { id: 'th-bathuoc', name: 'Bá Thước (Pù Luông)' }
    ]
  },
  {
    id: 'nghean',
    name: 'Nghệ An',
    center: [18.6734, 105.6813],
    districts: [
      { id: 'na-all', name: 'Tất cả' },
      { id: 'na-vinh', name: 'TP. Vinh' },
      { id: 'na-cualo', name: 'Thị xã Cửa Lò' },
      { id: 'na-thaitoa', name: 'Thị xã Thái Hòa' },
      { id: 'na-hoangmai', name: 'Thị xã Hoàng Mai' },
      { id: 'na-namdan', name: 'Nam Đàn (Kim Liên)' },
      { id: 'na-dienchau', name: 'Diễn Châu' },
      { id: 'na-quynhluu', name: 'Quỳnh Lưu' },
      { id: 'na-nghiloc', name: 'Nghi Lộc' },
      { id: 'na-doluong', name: 'Đô Lương' },
      { id: 'na-thanhchuong', name: 'Thanh Chương' },
      { id: 'na-concuong', name: 'Con Cuông (Pù Mát)' }
    ]
  },
  {
    id: 'bacninh',
    name: 'Bắc Ninh',
    center: [21.1861, 106.0763],
    districts: [
      { id: 'bn-all', name: 'Tất cả' },
      { id: 'bn-tp', name: 'TP. Bắc Ninh' },
      { id: 'bn-tuson', name: 'TP. Từ Sơn' },
      { id: 'bn-quevo', name: 'Thị xã Quế Võ' },
      { id: 'bn-thuancanh', name: 'Thị xã Thuận Thành' },
      { id: 'bn-yenyong', name: 'Yên Phong' },
      { id: 'bn-tiendu', name: 'Tiên Du' },
      { id: 'bn-giabinh', name: 'Gia Bình' },
      { id: 'bn-luongtai', name: 'Lương Tài' }
    ]
  },
  {
    id: 'hungyen',
    name: 'Hưng Yên',
    center: [20.6464, 106.0511],
    districts: [
      { id: 'hy-all', name: 'Tất cả' },
      { id: 'hy-tp', name: 'TP. Hưng Yên (Phố Hiến)' },
      { id: 'hy-myhao', name: 'Thị xã Mỹ Hào' },
      { id: 'hy-vanlam', name: 'Văn Lâm' },
      { id: 'hy-vangiang', name: 'Văn Giang (Ecopark)' },
      { id: 'hy-yenmy', name: 'Yên Mỹ' },
      { id: 'hy-khoaichau', name: 'Khoái Châu' },
      { id: 'hy-antri', name: 'Ân Thi' },
      { id: 'hy-kimdong', name: 'Kim Động' },
      { id: 'hy-tiendong', name: 'Tiên Lữ' },
      { id: 'hy-phucu', name: 'Phù Cừ' }
    ]
  },
  {
    id: 'laocai',
    name: 'Lào Cai',
    center: [22.4856, 103.9707],
    districts: [
      { id: 'lc-all', name: 'Tất cả' },
      { id: 'lc-tp', name: 'TP. Lào Cai' },
      { id: 'lc-sapa', name: 'Thị xã Sa Pa (Fansipan)' },
      { id: 'lc-bac-ha', name: 'Bắc Hà' },
      { id: 'lc-bat-xat', name: 'Bát Xát (Y Tý)' },
      { id: 'lc-bao-yen', name: 'Bảo Yên' },
      { id: 'lc-bao-thang', name: 'Bảo Thắng' }
    ]
  }
];


