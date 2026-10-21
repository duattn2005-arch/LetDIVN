# Let's Do It Vietnam: Website plugins

Mã nguồn các plugin WordPress tự viết cho website **Let's Do It Vietnam** ([letsdoitvietnam.org](https://letsdoitvietnam.org)).

![WordPress](https://img.shields.io/badge/WordPress-5.8%2B-21759b?logo=wordpress)
![PHP](https://img.shields.io/badge/PHP-7.4%2B-777bb4?logo=php)
![License](https://img.shields.io/badge/license-GPLv2%2B-green)

| Plugin | Phiên bản | Chức năng |
|---|---|---|
| [LDIVN Cleanup Map](plugins/ldivn-cleanup-map/) | 1.18.0 | Bản đồ dọn rác, form tình nguyện viên, thống kê, video, footer, menu của website |
| [LDIVN Guard](plugins/ldivn-guard/) | 1.0.0 | Giám sát file PHP, cảnh báo Administrator mới, gia cố bảo mật cơ bản |

## Cấu trúc

```
.
├── plugins/
│   ├── ldivn-cleanup-map/   # Bản đồ, tình nguyện viên, các khối giao diện
│   └── ldivn-guard/         # Plugin bảo mật (monitor, hardening, trang quản trị)
├── tools/
│   ├── wpress_extract.py    # Giải nén file sao lưu .wpress (All-in-One WP Migration)
│   └── scan_site.py         # Quét mã độc tĩnh trên site đã giải nén
├── tests/
│   └── test_guard.php       # Test LDIVN Guard với WordPress giả lập
└── docs/
    └── HUONG-DAN-GUARD.md   # Hướng dẫn cài đặt và kiểm tra LDIVN Guard
```

## Cài plugin lên WordPress

WordPress cần file `.zip` cho **từng plugin**, với thư mục plugin nằm ngay trong zip. Từ thư mục gốc repo:

```bash
cd plugins
zip -r ldivn-cleanup-map.zip ldivn-cleanup-map
zip -r ldivn-guard.zip ldivn-guard
```

Trên Windows: chuột phải thư mục plugin → **Send to → Compressed (zipped) folder**.

Sau đó vào **Plugins → Add New Plugin → Upload Plugin**, chọn file zip, rồi bấm **Install Now → Activate**.

- Bản đồ: xem [plugins/ldivn-cleanup-map/README.md](plugins/ldivn-cleanup-map/README.md)
- Guard: xem [docs/HUONG-DAN-GUARD.md](docs/HUONG-DAN-GUARD.md)

## Công cụ quét bản sao lưu

Cần Python 3. Các công cụ này chỉ đọc file, không chạy file nào của site:

```bash
python -I tools/wpress_extract.py <file.wpress> site
python -I tools/scan_site.py site bao_cao.md --month 2026-10
```

> Không commit thư mục `site/`, file `.wpress` hay `bao_cao*.md` lên GitHub vì chúng chứa database và cấu hình của website. `.gitignore` đã chặn sẵn các file này.

## Chạy test

```bash
php -d error_reporting=-1 tests/test_guard.php
```

## Giấy phép

[GPLv2 or later](https://www.gnu.org/licenses/gpl-2.0.html). Leaflet theo giấy phép riêng tại `plugins/ldivn-cleanup-map/assets/vendor/leaflet/LICENSE`.
