<?php
/**
 * c + e. Trang Công cụ > LDIVN Guard và các nút thao tác.
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('admin_menu', function () {
    add_management_page('LDIVN Guard', 'LDIVN Guard', 'manage_options', 'ldivn-guard', 'ldg_render_page');
});

add_action('admin_post_ldg_action', 'ldg_handle_action');

/** Xử lý các nút (POST + nonce + quyền manage_options). */
function ldg_handle_action()
{
    if (!current_user_can('manage_options')) {
        wp_die('Bạn không có quyền.', 403);
    }
    check_admin_referer('ldg_action');
    $do = isset($_POST['ldg_do']) ? sanitize_key(wp_unslash($_POST['ldg_do'])) : '';
    $busy = 'Đang có lần quét khác chạy, thử lại sau ít phút.';
    switch ($do) {
        case 'mark_safe':
            $msg = ldg_mark_safe() ? 'Đã cập nhật danh sách hash và danh sách admin, xoá mọi cảnh báo.' : $busy;
            break;
        case 'scan_now':
            $msg = ldg_run_scan() ? 'Đã quét xong.' : $busy;
            break;
        case 'test_php':
            $msg = ldg_test_uploads_php();
            break;
        case 'htaccess':
            $msg = ldg_htaccess_install() ? 'Đã ghi .htaccess chặn PHP trong uploads.' : 'Không ghi được .htaccess (thư mục uploads không cho ghi).';
            break;
        default:
            $msg = '';
    }
    set_transient('ldg_msg_' . get_current_user_id(), $msg, MINUTE_IN_SECONDS);
    wp_safe_redirect(admin_url('tools.php?page=ldivn-guard'));
    exit;
}

function ldg_button($do, $label, $primary = false, $confirm = '')
{
    echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '" style="display:inline-block;margin:0 6px 6px 0">';
    wp_nonce_field('ldg_action');
    echo '<input type="hidden" name="action" value="ldg_action"><input type="hidden" name="ldg_do" value="' . esc_attr($do) . '">';
    $onclick = $confirm !== '' ? ' onclick="return confirm(' . esc_attr(wp_json_encode($confirm)) . ')"' : '';
    echo '<button type="submit" class="button' . ($primary ? ' button-primary' : '') . '"' . $onclick . '>' . esc_html($label) . '</button></form>';
}

/** Liệt kê file theo dõi trong 1 thư mục (giới hạn số dòng để trang không quá nặng). */
function ldg_list_files($dir, $php_only, $limit = 300)
{
    $rows = array();
    if (!is_dir($dir)) {
        return $rows;
    }
    ldg_walk(wp_normalize_path($dir), function ($path, $f) use (&$rows, $php_only, $limit) {
        if (count($rows) >= $limit || ($php_only && !preg_match('/\.(php\d?|phtml|pht|phar|phps)$/i', $path))) {
            return;
        }
        $rows[] = array('path' => ldg_rel_path($path), 'size' => $f->getSize(), 'mtime' => $f->getMTime());
    });
    return $rows;
}

function ldg_files_table(array $rows, $empty)
{
    if (!$rows) {
        echo '<p><em>' . esc_html($empty) . '</em></p>';
        return;
    }
    echo '<table class="widefat striped"><thead><tr><th>File</th><th>Dung lượng</th><th>Sửa lúc</th></tr></thead><tbody>';
    foreach ($rows as $r) {
        printf('<tr><td><code>%s</code></td><td>%s</td><td>%s</td></tr>', esc_html($r['path']), esc_html(size_format($r['size'])), esc_html(wp_date('Y-m-d H:i', $r['mtime'])));
    }
    echo '</tbody></table>';
}

/** Plugin không có trên wordpress.org = không nằm trong dữ liệu cập nhật mà wordpress.org trả về. */
function ldg_unknown_plugins()
{
    if (!function_exists('get_plugins')) {
        require_once ABSPATH . 'wp-admin/includes/plugin.php';
    }
    $t = get_site_transient('update_plugins');
    if (!is_object($t) || !isset($t->no_update)) {
        wp_update_plugins();
        $t = get_site_transient('update_plugins');
    }
    $known = array();
    if (is_object($t)) {
        foreach (array('response', 'no_update') as $k) {
            if (!empty($t->$k) && is_array($t->$k)) {
                $known += $t->$k;
            }
        }
    }
    $out = array();
    foreach (get_plugins() as $file => $data) {
        if (!isset($known[$file])) {
            $main         = WP_PLUGIN_DIR . '/' . $file;
            $out[$file]   = $data + array('_active' => is_plugin_active($file), '_mtime' => file_exists($main) ? filemtime($main) : 0);
        }
    }
    return $out;
}

