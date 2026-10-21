<?php
// World Cleanup Day, year by year: three photo cards (volunteers, waste
// collected, press coverage) whose figures slide from one year to the next by
// themselves, with every year's bar at their foot. The figures are typed in the admin (menu
// "Số liệu WCD": a row per year, a new year is one more row) and shown by
// [ldivn_wcd_stats] (assets/css/stats.css, assets/js/stats.js). Once, the block
// is put on the homepage right after the posts, as a section of its Elementor page.

defined('ABSPATH') || exit;

const LDMS_OPTION = 'ldm_wcd_stats';
const LDMS_PAGE = 'ldivn-wcd-stats';
const LDMS_HOME = 'ldm_wcd_stats_home'; // what putting it on the homepage gave: ['status', 'page', 'id']
const LDMS_HOME_INTRO = 'ldm_wcd_stats_home_intro'; // once: its centred heading taken off there
const LDMS_SHOWN = 10; // the block shows the most recent years, this many

/**
 * The years the block starts with: year => [volunteers, waste collected in kg, press articles].
 * SAMPLE figures, shown until the real ones are saved in the admin.
 */
const LDMS_SAMPLE = [
    2017 => [1200, 4000, 5],
    2018 => [3500, 12000, 12],
    2019 => [12000, 35000, 45],
    2020 => [8200, 21000, 30],
    2021 => [5600, 14500, 22],
    2022 => [15000, 40000, 58],
    2023 => [18500, 48000, 64],
    2024 => [22000, 55500, 70],
    2025 => [26000, 62000, 85],
    2026 => [30000, 70000, 90],
];

/** The three cards, in their order: the admin's column name, the card's texts, colour and photo. */
const LDMS_CARDS = [
    'volunteers' => [
        'label' => 'Số người nhặt rác',
        'title' => 'Volunteers',
        'sub' => 'People who picked up trash',
        'accent' => '#d8b4fe',
        'image' => 'stats-volunteers.jpg',
    ],
    'waste' => [
        'label' => 'Rác thu gom (kg)',
        'title' => 'Waste Collected',
        'sub' => 'Trash picked up and sorted',
        'accent' => '#fcd34d',
        'image' => 'stats-waste.jpg',
    ],
    'press' => [
        'label' => 'Số bài báo đưa tin',
        'title' => 'Press Coverage',
        'sub' => 'News stories about the day',
        'accent' => '#f9a8d4',
        'image' => 'stats-press.jpg',
    ],
];

/** The words left of the cards, as on the website's "Let's do it! Vietnam Movement" block. */
const LDMS_INTRO = [
    'title' => "Let's do it! Vietnam Movement",
    'p1' => "World Cleanup Day is the world's largest civic environmental movement, mobilizing millions of volunteers across 190+ countries.",
    'p2' => 'Since 2015, we not only collect waste but transform community awareness, map pollution hotspots, and build zero-waste habits.',
];

/**
 * What the block shows: 'sample' (nothing saved yet), 'years' (year => [card => int|null],
 * oldest first), 'cards' (card => title, sub, image) and 'intro' (title, p1, p2): the admin's or the defaults.
 */
function ldms_data(): array
{
    $saved = get_option(LDMS_OPTION);
    $saved = is_array($saved) ? $saved : null;
    $keys = array_keys(LDMS_CARDS);

    if ($saved !== null) {
        $years = (array) ($saved['years'] ?? []);
    } else {
        $years = [];
        foreach (LDMS_SAMPLE as $year => $values) {
            $years[$year] = array_combine($keys, $values);
        }
    }
    ksort($years);

    $cards = [];
    foreach (LDMS_CARDS as $key => $card) {
        $own = (array) ($saved['cards'][$key] ?? []);
        $cards[$key] = [
            'title' => ($own['title'] ?? '') !== '' ? $own['title'] : $card['title'],
            'sub' => $own['sub'] ?? $card['sub'],
            'image' => ($own['image'] ?? '') !== '' ? $own['image'] : ldms_default_image($key),
        ];
    }

    $intro = [];
    foreach (LDMS_INTRO as $key => $text) {
        $intro[$key] = (string) ($saved['intro'][$key] ?? $text);
    }
    return ['sample' => $saved === null, 'years' => $years, 'cards' => $cards, 'intro' => $intro];
}

