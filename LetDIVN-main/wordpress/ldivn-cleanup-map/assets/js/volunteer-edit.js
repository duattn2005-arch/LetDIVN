/**
 * Tình nguyện viên → Sửa form đăng ký (includes/volunteer-form.php): the form as
 * visitors see it (assets/js/volunteer.js with CFG.edit), edited in place.
 * A click on a text types into it, on a field its grey placeholder, on the
 * photo picks another; roles get × and a "+" card. Every change goes into the
 * hidden fields of the page's "Lưu form" form.
 */
(function () {
  'use strict';

  var CFG = window.LDIVN_VOLUNTEER || {};
  var T = CFG.text || {}; // the form's own texts: it redraws from them (Group / Individual)
  var OPTION = 'ldv_form';
  var dirty = false;

  function saved(name) {
    return document.querySelector('[name="' + OPTION + name + '"]');
  }

  function setText(key, value) {
    T[key] = value;
    var input = saved('[text][' + key + ']');
    if (input) input.value = value;
    dirty = true;
  }

  function start() {
    var box = document.querySelector('.ldv-edit-box');
    var card = box && box.querySelector('.ldv');
    if (!card) return;
    var form = card.querySelector('form');

    // --- Texts ---------------------------------------------------------------------------
    var plain = (function () {
      var probe = document.createElement('span');
      probe.contentEditable = 'plaintext-only';
      return probe.contentEditable === 'plaintext-only';
    })();
    function editable(root) {
      [].forEach.call(root.querySelectorAll('[data-t], [data-role]'), function (el) {
        el.contentEditable = plain ? 'plaintext-only' : 'true';
        el.spellcheck = false;
      });
    }
    editable(card);

    card.addEventListener('input', function (e) {
      var el = e.target.closest && e.target.closest('[data-t]');
      if (el) setText(el.getAttribute('data-t'), el.textContent.replace(/\s+/g, ' ').trim());
      if (e.target.closest && e.target.closest('[data-role]')) saveRoles();
      var field = e.target.getAttribute && e.target.getAttribute('data-tp');
      if (field) {
        setText(field, e.target.value);
        e.target.placeholder = e.target.value;
      }
    });
    // One line each: Enter ends the editing; a paste keeps just the text.
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
    // A click in a choice's name edits it instead of choosing it.
    card.addEventListener('click', function (e) {
      if (e.target.isContentEditable && e.target.closest('label')) e.preventDefault();
    }, true);

    // --- Placeholders: shown as the fields' text, to type over ---------------------------------
    function showPlaceholders() {
      [].forEach.call(form.querySelectorAll('[data-tp]'), function (input) {
        input.value = input.placeholder;
        input.classList.add('ldv-edit-ph');
      });
    }
    showPlaceholders();
    // Group / Organization / Individual show other names: after the form has redrawn them.
    form.addEventListener('change', function (e) {
      if (e.target.name === 'joinAs') setTimeout(function () { showPlaceholders(); editable(card); }, 0);
    });

    // --- Roles ----------------------------------------------------------------------------
    var roles = form.querySelector('.ldv-roles');
    function roleCards() {
      return [].slice.call(roles.querySelectorAll('.ldv-role'));
    }
    function saveRoles() {
      var names = roleCards().map(function (r) { return r.querySelector('[data-role]').textContent.trim(); }).filter(Boolean);
      saved('[roles]').value = names.join('\n');
      dirty = true;
    }
    function addRemove(card) {
      var x = document.createElement('button');
      x.type = 'button';
      x.className = 'ldv-edit-del';
      x.title = 'Xoá vai trò này';
      x.textContent = '×';
      x.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (roleCards().length > 1) {
          card.remove();
          saveRoles();
        }
      });
      card.appendChild(x);
    }
    roleCards().forEach(addRemove);
    var add = document.createElement('button');
    add.type = 'button';
    add.className = 'ldv-edit-add';
    add.title = 'Thêm vai trò';
    add.textContent = '+';
    add.addEventListener('click', function () {
      var cards = roleCards();
      var copy = cards[cards.length - 1].cloneNode(true);
      copy.classList.remove('is-on');
      copy.querySelector('input').checked = false;
      copy.querySelector('.ldv-edit-del').remove();
      var name = copy.querySelector('[data-role]');
      name.textContent = 'New role';
      roles.insertBefore(copy, add);
      addRemove(copy);
      editable(copy);
      saveRoles();
      name.focus();
      document.getSelection().selectAllChildren(name);
    });
    roles.appendChild(add);

    // --- Photo ----------------------------------------------------------------------------
    var photo = card.querySelector('.ldv-photo');
    if (photo && window.wp && wp.media) {
      var frame;
      photo.title = 'Bấm để đổi ảnh';
      photo.addEventListener('click', function () {
        frame = frame || wp.media({ title: 'Chọn ảnh cho form', library: { type: 'image' }, multiple: false });
        frame.off('select').on('select', function () {
          var file = frame.state().get('selection').first().toJSON();
          var url = file.sizes && file.sizes.medium_large ? file.sizes.medium_large.url : file.url;
          saved('[photo]').value = url;
          photo.querySelector('img').src = url;
          dirty = true;
        });
        frame.open();
      });
    }

    // Leaving with changes not saved: the browser asks first.
    document.querySelectorAll('.ldv-edit-save input').forEach(function (i) {
      i.addEventListener('input', function () { dirty = true; });
    });
    var save = document.querySelector('.ldv-edit-save');
    if (save) save.addEventListener('submit', function () { dirty = false; });
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
