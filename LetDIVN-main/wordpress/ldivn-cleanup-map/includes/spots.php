<?php
// The cleanup spots: a post type edited in the admin (title, featured image,
// and the fields below with a map to pin the place), and the list the map shows.

defined('ABSPATH') || exit;

/** Meta fields of a spot, stored as "_ldm_<name>". */
const LDM_FIELDS = ['date', 'time', 'location', 'city', 'lat', 'lng', 'status', 'registered', 'details_url', 'register_url'];

add_action('init', function () {
    register_post_type(LDM_TYPE, [
        'labels' => [
            'name' => 'Bản đồ dọn rác',
            'singular_name' => 'Điểm dọn rác',
            'menu_name' => 'Bản đồ dọn rác',
            'all_items' => 'Các điểm dọn rác',
            'add_new' => 'Thêm điểm',
            'add_new_item' => 'Thêm điểm dọn rác',
            'edit_item' => 'Sửa điểm dọn rác',
            'new_item' => 'Điểm dọn rác',
            'search_items' => 'Tìm điểm',
            'not_found' => 'Chưa có điểm nào',
            'featured_image' => 'Ảnh sự kiện',
            'set_featured_image' => 'Chọn ảnh sự kiện',
        ],
        'public' => false,
        'show_ui' => true,
        'show_in_rest' => false,
        'menu_position' => 25,
        'menu_icon' => 'dashicons-location-alt',
        'supports' => ['title', 'thumbnail'],
    ]);
});

// The event photo is the featured image, even under a theme without them.
add_action('after_setup_theme', function () {
    if (!current_theme_supports('post-thumbnails')) {
        add_theme_support('post-thumbnails', [LDM_TYPE]);
    }
}, 99);

add_filter('enter_title_here', fn($text, $post) => $post->post_type === LDM_TYPE ? 'Tên sự kiện (vd. Hoan Kiem Lake Cleanup - Hanoi)' : $text, 10, 2);

function ldm_meta(int $id, string $name): string
{
    return (string) get_post_meta($id, '_ldm_' . $name, true);
}

// --- Edit screen ---------------------------------------------------------------------------

add_action('add_meta_boxes_' . LDM_TYPE, function () {
    add_meta_box('ldm-spot', 'Thông tin điểm dọn rác', 'ldm_spot_box', LDM_TYPE, 'normal', 'high');
});

