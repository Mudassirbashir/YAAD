export interface CountryData {
  iso: string;
  name: string;
  nameUrdu: string;
  dialCode: string;
  flag: string;
  placeholder: string;
  example: string;
  minDigits: number;
  maxDigits: number;
  exactDigits?: number;
}

export const COUNTRIES: CountryData[] = [
  {
    iso: 'PK',
    name: 'Pakistan',
    nameUrdu: 'پاکستان',
    dialCode: '+92',
    flag: '🇵🇰',
    placeholder: '300 1234567',
    example: '0300 1234567',
    minDigits: 10,
    maxDigits: 10,
    exactDigits: 10,
  },
  {
    iso: 'AE',
    name: 'United Arab Emirates',
    nameUrdu: 'متحدہ عرب امارات',
    dialCode: '+971',
    flag: '🇦🇪',
    placeholder: '50 123 4567',
    example: '050 123 4567',
    minDigits: 9,
    maxDigits: 9,
    exactDigits: 9,
  },
  {
    iso: 'SA',
    name: 'Saudi Arabia',
    nameUrdu: 'سعودی عرب',
    dialCode: '+966',
    flag: '🇸🇦',
    placeholder: '50 123 4567',
    example: '050 123 4567',
    minDigits: 9,
    maxDigits: 9,
    exactDigits: 9,
  },
  {
    iso: 'GB',
    name: 'United Kingdom',
    nameUrdu: 'برطانیہ',
    dialCode: '+44',
    flag: '🇬🇧',
    placeholder: '7911 123456',
    example: '07911 123456',
    minDigits: 10,
    maxDigits: 10,
    exactDigits: 10,
  },
  {
    iso: 'US',
    name: 'United States',
    nameUrdu: 'ریاستہائے متحدہ امریکہ',
    dialCode: '+1',
    flag: '🇺🇸',
    placeholder: '555 123 4567',
    example: '(555) 123-4567',
    minDigits: 10,
    maxDigits: 10,
    exactDigits: 10,
  },
  {
    iso: 'QA',
    name: 'Qatar',
    nameUrdu: 'قطر',
    dialCode: '+974',
    flag: '🇶🇦',
    placeholder: '3312 3456',
    example: '3312 3456',
    minDigits: 8,
    maxDigits: 8,
    exactDigits: 8,
  },
  {
    iso: 'OM',
    name: 'Oman',
    nameUrdu: 'عمان',
    dialCode: '+968',
    flag: '🇴🇲',
    placeholder: '9123 4567',
    example: '9123 4567',
    minDigits: 8,
    maxDigits: 8,
    exactDigits: 8,
  },
  {
    iso: 'AU',
    name: 'Australia',
    nameUrdu: 'آسٹریلیا',
    dialCode: '+61',
    flag: '🇦🇺',
    placeholder: '412 345 678',
    example: '0412 345 678',
    minDigits: 9,
    maxDigits: 9,
    exactDigits: 9,
  },
  {
    iso: 'CA',
    name: 'Canada',
    nameUrdu: 'کینیڈا',
    dialCode: '+1',
    flag: '🇨🇦',
    placeholder: '416 123 4567',
    example: '(416) 123-4567',
    minDigits: 10,
    maxDigits: 10,
    exactDigits: 10,
  },
  {
    iso: 'KW',
    name: 'Kuwait',
    nameUrdu: 'کویت',
    dialCode: '+965',
    flag: '🇰🇼',
    placeholder: '9123 4567',
    example: '9123 4567',
    minDigits: 8,
    maxDigits: 8,
    exactDigits: 8,
  },
  {
    iso: 'BH',
    name: 'Bahrain',
    nameUrdu: 'بحرین',
    dialCode: '+973',
    flag: '🇧🇭',
    placeholder: '3912 3456',
    example: '3912 3456',
    minDigits: 8,
    maxDigits: 8,
    exactDigits: 8,
  },
  {
    iso: 'IN',
    name: 'India',
    nameUrdu: 'بھارت',
    dialCode: '+91',
    flag: '🇮🇳',
    placeholder: '98765 43210',
    example: '98765 43210',
    minDigits: 10,
    maxDigits: 10,
    exactDigits: 10,
  },
  {
    iso: 'BD',
    name: 'Bangladesh',
    nameUrdu: 'بنگلہ دیش',
    dialCode: '+880',
    flag: '🇧🇩',
    placeholder: '1712 345678',
    example: '01712 345678',
    minDigits: 10,
    maxDigits: 10,
    exactDigits: 10,
  },
  {
    iso: 'MY',
    name: 'Malaysia',
    nameUrdu: 'ملائیشیا',
    dialCode: '+60',
    flag: '🇲🇾',
    placeholder: '12 345 6789',
    example: '012 345 6789',
    minDigits: 9,
    maxDigits: 10,
  },
  {
    iso: 'TR',
    name: 'Turkey',
    nameUrdu: 'ترکی',
    dialCode: '+90',
    flag: '🇹🇷',
    placeholder: '512 345 6789',
    example: '0512 345 6789',
    minDigits: 10,
    maxDigits: 10,
    exactDigits: 10,
  },
  {
    iso: 'SG',
    name: 'Singapore',
    nameUrdu: 'سنگاپور',
    dialCode: '+65',
    flag: '🇸🇬',
    placeholder: '8123 4567',
    example: '8123 4567',
    minDigits: 8,
    maxDigits: 8,
    exactDigits: 8,
  },
  {
    iso: 'DE',
    name: 'Germany',
    nameUrdu: 'جرمنی',
    dialCode: '+49',
    flag: '🇩🇪',
    placeholder: '151 12345678',
    example: '0151 12345678',
    minDigits: 10,
    maxDigits: 11,
  },
  {
    iso: 'FR',
    name: 'France',
    nameUrdu: 'فرانس',
    dialCode: '+33',
    flag: '🇫🇷',
    placeholder: '6 12 34 56 78',
    example: '06 12 34 56 78',
    minDigits: 9,
    maxDigits: 9,
    exactDigits: 9,
  },
  {
    iso: 'IE',
    name: 'Ireland',
    nameUrdu: 'آئرلینڈ',
    dialCode: '+353',
    flag: '🇮🇪',
    placeholder: '85 123 4567',
    example: '085 123 4567',
    minDigits: 9,
    maxDigits: 9,
    exactDigits: 9,
  },
  {
    iso: 'NZ',
    name: 'New Zealand',
    nameUrdu: 'نیوزی لینڈ',
    dialCode: '+64',
    flag: '🇳🇿',
    placeholder: '21 123 4567',
    example: '021 123 4567',
    minDigits: 8,
    maxDigits: 10,
  },
  {
    iso: 'ZA',
    name: 'South Africa',
    nameUrdu: 'جنوبی افریقہ',
    dialCode: '+27',
    flag: '🇿🇦',
    placeholder: '71 234 5678',
    example: '071 234 5678',
    minDigits: 9,
    maxDigits: 9,
    exactDigits: 9,
  },
  {
    iso: 'EG',
    name: 'Egypt',
    nameUrdu: 'مصر',
    dialCode: '+20',
    flag: '🇪🇬',
    placeholder: '100 123 4567',
    example: '0100 123 4567',
    minDigits: 10,
    maxDigits: 10,
    exactDigits: 10,
  },
  {
    iso: 'LK',
    name: 'Sri Lanka',
    nameUrdu: 'سری لنکا',
    dialCode: '+94',
    flag: '🇱🇰',
    placeholder: '71 234 5678',
    example: '071 234 5678',
    minDigits: 9,
    maxDigits: 9,
    exactDigits: 9,
  },
];

