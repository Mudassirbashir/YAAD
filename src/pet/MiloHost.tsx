/**
 * MiloHost - Placement Wrapper for Milo
 * Provides the persistent floating mini bubble (~64px) across all screens
 * and the full-screen celebration overlay on list_completed.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MiloCanvas } from './MiloCanvas';
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

export const MiloHost: React.FC<MiloHostProps> = ({
  variant = 'mini',
  expression: propExpression,
  onExpressionChange,
  onDismissCelebration,
  className = '',
}) => {
  // Global Milo enabled state
  const [enabled, setEnabled] = useState<boolean>(() => isMiloEnabled());

  // Celebration overlay state (triggered on list_completed)
  const [isCelebrationActive, setIsCelebrationActive] = useState<boolean>(
    variant === 'celebration'
  );

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

  // Listen for list_completed event to trigger celebration overlay
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleTrigger = (e: Event) => {
      const detail = (e as CustomEvent<{ event: MiloTriggerEvent }>).detail;
      if (detail && detail.event === 'list_completed') {
        setIsCelebrationActive(true);
        trigger('list_completed');

        // Auto-dismiss after ~2.5 seconds
        if (celebrationTimerRef.current) {
          clearTimeout(celebrationTimerRef.current);
        }
        celebrationTimerRef.current = setTimeout(() => {
          dismissCelebration();
        }, 2500);
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
  const getDefaultPosition = useCallback((): Position => {
    if (typeof window === 'undefined') return { x: 280, y: 520 };
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const bubbleSize = 64;
    const bottomNavMargin = 92; // Clear 80px bottom bar + safe area
    return {
      x: Math.max(12, winW - bubbleSize - 16),
      y: Math.max(16, winH - bubbleSize - bottomNavMargin),
    };
  }, []);

  // Clamp position so Milo never covers the bottom nav or leaves viewport
  const clampPosition = useCallback((pos: Position): Position => {
    if (typeof window === 'undefined') return pos;
    const winW = window.innerWidth;
    const winH = window.innerHeight;
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

  // Re-clamp position on window resize
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setBubblePos((prev) => clampPosition(prev));
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
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
    isDraggingRef.current = true;
    hasMovedSignificantlyRef.current = false;
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startX: bubblePos.x,
      startY: bubblePos.y,
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

    setBubblePos(clampPosition(unconstrained));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);

    // Persist position to localStorage (key: milo-bubble-pos)
    try {
      localStorage.setItem(STORAGE_BUBBLE_POS_KEY, JSON.stringify(bubblePos));
    } catch {}

    // Tap without drag -> trigger laughing + giggle
    if (!hasMovedSignificantlyRef.current) {
      handleMiloTap();
    }
  };

  // If user disabled Milo in settings, hide both bubble and overlay
  if (!enabled) {
    return null;
  }

  // 1. CELEBRATION OVERLAY (List Completed)
  if (isCelebrationActive || variant === 'celebration') {
    return (
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
            <MiloCanvas
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
    );
  }

  // 2. FLOATING MINI BUBBLE (~64px, draggable across all screens)
  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        transform: `translate3d(${bubblePos.x}px, ${bubblePos.y}px, 0)`,
        touchAction: 'none',
        width: 64,
        height: 64,
      }}
      className={`fixed top-0 left-0 z-40 select-none cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 transition-transform duration-150 drop-shadow-md ${className}`}
      aria-label={`Floating Milo Companion (${activeExpression})`}
    >
      <div className="relative w-16 h-16 rounded-full flex items-center justify-center pointer-events-auto">
        <MiloCanvas
          expression={activeExpression}
          size={64}
        />
      </div>
    </div>
  );
};
