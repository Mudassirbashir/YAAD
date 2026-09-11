import React, { useState, useEffect } from 'react';
import { Phone, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '../../types';
import { checkUserHasPhone } from '../../hooks/usePhoneNumberReminder';

interface PhoneNumberNotificationProps {
  user: User | null;
  profile: UserProfile | null;
  onOpenPhoneSettings: () => void;
}

export const PhoneNumberNotification: React.FC<PhoneNumberNotificationProps> = ({
  user,
  profile,
  onOpenPhoneSettings,
}) => {
  const { language, isRTL } = useLanguage();
  const [isDismissed, setIsDismissed] = useState<boolean>(true);

  // Storage key per user so dismissal is remembered on this device
  const storageKey = user?.id ? `yaad_home_phone_notice_dismissed_${user.id}` : null;
  const hasPhone = checkUserHasPhone(profile, user);

  useEffect(() => {
    if (!user || hasPhone) {
      setIsDismissed(true);
      return;
    }

    if (storageKey) {
      try {
        const stored = localStorage.getItem(storageKey);
        setIsDismissed(stored === 'true');
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
        localStorage.setItem(storageKey, 'true');
      } catch {}
    }
  };

  if (hasPhone || isDismissed) {
    return null;
  }

  return (
    <section
      id="home_phone_number_notification"
      role="region"
      aria-label="Account completion reminder"
      className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-surface-dim/70 shadow-2xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-200 select-none"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Phone className="w-4 h-4 stroke-[2.2]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm font-bold text-on-surface truncate">
            {language === 'ur'
              ? 'اپنا فون نمبر شامل کریں'
              : language === 'roman-urdu'
              ? 'Apna phone number shamil karein'
              : 'Add your phone number'}
          </span>
          <span className="font-['Manrope'] text-[11px] sm:text-xs text-outline truncate">
            {language === 'ur'
              ? 'فہرستیں شیئر کرنے اور اکاؤنٹ کی بحالی کے لیے'
              : language === 'roman-urdu'
              ? 'List share karnay aur account recovery ke liye'
              : 'For easy list sharing and account recovery.'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          id="home_phone_notice_add_btn"
          onClick={onOpenPhoneSettings}
          className="h-8 px-3.5 rounded-full bg-primary hover:bg-primary-container active:scale-95 text-on-primary text-xs font-bold font-['Manrope'] transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
        >
          <span>{language === 'ur' ? 'شامل کریں' : 'Add Phone'}</span>
          {isRTL ? (
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2.2]" />
          ) : (
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
          )}
        </button>

        <button
          type="button"
          id="home_phone_notice_dismiss_btn"
          onClick={handleDismiss}
          aria-label="Dismiss phone reminder"
          className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container active:scale-95 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};