function ldm_spot_box(WP_Post $post): void
{
    wp_nonce_field('ldm_save_spot', 'ldm_nonce');
    $v = [];
    foreach (LDM_FIELDS as $f) {
        $v[$f] = ldm_meta($post->ID, $f);
    }
    $s = ldm_settings();
    $field = function (string $name, string $label, string $attrs = '', string $hint = '') use ($v) {
        printf(
            '<p><label for="ldm-%1$s">%2$s</label><input id="ldm-%1$s" name="ldm[%1$s]" value="%3$s" class="widefat" %4$s>%5$s</p>',
            esc_attr($name),
            esc_html($label),
            esc_attr($v[$name]),
            $attrs,
            $hint !== '' ? '<span class="description">' . esc_html($hint) . '</span>' : ''
        );
    };
    ?>
    <div class="ldm-admin">
        <div class="ldm-admin-grid">
            <?php
            $field('date', 'Ngày diễn ra *', 'type="date" required');
            $field('time', 'Giờ', 'type="text" placeholder="07:00 - 10:30"');
            ?>
            <p class="ldm-wide"><label for="ldm-location">Địa điểm</label><input type="text" id="ldm-location" name="ldm[location]" value="<?php echo esc_attr($v['location']); ?>" class="widefat" placeholder="Hoan Kiem Lake, Hoan Kiem, Ha Noi"></p>
            <?php $field('city', 'Tỉnh / Thành phố', 'type="text" placeholder="Ha Noi"', 'Dùng để gắn sự kiện vào tỉnh ở cột bên trái bản đồ.'); ?>
            <p>
                <label for="ldm-status">Trạng thái</label>
                <select id="ldm-status" name="ldm[status]" class="widefat">
                    <option value="Upcoming" <?php selected($v['status'] !== 'Pending'); ?>>Sắp diễn ra</option>
                    <option value="Pending" <?php selected($v['status'], 'Pending'); ?>>Chờ duyệt (ghim có nhãn "Pending review")</option>
                </select>
            </p>
            <?php $field('registered', 'Số người đã đăng ký', 'type="number" min="0" step="1"', 'Để trống hoặc 0 thì không hiện.'); ?>
        </div>

        <h4>Vị trí trên bản đồ</h4>
        <p class="description">Gõ tên địa điểm rồi bấm <strong>Tìm</strong>, hoặc bấm thẳng lên bản đồ để đặt ghim. Kéo ghim để chỉnh cho chính xác.</p>
        <div class="ldm-admin-search">
            <input type="search" class="regular-text" placeholder="Tìm địa điểm, trường học, bãi biển..." aria-label="Tìm địa điểm">
            <button type="button" class="button">Tìm</button>
            <span class="ldm-admin-status" aria-live="polite"></span>
        </div>
        <div class="ldm-admin-map"></div>
        <div class="ldm-admin-grid">
            <?php
            $field('lat', 'Vĩ độ (lat)', 'type="text" inputmode="decimal" placeholder="21.0287"');
            $field('lng', 'Kinh độ (lng)', 'type="text" inputmode="decimal" placeholder="105.8524"');
            ?>
        </div>

        <h4>Nút trong khung thông tin</h4>
        <div class="ldm-admin-grid">
            <?php
            $field('details_url', 'Link nút "Details"', 'type="url" placeholder="https://..."', $s['details_url'] !== '' ? 'Để trống thì dùng link mặc định trong Cài đặt.' : 'Để trống thì không hiện nút.');
            $field('register_url', 'Link nút "Register"', 'type="url" placeholder="https://..."', $s['register_url'] !== '' ? 'Để trống thì dùng link mặc định trong Cài đặt.' : 'Để trống thì không hiện nút.');
            ?>
        </div>
        <p class="description">Ảnh hiện trong khung thông tin là <strong>Ảnh sự kiện</strong> ở cột bên phải.</p>
    </div>
    <?php
}

add_action('save_post_' . LDM_TYPE, function (int $post_id) {
    if (
        !isset($_POST['ldm_nonce'], $_POST['ldm'])
        || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['ldm_nonce'])), 'ldm_save_spot')
        || (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE)
        || !current_user_can('edit_post', $post_id)
    ) {
        return;
    }
    $in = (array) wp_unslash($_POST['ldm']);
    $get = fn($k) => isset($in[$k]) ? trim((string) $in[$k]) : '';

    $coord = function (string $raw, float $max) {
        $raw = str_replace(',', '.', $raw);
        return is_numeric($raw) && abs((float) $raw) <= $max ? (string) round((float) $raw, 6) : '';
    };
    $clean = [
        'date' => preg_match('/^\d{4}-\d{2}-\d{2}$/', $get('date')) ? $get('date') : '',
        'time' => sanitize_text_field($get('time')),
        'location' => sanitize_text_field($get('location')),
        'city' => sanitize_text_field($get('city')),
        'lat' => $coord($get('lat'), 90),
        'lng' => $coord($get('lng'), 180),
        'status' => $get('status') === 'Pending' ? 'Pending' : 'Upcoming',
        'registered' => $get('registered') === '' ? '' : (string) absint($get('registered')),
        'details_url' => esc_url_raw($get('details_url')),
        'register_url' => esc_url_raw($get('register_url')),
    ];
    foreach ($clean as $k => $val) {
        if ($val === '') {
            delete_post_meta($post_id, '_ldm_' . $k);
        } else {
            update_post_meta($post_id, '_ldm_' . $k, $val);
        }
    }
});

