/**
 * LDIVN Cleanup Map – the "Register to Volunteer" form, the same as the website's
 * (src/components/VolunteerModal.tsx) in plain JavaScript.
 *
 * Opens in a window from any link to "#volunteer" (a menu item, a button), from
 * [data-ldv-open] ([ldivn_volunteer_button]) and from the map's Register buttons
 * ([data-ldv-event]: that event chosen). [data-ldv-form] ([ldivn_volunteer_form])
 * is drawn in the page. ?register=<event id> or #volunteer in the address opens it too.
 * Settings come from window.LDIVN_VOLUNTEER.
 */
(function () {
  'use strict';

  var CFG = window.LDIVN_VOLUNTEER || {};
  var BIRTH_MIN_YEAR = 1900;
  var BIRTH_MAX_YEAR = 2050;

  // Solid icons like the design's (paths from Google's Material Icons, Apache-2.0).
  var ICONS = {
    person: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
    groups: 'M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58A2.01 2.01 0 0 0 0 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85A6.95 6.95 0 0 0 20 14c-.39 0-.76.04-1.13.1.4.68.63 1.46.63 2.29V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z',
    apartment: 'M17 11V3H7v4H3v14h8v-4h2v4h8V11h-4zM7 19H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm4 4H9v-2h2v2zm0-4H9V9h2v2zm0-4H9V5h2v2zm4 8h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm4 12h-2v-2h2v2zm0-4h-2v-2h2v2z',
    assignment: 'M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z',
    calendar: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z',
    phone: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z',
    mail: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z',
    place: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z',
    work: 'M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z',
    camera: 'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM9 2 7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z',
    eco: 'M6.05 8.05a7.007 7.007 0 0 0-.02 9.88c1.47-3.4 4.09-6.24 7.36-7.93A15.952 15.952 0 0 0 8.1 16.2c2.6 1.23 5.8.78 7.95-1.37C19.53 11.35 20 3 20 3s-8.35.47-11.83 3.95z',
    box: 'M12 2 3 7v10l9 5 9-5V7l-9-5zm0 2.3L18.7 8 12 11.7 5.3 8 12 4.3zM5 9.7l6 3.3v6.6l-6-3.3V9.7zm8 9.9V13l6-3.3v6.6l-6 3.3z'
  };
  // Outline icons (lucide, ISC): close, chevron, add user, done, warning.
  var LINES = {
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/>',
    check: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>'
  };

  var JOIN_OPTIONS = [
    { value: 'individual', title: 'Individual', icon: 'person' },
    { value: 'group', title: 'Group', icon: 'groups' },
    { value: 'organization', title: 'Organization', icon: 'apartment' }
  ];
  var ROLES = [
    { value: 'Clean-up', icon: 'eco' },
    { value: 'Media', icon: 'camera' },
    { value: 'Leader', icon: 'groups' },
    { value: 'Logistics', icon: 'box' }
  ];

  var uid = 0;

  // --- Helpers ---------------------------------------------------------------------------

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function icon(name, cls) {
    return '<svg viewBox="0 0 24 24" class="' + cls + '" fill="currentColor" aria-hidden="true"><path d="' + ICONS[name] + '"/></svg>';
  }

  function line(name, cls) {
    return '<svg viewBox="0 0 24 24" class="' + cls + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + LINES[name] + '</svg>';
  }

  function pad(n) {
    return (n < 10 ? '0' : '') + n;
  }

  /** "dd/mm/yyyy" → "yyyy-mm-dd" when it is a real date in range, else ''. */
  function birthIso(text) {
    var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
    if (!m) return '';
    var d = +m[1], mo = +m[2], y = +m[3];
    var date = new Date(y, mo - 1, d);
    var real = date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d;
    return real && y >= BIRTH_MIN_YEAR && y <= BIRTH_MAX_YEAR ? m[3] + '-' + m[2] + '-' + m[1] : '';
  }

  /**
   * Shapes what is typed into dd/mm/yyyy: the slashes come by themselves, and a
   * day or month typed with its own slash ("1/5/1990") gets its leading zero.
   */
  function formatBirthInput(raw) {
    var parts = raw.split(/\D+/);
    var digits = parts.map(function (p, i) {
      return i < 2 && i < parts.length - 1 && p.length === 1 ? '0' + p : p;
    }).join('').slice(0, 8);
    return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('/');
  }

  function birthProblem(text) {
    return birthIso(text) ? null : 'Please enter a valid date of birth (dd/mm/yyyy) between ' + BIRTH_MIN_YEAR + ' and ' + BIRTH_MAX_YEAR;
  }

  function ajax(method, params, done) {
    var body = new URLSearchParams(params).toString();
    var xhr = new XMLHttpRequest();
    xhr.open(method, CFG.ajax + (method === 'GET' ? '?' + body : ''));
    if (method === 'POST') xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.onload = function () {
      var data = null;
      try { data = JSON.parse(xhr.responseText); } catch (e) { /* not JSON: an error page */ }
      done(data, xhr.status);
    };
    xhr.onerror = function () { done(null, 0); };
    xhr.send(method === 'POST' ? body : null);
  }

  // --- The form ---------------------------------------------------------------------------

  function radioMark(small) {
    return '<span class="ldv-radio' + (small ? ' ldv-radio--sm' : '') + '" aria-hidden="true"><span></span></span>';
  }

  function sectionTitle(name, text) {
    return '<h4 class="ldv-h">' + icon(name, 'ldv-h-ic') + '<span>' + text + '</span></h4>';
  }

  function logo() {
    return '<div class="ldv-logo">' +
      (CFG.logo ? '<img src="' + esc(CFG.logo) + '" alt="">' : '') +
      '<div class="ldv-logo-text"><div class="ldv-logo-1">Let’s do it!</div><div class="ldv-logo-2">Vietnam</div></div>' +
    '</div>';
  }

  function leaf(cls, rotate) {
    var id = 'ldv-leaf-' + (++uid);
    return '<svg viewBox="0 0 60 80" class="' + cls + '" style="transform:rotate(' + rotate + 'deg)" aria-hidden="true">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#a6dc5a"/><stop offset="100%" stop-color="#3f9a2c"/></linearGradient></defs>' +
      '<path d="M30 2 C 58 18, 60 56, 30 78 C 0 56, 2 18, 30 2 Z" fill="url(#' + id + ')"/>' +
      '<path d="M30 8 C 31 30, 31 52, 30 76" stroke="#2f7d22" stroke-width="2" fill="none" opacity="0.6"/>' +
    '</svg>';
  }

  function formHtml(p, modal) {
    var join = JOIN_OPTIONS.map(function (o, i) {
      return '<label class="ldv-choice' + (i === 0 ? ' is-on' : '') + '">' +
        '<input type="radio" name="joinAs" value="' + o.value + '"' + (i === 0 ? ' checked' : '') + ' class="ldv-sr">' +
        icon(o.icon, 'ldv-choice-ic') +
        '<span class="ldv-choice-title">' + o.title + '</span>' +
        '<span class="ldv-choice-mark">' + radioMark(false) + '</span>' +
      '</label>';
    }).join('');
    var roles = ROLES.map(function (r, i) {
      return '<label class="ldv-role' + (i === 0 ? ' is-on' : '') + '">' +
        '<input type="radio" name="role" value="' + r.value + '"' + (i === 0 ? ' checked' : '') + ' class="ldv-sr">' +
        icon(r.icon, 'ldv-role-ic') +
        '<span class="ldv-role-title">' + r.value + '</span>' +
        '<span class="ldv-role-mark">' + radioMark(true) + '</span>' +
      '</label>';
    }).join('');

    return (modal ? '<button type="button" class="ldv-close" aria-label="Close">' + line('x', 'ldv-close-ic') + '</button>' : '') +
      // Header: soft sky and greenery; logo and title, then the volunteers' photo as a whole circle.
      '<div class="ldv-head">' +
        '<div class="ldv-blob ldv-blob--1"></div><div class="ldv-blob ldv-blob--2"></div><div class="ldv-blob ldv-blob--3"></div>' +
        '<svg viewBox="0 0 960 80" preserveAspectRatio="none" class="ldv-wave" aria-hidden="true"><path d="M0 80 L0 38 C 120 0, 300 8, 470 60 C 520 74, 560 80, 600 80 Z" fill="#fff"/><rect x="0" y="70" width="960" height="10" fill="#fff"/></svg>' +
        '<div class="ldv-head-row' + (modal ? ' ldv-head-row--close' : '') + '">' +
          '<div class="ldv-head-text">' + logo() +
            '<div><h3 class="ldv-title" id="' + p + '-title">Register to Volunteer</h3>' +
            '<p class="ldv-sub">Be part of a cleaner, greener and more beautiful Vietnam!</p></div>' +
          '</div>' +
          '<div class="ldv-photo" aria-hidden="true">' +
            '<div class="ldv-photo-img">' + (CFG.photo ? '<img src="' + esc(CFG.photo) + '" alt="">' : '') + '</div>' +
            '<span class="ldv-ray ldv-ray--1"></span><span class="ldv-ray ldv-ray--2"></span><span class="ldv-ray ldv-ray--3"></span>' +
            leaf('ldv-leaf ldv-leaf--1', -55) + leaf('ldv-leaf ldv-leaf--2', 35) +
          '</div>' +
        '</div>' +
      '</div>' +

      // Desktop: two columns (choices | details), so the whole form fits on one screen.
      '<form class="ldv-form" novalidate>' +
        '<input type="text" name="website" tabindex="-1" autocomplete="off" class="ldv-hp" aria-hidden="true">' +
        '<div class="ldv-col">' +
          '<section>' + sectionTitle('groups', 'Join as') +
            '<div class="ldv-join" role="radiogroup" aria-label="Join as">' + join + '</div>' +
          '</section>' +
          '<section>' + sectionTitle('assignment', 'Project or campaign') +
            '<div class="ldv-field">' + icon('calendar', 'ldv-field-ic') +
              '<select name="eventId" class="ldv-input ldv-select is-empty" aria-label="Project or campaign" required>' +
                '<option value="" disabled selected>Loading projects…</option>' +
              '</select>' + line('chevron', 'ldv-chevron') +
            '</div>' +
          '</section>' +
          '<section>' + sectionTitle('work', 'Preferred role') +
            '<div class="ldv-roles" role="radiogroup" aria-label="Preferred role">' + roles + '</div>' +
          '</section>' +
        '</div>' +

        '<div class="ldv-col">' +
          '<hr class="ldv-hr">' +
          '<section>' + sectionTitle('person', 'Personal information') +
            '<div class="ldv-grid">' +
              '<div><label class="ldv-label" for="' + p + '-name"><span class="ldv-name-label">Full name</span><span class="ldv-req"> *</span></label>' +
                '<div class="ldv-field">' + icon('person', 'ldv-field-ic') +
                '<input id="' + p + '-name" name="fullName" class="ldv-input" required autocomplete="name" placeholder="Enter your full name"></div></div>' +
              '<div><label class="ldv-label" for="' + p + '-phone">Phone number</label>' +
                '<div class="ldv-field">' + icon('phone', 'ldv-field-ic') +
                '<input id="' + p + '-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" class="ldv-input" placeholder="Enter your phone number (optional)"></div></div>' +
              '<div><label class="ldv-label" for="' + p + '-email">Email address<span class="ldv-req"> *</span></label>' +
                '<div class="ldv-field">' + icon('mail', 'ldv-field-ic') +
                '<input id="' + p + '-email" name="email" type="email" required autocomplete="email" class="ldv-input" placeholder="Enter your email address"></div></div>' +
              // A group or organization has no date of birth: its name goes here instead.
              '<div class="ldv-birth-box"><label class="ldv-label" for="' + p + '-birth">Date of birth<span class="ldv-req"> *</span></label>' +
                '<div class="ldv-field">' + icon('calendar', 'ldv-field-ic') +
                  '<input id="' + p + '-birth" name="birthDate" required inputmode="numeric" autocomplete="bday" maxlength="10" placeholder="dd/mm/yyyy" class="ldv-input ldv-input--picker">' +
                  // The browser's calendar, on an invisible date input over the button on the right.
                  '<span class="ldv-picker" title="Pick from the calendar">' + line('chevron', 'ldv-picker-ic') +
                    '<input type="date" tabindex="-1" aria-label="Pick your date of birth from the calendar" min="' + BIRTH_MIN_YEAR + '-01-01" max="' + BIRTH_MAX_YEAR + '-12-31">' +
                  '</span>' +
                '</div>' +
                '<p class="ldv-err" hidden>' + line('alert', 'ldv-err-ic') + '<span></span></p>' +
              '</div>' +
              '<div class="ldv-org-box" hidden><label class="ldv-label" for="' + p + '-org"><span class="ldv-org-label">Group name</span><span class="ldv-req"> *</span></label>' +
                '<div class="ldv-field"><span class="ldv-org-ic">' + icon('groups', 'ldv-field-ic') + '</span>' +
                '<input id="' + p + '-org" name="organizationName" autocomplete="organization" class="ldv-input" placeholder="Enter your group name"></div></div>' +
              '<div class="ldv-wide"><label class="ldv-label" for="' + p + '-address">Address<span class="ldv-req"> *</span></label>' +
                '<div class="ldv-field">' + icon('place', 'ldv-field-ic') +
                '<input id="' + p + '-address" name="address" required autocomplete="street-address" class="ldv-input" placeholder="Enter your address"></div></div>' +
            '</div>' +
          '</section>' +
          // Number of participants: always 1 for an individual.
          '<section>' + sectionTitle('groups', 'Number of participants') +
            '<div class="ldv-field">' + icon('groups', 'ldv-field-ic') +
              '<input name="participants" type="number" min="1" required readonly inputmode="numeric" value="1" class="ldv-input is-locked" placeholder="Enter number of participants" aria-label="Number of participants">' +
            '</div>' +
          '</section>' +
        '</div>' +

        '<p class="ldv-formerr" hidden></p>' +
        '<div class="ldv-actions">' +
          '<button type="submit" class="ldv-submit">' + line('userPlus', 'ldv-submit-ic') + '<span>Register to Volunteer</span></button>' +
        '</div>' +
      '</form>';
  }

  function doneHtml(name, modal) {
    return (modal ? '<button type="button" class="ldv-close" aria-label="Close">' + line('x', 'ldv-close-ic') + '</button>' : '') +
      logo() +
      '<div class="ldv-done-ic">' + line('check', '') + '</div>' +
      '<h3 class="ldv-done-title">Registration successful!</h3>' +
      '<p class="ldv-done-text">Thank you' + (name ? ', ' + esc(name) : '') + '! Your registration has been recorded. We\'ll be in touch soon.</p>' +
      '<button type="button" class="ldv-done-btn">Done</button>';
  }

  /** Fills the project list: the upcoming events, and the chosen one. */
  function fillEvents(select, want) {
    ajax('GET', { action: 'ldv_events', event: want || '' }, function (data) {
      var events = data && data.events ? data.events : [];
      var found = events.some(function (e) { return e.id === want; });
      var html = '<option value="" disabled' + (found ? '' : ' selected') + '>' +
        (events.length ? 'Select a project or campaign' : 'World Cleanup Day ' + new Date().getFullYear()) + '</option>';
      events.forEach(function (e) {
        html += '<option value="' + esc(e.id) + '"' + (e.id === want ? ' selected' : '') + '>' + esc(e.title) + '</option>';
      });
      select.innerHTML = html;
      // Nothing to choose from: the sign-up counts for World Cleanup Day.
      select.required = events.length > 0;
      select.disabled = !events.length;
      select.classList.toggle('is-empty', !select.value);
    });
  }

  /** Draws a form into card (the white box) and makes it work. */
  function build(card, opts) {
    var p = 'ldv' + (++uid);
    var modal = !!opts.modal;
    card.className = 'ldv ldv--form';
    card.innerHTML = formHtml(p, modal);
    if (modal) {
      card.setAttribute('role', 'dialog');
      card.setAttribute('aria-modal', 'true');
      card.setAttribute('aria-labelledby', p + '-title');
    }

    var form = card.querySelector('form');
    var $ = function (sel) { return form.querySelector(sel); };
    var select = $('select[name="eventId"]');
    var nameInput = $('input[name="fullName"]');
    var phone = $('input[name="phone"]');
    var birth = $('input[name="birthDate"]');
    var picker = $('.ldv-picker input');
    var err = $('.ldv-err');
    var org = $('input[name="organizationName"]');
    var people = $('input[name="participants"]');
    var formErr = $('.ldv-formerr');
    var submit = $('.ldv-submit');

    fillEvents(select, opts.event);
    select.addEventListener('change', function () { select.classList.remove('is-empty'); });

    function showBirthError(msg) {
      err.hidden = !msg;
      err.querySelector('span').textContent = msg || '';
      birth.classList.toggle('is-bad', !!msg);
    }

    function joinAs() {
      return form.querySelector('input[name="joinAs"]:checked').value;
    }

    // Radio cards: the chosen one is pink.
    function syncCards(name) {
      [].forEach.call(form.querySelectorAll('input[name="' + name + '"]'), function (r) {
        r.parentNode.classList.toggle('is-on', r.checked);
      });
    }

    function syncJoin() {
      var join = joinAs();
      var team = join !== 'individual';
      var word = join === 'organization' ? 'Organization' : 'Group';
      syncCards('joinAs');
      $('.ldv-name-label').textContent = team ? 'Contact person' : 'Full name';
      nameInput.placeholder = team ? 'Enter the contact person’s full name' : 'Enter your full name';
      $('.ldv-birth-box').hidden = team;
      birth.required = !team;
      $('.ldv-org-box').hidden = !team;
      org.required = team;
      $('.ldv-org-label').textContent = word + ' name';
      org.placeholder = join === 'organization' ? 'Enter your company or organization name' : 'Enter your group name';
      $('.ldv-org-ic').innerHTML = icon(join === 'organization' ? 'apartment' : 'groups', 'ldv-field-ic');
      people.readOnly = !team;
      people.classList.toggle('is-locked', !team);
      people.value = team ? (people.getAttribute('data-team') || '') : '1';
      if (!team) showBirthError(null);
    }

    form.addEventListener('change', function (e) {
      if (e.target.name === 'joinAs') syncJoin();
      if (e.target.name === 'role') syncCards('role');
    });

    // Optional, any length: digits, with a leading + for foreign numbers.
    phone.addEventListener('input', function () {
      phone.value = phone.value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '').slice(0, 16);
    });

    birth.addEventListener('input', function () {
      birth.value = formatBirthInput(birth.value);
      showBirthError(birth.value.length === 10 ? birthProblem(birth.value) : null);
      picker.value = birthIso(birth.value);
    });
    birth.addEventListener('blur', function () {
      if (birth.value) showBirthError(birthProblem(birth.value));
    });
    // From the calendar: yyyy-mm-dd → dd/mm/yyyy.
    picker.addEventListener('change', function () {
      if (picker.value) {
        birth.value = picker.value.split('-').reverse().join('/');
        showBirthError(null);
      }
    });
    picker.addEventListener('click', function () {
      try { if (picker.showPicker) picker.showPicker(); } catch (e) { /* not allowed here: the date can still be typed */ }
    });

    people.addEventListener('input', function () {
      if (people.readOnly) return;
      people.value = people.value.replace(/\D/g, '').slice(0, 5);
      people.setAttribute('data-team', people.value);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      formErr.hidden = true;
      var team = joinAs() !== 'individual';

      // The browser's own messages for the empty required fields, like the website's form.
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var problem = team ? null : birthProblem(birth.value);
      if (problem) {
        showBirthError(problem);
        birth.focus();
        return;
      }
      var count = team ? parseInt(people.value, 10) : 1;
      if (!(count >= 1)) {
        alert('⚠ Please enter the number of participants.');
        return;
      }

      var fields = {
        action: 'ldv_submit',
        joinAs: joinAs(),
        eventId: select.disabled ? '' : select.value,
        role: form.querySelector('input[name="role"]:checked').value,
        fullName: nameInput.value.trim(),
        phone: phone.value.trim(),
        email: $('input[name="email"]').value.trim(),
        birthDate: team ? '' : birth.value,
        organizationName: team ? org.value.trim() : '',
        address: $('input[name="address"]').value.trim(),
        participants: String(count),
        website: $('.ldv-hp').value
      };
      submit.disabled = true;
      submit.querySelector('span').textContent = 'Sending…';
      ajax('POST', fields, function (data) {
        submit.disabled = false;
        submit.querySelector('span').textContent = 'Register to Volunteer';
        if (data && data.ok) {
          done(card, fields.fullName, opts);
        } else {
          formErr.textContent = (data && data.error) || 'Sorry, your registration could not be sent. Please check your connection and try again.';
          formErr.hidden = false;
        }
      });
    });

    if (modal) {
      card.querySelector('.ldv-close').addEventListener('click', close);
    }
  }

  function done(card, name, opts) {
    card.className = 'ldv ldv--done';
    card.innerHTML = doneHtml(name, opts.modal);
    var again = function () {
      if (opts.modal) close();
      else build(card, opts);
    };
    card.querySelector('.ldv-done-btn').addEventListener('click', again);
    if (opts.modal) card.querySelector('.ldv-close').addEventListener('click', close);
    card.scrollIntoView && !opts.modal && card.scrollIntoView({ block: 'nearest' });
  }

  // --- The window ---------------------------------------------------------------------------

  var overlay = null;
  var bodyOverflow = '';
  // The address was changed to the form's own (/volunteer/) when it opened.
  var pushed = false;

  function onKey(e) {
    if (e.key === 'Escape') close();
  }

  /** The form in a window. push: false keeps the address (the page was opened with it). */
  function open(eventId, push) {
    teardown();
    overlay = document.createElement('div');
    overlay.className = 'ldv-overlay';
    overlay.id = 'ldv-modal';
    var card = document.createElement('div');
    overlay.appendChild(card);
    build(card, { modal: true, event: eventId || '' });
    overlay.addEventListener('mousedown', function (e) {
      if (e.target === overlay) close();
    });
    document.body.appendChild(overlay);
    // The page behind doesn't scroll while the form is open.
    bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    var first = card.querySelector('.ldv-close');
    if (first) first.focus({ preventScroll: true });
    // While open, the address is the form's own, to share or reload.
    if (push !== false && CFG.page && location.pathname !== CFG.page && window.history.pushState) {
      // Without "#volunteer" left behind, which would open the form again on the way back.
      if (location.hash === '#volunteer') history.replaceState(null, '', location.pathname + location.search);
      history.pushState({ ldv: 1 }, '', CFG.page + (eventId ? '?register=' + encodeURIComponent(eventId) : ''));
      pushed = true;
    }
  }

  /** Takes the window away, the address untouched. */
  function teardown() {
    if (!overlay) return;
    overlay.parentNode && overlay.parentNode.removeChild(overlay);
    overlay = null;
    document.body.style.overflow = bodyOverflow;
    document.removeEventListener('keydown', onKey);
  }

  function close() {
    if (!overlay) return;
    teardown();
    if (location.hash === '#volunteer' && window.history.replaceState) {
      history.replaceState(null, '', location.pathname + location.search);
    }
    // Back to the address before the form opened (the home page when it was opened at /volunteer/).
    if (CFG.page && location.pathname === CFG.page) {
      if (pushed) {
        pushed = false;
        history.back();
      } else if (window.history.replaceState) {
        history.replaceState(null, '', CFG.home || '/');
      }
    }
  }

  // Back/forward: leaving /volunteer/ closes the form, coming back to it opens it.
  window.addEventListener('popstate', function () {
    if (!CFG.page) return;
    if (location.pathname === CFG.page) {
      if (!overlay) open(registerParam() || '', false);
    } else if (overlay) {
      pushed = false;
      teardown();
    }
  });

  function registerParam() {
    var m = /[?&]register=([^&#]*)/.exec(location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null;
  }

  /** A link to "#volunteer" or to /volunteer/ of this site, from whatever page: the form opens right here. */
  function isVolunteerLink(a) {
    if (a.tagName !== 'A' || a.host !== location.host) return false;
    return a.hash === '#volunteer' || a.hash === '#ldivn-volunteer' || (!!CFG.page && a.pathname === CFG.page && !a.hash);
  }

  // Captured before the theme's own handlers (smooth scroll, menus) and the map's.
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('a, [data-ldv-open], .ldivn-volunteer-open') : null;
    if (!t) return;
    var mapButton = t.hasAttribute('data-ldv-event') && CFG.onMap;
    if (!mapButton && !t.hasAttribute('data-ldv-open') && !t.classList.contains('ldivn-volunteer-open') && !isVolunteerLink(t)) return;
    e.preventDefault();
    e.stopPropagation();
    open(t.getAttribute('data-ldv-event') || '');
  }, true);

  function start() {
    [].forEach.call(document.querySelectorAll('[data-ldv-form]'), function (box) {
      if (box.getAttribute('data-ldv-ready')) return;
      box.setAttribute('data-ldv-ready', '1');
      var card = document.createElement('div');
      box.innerHTML = '';
      box.appendChild(card);
      build(card, { modal: false, event: box.getAttribute('data-ldv-form') || '' });
    });

    // ?register=<event id> (the website's own link), /volunteer/ or #volunteer opens the form.
    var event = registerParam();
    if (event !== null) open(event, false);
    else if (CFG.autoOpen) open('', false);
    else if (location.hash === '#volunteer') open('');
  }

  window.addEventListener('hashchange', function () {
    if (location.hash === '#volunteer' && !overlay) open('');
  });

  window.LDIVN_VOLUNTEER_OPEN = open;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
