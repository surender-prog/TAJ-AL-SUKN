/* Taj Al Sukun — Admin Member Profile (full page) */

if (sessionStorage.getItem('taj-admin-auth') !== '1') {
  location.replace('admin-login.html');
}

const params = new URLSearchParams(location.search);
const memberId = params.get('id');

let members = JSON.parse(localStorage.getItem('taj-members') || '[]');
let bookings = JSON.parse(localStorage.getItem('taj-members') || '[]'); // placeholder
bookings = JSON.parse(localStorage.getItem('taj-bookings') || '[]');

const member = members.find(m => m.id === memberId);

if (!member) {
  document.querySelector('.admin-content').innerHTML = `
    <div style="text-align:center; padding: 80px 30px;">
      <i class="fas fa-user-slash" style="font-size: 60px; color: var(--c-copper); margin-bottom: 20px;"></i>
      <h2 style="font-family: var(--f-display); font-weight: 500; margin-bottom: 10px;">Member not found</h2>
      <p style="color: var(--c-text-soft); margin-bottom: 30px;">The member ID <code style="font-family: monospace; color: var(--c-copper);">${memberId || '(none)'}</code> doesn't exist.</p>
      <a href="admin.html#members" class="btn btn--primary"><i class="fas fa-arrow-left"></i> Back to Members</a>
    </div>
  `;
  throw new Error('Member not found');
}

// Normalize date fields across schema variants so the page renders correctly.
// Supabase-backed records expose startDate/endDate (+ raw start_date/end_date);
// the legacy demo used joined/renews. Backfill joined/renews from whichever exists.
member.joined = member.joined || member.startDate || member.start_date || '';
member.renews = member.renews || member.endDate   || member.end_date   || '';

async function persist() {
  // Mirror the editable date fields back to the canonical names so the record
  // stays consistent for re-renders and the Supabase sync below.
  if (member.joined) { member.startDate = member.joined; member.start_date = member.joined; }
  if (member.renews) { member.endDate   = member.renews; member.end_date   = member.renews; }
  // Route through the data layer so admin edits reach Supabase and survive the
  // next re-hydration. upsert mirrors localStorage itself; the direct write
  // below is the offline / no-data-layer fallback.
  if (window.TajData) {
    try { await TajData.members.upsert(member); return; }
    catch (err) { console.warn('[admin-member] member sync failed, using localStorage:', err); }
  }
  localStorage.setItem('taj-members', JSON.stringify(members));
}

