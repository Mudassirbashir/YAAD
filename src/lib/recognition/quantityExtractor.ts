import { ExtractedQuantityResult } from './types';

/**
 * Standard Unit Mapping & Normalization
 * Normalizes all unit variations to their canonical representation:
 * - kg, kilo, kilogram, kilograms, کلو -> kg
 * - g, gram, grams, gm, gms, گرام -> g
 * - mg, milligram, ملی گرام -> mg
 * - l, L, lt, ltr, ltrs, liter, liters, litre, litres, لیٹر -> l
 * - ml, milli, milliliter, milliliters, ملی لیٹر -> ml
 * - dozen, dozens, doz, darjan, درجن -> dozen
 * - piece, pieces, pc, pcs, عدد, دانہ -> piece
 * - pack, packs, packet, packets, pkt, pkts, پیکٹ -> packet
 * - box, boxes, ڈبہ, ڈبے -> box
 * - bottle, bottles, بوتل, بوتلیں -> bottle
 * - can, cans, کین -> can
 * - jar, jars, جار -> jar
 * - bag, bags, تھیلا, بوری -> bag
 * - carton, cartons, کارٹن -> carton
 * - bundle, bundles, گڈی, گڈیاں -> bundle
 * - pair, pairs, جوڑا, جوڑے -> pair
 * - pao, پاؤ -> pao (South Asian 250g)
 * - seer, سیر -> seer
 */
