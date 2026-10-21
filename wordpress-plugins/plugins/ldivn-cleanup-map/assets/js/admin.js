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

  // --- A Google Maps link: the pin goes where it points ------------------------------------
  // Coordinates read from the link itself; a short link (maps.app.goo.gl) is opened by
  // the site first (includes/rest.php). A link to a place without them: a search of its name.
  var gmaps = box.querySelector('[name="ldm[gmaps]"]');
  var gmapsBtn = box.querySelector('.ldm-admin-gmaps button');
  var gsay = function (text) { box.querySelector('.ldm-admin-gstatus').textContent = text || ''; };

  function coordsIn(link) {
    var text = link;
    try { text = decodeURIComponent(link); } catch (e) { /* a stray %: as it is */ }
    var n = '(-?\\d{1,3}(?:\\.\\d+)?)';
    var patterns = [
      new RegExp('!3d' + n + '!4d' + n),
      new RegExp('[?&](?:q|query|ll|sll|destination|daddr|center)=(?:loc:)?' + n + ',\\s*\\+?' + n),
      new RegExp('@' + n + ',' + n),
      new RegExp('/(?:search|place|dir)/' + n + ',\\s*\\+?' + n)
    ];
    for (var i = 0; i < patterns.length; i++) {
      var m = patterns[i].exec(text);
      if (m && Math.abs(+m[1]) <= 90 && Math.abs(+m[2]) <= 180) return [+m[1], +m[2]];
    }
    return null;
  }

  function useLink() {
    var link = gmaps.value.trim();
    if (!link) return;
    if (!/^https?:\/\/([a-z0-9-]+\.)*(goo\.gl|google\.[a-z.]+|g\.co)\//i.test(link)) {
      gsay('Đây không phải link Google Maps.');
      return;
    }
    var at = coordsIn(link);
    if (at) {
      gsay('Đã đặt ghim theo link.');
      place(at[0], at[1], { fly: true, fill: true });
      return;
    }
    gsay('Đang mở link…');
    fetch(url(CFG.gmaps, { url: link }), { headers: { 'X-WP-Nonce': CFG.nonce || '' }, credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d && d.lat !== null && d.lng !== null && d.lat !== undefined) {
          gsay('Đã đặt ghim theo link.');
          place(d.lat, d.lng, { fly: true, fill: true });
        } else if (d && d.name) {
          gsay('Link không có toạ độ: tìm theo tên "' + d.name + '".');
          search.value = d.name;
          runSearch();
        } else {
          gsay('Không đọc được vị trí trong link này. Mở link, bấm chuột phải lên chỗ đó trên Google Maps để chép toạ độ, dán vào ô Vĩ độ / Kinh độ.');
        }
      })
      .catch(function () { gsay('Không mở được link lúc này, thử lại sau.'); });
  }

  gmapsBtn.addEventListener('click', useLink);
  gmaps.addEventListener('change', useLink);
  gmaps.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); useLink(); }
  });

  // The box may start collapsed or be resized: keep the map's tiles in step.
  setTimeout(function () { map.invalidateSize(); }, 200);
  if (window.ResizeObserver) new ResizeObserver(function () { map.invalidateSize(); }).observe(el);
})();
