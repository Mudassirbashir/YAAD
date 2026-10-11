import {
  BarcodeLookupResult,
  IBarcodeProductProvider,
  NormalizedProduct,
} from './types';
import { normalizeBarcode, isValidRetailBarcode } from './normalizer';
import { OpenFoodFactsProvider } from './providers/openFoodFacts';
import { OpenProductsFactsProvider } from './providers/openProductsFacts';

/**
 * BarcodeLookupService coordinates multiple product providers, maintains an
 * in-memory session cache to avoid redundant network queries, and enforces
 * scan debouncing.
 */
export class BarcodeLookupService {
  private providers: IBarcodeProductProvider[];
  private cache: Map<string, NormalizedProduct | null> = new Map();
  private lastScanTimestamp: number = 0;
  private lastScannedBarcode: string = '';
  private readonly cooldownMs: number = 1200;

  constructor(providers?: IBarcodeProductProvider[]) {
    this.providers = providers || [
      new OpenFoodFactsProvider(),
      new OpenProductsFactsProvider(),
    ];
  }

  /**
   * Checks if scanning this barcode should be ignored due to rapid duplicate debounce
   */
  public shouldIgnoreDuplicateScan(barcode: string): boolean {
    const clean = normalizeBarcode(barcode);
    const now = Date.now();
    if (
      clean === this.lastScannedBarcode &&
      now - this.lastScanTimestamp < this.cooldownMs
    ) {
      return true;
    }
    this.lastScannedBarcode = clean;
    this.lastScanTimestamp = now;
    return false;
  }

  /**
   * Look up a barcode across configured providers.
   */
  public async lookup(
    barcode: string,
    signal?: AbortSignal
  ): Promise<BarcodeLookupResult> {
    const check = isValidRetailBarcode(barcode);
    if (!check.valid) {
      return {
        success: false,
        barcode: normalizeBarcode(barcode),
        errorCode: 'INVALID_BARCODE',
        errorMessage: check.reason || 'Invalid barcode format',
      };
    }

    const clean = check.cleanBarcode;

    // Check memory cache first
    if (this.cache.has(clean)) {
      const cached = this.cache.get(clean);
      if (cached) {
        return {
          success: true,
          product: cached,
          barcode: clean,
          cached: true,
        };
      } else {
        return {
          success: false,
          barcode: clean,
          errorCode: 'NOT_FOUND',
          errorMessage: 'No matching product record in known databases.',
          cached: true,
        };
      }
    }

    // Try providers in sequential order (Open Food Facts -> Open Products Facts)
    let lastError: BarcodeLookupResult | null = null;

    for (const provider of this.providers) {
      if (signal?.aborted) {
        return {
          success: false,
          barcode: clean,
          errorCode: 'ABORTED',
          errorMessage: 'Lookup cancelled',
        };
      }

      const res = await provider.lookup(clean, signal);
      if (res.success && res.product) {
        this.cache.set(clean, res.product);
        return res;
      }

      // If user aborted, stop immediately
      if (res.errorCode === 'ABORTED') {
        return res;
      }

      lastError = res;
    }

    // If providers confirmed the item is genuinely not found, record null in cache to avoid spamming
    if (!lastError || lastError.errorCode === 'NOT_FOUND') {
      this.cache.set(clean, null);
    }

    return (
      lastError || {
        success: false,
        barcode: clean,
        errorCode: 'NOT_FOUND',
        errorMessage: 'Product not found in product databases.',
      }
    );
  }

  /**
   * Seed or override a product in the memory cache
   */
  public setCachedProduct(barcode: string, product: NormalizedProduct): void {
    const clean = normalizeBarcode(barcode);
    if (clean) {
      this.cache.set(clean, product);
    }
  }

  /**
   * Clear in-memory cache
   */
  public clearCache(): void {
    this.cache.clear();
  }
}

export const barcodeLookupService = new BarcodeLookupService();
