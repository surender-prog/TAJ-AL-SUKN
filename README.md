# Taj Al Sukun — Spa &amp; Wellness Website

A luxury spa website and admin console for **Taj Al Sukun Spa &amp; Wellness**
in Al Fateh, Manama, Kingdom of Bahrain.

> *"Taj — the crown. Al Sukun — the stillness. Together, the highest form of inner peace."*

🌐 Live preview: `http://127.0.0.1:8090/` after `python3 serve.py`
📞 Bookings: WhatsApp [+973 35194422](https://wa.me/97335194422)

---

## What's in here

```
website/
├── *.html                       Public site + admin console (18 pages)
├── assets/
│   ├── css/style.css            Single minified stylesheet (~190 KB)
│   ├── css/style.src.css        Editable source — re-minify with build pass
│   ├── js/
│   │   ├── main.js              Public site interactions
│   │   ├── member-auth.js       Member sign-in / sign-up / portal
│   │   ├── page-cms.js          Patches public DOM from settings table
│   │   ├── supabase-config.js   URL + publishable key
│   │   ├── taj-data.js          Unified Supabase + localStorage data layer
│   │   ├── admin-shared.js      Activity-log helper + formatters
│   │   ├── admin.js             Main admin (overview, bookings, members, settings, calendar)
│   │   ├── admin-pages.js       Website Pages CMS (editor + image picker)
│   │   ├── admin-service.js     Service editor (full page)
│   │   ├── admin-payment.js     Payment capture (full page)
│   │   ├── admin-invoice.js     Invoice / receipt
│   │   ├── admin-booking.js     Booking detail
│   │   ├── admin-new-booking.js Admin new booking wizard
│   │   ├── admin-member.js      Member detail
│   │   └── admin-new-member.js  Admin new member wizard
│   └── images/                  Web-optimized photos (1920px max, 82% JPEG)
├── db/
│   ├── README.md                Supabase setup walkthrough
│   ├── 001_initial_schema.sql   Full DDL + RLS + seed data (10 tables, 13 services, 5 therapists, 3 tiers, etc.)
│   ├── 002_fix_activity_rls.sql Patch — open bookings/members/activity to publishable key
│   └── 003_settings_rls.sql     Patch — open settings/hours/tiers/admins to publishable key
├── approvals/
│   ├── build-v1.py              Re-generates client approval deck (vector PDFs)
│   ├── feedback-template.html   Per-page feedback page styled in brand
│   └── style.css                Approval-deck print stylesheet
└── README.md                    You are here
```

## How the data layer works

Every save flows through `TajData` (see `assets/js/taj-data.js`):

- Supabase is the source of truth when the publishable key is configured
- A localStorage mirror keeps the site working offline / unconfigured
- All store keys (`taj-bookings`, `taj-members`, `taj-services`, etc.) stay
  in sync — read anywhere via `await TajData.<store>.list()`
- DB columns are snake_case; JS uses a mix — translation happens in the layer
- A per-table whitelist strips UI-only fields before sending to PostgREST
- The "● Live · Supabase" pill in the admin top bar shows connection status

### Flows already migrated to Supabase

| Flow | File | Tables touched |
|---|---|---|
| Public booking submission | `main.js` | `bookings` + `activity` |
| Member signup / profile / sign-in | `member-auth.js` | `members` + `activity` |
| Admin new booking | `admin-new-booking.js` | `bookings` + `activity` |
| Admin new member | `admin-new-member.js` | `members` + `activity` |
| Service editor (CRUD + duplicate + toggle) | `admin-service.js` + `admin.js` | `services` + `activity` |
| Payment capture | `admin-payment.js` | `bookings` + `activity` |
| Website Pages CMS (text + images per page) | `admin-pages.js` | `settings` |

## Website Pages CMS

The admin's **Content → Website Pages** tab lets you edit every editorial
section across the public site without touching code:

- **Home** — 13 blocks: hero, loving-through-touch, stress-fades, benefits,
  welcome, treatments, after-visit, philosophy, founder, testimonials,
  pricing, 10%-off, closing CTA
- **About** — hero, story, philosophy quote, values, team, CTA
- **Services** — hero, intro, spa-director quote, packages, CTA
- **Gallery** — hero, intro, closing quote, Instagram CTA
- **Membership** — hero, intro, compare, portal, process, quote, CTA
- **Contact** — hero, visit, WhatsApp CTA
- **Footer (global)** — brand tagline + address/phone/whatsapp/email/hours

Every `data-cms="page-<slug>.<block>.<field>"` attribute on the public HTML
gets swapped at runtime by `page-cms.js`. Images, text, links — all editable.
A 22-image library picker plus paste-URL support is built in.

## Local development

```bash
# Start the preview server (Python 3, no deps)
cd /path/to/website
python3 serve.py
# → http://127.0.0.1:8090/
```

Or use any static server — every file is plain HTML/CSS/JS.

## Supabase project

The site connects to a Supabase project (URL + publishable key in
`assets/js/supabase-config.js`). The publishable key is safe to expose;
Row-Level Security policies on the DB protect data. To set up a fresh DB,
run the three SQL files in `db/` in order via the Supabase SQL Editor.
See `db/README.md` for the walkthrough.

## Brand

| Aspect | |
|---|---|
| Brand colors | `#2A1810` deep · `#B07849` copper · `#D4B896` gold · `#F5EDE0` cream |
| Typography | Cormorant Garamond (serif display) + Jost (sans body) |
| Currency | BHD with 3 decimals |
| Tax | 10% VAT (Bahrain) |
| Primary contact | WhatsApp `+973 35194422` |

## License

© Taj Al Sukun Spa W.L.L. — All rights reserved.
