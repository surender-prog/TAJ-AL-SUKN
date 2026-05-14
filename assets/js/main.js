/* Taj Al Sukn — Front-end interactions */

/* ---------- Header (sticky / transparent over hero) ---------- */
(function () {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const startsTransparent = header.classList.contains('hero-on-top');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 30);
    if (startsTransparent) header.classList.toggle('hero-on-top', y < 80);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ---------- Mobile nav ---------- */
(function () {
  const nav = document.querySelector('.nav');
  const tog = document.querySelector('.nav__toggle');
  const links = document.querySelectorAll('.nav__menu a');
  if (!nav || !tog) return;
  tog.addEventListener('click', () => {
    nav.classList.toggle('nav--open');
    document.body.style.overflow = nav.classList.contains('nav--open') ? 'hidden' : '';
  });
  links.forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('nav--open');
    document.body.style.overflow = '';
  }));

  const path = (location.pathname.split('/').pop() || 'index.html');
  links.forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
    else a.classList.remove('active');
  });
})();

/* ---------- Reveal on scroll ---------- */
(function () {
  const reveal = () => {
    const els = document.querySelectorAll('.reveal:not(.visible)');
    if (!('IntersectionObserver' in window)) {
      els.forEach(e => e.classList.add('visible')); return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
    els.forEach(e => io.observe(e));

    const checkVisibility = () => {
      document.querySelectorAll('.reveal:not(.visible)').forEach(e => {
        const r = e.getBoundingClientRect();
        if (r.top < window.innerHeight - 40 && r.bottom > 0) e.classList.add('visible');
      });
    };
    window.addEventListener('scroll', checkVisibility, { passive: true });
    setTimeout(checkVisibility, 200);
    setTimeout(checkVisibility, 800);
    setTimeout(() => {
      document.querySelectorAll('.reveal:not(.visible)').forEach(e => e.classList.add('visible'));
    }, 2500);
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', reveal);
  } else { reveal(); }
})();

/* ---------- Services grid rendered from admin store ----------
   On services.html (#svc-grid) and the home page "Treatments" rail
   we render cards dynamically from the taj-services localStorage
   master, so admin changes flow through to the website immediately.
   If the store is empty, we keep the markup that already exists
   in the HTML as a fallback. */
(function () {
  const grid = document.getElementById('svc-grid');
  if (!grid) return;
  let list = [];
  try { list = JSON.parse(localStorage.getItem('taj-services') || '[]') || []; }
  catch (_) {}
  // Filter for public consumption + sort
  const visible = list
    .filter(s => s && s.status === 'active' && s.show_on_website !== false)
    .filter(s => !s.member_only || (window.TajMember && TajMember.isSignedIn()))
    .sort((a, b) => (a.sort || 0) - (b.sort || 0) || (a.name || '').localeCompare(b.name || ''));

  if (!visible.length) return; // keep the static fallback markup

  const catClass = c => (c || 'massage').toLowerCase();
  const altPriceStr = s => s.price_alt ? `${s.price} / ${s.price_alt}` : `${s.price}`;
  grid.innerHTML = visible.map((s, i) => {
    const tagText = s.tag || (s.category === 'Hammam' ? 'Hammam' :
                              s.category === 'Foot'   ? 'Foot Ritual' :
                              s.category === 'Couple' ? 'Couple' :
                              s.category === 'Package'? 'Package' :
                              'Massage');
    const delay = ['', 'delay-1', 'delay-2'][i % 3];
    const dataCat = (s.tag === 'Signature' ? 'signature ' : '') + catClass(s.category);
    return `
      <article class="svc-card reveal ${delay}" data-category="${dataCat}" data-svc-id="${s.id}">
        <img src="${s.image || 'assets/images/spa-detail-1.jpg'}" alt="${(s.name || '').replace(/"/g,'&quot;')}">
        <span class="tag">${tagText}</span>
        <div class="svc-card__inner">
          <h4>${escapeHTML(s.name || '')}</h4>
          <p>${escapeHTML(s.description || '')}</p>
          <div class="row"><span class="dur">${escapeHTML(s.duration || '')}</span><span class="price">${altPriceStr(s)}<small>BHD</small></span></div>
        </div>
      </article>`;
  }).join('');

  function escapeHTML(s) {
    return String(s || '').replace(/[&<>"']/g, c =>
      ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]);
  }
})();

/* ---------- Service category filter ---------- */
(function () {
  const tabs  = document.querySelectorAll('.tab[data-filter]');
  const items = document.querySelectorAll('[data-category]');
  if (!tabs.length) return;
  tabs.forEach(t => {
    t.addEventListener('click', () => {
      tabs.forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      const f = t.dataset.filter;
      items.forEach(i => {
        const ok = f === 'all' || i.dataset.category.split(' ').includes(f);
        i.style.display = ok ? '' : 'none';
      });
    });
  });
})();

/* ---------- Click a service / package card → go to booking ---------- *
   Every .svc-card (services grid) and .svc-row (packages list) on the
   Services page becomes a button that takes you to booking.html with
   the selected service pre-filled as a query param. */
(function () {
  const cards = document.querySelectorAll('.svc-card, .svc-row');
  if (!cards.length) return;

  cards.forEach(card => {
    // Get the service title from the heading inside
    const heading = card.querySelector('h4, h5');
    if (!heading) return;
    const name = heading.textContent.trim();
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Book ${name}`);
    card.classList.add('svc-card--clickable');

    function go() {
      const target = 'booking.html?service=' + encodeURIComponent(name);
      window.location.href = target;
    }
    card.addEventListener('click', go);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
    });
  });
})();

/* ---------- Lightbox ---------- */
(function () {
  const items = document.querySelectorAll('.bento__item, .gallery-item');
  if (!items.length) return;
  const box = document.createElement('div');
  box.className = 'lightbox';
  box.innerHTML = '<button class="lightbox__close" aria-label="Close">×</button><img alt="">';
  document.body.appendChild(box);
  const img = box.querySelector('img');
  const close = box.querySelector('.lightbox__close');
  items.forEach(it => it.addEventListener('click', () => {
    const i = it.querySelector('img'); if (!i) return;
    img.src = i.src;
    box.classList.add('open');
    document.body.style.overflow = 'hidden';
  }));
  const closeBox = () => { box.classList.remove('open'); document.body.style.overflow = ''; };
  close.addEventListener('click', closeBox);
  box.addEventListener('click', e => { if (e.target === box) closeBox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeBox(); });
})();

/* ---------- Toast ---------- */
function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 3500);
}

/* ---------- Booking service picker (rendered from admin store) ----------
   Runs before the booking flow IIFE below so the .pick labels exist
   before update() queries them. */
(function () {
  const pickContainer = document.getElementById('svc-pick');
  if (!pickContainer) return;
  let list = [];
  try { list = JSON.parse(localStorage.getItem('taj-services') || '[]') || []; }
  catch (_) {}
  const isMember = window.TajMember && TajMember.isSignedIn();
  const visible = list
    .filter(s => s && s.status === 'active' && s.show_in_booking !== false)
    .filter(s => !s.member_only || isMember)
    .sort((a, b) => (a.sort || 0) - (b.sort || 0) || (a.name || '').localeCompare(b.name || ''));
  if (!visible.length) return; // keep static fallback

  function escAttr(s) { return String(s || '').replace(/"/g, '&quot;'); }
  function escHTML(s) {
    return String(s || '').replace(/[&<>"']/g, c =>
      ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]);
  }
  // Default the first item to selected
  pickContainer.innerHTML = visible.map((s, i) => {
    // Subtitle: duration plus a Signature/category accent
    const sub = (s.duration || '') + (s.tag ? ' · ' + s.tag : (s.category ? ' · ' + s.category : ''));
    const sel = i === 0 ? ' selected' : '';
    const checked = i === 0 ? ' checked' : '';
    return `
      <label class="pick${sel}" data-name="${escAttr(s.name)}" data-price="${s.price}">
        <input type="radio" name="service" value="${escAttr(s.name)}"${checked}>
        <span class="dot"></span>
        <div class="info"><h6>${escHTML(s.name)}</h6><span>${escHTML(sub)}</span></div>
        <span class="price">${s.price}<small style="font-size:0.65rem; letter-spacing:0.18em; color:var(--c-text-soft); margin-left:4px; font-style:normal; font-family: var(--f-body); font-weight: 600;">BHD</small></span>
      </label>`;
  }).join('');
})();

/* ---------- Booking flow with Member discount ---------- */
(function () {
  const form = document.getElementById('booking-form');
  if (!form) return;

  // Member toggle
  const memberToggle = document.getElementById('member-toggle');
  const memberHead   = document.getElementById('member-toggle-head');
  const memberTier   = document.getElementById('member-tier');
  const memberId     = document.getElementById('member-id');

  if (memberHead && memberToggle) {
    memberHead.addEventListener('click', () => {
      memberToggle.classList.toggle('active');
      update();
    });
  }
  if (memberTier) memberTier.addEventListener('change', update);
  if (memberId) memberId.addEventListener('input', update);

  // Auto-fill from signed-in member session, if any
  if (window.TajMember && TajMember.isSignedIn()) {
    const me = TajMember.current();
    const banner = document.getElementById('member-banner');

    // Hide the guest member-toggle entirely — their tier / ID are already known
    if (memberToggle) memberToggle.hidden = true;

    // Show & populate the signed-in banner
    if (banner) {
      banner.hidden = false;
      const tier = me.tier || 'Member';
      const tierToDiscount = { Silver: 10, Gold: 15, Platinum: 20 };
      const discount = me.discount || tierToDiscount[tier] || 0;
      const first = (me.name || '').split(' ')[0] || 'Member';
      const av = (me.name || '').trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase() || '—';

      document.getElementById('mb-avatar').textContent = av;
      document.getElementById('mb-first').textContent = first;
      const chip = document.getElementById('mb-tier-chip');
      chip.textContent = tier + ' Member';
      chip.className = 'member-banner__chip member-banner__chip--' + tier.toLowerCase();
      document.getElementById('mb-id').textContent = me.id || '—';
      document.getElementById('mb-discount').textContent = discount + '%';

      // Hidden form fields so the booking record still carries member info
      const tierH = document.getElementById('member-tier-hidden');
      const idH   = document.getElementById('member-id-hidden');
      if (tierH) tierH.value = tier;
      if (idH)   idH.value   = me.id || '';

      // "Not you?" link — sign out and reload (guest mode)
      document.getElementById('mb-switch')?.addEventListener('click', e => {
        e.preventDefault();
        if (!confirm('Sign out and continue as a guest?')) return;
        try { localStorage.removeItem('taj-member-session'); } catch (_) {}
        location.reload();
      });

      // Mark the toggle as "active" so update() applies the discount.
      // We do this even though it's hidden — update() reads memberToggle.classList.
      if (memberToggle) memberToggle.classList.add('active');
      // Inject a synthetic option onto memberTier so dataset.discount is correct
      if (memberTier) {
        // Make sure the current tier exists as an option (it should)
        const opt = Array.from(memberTier.options).find(o => o.value === tier);
        if (opt) memberTier.value = tier;
      }
      if (memberId) memberId.value = me.id || '';
    }

    // Pre-fill guest fields too
    const nameField = form.querySelector('[name=name]');
    if (nameField && !nameField.value) nameField.value = me.name || '';
    const phoneField = form.querySelector('[name=phone]');
    if (phoneField && !phoneField.value) phoneField.value = me.phone || '';
    const emailField = form.querySelector('[name=email]');
    if (emailField && !emailField.value) emailField.value = me.email || '';
  }

  // Service picker
  const picks = form.querySelectorAll('.pick');
  picks.forEach(p => p.addEventListener('click', () => {
    picks.forEach(x => x.classList.remove('selected'));
    p.classList.add('selected');
    p.querySelector('input').checked = true;
    update();
  }));
  form.addEventListener('input', update);
  form.addEventListener('change', update);

  // Pre-select service from URL ?service=... (e.g. coming from services page)
  (function preselectFromUrl() {
    const requested = new URLSearchParams(location.search).get('service');
    if (!requested) return;
    const norm = s => (s || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\b(ritual|therapy|massage|package|relaxing|sanctuary|spa)\b/g, '')
      .trim();
    const reqN = norm(requested);
    if (!reqN) return;
    let best = null, bestScore = 0;
    picks.forEach(p => {
      const candidates = [
        p.dataset.name || '',
        (p.querySelector('h6') || {}).textContent || ''
      ].map(norm).filter(Boolean);
      candidates.forEach(cand => {
        // Score: full match → 10, prefix → 6, contains → 4, shared-words → 1+
        let score = 0;
        if (cand === reqN) score = 10;
        else if (cand.startsWith(reqN) || reqN.startsWith(cand)) score = 6;
        else if (cand.includes(reqN) || reqN.includes(cand)) score = 4;
        else {
          const reqWords = new Set(reqN.split(' '));
          const shared = cand.split(' ').filter(w => reqWords.has(w)).length;
          if (shared) score = shared;
        }
        if (score > bestScore) { bestScore = score; best = p; }
      });
    });
    if (best) {
      picks.forEach(x => x.classList.remove('selected'));
      best.classList.add('selected');
      const input = best.querySelector('input');
      if (input) input.checked = true;
      // Scroll the picked tile into view (after a tick so layout settles)
      setTimeout(() => best.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
      // Flash a subtle highlight
      best.classList.add('pick--just-set');
      setTimeout(() => best.classList.remove('pick--just-set'), 1600);
      update();
    }
  })();

  function update() {
    const sel = form.querySelector('.pick.selected');
    const name = (form.querySelector('[name=name]') || {}).value || '—';
    const date = (form.querySelector('[name=date]') || {}).value || '—';
    const time = (form.querySelector('[name=time]') || {}).value || '—';

    const sName  = document.getElementById('sum-service');
    const sPrice = document.getElementById('sum-price');
    const sDate  = document.getElementById('sum-date');
    const sTime  = document.getElementById('sum-time');
    const sTotal = document.getElementById('sum-total');
    const sNm    = document.getElementById('sum-name');

    // Member discount calculation
    const isMember = memberToggle && memberToggle.classList.contains('active');
    const tierOption = memberTier && memberTier.options[memberTier.selectedIndex];
    const discountPct = (isMember && tierOption && tierOption.dataset.discount)
      ? parseInt(tierOption.dataset.discount, 10) : 0;

    const basePrice = sel ? parseFloat(sel.dataset.price) : 0;
    const discountAmount = (basePrice * discountPct) / 100;
    const finalPrice = basePrice - discountAmount;

    if (sel && sName)  sName.textContent  = sel.dataset.name;
    if (sel && sPrice) sPrice.textContent = basePrice + ' BHD';
    if (sTotal) sTotal.textContent = finalPrice.toFixed(finalPrice % 1 ? 2 : 0) + ' BHD';
    if (sDate) sDate.textContent = date;
    if (sTime) sTime.textContent = time;
    if (sNm)   sNm.textContent   = name;

    // Toggle discount row + badge
    const discRow = document.getElementById('sum-member-row');
    const discAmt = document.getElementById('sum-discount');
    const discLbl = document.getElementById('sum-member-label');
    const memberBadge = document.getElementById('sum-member-badge');
    const memberBadgeTier = document.getElementById('sum-member-tier');

    if (discountPct > 0 && discRow && discAmt) {
      discRow.style.display = '';
      discLbl.textContent = (memberTier.value || 'Member') + ' Discount (' + discountPct + '%)';
      discAmt.textContent = '− ' + discountAmount.toFixed(discountAmount % 1 ? 2 : 0) + ' BHD';
      if (memberBadge) {
        memberBadge.style.display = '';
        memberBadgeTier.textContent = memberTier.value;
      }
    } else {
      if (discRow) discRow.style.display = 'none';
      if (memberBadge) memberBadge.style.display = 'none';
    }
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const sel = form.querySelector('.pick.selected');
    if (!sel) { showToast('Please pick a service'); return; }
    const d = new FormData(form);
    const isMember = memberToggle && memberToggle.classList.contains('active');
    const tier = isMember ? (memberTier.value || '—') : null;
    const id = isMember ? (memberId.value || '—') : null;
    const tierOption = memberTier && memberTier.options[memberTier.selectedIndex];
    const discountPct = (isMember && tierOption && tierOption.dataset.discount)
      ? parseInt(tierOption.dataset.discount, 10) : 0;
    const basePrice = parseFloat(sel.dataset.price);
    const finalPrice = basePrice * (1 - discountPct / 100);

    // Build the booking record + persist via the data layer (Supabase if online,
    // localStorage as cache; either way the admin/member portals will see it).
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn ? submitBtn.innerHTML : null;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending booking…';
    }

    const me = (window.TajMember && TajMember.isSignedIn()) ? TajMember.current() : null;
    const yr = new Date().getFullYear();
    const seq = String(Date.now()).slice(-4);
    const bookingId = 'BK-' + yr + '-' + seq;
    const booking = {
      id:       bookingId,
      name:     d.get('name')  || 'Guest',
      phone:    d.get('phone') || '—',
      email:    d.get('email') || '',
      memberId: me ? me.id : (id && id !== '—' ? id : null),
      service:  sel.dataset.name,
      tier:     isMember ? tier : null,
      price:    parseFloat(finalPrice.toFixed(3)),
      date:     d.get('date') || new Date().toISOString().split('T')[0],
      time:     d.get('time') || null,
      notes:    d.get('notes') || null,
      status:   'pending',
      source:   'website'
    };

    let savedRemote = false;
    try {
      if (window.TajData) {
        await TajData.bookings.upsert(booking);
        // Activity log (Supabase + localStorage)
        await TajData.activity.log({
          type: 'booking',
          title: 'New booking from website',
          desc:  `${booking.name} · ${booking.service} · ${booking.date}`,
          ref:   booking.id,
          refType: 'booking'
        });
        savedRemote = !!TajData.connected;
      } else {
        // Fallback if data layer didn't load for some reason
        const list = JSON.parse(localStorage.getItem('taj-bookings') || '[]') || [];
        list.unshift(booking);
        localStorage.setItem('taj-bookings', JSON.stringify(list));
      }
    } catch (err) {
      console.warn('[booking] save failed:', err);
      // Last-resort offline cache so the admin still sees it
      try {
        const list = JSON.parse(localStorage.getItem('taj-bookings') || '[]') || [];
        list.unshift(booking);
        localStorage.setItem('taj-bookings', JSON.stringify(list));
      } catch (_) {}
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalLabel || '<i class="fab fa-whatsapp"></i> Send via WhatsApp';
    }

    const lines = [
      'Hello Taj Al Sukn Spa, I would like to book an appointment.',
      '',
      'Booking #: ' + bookingId,
      'Service: ' + sel.dataset.name + ' (' + basePrice + ' BHD)',
      isMember ? 'Member: ' + tier + ' tier · ID ' + id + ' (' + discountPct + '% off)' : 'Guest booking',
      isMember ? 'Total after discount: ' + finalPrice.toFixed(finalPrice % 1 ? 2 : 0) + ' BHD' : 'Total: ' + basePrice + ' BHD',
      '',
      'Name: ' + (d.get('name') || ''),
      'Phone: ' + (d.get('phone') || ''),
      'Email: ' + (d.get('email') || ''),
      'Date: ' + (d.get('date') || ''),
      'Time: ' + (d.get('time') || ''),
      'Notes: ' + (d.get('notes') || '—')
    ];
    const url = 'https://wa.me/97335194422?text=' + encodeURIComponent(lines.join('\n'));
    window.open(url, '_blank');
    showToast(savedRemote
      ? 'Booking saved — admin notified via WhatsApp'
      : 'Booking sent — admin notified via WhatsApp');
  });
  update();
})();

/* ---------- Membership purchase flow ---------- */
(function () {
  document.querySelectorAll('[data-membership]').forEach(b => {
    b.addEventListener('click', e => {
      e.preventDefault();
      const tier = b.dataset.membership;
      const price = b.dataset.price;

      // Save signup intent to admin's local store
      try {
        const existing = JSON.parse(localStorage.getItem('taj-membership-signups') || '[]');
        existing.unshift({
          tier, price: parseInt(price, 10),
          requestedAt: new Date().toISOString(),
          status: 'pending-payment'
        });
        localStorage.setItem('taj-membership-signups', JSON.stringify(existing));
      } catch (_) {}

      const text = `Hello Taj Al Sukn Spa, I'd like to enroll as a *${tier}* Member (${price} BHD/year). Please share next steps for payment and welcome ritual scheduling.`;
      window.open('https://wa.me/97335194422?text=' + encodeURIComponent(text), '_blank');
      showToast('Enrollment request sent — admin will follow up shortly');
    });
  });
})();

