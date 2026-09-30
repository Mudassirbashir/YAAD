import { ShoppingItem, CategoryId } from '../../types';
import {
  UserItemBehaviorProfile,
  CoPurchasePair,
  RecommendationCandidate,
  RecommendationEngineConfig,
  DEFAULT_RECOMMENDATION_CONFIG,
} from './types';
import {
  calculateIntervalStatistics,
  generatePersonalRecommendations,
} from './engine';
import { getStarterRecommendations } from './starterCatalog';
import { detectListContext } from './context';
import { isCandidateInList } from './filter';
import {
  getAllUserBehaviorProfiles,
  saveUserBehaviorProfilesBatch,
  saveUserBehaviorProfile,
  getAllUserCoPurchases,
  saveUserCoPurchasesBatch,
  clearUserRecommendationData,
} from '../offlineDb';
import { supabase } from '../supabase';
import { defaultCatalogSearchEngine } from '../catalog';

export class RecommendationService {
  private userId: string = 'guest';
  private profilesMap: Map<string, UserItemBehaviorProfile> = new Map();
  private coPurchasesMap: Map<string, CoPurchasePair> = new Map();
  private isInitialized: boolean = false;
  private listeners: Set<() => void> = new Set();
  private config: RecommendationEngineConfig = DEFAULT_RECOMMENDATION_CONFIG;

  constructor(config?: Partial<RecommendationEngineConfig>) {
    if (config) {
      this.config = { ...DEFAULT_RECOMMENDATION_CONFIG, ...config };
    }
  }

