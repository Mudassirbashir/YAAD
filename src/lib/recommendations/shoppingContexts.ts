import React from 'react';
import {
  Calendar,
  ShoppingBag,
  Store,
  Flame,
  Home,
  Sparkles,
  ListPlus,
} from 'lucide-react';

export interface ShoppingContextOption {
  id: 'weekly' | 'grocery' | 'supermarket' | 'bbq' | 'home' | 'personal' | 'custom';
  title: string;
  subtitle: string;
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
    iconName: 'calendar',
    icon: Calendar,
    suggestedItems: ['Milk', 'Eggs', 'Bread', 'Tea', 'Sugar', 'Rice'],
    accentBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    accentText: 'text-emerald-700 dark:text-emerald-400',
    accentBorder: 'border-emerald-500/25',
  },
  {
    id: 'grocery',
    title: 'Grocery',
    subtitle: 'Flour, rice, oil, lentils & essential spices',
    iconName: 'shopping_bag',
    icon: ShoppingBag,
    suggestedItems: ['Atta', 'Rice', 'Cooking Oil', 'Sugar', 'Daal', 'Spices', 'Tea'],
    accentBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    accentText: 'text-amber-700 dark:text-amber-400',
    accentBorder: 'border-amber-500/25',
  },
  {
    id: 'supermarket',
    title: 'Supermarket',
    subtitle: 'Groceries, cleaning supplies & personal care',
    iconName: 'store',
    icon: Store,
    suggestedItems: ['Cooking Oil', 'Rice', 'Detergent', 'Shampoo', 'Dish Soap', 'Tissues'],
    accentBg: 'bg-teal-500/10 dark:bg-teal-500/20',
    accentText: 'text-teal-700 dark:text-teal-400',
    accentBorder: 'border-teal-500/25',
  },
  {
    id: 'bbq',
    title: 'BBQ',
    subtitle: 'Chicken, tikka masala, paratha & grill essentials',
    iconName: 'flame',
    icon: Flame,
    suggestedItems: ['Chicken', 'Tikka Masala', 'Paratha', 'Onions', 'Spices', 'Charcoal'],
    accentBg: 'bg-rose-500/10 dark:bg-rose-500/20',
    accentText: 'text-rose-700 dark:text-rose-400',
    accentBorder: 'border-rose-500/25',
  },
  {
    id: 'home',
    title: 'Home',
    subtitle: 'Cleaning supplies, detergent, tissues & maintenance',
    iconName: 'home',
    icon: Home,
    suggestedItems: ['Detergent', 'Dish Soap', 'Trash Bags', 'Tissues', 'Mop', 'Light Bulbs'],
    accentBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    accentText: 'text-indigo-700 dark:text-indigo-400',
    accentBorder: 'border-indigo-500/25',
  },
  {
    id: 'personal',
    title: 'Personal',
    subtitle: 'Shampoo, soap, toothpaste & daily grooming',
    iconName: 'sparkles',
    icon: Sparkles,
    suggestedItems: ['Shampoo', 'Soap', 'Toothpaste', 'Deodorant', 'Handwash'],
    accentBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    accentText: 'text-purple-700 dark:text-purple-400',
    accentBorder: 'border-purple-500/25',
  },
  {
    id: 'custom',
    title: 'Custom',
    subtitle: 'Your own personalized household shopping list',
    iconName: 'list_plus',
    icon: ListPlus,
    suggestedItems: [],
    accentBg: 'bg-slate-500/10 dark:bg-slate-500/20',
    accentText: 'text-slate-700 dark:text-slate-400',
    accentBorder: 'border-slate-500/25',
  },
];

/**
 * Gets suggested items for a given context ID or infer from list title.
 */
export function getSuggestionsForContext(contextId?: string, title?: string): {
  contextId: string;
  contextTitle: string;
  items: string[];
} {
  if (contextId) {
    const found = SHOPPING_CONTEXT_OPTIONS.find((c) => c.id === contextId);
    if (found && found.suggestedItems.length > 0) {
      return {
        contextId: found.id,
        contextTitle: found.title,
        items: found.suggestedItems,
      };
    }
  }

  // Infer from title
  const cleanTitle = (title || '').toLowerCase();
  if (cleanTitle.includes('bbq') || cleanTitle.includes('grill') || cleanTitle.includes('tikka')) {
    const ctx = SHOPPING_CONTEXT_OPTIONS.find((c) => c.id === 'bbq')!;
    return { contextId: ctx.id, contextTitle: ctx.title, items: ctx.suggestedItems };
  }
  if (cleanTitle.includes('week') || cleanTitle.includes('hafta')) {
    const ctx = SHOPPING_CONTEXT_OPTIONS.find((c) => c.id === 'weekly')!;
    return { contextId: ctx.id, contextTitle: ctx.title, items: ctx.suggestedItems };
  }
  if (cleanTitle.includes('supermarket') || cleanTitle.includes('mart') || cleanTitle.includes('imtiaz')) {
    const ctx = SHOPPING_CONTEXT_OPTIONS.find((c) => c.id === 'supermarket')!;
    return { contextId: ctx.id, contextTitle: ctx.title, items: ctx.suggestedItems };
  }
  if (cleanTitle.includes('home') || cleanTitle.includes('house') || cleanTitle.includes('safai')) {
    const ctx = SHOPPING_CONTEXT_OPTIONS.find((c) => c.id === 'home')!;
    return { contextId: ctx.id, contextTitle: ctx.title, items: ctx.suggestedItems };
  }
  if (cleanTitle.includes('personal') || cleanTitle.includes('care') || cleanTitle.includes('bath')) {
    const ctx = SHOPPING_CONTEXT_OPTIONS.find((c) => c.id === 'personal')!;
    return { contextId: ctx.id, contextTitle: ctx.title, items: ctx.suggestedItems };
  }
  if (cleanTitle.includes('groc') || cleanTitle.includes('rashan') || cleanTitle.includes('sauda') || cleanTitle.includes('kitchen')) {
    const ctx = SHOPPING_CONTEXT_OPTIONS.find((c) => c.id === 'grocery')!;
    return { contextId: ctx.id, contextTitle: ctx.title, items: ctx.suggestedItems };
  }

  // Default to weekly essentials as friendly fallback
  const defaultCtx = SHOPPING_CONTEXT_OPTIONS.find((c) => c.id === 'weekly')!;
  return { contextId: 'weekly', contextTitle: 'Weekly Essentials', items: defaultCtx.suggestedItems };
}
