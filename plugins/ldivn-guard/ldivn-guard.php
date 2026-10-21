<?php
/**
 * Plugin Name:       LDIVN Guard
 * Description:       Giám sát file PHP, cảnh báo tài khoản Administrator mới và gia cố bảo mật cơ bản. Chỉ CẢNH BÁO và CHẶN, không tự xoá file của website.
 * Version:           1.0.0
 * Requires at least: 5.3
 * Requires PHP:      7.4
 * Author:            LDIVN
 * License:           GPLv2 or later
 * Text Domain:       ldivn-guard
 */

if (!defined('ABSPATH')) {
    exit;
}

define('LDG_VERSION', '1.0.0');
define('LDG_DIR', plugin_dir_path(__FILE__));

require_once LDG_DIR . 'includes/monitor.php';
require_once LDG_DIR . 'includes/hardening.php';
require_once LDG_DIR . 'includes/admin-page.php';

register_activation_hook(__FILE__, 'ldg_activate');
register_deactivation_hook(__FILE__, 'ldg_deactivate');

/** Kích hoạt: tạo .htaccess cho uploads, chụp danh sách admin, lên lịch quét mỗi giờ. */
function ldg_activate()
{
    ldg_htaccess_install();
    ldg_check_admins(); // lần đầu chỉ lưu làm mốc, không cảnh báo
    if (!wp_next_scheduled('ldg_hourly_scan')) {
        // Lần quét đầu (tạo danh sách hash gốc) chạy nền sau 1 phút để việc kích hoạt không bị chậm
        wp_schedule_event(time() + MINUTE_IN_SECONDS, 'hourly', 'ldg_hourly_scan');
    }
}

/** Tắt plugin: gỡ sạch cron và đoạn .htaccess do plugin tạo. Dữ liệu (hash, cảnh báo) giữ lại tới khi xoá plugin. */
function ldg_deactivate()
{
    wp_clear_scheduled_hook('ldg_hourly_scan');
    ldg_htaccess_remove();
    delete_transient('ldg_scan_lock');
}
