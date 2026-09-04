import { CategoryId } from '../../types';
import { RecommendationCandidate } from './types';

export interface StarterCatalogItem {
  canonicalName: string;
  displayName: string;
  nameUrdu: string;
  nameRomanUrdu: string;
  category: CategoryId;
  emoji: string;
  defaultQuantity: string;
  defaultUnit: string;
}

export const STARTER_POPULAR_ESSENTIALS: StarterCatalogItem[] = [
  {
    canonicalName: 'milk',
    displayName: 'Milk',
    nameUrdu: 'دودھ',
    nameRomanUrdu: 'Doodh',
    category: 'dairy',
    emoji: '🥛',
    defaultQuantity: '1',
    defaultUnit: 'litre',
  },
  {
    canonicalName: 'egg',
    displayName: 'Eggs',
    nameUrdu: 'انڈے',
    nameRomanUrdu: 'Anday',
    category: 'poultry',
    emoji: '🥚',
    defaultQuantity: '1',
    defaultUnit: 'dozen',
  },
  {
    canonicalName: 'bread',
    displayName: 'Bread',
    nameUrdu: 'ڈبل روٹی',
    nameRomanUrdu: 'Double Roti',
    category: 'bakery',
    emoji: '🍞',
    defaultQuantity: '1',
    defaultUnit: 'piece',
  },
  {
    canonicalName: 'potato',
    displayName: 'Potato',
    nameUrdu: 'آلو',
    nameRomanUrdu: 'Aloo',
    category: 'vegetables',
    emoji: '🥔',
    defaultQuantity: '1',
    defaultUnit: 'kg',
  },
  {
    canonicalName: 'onion',
    displayName: 'Onion',
    nameUrdu: 'پیاز',
    nameRomanUrdu: 'Piyaz',
    category: 'vegetables',
    emoji: '🧅',
    defaultQuantity: '1',
    defaultUnit: 'kg',
  },
  {
    canonicalName: 'tomato',
    displayName: 'Tomato',
    nameUrdu: 'ٹماٹر',
    nameRomanUrdu: 'Tamatar',
    category: 'vegetables',
    emoji: '🍅',
    defaultQuantity: '1',
    defaultUnit: 'kg',
  },
  {
    canonicalName: 'cooking_oil',
    displayName: 'Cooking Oil',
    nameUrdu: 'کوکنگ آئل',
    nameRomanUrdu: 'Cooking Oil',
    category: 'cooking_essentials',
    emoji: '🛢️',
    defaultQuantity: '1',
    defaultUnit: 'bottle',
  },
  {
    canonicalName: 'tea',
    displayName: 'Tea / Chai',
    nameUrdu: 'چائے کی پتی',
    nameRomanUrdu: 'Chai Patti',
    category: 'beverages',
    emoji: '☕',
    defaultQuantity: '1',
    defaultUnit: 'packet',
  },
  {
    canonicalName: 'sugar',
    displayName: 'Sugar',
    nameUrdu: 'چینی',
    nameRomanUrdu: 'Cheeni',
    category: 'cooking_essentials',
    emoji: '🍚',
    defaultQuantity: '1',
    defaultUnit: 'kg',
  },
];

export function getStarterRecommendations(limit: number = 4): RecommendationCandidate[] {
  return STARTER_POPULAR_ESSENTIALS.slice(0, limit).map((item) => ({
    profile: {
      id: `starter_${item.canonicalName}`,
      userId: '',
      canonicalName: item.canonicalName,
      displayName: item.displayName,
      nameUrdu: item.nameUrdu,
      nameRomanUrdu: item.nameRomanUrdu,
      category: item.category,
      emoji: item.emoji,
      purchaseCount: 0,
      firstPurchasedAt: new Date().toISOString(),
      lastPurchasedAt: new Date().toISOString(),
      purchaseHistory: [],
      averageIntervalDays: 7,
      intervalStdDevDays: 0,
      purchaseFrequency: 'weekly',
      preferredQuantity: item.defaultQuantity,
      preferredUnit: item.defaultUnit,
      quantityFrequencies: { [item.defaultQuantity]: 1 },
      unitFrequencies: { [item.defaultUnit]: 1 },
      weekdayDistribution: [0, 0, 0, 0, 0, 0, 0],
      dismissalCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    canonicalName: item.canonicalName,
    displayName: item.displayName,
    nameUrdu: item.nameUrdu,
    nameRomanUrdu: item.nameRomanUrdu,
    category: item.category,
    emoji: item.emoji,
    suggestedQuantity: item.defaultQuantity,
    suggestedUnit: item.defaultUnit,
    score: 0.5,
    confidence: 0.5,
    isStarterCatalog: true,
    explanation: {
      type: 'popular_starter',
      textKey: 'recommendations.reasons.starter',
    },
    scoringFactors: {
      frequencyScore: 0.5,
      cycleUrgencyScore: 0.5,
      regularityScore: 0.5,
      coPurchaseScore: 0,
      weekdayScore: 0,
      dismissalPenalty: 1.0,
      confidence: 0.5,
      totalScore: 0.5,
    },
  }));
}
