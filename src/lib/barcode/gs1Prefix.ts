export interface GS1PrefixInfo {
  prefix: string;
  country: string;
  flag: string;
  organization: string;
}

/**
 * GS1 Prefix Table
 * Reference: GS1 General Specifications & Bar Codes Talk Standard Prefix Directory
 */
const GS1_PREFIX_RANGES: Array<{
  min: number;
  max: number;
  country: string;
  flag: string;
  organization: string;
}> = [
  { min: 0, max: 139, country: 'United States & Canada', flag: '🇺🇸', organization: 'GS1 US / GS1 Canada' },
  { min: 300, max: 379, country: 'France', flag: '🇫🇷', organization: 'GS1 France' },
  { min: 380, max: 380, country: 'Bulgaria', flag: '🇧🇬', organization: 'GS1 Bulgaria' },
  { min: 383, max: 383, country: 'Slovenia', flag: '🇸🇮', organization: 'GS1 Slovenija' },
  { min: 385, max: 385, country: 'Croatia', flag: '🇭🇷', organization: 'GS1 Croatia' },
  { min: 387, max: 387, country: 'Bosnia and Herzegovina', flag: '🇧🇦', organization: 'GS1 BIH' },
  { min: 400, max: 440, country: 'Germany', flag: '🇩🇪', organization: 'GS1 Germany' },
  { min: 450, max: 459, country: 'Japan', flag: '🇯🇵', organization: 'GS1 Japan' },
  { min: 460, max: 469, country: 'Russia', flag: '🇷🇺', organization: 'GS1 Russia' },
  { min: 471, max: 471, country: 'Taiwan', flag: '🇹🇼', organization: 'GS1 Taiwan' },
  { min: 489, max: 489, country: 'Hong Kong', flag: '🇭🇰', organization: 'GS1 Hong Kong' },
  { min: 490, max: 499, country: 'Japan', flag: '🇯🇵', organization: 'GS1 Japan' },
  { min: 500, max: 509, country: 'United Kingdom', flag: '🇬🇧', organization: 'GS1 UK' },
  { min: 520, max: 521, country: 'Greece', flag: '🇬🇷', organization: 'GS1 Greece' },
  { min: 528, max: 528, country: 'Lebanon', flag: '🇱🇧', organization: 'GS1 Lebanon' },
  { min: 529, max: 529, country: 'Cyprus', flag: '🇨🇾', organization: 'GS1 Cyprus' },
  { min: 530, max: 530, country: 'Albania', flag: '🇦🇱', organization: 'GS1 Albania' },
  { min: 535, max: 535, country: 'Malta', flag: '🇲🇹', organization: 'GS1 Malta' },
  { min: 539, max: 539, country: 'Ireland', flag: '🇮🇪', organization: 'GS1 Ireland' },
  { min: 540, max: 549, country: 'Belgium & Luxembourg', flag: '🇧🇪', organization: 'GS1 Belgium & Luxembourg' },
  { min: 560, max: 560, country: 'Portugal', flag: '🇵🇹', organization: 'GS1 Portugal' },
  { min: 569, max: 569, country: 'Iceland', flag: '🇮🇸', organization: 'GS1 Iceland' },
  { min: 570, max: 579, country: 'Denmark', flag: '🇩🇰', organization: 'GS1 Denmark' },
  { min: 590, max: 590, country: 'Poland', flag: '🇵🇱', organization: 'GS1 Polska' },
  { min: 594, max: 594, country: 'Romania', flag: '🇷🇴', organization: 'GS1 Romania' },
  { min: 599, max: 599, country: 'Hungary', flag: '🇭🇺', organization: 'GS1 Hungary' },
  { min: 600, max: 601, country: 'South Africa', flag: '🇿🇦', organization: 'GS1 South Africa' },
  { min: 603, max: 603, country: 'Ghana', flag: '🇬🇭', organization: 'GS1 Ghana' },
  { min: 608, max: 608, country: 'Bahrain', flag: '🇧🇭', organization: 'GS1 Bahrain' },
  { min: 611, max: 611, country: 'Morocco', flag: '🇲🇦', organization: 'GS1 Morocco' },
  { min: 613, max: 613, country: 'Algeria', flag: '🇩🇿', organization: 'GS1 Algeria' },
  { min: 616, max: 616, country: 'Kenya', flag: '🇰🇪', organization: 'GS1 Kenya' },
  { min: 619, max: 619, country: 'Tunisia', flag: '🇹🇳', organization: 'GS1 Tunisia' },
  { min: 621, max: 621, country: 'Syria', flag: '🇸🇾', organization: 'GS1 Syria' },
  { min: 622, max: 622, country: 'Egypt', flag: '🇪🇬', organization: 'GS1 Egypt' },
  { min: 624, max: 624, country: 'Libya', flag: '🇱🇾', organization: 'GS1 Libya' },
  { min: 625, max: 625, country: 'Jordan', flag: '🇯🇴', organization: 'GS1 Jordan' },
  { min: 626, max: 626, country: 'Iran', flag: '🇮🇷', organization: 'GS1 Iran' },
  { min: 627, max: 627, country: 'Kuwait', flag: '🇰🇼', organization: 'GS1 Kuwait' },
  { min: 628, max: 628, country: 'Saudi Arabia', flag: '🇸🇦', organization: 'GS1 Saudi Arabia' },
  { min: 629, max: 629, country: 'United Arab Emirates', flag: '🇦🇪', organization: 'GS1 UAE' },
  { min: 640, max: 649, country: 'Finland', flag: '🇫🇮', organization: 'GS1 Finland' },
  { min: 690, max: 699, country: 'China', flag: '🇨🇳', organization: 'GS1 China' },
  { min: 700, max: 709, country: 'Norway', flag: '🇳🇴', organization: 'GS1 Norway' },
  { min: 729, max: 729, country: 'Israel', flag: '🇮🇱', organization: 'GS1 Israel' },
  { min: 730, max: 739, country: 'Sweden', flag: '🇸🇪', organization: 'GS1 Sweden' },
  { min: 740, max: 740, country: 'Guatemala', flag: '🇬🇹', organization: 'GS1 Guatemala' },
  { min: 741, max: 741, country: 'El Salvador', flag: '🇸🇻', organization: 'GS1 El Salvador' },
  { min: 742, max: 742, country: 'Honduras', flag: '🇭🇳', organization: 'GS1 Honduras' },
  { min: 743, max: 743, country: 'Nicaragua', flag: '🇳🇮', organization: 'GS1 Nicaragua' },
  { min: 744, max: 744, country: 'Costa Rica', flag: '🇨🇷', organization: 'GS1 Costa Rica' },
  { min: 745, max: 745, country: 'Panama', flag: '🇵🇦', organization: 'GS1 Panama' },
  { min: 746, max: 746, country: 'Dominican Republic', flag: '🇩🇴', organization: 'GS1 Republica Dominicana' },
  { min: 750, max: 750, country: 'Mexico', flag: '🇲🇽', organization: 'GS1 Mexico' },
  { min: 759, max: 759, country: 'Venezuela', flag: '🇻🇪', organization: 'GS1 Venezuela' },
  { min: 760, max: 769, country: 'Switzerland', flag: '🇨🇭', organization: 'GS1 Switzerland' },
  { min: 770, max: 771, country: 'Colombia', flag: '🇨🇴', organization: 'GS1 Colombia' },
  { min: 773, max: 773, country: 'Uruguay', flag: '🇺🇾', organization: 'GS1 Uruguay' },
  { min: 775, max: 775, country: 'Peru', flag: '🇵🇪', organization: 'GS1 Peru' },
  { min: 777, max: 777, country: 'Bolivia', flag: '🇧🇴', organization: 'GS1 Bolivia' },
  { min: 778, max: 779, country: 'Argentina', flag: '🇦🇷', organization: 'GS1 Argentina' },
  { min: 780, max: 780, country: 'Chile', flag: '🇨🇱', organization: 'GS1 Chile' },
  { min: 784, max: 784, country: 'Paraguay', flag: '🇵🇾', organization: 'GS1 Paraguay' },
  { min: 786, max: 786, country: 'Ecuador', flag: '🇪🇨', organization: 'GS1 Ecuador' },
  { min: 789, max: 790, country: 'Brazil', flag: '🇧🇷', organization: 'GS1 Brasil' },
  { min: 800, max: 839, country: 'Italy', flag: '🇮🇹', organization: 'GS1 Italy' },
  { min: 840, max: 849, country: 'Spain', flag: '🇪🇸', organization: 'GS1 Spain' },
  { min: 850, max: 850, country: 'Cuba', flag: '🇨🇺', organization: 'GS1 Cuba' },
  { min: 858, max: 858, country: 'Slovakia', flag: '🇸🇰', organization: 'GS1 Slovakia' },
  { min: 859, max: 859, country: 'Czech Republic', flag: '🇨🇿', organization: 'GS1 Czech Republic' },
  { min: 860, max: 860, country: 'Serbia', flag: '🇷🇸', organization: 'GS1 Serbia' },
  { min: 865, max: 865, country: 'Mongolia', flag: '🇲🇳', organization: 'GS1 Mongolia' },
  { min: 867, max: 867, country: 'North Korea', flag: '🇰🇵', organization: 'GS1 DPR Korea' },
  { min: 868, max: 869, country: 'Turkey', flag: '🇹🇷', organization: 'GS1 Turkiye' },
  { min: 870, max: 879, country: 'Netherlands', flag: '🇳🇱', organization: 'GS1 Netherlands' },
  { min: 880, max: 880, country: 'South Korea', flag: '🇰🇷', organization: 'GS1 Korea' },
  { min: 884, max: 884, country: 'Cambodia', flag: '🇰🇭', organization: 'GS1 Cambodia' },
  { min: 885, max: 885, country: 'Thailand', flag: '🇹🇭', organization: 'GS1 Thailand' },
  { min: 888, max: 888, country: 'Singapore', flag: '🇸🇬', organization: 'GS1 Singapore' },
  { min: 890, max: 890, country: 'India', flag: '🇮🇳', organization: 'GS1 India' },
  { min: 893, max: 893, country: 'Vietnam', flag: '🇻🇳', organization: 'GS1 Vietnam' },
  { min: 896, max: 896, country: 'Pakistan', flag: '🇵🇰', organization: 'GS1 Pakistan' },
  { min: 899, max: 899, country: 'Indonesia', flag: '🇮🇩', organization: 'GS1 Indonesia' },
  { min: 900, max: 919, country: 'Austria', flag: '🇦🇹', organization: 'GS1 Austria' },
  { min: 930, max: 939, country: 'Australia', flag: '🇦🇺', organization: 'GS1 Australia' },
  { min: 940, max: 949, country: 'New Zealand', flag: '🇳🇿', organization: 'GS1 New Zealand' },
  { min: 955, max: 955, country: 'Malaysia', flag: '🇲🇾', organization: 'GS1 Malaysia' },
  { min: 958, max: 958, country: 'Macau', flag: '🇲🇴', organization: 'GS1 Macau' },
  { min: 977, max: 977, country: 'Periodicals (ISSN)', flag: '📰', organization: 'International ISSN Centre' },
  { min: 978, max: 979, country: 'Books (ISBN)', flag: '📚', organization: 'International ISBN Agency' },
  { min: 981, max: 984, country: 'Coupons (Common Currency)', flag: '🎟️', organization: 'GS1 Global Coupon' },
];

/**
 * Resolves the GS1 prefix for any standard numeric GTIN barcode (EAN-13, UPC-A).
 */
export function resolveGS1Prefix(barcodeDigits: string): GS1PrefixInfo | null {
  if (!barcodeDigits || typeof barcodeDigits !== 'string') return null;

  const cleaned = barcodeDigits.replace(/\D/g, '');
  if (cleaned.length < 3) return null;

  // Standardize 12-digit UPC-A into 13-digit EAN-13 by prepending 0
  const gtin13 = cleaned.length === 12 ? '0' + cleaned : cleaned;
  if (gtin13.length < 3) return null;

  const prefix3 = parseInt(gtin13.slice(0, 3), 10);
  if (isNaN(prefix3)) return null;

  for (const entry of GS1_PREFIX_RANGES) {
    if (prefix3 >= entry.min && prefix3 <= entry.max) {
      return {
        prefix: gtin13.slice(0, 3),
        country: entry.country,
        flag: entry.flag,
        organization: entry.organization,
      };
    }
  }

  return null;
}
