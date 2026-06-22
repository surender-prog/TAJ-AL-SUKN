-- 009_admins_owner_write.sql
-- Harden the admins table so the "owner-managed" model is enforced at the DB,
-- not just in the browser. Previously the only policy was
--   "auth all admins"  FOR ALL TO authenticated USING (true) WITH CHECK (true)
-- which let ANY signed-in admin (manager/receptionist) UPDATE their own row to
-- role='owner' and self-escalate, bypassing the client gating and the owner
-- check inside the admin-users Edge Function.
--
-- New posture:
--   • any authenticated admin may SELECT (the panel needs the list + to
--     resolve its own role);
--   • only an ACTIVE OWNER may INSERT / UPDATE / DELETE.
-- The admin-users Edge Function uses the service-role key, which bypasses RLS,
-- so create / set_password / delete keep working through it.
--
-- is_active_owner() is SECURITY DEFINER so it reads admins as the function
-- owner (bypassing RLS) — this avoids infinite policy recursion (a policy that
-- queries the same table it guards).

create or replace function public.is_active_owner()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and a.role = 'owner'
      and coalesce(a.status, 'active') = 'active'
  );
$$;

revoke all on function public.is_active_owner() from public;
grant execute on function public.is_active_owner() to authenticated;

drop policy if exists "auth all admins"     on public.admins;
drop policy if exists "admins select"       on public.admins;
drop policy if exists "admins insert owner" on public.admins;
drop policy if exists "admins update owner" on public.admins;
drop policy if exists "admins delete owner" on public.admins;

create policy "admins select" on public.admins
  for select to authenticated using (true);
create policy "admins insert owner" on public.admins
  for insert to authenticated with check (public.is_active_owner());
create policy "admins update owner" on public.admins
  for update to authenticated using (public.is_active_owner()) with check (public.is_active_owner());
create policy "admins delete owner" on public.admins
  for delete to authenticated using (public.is_active_owner());
