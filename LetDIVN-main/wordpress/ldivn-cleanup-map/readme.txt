=== LDIVN Cleanup Map ===
Contributors: letsdoitvietnam
Tags: map, leaflet, cleanup, events, vietnam
Requires at least: 5.8
Tested up to: 6.8
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later

Bản đồ điểm dọn rác toàn quốc (Nationwide Cleanup Spot Map) của Let's Do It Vietnam.

== Description ==

* Bản đồ Leaflet: Streets / Satellite / Terrain, phóng to/thu nhỏ, nút về toàn cảnh Việt Nam.
* Cột trái: danh sách tỉnh Mới (34) / Cũ (63); tỉnh có sự kiện có chấm xanh nhấp nháy, bấm vào thì bay tới và mở sự kiện.
* Ghim hồng cho 9 nhóm địa phương; tỉnh có sự kiện thì ghim nhảy lên. Sự kiện ở nơi khác có ghim riêng.
* Ô tìm kiếm: gợi ý khi gõ (Nominatim + Photon), vẽ đường viền đỏ nét đứt quanh nơi tìm được.
* Lọc theo năm; sự kiện qua ngày thì tự ẩn.

== Installation ==

1. Plugins → Add New Plugin → Upload Plugin → chọn file ldivn-cleanup-map.zip → Install Now → Activate.
2. Vào menu "Bản đồ dọn rác" → "Thêm điểm": nhập tên, ngày, địa điểm, bấm lên bản đồ để ghim, chọn ảnh sự kiện → Đăng.
3. Tạo/sửa một trang, thêm khối Shortcode với nội dung: [ldivn_cleanup_map fullwidth="yes"]

== Shortcode ==

[ldivn_cleanup_map] với các tuỳ chọn:
* fullwidth="yes" – tràn hết chiều ngang màn hình
* height="700px" – chiều cao (mặc định calc(100vh - 80px))
* year="2026" – năm mở sẵn (mặc định năm nay)
* scheme="old" – mở sẵn danh sách 63 tỉnh cũ
* title="..." subtitle="..." – đổi tiêu đề và dòng mô tả

== Changelog ==

= 1.0.0 =
* Bản đầu tiên.
