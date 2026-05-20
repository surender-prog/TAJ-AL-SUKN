-- ============================================================
-- Patch 005: PRODUCTION Row-Level Security
-- ============================================================
-- Replaces the v1-permissive "to public" policies with a real model:
--
--   anon (public site, publishable key):
--     · INSERT bookings (website booking)
--     · INSERT members  (signup)
--     · INSERT activity  (event logging)
--     · SELECT services / therapists / hours / tiers / payment_methods
--       (visible rows only) and settings (page CMS content)
--     · NO direct SELECT/UPDATE on members or bookings — member
--       self-service goes through the SECURITY DEFINER RPCs in patch 004
--
--   authenticated (admin, logged in via Supabase Auth):
--     · FULL read/write on every table
--
-- PREREQUISITES (do these first):
--   1. Run patch 004 (member RPCs).
--   2. Deploy the updated JS (member-auth.js + taj-data.js use the RPCs).
--   3. Create the admin user in Supabase Auth (Dashboard → Authentication
--      → Users → Add user → tick "Auto Confirm User").
--   4. Confirm admin login works.
-- Only THEN run this patch.
-- ============================================================

-- ---------- drop the v1-permissive public policies ----------
drop policy if exists "public insert bookings"  on public.bookings;
drop policy if exists "public update bookings"  on public.bookings;
drop policy if exists "public read bookings"    on public.bookings;
drop policy if exists "anon insert bookings"    on public.bookings;
drop policy if exists "member read own bookings" on public.bookings;

drop policy if exists "public insert members"   on public.members;
drop policy if exists "public update members"   on public.members;
drop policy if exists "public read members"     on public.members;
drop policy if exists "anon insert members"     on public.members;
drop policy if exists "member self read"        on public.members;
drop policy if exists "member self update"      on public.members;

drop policy if exists "public write services"   on public.services;
drop policy if exists "public write therapists" on public.therapists;
drop policy if exists "public write settings"   on public.settings;
drop policy if exists "public write hours"      on public.hours;
drop policy if exists "public write tiers"      on public.tiers;
drop policy if exists "public write payment_methods" on public.payment_methods;
drop policy if exists "public write admins"     on public.admins;
drop policy if exists "public read settings"    on public.settings;
drop policy if exists "public insert activity"  on public.activity;
drop policy if exists "public read activity"    on public.activity;
drop policy if exists "anon insert activity"    on public.activity;

-- ---------- BOOKINGS ----------
-- anon: insert only (website booking). reads happen via member_bookings RPC.
create policy "anon insert bookings" on public.bookings
  for insert to anon with check (true);
create policy "auth all bookings" on public.bookings
  for all to authenticated using (true) with check (true);

-- ---------- MEMBERS ----------
-- anon: insert only (signup). reads/updates via member_login / member_save RPC.
create policy "anon insert members" on public.members
  for insert to anon with check (true);
create policy "auth all members" on public.members
  for all to authenticated using (true) with check (true);

-- ---------- ACTIVITY ----------
-- anon: insert only (booking/signup events). admins read.
create policy "anon insert activity" on public.activity
  for insert to anon with check (true);
create policy "auth all activity" on public.activity
  for all to authenticated using (true) with check (true);

-- ---------- PUBLIC-FACING CATALOG (anon may read, admin writes) ----------
-- services: only active + show_on_website to anon
drop policy if exists "anon read services" on public.services;
create policy "anon read services" on public.services
  for select to anon using (status = 'active' and show_on_website = true);
create policy "auth all services" on public.services
  for all to authenticated using (true) with check (true);

-- therapists: only active to anon
drop policy if exists "anon read therapists" on public.therapists;
create policy "anon read therapists" on public.therapists
  for select to anon using (status = 'active');
create policy "auth all therapists" on public.therapists
  for all to authenticated using (true) with check (true);

-- hours / tiers / payment_methods: public read, admin write
drop policy if exists "anon read hours" on public.hours;
create policy "anon read hours" on public.hours for select to anon using (true);
create policy "auth all hours" on public.hours for all to authenticated using (true) with check (true);

drop policy if exists "anon read tiers" on public.tiers;
create policy "anon read tiers" on public.tiers for select to anon using (true);
create policy "auth all tiers" on public.tiers for all to authenticated using (true) with check (true);

drop policy if exists "anon read payment_methods" on public.payment_methods;
create policy "anon read payment_methods" on public.payment_methods
  for select to anon using (enabled = true);
create policy "auth all payment_methods" on public.payment_methods
  for all to authenticated using (true) with check (true);

-- settings: page-CMS content is public-readable; only admins write
create policy "anon read settings" on public.settings
  for select to anon using (true);
create policy "auth all settings" on public.settings
  for all to authenticated using (true) with check (true);

-- admins table: authenticated only
drop policy if exists "auth all admins" on public.admins;
create policy "auth all admins" on public.admins
  for all to authenticated using (true) with check (true);

-- ============================================================
-- After running: verify with the publishable key that
--   · SELECT on services/hours/tiers still returns rows
--   · SELECT on members/bookings returns NOTHING (RLS blocks)
--   · member_login RPC still returns the matching member
-- and that the logged-in admin can read/write everything.
-- ============================================================
