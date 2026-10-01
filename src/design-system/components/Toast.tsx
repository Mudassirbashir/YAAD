import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { triggerHaptic } from '../../lib/sound';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  isOpen: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  isOpen,
  message,
  type = 'success',
  duration = 3500,
  onClose,
  actionLabel,
  onAction,
}) => {
  useEffect(() => {
    if (!isOpen || duration <= 0) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-error shrink-0" />,
    info: <Info className="w-4 h-4 text-primary shrink-0" />,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-6 inset-x-4 sm:inset-x-auto sm:end-6 z-50 flex justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-surface-container-lowest border border-surface-dim shadow-[0_8px_24px_rgba(15,61,46,0.15)] text-on-surface max-w-md"
          >
            {icons[type]}

            <span className="font-['Manrope'] text-xs sm:text-sm font-medium leading-snug">
              {message}
            </span>

            {actionLabel && onAction && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(12);
                  onAction();
                  onClose();
                }}
                className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-primary hover:underline px-1.5 py-0.5 rounded cursor-pointer"
              >
                {actionLabel}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Dismiss message"
              className="p-1 -me-1 rounded-full text-outline hover:text-on-surface transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
