/**
 * [ldivn_wcd_stats]: the cards go to the next year by themselves, one after the
 * other (includes/stats.php). In each, the year and the figure slide in from the
 * right as the shown ones slide out, the figure counting up from the last year's,
 * and a light sweeps across. An unseen clock sets the pace: when its animation
 * ends, the next year comes, whether the mouse is on the block or not. It waits
 * only while the block is out of view. With reduced motion (a computer or phone set
 * to show fewer animations) the year and the figure fade in place instead of sliding,
 * with no sweep (assets/css/stats.css).
 */
(function () {
  'use strict';

  var STAGGER = 120; // ms between one card sliding and the next
  var COUNT = 1100; // ms the figure takes to count up

  function init(root) {
    var cfg;
    try {
      cfg = JSON.parse(root.getAttribute('data-ldms') || '');
    } catch (e) {
      return;
    }
    var years = cfg.years || [];
    if (years.length < 2) return;

    var cards = [].slice.call(root.querySelectorAll('.ldms-card'));
    var clock = root.querySelector('.ldms-clock');
    var still = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    var current = cfg.start || 0;
    var shown = cards.map(function () { return current; }); // the year each card shows
    var pending = [];
    var frames = [];
    var seen = false;

    root.style.setProperty('--ldms-t', (cfg.interval || 4000) + 'ms');

    // The hidden one of a pair gets new content and slides in; the shown one slides out.
    function swap(box, fill) {
      var layers = box.children;
      var out = box.querySelector('.is-on') || layers[0];
      var next = out === layers[0] ? layers[1] : layers[0];
      fill(next);
      out.classList.remove('is-on', 'is-in');
      next.classList.remove('is-out');
      out.classList.remove('is-out');
      void box.offsetWidth; // start the animations over
      out.classList.add('is-out');
      next.classList.add('is-in');
      next.classList.add('is-on');
      out.setAttribute('aria-hidden', 'true');
      next.removeAttribute('aria-hidden');
      return next;
    }

    // A figure on its way from one year's to the next, in the unit of the next.
    function draft(c, n, unit) {
      if (cfg.keys[c] === 'waste' && unit !== 'kg' && unit !== '') {
        return (n / 1000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      }
      return Math.round(n).toLocaleString('en-US');
    }

    function count(c, el, from, to) {
      cancelAnimationFrame(frames[c]);
      var a = cfg.raw[c][from];
      var b = cfg.raw[c][to];
      var text = cfg.cards[c][to];
      if (a == null || b == null || a === b) return;
      var begin = null;
      el.textContent = draft(c, a, text[1]);
      function step(t) {
        if (begin === null) begin = t + 250; // once the figure has come into sight
        var p = Math.max(0, Math.min(1, (t - begin) / COUNT));
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = p < 1 ? draft(c, a + (b - a) * eased, text[1]) : text[0];
        if (p < 1) frames[c] = requestAnimationFrame(step);
      }
      frames[c] = requestAnimationFrame(step);
    }

    // Card c to year i.
    function slide(c, i) {
      var card = cards[c];
      var from = shown[c];
      if (from === i) return;
      shown[c] = i;
      swap(card.querySelector('.ldms-year'), function (el) {
        el.textContent = years[i];
      });
      var figure = cfg.cards[c][i];
      var layer = swap(card.querySelector('.ldms-value'), function (el) {
        el.querySelector('.ldms-num').textContent = figure[0];
        el.querySelector('.ldms-unit').textContent = figure[1];
      });
      card.querySelectorAll('.ldms-b').forEach(function (b, j) {
        b.classList.toggle('is-on', j === i);
      });
      if (!still) {
        card.classList.remove('is-sweep');
        void card.offsetWidth;
        card.classList.add('is-sweep');
      }
      count(c, layer.querySelector('.ldms-num'), from, i);
    }

    function show(i) {
      if (i === current) return;
      current = i;
      cards.forEach(function (card, c) {
        clearTimeout(pending[c]);
        pending[c] = setTimeout(function () { slide(c, i); }, c * STAGGER);
      });
      restart();
    }

    // The clock for this year, from zero.
    function restart() {
      if (!clock) return;
      clock.classList.remove('is-run');
      void clock.offsetWidth; // start the animation over
      clock.classList.add('is-run');
    }

    function sync() {
      root.classList.toggle('is-paused', !seen);
    }

    root.addEventListener('animationend', function (e) {
      if (e.target === clock) show((current + 1) % years.length);
    });

    root.addEventListener('click', function (e) {
      var t = e.target;
      if (!t.closest) return;
      var pick = t.closest('.ldms-b');
      if (pick) {
        show(+pick.getAttribute('data-i'));
      } else if (t.closest('.ldms-card')) {
        show((current + 1) % years.length);
      }
    });

    // Starts when scrolled into view, so the first year is seen first.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        seen = entries[entries.length - 1].isIntersecting;
        sync();
      }, { threshold: 0.35 }).observe(root);
    } else {
      seen = true;
    }

    sync();
    restart();
  }

  function start() {
    document.querySelectorAll('.ldms:not(.ldms--ready)').forEach(function (root) {
      root.classList.add('ldms--ready');
      init(root);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
