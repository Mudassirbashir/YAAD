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
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
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
  onClick,
  title,
}) => {
  const sanitizedUrl = sanitizeImageUrl(imageUrl);
  const [hasImgError, setHasImgError] = useState(false);

  useEffect(() => {
    setHasImgError(false);
  }, [sanitizedUrl]);

  if (sanitizedUrl && !hasImgError) {
    return (
      <div
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e as any); } } : undefined}
        title={title || (onClick ? `View photo of ${displayName || name}` : undefined)}
        className={`relative overflow-hidden flex items-center justify-center bg-white dark:bg-stone-900 border border-surface-container-high/40 shadow-xs ${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''} ${className}`}
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
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e as any); } } : undefined}
      className={onClick ? 'cursor-pointer active:scale-95 transition-transform' : undefined}
      title={title}
    >
      <EssentialItemVisual
        canonicalName={canonicalName || name}
        displayName={displayName || name}
        name={name}
        categoryId={categoryId}
        size={size}
        className={className}
      />
    </div>
  );
};

