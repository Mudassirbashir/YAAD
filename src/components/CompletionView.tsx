import React, { useEffect } from 'react';
import { Check, Star, CheckCircle2, Plus, Sparkles, Home, History } from 'lucide-react';
import { ShoppingList, CategoryId } from '../types';
import { TopHeader } from './TopHeader';
import { CategoryIcon } from './CategoryIcon';
import { useLanguage } from '../context/LanguageContext';
import { playCompletionSound } from '../lib/sound';
import { BidiText } from '../utils/bidi';

interface CompletionViewProps {
  list: ShoppingList;
  onReturnHome: () => void;
  onViewHistory: () => void;
  onAddMoreItems: () => void;
  onOpenProfile: () => void;
}

export const CompletionView: React.FC<CompletionViewProps> = ({
  list,
  onReturnHome,
  onViewHistory,
  onAddMoreItems,
  onOpenProfile,
}) => {
  const { t, getCategoryName, language } = useLanguage();

  // Play crisp completion chime on entry
  useEffect(() => {
    playCompletionSound();
  }, []);

  // Group list items by categoryId for summary card
  const categoryIds: CategoryId[] = Array.from(
    new Set(list.items.map((i) => (i.categoryId || 'other') as CategoryId))
  );

  return (
    <div className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto min-h-screen flex flex-col antialiased bg-background pb-28 selection:bg-primary-container selection:text-on-primary-container">
      {/* TopAppBar */}
      <TopHeader
        title={t('appName')}
        onSettingsClick={onOpenProfile}
        onAvatarClick={onOpenProfile}
      />

      {/* Main Container */}
      <main className="flex-1 px-4 sm:px-6 md:px-8 space-y-6 pt-2">
        {/* Celebration Header with Smooth YAAD Logo Animation */}
        <section className="text-center py-5 space-y-3 flex flex-col items-center select-none">
          {/* Animated YAAD Logo & Success Badge Container */}
          <div className="relative mb-2">
            {/* Outer Subtle Radiant Pulse (Gentle, warm glow) */}
            <div className="absolute -inset-2 bg-gradient-to-tr from-secondary-fixed/40 to-primary-fixed/30 rounded-full blur-md opacity-60 animate-pulse pointer-events-none" />
            
            {/* Main Central Icon Container with smooth entry */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-b from-primary to-primary-container flex items-center justify-center shadow-[0px_10px_28px_rgba(0,30,21,0.22)] border-2 border-primary-fixed/30 transform transition-all duration-500 ease-out hover:scale-105 animate-in zoom-in-75 duration-300">
              
              {/* YAAD Lettering / Logo Brandmark Background */}
              <span className={`font-urdu-brand text-2xl text-primary-fixed/25 absolute select-none ${language === 'ur' ? 'text-3xl font-bold' : ''}`}>
                یاد
              </span>

              {/* Polished Checkmark */}
              <Check className="w-10 h-10 sm:w-11 sm:h-11 text-primary-fixed stroke-[3.2] relative z-10 drop-shadow-sm" />

              {/* Floating Star Accent */}
              <div className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-md border border-white/40 animate-in spin-in-90 duration-300">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-on-secondary-container fill-current" />
              </div>
            </div>
          </div>

          {/* Small Success Confirmation Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary-fixed/30 border border-primary-fixed text-primary text-xs font-['Manrope'] font-bold tracking-tight shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>{t('completion.badgeCompleted')}</span>
          </div>

          <h2 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-extrabold text-primary tracking-tight leading-tight">
            {t('completion.title')}
          </h2>
          <p className="font-['Manrope'] text-sm sm:text-base text-on-surface-variant max-w-xs mx-auto leading-relaxed">
            {t('completion.subtitle')}
          </p>
        </section>

        {/* Completed List Container */}
        <section className="bg-surface-container-lowest rounded-3xl shadow-[0px_6px_24px_rgba(0,30,21,0.04)] border border-surface-container-high/70 p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-surface-dim/60 pb-3">
            <BidiText as="h3" className="font-['Plus_Jakarta_Sans'] text-lg sm:text-xl font-bold text-primary truncate pe-2">
              {list.title}
            </BidiText>
            <span className="font-['Manrope'] text-xs font-bold text-primary px-2.5 py-1 bg-surface-container rounded-full shrink-0">
              {t('home.itemsCount', { count: list.items.length })}
            </span>
          </div>

          {/* List Items Summary */}
          <div className="space-y-3.5 max-h-[240px] overflow-y-auto pe-1">
            {categoryIds.map((catId) => {
              const categoryItems = list.items.filter(
                (i) => (i.categoryId || 'other') === catId
              );
              return (
                <div key={catId} className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-outline-variant/60 bg-surface-bright">
                    <CategoryIcon categoryId={catId} className="w-3.5 h-3.5 text-primary/70" />
                    <span className="font-['Manrope'] text-xs font-semibold text-primary">
                      {getCategoryName(catId)}
                    </span>
                  </div>

                  {categoryItems.map((item) => {
                    const formattedQty = item.quantity
                      ? `${item.quantity}${item.unit ? ' ' + item.unit : ''}`
                      : item.note || null;

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-2.5 sm:p-3 bg-surface-bright rounded-2xl border border-surface-dim/40"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1" dir="auto">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                            <Check className="w-3 h-3 text-primary stroke-[3]" />
                          </div>
                          <BidiText className="font-['Manrope'] text-sm text-outline line-through truncate font-medium">
                            {item.name}
                          </BidiText>
                        </div>

                        {formattedQty && (
                          <bdi
                            dir="ltr"
                            className="font-['Manrope'] tabular-nums text-xs text-outline bg-surface-container-low px-2 py-0.5 rounded-md shrink-0 font-medium"
                          >
                            {formattedQty}
                          </bdi>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </section>

        {/* Action Buttons: Home, History, and Add More */}
        <section className="flex flex-col gap-3 pt-2 pb-4">
          <button
            onClick={onReturnHome}
            className="w-full h-[54px] rounded-full bg-primary text-on-primary font-['Manrope'] text-base font-bold shadow-[0px_8px_20px_rgba(0,30,21,0.18)] hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>{t('completion.completeTripBtn')}</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onViewHistory}
              className="h-[50px] rounded-full bg-surface-container text-primary font-['Manrope'] text-sm font-bold hover:bg-surface-container-high active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-surface-dim"
            >
              <History className="w-4 h-4" />
              <span>{t('navigation.history')}</span>
            </button>

            <button
              onClick={onAddMoreItems}
              className="h-[50px] rounded-full bg-surface-container-low text-primary font-['Manrope'] text-sm font-bold hover:bg-surface-container-highest active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-surface-dim"
            >
              <Plus className="w-4 h-4" />
              <span>{t('completion.addMoreBtn')}</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

