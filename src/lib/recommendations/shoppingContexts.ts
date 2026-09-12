import React from 'react';
import {
  Calendar,
  ShoppingBag,
  Store,
  Flame,
  Home,
  Sparkles,
  ListPlus,
  Apple,
  HeartPulse,
  Coffee,
  PartyPopper,
  Cake,
} from 'lucide-react';
import { CategoryId } from '../../types';

export interface ShoppingContextOption {
  id: string;
  title: string;
  subtitle: string;
  categoryHint?: CategoryId;
  iconName: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  suggestedItems: string[];
  accentBg: string;
  accentText: string;
  accentBorder: string;
}

export const SHOPPING_CONTEXT_OPTIONS: ShoppingContextOption[] = [
  {
    id: 'weekly',
    title: 'Weekly Shopping',
    subtitle: 'Regular household staples & fresh foods',
    categoryHint: 'dairy',
    iconName: 'calendar',
    icon: Calendar,
    suggestedItems: ['Milk', 'Eggs', 'Bread', 'Tea', 'Sugar', 'Rice', 'Potatoes', 'Tomatoes'],
    accentBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    accentText: 'text-emerald-700 dark:text-emerald-400',
    accentBorder: 'border-emerald-500/25',
  },
  {
    id: 'grocery',
    title: 'Grocery & Staples',
    subtitle: 'Atta, rice, cooking oil, pulses & spices',
    categoryHint: 'grocery',
    iconName: 'shopping_bag',
    icon: ShoppingBag,
    suggestedItems: ['Atta', 'Rice', 'Cooking Oil', 'Sugar', 'Daal', 'Spices', 'Salt', 'Tea'],
    accentBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    accentText: 'text-amber-700 dark:text-amber-400',
    accentBorder: 'border-amber-500/25',
  },
  {
    id: 'fruits_vegetables',
    title: 'Fruits & Vegetables',
    subtitle: 'Fresh sabzi, potatoes, onions & seasonal fruits',
    categoryHint: 'vegetables',
    iconName: 'apple',
    icon: Apple,
    suggestedItems: ['Potatoes', 'Tomatoes', 'Onions', 'Bananas', 'Apples', 'Lemons', 'Ginger', 'Garlic'],
    accentBg: 'bg-lime-500/10 dark:bg-lime-500/20',
    accentText: 'text-lime-700 dark:text-lime-400',
    accentBorder: 'border-lime-500/25',
  },
  {
    id: 'supermarket',
    title: 'Supermarket / Mart',
    subtitle: 'Groceries, detergents, personal care & pantry',
    categoryHint: 'cooking_essentials',
    iconName: 'store',
    icon: Store,
    suggestedItems: ['Cooking Oil', 'Rice', 'Detergent', 'Shampoo', 'Dish Soap', 'Tissues', 'Toothpaste'],
    accentBg: 'bg-teal-500/10 dark:bg-teal-500/20',
    accentText: 'text-teal-700 dark:text-teal-400',
    accentBorder: 'border-teal-500/25',
  },
  {
    id: 'bbq',
    title: 'BBQ / Dawat',
    subtitle: 'Chicken, tikka masala, charcoal, paratha & drinks',
    categoryHint: 'meat',
    iconName: 'flame',
    icon: Flame,
    suggestedItems: ['Chicken', 'Charcoal', 'Tikka Masala', 'Cold Drinks', 'Paratha', 'Onions', 'BBQ Sauce'],
    accentBg: 'bg-rose-500/10 dark:bg-rose-500/20',
    accentText: 'text-rose-700 dark:text-rose-400',
    accentBorder: 'border-rose-500/25',
  },
  {
    id: 'breakfast',
    title: 'Breakfast / Nashta',
    subtitle: 'Eggs, milk, bread, butter, tea & rusk',
    categoryHint: 'dairy',
    iconName: 'coffee',
    icon: Coffee,
    suggestedItems: ['Eggs', 'Milk', 'Bread', 'Tea', 'Butter', 'Rusk', 'Jam', 'Yogurt'],
    accentBg: 'bg-orange-500/10 dark:bg-orange-500/20',
    accentText: 'text-orange-700 dark:text-orange-400',
    accentBorder: 'border-orange-500/25',
  },
  {
    id: 'home',
    title: 'Household & Cleaning',
    subtitle: 'Dish soap, surf, trash bags, tissues & cleaners',
    categoryHint: 'cleaning',
    iconName: 'home',
    icon: Home,
    suggestedItems: ['Detergent', 'Dish Soap', 'Trash Bags', 'Tissues', 'Hand Wash', 'Floor Cleaner'],
    accentBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    accentText: 'text-indigo-700 dark:text-indigo-400',
    accentBorder: 'border-indigo-500/25',
  },
  {
    id: 'pharmacy',
    title: 'Pharmacy & Health',
    subtitle: 'Medicines, pain relief, bandages & first aid',
    categoryHint: 'health',
    iconName: 'heart_pulse',
    icon: HeartPulse,
    suggestedItems: ['Panadol', 'Bandages', 'Disprin', 'Cough Syrup', 'Pain Relief', 'Sanitizer'],
    accentBg: 'bg-red-500/10 dark:bg-red-500/20',
    accentText: 'text-red-700 dark:text-red-400',
    accentBorder: 'border-red-500/25',
  },
  {
    id: 'personal',
    title: 'Personal Care',
    subtitle: 'Shampoo, soap, toothpaste & daily grooming',
    categoryHint: 'personal_care',
    iconName: 'sparkles',
    icon: Sparkles,
    suggestedItems: ['Shampoo', 'Soap', 'Toothpaste', 'Deodorant', 'Hand Wash', 'Body Wash'],
    accentBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    accentText: 'text-purple-700 dark:text-purple-400',
    accentBorder: 'border-purple-500/25',
  },
  {
    id: 'party',
    title: 'Party & Gatherings',
    subtitle: 'Snacks, chips, cold drinks, sweets & disposables',
    categoryHint: 'snacks',
    iconName: 'party_popper',
    icon: PartyPopper,
    suggestedItems: ['Cold Drinks', 'Chips', 'Juices', 'Disposable Cups', 'Tissues', 'Sweets'],
    accentBg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    accentText: 'text-cyan-700 dark:text-cyan-400',
    accentBorder: 'border-cyan-500/25',
  },
  {
    id: 'baking',
    title: 'Baking & Desserts',
    subtitle: 'Flour, sugar, baking powder, cocoa & milk',
    categoryHint: 'bakery',
    iconName: 'cake',
    icon: Cake,
    suggestedItems: ['Flour', 'Sugar', 'Baking Powder', 'Butter', 'Milk', 'Eggs', 'Cocoa Powder'],
    accentBg: 'bg-pink-500/10 dark:bg-pink-500/20',
    accentText: 'text-pink-700 dark:text-pink-400',
    accentBorder: 'border-pink-500/25',
  },
  {
    id: 'custom',
    title: 'Custom List',
    subtitle: 'Your own personalized shopping items',
    categoryHint: 'uncategorized',
    iconName: 'list_plus',
    icon: ListPlus,
    suggestedItems: [],
    accentBg: 'bg-slate-500/10 dark:bg-slate-500/20',
    accentText: 'text-slate-700 dark:text-slate-400',
    accentBorder: 'border-slate-500/25',
  },
];

