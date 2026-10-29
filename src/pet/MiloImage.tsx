/**
 * Milo Image Renderer (v4)
 * Animated Emotion Transitions & Dynamic Per-Expression Idle Motion Engine
 * Features:
 * - 350ms Squash-Blink-Pop animated transition with overshoot cubic-bezier curve
 * - Mid-transition ~100ms blink flash
 * - Per-expression idle motion (laughing shake, excited bounce, sleepy deep breath, sad sway, hurrah jump)
 * - Accessible prefers-reduced-motion support (instant swap + calm blink)
 * - Full asset preloading and 100% offline bundling
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MiloExpression, MILO_IMAGE_MAP } from './miloExpressions';

export interface MiloImageProps {
  expression?: MiloExpression;
  size?: number; // 64 mini / 240 celebration
  className?: string;
  onTap?: () => void;
}

const ALL_ASSET_KEYS: (MiloExpression | 'blink')[] = [
  'idle',
  'happy',
  'laughing',
  'sad',
  'alas',
  'hurrah',
  'excited',
  'listening',
  'sleepy',
  'proud',
  'curious',
  'blink',
];

let preloaded = false;

/**
 * Preload all 12 Milo WebP images into browser cache so transitions never pop
 */
export function preloadMiloImages(): void {
  if (preloaded || typeof window === 'undefined') return;
  preloaded = true;
  ALL_ASSET_KEYS.forEach((key) => {
    const img = new Image();
    img.src = MILO_IMAGE_MAP[key] || `/milo/${key}.webp`;
  });
}

