import { CategoryId, SmartRecognitionResult } from '../types';
import { recognizeItemLocally, smartRecognizeWithAI, UNIT_MAP, WORD_NUMBER_MAP } from './smartRecognition';

export { UNIT_MAP, WORD_NUMBER_MAP };

export interface ParsedItemResult {
  name: string;
  quantity?: string;
  unit?: string;
  rawInput: string;
  suggestedCategoryId: CategoryId;
  canonicalName?: string;
  nameUrdu?: string;
  nameRomanUrdu?: string;
  confidence?: number;
  isRecognized?: boolean;
}

/**
 * High-accuracy natural language parser for shopping items.
 * Understands:
 * - "2 kilo aluu" -> quantity: "2", unit: "kg", name: "Potato" (or "Aluu"), Category: Vegetables, Urdu: "آلو"
 * - "2 kg aloo" -> quantity: "2", unit: "kg", name: "Potato", Category: Vegetables
 * - "do kilo aloo" -> quantity: "2", unit: "kg", name: "Potato", Category: Vegetables
 * - "آلو 2 کلو" -> quantity: "2", unit: "kg", name: "Potato", Category: Vegetables, Urdu: "آلو"
 * - "1 dozen eggs" -> quantity: "1", unit: "dozen", name: "Eggs", Category: Eggs
 * - "6 eggs" -> quantity: "6", name: "Eggs", Category: Eggs
 * - "half kg pyaz" -> quantity: "1/2", unit: "kg", name: "Onion", Category: Vegetables
 * - "3x bread" -> quantity: "3", unit: "x", name: "Bread", Category: Bakery
 */
export function parseShoppingItem(rawInput: string): ParsedItemResult {
  const result: SmartRecognitionResult = recognizeItemLocally(rawInput);

  return {
    name: result.canonicalName || rawInput.trim(),
    quantity: result.quantity,
    unit: result.unit,
    rawInput: result.rawInput,
    suggestedCategoryId: result.categoryId,
    canonicalName: result.canonicalName,
    nameUrdu: result.nameUrdu,
    nameRomanUrdu: result.nameRomanUrdu,
    confidence: result.confidence,
    isRecognized: result.isRecognized,
  };
}

/**
 * Async parser supporting server-side AI for rare/novel items.
 */
export async function parseShoppingItemWithAI(rawInput: string): Promise<ParsedItemResult> {
  const result: SmartRecognitionResult = await smartRecognizeWithAI(rawInput);

  return {
    name: result.canonicalName || rawInput.trim(),
    quantity: result.quantity,
    unit: result.unit,
    rawInput: result.rawInput,
    suggestedCategoryId: result.categoryId,
    canonicalName: result.canonicalName,
    nameUrdu: result.nameUrdu,
    nameRomanUrdu: result.nameRomanUrdu,
    confidence: result.confidence,
    isRecognized: result.isRecognized,
  };
}
