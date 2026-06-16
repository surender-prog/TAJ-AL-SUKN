/* Taj Al Sukun — Record Payment (full-page view)
   ============================================================
   URL: admin-payment.html?id=<booking id>
   Reads the booking, computes the invoice total, lets the user
   capture payment details for one of five methods, and persists
   the payment back to localStorage (taj-bookings + taj-activity).
*/

if (sessionStorage.getItem('taj-admin-auth') !== '1') {
  location.replace('admin-login.html');
}

const fmt = (window.TajFmt) || {};
const VAT_RATE = (() => {
  try {
    const t = JSON.parse(localStorage.getItem('taj-tax') || 'null');
    return t && t.enabled ? (parseFloat(t.vat) / 100) : 0.10;
  } catch (_) { return 0.10; }
})();

/* ============================================================
   1. Load booking
   ============================================================ */
const qp = new URLSearchParams(location.search);
const bookingId = qp.get('id') || qp.get('bookingId');

function loadBookings() {
  try { return JSON.parse(localStorage.getItem('taj-bookings') || '[]') || []; }
  catch (_) { return []; }
}
function saveBookings(list) {
  localStorage.setItem('taj-bookings', JSON.stringify(list));
}

let bookings = loadBookings();
let booking = bookings.find(b => b.id === bookingId) || null;

// Demo fallback so the page never shows NaN — useful in approval / preview mode
if (!booking) {
  booking = {
    id: bookingId || 'BK-2026-0091',
    name: 'Aisha Al Mansour',
    phone: '+973 39112233',
    email: 'aisha@example.com',
    service: 'Royal Hammam Ritual',
    therapist: 'Layla',
    date: '2026-05-22',
    time: '14:00',
    duration: 90,
    price: 65,
    status: 'pending',
    tier: 'Gold',
    memberId: 'MBR-001',
    discount: { type: 'tier', percent: 15, value: 9.75 }
  };
}

/* ============================================================
   2. Compute amounts (the fix for NaN)
   ============================================================ */
function computeAmounts(b) {
  // Service price (already member-discounted in some flows, otherwise raw)
  const basePrice = parseFloat(b.price) || parseFloat(b.total) || 0;

  // Discount — can be on b.discount {percent,value} or a flat field
  let discount = 0;
  if (b.discount && typeof b.discount === 'object') {
    discount = parseFloat(b.discount.value) || 0;
    // If only percent stored, compute it
    if (!discount && b.discount.percent) {
      discount = basePrice * (parseFloat(b.discount.percent) / 100);
    }
  } else if (typeof b.discount === 'number') {
    discount = b.discount;
  }

  const subtotal = Math.max(0, basePrice - discount);
  const tax = subtotal * VAT_RATE;
  const total = subtotal + tax;

  return {
    basePrice,
    discount,
    subtotal,
    tax,
    total
  };
}

let amounts = computeAmounts(booking);
let tipAmount = 0;
let cashReceived = 0;
let selectedMethod = 'cash';

/* ============================================================
   3. Render — header, hero, receipt preview, footer
   ============================================================ */
function bhd(n) {
  const v = parseFloat(n) || 0;
  return v.toFixed(3) + ' BHD';
}
function setText(id, v) {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
}

function generateReceiptNo() {
  const yr = new Date().getFullYear();
  const seq = (loadBookings().filter(b => b.payment).length + 1).toString().padStart(4, '0');
  return `RCP-${yr}-${seq}`;
}

const receiptNo = booking.payment?.receiptNo || generateReceiptNo();
const invoiceNo = booking.invoice?.number || ('INV-' + (booking.id || '').replace(/^BK-/, ''));

