/**
 * MiloHost - Placement Wrapper for Milo
 * Supports hero, floating mini (draggable), and celebration overlay variants.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MiloCanvas } from './MiloCanvas';
import { useMilo } from './useMilo';
import { MiloExpression } from './miloExpressions';
import { X, Volume2, VolumeX } from 'lucide-react';

export type MiloHostVariant = 'hero' | 'mini' | 'celebration';

export interface MiloHostProps {
  variant?: MiloHostVariant;
  expression?: MiloExpression;
  onExpressionChange?: (expr: MiloExpression) => void;
  onDismissCelebration?: () => void;
  className?: string;
}

const STORAGE_MINI_POS_KEY = 'yaad_milo_mini_pos';

interface Position {
  x: number;
  y: number;
}

export const MiloHost: React.FC<MiloHostProps> = ({
  variant = 'hero',
  expression: propExpression,
  onExpressionChange,
  onDismissCelebration,
  className = '',
}) => {
  // Use state machine hook
  const {
    expression: hookExpression,
    trigger,
    setExpression,
    isSoundEnabled,
    setSoundEnabled,
  } = useMilo(variant === 'celebration' ? 'hurrah' : 'happy');

  const activeExpression = propExpression || hookExpression;

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

  // Mini variant floating & dragging logic
  const [miniPos, setMiniPos] = useState<Position>(() => {
    if (typeof window === 'undefined') return { x: 20, y: 120 };
    try {
      const saved = localStorage.getItem(STORAGE_MINI_POS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch {
      // Fallback to default
    }
    return {
      x: Math.max(16, (typeof window !== 'undefined' ? window.innerWidth : 360) - 96),
      y: (typeof window !== 'undefined' ? window.innerHeight : 640) - 180,
    };
  });

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ pointerX: number; pointerY: number; startX: number; startY: number }>({
    pointerX: 0,
    pointerY: 0,
    startX: 0,
    startY: 0,
  });
  const hasMovedSignificantlyRef = useRef(false);

  const handleMiniPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    hasMovedSignificantlyRef.current = false;
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startX: miniPos.x,
      startY: miniPos.y,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handleMiniPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.pointerX;
    const dy = e.clientY - dragStartRef.current.pointerY;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasMovedSignificantlyRef.current = true;
    }

    const maxX = window.innerWidth - 84;
    const maxY = window.innerHeight - 84;

    const newX = Math.max(12, Math.min(maxX, dragStartRef.current.startX + dx));
    const newY = Math.max(12, Math.min(maxY, dragStartRef.current.startY + dy));

    setMiniPos({ x: newX, y: newY });
  };

  const handleMiniPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);

    // Persist position
    try {
      localStorage.setItem(STORAGE_MINI_POS_KEY, JSON.stringify(miniPos));
    } catch {}

    // If it was just a tap without significant movement, trigger laughing
    if (!hasMovedSignificantlyRef.current) {
      handleMiloTap();
    }
  };

  // 1. CELEBRATION VARIANT (Full-screen overlay)
  if (variant === 'celebration') {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300 ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label="Celebration with Milo"
      >
        <div className="relative w-full max-w-sm rounded-3xl bg-surface-container-highest/95 p-6 shadow-2xl border border-white/20 text-center flex flex-col items-center">
          {/* Close button */}
          <button
            type="button"
            onClick={onDismissCelebration}
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
            onClick={onDismissCelebration}
            className="mt-6 w-full py-3.5 px-6 rounded-2xl bg-primary text-on-primary font-bold shadow-md hover:bg-primary/95 active:scale-98 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // 2. MINI VARIANT (Floating, Draggable)
  if (variant === 'mini') {
    return (
      <div
        onPointerDown={handleMiniPointerDown}
        onPointerMove={handleMiniPointerMove}
        onPointerUp={handleMiniPointerUp}
        style={{
          transform: `translate3d(${miniPos.x}px, ${miniPos.y}px, 0)`,
          touchAction: 'none',
        }}
        className={`fixed top-0 left-0 z-40 select-none cursor-grab active:cursor-grabbing transition-shadow hover:drop-shadow-lg ${className}`}
        aria-label="Floating Milo Companion"
      >
        <div className="relative group">
          <MiloCanvas
            expression={activeExpression}
            size={76}
            onTap={handleMiloTap}
          />
        </div>
      </div>
    );
  }

  // 3. HERO VARIANT (Home Screen Companion)
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      aria-label="Milo Companion Hero"
    >
      <div className="relative flex flex-col items-center">
        {/* Ambient subtle warm backlight */}
        <div
          className="absolute inset-0 m-auto w-36 h-36 rounded-full bg-amber-400/20 blur-2xl pointer-events-none -z-10"
          aria-hidden="true"
        />

        {/* Milo Canvas */}
        <MiloCanvas
          expression={activeExpression}
          size={180}
          onTap={handleMiloTap}
        />
      </div>
    </div>
  );
};

