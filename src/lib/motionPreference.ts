import { useEffect, useState } from 'react';
import {
  LITE_MODE_EVENT,
  LITE_MODE_STORAGE_KEY,
  isLiteMode,
  shouldAnimate,
} from './deviceTier';

export { shouldAnimate };

/**
 * Reactive hook backed by isLiteMode() + yaad:lite-mode event listener
 * so toggling Lite mode in Settings updates consumers immediately.
 */
export function useLiteMode(): boolean {
  const [lite, setLite] = useState<boolean>(() => isLiteMode());

  useEffect(() => {
    setLite(isLiteMode());

    if (typeof window === 'undefined') {
      return;
    }

    const handleLiteEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ enabled?: boolean }>).detail;
      if (typeof detail?.enabled === 'boolean') {
        setLite(detail.enabled);
      } else {
        setLite(isLiteMode());
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === LITE_MODE_STORAGE_KEY) {
        setLite(isLiteMode());
      }
    };

    window.addEventListener(LITE_MODE_EVENT, handleLiteEvent);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(LITE_MODE_EVENT, handleLiteEvent);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return lite;
}

/**
 * Reactive hook backed by shouldAnimate() + prefers-reduced-motion + yaad:lite-mode
 * listeners so live OS or Lite-mode toggles take effect immediately.
 */
export function useShouldAnimate(): boolean {
  const [animate, setAnimate] = useState<boolean>(() => shouldAnimate());

  useEffect(() => {
    setAnimate(shouldAnimate());

    if (typeof window === 'undefined') {
      return;
    }

    const handleChange = () => {
      setAnimate(shouldAnimate());
    };

    window.addEventListener(LITE_MODE_EVENT, handleChange);

    if (typeof window.matchMedia !== 'function') {
      return () => {
        window.removeEventListener(LITE_MODE_EVENT, handleChange);
      };
    }

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handleChange);
      return () => {
        window.removeEventListener(LITE_MODE_EVENT, handleChange);
        mq.removeEventListener('change', handleChange);
      };
    }

    if (typeof mq.addListener === 'function') {
      mq.addListener(handleChange);
      return () => {
        window.removeEventListener(LITE_MODE_EVENT, handleChange);
        mq.removeListener(handleChange);
      };
    }

    return () => {
      window.removeEventListener(LITE_MODE_EVENT, handleChange);
    };
  }, []);

  return animate;
}
