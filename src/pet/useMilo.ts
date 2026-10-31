/**
 * useMilo - Milo Interactive State Machine Hook
 * Handles expression presets, event triggers, auto-idle timers, and sound dispatch.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MiloExpression,
  MiloTriggerEvent,
  EVENT_EXPRESSION_MAP,
} from './miloExpressions';
import {
  playMiloSound,
  isMiloSoundEnabled,
  setMiloSoundEnabled as persistSoundSetting,
} from './miloSounds';

export const MILO_TRIGGER_CUSTOM_EVENT = 'yaad:milo:trigger';

/**
 * Dispatch a Milo trigger event globally from any part of the app.
 */
export function triggerMiloEvent(event: MiloTriggerEvent): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(MILO_TRIGGER_CUSTOM_EVENT, {
      detail: { event },
    })
  );
}

/**
 * Returns Milo's default greeting based on local hour.
 * App opened at night (23:00–06:00 local) greets with 'sleepy'; otherwise 'happy'.
 */
export function getDefaultGreeting(hour: number = new Date().getHours()): MiloExpression {
  return (hour >= 23 || hour < 6) ? 'sleepy' : 'happy';
}

export interface UseMiloReturn {
  expression: MiloExpression;
  trigger: (event: MiloTriggerEvent) => void;
  setExpression: (expr: MiloExpression) => void;
  isSoundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

export function useMilo(initialExpression?: MiloExpression): UseMiloReturn {
  const defaultInitial = initialExpression ?? getDefaultGreeting();
  const [expression, setExpressionState] = useState<MiloExpression>(defaultInitial);
  const [soundEnabled, setSoundState] = useState<boolean>(() => isMiloSoundEnabled());

  const currentExprRef = useRef<MiloExpression>(defaultInitial);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear idle timer
  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  // Update expression, play sound (with idle signature blip), and schedule auto-idle (2s for sad, 10s for others)
  const setExpression = useCallback(
    (nextExpr: MiloExpression) => {
      clearIdleTimer();
      const prevExpr = currentExprRef.current;
      currentExprRef.current = nextExpr;
      setExpressionState(nextExpr);

      // Play sound: if transitioning into idle from another emotion, play idle blip once
      if (nextExpr !== 'idle') {
        playMiloSound(nextExpr);
      } else if (prevExpr !== 'idle') {
        playMiloSound('idle');
      }

      // If not already idle, transition to idle after inactivity (2s for sad, 10s for other emotions)
      if (nextExpr !== 'idle') {
        const timeoutMs = nextExpr === 'sad' ? 2000 : 10000;
        idleTimerRef.current = setTimeout(() => {
          if (currentExprRef.current !== 'idle') {
            currentExprRef.current = 'idle';
            setExpressionState('idle');
            playMiloSound('idle');
          }
        }, timeoutMs);
      }
    },
    [clearIdleTimer]
  );

  // Event trigger dispatcher
  const trigger = useCallback(
    (event: MiloTriggerEvent) => {
      let nextExpr: MiloExpression = EVENT_EXPRESSION_MAP[event];
      if (event === 'app_open') {
        nextExpr = getDefaultGreeting();
      }
      if (nextExpr) {
        setExpression(nextExpr);
      }
    },
    [setExpression]
  );

  // Sound preference setter
  const setSoundEnabled = useCallback((enabled: boolean) => {
    persistSoundSetting(enabled);
    setSoundState(enabled);
  }, []);

  // Initial mount: app open -> default greeting, auto-idle after timer
  useEffect(() => {
    // Initial sound & timer
    if (defaultInitial !== 'idle') {
      playMiloSound(defaultInitial);
      const timeoutMs = defaultInitial === 'sad' ? 2000 : 10000;
      idleTimerRef.current = setTimeout(() => {
        if (currentExprRef.current !== 'idle') {
          currentExprRef.current = 'idle';
          setExpressionState('idle');
          playMiloSound('idle');
        }
      }, timeoutMs);
    }

    return () => {
      clearIdleTimer();
    };
  }, [defaultInitial, clearIdleTimer]);

  // Pause/resume idle timer on tab visibilitychange (Part E)
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearIdleTimer();
      } else {
        if (currentExprRef.current !== 'idle') {
          clearIdleTimer();
          const timeoutMs = currentExprRef.current === 'sad' ? 2000 : 10000;
          idleTimerRef.current = setTimeout(() => {
            if (currentExprRef.current !== 'idle') {
              currentExprRef.current = 'idle';
              setExpressionState('idle');
              playMiloSound('idle');
            }
          }, timeoutMs);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [clearIdleTimer]);

  // Global event listener for remote triggers
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleCustomTrigger = (e: Event) => {
      const detail = (e as CustomEvent<{ event: MiloTriggerEvent }>).detail;
      if (detail && detail.event) {
        trigger(detail.event);
      }
    };

    window.addEventListener(MILO_TRIGGER_CUSTOM_EVENT, handleCustomTrigger);
    return () => {
      window.removeEventListener(MILO_TRIGGER_CUSTOM_EVENT, handleCustomTrigger);
    };
  }, [trigger]);

  return {
    expression,
    trigger,
    setExpression,
    isSoundEnabled: soundEnabled,
    setSoundEnabled,
  };
}

