/**
 * Tình nguyện viên → Sửa form đăng ký (includes/volunteer-form.php): the form as
 * visitors see it (assets/js/volunteer.js in edit mode), made on itself.
 *
 * - Texts, placeholders, role names, the labels of one's own fields: typed in place.
 * - Each part and field: a small bar on hover, to drag it (⠿), hide it, make it
 *   required or as wide as the row, delete it (one's own); roles: × and +.
 * - The panel beside: colours, header background, font, corners, fields to add.
 *
 * The form's settings are window.LDIVN_VOLUNTEER (CFG): changes go there, the
 * form is drawn again from it when its shape changes (LDIVN_VOLUNTEER_BUILD), and
 * everything is copied into the hidden fields of the "Lưu form" form.
 */
(function () {
  'use strict';

  var CFG = window.LDIVN_VOLUNTEER || {};
  var FONTS = (window.LDV_EDIT || {}).fonts || {};
  var OPTION = 'ldv_form';
  var LOCKED = { name: true, email: true }; // always asked for, always required
  var T = CFG.text = CFG.text || {};
  var jq = window.jQuery;
  var card = null;
  var join = 'individual'; // the "Join as" the form is shown with
  var dirty = false;

  function saved(name) {
    return document.querySelector('[name="' + OPTION + name + '"]');
  }

  function changed() {
    dirty = true;
  }

  function saveText(key, value) {
    T[key] = value;
    var input = saved('[text][' + key + ']');
    if (input) input.value = value;
    changed();
  }

  function saveShape() {
    saved('[fields]').value = JSON.stringify(CFG.fields);
    saved('[layout]').value = JSON.stringify(CFG.layout);
    saved('[roles]').value = CFG.roles.join('\n');
    changed();
  }

  function field(key) {
    return CFG.fields.filter(function (f) { return f.key === key; })[0];
  }

  function button(act, label, title, on, data) {
    return '<button type="button" data-act="' + act + '"' + (data || '') + ' title="' + title + '"' + (on ? ' class="is-on"' : '') + '>' + label + '</button>';
  }

  // --- Drawing ---------------------------------------------------------------------------

  function draw() {
    window.LDIVN_VOLUNTEER_BUILD(card);
    decorate();
  }

  /** What the drawn form gets to be edited: typing, bars, drag and drop. */
  function decorate() {
    var form = card.querySelector('form');

    // The "Join as" shown: its names (Contact person, Group name...) can be edited too.
    if (join !== 'individual') {
      var radio = form.querySelector('input[name="joinAs"][value="' + join + '"]');
      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    editable();

    // A bar on each part.
    [].forEach.call(form.querySelectorAll('section[data-part]'), function (sec) {
      var part = sec.getAttribute('data-part');
      var off = CFG.layout.off.indexOf(part) >= 0;
      var bar = document.createElement('div');
      bar.className = 'ldv-edit-bar';
      bar.innerHTML = '<span class="ldv-edit-grip ldv-edit-grip--part" title="Kéo để đổi chỗ (cả sang cột bên kia)">⠿</span>' +
        (part === 'info' ? '' : button('part-off', off ? 'Hiện' : 'Ẩn', off ? 'Hiện mục này trên form' : 'Ẩn mục này khỏi form', off, ' data-part="' + part + '"'));
      sec.insertBefore(bar, sec.firstChild);
    });

    // A bar on each field.
    [].forEach.call(form.querySelectorAll('.ldv-cell[data-field]'), function (cell) {
      var f = field(cell.getAttribute('data-field'));
      if (!f) return;
      var own = /^c\d+$/.test(f.key);
      var k = ' data-key="' + f.key + '"';
      var bar = document.createElement('div');
      bar.className = 'ldv-edit-bar';
      bar.innerHTML = '<span class="ldv-edit-grip ldv-edit-grip--field" title="Kéo để đổi chỗ">⠿</span>' +
        (LOCKED[f.key] ? '' : button('req', 'Bắt buộc', 'Bắt buộc phải điền', f.required, k)) +
        button('wide', 'Rộng', 'Rộng cả hàng', f.wide, k) +
        (LOCKED[f.key] ? '' : button('off', f.off ? 'Hiện' : 'Ẩn', f.off ? 'Hiện ô này trên form' : 'Ẩn ô này khỏi form', f.off, k)) +
        (own ? button('del', '×', 'Xoá ô này', false, k) : '');
      cell.insertBefore(bar, cell.firstChild);
    });

    // Roles: × on each, + after them.
    var roles = form.querySelector('.ldv-roles');
    [].forEach.call(roles.querySelectorAll('.ldv-role'), function (r, i) {
      if (CFG.roles.length > 1) {
        var x = document.createElement('button');
        x.type = 'button';
        x.className = 'ldv-edit-del';
        x.title = 'Xoá vai trò này';
        x.textContent = '×';
        x.setAttribute('data-act', 'role-del');
        x.setAttribute('data-i', i);
        r.appendChild(x);
      }
    });
    var add = document.createElement('button');
    add.type = 'button';
    add.className = 'ldv-edit-add';
    add.title = 'Thêm vai trò';
    add.textContent = '+';
    add.setAttribute('data-act', 'role-add');
    roles.appendChild(add);

    // Drag and drop: the parts within and between the columns, the fields in their grid.
    if (jq && jq.fn.sortable) {
      jq(form).find('.ldv-col').sortable({
        items: '> section',
        connectWith: jq(form).find('.ldv-col'),
        handle: '.ldv-edit-grip--part',
        placeholder: 'ldv-edit-slot',
        forcePlaceholderSize: true,
        tolerance: 'pointer',
        stop: function () {
          ['left', 'right'].forEach(function (col) {
            CFG.layout[col] = [].map.call(form.querySelectorAll('.ldv-col[data-col="' + col + '"] > section[data-part]'), function (s) {
              return s.getAttribute('data-part');
            });
          });
          saveShape();
          setTimeout(draw, 0);
        }
      });
      jq(form).find('.ldv-grid').sortable({
        items: '> .ldv-cell',
        handle: '.ldv-edit-grip--field',
        placeholder: 'ldv-edit-slot',
        forcePlaceholderSize: true,
        tolerance: 'pointer',
        stop: function () {
          var order = [].map.call(form.querySelectorAll('.ldv-grid > .ldv-cell[data-field]'), function (c) { return c.getAttribute('data-field'); });
          CFG.fields.sort(function (a, b) { return order.indexOf(a.key) - order.indexOf(b.key); });
          saveShape();
          setTimeout(draw, 0);
        }
      });
    }
  }

  /** Texts to type into; the fields' placeholders shown as their text, to type over. */
  var plain = (function () {
    var probe = document.createElement('span');
    probe.contentEditable = 'plaintext-only';
    return probe.contentEditable === 'plaintext-only';
  })();
  function editable() {
    [].forEach.call(card.querySelectorAll('[data-t], [data-role], [data-f]'), function (el) {
      el.contentEditable = plain ? 'plaintext-only' : 'true';
      el.spellcheck = false;
    });
    [].forEach.call(card.querySelectorAll('[data-tp], [data-fp]'), function (input) {
      input.value = input.placeholder;
      input.classList.add('ldv-edit-ph');
    });
  }

  // --- What is done on the form ----------------------------------------------------------

  function listen() {
    card.addEventListener('input', function (e) {
      var el = e.target;
      var key;
      if ((key = el.getAttribute('data-tp'))) {
        saveText(key, el.value);
        el.placeholder = el.value;
      } else if ((key = el.getAttribute('data-fp'))) {
        field(key).placeholder = el.value;
        el.placeholder = el.value;
        saveShape();
      } else if (el.closest && el.closest('[data-t]')) {
        el = el.closest('[data-t]');
        saveText(el.getAttribute('data-t'), el.textContent.replace(/\s+/g, ' ').trim());
      } else if (el.closest && el.closest('[data-role]')) {
        var names = [].map.call(card.querySelectorAll('[data-role]'), function (r) { return r.textContent.trim(); });
        CFG.roles = names.filter(Boolean);
        saveShape();
      } else if (el.closest && el.closest('[data-f]')) {
        el = el.closest('[data-f]');
        field(el.getAttribute('data-f')).label = el.textContent.replace(/\s+/g, ' ').trim();
        saveShape();
      }
    });

    // One line each: Enter ends the typing; a paste keeps just the text.
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.isContentEditable) {
        e.preventDefault();
        e.target.blur();
      }
    });
    card.addEventListener('paste', function (e) {
      if (!e.target.isContentEditable || plain) return;
      e.preventDefault();
      document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text'));
    });

    card.addEventListener('click', function (e) {
      // A click in a choice's name (or a ticked box's text) edits it instead of choosing it.
      if (e.target.isContentEditable && e.target.closest('label')) {
        e.preventDefault();
        return;
      }
      var b = e.target.closest('[data-act]');
      if (!b) {
        if (e.target.closest('.ldv-photo')) pickPhoto();
        return;
      }
      e.preventDefault();
      var act = b.getAttribute('data-act');
      var f = field(b.getAttribute('data-key') || '');
      if (act === 'req') f.required = !f.required;
      else if (act === 'wide') f.wide = !f.wide;
      else if (act === 'off') f.off = !f.off;
      else if (act === 'del') {
        if (!confirm('Xoá ô "' + (f.label || '') + '"? Câu trả lời đã có vẫn còn trong các đăng ký cũ.')) return;
        CFG.fields.splice(CFG.fields.indexOf(f), 1);
      } else if (act === 'part-off') {
        var part = b.getAttribute('data-part');
        var i = CFG.layout.off.indexOf(part);
        if (i >= 0) CFG.layout.off.splice(i, 1);
        else CFG.layout.off.push(part);
      } else if (act === 'role-del') {
        CFG.roles.splice(Number(b.getAttribute('data-i')), 1);
      } else if (act === 'role-add') {
        CFG.roles.push('New role');
      }
      saveShape();
      draw();
      if (act === 'role-add') {
        var last = [].slice.call(card.querySelectorAll('[data-role]')).pop();
        last.focus();
        document.getSelection().selectAllChildren(last);
      }
    });

    card.addEventListener('change', function (e) {
      // After the form has shown the other "Join as" (its own handler, deeper, runs first).
      if (e.target.name === 'joinAs') {
        join = e.target.value;
        editable();
      }
      // The choices of one's own list: one per line.
      var key = e.target.getAttribute('data-fo');
      if (key) {
        field(key).options = e.target.value.split('\n').map(function (o) { return o.trim(); }).filter(Boolean);
        saveShape();
        draw();
      }
    });
  }

  // --- The photo, the header's picture ---------------------------------------------------

  var frames = {};
  function media(which, done) {
    if (!window.wp || !wp.media) return;
    var frame = frames[which] = frames[which] || wp.media({ title: which === 'head' ? 'Ảnh nền đầu form' : 'Ảnh tròn của form', library: { type: 'image' }, multiple: false });
    frame.off('select').on('select', function () {
      var file = frame.state().get('selection').first().toJSON();
      done(file.sizes && file.sizes.large ? file.sizes.large.url : file.url);
    });
    frame.open();
  }

  function pickPhoto() {
    media('photo', function (url) {
      CFG.photo = url;
      saved('[photo]').value = url;
      changed();
      var img = card.querySelector('.ldv-photo img');
      if (img) img.src = url;
    });
  }

  // --- The panel: colours, header, font, corners, fields to add --------------------------

  function panel() {
    var style = CFG.style = CFG.style || {};
    var restyle = function () {
      window.LDIVN_VOLUNTEER_STYLE(card);
      changed();
    };
    var head = saved('[style][head]');
    var headImage = saved('[style][head_image]');

    [].forEach.call(document.querySelectorAll('[data-style]'), function (input) {
      input.addEventListener('input', function () {
        var what = input.getAttribute('data-style');
        if (what === 'primary' || what === 'text') style[what] = input.value;
        else if (what === 'radius') style.radius = Number(input.value);
        else if (what === 'head') {
          style.head = head.value = input.value;
          style.headImage = headImage.value = '';
        } else if (what === 'font') {
          var font = FONTS[input.value] || {};
          if (font.url && !document.querySelector('link[href="' + font.url + '"]')) {
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = font.url;
            document.head.appendChild(link);
          }
          style.fontFamily = font.family || '';
        }
        restyle();
      });
    });
    document.querySelector('[data-head="image"]').addEventListener('click', function () {
      media('head', function (url) {
        style.headImage = headImage.value = url;
        restyle();
      });
    });
    document.querySelector('[data-head="reset"]').addEventListener('click', function () {
      style.head = head.value = '';
      style.headImage = headImage.value = '';
      restyle();
    });

    // A field of one's own, at the end of "Personal information".
    [].forEach.call(document.querySelectorAll('[data-add]'), function (b) {
      b.addEventListener('click', function () {
        var type = b.getAttribute('data-add');
        var n = CFG.fields.reduce(function (max, f) { var m = /^c(\d+)$/.exec(f.key); return m ? Math.max(max, Number(m[1])) : max; }, 0) + 1;
        CFG.fields.push({
          key: 'c' + n,
          type: type,
          label: type === 'check' ? 'I agree to be contacted about this event' : type === 'select' ? 'T-shirt size' : 'New field',
          placeholder: type === 'text' ? 'Type here' : '',
          options: type === 'select' ? ['S', 'M', 'L', 'XL'] : [],
          required: false,
          wide: type !== 'text',
          off: false
        });
        saveShape();
        draw();
        var cell = card.querySelector('.ldv-cell[data-field="c' + n + '"]');
        if (cell) {
          cell.scrollIntoView({ block: 'center', behavior: 'smooth' });
          var label = cell.querySelector('[data-f]');
          if (label) {
            label.focus();
            document.getSelection().selectAllChildren(label);
          }
        }
      });
    });
  }

  function start() {
    card = document.querySelector('.ldv-edit-box .ldv');
    if (!card || !window.LDIVN_VOLUNTEER_BUILD) return;
    CFG.fields = CFG.fields || [];
    CFG.layout = CFG.layout || { left: [], right: [], off: [] };
    CFG.layout.off = CFG.layout.off || [];
    CFG.roles = CFG.roles || [];
    listen();
    panel();
    decorate();

    // Leaving with changes not saved: the browser asks first.
    var save = document.getElementById('ldv-edit-save');
    [].forEach.call(save.querySelectorAll('input'), function (i) { i.addEventListener('input', changed); });
    save.addEventListener('submit', function () { dirty = false; });
    window.addEventListener('beforeunload', function (e) {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
