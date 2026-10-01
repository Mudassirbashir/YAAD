import React from 'react';

export interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`flex items-start justify-between gap-3 mb-3 ${className}`}>
      <div className="flex flex-col min-w-0">
        <h2 className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-bold text-on-surface tracking-tight leading-snug">
          {title}
        </h2>
        {description && (
          <p className="font-['Manrope'] text-xs sm:text-sm text-outline mt-0.5 leading-normal">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