function ldms_default_image(string $key): string
{
    return LDM_URL . 'assets/images/' . LDMS_CARDS[$key]['image'];
}

/** A figure as a card shows it: [number, unit]. Waste from 1,000 kg on in tons; '—' when not known yet. */
function ldms_format(string $key, ?int $n): array
{
    if ($n === null) {
        return ['—', ''];
    }
    if ($key === 'waste' && $n >= 1000) {
        $tons = preg_replace('/\.0$/', '', number_format($n / 1000, 1));
        return [$tons, $tons === '1' ? 'ton' : 'tons'];
    }
    return [number_format($n), $key === 'waste' ? 'kg' : ''];
}

function ldms_icon(string $key): string
{
    $paths = [
        'volunteers' => '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        'waste' => '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>',
        'press' => '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>',
    ];
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' . $paths[$key] . '</svg>';
}

// --- [ldivn_wcd_stats] ------------------------------------------------------------------------

add_shortcode('ldivn_wcd_stats', function ($atts) {
    $atts = shortcode_atts(['interval' => 4, 'year' => '', 'intro' => 'yes'], $atts, 'ldivn_wcd_stats');
    $data = ldms_data();
    if (!$data['years']) {
        // No year at all: its homepage section is hidden too, not left with a heading over nothing.
        $home = get_option(LDMS_HOME);
        $section = is_array($home) ? sanitize_html_class((string) ($home['id'] ?? '')) : '';
        return $section !== ''
            ? '<style>.elementor-element-' . $section . ':has(.ldms-off){display:none}</style><span class="ldms-off" hidden></span>'
            : '';
    }
    // Printed right here, so the block is styled as soon as it shows (also inside page builders).
    wp_register_style('ldms', LDM_URL . 'assets/css/stats.css', [], LDM_VERSION);
    wp_enqueue_script('ldms', LDM_URL . 'assets/js/stats.js', [], LDM_VERSION, true);
    ob_start();
    wp_print_styles('ldms');
    return ob_get_clean() . ldms_render($data, max(2.0, (float) $atts['interval']), (int) $atts['year'], $atts['intro'] !== 'no');
});

