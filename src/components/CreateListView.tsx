import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  ShoppingBag,
  Flame,
  Pill,
  Sparkles,
  Calendar,
  Store,
  Home,
  Apple,
  ListPlus,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { triggerHaptic } from '../lib/sound';

export interface CreateListViewProps {
  onBack: () => void;
  onCreateList: (title: string, icon?: string) => void;
  onContinue?: (title: string) => void;
}

interface SuggestedTemplate {
  id: string;
  defaultTitle: string;
  iconName: string;
  contextId: string;
  icon: React.ComponentType<{ className?: string }>;
  accentBg: string;
  accentText: string;
  accentBorder: string;
}

const SUGGESTED_TEMPLATES: SuggestedTemplate[] = [
  {
    id: 'weekly_grocery',
    defaultTitle: 'Weekly Grocery',
    iconName: 'shopping_bag',
    contextId: 'weekly_grocery',
    icon: ShoppingBag,
    accentBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    accentText: 'text-emerald-700 dark:text-emerald-400',
    accentBorder: 'border-emerald-500/25',
  },
  {
    id: 'bbq',
    defaultTitle: 'BBQ',
    iconName: 'flame',
    contextId: 'bbq',
    icon: Flame,
    accentBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    accentText: 'text-amber-700 dark:text-amber-400',
    accentBorder: 'border-amber-500/25',
  },
  {
    id: 'pharmacy',
    defaultTitle: 'Pharmacy',
    iconName: 'pill',
    contextId: 'pharmacy',
    icon: Pill,
    accentBg: 'bg-rose-500/10 dark:bg-rose-500/20',
    accentText: 'text-rose-700 dark:text-rose-400',
    accentBorder: 'border-rose-500/25',
  },
  {
    id: 'party',
    defaultTitle: 'Party',
    iconName: 'sparkles',
    contextId: 'party',
    icon: Sparkles,
    accentBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    accentText: 'text-purple-700 dark:text-purple-400',
    accentBorder: 'border-purple-500/25',
  },
  {
    id: 'monthly_shopping',
    defaultTitle: 'Monthly Shopping',
    iconName: 'calendar',
    contextId: 'monthly_shopping',
    icon: Calendar,
    accentBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    accentText: 'text-blue-700 dark:text-blue-400',
    accentBorder: 'border-blue-500/25',
  },
  {
    id: 'supermarket',
    defaultTitle: 'Supermarket',
    iconName: 'store',
    contextId: 'supermarket',
    icon: Store,
    accentBg: 'bg-teal-500/10 dark:bg-teal-500/20',
    accentText: 'text-teal-700 dark:text-teal-400',
    accentBorder: 'border-teal-500/25',
  },
  {
    id: 'household',
    defaultTitle: 'Home Essentials',
    iconName: 'home',
    contextId: 'household',
    icon: Home,
    accentBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    accentText: 'text-indigo-700 dark:text-indigo-400',
    accentBorder: 'border-indigo-500/25',
  },
  {
    id: 'fruits_vegetables',
    defaultTitle: 'Fruits & Vegetables',
    iconName: 'apple',
    contextId: 'fruits_vegetables',
    icon: Apple,
    accentBg: 'bg-lime-500/10 dark:bg-lime-500/20',
    accentText: 'text-lime-700 dark:text-lime-400',
    accentBorder: 'border-lime-500/25',
  },
  {
    id: 'other',
    defaultTitle: 'Other',
    iconName: 'list_plus',
    contextId: 'other',
    icon: ListPlus,
    accentBg: 'bg-slate-500/10 dark:bg-slate-500/20',
    accentText: 'text-slate-700 dark:text-slate-400',
    accentBorder: 'border-slate-500/25',
  },
];

