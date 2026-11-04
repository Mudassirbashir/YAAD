-- YAAD migration 2026-11-05 (P4 fix): the live public.item_aliases table was
-- created WITHOUT the item_id link column (only id, alias, language,
-- created_at exist), so per-item aliases could never be stored or read.
-- This adds the missing link. IDEMPOTENT: safe to re-run.
--
-- Standing 2026-10-21 rule: grant select to anon; full to authenticated/service_role
-- (already in place from 20260903 — repeated here harmlessly).

ALTER TABLE public.item_aliases
  ADD COLUMN IF NOT EXISTS item_id text references public.items(id) on delete cascade;

CREATE INDEX IF NOT EXISTS idx_item_aliases_item_id_link
  ON public.item_aliases(item_id);

GRANT SELECT ON public.item_aliases TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.item_aliases TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.item_aliases TO service_role;