/** The block's HTML: the words on the left (unless $intro is false), the cards at the chosen year (the first one shown if none). */
function ldms_render(array $data, float $interval, int $year, bool $intro = true): string
{
    $data['years'] = array_slice($data['years'], -LDMS_SHOWN, null, true);
    $years = array_keys($data['years']);
    $start = array_search($year, $years, true);
    $start = $start === false ? 0 : $start;

    $cards = '';
    $figures = [];
    $raw = [];
    foreach ($data['cards'] as $key => $card) {
        $values = [];
        foreach ($data['years'] as $row) {
            $values[] = isset($row[$key]) ? (int) $row[$key] : null;
        }
        $max = max(1, ...array_map('intval', $values));
        $shown = array_map(fn($v) => ldms_format($key, $v), $values);
        $figures[] = $shown;
        $raw[] = $values; // for counting from one year's figure to the next

        // Every year's bar, the shown year's in the card's colour.
        $bars = '';
        foreach ($years as $i => $y) {
            $v = $values[$i];
            $tip = $y . ' · ' . trim(implode(' ', $shown[$i]));
            $bars .= '<span class="ldms-b' . ($i === $start ? ' is-on' : '') . '" data-i="' . $i . '" data-tip="' . esc_attr($tip) . '">'
                . '<span class="ldms-track">' . ($v === null ? '' : '<i style="height:' . max(4, round($v / $max * 100)) . '%"></i>') . '</span>'
                . '<em>&rsquo;' . esc_html(substr((string) $y, -2)) . '</em>'
                . '</span>';
        }

        // The year and the figure each twice, one over the other: the next year's
        // slides in while the shown one slides out (assets/js/stats.js).
        [$num, $unit] = $shown[$start];
        $figure = '<span class="ldms-num">' . esc_html($num) . '</span><span class="ldms-unit">' . esc_html($unit) . '</span>';
        $cards .= '<article class="ldms-card" style="--ldms-accent:' . esc_attr(LDMS_CARDS[$key]['accent']) . '" aria-label="' . esc_attr($card['title']) . '">'
            . '<img class="ldms-photo" src="' . esc_url($card['image']) . '" alt="" loading="lazy" decoding="async">'
            . '<span class="ldms-shade"></span>'
            . '<div class="ldms-top">'
            . '<span class="ldms-icon">' . ldms_icon($key) . '</span>'
            . '<span class="ldms-when"><span class="ldms-event">World Cleanup Day</span>'
            . '<span class="ldms-swap ldms-year"><span class="is-on">' . esc_html((string) $years[$start]) . '</span><span aria-hidden="true"></span></span>'
            . '</span>'
            . '</div>'
            . '<div class="ldms-body">'
            . '<div class="ldms-swap ldms-value"><span class="is-on">' . $figure . '</span><span aria-hidden="true">' . $figure . '</span></div>'
            . '<div class="ldms-title">' . esc_html($card['title']) . '</div>'
            . ($card['sub'] !== '' ? '<div class="ldms-sub">' . esc_html($card['sub']) . '</div>' : '')
            . '<div class="ldms-chart">' . $bars . '</div>'
            . '</div>'
            . '</article>';
    }

    // A reminder over the block, for editors only.
    $sample = $data['sample'] && current_user_can('edit_pages')
        ? '<p class="ldms-sample">Đang hiện số liệu mẫu cho mọi người xem. Nhập số thật ở menu <a href="' . esc_url(admin_url('admin.php?page=' . LDMS_PAGE)) . '">Số liệu WCD</a>. (Dòng này chỉ người quản trị thấy.)</p>'
        : '';

    $words = '';
    if ($intro) {
        $t = $data['intro'];
        // The title at the cards' top, the words at their foot.
        $text = ($t['p1'] !== '' ? '<p class="ldms-p1">' . nl2br(esc_html($t['p1'])) . '</p>' : '')
            . ($t['p2'] !== '' ? '<p class="ldms-p2">' . nl2br(esc_html($t['p2'])) . '</p>' : '');
        $words = ($t['title'] !== '' ? '<h2 class="ldms-h">' . esc_html($t['title']) . '</h2>' : '')
            . ($text !== '' ? '<div class="ldms-text">' . $text . '</div>' : '');
    }

    $config = [
        'interval' => (int) round($interval * 1000),
        'start' => $start,
        'years' => $years,
        'keys' => array_keys($data['cards']),
        'cards' => $figures,
        'raw' => $raw,
    ];
    return '<div class="ldms' . ($words !== '' ? ' ldms--intro' : '') . '" data-ldms="' . esc_attr(wp_json_encode($config)) . '">'
        . $sample
        . ($words !== '' ? '<div class="ldms-intro">' . $words . '</div>' : '')
        . '<div class="ldms-cards">' . $cards . '</div>'
        // Keeps the pace: when its animation ends, the next year comes (assets/js/stats.js).
        . (count($years) > 1 ? '<span class="ldms-clock" aria-hidden="true"></span>' : '')
        . '</div>';
}

// --- On the homepage, right after the posts ---------------------------------------------------

// Once each, the first time an admin opens any page with this version (the
// homepage too, before it is shown). A section the team then edits, moves or
// deletes in Elementor like the others.
add_action('init', function () {
    if (!current_user_can('manage_options')) {
        return;
    }
    if (get_option(LDMS_HOME) === false) {
        update_option(LDMS_HOME, ldms_place_on_home(), false);
    }
    if (get_option(LDMS_HOME_INTRO) === false) {
        update_option(LDMS_HOME_INTRO, ldms_home_without_heading(), false);
    }
});

/**
 * A new section after the homepage's posts: a copy of its videos section (its
 * spacing) with the block instead of the videos, and without its centred heading:
 * the block has its words on the left. Plain, with just the block, when there is no such section.
 */
