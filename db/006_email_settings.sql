-- 006_email_settings.sql
-- Secure store for the transactional-email SMTP account.
-- RLS: only the authenticated admin (and the service-role Edge Function) can
-- access it. There is intentionally NO anon policy, so the public website can
-- never read the SMTP credentials. Applied to the live project on 2026-06.

create table if not exists public.email_settings (
  id smallint primary key default 1,
  enabled boolean not null default false,
  host text,
  port integer default 587,
  security text default 'tls',           -- 'ssl' | 'tls' (STARTTLS) | 'none'
  username text,
  password text,
  from_name text,
  from_email text,
  reply_to text,
  admin_alert_email text,
  send_booking boolean not null default true,
  send_membership boolean not null default true,
  send_invoice boolean not null default true,
  send_admin_alert boolean not null default true,
  updated_at timestamptz default now(),
  constraint email_settings_singleton check (id = 1)
);

alter table public.email_settings enable row level security;

drop policy if exists "auth all email_settings" on public.email_settings;
create policy "auth all email_settings" on public.email_settings
  for all to authenticated using (true) with check (true);
-- (no anon policy → the public/anon role is denied all access)

insert into public.email_settings (id) values (1) on conflict (id) do nothing;
