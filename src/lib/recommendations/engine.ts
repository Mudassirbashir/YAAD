import { CategoryId, ShoppingItem } from '../../types';
import {
  UserItemBehaviorProfile,
  CoPurchasePair,
  RecommendationCandidate,
  RecommendationEngineConfig,
  DEFAULT_RECOMMENDATION_CONFIG,
  ScoringFactors,
  PurchaseCycleFrequency,
  RecommendationExplanation,
  ISuggestionEngine,
} from './types';
import { detectListContext, calculateItemContextScore, DetectedContext } from './context';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Calculates interval statistics (mean and standard deviation) from purchase timestamps.
 */
export function calculateIntervalStatistics(
  timestamps: number[]
): { averageIntervalDays: number; stdDevDays: number; frequency: PurchaseCycleFrequency } {
  if (!timestamps || timestamps.length < 2) {
    return { averageIntervalDays: 0, stdDevDays: 0, frequency: 'occasional' };
  }

  // Sort timestamps ascending
  const sorted = [...timestamps].sort((a, b) => a - b);
  const intervals: number[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const diffDays = Math.max(0.1, (sorted[i] - sorted[i - 1]) / MS_PER_DAY);
    intervals.push(diffDays);
  }

  const sum = intervals.reduce((acc, val) => acc + val, 0);
  const mean = sum / intervals.length;

  let varianceSum = 0;
  for (const interval of intervals) {
    varianceSum += Math.pow(interval - mean, 2);
  }
  const stdDev = Math.sqrt(varianceSum / intervals.length);

  let frequency: PurchaseCycleFrequency = 'occasional';
  if (mean <= 2.5) {
    frequency = 'daily';
  } else if (mean <= 9) {
    frequency = 'weekly';
  } else if (mean <= 18) {
    frequency = 'biweekly';
  } else if (mean <= 45) {
    frequency = 'monthly';
  } else {
    frequency = 'occasional';
  }

  return {
    averageIntervalDays: Math.round(mean * 10) / 10,
    stdDevDays: Math.round(stdDev * 10) / 10,
    frequency,
  };
}

/**
 * Statistical mode for learned preferred quantity and unit
 */
export function getPreferredQuantityAndUnit(
  quantityFrequencies: Record<string, number>,
  unitFrequencies: Record<string, number>
): { preferredQuantity?: string; preferredUnit?: string } {
  let preferredQuantity: string | undefined;
  let maxQtyCount = 0;

  for (const [qty, count] of Object.entries(quantityFrequencies || {})) {
    if (qty && count > maxQtyCount) {
      maxQtyCount = count;
      preferredQuantity = qty;
    }
  }

  let preferredUnit: string | undefined;
  let maxUnitCount = 0;

  for (const [unit, count] of Object.entries(unitFrequencies || {})) {
    if (unit && count > maxUnitCount) {
      maxUnitCount = count;
      preferredUnit = unit;
    }
  }

  return { preferredQuantity, preferredUnit };
}

/**
 * Computes individual explainable scoring factors for a candidate item.
 *
 * Scoring Model:
 * recommendationScore = frequencyScore + recencyScore + intervalScore + categoryScore + contextScore
 */
