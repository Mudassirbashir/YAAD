import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X, ArrowRight, ArrowLeft, Check, Sparkles, Plus, ListChecks, Settings, Compass } from 'lucide-react';
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

interface ProductTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const ProductTour: React.FC<ProductTourProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { t, isRTL } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tourCardRef = useRef<HTMLDivElement>(null);

  const steps: TourStep[] = [
    {
      id: 'lists_area',
      targetId: 'home_lists_section',
      fallbackTargetId: 'home_empty_state_create_btn',
      title: t('tour.listsTitle'),
      description: t('tour.listsDesc'),
      icon: ListChecks,
      position: 'bottom',
    },
    {
      id: 'create_button',
      targetId: 'nav_tab_create',
      fallbackTargetId: 'home_create_list_btn',
      title: t('tour.createTitle'),
      description: t('tour.createDesc'),
      icon: Plus,
      position: 'top',
    },
    {
      id: 'settings_tab',
      targetId: 'nav_tab_settings',
      fallbackTargetId: 'top_header_settings_btn',
      title: t('tour.settingsTitle'),
      description: t('tour.settingsDesc'),
      icon: Settings,
      position: 'top',
    },
  ];

  const currentStep = steps[currentStepIndex];

  // Update target rect based on active step target element
  const updateTargetRect = useCallback(() => {
    if (!isOpen || !currentStep) return;

    let el = document.getElementById(currentStep.targetId);
    if (!el && currentStep.fallbackTargetId) {
      el = document.getElementById(currentStep.fallbackTargetId);
    }

    if (el) {
      const rect = el.getBoundingClientRect();
      // Scroll smoothly into view if offscreen
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          if (el) setTargetRect(el.getBoundingClientRect());
        }, 200);
      } else {
        setTargetRect(rect);
      }
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (!isOpen) return;

    updateTargetRect();
    const handleResize = () => updateTargetRect();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    // Timeout to handle layout render shifts
    const timer = setTimeout(updateTargetRect, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
      clearTimeout(timer);
    };
  }, [isOpen, currentStepIndex, updateTargetRect]);

  // Keyboard Navigation: Escape = close, ArrowLeft / ArrowRight = back/next, Enter = next
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
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
  }, [isOpen, currentStepIndex, steps.length, onClose, onComplete]);

  if (!isOpen) return null;

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

  // Calculate tooltip placement
  const isBottomTarget = targetRect ? targetRect.top > window.innerHeight * 0.55 : false;

  return (
    <div
      id="product_tour_overlay"
      role="dialog"
      aria-label="Interactive Product Tour"
      aria-modal="true"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 pointer-events-auto select-none"
    >
      {/* Dimmed backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"
        aria-hidden="true"
      />

      {/* Target Element Spotlight Highlight Box */}
      {targetRect && (
        <motion.div
          key={`spotlight-${currentStep.id}`}
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="absolute pointer-events-none rounded-2xl ring-4 ring-primary ring-offset-2 ring-offset-black/50 shadow-[0_0_30px_rgba(0,106,75,0.4)]"
          style={{
            top: Math.max(8, targetRect.top - 6),
            left: Math.max(8, targetRect.left - 6),
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      {/* Centered / Positioned Interactive Tour Tooltip Card */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6 pointer-events-none">
        <div className="w-full flex justify-end pointer-events-auto">
          <button
            id="tour_skip_top_btn"
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all active:scale-95 shadow-md"
            aria-label={t('tour.skip')}
          >
            <span>{t('tour.skip')}</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Floating Tooltip Card */}
        <div
          className={`w-full max-w-sm sm:max-w-md mx-auto pointer-events-auto ${
            isBottomTarget ? 'mb-24 sm:mb-28' : 'mt-16 sm:mt-20'
          }`}
        >
          <motion.div
            ref={tourCardRef}
            key={`tour-card-${currentStep.id}`}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: isBottomTarget ? -10 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: isBottomTarget ? -10 : 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-surface-container-lowest text-on-surface rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,30,21,0.25)] border border-surface-dim relative overflow-hidden"
          >
            {/* Top Bar with Step Tag and Icon */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <StepIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-primary font-['Manrope'] bg-primary-fixed/40 px-2.5 py-0.5 rounded-full">
                    {t('tour.stepOf', { current: currentStepIndex + 1, total: steps.length })}
                  </span>
                </div>
              </div>

              {/* Progress indicator dots */}
              <div className="flex items-center gap-1.5">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentStepIndex
                        ? 'w-5 bg-primary'
                        : 'w-1.5 bg-surface-dim'
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

            {/* Tour Action Buttons */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-surface-container-low">
              <button
                id="tour_skip_bottom_btn"
                type="button"
                onClick={onClose}
                className="text-xs font-semibold font-['Manrope'] text-on-surface-variant hover:text-on-surface px-3 py-2 rounded-xl hover:bg-surface-container-low transition-colors"
              >
                {t('tour.skip')}
              </button>

              <div className="flex items-center gap-2">
                {currentStepIndex > 0 && (
                  <button
                    id="tour_prev_btn"
                    type="button"
                    onClick={handleBack}
                    className="h-9 px-3.5 rounded-xl border border-surface-dim text-on-surface hover:bg-surface-container-low text-xs font-bold font-['Manrope'] transition-all flex items-center gap-1 active:scale-95"
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
                  className="h-9 px-4 rounded-xl bg-primary text-on-primary text-xs font-bold font-['Manrope'] hover:bg-primary-container active:scale-95 transition-all flex items-center gap-1.5 shadow-xs"
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
