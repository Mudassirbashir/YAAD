import MiniSearch from 'minisearch';
import type { MasterCatalogItem } from '../../types';

/**
 * P3 — MiniSearch backend for the catalog search engine.
 *
 * Why MiniSearch (research 2026-11-04): ~7 KB zero-dep, inverted index,
 * sub-ms warm queries at 100k docs, stable JSON serialization for prebuilt
 * indexes. Fuse.js was measured at 168-419 ms/query on 100k (linear Bitap scan)
 * and is disqualified for the scale target; lunr is unmaintained; Orama is too
 * memory-hungry for 2 GB phones.
 *
 * The existing CatalogSearchEngine tiers (exact/alias/prefix/phonetic/fuzzy)
 * stay as the precision path; MiniSearch is the recall tier that fills remaining
 * slots with typo-tolerant ranked hits and carries the 100k-item future.
 */

export interface MiniDoc {
  id: string;
  name: string;
  english: string;
  urdu: string;
  roman: string;
  aliases: string;
  misspellings: string;
  terms: string;
  category: string;
}

export function toMiniDoc(item: MasterCatalogItem): MiniDoc {
  return {
    id: item.id,
    name: item.canonical_name || '',
    english: item.english_name || '',
    urdu: item.urdu_name || '',
    roman: (item.roman_urdu_names || []).join(' '),
    aliases: (item.aliases || []).join(' '),
    misspellings: (item.common_misspellings || []).join(' '),
    terms: (item.searchable_terms || []).join(' '),
    category: item.category_id || '',
  };
}

export function buildMiniSearchIndex(items: MasterCatalogItem[]): MiniSearch<MiniDoc> {
  const mini = new MiniSearch<MiniDoc>({
    fields: ['name', 'english', 'urdu', 'roman', 'aliases', 'misspellings', 'terms', 'category'],
    storeFields: ['id'],
    searchOptions: {
      boost: { name: 3, english: 3, urdu: 2, roman: 2, aliases: 2, misspellings: 1.5, terms: 1, category: 0.5 },
      prefix: true,
      fuzzy: 0.2,
      combineWith: 'OR',
    },
  });
  mini.addAll(items.filter((i) => i.active).map(toMiniDoc));
  return mini;
}

export interface MiniHit {
  id: string;
  score: number;
}

/** Returns ranked item ids (best first). Never throws — returns [] on error. */
export function searchMiniIndex(
  mini: MiniSearch<MiniDoc> | null,
  query: string,
  maxResults: number
): MiniHit[] {
  if (!mini) return [];
  const q = query.trim();
  if (!q) return [];
  try {
    return mini.search(q, { combineWith: 'OR' }).slice(0, maxResults).map((r) => ({
      id: String(r.id),
      score: r.score,
    }));
  } catch {
    return [];
  }
}
