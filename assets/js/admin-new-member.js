/* Taj Al Sukn — Admin New Member (full page) */

if (sessionStorage.getItem('taj-admin-auth') !== '1') {
  location.replace('admin-login.html');
}

const form = document.getElementById('member-form');

/* Helpers */
function fmt(n) { return n.toFixed(3) + ' BHD'; }
function shortDate(d) {
  if (!d) return '—';
  const dt = (typeof d === 'string') ? new Date(d + 'T00:00:00') : d;
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function initials(name) {
  if (!name) return '—';
  return name.trim().split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
}
function methodLabel(m) {
  return ({ cash: 'Cash', card: 'Card', benefit: 'BenefitPay', bank: 'Bank Transfer', apple: 'Apple Pay' })[m] || 'Cash';
}

/* Default dates */
(function () {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const todayStr = today.toISOString().split('T')[0];
  document.getElementById('paid-date').value = todayStr;

  const welcomeDefault = new Date(today);
  welcomeDefault.setDate(welcomeDefault.getDate() + 7);
  document.getElementById('welcome-date').value = welcomeDefault.toISOString().split('T')[0];
  document.getElementById('welcome-date').min = todayStr;
})();

/* Tier perks data */
const PERKS = {
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
  ],
  Platinum: [
    'Unlimited signature massages (max 2/month)',
    '12 Royal Hammams per year',
    '4 Hot Stone sessions included',
    '20% off additional treatments & products',
    'Priority booking — anytime',
    '4 guest passes per year',
    'Annual gift box of premium products'
  ]
};

const WELCOME = {
  Silver:   { name: 'Welcome Foot Relaxing Ritual', desc: 'A complimentary 30-minute foot relaxing ritual to introduce the member to Taj Al Sukn.' },
  Gold:     { name: 'Welcome Hammam Ritual',         desc: 'A complimentary Casablanca Hammam (60 min) included with Gold enrollment.' },
  Platinum: { name: 'Welcome Sultan Suite Ritual',   desc: 'The signature 2-hour Sultan Suite ritual — included with Platinum enrollment.' }
};

const BALANCE = {
  Silver:   '2 massages · 1 foot ritual',
  Gold:     '6 massages · 1 hammam · 2 foot rituals',
  Platinum: '∞ massages · 12 hammams · 4 hot stone'
};

/* Tier picker */
document.querySelectorAll('.tier-pick').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.tier-pick').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    card.querySelector('input').checked = true;
    update();
  });
});

/* Payment method picker */
document.querySelectorAll('.pay-method').forEach(label => {
  label.addEventListener('click', () => {
    document.querySelectorAll('.pay-method').forEach(l => l.classList.remove('selected'));
    label.classList.add('selected');
    const method = label.dataset.method;
    document.querySelectorAll('.pay-fields').forEach(f => f.classList.remove('show'));
    document.getElementById('pay-' + method + '-fields').classList.add('show');
    update();
  });
});

/* Cash change calculator */
document.getElementById('cash-received')?.addEventListener('input', e => {
  const fee = getSelectedTier()?.price || 0;
  const received = parseFloat(e.target.value) || 0;
  const change = Math.max(0, received - fee);
  document.getElementById('cash-change').value = change.toFixed(3);
});

/* Live update everything */
form.addEventListener('input', update);
form.addEventListener('change', update);

function getSelectedTier() {
  const card = document.querySelector('.tier-pick.selected');
  if (!card) return null;
  return { name: card.dataset.tier, price: parseInt(card.dataset.price, 10) };
}

function getSelectedMethod() {
  const m = document.querySelector('.pay-method.selected');
  return m ? m.dataset.method : 'cash';
}

