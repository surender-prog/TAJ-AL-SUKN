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
  var DICT  = window.TAJ_I18N || { ui: {}, cms: {} };
  var UI    = DICT.ui  || {};
  var CMS   = DICT.cms || {};

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
    '.numlabel .lbl'
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
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.TajLang = { set: function (l) { apply(l, true); }, current: lang };
})();
