import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  ShoppingBag,
  Pencil,
  Check,
  ChevronRight,
  ChevronDown,
  Info,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { triggerHaptic } from '../lib/sound';
import { useShouldAnimate } from '../lib/motionPreference';
import { containsUrdu } from '../utils/bidi';
import {
  SHOPPING_CONTEXT_OPTIONS,
  ShoppingContextOption,
} from '../lib/recommendations/shoppingContexts';

export interface CreateListViewProps {
  onBack: () => void;
  onCreateList: (title: string, icon?: string, contextId?: string) => void;
  onContinue?: (title: string, icon?: string, contextId?: string) => void;
}

const PRIMARY_TEMPLATE_IDS = [
  'weekly',
  'grocery',
  'fruits_vegetables',
  'home',
  'baking',
  'custom',
] as const;

const SECONDARY_TEMPLATE_IDS = [
  'supermarket',
  'bbq',
  'breakfast',
  'pharmacy',
  'personal',
  'party',
] as const;

function pickOrderedTemplates(ids: readonly string[]): ShoppingContextOption[] {
  return ids
    .map((id) => SHOPPING_CONTEXT_OPTIONS.find((opt) => opt.id === id))
    .filter((opt): opt is ShoppingContextOption => Boolean(opt));
}

const PRIMARY_TEMPLATES = pickOrderedTemplates(PRIMARY_TEMPLATE_IDS);
const SECONDARY_TEMPLATES = pickOrderedTemplates(SECONDARY_TEMPLATE_IDS);