export function computeRecommendationScore(
  profile: UserItemBehaviorProfile,
  now: number,
  activeItemCanonicalNames: Set<string>,
  coPurchaseMap: Map<string, number>,
  detectedContext: DetectedContext,
  categoryUserFrequencyMap: Map<CategoryId, number>,
  config: RecommendationEngineConfig = DEFAULT_RECOMMENDATION_CONFIG
): ScoringFactors {
  const lastPurchasedTime = profile.lastPurchasedAt ? Date.parse(profile.lastPurchasedAt) : now;
  const daysSinceLastPurchase = Math.max(0, (now - lastPurchasedTime) / MS_PER_DAY);

  // 1. FREQUENCY SCORE
  // Combines overall purchase count and recent purchase momentum in the last 60 days
  const recentThreshold = now - 60 * MS_PER_DAY;
  const recentPurchases = (profile.purchaseHistory || []).filter((t) => t >= recentThreshold).length;
  const totalCountScore = Math.min(1.0, Math.log2(profile.purchaseCount + 1) / 3.0);
  const recentCountScore = Math.min(1.0, recentPurchases / 3.0);
  const frequencyScore = Math.round((0.6 * recentCountScore + 0.4 * totalCountScore) * 100) / 100;

  // 2. RECENCY SCORE
  // Gracefully decays over time so ancient items don't dominate without re-purchasing
  const recencyScore = Math.round(Math.max(0.05, Math.exp(-daysSinceLastPurchase / 45)) * 100) / 100;

  // 3. PURCHASE INTERVAL SCORE (Expected Replenishment Cycle)
  // e.g. If user buys Milk every 7 days, and 6-8 days have passed -> peak urgency (1.0)
  // If bought yesterday -> heavily discounted (0.05) to avoid spamming
  let intervalScore = 0.5;
  const avgInterval = profile.averageIntervalDays;

  if (avgInterval > 0 && profile.purchaseCount >= 2) {
    const cycleProgress = daysSinceLastPurchase / avgInterval;

    if (cycleProgress < 0.35) {
      // Very recently purchased compared to its rhythm
      intervalScore = Math.max(0.05, cycleProgress * 0.4);
    } else if (cycleProgress >= 0.7 && cycleProgress <= 1.35) {
      // In the expected recurring purchase window! (Peak relevance)
      intervalScore = 1.0 - Math.abs(1.0 - cycleProgress) * 0.35;
    } else if (cycleProgress > 1.35) {
      // Past typical replenishment window: remains relevant (overdue), but slowly decays
      const overtime = cycleProgress - 1.35;
      intervalScore = Math.max(0.2, 1.0 / (1.0 + overtime * 0.6));
    } else {
      // 0.35 <= cycleProgress < 0.70
      intervalScore = 0.35 + (cycleProgress - 0.35) * 1.85;
    }
  } else {
    // Fewer than 2 purchases or unknown interval: use typical grocery window
    if (daysSinceLastPurchase >= 4 && daysSinceLastPurchase <= 14) {
      intervalScore = 0.75;
    } else if (daysSinceLastPurchase <= 3) {
      intervalScore = 0.25;
    } else if (daysSinceLastPurchase <= 30) {
      intervalScore = 0.55;
    } else {
      intervalScore = Math.max(0.15, 1.0 / (1.0 + (daysSinceLastPurchase - 30) / 30));
    }
  }
  intervalScore = Math.round(intervalScore * 100) / 100;

  // 4. CATEGORY FREQUENCY SCORE
  // How often user shops in this category across their history
  const catCount = categoryUserFrequencyMap.get(profile.category) || 0;
  const totalUserPurchases = Array.from(categoryUserFrequencyMap.values()).reduce((a, b) => a + b, 0);
  let categoryScore = 0.5;
  if (totalUserPurchases > 0) {
    const catRatio = catCount / totalUserPurchases;
    categoryScore = Math.min(1.0, Math.max(0.2, catRatio * 2.5));
  }
  categoryScore = Math.round(categoryScore * 100) / 100;

  // 5. CONTEXT SCORE (List Title & Type context, e.g. Weekend BBQ, Supermarket)
  const contextResult = calculateItemContextScore(
    profile.canonicalName,
    profile.category,
    detectedContext,
    profile
  );
  const contextScore = contextResult.score;

  // Secondary signals: Co-purchase and Weekday
  let coPurchaseScore = 0;
  const coCount = coPurchaseMap.get(profile.canonicalName.toLowerCase()) || 0;
  if (coCount > 0 && profile.purchaseCount > 0) {
    coPurchaseScore = Math.min(1.0, (coCount / Math.max(1, profile.purchaseCount)) * 1.5);
  }

  let weekdayScore = 0.5;
  const todayWeekday = new Date(now).getDay();
  const dayPurchases = profile.weekdayDistribution?.[todayWeekday] || 0;
  if (profile.purchaseCount > 0 && dayPurchases > 0) {
    const dayRatio = dayPurchases / profile.purchaseCount;
    if (dayRatio >= 0.28) {
      weekdayScore = 1.0;
    } else if (dayRatio >= 0.18) {
      weekdayScore = 0.75;
    }
  }

  // 6. USER FEEDBACK: Dismissal Penalty & Acceptance Boost
  let dismissalPenalty = 1.0;
  if (profile.dismissalCount > 0 && profile.lastDismissedAt) {
    const daysSinceDismissal = (now - Date.parse(profile.lastDismissedAt)) / MS_PER_DAY;
    // Gradual recovery over time so accidental dismissal isn't permanent
    if (daysSinceDismissal < 3) {
      dismissalPenalty = Math.max(0.2, 1.0 / (1.0 + profile.dismissalCount * 0.5));
    } else if (daysSinceDismissal < 14) {
      dismissalPenalty = Math.max(0.4, 1.0 / (1.0 + profile.dismissalCount * 0.25));
    } else {
      dismissalPenalty = Math.max(0.7, 1.0 / (1.0 + profile.dismissalCount * 0.1));
    }
  }

  // Acceptance boost: user previously accepted this suggestion
  let acceptanceBoost = 0;
  if (profile.acceptedCount && profile.acceptedCount > 0) {
    acceptanceBoost = Math.min(0.12, profile.acceptedCount * 0.04);
  }

  // 7. CONFIDENCE SCORE
  const purchaseConfidence = Math.min(1.0, profile.purchaseCount / 3.0);
  const confidence = Math.round(
    Math.max(
      0.15,
      (0.4 * purchaseConfidence +
        0.3 * (avgInterval > 0 ? 0.9 : 0.4) +
        0.3 * (contextResult.score >= 0.7 ? 0.9 : 0.5)) *
        dismissalPenalty
    ) * 100
  ) / 100;

  // 8. TOTAL WEIGHTED SCORE
  const weights = config.weights;
  let rawScore =
    weights.frequency * frequencyScore +
    weights.recency * recencyScore +
    weights.interval * intervalScore +
    weights.category * categoryScore +
    weights.context * contextScore +
    acceptanceBoost;

  // Modulate slightly by co-purchase and weekday if present
  if (coPurchaseScore > 0) {
    rawScore += 0.05 * coPurchaseScore;
  }

  rawScore = rawScore * dismissalPenalty;
  const totalScore = Math.round(Math.min(1.0, Math.max(0.0, rawScore)) * 100) / 100;

  return {
    frequencyScore,
    recencyScore,
    intervalScore,
    categoryScore,
    contextScore,
    coPurchaseScore: Math.round(coPurchaseScore * 100) / 100,
    weekdayScore: Math.round(weekdayScore * 100) / 100,
    dismissalPenalty: Math.round(dismissalPenalty * 100) / 100,
    confidence,
    totalScore,
  };
}