function renderStatic() {
  // Crumb / header
  setText('crumb-inv', invoiceNo);
  document.getElementById('crumb-inv-link').href = `admin-invoice.html?id=${booking.id}`;
  document.getElementById('back-to-invoice').href = `admin-invoice.html?id=${booking.id}`;
  document.getElementById('cancel-payment').href = `admin-invoice.html?id=${booking.id}`;

  // Hero amount + invoice info
  setText('pay-amount-display', bhd(amounts.total));
  setText('pay-doc-number', invoiceNo);
  setText('pay-guest-name', booking.name || 'Guest');

  // Hero breakdown
  setText('pay-bd-subtotal', bhd(amounts.basePrice));
  setText('pay-bd-discount', amounts.discount > 0 ? '− ' + bhd(amounts.discount) : bhd(0));
  setText('pay-bd-tax', bhd(amounts.tax));
  setText('pay-bd-total', bhd(amounts.total));

  // Receipt preview
  setText('sum-receipt-no', receiptNo);
  setText('sum-invoice-no', invoiceNo);
  setText('sum-guest', booking.name || '—');
  const sumServiceMeta =
    `<small>${escapeHTML(booking.date || '')} · ${escapeHTML(booking.time || '')} · ${escapeHTML(booking.therapist || 'Therapist')}</small>`;
  const invItems = booking.invoice?.items;
  if (invItems && invItems.length) {
    // Itemized display for multi-service bookings. Display-only — money totals
    // still come from the existing single fields (price / invoice.total).
    document.getElementById('sum-service').innerHTML =
      invItems.map(it => {
        const qty = parseFloat(it.qty) || 1;
        const qtyLabel = qty > 1 ? ` × ${qty}` : '';
        const lineAmt = it.comp ? 'Complimentary' : bhd(it.lineTotal);
        const sub = it.dur ? escapeHTML(it.dur) : '';
        return `<div class="sum-line-item"><strong>${escapeHTML(it.name || 'Treatment')}${qtyLabel}</strong>` +
          `<span class="sum-line-amt">${lineAmt}</span>` +
          (sub ? `<small>${sub}</small>` : '') + `</div>`;
      }).join('') + sumServiceMeta;
  } else {
    document.getElementById('sum-service').innerHTML =
      `<strong>${escapeHTML(booking.service || 'Treatment')}</strong>` +
      sumServiceMeta;
  }

  setText('sum-subtotal', bhd(amounts.basePrice));
  if (amounts.discount > 0) {
    document.getElementById('sum-discount-row').hidden = false;
    setText('sum-discount', '− ' + bhd(amounts.discount));
  }
  setText('sum-tax', bhd(amounts.tax));
  setText('sum-total', bhd(amounts.total));

  // Receipt number field (editable but pre-filled)
  document.getElementById('receipt-no').value = receiptNo;

  // Datetime now
  const dt = new Date();
  dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
  document.getElementById('pay-when').value = dt.toISOString().slice(0, 16);

  // Footer total
  setText('footer-amount', bhd(amounts.total));

  // Cash fields default
  document.getElementById('cash-received').value = amounts.total.toFixed(3);
  cashReceived = amounts.total;
  document.getElementById('cash-change').value = '0.000';
  renderCashSummary();
  renderQuickCash();

  // Receipt "when"
  setText('sum-when', new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }));
}

function renderQuickCash() {
  const total = amounts.total;
  const container = document.getElementById('quick-cash-buttons');
  if (!container) return;
  // Round-up suggestions: exact, +5, next 5, next 10, +20
  const exact = total;
  const plus5 = total + 5;
  const next5 = Math.ceil(total / 5) * 5;
  const next10 = Math.ceil(total / 10) * 10;
  const buttons = [
    { label: 'Exact (' + total.toFixed(3) + ')', val: exact },
    { label: '+5 BHD', val: plus5 },
    { label: 'Next 5 (' + next5.toFixed(0) + ')', val: next5 },
    { label: 'Next 10 (' + next10.toFixed(0) + ')', val: next10 },
    { label: '+20 BHD', val: total + 20 },
  ].filter((b, i, arr) => arr.findIndex(x => Math.abs(x.val - b.val) < 0.005) === i);
  container.innerHTML = buttons.map(b =>
    `<button type="button" class="pay-quick-btn" data-val="${b.val}">${b.label}</button>`
  ).join('');
  container.querySelectorAll('[data-val]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('cash-received').value = parseFloat(btn.dataset.val).toFixed(3);
      cashReceived = parseFloat(btn.dataset.val);
      onCashInput();
    });
  });
}

