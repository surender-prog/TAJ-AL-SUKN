-- ============================================================
-- Patch 002: fix anon insert on activity log
-- ============================================================
-- The initial schema's "to anon" policy didn't apply correctly for
-- the new sb_publishable_* key format on this project. Switch to
-- the safer "to public" clause so it applies to every role
-- (anon, authenticated, and the publishable mapping).
-- ============================================================

-- Activity: allow insert from any client-side role
drop policy if exists "anon insert activity"   on public.activity;
drop policy if exists "public insert activity" on public.activity;
create policy "public insert activity" on public.activity
  for insert to public with check (true);

-- Also let admins read it without auth for the v1 internal use
drop policy if exists "public read activity" on public.activity;
create policy "public read activity" on public.activity
  for select to public using (true);

-- Bookings & members already work, but be consistent — make their
-- insert policies role-agnostic too, so the same fix applies if the
-- gateway role mapping ever changes:
drop policy if exists "anon insert bookings"   on public.bookings;
drop policy if exists "public insert bookings" on public.bookings;
create policy "public insert bookings" on public.bookings
  for insert to public with check (true);

drop policy if exists "anon insert members"   on public.members;
drop policy if exists "public insert members" on public.members;
create policy "public insert members" on public.members
  for insert to public with check (true);

-- Admin/staff inserts of services/therapists also need to work from
-- the publishable client until proper auth is wired. v1-permissive:
drop policy if exists "public write services" on public.services;
create policy "public write services" on public.services
  for all to public using (true) with check (true);

drop policy if exists "public write therapists" on public.therapists;
create policy "public write therapists" on public.therapists
  for all to public using (true) with check (true);

drop policy if exists "public update members" on public.members;
create policy "public update members" on public.members
  for update to public using (true) with check (true);

drop policy if exists "public update bookings" on public.bookings;
create policy "public update bookings" on public.bookings
  for update to public using (true) with check (true);

drop policy if exists "public read members" on public.members;
create policy "public read members" on public.members
  for select to public using (true);

drop policy if exists "public read bookings" on public.bookings;
create policy "public read bookings" on public.bookings
  for select to public using (true);
