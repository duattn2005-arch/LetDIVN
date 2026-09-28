<?php
// The site's pages are the React app in dist/ (built from src/ with
// `npm run build:wp`); WordPress provides the content (plugin ldivn-core),
// the page head (Yoast SEO) and the admin.

defined('ABSPATH') || exit;

add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    register_nav_menus(['header' => 'Menu trên header']);
});

// Giao diện → Menu: the items of the menu at "Menu trên header" are added to
// the app's header (window.ldivnHeaderMenu = [{title, url}]).
add_action('wp_head', function () {
    $locations = get_nav_menu_locations();
    $items = empty($locations['header']) ? [] : (wp_get_nav_menu_items($locations['header']) ?: []);
    $menu = [];
    foreach ($items as $item) {
        if (!$item->menu_item_parent) {
            $menu[] = ['title' => $item->title, 'url' => $item->url];
        }
    }
    echo '<script>window.ldivnHeaderMenu = ' . wp_json_encode($menu) . ";</script>\n";
});

add_action('wp_enqueue_scripts', function () {
    $manifest = json_decode((string) @file_get_contents(__DIR__ . '/dist/.vite/manifest.json'), true);
    $entry = $manifest['src/main.tsx'] ?? null;
    if (!$entry) {
        return;
    }
    $base = get_theme_file_uri('dist/');
    foreach ($entry['css'] ?? [] as $i => $css) {
        wp_enqueue_style("ldivn-app-$i", $base . $css, [], null);
    }
    wp_enqueue_script_module('ldivn-app', $base . $entry['file'], [], null);

    // WordPress's default front-end styles would change how the app looks.
    foreach (['wp-block-library', 'wp-block-library-theme', 'classic-theme-styles', 'global-styles', 'core-block-supports'] as $handle) {
        wp_dequeue_style($handle);
    }
}, 100);

remove_action('wp_head', 'print_emoji_detection_script', 7);
remove_action('wp_print_styles', 'print_emoji_styles');
remove_action('wp_head', 'wp_generator');
remove_action('wp_head', 'rsd_link');
remove_action('wp_head', 'wlwmanifest_link');
remove_action('wp_head', 'wp_shortlink_wp_head');
add_filter('wp_img_tag_add_auto_sizes', '__return_false');
remove_action('wp_enqueue_scripts', 'wp_enqueue_global_styles');
remove_action('wp_footer', 'wp_enqueue_global_styles', 1);
remove_action('wp_body_open', 'wp_global_styles_render_svg_filters');
