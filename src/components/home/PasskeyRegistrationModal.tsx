import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Fingerprint,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  RefreshCw,
  Smartphone,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface PasskeyRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultDeviceName?: string;
}

type Step = 'intro' | 'authenticating' | 'success' | 'error';

export const PasskeyRegistrationModal: React.FC<PasskeyRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultDeviceName,
}) => {
  const { registerPasskey, refreshPasskeys } = useAuth();
  const { language } = useLanguage();

  const [step, setStep] = useState<Step>('intro');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('intro');
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartRegistration = async () => {
    setStep('authenticating');
    setErrorMessage(null);

    try {
      const res = await registerPasskey(defaultDeviceName);
      if (!res.success) {
        setErrorMessage(
          res.error?.message ||
            (language === 'ur'
              ? 'پاس کی سیٹ اپ مکمل نہیں ہو سکا۔'
              : 'Passkey setup could not be completed.')
        );
        setStep('error');
        return;
      }

      // Success
      setStep('success');
      await refreshPasskeys(true);
      if (onSuccess) onSuccess();

      // Auto close after brief pause
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          (language === 'ur'
            ? 'ڈیوائس کی تصدیق کے دوران خرابی پیش آئی۔'
            : 'An error occurred during device verification.')
      );
      setStep('error');
    }
  };

  return (
    <AnimatePresence>
      <div
        id="passkey_ceremony_modal_overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        role="dialog"
        aria-modal="true"
        aria-labelledby="passkey_modal_title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-sm rounded-3xl bg-surface p-6 shadow-2xl border border-outline-variant/60 overflow-hidden"
        >
          {/* Close button */}
          <button
            id="passkey_modal_close_btn"
            type="button"
            onClick={onClose}
            aria-label="Close passkey dialog"
            className="absolute top-4 end-4 w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* STEP 1: INTRO ("Set up your Passkey") */}
          {step === 'intro' && (
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 shadow-xs">
                <Fingerprint className="w-8 h-8 stroke-[2.2]" />
              </div>

              <h2
                id="passkey_modal_title"
                className="font-['Plus_Jakarta_Sans'] text-lg font-extrabold text-on-surface tracking-tight"
              >
                {language === 'ur' ? 'پاس کی سیٹ اپ کریں' : 'Set up your Passkey'}
              </h2>

              <p className="font-['Manrope'] text-xs text-outline leading-relaxed mt-2 max-w-[280px]">
                {language === 'ur'
                  ? 'ٹچ آئی ڈی، فیس آئی ڈی یا اپنے ڈیوائس کے اسکرین لاک کے ذریعے پاسورڈ کے بغیر تیز اور محفوظ ترین سائن ان۔'
                  : 'Fast, password-free sign-in using Touch ID, Face ID, Windows Hello, or your device screen lock.'}
              </p>

              {/* OS Security Guarantee Notice */}
              <div className="w-full mt-4 p-3 rounded-2xl bg-surface-container-low border border-outline-variant/50 text-start flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="font-['Manrope'] text-[11px] text-outline leading-snug">
                  <span className="font-bold text-on-surface block mb-0.5">
                    {language === 'ur' ? 'آپ کا ڈیوائس محفوظ رکھتا ہے' : 'Secured by your device'}
                  </span>
                  {language === 'ur'
                    ? 'آپ کا آپریٹنگ سسٹم بایومیٹرک سیکیورٹی کا انتظام خود کرتا ہے۔ یاد ایپ آپ کے فنگر پرنٹ یا چہرے کا ڈیٹا نہیں دیکھتی۔'
                    : 'Your operating system securely conducts the verification. YAAD never receives or stores your biometric data.'}
                </p>
              </div>

              <div className="w-full flex items-center gap-2 mt-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-11 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface font-['Manrope'] text-xs font-bold transition-all cursor-pointer"
                >
                  {language === 'ur' ? 'ابھی نہیں' : 'Not now'}
                </button>
                <button
                  id="passkey_start_ceremony_btn"
                  type="button"
                  onClick={handleStartRegistration}
                  className="flex-1 h-11 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-['Manrope'] text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <span>{language === 'ur' ? 'شروع کریں' : 'Continue'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: AUTHENTICATING (Biometric ceremony pulse animation) */}
          {step === 'authenticating' && (
            <div className="flex flex-col items-center text-center py-2">
              {/* Concentric Biometric Pulse Animation */}
              <div className="relative w-24 h-24 flex items-center justify-center mb-5">
                <motion.div
                  animate={{
                    scale: [1, 1.45, 1],
                    opacity: [0.6, 0.1, 0.6],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.2,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-0 rounded-full bg-primary/20"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.25, 1],
                    opacity: [0.7, 0.25, 0.7],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.2,
                    delay: 0.3,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-2 rounded-full bg-primary/30"
                />
                <div className="relative w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md">
                  <Fingerprint className="w-8 h-8 stroke-[2.2] animate-pulse" />
                </div>
              </div>

              <h2
                id="passkey_modal_title"
                className="font-['Plus_Jakarta_Sans'] text-base font-extrabold text-on-surface tracking-tight"
              >
                {language === 'ur' ? 'اپنے ڈیوائس پر تصدیق کریں' : 'Verify on Your Device'}
              </h2>

              <p className="font-['Manrope'] text-xs text-outline leading-relaxed mt-2 max-w-[270px]">
                {language === 'ur'
                  ? 'براؤزر یا ڈیوائس کے پرامپٹ پر عمل کریں اور فنگر پرنٹ، فیس یا اسکرین لاک سے تصدیق مکمل کریں۔'
                  : 'Follow the prompt from your browser or operating system to register your passkey.'}
              </p>

              <div className="mt-4 px-3 py-1.5 rounded-full bg-surface-container-high text-outline text-[11px] font-medium flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>
                  {language === 'ur'
                    ? 'آپ کا آپریٹنگ سسٹم تصدیق کر رہا ہے'
                    : 'Your operating system is verifying your identity'}
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="mt-5 text-xs text-outline hover:text-on-surface font-semibold underline underline-offset-4 cursor-pointer"
              >
                {language === 'ur' ? 'منسوخ کریں' : 'Cancel setup'}
              </button>
            </div>
          )}

          {/* STEP 3: SUCCESS ("Passkey Active") */}
          {step === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center text-center py-3"
            >
              <motion.div
                initial={{ scale: 0.5, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm"
              >
                <CheckCircle2 className="w-9 h-9 stroke-[2.4]" />
              </motion.div>

              <h2
                id="passkey_modal_title"
                className="font-['Plus_Jakarta_Sans'] text-lg font-extrabold text-on-surface tracking-tight"
              >
                {language === 'ur' ? 'پاس کی فعال ہے!' : 'Passkey Active!'}
              </h2>

              <p className="font-['Manrope'] text-xs text-outline leading-relaxed mt-2 max-w-[270px]">
                {language === 'ur'
                  ? 'آپ کی پاس کی کامیابی سے رجسٹر ہو گئی۔ اب آپ بغیر پاسورڈ کے فوراً سائن ان کر سکتے ہیں۔'
                  : 'Fast, password-free sign-in is now ready on this device.'}
              </p>

              <button
                id="passkey_modal_done_btn"
                type="button"
                onClick={onClose}
                className="w-full mt-5 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-['Manrope'] text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                {language === 'ur' ? 'بہترین' : 'Done'}
              </button>
            </motion.div>
          )}

          {/* STEP 4: ERROR */}
          {step === 'error' && (
            <div className="flex flex-col items-center text-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center mb-3">
                <AlertCircle className="w-7 h-7" />
              </div>

              <h2
                id="passkey_modal_title"
                className="font-['Plus_Jakarta_Sans'] text-base font-extrabold text-on-surface tracking-tight"
              >
                {language === 'ur' ? 'سیٹ اپ مکمل نہیں ہوا' : 'Setup Not Completed'}
              </h2>

              <p className="font-['Manrope'] text-xs text-outline leading-relaxed mt-2 max-w-[280px]">
                {errorMessage ||
                  (language === 'ur'
                    ? 'پاس کی پرامپٹ بند یا منسوخ کر دیا گیا تھا۔'
                    : 'The passkey prompt was cancelled or closed.')}
              </p>

              <div className="w-full flex items-center gap-2 mt-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-11 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface font-['Manrope'] text-xs font-bold transition-all cursor-pointer"
                >
                  {language === 'ur' ? 'بند کریں' : 'Close'}
                </button>
                <button
                  type="button"
                  onClick={handleStartRegistration}
                  className="flex-1 h-11 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-['Manrope'] text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{language === 'ur' ? 'دوبارہ کوشش' : 'Try Again'}</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
