import React from 'react';
import { getListVisualConfig } from '../utils/listIcons';
import { ShoppingItem } from '../types';

interface ListIconProps {
  title?: string;
  explicitIcon?: string;
  items?: ShoppingItem[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ListIcon: React.FC<ListIconProps> = ({
  title,
  explicitIcon,
  items,
  className = '',
  size = 'md',
}) => {
  const config = getListVisualConfig(title, explicitIcon, items);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4 stroke-[2]',
    md: 'w-5 h-5 stroke-[2]',
    lg: 'w-6 h-6 stroke-[2.2]',
  };

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center shrink-0 border transition-all ${config.bgColor} ${config.textColor} ${config.borderColor} ${config.hoverBg} ${className}`}
      aria-hidden="true"
    >
      <Icon className={iconSizes[size]} />
    </div>
  );
};
