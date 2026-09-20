import { useState, useEffect } from 'react';

/**
 * Checks whether the current runtime environment is a mobile phone (handset).
 * Accurately excludes iPad, Android tablets, and desktop/laptop screens.
 * 
 * Rules:
 * - Handsets have a viewport width strictly under 768px (Tailwind 'md' breakpoint).
 * - iPads and Android tablets typically have screen width >= 768px.
 * - Explicit iPad user-agent and desktop-class iPad checks are excluded.
 */
export function checkIsMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  // 1. Viewport width check: Phones are < 768px wide
  const isNarrowViewport = window.innerWidth < 768;
  if (!isNarrowViewport) {
    return false;
  }

  // 2. Filter out explicit tablets and iPads that might be in split-view
  const ua = (navigator.userAgent || '').toLowerCase();

  // iPad detection (both traditional UA and desktop Safari on iPad with touch)
  const isIPad =
    ua.includes('ipad') ||
    (ua.includes('macintosh') && navigator.maxTouchPoints > 1 && window.screen.width >= 768);

  // Android tablets generally lack the "Mobile" token in their user-agent
  const isAndroidTablet = ua.includes('android') && !ua.includes('mobile');

  // Generic tablet keywords
  const isGenericTablet = ua.includes('tablet') || ua.includes('kindle') || ua.includes('silk');

  if (isIPad || isAndroidTablet || isGenericTablet) {
    return false;
  }

  return true;
}

/**
 * React hook that reactively tracks whether the current screen is a mobile phone.
 * Updates on resize, orientation change, and media query events.
 */
export function useIsMobileDevice(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => checkIsMobileDevice());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(max-width: 767px)');

    const handleChange = () => {
      setIsMobile(checkIsMobileDevice());
    };

    // Initial check
    handleChange();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      window.addEventListener('resize', handleChange);
      window.addEventListener('orientationchange', handleChange);
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
        window.removeEventListener('resize', handleChange);
        window.removeEventListener('orientationchange', handleChange);
      };
    } else {
      mediaQuery.addListener(handleChange);
      window.addEventListener('resize', handleChange);
      window.addEventListener('orientationchange', handleChange);
      return () => {
        mediaQuery.removeListener(handleChange);
        window.removeEventListener('resize', handleChange);
        window.removeEventListener('orientationchange', handleChange);
      };
    }
  }, []);

  return isMobile;
}