/* ---------- Helpers ---------- */
function fmtFull(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  const dt = new Date(parseInt(y), parseInt(m)-1, parseInt(day));
  return dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
function fmtShort(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  const dt = new Date(parseInt(y), parseInt(m)-1, parseInt(day));
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function initials(name) {
  return name.trim().split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
}
function tierDiscountPct(tier) { return ({ Silver: 10, Gold: 15, Platinum: 20 })[tier] || 0; }
function statusLabel(s) {
  return ({ new: 'New', pending: 'Pending', ok: 'Confirmed', done: 'Completed', cancel: 'Cancelled' })[s] || s;
}
function tierAnnualPrice(t) { return ({ Silver: 150, Gold: 350, Platinum: 750 })[t] || 0; }

// Complimentary allowances per tier — kept in step with the Membership Tiers
// editor (Free Massages / Free Hammams / Free Foot Rituals / Guest Passes).
function tierAllowance(tier) {
  return ({
    Silver: { massages: 2, hammams: 0, foot: 1, guest: 0 },
    Gold:   { massages: 6, hammams: 1, foot: 2, guest: 1 },
  })[tier] || { massages: 0, hammams: 0, foot: 0, guest: 0 };
}
function _num(v, d) { const n = parseInt(v, 10); return isNaN(n) ? d : n; }
// Durable remaining complimentary balance from the members.comp_balance JSONB
// column; falls back to the legacy text string, then to a full tier allowance.
function compBalance(m) {
  const a = tierAllowance(m.tier);
  const cb = m.comp_balance;
  if (cb && typeof cb === 'object') {
    return { massages: _num(cb.massages, a.massages), hammams: _num(cb.hammams, a.hammams), foot: _num(cb.foot, a.foot), guest: _num(cb.guest, a.guest) };
  }
  if (m.balance && /[a-z]/i.test(String(m.balance))) {
    const u = parseUsedFromBalance(m.balance, a);
    return { massages: Math.max(0, a.massages - u.massages), hammams: Math.max(0, a.hammams - u.hammams), foot: Math.max(0, a.foot - u.foot), guest: a.guest };
  }
  return { massages: a.massages, hammams: a.hammams, foot: a.foot, guest: a.guest };
}

function tierPerks(tier) {
  return ({
    Silver: [
      '2 complimentary 60-min signature massages',
      '1 complimentary Foot Reflexology ritual',
      '10% off all additional treatments',
      'Priority booking — 24 hours ahead',
      'Welcome ritual on signup',
      'Birthday gift — free Foot Relaxing'
    ],
    Gold: [
      '6 complimentary 60-min signature massages',
      '1 Royal Hammam ritual included',
      '2 complimentary foot rituals',
      '15% off all additional treatments',
      'Priority booking — 48 hours ahead',
      '1 guest pass per year',
      'Birthday spa journey (90 min)'
    ]
  })[tier] || [];
}

/* Member booking history (filter from bookings store by phone or member_id) */
function memberBookings() {
  return bookings.filter(b => {
    if (b.member_id === member.id) return true;
    if (b.phone && member.phone && b.phone.replace(/\D/g, '') === member.phone.replace(/\D/g, '')) return true;
    return false;
  });
}

function render() {
  // Banner
  document.getElementById('crumb-id').textContent = member.id;
  document.getElementById('mb-id').textContent = member.id;
  document.getElementById('mb-avatar').textContent = initials(member.name);
  document.getElementById('mb-name').textContent = member.name;
  document.getElementById('mb-since').textContent = 'Member since ' + fmtShort(member.joined);
  document.getElementById('mb-renews').textContent = 'Renews ' + fmtShort(member.renews);
  document.getElementById('mb-discount').textContent = tierDiscountPct(member.tier) + '% member discount';

  const tierPill = document.getElementById('mb-tier');
  tierPill.className = 'tier-pill ' + member.tier.toLowerCase();
  tierPill.innerHTML = `<i class="fas fa-crown"></i> ${member.tier} Member`;

  // Personal info
  document.getElementById('p-name').textContent = member.name;
  document.getElementById('p-phone-link').textContent = member.phone || '—';
  document.getElementById('p-phone-link').href = 'tel:' + (member.phone || '').replace(/\s/g, '');
  document.getElementById('p-email-link').textContent = member.email || '—';
  document.getElementById('p-email-link').href = 'mailto:' + (member.email || '');
  document.getElementById('p-id').textContent = member.id;

  // Year progress
  const today = new Date();
  const start = new Date(member.joined);
  const end = new Date(member.renews);
  const totalDays = Math.round((end - start) / 86400000);
  const elapsedDays = Math.round((today - start) / 86400000);
  const remainingDays = Math.max(0, totalDays - elapsedDays);
  const pct = Math.min(100, Math.max(0, Math.round(elapsedDays / totalDays * 100)));

  const fill = document.getElementById('yp-fill');
  fill.style.width = pct + '%';
  fill.className = 'year-progress__fill' + (pct > 90 ? ' danger' : (pct > 75 ? ' warn' : ''));
  document.getElementById('yp-pct').textContent = pct + '% used';
  document.getElementById('yp-start').textContent = fmtShort(member.joined);
  document.getElementById('yp-end').textContent = fmtShort(member.renews);
  document.getElementById('yp-days').textContent = remainingDays + ' days remaining';

  // Renewal status
  const status = document.getElementById('renewal-status');
  const detail = document.getElementById('renewal-detail');
  const callout = document.getElementById('renewal-callout');
  if (remainingDays <= 0) {
    status.textContent = 'Expired';
    status.style.color = '#c44a3d';
    detail.textContent = 'Membership expired ' + Math.abs(remainingDays) + ' days ago';
    callout.className = 'renew-callout danger';
    callout.style.display = '';
    document.getElementById('rc-title').textContent = 'Renewal overdue';
    document.getElementById('rc-msg').textContent = 'Re-enrol the member or convert to a regular guest.';
  } else if (remainingDays <= 30) {
    status.textContent = 'Expiring Soon';
    status.style.color = '#d49b2b';
    detail.textContent = remainingDays + ' days until renewal';
    callout.className = 'renew-callout warn';
    callout.style.display = '';
    document.getElementById('rc-title').textContent = 'Reminder due';
    document.getElementById('rc-msg').textContent = 'Send a renewal reminder via WhatsApp.';
  } else {
    status.textContent = 'Active';
    status.style.color = '#2a8a4a';
    detail.textContent = remainingDays + ' days until renewal';
    callout.style.display = 'none';
  }

  // Status overrides the renewal display + flips the primary action button.
  const freezeBtn = document.getElementById('freeze-btn');
  const isPending = member.status === 'pending-payment' || member.status === 'pending';
  if (isPending) {
    status.textContent = 'Pending Activation';
    status.style.color = '#d49b2b';
    detail.textContent = 'Awaiting payment confirmation';
    callout.className = 'renew-callout warn';
    callout.style.display = '';
    document.getElementById('rc-title').textContent = 'Pending activation';
    document.getElementById('rc-msg').textContent = 'Confirm payment received, then activate to unlock member benefits.';
    if (freezeBtn) freezeBtn.innerHTML = '<i class="fas fa-check-circle"></i> Activate Membership';
  } else if (member.status === 'frozen') {
    status.textContent = 'Frozen';
    status.style.color = '#6b7280';
    detail.textContent = 'Membership frozen — booking paused';
    callout.className = 'renew-callout warn';
    callout.style.display = '';
    document.getElementById('rc-title').textContent = 'Membership frozen';
    document.getElementById('rc-msg').textContent = 'Reactivate to allow booking again.';
    if (freezeBtn) freezeBtn.innerHTML = '<i class="fas fa-play"></i> Reactivate Membership';
  } else if (freezeBtn) {
    freezeBtn.innerHTML = '<i class="fas fa-pause"></i> Freeze Membership';
  }

  // Balance list — remaining comes from the durable comp_balance column.
  const allowance = tierAllowance(member.tier);
  const remain = compBalance(member);
  const balances = [
    { name: 'Signature Massages', icon: 'fa-spa', total: allowance.massages, remaining: Math.min(remain.massages, allowance.massages) },
    { name: 'Royal Hammam', icon: 'fa-hot-tub', total: allowance.hammams, remaining: Math.min(remain.hammams, allowance.hammams) },
    { name: 'Foot Rituals', icon: 'fa-shoe-prints', total: allowance.foot, remaining: Math.min(remain.foot, allowance.foot) },
    { name: 'Guest Passes', icon: 'fa-user-friends', total: allowance.guest, remaining: Math.min(remain.guest, allowance.guest) },
  ];

  document.getElementById('balance-list').innerHTML = balances.map(b => {
    if (b.total === 0) return '';
    const remaining = Math.max(0, b.remaining);
    const used = Math.max(0, b.total - remaining);
    const pct = b.total > 0 ? (used / b.total) * 100 : 0;
    return `
      <li>
        <span class="name"><i class="fas ${b.icon}"></i>${b.name}</span>
        <div class="bar"><div class="bar__fill" style="width:${Math.min(100, pct)}%;"></div></div>
        <span class="count">${remaining}<small> of ${b.total} left</small></span>
      </li>
    `;
  }).join('');

  // Tier perks
  document.getElementById('perks-list').innerHTML = tierPerks(member.tier).map(p => `<li>${p}</li>`).join('');

  // Booking history
  const history = memberBookings().sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  document.getElementById('bh-count').textContent = history.length + (history.length === 1 ? ' booking' : ' bookings');

  if (history.length === 0) {
    document.getElementById('history-body').innerHTML = `
      <tr><td colspan="5" style="padding: 40px 20px; text-align: center; color: var(--c-text-soft);">
        <i class="far fa-calendar" style="font-size: 28px; color: var(--c-copper); opacity: 0.5; display: block; margin-bottom: 8px;"></i>
        No bookings yet.
      </td></tr>
    `;
  } else {
    document.getElementById('history-body').innerHTML = history.map(b => `
      <tr onclick="location.href='admin-booking.html?id=${encodeURIComponent(b.id)}'">
        <td><a>${b.id}</a></td>
        <td>${fmtShort(b.date)}<br><small style="color:var(--c-text-soft);">${b.time}</small></td>
        <td>${b.service}</td>
        <td class="r"><strong style="color:var(--c-deep);">${b.total ?? 0} BHD</strong>${b.paid ? '<br><small style="color:#2a8a4a; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; font-size:0.66rem;">✓ Paid</small>' : ''}</td>
        <td><span class="badge-status ${b.status}">${statusLabel(b.status)}</span></td>
      </tr>
    `).join('');
  }

  // Lifetime stats
  const completedBookings = history.filter(b => b.status !== 'cancel');
  const lifeSpend = completedBookings.reduce((s, b) => s + (b.total || 0), 0);
  const memberDiscPct = tierDiscountPct(member.tier);
  const lifeSaved = completedBookings.filter(b => b.tier).reduce((s, b) => {
    const orig = b.total / (1 - memberDiscPct / 100);
    return s + (orig - b.total);
  }, 0);
  document.getElementById('ls-visits').textContent = completedBookings.length;
  document.getElementById('ls-spend').textContent = lifeSpend.toFixed(0);
  document.getElementById('ls-saved').textContent = lifeSaved.toFixed(0);
  document.getElementById('ls-avg').textContent = completedBookings.length > 0
    ? (lifeSpend / completedBookings.length).toFixed(0)
    : '0';

  // Most-booked service
  const counts = {};
  completedBookings.forEach(b => { counts[b.service] = (counts[b.service] || 0) + 1; });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  document.getElementById('ls-favorite').textContent = top
    ? `${top[0]} · ${top[1]} ${top[1] === 1 ? 'visit' : 'visits'}`
    : 'No bookings yet';

  // Banner lifetime
  document.getElementById('mb-lifetime').textContent = (lifeSpend + tierAnnualPrice(member.tier)).toFixed(0) + ' BHD';

  // Notes
  document.getElementById('notes').value = member.notes || '';

  // Quick action: create booking (passes member id so the new-booking page
  // auto-fills this member's details + maps the tier discount)
  document.getElementById('qa-book').href = 'admin-new-booking.html?member=' + encodeURIComponent(member.id || '');

  // Communication
  const phone = (member.phone || '').replace(/\D/g, '');
  document.getElementById('ac-call').href = 'tel:' + phone;
  document.getElementById('ac-email').href = 'mailto:' + (member.email || '');
  const waText = encodeURIComponent(`Hello ${member.name}, this is Taj Al Sukun Spa. Your ${member.tier} membership is active until ${fmtShort(member.renews)}.`);
  document.getElementById('ac-wa').href = `https://wa.me/${phone}?text=${waText}`;

  // Activity timeline
  renderTimeline(history);
}

function parseUsedFromBalance(balanceStr, allowance) {
  // Tries to extract remaining counts from "4 massages · 1 hammam" style strings
  const used = { massages: 0, hammams: 0, foot: 0, hotstone: 0 };
  const s = (balanceStr || '').toLowerCase();

  const matchMassages = s.match(/(\d+|∞)\s*massages?/);
  const matchHammams  = s.match(/(\d+|∞)\s*hammams?/);
  const matchFoot     = s.match(/(\d+|∞)\s*foot/);
  const matchStone    = s.match(/(\d+|∞)\s*hot\s*stone/);

  const remain = {
    massages: matchMassages ? (matchMassages[1] === '∞' ? allowance.massages : parseInt(matchMassages[1])) : allowance.massages,
    hammams:  matchHammams  ? (matchHammams[1]  === '∞' ? allowance.hammams  : parseInt(matchHammams[1]))  : 0,
    foot:     matchFoot     ? (matchFoot[1]     === '∞' ? allowance.foot     : parseInt(matchFoot[1]))     : 0,
    hotstone: matchStone    ? (matchStone[1]    === '∞' ? allowance.hotstone : parseInt(matchStone[1]))    : 0,
  };
  used.massages = Math.max(0, allowance.massages - remain.massages);
  used.hammams  = Math.max(0, allowance.hammams  - remain.hammams);
  used.foot     = Math.max(0, allowance.foot     - remain.foot);
  used.hotstone = Math.max(0, allowance.hotstone - remain.hotstone);
  return used;
}

function renderTimeline(history) {
  const tl = document.getElementById('timeline');
  if (!tl) return;
  const events = [];
  events.push({ icon: 'fa-crown', cls: 'note', title: `Enrolled as ${member.tier} member`, desc: `Annual fee · ${tierAnnualPrice(member.tier)} BHD`, when: 'Member since ' + fmtShort(member.joined) });
  history.slice(0, 5).forEach(b => {
    if (b.status === 'cancel') {
      events.push({ icon: 'fa-times', cls: 'cancel', title: `Cancelled: ${b.service}`, desc: b.id, when: fmtShort(b.date) });
    } else if (b.paid) {
      events.push({ icon: 'fa-check-circle', cls: 'payment', title: `Paid: ${b.service}`, desc: `${b.total ?? 0} BHD · ${b.id}`, when: fmtShort(b.date) });
    } else {
      events.push({ icon: 'fa-calendar-check', cls: 'book', title: `Booked: ${b.service}`, desc: b.id, when: fmtShort(b.date) });
    }
  });
  tl.innerHTML = events.map(e => `
    <li>
      <div class="timeline__dot ${e.cls}"><i class="fas ${e.icon}"></i></div>
      <div class="timeline__body">
        <strong>${e.title}</strong>
        ${e.desc ? `<p>${e.desc}</p>` : ''}
        <span class="timeline__time">${e.when}</span>
      </div>
    </li>
  `).join('');
}

/* ---------- Toast ---------- */
function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 3500);
}

