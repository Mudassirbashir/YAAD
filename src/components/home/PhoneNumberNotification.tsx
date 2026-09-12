import React, { useState, useEffect } from 'react';
import { Phone, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '../../types';
import { checkUserHasPhone } from '../../hooks/usePhoneNumberReminder';
import { AddPhoneNumberModal } from './AddPhoneNumberModal';

interface PhoneNumberNotificationProps {
  user: User | null;
  profile: UserProfile | null;
  onOpenPhoneSettings?: () => void;
}

const COOLDOWN_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours cooldown after "Not now"

export const PhoneNumberNotification: React.FC<PhoneNumberNotificationProps> = ({
  user,
  profile,
}) => {
  const { language, isRTL } = useLanguage();
  const [isDismissed, setIsDismissed] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Storage key per user so dismissal is remembered per-account without cross-account contamination
  const storageKey = user?.id ? `yaad_home_phone_notice_cooldown_${user.id}` : null;
  const hasPhone = checkUserHasPhone(profile, user);

  useEffect(() => {
    if (!user || hasPhone) {
      setIsDismissed(true);
      return;
    }

    if (storageKey) {
      try {
        const storedExpiration = localStorage.getItem(storageKey);
        if (storedExpiration) {
          const expTime = parseInt(storedExpiration, 10);
          if (!isNaN(expTime) && Date.now() < expTime) {
            setIsDismissed(true);
            return;
          }
        }
        setIsDismissed(false);
      } catch {
        setIsDismissed(false);
      }
    } else {
      setIsDismissed(false);
    }
  }, [user, hasPhone, storageKey]);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (storageKey) {
      try {
        const nextTime = Date.now() + COOLDOWN_DURATION_MS;
        localStorage.setItem(storageKey, nextTime.toString());
      } catch {}
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsDismissed(true);
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch {}
    }
  };

  if (hasPhone || isDismissed) {
    return (
      <AddPhoneNumberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    );
  }

  return (
    <>
      <section
        id="home_phone_number_notification"
        role="region"
        aria-label="Account completion reminder"
        dir={isRTL ? 'rtl' : 'ltr'}
        className="p-3.5 sm:p-4 rounded-2xl bg-surface-container-lowest border border-surface-dim/70 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200 select-none"
      >
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 border border-primary/15 shadow-2xs">
            <Phone className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm font-bold text-on-surface">
              {language === 'ur' ? 'اپنا فون نمبر شامل کریں' : 'Add Your Phone Number'}
            </span>
            <span className="font-['Manrope'] text-[11px] sm:text-xs text-outline leading-snug mt-0.5">
              {language === 'ur'
                ? 'اپنے اکاؤنٹ کو محفوظ رکھنے اور آسانی سے بازیافت کرنے کے لیے نمبر شامل کریں۔'
                : 'Add your number to make your account easier to manage and recover.'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-center shrink-0">
          <button
            type="button"
            id="home_phone_notice_dismiss_btn"
            onClick={handleDismiss}
            className="text-xs font-semibold text-outline hover:text-on-surface hover:bg-surface-container px-2.5 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            {language === 'ur' ? 'ابھی نہیں' : 'Not now'}
          </button>

          <button
            type="button"
            id="home_phone_notice_add_btn"
            onClick={handleOpenModal}
            className="h-8 px-3.5 rounded-full bg-primary hover:bg-primary-container active:scale-95 text-on-primary text-xs font-bold font-['Manrope'] transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
          >
            <span>{language === 'ur' ? 'نمبر شامل کریں' : 'Add Number'}</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss notification"
            className="w-7 h-7 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container active:scale-95 transition-colors cursor-pointer ms-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Modal */}
      <AddPhoneNumberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
};
