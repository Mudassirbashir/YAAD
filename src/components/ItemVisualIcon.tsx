import React from 'react';
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
}

/**
 * Unified canonical visual representation for any grocery item in YAAD.
 * Directly maps canonical item identity (Potato, Sugar, Chicken, Onion, etc.)
 * to high-definition, system-quality, offline-first vector visuals.
 * Reused identically across Search Results, Added Item Cards, Shopping Session,
 * History, and Stats.
 */
export const ItemVisualIcon: React.FC<ItemVisualIconProps> = ({
  name = '',
  canonicalName,
  displayName,
  categoryId = 'other',
  size = 36,
  className = 'w-9 h-9 rounded-xl shrink-0',
}) => {
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