function renderCashSummary() {
  const cs = document.getElementById('cash-summary');
  if (!cs) return;
  const total = amounts.total + tipAmount;
  const change = Math.max(0, cashReceived - total);
  const short = Math.max(0, total - cashReceived);
  if (cashReceived === 0) {
    cs.innerHTML = '';
    return;
  }
  if (short > 0) {
    cs.innerHTML = `<div class="pay-cash-short"><i class="fas fa-exclamation-triangle"></i> Short by <strong>${bhd(short)}</strong> — please collect the remaining amount.</div>`;
  } else if (change > 0) {
    cs.innerHTML = `<div class="pay-cash-change"><i class="fas fa-coins"></i> Hand back <strong>${bhd(change)}</strong> as change.</div>`;
  } else {
    cs.innerHTML = `<div class="pay-cash-exact"><i class="fas fa-check-circle"></i> Exact amount — no change due.</div>`;
  }
}

function escapeHTML(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[c]);
}

/* ============================================================
   4. Interactions
   ============================================================ */

// Method picker
document.querySelectorAll('.pay-method-tile').forEach(tile => {
  tile.addEventListener('click', () => {
    document.querySelectorAll('.pay-method-tile').forEach(t => t.classList.remove('selected'));
    tile.classList.add('selected');
    selectedMethod = tile.dataset.method;
    document.querySelectorAll('.pay-detail').forEach(d => d.classList.remove('show'));
    document.getElementById('pay-detail-' + selectedMethod).classList.add('show');
    updateReceiptMethod();
  });
});

function updateReceiptMethod() {
  const cfg = {
    cash:    { name: 'Cash',          icon: 'fas fa-money-bill-wave', detail: 'Paid at reception' },
    card:    { name: 'Card',          icon: 'far fa-credit-card',     detail: 'POS terminal' },
    benefit: { name: 'BenefitPay',    icon: 'fas fa-mobile-alt',       detail: 'Bahrain wallet' },
    bank:    { name: 'Bank Transfer', icon: 'fas fa-university',       detail: 'IBAN settlement' },
    apple:   { name: 'Apple Pay',     icon: 'fab fa-apple-pay',        detail: 'Touch / Face ID' }
  };
  const c = cfg[selectedMethod] || cfg.cash;
  document.getElementById('sum-method-icon').className = c.icon;
  setText('sum-method-name', c.name);
  setText('sum-method-detail', c.detail);
}

// Cash input
function onCashInput() {
  cashReceived = parseFloat(document.getElementById('cash-received').value) || 0;
  const change = Math.max(0, cashReceived - (amounts.total + tipAmount));
  document.getElementById('cash-change').value = change.toFixed(3);
  renderCashSummary();
  if (selectedMethod === 'cash') {
    document.getElementById('sum-change-row').hidden = !(change > 0);
    setText('sum-change', bhd(change));
  }
}
document.getElementById('cash-received').addEventListener('input', onCashInput);

// Tip toggle + presets
const tipToggle = document.getElementById('toggle-tip');
const tipBody = document.getElementById('tip-body');
const tipInput = document.getElementById('tip-amount');
tipToggle.addEventListener('change', () => {
  tipBody.classList.toggle('show', tipToggle.checked);
  if (!tipToggle.checked) { tipInput.value = 0; applyTip(0); }
});
document.querySelectorAll('.pay-tip-btn').forEach(b => {
  b.addEventListener('click', () => {
    const t = b.dataset.tip;
    if (t === 'custom') { tipInput.focus(); return; }
    const pct = parseFloat(t);
    const amt = amounts.basePrice * (pct / 100);
    tipInput.value = amt.toFixed(3);
    applyTip(amt);
  });
});
tipInput.addEventListener('input', () => applyTip(parseFloat(tipInput.value) || 0));

