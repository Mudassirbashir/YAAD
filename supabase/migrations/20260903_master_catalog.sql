-- ====================================================================
-- YAAD Grocery App - Master Item Catalog & Category System Migration
-- Architecture:
--   1. categories (parent category hierarchy)
--   2. subcategories (sub-category groupings)
--   3. items (master catalog items with bilingual & Roman Urdu metadata)
--   4. item_aliases (multi-alias indexing)
--   5. user_item_history (personalization container for purchase frequency & counts)
-- Security:
--   - Public Read-Only for Catalog (RLS SELECT allowed for all authenticated & anon users)
--   - Modification restricted (no public INSERT/UPDATE/DELETE)
--   - User-scoped RLS for user_item_history
-- ====================================================================

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ur TEXT NOT NULL,
  name_roman_urdu TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'category',
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. SUBCATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.subcategories (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  name_en TEXT NOT NULL,
  name_ur TEXT NOT NULL,
  name_roman_urdu TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ITEMS TABLE (Master Catalog)
CREATE TABLE IF NOT EXISTS public.items (
  id TEXT PRIMARY KEY,
  canonical_name TEXT NOT NULL,
  english_name TEXT NOT NULL,
  urdu_name TEXT NOT NULL,
  roman_urdu_names TEXT[] NOT NULL DEFAULT '{}',
  category_id TEXT REFERENCES public.categories(id) ON DELETE RESTRICT NOT NULL,
  subcategory_id TEXT REFERENCES public.subcategories(id) ON DELETE SET NULL,
  common_misspellings TEXT[] NOT NULL DEFAULT '{}',
  searchable_terms TEXT[] NOT NULL DEFAULT '{}',
  default_unit TEXT DEFAULT 'kg',
  emoji TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ITEM ALIASES TABLE
CREATE TABLE IF NOT EXISTS public.item_aliases (
  id TEXT PRIMARY KEY,
  item_id TEXT REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  alias TEXT NOT NULL,
  language TEXT DEFAULT 'mixed',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. USER ITEM HISTORY TABLE (Future Personalization)
CREATE TABLE IF NOT EXISTS public.user_item_history (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id TEXT REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  purchase_count INT DEFAULT 1 NOT NULL,
  last_purchased_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  purchase_frequency TEXT,
  preferred_quantity TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_user_item_history UNIQUE (user_id, item_id)
);

-- ====================================================================
-- INDEXES FOR SUB-MILLISECOND SEARCH & TRAVERSAL
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON public.subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_items_category_id ON public.items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_subcategory_id ON public.items(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_items_canonical_name ON public.items(canonical_name);
CREATE INDEX IF NOT EXISTS idx_item_aliases_item_id ON public.item_aliases(item_id);
CREATE INDEX IF NOT EXISTS idx_item_aliases_alias ON public.item_aliases(lower(alias));
CREATE INDEX IF NOT EXISTS idx_user_item_history_user ON public.user_item_history(user_id, purchase_count DESC);
CREATE INDEX IF NOT EXISTS idx_user_item_history_recent ON public.user_item_history(user_id, last_purchased_at DESC);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_item_history ENABLE ROW LEVEL SECURITY;

-- Master Catalog: Public read-only
CREATE POLICY "Allow public read access on categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on subcategories"
  ON public.subcategories FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on items"
  ON public.items FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on item_aliases"
  ON public.item_aliases FOR SELECT
  USING (true);

-- User personalization: User-scoped
CREATE POLICY "Users can view own item history"
  ON public.user_item_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own item history"
  ON public.user_item_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own item history"
  ON public.user_item_history FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own item history"
  ON public.user_item_history FOR DELETE
  USING (auth.uid() = user_id);

-- ====================================================================
-- SEED DATA: CATEGORIES
-- ====================================================================
INSERT INTO public.categories (id, name_en, name_ur, name_roman_urdu, icon, sort_order)
VALUES
  ('vegetables', 'Vegetables', 'سبزیاں', 'Sabziyan', 'eco', 1),
  ('fruits', 'Fruits', 'پھل', 'Phal', 'nutrition', 2),
  ('grocery', 'Grocery & Staples', 'راشن اور گروسری', 'Rashan & Grocery', 'inventory_2', 3),
  ('spices', 'Spices & Seasoning', 'مصالحہ جات', 'Masalay', 'local_fire_department', 4),
  ('herbal', 'Herbal & Traditional', 'جڑی بوٹیاں اور پنسار', 'Pansar & Jari Boti', 'spa', 5),
  ('dairy', 'Dairy & Milk', 'دودھ اور ڈیری', 'Doodh & Dairy', 'water_drop', 6),
  ('bakery', 'Bakery & Bread', 'بیکری اور روٹی', 'Bakery & Roti', 'bakery_dining', 7),
  ('meat', 'Meat & Poultry', 'گوشت اور چکن', 'Gosht & Chicken', 'set_meal', 8),
  ('seafood', 'Seafood & Fish', 'مچھلی اور سی فوڈ', 'Machli & Seafood', 'phishing', 9),
  ('eggs', 'Eggs', 'انڈے', 'Anday', 'egg', 10),
  ('beverages', 'Beverages & Drinks', 'مشروبات اور چائے', 'Chai & Mashroobat', 'local_cafe', 11),
  ('personal_care', 'Personal Care', 'ذاتی دیکھ بھال', 'Zati Dekhbhal', 'soap', 12),
  ('household', 'Household & Kitchen', 'گھریلو اشیاء', 'Gharelu Ashiya', 'home', 13),
  ('cleaning', 'Cleaning & Laundry', 'صفائی اور لانڈری', 'Safai & Laundry', 'cleaning_services', 14),
  ('health', 'Health & Pharmacy', 'صحت اور ادویات', 'Sehat & Dawaiyan', 'medication', 15),
  ('baby_care', 'Baby Care', 'بچوں کی دیکھ بھال', 'Bachon ki Dekhbhal', 'child_care', 16),
  ('pet_supplies', 'Pet Supplies', 'پالتو جانوروں کا سامان', 'Paltu Janwaron ka Saman', 'pets', 17),
  ('home', 'Home & Living', 'گھر اور سجاوٹ', 'Ghar & Living', 'home', 18),
  ('hardware', 'Hardware & Maintenance', 'ہارڈویئر اور اوزار', 'Hardware & Auzaar', 'build', 19),
  ('stationery', 'Stationery & Office', 'اسٹیشنری اور کتب', 'Stationery & Office', 'edit_note', 20),
  ('clothing', 'Clothing & Fabric', 'کپڑے اور ملبوسات', 'Kapray & Libas', 'checkroom', 21),
  ('other', 'Other Items', 'دیگر اشیاء', 'Dusri Cheezein', 'category', 22)
ON CONFLICT (id) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ur = EXCLUDED.name_ur,
  name_roman_urdu = EXCLUDED.name_roman_urdu,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order;
