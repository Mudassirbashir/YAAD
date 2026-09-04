import { ShoppingItem } from '../../types';
import { RecognitionResult } from './types';
import { normalizeBaseText } from './normalizer';

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  existingItem?: ShoppingItem;
  reason?: 'canonical_match' | 'exact_name' | 'urdu_name_match' | 'raw_input_match';
}

/**
 * Checks if a candidate item already exists in the user's active shopping list.
 * Works seamlessly across English, Urdu, and Roman Urdu.
 * (e.g. Adding "aloo" when "potato" is already in the list).
 */
export function detectDuplicateItem(
  existingItems: ShoppingItem[],
  candidate: RecognitionResult,
  excludeCompleted: boolean = true
): DuplicateDetectionResult {
  const normCandidateRaw = normalizeBaseText(candidate.rawInput);
  const normCandidateCanonical = normalizeBaseText(candidate.canonicalName);
  const normCandidateUrdu = candidate.nameUrdu ? normalizeBaseText(candidate.nameUrdu) : '';

  for (const item of existingItems) {
    if (excludeCompleted && item.completed) continue;

    // 1. Same Canonical Name (e.g. both resolved to "Potato")
    if (
      candidate.isRecognized &&
      item.canonicalName &&
      normalizeBaseText(item.canonicalName) === normCandidateCanonical
    ) {
      return { isDuplicate: true, existingItem: item, reason: 'canonical_match' };
    }

    // 2. Same Raw or Display Name
    const normItemName = normalizeBaseText(item.name);
    if (normItemName && (normItemName === normCandidateRaw || normItemName === normCandidateCanonical)) {
      return { isDuplicate: true, existingItem: item, reason: 'exact_name' };
    }

    // 3. Same Urdu Name
    if (normCandidateUrdu && item.nameUrdu && normalizeBaseText(item.nameUrdu) === normCandidateUrdu) {
      return { isDuplicate: true, existingItem: item, reason: 'urdu_name_match' };
    }

    // 4. Raw input match
    if (item.rawInput && normalizeBaseText(item.rawInput) === normCandidateRaw) {
      return { isDuplicate: true, existingItem: item, reason: 'raw_input_match' };
    }
  }

  return { isDuplicate: false };
}

/**
 * Combines quantities when merging two duplicate items (e.g. "1 kg" + "2 kg" -> "3 kg").
 */
export function mergeQuantities(
  existingQty?: string,
  existingUnit?: string,
  newQty?: string,
  newUnit?: string
): { quantity?: string; unit?: string } {
  // If units match and numbers are numeric, sum them
  if (existingQty && newQty) {
    const num1 = parseFloat(existingQty);
    const num2 = parseFloat(newQty);

    const unitsMatch =
      (!existingUnit && !newUnit) ||
      (existingUnit && newUnit && existingUnit.toLowerCase() === newUnit.toLowerCase());

    if (!isNaN(num1) && !isNaN(num2) && unitsMatch) {
      const sum = num1 + num2;
      // Round nicely if fractional
      const formattedSum = Number.isInteger(sum) ? sum.toString() : sum.toFixed(1).replace(/\.0$/, '');
      return {
        quantity: formattedSum,
        unit: existingUnit || newUnit,
      };
    }

    // If units differ or not purely numeric, combine as text
    return {
      quantity: `${existingQty}${existingUnit ? ' ' + existingUnit : ''} + ${newQty}${newUnit ? ' ' + newUnit : ''}`.trim(),
      unit: undefined,
    };
  }

  return {
    quantity: newQty || existingQty,
    unit: newUnit || existingUnit,
  };
}
