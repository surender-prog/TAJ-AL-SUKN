/* Taj Al Sukun — Admin New Booking (full page) */

if (sessionStorage.getItem('taj-admin-auth') !== '1') {
  location.replace('admin-login.html');
}

const VAT_RATE = 0.10;
const form = document.getElementById('builder-form');
const memberCard = document.getElementById('member-card');
const memberHead = document.getElementById('member-card-head');
const tierSel = document.getElementById('bk-tier');
const midInput = document.getElementById('bk-mid');
const serviceSel = document.getElementById('bk-service');
const dateIn = document.getElementById('bk-date');
const timeIn = document.getElementById('bk-time');
const discType = document.getElementById('bk-disc-type');
const discReason = document.getElementById('bk-disc-reason');
const discValue = document.getElementById('bk-disc-value');
const paidSel = document.getElementById('bk-paid');

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
    serviceSel.value = valueOf(it);
    searchIn.value = it.name;
    close();
    serviceSel.dispatchEvent(new Event('change', { bubbles: true }));
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

  resetService = () => select(SVC[0]);
  select(SVC[0]);          // default selection so pricing shows immediately
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

// Member toggle
memberHead.addEventListener('click', () => {
  memberCard.classList.toggle('active');
  recalc();
});
[tierSel, midInput].forEach(el => el && el.addEventListener('input', recalc));

// All inputs
form.querySelectorAll('input, select, textarea').forEach(el => {
  el.addEventListener('input', recalc);
  el.addEventListener('change', recalc);
});

function recalc() {
  // Service
  const [svcName, svcPriceStr, svcDuration] = serviceSel.value.split('|');
  const svcPrice = parseFloat(svcPriceStr);

  // Member discount
  const isMember = memberCard.classList.contains('active');
  const tierOpt = tierSel.options[tierSel.selectedIndex];
  const mDiscPct = (isMember && tierOpt && tierOpt.dataset.discount)
    ? parseInt(tierOpt.dataset.discount, 10) : 0;
  let mDisc = +(svcPrice * mDiscPct / 100).toFixed(3);

  // Extra discount
  const extraType = discType.value;
  const extraValue = parseFloat(discValue.value || 0);
  const extraReason = discReason.value;
  let eDisc = 0;
  if (extraType === 'percent' && extraValue > 0) {
    eDisc = +((svcPrice - mDisc) * extraValue / 100).toFixed(3);
  } else if (extraType === 'fixed' && extraValue > 0) {
    eDisc = +Math.min(extraValue, svcPrice - mDisc).toFixed(3);
  }

  // Complimentary (prepaid) — the whole treatment is drawn from the member balance.
  const prepaid = !!(typeof prepaidChk !== 'undefined' && prepaidChk && prepaidChk.checked && prepaidAvailable());
  let compLabel = null, beforeTax, tax, total;
  if (prepaid) {
    mDisc = svcPrice; eDisc = 0; compLabel = 'Complimentary — member balance';
    beforeTax = 0; tax = 0; total = 0;
  } else {
    beforeTax = svcPrice - mDisc - eDisc;
    tax = +(beforeTax * VAT_RATE).toFixed(3);
    total = +(beforeTax + tax).toFixed(3);
  }

  // Update preview
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

  document.getElementById('pv-items').innerHTML = `
    <tr>
      <td>
        <strong>${svcName}</strong>
        <small>${prepaid ? compLabel : (isMember && mDiscPct > 0 ? tierSel.value + ' member rate' : 'Standard rate')}</small>
      </td>
      <td>${svcDuration}</td>
      <td class="r">1</td>
      <td class="r"><strong>${fmt(svcPrice)}</strong></td>
    </tr>
  `;

  document.getElementById('pv-subtotal').textContent = fmt(svcPrice);

  const mr = document.getElementById('pv-mdisc-row');
  if (mDisc > 0) {
    mr.style.display = '';
    document.getElementById('pv-mdisc-label').textContent = compLabel || `${tierSel.value} Discount (${mDiscPct}%)`;
    document.getElementById('pv-mdisc').textContent = '−' + fmt(mDisc);
  } else mr.style.display = 'none';

  const er = document.getElementById('pv-edisc-row');
  if (eDisc > 0) {
    er.style.display = '';
    const detail = extraType === 'percent' ? ' (' + extraValue + '%)' : '';
    document.getElementById('pv-edisc-label').textContent = extraReason + detail;
    document.getElementById('pv-edisc').textContent = '−' + fmt(eDisc);
  } else er.style.display = 'none';

  document.getElementById('pv-tax').textContent = fmt(tax);
  document.getElementById('pv-total').textContent = fmt(total);
}