/* ---------- Action wires ---------- */
document.getElementById('renew-btn')?.addEventListener('click', () => {
  if (!confirm(`Renew ${member.name}'s ${member.tier} membership for another year?`)) return;
  const start = new Date();
  const renews = new Date(); renews.setFullYear(renews.getFullYear() + 1);
  member.joined = start.toISOString().split('T')[0];
  member.renews = renews.toISOString().split('T')[0];
  // Reset balance based on tier
  const balanceMap = {
    Silver: '2 massages · 1 foot ritual',
    Gold: '6 massages · 1 hammam · 2 foot rituals'
  };
  member.balance = balanceMap[member.tier];
  member.comp_balance = tierAllowance(member.tier);   // reset durable allowance
  persist();
  render();
  if (window.TajLog) TajLog.add({ type: 'member', title: `Membership renewed: ${member.name}`, desc: `${member.tier} · 1 year`, ref: member.id, refType: 'member' });
  showToast('Membership renewed for another year');
});

document.getElementById('upgrade-btn')?.addEventListener('click', () => {
  const prev = member.tier;
  const next = { Silver: 'Gold', Gold: null }[member.tier];
  if (!next) { alert('Already at the highest tier (Gold).'); return; }
  if (!confirm(`Upgrade ${member.name} from ${member.tier} to ${next}?`)) return;
  member.tier = next;
  const balanceMap = {
    Silver: '2 massages · 1 foot ritual',
    Gold: '6 massages · 1 hammam · 2 foot rituals'
  };
  member.balance = balanceMap[next];
  member.comp_balance = tierAllowance(next);          // allowance for the new tier
  persist();
  render();
  if (window.TajLog) TajLog.add({ type: 'member', title: `Tier upgrade: ${member.name}`, desc: `${prev} → ${next}`, ref: member.id, refType: 'member' });
  showToast(`Upgraded to ${next} tier`);
});