add_action('admin_enqueue_scripts', function ($hook) {
    $screen = get_current_screen();
    if (!in_array($hook, ['post.php', 'post-new.php'], true) || !$screen || $screen->post_type !== LDM_TYPE) {
        return;
    }
    wp_enqueue_style('ldm-leaflet', LDM_URL . 'assets/vendor/leaflet/leaflet.css', [], '1.9.4');
    wp_enqueue_script('ldm-leaflet', LDM_URL . 'assets/vendor/leaflet/leaflet.js', [], '1.9.4', true);
    wp_enqueue_style('ldm-admin', LDM_URL . 'assets/css/admin.css', ['ldm-leaflet'], LDM_VERSION);
    wp_enqueue_script('ldm-admin', LDM_URL . 'assets/js/admin.js', ['ldm-leaflet'], LDM_VERSION, true);
    wp_localize_script('ldm-admin', 'LDM_ADMIN', [
        'search' => rest_url('ldivn-map/v1/geocode/search'),
        'reverse' => rest_url('ldivn-map/v1/geocode/reverse'),
        'pin' => LDM_URL . 'assets/images/map-pin.png',
    ]);
});

// --- List screen -----------------------------------------------------------------------------

add_filter('manage_' . LDM_TYPE . '_posts_columns', function ($cols) {
    $out = [];
    foreach ($cols as $k => $label) {
        if ($k === 'date') {
            continue;
        }
        $out[$k] = $label;
        if ($k === 'title') {
            $out['ldm_date'] = 'Ngày diễn ra';
            $out['ldm_city'] = 'Tỉnh / Thành phố';
            $out['ldm_pin'] = 'Ghim';
        }
    }
    return $out;
});

add_action('manage_' . LDM_TYPE . '_posts_custom_column', function ($col, $id) {
    if ($col === 'ldm_date') {
        $date = ldm_meta($id, 'date');
        echo $date !== '' ? esc_html(date_i18n('d/m/Y', strtotime($date))) : '—';
        if ($date !== '' && strtotime($date . ' 23:59:59') < current_time('timestamp')) {
            echo ' <span style="color:#8c8f94">(đã qua)</span>';
        }
    } elseif ($col === 'ldm_city') {
        echo esc_html(ldm_meta($id, 'city') ?: '—');
    } elseif ($col === 'ldm_pin') {
        $lat = ldm_meta($id, 'lat');
        $lng = ldm_meta($id, 'lng');
        echo $lat !== '' && $lng !== '' ? esc_html("$lat, $lng") : '<span style="color:#b32d2e">Chưa ghim</span>';
        if (ldm_meta($id, 'status') === 'Pending') {
            echo '<br><span style="color:#b26200">Chờ duyệt</span>';
        }
        if (ldm_meta($id, 'sample') === '1') {
            echo '<br><span style="color:#2271b1">Điểm mẫu</span>';
        }
    }
}, 10, 2);

add_filter('manage_edit-' . LDM_TYPE . '_sortable_columns', fn($cols) => $cols + ['ldm_date' => 'ldm_date']);

add_action('pre_get_posts', function (WP_Query $q) {
    if (!is_admin() || !$q->is_main_query() || $q->get('post_type') !== LDM_TYPE) {
        return;
    }
    $orderby = $q->get('orderby');
    if ($orderby === 'ldm_date' || $orderby === '') {
        // Spots with no date yet stay in the list (at the end).
        $q->set('meta_query', [
            'relation' => 'OR',
            'ldm_date' => ['key' => '_ldm_date', 'compare' => 'EXISTS'],
            ['key' => '_ldm_date', 'compare' => 'NOT EXISTS'],
        ]);
        $q->set('orderby', 'ldm_date');
        $q->set('order', $q->get('order') ?: 'DESC');
    }
});

// --- What the map shows -------------------------------------------------------------------

