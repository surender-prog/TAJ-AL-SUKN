/* Taj Al Sukun — Admin New Booking (full page) */

if (sessionStorage.getItem('taj-admin-auth') !== '1') {
  location.replace('admin-login.html');
}

const VAT_RATE = 0.10;
const form = document.getElementById('builder-form');
const memberCard = document.getElementById('member-card');
const tierSel = document.getElementById('bk-tier');
const midInput = document.getElementById('bk-mid');
const serviceSel = document.getElementById('bk-service');
const dateIn = document.getElementById('bk-date');
const timeIn = document.getElementById('bk-time');
const discType = document.getElementById('bk-disc-type');
const discReason = document.getElementById('bk-disc-reason');
const discValue = document.getElementById('bk-disc-value');
const paidSel = document.getElementById('bk-paid');
let loadedMember = null;          // the member whose rate applies (null = walk-in)
let bookingMode = 'self';         // 'self' = for the member · 'other' = for someone else
let chosen = [];                  // selected treatments: [{name,price,dur,durMin,qty,comp,bucket}]
// service name → category, to match a treatment to a complimentary bucket
const svcCatByName = {};
try { (JSON.parse(localStorage.getItem('taj-services') || '[]') || []).forEach(s => { if (s && s.name) svcCatByName[s.name] = s.category || ''; }); } catch (_) {}

// Searchable treatment picker, driven by the services master. The chosen
// service is stored in the hidden #bk-service as "name|price|duration" so the
// existing pricing/save logic stays unchanged.
let resetService = () => {};
(function fillServices() {
  if (!serviceSel) return;
  const searchIn = document.getElementById('bk-service-search');
  const listEl = document.getElementById('bk-service-list');
  if (!searchIn || !listEl) return;
  const escH = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));

  let list = [];
  try { list = JSON.parse(localStorage.getItem('taj-services') || '[]') || []; } catch (_) {}
  const SVC = list
    .filter(s => s && s.status === 'active' && s.show_in_booking !== false)
    .sort((a, b) => (a.sort || 0) - (b.sort || 0) || (a.name || '').localeCompare(b.name || ''))
    .map(s => {
      const dur = (s.duration || '60 min').split('/')[0].trim();
      const tag = s.tag ? ' · ' + s.tag : '';
      return { name: s.name || '', price: s.price, dur, meta: `${s.price} BHD · ${dur}${tag}` };
    });
  if (!SVC.length) return;

  let activeIdx = -1;
  const valueOf = it => `${it.name}|${it.price}|${it.dur}`;
  const open  = () => { listEl.hidden = false; searchIn.setAttribute('aria-expanded', 'true'); };
  const close = () => { listEl.hidden = true; searchIn.setAttribute('aria-expanded', 'false'); activeIdx = -1; };

  function select(it) {
    addService(it);          // append to the chosen list (or bump qty)
    searchIn.value = '';
    close();
  }
  function renderList(q) {
    const ql = (q || '').trim().toLowerCase();
    const items = ql ? SVC.filter(s => s.name.toLowerCase().includes(ql)) : SVC;
    activeIdx = -1;
    listEl.innerHTML = items.length
      ? items.map(s => `<div class="svc-combo__item" role="option" data-i="${SVC.indexOf(s)}"><span class="nm">${escH(s.name)}</span><small>${escH(s.meta)}</small></div>`).join('')
      : '<div class="svc-combo__empty">No treatments match.</div>';
    listEl.querySelectorAll('.svc-combo__item').forEach(el =>
      el.addEventListener('mousedown', e => { e.preventDefault(); select(SVC[parseInt(el.dataset.i, 10)]); }));
  }
  function highlight() {
    const items = [...listEl.querySelectorAll('.svc-combo__item')];
    items.forEach((el, i) => el.classList.toggle('is-active', i === activeIdx));
    if (items[activeIdx]) items[activeIdx].scrollIntoView({ block: 'nearest' });
  }

  searchIn.addEventListener('focus', () => { renderList(''); open(); });
  searchIn.addEventListener('input', () => { renderList(searchIn.value); open(); });
  searchIn.addEventListener('blur', () => setTimeout(close, 150));
  searchIn.addEventListener('keydown', e => {
    const items = [...listEl.querySelectorAll('.svc-combo__item')];
    if (e.key === 'ArrowDown') { e.preventDefault(); if (listEl.hidden) { renderList(searchIn.value); open(); } activeIdx = Math.min(activeIdx + 1, items.length - 1); highlight(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx = Math.max(activeIdx - 1, 0); highlight(); }
    else if (e.key === 'Enter') { if (!listEl.hidden && items.length) { e.preventDefault(); const el = items[activeIdx] || items[0]; select(SVC[parseInt(el.dataset.i, 10)]); } }
    else if (e.key === 'Escape') { close(); }
  });

  resetService = () => { chosen = [makeLine(SVC[0])]; renderChosen(); };
  chosen = [makeLine(SVC[0])];   // seed one line so pricing shows immediately
  renderChosen();
})();

