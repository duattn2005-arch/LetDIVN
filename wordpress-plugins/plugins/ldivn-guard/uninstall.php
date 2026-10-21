<?php
/** Xoá plugin (không phải chỉ tắt): dọn dữ liệu đã lưu. */
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}
foreach (array('ldg_baseline', 'ldg_alerts', 'ldg_admins', 'ldg_last_scan', 'ldg_htaccess_created') as $opt) {
    delete_option($opt);
}
delete_transient('ldg_scan_lock');
wp_clear_scheduled_hook('ldg_hourly_scan');
