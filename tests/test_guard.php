<?php
// Test logic LDIVN Guard với WordPress giả lập (stub). Chạy: php -d error_reporting=-1 test_guard.php
error_reporting(-1);
set_error_handler(function ($no, $str, $file, $line) { throw new ErrorException($str, 0, $no, $file, $line); });

$tmp = sys_get_temp_dir() . '/ldg-test-' . getmypid();
@mkdir($tmp . '/wp/wp-content/plugins/p', 0777, true);
@mkdir($tmp . '/wp/wp-content/mu-plugins', 0777, true);
@mkdir($tmp . '/wp/wp-content/themes/t', 0777, true);
@mkdir($tmp . '/wp/wp-content/uploads/2026', 0777, true);
$root = str_replace('\\', '/', $tmp) . '/wp/';
define('ABSPATH', $root);
define('WP_CONTENT_DIR', $root . 'wp-content');
define('WP_PLUGIN_DIR', $root . 'wp-content/plugins');
define('WPMU_PLUGIN_DIR', $root . 'wp-content/mu-plugins');
define('MINUTE_IN_SECONDS', 60);
define('XMLRPC_REQUEST', false);

// ---- stub WordPress ----
$GLOBALS['opt'] = array(); $GLOBALS['tr'] = array(); $GLOBALS['mails'] = array(); $GLOBALS['hooks'] = array();
function add_action($h, $cb, $p = 10, $a = 1) { $GLOBALS['hooks'][$h][] = $cb; }
function add_filter($h, $cb, $p = 10, $a = 1) { $GLOBALS['hooks'][$h][] = $cb; }
function apply($h, ...$args) { foreach ($GLOBALS['hooks'][$h] ?? array() as $cb) { $args[0] = $cb(...$args); } return $args[0]; }
function get_option($k, $d = false) { return array_key_exists($k, $GLOBALS['opt']) ? $GLOBALS['opt'][$k] : $d; }
function update_option($k, $v, $a = null) { $GLOBALS['opt'][$k] = $v; return true; }
function delete_option($k) { unset($GLOBALS['opt'][$k]); return true; }
function get_transient($k) { return $GLOBALS['tr'][$k] ?? false; }
function set_transient($k, $v, $t = 0) { $GLOBALS['tr'][$k] = $v; return true; }
function delete_transient($k) { unset($GLOBALS['tr'][$k]); return true; }
function wp_normalize_path($p) { return str_replace('\\', '/', $p); }
function trailingslashit($p) { return rtrim($p, '/\\') . '/'; }
function wp_upload_dir($t = null, $c = true) { return array('basedir' => WP_CONTENT_DIR . '/uploads', 'baseurl' => 'https://x.test/wp-content/uploads'); }
function get_theme_root() { return WP_CONTENT_DIR . '/themes'; }
function wp_mail($to, $s, $b) { $GLOBALS['mails'][] = array($s, $b); return true; }
function wp_parse_url($u, $c = -1) { return parse_url($u, $c); }
function home_url($p = '') { return 'https://x.test' . $p; }
function admin_url($p = '') { return 'https://x.test/wp-admin/' . $p; }
function is_user_logged_in() { return !empty($GLOBALS['logged_in']); }
function wp_get_current_user() { return new class { public $user_login = 'tester'; function exists() { return true; } }; }
function sanitize_text_field($s) { return trim($s); }
function wp_unslash($s) { return $s; }
function maybe_unserialize($s) { return is_string($s) && @unserialize($s) !== false ? unserialize($s) : $s; }
function wp_roles() { return (object) array('roles' => array('administrator' => array('capabilities' => array('manage_options' => true)), 'editor' => array('capabilities' => array()), 'shadow' => array('capabilities' => array('manage_options' => true)))); }
function get_userdata($id) { return (object) array('user_login' => 'u' . $id, 'user_email' => "u$id@x.test", 'user_registered' => '2026-10-01', 'display_name' => "U$id", 'roles' => array('administrator')); }
function status_header($c) {}
function plugin_dir_path($f) { return trailingslashit(dirname($f)); }
class WP_Error { public $code; function __construct($c = '', $m = '') { $this->code = $c; } }
class FakeWpdb {
    public $usermeta = 'wp_usermeta';
    public $rows = array();
    function prepare($q, ...$a) { foreach ($a as $v) { $q = preg_replace('/%s/', "'" . addslashes($v) . "'", $q, 1); } return $q; }
    function esc_like($s) { return addcslashes($s, '_%\\'); }
    function get_blog_prefix() { return 'wp_'; }
    function get_results($q) { $GLOBALS['last_sql'] = $q; return $this->rows; }
}
$GLOBALS['wpdb'] = new FakeWpdb();

require dirname(__DIR__) . '/plugins/ldivn-guard/includes/monitor.php';
require dirname(__DIR__) . '/plugins/ldivn-guard/includes/hardening.php';

