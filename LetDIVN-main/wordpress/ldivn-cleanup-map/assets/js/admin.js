/**
 * The spot's edit screen: a small map to pin the place. A search or a click
 * sets the pin, the pin can be dragged, and the lat/lng boxes follow it (and
 * the other way round). An empty "Địa điểm" / "Tỉnh" is filled from the address.
 */
(function () {
  'use strict';

  var box = document.querySelector('.ldm-admin');
  var CFG = window.LDM_ADMIN || {};
  if (!box || !window.L) return;

  var el = box.querySelector('.ldm-admin-map');
  var lat = box.querySelector('[name="ldm[lat]"]');
  var lng = box.querySelector('[name="ldm[lng]"]');
  var loc = box.querySelector('[name="ldm[location]"]');
  var city = box.querySelector('[name="ldm[city]"]');
  var search = box.querySelector('.ldm-admin-search input');
  var searchBtn = box.querySelector('.ldm-admin-search button');
  var status = box.querySelector('.ldm-admin-status');

  var num = function (input) { var v = parseFloat(String(input.value).replace(',', '.')); return isNaN(v) ? null : v; };
  var has = num(lat) !== null && num(lng) !== null;

  var map = L.map(el, { scrollWheelZoom: false }).setView(has ? [num(lat), num(lng)] : [16.0544, 108.0], has ? 15 : 5);
  L.tileLayer('https://{s}.google.com/vt/lyrs=m&hl=vi&x={x}&y={y}&z={z}', { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] }).addTo(map);
  map.on('focus', function () { map.scrollWheelZoom.enable(); });
  map.on('blur', function () { map.scrollWheelZoom.disable(); });

  var icon = L.icon({ iconUrl: CFG.pin, iconSize: [24, 42], iconAnchor: [12, 42] });
  var marker = null;

  function url(base, params) {
    return base + (base.indexOf('?') >= 0 ? '&' : '?') + new URLSearchParams(params).toString();
  }

  function say(text) { status.textContent = text || ''; }

  function fillFromAddress(la, ln) {
    if (loc.value.trim() && city.value.trim()) return;
    fetch(url(CFG.reverse, { lat: la, lon: ln, zoom: 18 }))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (nom) {
        if (!nom) return;
        var a = nom.address || {};
        if (!loc.value.trim() && nom.display_name) {
          loc.value = nom.display_name.split(',').slice(0, 3).map(function (s) { return s.trim(); }).join(', ');
        }
        var province = a.state || a.city || a.province || '';
        if (!city.value.trim() && province) city.value = province.replace(/^(Thành phố|Tỉnh|City of)\s+/i, '');
      })
      .catch(function () {});
  }

  function place(la, ln, opts) {
    opts = opts || {};
    if (opts.setInputs !== false) {
      lat.value = la.toFixed(6);
      lng.value = ln.toFixed(6);
    }
    if (!marker) {
      marker = L.marker([la, ln], { icon: icon, draggable: true }).addTo(map);
      marker.on('dragend', function () {
        var p = marker.getLatLng();
        place(p.lat, p.lng, { fill: true });
      });
    } else {
      marker.setLatLng([la, ln]);
    }
    if (opts.fly) map.setView([la, ln], Math.max(map.getZoom(), 15));
    if (opts.fill) fillFromAddress(la, ln);
  }

  if (has) place(num(lat), num(lng), { setInputs: false });

  map.on('click', function (e) { place(e.latlng.lat, e.latlng.lng, { fill: true }); });

  [lat, lng].forEach(function (input) {
    input.addEventListener('change', function () {
      var la = num(lat), ln = num(lng);
      if (la !== null && ln !== null) place(la, ln, { setInputs: false, fly: true });
    });
  });

  function runSearch() {
    var q = search.value.trim();
    if (!q) return;
    say('Đang tìm…');
    fetch(url(CFG.search, { q: q, limit: 1 }))
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (data) {
        var hit = data && data[0];
        if (!hit) { say('Không tìm thấy. Thử tên khác, hoặc bấm thẳng lên bản đồ.'); return; }
        say('');
        var la = parseFloat(hit.lat), ln = parseFloat(hit.lon);
        place(la, ln, { fly: true });
        if (hit.boundingbox) {
          var b = hit.boundingbox.map(parseFloat);
          map.fitBounds([[b[0], b[2]], [b[1], b[3]]], { maxZoom: 17 });
        }
        if (!loc.value.trim()) loc.value = hit.display_name.split(',').slice(0, 3).map(function (s) { return s.trim(); }).join(', ');
        fillFromAddress(la, ln);
      })
      .catch(function () { say('Không tìm được lúc này, thử lại sau.'); });
  }

  searchBtn.addEventListener('click', runSearch);
  // Enter searches instead of submitting the post.
  search.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); runSearch(); }
  });

  // The box may start collapsed or be resized: keep the map's tiles in step.
  setTimeout(function () { map.invalidateSize(); }, 200);
  if (window.ResizeObserver) new ResizeObserver(function () { map.invalidateSize(); }).observe(el);
})();
