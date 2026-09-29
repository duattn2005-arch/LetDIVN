<?php
// Menu items for the map and the sign-up form, as in the Let's Do It Vietnam
// header: the item of the map's page gets a pin, a "#volunteer" item becomes an
// outlined pink button (assets/css/menu.css). Works with any menu (Appearance →
// Menus), including Elementor's Nav Menu widget.

defined('ABSPATH') || exit;

const LDM_MENU_PIN = '<svg class="ldm-menu-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>';

/** 'map' (a page with the map), 'volunteer' (a link to "#volunteer" or /volunteer/) or '' for a menu item. */
function ldm_menu_kind($item): string
{
    static $map_pages = [];
    if (preg_match('~#(?:ldivn-)?volunteer$|^' . preg_quote(untrailingslashit(ldv_page_url()), '~') . '/?$~', (string) ($item->url ?? ''))) {
        return 'volunteer';
    }
    if (($item->object ?? '') !== 'page') {
        return '';
    }
    $id = (int) $item->object_id;
    $map_pages[$id] ??= has_shortcode((string) get_post_field('post_content', $id), 'ldivn_cleanup_map');
    return $map_pages[$id] ? 'map' : '';
}

add_filter('nav_menu_css_class', function ($classes, $item) {
    $kind = ldm_menu_kind($item);
    if ($kind !== '') {
        $classes[] = 'ldivn-menu-' . $kind;
    }
    return $classes;
}, 10, 2);

add_filter('nav_menu_item_title', fn($title, $item) => ldm_menu_kind($item) === 'map' ? LDM_MENU_PIN . $title : $title, 10, 2);

// The Volunteer item links to the form's own address (the form still opens in place: volunteer.js).
add_filter('nav_menu_link_attributes', function ($atts, $item) {
    if (ldm_menu_kind($item) === 'volunteer') {
        $atts['href'] = ldv_page_url();
    }
    return $atts;
}, 10, 2);

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('ldm-menu', LDM_URL . 'assets/css/menu.css', [], LDM_VERSION);
    wp_enqueue_script('ldm-menu', LDM_URL . 'assets/js/menu.js', [], LDM_VERSION, true);
});
