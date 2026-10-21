<?php
/**
 * a. Giám sát file .php (và .htaccess/.user.ini) bằng hash.
 * b. Cảnh báo khi có Administrator mới / user bị nâng quyền.
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('ldg_hourly_scan', 'ldg_run_scan');

/** Các thư mục được giám sát: mu-plugins, plugins, themes, uploads. */
function ldg_watch_dirs()
{
    $up   = wp_upload_dir(null, false);
    $dirs = array(WPMU_PLUGIN_DIR, WP_PLUGIN_DIR, get_theme_root(), $up['basedir']);
    return array_values(array_unique(array_filter(array_map('wp_normalize_path', $dirs), 'is_dir')));
}

/** File cần theo dõi: mọi đuôi PHP chạy được + file cấu hình máy chủ (kẻ tấn công hay sửa để cho chạy PHP). */
function ldg_is_watched_file($name)
{
    $n = strtolower($name);
    return $n === '.htaccess' || $n === '.user.ini' || (bool) preg_match('/\.(php\d?|phtml|pht|phar|phps)$/', $n);
}

/** Đường dẫn hiển thị: tương đối so với thư mục gốc WordPress, ví dụ wp-content/plugins/x/x.php. */
function ldg_rel_path($path)
{
    $base = trailingslashit(wp_normalize_path(ABSPATH));
    return strpos($path, $base) === 0 ? substr($path, strlen($base)) : $path;
}

/**
 * Duyệt đệ quy một thư mục, gọi $cb(đường_dẫn_tuyệt_đối, SplFileInfo) cho từng file khớp.
 * Không đi theo symlink thư mục; thư mục không đọc được thì bỏ qua.
 */
function ldg_walk($dir, $cb)
{
    try {
        $it = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS),
            RecursiveIteratorIterator::LEAVES_ONLY,
            RecursiveIteratorIterator::CATCH_GET_CHILD
        );
        foreach ($it as $f) {
            if ($f->isFile() && ldg_is_watched_file($f->getFilename())) {
                $cb(wp_normalize_path($f->getPathname()), $f);
            }
        }
    } catch (Exception $e) {
        // Thư mục gốc không mở được: bỏ qua, không làm hỏng lần quét
    }
}

/** Tính hash sha1 của mọi file theo dõi: [đường_dẫn => hash]. */
function ldg_collect_hashes()
{
    $out = array();
    foreach (ldg_watch_dirs() as $dir) {
        ldg_walk($dir, function ($path) use (&$out) {
            $h = @sha1_file($path);
            if ($h !== false) {
                $out[ldg_rel_path($path)] = $h;
            }
        });
    }
    return $out;
}

/** So sánh 2 danh sách hash: [đường_dẫn => 'new'|'modified'|'deleted']. */
function ldg_diff_hashes(array $old, array $new)
{
    $changes = array();
    foreach ($new as $p => $h) {
        if (!isset($old[$p])) {
            $changes[$p] = 'new';
        } elseif ($old[$p] !== $h) {
            $changes[$p] = 'modified';
        }
    }
    foreach ($old as $p => $h) {
        if (!isset($new[$p])) {
            $changes[$p] = 'deleted';
        }
    }
    return $changes;
}

function ldg_get_alerts()
{
    $a = get_option('ldg_alerts', array());
    return (is_array($a) ? $a : array()) + array('files' => array(), 'admins' => array());
}

/** Chống chạy chồng (cron + bấm nút cùng lúc). */
function ldg_lock()
{
    if (get_transient('ldg_scan_lock')) {
        return false;
    }
    set_transient('ldg_scan_lock', 1, 15 * MINUTE_IN_SECONDS);
    if (function_exists('set_time_limit')) {
        @set_time_limit(300);
    }
    return true;
}

/** Quét định kỳ. Trả về false nếu đang có lần quét khác chạy. */
function ldg_run_scan()
{
    if (!ldg_lock()) {
        return false;
    }
    $now = ldg_collect_hashes();
    $old = get_option('ldg_baseline', null);
    if (!is_array($old)) {
        update_option('ldg_baseline', $now, false); // lần đầu: lấy hiện trạng làm mốc
    } else {
        ldg_record_file_alerts(ldg_diff_hashes($old, $now));
    }
    ldg_check_admins();
    update_option('ldg_last_scan', time(), false);
    delete_transient('ldg_scan_lock');
    return true;
}

