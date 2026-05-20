# Taj Al Sukun — Supabase Setup

This connects the spa site & admin to your Supabase project at
**https://vrljiousxfvjvkhkftwt.supabase.co**.

The integration is **dual-mode**: until the key is configured, everything keeps
working on localStorage (so demos never break). Once the key is in place,
Supabase becomes the source of truth and localStorage acts as an offline cache.

## 1 · Run the schema

1. Open Supabase Dashboard → **SQL Editor** → **New query**.
2. Open `db/001_initial_schema.sql`, copy the entire file, paste, click **Run**.
3. Verify under **Table Editor** that you see:
   `members · therapists · services · bookings · hours · payment_methods ·
   tiers · settings · activity · admins`.

The migration is idempotent — safe to re-run if needed. It also seeds 13
services, 5 therapists, 3 tiers, payment methods, hours, and spa settings.

## 2 · Get your anon (publishable) key

Supabase Dashboard → **Project Settings → API**:

- Copy **Project URL** (already filled in: `https://vrljiousxfvjvkhkftwt.supabase.co`).
- Copy **anon public** key (long JWT starting with `eyJ...`) — *or* the
  modern `sb_publishable_...` if your project uses the new key format.

## 3 · Paste the key

Open `assets/js/supabase-config.js` and set:

```js
window.TAJ_SUPABASE = {
  URL:      'https://vrljiousxfvjvkhkftwt.supabase.co',
  ANON_KEY: 'eyJhbGc…YOUR_KEY_HERE…',
  ENABLED:  false   // (leave; auto-toggles based on key presence)
};
```

That's it. Reload any page — you'll see the **"Live · Supabase"** green pill
in the admin top bar where it currently says **"Local"** in red.

## 4 · Verify

1. Open `admin.html` → top bar shows **Live · Supabase** (green pulse).
2. Add a service in Settings → Services Master → **+ Add Service**.
3. Open the project's **Table Editor → services** in Supabase — you'll see the
   row appear.
4. Open `services.html` in an incognito window — the new service appears on
   the public site too. (Public pages read with the anon key + RLS rules.)

## 5 · Locking it down (optional, before launch)

The shipped policies are permissive for v1 to keep things working without
custom auth. Before you go public:

- Tighten the `member self read/update` policies to require a JWT and match
  `auth.uid()` against a `members.user_id` column you add later.
- Restrict `auth all *` policies to a specific role: replace
  `to authenticated` with a check on a custom claim, e.g.
  `using (auth.jwt() ->> 'role' = 'admin')`.
- Add real Supabase Auth (Email / Magic-link) for admin login instead of
  the current sessionStorage trick.

## What's stored where

| Table             | Source of truth | Notes                                              |
|-------------------|-----------------|----------------------------------------------------|
| `bookings`        | Supabase        | All website + admin bookings flow here             |
| `members`         | Supabase        | Sign-up + admin enrollment                         |
| `services`        | Supabase        | Drives public services grid + booking picker       |
| `therapists`      | Supabase        | Drives the calendar therapist view                 |
| `hours`           | Supabase        | Used in calendar open/close window                 |
| `payment_methods` | Supabase        | Toggles which methods appear in the payment page   |
| `tiers`           | Supabase        | Membership pricing                                 |
| `settings`        | Supabase        | Key/value for spa info, tax, policy text           |
| `activity`        | Supabase        | Audit log, last 200 items                          |
| `admins`          | Supabase        | Settings → Admin Users list (not for auth)         |

All tables also have a `localStorage` mirror with the same keys you've been
using (`taj-bookings`, `taj-members`, etc.) so the site survives offline and
falls back gracefully if the key is removed.

## Troubleshooting

- **Status pill stays red on admin** → Key is empty or too short. Reload after
  pasting; clear the browser cache if a Service Worker is involved.
- **Insert returns "new row violates row-level security policy"** → A policy
  doesn't allow your role to insert. Check the migration ran fully and that
  RLS policies are listed under each table.
- **Data is stale** → The cache warms on every page load. Hard refresh
  (Cmd + Shift + R) or clear `taj-*` localStorage to force a re-pull.
