import { CategoryId } from '../../types';
import { RecognitionResult, RecognitionSource, CanonicalItemRecord } from './types';
import { normalizeBaseText, normalizePhonetic, formatItemTitle } from './normalizer';
import { extractQuantityAndUnit } from './quantityExtractor';
import { defaultItemCatalog, ItemCatalog } from './catalog';
import { computeFuzzyConfidence, FUZZY_MIN_ACCEPTABLE_SCORE } from './fuzzyMatcher';
import { classifyUnknownItem } from './aiClassifier';
import { splitMultiItemInput, parseMultiItemInput } from './multiItemParser';
import { getUserCustomAlias } from './userAliases';

export { splitMultiItemInput, parseMultiItemInput };

/**
 * Common grocery items that are individually countable pieces
 * (e.g. "2 aloo" -> 2 piece, "6 eggs" -> 6 piece, "1 bread" -> 1 piece)
 */
export const COUNTABLE_ITEM_IDS = new Set([
  'potato',
  'egg',
  'onion',
  'tomato',
  'lemon',
  'apple',
  'banana',
  'cucumber',
  'bread',
  'biscuit',
  'biscuits',
  'garlic',
  'ginger',
  'capsicum',
  'soap',
  'mango',
  'orange',
]);

export function isCountableItem(
  item?: CanonicalItemRecord | { id?: string; canonical_name?: string; canonicalName?: string } | null
): boolean {
  if (!item) return false;
  const id = (item.id || ('canonical_name' in item ? item.canonical_name : '') || ('canonicalName' in item ? item.canonicalName : '') || '').toLowerCase();
  if (COUNTABLE_ITEM_IDS.has(id)) return true;
  if (['potato', 'egg', 'onion', 'tomato', 'lemon', 'apple', 'banana', 'cucumber', 'bread', 'biscuit'].some((k) => id.includes(k))) {
    return true;
  }
  return false;
}

/**
 * Resolves quantity and unit safely according to ambiguous input rules:
 * - If no quantity was entered: quantity = undefined, unit = undefined (never invent a quantity or default unit)
 * - If quantity was entered without unit:
 *     - If item is countable (e.g. potato, egg, bread): unit = 'piece'
 *     - If item is bulk/uncountable (e.g. sugar, rice, oil): unit = undefined
 * - If unit was explicitly provided: preserve unit
 */
export function resolveQuantityAndUnit(
  item?: CanonicalItemRecord | null,
  quantity?: string,
  unit?: string
): { quantity?: string; unit?: string } {
  if (!quantity) {
    return { quantity: undefined, unit: undefined };
  }
  if (unit) {
    return { quantity, unit };
  }
  if (item && isCountableItem(item)) {
    return { quantity, unit: 'piece' };
  }
  return { quantity, unit: undefined };
}

const USER_OVERRIDES_KEY = 'yaad_user_item_overrides';