function applyTip(amt) {
  tipAmount = Math.max(0, parseFloat(amt) || 0);
  const grand = amounts.total + tipAmount;
  setText('pay-amount-display', bhd(grand));
  setText('footer-amount', bhd(grand));
  setText('sum-total', bhd(grand));
  if (tipAmount > 0) {
    document.getElementById('sum-tip-row').hidden = false;
    setText('sum-tip', '+ ' + bhd(tipAmount));
  } else {
    document.getElementById('sum-tip-row').hidden = true;
  }
  // Update cash received default and re-evaluate
  if (parseFloat(document.getElementById('cash-received').value) < grand) {
    document.getElementById('cash-received').value = grand.toFixed(3);
    cashReceived = grand;
  }
  onCashInput();
  renderQuickCash();
}

// Split toggle
const splitToggle = document.getElementById('toggle-split');
const splitBody = document.getElementById('split-body');
splitToggle.addEventListener('change', () => {
  splitBody.classList.toggle('show', splitToggle.checked);
});

/* ============================================================
   5. Submit / Save
   ============================================================ */
function buildPaymentRecord(fd) {
  const method = fd.get('method');
  const payment = {
    method,
    methodLabel: methodLabel(method),
    amount: amounts.total + tipAmount,
    tipAmount,
    tipTo: fd.get('tip_to') || null,
    paidAt: fd.get('paid_at') ? new Date(fd.get('paid_at')).toISOString() : new Date().toISOString(),
    cashier: fd.get('cashier') || 'Admin',
    notes: fd.get('payment_notes') || null,
    receiptNo: fd.get('receipt_no') || receiptNo,
    delivery: fd.get('receipt_delivery') || 'whatsapp'
  };

  if (method === 'cash') {
    payment.received = parseFloat(fd.get('cash_received') || 0);
    payment.change = Math.max(0, payment.received - payment.amount);
  } else if (method === 'card') {
    payment.cardType = fd.get('card_type');
    payment.cardLast4 = fd.get('card_last4');
    payment.authCode = fd.get('card_auth');
    payment.terminal = fd.get('card_terminal');
    payment.cardHolder = fd.get('card_holder');
  } else if (method === 'benefit') {
    payment.reference = fd.get('benefit_ref');
    payment.senderPhone = fd.get('benefit_phone');
    payment.senderName = fd.get('benefit_name');
    payment.notesExtra = fd.get('benefit_notes');
  } else if (method === 'bank') {
    payment.bankName = fd.get('bank_name');
    payment.reference = fd.get('bank_ref');
    payment.settlementDate = fd.get('bank_date');
    payment.iban = fd.get('bank_iban');
    payment.notesExtra = fd.get('bank_notes');
  } else if (method === 'apple') {
    payment.transactionId = fd.get('apple_id');
    payment.device = fd.get('apple_device');
    payment.underlyingCard = fd.get('apple_card');
  }

  if (splitToggle.checked && fd.get('split_method')) {
    payment.split = {
      method: fd.get('split_method'),
      methodLabel: methodLabel(fd.get('split_method')),
      amount: parseFloat(fd.get('split_amount') || 0)
    };
  }
  return payment;
}

function methodLabel(m) {
  return ({ cash: 'Cash', card: 'Card', benefit: 'BenefitPay', bank: 'Bank Transfer', apple: 'Apple Pay' })[m] || m;
}

