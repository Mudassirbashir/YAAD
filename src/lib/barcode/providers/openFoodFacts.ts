import { BarcodeLookupResult, BarcodeProvider, NormalizedBarcode, ScannedProduct } from '../types';
import { mapProviderCategoryToYAAD } from '../categoryMapper';

const TIMEOUT_MS = 6000;
const USER_AGENT = 'YAAD-ShoppingList/1.0 (https://yaadapppk.vercel.app)';

/**
 * Sanitizes image URLs. Only allows valid https (or http) URLs.
 * Drops javascript:, data:, or malformed protocols.
 */
export function sanitizeImageUrl(url?: string | null): string | undefined {
  if (!url || typeof url !== 'string') return undefined;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
  } catch {
    // Malformed URL
  }
  return undefined;
}

export class OpenFoodFactsProvider implements BarcodeProvider {
  name = 'open_food_facts';

  async lookup(barcode: NormalizedBarcode, signal?: AbortSignal): Promise<BarcodeLookupResult> {
    if (!barcode.isValid || !barcode.normalized) {
      return { status: 'INVALID_BARCODE', message: barcode.error || 'Invalid barcode format' };
    }

    // Codes to query: primary normalized code, plus EAN-13 / UPC-A equivalents if present
    const codesToTry = [barcode.normalized];
    if (barcode.ean13Equivalent && barcode.ean13Equivalent !== barcode.normalized) {
      codesToTry.push(barcode.ean13Equivalent);
    }
    if (barcode.upcAEquivalent && barcode.upcAEquivalent !== barcode.normalized) {
      codesToTry.push(barcode.upcAEquivalent);
    }

    let lastErrorResult: BarcodeLookupResult = { status: 'NOT_FOUND' };

    for (const code of codesToTry) {
      const res = await this.queryBarcode(code, signal);
      if (res.status === 'FOUND') {
        return res;
      }
      if (res.status === 'RATE_LIMITED' || res.status === 'SERVER_ERROR' || res.status === 'NETWORK_ERROR') {
        lastErrorResult = res;
      }
    }

    return lastErrorResult;
  }

  private async queryBarcode(code: string, parentSignal?: AbortSignal, retryCount = 0): Promise<BarcodeLookupResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    // Link parent signal if provided
    if (parentSignal) {
      parentSignal.addEventListener('abort', () => controller.abort(), { once: true });
    }

    const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,product_name_en,generic_name,brands,quantity,image_url,image_front_url,image_small_url,categories_tags,categories`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': USER_AGENT,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 404) {
        return { status: 'NOT_FOUND', message: 'Product not found in Open Food Facts' };
      }

      if (response.status === 429) {
        return { status: 'RATE_LIMITED', message: 'Open Food Facts rate limit exceeded' };
      }

      if (response.status >= 500) {
        if (retryCount === 0) {
          // Bounded retry once for 5xx
          await new Promise((r) => setTimeout(r, 600));
          return this.queryBarcode(code, parentSignal, 1);
        }
        return { status: 'SERVER_ERROR', message: `Open Food Facts server error (${response.status})` };
      }

      if (!response.ok) {
        return { status: 'SERVER_ERROR', message: `Unexpected response status (${response.status})` };
      }

      const data = await response.json();

      if (!data || data.status !== 1 || !data.product) {
        return { status: 'NOT_FOUND', message: 'Product not found' };
      }

      const p = data.product;
      const rawName = p.product_name || p.product_name_en || p.generic_name || '';
      const name = typeof rawName === 'string' ? rawName.trim() : '';

      if (!name) {
        // Without a usable name, product cannot be confirmed
        return { status: 'NOT_FOUND', message: 'Product record contains no usable title' };
      }

      const brand = typeof p.brands === 'string' && p.brands.trim() ? p.brands.trim() : undefined;
      const packageSize = typeof p.quantity === 'string' && p.quantity.trim() ? p.quantity.trim() : undefined;

      const rawImg = p.image_url || p.image_front_url || p.image_small_url;
      const imageUrl = sanitizeImageUrl(rawImg);

      const categoryId = mapProviderCategoryToYAAD(p.categories_tags, p.categories);

      const product: ScannedProduct = {
        barcode: code,
        name,
        brand,
        packageSize,
        imageUrl,
        categoryId,
        source: 'open_food_facts',
        rawData: data,
      };

      return {
        status: 'FOUND',
        product,
        source: 'open_food_facts',
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (err instanceof Error && err.name === 'AbortError') {
        return { status: 'NETWORK_ERROR', message: 'Open Food Facts request timed out' };
      }

      return {
        status: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Network error connecting to Open Food Facts',
      };
    }
  }
}
