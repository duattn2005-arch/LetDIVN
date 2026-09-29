/**
 * The header's dropdowns get their item's name on top ("PROJECTS"), as in the
 * Let's Do It Vietnam header (styles: assets/css/menu.css). Only the menus
 * holding the map's item or the Volunteer button.
 */
(function () {
  'use strict';

  function start() {
    document.querySelectorAll('.elementor-location-header .elementor-nav-menu--main').forEach(function (nav) {
      if (!nav.querySelector('.ldivn-menu-map, .ldivn-menu-volunteer')) return;
      nav.querySelectorAll('.sub-menu').forEach(function (list) {
        var link = list.parentNode.querySelector(':scope > a');
        if (!link || list.querySelector(':scope > .ldivn-sub-head')) return;
        var head = document.createElement('li');
        head.className = 'ldivn-sub-head';
        head.setAttribute('aria-hidden', 'true');
        head.textContent = link.firstChild && link.firstChild.nodeType === 3 ? link.firstChild.nodeValue.trim() : link.textContent.trim();
        list.insertBefore(head, list.firstChild);
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