function update() {
  const tier = getSelectedTier() || { name: 'Gold', price: 350 };
  const name = (form.elements.name.value || '').trim();
  const today = new Date();
  const renews = new Date(); renews.setFullYear(renews.getFullYear() + 1);

  // Member ID preview
  const existingCount = (JSON.parse(localStorage.getItem('taj-members') || '[]').length) + 50;
  const idStr = 'TAS-' + today.getFullYear() + '-' + String(existingCount).padStart(4, '0');

  // Update card preview
  document.getElementById('pv-avatar').textContent = name ? initials(name) : '—';
  document.getElementById('pv-name').textContent = name || 'New Member';
  document.getElementById('pv-id').textContent = idStr;
  document.getElementById('pv-since').textContent = shortDate(today);
  document.getElementById('pv-renews').textContent = shortDate(renews);

  const tierBadge = document.getElementById('pv-tier');
  tierBadge.className = 'tier-pill ' + tier.name.toLowerCase();
  tierBadge.innerHTML = `<i class="fas fa-crown"></i> ${tier.name} Member`;

  // Tier perks preview
  document.getElementById('pv-perks-label').textContent = `${tier.name} Tier Includes`;
  document.getElementById('pv-perks').innerHTML = PERKS[tier.name].map(p => `<li>${p}</li>`).join('');

  // Welcome ritual
  const w = WELCOME[tier.name];
  document.getElementById('welcome-ritual-name').textContent = w.name;
  document.getElementById('welcome-ritual-desc').textContent = w.desc;

  // Fee summary
  document.getElementById('pv-fee').textContent = fmt(tier.price);
  document.getElementById('pv-pay-method').textContent = methodLabel(getSelectedMethod());

  const isPaid = form.elements.defer.value === 'paid';
  document.getElementById('pv-status').textContent = isPaid ? 'Paid Now' : 'Deferred';
  document.getElementById('pv-status').style.color = isPaid ? '#2a8a4a' : '#b6841d';
  document.getElementById('pv-total').textContent = isPaid ? tier.price + ' BHD' : 'Pending';

  // Update cash received default to fee
  const cash = document.getElementById('cash-received');
  if (cash && !cash.value) cash.value = tier.price.toFixed(3);
}

update();

/* ---------- Save member ---------- */
function buildPayment(tier) {
  const method = getSelectedMethod();
  const fd = new FormData(form);
  const isPaid = fd.get('defer') === 'paid';
  if (!isPaid) return null;

  const payment = {
    method,
    amount: tier.price,
    paidAt: fd.get('paid_date') ? new Date(fd.get('paid_date') + 'T12:00:00').toISOString() : new Date().toISOString(),
    cashier: 'Admin',
    purpose: tier.name + ' Membership Fee'
  };
  if (method === 'cash') {
    payment.received = parseFloat(fd.get('cash_received') || tier.price);
    payment.change = parseFloat(fd.get('cash_change') || 0);
  } else if (method === 'card') {
    payment.cardType = fd.get('card_type');
    payment.cardLast4 = fd.get('card_last4');
    payment.authCode = fd.get('card_auth');
  } else if (method === 'benefit') {
    payment.reference = fd.get('benefit_ref');
    payment.senderPhone = fd.get('benefit_phone');
  } else if (method === 'bank') {
    payment.bankName = fd.get('bank_name');
    payment.reference = fd.get('bank_ref');
  } else if (method === 'apple') {
    payment.transactionId = fd.get('apple_id');
  }
  return payment;
}

