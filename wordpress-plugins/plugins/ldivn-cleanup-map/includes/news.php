<?php
// The news lists made with Elementor's Posts widget (the homepage, the News page):
// each post in a rounded card that rises when the mouse is over it (assets/css/news.css).

defined('ABSPATH') || exit;

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('ldm-news', LDM_URL . 'assets/css/news.css', [], LDM_VERSION);
});
