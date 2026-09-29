<?php
// Volunteer sign-up: the "Register to Volunteer" form of the website, on this
// site. It opens from the map's Register buttons, from any link to "#volunteer"
// (a menu item, a button) and from [ldivn_volunteer_button]; [ldivn_volunteer_form]
// puts it straight on a page. Sign-ups are kept here (menu "Tình nguyện viên",
// downloadable for Excel) and, when set, sent on to the website and its Google Sheet.

defined('ABSPATH') || exit;

const LDV_TYPE = 'ldm_volunteer';
const LDV_JOIN_AS = ['individual' => 'Cá nhân', 'group' => 'Nhóm', 'organization' => 'Tổ chức'];
const LDV_ROLES = ['Clean-up', 'Media', 'Leader', 'Logistics'];
/** The website's sign-up sheet (the same default as its form). */
const LDV_SHEET_ID = '1NhKYRQwjF3L2rVt9KgVLIjYZVFFUwvuts8uD-8EDVYw';

/** Column => label, in the admin and the downloaded file. */
const LDV_COLUMNS = [
    'fullName' => 'Họ tên / người liên hệ',
    'phone' => 'Điện thoại',
    'email' => 'Email',
    'birthDate' => 'Ngày sinh',
    'city' => 'Địa chỉ',
    'eventName' => 'Dự án / chiến dịch',
    'joinAs' => 'Tham gia với tư cách',
    'organizationName' => 'Tên nhóm / tổ chức',
    'participants' => 'Số người',
    'preferredRole' => 'Vai trò',
    'registeredAt' => 'Thời gian đăng ký',
    'forwarded' => 'Gửi về website',
];

/** Column => label of the Excel download: the same as the website's admin gave. */
const LDV_EXPORT_COLUMNS = [
    'fullName' => 'Họ tên',
    'joinAs' => 'Hình thức',
    'participants' => 'Số người',
    'email' => 'Email',
    'phone' => 'Điện thoại',
    'city' => 'Địa chỉ',
    'eventName' => 'Sự kiện',
    'preferredRole' => 'Vai trò',
    'birthDate' => 'Ngày sinh',
    'notes' => 'Ghi chú',
    'registeredAt' => 'Ngày đăng ký',
];

// --- Admin: the list of sign-ups ---------------------------------------------------------------

add_action('init', function () {
    register_post_type(LDV_TYPE, [
        'labels' => [
            'name' => 'Tình nguyện viên',
            'singular_name' => 'Đăng ký tình nguyện viên',
            'menu_name' => 'Tình nguyện viên',
            'all_items' => 'Danh sách đăng ký',
            'edit_item' => 'Xem đăng ký',
            'search_items' => 'Tìm đăng ký',
            'not_found' => 'Chưa có ai đăng ký',
            'not_found_in_trash' => 'Thùng rác trống',
        ],
        'public' => false,
        'show_ui' => true,
        'show_in_rest' => false,
        'menu_position' => 26,
        'menu_icon' => 'dashicons-groups',
        'supports' => ['title'],
        'capability_type' => 'post',
        'capabilities' => ['create_posts' => 'do_not_allow'],
        'map_meta_cap' => true,
    ]);
});

function ldv_data(int $id): array
{
    $data = json_decode((string) get_post_meta($id, '_ldv_data', true), true);
    return is_array($data) ? $data : [];
}

function ldv_value(array $data, string $key): string
{
    $v = $data[$key] ?? '';
    if ($key === 'joinAs') {
        return LDV_JOIN_AS[$v] ?? (string) $v;
    }
    if ($key === 'registeredAt' && $v !== '') {
        $t = strtotime((string) $v);
        return $t ? wp_date('d/m/Y H:i', $t) : (string) $v;
    }
    return is_array($v) ? implode(', ', array_map('strval', $v)) : (string) $v;
}

add_filter('manage_' . LDV_TYPE . '_posts_columns', function ($cols) {
    return [
        'cb' => $cols['cb'],
        'title' => 'Họ tên',
        'ldv_phone' => 'Điện thoại',
        'ldv_email' => 'Email',
        'ldv_eventName' => 'Dự án / chiến dịch',
        'ldv_joinAs' => 'Tư cách',
        'ldv_participants' => 'Số người',
        'ldv_registeredAt' => 'Thời gian',
    ];
});