export const UNIT_MAP: Record<string, { standard: string; label: string; urduLabel: string }> = {
  // Weight - Kilograms
  kg: { standard: 'kg', label: 'kg', urduLabel: 'کلو' },
  kgs: { standard: 'kg', label: 'kg', urduLabel: 'کلو' },
  kilo: { standard: 'kg', label: 'kg', urduLabel: 'کلو' },
  kilos: { standard: 'kg', label: 'kg', urduLabel: 'کلو' },
  kilogram: { standard: 'kg', label: 'kg', urduLabel: 'کلو' },
  kilograms: { standard: 'kg', label: 'kg', urduLabel: 'کلو' },
  keelo: { standard: 'kg', label: 'kg', urduLabel: 'کلو' },
  kelo: { standard: 'kg', label: 'kg', urduLabel: 'کلو' },
  'کلو': { standard: 'kg', label: 'kg', urduLabel: 'کلو' },
  'کل': { standard: 'kg', label: 'kg', urduLabel: 'کلو' },

  // Weight - Grams
  g: { standard: 'g', label: 'g', urduLabel: 'گرام' },
  gm: { standard: 'g', label: 'g', urduLabel: 'گرام' },
  gms: { standard: 'g', label: 'g', urduLabel: 'گرام' },
  gram: { standard: 'g', label: 'g', urduLabel: 'گرام' },
  grams: { standard: 'g', label: 'g', urduLabel: 'گرام' },
  graam: { standard: 'g', label: 'g', urduLabel: 'گرام' },
  'گرام': { standard: 'g', label: 'g', urduLabel: 'گرام' },

  // Weight - Milligrams
  mg: { standard: 'mg', label: 'mg', urduLabel: 'ملی گرام' },
  milligram: { standard: 'mg', label: 'mg', urduLabel: 'ملی گرام' },
  milligrams: { standard: 'mg', label: 'mg', urduLabel: 'ملی گرام' },
  'ملی گرام': { standard: 'mg', label: 'mg', urduLabel: 'ملی گرام' },

  // Volume - Liters
  l: { standard: 'l', label: 'l', urduLabel: 'لیٹر' },
  L: { standard: 'l', label: 'l', urduLabel: 'لیٹر' },
  lt: { standard: 'l', label: 'l', urduLabel: 'لیٹر' },
  ltr: { standard: 'l', label: 'l', urduLabel: 'لیٹر' },
  ltrs: { standard: 'l', label: 'l', urduLabel: 'لیٹر' },
  liter: { standard: 'l', label: 'l', urduLabel: 'لیٹر' },
  liters: { standard: 'l', label: 'l', urduLabel: 'لیٹر' },
  litre: { standard: 'l', label: 'l', urduLabel: 'لیٹر' },
  litres: { standard: 'l', label: 'l', urduLabel: 'لیٹر' },
  leetar: { standard: 'l', label: 'l', urduLabel: 'لیٹر' },
  leeter: { standard: 'l', label: 'l', urduLabel: 'لیٹر' },
  'لیٹر': { standard: 'l', label: 'l', urduLabel: 'لیٹر' },

  // Volume - Milliliters
  ml: { standard: 'ml', label: 'ml', urduLabel: 'ملی لیٹر' },
  mls: { standard: 'ml', label: 'ml', urduLabel: 'ملی لیٹر' },
  milli: { standard: 'ml', label: 'ml', urduLabel: 'ملی لیٹر' },
  milliliter: { standard: 'ml', label: 'ml', urduLabel: 'ملی لیٹر' },
  milliliters: { standard: 'ml', label: 'ml', urduLabel: 'ملی لیٹر' },
  millilitre: { standard: 'ml', label: 'ml', urduLabel: 'ملی لیٹر' },
  millilitres: { standard: 'ml', label: 'ml', urduLabel: 'ملی لیٹر' },
  'ملی': { standard: 'ml', label: 'ml', urduLabel: 'ملی لیٹر' },
  'ملی لیٹر': { standard: 'ml', label: 'ml', urduLabel: 'ملی لیٹر' },

  // Count - Dozen
  dozen: { standard: 'dozen', label: 'dozen', urduLabel: 'درجن' },
  dozens: { standard: 'dozen', label: 'dozen', urduLabel: 'درجن' },
  doz: { standard: 'dozen', label: 'dozen', urduLabel: 'درجن' },
  darjan: { standard: 'dozen', label: 'dozen', urduLabel: 'درجن' },
  darzn: { standard: 'dozen', label: 'dozen', urduLabel: 'درجن' },
  'درجن': { standard: 'dozen', label: 'dozen', urduLabel: 'درجن' },

  // Packaging - Pack / Packet
  packet: { standard: 'packet', label: 'packet', urduLabel: 'پیکٹ' },
  packets: { standard: 'packet', label: 'packet', urduLabel: 'پیکٹ' },
  pack: { standard: 'packet', label: 'packet', urduLabel: 'پیکٹ' },
  packs: { standard: 'packet', label: 'packet', urduLabel: 'پیکٹ' },
  pkt: { standard: 'packet', label: 'packet', urduLabel: 'پیکٹ' },
  pkts: { standard: 'packet', label: 'packet', urduLabel: 'پیکٹ' },
  'پیکٹ': { standard: 'packet', label: 'packet', urduLabel: 'پیکٹ' },

  // Containers - Bottle
  bottle: { standard: 'bottle', label: 'bottle', urduLabel: 'بوتل' },
  bottles: { standard: 'bottle', label: 'bottle', urduLabel: 'بوتل' },
  botal: { standard: 'bottle', label: 'bottle', urduLabel: 'بوتل' },
  botlein: { standard: 'bottle', label: 'bottle', urduLabel: 'بوتل' },
  'بوتل': { standard: 'bottle', label: 'bottle', urduLabel: 'بوتل' },
  'بوتلیں': { standard: 'bottle', label: 'bottle', urduLabel: 'بوتل' },

  // Containers - Box
  box: { standard: 'box', label: 'box', urduLabel: 'ڈبہ' },
  boxes: { standard: 'box', label: 'box', urduLabel: 'ڈبے' },
  dabba: { standard: 'box', label: 'box', urduLabel: 'ڈبہ' },
  dabbe: { standard: 'box', label: 'box', urduLabel: 'ڈبے' },
  'ڈبہ': { standard: 'box', label: 'box', urduLabel: 'ڈبہ' },
  'ڈبے': { standard: 'box', label: 'box', urduLabel: 'ڈبے' },

  // Containers - Can
  can: { standard: 'can', label: 'can', urduLabel: 'کین' },
  cans: { standard: 'can', label: 'can', urduLabel: 'کین' },
  'کین': { standard: 'can', label: 'can', urduLabel: 'کین' },

  // Containers - Jar
  jar: { standard: 'jar', label: 'jar', urduLabel: 'جار' },
  jars: { standard: 'jar', label: 'jar', urduLabel: 'جار' },
  'جار': { standard: 'jar', label: 'jar', urduLabel: 'جار' },

  // Bags
  bag: { standard: 'bag', label: 'bag', urduLabel: 'تھیلا' },
  bags: { standard: 'bag', label: 'bag', urduLabel: 'تھیلا' },
  thela: { standard: 'bag', label: 'bag', urduLabel: 'تھیلا' },
  thelay: { standard: 'bag', label: 'bag', urduLabel: 'تھیلا' },
  bori: { standard: 'bag', label: 'bag', urduLabel: 'بوری' },
  'تھیلا': { standard: 'bag', label: 'bag', urduLabel: 'تھیلا' },
  'تھیلے': { standard: 'bag', label: 'bag', urduLabel: 'تھیلا' },
  'بوری': { standard: 'bag', label: 'bag', urduLabel: 'بوری' },

  // Cartons
  carton: { standard: 'carton', label: 'carton', urduLabel: 'کارٹن' },
  cartons: { standard: 'carton', label: 'carton', urduLabel: 'کارٹن' },
  'کارٹن': { standard: 'carton', label: 'carton', urduLabel: 'کارٹن' },

  // Bundles & Bunches
  bundle: { standard: 'bundle', label: 'bundle', urduLabel: 'گڈی' },
  bundles: { standard: 'bundle', label: 'bundle', urduLabel: 'گڈی' },
  bunch: { standard: 'bundle', label: 'bundle', urduLabel: 'گڈی' },
  bunches: { standard: 'bundle', label: 'bundle', urduLabel: 'گڈی' },
  gaddi: { standard: 'bundle', label: 'bundle', urduLabel: 'گڈی' },
  gatti: { standard: 'bundle', label: 'bundle', urduLabel: 'گڈی' },
  'گڈی': { standard: 'bundle', label: 'bundle', urduLabel: 'گڈی' },
  'گڈیاں': { standard: 'bundle', label: 'bundle', urduLabel: 'گڈی' },

  // Pairs
  pair: { standard: 'pair', label: 'pair', urduLabel: 'جوڑا' },
  pairs: { standard: 'pair', label: 'pair', urduLabel: 'جوڑا' },
  jora: { standard: 'pair', label: 'pair', urduLabel: 'جوڑا' },
  jori: { standard: 'pair', label: 'pair', urduLabel: 'جوڑا' },
  'جوڑا': { standard: 'pair', label: 'pair', urduLabel: 'جوڑا' },
  'جوڑے': { standard: 'pair', label: 'pair', urduLabel: 'جوڑا' },

  // Discrete Pieces
  piece: { standard: 'piece', label: 'piece', urduLabel: 'عدد' },
  pieces: { standard: 'piece', label: 'piece', urduLabel: 'عدد' },
  pcs: { standard: 'piece', label: 'piece', urduLabel: 'عدد' },
  pc: { standard: 'piece', label: 'piece', urduLabel: 'عدد' },
  adad: { standard: 'piece', label: 'piece', urduLabel: 'عدد' },
  dana: { standard: 'piece', label: 'piece', urduLabel: 'دانہ' },
  dane: { standard: 'piece', label: 'piece', urduLabel: 'دانہ' },
  'عدد': { standard: 'piece', label: 'piece', urduLabel: 'عدد' },
  'دانہ': { standard: 'piece', label: 'piece', urduLabel: 'دانہ' },

  // Traditional South Asian Specific
  pao: { standard: 'pao', label: 'pao', urduLabel: 'پاؤ' },
  paao: { standard: 'pao', label: 'pao', urduLabel: 'پاؤ' },
  pow: { standard: 'pao', label: 'pao', urduLabel: 'پاؤ' },
  'پاؤ': { standard: 'pao', label: 'pao', urduLabel: 'پاؤ' },
  'پاو': { standard: 'pao', label: 'pao', urduLabel: 'پاؤ' },

  seer: { standard: 'seer', label: 'seer', urduLabel: 'سیر' },
  ser: { standard: 'seer', label: 'seer', urduLabel: 'سیر' },
  'سیر': { standard: 'seer', label: 'seer', urduLabel: 'سیر' },
};

