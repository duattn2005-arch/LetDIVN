# LDIVN Guard — hướng dẫn cài đặt và kiểm tra

## Trước khi cài

- Nếu website vẫn hiện "critical error" vì file `mu-plugins/wp-utilities-mxds.php` thì wp-admin cũng không vào được, nên không cài được plugin. Chỉ người có FTP/cPanel (nhà cung cấp hosting) mới gỡ được file này, vì WordPress không có nút xoá mu-plugin.
- Plugin này **không diệt mã độc**. Nó chỉ phát hiện thay đổi từ lúc cài trở đi, và hiển thị những gì đang có sẵn để bạn tự đối chiếu.

## Cài đặt

1. Vào wp-admin, mở **Plugin → Cài mới → Tải plugin lên**, chọn `ldivn-guard.zip` rồi bấm **Cài đặt → Kích hoạt**.
2. Vào **Cài đặt → Tổng quan**, kiểm tra **Địa chỉ email quản trị**. Đây là email nhận cảnh báo, và kẻ tấn công có thể đã đổi nó.
3. Vào **Công cụ → LDIVN Guard**. Sau khoảng 1 phút và một lượt có người truy cập web, dòng "Số file đang theo dõi" sẽ có số. Muốn chạy ngay thì bấm **Quét ngay**.

## Kiểm tra sau khi cài (khoảng 5 phút)

| Kiểm tra | Cách làm | Kết quả đúng |
|---|---|---|
| Chặn PHP trong uploads | Bấm **Kiểm tra chặn PHP trong uploads** | `AN TOÀN ... HTTP 403` |
| XML-RPC | Mở `https://letsdoitvietnam.org/xmlrpc.php` | Trang báo `XML-RPC is disabled.` |
| Dò user bằng ?author= | Mở trình duyệt ẩn danh, vào `https://letsdoitvietnam.org/?author=1` | Bị chuyển về trang chủ |
| Dò user qua REST | Mở trình duyệt ẩn danh, vào `https://letsdoitvietnam.org/wp-json/wp/v2/users` | Lỗi `rest_no_route` (404) |
| Trình sửa file | Mở menu Giao diện / Plugin | Không còn mục "Trình sửa file" |
| Giới hạn đăng nhập | Mở trình duyệt ẩn danh, đăng nhập sai 5 lần | Lần sau báo "thử lại sau … phút" (chính bạn cũng bị khoá 15 phút theo IP, nên thử từ mạng 4G) |
| Email cảnh báo | Tạo thử một user Administrator, rồi xoá | Nhận email "Có Administrator mới" và thấy thông báo đỏ trong wp-admin |

Nếu không nhận được email, có thể hosting không gửi được mail. Hãy cài thêm WP Mail SMTP.

## Sử dụng hằng ngày

- **Thông báo đỏ** xuất hiện khi có file `.php`, `.htaccess` hoặc `.user.ini` mới, bị sửa hay bị xoá trong mu-plugins, plugins, themes, uploads, hoặc khi có thêm tài khoản quản trị.
- Sau khi **tự cập nhật** plugin/theme, hãy đọc qua danh sách cảnh báo rồi bấm **Đánh dấu là an toàn**. Nếu danh sách có file bạn không giải thích được (nhất là trong `mu-plugins` hoặc `uploads`), **đừng** bấm nút này mà gửi danh sách cho người có quyền FTP kiểm tra.
- Trên trang có sẵn các danh sách: mu-plugins, plugin không có trên wordpress.org, file PHP trong uploads, các tài khoản quản trị (đọc thẳng từ database nên vẫn thấy cả admin đã bị ẩn khỏi trang Người dùng).

## Tắt hoặc gỡ plugin

- **Tắt plugin:** gỡ lịch quét và gỡ đoạn chặn PHP trong `uploads/.htaccess`. Nội dung khác trong file đó được giữ nguyên; nếu file do plugin tạo ra thì xoá luôn file. Danh sách hash và cảnh báo vẫn được giữ lại.
- **Xoá plugin:** dọn sạch luôn dữ liệu đã lưu.

## Giới hạn cần biết

- Ai có quyền ghi file hoặc quyền admin thì vẫn tắt hay sửa được plugin này. Chưa đổi mật khẩu và chưa dọn mã độc thì plugin chỉ giúp phát hiện.
- Việc khoá đăng nhập theo IP dùng `REMOTE_ADDR`. Nếu site chạy sau Cloudflare, mọi người dùng chung IP của Cloudflare, nên một người nhập sai 5 lần sẽ khoá tất cả. Trường hợp đó hãy báo lại để sửa.
- Chặn XML-RPC sẽ làm ngừng hoạt động ứng dụng WordPress trên điện thoại và Jetpack (nếu có dùng).
- WP-Cron chỉ chạy khi có người truy cập web. Web vắng khách thì việc quét có thể trễ hơn 1 giờ.

## Phần 1: quét file sao lưu .wpress (chạy trên máy tính, không chạy PHP)

1. Xuất bản sao lưu bằng All-in-One WP Migration (**Xuất → Tệp**) và tải file `.wpress` về.
2. Giải nén:
   `python -I tools\wpress_extract.py <file.wpress> site`
3. Quét:
   `python -I tools\scan_site.py site bao_cao.md --month 2026-10`
4. Mở `bao_cao.md`. Báo cáo gồm bảng Mức độ | Plugin | File | Dòng | Mô tả | Đề xuất, danh sách file sửa trong tháng 10, và số phát hiện theo từng plugin.

Windows Defender có thể chặn hoặc xoá webshell khi giải nén. Các file bị chặn sẽ hiện "KHÔNG GHI ĐƯỢC" (lúc giải nén) hoặc "Không đọc được" (lúc quét), và tự chúng đã là dấu hiệu mã độc.