add_action('manage_' . LDV_TYPE . '_posts_custom_column', function ($col, $id) {
    if (strpos($col, 'ldv_') === 0) {
        $data = ldv_data((int) $id);
        $key = substr($col, 4);
        $text = ldv_value($data, $key);
        if ($key === 'joinAs' && !empty($data['organizationName'])) {
            $text .= ': ' . $data['organizationName'];
        }
        echo esc_html($text !== '' ? $text : '—');
    }
}, 10, 2);

// One sign-up: every field, read-only.
add_action('add_meta_boxes_' . LDV_TYPE, function (WP_Post $post) {
    remove_meta_box('submitdiv', LDV_TYPE, 'side');
    add_meta_box('ldv-data', 'Thông tin đăng ký', function (WP_Post $post) {
        $data = ldv_data($post->ID);
        echo '<table class="widefat striped"><tbody>';
        foreach (LDV_COLUMNS as $key => $label) {
            $text = ldv_value($data, $key);
            if ($text !== '') {
                printf('<tr><th style="width:220px">%s</th><td>%s</td></tr>', esc_html($label), esc_html($text));
            }
        }
        echo '</tbody></table>';
        printf('<p><a class="button" href="%s">&larr; Danh sách</a> <a class="button button-link-delete" href="%s">Xoá</a></p>', esc_url(admin_url('edit.php?post_type=' . LDV_TYPE)), esc_url((string) get_delete_post_link($post->ID)));
    }, LDV_TYPE, 'normal', 'high');
});

add_filter('post_row_actions', function ($actions, $post) {
    if ($post->post_type === LDV_TYPE) {
        unset($actions['inline hide-if-no-js']);
        if (isset($actions['edit'])) {
            $actions['edit'] = sprintf('<a href="%s">Xem</a>', esc_url((string) get_edit_post_link($post->ID)));
        }
    }
    return $actions;
}, 10, 2);

add_filter('display_post_states', fn($states, $post) => $post->post_type === LDV_TYPE ? [] : $states, 10, 2);

add_action('admin_head-post.php', function () {
    if (get_post_type() === LDV_TYPE) {
        echo '<script>document.addEventListener("DOMContentLoaded",function(){var t=document.getElementById("title");if(t)t.readOnly=true;});</script>';
    }
});

// "Tải về Excel" next to the list's title.
add_action('admin_head-edit.php', function () {
    if (($GLOBALS['typenow'] ?? '') !== LDV_TYPE) {
        return;
    }
    // Not wp_nonce_url(): it HTML-escapes the "&", which a script's link keeps as is.
    $url = add_query_arg(['action' => 'ldv_export', '_wpnonce' => wp_create_nonce('ldv_export')], admin_url('admin-post.php'));
    echo '<script>document.addEventListener("DOMContentLoaded",function(){var h=document.querySelector(".wp-heading-inline");if(h){var a=document.createElement("a");a.className="page-title-action";a.href=' . wp_json_encode($url) . ';a.textContent="Tải về Excel";h.after(a);}});</script>';
});

/** A cell of the Excel download (the number of people stays a number). */
function ldv_export_value(array $data, string $key)
{
    if ($key === 'joinAs') {
        // "Cá nhân", or "Nhóm: <name>" / "Tổ chức: <name>".
        $join = (string) ($data['joinAs'] ?? '');
        $label = LDV_JOIN_AS[$join] ?? 'Cá nhân';
        return $join !== 'individual' && !empty($data['organizationName']) ? $label . ': ' . $data['organizationName'] : $label;
    }
    if ($key === 'participants') {
        return is_numeric($data['participants'] ?? null) ? (int) $data['participants'] : '';
    }
    if ($key === 'registeredAt') {
        $t = strtotime((string) ($data['registeredAt'] ?? ''));
        return $t ? wp_date('H:i j/n/y', $t) : '';
    }
    return ldv_value($data, $key);
}

