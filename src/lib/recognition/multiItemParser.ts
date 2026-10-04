import { parseShoppingItem, ParsedItemResult } from './engine';

/**
 * Items that legitimately contain conjunctions like "and" or "aur" in their names
 * and must not be split into multiple items.
 */
const CONJUNCTION_COMPOUND_EXCEPTIONS = [
  'head and shoulders',
  'salt and pepper',
  'mac and cheese',
  'sweet and sour',
  'cookies and cream',
  'gin and tonic',
];

/**
 * Splits multi-item natural language input into individual item strings:
 * - Handles newlines (\n)
 * - Handles commas (English "," and Urdu/Arabic "،")
 * - Handles semicolons (";" and Urdu "؛")
 * - Handles numbered and bullet list markers ("1. ", "• ", "- ", etc.)
 * - Handles conjunctions (" and ", " aur ", " اور ", " & ", " + ")
 */
export function splitMultiItemInput(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const lower = trimmed.toLowerCase();
  for (const exception of CONJUNCTION_COMPOUND_EXCEPTIONS) {
    if (lower === exception || lower.includes(exception)) {
      return [cleanListMarker(trimmed)];
    }
  }

  // First split by line breaks, commas, semicolons
  const commaSeparated = trimmed.split(/[\n,،;؛]+/).map((s) => cleanListMarker(s)).filter(Boolean);

  const results: string[] = [];

  for (const chunk of commaSeparated) {
    // If chunk contains conjunctions like " and ", " aur ", " اور ", " & ", " + "
    const subChunks = chunk.split(/\s+(?:and|aur|اور|&|\+)\s+/i).map((s) => cleanListMarker(s)).filter(Boolean);
    if (subChunks.length > 0) {
      results.push(...subChunks);
    } else if (chunk) {
      results.push(chunk);
    }
  }

  return results.length > 0 ? results : [cleanListMarker(trimmed)];
}

/**
 * Strips leading list markers like "1. ", "1) ", "- ", "• ", "* ", "[ ] ", "[x] "
 */
function cleanListMarker(str: string): string {
  return str
    .replace(/^[\s•\-\*–—]+/, '')
    .replace(/^\d+[\.\)\-:\s]+\s*/, '')
    .replace(/^\[[ xX]?\]\s*/, '')
    .trim();
}

/**
 * Parses user input into an array of recognized items.
 * If input contains multiple items (e.g. "2 kg aloo, 1 kg piyaz" or "eggs, milk and bread"),
 * each item is parsed independently.
 */
export function parseMultiItemInput(rawInput: string): ParsedItemResult[] {
  const segments = splitMultiItemInput(rawInput);
  if (segments.length <= 1) {
    return [parseShoppingItem(rawInput)];
  }

  return segments.map((seg) => parseShoppingItem(seg));
}
