/**
 * Comprehensive phone number validation and formatting utility for YAAD.
 * Adheres strictly to international E.164 recommendations:
 * - Supports international numbers (+92, +1, +44, +971, etc.)
 * - Flexible entry with optional formatting spaces, hyphens, and parentheses
 * - Rejects letters and invalid symbols
 * - Verifies minimum (7) and maximum (15) digit lengths
 */

export interface PhoneValidationResult {
  isValid: boolean;
  valid?: boolean;
  error?: string;
  reason?: string;
  cleaned?: string;
}

export interface CountryCodeOption {
  code: string;
  name: string;
  flag: string;
  placeholder: string;
}

export const COMMON_COUNTRY_CODES: CountryCodeOption[] = [
  { code: '+92', name: 'Pakistan', flag: '🇵🇰', placeholder: '300 1234567' },
  { code: '+1', name: 'United States / Canada', flag: '🇺🇸', placeholder: '555 123 4567' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧', placeholder: '7911 123456' },
  { code: '+971', name: 'United Arab Emirates', flag: '🇦🇪', placeholder: '50 123 4567' },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦', placeholder: '50 123 4567' },
  { code: '+91', name: 'India', flag: '🇮🇳', placeholder: '98765 43210' },
  { code: '+61', name: 'Australia', flag: '🇦🇺', placeholder: '412 345 678' },
  { code: '+49', name: 'Germany', flag: '🇩🇪', placeholder: '151 23456789' },
  { code: '', name: 'Other (International)', flag: '🌐', placeholder: '+1 234 567 8900' },
];

/**
 * Strips formatting noise (spaces, dashes, parentheses, dots) while preserving the leading plus.
 */
export function cleanPhoneNumber(rawPhone: string): string {
  if (!rawPhone) return '';
  const trimmed = rawPhone.trim();

  // If starts with 00, convert international prefix to +
  let normalized = trimmed;
  if (normalized.startsWith('00')) {
    normalized = '+' + normalized.slice(2);
  }

  // Preserve leading plus if present
  const hasPlus = normalized.startsWith('+');
  const digitsOnly = normalized.replace(/\D/g, '');

  return hasPlus ? `+${digitsOnly}` : digitsOnly;
}

/**
 * Validates the phone number according to international requirements.
 */
export function validatePhoneNumber(rawPhone: string, isRequired: boolean = true): PhoneValidationResult {
  const trimmed = (rawPhone || '').trim();

  if (!trimmed) {
    if (!isRequired) {
      return { isValid: true, valid: true, cleaned: '' };
    }
    return { isValid: false, valid: false, error: 'Phone number is required.', reason: 'Phone number is required.' };
  }

  // Reject any letters
  if (/[a-zA-Z]/.test(trimmed)) {
    return { isValid: false, valid: false, error: 'Phone number must not contain letters.', reason: 'Phone number must not contain letters.' };
  }

  // Reject invalid special characters (allow only +, -, (, ), ., and spaces)
  if (/[^0-9+\s\-().]/.test(trimmed)) {
    return { isValid: false, valid: false, error: 'Phone number contains invalid characters.', reason: 'Phone number contains invalid characters.' };
  }

  const cleaned = cleanPhoneNumber(trimmed);
  const digits = cleaned.replace(/\D/g, '');

  if (digits.length < 7) {
    return {
      isValid: false,
      valid: false,
      error: 'Phone number is too short (at least 7 digits required).',
      reason: 'Phone number is too short (at least 7 digits required).',
    };
  }

  if (digits.length > 15) {
    return {
      isValid: false,
      valid: false,
      error: 'Phone number is too long (maximum 15 digits allowed).',
      reason: 'Phone number is too long (maximum 15 digits allowed).',
    };
  }

  return { isValid: true, valid: true, cleaned };
}

/**
 * Nicely formats a phone number for user display.
 * e.g. +923001234567 -> +92 300 1234567
 */
export function formatPhoneNumberForDisplay(phone: string | null | undefined): string {
  if (!phone) return '';
  const cleaned = cleanPhoneNumber(phone);
  if (!cleaned) return '';

  // If Pakistani format +92XXXXXXXXXX
  if (cleaned.startsWith('+92') && cleaned.length === 13) {
    return `+92 ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }

  // If US/Canada format +1XXXXXXXXXX
  if (cleaned.startsWith('+1') && cleaned.length === 12) {
    return `+1 (${cleaned.slice(2, 5)}) ${cleaned.slice(5, 8)}-${cleaned.slice(8)}`;
  }

  // If UK format +44XXXXXXXXXX
  if (cleaned.startsWith('+44') && cleaned.length >= 12) {
    return `+44 ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  }

  // General international spacing: groups of 3-4
  if (cleaned.startsWith('+')) {
    const withoutPlus = cleaned.slice(1);
    if (withoutPlus.length <= 9) {
      return `+${withoutPlus.slice(0, 2)} ${withoutPlus.slice(2)}`;
    }
    return `+${withoutPlus.slice(0, 2)} ${withoutPlus.slice(2, 5)} ${withoutPlus.slice(5)}`;
  }

  return cleaned;
}

export const formatPhoneNumber = formatPhoneNumberForDisplay;
