import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Plus,
  Check,
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

const QUICK_PRESETS = [
  { label: 'Grocery', contextId: 'grocery', iconName: 'shopping_bag' },
  { label: 'Weekly', contextId: 'weekly', iconName: 'calendar' },
  { label: 'Fruits & Sabzi', contextId: 'fruits_vegetables', iconName: 'apple' },
  { label: 'Supermarket', contextId: 'supermarket', iconName: 'store' },
  { label: 'BBQ / Dawat', contextId: 'bbq', iconName: 'flame' },
  { label: 'Pharmacy', contextId: 'pharmacy', iconName: 'heart_pulse' },
];

export const CreateListView: React.FC<CreateListViewProps> = ({
  onBack,
  onCreateList,
  onContinue,
}) => {
  const { t } = useLanguage();
  const [customTitle, setCustomTitle] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [selectedContextId, setSelectedContextId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleDispatchCreate = (title: string, iconName?: string, contextId?: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    triggerHaptic(14);

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
   * Fast 1-tap category selection - instantly creates the list
   */
  const handleSelectCategory = (ctx: ShoppingContextOption) => {
    if (isSubmitting) return;
    triggerHaptic(14);
    setSelectedContextId(ctx.id);

    const resolvedTitle = customTitle.trim() ? customTitle.trim() : ctx.title;
    setTimeout(() => {
      handleDispatchCreate(resolvedTitle, ctx.iconName, ctx.id);
    }, 120);
  };

  /**
   * Fast 1-tap quick preset selector
   */
  const handlePresetSelect = (item: (typeof QUICK_PRESETS)[0]) => {
    if (isSubmitting) return;
    triggerHaptic(14);
    setSelectedContextId(item.contextId);
    setTimeout(() => {
      handleDispatchCreate(item.label, item.iconName, item.contextId);
    }, 100);
  };

  /**
   * Direct custom title submission
   */
  const handleSubmitCustomTitle = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    const finalTitle = customTitle.trim();
    if (!finalTitle) {
      setErrorMsg(t('createList.errorEmpty') || 'Please enter a list name.');
      titleInputRef.current?.focus();
      return;
    }

    // Infer context
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
      {/* Clean Minimal Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-surface-dim/50">
        <div className="w-full max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="flex items-center justify-center w-10 h-10 -ms-2 rounded-full hover:bg-surface-container transition-colors text-on-surface active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            </button>
            <h1 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-on-surface">
              {t('createList.title') || 'Create New List'}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content Area - Text-less, Clean, Fast */}
      <main className="flex-1 w-full max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto px-4 sm:px-6 py-5 pb-20 flex flex-col gap-5">
        {/* 1. Name Input */}
        <form onSubmit={handleSubmitCustomTitle} className="space-y-2.5">
          <div className="relative flex items-center">
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
              className={`w-full h-12 ps-4 pe-24 bg-surface-container-lowest text-on-surface font-['Manrope'] text-sm sm:text-base rounded-2xl border transition-all outline-none placeholder:text-outline/60 shadow-2xs ${
                errorMsg
                  ? 'border-error focus:ring-2 focus:ring-error/25'
                  : 'border-surface-dim focus:border-primary focus:ring-2 focus:ring-primary/20'
              }`}
              placeholder={t('createList.customPlaceholder') || 'List name (e.g. Grocery, Party)...'}
              aria-label="List Name"
            />

            <button
              id="create_list_submit_btn"
              type="submit"
              disabled={isSubmitting}
              className="absolute end-1.5 top-1.5 bottom-1.5 px-4 rounded-xl bg-primary text-on-primary font-['Manrope'] text-xs font-bold flex items-center gap-1.5 hover:bg-primary-container active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-60"
            >
              <span>Create</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>

          {errorMsg && (
            <p className="font-['Manrope'] text-xs text-error flex items-center gap-1.5 pt-0.5 animate-in fade-in duration-150">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </p>
          )}

          {/* Quick 1-tap Pill Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
            {QUICK_PRESETS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handlePresetSelect(item)}
                className="px-3 py-1.5 rounded-full text-xs font-['Manrope'] font-medium bg-surface-container hover:bg-surface-container-high hover:border-primary/40 text-on-surface-variant hover:text-primary border border-surface-dim transition-all shrink-0 cursor-pointer active:scale-95 flex items-center gap-1"
              >
                <Plus className="w-3 h-3 text-primary/70" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </form>

        {/* 2. Instant Category Tiles (Clean, Visual, Text-less) */}
        <div className="pt-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {SHOPPING_CONTEXT_OPTIONS.map((ctx) => {
              const IconComp = ctx.icon;
              const isSelected = selectedContextId === ctx.id;

              return (
                <button
                  key={ctx.id}
                  id={`context-tile-${ctx.id}`}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSelectCategory(ctx)}
                  className={`p-3.5 rounded-2xl text-center flex flex-col items-center justify-center gap-2.5 transition-all duration-150 active:scale-[0.97] cursor-pointer group shadow-2xs border ${
                    isSelected
                      ? 'ring-2 ring-primary border-primary bg-primary-container/25 text-primary'
                      : 'bg-surface-container-lowest hover:bg-surface-container-low border-surface-dim hover:border-primary/40 text-on-surface'
                  }`}
                >
                  {/* Visual Icon Badge */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                      isSelected
                        ? 'bg-primary text-on-primary border-primary'
                        : `${ctx.accentBg} ${ctx.accentText} ${ctx.accentBorder} group-hover:scale-105`
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-5 h-5 text-on-primary stroke-[2.8]" />
                    ) : (
                      <IconComp className="w-5 h-5" strokeWidth={2.2} />
                    )}
                  </div>

                  {/* Clean 1-Line Category Name */}
                  <span
                    className={`font-['Plus_Jakarta_Sans'] font-bold text-xs sm:text-sm truncate w-full text-center ${
                      isSelected ? 'text-primary' : 'text-on-surface group-hover:text-primary'
                    }`}
                  >
                    {ctx.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
