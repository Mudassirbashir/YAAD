import { parseShoppingItem, ParsedItemResult, recognizeItem } from './engine';

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
 * Intelligently splits space-separated items if a single line contains multiple recognizable grocery items
 * (e.g. "doodh makhan bread anday cheeni patti dahi" or "2 kg aloo 1 kg pyaz doodh")
 */
function splitSpaceSeparatedItems(text: string): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return [text];

  const items: string[] = [];
  let currentTokens: string[] = [];

  for (let i = 0; i < words.length; i++) {
    currentTokens.push(words[i]);
    const currentCandidate = currentTokens.join(' ');

    const parsedCurrent = recognizeItem(currentCandidate);

    // If current tokens form a solid recognized item
    if (parsedCurrent.isRecognized && parsedCurrent.confidence >= 0.85) {
      // Lookahead: does the next word make it a compound item (e.g. 'chai' + 'patti', 'cooking' + 'oil')?
      if (i + 1 < words.length) {
        const withNext = currentCandidate + ' ' + words[i + 1];
        const parsedWithNext = recognizeItem(withNext);
        if (parsedWithNext.isRecognized && parsedWithNext.confidence >= parsedCurrent.confidence) {
          // It's a compound phrase, let next iteration consume it
          continue;
        }
      }
      items.push(currentCandidate);
      currentTokens = [];
    }
  }

  if (currentTokens.length > 0) {
    if (items.length > 0) {
      items.push(currentTokens.join(' '));
    } else {
      return [text];
    }
  }

  return items.length > 1 ? items : [text];
}

/**
 * Splits multi-item natural language input into individual item strings:
 * - Handles newlines (\n)
 * - Handles commas (English "," and Urdu/Arabic "،")
 * - Handles semicolons (";" and Urdu "؛")
 * - Handles numbered and bullet list markers ("1. ", "• ", "- ", etc.)
 * - Handles conjunctions (" and ", " aur ", " اور ", " & ", " + ")
 * - Handles space-separated lists of recognized grocery staples without dropping anything
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
      for (const sc of subChunks) {
        // If subChunk itself is space-separated grocery items
        const spaceSplit = splitSpaceSeparatedItems(sc);
        results.push(...spaceSplit);
      }
    } else if (chunk) {
      const spaceSplit = splitSpaceSeparatedItems(chunk);
      results.push(...spaceSplit);
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
