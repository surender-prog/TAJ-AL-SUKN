/* Taj Al Sukun — Admin Invoice (full page) */

if (sessionStorage.getItem('taj-admin-auth') !== '1') {
  location.replace('admin-login.html');
}

const VAT_RATE = 0.10;
const params = new URLSearchParams(location.search);
const bookingId = params.get('id');

let bookings = JSON.parse(localStorage.getItem('taj-bookings') || 'null');
if (!bookings) {
  // Fall back to empty if admin hasn't viewed bookings yet
  bookings = [];
}

const booking = bookings.find(b => b.id === bookingId);
if (!booking) {
  document.querySelector('.invoice-page').innerHTML = `
    <div style="text-align:center; padding: 80px 30px;">
      <i class="fas fa-receipt" style="font-size: 60px; color: var(--c-copper); margin-bottom: 20px;"></i>
      <h2 style="font-family: var(--f-display); font-weight: 500; margin-bottom: 10px;">Booking not found</h2>
      <p style="color: var(--c-text-soft); margin-bottom: 30px;">The booking ID <code style="font-family: monospace; color: var(--c-copper);">${bookingId || '(none)'}</code> doesn't exist in this admin account.</p>
      <a href="admin.html#bookings" class="btn btn--primary"><i class="fas fa-arrow-left"></i> Back to Bookings</a>
    </div>
  `;
  throw new Error('Booking not found');
}

function persist() {
  localStorage.setItem('taj-bookings', JSON.stringify(bookings));
}

