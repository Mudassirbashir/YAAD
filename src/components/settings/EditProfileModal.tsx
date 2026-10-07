import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  validatePhoneNumber,
  cleanPhoneNumber,
} from '../../utils/phone';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName: string;
  initialPhone: string;
  focusPhoneOnOpen?: boolean;
  onSave: (fullName: string, phoneNumber: string | null) => Promise<{ error?: any }>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  initialName,
  initialPhone,
  focusPhoneOnOpen = false,
  onSave,
}) => {
  const { t, language, isRTL } = useLanguage();

  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setPhone(initialPhone);
      setPhoneError(null);
      setErrorMessage(null);

      const timer = setTimeout(() => {
        if (focusPhoneOnOpen) {
          document.getElementById('edit_modal_phone_input')?.focus();
        } else {
          document.getElementById('edit_modal_name_input')?.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialName, initialPhone, focusPhoneOnOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setPhoneError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage(
        t('profileSetup.nameRequired') ||
          (language === 'ur' ? 'براہ کرم اپنا نام درج کریں' : 'Please enter your name')
      );
      return;
    }

    const trimmedPhone = phone.trim();
    if (trimmedPhone) {
      const validation = validatePhoneNumber(trimmedPhone);
      if (!validation.isValid) {
        setPhoneError(
          validation.error ||
            (language === 'ur'
              ? 'درست فون نمبر درج کریں (مثلاً: +92 300 1234567)'
              : 'Please enter a valid phone number (e.g. +92 300 1234567)')
        );
        return;
      }
    }

    setIsSaving(true);
    const cleanPhoneVal = trimmedPhone ? cleanPhoneNumber(trimmedPhone) : null;
    const { error } = await onSave(trimmedName, cleanPhoneVal);
    setIsSaving(false);

    if (error) {
      setErrorMessage(
        error.message ||
          (language === 'ur' ? 'پروفائل محفوظ نہیں ہو سکی' : 'Failed to update profile')
      );
    } else {
      onClose();
    }
  };

  return (
    <div
      id="edit_profile_modal_backdrop"
      onClick={() => !isSaving && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        id="edit_profile_modal_container"
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-xl border border-surface-dim/80 space-y-4 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-surface-dim/50">
          <h3 className="text-base sm:text-lg font-bold text-on-surface font-['Plus_Jakarta_Sans']">
            {language === 'ur' ? 'پروفائل میں ترمیم کریں' : 'Edit Profile'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error notice */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-error-container/30 border border-error/20 text-xs text-error flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="edit_modal_name_input"
              className="text-xs font-bold text-on-surface font-['Plus_Jakarta_Sans'] flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-primary" />
              <span>{t('settings.name') || (language === 'ur' ? 'مکمل نام' : 'Full Name')}</span>
            </label>
            <input
              id="edit_modal_name_input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('settings.namePlaceholder') || 'Enter your name'}
              disabled={isSaving}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-surface border border-surface-dim/75 text-on-surface focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-['Manrope']"
              required
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label
              htmlFor="edit_modal_phone_input"
              className="text-xs font-bold text-on-surface font-['Plus_Jakarta_Sans'] flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-primary" />
              <span>{t('settings.phone') || (language === 'ur' ? 'فون نمبر' : 'Phone Number')}</span>
            </label>
            <input
              id="edit_modal_phone_input"
              type="tel"
              dir="ltr"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (phoneError) setPhoneError(null);
              }}
              placeholder="+92 300 1234567"
              disabled={isSaving}
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-surface border text-on-surface font-mono focus:outline-hidden focus:ring-2 transition-all ${
                phoneError
                  ? 'border-error focus:border-error focus:ring-error/20'
                  : 'border-surface-dim/75 focus:border-primary focus:ring-primary/20'
              }`}
            />
            {phoneError ? (
              <p className="text-[11px] text-error font-medium">{phoneError}</p>
            ) : (
              <p className="text-[10px] text-outline font-['Manrope']">
                {language === 'ur'
                  ? 'پاکستانی نمبر (+92) درج کریں'
                  : 'Format: +92 300 1234567'}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-outline hover:text-on-surface bg-surface-container-low hover:bg-surface-container rounded-xl transition-colors cursor-pointer"
            >
              {t('settings.cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all disabled:opacity-50 active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t('settings.saving') || 'Saving...'}</span>
                </>
              ) : (
                <span>{t('settings.save') || 'Save'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
