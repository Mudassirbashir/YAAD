import React, { useState } from 'react';
import { Phone, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabase';

interface AddPhoneNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CountryOption {
  code: string;
  name: string;
  flag: string;
  placeholder: string;
  example: string;
}

const COUNTRY_OPTIONS: CountryOption[] = [
  { code: '+92', name: 'Pakistan', flag: '🇵🇰', placeholder: '300 1234567', example: '0300 1234567' },
  { code: '+971', name: 'United Arab Emirates', flag: '🇦🇪', placeholder: '50 123 4567', example: '050 123 4567' },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦', placeholder: '50 123 4567', example: '050 123 4567' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧', placeholder: '7911 123456', example: '07911 123456' },
  { code: '+1', name: 'United States / Canada', flag: '🇺🇸', placeholder: '555 123 4567', example: '(555) 123-4567' },
  { code: '+974', name: 'Qatar', flag: '🇶🇦', placeholder: '3312 3456', example: '3312 3456' },
  { code: '+968', name: 'Oman', flag: '🇴🇲', placeholder: '9123 4567', example: '9123 4567' },
  { code: '+965', name: 'Kuwait', flag: '🇰🇼', placeholder: '9123 4567', example: '9123 4567' },
  { code: '+973', name: 'Bahrain', flag: '🇧🇭', placeholder: '3912 3456', example: '3912 3456' },
  { code: '+61', name: 'Australia', flag: '🇦🇺', placeholder: '412 345 678', example: '0412 345 678' },
];

