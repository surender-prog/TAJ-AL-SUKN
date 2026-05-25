/* Taj Al Sukun — Page CMS loader
   ============================================================
   Public-facing loader that swaps DOM content from values stored
   in the Supabase `settings` table (key: 'page-<slug>') or in
   the localStorage cache.

   How tagging works
   -----------------
   Any element on a public page can be made editable by adding:

     <h1 data-cms="page-home.hero.title">…default text…</h1>
     <p  data-cms="page-home.hero.subtitle">…</p>
     <div data-cms="page-home.hero.image" data-cms-prop="bg">…</div>
     <img data-cms="page-home.hero.photo" src="default.jpg">
     <a   data-cms="page-home.cta.button" href="/booking">Reserve</a>

   The address is `<settings-key>.<dot.path>`. Default prop is the
   element's textContent, but you can override with:
     - data-cms-prop="bg"     → sets backgroundImage CSS
     - data-cms-prop="src"    → sets the src= attribute (images)
     - data-cms-prop="href"   → sets the href= attribute (links)
     - data-cms-prop="html"   → innerHTML (use sparingly)

   The admin Website tab reads/writes the same JSON shape.
*/
(function () {
  'use strict';

  // Default page content — used as fallback when Supabase has nothing yet.
  // Keep in sync with `assets/js/admin-pages.js` (single source of canonical defaults).
  const DEFAULTS = window.TAJ_PAGE_DEFAULTS = {
    'page-home': {
      hero: {
        eyebrow:  'Manama · Bahrain · Est. 2024',
        title:    'Immerse *yourself* in the atmosphere of stillness & harmony.',
        subtitle: "Step into Taj Al Sukun — a private sanctuary where Arabian rituals meet the world's finest spa traditions. Authentic Hammams, signature massages, and unhurried care.",
        image:    'assets/images/sanctuary-bed.jpg'
      },
      loving: {
        title: 'Loving Through Touch',
        body:  'A professional massage therapist with extensive experience is ready to care for your physical and emotional wellbeing. Every ritual begins with you.',
        image: 'assets/images/sanctuary-bed.jpg'
      },
      stress: {
        title: 'A place where *stress fades* and harmony begins.',
        body:  'Experience the healing power of authentic Arabian rituals — a blend of tradition and care designed to release stress, improve circulation, and restore inner peace. Each session is a journey toward balance, clarity, and deep renewal.'
      },
      benefits: {
        title:   'Massage can help you *if you*…',
        c1Title: 'Feel Tense & Stiff All Day',
        c1Body:  'Your body feels heavy, tight, and hard to move — even after rest.',
        c2Title: 'Living with Constant Pain',
        c2Body:  'Dealing with aches, chronic pain, or physical discomfort daily.',
        c3Title: 'Struggling to Sleep at Night',
        c3Body:  "You lie awake exhausted but can't switch off or rest properly.",
        c4Title: 'Overwhelmed by Stress',
        c4Body:  'Feeling anxious, tense, and unable to unwind no matter what you try.',
        c5Title: 'Feeling Drained & Low',
        c5Body:  'Low energy, low mood, and struggling to feel like yourself again.'
      },
      welcome: {
        eyebrow: 'Welcome',
        title:   'A modern sanctuary in *Manama*.',
        body:    'Taj Al Sukun is more than a spa — it is a refuge crafted for those who value stillness. Our therapists are trained in authentic Arabian techniques, complemented by the world\'s finest spa traditions.',
        image:   'assets/images/spa-foyer.jpg',
        accent:  'assets/images/lounge-flowers.jpg'
      },
      treatments: {
        eyebrow: 'Signature Rituals',
        title:    'Our most loved *treatments*.',
        subtitle: 'From deep-tissue therapy to the royal Hammam — every ritual is unhurried, deeply personal, and crafted to restore.',
        button:   'View Complete Menu'
        // Featured cards are pulled from the services master via slot IDs
        // (page-home.treatments.c1Id..c4Id). Empty slot → fallback to the
        // static HTML card content in index.html.
      },
      after: {
        eyebrow: 'After Your Visit',
        title:   "How you'll *feel*.",
        c1Title: 'Deep relaxation',
        c1Body:  'Enjoy deep relaxation and rest.',
        c2Title: 'Steps to a world of healing',
        c2Body:  'For your body and soul.',
        c3Title: 'Lightness in your body',
        c3Body:  'Experience lightness in muscles and joints.',
        c4Title: 'Begin your journey',
        c4Body:  'Of rejuvenation and healing.',
        img1:    'assets/images/spa-relax-1.jpg',
        img2:    'assets/images/sanctuary-bed.jpg',
        img3:    'assets/images/spa-relax-2.jpg'
      },
      philosophy: {
        quote: '"True wellness is not in escape — it is in *returning to yourself*."',
        by:    '— Our Philosophy'
      },
      founder: {
        eyebrow: 'A Word from Our Director',
        name:    'Sofia Marini',
        role:    'Spa Director · 14 yrs',
        quote:   '"Every detail at Taj Al Sukun is chosen with care — every fragrance, every silence, every fabric. We don\'t simply offer treatments; we curate moments of stillness."',
        image:   'assets/images/manager-portrait.jpg'
      },
      testimonials: {
        eyebrow: 'What Guests Say',
        title:   'Words from our *circle*.'
      },
      pricing: {
        eyebrow:  'Annual Memberships',
        title:    'Become a *member*, save year-round.',
        subtitle: 'Three ways to experience Taj Al Sukun — choose what fits today.',
        button:   'Book Your Massage',
        unit:     '/ session · BHD',
        c1Name: 'Basic',    c1Price: '25',  c1Bullets: '60-min Swedish or Casablanca\nAromatic oils\nHerbal tea after session\n~ Hot herbal compress\n~ Foot reflexology',
        c2Name: 'Standard', c2Price: '35',  c2Bullets: '90-min Traditional Massage\nAromatic oils\nHot herbal compress\nFoot reflexology (15 min)\n~ Hot stone therapy',
        c3Name: 'Premium',  c3Price: '120', c3Bullets: '120-min Luxury Ritual\nAromatic oils\nHot herbal compress\nFoot reflexology (30 min)\nHot stone therapy'
      },
      offer: {
        eyebrow: 'Limited Welcome Offer',
        title:   'Save *10%* on your first ritual.',
        body:    'New guests receive 10% off any signature treatment when booked this month. Mention "First Visit" on WhatsApp to claim.',
        button:  'Claim 10% Off',
        namePh:  'Name *',
        emailPh: 'Email *',
        phonePh: 'Phone (optional)',
        img1:    'assets/images/team-reception.jpg',
        img2:    'assets/images/therapist-prep.jpg'
      },
      cta: {
        eyebrow: 'Your Sanctuary Awaits',
        title:   'Reserve a *ritual* today.',
        body:    'Choose your treatment, pick a time, and we will confirm by WhatsApp within minutes.',
        button:  'Reserve Now'
      }
    },
    'page-about': {
      hero: {
        eyebrow: 'OUR STORY',
        title:   'The story of *stillness*.',
        subtitle:'Taj — the crown. Al Sukun — the stillness. Together, the highest form of inner peace.',
        image:   'assets/images/spa-corridor.jpg'
      },
      story: {
        eyebrow: 'Beginnings',
        title:   'Crafted with *intention*.',
        body:    'Taj Al Sukun was born from a simple belief: that wellness is a practice, not a luxury. Every room, every fragrance, every silence is deliberate.'
      },
      quote: {
        quote: '"In stillness, we *return* — to ourselves, to silence, to the quiet truth of our bodies."',
        by:    '— Taj Al Sukun'
      },
      values: {
        eyebrow: 'Our Values',
        title:   'How we *practice* hospitality.'
      },
      team: {
        eyebrow: 'Trusted & Certified',
        title:   'A team of *master therapists*.',
        body:    'Each member of our team is internationally certified, with decades of combined experience across Arabian, Asian, and European traditions.'
      },
      cta: {
        eyebrow: 'Ready to experience the difference?',
        title:   'Step into the *sanctuary*.',
        body:    'Book your first ritual — let us craft the perfect introduction to Taj Al Sukun.',
        button:  'Reserve a Ritual'
      }
    },
    'page-services': {
      hero: {
        eyebrow: 'TREATMENTS',
        title:   'Our *Treatments*.',
        subtitle:'Every ritual is unhurried, deeply personal, and crafted to restore.',
        image:   'assets/images/deep-tissue.jpg'
      },
      intro: {
        eyebrow: 'Browse the Menu',
        title:   'Find your *moment*.'
      },
      quote: {
        quote: '"Choose what your body asks for today. *Tomorrow may want something else*."',
        by:    '— Spa Director'
      },
      packages: {
        eyebrow: 'Curated Packages',
        title:   'The full *spa journey*.',
        body:    'Combine our most-loved rituals into one extended escape — and save.'
      },
      cta: {
        eyebrow: 'Need help choosing?',
        title:   'Let our team *guide you*.',
        body:    'Tell us how you feel today — we\'ll recommend the perfect ritual based on your goals.',
        button:  'Reserve a Ritual'
      }
    },
    'page-gallery': {
      hero: {
        eyebrow: 'GALLERY',
        title:   'Step inside the *sanctuary*.',
        subtitle:'A visual tour of the rooms, rituals, and small details that shape every visit.',
        image:   'assets/images/spa-corridor.jpg'
      },
      intro: {
        eyebrow: 'The Visual Journey',
        title:   'Beauty in *every detail*.',
        body:    'Tap any image to view it in full.'
      },
      quote: {
        quote: '"Every detail is composed — every fragrance, every sound, every silence. *It all leads here*."',
        by:    '— Taj Al Sukun'
      },
      instagram: {
        eyebrow: 'Follow Our Journey',
        title:   'Find us on *Instagram*.',
        body:    'Daily moments from inside the sanctuary — treatments, rituals, and seasonal offers.',
        handle:  '@tasukunspa'
      }
    },
    'page-membership': {
      hero: {
        eyebrow: 'MEMBERSHIP',
        title:   'The Taj Al Sukun *Membership*.',
        subtitle:'An annual circle of complimentary services, member-only pricing, and priority care.',
        image:   'assets/images/sanctuary-bed.jpg'
      },
      intro: {
        eyebrow: 'Three Tiers · One Sanctuary',
        title:   'Membership crafted for *regulars*.',
        body:    'Choose the tier that fits your rhythm. Each membership is purchased annually, includes a generous selection of complimentary signature services, and unlocks member-only pricing for every additional treatment, package, and product.'
      },
      compare: {
        eyebrow: 'Compare All Tiers',
        title:   'Side by *side*.'
      },
      portal: {
        eyebrow: 'Your Member Account',
        title:   'Track everything in *one place*.',
        body:    'Sign in to your member portal to view remaining services, upcoming bookings, billing history, and exclusive offers.'
      },
      process: {
        eyebrow: 'How Membership Works',
        title:   'Simple, *transparent*, generous.'
      },
      quote: {
        quote: '"Membership at Taj Al Sukun means *coming home* — to a team that knows your preferences, your pressure points, and your favorite tea."',
        by:    '— A Gold Member'
      },
      cta: {
        eyebrow: 'Ready to join?',
        title:   'Become a *member* today.',
        body:    'Sign up via WhatsApp — we\'ll send your welcome pack and book your enrollment ritual.',
        button:  'Join via WhatsApp'
      }
    },
    'page-contact': {
      hero: {
        eyebrow: 'CONTACT',
        title:   "We'd *love* to hear from you.",
        subtitle:'Reach us by phone, WhatsApp, or the form below — we reply quickly.',
        image:   'assets/images/reception-desk.jpg'
      },
      visit: {
        eyebrow: 'Find Us',
        title:   'Visit the *sanctuary*.',
        body:    "Al Fateh, Manama · Complex 324 · Road 2416 · Building 950. Plenty of parking, with valet on Friday and Saturday evenings."
      },
      cta: {
        eyebrow: 'Or skip the form',
        title:   'Just *WhatsApp* us.',
        body:    'Fastest way to reach us — typical reply within 10 minutes.',
        button:  'WhatsApp Now'
      }
    },
    'page-footer': {
      brand: {
        tagline: 'A modern wellness sanctuary in Manama, blending authentic Arabian rituals with the finest spa traditions of the world.'
      },
      contact: {
        address:  'Al Fateh, Manama<br>Complex 324 · Road 2416 · Bld 950',
        phone:    '+973 35194422',
        hours:    'Daily · 10am – 6pm',
        whatsapp: '+973 35194422',
        email:    'hello@tasukunspa.com'
      }
    }
  };

  function getByPath(obj, path) {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
  }

  function applyValue(el, value) {
    if (value == null || value === '') return;
    const prop = el.getAttribute('data-cms-prop') || 'text';
    switch (prop) {
      case 'bg':
        el.style.backgroundImage = "url('" + String(value).replace(/'/g, "\\'") + "')";
        break;
      case 'src':
        el.setAttribute('src', value);
        break;
      case 'href':
        el.setAttribute('href', value);
        break;
      case 'placeholder':
        el.setAttribute('placeholder', value);
        break;
      case 'html':
        el.innerHTML = value;
        break;
      case 'text':
      default:
        // Preserve <em> wrappers inside headings when the value contains *…* markdown-ish syntax
        // i.e. "Welcome back, *Aisha*." → "Welcome back, <em>Aisha</em>."
        if (typeof value === 'string' && /\*[^*]+\*/.test(value)) {
          el.innerHTML = String(value)
            .replace(/[<>]/g, c => ({ '<': '&lt;', '>': '&gt;' })[c])
            .replace(/\*([^*]+)\*/g, '<em>$1</em>');
        } else {
          el.textContent = value;
        }
    }
  }

  function applyContent(map) {
    // map is { 'page-home': {...}, 'page-footer': {...}, ... }
    document.querySelectorAll('[data-cms]').forEach(el => {
      const addr = el.getAttribute('data-cms') || '';
      const dot  = addr.indexOf('.');
      if (dot < 0) return;
      const key  = addr.slice(0, dot);
      const path = addr.slice(dot + 1);
      const bucket = map[key] || DEFAULTS[key] || null;
      const value = getByPath(bucket, path);
      if (value !== undefined) applyValue(el, value);
    });
  }

  async function load() {
    // First pass: apply DEFAULTS so nothing flickers if Supabase is slow
    applyContent({});

    // Determine which page keys we actually need (footer always + the page-specific key)
    const needed = new Set(['page-footer']);
    document.querySelectorAll('[data-cms]').forEach(el => {
      const addr = el.getAttribute('data-cms');
      const dot = addr.indexOf('.');
      if (dot > 0) needed.add(addr.slice(0, dot));
    });

    // Resolve content for each needed key.
    //
    // When Supabase is connected we read REMOTE-ONLY: a key that has no row
    // in the DB resolves to the shipped DEFAULTS, NOT a stale localStorage
    // mirror. This prevents old cached CMS content (e.g. a deleted page-home
    // override) from masking the current defaults. We only fall back to the
    // localStorage mirror when there is no live database connection.
    const got = {};
    const connected = !!(window.TajData && window.TajData.connected && window.TajData._sb);

    if (connected) {
      try {
        const { data } = await window.TajData._sb
          .from('settings').select('key,value').in('key', [...needed]);
        (data || []).forEach(row => { if (row.value) got[row.key] = row.value; });
      } catch (e) {
        console.warn('[PageCMS] settings load failed:', e);
      }
    } else {
      // Offline / unconfigured — use the localStorage mirror as the source.
      try {
        const ls = JSON.parse(localStorage.getItem('taj-settings') || '{}');
        [...needed].forEach(k => { if (ls[k]) got[k] = ls[k]; });
      } catch (_) {}
    }

    applyContent(got);
    // Fill the Home → Signature Treatments featured cards from the services
    // master if slot IDs are configured. Awaited so i18n sees the final DOM.
    await renderFeaturedTreatments(got);
    // Fill the Home → Pricing / Memberships plan cards (sync, no fetch).
    renderPricingPlans(got);
    // Signal that CMS content is on the page so the i18n layer can (re)translate.
    try { document.dispatchEvent(new CustomEvent('taj-cms-applied')); } catch (_) {}
  }

  function renderPricingPlans(got) {
    const plans = document.querySelectorAll('.pricing .plan');
    if (!plans.length) return;
    const cfg = ((got['page-home'] || DEFAULTS['page-home'] || {}).pricing) || {};
    const unit = cfg.unit;
    const buttonLabel = cfg.button;
    const escText = (s) => String(s).replace(/[&<>]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;' })[c]);
    ['c1','c2','c3'].forEach((k, i) => {
      const card = plans[i];
      if (!card) return;
      const name = cfg[k + 'Name'];
      const price = cfg[k + 'Price'];
      const bullets = cfg[k + 'Bullets'];
      if (name) {
        const nameEl = card.querySelector('.plan__name');
        if (nameEl) nameEl.textContent = name;
      }
      const priceEl = card.querySelector('.plan__price');
      if (priceEl) {
        const small = priceEl.querySelector('small');
        if (price != null && price !== '') {
          const firstText = [...priceEl.childNodes].find(n => n.nodeType === 3);
          if (firstText) firstText.textContent = String(price);
          else priceEl.insertBefore(document.createTextNode(String(price)), priceEl.firstChild);
        }
        if (small && unit) small.textContent = ' ' + String(unit).replace(/^\s+/, '');
      }
      if (typeof bullets === 'string') {
        const ul = card.querySelector('.plan__list');
        if (ul) {
          ul.innerHTML = bullets.split(/\r?\n/)
            .map(l => l.replace(/\s+$/, ''))
            .filter(l => l.length)
            .map(line => {
              const muted = /^\s*~\s*/.test(line);
              const text = line.replace(/^\s*~\s*/, '');
              return `<li${muted ? ' class="muted"' : ''}>${escText(text)}</li>`;
            }).join('');
        }
      }
      if (buttonLabel) {
        const btn = card.querySelector('a.btn');
        if (btn) btn.textContent = buttonLabel;
      }
    });
  }

  async function renderFeaturedTreatments(got) {
    const grid = document.querySelector('.feature-grid');
    if (!grid) return;
    const cfg = ((got['page-home'] || DEFAULTS['page-home'] || {}).treatments) || {};
    const ids = [cfg.c1Id, cfg.c2Id, cfg.c3Id, cfg.c4Id];
    if (!ids.some(Boolean)) return;
    if (!window.TajData || !window.TajData.services) return;
    let services = [];
    try { services = (await window.TajData.services.list()) || []; } catch (_) { return; }
    const byId = Object.create(null);
    services.forEach(s => { byId[s.id] = s; });
    const cards = grid.querySelectorAll('.feature');
    ids.forEach((id, i) => {
      if (!id || !cards[i]) return;
      const s = byId[id];
      if (!s) return;
      const card = cards[i];
      const img = card.querySelector('img');
      const tag = card.querySelector('.tag');
      const h4  = card.querySelector('h4');
      const dur = card.querySelector('.dur');
      const priceSpan = card.querySelector('.price > span') || card.querySelector('.price');
      if (img && s.image) { img.setAttribute('src', s.image); if (s.name) img.setAttribute('alt', s.name); }
      if (tag && s.tag)   tag.textContent = s.tag;
      if (h4 && s.name)   h4.textContent  = s.name;
      if (dur && s.duration != null) dur.textContent = String(s.duration);
      if (priceSpan && s.price != null) priceSpan.textContent = String(s.price);
    });
  }

  // Expose for the admin Website tab to invoke after a save (live preview),
  // and for tests / other modules.
  window.TajPageCMS = { load, applyContent, getDefaults: () => DEFAULTS };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
