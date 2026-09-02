import { CanonicalItem, CategoryId, SmartRecognitionResult } from '../types';
import { PAKISTANI_GROCERY_ITEMS } from '../data/pakistaniGroceryData';
import { normalizeBaseText, normalizePhonetic } from './normalizer';
import { levenshteinDistance, stringSimilarity } from './fuzzyMatcher';

const USER_OVERRIDES_KEY = 'yaad_user_category_overrides';

// Unit map supporting English, Roman Urdu, and Urdu Script
export const UNIT_MAP: Record<string, { standard: string; label: string; urduLabel: string }> = {
  // Weight - kg
  kg: { standard: 'kg', label: 'kg', urduLabel: 'کلو' },
  kgs: { standard: 'kg', label: 'kg', urduLabel: 'کلو' },
  kilo: { standard: 'kg', label: 'kg', urduLabel: 'کلو' },
  kilos: { standard: 'kg', label: 'kg', urduLabel: 'کلو' },
  kilogram: { standard: 'kg', label: 'kg', urduLabel: 'کلو' },
  kilograms: { standard: 'kg', label: 'kg', urduLabel: 'کلو' },
  'کلو': { standard: 'kg', label: 'kg', urduLabel: 'کلو' },
  'کل': { standard: 'kg', label: 'kg', urduLabel: 'کلو' },

  // Weight - grams
  g: { standard: 'g', label: 'g', urduLabel: 'گرام' },
  gm: { standard: 'g', label: 'g', urduLabel: 'گرام' },
  gms: { standard: 'g', label: 'g', urduLabel: 'گرام' },
  gram: { standard: 'g', label: 'g', urduLabel: 'گرام' },
  grams: { standard: 'g', label: 'g', urduLabel: 'گرام' },
  'گرام': { standard: 'g', label: 'g', urduLabel: 'گرام' },
  mg: { standard: 'mg', label: 'mg', urduLabel: 'ملی گرام' },

  // Volume - Liters
  l: { standard: 'l', label: 'L', urduLabel: 'لیٹر' },
  lt: { standard: 'l', label: 'L', urduLabel: 'لیٹر' },
  ltr: { standard: 'l', label: 'L', urduLabel: 'لیٹر' },
  ltrs: { standard: 'l', label: 'L', urduLabel: 'لیٹر' },
  liter: { standard: 'l', label: 'L', urduLabel: 'لیٹر' },
  liters: { standard: 'l', label: 'L', urduLabel: 'لیٹر' },
  litre: { standard: 'l', label: 'L', urduLabel: 'لیٹر' },
  litres: { standard: 'l', label: 'L', urduLabel: 'لیٹر' },
  'لیٹر': { standard: 'l', label: 'L', urduLabel: 'لیٹر' },

  // Volume - ml
  ml: { standard: 'ml', label: 'ml', urduLabel: 'ملی لیٹر' },
  mls: { standard: 'ml', label: 'ml', urduLabel: 'ml' },
  milli: { standard: 'ml', label: 'ml', urduLabel: 'ml' },
  'ملی': { standard: 'ml', label: 'ml', urduLabel: 'ml' },

  // Count - Dozen
  dozen: { standard: 'dozen', label: 'dozen', urduLabel: 'درجن' },
  doz: { standard: 'dozen', label: 'dozen', urduLabel: 'درجن' },
  darjan: { standard: 'dozen', label: 'darjan', urduLabel: 'درجن' },
  darzn: { standard: 'dozen', label: 'darjan', urduLabel: 'درجن' },
  'درجن': { standard: 'dozen', label: 'dozen', urduLabel: 'درجن' },

  // Packaging & Formats
  packet: { standard: 'packet', label: 'pkt', urduLabel: 'پیکٹ' },
  packets: { standard: 'packet', label: 'pkts', urduLabel: 'پیکٹ' },
  pkt: { standard: 'packet', label: 'pkt', urduLabel: 'پیکٹ' },
  pkts: { standard: 'packet', label: 'pkts', urduLabel: 'پیکٹ' },
  pack: { standard: 'packet', label: 'pack', urduLabel: 'پیکٹ' },
  packs: { standard: 'packet', label: 'packs', urduLabel: 'پیکٹ' },
  'پیکٹ': { standard: 'packet', label: 'pkt', urduLabel: 'پیکٹ' },

  bottle: { standard: 'bottle', label: 'bottle', urduLabel: 'بوتل' },
  bottles: { standard: 'bottle', label: 'bottles', urduLabel: 'بوتل' },
  'بوتل': { standard: 'bottle', label: 'bottle', urduLabel: 'بوتل' },

  box: { standard: 'box', label: 'box', urduLabel: 'ڈبہ' },
  boxes: { standard: 'box', label: 'boxes', urduLabel: 'ڈبے' },
  'ڈبہ': { standard: 'box', label: 'box', urduLabel: 'ڈبہ' },
  'ڈبے': { standard: 'box', label: 'box', urduLabel: 'ڈبے' },

  can: { standard: 'can', label: 'can', urduLabel: 'کین' },
  cans: { standard: 'can', label: 'cans', urduLabel: 'کین' },
  'کین': { standard: 'can', label: 'can', urduLabel: 'کین' },

  bunch: { standard: 'bunch', label: 'bunch', urduLabel: 'گڈی' },
  bunches: { standard: 'bunch', label: 'bunches', urduLabel: 'گڈیاں' },
  gaddi: { standard: 'bunch', label: 'gaddi', urduLabel: 'گڈی' },
  gatti: { standard: 'bunch', label: 'gaddi', urduLabel: 'گڈی' },
  'گڈی': { standard: 'bunch', label: 'gaddi', urduLabel: 'گڈی' },

  roll: { standard: 'roll', label: 'roll', urduLabel: 'رول' },
  rolls: { standard: 'roll', label: 'rolls', urduLabel: 'رول' },
  'رول': { standard: 'roll', label: 'roll', urduLabel: 'رول' },

  piece: { standard: 'pcs', label: 'pcs', urduLabel: 'عدد' },
  pieces: { standard: 'pcs', label: 'pcs', urduLabel: 'عدد' },
  pcs: { standard: 'pcs', label: 'pcs', urduLabel: 'عدد' },
  pc: { standard: 'pcs', label: 'pc', urduLabel: 'عدد' },
  'دانہ': { standard: 'pcs', label: 'pcs', urduLabel: 'دانہ' },
  'عدد': { standard: 'pcs', label: 'pcs', urduLabel: 'عدد' },
  adad: { standard: 'pcs', label: 'adad', urduLabel: 'عدد' },

  // South Asian specific weights
  pao: { standard: 'pao', label: 'pao', urduLabel: 'پاؤ' },
  paao: { standard: 'pao', label: 'pao', urduLabel: 'پاؤ' },
  pow: { standard: 'pao', label: 'pao', urduLabel: 'پاؤ' },
  'پاؤ': { standard: 'pao', label: 'pao', urduLabel: 'پاؤ' },
  'پاو': { standard: 'pao', label: 'pao', urduLabel: 'پاؤ' },
  seer: { standard: 'seer', label: 'ser', urduLabel: 'سیر' },
  ser: { standard: 'seer', label: 'ser', urduLabel: 'سیر' },
  'سیر': { standard: 'seer', label: 'ser', urduLabel: 'سیر' },
};

