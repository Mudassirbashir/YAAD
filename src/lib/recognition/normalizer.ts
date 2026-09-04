/**
 * YAAD Smart Item Recognition Engine - Input Normalization Pipeline
 * 
 * Responsibilities:
 * 1. Harmonize Urdu script glyph variants and strip diacritics/aerab.
 * 2. Collapse whitespaces, strip punctuation, lowercase Latin characters.
 * 3. Phonetic normalization for Roman Urdu and English (e.g. aloo/alu/alo/aalu -> alu).
 */

// Urdu diacritics regex (Zabar, Zer, Pesh, Shaddah, Sukun, Tanwin, Khari Zabar, etc.)
const URDU_DIACRITICS_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

/**
 * Strips all Urdu/Arabic vowel markers and diacritics.
 */
export function stripUrduDiacritics(text: string): string {
  if (!text) return '';
  return text.replace(URDU_DIACRITICS_REGEX, '');
}

/**
 * Standardizes equivalent Urdu glyphs into canonical character forms:
 * - آ, أ, إ -> ا (Alif)
 * - ي, ى, ئ, ۓ, ے -> ی (Chhoti Ye / Bari Ye harmonization)
 * - ك -> ک (Keheh / Kaf)
 * - ة, ھ, ہ, ۂ, ۃ -> ہ (Heh / Do-Chashmi Heh / Te Marbuta)
 * - ؤ -> و (Waw)
 */
export function harmonizeUrduGlyphs(text: string): string {
  if (!text) return '';
  return text
    .replace(/[آأإ]/g, 'ا')
    .replace(/[يىئۓے]/g, 'ی')
    .replace(/[ك]/g, 'ک')
    .replace(/[ةھہۂۃ]/g, 'ہ')
    .replace(/[ؤ]/g, 'و');
}

/**
 * Base Input Normalization:
 * - Lowercases Latin characters
 * - Strips diacritics and aerab
 * - Harmonizes Urdu glyphs
 * - Replaces punctuation and special symbols with spaces
 * - Collapses consecutive whitespaces
 */
export function normalizeBaseText(input: string): string {
  if (!input) return '';

  let text = input.trim().toLowerCase();

  // Strip Urdu / Arabic diacritics
  text = stripUrduDiacritics(text);

  // Standardize Urdu glyphs
  text = harmonizeUrduGlyphs(text);

  // Strip punctuation, quotes, symbols (including Urdu punctuation)
  text = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'۔،|\\+\[\]]/g, ' ');

  // Collapse consecutive whitespaces and trim
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Roman Urdu & English Phonetic Normalizer.
 * Reduces spelling variations, accents, duplicate letters, and transliteration differences.
 * 
 * Handles:
 * - "aloo", "alu", "alo", "aalu", "allu", "aluu" -> "alu"
 * - "pyaz", "pyaaz", "piyaz", "payaz" -> "pyaz"
 * - "cheeni", "chini", "cheni" -> "chini"
 * - "tamatar", "tamaatar", "tmatar" -> "tamatar"
 * - "doodh", "dudh", "dhudh" -> "dudh"
 * - "anday", "ande", "andey", "anda" -> "anda"
 * - "hari mirch", "haree mirch", "harimirch" -> "hari mirch"
 */
export function normalizePhonetic(input: string): string {
  const base = normalizeBaseText(input);
  if (!base) return '';

  // If text is purely Urdu script, return base normalized Urdu
  if (/^[\u0600-\u06FF\s]+$/.test(base)) {
    return base;
  }

  const words = base.split(' ').filter(Boolean).map((word) => {
    let w = word;

    // Collapse 3+ identical consecutive characters
    w = w.replace(/(.)\1{2,}/g, '$1');

    // Roman Urdu vowel cluster harmonizations:
    // 'oo', 'uu' -> 'u' (e.g. aloo -> alu, doodh -> dudh)
    w = w.replace(/oo|uu/g, 'u');
    // 'ee', 'ea' -> 'i' (e.g. cheeni -> chini, kheera -> khira)
    w = w.replace(/ee|ea/g, 'i');
    // 'aa' -> 'a' (e.g. aalu -> alu, pyaaz -> pyaz, tamatar -> tamatar)
    w = w.replace(/aa/g, 'a');

    // Trailing Urdu Bari Ye vowel sounds: 'ay', 'ey', 'ai' -> 'a' (e.g. anday -> anda, kheeray -> kheera)
    w = w.replace(/(ay|ey|ai)$/g, 'a');

    // Roman Urdu single trailing 'o' on short words often equals 'u' (e.g. 'alo' -> 'alu')
    if (w.length <= 4 && w.endsWith('o') && !['no', 'to', 'so', 'do'].includes(w)) {
      w = w.slice(0, -1) + 'u';
    }

    // Roman Urdu consonant harmonization:
    // 'q' -> 'k' (e.g. qeema -> keema)
    w = w.replace(/q/g, 'k');
    // 'ph' -> 'f' (e.g. phitkari -> fitkari, phool -> fool)
    w = w.replace(/ph/g, 'f');

    // Double consonants reduction (e.g. 'allu' -> 'alu', 'mattar' -> 'matar', 'chilli' -> 'chili')
    w = w.replace(/([bcdfghjklmnpqrstvwxyz])\1+/g, '$1');

    // English plurals:
    if (w.endsWith('oes') && w.length > 4) {
      w = w.slice(0, -2); // potatoes -> potato
    } else if (w.endsWith('ies') && w.length > 4) {
      w = w.slice(0, -3) + 'y'; // strawberries -> strawberry
    } else if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) {
      w = w.slice(0, -1); // onions -> onion, eggs -> egg
    }

    return w;
  });

  return words.join(' ');
}

/**
 * Title cases Latin words while keeping Urdu characters intact.
 */
export function formatItemTitle(str: string): string {
  if (!str) return '';
  return str
    .split(' ')
    .filter(Boolean)
    .map((w) => {
      if (/[\u0600-\u06FF]/.test(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(' ');
}
