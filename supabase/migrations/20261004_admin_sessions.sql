-- ====================================================================
-- YAAD Admin Panel - Serverless Persistent Session & Temp Token Tables
-- Used by serverless backend to persist active admin sessions and 2FA temp tokens across stateless Lambda instances.
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.admin_sessions (
  token_hash TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  ip TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON public.admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON public.admin_sessions(expires_at);

CREATE TABLE IF NOT EXISTS public.admin_temp_tokens (
  token TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  email TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'login',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_temp_tokens_expires_at ON public.admin_temp_tokens(expires_at);

-- RLS: Only accessible by service role key (backend server)
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_temp_tokens ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS automatically; create explicit deny-all for anon/authenticated client keys
DROP POLICY IF EXISTS "Deny all public access to admin_sessions" ON public.admin_sessions;
CREATE POLICY "Deny all public access to admin_sessions" ON public.admin_sessions
  FOR ALL TO public
  USING (false);

DROP POLICY IF EXISTS "Deny all public access to admin_temp_tokens" ON public.admin_temp_tokens;
CREATE POLICY "Deny all public access to admin_temp_tokens" ON public.admin_temp_tokens
  FOR ALL TO public
  USING (false);
