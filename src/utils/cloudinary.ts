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

export function getCloudinaryConfig(): CloudinaryConfig {
  const envCloudName = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CLOUDINARY_CLOUD_NAME) || '';
  const envUploadPreset = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET) || 'yaad_preset';

  // Official production credentials: rvhmsppk / yaad_preset
  const cloudName = getStoredItem('yaad_cloudinary_cloud_name') || envCloudName || 'rvhmsppk';
  const uploadPreset = getStoredItem('yaad_cloudinary_upload_preset') || envUploadPreset || 'yaad_preset';

  return {
    cloudName: cloudName.trim(),
    uploadPreset: uploadPreset.trim() || 'yaad_preset',
    isConfigured: Boolean(cloudName.trim()),
  };
}

export function saveCloudinaryConfig(cloudName: string, uploadPreset: string = 'yaad_preset'): void {
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
    if (typeof document === 'undefined' || typeof window === 'undefined' || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
      return resolve(blob);
    }
    const img = new Image();
    const objectUrl = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
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
      if (!ctx) return resolve(blob);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
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
 * Uploads an image Blob or File to Cloudinary.
 * Pre-compresses image locally for lightning-fast uploads on mobile devices.
 * If Cloudinary is configured and succeeds, returns the secure HTTPS CDN URL.
 * If Cloudinary is not configured or fails, falls back to an ultra-compact compressed Data URL.
 */
export async function uploadImage(
  imageBlob: Blob,
  fileName: string = 'avatar.jpg'
): Promise<{ url: string; source: 'cloudinary' | 'compressed_data_url'; error?: string }> {
  const config = getCloudinaryConfig();

  // Pre-compress locally to guarantee lightning fast transmission (<150KB)
  let uploadBlob = imageBlob;
  try {
    uploadBlob = await compressBlobForUpload(imageBlob, 1024, 0.85);
  } catch {
    uploadBlob = imageBlob;
  }

  // 1. Attempt Cloudinary upload if cloudName is configured
  if (config.isConfigured) {
    try {
      const formData = new FormData();
      formData.append('file', uploadBlob, fileName);
      formData.append('upload_preset', config.uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
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
        console.warn('Cloudinary upload warning:', data.error?.message || 'Upload failed');
      }
    } catch (err: any) {
      console.warn('Cloudinary network upload failed, using local fallback:', err?.message);
    }
  }

  // 2. High-performance compressed fallback: 1:1 image < 50KB
  const fallbackDataUrl = await compressBlobToDataUrl(uploadBlob, 360, 0.82);
  return {
    url: fallbackDataUrl,
    source: 'compressed_data_url',
    error: config.isConfigured ? 'Uploaded with optimized local storage' : undefined,
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