/**
 * Cảnh báo được cộng dồn tới khi bấm "Đánh dấu là an toàn"
 * (file độc bị tạo rồi tự xoá giữa 2 lần quét vẫn còn dấu vết). Chỉ gửi email cho thay đổi mới.
 */
function ldg_record_file_alerts(array $changes)
{
    $alerts = ldg_get_alerts();
    $fresh  = array();
    foreach ($changes as $p => $type) {
        if (!isset($alerts['files'][$p]) || $alerts['files'][$p]['type'] !== $type) {
            $alerts['files'][$p] = array('type' => $type, 'time' => time());
            $fresh[$p]           = $type;
        }
    }
    if (!$fresh) {
        return;
    }
    update_option('ldg_alerts', $alerts, false);

    $labels = ldg_change_labels();
    $lines  = array('Phát hiện ' . count($fresh) . ' file PHP/.htaccess mới hoặc bị sửa:', '');
    foreach (array_slice($fresh, 0, 100, true) as $p => $type) {
        $lines[] = '[' . $labels[$type] . '] ' . $p;
    }
    if (count($fresh) > 100) {
        $lines[] = '... và ' . (count($fresh) - 100) . ' file khác.';
    }
    $lines[] = '';
    $lines[] = 'Nếu chính bạn vừa cập nhật plugin/theme: vào trang LDIVN Guard và bấm "Đánh dấu là an toàn".';
    ldg_mail('Có file PHP mới/bị sửa', $lines);
}

function ldg_change_labels()
{
    return array('new' => 'MỚI', 'modified' => 'BỊ SỬA', 'deleted' => 'BỊ XOÁ');
}

/** "Đánh dấu là an toàn": lấy hiện trạng làm mốc mới và xoá mọi cảnh báo. */
function ldg_mark_safe()
{
    if (!ldg_lock()) {
        return false;
    }
    update_option('ldg_baseline', ldg_collect_hashes(), false);
    update_option('ldg_admins', ldg_current_admin_ids(), false);
    update_option('ldg_last_scan', time(), false);
    delete_option('ldg_alerts');
    delete_transient('ldg_scan_lock');
    return true;
}

function ldg_mail($subject, array $lines)
{
    $host = (string) wp_parse_url(home_url(), PHP_URL_HOST);
    $body = implode("\n", $lines) . "\n\nTrang quản lý: " . admin_url('tools.php?page=ldivn-guard');
    return wp_mail(get_option('admin_email'), '[LDIVN Guard][' . $host . '] ' . $subject, $body);
}

/* ------------------------------------------------------------------ */
/* b. Giám sát tài khoản quản trị                                      */
/* ------------------------------------------------------------------ */

/**
 * ID mọi user có quyền manage_options (gồm role tự chế và quyền gán thẳng cho user).
 * Đọc thẳng bảng usermeta thay vì get_users(): mã độc hay ẩn admin bằng filter pre_user_query.
 */
function ldg_current_admin_ids()
{
    global $wpdb;
    $names = array('manage_options');
    foreach (wp_roles()->roles as $role => $r) {
        if (!empty($r['capabilities']['manage_options'])) {
            $names[] = $role;
        }
    }
    $like = array();
    foreach ($names as $n) {
        $like[] = $wpdb->prepare('meta_value LIKE %s', '%' . $wpdb->esc_like('"' . $n . '"') . '%');
    }
    $rows = $wpdb->get_results($wpdb->prepare(
        "SELECT user_id, meta_value FROM {$wpdb->usermeta} WHERE meta_key = %s AND (" . implode(' OR ', $like) . ')',
        $wpdb->get_blog_prefix() . 'capabilities'
    ));
    $ids = array();
    foreach ((array) $rows as $row) {
        $caps = maybe_unserialize($row->meta_value);
        if (!is_array($caps)) {
            continue;
        }
        foreach ($names as $n) {
            if (!empty($caps[$n])) {
                $ids[] = (int) $row->user_id;
                break;
            }
        }
    }
    $ids = array_values(array_unique($ids));
    sort($ids);
    return $ids;
}

