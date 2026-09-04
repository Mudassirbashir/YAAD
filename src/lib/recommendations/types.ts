import { CategoryId } from '../../types';

export type PurchaseCycleFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'occasional';

export interface UserItemBehaviorProfile {
  id: string; // `${userId}_${canonicalName}`
  userId: string;
  itemId?: string; // Master catalog item id if matched
  canonicalName: string; // Normalized canonical identifier (e.g., 'potato', 'milk', 'egg')
  displayName: string; // Localized/Display English name
  nameUrdu?: string;
  nameRomanUrdu?: string;
  category: CategoryId;
  emoji?: string;

  // Counts & Dates
  purchaseCount: number;
  firstPurchasedAt: string; // ISO string
  lastPurchasedAt: string; // ISO string
  purchaseHistory: number[]; // Timestamps (ms) of previous purchases (most recent first, up to 20)

  // Intervals & Regularity
  averageIntervalDays: number; // e.g. 7.0 for weekly milk
  intervalStdDevDays: number; // Regularity measure (smaller = more predictable)
  purchaseFrequency: PurchaseCycleFrequency;

  // Learned Quantities & Units
  preferredQuantity?: string; // Mode/most frequent quantity (e.g. "2")
  preferredUnit?: string; // Mode/most frequent unit (e.g. "kg", "liter", "dozen")
  quantityFrequencies: Record<string, number>;
  unitFrequencies: Record<string, number>;

  // Day of Week Habits (Index 0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  weekdayDistribution: number[];

  // User Dismissal / Feedback signals
  dismissalCount: number;
  lastDismissedAt?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface CoPurchasePair {
  id: string; // `${userId}_${itemA}_${itemB}` (with itemA < itemB sorted alphabetically)
  userId: string;
  itemA: string; // canonical name A
  itemB: string; // canonical name B
  coPurchaseCount: number;
  lastCoPurchasedAt: string;
}

export type ExplanationType =
  | 'due_date'
  | 'frequency_cycle'
  | 'recent_repeat'
  | 'co_purchase'
  | 'popular_starter';

export interface RecommendationExplanation {
  type: ExplanationType;
  textKey: string;
  params?: Record<string, string | number>;
}

export interface ScoringFactors {
  frequencyScore: number;
  cycleUrgencyScore: number;
  regularityScore: number;
  coPurchaseScore: number;
  weekdayScore: number;
  dismissalPenalty: number;
  confidence: number;
  totalScore: number;
}

export interface RecommendationCandidate {
  profile: UserItemBehaviorProfile;
  canonicalName: string;
  displayName: string;
  nameUrdu?: string;
  nameRomanUrdu?: string;
  category: CategoryId;
  emoji?: string;
  suggestedQuantity?: string;
  suggestedUnit?: string;
  score: number;
  confidence: number;
  explanation: RecommendationExplanation;
  scoringFactors: ScoringFactors;
  isStarterCatalog?: boolean;
}

export interface RecommendationEngineConfig {
  minPurchasesForPersonal: number;
  maxRecommendationsHome: number;
  maxRecommendationsList: number;
  confidenceThreshold: number;
  weights: {
    frequency: number;
    cycleUrgency: number;
    regularity: number;
    coPurchase: number;
    weekday: number;
  };
}

export const DEFAULT_RECOMMENDATION_CONFIG: RecommendationEngineConfig = {
  minPurchasesForPersonal: 2,
  maxRecommendationsHome: 4,
  maxRecommendationsList: 5,
  confidenceThreshold: 0.55,
  weights: {
    frequency: 0.30,
    cycleUrgency: 0.35,
    regularity: 0.15,
    coPurchase: 0.15,
    weekday: 0.05,
  },
};
