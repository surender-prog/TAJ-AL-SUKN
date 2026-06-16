/* Taj Al Sukun — Admin Console */

/* ---------- Auth check ---------- */
if (sessionStorage.getItem('taj-admin-auth') !== '1') {
  location.replace('admin-login.html');
}

/* ---------- Today's date ---------- */
(function () {
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const el = document.getElementById('today-date');
  if (el) el.textContent = new Date().toLocaleDateString('en-US', opts);
})();

/* ---------- Sample data + localStorage merge ---------- */
const SEED_BOOKINGS = [
  { id: 'BK-2026-0089', name: 'Olivia T.', phone: '+973 39554421', service: 'Casablanca Hammam', tier: null, total: 25, date: '2026-05-10', time: '15:30', status: 'new', source: 'website' },
  { id: 'BK-2026-0088', name: 'Ahmed B.', phone: '+973 38331190', service: 'Royal Hammam + Massage', tier: null, total: 50, date: '2026-05-10', time: '19:00', status: 'ok', source: 'phone' },
  { id: 'BK-2026-0087', name: 'Noura S.', phone: '+973 34116677', service: 'Hot Stone Therapy', tier: 'Gold', total: 29.75, date: '2026-05-10', time: '17:00', status: 'ok', source: 'website' },
  { id: 'BK-2026-0086', name: 'Sarah R.', phone: '+973 37228893', service: 'Argan Oil Ritual', tier: null, total: 40, date: '2026-05-10', time: '13:00', status: 'pending', source: 'website' },
  { id: 'BK-2026-0085', name: 'Mohammed K.', phone: '+973 36115582', service: 'Deep Tissue', tier: 'Platinum', total: 24, date: '2026-05-10', time: '11:30', status: 'ok', source: 'walk-in' },
  { id: 'BK-2026-0084', name: 'Fatima A.', phone: '+973 35001234', service: 'Royal Hammam', tier: 'Gold', total: 38.25, date: '2026-05-10', time: '10:00', status: 'ok', source: 'website' },
  { id: 'BK-2026-0083', name: 'Layla M.', phone: '+973 33129877', service: 'Aroma Relaxing', tier: null, total: 35, date: '2026-05-11', time: '11:00', status: 'cancel', source: 'website' },
  { id: 'BK-2026-0082', name: 'Khalid A.', phone: '+973 39988701', service: 'Royal Hammam', tier: 'Silver', total: 40.5, date: '2026-05-09', time: '16:00', status: 'done', source: 'website' },
  { id: 'BK-2026-0081', name: 'Mariam H.', phone: '+973 36540099', service: 'Balinese Massage', tier: null, total: 35, date: '2026-05-09', time: '14:30', status: 'done', source: 'phone' },
  { id: 'BK-2026-0080', name: 'Rashid Q.', phone: '+973 38554421', service: 'Reflexology', tier: null, total: 15, date: '2026-05-09', time: '12:00', status: 'done', source: 'walk-in' },
  { id: 'BK-2026-0079', name: 'Ayesha M.', phone: '+973 33772290', service: 'Swedish Massage', tier: 'Gold', total: 21.25, date: '2026-05-08', time: '18:00', status: 'done', source: 'website' },
  { id: 'BK-2026-0078', name: 'Jameel O.', phone: '+973 34119922', service: 'Couples Sanctuary', tier: null, total: 75, date: '2026-05-12', time: '17:00', status: 'ok', source: 'phone' },
];

const SEED_MEMBERS = [
  { id: 'TAS-2025-0047', name: 'Fatima Ali',     phone: '+973 35001234', email: 'fatima@example.com',  tier: 'Gold',     joined: '2025-03-12', renews: '2026-03-12', balance: '4 massages · 1 hammam' },
  { id: 'TAS-2025-0046', name: 'Mohammed Khalid', phone: '+973 36115582', email: 'mk@example.com',      tier: 'Platinum', joined: '2025-02-08', renews: '2026-02-08', balance: '∞ massages · 8 hammams' },
  { id: 'TAS-2025-0045', name: 'Noura Saleh',    phone: '+973 34116677', email: 'noura@example.com',   tier: 'Gold',     joined: '2025-01-22', renews: '2026-01-22', balance: '5 massages · 1 hammam' },
  { id: 'TAS-2025-0044', name: 'Khalid Ahmed',   phone: '+973 39988701', email: 'khalid@example.com',  tier: 'Silver',   joined: '2025-04-04', renews: '2026-04-04', balance: '1 massage · 1 foot ritual' },
  { id: 'TAS-2025-0043', name: 'Ayesha Mansour', phone: '+973 33772290', email: 'ayesha@example.com',  tier: 'Gold',     joined: '2025-05-15', renews: '2026-05-15', balance: '4 massages · 0 hammams' },
  { id: 'TAS-2025-0042', name: 'Mariam Hadi',    phone: '+973 36540099', email: 'mariam@example.com',  tier: 'Gold',     joined: '2025-05-09', renews: '2026-05-09', balance: '6 massages · 1 hammam' },
  { id: 'TAS-2024-0041', name: 'Sara Abdullah',  phone: '+973 36234411', email: 'sara@example.com',    tier: 'Platinum', joined: '2024-12-01', renews: '2025-12-01', balance: '∞ massages · 11 hammams' },
  { id: 'TAS-2025-0040', name: 'Layla Maktoum',  phone: '+973 33129877', email: 'layla@example.com',   tier: 'Silver',   joined: '2025-06-18', renews: '2026-06-18', balance: '2 massages' },
  { id: 'TAS-2024-0039', name: 'Hassan Yousef',  phone: '+973 35112299', email: 'hassan@example.com',  tier: 'Gold',     joined: '2024-11-22', renews: '2025-11-22', balance: '3 massages · 0 hammams' },
  { id: 'TAS-2025-0038', name: 'Reem Saud',      phone: '+973 38664422', email: 'reem@example.com',    tier: 'Silver',   joined: '2025-07-04', renews: '2026-07-04', balance: '2 massages · 1 foot ritual' },
];

let bookings = JSON.parse(localStorage.getItem('taj-bookings') || 'null') || SEED_BOOKINGS;
let members  = JSON.parse(localStorage.getItem('taj-members')  || 'null') || SEED_MEMBERS;

function persist() {
  localStorage.setItem('taj-bookings', JSON.stringify(bookings));
  localStorage.setItem('taj-members', JSON.stringify(members));
}

