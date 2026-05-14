/* Taj Al Sukn — Member Authentication & Portal
   ============================================================
   Powers: member-signin.html, member-signup.html, member-portal.html
   plus the optional nav chip on every public page.

   Storage:
   - localStorage 'taj-members'        → array of all members (shared with admin)
   - localStorage 'taj-member-session' → currently signed-in member id
   - localStorage 'taj-bookings'       → bookings (shared with admin)
   - localStorage 'taj-activity'       → activity log (shared with admin)
*/

(function () {
  'use strict';

  /* ------------------------------------------------------------ *
   * Storage helpers                                              *
   * ------------------------------------------------------------ */
  const ST = {
    members:   'taj-members',
    session:   'taj-member-session',
    bookings:  'taj-bookings',
    activity:  'taj-activity'
  };

  function getJSON(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      if (!v) return fallback;
      return JSON.parse(v);
    } catch (_) { return fallback; }
  }
  function setJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); }
    catch (_) {}
  }
  function getMembers()   { return getJSON(ST.members, []) || []; }
  function setMembers(a)  { setJSON(ST.members, a); }
  function getBookings()  { return getJSON(ST.bookings, []) || []; }
  function getSession()   { return localStorage.getItem(ST.session) || null; }
  function setSession(id) {
    if (id) localStorage.setItem(ST.session, id);
    else    localStorage.removeItem(ST.session);
  }
  function findMember(id) { return getMembers().find(m => m.id === id) || null; }
  function currentMember() {
    const sid = getSession();
    return sid ? findMember(sid) : null;
  }

  /* Shared activity log (graceful even if admin-shared.js isn't loaded) */
  function logActivity(entry) {
    try {
      const log = getJSON(ST.activity, []) || [];
      log.unshift(Object.assign({
        id: 'A-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        when: new Date().toISOString(),
        read: false
      }, entry));
      if (log.length > 200) log.length = 200;
      setJSON(ST.activity, log);
    } catch (_) {}
  }

  /* Expose minimal API for other scripts (e.g. booking.html) */
  window.TajMember = {
    current: currentMember,
    isSignedIn: () => !!currentMember(),
    signOut: () => { setSession(null); logActivity({ type:'note', title:'Member signed out', desc:'Public website portal', ref:'AUTH', refType:'member' }); }
  };

  /* ------------------------------------------------------------ *
   * Toast helper (uses main.js showToast if present)             *
   * ------------------------------------------------------------ */
  function toast(msg) {
    if (typeof window.showToast === 'function') return window.showToast(msg);
    console.log('[Taj]', msg);
  }

  /* ------------------------------------------------------------ *
   * Date helpers                                                 *
   * ------------------------------------------------------------ */
  function todayISO() { return new Date().toISOString().split('T')[0]; }
  function addYears(iso, n) {
    const d = new Date(iso);
    d.setFullYear(d.getFullYear() + n);
    return d.toISOString().split('T')[0];
  }
  function fmtDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  function fmtTime(t) {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hh = parseInt(h, 10);
    const ampm = hh >= 12 ? 'PM' : 'AM';
    return `${hh % 12 || 12}:${m} ${ampm}`;
  }
  function fmtBHD(n) {
    return (parseFloat(n) || 0).toFixed(3).replace(/\.?0+$/, '') + ' BHD';
  }
  function initials(name) {
    if (!name) return '—';
    return name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }

  /* ------------------------------------------------------------ *
   * Nav chip — show "Signed in as …" when authenticated          *
   * ------------------------------------------------------------ *
   * Mutual exclusion: when a member is signed in we show ONLY the
   * member chip and hide the Sign In link entirely. When signed
   * out we show ONLY the Sign In link. The chip avatar/name is
   * always populated before unhiding, so it never appears as the
   * placeholder dash. */
  function refreshNav() {
    const member = currentMember();
    const chip   = document.getElementById('nav-member-chip');
    const signin = document.querySelector('.nav__signin');

    if (member) {
      // Populate first
      if (chip) {
        const av = chip.querySelector('#nav-member-av') || chip.querySelector('.nav__member-av');
        const nm = chip.querySelector('#nav-member-name') || chip.querySelector('.nav__member-name');
        if (av) av.textContent = initials(member.name);
        if (nm) nm.textContent = (member.name || '').split(' ')[0] || 'Member';
        chip.hidden = false;
        chip.style.display = ''; // belt-and-braces in case [hidden] is overridden
        chip.onclick = () => location.href = 'member-portal.html';
      }
      // Then hide signin
      if (signin) {
        signin.hidden = true;
        signin.style.display = 'none';
      }
    } else {
      if (chip) {
        chip.hidden = true;
        chip.style.display = 'none';
      }
      if (signin) {
        signin.hidden = false;
        signin.style.display = '';
      }
    }
  }
  // Run as soon as the IIFE executes (script is at end of <body>, DOM is ready),
  // and again on DOMContentLoaded as a safety net for any later script load.
  refreshNav();
  document.addEventListener('DOMContentLoaded', refreshNav);

  /* ------------------------------------------------------------ *
   * DEMO SEED                                                    *
   * ------------------------------------------------------------ *
   * Make sure the four demo members always exist in localStorage
   * — even if the store already has other records from earlier
   * sessions, real signups, or admin seeding. We *merge* by id
   * rather than overwriting, so real data is never lost. */
  const DEMO_MEMBERS = [
    { id:'MBR-001', name:'Aisha Al Mansour',   phone:'+973 39112233', email:'aisha@example.com',
      tier:'Gold',     startDate:'2025-11-01', endDate:'2026-10-31', discount:15,
      balance:285,  totalSpent:1240, joinedVia:'Walk-in',  status:'active',
      servicesIncluded:14, servicesUsed:6 },
    { id:'MBR-002', name:'Noura Al Khalifa',   phone:'+973 33558822', email:'noura@example.com',
      tier:'Platinum', startDate:'2026-01-12', endDate:'2027-01-11', discount:20,
      balance:540,  totalSpent:2890, joinedVia:'Referral', status:'active',
      servicesIncluded:30, servicesUsed:8 },
    { id:'MBR-003', name:'Mona Al Doseri',     phone:'+973 39998877', email:'mona@example.com',
      tier:'Gold',     startDate:'2025-08-15', endDate:'2026-08-14', discount:15,
      balance:120,  totalSpent:870,  joinedVia:'Online',   status:'active',
      servicesIncluded:14, servicesUsed:10 },
    { id:'MBR-004', name:'Layla Al Hashimi',   phone:'+973 33667788', email:'layla.h@example.com',
      tier:'Silver',   startDate:'2026-02-20', endDate:'2027-02-19', discount:10,
      balance:80,   totalSpent:340,  joinedVia:'Walk-in',  status:'active',
      servicesIncluded:6,  servicesUsed:2 }
  ];

  const DEMO_BOOKINGS = [
    { id:'BK-2026-0091', memberId:'MBR-001', name:'Aisha Al Mansour', phone:'+973 39112233',
      email:'aisha@example.com', service:'Royal Hammam Ritual', therapist:'Layla',
      date:'2026-05-22', time:'14:00', duration:90, price:55.25, status:'confirmed', tier:'Gold' },
    { id:'BK-2026-0084', memberId:'MBR-001', name:'Aisha Al Mansour', phone:'+973 39112233',
      email:'aisha@example.com', service:'Signature Aroma Massage', therapist:'Rania',
      date:'2026-04-18', time:'18:00', duration:60, price:35.70, status:'completed', tier:'Gold' },
    { id:'BK-2026-0066', memberId:'MBR-001', name:'Aisha Al Mansour', phone:'+973 39112233',
      email:'aisha@example.com', service:'Hot Stone Therapy', therapist:'Mariam',
      date:'2026-03-02', time:'11:00', duration:90, price:49.30, status:'completed', tier:'Gold' },
    { id:'BK-2026-0093', memberId:'MBR-002', name:'Noura Al Khalifa', phone:'+973 33558822',
      email:'noura@example.com', service:'Couples Retreat', therapist:'Layla',
      date:'2026-05-30', time:'15:30', duration:120, price:96.00, status:'confirmed', tier:'Platinum' }
  ];

  function ensureDemoMembers() {
    const current = getMembers();
    const byId = new Map(current.map(m => [m.id, m]));
    let changed = false;
    DEMO_MEMBERS.forEach(d => {
      if (!byId.has(d.id)) {
        current.push(d);
        changed = true;
      }
    });
    if (changed) setMembers(current);

    // Demo bookings — only inject when bookings array is empty
    if (!getBookings().length) {
      setJSON(ST.bookings, DEMO_BOOKINGS.slice());
    }
  }

  /* ------------------------------------------------------------ *
   * SIGN-IN PAGE                                                 *
   * ------------------------------------------------------------ */
  (function signinPage() {
    const form = document.getElementById('signin-form');
    if (!form) return;

    // Make sure the demo credentials actually work on a fresh browser
    ensureDemoMembers();

    // If already signed in, hop straight to the portal
    if (currentMember()) {
      location.replace('member-portal.html');
      return;
    }

    // "Use these" demo credential filler — fills then submits
    document.querySelectorAll('[data-fill]').forEach(btn => {
      btn.addEventListener('click', () => {
        const [id, phone] = btn.dataset.fill.split('|');
        document.getElementById('si-id').value = id;
        document.getElementById('si-phone').value = phone;
        document.getElementById('si-error').hidden = true;
        // Immediately submit so the click feels like "Sign me in"
        form.requestSubmit ? form.requestSubmit() : form.submit();
      });
    });

    // "Forgot ID?" — opens WhatsApp
    document.getElementById('forgot-id')?.addEventListener('click', e => {
      e.preventDefault();
      window.open('https://wa.me/97335194422?text=' + encodeURIComponent('Hello Taj Al Sukn, I\'ve forgotten my member ID. Could you help me retrieve it?'), '_blank');
    });

    // "Reset" demo data — wipes member/session/bookings, then re-seeds the demo set.
    document.getElementById('reset-demo')?.addEventListener('click', e => {
      e.preventDefault();
      localStorage.removeItem(ST.members);
      localStorage.removeItem(ST.session);
      localStorage.removeItem(ST.bookings);
      ensureDemoMembers();
      const err = document.getElementById('si-error');
      if (err) {
        err.hidden = false;
        err.classList.add('auth-error--ok');
        const msg = err.querySelector('span');
        if (msg) msg.textContent = 'Demo data refreshed. Click "Use" or type credentials to sign in.';
        setTimeout(() => { err.hidden = true; err.classList.remove('auth-error--ok'); }, 3500);
      }
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      // Belt-and-braces: ensure demo members are in storage at the moment
      // of submit too, in case the page has been open for a while.
      ensureDemoMembers();

      const id    = (document.getElementById('si-id').value || '').trim();
      const phone = (document.getElementById('si-phone').value || '').trim();
      const err   = document.getElementById('si-error');
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalLabel = submitBtn ? submitBtn.innerHTML : null;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Looking up…';
      }

      // 1) Local lookup first (instant)
      let member = null;
      if (id) {
        member = getMembers().find(m => (m.id || '').toLowerCase() === id.toLowerCase());
      } else if (phone) {
        member = getMembers().find(m => normalisePhone(m.phone) === normalisePhone(phone));
      }

      // 2) If miss, consult Supabase via TajData
      if (!member && window.TajData) {
        try {
          if (id) {
            member = await TajData.members.get(id);
          } else if (phone) {
            member = await TajData.members.findByPhone(phone);
          }
        } catch (_) { /* fall through */ }
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalLabel || 'Sign In';
      }

      if (!member) {
        if (err) {
          err.hidden = false;
          const msg = err.querySelector('span');
          if (msg) msg.textContent = id
            ? `No member found with ID "${id}". Try one of the demo credentials below.`
            : 'Please enter your Member ID.';
        }
        return;
      }
      if (err) err.hidden = true;

      setSession(member.id);
      // Fire-and-forget activity log (don't block the redirect)
      if (window.TajData) {
        TajData.activity.log({
          type: 'note',
          title: 'Member signed in',
          desc:  `${member.name} · ${member.tier} member`,
          ref:   member.id,
          refType: 'member'
        }).catch(()=>{});
      } else {
        logActivity({
          type: 'note',
          title: 'Member signed in',
          desc:  `${member.name} · ${member.tier} member`,
          ref:   member.id,
          refType: 'member'
        });
      }

      // success animation flash
      if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-check"></i> Welcome back';
      setTimeout(() => location.replace('member-portal.html'), 400);
    });
  })();

  function normalisePhone(p) {
    return (p || '').replace(/[^\d]/g, '').replace(/^973/, '');
  }

  /* ------------------------------------------------------------ *
   * SIGN-UP PAGE  (4-step wizard)                                *
   * ------------------------------------------------------------ */
  (function signupPage() {
    const form = document.getElementById('signup-form');
    if (!form) return;

    /* ---- Stepper navigation ---- */
    function goStep(n) {
      form.querySelectorAll('.wizard-panel').forEach(p => {
        p.classList.toggle('is-active', p.dataset.panel === String(n));
      });
      document.querySelectorAll('.wizard-step').forEach(s => {
        const sn = parseInt(s.dataset.step, 10);
        s.classList.toggle('is-active', sn === n);
        s.classList.toggle('is-done',   sn < n);
      });
      window.scrollTo({ top: document.querySelector('.signup-head').offsetTop - 40, behavior: 'smooth' });
    }
    form.querySelectorAll('[data-next]').forEach(btn => {
      btn.addEventListener('click', () => {
        const next = parseInt(btn.dataset.next, 10);
        if (next === 2 && !validateStep1()) return;
        goStep(next);
      });
    });
    form.querySelectorAll('[data-prev]').forEach(btn => {
      btn.addEventListener('click', () => goStep(parseInt(btn.dataset.prev, 10)));
    });

    function validateStep1() {
      const required = ['su-first','su-last','su-email','su-phone'];
      let ok = true;
      required.forEach(id => {
        const el = document.getElementById(id);
        if (!el || !el.value.trim()) {
          el?.closest('.field')?.classList.add('field--err');
          ok = false;
        } else {
          el.closest('.field')?.classList.remove('field--err');
        }
      });
      if (!ok) toast('Please fill in the required fields.');
      return ok;
    }

    /* ---- Tier card visuals ---- */
    const tierInputs = form.querySelectorAll('input[name="tier"]');

    // If we arrived here from "Become Silver/Gold/Platinum" on the membership page,
    // pre-select the requested tier and skip straight to step 2.
    const qpTier = new URLSearchParams(location.search).get('tier');
    if (qpTier) {
      const pre = Array.from(tierInputs).find(r => r.value.toLowerCase() === qpTier.toLowerCase());
      if (pre) pre.checked = true;
    }

    function syncTierVisuals() {
      tierInputs.forEach(r => {
        r.closest('.tier-choose__card').classList.toggle('is-selected', r.checked);
      });
      // Update summary on step 3
      const selected = Array.from(tierInputs).find(r => r.checked);
      if (selected) {
        const price = selected.dataset.price;
        document.getElementById('sum-tier').textContent = selected.value + ' Membership';
        document.getElementById('sum-price').textContent = price + ' BHD';
      }
    }
    tierInputs.forEach(r => r.addEventListener('change', syncTierVisuals));
    syncTierVisuals();

    /* ---- Payment method panels ---- */
    const payInputs = form.querySelectorAll('input[name="payment_method"]');
    function syncPayPanels() {
      payInputs.forEach(p => p.closest('.pay-choose__card').classList.toggle('is-selected', p.checked));
      const map = {
        'Card':           'pay-detail-card',
        'BenefitPay':     'pay-detail-benefit',
        'Apple Pay':      'pay-detail-apple',
        'Bank Transfer':  'pay-detail-bank',
        'Cash':           'pay-detail-cash'
      };
      Object.entries(map).forEach(([k, id]) => {
        const el = document.getElementById(id);
        if (el) el.hidden = true;
      });
      const sel = Array.from(payInputs).find(p => p.checked);
      if (sel && map[sel.value]) {
        const el = document.getElementById(map[sel.value]);
        if (el) el.hidden = false;
      }
    }
    payInputs.forEach(p => p.addEventListener('change', syncPayPanels));
    syncPayPanels();

    /* ---- Card number formatting ---- */
    const cardNum = document.getElementById('pay-card-num');
    cardNum?.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 16);
      e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
    });
    const cardExp = document.getElementById('pay-exp');
    cardExp?.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 4);
      if (v.length >= 3) v = v.slice(0, 2) + ' / ' + v.slice(2);
      e.target.value = v;
    });

    /* ---- Final submit ---- */
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const terms = document.getElementById('su-terms');
      if (!terms.checked) {
        toast('Please accept the membership terms to continue.');
        terms.focus();
        return;
      }

      const tierEl  = Array.from(tierInputs).find(r => r.checked);
      const payEl   = Array.from(payInputs).find(p => p.checked);
      const tier    = tierEl ? tierEl.value      : 'Gold';
      const price   = tierEl ? parseInt(tierEl.dataset.price, 10) : 350;
      const disc    = tierEl ? parseInt(tierEl.dataset.discount, 10) : 15;
      const services = tierEl ? parseInt(tierEl.dataset.services, 10) : 14;
      const method  = payEl ? payEl.value : 'Card';

      const first = document.getElementById('su-first').value.trim();
      const last  = document.getElementById('su-last').value.trim();
      const name  = (first + ' ' + last).trim();
      const email = document.getElementById('su-email').value.trim();
      const phone = document.getElementById('su-phone').value.trim();
      const dob   = document.getElementById('su-dob').value;
      const notes = document.getElementById('su-notes').value.trim();

      const today = todayISO();
      const newId = 'MBR-' + Date.now().toString().slice(-6);

      const newMember = {
        id: newId,
        name, email, phone,
        tier,
        startDate: today,
        endDate:   addYears(today, 1),
        discount:  disc,
        balance:   0,
        totalSpent: price,
        servicesIncluded: services,
        servicesUsed: 0,
        joinedVia: 'Online Signup',
        paymentMethod: method,
        dob, notes,
        therapist_pref: document.getElementById('su-gender')?.value || null,
        status: method === 'Cash' || method === 'Bank Transfer' ? 'pending-payment' : 'active'
      };

      // Disable the confirm button while we persist
      const confirmBtn = document.getElementById('su-confirm');
      const originalLabel = confirmBtn ? confirmBtn.innerHTML : null;
      if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enrolling…';
      }

      // Persist via data layer (Supabase if connected, localStorage cache always)
      try {
        if (window.TajData) {
          await TajData.members.upsert(newMember);
          await TajData.activity.log({
            type: 'member',
            title: 'New member enrolled',
            desc:  `${name} · ${tier} · ${method} · ${price} BHD`,
            ref:   newId,
            refType: 'member'
          });
        } else {
          const all = getMembers();
          all.unshift(newMember);
          setMembers(all);
          logActivity({
            type: 'member',
            title: 'New member enrolled',
            desc:  `${name} · ${tier} · ${method} · ${price} BHD`,
            ref:   newId,
            refType: 'member'
          });
        }
      } catch (err) {
        console.warn('[signup] save failed:', err);
        // Last-resort offline cache so the welcome screen still works
        try {
          const all = getMembers();
          all.unshift(newMember);
          setMembers(all);
        } catch (_) {}
      }

      setSession(newId);

      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = originalLabel || '<i class="fas fa-crown"></i> Confirm & Activate';
      }

      // Step 4 — welcome
      document.getElementById('welcome-tier').textContent = tier;
      document.getElementById('welcome-id').textContent   = newId;
      document.getElementById('welcome-email').textContent= email;
      document.getElementById('welcome-phone').textContent= phone;
      document.getElementById('welcome-discount').textContent = disc + '% on every treatment';
      document.getElementById('welcome-renews').textContent = fmtDate(newMember.endDate);
      const waMsg = `Hello Taj Al Sukn, I've just enrolled as a *${tier}* member (${newId}). Looking forward to my first visit.`;
      document.getElementById('welcome-wa').href = 'https://wa.me/97335194422?text=' + encodeURIComponent(waMsg);

      goStep(4);
      refreshNav();
    });
  })();

  /* ------------------------------------------------------------ *
   * MEMBER PORTAL                                                *
   * ------------------------------------------------------------ */
  (function portalPage() {
    const shell = document.getElementById('portal-shell');
    if (!shell) return;
    const gate = document.getElementById('portal-gate');

    const member = currentMember();
    if (!member) {
      if (gate) gate.hidden = false;
      // After a brief moment, redirect to signin
      setTimeout(() => location.replace('member-signin.html'), 1500);
      return;
    }
    shell.hidden = false;

    /* ---- Hero ---- */
    const first = (member.name || '').split(' ')[0] || 'Member';
    document.getElementById('hero-name').textContent = first;
    document.getElementById('hero-id').textContent   = member.id;
    document.getElementById('hero-tier').textContent = member.tier || 'Member';
    document.getElementById('hero-tier').className   = 'portal-hero__tier portal-hero__tier--' + (member.tier || '').toLowerCase();

    if (member.startDate && member.endDate) {
      const start = new Date(member.startDate);
      const end   = new Date(member.endDate);
      const now   = Date.now();
      const pct   = Math.min(100, Math.max(0, ((now - start.getTime()) / (end.getTime() - start.getTime())) * 100));
      document.getElementById('hero-progress').style.width = pct.toFixed(0) + '%';
      document.getElementById('hero-progress-start').textContent = 'Started ' + fmtDate(member.startDate);
      document.getElementById('hero-progress-end').textContent   = 'Renews '  + fmtDate(member.endDate);
    }

    const taglines = {
      'Silver':   'Your year of considered moments awaits.',
      'Gold':     'A generous year of restoration is yours.',
      'Platinum': 'The fullest expression of care, at your call.'
    };
    document.getElementById('hero-tagline').textContent = taglines[member.tier] || 'Your sanctuary is ready.';

    /* ---- Stats ---- */
    const used  = member.servicesUsed || 0;
    const inc   = member.servicesIncluded || tierDefault(member.tier, 'services');
    const left  = Math.max(0, inc - used);
    const myBookings = getBookings().filter(b =>
      sameMember(b, member)
    );
    document.getElementById('stat-services').textContent = left;
    document.getElementById('stat-discount').textContent = (member.discount || tierDefault(member.tier, 'discount')) + '%';
    document.getElementById('stat-balance').textContent  = fmtBHD(member.balance || 0);
    document.getElementById('stat-bookings').textContent = myBookings.length;

    /* ---- Bookings tabs ---- */
    let activeTab = 'upcoming';
    function renderBookings() {
      const today = todayISO();
      const list  = myBookings.filter(b => {
        if (activeTab === 'upcoming') return (b.date || '') >= today && b.status !== 'cancelled';
        if (activeTab === 'past')     return (b.date || '') <  today || b.status === 'cancelled';
        return true;
      }).sort((a, b) => (a.date || '').localeCompare(b.date || ''));

      const container = document.getElementById('portal-bookings');
      const empty     = document.getElementById('portal-empty');

      if (!list.length) {
        container.innerHTML = '';
        empty.hidden = false;
        return;
      }
      empty.hidden = true;
      container.innerHTML = list.map(b => {
        const status = (b.status || 'pending').toLowerCase();
        const badge  = ({
          confirmed: 'Confirmed', ok: 'Confirmed',
          pending:   'Pending',
          done:      'Completed', completed: 'Completed',
          cancelled: 'Cancelled', cancel: 'Cancelled'
        })[status] || 'Pending';
        return `
          <article class="portal-booking portal-booking--${status}">
            <div class="portal-booking__date">
              <span class="d">${new Date(b.date).getDate()}</span>
              <span class="m">${new Date(b.date).toLocaleDateString('en-US', { month: 'short' })}</span>
            </div>
            <div class="portal-booking__body">
              <h4>${escapeHTML(b.service || 'Treatment')}</h4>
              <div class="portal-booking__meta">
                <span><i class="far fa-clock"></i> ${fmtTime(b.time)}</span>
                <span><i class="fas fa-user-md"></i> ${escapeHTML(b.therapist || 'Any therapist')}</span>
                <span><i class="far fa-id-badge"></i> ${escapeHTML(b.id || '')}</span>
              </div>
            </div>
            <div class="portal-booking__price">
              <span class="portal-booking__amount">${fmtBHD(b.price || 0)}</span>
              <span class="portal-booking__status portal-booking__status--${status}">${badge}</span>
            </div>
          </article>`;
      }).join('');
    }
    document.querySelectorAll('[data-bktab]').forEach(t => {
      t.addEventListener('click', () => {
        document.querySelectorAll('[data-bktab]').forEach(x => x.classList.remove('is-active'));
        t.classList.add('is-active');
        activeTab = t.dataset.bktab;
        renderBookings();
      });
    });
    renderBookings();

    /* ---- Top-level tabs (Bookings / Profile / Benefits) ---- */
    function activatePortalTab(name) {
      document.querySelectorAll('.portal-tabnav__btn').forEach(b => {
        b.classList.toggle('is-active', b.dataset.ptab === name);
      });
      document.querySelectorAll('.portal-tabpanel').forEach(p => {
        p.classList.toggle('is-active', p.dataset.ppanel === name);
      });
      // Keep hash in sync (so refresh / share-link returns to the right tab)
      const h = '#' + name;
      if (location.hash !== h) history.replaceState(null, '', h);
    }
    document.querySelectorAll('.portal-tabnav__btn').forEach(b => {
      b.addEventListener('click', () => activatePortalTab(b.dataset.ptab));
    });
    // Deep-link via hash (#profile, #benefits, #bookings)
    const initialTab = (location.hash || '').replace('#','');
    if (['bookings','profile','benefits'].includes(initialTab)) {
      activatePortalTab(initialTab);
    }

    /* ---- Profile ---- */
    function renderProfile() {
      const m = currentMember();
      if (!m) return;
      document.getElementById('profile-avatar').textContent = initials(m.name);
      document.getElementById('profile-name').textContent = m.name || '—';
      document.getElementById('profile-mid').textContent = m.id || '—';
      const tierBadge = document.getElementById('profile-tier-badge');
      tierBadge.textContent = m.tier || 'Member';
      tierBadge.className = 'portal-hero__tier portal-hero__tier--' + (m.tier || '').toLowerCase();
      document.getElementById('profile-joined').textContent = m.startDate
        ? 'Member since ' + fmtDate(m.startDate)
        : 'Member since —';
      document.getElementById('profile-email').textContent = m.email || '—';
      document.getElementById('profile-phone').textContent = m.phone || '—';
      document.getElementById('profile-dob').textContent = m.dob ? fmtDate(m.dob) : '—';
      const tpMap = { female: 'Female therapist', male: 'Male therapist', '': 'No preference' };
      document.getElementById('profile-therapist-pref').textContent = tpMap[m.therapist_pref || ''] || 'No preference';
      document.getElementById('profile-notes').textContent = m.notes || '—';
      document.getElementById('profile-tier').textContent = m.tier || '—';
      document.getElementById('profile-discount').textContent = (m.discount || tierDefault(m.tier, 'discount')) + '% on every treatment';
      document.getElementById('profile-start').textContent = m.startDate ? fmtDate(m.startDate) : '—';
      document.getElementById('profile-end').textContent = m.endDate ? fmtDate(m.endDate) : '—';
    }
    renderProfile();

    /* ---- Benefits tab ---- */
    function renderBenefits() {
      const m = currentMember();
      if (!m) return;
      const tier = m.tier || 'Member';
      document.getElementById('benefits-tier-h').textContent = tier;

      const inc  = m.servicesIncluded || tierDefault(tier, 'services');
      const used = m.servicesUsed || 0;
      const left = Math.max(0, inc - used);
      const pct  = inc ? Math.min(100, (used / inc) * 100) : 0;
      document.getElementById('ben-services-left').textContent = left;
      document.getElementById('ben-services-total').textContent = inc;
      const bar = document.getElementById('ben-services-bar');
      if (bar) bar.style.width = (100 - pct).toFixed(0) + '%';
      document.getElementById('ben-discount').textContent = (m.discount || tierDefault(tier, 'discount')) + '%';
      document.getElementById('ben-balance').textContent = fmtBHD(m.balance || 0);

      const perks = {
        'Silver': [
          'A welcome ritual on signup',
          '2 complimentary 60-min signature massages',
          '1 complimentary Foot Reflexology ritual',
          '10% off all additional treatments',
          'Priority booking — 24 hours ahead',
          'Birthday gift — free Foot Relaxing',
          'Member-only seasonal offers'
        ],
        'Gold': [
          'A welcome Hammam ritual on signup',
          '6 complimentary 60-min signature massages',
          '1 Royal Hammam ritual',
          '2 complimentary foot rituals',
          '15% off all additional treatments',
          'Priority booking — 48 hours ahead',
          '1 guest pass per year',
          'Birthday spa journey (90 min)',
          'Members-only seasonal events'
        ],
        'Platinum': [
          'Welcome Sultan Suite ritual on signup',
          'Unlimited signature massages (max 2/month)',
          '12 Royal Hammams per year',
          '4 Hot Stone sessions included',
          '20% off additional treatments & products',
          'Priority booking — anytime',
          '4 guest passes per year',
          'Personal therapist match',
          'Birthday Day at the Spa (4 hours)',
          'Annual gift box of premium products',
          'Concierge appointment scheduling'
        ]
      };
      const list = document.getElementById('benefits-list');
      if (list) {
        list.innerHTML = (perks[tier] || []).map(p =>
          `<li><i class="fas fa-check-circle"></i> ${escapeHTML(p)}</li>`
        ).join('') || '<li><i class="fas fa-info-circle"></i> Talk to reception about your tier benefits.</li>';
      }
    }
    renderBenefits();

    // "My Profile" hero button — activates the Profile tab + scrolls into view
    document.getElementById('profile-btn')?.addEventListener('click', () => {
      activatePortalTab('profile');
      document.querySelector('.portal-tabs-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Enter edit mode
    document.getElementById('profile-edit-btn')?.addEventListener('click', () => {
      const m = currentMember();
      if (!m) return;
      const [first = '', ...rest] = (m.name || '').split(' ');
      document.getElementById('pf-first').value = first;
      document.getElementById('pf-last').value  = rest.join(' ');
      document.getElementById('pf-email').value = m.email || '';
      document.getElementById('pf-phone').value = m.phone || '';
      document.getElementById('pf-dob').value   = m.dob || '';
      document.getElementById('pf-therapist').value = m.therapist_pref || '';
      document.getElementById('pf-notes').value = m.notes || '';

      document.getElementById('profile-view').hidden = true;
      document.getElementById('profile-edit').hidden = false;
      document.getElementById('profile-actions-view').hidden = true;
      document.getElementById('profile-actions-edit').hidden = false;
    });

    // Cancel edit
    document.getElementById('profile-cancel-btn')?.addEventListener('click', () => {
      document.getElementById('profile-view').hidden = false;
      document.getElementById('profile-edit').hidden = true;
      document.getElementById('profile-actions-view').hidden = false;
      document.getElementById('profile-actions-edit').hidden = true;
    });

    // Save profile
    document.getElementById('profile-save-btn')?.addEventListener('click', async () => {
      const first = document.getElementById('pf-first').value.trim();
      const last  = document.getElementById('pf-last').value.trim();
      const email = document.getElementById('pf-email').value.trim();
      const phone = document.getElementById('pf-phone').value.trim();

      if (!first || !last || !email || !phone) {
        toast('Please complete the required fields.');
        return;
      }

      // Patch the member record (shared with admin)
      const all = getMembers();
      const idx = all.findIndex(x => x.id === member.id);
      if (idx < 0) { toast('Could not find your record. Please refresh.'); return; }

      const patched = Object.assign({}, all[idx], {
        name: (first + ' ' + last).trim(),
        email,
        phone,
        dob: document.getElementById('pf-dob').value,
        therapist_pref: document.getElementById('pf-therapist').value,
        notes: document.getElementById('pf-notes').value.trim()
      });

      // Persist via data layer (Supabase + localStorage mirror)
      try {
        if (window.TajData) {
          await TajData.members.upsert(patched);
          await TajData.activity.log({
            type: 'note',
            title: 'Member profile updated',
            desc:  `${patched.name} · ${patched.id}`,
            ref:   patched.id,
            refType: 'member'
          });
        } else {
          all[idx] = patched;
          setMembers(all);
          logActivity({
            type: 'note',
            title: 'Member profile updated',
            desc:  `${patched.name} · ${patched.id}`,
            ref:   patched.id,
            refType: 'member'
          });
        }
      } catch (err) {
        console.warn('[profile-save] failed:', err);
        all[idx] = patched;
        setMembers(all);
      }

      // Always update the local cache copy used by render functions
      all[idx] = patched;

      // Refresh visuals
      Object.assign(member, all[idx]);
      const firstName = (member.name || '').split(' ')[0] || 'Member';
      document.getElementById('hero-name').textContent = firstName;
      refreshNav();
      renderProfile();

      document.getElementById('profile-view').hidden = false;
      document.getElementById('profile-edit').hidden = true;
      document.getElementById('profile-actions-view').hidden = false;
      document.getElementById('profile-actions-edit').hidden = true;

      toast('Profile updated');
    });

    /* ---- Sign out ---- */
    document.getElementById('signout-btn')?.addEventListener('click', () => {
      if (!confirm('Sign out of your member portal?')) return;
      setSession(null);
      logActivity({ type:'note', title:'Member signed out', desc: member.name, ref: member.id, refType:'member' });
      location.replace('index.html');
    });
  })();

  function tierDefault(tier, key) {
    const m = {
      Silver:   { discount: 10, services: 6 },
      Gold:     { discount: 15, services: 14 },
      Platinum: { discount: 20, services: 30 }
    };
    return (m[tier] && m[tier][key]) || 0;
  }
  function sameMember(b, m) {
    if (!b || !m) return false;
    if (b.memberId && b.memberId === m.id) return true;
    if (b.phone && normalisePhone(b.phone) === normalisePhone(m.phone)) return true;
    if (b.email && (b.email || '').toLowerCase() === (m.email || '').toLowerCase()) return true;
    return false;
  }
  function escapeHTML(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  }
})();
