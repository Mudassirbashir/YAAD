import { CategoryId } from '../../types';

export type BarcodeFormat =
  | 'EAN-13'
  | 'EAN-8'
  | 'UPC-A'
  | 'UPC-E'
  | 'CODE-128'
  | 'CODE-39'
  | 'ITF'
  | 'QR_CODE'
  | 'UNKNOWN';

export interface NormalizedProduct {
  barcode: string;
  barcodeFormat?: BarcodeFormat;
  productName: string;
  brand?: string;
  imageUrl?: string;
  packageQuantity?: string;
  packageWeight?: string;
  packageVolume?: string;
  unit?: string;
  categoryId: CategoryId;
  ingredients?: string;
  nutritionSummary?: string;
  dataSource: string;
  dataSourceUrl?: string;
  lastUpdated?: string;
  rawCategories?: string[];
  isIncomplete?: boolean;
}

export type BarcodeErrorCode =
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'INVALID_BARCODE'
  | 'MALFORMED_RESPONSE'
  | 'SERVER_ERROR'
  | 'ABORTED';

export interface BarcodeLookupResult {
  success: boolean;
  product?: NormalizedProduct;
  barcode: string;
  errorCode?: BarcodeErrorCode;
  errorMessage?: string;
  cached?: boolean;
}

export interface IBarcodeProductProvider {
  readonly providerName: string;
  lookup(barcode: string, signal?: AbortSignal): Promise<BarcodeLookupResult>;
}