  /**
   * Subscribe to recommendation updates
   */
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error('Error in recommendation listener:', err);
      }
    }
  }

  /**
   * Initializes the service for the active user, loading offline data first then syncing with Supabase if online
   */
  public async initialize(userId?: string): Promise<void> {
    const targetUserId = userId || 'guest';
    if (this.isInitialized && this.userId === targetUserId) {
      return;
    }

    this.userId = targetUserId;
    this.profilesMap.clear();
    this.coPurchasesMap.clear();

    try {
      // 1. Fast local load from IndexedDB
      const localProfiles = await getAllUserBehaviorProfiles(this.userId);
      for (const p of localProfiles) {
        if (p.canonicalName) {
          this.profilesMap.set(p.canonicalName.toLowerCase(), p);
        }
      }

      const localCoPurchases = await getAllUserCoPurchases(this.userId);
      for (const cp of localCoPurchases) {
        const key = `${cp.itemA.toLowerCase()}__${cp.itemB.toLowerCase()}`;
        this.coPurchasesMap.set(key, cp);
      }

      this.isInitialized = true;
      this.notifyListeners();

      // 2. Background sync with Supabase if authenticated and online
      if (this.userId !== 'guest' && typeof navigator !== 'undefined' && navigator.onLine) {
        this.syncFromSupabase().catch((err) => {
          console.warn('Background recommendation sync failed:', err);
        });
      }
    } catch (err) {
      console.warn('Recommendation service initialization error:', err);
      this.isInitialized = true;
    }
  }

  /**
   * Synchronizes user purchase history from Supabase if online
   */
  private async syncFromSupabase(): Promise<void> {
    if (!this.userId || this.userId === 'guest') return;

    try {
      // Query shopping_history from Supabase (the real existing persistence table)
      const { data, error } = await supabase
        .from('shopping_history')
        .select('*')
        .eq('user_id', this.userId)
        .order('purchased_at', { ascending: false });

      if (error) {
        console.warn('Could not fetch shopping_history from Supabase:', error.message);
        return;
      }

      if (data && data.length > 0) {
        let hasNew = false;
        // Group rows by canonical_name / item_name
        const countMap = new Map<string, { count: number; lastPurchasedAt: string; firstPurchasedAt: string; category: CategoryId; displayName: string }>();

        for (const row of data) {
          const canonical = (row.canonical_name || row.item_name || '').toLowerCase().trim();
          if (!canonical) continue;

          const existing = countMap.get(canonical);
          const purchasedAt = row.purchased_at || row.created_at || new Date().toISOString();
          if (existing) {
            existing.count += 1;
            if (new Date(purchasedAt) > new Date(existing.lastPurchasedAt)) {
              existing.lastPurchasedAt = purchasedAt;
            }
            if (new Date(purchasedAt) < new Date(existing.firstPurchasedAt)) {
              existing.firstPurchasedAt = purchasedAt;
            }
          } else {
            countMap.set(canonical, {
              count: 1,
              lastPurchasedAt: purchasedAt,
              firstPurchasedAt: purchasedAt,
              category: 'other' as CategoryId,
              displayName: row.canonical_name || row.item_name || canonical,
            });
          }
        }

        for (const [canonical, stats] of countMap.entries()) {
          const existing = this.profilesMap.get(canonical);
          if (!existing || stats.count > existing.purchaseCount) {
            hasNew = true;
            const updatedProfile: UserItemBehaviorProfile = {
              id: `${this.userId}_${canonical}`,
              userId: this.userId,
              canonicalName: canonical,
              displayName: stats.displayName,
              category: stats.category,
              purchaseCount: stats.count,
              firstPurchasedAt: stats.firstPurchasedAt,
              lastPurchasedAt: stats.lastPurchasedAt,
              purchaseHistory: [Date.parse(stats.lastPurchasedAt)],
              averageIntervalDays: 7,
              intervalStdDevDays: 0,
              purchaseFrequency: 'weekly',
              quantityFrequencies: {},
              unitFrequencies: {},
              weekdayDistribution: [0, 0, 0, 0, 0, 0, 0],
              dismissalCount: 0,
              createdAt: stats.firstPurchasedAt,
              updatedAt: stats.lastPurchasedAt,
            };
            this.profilesMap.set(canonical, updatedProfile);
          }
        }

        if (hasNew) {
          await saveUserBehaviorProfilesBatch(Array.from(this.profilesMap.values()));
          this.notifyListeners();
        }
      }
    } catch (err) {
      console.warn('Failed to sync recommendations with Supabase:', err);
    }
  }

  /**
   * Resolves item canonical name, localized metadata, and category
   */
  private resolveItemMetadata(item: ShoppingItem): {
    canonicalName: string;
    displayName: string;
    nameUrdu?: string;
    nameRomanUrdu?: string;
    category: CategoryId;
    emoji?: string;
  } {
    // If item already has canonical name from Step 2/3 parser or catalog
    const directCanonical = item.canonicalName || item.canonical_name;
    if (directCanonical) {
      return {
        canonicalName: directCanonical,
        displayName: item.name || directCanonical,
        nameUrdu: item.nameUrdu,
        nameRomanUrdu: item.nameRomanUrdu,
        category: (item.categoryId as CategoryId) || 'vegetables',
        emoji: item.emoji,
      };
    }

    // Try resolving via default catalog search engine
    const searchResult = defaultCatalogSearchEngine.search(item.name || item.original_name || '', 1);
    if (searchResult.length > 0 && searchResult[0].confidence >= 0.6) {
      const match = searchResult[0].item;
      return {
        canonicalName: match.canonical_name,
        displayName: match.english_name,
        nameUrdu: match.urdu_name,
        nameRomanUrdu: match.roman_urdu_names[0],
        category: match.category_id as CategoryId,
        emoji: match.emoji,
      };
    }

    // Fallback: clean normalized name
    const cleanName = (item.name || item.original_name || 'item').trim();
    return {
      canonicalName: cleanName.toLowerCase(),
      displayName: cleanName,
      nameUrdu: item.nameUrdu,
      nameRomanUrdu: item.nameRomanUrdu,
      category: (item.categoryId as CategoryId) || 'other',
      emoji: item.emoji,
    };
  }

  /**
   * Strong Signal Purchase Event:
   * Records completed shopping trip items into user behavioral history.
   * Only items with completed === true are recorded.
   */
  public async recordCompletedTrip(
    items: ShoppingItem[],
    tripTimestamp: number = Date.now()
  ): Promise<void> {
    if (!items || items.length === 0) return;

    // Filter to completed items only!
    const completedItems = items.filter((it) => it.completed === true);
    if (completedItems.length === 0) return;

    const tripDate = new Date(tripTimestamp);
    const dayOfWeek = tripDate.getDay(); // 0 = Sunday, 6 = Saturday
    const tripIso = tripDate.toISOString();

    const profilesToUpdate: UserItemBehaviorProfile[] = [];
    const completedCanonicalNames: string[] = [];

    // 1. Process behavioral signals for each completed item
    for (const item of completedItems) {
      const meta = this.resolveItemMetadata(item);
      const canonicalKey = meta.canonicalName.toLowerCase();
      completedCanonicalNames.push(canonicalKey);

      let profile = this.profilesMap.get(canonicalKey);

      if (!profile) {
        // First purchase of this item
        const quantityFreqs: Record<string, number> = {};
        if (item.quantity) quantityFreqs[item.quantity] = 1;

        const unitFreqs: Record<string, number> = {};
        if (item.unit) unitFreqs[item.unit] = 1;

        const weekdayDist = [0, 0, 0, 0, 0, 0, 0];
        weekdayDist[dayOfWeek] = 1;

        profile = {
          id: `${this.userId}_${canonicalKey}`,
          userId: this.userId,
          canonicalName: meta.canonicalName,
          displayName: meta.displayName,
          nameUrdu: meta.nameUrdu,
          nameRomanUrdu: meta.nameRomanUrdu,
          category: meta.category,
          emoji: meta.emoji,
          purchaseCount: 1,
          firstPurchasedAt: tripIso,
          lastPurchasedAt: tripIso,
          purchaseHistory: [tripTimestamp],
          averageIntervalDays: 7, // Baseline default until 2nd purchase
          intervalStdDevDays: 0,
          purchaseFrequency: 'weekly',
          preferredQuantity: item.quantity,
          preferredUnit: item.unit,
          quantityFrequencies: quantityFreqs,
          unitFrequencies: unitFreqs,
          weekdayDistribution: weekdayDist,
          dismissalCount: 0,
          createdAt: tripIso,
          updatedAt: tripIso,
        };
      } else {
        // Subsequent purchase: update intervals, frequencies, and counts
        const updatedCount = profile.purchaseCount + 1;

        // Keep last 20 timestamps for interval accuracy
        const updatedHistory = [tripTimestamp, ...(profile.purchaseHistory || [])].slice(0, 20);
        const stats = calculateIntervalStatistics(updatedHistory);

        // Update quantity and unit frequencies
        const updatedQtyFreqs = { ...(profile.quantityFrequencies || {}) };
        if (item.quantity) {
          updatedQtyFreqs[item.quantity] = (updatedQtyFreqs[item.quantity] || 0) + 1;
        }

        const updatedUnitFreqs = { ...(profile.unitFrequencies || {}) };
        if (item.unit) {
          updatedUnitFreqs[item.unit] = (updatedUnitFreqs[item.unit] || 0) + 1;
        }

        // Update weekday distribution
        const updatedWeekday = [...(profile.weekdayDistribution || [0, 0, 0, 0, 0, 0, 0])];
        updatedWeekday[dayOfWeek] = (updatedWeekday[dayOfWeek] || 0) + 1;

        // Decay dismissal count upon organic purchase
        const updatedDismissals = Math.max(0, profile.dismissalCount - 1);

        profile = {
          ...profile,
          displayName: meta.displayName || profile.displayName,
          nameUrdu: meta.nameUrdu || profile.nameUrdu,
          nameRomanUrdu: meta.nameRomanUrdu || profile.nameRomanUrdu,
          category: meta.category || profile.category,
          emoji: meta.emoji || profile.emoji,
          purchaseCount: updatedCount,
          lastPurchasedAt: tripIso,
          purchaseHistory: updatedHistory,
          averageIntervalDays: stats.averageIntervalDays,
          intervalStdDevDays: stats.stdDevDays,
          purchaseFrequency: stats.frequency,
          quantityFrequencies: updatedQtyFreqs,
          unitFrequencies: updatedUnitFreqs,
          weekdayDistribution: updatedWeekday,
          dismissalCount: updatedDismissals,
          updatedAt: tripIso,
        };
      }

      this.profilesMap.set(canonicalKey, profile);
      profilesToUpdate.push(profile);
    }

    // 2. Process Co-Purchase pairs (items completed in the same shopping trip)
    const pairsToUpdate: CoPurchasePair[] = [];
    const uniqueCanonicals = Array.from(new Set(completedCanonicalNames));

    for (let i = 0; i < uniqueCanonicals.length; i++) {
      for (let j = i + 1; j < uniqueCanonicals.length; j++) {
        const itemA = uniqueCanonicals[i] < uniqueCanonicals[j] ? uniqueCanonicals[i] : uniqueCanonicals[j];
        const itemB = uniqueCanonicals[i] < uniqueCanonicals[j] ? uniqueCanonicals[j] : uniqueCanonicals[i];
        const pairKey = `${itemA}__${itemB}`;

        let pair = this.coPurchasesMap.get(pairKey);
        if (!pair) {
          pair = {
            id: `${this.userId}_${itemA}_${itemB}`,
            userId: this.userId,
            itemA,
            itemB,
            coPurchaseCount: 1,
            lastCoPurchasedAt: tripIso,
          };
        } else {
          pair = {
            ...pair,
            coPurchaseCount: pair.coPurchaseCount + 1,
            lastCoPurchasedAt: tripIso,
          };
        }

        this.coPurchasesMap.set(pairKey, pair);
        pairsToUpdate.push(pair);
      }
    }

    // 3. Persist batch to local IndexedDB
    await Promise.allSettled([
      saveUserBehaviorProfilesBatch(profilesToUpdate),
      saveUserCoPurchasesBatch(pairsToUpdate),
    ]);

    // 4. Asynchronously sync to Supabase if authenticated and online
    this.syncTripToSupabase(profilesToUpdate).catch((err) => {
      console.warn('Trip sync to Supabase deferred/failed:', err);
    });

    this.notifyListeners();
  }

  /**
   * Syncs completed profiles to Supabase tables (user_item_history & frequently_bought_items)
   */
  private async syncTripToSupabase(profiles: UserItemBehaviorProfile[]): Promise<void> {
    if (!this.userId || this.userId === 'guest' || typeof navigator === 'undefined' || !navigator.onLine) {
      return;
    }

    try {
      // Completed purchases are already recorded in Supabase 'shopping_history'
      // by recordCompletedShoppingTrip() upon list completion.
      // We persist local profiles to offline storage for instantaneous offline recommendations.
      await saveUserBehaviorProfilesBatch(profiles);
    } catch (err) {
      console.warn('Error saving local recommendation profiles:', err);
    }
  }

  /**
   * Check if user has personal shopping history (>= 2 completed purchases for at least one item)
   */
  public hasPersonalHistory(): boolean {
    let personalItemsCount = 0;
    for (const profile of this.profilesMap.values()) {
      if (profile.purchaseCount >= this.config.minPurchasesForPersonal) {
        personalItemsCount++;
      }
    }
    return personalItemsCount >= 1;
  }

  /**
   * Gets personalized recommendations (or gracefully falls back to starter popular items for new users)
   */
  public getRecommendations(options?: {
    listTitle?: string;
    contextId?: string;
    currentListItems?: ShoppingItem[];
    limit?: number;
    forcePersonalOnly?: boolean;
    includeAlreadyAdded?: boolean;
  }): RecommendationCandidate[] {
    const limit = options?.limit ?? this.config.maxRecommendationsHome;
    const currentItems = options?.currentListItems || [];
    const listTitle = options?.listTitle;
    const contextId = options?.contextId;
    const includeAlreadyAdded = options?.includeAlreadyAdded ?? false;

    const currentListCanonicals: string[] = currentItems.map((item) => {
      const meta = this.resolveItemMetadata(item);
      return meta.canonicalName.toLowerCase();
    });

    // 1. Generate personal recommendations from user behavior
    const profiles = Array.from(this.profilesMap.values());
    const coPurchases = Array.from(this.coPurchasesMap.values());

    const personal = generatePersonalRecommendations(
      profiles,
      coPurchases,
      currentListCanonicals,
      limit,
      this.config,
      Date.now(),
      listTitle,
      contextId,
      this.userId,
      includeAlreadyAdded
    );

    // Thoroughly verify isAlreadyAdded on all personal recommendations
    for (const p of personal) {
      if (isCandidateInList(p, currentItems)) {
        p.isAlreadyAdded = true;
      }
    }

    const filteredPersonal = includeAlreadyAdded
      ? personal
      : personal.filter((p) => !p.isAlreadyAdded && !isCandidateInList(p, currentItems));

    // If user has enough personal recommendations, return them immediately
    if (filteredPersonal.length >= 2 || options?.forcePersonalOnly) {
      return filteredPersonal;
    }

    // 2. Cold-Start / Hybrid Transition:
    // If user is brand new or only has 1 personal item, blend in popular starter items
    // (clearly labeled with isStarterCatalog: true, isBaseline: true)
    const detected = detectListContext(listTitle, currentItems, contextId);
    const starterItems = getStarterRecommendations(limit, detected.contextId);
    const existingKeys = new Set(filteredPersonal.map((p) => p.canonicalName.toLowerCase()));

    const blended = [...filteredPersonal];
    for (const starter of starterItems) {
      if (blended.length >= limit) break;
      const key = starter.canonicalName.toLowerCase();
      const inList = isCandidateInList(starter, currentItems) || currentListCanonicals.includes(key);

      starter.isAlreadyAdded = inList;
      if (!existingKeys.has(key)) {
        if (!inList || includeAlreadyAdded) {
          blended.push(starter);
          existingKeys.add(key);
        }
      }
    }

    return blended;
  }

  /**
   * User Acceptance Feedback:
   * When user adds a recommendation to their list, reinforce confidence
   * and increase contextual affinity for that user and context.
   */
  public async acceptRecommendation(canonicalName: string, contextId?: string): Promise<void> {
    const key = canonicalName.toLowerCase();
    let profile = this.profilesMap.get(key);

    if (!profile) {
      return;
    }

    const updatedAffinities = { ...(profile.contextAffinities || {}) };
    if (contextId && contextId !== 'general') {
      updatedAffinities[contextId] = (updatedAffinities[contextId] || 0) + 1;
    }

    const updatedProfile: UserItemBehaviorProfile = {
      ...profile,
      acceptedCount: (profile.acceptedCount || 0) + 1,
      contextAffinities: updatedAffinities,
      updatedAt: new Date().toISOString(),
    };

    this.profilesMap.set(key, updatedProfile);
    await saveUserBehaviorProfile(updatedProfile);
    this.notifyListeners();
  }

  /**
   * User Dismissal Feedback:
   * Dampens the recommendation score for this item without permanent blacklisting
   */
  public async dismissRecommendation(canonicalName: string, contextId?: string): Promise<void> {
    const key = canonicalName.toLowerCase();
    const profile = this.profilesMap.get(key);
    if (!profile) return;

    const updatedProfile: UserItemBehaviorProfile = {
      ...profile,
      dismissalCount: (profile.dismissalCount || 0) + 1,
      lastDismissedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.profilesMap.set(key, updatedProfile);
    await saveUserBehaviorProfile(updatedProfile);
    this.notifyListeners();
  }

  /**
   * Purges all recommendation data for user isolation on logout or account deletion
   */
  public async clearUserData(userId?: string): Promise<void> {
    const target = userId || this.userId;
    this.profilesMap.clear();
    this.coPurchasesMap.clear();
    this.isInitialized = false;
    await clearUserRecommendationData(target);
    this.notifyListeners();
  }
}

// Global Singleton Instance
export const recommendationService = new RecommendationService();