/** Every event for the map: the spots here, plus the events of "Let's Do It Vietnam – Core" when it is on. */
function ldm_events(): array
{
    $s = ldm_settings();
    $out = [];

    foreach (get_posts([
        'post_type' => LDM_TYPE,
        'post_status' => 'publish',
        'numberposts' => -1,
        'no_found_rows' => true,
    ]) as $p) {
        $date = ldm_meta($p->ID, 'date');
        if ($date === '') {
            continue;
        }
        $id = (string) $p->ID;
        $title = get_the_title($p);
        $lat = ldm_meta($p->ID, 'lat');
        $lng = ldm_meta($p->ID, 'lng');
        $out[] = [
            'id' => 'spot-' . $id,
            'title' => html_entity_decode($title, ENT_QUOTES, 'UTF-8'),
            'date' => $date,
            'time' => ldm_meta($p->ID, 'time'),
            'location' => ldm_meta($p->ID, 'location'),
            'city' => ldm_meta($p->ID, 'city'),
            'lat' => $lat !== '' ? (float) $lat : null,
            'lng' => $lng !== '' ? (float) $lng : null,
            'image' => (string) get_the_post_thumbnail_url($p, 'medium_large'),
            'pending' => ldm_meta($p->ID, 'status') === 'Pending',
            'sample' => ldm_meta($p->ID, 'sample') === '1', // includes/samples.php
            'registered' => (int) ldm_meta($p->ID, 'registered'),
            'detailsUrl' => ldm_meta($p->ID, 'details_url') ?: ldm_link($s['details_url'], $id, $p->post_name, $title),
            'registerUrl' => ldm_meta($p->ID, 'register_url') ?: ldm_link($s['register_url'], $id, $p->post_name, $title),
        ];
    }

    // The same events as the site's own map, whose campaign pages the popups open.
    if ($s['core_events'] && function_exists('ldivn_get_events')) {
        foreach ((array) ldivn_get_events() as $e) {
            $out[] = ldm_site_event($e, untrailingslashit(home_url()));
        }
    } elseif ($s['site_events'] && $s['site_url'] !== '') {
        foreach (ldm_fetch_site_events($s['site_url']) as $e) {
            $out[] = ldm_site_event($e, $s['site_url']);
        }
    }

    $seen = [];
    $out = array_values(array_filter($out, function ($e) use (&$seen) {
        if ($e === null || isset($seen[$e['id']])) {
            return false;
        }
        return $seen[$e['id']] = true;
    }));

    return apply_filters('ldivn_map_events', $out);
}

/**
 * An event of the Let's Do It Vietnam website (its /api/events), for the map:
 * "Details" opens its campaign page there, "Register" that page with the
 * sign-up form open (?register=<id>).
 */
function ldm_site_event($e, string $site): ?array
{
    if (!is_array($e) || empty($e['date']) || empty($e['id'])) {
        return null;
    }
    $id = (string) $e['id'];
    $at = $e['coordinates'] ?? null;
    $image = (string) ($e['image'] ?? '');
    $page = $site . '/explore-campaigns/' . rawurlencode($id) . '/';
    return [
        'id' => $id,
        'title' => (string) ($e['title'] ?? ''),
        'date' => (string) $e['date'],
        'time' => (string) ($e['time'] ?? ''),
        'location' => (string) ($e['location'] ?? ''),
        'city' => (string) ($e['city'] ?? ''),
        'lat' => is_array($at) && is_numeric($at['lat'] ?? null) ? (float) $at['lat'] : null,
        'lng' => is_array($at) && is_numeric($at['lng'] ?? null) ? (float) $at['lng'] : null,
        'image' => strpos($image, '/') === 0 && strpos($image, '//') !== 0 ? $site . $image : $image,
        'pending' => ($e['status'] ?? '') === 'Pending',
        'registered' => (int) ($e['registeredCount'] ?? 0),
        'detailsUrl' => esc_url_raw($page),
        'registerUrl' => esc_url_raw($page . '?register=' . rawurlencode($id)),
    ];
}

/** The website's events, fetched at most every 10 minutes; its last good answer while it can't be reached. */
function ldm_fetch_site_events(string $site): array
{
    $key = 'ldm_site_events_' . md5($site);
    $cached = get_transient($key);
    if (is_array($cached)) {
        return $cached;
    }
    $res = wp_remote_get($site . '/api/events', ['timeout' => 8, 'headers' => ['Accept' => 'application/json']]);
    $data = !is_wp_error($res) && wp_remote_retrieve_response_code($res) === 200
        ? json_decode(wp_remote_retrieve_body($res), true)
        : null;
    if (!is_array($data)) {
        $last = get_option($key . '_last', []);
        $last = is_array($last) ? $last : [];
        set_transient($key, $last, 2 * MINUTE_IN_SECONDS); // try again soon
        return $last;
    }
    set_transient($key, $data, 10 * MINUTE_IN_SECONDS);
    update_option($key . '_last', $data, false);
    return $data;
}