// Set today as default date
(function () {
  const t = new Date();
  t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
  dateIn.min = t.toISOString().split('T')[0];
  dateIn.value = t.toISOString().split('T')[0];
})();

function fmt(n) { return n.toFixed(3) + ' BHD'; }
function fmtDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  const dt = new Date(parseInt(y), parseInt(m)-1, parseInt(day));
  return dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
function fmtTime(t) {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hh = parseInt(h, 10);
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const display = hh % 12 || 12;
  return `${display}:${m} ${ampm}`;
}
function escH(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c])); }

/* ---------- Multi-service line items ---------- */
function durToMin(dur) { const m = String(dur || '').match(/\d+/); return m ? parseInt(m[0], 10) : 60; }
function svcBucketFor(name) {
  const cat = (svcCatByName[name] || '').toLowerCase();
  if (cat.indexOf('massage') >= 0) return 'massages';
  if (cat.indexOf('hammam') >= 0)  return 'hammams';
  if (cat.indexOf('foot') >= 0)    return 'foot';
  return null;
}
function valueOfLine(l) { return `${l.name}|${l.price}|${l.dur}`; }
function makeLine(svc) {
  return { name: svc.name || '', price: +svc.price || 0, dur: svc.dur || '60 min', durMin: durToMin(svc.dur), qty: 1, comp: false, bucket: svcBucketFor(svc.name) };
}
// Append a treatment to the chosen list, or bump its quantity if already present.
function addService(svc) {
  const existing = chosen.find(l => l.name === (svc.name || ''));
  if (existing) existing.qty += 1;
  else chosen.push(makeLine(svc));
  renderChosen();
}
function compRemaining() {
  return loadedMember ? remaining(loadedMember) : { massages: 0, hammams: 0, foot: 0 };
}
// Keep complimentary flags valid: only member-eligible lines, and never redeem
// more of a bucket than the member's remaining balance (qty-aware, greedy).
function reconcileComp() {
  const avail = compRemaining();
  const used = { massages: 0, hammams: 0, foot: 0 };
  chosen.forEach(l => {
    if (!loadedMember || !l.bucket) { l.comp = false; return; }
    if (!l.comp) return;
    if (used[l.bucket] + l.qty <= (avail[l.bucket] || 0)) used[l.bucket] += l.qty;
    else l.comp = false;
  });
}
// Paint the chosen list, sync the legacy/structured hidden inputs, recalc.
function renderChosen() {
  const listEl = document.getElementById('bk-service-chosen');
  const emptyEl = document.getElementById('bk-service-empty');
  if (!listEl) return;
  reconcileComp();
  listEl.innerHTML = chosen.map((l, i) => {
    const lineTotal = +((+l.price || 0) * l.qty).toFixed(3);
    const compCtrl = (loadedMember && l.bucket)
      ? `<label class="svc-chosen__comp"><input type="checkbox" data-act="comp" data-i="${i}"${l.comp ? ' checked' : ''}> Complimentary</label>`
      : '';
    return `<li class="svc-chosen__item" data-i="${i}">
      <div class="svc-chosen__info">
        <span class="svc-chosen__nm">${escH(l.name)}</span>
        <span class="svc-chosen__meta">${fmt(lineTotal)} · ${escH(l.dur)}</span>
      </div>
      ${compCtrl}
      <div class="svc-chosen__qty">
        <button type="button" class="svc-qty__btn" data-act="dec" data-i="${i}" aria-label="Decrease quantity">−</button>
        <span class="svc-qty__n">${l.qty}</span>
        <button type="button" class="svc-qty__btn" data-act="inc" data-i="${i}" aria-label="Increase quantity">+</button>
      </div>
      <button type="button" class="svc-chosen__remove" data-act="remove" data-i="${i}" aria-label="Remove ${escH(l.name)}">×</button>
    </li>`;
  }).join('');
  if (emptyEl) emptyEl.hidden = chosen.length > 0;
  if (serviceSel) serviceSel.value = chosen.length ? valueOfLine(chosen[0]) : '';
  const sj = document.getElementById('bk-services-json');
  if (sj) sj.value = JSON.stringify(chosen);
  refreshBalance();
  recalc();
}
// Member's remaining complimentary balance summary (informational).
function refreshBalance() {
  const wrap = document.getElementById('bk-prepaid-wrap');
  const info = document.getElementById('bk-prepaid-info');
  if (!wrap || !info) return;
  if (!loadedMember) { wrap.hidden = true; return; }
  const bal = remaining(loadedMember);
  const guest = (loadedMember.comp_balance && typeof loadedMember.comp_balance === 'object') ? (parseInt(loadedMember.comp_balance.guest, 10) || 0) : 0;
  const parts = [];
  if (bal.massages) parts.push(`${bal.massages} massage${bal.massages > 1 ? 's' : ''}`);
  if (bal.hammams)  parts.push(`${bal.hammams} hammam${bal.hammams > 1 ? 's' : ''}`);
  if (bal.foot)     parts.push(`${bal.foot} foot ritual${bal.foot > 1 ? 's' : ''}`);
  if (guest)        parts.push(`${guest} guest pass${guest > 1 ? 'es' : ''}`);
  info.innerHTML = parts.length
    ? `<b>${escH(loadedMember.tier || 'Member')} balance:</b> ${parts.join(' · ')}. Tick “Complimentary” on an eligible treatment to redeem.`
    : `<b>${escH(loadedMember.tier || 'Member')} balance:</b> no complimentary services left this year.`;
  wrap.hidden = false;
}
// Delegated controls for the chosen list (qty, remove, complimentary toggle).
(function bindChosen() {
  const listEl = document.getElementById('bk-service-chosen');
  if (!listEl) return;
  listEl.addEventListener('click', e => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;
    const i = parseInt(btn.dataset.i, 10);
    if (isNaN(i) || !chosen[i]) return;
    if (act === 'inc') chosen[i].qty += 1;
    else if (act === 'dec') { if (chosen[i].qty <= 1) chosen.splice(i, 1); else chosen[i].qty -= 1; }
    else if (act === 'remove') chosen.splice(i, 1);
    else return;
    renderChosen();
  });
  listEl.addEventListener('change', e => {
    const cb = e.target.closest('[data-act="comp"]');
    if (!cb) return;
    const i = parseInt(cb.dataset.i, 10);
    if (chosen[i]) chosen[i].comp = cb.checked;
    renderChosen();   // reconcileComp may revert an over-budget toggle
  });
})();

