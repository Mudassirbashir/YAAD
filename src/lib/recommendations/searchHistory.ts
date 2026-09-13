import { CategoryId } from '../../types';
import { normalizeBaseText } from '../recognition/normalizer';
import { defaultCatalogSearchEngine } from '../catalog';

export interface RecentSearchEntry {
  id: string;
  query: string;
  normalizedQuery: string;
  canonicalName?: string;
  displayName?: string;
  category?: CategoryId;
  timestamp: number;
}

const STORAGE_PREFIX = 'yaad_search_history_';
const MAX_SEARCHES = 40;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// In-memory cache for ultra-fast, zero-overhead access without reading localStorage on every render
const memoryCache = new Map<string, RecentSearchEntry[]>();

/**
 * Loads recent searches for a user from localStorage
 */
export function getRecentSearches(userId: string = 'guest', withinDays: number = 7): RecentSearchEntry[] {
  const cutoff = Date.now() - withinDays * 24 * 60 * 60 * 1000;
  
  if (memoryCache.has(userId)) {
    const cached = memoryCache.get(userId)!;
    return cached.filter((entry) => entry.timestamp >= cutoff);
  }

  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentSearchEntry[];
    const valid = Array.isArray(parsed) ? parsed.filter((e) => e && e.timestamp >= cutoff) : [];
    memoryCache.set(userId, valid);
    return valid;
  } catch (err) {
    console.warn('Failed to load recent searches from localStorage:', err);
    return [];
  }
}

/**
 * Records a search query into the user's recent search history.
 * Resolves canonical name and category via catalog if not provided.
 */
export function recordRecentSearch(
  userId: string = 'guest',
  rawQuery: string,
  meta?: { canonicalName?: string; displayName?: string; category?: CategoryId }
): void {
  const trimmed = rawQuery.trim();
  if (!trimmed || trimmed.length < 2) return;

  const normalized = normalizeBaseText(trimmed);
  let canonicalName = meta?.canonicalName;
  let displayName = meta?.displayName;
  let category = meta?.category;

  // If metadata wasn't passed directly, resolve quickly via catalog engine
  if (!canonicalName) {
    const matches = defaultCatalogSearchEngine.search(trimmed, 1);
    if (matches.length > 0 && matches[0].confidence >= 0.55) {
      canonicalName = matches[0].item.canonical_name;
      displayName = matches[0].displayName;
      category = matches[0].categoryId;
    }
  }

  const newEntry: RecentSearchEntry = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    query: trimmed,
    normalizedQuery: normalized,
    canonicalName,
    displayName,
    category,
    timestamp: Date.now(),
  };

  const existing = getRecentSearches(userId, 7);
  // Remove earlier identical search query or canonical to keep newest at top
  const filtered = existing.filter(
    (e) =>
      e.normalizedQuery !== normalized &&
      (!canonicalName || e.canonicalName !== canonicalName)
  );

  const updated = [newEntry, ...filtered].slice(0, MAX_SEARCHES);
  memoryCache.set(userId, updated);

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to persist recent searches:', err);
    }
  }
}

/**
 * Convenience helper to record search query with optional category
 */
export function recordSearchQuery(
  userId: string = 'guest',
  query: string,
  category?: CategoryId
): void {
  recordRecentSearch(userId, query, { category });
}

/**
 * Returns a map of recently searched canonical names with recency and search count
 */
export function getRecentlySearchedCanonicals(
  userId: string = 'guest',
  withinDays: number = 7
): Map<string, { count: number; lastSearchedAt: number; category?: CategoryId; displayName?: string }> {
  const searches = getRecentSearches(userId, withinDays);
  const map = new Map<string, { count: number; lastSearchedAt: number; category?: CategoryId; displayName?: string }>();

  for (const s of searches) {
    if (!s.canonicalName) continue;
    const key = s.canonicalName.toLowerCase();
    const prev = map.get(key);
    if (!prev) {
      map.set(key, {
        count: 1,
        lastSearchedAt: s.timestamp,
        category: s.category,
        displayName: s.displayName,
      });
    } else {
      map.set(key, {
        count: prev.count + 1,
        lastSearchedAt: Math.max(prev.lastSearchedAt, s.timestamp),
        category: prev.category || s.category,
        displayName: prev.displayName || s.displayName,
      });
    }
  }

  return map;
}

/**
 * Returns a map of recently searched categories with search count
 */
export function getRecentlySearchedCategories(
  userId: string = 'guest',
  withinDays: number = 7
): Map<CategoryId, { count: number; lastSearchedAt: number }> {
  const searches = getRecentSearches(userId, withinDays);
  const map = new Map<CategoryId, { count: number; lastSearchedAt: number }>();

  for (const s of searches) {
    if (!s.category) continue;
    const prev = map.get(s.category);
    if (!prev) {
      map.set(s.category, { count: 1, lastSearchedAt: s.timestamp });
    } else {
      map.set(s.category, {
        count: prev.count + 1,
        lastSearchedAt: Math.max(prev.lastSearchedAt, s.timestamp),
      });
    }
  }

  return map;
}

/**
 * Purges recent search history for a user (e.g. on logout)
 */
export function clearRecentSearches(userId: string = 'guest'): void {
  memoryCache.delete(userId);
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${userId}`);
    } catch {
      // Ignore
    }
  }
}
