/**
 * Cloudinary & Image Upload Utility for YAAD
 * Provides direct upload to Cloudinary (unsigned preset) with local compressed fallback.
 */

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  isConfigured: boolean;
}

// In-memory fallback for SSR / Node test environments
const memoryStorage: Record<string, string> = {};

function getStoredItem(key: string): string {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key) || '';
    }
  } catch {
    // Ignore localStorage access restriction
  }
  return memoryStorage[key] || '';
}

function setStoredItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (value) {
        window.localStorage.setItem(key, value);
      } else {
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    // Ignore localStorage access restriction
  }
  if (value) {
    memoryStorage[key] = value;
  } else {
    delete memoryStorage[key];
  }
}

export const OFFICIAL_CLOUDINARY_CLOUD_NAME = 'rvhmsppk';
export const OFFICIAL_CLOUDINARY_UPLOAD_PRESET = 'yaad_preset';

export function getCloudinaryConfig(): CloudinaryConfig {
  const envCloudName = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CLOUDINARY_CLOUD_NAME) || '';
  const envUploadPreset = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET) || OFFICIAL_CLOUDINARY_UPLOAD_PRESET;

  // Stored override or env or official production credentials: rvhmsppk / yaad_preset
  const storedCloudName = getStoredItem('yaad_cloudinary_cloud_name');
  const storedPreset = getStoredItem('yaad_cloudinary_upload_preset');

  // Allow explicit config or default to official verified production credentials
  const cloudName = storedCloudName !== '' ? (storedCloudName || OFFICIAL_CLOUDINARY_CLOUD_NAME) : (envCloudName || OFFICIAL_CLOUDINARY_CLOUD_NAME);
  const uploadPreset = storedPreset || envUploadPreset || OFFICIAL_CLOUDINARY_UPLOAD_PRESET;

  return {
    cloudName: cloudName.trim(),
    uploadPreset: uploadPreset.trim() || OFFICIAL_CLOUDINARY_UPLOAD_PRESET,
    isConfigured: Boolean(cloudName.trim()),
  };
}

export function saveCloudinaryConfig(cloudName: string, uploadPreset: string = OFFICIAL_CLOUDINARY_UPLOAD_PRESET): void {
  setStoredItem('yaad_cloudinary_cloud_name', cloudName.trim());
  setStoredItem('yaad_cloudinary_upload_preset', uploadPreset.trim());
}

/**
 * High-speed client-side image compressor.
 * Downscales multi-MB high-res phone captures to max 1024px before network transmission,
 * reducing payload from 15MB+ to ~90KB in milliseconds.
 */
