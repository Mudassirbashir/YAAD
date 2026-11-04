import { getCatalogImageForItem, getLeafImage } from './supabaseCatalog';
import { buildCatalogImageUrl, extractCloudinaryVersion } from '../../utils/cloudinary';

export interface VisualItemLike {
  id?: string;
  name?: string;
  displayName?: string;
  display_name?: string;
  canonicalName?: string;
  canonical_name?: string;
  english_name?: string;
  imageUrl?: string;
  image_url?: string;
  cloudinaryPublicId?: string;
  cloudinary_public_id?: string;
  category?: string;
  categoryId?: string;
  category_id?: string;
  leaf_id?: string;
  leafId?: string;
}

export interface ResolvedVisual {
  type: 'photo' | 'catalog' | 'emoji';
  url?: string;
  largeUrl?: string;
  publicId?: string;
}

/**
 * Resolves the visual representation for an item across the application.
 *
 * Precedence:
 *   1. The user's own uploaded photo for that list item (shopping_items.image_url /
 *      ShoppingItem.imageUrl — Batch-2) ALWAYS wins.
 *   2. The catalog library image (A3 lookup by the item's catalog id, else by name match)
 *      is the default visual.
 *   3. Emoji / EssentialItemVisual is the last fallback (no image anywhere, or load error).
 */
export function resolveVisual(
  item?: VisualItemLike | null,
  variant: 'icon' | 'large' = 'icon'
): ResolvedVisual {
  if (!item) {
    return { type: 'emoji' };
  }

  // 1. Explicit user photo field if provided
  const explicitUserPhoto = (item as any).userPhotoUrl || (item as any).user_photo_url || (item as any).userPhoto;
  if (explicitUserPhoto && typeof explicitUserPhoto === 'string' && explicitUserPhoto.trim()) {
    return {
      type: 'photo',
      url: explicitUserPhoto.trim(),
      largeUrl: explicitUserPhoto.trim(),
    };
  }

  // Check if item has a direct public ID or catalog match
  const directPublicId = (item.cloudinaryPublicId || item.cloudinary_public_id)?.trim();
  const rawImageUrl = (item.imageUrl || item.image_url)?.trim();

  // If rawImageUrl is present:
  // Is it a user's uploaded photo on a list item, or is it a catalog item's raw URL?
  if (rawImageUrl) {
    if (directPublicId) {
      // If directPublicId is present, check if rawImageUrl is just the raw catalog image URL.
      // If rawImageUrl contains the catalog public ID or 'yaad-catalog', it's the catalog image, NOT a user photo.
      const isCatalogUrl = rawImageUrl.includes(directPublicId) || rawImageUrl.includes('yaad-catalog');
      if (!isCatalogUrl) {
        // The item has BOTH a distinct user photo and a catalog image: USER PHOTO ALWAYS WINS (Precedence 1)
        return {
          type: 'photo',
          url: rawImageUrl,
          largeUrl: rawImageUrl,
        };
      }
    } else {
      // No direct catalog public ID on this item — this is a list item with a user photo (Precedence 1)
      return {
        type: 'photo',
        url: rawImageUrl,
        largeUrl: rawImageUrl,
      };
    }
  }

  // 2. Catalog library image (Precedence 2)
  // 2a. Direct catalog public ID on item (e.g. MasterCatalogItem search results)
  if (directPublicId) {
    // Version extracted from the stored secure_url busts the browser cache after
    // an admin replace (stable public id => identical URL otherwise).
    const version = extractCloudinaryVersion(rawImageUrl);
    return {
      type: 'catalog',
      url: buildCatalogImageUrl(directPublicId, variant, version),
      largeUrl: buildCatalogImageUrl(directPublicId, 'large', version),
      publicId: directPublicId,
    };
  }

  // 3. Catalog lookup via A3 lookup (by id, then canonicalName/name)
  const lookupKey =
    item.id ||
    item.canonicalName ||
    item.canonical_name ||
    item.displayName ||
    item.display_name ||
    item.name ||
    item.english_name;
  if (lookupKey) {
    const catalogMatch = getCatalogImageForItem(lookupKey);
    if (catalogMatch) {
      if (catalogMatch.cloudinaryPublicId) {
        const version = extractCloudinaryVersion(catalogMatch.imageUrl);
        return {
          type: 'catalog',
          url: buildCatalogImageUrl(catalogMatch.cloudinaryPublicId, variant, version),
          largeUrl: buildCatalogImageUrl(catalogMatch.cloudinaryPublicId, 'large', version),
          publicId: catalogMatch.cloudinaryPublicId,
        };
      }
      if (catalogMatch.imageUrl) {
        return {
          type: 'catalog',
          url: catalogMatch.imageUrl,
          largeUrl: catalogMatch.imageUrl,
        };
      }
    }
  }

  // Secondary name fallback if id was used first but didn't match
  const altName =
    item.name ||
    item.displayName ||
    item.display_name ||
    item.canonicalName ||
    item.canonical_name;
  if (altName && altName !== lookupKey) {
    const catalogMatch = getCatalogImageForItem(altName);
    if (catalogMatch) {
      if (catalogMatch.cloudinaryPublicId) {
        const version = extractCloudinaryVersion(catalogMatch.imageUrl);
        return {
          type: 'catalog',
          url: buildCatalogImageUrl(catalogMatch.cloudinaryPublicId, variant, version),
          largeUrl: buildCatalogImageUrl(catalogMatch.cloudinaryPublicId, 'large', version),
          publicId: catalogMatch.cloudinaryPublicId,
        };
      }
      if (catalogMatch.imageUrl) {
        return {
          type: 'catalog',
          url: catalogMatch.imageUrl,
          largeUrl: catalogMatch.imageUrl,
        };
      }
    }
  }

  // 3b. P5: leaf representative image — one image per taxonomy leaf covers every
  // item in the leaf that has no per-item photo (the image-scaling trick).
  const leafId = (item as any).leaf_id || (item as any).leafId;
  if (leafId) {
    const leafImage = getLeafImage(leafId);
    if (leafImage) {
      if (leafImage.publicId) {
        const version = extractCloudinaryVersion(leafImage.imageUrl);
        return {
          type: 'catalog',
          url: buildCatalogImageUrl(leafImage.publicId, variant, version),
          largeUrl: buildCatalogImageUrl(leafImage.publicId, 'large', version),
          publicId: leafImage.publicId,
        };
      }
      if (leafImage.imageUrl) {
        return { type: 'catalog', url: leafImage.imageUrl, largeUrl: leafImage.imageUrl };
      }
    }
  }

  // 4. Emoji / EssentialItemVisual is the last fallback
  return { type: 'emoji' };
}
