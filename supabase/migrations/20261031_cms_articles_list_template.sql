-- Migration: 20261031_cms_articles_list_template.sql
-- Adds template_kind and list_items columns for copyable shopping list templates (the Anylist gap)
-- Requires explicit grants for anon, authenticated, and service_role per Supabase 2026-10-30 Data API policy

ALTER TABLE public.cms_articles
  ADD COLUMN IF NOT EXISTS template_kind TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS list_items JSONB DEFAULT '[]'::jsonb;

-- Create index on template_kind for fast filtering of template articles
CREATE INDEX IF NOT EXISTS idx_cms_articles_template_kind ON public.cms_articles(template_kind);

-- Explicit grants (Supabase Data API 2026-10-30 requirement)
GRANT SELECT ON public.cms_articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_articles TO authenticated;
GRANT ALL PRIVILEGES ON public.cms_articles TO service_role;

