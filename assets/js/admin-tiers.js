/* Taj Al Sukun — Membership Tiers editor (admin → Settings → Tiers)
   ============================================================
   Loads/saves the shared `membership_tiers` setting (public-readable) so the
   public Membership page reflects edits. Replaces the old inert
   "Save Changes" (which only showed a toast and persisted nothing). */
(function () {
  'use strict';
  var FIELDS = ['price', 'discount', 'massages', 'hammams', 'foot', 'guest', 'priority'];

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var editor = document.querySelector('#sg-tiers .tier-editor');
    var btn = document.getElementById('save-tiers');
    if (!editor || !btn) return;
    var cards = Array.prototype.slice.call(editor.querySelectorAll('[data-tier]'));
    var flash = document.getElementById('tiers-saved-flash');
    var input = function (card, f) { return card.querySelector('[data-tf="' + f + '"]'); };

    function fill(saved) {
      var byTier = {};
      (saved && Array.isArray(saved.tiers) ? saved.tiers : []).forEach(function (t) {
        byTier[String(t.tier || t.id || '').toLowerCase()] = t;
      });
      cards.forEach(function (card) {
        var t = byTier[card.dataset.tier];
        if (!t) return;
        FIELDS.forEach(function (f) {
          var el = input(card, f);
          if (el && t[f] != null && t[f] !== '') el.value = t[f];
        });
      });
    }

    function collect() {
      return {
        tiers: cards.map(function (card) {
          var id = card.dataset.tier;
          var o = { id: id, tier: id.charAt(0).toUpperCase() + id.slice(1), name: ((card.querySelector('.name') || {}).textContent || '').trim() };
          FIELDS.forEach(function (f) { var el = input(card, f); o[f] = el ? (parseInt(el.value, 10) || 0) : 0; });
          return o;
        })
      };
    }

    // Load saved values (fall back to the HTML defaults if none saved yet).
    var tries = 0;
    (function wait() {
      if (window.TajData || tries > 30) {
        (async function () {
          try {
            if (window.TajData && TajData.settings) {
              var v = await TajData.settings.get('membership_tiers');
              if (v) fill(v);
            }
          } catch (e) { /* keep HTML defaults */ }
        })();
        return;
      }
      tries++; setTimeout(wait, 200);
    })();

    btn.addEventListener('click', async function () {
      var old = btn.innerHTML;
      btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';
      try {
        if (!(window.TajData && TajData.settings)) throw new Error('Not connected to Supabase.');
        await TajData.settings.set('membership_tiers', collect());
        if (flash) { flash.style.display = ''; setTimeout(function () { flash.style.display = 'none'; }, 4000); }
        if (window.TajAdmin && TajAdmin.toast) TajAdmin.toast('Membership tiers saved — the public page is updated.');
      } catch (e) {
        if (window.TajAdmin && TajAdmin.toast) TajAdmin.toast('Save failed: ' + (e.message || e));
        else alert('Save failed: ' + (e.message || e));
      } finally {
        btn.disabled = false; btn.innerHTML = old;
      }
    });
  });
})();
