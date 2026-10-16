-- YAAD: Read-only Supabase schema and RLS diagnostic
-- Safe to run: this query does not modify any data or schema.

-- 1. Check required tables and columns
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('shopping_lists', 'shopping_items')
ORDER BY table_name, ordinal_position;

-- 2. Check RLS is enabled
SELECT
    n.nspname AS schema_name,
    c.relname AS table_name,
    c.relrowsecurity AS rls_enabled,
    c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('shopping_lists', 'shopping_items')
  AND c.relkind = 'r'
ORDER BY c.relname;

-- 3. Inspect existing policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('shopping_lists', 'shopping_items')
ORDER BY tablename, policyname;

-- 4. Check required helper functions exist
SELECT
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_function_identity_arguments(p.oid) AS arguments,
    p.prosecdef AS security_definer
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
      'can_access_shopping_list',
      'is_household_member'
  )
ORDER BY p.proname;
