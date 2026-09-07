import React from 'react';
import { CategoryId } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface EssentialItemVisualProps {
  canonicalName: string;
  displayName?: string;
  categoryId?: CategoryId | string;
  size?: number;
  className?: string;
}

/**
 * High-definition, offline-first visual representation system for grocery items.
 * Renders bespoke vector illustrations for core household essentials and
 * clean, aesthetic category-based fallbacks for other items.
 * Never requires remote network requests, never breaks offline, and never shows unrelated images.
 */
export const EssentialItemVisual: React.FC<EssentialItemVisualProps> = ({
  canonicalName,
  displayName = '',
  categoryId = 'other',
  size = 48,
  className = '',
}) => {
  const normKey = (canonicalName || displayName || '').toLowerCase().trim();

  // 1. SUGAR (Crystalline white/amber container & scoop with granules - NOT a flower!)
  if (
    normKey === 'sugar' ||
    normKey === 'cheeni' ||
    normKey === 'chini' ||
    normKey === 'چینی' ||
    normKey.includes('sugar') ||
    normKey.includes('cheeni')
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 shadow-2xs shrink-0 overflow-hidden ${className}`}
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

  // 2. MILK (Classic dairy bottle with milk level and sky blue cap)
  if (
    normKey === 'milk' ||
    normKey === 'doodh' ||
    normKey === 'دودھ' ||
    normKey.includes('milk') ||
    normKey.includes('doodh')
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200/60 shadow-2xs shrink-0 overflow-hidden ${className}`}
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
          {/* Fresh droplet icon on label */}
          <circle cx="24" cy="23" r="2" fill="#38BDF8" />
        </svg>
      </div>
    );
  }

  // 3. EGGS (Farm egg carton with fresh brown/beige eggs)
  if (
    normKey === 'egg' ||
    normKey === 'eggs' ||
    normKey === 'anday' ||
    normKey === 'ande' ||
    normKey === 'انڈے' ||
    normKey === 'انڈا' ||
    normKey.includes('egg') ||
    normKey.includes('anday')
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200/60 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Eggs illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          {/* Egg carton base */}
          <path d="M 10 30 L 14 38 L 34 38 L 38 30 Z" fill="#D97706" opacity="0.25" />
          <path d="M 11 29 C 11 27 13 26 15 26 L 33 26 C 35 26 37 27 37 29 L 35 36 L 13 36 Z" fill="#FDE68A" stroke="#B45309" strokeWidth="1.2" />
          {/* Egg 1 (Left brown egg) */}
          <ellipse cx="18" cy="22" rx="4.5" ry="6" fill="#F59E0B" stroke="#B45309" strokeWidth="1.2" />
          <ellipse cx="16.5" cy="20" rx="1.2" ry="2" fill="#FEF3C7" opacity="0.6" />
          {/* Egg 2 (Center white egg) */}
          <ellipse cx="24" cy="20" rx="5" ry="6.8" fill="#FFFFFF" stroke="#D97706" strokeWidth="1.2" />
          <ellipse cx="22.5" cy="18" rx="1.5" ry="2.5" fill="#FEF3C7" opacity="0.8" />
          {/* Egg 3 (Right warm egg) */}
          <ellipse cx="30" cy="22" rx="4.5" ry="6" fill="#FBBF24" stroke="#B45309" strokeWidth="1.2" />
        </svg>
      </div>
    );
  }

  // 4. POTATOES (Earthy golden russet potatoes)
  if (
    normKey === 'potato' ||
    normKey === 'potatoes' ||
    normKey === 'aloo' ||
    normKey === 'alu' ||
    normKey === 'آلو' ||
    normKey.includes('potato') ||
    normKey.includes('aloo')
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 via-yellow-50 to-stone-50 border border-amber-300/50 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Potatoes illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          {/* Background potato */}
          <ellipse cx="30" cy="23" rx="10" ry="8" fill="#D97706" opacity="0.9" transform="rotate(15 30 23)" />
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
          <circle cx="32" cy="24" r="0.9" fill="#78350F" />
        </svg>
      </div>
    );
  }

  // 5. TOMATOES (Vibrant red tomato with crisp green star calyx)
  if (
    normKey === 'tomato' ||
    normKey === 'tomatoes' ||
    normKey === 'tamatar' ||
    normKey === 'ٹماٹر' ||
    normKey.includes('tomato') ||
    normKey.includes('tamatar')
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
          {/* Red tomato body */}
          <ellipse cx="24" cy="27" rx="13" ry="11" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
          {/* Specular glossy highlight */}
          <ellipse cx="20" cy="22" rx="3.5" ry="2" fill="#FCA5A5" opacity="0.8" transform="rotate(-20 20 22)" />
          {/* Green stem and calyx leaves */}
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

  // 6. RICE (Basmati sack / bowl with distinct grain textures)
  if (
    normKey === 'rice' ||
    normKey === 'chawal' ||
    normKey === 'basmati' ||
    normKey === 'چاول' ||
    normKey.includes('rice') ||
    normKey.includes('chawal')
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-stone-50 border border-amber-200/60 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Rice illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          {/* Traditional jute sack base */}
          <path
            d="M 14 24 L 16 38 C 16 40 18 41 24 41 C 30 41 32 40 32 38 L 34 24 Z"
            fill="#D97706"
            stroke="#92400E"
            strokeWidth="1.5"
          />
          <path d="M 13 23 Q 24 26 35 23 L 34 21 Q 24 24 14 21 Z" fill="#B45309" />
          {/* Mounded white basmati grains */}
          <path d="M 16 22 C 16 14 32 14 32 22 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.2" />
          {/* Rice grain specks */}
          <line x1="20" y1="18" x2="22" y2="17" stroke="#92400E" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="26" y1="19" x2="28" y2="18" stroke="#92400E" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="23" y1="16" x2="25" y2="15" stroke="#92400E" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 7. ONIONS (Layered red/golden onion with sprout)
  if (
    normKey === 'onion' ||
    normKey === 'onions' ||
    normKey === 'pyaz' ||
    normKey === 'pyaaz' ||
    normKey === 'پیاز' ||
    normKey.includes('onion') ||
    normKey.includes('pyaz')
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-50 via-rose-50 to-amber-50 border border-purple-200/60 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Onions illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
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
          {/* Top sprout */}
          <path d="M 24 13 L 24 8 M 24 13 L 27 9" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 8. COOKING OIL (Golden oil bottle with spout)
  if (
    normKey === 'cooking_oil' ||
    normKey === 'oil' ||
    normKey === 'ghee' ||
    normKey === 'تیل' ||
    normKey === 'کوکنگ آئل' ||
    normKey.includes('oil') ||
    normKey.includes('ghee')
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border border-amber-300/60 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Cooking oil illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          {/* Bottle body */}
          <rect x="18" y="16" width="12" height="22" rx="3" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
          {/* Golden oil liquid inside */}
          <rect x="19.5" y="22" width="9" height="14" rx="1.5" fill="#F59E0B" />
          {/* Cap & dispenser */}
          <path d="M 21 16 L 21 11 L 27 11 L 27 16 Z" fill="#D97706" />
          <path d="M 24 11 L 24 7" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
          {/* Floating oil drop badge */}
          <path d="M 24 25 C 22 28 26 28 24 25 Z" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  // 9. TEA / CHAI (Steaming glass cup of fragrant karak chai)
  if (
    normKey === 'tea' ||
    normKey === 'chai' ||
    normKey === 'chai_patti' ||
    normKey === 'چائے' ||
    normKey.includes('tea') ||
    normKey.includes('chai')
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-stone-50 border border-amber-300/60 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Tea illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          {/* Saucer */}
          <ellipse cx="24" cy="38" rx="13" ry="3" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.2" />
          {/* Cup */}
          <path d="M 15 22 L 18 35 C 18 36 20 37 24 37 C 28 37 30 36 30 35 L 33 22 Z" fill="#92400E" stroke="#78350F" strokeWidth="1.5" />
          {/* Creamy tea surface */}
          <ellipse cx="24" cy="22" rx="9" ry="2.5" fill="#D97706" />
          {/* Steam curves */}
          <path d="M 21 17 Q 20 13 23 10" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <path d="M 26 16 Q 27 12 25 9" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </svg>
      </div>
    );
  }

  // 10. WHEAT FLOUR / ATTA (Traditional flour sack with wheat sheaf)
  if (
    normKey === 'flour' ||
    normKey === 'atta' ||
    normKey === 'maida' ||
    normKey === 'آٹا' ||
    normKey.includes('flour') ||
    normKey.includes('atta')
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-stone-50 border border-amber-200/60 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Flour illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          {/* Kraft sack */}
          <path d="M 15 19 L 16 38 C 16 39 19 40 24 40 C 29 40 32 39 32 38 L 33 19 Z" fill="#FDE68A" stroke="#B45309" strokeWidth="1.5" />
          <path d="M 14 18 Q 24 21 34 18 L 33 15 Q 24 18 15 15 Z" fill="#D97706" />
          {/* Wheat emblem */}
          <path d="M 24 24 L 24 34 M 22 26 L 24 28 M 26 26 L 24 28 M 22 29 L 24 31 M 26 29 L 24 31" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 11. BREAD (Golden sliced sandwich loaf)
  if (
    normKey === 'bread' ||
    normKey === 'double_roti' ||
    normKey === 'roti' ||
    normKey === 'ڈبل روٹی' ||
    normKey.includes('bread')
  ) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 shadow-2xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        aria-label="Bread illustration"
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-4/5 h-4/5">
          <ellipse cx="24" cy="37" rx="12" ry="3" fill="#FDE68A" />
          <rect x="14" y="20" width="20" height="15" rx="5" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
          <path d="M 14 24 C 14 18 34 18 34 24 Z" fill="#F59E0B" />
          <line x1="19" y1="21" x2="21" y2="26" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="24" y1="20" x2="26" y2="26" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="29" y1="21" x2="31" y2="26" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 12. CLEAN CATEGORY-BASED FALLBACK (For personalized items from history that don't match core staples)
  const categoryColorStyles: Record<string, { bg: string; border: string; icon: string }> = {
    vegetables: { bg: 'bg-emerald-50', border: 'border-emerald-200/60', icon: 'text-emerald-700' },
    fruits: { bg: 'bg-orange-50', border: 'border-orange-200/60', icon: 'text-orange-700' },
    dairy: { bg: 'bg-sky-50', border: 'border-sky-200/60', icon: 'text-sky-700' },
    meat: { bg: 'bg-rose-50', border: 'border-rose-200/60', icon: 'text-rose-700' },
    poultry: { bg: 'bg-amber-50', border: 'border-amber-200/60', icon: 'text-amber-700' },
    bakery: { bg: 'bg-amber-50', border: 'border-amber-200/60', icon: 'text-amber-800' },
    cooking_essentials: { bg: 'bg-yellow-50', border: 'border-yellow-200/60', icon: 'text-yellow-800' },
    rice: { bg: 'bg-amber-50', border: 'border-amber-200/60', icon: 'text-amber-800' },
    grains: { bg: 'bg-amber-50', border: 'border-amber-200/60', icon: 'text-amber-800' },
    pulses: { bg: 'bg-orange-50', border: 'border-orange-200/60', icon: 'text-orange-800' },
    beverages: { bg: 'bg-teal-50', border: 'border-teal-200/60', icon: 'text-teal-700' },
    snacks: { bg: 'bg-indigo-50', border: 'border-indigo-200/60', icon: 'text-indigo-700' },
    household: { bg: 'bg-blue-50', border: 'border-blue-200/60', icon: 'text-blue-700' },
    cleaning: { bg: 'bg-cyan-50', border: 'border-cyan-200/60', icon: 'text-cyan-700' },
    personal_care: { bg: 'bg-purple-50', border: 'border-purple-200/60', icon: 'text-purple-700' },
    health: { bg: 'bg-red-50', border: 'border-red-200/60', icon: 'text-red-700' },
  };

  const style = categoryColorStyles[categoryId as string] || {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200/60',
    icon: 'text-[#0F3D2E]',
  };

  return (
    <div
      className={`relative flex items-center justify-center rounded-xl ${style.bg} border ${style.border} shadow-2xs shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size }}
      aria-label={`${displayName || canonicalName} icon`}
    >
      <CategoryIcon categoryId={(categoryId as CategoryId) || 'other'} className={`w-5 h-5 ${style.icon}`} />
    </div>
  );
};
