import { BarcodeLookupResult, ScannedProduct } from './types';

const STORAGE_KEY = 'yaad_barcode_cache_v1';
const MAX_ENTRIES = 200;
const POSITIVE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days for confirmed products

interface StoredCacheEntry {
  product: ScannedProduct;
  source: string;
  timestamp: number;
}

type CacheStorageMap = Record<string, StoredCacheEntry>;

export class PersistentBarcodeCache {
  private memoryFallback = new Map<string, StoredCacheEntry>();

  private loadStorage(): CacheStorageMap {
    if (typeof window === 'undefined' || !window.localStorage) {
      return {};
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw) as CacheStorageMap;
    } catch {
      return {};
    }
  }

  private saveStorage(data: CacheStorageMap): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage quota exceeded or disabled
    }
  }

  /**
   * Retrieves a cached product lookup if valid and non-expired.
   */
  get(barcode: string): BarcodeLookupResult | null {
    if (!barcode) return null;
    const cleanKey = barcode.trim();

    // 1. Try localStorage
    const storageData = this.loadStorage();
    const entry = storageData[cleanKey] || this.memoryFallback.get(cleanKey);

    if (!entry) return null;

    if (Date.now() - entry.timestamp > POSITIVE_CACHE_TTL_MS) {
      this.delete(cleanKey);
      return null;
    }

    return {
      status: 'FOUND',
      product: entry.product,
      source: entry.source,
      fromCache: true,
    };
  }

  /**
   * Saves a found product into persistent cache.
   */
  set(barcode: string, result: BarcodeLookupResult): void {
    if (!barcode || result.status !== 'FOUND' || !result.product) return;

    const cleanKey = barcode.trim();
    const entry: StoredCacheEntry = {
      product: result.product,
      source: result.source || 'cache',
      timestamp: Date.now(),
    };

    this.memoryFallback.set(cleanKey, entry);

    const storageData = this.loadStorage();
    storageData[cleanKey] = entry;

    // Evict oldest if exceeding capacity
    const keys = Object.keys(storageData);
    if (keys.length > MAX_ENTRIES) {
      keys.sort((a, b) => storageData[a].timestamp - storageData[b].timestamp);
      const toRemove = keys.slice(0, keys.length - MAX_ENTRIES);
      for (const k of toRemove) {
        delete storageData[k];
      }
    }

    this.saveStorage(storageData);
  }

  delete(barcode: string): void {
    const cleanKey = barcode.trim();
    this.memoryFallback.delete(cleanKey);
    const storageData = this.loadStorage();
    if (storageData[cleanKey]) {
      delete storageData[cleanKey];
      this.saveStorage(storageData);
    }
  }

  clear(): void {
    this.memoryFallback.clear();
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignored
      }
    }
  }
}

export const defaultPersistentCache = new PersistentBarcodeCache();
