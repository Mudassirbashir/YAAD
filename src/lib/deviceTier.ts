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

export const LITE_MODE_STORAGE_KEY = 'yaad_lite_mode';
export const LITE_MODE_EVENT = 'yaad:lite-mode';
export const LITE_MODE_CLASS = 'yaad-lite';

let liteModeListenerBound = false;

/**
 * Reads user-selected Lite mode flag from localStorage (default OFF).
 */
export function isLiteMode(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return window.localStorage.getItem(LITE_MODE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Applies/removes html.yaad-lite for non-admin routes and binds a live listener
 * so toggling Lite mode updates the root class without requiring an app restart.
 */
export function syncLiteModeClass(explicitEnabled?: boolean): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  const isAdmin = window.location.pathname.startsWith('/admin');
  const enabled = typeof explicitEnabled === 'boolean' ? explicitEnabled : isLiteMode();
  const active = !isAdmin && enabled;

  if (document.documentElement) {
    document.documentElement.classList.toggle(LITE_MODE_CLASS, active);
  }

  if (!liteModeListenerBound) {
    liteModeListenerBound = true;
    window.addEventListener(LITE_MODE_EVENT, (e: Event) => {
      const detail = (e as CustomEvent<{ enabled?: boolean }>).detail;
      const nextIsAdmin = window.location.pathname.startsWith('/admin');
      const nextEnabled =
        typeof detail?.enabled === 'boolean' ? detail.enabled : isLiteMode();
      document.documentElement?.classList.toggle(LITE_MODE_CLASS, !nextIsAdmin && nextEnabled);
    });
  }

  return active;
}

/**
 * Persists Lite mode in localStorage, updates html.yaad-lite immediately, and notifies listeners.
 */
export function setLiteMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LITE_MODE_STORAGE_KEY, enabled ? 'true' : 'false');
  } catch {}
  syncLiteModeClass(enabled);
  try {
    window.dispatchEvent(new CustomEvent(LITE_MODE_EVENT, { detail: { enabled } }));
  } catch {}
}

/**
 * Returns false when Lite mode is ON, the device is low-end (cores <= 4, RAM <= 4 GB),
 * OR prefers-reduced-motion is enabled; true otherwise.
 */
export function shouldAnimate(): boolean {
  if (isLiteMode()) {
    return false;
  }
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