/**
 * So danh sách admin hiện tại với danh sách đã biết; admin mới -> cảnh báo + email.
 * Chạy ngay khi có thay đổi role (qua hook) và mỗi giờ (bắt cả trường hợp mã độc ghi thẳng vào database).
 */
function ldg_check_admins()
{
    $known = get_option('ldg_admins', null);
    $now   = ldg_current_admin_ids();
    if (!is_array($known)) {
        update_option('ldg_admins', $now, false);
        return;
    }
    $added = array_diff($now, array_map('intval', $known));
    if ($known !== $now) {
        update_option('ldg_admins', $now, false);
    }
    if (!$added) {
        return;
    }

    $alerts = ldg_get_alerts();
    $actor  = wp_get_current_user();
    $who    = ($actor && $actor->exists()) ? $actor->user_login : '(không đăng nhập / tác vụ nền)';
    $ip     = isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'])) : '';
    $lines  = array('Có tài khoản mới mang quyền Administrator:', '');
    foreach ($added as $id) {
        $u = get_userdata($id);
        if (!$u) {
            continue;
        }
        $alerts['admins'][$id] = array(
            'login' => $u->user_login,
            'email' => $u->user_email,
            'time'  => time(),
            'by'    => $who,
            'ip'    => $ip,
        );
        $lines[] = sprintf('- #%d %s <%s>, đăng ký %s', $id, $u->user_login, $u->user_email, $u->user_registered);
    }
    $lines[] = '';
    $lines[] = 'Thực hiện bởi: ' . $who . ($ip !== '' ? ' — IP ' . $ip : '');
    $lines[] = 'Nếu không phải bạn: xoá ngay tài khoản đó và đổi mật khẩu mọi admin.';
    update_option('ldg_alerts', $alerts, false);
    ldg_mail('Có Administrator mới', $lines);
}

/** Gom mọi thay đổi role trong 1 request, kiểm tra 1 lần ở cuối request. */
function ldg_queue_admin_check()
{
    static $queued = false;
    if (!$queued) {
        $queued = true;
        add_action('shutdown', 'ldg_check_admins');
    }
}

add_action('user_register', 'ldg_queue_admin_check');
add_action('set_user_role', 'ldg_queue_admin_check');
add_action('add_user_role', 'ldg_queue_admin_check');
add_action('grant_super_admin', 'ldg_queue_admin_check');
add_action('added_user_meta', 'ldg_on_user_meta', 10, 3);
add_action('updated_user_meta', 'ldg_on_user_meta', 10, 3);

/** Bắt cả trường hợp sửa thẳng meta wp_capabilities (không qua set_role). */
function ldg_on_user_meta($meta_id, $user_id, $meta_key)
{
    if (substr((string) $meta_key, -12) === 'capabilities') {
        ldg_queue_admin_check();
    }
}

/* ------------------------------------------------------------------ */
/* Thông báo đỏ trong wp-admin                                         */
/* ------------------------------------------------------------------ */

add_action('admin_notices', 'ldg_admin_notice');

function ldg_admin_notice()
{
    if (!current_user_can('manage_options')) {
        return;
    }
    $a = ldg_get_alerts();
    if (!$a['files'] && !$a['admins']) {
        return;
    }
    $labels = ldg_change_labels();
    echo '<div class="notice notice-error"><p><strong>LDIVN Guard — cảnh báo bảo mật!</strong></p>';
    if ($a['admins']) {
        echo '<p>Administrator mới:</p><ul style="list-style:disc;margin-left:20px">';
        foreach ($a['admins'] as $id => $u) {
            printf('<li>#%d <code>%s</code> (%s)</li>', (int) $id, esc_html($u['login']), esc_html($u['email']));
        }
        echo '</ul>';
    }
    if ($a['files']) {
        printf('<p>%d file PHP/.htaccess mới hoặc bị sửa:</p><ul style="list-style:disc;margin-left:20px">', count($a['files']));
        foreach (array_slice($a['files'], 0, 15, true) as $p => $info) {
            printf('<li>[%s] <code>%s</code></li>', esc_html($labels[$info['type']]), esc_html($p));
        }
        echo '</ul>';
    }
    printf('<p><a class="button button-primary" href="%s">Xem chi tiết trong LDIVN Guard</a></p></div>', esc_url(admin_url('tools.php?page=ldivn-guard')));
}
