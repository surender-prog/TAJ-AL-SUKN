/* Taj Al Sukun — Unified Data Layer
   ============================================================
   Single source of truth for reading/writing app data.
   Backed by Supabase when ANON_KEY is configured; otherwise
   falls back to localStorage so the demo always works offline.

   Public API (all async, all return Promises):
     TajData.ready()                       → wait for boot + initial sync
     TajData.connected                      → boolean: is Supabase live?

     TajData.bookings.list({date?,member?}) → []
     TajData.bookings.get(id)               → row|null
     TajData.bookings.upsert(row)           → row
     TajData.bookings.remove(id)            → void

     TajData.members.list()                 → []
     TajData.members.get(id)                → row|null
     TajData.members.findByPhone(phone)     → row|null
     TajData.members.upsert(row)            → row
     TajData.members.remove(id)             → void

     TajData.services.list()                → []
     TajData.services.upsert(row)           → row
     TajData.services.remove(id)            → void

     TajData.therapists.list()              → []
     TajData.therapists.upsert(row)         → row

     TajData.activity.log(entry)            → entry
     TajData.activity.list(limit?)          → []

     TajData.settings.get(key)              → value
     TajData.settings.set(key, value)       → value
*/

(function () {
  'use strict';

  const cfg = window.TAJ_SUPABASE || { URL: '', ANON_KEY: '', ENABLED: false };
  const HAS_REMOTE = !!cfg.ENABLED;
  // Prefer the shared client created by admin-auth.js so an authenticated
  // admin session (JWT) flows through to every query. Fall back to creating
  // our own client on the public site (anon role). Both share the default
  // session storage on the same origin, so auth state is consistent.
  const sb = HAS_REMOTE && window.supabase
              ? (window.__tajSb || (window.__tajSb = window.supabase.createClient(cfg.URL, cfg.ANON_KEY, {
                  auth: { persistSession: true, autoRefreshToken: true }
                })))
              : null;

  // ---------------------------------------------------------- storage helpers
  const LS = {
    get(key, fb) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; }
      catch (_) { return fb; }
    },
    set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {} },
    del(key)      { try { localStorage.removeItem(key); } catch (_) {} }
  };

  // localStorage key map (preserves old keys for offline fallback + cache)
  const K = {
    bookings:  'taj-bookings',
    members:   'taj-members',
    services:  'taj-services',
    therapists:'taj-therapists',
    hours:     'taj-hours',
    payments:  'taj-pay-methods',
    tiers:     'taj-tiers',
    settings:  'taj-settings',
    activity:  'taj-activity'
  };

  // ---------------------------------------------------------- shape mappers
  // ---------------------------------------------------------- allowed columns per table
  // PostgREST rejects rows containing unknown columns ("could not find column X
  // in the schema cache"). We strip the payload to only schema columns before
  // sending. Local cache keeps the full object so the UI doesn't lose fields.
  const SCHEMA = {
    bookings: new Set(['id','member_id','name','phone','email','service','service_id','therapist','therapist_id','date','time','duration','price','status','tier','payment','payment_method','paid','paid_at','notes','invoice','source','created_at','updated_at']),
    members:  new Set(['id','name','email','phone','tier','start_date','end_date','discount','balance','comp_balance','total_spent','services_included','services_used','joined_via','payment_method','dob','notes','therapist_pref','status','created_at','updated_at']),
    services: new Set(['id','name','category','tag','description','long_description','duration','price','price_alt','member_price','image','show_on_website','show_in_booking','featured','member_only','status','sort','created_at','updated_at']),
    therapists: new Set(['id','name','role','specialty','langs','exp','phone','status','commission','created_at','updated_at']),
    activity:  new Set(['id','type','title','description','ref','ref_type','actor','read','occurred_at']),
    settings:  new Set(['key','value','updated_at']),
    tiers:     new Set(['id','name','price','discount','free_services','color','updated_at']),
    hours:     new Set(['day','open','close','closed','updated_at']),
    payment_methods: new Set(['id','name','enabled','fee','updated_at']),
    admins:    new Set(['id','name','email','role','status','created_at'])
  };
  function pickSchema(table, row) {
    const allow = SCHEMA[table];
    if (!allow) return row;
    const out = {};
    Object.keys(row).forEach(k => { if (allow.has(k)) out[k] = row[k]; });
    return out;
  }

  // DB columns use snake_case, app uses a mix. Translate at the edge.
  function fromBooking(r) { return Object.assign({}, r, {
    memberId:     r.member_id,
    serviceId:    r.service_id,
    therapistId:  r.therapist_id,
    paymentMethod:r.payment_method,
    paidAt:       r.paid_at
  }); }
  function toBooking(r) {
    const o = Object.assign({}, r);
    if (r.memberId !== undefined)     { o.member_id     = r.memberId;     delete o.memberId; }
    if (r.serviceId !== undefined)    { o.service_id    = r.serviceId;    delete o.serviceId; }
    if (r.therapistId !== undefined)  { o.therapist_id  = r.therapistId;  delete o.therapistId; }
    if (r.paymentMethod !== undefined){ o.payment_method= r.paymentMethod;delete o.paymentMethod; }
    if (r.paidAt !== undefined)       { o.paid_at       = r.paidAt;       delete o.paidAt; }
    return o;
  }
  function fromMember(r) { return Object.assign({}, r, {
    startDate:        r.start_date,
    endDate:          r.end_date,
    totalSpent:       r.total_spent,
    servicesIncluded: r.services_included,
    servicesUsed:     r.services_used,
    joinedVia:        r.joined_via,
    paymentMethod:    r.payment_method,
    therapist_pref:   r.therapist_pref
  }); }
  function toMember(r) {
    const o = Object.assign({}, r);
    if (r.startDate !== undefined)        { o.start_date        = r.startDate;        delete o.startDate; }
    if (r.endDate !== undefined)          { o.end_date          = r.endDate;          delete o.endDate; }
    if (r.totalSpent !== undefined)       { o.total_spent       = r.totalSpent;       delete o.totalSpent; }
    if (r.servicesIncluded !== undefined) { o.services_included = r.servicesIncluded; delete o.servicesIncluded; }
    if (r.servicesUsed !== undefined)     { o.services_used     = r.servicesUsed;     delete o.servicesUsed; }
    if (r.joinedVia !== undefined)        { o.joined_via        = r.joinedVia;        delete o.joinedVia; }
    if (r.paymentMethod !== undefined)    { o.payment_method    = r.paymentMethod;    delete o.paymentMethod; }
    // `balance` is numeric(10,3) in Postgres. Some legacy admin flows stored a
    // descriptive "services remaining" string here (e.g. "2 massages · 1 foot
    // ritual"). Sending non-numeric text to the numeric column raises 22P02 and
    // rejects the whole row, so drop it from the remote payload when it isn't a
    // finite number. The local cache (members.upsert) keeps the original value.
    if (o.balance !== undefined && o.balance !== null &&
        (o.balance === '' || !Number.isFinite(Number(o.balance)))) {
      delete o.balance;
    }
    return o;
  }
  function fromActivity(r) { return Object.assign({}, r, {
    desc:    r.description,
    refType: r.ref_type,
    when:    r.occurred_at
  }); }
  function toActivity(r) {
    const o = Object.assign({}, r);
    if (r.desc !== undefined)    { o.description = r.desc;    delete o.desc; }
    if (r.refType !== undefined) { o.ref_type    = r.refType; delete o.refType; }
    if (r.when !== undefined)    { o.occurred_at = r.when;    delete o.when; }
    return o;
  }

  // ---------------------------------------------------------- generic remote ops
  async function sbList(table, opts = {}) {
    if (!sb) return null;
    let q = sb.from(table).select('*');
    if (opts.order) q = q.order(opts.order.col, { ascending: opts.order.asc !== false });
    if (opts.eq)    Object.entries(opts.eq).forEach(([k, v]) => q = q.eq(k, v));
    if (opts.gte)   q = q.gte(opts.gte.col, opts.gte.val);
    if (opts.lte)   q = q.lte(opts.lte.col, opts.lte.val);
    if (opts.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error) { console.warn('[TajData]', table, error.message); return null; }
    return data;
  }
  function isRlsError(e) {
    return !!e && (e.code === '42501' || /row-level security/i.test(e.message || ''));
  }
  async function sbUpsert(table, row) {
    if (!sb) return null;
    const payload = pickSchema(table, row);
    const { data, error } = await sb.from(table).upsert(payload).select().maybeSingle();
    if (!error) return data;
    // Production RLS: anon may INSERT but not SELECT (bookings / members / activity).
    // The .select() representation is what RLS rejects — retry the write WITHOUT
    // reading the row back (Prefer: return=minimal) and echo the payload so the
    // public booking / signup / activity-log flows still persist + return usable data.
    if (isRlsError(error)) {
      const { error: e2 } = await sb.from(table).upsert(payload);
      if (!e2) return payload;
      console.warn('[TajData]', table, 'insert(minimal)', e2.message, payload);
      return null;
    }
    console.warn('[TajData]', table, 'upsert', error.message, payload);
    return null;
  }
  async function sbDelete(table, id) {
    if (!sb) return false;
    const { error } = await sb.from(table).delete().eq('id', id);
    if (error) { console.warn('[TajData]', table, 'delete', error.message); return false; }
    return true;
  }

  // ---------------------------------------------------------- bookings
  const bookings = {
    async list(filters) {
      filters = filters || {};
      if (sb) {
        const opts = { order: { col: 'date', asc: false } };
        if (filters.date)   opts.eq = Object.assign(opts.eq || {}, { date: filters.date });
        if (filters.member) opts.eq = Object.assign(opts.eq || {}, { member_id: filters.member });
        const rows = await sbList('bookings', opts);
        if (rows) {
          const mapped = rows.map(fromBooking);
          LS.set(K.bookings, mapped);
          return _filter(mapped, filters);
        }
      }
      return _filter(LS.get(K.bookings, []) || [], filters);
    },
    async get(id) {
      if (sb) {
        const { data } = await sb.from('bookings').select('*').eq('id', id).maybeSingle();
        if (data) return fromBooking(data);
      }
      return (LS.get(K.bookings, []) || []).find(b => b.id === id) || null;
    },
    async upsert(row) {
      const remote = await sbUpsert('bookings', toBooking(row));
      const final = remote ? fromBooking(remote) : row;
      const all = LS.get(K.bookings, []) || [];
      const idx = all.findIndex(b => b.id === final.id);
      if (idx >= 0) all[idx] = final; else all.unshift(final);
      LS.set(K.bookings, all);
      return final;
    },
    async remove(id) {
      if (sb) await sbDelete('bookings', id);
      const all = (LS.get(K.bookings, []) || []).filter(b => b.id !== id);
      LS.set(K.bookings, all);
    }
  };
  function _filter(list, f) {
    if (!f) return list;
    return list.filter(b =>
      (!f.date   || b.date === f.date) &&
      (!f.member || b.memberId === f.member || b.member_id === f.member));
  }

  // ---------------------------------------------------------- members
  const members = {
    async list() {
      if (sb) {
        const rows = await sbList('members', { order: { col: 'created_at', asc: false } });
        if (rows) {
          const m = rows.map(fromMember);
          LS.set(K.members, m);
          return m;
        }
      }
      return LS.get(K.members, []) || [];
    },
    async get(id) {
      if (sb) {
        const { data } = await sb.from('members').select('*').eq('id', id).maybeSingle();
        if (data) return fromMember(data);
      }
      return (LS.get(K.members, []) || []).find(m => m.id === id) || null;
    },
    async findByPhone(phone) {
      const norm = (phone || '').replace(/[^\d]/g, '').replace(/^973/, '');
      if (sb) {
        const { data } = await sb.from('members').select('*').like('phone', '%' + norm + '%').limit(1);
        if (data && data[0]) return fromMember(data[0]);
      }
      return (LS.get(K.members, []) || []).find(m => (m.phone || '').replace(/[^\d]/g, '').replace(/^973/, '') === norm) || null;
    },
    async upsert(row) {
      const remote = await sbUpsert('members', toMember(row));
      const final = remote ? fromMember(remote) : row;
      const all = LS.get(K.members, []) || [];
      const idx = all.findIndex(m => m.id === final.id);
      if (idx >= 0) all[idx] = final; else all.unshift(final);
      LS.set(K.members, all);
      return final;
    },
    async remove(id) {
      if (sb) await sbDelete('members', id);
      const all = (LS.get(K.members, []) || []).filter(m => m.id !== id);
      LS.set(K.members, all);
    },

    // -------- Member self-service (RPC-backed; works pre- and post-lockdown) --------
    // Authenticate / fetch a member by ID + phone. After the production RLS
    // patch, anon has no direct SELECT on members — these RPCs are the only
    // way a member reads their own record.
    async login(id, phone) {
      if (sb) {
        try {
          const { data, error } = await sb.rpc('member_login', { p_id: id || '', p_phone: phone || '' });
          if (!error && data && data[0]) return fromMember(data[0]);
          if (!error) return null; // RPC ran, no match
        } catch (_) { /* fall through to legacy path */ }
        // Legacy fallback (RLS still open / RPC not deployed yet)
        const direct = await this.get(id);
        if (direct) return direct;
      }
      // Offline cache
      const norm = s => (s || '').replace(/[^\d]/g, '').replace(/^973/, '');
      return (LS.get(K.members, []) || []).find(m =>
        (m.id || '').toLowerCase() === (id || '').toLowerCase() &&
        (!phone || norm(m.phone) === norm(phone))) || null;
    },
    async loginByPhone(phone) {
      if (sb) {
        try {
          const { data, error } = await sb.rpc('member_find_by_phone', { p_phone: phone || '' });
          if (!error && data && data[0]) return fromMember(data[0]);
          if (!error) return null;
        } catch (_) { /* fall through */ }
        const direct = await this.findByPhone(phone);
        if (direct) return direct;
      }
      const norm = s => (s || '').replace(/[^\d]/g, '').replace(/^973/, '');
      return (LS.get(K.members, []) || []).find(m => norm(m.phone) === norm(phone)) || null;
    },
    async loginByEmail(email) {
      const e = (email || '').trim().toLowerCase();
      if (!e) return null;
      if (sb) {
        // Try a dedicated RPC first (if deployed), then a direct case-insensitive
        // match, then fall through to the offline cache.
        try {
          const { data, error } = await sb.rpc('member_find_by_email', { p_email: e });
          if (!error && data && data[0]) return fromMember(data[0]);
          if (!error) return null;
        } catch (_) { /* RPC not deployed — fall through */ }
        try {
          const { data } = await sb.from('members').select('*').ilike('email', e).limit(1);
          if (data && data[0]) return fromMember(data[0]);
        } catch (_) { /* RLS may block direct select — fall through */ }
      }
      return (LS.get(K.members, []) || []).find(m => (m.email || '').trim().toLowerCase() === e) || null;
    },
    // Unified lookup: accepts an email OR a phone number and returns the member.
    async lookupByContact(contact) {
      const c = (contact || '').trim();
      if (!c) return null;
      if (c.includes('@')) return this.loginByEmail(c);
      return this.loginByPhone(c);
    },
    // Uniqueness guard: returns the first conflicting member (with the field
    // that clashes) for a given email / phone, or null if both are free.
    // Pass excludeId when editing so a member doesn't clash with itself.
    // Checks Supabase (via the RPC/select-backed lookups) AND the local cache,
    // so it works in both the admin console and the public signup.
    async findDuplicate(opts) {
      const o = opts || {};
      const exId = (o.excludeId == null ? '' : String(o.excludeId)).toLowerCase();
      const normPhone = s => String(s || '').replace(/[^\d]/g, '').replace(/^973/, '');
      const cache = LS.get(K.members, []) || [];
      const notSelf = m => m && String(m.id || '').toLowerCase() !== exId;

      const email = (o.email || '').trim().toLowerCase();
      if (email) {
        let m = await this.loginByEmail(email);
        if (!notSelf(m)) m = null;
        if (!m) m = cache.find(x => notSelf(x) && (x.email || '').trim().toLowerCase() === email) || null;
        if (m) return { field: 'email', member: m };
      }

      const phoneN = normPhone(o.phone);
      if (phoneN) {
        let m = await this.loginByPhone(o.phone);
        if (!notSelf(m)) m = null;
        if (!m) m = cache.find(x => notSelf(x) && normPhone(x.phone) === phoneN) || null;
        if (m) return { field: 'phone', member: m };
      }
      return null;
    },
    async bookingsFor(id, phone) {
      if (sb) {
        try {
          const { data, error } = await sb.rpc('member_bookings', { p_id: id || '', p_phone: phone || '' });
          if (!error && data) return data.map(fromBooking);
        } catch (_) { /* fall through */ }
        // Legacy fallback
        try {
          const { data } = await sb.from('bookings').select('*').eq('member_id', id).order('date', { ascending: false });
          if (data) return data.map(fromBooking);
        } catch (_) {}
      }
      const norm = s => (s || '').replace(/[^\d]/g, '').replace(/^973/, '');
      return (LS.get(K.bookings, []) || []).filter(b =>
        b.memberId === id || b.member_id === id || (phone && norm(b.phone) === norm(phone)));
    },
    async save(id, phone, payload) {
      if (sb) {
        try {
          const { data, error } = await sb.rpc('member_save', { p_id: id || '', p_phone: phone || '', p_payload: payload });
          if (!error && data && data[0]) {
            const m = fromMember(data[0]);
            // refresh local cache copy
            const all = LS.get(K.members, []) || [];
            const idx = all.findIndex(x => x.id === m.id);
            if (idx >= 0) all[idx] = m; else all.unshift(m);
            LS.set(K.members, all);
            return m;
          }
        } catch (_) { /* fall through */ }
        // Legacy fallback: direct upsert (works while RLS open)
        return this.upsert(Object.assign({ id }, payload));
      }
      // Offline
      const all = LS.get(K.members, []) || [];
      const idx = all.findIndex(x => x.id === id);
      if (idx >= 0) { all[idx] = Object.assign({}, all[idx], payload); LS.set(K.members, all); return all[idx]; }
      return null;
    }
  };

  // ---------------------------------------------------------- services
  const services = {
    async list() {
      if (sb) {
        const rows = await sbList('services', { order: { col: 'sort', asc: true } });
        if (rows) { LS.set(K.services, rows); return rows; }
      }
      return LS.get(K.services, []) || [];
    },
    async upsert(row) {
      const remote = await sbUpsert('services', row);
      const final = remote || row;
      const all = LS.get(K.services, []) || [];
      const idx = all.findIndex(s => s.id === final.id);
      if (idx >= 0) all[idx] = final; else all.unshift(final);
      LS.set(K.services, all);
      return final;
    },
    async remove(id) {
      if (sb) await sbDelete('services', id);
      const all = (LS.get(K.services, []) || []).filter(s => s.id !== id);
      LS.set(K.services, all);
    }
  };

  // ---------------------------------------------------------- therapists
  const therapists = {
    async list() {
      if (sb) {
        const rows = await sbList('therapists', { order: { col: 'name', asc: true } });
        if (rows) { LS.set(K.therapists, rows); return rows; }
      }
      return LS.get(K.therapists, []) || [];
    },
    async upsert(row) {
      const remote = await sbUpsert('therapists', row);
      const final = remote || row;
      const all = LS.get(K.therapists, []) || [];
      const idx = all.findIndex(t => t.id === final.id);
      if (idx >= 0) all[idx] = final; else all.unshift(final);
      LS.set(K.therapists, all);
      return final;
    },
    async remove(id) {
      if (sb) await sbDelete('therapists', id);
      const all = (LS.get(K.therapists, []) || []).filter(t => t.id !== id);
      LS.set(K.therapists, all);
    }
  };

  // ---------------------------------------------------------- activity
  const activity = {
    async log(entry) {
      const row = Object.assign({
        id: 'A-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        when: new Date().toISOString(),
        read: false
      }, entry);
      if (sb) await sbUpsert('activity', toActivity(row));
      const all = LS.get(K.activity, []) || [];
      all.unshift(row);
      if (all.length > 200) all.length = 200;
      LS.set(K.activity, all);
      return row;
    },
    async list(limit) {
      if (sb) {
        const rows = await sbList('activity', { order: { col: 'occurred_at', asc: false }, limit: limit || 50 });
        if (rows) {
          const mapped = rows.map(fromActivity);
          LS.set(K.activity, mapped);
          return mapped;
        }
      }
      return (LS.get(K.activity, []) || []).slice(0, limit || 50);
    }
  };

  // ---------------------------------------------------------- settings (kv)
  const settings = {
    async get(key) {
      if (sb) {
        const { data } = await sb.from('settings').select('value').eq('key', key).maybeSingle();
        if (data) return data.value;
      }
      const all = LS.get(K.settings, {}) || {};
      return all[key] || null;
    },
    async set(key, value) {
      if (sb) await sbUpsert('settings', { key, value });
      const all = LS.get(K.settings, {}) || {};
      all[key] = value;
      LS.set(K.settings, all);
      return value;
    }
  };

  // ---------------------------------------------------------- ready / boot
  let _ready;
  async function ready() {
    if (_ready) return _ready;
    _ready = (async () => {
      if (!sb) return false;
      // Warm the cache so subsequent sync reads from localStorage are fresh.
      try {
        await Promise.all([
          services.list(),
          therapists.list(),
          members.list(),   // warm member cache for sign-in lookups
          // We pull a couple of months of bookings on boot for the calendar/admin
          (async () => {
            const past = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];
            const fut  = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];
            const { data } = await sb.from('bookings').select('*').gte('date', past).lte('date', fut).order('date', { ascending: false });
            if (data) LS.set(K.bookings, data.map(fromBooking));
          })()
        ]);
        return true;
      } catch (e) {
        console.warn('[TajData] boot warm failed:', e);
        return false;
      }
    })();
    return _ready;
  }

  // ---------------------------------------------------------- transactional email
  // Fires the secure `send-email` Edge Function. Recipients/content for
  // record-based types (booking/membership) are built server-side from the DB,
  // so the public (anon) site can only trigger predefined emails. Admin pages
  // share the authenticated client, so admin-only types (invoice/test) work.
  const email = {
    async send(payload) {
      if (!sb) return { ok: false, error: 'offline' };
      try {
        const { data, error } = await sb.functions.invoke('send-email', { body: payload });
        if (error) return { ok: false, error: error.message || String(error) };
        return data || { ok: true };
      } catch (e) {
        console.warn('[TajData.email]', e);
        return { ok: false, error: String(e && e.message || e) };
      }
    }
  };

  // Public API
  window.TajData = {
    connected: HAS_REMOTE && !!sb,
    config:    cfg,
    ready,
    bookings, members, services, therapists, activity, settings, email,
    // Low-level for emergencies / migrations
    _ls: LS, _sb: sb
  };

  // Kick off the boot warm-up early, but non-blocking
  if (sb) ready();
})();
