import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline' | 'subtle';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md gap-1',
    md: 'text-xs px-2.5 py-1 rounded-lg gap-1.5',
  }[size];

  const variantStyles = {
    default: 'bg-surface-container text-on-surface-variant font-medium',
    subtle: 'text-outline font-medium',
    primary: 'bg-primary/10 text-primary font-semibold',
    success: 'bg-emerald-500/10 text-emerald-700 font-semibold',
    warning: 'bg-amber-500/15 text-amber-800 font-semibold',
    error: 'bg-error-container text-on-error-container font-semibold',
    outline: 'border border-surface-dim text-on-surface-variant font-medium bg-transparent',
  }[variant];

  return (
    <span
      className={`inline-flex items-center font-['Manrope'] select-none shrink-0 ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
