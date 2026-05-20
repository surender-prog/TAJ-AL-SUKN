/* Taj Al Sukun — Shared admin utilities (activity log, formatting) */

/* ============================================================
   PRINT / APPROVAL-PDF MODE
   ============================================================
   When ?print=1 is in the URL we:
   1) auto-grant admin auth (so headless Chrome doesn't bounce to login)
   2) seed localStorage with demo data IF the relevant key is empty,
      so each admin screen renders a meaningful, populated state.
   The user's real data is never overwritten (we only seed when blank). */
(function tajPrintBoot() {
  try {
    const qp = new URLSearchParams(location.search);
    if (qp.get('print') !== '1') return;
    sessionStorage.setItem('taj-admin-auth', '1');
    const blank = (k) => {
      const v = localStorage.getItem(k);
      return !v || v === '[]' || v === '{}' || v === 'null';
    };
    const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));

    if (blank('taj-bookings')) set('taj-bookings', [
      { id:'TS-001', name:'Aisha Al Mansour', phone:'+973 39112233', email:'aisha@example.com', service:'Royal Hammam Ritual', therapist:'Layla', date:'2026-05-12', time:'14:00', duration:90, price:65, status:'confirmed', tier:'Gold', payment:{ method:'Card', txnId:'TXN-8821', paidAt:'2026-05-09T10:14:00Z' } },
      { id:'TS-002', name:'Fatima Ebrahim', phone:'+973 36889977', email:'fatima@example.com', service:'Signature Aroma Massage', therapist:'Rania', date:'2026-05-12', time:'16:00', duration:60, price:42, status:'pending', tier:'Silver', payment:null },
      { id:'TS-003', name:'Noura Al Khalifa', phone:'+973 33558822', email:'noura@example.com', service:'Hot Stone Therapy', therapist:'Mariam', date:'2026-05-13', time:'11:00', duration:90, price:58, status:'confirmed', tier:'Platinum', payment:{ method:'BenefitPay', txnId:'BP-4421', paidAt:'2026-05-10T09:20:00Z' } },
      { id:'TS-004', name:'Mona Al Doseri', phone:'+973 39998877', email:'mona@example.com', service:'Couples Retreat', therapist:'Layla', date:'2026-05-13', time:'15:30', duration:120, price:120, status:'confirmed', tier:'Gold', payment:{ method:'Cash', txnId:'', paidAt:'2026-05-11T08:00:00Z' } },
      { id:'TS-005', name:'Hessa Al Sabah', phone:'+973 33112299', email:'hessa@example.com', service:'Pearl Glow Facial', therapist:'Rania', date:'2026-05-14', time:'10:00', duration:75, price:48, status:'pending', tier:'—', payment:null },
      { id:'TS-006', name:'Reem Al Mahmood', phone:'+973 33445566', email:'reem@example.com', service:'Foot Reflexology', therapist:'Mariam', date:'2026-05-14', time:'17:30', duration:45, price:28, status:'confirmed', tier:'Silver', payment:{ method:'Apple Pay', txnId:'AP-9911', paidAt:'2026-05-11T07:00:00Z' } }
    ]);

    if (blank('taj-members')) set('taj-members', [
      { id:'MBR-001', name:'Aisha Al Mansour', phone:'+973 39112233', email:'aisha@example.com', tier:'Gold', startDate:'2025-11-01', endDate:'2026-10-31', discount:15, balance:285, totalSpent:1240, joinedVia:'Walk-in', status:'active' },
      { id:'MBR-002', name:'Noura Al Khalifa', phone:'+973 33558822', email:'noura@example.com', tier:'Platinum', startDate:'2026-01-12', endDate:'2027-01-11', discount:20, balance:540, totalSpent:2890, joinedVia:'Referral', status:'active' },
      { id:'MBR-003', name:'Mona Al Doseri', phone:'+973 39998877', email:'mona@example.com', tier:'Gold', startDate:'2025-08-15', endDate:'2026-08-14', discount:15, balance:120, totalSpent:870, joinedVia:'Online', status:'active' },
      { id:'MBR-004', name:'Layla Al Hashimi', phone:'+973 33667788', email:'layla.h@example.com', tier:'Silver', startDate:'2026-02-20', endDate:'2027-02-19', discount:10, balance:80, totalSpent:340, joinedVia:'Walk-in', status:'active' }
    ]);

    if (blank('taj-therapists')) set('taj-therapists', [
      { id:'T-01', name:'Layla Hassan', specialty:'Hammam & Body Treatments', languages:'AR / EN', status:'active', commission:25 },
      { id:'T-02', name:'Rania Saleh', specialty:'Facials & Aromatherapy', languages:'AR / EN', status:'active', commission:25 },
      { id:'T-03', name:'Mariam Al Hashimi', specialty:'Hot Stone & Deep Tissue', languages:'AR', status:'active', commission:22 },
      { id:'T-04', name:'Dina Khalil', specialty:'Couples Retreats', languages:'AR / EN / FR', status:'on-leave', commission:25 }
    ]);

    if (blank('taj-services')) set('taj-services', [
      { id:'S-01', name:'Royal Hammam Ritual', category:'Body', duration:90, price:65, status:'active' },
      { id:'S-02', name:'Signature Aroma Massage', category:'Massage', duration:60, price:42, status:'active' },
      { id:'S-03', name:'Hot Stone Therapy', category:'Massage', duration:90, price:58, status:'active' },
      { id:'S-04', name:'Pearl Glow Facial', category:'Face', duration:75, price:48, status:'active' },
      { id:'S-05', name:'Couples Retreat', category:'Package', duration:120, price:120, status:'active' },
      { id:'S-06', name:'Foot Reflexology', category:'Body', duration:45, price:28, status:'active' }
    ]);

    if (blank('taj-hours')) set('taj-hours', { mon:'10:00-22:00', tue:'10:00-22:00', wed:'10:00-22:00', thu:'10:00-22:00', fri:'14:00-23:00', sat:'10:00-23:00', sun:'10:00-22:00' });

    if (blank('taj-pay-methods')) set('taj-pay-methods', [
      { id:'pm-cash', name:'Cash', enabled:true, fee:0 },
      { id:'pm-card', name:'Card (Visa/Mastercard)', enabled:true, fee:2.5 },
      { id:'pm-benefit', name:'BenefitPay', enabled:true, fee:0 },
      { id:'pm-bank', name:'Bank Transfer', enabled:true, fee:0 },
      { id:'pm-apple', name:'Apple Pay', enabled:true, fee:1.5 }
    ]);

    if (blank('taj-tax')) set('taj-tax', { vat:10, label:'VAT', enabled:true });

    if (blank('taj-tiers')) set('taj-tiers', [
      { id:'silver', name:'Silver', price:180, discount:10, freeServices:1, color:'#C0C0C0' },
      { id:'gold', name:'Gold', price:320, discount:15, freeServices:2, color:'#D4B896' },
      { id:'platinum', name:'Platinum', price:520, discount:20, freeServices:4, color:'#E5E4E2' }
    ]);

    if (blank('taj-admins')) set('taj-admins', [
      { id:'A-01', name:'Surender Pal', email:'surender@exploremena.com', role:'Owner', status:'active' },
      { id:'A-02', name:'Reception Desk', email:'frontdesk@tajalsukn.com', role:'Staff', status:'active' }
    ]);
  } catch(e) { /* non-fatal */ }
})();


