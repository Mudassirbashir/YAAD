import { BarcodeFormat } from './types';

/**
 * Normalizes a raw scanned or manually entered barcode string.
 * CRITICAL: Preserves all leading zeros by treating the barcode strictly as a string.
 */
export function normalizeBarcode(raw: string | null | undefined): string {
  if (!raw) return '';
  return raw
    .toString()
    .trim()
    .replace(/[\s\-_]/g, '')
    .replace(/[^\x20-\x7E]/g, '');
}

/**
 * Expands an 8-digit or 6-digit UPC-E code to its standard 12-digit UPC-A equivalent,
 * according to official GS1 specifications.
 * Returns null if the code is not a valid UPC-E structure.
 */
export function expandUpcEToUpcA(upcE: string): string | null {
  const clean = normalizeBarcode(upcE);
  if (!/^\d{6,8}$/.test(clean)) return null;

  let ns = '0';
  let data = '';
  let check = '';

  if (clean.length === 8) {
    ns = clean[0];
    data = clean.slice(1, 7);
    check = clean[7];
  } else if (clean.length === 7) {
    if (clean[0] === '0' || clean[0] === '1') {
      ns = clean[0];
      data = clean.slice(1);
    } else {
      data = clean.slice(0, 6);
      check = clean[6];
    }
  } else if (clean.length === 6) {
    data = clean;
  }

  // Number system must be 0 or 1 for UPC-E
  if (ns !== '0' && ns !== '1') return null;

  const [d1, d2, d3, d4, d5, d6] = data.split('');
  let manufacturer = '';
  let product = '';

  if (d6 === '0' || d6 === '1' || d6 === '2') {
    manufacturer = d1 + d2 + d6 + '00';
    product = '00' + d3 + d4 + d5;
  } else if (d6 === '3') {
    manufacturer = d1 + d2 + d3 + '00';
    product = '000' + d4 + d5;
  } else if (d6 === '4') {
    manufacturer = d1 + d2 + d3 + d4 + '0';
    product = '0000' + d5;
  } else {
    // d6 is '5', '6', '7', '8', or '9'
    manufacturer = d1 + d2 + d3 + d4 + d5;
    product = '0000' + d6;
  }

  const payload = ns + manufacturer + product;

  // If check digit was not provided in input, calculate it via GS1 Modulo 10
  if (!check) {
    let sum = 0;
    let weight = 3;
    for (let i = payload.length - 1; i >= 0; i--) {
      sum += parseInt(payload[i], 10) * weight;
      weight = weight === 3 ? 1 : 3;
    }
    check = String((10 - (sum % 10)) % 10);
  }

  return payload + check;
}

/**
 * Checks if the barcode length and format corresponds to a fixed-length GS1 GTIN.
 */
export function isGTINFormat(clean: string): boolean {
  return /^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(clean);
}

/**
 * Detects the standard barcode format based on length and character set.
 */
export function detectBarcodeFormat(barcode: string): BarcodeFormat {
  const clean = normalizeBarcode(barcode);
  if (!clean) return 'UNKNOWN';

  const isNumericOnly = /^\d+$/.test(clean);

  if (isNumericOnly) {
    if (clean.length === 6 || clean.length === 7) {
      if ((clean.startsWith('0') || clean.startsWith('1')) && expandUpcEToUpcA(clean)) {
        return 'UPC-E';
      }
    }
    if (clean.length === 8) {
      // 8-digit numeric: can be EAN-8 or UPC-E (starts with 0 or 1)
      if ((clean.startsWith('0') || clean.startsWith('1')) && expandUpcEToUpcA(clean)) {
        // If it starts with 0/1 and matches UPC-E expansion, detect as UPC-E or EAN-8
        // Check if EAN-8 check digit matches
        if (validateGS1CheckDigit(clean)) {
          return 'EAN-8';
        }
        return 'UPC-E';
      }
      return 'EAN-8';
    }
    if (clean.length === 12) return 'UPC-A';
    if (clean.length === 13) return 'EAN-13';
    if (clean.length === 14) return 'ITF';
    // Variable length numeric can be general ITF
    if (clean.length >= 6 && clean.length % 2 === 0) return 'ITF';
  }

  // Standard CODE-39 character set strictly contains uppercase 0-9, A-Z, and symbols (- . $ / + %)
  if (/^[0-9A-Z\-.$/+% ]+$/.test(clean)) {
    return 'CODE-39';
  }

  // CODE-128 supports the full 128 ASCII character set, including lowercase a-z
  if (/^[\x00-\x7F]+$/.test(clean)) {
    return 'CODE-128';
  }

  return 'UNKNOWN';
}

/**
 * Validates standard GS1 Modulo 10 check digit strictly for GTIN formats
 * (EAN-13, EAN-8, UPC-A, ITF-14).
 * Returns true for non-GTIN formats (e.g. CODE-128, CODE-39) as they do not use GTIN Modulo 10.
 */
export function validateGS1CheckDigit(barcode: string): boolean {
  const clean = normalizeBarcode(barcode);
  if (!isGTINFormat(clean)) {
    // Not a standard GS1 GTIN, do not apply GTIN checksum assumptions
    return true;
  }

  const digits = clean.split('').map((d) => parseInt(d, 10));
  const checkDigit = digits[digits.length - 1];
  const payload = digits.slice(0, digits.length - 1);

  // GS1 Modulo 10: From right to left of payload, weights alternate 3 and 1
  let sum = 0;
  let weight = 3;
  for (let i = payload.length - 1; i >= 0; i--) {
    sum += payload[i] * weight;
    weight = weight === 3 ? 1 : 3;
  }

  const calculatedCheck = (10 - (sum % 10)) % 10;
  return calculatedCheck === checkDigit;
}

/**
 * Checks whether a barcode string is sufficiently valid to query a retail product database.
 */
export function isValidRetailBarcode(raw: string): {
  valid: boolean;
  cleanBarcode: string;
  format: BarcodeFormat;
  reason?: string;
} {
  const clean = normalizeBarcode(raw);
  if (!clean) {
    return { valid: false, cleanBarcode: '', format: 'UNKNOWN', reason: 'Barcode is empty' };
  }

  if (clean.length < 4 || clean.length > 48) {
    return {
      valid: false,
      cleanBarcode: clean,
      format: 'UNKNOWN',
      reason: `Barcode length (${clean.length}) is outside the retail standard range (4-48 chars)`,
    };
  }

  const format = detectBarcodeFormat(clean);
  const isGTIN = isGTINFormat(clean);
  const isValidChecksum = validateGS1CheckDigit(clean);

  return {
    valid: true,
    cleanBarcode: clean,
    format,
    reason: isGTIN && !isValidChecksum ? 'Warning: GTIN check digit mismatch' : undefined,
  };
}
