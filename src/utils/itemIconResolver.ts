import React from 'react';
import {
  Salad,
  Apple,
  Milk,
  Egg,
  Fish,
  Drumstick,
  Croissant,
  Coffee,
  Wheat,
  Flame,
  Leaf,
  Sparkles,
  Snowflake,
  Cookie,
  Home,
  Bath,
  Pill,
  Baby,
  FileText,
  Smartphone,
  Shirt,
  Tag,
  Package,
  Dog,
  Wrench,
  Soup,
  Droplets,
  Archive,
  Heart,
  ShoppingBag,
  LucideIcon,
  Wine,
  CupSoda,
  IceCream,
  Carrot,
  Citrus,
  Candy,
  Boxes,
} from 'lucide-react';
import { CategoryId } from '../types';

/**
 * Resolved item visual configuration
 */
export interface ResolvedItemVisual {
  /** Resolution hierarchy tier */
  tier: 'exact' | 'canonical' | 'category' | 'fallback';
  /** Exact bespoke SVG illustration key, if available */
  stapleKey?: string;
  /** Lucide icon component for vector rendering */
  icon: LucideIcon;
  /** Tailwind gradient/background classes */
  bgGradient: string;
  /** Tailwind border class */
  borderColor: string;
  /** Tailwind text/icon color class */
  iconColor: string;
  /** Resolved category ID */
  resolvedCategory: CategoryId;
  /** Human readable label for accessibility */
  label: string;
}

/**
 * 1. BESPOKE SVG STAPLE KEYS (Tier 1: Exact Match)
 * These match the rich custom SVGs drawn in EssentialItemVisual.tsx
 */
const EXACT_STAPLE_PATTERNS: Array<{ key: string; patterns: string[] }> = [
  { key: 'potato', patterns: ['potato', 'potatoes', 'aloo', 'alu', 'aalu', 'آلو', 'الو'] },
  { key: 'onion', patterns: ['onion', 'onions', 'pyaz', 'pyaaz', 'piyaz', 'piaz', 'پیاز'] },
  { key: 'tomato', patterns: ['tomato', 'tomatoes', 'tamatar', 'tamaatar', 'tmatar', 'ٹماٹر'] },
  { key: 'green_chili', patterns: ['green chili', 'green chilli', 'hari mirch', 'mirch', 'sabz mirch', 'ہری مرچ'] },
  { key: 'ginger', patterns: ['ginger', 'adrak', 'aadrak', 'ادرک'] },
  { key: 'garlic', patterns: ['garlic', 'lehsun', 'lehsan', 'lahsun', 'لہسن'] },
  { key: 'chicken', patterns: ['chicken', 'murghi', 'murgi', 'مرغی', 'چکن'] },
  { key: 'eggs', patterns: ['egg', 'eggs', 'anday', 'ande', 'anda', 'انڈے', 'انڈا'] },
  { key: 'milk', patterns: ['milk', 'doodh', 'dodh', 'دودھ'] },
  { key: 'bread', patterns: ['bread', 'double roti', 'roti', 'ڈبل روٹی', 'ڈبلروٹی'] },
  { key: 'banana', patterns: ['banana', 'bananas', 'kela', 'kele', 'کیلا', 'کیلے'] },
  { key: 'apple', patterns: ['apple', 'apples', 'seb', 'saib', 'سیب'] },
  { key: 'yogurt', patterns: ['yogurt', 'yoghurt', 'dahi', 'curd', 'دہی'] },
  { key: 'oil', patterns: ['oil', 'cooking oil', 'ghee', 'tail', 'تیل', 'گھی', 'کوکنگ آئل'] },
  { key: 'rice', patterns: ['rice', 'chawal', 'basmati', 'چاول'] },
  { key: 'flour', patterns: ['flour', 'atta', 'aata', 'maida', 'آٹا', 'میدہ'] },
  { key: 'tea', patterns: ['tea', 'chai', 'patti', 'tea bag', 'چائے', 'پتی'] },
  { key: 'coffee', patterns: ['coffee', 'nescafe', 'کافی'] },
  { key: 'sugar', patterns: ['sugar', 'cheeni', 'chini', 'شکر', 'چینی'] },
  { key: 'salt', patterns: ['salt', 'namak', 'نمک'] },
  { key: 'daal', patterns: ['daal', 'dal', 'lentil', 'lentils', 'chana', 'moong', 'masoor', 'دال'] },
  { key: 'meat', patterns: ['beef', 'mutton', 'gosht', 'lamb', 'keema', 'qeema', 'گوشت', 'قیمہ'] },
  { key: 'fish', patterns: ['fish', 'machli', 'machhli', 'seafood', 'prawn', 'prawns', 'جھینگا', 'مچھلی'] },
  { key: 'butter', patterns: ['butter', 'makhan', 'maska', 'مکھن'] },
  { key: 'soap', patterns: ['soap', 'sabun', 'hand wash', 'handwash', 'صابن'] },
  { key: 'shampoo', patterns: ['shampoo', 'conditioner', 'شیمپو'] },
  { key: 'detergent', patterns: ['detergent', 'surf', 'washing powder', 'سرف', 'ڈیٹرجنٹ'] },
  { key: 'toothpaste', patterns: ['toothpaste', 'colgate', 'sensodyne', 'toothbrush', 'ٹوتھ پیسٹ'] },
  { key: 'biscuits', patterns: ['biscuit', 'biscuits', 'cookie', 'cookies', 'بسکوٹ', 'بسکٹ'] },
  { key: 'water', patterns: ['water', 'pani', 'mineral water', 'پانی'] },
];

