/* Taj Al Sukun — Admin Booking Detail (full page) */

if (sessionStorage.getItem('taj-admin-auth') !== '1') {
  location.replace('admin-login.html');
}

const VAT_RATE = 0.10;
const params = new URLSearchParams(location.search);
const bookingId = params.get('id');

let bookings = JSON.parse(localStorage.getItem('taj-bookings') || '[]');
const booking = bookings.find(b => b.id === bookingId);

if (!booking) {
  document.querySelector('.admin-content').innerHTML = `
    <div style="text-align:center; padding: 80px 30px;">
      <i class="far fa-calendar-times" style="font-size: 60px; color: var(--c-copper); margin-bottom: 20px;"></i>
      <h2 style="font-family: var(--f-display); font-weight: 500; margin-bottom: 10px;">Booking not found</h2>
      <p style="color: var(--c-text-soft); margin-bottom: 30px;">The booking ID <code style="font-family: monospace; color: var(--c-copper);">${bookingId || '(none)'}</code> doesn't exist.</p>
      <a href="admin.html#bookings" class="btn btn--primary"><i class="fas fa-arrow-left"></i> Back to Bookings</a>
    </div>
  `;
  throw new Error('Booking not found');
}

function persist() { localStorage.setItem('taj-bookings', JSON.stringify(bookings)); }

function fmt(n) { return n.toFixed(3) + ' BHD'; }
function fmtFullDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  const dt = new Date(parseInt(y), parseInt(m)-1, parseInt(day));
  return dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}
function fmtShortDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  const dt = new Date(parseInt(y), parseInt(m)-1, parseInt(day));
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtTime(t) {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hh = parseInt(h, 10);
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const display = hh % 12 || 12;
  return `${display}:${m} ${ampm}`;
}
function fmtRelative(iso) {
  if (!iso) return '—';
  const dt = new Date(iso);
  const diff = Date.now() - dt.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return fmtShortDate(iso.split('T')[0]);
}
function getServiceDuration(name) {
  const map = {
    'Royal Hammam': '75 min', 'Casablanca Hammam': '60 min',
    'Argan Oil Ritual': '60 min', 'Argan Oil Massage': '60 min',
    'Hot Stone Therapy': '60 min', 'Hot Stone Massage': '60 min',
    'Aroma Relaxing': '60 min', 'Aroma Relaxing Massage': '60 min',
    'Balinese Massage': '60 min', 'Royal Thai': '60 min',
    'Swedish Massage': '60 min', 'Deep Tissue': '60 min',
    'Deep Tissue Massage': '60 min', 'Reflexology': '30 min',
    'Reflexology Foot Massage': '30 min', 'Foot Relaxing': '30 min',
    'Couples Sanctuary': '60 min', 'Royal Hammam + Massage': '120 min',
    'Royal Hammam + Massage Package': '120 min',
    'Moroccan Bath + Argan Oil Massage': '100 min'
  };
  return map[name] || '60 min';
}
function tierDiscountPct(tier) {
  return ({ Silver: 10, Gold: 15, Platinum: 20 })[tier] || 0;
}
function tierBadge(tier) {
  if (!tier) return '<span style="color: var(--c-text-soft);">Guest (non-member)</span>';
  return `<span class="badge-tier ${tier.toLowerCase()}">${tier}</span>`;
}
function statusLabel(s) {
  return ({ new: 'New', pending: 'Pending', ok: 'Confirmed', done: 'Completed', cancel: 'Cancelled' })[s] || s;
}
function sourceLabel(s) {
  return ({ website: 'Website', phone: 'Phone Booking', 'walk-in': 'Walk-In', admin: 'Admin (Manual)' })[s] || s;
}

