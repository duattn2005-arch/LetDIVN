/**
 * The contact bubble (includes/bubble.php): the round button opens and closes
 * the window; Escape closes it, and so does a click outside it when it was
 * opened by the button. With data-ldcb-auto the window opens by itself when
 * the site is loaded or reloaded, not when going from one of its pages to another.
 */
(function () {
  'use strict';

  function siteLoaded() {
    var nav = window.performance && performance.getEntriesByType ? performance.getEntriesByType('navigation')[0] : null;
    var type = nav ? nav.type : '';
    if (type === 'reload') return true;
    if (type === 'back_forward') return false;
    // Opened from another page of this site: moving around it, not loading it.
    try {
      return !document.referrer || new URL(document.referrer).host !== location.host;
    } catch (e) {
      return true;
    }
  }

  function init(root) {
    var panel = root.querySelector('.ldcb-panel');
    var button = root.querySelector('.ldcb-btn');
    var byButton = false;

    function set(open) {
      panel.hidden = !open;
      root.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    button.addEventListener('click', function () {
      byButton = panel.hidden;
      set(panel.hidden);
    });
    root.querySelector('[data-ldcb-close]').addEventListener('click', function () { set(false); });
    document.addEventListener('mousedown', function (e) {
      if (byButton && !panel.hidden && !root.contains(e.target)) set(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) set(false);
    });

    if (root.hasAttribute('data-ldcb-auto') && siteLoaded()) {
      setTimeout(function () { if (panel.hidden) set(true); }, 800);
    }
  }

  function start() {
    document.querySelectorAll('[data-ldcb]').forEach(init);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
