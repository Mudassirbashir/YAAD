import React, { useState, useEffect } from 'react';
import { CategoryId } from '../types';
import { EssentialItemVisual } from './EssentialItemVisual';
import { sanitizeImageUrl } from '../lib/barcode/providers/openFoodFacts';

export interface ItemVisualIconProps {
  name?: string;
  canonicalName?: string;
  displayName?: string;
  categoryId?: CategoryId | string;
  emoji?: string;
  size?: number;
  className?: string;
  iconClassName?: string;
  useImage?: boolean;
  imageUrl?: string;
}

/**
 * Unified canonical visual representation for any grocery item in YAAD.
 * When a verified product image is provided, renders the sanitized image.
 * Safely falls back to the high-definition offline-first vector visual if the
 * image fails to load or is not provided.
 */
export const ItemVisualIcon: React.FC<ItemVisualIconProps> = ({
  name = '',
  canonicalName,
  displayName,
  categoryId = 'other',
  size = 36,
  className = 'w-9 h-9 rounded-xl shrink-0',
  imageUrl,
}) => {
  const sanitizedUrl = sanitizeImageUrl(imageUrl);
  const [hasImgError, setHasImgError] = useState(false);

  useEffect(() => {
    setHasImgError(false);
  }, [sanitizedUrl]);

  if (sanitizedUrl && !hasImgError) {
    return (
      <div
        className={`relative overflow-hidden flex items-center justify-center bg-white dark:bg-stone-900 border border-surface-container-high/40 shadow-xs ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={sanitizedUrl}
          alt={displayName || name || 'Product'}
          onError={() => setHasImgError(true)}
          className="w-full h-full object-contain p-0.5"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <EssentialItemVisual
      canonicalName={canonicalName || name}
      displayName={displayName || name}
      name={name}
      categoryId={categoryId}
      size={size}
      className={className}
    />
  );
};

