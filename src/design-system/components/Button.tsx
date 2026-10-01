import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { triggerHaptic } from '../../lib/sound';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  hapticStrength?: number;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      hapticStrength = 10,
      className = '',
      disabled,
      onClick,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading) return;
      if (hapticStrength > 0) {
        triggerHaptic(hapticStrength);
      }
      onClick?.(e);
    };

    // Base styling: accessibility, focus ring, tactile interaction
    const baseStyles =
      'inline-flex items-center justify-center font-["Plus_Jakarta_Sans"] font-semibold select-none cursor-pointer transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:active:scale-100';

    // Size variants ensuring touch target >= 44px on mobile
    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'min-h-[36px] sm:min-h-[38px] px-3.5 py-1.5 text-xs rounded-xl gap-1.5',
      md: 'min-h-[44px] px-4.5 py-2.5 text-sm rounded-xl gap-2',
      lg: 'min-h-[50px] sm:min-h-[52px] px-6 py-3 text-base rounded-2xl gap-2.5',
      icon: 'w-10 h-10 min-h-[40px] sm:w-11 sm:h-11 sm:min-h-[44px] p-2 rounded-xl flex items-center justify-center',
    };

    // Color & visual variants
    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-primary text-on-primary hover:bg-primary-container active:bg-primary shadow-[0_2px_8px_rgba(15,61,46,0.18)] hover:shadow-[0_4px_12px_rgba(15,61,46,0.24)] border border-transparent',
      secondary:
        'bg-surface-container hover:bg-surface-container-high text-primary border border-surface-dim/60 shadow-2xs',
      accent:
        'bg-secondary-fixed-dim hover:bg-secondary text-on-secondary-fixed font-bold shadow-xs border border-secondary/20',
      outline:
        'bg-transparent hover:bg-surface-container-low text-primary border border-primary/25 hover:border-primary/50',
      ghost:
        'bg-transparent hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface border border-transparent',
      danger:
        'bg-error text-on-error hover:bg-red-700 active:bg-error shadow-xs border border-transparent',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        onClick={handleClick}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            {size !== 'icon' && <span className="opacity-90">{children}</span>}
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