/* ============================================================
   ACTIVITY LOG
   ============================================================
   Activity types: booking, confirm, cancel, payment, member, note
   Each entry: { id, type, title, desc, ref, refType, when, read }
*/

window.TajLog = {
  add(entry) {
    const log = this.all();
    const item = Object.assign({
      id: 'A-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      when: new Date().toISOString(),
      read: false
    }, entry);
    log.unshift(item);
    // Cap at 200 entries
    if (log.length > 200) log.length = 200;
    localStorage.setItem('taj-activity', JSON.stringify(log));
    return item;
  },
  all() {
    return JSON.parse(localStorage.getItem('taj-activity') || 'null') || this._seed();
  },
  unread() { return this.all().filter(a => !a.read).length; },
  markAllRead() {
    const log = this.all();
    log.forEach(a => a.read = true);
    localStorage.setItem('taj-activity', JSON.stringify(log));
  },
  markRead(id) {
    const log = this.all();
    const item = log.find(a => a.id === id);
    if (item) { item.read = true; localStorage.setItem('taj-activity', JSON.stringify(log)); }
  },
  _seed() {
    const now = Date.now();
    const ago = (mins) => new Date(now - mins * 60000).toISOString();
    const seed = [
      { id: 'A-s1', type: 'booking', title: 'New booking from Olivia T.', desc: 'Casablanca Hammam · Today 3:30 PM', ref: 'BK-2026-0089', refType: 'booking', when: ago(5),  read: false },
      { id: 'A-s2', type: 'member',  title: 'New Gold member: Mariam H.', desc: 'Annual enrollment · 350 BHD', ref: 'TAS-2025-0042', refType: 'member', when: ago(28), read: false },
      { id: 'A-s3', type: 'confirm', title: 'Booking confirmed: Ahmed B.', desc: 'Royal Hammam + Massage · 7:00 PM', ref: 'BK-2026-0088', refType: 'booking', when: ago(60), read: true  },
      { id: 'A-s4', type: 'cancel',  title: 'Cancellation from Layla M.', desc: 'Aroma Relaxing · Tomorrow 11:00 AM', ref: 'BK-2026-0083', refType: 'booking', when: ago(120), read: true },
      { id: 'A-s5', type: 'payment', title: 'Payment received: Mohammed K.', desc: 'Deep Tissue · 24 BHD via BenefitPay', ref: 'BK-2026-0085', refType: 'booking', when: ago(180), read: true },
      { id: 'A-s6', type: 'member',  title: 'Tier upgrade: Khalid A.', desc: 'Silver → Gold · +200 BHD', ref: 'TAS-2025-0044', refType: 'member', when: ago(240), read: true },
      { id: 'A-s7', type: 'booking', title: 'Walk-in booking from guest', desc: 'Reflexology · 30-min', ref: 'BK-2026-0080', refType: 'booking', when: ago(1440), read: true },
    ];
    localStorage.setItem('taj-activity', JSON.stringify(seed));
    return seed;
  }
};

/* ============================================================
   SHARED FORMATTERS
   ============================================================ */
window.TajFmt = {
  date(d) {
    if (!d) return '—';
    const [y, m, day] = d.split('-');
    const dt = new Date(parseInt(y), parseInt(m)-1, parseInt(day));
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },
  fullDate(d) {
    if (!d) return '—';
    const [y, m, day] = d.split('-');
    const dt = new Date(parseInt(y), parseInt(m)-1, parseInt(day));
    return dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  },
  time(t) {
    if (!t) return '—';
    const [h, m] = t.split(':');
    const hh = parseInt(h, 10);
    const ampm = hh >= 12 ? 'PM' : 'AM';
    return `${hh % 12 || 12}:${m} ${ampm}`;
  },
  relative(iso) {
    if (!iso) return '—';
    const dt = new Date(iso);
    const diff = Date.now() - dt.getTime();
    const mins = Math.round(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    if (days < 7) return `${days}d ago`;
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },
  initials(name) {
    if (!name) return '—';
    return name.trim().split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  },
  todayISO() {
    const t = new Date();
    t.setHours(0,0,0,0);
    return t.toISOString().split('T')[0];
  }
};
