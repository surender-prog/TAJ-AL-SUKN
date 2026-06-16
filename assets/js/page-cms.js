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
      marquee: {
        items: 'Royal Hammam\nArgan Oil Ritual\nHot Stone\nCasablanca Hammam\nCouples Sanctuary\nDeep Tissue'
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
      // Section heading + the manager PHOTO. The profile text (name, role,
      // highlights, socials) is SHARED from About → Leadership
      // (page-about.leadership.*). Photo lives here because that's where the
      // uploaded image is stored; it renders on both Home and About.
      founder: {
        eyebrow: 'A Word from Our Operational Manager',
        title:   'Hands that *understand*.',
        image:   'assets/images/manager-portrait.jpg'
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
        eyebrow: 'Our Story',
        title:   'A sanctuary born from a *simple wish*.',
        p1: 'Taj Al Sukun was founded with one quiet belief — that everyone deserves a place to set the world down. In a city that moves quickly, we built a space that slows you, gently and completely.',
        p2: 'Drawing on the deep wellness traditions of the Arabian Peninsula, North Africa, and Southeast Asia, our spa brings together the finest rituals from across the world — performed by hands that have trained for years to deliver them with care.',
        p3: 'Every treatment, every aroma, every quiet detail of the space is chosen with one purpose: *to give you back to yourself.*',
        image:  'assets/images/spa-entrance.jpg',
        accent: 'assets/images/lobby-table.jpg'
      },
      mission: {
        eyebrow: 'Our Purpose',
        title:   'Mission & *Vision*.',
        missionLine: '— To create moments of complete restoration for body, mind, and spirit.',
        missionBody: 'We deliver authentic, expertly-performed wellness rituals using premium natural ingredients in an environment designed for serenity.',
        visionLine:  "— To be Bahrain's most-trusted name in holistic wellness.",
        visionBody:  'A destination where guests return — not just for the treatments, but for the feeling that lingers long after they leave.',
        image:  'assets/images/spa-corridor.jpg',
        accent: 'assets/images/sanctuary-bed.jpg'
      },
      quote: {
        quote: '"In stillness, we *return* — to ourselves, to silence, to the quiet truth of our bodies."',
        by:    '— Taj Al Sukun'
      },
      values: {
        eyebrow: 'Our Values',
        title:   'How we *practice* hospitality.',
        c1Title: 'Quality',    c1Body: 'Premium ingredients, vetted techniques, no shortcuts — ever.',
        c2Title: 'Privacy',    c2Body: 'Discreet, private rooms designed for your absolute comfort.',
        c3Title: 'Care',       c3Body: 'Genuine warmth in every welcome, every touch, every farewell.',
        c4Title: 'Excellence', c4Body: 'Trained professionals committed to mastery of their craft.'
      },
      meetTeam: {
        eyebrow: 'Meet the Team',
        title:   'Hands that *understand*.',
        p1: 'Our therapists bring years of training across Thai, Balinese, Moroccan, Swedish, and deep-tissue modalities. Each holds international certifications and is selected as much for warmth and presence as for technical skill.',
        p2: 'What unites them is a shared belief — that real wellness happens when guests feel completely safe, completely seen, and completely cared for.',
        bullet1: 'Internationally certified therapists',
        bullet2: 'Multi-lingual team (Arabic, English & more)',
        bullet3: 'Continuous training in new techniques',
        image:   'assets/images/team-reception.jpg',
        accent:  'assets/images/therapist-prep.jpg'
      },
      leadership: {
        role:  'Operational Manager',
        years: '14 yrs',
        name:  'Carmen Santos',
        b1: 'Leads daily spa operations with a strong focus on service excellence and guest satisfaction.',
        b2: 'Oversees therapist performance, training, and quality standards to ensure a consistent luxury experience.',
        b3: 'Dedicated to creating a calm, welcoming environment where every guest feels valued and cared for.',
        b4: 'Ensures smooth coordination between departments, maintaining efficiency and operational excellence.',
        b5: 'Passionate about promoting wellness, professional growth, and continuous improvement within the team.',
        b6: 'Committed to delivering exceptional service while upholding the highest standards of hospitality and care.',
        image: 'assets/images/manager-portrait.jpg',
        ig: 'https://www.instagram.com/tajalsukunspa2026',
        fb: '#',
        li: '#',
        wa: 'https://wa.me/97335194422'
      },
      team: {
        eyebrow: 'Trusted & Certified',
        title:   'A team of *master therapists*.',
        body:    'Kingdom of Bahrain · CR No. 182250-1',
        b1Label: 'Bahrain Licensed',
        b2Label: 'Natural Products',
        b3Label: 'Hygiene Certified',
        b4Label: 'Award-Ready Service'
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
      tiles: {
        t01Image: 'assets/images/sanctuary-bed.jpg',     t01Label: 'A Sanctuary of Silence',
        t02Image: 'assets/images/treatment-room.jpg',    t02Label: 'Private Suite',
        t03Image: 'assets/images/reception-desk.jpg',    t03Label: 'A Warm Welcome',
        t04Image: 'assets/images/deep-tissue.jpg',       t04Label: 'Deep Tissue Therapy',
        t05Image: 'assets/images/spa-corridor.jpg',      t05Label: 'Walk to Stillness',
        t06Image: 'assets/images/spa-foyer.jpg',         t06Label: 'The Foyer',
        t07Image: 'assets/images/waiting-lounge.jpg',    t07Label: 'Lounge',
        t08Image: 'assets/images/therapist-prep.jpg',    t08Label: 'Preparing the Ritual',
        t09Image: 'assets/images/couples-massage.jpg',   t09Label: 'Couples Sanctuary',
        t10Image: 'assets/images/therapist-products.jpg',t10Label: 'Premium Oils',
        t11Image: 'assets/images/products-shelf.jpg',    t11Label: 'Curated Products',
        t12Image: 'assets/images/lounge-flowers.jpg',    t12Label: 'Quiet Detail',
        t13Image: 'assets/images/lobby-table.jpg',       t13Label: 'Lobby Centerpiece',
        t14Image: 'assets/images/spa-detail-1.jpg',      t14Label: 'Interior Detail',
        t15Image: 'assets/images/team-reception.jpg',    t15Label: 'The Team',
        t16Image: 'assets/images/spa-relax-1.jpg',       t16Label: 'Relaxation Suite',
        t17Image: 'assets/images/spa-relax-2.jpg',       t17Label: 'Hot Stone',
        t18Image: 'assets/images/spa-relax-3.jpg',       t18Label: 'Foot Ritual',
        t19Image: 'assets/images/spa-entrance.jpg',      t19Label: 'Entrance',
        t20Image: 'assets/images/spa-exterior.jpg',      t20Label: 'Building 950'
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
      tiersShared: { perksLabel: 'Included Annually', badgeText: 'Most Popular' },
      tierList: { tiers: [
        {
          tier: 'Silver', name: 'The Companion',
          sub:  'An invitation to begin — a year of considered moments.',
          price: '150', unit: 'BHD · per year', discount: '10', services: '6',
          perks: '**2 complimentary** 60-min signature massages\n**1 complimentary** Foot Reflexology ritual\n**10% off** all additional treatments\nPriority booking — 24 hours ahead\nWelcome ritual on signup\nBirthday gift — free Foot Relaxing\nMember-only seasonal offers',
          ctaLabel: 'Become Silver', icon: 'fas fa-gem', featured: false
        },
        {
          tier: 'Gold', name: 'The Sanctuary',
          sub:  'A generous year of regular restoration and signature care.',
          price: '350', unit: 'BHD · per year', discount: '15', services: '14',
          perks: '**6 complimentary** 60-min signature massages\n**1 Royal Hammam** ritual included\n**2 complimentary** foot rituals\n**15% off** all additional treatments\nPriority booking — 48 hours ahead\n**1 guest pass** per year\nWelcome Hammam ritual on signup\nBirthday spa journey (90 min)\nMembers-only seasonal events',
          ctaLabel: 'Become Gold', icon: 'fas fa-crown', featured: true
        }
      ] },
      hero: {
        eyebrow: 'MEMBERSHIP',
        title:   'The Taj Al Sukun *Membership*.',
        subtitle:'An annual circle of complimentary services, member-only pricing, and priority care.',
        image:   'assets/images/sanctuary-bed.jpg'
      },
      portal: {
        eyebrow: 'Your Member Account',
        title:   'Track everything in *one place*.',
        copyTitle: 'A simple, beautiful *member dashboard*.',
        copyBody:  'Every Taj Al Sukun member receives a personal account with their balance of complimentary services, upcoming bookings, and member ID for fast checkout.',
        bullets:   'Track your complimentary services balance in real-time\nBook using your member ID — no payment needed for included services\nApply your member discount automatically at checkout\nReceive renewal reminders 30 days before expiry\nManage guest passes & gift transfers',
        ctaLabel:  'Preview Member Portal',
        cardName:   'Fatima A.',
        cardJoined: 'Member since 2025',
        cardTier:   'Gold',
        idLabel:    'Member ID',
        cardId:     'TAS-2025-0047',
        stat1Num: '4',   stat1Label: 'Massages Left',
        stat2Num: '1',   stat2Label: 'Hammams Left',
        stat3Num: '2',   stat3Label: 'Foot Rituals',
        stat4Num: '15%', stat4Label: 'Member Discount'
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
        title:   'Simple, *transparent*, generous.',
        s1Title: 'Choose Your Tier',
        s1Body:  'Silver or Gold — pick the package that matches your rhythm.',
        s2Title: 'Pay Annually',
        s2Body:  'One-time annual payment via bank transfer or in-spa. No monthly fees.',
        s3Title: 'Welcome Ritual',
        s3Body:  'Receive your member card and complimentary welcome treatment.',
        s4Title: 'Enjoy & Renew',
        s4Body:  'Use your services year-round. Auto-reminder before renewal.'
      },
      perks: {
        eyebrow: 'Why Become a Member',
        title:   'The most loved *perks*.',
        p1Title: 'Pay Once, Save All Year',
        p1Body:  'Up to 40% savings vs. paying per visit. Members save more, every time.',
        p2Title: 'Priority Booking',
        p2Body:  'Members get first access to evenings, weekends, and seasonal slots.',
        p3Title: 'Bring a Guest',
        p3Body:  'Gold members receive guest passes — share the stillness.',
        p4Title: 'Birthday Treat',
        p4Body:  'A complimentary celebration ritual on or around your birthday, every year.'
      },
      faq: {
        eyebrow: 'Frequently Asked',
        title:   'Questions, *answered*.',
        items: "Q: How long is membership valid?\nA: 12 months from the date of activation. Reminders are sent 30 days before renewal.\n\nQ: Can I share my membership with family?\nA: Memberships are personal, but the Gold tier includes a guest pass for sharing. Family memberships available — speak with our team.\n\nQ: What happens if I don't use all my included services?\nA: Unused services don't roll over, but you receive renewal incentives if you've used the majority of your benefits in your first year.\n\nQ: Can I upgrade from Silver to Gold mid-year?\nA: Yes. The pro-rated difference is applied and your benefits upgrade immediately.\n\nQ: How do I pay?\nA: Pay in person at the spa, by bank transfer, or via our secure online payment link sent over WhatsApp.\n\nQ: Are corporate or wellness packages available?\nA: Yes — we offer customized corporate wellness memberships for teams of 5 or more. Contact us for details."
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
      cards: {
        callTitle: 'Call Us',   call1: '+973 35194422', call2: '+973 77924422',
        waTitle:   'WhatsApp',  waNum: '+973 35194422', waSub: 'Fastest response',
        emailTitle:'Email',     emailAddr: 'hello@tasukunspa.com', emailSub: 'Within 24 hours',
        locTitle:  'Location',  loc1: 'Al Fateh, Manama', loc2: 'Complex 324 · Bld 950'
      },
      form: {
        eyebrow: 'Send a Message',
        title:   'Inquire or *reserve*.',
        body:    "Tell us how we can help — pricing questions, group bookings, membership inquiries, or anything else. We'll send your message directly to our reception team via WhatsApp.",
        labelName: 'Full Name',    phName: 'Your name',
        labelPhone: 'Phone',       phPhone: '+973 …',
        labelEmail: 'Email',       phEmail: 'you@email.com',
        labelSubject: 'Subject',
        subjectOptions: 'General Inquiry\nBooking Question\nGroup / Couple Booking\nMembership Inquiry\nCorporate / Event\nFeedback',
        labelMessage: 'Message',   phMessage: 'How can we help?',
        buttonText: 'Send via WhatsApp'
      },
      hours: {
        eyebrow: 'Opening Hours',
        title:   'When to *visit*.',
        list: 'Saturday | 10:00 AM – 6:00 PM\nSunday | 10:00 AM – 6:00 PM\nMonday | 10:00 AM – 6:00 PM\nTuesday | 10:00 AM – 6:00 PM\nWednesday | 10:00 AM – 6:00 PM\nThursday | 10:00 AM – 6:00 PM\nFriday | 10:00 AM – 6:00 PM'
      },
      walkins: {
        title: 'Walk-Ins Welcome',
        body:  'We do our best to accommodate walk-ins. For guaranteed time slots, especially evenings and weekends, please book in advance.'
      },
      follow: {
        title: 'Follow Us',
        urlInstagram: 'https://www.instagram.com/tajalsukunspa2026',
        urlWhatsapp:  'https://wa.me/97335194422',
        urlFacebook:  '#',
        urlTiktok:    '#'
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

    // Stash the resolved map so the lang-change re-render can re-use it
    LAST_GOT = got;
    applyContent(got);
    // Fill the Home → Signature Treatments featured cards from the services
    // master if slot IDs are configured. Awaited so i18n sees the final DOM.
    await renderFeaturedTreatments(got);
    // Fill the Home → Pricing / Memberships plan cards (sync, no fetch).
    renderPricingPlans(got);
    // Gallery → Instagram CTA: link + label derived from the handle setting.
    renderInstagramCTA(got);
    // Membership → tier cards (sync).
    renderMembershipTiers(got);
    // Membership → Portal preview: bullets list + CTA button label.
    renderPortalExtras(got);
    // Membership → FAQ Q/A list (sync).
    renderFaqList(got);
    // Contact → Subject dropdown options + Hours table (sync).
    renderContactExtras(got);
    // Contact → top info cards (call / whatsapp / email / location).
    renderContactCards(got);
    // Site-wide WhatsApp CTA links — label + href derived from the
    // page-footer.contact.whatsapp setting. Sync.
    renderWhatsappLinks(got);
    // Home → marquee strip items (sync).
    renderMarquee(got);
    // Signal that CMS content is on the page so the i18n layer can (re)translate.
    try { document.dispatchEvent(new CustomEvent('taj-cms-applied')); } catch (_) {}
  }

  // Cache of last resolved settings map for language-toggle re-renders.
  let LAST_GOT = {};

  // Pick a string for the current language. Falls back to enVal.
  // When in Arabic, prefers the value in TAJ_I18N.cms (which is merged with
  // any admin-saved page-X_ar overrides by i18n.js).
  function pickI18n(key, enVal) {
    const isAR = (document.documentElement.getAttribute('lang') || 'en') === 'ar';
    if (!isAR) return enVal;
    const cms = (window.TAJ_I18N && window.TAJ_I18N.cms) || {};
    const v = cms[key];
    return (typeof v === 'string' && v) ? v : enVal;
  }

  function renderContactCards(got) {
    const cfg = ((got['page-contact'] || DEFAULTS['page-contact'] || {}).cards) || {};
    const setText = (id, key) => {
      const el = document.getElementById(id);
      if (el && cfg[key] != null && cfg[key] !== '') el.textContent = pickI18n('page-contact.cards.' + key, cfg[key]);
    };
    const digits = s => String(s || '').replace(/\D+/g, '').replace(/^0+/, '');
    // Call card — two tel links (numbers aren't translated)
    const c1 = document.getElementById('cc-call-1');
    if (c1 && cfg.call1) { c1.textContent = cfg.call1; c1.setAttribute('href', 'tel:+' + digits(cfg.call1)); }
    const c2 = document.getElementById('cc-call-2');
    if (c2 && cfg.call2) { c2.textContent = cfg.call2; c2.setAttribute('href', 'tel:+' + digits(cfg.call2)); }
    setText('cc-call-title', 'callTitle');
    // WhatsApp card
    const wa = document.getElementById('cc-wa-num');
    if (wa && cfg.waNum) { wa.textContent = cfg.waNum; wa.setAttribute('href', 'https://wa.me/' + digits(cfg.waNum)); }
    setText('cc-wa-title', 'waTitle');
    setText('cc-wa-sub', 'waSub');
    // Email card
    const em = document.getElementById('cc-email-addr');
    if (em && cfg.emailAddr) { em.textContent = cfg.emailAddr; em.setAttribute('href', 'mailto:' + cfg.emailAddr); }
    setText('cc-email-title', 'emailTitle');
    setText('cc-email-sub', 'emailSub');
    // Location card
    setText('cc-loc-title', 'locTitle');
    setText('cc-loc-1', 'loc1');
    setText('cc-loc-2', 'loc2');
  }

  function renderContactExtras(got) {
    const page = got['page-contact'] || DEFAULTS['page-contact'] || {};
    const esc = s => String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;' })[c]);
    // Subject dropdown — rebuild options if provided
    const select = document.querySelector('#contact-form select[name="subject"]');
    const optsStr = pickI18n('page-contact.form.subjectOptions', (page.form || {}).subjectOptions);
    if (select && typeof optsStr === 'string' && optsStr.trim()) {
      select.innerHTML = optsStr.split(/\r?\n/)
        .map(l => l.replace(/\s+$/, ''))
        .filter(l => l.length)
        .map(l => `<option>${esc(l)}</option>`).join('');
    }
    // Submit button label
    const btn = document.querySelector('#contact-form button[type="submit"]');
    const btnText = pickI18n('page-contact.form.buttonText', (page.form || {}).buttonText);
    if (btn && btnText) {
      const icon = btn.querySelector('i');
      btn.innerHTML = (icon ? icon.outerHTML + ' ' : '') + esc(btnText);
    }
    // Hours list — rebuild from "Day | Time" lines
    const ul = document.getElementById('contact-hours-list');
    const hoursStr = pickI18n('page-contact.hours.list', (page.hours || {}).list);
    if (ul && typeof hoursStr === 'string' && hoursStr.trim()) {
      ul.innerHTML = hoursStr.split(/\r?\n/)
        .map(l => l.replace(/\s+$/, ''))
        .filter(l => l.length)
        .map(line => {
          const [day, ...rest] = line.split('|');
          const time = rest.join('|').trim();
          return `<li><span class="day">${esc((day||'').trim())}</span> <span class="time">${esc(time)}</span></li>`;
        }).join('');
    }
  }

  function renderFaqList(got) {
    const container = document.getElementById('faq-list');
    if (!container) return;
    const cfg = ((got['page-membership'] || DEFAULTS['page-membership'] || {}).faq) || {};
    const items = pickI18n('page-membership.faq.items', typeof cfg.items === 'string' ? cfg.items : '');
    if (!items || !items.trim()) return;
    const esc = s => String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;' })[c]);
    const pairs = [];
    let currentQ = null;
    let currentA = [];
    const flush = () => {
      if (currentQ) pairs.push({ q: currentQ, a: currentA.join(' ').trim() });
      currentQ = null; currentA = [];
    };
    items.split(/\r?\n/).forEach(rawLine => {
      const line = rawLine.replace(/\s+$/, '');
      if (!line.trim()) { flush(); return; }
      const qm = /^\s*Q\s*[:.\-]\s*(.+)$/i.exec(line);
      const am = /^\s*A\s*[:.\-]\s*(.+)$/i.exec(line);
      if (qm) { flush(); currentQ = qm[1].trim(); }
      else if (am) { currentA.push(am[1].trim()); }
      else if (currentA.length) { currentA.push(line.trim()); }
      else if (currentQ) { currentQ += ' ' + line.trim(); }
    });
    flush();
    if (!pairs.length) return;
    container.innerHTML = pairs.map((p, i) => {
      const last = i === pairs.length - 1;
      const wrapStyle = last ? 'padding: 26px 0;' : 'border-bottom: 1px solid var(--c-line); padding: 26px 0;';
      return `<div style="${wrapStyle}">
        <h4 style="font-family: var(--f-display); font-weight: 500; margin-bottom: 10px;">${esc(p.q)}</h4>
        <p style="color: var(--c-text-soft);">${esc(p.a)}</p>
      </div>`;
    }).join('');
  }

  function renderPortalExtras(got) {
    const cfg = ((got['page-membership'] || DEFAULTS['page-membership'] || {}).portal) || {};
    const esc = s => String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;' })[c]);
    const ul = document.getElementById('portal-bullets');
    const bulletsStr = pickI18n('page-membership.portal.bullets', cfg.bullets);
    if (ul && typeof bulletsStr === 'string') {
      ul.innerHTML = bulletsStr.split(/\r?\n/)
        .map(l => l.replace(/\s+$/, ''))
        .filter(l => l.length)
        .map(l => `<li>${esc(l)}</li>`).join('');
    }
    const btn = document.getElementById('portal-cta-btn');
    if (btn && cfg.ctaLabel) {
      const icon = btn.querySelector('i');
      btn.innerHTML = (icon ? icon.outerHTML + ' ' : '') + esc(pickI18n('page-membership.portal.ctaLabel', cfg.ctaLabel));
    }
  }

  function renderMembershipTiers(got) {
    const grid = document.querySelector('.mtier-grid');
    if (!grid) return;
    const cfg = got['page-membership'] || DEFAULTS['page-membership'] || {};
    const shared = cfg.tiersShared || {};
    const esc = s => String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;' })[c]);
    const fmtPerk = line => esc(line).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Resolve tiers: prefer new array shape (cfg.tierList.tiers), fall
    // back to legacy silver/gold/platinum keys for old saved data.
    let tiers = (cfg.tierList && Array.isArray(cfg.tierList.tiers)) ? cfg.tierList.tiers : null;
    if (!tiers || !tiers.length) {
      tiers = [];
      ['silver','gold','platinum'].forEach((k) => {
        const t = cfg[k];
        if (t) tiers.push(Object.assign({
          featured: k === 'gold',
          icon: ({ silver:'fas fa-gem', gold:'fas fa-crown', platinum:'fas fa-star' })[k]
        }, t));
      });
    }
    if (!tiers.length) return;

    const badgeText   = pickI18n('page-membership.tiersShared.badgeText',  shared.badgeText  || 'Most Popular');
    const perksLabel  = pickI18n('page-membership.tiersShared.perksLabel', shared.perksLabel || 'Included Annually');
    const slugMap = ['silver', 'gold', 'platinum']; // first three keep their original class for styling parity

    grid.innerHTML = tiers.map((tRaw, i) => {
      // Per-tier i18n key prefix: use slugMap for first three so existing
      // Arabic dictionary keys still apply; later additions get t<idx>.
      const slug = slugMap[i] || ('t' + (i + 1));
      const t = {
        tier:     pickI18n(`page-membership.${slug}.tier`,     tRaw.tier),
        name:     pickI18n(`page-membership.${slug}.name`,     tRaw.name),
        sub:      pickI18n(`page-membership.${slug}.sub`,      tRaw.sub),
        unit:     pickI18n(`page-membership.${slug}.unit`,     tRaw.unit),
        perks:    pickI18n(`page-membership.${slug}.perks`,    tRaw.perks),
        ctaLabel: pickI18n(`page-membership.${slug}.ctaLabel`, tRaw.ctaLabel)
      };
      const cls = ['mtier', 'reveal', i ? `delay-${i}` : '', tRaw.featured ? 'mtier--gold' : `mtier--${slug}`]
        .filter(Boolean).join(' ');
      const iconCls = tRaw.icon || 'fas fa-gem';
      const badge = tRaw.featured ? `<span class="mtier__badge">${esc(badgeText)}</span>` : '';
      const priceNum = (tRaw.price != null && tRaw.price !== '') ? esc(String(tRaw.price)) : '';
      const priceUnit = (t.unit != null && t.unit !== '') ? `<small>${esc(t.unit)}</small>` : '';
      const perksHtml = (typeof t.perks === 'string') ? t.perks.split(/\r?\n/)
        .map(l => l.replace(/\s+$/, '')).filter(l => l.length)
        .map(line => `<li>${fmtPerk(line)}</li>`).join('') : '';
      // Build CTA href + class — gold/featured uses gold button, others outline
      const ctaSlug = (tRaw.tier || `Tier${i+1}`).replace(/[^A-Za-z0-9]+/g, '');
      const ctaHref = `member-signup.html?tier=${encodeURIComponent(ctaSlug)}`;
      const ctaCls  = 'btn ' + (tRaw.featured ? 'btn--gold' : 'btn--outline') + ' btn--block';
      const ctaIcon = `<i class="${esc(iconCls)}"></i>`;
      return `<article class="${cls}">
        ${badge}
        <div class="mtier__crown"><i class="${esc(iconCls)}"></i></div>
        <span class="mtier__tier">${esc(t.tier || '')}</span>
        <h3>${esc(t.name || '')}</h3>
        <p class="mtier__sub">${esc(t.sub || '')}</p>
        <div class="mtier__price">${priceNum}${priceUnit}</div>
        <div class="mtier__divider"></div>
        <span class="mtier__perks-label">${esc(perksLabel)}</span>
        <ul class="mtier__perks">${perksHtml}</ul>
        <a href="${ctaHref}" class="${ctaCls}">${ctaIcon} ${esc(t.ctaLabel || '')}</a>
      </article>`;
    }).join('');
  }

  function renderMarquee(got) {
    const track = document.querySelector('.marquee .marquee__track');
    if (!track) return;
    const cfg = ((got['page-home'] || DEFAULTS['page-home'] || {}).marquee) || {};
    const itemsStr = pickI18n('page-home.marquee.items', cfg.items);
    if (typeof itemsStr !== 'string' || !itemsStr.trim()) return;
    const esc = s => String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;' })[c]);
    const items = itemsStr.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (!items.length) return;
    // Duplicate the list so the CSS scroll animation has continuous content
    const doubled = items.concat(items);
    track.innerHTML = doubled.map(t => `<span class="marquee__item">${esc(t)}</span>`).join('');
  }

  function renderWhatsappLinks(got) {
    const links = document.querySelectorAll('[data-whatsapp-link]');
    if (!links.length) return;
    const cfg = ((got['page-footer'] || DEFAULTS['page-footer'] || {}).contact) || {};
    const raw = (cfg.whatsapp || '').trim();
    if (!raw) return;
    // Build href: digits only for wa.me, drop "+" and any leading zeros
    const digits = raw.replace(/\D+/g, '').replace(/^0+/, '');
    if (!digits) return;
    const href = 'https://wa.me/' + digits;
    links.forEach(a => {
      a.setAttribute('href', href);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
      const labelEl = a.querySelector('[data-whatsapp-label]');
      if (labelEl) labelEl.textContent = raw;
    });
  }

  function renderInstagramCTA(got) {
    const link = document.getElementById('instagram-cta-link');
    const label = document.getElementById('instagram-cta-handle');
    if (!link || !label) return;
    const cfg = ((got['page-gallery'] || DEFAULTS['page-gallery'] || {}).instagram) || {};
    const raw = (cfg.handle || '').trim();
    if (!raw) return;
    // Accept @handle, handle, or a full URL — derive both display label and href
    let handle = raw;
    if (/^https?:\/\//i.test(raw)) {
      try {
        const u = new URL(raw);
        handle = u.pathname.replace(/^\//, '').replace(/\/.*$/, '');
      } catch (_) { /* fall through */ }
    }
    handle = handle.replace(/^@+/, '').replace(/\/+$/, '');
    if (!handle) return;
    label.textContent = '@' + handle;
    link.setAttribute('href', 'https://www.instagram.com/' + handle);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener');
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

  // Re-fetch CMS settings whenever the user comes back to this tab. Catches
  // the common flow of editing in /admin and switching back to the public
  // site to verify — without this the page would still show stale settings
  // until the next full reload. Debounced to ignore rapid switches.
  let __refetchTimer = null;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    if (__refetchTimer) clearTimeout(__refetchTimer);
    __refetchTimer = setTimeout(() => { try { load(); } catch (_) {} }, 250);
  });

  // When i18n flips the language, re-run the imperatively-built sections
  // (membership tiers, comparison table, portal preview, FAQ, contact extras,
  // pricing plans) so their copy switches with the chosen language.
  document.addEventListener('taj-lang-applied', () => {
    const got = LAST_GOT || {};
    try { renderPricingPlans(got); } catch (_) {}
    try { renderMembershipTiers(got); } catch (_) {}
    try { renderPortalExtras(got); } catch (_) {}
    try { renderFaqList(got); } catch (_) {}
    try { renderContactExtras(got); } catch (_) {}
    try { renderContactCards(got); } catch (_) {}
    try { renderWhatsappLinks(got); } catch (_) {}
    try { renderMarquee(got); } catch (_) {}
  });

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
