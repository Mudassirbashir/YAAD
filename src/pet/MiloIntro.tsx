/**
 * MiloIntro - "Meet Milo" Onboarding Intro Modal (v5)
 * Shown once upon onboarding/signup completion to introduce Milo.
 * Calm, authentic presentation: 160px happy Milo with gentle breathing and blinking.
 */

import React, { useEffect, useState } from 'react';
import { MiloImage } from './MiloImage';

export interface MiloIntroProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export const STORAGE_MILO_INTRO_SEEN_KEY = 'milo-intro-seen';

export const MiloIntro: React.FC<MiloIntroProps> = ({ isOpen, onDismiss }) => {
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[48] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm ${
        reducedMotion ? '' : 'animate-in fade-in duration-200'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Meet Milo Introduction"
      onClick={onDismiss}
    >
      <div
        className={`relative w-full max-w-xs rounded-3xl bg-surface-container-highest/98 p-6 shadow-2xl border border-white/20 text-center flex flex-col items-center ${
          reducedMotion ? '' : 'animate-in zoom-in-95 duration-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Milo 160px happy companion */}
        <div className="my-2">
          <MiloImage
            expression="happy"
            size={160}
          />
        </div>

        {/* Heading */}
        <h2 className="font-display text-2xl font-black text-on-surface tracking-tight mt-3">
          Hi, I'm Milo!
        </h2>

        {/* Warm Subtext */}
        <p className="text-sm font-medium text-on-surface-variant mt-2 leading-relaxed">
          Your little shopping buddy. I'll cheer you on.
        </p>

        {/* One action button */}
        <button
          type="button"
          onClick={onDismiss}
          className="mt-6 w-full py-3.5 px-6 rounded-2xl bg-primary text-on-primary font-bold shadow-md hover:bg-primary/95 active:scale-98 transition-all"
        >
          Let's go
        </button>
      </div>
    </div>
  );
};

