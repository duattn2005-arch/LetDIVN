<?php
// "Media On Us" is called "Media Coverage" now. Once, the first time an admin
// opens the dashboard with this version: the page (its title and address
// /media-coverage/), the menu items named so and the Elementor texts saying
// it. The old address /media-on-us/ keeps leading to the page.

defined('ABSPATH') || exit;

const LDMC_OPTION = 'ldm_media_coverage'; // the page's id once renamed

/** "Media On Us" → "Media Coverage" in a text (in capitals when it was). */
function ldmc_rename(string $text): string
{
    return (string) preg_replace_callback(
        '/\bmedia\s+on\s+us\b/i',
        fn($m) => $m[0] === strtoupper($m[0]) ? 'MEDIA COVERAGE' : 'Media Coverage',
        $text
    );
}

add_action('admin_init', function () {
    if (get_option(LDMC_OPTION) !== false || !current_user_can('manage_options')) {
        return;
    }
    $page = get_page_by_path('media-on-us');
    update_option(LDMC_OPTION, $page ? $page->ID : 0, false);

    if ($page) {
        wp_update_post(wp_slash([
            'ID' => $page->ID,
            'post_title' => ldmc_rename($page->post_title),
            'post_name' => 'media-coverage',
        ]));
    }

    // Menu items with a name of their own (the others show the page's title).
    foreach (get_posts(['post_type' => 'nav_menu_item', 'post_status' => 'any', 'numberposts' => -1, 'no_found_rows' => true]) as $item) {
        $title = ldmc_rename($item->post_title);
        if ($title !== $item->post_title) {
            wp_update_post(wp_slash(['ID' => $item->ID, 'post_title' => $title]));
        }
    }

    // The pages, header and footer built with Elementor.
    global $wpdb;
    $ids = $wpdb->get_col("SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = '_elementor_data' AND meta_value LIKE '%on us%'");
    foreach ($ids as $id) {
        $data = get_post_meta((int) $id, '_elementor_data', true);
        if (!is_string($data)) {
            continue;
        }
        $renamed = ldmc_rename($data);
        if ($renamed !== $data) {
            update_post_meta((int) $id, '_elementor_data', wp_slash($renamed));
            delete_post_meta((int) $id, '_elementor_element_cache');
        }
    }
    if (class_exists('\Elementor\Plugin') && isset(\Elementor\Plugin::$instance->files_manager)) {
        \Elementor\Plugin::$instance->files_manager->clear_cache();
    }
});

// The old address leads to the renamed page.
add_action('template_redirect', function () {
    if (!is_404()) {
        return;
    }
    $page_id = (int) get_option(LDMC_OPTION);
    $path = trim((string) wp_parse_url((string) ($_SERVER['REQUEST_URI'] ?? ''), PHP_URL_PATH), '/');
    $old = trim((string) wp_parse_url(home_url('/media-on-us/'), PHP_URL_PATH), '/');
    if ($page_id && $path === $old && get_post_status($page_id) === 'publish') {
        wp_safe_redirect(get_permalink($page_id), 301);
        exit;
    }
}, 5);
