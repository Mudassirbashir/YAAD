-- YAAD migration 2026-11-04 (P5): catalog taxonomy foundation.
-- 3-level taxonomy: departments -> catalog_leaves (category+leaf collapsed for
-- phase 0; true 3-level split comes with phase 1). Each leaf gets ONE
-- representative image (the image-scaling trick: not per item).
-- items.leaf_id links every item to exactly one leaf.
-- IDEMPOTENT: safe to re-run.
--
-- Standing 2026-10-21 rule: grant select to anon; full to authenticated/service_role.

CREATE TABLE IF NOT EXISTS public.catalog_leaves (
  id text primary key,
  department text not null,
  name_en text not null,
  name_ur text not null default '',
  google_category_id text,
  representative_image_url text,
  representative_public_id text,
  created_at timestamptz not null default now()
);

ALTER TABLE public.items ADD COLUMN IF NOT EXISTS leaf_id text references public.catalog_leaves(id);

CREATE INDEX IF NOT EXISTS idx_items_leaf_id ON public.items(leaf_id);

ALTER TABLE public.catalog_leaves ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read leaves" ON public.catalog_leaves;
CREATE POLICY "public read leaves" ON public.catalog_leaves FOR SELECT USING (true);

GRANT SELECT ON public.catalog_leaves TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_leaves TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_leaves TO service_role;

-- Seed leaves for the 23 live category_ids (1:1 for phase 0).
INSERT INTO public.catalog_leaves (id, department, name_en) VALUES
  ('leaf_groceries_spices', 'Groceries', 'Spices & Masalay'),
  ('leaf_fruits_vegetables_fruits', 'Fruits & Vegetables', 'Fruits'),
  ('leaf_groceries_staples', 'Groceries', 'Atta, Rice & Grains'),
  ('leaf_fruits_vegetables_vegetables', 'Fruits & Vegetables', 'Vegetables'),
  ('leaf_groceries_bakery', 'Groceries', 'Bakery'),
  ('leaf_health_beauty_herbal', 'Health & Beauty', 'Herbal'),
  ('leaf_dairy_eggs_dairy', 'Dairy & Eggs', 'Dairy'),
  ('leaf_health_beauty_personal_care', 'Health & Beauty', 'Personal Care'),
  ('leaf_household_cleaning', 'Household Cleaning', 'Cleaning'),
  ('leaf_health_beauty_health', 'Health & Beauty', 'Health'),
  ('leaf_meat_seafood_meat', 'Meat & Seafood', 'Meat'),
  ('leaf_home_essentials_household', 'Home Essentials', 'Household'),
  ('leaf_home_essentials_hardware', 'Home Essentials', 'Hardware'),
  ('leaf_groceries_cooking_essentials', 'Groceries', 'Cooking Essentials'),
  ('leaf_groceries_herbs', 'Groceries', 'Herbs'),
  ('leaf_meat_seafood_seafood', 'Meat & Seafood', 'Seafood'),
  ('leaf_beverages', 'Beverages', 'Beverages'),
  ('leaf_school_stationery', 'School & Stationery', 'Stationery'),
  ('leaf_baby_care', 'Baby Care', 'Baby Care'),
  ('leaf_dairy_eggs_eggs', 'Dairy & Eggs', 'Eggs'),
  ('leaf_clothing_footwear', 'Clothing & Footwear', 'Clothing'),
  ('leaf_home_decor', 'Home Decor', 'Home'),
  ('leaf_home_essentials_pet', 'Home Essentials', 'Pet Supplies')
ON CONFLICT (id) DO NOTHING;

-- Backfill items.leaf_id from the legacy category_id.
UPDATE public.items SET leaf_id = CASE category_id
  WHEN 'spices' THEN 'leaf_groceries_spices'
  WHEN 'fruits' THEN 'leaf_fruits_vegetables_fruits'
  WHEN 'grocery' THEN 'leaf_groceries_staples'
  WHEN 'vegetables' THEN 'leaf_fruits_vegetables_vegetables'
  WHEN 'bakery' THEN 'leaf_groceries_bakery'
  WHEN 'herbal' THEN 'leaf_health_beauty_herbal'
  WHEN 'dairy' THEN 'leaf_dairy_eggs_dairy'
  WHEN 'personal_care' THEN 'leaf_health_beauty_personal_care'
  WHEN 'cleaning' THEN 'leaf_household_cleaning'
  WHEN 'health' THEN 'leaf_health_beauty_health'
  WHEN 'meat' THEN 'leaf_meat_seafood_meat'
  WHEN 'household' THEN 'leaf_home_essentials_household'
  WHEN 'hardware' THEN 'leaf_home_essentials_hardware'
  WHEN 'cooking_essentials' THEN 'leaf_groceries_cooking_essentials'
  WHEN 'herbs' THEN 'leaf_groceries_herbs'
  WHEN 'seafood' THEN 'leaf_meat_seafood_seafood'
  WHEN 'beverages' THEN 'leaf_beverages'
  WHEN 'stationery' THEN 'leaf_school_stationery'
  WHEN 'baby_care' THEN 'leaf_baby_care'
  WHEN 'eggs' THEN 'leaf_dairy_eggs_eggs'
  WHEN 'clothing' THEN 'leaf_clothing_footwear'
  WHEN 'home' THEN 'leaf_home_decor'
  WHEN 'pet_supplies' THEN 'leaf_home_essentials_pet'
  ELSE leaf_id
END
WHERE leaf_id IS NULL;
