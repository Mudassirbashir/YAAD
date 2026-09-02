import { Language } from './translations';

export type CategoryId =
  | 'vegetables'
  | 'fruits'
  | 'dairy'
  | 'meat'
  | 'bakery'
  | 'grains_staples'
  | 'beverages'
  | 'snacks'
  | 'frozen'
  | 'household'
  | 'cleaning'
  | 'personal_care'
  | 'baby_care'
  | 'medicines'
  | 'stationery'
  | 'electronics'
  | 'clothing'
  | 'other';

export interface CategoryInfo {
  id: CategoryId;
  icon: string;
  defaultName: string;
  order: number;
}

export const CATEGORIES_LIST: CategoryInfo[] = [
  { id: 'vegetables', icon: 'eco', defaultName: 'Vegetables', order: 1 },
  { id: 'fruits', icon: 'nutrition', defaultName: 'Fruits', order: 2 },
  { id: 'dairy', icon: 'egg', defaultName: 'Dairy & Eggs', order: 3 },
  { id: 'grains_staples', icon: 'inventory_2', defaultName: 'Grains & Staples', order: 4 },
  { id: 'meat', icon: 'set_meal', defaultName: 'Meat & Seafood', order: 5 },
  { id: 'bakery', icon: 'bakery_dining', defaultName: 'Bakery', order: 6 },
  { id: 'beverages', icon: 'local_cafe', defaultName: 'Beverages', order: 7 },
  { id: 'snacks', icon: 'cookie', defaultName: 'Snacks', order: 8 },
  { id: 'frozen', icon: 'ac_unit', defaultName: 'Frozen Food', order: 9 },
  { id: 'household', icon: 'home', defaultName: 'Household', order: 10 },
  { id: 'cleaning', icon: 'cleaning_services', defaultName: 'Cleaning', order: 11 },
  { id: 'personal_care', icon: 'soap', defaultName: 'Personal Care', order: 12 },
  { id: 'baby_care', icon: 'child_care', defaultName: 'Baby Care', order: 13 },
  { id: 'medicines', icon: 'medication', defaultName: 'Medicines', order: 14 },
  { id: 'stationery', icon: 'edit_note', defaultName: 'Stationery', order: 15 },
  { id: 'electronics', icon: 'devices', defaultName: 'Electronics', order: 16 },
  { id: 'clothing', icon: 'checkroom', defaultName: 'Clothing', order: 17 },
  { id: 'other', icon: 'category', defaultName: 'Other', order: 18 },
];

export const CATEGORY_MAP: Record<CategoryId, CategoryInfo> = CATEGORIES_LIST.reduce(
  (acc, cat) => {
    acc[cat.id] = cat;
    return acc;
  },
  {} as Record<CategoryId, CategoryInfo>
);

// Backward compatibility alias for CategoryType
export type CategoryType = string;

export interface ShoppingItem {
  id: string;
  name: string;
  categoryId: CategoryId;
  category?: string;
  completed: boolean;
  quantity?: string;
  unit?: string;
  rawInput?: string;
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
  matchedVia: 'user_override' | 'local_rule' | 'ai' | 'fallback';
  normalizedItemName?: string;
}