/**
 * Builds a clear, deterministic explanation for why an item is recommended
 */
export function buildExplanation(
  profile: UserItemBehaviorProfile,
  factors: ScoringFactors,
  detectedContext: DetectedContext,
  coPurchaseContextItem?: string
): RecommendationExplanation {
  // 1. Context Match (e.g. "Matches Weekend BBQ list")
  if (factors.contextScore >= 0.75 && detectedContext.contextId !== 'general') {
    return {
      type: 'context_match',
      textKey: 'recommendations.reasons.contextMatch',
      displayReason: `Matches ${detectedContext.name}`,
      params: { context: detectedContext.name },
    };
  }

  // 2. Replenishment Interval Due (e.g. "Restock due: bought every ~7 days")
  if (factors.intervalScore >= 0.78 && profile.purchaseCount >= 2 && profile.averageIntervalDays > 0) {
    const days = Math.round(profile.averageIntervalDays);
    return {
      type: 'interval_due',
      textKey: 'recommendations.reasons.intervalDue',
      displayReason: `Restock due: bought every ~${days} days`,
      params: { days },
    };
  }

  // 3. Co-purchase affinity (bought with an item currently on the list)
  if (factors.coPurchaseScore && factors.coPurchaseScore >= 0.5 && coPurchaseContextItem) {
    return {
      type: 'co_purchase',
      textKey: 'recommendations.reasons.copurchase',
      displayReason: `Often bought with ${coPurchaseContextItem}`,
      params: { item: coPurchaseContextItem },
    };
  }

  // 4. Regular staple in user's lists
  if (factors.frequencyScore >= 0.65 || profile.purchaseCount >= 3) {
    return {
      type: 'frequency_staple',
      textKey: 'recommendations.reasons.frequent',
      displayReason: 'Frequently in your shopping trips',
      params: { count: profile.purchaseCount },
    };
  }

  // 5. Category affinity
  if (factors.categoryScore >= 0.7) {
    return {
      type: 'category_affinity',
      textKey: 'recommendations.reasons.categoryStaple',
      displayReason: 'Regular staple in this category',
    };
  }

  // Default fallback
  return {
    type: 'interval_due',
    textKey: 'recommendations.reasons.dueSoon',
    displayReason: 'Recommended for this list',
  };
}

/**
 * Deterministic Recommendation Engine implementation.
 * Implements ISuggestionEngine interface.
 */
export class DeterministicSuggestionEngine implements ISuggestionEngine {
  private config: RecommendationEngineConfig;

  constructor(config: RecommendationEngineConfig = DEFAULT_RECOMMENDATION_CONFIG) {
    this.config = config;
  }

