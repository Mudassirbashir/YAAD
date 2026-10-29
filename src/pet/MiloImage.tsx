/**
 * Milo Image Renderer (v3)
 * Renders Milo companion using pre-rendered bundled WebP assets with smooth
 * crossfade transitions, realistic eyelids/blinking, and subtle idle breathing.
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
  const [isCrossfading, setIsCrossfading] = useState<boolean>(false);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  const prevExprRef = useRef<MiloExpression>(expression);
  const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nextBlinkTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Blink trigger (~150ms swap to blink.webp)
  const triggerBlink = useCallback(() => {
    setIsBlinking(true);
    if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
    blinkTimeoutRef.current = setTimeout(() => {
      setIsBlinking(false);
    }, 150);
  }, []);

  // Schedule next periodic idle blink (every 2.5s - 5.0s)
  const scheduleNextBlink = useCallback(() => {
    if (nextBlinkTimerRef.current) clearTimeout(nextBlinkTimerRef.current);
    const delay = 2500 + Math.random() * 2500;
    nextBlinkTimerRef.current = setTimeout(() => {
      triggerBlink();
      scheduleNextBlink();
    }, delay);
  }, [triggerBlink]);

  // Periodic blinking loop
  useEffect(() => {
    scheduleNextBlink();
    return () => {
      if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
      if (nextBlinkTimerRef.current) clearTimeout(nextBlinkTimerRef.current);
    };
  }, [scheduleNextBlink]);

  // Handle expression change: crossfade + immediate blink
  useEffect(() => {
    if (expression === prevExprRef.current) return;

    // MILO-03: Immediate blink on expression transition
    triggerBlink();

    setPrevExpr(prevExprRef.current);
    setCurrentExpr(expression);
    setIsCrossfading(true);
    prevExprRef.current = expression;

    const timer = setTimeout(() => {
      setIsCrossfading(false);
      setPrevExpr(null);
    }, 200);

    return () => clearTimeout(timer);
  }, [expression, triggerBlink]);

  const currentSrc = MILO_IMAGE_MAP[currentExpr] || `/milo/${currentExpr}.webp`;
  const prevSrc = prevExpr ? (MILO_IMAGE_MAP[prevExpr] || `/milo/${prevExpr}.webp`) : null;
  const blinkSrc = MILO_IMAGE_MAP.blink || '/milo/blink.webp';

  return (
    <div
      onClick={onTap}
      style={{
        width: size,
        height: size,
      }}
      className={`relative select-none flex items-center justify-center pointer-events-auto ${
        reducedMotion ? '' : 'milo-breathing'
      } ${className}`}
      aria-label={`Milo Pet (${currentExpr})`}
    >
      <style>{`
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
        @media (prefers-reduced-motion: reduce) {
          .milo-breathing {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* Underneath layer during crossfade: active current expression */}
      <img
        src={currentSrc}
        alt={`Milo ${currentExpr}`}
        draggable={false}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none rounded-full"
      />

      {/* Top fading-out layer: previous expression fading from 1 to 0 over ~200ms */}
      {prevSrc && (
        <img
          src={prevSrc}
          alt="Milo transition"
          draggable={false}
          className={`absolute inset-0 w-full h-full object-contain pointer-events-none select-none rounded-full transition-opacity duration-200 ease-out ${
            isCrossfading ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}

      {/* Blink overlay: briefly snaps on top for ~150ms */}
      {isBlinking && (
        <img
          src={blinkSrc}
          alt="Milo blinking"
          draggable={false}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none rounded-full z-20"
        />
      )}
    </div>
  );
};