export const CreateListView: React.FC<CreateListViewProps> = ({
  onBack,
  onCreateList,
  onContinue,
}) => {
  const { t, language, isRTL } = useLanguage();
  const canAnimate = useShouldAnimate();
  const [customTitle, setCustomTitle] = useState<string>('');
  const [hasTypedCustomName, setHasTypedCustomName] = useState<boolean>(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [showMoreTemplates, setShowMoreTemplates] = useState<boolean>(false);
  const [hasUserFocused, setHasUserFocused] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSubmittingRef = useRef<boolean>(false);

  const isUrdu = language === 'ur';

  // Ensure view starts cleanly at top without forcing virtual keyboard open on mount
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {
      window.scrollTo(0, 0);
    }
    return () => {
      if (shakeTimerRef.current) {
        clearTimeout(shakeTimerRef.current);
      }
    };
  }, []);

  const getTemplateTitle = (ctx: ShoppingContextOption): string => {
    const key = `createList.templates.${ctx.id}.title`;
    const translated = t(key);
    return translated && translated !== key ? translated : ctx.title;
  };

  const getTemplateSubtitle = (ctx: ShoppingContextOption): string => {
    const key = `createList.templates.${ctx.id}.subtitle`;
    const translated = t(key);
    return translated && translated !== key ? translated : ctx.subtitle;
  };

  const dispatchCreate = (title: string, icon: string, contextId: string) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    triggerHaptic(14);

    if (onCreateList) {
      onCreateList(title, icon, contextId);
    } else if (onContinue) {
      onContinue(title, icon, contextId);
    }
  };

  const triggerEmptyValidationError = () => {
    triggerHaptic(25);
    setErrorMsg(
      isUrdu
        ? 'پہلے لسٹ کا نام درج کریں، پھر آگے بڑھیں۔'
        : t('createList.errorEmpty') || 'First enter the list name, then continue.'
    );
    if (canAnimate) {
      setIsShaking(true);
      if (shakeTimerRef.current) {
        clearTimeout(shakeTimerRef.current);
      }
      shakeTimerRef.current = setTimeout(() => setIsShaking(false), 380);
    }
    titleInputRef.current?.focus();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmittingRef.current) return;

    const selectedCtx = selectedTemplateId
      ? SHOPPING_CONTEXT_OPTIONS.find((c) => c.id === selectedTemplateId)
      : undefined;
    const trimmedTitle = customTitle.trim();

    if (trimmedTitle) {
      const resolvedIcon = selectedCtx ? selectedCtx.iconName : 'shopping_basket';
      const resolvedContext = selectedCtx ? selectedCtx.id : 'custom';
      dispatchCreate(trimmedTitle, resolvedIcon, resolvedContext);
      return;
    }

    if (selectedCtx && selectedCtx.id !== 'custom') {
      const fallbackTemplateTitle = getTemplateTitle(selectedCtx);
      dispatchCreate(fallbackTemplateTitle, selectedCtx.iconName, selectedCtx.id);
      return;
    }

    triggerEmptyValidationError();
  };

  const handleSelectTemplate = (ctx: ShoppingContextOption) => {
    if (isSubmittingRef.current) return;
    triggerHaptic(10);
    if (errorMsg) setErrorMsg('');

    if (ctx.id === 'custom') {
      setSelectedTemplateId('custom');
      if (!hasTypedCustomName) {
        setCustomTitle('');
      }
      setHasUserFocused(true);
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => titleInputRef.current?.focus());
      } else {
        titleInputRef.current?.focus();
      }
      return;
    }

    setSelectedTemplateId(ctx.id);
    if (!hasTypedCustomName) {
      setCustomTitle(getTemplateTitle(ctx));
    }
  };

  const placeholderText =
    t('createList.inputPlaceholder') ||
    (isUrdu ? 'مثلاً ہفتہ وار سودا سلف' : 'e.g. Weekly Groceries');
  const showTitleTyping = canAnimate && !hasUserFocused && customTitle.length === 0;
  const titleRtlSafe = isUrdu || isRTL || containsUrdu(placeholderText);
  const titleSteps = Math.min(Math.max(placeholderText.length, 10), 32);

  const renderTemplateCard = (ctx: ShoppingContextOption) => {
    const isSelected = selectedTemplateId === ctx.id;
    const IconComponent = ctx.icon;
    const label = getTemplateTitle(ctx);
    const subtitle = getTemplateSubtitle(ctx);

    return (
      <button
        key={ctx.id}
        type="button"
        data-template-id={ctx.id}
        aria-pressed={isSelected}
        onClick={() => handleSelectTemplate(ctx)}
        className={`group relative min-h-[96px] min-w-0 w-full text-start p-3 sm:p-3.5 rounded-2xl border transition-[transform,border-color,background-color] duration-150 active:scale-[0.985] flex flex-col justify-between gap-2.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
          isSelected
            ? 'bg-primary/[0.06] dark:bg-primary/18 border-primary ring-2 ring-primary/20 shadow-xs'
            : 'bg-surface-container-lowest border-[color:var(--yaad-settings-card-border)] hover:border-primary/35 shadow-[var(--yaad-settings-card-shadow)]'
        }`}
      >
        <div className="flex items-start justify-between gap-2 w-full">
          <span
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-150 ${
              isSelected
                ? 'bg-primary text-on-primary'
                : `${ctx.accentBg} ${ctx.accentText} border ${ctx.accentBorder}`
            }`}
          >
            <IconComponent className="w-[18px] h-[18px]" strokeWidth={2.1} />
          </span>

          {isSelected ? (
            <span
              aria-hidden="true"
              className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.7]" />
            </span>
          ) : (
            <ChevronRight
              aria-hidden="true"
              className="w-4 h-4 text-outline/65 group-hover:text-on-surface rtl:rotate-180 shrink-0 mt-1 transition-colors duration-150"
            />
          )}
        </div>

        <div className="min-w-0 w-full">
          <div className="font-display text-[15px] font-bold leading-snug text-on-surface line-clamp-1">
            {label}
          </div>
          <p className="font-body text-xs leading-snug text-outline line-clamp-2 mt-0.5">
            {subtitle}
          </p>
        </div>
      </button>
    );
  };

  return (
    <div className="w-full min-h-screen flex flex-col antialiased bg-background text-on-surface">
      {/* 1. Header: Minimal back navigation */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-surface-dim/40">
        <div className="w-full max-w-xl md:max-w-2xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
          <button
            type="button"
            onClick={onBack}
            aria-label={t('createList.backLabel') || 'Go back'}
            className="flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] -ms-2 rounded-full hover:bg-surface-container transition-colors text-on-surface active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
        </div>
      </header>

      {/* 2. Main Page Content */}
      <main className="flex-1 w-full max-w-xl md:max-w-2xl mx-auto px-4 sm:px-6 pt-3 pb-6 flex flex-col gap-5">
        {/* Compact Hero */}
        <section className="flex items-center gap-3.5 pt-0.5">
          <div
            aria-hidden="true"
            className="relative w-12 h-12 rounded-2xl bg-primary/10 dark:bg-primary/20 border border-primary/15 text-primary flex items-center justify-center shrink-0"
          >
            <ShoppingBag className="w-6 h-6 stroke-[2.15]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FCBC1F] ring-2 ring-background absolute -top-0.5 -end-0.5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-[26px] sm:text-[30px] leading-[1.15] font-extrabold text-on-surface tracking-tight">
              {t('createList.title') || (isUrdu ? 'نئی لسٹ بنائیں' : 'Create New List')}
            </h1>
            <p className="font-body text-sm text-outline leading-snug mt-0.5">
              {t('createList.subtitle') ||
                (isUrdu
                  ? 'اپنی لسٹ کا نام درج کریں یا نیچے سے ٹیمپلیٹ منتخب کریں'
                  : 'Give your list a name or choose a template')}
            </p>
          </div>
        </section>

        {/* 3. List Name Input */}
        <form onSubmit={handleSubmit} className="space-y-2">
          <div
            className={`relative flex items-center w-full rounded-full border transition-[border-color] duration-150 bg-surface-container-lowest shadow-[var(--yaad-settings-card-shadow)] ${
              isShaking && canAnimate ? 'yaad-shake' : ''
            } ${
              errorMsg
                ? 'border-error ring-2 ring-error/20'
                : 'border-[color:var(--yaad-settings-card-border)] focus-within:border-primary dark:focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20'
            }`}
          >
            <Pencil
              aria-hidden="true"
              className="w-4 h-4 text-outline/80 ms-4 shrink-0 pointer-events-none"
            />

            <div className="relative flex-1 min-w-0">
              {showTitleTyping && (
                <span
                  aria-hidden="true"
                  className="yaad-typing-overlay absolute inset-y-0 inset-x-0 ps-3 pe-16 flex items-center font-body text-base text-neutral-400 dark:text-neutral-500"
                >
                  {titleRtlSafe ? (
                    <span className="yaad-typing-rtl truncate">{placeholderText}</span>
                  ) : (
                    <span
                      className="yaad-typing-track"
                      style={{ '--typing-steps': titleSteps } as React.CSSProperties}
                    >
                      <span className="yaad-typing-sizer">{placeholderText}</span>
                      <span className="yaad-typing-reveal">{placeholderText}</span>
                    </span>
                  )}
                </span>
              )}
              <input
                ref={titleInputRef}
                id="list_title_input"
                dir="auto"
                type="text"
                value={customTitle}
                onPointerDown={() => setHasUserFocused(true)}
                onFocus={() => setHasUserFocused(true)}
                onBlur={() => setHasUserFocused(false)}
                onKeyDown={() => setHasUserFocused(true)}
                onPaste={() => setHasUserFocused(true)}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setHasUserFocused(true);
                  setCustomTitle(nextValue);
                  if (errorMsg) setErrorMsg('');

                  if (nextValue.trim().length > 0) {
                    setHasTypedCustomName(true);
                    if (selectedTemplateId && selectedTemplateId !== 'custom') {
                      setSelectedTemplateId(null);
                    }
                  } else {
                    setHasTypedCustomName(false);
                    if (selectedTemplateId && selectedTemplateId !== 'custom') {
                      setSelectedTemplateId(null);
                    }
                  }
                }}
                className={`w-full h-13 sm:h-14 ps-3 pe-16 bg-transparent text-on-surface font-body text-base outline-none rounded-full ${
                  showTitleTyping
                    ? 'placeholder:text-transparent'
                    : 'placeholder:text-neutral-400 dark:placeholder:text-neutral-500'
                }`}
                placeholder={placeholderText}
                aria-label={t('createList.customPlaceholder') || 'List Name'}
              />
            </div>

            <button
              id="create_list_submit_btn"
              type="submit"
              disabled={isSubmitting}
              aria-label={t('createList.createBtn') || 'Create List'}
              className="absolute end-1.5 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-primary hover:bg-[#003527] text-on-primary flex items-center justify-center hover:opacity-95 active:scale-95 transition-[transform,background-color,opacity] duration-150 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            </button>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className={`px-3.5 py-2 rounded-2xl bg-error/10 border border-error/20 text-error font-body text-xs sm:text-sm font-medium flex items-center gap-2 ${
                canAnimate ? 'yaad-enter-state' : ''
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </form>

        {/* 4. Quick Templates Section */}
        <section aria-labelledby="quick-templates-heading" className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-surface-dim/70 dark:bg-white/10" aria-hidden="true" />
            <h2
              id="quick-templates-heading"
              className="font-display text-xs font-bold uppercase tracking-[0.08em] text-outline shrink-0"
            >
              {t('createList.quickTemplatesHeading') || 'Quick Templates'}
            </h2>
            <span className="h-px flex-1 bg-surface-dim/70 dark:bg-white/10" aria-hidden="true" />
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {PRIMARY_TEMPLATES.map(renderTemplateCard)}
          </div>

          {SECONDARY_TEMPLATES.length > 0 && (
            <div className="space-y-2.5">
              <button
                type="button"
                aria-expanded={showMoreTemplates}
                onClick={() => {
                  triggerHaptic(8);
                  setShowMoreTemplates((prev) => !prev);
                }}
                className="w-full min-h-[44px] px-3 rounded-xl border border-dashed border-[color:var(--yaad-settings-card-border)] hover:border-primary/40 text-xs font-display font-semibold text-outline hover:text-on-surface flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>
                  {showMoreTemplates
                    ? t('createList.lessTemplates') || 'Fewer templates'
                    : t('createList.moreTemplates') || 'More templates'}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-150 ${
                    showMoreTemplates ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showMoreTemplates && (
                <div
                  className={`grid grid-cols-2 gap-2.5 sm:gap-3 ${
                    canAnimate ? 'yaad-enter-state' : ''
                  }`}
                >
                  {SECONDARY_TEMPLATES.map(renderTemplateCard)}
                </div>
              )}
            </div>
          )}
        </section>

        {/* 5. Truthful Tip Card */}
        <aside
          className="rounded-2xl px-3.5 py-3 border flex items-start gap-2.5 bg-[var(--yaad-settings-warm-bg)] border-[color:var(--yaad-settings-warm-border)]"
        >
          <Info
            aria-hidden="true"
            className="w-4 h-4 text-[var(--yaad-settings-warm-fg)] shrink-0 mt-0.5"
          />
          <p className="font-body text-xs sm:text-[13px] leading-relaxed text-on-surface-variant">
            {t('createList.tipText') ||
              'You can rename or edit your list anytime from the lists section.'}
          </p>
        </aside>
      </main>

      {/* 6. Sticky Bottom Primary CTA */}
      <div className="sticky bottom-0 z-20 bg-background/90 backdrop-blur-md border-t border-surface-dim/40 px-4 sm:px-6 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="w-full max-w-xl md:max-w-2xl mx-auto">
          <button
            id="create_list_primary_cta"
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit()}
            className="w-full min-h-[52px] px-5 rounded-2xl bg-primary hover:bg-[#003527] text-on-primary font-display font-bold text-base flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.99] transition-[transform,background-color,opacity] duration-150 cursor-pointer disabled:opacity-60"
          >
            <span>
              {isSubmitting
                ? t('createList.creatingBtn') || 'Creating...'
                : t('createList.createBtn') || 'Create List'}
            </span>
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};
