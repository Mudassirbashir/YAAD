import { useSyncExternalStore } from 'react';
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

/**
 * Pure helper for merging static master catalog with remote Supabase items rows.
 * Remote values take precedence for non-null fields while preserving static aliases & misspellings.
 * Remote-only items (admin created) are mapped whole.
 */
export function mergeMasterCatalogItems(
  staticItems: MasterCatalogItem[],
  remoteRows: any[]
): MasterCatalogItem[] {
  const staticMap = new Map<string, MasterCatalogItem>();
  for (const item of staticItems) {
    staticMap.set(item.id, item);
  }

  const merged: MasterCatalogItem[] = [];
  const processedIds = new Set<string>();

  for (const row of remoteRows) {
    if (!row || !row.id) continue;
    processedIds.add(row.id);
    const twin = staticMap.get(row.id);

    if (twin) {
      merged.push({
        ...twin,
        canonical_name: row.canonical_name || twin.canonical_name,
        english_name: row.english_name || twin.english_name,
        urdu_name: row.urdu_name !== undefined ? row.urdu_name : twin.urdu_name,
        roman_urdu_names:
          Array.isArray(row.roman_urdu_names) && row.roman_urdu_names.length > 0
            ? row.roman_urdu_names
            : twin.roman_urdu_names,
        category_id: (row.category_id as any) || twin.category_id,
        subcategory_id: row.subcategory_id !== undefined ? row.subcategory_id : twin.subcategory_id,
        default_unit: row.default_unit || twin.default_unit,
        emoji: row.emoji !== undefined ? row.emoji || undefined : twin.emoji,
        active: row.active !== undefined ? Boolean(row.active) : twin.active,
        imageUrl:
          (row.image_url !== undefined
            ? row.image_url
            : row.imageUrl !== undefined
            ? row.imageUrl
            : twin.imageUrl) || undefined,
        cloudinaryPublicId:
          (row.cloudinary_public_id !== undefined
            ? row.cloudinary_public_id
            : row.cloudinaryPublicId !== undefined
            ? row.cloudinaryPublicId
            : twin.cloudinaryPublicId) || undefined,
        canonicalName: row.canonical_name || twin.canonicalName || twin.canonical_name,
        nameUrdu: row.urdu_name !== undefined ? row.urdu_name : twin.nameUrdu || twin.urdu_name,
        categoryId: (row.category_id as any) || twin.categoryId || twin.category_id,
        defaultUnit: row.default_unit || twin.defaultUnit || twin.default_unit,
      });
    } else {
      const name = row.english_name || row.canonical_name || row.name || '';
      const searchable = [
        name.toLowerCase(),
        (row.urdu_name || '').toLowerCase(),
        ...(Array.isArray(row.roman_urdu_names) ? row.roman_urdu_names.map((r: string) => r.toLowerCase()) : []),
        (row.category_id || '').toLowerCase(),
      ].filter(Boolean);

      merged.push({
        id: row.id,
        canonical_name: row.canonical_name || name,
        english_name: row.english_name || name,
        urdu_name: row.urdu_name || '',
        roman_urdu_names: Array.isArray(row.roman_urdu_names) ? row.roman_urdu_names : [],
        aliases: Array.isArray(row.aliases) ? row.aliases : [],
        common_misspellings: Array.isArray(row.common_misspellings) ? row.common_misspellings : [],
        category_id: (row.category_id as any) || 'other',
        subcategory_id: row.subcategory_id || 'general',
        searchable_terms:
          Array.isArray(row.searchable_terms) && row.searchable_terms.length > 0
            ? row.searchable_terms
            : searchable,
        active: row.active !== false,
        created_at: row.created_at || new Date().toISOString(),
        updated_at: row.updated_at || new Date().toISOString(),
        emoji: row.emoji || undefined,
        default_unit: row.default_unit || 'kg',
        imageUrl: row.image_url || row.imageUrl || undefined,
        cloudinaryPublicId: row.cloudinary_public_id || row.cloudinaryPublicId || undefined,
        canonicalName: row.canonical_name || name,
        nameUrdu: row.urdu_name || '',
        categoryId: (row.category_id as any) || 'other',
        defaultUnit: row.default_unit || 'kg',
      });
    }
  }

  // Include static items not present in remoteRows
  for (const item of staticItems) {
    if (!processedIds.has(item.id)) {
      merged.push(item);
    }
  }

  return merged;
}

