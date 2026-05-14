-- ============================================================
-- Taj Al Sukn Spa — Initial database schema
-- Run this once in the Supabase SQL Editor.
-- Safe to re-run: uses CREATE TABLE IF NOT EXISTS + ON CONFLICT.
-- ============================================================

-- ---------- helpers ----------
create extension if not exists "pgcrypto";

create or replace function tasukn_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ---------- members ----------
create table if not exists public.members (
  id            text primary key,
  name          text not null,
  email         text,
  phone         text,
  tier          text default 'Silver',
  start_date    date,
  end_date      date,
  discount      int  default 0,
  balance       numeric(10,3) default 0,
  total_spent   numeric(10,3) default 0,
  services_included int default 0,
  services_used     int default 0,
  joined_via    text,
  payment_method text,
  dob           date,
  notes         text,
  therapist_pref text,
  status        text default 'active',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
create index if not exists members_phone_idx on public.members (phone);
create index if not exists members_email_idx on public.members (email);
drop trigger if exists members_touch on public.members;
create trigger members_touch before update on public.members for each row execute function tasukn_updated_at();

-- ---------- therapists ----------
create table if not exists public.therapists (
  id          text primary key,
  name        text not null,
  role        text,
  specialty   text,
  langs       text[],
  exp         text,
  phone       text,
  status      text default 'active',
  commission  numeric(5,2),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
drop trigger if exists therapists_touch on public.therapists;
create trigger therapists_touch before update on public.therapists for each row execute function tasukn_updated_at();

-- ---------- services ----------
create table if not exists public.services (
  id              text primary key,
  name            text not null,
  category        text,
  tag             text,
  description     text,
  long_description text,
  duration        text,
  price           numeric(10,3),
  price_alt       numeric(10,3),
  member_price    numeric(10,3),
  image           text,
  show_on_website boolean default true,
  show_in_booking boolean default true,
  featured        boolean default false,
  member_only     boolean default false,
  status          text default 'active',
  sort            int default 100,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create index if not exists services_status_idx on public.services (status, sort);
drop trigger if exists services_touch on public.services;
create trigger services_touch before update on public.services for each row execute function tasukn_updated_at();

-- ---------- bookings ----------
create table if not exists public.bookings (
  id           text primary key,
  member_id    text references public.members(id) on delete set null,
  name         text,
  phone        text,
  email        text,
  service      text not null,
  service_id   text references public.services(id) on delete set null,
  therapist    text,
  therapist_id text references public.therapists(id) on delete set null,
  date         date not null,
  time         text,
  duration     int default 60,
  price        numeric(10,3),
  status       text default 'pending',
  tier         text,
  payment      jsonb,
  payment_method text,
  paid         boolean default false,
  paid_at      timestamptz,
  notes        text,
  invoice      jsonb,
  source       text default 'website',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
create index if not exists bookings_date_idx on public.bookings (date desc);
create index if not exists bookings_member_idx on public.bookings (member_id);
create index if not exists bookings_status_idx on public.bookings (status);
drop trigger if exists bookings_touch on public.bookings;
create trigger bookings_touch before update on public.bookings for each row execute function tasukn_updated_at();

-- ---------- hours ----------
create table if not exists public.hours (
  day        text primary key,    -- 'mon','tue','wed','thu','fri','sat','sun'
  open       text,                 -- '10:00'
  close      text,                 -- '22:00'
  closed     boolean default false,
  updated_at timestamptz default now()
);
drop trigger if exists hours_touch on public.hours;
create trigger hours_touch before update on public.hours for each row execute function tasukn_updated_at();

-- ---------- payment methods ----------
create table if not exists public.payment_methods (
  id         text primary key,
  name       text not null,
  enabled    boolean default true,
  fee        numeric(5,2) default 0,
  updated_at timestamptz default now()
);
drop trigger if exists payment_methods_touch on public.payment_methods;
create trigger payment_methods_touch before update on public.payment_methods for each row execute function tasukn_updated_at();

-- ---------- membership tiers ----------
create table if not exists public.tiers (
  id             text primary key,    -- 'silver','gold','platinum'
  name           text not null,
  price          numeric(10,3),
  discount       int default 0,
  free_services  int default 0,
  color          text,
  updated_at     timestamptz default now()
);
drop trigger if exists tiers_touch on public.tiers;
create trigger tiers_touch before update on public.tiers for each row execute function tasukn_updated_at();

-- ---------- settings (key/value) ----------
-- Used for the misc Settings tab: tax, currency, policy text, spa info.
create table if not exists public.settings (
  key        text primary key,
  value      jsonb,
  updated_at timestamptz default now()
);
drop trigger if exists settings_touch on public.settings;
create trigger settings_touch before update on public.settings for each row execute function tasukn_updated_at();

-- ---------- activity log ----------
create table if not exists public.activity (
  id         text primary key,
  type       text,             -- booking|member|payment|note|confirm|cancel
  title      text,
  description text,
  ref        text,
  ref_type   text,
  actor      text,
  read       boolean default false,
  occurred_at timestamptz default now()
);
create index if not exists activity_when_idx on public.activity (occurred_at desc);

-- ---------- admin users ----------
-- Lightweight admin presence; real auth uses Supabase Auth. This row is mostly
-- for the settings → admins table view, not for actual login (that's in auth.users).
create table if not exists public.admins (
  id         text primary key,
  name       text,
  email      text unique,
  role       text default 'staff',  -- owner|manager|staff
  status     text default 'active',
  created_at timestamptz default now()
);

-- ============================================================
-- Row-Level Security
-- ============================================================
-- Strategy:
-- · Public can INSERT bookings + members (signup) and READ services/hours/tiers
--   that are marked visible (status=active, show_on_website=true).
-- · Authenticated admin users (JWT role 'service_role' OR JWT user_metadata
--   role='admin') can do everything.
-- · Members can see/edit their own member row + their own bookings via a
--   simple "member token" stored client-side after signup/signin.
--
-- Simple v1: enable RLS but with permissive anon policies suitable for an
-- early-launch internal app. Tighten when you go fully public.

alter table public.members          enable row level security;
alter table public.therapists       enable row level security;
alter table public.services         enable row level security;
alter table public.bookings         enable row level security;
alter table public.hours            enable row level security;
alter table public.payment_methods  enable row level security;
alter table public.tiers            enable row level security;
alter table public.settings         enable row level security;
alter table public.activity         enable row level security;
alter table public.admins           enable row level security;

-- ---- read policies (anon can SELECT public-facing data) ----
drop policy if exists "anon read services" on public.services;
create policy "anon read services" on public.services
  for select to anon using (status = 'active' and show_on_website = true);

drop policy if exists "anon read hours" on public.hours;
create policy "anon read hours" on public.hours for select to anon using (true);

drop policy if exists "anon read tiers" on public.tiers;
create policy "anon read tiers" on public.tiers for select to anon using (true);

drop policy if exists "anon read payment_methods" on public.payment_methods;
create policy "anon read payment_methods" on public.payment_methods
  for select to anon using (enabled = true);

drop policy if exists "anon read therapists" on public.therapists;
create policy "anon read therapists" on public.therapists for select to anon using (status = 'active');

-- ---- write policies (anon can submit booking + sign up) ----
drop policy if exists "anon insert bookings" on public.bookings;
create policy "anon insert bookings" on public.bookings for insert to anon with check (true);

drop policy if exists "anon insert members" on public.members;
create policy "anon insert members" on public.members for insert to anon with check (true);

-- A member can read & update their own record by matching ID
drop policy if exists "member self read" on public.members;
create policy "member self read" on public.members for select to anon
  using (true);  -- v1: permissive; tighten once member auth tokens are in place

drop policy if exists "member self update" on public.members;
create policy "member self update" on public.members for update to anon
  using (true) with check (true);  -- v1: permissive

drop policy if exists "member read own bookings" on public.bookings;
create policy "member read own bookings" on public.bookings for select to anon using (true);

-- ---- admin = all (matched via JWT) ----
-- Anyone signed in with Supabase Auth gets full access. Lock this down to a
-- specific role/email list once your admin auth is live.
drop policy if exists "auth all members" on public.members;
create policy "auth all members" on public.members for all to authenticated using (true) with check (true);

drop policy if exists "auth all therapists" on public.therapists;
create policy "auth all therapists" on public.therapists for all to authenticated using (true) with check (true);

drop policy if exists "auth all services" on public.services;
create policy "auth all services" on public.services for all to authenticated using (true) with check (true);

drop policy if exists "auth all bookings" on public.bookings;
create policy "auth all bookings" on public.bookings for all to authenticated using (true) with check (true);

drop policy if exists "auth all hours" on public.hours;
create policy "auth all hours" on public.hours for all to authenticated using (true) with check (true);

drop policy if exists "auth all payment_methods" on public.payment_methods;
create policy "auth all payment_methods" on public.payment_methods for all to authenticated using (true) with check (true);

drop policy if exists "auth all tiers" on public.tiers;
create policy "auth all tiers" on public.tiers for all to authenticated using (true) with check (true);

drop policy if exists "auth all settings" on public.settings;
create policy "auth all settings" on public.settings for all to authenticated using (true) with check (true);

drop policy if exists "auth all activity" on public.activity;
create policy "auth all activity" on public.activity for all to authenticated using (true) with check (true);

drop policy if exists "auth all admins" on public.admins;
create policy "auth all admins" on public.admins for all to authenticated using (true) with check (true);

-- Activity log: anon can insert (for booking events) but only read their own ref
drop policy if exists "anon insert activity" on public.activity;
create policy "anon insert activity" on public.activity for insert to anon with check (true);

-- ============================================================
-- Seed data — only inserted if the table is empty
-- ============================================================

insert into public.tiers (id, name, price, discount, free_services, color)
values
  ('silver',   'Silver',   180, 10, 1, '#C0C0C0'),
  ('gold',     'Gold',     320, 15, 2, '#D4B896'),
  ('platinum', 'Platinum', 520, 20, 4, '#E5E4E2')
on conflict (id) do nothing;

insert into public.hours (day, open, close, closed) values
  ('mon','10:00','22:00',false),
  ('tue','10:00','22:00',false),
  ('wed','10:00','22:00',false),
  ('thu','10:00','22:00',false),
  ('fri','14:00','23:00',false),
  ('sat','10:00','23:00',false),
  ('sun','10:00','22:00',false)
on conflict (day) do nothing;

insert into public.payment_methods (id, name, enabled, fee) values
  ('pm-cash',    'Cash',                     true, 0),
  ('pm-card',    'Card (Visa/Mastercard)',   true, 2.5),
  ('pm-benefit', 'BenefitPay',               true, 0),
  ('pm-bank',    'Bank Transfer',            true, 0),
  ('pm-apple',   'Apple Pay',                true, 1.5)
on conflict (id) do nothing;

insert into public.services (id, name, category, tag, duration, price, price_alt, image, description, status, sort) values
  ('SV-01','Royal Hammam',     'Hammam',  'Signature',     '75 min',      45, null,'assets/images/spa-detail-2.jpg',     'An indulgent steam ritual featuring exfoliation and cleansing — purifying body and skin.','active',10),
  ('SV-02','Casablanca Hammam','Hammam',  '',              '60 min',      25, null,'assets/images/spa-detail-1.jpg',     'A signature wellness ritual combining steam, exfoliation, and cleansing for inner balance.','active',20),
  ('SV-03','Argan Oil Ritual', 'Massage', 'Signature',     '60 / 90 min', 40, 55,  'assets/images/therapist-products.jpg','A luxurious massage using nutrient-rich Moroccan argan to nourish skin and ease tension.','active',30),
  ('SV-04','Hot Stone Therapy','Massage', 'Signature',     '60 / 90 min', 35, 50,  'assets/images/spa-relax-2.jpg',      'Warm volcanic stones relax muscles, enhance circulation, and promote complete wellbeing.','active',40),
  ('SV-05','Aroma Relaxing',   'Massage', '',              '60 / 90 min', 35, 50,  'assets/images/lounge-flowers.jpg',   'A deeply calming massage using aromatic essential oils to ease stress and balance the senses.','active',50),
  ('SV-06','Balinese Massage', 'Massage', '',              '60 / 90 min', 35, 50,  'assets/images/spa-relax-1.jpg',      'A holistic therapy blending gentle stretches, rhythmic strokes, and aromatic oils.','active',60),
  ('SV-07','Royal Thai',       'Massage', '',              '60 / 90 min', 30, 45,  'assets/images/treatment-room.jpg',   'Traditional rhythmic stretching and assisted movements to restore energy flow.','active',70),
  ('SV-08','Swedish Massage',  'Massage', '',              '60 / 90 min', 25, 40,  'assets/images/sanctuary-bed.jpg',    'A classic full-body massage using gentle to medium pressure to ease tension.','active',80),
  ('SV-09','Deep Tissue',      'Massage', 'Signature',     '60 / 90 min', 30, 45,  'assets/images/deep-tissue.jpg',      'Targeted release of chronic tension, improved mobility, and lasting muscular recovery.','active',90),
  ('SV-10','Reflexology',      'Foot',    '',              '30 min',      15, null,'assets/images/spa-relax-3.jpg',      'Therapeutic foot massage applying gentle pressure to specific reflexes to ease stress.','active',100),
  ('SV-11','Foot Relaxing',    'Foot',    '',              '30 min',      10, null,'assets/images/therapist-prep.jpg',   'A soothing foot massage that relieves fatigue and supports overall balance.','active',110),
  ('SV-12','Couples Sanctuary','Couple',  '',              '60 / 90 min', 75, 110, 'assets/images/couples-massage.jpg',  'A side-by-side experience for two — choose your massage in a private suite with candles & tea.','active',120),
  ('SV-13','Sultan Suite',     'Package', 'Most Popular',  '120 min',     50, null,'assets/images/spa-foyer.jpg',        'A premium sequence designed for full-day restoration.','active',130)
on conflict (id) do nothing;

insert into public.therapists (id, name, role, specialty, langs, exp, phone, status, commission) values
  ('T-01','Layla Hassan',       'Therapist',           'Hammam, Body Treatments',        array['EN','AR','TH'], '15 yrs','+973 35001500','active',25),
  ('T-02','Rania Saleh',        'Therapist',           'Argan Oil, Deep Tissue',          array['EN','AR'],      '8 yrs', '+973 33445566','active',25),
  ('T-03','Mariam Al Hashimi',  'Therapist',           'Balinese, Aromatherapy',          array['EN','ID'],      '6 yrs', '+973 36558899','active',22),
  ('T-04','Rahma Ibrahim',      'Hammam Specialist',   'Royal Hammam, Body Scrub',        array['EN','AR','FR'], '10 yrs','+973 38112233','active',25),
  ('T-05','Lina Nakamura',      'Foot Therapist',      'Reflexology, Foot Relaxing',      array['EN','JP'],      '4 yrs', '+973 37885544','off',   20)
on conflict (id) do nothing;

insert into public.settings (key, value) values
  ('spa-info', jsonb_build_object(
    'name', 'Taj Al Sukn Spa & Wellness',
    'tradingName', 'Taj Al Sukn Spa W.L.L.',
    'whatsapp', '+973 35194422',
    'phone', '+973 77924422',
    'email', 'hello@tasukunspa.com',
    'adminEmail', 'admin@tasukunspa.com',
    'cr', '182250-1',
    'tax', '200000123400002',
    'address', 'Al Fateh, Manama · Complex 324 · Road 2416 · Building 950, Kingdom of Bahrain'
  )),
  ('tax', jsonb_build_object('vat', 10, 'label', 'VAT', 'enabled', true, 'currency', 'BHD', 'decimals', 3, 'effectiveDate', '2019-01-01')),
  ('policy', jsonb_build_object(
    'cancellation24h', 100,
    'cancellationWithin', 50,
    'noShow', 0,
    'text', 'Cancellations made more than 24 hours before the appointment receive a full refund. Within 24 hours, a 50% fee applies. No-shows are charged in full. Members may reschedule once at no cost.'
  ))
on conflict (key) do nothing;

-- ============================================================
-- Done. Verify in Supabase → Table editor.
-- ============================================================
