import imageCompression from 'browser-image-compression';

/**
 * Shared pre-upload compression for catalog images (P2).
 *
 * Compresses in the browser BEFORE upload so Cloudinary stores far more images:
 * one 1600px WebP master (Q0.88, ≤0.35 MB) per item. Delivery variants
 * (thumb/card/full) are on-the-fly Cloudinary transforms with f_auto/q_auto —
 * never stored, never double-compressed.
 *
 * Contract:
 * - input: the raw dropped/selected File
 * - output: the File to actually upload (compressed WebP), or the ORIGINAL file
 *   on any error / for SVG (vector — never rasterize)
 * - NEVER throws.
 */
export async function compressCatalogImage(file: File): Promise<File> {
  try {
    if (!file || file.size === 0) return file;
    // SVG is vector — rasterizing would destroy it. Upload as-is.
    if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
      return file;
    }
    // Tiny files aren't worth a compression pass.
    if (file.size < 40 * 1024) return file;

    const compressed = await imageCompression(file, {
      maxSizeMB: 0.35,
      maxWidthOrHeight: 1600,
      fileType: 'image/webp',
      initialQuality: 0.88,
      useWebWorker: true,
    });

    // Safety: never return something bigger than the input.
    if (compressed.size >= file.size) return file;
    return compressed;
  } catch {
    return file;
  }
}
