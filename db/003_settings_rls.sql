-- ============================================================
-- Patch 003: open settings (+ remaining tables) to public for v1
-- ============================================================
-- The Website Pages CMS reads/writes `settings.page-<slug>` JSONB
-- with the publishable key. Add the same v1-permissive public
-- policies we used for the other tables.
-- Tighten before launch (admin auth required to write settings).
-- ============================================================

drop policy if exists "public read settings"  on public.settings;
create policy "public read settings"  on public.settings  for select to public using (true);

drop policy if exists "public write settings" on public.settings;
create policy "public write settings" on public.settings  for all    to public using (true) with check (true);

-- While we're here: open hours / tiers / payment_methods / admins
-- the same way so the admin UI can write them without a service-role key.
drop policy if exists "public write hours" on public.hours;
create policy "public write hours" on public.hours
  for all to public using (true) with check (true);

drop policy if exists "public write tiers" on public.tiers;
create policy "public write tiers" on public.tiers
  for all to public using (true) with check (true);

drop policy if exists "public write payment_methods" on public.payment_methods;
create policy "public write payment_methods" on public.payment_methods
  for all to public using (true) with check (true);

drop policy if exists "public write admins" on public.admins;
create policy "public write admins" on public.admins
  for all to public using (true) with check (true);
