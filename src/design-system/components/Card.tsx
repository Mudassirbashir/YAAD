import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'flat' | 'elevated' | 'interactive' | 'container';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: React.ElementType;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'flat',
  padding = 'md',
  className = '',
  as: Component = 'div',
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-3.5',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6 md:p-8',
  }[padding];

  const variantStyles = {
    flat: 'bg-surface-container-lowest border border-surface-dim/70 shadow-2xs rounded-2xl sm:rounded-3xl',
    container: 'bg-surface-container-low border border-surface-dim/50 rounded-2xl sm:rounded-3xl',
    elevated:
      'bg-surface-container-lowest border border-surface-dim/60 shadow-[0_4px_20px_rgba(15,61,46,0.06)] rounded-2xl sm:rounded-3xl',
    interactive:
      'bg-surface-container-lowest border border-surface-dim/70 shadow-2xs hover:shadow-[0_6px_20px_rgba(15,61,46,0.08)] hover:border-primary/30 active:scale-[0.99] transition-all duration-200 cursor-pointer rounded-2xl sm:rounded-3xl',
  }[variant];

  return (
    <Component
      className={`${variantStyles} ${paddingStyles} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};