async function saveMember() {
  if (!form.checkValidity()) { form.reportValidity(); return null; }

  const tier = getSelectedTier();
  const fd = new FormData(form);
  const today = new Date();
  const renews = new Date(); renews.setFullYear(renews.getFullYear() + 1);
  const fmtIso = dt => dt.toISOString().split('T')[0];

  const yr = today.getFullYear();
  const seq = String(Date.now()).slice(-4);
  const id = 'TAS-' + yr + '-' + seq;
  const isPaid = fd.get('defer') === 'paid';
  const payment = buildPayment(tier);

  // Schema uses camelCase aliases that the data layer translates to snake_case
  const member = {
    id,
    name:  fd.get('name'),
    phone: fd.get('phone'),
    email: fd.get('email'),
    dob:   fd.get('dob') || null,
    tier:  tier.name,
    startDate: fmtIso(today),
    endDate:   fmtIso(renews),
    discount:  ({ Silver: 10, Gold: 15, Platinum: 20 })[tier.name] || 0,
    balance:   BALANCE[tier.name] || 0,
    totalSpent: tier.price,
    servicesIncluded: ({ Silver: 6, Gold: 14, Platinum: 30 })[tier.name] || 0,
    servicesUsed: 0,
    joinedVia: 'Admin',
    paymentMethod: payment ? methodLabel(payment.method) : null,
    therapist_pref: fd.get('therapist_pref') || null,
    notes: fd.get('notes') || null,
    status: isPaid ? 'active' : 'pending-payment',
    // Extended fields kept locally only (schema is intentionally simple)
    comm_pref: fd.get('comm_pref'),
    welcome_ritual: {
      name: WELCOME[tier.name].name,
      scheduled_for: fd.get('welcome_date'),
      time: fd.get('welcome_time'),
      status: 'scheduled'
    },
    payment,
    annual_fee: tier.price
  };

  // Persist via data layer (Supabase + LS) with graceful fallback
  try {
    if (window.TajData) {
      await TajData.members.upsert(member);
      await TajData.activity.log({
        type: 'member',
        title: `New ${tier.name} member: ${member.name}`,
        desc:  `Annual enrollment · ${tier.price} BHD · ${isPaid ? 'Paid' : 'Pending payment'}`,
        ref:   member.id,
        refType: 'member'
      });
      if (isPaid && payment) {
        await TajData.activity.log({
          type: 'payment',
          title: `Membership payment: ${member.name}`,
          desc:  `${tier.price} BHD via ${methodLabel(payment.method)}`,
          ref:   member.id,
          refType: 'member'
        });
      }
    } else {
      const members = JSON.parse(localStorage.getItem('taj-members') || '[]');
      members.unshift(member);
      localStorage.setItem('taj-members', JSON.stringify(members));
      if (window.TajLog) {
        TajLog.add({ type: 'member', title: `New ${tier.name} member: ${member.name}`, desc: `Annual enrollment · ${tier.price} BHD · ${isPaid ? 'Paid' : 'Pending payment'}`, ref: member.id, refType: 'member' });
        if (isPaid && payment) TajLog.add({ type: 'payment', title: `Membership payment: ${member.name}`, desc: `${tier.price} BHD via ${methodLabel(payment.method)}`, ref: member.id, refType: 'member' });
      }
    }
  } catch (err) {
    console.warn('[admin-new-member] save failed:', err);
    const members = JSON.parse(localStorage.getItem('taj-members') || '[]');
    members.unshift(member);
    localStorage.setItem('taj-members', JSON.stringify(members));
  }

  // Toast
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = `${tier.name} member enrolled — ${id}`;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);

  return member;
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const m = await saveMember();
  if (m) setTimeout(() => location.href = 'admin-member.html?id=' + encodeURIComponent(m.id), 800);
});

document.getElementById('save-and-new')?.addEventListener('click', async () => {
  const m = await saveMember();
  if (m) {
    form.reset();
    document.querySelectorAll('.tier-pick').forEach(c => c.classList.remove('selected'));
    document.querySelector('.tier-pick.gold').classList.add('selected');
    document.querySelector('.tier-pick.gold input').checked = true;
    document.querySelectorAll('.pay-method').forEach(c => c.classList.remove('selected'));
    document.querySelector('.pay-method[data-method=cash]').classList.add('selected');
    document.querySelector('.pay-method[data-method=cash] input').checked = true;
    document.querySelectorAll('.pay-fields').forEach(f => f.classList.remove('show'));
    document.getElementById('pay-cash-fields').classList.add('show');
    setTimeout(update, 100);
  }
});

document.getElementById('admin-logout')?.addEventListener('click', e => {
  e.preventDefault();
  sessionStorage.removeItem('taj-admin-auth');
  location.href = 'admin-login.html';
});