/**
 * Pakistani / Urdu & Roman Urdu Number Words to Decimal/Integer Mapping
 * Explicitly preserves user requirements:
 * aadha => 0.5
 * pauna => 0.75
 * sawa => 1.25
 * dedh => 1.5
 * dhai => 2.5
 */
export const WORD_NUMBER_MAP: Record<string, string> = {
  // Pakistani Fractions
  half: '0.5',
  adha: '0.5',
  aadha: '0.5',
  aada: '0.5',
  addha: '0.5',
  aadhi: '0.5',
  adhey: '0.5',
  'آدھا': '0.5',
  'ادھا': '0.5',
  'آدھی': '0.5',

  paon: '0.75',
  paona: '0.75',
  pauna: '0.75',
  pona: '0.75',
  powna: '0.75',
  'پونا': '0.75',
  'پونے': '0.75',

  sawa: '1.25',
  swa: '1.25',
  'سوا': '1.25',

  dedh: '1.5',
  derh: '1.5',
  dairh: '1.5',
  deydh: '1.5',
  daid: '1.5',
  'ڈیڑھ': '1.5',
  'ڈیرھ': '1.5',

  dhai: '2.5',
  dhaai: '2.5',
  dhaye: '2.5',
  dayi: '2.5',
  'ڈھائی': '2.5',

  quarter: '0.25',

  // Integers (English, Roman Urdu, Urdu)
  one: '1',
  ek: '1',
  aik: '1',
  aek: '1',
  'ایک': '1',

  two: '2',
  do: '2',
  doh: '2',
  'دو': '2',

  three: '3',
  teen: '3',
  tin: '3',
  'تین': '3',

  four: '4',
  char: '4',
  chaar: '4',
  'چار': '4',

  five: '5',
  paanch: '5',
  panch: '5',
  'پانچ': '5',

  six: '6',
  chhe: '6',
  che: '6',
  chay: '6',
  'چھ': '6',

  seven: '7',
  saath: '7',
  sat: '7',
  saat: '7',
  'سات': '7',

  eight: '8',
  aath: '8',
  ath: '8',
  aat: '8',
  'آٹھ': '8',
  'اٹھ': '8',

  nine: '9',
  nau: '9',
  no: '9',
  nao: '9',
  'نو': '9',

  ten: '10',
  das: '10',
  dass: '10',
  'دس': '10',

  eleven: '11',
  gyarah: '11',
  'گیارہ': '11',

  twelve: '12',
  barah: '12',
  bara: '12',
  'بارہ': '12',
};

