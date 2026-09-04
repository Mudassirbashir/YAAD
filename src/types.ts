import { Language } from './translations';

export type CategoryId =
  | 'vegetables'
  | 'fruits'
  | 'dairy'
  | 'meat'
  | 'poultry'
  | 'seafood'
  | 'bakery'
  | 'grains'
  | 'rice'
  | 'pulses'
  | 'spices'
  | 'herbs'
  | 'dry_fruits'
  | 'beverages'
  | 'snacks'
  | 'frozen'
  | 'sauces_condiments'
  | 'cooking_essentials'
  | 'household'
  | 'cleaning'
  | 'personal_care'
  | 'baby_care'
  | 'health'
  | 'stationery'
  | 'kitchen'
  | 'electronics'
  | 'uncategorized'
  | 'other'
  // Backward compatibility aliases:
  | 'eggs'
  | 'grocery'
  | 'herbal'
  | 'baby'
  | 'pet_supplies'
  | 'home'
  | 'hardware'
  | 'clothing'
  | 'canned_food'
  | 'grains_staples'
  | 'medicines';

export interface CategoryInfo {
  id: CategoryId;
  icon: string;
  defaultName: string;
  order: number;
}

export const CATEGORIES_LIST: CategoryInfo[] = [
  { id: 'vegetables', icon: 'eco', defaultName: 'Vegetables', order: 1 },
  { id: 'fruits', icon: 'nutrition', defaultName: 'Fruits', order: 2 },
  { id: 'dairy', icon: 'water_drop', defaultName: 'Dairy', order: 3 },
  { id: 'meat', icon: 'set_meal', defaultName: 'Meat', order: 4 },
  { id: 'poultry', icon: 'egg', defaultName: 'Poultry & Eggs', order: 5 },
  { id: 'seafood', icon: 'phishing', defaultName: 'Seafood', order: 6 },
  { id: 'bakery', icon: 'bakery_dining', defaultName: 'Bakery', order: 7 },
  { id: 'cooking_essentials', icon: 'inventory_2', defaultName: 'Cooking Essentials', order: 8 },
  { id: 'rice', icon: 'grain', defaultName: 'Rice', order: 9 },
  { id: 'grains', icon: 'grain', defaultName: 'Grains', order: 10 },
  { id: 'pulses', icon: 'soup', defaultName: 'Pulses & Lentils', order: 11 },
  { id: 'spices', icon: 'local_fire_department', defaultName: 'Spices', order: 12 },
  { id: 'herbs', icon: 'spa', defaultName: 'Herbs', order: 13 },
  { id: 'dry_fruits', icon: 'grain', defaultName: 'Dry Fruits', order: 14 },
  { id: 'beverages', icon: 'local_cafe', defaultName: 'Beverages', order: 15 },
  { id: 'snacks', icon: 'cookie', defaultName: 'Snacks', order: 16 },
  { id: 'frozen', icon: 'ac_unit', defaultName: 'Frozen Food', order: 17 },
  { id: 'sauces_condiments', icon: 'liquor', defaultName: 'Sauces & Condiments', order: 18 },
  { id: 'household', icon: 'home', defaultName: 'Household', order: 19 },
  { id: 'kitchen', icon: 'home', defaultName: 'Kitchen', order: 20 },
  { id: 'cleaning', icon: 'cleaning_services', defaultName: 'Cleaning', order: 21 },
  { id: 'personal_care', icon: 'soap', defaultName: 'Personal Care', order: 22 },
  { id: 'baby_care', icon: 'child_care', defaultName: 'Baby Care', order: 23 },
  { id: 'health', icon: 'medication', defaultName: 'Medicines / Health', order: 24 },
  { id: 'stationery', icon: 'edit_note', defaultName: 'Stationery', order: 25 },
  { id: 'electronics', icon: 'devices', defaultName: 'Electronics', order: 26 },
  { id: 'uncategorized', icon: 'category', defaultName: 'Uncategorized', order: 27 },
  { id: 'other', icon: 'category', defaultName: 'Other', order: 28 },
];

export const CATEGORY_MAP: Record<CategoryId, CategoryInfo> = CATEGORIES_LIST.reduce(
  (acc, cat) => {
    acc[cat.id] = cat;
    return acc;
  },
  {
    // Aliases mapped to their primary targets
    eggs: { id: 'poultry', icon: 'egg', defaultName: 'Poultry & Eggs', order: 5 },
    grocery: { id: 'cooking_essentials', icon: 'inventory_2', defaultName: 'Cooking Essentials', order: 8 },
    herbal: { id: 'herbs', icon: 'spa', defaultName: 'Herbs', order: 13 },
    baby: { id: 'baby_care', icon: 'child_care', defaultName: 'Baby Care', order: 23 },
    pet_supplies: { id: 'household', icon: 'pets', defaultName: 'Pet Supplies', order: 29 },
    home: { id: 'household', icon: 'home', defaultName: 'Household', order: 19 },
    hardware: { id: 'household', icon: 'build', defaultName: 'Household', order: 19 },
    clothing: { id: 'household', icon: 'checkroom', defaultName: 'Clothing', order: 30 },
    canned_food: { id: 'cooking_essentials', icon: 'inventory_2', defaultName: 'Canned Food', order: 8 },
    grains_staples: { id: 'cooking_essentials', icon: 'inventory_2', defaultName: 'Cooking Essentials', order: 8 },
    medicines: { id: 'health', icon: 'medication', defaultName: 'Medicines / Health', order: 24 },
  } as Record<CategoryId, CategoryInfo>
);

