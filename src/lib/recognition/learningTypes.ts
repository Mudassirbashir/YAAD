import { CategoryId } from '../../types';

/**
 * Data structures and contract interfaces prepared for YAAD's future intelligence,
 * recommendation algorithm, and personalized habit learning engine.
 */

export interface UserItemPurchaseRecord {
  userId: string;
  itemId: string;
  canonicalName: string;
  categoryId: CategoryId;
  rawInput: string;
  quantity?: string;
  unit?: string;
  purchasedAt: number; // Unix timestamp
  dayOfWeek: number; // 0-6
  price?: number;
}

export interface UserItemFrequencyStats {
  itemId: string;
  canonicalName: string;
  categoryId: CategoryId;
  totalPurchaseCount: number;
  averageWeeklyFrequency: number;
  lastPurchasedAt: number;
  typicalQuantity?: string;
  typicalUnit?: string;
  confidenceScore: number;
}

export interface UserItemCorrection {
  userId: string;
  rawInput: string;
  originalCategoryId: CategoryId;
  correctedCategoryId: CategoryId;
  originalCanonicalName?: string;
  correctedCanonicalName?: string;
  timestamp: number;
}

export interface UserCustomAlias {
  userId: string;
  customAlias: string;
  targetCanonicalId: string;
  targetCanonicalName: string;
  targetCategoryId: CategoryId;
  createdAt: number;
}

export interface WeeklyPredictionResult {
  itemId: string;
  canonicalName: string;
  categoryId: CategoryId;
  probabilityScore: number; // 0.0 - 1.0
  suggestedQuantity?: string;
  suggestedUnit?: string;
  reason: 'weekly_cycle' | 'frequently_bought' | 'depletion_estimate';
}

export interface PersonalizedSuggestion {
  id: string;
  canonicalName: string;
  displayName: string;
  nameUrdu?: string;
  categoryId: CategoryId;
  score: number;
  reason: string;
}

/**
 * Contract for the future Recommendation Engine
 */
export interface RecommendationEngine {
  recordPurchase(record: UserItemPurchaseRecord): Promise<void>;
  recordCorrection(correction: UserItemCorrection): Promise<void>;
  registerCustomAlias(alias: UserCustomAlias): Promise<void>;
  getWeeklyPredictions(userId: string): Promise<WeeklyPredictionResult[]>;
  getFrequentlyPurchased(userId: string, limit?: number): Promise<UserItemFrequencyStats[]>;
  getPersonalizedSuggestions(userId: string): Promise<PersonalizedSuggestion[]>;
}
