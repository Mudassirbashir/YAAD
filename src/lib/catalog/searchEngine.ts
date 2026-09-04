import { CategoryId, MasterCatalogItem } from '../../types';
import { INITIAL_MASTER_CATALOG } from './items';
import { MASTER_CATEGORIES } from './categories';
import { normalizeBaseText, normalizePhonetic } from '../recognition/normalizer';
import { stringSimilarity, FUZZY_MIN_ACCEPTABLE_SCORE } from '../recognition/fuzzyMatcher';
import { extractQuantityAndUnit } from '../recognition/quantityExtractor';
import { getItemEmoji } from './iconMap';
import { getUserCustomAlias, getAllUserCustomAliases } from '../recognition/userAliases';
import type { UserItemBehaviorProfile } from '../recommendations/types';

export interface CatalogSearchResult {
  item: MasterCatalogItem;
  matchedName: string;
  displayName: string;
  secondaryName?: string;
  multilingualTitle: string; // e.g. "ہری مرچ / Hari Mirch / Green Chili"
  categoryId: CategoryId;
  categoryName: string;
  emoji: string;
  matchType: 'exact' | 'prefix' | 'alias' | 'phonetic' | 'fuzzy';
  confidence: number;
  parsedQuantity?: string;
  parsedUnit?: string;
  isUserLearned?: boolean;
}

export interface SearchOptions {
  userProfiles?: UserItemBehaviorProfile[];
  frequentlyBoughtNames?: Set<string>;
}

class CatalogSearchEngine {
  private items: MasterCatalogItem[] = [];
  private exactMap = new Map<string, MasterCatalogItem>();
  private aliasMap = new Map<string, MasterCatalogItem>();
  private phoneticMap = new Map<string, MasterCatalogItem>();
  private commonSpellingMap = new Map<string, MasterCatalogItem>();

  constructor(initialItems: MasterCatalogItem[]) {
    this.indexItems(initialItems);
  }

  public indexItems(items: MasterCatalogItem[]): void {
    this.items = [...items];
    this.exactMap.clear();
    this.aliasMap.clear();
    this.phoneticMap.clear();
    this.commonSpellingMap.clear();

    for (const item of this.items) {
      if (!item.active) continue;

      // 1. Index Canonical English Name
      const normCanonical = normalizeBaseText(item.canonical_name || item.english_name);
      if (normCanonical) {
        this.exactMap.set(normCanonical, item);
        this.phoneticMap.set(normalizePhonetic(normCanonical), item);
      }

      // 2. Index Urdu Name
      const normUrdu = normalizeBaseText(item.urdu_name);
      if (normUrdu) {
        this.exactMap.set(normUrdu, item);
        this.phoneticMap.set(normUrdu, item);
      }

      // 3. Index Roman Urdu Names
      for (const roman of item.roman_urdu_names || []) {
        const normRoman = normalizeBaseText(roman);
        if (normRoman) {
          this.exactMap.set(normRoman, item);
          this.phoneticMap.set(normalizePhonetic(normRoman), item);
        }
      }

      // 4. Index Aliases
      for (const alias of item.aliases || []) {
        const normAlias = normalizeBaseText(alias);
        if (normAlias) {
          this.aliasMap.set(normAlias, item);
          this.phoneticMap.set(normalizePhonetic(normAlias), item);
        }
      }

      // 5. Index Common Misspellings
      const misspellings = item.common_misspellings || [];
      for (const spelling of misspellings) {
        const normSpelling = normalizeBaseText(spelling);
        if (normSpelling) {
          this.commonSpellingMap.set(normSpelling, item);
          this.phoneticMap.set(normalizePhonetic(normSpelling), item);
        }
      }
    }
  }