/* ---------- Member lookup + complimentary (prepaid) balance ---------- */
let loadedMember = null;
const memSearch  = document.getElementById('bk-member-search');
const memFindBtn = document.getElementById('bk-member-find');
const memStatus  = document.getElementById('bk-member-status');
const prepaidWrap = document.getElementById('bk-prepaid-wrap');
const prepaidChk  = document.getElementById('bk-prepaid');
const prepaidInfo = document.getElementById('bk-prepaid-info');

// service name → category, to match a treatment to a complimentary bucket
const svcCatByName = {};
try { (JSON.parse(localStorage.getItem('taj-services') || '[]') || []).forEach(s => { if (s && s.name) svcCatByName[s.name] = s.category || ''; }); } catch (_) {}

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
function svcBucket() {
  const cat = (svcCatByName[serviceSel.value.split('|')[0]] || '').toLowerCase();
  if (cat.indexOf('massage') >= 0) return 'massages';
  if (cat.indexOf('hammam') >= 0)  return 'hammams';
  if (cat.indexOf('foot') >= 0)    return 'foot';
  return null;
}
function prepaidAvailable() {
  if (!loadedMember) return null;
  const bucket = svcBucket();
  if (!bucket) return null;
  return remaining(loadedMember)[bucket] > 0 ? bucket : null;
}
function refreshPrepaid() {
  if (!loadedMember) { prepaidWrap.hidden = true; prepaidChk.checked = false; return; }
  prepaidWrap.hidden = false;
  const bal = remaining(loadedMember);
  const bucket = prepaidAvailable();
  if (bucket) {
    prepaidInfo.textContent = `${loadedMember.name} has ${formatBalance(bal)}. Tick to apply one free ${serviceSel.value.split('|')[0]}.`;
    prepaidChk.disabled = false;
  } else {
    prepaidInfo.textContent = `Remaining: ${formatBalance(bal)}. The selected treatment isn't covered by the remaining balance.`;
    prepaidChk.checked = false; prepaidChk.disabled = true;
  }
}
function loadMember(m) {
  loadedMember = m;
  form.elements.name.value  = m.name || '';
  form.elements.phone.value = m.phone || '';
  if (form.elements.email && !form.elements.email.value) form.elements.email.value = m.email || '';
  if (m.tier) tierSel.value = m.tier;
  midInput.value = m.id || '';
  memberCard.classList.add('active');
  memStatus.innerHTML = `<span style="color:#2a8a4a; font-weight:600;">✓ ${m.name} · ${m.tier || 'Member'} · ${m.id}</span> — details filled. Edit the guest name above to book for someone else.`;
  refreshPrepaid();
  recalc();
}
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
  if (!m) { memStatus.innerHTML = `<span style="color:#c0392b;">No member found for "${q}".</span> Enter the details above to book as a guest.`; return; }
  loadMember(m);
}
memFindBtn && memFindBtn.addEventListener('click', findMember);
memSearch  && memSearch.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); findMember(); } });
prepaidChk && prepaidChk.addEventListener('change', recalc);
serviceSel.addEventListener('change', refreshPrepaid);
recalc();

