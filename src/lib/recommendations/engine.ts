import { CategoryId } from '../../types';
import {
  UserItemBehaviorProfile,
  CoPurchasePair,
  RecommendationCandidate,
  RecommendationEngineConfig,
  DEFAULT_RECOMMENDATION_CONFIG,
  ScoringFactors,
  PurchaseCycleFrequency,
  RecommendationExplanation,
} from './types';

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

  // Ensure timestamps are sorted chronologically ascending
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
 * Calculates statistical mode for preferred quantity and unit
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
 * Computes recommendation score for a single user item profile
 */
export function computeRecommendationScore(
  profile: UserItemBehaviorProfile,
  now: number,
  activeItemCanonicalNames: Set<string>,
  coPurchaseMap: Map<string, number>, // targetItem -> coPurchaseCount
  config: RecommendationEngineConfig = DEFAULT_RECOMMENDATION_CONFIG
): ScoringFactors {
  const lastPurchasedTime = profile.lastPurchasedAt ? Date.parse(profile.lastPurchasedAt) : now;
  const daysSinceLastPurchase = Math.max(0, (now - lastPurchasedTime) / MS_PER_DAY);

  // 1. Frequency Score (combines total purchases & recent purchases in last 60 days)
  const recentThreshold = now - 60 * MS_PER_DAY;
  const recentPurchases = (profile.purchaseHistory || []).filter((t) => t >= recentThreshold).length;

  // Base purchase count normalized (reaches ~0.8 at 4 purchases, 1.0 at 8+ purchases)
  const totalCountScore = Math.min(1.0, Math.log2(profile.purchaseCount + 1) / 3.0);
  const recentCountScore = Math.min(1.0, recentPurchases / 3.0);
  const frequencyScore = 0.6 * recentCountScore + 0.4 * totalCountScore;

  // 2. Cycle & Urgency Score (Recency relative to expected interval)
  let cycleUrgencyScore = 0.5;
  const avgInterval = profile.averageIntervalDays;

  if (avgInterval > 0 && profile.purchaseCount >= 2) {
    const cycleProgress = daysSinceLastPurchase / avgInterval;

    if (cycleProgress < 0.35) {
      // Very recently purchased compared to its typical cycle (e.g. bought milk yesterday)
      // Heavily penalize to avoid spamming the user
      cycleUrgencyScore = Math.max(0.05, cycleProgress * 0.4);
    } else if (cycleProgress >= 0.7 && cycleProgress <= 1.35) {
      // In the expected recurring purchase window! (Peak relevance)
      cycleUrgencyScore = 1.0 - Math.abs(1.0 - cycleProgress) * 0.25;
    } else if (cycleProgress > 1.35) {
      // Past typical window — still relevant, but decays smoothly over time
      // Prevents items bought 300 days ago from outranking active recurring items
      const overtime = cycleProgress - 1.35;
      cycleUrgencyScore = Math.max(0.15, 1.0 / (1.0 + overtime * 0.7));
    } else {
      // 0.35 <= cycleProgress < 0.7
      cycleUrgencyScore = 0.4 + (cycleProgress - 0.35) * 1.5;
    }
  } else {
    // Fewer than 2 purchases or unknown interval
    if (daysSinceLastPurchase <= 7) {
      cycleUrgencyScore = 0.75;
    } else if (daysSinceLastPurchase <= 21) {
      cycleUrgencyScore = 0.60;
    } else if (daysSinceLastPurchase <= 60) {
      cycleUrgencyScore = 0.40;
    } else {
      cycleUrgencyScore = Math.max(0.1, 1.0 / (1.0 + (daysSinceLastPurchase - 60) / 30));
    }
  }

  // 3. Regularity Score (Consistency of purchase cycle)
  let regularityScore = 0.5;
  if (profile.purchaseCount >= 3 && avgInterval > 0) {
    const coefOfVariation = profile.intervalStdDevDays / avgInterval;
    if (coefOfVariation <= 0.35) {
      regularityScore = 1.0; // Highly predictable cycle
    } else if (coefOfVariation <= 0.75) {
      regularityScore = 0.75;
    } else {
      regularityScore = 0.45;
    }
  }

  // 4. Co-Purchase Score (Based on items currently in user's list/context)
  let coPurchaseScore = 0;
  const coCount = coPurchaseMap.get(profile.canonicalName) || 0;
  if (coCount > 0 && profile.purchaseCount > 0) {
    const ratio = coCount / Math.max(1, profile.purchaseCount);
    coPurchaseScore = Math.min(1.0, ratio * 1.5);
  }

  // 5. Weekday Habit Score
  let weekdayScore = 0.5;
  const todayWeekday = new Date(now).getDay(); // 0 = Sunday, 6 = Saturday
  const dayPurchases = profile.weekdayDistribution?.[todayWeekday] || 0;
  if (profile.purchaseCount > 0 && dayPurchases > 0) {
    const dayRatio = dayPurchases / profile.purchaseCount;
    // Average expectation is 1/7 (~0.14). If dayRatio > 0.28, strong day preference
    if (dayRatio >= 0.28) {
      weekdayScore = 1.0;
    } else if (dayRatio >= 0.18) {
      weekdayScore = 0.75;
    }
  }

  // 6. User Dismissal Penalty (Dampening)
  let dismissalPenalty = 1.0;
  if (profile.dismissalCount > 0 && profile.lastDismissedAt) {
    const daysSinceDismissal = (now - Date.parse(profile.lastDismissedAt)) / MS_PER_DAY;
    if (daysSinceDismissal < 3) {
      // Dismissed in last 3 days: heavy penalty
      dismissalPenalty = Math.max(0.15, 0.25 - profile.dismissalCount * 0.05);
    } else if (daysSinceDismissal < 10) {
      dismissalPenalty = Math.max(0.35, 0.55 - profile.dismissalCount * 0.08);
    } else if (daysSinceDismissal < 30) {
      dismissalPenalty = Math.max(0.6, 0.85 - profile.dismissalCount * 0.05);
    } else {
      dismissalPenalty = Math.max(0.8, 1.0 - profile.dismissalCount * 0.04);
    }
  }

  // 7. Confidence Score
  // Combines purchase volume, regularity, and lack of recent dismissals
  const purchaseConfidence = Math.min(1.0, profile.purchaseCount / 4.0);
  const confidence = Math.max(
    0.1,
    0.45 * purchaseConfidence +
      0.30 * regularityScore +
      0.25 * (avgInterval > 0 ? 0.9 : 0.4)
  ) * dismissalPenalty;

  // 8. Total Weighted Recommendation Score
  const weights = config.weights;
  let rawScore =
    weights.frequency * frequencyScore +
    weights.cycleUrgency * cycleUrgencyScore +
    weights.regularity * regularityScore +
    weights.coPurchase * coPurchaseScore +
    weights.weekday * weekdayScore;

  rawScore = rawScore * dismissalPenalty;
  const totalScore = Math.round(Math.min(1.0, Math.max(0.0, rawScore)) * 100) / 100;

  return {
    frequencyScore,
    cycleUrgencyScore,
    regularityScore,
    coPurchaseScore,
    weekdayScore,
    dismissalPenalty,
    confidence: Math.round(confidence * 100) / 100,
    totalScore,
  };
}