  /**
   * Search local catalog with priority:
   * 1. User Learned Custom Aliases (Personalization)
   * 2. Exact match -> Alias match -> Misspellings -> Prefix -> Phonetic -> Fuzzy
   * 3. Purchase frequency ranking boost
   */
  public search(query: string, maxResults: number = 6, options?: SearchOptions): CatalogSearchResult[] {
    const rawTrimmed = query.trim();
    if (!rawTrimmed) return [];

    // Extract any embedded quantity (e.g. "2 kilo aloo" -> clean: "aloo", quantity: "2", unit: "kg")
    const extracted = extractQuantityAndUnit(rawTrimmed);
    const cleanSearchText = extracted.cleanName.trim();
    const norm = normalizeBaseText(cleanSearchText || rawTrimmed);
    if (!norm) return [];

    const phonetic = normalizePhonetic(norm);
    const results: CatalogSearchResult[] = [];
    const seenItemIds = new Set<string>();

    const getCategoryDisplayName = (catId: CategoryId): string => {
      const cat = MASTER_CATEGORIES.find((c) => c.id === catId);
      return cat ? cat.name_en : catId.charAt(0).toUpperCase() + catId.slice(1);
    };

    const buildMultilingualTitle = (item: MasterCatalogItem): string => {
      const parts: string[] = [];
      if (item.urdu_name) parts.push(item.urdu_name);
      if (item.roman_urdu_names && item.roman_urdu_names[0]) parts.push(item.roman_urdu_names[0]);
      const eng = item.english_name || item.canonical_name;
      if (eng && !parts.includes(eng)) parts.push(eng);
      return parts.join(' / ');
    };

    const addResult = (
      item: MasterCatalogItem,
      matchedName: string,
      matchType: 'exact' | 'prefix' | 'alias' | 'phonetic' | 'fuzzy',
      confidence: number,
      isUserLearned: boolean = false
    ) => {
      if (seenItemIds.has(item.id)) return;
      seenItemIds.add(item.id);

      // Apply frequency boost if user has previous purchase history
      let finalConfidence = confidence;
      if (options?.userProfiles) {
        const canonicalKey = normalizeBaseText(item.canonical_name);
        const profile = options.userProfiles.find(
          (p) => normalizeBaseText(p.canonicalName) === canonicalKey || p.itemId === item.id
        );
        if (profile && profile.purchaseCount > 0) {
          // Boost confidence proportionally to purchase count (up to +0.08)
          finalConfidence = Math.min(1.0, confidence + Math.min(0.08, profile.purchaseCount * 0.01));
        }
      } else if (options?.frequentlyBoughtNames) {
        const canonicalKey = normalizeBaseText(item.canonical_name);
        if (options.frequentlyBoughtNames.has(canonicalKey)) {
          finalConfidence = Math.min(1.0, confidence + 0.05);
        }
      }

      results.push({
        item,
        matchedName,
        displayName: item.canonical_name,
        secondaryName: item.urdu_name ? `${item.urdu_name} (${item.roman_urdu_names[0] || ''})` : undefined,
        multilingualTitle: buildMultilingualTitle(item),
        categoryId: item.category_id,
        categoryName: getCategoryDisplayName(item.category_id),
        emoji: getItemEmoji(item.canonical_name, item.category_id, item.emoji),
        matchType,
        confidence: finalConfidence,
        parsedQuantity: extracted.quantity,
        parsedUnit: extracted.unit,
        isUserLearned,
      });
    };

    // 0. User Learned Custom Aliases (Personalization / Step 7)
    // Checks if the user previously taught this alias or a prefix of it
    const nowIso = new Date().toISOString();
    const directUserAlias = getUserCustomAlias(cleanSearchText || rawTrimmed);
    if (directUserAlias) {
      const matchedCatalogItem = directUserAlias.canonicalId ? this.items.find((i) => i.id === directUserAlias.canonicalId) : undefined;
      const resolvedItem: MasterCatalogItem = matchedCatalogItem || {
        id: directUserAlias.id,
        canonical_name: directUserAlias.canonicalName,
        english_name: directUserAlias.canonicalName,
        urdu_name: '',
        roman_urdu_names: [directUserAlias.rawAlias],
        aliases: [directUserAlias.rawAlias],
        category_id: directUserAlias.categoryId,
        subcategory_id: '',
        common_misspellings: [],
        searchable_terms: [directUserAlias.rawAlias],
        default_unit: 'piece',
        active: true,
        created_at: nowIso,
        updated_at: nowIso,
      };
      addResult(resolvedItem, directUserAlias.rawAlias, 'alias', 1.0, true);
    }

    const allUserAliases = getAllUserCustomAliases();
    for (const uAlias of allUserAliases) {
      if (results.length >= maxResults) break;
      if (uAlias.normalizedAlias.startsWith(norm) && (!directUserAlias || uAlias.id !== directUserAlias.id)) {
        const matchedCatalogItem = uAlias.canonicalId ? this.items.find((i) => i.id === uAlias.canonicalId) : undefined;
        const resolvedItem: MasterCatalogItem = matchedCatalogItem || {
          id: uAlias.id,
          canonical_name: uAlias.canonicalName,
          english_name: uAlias.canonicalName,
          urdu_name: '',
          roman_urdu_names: [uAlias.rawAlias],
          aliases: [uAlias.rawAlias],
          category_id: uAlias.categoryId,
          subcategory_id: '',
          common_misspellings: [],
          searchable_terms: [uAlias.rawAlias],
          default_unit: 'piece',
          active: true,
          created_at: nowIso,
          updated_at: nowIso,
        };
        addResult(resolvedItem, uAlias.rawAlias, 'prefix', 0.96, true);
      }
    }

    // 1. Exact Match on Canonical Name or Urdu or Roman Urdu
    const exactMatch = this.exactMap.get(norm);
    if (exactMatch) {
      addResult(exactMatch, norm, 'exact', 1.0);
    }

    // 2. Alias Match
    const aliasMatch = this.aliasMap.get(norm);
    if (aliasMatch) {
      addResult(aliasMatch, norm, 'alias', 0.98);
    }

    // 3. Misspelling Match
    const misspellingMatch = this.commonSpellingMap.get(norm);
    if (misspellingMatch) {
      addResult(misspellingMatch, norm, 'alias', 0.95);
    }

    // 4. Prefix & Substring Match on Canonical, Urdu, Roman Urdu & Searchable Terms
    for (const item of this.items) {
      if (results.length >= maxResults) break;
      if (seenItemIds.has(item.id)) continue;

      const normCanonical = normalizeBaseText(item.canonical_name);
      const normEnglish = normalizeBaseText(item.english_name);
      const normUrdu = normalizeBaseText(item.urdu_name);

      // Check prefix
      if (normCanonical.startsWith(norm) || normEnglish.startsWith(norm) || normUrdu.startsWith(norm)) {
        addResult(item, item.canonical_name, 'prefix', 0.92);
        continue;
      }

      // Check Roman Urdu names prefix
      const romanMatch = (item.roman_urdu_names || []).find((r) =>
        normalizeBaseText(r).startsWith(norm)
      );
      if (romanMatch) {
        addResult(item, romanMatch, 'prefix', 0.90);
        continue;
      }

      // Check Aliases prefix or contains
      const aliasHit = (item.aliases || []).find((a) => {
        const na = normalizeBaseText(a);
        return na.startsWith(norm) || (norm.length >= 3 && na.includes(norm));
      });
      if (aliasHit) {
        addResult(item, aliasHit, 'alias', 0.88);
        continue;
      }

      // Check Searchable terms
      const termHit = (item.searchable_terms || []).find((t) => {
        const nt = normalizeBaseText(t);
        return nt.startsWith(norm) || (norm.length >= 3 && nt.includes(norm));
      });
      if (termHit) {
        addResult(item, termHit, 'alias', 0.85);
        continue;
      }
    }

    // 5. Phonetic Match
    if (results.length < maxResults) {
      const phoneticMatch = this.phoneticMap.get(phonetic);
      if (phoneticMatch && !seenItemIds.has(phoneticMatch.id)) {
        addResult(phoneticMatch, phoneticMatch.canonical_name, 'phonetic', 0.82);
      }
    }

    // 6. Fuzzy Match (Levenshtein / Dice similarity) for typos like "poteto"
    if (results.length < maxResults && norm.length >= 3) {
      for (const item of this.items) {
        if (results.length >= maxResults) break;
        if (seenItemIds.has(item.id)) continue;

        let bestScore = 0;
        const normCanonical = normalizeBaseText(item.canonical_name);

        if (Math.abs(normCanonical.length - norm.length) <= 3) {
          bestScore = Math.max(bestScore, stringSimilarity(norm, normCanonical));
        }

        for (const alias of item.aliases || []) {
          const na = normalizeBaseText(alias);
          if (Math.abs(na.length - norm.length) <= 3) {
            bestScore = Math.max(bestScore, stringSimilarity(norm, na));
          }
        }

        for (const misspelling of item.common_misspellings || []) {
          const nm = normalizeBaseText(misspelling);
          if (Math.abs(nm.length - norm.length) <= 3) {
            bestScore = Math.max(bestScore, stringSimilarity(norm, nm));
          }
        }

        if (bestScore >= FUZZY_MIN_ACCEPTABLE_SCORE) {
          addResult(item, item.canonical_name, 'fuzzy', bestScore * 0.9);
        }
      }
    }

    // Sort results by confidence descending
    results.sort((a, b) => b.confidence - a.confidence);

    return results.slice(0, maxResults);
  }

  public getAllItems(): MasterCatalogItem[] {
    return this.items;
  }
}

export const defaultCatalogSearchEngine = new CatalogSearchEngine(INITIAL_MASTER_CATALOG);