[tierSel, midInput].forEach(el => el && el.addEventListener('input', recalc));

// All inputs
form.querySelectorAll('input, select, textarea').forEach(el => {
  el.addEventListener('input', recalc);
  el.addEventListener('change', recalc);
});

// Shared pricing math — used by both the live preview and saveBooking() so the
// previewed total always equals the saved total (identical rounding order).
function computeTotals() {
  let subtotal = 0, compTotal = 0;
  chosen.forEach(l => {
    const lineTotal = +((+l.price || 0) * l.qty).toFixed(3);
    subtotal += lineTotal;
    if (l.comp) compTotal += lineTotal;
  });
  subtotal = +subtotal.toFixed(3);
  compTotal = +compTotal.toFixed(3);
  const taxableSubtotal = +(subtotal - compTotal).toFixed(3);

  const isMember = !!loadedMember;
  const tierOpt = tierSel.options[tierSel.selectedIndex];
  const mDiscPct = (isMember && tierOpt && tierOpt.dataset.discount) ? parseInt(tierOpt.dataset.discount, 10) : 0;
  const mDisc = +(taxableSubtotal * mDiscPct / 100).toFixed(3);

  const extraType = discType.value;
  const extraValue = parseFloat(discValue.value || 0);
  let eDisc = 0;
  if (extraType === 'percent' && extraValue > 0) eDisc = +((taxableSubtotal - mDisc) * extraValue / 100).toFixed(3);
  else if (extraType === 'fixed' && extraValue > 0) eDisc = +Math.min(extraValue, taxableSubtotal - mDisc).toFixed(3);

  const beforeTax = +(taxableSubtotal - mDisc - eDisc).toFixed(3);
  const tax = +(beforeTax * VAT_RATE).toFixed(3);
  const total = +(beforeTax + tax).toFixed(3);
  return { subtotal, compTotal, taxableSubtotal, isMember, mDiscPct, mDisc, extraType, extraValue, eDisc, beforeTax, tax, total };
}

