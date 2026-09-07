import React from 'react';
import {
  ShoppingBasket,
  Store,
  Flame,
  Pill,
  Home,
  Apple,
  Croissant,
  PartyPopper,
  Calendar,
  ShoppingBag,
  Drumstick,
  Sparkles,
  LucideIcon,
} from 'lucide-react';
import { ShoppingItem } from '../types';

export type ListThemeType =
  | 'groceries'
  | 'supermarket'
  | 'bbq'
  | 'pharmacy'
  | 'household'
  | 'fruit'
  | 'bakery'
  | 'party'
  | 'routine'
  | 'meat'
  | 'default';

export interface ListVisualConfig {
  type: ListThemeType;
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
  borderColor: string;
  hoverBg: string;
  label: string;
}

export const LIST_THEMES: Record<ListThemeType, ListVisualConfig> = {
  groceries: {
    type: 'groceries',
    icon: ShoppingBasket,
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-200/70',
    hoverBg: 'group-hover:bg-emerald-100',
    label: 'Groceries',
  },
  supermarket: {
    type: 'supermarket',
    icon: Store,
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-800',
    borderColor: 'border-teal-200/70',
    hoverBg: 'group-hover:bg-teal-100',
    label: 'Supermarket',
  },
  bbq: {
    type: 'bbq',
    icon: Flame,
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-200/70',
    hoverBg: 'group-hover:bg-orange-100',
    label: 'BBQ & Grill',
  },
  pharmacy: {
    type: 'pharmacy',
    icon: Pill,
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-800',
    borderColor: 'border-rose-200/70',
    hoverBg: 'group-hover:bg-rose-100',
    label: 'Pharmacy',
  },
  household: {
    type: 'household',
    icon: Home,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-200/70',
    hoverBg: 'group-hover:bg-amber-100',
    label: 'Household',
  },
  fruit: {
    type: 'fruit',
    icon: Apple,
    bgColor: 'bg-lime-50',
    textColor: 'text-lime-800',
    borderColor: 'border-lime-200/70',
    hoverBg: 'group-hover:bg-lime-100',
    label: 'Fruits & Veg',
  },
  bakery: {
    type: 'bakery',
    icon: Croissant,
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200/70',
    hoverBg: 'group-hover:bg-yellow-100',
    label: 'Bakery & Breakfast',
  },
  party: {
    type: 'party',
    icon: PartyPopper,
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-200/70',
    hoverBg: 'group-hover:bg-purple-100',
    label: 'Party & Event',
  },
  routine: {
    type: 'routine',
    icon: Calendar,
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-800',
    borderColor: 'border-sky-200/70',
    hoverBg: 'group-hover:bg-sky-100',
    label: 'Routine & Plan',
  },
  meat: {
    type: 'meat',
    icon: Drumstick,
    bgColor: 'bg-red-50',
    textColor: 'text-red-800',
    borderColor: 'border-red-200/70',
    hoverBg: 'group-hover:bg-red-100',
    label: 'Meat & Poultry',
  },
  default: {
    type: 'default',
    icon: ShoppingBag,
    bgColor: 'bg-emerald-50',
    textColor: 'text-[#0F3D2E]',
    borderColor: 'border-emerald-200/60',
    hoverBg: 'group-hover:bg-emerald-100',
    label: 'Shopping',
  },
};

/**
 * Meaningfully detect list icon based on title, explicit icon field, or item contents.
 */
