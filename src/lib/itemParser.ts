import { CategoryId } from '../types';
import { categorizeItemLocally } from './categorizer';

export interface ParsedItemResult {
  name: string;
  quantity?: string;
  unit?: string;
  rawInput: string;
  suggestedCategoryId: CategoryId;
}

// Unit normalization map (English, Roman Urdu, Urdu script)
const UNIT_MAP: Record<string, { standard: string; label: string }> = {
  // Weight - kg
  kg: { standard: 'kg', label: 'kg' },
  kgs: { standard: 'kg', label: 'kg' },
  kilo: { standard: 'kg', label: 'kg' },
  kilos: { standard: 'kg', label: 'kg' },
  kilogram: { standard: 'kg', label: 'kg' },
  kilograms: { standard: 'kg', label: 'kg' },
  'کلو': { standard: 'kg', label: 'کلو' },

  // Weight - grams
  g: { standard: 'g', label: 'g' },
  gm: { standard: 'g', label: 'g' },
  gms: { standard: 'g', label: 'g' },
  gram: { standard: 'g', label: 'g' },
  grams: { standard: 'g', label: 'g' },
  'گرام': { standard: 'g', label: 'گرام' },
  mg: { standard: 'mg', label: 'mg' },

  // Volume - Liters
  l: { standard: 'l', label: 'L' },
  lt: { standard: 'l', label: 'L' },
  ltr: { standard: 'l', label: 'L' },
  ltrs: { standard: 'l', label: 'L' },
  liter: { standard: 'l', label: 'L' },
  liters: { standard: 'l', label: 'L' },
  litre: { standard: 'l', label: 'L' },
  litres: { standard: 'l', label: 'L' },
  'لیٹر': { standard: 'l', label: 'لیٹر' },

  // Volume - ml
  ml: { standard: 'ml', label: 'ml' },
  mls: { standard: 'ml', label: 'ml' },
  milli: { standard: 'ml', label: 'ml' },
  'ملی': { standard: 'ml', label: 'ملی' },

  // Count - Dozen
  dozen: { standard: 'dozen', label: 'dozen' },
  doz: { standard: 'dozen', label: 'dozen' },
  darjan: { standard: 'dozen', label: 'darjan' },
  'درجن': { standard: 'dozen', label: 'درجن' },

  // Packaging
  packet: { standard: 'packet', label: 'pkt' },
  packets: { standard: 'packet', label: 'pkts' },
  pkt: { standard: 'packet', label: 'pkt' },
  pkts: { standard: 'packet', label: 'pkts' },
  pack: { standard: 'packet', label: 'pack' },
  packs: { standard: 'packet', label: 'packs' },
  'پیکٹ': { standard: 'packet', label: 'پیکٹ' },

  bottle: { standard: 'bottle', label: 'bottle' },
  bottles: { standard: 'bottle', label: 'bottles' },
  'بوتل': { standard: 'bottle', label: 'بوتل' },

  box: { standard: 'box', label: 'box' },
  boxes: { standard: 'box', label: 'boxes' },
  'ڈبہ': { standard: 'box', label: 'ڈبہ' },
  'ڈبے': { standard: 'box', label: 'ڈبے' },

  can: { standard: 'can', label: 'can' },
  cans: { standard: 'can', label: 'cans' },
  'کین': { standard: 'can', label: 'کین' },

  bunch: { standard: 'bunch', label: 'bunch' },
  bunches: { standard: 'bunch', label: 'bunches' },
  gaddi: { standard: 'bunch', label: 'gaddi' },
  gatti: { standard: 'bunch', label: 'gaddi' },
  'گڈی': { standard: 'bunch', label: 'گڈی' },

  piece: { standard: 'pcs', label: 'pcs' },
  pieces: { standard: 'pcs', label: 'pcs' },
  pcs: { standard: 'pcs', label: 'pcs' },
  pc: { standard: 'pcs', label: 'pc' },
  'دانہ': { standard: 'pcs', label: 'دانہ' },
  'عدد': { standard: 'pcs', label: 'عدد' },
  adad: { standard: 'pcs', label: 'adad' },

  // South Asian specific weights
  pao: { standard: 'pao', label: 'pao' },
  paao: { standard: 'pao', label: 'pao' },
  'پاؤ': { standard: 'pao', label: 'پاؤ' },
  seer: { standard: 'seer', label: 'ser' },
  ser: { standard: 'seer', label: 'ser' },
};

// Word number to digit mapping
const WORD_NUMBER_MAP: Record<string, string> = {
  half: '1/2',
  adha: '1/2',
  aadha: '1/2',
  'آدھا': '1/2',
  quarter: '1/4',
  paona: '3/4',
  powna: '3/4',
  one: '1',
  ek: '1',
  aik: '1',
  'ایک': '1',
  two: '2',
  do: '2',
  'دو': '2',
  three: '3',
  teen: '3',
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
  'چھ': '6',
  seven: '7',
  saath: '7',
  sat: '7',
  'سات': '7',
  eight: '8',
  aath: '8',
  ath: '8',
  'آٹھ': '8',
  nine: '9',
  nau: '9',
  'نو': '9',
  ten: '10',
  das: '10',
  'دس': '10',
};

/**
 * Capitalizes first letter of each Latin word while preserving Urdu scripts.
 */
