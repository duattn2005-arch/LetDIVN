/**
 * The newest-posts bar (includes/latest.php): the titles run at the same speed
 * however long they are, and fill the bar when they are few and short.
 */
(function () {
  'use strict';

  var SPEED = 45; // pixels a second

  function init(bar) {
    var view = bar.querySelector('.ldlp-view');
    var track = bar.querySelector('.ldlp-track');
    var runs = track.querySelectorAll('.ldlp-run');
    if (!view || runs.length !== 2) return;

    // Both runs stay alike: the second is what slides in behind the first.
    var titles = Array.prototype.slice.call(runs[1].children);
    for (var i = 0; i < 10 && runs[0].offsetWidth < view.offsetWidth; i++) {
      titles.forEach(function (a) {
        var again = a.cloneNode(true);
        again.setAttribute('aria-hidden', 'true');
        runs[0].appendChild(again);
        runs[1].appendChild(a.cloneNode(true));
      });
    }
    track.style.setProperty('--ldlp-time', Math.max(15, Math.round(runs[0].offsetWidth / SPEED)) + 's');
  }

  function start() {
    var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    ready.then(function () { document.querySelectorAll('.ldlp').forEach(init); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