$fails = 0;
function check($name, $cond) { global $fails; echo ($cond ? 'OK   ' : 'FAIL ') . $name . "\n"; if (!$cond) $fails++; }

// 1. Lọc đuôi file
check('watched .php/.phtml/.php7/.htaccess', ldg_is_watched_file('a.php') && ldg_is_watched_file('A.PHTML') && ldg_is_watched_file('x.php7') && ldg_is_watched_file('.htaccess') && ldg_is_watched_file('.user.ini'));
check('không theo dõi .js/.png/.php.txt', !ldg_is_watched_file('a.js') && !ldg_is_watched_file('a.png') && !ldg_is_watched_file('a.php.txt'));

// 2. Diff
$d = ldg_diff_hashes(array('a' => '1', 'b' => '2', 'c' => '3'), array('a' => '1', 'b' => 'X', 'd' => '4'));
check('diff new/modified/deleted', $d === array('b' => 'modified', 'd' => 'new', 'c' => 'deleted'));

// 3. Quét: lần đầu chỉ lấy mốc, lần sau báo file mới, chỉ email 1 lần
file_put_contents(WP_PLUGIN_DIR . '/p/p.php', '<?php // ok');
file_put_contents(WP_CONTENT_DIR . '/uploads/2026/pic.jpg', 'x');
check('quét lần 1 chạy', ldg_run_scan() === true);
check('lần 1 không cảnh báo, không email', !get_option('ldg_alerts') && !$GLOBALS['mails']);
check('mốc có p.php, không có ảnh', isset(get_option('ldg_baseline')['wp-content/plugins/p/p.php']) && count(get_option('ldg_baseline')) === 1);
file_put_contents(WPMU_PLUGIN_DIR . '/evil.php', '<?php // evil');
file_put_contents(WP_PLUGIN_DIR . '/p/p.php', '<?php // changed');
ldg_run_scan();
$a = ldg_get_alerts();
check('phát hiện mu-plugin mới', ($a['files']['wp-content/mu-plugins/evil.php']['type'] ?? '') === 'new');
check('phát hiện file bị sửa', ($a['files']['wp-content/plugins/p/p.php']['type'] ?? '') === 'modified');
check('gửi 1 email', count($GLOBALS['mails']) === 1 && strpos($GLOBALS['mails'][0][1], 'mu-plugins/evil.php') !== false);
unlink(WPMU_PLUGIN_DIR . '/evil.php');
ldg_run_scan();
check('file độc tự xoá vẫn còn trong cảnh báo', isset(ldg_get_alerts()['files']['wp-content/mu-plugins/evil.php']));
check('không email lặp', count($GLOBALS['mails']) === 1);
check('quét bị khoá khi đang chạy', (set_transient('ldg_scan_lock', 1) && ldg_run_scan() === false) && delete_transient('ldg_scan_lock'));
ldg_mark_safe();
check('đánh dấu an toàn xoá cảnh báo', !ldg_get_alerts()['files'] && get_option('ldg_baseline')['wp-content/plugins/p/p.php'] === sha1_file(WP_PLUGIN_DIR . '/p/p.php'));

// 4. Admin: đọc DB trực tiếp, bắt role tự chế + quyền gán thẳng
$wpdb->rows = array(
    (object) array('user_id' => '1', 'meta_value' => serialize(array('administrator' => true))),
    (object) array('user_id' => '2', 'meta_value' => serialize(array('editor' => true, 'x_manage_options_y' => true))),
    (object) array('user_id' => '3', 'meta_value' => serialize(array('shadow' => true))),
    (object) array('user_id' => '4', 'meta_value' => serialize(array('subscriber' => true, 'manage_options' => true))),
);
check('admin ids = 1,3,4', ldg_current_admin_ids() === array(1, 3, 4));
check('SQL lọc meta_key wp_capabilities', strpos($GLOBALS['last_sql'], "meta_key = 'wp_capabilities'") !== false);
$GLOBALS['opt']['ldg_admins'] = array(1);
$GLOBALS['mails'] = array();
ldg_check_admins();
$a = ldg_get_alerts();
check('cảnh báo admin mới 3 và 4', array_keys($a['admins']) === array(3, 4) && count($GLOBALS['mails']) === 1);
ldg_check_admins();
check('không email lặp admin', count($GLOBALS['mails']) === 1);