/* ---------- Tab switching ---------- */
const tabs = document.querySelectorAll('.admin-side__nav a[data-tab], a[data-tab]');
const panels = document.querySelectorAll('.admin-tab');
function activateTab(t) {
  if (!t) return;
  document.querySelectorAll('.admin-side__nav a').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.admin-side__nav a[data-tab="' + t + '"]').forEach(x => x.classList.add('active'));
  panels.forEach(p => p.classList.toggle('active', p.id === 'tab-' + t));
}
tabs.forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    activateTab(a.dataset.tab);
    window.scrollTo(0, 0);
  });
});
// Allow ?tab=… and #… to deep-link a tab (used for approval PDFs and shareable links)
(function deepLinkTab() {
  const qp = new URLSearchParams(location.search);
  const t = qp.get('tab') || (location.hash || '').replace(/^#/, '');
  if (t) activateTab(t);
})();

/* ---------- Render bookings table ---------- */
function statusLabel(s) {
  return ({
    new: 'New', pending: 'Pending', ok: 'Confirmed',
    done: 'Completed', cancel: 'Cancelled'
  })[s] || s;
}
function tierBadge(tier) {
  if (!tier) return '<small style="color:var(--c-text-soft); font-size:0.78rem;">Guest</small>';
  return '<span class="badge-tier ' + tier.toLowerCase() + '">' + tier + '</span>';
}
function fmtDate(d) {
  if (!d || typeof d !== 'string') return '—';
  const [y, m, day] = d.split('-');
  if (!y || !m || !day) return '—';
  const dt = new Date(parseInt(y), parseInt(m)-1, parseInt(day));
  if (isNaN(dt)) return '—';
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
// Member date fields differ by source: legacy demo uses joined/renews,
// Supabase-backed records use startDate/endDate (and raw start_date/end_date).
function mJoined(m) { return (m && (m.joined || m.startDate || m.start_date)) || ''; }
function mRenews(m) { return (m && (m.renews || m.endDate   || m.end_date))   || ''; }
function fmtDateYear(d) {
  const base = fmtDate(d);
  const yr = (typeof d === 'string' && d.length >= 4) ? d.substring(0, 4) : '';
  return (base !== '—' && yr) ? base + ', ' + yr : base;
}
function initials(name) {
  return name.trim().split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

let bookingFilter = 'all';
let whenFilter = 'all';
let sourceFilter = 'all';
let memberFilterB = 'all';
let selectedIds = new Set();

/* ---------- Date helpers for filtering / grouping ---------- */
function todayISO() {
  const t = new Date();
  t.setHours(0,0,0,0);
  return t.toISOString().split('T')[0];
}
function plusDays(iso, n) {
  const [y,m,d] = iso.split('-').map(Number);
  const dt = new Date(y, m-1, d);
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().split('T')[0];
}
function inWeek(iso) {
  const today = new Date(); today.setHours(0,0,0,0);
  const dow = today.getDay();
  const start = new Date(today); start.setDate(today.getDate() - dow);
  const end   = new Date(start); end.setDate(start.getDate() + 6);
  const dt = new Date(iso + 'T00:00:00');
  return dt >= start && dt <= end;
}
function inMonth(iso) {
  const today = new Date();
  return iso.startsWith(today.toISOString().substring(0, 7));
}
function dateGroupOf(iso) {
  const today = todayISO();
  const tomorrow = plusDays(today, 1);
  if (iso === today) return { key: 'today', label: 'Today' };
  if (iso === tomorrow) return { key: 'tomorrow', label: 'Tomorrow' };
  if (iso > tomorrow && inWeek(iso)) return { key: 'week', label: 'Later This Week' };
  if (iso < today) return { key: 'past', label: 'Past Bookings' };
  return { key: 'upcoming', label: 'Upcoming' };
}

function sourceBadge(src) {
  return `<span class="badge-source ${src}">${src}</span>`;
}

function applyFilters(b, q) {
  // Status
  if (bookingFilter !== 'all' && b.status !== bookingFilter) return false;
  // When
  if (whenFilter === 'today'    && b.date !== todayISO()) return false;
  if (whenFilter === 'tomorrow' && b.date !== plusDays(todayISO(), 1)) return false;
  if (whenFilter === 'week'     && !inWeek(b.date)) return false;
  if (whenFilter === 'month'    && !inMonth(b.date)) return false;
  if (whenFilter === 'past'     && b.date >= todayISO()) return false;
  // Source
  if (sourceFilter !== 'all' && b.source !== sourceFilter) return false;
  // Member
  if (memberFilterB === 'member' && !b.tier) return false;
  if (memberFilterB === 'guest'  && b.tier) return false;
  if (['Silver','Gold','Platinum'].includes(memberFilterB) && b.tier !== memberFilterB) return false;
  // Search
  if (q && !(b.name + b.service + b.id + b.phone).toLowerCase().includes(q)) return false;
  return true;
}

function renderBookings() {
  const tbody = document.getElementById('bookings-body');
  if (!tbody) return;
  const q = (document.getElementById('admin-search')?.value || '').toLowerCase();

  const rows = bookings.filter(b => applyFilters(b, q));

  // Group by date bucket
  const groups = { today: [], tomorrow: [], week: [], upcoming: [], past: [] };
  rows.forEach(b => {
    const g = dateGroupOf(b.date);
    groups[g.key].push(b);
  });
  const order = [
    { key: 'today',    label: 'Today' },
    { key: 'tomorrow', label: 'Tomorrow' },
    { key: 'week',     label: 'Later This Week' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past',     label: 'Past Bookings' }
  ];

  // Empty state
  if (rows.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="9" style="padding: 0;">
        <div class="empty-state">
          <i class="far fa-calendar-times"></i>
          <h3>No bookings match these filters.</h3>
          <p>Adjust the filters above, or create a new booking from scratch.</p>
          <a href="admin-new-booking.html" class="btn btn--primary"><i class="fas fa-plus"></i> New Booking</a>
        </div>
      </td></tr>
    `;
  } else {
    let html = '';
    order.forEach(g => {
      const items = groups[g.key];
      if (!items.length) return;
      const revenue = items.reduce((s, b) => s + (b.total || 0), 0);
      html += `<tr class="date-group"><td colspan="9">
        <i class="far fa-calendar-alt" style="color:var(--c-copper); margin-right:10px;"></i>${g.label}
        <span class="count">· ${items.length} ${items.length === 1 ? 'booking' : 'bookings'}</span>
        <span class="rev">${revenue.toFixed(items.length && revenue % 1 ? 2 : 0)} BHD</span>
      </td></tr>`;
      html += items.map(b => `
        <tr data-id="${b.id}" class="${selectedIds.has(b.id) ? 'selected' : ''}">
          <td class="cb"><input type="checkbox" class="row-cb" ${selectedIds.has(b.id) ? 'checked' : ''}></td>
          <td><strong>${fmtDate(b.date)}</strong><br><small style="color:var(--c-text-soft);">${b.time}</small></td>
          <td><div class="cell-name"><div class="av">${initials(b.name)}</div><div><strong>${b.name}</strong><small>${b.phone}</small></div></div></td>
          <td>${b.service}</td>
          <td>${tierBadge(b.tier)}</td>
          <td>${sourceBadge(b.source)}</td>
          <td><strong style="color:var(--c-deep);">${b.total ?? 0} BHD</strong>${b.paid ? '<br><small style="color:#2a8a4a; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; font-size:0.66rem;">✓ Paid</small>' : ''}</td>
          <td><span class="badge-status ${b.status}">${statusLabel(b.status)}</span></td>
          <td class="cell-actions">
            <a class="icon-btn view-bk" title="View Details"><i class="fas fa-eye"></i></a>
            <a class="icon-btn invoice-bk" title="Invoice / Receipt" style="color: var(--c-copper);"><i class="fas fa-file-invoice"></i></a>
            <a class="icon-btn confirm-bk" title="Confirm"><i class="fas fa-check"></i></a>
            <a class="icon-btn danger cancel-bk" title="Cancel booking"><i class="fas fa-times"></i></a>
            <a class="icon-btn danger delete-bk" title="Delete permanently"><i class="fas fa-trash"></i></a>
          </td>
        </tr>
      `).join('');
    });
    tbody.innerHTML = html;
  }

  // Update stat row
  updateBookingStats();

  // Update filter chip counts
  ['all','new','pending','ok','done','cancel'].forEach(s => {
    const el = document.getElementById('cnt-' + s);
    if (!el) return;
    el.textContent = s === 'all' ? bookings.length : bookings.filter(b => b.status === s).length;
  });

  document.getElementById('badge-bookings').textContent = bookings.filter(b => b.status === 'new' || b.status === 'pending').length;

  // Update bulk bar
  updateBulkBar();

  // Wire actions
  tbody.querySelectorAll('.view-bk').forEach(b => b.addEventListener('click', e => {
    const id = e.target.closest('tr').dataset.id;
    location.href = 'admin-booking.html?id=' + encodeURIComponent(id);
  }));
  tbody.querySelectorAll('.invoice-bk').forEach(b => b.addEventListener('click', e => {
    const id = e.target.closest('tr').dataset.id;
    location.href = 'admin-invoice.html?id=' + encodeURIComponent(id);
  }));
  tbody.querySelectorAll('.confirm-bk').forEach(b => b.addEventListener('click', e => {
    const id = e.target.closest('tr').dataset.id;
    const bk = bookings.find(x => x.id === id);
    if (bk) {
      bk.status = 'ok';
      persist();
      if (window.TajLog) {
        TajLog.add({ type: 'confirm', title: `Booking confirmed: ${bk.name}`, desc: `${bk.service} · ${TajFmt.date(bk.date)} ${TajFmt.time(bk.time)}`, ref: bk.id, refType: 'booking' });
        if (typeof renderBell === 'function') renderBell();
      }
      renderBookings();
    }
  }));
  tbody.querySelectorAll('.cancel-bk').forEach(b => b.addEventListener('click', e => {
    const id = e.target.closest('tr').dataset.id;
    if (!confirm('Cancel this booking?')) return;
    const bk = bookings.find(x => x.id === id);
    if (bk) {
      bk.status = 'cancel';
      persist();
      if (window.TajLog) {
        TajLog.add({ type: 'cancel', title: `Cancellation: ${bk.name}`, desc: `${bk.service} · ${TajFmt.date(bk.date)} ${TajFmt.time(bk.time)}`, ref: bk.id, refType: 'booking' });
        if (typeof renderBell === 'function') renderBell();
      }
      renderBookings();
    }
  }));
  tbody.querySelectorAll('.delete-bk').forEach(b => b.addEventListener('click', async e => {
    const id = e.target.closest('tr').dataset.id;
    const bk = bookings.find(x => x.id === id);
    if (!confirm(`Permanently delete this booking${bk ? ' for ' + bk.name : ''}? This removes it for good and cannot be undone.`)) return;
    const btn = e.target.closest('.delete-bk');
    if (btn) { btn.style.pointerEvents = 'none'; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; }
    // Remove from the data layer (Supabase + localStorage mirror), then from
    // this view's in-memory list.
    try { if (window.TajData && TajData.bookings && TajData.bookings.remove) await TajData.bookings.remove(id); }
    catch (err) { console.warn('[booking delete]', err); }
    const idx = bookings.findIndex(x => x.id === id);
    if (idx >= 0) bookings.splice(idx, 1);
    persist();
    if (window.TajLog) {
      TajLog.add({ type: 'cancel', title: `Booking deleted: ${bk ? bk.name : id}`, desc: bk ? `${bk.service} · ${TajFmt.date(bk.date)} ${TajFmt.time(bk.time)}` : '', ref: id, refType: 'booking' });
      if (typeof renderBell === 'function') renderBell();
    }
    renderBookings();
  }));
}

/* ---------- INVOICE / RECEIPT ---------- */
const VAT_RATE = 0.10;
let currentInvoiceId = null;

function getServiceDuration(name) {
  const map = {
    'Royal Hammam': '75 min',
    'Casablanca Hammam': '60 min',
    'Argan Oil Ritual': '60 min',
    'Argan Oil Massage': '60 min',
    'Hot Stone Therapy': '60 min',
    'Hot Stone Massage': '60 min',
    'Aroma Relaxing': '60 min',
    'Aroma Relaxing Massage': '60 min',
    'Balinese Massage': '60 min',
    'Royal Thai': '60 min',
    'Swedish Massage': '60 min',
    'Deep Tissue': '60 min',
    'Deep Tissue Massage': '60 min',
    'Reflexology': '30 min',
    'Reflexology Foot Massage': '30 min',
    'Couples Sanctuary': '60 min',
    'Royal Hammam + Massage': '120 min',
    'Royal Hammam + Massage Package': '120 min'
  };
  return map[name] || '60 min';
}

function tierDiscountPct(tier) {
  return ({ Silver: 10, Gold: 15, Platinum: 20 })[tier] || 0;
}

function fmtMoney(n) {
  return n.toFixed(3) + ' BHD';
}

function fmtFullDate(d) {
  const [y, m, day] = d.split('-');
  const dt = new Date(parseInt(y), parseInt(m)-1, parseInt(day));
  return dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function showInvoiceModal(bookingId) {
  const b = bookings.find(x => x.id === bookingId);
  if (!b) return;

  currentInvoiceId = bookingId;

  // Initialize invoice data on booking if not present
  if (!b.invoice) {
    b.invoice = {
      number: 'INV-' + b.id.replace('BK-', ''),
      issued: new Date().toISOString().split('T')[0],
      extraDiscount: { type: null, value: 0, reason: null }
    };
  }

  renderInvoice(b);
  document.getElementById('invoice-modal').classList.add('open');
}

function renderInvoice(b) {
  const isPaid = b.paid;
  const isReceipt = isPaid;

  // Service unit price (before any discount)
  const memberDiscPct = tierDiscountPct(b.tier);
  // Reverse-calculate the base price from the booking total (which already includes member disc)
  const unitPrice = memberDiscPct > 0 ? +(b.total / (1 - memberDiscPct / 100)).toFixed(3) : b.total;

  // Subtotal (before any discount, before VAT)
  const subtotal = unitPrice;

  // Member discount (applied automatically based on tier)
  const memberDisc = memberDiscPct > 0 ? +(subtotal * memberDiscPct / 100).toFixed(3) : 0;

  // Extra discount (manager applied)
  const ed = b.invoice.extraDiscount;
  let extraDisc = 0;
  if (ed.type === 'percent' && ed.value > 0) {
    extraDisc = +((subtotal - memberDisc) * ed.value / 100).toFixed(3);
  } else if (ed.type === 'fixed' && ed.value > 0) {
    extraDisc = +Math.min(ed.value, subtotal - memberDisc).toFixed(3);
  }

  const beforeTax = subtotal - memberDisc - extraDisc;
  const tax = +(beforeTax * VAT_RATE).toFixed(3);
  const total = +(beforeTax + tax).toFixed(3);

  // Save calculated total back to booking
  b.invoice.total = total;
  persist();

  // Document type / number / status
  document.getElementById('inv-type').textContent = isReceipt ? 'Receipt' : 'Invoice';
  document.getElementById('inv-no').textContent = isReceipt
    ? b.invoice.number.replace('INV-', 'RCP-')
    : b.invoice.number;
  document.getElementById('inv-date').textContent = 'Issued ' + fmtFullDate(b.invoice.issued);

  const statusBadge = document.getElementById('inv-status-badge');
  statusBadge.className = 'inv-status ' + (isPaid ? 'paid' : 'unpaid');
  statusBadge.textContent = isPaid ? 'Paid' : 'Unpaid';

  // Bill to
  document.getElementById('inv-guest-name').textContent = b.name;
  document.getElementById('inv-guest-info').innerHTML = (b.phone || '—') + '<br>Booking ' + b.id + ' · ' + fmtFullDate(b.date) + ' · ' + b.time;

  // Line items
  document.getElementById('inv-items').innerHTML = `
    <tr>
      <td>
        <strong>${b.service}</strong>
        <small>${b.tier ? b.tier + ' member rate applied' : 'Standard rate'}</small>
      </td>
      <td>${getServiceDuration(b.service)}</td>
      <td class="r">1</td>
      <td class="r">${fmtMoney(unitPrice)}</td>
      <td class="r"><strong>${fmtMoney(subtotal)}</strong></td>
    </tr>
  `;

  // Totals
  document.getElementById('inv-subtotal').textContent = fmtMoney(subtotal);

  const memberRow = document.getElementById('inv-member-disc-row');
  if (memberDisc > 0) {
    memberRow.style.display = '';
    document.getElementById('inv-member-disc-label').textContent = b.tier + ' Member Discount (' + memberDiscPct + '%)';
    document.getElementById('inv-member-disc').textContent = '−' + fmtMoney(memberDisc);
  } else {
    memberRow.style.display = 'none';
  }

  const extraRow = document.getElementById('inv-extra-disc-row');
  if (extraDisc > 0) {
    extraRow.style.display = '';
    const reason = ed.reason || 'Discount';
    const detail = ed.type === 'percent' ? ' (' + ed.value + '%)' : '';
    document.getElementById('inv-extra-disc-label').textContent = reason + detail;
    document.getElementById('inv-extra-disc').textContent = '−' + fmtMoney(extraDisc);
  } else {
    extraRow.style.display = 'none';
  }

  document.getElementById('inv-tax').textContent = fmtMoney(tax);
  document.getElementById('inv-total').textContent = fmtMoney(total);

  // Mark Paid / Reverse button
  const mpBtn = document.getElementById('mark-paid');
  mpBtn.innerHTML = isPaid
    ? '<i class="fas fa-undo"></i> Mark as Unpaid'
    : '<i class="fas fa-check-circle"></i> Mark as Paid';
  mpBtn.className = isPaid ? 'btn btn--outline' : 'btn btn--gold';

  // WhatsApp / Email links
  const lines = [
    `*${isReceipt ? 'Receipt' : 'Invoice'}* — ${isReceipt ? b.invoice.number.replace('INV-', 'RCP-') : b.invoice.number}`,
    `Service: ${b.service} (${getServiceDuration(b.service)})`,
    `Date: ${fmtFullDate(b.date)} · ${b.time}`,
    '',
    `Subtotal: ${fmtMoney(subtotal)}`,
  ];
  if (memberDisc > 0) lines.push(`${b.tier} Discount (${memberDiscPct}%): −${fmtMoney(memberDisc)}`);
  if (extraDisc > 0) lines.push(`${ed.reason || 'Discount'}: −${fmtMoney(extraDisc)}`);
  lines.push(`VAT (10%): ${fmtMoney(tax)}`);
  lines.push(`*Total ${isPaid ? 'Paid' : 'Due'}: ${fmtMoney(total)}*`);
  lines.push('');
  lines.push('Thank you for choosing Taj Al Sukun.');

  const waMsg = encodeURIComponent(lines.join('\n'));
  const phone = (b.phone || '').replace(/\D/g, '');
  document.getElementById('inv-wa').href = phone ? `https://wa.me/${phone}?text=${waMsg}` : '#';

  const subject = encodeURIComponent(`${isReceipt ? 'Payment Receipt' : 'Invoice'} from Taj Al Sukun — ${b.invoice.number}`);
  const body = encodeURIComponent(lines.join('\n'));
  document.getElementById('inv-email').href = `mailto:?subject=${subject}&body=${body}`;
}

/* Discount panel toggle */
document.getElementById('inv-discount-head')?.addEventListener('click', () => {
  document.getElementById('inv-discount-panel').classList.toggle('open');
});

/* Apply additional discount */
document.getElementById('apply-discount')?.addEventListener('click', () => {
  if (!currentInvoiceId) return;
  const b = bookings.find(x => x.id === currentInvoiceId);
  if (!b) return;
  const type = document.getElementById('disc-type').value;
  const reason = document.getElementById('disc-reason').value;
  const value = parseFloat(document.getElementById('disc-value').value || 0);
  if (value <= 0) { alert('Enter a discount amount greater than 0.'); return; }
  if (type === 'percent' && value > 100) { alert('Percentage cannot exceed 100.'); return; }
  b.invoice = b.invoice || { number: 'INV-' + b.id.replace('BK-', ''), issued: new Date().toISOString().split('T')[0], extraDiscount: {} };
  b.invoice.extraDiscount = { type, value, reason };
  persist();
  renderInvoice(b);
  document.getElementById('disc-value').value = '';
  document.getElementById('inv-discount-panel').classList.remove('open');
});

/* Mark as paid / unpaid */
document.getElementById('mark-paid')?.addEventListener('click', () => {
  if (!currentInvoiceId) return;
  const b = bookings.find(x => x.id === currentInvoiceId);
  if (!b) return;
  b.paid = !b.paid;
  if (b.paid) {
    b.paidAt = new Date().toISOString();
    if (b.status === 'new' || b.status === 'pending') b.status = 'ok';
  } else {
    delete b.paidAt;
  }
  persist();
  renderInvoice(b);
  renderBookings();
});

function showBookingModal(id) {
  const b = bookings.find(x => x.id === id);
  if (!b) return;
  document.getElementById('bk-title').textContent = 'Booking ' + b.id;
  document.getElementById('bk-body').innerHTML = `
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 22px;">
      <div><small style="color:var(--c-text-soft); letter-spacing:0.18em; font-size:0.7rem; text-transform:uppercase; font-weight:600;">Guest</small><div style="margin-top:4px; font-weight:500;">${b.name}</div></div>
      <div><small style="color:var(--c-text-soft); letter-spacing:0.18em; font-size:0.7rem; text-transform:uppercase; font-weight:600;">Phone</small><div style="margin-top:4px; font-weight:500;">${b.phone}</div></div>
      <div><small style="color:var(--c-text-soft); letter-spacing:0.18em; font-size:0.7rem; text-transform:uppercase; font-weight:600;">Date</small><div style="margin-top:4px; font-weight:500;">${fmtDate(b.date)} · ${b.time}</div></div>
      <div><small style="color:var(--c-text-soft); letter-spacing:0.18em; font-size:0.7rem; text-transform:uppercase; font-weight:600;">Status</small><div style="margin-top:4px;"><span class="badge-status ${b.status}">${statusLabel(b.status)}</span></div></div>
      <div><small style="color:var(--c-text-soft); letter-spacing:0.18em; font-size:0.7rem; text-transform:uppercase; font-weight:600;">Service</small><div style="margin-top:4px; font-weight:500;">${b.service}</div></div>
      <div><small style="color:var(--c-text-soft); letter-spacing:0.18em; font-size:0.7rem; text-transform:uppercase; font-weight:600;">Total</small><div style="margin-top:4px; font-weight:600; color:var(--c-copper); font-size:1.15rem;">${b.total ?? 0} BHD</div></div>
      <div><small style="color:var(--c-text-soft); letter-spacing:0.18em; font-size:0.7rem; text-transform:uppercase; font-weight:600;">Source</small><div style="margin-top:4px; font-weight:500; text-transform:capitalize;">${b.source}</div></div>
      <div><small style="color:var(--c-text-soft); letter-spacing:0.18em; font-size:0.7rem; text-transform:uppercase; font-weight:600;">Member</small><div style="margin-top:4px;">${tierBadge(b.tier)}</div></div>
    </div>
    <div style="display:flex; gap:10px; flex-wrap: wrap;">
      <a href="tel:${b.phone.replace(/\\s/g,'')}" class="btn btn--outline" style="padding:12px 22px; font-size:0.7rem;"><i class="fas fa-phone"></i> Call Guest</a>
      <a href="https://wa.me/${b.phone.replace(/\\D/g,'')}" target="_blank" class="btn btn--whatsapp" style="padding:12px 22px; font-size:0.7rem;"><i class="fab fa-whatsapp"></i> WhatsApp Guest</a>
    </div>
  `;
  document.getElementById('booking-modal').classList.add('open');
}

/* ---------- Render members ---------- */
let memberFilter = 'all';
function renderMembers() {
  const tbody = document.getElementById('members-body');
  if (!tbody) return;
  const q = (document.getElementById('admin-search')?.value || '').toLowerCase();
  const today = new Date();
  const expCutoff = new Date(); expCutoff.setDate(today.getDate() + 60);

  const rows = members.filter(m => {
    if (memberFilter === 'expiring') {
      const r = new Date(mRenews(m));
      if (r > expCutoff || r < today) return false;
    } else if (memberFilter !== 'all' && m.tier !== memberFilter) return false;
    if (q && !(m.name + m.id + m.phone + m.email).toLowerCase().includes(q)) return false;
    return true;
  });

  tbody.innerHTML = rows.map(m => `
    <tr data-id="${m.id}">
      <td><div class="cell-name"><div class="av">${initials(m.name)}</div><div><strong>${m.name}</strong><small>${m.email}</small></div></div></td>
      <td><code style="font-family:'Courier New', monospace; color:var(--c-copper); font-weight:600; font-size:0.85rem;">${m.id}</code></td>
      <td>${tierBadge(m.tier)}</td>
      <td>${fmtDateYear(mJoined(m))}</td>
      <td>${fmtDateYear(mRenews(m))}</td>
      <td><small style="color:var(--c-text-soft);">${m.balance}</small></td>
      <td class="cell-actions">
        <a class="icon-btn view-mb" title="View"><i class="fas fa-eye"></i></a>
        <a class="icon-btn" title="Edit"><i class="fas fa-pen"></i></a>
        <a class="icon-btn danger" title="Remove" data-rm-mb><i class="fas fa-times"></i></a>
      </td>
    </tr>
  `).join('');

  document.getElementById('badge-members').textContent = members.length;

  // Stats
  document.getElementById('stat-silver').textContent = members.filter(m => m.tier === 'Silver').length;
  document.getElementById('stat-gold').textContent = members.filter(m => m.tier === 'Gold').length;
  document.getElementById('stat-platinum').textContent = members.filter(m => m.tier === 'Platinum').length;

  // Wire actions
  tbody.querySelectorAll('.view-mb').forEach(b => b.addEventListener('click', e => {
    const id = e.target.closest('tr').dataset.id;
    location.href = 'admin-member.html?id=' + encodeURIComponent(id);
  }));
  tbody.querySelectorAll('[data-rm-mb]').forEach(b => b.addEventListener('click', e => {
    const id = e.target.closest('tr').dataset.id;
    if (!confirm('Remove this member?')) return;
    members = members.filter(x => x.id !== id);
    persist();
    renderMembers();
  }));
}

function showMemberModal(id) {
  const m = members.find(x => x.id === id);
  if (!m) return;
  document.getElementById('mb-title').textContent = m.name;
  document.getElementById('mb-body').innerHTML = `
    <div style="display:flex; gap: 18px; align-items: center; padding-bottom: 22px; border-bottom: 1px solid var(--c-line); margin-bottom: 22px;">
      <div class="av" style="width:64px; height:64px; border-radius:50%; background: linear-gradient(135deg, var(--c-copper), var(--c-gold)); color:#fff; display:flex; align-items:center; justify-content:center; font-family: var(--f-display); font-size:1.5rem; font-weight:600;">${initials(m.name)}</div>
      <div style="flex:1;">
        <h4 style="font-family:var(--f-display); font-weight:500; margin-bottom: 4px;">${m.name}</h4>
        <code style="font-family:'Courier New', monospace; color:var(--c-copper); font-weight:600; letter-spacing: 0.1em;">${m.id}</code>
      </div>
      ${tierBadge(m.tier)}
    </div>
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 22px;">
      <div><small style="color:var(--c-text-soft); letter-spacing:0.18em; font-size:0.7rem; text-transform:uppercase; font-weight:600;">Phone</small><div style="margin-top:4px;">${m.phone}</div></div>
      <div><small style="color:var(--c-text-soft); letter-spacing:0.18em; font-size:0.7rem; text-transform:uppercase; font-weight:600;">Email</small><div style="margin-top:4px;">${m.email}</div></div>
      <div><small style="color:var(--c-text-soft); letter-spacing:0.18em; font-size:0.7rem; text-transform:uppercase; font-weight:600;">Joined</small><div style="margin-top:4px;">${fmtDateYear(mJoined(m))}</div></div>
      <div><small style="color:var(--c-text-soft); letter-spacing:0.18em; font-size:0.7rem; text-transform:uppercase; font-weight:600;">Renews</small><div style="margin-top:4px;">${fmtDateYear(mRenews(m))}</div></div>
      <div class="full" style="grid-column: 1 / -1;"><small style="color:var(--c-text-soft); letter-spacing:0.18em; font-size:0.7rem; text-transform:uppercase; font-weight:600;">Current Balance</small><div style="margin-top:4px; padding: 14px 18px; background: var(--c-cream); border-radius: var(--r-sm); font-weight: 500;">${m.balance}</div></div>
    </div>
    <div style="display:flex; gap:10px; flex-wrap:wrap;">
      <a href="tel:${m.phone.replace(/\\s/g,'')}" class="btn btn--outline" style="padding:12px 22px; font-size:0.7rem;"><i class="fas fa-phone"></i> Call</a>
      <a href="https://wa.me/${m.phone.replace(/\\D/g,'')}" target="_blank" class="btn btn--whatsapp" style="padding:12px 22px; font-size:0.7rem;"><i class="fab fa-whatsapp"></i> WhatsApp</a>
      <a href="mailto:${m.email}" class="btn btn--outline" style="padding:12px 22px; font-size:0.7rem;"><i class="fas fa-envelope"></i> Email</a>
    </div>
  `;
  document.getElementById('member-modal').classList.add('open');
}

/* ---------- Filter chips ---------- */
document.querySelectorAll('[data-bf]').forEach(c => {
  c.addEventListener('click', () => {
    document.querySelectorAll('[data-bf]').forEach(x => x.classList.remove('active'));
    c.classList.add('active');
    bookingFilter = c.dataset.bf;
    renderBookings();
  });
});

/* ---------- Advanced filters ---------- */
document.getElementById('f-when')?.addEventListener('change', e => {
  whenFilter = e.target.value;
  renderBookings();
});
document.getElementById('f-source')?.addEventListener('change', e => {
  sourceFilter = e.target.value;
  renderBookings();
});
document.getElementById('f-member')?.addEventListener('change', e => {
  memberFilterB = e.target.value;
  renderBookings();
});
document.getElementById('reset-filters')?.addEventListener('click', () => {
  bookingFilter = 'all';
  whenFilter = 'all';
  sourceFilter = 'all';
  memberFilterB = 'all';
  selectedIds.clear();
  document.querySelectorAll('[data-bf]').forEach(x => x.classList.toggle('active', x.dataset.bf === 'all'));
  document.getElementById('f-when').value = 'all';
  document.getElementById('f-source').value = 'all';
  document.getElementById('f-member').value = 'all';
  const search = document.getElementById('admin-search'); if (search) search.value = '';
  renderBookings();
});

/* ---------- Booking stats ---------- */
function updateBookingStats() {
  if (!document.getElementById('bs-today')) return;
  const today = todayISO();
  const todayList = bookings.filter(b => b.date === today && b.status !== 'cancel');
  const weekList  = bookings.filter(b => inWeek(b.date) && b.status !== 'cancel');
  const monthList = bookings.filter(b => inMonth(b.date) && b.status !== 'cancel');
  const pending   = bookings.filter(b => b.status === 'new' || b.status === 'pending').length;
  const sumRev = arr => arr.reduce((s, b) => s + (b.total || 0), 0).toFixed(0);

  document.getElementById('bs-today').textContent = todayList.length;
  document.getElementById('bs-today-rev').textContent = sumRev(todayList) + ' BHD revenue';
  document.getElementById('bs-week').textContent = weekList.length;
  document.getElementById('bs-week-rev').textContent = sumRev(weekList) + ' BHD revenue';
  document.getElementById('bs-month').textContent = monthList.length;
  document.getElementById('bs-month-rev').textContent = sumRev(monthList) + ' BHD revenue';
  document.getElementById('bs-pending').textContent = pending;
  document.getElementById('bs-pending-sub').textContent = pending === 0 ? 'all caught up ✓' : 'need confirmation';
  document.getElementById('bs-pending-sub').className = pending === 0 ? 'sub' : 'sub alert';
}

/* ---------- Multi-select ---------- */
function updateBulkBar() {
  const bar = document.getElementById('bulk-bar');
  if (!bar) return;
  if (selectedIds.size > 0) {
    bar.classList.add('show');
    document.getElementById('bulk-count').textContent = selectedIds.size;
  } else {
    bar.classList.remove('show');
  }
  // Sync header checkbox state
  const all = document.getElementById('cb-all');
  if (all) {
    const visibleRows = document.querySelectorAll('#bookings-body tr[data-id]').length;
    all.checked = visibleRows > 0 && document.querySelectorAll('#bookings-body tr.selected').length === visibleRows;
  }
}

document.getElementById('bookings-body')?.addEventListener('change', e => {
  if (e.target.classList.contains('row-cb')) {
    const tr = e.target.closest('tr');
    const id = tr.dataset.id;
    if (e.target.checked) { selectedIds.add(id); tr.classList.add('selected'); }
    else { selectedIds.delete(id); tr.classList.remove('selected'); }
    updateBulkBar();
  }
});
document.getElementById('cb-all')?.addEventListener('change', e => {
  const rows = document.querySelectorAll('#bookings-body tr[data-id]');
  rows.forEach(tr => {
    const cb = tr.querySelector('.row-cb');
    if (cb) {
      cb.checked = e.target.checked;
      const id = tr.dataset.id;
      if (e.target.checked) { selectedIds.add(id); tr.classList.add('selected'); }
      else { selectedIds.delete(id); tr.classList.remove('selected'); }
    }
  });
  updateBulkBar();
});

/* ---------- Bulk actions ---------- */
document.querySelectorAll('[data-bulk]').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.bulk;
    if (action === 'clear') { selectedIds.clear(); renderBookings(); return; }
    if (action === 'export') { exportBookingsCSV([...selectedIds]); return; }

    const verb = { ok: 'confirm', done: 'mark as completed', cancel: 'cancel' }[action];
    if (!confirm(`Are you sure you want to ${verb} ${selectedIds.size} booking${selectedIds.size === 1 ? '' : 's'}?`)) return;

    bookings.forEach(b => {
      if (selectedIds.has(b.id)) b.status = action;
    });
    persist();
    selectedIds.clear();
    renderBookings();
  });
});

/* ---------- CSV Export ---------- */
function exportBookingsCSV(ids) {
  const list = ids && ids.length
    ? bookings.filter(b => ids.includes(b.id))
    : bookings.filter(b => applyFilters(b, (document.getElementById('admin-search')?.value || '').toLowerCase()));
  if (!list.length) { alert('No bookings to export.'); return; }

  const headers = ['Booking ID','Date','Time','Guest','Phone','Service','Tier','Source','Total (BHD)','Status','Paid'];
  const rows = list.map(b => [
    b.id, b.date, b.time,
    `"${(b.name || '').replace(/"/g, '""')}"`,
    b.phone, `"${b.service}"`, b.tier || 'Guest',
    b.source, b.total, statusLabel(b.status),
    b.paid ? 'Yes' : 'No'
  ].join(','));
  const csv = [headers.join(','), ...rows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `taj-bookings-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
document.getElementById('export-bookings')?.addEventListener('click', () => exportBookingsCSV());
document.querySelectorAll('[data-mf]').forEach(c => {
  c.addEventListener('click', () => {
    document.querySelectorAll('[data-mf]').forEach(x => x.classList.remove('active'));
    c.classList.add('active');
    memberFilter = c.dataset.mf;
    renderMembers();
  });
});

/* ---------- Search ---------- */
document.getElementById('admin-search')?.addEventListener('input', () => {
  renderBookings();
  renderMembers();
});

/* ---------- Modals ---------- */
document.querySelectorAll('[data-close]').forEach(b => {
  b.addEventListener('click', () => {
    document.getElementById(b.dataset.close).classList.remove('open');
  });
});
document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal.open').forEach(m => m.classList.remove('open'));
});

/* ---------- Add booking ---------- */
document.querySelectorAll('[data-add-booking]').forEach(b => {
  b.addEventListener('click', () => document.getElementById('add-booking-modal').classList.add('open'));
});
document.getElementById('add-booking-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const d = new FormData(e.target);
  const svc = d.get('service');
  const price = parseFloat(svc.match(/(\d+)\s*BHD/)?.[1] || 0);
  const newBk = {
    id: 'BK-' + new Date().getFullYear() + '-' + String(bookings.length + 100).padStart(4, '0'),
    name: d.get('name'),
    phone: d.get('phone'),
    service: svc.split(' — ')[0],
    tier: null,
    total: price,
    date: d.get('date'),
    time: d.get('time'),
    status: 'ok',
    source: 'admin'
  };
  bookings.unshift(newBk);
  persist();
  renderBookings();
  e.target.reset();
  document.getElementById('add-booking-modal').classList.remove('open');
});

/* ---------- Add member ---------- */
document.querySelectorAll('[data-add-member]').forEach(b => {
  b.addEventListener('click', () => document.getElementById('add-member-modal').classList.add('open'));
});
document.getElementById('add-member-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const d = new FormData(e.target);
  const today = new Date();
  const renews = new Date(); renews.setFullYear(renews.getFullYear() + 1);
  const fmt = dt => dt.toISOString().split('T')[0];
  const nextNum = String(members.length + 50).padStart(4, '0');
  const tier = d.get('tier');
  const balanceMap = {
    Silver: '2 massages · 1 foot ritual',
    Gold: '6 massages · 1 hammam · 2 foot rituals',
    Platinum: '∞ massages · 12 hammams · 4 hot stone'
  };
  members.unshift({
    id: 'TAS-' + today.getFullYear() + '-' + nextNum,
    name: d.get('name'),
    phone: d.get('phone'),
    email: d.get('email'),
    tier,
    joined: fmt(today),
    renews: fmt(renews),
    balance: balanceMap[tier]
  });
  persist();
  renderMembers();
  e.target.reset();
  document.getElementById('add-member-modal').classList.remove('open');
});

/* ---------- Sign out ---------- */
document.getElementById('admin-logout')?.addEventListener('click', e => {
  e.preventDefault();
  if (window.TajAdmin) { TajAdmin.signOut(); return; }
  sessionStorage.removeItem('taj-admin-auth');
  location.href = 'admin-login.html';
});

/* ============================================================
   SETTINGS PAGE
   ============================================================ */

/* ---------- Therapists master ---------- */
const SEED_THERAPISTS = [
  { id: 'TH-01', name: 'Sofia Brown',     role: 'Spa Director',       specialties: ['Thai', 'Hot Stone', 'Hammam'],  langs: ['EN','AR','TH'], phone: '+973 35001500', status: 'active', exp: '15 yrs' },
  { id: 'TH-02', name: 'Aisha Al-Mansour',role: 'Senior Therapist',   specialties: ['Argan Oil', 'Deep Tissue'],     langs: ['EN','AR'],      phone: '+973 33445566', status: 'active', exp: '8 yrs' },
  { id: 'TH-03', name: 'Maya Suparna',    role: 'Wellness Therapist', specialties: ['Balinese', 'Aromatherapy'],     langs: ['EN','ID'],      phone: '+973 36558899', status: 'active', exp: '6 yrs' },
  { id: 'TH-04', name: 'Rahma Ibrahim',   role: 'Hammam Specialist',  specialties: ['Royal Hammam', 'Body Scrub'],   langs: ['EN','AR','FR'], phone: '+973 38112233', status: 'active', exp: '10 yrs' },
  { id: 'TH-05', name: 'Lina Nakamura',   role: 'Foot Therapist',     specialties: ['Reflexology', 'Foot Relaxing'], langs: ['EN','JP'],      phone: '+973 37885544', status: 'off',    exp: '4 yrs' },
];

const escTh = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));

// DB row (specialty: comma text, langs: array) ↔ UI shape (specialties: array)
function thFromDb(t) {
  const specialties = Array.isArray(t.specialties) ? t.specialties
    : (typeof t.specialty === 'string' && t.specialty ? t.specialty.split(/\s*,\s*/).filter(Boolean) : []);
  const langs = Array.isArray(t.langs) ? t.langs
    : (typeof t.langs === 'string' && t.langs ? t.langs.split(/\s*,\s*/).filter(Boolean) : ['EN']);
  return Object.assign({}, t, {
    role: t.role || 'Therapist', exp: t.exp || '—', phone: t.phone || '—',
    status: t.status === 'off' ? 'off' : 'active', specialties, langs,
  });
}
function thToDb(t) {
  return {
    id: t.id, name: t.name, role: t.role || 'Therapist',
    specialty: (t.specialties || []).join(', '),
    langs: (t.langs && t.langs.length) ? t.langs : ['EN'],
    exp: t.exp || '', phone: t.phone || '', status: t.status === 'off' ? 'off' : 'active',
  };
}

let therapists = (JSON.parse(localStorage.getItem('taj-therapists') || 'null') || SEED_THERAPISTS).map(thFromDb);

function mirrorTherapists() { try { localStorage.setItem('taj-therapists', JSON.stringify(therapists.map(thToDb))); } catch (_) {} }
function nextThId() {
  const nums = therapists.map(t => parseInt(String(t.id).replace(/\D/g, ''), 10) || 0);
  return 'T-' + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(2, '0');
}

async function loadTherapists() {
  if (window.TajData && TajData.therapists && TajData.therapists.list) {
    try {
      const rows = await TajData.therapists.list();
      if (Array.isArray(rows) && rows.length) therapists = rows.map(thFromDb);
    } catch (e) { console.warn('[therapists] load', e); }
  }
  renderTherapists();
}

async function saveTherapist(rec) {
  const row = thToDb(rec);
  if (window.TajData && TajData.therapists && TajData.therapists.upsert) {
    try { await TajData.therapists.upsert(row); } catch (e) { console.warn('[therapist save]', e); }
  }
  const norm = thFromDb(row);
  const idx = therapists.findIndex(x => x.id === rec.id);
  const isNew = idx < 0;
  if (isNew) therapists.unshift(norm); else therapists[idx] = norm;
  mirrorTherapists();
  renderTherapists();
  if (window.TajLog) TajLog.add({ type: 'note', title: (isNew ? 'Therapist added: ' : 'Therapist updated: ') + rec.name, desc: rec.role, ref: rec.id, refType: 'therapist' });
}
async function removeTherapist(id) {
  const t = therapists.find(x => x.id === id);
  if (!confirm(`Remove ${t ? t.name : 'this therapist'} from the team? This cannot be undone.`)) return;
  if (window.TajData && TajData.therapists && TajData.therapists.remove) {
    try { await TajData.therapists.remove(id); } catch (e) { console.warn('[therapist remove]', e); }
  }
  therapists = therapists.filter(x => x.id !== id);
  mirrorTherapists();
  renderTherapists();
}
async function toggleTherapist(id) {
  const t = therapists.find(x => x.id === id);
  if (!t) return;
  await saveTherapist(Object.assign({}, t, { status: t.status === 'active' ? 'off' : 'active' }));
}

function renderTherapists() {
  const grid = document.getElementById('therapist-grid');
  if (!grid) return;
  grid.innerHTML = therapists.map(t => `
    <article class="therapist-card" data-id="${escTh(t.id)}">
      <div class="therapist-card__head">
        <div class="therapist-card__avatar">${initials(t.name)}</div>
        <div class="therapist-card__info">
          <strong>${escTh(t.name)}</strong>
          <small>${escTh(t.role)}</small>
        </div>
        <span class="therapist-card__status ${t.status}">${t.status === 'active' ? 'Active' : 'Off'}</span>
      </div>
      <div class="therapist-card__tags">
        ${(t.specialties.length ? t.specialties : ['—']).map(s => `<span class="therapist-card__tag">${escTh(s)}</span>`).join('')}
      </div>
      <div class="therapist-card__meta">
        <div><i class="fas fa-language"></i>${t.langs.map(escTh).join(' · ')}</div>
        <div><i class="fas fa-clock"></i>${escTh(t.exp)} experience</div>
        <div><i class="fas fa-phone"></i>${escTh(t.phone)}</div>
      </div>
      <div class="therapist-card__actions">
        <a class="icon-btn" data-edit-th title="Edit"><i class="fas fa-pen"></i> Edit</a>
        <a class="icon-btn" data-toggle-th title="Toggle status"><i class="fas fa-power-off"></i> ${t.status === 'active' ? 'Set Off' : 'Activate'}</a>
        <a class="icon-btn danger" data-rm-th title="Remove"><i class="fas fa-trash"></i></a>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('[data-toggle-th]').forEach(b => b.addEventListener('click', e => toggleTherapist(e.target.closest('[data-id]').dataset.id)));
  grid.querySelectorAll('[data-rm-th]').forEach(b => b.addEventListener('click', e => removeTherapist(e.target.closest('[data-id]').dataset.id)));
  grid.querySelectorAll('[data-edit-th]').forEach(b => b.addEventListener('click', e => {
    const id = e.target.closest('[data-id]').dataset.id;
    location.href = 'admin-therapist.html?id=' + encodeURIComponent(id);
  }));
}

document.getElementById('add-therapist')?.addEventListener('click', () => { location.href = 'admin-therapist.html'; });
loadTherapists();

/* ============================================================
   Services master  (single source of truth for taj-services)
   ============================================================
   Schema:
     { id, name, category, tag, description, long_description,
       duration, price, price_alt, member_price, image,
       show_on_website, show_in_booking, featured, member_only,
       status: 'active'|'hidden'|'draft', sort,
       createdAt, updatedAt }
   The public services.html grid, booking.html picker, and
   admin-new-booking dropdown all read from this store. */

// Catalog mirrors Taj_AlSukun_Services.xlsx. `audience` ('both'|'ladies'|'men')
// is persisted separately in the `service-audience` settings map (the services
// table has no audience column) — it's included here so the seed + admin list
// stay consistent offline.
const SEED_SERVICES = [
  /* —— COMMON · Massage —— */
  { id:'SV-01', name:'Swedish Massage',            category:'Massage', tag:'',           duration:'60 / 90 min', price:25, price_alt:35, audience:'both', book:true, image:'assets/images/sanctuary-bed.jpg',      description:'A classic full-body massage using gentle to medium pressure to ease tension.' },
  { id:'SV-02', name:'Royal Thai Massage',         category:'Massage', tag:'',           duration:'60 / 90 min', price:30, price_alt:40, audience:'both', book:true, image:'assets/images/treatment-room.jpg',     description:'Traditional rhythmic stretching and assisted movements to restore energy flow.' },
  { id:'SV-03', name:'Deep Tissue Massage',        category:'Massage', tag:'Signature',  duration:'60 / 90 min', price:30, price_alt:40, audience:'both', book:true, image:'assets/images/deep-tissue.jpg',        description:'Targeted release of chronic tension, improved mobility, and lasting muscular recovery.' },
  { id:'SV-04', name:'Aroma Relaxing Massage',     category:'Massage', tag:'',           duration:'60 / 90 min', price:35, price_alt:45, audience:'both', book:true, image:'assets/images/lounge-flowers.jpg',     description:'A deeply calming massage using aromatic essential oils to ease stress and balance the senses.' },
  { id:'SV-05', name:'Balinese Massage',           category:'Massage', tag:'',           duration:'60 / 90 min', price:35, price_alt:45, audience:'both', book:true, image:'assets/images/spa-relax-1.jpg',        description:'A holistic therapy blending gentle stretches, rhythmic strokes, and aromatic oils.' },
  { id:'SV-06', name:'Hot Stone Massage',          category:'Massage', tag:'Signature',  duration:'60 / 90 min', price:35, price_alt:45, audience:'both', book:true, image:'assets/images/spa-relax-2.jpg',        description:'Warm volcanic stones relax muscles, enhance circulation, and promote complete wellbeing.' },
  { id:'SV-07', name:'Argan Oil Relaxing Massage', category:'Massage', tag:'Signature',  duration:'60 / 90 min', price:40, price_alt:50, audience:'both', book:true, image:'assets/images/therapist-products.jpg', description:'A luxurious massage using nutrient-rich Moroccan argan to nourish skin and ease tension.' },
  /* —— COMMON · Hammam —— */
  { id:'SV-08', name:'Casablanca Hammam (Moroccan Bath)', category:'Hammam', tag:'',        duration:'60 min', price:25, audience:'both', book:true, image:'assets/images/spa-detail-1.jpg', description:'A signature wellness ritual combining steam, exfoliation, and cleansing for inner balance.' },
  { id:'SV-09', name:'Royal Hammam',               category:'Hammam',  tag:'Signature',  duration:'75 min', price:45, audience:'both', book:true, image:'assets/images/spa-detail-2.jpg', description:'An indulgent steam ritual featuring exfoliation and cleansing — purifying body and skin.' },
  /* —— COMMON · Foot Care —— */
  { id:'SV-10', name:'Reflexology Foot Massage',   category:'Foot',    tag:'',           duration:'30 min', price:15, audience:'both', book:true, image:'assets/images/spa-relax-3.jpg',  description:'Therapeutic foot massage applying gentle pressure to specific reflexes to ease stress.' },
  { id:'SV-11', name:'Foot Relaxing Massage',      category:'Foot',    tag:'',           duration:'30 min', price:10, audience:'both', book:true, image:'assets/images/therapist-prep.jpg', description:'A soothing foot massage that relieves fatigue and supports overall balance.' },
  /* —— COMMON · Packages —— */
  { id:'SV-12', name:'Moroccan Bath + Reflexology Foot Massage', category:'Package', tag:'', duration:'75 min',  price:35, audience:'both', book:true, image:'assets/images/spa-foyer.jpg',       description:'Exfoliating Moroccan bath followed by a reflexology foot massage.' },
  { id:'SV-13', name:'Swedish Massage + Jacuzzi',  category:'Package', tag:'',           duration:'90 min',  price:35, audience:'both', book:true, image:'assets/images/waiting-lounge.jpg',  description:'Tension-easing Swedish massage followed by a private jacuzzi soak.' },
  { id:'SV-14', name:'Massage + Body Scrub',       category:'Package', tag:'',           duration:'90 min',  price:35, audience:'both', book:true, image:'assets/images/spa-relax-1.jpg',     description:'Your choice of massage paired with a full-body exfoliation ritual.' },
  { id:'SV-15', name:'Moroccan Bath + Foot Relaxing Massage', category:'Package', tag:'',  duration:'75 min',  price:30, audience:'both', book:true, image:'assets/images/lobby-table.jpg',     description:'Moroccan bath followed by a soothing foot relaxing massage.' },
  { id:'SV-16', name:'Massage + Foot Scrub',       category:'Package', tag:'',           duration:'90 min',  price:25, audience:'both', book:true, image:'assets/images/spa-relax-3.jpg',     description:'A relaxing massage paired with an invigorating foot scrub.' },
  { id:'SV-17', name:'Massage + Face Mask',        category:'Package', tag:'',           duration:'90 min',  price:25, audience:'both', book:true, image:'assets/images/therapist-products.jpg', description:'A calming massage finished with a nourishing face mask.' },
  { id:'SV-18', name:'Moroccan Bath with Argan Oil Massage', category:'Package', tag:'Signature', duration:'100 min', price:60, audience:'both', book:true, image:'assets/images/spa-detail-2.jpg', description:'The classic pairing — exfoliating Hammam followed by an argan oil massage.' },
  { id:'SV-19', name:'Royal Hammam + Massage',     category:'Package', tag:'Most Popular', duration:'120 min', price:50, audience:'both', book:true, image:'assets/images/spa-detail-1.jpg',  description:'Our most-loved pairing — Royal Hammam followed by a signature massage.' },
  { id:'SV-20', name:'Sultan Suite',               category:'Package', tag:'',           duration:'120 min', price:50, audience:'both', book:true, image:'assets/images/spa-foyer.jpg',       description:'A premium sequence designed for full-day restoration.' },
  { id:'SV-21', name:'Massage + Moroccan Bath',    category:'Package', tag:'',           duration:'100 min', price:50, audience:'both', book:true, image:'assets/images/couples-massage.jpg', description:'Choose your massage style and follow with the traditional Moroccan Hammam.' },
  { id:'SV-22', name:'Balinese Massage + Body Scrub', category:'Package', tag:'',        duration:'90 min',  price:45, audience:'both', book:true, image:'assets/images/spa-relax-1.jpg',     description:'Aromatic Balinese massage paired with an invigorating full-body scrub.' },
  /* —— MEN ONLY · Waxing & Hair Removal —— */
  { id:'SV-23', name:'Chest Shaving',     category:'Waxing', tag:'', duration:'', price:5,  audience:'men', book:false, image:'assets/images/therapist-prep.jpg', description:'Men’s chest shaving.' },
  { id:'SV-24', name:'Chest Waxing',      category:'Waxing', tag:'', duration:'', price:8,  audience:'men', book:false, image:'assets/images/therapist-prep.jpg', description:'Men’s chest waxing.' },
  { id:'SV-25', name:'Full Arms Shaving', category:'Waxing', tag:'', duration:'', price:5,  audience:'men', book:false, image:'assets/images/therapist-prep.jpg', description:'Men’s full arms shaving.' },
  { id:'SV-26', name:'Full Arms Waxing',  category:'Waxing', tag:'', duration:'', price:7,  audience:'men', book:false, image:'assets/images/therapist-prep.jpg', description:'Men’s full arms waxing.' },
  { id:'SV-27', name:'Underarms Shaving', category:'Waxing', tag:'', duration:'', price:2,  audience:'men', book:false, image:'assets/images/therapist-prep.jpg', description:'Men’s underarms shaving.' },
  { id:'SV-28', name:'Underarms Waxing',  category:'Waxing', tag:'', duration:'', price:4,  audience:'men', book:false, image:'assets/images/therapist-prep.jpg', description:'Men’s underarms waxing.' },
  { id:'SV-29', name:'Bikini Line Shaving', category:'Waxing', tag:'', duration:'', price:3, audience:'men', book:false, image:'assets/images/therapist-prep.jpg', description:'Men’s bikini line shaving.' },
  { id:'SV-30', name:'Bikini Line Waxing',  category:'Waxing', tag:'', duration:'', price:5, audience:'men', book:false, image:'assets/images/therapist-prep.jpg', description:'Men’s bikini line waxing.' },
  { id:'SV-31', name:'Back Shaving',      category:'Waxing', tag:'', duration:'', price:5,  audience:'men', book:false, image:'assets/images/therapist-prep.jpg', description:'Men’s back shaving.' },
  { id:'SV-32', name:'Back Waxing',       category:'Waxing', tag:'', duration:'', price:8,  audience:'men', book:false, image:'assets/images/therapist-prep.jpg', description:'Men’s back waxing.' },
  { id:'SV-33', name:'Full Legs Shaving', category:'Waxing', tag:'', duration:'', price:7,  audience:'men', book:false, image:'assets/images/therapist-prep.jpg', description:'Men’s full legs shaving.' },
  { id:'SV-34', name:'Full Legs Waxing',  category:'Waxing', tag:'', duration:'', price:9,  audience:'men', book:false, image:'assets/images/therapist-prep.jpg', description:'Men’s full legs waxing.' },
  { id:'SV-35', name:'Brazilian Shaving', category:'Waxing', tag:'', duration:'', price:12, audience:'men', book:false, image:'assets/images/therapist-prep.jpg', description:'Men’s Brazilian shaving.' },
  { id:'SV-36', name:'Brazilian Waxing',  category:'Waxing', tag:'', duration:'', price:15, audience:'men', book:false, image:'assets/images/therapist-prep.jpg', description:'Men’s Brazilian waxing.' },
  { id:'SV-37', name:'Full Body Shaving', category:'Waxing', tag:'', duration:'', price:12, audience:'men', book:false, image:'assets/images/therapist-prep.jpg', description:'Men’s full body shaving.' },
  { id:'SV-38', name:'Full Body Waxing',  category:'Waxing', tag:'', duration:'', price:20, audience:'men', book:false, image:'assets/images/therapist-prep.jpg', description:'Men’s full body waxing.' },
  /* —— MEN ONLY · Barber & Grooming —— */
  { id:'SV-39', name:'Haircut & Shave',         category:'Barber', tag:'', duration:'', price:8,   audience:'men', book:false, image:'assets/images/reception-desk.jpg', description:'Men’s haircut with a traditional shave.' },
  { id:'SV-40', name:'Mustache Color',          category:'Barber', tag:'', duration:'', price:7.5, audience:'men', book:false, image:'assets/images/reception-desk.jpg', description:'Mustache colouring.' },
  { id:'SV-41', name:'Beard Color',             category:'Barber', tag:'', duration:'', price:4.5, audience:'men', book:false, image:'assets/images/reception-desk.jpg', description:'Beard colouring.' },
  { id:'SV-42', name:'Full Head Color',         category:'Barber', tag:'', duration:'', price:10,  audience:'men', book:false, image:'assets/images/reception-desk.jpg', description:'Full head hair colouring.' },
  { id:'SV-43', name:'Hair Straightening / Relaxing', category:'Barber', tag:'', duration:'', price:15, audience:'men', book:false, image:'assets/images/reception-desk.jpg', description:'Hair straightening / relaxing treatment.' },
  { id:'SV-44', name:'Organic Hot Argan Oil Treatment', category:'Barber', tag:'', duration:'', price:7, audience:'men', book:false, image:'assets/images/reception-desk.jpg', description:'Nourishing hot argan oil hair treatment.' },
  { id:'SV-45', name:'Shaving',                 category:'Barber', tag:'', duration:'', price:4,   audience:'men', book:false, image:'assets/images/reception-desk.jpg', description:'Classic shave.' },
  { id:'SV-46', name:'Steam Shave',             category:'Barber', tag:'', duration:'', price:5,   audience:'men', book:false, image:'assets/images/reception-desk.jpg', description:'Steam shave for a closer finish.' },
  { id:'SV-47', name:'Haircut',                 category:'Barber', tag:'', duration:'', price:5,   audience:'men', book:false, image:'assets/images/reception-desk.jpg', description:'Men’s haircut.' },
  { id:'SV-48', name:'Haircut & Style',         category:'Barber', tag:'', duration:'', price:6,   audience:'men', book:false, image:'assets/images/reception-desk.jpg', description:'Men’s haircut with styling.' },
  { id:'SV-49', name:'Hair Wash',               category:'Barber', tag:'', duration:'', price:1.5, audience:'men', book:false, image:'assets/images/reception-desk.jpg', description:'Hair wash.' },
  { id:'SV-50', name:'Hair Style',              category:'Barber', tag:'', duration:'', price:2,   audience:'men', book:false, image:'assets/images/reception-desk.jpg', description:'Hair styling.' },
  { id:'SV-51', name:'Face Scrub & Steam',      category:'Barber', tag:'', duration:'', price:4.5, audience:'men', book:false, image:'assets/images/reception-desk.jpg', description:'Face scrub with steam.' },
  { id:'SV-52', name:'Eyebrow Threading (Men)', category:'Waxing', tag:'', duration:'', price:1.5, audience:'men', book:false, image:'assets/images/therapist-prep.jpg', description:'Men’s eyebrow threading.' },
  /* —— LADIES ONLY · Beauty —— */
  { id:'SV-53', name:'Eyebrow Threading',       category:'Waxing', tag:'', duration:'', price:1.5, audience:'ladies', book:false, image:'assets/images/therapist-products.jpg', description:'Eyebrow threading.' },
  { id:'SV-54', name:'Waxing — Ear, Nose & Cheeks', category:'Waxing', tag:'', duration:'', price:4.5, audience:'ladies', book:false, image:'assets/images/therapist-products.jpg', description:'Threading / waxing for ear, nose and cheeks.' },
  { id:'SV-55', name:'Manicure',                category:'Nails', tag:'', duration:'25 min', price:6.5, audience:'ladies', book:true, image:'assets/images/therapist-products.jpg', description:'Hand care — nail shaping, cuticle care, and polish.' },
  { id:'SV-56', name:'Foot Spa',                category:'Nails', tag:'', duration:'50 min', price:11,  audience:'ladies', book:true, image:'assets/images/spa-relax-3.jpg',        description:'Relaxing foot spa treatment.' },
  { id:'SV-57', name:'Pedicure',                category:'Nails', tag:'', duration:'40 min', price:7,   audience:'ladies', book:true, image:'assets/images/spa-relax-3.jpg',        description:'Foot care — soak, scrub, nail shaping, and polish.' },
  { id:'SV-58', name:'Manicure & Pedicure Combo', category:'Nails', tag:'', duration:'65 min', price:12, audience:'ladies', book:true, image:'assets/images/therapist-products.jpg', description:'Complete hand and foot care in one session.' }
].map((s, i) => Object.assign({
  show_on_website: true,
  show_in_booking: s.book !== false,
  featured: false,
  member_only: false,
  status: 'active',
  sort: (i + 1) * 10
}, s));

let services = (function loadOrSeed() {
  try {
    const raw = JSON.parse(localStorage.getItem('taj-services') || 'null');
    if (!raw || !raw.length) return SEED_SERVICES.slice();
    // Upgrade older records that are missing the newer fields
    let dirty = false;
    raw.forEach(s => {
      if (s.show_on_website === undefined) { s.show_on_website = true; dirty = true; }
      if (s.show_in_booking === undefined) { s.show_in_booking = true; dirty = true; }
      if (s.featured        === undefined) { s.featured        = false; dirty = true; }
      if (s.member_only     === undefined) { s.member_only     = false; dirty = true; }
      if (s.sort            === undefined) { s.sort            = 100;   dirty = true; }
      if (s.tag             === undefined) { s.tag             = '';    dirty = true; }
      if (s.description     === undefined) { s.description     = '';    dirty = true; }
    });
    if (dirty) localStorage.setItem('taj-services', JSON.stringify(raw));
    return raw;
  } catch (_) { return SEED_SERVICES.slice(); }
})();
// Persist seed on first load so other pages see it
if (!localStorage.getItem('taj-services')) {
  localStorage.setItem('taj-services', JSON.stringify(services));
}

function persistServices() {
  localStorage.setItem('taj-services', JSON.stringify(services));
}
function reloadServices() {
  try { services = JSON.parse(localStorage.getItem('taj-services') || '[]') || []; }
  catch (_) {}
}

function categoryColor(cat) {
  const c = (cat || '').toLowerCase();
  return c === 'hammam'  ? 'walk-in'
       : c === 'massage' ? 'website'
       : c === 'package' ? 'gold'
       : 'admin';
}

function renderServices() {
  reloadServices();
  const tbody = document.getElementById('services-body');
  if (!tbody) return;

  // Sort by sort field, then name
  const sorted = services.slice().sort((a, b) =>
    (a.sort || 0) - (b.sort || 0) || (a.name || '').localeCompare(b.name || ''));

  tbody.innerHTML = sorted.map(s => {
    const thumb = s.image
      ? `<img src="${s.image}" alt="" class="svc-row-thumb">`
      : `<span class="svc-row-thumb svc-row-thumb--blank"><i class="far fa-image"></i></span>`;
    const flags = [];
    if (s.featured) flags.push('<span class="svc-flag-pill featured" title="Featured on home"><i class="fas fa-star"></i></span>');
    if (s.member_only) flags.push('<span class="svc-flag-pill member" title="Members only"><i class="fas fa-crown"></i></span>');
    if (s.show_on_website === false) flags.push('<span class="svc-flag-pill off" title="Hidden from website"><i class="fas fa-eye-slash"></i></span>');
    if (s.show_in_booking === false) flags.push('<span class="svc-flag-pill off" title="Not bookable"><i class="fas fa-ban"></i></span>');
    const altPrice = s.price_alt ? ` <small style="color:var(--c-text-soft); font-family:var(--f-body); font-style:normal; font-size:0.74rem;">/ ${s.price_alt}</small>` : '';
    const tag = s.tag ? `<span class="svc-row-tag">${s.tag}</span>` : '';
    return `
      <tr data-id="${s.id}">
        <td>
          <div class="svc-row-cell">
            ${thumb}
            <div class="svc-row-meta">
              <strong style="color:var(--c-deep);">${s.name}</strong> ${tag}
              <small style="color:var(--c-text-soft); display:block; margin-top:2px;">${s.id} · ${s.description ? s.description.slice(0, 60).replace(/&/g,'&amp;').replace(/</g,'&lt;') + (s.description.length > 60 ? '…' : '') : '—'}</small>
              ${flags.length ? `<div style="margin-top:4px;">${flags.join(' ')}</div>` : ''}
            </div>
          </div>
        </td>
        <td><span class="badge-source ${categoryColor(s.category)}">${s.category}</span></td>
        <td>${s.duration}</td>
        <td><strong style="color:var(--c-copper); font-family: var(--f-display); font-style: italic; font-size: 1.15rem;">${s.price}${altPrice} <small style="font-family: var(--f-body); font-style: normal; font-size: 0.7rem; color: var(--c-text-soft); letter-spacing: 0.16em; font-weight: 600;">BHD</small></strong></td>
        <td><span class="badge-status ${s.status === 'active' ? 'ok' : (s.status === 'draft' ? 'pending' : 'done')}">${s.status === 'active' ? 'Active' : (s.status === 'draft' ? 'Draft' : 'Hidden')}</span></td>
        <td class="cell-actions">
          <a class="icon-btn" href="admin-service.html?id=${s.id}" title="Edit"><i class="fas fa-pen"></i></a>
          <a class="icon-btn" data-toggle-sv title="Toggle visibility"><i class="fas fa-eye"></i></a>
          <a class="icon-btn" data-dup-sv title="Duplicate"><i class="far fa-copy"></i></a>
          <a class="icon-btn danger" data-rm-sv title="Remove"><i class="fas fa-trash"></i></a>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('[data-toggle-sv]').forEach(b => b.addEventListener('click', async e => {
    const id = e.target.closest('tr').dataset.id;
    const s = services.find(x => x.id === id);
    if (!s) return;
    s.status = s.status === 'active' ? 'hidden' : 'active';
    try {
      if (window.TajData) {
        await TajData.services.upsert(s);
        await TajData.activity.log({ type:'note', title:'Service visibility toggled', desc:`${s.name} → ${s.status}`, ref: s.id, refType:'service' });
      } else {
        persistServices();
        if (window.TajLog) TajLog.add({ type:'note', title:'Service visibility toggled', desc:`${s.name} → ${s.status}`, ref: s.id, refType:'service' });
      }
    } catch (err) {
      console.warn('[services] toggle failed:', err);
      persistServices();
    }
    renderServices();
  }));
  tbody.querySelectorAll('[data-dup-sv]').forEach(b => b.addEventListener('click', async e => {
    const id = e.target.closest('tr').dataset.id;
    const s = services.find(x => x.id === id);
    if (!s) return;
    const nums = services.map(x => parseInt((x.id || '').replace(/\D/g, ''), 10) || 0);
    const newId = 'SV-' + String(Math.max(...nums) + 1).padStart(2, '0');
    const copy = Object.assign({}, s, { id: newId, name: s.name + ' (copy)', status: 'draft' });
    try {
      if (window.TajData) {
        await TajData.services.upsert(copy);
      } else {
        services.unshift(copy);
        persistServices();
      }
    } catch (err) {
      console.warn('[services] duplicate failed:', err);
      services.unshift(copy);
      persistServices();
    }
    renderServices();
    showToast('Service duplicated as ' + newId);
  }));
  tbody.querySelectorAll('[data-rm-sv]').forEach(b => b.addEventListener('click', async e => {
    const id = e.target.closest('tr').dataset.id;
    const s  = services.find(x => x.id === id);
    if (!confirm(`Remove "${s ? s.name : id}"?`)) return;
    try {
      if (window.TajData) {
        await TajData.services.remove(id);
        await TajData.activity.log({ type:'note', title:'Service removed', desc:(s ? s.name : id), ref: id, refType:'service' });
      } else {
        services = services.filter(x => x.id !== id);
        persistServices();
        if (window.TajLog) TajLog.add({ type:'note', title:'Service removed', desc:(s ? s.name : id), ref: id, refType:'service' });
      }
    } catch (err) {
      console.warn('[services] remove failed:', err);
      services = services.filter(x => x.id !== id);
      persistServices();
    }
    renderServices();
  }));
}

document.getElementById('add-service')?.addEventListener('click', () => {
  location.href = 'admin-service.html';
});

document.getElementById('export-services')?.addEventListener('click', () => {
  const cols = ['ID','Name','Category','Tag','Duration','Price','PriceAlt','MemberPrice','Status','Website','Bookable','Featured','MemberOnly','Sort','Description'];
  const esc = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  const rows = services.map(s => [
    s.id, s.name, s.category, s.tag || '', s.duration, s.price, s.price_alt || '', s.member_price || '',
    s.status, s.show_on_website ? 'Y' : 'N', s.show_in_booking ? 'Y' : 'N',
    s.featured ? 'Y' : 'N', s.member_only ? 'Y' : 'N', s.sort, s.description || ''
  ].map(esc).join(','));
  const csv = [cols.join(',')].concat(rows).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'taj-services-' + new Date().toISOString().split('T')[0] + '.csv';
  a.click();
});

/* ---------- Operating hours ---------- */
const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const SEED_HOURS = {
  Saturday:  { open: true,  start: '10:00', end: '18:00' },
  Sunday:    { open: true,  start: '10:00', end: '18:00' },
  Monday:    { open: true,  start: '10:00', end: '18:00' },
  Tuesday:   { open: true,  start: '10:00', end: '18:00' },
  Wednesday: { open: true,  start: '10:00', end: '18:00' },
  Thursday:  { open: true,  start: '10:00', end: '18:00' },
  Friday:    { open: true,  start: '10:00', end: '18:00' }
};
let hoursData = JSON.parse(localStorage.getItem('taj-hours') || 'null') || SEED_HOURS;
function persistHours() { localStorage.setItem('taj-hours', JSON.stringify(hoursData)); }

function renderHours() {
  const list = document.getElementById('hours-editor');
  if (!list) return;
  list.innerHTML = DAYS.map(day => {
    const d = hoursData[day] || (hoursData[day] = { open: false, start: '10:00', end: '23:00' });
    return `
      <li class="${d.open ? 'open' : ''}" data-day="${day}">
        <span class="day">${day}</span>
        <span class="toggle" data-toggle-day></span>
        <div class="times">
          ${d.open
            ? `<input type="time" class="t-start" value="${d.start}"><span class="sep">to</span><input type="time" class="t-end" value="${d.end}">`
            : '<span class="closed-lbl">Closed</span>'
          }
        </div>
      </li>
    `;
  }).join('');

  list.querySelectorAll('[data-toggle-day]').forEach(t => t.addEventListener('click', e => {
    const day = e.target.closest('li').dataset.day;
    hoursData[day].open = !hoursData[day].open;
    persistHours();
    renderHours();
  }));
  list.querySelectorAll('.t-start').forEach(i => i.addEventListener('change', e => {
    const day = e.target.closest('li').dataset.day;
    hoursData[day].start = e.target.value;
    persistHours();
  }));
  list.querySelectorAll('.t-end').forEach(i => i.addEventListener('change', e => {
    const day = e.target.closest('li').dataset.day;
    hoursData[day].end = e.target.value;
    persistHours();
  }));
}

/* ---------- Payment methods toggles ---------- */
const PAY_OPTIONS = [
  { key: 'cash',    name: 'Cash',          desc: 'Accept cash payments at reception',   icon: 'fas fa-money-bill-wave', enabled: true  },
  { key: 'card',    name: 'Card',          desc: 'Visa, Mastercard, Amex via terminal', icon: 'far fa-credit-card',     enabled: true  },
  { key: 'benefit', name: 'BenefitPay',    desc: 'Bahrain mobile payment',              icon: 'fas fa-mobile-alt',      enabled: true  },
  { key: 'bank',    name: 'Bank Transfer', desc: 'Direct deposit · IBAN provided',      icon: 'fas fa-university',      enabled: true  },
  { key: 'apple',   name: 'Apple Pay',     desc: 'Contactless via iPhone / Watch',      icon: 'fab fa-apple-pay',       enabled: false },
  { key: 'gpay',    name: 'Google Pay',    desc: 'Contactless via Android',             icon: 'fab fa-google-pay',      enabled: false },
];
// Normalize any saved method object (key-based OR legacy id-based "pm-cash"
// OR name-only) down to one of our canonical keys.
function payKeyOf(m) {
  if (!m) return '';
  if (m.key) return m.key;
  if (m.id)  return String(m.id).replace(/^pm-/, '');
  const n = (m.name || '').toLowerCase();
  if (n.includes('cash')) return 'cash';
  if (n.includes('card')) return 'card';
  if (n.includes('benefit')) return 'benefit';
  if (n.includes('bank')) return 'bank';
  if (n.includes('apple')) return 'apple';
  if (n.includes('google')) return 'gpay';
  return '';
}
// Start from the canonical PAY_OPTIONS, applying any saved enabled-state from
// the localStorage cache (matched by normalized key) so icons/desc stay intact.
let payMethods = (function () {
  const base = PAY_OPTIONS.map(o => Object.assign({}, o));
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem('taj-pay-methods') || 'null'); } catch (_) {}
  if (Array.isArray(saved)) {
    const on = {}; saved.forEach(m => { const k = payKeyOf(m); if (k) on[k] = !!m.enabled; });
    base.forEach(o => { if (o.key in on) o.enabled = on[o.key]; });
  }
  return base;
})();
// Read the editable payment-detail fields (bank transfer + BenefitPay) so they
// can be saved alongside the method toggles and shown on the public checkout.
function readPayDetails() {
  const v = id => (document.getElementById(id)?.value || '').trim();
  return {
    bank: {
      accountName:   v('pm-bank-name'),
      bank:          v('pm-bank-bank'),
      accountNumber: v('pm-bank-acct'),
      iban:          v('pm-bank-iban'),
      swift:         v('pm-bank-swift'),
      reference:     v('pm-bank-ref'),
      note:          v('pm-bank-note')
    },
    benefit: {
      merchantId:    v('pm-benefit-mid'),
      merchantPhone: v('pm-benefit-phone'),
      note:          v('pm-benefit-note')
    }
  };
}
function fillPayDetails(details) {
  if (!details) return;
  const set = (id, val) => { const el = document.getElementById(id); if (el != null && val != null && val !== '') el.value = val; };
  const b = details.bank || {}, bp = details.benefit || {};
  set('pm-bank-name', b.accountName); set('pm-bank-bank', b.bank); set('pm-bank-acct', b.accountNumber);
  set('pm-bank-iban', b.iban); set('pm-bank-swift', b.swift); set('pm-bank-ref', b.reference); set('pm-bank-note', b.note);
  set('pm-benefit-mid', bp.merchantId); set('pm-benefit-phone', bp.merchantPhone); set('pm-benefit-note', bp.note);
}
function persistPay() {
  localStorage.setItem('taj-pay-methods', JSON.stringify(payMethods));
  // Mirror to the shared settings store so the public signup/booking flows
  // read the same enabled-methods list + detail fields (key: admin-payments).
  try {
    if (window.TajData?.settings?.set) TajData.settings.set('admin-payments', { methods: payMethods, details: readPayDetails() });
  } catch (_) {}
}

function renderPayMethods() {
  const grid = document.getElementById('pay-toggles');
  if (!grid) return;
  grid.innerHTML = payMethods.map(m => `
    <div class="pay-toggle ${m.enabled ? 'active' : ''}" data-key="${m.key}">
      <div class="icon"><i class="${m.icon}"></i></div>
      <div class="info">
        <strong>${m.name}</strong>
        <small>${m.desc}</small>
      </div>
      <span class="switch" data-toggle-pay></span>
    </div>
  `).join('');
  grid.querySelectorAll('[data-toggle-pay]').forEach(t => t.addEventListener('click', e => {
    const key = e.target.closest('[data-key]').dataset.key;
    const m = payMethods.find(x => x.key === key);
    if (m) { m.enabled = !m.enabled; persistPay(); renderPayMethods(); }
  }));
}

// Load the saved enabled-methods list from the shared store on mount, so the
// admin reflects what the public site uses (and seeds it on first run).
(async function loadPayMethods() {
  try {
    if (window.TajData?.settings?.get) {
      const saved = await TajData.settings.get('admin-payments');
      if (saved && Array.isArray(saved.methods) && saved.methods.length) {
        // Reconcile saved enabled-state onto the canonical list (handles any
        // legacy shape) so the toggles always render with proper icons/labels.
        const on = {}; saved.methods.forEach(m => { const k = payKeyOf(m); if (k) on[k] = !!m.enabled; });
        payMethods.forEach(o => { if (o.key in on) o.enabled = on[o.key]; });
        localStorage.setItem('taj-pay-methods', JSON.stringify(payMethods));
        renderPayMethods();
        fillPayDetails(saved.details);
        // Re-publish in the canonical key-based shape so downstream consumers
        // (signup payment cards) get a consistent structure going forward.
        if (window.TajData?.settings?.set) TajData.settings.set('admin-payments', { methods: payMethods, details: readPayDetails() });
      } else {
        // First run — publish the current defaults so the public flows have data
        if (window.TajData?.settings?.set) TajData.settings.set('admin-payments', { methods: payMethods, details: readPayDetails() });
      }
    }
    // Persist detail edits (bank / BenefitPay) automatically, debounced.
    let dt = null;
    ['pm-bank-name','pm-bank-bank','pm-bank-acct','pm-bank-iban','pm-bank-swift','pm-bank-ref','pm-bank-note','pm-benefit-mid','pm-benefit-phone','pm-benefit-note'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const ev = el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(ev, () => { clearTimeout(dt); dt = setTimeout(persistPay, 350); });
    });
  } catch (_) {}
})();

/* ---------- Settings sub-nav scroll + active state ---------- */
document.querySelectorAll('.settings-nav__chip').forEach(c => {
  c.addEventListener('click', e => {
    e.preventDefault();
    const target = c.getAttribute('href');
    const el = document.querySelector(target);
    if (el) {
      document.querySelectorAll('.settings-nav__chip').forEach(x => x.classList.remove('active'));
      c.classList.add('active');
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ---------- VAT rate live update ---------- */
document.getElementById('set-vat')?.addEventListener('input', e => {
  const display = document.getElementById('vat-display');
  if (display) display.textContent = (parseFloat(e.target.value) || 0) + '%';
});

/* ---------- Save settings (visual feedback only) ---------- */
document.querySelectorAll('[data-save-settings]').forEach(b => {
  b.addEventListener('click', () => {
    showToast('Settings saved');
  });
});

/* ---------- Notification Settings: load + persist on every change ----------
   Stored under settings key "admin-notify" with shape:
     { whatsapp:bool, whatsappNumber, email:bool, emailAddress,
       sms:bool, smsNumber, digest:bool }
   Falls back to Footer (global) WhatsApp/email if first-run blank.    */
(function () {
  const list = document.getElementById('notify-prefs-list');
  if (!list) return;
  const KEY = 'admin-notify';
  const flash = document.getElementById('notify-saved-flash');
  let prefs = { whatsapp:false, whatsappNumber:'', email:false, emailAddress:'', sms:false, smsNumber:'', digest:false };
  let saveTimer = null;

  const $tog = sel => list.querySelector(`[data-notify-toggle="${sel}"]`);
  const $fld = sel => list.querySelector(`[data-notify-field="${sel}"]`);
  const $bdg = sel => list.querySelector(`[data-notify-badge="${sel}"]`);

  function paintBadges() {
    [['whatsapp', $tog('whatsapp')], ['email', $tog('email')], ['sms', $tog('sms')], ['digest', $tog('digest')]].forEach(([key, cb]) => {
      const badge = $bdg(key);
      if (!badge || !cb) return;
      const on = !!cb.checked;
      badge.textContent = on ? 'Active' : 'Inactive';
      badge.classList.toggle('ok', on);
      badge.classList.toggle('done', !on);
    });
  }

  function flashSaved() {
    if (!flash) return;
    flash.style.opacity = '1';
    clearTimeout(flashSaved._t);
    flashSaved._t = setTimeout(() => { flash.style.opacity = '0'; }, 1400);
  }

  async function save() {
    prefs = {
      whatsapp:       !!$tog('whatsapp')?.checked,
      whatsappNumber: ($fld('whatsappNumber')?.value || '').trim(),
      email:          !!$tog('email')?.checked,
      emailAddress:   ($fld('emailAddress')?.value || '').trim(),
      sms:            !!$tog('sms')?.checked,
      smsNumber:      ($fld('smsNumber')?.value || '').trim(),
      digest:         !!$tog('digest')?.checked
    };
    paintBadges();
    try {
      if (window.TajData?.settings?.set) await TajData.settings.set(KEY, prefs);
      else localStorage.setItem('taj-' + KEY, JSON.stringify(prefs));
      flashSaved();
    } catch (e) { console.warn('[notify-prefs] save failed:', e); }
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 300);
  }

  async function load() {
    let saved = null;
    try {
      if (window.TajData?.settings?.get) saved = await TajData.settings.get(KEY);
      else saved = JSON.parse(localStorage.getItem('taj-' + KEY) || 'null');
    } catch (_) {}
    // Fall back to the footer WhatsApp / email for first-run defaults
    let footer = null;
    try { footer = window.TajData?.settings?.get ? await TajData.settings.get('page-footer') : null; } catch (_) {}
    const footerC = (footer && footer.contact) || {};
    prefs = Object.assign({
      whatsapp: true,  whatsappNumber: footerC.whatsapp || '+973 35194422',
      email:    true,  emailAddress:   footerC.email   || 'admin@tasukunspa.com',
      sms:      false, smsNumber:      '',
      digest:   false
    }, saved || {});
    // Paint into the DOM
    $tog('whatsapp').checked = !!prefs.whatsapp;
    $fld('whatsappNumber').value = prefs.whatsappNumber || '';
    $tog('email').checked = !!prefs.email;
    $fld('emailAddress').value = prefs.emailAddress || '';
    $tog('sms').checked = !!prefs.sms;
    $fld('smsNumber').value = prefs.smsNumber || '';
    $tog('digest').checked = !!prefs.digest;
    paintBadges();
  }

  // Persist on any toggle or input
  list.addEventListener('change', e => {
    if (e.target.matches('[data-notify-toggle], [data-notify-field]')) scheduleSave();
  });
  list.addEventListener('input', e => {
    if (e.target.matches('[data-notify-field]')) scheduleSave();
  });

  load();
})();


/* ============================================================
   ENHANCED OVERVIEW + NOTIFICATIONS
   ============================================================ */

/* ---------- Live overview rendering ---------- */
function renderOverview() {
  const today = TajFmt.todayISO();
  const yMonth = today.substring(0, 7);
  const yMonthDate = new Date(today);
  yMonthDate.setMonth(yMonthDate.getMonth() - 1);
  const lastMonth = yMonthDate.toISOString().substring(0, 7);

  // Today's bookings (excluding cancelled)
  const todayBks = bookings.filter(b => b.date === today && b.status !== 'cancel');
  const todayRevenue = todayBks.reduce((s, b) => s + (b.total || 0), 0);

  // Yesterday for comparison
  const yest = new Date(today); yest.setDate(yest.getDate() - 1);
  const yestStr = yest.toISOString().split('T')[0];
  const yestBks = bookings.filter(b => b.date === yestStr && b.status !== 'cancel');
  const todayDiff = todayBks.length - yestBks.length;

  // Active members
  const activeMembers = members.length;
  // New this month
  const newMembersMonth = members.filter(m => { const j = mJoined(m); return j && j.substring(0, 7) === yMonth; }).length;

  // Revenue this month
  const monthBks = bookings.filter(b => b.date && b.date.substring(0, 7) === yMonth && b.status !== 'cancel');
  const monthRevenue = monthBks.reduce((s, b) => s + (b.total || 0), 0);
  const lastMonthBks = bookings.filter(b => b.date && b.date.substring(0, 7) === lastMonth && b.status !== 'cancel');
  const lastMonthRevenue = lastMonthBks.reduce((s, b) => s + (b.total || 0), 0);
  const monthDiff = lastMonthRevenue > 0 ? Math.round((monthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0;

  // Update stat cards
  setText('stat-today', todayBks.length);
  setText('stat-today-sub', todayDiff >= 0 ? `↑ ${todayDiff} vs yesterday` : `↓ ${Math.abs(todayDiff)} vs yesterday`);
  document.getElementById('stat-today-sub').className = 'sub ' + (todayDiff >= 0 ? 'up' : 'down');

  document.getElementById('stat-revenue-today').innerHTML = `${todayRevenue.toFixed(0)} <small style="font-size: 0.95rem; color: var(--c-text-soft); font-family: var(--f-body); font-weight: 400;">BHD</small>`;
  setText('stat-revenue-today-sub', `from ${todayBks.length} ${todayBks.length === 1 ? 'booking' : 'bookings'}`);

  setText('stat-members', activeMembers);
  setText('stat-members-sub', `+${newMembersMonth} this month`);

  document.getElementById('stat-revenue').innerHTML = `${monthRevenue.toFixed(0)} <small style="font-size: 0.95rem; color: var(--c-text-soft); font-family: var(--f-body); font-weight: 400;">BHD</small>`;
  const monthSub = document.getElementById('stat-revenue-sub');
  if (monthSub) {
    monthSub.textContent = monthDiff >= 0 ? `↑ ${monthDiff}% vs last month` : `↓ ${Math.abs(monthDiff)}% vs last month`;
    monthSub.className = 'sub ' + (monthDiff >= 0 ? 'up' : 'down');
  }

  // Mini chart (last 7 days)
  renderMiniChart();

  // Top services this month
  renderTopServices(monthBks);

  // Today's schedule
  renderTodaySchedule(todayBks);

  // Recent activity
  renderActivityFeed();

  // Notification bell
  renderBell();
}

function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

/* Mini revenue chart (last 7 days) */
function renderMiniChart() {
  const chart = document.getElementById('mini-chart');
  const labels = document.getElementById('mini-chart-labels');
  if (!chart) return;

  const today = new Date(); today.setHours(0,0,0,0);
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    const rev = bookings.filter(b => b.date === iso && b.status !== 'cancel').reduce((s, b) => s + (b.total || 0), 0);
    days.push({
      iso, rev,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      isToday: i === 0
    });
  }
  const max = Math.max(1, ...days.map(d => d.rev));
  const total = days.reduce((s, d) => s + d.rev, 0);

  chart.innerHTML = days.map(d =>
    `<div class="mini-chart__bar ${d.isToday ? 'today' : ''}" style="height: ${Math.max(4, (d.rev / max) * 100)}%;" data-tip="${d.label}: ${d.rev.toFixed(0)} BHD"></div>`
  ).join('');
  labels.innerHTML = days.map(d => `<span>${d.label.charAt(0)}</span>`).join('');

  const total7Day = document.getElementById('chart-total');
  if (total7Day) total7Day.textContent = total.toFixed(0) + ' BHD · 7 days';
}

/* Top services */
function renderTopServices(monthBks) {
  const list = document.getElementById('top-services');
  if (!list) return;
  const counts = {};
  const revenues = {};
  monthBks.forEach(b => {
    counts[b.service] = (counts[b.service] || 0) + 1;
    revenues[b.service] = (revenues[b.service] || 0) + (b.total || 0);
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (sorted.length === 0) {
    list.innerHTML = `<li style="text-align:center; color: var(--c-text-soft); padding: 30px 0;">No services booked yet this month</li>`;
    return;
  }
  list.innerHTML = sorted.map(([name, cnt], i) => `
    <li>
      <span class="rank ${i === 0 ? 'top' : ''}">${String(i + 1).padStart(2, '0')}</span>
      <span class="name">${name}<small>${cnt} ${cnt === 1 ? 'booking' : 'bookings'} this month</small></span>
      <span class="meta"><strong>${(revenues[name] || 0).toFixed(0)} BHD</strong>revenue</span>
    </li>
  `).join('');
}

/* Today's schedule (live) */
function renderTodaySchedule(todayBks) {
  const tbody = document.getElementById('today-schedule-body');
  if (!tbody) return;
  if (todayBks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 40px 20px; color: var(--c-text-soft);">
      <i class="far fa-calendar" style="font-size: 28px; color: var(--c-copper); opacity: 0.5; display: block; margin-bottom: 8px;"></i>
      No bookings scheduled for today yet.
    </td></tr>`;
    return;
  }
  // Sort by time
  const sorted = [...todayBks].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  const therapistsList = ['Sofia', 'Aisha', 'Maya', 'Rahma'];
  tbody.innerHTML = sorted.map((b, i) => {
    const therapist = b.therapist || therapistsList[i % therapistsList.length];
    return `
      <tr class="click" data-go="admin-booking.html?id=${encodeURIComponent(b.id)}">
        <td><strong>${TajFmt.time(b.time)}</strong></td>
        <td><div class="cell-name"><div class="av">${TajFmt.initials(b.name)}</div><div><strong>${b.name}</strong><small>${b.phone || ''}</small></div></div></td>
        <td>${b.service}</td>
        <td>${therapist}</td>
        <td><span class="badge-status ${b.status}">${statusLabel(b.status)}</span></td>
      </tr>
    `;
  }).join('');
  tbody.querySelectorAll('tr.click').forEach(tr => {
    tr.addEventListener('click', () => location.href = tr.dataset.go);
  });
}

/* Recent activity feed (from TajLog) */
function renderActivityFeed() {
  const ul = document.getElementById('activity-feed');
  if (!ul) return;
  const items = TajLog.all().slice(0, 8);
  if (items.length === 0) {
    ul.innerHTML = `<li style="justify-content:center; color: var(--c-text-soft); padding: 30px 0; display:block; text-align: center;">No activity yet.</li>`;
    return;
  }
  ul.innerHTML = items.map(a => `
    <li data-go="${activityLink(a)}">
      <div class="activity__ic ${a.type}"><i class="fas ${activityIcon(a.type)}"></i></div>
      <div class="activity__body">
        <strong>${a.title}</strong>
        <p>${a.desc || ''}</p>
        <span class="activity__time">${TajFmt.relative(a.when)}</span>
      </div>
    </li>
  `).join('');
  ul.querySelectorAll('li[data-go]').forEach(li => {
    if (li.dataset.go) li.addEventListener('click', () => location.href = li.dataset.go);
  });
}

function activityIcon(type) {
  return ({
    booking: 'fa-calendar-plus',
    confirm: 'fa-check',
    cancel:  'fa-times',
    payment: 'fa-credit-card',
    member:  'fa-crown',
    note:    'fa-sticky-note'
  })[type] || 'fa-bell';
}

function activityLink(a) {
  if (a.refType === 'booking' && a.ref) return 'admin-booking.html?id=' + encodeURIComponent(a.ref);
  if (a.refType === 'member' && a.ref) return 'admin-member.html?id=' + encodeURIComponent(a.ref);
  return '';
}

/* ---------- Notification bell + dropdown ---------- */
function renderBell() {
  const count = TajLog.unread();
  const badge = document.getElementById('bell-count');
  if (!badge) return;
  if (count > 0) {
    badge.style.display = '';
    badge.textContent = count > 9 ? '9+' : count;
  } else {
    badge.style.display = 'none';
  }
  renderNotifList();
}

function renderNotifList() {
  const list = document.getElementById('notif-list');
  if (!list) return;
  const items = TajLog.all().slice(0, 10);
  if (items.length === 0) {
    list.innerHTML = `<div class="notif-drop__empty">
      <i class="far fa-bell-slash"></i>
      <p>No notifications yet</p>
    </div>`;
    return;
  }
  list.innerHTML = items.map(a => `
    <li class="${a.read ? '' : 'unread'}" data-id="${a.id}" data-go="${activityLink(a)}">
      <div class="ic ${a.type}"><i class="fas ${activityIcon(a.type)}"></i></div>
      <div class="body">
        <strong>${a.title}</strong>
        <p>${a.desc || ''}</p>
        <span class="when">${TajFmt.relative(a.when)}</span>
      </div>
    </li>
  `).join('');
  list.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
      TajLog.markRead(li.dataset.id);
      renderBell();
      if (li.dataset.go) location.href = li.dataset.go;
    });
  });
}

