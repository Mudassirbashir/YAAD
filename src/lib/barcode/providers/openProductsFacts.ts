import { IBarcodeProductProvider, BarcodeLookupResult, NormalizedProduct } from '../types';
import { normalizeBarcode, detectBarcodeFormat } from '../normalizer';
import { mapToYaadCategory } from '../categoryMapper';
import { sanitizeImageUrl } from './openFoodFacts';

const USER_AGENT = 'YAAD-GroceryApp/1.0 (https://yaadapppk.vercel.app; support@yaad.app)';
const REQUEST_TIMEOUT_MS = 6000;

export class OpenProductsFactsProvider implements IBarcodeProductProvider {
  public readonly providerName = 'Open Products Facts';

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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    if (externalSignal) {
      externalSignal.addEventListener('abort', () => controller.abort(), { once: true });
    }

    const fields = [
      'code',
      'product_name',
      'product_name_en',
      'brands',
      'image_url',
      'image_front_url',
      'quantity',
      'categories',
      'categories_tags',
    ].join(',');

    const url = `https://world.openproductsfacts.org/api/v2/product/${encodeURIComponent(
      cleanBarcode
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
          barcode: cleanBarcode,
          errorCode: 'RATE_LIMITED',
          errorMessage: 'Product lookup is temporarily busy.',
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          barcode: cleanBarcode,
          errorCode: 'NOT_FOUND',
          errorMessage: 'No matching product record in Open Products Facts.',
        };
      }

      if (response.status >= 500) {
        return {
          success: false,
          barcode: cleanBarcode,
          errorCode: 'SERVER_ERROR',
          errorMessage: 'External product database error.',
        };
      }

      let data: any;
      try {
        data = await response.json();
      } catch {
        return {
          success: false,
          barcode: cleanBarcode,
          errorCode: 'MALFORMED_RESPONSE',
          errorMessage: 'Malformed JSON received from Open Products Facts.',
        };
      }

      if (!data || data.status === 0 || !data.product) {
        return {
          success: false,
          barcode: cleanBarcode,
          errorCode: 'NOT_FOUND',
          errorMessage: 'No matching product record in Open Products Facts.',
        };
      }

      const p = data.product;
      const rawName = p.product_name || p.product_name_en;
      if (!rawName || typeof rawName !== 'string' || !rawName.trim()) {
        return {
          success: false,
          barcode: cleanBarcode,
          errorCode: 'NOT_FOUND',
          errorMessage: 'Product record contains no name.',
        };
      }

      const productName = rawName.trim();
      const brand = typeof p.brands === 'string' && p.brands.trim() ? p.brands.trim() : undefined;
      const rawImage = p.image_front_url || p.image_url;
      const imageUrl = sanitizeImageUrl(rawImage);
      const packageQuantity = p.quantity || undefined;
      const categoriesTags = Array.isArray(p.categories_tags) ? p.categories_tags : [];
      const categoriesString = typeof p.categories === 'string' ? p.categories : '';

      const categoryId = mapToYaadCategory(categoriesTags, categoriesString, productName);

      const normalized: NormalizedProduct = {
        barcode: cleanBarcode,
        barcodeFormat: detectBarcodeFormat(cleanBarcode),
        productName,
        brand,
        imageUrl,
        packageQuantity,
        categoryId,
        dataSource: 'Open Products Facts',
        dataSourceUrl: `https://world.openproductsfacts.org/product/${cleanBarcode}`,
        rawCategories: categoriesTags.length > 0 ? categoriesTags : categoriesString ? [categoriesString] : [],
        isIncomplete: !imageUrl || !packageQuantity || !brand,
      };

      return {
        success: true,
        product: normalized,
        barcode: cleanBarcode,
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (externalSignal?.aborted) {
        return {
          success: false,
          barcode: cleanBarcode,
          errorCode: 'ABORTED',
          errorMessage: 'Lookup cancelled',
        };
      }
      return {
        success: false,
        barcode: cleanBarcode,
        errorCode: 'NETWORK_ERROR',
        errorMessage: 'Connection failed reaching Open Products Facts.',
      };
    }
  }
}