export const CreateListView: React.FC<CreateListViewProps> = ({
  onBack,
  onCreateList,
  onContinue,
}) => {
  const { t } = useLanguage();
  const [customName, setCustomName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const customInputRef = useRef<HTMLInputElement>(null);

  const handleDispatchCreate = (title: string, icon?: string) => {
    triggerHaptic(12);
    if (onCreateList) {
      onCreateList(title, icon);
    } else if (onContinue) {
      onContinue(title);
    }
  };

  const handleCustomSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customName.trim();
    if (!trimmed) {
      setErrorMsg(t('createList.errorEmpty') || 'Please enter a list name first.');
      customInputRef.current?.focus();
      return;
    }
    setErrorMsg('');
    handleDispatchCreate(trimmed, 'shopping_basket');
  };

  const handleSelectTemplate = (template: SuggestedTemplate) => {
    if (template.id === 'other') {
      // Focus custom list input smoothly
      customInputRef.current?.focus();
      customInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const localizedTitle =
      t(`createList.types.${template.id}.title`) || template.defaultTitle;
    handleDispatchCreate(localizedTitle, template.iconName);
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
      <main className="flex-1 w-full max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-5 sm:py-6 pb-20 flex flex-col gap-6 sm:gap-7">
        {/* Intro description */}
        <div>
          <h2 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
            {t('createList.title') || 'Create New List'}
          </h2>
          <p className="font-['Manrope'] text-sm sm:text-base text-on-surface-variant mt-1.5 leading-relaxed max-w-2xl">
            {t('createList.subtitle') ||
              'Choose a suggested list type or enter your own custom name.'}
          </p>
        </div>

        {/* Custom List Section */}
        <section
          aria-labelledby="custom-list-heading"
          className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-surface-dim/80 shadow-2xs"
        >
          <div className="mb-2.5">
            <span
              id="custom-list-heading"
              className="text-xs font-['Manrope'] font-bold text-outline uppercase tracking-wider block"
            >
              {t('createList.customSectionTitle') || 'Custom List'}
            </span>
          </div>

          <form onSubmit={handleCustomSubmit} className="space-y-2.5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1">
                <input
                  ref={customInputRef}
                  id="custom-list-name-input"
                  dir="auto"
                  type="text"
                  value={customName}
                  onChange={(e) => {
                    setCustomName(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  className={`w-full h-13 px-4 bg-surface-container-low text-on-surface font-['Manrope'] text-base rounded-xl sm:rounded-2xl border transition-all duration-200 outline-none placeholder:text-outline/70 ${
                    errorMsg
                      ? 'border-error focus:ring-2 focus:ring-error/25'
                      : 'border-surface-dim focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
                  placeholder={
                    t('createList.customPlaceholder') ||
                    'Enter custom list name (e.g. Dawat, Eid Shopping)...'
                  }
                  aria-label={t('createList.customSectionTitle') || 'Custom List Name'}
                />
              </div>

              <button
                type="submit"
                id="custom-list-continue-btn"
                className="h-13 px-6 bg-primary text-on-primary font-['Manrope'] text-base font-bold rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-container transition-all shadow-xs active:scale-[0.98] shrink-0 cursor-pointer min-w-[120px]"
              >
                <span>{t('createList.continueBtn') || 'Continue'}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>

            {errorMsg && (
              <p className="font-['Manrope'] text-xs sm:text-sm text-error flex items-center gap-1.5 pt-0.5 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </p>
            )}
          </form>
        </section>

        {/* Suggested List Types Section */}
        <section aria-labelledby="suggested-types-heading" className="space-y-3 sm:space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h3
                id="suggested-types-heading"
                className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-bold text-primary"
              >
                {t('createList.suggestedSectionTitle') || 'Suggested Lists'}
              </h3>
              <p className="font-['Manrope'] text-xs sm:text-sm text-outline mt-0.5">
                {t('createList.suggestedSubtitle') ||
                  'Tap any to start adding items immediately'}
              </p>
            </div>
            <span className="text-[11px] font-semibold text-primary/80 bg-surface-container px-2.5 py-1 rounded-full border border-surface-dim hidden sm:inline-block">
              1-Tap Start
            </span>
          </div>

          {/* Grid layout: 1 col on mobile, 2 cols on tablet, 3 cols on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
            {SUGGESTED_TEMPLATES.map((tpl) => {
              const IconComp = tpl.icon;
              const title = t(`createList.types.${tpl.id}.title`) || tpl.defaultTitle;
              const desc =
                t(`createList.types.${tpl.id}.desc`) ||
                'Tap to create list and add items';

              return (
                <button
                  key={tpl.id}
                  id={`suggested-template-${tpl.id}`}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl)}
                  className="w-full min-h-[72px] p-3.5 sm:p-4 rounded-2xl bg-surface-container-lowest hover:bg-surface-container-low border border-surface-dim/80 hover:border-primary/40 text-start flex items-center gap-3.5 transition-all duration-150 active:scale-[0.98] cursor-pointer group shadow-2xs hover:shadow-xs"
                >
                  {/* Icon badge */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${tpl.accentBg} ${tpl.accentText} ${tpl.accentBorder} group-hover:scale-105 transition-transform`}
                  >
                    <IconComp className="w-6 h-6" />
                  </div>

                  {/* Text content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-['Plus_Jakarta_Sans'] font-bold text-base text-on-surface truncate group-hover:text-primary transition-colors">
                        {title}
                      </span>
                    </div>
                    <p className="font-['Manrope'] text-xs text-on-surface-variant line-clamp-1 mt-0.5 leading-snug">
                      {desc}
                    </p>
                  </div>

                  {/* Indicator Chevron */}
                  <div className="shrink-0 text-outline/50 group-hover:text-primary transition-colors">
                    <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};