/**
 * Compound Pakistani Expressions (e.g. "sadhe teen" => 3.5, "paune do" => 1.75, "half dozen" => 0.5 dozen)
 */
export const COMPOUND_EXPRESSIONS_MAP: Record<string, { quantity: string; unit?: string }> = {
  // Sadhe (Number + 0.5)
  'sadhe teen': { quantity: '3.5' },
  'saadhe teen': { quantity: '3.5' },
  'ساڑھے تین': { quantity: '3.5' },

  'sadhe char': { quantity: '4.5' },
  'saadhe chaar': { quantity: '4.5' },
  'ساڑھے چار': { quantity: '4.5' },

  'sadhe panch': { quantity: '5.5' },
  'saadhe paanch': { quantity: '5.5' },
  'ساڑھے پانچ': { quantity: '5.5' },

  // Paune (Number - 0.25)
  'paune do': { quantity: '1.75' },
  'پونے دو': { quantity: '1.75' },

  'paune teen': { quantity: '2.75' },
  'پونے تین': { quantity: '2.75' },

  'paune char': { quantity: '3.75' },
  'paune chaar': { quantity: '3.75' },
  'پونے چار': { quantity: '3.75' },

  // Sawa (Number + 0.25)
  'sawa do': { quantity: '2.25' },
  'سوا دو': { quantity: '2.25' },

  'sawa teen': { quantity: '3.25' },
  'سوا تین': { quantity: '3.25' },

  'sawa char': { quantity: '4.25' },
  'sawa chaar': { quantity: '4.25' },
  'سوا چار': { quantity: '4.25' },

  // Dozen expressions
  'half dozen': { quantity: '0.5', unit: 'dozen' },
  'half doz': { quantity: '0.5', unit: 'dozen' },
  'adha darjan': { quantity: '0.5', unit: 'dozen' },
  'aadha darjan': { quantity: '0.5', unit: 'dozen' },
  'aadha dozen': { quantity: '0.5', unit: 'dozen' },
  'آدھا درجن': { quantity: '0.5', unit: 'dozen' },
  'ادھا درجن': { quantity: '0.5', unit: 'dozen' },
  'ek darjan': { quantity: '1', unit: 'dozen' },
  'ایک درجن': { quantity: '1', unit: 'dozen' },
  'do darjan': { quantity: '2', unit: 'dozen' },
  'دو درجن': { quantity: '2', unit: 'dozen' },
};

