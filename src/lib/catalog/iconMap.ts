import { CategoryId } from '../../types';

export interface ItemIconData {
  emoji: string;
  fallbackCategoryId: CategoryId;
}

const CATEGORY_DEFAULT_EMOJIS: Record<CategoryId, string> = {
  vegetables: '🥗',
  fruits: '🍎',
  grains: '🌾',
  rice: '🍚',
  pulses: '🍲',
  canned_food: '🥫',
  sauces_condiments: '🧴',
  cooking_essentials: '🧂',
  grocery: '🌾',
  spices: '🌶️',
  herbal: '🌿',
  herbs: '🌿',
  dairy: '🥛',
  bakery: '🍞',
  meat: '🥩',
  poultry: '🍗',
  seafood: '🐟',
  eggs: '🥚',
  beverages: '☕',
  personal_care: '🧼',
  household: '🏠',
  kitchen: '🍳',
  cleaning: '✨',
  health: '💊',
  baby_care: '👶',
  baby: '👶',
  pet_supplies: '🐾',
  home: '🛋️',
  hardware: '🔧',
  stationery: '📝',
  clothing: '👕',
  dry_fruits: '🥜',
  frozen: '❄️',
  snacks: '🍪',
  electronics: '📱',
  uncategorized: '📦',
  other: '📦',
  grains_staples: '🌾',
  medicines: '💊',
};

const ITEM_SPECIFIC_EMOJIS: Record<string, string> = {
  // Vegetables
  potato: '🥔',
  aloo: '🥔',
  onion: '🧅',
  pyaz: '🧅',
  pyaaz: '🧅',
  tomato: '🍅',
  tamatar: '🍅',
  green_chili: '🌶️',
  hari_mirch: '🌶️',
  ginger: '🧄',
  adrak: '🧄',
  garlic: '🧄',
  lehsan: '🧄',
  spinach: '🥬',
  palak: '🥬',
  coriander: '🌿',
  dhaniya: '🌿',
  mint: '🌿',
  podina: '🌿',
  lemon: '🍋',
  leemu: '🍋',
  nimbu: '🍋',

  // Fruits
  apple: '🍎',
  saib: '🍎',
  banana: '🍌',
  kela: '🍌',
  mango: '🥭',
  aam: '🥭',
  orange: '🍊',
  kinnow: '🍊',
  malta: '🍊',
  guava: '🍈',
  amrood: '🍈',
  grapes: '🍇',
  angoor: '🍇',
  pomegranate: '🍎',
  anar: '🍎',
  anaar: '🍎',

  // Grocery
  sugar: '🧂',
  chini: '🧂',
  cheeni: '🧂',
  flour: '🌾',
  atta: '🌾',
  rice: '🍚',
  chawal: '🍚',
  lentils: '🥣',
  daal: '🥣',
  oil: '🛢️',
  cooking_oil: '🛢️',
  ghee: '🧈',
  salt: '🧂',
  namak: '🧂',
  tea: '☕',
  chai: '☕',
  coffee: '☕',

  // Spices
  red_chili: '🌶️',
  lal_mirch: '🌶️',
  turmeric: '🟡',
  haldi: '🟡',
  cumin: '🌱',
  zeera: '🌱',
  black_pepper: '⚫',
  kali_mirch: '⚫',
  cardamom: '🟢',
  elaichi: '🟢',
  cinnamon: '🪵',
  dar_cheeni: '🪵',
  cloves: '🌰',
  laung: '🌰',
  fennel: '🌾',
  saunf: '🌾',

  // Herbal
  alum: '🌿',
  phitkari: '🌿',
  fitkari: '🌿',
  isabgol: '🌾',
  senna: '🍃',
  sana_makki: '🍃',
  ajwain: '🌱',
  kalonji: '⚫',
  mulethi: '🪵',

  // Dairy
  milk: '🥛',
  doodh: '🥛',
  yogurt: '🥣',
  dahi: '🥣',
  butter: '🧈',
  makhan: '🧈',
  cheese: '🧀',
  paneer: '🧀',
  cream: '🥛',
  malai: '🥛',

  // Bakery
  bread: '🍞',
  double_roti: '🍞',
  buns: '🍔',
  cake: '🍰',
  biscuits: '🍪',
  rusk: '🥖',

  // Meat
  chicken: '🍗',
  beef: '🥩',
  mutton: '🍖',
  bakra: '🍖',

  // Seafood
  fish: '🐟',
  machli: '🐟',
  prawns: '🦐',
  jheenga: '🦐',

  // Eggs
  eggs: '🥚',
  anday: '🥚',
  egg: '🥚',

  // Beverages
  rooh_afza: '🍷',
  sharbat: '🍷',
  water: '💧',
  mineral_water: '💧',
  paani: '💧',

  // Personal care
  soap: '🧼',
  sabun: '🧼',
  shampoo: '🧴',
  toothpaste: '🪥',

  // Household
  tissue: '🧻',
  trash_bags: '🗑️',

  // Cleaning
  surf: '🧺',
  washing_powder: '🧺',
  dishwash: '🧼',
  harpic: '🚽',
  phenyl: '🧴',

  // Health
  panadol: '💊',
  paracetamol: '💊',
  dettol: '🩹',
  saniplast: '🩹',

  // Baby
  diapers: '👶',
  pampers: '👶',
  cerelac: '🥣',

  // Pet
  cat_food: '🐱',

  // Home
  towel: '🧖',

  // Hardware
  limestone: '🧱',
  lime_stone: '🧱',
  choona: '🧱',
  chuna: '🧱',
  super_glue: '🧴',
  elfy: '🧴',
  bulb: '💡',
  led_bulb: '💡',

  // Stationery
  notebook: '📓',
  register: '📓',
  pen: '🖊️',

  // Clothing
  socks: '🧦',
  jurabein: '🧦',
};

/**
 * Resolves a reliable, consistent visual emoji for any item or category.
 * If no item-specific emoji exists, falls back gracefully to category emoji.
 */
export function getItemEmoji(
  itemName?: string,
  categoryId?: CategoryId | string,
  explicitEmoji?: string
): string {
  if (explicitEmoji && explicitEmoji.trim().length > 0) {
    return explicitEmoji;
  }

  if (itemName) {
    const key = itemName.toLowerCase().trim().replace(/[\s-]+/g, '_');
    if (ITEM_SPECIFIC_EMOJIS[key]) {
      return ITEM_SPECIFIC_EMOJIS[key];
    }
    // Also check for partial keyword hits
    for (const [kw, emoji] of Object.entries(ITEM_SPECIFIC_EMOJIS)) {
      if (key.includes(kw) || kw.includes(key)) {
        return emoji;
      }
    }
  }

  if (categoryId && CATEGORY_DEFAULT_EMOJIS[categoryId as CategoryId]) {
    return CATEGORY_DEFAULT_EMOJIS[categoryId as CategoryId];
  }

  return '📦';
}