function ldms_place_on_home(): array
{
    $page = (int) get_option('page_on_front');
    $raw = $page ? get_post_meta($page, '_elementor_data', true) : '';
    $data = is_string($raw) && $raw !== '' ? json_decode($raw, true) : null;
    if (!is_array($data)) {
        return ['status' => 'no-elementor-home', 'page' => $page];
    }
    if (strpos($raw, 'ldivn_wcd_stats') !== false) {
        return ['status' => 'already-there', 'page' => $page];
    }

    $posts = null;
    $model = null;
    foreach ($data as $i => $el) {
        if (!is_array($el)) {
            continue;
        }
        if ($posts === null && ldms_has_widget($el, fn($w) => strpos((string) ($w['widgetType'] ?? ''), 'posts') !== false)) {
            $posts = $i;
        }
        if ($model === null && ldms_has_widget($el, fn($w) => ($w['widgetType'] ?? '') === 'shortcode'
            && strpos((string) ($w['settings']['shortcode'] ?? ''), 'ldivn_videos') !== false)) {
            $model = $i;
        }
    }
    if ($posts === null) {
        return ['status' => 'no-posts-section', 'page' => $page];
    }

    $ids = [];
    if ($model !== null) {
        $section = ldms_copy_element($data[$model], $raw, $ids, function (array $w): array {
            if (($w['widgetType'] ?? '') === 'shortcode') {
                $w['settings'] = ['shortcode' => '[ldivn_wcd_stats]'] + (array) ($w['settings'] ?? []);
            }
            return $w;
        });
        $section = ldms_prune($section, fn($w) => in_array($w['widgetType'] ?? '', ['heading', 'text-editor'], true));
    } else {
        $section = [
            'id' => ldms_new_id($raw, $ids),
            'elType' => 'container',
            'settings' => ['content_width' => 'boxed'],
            'elements' => [[
                'id' => ldms_new_id($raw, $ids),
                'elType' => 'widget',
                'widgetType' => 'shortcode',
                'settings' => ['shortcode' => '[ldivn_wcd_stats]'],
                'elements' => [],
            ]],
            'isInner' => false,
        ];
    }

    array_splice($data, $posts + 1, 0, [$section]);
    ldms_save_elementor($page, $data);
    return ['status' => 'placed', 'page' => $page, 'id' => $section['id']];
}

/**
 * The section put on the homepage by 1.13.1 without its centred "Our Impact" line and
 * heading, now that the block has its words on the left. Only while they still say
 * what they said then: changed in Elementor, they stay.
 */
function ldms_home_without_heading(): string
{
    $home = get_option(LDMS_HOME);
    if (!is_array($home) || ($home['status'] ?? '') !== 'placed') {
        return 'not-placed';
    }
    $page = (int) $home['page'];
    $raw = get_post_meta($page, '_elementor_data', true);
    $data = is_string($raw) && $raw !== '' ? json_decode($raw, true) : null;
    if (!is_array($data)) {
        return 'no-elementor-home';
    }

    $ours = fn($w) => (($w['widgetType'] ?? '') === 'heading'
            && trim((string) ($w['settings']['title'] ?? '')) === 'World Cleanup Day, Year by Year')
        || (($w['widgetType'] ?? '') === 'text-editor'
            && trim(wp_strip_all_tags((string) ($w['settings']['editor'] ?? ''))) === 'Our Impact');
    $changed = false;
    foreach ($data as $i => $el) {
        if (is_array($el) && ($el['id'] ?? '') === ($home['id'] ?? '')) {
            $data[$i] = ldms_prune($el, $ours);
            $changed = $data[$i] !== $el;
        }
    }
    if (!$changed) {
        return 'unchanged';
    }
    ldms_save_elementor($page, $data);
    return 'done';
}

/** An Elementor element without the widgets in it $drop says yes to, nor a spacer right after another. */
function ldms_prune(array $el, callable $drop): array
{
    $kept = [];
    foreach ((array) ($el['elements'] ?? []) as $child) {
        if (is_array($child) && ($child['elType'] ?? '') === 'widget') {
            $last = end($kept);
            if ($drop($child) || (($child['widgetType'] ?? '') === 'spacer' && is_array($last) && ($last['widgetType'] ?? '') === 'spacer')) {
                continue;
            }
        }
        $kept[] = $child;
    }
    $el['elements'] = $kept;
    return $el;
}

