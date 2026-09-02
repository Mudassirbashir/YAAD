/**
 * Fast Levenshtein and string similarity algorithms for typo tolerance.
 */

/**
 * Calculates standard Levenshtein distance between two strings.
 */
export function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;

  if (m === 0) return n;
  if (n === 0) return m;

  // Single row memory optimization
  let prevRow = new Array(n + 1);
  let currRow = new Array(n + 1);

  for (let j = 0; j <= n; j++) {
    prevRow[j] = j;
  }

  for (let i = 1; i <= m; i++) {
    currRow[0] = i;
    const char1 = s1[i - 1];

    for (let j = 1; j <= n; j++) {
      const char2 = s2[j - 1];
      const cost = char1 === char2 ? 0 : 1;

      currRow[j] = Math.min(
        prevRow[j] + 1, // deletion
        currRow[j - 1] + 1, // insertion
        prevRow[j - 1] + cost // substitution
      );
    }

    // Swap rows
    const temp = prevRow;
    prevRow = currRow;
    currRow = temp;
  }

  return prevRow[n];
}

/**
 * Computes a normalized similarity score between 0.0 (completely different) and 1.0 (exact match).
 */
export function stringSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  if (!str1 || !str2) return 0.0;

  const len1 = str1.length;
  const len2 = str2.length;
  const maxLen = Math.max(len1, len2);

  if (maxLen === 0) return 1.0;

  const distance = levenshteinDistance(str1, str2);
  return Math.max(0, 1 - distance / maxLen);
}

/**
 * Checks if query contains target or vice-versa, or has high token overlap.
 */
export function substringOrTokenMatch(query: string, target: string): boolean {
  if (query === target) return true;
  if (query.includes(target) || target.includes(query)) return true;

  const qTokens = query.split(' ').filter(Boolean);
  const tTokens = target.split(' ').filter(Boolean);

  for (const q of qTokens) {
    if (tTokens.includes(q)) return true;
  }

  return false;
}
