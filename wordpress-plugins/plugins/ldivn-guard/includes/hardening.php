<?php
/**
 * d. Gia cố: tắt sửa file, tắt XML-RPC, chặn dò user, giới hạn đăng nhập sai, chặn PHP trong uploads.
 */

if (!defined('ABSPATH')) {
    exit;
}

/* 1. Tắt trình sửa file plugin/theme trong wp-admin */
if (!defined('DISALLOW_FILE_EDIT')) {
    define('DISALLOW_FILE_EDIT', true);
}
// Dự phòng khi wp-config.php đã đặt DISALLOW_FILE_EDIT = false
add_filter('map_meta_cap', function ($caps, $cap) {
    return in_array($cap, array('edit_files', 'edit_plugins', 'edit_themes'), true) ? array('do_not_allow') : $caps;
}, 10, 2);

/* 2. Tắt hẳn XML-RPC (xmlrpc.php khai báo XMLRPC_REQUEST trước khi nạp plugin) */
if (defined('XMLRPC_REQUEST') && XMLRPC_REQUEST) {
    status_header(403);
    header('Content-Type: text/plain; charset=utf-8');
    exit('XML-RPC is disabled.');
}
add_filter('xmlrpc_enabled', '__return_false');
add_filter('wp_headers', function ($headers) {
    unset($headers['X-Pingback']);
    return $headers;
});

/* 3a. Chặn dò tên đăng nhập qua ?author=N cho khách.
   Dùng parse_request (chỉ truy vấn trang chính) chứ không đọc $_REQUEST, để không chặn nhầm form bình luận có trường "author". */
add_action('parse_request', function ($wp) {
    if (isset($wp->query_vars['author']) && !is_user_logged_in()) {
        wp_safe_redirect(home_url('/'), 302);
        exit;
    }
});

/* 3b. Ẩn REST /wp/v2/users với khách (người đã đăng nhập vẫn dùng bình thường cho trình soạn thảo) */
add_filter('rest_endpoints', function ($endpoints) {
    if (is_user_logged_in()) {
        return $endpoints;
    }
    foreach (array_keys($endpoints) as $route) {
        if (stripos($route, '/wp/v2/users') === 0) {
            unset($endpoints[$route]);
        }
    }
    return $endpoints;
});

/* 4. Giới hạn đăng nhập sai: 5 lần / 15 phút theo IP */
define('LDG_MAX_FAIL', 5);
define('LDG_FAIL_WINDOW', 15 * MINUTE_IN_SECONDS);

function ldg_login_key()
{
    // shortcut: chỉ dùng REMOTE_ADDR (header X-Forwarded-For giả mạo được); nếu site chạy sau Cloudflare/proxy
    // thì mọi khách chung 1 IP -> cần đổi sang header CF-Connecting-IP đã xác thực.
    $ip = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : '';
    return 'ldg_login_' . md5($ip);
}

// Ưu tiên 99: chạy SAU bước kiểm tra mật khẩu nên kể cả mật khẩu đúng cũng bị chặn khi đang khoá
add_filter('authenticate', function ($user) {
    $d = get_transient(ldg_login_key());
    if (is_array($d) && $d['count'] >= LDG_MAX_FAIL) {
        $mins = (int) max(1, ceil(($d['start'] + LDG_FAIL_WINDOW - time()) / 60));
        return new WP_Error('ldg_locked', sprintf('<strong>Lỗi:</strong> Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau %d phút.', $mins));
    }
    return $user;
}, 99);

add_action('wp_login_failed', function () {
    $key = ldg_login_key();
    $d   = get_transient($key);
    if (!is_array($d)) {
        $d = array('count' => 0, 'start' => time());
    }
    $d['count']++;
    // Giữ nguyên mốc bắt đầu: cửa sổ 15 phút tính từ lần sai đầu tiên
    set_transient($key, $d, max(1, $d['start'] + LDG_FAIL_WINDOW - time()));
});

add_action('wp_login', function () {
    delete_transient(ldg_login_key());
});

/* 5. .htaccess chặn chạy PHP trong wp-content/uploads */
define('LDG_HT_BEGIN', '# BEGIN LDIVN Guard');
define('LDG_HT_END', '# END LDIVN Guard');

