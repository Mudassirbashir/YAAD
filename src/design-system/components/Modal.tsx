import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
  showCloseButton = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[maxWidth];

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full ${maxWidthStyles} bg-surface-container-lowest rounded-3xl border border-surface-dim/80 shadow-[0_20px_50px_rgba(15,61,46,0.18)] p-5 sm:p-6 flex flex-col z-10 max-h-[90vh] overflow-hidden`}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-surface-dim/50">
                <div className="flex flex-col min-w-0">
                  {title && (
                    <h3 className="font-['Plus_Jakarta_Sans'] text-lg sm:text-xl font-bold text-on-surface tracking-tight leading-snug">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="font-['Manrope'] text-xs sm:text-sm text-outline mt-0.5">
                      {description}
                    </p>
                  )}
                </div>

                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close dialog"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer shrink-0 -me-1 -mt-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto pt-4 pb-2 -mx-1 px-1">{children}</div>

            {/* Optional Footer */}
            {footer && (
              <div className="pt-4 border-t border-surface-dim/50 flex items-center justify-end gap-2.5 mt-2">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
