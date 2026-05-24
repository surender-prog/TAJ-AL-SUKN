/* Taj Al Sukun — Bilingual (EN / AR) layer
   ============================================================
   Professional Arabic + RTL with a persisted EN/AR toggle.

   How it works:
   - Page CONTENT reuses the existing data-cms keys (and optional data-i18n
     keys). Arabic values live in TAJ_I18N.cms, keyed identically. We swap
     innerHTML and cache the English in data-en so toggling back is lossless.
   - Shared CHROME (nav links, buttons, footer) is translated by matching the
     visible English text against TAJ_I18N.ui, replacing only TEXT nodes so
     icons (<i>) are preserved. A reverse map restores English.
   - Missing translations fall back to English (the site never half-breaks).
   - <html dir="rtl" lang="ar"> drives the RTL layout (see style.css rules).
   - Preference persists in localStorage and re-applies on every page.
*/
(function () {
  'use strict';

  var STORE = 'taj-lang';
  var DICT  = window.TAJ_I18N || { ui: {}, cms: {}, services: {} };
  var UI    = DICT.ui  || {};
  var CMS   = DICT.cms || {};
  var SVCS  = DICT.services || {};

  // reverse UI map (Arabic -> English) for restoring
  var UI_REV = {};
  Object.keys(UI).forEach(function (en) { UI_REV[UI[en]] = en; });

  function lang()      { try { return localStorage.getItem(STORE) || 'en'; } catch (_) { return 'en'; } }
  function setLang(l)  { try { localStorage.setItem(STORE, l); } catch (_) {} }

  // ---- CONTENT (data-cms / data-i18n): innerHTML swap, cached in data-en ----
  function translateContent(toArabic) {
    var els = document.querySelectorAll('[data-cms], [data-i18n]');
    els.forEach(function (el) {
      // skip image/background carriers
      var prop = el.getAttribute('data-cms-prop');
      if (prop === 'bg' || prop === 'src') return;
      var key = el.getAttribute('data-i18n') || el.getAttribute('data-cms');
      if (toArabic) {
        if (CMS[key] == null) return;            // no Arabic → leave English
        // Capture the CURRENT English each time (it may have just been (re)set
        // by page-cms after its async Supabase fetch), so EN-restore is accurate
        // and a late CMS overwrite doesn't strand us in English.
        if (el.innerHTML !== CMS[key]) el.setAttribute('data-en', el.innerHTML);
        el.innerHTML = CMS[key];
      } else if (el.getAttribute('data-en') != null) {
        el.innerHTML = el.getAttribute('data-en');
      }
    });
  }

  // ---- CHROME: replace matching TEXT nodes only (keeps icons) ----
  var UI_SEL = [
    '.nav__menu a', '.nav__signin', '.nav__member-name',
    '.btn', 'button.tab', '.svc-row__name h5',
    '.footer__col a', '.footer__col h6', '.footer__col h5',
    '.crumb span', '.crumb a', '.step__label', '.eyebrow',
    // forms & deeper labels
    '.field label', '.field-label', 'select option', '.form-card h3',
    '.pick .info h6', '.pick .info span',
    '.member-toggle__head .label', '.member-banner__hello',
    '.info-card h5', '.info-card p', '.day', '.time', '.closed-lbl',
    '.numlabel .lbl', '.mtier__tier', '.svc-card .tag', '.compare th',
    '.s-head p', '.hours h4',
    // home deeper sections + testimonials
    '.numbento__cell h5', '.numbento__cell p',
    '.plan__name', '.plan__list li',
    '.testi p', '.testi__by span',
    // misc
    '.svc-row__name p',
    // about values + team list items
    '.value h4', '.value p', '.editorial__copy ul li',
    // member portal
    '.portal-stat__lbl', '.portal-tabnav__btn',
    '.portal-hero__id-label', '.portal-hero__action', '#hero-tagline',
    '.portal-bookings__head h2', '.portal-bookings-tabs button',
    // signup wizard
    '.wizard-step__label', '.wizard-panel__head h2',
    // membership comparison table cells
    '.compare td', '.compare th', '.compare td strong'
  ].join(',');

  function translateChrome(toArabic) {
    var map = toArabic ? UI : UI_REV;
    var nodes = document.querySelectorAll(UI_SEL);
    nodes.forEach(function (el) {
      el.childNodes.forEach(function (n) {
        if (n.nodeType !== 3) return;            // text nodes only
        var raw = n.nodeValue;
        var t = raw.trim();
        if (!t) return;
        if (map[t] != null) n.nodeValue = raw.replace(t, map[t]);
      });
    });
  }

  // Lazy-load Arabic fonts (Amiri for headings, Tajawal for body) on first AR use.
  function ensureArabicFonts() {
    if (document.getElementById('taj-ar-fonts')) return;
    var link = document.createElement('link');
    link.id = 'taj-ar-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@300;400;500;700&display=swap';
    document.head.appendChild(link);
  }

  // Service cards (.svc-card on Services page) and the booking service picker
  // (.pick on Booking page) are rendered dynamically by main.js from the
  // services table. Translate them by matching the English name against
  // TAJ_I18N.services. Caches in data-en-name / data-en-desc.
  function translateServiceCards(toArabic) {
    // Cards (services page)
    document.querySelectorAll('.svc-card').forEach(function (card) {
      var h = card.querySelector('h4');
      var p = card.querySelector('p');
      if (!h) return;
      var englishName = h.getAttribute('data-en-name') || h.textContent.trim();
      var sv = SVCS[englishName];
      if (!sv) return;
      if (toArabic) {
        if (!h.hasAttribute('data-en-name')) h.setAttribute('data-en-name', h.textContent);
        if (sv.name) h.textContent = sv.name;
        if (p && sv.desc) {
          if (!p.hasAttribute('data-en-desc')) p.setAttribute('data-en-desc', p.textContent);
          p.textContent = sv.desc;
        }
      } else {
        if (h.hasAttribute('data-en-name')) h.textContent = h.getAttribute('data-en-name');
        if (p && p.hasAttribute('data-en-desc')) p.textContent = p.getAttribute('data-en-desc');
      }
    });
    // Booking picker labels (.pick .info h6)
    document.querySelectorAll('.pick .info h6').forEach(function (h) {
      var englishName = h.getAttribute('data-en-name') || h.textContent.trim();
      var sv = SVCS[englishName];
      if (!sv) return;
      if (toArabic) {
        if (!h.hasAttribute('data-en-name')) h.setAttribute('data-en-name', h.textContent);
        if (sv.name) h.textContent = sv.name;
      } else if (h.hasAttribute('data-en-name')) {
        h.textContent = h.getAttribute('data-en-name');
      }
    });
  }

  // Placeholders aren't text nodes — translate them separately.
  function translatePlaceholders(toArabic) {
    var map = toArabic ? UI : UI_REV;
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(function (el) {
      var cur = el.getAttribute('placeholder') || '';
      var t = cur.trim();
      if (!t) return;
      if (map[t] != null) {
        if (!el.hasAttribute('data-en-placeholder')) el.setAttribute('data-en-placeholder', cur);
        el.setAttribute('placeholder', map[t]);
      }
    });
  }

  function apply(l, persist) {
    var root = document.documentElement;
    var toAr = (l === 'ar');
    if (toAr) ensureArabicFonts();
    root.setAttribute('lang', toAr ? 'ar' : 'en');
    root.setAttribute('dir',  toAr ? 'rtl' : 'ltr');
    root.classList.toggle('is-rtl', toAr);
    translateContent(toAr);
    translateChrome(toAr);
    translatePlaceholders(toAr);
    translateServiceCards(toAr);
    if (persist) setLang(l);
    // reflect on every toggle button
    document.querySelectorAll('[data-lang-toggle]').forEach(function (b) {
      b.setAttribute('aria-label', toAr ? 'التبديل إلى الإنجليزية' : 'Switch to Arabic');
      var lbl = b.querySelector('.lang-label');
      if (lbl) lbl.textContent = toAr ? 'EN' : 'ع';
    });
  }

  // ---- Inject the toggle into the nav (every page) ----
  function injectToggle() {
    var cta = document.querySelector('.nav__cta');
    if (!cta || cta.querySelector('[data-lang-toggle]')) return;
    var btn = document.createElement('button');
    btn.className = 'lang-toggle';
    btn.setAttribute('data-lang-toggle', '');
    btn.type = 'button';
    btn.innerHTML = '<i class="fas fa-globe"></i> <span class="lang-label">ع</span>';
    btn.addEventListener('click', function () {
      apply(lang() === 'ar' ? 'en' : 'ar', true);
    });
    // place before the Reserve button if present, else append
    var reserve = cta.querySelector('.btn--primary');
    if (reserve) cta.insertBefore(btn, reserve); else cta.appendChild(btn);
  }

  // Pull Arabic overrides the admin saved in Supabase (key: page-X_ar).
  // Each row's JSON value mirrors the English page-X shape; we fold the
  // dotted paths back into CMS[] so translations admin-saves take effect.
  async function loadRemoteOverrides() {
    if (!window.TajData || !window.TajData._sb) return;
    const needed = new Set(['page-footer']);
    document.querySelectorAll('[data-cms],[data-i18n]').forEach(function (el) {
      const k = el.getAttribute('data-cms') || el.getAttribute('data-i18n') || '';
      const dot = k.indexOf('.');
      if (dot > 0) needed.add(k.slice(0, dot));
    });
    const arKeys = Array.from(needed).map(function (k) { return k + '_ar'; });
    try {
      const { data } = await window.TajData._sb
        .from('settings').select('key,value').in('key', arKeys);
      (data || []).forEach(function (row) {
        if (!row.value || typeof row.value !== 'object') return;
        const pageKey = row.key.replace(/_ar$/, '');
        (function walk(val, prefix) {
          Object.keys(val).forEach(function (k) {
            const v = val[k];
            const newKey = prefix + '.' + k;
            if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, newKey);
            else if (typeof v === 'string' && v.trim()) CMS[newKey] = v;
          });
        })(row.value, pageKey);
      });
    } catch (_) { /* offline / RLS / not connected — keep hardcoded defaults */ }
  }

  function boot() {
    injectToggle();
    apply(lang(), false); // sets dir + translates + correct toggle label
    // page-cms.js patches data-cms content AFTER its async Supabase fetch.
    // Re-translate whenever it signals completion so Arabic isn't clobbered.
    document.addEventListener('taj-cms-applied', function () {
      if (lang() === 'ar') apply('ar', false);
    });
    // Safety net in case the event is missed (e.g. offline / no page-cms).
    if (lang() === 'ar') {
      window.addEventListener('load', function () { setTimeout(function () { apply('ar', false); }, 400); });
    }
    // Pull admin-saved Arabic overrides (page-X_ar) and re-translate when done.
    if (window.TajData && typeof window.TajData.ready === 'function') {
      window.TajData.ready().then(loadRemoteOverrides).then(function () {
        if (lang() === 'ar') apply('ar', false);
      });
    } else {
      loadRemoteOverrides().then(function () { if (lang() === 'ar') apply('ar', false); });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.TajLang = { set: function (l) { apply(l, true); }, current: lang };
})();
