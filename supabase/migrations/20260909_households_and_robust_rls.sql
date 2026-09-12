-- ====================================================================
-- YAAD Grocery App - Migration: Households, Shared Lists & Robust RLS
-- Enforces server-side authorization based on parent shopping list
-- ====================================================================

-- 1. Create public.households table
CREATE TABLE IF NOT EXISTS public.households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create public.household_members table
CREATE TABLE IF NOT EXISTS public.household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN ('invited', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_household_member UNIQUE (household_id, user_id)
);

-- 3. Add household_id column to shopping_lists if not exists
ALTER TABLE public.shopping_lists
ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES public.households(id) ON DELETE SET NULL;

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_shopping_lists_household_id ON public.shopping_lists(household_id);
CREATE INDEX IF NOT EXISTS idx_household_members_user ON public.household_members(user_id, status);
CREATE INDEX IF NOT EXISTS idx_household_members_household ON public.household_members(household_id, status);
CREATE INDEX IF NOT EXISTS idx_households_created_by ON public.households(created_by);

-- 5. Helper Functions for RLS (SECURITY DEFINER STABLE to prevent recursion)
CREATE OR REPLACE FUNCTION public.is_household_member(lookup_household_id UUID, lookup_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF lookup_household_id IS NULL OR lookup_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.household_members
    WHERE household_id = lookup_household_id
      AND user_id = lookup_user_id
      AND status = 'accepted'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.can_access_shopping_list(lookup_list_id TEXT, lookup_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF lookup_list_id IS NULL OR lookup_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.shopping_lists sl
    WHERE sl.id = lookup_list_id
      AND (
        sl.user_id = lookup_user_id
        OR (
          sl.household_id IS NOT NULL
          AND public.is_household_member(sl.household_id, lookup_user_id)
        )
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 6. Trigger to automatically add household creator as accepted owner
CREATE OR REPLACE FUNCTION public.handle_new_household()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.household_members (household_id, user_id, role, status)
  VALUES (NEW.id, NEW.created_by, 'owner', 'accepted')
  ON CONFLICT (household_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_household_created ON public.households;
CREATE TRIGGER on_household_created
  AFTER INSERT ON public.households
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_household();

-- 7. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;

-- 8. RLS POLICIES FOR HOUSEHOLDS
DROP POLICY IF EXISTS "Users can view households they belong to" ON public.households;
CREATE POLICY "Users can view households they belong to"
  ON public.households FOR SELECT
  USING (
    created_by = auth.uid() OR public.is_household_member(id, auth.uid())
  );

DROP POLICY IF EXISTS "Users can create households" ON public.households;
CREATE POLICY "Users can create households"
  ON public.households FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Admins can update household" ON public.households;
CREATE POLICY "Admins can update household"
  ON public.households FOR UPDATE
  USING (
    created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM public.household_members hm
      WHERE hm.household_id = id
        AND hm.user_id = auth.uid()
        AND hm.role IN ('owner', 'admin')
        AND hm.status = 'accepted'
    )
  )
  WITH CHECK (
    created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM public.household_members hm
      WHERE hm.household_id = id
        AND hm.user_id = auth.uid()
        AND hm.role IN ('owner', 'admin')
        AND hm.status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "Owners can delete household" ON public.households;
CREATE POLICY "Owners can delete household"
  ON public.households FOR DELETE
  USING (
    created_by = auth.uid()
  );

-- 9. RLS POLICIES FOR HOUSEHOLD_MEMBERS
DROP POLICY IF EXISTS "Members can view household member lists" ON public.household_members;
CREATE POLICY "Members can view household member lists"
  ON public.household_members FOR SELECT
  USING (
    user_id = auth.uid() OR public.is_household_member(household_id, auth.uid())
  );

DROP POLICY IF EXISTS "Admins can add household members" ON public.household_members;
CREATE POLICY "Admins can add household members"
  ON public.household_members FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.households h WHERE h.id = household_id AND h.created_by = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.household_members hm
      WHERE hm.household_id = household_id
        AND hm.user_id = auth.uid()
        AND hm.role IN ('owner', 'admin')
        AND hm.status = 'accepted'
    )
    OR (user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins or self can update membership" ON public.household_members;
CREATE POLICY "Admins or self can update membership"
  ON public.household_members FOR UPDATE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.household_members hm
      WHERE hm.household_id = household_id
        AND hm.user_id = auth.uid()
        AND hm.role IN ('owner', 'admin')
        AND hm.status = 'accepted'
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.household_members hm
      WHERE hm.household_id = household_id
        AND hm.user_id = auth.uid()
        AND hm.role IN ('owner', 'admin')
        AND hm.status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "Admins or self can remove members" ON public.household_members;
CREATE POLICY "Admins or self can remove members"
  ON public.household_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.households h WHERE h.id = household_id AND h.created_by = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.household_members hm
      WHERE hm.household_id = household_id
        AND hm.user_id = auth.uid()
        AND hm.role IN ('owner', 'admin')
        AND hm.status = 'accepted'
    )
  );

-- 10. RLS POLICIES FOR SHOPPING_LISTS (Parent Entity)
DROP POLICY IF EXISTS "Users can view accessible shopping lists" ON public.shopping_lists;
DROP POLICY IF EXISTS "Users can view their own shopping lists" ON public.shopping_lists;
CREATE POLICY "Users can view accessible shopping lists"
  ON public.shopping_lists FOR SELECT
  USING (
    auth.uid() = user_id
    OR (
      household_id IS NOT NULL
      AND public.is_household_member(household_id, auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert shopping lists" ON public.shopping_lists;
DROP POLICY IF EXISTS "Users can insert their own shopping lists" ON public.shopping_lists;
CREATE POLICY "Users can insert shopping lists"
  ON public.shopping_lists FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      household_id IS NULL
      OR public.is_household_member(household_id, auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update accessible shopping lists" ON public.shopping_lists;
DROP POLICY IF EXISTS "Users can update their own shopping lists" ON public.shopping_lists;
CREATE POLICY "Users can update accessible shopping lists"
  ON public.shopping_lists FOR UPDATE
  USING (
    auth.uid() = user_id
    OR (
      household_id IS NOT NULL
      AND public.is_household_member(household_id, auth.uid())
    )
  )
  WITH CHECK (
    (
      (auth.uid() = user_id)
      OR (
        household_id IS NOT NULL
        AND public.is_household_member(household_id, auth.uid())
        AND user_id = (SELECT sl.user_id FROM public.shopping_lists sl WHERE sl.id = shopping_lists.id)
      )
    )
    AND (
      household_id IS NULL
      OR public.is_household_member(household_id, auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete authorized shopping lists" ON public.shopping_lists;
DROP POLICY IF EXISTS "Users can delete their own shopping lists" ON public.shopping_lists;
CREATE POLICY "Users can delete authorized shopping lists"
  ON public.shopping_lists FOR DELETE
  USING (
    auth.uid() = user_id
    OR (
      household_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.household_members hm
        WHERE hm.household_id = shopping_lists.household_id
          AND hm.user_id = auth.uid()
          AND hm.role IN ('owner', 'admin')
          AND hm.status = 'accepted'
      )
    )
  );

-- 11. RLS POLICIES FOR SHOPPING_ITEMS (Child Entity)
-- Access is strictly authorized based on the parent shopping list
DROP POLICY IF EXISTS "Users can view items in accessible lists" ON public.shopping_items;
DROP POLICY IF EXISTS "Users can view their own shopping items" ON public.shopping_items;
CREATE POLICY "Users can view items in accessible lists"
  ON public.shopping_items FOR SELECT
  USING (
    public.can_access_shopping_list(list_id, auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert items in accessible lists" ON public.shopping_items;
DROP POLICY IF EXISTS "Users can insert their own shopping items" ON public.shopping_items;
CREATE POLICY "Users can insert items in accessible lists"
  ON public.shopping_items FOR INSERT
  WITH CHECK (
    public.can_access_shopping_list(list_id, auth.uid())
    AND auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Users can update items in accessible lists" ON public.shopping_items;
DROP POLICY IF EXISTS "Users can update their own shopping items" ON public.shopping_items;
CREATE POLICY "Users can update items in accessible lists"
  ON public.shopping_items FOR UPDATE
  USING (
    public.can_access_shopping_list(list_id, auth.uid())
  )
  WITH CHECK (
    public.can_access_shopping_list(list_id, auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete items in accessible lists" ON public.shopping_items;
DROP POLICY IF EXISTS "Users can delete their own shopping items" ON public.shopping_items;
CREATE POLICY "Users can delete items in accessible lists"
  ON public.shopping_items FOR DELETE
  USING (
    public.can_access_shopping_list(list_id, auth.uid())
  );
