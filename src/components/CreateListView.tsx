import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Plus,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
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

const QUICK_TITLES = [
  { label: 'Weekly Shopping', contextId: 'weekly', iconName: 'calendar' },
  { label: 'Grocery & Staples', contextId: 'grocery', iconName: 'shopping_bag' },
  { label: 'Fruits & Sabzi', contextId: 'fruits_vegetables', iconName: 'apple' },
  { label: 'Supermarket / Mart', contextId: 'supermarket', iconName: 'store' },
  { label: 'BBQ / Dawat', contextId: 'bbq', iconName: 'flame' },
  { label: 'Nashta / Breakfast', contextId: 'breakfast', iconName: 'coffee' },
  { label: 'Household & Safai', contextId: 'home', iconName: 'home' },
  { label: 'Pharmacy & Health', contextId: 'pharmacy', iconName: 'heart_pulse' },
];

export const CreateListView: React.FC<CreateListViewProps> = ({
  onBack,
  onCreateList,
  onContinue,
}) => {
  const { t } = useLanguage();
  const [customTitle, setCustomTitle] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleDispatchCreate = (title: string, iconName?: string, contextId?: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    triggerHaptic(12);

    const resolvedTitle = title.trim() || 'Shopping List';
    const resolvedIcon = iconName || 'shopping_basket';
    const resolvedContext = contextId || 'weekly';

    if (onCreateList) {
      onCreateList(resolvedTitle, resolvedIcon, resolvedContext);
    } else if (onContinue) {
      onContinue(resolvedTitle, resolvedIcon, resolvedContext);
    }
  };

  /**
   * Immediately navigates to Add Items screen upon tapping a category/context.
   */
  const handleSelectContextImmediate = (ctx: ShoppingContextOption) => {
    if (ctx.id === 'custom' && !customTitle.trim()) {
      // If user tapped "Custom" with no title, focus input for typing
      triggerHaptic(6);
      titleInputRef.current?.focus();
      return;
    }

    // If user has typed a custom title, prefer their typed title; otherwise use the context title
    const resolvedTitle = customTitle.trim() ? customTitle.trim() : ctx.title;
    handleDispatchCreate(resolvedTitle, ctx.iconName, ctx.id);
  };

  /**
   * Fast 1-tap quick title selector - immediately dispatches
   */
  const handleQuickTitleSelect = (item: typeof QUICK_TITLES[0]) => {
    handleDispatchCreate(item.label, item.iconName, item.contextId);
  };

  /**
   * Handles direct submission from custom title form
   */
  const handleSubmitCustomTitle = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalTitle = customTitle.trim();
    if (!finalTitle) {
      setErrorMsg(t('createList.errorEmpty') || 'Please enter a list name first.');
      titleInputRef.current?.focus();
      return;
    }

    // Infer best context from custom title
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

    handleDispatchCreate(finalTitle, bestIcon, bestContextId);
  };

  return (
    <div className="w-full min-h-screen flex flex-col antialiased bg-background text-on-surface">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-surface-dim/50">
        <div className="w-full max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 md:px-8 h-14">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="flex items-center justify-center w-10 h-10 -ms-2 rounded-full hover:bg-surface-container-low transition-colors text-primary active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 rtl:rotate-180 text-primary" />
            </button>
            <h1 className="font-['Plus_Jakarta_Sans'] text-lg sm:text-xl font-bold text-primary truncate">
              {t('createList.title') || 'Create New List'}
            </h1>
          </div>
          <span className="text-xs font-['Manrope'] font-medium text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full border border-surface-dim flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>1-Tap Fast Create</span>
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-5 sm:py-6 pb-20 flex flex-col gap-6 sm:gap-7">
        {/* Intro */}
        <div>
          <h2 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
            {t('createList.title') || 'Create New List'}
          </h2>
          <p className="font-['Manrope'] text-sm sm:text-base text-on-surface-variant mt-1.5 leading-relaxed max-w-2xl">
            Tap any category below to immediately start adding items with context-aware smart suggestions.
          </p>
        </div>

        {/* 1. CUSTOM LIST TITLE INPUT WITH DIRECT PROCEED */}
        <section
          aria-labelledby="list-title-heading"
          className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-surface-dim/80 shadow-2xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <label
              htmlFor="list-title-input"
              id="list-title-heading"
              className="text-xs font-['Manrope'] font-bold text-outline uppercase tracking-wider block"
            >
              Custom Title (Optional)
            </label>
            <span className="text-[11px] font-['Manrope'] text-on-surface-variant">
              Press Enter or tap →
            </span>
          </div>

          <form onSubmit={handleSubmitCustomTitle} className="space-y-3">
            <div className="relative flex items-center">
              <input
                ref={titleInputRef}
                id="list-title-input"
                dir="auto"
                type="text"
                value={customTitle}
                onChange={(e) => {
                  setCustomTitle(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className={`w-full h-13 ps-4 pe-28 bg-surface-container-low text-on-surface font-['Manrope'] text-base rounded-xl sm:rounded-2xl border transition-all duration-200 outline-none placeholder:text-outline/70 ${
                  errorMsg
                    ? 'border-error focus:ring-2 focus:ring-error/25'
                    : 'border-surface-dim focus:border-primary focus:ring-2 focus:ring-primary/20'
                }`}
                placeholder="e.g. Eid Shopping, Party, Mom's List..."
                aria-label="List Title"
              />

              {/* Inline Create Button */}
              <button
                type="submit"
                className="absolute end-1.5 top-1.5 bottom-1.5 px-4 rounded-xl bg-primary text-on-primary font-['Manrope'] text-xs sm:text-sm font-bold flex items-center gap-1.5 hover:bg-primary-container active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <span>Create</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>

            {errorMsg && (
              <p className="font-['Manrope'] text-xs sm:text-sm text-error flex items-center gap-1.5 pt-0.5 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </p>
            )}

            {/* Quick 1-tap Direct Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
              <span className="text-xs font-['Manrope'] text-outline shrink-0 me-1">
                Quick:
              </span>
              {QUICK_TITLES.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleQuickTitleSelect(item)}
                  className="px-3 py-1.5 rounded-full text-xs font-['Manrope'] font-semibold bg-surface-container hover:bg-surface-container-high hover:border-primary/40 text-on-surface-variant hover:text-primary border border-surface-dim/70 transition-all shrink-0 cursor-pointer active:scale-95 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-primary/70" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </form>
        </section>

        {/* 2. INSTANT 1-TAP CATEGORY SELECTOR */}
        <section aria-labelledby="context-selector-heading" className="space-y-3 sm:space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h3
                id="context-selector-heading"
                className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-bold text-primary flex items-center gap-2"
              >
                <span>Choose Category</span>
                <span className="text-xs font-normal text-on-surface-variant">
                  (Tap to open & add items)
                </span>
              </h3>
              <p className="font-['Manrope'] text-xs sm:text-sm text-outline mt-0.5">
                Automatically loads tailored Pakistani essentials and smart recommendations
              </p>
            </div>
          </div>

          {/* Context Options Grid: Tapping immediately transitions to Add Items! */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
            {SHOPPING_CONTEXT_OPTIONS.map((ctx) => {
              const IconComp = ctx.icon;

              return (
                <button
                  key={ctx.id}
                  id={`context-option-${ctx.id}`}
                  type="button"
                  onClick={() => handleSelectContextImmediate(ctx)}
                  className="w-full p-3.5 sm:p-4 rounded-2xl text-start flex items-start gap-3.5 bg-surface-container-lowest hover:bg-surface-container-low border border-surface-dim/80 hover:border-primary/50 shadow-2xs hover:shadow-xs transition-all duration-150 active:scale-[0.98] cursor-pointer group"
                >
                  {/* Icon badge */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${ctx.accentBg} ${ctx.accentText} ${ctx.accentBorder} group-hover:scale-105 transition-transform`}
                  >
                    <IconComp className="w-5 h-5" strokeWidth={2} />
                  </div>

                  {/* Text content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-['Plus_Jakarta_Sans'] font-bold text-base truncate text-on-surface group-hover:text-primary transition-colors">
                        {ctx.title}
                      </span>
                      <ArrowRight className="w-4 h-4 text-outline group-hover:text-primary group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all shrink-0" />
                    </div>
                    <p className="font-['Manrope'] text-xs text-on-surface-variant line-clamp-2 mt-0.5 leading-snug">
                      {ctx.subtitle}
                    </p>

                    {/* Sample items pill preview */}
                    {ctx.suggestedItems.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ctx.suggestedItems.slice(0, 3).map((item) => (
                          <span
                            key={item}
                            className="text-[10px] font-['Manrope'] px-1.5 py-0.5 rounded-md bg-surface-container text-on-surface-variant border border-surface-dim/60"
                          >
                            {item}
                          </span>
                        ))}
                        {ctx.suggestedItems.length > 3 && (
                          <span className="text-[10px] font-['Manrope'] text-outline self-center">
                            +{ctx.suggestedItems.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Helpful Tip */}
        <div className="p-3.5 rounded-2xl bg-surface-container-low/60 border border-surface-dim flex items-center gap-2.5 text-xs text-on-surface-variant font-['Manrope']">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <span>
            Smart suggestions will adapt automatically as you add items, showing frequent Pakistani staples and complementary ingredients.
          </span>
        </div>
      </main>
    </div>
  );
};