class SupabaseCatalogService {
  private isSyncing = false;
  private hasInitialized = false;
  private items: MasterCatalogItem[] = INITIAL_MASTER_CATALOG;
  private version = 0;
  private listeners: Set<() => void> = new Set();

  public getVersion(): number {
    return this.version;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public notifyListeners(): void {
    this.version++;
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error('[Catalog] listener error:', err);
      }
    }
  }

  public setItems(items: MasterCatalogItem[]): void {
    this.items = items;
    defaultCatalogSearchEngine.indexItems(items);
    this.notifyListeners();
  }

  public resetForTesting(): void {
    this.hasInitialized = false;
    this.isSyncing = false;
    this.items = INITIAL_MASTER_CATALOG;
    defaultCatalogSearchEngine.indexItems(INITIAL_MASTER_CATALOG);
    this.notifyListeners();
  }

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
          this.items = cachedItems;
          defaultCatalogSearchEngine.indexItems(cachedItems);
          this.notifyListeners();
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

      // 3. Fetch public items from Supabase 'items' table
      let mergedItems: MasterCatalogItem[] = INITIAL_MASTER_CATALOG;
      try {
        if (supabase) {
          const { data: itemsData, error: itemsError } = await supabase
            .from('items')
            .select('*');

          if (!itemsError && itemsData && Array.isArray(itemsData) && itemsData.length > 0) {
            mergedItems = mergeMasterCatalogItems(INITIAL_MASTER_CATALOG, itemsData);
            try {
              localStorage.setItem(CACHE_KEY_ITEMS, JSON.stringify(mergedItems));
            } catch {
              // ignore cache write error
            }
          }
        }
      } catch {
        // Natural fallback to static items
      }

      this.items = mergedItems;
      defaultCatalogSearchEngine.indexItems(mergedItems);
      return true;
    } catch {
      // Offline fallback is natural
      defaultCatalogSearchEngine.indexItems(INITIAL_MASTER_CATALOG);
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }

    return false;
  }

  /**
   * Resolves Cloudinary catalog image for an item by id or display/canonical name.
   */
  public getCatalogImageForItem(
    idOrName?: string | null
  ): { imageUrl?: string; cloudinaryPublicId?: string } | undefined {
    if (!idOrName) return undefined;
    const trimmed = idOrName.trim();
    if (!trimmed) return undefined;

    // 1. Direct match by id
    const byId = this.items.find((it) => it.id === trimmed);
    if (byId && (byId.imageUrl || byId.cloudinaryPublicId)) {
      return { imageUrl: byId.imageUrl, cloudinaryPublicId: byId.cloudinaryPublicId };
    }

    const norm = trimmed.toLowerCase();

    // 2. Direct match by canonical_name, english_name, roman_urdu_names or aliases
    const byName = this.items.find(
      (it) =>
        it.canonical_name.toLowerCase() === norm ||
        it.english_name.toLowerCase() === norm ||
        (it.roman_urdu_names && it.roman_urdu_names.some((r) => r.toLowerCase() === norm)) ||
        (it.aliases && it.aliases.some((a) => a.toLowerCase() === norm))
    );
    if (byName && (byName.imageUrl || byName.cloudinaryPublicId)) {
      return { imageUrl: byName.imageUrl, cloudinaryPublicId: byName.cloudinaryPublicId };
    }

    // 3. Fallback to defaultItemCatalog.findItemByName
    const recognized = defaultItemCatalog.findItemByName(trimmed);
    if (recognized) {
      const recId = recognized.id;
      const recCanonical = recognized.canonical_name?.toLowerCase();
      const matched = this.items.find(
        (it) => it.id === recId || (recCanonical && it.canonical_name.toLowerCase() === recCanonical)
      );
      if (matched && (matched.imageUrl || matched.cloudinaryPublicId)) {
        return { imageUrl: matched.imageUrl, cloudinaryPublicId: matched.cloudinaryPublicId };
      }
    }

    return undefined;
  }

  /**
   * Returns the current catalog items in memory.
   */
  public getItems(): MasterCatalogItem[] {
    return this.items;
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

export function getCatalogImageForItem(
  idOrName?: string | null
): { imageUrl?: string; cloudinaryPublicId?: string } | undefined {
  return supabaseCatalog.getCatalogImageForItem(idOrName);
}

export function useCatalogVersion(): number {
  return useSyncExternalStore(
    (onStoreChange) => supabaseCatalog.subscribe(onStoreChange),
    () => supabaseCatalog.getVersion(),
    () => supabaseCatalog.getVersion()
  );
}
