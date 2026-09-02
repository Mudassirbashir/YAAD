-- ====================================================================
-- YAAD Grocery App - Production Database SQL Schema for Supabase
-- Fully normalized relational architecture:
--   1. profiles (linked to auth.users)
--   2. shopping_lists (user-scoped list container with embedded JSON fallback)
--   3. shopping_items (relational list item contents)
--   4. frequently_bought_items (aggregated user purchase history)
-- Includes Indexes, Cascade Deletions, Row Level Security (RLS), and Triggers.
-- ====================================================================

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'roman-urdu', 'ur')),
  usage_purpose TEXT,
  referral_source TEXT,
  has_completed_setup BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. SHOPPING_LISTS TABLE (Parent List Entity)
CREATE TABLE IF NOT EXISTS public.shopping_lists (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  icon TEXT DEFAULT 'shopping_basket',
  is_completed BOOLEAN DEFAULT FALSE NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at_label TEXT,
  created_timestamp BIGINT,
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. SHOPPING_ITEMS TABLE (Relational Child Entity for List Contents)
CREATE TABLE IF NOT EXISTS public.shopping_items (
  id TEXT PRIMARY KEY,
  list_id TEXT REFERENCES public.shopping_lists(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  quantity TEXT,
  unit TEXT,
  raw_input TEXT,
  is_completed BOOLEAN DEFAULT FALSE NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. FREQUENTLY_BOUGHT_ITEMS TABLE (Aggregated User History)
CREATE TABLE IF NOT EXISTS public.frequently_bought_items (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL,
  category TEXT DEFAULT 'other' NOT NULL,
  purchase_count INT DEFAULT 1 NOT NULL,
  last_purchased_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_user_frequently_bought UNIQUE (user_id, item_name)
);

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_shopping_lists_user_id ON public.shopping_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_created_at ON public.shopping_lists(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_is_completed ON public.shopping_lists(is_completed);
CREATE INDEX IF NOT EXISTS idx_shopping_items_list_id ON public.shopping_items(list_id);
CREATE INDEX IF NOT EXISTS idx_shopping_items_user_id ON public.shopping_items(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_items_category ON public.shopping_items(category);
CREATE INDEX IF NOT EXISTS idx_frequently_bought_user_id ON public.frequently_bought_items(user_id);
CREATE INDEX IF NOT EXISTS idx_frequently_bought_count ON public.frequently_bought_items(user_id, purchase_count DESC);

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frequently_bought_items ENABLE ROW LEVEL SECURITY;

-- 7. ROW LEVEL SECURITY POLICIES: PROFILES
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- 8. ROW LEVEL SECURITY POLICIES: SHOPPING_LISTS
DROP POLICY IF EXISTS "Users can view their own shopping lists" ON public.shopping_lists;
CREATE POLICY "Users can view their own shopping lists"
  ON public.shopping_lists FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own shopping lists" ON public.shopping_lists;
CREATE POLICY "Users can insert their own shopping lists"
  ON public.shopping_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own shopping lists" ON public.shopping_lists;
CREATE POLICY "Users can update their own shopping lists"
  ON public.shopping_lists FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own shopping lists" ON public.shopping_lists;
CREATE POLICY "Users can delete their own shopping lists"
  ON public.shopping_lists FOR DELETE
  USING (auth.uid() = user_id);

-- 9. ROW LEVEL SECURITY POLICIES: SHOPPING_ITEMS
DROP POLICY IF EXISTS "Users can view their own shopping items" ON public.shopping_items;
CREATE POLICY "Users can view their own shopping items"
  ON public.shopping_items FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own shopping items" ON public.shopping_items;
CREATE POLICY "Users can insert their own shopping items"
  ON public.shopping_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own shopping items" ON public.shopping_items;
CREATE POLICY "Users can update their own shopping items"
  ON public.shopping_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own shopping items" ON public.shopping_items;
CREATE POLICY "Users can delete their own shopping items"
  ON public.shopping_items FOR DELETE
  USING (auth.uid() = user_id);

-- 10. ROW LEVEL SECURITY POLICIES: FREQUENTLY_BOUGHT_ITEMS
DROP POLICY IF EXISTS "Users can view their own frequently bought items" ON public.frequently_bought_items;
CREATE POLICY "Users can view their own frequently bought items"
  ON public.frequently_bought_items FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own frequently bought items" ON public.frequently_bought_items;
CREATE POLICY "Users can insert their own frequently bought items"
  ON public.frequently_bought_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own frequently bought items" ON public.frequently_bought_items;
CREATE POLICY "Users can update their own frequently bought items"
  ON public.frequently_bought_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own frequently bought items" ON public.frequently_bought_items;
CREATE POLICY "Users can delete their own frequently bought items"
  ON public.frequently_bought_items FOR DELETE
  USING (auth.uid() = user_id);

-- 11. AUTOMATIC TRIGGER: Create Profile on User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, language, has_completed_setup)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'en',
    FALSE
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. AUTOMATIC TRIGGER: Update updated_at Timestamp on Modifications
CREATE OR REPLACE FUNCTION public.update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_timestamp ON public.profiles;
CREATE TRIGGER set_profiles_timestamp
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

DROP TRIGGER IF EXISTS set_shopping_lists_timestamp ON public.shopping_lists;
CREATE TRIGGER set_shopping_lists_timestamp
  BEFORE UPDATE ON public.shopping_lists
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

DROP TRIGGER IF EXISTS set_shopping_items_timestamp ON public.shopping_items;
CREATE TRIGGER set_shopping_items_timestamp
  BEFORE UPDATE ON public.shopping_items
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

DROP TRIGGER IF EXISTS set_frequently_bought_timestamp ON public.frequently_bought_items;
CREATE TRIGGER set_frequently_bought_timestamp
  BEFORE UPDATE ON public.frequently_bought_items
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();
