import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, PlusCircle, Sparkles, CheckCircle2, History, Compass } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { APP_IMAGES } from '../data/initialData';
import { useLanguage } from '../context/LanguageContext';

interface OnboardingViewProps {
  onComplete: (startTour?: boolean) => void;
}

interface StepData {
  id: number;
  titleKey: string;
  subtitleKey: string;
  icon: React.ComponentType<{ className?: string }>;
  image: string;
  imageAlt: string;
  colorClass: string;
  badge: string;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const { t, isRTL } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const [step, setStep] = useState<number>(1);

  const steps: StepData[] = [
    {
      id: 1,
      titleKey: 'onboarding.step1Title',
      subtitleKey: 'onboarding.step1Subtitle',
      icon: PlusCircle,
      image: APP_IMAGES.onboarding1,
      imageAlt: 'Shopper making a shopping list',
      colorClass: 'bg-primary-fixed/30 text-primary',
      badge: 'Step 1 • List Creation',
    },
    {
      id: 2,
      titleKey: 'onboarding.step2Title',
      subtitleKey: 'onboarding.step2Subtitle',
      icon: Sparkles,
      image: APP_IMAGES.onboarding2,
      imageAlt: 'Fast item entry and category classification',
      colorClass: 'bg-secondary-fixed/40 text-primary',
      badge: 'Step 2 • Quick Add',
    },
    {
      id: 3,
      titleKey: 'onboarding.step3Title',
      subtitleKey: 'onboarding.step3Subtitle',
      icon: CheckCircle2,
      image: APP_IMAGES.onboarding3,
      imageAlt: 'Checking off items in the store aisle',
      colorClass: 'bg-tertiary-fixed/30 text-primary',
      badge: 'Step 3 • In-Store Mode',
    },
    {
      id: 4,
      titleKey: 'onboarding.step4Title',
      subtitleKey: 'onboarding.step4Subtitle',
      icon: History,
      image: APP_IMAGES.logo3d,
      imageAlt: 'Reviewing saved shopping history',
      colorClass: 'bg-primary-fixed/40 text-primary',
      badge: 'Step 4 • Auto Save & History',
    },
  ];

  const currentStep = steps[step - 1];

