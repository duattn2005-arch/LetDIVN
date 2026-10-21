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

/** Years of the website's videos whose title has none (YouTube upload date). [YouTube id => year] */
const LDMV_KNOWN_YEARS = [
    'n8NavDVZYHA' => 2023, // VTV3: Cafe Sáng cùng Let's Do It Hanoi
];

/** A video's year: the admin's "Năm" box, else a 20xx in its title, else a known one, else 0 (unknown). */
function ldmv_year(int $post_id, string $title, string $yt = ''): int
{
    $year = (int) get_post_meta($post_id, '_ldmv_year', true);
    if ($year >= 2000 && $year <= 2100) {
        return $year;
    }
    if (preg_match('~(?<!\d)(20\d\d)(?!\d)~', $title, $m)) {
        return (int) $m[1];
    }
    return LDMV_KNOWN_YEARS[$yt] ?? 0;
}

/** The videos to show: [['id' => YouTube id, 'title' => ..., 'year' => int]], in the menu's order. */
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
            $title = html_entity_decode(get_the_title($p), ENT_QUOTES, 'UTF-8');
            $out[] = ['id' => $id, 'title' => $title, 'year' => ldmv_year($p->ID, $title, $id)];
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
        $year = (int) get_post_meta($post->ID, '_ldmv_year', true);
        printf(
            '<p><label><strong>Năm</strong> <input type="number" name="ldmv_year" value="%s" min="2000" max="2100" style="width:100px"></label></p>'
            . '<p class="description">Năm của video, dùng cho bộ lọc năm. Để trống: tự lấy năm có trong tiêu đề (vd. "World Cleanup Day 2026" → 2026).</p>',
            $year ? esc_attr((string) $year) : ''
        );
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
    $year = (int) ($_POST['ldmv_year'] ?? 0);
    if ($year >= 2000 && $year <= 2100) {
        update_post_meta($post_id, '_ldmv_year', $year);
    } else {
        delete_post_meta($post_id, '_ldmv_year');
    }
});

add_filter('manage_' . LDMV_TYPE . '_posts_columns', fn($cols) => [
    'cb' => $cols['cb'],
    'ldmv_thumb' => 'Ảnh',
    'title' => $cols['title'],
    'ldmv_year' => 'Năm',
    'ldmv_order' => 'Thứ tự',
]);

add_action('manage_' . LDMV_TYPE . '_posts_custom_column', function ($col, $id) {
    if ($col === 'ldmv_thumb') {
        $yt = ldmv_youtube_id((string) get_post_meta($id, '_ldmv_url', true));
        echo $yt !== ''
            ? sprintf('<img src="https://img.youtube.com/vi/%s/default.jpg" alt="" style="width:80px;border-radius:6px">', esc_attr($yt))
            : '<span style="color:#b32d2e">Link chưa đúng</span>';
    } elseif ($col === 'ldmv_year') {
        $year = ldmv_year($id, get_the_title($id), ldmv_youtube_id((string) get_post_meta($id, '_ldmv_url', true)));
        echo $year ?: '—';
    } elseif ($col === 'ldmv_order') {
        echo (int) get_post_field('menu_order', $id);
    }
}, 10, 2);

// --- Year chip colours (menu Video > Màu thẻ năm) ----------------------------------------------

const LDMV_COLORS_OPTION = 'ldmv_year_colors';
/** A chip's colours: background, text, and both on hover (also the chosen chip's). */
const LDMV_COLOR_KEYS = ['bg' => 'Nền', 'text' => 'Chữ', 'hover_bg' => 'Nền khi rê chuột', 'hover_text' => 'Chữ khi rê chuột'];
/** Lively colours a year gets until the admin picks its own: [bg, text, hover bg, hover text]. */
const LDMV_PALETTE = [
    ['#e0f2fe', '#0369a1', '#0284c7', '#ffffff'], // sky
    ['#fce7f3', '#be185d', '#e81a7f', '#ffffff'], // pink
    ['#ffedd5', '#c2410c', '#ea580c', '#ffffff'], // orange
    ['#dcfce7', '#15803d', '#16a34a', '#ffffff'], // green
    ['#ede9fe', '#6d28d9', '#7c3aed', '#ffffff'], // violet
    ['#fef3c7', '#b45309', '#d97706', '#ffffff'], // amber
];

