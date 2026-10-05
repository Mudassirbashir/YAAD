-- ====================================================================
-- YAAD Admin Panel - Serverless Persistent Admin Users & Invites Tables
-- Authoritative persistent store for staff admin authentication, TOTP, and invites.
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'super_admin',
  status TEXT NOT NULL DEFAULT 'active',
  suspend_reason TEXT,
  totp_secret TEXT,
  is_totp_enabled BOOLEAN DEFAULT FALSE NOT NULL,
  recovery_codes JSONB DEFAULT '[]'::jsonb,
  failed_attempts INTEGER DEFAULT 0 NOT NULL,
  lockout_until TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);

CREATE TABLE IF NOT EXISTS public.admin_invites (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  invited_by JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  accepted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_admin_invites_token ON public.admin_invites(token);

-- RLS: Only accessible by service role key
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deny all public access to admin_users" ON public.admin_users;
CREATE POLICY "Deny all public access to admin_users" ON public.admin_users
  FOR ALL TO public USING (false);

DROP POLICY IF EXISTS "Deny all public access to admin_invites" ON public.admin_invites;
CREATE POLICY "Deny all public access to admin_invites" ON public.admin_invites
  FOR ALL TO public USING (false);