function render() {
  const isPaid = booking.paid;

  // Banner
  document.getElementById('crumb-id').textContent = booking.id;
  document.getElementById('bn-id').textContent = booking.id;
  document.getElementById('bn-title').innerHTML = `${booking.name} <em>·</em> ${booking.service}`;
  document.getElementById('bn-date').textContent = fmtFullDate(booking.date);
  document.getElementById('bn-time').textContent = fmtTime(booking.time);
  document.getElementById('bn-therapist').textContent = booking.therapist || 'Auto-assign';

  const stBadge = document.getElementById('bn-status');
  stBadge.className = 'badge-status ' + booking.status;
  stBadge.textContent = statusLabel(booking.status);

  document.getElementById('bn-total').textContent = (booking.invoice && booking.invoice.total) ? booking.invoice.total + ' BHD' : booking.total + ' BHD';
  document.getElementById('bn-paid').textContent = isPaid ? 'Paid' : 'Unpaid';

  // Pipeline (status visualisation)
  // Determine which steps are "done" / "current"
  const stages = ['new', 'pending', 'ok', 'done'];
  const cancelled = booking.status === 'cancel';
  const currentIdx = stages.indexOf(booking.status);

  document.querySelectorAll('.pipeline__step').forEach(step => {
    step.classList.remove('done', 'current');
    const idx = stages.indexOf(step.dataset.step);
    if (cancelled) return; // Pipeline shown as un-progressed when cancelled
    if (idx < currentIdx) step.classList.add('done');
    if (idx === currentIdx) step.classList.add('current');
  });

  // When timestamps (mock — would normally come from history)
  document.getElementById('when-new').textContent = booking.createdAt ? fmtRelative(booking.createdAt) : 'On creation';
  document.getElementById('when-pending').textContent = booking.status === 'pending' || currentIdx > 1 ? 'Reviewed' : '—';
  document.getElementById('when-ok').textContent = booking.confirmedAt ? fmtRelative(booking.confirmedAt) : (currentIdx >= 2 ? 'Confirmed' : '—');
  document.getElementById('when-done').textContent = booking.status === 'done' ? 'Completed' : '—';

  // Guest information
  document.getElementById('g-name').textContent = booking.name;
  document.getElementById('g-phone-link').textContent = booking.phone || '—';
  document.getElementById('g-phone-link').href = 'tel:' + (booking.phone || '').replace(/\s/g, '');
  document.getElementById('g-email').textContent = booking.email || '—';
  document.getElementById('g-tier').innerHTML = tierBadge(booking.tier) + (booking.member_id ? ` <code style="margin-left:8px; font-family: 'Courier New', monospace; color: var(--c-copper); font-weight: 600; font-size: 0.85rem;">${booking.member_id}</code>` : '');

  // Service & schedule
  document.getElementById('s-name').textContent = booking.service;
  document.getElementById('s-duration').textContent = getServiceDuration(booking.service);
  document.getElementById('s-date').textContent = fmtFullDate(booking.date);
  document.getElementById('s-time').textContent = fmtTime(booking.time);
  document.getElementById('s-therapist').textContent = booking.therapist || 'Auto-assign (next available)';
  document.getElementById('s-source').textContent = sourceLabel(booking.source);

  // Reschedule defaults
  document.getElementById('re-date').value = booking.date;
  document.getElementById('re-time').value = booking.time;

  // Notes
  document.getElementById('notes').value = booking.notes || '';

  // Pricing
  const memberDiscPct = tierDiscountPct(booking.tier);
  const unitPrice = memberDiscPct > 0 ? +(booking.total / (1 - memberDiscPct / 100)).toFixed(3) : booking.total;
  const subtotal = unitPrice;
  const memberDisc = memberDiscPct > 0 ? +(subtotal * memberDiscPct / 100).toFixed(3) : 0;
  const ed = (booking.invoice && booking.invoice.extraDiscount) || { type: null, value: 0 };
  let extraDisc = 0;
  if (ed.type === 'percent' && ed.value > 0) extraDisc = +((subtotal - memberDisc) * ed.value / 100).toFixed(3);
  else if (ed.type === 'fixed' && ed.value > 0) extraDisc = +Math.min(ed.value, subtotal - memberDisc).toFixed(3);
  const beforeTax = subtotal - memberDisc - extraDisc;
  const tax = +(beforeTax * VAT_RATE).toFixed(3);
  const total = +(beforeTax + tax).toFixed(3);

  document.getElementById('ps-subtotal').textContent = fmt(subtotal);
  if (memberDisc > 0) {
    document.getElementById('ps-mdisc-row').style.display = '';
    document.getElementById('ps-mdisc-label').textContent = `${booking.tier} (${memberDiscPct}%)`;
    document.getElementById('ps-mdisc').textContent = '−' + fmt(memberDisc);
  } else document.getElementById('ps-mdisc-row').style.display = 'none';
  if (extraDisc > 0) {
    document.getElementById('ps-edisc-row').style.display = '';
    document.getElementById('ps-edisc-label').textContent = (ed.reason || 'Discount') + (ed.type === 'percent' ? ` (${ed.value}%)` : '');
    document.getElementById('ps-edisc').textContent = '−' + fmt(extraDisc);
  } else document.getElementById('ps-edisc-row').style.display = 'none';
  document.getElementById('ps-tax').textContent = fmt(tax);
  document.getElementById('ps-total').textContent = fmt(total);

  if (isPaid) {
    document.getElementById('ps-paid').style.display = '';
    document.getElementById('ps-paid-when').textContent = booking.paidAt ? fmtRelative(booking.paidAt) : 'recently';
  } else {
    document.getElementById('ps-paid').style.display = 'none';
  }

  // Invoice link
  document.getElementById('open-invoice').href = 'admin-invoice.html?id=' + encodeURIComponent(booking.id);
  document.getElementById('open-invoice').innerHTML = isPaid
    ? '<i class="fas fa-receipt"></i> View Receipt'
    : '<i class="fas fa-file-invoice"></i> View Invoice';

  // Communication
  const phone = (booking.phone || '').replace(/\D/g, '');
  document.getElementById('ac-call').href = 'tel:' + phone;
  document.getElementById('ac-email').href = 'mailto:' + (booking.email || '');
  const waBase = `https://wa.me/${phone}?text=`;
  const waText = encodeURIComponent(`Hello ${booking.name}, this is Taj Al Sukun Spa regarding your booking ${booking.id} on ${fmtFullDate(booking.date)} at ${fmtTime(booking.time)}.`);
  document.getElementById('ac-wa').href = waBase + waText;
  const reminderText = encodeURIComponent(`Hello ${booking.name}, just a friendly reminder of your appointment for ${booking.service} on ${fmtFullDate(booking.date)} at ${fmtTime(booking.time)}. We look forward to welcoming you. — Taj Al Sukun Spa`);
  document.getElementById('ac-reminder').href = waBase + reminderText;

  // Metadata
  document.getElementById('md-id').textContent = booking.id;
  document.getElementById('md-source').textContent = sourceLabel(booking.source);
  document.getElementById('md-created').textContent = booking.createdAt ? fmtRelative(booking.createdAt) : 'Earlier';
  document.getElementById('md-payment').textContent = booking.payment_method || '—';

  // Activity timeline
  renderTimeline();
}

