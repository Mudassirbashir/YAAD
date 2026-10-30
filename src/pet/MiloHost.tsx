/**
 * MiloHost - Placement Wrapper for Milo
 * Provides the persistent floating mini bubble (~64px) across all screens
 * and the full-screen celebration overlay on list_completed.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MiloImage } from './MiloImage';
import { MiloIntro } from './MiloIntro';
import { useMilo, MILO_TRIGGER_CUSTOM_EVENT } from './useMilo';
import { MiloExpression, MiloTriggerEvent } from './miloExpressions';
import { X, Volume2, VolumeX } from 'lucide-react';

export type MiloHostVariant = 'mini' | 'celebration' | 'hero';

export interface MiloHostProps {
  variant?: MiloHostVariant;
  expression?: MiloExpression;
  onExpressionChange?: (expr: MiloExpression) => void;
  onDismissCelebration?: () => void;
  className?: string;
}

export const STORAGE_BUBBLE_POS_KEY = 'milo-bubble-pos';
export const STORAGE_MILO_ENABLED_KEY = 'yaad_milo_enabled';

interface Position {
  x: number;
  y: number;
}

/**
 * Check if Milo floating companion is globally enabled
 */
export function isMiloEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(STORAGE_MILO_ENABLED_KEY) !== 'false';
  } catch {
    return true;
  }
}

/**
 * Toggle Milo floating companion on/off
 */
export function setMiloEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_MILO_ENABLED_KEY, enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('yaad:milo:toggle', { detail: { enabled } }));
  } catch {}
}

/**
 * Helper to obtain layout viewport dimensions (document.documentElement.clientWidth / clientHeight)
 * to avoid edge clipping across wide desktop displays and mobile visual viewport fluctuations.
 */
function getViewportDimensions(): { width: number; height: number } {
  const docW = typeof document !== 'undefined' && document.documentElement ? document.documentElement.clientWidth : 0;
  const docH = typeof document !== 'undefined' && document.documentElement ? document.documentElement.clientHeight : 0;
  const winW = docW || (typeof window !== 'undefined' ? window.innerWidth : 375);
  const winH = docH || (typeof window !== 'undefined' ? window.innerHeight : 667);
  return { width: winW, height: winH };
}

