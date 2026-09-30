<?php
/**
 * Plugin Name: LDIVN Cleanup Map
 * Plugin URI: https://letsdoitvietnam.org
 * Description: Báº£n Ä‘á»“ Ä‘iá»ƒm dá»n rÃ¡c toÃ n quá»‘c (Nationwide Cleanup Spot Map) vÃ  form "Register to Volunteer" cá»§a Let's Do It Vietnam. ChÃ¨n báº£n Ä‘á»“ báº±ng shortcode [ldivn_cleanup_map]; form má»Ÿ tá»« nÃºt Register trÃªn báº£n Ä‘á»“, tá»« link "#volunteer" (vd. má»™t má»¥c menu) hoáº·c [ldivn_volunteer_form]. Xem Ä‘Äƒng kÃ½ á»Ÿ menu "TÃ¬nh nguyá»‡n viÃªn".
 * Version: 1.11.3
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * Author: Let's Do It Vietnam
 * License: GPLv2 or later
 * Text Domain: ldivn-map
 */

defined('ABSPATH') || exit;

define('LDM_VERSION', '1.11.3');
define('LDM_DIR', __DIR__);
define('LDM_URL', plugin_dir_url(__FILE__));
define('LDM_TYPE', 'ldivn_map_spot');
define('LDM_OPTION', 'ldivn_map_settings');

/** The 9 provinces and cities with a local team: always pinned. "Name | lat | lng | other names". */
const LDM_DEFAULT_TEAMS = "Hanoi | 21.0285 | 105.8542
Quang Tri | 16.8163 | 107.1003
Quang Ngai | 15.1205 | 108.7923
Hai Phong | 20.8449 | 106.6881
Binh Thuan | 10.9289 | 108.1021
Ho Chi Minh City | 10.7769 | 106.7009 | HCMC, Saigon
Da Nang | 16.0544 | 108.2022
Can Tho | 10.0452 | 105.7469
Quy Nhon | 13.7765 | 109.2237";

function ldm_defaults(): array
{
    return [
        'title' => 'Nationwide Cleanup Spot Map',
        'subtitle' => 'Search any place, school, hospital or landmark to locate directly on the map.',
        'height' => 'calc(100vh - 80px)',
        'details_url' => '',
        'register_url' => '',
        'teams' => LDM_DEFAULT_TEAMS,
        'scheme' => 'new',
        'show_past' => 0,
        'click_pin' => 1,
        'core_events' => 1,
        // The live site: its events are on the map, its pages open from the popups.
        'site_events' => 1,
        'site_url' => 'https://letsdoitvietnam.online',
        // Volunteer sign-up (includes/volunteer.php).
        'vol_on_map' => 1,
        'vol_everywhere' => 1,
        'vol_forward' => 1,
        'vol_email' => '',
        // The contact bubble on every page (includes/bubble.php), its window open.
        'bubble' => 1,
        'bubble_open' => 1,
        // The newest posts running along the top of every page (includes/latest.php).
        'latest' => 1,
    ];
}

function ldm_settings(): array
{
    return wp_parse_args((array) get_option(LDM_OPTION, []), ldm_defaults());
}

/** The local teams' pins from the settings text: one "Name | lat | lng | aliases" per line. */
function ldm_teams(): array
{
    $out = [];
    foreach (preg_split('/\r\n|\r|\n/', (string) ldm_settings()['teams']) as $line) {
        $parts = array_map('trim', explode('|', $line));
        if (count($parts) < 3 || $parts[0] === '' || !is_numeric($parts[1]) || !is_numeric($parts[2])) {
            continue;
        }
        $aliases = isset($parts[3]) ? array_values(array_filter(array_map('trim', explode(',', $parts[3])))) : [];
        $out[] = ['name' => $parts[0], 'lat' => (float) $parts[1], 'lng' => (float) $parts[2], 'aliases' => $aliases];
    }
    return $out;
}

/** A link pattern from the settings with {id}, {slug} and {title} filled in. */
function ldm_link(string $pattern, string $id, string $slug, string $title): string
{
    if ($pattern === '') {
        return '';
    }
    return esc_url_raw(strtr($pattern, ['{id}' => rawurlencode($id), '{slug}' => rawurlencode($slug), '{title}' => rawurlencode($title)]));
}

require_once LDM_DIR . '/includes/spots.php';
require_once LDM_DIR . '/includes/settings.php';
require_once LDM_DIR . '/includes/rest.php';
require_once LDM_DIR . '/includes/shortcode.php';
require_once LDM_DIR . '/includes/xlsx.php';
require_once LDM_DIR . '/includes/volunteer.php';
require_once LDM_DIR . '/includes/volunteer-form.php';
require_once LDM_DIR . '/includes/samples.php';
require_once LDM_DIR . '/includes/import.php';
require_once LDM_DIR . '/includes/menu.php';
require_once LDM_DIR . '/includes/videos.php';
require_once LDM_DIR . '/includes/bubble.php';
require_once LDM_DIR . '/includes/latest.php';
require_once LDM_DIR . '/includes/media-coverage.php';

add_filter('plugin_action_links_' . plugin_basename(__FILE__), function ($links) {
    array_unshift($links, '<a href="' . esc_url(admin_url('edit.php?post_type=' . LDM_TYPE . '&page=ldivn-map-settings')) . '">CÃ i Ä‘áº·t</a>');
    return $links;
});
