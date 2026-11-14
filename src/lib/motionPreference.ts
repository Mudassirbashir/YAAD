import { useEffect, useState } from 'react';
import { shouldAnimate } from './deviceTier';

export { shouldAnimate };

/**
 * Reactive hook backed by shouldAnimate() + prefers-reduced-motion change listener
 * so live OS reduced-motion toggles take effect immediately.
 */
export function useShouldAnimate(): boolean {
  const [animate, setAnimate] = useState<boolean>(() => shouldAnimate());

  useEffect(() => {
    setAnimate(shouldAnimate());

    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => {
      setAnimate(shouldAnimate());
    };

    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handleChange);
      return () => {
        mq.removeEventListener('change', handleChange);
      };
    }

    if (typeof mq.addListener === 'function') {
      mq.addListener(handleChange);
      return () => {
        mq.removeListener(handleChange);
      };
    }

    return undefined;
  }, []);

  return animate;
}
