<?php
// The pages' paragraphs justified (both edges straight) instead of ragged on the right:
// those of the page contents, the posts and the news excerpts that are left-aligned.
// Centred and right-aligned ones stay as they are, and so do the header, the menus,
// the footer and the plugin's windows and form.

defined('ABSPATH') || exit;

add_action('wp_footer', function () {
    ?>
<style id="ldm-justify-css">.ldm-justify{text-align:justify!important;text-justify:inter-word}</style>
<script id="ldm-justify-js">
(function () {
  var SKIP = 'header, nav, footer, .elementor-location-header, .ldf, .ldv, .ldcb, .ldlp, .ldm[data-ldm], .elementor-icon-box-wrapper';
  function run() {
    [].forEach.call(document.querySelectorAll('p'), function (p) {
      if (p.classList.contains('ldm-justify') || p.closest(SKIP)) return;
      // Short lines (a caption, a button's words) would gain nothing.
      if ((p.textContent || '').trim().length < 60) return;
      var align = getComputedStyle(p).textAlign;
      if (align === 'left' || align === 'start') p.classList.add('ldm-justify');
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  window.addEventListener('load', run);
})();
</script>
    <?php
}, 30);
