/**
 * P6 — offline image helpers.
 *
 * Tiered strategy (research 2026-11-04):
 *   T0 shell precache (Workbox glob) — app shell + placeholder
 *   T1 warm top thumbnails on idle (this file) — ~300-500 most-used
 *   T2 runtime LRU via the Service Worker (yaad-cloudinary-v1, 1500 entries)
 *   T3 full-size cached on tap (same SW cache, CacheFirst)
 *
 * Invariants:
 * - Cloudinary URLs are versioned (v{version}) so CacheFirst never serves stale.
 * - Only HTTP 200s are cached (SW config) — opaque responses would cost ~7MB
 *   of Chrome quota EACH, so crossOrigin="anonymous" is set on catalog <img>s.
 */

const WARM_CACHE = 'yaad-cloudinary-v1';

/** Ask the browser to keep our storage (call after login / app start). */
export async function ensurePersistentStorage(): Promise<boolean> {
  try {
    if (navigator.storage?.persist) {
      return await navigator.storage.persist();
    }
  } catch {
    // ignore — app works without persistence, caches just shrink
  }
  return false;
}

export interface StorageUsage {
  quotaMB: number | null;
  usageMB: number | null;
  percentUsed: number | null;
}

/** For the quiet Settings row: how much offline storage we're using. */
export async function getOfflineStorageUsage(): Promise<StorageUsage> {
  try {
    const est = await navigator.storage?.estimate?.();
    if (!est) return { quotaMB: null, usageMB: null, percentUsed: null };
    const quotaMB = est.quota ? est.quota / 1048576 : null;
    const usageMB = est.usage ? est.usage / 1048576 : null;
    return {
      quotaMB: quotaMB !== null ? Math.round(quotaMB) : null,
      usageMB: usageMB !== null ? Math.round(usageMB * 10) / 10 : null,
      percentUsed: quotaMB && usageMB ? Math.round((usageMB / quotaMB) * 100) : null,
    };
  } catch {
    return { quotaMB: null, usageMB: null, percentUsed: null };
  }
}

function onIdle(cb: () => void): void {
  const ric = (window as any).requestIdleCallback;
  if (typeof ric === 'function') {
    ric(cb, { timeout: 8000 });
  } else {
    setTimeout(cb, 4000);
  }
}

/**
 * T1 warm-up: fetch top thumbnail URLs into the SW cache during idle time.
 * Fire-and-forget; failures are silent. Skips when offline (nothing to warm)
 * or when the Cache API is unavailable.
 */
export function warmCatalogImages(urls: string[]): void {
  if (!urls.length) return;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
  onIdle(async () => {
    try {
      const cache = await caches.open(WARM_CACHE);
      // Sequential, capped — warming must never jank the app or hammer the CDN.
      const batch = urls.slice(0, 300);
      for (const url of batch) {
        try {
          const existing = await cache.match(url);
          if (!existing) {
            await cache.add(new Request(url, { mode: 'cors', credentials: 'omit' }));
          }
        } catch {
          // one bad URL never stops the warm-up
        }
      }
    } catch {
      // Cache API unavailable (private mode etc.) — degrade silently
    }
  });
}
