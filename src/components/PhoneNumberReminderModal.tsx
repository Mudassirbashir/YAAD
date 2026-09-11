import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Phone, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface PhoneNumberReminderModalProps {
  isOpen: boolean;
  onAddNumber: () => void;
  onDismiss: () => void;
}

export const PhoneNumberReminderModal: React.FC<PhoneNumberReminderModalProps> = ({
  isOpen,
  onAddNumber,
  onDismiss,
}) => {
  const { t, isRTL } = useLanguage();
  const prefersReducedMotion = useReducedMotion();

  // Handle Escape key to dismiss politely
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onDismiss]);

  return (
    <AnimatePresence>
      {isOpen && (
        <aside
          id="phone_reminder_notification"
          role="region"
          aria-label="Account completion suggestion"
          aria-labelledby="phone_reminder_title"
          aria-describedby="phone_reminder_desc"
          dir={isRTL ? 'rtl' : 'ltr'}
          className="fixed bottom-24 sm:bottom-6 end-4 sm:end-6 z-40 max-w-sm w-[calc(100%-2rem)] sm:w-96 pointer-events-none select-none"
        >
          {/* Premium Non-blocking Floating Notification Card */}
          <motion.div
            id="phone_reminder_card"
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.95, y: 20 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.95, y: 16 }
            }
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="pointer-events-auto relative w-full bg-surface-container-lowest/95 backdrop-blur-md rounded-3xl p-5 shadow-[0_16px_40px_rgba(0,0,0,0.14)] border border-surface-dim/90 overflow-hidden"
          >
            {/* Top Close Button */}
            <button
              id="phone_reminder_close_btn"
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss notification"
              className="absolute top-4 end-4 w-7 h-7 rounded-full text-outline hover:text-on-surface hover:bg-surface-container flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-start gap-3.5 pe-6">
              {/* Proper Soft Icon Badge */}
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <Phone className="w-5 h-5 stroke-[2.2]" />
              </div>

              {/* Clear Heading & Short Description */}
              <div className="flex flex-col min-w-0">
                <h3
                  id="phone_reminder_title"
                  className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-on-surface tracking-tight"
                >
                  Add Your Phone Number
                </h3>
                <p
                  id="phone_reminder_desc"
                  className="font-['Manrope'] text-xs text-on-surface-variant leading-relaxed mt-1"
                >
                  Complete your account by adding your phone number.
                </p>
              </div>
            </div>

            {/* Action Buttons: Primary CTA 'Add Phone Number', Secondary 'Not Now' */}
            <div className="flex items-center justify-end gap-2 mt-4 pt-1">
              <button
                id="phone_reminder_not_now_btn"
                type="button"
                onClick={onDismiss}
                className="h-9 px-3.5 rounded-xl text-xs font-semibold font-['Manrope'] text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                Not Now
              </button>

              <button
                id="phone_reminder_add_btn"
                type="button"
                onClick={onAddNumber}
                className="h-9 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-bold font-['Manrope'] shadow-xs active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Add Phone Number</span>
                {isRTL ? (
                  <ArrowLeft className="w-3.5 h-3.5 stroke-[2.2]" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
                )}
              </button>
            </div>
          </motion.div>
        </aside>
      )}
    </AnimatePresence>
  );
};