export function getListVisualConfig(
  title?: string,
  explicitIcon?: string,
  items?: ShoppingItem[]
): ListVisualConfig {
  const t = (title || '').toLowerCase().trim();
  const eIcon = (explicitIcon || '').toLowerCase().trim();

  // 1. Direct explicit icon matches
  if (eIcon === 'bbq' || eIcon === 'grill' || eIcon === 'flame') return LIST_THEMES.bbq;
  if (eIcon === 'pharmacy' || eIcon === 'medical' || eIcon === 'pill' || eIcon === 'health') return LIST_THEMES.pharmacy;
  if (eIcon === 'supermarket' || eIcon === 'store' || eIcon === 'mart') return LIST_THEMES.supermarket;
  if (eIcon === 'household' || eIcon === 'home') return LIST_THEMES.household;
  if (eIcon === 'fruit' || eIcon === 'fruits' || eIcon === 'apple') return LIST_THEMES.fruit;
  if (eIcon === 'bakery' || eIcon === 'bread' || eIcon === 'croissant') return LIST_THEMES.bakery;
  if (eIcon === 'party' || eIcon === 'event') return LIST_THEMES.party;
  if (eIcon === 'groceries' || eIcon === 'basket') return LIST_THEMES.groceries;

  // 2. Title semantic matching (supports English, Urdu transliteration, and Urdu script)
  // BBQ / Grill
  if (
    t.includes('bbq') ||
    t.includes('barbecue') ||
    t.includes('grill') ||
    t.includes('tikka') ||
    t.includes('karahi') ||
    t.includes('kabab') ||
    t.includes('باربی کیو') ||
    t.includes('تکہ') ||
    t.includes('کباب')
  ) {
    return LIST_THEMES.bbq;
  }

  // Pharmacy / Medical
  if (
    t.includes('pharmacy') ||
    t.includes('medicine') ||
    t.includes('medical') ||
    t.includes('dawa') ||
    t.includes('dawai') ||
    t.includes('health') ||
    t.includes('clinic') ||
    t.includes('doctor') ||
    t.includes('دوا') ||
    t.includes('میڈیکل') ||
    t.includes('فارمیسی') ||
    t.includes('صحت')
  ) {
    return LIST_THEMES.pharmacy;
  }

  // Supermarket / Mart
  if (
    t.includes('supermarket') ||
    t.includes('mart') ||
    t.includes('store') ||
    t.includes('hyper') ||
    t.includes('bazar') ||
    t.includes('bazaar') ||
    t.includes('market') ||
    t.includes('مال') ||
    t.includes('مارکیٹ') ||
    t.includes('سپر مارکیٹ')
  ) {
    return LIST_THEMES.supermarket;
  }

  // Household & Cleaning
  if (
    t.includes('household') ||
    t.includes('home') ||
    t.includes('ghar') ||
    t.includes('cleaning') ||
    t.includes('safai') ||
    t.includes('repair') ||
    t.includes('گھر') ||
    t.includes('صفائی')
  ) {
    return LIST_THEMES.household;
  }

  // Fruit & Vegetables
  if (
    t.includes('fruit') ||
    t.includes('fruits') ||
    t.includes('apple') ||
    t.includes('sabzi') ||
    t.includes('vegetable') ||
    t.includes('veggie') ||
    t.includes('phal') ||
    t.includes('پھل') ||
    t.includes('سبزی')
  ) {
    return LIST_THEMES.fruit;
  }

  // Bakery & Breakfast
  if (
    t.includes('bakery') ||
    t.includes('bread') ||
    t.includes('breakfast') ||
    t.includes('nashta') ||
    t.includes('roti') ||
    t.includes('بیکری') ||
    t.includes('ناشتہ')
  ) {
    return LIST_THEMES.bakery;
  }

  // Party & Event
  if (
    t.includes('party') ||
    t.includes('event') ||
    t.includes('snacks') ||
    t.includes('dawat') ||
    t.includes('dinner') ||
    t.includes('birthday') ||
    t.includes('دعوت') ||
    t.includes('پارٹی')
  ) {
    return LIST_THEMES.party;
  }

  // Meat / Poultry
  if (
    t.includes('meat') ||
    t.includes('gosht') ||
    t.includes('chicken') ||
    t.includes('mutton') ||
    t.includes('beef') ||
    t.includes('گوشت') ||
    t.includes('چکن')
  ) {
    return LIST_THEMES.meat;
  }

  // Routine / Weekly / Monthly Plan
  if (
    t.includes('weekly') ||
    t.includes('monthly') ||
    t.includes('routine') ||
    t.includes('plan') ||
    t.includes('schedule') ||
    t.includes('ہفتہ وار') ||
    t.includes('ماہانہ')
  ) {
    return LIST_THEMES.routine;
  }

  // Groceries / Kiryana / Rashan
  if (
    t.includes('grocery') ||
    t.includes('groceries') ||
    t.includes('kiryana') ||
    t.includes('sauda') ||
    t.includes('rashan') ||
    t.includes('سودا') ||
    t.includes('راشن') ||
    t.includes('کریانہ')
  ) {
    return LIST_THEMES.groceries;
  }

  // 3. Fallback to majority item category if items exist
  if (items && items.length > 0) {
    const counts: Record<string, number> = {};
    for (const item of items) {
      const cat = item.categoryId || item.category || 'other';
      counts[cat] = (counts[cat] || 0) + 1;
    }
    const dominantCat = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];

    if (dominantCat === 'fruits_veg') return LIST_THEMES.fruit;
    if (dominantCat === 'meat_poultry') return LIST_THEMES.meat;
    if (dominantCat === 'dairy_eggs' || dominantCat === 'bakery') return LIST_THEMES.bakery;
    if (dominantCat === 'household_cleaning' || dominantCat === 'personal_care') return LIST_THEMES.household;
    if (dominantCat === 'spices_masalay' || dominantCat === 'staples_grains') return LIST_THEMES.groceries;
  }

  return LIST_THEMES.default;
}
