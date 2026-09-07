import React, { useState } from 'react';
import { CategoryId } from '../types';
import { getItemEmoji } from '../lib/catalog/iconMap';
import { CategoryIcon } from './CategoryIcon';
import { getProductImageUrl } from '../lib/catalog/productImages';

interface ItemVisualIconProps {
  name?: string;
  categoryId?: CategoryId | string;
  emoji?: string;
  className?: string;
  iconClassName?: string;
  useImage?: boolean;
}

export const ItemVisualIcon: React.FC<ItemVisualIconProps> = ({
  name,
  categoryId,
  emoji,
  className = 'w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center shrink-0 text-base',
  iconClassName = 'w-4 h-4 text-primary',
  useImage = true,
}) => {
  const [imageError, setImageError] = useState(false);

  if (useImage && !imageError) {
    const imageUrl = getProductImageUrl(name, categoryId);
    if (imageUrl) {
      return (
        <div className={`${className} overflow-hidden relative shadow-2xs border border-surface-dim/60`}>
          <img
            src={imageUrl}
            alt={name || 'item'}
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover rounded-[inherit]"
          />
        </div>
      );
    }
  }

  const resolvedEmoji = getItemEmoji(name, categoryId, emoji);

  if (resolvedEmoji) {
    return (
      <span className={className} role="img" aria-label={name || 'item'}>
        {resolvedEmoji}
      </span>
    );
  }

  return (
    <span className={className}>
      <CategoryIcon categoryId={categoryId || 'other'} className={iconClassName} />
    </span>
  );
};