/**
 * Automatically detects the likely country using browser timezone & locale heuristics.
 * Respects user privacy: DOES NOT invoke GPS or request precise geolocation.
 */
export function detectUserCountry(): CountryData {
  try {
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const tzLower = timeZone.toLowerCase();

      if (tzLower.includes('karachi') || tzLower.includes('pakistan')) {
        return COUNTRIES.find((c) => c.iso === 'PK') || COUNTRIES[0];
      }
      if (tzLower.includes('dubai') || tzLower.includes('muscat') || tzLower.includes('emirates')) {
        return COUNTRIES.find((c) => c.iso === 'AE') || COUNTRIES[0];
      }
      if (tzLower.includes('riyadh') || tzLower.includes('saudi')) {
        return COUNTRIES.find((c) => c.iso === 'SA') || COUNTRIES[0];
      }
      if (tzLower.includes('london') || tzLower.includes('belfast')) {
        return COUNTRIES.find((c) => c.iso === 'GB') || COUNTRIES[0];
      }
      if (
        tzLower.includes('new_york') ||
        tzLower.includes('los_angeles') ||
        tzLower.includes('chicago') ||
        tzLower.includes('denver') ||
        tzLower.includes('phoenix') ||
        tzLower.includes('america')
      ) {
        return COUNTRIES.find((c) => c.iso === 'US') || COUNTRIES[0];
      }
      if (
        tzLower.includes('sydney') ||
        tzLower.includes('melbourne') ||
        tzLower.includes('brisbane') ||
        tzLower.includes('perth') ||
        tzLower.includes('australia')
      ) {
        return COUNTRIES.find((c) => c.iso === 'AU') || COUNTRIES[0];
      }
      if (tzLower.includes('qatar') || tzLower.includes('doha')) {
        return COUNTRIES.find((c) => c.iso === 'QA') || COUNTRIES[0];
      }
      if (tzLower.includes('muscat') || tzLower.includes('oman')) {
        return COUNTRIES.find((c) => c.iso === 'OM') || COUNTRIES[0];
      }
      if (tzLower.includes('kuwait')) {
        return COUNTRIES.find((c) => c.iso === 'KW') || COUNTRIES[0];
      }
      if (tzLower.includes('bahrain')) {
        return COUNTRIES.find((c) => c.iso === 'BH') || COUNTRIES[0];
      }
      if (tzLower.includes('kolkata') || tzLower.includes('calcutta') || tzLower.includes('india')) {
        return COUNTRIES.find((c) => c.iso === 'IN') || COUNTRIES[0];
      }
      if (tzLower.includes('dhaka')) {
        return COUNTRIES.find((c) => c.iso === 'BD') || COUNTRIES[0];
      }
      if (tzLower.includes('kuala_lumpur')) {
        return COUNTRIES.find((c) => c.iso === 'MY') || COUNTRIES[0];
      }
      if (tzLower.includes('istanbul')) {
        return COUNTRIES.find((c) => c.iso === 'TR') || COUNTRIES[0];
      }
      if (tzLower.includes('singapore')) {
        return COUNTRIES.find((c) => c.iso === 'SG') || COUNTRIES[0];
      }
      if (tzLower.includes('toronto') || tzLower.includes('vancouver') || tzLower.includes('montreal')) {
        return COUNTRIES.find((c) => c.iso === 'CA') || COUNTRIES[0];
      }
      if (tzLower.includes('berlin')) {
        return COUNTRIES.find((c) => c.iso === 'DE') || COUNTRIES[0];
      }
      if (tzLower.includes('paris')) {
        return COUNTRIES.find((c) => c.iso === 'FR') || COUNTRIES[0];
      }
      if (tzLower.includes('dublin')) {
        return COUNTRIES.find((c) => c.iso === 'IE') || COUNTRIES[0];
      }
      if (tzLower.includes('auckland')) {
        return COUNTRIES.find((c) => c.iso === 'NZ') || COUNTRIES[0];
      }
      if (tzLower.includes('johannesburg')) {
        return COUNTRIES.find((c) => c.iso === 'ZA') || COUNTRIES[0];
      }
      if (tzLower.includes('cairo')) {
        return COUNTRIES.find((c) => c.iso === 'EG') || COUNTRIES[0];
      }
      if (tzLower.includes('colombo')) {
        return COUNTRIES.find((c) => c.iso === 'LK') || COUNTRIES[0];
      }
    }

    if (typeof navigator !== 'undefined') {
      const languages = navigator.languages || [navigator.language];
      for (const lang of languages) {
        if (!lang) continue;
        const lower = lang.toLowerCase();
        if (lower.includes('pk') || lower === 'ur') {
          return COUNTRIES.find((c) => c.iso === 'PK') || COUNTRIES[0];
        }
        if (lower.includes('ae')) {
          return COUNTRIES.find((c) => c.iso === 'AE') || COUNTRIES[0];
        }
        if (lower.includes('sa')) {
          return COUNTRIES.find((c) => c.iso === 'SA') || COUNTRIES[0];
        }
        if (lower.includes('gb') || lower === 'en-gb') {
          return COUNTRIES.find((c) => c.iso === 'GB') || COUNTRIES[0];
        }
        if (lower.includes('us') || lower === 'en-us') {
          return COUNTRIES.find((c) => c.iso === 'US') || COUNTRIES[0];
        }
        if (lower.includes('au') || lower === 'en-au') {
          return COUNTRIES.find((c) => c.iso === 'AU') || COUNTRIES[0];
        }
        if (lower.includes('ca') || lower === 'en-ca') {
          return COUNTRIES.find((c) => c.iso === 'CA') || COUNTRIES[0];
        }
        if (lower.includes('qa')) {
          return COUNTRIES.find((c) => c.iso === 'QA') || COUNTRIES[0];
        }
        if (lower.includes('om')) {
          return COUNTRIES.find((c) => c.iso === 'OM') || COUNTRIES[0];
        }
      }
    }
  } catch (err) {
    console.warn('Notice detecting country from locale:', err);
  }

  // Default fallback
  return COUNTRIES[0]; // Pakistan
}