// Word number to digit mapping (English, Roman Urdu, Urdu Script)
export const WORD_NUMBER_MAP: Record<string, string> = {
  half: '1/2',
  adha: '1/2',
  aadha: '1/2',
  adhey: '1/2',
  'آدھا': '1/2',
  'ادھا': '1/2',
  quarter: '1/4',
  paon: '3/4',
  paona: '3/4',
  powna: '3/4',
  'پونا': '3/4',

  one: '1',
  ek: '1',
  aik: '1',
  aek: '1',
  'ایک': '1',

  two: '2',
  do: '2',
  doh: '2',
  'دو': '2',

  three: '3',
  teen: '3',
  tin: '3',
  'تین': '3',

  four: '4',
  char: '4',
  chaar: '4',
  'چار': '4',

  five: '5',
  paanch: '5',
  panch: '5',
  'پانچ': '5',

  six: '6',
  chhe: '6',
  che: '6',
  chay: '6',
  'چھ': '6',

  seven: '7',
  saath: '7',
  sat: '7',
  saat: '7',
  'سات': '7',

  eight: '8',
  aath: '8',
  ath: '8',
  aat: '8',
  'آٹھ': '8',
  'اٹھ': '8',

  nine: '9',
  nau: '9',
  no: '9',
  nao: '9',
  'نو': '9',

  ten: '10',
  das: '10',
  dass: '10',
  'دس': '10',

  twelve: '12',
  barah: '12',
  bara: '12',
  'بارہ': '12',
};

