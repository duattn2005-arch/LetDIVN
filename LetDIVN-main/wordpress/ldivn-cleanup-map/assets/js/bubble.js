/**
 * The contact bubble (includes/bubble.php): the round button opens and closes
 * the window; a click outside it or Escape closes it.
 */
(function () {
  'use strict';

  function init(root) {
    var panel = root.querySelector('.ldcb-panel');
    var button = root.querySelector('.ldcb-btn');

    function set(open) {
      panel.hidden = !open;
      root.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    button.addEventListener('click', function () { set(panel.hidden); });
    root.querySelector('[data-ldcb-close]').addEventListener('click', function () { set(false); });
    document.addEventListener('mousedown', function (e) {
      if (!panel.hidden && !root.contains(e.target)) set(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) set(false);
    });
  }

  function start() {
    document.querySelectorAll('[data-ldcb]').forEach(init);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
