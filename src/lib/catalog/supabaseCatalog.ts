import { supabase } from '../supabase';
import { MasterCatalogItem, CategoryRecord } from '../../types';
import { INITIAL_MASTER_CATALOG } from './items';
import { MASTER_CATEGORIES } from './categories';
import { defaultCatalogSearchEngine } from './searchEngine';
import { defaultItemCatalog } from '../recognition/catalog';
import { generateUUID } from '../uuid';

const CACHE_KEY_ITEMS = 'yaad_cached_master_items_v1';
const CACHE_KEY_CATEGORIES = 'yaad_cached_master_categories_v1';
const CACHE_KEY_ALIASES = 'yaad_cached_master_aliases_v1';

class SupabaseCatalogService {
  private isSyncing = false;
  private hasInitialized = false;

  /**
   * Initializes the catalog:
   * 1. Hydrates immediately from cached storage if available (100% offline-ready)
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

      // 2. Load cached master aliases from localStorage if available
      const cachedAliasesRaw = localStorage.getItem(CACHE_KEY_ALIASES);
      if (cachedAliasesRaw) {
        const cachedAliases = JSON.parse(cachedAliasesRaw);
        if (Array.isArray(cachedAliases)) {
          for (const row of cachedAliases) {
            const aliasText = (row.alias || row.alias_name || row.raw_alias || row.name || '').trim();
            const targetItemId = row.item_id || row.canonical_id || row.canonical_item_id;
            if (aliasText && targetItemId) {
              defaultItemCatalog.registerCustomAlias(aliasText, targetItemId);
            }
          }
        }
      }
    } catch {
      // Ignore cache read errors
    }

    // 3. Fetch updates from Supabase asynchronously in background (non-blocking)
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
      // 1. Fetch public categories from existing 'categories' table if populated
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

      // 2. Fetch public master aliases from existing Supabase 'item_aliases' table
      try {
        if (supabase) {
          const { data: aliasData, error: aliasError } = await supabase
            .from('item_aliases')
            .select('*');

          if (!aliasError && aliasData && Array.isArray(aliasData) && aliasData.length > 0) {
            for (const row of aliasData) {
              const aliasText = (row.alias || row.alias_name || row.raw_alias || '').trim();
              const canonicalName = row.canonical_name || row.item_name || '';
              if (aliasText && canonicalName) {
                defaultItemCatalog.registerCustomAlias(aliasText, canonicalName);
              }
            }
            try {
              localStorage.setItem(CACHE_KEY_ALIASES, JSON.stringify(aliasData));
            } catch {
              // ignore cache write error
            }
          }
        }
      } catch {
        // Graceful fallback
      }

      // 3. Ensure master catalog is always indexed from INITIAL_MASTER_CATALOG
      defaultCatalogSearchEngine.indexItems(INITIAL_MASTER_CATALOG);
      return true;
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
    if (!supabase || (typeof navigator !== 'undefined' && !navigator.onLine)) return;

    try {
      // Find item in catalog to resolve canonical name
      const catalogItem = defaultItemCatalog.findItemByName(itemId);
      const itemName = catalogItem?.english_name || catalogItem?.canonicalName || itemId;

      await supabase.from('shopping_history').insert({
        id: generateUUID(),
        user_id: userId,
        item_name: itemName,
        canonical_name: catalogItem?.canonicalName || itemName,
        quantity: preferredQuantity ? parseFloat(preferredQuantity) || null : null,
        unit: catalogItem?.defaultUnit || null,
        purchased_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
    } catch {
      // Fail silently without disrupting user flow
    }
  }
}

export const supabaseCatalog = new SupabaseCatalogService();