/** Saves a page's Elementor elements, as Elementor does, and has its styles made anew. */
function ldms_save_elementor(int $page, array $data): void
{
    update_post_meta($page, '_elementor_data', wp_slash(wp_json_encode($data)));
    delete_post_meta($page, '_elementor_element_cache');
    if (class_exists('\Elementor\Plugin') && isset(\Elementor\Plugin::$instance->files_manager)) {
        \Elementor\Plugin::$instance->files_manager->clear_cache();
    }
}

/** Whether an Elementor element is, or holds, a widget $test says yes to. */
function ldms_has_widget(array $el, callable $test): bool
{
    if (($el['elType'] ?? '') === 'widget' && $test($el)) {
        return true;
    }
    foreach ((array) ($el['elements'] ?? []) as $child) {
        if (is_array($child) && ldms_has_widget($child, $test)) {
            return true;
        }
    }
    return false;
}

/** A copy of an Elementor element with new ids, its widgets changed by $change. */
function ldms_copy_element(array $el, string $raw, array &$ids, callable $change): array
{
    $el['id'] = ldms_new_id($raw, $ids);
    if (($el['elType'] ?? '') === 'widget') {
        $el = $change($el);
    }
    $children = [];
    foreach ((array) ($el['elements'] ?? []) as $child) {
        $children[] = is_array($child) ? ldms_copy_element($child, $raw, $ids, $change) : $child;
    }
    $el['elements'] = $children;
    return $el;
}

/** An element id as Elementor makes them (7 hex digits), used nowhere on the page yet. */
function ldms_new_id(string $raw, array &$ids): string
{
    do {
        $id = substr(md5(uniqid((string) mt_rand(), true)), 0, 7);
    } while (isset($ids[$id]) || strpos($raw, '"' . $id . '"') !== false);
    $ids[$id] = true;
    return $id;
}

// --- Admin: menu "Số liệu WCD" ----------------------------------------------------------------

add_action('admin_menu', function () {
    add_menu_page('Số liệu World Cleanup Day', 'Số liệu WCD', 'edit_pages', LDMS_PAGE, 'ldms_page', 'dashicons-chart-bar', 28);
});

add_action('admin_enqueue_scripts', function ($hook) {
    if ($hook === 'toplevel_page_' . LDMS_PAGE) {
        wp_enqueue_media();
    }
});

add_action('admin_post_ldms_save', function () {
    if (!current_user_can('edit_pages')) {
        wp_die('Bạn không có quyền sửa số liệu này.');
    }
    check_admin_referer('ldms_save');

    // A row without a year, or without any figure, is left out: the new-year rows
    // not filled in, and how a year is taken away.
    $years = [];
    foreach ((array) ($_POST['ldms_years'] ?? []) as $row) {
        $row = is_array($row) ? wp_unslash($row) : [];
        $year = absint($row['year'] ?? 0);
        $figures = [];
        foreach (array_keys(LDMS_CARDS) as $key) {
            // 12000, 12.000 and 12,000 are all the same number.
            $digits = preg_replace('/\D/', '', (string) ($row[$key] ?? ''));
            $figures[$key] = $digits === '' ? null : (int) $digits;
        }
        if ($year >= 2000 && $year <= 2100 && array_filter($figures, fn($v) => $v !== null)) {
            $years[$year] = $figures;
        }
    }
    ksort($years);

    $cards = [];
    foreach (array_keys(LDMS_CARDS) as $key) {
        $in = isset($_POST['ldms_cards'][$key]) && is_array($_POST['ldms_cards'][$key]) ? wp_unslash($_POST['ldms_cards'][$key]) : [];
        $cards[$key] = [
            'title' => sanitize_text_field((string) ($in['title'] ?? '')),
            'sub' => sanitize_text_field((string) ($in['sub'] ?? '')),
            'image' => esc_url_raw(trim((string) ($in['image'] ?? ''))),
        ];
    }

    $intro = [];
    foreach (array_keys(LDMS_INTRO) as $key) {
        $text = $_POST['ldms_intro'][$key] ?? '';
        $text = is_string($text) ? wp_unslash($text) : '';
        $intro[$key] = $key === 'title' ? sanitize_text_field($text) : sanitize_textarea_field($text);
    }

    update_option(LDMS_OPTION, ['years' => $years, 'cards' => $cards, 'intro' => $intro], false);
    wp_safe_redirect(admin_url('admin.php?page=' . LDMS_PAGE . '&updated=1'));
    exit;
});

