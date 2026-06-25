/* Taj Al Sukun — Coming Soon toggle (admin → Settings → Website)
   Reads/writes the public `settings.coming_soon` flag ({ enabled: bool }).
   The public site's coming-soon-gate.js reads the same flag. */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var toggle = document.getElementById('cs-toggle');
    var badge = document.getElementById('cs-badge');
    if (!toggle || !badge) return;

    function paint(on) {
      toggle.checked = !!on;
      badge.textContent = on ? 'Coming Soon' : 'Live';
      badge.className = 'badge-status ' + (on ? 'cancel' : 'ok');
    }

    function toast(msg) {
      if (window.TajAdmin && TajAdmin.toast) TajAdmin.toast(msg);
    }

    async function load() {
      var on = false;
      try {
        if (window.TajData && TajData.settings) {
          var v = await TajData.settings.get('coming_soon');
          on = v === true || (v && v.enabled === true);
        }
      } catch (e) { /* default off */ }
      paint(on);
    }

    toggle.addEventListener('change', async function () {
      var on = toggle.checked;
      paint(on);
      toggle.disabled = true;
      try {
        if (!(window.TajData && TajData.settings)) throw new Error('Not connected.');
        await TajData.settings.set('coming_soon', { enabled: on });
        // Keep this browser's gate cache in step so the owner sees it immediately.
        try { localStorage.setItem('taj-cs', JSON.stringify({ on: on, t: Date.now() })); } catch (e) {}
        toast(on
          ? 'Coming Soon is ON — visitors now see the Opening Soon page.'
          : 'Website is LIVE — visitors now see the full site.');
      } catch (e) {
        paint(!on);  // revert on failure
        toast('Could not save: ' + (e.message || e));
      } finally {
        toggle.disabled = false;
      }
    });

    // Wait for the data layer to be ready, then load current state.
    var tries = 0;
    (function wait() {
      if (window.TajData || tries > 30) { load(); return; }
      tries++; setTimeout(wait, 200);
    })();
  });
})();