// Internal pre-computed index for instant O(1) matching
interface IndexedDictionary {
  exactMap: Map<string, CanonicalItem>;
  phoneticMap: Map<string, CanonicalItem>;
  canonicalList: CanonicalItem[];
}

let DICTIONARY_INDEX: IndexedDictionary | null = null;

function getDictionaryIndex(): IndexedDictionary {
  if (DICTIONARY_INDEX) return DICTIONARY_INDEX;

  const exactMap = new Map<string, CanonicalItem>();
  const phoneticMap = new Map<string, CanonicalItem>();

  for (const item of PAKISTANI_GROCERY_ITEMS) {
    // Index canonical name and urdu name
    const exactCanonical = normalizeBaseText(item.canonicalName);
    exactMap.set(exactCanonical, item);

    const phoneticCanonical = normalizePhonetic(item.canonicalName);
    phoneticMap.set(phoneticCanonical, item);

    const exactUrdu = normalizeBaseText(item.nameUrdu);
    exactMap.set(exactUrdu, item);

    const exactRoman = normalizeBaseText(item.nameRomanUrdu);
    exactMap.set(exactRoman, item);
    phoneticMap.set(normalizePhonetic(item.nameRomanUrdu), item);

    // Index all aliases
    for (const alias of item.aliases) {
      const normExact = normalizeBaseText(alias);
      if (normExact) {
        exactMap.set(normExact, item);
      }

      const normPhonetic = normalizePhonetic(alias);
      if (normPhonetic) {
        phoneticMap.set(normPhonetic, item);
      }
    }
  }

  DICTIONARY_INDEX = {
    exactMap,
    phoneticMap,
    canonicalList: PAKISTANI_GROCERY_ITEMS,
  };

  return DICTIONARY_INDEX;
}

/**
 * Capitalizes first letter of Latin words while preserving Urdu characters.
 */
