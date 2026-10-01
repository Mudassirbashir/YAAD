import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`w-full py-12 px-6 flex flex-col items-center justify-center text-center rounded-3xl bg-surface-container-low/60 border border-dashed border-surface-dim/80 ${className}`}
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-surface-container-high/80 text-primary flex items-center justify-center mb-4 shadow-2xs">
        {icon}
      </div>

      <h3 className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-bold text-on-surface tracking-tight max-w-sm">
        {title}
      </h3>

      <p className="font-['Manrope'] text-xs sm:text-sm text-outline mt-1.5 max-w-xs sm:max-w-md leading-relaxed">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
          {actionLabel && onAction && (
            <Button
              variant="primary"
              size="md"
              leftIcon={actionIcon}
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="secondary"
              size="md"
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
