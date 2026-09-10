import React from 'react';
import { CategoryId } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { normalizeBaseText } from '../lib/recognition/normalizer';
import { Package } from 'lucide-react';

interface EssentialItemVisualProps {
  canonicalName?: string;
  displayName?: string;
  name?: string;
  categoryId?: CategoryId | string;
  size?: number;
  className?: string;
}

/**
 * High-definition, offline-first visual representation system for grocery items.
 * Renders bespoke vector illustrations for core staples and
 * clean, aesthetic category-based fallbacks for other items.
 * Never requires remote network requests, never breaks offline, and never shows unrelated images.
 */
export const EssentialItemVisual: React.FC<EssentialItemVisualProps> = ({
  canonicalName,
  displayName = '',
  name = '',
  categoryId = 'other',
  size = 48,
  className = '',
}) => {
  const rawKey = canonicalName || displayName || name || '';
  const normKey = normalizeBaseText(rawKey);

  // Helper to match against aliases or substrings
  const matches = (keywords: string[]): boolean => {
    return keywords.some((kw) => {
      const nkw = normalizeBaseText(kw);
      return normKey === nkw || normKey.includes(nkw) || nkw.includes(normKey);
    });
  };

  // 1. POTATOES (Earthy golden russet potatoes with natural spots)
  // Handles: potato, potatoes, aloo, alu, aalu, allu, آلو, الو, poteto
  if (
    matches([
      'potato',
      'potatoes',
      'aloo',
      'alu',
      'alo',
      'aalu',
      'allu',
      'aaloo',
      'aluw',
      'آلو',
      'الو',
      'poteto',
      'potatoe',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 via-yellow-50 to-stone-50 border border-amber-300/60 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Potato illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          {/* Background potato shadow */}
          <ellipse cx="31" cy="24" rx="10" ry="8" fill="#D97706" opacity="0.85" transform="rotate(15 31 24)" />
          {/* Main foreground golden potato */}
          <path
            d="M 14 26 C 13 18, 22 15, 27 18 C 32 20, 31 29, 25 33 C 19 36, 15 32, 14 26 Z"
            fill="#F59E0B"
            stroke="#92400E"
            strokeWidth="1.5"
          />
          {/* Potato dimples / skin spots */}
          <circle cx="18" cy="24" r="1" fill="#78350F" />
          <circle cx="23" cy="28" r="0.8" fill="#78350F" />
          <circle cx="25" cy="21" r="1.1" fill="#78350F" />
          <circle cx="33" cy="24" r="0.9" fill="#78350F" />
        </svg>
      </div>
    );
  }

  // 2. SUGAR (Crystalline white container & scoop with sparkling amber granules)
  // Handles: sugar, chini, cheeni, chinni, chenni, shakar, shakkar, چینی, شکر
  if (
    matches([
      'sugar',
      'sugr',
      'cheeni',
      'chini',
      'chinni',
      'cheni',
      'chenni',
      'shakar',
      'shakkar',
      'چینی',
      'شکر',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/70 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Sugar illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          {/* Glass / ceramic sugar bowl */}
          <ellipse cx="24" cy="38" rx="14" ry="4" fill="#E2E8F0" />
          <path
            d="M 12 24 C 12 36, 36 36, 36 24 L 35 22 L 13 22 Z"
            fill="#F8FAFC"
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />
          {/* Sugar mound */}
          <path
            d="M 14 22 C 14 15, 34 15, 34 22 Z"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="1.2"
          />
          {/* Sparkling sugar granules */}
          <circle cx="21" cy="18" r="1" fill="#F59E0B" />
          <circle cx="25" cy="16" r="1.2" fill="#FBBF24" />
          <circle cx="27" cy="19" r="0.8" fill="#F59E0B" />
          <circle cx="18" cy="20" r="0.9" fill="#D97706" />
          {/* Wooden sugar scoop handle */}
          <path
            d="M 28 17 L 38 7"
            stroke="#B45309"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <ellipse cx="28" cy="17" rx="3" ry="2" fill="#D97706" />
        </svg>
      </div>
    );
  }

  // 3. GREEN CHILI (Curved fresh green chili pepper with stem)
  // Handles: green chili, green chilli, hari mirch, hri mirch, sabz mirch, ہری مرچ
  if (
    matches([
      'green chili',
      'green chilli',
      'chili',
      'chilli',
      'hari mirch',
      'hri mirch',
      'haree mirch',
      'sabz mirch',
      'mirchi',
      'hari mirchi',
      'hri mirchi',
      'ہری مرچ',
      'سبز مرچ',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-300/60 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Green chili illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          {/* Shadow */}
          <ellipse cx="24" cy="39" rx="12" ry="3" fill="#D1FAE5" />
          {/* Chili pepper body */}
          <path
            d="M 24 16 C 30 20, 31 32, 21 38 C 22 32, 23 25, 20 18 Z"
            fill="#10B981"
            stroke="#047857"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Glossy highlight curve */}
          <path
            d="M 23 20 Q 27 25 24 33"
            stroke="#6EE7B7"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* Calyx and stem */}
          <path
            d="M 19 18 C 21 16, 25 16, 25 18 Z"
            fill="#065F46"
          />
          <path
            d="M 22 16 Q 21 11 17 9"
            stroke="#047857"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // 4. CHICKEN (Golden roasted drumstick with clean bone and crisp glaze)
  // Handles: chicken, murghi, murgi, broiler, چکن, مرغی
  if (
    matches([
      'chicken',
      'chiken',
      'murghi',
      'murgi',
      'murgh',
      'broiler',
      'desi chicken',
      'boneless chicken',
      'مرغی',
      'چکن',
      'مرغی کا گوشت',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-300/60 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Chicken illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          {/* Shadow */}
          <ellipse cx="26" cy="39" rx="12" ry="3" fill="#FED7AA" />
          {/* Drumstick bone knob */}
          <circle cx="14" cy="33" r="2.8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.2" />
          <circle cx="16" cy="35" r="2.8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.2" />
          <path d="M 15 34 L 21 28" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
          {/* Golden roasted meat bulb */}
          <ellipse cx="29" cy="22" rx="10" ry="8" fill="#D97706" stroke="#92400E" strokeWidth="1.5" transform="rotate(-30 29 22)" />
          {/* Glaze texture */}
          <path d="M 23 27 C 26 21 34 16 35 23" fill="#F59E0B" />
          <circle cx="31" cy="20" r="1" fill="#FEF3C7" />
          <circle cx="28" cy="24" r="0.8" fill="#FEF3C7" />
        </svg>
      </div>
    );
  }

  // 5. ONION (Layered purple/red onion with green sprout)
  // Handles: onion, onions, pyaz, pyaaz, piyaz, پیاز
  if (
    matches([
      'onion',
      'onions',
      'pyaz',
      'pyaaz',
      'piyaz',
      'piaz',
      'پیاز',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-50 via-rose-50 to-amber-50 border border-purple-200/70 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Onion illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          {/* Shadow */}
          <ellipse cx="24" cy="38" rx="11" ry="3" fill="#F3E8FF" />
          {/* Onion body */}
          <path
            d="M 24 13 C 32 18 36 26 33 33 C 30 38 18 38 15 33 C 12 26 16 18 24 13 Z"
            fill="#C084FC"
            stroke="#7E22CE"
            strokeWidth="1.5"
          />
          {/* Skin stripes */}
          <path d="M 24 14 Q 28 25 24 37" stroke="#9333EA" strokeWidth="1" strokeLinecap="round" />
          <path d="M 24 14 Q 20 25 21 36" stroke="#9333EA" strokeWidth="1" strokeLinecap="round" />
          {/* Top green sprout */}
          <path d="M 24 13 L 24 8 M 24 13 L 27 9" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 6. MILK (Classic dairy glass bottle with sky blue cap and wave)
  // Handles: milk, doodh, dodh, دودھ
  if (
    matches([
      'milk',
      'doodh',
      'dodh',
      'dairy milk',
      'fresh milk',
      'olpers',
      'milkpak',
      'دودھ',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200/70 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Milk illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          {/* Bottle shadow */}
          <ellipse cx="24" cy="40" rx="9" ry="2.5" fill="#BAE6FD" />
          {/* Glass bottle body */}
          <rect x="17" y="18" width="14" height="20" rx="4" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
          {/* Bottle neck */}
          <path d="M 20 18 L 20 12 L 28 12 L 28 18 Z" fill="#F0F9FF" stroke="#0284C7" strokeWidth="1.5" />
          {/* Blue cap */}
          <rect x="19" y="9" width="10" height="4" rx="1.5" fill="#0284C7" />
          {/* Milk wave inside */}
          <path d="M 18 26 Q 24 28 30 26 L 30 36 C 30 37 29 37 28 37 L 20 37 C 19 37 18 37 18 36 Z" fill="#E0F2FE" />
          {/* Droplet emblem on bottle */}
          <circle cx="24" cy="23" r="2" fill="#38BDF8" />
        </svg>
      </div>
    );
  }

  // 7. EGGS (Farm egg carton with fresh eggs)
  // Handles: egg, eggs, anday, anda, ande, انڈے, انڈا
  if (
    matches([
      'egg',
      'eggs',
      'anday',
      'anda',
      'ande',
      'andey',
      'desi anday',
      'انڈے',
      'انڈا',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200/70 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Eggs illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          {/* Carton base */}
          <path d="M 11 29 C 11 27 13 26 15 26 L 33 26 C 35 26 37 27 37 29 L 35 36 L 13 36 Z" fill="#FDE68A" stroke="#B45309" strokeWidth="1.2" />
          {/* Left brown egg */}
          <ellipse cx="18" cy="22" rx="4.5" ry="6" fill="#F59E0B" stroke="#B45309" strokeWidth="1.2" />
          {/* Center white egg */}
          <ellipse cx="24" cy="20" rx="5" ry="6.8" fill="#FFFFFF" stroke="#D97706" strokeWidth="1.2" />
          {/* Right egg */}
          <ellipse cx="30" cy="22" rx="4.5" ry="6" fill="#FBBF24" stroke="#B45309" strokeWidth="1.2" />
        </svg>
      </div>
    );
  }

  // 8. TOMATOES (Glossy red tomato with green star leaf calyx)
  // Handles: tomato, tomatoes, tamatar, ٹماٹر
  if (
    matches([
      'tomato',
      'tomatoes',
      'tamatar',
      'tamater',
      'ٹماٹر',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-rose-50 via-red-50 to-orange-50 border border-rose-200/70 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Tomato illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          {/* Shadow */}
          <ellipse cx="24" cy="38" rx="11" ry="3" fill="#FECDD3" />
          {/* Tomato body */}
          <ellipse cx="24" cy="27" rx="13" ry="11" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
          {/* Glossy highlight */}
          <ellipse cx="20" cy="22" rx="3.5" ry="2" fill="#FCA5A5" opacity="0.8" transform="rotate(-20 20 22)" />
          {/* Calyx & Stem */}
          <path d="M 24 16 L 24 10" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
          <path
            d="M 24 16 L 19 15 M 24 16 L 29 15 M 24 16 L 21 19 M 24 16 L 27 19"
            stroke="#10B981"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // 9. RICE (Basmati jute sack with grains)
  // Handles: rice, chawal, basmati, چاول
  if (
    matches([
      'rice',
      'chawal',
      'basmati',
      'sela rice',
      'چاول',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-stone-50 border border-amber-200/70 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Rice illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          {/* Sack base */}
          <path
            d="M 14 24 L 16 38 C 16 40 18 41 24 41 C 30 41 32 40 32 38 L 34 24 Z"
            fill="#D97706"
            stroke="#92400E"
            strokeWidth="1.5"
          />
          <path d="M 13 23 Q 24 26 35 23 L 34 21 Q 24 24 14 21 Z" fill="#B45309" />
          {/* Grains mound */}
          <path d="M 16 22 C 16 14 32 14 32 22 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.2" />
          {/* Rice specks */}
          <line x1="20" y1="18" x2="22" y2="17" stroke="#92400E" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="26" y1="19" x2="28" y2="18" stroke="#92400E" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="23" y1="16" x2="25" y2="15" stroke="#92400E" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 10. COOKING OIL / GHEE (Golden amber bottle with dispenser spout)
  // Handles: oil, cooking oil, ghee, banaspati, تیل, کوکنگ آئل, گھی
  if (
    matches([
      'oil',
      'cooking oil',
      'ghee',
      'banaspati',
      'dalda',
      'sufi oil',
      'تیل',
      'کوکنگ آئل',
      'گھی',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border border-amber-300/70 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Cooking oil illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          {/* Bottle body */}
          <rect x="18" y="16" width="12" height="22" rx="3" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
          <rect x="19.5" y="22" width="9" height="14" rx="1.5" fill="#F59E0B" />
          {/* Cap */}
          <path d="M 21 16 L 21 11 L 27 11 L 27 16 Z" fill="#D97706" />
          <path d="M 24 11 L 24 7" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 11. TEA / CHAI (Fragrant steaming cup of karak chai with saucer)
  // Handles: tea, chai, chai patti, tapal, lipton, چائے
  if (
    matches([
      'tea',
      'chai',
      'chai patti',
      'patti',
      'tapal',
      'lipton',
      'danedar',
      'چائے',
      'پتی',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-stone-50 border border-amber-300/70 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Tea illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          <ellipse cx="24" cy="38" rx="13" ry="3" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.2" />
          <path d="M 15 22 L 18 35 C 18 36 20 37 24 37 C 28 37 30 36 30 35 L 33 22 Z" fill="#92400E" stroke="#78350F" strokeWidth="1.5" />
          <ellipse cx="24" cy="22" rx="9" ry="2.5" fill="#D97706" />
          <path d="M 21 17 Q 20 13 23 10" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <path d="M 26 16 Q 27 12 25 9" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </svg>
      </div>
    );
  }

  // 12. WHEAT FLOUR / ATTA (Traditional flour sack with wheat sheaf)
  // Handles: flour, wheat flour, atta, aata, maida, آٹا
  if (
    matches([
      'flour',
      'wheat flour',
      'atta',
      'aata',
      'maida',
      'chakki atta',
      'suji',
      'sooji',
      'آٹا',
      'میدہ',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-stone-50 border border-amber-200/70 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Flour illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          <path d="M 15 19 L 16 38 C 16 39 19 40 24 40 C 29 40 32 39 32 38 L 33 19 Z" fill="#FDE68A" stroke="#B45309" strokeWidth="1.5" />
          <path d="M 14 18 Q 24 21 34 18 L 33 15 Q 24 18 15 15 Z" fill="#D97706" />
          <path d="M 24 24 L 24 34 M 22 26 L 24 28 M 26 26 L 24 28 M 22 29 L 24 31 M 26 29 L 24 31" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 13. BREAD (Golden sliced sandwich loaf)
  // Handles: bread, double roti, roti, ڈبل روٹی
  if (
    matches([
      'bread',
      'double roti',
      'roti',
      'dawn bread',
      'bun',
      'ڈبل روٹی',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/70 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Bread illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          <ellipse cx="24" cy="37" rx="12" ry="3" fill="#FDE68A" />
          <rect x="14" y="20" width="20" height="15" rx="5" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
          <path d="M 14 24 C 14 18 34 18 34 24 Z" fill="#F59E0B" />
          <line x1="19" y1="21" x2="21" y2="26" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="24" y1="20" x2="26" y2="26" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 14. GARLIC (Textured garlic bulb with papery skin and clove)
  // Handles: garlic, lehsan, lehsun, لہسن
  if (
    matches([
      'garlic',
      'lehsan',
      'lehsun',
      'lahsan',
      'لہسن',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-stone-50 to-amber-50 border border-stone-200/70 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Garlic illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          <ellipse cx="24" cy="38" rx="10" ry="3" fill="#E2E8F0" />
          {/* Garlic bulb segments */}
          <ellipse cx="18" cy="27" rx="5" ry="8" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.2" />
          <ellipse cx="30" cy="27" rx="5" ry="8" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.2" />
          <ellipse cx="24" cy="26" rx="6" ry="9" fill="#F8FAFC" stroke="#9CA3AF" strokeWidth="1.2" />
          {/* Top dried tip */}
          <path d="M 24 17 L 24 12" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 15. GINGER (Knobby aromatic ginger root with warmth)
  // Handles: ginger, adrak, aadrak, ادرک
  if (
    matches([
      'ginger',
      'adrak',
      'aadrak',
      'ادرک',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-300/60 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Ginger illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          <path
            d="M 16 32 C 14 26 19 22 22 24 C 23 20 28 20 29 23 C 32 21 36 24 34 29 C 32 35 24 37 16 32 Z"
            fill="#D97706"
            stroke="#92400E"
            strokeWidth="1.5"
          />
          <path d="M 22 24 L 23 16 C 24 14 28 15 27 18 L 26 22" fill="#F59E0B" stroke="#92400E" strokeWidth="1.2" />
          <line x1="20" y1="28" x2="25" y2="29" stroke="#78350F" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 16. MEAT / BEEF / MUTTON / GOSHT (Fresh marbled red meat cut)
  // Handles: meat, beef, mutton, gosht, bara gosht, chota gosht, گوشت
  if (
    matches([
      'meat',
      'beef',
      'mutton',
      'gosht',
      'bara gosht',
      'chota gosht',
      'gaye ka gosht',
      'qeema',
      'keema',
      'گوشت',
      'بڑا گوشت',
      'چھوٹا گوشت',
      'قیمہ',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-rose-50 to-red-50 border border-rose-300/70 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Meat illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          <ellipse cx="24" cy="38" rx="12" ry="3" fill="#FECDD3" />
          {/* Steak body */}
          <path
            d="M 15 25 C 13 18, 26 14, 34 18 C 38 23, 35 32, 28 34 C 18 36, 17 31, 15 25 Z"
            fill="#BE123C"
            stroke="#881337"
            strokeWidth="1.5"
          />
          {/* Marbled bone / fat */}
          <circle cx="23" cy="24" r="3.5" fill="#FFFFFF" stroke="#FDA4AF" strokeWidth="1.2" />
          <path d="M 26 23 Q 32 24 33 28" stroke="#FECDD3" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 17. FISH (Fresh silver-blue fish)
  // Handles: fish, machli, machhli, مچھلی
  if (
    matches([
      'fish',
      'machli',
      'machhli',
      'rohu',
      'palla',
      'مچھلی',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-sky-50 to-teal-50 border border-sky-300/60 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Fish illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          {/* Fish body */}
          <path
            d="M 12 24 C 20 16, 32 18, 36 24 C 32 30, 20 32, 12 24 Z"
            fill="#38BDF8"
            stroke="#0284C7"
            strokeWidth="1.5"
          />
          {/* Tail */}
          <path d="M 34 24 L 41 18 L 41 30 Z" fill="#0284C7" />
          {/* Eye & Fin */}
          <circle cx="18" cy="22" r="1.5" fill="#0F172A" />
          <path d="M 23 24 Q 26 27 23 29" stroke="#0284C7" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 18. YOGURT / DAHI (Clay matka / bowl of fresh white thick dahi with mint leaf)
  // Handles: yogurt, dahi, curd, دہی
  if (
    matches([
      'yogurt',
      'yoghurt',
      'dahi',
      'curd',
      'nestle dahi',
      'دہی',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/70 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Yogurt illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          {/* Earthen bowl */}
          <ellipse cx="24" cy="38" rx="12" ry="3.5" fill="#E2E8F0" />
          <path d="M 13 23 C 13 35, 35 35, 35 23 Z" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
          {/* Creamy yogurt surface */}
          <ellipse cx="24" cy="23" rx="11" ry="3.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
          {/* Mint garnish */}
          <path d="M 24 23 Q 26 19 28 21" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 19. BUTTER (Golden block of butter with curl)
  // Handles: butter, makhan, makkhan, nurpur, blue band, مکھن
  if (
    matches([
      'butter',
      'makhan',
      'makkhan',
      'nurpur butter',
      'blue band',
      'مکھن',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-300/70 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Butter illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          <ellipse cx="24" cy="37" rx="13" ry="3" fill="#FEF08A" />
          <rect x="14" y="21" width="20" height="13" rx="2" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />
          <path d="M 14 21 L 22 17 L 34 17 L 34 21 Z" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.2" />
        </svg>
      </div>
    );
  }

  // 20. LEMON (Bright yellow citrus lemon with wedge)
  // Handles: lemon, leemu, nimbu, لیموں
  if (
    matches([
      'lemon',
      'leemu',
      'nimbu',
      'lemoo',
      'لیموں',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-yellow-50 to-lime-50 border border-yellow-300/70 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Lemon illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          <ellipse cx="24" cy="38" rx="10" ry="3" fill="#FEF08A" />
          {/* Lemon oval with pointed tips */}
          <path
            d="M 14 25 C 16 17 32 17 34 25 C 32 33 16 33 14 25 Z"
            fill="#FACC15"
            stroke="#CA8A04"
            strokeWidth="1.5"
          />
          <path d="M 13 25 L 11 25 M 35 25 L 37 25" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 21. APPLE (Red orchard apple with leaf)
  // Handles: apple, saib, seb, سیب
  if (
    matches([
      'apple',
      'saib',
      'seb',
      'سیب',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-rose-50 to-red-50 border border-rose-300/70 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Apple illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          <ellipse cx="24" cy="38" rx="10" ry="3" fill="#FECDD3" />
          <path
            d="M 16 22 C 14 32 20 36 24 34 C 28 36 34 32 32 22 C 30 16 26 17 24 19 C 22 17 18 16 16 22 Z"
            fill="#DC2626"
            stroke="#991B1B"
            strokeWidth="1.5"
          />
          <path d="M 24 18 L 24 12" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
          <path d="M 24 14 Q 28 12 28 15 Z" fill="#16A34A" />
        </svg>
      </div>
    );
  }

  // 22. BANANA (Golden yellow banana bunch)
  // Handles: banana, kela, kayla, کیلا
  if (
    matches([
      'banana',
      'kela',
      'kayla',
      'کیلا',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-yellow-300/70 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Banana illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          <path
            d="M 14 18 C 22 22 28 32 34 35 C 31 34 22 28 17 19 Z"
            fill="#FACC15"
            stroke="#CA8A04"
            strokeWidth="1.5"
          />
          <circle cx="14" cy="18" r="1.5" fill="#78350F" />
          <circle cx="34" cy="35" r="1.2" fill="#78350F" />
        </svg>
      </div>
    );
  }

  // 23. LENTILS / DAAL (Bowl of golden split daal pulses)
  // Handles: daal, dal, lentils, daal chana, daal masoor, دال
  if (
    matches([
      'daal',
      'dal',
      'lentils',
      'pulses',
      'chana daal',
      'masoor',
      'moong',
      'mash',
      'دال',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-300/70 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Lentils illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          <ellipse cx="24" cy="38" rx="12" ry="3.5" fill="#E2E8F0" />
          <path d="M 13 24 C 13 36, 35 36, 35 24 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          <ellipse cx="24" cy="24" rx="11" ry="3.5" fill="#FBBF24" />
          <circle cx="21" cy="24" r="1" fill="#D97706" />
          <circle cx="25" cy="23" r="1.2" fill="#D97706" />
          <circle cx="27" cy="25" r="0.9" fill="#D97706" />
        </svg>
      </div>
    );
  }

  // 24. SALT (Clean salt shaker with crystal sprinkle)
  // Handles: salt, namak, national namak, نمک
  if (
    matches([
      'salt',
      'namak',
      'national namak',
      'iodized salt',
      'نمک',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200/80 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Salt illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          <ellipse cx="24" cy="38" rx="9" ry="2.5" fill="#E2E8F0" />
          <path d="M 19 20 L 17 35 C 17 37 19 38 24 38 C 29 38 31 37 31 35 L 29 20 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />
          <rect x="19" y="14" width="10" height="6" rx="2" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.2" />
          <circle cx="22" cy="16" r="0.7" fill="#475569" />
          <circle cx="24" cy="16" r="0.7" fill="#475569" />
          <circle cx="26" cy="16" r="0.7" fill="#475569" />
        </svg>
      </div>
    );
  }

  // 25. SPICES / MASALA (Spice jar with vibrant turmeric/chili blend)
  // Handles: spices, masala, haldi, zeera, dhaniya, turmeric, شان مصالحہ, ہلدی, مصالحہ
  if (
    matches([
      'spices',
      'spice',
      'masala',
      'masalah',
      'haldi',
      'turmeric',
      'zeera',
      'cumin',
      'dhaniya',
      'coriander powder',
      'lal mirch',
      'red chili powder',
      'garam masala',
      'shan',
      'national masala',
      'ہلدی',
      'مصالحہ',
      'زیرہ',
      'لال مرچ',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300/70 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Spices illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          <ellipse cx="24" cy="38" rx="9" ry="2.5" fill="#FED7AA" />
          <rect x="18" y="18" width="12" height="18" rx="3" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
          <rect x="19" y="24" width="10" height="11" rx="1.5" fill="#EA580C" />
          <rect x="19" y="13" width="10" height="5" rx="1.5" fill="#D97706" />
        </svg>
      </div>
    );
  }

  // 26. SOAP (Pastel bath soap bar with lather bubbles)
  // Handles: soap, saban, lux, dettol soap, صابن
  if (
    matches([
      'soap',
      'saban',
      'saaban',
      'lux',
      'lifebuoy',
      'dettol soap',
      'dove',
      'صابن',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200/70 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Soap illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          <ellipse cx="24" cy="37" rx="12" ry="3" fill="#FCE7F3" />
          <rect x="15" y="21" width="18" height="13" rx="5" fill="#F472B6" stroke="#DB2777" strokeWidth="1.5" />
          <circle cx="31" cy="18" r="2" fill="#FBCFE8" stroke="#F472B6" strokeWidth="0.8" />
          <circle cx="28" cy="14" r="1.3" fill="#FBCFE8" stroke="#F472B6" strokeWidth="0.8" />
        </svg>
      </div>
    );
  }

  // 27. DETERGENT / SURF (Washing powder box with fresh sparkles)
  // Handles: detergent, surf, surf excel, ariel, bonus, سرف
  if (
    matches([
      'detergent',
      'surf',
      'surf excel',
      'ariel',
      'bonus',
      'washing powder',
      'سرف',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/70 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Detergent illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          <ellipse cx="24" cy="38" rx="10" ry="2.5" fill="#DBEAFE" />
          <rect x="17" y="16" width="14" height="20" rx="3" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1.5" />
          <path d="M 21 24 L 27 24 M 24 21 L 24 27" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 28. BISCUITS / COOKIES (Golden baked circular cookies with dotted texture)
  // Handles: biscuit, biscuits, cookies, sooper, rio, prince, بسکٹ
  if (
    matches([
      'biscuit',
      'biscuits',
      'cookies',
      'sooper',
      'rio',
      'prince',
      'gala',
      'بسکٹ',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-300/70 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Biscuits illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          <ellipse cx="24" cy="38" rx="11" ry="3" fill="#FDE68A" />
          <circle cx="24" cy="25" r="10" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          <circle cx="21" cy="22" r="0.9" fill="#78350F" />
          <circle cx="27" cy="22" r="0.9" fill="#78350F" />
          <circle cx="21" cy="28" r="0.9" fill="#78350F" />
          <circle cx="27" cy="28" r="0.9" fill="#78350F" />
        </svg>
      </div>
    );
  }

  // 29. WATER / MINERAL WATER (Pure blue water bottle with fresh droplet)
  // Handles: water, mineral water, nestle pure life, aquafina, پانی
  if (
    matches([
      'water',
      'mineral water',
      'drinking water',
      'nestle water',
      'aquafina',
      'پانی',
    ])
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200/70 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Water illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          <ellipse cx="24" cy="39" rx="8" ry="2.5" fill="#CFFAFE" />
          <rect x="19" y="19" width="10" height="18" rx="3" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
          <rect x="21" y="13" width="6" height="6" rx="1" fill="#0284C7" />
          <path d="M 24 25 C 22 28 26 28 24 25 Z" fill="#38BDF8" />
        </svg>
      </div>
    );
  }

  // 30. CLEAN CATEGORY-BASED FALLBACK
  // Used for recognized catalog items that don't have a dedicated staple vector illustration.
  // Never shows random emoji or mismatched pictures.
  const categoryColorStyles: Record<string, { bg: string; border: string; icon: string }> = {
    vegetables: { bg: 'bg-emerald-50', border: 'border-emerald-200/70', icon: 'text-emerald-700' },
    fruits: { bg: 'bg-orange-50', border: 'border-orange-200/70', icon: 'text-orange-700' },
    dairy: { bg: 'bg-sky-50', border: 'border-sky-200/70', icon: 'text-sky-700' },
    meat: { bg: 'bg-rose-50', border: 'border-rose-200/70', icon: 'text-rose-700' },
    poultry: { bg: 'bg-amber-50', border: 'border-amber-200/70', icon: 'text-amber-700' },
    bakery: { bg: 'bg-amber-50', border: 'border-amber-200/70', icon: 'text-amber-800' },
    cooking_essentials: { bg: 'bg-yellow-50', border: 'border-yellow-200/70', icon: 'text-yellow-800' },
    rice: { bg: 'bg-amber-50', border: 'border-amber-200/70', icon: 'text-amber-800' },
    grains: { bg: 'bg-amber-50', border: 'border-amber-200/70', icon: 'text-amber-800' },
    pulses: { bg: 'bg-orange-50', border: 'border-orange-200/70', icon: 'text-orange-800' },
    beverages: { bg: 'bg-teal-50', border: 'border-teal-200/70', icon: 'text-teal-700' },
    snacks: { bg: 'bg-indigo-50', border: 'border-indigo-200/70', icon: 'text-indigo-700' },
    household: { bg: 'bg-blue-50', border: 'border-blue-200/70', icon: 'text-blue-700' },
    cleaning: { bg: 'bg-cyan-50', border: 'border-cyan-200/70', icon: 'text-cyan-700' },
    personal_care: { bg: 'bg-purple-50', border: 'border-purple-200/70', icon: 'text-purple-700' },
    health: { bg: 'bg-red-50', border: 'border-red-200/70', icon: 'text-red-700' },
    uncategorized: { bg: 'bg-surface-container', border: 'border-outline-variant/60', icon: 'text-outline' },
    other: { bg: 'bg-surface-container', border: 'border-outline-variant/60', icon: 'text-outline' },
  };

  const style = categoryColorStyles[categoryId as string] || categoryColorStyles.other;
  const isCustomOrUncategorized = categoryId === 'uncategorized' || categoryId === 'other' || !categoryId;

  return (
    <div
      className={`relative flex items-center justify-center rounded-xl ${style.bg} border ${style.border} shadow-2xs shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size }}
      aria-label={`${displayName || canonicalName || name || 'item'} icon`}
    >
      {isCustomOrUncategorized ? (
        <Package className={`w-5 h-5 ${style.icon}`} />
      ) : (
        <CategoryIcon categoryId={(categoryId as CategoryId) || 'other'} className={`w-5 h-5 ${style.icon}`} />
      )}
    </div>
  );
};
