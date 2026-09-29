/**
 * The contact bubble (includes/bubble.php): the round button opens and closes
 * the window; Escape closes it, and so does a click outside it when it was
 * opened by the button. With data-ldcb-auto the window opens by itself on
 * every page, until the visitor closes it: then not again during that visit.
 */
(function () {
  'use strict';

  var CLOSED = 'ldcb-closed';

  function remember(closed) {
    try {
      if (closed) sessionStorage.setItem(CLOSED, '1');
      else sessionStorage.removeItem(CLOSED);
    } catch (err) { /* private mode: it just opens again on the next page */ }
  }

  function wasClosed() {
    try { return sessionStorage.getItem(CLOSED) === '1'; } catch (err) { return false; }
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

    function close() {
      set(false);
      remember(true);
    }

    button.addEventListener('click', function () {
      if (panel.hidden) {
        byButton = true;
        set(true);
        remember(false);
      } else {
        close();
      }
    });
    root.querySelector('[data-ldcb-close]').addEventListener('click', close);
    document.addEventListener('mousedown', function (e) {
      if (byButton && !panel.hidden && !root.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) close();
    });

    if (root.hasAttribute('data-ldcb-auto') && !wasClosed()) {
      setTimeout(function () { if (panel.hidden) set(true); }, 800);
    }
  }

  function start() {
    document.querySelectorAll('[data-ldcb]').forEach(init);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
