<?php
// Volunteer sign-ups and contact messages sent from the site's forms: listed
// in the admin (read-only) and downloadable as a spreadsheet (CSV for Excel).

defined('ABSPATH') || exit;

const LDIVN_FORMS = [
    'ldivn_volunteer' => [
        'label' => 'Đăng ký tình nguyện viên',
        'singular' => 'đăng ký',
        'icon' => 'dashicons-groups',
        'columns' => [
            'fullName' => 'Họ tên',
            'phone' => 'Điện thoại',
            'email' => 'Email',
            'city' => 'Tỉnh / thành',
            'eventName' => 'Sự kiện',
            'joinAs' => 'Tham gia với tư cách',
            'organizationName' => 'Nhóm / tổ chức',
            'participants' => 'Số người',
            'preferredRole' => 'Vai trò',
            'ageGroup' => 'Độ tuổi',
            'tshirtSize' => 'Cỡ áo',
            'skills' => 'Kỹ năng',
            'emergencyContact' => 'Liên hệ khẩn cấp',
            'notes' => 'Ghi chú',
            'registeredAt' => 'Thời gian',
        ],
        'list' => ['phone', 'email', 'eventName', 'registeredAt'],
    ],
    'ldivn_contact' => [
        'label' => 'Tin nhắn liên hệ',
        'singular' => 'tin nhắn',
        'icon' => 'dashicons-email-alt',
        'columns' => [
            'name' => 'Họ tên',
            'email' => 'Email',
            'phone' => 'Điện thoại',
            'subject' => 'Chủ đề',
            'message' => 'Nội dung',
            'createdAt' => 'Thời gian',
        ],
        'list' => ['email', 'phone', 'subject', 'createdAt'],
    ],
];

add_action('init', function () {
    $position = 28;
    foreach (LDIVN_FORMS as $type => $form) {
        register_post_type($type, [
            'labels' => [
                'name' => $form['label'],
                'singular_name' => $form['singular'],
                'menu_name' => $form['label'],
                'all_items' => $form['label'],
                'edit_item' => 'Xem ' . $form['singular'],
                'search_items' => 'Tìm ' . $form['singular'],
                'not_found' => 'Chưa có ' . $form['singular'],
            ],
            'public' => false,
            'show_ui' => true,
            'show_in_rest' => false,
            'menu_position' => $position++,
            'menu_icon' => $form['icon'],
            'supports' => ['title'],
            'capability_type' => 'post',
            'capabilities' => ['create_posts' => 'do_not_allow'],
            'map_meta_cap' => true,
        ]);
    }
});

function ldivn_form_data(int $id): array
{
    $data = json_decode((string) get_post_meta($id, 'ldivn_data', true), true);
    return is_array($data) ? $data : [];
}

function ldivn_form_value($v): string
{
    if (is_array($v)) {
        return implode(', ', array_map('strval', $v));
    }
    if (is_bool($v)) {
        return $v ? 'Có' : 'Không';
    }
    $s = (string) $v;
    if (preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/', $s)) {
        $t = strtotime($s);
        return $t ? wp_date('d/m/Y H:i', $t) : $s;
    }
    return $s;
}

foreach (LDIVN_FORMS as $type => $form) {
    add_filter("manage_{$type}_posts_columns", function ($cols) use ($form) {
        $out = ['cb' => $cols['cb'], 'title' => $form['columns'][array_key_first($form['columns'])]];
        foreach ($form['list'] as $key) {
            $out['ldivn_' . $key] = $form['columns'][$key];
        }
        return $out;
    });
    add_action("manage_{$type}_posts_custom_column", function ($col, $id) {
        if (str_starts_with($col, 'ldivn_')) {
            echo esc_html(ldivn_form_value(ldivn_form_data($id)[substr($col, 6)] ?? ''));
        }
    }, 10, 2);

    // The entry itself: every field, read-only.
    add_action("add_meta_boxes_{$type}", function (WP_Post $post) use ($form) {
        remove_meta_box('submitdiv', $post->post_type, 'side');
        add_meta_box('ldivn_form_data', 'Nội dung', function (WP_Post $post) use ($form) {
            $data = ldivn_form_data($post->ID);
            echo '<table class="widefat striped"><tbody>';
            foreach ($form['columns'] + array_fill_keys(array_diff(array_keys($data), array_keys($form['columns'])), null) as $key => $label) {
                if (!array_key_exists($key, $data) || $data[$key] === '' || $data[$key] === []) {
                    continue;
                }
                printf('<tr><th style="width:200px">%s</th><td style="white-space:pre-wrap">%s</td></tr>', esc_html($label ?? $key), esc_html(ldivn_form_value($data[$key])));
            }
            echo '</tbody></table>';
            printf('<p><a class="button button-link-delete" href="%s">Xóa</a></p>', esc_url(get_delete_post_link($post->ID)));
        }, $post->post_type, 'normal', 'high');
    });

    // "Tải về Excel" next to the list title.
    add_action('admin_head-edit.php', function () use ($type) {
        if (($GLOBALS['typenow'] ?? '') !== $type) {
            return;
        }
        $url = wp_nonce_url(admin_url("admin-post.php?action=ldivn_export&type=$type"), 'ldivn_export');
        echo '<script>document.addEventListener("DOMContentLoaded",function(){var h=document.querySelector(".wp-heading-inline");if(h){var a=document.createElement("a");a.className="page-title-action";a.href=' . wp_json_encode($url) . ';a.textContent="Tải về Excel (CSV)";h.after(a);}});</script>';
    });
}

// Entries are stored private (never public); no need to say so on every row.
add_filter('display_post_states', function ($states, $post) {
    return isset(LDIVN_FORMS[$post->post_type]) ? [] : $states;
}, 10, 2);

// Entries have no title box: the name is set from the form.
add_filter('post_row_actions', function ($actions, $post) {
    if (isset(LDIVN_FORMS[$post->post_type])) {
        unset($actions['inline hide-if-no-js']);
        $actions['edit'] = sprintf('<a href="%s">Xem</a>', esc_url(get_edit_post_link($post->ID)));
    }
    return $actions;
}, 10, 2);
add_action('admin_head-post.php', function () {
    if (isset(LDIVN_FORMS[get_post_type()])) {
        echo '<style>#titlediv #title{background:#f6f7f7}#titlediv #title-prompt-text{display:none}</style>';
        echo '<script>document.addEventListener("DOMContentLoaded",function(){var t=document.getElementById("title");if(t)t.readOnly=true;});</script>';
    }
});

add_action('admin_post_ldivn_export', function () {
    check_admin_referer('ldivn_export');
    $type = sanitize_key($_GET['type'] ?? '');
    if (!isset(LDIVN_FORMS[$type]) || !current_user_can('edit_posts')) {
        wp_die('Không có quyền.');
    }
    $form = LDIVN_FORMS[$type];
    nocache_headers();
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $type . '-' . wp_date('Y-m-d') . '.csv"');
    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF"); // so Excel reads Vietnamese correctly
    fputcsv($out, array_values($form['columns']));
    foreach (get_posts(['post_type' => $type, 'post_status' => 'any', 'numberposts' => -1, 'orderby' => 'date', 'order' => 'DESC']) as $p) {
        $data = ldivn_form_data($p->ID);
        fputcsv($out, array_map(fn($key) => ldivn_form_value($data[$key] ?? ''), array_keys($form['columns'])));
    }
    fclose($out);
    exit;
});