function recalc() {
  const t = computeTotals();

  // Preview header
  const isPaid = paidSel.value === '1';
  document.getElementById('pv-type').textContent = isPaid ? 'Receipt' : 'Invoice';
  document.getElementById('pv-status').className = 'inv-status ' + (isPaid ? 'paid' : 'draft');
  document.getElementById('pv-status').textContent = isPaid ? 'Paid' : 'Draft';
  document.getElementById('pv-no').textContent = 'DRAFT';
  document.getElementById('pv-date').textContent = dateIn.value ? 'Issued ' + fmtDate(dateIn.value) : '—';

  const name = form.elements.name.value || '—';
  const phone = form.elements.phone.value || '—';
  document.getElementById('pv-name').textContent = name;
  document.getElementById('pv-info').innerHTML = (phone === '—' ? 'Enter guest details to begin' : `${phone}<br>${fmtDate(dateIn.value)} · ${fmtTime(timeIn.value)}`);

  // Line items — one row per chosen treatment
  document.getElementById('pv-items').innerHTML = chosen.length
    ? chosen.map(l => {
        const lineTotal = +((+l.price || 0) * l.qty).toFixed(3);
        const label = l.comp ? 'Complimentary — member balance'
          : (t.isMember && t.mDiscPct > 0 ? tierSel.value + ' member rate' : 'Standard rate');
        return `<tr><td><strong>${escH(l.name)}</strong><small>${label}</small></td><td>${escH(l.dur)}</td><td class="r">${l.qty}</td><td class="r"><strong>${fmt(lineTotal)}</strong></td></tr>`;
      }).join('')
    : `<tr><td colspan="4" style="text-align:center;color:var(--c-muted);padding:18px;">No treatments added yet</td></tr>`;

  document.getElementById('pv-subtotal').textContent = fmt(t.subtotal);

  const compRow = document.getElementById('pv-comp-row');
  if (t.compTotal > 0) { compRow.style.display = ''; document.getElementById('pv-comp').textContent = '−' + fmt(t.compTotal); }
  else compRow.style.display = 'none';

  const mr = document.getElementById('pv-mdisc-row');
  if (t.mDisc > 0) {
    mr.style.display = '';
    document.getElementById('pv-mdisc-label').textContent = `${tierSel.value} Discount (${t.mDiscPct}%)`;
    document.getElementById('pv-mdisc').textContent = '−' + fmt(t.mDisc);
  } else mr.style.display = 'none';

  const er = document.getElementById('pv-edisc-row');
  if (t.eDisc > 0) {
    er.style.display = '';
    const detail = t.extraType === 'percent' ? ' (' + t.extraValue + '%)' : '';
    document.getElementById('pv-edisc-label').textContent = discReason.value + detail;
    document.getElementById('pv-edisc').textContent = '−' + fmt(t.eDisc);
  } else er.style.display = 'none';

  document.getElementById('pv-tax').textContent = fmt(t.tax);
  document.getElementById('pv-total').textContent = fmt(t.total);
}

/* ---------- Member lookup + tabs + complimentary (prepaid) balance ---------- */
const memSearch  = document.getElementById('bk-member-search');
const memFindBtn = document.getElementById('bk-member-find');
const memStatus  = document.getElementById('bk-member-status');
const findBox    = document.getElementById('mbr-find');
const loadedBox  = document.getElementById('mbr-loaded');
const tabSelf    = document.getElementById('tab-self');
const tabOther   = document.getElementById('tab-other');
const mbrName    = document.getElementById('mbr-name');
const mbrMeta    = document.getElementById('mbr-meta');
const mbrPill    = document.getElementById('mbr-disc-pill');
const mbrNote    = document.getElementById('mbr-note');
const mbrChange  = document.getElementById('mbr-change');
const prepaidWrap = document.getElementById('bk-prepaid-wrap');

