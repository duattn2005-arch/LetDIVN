<?php
// The site's footer, in the website's colours: a pink "People for a clean planet!"
// card with a Get Involved button, then the logo and three columns of links on the
// header's dark blue, then the copyright line (assets/css/footer.css). The row of
// four boxes the pages have over it becomes white cards (footer.css too). It takes
// the place of the theme's footer (Elementor's or Divi's). Turned off in Cài đặt.
// Also the Our Partners page's logos, each in a card with a pink-to-orange
// border (assets/css/partners.css).

defined('ABSPATH') || exit;

/** The columns of links: title => [[text, page slug], ...]. A page that doesn't exist links to /slug/ all the same. */
const LDF_COLUMNS = [
    'About' => [
        ['Who We Are', 'who-we-are'],
        ['What We Do', 'what-we-do'],
        ['Our Team', 'our-team'],
        ['Our Partners', 'our-partners'],
        ['Media Coverage', 'media-coverage'],
    ],
    'Campaigns' => [
        ['World Cleanup Day', 'world-cleanup-day'],
        ['Environmental Day', 'environmental-day'],
        ['Green Ocean Campaign', 'green-ocean-campaign'],
        ['Community Workshop', 'community-workshop'],
        ['Young Conservationists Save the Wildlife', 'ycsw'],
    ],
    'Get Involved' => [
        ['Volunteer', 'volunteer'],
        ['Cleanup Map', 'cleanup-map'],
        ['News', 'news'],
        ['Contact Us', 'contact-us'],
    ],
];

const LDF_SOCIAL = [
    ['Facebook', 'https://www.facebook.com/LetsDoItVietNam', '<path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.5 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07"/>'],
    ['Instagram', 'https://www.instagram.com/letsdoitvietnam/', '<path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/>'],
    ['Email', 'mailto:letsdoitvietnam@gmail.com', '<path d="M3 5h18a1 1 0 0 1 1 1v.4l-10 6.25L2 6.4V6a1 1 0 0 1 1-1zm-1 3.75V18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V8.75l-9.47 5.92a1 1 0 0 1-1.06 0z"/>'],
];

/** Whether the footer is on; then the theme's own footer is hidden (footer.css). */
function ldf_on(): bool
{
    return (bool) ldm_settings()['footer'];
}

/** A page's address from its slug: the sign-up form's and the contact page's as elsewhere in the plugin. */
function ldf_url(string $slug): string
{
    if ($slug === 'volunteer') {
        return ldv_page_url();
    }
    if ($slug === 'contact-us') {
        return ldcb_contact_page();
    }
    $page = get_page_by_path($slug);
    return $page && $page->post_status === 'publish' ? (string) get_permalink($page) : home_url('/' . $slug . '/');
}

/** The Privacy Policy and Terms of Service links: only the pages that are published. [[text, url], ...] */
function ldf_legal(): array
{
    $out = [];
    $privacy = get_privacy_policy_url();
    if ($privacy === '') {
        $page = get_page_by_path('privacy-policy');
        $privacy = $page && $page->post_status === 'publish' ? (string) get_permalink($page) : '';
    }
    if ($privacy !== '') {
        $out[] = ['Privacy Policy', $privacy];
    }
    foreach (['terms-of-service', 'terms-and-conditions', 'terms'] as $slug) {
        $page = get_page_by_path($slug);
        if ($page && $page->post_status === 'publish') {
            $out[] = ['Terms of Service', (string) get_permalink($page)];
            break;
        }
    }
    return $out;
}

add_action('wp_enqueue_scripts', function () {
    if (ldf_on()) {
        wp_enqueue_style('ldf', LDM_URL . 'assets/css/footer.css', [], LDM_VERSION);
    }
    if (is_page('our-partners')) {
        wp_enqueue_style('ldf-partners', LDM_URL . 'assets/css/partners.css', [], LDM_VERSION);
    }
});

add_filter('body_class', function ($classes) {
    if (is_page('our-partners')) {
        $classes[] = 'ldivn-partners';
    }
    return $classes;
});

// Before the contact bubble and the scripts, right after the theme's (hidden) footer.
add_action('wp_footer', function () {
    if (ldf_on()) {
        echo ldf_render();
    }
}, 1);

function ldf_render(): string
{
    $cols = '';
    foreach (LDF_COLUMNS as $title => $links) {
        $items = '';
        foreach ($links as [$text, $slug]) {
            $items .= '<li><a href="' . esc_url(ldf_url($slug)) . '">' . esc_html($text) . '</a></li>';
        }
        $social = '';
        if ($title === 'Get Involved') {
            foreach (LDF_SOCIAL as [$name, $url, $path]) {
                $external = strpos($url, 'http') === 0;
                $social .= '<a href="' . esc_url($url, ['http', 'https', 'mailto']) . '" aria-label="' . esc_attr($name) . '" title="' . esc_attr($name) . '"'
                    . ($external ? ' target="_blank" rel="noopener"' : '') . '>'
                    . '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' . $path . '</svg></a>';
            }
            $social = '<div class="ldf-social">' . $social . '</div>';
        }
        $cols .= '<nav class="ldf-col" aria-label="' . esc_attr($title) . '"><h3 class="ldf-h">' . esc_html($title) . '</h3><ul>' . $items . '</ul>' . $social . '</nav>';
    }

    $legal = '';
    foreach (ldf_legal() as [$text, $url]) {
        $legal .= '<span class="ldf-sep" aria-hidden="true">|</span><a href="' . esc_url($url) . '">' . esc_html($text) . '</a>';
    }

    return '<footer class="ldf" role="contentinfo">'
        // The pink card, half over the page and half over the footer.
        . '<div class="ldf-cta"><div class="ldf-in"><div class="ldf-cta-card">'
        . '<p class="ldf-cta-t"><span class="ldf-cta-ic" aria-hidden="true">' . ldf_leaf() . '</span>People for a clean planet!</p>'
        . '<a class="ldf-btn" href="' . esc_url(ldv_page_url()) . '">Get Involved<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg></a>'
        . '</div></div></div>'
        // The logo and the links.
        . '<div class="ldf-main"><div class="ldf-in ldf-grid">'
        . '<div class="ldf-brand">'
        . '<a class="ldf-logo" href="' . esc_url(home_url('/')) . '" aria-label="Let&rsquo;s do it! Vietnam">'
        // The header's logo, its words white.
        . '<img src="' . esc_url(LDM_URL . 'assets/images/logo-footer.png') . '" alt="" width="720" height="246" loading="lazy" decoding="async">'
        . '</a>'
        . '<p class="ldf-tag">Together for a cleaner Vietnam.</p>'
        . '<p class="ldf-about">We mobilize volunteers, raise environmental awareness, and build community action for a greener, healthier Vietnam.</p>'
        . '</div>'
        . $cols
        . '</div></div>'
        // The copyright line.
        . '<div class="ldf-bottom"><div class="ldf-in ldf-bottom-in">'
        . '<p>&copy; ' . esc_html(wp_date('Y')) . ' Let&rsquo;s Do It! Vietnam. All rights reserved.</p>'
        . ($legal !== '' ? '<p class="ldf-legal">' . $legal . '</p>' : '')
        . '</div></div>'
        . '</footer>';
}

/** The leaf by the slogan. */
function ldf_leaf(): string
{
    return '<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M58 4C30 4 12 14 9 36c-1 7 1 13 4 18L6 61l3 2 7-7c5 3 11 4 17 2C52 52 60 30 58 4zM18 50c8-14 18-24 30-33-10 10-18 20-26 36z"/></svg>';
}
