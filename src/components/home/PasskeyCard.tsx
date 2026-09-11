import React, { useState, useEffect } from 'react';
import { Fingerprint, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isPasskeySupported } from '../../lib/passkey';
import { useLanguage } from '../../context/LanguageContext';

interface PasskeyCardProps {
  onOpenSecuritySettings: () => void;
}

export const PasskeyCard: React.FC<PasskeyCardProps> = ({ onOpenSecuritySettings }) => {
  const { user, registerPasskey, listPasskeys } = useAuth();
  const { language } = useLanguage();

  const [hasActivePasskey, setHasActivePasskey] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [justRegistered, setJustRegistered] = useState<boolean>(false);

  const isSupported = isPasskeySupported();
  const storageKey = user?.id ? `yaad_passkey_home_dismissed_${user.id}` : null;

  // Query passkey status on mount
  useEffect(() => {
    if (!user || !isSupported) return;

    if (storageKey) {
      try {
        const dismissed = localStorage.getItem(storageKey);
        setIsDismissed(dismissed === 'true');
      } catch {}
    }

    listPasskeys()
      .then((keys) => {
        if (keys && keys.length > 0) {
          setHasActivePasskey(true);
        } else {
          setHasActivePasskey(false);
        }
      })
      .catch(() => {});
  }, [user, isSupported, storageKey, listPasskeys]);

  if (!user || !isSupported) {
    return null;
  }

  // If user has no passkey and dismissed the prompt, hide the card
  if (!hasActivePasskey && isDismissed && !justRegistered) {
    return null;
  }

  const handleRegister = async () => {
    setIsRegistering(true);
    setSetupError(null);
    try {
      const { error } = await registerPasskey();
      if (!error) {
        setHasActivePasskey(true);
        setJustRegistered(true);
        if (storageKey) {
          localStorage.removeItem(storageKey);
        }
      } else {
        if (error.message.includes('cancelled') || error.message.includes('abort')) {
          setSetupError(language === 'ur' ? 'سیٹ اپ منسوخ کر دیا گیا' : 'Setup was cancelled');
        } else {
          setSetupError(error.message);
        }
      }
    } catch (e: unknown) {
      setSetupError(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, 'true');
      } catch {}
    }
  };

  // State 1: User has an active Passkey ("Passkey Ready")
  if (hasActivePasskey) {
    return (
      <section
        id="home_passkey_ready_card"
        aria-label="Passkey Status"
        className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-primary/20 shadow-2xs flex items-center justify-between gap-3 animate-in fade-in duration-200 select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Fingerprint className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm font-bold text-on-surface">
                {language === 'ur' ? 'پاس کی فعال ہے' : 'Passkey Ready'}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                <span>{language === 'ur' ? 'محفوظ' : 'Active'}</span>
              </span>
            </div>
            <span className="font-['Manrope'] text-[11px] sm:text-xs text-outline truncate mt-0.5">
              {justRegistered
                ? language === 'ur'
                  ? 'بائیو میٹرک لاگ ان کامیابی سے فعال ہو گیا'
                  : 'Biometric sign-in successfully enabled on this device!'
                : language === 'ur'
                ? 'اس ڈیوائس پر تیز اور محفوظ لاگ ان فعال ہے'
                : 'Fast, password-free sign-in active on this device.'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSecuritySettings}
          className="text-xs font-semibold text-primary hover:underline px-2.5 py-1 shrink-0 cursor-pointer"
        >
          {language === 'ur' ? 'ترتیبات' : 'Manage'}
        </button>
      </section>
    );
  }

  // State 2: User does not have a Passkey ("Set Up")
  return (
    <section
      id="home_passkey_setup_card"
      aria-label="Set up Passkey"
      className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-surface-dim/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200 select-none"
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
          <Fingerprint className="w-4 h-4" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm font-bold text-on-surface">
            {language === 'ur' ? 'تیز، پاس ورڈ فری لاگ ان' : 'Fast, password-free sign in'}
          </span>
          <span className="font-['Manrope'] text-[11px] sm:text-xs text-outline truncate mt-0.5">
            {language === 'ur'
              ? 'ٹچ آئی ڈی، فیس آئی ڈی یا ونڈوز ہیلو سیٹ اپ کریں'
              : 'Set up Touch ID, Face ID, or Windows Hello.'}
          </span>
          {setupError && (
            <span className="text-[11px] text-error font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{setupError}</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
        <button
          type="button"
          id="home_passkey_setup_btn"
          onClick={handleRegister}
          disabled={isRegistering}
          className="h-8 px-3.5 rounded-full bg-primary hover:bg-primary-container active:scale-95 text-on-primary text-xs font-bold font-['Manrope'] transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
        >
          {isRegistering ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Fingerprint className="w-3.5 h-3.5" />
          )}
          <span>{language === 'ur' ? 'سیٹ اپ' : 'Set Up'}</span>
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss passkey setup"
          className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container active:scale-95 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};
