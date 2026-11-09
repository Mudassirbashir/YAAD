-- Migration: 20261108_remote_config_and_abuse_system
-- Provides tables for YAAD Remote Control System, per-user overrides, and abuse detection review queue.

-- 1. remote_config table (stores global JSON document)
CREATE TABLE IF NOT EXISTS public.remote_config (
  id TEXT PRIMARY KEY DEFAULT 'global',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_by TEXT
);

-- 2. user_overrides table (per-user overrides, status, notes, targeted messages)
CREATE TABLE IF NOT EXISTS public.user_overrides (
  user_id TEXT PRIMARY KEY,
  overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'blocked')),
  is_read_only BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  targeted_messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_by TEXT
);

-- 3. abuse_events table (abuse detection triggers and review queue)
CREATE TABLE IF NOT EXISTS public.abuse_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT,
  user_email TEXT,
  rule_id TEXT NOT NULL,
  rule_name TEXT NOT NULL,
  details TEXT NOT NULL,
  action_taken TEXT NOT NULL DEFAULT 'logged',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'warned', 'suspended', 'dismissed', 'resolved')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT
);

-- Standing DB Security & Permissions
GRANT SELECT ON public.remote_config TO anon, authenticated, service_role;
GRANT ALL ON public.remote_config TO authenticated, service_role;

GRANT SELECT ON public.user_overrides TO anon, authenticated, service_role;
GRANT ALL ON public.user_overrides TO authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.abuse_events TO authenticated, service_role;

-- Enable RLS
ALTER TABLE public.remote_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abuse_events ENABLE ROW LEVEL SECURITY;

-- Remote config read policy for everyone (fail-open access to public config)
DROP POLICY IF EXISTS "Allow anon and auth read remote_config" ON public.remote_config;
CREATE POLICY "Allow anon and auth read remote_config"
  ON public.remote_config FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow service role full remote_config" ON public.remote_config;
CREATE POLICY "Allow service role full remote_config"
  ON public.remote_config FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- User overrides: read policy for own user or service_role
DROP POLICY IF EXISTS "Allow users read own user_overrides" ON public.user_overrides;
CREATE POLICY "Allow users read own user_overrides"
  ON public.user_overrides FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow service role full user_overrides" ON public.user_overrides;
CREATE POLICY "Allow service role full user_overrides"
  ON public.user_overrides FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Abuse events: service_role only
DROP POLICY IF EXISTS "Allow service role full abuse_events" ON public.abuse_events;
CREATE POLICY "Allow service role full abuse_events"
  ON public.abuse_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