add_action('admin_post_ldv_export', function () {
    check_admin_referer('ldv_export');
    if (!current_user_can('edit_posts')) {
        wp_die('Không có quyền.');
    }
    $rows = [];
    foreach (get_posts(['post_type' => LDV_TYPE, 'post_status' => 'any', 'numberposts' => -1, 'orderby' => 'date', 'order' => 'DESC']) as $p) {
        $data = ldv_data($p->ID);
        $rows[] = array_map(fn($key) => ldv_export_value($data, $key), array_keys(LDV_EXPORT_COLUMNS));
    }
    $file = ldv_xlsx('Tình nguyện viên', array_values(LDV_EXPORT_COLUMNS), $rows);

    // Nothing printed before by other plugins may end up in the file.
    while (ob_get_level()) {
        ob_end_clean();
    }
    nocache_headers();
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment; filename="tinh-nguyen-vien-' . wp_date('Y-m-d') . '.xlsx"');
    header('Content-Length: ' . strlen($file));
    echo $file;
    exit;
});

// --- The form's events and sign-ups (admin-ajax: works even where the REST API is closed) ----

/** Projects the form offers: the map's events that haven't passed, soonest first. */
function ldv_events(): array
{
    $today = wp_date('Y-m-d');
    $all = [];
    foreach (ldm_events() as $e) {
        $all[$e['id']] = ['id' => $e['id'], 'title' => $e['title'], 'date' => $e['date']];
    }
    $upcoming = array_filter($all, fn($e) => $e['date'] >= $today);
    usort($upcoming, fn($a, $b) => strcmp($a['date'], $b['date']));
    return ['upcoming' => array_values($upcoming), 'all' => $all];
}

add_action('wp_ajax_ldv_events', 'ldv_ajax_events');
add_action('wp_ajax_nopriv_ldv_events', 'ldv_ajax_events');
function ldv_ajax_events(): void
{
    $list = ldv_events();
    $events = $list['upcoming'];
    // A Register button of a passed event still preselects it.
    $want = isset($_GET['event']) ? sanitize_text_field(wp_unslash($_GET['event'])) : '';
    if ($want !== '' && isset($list['all'][$want]) && !in_array($want, array_column($events, 'id'), true)) {
        array_unshift($events, $list['all'][$want]);
    }
    wp_send_json(['events' => $events]);
}

add_action('wp_ajax_ldv_submit', 'ldv_ajax_submit');
add_action('wp_ajax_nopriv_ldv_submit', 'ldv_ajax_submit');
function ldv_ajax_submit(): void
{
    $in = wp_unslash($_POST);
    $get = fn($k) => isset($in[$k]) && is_scalar($in[$k]) ? trim((string) $in[$k]) : '';
    $fail = fn($msg) => wp_send_json(['ok' => false, 'error' => $msg], 400);

    // A field people don't see: filled in, it is a bot. Answer as if it worked.
    if ($get('website') !== '') {
        wp_send_json(['ok' => true]);
    }

    // At most 10 sign-ups from one address every 10 minutes.
    $ip = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : '';
    $rate_key = 'ldv_rate_' . md5($ip);
    $count = (int) get_transient($rate_key);
    if ($count >= 10) {
        $fail('Too many registrations from this connection. Please try again in a few minutes.');
    }

    $join = array_key_exists($get('joinAs'), LDV_JOIN_AS) ? $get('joinAs') : 'individual';
    $team = $join !== 'individual';
    $role = in_array($get('role'), LDV_ROLES, true) ? $get('role') : 'Clean-up';
    $name = sanitize_text_field($get('fullName'));
    $email = sanitize_email($get('email'));
    $phone = substr(preg_replace('/(?!^)\+/', '', preg_replace('/[^\d+]/', '', $get('phone'))), 0, 16);
    $address = sanitize_text_field($get('address'));
    $org = $team ? sanitize_text_field($get('organizationName')) : '';
    $birth = $team ? '' : $get('birthDate');
    $people = $team ? absint($get('participants')) : 1;

    if ($name === '' || $address === '') {
        $fail('Please fill in every required field.');
    }
    if (!is_email($email)) {
        $fail('Please enter a valid email address.');
    }
    if ($team && $org === '') {
        $fail('Please enter the ' . ($join === 'organization' ? 'organization' : 'group') . ' name.');
    }
    if (!$team && !ldv_valid_birth($birth)) {
        $fail('Please enter a valid date of birth (dd/mm/yyyy) between 1900 and 2050');
    }
    if ($people < 1 || $people > 99999) {
        $fail('Please enter the number of participants.');
    }

    $events = ldv_events()['all'];
    $event_id = $get('eventId');
    if ($event_id !== '' && !isset($events[$event_id])) {
        $fail('Please select a project or campaign.');
    }
    if ($event_id === '' && $events) {
        $fail('Please select a project or campaign.');
    }
    $event_name = $event_id !== '' ? $events[$event_id]['title'] : 'World Cleanup Day ' . wp_date('Y');

    $data = [
        'fullName' => mb_substr($name, 0, 200),
        'phone' => $phone,
        'email' => $email,
        'birthDate' => $birth,
        'city' => mb_substr($address, 0, 300),
        'eventId' => $event_id,
        'eventName' => $event_name,
        'joinAs' => $join,
        'organizationName' => mb_substr($org, 0, 200),
        'participants' => $people,
        'preferredRole' => $role,
        'registeredAt' => wp_date('c'),
    ];
    $post_id = wp_insert_post([
        'post_type' => LDV_TYPE,
        'post_status' => 'publish',
        'post_title' => wp_slash($data['fullName']),
        'meta_input' => ['_ldv_data' => wp_slash(wp_json_encode($data, JSON_UNESCAPED_UNICODE))],
    ], true);
    if (is_wp_error($post_id) || !$post_id) {
        $fail('Sorry, your registration could not be saved. Please try again.');
    }
    set_transient($rate_key, $count + 1, 10 * MINUTE_IN_SECONDS);

    // A spot added on this site counts its sign-ups on the map.
    if (strpos($event_id, 'spot-') === 0) {
        $spot = (int) substr($event_id, 5);
        update_post_meta($spot, '_ldm_registered', (string) ((int) ldm_meta($spot, 'registered') + 1));
    }

    // Sending on (website, Google Sheet, email) happens after the answer has gone out.
    add_action('shutdown', function () use ($post_id, $data) {
        if (function_exists('fastcgi_finish_request')) {
            fastcgi_finish_request();
        } elseif (function_exists('litespeed_finish_request')) {
            litespeed_finish_request();
        }
        ldv_after_signup((int) $post_id, $data);
    });

    wp_send_json(['ok' => true]);
}

