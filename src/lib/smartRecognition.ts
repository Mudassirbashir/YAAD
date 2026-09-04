import { CanonicalItem, CategoryId, SmartRecognitionResult } from '../types';
import {
  recognizeItem as engineRecognizeItem,
  recognizeItemWithAI as engineRecognizeItemWithAI,
  extractQuantityAndUnit as engineExtractQuantityAndUnit,
  UNIT_MAP as ENGINE_UNIT_MAP,
  WORD_NUMBER_MAP as ENGINE_WORD_NUMBER_MAP,
  saveUserItemOverride,
} from './recognition';

export const UNIT_MAP = ENGINE_UNIT_MAP;
export const WORD_NUMBER_MAP = ENGINE_WORD_NUMBER_MAP;

const USER_OVERRIDES_KEY = 'yaad_user_category_overrides';

export function getUserCategoryOverrides(): Record<string, CategoryId> {
  try {
    const raw = localStorage.getItem(USER_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveUserCategoryOverride(itemName: string, categoryId: CategoryId): void {
  saveUserItemOverride(itemName, categoryId);
  try {
    const overrides = getUserCategoryOverrides();
    overrides[itemName.trim().toLowerCase()] = categoryId;
    localStorage.setItem(USER_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {
    // Ignore quota errors
  }
}

export function extractQuantityAndUnit(input: string): { cleanName: string; quantity?: string; unit?: string } {
  const result = engineExtractQuantityAndUnit(input);
  return {
    cleanName: result.cleanName,
    quantity: result.quantity,
    unit: result.unit,
  };
}

/**
 * YAAD Smart Item Recognition - Synchronous local engine
 */
export function recognizeItemLocally(rawInput: string): SmartRecognitionResult {
  const result = engineRecognizeItem(rawInput);
  return {
    canonicalName: result.canonicalName,
    englishName: result.englishName,
    nameUrdu: result.nameUrdu,
    nameRomanUrdu: result.nameRomanUrdu,
    quantity: result.quantity,
    unit: result.unit,
    categoryId: result.categoryId,
    confidence: result.confidence,
    isRecognized: result.isRecognized,
    unresolved: result.unresolved,
    emoji: result.emoji,
    rawInput: result.rawInput,
    matchedVia: result.matchedVia,
  };
}

/**
 * YAAD Smart Item Recognition - Asynchronous with AI fallback
 */
export async function smartRecognizeWithAI(rawInput: string): Promise<SmartRecognitionResult> {
  const result = await engineRecognizeItemWithAI(rawInput);
  return {
    canonicalName: result.canonicalName,
    englishName: result.englishName,
    nameUrdu: result.nameUrdu,
    nameRomanUrdu: result.nameRomanUrdu,
    quantity: result.quantity,
    unit: result.unit,
    categoryId: result.categoryId,
    confidence: result.confidence,
    isRecognized: result.isRecognized,
    unresolved: result.unresolved,
    emoji: result.emoji,
    rawInput: result.rawInput,
    matchedVia: result.matchedVia,
  };
}