function renderTimeline() {
  const tl = document.getElementById('timeline');
  if (!tl) return;
  const events = [];

  if (booking.createdAt) {
    events.push({ icon: 'fa-plus-circle', cls: 'book', title: 'Booking created', desc: `via ${sourceLabel(booking.source)}`, when: booking.createdAt });
  } else {
    events.push({ icon: 'fa-plus-circle', cls: 'book', title: 'Booking created', desc: `via ${sourceLabel(booking.source)}`, when: 'Earlier' });
  }
  if (booking.confirmedAt) {
    events.push({ icon: 'fa-check', cls: 'confirm', title: 'Booking confirmed', desc: 'by Admin', when: booking.confirmedAt });
  }
  if (booking.rescheduled) {
    events.push({ icon: 'fa-calendar-alt', cls: 'note', title: 'Rescheduled', desc: booking.rescheduled, when: booking.rescheduledAt || 'Earlier' });
  }
  if (booking.paid) {
    events.push({ icon: 'fa-check-circle', cls: 'payment', title: `Payment received — ${booking.payment_method || 'Cash'}`, desc: `Receipt issued`, when: booking.paidAt || 'Recently' });
  }
  if (booking.status === 'cancel') {
    events.push({ icon: 'fa-times', cls: 'cancel', title: 'Booking cancelled', desc: '', when: booking.cancelledAt || 'Earlier' });
  }
  if (booking.status === 'done') {
    events.push({ icon: 'fa-check-double', cls: 'confirm', title: 'Service completed', desc: 'Marked done by Admin', when: 'After visit' });
  }

  tl.innerHTML = events.reverse().map(e => `
    <li>
      <div class="timeline__dot ${e.cls}"><i class="fas ${e.icon}"></i></div>
      <div class="timeline__body">
        <strong>${e.title}</strong>
        ${e.desc ? `<p>${e.desc}</p>` : ''}
        <span class="timeline__time">${typeof e.when === 'string' && !e.when.includes('T') ? e.when : fmtRelative(e.when)}</span>
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

/* ---------- Status changes ---------- */
document.querySelectorAll('[data-set]').forEach(b => {
  b.addEventListener('click', () => {
    const newStatus = b.dataset.set;
    if (newStatus === 'cancel' && !confirm('Cancel this booking? This can be reverted.')) return;
    booking.status = newStatus;
    if (newStatus === 'ok' && !booking.confirmedAt) booking.confirmedAt = new Date().toISOString();
    if (newStatus === 'cancel') booking.cancelledAt = new Date().toISOString();
    persist();

    if (window.TajLog) {
      const titles = { ok: 'Booking confirmed', done: 'Booking completed', cancel: 'Cancellation', pending: 'Booking pending review' };
      TajLog.add({
        type: newStatus === 'cancel' ? 'cancel' : (newStatus === 'ok' ? 'confirm' : 'booking'),
        title: `${titles[newStatus]}: ${booking.name}`,
        desc: `${booking.service} · ${booking.id}`,
        ref: booking.id,
        refType: 'booking'
      });
    }

    render();
    showToast('Status updated to ' + statusLabel(newStatus));
  });
});

/* ---------- Reschedule ---------- */
document.getElementById('reschedule-btn')?.addEventListener('click', () => {
  document.getElementById('reschedule-form').classList.toggle('open');
});
document.getElementById('re-cancel')?.addEventListener('click', () => {
  document.getElementById('reschedule-form').classList.remove('open');
});
document.getElementById('re-save')?.addEventListener('click', () => {
  const newDate = document.getElementById('re-date').value;
  const newTime = document.getElementById('re-time').value;
  if (!newDate || !newTime) { alert('Please pick a date and time.'); return; }
  booking.rescheduled = `From ${fmtShortDate(booking.date)} ${fmtTime(booking.time)} → ${fmtShortDate(newDate)} ${fmtTime(newTime)}`;
  booking.rescheduledAt = new Date().toISOString();
  booking.date = newDate;
  booking.time = newTime;
  persist();
  document.getElementById('reschedule-form').classList.remove('open');
  render();
  showToast('Booking rescheduled');
});

/* ---------- Save notes ---------- */
document.getElementById('save-notes')?.addEventListener('click', () => {
  booking.notes = document.getElementById('notes').value;
  persist();
  showToast('Notes saved');
});

/* ---------- Delete ---------- */
document.getElementById('delete-bk')?.addEventListener('click', () => {
  if (!confirm('Delete this booking permanently? This cannot be undone.')) return;
  bookings = bookings.filter(b => b.id !== booking.id);
  localStorage.setItem('taj-bookings', JSON.stringify(bookings));
  location.href = 'admin.html#bookings';
});

/* ---------- Sign out ---------- */
document.getElementById('admin-logout')?.addEventListener('click', e => {
  e.preventDefault();
  if (window.TajAdmin) { TajAdmin.signOut(); return; }
  sessionStorage.removeItem('taj-admin-auth');
  location.href = 'admin-login.html';
});

render();
