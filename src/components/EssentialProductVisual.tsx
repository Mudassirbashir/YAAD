import React from 'react';
import { CategoryId } from '../types';
import { resolveVisual } from '../lib/catalog/visualResolver';
import { ItemVisualIcon } from './ItemVisualIcon';
import { useCatalogVersion } from '../lib/catalog/supabaseCatalog';

interface EssentialProductVisualProps {
  canonicalName: string;
  displayName?: string;
  categoryId?: string;
  size?: number;
  className?: string;
  imageUrl?: string;
}

export const EssentialProductVisual: React.FC<EssentialProductVisualProps> = ({
  canonicalName,
  displayName,
  categoryId = 'other',
  size = 48,
  className = '',
  imageUrl,
}) => {
  useCatalogVersion();
  const visual = resolveVisual({
    canonicalName,
    canonical_name: canonicalName,
    name: displayName,
    displayName,
    categoryId,
    category_id: categoryId,
    imageUrl,
  });

  return (
    <ItemVisualIcon
      canonicalName={canonicalName}
      displayName={displayName}
      name={displayName || canonicalName}
      categoryId={categoryId as CategoryId}
      imageUrl={visual.type !== 'emoji' ? visual.url : undefined}
      size={size}
      className={className}
    />
  );
};