export function formatItemTitle(str: string): string {
  if (!str) return '';
  return str
    .split(' ')
    .filter(Boolean)
    .map((w) => {
      if (/[\u0600-\u06FF]/.test(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Gets user category overrides from localStorage.
 */
export function getUserCategoryOverrides(): Record<string, CategoryId> {
  try {
    const raw = localStorage.getItem(USER_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Saves a manual user category correction so future items with this name use the user's preferred category.
 */
export function saveUserCategoryOverride(itemName: string, categoryId: CategoryId): void {
  try {
    const norm = normalizeBaseText(itemName);
    if (!norm) return;
    const current = getUserCategoryOverrides();
    current[norm] = categoryId;
    localStorage.setItem(USER_OVERRIDES_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
}

/**
 * Extracts quantity and unit from input string.
 * Supports patterns:
 * - "2 kilo aloo", "2 kg aloo", "2kg aloo"
 * - "do kilo aloo", "ek darjan anday", "half kg pyaz"
 * - "آلو 2 کلو", "2 کلو آلو", "انڈے ایک درجن"
 * - "6 eggs", "1 dozen eggs"
 * - "3x bread"
 */
export function extractQuantityAndUnit(input: string): {
  cleanName: string;
  quantity?: string;
  unit?: string;
} {
  const trimmed = input.trim();
  if (!trimmed) {
    return { cleanName: '' };
  }

  let extractedQuantity: string | undefined;
  let extractedUnit: string | undefined;
  let extractedName = trimmed;

  // 1. Multiplier pattern: "2x bread" or "3 x apples"
  const leadingMultiplierMatch = extractedName.match(/^(\d+)\s*x\s+(.+)$/i);
  if (leadingMultiplierMatch) {
    extractedQuantity = leadingMultiplierMatch[1];
    extractedUnit = 'x';
    extractedName = leadingMultiplierMatch[2].trim();
    return { cleanName: extractedName, quantity: extractedQuantity, unit: extractedUnit };
  }

  // 2. Urdu Pattern: Leading quantity & unit like "2 کلو آلو" or "ایک درجن انڈے"
  const urduLeadingMatch = extractedName.match(/^(\d+(?:\.\d+)?|\d+\/\d+|ایک|دو|تین|چار|پانچ|چھ|سات|آٹھ|نو|دس|آدھا|پاؤ)\s*(کلو|گرام|لیٹر|درجن|پیکٹ|ڈبہ|بوتل|عدد|گڈی|پاؤ|سیر)?\s+(.+)$/);
  if (urduLeadingMatch) {
    const rawQty = urduLeadingMatch[1];
    const rawUnit = urduLeadingMatch[2];
    const remName = urduLeadingMatch[3].trim();

    extractedQuantity = WORD_NUMBER_MAP[rawQty] || rawQty;
    if (rawUnit && UNIT_MAP[rawUnit]) {
      extractedUnit = UNIT_MAP[rawUnit].label;
    }
    extractedName = remName;
    return { cleanName: extractedName, quantity: extractedQuantity, unit: extractedUnit };
  }

  // 3. Urdu Pattern: Trailing quantity like "آلو 2 کلو" or "انڈے ایک درجن" or "دودھ 1 لیٹر"
  const urduTrailingMatch = extractedName.match(/^(.+?)\s+(\d+(?:\.\d+)?|\d+\/\d+|ایک|دو|تین|چار|پانچ|چھ|سات|آٹھ|نو|دس|آدھا|پاؤ)\s*(کلو|گرام|لیٹر|درجن|پیکٹ|ڈبہ|بوتل|عدد|گڈی|پاؤ|سیر)?$/);
  if (urduTrailingMatch) {
    const remName = urduTrailingMatch[1].trim();
    const rawQty = urduTrailingMatch[2];
    const rawUnit = urduTrailingMatch[3];

    extractedQuantity = WORD_NUMBER_MAP[rawQty] || rawQty;
    if (rawUnit && UNIT_MAP[rawUnit]) {
      extractedUnit = UNIT_MAP[rawUnit].label;
    }
    extractedName = remName;
    return { cleanName: extractedName, quantity: extractedQuantity, unit: extractedUnit };
  }

  // 4. Standard Leading Quantity: "2 kilo aloo", "500g chicken", "half kg onion", "1.5 ltr milk", "1 dozen eggs", "6 eggs"
  const leadingQtyRegex =
    /^(\d+(?:\.\d+)?|\d+\/\d+|half|adha|aadha|quarter|one|ek|aik|two|do|three|teen|four|char|chaar|five|paanch|panch|six|chhe|che|seven|saath|sat|eight|aath|ath|nine|nau|ten|das|twelve|barah|bara)\s*([a-zA-Z\u0600-\u06FF]+)?\s+(.+)$/i;

  const match = extractedName.match(leadingQtyRegex);
  if (match) {
    const rawQtyToken = match[1].toLowerCase();
    const rawUnitToken = (match[2] || '').toLowerCase();
    const remainingName = match[3].trim();

    const normQty = WORD_NUMBER_MAP[rawQtyToken] || rawQtyToken;

    if (rawUnitToken && UNIT_MAP[rawUnitToken]) {
      extractedQuantity = normQty;
      extractedUnit = UNIT_MAP[rawUnitToken].label;
      extractedName = remainingName;
    } else if (!rawUnitToken && remainingName) {
      extractedQuantity = normQty;
      extractedName = remainingName;
    } else if (rawUnitToken && !UNIT_MAP[rawUnitToken]) {
      // e.g. "1 red apple"
      extractedQuantity = normQty;
      extractedName = `${match[2]} ${remainingName}`.trim();
    }

    return { cleanName: extractedName, quantity: extractedQuantity, unit: extractedUnit };
  }

  // 5. Standard Trailing Quantity: "aloo 2 kg", "milk 1.5 ltr", "eggs 2 dozen", "chicken 1 kg"
  const trailingQtyRegex =
    /^(.+?)\s+(\d+(?:\.\d+)?|\d+\/\d+|half|adha|one|ek|two|do|three|teen)\s*([a-zA-Z\u0600-\u06FF]+)?$/i;

  const tMatch = extractedName.match(trailingQtyRegex);
  if (tMatch) {
    const namePart = tMatch[1].trim();
    const rawQtyToken = tMatch[2].toLowerCase();
    const rawUnitToken = (tMatch[3] || '').toLowerCase();

    if (rawUnitToken && UNIT_MAP[rawUnitToken]) {
      extractedQuantity = WORD_NUMBER_MAP[rawQtyToken] || rawQtyToken;
      extractedUnit = UNIT_MAP[rawUnitToken].label;
      extractedName = namePart;
    } else if (rawQtyToken && !rawUnitToken) {
      extractedQuantity = WORD_NUMBER_MAP[rawQtyToken] || rawQtyToken;
      extractedName = namePart;
    }

    return { cleanName: extractedName, quantity: extractedQuantity, unit: extractedUnit };
  }

  // 6. Standalone leading unit like "darjan anday" -> 1 dozen anday
  const singleUnitLead = extractedName.match(/^(darjan|dozen|درجن|gaddi|گڈی)\s+(.+)$/i);
  if (singleUnitLead) {
    const uToken = singleUnitLead[1].toLowerCase();
    extractedQuantity = '1';
    extractedUnit = UNIT_MAP[uToken]?.label || uToken;
    extractedName = singleUnitLead[2].trim();
    return { cleanName: extractedName, quantity: extractedQuantity, unit: extractedUnit };
  }

  return { cleanName: extractedName, quantity: extractedQuantity, unit: extractedUnit };
}

/**
 * Synchronous Smart Recognition & Categorization Engine:
 * 1. Checks user manual overrides (instant 100% confidence).
 * 2. Checks exact alias match in indexed dictionary.
 * 3. Checks phonetic normalized match (reduces Roman Urdu spelling variations/vowels/accents).
 * 4. Checks token containment and multi-word phrases.
 * 5. Runs fast Levenshtein fuzzy distance matching across aliases to handle typos.
 * 6. Defaults safely to 'other' without dropping or blocking the item.
 */
export function recognizeItemLocally(rawInput: string): SmartRecognitionResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      canonicalName: '',
      categoryId: 'other',
      confidence: 0.1,
      isRecognized: false,
      rawInput: '',
      matchedVia: 'fallback',
    };
  }

  // 1. Extract quantity, unit, and item name
  const { cleanName, quantity, unit } = extractQuantityAndUnit(trimmed);
  const baseNormalized = normalizeBaseText(cleanName || trimmed);
  const phoneticNormalized = normalizePhonetic(cleanName || trimmed);

  const index = getDictionaryIndex();

  // 2. Check User Manual Category Overrides
  const userOverrides = getUserCategoryOverrides();
  if (userOverrides[baseNormalized]) {
    const overrideCat = userOverrides[baseNormalized];
    return {
      canonicalName: formatItemTitle(cleanName || trimmed),
      quantity,
      unit,
      categoryId: overrideCat,
      confidence: 1.0,
      isRecognized: true,
      rawInput: trimmed,
      matchedVia: 'user_override',
    };
  }

  // 3. Exact Dictionary Match
  if (index.exactMap.has(baseNormalized)) {
    const matched = index.exactMap.get(baseNormalized)!;
    return {
      canonicalName: matched.canonicalName,
      nameUrdu: matched.nameUrdu,
      nameRomanUrdu: matched.nameRomanUrdu,
      quantity,
      unit: unit || matched.defaultUnit,
      categoryId: matched.categoryId,
      confidence: 0.98,
      isRecognized: true,
      rawInput: trimmed,
      matchedVia: 'exact_alias',
    };
  }

  // 4. Phonetic Normalized Match (handles aluu, aloo, alu, anday, ande, tamatar, tmatar, etc.)
  if (index.phoneticMap.has(phoneticNormalized)) {
    const matched = index.phoneticMap.get(phoneticNormalized)!;
    return {
      canonicalName: matched.canonicalName,
      nameUrdu: matched.nameUrdu,
      nameRomanUrdu: matched.nameRomanUrdu,
      quantity,
      unit: unit || matched.defaultUnit,
      categoryId: matched.categoryId,
      confidence: 0.95,
      isRecognized: true,
      rawInput: trimmed,
      matchedVia: 'phonetic_match',
    };
  }

  // 5. Token & Sub-Phrase Search
  const words = baseNormalized.split(' ');
  for (const word of words) {
    if (word.length >= 3 && index.exactMap.has(word)) {
      const matched = index.exactMap.get(word)!;
      return {
        canonicalName: matched.canonicalName,
        nameUrdu: matched.nameUrdu,
        nameRomanUrdu: matched.nameRomanUrdu,
        quantity,
        unit: unit || matched.defaultUnit,
        categoryId: matched.categoryId,
        confidence: 0.9,
        isRecognized: true,
        rawInput: trimmed,
        matchedVia: 'exact_alias',
      };
    }

    const phoneticWord = normalizePhonetic(word);
    if (phoneticWord.length >= 3 && index.phoneticMap.has(phoneticWord)) {
      const matched = index.phoneticMap.get(phoneticWord)!;
      return {
        canonicalName: matched.canonicalName,
        nameUrdu: matched.nameUrdu,
        nameRomanUrdu: matched.nameRomanUrdu,
        quantity,
        unit: unit || matched.defaultUnit,
        categoryId: matched.categoryId,
        confidence: 0.88,
        isRecognized: true,
        rawInput: trimmed,
        matchedVia: 'phonetic_match',
      };
    }
  }

  // 6. Fast Fuzzy Matching (Levenshtein Distance for Typos)
  let bestMatch: CanonicalItem | null = null;
  let bestScore = 0;

  // Search across all items and their aliases
  for (const item of index.canonicalList) {
    for (const alias of item.aliases) {
      const normAlias = normalizeBaseText(alias);
      if (!normAlias) continue;

      // Length difference filter for speed
      if (Math.abs(normAlias.length - baseNormalized.length) > 3) continue;

      const score = stringSimilarity(baseNormalized, normAlias);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    }
  }

  // If similarity >= 0.75 (approx 1-2 typo characters)
  if (bestMatch && bestScore >= 0.75) {
    return {
      canonicalName: bestMatch.canonicalName,
      nameUrdu: bestMatch.nameUrdu,
      nameRomanUrdu: bestMatch.nameRomanUrdu,
      quantity,
      unit: unit || bestMatch.defaultUnit,
      categoryId: bestMatch.categoryId,
      confidence: Math.min(0.92, bestScore),
      isRecognized: true,
      rawInput: trimmed,
      matchedVia: 'fuzzy_match',
    };
  }

  // 7. Fallback for genuinely unknown items:
  // PRESERVE user input completely, do NOT drop, do NOT block!
  return {
    canonicalName: formatItemTitle(cleanName || trimmed),
    quantity,
    unit,
    categoryId: 'other',
    confidence: 0.3,
    isRecognized: false,
    rawInput: trimmed,
    matchedVia: 'fallback',
  };
}

/**
 * Asynchronous AI-powered Smart Recognition Fallback.
 * Instant local result returned if confidence >= 0.85.
 * Calls server `/api/categorize` only for genuinely unknown items.
 */
export async function smartRecognizeWithAI(rawInput: string): Promise<SmartRecognitionResult> {
  const localResult = recognizeItemLocally(rawInput);

  // If local confidence is already high, return immediately without network overhead
  if (localResult.confidence >= 0.85) {
    return localResult;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch('/api/categorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: rawInput }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.categoryId) {
        // Cache in user overrides for future fast instant lookup
        saveUserCategoryOverride(rawInput, data.categoryId as CategoryId);

        return {
          ...localResult,
          categoryId: data.categoryId as CategoryId,
          canonicalName: data.canonicalName || localResult.canonicalName,
          nameUrdu: data.nameUrdu || localResult.nameUrdu,
          confidence: data.confidence || 0.9,
          isRecognized: true,
          matchedVia: 'ai',
        };
      }
    }
  } catch {
    // Network or timeout - smooth graceful fallback to local result
  }

  return localResult;
}