// Backward compatibility alias for CategoryType
export type CategoryType = string;

export interface CanonicalItem {
  id: string;
  // Formal Canonical Spec
  canonical_name?: string;
  english_name?: string;
  urdu_name?: string;
  roman_urdu_names?: string[];
  aliases: string[];
  category?: CategoryId;
  subcategory?: string;
  common_spellings?: string[];
  confidence?: number;
  active?: boolean;
  emoji?: string;

  // CamelCase accessors for seamless backward compatibility
  canonicalName: string;
  nameUrdu: string;
  nameRomanUrdu: string;
  categoryId: CategoryId;
  defaultUnit?: string;
}

export interface CategoryRecord {
  id: CategoryId;
  name_en: string;
  name_ur: string;
  name_roman_urdu: string;
  icon: string;
  sort_order: number;
  active: boolean;
}

export interface SubcategoryRecord {
  id: string;
  category_id: CategoryId;
  name_en: string;
  name_ur: string;
  name_roman_urdu: string;
  sort_order: number;
  active: boolean;
}

export interface MasterCatalogItem {
  id: string;
  canonical_name: string;
  english_name: string;
  urdu_name: string;
  roman_urdu_names: string[];
  aliases: string[];
  common_misspellings: string[];
  category_id: CategoryId;
  subcategory_id: string;
  searchable_terms: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
  emoji?: string;
  default_unit?: string;

  // CamelCase accessors for backward compatibility
  canonicalName?: string;
  nameUrdu?: string;
  nameRomanUrdu?: string;
  categoryId?: CategoryId;
  defaultUnit?: string;
}

export interface ItemAliasRecord {
  id: string;
  item_id: string;
  alias: string;
  language?: 'en' | 'ur' | 'roman' | 'misspelling' | 'mixed';
  created_at?: string;
}

export interface UserItemPersonalization {
  id: string;
  user_id: string;
  item_id: string;
  purchase_count: number;
  last_purchased_at: string;
  purchase_frequency?: string;
  preferred_quantity?: string;
  created_at?: string;
  updated_at?: string;
}

export type RecognitionMatchSource =
  | 'exact_item'
  | 'exact_alias'
  | 'prefix_match'
  | 'phonetic_match'
  | 'common_spelling'
  | 'token_match'
  | 'fuzzy_match'
  | 'user_override'
  | 'keyword_rule'
  | 'local_rule'
  | 'ai'
  | 'fallback';

export interface SmartRecognitionResult {
  canonicalName: string;
  englishName?: string;
  nameUrdu?: string;
  nameRomanUrdu?: string;
  quantity?: string;
  unit?: string;
  categoryId: CategoryId;
  confidence: number;
  isRecognized: boolean;
  unresolved?: boolean;
  emoji?: string;
  rawInput: string;
  matchedVia: RecognitionMatchSource;
}

export interface ShoppingItem {
  id: string;
  name: string;
  categoryId: CategoryId;
  category?: string;
  completed: boolean;
  quantity?: string;
  unit?: string;
  rawInput?: string;
  canonicalName?: string;
  nameUrdu?: string;
  nameRomanUrdu?: string;
  emoji?: string;
  isRecognized?: boolean;
  unresolved?: boolean;
  note?: string;
  userModifiedCategory?: boolean;
  confidence?: number;
  createdAt?: number;
  updatedAt?: number;

  // Normalized Data Model (Step 6 Foundation)
  original_input?: string;
  original_name?: string;
  originalName?: string;
  normalized_item?: string;
  normalized_name?: string;
  normalizedName?: string;
  canonical_name?: string;
  subcategory?: string;
  language?: string;
  created_at?: string | number;

  // Smart Quantity & Unit fields (Step 3)
  planned_quantity?: string | number;
  planned_unit?: string;
  purchased_quantity?: string | number;
  purchased_unit?: string;
  plannedQuantity?: string | number;
  plannedUnit?: string;
  purchasedQuantity?: string | number;
  purchasedUnit?: string;
}

export interface ShoppingList {
  id: string;
  title: string;
  createdAt: string;
  createdTimestamp?: number;
  completedAt?: string;
  icon?: string;
  items: ShoppingItem[];
  isCompleted: boolean;
  userId?: string;
  isSynced?: boolean;
}

export type ScreenType =
  | 'splash'
  | 'onboarding'
  | 'auth'
  | 'profile_setup'
  | 'home'
  | 'create_list'
  | 'add_items'
  | 'shopping_list'
  | 'completion'
  | 'history'
  | 'list_details'
  | 'edit_list'
  | 'settings';

export type ViewState = ScreenType;

export type NavigationTab = 'home' | 'create' | 'settings' | 'lists';

export type AppLanguage = Language;

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  language?: Language;
  usage_purpose?: string;
  referral_source?: string;
  has_completed_setup?: boolean;
  updated_at?: string;
  created_at?: string;
}

export interface FrequentlyBoughtItem {
  id: string;
  userId?: string;
  name: string;
  category: CategoryId | string;
  purchaseCount: number;
  lastPurchasedAt: string;
}

/**
 * Personalization & Recommendation Engine Data Structure (user_item_history)
 */
export interface UserItemHistory {
  id: string;
  user_id: string;
  item_id?: string;
  canonical_name: string;
  original_name: string;
  category_id: CategoryId;
  purchase_count: number;
  last_purchased_at: string;
  purchase_frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'occasional';
  preferred_quantity?: string;
  preferred_unit?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategorizeResult {
  categoryId: CategoryId;
  confidence: number;
  matchedVia: RecognitionMatchSource;
  normalizedItemName?: string;
}
