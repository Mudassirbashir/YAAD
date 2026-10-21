-- ====================================================================
-- YAAD Admin Panel - SEO In-App Articles & Queue Fields
-- Migration: 20261021_cms_articles_seo_fields.sql
-- ====================================================================

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
  ADD COLUMN IF NOT EXISTS needs_review_reasons TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_cms_articles_queue_status ON public.cms_articles(queue_status);
CREATE INDEX IF NOT EXISTS idx_cms_articles_cluster ON public.cms_articles(cluster);
CREATE INDEX IF NOT EXISTS idx_cms_articles_publish_date ON public.cms_articles(publish_date);
