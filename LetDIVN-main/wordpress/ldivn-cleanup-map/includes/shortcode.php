<?php
// [ldivn_cleanup_map]: the map on any page. The page only gets a placeholder
// box of the map's size; assets/js/map.js draws the map into it.

defined('ABSPATH') || exit;

// Registered early: block themes render the page (and so the shortcode, which
// adds the map's data to its script) before "wp_enqueue_scripts" runs.
add_action('init', function () {
    if (is_admin()) {
        return;
    }
    wp_register_style('ldm-leaflet', LDM_URL . 'assets/vendor/leaflet/leaflet.css', [], '1.9.4');
    wp_register_script('ldm-leaflet', LDM_URL . 'assets/vendor/leaflet/leaflet.js', [], '1.9.4', true);
    wp_register_style('ldm-map', LDM_URL . 'assets/css/map.css', ['ldm-leaflet'], LDM_VERSION);
    wp_register_script('ldm-map', LDM_URL . 'assets/js/map.js', ['ldm-leaflet'], LDM_VERSION, true);
});

add_action('wp_enqueue_scripts', function () {
    // In the <head> when the page is known to hold the map (no flash of an unstyled box).
    $post = get_post();
    if (is_singular() && $post && has_shortcode((string) $post->post_content, 'ldivn_cleanup_map')) {
        wp_enqueue_style('ldm-map');
    }
});

/** Whether this page is just the full-width map (nothing else in it). */
function ldm_is_map_page(): bool
{
    $post = get_post();
    if (!is_singular() || !$post) {
        return false;
    }
    $content = (string) $post->post_content;
    if (!preg_match('/\[ldivn_cleanup_map\b[^\]]*\bfullwidth=["\']?(?:yes|1|true)\b/i', $content)) {
        return false;
    }
    return trim(wp_strip_all_tags(preg_replace('/\[ldivn_cleanup_map\b[^\]]*\]/i', '', $content))) === '';
}

// Such a page shows the map right under the site's header (".ldm-map-page" in map.css).
add_filter('body_class', function ($classes) {
    if (ldm_is_map_page()) {
        $classes[] = 'ldm-map-page';
    }
    return $classes;
});

add_shortcode('ldivn_cleanup_map', 'ldm_shortcode');

function ldm_shortcode($atts): string
{
    $s = ldm_settings();
    $a = shortcode_atts([
        'title' => $s['title'],
        'subtitle' => $s['subtitle'],
        'height' => $s['height'],
        'year' => '',
        'scheme' => $s['scheme'],
        'fullwidth' => 'no',
    ], $atts, 'ldivn_cleanup_map');

    wp_enqueue_style('ldm-map');
    wp_enqueue_script('ldm-map');
    if ($s['vol_on_map']) {
        ldv_enqueue(); // the Register buttons open the sign-up form
    }

    static $data_added = false;
    if (!$data_added) {
        $data_added = true;
        wp_add_inline_script('ldm-map', 'window.LDIVN_MAP = ' . wp_json_encode([
            'events' => array_merge(ldm_events(), ldm_demo_events()),
            'teams' => ldm_teams(),
            'pin' => LDM_URL . 'assets/images/map-pin.png',
            'showPast' => (bool) $s['show_past'],
            'clickPin' => (bool) $s['click_pin'],
            'rest' => [
                'search' => rest_url('ldivn-map/v1/geocode/search'),
                'reverse' => rest_url('ldivn-map/v1/geocode/reverse'),
                'photon' => rest_url('ldivn-map/v1/geocode/photon'),
            ],
        ]) . ';', 'before');
    }

    $height = preg_replace('/[^0-9a-zA-Z%.()+\-\s]/', '', (string) $a['height']) ?: 'calc(100vh - 80px)';
    $config = [
        'title' => (string) $a['title'],
        'subtitle' => (string) $a['subtitle'],
        'year' => absint($a['year']) ?: (int) wp_date('Y'),
        'scheme' => $a['scheme'] === 'old' ? 'old' : 'new',
    ];
    $full = in_array(strtolower((string) $a['fullwidth']), ['yes', '1', 'true'], true);

    return sprintf(
        '<div class="ldm%s" style="--ldm-h:%s" data-ldm="%s"><noscript><p style="padding:24px;color:#fff">%s</p></noscript></div>',
        $full ? ' ldm--full' : '',
        esc_attr($height),
        esc_attr(wp_json_encode($config)),
        esc_html__('Please turn on JavaScript to see the cleanup map.', 'ldivn-map')
    );
}
