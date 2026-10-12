import { BarcodeLookupResult, BarcodeProvider, NormalizedBarcode, ScannedProduct } from '../types';
import { mapProviderCategoryToYAAD } from '../categoryMapper';
import { sanitizeImageUrl } from './openFoodFacts';

const TIMEOUT_MS = 6000;
const USER_AGENT = 'YAAD-ShoppingList/1.0 (https://yaadapppk.vercel.app)';

interface UPCItemDBResponse {
  code: string;
  total?: number;
  message?: string;
  items?: Array<{
    ean?: string;
    upc?: string;
    title?: string;
    description?: string;
    brand?: string;
    category?: string;
    size?: string;
    images?: string[];
  }>;
}

export class UPCItemDBProvider implements BarcodeProvider {
  name = 'upc_item_db';

  async lookup(barcode: NormalizedBarcode, signal?: AbortSignal): Promise<BarcodeLookupResult> {
    if (!barcode.isValid || !barcode.normalized) {
      return { status: 'INVALID_BARCODE', message: barcode.error || 'Invalid barcode format' };
    }

    // Codes to query: primary normalized code, plus UPC-A / EAN-13 equivalents
    const codesToTry = [barcode.normalized];
    if (barcode.upcAEquivalent && barcode.upcAEquivalent !== barcode.normalized) {
      codesToTry.push(barcode.upcAEquivalent);
    }
    if (barcode.ean13Equivalent && barcode.ean13Equivalent !== barcode.normalized) {
      codesToTry.push(barcode.ean13Equivalent);
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

  private async queryBarcode(code: string, parentSignal?: AbortSignal): Promise<BarcodeLookupResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    if (parentSignal) {
      if (parentSignal.aborted) {
        controller.abort();
      } else {
        parentSignal.addEventListener('abort', () => controller.abort(), { once: true });
      }
    }

    const url = `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(code)}`;

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
        return { status: 'NOT_FOUND', message: 'Product not found in UPCItemDB' };
      }

      if (response.status === 429) {
        return { status: 'RATE_LIMITED', message: 'UPCItemDB daily lookup limit reached' };
      }

      if (!response.ok) {
        return { status: 'SERVER_ERROR', message: `UPCItemDB responded with status ${response.status}` };
      }

      const data = (await response.json()) as UPCItemDBResponse;

      if (!data || data.code !== 'OK' || !data.items || data.items.length === 0) {
        return { status: 'NOT_FOUND', message: 'Product not found in UPCItemDB' };
      }

      const item = data.items[0];
      const rawTitle = item.title || item.description || '';
      const name = typeof rawTitle === 'string' ? rawTitle.trim() : '';

      if (!name) {
        return { status: 'NOT_FOUND', message: 'UPCItemDB record contains no usable title' };
      }

      const brand = typeof item.brand === 'string' && item.brand.trim() ? item.brand.trim() : undefined;
      const packageSize = typeof item.size === 'string' && item.size.trim() ? item.size.trim() : undefined;

      let imageUrl: string | undefined;
      if (Array.isArray(item.images) && item.images.length > 0) {
        imageUrl = sanitizeImageUrl(item.images[0]);
      }

      const categoryId = mapProviderCategoryToYAAD(
        item.category ? [item.category] : undefined,
        item.category
      );

      const product: ScannedProduct = {
        barcode: code,
        name,
        brand,
        packageSize,
        imageUrl,
        categoryId,
        source: 'upc_item_db',
        rawData: item,
      };

      return {
        status: 'FOUND',
        product,
        source: 'upc_item_db',
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (err instanceof Error && err.name === 'AbortError') {
        return { status: 'NETWORK_ERROR', message: 'UPCItemDB request timed out' };
      }

      return {
        status: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Network error connecting to UPCItemDB',
      };
    }
  }
}