/* ---- Adjust complimentary balance ---- */
document.getElementById('edit-balance')?.addEventListener('click', () => {
  const a = tierAllowance(member.tier);
  const cur = compBalance(member);
  const cats = [
    { key: 'massages', label: 'Signature Massages', max: a.massages },
    { key: 'hammams',  label: 'Royal Hammam',       max: a.hammams },
    { key: 'foot',     label: 'Foot Rituals',       max: a.foot },
    { key: 'guest',    label: 'Guest Passes',       max: a.guest },
  ].filter(c => c.max > 0);
  if (!cats.length) { alert('This tier has no complimentary services to adjust.'); return; }

  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(36,19,8,.55);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;';
  ov.innerHTML = `<div style="background:#fff;border-radius:18px;max-width:420px;width:100%;padding:28px 26px;box-shadow:0 30px 80px rgba(0,0,0,.3);">
    <h3 style="font-family:var(--f-display);font-weight:500;color:var(--c-deep);margin-bottom:4px;">Adjust Balance</h3>
    <p style="color:var(--c-text-soft);font-size:.86rem;margin-bottom:18px;">Set the complimentary services remaining for ${member.name} this membership year.</p>
    ${cats.map(c => `<div class="field" style="margin-bottom:12px;"><label>${c.label} <small style="color:var(--c-text-soft);">/ ${c.max} per year</small></label><input type="number" id="adj-${c.key}" min="0" max="${c.max}" value="${Math.min(cur[c.key], c.max)}"></div>`).join('')}
    <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:16px;">
      <button class="btn btn--outline" id="adj-cancel" style="padding:11px 20px;">Cancel</button>
      <button class="btn btn--primary" id="adj-save" style="padding:11px 22px;"><i class="fas fa-save"></i> Save</button>
    </div></div>`;
  document.body.appendChild(ov);
  const close = () => ov.remove();
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  ov.querySelector('#adj-cancel').addEventListener('click', close);
  ov.querySelector('#adj-save').addEventListener('click', async () => {
    const next = Object.assign({}, cur);
    cats.forEach(c => {
      let v = parseInt(ov.querySelector('#adj-' + c.key).value, 10);
      if (isNaN(v)) v = 0;
      next[c.key] = Math.max(0, Math.min(v, c.max));
    });
    member.comp_balance = next;
    await persist();
    render();
    close();
    showToast('Balance updated');
    if (window.TajLog) TajLog.add({ type: 'note', title: `Balance adjusted: ${member.name}`, desc: member.tier, ref: member.id, refType: 'member' });
  });
});

