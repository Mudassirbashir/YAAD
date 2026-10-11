import { BarcodeFormat, NormalizedBarcode } from './types';

/**
 * Validates Modulo 10 Check Digit for standard numeric barcodes.
 * weights: alternating array of multipliers for digits before check digit.
 */
export function calculateModulo10CheckDigit(digits: string, weights: number[]): number {
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    const d = parseInt(digits[i], 10);
    if (isNaN(d)) return -1;
    sum += d * weights[i];
  }
  return (10 - (sum % 10)) % 10;
}

/**
 * Validates EAN-13 checksum.
 * 13 digits. Weights for first 12 digits: alternating 1, 3, 1, 3...
 */
export function validateEAN13Checksum(code: string): boolean {
  if (!/^\d{13}$/.test(code)) return false;
  const weights = [1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3];
  const expectedCheck = calculateModulo10CheckDigit(code.slice(0, 12), weights);
  return expectedCheck === parseInt(code[12], 10);
}

/**
 * Validates UPC-A checksum.
 * 12 digits. Weights for first 11 digits: alternating 3, 1, 3, 1...
 */
export function validateUPCAChecksum(code: string): boolean {
  if (!/^\d{12}$/.test(code)) return false;
  const weights = [3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3];
  const expectedCheck = calculateModulo10CheckDigit(code.slice(0, 11), weights);
  return expectedCheck === parseInt(code[11], 10);
}

/**
 * Validates EAN-8 checksum.
 * 8 digits. Weights for first 7 digits: alternating 3, 1, 3, 1, 3, 1, 3.
 */
export function validateEAN8Checksum(code: string): boolean {
  if (!/^\d{8}$/.test(code)) return false;
  const weights = [3, 1, 3, 1, 3, 1, 3];
  const expectedCheck = calculateModulo10CheckDigit(code.slice(0, 7), weights);
  return expectedCheck === parseInt(code[7], 10);
}

/**
 * Validates ITF-14 checksum.
 * 14 digits. Weights for first 13 digits: alternating 3, 1, 3, 1...
 */
export function validateITF14Checksum(code: string): boolean {
  if (!/^\d{14}$/.test(code)) return false;
  const weights = [3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3];
  const expectedCheck = calculateModulo10CheckDigit(code.slice(0, 13), weights);
  return expectedCheck === parseInt(code[13], 10);
}

/**
 * Expands a 6-digit UPC-E payload to a 12-digit UPC-A string.
 * @param upce6 - The 6 core digits
 * @param numberSystem - '0' or '1' (default '0')
 * @returns 12-digit UPC-A string or null if invalid
 */
export function expandUPCEToUPCA(upce6: string, numberSystem: '0' | '1' = '0'): string | null {
  if (!/^\d{6}$/.test(upce6)) return null;

  const d1 = upce6[0];
  const d2 = upce6[1];
  const d3 = upce6[2];
  const d4 = upce6[3];
  const d5 = upce6[4];
  const d6 = upce6[5];

  let mfg = '';
  let prod = '';

  if (d6 === '0' || d6 === '1' || d6 === '2') {
    mfg = `${d1}${d2}${d6}00`;
    prod = `00${d3}${d4}${d5}`;
  } else if (d6 === '3') {
    mfg = `${d1}${d2}${d3}00`;
    prod = `000${d4}${d5}`;
  } else if (d6 === '4') {
    mfg = `${d1}${d2}${d3}${d4}0`;
    prod = `0000${d5}`;
  } else {
    // d6 is '5', '6', '7', '8', '9'
    mfg = `${d1}${d2}${d3}${d4}${d5}`;
    prod = `0000${d6}`;
  }

  const prefix11 = `${numberSystem}${mfg}${prod}`;
  const weights = [3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3];
  const checkDigit = calculateModulo10CheckDigit(prefix11, weights);
  if (checkDigit < 0) return null;

  return `${prefix11}${checkDigit}`;
}

/**
 * Normalizes and validates any raw barcode input.
 * Preserves leading zeros, standardizes formats, and computes conversions.
 */
