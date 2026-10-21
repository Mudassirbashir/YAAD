-- ====================================================================
-- YAAD Production CMS - Complete Setup & Migration
-- File: supabase/migrations/20261021_cms_articles_complete_setup.sql
-- Description:
--   1. Creates public.cms_articles base table if not existing.
--   2. Adds all SEO, queue, clustering, and editorial columns.
--   3. Creates performance indexes on slug, status, queue_status, cluster, publish_date.
--   4. Enables Row Level Security (RLS) with public read for published articles.
--   5. Grants required permissions to anon, authenticated, and service_role.
-- Idempotency: Fully safe to run multiple times without data loss or duplicate errors.
-- ====================================================================

-- 1. BASE TABLE CREATION (Source of Truth from 20261006)
CREATE TABLE IF NOT EXISTS public.cms_articles (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_ur TEXT,
  title_roman_urdu TEXT,
  excerpt TEXT,
  excerpt_ur TEXT,
  excerpt_roman_urdu TEXT,
  body TEXT NOT NULL,
  cover_image_url TEXT,
  author_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  read_time_minutes INT DEFAULT 3,
  views_count INT DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  versions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Base Indexes
CREATE INDEX IF NOT EXISTS idx_cms_articles_slug ON public.cms_articles(slug);
CREATE INDEX IF NOT EXISTS idx_cms_articles_status ON public.cms_articles(status);

-- 2. SEO & IN-APP CONTENT EXTENDED COLUMNS (From 20261021 + CMS Mappings)
ALTER TABLE public.cms_articles
  ADD COLUMN IF NOT EXISTS focus_keyword TEXT,
  ADD COLUMN IF NOT EXISTS search_intent TEXT,
  ADD COLUMN IF NOT EXISTS cluster TEXT,
  ADD COLUMN IF NOT EXISTS quick_answer TEXT,
  ADD COLUMN IF NOT EXISTS key_takeaways JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS cover_image_alt TEXT,
  ADD COLUMN IF NOT EXISTS og_image_url TEXT,
  ADD COLUMN IF NOT EXISTS canonical_url TEXT,
  ADD COLUMN IF NOT EXISTS hashtags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_slugs TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS queue_status TEXT DEFAULT 'idea',
  ADD COLUMN IF NOT EXISTS publish_date TEXT,
  ADD COLUMN IF NOT EXISTS priority INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS word_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS source_set TEXT,
  ADD COLUMN IF NOT EXISTS needs_review_reasons TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS heading_size TEXT DEFAULT 'h2',
  ADD COLUMN IF NOT EXISTS author_email TEXT,
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS comments_count INT DEFAULT 0;

-- Additional Performance Indexes
CREATE INDEX IF NOT EXISTS idx_cms_articles_queue_status ON public.cms_articles(queue_status);
CREATE INDEX IF NOT EXISTS idx_cms_articles_cluster ON public.cms_articles(cluster);
CREATE INDEX IF NOT EXISTS idx_cms_articles_publish_date ON public.cms_articles(publish_date);

-- 3. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.cms_articles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published articles (respecting scheduled_for)
DROP POLICY IF EXISTS "Allow public read access to published cms_articles" ON public.cms_articles;
CREATE POLICY "Allow public read access to published cms_articles" ON public.cms_articles
  FOR SELECT TO public
  USING (status = 'published' AND (scheduled_for IS NULL OR scheduled_for <= timezone('utc'::text, now())));

-- Authenticated users (admin/staff) can read all articles
DROP POLICY IF EXISTS "Allow authenticated read access to all cms_articles" ON public.cms_articles;
CREATE POLICY "Allow authenticated read access to all cms_articles" ON public.cms_articles
  FOR SELECT TO authenticated
  USING (true);

-- Authenticated users can modify articles
DROP POLICY IF EXISTS "Allow authenticated write access to cms_articles" ON public.cms_articles;
CREATE POLICY "Allow authenticated write access to cms_articles" ON public.cms_articles
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Service role bypass policy for backend admin functions
DROP POLICY IF EXISTS "Allow service_role full access to cms_articles" ON public.cms_articles;
CREATE POLICY "Allow service_role full access to cms_articles" ON public.cms_articles
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. PERMISSIONS & DATA API GRANTS
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public.cms_articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_articles TO authenticated;
GRANT ALL PRIVILEGES ON public.cms_articles TO service_role;
