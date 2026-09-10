import { CategoryId, ShoppingItem } from '../../types';
import { UserItemBehaviorProfile } from './types';

export interface DetectedContext {
  contextId: string;
  name: string;
  confidence: number;
  matchingKeywords: string[];
  preferredCategories: CategoryId[];
  affinityItems: Set<string>;
}

export interface ContextDefinition {
  id: string;
  name: string;
  keywords: string[];
  preferredCategories: CategoryId[];
  affinityCanonicalNames: string[];
}

/**
 * Deterministic Context Knowledge Base.
 * Maps common shopping list intents, themes, and Pakistani household contexts
 * to relevant categories and staple items.
 */
export const CONTEXT_DEFINITIONS: ContextDefinition[] = [
  {
    id: 'bbq',
    name: 'BBQ / Barbecue',
    keywords: [
      'bbq',
      'barbecue',
      'barbeque',
      'grill',
      'tikka',
      'kebab',
      'kabab',
      'charcoal',
      'coal',
      'picnic',
      'roast',
      'boti',
      'karahi',
    ],
    preferredCategories: ['meat', 'poultry', 'beverages', 'bakery', 'cooking_essentials', 'household'],
    affinityCanonicalNames: [
      'chicken',
      'beef',
      'mutton',
      'charcoal',
      'bbq_sauce',
      'sauce',
      'spices',
      'tikka_masala',
      'cold_drink',
      'coke',
      'pepsi',
      'sprite',
      'bread',
      'naan',
      'roti',
      'skewers',
      'mayo',
      'ketchup',
      'chutney',
      'lemons',
      'lemon',
      'ginger',
      'garlic',
      'cooking_oil',
    ],
  },
  {
    id: 'supermarket',
    name: 'Supermarket / Weekly Grocery',
    keywords: [
      'supermarket',
      'grocery',
      'groceries',
      'rashan',
      'rashan_list',
      'sauda',
      'weekly',
      'monthly',
      'mart',
      'store',
      'pantry',
      'hypermarket',
      'carrefour',
      'metro',
      'imtiaz',
    ],
    preferredCategories: [
      'dairy',
      'cooking_essentials',
      'vegetables',
      'poultry',
      'bakery',
      'rice',
      'pulses',
      'household',
    ],
    affinityCanonicalNames: [
      'milk',
      'eggs',
      'bread',
      'sugar',
      'tea',
      'cooking_oil',
      'potatoes',
      'tomatoes',
      'onions',
      'rice',
      'flour',
      'atta',
      'salt',
      'yogurt',
      'butter',
      'dish_soap',
      'laundry_detergent',
    ],
  },
  {
    id: 'breakfast',
    name: 'Breakfast / Nashta',
    keywords: [
      'breakfast',
      'nashta',
      'nashtah',
      'morning',
      'subah',
      'brunch',
      'tea_time',
      'chai',
    ],
    preferredCategories: ['dairy', 'bakery', 'poultry', 'beverages'],
    affinityCanonicalNames: [
      'eggs',
      'milk',
      'bread',
      'tea',
      'butter',
      'rusk',
      'jam',
      'cheese',
      'paratha',
      'yogurt',
      'sugar',
      'coffee',
      'honey',
      'cereal',
      'juice',
    ],
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy / Health',
    keywords: [
      'pharmacy',
      'medical',
      'medicine',
      'medicines',
      'chemist',
      'health',
      'dawa',
      'dawakhana',
      'doctor',
      'clinic',
    ],
    preferredCategories: ['health', 'medicines', 'personal_care'],
    affinityCanonicalNames: [
      'panadol',
      'bandages',
      'cough_syrup',
      'pain_relief',
      'vitamins',
      'sanitizer',
      'disprin',
      'paracetamol',
      'cotton',
      'mask',
      'antiseptic',
      'inhaler',
      'eye_drops',
    ],
  },
  {
    id: 'weekly_grocery',
    name: 'Weekly Grocery',
    keywords: [
      'weekly grocery',
      'weekly',
      'grocery',
      'groceries',
      'haftha',
      'hafte ka sauda',
      'daily essentials',
      'kitchen essentials',
    ],
    preferredCategories: [
      'dairy',
      'vegetables',
      'cooking_essentials',
      'poultry',
      'bakery',
      'fruits',
    ],
    affinityCanonicalNames: [
      'milk',
      'eggs',
      'bread',
      'potatoes',
      'tomatoes',
      'onions',
      'cooking_oil',
      'sugar',
      'tea',
      'yogurt',
      'butter',
      'bananas',
      'apples',
    ],
  },
  {
    id: 'monthly_shopping',
    name: 'Monthly Shopping',
    keywords: [
      'monthly shopping',
      'monthly',
      'rashan',
      'rashan_list',
      'bulk',
      'mahina',
      'mahiney ka rashan',
      'mahiney ka sauda',
    ],
    preferredCategories: [
      'cooking_essentials',
      'rice',
      'grains',
      'pulses',
      'household',
      'spices',
    ],
    affinityCanonicalNames: [
      'flour',
      'atta',
      'rice',
      'cooking_oil',
      'ghee',
      'sugar',
      'tea',
      'salt',
      'laundry_detergent',
      'dish_soap',
      'pulses',
      'spices',
    ],
  },
  {
    id: 'fruits_vegetables',
    name: 'Fruits & Vegetables',
    keywords: [
      'fruits & vegetables',
      'fruits and vegetables',
      'fruits',
      'vegetables',
      'sabzi',
      'sabzi mandi',
      'phal',
      'fresh produce',
      'greens',
    ],
    preferredCategories: ['vegetables', 'fruits', 'herbs'],
    affinityCanonicalNames: [
      'potatoes',
      'tomatoes',
      'onions',
      'bananas',
      'apples',
      'lemons',
      'ginger',
      'garlic',
      'coriander',
      'mint',
      'cucumber',
      'carrots',
    ],
  },
  {
    id: 'household',
    name: 'Household / Cleaning',
    keywords: [
      'household',
      'home essentials',
      'essentials',
      'cleaning',
      'clean',
      'ghar',
      'home',
      'safai',
      'laundry',
      'wash',
      'kitchen_supplies',
    ],
    preferredCategories: ['household', 'personal_care'],
    affinityCanonicalNames: [
      'dish_soap',
      'laundry_detergent',
      'detergent',
      'tissue_box',
      'toilet_paper',
      'trash_bags',
      'sponge',
      'bleach',
      'floor_cleaner',
      'soap',
      'hand_wash',
      'shampoo',
      'toothpaste',
    ],
  },
  {
    id: 'party',
    name: 'Party / Gathering',
    keywords: [
      'party',
      'dawat',
      'mehman',
      'dinner',
      'gathering',
      'celebration',
      'event',
      'birthday',
      'eid',
      'festive',
    ],
    preferredCategories: ['beverages', 'snacks', 'meat', 'bakery'],
    affinityCanonicalNames: [
      'cold_drink',
      'coke',
      'pepsi',
      'sprite',
      'chips',
      'chicken',
      'rice',
      'ice_cream',
      'sweets',
      'mithai',
      'disposable_plates',
      'disposable_glasses',
      'tissues',
      'cake',
      'juices',
      'dry_fruits',
    ],
  },
  {
    id: 'baking',
    name: 'Baking / Desserts',
    keywords: [
      'baking',
      'dessert',
      'sweet',
      'mithai',
      'cake',
      'cookies',
      'pastry',
      'custard',
      'kheer',
    ],
    preferredCategories: ['cooking_essentials', 'dairy', 'bakery'],
    affinityCanonicalNames: [
      'flour',
      'sugar',
      'baking_powder',
      'baking_soda',
      'butter',
      'milk',
      'eggs',
      'vanilla_essence',
      'cocoa_powder',
      'chocolate',
      'cream',
      'condensed_milk',
      'icing_sugar',
    ],
  },
];

