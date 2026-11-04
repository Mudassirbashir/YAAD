import {
  defaultCatalogSearchEngine,
  CatalogSearchResult,
  SearchOptions,
} from './searchEngine';

export type NeverBlankTier = 'direct' | 'relaxed' | 'popular';

export interface NeverBlankResult {
  results: CatalogSearchResult[];
  /** Which ladder tier answered: direct hits, token-relaxed hits, or popular fallback. */
  tier: NeverBlankTier;
}

/**
 * P3 — the never-blank search contract.
 *
 * The owner requirement: a search must NEVER render "no results for this product".
 * Ladder:
 *   L1 direct  — the full engine (exact → alias → prefix → phonetic → fuzzy → MiniSearch)
 *   L2 relaxed — each query token searched separately, unioned by item id
 *   L3 popular — popular items so the screen always has content
 * The caller ALWAYS keeps its free-text/custom-item path ("Add «query»") as the
 * final row — so even pure gibberish yields populars + one-tap custom add.
 */
export function searchNeverBlank(
  query: string,
  maxResults: number = 6,
  options?: SearchOptions
): NeverBlankResult {
  const trimmed = query.trim();
  if (!trimmed) return { results: [], tier: 'direct' };

  // L1 — direct
  const direct = defaultCatalogSearchEngine.search(trimmed, maxResults, options);
  if (direct.length > 0) return { results: direct, tier: 'direct' };

  // L2 — token-relaxed: union per-token hits (catches "lal mirch powder" style queries)
  const tokens = trimmed.split(/\s+/).filter((t) => t.length >= 2);
  if (tokens.length > 1) {
    const seen = new Set<string>();
    const relaxed: CatalogSearchResult[] = [];
    for (const token of tokens) {
      const hits = defaultCatalogSearchEngine.search(token, maxResults, options);
      for (const h of hits) {
        if (seen.has(h.item.id)) continue;
        seen.add(h.item.id);
        relaxed.push(h);
        if (relaxed.length >= maxResults) break;
      }
      if (relaxed.length >= maxResults) break;
    }
    if (relaxed.length > 0) {
      relaxed.sort((a, b) => b.confidence - a.confidence);
      return { results: relaxed.slice(0, maxResults), tier: 'relaxed' };
    }
  }

  // L3 — popular fallback: never blank.
  return {
    results: defaultCatalogSearchEngine.getPopularResults(maxResults),
    tier: 'popular',
  };
}
