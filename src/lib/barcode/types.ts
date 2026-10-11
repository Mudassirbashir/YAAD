import { CategoryId } from '../../types';

export type BarcodeFormat =
  | 'EAN_13'
  | 'EAN_8'
  | 'UPC_A'
  | 'UPC_E'
  | 'CODE_128'
  | 'CODE_39'
  | 'ITF'
  | 'UNKNOWN';

export type BarcodeLookupStatus =
  | 'FOUND'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'INVALID_BARCODE'
  | 'UNSUPPORTED';

export interface NormalizedBarcode {
  raw: string;
  normalized: string;
  format: BarcodeFormat;
  isValid: boolean;
  error?: string;
  upcAEquivalent?: string;
  ean13Equivalent?: string;
}

export interface ScannedProduct {
  barcode: string;
  name: string;
  brand?: string;
  packageSize?: string;
  imageUrl?: string;
  categoryId: CategoryId;
  source: 'open_food_facts' | 'open_products_facts' | 'manual';
  rawData?: unknown;
}

export interface BarcodeLookupResult {
  status: BarcodeLookupStatus;
  product?: ScannedProduct;
  message?: string;
  source?: 'open_food_facts' | 'open_products_facts';
  fromCache?: boolean;
}

export interface BarcodeProvider {
  name: string;
  lookup(barcode: NormalizedBarcode, signal?: AbortSignal): Promise<BarcodeLookupResult>;
}
