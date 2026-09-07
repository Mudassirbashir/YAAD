import { ShoppingList, CategoryId } from '../../types';

export interface EssentialDisplayItem {
  canonicalName: string;
  displayName: string;
  nameUrdu?: string;
  nameRomanUrdu?: string;
  category: CategoryId | string;
  quantity: string;
  unit: string;
  isPersonalized?: boolean;
  purchaseCount?: number;
  score?: number;
}

/**
 * Curated household essentials for new users or baseline staples.
 * Matches exact Pakistani household pantry standards:
 * Sugar (1 kg), Milk (1 litre), Eggs (1 dozen), Potatoes (1 kg),
 * Tomatoes (1 kg), Rice (5 kg), Onions (1 kg), Cooking Oil (1 litre).
 */
export const CURATED_HOUSEHOLD_ESSENTIALS: EssentialDisplayItem[] = [
  {
    canonicalName: 'sugar',
    displayName: 'Sugar',
    nameUrdu: 'چینی',
    nameRomanUrdu: 'Cheeni',
    category: 'cooking_essentials',
    quantity: '1',
    unit: 'kg',
    isPersonalized: false,
  },
  {
    canonicalName: 'milk',
    displayName: 'Milk',
    nameUrdu: 'دودھ',
    nameRomanUrdu: 'Doodh',
    category: 'dairy',
    quantity: '1',
    unit: 'litre',
    isPersonalized: false,
  },
  {
    canonicalName: 'eggs',
    displayName: 'Eggs',
    nameUrdu: 'انڈے',
    nameRomanUrdu: 'Anday',
    category: 'poultry',
    quantity: '1',
    unit: 'dozen',
    isPersonalized: false,
  },
  {
    canonicalName: 'potatoes',
    displayName: 'Potatoes',
    nameUrdu: 'آلو',
    nameRomanUrdu: 'Aloo',
    category: 'vegetables',
    quantity: '1',
    unit: 'kg',
    isPersonalized: false,
  },
  {
    canonicalName: 'tomatoes',
    displayName: 'Tomatoes',
    nameUrdu: 'ٹماٹر',
    nameRomanUrdu: 'Tamatar',
    category: 'vegetables',
    quantity: '1',
    unit: 'kg',
    isPersonalized: false,
  },
  {
    canonicalName: 'rice',
    displayName: 'Rice',
    nameUrdu: 'چاول',
    nameRomanUrdu: 'Chawal',
    category: 'rice',
    quantity: '5',
    unit: 'kg',
    isPersonalized: false,
  },
  {
    canonicalName: 'onions',
    displayName: 'Onions',
    nameUrdu: 'پیاز',
    nameRomanUrdu: 'Pyaz',
    category: 'vegetables',
    quantity: '1',
    unit: 'kg',
    isPersonalized: false,
  },
  {
    canonicalName: 'cooking_oil',
    displayName: 'Cooking Oil',
    nameUrdu: 'کوکنگ آئل',
    nameRomanUrdu: 'Cooking Oil',
    category: 'cooking_essentials',
    quantity: '1',
    unit: 'litre',
    isPersonalized: false,
  },
];

/**
 * Intelligent ranking algorithm for Popular Essentials:
 * - For a new user with no history: returns curated household essentials.
 * - For existing users: ranks by frequency, recency, completion rate, and preserves user's preferred unit/quantity.
 * - Fills any gaps up to maxItems with curated baseline essentials.
 */