/**
 * Normalizes Eastern Arabic and Urdu/Persian digits to standard ASCII digits:
 * ۰-۹ / ٠-٩ -> 0-9
 */
export function normalizeUrduDigits(text: string): string {
  const urduDigits: Record<string, string> = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  };
  return text.replace(/[۰-۹٠-٩]/g, (char) => urduDigits[char] || char);
}

/**
 * Converts written fraction representations to clean decimal strings
 * e.g. "1/2" -> "0.5", "3/4" -> "0.75", "1 1/2" -> "1.5"
 */
function normalizeFractionToDecimal(str: string): string {
  const trimmed = str.trim();
  if (trimmed === '1/2') return '0.5';
  if (trimmed === '1/4') return '0.25';
  if (trimmed === '3/4') return '0.75';
  if (trimmed === '1 1/2') return '1.5';
  if (trimmed === '2 1/2') return '2.5';

  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseFloat(mixedMatch[1]);
    const num = parseFloat(mixedMatch[2]);
    const den = parseFloat(mixedMatch[3]);
    if (den > 0) {
      return String(whole + num / den);
    }
  }

  const fracMatch = trimmed.match(/^(\d+)\/(\d+)$/);
  if (fracMatch) {
    const num = parseFloat(fracMatch[1]);
    const den = parseFloat(fracMatch[2]);
    if (den > 0) {
      return String(num / den);
    }
  }

  return trimmed;
}

// Regex building blocks sorted by length descending so longer phrases match first
const ALL_UNIT_KEYS = Object.keys(UNIT_MAP)
  .sort((a, b) => b.length - a.length)
  .join('|');

const ALL_NUM_WORDS = Object.keys(WORD_NUMBER_MAP)
  .sort((a, b) => b.length - a.length)
  .join('|');

const ALL_COMPOUND_PHRASES = Object.keys(COMPOUND_EXPRESSIONS_MAP)
  .sort((a, b) => b.length - a.length)
  .join('|');

const NUMBER_TOKEN_REGEX_PART = `(?:\\d+(?:\\.\\d+)?|\\d+\\/\\d+|\\d+\\s+\\d+\\/\\d+|${ALL_NUM_WORDS})`;

/**
 * Strips common conversational shopping prefixes and suffixes:
 * e.g. "buy some eggs" -> "eggs"
 * "please get 2 kg aloo" -> "2 kg aloo"
 * "bring some milk" -> "milk"
 * "لانا 2 کلو آلو" -> "2 کلو آلو"
 * "دودھ لے آؤ" -> "دودھ"
 */
function cleanConversationalPhrases(input: string): string {
  let s = input.trim();
  // English / Roman conversational prefixes
  s = s.replace(/^(?:please\s+)?(?:buy\s+some|get\s+some|bring\s+some|need\s+some|buy|get|bring|purchase|take|fetch|need|order)\s+/i, '');
  // Trailing conversational suffixes
  s = s.replace(/\s+(?:please|bhi|chahiye|lena hai|le aana|le aao|lana hai|le kar aana)$/i, '');
  // Urdu conversational prefixes & suffixes
  s = s.replace(/^(?:برائے مہربانی\s+)?(?:لے آنا|لے آؤ|لانا|خریدنا|چاہیے)\s+/u, '');
  s = s.replace(/\s+(?:لے آنا|لے آؤ|لانا|خریدنا|چاہیے|بھی)$/u, '');
  return s.trim();
}

