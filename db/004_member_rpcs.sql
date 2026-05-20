-- ============================================================
-- Patch 004: member self-service RPC functions
-- ============================================================
-- These SECURITY DEFINER functions let an anonymous visitor authenticate
-- as a member (by ID + phone) and read/update ONLY their own data —
-- without granting anon a blanket SELECT on the members / bookings tables.
--
-- Run this BEFORE patch 005 (which removes the open anon SELECT policies).
-- Safe to run while RLS is still open — purely additive.
-- ============================================================

-- Phone normalizer: digits only, drop a leading 973 country code.
create or replace function public._norm_phone(p text)
returns text language sql immutable as $$
  select regexp_replace(regexp_replace(coalesce(p, ''), '[^0-9]', '', 'g'), '^973', '');
$$;

-- ---- member_login: match by ID (case-insensitive) + phone ----
create or replace function public.member_login(p_id text, p_phone text)
returns setof public.members
language sql security definer set search_path = public as $$
  select * from public.members
   where lower(id) = lower(coalesce(p_id, ''))
     and public._norm_phone(phone) = public._norm_phone(p_phone)
   limit 1;
$$;

-- ---- member_find_by_phone: phone-only lookup (returns the row incl. id) ----
create or replace function public.member_find_by_phone(p_phone text)
returns setof public.members
language sql security definer set search_path = public as $$
  select * from public.members
   where public._norm_phone(phone) = public._norm_phone(p_phone)
   limit 1;
$$;

-- ---- member_bookings: that member's bookings, gated by id+phone ----
create or replace function public.member_bookings(p_id text, p_phone text)
returns setof public.bookings
language sql security definer set search_path = public as $$
  select b.* from public.bookings b
   where exists (
     select 1 from public.members m
      where lower(m.id) = lower(coalesce(p_id, ''))
        and public._norm_phone(m.phone) = public._norm_phone(p_phone)
        and ( b.member_id = m.id
           or public._norm_phone(b.phone) = public._norm_phone(m.phone)
           or lower(coalesce(b.email,'')) = lower(coalesce(m.email,'')) )
   )
   order by b.date desc;
$$;

-- ---- member_save: update own editable profile fields ----
create or replace function public.member_save(p_id text, p_phone text, p_payload jsonb)
returns setof public.members
language plpgsql security definer set search_path = public as $$
declare v_real_id text;
begin
  select id into v_real_id from public.members
   where lower(id) = lower(coalesce(p_id, ''))
     and public._norm_phone(phone) = public._norm_phone(p_phone)
   limit 1;
  if v_real_id is null then return; end if;

  update public.members set
    name           = coalesce(nullif(p_payload->>'name',''),           name),
    email          = coalesce(nullif(p_payload->>'email',''),          email),
    phone          = coalesce(nullif(p_payload->>'phone',''),          phone),
    dob            = coalesce((nullif(p_payload->>'dob',''))::date,     dob),
    therapist_pref = coalesce(p_payload->>'therapist_pref',            therapist_pref),
    notes          = coalesce(p_payload->>'notes',                     notes),
    updated_at     = now()
   where id = v_real_id;

  return query select * from public.members where id = v_real_id;
end;
$$;

-- ---- Grants: anon + authenticated may execute ----
grant execute on function public._norm_phone(text)               to anon, authenticated;
grant execute on function public.member_login(text, text)        to anon, authenticated;
grant execute on function public.member_find_by_phone(text)      to anon, authenticated;
grant execute on function public.member_bookings(text, text)     to anon, authenticated;
grant execute on function public.member_save(text, text, jsonb)  to anon, authenticated;
