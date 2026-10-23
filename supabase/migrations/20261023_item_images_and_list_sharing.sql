-- ====================================================================
-- YAAD Production - Item Images & List Sharing Migration
-- File: supabase/migrations/20261023_item_images_and_list_sharing.sql
-- Description:
--   1. Adds image_url column to public.shopping_items and public.shopping_history.
--   2. Adds share_token and share_enabled to public.shopping_lists.
--   3. Creates security-definer function public.get_shared_list(p_token TEXT).
--   4. Grants execute permission on public.get_shared_list to anon and authenticated.
-- Idempotency: Fully safe to run multiple times without data loss or duplicate errors.
-- ====================================================================

-- 1. ITEM PHOTOS: Give the normalized tables somewhere to store the URL
ALTER TABLE public.shopping_items  ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.shopping_history ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. PUBLIC LIST SHARING: Token-gated, revocable, read-only
ALTER TABLE public.shopping_lists ADD COLUMN IF NOT EXISTS share_token  TEXT UNIQUE;
ALTER TABLE public.shopping_lists ADD COLUMN IF NOT EXISTS share_enabled BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. SECURITY DEFINER FUNCTION FOR TOKEN-BASED SHARING
CREATE OR REPLACE FUNCTION public.get_shared_list(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'title',       l.title,
    'icon',        l.icon,
    'isCompleted', l.is_completed,
    'completedAt', l.completed_at,
    'items', COALESCE(
      (SELECT jsonb_agg(jsonb_build_object(
              'name',        i.item_name,
              'quantity',    i.quantity,
              'unit',        i.unit,
              'isCompleted', i.is_completed,
              'imageUrl',    i.image_url
            ) ORDER BY i.created_at)
       FROM public.shopping_items i
       WHERE i.list_id = l.id),
      (SELECT jsonb_agg(jsonb_build_object(
              'name',        elem ->> 'name',
              'quantity',    elem ->> 'quantity',
              'unit',        elem ->> 'unit',
              'isCompleted', COALESCE((elem ->> 'completed')::boolean, FALSE),
              'imageUrl',    elem ->> 'imageUrl'
            ))
       FROM jsonb_array_elements(COALESCE(l.items, '[]'::jsonb)) AS elem),
      '[]'::jsonb)
  )
  INTO result
  FROM public.shopping_lists l
  WHERE l.share_token = p_token
    AND l.share_enabled = TRUE;

  RETURN result;  -- NULL when the token is unknown or sharing is disabled
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_shared_list(TEXT) TO anon, authenticated;
