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
        <div
          id="phone_reminder_modal_container"
          role="dialog"
          aria-modal="true"
          aria-labelledby="phone_reminder_title"
          aria-describedby="phone_reminder_desc"
          dir={isRTL ? 'rtl' : 'ltr'}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none"
        >
          {/* Backdrop with soft blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onDismiss}
            className="fixed inset-0 bg-[#0A1A14]/60 backdrop-blur-[3px] cursor-pointer"
            aria-hidden="true"
          />

          {/* Premium Card Content */}
          <motion.div
            id="phone_reminder_modal"
            onClick={(e) => e.stopPropagation()}
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.95, y: 12 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.95, y: 12 }
            }
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.22)] border border-slate-200/90 pointer-events-auto overflow-hidden"
          >
            {/* Top Close Button */}
            <button
              id="phone_reminder_close_btn"
              type="button"
              onClick={onDismiss}
              aria-label={t('phoneReminder.notNow') || 'Not Now'}
              className="absolute top-4 end-4 w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Decorative Subtle Accent Badge */}
            <div className="flex items-center justify-center mb-4">
              <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-200/70 text-[#0F3D2E] flex items-center justify-center shadow-xs">
                <Phone className="w-6 h-6 stroke-[2.2]" />
              </div>
            </div>

            {/* Clear Title */}
            <div className="text-center mb-2">
              <h3
                id="phone_reminder_title"
                className="text-lg font-bold font-['Plus_Jakarta_Sans'] text-slate-900 tracking-tight"
              >
                {t('phoneReminder.title') || 'Add your phone number'}
              </h3>
            </div>

            {/* Short Explanation */}
            <p
              id="phone_reminder_desc"
              className="text-center text-xs sm:text-sm font-['Manrope'] text-slate-600 leading-relaxed mb-6 px-1"
            >
              {t('phoneReminder.description') ||
                'Add your phone number to complete your account.'}
            </p>

            {/* Action Buttons: Primary 'Add Number' visually stronger, Secondary 'Not Now' */}
            <div className="flex flex-col gap-2.5">
              <button
                id="phone_reminder_add_btn"
                type="button"
                onClick={onAddNumber}
                className="w-full h-11 px-4 rounded-xl bg-[#0F3D2E] hover:bg-[#134e3a] text-white text-sm font-bold font-['Manrope'] transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('phoneReminder.addNumber') || 'Add Number'}</span>
                {isRTL ? (
                  <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
                ) : (
                  <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                )}
              </button>

              <button
                id="phone_reminder_not_now_btn"
                type="button"
                onClick={onDismiss}
                className="w-full h-9 px-4 rounded-xl text-xs font-semibold font-['Manrope'] text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer text-center"
              >
                {t('phoneReminder.notNow') || 'Not Now'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
