import { IBarcodeProductProvider, BarcodeLookupResult, NormalizedProduct } from '../types';
import { normalizeBarcode, detectBarcodeFormat, expandUpcEToUpcA } from '../normalizer';
import { mapToYaadCategory } from '../categoryMapper';

const USER_AGENT = 'YAAD-GroceryApp/1.0 (https://yaadapppk.vercel.app; support@yaad.app)';
const REQUEST_TIMEOUT_MS = 6000;

/**
 * Validates and sanitizes a product image URL.
 * Upgrades insecure http:// URLs to https:// and discards invalid schemes/strings.
 */
export function sanitizeImageUrl(url?: unknown): string | undefined {
  if (typeof url !== 'string') return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      if (parsed.protocol === 'http:') {
        parsed.protocol = 'https:';
      }
      return parsed.toString();
    }
  } catch {}
  return undefined;
}

export class OpenFoodFactsProvider implements IBarcodeProductProvider {
  public readonly providerName = 'Open Food Facts';

  public async lookup(barcode: string, externalSignal?: AbortSignal): Promise<BarcodeLookupResult> {
    const cleanBarcode = normalizeBarcode(barcode);
    if (!cleanBarcode) {
      return {
        success: false,
        barcode: '',
        errorCode: 'INVALID_BARCODE',
        errorMessage: 'Invalid barcode provided',
      };
    }

    // Try primary lookup with exact clean barcode
    const primaryResult = await this.executeFetch(cleanBarcode, externalSignal);
    if (primaryResult.success && primaryResult.product) {
      return primaryResult;
    }

    // If not found and the barcode is a potential UPC-E, attempt lookup with expanded 12-digit UPC-A
    if (primaryResult.errorCode === 'NOT_FOUND' && cleanBarcode.length <= 8) {
      const expandedUpcA = expandUpcEToUpcA(cleanBarcode);
      if (expandedUpcA && expandedUpcA !== cleanBarcode) {
        const expandedResult = await this.executeFetch(expandedUpcA, externalSignal);
        if (expandedResult.success && expandedResult.product) {
          return {
            ...expandedResult,
            barcode: cleanBarcode, // retain user's scanned barcode
            product: {
              ...expandedResult.product,
              barcode: cleanBarcode,
              barcodeFormat: 'UPC-E',
            },
          };
        }
      }
    }

    // Fallback: 12-digit UPC-A mapped to 13-digit EAN-13 (prepend 0) or vice versa
    if (primaryResult.errorCode === 'NOT_FOUND') {
      let alternateCode: string | null = null;
      if (cleanBarcode.length === 12) {
        alternateCode = '0' + cleanBarcode;
      } else if (cleanBarcode.length === 13 && cleanBarcode.startsWith('0')) {
        alternateCode = cleanBarcode.slice(1);
      }

      if (alternateCode) {
        const altResult = await this.executeFetch(alternateCode, externalSignal);
        if (altResult.success && altResult.product) {
          return {
            ...altResult,
            barcode: cleanBarcode,
            product: {
              ...altResult.product,
              barcode: cleanBarcode,
            },
          };
        }
      }
    }

    return primaryResult;
  }

  private async executeFetch(
    targetCode: string,
    externalSignal?: AbortSignal
  ): Promise<BarcodeLookupResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    if (externalSignal) {
      externalSignal.addEventListener('abort', () => controller.abort(), { once: true });
    }

    const fields = [
      'code',
      'product_name',
      'product_name_en',
      'generic_name',
      'brands',
      'image_url',
      'image_front_url',
      'image_front_small_url',
      'quantity',
      'net_weight',
      'categories',
      'categories_tags',
      'ingredients_text',
      'nutrition_grades',
      'last_modified_t',
    ].join(',');

    const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(
      targetCode
    )}.json?fields=${fields}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        return {
          success: false,
          barcode: targetCode,
          errorCode: 'RATE_LIMITED',
          errorMessage: 'Product lookup is temporarily busy. Please wait a moment.',
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          barcode: targetCode,
          errorCode: 'NOT_FOUND',
          errorMessage: 'No matching product record found in Open Food Facts.',
        };
      }

      if (response.status >= 500) {
        return {
          success: false,
          barcode: targetCode,
          errorCode: 'SERVER_ERROR',
          errorMessage: 'Product database server error. Please try again.',
        };
      }

      let data: any;
      try {
        data = await response.json();
      } catch {
        return {
          success: false,
          barcode: targetCode,
          errorCode: 'MALFORMED_RESPONSE',
          errorMessage: 'Received malformed data from product database.',
        };
      }

      if (!data || data.status === 0 || !data.product) {
        return {
          success: false,
          barcode: targetCode,
          errorCode: 'NOT_FOUND',
          errorMessage: 'No matching product record found in Open Food Facts.',
        };
      }

      const p = data.product;
      const rawName = p.product_name || p.product_name_en || p.generic_name;

      if (!rawName || typeof rawName !== 'string' || !rawName.trim()) {
        return {
          success: false,
          barcode: targetCode,
          errorCode: 'NOT_FOUND',
          errorMessage: 'Product record exists but contains no title.',
        };
      }

      const productName = rawName.trim();
      const brand = typeof p.brands === 'string' && p.brands.trim() ? p.brands.trim() : undefined;
      const rawImage = p.image_front_url || p.image_url || p.image_front_small_url;
      const imageUrl = sanitizeImageUrl(rawImage);
      const packageQuantity = p.quantity || p.net_weight || undefined;
      const categoriesTags = Array.isArray(p.categories_tags) ? p.categories_tags : [];
      const categoriesString = typeof p.categories === 'string' ? p.categories : '';

      const categoryId = mapToYaadCategory(categoriesTags, categoriesString, productName);

      let lastUpdated: string | undefined;
      if (typeof p.last_modified_t === 'number') {
        try {
          lastUpdated = new Date(p.last_modified_t * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
        } catch {}
      }

      const normalized: NormalizedProduct = {
        barcode: targetCode,
        barcodeFormat: detectBarcodeFormat(targetCode),
        productName,
        brand,
        imageUrl,
        packageQuantity,
        packageWeight: p.net_weight || undefined,
        unit: undefined,
        categoryId,
        ingredients: typeof p.ingredients_text === 'string' ? p.ingredients_text.trim() : undefined,
        nutritionSummary: typeof p.nutrition_grades === 'string' ? `Grade ${p.nutrition_grades.toUpperCase()}` : undefined,
        dataSource: 'Open Food Facts',
        dataSourceUrl: `https://world.openfoodfacts.org/product/${targetCode}`,
        lastUpdated,
        rawCategories: categoriesTags.length > 0 ? categoriesTags : categoriesString ? [categoriesString] : [],
        isIncomplete: !imageUrl || !packageQuantity || !brand,
      };

      return {
        success: true,
        product: normalized,
        barcode: targetCode,
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (err instanceof DOMException && err.name === 'AbortError') {
        if (externalSignal?.aborted) {
          return {
            success: false,
            barcode: targetCode,
            errorCode: 'ABORTED',
            errorMessage: 'Lookup cancelled',
          };
        }
        return {
          success: false,
          barcode: targetCode,
          errorCode: 'NETWORK_ERROR',
          errorMessage: 'Product lookup timed out. Please check your connection.',
        };
      }

      return {
        success: false,
        barcode: targetCode,
        errorCode: 'NETWORK_ERROR',
        errorMessage: 'Network connection failed while reaching product database.',
      };
    }
  }
}