// The discount % carried by the currently selected tier (data-discount on the
// <option>). This is what auto-maps the member discount to the tier.
function tierDiscount() {
  const o = tierSel.options[tierSel.selectedIndex];
  return (o && o.dataset.discount) ? parseInt(o.dataset.discount, 10) : 0;
}

function parseBalance(str) {
  const s = (str || '').toLowerCase();
  const n = re => { const m = s.match(re); return m ? parseInt(m[1], 10) : 0; };
  return { massages: n(/(\d+)\s*massage/), hammams: n(/(\d+)\s*hammam/), foot: n(/(\d+)\s*foot/) };
}
function formatBalance(b) {
  const p = [];
  if (b.massages) p.push(`${b.massages} massage${b.massages > 1 ? 's' : ''}`);
  if (b.hammams)  p.push(`${b.hammams} hammam${b.hammams > 1 ? 's' : ''}`);
  if (b.foot)     p.push(`${b.foot} foot ritual${b.foot > 1 ? 's' : ''}`);
  return p.join(' · ') || 'no complimentary services left';
}
// Remaining complimentary services — prefer the durable comp_balance column.
function remaining(m) {
  const cb = m && m.comp_balance;
  if (cb && typeof cb === 'object') return { massages: parseInt(cb.massages, 10) || 0, hammams: parseInt(cb.hammams, 10) || 0, foot: parseInt(cb.foot, 10) || 0 };
  return parseBalance(m ? m.balance : '');
}
// Switch between "this member" and "book for someone else". The member's tier
// rate/discount stays applied in both modes — only the guest identity differs.
function setMode(mode) {
  bookingMode = mode === 'other' ? 'other' : 'self';
  const other = bookingMode === 'other';
  if (tabSelf)  { tabSelf.classList.toggle('is-active', !other);  tabSelf.setAttribute('aria-selected', String(!other)); }
  if (tabOther) { tabOther.classList.toggle('is-active', other);  tabOther.setAttribute('aria-selected', String(other)); }
  if (!loadedMember) return;
  const pct = tierDiscount();
  if (other) {
    // Booking for a different guest — clear identity, keep the member's rate.
    form.elements.name.value = '';
    form.elements.phone.value = '';
    if (form.elements.email) form.elements.email.value = '';
    if (mbrNote) mbrNote.innerHTML = `Enter the guest’s details below — <b>${loadedMember.name}</b>’s ${pct}% ${loadedMember.tier || 'member'} rate still applies.`;
    form.elements.name.focus();
  } else {
    // Booking for the member — fill their own details.
    form.elements.name.value  = loadedMember.name || '';
    form.elements.phone.value = loadedMember.phone || '';
    if (form.elements.email) form.elements.email.value = loadedMember.email || '';
    if (mbrNote) mbrNote.innerHTML = `Booking for <b>${loadedMember.name}</b> — ${pct}% ${loadedMember.tier || 'member'} discount applied.`;
  }
  recalc();
}
tabSelf  && tabSelf.addEventListener('click', () => setMode('self'));
tabOther && tabOther.addEventListener('click', () => setMode('other'));

function loadMember(m) {
  loadedMember = m;
  if (m.tier) tierSel.value = m.tier;          // → maps the discount to the tier
  midInput.value = m.id || '';
  const pct = tierDiscount();
  if (mbrName) mbrName.textContent = m.name || 'Member';
  if (mbrMeta) mbrMeta.textContent = `${m.tier || 'Member'} · ${m.id || ''}`;
  if (mbrPill) mbrPill.textContent = pct ? `${pct}% off` : 'Member';
  if (findBox)   findBox.hidden = true;
  if (loadedBox) loadedBox.hidden = false;
  setMode('self');                             // fills guest fields, note, recalc
  renderChosen();                              // repaint comp toggles + balance now a member is loaded
}

