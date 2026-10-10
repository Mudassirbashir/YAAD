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

  const cloudName = getStoredItem('yaad_cloudinary_cloud_name') || envCloudName || '';
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
 * Uploads an image Blob or File to Cloudinary.
 * If Cloudinary is configured and succeeds, returns the secure HTTPS CDN URL.
 * If Cloudinary is not configured or fails, falls back to an ultra-compact compressed Data URL.
 */
export async function uploadImage(
  imageBlob: Blob,
  fileName: string = 'avatar.jpg'
): Promise<{ url: string; source: 'cloudinary' | 'compressed_data_url'; error?: string }> {
  const config = getCloudinaryConfig();

  // 1. Attempt Cloudinary upload if cloudName is configured
  if (config.isConfigured) {
    try {
      const formData = new FormData();
      formData.append('file', imageBlob, fileName);
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
  const fallbackDataUrl = await compressBlobToDataUrl(imageBlob, 320, 0.82);
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
