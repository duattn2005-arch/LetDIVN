<?php
// The contact bubble of the Let's Do It Vietnam website, bottom right of every
// page: Facebook, Instagram, the hotlines, email and the contact page
// (assets/css/bubble.css, assets/js/bubble.js). Its window opens by itself when
// the site is loaded or reloaded. Both turned off in Cài đặt.

defined('ABSPATH') || exit;

/** What the bubble lists: [kind, label, value, link]. */
const LDCB_CONTACTS = [
    ['fb', 'Facebook Fanpage', 'fb.com/LetsDoItVietNam', 'https://www.facebook.com/LetsDoItVietNam'],
    ['ig', 'Instagram', '@letsdoitvietnam', 'https://www.instagram.com/letsdoitvietnam/'],
    ['phone', 'Hotline + Zalo (Mr. Son)', '035.872.6755', 'tel:0358726755'],
    ['phone', 'Hotline + Zalo (Ms. Tu)', '0968.514.882', 'tel:0968514882'],
    ['mail', 'Email', 'letsdoitvietnam@gmail.com', 'mailto:letsdoitvietnam@gmail.com'],
];

const LDCB_ICONS = [
    'message' => '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    'x' => '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    'headphones' => '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
    'fb' => '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    'ig' => '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
    'phone' => '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    'mail' => '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    'send' => '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    'chevron' => '<path d="m9 18 6-6-6-6"/>',
];

function ldcb_icon(string $name, string $class = ''): string
{
    return '<svg class="' . esc_attr($class) . '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' . LDCB_ICONS[$name] . '</svg>';
}

/** The contact page: /contact-us/ (the site's), else /contact/. */
function ldcb_contact_page(): string
{
    foreach (['contact-us', 'contact'] as $slug) {
        $page = get_page_by_path($slug);
        if ($page && $page->post_status === 'publish') {
            return (string) get_permalink($page);
        }
    }
    return home_url('/contact-us/');
}

add_action('wp_enqueue_scripts', function () {
    if (ldm_settings()['bubble']) {
        wp_enqueue_style('ldcb', LDM_URL . 'assets/css/bubble.css', [], LDM_VERSION);
        wp_enqueue_script('ldcb', LDM_URL . 'assets/js/bubble.js', [], LDM_VERSION, true);
    }
});

add_action('wp_footer', function () {
    $s = ldm_settings();
    if (!$s['bubble']) {
        return;
    }
    $rows = '';
    foreach (LDCB_CONTACTS as [$kind, $label, $value, $url]) {
        $external = strpos($url, 'http') === 0;
        $rows .= '<a class="ldcb-row ldcb-row--' . esc_attr($kind) . '" href="' . esc_url($url, ['http', 'https', 'tel', 'mailto']) . '"' . ($external ? ' target="_blank" rel="noopener"' : '') . '>'
            . '<span class="ldcb-row-l"><span class="ldcb-ic">' . ldcb_icon($kind) . '</span>'
            . '<span class="ldcb-text"><span class="ldcb-label">' . esc_html($label) . '</span><span class="ldcb-val">' . esc_html($value) . '</span></span></span>'
            . ldcb_icon('chevron', 'ldcb-chev')
            . '</a>';
    }
    echo '<div class="ldcb" data-ldcb' . ($s['bubble_open'] ? ' data-ldcb-auto' : '') . '>'
        . '<div class="ldcb-panel" id="ldcb-panel" role="dialog" aria-label="Quick Support" hidden>'
        . '<div class="ldcb-top">'
        . '<div class="ldcb-top-l"><span class="ldcb-top-ic">' . ldcb_icon('headphones') . '</span>'
        . '<div><div class="ldcb-title">Quick Support <span class="ldcb-live"></span></div><div class="ldcb-sub">We are here to help</div></div></div>'
        . '<button type="button" class="ldcb-x" data-ldcb-close aria-label="Close" title="Close">' . ldcb_icon('x') . '</button>'
        . '</div>'
        . '<div class="ldcb-body">' . $rows
        . '<a class="ldcb-open" href="' . esc_url(ldcb_contact_page()) . '">' . ldcb_icon('send') . '<span>Open Contact Page</span></a>'
        . '</div>'
        . '</div>'
        . '<button type="button" class="ldcb-btn" aria-expanded="false" aria-controls="ldcb-panel" aria-label="Quick Support" title="Quick Support">'
        . '<span class="ldcb-ping"></span>'
        . '<span class="ldcb-icon">' . ldcb_icon('message', 'ldcb-i-open') . ldcb_icon('x', 'ldcb-i-close') . '<span class="ldcb-dot"></span></span>'
        . '</button>'
        . '</div>';
});
