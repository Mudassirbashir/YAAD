import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, AlertCircle, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { triggerHaptic } from '../lib/sound';

export interface CreateListViewProps {
  onBack: () => void;
  onCreateList: (title: string, icon?: string, contextId?: string) => void;
  onContinue?: (title: string, icon?: string, contextId?: string) => void;
}

export const CreateListView: React.FC<CreateListViewProps> = ({
  onBack,
  onCreateList,
  onContinue,
}) => {
  const { t, language } = useLanguage();
  const [customTitle, setCustomTitle] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const isUrdu = language === 'ur';

  // Guarantee the screen opens scrolled to top
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleDispatchCreate = (title: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    triggerHaptic(14);

    const resolvedTitle = title.trim() || t('createList.title') || 'Shopping List';
    const resolvedIcon = 'shopping_basket';
    const resolvedContext = 'weekly';

    if (onCreateList) {
      onCreateList(resolvedTitle, resolvedIcon, resolvedContext);
    } else if (onContinue) {
      onContinue(resolvedTitle, resolvedIcon, resolvedContext);
    }
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
      setErrorMsg(
        isUrdu
          ? 'پہلے لسٹ کا نام درج کریں، پھر آگے بڑھیں۔'
          : t('createList.errorEmpty') || 'First enter the list name, then continue.'
      );
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      titleInputRef.current?.focus();
      return;
    }

    handleDispatchCreate(finalTitle);
  };

  return (
    <div className="w-full min-h-screen flex flex-col antialiased bg-background text-on-surface">
      {/* 1. Header: Minimal with back button only */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-surface-dim/40">
        <div className="w-full max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] -ms-2 rounded-full hover:bg-surface-container transition-colors text-on-surface active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
        </div>
      </header>

      {/* 2. Main Page Content: Clean, focused, no category clutter */}
      <main className="flex-1 w-full max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-20 flex flex-col gap-5">
        {/* Icon & Heading */}
        <div className="flex flex-col gap-1.5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-1">
            <ShoppingBag className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            {t('createList.title') || (isUrdu ? 'نئی لسٹ بنائیں' : 'Create New List')}
          </h1>
          <p className="font-body text-sm text-outline">
            {isUrdu
              ? 'اپنی خریداری کی فہرست کا نام درج کریں'
              : 'Enter a name for your shopping list to get started'}
          </p>
        </div>

        {/* 3. List Name Input Field: Round shape, 16px text-base (prevents mobile zoom), submit button */}
        <form onSubmit={handleSubmitCustomTitle} className="space-y-2 mt-1">
          <div
            className={`relative flex items-center w-full rounded-full border transition-[border-color,box-shadow] duration-150 bg-surface-container-lowest shadow-xs ${
              isShaking ? 'animate-bounce' : ''
            } ${
              errorMsg
                ? 'border-error ring-2 ring-error/20'
                : 'border-neutral-300 dark:border-neutral-700 focus-within:border-primary dark:focus-within:border-white focus-within:ring-2 focus-within:ring-primary/20 dark:focus-within:ring-white/10'
            }`}
          >
            <input
              ref={titleInputRef}
              id="list_title_input"
              dir="auto"
              type="text"
              autoFocus
              value={customTitle}
              onChange={(e) => {
                setCustomTitle(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              className="w-full h-13 sm:h-14 ps-5 pe-16 bg-transparent text-on-surface font-body text-base outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-full"
              placeholder={t('createList.customPlaceholder') || (isUrdu ? 'لسٹ کا نام (مثلاً سودا سلف)' : 'List Name (e.g. Weekly Groceries)')}
              aria-label="List Name"
            />

            {/* Circular button with right arrow */}
            <button
              id="create_list_submit_btn"
              type="submit"
              disabled={isSubmitting}
              aria-label="Continue"
              className="absolute end-1.5 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-primary hover:bg-[#0c3125] text-white flex items-center justify-center hover:opacity-95 active:scale-95 transition-[transform,background-color,opacity] duration-150 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            </button>
          </div>

          {/* Validation Alert Message */}
          {errorMsg && (
            <div
              role="alert"
              className="px-3.5 py-2 rounded-2xl bg-error/10 border border-error/20 text-error font-body text-xs sm:text-sm font-medium flex items-center gap-2 animate-fade-in"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </form>
      </main>
    </div>
  );
};
