import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CalendarDays,
  ShoppingBasket,
  Apple,
  ShoppingCart,
  Flame,
  Coffee,
  Home,
  Pill,
  Sparkles,
  PartyPopper,
  Cake,
  Plus,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAppTheme } from '../context/ThemeContext';
import { triggerHaptic } from '../lib/sound';
import {
  SHOPPING_CONTEXT_OPTIONS,
  ShoppingContextOption,
} from '../lib/recommendations/shoppingContexts';

export interface CreateListViewProps {
  onBack: () => void;
  onCreateList: (title: string, icon?: string, contextId?: string) => void;
  onContinue?: (title: string, icon?: string, contextId?: string) => void;
}

// Updated distinct icons for category cards
const CONTEXT_ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  weekly: CalendarDays,
  grocery: ShoppingBasket,
  fruits_vegetables: Apple,
  supermarket: ShoppingCart,
  bbq: Flame,
  breakfast: Coffee,
  home: Home,
  pharmacy: Pill,
  personal: Sparkles,
  party: PartyPopper,
  baking: Cake,
};

export const CreateListView: React.FC<CreateListViewProps> = ({
  onBack,
  onCreateList,
  onContinue,
}) => {
  const { t } = useLanguage();
  const { theme, currentThemeConfig } = useAppTheme();
  const [customTitle, setCustomTitle] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [selectedContextId, setSelectedContextId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Compute theme-responsive icon color: Default black in light theme, white in dark mode, or active theme color if changed in settings
  const iconColor = currentThemeConfig?.isDark
    ? '#ffffff'
    : theme === 'default'
    ? '#000000'
    : currentThemeConfig?.primary || '#000000';

  const handleDispatchCreate = (title: string, iconName?: string, contextId?: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    triggerHaptic(14);

    const resolvedTitle = title.trim() || t('createList.title') || 'Shopping List';
    const resolvedIcon = iconName || 'shopping_basket';
    const resolvedContext = contextId || 'weekly';

    if (onCreateList) {
      onCreateList(resolvedTitle, resolvedIcon, resolvedContext);
    } else if (onContinue) {
      onContinue(resolvedTitle, resolvedIcon, resolvedContext);
    }
  };

  /**
   * Fast 1-tap category selection - clicking either card or right animated plus circle creates the list
   */
  const handleSelectCategory = (ctx: ShoppingContextOption) => {
    if (isSubmitting) return;
    triggerHaptic(14);
    setSelectedContextId(ctx.id);

    const resolvedTitle = customTitle.trim() ? customTitle.trim() : ctx.title;
    setTimeout(() => {
      handleDispatchCreate(resolvedTitle, ctx.iconName, ctx.id);
    }, 180);
  };

  /**
   * Direct custom title submission with validation
   */
  const handleSubmitCustomTitle = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    const finalTitle = customTitle.trim();
    if (!finalTitle) {
      triggerHaptic(25);
      setErrorMsg(t('createList.errorEmpty') || 'First enter the list name, then continue.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      titleInputRef.current?.focus();
      return;
    }

    // Infer context from title
    const lower = finalTitle.toLowerCase();
    let bestContextId = 'custom';
    let bestIcon = 'list_plus';

    if (lower.includes('bbq') || lower.includes('grill') || lower.includes('tikka')) {
      bestContextId = 'bbq';
      bestIcon = 'flame';
    } else if (lower.includes('nashta') || lower.includes('breakfast') || lower.includes('chai')) {
      bestContextId = 'breakfast';
      bestIcon = 'coffee';
    } else if (lower.includes('sabzi') || lower.includes('vegetable') || lower.includes('fruit') || lower.includes('phal')) {
      bestContextId = 'fruits_vegetables';
      bestIcon = 'apple';
    } else if (lower.includes('supermarket') || lower.includes('mart') || lower.includes('imtiaz') || lower.includes('carrefour')) {
      bestContextId = 'supermarket';
      bestIcon = 'store';
    } else if (lower.includes('pharmacy') || lower.includes('dawa') || lower.includes('medicine')) {
      bestContextId = 'pharmacy';
      bestIcon = 'heart_pulse';
    } else if (lower.includes('groc') || lower.includes('rashan') || lower.includes('sauda')) {
      bestContextId = 'grocery';
      bestIcon = 'shopping_bag';
    } else if (lower.includes('week') || lower.includes('hafta') || lower.includes('month')) {
      bestContextId = 'weekly';
      bestIcon = 'calendar';
    } else if (lower.includes('home') || lower.includes('safai') || lower.includes('cleaning')) {
      bestContextId = 'home';
      bestIcon = 'home';
    }

    setSelectedContextId(bestContextId);
    handleDispatchCreate(finalTitle, bestIcon, bestContextId);
  };

  return (
    <div className="w-full min-h-screen flex flex-col antialiased bg-background text-on-surface">
      {/* 1. Header: Minimal with back button only */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-surface-dim/40">
        <div className="w-full max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto flex items-center justify-between px-4 sm:px-6 h-12">
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="flex items-center justify-center w-9 h-9 -ms-2 rounded-full hover:bg-surface-container transition-colors text-on-surface active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
        </div>
      </header>

      {/* 2. Main Page Content: Tight, balanced spacing with heading slightly below header */}
      <main className="flex-1 w-full max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto px-4 sm:px-6 pt-2.5 pb-20 flex flex-col gap-3">
        {/* Page Title: Create New List placed cleanly inside the page */}
        <div>
          <h1 className="font-['Plus_Jakarta_Sans'] text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">
            {t('createList.title') || 'Create New List'}
          </h1>
        </div>

        {/* 3. List Name Input Field: Round shape, 'List Name' placeholder, circle with right arrow */}
        <form onSubmit={handleSubmitCustomTitle} className="space-y-1.5">
          <div
            className={`relative flex items-center w-full rounded-full border transition-all bg-surface-container-lowest shadow-xs ${
              isShaking ? 'animate-bounce' : ''
            } ${
              errorMsg
                ? 'border-error ring-2 ring-error/20'
                : 'border-neutral-300 dark:border-neutral-700 focus-within:border-black dark:focus-within:border-white focus-within:ring-2 focus-within:ring-black/10 dark:focus-within:ring-white/10'
            }`}
          >
            <input
              ref={titleInputRef}
              id="list_title_input"
              dir="auto"
              type="text"
              value={customTitle}
              onChange={(e) => {
                setCustomTitle(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              className="w-full h-11 sm:h-12 ps-5 pe-14 bg-transparent text-on-surface font-['Manrope'] text-sm sm:text-base outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-full"
              placeholder={t('createList.customPlaceholder') || 'List Name'}
              aria-label="List Name"
            />

            {/* Circular button with right arrow */}
            <button
              id="create_list_submit_btn"
              type="submit"
              disabled={isSubmitting}
              aria-label="Continue"
              className="absolute end-1.5 top-1.5 bottom-1.5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>

          {/* Validation Alert Message */}
          {errorMsg && (
            <div
              role="alert"
              className="px-3.5 py-2 rounded-2xl bg-error/10 border border-error/20 text-error font-['Manrope'] text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in duration-150"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </form>

        {/* 4. Categories Section Heading */}
        <div className="pt-1">
          <h2 className="font-['Plus_Jakarta_Sans'] text-sm sm:text-base font-bold text-on-surface text-start px-0.5">
            {t('createList.categoriesHeading') || 'Categories'}
          </h2>
        </div>

        {/* 5. Compact Category Cards with Left Icon, Name, and Right Animated Plus in Circle */}
        <div className="flex flex-col gap-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
            {SHOPPING_CONTEXT_OPTIONS.map((ctx) => {
              const IconComp = CONTEXT_ICON_MAP[ctx.id] || ctx.icon;
              const isSelected = selectedContextId === ctx.id;

              return (
                <button
                  key={ctx.id}
                  id={`context-tile-${ctx.id}`}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSelectCategory(ctx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-2xl border transition-all duration-150 active:scale-[0.98] cursor-pointer group shadow-2xs text-start ${
                    isSelected
                      ? 'border-black dark:border-white ring-2 ring-black/20 dark:ring-white/20 bg-surface-container-low'
                      : 'bg-surface-container-lowest hover:bg-surface-container-low border-surface-dim hover:border-black/30 dark:hover:border-white/30 text-on-surface'
                  }`}
                >
                  {/* Left Side: Icon + Category Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Left Icon Container: Default black in light theme, theme-responsive */}
                    <div
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-200/80 dark:border-neutral-700/80 transition-transform group-hover:scale-105"
                      style={{ color: iconColor }}
                    >
                      <IconComp className="w-5 h-5" strokeWidth={2.2} />
                    </div>

                    {/* Right Hand Side of Icon: Category Name */}
                    <span className="font-['Plus_Jakarta_Sans'] font-semibold text-sm sm:text-base text-on-surface truncate">
                      {ctx.title}
                    </span>
                  </div>

                  {/* Right Side: Circle with Animated Plus */}
                  <div
                    className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 ms-2 text-black dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all"
                    aria-hidden="true"
                  >
                    <Plus
                      className={`w-4 h-4 transition-transform duration-200 ease-out group-hover:rotate-90 group-active:scale-125 ${
                        isSelected ? 'rotate-90 scale-125 text-emerald-600 dark:text-emerald-400' : ''
                      }`}
                      strokeWidth={2.5}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
