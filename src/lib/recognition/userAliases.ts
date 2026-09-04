import { CategoryId } from '../../types';
import { normalizeBaseText } from './normalizer';
import { supabase } from '../supabase';

export interface UserCustomAlias {
  id: string;
  userId?: string;
  rawAlias: string;
  normalizedAlias: string;
  canonicalId?: string;
  canonicalName: string;
  categoryId: CategoryId;
  confidence: number;
  usageCount: number;
  lastUsedAt: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'yaad_user_item_aliases';

// In-memory cache for ultra-fast synchronous lookup during typing
let aliasCache: Map<string, UserCustomAlias> | null = null;

function loadFromStorage(): Map<string, UserCustomAlias> {
  const map = new Map<string, UserCustomAlias>();
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return map;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: UserCustomAlias[] = JSON.parse(raw);
      for (const item of parsed) {
        map.set(item.normalizedAlias, {
          ...item,
          usageCount: item.usageCount || 1,
          lastUsedAt: item.lastUsedAt || item.updatedAt || item.createdAt,
        });
      }
    }
  } catch (err) {
    console.warn('[UserAliases] Failed to load local aliases:', err);
  }
  return map;
}

function persistToStorage(map: Map<string, UserCustomAlias>): void {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return;
  }
  try {
    const list = Array.from(map.values());
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('[UserAliases] Failed to persist local aliases:', err);
  }
}

/**
 * Gets cached alias map, initializing from localStorage if not already loaded.
 */
function getAliasMap(): Map<string, UserCustomAlias> {
  if (!aliasCache) {
    aliasCache = loadFromStorage();
  }
  return aliasCache;
}

/**
 * Returns all user custom aliases sorted by usageCount descending.
 */
export function getAllUserCustomAliases(): UserCustomAlias[] {
  return Array.from(getAliasMap().values()).sort((a, b) => b.usageCount - a.usageCount);
}

/**
 * Synchronously retrieves any user-specific custom alias mapping.
 * Ensures user-specific corrections remain private and instant.
 */
export function getUserCustomAlias(rawInput: string): UserCustomAlias | undefined {
  const norm = normalizeBaseText(rawInput);
  if (!norm) return undefined;
  return getAliasMap().get(norm);
}

/**
 * Saves or updates a user-specific alias mapping.
 * Tracks usage_count and last_used_at.
 * Updates local cache, localStorage, and synchronizes to Supabase when authenticated.
 */
export async function saveUserCustomAlias(
  rawInput: string,
  mapping: {
    canonicalName: string;
    categoryId: CategoryId;
    canonicalId?: string;
    userId?: string;
  }
): Promise<UserCustomAlias> {
  const norm = normalizeBaseText(rawInput);
  const now = new Date().toISOString();
  const map = getAliasMap();

  const existing = map.get(norm);
  const newUsageCount = (existing?.usageCount || 0) + 1;

  const aliasRecord: UserCustomAlias = {
    id: existing?.id || `alias_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId: mapping.userId || existing?.userId,
    rawAlias: rawInput.trim(),
    normalizedAlias: norm,
    canonicalId: mapping.canonicalId || existing?.canonicalId,
    canonicalName: mapping.canonicalName,
    categoryId: mapping.categoryId,
    confidence: 1.0,
    usageCount: newUsageCount,
    lastUsedAt: now,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  map.set(norm, aliasRecord);
  persistToStorage(map);

  // Sync with Supabase asynchronously if online
  const isOnline = typeof navigator !== 'undefined' && navigator.onLine;
  if (isOnline) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        aliasRecord.userId = user.id;
        await supabase.from('user_item_aliases').upsert({
          id: aliasRecord.id,
          user_id: user.id,
          raw_alias: aliasRecord.rawAlias,
          canonical_id: aliasRecord.canonicalId || null,
          canonical_name: aliasRecord.canonicalName,
          category_id: aliasRecord.categoryId,
          confidence: 1.0,
          usage_count: newUsageCount,
          last_used_at: now,
          updated_at: now,
        }, { onConflict: 'user_id,raw_alias' });
      }
    } catch (err) {
      // Non-blocking: local storage is already updated
      console.warn('[UserAliases] Background sync deferred:', err);
    }
  }

  return aliasRecord;
}

/**
 * Syncs user custom aliases from Supabase on login or reconnect.
 */
export async function syncUserCustomAliasesFromCloud(userId: string): Promise<void> {
  if (!navigator.onLine || !userId) return;

  try {
    const { data, error } = await supabase
      .from('user_item_aliases')
      .select('*')
      .eq('user_id', userId);

    if (error || !data) return;

    const map = getAliasMap();
    for (const row of data) {
      const norm = normalizeBaseText(row.raw_alias);
      if (norm) {
        map.set(norm, {
          id: row.id,
          userId: row.user_id,
          rawAlias: row.raw_alias,
          normalizedAlias: norm,
          canonicalId: row.canonical_id || undefined,
          canonicalName: row.canonical_name,
          categoryId: row.category_id as CategoryId,
          confidence: row.confidence ?? 1.0,
          usageCount: row.usage_count || 1,
          lastUsedAt: row.last_used_at || row.updated_at || row.created_at,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        });
      }
    }
    persistToStorage(map);
  } catch (err) {
    console.warn('[UserAliases] Cloud pull failed:', err);
  }
}

/**
 * Clears local user custom aliases cache and storage.
 * Useful for tests, sign-out, or user data reset.
 */
export function clearUserCustomAliases(): void {
  if (aliasCache) {
    aliasCache.clear();
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
}

