<?php
// Videos: YouTube videos edited in the admin (menu "Video": a title and a
// link), shown by [ldivn_videos] as the Let's Do It Vietnam video block: the
// list on the left, the player on the right (assets/css/videos.css, assets/js/videos.js).

defined('ABSPATH') || exit;

const LDMV_TYPE = 'ldm_video';

/** The website's videos, in its order: what the menu starts with. [YouTube id, title] */
const LDMV_DEFAULTS = [
    ['AgFZY3nOg-I', 'VTC1: World Cleanup Day 2020'],
    ['08F5yZfP84w', "VTV4: Let's Do It Hanoi cùng World Cleanup Day 2022"],
    ['n8NavDVZYHA', "VTV3: Cafe Sáng cùng Let's Do It Hanoi"],
    ['A4a9GUQgFkQ', 'VTC1: World Cleanup Day 2019'],
    ['Qa4vswalUJ8', "VnExpress: Let's Do It Hanoi cùng World Cleanup Day 2019"],
    ['dTJljTTnaB4', 'BBC News: World Cleanup Day 2019'],
    ['esQFYiJL6ug', 'VTV3: World Cleanup Day 2019'],
    ['IM141ngq-UY', "AFP: World Cleanup Day 2022 Let's Do It Hanoi"],
    ['wrQCjdnpnS8', 'Hà Nội 1 TV: Chiến dịch World Cleanup Day 2022'],
    ['06yskxQXMV0', 'Truyền hình Quốc Phòng: Chiến dịch World Cleanup Day 2022'],
    ['D3ZKs-li0pc', "[Báo Lao Động] Let's Do It! Hanoi: Chiến dịch World Cleanup Day 2020 tại Hà Nội"],
];

add_action('init', function () {
    register_post_type(LDMV_TYPE, [
        'labels' => [
            'name' => 'Video',
            'singular_name' => 'Video',
            'menu_name' => 'Video',
            'all_items' => 'Tất cả video',
            'add_new' => 'Thêm video',
            'add_new_item' => 'Thêm video',
            'edit_item' => 'Sửa video',
            'search_items' => 'Tìm video',
            'not_found' => 'Chưa có video nào',
        ],
        'public' => false,
        'show_ui' => true,
        'show_in_rest' => false,
        'menu_position' => 27,
        'menu_icon' => 'dashicons-video-alt3',
        'supports' => ['title', 'page-attributes'],
    ]);
});

/** The YouTube id in a link (watch?v=, youtu.be/, embed/, shorts/, live/), or '' . */
function ldmv_youtube_id(string $url): string
{
    $url = trim($url);
    if (preg_match('~^[\w-]{11}$~', $url)) {
        return $url;
    }
    return preg_match('~(?:youtube(?:-nocookie)?\.com/(?:watch\?(?:[^#]*&)?v=|embed/|shorts/|live/)|youtu\.be/)([\w-]{11})~', $url, $m) ? $m[1] : '';
}

/** The videos to show: [['id' => YouTube id, 'title' => ...]], in the menu's order. */
function ldmv_videos(): array
{
    $out = [];
    foreach (get_posts([
        'post_type' => LDMV_TYPE,
        'post_status' => 'publish',
        'numberposts' => -1,
        'orderby' => ['menu_order' => 'ASC', 'date' => 'DESC'],
        'no_found_rows' => true,
    ]) as $p) {
        $id = ldmv_youtube_id((string) get_post_meta($p->ID, '_ldmv_url', true));
        if ($id !== '') {
            $out[] = ['id' => $id, 'title' => html_entity_decode(get_the_title($p), ENT_QUOTES, 'UTF-8')];
        }
    }
    return $out;
}

/** The menu starts with the website's videos (once, when it has none). */
function ldmv_seed(): void
{
    if (get_option('ldmv_seeded')) {
        return;
    }
    update_option('ldmv_seeded', 1, false);
    if (get_posts(['post_type' => LDMV_TYPE, 'post_status' => 'any', 'numberposts' => 1, 'fields' => 'ids'])) {
        return;
    }
    foreach (LDMV_DEFAULTS as $i => [$id, $title]) {
        wp_insert_post([
            'post_type' => LDMV_TYPE,
            'post_status' => 'publish',
            'post_title' => wp_slash($title),
            'menu_order' => $i + 1,
            'meta_input' => ['_ldmv_url' => 'https://www.youtube.com/watch?v=' . $id],
        ]);
    }
}
add_action('admin_init', 'ldmv_seed');

// --- Admin ------------------------------------------------------------------------------------