document.getElementById('payment-form').addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const method = fd.get('method');

  // Per-method validation
  if (method === 'cash') {
    const received = parseFloat(fd.get('cash_received') || 0);
    if (received < (amounts.total + tipAmount)) {
      alert('Cash received cannot be less than the total due.');
      return;
    }
  }
  if (method === 'card' && (!fd.get('card_last4') || fd.get('card_last4').length !== 4)) {
    if (!confirm('No card last-4 entered. Continue anyway?')) return;
  }
  if (method === 'benefit' && !fd.get('benefit_ref')) {
    if (!confirm('No BenefitPay reference entered. Continue anyway?')) return;
  }
  if (method === 'bank' && !fd.get('bank_ref')) {
    if (!confirm('No bank reference entered. Continue anyway?')) return;
  }

  const payment = buildPaymentRecord(fd);

  // Disable submit while saving
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalLabel = submitBtn ? submitBtn.innerHTML : null;
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';
  }

  // Build the updated booking record. We merge the existing booking with the
  // new payment fields. paymentMethod (camelCase) is translated to
  // payment_method by the data-layer's toBooking().
  const wasPending = (booking.status === 'new' || booking.status === 'pending');
  const updated = Object.assign({}, booking, {
    payment,
    paymentMethod: payment.methodLabel,
    paid: true,
    paidAt: payment.paidAt,
    status: wasPending ? 'confirmed' : (booking.status || 'confirmed')
  });

  // Persist via the data layer (Supabase + LS mirror) with offline fallback
  try {
    if (window.TajData) {
      await TajData.bookings.upsert(updated);
      await TajData.activity.log({
        type: 'payment',
        title: `Payment received: ${booking.name}`,
        desc:  `${booking.service} · ${bhd(payment.amount)} via ${payment.methodLabel}`,
        ref:   booking.id,
        refType: 'booking'
      });
    } else {
      bookings = loadBookings();
      const idx = bookings.findIndex(b => b.id === booking.id);
      if (idx >= 0) { bookings[idx] = updated; saveBookings(bookings); }
      else { bookings.unshift(updated); saveBookings(bookings); }
      if (window.TajLog) {
        TajLog.add({
          type: 'payment',
          title: `Payment received: ${booking.name}`,
          desc:  `${booking.service} · ${bhd(payment.amount)} via ${payment.methodLabel}`,
          ref:   booking.id,
          refType: 'booking'
        });
      }
    }
  } catch (err) {
    console.warn('[payment] save failed:', err);
    bookings = loadBookings();
    const idx = bookings.findIndex(b => b.id === booking.id);
    if (idx >= 0) { bookings[idx] = updated; saveBookings(bookings); }
    else { bookings.unshift(updated); saveBookings(bookings); }
  }

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalLabel || 'Confirm Payment & Issue Receipt';
  }

  // Status pill + redirect
  const pill = document.getElementById('pay-status-pill');
  pill.classList.add('is-paid');
  pill.innerHTML = '<i class="fas fa-check-circle"></i> Paid — Receipt ' + payment.receiptNo;

  if (typeof showToast === 'function') showToast('Payment recorded — receipt issued');
  setTimeout(() => {
    location.href = `admin-invoice.html?id=${booking.id}`;
  }, 1200);
});

// Save as Draft
document.getElementById('save-draft').addEventListener('click', () => {
  const fd = new FormData(document.getElementById('payment-form'));
  bookings = loadBookings();
  const idx = bookings.findIndex(b => b.id === booking.id);
  if (idx >= 0) {
    bookings[idx].paymentDraft = buildPaymentRecord(fd);
    saveBookings(bookings);
  }
  if (typeof showToast === 'function') showToast('Draft saved');
});

/* showToast fallback if admin-shared.js's helper isn't there */
function showToast(msg) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.style.cssText = 'position:fixed; bottom:30px; left:50%; transform:translateX(-50%); background:#2A1810; color:#D4B896; padding:14px 28px; border-radius:999px; font-size:0.86rem; letter-spacing:0.04em; z-index:9999; box-shadow:0 8px 24px rgba(0,0,0,0.3); opacity:0; transition:opacity .2s ease;';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = 1;
  setTimeout(() => { el.style.opacity = 0; }, 2200);
}
window.showToast = window.showToast || showToast;

/* ============================================================
   6. Boot
   ============================================================ */
renderStatic();
updateReceiptMethod();