/**
 * Builds an explainable rationale for why an item is recommended
 */
export function buildExplanation(
  profile: UserItemBehaviorProfile,
  factors: ScoringFactors,
  coPurchaseContextItem?: string
): RecommendationExplanation {
  // If co-purchase association is high and context item exists
  if (factors.coPurchaseScore >= 0.5 && coPurchaseContextItem) {
    return {
      type: 'co_purchase',
      textKey: 'recommendations.reasons.copurchase',
      params: { item: coPurchaseContextItem },
    };
  }

  // If in expected recurring purchase window
  if (factors.cycleUrgencyScore >= 0.8 && profile.purchaseCount >= 2 && profile.averageIntervalDays > 0) {
    if (profile.purchaseFrequency === 'weekly') {
      return {
        type: 'frequency_cycle',
        textKey: 'recommendations.reasons.weekly',
      };
    }
    if (profile.purchaseFrequency === 'biweekly') {
      return {
        type: 'frequency_cycle',
        textKey: 'recommendations.reasons.biweekly',
      };
    }
    if (profile.purchaseFrequency === 'monthly') {
      return {
        type: 'frequency_cycle',
        textKey: 'recommendations.reasons.monthly',
      };
    }
    return {
      type: 'due_date',
      textKey: 'recommendations.reasons.dueSoon',
    };
  }

  // Frequent repeat purchase
  if (profile.purchaseCount >= 3) {
    return {
      type: 'recent_repeat',
      textKey: 'recommendations.reasons.frequent',
      params: { count: profile.purchaseCount },
    };
  }

  return {
    type: 'due_date',
    textKey: 'recommendations.reasons.dueSoon',
  };
}

/**
 * Generates personalized item recommendations from user behavior profiles.
 *
 * Enforces:
 * - Single-user scope (privacy-first)
 * - Filtering out items already in current shopping list
 * - Filtering out items with low confidence or recent dismissal
 * - Ranking by combined multidimensional score
 * - Inclusion of learned preferred quantity and unit
 * - Transparent explanation for every recommendation
 */
export function generatePersonalRecommendations(
  profiles: UserItemBehaviorProfile[],
  coPurchasePairs: CoPurchasePair[],
  currentListCanonicalNames: string[] = [],
  limit: number = 4,
  config: RecommendationEngineConfig = DEFAULT_RECOMMENDATION_CONFIG,
  now: number = Date.now()
): RecommendationCandidate[] {
  if (!profiles || profiles.length === 0) {
    return [];
  }

  const activeNamesSet = new Set(
    currentListCanonicalNames.map((n) => n.trim().toLowerCase())
  );

  // Build co-purchase lookup map based on items currently in list
  // Map<candidateCanonicalName, maxCoPurchasesWithCurrentItems>
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

    // 2. Minimum purchase threshold (avoid one-off mistakes or unconfirmed items)
    if (profile.purchaseCount < config.minPurchasesForPersonal) {
      continue;
    }

    // 3. Compute scoring factors
    const factors = computeRecommendationScore(
      profile,
      now,
      activeNamesSet,
      coPurchaseMap,
      config
    );

    // 4. Confidence filter
    if (factors.confidence < config.confidenceThreshold) {
      continue;
    }

    // 5. Build friendly explanation
    const contextItem = coPurchaseContextMap.get(canonicalLower);
    const explanation = buildExplanation(profile, factors, contextItem);

    // 6. Learn preferred quantity and unit
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
      suggestedQuantity: preferredQuantity || profile.preferredQuantity,
      suggestedUnit: preferredUnit || profile.preferredUnit,
      score: factors.totalScore,
      confidence: factors.confidence,
      explanation,
      scoringFactors: factors,
      isStarterCatalog: false,
    });
  }

  // Sort descending by total score, then by confidence
  candidates.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.confidence - a.confidence;
  });

  return candidates.slice(0, limit);
}