export function compressBlobForUpload(
  blob: Blob,
  maxDimension: number = 1024,
  quality: number = 0.85
): Promise<Blob> {
  return new Promise((resolve) => {
    // If blob is already lightweight (< 800KB), bypass extra canvas pass to preserve fidelity
    if (blob.size && blob.size < 800 * 1024) {
      return resolve(blob);
    }

    if (typeof document === 'undefined' || typeof window === 'undefined' || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
      return resolve(blob);
    }
    const img = new Image();
    const objectUrl = URL.createObjectURL(blob);
    img.onload = () => {
      let { width, height } = img;
      if (width <= 0 || height <= 0) {
        URL.revokeObjectURL(objectUrl);
        return resolve(blob);
      }
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        return resolve(blob);
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      canvas.toBlob(
        (compressed) => {
          resolve(compressed || blob);
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(blob);
    };
    img.src = objectUrl;
  });
}

/**
 * Converts a Blob to a base64 Data URL string safely across environments.
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof FileReader !== 'undefined') {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    } else {
      blob.arrayBuffer().then((buf) => {
        const base64 = typeof Buffer !== 'undefined' ? Buffer.from(buf).toString('base64') : '';
        resolve(`data:${blob.type || 'image/jpeg'};base64,${base64}`);
      }).catch(reject);
    }
  });
}

/**
 * Uploads an image Blob or File to Cloudinary with multi-tier retry resilience.
 * 1. Tries primary configured cloudName with multipart FormData.
 * 2. If that fails, tries JSON Base64 payload.
 * 3. If primary config was custom and failed, retries with official production credentials (rvhmsppk).
 * 4. Ultra-compact local data URL fallback only if completely offline.
 */
export async function uploadImage(
  imageBlob: Blob,
  fileName: string = 'avatar.jpg'
): Promise<{ url: string; source: 'cloudinary' | 'compressed_data_url'; error?: string }> {
  const config = getCloudinaryConfig();

  // Pre-compress locally only if necessary
  let uploadBlob = imageBlob;
  try {
    uploadBlob = await compressBlobForUpload(imageBlob, 1024, 0.85);
  } catch {
    uploadBlob = imageBlob;
  }

  // Attempt targets: primary config first, then official fallback if different
  const targets = [
    { cloud: config.cloudName || OFFICIAL_CLOUDINARY_CLOUD_NAME, preset: config.uploadPreset || OFFICIAL_CLOUDINARY_UPLOAD_PRESET },
  ];
  if (config.cloudName !== OFFICIAL_CLOUDINARY_CLOUD_NAME) {
    targets.push({ cloud: OFFICIAL_CLOUDINARY_CLOUD_NAME, preset: OFFICIAL_CLOUDINARY_UPLOAD_PRESET });
  }

  let lastError: string | undefined;

  for (const target of targets) {
    if (!target.cloud) continue;

    // A. Direct Multipart FormData upload
    try {
      const formData = new FormData();
      formData.append('file', uploadBlob, fileName);
      formData.append('upload_preset', target.preset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${target.cloud}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      if (response.ok && data.secure_url) {
        return {
          url: data.secure_url,
          source: 'cloudinary',
        };
      } else {
        lastError = data.error?.message || response.statusText || `Cloudinary HTTP ${response.status}`;
        console.warn(`Cloudinary (${target.cloud}) FormData upload response:`, lastError);
      }
    } catch (err: any) {
      lastError = err?.message || 'Network error during upload';
      console.warn(`Cloudinary (${target.cloud}) FormData network attempt failed:`, lastError);
    }

    // B. Direct JSON Base64 upload fallback (avoids mobile multipart boundary quirks)
    try {
      const dataUrl = await blobToDataUrl(uploadBlob);
      const jsonRes = await fetch(
        `https://api.cloudinary.com/v1_1/${target.cloud}/image/upload`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: dataUrl,
            upload_preset: target.preset,
          }),
        }
      );

      const jsonData = await jsonRes.json();
      if (jsonRes.ok && jsonData.secure_url) {
        return {
          url: jsonData.secure_url,
          source: 'cloudinary',
        };
      } else {
        lastError = jsonData.error?.message || jsonRes.statusText || `Cloudinary HTTP ${jsonRes.status}`;
        console.warn(`Cloudinary (${target.cloud}) JSON upload response:`, lastError);
      }
    } catch (jsonErr: any) {
      lastError = jsonErr?.message || 'Network error during upload';
      console.warn(`Cloudinary (${target.cloud}) JSON attempt failed:`, lastError);
    }
  }

  // 3. Fallback: Compact Data URL (< 45KB) if network / offline prevents cloud upload
  const fallbackDataUrl = await compressBlobToDataUrl(uploadBlob, 360, 0.82);
  return {
    url: fallbackDataUrl,
    source: 'compressed_data_url',
    error: lastError || 'Cloud upload failed. Please check your internet connection or upload settings.',
  };
}

/**
 * Compresses a Blob to a square Data URL with specified dimension and quality.
 */
export function compressBlobToDataUrl(
  blob: Blob,
  maxDimension: number = 320,
  quality: number = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined' || typeof window === 'undefined' || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
      // In non-browser environment, convert blob buffer directly to data URI
      blob.arrayBuffer().then((buf) => {
        const base64 = typeof Buffer !== 'undefined' ? Buffer.from(buf).toString('base64') : '';
        resolve(`data:${blob.type || 'image/jpeg'};base64,${base64}`);
      }).catch(reject);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      canvas.width = maxDimension;
      canvas.height = maxDimension;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback to FileReader
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, maxDimension, maxDimension);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    };

    img.src = objectUrl;
  });
}