/* ---------- Member portal sign-in ---------- */
(function () {
  const f = document.getElementById('member-login');
  if (!f) return;
  f.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(f);
    const text = `Hello Taj Al Sukn Spa, I'd like to access my member account.\n\nMember ID: ${d.get('member_id')}\nPhone: ${d.get('phone')}`;
    window.open('https://wa.me/97335194422?text=' + encodeURIComponent(text), '_blank');
    showToast('Opening WhatsApp to verify…');
  });
})();

/* ---------- Gift CTA ---------- */
(function () {
  document.querySelectorAll('[data-gift]').forEach(b => {
    b.addEventListener('click', e => {
      e.preventDefault();
      const tier = b.dataset.gift, price = b.dataset.price;
      const text = `Hello Taj Al Sukn Spa, I'd like to purchase the *${tier}* Gift Certificate (${price} BHD). Please share the next steps.`;
      window.open('https://wa.me/97335194422?text=' + encodeURIComponent(text), '_blank');
    });
  });
})();

/* ---------- Contact form ---------- */
(function () {
  const f = document.getElementById('contact-form');
  if (!f) return;
  f.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(f);
    const lines = [
      'Hello Taj Al Sukn Spa,',
      '',
      'Name: '    + (d.get('name')    || ''),
      'Phone: '   + (d.get('phone')   || ''),
      'Email: '   + (d.get('email')   || ''),
      'Subject: ' + (d.get('subject') || ''),
      '',
      'Message:',
      d.get('message') || ''
    ];
    window.open('https://wa.me/97335194422?text=' + encodeURIComponent(lines.join('\n')), '_blank');
    showToast('Sending via WhatsApp…');
  });
})();

/* ---------- Email capture form (home page) ---------- */
(function () {
  const f = document.getElementById('capture-form');
  if (!f) return;
  f.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(f);
    const text = `Hello Taj Al Sukn Spa, I'd like to claim my 10% welcome offer.\n\nName: ${d.get('name')}\nEmail: ${d.get('email')}\nPhone: ${d.get('phone') || '—'}`;
    window.open('https://wa.me/97335194422?text=' + encodeURIComponent(text), '_blank');
    showToast('Opening WhatsApp to claim your offer…');
  });
})();

/* ---------- Date min (today) ---------- */
(function () {
  const d = document.querySelector('input[type="date"]');
  if (!d) return;
  const t = new Date();
  t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
  d.min = t.toISOString().split('T')[0];
})();

/* ---------- Footer year ---------- */
(function () { const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear(); })();