export const MiloImage: React.FC<MiloImageProps> = ({
  expression = 'idle',
  size = 64,
  className = '',
  onTap,
}) => {
  const [currentExpr, setCurrentExpr] = useState<MiloExpression>(expression);
  const [prevExpr, setPrevExpr] = useState<MiloExpression | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isMidBlink, setIsMidBlink] = useState<boolean>(false);
  const [isIdleBlinking, setIsIdleBlinking] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [hurrahKey, setHurrahKey] = useState<number>(0);

  const prevExprRef = useRef<MiloExpression>(expression);
  const idleBlinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nextIdleBlinkTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Preload all expressions on first mount
  useEffect(() => {
    preloadMiloImages();
  }, []);

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Calm idle blink trigger (~150ms swap to blink.webp)
  const triggerIdleBlink = useCallback(() => {
    setIsIdleBlinking(true);
    if (idleBlinkTimeoutRef.current) clearTimeout(idleBlinkTimeoutRef.current);
    idleBlinkTimeoutRef.current = setTimeout(() => {
      setIsIdleBlinking(false);
    }, 150);
  }, []);

  // Schedule periodic idle blink (every 2.5s - 5.0s)
  const scheduleNextIdleBlink = useCallback(() => {
    if (nextIdleBlinkTimerRef.current) clearTimeout(nextIdleBlinkTimerRef.current);
    const delay = 2500 + Math.random() * 2500;
    nextIdleBlinkTimerRef.current = setTimeout(() => {
      triggerIdleBlink();
      scheduleNextIdleBlink();
    }, delay);
  }, [triggerIdleBlink]);

  // Periodic blinking loop
  useEffect(() => {
    scheduleNextIdleBlink();
    return () => {
      if (idleBlinkTimeoutRef.current) clearTimeout(idleBlinkTimeoutRef.current);
      if (nextIdleBlinkTimerRef.current) clearTimeout(nextIdleBlinkTimerRef.current);
    };
  }, [scheduleNextIdleBlink]);

  // Handle expression change: animated transition (~350ms total) or instant swap in reduced-motion
  useEffect(() => {
    if (expression === prevExprRef.current) return;
    const outgoing = prevExprRef.current;
    prevExprRef.current = expression;

    if (expression === 'hurrah') {
      setHurrahKey((k) => k + 1);
    }

    if (reducedMotion) {
      setCurrentExpr(expression);
      setPrevExpr(null);
      setIsTransitioning(false);
      triggerIdleBlink();
      return;
    }

    // Begin animated transition
    setPrevExpr(outgoing);
    setCurrentExpr(expression);
    setIsTransitioning(true);

    // Mid-transition: flash blink.webp for ~100ms (from 100ms to 200ms)
    const midBlinkStart = setTimeout(() => {
      setIsMidBlink(true);
    }, 100);

    const midBlinkEnd = setTimeout(() => {
      setIsMidBlink(false);
    }, 200);

    // End transition at 350ms (outgoing squash 120ms + incoming pop 230ms)
    const transitionEnd = setTimeout(() => {
      setIsTransitioning(false);
      setPrevExpr(null);
    }, 350);

    return () => {
      clearTimeout(midBlinkStart);
      clearTimeout(midBlinkEnd);
      clearTimeout(transitionEnd);
    };
  }, [expression, reducedMotion, triggerIdleBlink]);

  // Expression-specific idle motion class (in addition to the 4s breathing wobble)
  const getExpressionMotionClass = (expr: MiloExpression): string => {
    if (reducedMotion || isTransitioning) return '';
    switch (expr) {
      case 'laughing':
        return 'milo-motion-laughing';
      case 'excited':
        return 'milo-motion-excited';
      case 'sleepy':
        return 'milo-motion-sleepy';
      case 'sad':
        return 'milo-motion-sad';
      case 'hurrah':
        return 'milo-motion-hurrah';
      default:
        return '';
    }
  };

  const currentSrc = MILO_IMAGE_MAP[currentExpr] || `/milo/${currentExpr}.webp`;
  const prevSrc = prevExpr ? (MILO_IMAGE_MAP[prevExpr] || `/milo/${prevExpr}.webp`) : null;
  const blinkSrc = MILO_IMAGE_MAP.blink || '/milo/blink.webp';
  const showBlink = isIdleBlinking || isMidBlink;

  return (
    <div
      onClick={onTap}
      style={{
        width: size,
        height: size,
      }}
      className={`relative select-none flex items-center justify-center pointer-events-auto ${className}`}
      aria-label={`Milo Pet (${currentExpr})`}
    >
      <style>{`
        /* 1. Base Idle Aliveness: Subtle 4s Breathing Wobble */
        @keyframes milo-breathe {
          0%, 100% {
            transform: scale(1) rotate(-2deg);
          }
          50% {
            transform: scale(1.03) rotate(2deg);
          }
        }
        .milo-breathing {
          animation: milo-breathe 4s ease-in-out infinite;
          transform-origin: center center;
          will-change: transform;
        }

        /* 2. Transition Animations (~350ms total) */
        /* Outgoing Image: Quick squash over 120ms while fading out */
        @keyframes milo-squash-out {
          0% {
            transform: scale(1, 1);
            opacity: 1;
          }
          100% {
            transform: scale(1.08, 0.82);
            opacity: 0;
          }
        }
        .milo-transition-squash {
          animation: milo-squash-out 120ms ease-in forwards;
          transform-origin: center bottom;
          will-change: transform, opacity;
        }

        /* Incoming Image: Springy pop-in over 230ms with overshoot curve and tiny wiggle */
        @keyframes milo-pop-in {
          0% {
            transform: scale(0.88) rotate(-5deg);
            opacity: 0;
          }
          60% {
            transform: scale(1.06) rotate(5deg);
            opacity: 1;
          }
          100% {
            transform: scale(1.0) rotate(0deg);
            opacity: 1;
          }
        }
        .milo-transition-pop {
          animation: milo-pop-in 230ms cubic-bezier(0.34, 1.56, 0.64, 1) 120ms both;
          transform-origin: center center;
          will-change: transform, opacity;
        }

        /* 3. Per-Expression Idle Motions (additive on top of breathing wobble) */
        /* Laughing: continuous gentle shake (0.6s) */
        @keyframes milo-shake {
          0%, 100% {
            transform: rotate(-4deg);
          }
          50% {
            transform: rotate(4deg);
          }
        }
        .milo-motion-laughing {
          animation: milo-shake 0.6s ease-in-out infinite;
          transform-origin: center center;
          will-change: transform;
        }

        /* Excited: small bounce loop (0.8s) */
        @keyframes milo-bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6%);
          }
        }
        .milo-motion-excited {
          animation: milo-bounce 0.8s ease-in-out infinite;
          transform-origin: center center;
          will-change: transform;
        }

        /* Sleepy: slow deep breathing loop (6s) */
        @keyframes milo-sleepy-breathe {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .milo-motion-sleepy {
          animation: milo-sleepy-breathe 6s ease-in-out infinite;
          transform-origin: center center;
          will-change: transform;
        }

        /* Sad: slow side sway loop (3s) */
        @keyframes milo-sway {
          0%, 100% {
            transform: rotate(-3deg);
          }
          50% {
            transform: rotate(3deg);
          }
        }
        .milo-motion-sad {
          animation: milo-sway 3s ease-in-out infinite;
          transform-origin: center bottom;
          will-change: transform;
        }

        /* Hurrah: one celebratory jump each time hurrah becomes active */
        @keyframes milo-celebrate-jump {
          0% {
            transform: translateY(0);
          }
          35% {
            transform: translateY(-12%);
          }
          70% {
            transform: translateY(2%);
          }
          100% {
            transform: translateY(0);
          }
        }
        .milo-motion-hurrah {
          animation: milo-celebrate-jump 0.65s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          transform-origin: center bottom;
          will-change: transform;
        }

        /* 4. Accessibility: prefers-reduced-motion disables all motion */
        @media (prefers-reduced-motion: reduce) {
          .milo-breathing,
          .milo-motion-laughing,
          .milo-motion-excited,
          .milo-motion-sleepy,
          .milo-motion-sad,
          .milo-motion-hurrah,
          .milo-transition-squash,
          .milo-transition-pop {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* Layer 1: Outer Breathing Wrapper (4s subtle wobble) */}
      <div
        className={`relative w-full h-full flex items-center justify-center ${
          reducedMotion ? '' : 'milo-breathing'
        }`}
      >
        {/* Layer 2: Inner Per-Expression Motion Wrapper */}
        <div
          key={currentExpr === 'hurrah' ? `hurrah-${hurrahKey}` : undefined}
          className={`relative w-full h-full flex items-center justify-center ${getExpressionMotionClass(
            currentExpr
          )}`}
        >
          {/* Outgoing Image: squashes and fades over 120ms during transition */}
          {prevSrc && isTransitioning && (
            <img
              src={prevSrc}
              alt="Milo outgoing"
              draggable={false}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none rounded-full milo-transition-squash"
            />
          )}

          {/* Incoming / Active Image: springy pop-in on transition, stable when idle */}
          <img
            key={`img-${currentExpr}`}
            src={currentSrc}
            alt={`Milo ${currentExpr}`}
            draggable={false}
            className={`absolute inset-0 w-full h-full object-contain pointer-events-none select-none rounded-full ${
              isTransitioning && !reducedMotion ? 'milo-transition-pop' : ''
            }`}
          />

          {/* Blink Overlay: briefly snaps on top for ~100ms (mid-transition) or ~150ms (idle blink) */}
          {showBlink && (
            <img
              src={blinkSrc}
              alt="Milo blinking"
              draggable={false}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none rounded-full z-20"
            />
          )}
        </div>
      </div>
    </div>
  );
};
