-- 007_member_comp_balance.sql
-- Durable per-category complimentary balance for members.
-- comp_balance JSONB holds the REMAINING free services for the year:
--   { "massages": n, "hammams": n, "foot": n, "guest": n }
-- Set on enrollment / renewal / upgrade from the tier allowance, decremented
-- when a complimentary service is redeemed at booking, and editable from the
-- member page's "Adjust" button. Applied to the live project on 2026-06.

alter table public.members add column if not exists comp_balance jsonb;

-- Backfill from each tier's allowance (matches the Membership Tiers editor:
-- Silver 2/0/1/0, Gold 6/1/2/1).
update public.members set comp_balance = case tier
  when 'Gold'   then '{"massages":6,"hammams":1,"foot":2,"guest":1}'::jsonb
  when 'Silver' then '{"massages":2,"hammams":0,"foot":1,"guest":0}'::jsonb
  else '{"massages":0,"hammams":0,"foot":0,"guest":0}'::jsonb
end
where comp_balance is null;