/* Toggle bell dropdown */
document.getElementById('bell-btn')?.addEventListener('click', e => {
  e.stopPropagation();
  document.getElementById('notif-drop').classList.toggle('open');
});
document.addEventListener('click', e => {
  const drop = document.getElementById('notif-drop');
  if (drop && drop.classList.contains('open') && !e.target.closest('.bell-wrap')) {
    drop.classList.remove('open');
  }
});

document.getElementById('mark-all-read')?.addEventListener('click', e => {
  e.stopPropagation();
  TajLog.markAllRead();
  renderBell();
});

document.getElementById('view-all-activity')?.addEventListener('click', e => {
  e.stopPropagation();
  document.getElementById('notif-drop').classList.remove('open');
  document.querySelector('a[data-tab="overview"]').click();
  document.getElementById('activity-feed').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.getElementById('open-activity-log')?.addEventListener('click', () => {
  document.getElementById('activity-feed').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

/* ---------- Stat card jump links ---------- */
document.querySelectorAll('[data-jump]').forEach(card => {
  card.addEventListener('click', () => {
    const [tab, filter] = card.dataset.jump.split(':');
    document.querySelector(`a[data-tab="${tab}"]`)?.click();
    if (filter === 'today') {
      whenFilter = 'today';
      document.getElementById('f-when').value = 'today';
      renderBookings();
    } else if (filter === 'month') {
      whenFilter = 'month';
      document.getElementById('f-when').value = 'month';
      renderBookings();
    }
  });
});

/* ---------- Export overview ---------- */
document.getElementById('export-overview')?.addEventListener('click', () => {
  exportBookingsCSV();
});

/* ---------- Hook into booking confirm/cancel actions to log activity ---------- */
const origRenderBookings = renderBookings;
function logBookingChange(action, bk) {
  const titles = {
    ok:     `Booking confirmed: ${bk.name}`,
    done:   `Booking completed: ${bk.name}`,
    cancel: `Cancellation: ${bk.name}`,
    pending:`Booking marked pending: ${bk.name}`
  };
  TajLog.add({
    type: action === 'cancel' ? 'cancel' : (action === 'ok' ? 'confirm' : 'booking'),
    title: titles[action] || `Booking ${action}: ${bk.name}`,
    desc: `${bk.service} · ${TajFmt.date(bk.date)} ${TajFmt.time(bk.time)}`,
    ref: bk.id,
    refType: 'booking'
  });
  renderBell();
}
// Patch the bulk action wires to also log
document.querySelectorAll('[data-bulk]').forEach(btn => {
  const oldClick = btn.onclick;
  btn.addEventListener('click', () => {
    const action = btn.dataset.bulk;
    if (['ok', 'done', 'cancel'].includes(action)) {
      bookings.forEach(b => { if (selectedIds.has(b.id)) logBookingChange(action, b); });
    }
  });
});

/* ---------- Init ---------- */
function safeInit(label, fn) {
  try { fn(); }
  catch (e) { console.error('[admin init] ' + label + ' failed:', e); }
}
safeInit('renderBookings',  renderBookings);
safeInit('renderMembers',   renderMembers);
safeInit('renderTherapists',renderTherapists);
safeInit('renderServices',  renderServices);
safeInit('renderHours',     renderHours);
safeInit('renderPayMethods',renderPayMethods);
safeInit('renderOverview',  renderOverview);
safeInit('initCalendar',    initCalendar);
safeInit('updateDbStatus',  updateDbStatus);

/* ---------- DB connection status pill ---------- */
function updateDbStatus() {
  const pill = document.getElementById('db-status');
  if (!pill) return;
  const label = pill.querySelector('.db-status__label');
  function paint() {
    const td = window.TajData;
    if (td && td.connected) {
      pill.classList.add('is-on');
      pill.classList.remove('is-off');
      if (label) label.textContent = 'Live · Supabase';
      pill.title = 'Connected to ' + (td.config?.URL || 'Supabase');
    } else {
      pill.classList.add('is-off');
      pill.classList.remove('is-on');
      if (label) label.textContent = 'Local';
      pill.title = 'Running on local storage. Add your anon key to assets/js/supabase-config.js to go live.';
    }
  }
  paint();
  // Try again after data layer warm-up
  if (window.TajData?.ready) window.TajData.ready().then(paint);
}

/* ============================================================
   CALENDAR
   ============================================================
   Drives the #tab-calendar panel: day / week / month / therapist
   views, navigation, filters, stat strip. Reads taj-bookings +
   taj-therapists + taj-hours. Clicking a booking opens its detail
   page; clicking an empty slot opens new-booking pre-filled. */
function initCalendar() {
  const root = document.getElementById('cal-view');
  if (!root) return;

  const HOURS_DEFAULT = { open: 10, close: 22 };
  const SLOT_MIN = 30;
  const STATUS_MAP = {
    confirmed: { label:'Confirmed', cls:'ok' },
    ok:        { label:'Confirmed', cls:'ok' },
    pending:   { label:'Pending',   cls:'pending' },
    new:       { label:'New',       cls:'pending' },
    completed: { label:'Completed', cls:'done' },
    done:      { label:'Completed', cls:'done' },
    cancelled: { label:'Cancelled', cls:'cancel' },
    cancel:    { label:'Cancelled', cls:'cancel' }
  };

  // State (initial view can be set via ?calview=)
  const _qp = new URLSearchParams(location.search);
  const _initView = _qp.get('calview');
  const state = {
    view: ['day','week','month','therapist'].includes(_initView) ? _initView : 'day',
    cursor: startOfDay(new Date()),
    filterTherapist: 'all',
    filterStatus: 'all'
  };

  /* ---- Helpers ---- */
  function startOfDay(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
  function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function addMonths(d, n) { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; }
  function iso(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  function fmtTime(t) {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hh = parseInt(h, 10);
    const ampm = hh >= 12 ? 'PM' : 'AM';
    return `${hh % 12 || 12}:${m} ${ampm}`;
  }
  function fmtTimeShort(h) {
    const hh = h % 12 || 12;
    return hh + (h >= 12 ? 'p' : 'a');
  }
  function fmtRange(a, b) {
    const o = { day: 'numeric', month: 'short', year: 'numeric' };
    if (iso(a) === iso(b)) return a.toLocaleDateString('en-US', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    if (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth())
      return `${a.getDate()}–${b.getDate()} ${a.toLocaleDateString('en-US',{month:'long', year:'numeric'})}`;
    return `${a.toLocaleDateString('en-US', o)} – ${b.toLocaleDateString('en-US', o)}`;
  }
  function getBookings() {
    try { return JSON.parse(localStorage.getItem('taj-bookings') || '[]') || []; }
    catch (_) { return []; }
  }
  function getTherapists() {
    try { return JSON.parse(localStorage.getItem('taj-therapists') || '[]') || []; }
    catch (_) { return []; }
  }
  function durationMin(b) {
    if (typeof b.duration === 'number') return b.duration;
    if (typeof b.duration === 'string') {
      const m = b.duration.match(/(\d+)/);
      if (m) return parseInt(m[1], 10);
    }
    return 60;
  }
  function timeToMin(t) {
    if (!t) return 0;
    const [h, m] = t.split(':');
    return (parseInt(h, 10) || 0) * 60 + (parseInt(m, 10) || 0);
  }
  function statusInfo(s) {
    return STATUS_MAP[(s || 'pending').toLowerCase()] || STATUS_MAP.pending;
  }
  function statusKey(s) {
    const k = (s || '').toLowerCase();
    if (k === 'ok')        return 'confirmed';
    if (k === 'new')       return 'pending';
    if (k === 'done')      return 'completed';
    if (k === 'cancel')    return 'cancelled';
    return k || 'pending';
  }
  function matchesFilter(b) {
    if (state.filterTherapist !== 'all') {
      const bt = (b.therapist || '').toLowerCase();
      const ft = state.filterTherapist.toLowerCase();
      const ftFirst = ft.split(' ')[0];
      const matches = bt === ft || bt === ftFirst || bt.startsWith(ftFirst + ' ');
      if (!matches) return false;
    }
    if (state.filterStatus    !== 'all' && statusKey(b.status) !== state.filterStatus)     return false;
    return true;
  }

  /* ---- Range-of-day helpers ---- */
  function rangeStart() {
    if (state.view === 'day' || state.view === 'therapist') return startOfDay(state.cursor);
    if (state.view === 'week') {
      // Week starts on Saturday for Bahrain
      const d = startOfDay(state.cursor);
      const wd = d.getDay(); // 0=Sun..6=Sat
      const diff = (wd + 1) % 7; // Sat=0, Sun=1, …, Fri=6
      return addDays(d, -diff);
    }
    if (state.view === 'month') {
      const d = startOfDay(state.cursor);
      return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    return startOfDay(state.cursor);
  }
  function rangeEnd() {
    const s = rangeStart();
    if (state.view === 'day' || state.view === 'therapist') return s;
    if (state.view === 'week') return addDays(s, 6);
    if (state.view === 'month') return new Date(s.getFullYear(), s.getMonth() + 1, 0);
    return s;
  }

  /* ---- Toolbar ---- */
  function updateToolbar() {
    document.getElementById('cal-range').textContent = fmtRange(rangeStart(), rangeEnd());
    document.querySelectorAll('.cal-view-btn').forEach(b => {
      b.classList.toggle('is-active', b.dataset.view === state.view);
    });
    document.getElementById('cal-jump').value = iso(state.cursor);
  }
  document.getElementById('cal-prev')?.addEventListener('click', () => {
    if (state.view === 'day' || state.view === 'therapist') state.cursor = addDays(state.cursor, -1);
    else if (state.view === 'week') state.cursor = addDays(state.cursor, -7);
    else if (state.view === 'month') state.cursor = addMonths(state.cursor, -1);
    render();
  });
  document.getElementById('cal-next')?.addEventListener('click', () => {
    if (state.view === 'day' || state.view === 'therapist') state.cursor = addDays(state.cursor, 1);
    else if (state.view === 'week') state.cursor = addDays(state.cursor, 7);
    else if (state.view === 'month') state.cursor = addMonths(state.cursor, 1);
    render();
  });
  document.getElementById('cal-today')?.addEventListener('click', () => {
    state.cursor = startOfDay(new Date());
    render();
  });
  document.getElementById('cal-jump')?.addEventListener('change', e => {
    if (e.target.value) {
      const [y, m, d] = e.target.value.split('-').map(Number);
      state.cursor = new Date(y, m - 1, d);
      render();
    }
  });
  document.querySelectorAll('.cal-view-btn').forEach(b => {
    b.addEventListener('click', () => {
      state.view = b.dataset.view;
      render();
    });
  });

  /* ---- Filter chips ---- */
  function renderTherapistChips() {
    const wrap = document.getElementById('cal-filter-therapist');
    if (!wrap) return;
    const ts = getTherapists();
    // Preserve "All" chip + add one per therapist
    const html = ['<button class="cal-chip is-active" data-tval="all">All</button>']
      .concat(ts.map(t => `<button class="cal-chip" data-tval="${(t.name || '').replace(/"/g,'&quot;')}">${t.name || '—'}</button>`));
    wrap.innerHTML = html.join('');
    wrap.querySelectorAll('.cal-chip').forEach(c => {
      c.classList.toggle('is-active', c.dataset.tval === state.filterTherapist);
      c.addEventListener('click', () => {
        state.filterTherapist = c.dataset.tval;
        wrap.querySelectorAll('.cal-chip').forEach(x => x.classList.toggle('is-active', x === c));
        render();
      });
    });
  }
  document.querySelectorAll('#cal-filter-status .cal-chip').forEach(c => {
    c.addEventListener('click', () => {
      state.filterStatus = c.dataset.sval;
      document.querySelectorAll('#cal-filter-status .cal-chip').forEach(x => x.classList.toggle('is-active', x === c));
      render();
    });
  });

  /* ---- Stats ---- */
  function updateStats() {
    const s = rangeStart(), e = rangeEnd();
    const all = getBookings().filter(b => {
      const d = b.date || '';
      return d >= iso(s) && d <= iso(e) && matchesFilter(b);
    });
    const ctx = state.view === 'day' || state.view === 'therapist' ? 'today'
              : state.view === 'week'  ? 'this week'
              : state.view === 'month' ? 'this month' : 'in range';
    document.getElementById('cal-stat-context').textContent = ctx;
    document.getElementById('cal-stat-bookings').textContent = all.length;
    document.getElementById('cal-stat-confirmed').textContent = all.filter(b => statusKey(b.status) === 'confirmed').length;
    document.getElementById('cal-stat-pending').textContent   = all.filter(b => statusKey(b.status) === 'pending').length;
    const revenue = all.filter(b => statusKey(b.status) !== 'cancelled')
                       .reduce((sum, b) => sum + (parseFloat(b.price) || 0), 0);
    document.getElementById('cal-stat-revenue').textContent = revenue.toFixed(2);

    // Occupancy = booked minutes / available minutes (active therapists × open hours)
    const therapists = getTherapists().filter(t => t.status === 'active' || !t.status);
    const days = Math.floor((e - s) / 86400000) + 1;
    const openMin = (HOURS_DEFAULT.close - HOURS_DEFAULT.open) * 60;
    const capacity = Math.max(1, therapists.length) * openMin * days;
    const used = all.filter(b => statusKey(b.status) !== 'cancelled')
                    .reduce((sum, b) => sum + durationMin(b), 0);
    const occ = Math.min(100, Math.round((used / capacity) * 100));
    document.getElementById('cal-stat-occupancy').textContent = occ + '%';
  }

  /* ---- Rendering ---- */
  function escapeHTML(s) {
    return String(s || '').replace(/[&<>"']/g, c =>
      ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]);
  }
  function bookingClass(b) {
    return 'cal-event cal-event--' + statusInfo(b.status).cls;
  }
  function renderEvent(b, layout) {
    const status = statusInfo(b.status);
    const stylePieces = [];
    if (layout.top    != null) stylePieces.push(`top:${layout.top}px`);
    if (layout.height != null) stylePieces.push(`height:${layout.height}px`);
    if (layout.left   != null) stylePieces.push(`left:${layout.left}`);
    if (layout.width  != null) stylePieces.push(`width:${layout.width}`);
    const style = stylePieces.length ? ` style="${stylePieces.join(';')}"` : '';
    return `
      <a href="admin-booking.html?id=${encodeURIComponent(b.id)}" class="${bookingClass(b)}"${style} data-id="${escapeHTML(b.id)}">
        <span class="cal-event__time">${fmtTime(b.time)} · ${durationMin(b)}m</span>
        <span class="cal-event__title">${escapeHTML(b.service || 'Treatment')}</span>
        <span class="cal-event__meta">${escapeHTML(b.name || 'Guest')} · ${escapeHTML(b.therapist || 'Any')}</span>
        <span class="cal-event__status">${status.label}</span>
      </a>`;
  }

  function buildHourGrid(open, close) {
    const rows = [];
    for (let h = open; h < close; h++) {
      rows.push(`<div class="cal-hour-row"><span class="cal-hour-label">${fmtTimeShort(h)}</span><div class="cal-hour-slot" data-hour="${h}"></div></div>`);
    }
    return `<div class="cal-hours">${rows.join('')}</div>`;
  }
  // pixel height per minute, used to layout events
  const PX_PER_MIN = 1.2;

  function renderDayView() {
    const day = state.cursor;
    const open = HOURS_DEFAULT.open, close = HOURS_DEFAULT.close;
    const dayBookings = getBookings()
      .filter(b => b.date === iso(day) && matchesFilter(b))
      .sort((a, b) => timeToMin(a.time) - timeToMin(b.time));

    // Simple overlap-column packing
    const cols = [];
    dayBookings.forEach(b => {
      const start = timeToMin(b.time);
      const end = start + durationMin(b);
      let placed = false;
      for (const col of cols) {
        if (col[col.length - 1].end <= start) {
          col.push({ b, start, end });
          placed = true; break;
        }
      }
      if (!placed) cols.push([{ b, start, end }]);
    });
    const colCount = Math.max(1, cols.length);

    const events = cols.flatMap((col, i) => col.map(({ b, start }) => {
      const top = (start - open * 60) * PX_PER_MIN;
      const height = Math.max(36, durationMin(b) * PX_PER_MIN - 4);
      return renderEvent(b, {
        top, height,
        left: `calc((100% - 56px) / ${colCount} * ${i} + 56px + 2px)`,
        width: `calc((100% - 56px) / ${colCount} - 4px)`
      });
    })).join('');

    root.innerHTML = `
      <div class="cal-day">
        <header class="cal-day-head">
          <div class="cal-day-head__name">${day.toLocaleDateString('en-US', { weekday: 'long' })}</div>
          <div class="cal-day-head__num">${day.getDate()}</div>
          <div class="cal-day-head__sub">${day.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
        </header>
        <div class="cal-day-body">
          ${buildHourGrid(open, close)}
          <div class="cal-events">${events}</div>
          ${nowLine(day, open, close)}
        </div>
      </div>`;
    wireSlotClicks(day);
  }

  function nowLine(day, open, close) {
    const now = new Date();
    if (iso(now) !== iso(day)) return '';
    const mins = now.getHours() * 60 + now.getMinutes();
    if (mins < open * 60 || mins > close * 60) return '';
    const top = (mins - open * 60) * PX_PER_MIN;
    return `<div class="cal-now-line" style="top:${top}px"><span class="cal-now-dot"></span></div>`;
  }

  function renderWeekView() {
    const open = HOURS_DEFAULT.open, close = HOURS_DEFAULT.close;
    const days = [];
    for (let i = 0; i < 7; i++) days.push(addDays(rangeStart(), i));

    const dayCols = days.map(d => {
      const dayBookings = getBookings()
        .filter(b => b.date === iso(d) && matchesFilter(b))
        .sort((a, b) => timeToMin(a.time) - timeToMin(b.time));
      const cols = [];
      dayBookings.forEach(b => {
        const start = timeToMin(b.time);
        const end = start + durationMin(b);
        let placed = false;
        for (const col of cols) {
          if (col[col.length - 1].end <= start) {
            col.push({ b, start, end });
            placed = true; break;
          }
        }
        if (!placed) cols.push([{ b, start, end }]);
      });
      const colCount = Math.max(1, cols.length);
      const events = cols.flatMap((col, i) => col.map(({ b, start }) => {
        const top = (start - open * 60) * PX_PER_MIN;
        const height = Math.max(28, durationMin(b) * PX_PER_MIN - 4);
        return renderEvent(b, {
          top, height,
          left: `calc(${(i * 100) / colCount}% + 1px)`,
          width: `calc(${100 / colCount}% - 3px)`
        });
      })).join('');
      const isToday = iso(d) === iso(new Date());
      return `
        <div class="cal-week-col${isToday ? ' is-today' : ''}" data-date="${iso(d)}">
          <header class="cal-week-col__head">
            <span class="cal-week-col__name">${d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            <span class="cal-week-col__num">${d.getDate()}</span>
          </header>
          <div class="cal-week-col__body">
            <div class="cal-events">${events}</div>
            ${nowLine(d, open, close)}
          </div>
        </div>`;
    }).join('');

    root.innerHTML = `
      <div class="cal-week">
        <div class="cal-week__hours">
          <div class="cal-week-col__head" aria-hidden="true">&nbsp;</div>
          ${buildHourGrid(open, close).replace('cal-hours', 'cal-hours cal-hours--rail')}
        </div>
        <div class="cal-week__cols">${dayCols}</div>
      </div>`;
    root.querySelectorAll('.cal-week-col').forEach(col => {
      col.addEventListener('click', e => {
        if (e.target.closest('.cal-event')) return;
        const date = col.dataset.date;
        location.href = 'admin-new-booking.html?date=' + date;
      });
    });
  }

  function renderMonthView() {
    const month = state.cursor;
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    // Saturday-first
    const offset = (first.getDay() + 1) % 7;
    const gridStart = addDays(first, -offset);
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = addDays(gridStart, i);
      const inMonth = d.getMonth() === month.getMonth();
      const isToday = iso(d) === iso(new Date());
      const dayBookings = getBookings()
        .filter(b => b.date === iso(d) && matchesFilter(b))
        .sort((a, b) => timeToMin(a.time) - timeToMin(b.time));
      const shown = dayBookings.slice(0, 3);
      const more = dayBookings.length - shown.length;
      const eventList = shown.map(b => `
        <a href="admin-booking.html?id=${encodeURIComponent(b.id)}" class="cal-month-event cal-event--${statusInfo(b.status).cls}" title="${escapeHTML(b.time)} · ${escapeHTML(b.service)} · ${escapeHTML(b.name)}">
          <span class="cal-month-event__time">${fmtTime(b.time)}</span>
          <span class="cal-month-event__name">${escapeHTML(b.service || '')}</span>
        </a>`).join('');
      cells.push(`
        <div class="cal-month-cell${inMonth ? '' : ' is-out'}${isToday ? ' is-today' : ''}" data-date="${iso(d)}">
          <header class="cal-month-cell__head">
            <span class="cal-month-cell__num">${d.getDate()}</span>
            ${dayBookings.length ? `<span class="cal-month-cell__count">${dayBookings.length}</span>` : ''}
          </header>
          <div class="cal-month-cell__events">
            ${eventList}
            ${more > 0 ? `<span class="cal-month-cell__more">+${more} more</span>` : ''}
          </div>
        </div>`);
    }
    root.innerHTML = `
      <div class="cal-month">
        <div class="cal-month__dow">
          ${['Sat','Sun','Mon','Tue','Wed','Thu','Fri'].map(d => `<span>${d}</span>`).join('')}
        </div>
        <div class="cal-month__grid">${cells.join('')}</div>
      </div>`;
    root.querySelectorAll('.cal-month-cell').forEach(c => {
      c.addEventListener('click', e => {
        if (e.target.closest('a')) return;
        // Jump to day view of that date
        const [y, m, d] = c.dataset.date.split('-').map(Number);
        state.cursor = new Date(y, m - 1, d);
        state.view = 'day';
        render();
      });
    });
  }

  function renderTherapistView() {
    const day = state.cursor;
    const open = HOURS_DEFAULT.open, close = HOURS_DEFAULT.close;
    // Show ALL configured therapists. Mark off/inactive ones visually but
    // still render their lane so prior bookings are visible. We only hide
    // when the user has applied a therapist filter that excludes someone.
    const allTherapists = getTherapists();
    const therapists = allTherapists.filter(t =>
      state.filterTherapist === 'all' || t.name === state.filterTherapist);

    if (!allTherapists.length) {
      root.innerHTML = `<div class="cal-empty"><i class="fas fa-user-md"></i><p>No therapists configured. Add them in <a href="#sg-therapist">Settings → Therapists</a>.</p></div>`;
      return;
    }
    if (!therapists.length) {
      root.innerHTML = `<div class="cal-empty"><i class="fas fa-filter"></i><p>No therapists match the current filter. <a href="#" id="cal-clear-tfilter">Show all</a>.</p></div>`;
      root.querySelector('#cal-clear-tfilter')?.addEventListener('click', e => {
        e.preventDefault();
        state.filterTherapist = 'all';
        document.querySelectorAll('#cal-filter-therapist .cal-chip').forEach(x => x.classList.toggle('is-active', x.dataset.tval === 'all'));
        render();
      });
      return;
    }
    // Sort: active first, then off / on-leave
    const isActive = t => {
      const s = (t.status || '').toLowerCase();
      return s === '' || s === 'active' || s === 'available' || s === 'on';
    };
    therapists.sort((a, b) => {
      if (isActive(a) === isActive(b)) return (a.name || '').localeCompare(b.name || '');
      return isActive(a) ? -1 : 1;
    });

    const dayBookings = getBookings().filter(b => b.date === iso(day) && matchesFilter(b));
    const hourLabels = [];
    for (let h = open; h < close; h++) hourLabels.push(`<div class="cal-th-hour"><span>${fmtTimeShort(h)}</span></div>`);
    const HOUR_PX = 80; // width per hour in timeline

    const rows = therapists.map(t => {
      const active = isActive(t);
      const tFirst = (t.name || '').split(' ')[0].toLowerCase();
      const tFull  = (t.name || '').toLowerCase();
      const events = dayBookings
        .filter(b => {
          const bt = (b.therapist || '').toLowerCase();
          return bt === tFull || bt.startsWith(tFirst + ' ') || bt === tFirst;
        })
        .map(b => {
          const start = timeToMin(b.time);
          const left = ((start - open * 60) / 60) * HOUR_PX;
          const width = Math.max(60, (durationMin(b) / 60) * HOUR_PX - 4);
          return renderEvent(b, { left: left + 'px', width: width + 'px', top: 6, height: 56 });
        }).join('');
      const specialty = (Array.isArray(t.specialties) && t.specialties[0])
                     || (typeof t.specialty === 'string' && t.specialty)
                     || (t.role)
                     || 'Therapist';
      const statusLabel = active ? '' :
        `<span class="cal-th-name__status">${escapeHTML((t.status || 'OFF').toUpperCase())}</span>`;
      return `
        <div class="cal-th-row${active ? '' : ' is-off'}">
          <div class="cal-th-name">
            <div class="cal-th-name__av">${(t.name || '—').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase()}</div>
            <div>
              <strong>${escapeHTML(t.name || '—')}</strong>
              <small>${escapeHTML(specialty)}${statusLabel}</small>
            </div>
          </div>
          <div class="cal-th-lane" data-therapist="${escapeHTML(t.name || '')}">
            ${events}
            ${!active && !events ? '<div class="cal-th-lane__off"><i class="fas fa-power-off"></i> Unavailable</div>' : ''}
          </div>
        </div>`;
    }).join('');

    root.innerHTML = `
      <div class="cal-therapists">
        <div class="cal-th-header">
          <div class="cal-th-name cal-th-name--head">Therapist</div>
          <div class="cal-th-hours">${hourLabels.join('')}</div>
        </div>
        <div class="cal-th-body">${rows}</div>
      </div>`;
    // Lane click → new booking with date + therapist + approx time
    root.querySelectorAll('.cal-th-lane').forEach(lane => {
      lane.addEventListener('click', e => {
        if (e.target.closest('.cal-event')) return;
        const rect = lane.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const hourOffset = Math.max(0, Math.floor(x / HOUR_PX));
        const hh = String(open + hourOffset).padStart(2, '0');
        location.href = `admin-new-booking.html?date=${iso(day)}&time=${hh}:00&therapist=${encodeURIComponent(lane.dataset.therapist)}`;
      });
    });
  }

  function wireSlotClicks(day) {
    root.querySelectorAll('[data-hour]').forEach(slot => {
      slot.addEventListener('click', e => {
        if (e.target.closest('.cal-event')) return;
        const hh = String(slot.dataset.hour).padStart(2, '0');
        location.href = `admin-new-booking.html?date=${iso(day)}&time=${hh}:00`;
      });
    });
  }

  /* ---- Main render ---- */
  function render() {
    updateToolbar();
    updateStats();
    if (state.view === 'day')        renderDayView();
    else if (state.view === 'week')  renderWeekView();
    else if (state.view === 'month') renderMonthView();
    else if (state.view === 'therapist') renderTherapistView();
  }

  renderTherapistChips();
  render();

  // Re-render when the user comes back to the calendar tab
  document.querySelectorAll('.admin-side__nav a[data-tab="calendar"], a[data-tab="calendar"]').forEach(a => {
    a.addEventListener('click', () => setTimeout(render, 60));
  });
}
