<?php
// Post types for the site's lists (partners, team, ...), the options
// page for site-wide text, and admin tweaks that keep the editing screens to
// what the site actually shows.

defined('ABSPATH') || exit;

const LDIVN_TYPE_ICONS = [
    'videos' => 'dashicons-video-alt3',
    'partners' => 'dashicons-groups',
    'team' => 'dashicons-id',
    'what-we-do' => 'dashicons-heart',
    'who-we-are' => 'dashicons-info',
    'media-coverage' => 'dashicons-media-document',
];

function ldivn_register_types(): void
{
    $position = 21;
    foreach (LDIVN_TYPES as $collection => $type) {
        $c = ldivn_collection($collection);
        $singular = $c['label_singular'] ?? $c['label'];
        register_post_type($type, [
            'labels' => [
                'name' => $c['label'],
                'singular_name' => $singular,
                'menu_name' => $c['label'],
                'all_items' => $c['label'],
                'add_new' => 'Thêm ' . $singular,
                'add_new_item' => 'Thêm ' . $singular,
                'edit_item' => 'Sửa ' . $singular,
                'new_item' => $singular,
                'search_items' => 'Tìm ' . $singular,
                'not_found' => 'Chưa có ' . $singular,
            ],
            'description' => $c['description'] ?? '',
            // The site's own pages show these; they have no address of their own.
            'public' => false,
            'show_ui' => true,
            'show_in_rest' => false,
            'menu_position' => $position++,
            'menu_icon' => LDIVN_TYPE_ICONS[$collection],
            'supports' => ['title', 'page-attributes'],
            'hierarchical' => false,
        ]);
    }
}
add_action('init', 'ldivn_register_types');

// The title box is the entry's name/title field in Decap.
add_filter('enter_title_here', function ($text, $post) {
    foreach (LDIVN_TYPES as $collection => $type) {
        if ($post->post_type === $type) {
            $c = ldivn_collection($collection);
            foreach ($c['fields'] as $f) {
                if ($f['name'] === $c['identifier_field']) {
                    return $f['label'];
                }
            }
        }
    }
    return $text;
}, 10, 2);

// Lists are shown on the site by "Thứ tự" (order): the same order in the admin.
add_action('pre_get_posts', function (WP_Query $q) {
    if (!is_admin() || !$q->is_main_query() || $q->get('orderby')) {
        return;
    }
    if (in_array($q->get('post_type'), LDIVN_TYPES, true)) {
        $q->set('orderby', ['menu_order' => 'ASC', 'title' => 'ASC']);
    }
});

// "Thứ tự" column in the lists.
foreach (LDIVN_TYPES as $type) {
    add_filter("manage_{$type}_posts_columns", function ($cols) {
        $date = $cols['date'] ?? null;
        unset($cols['date']);
        $cols['ldivn_order'] = 'Thứ tự';
        if ($date) {
            $cols['date'] = $date;
        }
        return $cols;
    });
    add_action("manage_{$type}_posts_custom_column", function ($col, $id) {
        if ($col === 'ldivn_order') {
            echo (int) get_post_field('menu_order', $id);
        }
    }, 10, 2);
    add_filter("manage_edit-{$type}_sortable_columns", fn($cols) => $cols + ['ldivn_order' => 'menu_order']);
}

// --- Options page: site-wide text (header, contact details, footer) ------------------

add_action('acf/init', function () {
    if (!function_exists('acf_add_options_page')) {
        return;
    }
    acf_add_options_page([
        'page_title' => 'Thông tin chung của website',
        'menu_title' => 'Thông tin chung',
        'menu_slug' => LDIVN_OPTIONS_PAGE,
        'capability' => 'edit_pages',
        'position' => 20,
        'icon_url' => 'dashicons-admin-site-alt3',
        'redirect' => false,
        'autoload' => true,
        'update_button' => 'Lưu',
        'updated_message' => 'Đã lưu.',
    ]);
});

// --- Pages -----------------------------------------------------------------------------

/** Ids of the pages whose content is edited in the fields below the title. */
function ldivn_managed_page_ids(): array
{
    return array_map('intval', array_values(get_option('ldivn_pages', [])));
}

// The site's pages are drawn by the theme from the fields, not from the page body.
add_action('add_meta_boxes_page', function (WP_Post $post) {
    if (in_array($post->ID, ldivn_managed_page_ids(), true)) {
        remove_post_type_support('page', 'editor');
        remove_post_type_support('page', 'comments');
        remove_meta_box('postimagediv', 'page', 'side');
        remove_meta_box('commentstatusdiv', 'page', 'normal');
    }
});

// The page's own text and images first, Yoast SEO below them.
add_filter('wpseo_metabox_prio', fn() => 'low');

add_action('edit_form_after_title', function (WP_Post $post) {
    if ($post->post_type === 'page' && in_array($post->ID, ldivn_managed_page_ids(), true)) {
        echo '<div class="notice notice-info inline" style="margin:12px 0"><p>Chữ và ảnh của trang này sửa ở các ô bên dưới. Ô nào để trống thì website dùng chữ mặc định. Bấm <strong>Cập nhật</strong> để lưu.</p></div>';
    }
});

// News: the summary shown on the cards is the excerpt, so keep its box open.
add_filter('default_hidden_meta_boxes', function ($hidden, $screen) {
    return $screen->id === 'post' ? array_values(array_diff($hidden, ['postexcerpt'])) : $hidden;
}, 10, 2);

// --- Comments: the site has none ----------------------------------------------------

add_filter('comments_open', '__return_false', 20);
add_filter('pings_open', '__return_false', 20);
add_filter('comments_array', '__return_empty_array', 20);
add_action('admin_menu', function () {
    remove_menu_page('edit-comments.php');
});
add_action('init', function () {
    remove_post_type_support('post', 'comments');
    remove_post_type_support('post', 'trackbacks');
});
add_action('wp_before_admin_bar_render', function () {
    global $wp_admin_bar;
    $wp_admin_bar->remove_menu('comments');
});
