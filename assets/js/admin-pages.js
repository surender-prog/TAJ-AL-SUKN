/* Taj Al Sukun — Website Pages CMS (admin tab)
   ============================================================
   Drives #tab-website in admin.html. Renders the editor for the
   currently selected page, loads its content from TajData.settings,
   and saves with TajData.settings.set('page-<slug>', value).

   The shape per page is defined in SCHEMA below; it mirrors the
   defaults shipped in page-cms.js. Adding a new field is a 1-place
   change here — admin gets the editor + the loader handles it.
*/
(function () {
  'use strict';

  // ----------------------------- schema -----------------------------
  // What fields each page exposes to the editor. Field types: text,
  // textarea, image, link, hidden. The "block" field name groups them
  // visually in the editor.
  // Reusable field shapes
  const F = {
    eyebrow:  { key:'eyebrow',  label:'Eyebrow',   type:'text' },
    headline: (rows=2) => ({ key:'title', label:'Heading', type:'textarea', rows, hint:'Wrap a word in *…* for italic accent. e.g. "Immerse *yourself*"' }),
    titleT:   { key:'title',    label:'Heading',   type:'text' },
    subtitle: { key:'subtitle', label:'Subheading',type:'textarea', rows:3 },
    body:     (rows=4) => ({ key:'body', label:'Body', type:'textarea', rows }),
    image:    (label='Background image') => ({ key:'image', label, type:'image' }),
    button:   { key:'button',   label:'Button label', type:'text' },
    quote:    { key:'quote',    label:'Quote (full text — wrap accent in *…*)', type:'textarea', rows:3 },
    by:       { key:'by',       label:'Attribution', type:'text' }
  };

  const heroBlock = (rows=2) => ({
    id: 'hero', title: 'Hero',
    fields: [ F.eyebrow, F.headline(rows), F.subtitle, F.image() ]
  });

  const SCHEMA = {
    'page-home': {
      title: 'Home page',
      preview: 'index.html',
      blocks: [
        heroBlock(2),
        { id: 'loving', title: 'Loving Through Touch (overlay card)',
          fields: [ F.titleT, F.body(3), F.image('Section image') ] },
        { id: 'stress', title: 'Stress fades · harmony begins',
          fields: [ F.headline(2), F.body(4) ] },
        { id: 'benefits', title: 'Massage benefits — heading',
          fields: [ F.headline(2) ] },
        { id: 'welcome', title: 'Welcome editorial (01)',
          fields: [ F.eyebrow, F.titleT, F.body(5) ] },
        { id: 'treatments', title: 'Signature Treatments — heading',
          fields: [ F.eyebrow, F.headline(2) ] },
        { id: 'after', title: "After Your Visit — section head",
          fields: [ F.eyebrow, F.headline(2) ] },
        { id: 'philosophy', title: 'Philosophy quote',
          fields: [ F.quote, F.by ] },
        { id: 'founder', title: 'Founder / Director card',
          fields: [
            F.eyebrow,
            { key:'name', label:'Name', type:'text' },
            { key:'role', label:'Role', type:'text' },
            F.quote,
            F.image('Portrait')
          ] },
        { id: 'testimonials', title: 'Testimonials — section head',
          fields: [ F.eyebrow, F.headline(2) ] },
        { id: 'pricing', title: 'Pricing / Memberships — section head',
          fields: [ F.eyebrow, F.headline(2) ] },
        { id: 'offer', title: '10% off welcome banner',
          fields: [ F.eyebrow, F.headline(2), F.body(3), F.button ] },
        { id: 'cta', title: 'Closing CTA',
          fields: [ F.eyebrow, F.headline(2), F.body(3), F.button ] }
      ]
    },
    'page-about': {
      title: 'About page',
      preview: 'about.html',
      blocks: [
        heroBlock(2),
        { id: 'story', title: 'Story / Beginnings',
          fields: [ F.eyebrow, F.headline(2), F.body(5) ] },
        { id: 'quote', title: 'Philosophy quote',
          fields: [ F.quote, F.by ] },
        { id: 'values', title: 'Our Values — section head',
          fields: [ F.eyebrow, F.headline(2) ] },
        { id: 'team', title: 'Team — section head',
          fields: [ F.eyebrow, F.headline(2), F.body(3) ] },
        { id: 'cta', title: 'Closing CTA',
          fields: [ F.eyebrow, F.headline(2), F.body(3), F.button ] }
      ]
    },
    'page-services': {
      title: 'Services page',
      preview: 'services.html',
      blocks: [
        heroBlock(2),
        { id: 'intro', title: 'Browse the Menu — heading',
          fields: [ F.eyebrow, F.headline(2) ] },
        { id: 'quote', title: 'Spa Director quote',
          fields: [ F.quote, F.by ] },
        { id: 'packages', title: 'Curated Packages — heading',
          fields: [ F.eyebrow, F.headline(2), F.body(2) ] },
        { id: 'cta', title: 'Closing CTA',
          fields: [ F.eyebrow, F.headline(2), F.body(3), F.button ] }
      ],
      footnote: 'Service cards (Royal Hammam, Deep Tissue, etc.) are managed in <a href="#sg-services">Settings → Services Master</a>.'
    },
    'page-gallery': {
      title: 'Gallery page',
      preview: 'gallery.html',
      blocks: [
        heroBlock(2),
        { id: 'intro', title: 'Visual Journey — heading',
          fields: [ F.eyebrow, F.headline(2), { key:'body', label:'Hint text', type:'text' } ] },
        { id: 'quote', title: 'Closing quote',
          fields: [ F.quote, F.by ] },
        { id: 'instagram', title: 'Instagram CTA',
          fields: [ F.eyebrow, F.headline(2), F.body(2), { key:'handle', label:'Instagram handle', type:'text' } ] }
      ]
    },
    'page-membership': {
      title: 'Membership page',
      preview: 'membership.html',
      blocks: [
        heroBlock(2),
        { id: 'intro', title: 'Three Tiers · One Sanctuary',
          fields: [ F.eyebrow, F.headline(2), F.body(4) ] },
        { id: 'compare', title: 'Compare All Tiers — heading',
          fields: [ F.eyebrow, F.headline(2) ] },
        { id: 'portal', title: 'Member Portal preview — heading',
          fields: [ F.eyebrow, F.headline(2), F.body(3) ] },
        { id: 'process', title: 'How Membership Works — heading',
          fields: [ F.eyebrow, F.headline(2) ] },
        { id: 'quote', title: 'Member quote',
          fields: [ F.quote, F.by ] },
        { id: 'cta', title: 'Closing CTA',
          fields: [ F.eyebrow, F.headline(2), F.body(3), F.button ] }
      ],
      footnote: 'Tier prices, benefits, and discount % live in <a href="#sg-tiers">Settings → Tiers</a>.'
    },
    'page-contact': {
      title: 'Contact page',
      preview: 'contact.html',
      blocks: [
        heroBlock(2),
        { id: 'visit', title: 'Find Us — visit section',
          fields: [ F.eyebrow, F.headline(2), F.body(3) ] },
        { id: 'cta', title: 'WhatsApp shortcut',
          fields: [ F.eyebrow, F.headline(2), F.body(3), F.button ] }
      ],
      footnote: 'Address / phone / hours show in the footer — edit them once under <strong>Footer (global)</strong>.'
    },
    'page-footer': {
      title: 'Footer (appears on every page)',
      preview: 'index.html',
      blocks: [
        { id: 'brand', title: 'Brand block',
          fields: [ { key:'tagline', label:'Tagline', type:'textarea', rows:3 } ] },
        { id: 'contact', title: 'Contact details',
          fields: [
            { key: 'address',  label: 'Address (use <br> for new lines)', type: 'textarea', rows: 3 },
            { key: 'phone',    label: 'Phone',         type: 'text' },
            { key: 'whatsapp', label: 'WhatsApp',      type: 'text' },
            { key: 'email',    label: 'Email',         type: 'text' },
            { key: 'hours',    label: 'Opening hours', type: 'text' }
          ] }
      ]
    }
  };

  // ----------------------------- image library -----------------------
  const IMAGE_LIBRARY = [
    'assets/images/spa-foyer.jpg',
    'assets/images/sanctuary-bed.jpg',
    'assets/images/spa-corridor.jpg',
    'assets/images/spa-detail-1.jpg',
    'assets/images/spa-detail-2.jpg',
    'assets/images/reception-desk.jpg',
    'assets/images/treatment-room.jpg',
    'assets/images/deep-tissue.jpg',
    'assets/images/couples-massage.jpg',
    'assets/images/therapist-products.jpg',
    'assets/images/therapist-prep.jpg',
    'assets/images/spa-relax-1.jpg',
    'assets/images/spa-relax-2.jpg',
    'assets/images/spa-relax-3.jpg',
    'assets/images/lounge-flowers.jpg',
    'assets/images/lobby-table.jpg',
    'assets/images/waiting-lounge.jpg',
    'assets/images/products-shelf.jpg',
    'assets/images/team-reception.jpg',
    'assets/images/spa-entrance.jpg',
    'assets/images/spa-exterior.jpg',
    'assets/images/exterior-front.jpg'
  ];

  // ----------------------------- state ------------------------------
  let currentKey = 'page-home';
  let workingContent = {}; // copy of the current page being edited (unsaved)
  let originalContent = {}; // last-saved state (for revert)

  // ----------------------------- helpers ----------------------------
  function defaultsFor(key) {
    return (window.TAJ_PAGE_DEFAULTS && window.TAJ_PAGE_DEFAULTS[key]) || {};
  }
  // Deep-merge default + saved so newer fields auto-appear if defaults are extended
  function deepMerge(base, over) {
    if (over == null) return JSON.parse(JSON.stringify(base || {}));
    if (typeof base !== 'object' || typeof over !== 'object') return over;
    const out = Object.assign({}, base);
    for (const k of Object.keys(over)) {
      if (over[k] !== null && typeof over[k] === 'object' && !Array.isArray(over[k])) {
        out[k] = deepMerge(base?.[k] || {}, over[k]);
      } else {
        out[k] = over[k];
      }
    }
    return out;
  }
  function escHTML(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]);
  }
  function get(obj, path) {
    return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
  }
  function set(obj, path, value) {
    const parts = path.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const k = parts[i];
      if (cur[k] == null || typeof cur[k] !== 'object') cur[k] = {};
      cur = cur[k];
    }
    cur[parts[parts.length - 1]] = value;
  }

  // ----------------------------- renderer ---------------------------
  function renderField(block, field) {
    const path = block.id + '.' + field.key;
    const val  = get(workingContent, path) || '';
    const id   = 'cms-f-' + block.id + '-' + field.key;
    let input;
    switch (field.type) {
      case 'textarea':
        input = `<textarea id="${id}" data-path="${path}" rows="${field.rows || 3}">${escHTML(val)}</textarea>`;
        break;
      case 'image': {
        const safe = escHTML(val);
        const bg = safe ? `style="background-image:url('${safe.replace(/'/g, "\\'")}')"` : '';
        input = `
          <div class="cms-field-image">
            <button type="button" class="cms-image-thumb" data-pick="${path}" ${bg} title="Click to change">
              ${val ? '' : '<i class="far fa-image"></i><span>Pick an image</span>'}
            </button>
            <input type="text" id="${id}" data-path="${path}" value="${safe}" placeholder="assets/images/… or https://…" class="cms-image-url">
          </div>`;
        break;
      }
      case 'text':
      default:
        input = `<input type="text" id="${id}" data-path="${path}" value="${escHTML(val)}">`;
    }
    const hint = field.hint ? `<small class="cms-field-hint">${field.hint}</small>` : '';
    return `
      <div class="cms-field">
        <label for="${id}">${escHTML(field.label)}</label>
        ${input}
        ${hint}
      </div>`;
  }
  function renderBlock(block) {
    return `
      <section class="cms-block" data-block="${block.id}">
        <header class="cms-block__head">
          <h4>${escHTML(block.title)}</h4>
          <span class="cms-block__id">${block.id}</span>
        </header>
        <div class="cms-block__body">
          ${block.fields.map(f => renderField(block, f)).join('')}
        </div>
      </section>`;
  }
  function renderEditor() {
    const def = SCHEMA[currentKey];
    if (!def) return;
    document.getElementById('cms-current-eyebrow').textContent = 'EDITING';
    document.getElementById('cms-current-title').textContent   = def.title;
    document.getElementById('cms-preview-link').href = def.preview || '#';

    const sections = document.getElementById('cms-sections');
    let html = def.blocks.map(renderBlock).join('');
    if (def.footnote) html += `<p class="cms-footnote"><i class="fas fa-info-circle"></i> ${def.footnote}</p>`;
    sections.innerHTML = html;

    // Wire field inputs → workingContent
    sections.querySelectorAll('[data-path]').forEach(el => {
      el.addEventListener('input', () => {
        set(workingContent, el.dataset.path, el.value);
        // For image fields, also live-update the thumbnail
        if (el.classList.contains('cms-image-url')) {
          const wrap = el.closest('.cms-field-image');
          const thumb = wrap?.querySelector('.cms-image-thumb');
          if (thumb) {
            const v = el.value.trim();
            thumb.style.backgroundImage = v ? `url('${v.replace(/'/g, "\\'")}')` : '';
            thumb.innerHTML = v ? '' : '<i class="far fa-image"></i><span>Pick an image</span>';
          }
        }
      });
    });

    // Image picker triggers
    sections.querySelectorAll('[data-pick]').forEach(btn => {
      btn.addEventListener('click', () => openPicker(btn.dataset.pick));
    });
  }

  async function loadPage(key) {
    currentKey = key;
    const saved = await (window.TajData?.settings?.get(key) || Promise.resolve(null));
    originalContent = deepMerge(defaultsFor(key), saved || {});
    workingContent  = JSON.parse(JSON.stringify(originalContent));
    renderEditor();
  }

  // ----------------------------- image picker -----------------------
  const picker = document.getElementById('cms-img-picker');
  let pickerTarget = null;

  function openPicker(path) {
    pickerTarget = path;
    const grid = document.getElementById('cms-img-grid');
    grid.innerHTML = IMAGE_LIBRARY.map(src => `
      <button type="button" class="cms-img-tile" data-img="${src}" title="${src.split('/').pop()}">
        <img src="${src}" alt="" loading="lazy">
        <small>${src.split('/').pop()}</small>
      </button>`).join('');
    grid.querySelectorAll('[data-img]').forEach(b => {
      b.addEventListener('click', () => applyImage(b.dataset.img));
    });
    document.getElementById('cms-img-url').value = '';
    picker.hidden = false;
  }
  function closePicker() { picker.hidden = true; pickerTarget = null; }
  function applyImage(src) {
    if (!pickerTarget || !src) return;
    set(workingContent, pickerTarget, src);
    // Update the matching input + thumb
    const input = document.querySelector(`[data-path="${pickerTarget}"]`);
    if (input) input.value = src;
    const thumb = input?.closest('.cms-field-image')?.querySelector('.cms-image-thumb');
    if (thumb) {
      thumb.style.backgroundImage = `url('${src.replace(/'/g, "\\'")}')`;
      thumb.innerHTML = '';
    }
    closePicker();
  }
  document.getElementById('cms-img-close')?.addEventListener('click', closePicker);
  document.getElementById('cms-img-use')?.addEventListener('click', () => {
    const v = document.getElementById('cms-img-url').value.trim();
    if (v) applyImage(v);
  });
  picker?.addEventListener('click', e => { if (e.target === picker) closePicker(); });

  // ----------------------------- save / revert / reset --------------
  async function save() {
    const btn = document.getElementById('cms-save');
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';
    try {
      if (window.TajData?.settings) {
        await TajData.settings.set(currentKey, workingContent);
      } else {
        const all = JSON.parse(localStorage.getItem('taj-settings') || '{}');
        all[currentKey] = workingContent;
        localStorage.setItem('taj-settings', JSON.stringify(all));
      }
      if (window.TajData?.activity) {
        await TajData.activity.log({
          type: 'note',
          title: 'Website page updated',
          desc:  (SCHEMA[currentKey]?.title || currentKey) + ' content edited',
          ref:   currentKey,
          refType: 'page'
        });
      }
      originalContent = JSON.parse(JSON.stringify(workingContent));
      btn.innerHTML = '<i class="fas fa-check"></i> Saved';
      setTimeout(() => { btn.innerHTML = original; btn.disabled = false; }, 1400);
      if (typeof showToast === 'function') showToast('Saved — live on the website now');
    } catch (e) {
      console.warn('[cms] save failed:', e);
      btn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error';
      setTimeout(() => { btn.innerHTML = original; btn.disabled = false; }, 1800);
    }
  }
  function revert() {
    workingContent = JSON.parse(JSON.stringify(originalContent));
    renderEditor();
    if (typeof showToast === 'function') showToast('Reverted to last saved state');
  }
  async function resetAll() {
    if (!confirm('Reset every page back to the shipped defaults?\nThis clears every CMS edit you have ever made.')) return;
    const keys = Object.keys(SCHEMA);
    for (const k of keys) {
      try {
        if (window.TajData?.settings) {
          await TajData.settings.set(k, defaultsFor(k));
        } else {
          const all = JSON.parse(localStorage.getItem('taj-settings') || '{}');
          all[k] = defaultsFor(k);
          localStorage.setItem('taj-settings', JSON.stringify(all));
        }
      } catch (_) {}
    }
    await loadPage(currentKey);
    if (typeof showToast === 'function') showToast('All pages reset to defaults');
  }

  // ----------------------------- page-list nav ----------------------
  document.querySelectorAll('.cms-page').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.cms-page').forEach(x => x.classList.remove('is-active'));
      btn.classList.add('is-active');
      await loadPage(btn.dataset.page);
    });
  });
  document.getElementById('cms-save')?.addEventListener('click', save);
  document.getElementById('cms-revert')?.addEventListener('click', revert);
  document.getElementById('cms-reset-all')?.addEventListener('click', resetAll);

  // ----------------------------- boot -------------------------------
  // Init once the website tab actually exists in the DOM
  function boot() {
    if (!document.getElementById('cms-sections')) return;
    loadPage(currentKey);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
