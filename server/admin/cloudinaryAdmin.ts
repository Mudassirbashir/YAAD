import crypto from 'node:crypto';

export interface CloudinaryAdminConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

export interface CloudinaryAssetDetails {
  format: string;
  width: number;
  height: number;
  bytes: number;
  url?: string;
}

/**
 * Retrieves server-side signed Cloudinary admin credentials from process.env.
 * Returns null if CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET is missing.
 */
export function getCloudinaryAdminConfig(): CloudinaryAdminConfig | null {
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() || 'rvhmsppk';

  if (!apiKey || !apiSecret) {
    return null;
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
  };
}

/**
 * Generates official Cloudinary SHA-1 signature for API requests.
 * Sorts parameters alphabetically, serializes as k=v&k=v, appends apiSecret, and hashes.
 */
export function signParams(params: Record<string, any>, apiSecret: string): string {
  const keys = Object.keys(params)
    .filter((k) => k !== 'file' && k !== 'cloud_name' && k !== 'resource_type' && k !== 'api_key')
    .sort();

  const toSign = keys.map((k) => `${k}=${params[k]}`).join('&') + apiSecret;
  return crypto.createHash('sha1').update(toSign).digest('hex');
}

/**
 * Uploads or replaces a catalog product image in Cloudinary using signed upload API.
 * Standardizes originals with incoming transformation c_limit,w_1200,h_1200.
 */
export async function cloudinaryUploadImage(
  fileDataUri: string,
  options: { publicId: string }
): Promise<CloudinaryUploadResult> {
  const config = getCloudinaryAdminConfig();
  if (!config) {
    throw new Error('Cloudinary admin credentials not configured');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign: Record<string, any> = {
    folder: 'yaad-catalog',
    invalidate: true,
    overwrite: true,
    public_id: options.publicId,
    timestamp,
    transformation: 'c_limit,w_1200,h_1200',
  };

  const signature = signParams(paramsToSign, config.apiSecret);

  const payload = {
    ...paramsToSign,
    api_key: config.apiKey,
    signature,
    file: fileDataUri,
  };

  const url = `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/image/upload`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error?.message || response.statusText || `Cloudinary upload failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return {
    secureUrl: data.secure_url,
    publicId: data.public_id,
    format: data.format,
    width: data.width,
    height: data.height,
    bytes: data.bytes,
  };
}

/**
 * Destroys an image asset in Cloudinary by public ID.
 * Returns success on result 'ok' or 'not found' (idempotent remove).
 */
export async function cloudinaryDestroy(publicId: string): Promise<{ success: boolean; result: string }> {
  const config = getCloudinaryAdminConfig();
  if (!config) {
    throw new Error('Cloudinary admin credentials not configured');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign: Record<string, any> = {
    invalidate: true,
    public_id: publicId,
    timestamp,
  };

  const signature = signParams(paramsToSign, config.apiSecret);

  const payload = {
    ...paramsToSign,
    api_key: config.apiKey,
    signature,
  };

  const url = `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/image/destroy`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error?.message || response.statusText || `Cloudinary destroy failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  if (data.result === 'ok' || data.result === 'not found') {
    return { success: true, result: data.result };
  }

  throw new Error(data.error?.message || data.result || 'Cloudinary destroy failed');
}

/**
 * Queries the Cloudinary Admin API for asset details to verify sync state.
 * Returns asset details or null on 404/missing.
 */
export async function cloudinaryResource(publicId: string): Promise<CloudinaryAssetDetails | null> {
  const config = getCloudinaryAdminConfig();
  if (!config) {
    throw new Error('Cloudinary admin credentials not configured');
  }

  const url = `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/resources/image/upload/${encodeURIComponent(publicId)}`;
  const authHeader = `Basic ${Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString('base64')}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: authHeader },
  });

  if (response.status === 404) {
    return null;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return null;
  }

  return {
    format: data.format,
    width: data.width,
    height: data.height,
    bytes: data.bytes,
    url: data.secure_url,
  };
}