function ldg_render_page()
{
    if (!current_user_can('manage_options')) {
        return;
    }
    $msg_key = 'ldg_msg_' . get_current_user_id();
    $msg     = get_transient($msg_key);
    delete_transient($msg_key);

    $alerts   = ldg_get_alerts();
    $labels   = ldg_change_labels();
    $baseline = get_option('ldg_baseline');
    $last     = (int) get_option('ldg_last_scan');
    $up       = wp_upload_dir(null, false);
    $ht_path  = ldg_htaccess_path();
    $ht       = file_exists($ht_path) ? (string) @file_get_contents($ht_path) : '';

    echo '<div class="wrap"><h1>LDIVN Guard</h1>';
    if ($msg) {
        echo '<div class="notice notice-info"><p>' . esc_html($msg) . '</p></div>';
    }

    /* --- Cảnh báo + nút --- */
    echo '<h2>Cảnh báo</h2>';
    if (!$alerts['files'] && !$alerts['admins']) {
        echo '<p>Không có cảnh báo nào.</p>';
    }
    if ($alerts['admins']) {
        echo '<h3>Administrator mới</h3><table class="widefat striped"><thead><tr><th>ID</th><th>Tên đăng nhập</th><th>Email</th><th>Phát hiện lúc</th><th>Thực hiện bởi</th></tr></thead><tbody>';
        foreach ($alerts['admins'] as $id => $u) {
            printf(
                '<tr><td>%d</td><td><code>%s</code></td><td>%s</td><td>%s</td><td>%s %s</td></tr>',
                (int) $id,
                esc_html($u['login']),
                esc_html($u['email']),
                esc_html(wp_date('Y-m-d H:i', $u['time'])),
                esc_html($u['by']),
                esc_html($u['ip'])
            );
        }
        echo '</tbody></table>';
    }
    if ($alerts['files']) {
        echo '<h3>File mới / bị sửa / bị xoá (' . count($alerts['files']) . ')</h3><table class="widefat striped"><thead><tr><th>Loại</th><th>File</th><th>Phát hiện lúc</th></tr></thead><tbody>';
        foreach (array_slice($alerts['files'], 0, 500, true) as $p => $info) {
            printf('<tr><td><strong>%s</strong></td><td><code>%s</code></td><td>%s</td></tr>', esc_html($labels[$info['type']]), esc_html($p), esc_html(wp_date('Y-m-d H:i', $info['time'])));
        }
        echo '</tbody></table>';
    }
    echo '<p style="margin-top:12px">';
    ldg_button('scan_now', 'Quét ngay');
    ldg_button('mark_safe', 'Đánh dấu là an toàn', true, 'Chỉ bấm khi bạn đã kiểm tra mọi file/tài khoản trong danh sách cảnh báo (ví dụ vừa tự cập nhật plugin). Tiếp tục?');
    echo '</p>';

    /* --- Hệ thống & gia cố --- */
    echo '<h2>Hệ thống</h2><table class="widefat striped" style="max-width:900px"><tbody>';
    $rows = array(
        'Phiên bản PHP'               => PHP_VERSION,
        'Phiên bản WordPress'         => get_bloginfo('version'),
        'Email nhận cảnh báo'         => get_option('admin_email') . ' (Cài đặt > Tổng quan)',
        'Lần quét gần nhất'           => $last ? wp_date('Y-m-d H:i', $last) : 'Chưa quét (lần đầu chạy ~1 phút sau khi kích hoạt)',
        'Số file đang theo dõi'       => is_array($baseline) ? (string) count($baseline) : 'Chưa có mốc',
        'Lần quét kế tiếp (WP-Cron)'  => wp_next_scheduled('ldg_hourly_scan') ? wp_date('Y-m-d H:i', wp_next_scheduled('ldg_hourly_scan')) : 'CHƯA LÊN LỊCH — hãy tắt rồi bật lại plugin',
        'Trình sửa file wp-admin'     => (defined('DISALLOW_FILE_EDIT') && DISALLOW_FILE_EDIT) ? 'Đã tắt' : 'Đã chặn qua quyền (wp-config đặt DISALLOW_FILE_EDIT = false)',
        'XML-RPC'                     => 'Đã chặn (xmlrpc.php trả 403)',
        '.htaccess chặn PHP uploads'  => strpos($ht, LDG_HT_BEGIN) !== false ? 'Đã có' : 'CHƯA CÓ',
    );
    foreach ($rows as $k => $v) {
        printf('<tr><th style="width:240px">%s</th><td>%s</td></tr>', esc_html($k), esc_html($v));
    }
    echo '</tbody></table><p>';
    ldg_button('test_php', 'Kiểm tra chặn PHP trong uploads');
    if (strpos($ht, LDG_HT_BEGIN) === false) {
        ldg_button('htaccess', 'Ghi lại .htaccess cho uploads');
    }
    echo '</p>';
    if ($ht !== '') {
        echo '<details><summary>Nội dung <code>' . esc_html(ldg_rel_path(wp_normalize_path($ht_path))) . '</code></summary><pre style="background:#fff;padding:8px;max-height:300px;overflow:auto">' . esc_html($ht) . '</pre></details>';
    }

    /* --- mu-plugins --- */
    echo '<h2>Must-use plugins (wp-content/mu-plugins)</h2><p>Các file ở đây tự chạy và không tắt được từ wp-admin. Website bình thường để trống hoặc chỉ có file do hosting đặt.</p>';
    ldg_files_table(ldg_list_files(WPMU_PLUGIN_DIR, false), 'Trống.');

    /* --- Plugin lạ --- */
    echo '<h2>Plugin không có trên wordpress.org</h2><p>Gồm cả plugin trả phí hợp lệ (Elementor Pro, Astra Pro...). Hãy đối chiếu: plugin nào bạn không tự cài thì nghi ngờ.</p>';
    $unknown = ldg_unknown_plugins();
    if (!$unknown) {
        echo '<p><em>Không có.</em></p>';
    } else {
        echo '<table class="widefat striped"><thead><tr><th>Tên</th><th>File chính</th><th>Phiên bản</th><th>Tác giả</th><th>Trạng thái</th><th>File chính sửa lúc</th></tr></thead><tbody>';
        foreach ($unknown as $file => $p) {
            printf(
                '<tr><td>%s</td><td><code>%s</code></td><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>',
                esc_html($p['Name']),
                esc_html($file),
                esc_html($p['Version']),
                esc_html(wp_strip_all_tags($p['Author'])),
                $p['_active'] ? 'Đang bật' : 'Đã tắt',
                esc_html($p['_mtime'] ? wp_date('Y-m-d H:i', $p['_mtime']) : '')
            );
        }
        echo '</tbody></table>';
    }

    /* --- PHP trong uploads --- */
    echo '<h2>File PHP trong uploads</h2><p>Thư mục uploads chỉ nên chứa ảnh/tài liệu. Mọi file PHP ở đây đều rất đáng ngờ.</p>';
    ldg_files_table(ldg_list_files($up['basedir'], true), 'Không có — tốt.');

    /* --- Administrator --- */
    echo '<h2>Tài khoản có quyền quản trị</h2><table class="widefat striped"><thead><tr><th>ID</th><th>Tên đăng nhập</th><th>Email</th><th>Tên hiển thị</th><th>Đăng ký lúc</th><th>Vai trò</th></tr></thead><tbody>';
    foreach (ldg_current_admin_ids() as $id) {
        $u = get_userdata($id);
        if (!$u) {
            continue;
        }
        printf(
            '<tr><td>%d</td><td><code>%s</code></td><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>',
            (int) $id,
            esc_html($u->user_login),
            esc_html($u->user_email),
            esc_html($u->display_name),
            esc_html($u->user_registered),
            esc_html(implode(', ', $u->roles))
        );
    }
    echo '</tbody></table>';
    echo '<p>Bảng này đọc thẳng database nên vẫn thấy cả admin mà mã độc đã ẩn khỏi trang Người dùng. Hãy so sánh hai nơi.</p>';
    echo '</div>';
}
