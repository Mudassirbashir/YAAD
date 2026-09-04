import { supabase } from '../supabase';
import { MasterCatalogItem, CategoryRecord } from '../../types';
import { INITIAL_MASTER_CATALOG } from './items';
import { MASTER_CATEGORIES } from './categories';
import { defaultCatalogSearchEngine } from './searchEngine';
import { defaultItemCatalog } from '../recognition/catalog';

const CACHE_KEY_ITEMS = 'yaad_cached_master_items_v1';
const CACHE_KEY_CATEGORIES = 'yaad_cached_master_categories_v1';

class SupabaseCatalogService {
  private isSyncing = false;
  private hasInitialized = false;

  /**
   * Initializes the catalog:
   * 1. Hydrates immediately from cached storage if available
   * 2. Synchronizes remotely from Supabase if connected
   */
  public async initialize(): Promise<void> {
    if (this.hasInitialized) return;
    this.hasInitialized = true;

    try {
      // 1. Load cached items from localStorage if available
      const cachedItemsRaw = localStorage.getItem(CACHE_KEY_ITEMS);
      if (cachedItemsRaw) {
        const cachedItems = JSON.parse(cachedItemsRaw) as MasterCatalogItem[];
        if (Array.isArray(cachedItems) && cachedItems.length > 0) {
          defaultCatalogSearchEngine.indexItems(cachedItems);
        }
      }
    } catch {
      // Ignore cache read errors
    }

    // 2. Fetch updates from Supabase asynchronously in background (non-blocking)
    this.syncFromSupabase().catch(() => {
      // Silently continue with local seed items on offline or unconfigured instances
    });
  }

  /**
   * Syncs public master catalog from Supabase
   */
  public async syncFromSupabase(): Promise<boolean> {
    if (this.isSyncing) return false;
    this.isSyncing = true;

    try {
      // Fetch public categories
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!catError && catData && catData.length > 0) {
        try {
          localStorage.setItem(CACHE_KEY_CATEGORIES, JSON.stringify(catData));
        } catch {
          // ignore cache write error
        }
      }

      // Fetch public master items
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .select('*')
        .eq('active', true);

      if (!itemError && itemData && itemData.length > 0) {
        const mergedItems: MasterCatalogItem[] = [...INITIAL_MASTER_CATALOG];
        const existingIds = new Set(mergedItems.map((i) => i.id));

        for (const remote of itemData) {
          const formatted: MasterCatalogItem = {
            id: remote.id,
            canonical_name: remote.canonical_name,
            english_name: remote.english_name,
            urdu_name: remote.urdu_name,
            roman_urdu_names: remote.roman_urdu_names || [],
            aliases: remote.aliases || [],
            common_misspellings: remote.common_misspellings || [],
            category_id: remote.category_id,
            subcategory_id: remote.subcategory_id,
            searchable_terms: remote.searchable_terms || [],
            active: remote.active,
            created_at: remote.created_at,
            updated_at: remote.updated_at,
            emoji: remote.emoji,
            default_unit: remote.default_unit,
            canonicalName: remote.canonical_name,
            nameUrdu: remote.urdu_name,
            nameRomanUrdu: remote.roman_urdu_names?.[0] || '',
            categoryId: remote.category_id,
            defaultUnit: remote.default_unit,
          };

          if (existingIds.has(formatted.id)) {
            const idx = mergedItems.findIndex((i) => i.id === formatted.id);
            if (idx >= 0) mergedItems[idx] = formatted;
          } else {
            mergedItems.push(formatted);
            existingIds.add(formatted.id);
          }
        }

        defaultCatalogSearchEngine.indexItems(mergedItems);

        // Also update ItemCatalog in recognition
        defaultItemCatalog.registerItems(
          mergedItems.map((item) => ({
            id: item.id,
            canonical_name: item.canonical_name,
            english_name: item.english_name,
            urdu_name: item.urdu_name,
            roman_urdu_names: item.roman_urdu_names,
            aliases: item.aliases,
            category: item.category_id,
            subcategory: item.subcategory_id,
            common_spellings: item.common_misspellings,
            confidence: 0.98,
            active: item.active,
            emoji: item.emoji,
            defaultUnit: item.default_unit,
            canonicalName: item.canonical_name,
            nameUrdu: item.urdu_name,
            nameRomanUrdu: item.roman_urdu_names[0] || '',
            categoryId: item.category_id,
          }))
        );

        try {
          localStorage.setItem(CACHE_KEY_ITEMS, JSON.stringify(mergedItems));
        } catch {
          // ignore cache write error
        }

        return true;
      }
    } catch {
      // Offline fallback is natural
    } finally {
      this.isSyncing = false;
    }

    return false;
  }

  /**
   * Records user purchase for personalization (Requirement 13: user_item_history container).
   * Safe to call on list completion or purchase.
   */
  public async recordUserPurchase(
    userId: string,
    itemId: string,
    preferredQuantity?: string
  ): Promise<void> {
    if (!userId || !itemId) return;

    try {
      // Upsert into user_item_history
      const { data: existing } = await supabase
        .from('user_item_history')
        .select('id, purchase_count')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .maybeSingle();

      const newCount = (existing?.purchase_count || 0) + 1;
      const historyId = existing?.id || `hist_${userId}_${itemId}`;

      await supabase.from('user_item_history').upsert({
        id: historyId,
        user_id: userId,
        item_id: itemId,
        purchase_count: newCount,
        last_purchased_at: new Date().toISOString(),
        preferred_quantity: preferredQuantity || undefined,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Fail silently without disrupting user flow
    }
  }
}

export const supabaseCatalog = new SupabaseCatalogService();