/**
 * Strips cosmetic prepositions that often attach to unit expressions:
 * e.g. "1 bottle of cooking oil" -> "cooking oil"
 * "2 packets of biscuits" -> "biscuits"
 * "ایک بوتل تیل کی" -> "تیل"
 */
function cleanPrepositions(name: string): string {
  return name
    .replace(/^of\s+/i, '')
    .replace(/\s+of$/i, '')
    .replace(/^کا\s+|^کی\s+|^کے\s+/u, '')
    .replace(/\s+کا$|\s+کی$|\s+کے$/u, '')
    .replace(/^والی\s+|^والا\s+/u, '')
    .trim();
}

/**
 * Natural language item, quantity & unit separator.
 * Extracts quantity and unit while strictly preserving original user input verbatim.
 * 
 * Satisfies all test cases:
 * - "2 kg aloo" -> quantity: "2", unit: "kg", cleanName: "aloo"
 * - "1 kg piyaz" -> quantity: "1", unit: "kg", cleanName: "piyaz"
 * - "500g sugar" -> quantity: "500", unit: "g", cleanName: "sugar"
 * - "2 dozen eggs" -> quantity: "2", unit: "dozen", cleanName: "eggs"
 * - "1 bottle oil" -> quantity: "1", unit: "bottle", cleanName: "oil"
 * - "3 packets biscuits" -> quantity: "3", unit: "packet", cleanName: "biscuits"
 * - "6 eggs" -> quantity: "6", unit: undefined (handled as piece downstream), cleanName: "eggs"
 * - "1 bread" -> quantity: "1", unit: undefined, cleanName: "bread"
 * - "aadha kilo aloo" -> quantity: "0.5", unit: "kg", cleanName: "aloo"
 * - "adha kilo piyaz" -> quantity: "0.5", unit: "kg", cleanName: "piyaz"
 * - "pauna kilo aloo" -> quantity: "0.75", unit: "kg", cleanName: "aloo"
 * - "sawa kilo sugar" -> quantity: "1.25", unit: "kg", cleanName: "sugar"
 * - "dedh kilo chawal" -> quantity: "1.5", unit: "kg", cleanName: "chawal"
 * - "do kilo tamatar" -> quantity: "2", unit: "kg", cleanName: "tamatar"
 * - "ایک کلو آلو" -> quantity: "1", unit: "kg", cleanName: "آلو"
 * - "آدھا کلو پیاز" -> quantity: "0.5", unit: "kg", cleanName: "پیاز"
 * - "ڈیڑھ کلو چاول" -> quantity: "1.5", unit: "kg", cleanName: "چاول"
 * - "aloo" / "potato" / "آلو" / "egg" / "انڈے" -> quantity: undefined, unit: undefined
 */
