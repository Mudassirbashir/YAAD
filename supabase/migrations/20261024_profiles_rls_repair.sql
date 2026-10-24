-- ============================================================================
-- YAAD Database Migration: 20261024_profiles_rls_repair.sql
-- Goal: Idempotent repair of Row Level Security (RLS) on public.profiles
-- Ensures new and existing authenticated users can INSERT, SELECT, UPDATE, DELETE
-- their own row using auth.uid() = id.
-- ============================================================================

-- 1. Ensure public.profiles table has RLS explicitly enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop any previous or legacy conflicting RLS policies on public.profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual read access" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual insert access" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual update access" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;

-- 3. Canonical own-row policies (auth.uid() = id)

-- SELECT: Users can read only their own profile row
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- INSERT: Users can insert their own profile row when none exists
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: Users can modify their own profile row
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- DELETE: Users can delete only their own profile row
CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- 4. Permissions and Grants (YAAD standing security rules)
-- Anonymous users: no access to user profiles
REVOKE ALL ON public.profiles FROM anon;

-- Authenticated users: own-row CRUD enforced via RLS above
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

-- Service role: full administrative bypass access
GRANT ALL ON public.profiles TO service_role;