/** A year's chip colours ('0' for "Khác"): the admin's, else its palette colour (by year, so it never shifts). */
function ldmv_colors(string $year): array
{
    $saved = get_option(LDMV_COLORS_OPTION);
    $own = is_array($saved) && is_array($saved[$year] ?? null) ? $saved[$year] : [];
    $base = (int) $year ? LDMV_PALETTE[(int) $year % count(LDMV_PALETTE)] : ['#f1f5f9', '#475569', '#475569', '#ffffff'];
    return $own + array_combine(array_keys(LDMV_COLOR_KEYS), $base);
}

add_action('admin_menu', function () {
    add_submenu_page('edit.php?post_type=' . LDMV_TYPE, 'Màu thẻ năm', 'Màu thẻ năm', 'manage_options', 'ldmv-colors', 'ldmv_colors_page');
});

add_action('admin_init', function () {
    register_setting('ldmv_colors', LDMV_COLORS_OPTION, [
        'type' => 'array',
        'sanitize_callback' => function ($in) {
            $out = [];
            foreach (is_array($in) ? $in : [] as $year => $colors) {
                $year = (string) $year;
                if (!preg_match('~^(0|20\d\d)$~', $year)) {
                    continue;
                }
                foreach (LDMV_COLOR_KEYS as $key => $label) {
                    $c = sanitize_hex_color((string) ($colors[$key] ?? ''));
                    if ($c) {
                        $out[$year][$key] = $c;
                    }
                }
            }
            return $out;
        },
    ]);
});

