-- ====================================================================
-- YAAD Admin Panel - Supabase Authoritative Tables & Realtime Publications
-- Migration: 20261006_admin_production_source_of_truth.sql
-- ====================================================================

-- 1. ADMIN AUDIT LOGS (Append-only immutable audit trail)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  admin_id TEXT,
  admin_email TEXT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  before_value JSONB,
  after_value JSONB,
  ip TEXT,
  user_agent TEXT,
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_timestamp ON public.admin_audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON public.admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_email ON public.admin_audit_logs(admin_email);

-- 2. ADMIN SETTINGS & CONFIGURATION (Key-value store for feature flags, maintenance, allowlists)
CREATE TABLE IF NOT EXISTS public.admin_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by TEXT
);

-- 3. SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id TEXT PRIMARY KEY,
  ticket_number TEXT UNIQUE NOT NULL,
  user_id TEXT,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  assigned_to JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at DESC);

-- 3b. SUPPORT TICKET MESSAGES
CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
  id TEXT PRIMARY KEY,
  ticket_id TEXT REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'staff')),
  sender_name TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket_id ON public.support_ticket_messages(ticket_id);

-- 4. CONTENT CMS ARTICLES
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

CREATE INDEX IF NOT EXISTS idx_cms_articles_slug ON public.cms_articles(slug);
CREATE INDEX IF NOT EXISTS idx_cms_articles_status ON public.cms_articles(status);

-- 5. PUSH NOTIFICATION CAMPAIGNS & TEMPLATES
CREATE TABLE IF NOT EXISTS public.push_campaigns (
  id TEXT PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_ur TEXT,
  body_en TEXT NOT NULL,
  body_ur TEXT,
  target_audience TEXT NOT NULL DEFAULT 'all_active',
  custom_segment_criteria TEXT,
  deep_link TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  estimated_recipients INT DEFAULT 0,
  actual_sent_count INT DEFAULT 0,
  delivered_count INT DEFAULT 0,
  opened_count INT DEFAULT 0,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.push_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  title_en TEXT NOT NULL,
  title_ur TEXT,
  body_en TEXT NOT NULL,
  body_ur TEXT,
  deep_link TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. ROW LEVEL SECURITY POLICIES (Backend Service Role Only for administrative entities)
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_templates ENABLE ROW LEVEL SECURITY;

-- Deny all public access to administrative management tables (service role bypasses automatically)
DROP POLICY IF EXISTS "Deny all public access to admin_audit_logs" ON public.admin_audit_logs;
CREATE POLICY "Deny all public access to admin_audit_logs" ON public.admin_audit_logs FOR ALL TO public USING (false);

DROP POLICY IF EXISTS "Deny all public access to admin_settings" ON public.admin_settings;
CREATE POLICY "Deny all public access to admin_settings" ON public.admin_settings FOR ALL TO public USING (false);

DROP POLICY IF EXISTS "Deny all public access to push_campaigns" ON public.push_campaigns;
CREATE POLICY "Deny all public access to push_campaigns" ON public.push_campaigns FOR ALL TO public USING (false);

DROP POLICY IF EXISTS "Deny all public access to push_templates" ON public.push_templates;
CREATE POLICY "Deny all public access to push_templates" ON public.push_templates FOR ALL TO public USING (false);

-- Public read access for published CMS articles only
DROP POLICY IF EXISTS "Allow public read access to published cms_articles" ON public.cms_articles;
CREATE POLICY "Allow public read access to published cms_articles" ON public.cms_articles
  FOR SELECT TO public
  USING (status = 'published' AND (scheduled_for IS NULL OR scheduled_for <= timezone('utc'::text, now())));

-- Authenticated users can view their own support tickets
DROP POLICY IF EXISTS "Users can view own support tickets" ON public.support_tickets;
CREATE POLICY "Users can view own support tickets" ON public.support_tickets
  FOR SELECT TO authenticated
  USING (user_id = auth.uid()::text);

-- 7. SUPABASE REALTIME CONFIGURATION
-- Ensure tables are added to supabase_realtime publication for live subscriptions
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.shopping_lists;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.shopping_items;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_audit_logs;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
