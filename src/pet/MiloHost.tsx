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
import { playMiloSound } from './miloSounds';
import { playCompletionSound, triggerHaptic } from '../lib/sound';
import { X, Volume2, VolumeX } from 'lucide-react';

export type MiloHostVariant = 'mini' | 'celebration' | 'hero';

export interface MiloPendingList {
  id: string;
  name: string;
  createdAt: number;
}

export interface MiloHostProps {
  variant?: MiloHostVariant;
  expression?: MiloExpression;
  onExpressionChange?: (expr: MiloExpression) => void;
  onDismissCelebration?: () => void;
  className?: string;
  getPendingLists?: () => MiloPendingList[];
  onOpenList?: (id: string) => void;
}


// 50-particle celebratory confetti burst for list-complete spectacle
const CELEBRATION_BURST_PARTICLES = Array.from({ length: 50 }, (_, i) => {
  const angle = (i / 50) * Math.PI * 2 + (Math.sin(i * 1.7) * 0.25);
  const dist = 80 + ((i * 13) % 90);
  const colors = ['#10B981', '#F59E0B', '#06B6D4', '#EC4899', '#8B5CF6', '#FBBF24', '#34D399', '#38BDF8'];
  return {
    id: i,
    dx: Math.round(Math.cos(angle) * dist),
    dy: Math.round(Math.sin(angle) * dist),
    color: colors[i % colors.length],
    r: 2.2 + ((i * 7) % 3) * 0.8,
    rot: Math.round((i * 43) % 360),
    delay: Number(((i % 10) * 0.015).toFixed(3)),
    isStar: i % 4 === 0,
  };
});

