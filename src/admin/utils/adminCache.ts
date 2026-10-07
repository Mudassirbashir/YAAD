/**
 * YAAD Admin Panel - High-Performance Client Cache & SWR System
 * Provides 0ms instant tab switching and prevents repetitive, slow API calls.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface SwrOptions<T> {
  ttl?: number;
  onRevalidate?: (fresh: T) => void;
  force?: boolean;
}

class AdminCache {
  private cache = new Map<string, CacheEntry<any>>();
  private inFlightRequests = new Map<string, Promise<any>>();
  private defaultTtlMs = 3 * 60 * 1000; // 3 minutes fresh cache

  public get<T>(key: string, maxAgeMs: number = this.defaultTtlMs): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > maxAgeMs) {
      return null;
    }
    return entry.data as T;
  }

  public getStale<T>(key: string): T | null {
    const entry = this.cache.get(key);
    return entry ? (entry.data as T) : null;
  }

  public set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  public invalidate(prefix?: string): void {
    if (!prefix) {
      this.cache.clear();
      return;
    }
    for (const key of Array.from(this.cache.keys())) {
      if (key.startsWith(prefix) || key.includes(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  public invalidatePrefix(prefix: string): void {
    this.invalidate(prefix);
  }

  /**
   * Overloaded fetchWithSwr supporting both function-fetcher and url+headers fetcher
   */
  public async fetchWithSwr<T>(
    keyOrUrl: string,
    fetcherOrHeaders: (() => Promise<T>) | Record<string, string>,
    onUpdateOrOptions?: ((freshData: T) => void) | SwrOptions<T>,
    forceRefreshParam: boolean = false
  ): Promise<any> {
    // Determine whether signature 1 or signature 2 is used
    if (typeof fetcherOrHeaders === 'function') {
      // Signature 2: fetchWithSwr(key, fetcher, options)
      const key = keyOrUrl;
      const fetcher = fetcherOrHeaders;
      const options = (typeof onUpdateOrOptions === 'object' ? onUpdateOrOptions : {}) as SwrOptions<T>;
      const ttl = options.ttl ?? this.defaultTtlMs;
      const force = options.force ?? false;

      if (!force) {
        const cached = this.get<T>(key, ttl);
        if (cached !== null) {
          return cached;
        }

        const stale = this.getStale<T>(key);
        if (stale !== null) {
          // Background revalidation
          this.executeFetcher(key, fetcher)
            .then((fresh) => {
              if (fresh !== null && options.onRevalidate) {
                options.onRevalidate(fresh);
              }
            })
            .catch(() => null);

          return stale;
        }
      }

      // In-flight coalescing
      let inFlight = this.inFlightRequests.get(key);
      if (!inFlight) {
        inFlight = this.executeFetcher(key, fetcher);
        this.inFlightRequests.set(key, inFlight);
      }

      try {
        const result = await inFlight;
        return result;
      } finally {
        this.inFlightRequests.delete(key);
      }
    } else {
      // Signature 1: fetchWithSwr(url, headers, onBackgroundUpdate, forceRefresh)
      const url = keyOrUrl;
      const headers = fetcherOrHeaders;
      const onBackgroundUpdate = typeof onUpdateOrOptions === 'function' ? onUpdateOrOptions : undefined;
      const forceRefresh = forceRefreshParam;
      const cacheKey = `${url}::${headers.Authorization || ''}`;

      if (!forceRefresh) {
        const cached = this.get<T>(cacheKey);
        if (cached) {
          return { data: cached, isFromCache: true };
        }

        const stale = this.getStale<T>(cacheKey);
        if (stale) {
          this.executeHttpFetch<T>(url, headers, cacheKey)
            .then((fresh) => {
              if (fresh && onBackgroundUpdate) {
                onBackgroundUpdate(fresh);
              }
            })
            .catch(() => null);

          return { data: stale, isFromCache: true };
        }
      }

      let requestPromise = this.inFlightRequests.get(cacheKey);
      if (!requestPromise) {
        requestPromise = this.executeHttpFetch<T>(url, headers, cacheKey);
        this.inFlightRequests.set(cacheKey, requestPromise);
      }

      try {
        const freshData = await requestPromise;
        return { data: freshData, isFromCache: false };
      } finally {
        this.inFlightRequests.delete(cacheKey);
      }
    }
  }

  private async executeFetcher<T>(key: string, fetcher: () => Promise<T>): Promise<T | null> {
    try {
      const data = await fetcher();
      this.set(key, data);
      return data;
    } catch (err: any) {
      if (err?.message?.includes('403') || err?.message?.includes('401') || err?.message?.includes('Unauthorized')) {
        return null;
      }
      console.warn(`[AdminCache] Background fetch failed for ${key}:`, err);
      return null;
    }
  }

  private async executeHttpFetch<T>(url: string, headers: Record<string, string>, cacheKey: string): Promise<T | null> {
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) {
        if (res.status === 401) {
          this.cache.clear();
        }
        return null;
      }
      const data = await res.json();
      this.set(cacheKey, data);
      return data;
    } catch (err: any) {
      if (err?.message?.includes('403') || err?.message?.includes('401')) {
        return null;
      }
      console.warn(`[AdminCache] Background fetch failed for ${url}:`, err);
      return null;
    }
  }
}

export const adminCache = new AdminCache();
