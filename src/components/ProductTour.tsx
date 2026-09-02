import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Home,
  Plus,
  ListChecks,
  Settings,
  Compass,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface TourStep {
  id: string;
  targetId: string;
  fallbackTargetId?: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  position?: 'top' | 'bottom' | 'center';
}

export interface ProductTourProps {
  isOpen?: boolean;
  isActive?: boolean;
  onClose?: () => void;
  onSkip?: () => void;
  onComplete: () => void;
}

export const ProductTour: React.FC<ProductTourProps> = ({
  isOpen,
  isActive,
  onClose,
  onSkip,
  onComplete,
}) => {
  const isTourOpen = Boolean(isOpen ?? isActive);
  const handleDismiss = onClose || onSkip || onComplete;

  const { t, isRTL } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tourCardRef = useRef<HTMLDivElement>(null);

  // 6 Essential Tour Steps matching user requirements:
  // 1. Header / Logo
  // 2. Home
  // 3. Create (Quick Action)
  // 4. Create New List
  // 5. Shopping list
  // 6. Settings
  const steps: TourStep[] = [
    {
      id: 'step_header_logo',
      targetId: 'top_header_logo_area',
      fallbackTargetId: 'top_header_logo',
      title: t('tour.logoTitle') || 'YAAD Header & Brand',
      description:
        t('tour.logoDesc') ||
        'Your bilingual grocery companion with fast, smart organization in Urdu, Roman Urdu, and English.',
      icon: Sparkles,
      position: 'bottom',
    },
    {
      id: 'step_home_tab',
      targetId: 'nav_tab_home',
      fallbackTargetId: 'home_greeting_section',
      title: t('tour.homeTitle') || 'Home Dashboard',
      description:
        t('tour.homeDesc') ||
        'Easily return to your active shopping trips, recent lists, and daily summary anytime.',
      icon: Home,
      position: 'top',
    },
    {
      id: 'step_create_action',
      targetId: 'nav_tab_create',
      fallbackTargetId: 'home_create_list_btn',
      title: t('tour.createBarTitle') || 'Quick Create Action',
      description:
        t('tour.createBarDesc') ||
        'Tap this center action button from anywhere to instantly create a new list or add grocery items.',
      icon: Plus,
      position: 'top',
    },
    {
      id: 'step_create_new_list',
      targetId: 'home_create_list_btn',
      fallbackTargetId: 'home_empty_state_create_btn',
      title: t('tour.createNewListTitle') || 'Create New List',
      description:
        t('tour.createNewListDesc') ||
        'Tap this card to start a fresh list with intelligent item sorting and Pakistani grocery suggestions.',
      icon: Plus,
      position: 'bottom',
    },
    {
      id: 'step_shopping_lists',
      targetId: 'home_lists_section',
      fallbackTargetId: 'active_list_card',
      title: t('tour.listsTitle') || 'Your Shopping Lists',
      description:
        t('tour.listsDesc') ||
        'Active and completed shopping lists appear right here for instant access in the store aisle.',
      icon: ListChecks,
      position: 'bottom',
    },
    {
      id: 'step_settings_profile',
      targetId: 'nav_tab_settings',
      fallbackTargetId: 'top_header_settings_btn',
      title: t('tour.settingsTitle') || 'Settings & Profile',
      description:
        t('tour.settingsDesc') ||
        'Customize your emoji avatar, update full name, switch languages (English, Urdu, Roman Urdu), and sound effects.',
      icon: Settings,
      position: 'top',
    },
  ];

  const currentStep = steps[currentStepIndex] || steps[0];

  // Update target rect based on active step target element
  const updateTargetRect = useCallback(() => {
    if (!isTourOpen || !currentStep) return;

    let el = document.getElementById(currentStep.targetId);
    if (!el && currentStep.fallbackTargetId) {
      el = document.getElementById(currentStep.fallbackTargetId);
    }

    if (el) {
      const rect = el.getBoundingClientRect();
      // Scroll smoothly into view if offscreen
      if (rect.top < 60 || rect.bottom > window.innerHeight - 80) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          if (el) setTargetRect(el.getBoundingClientRect());
        }, 220);
      } else {
        setTargetRect(rect);
      }
    } else {
      setTargetRect(null);
    }
  }, [isTourOpen, currentStep]);

  useEffect(() => {
    if (!isTourOpen) return;

    updateTargetRect();
    const handleResize = () => updateTargetRect();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    const timer = setTimeout(updateTargetRect, 120);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
      clearTimeout(timer);
    };
  }, [isTourOpen, currentStepIndex, updateTargetRect]);

  // Keyboard navigation
  useEffect(() => {
    if (!isTourOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          onComplete();
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStepIndex > 0) {
          setCurrentStepIndex((prev) => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTourOpen, currentStepIndex, steps.length, handleDismiss, onComplete]);

  if (!isTourOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const StepIcon = currentStep.icon;

  // Determine whether card should sit at the top or bottom of viewport
  const isBottomTarget = targetRect ? targetRect.top > window.innerHeight * 0.52 : false;

  // Compute horizontal arrow position pointing toward target center
  const targetCenterX = targetRect ? targetRect.left + targetRect.width / 2 : window.innerWidth / 2;
  const clampedArrowLeft = Math.max(28, Math.min(window.innerWidth - 28, targetCenterX));

  return (
    <div
      id="product_tour_overlay"
      role="dialog"
      aria-label="Interactive Product Tour"
      aria-modal="true"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 pointer-events-auto select-none overflow-hidden"
    >
      {/* Dimmed backdrop with gentle blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleDismiss}
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px] transition-opacity"
        aria-hidden="true"
      />

      {/* Target Element Spotlight Highlight Box with glowing pulse */}
      {targetRect && (
        <motion.div
          key={`spotlight-${currentStep.id}`}
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="absolute pointer-events-none rounded-2xl ring-4 ring-primary ring-offset-3 ring-offset-black/50 shadow-[0_0_35px_rgba(0,106,75,0.45)]"
          style={{
            top: Math.max(6, targetRect.top - 6),
            left: Math.max(6, targetRect.left - 6),
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      {/* Target Directional Pointer Arrow Pin (at the spotlight edge) */}
      {targetRect && (
        <motion.div
          key={`spotlight-pin-${currentStep.id}`}
          initial={{ opacity: 0, y: isBottomTarget ? 6 : -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute pointer-events-none z-10 flex items-center justify-center"
          style={{
            left: clampedArrowLeft - 14,
            top: isBottomTarget ? Math.max(8, targetRect.top - 28) : targetRect.bottom + 8,
          }}
        >
          <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg animate-bounce border-2 border-white">
            {isBottomTarget ? (
              <ArrowRight className="w-3.5 h-3.5 rotate-90" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5 -rotate-90" />
            )}
          </div>
        </motion.div>
      )}

      {/* Full screen layout container */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6 pointer-events-none">
        {/* Top bar with quick Skip Tour button */}
        <div className="w-full flex justify-end pointer-events-auto">
          <button
            id="tour_skip_top_btn"
            type="button"
            onClick={handleDismiss}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/50 hover:bg-black/75 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all active:scale-95 shadow-md cursor-pointer"
            aria-label={t('tour.skip')}
          >
            <span>{t('tour.skip')}</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Floating Tooltip Card positioned optically opposite the target */}
        <div
          className={`w-full max-w-sm sm:max-w-md mx-auto pointer-events-auto relative ${
            isBottomTarget ? 'mb-24 sm:mb-28' : 'mt-14 sm:mt-18'
          }`}
        >
          {/* Card-Connected Directional Arrow pointing toward the target */}
          <div
            className={`absolute pointer-events-none left-1/2 -translate-x-1/2 ${
              isBottomTarget ? '-bottom-2' : '-top-2'
            }`}
          >
            <div
              className={`w-4 h-4 bg-surface-container-lowest border-surface-dim transform rotate-45 ${
                isBottomTarget
                  ? 'border-b border-r shadow-xs'
                  : 'border-t border-l shadow-xs'
              }`}
            />
          </div>

          <motion.div
            ref={tourCardRef}
            key={`tour-card-${currentStep.id}`}
            onClick={(e) => e.stopPropagation()}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: isBottomTarget ? -10 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: isBottomTarget ? -10 : 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-surface-container-lowest text-on-surface rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,30,21,0.28)] border border-surface-dim relative overflow-hidden"
          >
            {/* Top Bar with Step Tag and Progress Dots */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                  <StepIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-primary font-['Manrope'] bg-primary-fixed/40 px-2.5 py-0.5 rounded-full inline-block">
                    {t('tour.stepOf', { current: currentStepIndex + 1, total: steps.length })}
                  </span>
                </div>
              </div>

              {/* Progress indicator dots */}
              <div className="flex items-center gap-1.5">
                {steps.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentStepIndex(idx)}
                    aria-label={`Go to step ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentStepIndex
                        ? 'w-5 bg-primary'
                        : 'w-1.5 bg-surface-dim hover:bg-outline-variant'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Title & Description */}
            <h3 className="text-lg font-bold font-['Plus_Jakarta_Sans'] text-on-surface mb-1.5 tracking-tight">
              {currentStep.title}
            </h3>
            <p className="text-sm font-['Manrope'] text-on-surface-variant leading-relaxed mb-5">
              {currentStep.description}
            </p>

            {/* Action Buttons: Skip, Back, Next / Finish */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-surface-dim/60">
              <button
                id="tour_skip_bottom_btn"
                type="button"
                onClick={handleDismiss}
                className="text-xs font-semibold font-['Manrope'] text-on-surface-variant hover:text-on-surface px-3 py-2 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                {t('tour.skip')}
              </button>

              <div className="flex items-center gap-2">
                {currentStepIndex > 0 && (
                  <button
                    id="tour_prev_btn"
                    type="button"
                    onClick={handleBack}
                    className="h-9 px-3.5 rounded-xl border border-surface-dim text-on-surface hover:bg-surface-container-low text-xs font-bold font-['Manrope'] transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                    aria-label={t('tour.back')}
                  >
                    {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                    <span>{t('tour.back')}</span>
                  </button>
                )}

                <button
                  id="tour_next_btn"
                  type="button"
                  onClick={handleNext}
                  className="h-9 px-4 rounded-xl bg-primary text-on-primary text-xs font-bold font-['Manrope'] hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>
                    {currentStepIndex === steps.length - 1
                      ? t('tour.finish')
                      : t('tour.next')}
                  </span>
                  {currentStepIndex === steps.length - 1 ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : isRTL ? (
                    <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
