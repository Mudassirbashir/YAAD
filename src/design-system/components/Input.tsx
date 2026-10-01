import React, { forwardRef, useState } from 'react';
import { X } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  showClearButton?: boolean;
  onClear?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightSlot,
      showClearButton = false,
      onClear,
      className = '',
      id,
      value,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const hasValue = value !== undefined && value !== null && String(value).length > 0;

    return (
      <div className="w-full flex flex-col gap-1.5 text-start">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs sm:text-sm font-['Plus_Jakarta_Sans'] font-semibold text-on-surface"
          >
            {label}
          </label>
        )}

        <div className="relative w-full flex items-center">
          {leftIcon && (
            <div className="absolute start-3.5 flex items-center justify-center text-outline pointer-events-none shrink-0 z-10">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            value={value}
            disabled={disabled}
            className={`w-full min-h-[44px] sm:min-h-[46px] rounded-xl sm:rounded-2xl bg-surface-container-lowest text-on-surface font-['Manrope'] text-sm sm:text-base border transition-all duration-150 placeholder:text-outline/70 focus-visible:outline-none disabled:opacity-50 disabled:bg-surface-container disabled:cursor-not-allowed ${
              leftIcon ? 'ps-10' : 'ps-3.5 sm:ps-4'
            } ${
              rightSlot || (showClearButton && hasValue) ? 'pe-11' : 'pe-3.5 sm:pe-4'
            } ${
              error
                ? 'border-error focus-visible:ring-2 focus-visible:ring-error/20 focus-visible:border-error'
                : 'border-surface-dim hover:border-outline-variant focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20'
            } ${className}`}
            {...props}
          />

          {showClearButton && hasValue && !disabled && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear input"
              className="absolute end-3 p-1 rounded-full text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {rightSlot && !showClearButton && (
            <div className="absolute end-3 flex items-center justify-center">
              {rightSlot}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs font-['Manrope'] text-error font-medium flex items-center gap-1 mt-0.5 animate-in fade-in duration-150">
            <span>{error}</span>
          </p>
        )}

        {!error && helperText && (
          <p className="text-xs font-['Manrope'] text-outline mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