// Clear the member and return to the find / walk-in state.
function resetMember() {
  loadedMember = null;
  if (findBox)   findBox.hidden = false;
  if (loadedBox) loadedBox.hidden = true;
  if (memSearch) memSearch.value = '';
  if (memStatus) memStatus.textContent = 'Find a member to apply their rate, or continue below as a walk-in guest.';
  midInput.value = '';
  form.elements.name.value = '';
  form.elements.phone.value = '';
  if (form.elements.email) form.elements.email.value = '';
  if (prepaidWrap) prepaidWrap.hidden = true;
  chosen.forEach(l => { l.comp = false; });   // no member → drop complimentary flags
  renderChosen();
}
mbrChange && mbrChange.addEventListener('click', resetMember);
async function findMember() {
  const q = (memSearch.value || '').trim();
  if (!q) { memStatus.textContent = 'Enter a phone, email, or member ID.'; return; }
  memStatus.textContent = 'Searching…';
  let all = [];
  try { if (window.TajData && TajData.members) all = await TajData.members.list(); } catch (_) {}
  const ql = q.toLowerCase();
  const digits = q.replace(/\D/g, '').replace(/^973/, '');
  const m = (all || []).find(x =>
    (x.id || '').toLowerCase() === ql ||
    (x.email || '').toLowerCase() === ql ||
    (digits.length >= 6 && (x.phone || '').replace(/\D/g, '').replace(/^973/, '') === digits));
  if (!m) { memStatus.innerHTML = `<span style="color:#c0392b;">No member found for "${q}".</span> Continue below as a walk-in guest.`; return; }
  loadMember(m);
}
memFindBtn && memFindBtn.addEventListener('click', findMember);
memSearch  && memSearch.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); findMember(); } });

// Arriving from a member's profile (admin-new-booking.html?member=ID) →
// auto-fill that member's details and map their tier discount.
(async function preloadMemberFromUrl() {
  let id = '';
  try { id = new URLSearchParams(location.search).get('member') || ''; } catch (_) {}
  if (!id) return;
  memStatus.textContent = 'Loading member…';
  let all = [];
  try { if (window.TajData && TajData.members) all = await TajData.members.list(); } catch (_) {}
  const m = (all || []).find(x => (x.id || '').toLowerCase() === id.toLowerCase());
  if (m) { if (memSearch) memSearch.value = m.id || ''; loadMember(m); }
  else { memStatus.textContent = ''; }
})();

recalc();

