/**
 * [ldivn_videos]: a video of the list plays in the player (includes/videos.php).
 */
(function () {
  'use strict';

  function init(root) {
    var frame = root.querySelector('.ldmv-frame iframe');
    var now = root.querySelector('.ldmv-now');
    var player = root.querySelector('.ldmv-player');

    root.addEventListener('click', function (e) {
      var item = e.target.closest ? e.target.closest('.ldmv-item') : null;
      if (!item || !root.contains(item) || !frame) return;
      root.querySelectorAll('.ldmv-item.is-active').forEach(function (el) {
        el.classList.remove('is-active');
        el.removeAttribute('aria-current');
      });
      item.classList.add('is-active');
      item.setAttribute('aria-current', 'true');
      var title = item.getAttribute('data-ldmv-title') || '';
      frame.src = 'https://www.youtube.com/embed/' + encodeURIComponent(item.getAttribute('data-ldmv-id')) + '?autoplay=1';
      frame.title = title;
      if (now) now.textContent = title;
      // On a phone the list is under the player: bring the player into view.
      var box = player.getBoundingClientRect();
      if (box.top < 0 || box.bottom > window.innerHeight) {
        player.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  function start() {
    document.querySelectorAll('.ldmv:not(.ldmv--ready)').forEach(function (root) {
      root.classList.add('ldmv--ready');
      init(root);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
