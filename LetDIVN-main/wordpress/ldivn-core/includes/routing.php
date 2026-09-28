<?php
// Addresses: /api/* is the site's JSON API, and the old addresses of
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
}
add_action('init', 'ldivn_register_rewrites');

add_action('template_redirect', function () {
    $path = trim((string) parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH), '/');
    if (isset(LDIVN_ALIASES[$path])) {
        wp_safe_redirect(home_url('/' . LDIVN_ALIASES[$path] . '/'), 301);
        exit;
    }
}, 1);

// A mistyped address shows the "not found" page instead of WordPress guessing a post.
add_filter('do_redirect_guess_404_permalink', '__return_false');
