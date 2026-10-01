import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = 'max-h-[85vh]',
}) => {
  // Prevent body scroll when sheet is open
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Bottom Sheet Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={`relative w-full max-w-lg mx-auto bg-surface-container-lowest rounded-t-[28px] border-t border-x border-surface-dim/80 shadow-[0_-10px_30px_rgba(15,61,46,0.12)] p-4 sm:p-6 pb-safe z-10 flex flex-col ${maxHeight}`}
          >
            {/* Grab Bar Indicator */}
            <div className="w-12 h-1.5 rounded-full bg-surface-dim mx-auto mb-3 shrink-0" />

            {title && (
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-surface-dim/50 shrink-0">
                <h3 className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-bold text-on-surface">
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close sheet"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
