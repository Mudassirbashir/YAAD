/**
 * Plain device-tier detector (zero React, zero network).
 * Reports low-end when ANY of the following holds:
 *  - navigator.hardwareConcurrency <= 4
 *  - navigator.deviceMemory <= 4
 *  - prefers-reduced-motion: reduce
 */
export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  try {
    const nav = navigator as Navigator & { deviceMemory?: number };
    if (
      typeof nav.hardwareConcurrency === 'number' &&
      nav.hardwareConcurrency > 0 &&
      nav.hardwareConcurrency <= 4
    ) {
      return true;
    }
    if (
      typeof nav.deviceMemory === 'number' &&
      nav.deviceMemory > 0 &&
      nav.deviceMemory <= 4
    ) {
      return true;
    }
    if (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export const LOW_END_DEVICE_CLASS = 'yaad-low-end';

let reducedMotionListenerBound = false;

/**
 * Applies/removes the root `yaad-low-end` class for non-admin routes so
 * GPU-expensive backdrop-blur surfaces degrade to opaque backgrounds on
 * low-end phones while remaining unchanged on capable devices and /admin.
 */
export function syncLowEndDeviceClass(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  const isAdmin = window.location.pathname.startsWith('/admin');
  const lowEnd = !isAdmin && isLowEndDevice();
  if (document.documentElement) {
    document.documentElement.classList.toggle(LOW_END_DEVICE_CLASS, lowEnd);
  }

  if (!reducedMotionListenerBound && typeof window.matchMedia === 'function') {
    reducedMotionListenerBound = true;
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const onChange = () => {
        const nextIsAdmin = window.location.pathname.startsWith('/admin');
        const nextLowEnd = !nextIsAdmin && isLowEndDevice();
        document.documentElement?.classList.toggle(LOW_END_DEVICE_CLASS, nextLowEnd);
      };
      if (typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', onChange);
      }
    } catch {}
  }

  return lowEnd;
}

/**
 * Returns false when the device is low-end (cores <= 4, RAM <= 4 GB) OR
 * prefers-reduced-motion is enabled; true otherwise.
 */
export function shouldAnimate(): boolean {
  if (isLowEndDevice()) {
    return false;
  }
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return false;
  }
  return true;
}