export function getRankedPopularEssentials(
  lists: ShoppingList[],
  maxItems: number = 8
): { items: EssentialDisplayItem[]; hasPersonalized: boolean } {
  if (!lists || lists.length === 0) {
    return { items: CURATED_HOUSEHOLD_ESSENTIALS.slice(0, maxItems), hasPersonalized: false };
  }

  // Aggregate user shopping patterns across all lists
  interface ItemHistoryStats {
    canonicalName: string;
    displayName: string;
    nameUrdu?: string;
    nameRomanUrdu?: string;
    category: CategoryId | string;
    frequencies: { [qtyUnit: string]: number };
    totalOccurrences: number;
    completedOccurrences: number;
    lastSeenTimestamp: number;
  }

  const historyMap = new Map<string, ItemHistoryStats>();
  let totalItemsAnalyzed = 0;

  lists.forEach((list) => {
    const listTimestamp = list.completedAt
      ? new Date(list.completedAt).getTime()
      : list.createdTimestamp || Date.now();

    (list.items || []).forEach((item) => {
      const canonical = (item.canonicalName || item.canonical_name || item.name || '').toLowerCase().trim();
      if (!canonical || canonical.length < 2) return;

      totalItemsAnalyzed++;
      const existing = historyMap.get(canonical);

      const qty = item.planned_quantity || item.quantity || '1';
      const unit = item.planned_unit || item.unit || 'piece';
      const comboKey = `${qty}_${unit}`;

      if (!existing) {
        historyMap.set(canonical, {
          canonicalName: canonical,
          displayName: item.name || canonical,
          nameUrdu: item.nameUrdu,
          nameRomanUrdu: item.nameRomanUrdu,
          category: item.categoryId || item.category || 'cooking_essentials',
          frequencies: { [comboKey]: 1 },
          totalOccurrences: 1,
          completedOccurrences: item.completed ? 1 : 0,
          lastSeenTimestamp: listTimestamp,
        });
      } else {
        existing.totalOccurrences += 1;
        if (item.completed) {
          existing.completedOccurrences += 1;
        }
        existing.frequencies[comboKey] = (existing.frequencies[comboKey] || 0) + 1;
        if (listTimestamp > existing.lastSeenTimestamp) {
          existing.lastSeenTimestamp = listTimestamp;
        }
        if (!existing.nameUrdu && item.nameUrdu) existing.nameUrdu = item.nameUrdu;
        if (!existing.nameRomanUrdu && item.nameRomanUrdu) existing.nameRomanUrdu = item.nameRomanUrdu;
      }
    });
  });

  if (totalItemsAnalyzed === 0 || historyMap.size === 0) {
    return { items: CURATED_HOUSEHOLD_ESSENTIALS.slice(0, maxItems), hasPersonalized: false };
  }

  const now = Date.now();
  const scoredItems: EssentialDisplayItem[] = [];

  historyMap.forEach((stat) => {
    // Determine most common quantity and unit
    let topCombo = '';
    let maxFreq = 0;
    Object.entries(stat.frequencies).forEach(([combo, freq]) => {
      if (freq > maxFreq) {
        maxFreq = freq;
        topCombo = combo;
      }
    });

    const [qty, unit] = topCombo ? topCombo.split('_') : ['1', 'piece'];

    // Recency scoring
    const ageDays = Math.max(0, (now - stat.lastSeenTimestamp) / (1000 * 60 * 60 * 24));
    let recencyBonus = 0;
    if (ageDays <= 7) recencyBonus = 8;
    else if (ageDays <= 14) recencyBonus = 5;
    else if (ageDays <= 30) recencyBonus = 3;
    else if (ageDays <= 60) recencyBonus = 1;

    // Composite ranking formula: frequency + completed + recency
    const score = stat.totalOccurrences * 3 + stat.completedOccurrences * 2 + recencyBonus;

    scoredItems.push({
      canonicalName: stat.canonicalName,
      displayName: stat.displayName,
      nameUrdu: stat.nameUrdu,
      nameRomanUrdu: stat.nameRomanUrdu,
      category: stat.category,
      quantity: qty || '1',
      unit: unit || 'piece',
      isPersonalized: true,
      purchaseCount: stat.totalOccurrences,
      score,
    });
  });

  // Sort descending by score
  scoredItems.sort((a, b) => (b.score || 0) - (a.score || 0));

  const finalItems: EssentialDisplayItem[] = [];
  const addedKeys = new Set<string>();

  // Take top personalized items
  scoredItems.forEach((it) => {
    if (finalItems.length < maxItems && !addedKeys.has(it.canonicalName)) {
      finalItems.push(it);
      addedKeys.add(it.canonicalName);
    }
  });

  // Backfill with curated essentials if user has fewer than maxItems
  CURATED_HOUSEHOLD_ESSENTIALS.forEach((curated) => {
    if (finalItems.length < maxItems && !addedKeys.has(curated.canonicalName)) {
      finalItems.push(curated);
      addedKeys.add(curated.canonicalName);
    }
  });

  return {
    items: finalItems.slice(0, maxItems),
    hasPersonalized: scoredItems.length > 0,
  };
}

/**
 * Checks if an item is already present in an active shopping list
 */
export function getItemStatusInActiveList(
  canonicalName: string,
  activeList?: ShoppingList | null
): { inList: boolean; quantity?: string; unit?: string } {
  if (!activeList || !activeList.items || activeList.items.length === 0) {
    return { inList: false };
  }

  const normTarget = canonicalName.toLowerCase().trim();
  const match = activeList.items.find((it) => {
    const itemNorm = (it.canonicalName || it.canonical_name || it.name || '').toLowerCase().trim();
    return itemNorm === normTarget;
  });

  if (match) {
    return {
      inList: true,
      quantity: match.planned_quantity ? String(match.planned_quantity) : match.quantity ? String(match.quantity) : '1',
      unit: match.planned_unit || match.unit || 'piece',
    };
  }

  return { inList: false };
}
