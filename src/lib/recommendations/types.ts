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

  // Contextual Affinities (e.g. 'bbq': 3, 'supermarket': 5)
  contextAffinities?: Record<string, number>;

  // User Acceptance / Feedback signals
  acceptedCount?: number;
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
  | 'interval_due'
  | 'context_match'
  | 'frequency_staple'
  | 'co_purchase'
  | 'category_affinity'
  | 'popular_starter'
  | 'due_date'
  | 'frequency_cycle'
  | 'recent_repeat';

export interface RecommendationExplanation {
  type: ExplanationType;
  textKey: string;
  displayReason?: string;
  params?: Record<string, string | number>;
}

export interface ScoringFactors {
  frequencyScore: number;
  recencyScore?: number;
  intervalScore?: number;
  categoryScore?: number;
  contextScore?: number;
  cycleUrgencyScore?: number;
  regularityScore?: number;
  coPurchaseScore?: number;
  weekdayScore?: number;
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
    frequency: number; // 0.25
    recency: number;   // 0.15
    interval: number;  // 0.30 (peak for periodic items like Milk every 7 days)
    category: number;  // 0.15
    context: number;   // 0.15 (list title like Weekend BBQ, Supermarket)
  };
}

export const DEFAULT_RECOMMENDATION_CONFIG: RecommendationEngineConfig = {
  minPurchasesForPersonal: 1,
  maxRecommendationsHome: 4,
  maxRecommendationsList: 6,
  confidenceThreshold: 0.35,
  weights: {
    frequency: 0.25,
    recency: 0.15,
    interval: 0.30,
    category: 0.15,
    context: 0.15,
  },
};

/**
 * Clean architecture interface allowing future ML / AI models to plug in
 * seamlessly without rewriting data persistence or user interfaces.
 */
export interface ISuggestionEngine {
  generateRecommendations(
    profiles: UserItemBehaviorProfile[],
    options: {
      listTitle?: string;
      currentListItems?: string[];
      limit?: number;
      now?: number;
    }
  ): RecommendationCandidate[];
}
