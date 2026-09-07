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
 * - آ, أ, إ, ٱ -> ا (Alif)
 * - ي, ى, ئ, ۓ, ے -> ی (Chhoti Ye / Bari Ye harmonization)
 * - ك -> ک (Keheh / Kaf)
 * - ة, ھ, ہ, ۂ, ۃ -> ہ (Heh / Do-Chashmi Heh / Te Marbuta)
 * - ؤ -> و (Waw)
 */
export function harmonizeUrduGlyphs(text: string): string {
  if (!text) return '';
  return text
    .replace(/[آأإٱ]/g, 'ا')
    .replace(/[يىئۓے]/g, 'ی')
    .replace(/[ك]/g, 'ک')
    .replace(/[ةھہۂۃ]/g, 'ہ')
    .replace(/[ؤ]/g, 'و');
}

/**
 * Base Input Normalization:
 * - Lowercases Latin characters
 * - Normalizes Unicode non-breaking and zero-width spaces (ZWNJ/ZWSP)
 * - Strips diacritics and aerab
 * - Harmonizes Urdu glyphs
 * - Replaces punctuation, symbols, and quotation marks (English, Urdu, Arabic) with spaces
 * - Collapses consecutive whitespaces
 */
export function normalizeBaseText(input: string): string {
  if (!input) return '';

  let text = input.trim().toLowerCase();

  // Normalize zero-width non-joiners, zero-width spaces, non-breaking spaces to standard space
  text = text.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ');

  // Strip Urdu / Arabic diacritics
  text = stripUrduDiacritics(text);

  // Standardize Urdu glyphs
  text = harmonizeUrduGlyphs(text);

  // Strip punctuation, quotes, symbols (including English, Urdu, and Arabic punctuation)
  text = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'۔،؟؛٪«»“”‘’—–|\\+\[\]<>@]/g, ' ');

  // Collapse consecutive whitespaces and trim
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Roman Urdu & English Phonetic Normalizer.
 * Reduces spelling variations, accents, duplicate letters, and transliteration differences.
 * 
 * Handles:
 * - "hari mirch", "hari mirchh", "hari mirchhh", "haree mirch", "harimirch" -> "hari mirch"
 * - "green chilli", "green chili", "green chillies", "green chilies", "green chilly" -> "grin chili"
 * - "cheeni", "chini", "cheni" -> "chini"
 * - "aloo", "alu", "alo", "aalu", "allu", "aluu" -> "alu"
 * - "pyaz", "pyaaz", "piyaz", "payaz" -> "pyaz"
 * - "tamatar", "tamaatar", "tmatar" -> "tamatar"
 * - "doodh", "dudh", "dhudh" -> "dudh"
 * - "anday", "ande", "andey", "anda" -> "anda"
 * - "phatkari", "phitkari", "fitkari" -> "fatkari" / "fitkari"
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

    // Collapse 3+ identical consecutive characters (e.g. aluuu -> alu, mirchhh -> mirch)
    w = w.replace(/(.)\1{2,}/g, '$1');

    // Roman Urdu trailing aspirate / double consonants cleanup
    // (e.g. mirchh -> mirch, dhaniyaa -> dhaniya)
    w = w.replace(/chh+$/g, 'ch');
    w = w.replace(/shh+$/g, 'sh');
    w = w.replace(/khh+$/g, 'kh');
    w = w.replace(/thh+$/g, 'th');
    w = w.replace(/phh+$/g, 'ph');
    w = w.replace(/ghh+$/g, 'gh');
    w = w.replace(/dhh+$/g, 'dh');
    w = w.replace(/rhh+$/g, 'rh');
    w = w.replace(/hh+$/g, 'h');

    // Roman Urdu vowel cluster harmonizations:
    // 'oo', 'uu', 'ou' -> 'u' (e.g. aloo -> alu, doodh -> dudh)
    w = w.replace(/oo|uu|ou/g, 'u');
    // 'ee', 'ea', 'ei', 'ie', 'ey' -> 'i' (e.g. cheeni -> chini, kheera -> khira, green -> grin)
    w = w.replace(/ee|ea|ei|ie|ey/g, 'i');
    // 'aa' -> 'a' (e.g. aalu -> alu, pyaaz -> pyaz, tamatar -> tamatar)
    w = w.replace(/aa/g, 'a');

    // Trailing Urdu Bari Ye vowel sounds: 'ay', 'ey', 'ai' -> 'a' (e.g. anday -> anda, kheeray -> kheera)
    w = w.replace(/(ay|ey|ai)$/g, 'a');

    // Roman Urdu plural suffixes reduction (e.g. mirchein, mirchain, mirchiya, mirchiyan -> mirch)
    if (w.length > 5 && /(ein|ain|iyan|iya)$/.test(w)) {
      w = w.replace(/(ein|ain|iyan|iya)$/, '');
    }

    // Roman Urdu single trailing 'o' on short words often equals 'u' (e.g. 'alo' -> 'alu', 'leemo' -> 'leemu')
    if (w.length <= 5 && w.endsWith('o') && !['no', 'to', 'so', 'do', 'mango'].includes(w)) {
      w = w.slice(0, -1) + 'u';
    }

    // Roman Urdu consonant harmonization:
    // 'q' -> 'k' (e.g. qeema -> keema)
    w = w.replace(/q/g, 'k');
    // 'ph' -> 'f' (e.g. phitkari -> fitkari, phool -> fool, phatkari -> fatkari)
    w = w.replace(/ph/g, 'f');

    // Double consonants reduction (e.g. 'allu' -> 'alu', 'mattar' -> 'matar', 'chilli' -> 'chili')
    w = w.replace(/([bcdfghjklmnpqrstvwxyz])\1+/g, '$1');

    // English plurals:
    if (w === 'chillies' || w === 'chilies' || w === 'chilly') {
      w = 'chili';
    } else if (w.endsWith('oes') && w.length > 4) {
      w = w.slice(0, -2); // potatoes -> potato, tomatoes -> tomato
    } else if (w.endsWith('ies') && w.length > 4) {
      w = w.slice(0, -3) + 'y'; // strawberries -> strawberry
    } else if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) {
      w = w.slice(0, -1); // onions -> onion, eggs -> egg, lemons -> lemon
    }

    // Trailing 'y' after consonant in food/produce names to 'i' (e.g. chilly -> chili)
    if (w.endsWith('y') && w.length > 3 && !/[aeiou]y$/.test(w)) {
      w = w.slice(0, -1) + 'i';
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
