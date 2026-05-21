-- ============================================================
-- Patch 006: add members.frozen  (idempotent / re-runnable)
-- ============================================================
-- The admin member page (admin-member.js) lets staff freeze / reactivate a
-- membership via the "freeze" action. That state had no column, so the flag
-- was silently dropped on every Supabase write (PostgREST rejects unknown
-- columns) and never survived a re-hydration. This adds the column so the
-- frozen state persists like every other member field.
--
-- Safe to run repeatedly: ADD COLUMN IF NOT EXISTS is a no-op when present.
-- Existing rows are backfilled with false (active).
--
-- PREREQUISITE: deploy the updated taj-data.js (its members SCHEMA allow-list
-- now includes 'frozen', so admin freeze upserts send the column).
-- ============================================================

alter table public.members
  add column if not exists frozen boolean not null default false;

-- Nudge PostgREST to refresh its schema cache immediately so the new column is
-- usable without waiting for the automatic DDL reload (avoids a transient
-- "could not find the 'frozen' column in the schema cache" error).
notify pgrst, 'reload schema';
