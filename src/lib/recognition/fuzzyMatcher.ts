/**
 * Advanced Damerau-Levenshtein distance and calibrated fuzzy matching algorithms
 * for typo tolerance in English, Roman Urdu, and Urdu.
 */

/**
 * Calculates Damerau-Levenshtein distance between two strings,
 * accounting for insertions, deletions, substitutions, and adjacent transpositions.
 */
export function damerauLevenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;

  if (m === 0) return n;
  if (n === 0) return m;
  if (s1 === s2) return 0;

  // 2D matrix for full Damerau-Levenshtein transposition tracking
  const d: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;

      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );

      // Transposition check
      if (i > 1 && j > 1 && s1[i - 1] === s2[j - 2] && s1[i - 2] === s2[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }

  return d[m][n];
}

/**
 * Backward compatibility alias for levenshteinDistance.
 */
export function levenshteinDistance(s1: string, s2: string): number {
  return damerauLevenshteinDistance(s1, s2);
}

/**
 * Computes a calibrated similarity score between 0.0 (completely different) and 1.0 (identical).
 * Includes:
 * - Damerau-Levenshtein distance
 * - Prefix match bonus (Jaro-Winkler style)
 * - Typo-length calibration for short strings (e.g. 1 edit on a 4-char word)
 * - Substring prefix containment
 */
export function stringSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  if (!str1 || !str2) return 0.0;

  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1.0;

  const len1 = s1.length;
  const len2 = s2.length;
  const maxLen = Math.max(len1, len2);
  const minLen = Math.min(len1, len2);

  if (maxLen === 0) return 1.0;

  // Exact prefix match (e.g. "alo" is prefix of "aloo")
  if (minLen >= 3 && (s1.startsWith(s2) || s2.startsWith(s1))) {
    const diff = maxLen - minLen;
    if (diff === 1) return 0.90;
    if (diff === 2) return 0.84;
    if (diff <= 3) return 0.78;
  }

  const distance = damerauLevenshteinDistance(s1, s2);

  // Calibration for single-character typos
  if (distance === 1) {
    if (maxLen <= 3) return 0.82;
    if (maxLen <= 4) return 0.86;
    if (maxLen <= 6) return 0.89;
    return 0.92;
  }

  // Calibration for two-character typos
  if (distance === 2) {
    if (maxLen <= 4) return 0.65;
    if (maxLen <= 6) return 0.76;
    if (maxLen <= 8) return 0.82;
    return 0.85;
  }

  // Standard ratio for larger differences
  let baseScore = Math.max(0, 1 - distance / maxLen);

  // Common prefix bonus (up to 3 characters)
  let prefixLen = 0;
  while (prefixLen < 3 && prefixLen < minLen && s1[prefixLen] === s2[prefixLen]) {
    prefixLen++;
  }
  if (prefixLen > 0 && baseScore > 0.5) {
    baseScore = Math.min(1.0, baseScore + prefixLen * 0.02);
  }

  return baseScore;
}

/**
 * Calibrated confidence thresholds based on YAAD Step 5 specifications:
 * - >= 0.95: Very strong match
 * - 0.85 - 0.94: Strong match
 * - 0.70 - 0.84: Possible match
 * - < 0.70: Uncertain (prevents false-positive category hallucinations)
 */
export const FUZZY_MIN_ACCEPTABLE_SCORE = 0.70;
export const FUZZY_HIGH_CONFIDENCE_SCORE = 0.85;

/**
 * Converts a raw string similarity score into an item recognition confidence score.
 */
export function computeFuzzyConfidence(rawSimilarity: number): number {
  if (rawSimilarity >= 0.95) return Math.min(0.98, Number(rawSimilarity.toFixed(2)));
  if (rawSimilarity >= 0.85) return Number(rawSimilarity.toFixed(2));
  if (rawSimilarity >= FUZZY_MIN_ACCEPTABLE_SCORE) return Number(rawSimilarity.toFixed(2));
  return Number(rawSimilarity.toFixed(2));
}