add_action('add_meta_boxes_' . LDMV_TYPE, function () {
    add_meta_box('ldmv-url', 'Link YouTube', function (WP_Post $post) {
        wp_nonce_field('ldmv_save', 'ldmv_nonce');
        $url = (string) get_post_meta($post->ID, '_ldmv_url', true);
        printf('<p><input type="url" name="ldmv_url" value="%s" class="widefat" placeholder="https://www.youtube.com/watch?v=..." required></p>', esc_attr($url));
        echo '<p class="description">Dán link video YouTube. Thứ tự trong danh sách: ô <strong>Order</strong> (Thứ tự) ở cột phải, số nhỏ đứng trước.</p>';
        $id = ldmv_youtube_id($url);
        if ($id !== '') {
            printf('<p><img src="https://img.youtube.com/vi/%s/hqdefault.jpg" alt="" style="max-width:320px;border-radius:8px"></p>', esc_attr($id));
        }
    }, LDMV_TYPE, 'normal', 'high');
});

add_action('save_post_' . LDMV_TYPE, function (int $post_id) {
    if (
        !isset($_POST['ldmv_nonce'], $_POST['ldmv_url'])
        || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['ldmv_nonce'])), 'ldmv_save')
        || (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE)
        || !current_user_can('edit_post', $post_id)
    ) {
        return;
    }
    update_post_meta($post_id, '_ldmv_url', esc_url_raw(trim((string) wp_unslash($_POST['ldmv_url']))));
});

add_filter('manage_' . LDMV_TYPE . '_posts_columns', fn($cols) => [
    'cb' => $cols['cb'],
    'ldmv_thumb' => 'Ảnh',
    'title' => $cols['title'],
    'ldmv_order' => 'Thứ tự',
]);

add_action('manage_' . LDMV_TYPE . '_posts_custom_column', function ($col, $id) {
    if ($col === 'ldmv_thumb') {
        $yt = ldmv_youtube_id((string) get_post_meta($id, '_ldmv_url', true));
        echo $yt !== ''
            ? sprintf('<img src="https://img.youtube.com/vi/%s/default.jpg" alt="" style="width:80px;border-radius:6px">', esc_attr($yt))
            : '<span style="color:#b32d2e">Link chưa đúng</span>';
    } elseif ($col === 'ldmv_order') {
        echo (int) get_post_field('menu_order', $id);
    }
}, 10, 2);

// The list in the order the block shows.
add_action('pre_get_posts', function (WP_Query $q) {
    if (is_admin() && $q->is_main_query() && $q->get('post_type') === LDMV_TYPE && !$q->get('orderby')) {
        $q->set('orderby', ['menu_order' => 'ASC', 'date' => 'DESC']);
    }
});

add_action('admin_head-edit.php', function () {
    if (($GLOBALS['typenow'] ?? '') === LDMV_TYPE) {
        echo '<style>.column-ldmv_thumb{width:96px}.column-ldmv_order{width:80px}</style>';
    }
});

// --- [ldivn_videos] ---------------------------------------------------------------------------

add_shortcode('ldivn_videos', function () {
    $videos = ldmv_videos();
    if (!$videos) {
        return '';
    }
    // Printed right here, so the block is styled as soon as it shows (also inside page builders).
    wp_register_style('ldmv', LDM_URL . 'assets/css/videos.css', [], LDM_VERSION);
    wp_enqueue_script('ldmv', LDM_URL . 'assets/js/videos.js', [], LDM_VERSION, true);
    ob_start();
    wp_print_styles('ldmv');
    return ob_get_clean() . ldmv_render($videos);
});

/** The block's HTML: the list (the first video chosen) and the player. */
function ldmv_render(array $videos): string
{
    $play = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>';
    $youtube = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>';

    $items = '';
    foreach ($videos as $i => $v) {
        $items .= '<button type="button" class="ldmv-item' . ($i === 0 ? ' is-active' : '') . '"'
            . ' data-ldmv-id="' . esc_attr($v['id']) . '" data-ldmv-title="' . esc_attr($v['title']) . '"' . ($i === 0 ? ' aria-current="true"' : '') . '>'
            . '<span class="ldmv-thumb"><img src="https://img.youtube.com/vi/' . esc_attr($v['id']) . '/hqdefault.jpg" alt="" loading="lazy"><span class="ldmv-play">' . $play . '</span></span>'
            . '<span class="ldmv-item-title">' . esc_html($v['title']) . '</span>'
            . '</button>';
    }
    $first = $videos[0];

    return '<div class="ldmv">'
        . '<div class="ldmv-list ldmv-card">'
        . '<div class="ldmv-head"><span class="ldmv-count">' . $youtube . count($videos) . ' Videos</span><span class="ldmv-hd">HD 1080p</span></div>'
        . '<div class="ldmv-items">' . $items . '</div>'
        . '</div>'
        . '<div class="ldmv-player ldmv-card">'
        . '<div class="ldmv-frame"><iframe src="https://www.youtube.com/embed/' . esc_attr($first['id']) . '" title="' . esc_attr($first['title']) . '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>'
        . '<div class="ldmv-bar"><div class="ldmv-now-wrap"><span class="ldmv-dot"></span><h3 class="ldmv-now">' . esc_html($first['title']) . '</h3></div><span class="ldmv-badge">YouTube Player</span></div>'
        . '</div>'
        . '</div>';
}
