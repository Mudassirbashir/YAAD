import { useState, useEffect, useRef } from 'react';

export function useSmartScroll(threshold = 30) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show at or near the very top of the page
      if (currentScrollY < 60) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      const diff = currentScrollY - lastScrollY.current;

      // Only trigger if scroll delta exceeds threshold
      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          // Scrolling DOWN -> hide
          setIsVisible(false);
        } else {
          // Scrolling UP -> reveal
          setIsVisible(true);
        }
        lastScrollY.current = currentScrollY;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isVisible;
}
