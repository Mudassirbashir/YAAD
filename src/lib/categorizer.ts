import { CategoryId, CategorizeResult, CATEGORIES_LIST } from '../types';
import {
  recognizeItemLocally,
  smartRecognizeWithAI,
  getUserCategoryOverrides as getOverrides,
  saveUserCategoryOverride as saveOverride,
} from './smartRecognition';
import { normalizeBaseText } from './normalizer';

export const getUserCategoryOverrides = getOverrides;
export const saveUserCategoryOverride = saveOverride;
export const normalizeItemText = normalizeBaseText;

/**
 * Synchronous local categorization with comprehensive dictionary, phonetic matching, and fuzzy distance.
 */
export function categorizeItemLocally(rawInput: string): CategorizeResult {
  const recognized = recognizeItemLocally(rawInput);
  return {
    categoryId: recognized.categoryId,
    confidence: recognized.confidence,
    matchedVia: recognized.matchedVia,
    normalizedItemName: recognized.canonicalName || normalizeBaseText(rawInput),
  };
}

/**
 * Hybrid Smart Categorization (with server-side AI fallback):
 * Instant response if matched locally with >= 0.85 confidence.
 * Calls `/api/categorize` asynchronously when confidence < 0.85 and returns refined category.
 */
export async function smartCategorizeItem(rawInput: string): Promise<CategorizeResult> {
  const recognized = await smartRecognizeWithAI(rawInput);
  return {
    categoryId: recognized.categoryId,
    confidence: recognized.confidence,
    matchedVia: recognized.matchedVia,
    normalizedItemName: recognized.canonicalName || normalizeBaseText(rawInput),
  };
}
