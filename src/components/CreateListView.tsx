import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  ShoppingBag,
  Flame,
  Sparkles,
  Calendar,
  Store,
  Home,
  ListPlus,
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

const QUICK_TITLES = [
  'Weekly Shopping',
  'Grocery',
  'BBQ',
  'Supermarket',
  'Monthly Shopping',
];

export const CreateListView: React.FC<CreateListViewProps> = ({
  onBack,
  onCreateList,
  onContinue,
}) => {
  const { t } = useLanguage();
  const [selectedContextId, setSelectedContextId] = useState<string>('weekly');
  const [customTitle, setCustomTitle] = useState<string>('Weekly Shopping');
  const [isTitleDirty, setIsTitleDirty] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  const selectedContext =
    SHOPPING_CONTEXT_OPTIONS.find((c) => c.id === selectedContextId) ||
    SHOPPING_CONTEXT_OPTIONS[0];

  const handleDispatchCreate = (title: string, iconName?: string, contextId?: string) => {
    triggerHaptic(12);
    const resolvedTitle = title.trim() || selectedContext.title;
    const resolvedIcon = iconName || selectedContext.iconName || 'shopping_basket';
    const resolvedContext = contextId || selectedContextId;

    if (onCreateList) {
      onCreateList(resolvedTitle, resolvedIcon, resolvedContext);
    } else if (onContinue) {
      onContinue(resolvedTitle, resolvedIcon, resolvedContext);
    }
  };

  const handleSelectContext = (ctx: ShoppingContextOption) => {
    triggerHaptic(8);
    setSelectedContextId(ctx.id);
    setErrorMsg('');

    // If the user hasn't explicitly customized their title yet, update the title to match context
    if (!isTitleDirty) {
      if (ctx.id === 'custom') {
        setCustomTitle('');
        titleInputRef.current?.focus();
      } else {
        setCustomTitle(ctx.title);
      }
    }
  };

  const handleQuickTitleClick = (preset: string) => {
    triggerHaptic(8);
    setCustomTitle(preset);
    setIsTitleDirty(true);
    setErrorMsg('');

    // Select corresponding context if it matches
    const lower = preset.toLowerCase();
    if (lower.includes('bbq')) setSelectedContextId('bbq');
    else if (lower.includes('week') || lower.includes('month')) setSelectedContextId('weekly');
    else if (lower.includes('supermarket')) setSelectedContextId('supermarket');
    else if (lower.includes('groc')) setSelectedContextId('grocery');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalTitle = customTitle.trim() || selectedContext.title;
    if (!finalTitle) {
      setErrorMsg(t('createList.errorEmpty') || 'Please enter a list name first.');
      titleInputRef.current?.focus();
      return;
    }
    handleDispatchCreate(finalTitle, selectedContext.iconName, selectedContext.id);
  };

  return (
    <div className="w-full min-h-screen flex flex-col antialiased bg-background text-on-surface">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-surface-dim/50">
        <div className="w-full max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto flex items-center px-4 sm:px-6 md:px-8 h-14">
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="flex items-center justify-center w-10 h-10 -ms-2 rounded-full hover:bg-surface-container-low transition-colors text-primary active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180 text-primary" />
          </button>
          <h1 className="ms-2 font-['Plus_Jakarta_Sans'] text-lg sm:text-xl font-bold text-primary truncate">
            {t('createList.title') || 'Create New List'}
          </h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-5 sm:py-6 pb-24 flex flex-col gap-6 sm:gap-7">
        {/* Intro */}
        <div>
          <h2 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
            {t('createList.title') || 'Create New List'}
          </h2>
          <p className="font-['Manrope'] text-sm sm:text-base text-on-surface-variant mt-1.5 leading-relaxed max-w-2xl">
            Choose a shopping context or enter a custom title to start adding household essentials instantly.
          </p>
        </div>

        {/* 1. LIST TITLE INPUT */}
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
              List Title
            </label>
            <span className="text-[11px] font-['Manrope'] text-on-surface-variant">
              Customizable
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <input
                ref={titleInputRef}
                id="list-title-input"
                dir="auto"
                type="text"
                value={customTitle}
                onChange={(e) => {
                  setCustomTitle(e.target.value);
                  setIsTitleDirty(true);
                  if (errorMsg) setErrorMsg('');
                }}
                className={`w-full h-13 px-4 bg-surface-container-low text-on-surface font-['Manrope'] text-base rounded-xl sm:rounded-2xl border transition-all duration-200 outline-none placeholder:text-outline/70 ${
                  errorMsg
                    ? 'border-error focus:ring-2 focus:ring-error/25'
                    : 'border-surface-dim focus:border-primary focus:ring-2 focus:ring-primary/20'
                }`}
                placeholder="e.g. Weekly Shopping, BBQ, Supermarket, Monthly Shopping..."
                aria-label="List Title"
              />
            </div>

            {errorMsg && (
              <p className="font-['Manrope'] text-xs sm:text-sm text-error flex items-center gap-1.5 pt-0.5 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </p>
            )}

            {/* Quick 1-tap Title Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
              <span className="text-xs font-['Manrope'] text-outline shrink-0 me-1">
                Quick:
              </span>
              {QUICK_TITLES.map((title) => {
                const isActive = customTitle.trim().toLowerCase() === title.toLowerCase();
                return (
                  <button
                    key={title}
                    type="button"
                    onClick={() => handleQuickTitleClick(title)}
                    className={`px-3 py-1.5 rounded-full text-xs font-['Manrope'] font-semibold transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-primary text-on-primary shadow-2xs'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-surface-dim/70'
                    }`}
                  >
                    {title}
                  </button>
                );
              })}
            </div>
          </form>
        </section>

        {/* 2. CATEGORY / CONTEXT SELECTOR */}
        <section aria-labelledby="context-selector-heading" className="space-y-3 sm:space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h3
                id="context-selector-heading"
                className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-bold text-primary"
              >
                Choose Category / Context
              </h3>
              <p className="font-['Manrope'] text-xs sm:text-sm text-outline mt-0.5">
                Prepares tailored recommendations for easy 1-tap addition
              </p>
            </div>
            <span className="text-[11px] font-semibold text-primary/80 bg-surface-container px-2.5 py-1 rounded-full border border-surface-dim hidden sm:inline-block">
              Tailored Essentials
            </span>
          </div>

          {/* Context Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
            {SHOPPING_CONTEXT_OPTIONS.map((ctx) => {
              const IconComp = ctx.icon;
              const isSelected = selectedContextId === ctx.id;

              return (
                <button
                  key={ctx.id}
                  id={`context-option-${ctx.id}`}
                  type="button"
                  onClick={() => handleSelectContext(ctx)}
                  className={`w-full p-3.5 sm:p-4 rounded-2xl text-start flex items-start gap-3.5 transition-all duration-150 active:scale-[0.98] cursor-pointer group border ${
                    isSelected
                      ? 'bg-surface-container-lowest border-primary shadow-sm ring-1 ring-primary/30'
                      : 'bg-surface-container-lowest hover:bg-surface-container-low border-surface-dim/80 shadow-2xs hover:shadow-xs'
                  }`}
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
                      <span className={`font-['Plus_Jakarta_Sans'] font-bold text-base truncate transition-colors ${
                        isSelected ? 'text-primary' : 'text-on-surface group-hover:text-primary'
                      }`}>
                        {ctx.title}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <p className="font-['Manrope'] text-xs text-on-surface-variant line-clamp-2 mt-0.5 leading-snug">
                      {ctx.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. CONTEXT SUGGESTIONS PREVIEW */}
        {selectedContext.suggestedItems.length > 0 && (
          <section
            aria-labelledby="context-suggestions-heading"
            className="bg-surface-container-lowest/80 rounded-2xl p-4 sm:p-5 border border-surface-dim/80 shadow-2xs space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span
                id="context-suggestions-heading"
                className="text-xs font-['Manrope'] font-bold text-primary flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Suggested essentials for {selectedContext.title}:</span>
              </span>
              <span className="text-[10px] font-['Manrope'] text-outline uppercase tracking-wider">
                1-tap add ready
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedContext.suggestedItems.map((item) => (
                <span
                  key={item}
                  className="px-2.5 py-1 rounded-lg bg-surface-container text-xs font-['Manrope'] font-medium text-on-surface-variant border border-surface-dim/60"
                >
                  {item}
                </span>
              ))}
            </div>

            <p className="font-['Manrope'] text-[11px] text-on-surface-variant/80 pt-1 leading-relaxed">
              These will be ready for 1-tap addition on the next screen. You can also search or add any custom item.
            </p>
          </section>
        )}

        {/* 4. PRIMARY CONTINUE ACTION */}
        <div className="pt-2">
          <button
            type="button"
            id="create-list-continue-btn"
            onClick={handleSubmit}
            className="w-full h-14 bg-primary text-on-primary font-['Manrope'] text-base font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-container transition-all shadow-md active:scale-[0.99] cursor-pointer"
          >
            <span>Continue to Add Items</span>
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </button>
        </div>
      </main>
    </div>
  );
};
