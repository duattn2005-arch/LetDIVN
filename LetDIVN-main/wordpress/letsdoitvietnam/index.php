<?php
// Every address renders the same page: the app reads the address and shows
// the right view. WordPress still sends the right status (404 for unknown
// addresses) and Yoast writes the title/description of the page asked for.
// A page with content of its own (e.g. a plugin's shortcode) prints it in
// #ldivn-page-content, which the app shows between its header and footer.
defined('ABSPATH') || exit;
$ldivn_page = is_page() ? get_queried_object() : null;
?><!doctype html>
<html <?php language_attributes(); ?>>
  <head>
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-SC9H766FBB"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-SC9H766FBB');
    </script>
    <meta charset="<?php bloginfo('charset'); ?>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Chau+Philomene+One&family=Poppins:wght@400;500;600;700&family=Roboto:wght@400;500;600;700&family=Roboto+Slab:wght@400;500&display=swap" rel="stylesheet">
    <?php wp_head(); ?>
  </head>
  <body class="bg-white text-slate-900 antialiased font-sans selection:bg-pink-500 selection:text-white">
    <?php wp_body_open(); ?>
    <div id="root"></div>
    <?php if ($ldivn_page && trim($ldivn_page->post_content) !== '') : ?>
    <div id="ldivn-page-content"><?php echo apply_filters('the_content', $ldivn_page->post_content); ?></div>
    <?php endif; ?>
    <?php wp_footer(); ?>
  </body>
</html>