  public generateRecommendations(
    profiles: UserItemBehaviorProfile[],
    options: {
      listTitle?: string;
      currentListItems?: string[];
      coPurchasePairs?: CoPurchasePair[];
      limit?: number;
      now?: number;
    } = {}
  ): RecommendationCandidate[] {
    const {
      listTitle,
      currentListItems = [],
      coPurchasePairs = [],
      limit = this.config.maxRecommendationsList,
      now = Date.now(),
    } = options;

    if (!profiles || profiles.length === 0) {
      return [];
    }

    const activeNamesSet = new Set(
      currentListItems.map((n) => n.trim().toLowerCase())
    );

    // Detect Context from list title & active items
    const pseudoItems: ShoppingItem[] = currentListItems.map((name) => ({
      id: name,
      name,
      categoryId: 'uncategorized' as CategoryId,
      completed: false,
    }));
    const detectedContext = detectListContext(listTitle, pseudoItems);

    // Build user category frequency map
    const categoryUserFrequencyMap = new Map<CategoryId, number>();
    for (const p of profiles) {
      if (p.category) {
        categoryUserFrequencyMap.set(
          p.category,
          (categoryUserFrequencyMap.get(p.category) || 0) + p.purchaseCount
        );
      }
    }

    // Build co-purchase lookup map based on items currently in list
    const coPurchaseMap = new Map<string, number>();
    const coPurchaseContextMap = new Map<string, string>();

    if (activeNamesSet.size > 0 && coPurchasePairs && coPurchasePairs.length > 0) {
      for (const pair of coPurchasePairs) {
        const aInList = activeNamesSet.has(pair.itemA.toLowerCase());
        const bInList = activeNamesSet.has(pair.itemB.toLowerCase());

        if (aInList && !bInList) {
          const candidate = pair.itemB.toLowerCase();
          const currentCount = coPurchaseMap.get(candidate) || 0;
          if (pair.coPurchaseCount > currentCount) {
            coPurchaseMap.set(candidate, pair.coPurchaseCount);
            coPurchaseContextMap.set(candidate, pair.itemA);
          }
        } else if (bInList && !aInList) {
          const candidate = pair.itemA.toLowerCase();
          const currentCount = coPurchaseMap.get(candidate) || 0;
          if (pair.coPurchaseCount > currentCount) {
            coPurchaseMap.set(candidate, pair.coPurchaseCount);
            coPurchaseContextMap.set(candidate, pair.itemB);
          }
        }
      }
    }

    const candidates: RecommendationCandidate[] = [];

    for (const profile of profiles) {
      const canonicalLower = profile.canonicalName.toLowerCase();

      // 1. Never recommend items already on the active list
      if (activeNamesSet.has(canonicalLower)) {
        continue;
      }

      // 2. Minimum purchase threshold
      if (profile.purchaseCount < this.config.minPurchasesForPersonal) {
        continue;
      }

      // 3. Compute 5-factor scoring model
      const factors = computeRecommendationScore(
        profile,
        now,
        activeNamesSet,
        coPurchaseMap,
        detectedContext,
        categoryUserFrequencyMap,
        this.config
      );

      // 4. Confidence filter
      if (factors.confidence < this.config.confidenceThreshold) {
        continue;
      }

      // 5. Build transparent explanation
      const contextItem = coPurchaseContextMap.get(canonicalLower);
      const explanation = buildExplanation(profile, factors, detectedContext, contextItem);

      // 6. Retrieve learned preferred quantity and unit
      const { preferredQuantity, preferredUnit } = getPreferredQuantityAndUnit(
        profile.quantityFrequencies,
        profile.unitFrequencies
      );

      candidates.push({
        profile,
        canonicalName: profile.canonicalName,
        displayName: profile.displayName || profile.canonicalName,
        nameUrdu: profile.nameUrdu,
        nameRomanUrdu: profile.nameRomanUrdu,
        category: profile.category,
        emoji: profile.emoji,
        suggestedQuantity: preferredQuantity || profile.preferredQuantity || '1',
        suggestedUnit: preferredUnit || profile.preferredUnit,
        score: factors.totalScore,
        confidence: factors.confidence,
        explanation,
        scoringFactors: factors,
        isStarterCatalog: false,
      });
    }

    // Sort descending by totalScore, then confidence
    candidates.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.confidence - a.confidence;
    });

    return candidates.slice(0, limit);
  }
}

// Default export instance of the deterministic suggestion engine
export const defaultSuggestionEngine = new DeterministicSuggestionEngine();

/**
 * Functional wrapper matching legacy calls while utilizing the enhanced engine
 */
export function generatePersonalRecommendations(
  profiles: UserItemBehaviorProfile[],
  coPurchasePairs: CoPurchasePair[],
  currentListCanonicalNames: string[] = [],
  limit: number = 4,
  config: RecommendationEngineConfig = DEFAULT_RECOMMENDATION_CONFIG,
  now: number = Date.now(),
  listTitle?: string
): RecommendationCandidate[] {
  const engine = new DeterministicSuggestionEngine(config);
  return engine.generateRecommendations(profiles, {
    listTitle,
    currentListItems: currentListCanonicalNames,
    coPurchasePairs,
    limit,
    now,
  });
}