/* ---------- Save booking + invoice ---------- */
async function saveBooking() {
  if (!form.checkValidity()) { form.reportValidity(); return null; }

  const [svcName, svcPriceStr] = serviceSel.value.split('|');
  const svcPrice = parseFloat(svcPriceStr);
  const isMember = memberCard.classList.contains('active');
  const tierOpt = tierSel.options[tierSel.selectedIndex];
  const mDiscPct = (isMember && tierOpt && tierOpt.dataset.discount) ? parseInt(tierOpt.dataset.discount, 10) : 0;
  let mDisc = +(svcPrice * mDiscPct / 100).toFixed(3);

  const extraType = discType.value;
  const extraValue = parseFloat(discValue.value || 0);
  let eDisc = 0;
  if (extraType === 'percent' && extraValue > 0) eDisc = +((svcPrice - mDisc) * extraValue / 100).toFixed(3);
  else if (extraType === 'fixed' && extraValue > 0) eDisc = +Math.min(extraValue, svcPrice - mDisc).toFixed(3);

  const prepaid = !!(prepaidChk && prepaidChk.checked && prepaidAvailable());
  const prepaidBucket = prepaid ? prepaidAvailable() : null;
  let beforeTax, tax, total;
  if (prepaid) { mDisc = svcPrice; eDisc = 0; beforeTax = 0; tax = 0; total = 0; }
  else { beforeTax = svcPrice - mDisc - eDisc; tax = +(beforeTax * VAT_RATE).toFixed(3); total = +(beforeTax + tax).toFixed(3); }

  const bookings = JSON.parse(localStorage.getItem('taj-bookings') || '[]');
  const yr = new Date().getFullYear();
  const seq = String(Date.now()).slice(-4);
  const id = 'BK-' + yr + '-' + seq;
  const isPaid = paidSel.value === '1';

  const booking = {
    id,
    name: form.elements.name.value,
    phone: form.elements.phone.value,
    email: form.elements.email.value,
    service: svcName,
    tier: isMember ? tierSel.value : null,
    memberId: isMember ? midInput.value : null,
    date: dateIn.value,
    time: timeIn.value,
    duration: parseInt((serviceSel.value.split('|')[2] || '60').match(/\d+/)?.[0] || '60', 10),
    therapist: form.elements.therapist.value,
    notes: [form.elements.notes.value, prepaid ? 'Complimentary — redeemed from member balance' : ''].filter(Boolean).join(' · '),
    paymentMethod: form.elements.payment_method.value,
    price: +(svcPrice - mDisc).toFixed(3),
    status: isPaid ? 'confirmed' : 'pending',
    source: 'admin',
    paid: isPaid,
    paidAt: isPaid ? new Date().toISOString() : null,
    invoice: {
      number: 'INV-' + yr + '-' + seq,
      issued: new Date().toISOString().split('T')[0],
      total,
      vat: tax,
      memberDisc: mDisc,
      extraDiscount: extraValue > 0 ? { type: extraType, value: extraValue, reason: discReason.value, amount: eDisc } : { type: null, value: 0 }
    }
  };

  // If a complimentary service was redeemed, deduct it from the member's balance.
  if (prepaid && prepaidBucket && loadedMember && window.TajData && TajData.members) {
    try {
      const cb = remaining(loadedMember);
      cb[prepaidBucket] = Math.max(0, (cb[prepaidBucket] || 0) - 1);
      // Preserve the guest field (Guest Passes) that `remaining` doesn't track.
      const prevGuest = (loadedMember.comp_balance && typeof loadedMember.comp_balance === 'object')
        ? (parseInt(loadedMember.comp_balance.guest, 10) || 0) : 0;
      loadedMember.comp_balance = { massages: cb.massages, hammams: cb.hammams, foot: cb.foot, guest: prevGuest };
      loadedMember.balance = formatBalance(cb);   // keep the legacy text in step
      loadedMember.servicesUsed = (parseInt(loadedMember.servicesUsed ?? loadedMember.services_used, 10) || 0) + 1;
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
    resetService();
    timeIn.value = '14:00';
    discType.value = '';
    discValue.value = '';
    paidSel.value = '0';
    memberCard.classList.remove('active');
    loadedMember = null;
    if (prepaidWrap) prepaidWrap.hidden = true;
    if (prepaidChk) prepaidChk.checked = false;
    if (memStatus) memStatus.textContent = 'Booking for someone else? Find the member for the rate, then edit the guest name above.';
    setTimeout(recalc, 100);
  }
});

document.getElementById('admin-logout')?.addEventListener('click', e => {
  e.preventDefault();
  if (window.TajAdmin) { TajAdmin.signOut(); return; }
  sessionStorage.removeItem('taj-admin-auth');
  location.href = 'admin-login.html';
});