/**
 * 2. CANONICAL HOUSEHOLD STAPLE DICTIONARY (Tier 2: Canonical Match)
 * Covers Baby, Pet, Personal Care, Spices, Snacks, Household, Produce, Dairy, Beverages, etc.
 */
interface CanonicalDefinition {
  patterns: string[];
  icon: LucideIcon;
  bgGradient: string;
  borderColor: string;
  iconColor: string;
  category: CategoryId;
  label: string;
}

const CANONICAL_DEFINITIONS: CanonicalDefinition[] = [
  // --- BABY CARE ---
  {
    patterns: ['diaper', 'diapers', 'pampers', 'baby wipes', 'wipes', 'baby powder', 'baby oil', 'cerelac', 'feeder', 'baby lotion', 'ڈائپر', 'پیمپرز'],
    icon: Baby,
    bgGradient: 'bg-cyan-50',
    borderColor: 'border-cyan-200/80',
    iconColor: 'text-cyan-700',
    category: 'baby_care',
    label: 'Baby Care',
  },
  // --- PET CARE ---
  {
    patterns: ['pet food', 'dog food', 'cat food', 'cat litter', 'whiskas', 'pedigree', 'bird seed', 'کتے کی خوراک', 'بلی کی خوراک'],
    icon: Dog,
    bgGradient: 'bg-amber-50',
    borderColor: 'border-amber-200/80',
    iconColor: 'text-amber-800',
    category: 'pet_supplies',
    label: 'Pet Supplies',
  },
  // --- HEALTH & PHARMACY ---
  {
    patterns: ['panadol', 'paracetamol', 'aspirin', 'disprin', 'brufen', 'medicine', 'medicines', 'bandage', 'band aid', 'syrup', 'vitamins', 'ors', 'دوا', 'دوائی', 'پیناڈول'],
    icon: Pill,
    bgGradient: 'bg-rose-50',
    borderColor: 'border-rose-200/80',
    iconColor: 'text-rose-700',
    category: 'health',
    label: 'Medicine & Health',
  },
  // --- SPICES & MASALAS ---
  {
    patterns: ['haldi', 'turmeric', 'zeera', 'cumin', 'dhania powder', 'coriander powder', 'darchini', 'cinnamon', 'laung', 'cloves', 'elaichi', 'cardamom', 'kali mirch', 'black pepper', 'garam masala', 'biryani masala', 'chaat masala', 'tikka masala', 'لال مرچ', 'ہلدی', 'گرم مصالحہ', 'زیرہ'],
    icon: Flame,
    bgGradient: 'bg-orange-50',
    borderColor: 'border-orange-200/80',
    iconColor: 'text-orange-700',
    category: 'spices',
    label: 'Spices & Masala',
  },
  // --- FRESH HERBS ---
  {
    patterns: ['mint', 'podina', 'pudina', 'coriander', 'dhaniya', 'dhania', 'curry leaves', 'kadi patta', 'methi', 'fenugreek', 'پودینہ', 'دھنیا'],
    icon: Leaf,
    bgGradient: 'bg-emerald-50',
    borderColor: 'border-emerald-200/80',
    iconColor: 'text-emerald-700',
    category: 'herbs',
    label: 'Fresh Herbs',
  },
  // --- PRODUCE: CITRUS & FRUITS ---
  {
    patterns: ['lemon', 'lemons', 'lime', 'leemu', 'nimbu', 'لیموں', 'لیمبو'],
    icon: Citrus,
    bgGradient: 'bg-yellow-50',
    borderColor: 'border-yellow-200/80',
    iconColor: 'text-yellow-700',
    category: 'fruits',
    label: 'Citrus & Lemon',
  },
  {
    patterns: ['orange', 'oranges', 'kino', 'kinnu', 'malta', 'kinnow', 'مالٹا', 'کینو'],
    icon: Citrus,
    bgGradient: 'bg-orange-50',
    borderColor: 'border-orange-200/80',
    iconColor: 'text-orange-700',
    category: 'fruits',
    label: 'Oranges',
  },
  {
    patterns: ['mango', 'mangoes', 'aam', 'آم'],
    icon: Apple,
    bgGradient: 'bg-amber-50',
    borderColor: 'border-amber-200/80',
    iconColor: 'text-amber-700',
    category: 'fruits',
    label: 'Mangoes',
  },
  {
    patterns: ['grapes', 'angoor', 'انگور'],
    icon: Apple,
    bgGradient: 'bg-purple-50',
    borderColor: 'border-purple-200/80',
    iconColor: 'text-purple-700',
    category: 'fruits',
    label: 'Grapes',
  },
  // --- PRODUCE: VEGETABLES ---
  {
    patterns: ['cucumber', 'kheera', 'khira', 'کھیرا'],
    icon: Salad,
    bgGradient: 'bg-emerald-50',
    borderColor: 'border-emerald-200/80',
    iconColor: 'text-emerald-700',
    category: 'vegetables',
    label: 'Cucumber',
  },
  {
    patterns: ['carrot', 'carrots', 'gajar', 'گاجر'],
    icon: Carrot,
    bgGradient: 'bg-orange-50',
    borderColor: 'border-orange-200/80',
    iconColor: 'text-orange-700',
    category: 'vegetables',
    label: 'Carrot',
  },
  // --- DAIRY: CHEESE & CREAM ---
  {
    patterns: ['cheese', 'cheddar', 'mozzarella', 'paneer', 'پنیر', 'چیز'],
    icon: Package,
    bgGradient: 'bg-amber-50',
    borderColor: 'border-amber-200/80',
    iconColor: 'text-amber-700',
    category: 'dairy',
    label: 'Cheese & Paneer',
  },
  {
    patterns: ['cream', 'malai', 'balai', 'whipping cream', 'ملائی', 'کریم'],
    icon: Milk,
    bgGradient: 'bg-blue-50',
    borderColor: 'border-blue-200/80',
    iconColor: 'text-blue-700',
    category: 'dairy',
    label: 'Cream',
  },
  // --- BAKERY: BUNS, RUSK & CAKES ---
  {
    patterns: ['rusk', 'buns', 'burger buns', 'cake', 'cupcake', 'patties', 'بسکٹ', 'کیک', 'بن'],
    icon: Croissant,
    bgGradient: 'bg-amber-50',
    borderColor: 'border-amber-200/80',
    iconColor: 'text-amber-800',
    category: 'bakery',
    label: 'Bakery & Rusk',
  },
  // --- BEVERAGES: SODA & JUICE ---
  {
    patterns: ['coke', 'pepsi', 'sprite', '7up', 'soda', 'cold drink', 'cold drinks', 'dew', 'fanta', 'کوک', 'پیپسی', 'سافٹ ڈرنک'],
    icon: CupSoda,
    bgGradient: 'bg-red-50',
    borderColor: 'border-red-200/80',
    iconColor: 'text-red-700',
    category: 'beverages',
    label: 'Soft Drink / Soda',
  },
  {
    patterns: ['juice', 'mango juice', 'orange juice', 'apple juice', 'tang', 'rooh afza', 'sharbat', 'جوس', 'روح افزا'],
    icon: Droplets,
    bgGradient: 'bg-rose-50',
    borderColor: 'border-rose-200/80',
    iconColor: 'text-rose-700',
    category: 'beverages',
    label: 'Juice & Squash',
  },
  // --- SNACKS: CHIPS, CHOCOLATES, NUTS ---
  {
    patterns: ['chips', 'lays', 'kurkure', 'slims', 'nimko', 'nimco', 'چپس', 'نمکو'],
    icon: Cookie,
    bgGradient: 'bg-amber-50',
    borderColor: 'border-amber-200/80',
    iconColor: 'text-amber-700',
    category: 'snacks',
    label: 'Chips & Nimko',
  },
  {
    patterns: ['chocolate', 'chocolates', 'cadbury', 'kitkat', 'dairy milk', 'candy', 'toffee', 'چاکلیٹ', 'ٹافی'],
    icon: Candy,
    bgGradient: 'bg-pink-50',
    borderColor: 'border-pink-200/80',
    iconColor: 'text-pink-700',
    category: 'snacks',
    label: 'Chocolate & Sweets',
  },
  {
    patterns: ['almonds', 'badam', 'nuts', 'kaju', 'cashew', 'pista', 'pistachio', 'walnut', 'akhrot', 'بادام', 'کاجو', 'پستہ'],
    icon: Package,
    bgGradient: 'bg-stone-50',
    borderColor: 'border-stone-200/80',
    iconColor: 'text-stone-700',
    category: 'dry_fruits',
    label: 'Nuts & Dry Fruits',
  },
  // --- HOUSEHOLD & CLEANING ---
  {
    patterns: ['tissue', 'tissues', 'tissue roll', 'kitchen towel', 'toilet paper', 'ٹشو'],
    icon: FileText,
    bgGradient: 'bg-sky-50',
    borderColor: 'border-sky-200/80',
    iconColor: 'text-sky-700',
    category: 'household',
    label: 'Tissues & Paper',
  },
  {
    patterns: ['bleach', 'harpic', 'finis', 'toilet cleaner', 'floor cleaner', 'mop', 'broom', 'جھاڑو', 'فنائل'],
    icon: Sparkles,
    bgGradient: 'bg-teal-50',
    borderColor: 'border-teal-200/80',
    iconColor: 'text-teal-700',
    category: 'cleaning',
    label: 'Cleaning Supplies',
  },
  {
    patterns: ['dishwash', 'vim', 'max bar', 'dish soap', 'برتن دھونے کا صابن'],
    icon: Sparkles,
    bgGradient: 'bg-emerald-50',
    borderColor: 'border-emerald-200/80',
    iconColor: 'text-emerald-700',
    category: 'cleaning',
    label: 'Dishwash Soap',
  },
  // --- PANTRY: PASTA, NOODLES, SAUCE ---
  {
    patterns: ['pasta', 'macaroni', 'noodles', 'maggi', 'knorr', 'spaghetti', 'نوڈلز', 'پاستا'],
    icon: Soup,
    bgGradient: 'bg-amber-50',
    borderColor: 'border-amber-200/80',
    iconColor: 'text-amber-700',
    category: 'cooking_essentials',
    label: 'Pasta & Noodles',
  },
  {
    patterns: ['ketchup', 'chili garlic sauce', 'mayo', 'mayonnaise', 'soy sauce', 'vinegar', 'sirka', 'کیچپ', 'سرکہ'],
    icon: Droplets,
    bgGradient: 'bg-red-50',
    borderColor: 'border-red-200/80',
    iconColor: 'text-red-700',
    category: 'sauces_condiments',
    label: 'Sauces & Condiments',
  },
  // --- FROZEN FOODS ---
  {
    patterns: ['samosa', 'roll', 'nuggets', 'shami kabab', 'kabab', 'frozen', 'سموسہ', 'کباب'],
    icon: Snowflake,
    bgGradient: 'bg-cyan-50',
    borderColor: 'border-cyan-200/80',
    iconColor: 'text-cyan-700',
    category: 'frozen',
    label: 'Frozen & Snacks',
  },
];