function ldg_htaccess_path()
{
    $up = wp_upload_dir(null, false);
    return trailingslashit($up['basedir']) . '.htaccess';
}

function ldg_htaccess_block()
{
    return LDG_HT_BEGIN . "\n"
        . "# Chặn chạy file PHP trong uploads (do plugin LDIVN Guard tạo, tự gỡ khi tắt plugin)\n"
        . "<FilesMatch \"\\.(?i:php[0-9]?|phtml|pht|phar|phps)$\">\n"
        . "Require all denied\n"
        . "</FilesMatch>\n"
        . LDG_HT_END . "\n";
}

/** Thêm khối của plugin vào CUỐI nội dung (khối sau ghi đè khối trước nếu có rule cho phép PHP). */
function ldg_htaccess_add($content)
{
    if (strpos($content, LDG_HT_BEGIN) !== false) {
        return $content;
    }
    return (trim($content) === '' ? '' : rtrim($content) . "\n\n") . ldg_htaccess_block();
}

/** Bỏ khối của plugin, giữ nguyên phần còn lại. */
function ldg_htaccess_strip($content)
{
    $re = '/\R*' . preg_quote(LDG_HT_BEGIN, '/') . '.*?' . preg_quote(LDG_HT_END, '/') . '\R?/s';
    return (string) preg_replace($re, "\n", $content);
}

function ldg_htaccess_install()
{
    $path   = ldg_htaccess_path();
    $exists = file_exists($path);
    $old    = $exists ? (string) @file_get_contents($path) : '';
    $new    = ldg_htaccess_add($old);
    $ok     = $new === $old || @file_put_contents($path, $new, LOCK_EX) !== false;
    if ($ok && !$exists) {
        update_option('ldg_htaccess_created', 1, false); // nhớ để khi tắt plugin xoá luôn file do mình tạo
    }
    return $ok;
}

function ldg_htaccess_remove()
{
    $path = ldg_htaccess_path();
    if (!file_exists($path)) {
        delete_option('ldg_htaccess_created');
        return true;
    }
    $old = (string) @file_get_contents($path);
    if (strpos($old, LDG_HT_BEGIN) === false) {
        delete_option('ldg_htaccess_created');
        return true;
    }
    $new = ldg_htaccess_strip($old);
    if (trim($new) === '' && get_option('ldg_htaccess_created')) {
        $ok = @unlink($path); // file do chính plugin tạo và không còn nội dung nào khác
    } else {
        $ok = @file_put_contents($path, ltrim($new), LOCK_EX) !== false;
    }
    delete_option('ldg_htaccess_created');
    return $ok;
}

/**
 * Tự kiểm tra: tạo 1 file PHP vô hại trong uploads, gọi thử qua HTTP rồi xoá ngay.
 * Dùng khoá quét để lần quét định kỳ không bắt nhầm file thử này.
 */
function ldg_test_uploads_php()
{
    if (!ldg_lock()) {
        return 'Đang có lần quét khác chạy, thử lại sau ít phút.';
    }
    $up   = wp_upload_dir(null, false);
    $name = 'ldg-test-' . wp_generate_password(12, false) . '.php';
    $file = trailingslashit($up['basedir']) . $name;
    if (@file_put_contents($file, "<?php echo 'LDG-' . 'EXEC';") === false) {
        delete_transient('ldg_scan_lock');
        return 'Không ghi được file thử vào uploads (thư mục không cho ghi).';
    }
    $res = wp_remote_get(trailingslashit($up['baseurl']) . $name, array('timeout' => 10, 'redirection' => 0, 'sslverify' => false));
    @unlink($file);
    delete_transient('ldg_scan_lock');

    if (is_wp_error($res)) {
        return 'Không xác định được (máy chủ không tự gọi được chính nó): ' . $res->get_error_message();
    }
    $code = (int) wp_remote_retrieve_response_code($res);
    if (strpos((string) wp_remote_retrieve_body($res), 'LDG-EXEC') !== false) {
        return 'KHÔNG AN TOÀN: PHP vẫn chạy được trong uploads (HTTP ' . $code . '). Hosting có thể không đọc .htaccess — hãy nhờ hosting chặn.';
    }
    return 'AN TOÀN: PHP trong uploads không chạy được (HTTP ' . $code . ').';
}
