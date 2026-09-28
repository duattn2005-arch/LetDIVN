<?php
// Addresses: /api/* is the site's JSON API, /explore-campaigns/<city>/ is a
// campaign page drawn by the site's app, and the old addresses of
// letsdoitvietnam.org's pages redirect to the pages here.

defined('ABSPATH') || exit;

/** Old address => page here (same list as PATH_ALIASES in src/App.tsx). */
const LDIVN_ALIASES = [
    'ycsw' => 'wildlife-nature',
    'community-workshop' => 'workshop-education',
    'contact-us' => 'contact',
    'projects' => 'cleanup-map',
    'explore-campaigns' => 'cleanup-map',
];

function ldivn_register_rewrites(): void
{
    add_rewrite_rule('^api/(.*)?$', 'index.php?rest_route=/ldivn/v1/$matches[1]', 'top');
    add_rewrite_rule('^explore-campaigns/([^/]+)/?$', 'index.php?ldivn_campaign=$matches[1]', 'top');
}
add_action('init', 'ldivn_register_rewrites');

add_filter('query_vars', function ($vars) {
    $vars[] = 'ldivn_campaign';
    return $vars;
});

add_action('template_redirect', function () {
    $path = trim((string) parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH), '/');
    if (isset(LDIVN_ALIASES[$path])) {
        wp_safe_redirect(home_url('/' . LDIVN_ALIASES[$path] . '/'), 301);
        exit;
    }

    $campaign = get_query_var('ldivn_campaign');
    if ($campaign !== '') {
        global $wp_query;
        $found = false;
        foreach (ldivn_get_events() as $event) {
            if ($event['id'] === $campaign || ldivn_slugify($event['city']) === $campaign) {
                $found = true;
                break;
            }
        }
        if ($found) {
            $wp_query->is_404 = false;
            $wp_query->is_home = false;
            status_header(200);
        } else {
            $wp_query->set_404();
            status_header(404);
        }
    }
}, 1);

// A mistyped address shows the "not found" page instead of WordPress guessing a post.
add_filter('do_redirect_guess_404_permalink', '__return_false');