function getUserOverrides(): Record<string, CategoryId> {
  try {
    const raw = localStorage.getItem(USER_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveUserItemOverride(itemName: string, categoryId: CategoryId): void {
  try {
    const norm = normalizeBaseText(itemName);
    if (!norm) return;
    const overrides = getUserOverrides();
    overrides[norm] = categoryId;
    localStorage.setItem(USER_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {
    // Ignore quota errors
  }
}

/**
 * Executes the synchronous Local Recognition Pipeline:
 * User Input -> Normalization -> Quantity Extraction -> Exact Item Match ->
 * Exact Alias Match -> Phonetic Match -> Common Spellings -> Fuzzy Match -> Unresolved Fallback.
 */
export function recognizeItem(
  rawInput: string,
  catalog: ItemCatalog = defaultItemCatalog
): RecognitionResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      canonicalName: '',
      englishName: '',
      categoryId: 'uncategorized',
      confidence: 0.0,
      isRecognized: false,
      unresolved: true,
      rawInput,
      matchedVia: 'fallback',
    };
  }

  // 1. Quantity & Unit Extraction
  const { cleanName, quantity, unit } = extractQuantityAndUnit(trimmed);
  const lookupTarget = cleanName || trimmed;

  // 2. Normalization
  const normBase = normalizeBaseText(lookupTarget);
  const normPhonetic = normalizePhonetic(lookupTarget);

  // 3. User Override & Custom Aliases Check (Prioritize User Intent)
  const userAlias = getUserCustomAlias(lookupTarget);
  if (userAlias) {
    const exactItem = userAlias.canonicalId
      ? catalog.findById(userAlias.canonicalId)
      : catalog.findExact(normalizeBaseText(userAlias.canonicalName));
    const resolved = resolveQuantityAndUnit(exactItem, quantity, unit);
    return {
      canonicalName: userAlias.canonicalName,
      englishName: exactItem?.english_name || userAlias.canonicalName,
      nameUrdu: exactItem?.urdu_name,
      nameRomanUrdu: exactItem?.roman_urdu_names?.[0],
      quantity: resolved.quantity,
      unit: resolved.unit,
      categoryId: userAlias.categoryId,
      confidence: 1.0,
      isRecognized: true,
      unresolved: false,
      emoji: exactItem?.emoji,
      rawInput: trimmed,
      matchedVia: 'user_override',
    };
  }

  const userOverrides = getUserOverrides();
  if (userOverrides[normBase]) {
    const overriddenCategory = userOverrides[normBase];
    const exactItem = catalog.findExact(normBase);
    const resolved = resolveQuantityAndUnit(exactItem, quantity, unit);
    return {
      canonicalName: exactItem?.canonical_name || formatItemTitle(lookupTarget),
      englishName: exactItem?.english_name || formatItemTitle(lookupTarget),
      nameUrdu: exactItem?.urdu_name,
      nameRomanUrdu: exactItem?.roman_urdu_names?.[0],
      quantity: resolved.quantity,
      unit: resolved.unit,
      categoryId: overriddenCategory,
      confidence: 0.99,
      isRecognized: true,
      unresolved: false,
      emoji: exactItem?.emoji,
      rawInput: trimmed,
      matchedVia: 'user_override',
    };
  }

  // 4. Exact Item or Alias Match (Confidence 0.98)
  const exactItem = catalog.findExact(normBase);
  if (exactItem) {
    return createResult(exactItem, lookupTarget, trimmed, quantity, unit, 0.98, 'exact_item');
  }

  // 5. Common Spelling Match (Confidence 0.91)
  const spellingItem = catalog.findCommonSpelling(normBase);
  if (spellingItem) {
    return createResult(spellingItem, lookupTarget, trimmed, quantity, unit, 0.91, 'common_spelling');
  }

  // 6. Phonetic Match (Confidence 0.92)
  // e.g. "aloo", "alu", "alo", "aalu", "allu" -> all normalize to phonetic "alu"
  const phoneticItem = catalog.findPhonetic(normPhonetic);
  if (phoneticItem) {
    return createResult(phoneticItem, lookupTarget, trimmed, quantity, unit, 0.92, 'phonetic_match');
  }

  // 6.5. Prefix Match (Confidence 0.90)
  // e.g. "hari mir" -> "hari mirch" -> Green Chilli
  if (catalog.findPrefix && normBase.length >= 3) {
    const prefixItem = catalog.findPrefix(normBase);
    if (prefixItem) {
      return createResult(prefixItem, lookupTarget, trimmed, quantity, unit, 0.90, 'prefix_match');
    }
  }

  // 7. Compound / Multi-word Substring Match
  // e.g. "fresh green chili" or "laal pyaz"
  const words = normBase.split(' ').filter((w) => w.length > 2);
  if (words.length > 1) {
    for (const w of words) {
      const matchWord = catalog.findExact(w) || catalog.findPhonetic(normalizePhonetic(w));
      if (matchWord) {
        return createResult(matchWord, lookupTarget, trimmed, quantity, unit, 0.85, 'token_match');
      }
    }
  }

  // 8. Fuzzy Match with calibrated Levenshtein distance (Confidence 0.72 - 0.89)
  const fuzzyMatch = catalog.findFuzzy(normBase, FUZZY_MIN_ACCEPTABLE_SCORE);
  if (fuzzyMatch) {
    const confidence = computeFuzzyConfidence(fuzzyMatch.score);
    return createResult(fuzzyMatch.item, lookupTarget, trimmed, quantity, unit, confidence, 'fuzzy_match');
  }

  // 9. Unrecognized / Unknown Item
  // DO NOT guess randomly. Mark category = uncategorized, confidence = 0.35, unresolved = true.
  return {
    canonicalName: formatItemTitle(lookupTarget),
    englishName: formatItemTitle(lookupTarget),
    categoryId: 'uncategorized',
    quantity,
    unit,
    confidence: 0.35,
    isRecognized: false,
    unresolved: true,
    rawInput: trimmed,
    matchedVia: 'fallback',
  };
}

/**
 * Asynchronous Recognition Pipeline with intelligent AI classification fallback
 * for unknown or low-confidence items.
 */
export async function recognizeItemWithAI(
  rawInput: string,
  catalog: ItemCatalog = defaultItemCatalog
): Promise<RecognitionResult> {
  const localResult = recognizeItem(rawInput, catalog);

  // If local pipeline confidently recognized the item, return immediately without calling AI
  if (localResult.isRecognized && localResult.confidence >= 0.8) {
    return localResult;
  }

  // Item is unknown or low-confidence: Call AI Fallback layer
  const { cleanName, quantity, unit } = extractQuantityAndUnit(rawInput);
  const termToClassify = cleanName || rawInput.trim();

  try {
    const aiResult = await classifyUnknownItem(termToClassify);

    if (aiResult && aiResult.categoryId && aiResult.categoryId !== 'other' && aiResult.confidence >= 0.7) {
      return {
        canonicalName: aiResult.canonicalName || formatItemTitle(termToClassify),
        englishName: aiResult.canonicalName || formatItemTitle(termToClassify),
        nameUrdu: aiResult.nameUrdu,
        quantity: quantity || localResult.quantity,
        unit: unit || localResult.unit,
        categoryId: aiResult.categoryId,
        confidence: aiResult.confidence,
        isRecognized: true,
        unresolved: false,
        rawInput: rawInput.trim(),
        matchedVia: 'ai',
      };
    }
  } catch {
    // Return original local result if AI fails
  }

  return localResult;
}

function createResult(
  item: CanonicalItemRecord,
  lookupTarget: string,
  rawInput: string,
  quantity?: string,
  unit?: string,
  confidence: number = 0.98,
  matchedVia: RecognitionSource = 'exact_item'
): RecognitionResult {
  const resolved = resolveQuantityAndUnit(item, quantity, unit);
  return {
    canonicalName: item.canonical_name || item.canonicalName,
    englishName: item.english_name || item.canonicalName,
    nameUrdu: item.urdu_name || item.nameUrdu,
    nameRomanUrdu: item.roman_urdu_names?.[0] || item.nameRomanUrdu,
    quantity: resolved.quantity,
    unit: resolved.unit,
    categoryId: item.category || item.categoryId,
    confidence,
    isRecognized: true,
    unresolved: false,
    emoji: item.emoji,
    rawInput,
    matchedVia,
  };
}

export interface ParsedItemResult extends RecognitionResult {
  name: string;
  suggestedCategoryId: CategoryId;
}

/**
 * Standard parser used by input fields and shopping list additions.
 */
export function parseShoppingItem(rawInput: string): ParsedItemResult {
  const recognized = recognizeItem(rawInput);
  const displayName = recognized.canonicalName || recognized.rawInput;
  return {
    ...recognized,
    name: displayName,
    suggestedCategoryId: recognized.categoryId,
  };
}

/**
 * Async parser used when background AI classification is requested.
 */
export async function parseShoppingItemWithAI(rawInput: string): Promise<ParsedItemResult> {
  const recognized = await recognizeItemWithAI(rawInput);
  const displayName = recognized.canonicalName || recognized.rawInput;
  return {
    ...recognized,
    name: displayName,
    suggestedCategoryId: recognized.categoryId,
  };
}
