import React from 'react';
import { EssentialItemVisual } from './EssentialItemVisual';
import { CategoryId } from '../types';

interface EssentialProductVisualProps {
  canonicalName: string;
  displayName?: string;
  categoryId?: string;
  size?: number;
  className?: string;
}

export const EssentialProductVisual: React.FC<EssentialProductVisualProps> = ({
  canonicalName,
  displayName,
  categoryId = 'other',
  size = 48,
  className = '',
}) => {
  return (
    <EssentialItemVisual
      canonicalName={canonicalName}
      displayName={displayName}
      categoryId={categoryId as CategoryId}
      size={size}
      className={className}
    />
  );
};