export const MiloHost: React.FC<MiloHostProps> = ({
  variant = 'mini',
  expression: propExpression,
  onExpressionChange,
  onDismissCelebration,
  className = '',
}) => {
  // Global Milo enabled state
  const [enabled, setEnabled] = useState<boolean>(() => isMiloEnabled());

  // Dragging active state (controls 1:1 instantaneous transform without transition lag)
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Celebration overlay state (triggered on list_completed)
  const [isCelebrationActive, setIsCelebrationActive] = useState<boolean>(
    variant === 'celebration'
  );

  // Meet Milo Onboarding Intro state (Part C)
  const [isIntroActive, setIsIntroActive] = useState<boolean>(false);

  const celebrationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // State machine hook
  const {
    expression: hookExpression,
    trigger,
    setExpression,
    isSoundEnabled,
    setSoundEnabled,
  } = useMilo(variant === 'celebration' ? 'hurrah' : 'happy');

  const activeExpression = propExpression || hookExpression;

  // Track active expression in ref for gaze/tap_elsewhere checks without stale state
  const activeExpressionRef = useRef<MiloExpression>(activeExpression);
  activeExpressionRef.current = activeExpression;

  // Listen for settings visibility toggle
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleToggle = (e: Event) => {
      const detail = (e as CustomEvent<{ enabled: boolean }>).detail;
      if (typeof detail?.enabled === 'boolean') {
        setEnabled(detail.enabled);
      } else {
        setEnabled(isMiloEnabled());
      }
    };
    window.addEventListener('yaad:milo:toggle', handleToggle);
    return () => {
      window.removeEventListener('yaad:milo:toggle', handleToggle);
    };
  }, []);

  // Sync prop changes
  useEffect(() => {
    if (propExpression && propExpression !== hookExpression) {
      setExpression(propExpression);
    }
  }, [propExpression, hookExpression, setExpression]);

  // Notify parent on expression changes
  useEffect(() => {
    if (onExpressionChange) {
      onExpressionChange(activeExpression);
    }
  }, [activeExpression, onExpressionChange]);

  // Tap handler: Tapping Milo anywhere -> laughing + giggle + fur impulse
  const handleMiloTap = useCallback(() => {
    trigger('tap');
  }, [trigger]);

  // Dismiss celebration overlay (auto or manual)
  const dismissCelebration = useCallback(() => {
    if (celebrationTimerRef.current) {
      clearTimeout(celebrationTimerRef.current);
      celebrationTimerRef.current = null;
    }
    setIsCelebrationActive(false);
    trigger('inactivity'); // settle back to idle
    if (onDismissCelebration) {
      onDismissCelebration();
    }
  }, [trigger, onDismissCelebration]);

  // Dismiss Meet Milo onboarding intro (Part C)
  const handleDismissIntro = useCallback(() => {
    try {
      localStorage.setItem('milo-intro-seen', '1');
    } catch {}
    setIsIntroActive(false);
    trigger('inactivity');
  }, [trigger]);

  // Listen for remote events (list_completed -> celebration, onboarding_complete -> intro)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleTrigger = (e: Event) => {
      const detail = (e as CustomEvent<{ event: MiloTriggerEvent }>).detail;
      if (!detail?.event) return;

      if (detail.event === 'list_completed') {
        setIsCelebrationActive(true);
        trigger('list_completed');

        // Auto-dismiss after ~2.5 seconds
        if (celebrationTimerRef.current) {
          clearTimeout(celebrationTimerRef.current);
        }
        celebrationTimerRef.current = setTimeout(() => {
          dismissCelebration();
        }, 2500);
      } else if (detail.event === 'onboarding_complete') {
        const introSeen = localStorage.getItem('milo-intro-seen') === '1';
        if (!introSeen) {
          setIsIntroActive(true);
          trigger('onboarding_complete');
        }
      }
    };

    window.addEventListener(MILO_TRIGGER_CUSTOM_EVENT, handleTrigger);
    return () => {
      window.removeEventListener(MILO_TRIGGER_CUSTOM_EVENT, handleTrigger);
      if (celebrationTimerRef.current) {
        clearTimeout(celebrationTimerRef.current);
      }
    };
  }, [trigger, dismissCelebration]);

  // Calculate default position: bottom-right, just above bottom navigation bar
  // Uses layout viewport (document.documentElement.clientWidth / clientHeight)
  const getDefaultPosition = useCallback((): Position => {
    if (typeof window === 'undefined') return { x: 280, y: 520 };
    const { width: winW, height: winH } = getViewportDimensions();
    const bubbleSize = 64;
    const bottomNavMargin = 92; // Clear 80px bottom bar + safe area
    return {
      x: Math.max(12, winW - bubbleSize - 16),
      y: Math.max(16, winH - bubbleSize - bottomNavMargin),
    };
  }, []);

  // Clamp position so Milo never covers the bottom nav or clips at any edge
  // Uses layout viewport (document.documentElement.clientWidth / clientHeight)
  const clampPosition = useCallback((pos: Position): Position => {
    if (typeof window === 'undefined') return pos;
    const { width: winW, height: winH } = getViewportDimensions();
    const bubbleSize = 64;
    const bottomNavMargin = 88; // Keep above bottom navigation bar
    const minX = 12;
    const maxX = Math.max(minX, winW - bubbleSize - 12);
    const minY = 16;
    const maxY = Math.max(minY, winH - bubbleSize - bottomNavMargin);

    return {
      x: Math.max(minX, Math.min(maxX, pos.x)),
      y: Math.max(minY, Math.min(maxY, pos.y)),
    };
  }, []);

  // Floating bubble position state (restored from localStorage)
  const [bubblePos, setBubblePos] = useState<Position>(() => {
    if (typeof window === 'undefined') return { x: 280, y: 520 };
    try {
      const saved = localStorage.getItem(STORAGE_BUBBLE_POS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return clampPosition(parsed);
        }
      }
    } catch {}
    return getDefaultPosition();
  });

  // Track latest clamped position in ref for lost-capture and pointerup safety
  const latestBubblePosRef = useRef<Position>(bubblePos);
  latestBubblePosRef.current = bubblePos;

  // Re-clamp position on window resize AND visualViewport resize
  // Keeps the bubble safely inside visible area when mobile browser chrome shows/hides
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setBubblePos((prev) => {
        const next = clampPosition(prev);
        latestBubblePosRef.current = next;
        return next;
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', handleResize, { passive: true });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (vv) {
        vv.removeEventListener('resize', handleResize);
      }
    };
  }, [clampPosition]);

  // Dragging interaction state
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ pointerX: number; pointerY: number; startX: number; startY: number }>({
    pointerX: 0,
    pointerY: 0,
    startX: 0,
    startY: 0,
  });
  const hasMovedSignificantlyRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only primary button
    isDraggingRef.current = true;
    setIsDragging(true);
    hasMovedSignificantlyRef.current = false;
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startX: latestBubblePosRef.current.x,
      startY: latestBubblePosRef.current.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.pointerX;
    const dy = e.clientY - dragStartRef.current.pointerY;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasMovedSignificantlyRef.current = true;
    }

    const unconstrained = {
      x: dragStartRef.current.startX + dx,
      y: dragStartRef.current.startY + dy,
    };

    const nextPos = clampPosition(unconstrained);
    latestBubblePosRef.current = nextPos;
    setBubblePos(nextPos);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);

    // Persist position to localStorage (key: milo-bubble-pos)
    try {
      localStorage.setItem(STORAGE_BUBBLE_POS_KEY, JSON.stringify(latestBubblePosRef.current));
    } catch {}

    // Tap without drag -> trigger laughing + giggle
    if (!hasMovedSignificantlyRef.current) {
      handleMiloTap();
    }
  };

  // Lost-capture safety: ends drag gracefully if browser interrupts pointer capture
  const handleLostPointerCapture = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    try {
      localStorage.setItem(STORAGE_BUBBLE_POS_KEY, JSON.stringify(latestBubblePosRef.current));
    } catch {}
  };

  // Gaze interaction state (Part B)
  const bubbleContainerRef = useRef<HTMLDivElement | null>(null);
  const [gazeOffset, setGazeOffset] = useState<{ x: number; y: number; rotate: number }>({ x: 0, y: 0, rotate: 0 });
  const [gazeBlinkTrigger, setGazeBlinkTrigger] = useState<number>(0);
  const lastGazeTimeRef = useRef<number>(0);
  const gazeResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Global pointerdown listener for Gaze (Part B) and tap_elsewhere (Part A)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleGlobalPointerDown = (e: PointerEvent) => {
      // Ignore if user tapped inside the Milo bubble itself
      if (bubbleContainerRef.current && bubbleContainerRef.current.contains(e.target as Node)) {
        return;
      }

      // Ignore if currently dragging, celebration is active, or intro is active
      if (isDraggingRef.current || isCelebrationActive || isIntroActive) {
        return;
      }

      const now = Date.now();
      // Throttle gaze reactions to max 1 per 800ms
      if (now - lastGazeTimeRef.current < 800) {
        return;
      }
      lastGazeTimeRef.current = now;

      // Part A: Only flash curious when the current expression is idle;
      // never interrupt hurrah, laughing, celebration
      const current = activeExpressionRef.current;
      if (current === 'idle') {
        trigger('tap_elsewhere');
      }

      // Part B: Gaze lean + blink happens on every qualifying tap regardless
      const currentPos = latestBubblePosRef.current;
      const bubbleCenterX = currentPos.x + 32;
      const bubbleCenterY = currentPos.y + 32;
      const dx = e.clientX - bubbleCenterX;
      const dy = e.clientY - bubbleCenterY;
      const dist = Math.hypot(dx, dy);

      if (dist >= 2) {
        const ux = dx / dist;
        const uy = dy / dist;
        const leanX = Math.round(ux * 6 * 10) / 10;
        const leanY = Math.round(uy * 6 * 10) / 10;
        const rotateDeg = Math.round(ux * 6 * 10) / 10;

        setGazeOffset({ x: leanX, y: leanY, rotate: rotateDeg });
        setGazeBlinkTrigger((c) => c + 1);

        if (gazeResetTimerRef.current) clearTimeout(gazeResetTimerRef.current);
        // Eased out over ~600ms, return to rest
        gazeResetTimerRef.current = setTimeout(() => {
          setGazeOffset({ x: 0, y: 0, rotate: 0 });
        }, 120);
      }
    };

    window.addEventListener('pointerdown', handleGlobalPointerDown, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handleGlobalPointerDown);
      if (gazeResetTimerRef.current) clearTimeout(gazeResetTimerRef.current);
    };
  }, [isCelebrationActive, isIntroActive, trigger]);

  // If user disabled Milo in settings, hide both bubble and overlay
  if (!enabled) {
    return null;
  }

  return (
    <>
      {/* 1. "Meet Milo" Onboarding Intro (Part C) */}
      <MiloIntro
        isOpen={isIntroActive}
        onDismiss={handleDismissIntro}
      />

      {/* 2. CELEBRATION OVERLAY (List Completed) */}
      {(isCelebrationActive || variant === 'celebration') && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
          role="dialog"
          aria-modal="true"
          aria-label="Celebration with Milo"
          onClick={dismissCelebration}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl bg-surface-container-highest/95 p-6 shadow-2xl border border-white/20 text-center flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={dismissCelebration}
              className="absolute top-4 right-4 p-2 rounded-full bg-surface-container hover:bg-surface-dim text-on-surface-variant transition-all active:scale-95"
              aria-label="Close celebration"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Sound toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!isSoundEnabled)}
              className="absolute top-4 left-4 p-2 rounded-full bg-surface-container hover:bg-surface-dim text-on-surface-variant transition-all active:scale-95"
              aria-label={isSoundEnabled ? 'Mute sound' : 'Unmute sound'}
            >
              {isSoundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Large celebration Milo */}
            <div className="my-2">
              <MiloImage
                expression="hurrah"
                size={240}
                onTap={handleMiloTap}
              />
            </div>

            <h2 className="font-display text-2xl font-black text-on-surface tracking-tight mt-2">
              Hurrah! List Complete!
            </h2>
            <p className="font-urdu text-base text-outline font-semibold mt-1">
              شاباش! لسٹ مکمل ہو گئی ہے
            </p>

            <button
              type="button"
              onClick={dismissCelebration}
              className="mt-6 w-full py-3.5 px-6 rounded-2xl bg-primary text-on-primary font-bold shadow-md hover:bg-primary/95 active:scale-98 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 3. FLOATING MINI BUBBLE (~64px, draggable across all screens, 1:1 instantaneous drag tracking) */}
      {variant !== 'celebration' && (
        <div
          ref={bubbleContainerRef}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onLostPointerCapture={handleLostPointerCapture}
          style={{
            transform: `translate3d(${bubblePos.x}px, ${bubblePos.y}px, 0)`,
            touchAction: 'none',
            width: 64,
            height: 64,
          }}
          className={`fixed top-0 left-0 z-40 select-none cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 drop-shadow-md ${
            isDragging ? 'transition-none' : 'transition-transform duration-150'
          } ${className}`}
          aria-label={`Floating Milo Companion (${activeExpression})`}
        >
          {/* Gaze Lean Wrapper (Part B): temporary lean up to 6px / 6deg toward tap, eased out in 600ms */}
          <div
            style={{
              transform: isDragging
                ? 'none'
                : `translate3d(${gazeOffset.x}px, ${gazeOffset.y}px, 0) rotate(${gazeOffset.rotate}deg)`,
              transition: isDragging
                ? 'none'
                : 'transform 600ms cubic-bezier(0.25, 1, 0.5, 1)',
              willChange: 'transform',
            }}
            className="relative w-16 h-16 rounded-full flex items-center justify-center pointer-events-auto"
          >
            <MiloImage
              expression={activeExpression}
              size={64}
              forceBlinkTrigger={gazeBlinkTrigger}
            />
          </div>
        </div>
      )}
    </>
  );
};
