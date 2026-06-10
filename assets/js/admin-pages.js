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
        { id: 'marquee', title: 'Marquee strip (scrolling treatment names)',
          fields: [
            { key:'items', label:'Marquee items (one per line)', type:'textarea', rows:8, hint:'One short label per line. They scroll across the top of the home page. Add or remove freely.' }
          ] },
        { id: 'loving', title: 'Loving Through Touch (overlay card)',
          fields: [ F.titleT, F.body(3), F.image('Section image') ] },
        { id: 'stress', title: 'Stress fades · harmony begins',
          fields: [ F.headline(2), F.body(4) ] },
        { id: 'benefits', title: 'Massage benefits — heading + cards',
          fields: [
            F.headline(2),
            { key:'c1Title', label:'Card 1 — Title', type:'text' },
            { key:'c1Body',  label:'Card 1 — Body',  type:'textarea', rows:2 },
            { key:'c2Title', label:'Card 2 — Title', type:'text' },
            { key:'c2Body',  label:'Card 2 — Body',  type:'textarea', rows:2 },
            { key:'c3Title', label:'Card 3 — Title', type:'text' },
            { key:'c3Body',  label:'Card 3 — Body',  type:'textarea', rows:2 },
            { key:'c4Title', label:'Card 4 — Title', type:'text' },
            { key:'c4Body',  label:'Card 4 — Body',  type:'textarea', rows:2 },
            { key:'c5Title', label:'Card 5 — Title', type:'text' },
            { key:'c5Body',  label:'Card 5 — Body',  type:'textarea', rows:2 }
          ] },
        { id: 'welcome', title: 'Welcome editorial (01)',
          fields: [
            F.eyebrow, F.titleT, F.body(5),
            { key:'image',  label:'Main image',   type:'image' },
            { key:'accent', label:'Accent image', type:'image' }
          ] },
        { id: 'treatments', title: 'Signature Treatments — section + featured services',
          fields: [
            F.eyebrow, F.headline(2), F.subtitle, F.button,
            { key:'c1Id', label:'Featured Card 1 — Service', type:'serviceSelect' },
            { key:'c2Id', label:'Featured Card 2 — Service', type:'serviceSelect' },
            { key:'c3Id', label:'Featured Card 3 — Service', type:'serviceSelect' },
            { key:'c4Id', label:'Featured Card 4 — Service', type:'serviceSelect' }
          ] },
        { id: 'after', title: "After Your Visit — section + bento",
          fields: [
            F.eyebrow, F.headline(2),
            { key:'c1Title', label:'Card 01 — Title', type:'text' },
            { key:'c1Body',  label:'Card 01 — Body',  type:'textarea', rows:2 },
            { key:'c2Title', label:'Card 02 — Title', type:'text' },
            { key:'c2Body',  label:'Card 02 — Body',  type:'textarea', rows:2 },
            { key:'c3Title', label:'Card 03 — Title', type:'text' },
            { key:'c3Body',  label:'Card 03 — Body',  type:'textarea', rows:2 },
            { key:'c4Title', label:'Card 04 — Title', type:'text' },
            { key:'c4Body',  label:'Card 04 — Body',  type:'textarea', rows:2 },
            { key:'img1', label:'Image 1 — Top left (tall)',  type:'image' },
            { key:'img2', label:'Image 2 — Top center',       type:'image' },
            { key:'img3', label:'Image 3 — Top right (tall)', type:'image' }
          ] },
        { id: 'philosophy', title: 'Philosophy quote',
          fields: [ F.quote, F.by ] },
        { id: 'founder', title: 'Manager section — heading & photo (Home + About)',
          note: 'The heading and photo set here appear on BOTH the Home page and the About page. The name, role, highlights and social links are shared from About → “Leadership (04) — manager profile” and update on both pages automatically.',
          fields: [
            F.eyebrow, F.headline(2),
            { key:'image', label:'Manager photo (Home + About)', type:'image' }
          ] },
        { id: 'cta', title: 'Closing CTA',
          fields: [ F.eyebrow, F.headline(2), F.body(3), F.button ] }
      ]
    },
    'page-about': {
      title: 'About page',
      preview: 'about.html',
      blocks: [
        heroBlock(2),
        { id: 'story', title: 'Our Story (01) — beginnings',
          fields: [
            F.eyebrow, F.headline(2),
            { key:'p1', label:'Paragraph 1', type:'textarea', rows:3 },
            { key:'p2', label:'Paragraph 2', type:'textarea', rows:3 },
            { key:'p3', label:'Paragraph 3', type:'textarea', rows:3, hint:'Wrap a word in *…* for italic accent.' },
            { key:'image',  label:'Main image',   type:'image' },
            { key:'accent', label:'Accent image', type:'image' }
          ] },
        { id: 'mission', title: 'Our Purpose (02) — Mission & Vision',
          fields: [
            F.eyebrow, F.headline(2),
            { key:'missionLine', label:'Mission — italic line', type:'textarea', rows:2 },
            { key:'missionBody', label:'Mission — body',        type:'textarea', rows:3 },
            { key:'visionLine',  label:'Vision — italic line',  type:'textarea', rows:2 },
            { key:'visionBody',  label:'Vision — body',         type:'textarea', rows:3 },
            { key:'image',  label:'Main image',   type:'image' },
            { key:'accent', label:'Accent image', type:'image' }
          ] },
        { id: 'quote', title: 'Philosophy quote',
          fields: [ F.quote, F.by ] },
        { id: 'values', title: 'Our Values — section + 4 cards',
          fields: [
            F.eyebrow, F.headline(2),
            { key:'c1Title', label:'Card 01 — Title', type:'text' },
            { key:'c1Body',  label:'Card 01 — Body',  type:'textarea', rows:2 },
            { key:'c2Title', label:'Card 02 — Title', type:'text' },
            { key:'c2Body',  label:'Card 02 — Body',  type:'textarea', rows:2 },
            { key:'c3Title', label:'Card 03 — Title', type:'text' },
            { key:'c3Body',  label:'Card 03 — Body',  type:'textarea', rows:2 },
            { key:'c4Title', label:'Card 04 — Title', type:'text' },
            { key:'c4Body',  label:'Card 04 — Body',  type:'textarea', rows:2 }
          ] },
        { id: 'meetTeam', title: 'Meet the Team (03) — hands that understand',
          fields: [
            F.eyebrow, F.headline(2),
            { key:'p1', label:'Paragraph 1', type:'textarea', rows:3 },
            { key:'p2', label:'Paragraph 2', type:'textarea', rows:3 },
            { key:'bullet1', label:'Checklist bullet 1', type:'text' },
            { key:'bullet2', label:'Checklist bullet 2', type:'text' },
            { key:'bullet3', label:'Checklist bullet 3', type:'text' },
            { key:'image',  label:'Main image',   type:'image' },
            { key:'accent', label:'Accent image', type:'image' }
          ] },
        { id: 'leadership', title: 'Leadership (04) — manager profile (Home + About)',
          note: 'This profile appears on BOTH the Home page and the About page. The manager PHOTO is set on the Home page → “Manager section — heading & photo”.',
          fields: [
            { key:'name',  label:'Name',                           type:'text' },
            { key:'role',  label:'Role / title',                   type:'text' },
            { key:'years', label:'Experience (e.g., "14 yrs")',    type:'text' },
            { key:'b1', label:'Highlight 1', type:'text' },
            { key:'b2', label:'Highlight 2', type:'text' },
            { key:'b3', label:'Highlight 3', type:'text' },
            { key:'b4', label:'Highlight 4', type:'text' },
            { key:'b5', label:'Highlight 5', type:'text' },
            { key:'b6', label:'Highlight 6', type:'text' },
            { key:'ig', label:'Instagram URL', type:'text' },
            { key:'fb', label:'Facebook URL',  type:'text' },
            { key:'li', label:'LinkedIn URL',  type:'text' },
            { key:'wa', label:'WhatsApp URL',  type:'text' }
          ] },
        { id: 'team', title: 'Trusted & Certified — section + badges',
          fields: [
            F.eyebrow, F.headline(2), F.body(3),
            { key:'b1Label', label:'Badge 1 — Label', type:'text' },
            { key:'b2Label', label:'Badge 2 — Label', type:'text' },
            { key:'b3Label', label:'Badge 3 — Label', type:'text' },
            { key:'b4Label', label:'Badge 4 — Label', type:'text' }
          ] },
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
        { id: 'tiles', title: 'Gallery tiles (20 slots)',
          fields: (() => {
            const out = [];
            for (let n = 1; n <= 20; n++) {
              const k = 't' + (n < 10 ? '0' + n : n);
              out.push({ key: k + 'Image', label: 'Tile ' + (n < 10 ? '0' + n : n) + ' — Image', type: 'image' });
              out.push({ key: k + 'Label', label: 'Tile ' + (n < 10 ? '0' + n : n) + ' — Caption', type: 'text' });
            }
            return out;
          })() },
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
        { id: 'tiersShared', title: 'Membership tiers — shared labels',
          fields: [
            { key:'perksLabel', label:'Perks list header', type:'text', hint:'e.g., "Included Annually"' },
            { key:'badgeText',  label:'Featured badge text', type:'text', hint:'e.g., "Most Popular"' }
          ] },
        { id: 'tierList', title: 'Membership tiers — add / remove / reorder',
          fields: [
            { key:'tiers', label:'Tiers', type:'tierList' }
          ] },
        { id: 'portal', title: 'Member Portal preview — section + card',
          fields: [
            F.eyebrow, F.headline(2),
            { key:'copyTitle', label:'Left column — Heading',  type:'textarea', rows:2, hint:'Wrap with *…* for italic accent.' },
            { key:'copyBody',  label:'Left column — Body',     type:'textarea', rows:3 },
            { key:'bullets',   label:'Left column — Bullets (one per line)', type:'textarea', rows:6 },
            { key:'ctaLabel',  label:'Left column — Button label', type:'text' },
            { key:'cardName',   label:'Card — Member name',   type:'text' },
            { key:'cardJoined', label:'Card — "Member since"', type:'text' },
            { key:'cardTier',   label:'Card — Tier badge',    type:'text' },
            { key:'idLabel',    label:'Card — ID label',      type:'text' },
            { key:'cardId',     label:'Card — Member ID',     type:'text' },
            { key:'stat1Num',   label:'Stat 1 — Number',      type:'text' },
            { key:'stat1Label', label:'Stat 1 — Label',       type:'text' },
            { key:'stat2Num',   label:'Stat 2 — Number',      type:'text' },
            { key:'stat2Label', label:'Stat 2 — Label',       type:'text' },
            { key:'stat3Num',   label:'Stat 3 — Number',      type:'text' },
            { key:'stat3Label', label:'Stat 3 — Label',       type:'text' },
            { key:'stat4Num',   label:'Stat 4 — Number',      type:'text' },
            { key:'stat4Label', label:'Stat 4 — Label',       type:'text' }
          ] },
        { id: 'process', title: 'How Membership Works — section + 4 steps',
          fields: [
            F.eyebrow, F.headline(2),
            { key:'s1Title', label:'Step 01 — Title', type:'text' },
            { key:'s1Body',  label:'Step 01 — Body',  type:'textarea', rows:2 },
            { key:'s2Title', label:'Step 02 — Title', type:'text' },
            { key:'s2Body',  label:'Step 02 — Body',  type:'textarea', rows:2 },
            { key:'s3Title', label:'Step 03 — Title', type:'text' },
            { key:'s3Body',  label:'Step 03 — Body',  type:'textarea', rows:2 },
            { key:'s4Title', label:'Step 04 — Title', type:'text' },
            { key:'s4Body',  label:'Step 04 — Body',  type:'textarea', rows:2 }
          ] },
        { id: 'perks', title: 'Why Become a Member — section + 4 perks',
          fields: [
            F.eyebrow, F.headline(2),
            { key:'p1Title', label:'Perk 1 — Title', type:'text' },
            { key:'p1Body',  label:'Perk 1 — Body',  type:'textarea', rows:2 },
            { key:'p2Title', label:'Perk 2 — Title', type:'text' },
            { key:'p2Body',  label:'Perk 2 — Body',  type:'textarea', rows:2 },
            { key:'p3Title', label:'Perk 3 — Title', type:'text' },
            { key:'p3Body',  label:'Perk 3 — Body',  type:'textarea', rows:2 },
            { key:'p4Title', label:'Perk 4 — Title', type:'text' },
            { key:'p4Body',  label:'Perk 4 — Body',  type:'textarea', rows:2 }
          ] },
        { id: 'faq', title: 'Frequently Asked — section + Q/A list',
          fields: [
            F.eyebrow, F.headline(2),
            { key:'items', label:'Questions & Answers', type:'textarea', rows:20, hint:'Each Q/A pair on two lines: start question with "Q:" and answer with "A:". Separate pairs with a blank line. Add or remove items freely.' }
          ] },
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
        { id: 'cards', title: 'Contact info cards (top row)',
          fields: [
            { key:'callTitle', label:'Call — Title',          type:'text' },
            { key:'call1',     label:'Call — Primary number',  type:'text' },
            { key:'call2',     label:'Call — Secondary number',type:'text' },
            { key:'waTitle',   label:'WhatsApp — Title',       type:'text' },
            { key:'waNum',     label:'WhatsApp — Number',      type:'text' },
            { key:'waSub',     label:'WhatsApp — Subtitle',    type:'text' },
            { key:'emailTitle',label:'Email — Title',          type:'text' },
            { key:'emailAddr', label:'Email — Address',        type:'text' },
            { key:'emailSub',  label:'Email — Subtitle',       type:'text' },
            { key:'locTitle',  label:'Location — Title',       type:'text' },
            { key:'loc1',      label:'Location — Line 1',      type:'text' },
            { key:'loc2',      label:'Location — Line 2',      type:'text' }
          ] },
        { id: 'form', title: 'Inquire / contact form (left column)',
          fields: [
            F.eyebrow, F.headline(2), F.body(3),
            { key:'labelName',    label:'Field — Name label',     type:'text' },
            { key:'phName',       label:'Field — Name placeholder',type:'text' },
            { key:'labelPhone',   label:'Field — Phone label',    type:'text' },
            { key:'phPhone',      label:'Field — Phone placeholder',type:'text' },
            { key:'labelEmail',   label:'Field — Email label',    type:'text' },
            { key:'phEmail',      label:'Field — Email placeholder',type:'text' },
            { key:'labelSubject', label:'Field — Subject label',  type:'text' },
            { key:'subjectOptions', label:'Subject dropdown options (one per line)', type:'textarea', rows:6 },
            { key:'labelMessage', label:'Field — Message label',  type:'text' },
            { key:'phMessage',    label:'Field — Message placeholder', type:'text' },
            { key:'buttonText',   label:'Submit button label',    type:'text' }
          ] },
        { id: 'hours', title: 'Opening hours (right column)',
          fields: [
            F.eyebrow, F.headline(2),
            { key:'list', label:'Hours (one per line: "Day | Time")', type:'textarea', rows:8 }
          ] },
        { id: 'walkins', title: 'Walk-Ins notice (right column)',
          fields: [
            { key:'title', label:'Title', type:'text' },
            { key:'body',  label:'Body',  type:'textarea', rows:3 }
          ] },
        { id: 'follow', title: 'Follow Us (social links)',
          fields: [
            { key:'title',        label:'Section title', type:'text' },
            { key:'urlInstagram', label:'Instagram URL', type:'text' },
            { key:'urlWhatsapp',  label:'WhatsApp URL',  type:'text' },
            { key:'urlFacebook',  label:'Facebook URL',  type:'text' },
            { key:'urlTiktok',    label:'TikTok URL',    type:'text' }
          ] },
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
  let workingContentAR = {}; // Arabic mirror (unsaved)
  let originalContentAR = {}; // last-saved Arabic (for revert)

  // ----------------------------- helpers ----------------------------
  function defaultsFor(key) {
    return (window.TAJ_PAGE_DEFAULTS && window.TAJ_PAGE_DEFAULTS[key]) || {};
  }
  // Derive Arabic defaults for a page from window.TAJ_I18N.cms by stripping the
  // `<pageKey>.` prefix and folding the dotted paths into a nested object.
  function arDefaultsFor(key) {
    const out = {};
    const cms = (window.TAJ_I18N && window.TAJ_I18N.cms) || {};
    const prefix = key + '.';
    Object.keys(cms).forEach(k => {
      if (k.indexOf(prefix) === 0) set(out, k.slice(prefix.length), cms[k]);
    });
    return out;
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
    const val   = get(workingContent,   path) || '';
    const arVal = get(workingContentAR, path) || '';
    const id    = 'cms-f-'    + block.id + '-' + field.key;
    const arId  = 'cms-f-ar-' + block.id + '-' + field.key;
    let input, arInput = '';
    switch (field.type) {
      case 'textarea':
        input   = `<textarea id="${id}"  data-path="${path}"    rows="${field.rows || 3}">${escHTML(val)}</textarea>`;
        arInput = `<textarea id="${arId}" data-path-ar="${path}" rows="${field.rows || 3}" dir="rtl" lang="ar" class="cms-field__ar">${escHTML(arVal)}</textarea>`;
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
        // images don't need Arabic
        break;
      }
      case 'serviceSelect': {
        // Placeholder; populated async via populateServiceSelects() after editor mounts
        const safe = escHTML(val);
        input = `
          <select id="${id}" data-path="${path}" data-service-select class="cms-service-select">
            <option value="">— Use static fallback —</option>
            ${val ? `<option value="${safe}" selected>${safe}</option>` : ''}
          </select>`;
        // service selects don't need an Arabic mirror — the service master is the source of truth
        break;
      }
      case 'tierList': {
        // Dynamic list of membership tier cards. Populated/wired in
        // populateTierLists() after the editor mounts. No Arabic mirror —
        // each tier's editor has its own per-language inputs.
        input = `<div class="cms-tier-list" id="${id}" data-path="${path}"></div>`;
        break;
      }
      case 'text':
      default:
        input   = `<input type="text" id="${id}"  data-path="${path}"    value="${escHTML(val)}">`;
        arInput = `<input type="text" id="${arId}" data-path-ar="${path}" value="${escHTML(arVal)}" dir="rtl" lang="ar" class="cms-field__ar">`;
    }
    const hint = field.hint ? `<small class="cms-field-hint">${field.hint}</small>` : '';
    const arBlock = arInput
      ? `<label for="${arId}" class="cms-field__ar-label"><span>ع</span> Arabic</label>${arInput}`
      : '';
    return `
      <div class="cms-field">
        <label for="${id}">${escHTML(field.label)}</label>
        ${input}
        ${arBlock}
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
        ${block.note ? `<p class="cms-block__note"><i class="fas fa-info-circle"></i> ${escHTML(block.note)}</p>` : ''}
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

    // Wire Arabic inputs → workingContentAR (run first so its bindings exist
    // independently of the English handler below)
    sections.querySelectorAll('[data-path-ar]').forEach(el => {
      el.addEventListener('input', () => {
        set(workingContentAR, el.dataset.pathAr, el.value);
      });
    });
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

    // Populate service-select dropdowns from the services master
    populateServiceSelects();
    // Populate dynamic membership tier lists
    populateTierLists();
  }

  /* ----------------------------- Tier list ----------------------------
     Custom field for editing a variable-length list of membership tiers.
     Each tier card has: name, sub, price, unit, perks (textarea), CTA
     label, optional Most-Popular flag, optional FontAwesome icon class.
     Stored as an array at workingContent[<path>]. ------------------- */
  const TIER_FIELDS = [
    { key:'tier',     label:'Tier label (small caps)', type:'text', placeholder:'e.g., Silver' },
    { key:'name',     label:'Tier name',               type:'text', placeholder:'e.g., The Companion' },
    { key:'sub',      label:'Tagline',                 type:'textarea', rows:2 },
    { key:'price',    label:'Price (number only)',     type:'text', placeholder:'150' },
    { key:'unit',     label:'Price unit',              type:'text', placeholder:'BHD · per year' },
    { key:'discount', label:'Member discount %',       type:'text', placeholder:'10', hint:'Number only — the % off additional treatments this tier unlocks.' },
    { key:'services', label:'Complimentary services / year', type:'text', placeholder:'6', hint:'Number only — how many complimentary services are included annually.' },
    { key:'perks',    label:'Perks (one per line, **bold** for emphasis)', type:'textarea', rows:8 },
    { key:'ctaLabel', label:'CTA button label',        type:'text', placeholder:'e.g., Become Silver' },
    { key:'icon',     label:'Crown icon (Font Awesome class)', type:'text', placeholder:'fas fa-gem' },
    { key:'featured', label:'Show "Most Popular" badge + dark styling', type:'checkbox' }
  ];

  function tierFieldHtml(tier, idx, field) {
    const v = tier[field.key];
    const id = `cms-tier-${idx}-${field.key}`;
    const safe = escHTML(v == null ? '' : v);
    const ph = field.placeholder ? ` placeholder="${escHTML(field.placeholder)}"` : '';
    let input;
    if (field.type === 'textarea') {
      input = `<textarea id="${id}" data-tier-field="${field.key}" rows="${field.rows || 3}"${ph}>${safe}</textarea>`;
    } else if (field.type === 'checkbox') {
      input = `<label class="cms-tier-check"><input type="checkbox" id="${id}" data-tier-field="${field.key}"${v ? ' checked' : ''}> <span>${escHTML(field.label)}</span></label>`;
      return `<div class="cms-field cms-tier-field cms-tier-field--check">${input}</div>`;
    } else {
      input = `<input type="text" id="${id}" data-tier-field="${field.key}" value="${safe}"${ph}>`;
    }
    return `<div class="cms-field cms-tier-field">
      <label for="${id}">${escHTML(field.label)}</label>
      ${input}
    </div>`;
  }

  function renderOneTierCard(tier, idx, total) {
    const head = escHTML(tier.tier || tier.name || `Tier ${idx + 1}`);
    return `<details class="cms-tier" data-tier-idx="${idx}"${idx === 0 ? ' open' : ''}>
      <summary><span class="cms-tier__name">${head}</span>
        <span class="cms-tier__ctrls">
          <button type="button" class="cms-tier__btn" data-tier-act="up"   ${idx === 0 ? 'disabled' : ''} title="Move up"><i class="fas fa-arrow-up"></i></button>
          <button type="button" class="cms-tier__btn" data-tier-act="down" ${idx === total - 1 ? 'disabled' : ''} title="Move down"><i class="fas fa-arrow-down"></i></button>
          <button type="button" class="cms-tier__btn cms-tier__btn--del" data-tier-act="remove" title="Remove tier"><i class="fas fa-trash"></i></button>
        </span>
      </summary>
      <div class="cms-tier__body">
        ${TIER_FIELDS.map(f => tierFieldHtml(tier, idx, f)).join('')}
      </div>
    </details>`;
  }

  function tierListContainerHtml(items) {
    const head = `<div class="cms-tier-list__items">${items.map((t, i) => renderOneTierCard(t, i, items.length)).join('')}</div>`;
    const add = `<button type="button" class="cms-tier-list__add"><i class="fas fa-plus"></i> Add membership tier</button>`;
    return head + add;
  }

  function populateTierLists() {
    document.querySelectorAll('[id^="cms-f-"].cms-tier-list, .cms-tier-list[data-path]').forEach(el => {
      const path = el.getAttribute('data-path');
      if (!path) return;
      let items = get(workingContent, path);
      if (!Array.isArray(items)) items = [];
      wireTierList(el, path, items);
    });
  }

  function wireTierList(el, path, items) {
    el.innerHTML = tierListContainerHtml(items);
    // Add button
    el.querySelector('.cms-tier-list__add').onclick = () => {
      items.push({ tier: '', name: 'New Tier', sub: '', price: '', unit: 'BHD · per year', discount: '', services: '', perks: '', ctaLabel: '', icon: 'fas fa-gem', featured: false });
      set(workingContent, path, items);
      wireTierList(el, path, items);
    };
    // Per-tier events
    el.querySelectorAll('.cms-tier').forEach(card => {
      const idx = Number(card.getAttribute('data-tier-idx'));
      // Live-update header on name/tier change
      const refreshHead = () => {
        const head = card.querySelector('.cms-tier__name');
        if (head) head.textContent = items[idx].tier || items[idx].name || `Tier ${idx + 1}`;
      };
      card.querySelectorAll('[data-tier-field]').forEach(input => {
        const key = input.getAttribute('data-tier-field');
        const evt = input.type === 'checkbox' ? 'change' : 'input';
        input.addEventListener(evt, () => {
          items[idx][key] = input.type === 'checkbox' ? input.checked : input.value;
          set(workingContent, path, items);
          if (key === 'tier' || key === 'name') refreshHead();
        });
      });
      // Reorder + remove
      card.querySelectorAll('[data-tier-act]').forEach(btn => {
        btn.addEventListener('click', () => {
          const act = btn.getAttribute('data-tier-act');
          if (act === 'remove') {
            if (!confirm(`Remove "${items[idx].name || items[idx].tier || 'this tier'}"?`)) return;
            items.splice(idx, 1);
          } else if (act === 'up' && idx > 0) {
            [items[idx - 1], items[idx]] = [items[idx], items[idx - 1]];
          } else if (act === 'down' && idx < items.length - 1) {
            [items[idx + 1], items[idx]] = [items[idx], items[idx + 1]];
          } else return;
          set(workingContent, path, items);
          wireTierList(el, path, items);
        });
      });
    });
  }

  async function populateServiceSelects() {
    const selects = document.querySelectorAll('[data-service-select]');
    if (!selects.length) return;
    let list = [];
    try { list = (await window.TajData?.services?.list()) || []; } catch (_) {}
    // Sort by sort field then name for a stable, browseable list
    list.sort((a, b) => (a.sort || 0) - (b.sort || 0) || String(a.name || '').localeCompare(String(b.name || '')));
    const options = list.map(s => {
      const id = escHTML(s.id);
      const label = escHTML(s.name || s.id);
      return `<option value="${id}">${label}</option>`;
    }).join('');
    selects.forEach(sel => {
      const current = sel.getAttribute('data-current') || sel.value || '';
      sel.innerHTML = `<option value="">— Use static fallback —</option>` + options;
      if (current && [...sel.options].some(o => o.value === current)) sel.value = current;
    });
  }

  async function loadPage(key) {
    currentKey = key;
    const [saved, savedAR] = await Promise.all([
      window.TajData?.settings?.get(key)         || Promise.resolve(null),
      window.TajData?.settings?.get(key + '_ar') || Promise.resolve(null)
    ]);
    originalContent   = deepMerge(defaultsFor(key),   saved   || {});
    originalContentAR = deepMerge(arDefaultsFor(key), savedAR || {});
    workingContent    = JSON.parse(JSON.stringify(originalContent));
    workingContentAR  = JSON.parse(JSON.stringify(originalContentAR));
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
  // Upload from local computer — uses the shared TajUpload helper.
  document.getElementById('cms-img-upload')?.addEventListener('click', e => {
    if (!window.TajUpload) { alert('Upload helper not loaded.'); return; }
    TajUpload.pickAndUpload(url => applyImage(url), { btn: e.currentTarget });
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
        await TajData.settings.set(currentKey + '_ar', workingContentAR);
      } else {
        const all = JSON.parse(localStorage.getItem('taj-settings') || '{}');
        all[currentKey] = workingContent;
        all[currentKey + '_ar'] = workingContentAR;
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
      originalContent   = JSON.parse(JSON.stringify(workingContent));
      originalContentAR = JSON.parse(JSON.stringify(workingContentAR));
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
    workingContent   = JSON.parse(JSON.stringify(originalContent));
    workingContentAR = JSON.parse(JSON.stringify(originalContentAR));
    renderEditor();
    if (typeof showToast === 'function') showToast('Reverted to last saved state');
  }
  async function resetAll() {
    if (!confirm('Reset every page back to the shipped defaults?\nThis clears every CMS edit you have ever made.')) return;
    const keys = Object.keys(SCHEMA);
    for (const k of keys) {
      try {
        if (window.TajData?.settings) {
          await TajData.settings.set(k,           defaultsFor(k));
          await TajData.settings.set(k + '_ar',   arDefaultsFor(k));
        } else {
          const all = JSON.parse(localStorage.getItem('taj-settings') || '{}');
          all[k]           = defaultsFor(k);
          all[k + '_ar']   = arDefaultsFor(k);
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