/**
 * Cleans user phone input: strips whitespace, non-numeric characters, and removes leading zeros if country code is selected.
 */
export function cleanLocalPhoneInput(rawInput: string, country: CountryData): string {
  let digits = rawInput.replace(/[^\d]/g, '');

  // Strip leading 0 for countries where local format starts with 0 (e.g. Pakistan 0300 -> 300, UK 07911 -> 7911, Australia 0412 -> 412)
  if (
    digits.startsWith('0') &&
    (country.iso === 'PK' ||
      country.iso === 'GB' ||
      country.iso === 'AE' ||
      country.iso === 'SA' ||
      country.iso === 'AU' ||
      country.iso === 'DE' ||
      country.iso === 'FR' ||
      country.iso === 'TR' ||
      country.iso === 'EG' ||
      country.iso === 'BD' ||
      country.iso === 'LK' ||
      country.iso === 'IE' ||
      country.iso === 'NZ' ||
      country.iso === 'ZA')
  ) {
    digits = digits.substring(1);
  }

  return digits;
}

/**
 * Formats local phone number cleanly with pleasant spacing.
 */
export function formatLocalPhoneNumberDisplay(digits: string, country: CountryData): string {
  if (!digits) return '';

  if (country.iso === 'PK') {
    // 300 1234567
    if (digits.length <= 3) return digits;
    return `${digits.slice(0, 3)} ${digits.slice(3, 10)}`;
  }

  if (country.iso === 'US' || country.iso === 'CA') {
    // 555 123 4567
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  }

  if (country.iso === 'AE' || country.iso === 'SA') {
    // 50 123 4567
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`;
  }

  if (country.iso === 'GB') {
    // 7911 123456
    if (digits.length <= 4) return digits;
    return `${digits.slice(0, 4)} ${digits.slice(4, 10)}`;
  }

  if (country.iso === 'AU') {
    // 412 345 678
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  }

  // Generic fallback: group in chunks of 3-4
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
}

/**
 * Validates the local phone number according to country rules.
 */
export function validatePhoneNumber(
  digits: string,
  country: CountryData,
  lang: string = 'en'
): { isValid: boolean; error?: string } {
  if (!digits || digits.length === 0) {
    return {
      isValid: false,
      error: lang === 'ur' ? 'براہ کرم اپنا فون نمبر درج کریں' : 'Please enter your phone number.',
    };
  }

  if (country.exactDigits && digits.length !== country.exactDigits) {
    return {
      isValid: false,
      error:
        lang === 'ur'
          ? `${country.nameUrdu} کا نمبر ${country.exactDigits} ہندسوں کا ہونا چاہیے (مثال: ${country.example})`
          : `Please enter a valid ${country.exactDigits}-digit ${country.name} number (e.g. ${country.example}).`,
    };
  }

  if (digits.length < country.minDigits || digits.length > country.maxDigits) {
    return {
      isValid: false,
      error:
        lang === 'ur'
          ? `${country.nameUrdu} کا درست فون نمبر درج کریں (${country.minDigits}-${country.maxDigits} ہندسے)`
          : `Please enter a valid ${country.name} phone number (${country.minDigits}-${country.maxDigits} digits).`,
    };
  }

  return { isValid: true };
}
