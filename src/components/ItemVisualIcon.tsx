import React from 'react';
import { CategoryId } from '../types';
import { getItemEmoji } from '../lib/catalog/iconMap';
import { CategoryIcon } from './CategoryIcon';

interface ItemVisualIconProps {
  name?: string;
  categoryId?: CategoryId | string;
  emoji?: string;
  className?: string;
  iconClassName?: string;
}

export const ItemVisualIcon: React.FC<ItemVisualIconProps> = ({
  name,
  categoryId,
  emoji,
  className = 'w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center shrink-0 text-base',
  iconClassName = 'w-4 h-4 text-primary',
}) => {
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
