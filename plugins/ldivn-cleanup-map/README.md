# LDIVN Cleanup Map

Plugin WordPress của **Let's Do It Vietnam**: bản đồ điểm dọn rác toàn quốc, form đăng ký tình nguyện viên và các khối giao diện của website.

![Version](https://img.shields.io/badge/version-1.18.0-blue)
![WordPress](https://img.shields.io/badge/WordPress-5.8%2B-21759b?logo=wordpress)
![PHP](https://img.shields.io/badge/PHP-7.4%2B-777bb4?logo=php)

## Tính năng

**Bản đồ dọn rác**
- Bản đồ Leaflet với 3 lớp nền: Streets / Satellite / Terrain, có nút về toàn cảnh Việt Nam.
- Danh sách tỉnh theo đơn vị hành chính Mới (34) / Cũ (63); tỉnh có sự kiện có chấm xanh nhấp nháy.
- Ghim cho 9 nhóm địa phương; tìm kiếm có gợi ý (Nominatim + Photon) và vẽ đường viền nơi tìm được.
- Lọc theo năm, sự kiện đã qua tự ẩn. Dán link Google Maps để lấy toạ độ.
- Có thể chuyển các sự kiện từ website letsdoitvietnam.online về site này (kèm ảnh).

**Tình nguyện viên**
- Form "Register to Volunteer" mở từ nút Register trên bản đồ, từ link `#volunteer`, hoặc từ trang `/volunteer/`.
- Sửa form ngay trong admin: chữ, ảnh, vai trò, thứ tự các trường.
- Xem danh sách đăng ký ở menu **Tình nguyện viên** và xuất file Excel (.xlsx).

**Khối giao diện website**
- Thống kê World Cleanup Day theo năm (tình nguyện viên, lượng rác, báo chí).
- Khối video YouTube (danh sách bên trái, trình phát bên phải).
- Thanh tin mới nhất chạy trên đầu trang, bong bóng liên hệ góc phải, footer theo màu website.
- Mục menu có ghim cho trang bản đồ, nút hồng cho `#volunteer`.
- Thẻ tin tức bo góc cho widget Posts của Elementor, căn đều hai bên đoạn văn.
- Tự đổi tên "Media On Us" thành "Media Coverage" (chỉ chạy một lần).

## Cài đặt

1. Nén thư mục `ldivn-cleanup-map` thành `ldivn-cleanup-map.zip` (thư mục nằm ngay trong zip).
2. **Plugins → Add New Plugin → Upload Plugin**, chọn file zip, rồi bấm **Install Now → Activate**.
3. Thêm điểm ở menu **Bản đồ dọn rác → Thêm điểm**, chỉnh mặc định ở **Bản đồ dọn rác → Cài đặt**.

## Shortcode

| Shortcode | Chức năng |
|---|---|
| `[ldivn_cleanup_map]` | Bản đồ dọn rác |
| `[ldivn_volunteer_form]` | Form đăng ký tình nguyện viên đặt trực tiếp trong trang |
| `[ldivn_volunteer_button]` | Nút mở form đăng ký |
| `[ldivn_wcd_stats]` | Thống kê World Cleanup Day |
| `[ldivn_videos]` | Khối video |

Tuỳ chọn của `[ldivn_cleanup_map]`:

| Tham số | Ví dụ | Mô tả |
|---|---|---|
| `fullwidth` | `yes` | Tràn hết chiều ngang màn hình |
| `height` | `700px` | Chiều cao (mặc định `calc(100vh - 80px)`) |
| `year` | `2026` | Năm mở sẵn (mặc định năm hiện tại) |
| `scheme` | `old` | Mở sẵn danh sách 63 tỉnh cũ |
| `title`, `subtitle` | `"..."` | Đổi tiêu đề và dòng mô tả |

## REST API

| Endpoint | Chức năng |
|---|---|
| `GET /wp-json/ldivn-map/v1/geocode/search` | Tìm địa điểm (Nominatim) |
| `GET /wp-json/ldivn-map/v1/geocode/reverse` | Toạ độ → địa chỉ |
| `GET /wp-json/ldivn-map/v1/geocode/photon` | Gợi ý nhanh (Photon) |
| `GET /wp-json/ldivn-map/v1/gmaps` | Lấy toạ độ từ link Google Maps |

## Cấu trúc

```
ldivn-cleanup-map/
├── ldivn-cleanup-map.php     # File chính, cài đặt mặc định
├── includes/
│   ├── spots.php  settings.php  shortcode.php  rest.php  import.php  samples.php   # Bản đồ
│   ├── volunteer.php  volunteer-form.php  xlsx.php                                 # Tình nguyện viên
│   └── stats.php  videos.php  latest.php  bubble.php  footer.php  menu.php  news.php  justify.php  media-coverage.php
├── templates/volunteer-page.php
└── assets/  css/  js/  images/  vendor/leaflet/
```

## Giấy phép

GPLv2 or later. Leaflet theo giấy phép riêng tại `assets/vendor/leaflet/LICENSE`. Dữ liệu bản đồ © OpenStreetMap contributors.
