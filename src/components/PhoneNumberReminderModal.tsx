import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Phone, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { AddPhoneNumberModal } from './home/AddPhoneNumberModal';

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
  const { language, isRTL } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

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

  const handleOpenForm = () => {
    setIsFormModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormModalOpen(false);
    onDismiss();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && !isFormModalOpen && (
          <aside
            id="phone_reminder_notification"
            role="region"
            aria-label="Account completion reminder"
            aria-labelledby="phone_reminder_title"
            aria-describedby="phone_reminder_desc"
            dir={isRTL ? 'rtl' : 'ltr'}
            className="fixed bottom-24 sm:bottom-6 end-4 sm:end-6 z-40 max-w-sm w-[calc(100%-2rem)] sm:w-96 pointer-events-none select-none"
          >
            {/* Non-blocking Floating Notification Card */}
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
              className="pointer-events-auto relative w-full bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl border border-surface-dim/90 overflow-hidden"
            >
              {/* Top Close Button */}
              <button
                id="phone_reminder_close_btn"
                type="button"
                onClick={onDismiss}
                aria-label="Dismiss notification"
                className="absolute top-3.5 end-3.5 w-7 h-7 rounded-full text-outline hover:text-on-surface hover:bg-surface-container flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-start gap-3 pe-5">
                {/* Icon Badge */}
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 border border-primary/15 shadow-2xs">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                </div>

                {/* Heading & Description */}
                <div className="flex flex-col min-w-0">
                  <h3
                    id="phone_reminder_title"
                    className="font-['Plus_Jakarta_Sans'] font-bold text-xs sm:text-sm text-on-surface tracking-tight"
                  >
                    {language === 'ur' ? 'اپنا فون نمبر شامل کریں' : 'Complete Your Account'}
                  </h3>
                  <p
                    id="phone_reminder_desc"
                    className="font-['Manrope'] text-[11px] sm:text-xs text-outline leading-snug mt-0.5"
                  >
                    {language === 'ur'
                      ? 'اکاؤنٹ کو محفوظ اور آسان بازیافت بنانے کے لیے نمبر شامل کریں۔'
                      : 'Add your number to make your account easier to manage and recover.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-surface-dim/60">
                <button
                  id="phone_reminder_not_now_btn"
                  type="button"
                  onClick={onDismiss}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold font-['Manrope'] text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                >
                  {language === 'ur' ? 'ابھی نہیں' : 'Not now'}
                </button>

                <button
                  id="phone_reminder_add_btn"
                  type="button"
                  onClick={handleOpenForm}
                  className="h-8 px-3.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold font-['Manrope'] shadow-xs active:scale-[0.98] transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>{language === 'ur' ? 'نمبر شامل کریں' : 'Add Number'}</span>
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

      {/* Embedded Form Modal */}
      <AddPhoneNumberModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleFormSuccess}
      />
    </>
  );
};
