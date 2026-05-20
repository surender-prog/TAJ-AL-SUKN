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

// Populate service dropdown from taj-services
(function fillServices() {
  if (!serviceSel) return;
  let list = [];
  try { list = JSON.parse(localStorage.getItem('taj-services') || '[]') || []; }
  catch (_) {}
  const visible = list
    .filter(s => s && s.status === 'active' && s.show_in_booking !== false)
    .sort((a, b) => (a.sort || 0) - (b.sort || 0) || (a.name || '').localeCompare(b.name || ''));
  if (!visible.length) return; // keep static fallback
  serviceSel.innerHTML = visible.map((s, i) => {
    // Use the starting price + first duration
    const dur = (s.duration || '60 min').split('/')[0].trim();
    const tag = s.tag ? ' · ' + s.tag : '';
    return `<option value="${(s.name || '').replace(/"/g,'&quot;')}|${s.price}|${dur}"${i === 0 ? ' selected' : ''}>${(s.name || '')} — ${s.price} BHD (${dur}${tag})</option>`;
  }).join('');
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
  const mDisc = +(svcPrice * mDiscPct / 100).toFixed(3);

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

  const beforeTax = svcPrice - mDisc - eDisc;
  const tax = +(beforeTax * VAT_RATE).toFixed(3);
  const total = +(beforeTax + tax).toFixed(3);

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
        <small>${isMember && mDiscPct > 0 ? tierSel.value + ' member rate' : 'Standard rate'}</small>
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
    document.getElementById('pv-mdisc-label').textContent = `${tierSel.value} Discount (${mDiscPct}%)`;
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

recalc();

/* ---------- Save booking + invoice ---------- */
async function saveBooking() {
  if (!form.checkValidity()) { form.reportValidity(); return null; }

  const [svcName, svcPriceStr] = serviceSel.value.split('|');
  const svcPrice = parseFloat(svcPriceStr);
  const isMember = memberCard.classList.contains('active');
  const tierOpt = tierSel.options[tierSel.selectedIndex];
  const mDiscPct = (isMember && tierOpt && tierOpt.dataset.discount) ? parseInt(tierOpt.dataset.discount, 10) : 0;
  const mDisc = +(svcPrice * mDiscPct / 100).toFixed(3);

  const extraType = discType.value;
  const extraValue = parseFloat(discValue.value || 0);
  let eDisc = 0;
  if (extraType === 'percent' && extraValue > 0) eDisc = +((svcPrice - mDisc) * extraValue / 100).toFixed(3);
  else if (extraType === 'fixed' && extraValue > 0) eDisc = +Math.min(extraValue, svcPrice - mDisc).toFixed(3);

  const beforeTax = svcPrice - mDisc - eDisc;
  const tax = +(beforeTax * VAT_RATE).toFixed(3);
  const total = +(beforeTax + tax).toFixed(3);

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
    notes: form.elements.notes.value,
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
    serviceSel.selectedIndex = 0;
    timeIn.value = '14:00';
    discType.value = '';
    discValue.value = '';
    paidSel.value = '0';
    memberCard.classList.remove('active');
    setTimeout(recalc, 100);
  }
});

document.getElementById('admin-logout')?.addEventListener('click', e => {
  e.preventDefault();
  sessionStorage.removeItem('taj-admin-auth');
  location.href = 'admin-login.html';
});