/**
 * Normalizes text to extract lowercase alphanumeric tokens
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, ' ')
    .split(/\s+/)
    .filter((tok) => tok.length >= 2);
}

/**
 * Detects shopping list context from list title, optional tags, and existing items.
 * Fast, deterministic, and 100% client-side (no network calls, 0 latency).
 */
export function detectListContext(
  title?: string,
  items: ShoppingItem[] = []
): DetectedContext {
  const normalizedTitle = (title || '').trim().toLowerCase();
  const titleTokens = tokenize(normalizedTitle);

  let bestContext: ContextDefinition | null = null;
  let bestScore = 0;
  let matchingKeywords: string[] = [];

  // 1. Analyze title keywords against context definitions
  for (const def of CONTEXT_DEFINITIONS) {
    let score = 0;
    const matches: string[] = [];

    for (const kw of def.keywords) {
      if (normalizedTitle.includes(kw)) {
        score += 2.0;
        matches.push(kw);
      } else if (titleTokens.includes(kw)) {
        score += 1.5;
        matches.push(kw);
      }
    }

    // 2. Also check if existing items in list reinforce this context
    if (items.length > 0) {
      const affinitySet = new Set(def.affinityCanonicalNames);
      let itemCountMatching = 0;

      for (const it of items) {
        const canonical = (it.canonicalName || it.name || '').toLowerCase();
        if (affinitySet.has(canonical)) {
          itemCountMatching++;
        } else if (def.preferredCategories.includes(it.categoryId as CategoryId)) {
          itemCountMatching += 0.5;
        }
      }

      if (itemCountMatching > 0) {
        score += Math.min(2.0, itemCountMatching * 0.5);
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestContext = def;
      matchingKeywords = matches;
    }
  }

  // If a context matched with sufficient confidence
  if (bestContext && bestScore >= 1.5) {
    const confidence = Math.min(1.0, 0.4 + bestScore * 0.2);
    return {
      contextId: bestContext.id,
      name: bestContext.name,
      confidence,
      matchingKeywords,
      preferredCategories: bestContext.preferredCategories,
      affinityItems: new Set(bestContext.affinityCanonicalNames),
    };
  }

  // Default / General Grocery context
  const defaultDef = CONTEXT_DEFINITIONS.find((d) => d.id === 'supermarket')!;
  return {
    contextId: 'general',
    name: 'General Grocery',
    confidence: 0.3,
    matchingKeywords: [],
    preferredCategories: defaultDef.preferredCategories,
    affinityItems: new Set(defaultDef.affinityCanonicalNames),
  };
}

/**
 * Calculates contextScore (0.0 to 1.0) for a specific item given the detected context.
 *
 * Factors:
 * 1. Direct affinity item in context definition (e.g. "chicken" in "BBQ"): up to 1.0
 * 2. Category match (e.g. "meat" category in "BBQ"): up to 0.70
 * 3. User past affinity (user previously accepted/bought this item under this context): +0.20 bonus
 */
export function calculateItemContextScore(
  canonicalName: string,
  category: CategoryId,
  detectedContext: DetectedContext,
  profile?: UserItemBehaviorProfile
): { score: number; reason?: string } {
  const canonical = canonicalName.toLowerCase();

  // If general context, provide a balanced baseline
  if (detectedContext.contextId === 'general') {
    if (detectedContext.affinityItems.has(canonical)) {
      return { score: 0.65, reason: 'Pantry staple' };
    }
    if (detectedContext.preferredCategories.includes(category)) {
      return { score: 0.50, reason: 'Common grocery category' };
    }
    return { score: 0.35 };
  }

  let score = 0.2;
  let reason: string | undefined;

  // 1. Direct affinity item match
  if (detectedContext.affinityItems.has(canonical)) {
    score = 0.85;
    reason = `Matches ${detectedContext.name}`;
  } else if (detectedContext.preferredCategories.includes(category)) {
    score = 0.60;
    reason = `Relevant to ${detectedContext.name}`;
  }

  // 2. User's personal historical reinforcement under this context
  if (profile?.contextAffinities && profile.contextAffinities[detectedContext.contextId]) {
    const userContextAffinity = profile.contextAffinities[detectedContext.contextId];
    score = Math.min(1.0, score + Math.min(0.20, userContextAffinity * 0.05));
    reason = `Frequently in your ${detectedContext.name} trips`;
  }

  // Scale with context confidence
  const finalScore = Math.min(1.0, Math.max(0.1, score * (0.6 + 0.4 * detectedContext.confidence)));

  return {
    score: Math.round(finalScore * 100) / 100,
    reason,
  };
}