function fmtMoney(n) {
  const v = Number(n);
  return (isFinite(v) ? v : 0).toFixed(3) + ' BHD';
}
function fmtFullDate(d) {
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
function tierDiscountPct(tier) {
  return ({ Silver: 10, Gold: 15, Platinum: 20 })[tier] || 0;
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

// Initialize invoice if missing
if (!booking.invoice) {
  booking.invoice = {
    number: 'INV-' + booking.id.replace('BK-', ''),
    issued: new Date().toISOString().split('T')[0],
    extraDiscount: { type: null, value: 0, reason: null }
  };
  persist();
}

function render() {
  const isPaid = booking.paid;
  const isReceipt = isPaid;

  // Service unit price (reverse from total which already has member disc).
  // Guard against legacy/incomplete rows where booking.total is missing —
  // otherwise every downstream calc cascades to NaN and the invoice
  // displays "NaN BHD" everywhere.
  const baseTotal = Number(booking.total) || 0;
  const memberDiscPct = tierDiscountPct(booking.tier);
  const unitPrice = memberDiscPct > 0
    ? +(baseTotal / (1 - memberDiscPct / 100)).toFixed(3)
    : baseTotal;
  const subtotal = unitPrice;
  const memberDisc = memberDiscPct > 0 ? +(subtotal * memberDiscPct / 100).toFixed(3) : 0;

  const ed = booking.invoice.extraDiscount || { type: null, value: 0 };
  let extraDisc = 0;
  if (ed.type === 'percent' && ed.value > 0) {
    extraDisc = +((subtotal - memberDisc) * ed.value / 100).toFixed(3);
  } else if (ed.type === 'fixed' && ed.value > 0) {
    extraDisc = +Math.min(ed.value, subtotal - memberDisc).toFixed(3);
  }

  const beforeTax = subtotal - memberDisc - extraDisc;
  const tax = +(beforeTax * VAT_RATE).toFixed(3);
  const total = +(beforeTax + tax).toFixed(3);

  booking.invoice.total = total;
  persist();

  // Update document elements
  document.getElementById('page-title').textContent = isReceipt ? 'Receipt' : 'Invoice';
  document.getElementById('page-sub').textContent = isReceipt
    ? 'Payment confirmed. Print, send, or download for your records.'
    : 'Apply discount, mark as paid, or send to the guest.';
  document.title = (isReceipt ? 'Receipt' : 'Invoice') + ' — Taj Al Sukun Admin';

  document.getElementById('inv-type').textContent = isReceipt ? 'Receipt' : 'Invoice';
  const docNo = isReceipt ? booking.invoice.number.replace('INV-', 'RCP-') : booking.invoice.number;
  document.getElementById('inv-no').textContent = docNo;
  document.getElementById('crumb-id').textContent = docNo;
  document.getElementById('inv-date').textContent = 'Issued ' + fmtFullDate(booking.invoice.issued);

  const statusBadge = document.getElementById('inv-status-badge');
  statusBadge.className = 'inv-status ' + (isPaid ? 'paid' : 'unpaid');
  statusBadge.textContent = isPaid ? 'Paid' : 'Unpaid';

  document.getElementById('inv-guest-name').textContent = booking.name;
  document.getElementById('inv-guest-info').innerHTML = (booking.phone || '—') +
    '<br>Booking ' + booking.id + ' · ' + fmtFullDate(booking.date) + ' · ' + fmtTime(booking.time);

  document.getElementById('inv-items').innerHTML = `
    <tr>
      <td>
        <strong>${booking.service}</strong>
        <small>${booking.tier ? booking.tier + ' member rate applied' : 'Standard rate'}</small>
      </td>
      <td>${getServiceDuration(booking.service)}</td>
      <td class="r">1</td>
      <td class="r">${fmtMoney(unitPrice)}</td>
      <td class="r"><strong>${fmtMoney(subtotal)}</strong></td>
    </tr>
  `;

  document.getElementById('inv-subtotal').textContent = fmtMoney(subtotal);

  const memberRow = document.getElementById('inv-member-disc-row');
  if (memberDisc > 0) {
    memberRow.style.display = '';
    document.getElementById('inv-member-disc-label').textContent =
      booking.tier + ' Member Discount (' + memberDiscPct + '%)';
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

  // Payment block (only on receipt) — rich rendering by method
  const payBlock = document.getElementById('inv-payment');
  if (isPaid) {
    payBlock.style.display = '';
    renderPaymentBlock(booking, total);
  } else {
    payBlock.style.display = 'none';
  }

  // Mark Paid button
  const mpBtn = document.getElementById('mark-paid');
  mpBtn.innerHTML = isPaid
    ? '<i class="fas fa-undo"></i> Mark as Unpaid'
    : '<i class="fas fa-check-circle"></i> Mark as Paid';
  mpBtn.className = isPaid ? 'btn btn--outline' : 'btn btn--gold';
  mpBtn.style.padding = '13px 24px';
  mpBtn.style.fontSize = '0.72rem';

  // WhatsApp / Email links
  const lines = [
    `*${isReceipt ? 'Receipt' : 'Invoice'}* — ${docNo}`,
    `Service: ${booking.service} (${getServiceDuration(booking.service)})`,
    `Date: ${fmtFullDate(booking.date)} · ${fmtTime(booking.time)}`,
    '',
    `Subtotal: ${fmtMoney(subtotal)}`,
  ];
  if (memberDisc > 0) lines.push(`${booking.tier} Discount (${memberDiscPct}%): −${fmtMoney(memberDisc)}`);
  if (extraDisc > 0) lines.push(`${ed.reason || 'Discount'}: −${fmtMoney(extraDisc)}`);
  lines.push(`VAT (10%): ${fmtMoney(tax)}`);
  lines.push(`*Total ${isPaid ? 'Paid' : 'Due'}: ${fmtMoney(total)}*`);
  lines.push('');
  lines.push('Thank you for choosing Taj Al Sukun.');

  const waMsg = encodeURIComponent(lines.join('\n'));
  const phone = (booking.phone || '').replace(/\D/g, '');
  document.getElementById('inv-wa').href = phone ? `https://wa.me/${phone}?text=${waMsg}` : '#';

  const subject = encodeURIComponent(`${isReceipt ? 'Payment Receipt' : 'Invoice'} from Taj Al Sukun — ${docNo}`);
  const body = encodeURIComponent(lines.join('\n'));
  document.getElementById('inv-email').href = `mailto:?subject=${subject}&body=${body}`;
}

/* Discount panel toggle */
document.getElementById('inv-discount-head')?.addEventListener('click', () => {
  document.getElementById('inv-discount-panel').classList.toggle('open');
});

/* Apply discount */
document.getElementById('apply-discount')?.addEventListener('click', () => {
  const type = document.getElementById('disc-type').value;
  const reason = document.getElementById('disc-reason').value;
  const value = parseFloat(document.getElementById('disc-value').value || 0);
  if (value <= 0) { alert('Enter a discount amount greater than 0.'); return; }
  if (type === 'percent' && value > 100) { alert('Percentage cannot exceed 100.'); return; }
  booking.invoice.extraDiscount = { type, value, reason };
  persist();
  render();
  document.getElementById('disc-value').value = '';
  document.getElementById('inv-discount-panel').classList.remove('open');
  showToast('Discount applied');
});

/* Mark as paid → opens payment modal first (or reverses if already paid) */
document.getElementById('mark-paid')?.addEventListener('click', () => {
  if (booking.paid) {
    if (!confirm('Reverse this payment? The receipt will revert back to an invoice.')) return;
    booking.paid = false;
    delete booking.paidAt;
    delete booking.payment;
    persist();
    render();
    showToast('Reverted to Unpaid');
    return;
  }
  // Open the full-page payment view (replaces the legacy modal).
  location.href = 'admin-payment.html?id=' + encodeURIComponent(booking.id);
});

/* ---------- Payment capture modal ---------- */
function openPaymentModal() {
  // Pre-fill total + doc number
  const totalText = document.getElementById('inv-total').textContent;
  document.getElementById('pay-modal-amt').textContent = totalText;
  document.getElementById('pay-modal-doc').textContent = booking.invoice.number;

  // Pre-fill cash received with the total
  const totalNum = parseFloat(totalText);
  document.getElementById('cash-received').value = totalNum.toFixed(3);
  document.getElementById('cash-change').value = '0.000';

  // Default datetime
  const dt = new Date();
  dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
  document.getElementById('pay-when').value = dt.toISOString().slice(0, 16);

  document.getElementById('payment-modal').classList.add('open');
}

/* Method picker switching */
document.querySelectorAll('.pay-method').forEach(label => {
  label.addEventListener('click', () => {
    document.querySelectorAll('.pay-method').forEach(l => l.classList.remove('selected'));
    label.classList.add('selected');
    const method = label.dataset.method;
    document.querySelectorAll('.pay-fields').forEach(f => f.classList.remove('show'));
    document.getElementById('pay-' + method + '-fields').classList.add('show');
  });
});

/* Cash change calculator */
document.getElementById('cash-received')?.addEventListener('input', e => {
  const total = parseFloat(document.getElementById('pay-modal-amt').textContent) || 0;
  const received = parseFloat(e.target.value) || 0;
  const change = Math.max(0, received - total);
  document.getElementById('cash-change').value = change.toFixed(3);
});

/* Submit payment */
document.getElementById('payment-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const method = fd.get('method');

  const total = parseFloat(document.getElementById('inv-total').textContent);

  // Validate per method
  if (method === 'cash') {
    const received = parseFloat(fd.get('cash_received') || 0);
    if (received < total) { alert('Cash received cannot be less than the total due.'); return; }
  }
  if (method === 'card' && (!fd.get('card_last4') || fd.get('card_last4').length !== 4)) {
    if (!confirm('No card last-4 entered. Continue anyway?')) return;
  }
  if (method === 'benefit' && !fd.get('benefit_ref')) {
    if (!confirm('No BenefitPay reference entered. Continue anyway?')) return;
  }

  // Build payment object
  const payment = {
    method,
    amount: total,
    paidAt: fd.get('paid_at') ? new Date(fd.get('paid_at')).toISOString() : new Date().toISOString(),
    cashier: fd.get('cashier') || 'Admin',
    notes: fd.get('payment_notes') || null,
  };
  if (method === 'cash') {
    payment.received = parseFloat(fd.get('cash_received') || 0);
    payment.change = parseFloat(fd.get('cash_change') || 0);
  } else if (method === 'card') {
    payment.cardType = fd.get('card_type');
    payment.cardLast4 = fd.get('card_last4');
    payment.authCode = fd.get('card_auth');
  } else if (method === 'benefit') {
    payment.reference = fd.get('benefit_ref');
    payment.senderPhone = fd.get('benefit_phone');
    payment.senderName = fd.get('benefit_name');
  } else if (method === 'bank') {
    payment.bankName = fd.get('bank_name');
    payment.reference = fd.get('bank_ref');
    payment.iban = fd.get('bank_iban');
  } else if (method === 'apple') {
    payment.transactionId = fd.get('apple_id');
    payment.device = fd.get('apple_device');
  }

  booking.payment = payment;
  booking.payment_method = methodLabel(method);
  booking.paid = true;
  booking.paidAt = payment.paidAt;
  if (booking.status === 'new' || booking.status === 'pending') booking.status = 'ok';
  persist();

  if (window.TajLog) {
    TajLog.add({
      type: 'payment',
      title: `Payment received: ${booking.name}`,
      desc: `${booking.service} · ${total.toFixed(2)} BHD via ${methodLabel(method)}`,
      ref: booking.id,
      refType: 'booking'
    });
  }

  document.getElementById('payment-modal').classList.remove('open');
  render();
  showToast('Payment recorded — Receipt issued');
});

/* Method labels */
function methodLabel(m) {
  return ({ cash: 'Cash', card: 'Card', benefit: 'BenefitPay', bank: 'Bank Transfer', apple: 'Apple Pay' })[m] || 'Cash';
}
function methodIcon(m) {
  return ({ cash: 'fa-money-bill-wave', card: 'far fa-credit-card', benefit: 'fa-mobile-alt', bank: 'fa-university', apple: 'fab fa-apple-pay' })[m] || 'fa-money-bill-wave';
}

/* Render the payment block on the receipt with all captured details */
function renderPaymentBlock(b, total) {
  const p = b.payment || { method: (b.payment_method || 'cash').toLowerCase(), amount: total };
  const methodKey = (p.method || 'cash').toLowerCase().replace(/\s/g, '');

  // Map known labels back to keys
  const keyMap = { cash: 'cash', card: 'card', benefitpay: 'benefit', benefit: 'benefit', banktransfer: 'bank', bank: 'bank', applepay: 'apple', apple: 'apple' };
  const k = keyMap[methodKey] || 'cash';
  const iconClass = (k === 'card') ? 'far fa-credit-card' : (k === 'apple' ? 'fab fa-apple-pay' : 'fas ' + methodIcon(k));

  // Method badge
  const badge = document.getElementById('pay-method-badge');
  badge.innerHTML = `<i class="${iconClass}"></i> ${methodLabel(k).toUpperCase()}`;

  // Build fields
  const fmtPaidAt = p.paidAt
    ? new Date(p.paidAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
    : 'Recently';

  let fields = `
    <div>
      <h6>Amount Paid</h6>
      <strong class="amt">${fmtMoney(p.amount || total)}</strong>
    </div>
    <div>
      <h6>Paid On</h6>
      <strong>${fmtPaidAt}</strong>
    </div>
    <div>
      <h6>Received By</h6>
      <strong>${p.cashier || 'Admin'}</strong>
    </div>
  `;

  // Method-specific extras
  if (k === 'cash') {
    if (p.received !== undefined) fields += `
      <div><h6>Cash Received</h6><strong>${fmtMoney(p.received)}</strong></div>
      <div><h6>Change Given</h6><strong>${fmtMoney(p.change || 0)}</strong></div>
    `;
  } else if (k === 'card') {
    if (p.cardType || p.cardLast4) fields += `
      <div><h6>Card</h6><strong>${p.cardType || 'Card'} •••• ${p.cardLast4 || '0000'}</strong></div>
    `;
    if (p.authCode) fields += `
      <div><h6>Auth Code</h6><strong class="mono">${p.authCode}</strong></div>
    `;
  } else if (k === 'benefit') {
    if (p.reference) fields += `
      <div><h6>BenefitPay Ref</h6><strong class="mono">${p.reference}</strong></div>
    `;
    if (p.senderPhone) fields += `
      <div><h6>Sender Phone</h6><strong>${p.senderPhone}</strong></div>
    `;
    if (p.senderName) fields += `
      <div><h6>Sender Name</h6><strong>${p.senderName}</strong></div>
    `;
  } else if (k === 'bank') {
    if (p.bankName) fields += `
      <div><h6>Bank</h6><strong>${p.bankName}</strong></div>
    `;
    if (p.reference) fields += `
      <div><h6>Reference</h6><strong class="mono">${p.reference}</strong></div>
    `;
    if (p.iban) fields += `
      <div><h6>IBAN (last 6)</h6><strong class="mono">${p.iban}</strong></div>
    `;
  } else if (k === 'apple') {
    if (p.transactionId) fields += `
      <div><h6>Transaction ID</h6><strong class="mono">${p.transactionId}</strong></div>
    `;
    if (p.device) fields += `
      <div><h6>Device</h6><strong>${p.device}</strong></div>
    `;
  }

  if (p.notes) {
    fields += `
      <div style="grid-column: 1 / -1; padding-top: 12px; border-top: 1px dashed rgba(176,120,73,.25); margin-top: 4px;">
        <h6>Notes</h6>
        <strong style="font-style: italic; color: var(--c-text); font-weight: 400;">${p.notes}</strong>
      </div>
    `;
  }

  document.getElementById('pay-block-content').innerHTML = fields;
}

/* Sign out */
document.getElementById('admin-logout')?.addEventListener('click', e => {
  e.preventDefault();
  if (window.TajAdmin) { TajAdmin.signOut(); return; }
  sessionStorage.removeItem('taj-admin-auth');
  location.href = 'admin-login.html';
});

/* Toast */
function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 3500);
}

render();
