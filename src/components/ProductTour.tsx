import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Home,
  Plus,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface TourStep {
  id: string;
  targetId: string;
  fallbackTargetId?: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface ProductTourProps {
  isOpen?: boolean;
  isActive?: boolean;
  onClose?: () => void;
  onSkip?: () => void;
  onComplete: () => void;
}

interface TooltipGeometry {
  placement: 'top' | 'bottom';
  cardTop: number;
  cardLeft: number;
  cardWidth: number;
  arrowOffsetLeft: number;
}

export const ProductTour: React.FC<ProductTourProps> = ({
  isOpen,
  isActive,
  onClose,
  onSkip,
  onComplete,
}) => {
  const isTourOpen = Boolean(isOpen ?? isActive);
  const handleDismiss = onSkip || onClose || onComplete;

  const { t, isRTL } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [measuredCardHeight, setMeasuredCardHeight] = useState(200);

  // Exactly 4 HIGH-VALUE Core Steps matching user requirements:
  // Step 1: Home
  // Step 2: Create List
  // Step 3: Add/Complete Items
  // Step 4: History/Stats
  const steps: TourStep[] = [
    {
      id: 'tour_step_home',
      targetId: 'home_greeting_section',
      fallbackTargetId: 'top_header_logo_area',
      title: t('tour.step1Title') || 'Home',
      description:
        t('tour.step1Desc') ||
        'This is your YAAD home. See your lists and quickly start shopping.',
      icon: Home,
    },
    {
      id: 'tour_step_create_list',
      targetId: 'home_create_list_btn',
      fallbackTargetId: 'nav_tab_create',
      title: t('tour.step2Title') || 'Create List',
      description:
        t('tour.step2Desc') ||
        'Create a list in seconds.',
      icon: Plus,
    },
    {
      id: 'tour_step_add_complete',
      targetId: 'home_essentials_section',
      fallbackTargetId: 'home_lists_section',
      title: t('tour.step3Title') || 'Add & Complete Items',
      description:
        t('tour.step3Desc') ||
        'Add what you need, then tap or swipe when you buy it.',
      icon: ShoppingBag,
    },
    {
      id: 'tour_step_history_stats',
      targetId: 'home_quick_actions',
      fallbackTargetId: 'quick_action_recent_lists',
      title: t('tour.step4Title') || 'History & Stats',
      description:
        t('tour.step4Desc') ||
        'See what you bought before and understand your shopping habits.',
      icon: TrendingUp,
    },
  ];

  // Reset to Step 1 whenever the tour is triggered or restarted
  useEffect(() => {
    if (isTourOpen) {
      setCurrentStepIndex(0);
    }
  }, [isTourOpen]);

  const currentStep = steps[currentStepIndex] || steps[0];

  // Locate the target element and measure its viewport position
  const updateTargetRect = useCallback(() => {
    if (!isTourOpen || !currentStep) return;

    let el = document.getElementById(currentStep.targetId);
    if (!el && currentStep.fallbackTargetId) {
      el = document.getElementById(currentStep.fallbackTargetId);
    }

    if (el) {
      const rect = el.getBoundingClientRect();
      // Scroll into view if element is offscreen or obscured
      const isOffscreen =
        rect.top < 70 || rect.bottom > window.innerHeight - 80;
      if (isOffscreen) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const timer = setTimeout(() => {
          if (el) {
            setTargetRect(el.getBoundingClientRect());
          }
        }, 220);
        return () => clearTimeout(timer);
      } else {
        setTargetRect(rect);
      }
    } else {
      setTargetRect(null);
    }
  }, [isTourOpen, currentStep]);

  // Update position on step changes, window resize, and scroll
  useEffect(() => {
    if (!isTourOpen) return;

    updateTargetRect();
    const handleReposition = () => {
      updateTargetRect();
      if (cardRef.current) {
        setMeasuredCardHeight(cardRef.current.offsetHeight || 200);
      }
    };

    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    const timer = setTimeout(handleReposition, 120);

    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
      clearTimeout(timer);
    };
  }, [isTourOpen, currentStepIndex, updateTargetRect]);

  // Measure card height when step changes
  useEffect(() => {
    if (cardRef.current) {
      const h = cardRef.current.offsetHeight;
      if (h > 100) {
        setMeasuredCardHeight(h);
      }
    }
  }, [currentStepIndex]);

  // Keyboard navigation: Escape to skip, Arrow keys/Enter to step
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

  const isLastStep = currentStepIndex === steps.length - 1;
  const StepIcon = currentStep.icon;

  // Responsive Tooltip & Directional Arrow Math
  const computeTooltipGeometry = (): TooltipGeometry => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 380;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 640;

    // Card width adapts fluidly to mobile, tablet, iPad, and desktop
    const cardWidth = Math.max(280, Math.min(380, vw - 32));
    const cardHeight = measuredCardHeight;

    if (!targetRect) {
      return {
        placement: 'bottom',
        cardTop: Math.max(20, (vh - cardHeight) / 2),
        cardLeft: Math.max(16, (vw - cardWidth) / 2),
        cardWidth,
        arrowOffsetLeft: cardWidth / 2 - 8,
      };
    }

    const targetCenterX = targetRect.left + targetRect.width / 2;
    // Space calculation with 6px spotlight padding and 10px arrow gap
    const spaceAbove = targetRect.top - 6;
    const spaceBelow = vh - (targetRect.bottom + 6);

    let placement: 'top' | 'bottom' = 'bottom';
    let cardTop = 0;

    // Determine optimal vertical position without covering target
    if (spaceBelow >= cardHeight + 16) {
      placement = 'bottom';
      cardTop = targetRect.bottom + 16;
    } else if (spaceAbove >= cardHeight + 16) {
      placement = 'top';
      cardTop = targetRect.top - cardHeight - 16;
    } else {
      // For tight screens (e.g. landscape phone), choose side with more room
      if (spaceBelow >= spaceAbove) {
        placement = 'bottom';
        cardTop = Math.min(vh - cardHeight - 12, targetRect.bottom + 14);
      } else {
        placement = 'top';
        cardTop = Math.max(12, targetRect.top - cardHeight - 14);
      }
    }

    // Horizontal centering relative to target center, clamped to screen viewport
    const idealCardLeft = targetCenterX - cardWidth / 2;
    const cardLeft = Math.max(16, Math.min(vw - cardWidth - 16, idealCardLeft));

    // Dynamic arrow position relative to card left, pointing directly at target center
    const targetXInCard = targetCenterX - cardLeft;
    // Keep arrow safely inside the card's 16px rounded corners
    const arrowOffsetLeft = Math.max(24, Math.min(cardWidth - 40, targetXInCard - 8));

    return {
      placement,
      cardTop,
      cardLeft,
      cardWidth,
      arrowOffsetLeft,
    };
  };

  const geometry = computeTooltipGeometry();

  return (
    <div
      id="product_tour_overlay"
      role="dialog"
      aria-label="Interactive Product Tour"
      aria-modal="true"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 select-none overflow-hidden"
    >
      {/* Dimmed backdrop - clicking outside skips the tour */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={handleDismiss}
        className="fixed inset-0 bg-[#0A1A14]/65 backdrop-blur-[2px] cursor-pointer"
        aria-hidden="true"
      />

      {/* Target Element Spotlight Highlight Box with smooth glow */}
      {targetRect && (
        <motion.div
          key={`spotlight-${currentStep.id}`}
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed pointer-events-none rounded-2xl"
          style={{
            top: Math.max(4, targetRect.top - 6),
            left: Math.max(4, targetRect.left - 6),
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            boxShadow:
              '0 0 0 9999px rgba(10, 26, 20, 0.65), 0 0 24px rgba(15, 61, 46, 0.4)',
            border: '2px solid rgba(16, 185, 129, 0.9)',
            zIndex: 55,
          }}
        />
      )}

      {/* Responsive Floating Tooltip Card with Accurate Directional Arrow */}
      <div
        style={{
          position: 'fixed',
          top: `${geometry.cardTop}px`,
          left: `${geometry.cardLeft}px`,
          width: `${geometry.cardWidth}px`,
          zIndex: 60,
        }}
        className="pointer-events-auto"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`tour-card-${currentStep.id}`}
            ref={cardRef}
            onClick={(e) => e.stopPropagation()}
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    scale: 0.97,
                    y: geometry.placement === 'bottom' ? -8 : 8,
                  }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.97 }
            }
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white text-slate-900 rounded-2xl p-5 shadow-[0_20px_45px_rgba(0,0,0,0.24)] border border-slate-200/90 relative"
          >
            {/* ACCURATE DIRECTIONAL ARROW */}
            {targetRect && (
              geometry.placement === 'bottom' ? (
                // Arrow at top edge pointing UP to target
                <svg
                  width="18"
                  height="9"
                  viewBox="0 0 18 9"
                  className="absolute -top-[8px] pointer-events-none drop-shadow-xs"
                  style={{ left: `${geometry.arrowOffsetLeft}px` }}
                >
                  <path
                    d="M0,9 L9,0 L18,9"
                    fill="#FFFFFF"
                    stroke="#E2E8F0"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                // Arrow at bottom edge pointing DOWN to target
                <svg
                  width="18"
                  height="9"
                  viewBox="0 0 18 9"
                  className="absolute -bottom-[8px] pointer-events-none drop-shadow-xs"
                  style={{ left: `${geometry.arrowOffsetLeft}px` }}
                >
                  <path
                    d="M0,0 L9,9 L18,0"
                    fill="#FFFFFF"
                    stroke="#E2E8F0"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )
            )}

            {/* Header: System Icon, Progress Badge (e.g. 1 of 4), and Close X Button */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0F3D2E] border border-emerald-200/60 flex items-center justify-center shrink-0">
                  <StepIcon className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-bold tracking-wide text-emerald-800 bg-emerald-50 border border-emerald-200/50 px-2.5 py-0.5 rounded-full font-['Manrope']">
                  {t('tour.stepOf', {
                    current: currentStepIndex + 1,
                    total: steps.length,
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* 4 progress dots */}
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  {steps.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentStepIndex
                          ? 'w-4 bg-[#0F3D2E]'
                          : 'w-1.5 bg-slate-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Direct Close Button */}
                <button
                  type="button"
                  id="tour_close_btn"
                  onClick={handleDismiss}
                  aria-label={t('tour.skip')}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Clear Title */}
            <h3 className="text-base sm:text-lg font-bold font-['Plus_Jakarta_Sans'] text-slate-900 mb-1 tracking-tight">
              {currentStep.title}
            </h3>

            {/* Short Description */}
            <p className="text-xs sm:text-sm font-['Manrope'] text-slate-600 leading-relaxed mb-4">
              {currentStep.description}
            </p>

            {/* Footer Buttons: Skip, Back, Next / Done */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <button
                id="tour_skip_btn"
                type="button"
                onClick={handleDismiss}
                className="text-xs font-semibold font-['Manrope'] text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {t('tour.skip')}
              </button>

              <div className="flex items-center gap-2">
                {currentStepIndex > 0 && (
                  <button
                    id="tour_back_btn"
                    type="button"
                    onClick={handleBack}
                    className="h-8 sm:h-9 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold font-['Manrope'] transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                    aria-label={t('tour.back')}
                  >
                    {isRTL ? (
                      <ArrowRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowLeft className="w-3.5 h-3.5" />
                    )}
                    <span>{t('tour.back')}</span>
                  </button>
                )}

                <button
                  id="tour_next_btn"
                  type="button"
                  onClick={handleNext}
                  className="h-8 sm:h-9 px-4 rounded-xl bg-[#0F3D2E] text-white hover:bg-[#134e3a] text-xs font-bold font-['Manrope'] active:scale-95 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span>
                    {isLastStep
                      ? t('tour.done') || t('tour.finish')
                      : t('tour.next')}
                  </span>
                  {isLastStep ? (
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
        </AnimatePresence>
      </div>
    </div>
  );
};