function ldv_valid_birth(string $text): bool
{
    if (!preg_match('/^(\d{2})\/(\d{2})\/(\d{4})$/', $text, $m)) {
        return false;
    }
    [$d, $mo, $y] = [(int) $m[1], (int) $m[2], (int) $m[3]];
    return checkdate($mo, $d, $y) && $y >= 1900 && $y <= 2050;
}

/** The website the map's events come from, where sign-ups are sent on ('' = none). */
function ldv_forward_site(): string
{
    $s = ldm_settings();
    if (!$s['vol_forward'] || !$s['site_events'] || ($s['core_events'] && function_exists('ldivn_get_events'))) {
        return '';
    }
    return (string) $s['site_url'];
}

/**
 * After a sign-up: to the website like its own form does (the sign-up, so its
 * event counts it, and the row of its Google Sheet), and an email when set.
 */
function ldv_after_signup(int $post_id, array $data): void
{
    $s = ldm_settings();
    $site = ldv_forward_site();
    $team = $data['joinAs'] !== 'individual';
    $team_label = $data['joinAs'] === 'organization' ? 'Tổ chức' : 'Nhóm';

    if ($site !== '') {
        $results = [];
        $send = function (string $path, array $body) use ($site, &$results) {
            $res = wp_remote_post($site . $path, [
                'timeout' => 15,
                'headers' => ['Content-Type' => 'application/json'],
                'body' => wp_json_encode($body),
            ]);
            $results[] = !is_wp_error($res) && wp_remote_retrieve_response_code($res) === 200;
        };

        // Only the website's own events are in its database.
        if ($data['eventId'] !== '' && strpos($data['eventId'], 'spot-') !== 0) {
            $send('/api/volunteers', [
                'fullName' => $data['fullName'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'city' => $data['city'],
                'eventId' => $data['eventId'],
                'eventName' => $data['eventName'],
                'ageGroup' => $data['birthDate'],
                'tshirtSize' => 'L',
                'emergencyContact' => $data['phone'],
                'skills' => [$data['preferredRole']],
                'status' => 'Approved',
                'joinAs' => $data['joinAs'],
                'organizationName' => $team ? $data['organizationName'] : null,
                'participants' => $data['participants'],
                'preferredRole' => $data['preferredRole'],
                'notes' => 'Đăng ký từ ' . wp_parse_url(home_url(), PHP_URL_HOST),
            ]);
        }

        // Columns A-J of the sheet: ID, time, name, phone, email, address, age, project, skills, status.
        $time = (new DateTime('now', new DateTimeZone('Asia/Ho_Chi_Minh')))->format('H:i:s j/n/Y');
        $skills = $team ? [$data['preferredRole'], $team_label . ': ' . $data['organizationName'], $data['participants'] . ' người'] : [$data['preferredRole']];
        $send('/api/sheets/append', [
            'spreadsheetId' => LDV_SHEET_ID,
            'rowValues' => [
                'VOL-' . substr((string) floor(microtime(true) * 1000), -6),
                $time,
                $data['fullName'],
                $data['phone'],
                $data['email'],
                $data['city'],
                $team ? $team_label : $data['birthDate'],
                $data['eventName'],
                implode(', ', $skills),
                'Approved',
            ],
        ]);

        $ok = !in_array(false, $results, true);
        $data['forwarded'] = $ok ? 'Đã gửi' : 'Lỗi, chưa gửi được';
        update_post_meta($post_id, '_ldv_data', wp_slash(wp_json_encode($data, JSON_UNESCAPED_UNICODE)));
        // The map shows the new count on its next load.
        delete_transient('ldm_site_events_' . md5($site));
    }

    $to = array_filter(array_map('trim', explode(',', (string) $s['vol_email'])), 'is_email');
    if ($to) {
        $lines = [];
        foreach (LDV_COLUMNS as $key => $label) {
            $text = ldv_value($data, $key);
            if ($text !== '' && $key !== 'forwarded') {
                $lines[] = $label . ': ' . $text;
            }
        }
        $lines[] = '';
        $lines[] = 'Danh sách: ' . admin_url('edit.php?post_type=' . LDV_TYPE);
        wp_mail($to, 'Đăng ký tình nguyện viên mới: ' . $data['fullName'], implode("\n", $lines), ['Reply-To: ' . $data['fullName'] . ' <' . $data['email'] . '>']);
    }
}

// --- On the pages ------------------------------------------------------------------------------

add_action('init', function () {
    if (is_admin()) {
        return;
    }
    wp_register_style('ldv', LDM_URL . 'assets/css/volunteer.css', [], LDM_VERSION);
    wp_register_script('ldv', LDM_URL . 'assets/js/volunteer.js', [], LDM_VERSION, true);
});

/** Loads the form's files (once), with what it needs to know. */
function ldv_enqueue(): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    $s = ldm_settings();
    wp_enqueue_style('ldv');
    wp_enqueue_script('ldv');
    wp_add_inline_script('ldv', 'window.LDIVN_VOLUNTEER = ' . wp_json_encode([
        'ajax' => admin_url('admin-ajax.php'),
        'logo' => LDM_URL . 'assets/images/logo-icon-light.png',
        'photo' => LDM_URL . 'assets/images/volunteer.jpg',
        'onMap' => (bool) $s['vol_on_map'],
    ]) . ';', 'before');
}