/**
 * 3. CATEGORY STYLING & ICON MAP (Tier 3: Category Match)
 */
const CATEGORY_MAP: Record<
  CategoryId,
  {
    icon: LucideIcon;
    bgGradient: string;
    borderColor: string;
    iconColor: string;
    label: string;
  }
> = {
  vegetables: { icon: Salad, bgGradient: 'bg-emerald-50', borderColor: 'border-emerald-200/80', iconColor: 'text-emerald-700', label: 'Vegetables' },
  fruits: { icon: Apple, bgGradient: 'bg-lime-50', borderColor: 'border-lime-200/80', iconColor: 'text-lime-700', label: 'Fruits' },
  dairy: { icon: Milk, bgGradient: 'bg-blue-50', borderColor: 'border-blue-200/80', iconColor: 'text-blue-700', label: 'Dairy' },
  meat: { icon: Drumstick, bgGradient: 'bg-rose-50', borderColor: 'border-rose-200/80', iconColor: 'text-rose-700', label: 'Meat' },
  poultry: { icon: Egg, bgGradient: 'bg-amber-50', borderColor: 'border-amber-200/80', iconColor: 'text-amber-700', label: 'Poultry' },
  seafood: { icon: Fish, bgGradient: 'bg-cyan-50', borderColor: 'border-cyan-200/80', iconColor: 'text-cyan-700', label: 'Seafood' },
  bakery: { icon: Croissant, bgGradient: 'bg-amber-50', borderColor: 'border-amber-200/80', iconColor: 'text-amber-700', label: 'Bakery' },
  grains: { icon: Wheat, bgGradient: 'bg-yellow-50', borderColor: 'border-yellow-200/80', iconColor: 'text-yellow-800', label: 'Grains' },
  rice: { icon: Wheat, bgGradient: 'bg-yellow-50', borderColor: 'border-yellow-200/80', iconColor: 'text-yellow-800', label: 'Rice' },
  pulses: { icon: Soup, bgGradient: 'bg-amber-50', borderColor: 'border-amber-200/80', iconColor: 'text-amber-800', label: 'Pulses & Daal' },
  spices: { icon: Flame, bgGradient: 'bg-orange-50', borderColor: 'border-orange-200/80', iconColor: 'text-orange-700', label: 'Spices' },
  herbs: { icon: Leaf, bgGradient: 'bg-emerald-50', borderColor: 'border-emerald-200/80', iconColor: 'text-emerald-700', label: 'Fresh Herbs' },
  dry_fruits: { icon: Package, bgGradient: 'bg-stone-50', borderColor: 'border-stone-200/80', iconColor: 'text-stone-700', label: 'Dry Fruits' },
  beverages: { icon: Coffee, bgGradient: 'bg-teal-50', borderColor: 'border-teal-200/80', iconColor: 'text-teal-700', label: 'Beverages' },
  snacks: { icon: Cookie, bgGradient: 'bg-amber-50', borderColor: 'border-amber-200/80', iconColor: 'text-amber-700', label: 'Snacks' },
  frozen: { icon: Snowflake, bgGradient: 'bg-sky-50', borderColor: 'border-sky-200/80', iconColor: 'text-sky-700', label: 'Frozen Food' },
  sauces_condiments: { icon: Droplets, bgGradient: 'bg-red-50', borderColor: 'border-red-200/80', iconColor: 'text-red-700', label: 'Sauces' },
  cooking_essentials: { icon: Archive, bgGradient: 'bg-orange-50', borderColor: 'border-orange-200/80', iconColor: 'text-orange-700', label: 'Cooking Essentials' },
  household: { icon: Home, bgGradient: 'bg-amber-50', borderColor: 'border-amber-200/80', iconColor: 'text-amber-700', label: 'Household' },
  kitchen: { icon: Home, bgGradient: 'bg-amber-50', borderColor: 'border-amber-200/80', iconColor: 'text-amber-700', label: 'Kitchen' },
  cleaning: { icon: Sparkles, bgGradient: 'bg-emerald-50', borderColor: 'border-emerald-200/80', iconColor: 'text-emerald-700', label: 'Cleaning' },
  personal_care: { icon: Bath, bgGradient: 'bg-indigo-50', borderColor: 'border-indigo-200/80', iconColor: 'text-indigo-700', label: 'Personal Care' },
  baby_care: { icon: Baby, bgGradient: 'bg-pink-50', borderColor: 'border-pink-200/80', iconColor: 'text-pink-700', label: 'Baby Care' },
  health: { icon: Pill, bgGradient: 'bg-rose-50', borderColor: 'border-rose-200/80', iconColor: 'text-rose-700', label: 'Health' },
  stationery: { icon: FileText, bgGradient: 'bg-blue-50', borderColor: 'border-blue-200/80', iconColor: 'text-blue-700', label: 'Stationery' },
  electronics: { icon: Smartphone, bgGradient: 'bg-slate-50', borderColor: 'border-slate-200/80', iconColor: 'text-slate-700', label: 'Electronics' },
  uncategorized: { icon: ShoppingBag, bgGradient: 'bg-surface-container', borderColor: 'border-surface-dim', iconColor: 'text-on-surface-variant', label: 'General' },
  other: { icon: Tag, bgGradient: 'bg-surface-container', borderColor: 'border-surface-dim', iconColor: 'text-on-surface-variant', label: 'Other' },
  // Backward compatibility keys
  eggs: { icon: Egg, bgGradient: 'bg-amber-50', borderColor: 'border-amber-200/80', iconColor: 'text-amber-700', label: 'Eggs' },
  grocery: { icon: Archive, bgGradient: 'bg-orange-50', borderColor: 'border-orange-200/80', iconColor: 'text-orange-700', label: 'Grocery' },
  herbal: { icon: Leaf, bgGradient: 'bg-emerald-50', borderColor: 'border-emerald-200/80', iconColor: 'text-emerald-700', label: 'Herbal' },
  baby: { icon: Baby, bgGradient: 'bg-pink-50', borderColor: 'border-pink-200/80', iconColor: 'text-pink-700', label: 'Baby' },
  pet_supplies: { icon: Dog, bgGradient: 'bg-amber-50', borderColor: 'border-amber-200/80', iconColor: 'text-amber-800', label: 'Pet Supplies' },
  home: { icon: Home, bgGradient: 'bg-amber-50', borderColor: 'border-amber-200/80', iconColor: 'text-amber-700', label: 'Home' },
  hardware: { icon: Wrench, bgGradient: 'bg-zinc-50', borderColor: 'border-zinc-200/80', iconColor: 'text-zinc-700', label: 'Hardware' },
  clothing: { icon: Shirt, bgGradient: 'bg-violet-50', borderColor: 'border-violet-200/80', iconColor: 'text-violet-700', label: 'Clothing' },
  canned_food: { icon: Archive, bgGradient: 'bg-orange-50', borderColor: 'border-orange-200/80', iconColor: 'text-orange-700', label: 'Canned Food' },
  grains_staples: { icon: Wheat, bgGradient: 'bg-yellow-50', borderColor: 'border-yellow-200/80', iconColor: 'text-yellow-800', label: 'Grains & Staples' },
  medicines: { icon: Pill, bgGradient: 'bg-rose-50', borderColor: 'border-rose-200/80', iconColor: 'text-rose-700', label: 'Medicines' },
};

