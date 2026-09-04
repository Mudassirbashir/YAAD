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
      // Query user_item_history from Supabase
      const { data, error } = await supabase
        .from('user_item_history')
        .select('*')
        .eq('user_id', this.userId);

      if (error) {
        console.warn('Could not fetch user_item_history from Supabase:', error.message);
        return;
      }

      if (data && data.length > 0) {
        let hasNew = false;
        for (const row of data) {
          const canonical = (row.item_id || row.canonical_name || '').toLowerCase();
          if (!canonical) continue;

          const existing = this.profilesMap.get(canonical);
          if (!existing || (row.purchase_count && row.purchase_count > existing.purchaseCount)) {
            hasNew = true;
            const updatedProfile: UserItemBehaviorProfile = {
              id: `${this.userId}_${canonical}`,
              userId: this.userId,
              canonicalName: canonical,
              displayName: row.canonical_name || canonical,
              category: (row.category as CategoryId) || 'other',
              purchaseCount: row.purchase_count || 1,
              firstPurchasedAt: row.created_at || new Date().toISOString(),
              lastPurchasedAt: row.last_purchased_at || new Date().toISOString(),
              purchaseHistory: existing?.purchaseHistory || [Date.parse(row.last_purchased_at || new Date().toISOString())],
              averageIntervalDays: row.average_interval_days || 7,
              intervalStdDevDays: 0,
              purchaseFrequency: (row.purchase_frequency as any) || 'weekly',
              preferredQuantity: row.preferred_quantity || undefined,
              preferredUnit: row.preferred_unit || undefined,
              quantityFrequencies: existing?.quantityFrequencies || (row.preferred_quantity ? { [row.preferred_quantity]: 1 } : {}),
              unitFrequencies: existing?.unitFrequencies || (row.preferred_unit ? { [row.preferred_unit]: 1 } : {}),
              weekdayDistribution: existing?.weekdayDistribution || [0, 0, 0, 0, 0, 0, 0],
              dismissalCount: row.dismissal_count || 0,
              createdAt: row.created_at || new Date().toISOString(),
              updatedAt: row.updated_at || new Date().toISOString(),
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
      // 1. Update frequently_bought_items
      const freqRows = profiles.map((p) => ({
        id: `${this.userId}_${p.canonicalName.toLowerCase()}`,
        user_id: this.userId,
        item_name: p.displayName || p.canonicalName,
        category: p.category || 'other',
        purchase_count: p.purchaseCount,
        last_purchased_at: p.lastPurchasedAt,
        updated_at: new Date().toISOString(),
      }));

      await supabase
        .from('frequently_bought_items')
        .upsert(freqRows, { onConflict: 'user_id,item_name' });

      // 2. Update user_item_history with rich behavioral signals
      const historyRows = profiles.map((p) => ({
        id: `${this.userId}_${p.canonicalName.toLowerCase()}`,
        user_id: this.userId,
        item_id: p.itemId || p.canonicalName.toLowerCase(),
        purchase_count: p.purchaseCount,
        last_purchased_at: p.lastPurchasedAt,
        purchase_frequency: p.purchaseFrequency,
        preferred_quantity: p.preferredQuantity || null,
        created_at: p.firstPurchasedAt,
        updated_at: new Date().toISOString(),
      }));

      await supabase
        .from('user_item_history')
        .upsert(historyRows, { onConflict: 'user_id,item_id' });
    } catch (err) {
      console.warn('Error syncing purchase signals to Supabase:', err);
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
    currentListItems?: ShoppingItem[];
    limit?: number;
    forcePersonalOnly?: boolean;
  }): RecommendationCandidate[] {
    const limit = options?.limit ?? this.config.maxRecommendationsHome;
    const currentItems = options?.currentListItems || [];

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
      this.config
    );

    // If user has enough personal recommendations, return them immediately
    if (personal.length >= 2 || options?.forcePersonalOnly) {
      return personal;
    }

    // 2. Cold-Start / Hybrid Transition:
    // If user is brand new or only has 1 personal item, blend in popular starter items
    // (clearly labeled with isStarterCatalog: true)
    const starterItems = getStarterRecommendations(limit);
    const existingKeys = new Set([
      ...currentListCanonicals,
      ...personal.map((p) => p.canonicalName.toLowerCase()),
    ]);

    const blended = [...personal];
    for (const starter of starterItems) {
      if (blended.length >= limit) break;
      if (!existingKeys.has(starter.canonicalName.toLowerCase())) {
        blended.push(starter);
        existingKeys.add(starter.canonicalName.toLowerCase());
      }
    }

    return blended;
  }

  /**
   * User Dismissal Feedback:
   * Dampens the recommendation score for this item without permanent blacklisting
   */
  public async dismissRecommendation(canonicalName: string): Promise<void> {
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
