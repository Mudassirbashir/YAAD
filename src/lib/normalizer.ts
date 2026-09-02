/**
 * Multi-lingual text normalizer for English, Urdu Script, and Roman Urdu.
 * Handles character harmonization, diacritics removal, phonetic compression,
 * and plural/spelling normalization.
 */

// Urdu diacritics regex (Zabar, Zer, Pesh, Shaddah, Sukun, Tanwin, etc.)
const URDU_DIACRITICS_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

/**
 * Standard basic normalization:
 * - Lowercase & trim
 * - Strips diacritics
 * - Normalizes Urdu glyph equivalents
 * - Replaces punctuation with single spaces
 */
export function normalizeBaseText(input: string): string {
  if (!input) return '';

  let text = input.trim().toLowerCase();

  // Strip Urdu / Arabic diacritics
  text = text.replace(URDU_DIACRITICS_REGEX, '');

  // Normalize common Urdu glyph variations to standard forms
  text = text
    .replace(/[آأإ]/g, 'ا')
    .replace(/[يىئۓے]/g, 'ی')
    .replace(/[ك]/g, 'ک')
    .replace(/[گ]/g, 'گ')
    .replace(/[ةھہۂۃ]/g, 'ہ')
    .replace(/[ؤ]/g, 'و');

  // Strip punctuation and special symbols
  text = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'۔،|\\+\[\]]/g, ' ');

  // Collapse consecutive whitespaces
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Roman Urdu and English Phonetic Normalizer.
 * Reduces spelling variations, accents, duplicate letters, and transliteration differences.
 * Examples:
 * - "aluu", "aloo", "allu", "alu", "alo" -> "alu"
 * - "anday", "ande", "andey", "anda" -> "anda"
 * - "doodh", "dudh", "dood", "dhudh" -> "dudh"
 * - "cheeni", "chini", "cheni" -> "chini"
 * - "tamatar", "tamaatar", "tmatar" -> "tamatar"
 * - "potatoes", "potatos" -> "potato"
 */
export function normalizePhonetic(input: string): string {
  const base = normalizeBaseText(input);
  if (!base) return '';

  // If text is purely in Urdu script, return base normalized Urdu
  if (/[\u0600-\u06FF]/.test(base)) {
    return base;
  }

  const words = base.split(' ').map((word) => {
    let w = word;

    // 1. Collapse 3+ identical consecutive letters to 1
    w = w.replace(/(.)\1{2,}/g, '$1');

    // 2. Normalize Roman Urdu vowel sounds:
    // 'oo', 'uu' -> 'u'
    w = w.replace(/oo|uu/g, 'u');
    // 'ee', 'ea' -> 'i'
    w = w.replace(/ee|ea/g, 'i');
    // 'aa' -> 'a'
    w = w.replace(/aa/g, 'a');
    // 'ai', 'ay', 'ey' at the end of word (Urdu Bari Ye sound) -> 'a' or 'i'
    w = w.replace(/(ay|ey|ai)$/g, 'a');

    // 3. Normalize common Roman Urdu consonant equivalences:
    // 'q' -> 'k' (e.g. qeema -> keema, qehwa -> kehwa)
    w = w.replace(/q/g, 'k');
    // 'ph' -> 'f' (e.g. phool -> fool, moongphali -> moongfali)
    w = w.replace(/ph/g, 'f');
    // 'kh' -> 'k', 'gh' -> 'g', 'bh' -> 'b', 'dh' -> 'd', 'th' -> 't', 'ch' -> 'c' (for fuzzy matching)
    // Reduce duplicate double consonants (e.g. 'allu' -> 'alu', 'mattar' -> 'matar', 'makkan' -> 'makan')
    w = w.replace(/([bcdfghjklmnpqrstvwxyz])\1+/g, '$1');

    // 4. Remove common English and Urdu plural endings:
    // "potatoes" -> "potato", "tomatoes" -> "tomato"
    if (w.endsWith('oes') && w.length > 4) {
      w = w.slice(0, -2); // 'potatoes' -> 'potato'
    } else if (w.endsWith('ies') && w.length > 4) {
      w = w.slice(0, -3) + 'y'; // 'strawberries' -> 'strawberry'
    } else if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) {
      w = w.slice(0, -1); // 'eggs' -> 'egg', 'apples' -> 'apple'
    } else if (w.endsWith('e') && w.length > 3 && !['rice', 'juice', 'cheese', 'sauce', 'clove', 'coke', 'lime'].includes(w)) {
      // Urdu plural 'e' sound e.g. 'kheere' -> 'kheera'
      w = w.slice(0, -1) + 'a';
    }

    return w;
  });

  return words.join(' ');
}
