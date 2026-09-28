<?php
/**
 * Plugin Name: Let's Do It Vietnam – Core
 * Description: Nội dung, API và biểu mẫu của website Let's Do It Vietnam. Giao diện nằm ở theme "Let's Do It Vietnam".
 * Version: 1.0.0
 * Requires at least: 6.5
 * Requires PHP: 8.1
 * Requires Plugins: secure-custom-fields
 * Text Domain: ldivn
 */

defined('ABSPATH') || exit;

define('LDIVN_DIR', __DIR__);

/**
 * Decap collections (see schema.json, generated from public/admin/decap/config.yml)
 * that are lists of entries, and the post type each one is stored as. News is
 * WordPress's own "post".
 */
const LDIVN_TYPES = [
    'events' => 'ldivn_event',
    'videos' => 'ldivn_video',
    'partners' => 'ldivn_partner',
    'team' => 'ldivn_team',
    'what-we-do' => 'ldivn_wwd',
    'who-we-are' => 'ldivn_wwa',
    'media-coverage' => 'ldivn_press',
];

/** Id prefix of entries created in WordPress (migrated ones keep their own id). */
const LDIVN_ID_PREFIX = [
    'events' => 'evt',
    'videos' => 'vid',
    'partners' => 'part',
    'team' => 'tm',
    'what-we-do' => 'wwd',
    'who-we-are' => 'wwa',
    'media-coverage' => 'mc',
];

/** The site's pages, by key: the WordPress page each one is, and its address. */
const LDIVN_PAGES = [
    'home' => ['title' => 'Home', 'slug' => 'home'],
    'who-we-are' => ['title' => 'Who We Are', 'slug' => 'who-we-are'],
    'what-we-do' => ['title' => 'What We Do', 'slug' => 'what-we-do'],
    'our-team' => ['title' => 'Our Team', 'slug' => 'our-team'],
    'our-partners' => ['title' => 'Our Partners', 'slug' => 'our-partners'],
    'cleanup-map' => ['title' => 'Cleanup Map', 'slug' => 'cleanup-map'],
    'news' => ['title' => 'News', 'slug' => 'news'],
    'media-on-us' => ['title' => 'Media on Us', 'slug' => 'media-on-us'],
    'videos' => ['title' => 'Videos', 'slug' => 'videos'],
    'contact' => ['title' => 'Contact', 'slug' => 'contact'],
];

/**
 * Which page edits each file of Decap's "pages" collection (the text and
 * images of the pages). Files not listed are site-wide and live on the
 * "Thông tin chung" options page.
 */
const LDIVN_PAGE_FILES = [
    'hero' => 'home',
    'home' => 'home',
    'about' => 'home',
    'getInvolved' => 'home',
    'whoWeAre' => 'who-we-are',
    'whatWeDo' => 'what-we-do',
    'ourTeam' => 'our-team',
    'ourPartners' => 'our-partners',
    'cleanupMap' => 'cleanup-map',
    'newsPage' => 'news',
    'mediaOnUsPage' => 'media-on-us',
    'videosPage' => 'videos',
    'contactPage' => 'contact',
];

const LDIVN_OPTIONS_PAGE = 'ldivn-settings';

function ldivn_schema(): array
{
    static $schema = null;
    return $schema ??= json_decode(file_get_contents(LDIVN_DIR . '/schema.json'), true);
}

function ldivn_collection(string $name): array
{
    foreach (ldivn_schema()['collections'] as $collection) {
        if ($collection['name'] === $name) {
            return $collection;
        }
    }
    throw new RuntimeException("Unknown collection $name");
}

/** Page id by LDIVN_PAGES key, or "project:<slug>" for a project story page. */
function ldivn_page_id(string $key): int
{
    $ids = get_option('ldivn_pages', []);
    return (int) ($ids[$key] ?? 0);
}

/** Project story pages: [slug => page id]. */
function ldivn_project_pages(): array
{
    $out = [];
    foreach (get_option('ldivn_pages', []) as $key => $id) {
        if (str_starts_with($key, 'project:')) {
            $out[substr($key, 8)] = (int) $id;
        }
    }
    return $out;
}

// --- API cache -------------------------------------------------------------------
// The JSON the site reads is rebuilt only after something is saved.

function ldivn_cached(string $name, callable $build)
{
    $key = 'ldivn_' . md5($name . '|' . get_option('ldivn_cache_ver', 1));
    $value = get_transient($key);
    if ($value === false) {
        $value = $build();
        set_transient($key, $value, DAY_IN_SECONDS);
    }
    return $value;
}

function ldivn_flush_cache(): void
{
    update_option('ldivn_cache_ver', (int) get_option('ldivn_cache_ver', 1) + 1, false);
}

foreach (['save_post', 'deleted_post', 'trashed_post', 'untrashed_post', 'edited_term', 'acf/save_post'] as $hook) {
    add_action($hook, 'ldivn_flush_cache');
}

require_once LDIVN_DIR . '/includes/types.php';
require_once LDIVN_DIR . '/includes/fields.php';
require_once LDIVN_DIR . '/includes/content.php';
require_once LDIVN_DIR . '/includes/api.php';
require_once LDIVN_DIR . '/includes/submissions.php';
require_once LDIVN_DIR . '/includes/routing.php';

if (defined('WP_CLI') && WP_CLI) {
    require_once LDIVN_DIR . '/includes/cli.php';
}

register_activation_hook(__FILE__, function () {
    ldivn_register_types();
    ldivn_register_rewrites();
    flush_rewrite_rules();
});
