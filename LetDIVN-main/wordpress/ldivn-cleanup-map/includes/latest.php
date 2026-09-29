<?php
// The newest posts along the top of every page, above the header: a dark bar
// with their titles running by, as the Let's Do It Vietnam website's
// announcement bar (assets/css/latest.css, assets/js/latest.js). Always the 5
// newest, so a new post shows as soon as it is published. Turned off in Cài đặt.

defined('ABSPATH') || exit;

const LDLP_COUNT = 5;

add_action('wp_enqueue_scripts', function () {
    if (ldm_settings()['latest']) {
        wp_enqueue_style('ldlp', LDM_URL . 'assets/css/latest.css', [], LDM_VERSION);
        wp_enqueue_script('ldlp', LDM_URL . 'assets/js/latest.js', [], LDM_VERSION, true);
    }
});

/** The bar's HTML, or '' with no posts. */
function ldlp_bar(): string
{
    $s = ldm_settings();
    $posts = get_posts([
        'post_type' => 'post',
        'post_status' => 'publish',
        'numberposts' => LDLP_COUNT,
        'orderby' => 'date',
        'order' => 'DESC',
        'no_found_rows' => true,
        'suppress_filters' => false, // in the page's language with a translation plugin
    ]);
    if (!$posts) {
        return '';
    }
    // The titles twice in a row: the second follows the first, so they run by without a gap.
    $run = function (bool $copy) use ($posts): string {
        $out = '';
        foreach ($posts as $p) {
            $title = wp_strip_all_tags(html_entity_decode(get_the_title($p), ENT_QUOTES, 'UTF-8'));
            $out .= '<a class="ldlp-item" href="' . esc_url(get_permalink($p)) . '"' . ($copy ? ' tabindex="-1"' : '') . '>'
                . '<span class="ldlp-dot"></span>' . esc_html($title) . '</a>';
        }
        return '<div class="ldlp-run"' . ($copy ? ' aria-hidden="true"' : '') . '>' . $out . '</div>';
    };
    return '<div class="ldlp" role="region" aria-label="' . esc_attr($s['latest_label']) . '">'
        . '<div class="ldlp-in">'
        . '<span class="ldlp-label"><span class="ldlp-live"></span>' . esc_html($s['latest_label']) . '</span>'
        . '<div class="ldlp-view"><div class="ldlp-track">' . $run(false) . $run(true) . '</div></div>'
        . '</div>'
        . '</div>';
}

// Right after <body>, before the header. A theme that doesn't call wp_body_open
// gets it from the footer, moved to the top at once.
add_action('wp_body_open', function () {
    if (ldm_settings()['latest'] && !did_action('ldlp_printed')) {
        do_action('ldlp_printed');
        echo ldlp_bar();
    }
}, 5);

add_action('wp_footer', function () {
    if (!ldm_settings()['latest'] || did_action('ldlp_printed')) {
        return;
    }
    do_action('ldlp_printed');
    $bar = ldlp_bar();
    if ($bar !== '') {
        echo '<template id="ldlp-late">' . $bar . '</template>'
            . '<script>(function(t){if(t){document.body.insertBefore(t.content.firstElementChild,document.body.firstChild);t.remove();}})(document.getElementById("ldlp-late"));</script>';
    }
}, 1);
