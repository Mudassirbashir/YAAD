import { BarcodeLookupResult, BarcodeProvider, NormalizedBarcode } from './types';
import { normalizeBarcode } from './normalizer';
import { OpenFoodFactsProvider } from './providers/openFoodFacts';
import { OpenProductsFactsProvider } from './providers/openProductsFacts';
import { UPCItemDBProvider } from './providers/upcItemDB';
import { defaultPersistentCache, PersistentBarcodeCache } from './persistentCache';
import { resolveGS1Prefix } from './gs1Prefix';

interface CacheEntry {
  result: BarcodeLookupResult;
  timestamp: number;
}

const POSITIVE_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes in-memory
const NOT_FOUND_CACHE_TTL_MS = 5 * 60 * 1000;  // 5 minutes for confirmed NOT_FOUND

export class BarcodeLookupService {
  private providers: BarcodeProvider[];
  private memoryCache = new Map<string, CacheEntry>();
  private persistentCache: PersistentBarcodeCache;
  private inFlightRequests = new Map<string, Promise<BarcodeLookupResult>>();

  constructor(providers?: BarcodeProvider[], persistentCache?: PersistentBarcodeCache) {
    this.providers = providers || [
      new OpenFoodFactsProvider(),
      new OpenProductsFactsProvider(),
      new UPCItemDBProvider(),
    ];
    this.persistentCache = persistentCache || defaultPersistentCache;
  }

  /**
   * Clears lookup cache (both memory and persistent)
   */
  clearCache(): void {
    this.memoryCache.clear();
    this.persistentCache.clear();
  }

  /**
   * Performs end-to-end lookup:
   * 1. Normalizes and validates barcode format and checksum.
   * 2. Checks in-memory and persistent local storage cache.
   * 3. Deduplicates in-flight requests.
   * 4. Queries tiered providers (Open Food Facts -> Open Products Facts -> UPCItemDB).
   * 5. Enriches result with GS1 origin country/organization metadata.
   */
  async lookupBarcode(
    rawCode: string,
    options?: { signal?: AbortSignal; forceRefresh?: boolean }
  ): Promise<BarcodeLookupResult> {
    if (options?.signal?.aborted) {
      return { status: 'NETWORK_ERROR', message: 'Request aborted' };
    }

    const normalized = normalizeBarcode(rawCode);

    if (!normalized.isValid) {
      return {
        status: 'INVALID_BARCODE',
        message: normalized.error || 'Invalid barcode format',
      };
    }

    const cacheKey = normalized.normalized;
    const gs1 = resolveGS1Prefix(cacheKey);

    // 1. Check in-memory cache if not forcing refresh
    if (!options?.forceRefresh) {
      const memCached = this.memoryCache.get(cacheKey);
      if (memCached) {
        const ttl = memCached.result.status === 'FOUND' ? POSITIVE_CACHE_TTL_MS : NOT_FOUND_CACHE_TTL_MS;
        if (Date.now() - memCached.timestamp < ttl) {
          return {
            ...memCached.result,
            fromCache: true,
            gs1Prefix: gs1 || undefined,
          };
        } else {
          this.memoryCache.delete(cacheKey);
        }
      }

      // 2. Check persistent localStorage cache
      const persistent = this.persistentCache.get(cacheKey);
      if (persistent && persistent.status === 'FOUND') {
        // Hydrate in-memory cache
        this.memoryCache.set(cacheKey, {
          result: persistent,
          timestamp: Date.now(),
        });

        return {
          ...persistent,
          fromCache: true,
          gs1Prefix: gs1 || undefined,
        };
      }
    }

    // 3. Deduplicate simultaneous in-flight queries for the same barcode
    const inFlight = this.inFlightRequests.get(cacheKey);
    if (inFlight) {
      return inFlight;
    }

    const queryPromise = this.executeLookup(normalized, options?.signal)
      .finally(() => {
        this.inFlightRequests.delete(cacheKey);
      });

    this.inFlightRequests.set(cacheKey, queryPromise);
    const rawResult = await queryPromise;

    // Attach GS1 metadata to result
    const result: BarcodeLookupResult = {
      ...rawResult,
      gs1Prefix: gs1 || undefined,
      product: rawResult.product
        ? {
            ...rawResult.product,
            originCountry: gs1?.country,
            originFlag: gs1?.flag,
          }
        : undefined,
    };

    // Cache ONLY if FOUND or confirmed NOT_FOUND (never cache transient errors)
    if (result.status === 'FOUND' || result.status === 'NOT_FOUND') {
      this.memoryCache.set(cacheKey, {
        result,
        timestamp: Date.now(),
      });

      if (result.status === 'FOUND') {
        this.persistentCache.set(cacheKey, result);
      }
    }

    return result;
  }

  private async executeLookup(
    barcode: NormalizedBarcode,
    signal?: AbortSignal
  ): Promise<BarcodeLookupResult> {
    let lastError: BarcodeLookupResult = { status: 'NOT_FOUND' };

    for (const provider of this.providers) {
      if (signal?.aborted) {
        return { status: 'NETWORK_ERROR', message: 'Request aborted' };
      }

      try {
        const res = await provider.lookup(barcode, signal);

        if (res.status === 'FOUND') {
          return res;
        }

        // If NOT_FOUND, fall through to next provider
        if (res.status === 'NOT_FOUND') {
          lastError = res;
          continue;
        }

        // For rate limit, server error, or network error, remember and try next provider
        lastError = res;
      } catch (err: unknown) {
        lastError = {
          status: 'NETWORK_ERROR',
          message: err instanceof Error ? err.message : 'Unknown lookup error',
        };
      }
    }

    return lastError;
  }
}

// Global singleton instance for application use
export const defaultBarcodeService = new BarcodeLookupService();
