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
      silver: {
        tier: 'Silver',
        name: 'The Companion',
        sub:  'An invitation to begin — a year of considered moments.',
        price: '150',
        unit:  'BHD · per year',
        perks: '**2 complimentary** 60-min signature massages\n**1 complimentary** Foot Reflexology ritual\n**10% off** all additional treatments\nPriority booking — 24 hours ahead\nWelcome ritual on signup\nBirthday gift — free Foot Relaxing\nMember-only seasonal offers',
        ctaLabel: 'Become Silver'
      },
      gold: {
        tier: 'Gold',
        name: 'The Sanctuary',
        sub:  'A generous year of regular restoration and signature care.',
        price: '350',
        unit:  'BHD · per year',
        perks: '**6 complimentary** 60-min signature massages\n**1 Royal Hammam** ritual included\n**2 complimentary** foot rituals\n**15% off** all additional treatments\nPriority booking — 48 hours ahead\n**1 guest pass** per year\nWelcome Hammam ritual on signup\nBirthday spa journey (90 min)\nMembers-only seasonal events',
        ctaLabel: 'Become Gold'
      },
      platinum: {
        tier: 'Platinum',
        name: 'The Royal Circle',
        sub:  'Unlimited stillness — the highest tier of care, for the most devoted.',
        price: '750',
        unit:  'BHD · per year',
        perks: '**Unlimited** signature massages (max 2/month)\n**12 Royal Hammams** per year\n**4 Hot Stone** sessions included\n**20% off** additional treatments & products\nPriority booking — anytime\n**4 guest passes** per year\nWelcome Sultan Suite ritual\nPersonal therapist match\nBirthday Day at the Spa (4 hours)\nAnnual gift box of premium products\nConcierge appointment scheduling',
        ctaLabel: 'Become Platinum'
      },
      hero: {
        eyebrow: 'MEMBERSHIP',
        title:   'The Taj Al Sukun *Membership*.',
        subtitle:'An annual circle of complimentary services, member-only pricing, and priority care.',
        image:   'assets/images/sanctuary-bed.jpg'
      },
      compare: {
        eyebrow: 'Compare All Tiers',
        title:   'Every benefit, *side by side*.',
        headerBenefit: 'Benefit',
        colSilver:     'Silver',
        colGold:       'Gold',
        colPlatinum:   'Platinum',
        rows: '== Annual Investment\n**Price per year** | 150 BHD | 350 BHD | 750 BHD\n\n== Complimentary Services\n60-min signature massages | 2 | 6 | Unlimited (2/mo)\nRoyal Hammam rituals | x | 1 | 12 per year\nFoot rituals (reflexology) | 1 | 2 | Unlimited\nHot Stone sessions | x | x | 4 per year\n\n== Member Pricing\nDiscount on additional treatments | 10% | 15% | 20%\nDiscount on retail products | x | 10% | 20%\n\n== Booking & Privileges\nPriority booking window | 24 hours | 48 hours | Anytime\nGuest passes per year | x | 1 | 4\nPersonal therapist match | x | x | ✓\nConcierge scheduling | x | x | ✓\n\n== Welcome & Special Occasions\nWelcome ritual on signup | Foot Relaxing | Hammam | Sultan Suite\nBirthday gift | Foot Relaxing | 90-min spa journey | 4-hour spa day\nAnnual product gift box | x | x | ✓\nMembers-only events | x | ✓ | ✓',
        ctaLabel: 'Speak with our team',
        ctaUrl:   "https://wa.me/97335194422?text=I'd%20like%20to%20learn%20more%20about%20Taj%20Al%20Sukun%20Membership"
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
        s1Body:  'Silver, Gold, or Platinum — pick the package that matches your rhythm.',
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
        p3Body:  'Gold & Platinum members receive guest passes — share the stillness.',
        p4Title: 'Birthday Treat',
        p4Body:  'A complimentary celebration ritual on or around your birthday, every year.'
      },
      faq: {
        eyebrow: 'Frequently Asked',
        title:   'Questions, *answered*.',
        items: "Q: How long is membership valid?\nA: 12 months from the date of activation. Reminders are sent 30 days before renewal.\n\nQ: Can I share my membership with family?\nA: Memberships are personal, but Gold and Platinum tiers include guest passes for sharing. Family memberships available — speak with our team.\n\nQ: What happens if I don't use all my included services?\nA: Unused services don't roll over, but you receive renewal incentives if you've used the majority of your benefits in your first year.\n\nQ: Can I upgrade from Silver to Gold mid-year?\nA: Yes. The pro-rated difference is applied and your benefits upgrade immediately.\n\nQ: How do I pay?\nA: Pay in person at the spa, by bank transfer, or via our secure online payment link sent over WhatsApp.\n\nQ: Are corporate or wellness packages available?\nA: Yes — we offer customized corporate wellness memberships for teams of 5 or more. Contact us for details."
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

    applyContent(got);
    // Fill the Home → Signature Treatments featured cards from the services
    // master if slot IDs are configured. Awaited so i18n sees the final DOM.
    await renderFeaturedTreatments(got);
    // Fill the Home → Pricing / Memberships plan cards (sync, no fetch).
    renderPricingPlans(got);
    // Gallery → Instagram CTA: link + label derived from the handle setting.
    renderInstagramCTA(got);
    // Membership → 3 tier cards (sync).
    renderMembershipTiers(got);
    // Membership → comparison table (sync).
    renderComparisonTable(got);
    // Membership → Portal preview: bullets list + CTA button label.
    renderPortalExtras(got);
    // Membership → FAQ Q/A list (sync).
    renderFaqList(got);
    // Contact → Subject dropdown options + Hours table (sync).
    renderContactExtras(got);
    // Signal that CMS content is on the page so the i18n layer can (re)translate.
    try { document.dispatchEvent(new CustomEvent('taj-cms-applied')); } catch (_) {}
  }

  function renderContactExtras(got) {
    const page = got['page-contact'] || DEFAULTS['page-contact'] || {};
    const esc = s => String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;' })[c]);
    // Subject dropdown — rebuild options if provided
    const select = document.querySelector('#contact-form select[name="subject"]');
    const optsStr = (page.form || {}).subjectOptions;
    if (select && typeof optsStr === 'string' && optsStr.trim()) {
      select.innerHTML = optsStr.split(/\r?\n/)
        .map(l => l.replace(/\s+$/, ''))
        .filter(l => l.length)
        .map(l => `<option>${esc(l)}</option>`).join('');
    }
    // Submit button label
    const btn = document.querySelector('#contact-form button[type="submit"]');
    const btnText = (page.form || {}).buttonText;
    if (btn && btnText) {
      const icon = btn.querySelector('i');
      btn.innerHTML = (icon ? icon.outerHTML + ' ' : '') + esc(btnText);
    }
    // Hours list — rebuild from "Day | Time" lines
    const ul = document.getElementById('contact-hours-list');
    const hoursStr = (page.hours || {}).list;
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
    const items = typeof cfg.items === 'string' ? cfg.items : '';
    if (!items.trim()) return;
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
    if (ul && typeof cfg.bullets === 'string') {
      ul.innerHTML = cfg.bullets.split(/\r?\n/)
        .map(l => l.replace(/\s+$/, ''))
        .filter(l => l.length)
        .map(l => `<li>${esc(l)}</li>`).join('');
    }
    const btn = document.getElementById('portal-cta-btn');
    if (btn && cfg.ctaLabel) {
      const icon = btn.querySelector('i');
      btn.innerHTML = (icon ? icon.outerHTML + ' ' : '') + esc(cfg.ctaLabel);
    }
  }

  function renderComparisonTable(got) {
    const table = document.querySelector('table.compare');
    if (!table) return;
    const cfg = ((got['page-membership'] || DEFAULTS['page-membership'] || {}).compare) || {};
    const esc = s => String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;' })[c]);
    const fmtInline = s => esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    const thead = table.querySelector('thead tr');
    if (thead) {
      if (cfg.headerBenefit && thead.children[0]) thead.children[0].textContent = cfg.headerBenefit;
      if (cfg.colSilver     && thead.children[1]) thead.children[1].textContent = cfg.colSilver;
      if (cfg.colGold       && thead.children[2]) thead.children[2].textContent = cfg.colGold;
      if (cfg.colPlatinum   && thead.children[3]) thead.children[3].textContent = cfg.colPlatinum;
    }
    if (typeof cfg.rows === 'string') {
      const tbody = table.querySelector('tbody');
      if (tbody) {
        const out = [];
        cfg.rows.split(/\r?\n/).forEach(rawLine => {
          const line = rawLine.replace(/\s+$/, '');
          if (!line) return;
          if (/^==\s+/.test(line)) {
            const title = line.replace(/^==\s+/, '');
            out.push(`<tr class="section-row"><td colspan="4">${esc(title)}</td></tr>`);
            return;
          }
          const parts = line.split('|').map(p => p.trim());
          const label = parts[0] || '';
          const vals  = parts.slice(1, 4);
          while (vals.length < 3) vals.push('');
          const cellHtml = (v, i) => {
            const lower = String(v).toLowerCase();
            let html;
            if (lower === 'x' || lower === '×' || lower === '-') html = '<i class="fas fa-times"></i>';
            else if (lower === '✓' || lower === 'check' || lower === 'yes' || lower === '✔') html = '<i class="fas fa-check"></i>';
            else {
              const m = /^(\d+(?:\.\d+)?)\s+BHD\s*$/i.exec(v);
              if (m) html = `<span class="compare__price">${esc(m[1])}<small>BHD</small></span>`;
              else html = fmtInline(v);
            }
            const cls = i === 1 ? 'tier-col gold-col' : 'tier-col';
            return `<td class="${cls}">${html}</td>`;
          };
          out.push(`<tr><td>${fmtInline(label)}</td>${vals.map(cellHtml).join('')}</tr>`);
        });
        tbody.innerHTML = out.join('');
      }
    }
    const btn = document.querySelector('a.btn--whatsapp');
    if (btn) {
      if (cfg.ctaUrl)   btn.setAttribute('href', cfg.ctaUrl);
      if (cfg.ctaLabel) {
        const icon = btn.querySelector('i');
        btn.innerHTML = (icon ? icon.outerHTML + ' ' : '') + esc(cfg.ctaLabel);
      }
    }
  }

  function renderMembershipTiers(got) {
    const cards = document.querySelectorAll('.mtier-grid .mtier');
    if (!cards.length) return;
    const cfg = got['page-membership'] || DEFAULTS['page-membership'] || {};
    const shared = cfg.tiersShared || {};
    const esc = s => String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;' })[c]);
    const fmtPerk = line => esc(line).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    ['silver','gold','platinum'].forEach((key, i) => {
      const card = cards[i];
      if (!card) return;
      const t = cfg[key];
      if (!t) return;
      const tierEl = card.querySelector('.mtier__tier');
      if (tierEl && t.tier) tierEl.textContent = t.tier;
      const nameEl = card.querySelector('h3');
      if (nameEl && t.name) nameEl.textContent = t.name;
      const subEl = card.querySelector('.mtier__sub');
      if (subEl && t.sub) subEl.textContent = t.sub;
      const priceEl = card.querySelector('.mtier__price');
      if (priceEl && (t.price != null || t.unit != null)) {
        const num = t.price != null && t.price !== '' ? esc(String(t.price)) : '';
        const sm  = t.unit != null && t.unit !== ''  ? `<small>${esc(t.unit)}</small>` : '';
        priceEl.innerHTML = num + sm;
      }
      const perksLabelEl = card.querySelector('.mtier__perks-label');
      if (perksLabelEl && shared.perksLabel) perksLabelEl.textContent = shared.perksLabel;
      const ul = card.querySelector('.mtier__perks');
      if (ul && typeof t.perks === 'string') {
        ul.innerHTML = t.perks.split(/\r?\n/)
          .map(l => l.replace(/\s+$/, ''))
          .filter(l => l.length)
          .map(line => `<li>${fmtPerk(line)}</li>`)
          .join('');
      }
      const btn = card.querySelector('a.btn');
      if (btn && t.ctaLabel) {
        const icon = btn.querySelector('i');
        btn.innerHTML = (icon ? icon.outerHTML + ' ' : '') + esc(t.ctaLabel);
      }
    });
    const goldBadge = cards[1]?.querySelector('.mtier__badge');
    if (goldBadge && shared.badgeText) goldBadge.textContent = shared.badgeText;
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

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