document.getElementById('freeze-btn')?.addEventListener('click', () => {
  // Pending → activate on confirmed payment. Active → freeze. Frozen → reactivate.
  const isPending = member.status === 'pending-payment' || member.status === 'pending';
  if (isPending) {
    if (!confirm(`Activate ${member.name}'s membership? Confirm the payment has been received — this unlocks their member benefits.`)) return;
    member.status = 'active';
    persist();
    render();
    if (window.TajLog) TajLog.add({ type: 'member', title: `Membership activated: ${member.name}`, desc: `${member.tier} · payment confirmed`, ref: member.id, refType: 'member' });
    // Activation email (fire-and-forget; no-op if SMTP is off).
    if (window.TajData && TajData.email && member.email) TajData.email.send({ type: 'membership_activated', memberId: member.id });
    showToast('Membership activated');
    return;
  }
  const willFreeze = member.status !== 'frozen';
  const msg = willFreeze
    ? `Freeze ${member.name}'s membership? They won't be able to book until reactivated.`
    : `Reactivate ${member.name}'s membership?`;
  if (!confirm(msg)) return;
  member.status = willFreeze ? 'frozen' : 'active';
  persist();
  render();
  showToast(willFreeze ? 'Membership frozen' : 'Membership reactivated');
});

document.getElementById('cancel-btn')?.addEventListener('click', async () => {
  if (!confirm(`Cancel ${member.name}'s membership permanently? This cannot be undone.`)) return;
  // Route the delete through the data layer (Supabase + localStorage mirror) and
  // await it so the row is gone before we navigate back to the roster.
  if (window.TajData) {
    try { await TajData.members.remove(member.id); }
    catch (err) {
      console.warn('[admin-member] member delete failed, using localStorage:', err);
      members = members.filter(m => m.id !== member.id);
      localStorage.setItem('taj-members', JSON.stringify(members));
    }
  } else {
    members = members.filter(m => m.id !== member.id);
    localStorage.setItem('taj-members', JSON.stringify(members));
  }
  location.href = 'admin.html#members';
});

document.getElementById('save-notes')?.addEventListener('click', () => {
  member.notes = document.getElementById('notes').value;
  persist();
  showToast('Notes saved');
});

document.getElementById('admin-logout')?.addEventListener('click', e => {
  e.preventDefault();
  if (window.TajAdmin) { TajAdmin.signOut(); return; }
  sessionStorage.removeItem('taj-admin-auth');
  location.href = 'admin-login.html';
});

render();
