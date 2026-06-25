/* Taj Al Sukun — Coming Soon gate
   ============================================================
   Loaded SYNCHRONOUSLY in <head> of public pages (NOT admin pages, NOT
   coming-soon.html). When the site is in "coming soon" mode, visitors are
   redirected to coming-soon.html. Owners toggle the mode from
   admin → Settings → Website. The flag lives in the public-readable
   `settings` table (key = "coming_soon", value = { enabled: true|false }).

   Notes:
   • Cache-first (60s) so repeat loads are instant; a 2.5s failsafe + fetch
     errors always FAIL OPEN (reveal the real site) so the site is never
     stuck blank.
   • JS-disabled browsers never run the hide, so they see the live site.
   • Owner preview: ?live=1 (or localStorage taj-cs-bypass="1") skips the gate. */
(function () {
  'use strict';
  var SB_URL = 'https://vrljiousxfvjvkhkftwt.supabase.co';
  var SB_KEY = 'sb_publishable_u6kMuxYz8psWu1sA_DDQgg_ylMOC_Uj';
  var CACHE_MS = 60000;
  var BYPASS = 'taj-cs-bypass';
  var doc = document.documentElement;

  // Owner preview / shareable live link.
  try { if (/[?&]live=1\b/.test(location.search)) localStorage.setItem(BYPASS, '1'); } catch (e) {}
  try { if (localStorage.getItem(BYPASS) === '1') return; } catch (e) {}

  function reveal() { doc.style.visibility = ''; }
  function go() { location.replace('coming-soon.html'); }

  // Hide until resolved. (Done in JS, so no-JS browsers fail open to the site.)
  doc.style.visibility = 'hidden';
  var done = false;
  var failsafe = setTimeout(function () { if (!done) { done = true; reveal(); } }, 2500);

  function decide(on) {
    if (done) return;
    done = true;
    clearTimeout(failsafe);
    try { localStorage.setItem('taj-cs', JSON.stringify({ on: !!on, t: Date.now() })); } catch (e) {}
    if (on) go(); else reveal();
  }

  // Cache-first for snappy navigation.
  try {
    var c = JSON.parse(localStorage.getItem('taj-cs') || 'null');
    if (c && typeof c.on === 'boolean' && (Date.now() - c.t) < CACHE_MS) { decide(c.on); return; }
  } catch (e) {}

  // Fetch the flag from the public-readable settings table.
  try {
    fetch(SB_URL + '/rest/v1/settings?key=eq.coming_soon&select=value', {
      headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY }
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (rows) {
        var v = rows && rows[0] && rows[0].value;
        decide(v === true || (v && v.enabled === true));
      })
      .catch(function () { decide(false); });
  } catch (e) { decide(false); }
})();