export const AddPhoneNumberModal: React.FC<AddPhoneNumberModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, profile, updateUserProfile } = useAuth();
  const { language } = useLanguage();

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('+92');
  const [phoneNumberInput, setPhoneNumberInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentCountry = COUNTRY_OPTIONS.find((c) => c.code === selectedCountryCode) || COUNTRY_OPTIONS[0];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Allow digits and spaces
    val = val.replace(/[^\d\s]/g, '');

    // If user enters leading 0 with Pakistan or UK, strip leading 0 for E.164 consistency
    if (selectedCountryCode === '+92' || selectedCountryCode === '+44') {
      const cleanDigits = val.replace(/\s+/g, '');
      if (cleanDigits.startsWith('0')) {
        val = cleanDigits.substring(1);
      }
    }

    setPhoneNumberInput(val);
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isSuccess) return;

    const digitsOnly = phoneNumberInput.replace(/\s+/g, '');
    if (!digitsOnly) {
      setErrorMessage(
        language === 'ur' ? 'براہ کرم اپنا فون نمبر درج کریں' : 'Please enter your phone number'
      );
      return;
    }

    // Validate digit length based on country
    if (selectedCountryCode === '+92') {
      if (digitsOnly.length !== 10) {
        setErrorMessage(
          language === 'ur'
            ? 'درست پاکستانی نمبر درج کریں (مثال: 300 1234567)'
            : 'Please enter a valid 10-digit Pakistani number (e.g. 300 1234567)'
        );
        return;
      }
    } else {
      if (digitsOnly.length < 7 || digitsOnly.length > 14) {
        setErrorMessage(
          language === 'ur'
            ? 'درست فون نمبر درج کریں'
            : 'Please enter a valid phone number (7-14 digits)'
        );
        return;
      }
    }

    const fullPhoneNumber = `${selectedCountryCode}${digitsOnly}`;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (user?.id) {
        // 1. Update user profile
        const { error: profileErr } = await updateUserProfile({
          phone_number: fullPhoneNumber,
        });

        if (profileErr) {
          console.warn('Profile phone update note:', profileErr);
        }

        // 2. Also record in Supabase Auth user metadata for resilient recovery
        try {
          if (supabase?.auth) {
            await supabase.auth.updateUser({
              data: { phone_number: fullPhoneNumber, phone: fullPhoneNumber },
            });
          }
        } catch (authErr) {
          console.warn('Auth metadata update note:', authErr);
        }
      }

      setIsSuccess(true);
      onSuccess();

      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setPhoneNumberInput('');
      }, 1200);
    } catch (err: unknown) {
      console.error('Failed to save phone number:', err);
      setErrorMessage(
        language === 'ur'
          ? 'فون نمبر محفوظ نہیں ہو سکا۔ براہ کرم دوبارہ کوشش کریں۔'
          : 'Unable to save phone number. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="add_phone_number_modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add_phone_modal_title"
        className="relative w-full max-w-md bg-surface-container-lowest rounded-3xl p-5 sm:p-6 shadow-xl border border-surface-dim/70 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          /* Success State */
          <div className="py-8 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 border border-primary/20">
              <Check className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-on-surface">
              {language === 'ur' ? 'فون نمبر شامل کر دیا گیا' : 'Phone number added'}
            </h3>
            <p className="font-['Manrope'] text-xs sm:text-sm text-outline mt-1 max-w-xs">
              {language === 'ur'
                ? 'آپ کا اکاؤنٹ کامیابی سے مکمل ہو گیا ہے۔'
                : 'Your account is now easier to manage and recover.'}
            </p>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 mt-0.5">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <h3
                  id="add_phone_modal_title"
                  className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-bold text-on-surface"
                >
                  {language === 'ur' ? 'اپنا اکاؤنٹ مکمل کریں' : 'Complete your account'}
                </h3>
                <p className="font-['Manrope'] text-xs sm:text-sm text-outline mt-0.5 leading-relaxed">
                  {language === 'ur'
                    ? 'اپنے یاد اکاؤنٹ کو محفوظ رکھنے اور آسانی سے بازیافت کرنے کے لیے اپنا فون نمبر شامل کریں۔'
                    : 'Add your phone number to make your YAAD account easier to recover and manage.'}
                </p>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 bg-error-container/30 border border-error/20 rounded-xl text-xs font-['Manrope'] text-error flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Country & Phone Number Inputs */}
            <div className="flex flex-col gap-1.5 mt-1">
              <label className="text-xs font-semibold font-['Manrope'] text-on-surface">
                {language === 'ur' ? 'فون نمبر' : 'Phone Number'}
              </label>

              <div className="flex items-center gap-2">
                {/* Country Code Dropdown */}
                <div className="relative shrink-0">
                  <select
                    id="phone_country_select"
                    value={selectedCountryCode}
                    onChange={(e) => setSelectedCountryCode(e.target.value)}
                    className="h-11 px-3 pr-7 rounded-xl bg-surface-container border border-surface-dim text-xs font-bold text-on-surface appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Country Code"
                  >
                    {COUNTRY_OPTIONS.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code} ({c.name})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[10px]">
                    ▼
                  </div>
                </div>

                {/* Number Input */}
                <div className="relative flex-1">
                  <input
                    id="phone_number_input"
                    type="tel"
                    inputMode="tel"
                    autoFocus
                    placeholder={currentCountry.placeholder}
                    value={phoneNumberInput}
                    onChange={handleInputChange}
                    className="w-full h-11 px-3.5 rounded-xl bg-surface-container border border-surface-dim text-sm font-['Manrope'] text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-['Manrope'] text-outline px-1 mt-0.5">
                <span>
                  {language === 'ur'
                    ? `مثال: ${currentCountry.example}`
                    : `e.g. ${currentCountry.example}`}
                </span>
                {phoneNumberInput && (
                  <span className="font-semibold text-primary font-mono">
                    {selectedCountryCode} {phoneNumberInput}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 mt-2 pt-2 border-t border-surface-dim/60">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-full text-xs font-semibold text-outline hover:text-on-surface hover:bg-surface-container active:scale-95 transition-all cursor-pointer"
              >
                {language === 'ur' ? 'ابھی نہیں' : 'Not now'}
              </button>

              <button
                type="submit"
                id="save_phone_number_btn"
                disabled={isSubmitting || !phoneNumberInput.trim()}
                className="h-10 px-5 rounded-full bg-primary hover:bg-primary-container active:scale-95 text-on-primary text-xs font-bold font-['Manrope'] transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{language === 'ur' ? 'محفوظ ہو رہا ہے...' : 'Saving...'}</span>
                  </>
                ) : (
                  <span>{language === 'ur' ? 'محفوظ کریں' : 'Save Phone Number'}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
