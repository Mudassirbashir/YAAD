import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Phone, X, Check, Loader2, AlertCircle, Search, ChevronDown, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabase';
import {
  COUNTRIES,
  CountryData,
  detectUserCountry,
  cleanLocalPhoneInput,
  formatLocalPhoneNumberDisplay,
  validatePhoneNumber,
} from '../../lib/countryData';

interface AddPhoneNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddPhoneNumberModal: React.FC<AddPhoneNumberModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, profile, updateUserProfile } = useAuth();
  const { language, isRTL } = useLanguage();

  // Selected country & auto-detection on first open
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(COUNTRIES[0]);
  const [hasInitializedCountry, setHasInitializedCountry] = useState(false);

  // Phone input & country picker state
  const [localNumber, setLocalNumber] = useState('');
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect user country on modal open if not already customized
  useEffect(() => {
    if (isOpen && !hasInitializedCountry) {
      const detected = detectUserCountry();
      setSelectedCountry(detected);
      setHasInitializedCountry(true);
    }
  }, [isOpen, hasInitializedCountry]);

  // Focus search input when country picker opens
  useEffect(() => {
    if (isCountryPickerOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isCountryPickerOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsCountryPickerOpen(false);
      setCountrySearchQuery('');
      setErrorMessage(null);
      setIsSuccess(false);
      setIsSubmitting(false);
    } else {
      setTimeout(() => {
        phoneInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Filtered countries for search
  const filteredCountries = useMemo(() => {
    const q = countrySearchQuery.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.nameUrdu.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.iso.toLowerCase().includes(q)
    );
  }, [countrySearchQuery]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cleanDigits = cleanLocalPhoneInput(raw, selectedCountry);
    setLocalNumber(cleanDigits);
    if (errorMessage) setErrorMessage(null);
  };

  const handleSelectCountry = (country: CountryData) => {
    setSelectedCountry(country);
    setIsCountryPickerOpen(false);
    setCountrySearchQuery('');
    // Re-clean existing input with new country rules
    if (localNumber) {
      setLocalNumber(cleanLocalPhoneInput(localNumber, country));
    }
    if (errorMessage) setErrorMessage(null);
    setTimeout(() => {
      phoneInputRef.current?.focus();
    }, 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isSuccess) return;

    const validation = validatePhoneNumber(localNumber, selectedCountry, language);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Please enter a valid phone number.');
      return;
    }

    const fullPhoneNumber = `${selectedCountry.dialCode}${localNumber}`;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (user?.id) {
        // 1. Update user profile
        const { error: profileErr } = await updateUserProfile({
          phone_number: fullPhoneNumber,
        });
        if (profileErr) {
          console.warn('Profile phone update notice:', profileErr.message);
        }

        // 2. Resiliently update Supabase Auth metadata
        if (supabase?.auth) {
          try {
            await supabase.auth.updateUser({
              data: {
                phone_number: fullPhoneNumber,
                phone: fullPhoneNumber,
              },
            });
          } catch (authErr) {
            console.warn('Auth metadata update notice:', authErr);
          }
        }
      }

      setIsSuccess(true);
      onSuccess();

      // Close modal gracefully after success feedback
      setTimeout(() => {
        onClose();
      }, 1300);
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

  const formattedDisplay = formatLocalPhoneNumberDisplay(localNumber, selectedCountry);
  const fullFormattedInternational = localNumber
    ? `${selectedCountry.dialCode} ${formattedDisplay}`
    : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 p-0 sm:p-4"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        id="add_phone_number_modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add_phone_modal_title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md max-h-[92vh] flex flex-col bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl shadow-2xl border border-surface-dim/80 overflow-hidden animate-in slide-in-from-bottom-4 duration-300 sm:zoom-in-95"
      >
        {/* Mobile Pull Bar */}
        <div className="w-full flex sm:hidden items-center justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-outline/25" />
        </div>

        {/* Modal Header */}
        <div className="px-5 sm:px-6 pt-3 sm:pt-5 pb-3 flex items-start justify-between gap-3 border-b border-surface-dim/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/15 shadow-2xs">
              <Phone className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col min-w-0">
              <h2
                id="add_phone_modal_title"
                className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-bold text-on-surface tracking-tight leading-tight truncate"
              >
                {language === 'ur' ? 'اپنا اکاؤنٹ مکمل کریں' : 'Complete Your Account'}
              </h2>
              <p className="font-['Manrope'] text-xs text-outline mt-0.5 leading-snug">
                {language === 'ur'
                  ? 'اکاؤنٹ کو محفوظ اور آسان بازیافت بنانے کے لیے فون نمبر شامل کریں۔'
                  : 'Add your number to make your account easier to manage and recover.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="add_phone_modal_close_btn"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container active:scale-95 transition-colors cursor-pointer shrink-0 mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[calc(92vh-120px)] flex-1 flex flex-col gap-4">
          {isSuccess ? (
            /* Subtle Success State */
            <div className="py-8 sm:py-10 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3.5 border border-emerald-200/80 shadow-xs">
                <CheckCircle2 className="w-8 h-8 stroke-[2.4]" />
              </div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-on-surface">
                {language === 'ur' ? 'فون نمبر شامل کر دیا گیا' : 'Phone number added'}
              </h3>
              <p className="font-['Manrope'] text-xs sm:text-sm text-outline mt-1 max-w-xs leading-relaxed">
                {language === 'ur'
                  ? 'آپ کا اکاؤنٹ کامیابی سے مکمل اور محفوظ ہو چکا ہے۔'
                  : 'Your account is now easier to manage and recover.'}
              </p>
              {fullFormattedInternational && (
                <div className="mt-3 px-3.5 py-1.5 rounded-full bg-surface-container border border-surface-dim font-mono text-xs font-semibold text-primary">
                  {fullFormattedInternational}
                </div>
              )}
            </div>
          ) : isCountryPickerOpen ? (
            /* Searchable Country Selector View */
            <div className="flex flex-col gap-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between gap-2">
                <span className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-on-surface">
                  {language === 'ur' ? 'ملک منتخب کریں' : 'Select Country'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsCountryPickerOpen(false)}
                  className="text-xs font-semibold text-primary hover:text-primary-container px-2 py-1 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  {language === 'ur' ? 'واپس' : 'Done'}
                </button>
              </div>

              {/* Search Field */}
              <div className="relative">
                <Search className="w-4 h-4 text-outline absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  id="country_search_input"
                  type="text"
                  value={countrySearchQuery}
                  onChange={(e) => setCountrySearchQuery(e.target.value)}
                  placeholder={
                    language === 'ur'
                      ? 'ملک تلاش کریں (مثال: پاکستان، +92)'
                      : 'Search country or code (e.g. Pakistan, +92)...'
                  }
                  className="w-full h-10 ps-9 pe-3 rounded-xl bg-surface-container border border-surface-dim text-xs font-['Manrope'] text-on-surface placeholder:text-outline/60 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              {/* Country List */}
              <div className="flex flex-col gap-1 max-h-56 sm:max-h-64 overflow-y-auto divide-y divide-surface-dim/40 pe-1">
                {filteredCountries.length === 0 ? (
                  <div className="py-6 text-center font-['Manrope'] text-xs text-outline">
                    {language === 'ur' ? 'کوئی ملک نہیں ملا' : 'No matching countries found'}
                  </div>
                ) : (
                  filteredCountries.map((c) => {
                    const isSelected = c.iso === selectedCountry.iso;
                    return (
                      <button
                        key={c.iso}
                        type="button"
                        onClick={() => handleSelectCountry(c)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-start transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'hover:bg-surface-container text-on-surface'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl shrink-0" role="img" aria-label={c.name}>
                            {c.flag}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="font-['Manrope'] text-xs font-semibold truncate">
                              {language === 'ur' ? c.nameUrdu : c.name}
                            </span>
                            <span className="text-[10px] text-outline font-normal">
                              {language === 'ur' ? c.name : c.nameUrdu}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-xs font-bold text-outline">
                            {c.dialCode}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-primary stroke-[2.5]" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* Main Form View */
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Error Message Banner */}
              {errorMessage && (
                <div
                  id="phone_error_message"
                  className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-xs font-['Manrope'] text-red-700 dark:text-red-300 flex items-start gap-2 animate-in fade-in"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Country & Phone Input Group */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="local_phone_input"
                  className="text-xs font-bold font-['Manrope'] text-on-surface"
                >
                  {language === 'ur' ? 'فون نمبر' : 'Phone Number'}
                </label>

                <div className="flex items-center gap-2">
                  {/* Country Selector Button */}
                  <button
                    type="button"
                    id="phone_country_select_btn"
                    onClick={() => setIsCountryPickerOpen(true)}
                    className="h-11 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-dim flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label={`Select country, currently ${selectedCountry.name}`}
                  >
                    <span className="text-lg" role="img" aria-label={selectedCountry.name}>
                      {selectedCountry.flag}
                    </span>
                    <span className="font-mono text-xs font-bold text-on-surface">
                      {selectedCountry.dialCode}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-outline" />
                  </button>

                  {/* Local Number Input */}
                  <div className="relative flex-1">
                    <input
                      ref={phoneInputRef}
                      id="local_phone_input"
                      type="tel"
                      inputMode="tel"
                      value={formattedDisplay}
                      onChange={handleInputChange}
                      placeholder={selectedCountry.placeholder}
                      disabled={isSubmitting}
                      className="w-full h-11 px-3.5 rounded-xl bg-surface-container border border-surface-dim text-sm font-['Manrope'] font-medium text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                {/* Helper and Live Preview */}
                <div className="flex items-center justify-between text-[11px] font-['Manrope'] text-outline px-1 mt-0.5">
                  <span>
                    {language === 'ur'
                      ? `مثال: ${selectedCountry.example}`
                      : `e.g. ${selectedCountry.example}`}
                  </span>
                  {fullFormattedInternational && (
                    <span className="font-mono font-semibold text-primary">
                      {fullFormattedInternational}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 mt-2 pt-3 border-t border-surface-dim/60">
                <button
                  type="button"
                  id="add_phone_not_now_btn"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-outline hover:text-on-surface hover:bg-surface-container active:scale-95 transition-all cursor-pointer"
                >
                  {language === 'ur' ? 'ابھی نہیں' : 'Not now'}
                </button>

                <button
                  type="submit"
                  id="save_phone_number_btn"
                  disabled={isSubmitting || !localNumber}
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
    </div>
  );
};