  // Keyboard navigation: Escape to skip, ArrowRight/Enter for next, ArrowLeft for back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onComplete(false);
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (step < steps.length) {
          setStep((s) => s + 1);
        } else {
          onComplete(false);
        }
      } else if (e.key === 'ArrowLeft') {
        if (step > 1) {
          setStep((s) => s - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, steps.length, onComplete]);

  const handleNext = () => {
    if (step < steps.length) {
      setStep((s) => s + 1);
    } else {
      onComplete(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  const handleStartTour = () => {
    onComplete(true);
  };

  const StepIcon = currentStep.icon;

  return (
    <main
      id="onboarding_screen_container"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="w-full max-w-md sm:max-w-xl md:max-w-2xl mx-auto min-h-screen flex flex-col justify-between px-4 sm:px-6 py-6 bg-background relative overflow-hidden select-none"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-80 h-80 bg-primary-fixed/20 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-10 left-0 -ml-24 w-80 h-80 bg-secondary-fixed/25 rounded-full blur-3xl opacity-50 pointer-events-none" />

      {/* Top App Bar with Logo, Back, and Skip Buttons */}
      <header className="w-full flex items-center justify-between z-10 h-12">
        <div className="flex items-center gap-2">
          {step > 1 ? (
            <button
              id="onboarding_back_btn"
              onClick={handleBack}
              className="text-primary hover:bg-surface-container-low p-2 rounded-full transition-colors flex items-center justify-center active:scale-95"
              aria-label={t('onboarding.back')}
            >
              {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            </button>
          ) : (
            <img
              src={APP_IMAGES.logoTransparent}
              alt="YAAD Logo"
              className="h-8 w-auto object-contain"
            />
          )}
        </div>

        {/* Skip button (available on all non-final steps) */}
        {step < steps.length ? (
          <button
            id="onboarding_skip_btn"
            onClick={() => onComplete(false)}
            className="text-on-surface-variant font-['Manrope'] text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-full hover:bg-surface-container-low transition-colors active:scale-95"
          >
            {t('onboarding.skip')}
          </button>
        ) : (
          <div className="w-12" />
        )}
      </header>

      {/* Main Slide Content with smooth transition */}
      <div className="flex-1 flex flex-col items-center justify-center text-center z-10 w-full my-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`onboarding-step-${step}`}
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, x: isRTL ? -20 : 20 }
            }
            animate={{ opacity: 1, x: 0 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, x: isRTL ? 20 : -20 }
            }
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex flex-col items-center w-full"
          >
            {/* Visual Illustration Card */}
            <div className="w-full max-w-[280px] sm:max-w-[320px] aspect-square bg-surface-container-lowest rounded-3xl shadow-[0px_10px_35px_rgba(0,30,21,0.06)] border border-surface-dim flex flex-col items-center justify-center p-6 mb-6 relative group hover:scale-[1.01] transition-transform">
              <img
                src={currentStep.image}
                alt={currentStep.imageAlt}
                className="object-contain w-full h-full drop-shadow-md rounded-2xl select-none"
              />
              <div
                className={`absolute bottom-3 right-3 p-2 rounded-2xl ${currentStep.colorClass} shadow-xs`}
              >
                <StepIcon className="w-5 h-5" />
              </div>
            </div>

            {/* Step Content Typography */}
            <div className="max-w-[360px] space-y-2 px-2">
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-extrabold text-primary tracking-tight leading-snug">
                {t(currentStep.titleKey)}
              </h2>
              <p className="font-['Manrope'] text-sm sm:text-base text-on-surface-variant leading-relaxed">
                {t(currentStep.subtitleKey)}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls: Step Dots & Navigation Actions */}
      <footer className="w-full flex flex-col items-center z-10 gap-5 pb-2">
        {/* Step Progress Indicators */}
        <div className="flex items-center gap-2" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={4}>
          {steps.map((s) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              aria-label={`Go to step ${s.id}`}
              className={`transition-all duration-300 rounded-full h-2 ${
                step === s.id
                  ? 'w-7 bg-primary shadow-xs'
                  : 'w-2 bg-surface-dim hover:bg-surface-variant'
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-sm flex flex-col gap-2.5">
          {step < steps.length ? (
            <button
              id="onboarding_next_btn"
              onClick={handleNext}
              className="w-full h-12 sm:h-13 rounded-full bg-primary text-on-primary font-['Manrope'] text-base font-bold flex items-center justify-center gap-2 shadow-[0px_8px_20px_rgba(0,30,21,0.12)] hover:bg-primary-container active:scale-[0.98] transition-all"
            >
              <span>{t('onboarding.next')}</span>
              {isRTL ? <ArrowLeft className="w-4 h-4 stroke-[2.5]" /> : <ArrowRight className="w-4 h-4 stroke-[2.5]" />}
            </button>
          ) : (
            <div className="w-full flex flex-col gap-2">
              <button
                id="onboarding_get_started_btn"
                onClick={() => onComplete(false)}
                className="w-full h-12 sm:h-13 rounded-full bg-primary text-on-primary font-['Manrope'] text-base font-bold flex items-center justify-center gap-2 shadow-[0px_8px_20px_rgba(0,30,21,0.12)] hover:bg-primary-container active:scale-[0.98] transition-all"
              >
                <span>{t('onboarding.getStarted')}</span>
                <Check className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                id="onboarding_start_tour_btn"
                onClick={handleStartTour}
                className="w-full h-11 rounded-full bg-surface-container text-primary font-['Manrope'] text-sm font-bold flex items-center justify-center gap-2 border border-surface-dim hover:bg-surface-container-high active:scale-[0.98] transition-all"
              >
                <Compass className="w-4 h-4 text-primary" />
                <span>{t('onboarding.startTour')}</span>
              </button>
            </div>
          )}
        </div>
      </footer>
    </main>
  );
};