export function extractQuantityAndUnit(input: string): ExtractedQuantityResult {
  const originalInput = input;
  let normalizedInput = normalizeUrduDigits(input.trim());

  if (!normalizedInput) {
    return { cleanName: '', rawInput: originalInput };
  }

  let extractedQuantity: string | undefined;
  let extractedUnit: string | undefined;
  let extractedName = cleanConversationalPhrases(normalizedInput);

  // 1. Compound Pakistani Expressions (e.g. "sadhe teen kilo aloo", "paune do kilo piyaz", "half dozen eggs")
  const compoundRegex = new RegExp(`^(${ALL_COMPOUND_PHRASES})(?:\\s+(${ALL_UNIT_KEYS}))?\\s+(.+)$`, 'i');
  const compoundMatch = extractedName.match(compoundRegex);
  if (compoundMatch) {
    const matchedPhrase = compoundMatch[1].toLowerCase();
    const explicitUnit = compoundMatch[2]?.toLowerCase();
    const remaining = compoundMatch[3].trim();

    const compoundDef = COMPOUND_EXPRESSIONS_MAP[matchedPhrase];
    if (compoundDef) {
      extractedQuantity = compoundDef.quantity;
      if (explicitUnit && UNIT_MAP[explicitUnit]) {
        extractedUnit = UNIT_MAP[explicitUnit].standard;
      } else if (compoundDef.unit) {
        extractedUnit = compoundDef.unit;
      }
      extractedName = cleanPrepositions(remaining);
      return {
        cleanName: extractedName,
        quantity: extractedQuantity,
        unit: extractedUnit,
        rawInput: originalInput,
      };
    }
  }

  // 2. Multiplier pattern: "2x bread" or "3 x apples"
  const leadingMultiplierMatch = extractedName.match(/^(\d+)\s*x\s+(.+)$/i);
  if (leadingMultiplierMatch) {
    extractedQuantity = leadingMultiplierMatch[1];
    extractedUnit = 'piece';
    extractedName = cleanPrepositions(leadingMultiplierMatch[2]);
    return { cleanName: extractedName, quantity: extractedQuantity, unit: extractedUnit, rawInput: originalInput };
  }

  // 3. Attached leading: "500g sugar", "1kg aloo", "2l milk", "1کلو آلو"
  const attachedLeadingMatch = extractedName.match(
    new RegExp(`^(\\d+(?:\\.\\d+)?|\\d+\\/\\d+)(${ALL_UNIT_KEYS})\\s+(.+)$`, 'i')
  );
  if (attachedLeadingMatch) {
    const rawQty = normalizeFractionToDecimal(attachedLeadingMatch[1]);
    const rawUnit = attachedLeadingMatch[2].toLowerCase();
    const remName = cleanPrepositions(attachedLeadingMatch[3]);

    extractedQuantity = rawQty;
    if (UNIT_MAP[rawUnit]) {
      extractedUnit = UNIT_MAP[rawUnit].standard;
    }
    extractedName = remName;
    return { cleanName: extractedName, quantity: extractedQuantity, unit: extractedUnit, rawInput: originalInput };
  }

  // 4. Attached trailing: "sugar 500g", "aloo 1kg", "milk 2l", "آلو 1کلو"
  const attachedTrailingMatch = extractedName.match(
    new RegExp(`^(.+?)\\s+(\\d+(?:\\.\\d+)?|\\d+\\/\\d+)(${ALL_UNIT_KEYS})$`, 'i')
  );
  if (attachedTrailingMatch) {
    const remName = cleanPrepositions(attachedTrailingMatch[1]);
    const rawQty = normalizeFractionToDecimal(attachedTrailingMatch[2]);
    const rawUnit = attachedTrailingMatch[3].toLowerCase();

    extractedQuantity = rawQty;
    if (UNIT_MAP[rawUnit]) {
      extractedUnit = UNIT_MAP[rawUnit].standard;
    }
    extractedName = remName;
    return { cleanName: extractedName, quantity: extractedQuantity, unit: extractedUnit, rawInput: originalInput };
  }

  // 5. Leading Quantity WITH Explicit Unit (e.g. "2 kg aloo", "1 kg piyaz", "aadha kilo aloo", "ایک کلو آلو", "1 bottle oil", "3 packets biscuits")
  const leadingWithUnitRegex = new RegExp(
    `^(${NUMBER_TOKEN_REGEX_PART})\\s*(${ALL_UNIT_KEYS})\\s+(.+)$`,
    'i'
  );
  const leadWithUnitMatch = extractedName.match(leadingWithUnitRegex);
  if (leadWithUnitMatch) {
    const rawQtyToken = leadWithUnitMatch[1].toLowerCase().trim();
    const rawUnitToken = leadWithUnitMatch[2].toLowerCase().trim();
    const remainingName = cleanPrepositions(leadWithUnitMatch[3]);

    const mappedQty = WORD_NUMBER_MAP[rawQtyToken] || normalizeFractionToDecimal(rawQtyToken);
    extractedQuantity = mappedQty;
    if (UNIT_MAP[rawUnitToken]) {
      extractedUnit = UNIT_MAP[rawUnitToken].standard;
    }
    extractedName = remainingName;
    return { cleanName: extractedName, quantity: extractedQuantity, unit: extractedUnit, rawInput: originalInput };
  }

  // 6. Trailing Quantity WITH Explicit Unit (e.g. "aloo 2 kg", "piyaz 1 kg", "آلو ایک کلو", "چاول ڈیڑھ کلو")
  const trailingWithUnitRegex = new RegExp(
    `^(.+?)\\s+(${NUMBER_TOKEN_REGEX_PART})\\s*(${ALL_UNIT_KEYS})$`,
    'i'
  );
  const trailWithUnitMatch = extractedName.match(trailingWithUnitRegex);
  if (trailWithUnitMatch) {
    const namePart = cleanPrepositions(trailWithUnitMatch[1]);
    const rawQtyToken = trailWithUnitMatch[2].toLowerCase().trim();
    const rawUnitToken = trailWithUnitMatch[3].toLowerCase().trim();

    const mappedQty = WORD_NUMBER_MAP[rawQtyToken] || normalizeFractionToDecimal(rawQtyToken);
    extractedQuantity = mappedQty;
    if (UNIT_MAP[rawUnitToken]) {
      extractedUnit = UNIT_MAP[rawUnitToken].standard;
    }
    extractedName = namePart;
    return { cleanName: extractedName, quantity: extractedQuantity, unit: extractedUnit, rawInput: originalInput };
  }

  // 7. Standalone Leading Unit without explicit count (e.g. "darjan anday" => 1 dozen anday, "gaddi dhaniya" => 1 bundle dhaniya, "درجن انڈے")
  const singleUnitLead = extractedName.match(/^(darjan|dozen|درجن|gaddi|gatti|گڈی|bottle|بوتل|packet|پیکٹ)\s+(.+)$/i);
  if (singleUnitLead) {
    const uToken = singleUnitLead[1].toLowerCase();
    extractedQuantity = '1';
    extractedUnit = UNIT_MAP[uToken]?.standard || uToken;
    extractedName = cleanPrepositions(singleUnitLead[2]);
    return { cleanName: extractedName, quantity: extractedQuantity, unit: extractedUnit, rawInput: originalInput };
  }

  // 8. Leading Count WITHOUT Unit (e.g. "6 eggs", "1 bread", "2 aloo", "چھ انڈے", "دو ڈبل روٹی")
  const leadingCountOnlyRegex = new RegExp(
    `^(${NUMBER_TOKEN_REGEX_PART})\\s+(.+)$`,
    'i'
  );
  const leadCountMatch = extractedName.match(leadingCountOnlyRegex);
  if (leadCountMatch) {
    const rawQtyToken = leadCountMatch[1].toLowerCase().trim();
    const remainingName = cleanPrepositions(leadCountMatch[2]);

    const mappedQty = WORD_NUMBER_MAP[rawQtyToken] || normalizeFractionToDecimal(rawQtyToken);
    extractedQuantity = mappedQty;
    extractedName = remainingName;
    return { cleanName: extractedName, quantity: extractedQuantity, unit: undefined, rawInput: originalInput };
  }

  // 9. Trailing Count WITHOUT Unit (e.g. "bread 2", "eggs 6", "انڈے 6")
  const trailingCountOnlyRegex = new RegExp(
    `^(.+?)\\s+(${NUMBER_TOKEN_REGEX_PART})$`,
    'i'
  );
  const trailCountMatch = extractedName.match(trailingCountOnlyRegex);
  if (trailCountMatch) {
    const namePart = cleanPrepositions(trailCountMatch[1]);
    const rawQtyToken = trailCountMatch[2].toLowerCase().trim();

    const mappedQty = WORD_NUMBER_MAP[rawQtyToken] || normalizeFractionToDecimal(rawQtyToken);
    extractedQuantity = mappedQty;
    extractedName = namePart;
    return { cleanName: extractedName, quantity: extractedQuantity, unit: undefined, rawInput: originalInput };
  }

  // Fallback: No quantity or unit detected
  return { cleanName: extractedName, quantity: undefined, unit: undefined, rawInput: originalInput };
}