add_action('wp_enqueue_scripts', function () {
    $s = ldm_settings();
    $post = get_post();
    $content = is_singular() && $post ? (string) $post->post_content : '';
    if (
        $s['vol_everywhere']
        || has_shortcode($content, 'ldivn_volunteer_form')
        || has_shortcode($content, 'ldivn_volunteer_button')
        || ($s['vol_on_map'] && has_shortcode($content, 'ldivn_cleanup_map'))
    ) {
        ldv_enqueue();
    }
});

add_shortcode('ldivn_volunteer_form', function ($atts) {
    $a = shortcode_atts(['event' => ''], $atts, 'ldivn_volunteer_form');
    ldv_enqueue();
    return sprintf(
        '<div class="ldv-inline" data-ldv-form="%s"><noscript><p>%s</p></noscript></div>',
        esc_attr($a['event']),
        esc_html__('Please turn on JavaScript to register.', 'ldivn-map')
    );
});

add_shortcode('ldivn_volunteer_button', function ($atts) {
    $a = shortcode_atts(['text' => 'Register to Volunteer', 'event' => ''], $atts, 'ldivn_volunteer_button');
    ldv_enqueue();
    return sprintf(
        '<a href="#volunteer" class="ldv-button" data-ldv-open data-ldv-event="%s"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg><span>%s</span></a>',
        esc_attr($a['event']),
        esc_html($a['text'])
    );
});