export function normalizeBarcode(rawInput: string, hintFormat?: BarcodeFormat): NormalizedBarcode {
  if (!rawInput || typeof rawInput !== 'string') {
    return {
      raw: '',
      normalized: '',
      format: 'UNKNOWN',
      isValid: false,
      error: 'Empty barcode input',
    };
  }

  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      raw: rawInput,
      normalized: '',
      format: 'UNKNOWN',
      isValid: false,
      error: 'Empty barcode input',
    };
  }

  const hasLetters = /[A-Za-z]/.test(trimmed);

  // 1. Alphanumeric barcodes (CODE-128, CODE-39)
  if (hasLetters) {
    if (/^[A-Za-z0-9\.\$\/\+\%\*\-\s]+$/.test(trimmed)) {
      const format: BarcodeFormat =
        hintFormat === 'CODE_39'
          ? 'CODE_39'
          : hintFormat === 'CODE_128'
          ? 'CODE_128'
          : 'CODE_128';

      return {
        raw: rawInput,
        normalized: trimmed,
        format,
        isValid: true,
      };
    }

    return {
      raw: rawInput,
      normalized: trimmed,
      format: 'UNKNOWN',
      isValid: false,
      error: 'Contains invalid characters for barcode format',
    };
  }

  // 2. Pure Numeric Barcodes (strip spaces and hyphens from numeric formatted codes)
  const cleaned = trimmed.replace(/[\s\-]/g, '');

  if (!cleaned) {
    return {
      raw: rawInput,
      normalized: '',
      format: 'UNKNOWN',
      isValid: false,
      error: 'Barcode contains only whitespace or formatting characters',
    };
  }

  const isAllDigits = /^\d+$/.test(cleaned);
  if (!isAllDigits) {
    return {
      raw: rawInput,
      normalized: cleaned,
      format: 'UNKNOWN',
      isValid: false,
      error: 'Contains invalid characters for barcode format',
    };
  }

  // 2. Pure Numeric Barcodes
  const len = cleaned.length;

  // 2a. EAN-13 (13 digits)
  if (len === 13) {
    const isValid = validateEAN13Checksum(cleaned);
    let upcAEquivalent: string | undefined;

    if (isValid && cleaned.startsWith('0')) {
      const candidateUPC = cleaned.slice(1);
      if (validateUPCAChecksum(candidateUPC)) {
        upcAEquivalent = candidateUPC;
      }
    }

    return {
      raw: rawInput,
      normalized: cleaned,
      format: 'EAN_13',
      isValid,
      error: isValid ? undefined : 'Invalid EAN-13 checksum',
      upcAEquivalent,
      ean13Equivalent: cleaned,
    };
  }

  // 2b. UPC-A (12 digits)
  if (len === 12) {
    const isValid = validateUPCAChecksum(cleaned);
    let ean13Equivalent: string | undefined;

    if (isValid) {
      const candidateEAN13 = '0' + cleaned;
      if (validateEAN13Checksum(candidateEAN13)) {
        ean13Equivalent = candidateEAN13;
      }
    }

    return {
      raw: rawInput,
      normalized: cleaned,
      format: 'UPC_A',
      isValid,
      error: isValid ? undefined : 'Invalid UPC-A checksum',
      upcAEquivalent: cleaned,
      ean13Equivalent,
    };
  }

  // 2c. ITF-14 (14 digits)
  if (len === 14) {
    const isValid = validateITF14Checksum(cleaned);
    return {
      raw: rawInput,
      normalized: cleaned,
      format: 'ITF',
      isValid,
      error: isValid ? undefined : 'Invalid ITF-14 checksum',
    };
  }

  // 2d. EAN-8 (8 digits) vs UPC-E (8 digits: system digit + 6 digits + check digit)
  if (len === 8) {
    // Check if it's a valid EAN-8 first
    const isEAN8 = validateEAN8Checksum(cleaned);

    // Check if it could be an 8-digit UPC-E (starts with 0 or 1)
    const sysDigit = cleaned[0];
    let isUPCE = false;
    let upcAEquivalent: string | undefined;

    if (sysDigit === '0' || sysDigit === '1') {
      const core6 = cleaned.slice(1, 7);
      const givenCheck = parseInt(cleaned[7], 10);
      const expanded = expandUPCEToUPCA(core6, sysDigit as '0' | '1');
      if (expanded && parseInt(expanded[11], 10) === givenCheck) {
        isUPCE = true;
        upcAEquivalent = expanded;
      }
    }

    // Disambiguate:
    // If explicitly hinted as UPC_E or if it validly expands to UPC-A and not valid EAN-8:
    if (hintFormat === 'UPC_E' && isUPCE) {
      return {
        raw: rawInput,
        normalized: cleaned,
        format: 'UPC_E',
        isValid: true,
        upcAEquivalent,
        ean13Equivalent: upcAEquivalent ? '0' + upcAEquivalent : undefined,
      };
    }

    if (isEAN8) {
      return {
        raw: rawInput,
        normalized: cleaned,
        format: 'EAN_8',
        isValid: true,
        upcAEquivalent: isUPCE ? upcAEquivalent : undefined,
      };
    }

    if (isUPCE) {
      return {
        raw: rawInput,
        normalized: cleaned,
        format: 'UPC_E',
        isValid: true,
        upcAEquivalent,
        ean13Equivalent: upcAEquivalent ? '0' + upcAEquivalent : undefined,
      };
    }

    return {
      raw: rawInput,
      normalized: cleaned,
      format: 'EAN_8',
      isValid: false,
      error: 'Invalid 8-digit checksum (neither valid EAN-8 nor valid UPC-E)',
    };
  }

  // 2e. 6-digit candidate for UPC-E
  if (len === 6) {
    // Only treat as UPC-E if it cleanly expands to a valid UPC-A with valid check digit
    const expanded = expandUPCEToUPCA(cleaned, '0');
    if (expanded && validateUPCAChecksum(expanded)) {
      return {
        raw: rawInput,
        normalized: cleaned,
        format: 'UPC_E',
        isValid: true,
        upcAEquivalent: expanded,
        ean13Equivalent: '0' + expanded,
      };
    }

    return {
      raw: rawInput,
      normalized: cleaned,
      format: 'UNKNOWN',
      isValid: false,
      error: '6-digit code does not conform to valid UPC-E compression standard',
    };
  }

  // 2f. 7-digit candidate
  if (len === 7) {
    // Could be 7-digit UPC-E (system digit 0 or 1 + 6 core digits)
    const sys = cleaned[0];
    if (sys === '0' || sys === '1') {
      const core6 = cleaned.slice(1);
      const expanded = expandUPCEToUPCA(core6, sys as '0' | '1');
      if (expanded && validateUPCAChecksum(expanded)) {
        return {
          raw: rawInput,
          normalized: cleaned,
          format: 'UPC_E',
          isValid: true,
          upcAEquivalent: expanded,
          ean13Equivalent: '0' + expanded,
        };
      }
    }

    return {
      raw: rawInput,
      normalized: cleaned,
      format: 'UNKNOWN',
      isValid: false,
      error: '7-digit code is not a valid barcode format',
    };
  }

  // Other numeric lengths (e.g. 10 digits or arbitrary length)
  return {
    raw: rawInput,
    normalized: cleaned,
    format: 'UNKNOWN',
    isValid: false,
    error: `Unsupported barcode length: ${len} digits`,
  };
}
