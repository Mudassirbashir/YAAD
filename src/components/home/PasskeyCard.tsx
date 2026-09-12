import React, { useState, useEffect } from 'react';
import { Fingerprint, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isPasskeySupported } from '../../lib/passkey';
import { useLanguage } from '../../context/LanguageContext';

interface PasskeyCardProps {
  onOpenSecuritySettings: () => void;
}

const PASSKEY_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days cooldown when dismissed

export const PasskeyCard: React.FC<PasskeyCardProps> = ({ onOpenSecuritySettings }) => {
  const { user, registerPasskey, listPasskeys } = useAuth();
  const { language } = useLanguage();

  const [hasActivePasskey, setHasActivePasskey] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [justRegistered, setJustRegistered] = useState<boolean>(false);

  const isSupported = isPasskeySupported();
  const storageKey = user?.id ? `yaad_passkey_home_cooldown_${user.id}` : null;

  // Query actual native Supabase/WebAuthn passkey status
  useEffect(() => {
    if (!user || !isSupported) return;

    if (storageKey) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const expTime = parseInt(stored, 10);
          if (!isNaN(expTime) && Date.now() < expTime) {
            setIsDismissed(true);
          }
        }
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

  // If user has no passkey and dismissed the prompt within the cooldown window, hide the card
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
        const nextTime = Date.now() + PASSKEY_COOLDOWN_MS;
        localStorage.setItem(storageKey, nextTime.toString());
      } catch {}
    }
  };

  // State 1: User has an active Passkey ("Passkey Active") - subtle, calm, non-intrusive status
  if (hasActivePasskey) {
    return (
      <section
        id="home_passkey_ready_card"
        aria-label="Passkey Status"
        className="p-3 sm:p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-dim/70 shadow-2xs flex items-center justify-between gap-3 animate-in fade-in duration-200 select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/15">
            <Fingerprint className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm font-bold text-on-surface">
                {language === 'ur' ? 'پاس کی فعال ہے' : 'Passkey Active'}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                <span>{language === 'ur' ? 'فعال' : 'Active'}</span>
              </span>
            </div>
            <span className="font-['Manrope'] text-[11px] sm:text-xs text-outline truncate mt-0.5">
              {justRegistered
                ? language === 'ur'
                  ? 'اس ڈیوائس پر پاس کی کامیابی سے فعال ہو گئی!'
                  : 'Passkey successfully enabled on this device!'
                : language === 'ur'
                ? 'اس ڈیوائس پر تیز اور بغیر پاسورڈ سائن ان فعال ہے۔'
                : 'Fast, password-free sign-in on this device.'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSecuritySettings}
          className="text-xs font-semibold text-primary hover:text-primary-container px-2.5 py-1.5 rounded-lg hover:bg-primary/5 transition-colors shrink-0 cursor-pointer"
        >
          {language === 'ur' ? 'ترتیبات' : 'Manage'}
        </button>
      </section>
    );
  }

  // State 2: User does not have a Passkey ("Set up Passkey") - calm security setup
  return (
    <section
      id="home_passkey_setup_card"
      aria-label="Set up Passkey"
      className="p-3 sm:p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-dim/70 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200 select-none"
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 border border-primary/15">
          <Fingerprint className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm font-bold text-on-surface">
            {language === 'ur' ? 'پاس کی سیٹ اپ کریں' : 'Set up Passkey'}
          </span>
          <span className="font-['Manrope'] text-[11px] sm:text-xs text-outline truncate mt-0.5">
            {language === 'ur'
              ? 'اس ڈیوائس پر تیز اور بغیر پاسورڈ سائن ان کے لیے۔'
              : 'Fast, password-free sign-in on this device.'}
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
            <Fingerprint className="w-3.5 h-3.5 stroke-[2.2]" />
          )}
          <span>{language === 'ur' ? 'سیٹ اپ' : 'Set Up'}</span>
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss passkey setup"
          className="w-7 h-7 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container active:scale-95 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};