function formatItemTitle(str: string): string {
  if (!str) return '';
  return str
    .split(' ')
    .filter(Boolean)
    .map((w) => {
      // If contains Urdu / Arabic characters, return as is
      if (/[\u0600-\u06FF]/.test(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * High-accuracy natural language parser for shopping items.
 * Understands:
 * - "1 kg aloo" -> quantity: "1", unit: "kg", name: "Aloo"
 * - "2 dozen eggs" -> quantity: "2", unit: "dozen", name: "Eggs"
 * - "500g chicken" -> quantity: "500", unit: "g", name: "Chicken"
 * - "ek darjan anday" -> quantity: "1", unit: "dozen", name: "Anday"
 * - "half kg pyaz" -> quantity: "1/2", unit: "kg", name: "Pyaz"
 * - "aloo 2 kg" -> quantity: "2", unit: "kg", name: "Aloo"
 * - "3x bread" -> quantity: "3", unit: "x", name: "Bread"
 * - "aloo" -> name: "Aloo"
 */
export function parseShoppingItem(rawInput: string): ParsedItemResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      name: '',
      rawInput: '',
      suggestedCategoryId: 'other',
    };
  }

  let extractedQuantity: string | undefined;
  let extractedUnit: string | undefined;
  let extractedName = trimmed;

  // 1. Check for leading multiplier pattern like "2x apple" or "3 x apple"
  const leadingMultiplierMatch = extractedName.match(/^(\d+)\s*x\s+(.+)$/i);
  if (leadingMultiplierMatch) {
    extractedQuantity = leadingMultiplierMatch[1];
    extractedUnit = 'x';
    extractedName = leadingMultiplierMatch[2].trim();
  }

  // 2. Check for leading quantity & unit pattern like "1 kg aloo", "500g chicken", "2 dozen eggs", "1.5 ltr milk"
  if (!extractedQuantity) {
    // Pattern: [Number or Fraction or WordNumber] [Optional Unit] [Item Name]
    // Example: "1 kg aloo", "1kg aloo", "2 dozen eggs", "half kg tomatoes", "1/2 kg pyaz"
    const leadingQtyUnitRegex =
      /^(\d+(?:\.\d+)?|\d+\/\d+|half|adha|aadha|آدھا|one|ek|aik|ایک|two|do|دو|three|teen|تین|four|char|chaar|چار|five|paanch|panch|پانچ|six|chhe|che|چھ|seven|saath|sat|سات|eight|aath|ath|آٹھ|nine|nau|نو|ten|das|دس)\s*([a-zA-Z\u0600-\u06FF]+)?\s+(.+)$/i;

    const match = extractedName.match(leadingQtyUnitRegex);
    if (match) {
      const rawQtyToken = match[1].toLowerCase();
      const rawUnitToken = (match[2] || '').toLowerCase();
      const remainingName = match[3].trim();

      // Normalize quantity
      const normQty = WORD_NUMBER_MAP[rawQtyToken] || rawQtyToken;

      // Check if rawUnitToken is a recognized unit
      if (rawUnitToken && UNIT_MAP[rawUnitToken]) {
        extractedQuantity = normQty;
        extractedUnit = UNIT_MAP[rawUnitToken].label;
        extractedName = remainingName;
      } else if (!rawUnitToken && remainingName) {
        // e.g. "2 apples" -> quantity: 2, name: apples
        extractedQuantity = normQty;
        extractedName = remainingName;
      } else if (rawUnitToken && !UNIT_MAP[rawUnitToken]) {
        // e.g. "1 red apple" -> "1" is qty, "red apple" is name
        extractedQuantity = normQty;
        extractedName = `${match[2]} ${remainingName}`.trim();
      }
    }
  }

  // 3. Check for trailing quantity pattern like "aloo 2 kg" or "milk 1.5 ltr" or "eggs 2 dozen"
  if (!extractedQuantity) {
    const trailingQtyRegex =
      /^(.+?)\s+(\d+(?:\.\d+)?|\d+\/\d+|half|adha|one|ek|two|do|three|teen)\s*([a-zA-Z\u0600-\u06FF]+)?$/i;
    const match = extractedName.match(trailingQtyRegex);
    if (match) {
      const namePart = match[1].trim();
      const rawQtyToken = match[2].toLowerCase();
      const rawUnitToken = (match[3] || '').toLowerCase();

      if (rawUnitToken && UNIT_MAP[rawUnitToken]) {
        extractedQuantity = WORD_NUMBER_MAP[rawQtyToken] || rawQtyToken;
        extractedUnit = UNIT_MAP[rawUnitToken].label;
        extractedName = namePart;
      } else if (rawQtyToken && !rawUnitToken) {
        extractedQuantity = WORD_NUMBER_MAP[rawQtyToken] || rawQtyToken;
        extractedName = namePart;
      }
    }
  }

  // 4. Check for standalone unit keywords like "darjan anday" -> "1 dozen anday"
  if (!extractedQuantity) {
    const singleUnitLead = extractedName.match(/^(darjan|dozen|درجن|gaddi|گڈی)\s+(.+)$/i);
    if (singleUnitLead) {
      const uToken = singleUnitLead[1].toLowerCase();
      extractedQuantity = '1';
      extractedUnit = UNIT_MAP[uToken]?.label || uToken;
      extractedName = singleUnitLead[2].trim();
    }
  }

  // Clean and format item name
  const formattedName = formatItemTitle(extractedName);

  // Categorize item using both parsed clean name and full input
  const localCheck = categorizeItemLocally(extractedName);
  const suggestedCategoryId = localCheck.categoryId;

  return {
    name: formattedName || trimmed,
    quantity: extractedQuantity,
    unit: extractedUnit,
    rawInput: trimmed,
    suggestedCategoryId,
  };
}
