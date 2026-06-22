-- 008_admin_user_profiles.sql
-- Richer admin user profiles + link to the Supabase Auth login.
--   user_id  → the Supabase Auth uid (set when the panel provisions a login;
--              lets the admin-users Edge Function reset/delete by id without
--              an email lookup). Null for legacy rows created manually.
--   phone / title / notes → profile fields shown in the Admin Users editor.
-- `status` already exists (active/disabled). RLS is unchanged: the admins
-- table stays authenticated-only (no anon access); credential operations run
-- in the owner-gated admin-users Edge Function with the service-role key.

alter table public.admins add column if not exists user_id uuid;
alter table public.admins add column if not exists phone   text;
alter table public.admins add column if not exists title   text;
alter table public.admins add column if not exists notes   text;
alter table public.admins alter column status set default 'active';

create index if not exists admins_email_lower_idx on public.admins (lower(email));