function ldmv_colors_page(): void
{
    $years = array_unique(array_column(ldmv_videos(), 'year'));
    rsort($years);
    $rows = array_map('strval', $years);
    ?>
    <div class="wrap">
        <h1>Màu thẻ năm</h1>
        <p>Màu của từng thẻ năm trong khối video. Thẻ đang chọn dùng màu "khi rê chuột". Năm mới tự có một màu riêng; nó hiện ở đây khi có video của năm đó, để chỉnh lại nếu muốn.</p>
        <form method="post" action="options.php">
            <?php settings_fields('ldmv_colors'); ?>
            <table class="widefat striped ldmv-colors" style="max-width:900px">
                <thead><tr><th>Thẻ</th><?php foreach (LDMV_COLOR_KEYS as $label) {
                    echo '<th>' . esc_html($label) . '</th>';
                } ?><th>Xem trước (rê chuột vào thử)</th></tr></thead>
                <tbody>
                <?php foreach ($rows as $year) {
                    $c = ldmv_colors($year);
                    $label = $year === '0' ? 'Khác' : $year;
                    echo '<tr><th>' . esc_html($label) . '</th>';
                    foreach (LDMV_COLOR_KEYS as $key => $name) {
                        printf(
                            '<td><input type="color" name="%s[%s][%s]" value="%s" data-key="%s" aria-label="%s"></td>',
                            esc_attr(LDMV_COLORS_OPTION), esc_attr($year), esc_attr($key), esc_attr($c[$key]), esc_attr($key), esc_attr("$label: $name")
                        );
                    }
                    printf('<td><span class="ldmv-chip-preview" style="%s">%s</span></td></tr>', esc_attr(ldmv_chip_style($c)), esc_html($label));
                } ?>
                </tbody>
            </table>
            <?php submit_button('Lưu màu'); ?>
        </form>
    </div>
    <style>
        .ldmv-colors td, .ldmv-colors th { vertical-align: middle; }
        .ldmv-colors input[type="color"] { width: 48px; height: 30px; padding: 0 2px; cursor: pointer; }
        .ldmv-chip-preview { display: inline-block; padding: 5px 14px; border: 1px solid #e2e8f0; border-radius: 999px; background: var(--ldmv-bg); color: var(--ldmv-text); font-weight: 700; cursor: pointer; transition: background-color .15s, color .15s; }
        .ldmv-chip-preview:hover { background: var(--ldmv-hbg); color: var(--ldmv-htext); }
    </style>
    <script>
        // The preview follows the pickers.
        document.querySelectorAll('.ldmv-colors input[type="color"]').forEach(function (input) {
            input.addEventListener('input', function () {
                var vars = { bg: '--ldmv-bg', text: '--ldmv-text', hover_bg: '--ldmv-hbg', hover_text: '--ldmv-htext' };
                input.closest('tr').querySelector('.ldmv-chip-preview').style.setProperty(vars[input.dataset.key], input.value);
            });
        });
    </script>
    <?php
}

/** A chip's colours as CSS variables (videos.css uses them). */
function ldmv_chip_style(array $c): string
{
    return "--ldmv-bg:{$c['bg']};--ldmv-text:{$c['text']};--ldmv-hbg:{$c['hover_bg']};--ldmv-htext:{$c['hover_text']}";
}

// The list in the order the block shows.
add_action('pre_get_posts', function (WP_Query $q) {
    if (is_admin() && $q->is_main_query() && $q->get('post_type') === LDMV_TYPE && !$q->get('orderby')) {
        $q->set('orderby', ['menu_order' => 'ASC', 'date' => 'DESC']);
    }
});

add_action('admin_head-edit.php', function () {
    if (($GLOBALS['typenow'] ?? '') === LDMV_TYPE) {
        echo '<style>.column-ldmv_thumb{width:96px}.column-ldmv_year,.column-ldmv_order{width:80px}</style>';
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

    // Year chips, newest first (a new year shows as soon as a video has it); "Khác" for videos without one.
    // The newest year is chosen at first: the list shows its videos, the player its first one.
    $years = array_count_values(array_column($videos, 'year'));
    krsort($years); // 0 ("Khác") ends up last
    $filter = count($years) > 1;
    $shown = $filter ? array_key_first($years) : null;

    $items = '';
    $first = null;
    foreach ($videos as $v) {
        $hide = $filter && $v['year'] !== $shown;
        $on = !$hide && !$first;
        if ($on) {
            $first = $v;
        }
        $items .= '<button type="button" class="ldmv-item' . ($on ? ' is-active' : '') . '"'
            . ' data-ldmv-id="' . esc_attr($v['id']) . '" data-ldmv-title="' . esc_attr($v['title']) . '" data-ldmv-year="' . (int) $v['year'] . '"' . ($on ? ' aria-current="true"' : '') . ($hide ? ' hidden' : '') . '>'
            . '<span class="ldmv-thumb"><img src="https://img.youtube.com/vi/' . esc_attr($v['id']) . '/hqdefault.jpg" alt="" loading="lazy"><span class="ldmv-play">' . $play . '</span></span>'
            . '<span class="ldmv-item-title">' . esc_html($v['title']) . '</span>'
            . '</button>';
    }

    $chips = '';
    if ($filter) {
        foreach ($years as $year => $n) {
            $on = $year === $shown;
            $chips .= '<button type="button" class="ldmv-year' . ($on ? ' is-active' : '') . '" data-ldmv-filter="' . (int) $year . '" aria-pressed="' . ($on ? 'true' : 'false') . '"'
                . ' style="' . esc_attr(ldmv_chip_style(ldmv_colors((string) $year))) . '">'
                . esc_html($year ? (string) $year : 'Khác') . '<span class="ldmv-year-n">' . $n . '</span></button>';
        }
        $chips = '<div class="ldmv-years" role="group" aria-label="Lọc theo năm">' . $chips . '</div>';
    }

    return '<div class="ldmv">'
        . '<div class="ldmv-list ldmv-card"><div class="ldmv-list-in">'
        . '<div class="ldmv-head"><span class="ldmv-count">' . $youtube . '<span class="ldmv-num">' . ($filter ? $years[$shown] : count($videos)) . '</span> Videos</span><span class="ldmv-hd">HD 1080p</span></div>'
        . $chips
        . '<div class="ldmv-items">' . $items . '</div>'
        . '</div></div>'
        . '<div class="ldmv-player ldmv-card">'
        . '<div class="ldmv-frame"><iframe src="https://www.youtube.com/embed/' . esc_attr($first['id']) . '" title="' . esc_attr($first['title']) . '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>'
        . '<div class="ldmv-bar"><div class="ldmv-now-wrap"><span class="ldmv-dot"></span><h3 class="ldmv-now">' . esc_html($first['title']) . '</h3></div><span class="ldmv-badge">YouTube Player</span></div>'
        . '</div>'
        . '</div>';
}