/* ---------- Save booking + invoice ---------- */
async function saveBooking() {
  if (!form.checkValidity()) { form.reportValidity(); return null; }
  if (!chosen.length) {
    const emptyEl = document.getElementById('bk-service-empty');
    if (emptyEl) emptyEl.hidden = false;
    return null;
  }

  // Same math as the live preview (computeTotals) so saved === previewed.
  const tot = computeTotals();
  const { subtotal, compTotal, taxableSubtotal, isMember, mDiscPct, mDisc, extraType, extraValue, eDisc, tax, total } = tot;
  const hasComp = compTotal > 0;

  const bookings = JSON.parse(localStorage.getItem('taj-bookings') || '[]');
  const yr = new Date().getFullYear();
  const seq = String(Date.now()).slice(-4);
  const id = 'BK-' + yr + '-' + seq;
  const isPaid = paidSel.value === '1';

  // Legacy scalar fields — kept populated for every existing reader.
  const serviceLabel = chosen.length <= 2
    ? chosen.map(l => l.name).join(', ')
    : (chosen[0].name + ' +' + (chosen.length - 1) + ' more');
  const durationSum = chosen.reduce((s, l) => s + (l.durMin || 0) * l.qty, 0) || 60;
  // Structured line items — nested in the already-allowlisted `invoice` jsonb.
  const items = chosen.map(l => ({
    name: l.name, price: +l.price || 0, dur: l.dur, durMin: l.durMin || 0,
    qty: l.qty, comp: !!l.comp, bucket: l.bucket || null,
    lineTotal: +((+l.price || 0) * l.qty).toFixed(3)
  }));

  const booking = {
    id,
    name: form.elements.name.value,
    phone: form.elements.phone.value,
    email: form.elements.email.value,
    service: serviceLabel,
    tier: isMember ? tierSel.value : null,
    memberId: isMember ? midInput.value : null,
    date: dateIn.value,
    time: timeIn.value,
    duration: durationSum,
    therapist: form.elements.therapist.value,
    notes: [form.elements.notes.value, hasComp ? 'Complimentary — redeemed from member balance' : ''].filter(Boolean).join(' · '),
    paymentMethod: form.elements.payment_method.value,
    price: +(taxableSubtotal - mDisc).toFixed(3),   // net of member discount (legacy semantic)
    status: isPaid ? 'confirmed' : 'pending',
    source: 'admin',
    paid: isPaid,
    paidAt: isPaid ? new Date().toISOString() : null,
    invoice: {
      number: 'INV-' + yr + '-' + seq,
      issued: new Date().toISOString().split('T')[0],
      items,
      subtotal,
      compTotal,
      memberDisc: mDisc,
      extraDiscount: extraValue > 0 ? { type: extraType, value: extraValue, reason: discReason.value, amount: eDisc } : { type: null, value: 0 },
      vat: tax,
      total
    }
  };

  // Deduct complimentary redemptions from the member's balance — aggregate per
  // bucket across all comp lines (qty-aware), single upsert, preserve guest passes.
  if (hasComp && loadedMember && window.TajData && TajData.members) {
    try {
      const cb = remaining(loadedMember);
      const dec = { massages: 0, hammams: 0, foot: 0 };
      let units = 0;
      chosen.forEach(l => { if (l.comp && l.bucket && dec[l.bucket] !== undefined) { dec[l.bucket] += l.qty; units += l.qty; } });
      const prevGuest = (loadedMember.comp_balance && typeof loadedMember.comp_balance === 'object')
        ? (parseInt(loadedMember.comp_balance.guest, 10) || 0) : 0;
      loadedMember.comp_balance = {
        massages: Math.max(0, (cb.massages || 0) - dec.massages),
        hammams:  Math.max(0, (cb.hammams || 0)  - dec.hammams),
        foot:     Math.max(0, (cb.foot || 0)     - dec.foot),
        guest: prevGuest
      };
      loadedMember.balance = formatBalance(loadedMember.comp_balance);   // keep legacy text in step
      loadedMember.servicesUsed = (parseInt(loadedMember.servicesUsed ?? loadedMember.services_used, 10) || 0) + units;
      await TajData.members.upsert(loadedMember);
    } catch (err) { console.warn('[booking] balance deduct failed:', err); }
  }

  // Persist via data layer (Supabase + localStorage mirror), fall back to LS-only
  try {
    if (window.TajData) {
      await TajData.bookings.upsert(booking);
      await TajData.activity.log({
        type: 'booking',
        title: `New booking: ${booking.name}`,
        desc:  `${booking.service} · ${booking.date} ${booking.time} · ${total.toFixed(0)} BHD`,
        ref:   booking.id,
        refType: 'booking'
      });
      if (isPaid) {
        await TajData.activity.log({
          type: 'payment',
          title: `Payment: ${booking.name}`,
          desc:  `${total.toFixed(0)} BHD via ${booking.paymentMethod || 'Cash'}`,
          ref:   booking.id,
          refType: 'booking'
        });
      }
    } else {
      bookings.unshift(booking);
      localStorage.setItem('taj-bookings', JSON.stringify(bookings));
      if (window.TajLog) {
        TajLog.add({ type: 'booking', title: `New booking: ${booking.name}`, desc: `${booking.service} · ${booking.date} ${booking.time} · ${total.toFixed(0)} BHD`, ref: booking.id, refType: 'booking' });
        if (isPaid) TajLog.add({ type: 'payment', title: `Payment: ${booking.name}`, desc: `${total.toFixed(0)} BHD via ${booking.paymentMethod || 'Cash'}`, ref: booking.id, refType: 'booking' });
      }
    }
  } catch (err) {
    console.warn('[admin-new-booking] save failed:', err);
    bookings.unshift(booking);
    localStorage.setItem('taj-bookings', JSON.stringify(bookings));
  }

  // Show toast
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = `${isPaid ? 'Receipt' : 'Invoice'} created — ${id} · ${fmt(total)}`;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);

  return booking;
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const b = await saveBooking();
  if (b) {
    setTimeout(() => location.href = 'admin.html#bookings', 800);
  }
});

document.getElementById('save-and-new')?.addEventListener('click', async () => {
  const b = await saveBooking();
  if (b) {
    form.reset();
    timeIn.value = '14:00';
    discType.value = '';
    discValue.value = '';
    paidSel.value = '0';
    resetMember();        // clears the member, hides balance, drops comp flags
    resetService();       // resets the chosen list to one default line + renderChosen
  }
});

document.getElementById('admin-logout')?.addEventListener('click', e => {
  e.preventDefault();
  if (window.TajAdmin) { TajAdmin.signOut(); return; }
  sessionStorage.removeItem('taj-admin-auth');
  location.href = 'admin-login.html';
});
