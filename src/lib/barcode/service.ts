import { BarcodeLookupResult, BarcodeProvider, NormalizedBarcode } from './types';
import { normalizeBarcode } from './normalizer';
import { OpenFoodFactsProvider } from './providers/openFoodFacts';
import { OpenProductsFactsProvider } from './providers/openProductsFacts';

interface CacheEntry {
  result: BarcodeLookupResult;
  timestamp: number;
}

const POSITIVE_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes for FOUND
const NOT_FOUND_CACHE_TTL_MS = 5 * 60 * 1000;  // 5 minutes for confirmed NOT_FOUND

export class BarcodeLookupService {
  private providers: BarcodeProvider[];
  private cache = new Map<string, CacheEntry>();
  private inFlightRequests = new Map<string, Promise<BarcodeLookupResult>>();

  constructor(providers?: BarcodeProvider[]) {
    this.providers = providers || [
      new OpenFoodFactsProvider(),
      new OpenProductsFactsProvider(),
    ];
  }

  /**
   * Clears lookup cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Performs end-to-end lookup:
   * 1. Normalizes and validates barcode format and checksum.
   * 2. Checks cache (ignoring transient failures).
   * 3. Deduplicates in-flight requests.
   * 4. Queries Open Food Facts, falling back to Open Products Facts.
   */
  async lookupBarcode(
    rawCode: string,
    options?: { signal?: AbortSignal; forceRefresh?: boolean }
  ): Promise<BarcodeLookupResult> {
    const normalized = normalizeBarcode(rawCode);

    if (!normalized.isValid) {
      return {
        status: 'INVALID_BARCODE',
        message: normalized.error || 'Invalid barcode format',
      };
    }

    const cacheKey = normalized.normalized;

    // Check cache if not forcing refresh
    if (!options?.forceRefresh) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        const ttl = cached.result.status === 'FOUND' ? POSITIVE_CACHE_TTL_MS : NOT_FOUND_CACHE_TTL_MS;
        if (Date.now() - cached.timestamp < ttl) {
          return {
            ...cached.result,
            fromCache: true,
          };
        } else {
          this.cache.delete(cacheKey);
        }
      }
    }

    // Deduplicate simultaneous in-flight queries for the same barcode
    const inFlight = this.inFlightRequests.get(cacheKey);
    if (inFlight) {
      return inFlight;
    }

    const queryPromise = this.executeLookup(normalized, options?.signal)
      .finally(() => {
        this.inFlightRequests.delete(cacheKey);
      });

    this.inFlightRequests.set(cacheKey, queryPromise);
    const result = await queryPromise;

    // Cache ONLY if FOUND or confirmed NOT_FOUND (never cache transient errors)
    if (result.status === 'FOUND' || result.status === 'NOT_FOUND') {
      this.cache.set(cacheKey, {
        result,
        timestamp: Date.now(),
      });
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

        // If NOT_FOUND, continue to next provider (e.g., Open Food Facts -> Open Products Facts)
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