export const STORAGE_BUBBLE_POS_KEY = 'milo-bubble-pos';
export const STORAGE_MILO_ENABLED_KEY = 'yaad_milo_enabled';
export const STORAGE_PENDING_REMINDER_DATE_KEY = 'milo-pending-reminder-date';

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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
  getPendingLists,
  onOpenList,
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
  // Tick hop micro-reaction on item_purchased (Part E)
  const [isTickHopping, setIsTickHopping] = useState<boolean>(false);
  const lastHopTimeRef = useRef<number>(0);

  const handleItemPurchasedTick = useCallback(() => {
    const now = Date.now();
    // Throttle hop to max 1 per 600ms, sound plays per tick
    if (now - lastHopTimeRef.current >= 600) {
      lastHopTimeRef.current = now;
      setIsTickHopping(true);
      setGazeBlinkTrigger((k) => k + 1);
      setTimeout(() => {
        setIsTickHopping(false);
      }, 400);
    }
    // Short cheerful chirp sound per tick
    playMiloSound('excited');
  }, []);


  // State machine hook - variant celebration uses 'hurrah', otherwise default greeting (sleepy at night, happy in day)
  const {
    expression: hookExpression,
    trigger,
    setExpression,
    isSoundEnabled,
    setSoundEnabled,
  } = useMilo(variant === 'celebration' ? 'hurrah' : undefined);

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

  // Pending-List Reminder State (Part C)
  const [pendingReminder, setPendingReminder] = useState<{ id: string; name: string } | null>(null);
  const reminderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dismiss pending reminder
  const dismissPendingReminder = useCallback(() => {
    if (reminderTimerRef.current) {
      clearTimeout(reminderTimerRef.current);
      reminderTimerRef.current = null;
    }
    setPendingReminder(null);
    trigger('inactivity');
  }, [trigger]);

  // Click handler for speech bubble or tapping Milo during active reminder
  const handleReminderClick = useCallback(() => {
    if (!pendingReminder) return;
    const targetId = pendingReminder.id;
    dismissPendingReminder();
    if (onOpenList) {
      onOpenList(targetId);
    }
  }, [pendingReminder, dismissPendingReminder, onOpenList]);

  // Check pending lists and trigger reminder if conditions met
  const checkPendingListReminder = useCallback(() => {
    if (!getPendingLists) return;
    if (isCelebrationActive || isIntroActive) return;

    const today = getTodayDateString();
    try {
      const lastDate = localStorage.getItem(STORAGE_PENDING_REMINDER_DATE_KEY);
      if (lastDate === today) return; // Max once per day
    } catch {}

    const allPending = getPendingLists();
    if (!allPending || allPending.length === 0) return;

    const now = Date.now();
    const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
    const eligible = allPending.filter((l) => {
      const age = now - l.createdAt;
      return age >= THREE_HOURS_MS && l.createdAt > 0;
    });

    if (eligible.length === 0) return;

    // Oldest pending list wins (sort ascending by createdAt)
    eligible.sort((a, b) => a.createdAt - b.createdAt);
    const oldest = eligible[0];

    try {
      localStorage.setItem(STORAGE_PENDING_REMINDER_DATE_KEY, today);
    } catch {}

    setPendingReminder({
      id: oldest.id,
      name: oldest.name,
    });

    trigger('pending_list_reminder');

    // Auto-dismiss after 8s
    if (reminderTimerRef.current) clearTimeout(reminderTimerRef.current);
    reminderTimerRef.current = setTimeout(() => {
      dismissPendingReminder();
    }, 8000);
  }, [getPendingLists, isCelebrationActive, isIntroActive, trigger, dismissPendingReminder]);

  // Settle delay on mount (~5s) before triggering reminder
  useEffect(() => {
    const timer = setTimeout(() => {
      checkPendingListReminder();
    }, 5000);
    return () => {
      clearTimeout(timer);
      if (reminderTimerRef.current) {
        clearTimeout(reminderTimerRef.current);
      }
    };
  }, [checkPendingListReminder]);

  // If celebration or intro becomes active, dismiss any active pending reminder
  useEffect(() => {
    if ((isCelebrationActive || isIntroActive) && pendingReminder) {
      dismissPendingReminder();
    }
  }, [isCelebrationActive, isIntroActive, pendingReminder, dismissPendingReminder]);

  // Tap handler: Tapping Milo during reminder -> opens list; else laughing + giggle + fur impulse
  const handleMiloTap = useCallback(() => {
    if (pendingReminder) {
      handleReminderClick();
      return;
    }
    trigger('tap');
  }, [pendingReminder, handleReminderClick, trigger]);

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
        playCompletionSound();
        triggerHaptic([40, 50, 70]);

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
      } else if (detail.event === 'item_purchased') {
        handleItemPurchasedTick();
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

            
            {/* 50-particle celebratory confetti burst layer (List-complete spectacle) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible celebrate yaad-party-popper-layer"
              viewBox="-160 -160 320 320"
              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '320px', height: '320px' }}
              aria-hidden="true"
            >
              {CELEBRATION_BURST_PARTICLES.map((p) =>
                p.isStar ? (
                  <polygon
                    key={p.id}
                    points="0,-4 3,0 0,4 -3,0"
                    fill={p.color}
                    className="celebrate-particle"
                    style={
                      {
                        '--dx': `${p.dx}px`,
                        '--dy': `${p.dy}px`,
                        '--rot': `${p.rot}deg`,
                        animationDelay: `${p.delay}s`,
                        animationDuration: '0.65s',
                      } as React.CSSProperties
                    }
                  />
                ) : (
                  <circle
                    key={p.id}
                    cx="0"
                    cy="0"
                    r={p.r}
                    fill={p.color}
                    className="celebrate-particle"
                    style={
                      {
                        '--dx': `${p.dx}px`,
                        '--dy': `${p.dy}px`,
                        '--rot': `${p.rot}deg`,
                        animationDelay: `${p.delay}s`,
                        animationDuration: '0.65s',
                      } as React.CSSProperties
                    }
                  />
                )
              )}
            </svg>

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
          {/* Gentle Pending-List Reminder Speech Bubble (Part C) */}
          {pendingReminder && (
            <div
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                handleReminderClick();
              }}
              style={{
                width: 'max-content',
                maxWidth: '240px',
              }}
              className={`absolute ${
                bubblePos.y < 120 ? 'top-full mt-2' : 'bottom-full mb-2'
              } ${
                bubblePos.x > 180 ? 'right-0' : 'left-0'
              } z-50 p-2.5 rounded-2xl bg-surface-container-highest/95 backdrop-blur-md shadow-xl border border-white/20 text-on-surface cursor-pointer select-none transition-all hover:scale-102`}
              role="status"
              aria-live="polite"
              aria-label="Pending list reminder"
            >
              <div className="flex items-start gap-1.5">
                <p className="text-xs font-medium text-on-surface leading-snug flex-1 select-none">
                  Psst… your "{pendingReminder.name.length > 24 ? `${pendingReminder.name.slice(0, 24)}…` : pendingReminder.name}" list is still waiting 🙂
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissPendingReminder();
                  }}
                  className="p-1 -mr-1 -mt-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors pointer-events-auto"
                  aria-label="Dismiss reminder"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {/* Bubble pointer caret */}
              <div
                className={`absolute w-2 h-2 bg-surface-container-highest/95 rotate-45 border-white/20 ${
                  bubblePos.y < 120
                    ? '-top-1 border-t border-l'
                    : '-bottom-1 border-b border-r'
                } ${
                  bubblePos.x > 180 ? 'right-6' : 'left-6'
                }`}
              />
            </div>
          )}

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
                        {/* Hop wrapper for item_purchased reaction (translateY -8%, 400ms) */}
            <div
              className={`w-full h-full flex items-center justify-center ${
                isTickHopping ? 'milo-tick-hop' : ''
              }`}
            >
              <MiloImage
                expression={activeExpression}
                size={64}
                forceBlinkTrigger={gazeBlinkTrigger}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