/**
 * Normalizes input string for robust token matching
 */
function normalizeText(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface ResolveItemVisualParams {
  name?: string;
  canonicalName?: string;
  displayName?: string;
  categoryId?: CategoryId | string;
  rawInput?: string;
}

/**
 * CENTRALIZED ITEM-ICON RESOLVER
 *
 * Resolves any item into its deterministic visual representation:
 * Priority 1: Exact staple vector illustration (Bespoke SVG)
 * Priority 2: Canonical item icon with tailored palette
 * Priority 3: Category visual representation
 * Priority 4: Safe generic shopping fallback
 *
 * Never returns blank, random, or undefined.
 */
export function resolveItemVisual(params: ResolveItemVisualParams): ResolvedItemVisual {
  const { name = '', canonicalName = '', displayName = '', categoryId = 'other', rawInput = '' } = params;

  // Build searchable text bag from all available attributes
  const candidateTexts = [
    normalizeText(canonicalName),
    normalizeText(name),
    normalizeText(displayName),
    normalizeText(rawInput),
  ].filter(Boolean);

  const fullText = candidateTexts.join(' ');

  // ==========================================
  // TIER 1: EXACT STAPLE VECTOR ILLUSTRATION
  // ==========================================
  for (const staple of EXACT_STAPLE_PATTERNS) {
    for (const pattern of staple.patterns) {
      const normalizedPattern = normalizeText(pattern);
      if (!normalizedPattern) continue;

      const isMatch = candidateTexts.some((txt) => {
        if (txt === normalizedPattern) return true;
        // Word boundary match
        const regex = new RegExp(`\\b${normalizedPattern}\\b`, 'i');
        return regex.test(txt);
      });

      if (isMatch) {
        // Return Tier 1 with exact SVG key
        const catConfig = CATEGORY_MAP[categoryId as CategoryId] || CATEGORY_MAP.other;
        return {
          tier: 'exact',
          stapleKey: staple.key,
          icon: catConfig.icon,
          bgGradient: catConfig.bgGradient,
          borderColor: catConfig.borderColor,
          iconColor: catConfig.iconColor,
          resolvedCategory: (categoryId as CategoryId) || 'other',
          label: staple.key,
        };
      }
    }
  }

  // ==========================================
  // TIER 2: CANONICAL ITEM MATCH
  // ==========================================
  for (const canonical of CANONICAL_DEFINITIONS) {
    for (const pattern of canonical.patterns) {
      const normalizedPattern = normalizeText(pattern);
      if (!normalizedPattern) continue;

      const isMatch = candidateTexts.some((txt) => {
        if (txt === normalizedPattern) return true;
        const regex = new RegExp(`\\b${normalizedPattern}\\b`, 'i');
        return regex.test(txt);
      });

      if (isMatch) {
        return {
          tier: 'canonical',
          icon: canonical.icon,
          bgGradient: canonical.bgGradient,
          borderColor: canonical.borderColor,
          iconColor: canonical.iconColor,
          resolvedCategory: canonical.category,
          label: canonical.label,
        };
      }
    }
  }

  // ==========================================
  // TIER 3: CATEGORY ICON MATCH
  // ==========================================
  const resolvedCatKey = (categoryId as CategoryId) || 'other';
  if (CATEGORY_MAP[resolvedCatKey]) {
    const cat = CATEGORY_MAP[resolvedCatKey];
    return {
      tier: 'category',
      icon: cat.icon,
      bgGradient: cat.bgGradient,
      borderColor: cat.borderColor,
      iconColor: cat.iconColor,
      resolvedCategory: resolvedCatKey,
      label: cat.label,
    };
  }

  // ==========================================
  // TIER 4: GENERIC SHOPPING FALLBACK
  // ==========================================
  return {
    tier: 'fallback',
    icon: ShoppingBag,
    bgGradient: 'bg-surface-container',
    borderColor: 'border-surface-dim/70',
    iconColor: 'text-on-surface-variant',
    resolvedCategory: 'other',
    label: name || 'Shopping Item',
  };
}
