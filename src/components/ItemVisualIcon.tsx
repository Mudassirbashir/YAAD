import React, { useState } from 'react';
import { CategoryId } from '../types';
import { EssentialItemVisual } from './EssentialItemVisual';

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
 * Displays real product image when available, with automatic fallback
 * to high-definition, offline-first vector visuals.
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
  const [imgError, setImgError] = useState(false);

  if (imageUrl && !imgError) {
    return (
      <div
        className={`${className} overflow-hidden bg-white border border-surface-container-high/60 flex items-center justify-center p-0.5 shadow-2xs`}
      >
        <img
          src={imageUrl}
          alt={displayName || name}
          onError={() => setImgError(true)}
          className="w-full h-full object-contain"
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