function ldms_page(): void
{
    if (!current_user_can('edit_pages')) {
        return;
    }
    $data = ldms_data();
    $saved = get_option(LDMS_OPTION);
    $keys = array_keys(LDMS_CARDS);
    $all = array_keys($data['years']);
    $shown = array_slice($all, -LDMS_SHOWN);
    $span = fn(array $ys) => $ys ? (count($ys) > 1 ? reset($ys) . '–' . end($ys) : (string) reset($ys)) : '';

    /** A row of the years' table: $i its index in the form, $status what the last cell says. */
    $row = function (string $i, array $r, string $status, bool $new = false) use ($keys): string {
        $cells = '<td><input type="number" min="2000" max="2100" name="ldms_years[' . $i . '][year]" value="' . esc_attr((string) ($r['year'] ?? '')) . '" class="ldms-y" style="width:90px"></td>';
        foreach ($keys as $key) {
            $cells .= '<td><input type="text" inputmode="numeric" name="ldms_years[' . $i . '][' . esc_attr($key) . ']"'
                . ' value="' . (isset($r[$key]) ? esc_attr(number_format((int) $r[$key])) : '') . '" class="regular-text" style="width:100%"></td>';
        }
        return '<tr' . ($new ? ' style="background:#f0f6fc"' : '') . '>' . $cells . '<td>' . $status . '</td>'
            . '<td><button type="button" class="button-link button-link-delete" data-ldms-remove>Xoá</button></td></tr>';
    };
    ?>
    <div class="wrap">
        <h1>Số liệu World Cleanup Day</h1>

        <?php if (isset($_GET['updated'])) : ?>
            <div class="notice notice-success is-dismissible"><p>Đã lưu <?php echo count($all); ?> năm (<?php echo esc_html($span($all)); ?>).
                Trên web hiện <?php echo count($shown); ?> năm gần nhất: <strong><?php echo esc_html($span($shown)); ?></strong>.</p></div>
        <?php endif; ?>

        <?php if ($data['sample']) : ?>
            <div class="notice notice-warning inline" style="margin:16px 0;padding:12px 16px">
                <p style="margin:0"><strong>Đang là số liệu mẫu</strong>, và đang hiện cho mọi người xem. Sửa thành số thật rồi bấm <strong>Lưu số liệu</strong>.</p>
            </div>
        <?php endif; ?>

        <div class="notice notice-info inline" style="margin:16px 0;padding:12px 16px">
            <p style="margin:0 0 8px"><strong>Chèn vào trang:</strong> thêm khối <em>Shortcode</em> với nội dung <code style="font-size:14px;padding:4px 8px">[ldivn_wcd_stats]</code></p>
            <p style="margin:0">Ba thẻ tự lướt từ năm này sang năm sau, qua <?php echo (int) LDMS_SHOWN; ?> năm gần nhất; bấm vào một cột nhỏ thì chuyển ngay tới năm đó, bấm vào thẻ thì sang năm sau.
                Tuỳ chọn: <code>interval="4"</code> (số giây mỗi năm), <code>year="2026"</code> (năm hiện đầu tiên, mặc định năm sớm nhất).</p>
            <?php
            $home = (array) get_option(LDMS_HOME, []);
            $status = (string) ($home['status'] ?? '');
            $edit = !empty($home['page']) ? admin_url('post.php?post=' . (int) $home['page'] . '&action=elementor') : '';
            if ($status === 'placed') : ?>
                <p style="margin:8px 0 0"><strong>Trang chủ:</strong> đã đặt sẵn ngay sau phần bài viết.
                    Di chuyển hay xoá phần này <a href="<?php echo esc_url($edit); ?>">trong Elementor</a> như các phần khác.</p>
            <?php elseif ($status === 'already-there') : ?>
                <p style="margin:8px 0 0"><strong>Trang chủ:</strong> đã có shortcode này từ trước, không đặt thêm.</p>
            <?php elseif ($status !== '') : ?>
                <p style="margin:8px 0 0"><strong>Trang chủ:</strong> không tự đặt được (<?php echo esc_html($status === 'no-posts-section' ? 'không tìm thấy phần bài viết' : 'trang chủ không dựng bằng Elementor'); ?>). Chèn shortcode ở trên bằng tay.</p>
            <?php endif; ?>
        </div>

        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
            <input type="hidden" name="action" value="ldms_save">
            <?php wp_nonce_field('ldms_save'); ?>

            <h2>Số liệu từng năm</h2>
            <p class="description">Mỗi năm một dòng; trên web hiện <?php echo (int) LDMS_SHOWN; ?> năm gần nhất (năm cũ hơn vẫn được lưu).
                <strong>Thêm năm:</strong> bấm <strong>+ Thêm năm</strong> (năm tự điền, sửa được, kể cả thành năm cũ như 2016), điền số rồi bấm <strong>Lưu số liệu</strong>.
                <strong>Bỏ một năm:</strong> bấm <strong>Xoá</strong> ở dòng đó rồi Lưu. Dòng không có số nào thì bỏ qua.
                Số chưa có thì để trống, thẻ hiện "—". Gõ <code>12000</code>, <code>12.000</code> hay <code>12,000</code> đều được. Rác từ 1.000 kg trở lên hiện theo tấn (tons).</p>
            <table id="ldms-years" class="widefat striped" style="max-width:960px;margin-top:12px">
                <thead>
                    <tr>
                        <th style="width:110px">Năm</th>
                        <?php foreach (LDMS_CARDS as $card) : ?>
                            <th><?php echo esc_html($card['label']); ?></th>
                        <?php endforeach; ?>
                        <th style="width:170px">Trên web</th>
                        <th style="width:50px"></th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                    $i = 0;
                    foreach ($data['years'] as $year => $values) {
                        echo $row((string) $i++, ['year' => $year] + $values, in_array($year, $shown, true)
                            ? '<span style="color:#008a20">✓ Đang hiện</span>'
                            : '<span style="color:#8c8f94">Không hiện (ngoài ' . (int) LDMS_SHOWN . ' năm gần nhất)</span>');
                    }
                    ?>
                </tbody>
            </table>
            <p style="margin:12px 0 0">
                <button type="button" class="button" data-ldms-add data-next="<?php echo (int) wp_date('Y'); ?>">+ Thêm năm</button>
                <span class="description" style="margin-left:8px">Thêm hay xoá dòng xong thì bấm <strong>Lưu số liệu</strong> ở cuối trang.</span>
            </p>
            <template id="ldms-row"><?php echo $row('__i__', ['year' => '__year__'], '<span style="color:#2271b1">Năm mới: điền số rồi Lưu</span>', true); ?></template>

            <h2 style="margin-top:32px">Chữ bên trái</h2>
            <p class="description">Tiêu đề hồng và hai đoạn chữ bên trái ba thẻ (tiếng Anh như trang web). Xoá hết cả ba ô thì ba thẻ chiếm cả bề ngang.
                Muốn đặt khối ở trang khác mà không có chữ: <code>[ldivn_wcd_stats intro="no"]</code>.</p>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="ldms-intro-title">Tiêu đề</label></th>
                    <td><input id="ldms-intro-title" name="ldms_intro[title]" value="<?php echo esc_attr($data['intro']['title']); ?>" class="large-text"></td>
                </tr>
                <tr>
                    <th scope="row"><label for="ldms-intro-p1">Đoạn 1</label></th>
                    <td><textarea id="ldms-intro-p1" name="ldms_intro[p1]" rows="3" class="large-text"><?php echo esc_textarea($data['intro']['p1']); ?></textarea></td>
                </tr>
                <tr>
                    <th scope="row"><label for="ldms-intro-p2">Đoạn 2 (chữ nhỏ hơn)</label></th>
                    <td><textarea id="ldms-intro-p2" name="ldms_intro[p2]" rows="3" class="large-text"><?php echo esc_textarea($data['intro']['p2']); ?></textarea></td>
                </tr>
            </table>

            <h2 style="margin-top:32px">Ba thẻ</h2>
            <p class="description">Chữ trên thẻ (tiếng Anh như trang web) và ảnh nền. Để trống tên thẻ thì dùng tên mặc định.</p>
            <table class="form-table" role="presentation">
                <?php foreach (LDMS_CARDS as $key => $card) :
                    $own = is_array($saved) ? (array) ($saved['cards'][$key] ?? []) : [];
                    $name = fn($field) => esc_attr("ldms_cards[$key][$field]");
                    ?>
                    <tr>
                        <th scope="row"><?php echo esc_html($card['label']); ?></th>
                        <td>
                            <div class="ldms-img" style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap">
                                <img src="<?php echo esc_url($data['cards'][$key]['image']); ?>" data-default="<?php echo esc_url(ldms_default_image($key)); ?>" alt=""
                                    style="width:150px;height:110px;object-fit:cover;border-radius:12px;background:#0f172a">
                                <div style="flex:1;min-width:260px">
                                    <p style="margin:0 0 8px"><label>Tên thẻ<br>
                                        <input name="<?php echo $name('title'); ?>" value="<?php echo esc_attr($data['cards'][$key]['title']); ?>" placeholder="<?php echo esc_attr($card['title']); ?>" class="regular-text"></label></p>
                                    <p style="margin:0 0 8px"><label>Dòng nhỏ bên dưới<br>
                                        <input name="<?php echo $name('sub'); ?>" value="<?php echo esc_attr($data['cards'][$key]['sub']); ?>" placeholder="<?php echo esc_attr($card['sub']); ?>" class="regular-text"></label></p>
                                    <input type="hidden" name="<?php echo $name('image'); ?>" value="<?php echo esc_attr((string) ($own['image'] ?? '')); ?>">
                                    <button type="button" class="button" data-ldms-pick>Chọn ảnh nền</button>
                                    <button type="button" class="button-link" data-ldms-reset style="margin-left:8px">Ảnh mặc định</button>
                                </div>
                            </div>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </table>

            <?php submit_button('Lưu số liệu'); ?>
        </form>
    </div>
    <script>
    // "+ Thêm năm": a row for the year after the last one, its first figure ready to type in. "Xoá": the row goes.
    var ldmsAdded = 0;
    document.addEventListener('click', function (e) {
        var add = e.target.closest('[data-ldms-add]');
        var remove = e.target.closest('[data-ldms-remove]');
        if (!add && !remove) return;
        e.preventDefault();
        if (remove) {
            remove.closest('tr').remove();
            return;
        }
        var body = document.querySelector('#ldms-years tbody');
        var years = [].map.call(body.querySelectorAll('.ldms-y'), function (y) { return parseInt(y.value, 10) || 0; });
        var next = years.length ? Math.max.apply(null, years) + 1 : +add.getAttribute('data-next');
        var html = document.getElementById('ldms-row').innerHTML
            .replace(/__i__/g, 'n' + (++ldmsAdded))
            .replace(/__year__/g, String(next));
        body.insertAdjacentHTML('beforeend', html);
        body.lastElementChild.querySelector('input[inputmode]').focus();
    });

    document.addEventListener('click', function (e) {
        var pick = e.target.closest('[data-ldms-pick]');
        var reset = e.target.closest('[data-ldms-reset]');
        var box = (pick || reset) && (pick || reset).closest('.ldms-img');
        if (!box) return;
        e.preventDefault();
        var input = box.querySelector('input[type=hidden]');
        var img = box.querySelector('img');
        if (reset) {
            input.value = '';
            img.src = img.getAttribute('data-default');
            return;
        }
        if (!window.wp || !wp.media) return;
        var frame = wp.media({ title: 'Ảnh nền của thẻ', library: { type: 'image' }, multiple: false });
        frame.on('select', function () {
            var file = frame.state().get('selection').first().toJSON();
            input.value = file.sizes && file.sizes.large ? file.sizes.large.url : file.url;
            img.src = input.value;
        });
        frame.open();
    });
    </script>
    <?php
}