// 5. .htaccess: thêm/gỡ giữ nguyên nội dung cũ
$orig = "Options -Indexes\n";
$added = ldg_htaccess_add($orig);
check('htaccess thêm vào cuối', strpos($added, 'Options -Indexes') === 0 && strpos($added, 'Require all denied') !== false);
check('htaccess thêm 2 lần không nhân đôi', ldg_htaccess_add($added) === $added);
check('htaccess gỡ trả lại nội dung cũ', trim(ldg_htaccess_strip($added)) === trim($orig));
$ht = WP_CONTENT_DIR . '/uploads/.htaccess';
ldg_htaccess_install();
check('tạo .htaccess mới + nhớ là do mình tạo', file_exists($ht) && get_option('ldg_htaccess_created'));
ldg_htaccess_remove();
check('gỡ: xoá file do mình tạo', !file_exists($ht) && !get_option('ldg_htaccess_created'));
file_put_contents($ht, $orig);
ldg_htaccess_install();
ldg_htaccess_remove();
check('gỡ: giữ file có sẵn, nội dung như cũ', file_exists($ht) && trim(file_get_contents($ht)) === trim($orig));

// 6. Giới hạn đăng nhập
$_SERVER['REMOTE_ADDR'] = '1.2.3.4';
$auth = $GLOBALS['hooks']['authenticate'][0];
$fail = $GLOBALS['hooks']['wp_login_failed'][0];
for ($i = 0; $i < 4; $i++) { $fail(); }
check('4 lần sai: chưa khoá', $auth('USER') === 'USER');
$fail();
check('5 lần sai: khoá', $auth('USER') instanceof WP_Error);
$_SERVER['REMOTE_ADDR'] = '5.6.7.8';
check('IP khác không bị khoá', $auth('USER') === 'USER');
$GLOBALS['hooks']['wp_login'][0]();

// 7. REST users ẩn với khách, hiện khi đăng nhập
$ep = array('/wp/v2/users' => 1, '/wp/v2/users/(?P<id>[\d]+)' => 1, '/wp/v2/posts' => 1);
check('khách: ẩn /wp/v2/users*', array_keys(apply('rest_endpoints', $ep)) === array('/wp/v2/posts'));
$GLOBALS['logged_in'] = true;
check('đã đăng nhập: giữ nguyên', apply('rest_endpoints', $ep) === $ep);
check('DISALLOW_FILE_EDIT', DISALLOW_FILE_EDIT === true);
check('map_meta_cap chặn edit_plugins', apply('map_meta_cap', array('edit_plugins'), 'edit_plugins') === array('do_not_allow') && apply('map_meta_cap', array('x'), 'edit_posts') === array('x'));

// 8. Render trang quản trị (bắt warning/notice)
function esc_html($s) { return htmlspecialchars((string) $s); }
function esc_attr($s) { return htmlspecialchars((string) $s); }
function esc_url($s) { return (string) $s; }
function wp_nonce_field($a) { echo '<nonce>'; }
function wp_json_encode($v) { return json_encode($v); }
function size_format($b) { return $b . ' B'; }
function wp_date($f, $t) { return date($f, (int) $t); }
function get_bloginfo($k) { return '6.8'; }
function wp_next_scheduled($h) { return time() + 60; }
function get_site_transient($k) { return (object) array('response' => array(), 'no_update' => array('akismet/akismet.php' => 1)); }
function wp_update_plugins() {}
function get_plugins() { return array('akismet/akismet.php' => array('Name' => 'Akismet', 'Version' => '5', 'Author' => 'A'), 'fast-bridge-kit/fbk.php' => array('Name' => 'Fast Bridge Kit', 'Version' => '1', 'Author' => '<a>X</a>')); }
function is_plugin_active($f) { return false; }
function wp_strip_all_tags($s) { return strip_tags($s); }
function current_user_can($c) { return true; }
function get_current_user_id() { return 1; }
function add_management_page() {}
require dirname(__DIR__) . '/plugins/ldivn-guard/includes/admin-page.php';
file_put_contents(WPMU_PLUGIN_DIR . '/evil2.php', '<?php');
file_put_contents(WP_CONTENT_DIR . '/uploads/2026/shell.php', '<?php');
ldg_run_scan();
ob_start(); ldg_render_page(); ldg_admin_notice(); $html = ob_get_clean();
check('trang: liệt kê plugin lạ, không liệt kê akismet', strpos($html, 'Fast Bridge Kit') !== false && strpos($html, 'Akismet') === false);
check('trang: thấy mu-plugin và PHP trong uploads', strpos($html, 'mu-plugins/evil2.php') !== false && strpos($html, 'uploads/2026/shell.php') !== false);
check('trang: hiện PHP version + nút an toàn', strpos($html, PHP_VERSION) !== false && strpos($html, 'Đánh dấu là an toàn') !== false);
check('thông báo đỏ', strpos($html, 'notice-error') !== false);

// dọn
$it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($tmp, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);
foreach ($it as $f) { $f->isDir() ? rmdir($f) : unlink($f); }
rmdir($tmp);
echo $fails ? "\n$fails test FAIL\n" : "\nTất cả test OK (PHP " . PHP_VERSION . ")\n";
exit($fails ? 1 : 0);
