/**
 * LDIVN Cleanup Map: draws the map into every [ldivn_cleanup_map] box.
 * Data comes from window.LDIVN_MAP (events, local team pins, search URLs).
 */
(function () {
  'use strict';

  var CFG = window.LDIVN_MAP || {};
  var EVENTS = CFG.events || [];
  var TEAMS = CFG.teams || [];
  var REST = CFG.rest || {};

  // --- Vietnam's provinces: the 63 of before 1/7/2025 and the 34 since, each at its centre ---

  var OLD_PROVINCES = [
    ['Hanoi', 21.0285, 105.8542], ['Ha Giang', 22.8233, 104.9836], ['Cao Bang', 22.6657, 106.257],
    ['Bac Kan', 22.147, 105.8348], ['Tuyen Quang', 21.8236, 105.214], ['Lao Cai', 22.4856, 103.9707],
    ['Dien Bien', 21.386, 103.023], ['Lai Chau', 22.3964, 103.4582], ['Son La', 21.3256, 103.9188],
    ['Yen Bai', 21.7229, 104.9113], ['Hoa Binh', 20.8171, 105.3376], ['Thai Nguyen', 21.5942, 105.848],
    ['Lang Son', 21.8537, 106.7615], ['Quang Ninh', 20.9517, 107.08], ['Bac Giang', 21.2731, 106.1946],
    ['Phu Tho', 21.3227, 105.402], ['Vinh Phuc', 21.3089, 105.6049], ['Bac Ninh', 21.1861, 106.0763],
    ['Hai Duong', 20.9373, 106.3146], ['Hai Phong', 20.8449, 106.6881], ['Hung Yen', 20.6464, 106.0511],
    ['Thai Binh', 20.4463, 106.3366], ['Ha Nam', 20.5411, 105.9139], ['Nam Dinh', 20.4388, 106.1621],
    ['Ninh Binh', 20.2506, 105.9745], ['Thanh Hoa', 19.8075, 105.7764], ['Nghe An', 18.6796, 105.6813],
    ['Ha Tinh', 18.3428, 105.9057], ['Quang Binh', 17.4689, 106.6223], ['Quang Tri', 16.8163, 107.1003],
    ['Thua Thien Hue', 16.4637, 107.5909], ['Da Nang', 16.0544, 108.2022], ['Quang Nam', 15.5736, 108.474],
    ['Quang Ngai', 15.1205, 108.7923], ['Binh Dinh', 13.7765, 109.2237], ['Phu Yen', 13.0955, 109.3209],
    ['Khanh Hoa', 12.2388, 109.1967], ['Ninh Thuan', 11.5646, 108.9886], ['Binh Thuan', 10.9289, 108.1021],
    ['Kon Tum', 14.3498, 108.0005], ['Gia Lai', 13.9833, 108.0], ['Dak Lak', 12.6667, 108.05],
    ['Dak Nong', 12.0042, 107.6907], ['Lam Dong', 11.9404, 108.4583], ['Binh Phuoc', 11.5349, 106.8832],
    ['Tay Ninh', 11.31, 106.0983], ['Binh Duong', 10.9804, 106.6519], ['Dong Nai', 10.9574, 106.8426],
    ['Ba Ria - Vung Tau', 10.4963, 107.1685], ['Ho Chi Minh City', 10.7769, 106.7009], ['Long An', 10.5359, 106.4137],
    ['Tien Giang', 10.36, 106.36], ['Ben Tre', 10.2434, 106.3756], ['Tra Vinh', 9.9347, 106.3453],
    ['Vinh Long', 10.2537, 105.9722], ['Dong Thap', 10.4604, 105.6329], ['An Giang', 10.3864, 105.4352],
    ['Kien Giang', 10.0125, 105.0809], ['Can Tho', 10.0452, 105.7469], ['Hau Giang', 9.7845, 105.4701],
    ['Soc Trang', 9.6025, 105.9739], ['Bac Lieu', 9.2941, 105.7278], ['Ca Mau', 9.1769, 105.1524]
  ].map(function (p) { return { name: p[0], lat: p[1], lng: p[2] }; });

  var NEW_PROVINCES = [
    ['Hanoi', 21.0285, 105.8542], ['Hue', 16.4637, 107.5909, ['Thua Thien Hue']],
    ['Lai Chau', 22.3964, 103.4582], ['Dien Bien', 21.386, 103.023], ['Son La', 21.3256, 103.9188],
    ['Lang Son', 21.8537, 106.7615], ['Quang Ninh', 20.9517, 107.08], ['Thanh Hoa', 19.8075, 105.7764],
    ['Nghe An', 18.6796, 105.6813], ['Ha Tinh', 18.3428, 105.9057], ['Cao Bang', 22.6657, 106.257],
    ['Tuyen Quang', 21.8236, 105.214, ['Tuyen Quang', 'Ha Giang']],
    ['Lao Cai', 21.7229, 104.9113, ['Lao Cai', 'Yen Bai']],
    ['Thai Nguyen', 21.5942, 105.848, ['Thai Nguyen', 'Bac Kan']],
    ['Phu Tho', 21.3227, 105.402, ['Phu Tho', 'Vinh Phuc', 'Hoa Binh']],
    ['Bac Ninh', 21.2731, 106.1946, ['Bac Ninh', 'Bac Giang']],
    ['Hung Yen', 20.6464, 106.0511, ['Hung Yen', 'Thai Binh']],
    ['Hai Phong', 20.8449, 106.6881, ['Hai Phong', 'Hai Duong']],
    ['Ninh Binh', 20.2506, 105.9745, ['Ninh Binh', 'Ha Nam', 'Nam Dinh']],
    ['Quang Tri', 17.4689, 106.6223, ['Quang Tri', 'Quang Binh']],
    ['Da Nang', 16.0544, 108.2022, ['Da Nang', 'Quang Nam']],
    ['Quang Ngai', 15.1205, 108.7923, ['Quang Ngai', 'Kon Tum']],
    ['Gia Lai', 13.7765, 109.2237, ['Gia Lai', 'Binh Dinh']],
    ['Khanh Hoa', 12.2388, 109.1967, ['Khanh Hoa', 'Ninh Thuan']],
    ['Lam Dong', 11.9404, 108.4583, ['Lam Dong', 'Dak Nong', 'Binh Thuan']],
    ['Dak Lak', 12.6667, 108.05, ['Dak Lak', 'Phu Yen']],
    ['Ho Chi Minh City', 10.7769, 106.7009, ['Ho Chi Minh City', 'Binh Duong', 'Ba Ria - Vung Tau']],
    ['Dong Nai', 10.9574, 106.8426, ['Dong Nai', 'Binh Phuoc']],
    ['Tay Ninh', 10.5359, 106.4137, ['Tay Ninh', 'Long An']],
    ['Can Tho', 10.0452, 105.7469, ['Can Tho', 'Soc Trang', 'Hau Giang']],
    ['Vinh Long', 10.2537, 105.9722, ['Vinh Long', 'Ben Tre', 'Tra Vinh']],
    ['Dong Thap', 10.36, 106.36, ['Dong Thap', 'Tien Giang']],
    ['Ca Mau', 9.1769, 105.1524, ['Ca Mau', 'Bac Lieu']],
    ['An Giang', 10.0125, 105.0809, ['An Giang', 'Kien Giang']]
  ].map(function (p) { return { name: p[0], lat: p[1], lng: p[2], from: p[3] }; });

  var byName = function (a, b) { return a.name.localeCompare(b.name, 'en'); };
  var OLD_SORTED = OLD_PROVINCES.slice().sort(byName);
  var NEW_SORTED = NEW_PROVINCES.slice().sort(byName);

  /** The new province an old one became part of. */
  function newProvinceOf(oldName) {
    var p = NEW_PROVINCES.find(function (n) { return (n.from || [n.name]).indexOf(oldName) >= 0; });
    return p ? p.name : undefined;
  }

  // --- Helpers ---------------------------------------------------------------------------

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /** A place name boiled down for matching: no accents, case, spaces, "TP." or "City". */
  function placeKey(s) {
    return String(s || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/gi, 'd')
      .toLowerCase()
      .replace(/^(tp\.?|thanh pho)\s*/, '')
      .replace(/\s*city\b/, '')
      .replace(/[^a-z]/g, '');
  }

  function withParams(base, params) {
    return base + (base.indexOf('?') >= 0 ? '&' : '?') + new URLSearchParams(params).toString();
  }

  function api(kind, params, signal) {
    if (!REST[kind]) return Promise.reject(new Error('No URL for ' + kind));
    return fetch(withParams(REST[kind], params), { signal: signal }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function svg(inner, extra) {
    return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ' + (extra || '') + '>' + inner + '</svg>';
  }

  var PIN_PATH = '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>';
  var ICON = {
    pin: svg(PIN_PATH),
    pinFilled: svg(PIN_PATH, 'class="ldm-prov-pin"'),
    search: svg('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
    x: svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
    nav: svg('<polygon points="3 11 22 2 13 21 11 13 3 11"/>'),
    loader: svg('<path d="M21 12a9 9 0 1 1-6.219-8.56"/>'),
    chevron: svg('<path d="m6 9 6 6 6-6"/>'),
    zoomIn: svg('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6"/><path d="M8 11h6"/>'),
    zoomOut: svg('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M8 11h6"/>'),
    compass: svg('<path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/><circle cx="12" cy="12" r="10"/>'),
    school: svg('<path d="M14 22v-4a2 2 0 1 0-4 0v4"/><path d="m18 10 3.447 1.724a1 1 0 0 1 .553.894V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7.382a1 1 0 0 1 .553-.894L6 10"/><path d="M18 5v17"/><path d="m4 6 7.106-3.553a2 2 0 0 1 1.788 0L20 6"/><path d="M6 5v17"/><circle cx="12" cy="9" r="2"/>'),
    building: svg('<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>'),
    plus: svg('<path d="M12 4v16m8-8H4"/>')
  };

  var VIETNAM = { lat: 16.0544, lng: 108.0, zoom: 6 };

  var LAYERS = {
    streets: ['https://{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}', { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] }],
    satellite: ['https://{s}.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}', { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] }],
    terrain: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }]
  };

  var BOUNDARY_STYLE = { color: '#e53e3e', weight: 3.5, dashArray: '6, 6', fillColor: '#e53e3e', fillOpacity: 0.05 };

  // --- Events: where each is, which local team and which provinces it belongs to -------------

  function teamByCity(city) {
    var key = placeKey(city);
    if (!key) return undefined;
    return TEAMS.find(function (t) {
      return [t.name].concat(t.aliases || []).some(function (n) { var k = placeKey(n); return k && key.indexOf(k) >= 0; });
    });
  }

  function oldProvinceByCity(city) {
    var key = placeKey(city);
    return key ? OLD_PROVINCES.find(function (p) { return key.indexOf(placeKey(p.name)) >= 0; }) : undefined;
  }

  function nearest(list, lat, lng) {
    var at = L.latLng(lat, lng);
    return list.reduce(function (best, p) { return at.distanceTo([p.lat, p.lng]) < at.distanceTo([best.lat, best.lng]) ? p : best; });
  }

  function prepareEvents() {
    var now = new Date();
    return EVENTS.map(function (e) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date || '')) return null;
      if (!CFG.showPast && new Date(e.date + 'T23:59:59') < now) return null;
      var hasSpot = typeof e.lat === 'number' && typeof e.lng === 'number' && (e.lat || e.lng);
      var team = teamByCity(e.city);
      if (!team && hasSpot) {
        team = TEAMS.find(function (t) { return L.latLng(t.lat, t.lng).distanceTo([e.lat, e.lng]) < 25000; });
      }
      var old = oldProvinceByCity(e.city);
      var spot = hasSpot ? { lat: e.lat, lng: e.lng } : team ? { lat: team.lat, lng: team.lng } : old ? { lat: old.lat, lng: old.lng } : null;
      if (!spot) return null;
      old = old || nearest(OLD_PROVINCES, spot.lat, spot.lng);
      return Object.assign({}, e, {
        year: Number(e.date.slice(0, 4)),
        spot: spot,
        team: team ? team.name : null,
        oldProvince: old.name,
        newProvince: newProvinceOf(old.name)
      });
    }).filter(Boolean).sort(function (a, b) { return a.date.localeCompare(b.date); });
  }

  // --- Markers -----------------------------------------------------------------------------

  function teamIcon() {
    return L.divIcon({
      className: 'ldm-pin',
      html: '<img src="' + esc(CFG.pin) + '" alt="">',
      iconSize: [24, 42], iconAnchor: [12, 42], tooltipAnchor: [0, -36]
    });
  }

  // A place with a campaign on: the pin bounces, over a pink ripple at its foot.
  function campaignIcon(pending) {
    return L.divIcon({
      className: 'ldm-pin ldm-pin--live',
      html: '<span class="ldm-ripple"></span><img src="' + esc(CFG.pin) + '" alt="">' +
        (pending ? '<span class="ldm-pending">Pending review</span>' : ''),
      iconSize: [24, 42], iconAnchor: [12, 42], popupAnchor: [0, -38], tooltipAnchor: [0, -36]
    });
  }

  function circleIcon(kind, inner, label) {
    return L.divIcon({
      className: 'ldm-circle-pin ldm-circle-pin--' + kind,
      html: '<div class="ldm-circle-bounce"><div class="ldm-circle">' + inner + '</div>' +
        (label ? '<div class="ldm-circle-label">' + label + '</div>' : '') + '</div>',
      iconSize: [48, 48], iconAnchor: [24, 24], popupAnchor: [0, -24]
    });
  }

  function eventPopup(e) {
    var buttons = (e.detailsUrl ? '<a class="ldm-pop-btn ldm-pop-btn--dark" href="' + esc(e.detailsUrl) + '">Details</a>' : '') +
      (e.registerUrl ? '<a class="ldm-pop-btn ldm-pop-btn--pink" href="' + esc(e.registerUrl) + '">Register</a>' : '');
    var where = [e.location, e.city ? '(' + e.city + ')' : ''].filter(Boolean).join(' ');
    return '<div class="ldm-pop">' +
      (e.image || e.pending
        ? '<div class="ldm-pop-img">' + (e.image ? '<img src="' + esc(e.image) + '" alt="">' : '') +
          (e.pending ? '<span class="ldm-pop-badge">Pending review</span>' : '') + '</div>'
        : '') +
      '<h4 class="ldm-pop-title">' + esc(e.title) + '</h4>' +
      '<div class="ldm-pop-meta">' +
        (where ? '<div><span>📍</span><span class="ldm-trunc">' + esc(where) + '</span></div>' : '') +
        '<div><span>📅</span><span>' + esc(e.date) + (e.time ? ' • ' + esc(e.time) : '') + '</span></div>' +
        '<div class="ldm-pop-count"><span>👥</span><span>' + (Number(e.registered) || 0) + ' people registered</span></div>' +
      '</div>' +
      (buttons ? '<div class="ldm-pop-btns">' + buttons + '</div>' : '') +
    '</div>';
  }

  function placePopup(kind, heading, name, address, lat, lng) {
    return '<div class="ldm-pop ldm-pop--place">' +
      '<div class="ldm-pop-kicker ldm-pop-kicker--' + kind + '"><span>📍</span><span>' + heading + '</span></div>' +
      '<div class="ldm-pop-title">' + esc(name) + '</div>' +
      (address ? '<div class="ldm-pop-address">' + esc(address) + '</div>' : '') +
      '<div class="ldm-pop-coords">Coordinates: ' + lat.toFixed(5) + ', ' + lng.toFixed(5) + '</div>' +
    '</div>';
  }

  // --- Search --------------------------------------------------------------------------------

  // The Vietnamese abbreviations people type, spelled out for the geocoders.
  function normalizeQuery(q) {
    return q
      .replace(/\bthpt\b/gi, 'Trường THPT')
      .replace(/\bthcs\b/gi, 'Trường THCS')
      .replace(/\btiểu học\b/gi, 'Trường Tiểu học')
      .replace(/\bđh\b/gi, 'Đại học')
      .replace(/\bbv\b/gi, 'Bệnh viện')
      .replace(/\bubnd\b/gi, 'Ủy ban nhân dân')
      .replace(/\bkđt\b/gi, 'Khu đô thị')
      .replace(/\btp\b/gi, 'Thành phố')
      .trim() || q.trim();
  }

  function fromNominatim(item) {
    var a = item.address || {};
    var name = item.name || a.school || a.hospital || a.building || a.amenity || a.tourism || a.road ||
      a.suburb || a.quarter || a.town || a.city || String(item.display_name || '').split(',')[0];
    var sub = String(item.display_name || '').replace(name + ', ', '').replace(name, '');
    return {
      id: String(item.place_id), name: name, sub: sub || item.display_name,
      lat: parseFloat(item.lat), lng: parseFloat(item.lon), geojson: item.geojson, type: item.type || item.class
    };
  }

  function fromPhoton(feat) {
    var p = feat.properties || {};
    var c = feat.geometry.coordinates;
    return {
      id: 'photon-' + (p.osm_id || Math.random()),
      name: p.name || p.street || p.city || 'Location',
      sub: [p.street, p.district, p.city, p.country].filter(Boolean).join(', ') || 'Vietnam',
      lat: c[1], lng: c[0], type: p.osm_value
    };
  }

  // --- One map ------------------------------------------------------------------------------

  function shell(o, years) {
    var layerBtn = function (key, label, title) {
      return '<button type="button" data-layer="' + key + '" title="' + title + '">' + label + '</button>';
    };
    return '' +
      '<div class="ldm-top">' +
        '<div class="ldm-brand">' +
          '<span class="ldm-brand-icon">' + ICON.pin + '</span>' +
          '<div class="ldm-brand-text">' +
            '<h2 class="ldm-title">' + esc(o.title) + '</h2>' +
            (o.subtitle ? '<p class="ldm-sub">' + esc(o.subtitle) + '</p>' : '') +
          '</div>' +
        '</div>' +
        '<label class="ldm-year"><span class="ldm-sr">Year</span><select>' +
          years.map(function (y) { return '<option value="' + y + '"' + (y === o.year ? ' selected' : '') + '>' + y + '</option>'; }).join('') +
        '</select>' + ICON.chevron + '</label>' +
        '<div class="ldm-mtabs">' +
          '<button type="button" data-tab="map">🗺️ Map</button>' +
          '<button type="button" data-tab="list">📋 Spot List (<span class="ldm-count"></span>)</button>' +
        '</div>' +
      '</div>' +
      '<div class="ldm-body">' +
        '<aside class="ldm-side">' +
          '<div class="ldm-found" hidden>' +
            '<div class="ldm-found-head"><span>Map Location</span><button type="button" class="ldm-found-clear">Clear boundary</button></div>' +
            '<div class="ldm-found-card">' +
              '<div class="ldm-found-label"><i></i><span>LOCATING &amp; DRAWING BOUNDARY:</span></div>' +
              '<div class="ldm-found-name"></div>' +
              '<div class="ldm-found-hint">A red dashed boundary has been drawn on the map.</div>' +
            '</div>' +
          '</div>' +
          '<div class="ldm-side-scroll">' +
            '<div class="ldm-scheme" role="tablist">' +
              '<button type="button" role="tab" data-scheme="old">Old (' + OLD_PROVINCES.length + ')</button>' +
              '<button type="button" role="tab" data-scheme="new">New (' + NEW_PROVINCES.length + ')</button>' +
            '</div>' +
            '<div class="ldm-provs"></div>' +
          '</div>' +
        '</aside>' +
        '<div class="ldm-stage">' +
          '<div class="ldm-canvas"></div>' +
          '<div class="ldm-search">' +
            '<div class="ldm-search-box">' +
              '<form class="ldm-search-form">' + ICON.search +
                '<input type="text" autocomplete="off" aria-label="Search a location" placeholder="Search a location (e.g. Giao Thuy High School, Son Tra Peninsula...)">' +
              '</form>' +
              '<span class="ldm-spinner" hidden>' + ICON.loader + '</span>' +
              '<button type="button" class="ldm-x" title="Clear" hidden>' + ICON.x + '</button>' +
              '<button type="button" class="ldm-go" title="Search location">' + ICON.nav + '</button>' +
            '</div>' +
            '<div class="ldm-sugs" hidden></div>' +
          '</div>' +
          '<div class="ldm-ctrls">' +
            '<div class="ldm-layers">' +
              layerBtn('streets', 'Streets', 'Street map') +
              layerBtn('satellite', 'Satellite', 'Satellite view with street names') +
              layerBtn('terrain', 'Terrain', 'Topographic terrain map') +
            '</div>' +
            '<div class="ldm-zoom">' +
              '<button type="button" data-zoom="in" title="Zoom in">' + ICON.zoomIn + '</button>' +
              '<button type="button" data-zoom="out" title="Zoom out">' + ICON.zoomOut + '</button>' +
              '<span class="ldm-zoom-sep"></span>' +
              '<button type="button" data-zoom="home" title="Vietnam overview">' + ICON.compass + '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function init(root) {
    var opts = {};
    try { opts = JSON.parse(root.getAttribute('data-ldm') || '{}'); } catch (err) { /* defaults below */ }
    var thisYear = new Date().getFullYear();
    var state = {
      year: Number(opts.year) || thisYear,
      scheme: opts.scheme === 'old' ? 'old' : 'new',
      layer: 'streets',
      tab: 'map'
    };

    var events = prepareEvents();
    var years = [];
    var firstYear = Math.min(2024, thisYear, state.year);
    var lastYear = Math.max(2060, thisYear + 5, state.year);
    events.forEach(function (e) { firstYear = Math.min(firstYear, e.year); lastYear = Math.max(lastYear, e.year); });
    for (var y = firstYear; y <= lastYear; y++) years.push(y);

    root.innerHTML = shell({ title: opts.title || 'Nationwide Cleanup Spot Map', subtitle: opts.subtitle, year: state.year }, years);
    root.classList.add('ldm--ready');

    var $ = function (sel) { return root.querySelector(sel); };
    var stage = $('.ldm-stage');
    var provsEl = $('.ldm-provs');
    var input = $('.ldm-search-form input');
    var sugsEl = $('.ldm-sugs');
    var spinner = $('.ldm-spinner');
    var clearBtn = $('.ldm-x');
    var foundEl = $('.ldm-found');

    // --- The map ---
    var map = L.map($('.ldm-canvas'), {
      center: [VIETNAM.lat, VIETNAM.lng],
      zoom: VIETNAM.zoom,
      zoomControl: false,
      attributionControl: false
    });
    var tiles = L.tileLayer(LAYERS.streets[0], LAYERS.streets[1]).addTo(map);

    // Popups open in a pane beside the map, above the search card and the
    // controls drawn over it, and shift with the map's own pane as it moves.
    var popupPane = map.createPane('ldmTopPopup', stage);
    var mapPane = map.getPane('mapPane');
    var followMap = function () { popupPane.style.transform = mapPane.style.transform; };
    followMap();
    map.on('move zoom viewreset resize', followMap);
    var POPUP = { pane: 'ldmTopPopup', maxWidth: 300 };

    var pinsLayer = null;
    var teamMarkers = new Map();
    var campaignMarkers = new Map(); // event id -> the pin that opens it
    var campaignOfOld = new Map();
    var campaignOfNew = new Map();
    var boundary = null;
    var placeMarker = null;

    function flyMapTo(lat, lng, zoom, onArrival) {
      setTab('map');
      setTimeout(function () {
        map.invalidateSize();
        map.flyTo([lat, lng], zoom, { duration: 1.2 });
        if (onArrival) map.once('moveend', onArrival);
      }, 50);
    }

    // The pins of the chosen year. A local team's province with a campaign on
    // gets the bouncing pin, opening the soonest campaign there; a quiet one
    // flies there when clicked. A campaign outside the local teams' provinces
    // gets a bouncing pin of its own.
    function renderPins() {
      if (pinsLayer) pinsLayer.remove();
      pinsLayer = L.layerGroup().addTo(map);
      teamMarkers.clear();
      campaignMarkers.clear();
      campaignOfOld.clear();
      campaignOfNew.clear();

      var yearEvents = events.filter(function (e) { return e.year === state.year; });
      var ofTeam = new Map();
      var elsewhere = [];
      yearEvents.forEach(function (e) {
        if (!e.team) elsewhere.push(e);
        else if (!ofTeam.has(e.team)) ofTeam.set(e.team, e);
        if (!campaignOfOld.has(e.oldProvince)) campaignOfOld.set(e.oldProvince, e);
        if (e.newProvince && !campaignOfNew.has(e.newProvince)) campaignOfNew.set(e.newProvince, e);
      });

      TEAMS.forEach(function (t) {
        var e = ofTeam.get(t.name);
        var m = L.marker([t.lat, t.lng], { icon: e ? campaignIcon(e.pending) : teamIcon(), zIndexOffset: e ? 2000 : 1000, riseOnHover: true })
          .bindTooltip(esc(t.name), { direction: 'top' })
          .addTo(pinsLayer);
        if (e) {
          m.bindPopup(eventPopup(e), POPUP);
          campaignMarkers.set(e.id, m);
        } else {
          m.on('click', function () { flyMapTo(t.lat, t.lng, 10); });
        }
        teamMarkers.set(t.name, m);
      });

      elsewhere.forEach(function (e) {
        var m = L.marker([e.spot.lat, e.spot.lng], { icon: campaignIcon(e.pending), zIndexOffset: 2000, riseOnHover: true })
          .bindTooltip(esc(e.title), { direction: 'top' })
          .bindPopup(eventPopup(e), POPUP)
          .addTo(pinsLayer);
        campaignMarkers.set(e.id, m);
      });
    }

    // Every province, old (63) or new (34), one card per row: a click flies
    // there, or opens the campaign on there (green dot).
    function renderProvinces() {
      var list = state.scheme === 'old' ? OLD_SORTED : NEW_SORTED;
      var campaigns = state.scheme === 'old' ? campaignOfOld : campaignOfNew;
      provsEl.innerHTML = list.map(function (p, i) {
        var now = newProvinceOf(p.name);
        var mapping = state.scheme === 'new' ? (p.from ? p.from.join(' + ') : '') : (now && now !== p.name ? '→ ' + now : '');
        return '<button type="button" class="ldm-prov" data-i="' + i + '"' + (mapping ? ' title="' + esc(mapping) + '"' : '') + '>' +
          ICON.pinFilled + '<span class="ldm-prov-name">' + esc(p.name) + '</span>' +
          (campaigns.has(p.name) ? '<span class="ldm-live" title="Campaign on"><i></i><b></b></span>' : '') +
        '</button>';
      }).join('');
      root.querySelectorAll('[data-scheme]').forEach(function (b) {
        var on = b.getAttribute('data-scheme') === state.scheme;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      $('.ldm-count').textContent = list.length;
    }

    provsEl.addEventListener('click', function (ev) {
      var btn = ev.target.closest('.ldm-prov');
      if (!btn) return;
      var p = (state.scheme === 'old' ? OLD_SORTED : NEW_SORTED)[Number(btn.getAttribute('data-i'))];
      var campaign = (state.scheme === 'old' ? campaignOfOld : campaignOfNew).get(p.name);
      var marker = campaign && campaignMarkers.get(campaign.id);
      if (marker) {
        var at = marker.getLatLng();
        flyMapTo(at.lat, at.lng, 10, function () { marker.openPopup(); });
      } else {
        flyMapTo(p.lat, p.lng, 9);
      }
    });

    root.querySelectorAll('[data-scheme]').forEach(function (b) {
      b.addEventListener('click', function () { state.scheme = b.getAttribute('data-scheme'); renderProvinces(); });
    });

    $('.ldm-year select').addEventListener('change', function (ev) {
      state.year = Number(ev.target.value);
      renderPins();
      renderProvinces();
    });

    // --- Mobile: map or list ---
    function setTab(tab) {
      state.tab = tab;
      root.classList.toggle('ldm--list', tab === 'list');
      root.querySelectorAll('[data-tab]').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-tab') === tab); });
      if (tab === 'map') setTimeout(function () { map.invalidateSize(); }, 200);
    }
    root.querySelectorAll('[data-tab]').forEach(function (b) {
      b.addEventListener('click', function () { setTab(b.getAttribute('data-tab')); });
    });

    // --- Layers and zoom ---
    function setLayer(key) {
      state.layer = key;
      map.removeLayer(tiles);
      tiles = L.tileLayer(LAYERS[key][0], LAYERS[key][1]).addTo(map);
      root.querySelectorAll('[data-layer]').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-layer') === key); });
    }
    root.querySelectorAll('[data-layer]').forEach(function (b) {
      b.addEventListener('click', function () { setLayer(b.getAttribute('data-layer')); });
    });
    root.querySelector('[data-layer="streets"]').classList.add('is-on');

    function clearPlace() {
      if (boundary) { map.removeLayer(boundary); boundary = null; }
      if (placeMarker) { map.removeLayer(placeMarker); placeMarker = null; }
      foundEl.hidden = true;
    }
    function resetView() {
      clearPlace();
      map.flyTo([VIETNAM.lat, VIETNAM.lng], VIETNAM.zoom, { duration: 1.2 });
    }
    root.querySelectorAll('[data-zoom]').forEach(function (b) {
      b.addEventListener('click', function () {
        var act = b.getAttribute('data-zoom');
        if (act === 'in') map.zoomIn();
        else if (act === 'out') map.zoomOut();
        else resetView();
      });
    });
    $('.ldm-found-clear').addEventListener('click', resetView);

    // --- A found place: its outline (red dashed) and a red pin ---
    function drawBoundary(geojson, lat, lng) {
      if (boundary) { map.removeLayer(boundary); boundary = null; }
      if (geojson && (geojson.type === 'Polygon' || geojson.type === 'MultiPolygon')) {
        boundary = L.geoJSON(geojson, { style: BOUNDARY_STYLE }).addTo(map);
        map.fitBounds(boundary.getBounds(), { padding: [40, 40], maxZoom: 16 });
      } else {
        // No outline known: a rough shape around the spot.
        var d = 0.015;
        boundary = L.polygon([
          [lat + d, lng - d * 1.1], [lat + d * 0.9, lng + d * 0.8], [lat - d * 0.4, lng + d * 1.2],
          [lat - d * 0.9, lng + d * 0.3], [lat - d * 0.7, lng - d * 1.0]
        ], BOUNDARY_STYLE).addTo(map);
      }
    }

    function showFound(name, address, lat, lng) {
      if (placeMarker) map.removeLayer(placeMarker);
      placeMarker = L.marker([lat, lng], { icon: circleIcon('found', ICON.pin), zIndexOffset: 3000 }).addTo(map);
      placeMarker.bindPopup(placePopup('found', 'LOCATION FOUND', name, address, lat, lng), POPUP).openPopup();
      foundEl.hidden = false;
      $('.ldm-found-name').textContent = '📍 ' + name;
    }

    // A typed search (Enter or the arrow): Nominatim for the outline, one retry,
    // then Photon (no outlines) when Nominatim is slow or down.
    function searchPlace(query) {
      query = query.trim();
      if (!query) return;
      closeSuggestions();
      spinner.hidden = false;
      var q = normalizeQuery(query);
      var tryNominatim = function (attempt) {
        return api('search', { q: q + ', Vietnam', limit: 1 })
          .then(function (data) { return data && data[0] ? fromNominatim(data[0]) : null; })
          .catch(function () { return attempt === 0 ? wait(400).then(function () { return tryNominatim(1); }) : null; });
      };
      tryNominatim(0)
        .then(function (hit) {
          return hit || api('photon', { q: q, limit: 1 })
            .then(function (d) { return d.features && d.features[0] ? fromPhoton(d.features[0]) : null; })
            .catch(function () { return null; });
        })
        .then(function (hit) {
          spinner.hidden = true;
          if (!hit) return;
          map.flyTo([hit.lat, hit.lng], 16, { duration: 1.2 });
          drawBoundary(hit.geojson, hit.lat, hit.lng);
          showFound(hit.name, hit.sub, hit.lat, hit.lng);
        });
    }

    // A picked suggestion without an outline (Photon has none): look one up
    // around its own spot, so it can't be a same-named place elsewhere.
    function outlineNear(name, lat, lng) {
      var d = 0.5;
      return api('search', { q: name, limit: 1, viewbox: [lng - d, lat + d, lng + d, lat - d].join(',') })
        .then(function (data) { return data && data[0] ? data[0].geojson : null; })
        .catch(function () { return null; });
    }

    function pickSuggestion(s) {
      input.value = s.name;
      clearBtn.hidden = false;
      closeSuggestions();
      if (boundary) { map.removeLayer(boundary); boundary = null; }
      map.flyTo([s.lat, s.lng], 16, { duration: 1.2 });
      (s.geojson ? Promise.resolve(s.geojson) : outlineNear(s.name, s.lat, s.lng)).then(function (geojson) {
        drawBoundary(geojson, s.lat, s.lng);
        showFound(s.name, s.sub, s.lat, s.lng);
      });
    }

    // --- Suggestions as you type (Nominatim + Photon side by side; a newer
    // keystroke cancels the older requests so a slow answer never wins) ---
    var suggestions = [];
    var typingTimer = null;
    var controller = null;

    function closeSuggestions() { sugsEl.hidden = true; }

    function renderSuggestions() {
      if (!suggestions.length) { closeSuggestions(); return; }
      sugsEl.innerHTML = '<div class="ldm-sugs-head">Suggested places &amp; facilities</div>' +
        suggestions.map(function (s, i) {
          var n = s.name.toLowerCase();
          var icon = s.type === 'school' || n.indexOf('thpt') >= 0 || n.indexOf('trường') >= 0 || n.indexOf('school') >= 0
            ? '<span class="ldm-sug-icon ldm-sug-icon--school">' + ICON.school + '</span>'
            : s.type === 'hospital' || n.indexOf('bệnh viện') >= 0 || n.indexOf('hospital') >= 0
              ? '<span class="ldm-sug-icon ldm-sug-icon--hospital">' + ICON.building + '</span>'
              : '<span class="ldm-sug-icon">' + ICON.pin + '</span>';
          return '<button type="button" class="ldm-sug" data-i="' + i + '">' + icon +
            '<span class="ldm-sug-text"><span class="ldm-sug-name">' + esc(s.name) + '</span><span class="ldm-sug-sub">' + esc(s.sub) + '</span></span></button>';
        }).join('');
      sugsEl.hidden = false;
    }

    input.addEventListener('input', function () {
      var query = input.value;
      clearBtn.hidden = !query;
      clearTimeout(typingTimer);
      if (controller) controller.abort();
      if (query.trim().length < 2) {
        suggestions = [];
        spinner.hidden = true;
        closeSuggestions();
        return;
      }
      typingTimer = setTimeout(function () {
        controller = new AbortController();
        var signal = controller.signal;
        var q = normalizeQuery(query);
        spinner.hidden = false;
        Promise.all([
          api('search', { q: q, limit: 8 }, signal).then(function (d) { return (d || []).map(fromNominatim); }).catch(function () { return []; }),
          api('photon', { q: q, limit: 6 }, signal).then(function (d) { return (d.features || []).map(fromPhoton); }).catch(function () { return []; })
        ]).then(function (res) {
          if (signal.aborted) return;
          var merged = res[0].slice();
          res[1].forEach(function (r) {
            var dup = merged.some(function (x) { return Math.abs(x.lat - r.lat) < 0.001 && Math.abs(x.lng - r.lng) < 0.001; });
            if (!dup) merged.push(r);
          });
          suggestions = merged.slice(0, 8);
          spinner.hidden = true;
          renderSuggestions();
        });
      }, 250);
    });

    input.addEventListener('focus', function () { if (suggestions.length) renderSuggestions(); });
    input.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') closeSuggestions(); });

    sugsEl.addEventListener('click', function (ev) {
      var b = ev.target.closest('.ldm-sug');
      if (b) pickSuggestion(suggestions[Number(b.getAttribute('data-i'))]);
    });

    $('.ldm-search-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      searchPlace(input.value);
    });
    $('.ldm-go').addEventListener('click', function () { searchPlace(input.value); });
    clearBtn.addEventListener('click', function () {
      input.value = '';
      suggestions = [];
      clearBtn.hidden = true;
      closeSuggestions();
      input.focus();
    });

    document.addEventListener('mousedown', function (ev) {
      if (!$('.ldm-search').contains(ev.target)) closeSuggestions();
    });

    // --- A click on the map: a green pin there, with the address ---
    if (CFG.clickPin) {
      map.on('click', function (ev) {
        var lat = ev.latlng.lat;
        var lng = ev.latlng.lng;
        if (placeMarker) map.removeLayer(placeMarker);
        placeMarker = L.marker([lat, lng], { icon: circleIcon('new', ICON.plus, 'New Pin'), zIndexOffset: 3000 }).addTo(map);
        var marker = placeMarker;
        marker.bindPopup(placePopup('new', 'NEW LOCATION PINNED', 'Looking up the address…', '', lat, lng), POPUP).openPopup();
        api('reverse', { lat: lat, lon: lng, zoom: 18 })
          .then(function (nom) {
            var a = nom.address || {};
            var poi = nom.name || a.amenity || a.building || a.hospital || a.tourism || a.leisure || a.school ||
              a.university || a.shop || a.office || a.road || a.suburb || a.village || a.town || a.city;
            return { name: poi || 'Selected cleanup spot', address: nom.display_name || '' };
          })
          .catch(function () { return { name: 'Cleanup spot (' + lat.toFixed(4) + ', ' + lng.toFixed(4) + ')', address: '' }; })
          .then(function (geo) {
            if (placeMarker !== marker) return;
            marker.setPopupContent(placePopup('new', 'NEW LOCATION PINNED', geo.name, geo.address, lat, lng));
          });
      });
    }

    renderPins();
    renderProvinces();
    setTab('map');

    // The box may change size with the page (theme layout, fonts loading).
    setTimeout(function () { map.invalidateSize(); }, 150);
    window.addEventListener('resize', function () { map.invalidateSize(); });
    if (window.ResizeObserver) new ResizeObserver(function () { map.invalidateSize(); }).observe(stage);
  }

  function start() {
    if (!window.L) return;
    document.querySelectorAll('.ldm[data-ldm]:not(.ldm--ready)').forEach(function (root) {
      try { init(root); } catch (err) { console.error('LDIVN Cleanup Map:', err); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
