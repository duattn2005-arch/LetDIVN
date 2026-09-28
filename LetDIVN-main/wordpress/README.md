# Bản WordPress của letsdoitvietnam

Giao diện giống hệt bản Node vì dùng chung code React trong `src/`. WordPress lo phần nội dung, trang quản trị và SEO (Yoast).

- `letsdoitvietnam/`: theme. Mọi địa chỉ đều hiện app React đã build trong `dist/`.
- `ldivn-core/`: plugin, gồm:
  - các mục nội dung (Sự kiện, Đối tác, Đội ngũ, Videos, What We Do, Who We Are, Media on Us);
  - ô chữ và ảnh của từng trang, trang "Thông tin chung";
  - API `/api/*` trả dữ liệu giống hệt server Node;
  - lưu đăng ký tình nguyện viên và tin nhắn liên hệ, ghi Google Sheets;
  - lệnh nhập dữ liệu `wp ldivn import`.
- Plugin cần có: **Secure Custom Fields**, **Yoast SEO**, **Classic Editor**.

## Build

```sh
npm run build:wp
```

Lệnh này làm hai việc:
- sinh `ldivn-core/schema.json` từ `public/admin/decap/config.yml`;
- build app vào `letsdoitvietnam/dist/`. Các đường dẫn `/images/...` trong code được đổi sang thư mục theme, và chỉ những file ảnh thật sự dùng mới được chép vào.

Sau đó chép `ldivn-core/` vào `wp-content/plugins/` và `letsdoitvietnam/` vào `wp-content/themes/`.

## Nhập nội dung

```sh
wp --user=1 ldivn import --src=/đường/dẫn/LetDIVN-main --live=https://letsdoitvietnam.online
```

Lệnh nhập gồm:
- tin tức, trang, sự kiện, đối tác, ảnh... từ `content/` và `public/`;
- số người đã đăng ký từng sự kiện, lấy từ website đang chạy.

Chạy lại bao nhiêu lần cũng được: lần sau chỉ cập nhật những gì lần trước đã tạo. Muốn chuyển cả đơn đăng ký và tin nhắn cũ từ SQLite thì thêm `--submissions=file.json`, với nội dung dạng `{volunteers: [...], contacts: [...]}`.
