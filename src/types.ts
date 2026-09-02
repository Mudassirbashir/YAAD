import { Language } from './translations';

export type CategoryId =
  | 'fruits'
  | 'vegetables'
  | 'dairy'
  | 'meat'
  | 'seafood'
  | 'eggs'
  | 'bakery'
  | 'beverages'
  | 'grocery'
  | 'spices'
  | 'herbs'
  | 'dry_fruits'
  | 'frozen'
  | 'household'
  | 'cleaning'
  | 'personal_care'
  | 'health'
  | 'baby'
  | 'stationery'
  | 'electronics'
  | 'snacks'
  | 'clothing'
  | 'other'
  // Backward compatibility aliases:
  | 'grains_staples'
  | 'baby_care'
  | 'medicines';

export interface CategoryInfo {
  id: CategoryId;
  icon: string;
  defaultName: string;
  order: number;
}

export const CATEGORIES_LIST: CategoryInfo[] = [
  { id: 'fruits', icon: 'nutrition', defaultName: 'Fruits', order: 1 },
  { id: 'vegetables', icon: 'eco', defaultName: 'Vegetables', order: 2 },
  { id: 'dairy', icon: 'water_drop', defaultName: 'Dairy', order: 3 },
  { id: 'meat', icon: 'set_meal', defaultName: 'Meat', order: 4 },
  { id: 'seafood', icon: 'phishing', defaultName: 'Seafood', order: 5 },
  { id: 'eggs', icon: 'egg', defaultName: 'Eggs', order: 6 },
  { id: 'bakery', icon: 'bakery_dining', defaultName: 'Bakery', order: 7 },
  { id: 'beverages', icon: 'local_cafe', defaultName: 'Beverages', order: 8 },
  { id: 'grocery', icon: 'inventory_2', defaultName: 'Grocery', order: 9 },
  { id: 'spices', icon: 'local_fire_department', defaultName: 'Spices', order: 10 },
  { id: 'herbs', icon: 'spa', defaultName: 'Herbs', order: 11 },
  { id: 'dry_fruits', icon: 'grain', defaultName: 'Dry Fruits', order: 12 },
  { id: 'frozen', icon: 'ac_unit', defaultName: 'Frozen', order: 13 },
  { id: 'snacks', icon: 'cookie', defaultName: 'Snacks', order: 14 },
  { id: 'household', icon: 'home', defaultName: 'Household', order: 15 },
  { id: 'cleaning', icon: 'cleaning_services', defaultName: 'Cleaning', order: 16 },
  { id: 'personal_care', icon: 'soap', defaultName: 'Personal Care', order: 17 },
  { id: 'health', icon: 'medication', defaultName: 'Health', order: 18 },
  { id: 'baby', icon: 'child_care', defaultName: 'Baby', order: 19 },
  { id: 'stationery', icon: 'edit_note', defaultName: 'Stationery', order: 20 },
  { id: 'electronics', icon: 'devices', defaultName: 'Electronics', order: 21 },
  { id: 'clothing', icon: 'checkroom', defaultName: 'Clothing', order: 22 },
  { id: 'other', icon: 'category', defaultName: 'Other', order: 23 },
];

export const CATEGORY_MAP: Record<CategoryId, CategoryInfo> = CATEGORIES_LIST.reduce(
  (acc, cat) => {
    acc[cat.id] = cat;
    return acc;
  },
  {
    // Aliases mapped to their primary targets
    grains_staples: { id: 'grocery', icon: 'inventory_2', defaultName: 'Grocery', order: 9 },
    baby_care: { id: 'baby', icon: 'child_care', defaultName: 'Baby', order: 19 },
    medicines: { id: 'health', icon: 'medication', defaultName: 'Health', order: 18 },
  } as Record<CategoryId, CategoryInfo>
);

// Backward compatibility alias for CategoryType
export type CategoryType = string;

export interface CanonicalItem {
  id: string;
  canonicalName: string;
  nameUrdu: string;
  nameRomanUrdu: string;
  categoryId: CategoryId;
  defaultUnit?: string;
  aliases: string[];
}

export interface SmartRecognitionResult {
  canonicalName: string;
  nameUrdu?: string;
  nameRomanUrdu?: string;
  quantity?: string;
  unit?: string;
  categoryId: CategoryId;
  confidence: number;
  isRecognized: boolean;
  rawInput: string;
  matchedVia: 'exact_alias' | 'phonetic_match' | 'fuzzy_match' | 'user_override' | 'keyword_rule' | 'ai' | 'fallback';
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
  isRecognized?: boolean;
  note?: string;
  userModifiedCategory?: boolean;
  confidence?: number;
  createdAt?: number;
  updatedAt?: number;
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

export interface CategorizeResult {
  categoryId: CategoryId;
  confidence: number;
  matchedVia:
    | 'user_override'
    | 'local_rule'
    | 'exact_alias'
    | 'phonetic_match'
    | 'fuzzy_match'
    | 'keyword_rule'
    | 'ai'
    | 'fallback';
  normalizedItemName?: string;
}