/**
 * Gets suggested items and metadata for a given context ID or infer from list title.
 */
export function getSuggestionsForContext(contextId?: string, title?: string): {
  contextId: string;
  contextTitle: string;
  items: string[];
  categoryHint?: CategoryId;
} {
  if (contextId) {
    const found = SHOPPING_CONTEXT_OPTIONS.find((c) => c.id === contextId);
    if (found && found.suggestedItems.length > 0) {
      return {
        contextId: found.id,
        contextTitle: found.title,
        items: found.suggestedItems,
        categoryHint: found.categoryHint,
      };
    }
  }

  // Infer from title
  const cleanTitle = (title || '').toLowerCase();
  if (cleanTitle.includes('bbq') || cleanTitle.includes('grill') || cleanTitle.includes('tikka') || cleanTitle.includes('kebab')) {
    const ctx = SHOPPING_CONTEXT_OPTIONS.find((c) => c.id === 'bbq')!;
    return { contextId: ctx.id, contextTitle: ctx.title, items: ctx.suggestedItems, categoryHint: ctx.categoryHint };
  }
  if (cleanTitle.includes('nashta') || cleanTitle.includes('breakfast') || cleanTitle.includes('subah') || cleanTitle.includes('chai')) {
    const ctx = SHOPPING_CONTEXT_OPTIONS.find((c) => c.id === 'breakfast')!;
    return { contextId: ctx.id, contextTitle: ctx.title, items: ctx.suggestedItems, categoryHint: ctx.categoryHint };
  }
  if (cleanTitle.includes('sabzi') || cleanTitle.includes('vegetable') || cleanTitle.includes('fruit') || cleanTitle.includes('phal') || cleanTitle.includes('mandi')) {
    const ctx = SHOPPING_CONTEXT_OPTIONS.find((c) => c.id === 'fruits_vegetables')!;
    return { contextId: ctx.id, contextTitle: ctx.title, items: ctx.suggestedItems, categoryHint: ctx.categoryHint };
  }
  if (cleanTitle.includes('pharmacy') || cleanTitle.includes('dawa') || cleanTitle.includes('medicine') || cleanTitle.includes('medical') || cleanTitle.includes('clinic')) {
    const ctx = SHOPPING_CONTEXT_OPTIONS.find((c) => c.id === 'pharmacy')!;
    return { contextId: ctx.id, contextTitle: ctx.title, items: ctx.suggestedItems, categoryHint: ctx.categoryHint };
  }
  if (cleanTitle.includes('supermarket') || cleanTitle.includes('mart') || cleanTitle.includes('imtiaz') || cleanTitle.includes('carrefour') || cleanTitle.includes('metro')) {
    const ctx = SHOPPING_CONTEXT_OPTIONS.find((c) => c.id === 'supermarket')!;
    return { contextId: ctx.id, contextTitle: ctx.title, items: ctx.suggestedItems, categoryHint: ctx.categoryHint };
  }
  if (cleanTitle.includes('home') || cleanTitle.includes('house') || cleanTitle.includes('safai') || cleanTitle.includes('cleaning') || cleanTitle.includes('ghar')) {
    const ctx = SHOPPING_CONTEXT_OPTIONS.find((c) => c.id === 'home')!;
    return { contextId: ctx.id, contextTitle: ctx.title, items: ctx.suggestedItems, categoryHint: ctx.categoryHint };
  }
  if (cleanTitle.includes('personal') || cleanTitle.includes('care') || cleanTitle.includes('bath') || cleanTitle.includes('shampoo')) {
    const ctx = SHOPPING_CONTEXT_OPTIONS.find((c) => c.id === 'personal')!;
    return { contextId: ctx.id, contextTitle: ctx.title, items: ctx.suggestedItems, categoryHint: ctx.categoryHint };
  }
  if (cleanTitle.includes('party') || cleanTitle.includes('dawat') || cleanTitle.includes('mehman') || cleanTitle.includes('gathering')) {
    const ctx = SHOPPING_CONTEXT_OPTIONS.find((c) => c.id === 'party')!;
    return { contextId: ctx.id, contextTitle: ctx.title, items: ctx.suggestedItems, categoryHint: ctx.categoryHint };
  }
  if (cleanTitle.includes('baking') || cleanTitle.includes('cake') || cleanTitle.includes('sweet') || cleanTitle.includes('dessert')) {
    const ctx = SHOPPING_CONTEXT_OPTIONS.find((c) => c.id === 'baking')!;
    return { contextId: ctx.id, contextTitle: ctx.title, items: ctx.suggestedItems, categoryHint: ctx.categoryHint };
  }
  if (cleanTitle.includes('groc') || cleanTitle.includes('rashan') || cleanTitle.includes('sauda') || cleanTitle.includes('pantry') || cleanTitle.includes('kitchen')) {
    const ctx = SHOPPING_CONTEXT_OPTIONS.find((c) => c.id === 'grocery')!;
    return { contextId: ctx.id, contextTitle: ctx.title, items: ctx.suggestedItems, categoryHint: ctx.categoryHint };
  }
  if (cleanTitle.includes('week') || cleanTitle.includes('hafta') || cleanTitle.includes('haftha')) {
    const ctx = SHOPPING_CONTEXT_OPTIONS.find((c) => c.id === 'weekly')!;
    return { contextId: ctx.id, contextTitle: ctx.title, items: ctx.suggestedItems, categoryHint: ctx.categoryHint };
  }

  // Default to weekly essentials as friendly fallback
  const defaultCtx = SHOPPING_CONTEXT_OPTIONS.find((c) => c.id === 'weekly')!;
  return {
    contextId: 'weekly',
    contextTitle: 'Weekly Essentials',
    items: defaultCtx.suggestedItems,
    categoryHint: defaultCtx.categoryHint,
  };
}
