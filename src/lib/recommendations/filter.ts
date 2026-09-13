import { ShoppingItem } from '../../types';
import { RecommendationCandidate } from './types';

/**
 * Checks if a candidate recommendation is already present in the user's shopping list.
 * Thoroughly handles:
 * - Canonical key matches (e.g. "milk" vs "Milk")
 * - English display names and plurals (e.g. "Apple" vs "apples", "Tomato" vs "tomatoes")
 * - Urdu script matches (e.g. "دودھ" vs "دودھ")
 * - Roman Urdu variants (e.g. "doodh" vs "doodh", "aloo" vs "Aloo")
 * - Raw inputs containing the canonical root (e.g. "2 kg aloo" vs candidate "potato" / "aloo")
 */
export function isCandidateInList(
  candidate: {
    canonicalName?: string;
    displayName?: string;
    nameUrdu?: string;
    nameRomanUrdu?: string;
  },
  currentItems: ShoppingItem[]
): boolean {
  if (!currentItems || currentItems.length === 0) return false;

  const normalize = (str?: string): string =>
    (str || '')
      .trim()
      .toLowerCase()
      .replace(/[\s\-_]+/g, ' ')
      .replace(/^(fresh|pure|organic|desi)\s+/i, '');

  const getStem = (str?: string): string => {
    const s = normalize(str);
    if (!s) return '';
    if (s.endsWith('ies') && s.length > 4) return s.slice(0, -3) + 'y';
    if (
      s.endsWith('es') &&
      (s.endsWith('ches') || s.endsWith('shes') || s.endsWith('xes') || s.endsWith('toes'))
    ) {
      return s.slice(0, -2);
    }
    if (s.endsWith('s') && !s.endsWith('ss') && s.length > 3) return s.slice(0, -1);
    return s;
  };

  const candCanonical = normalize(candidate.canonicalName);
  const candStem = getStem(candidate.canonicalName);
  const candDisplay = normalize(candidate.displayName);
  const candDisplayStem = getStem(candidate.displayName);
  const candUrdu = normalize(candidate.nameUrdu);
  const candRoman = normalize(candidate.nameRomanUrdu);

  for (const item of currentItems) {
    const itemCanonical = normalize(item.canonicalName || item.canonical_name);
    const itemCanonicalStem = getStem(item.canonicalName || item.canonical_name);
    const itemName = normalize(item.name);
    const itemNameStem = getStem(item.name);
    const itemOrig = normalize(item.original_name);
    const itemRaw = normalize(item.rawInput);
    const itemUrdu = normalize(item.nameUrdu);
    const itemRoman = normalize(item.nameRomanUrdu);

    // 1. Direct canonical match or singular stem match
    if (
      candCanonical &&
      (candCanonical === itemCanonical ||
        candCanonical === itemName ||
        candCanonical === itemOrig ||
        (candStem && itemCanonicalStem && candStem === itemCanonicalStem) ||
        (candStem && itemNameStem && candStem === itemNameStem))
    ) {
      return true;
    }

    // 2. Display name match
    if (
      candDisplay &&
      (candDisplay === itemName ||
        candDisplay === itemCanonical ||
        (candDisplayStem && itemNameStem && candDisplayStem === itemNameStem))
    ) {
      return true;
    }

    // 3. Urdu name match
    if (candUrdu && (candUrdu === itemUrdu || candUrdu === itemName)) {
      return true;
    }

    // 4. Roman Urdu match
    if (
      candRoman &&
      (candRoman === itemRoman || candRoman === itemName || candRoman === itemRaw)
    ) {
      return true;
    }

    // 5. Cross-field matching (e.g. candidate Roman Urdu "aloo" matches item name "Aloo")
    if (
      (candRoman && (candRoman === itemCanonical || candRoman === itemNameStem)) ||
      (candCanonical && (candCanonical === itemRoman || candCanonical === itemRaw))
    ) {
      return true;
    }

    // 6. Substring match for compound grocery names (e.g., candidate "milk" and item name "fresh milk" or "milk pack")
    if (candStem && candStem.length >= 4) {
      const itemTokens = `${itemName} ${itemCanonical} ${itemRaw}`.split(' ');
      if (itemTokens.includes(candStem) || itemTokens.includes(candCanonical)) {
        return true;
      }
    }
  }

  return false;
}
