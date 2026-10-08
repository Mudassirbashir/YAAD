import React, { useState } from 'react';
import {
  X,
  LockKeyhole,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newPassword: string) => Promise<{ error?: any }>;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { t, language, isRTL } = useLanguage();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setMessage({
        type: 'error',
        text:
          language === 'ur'
            ? 'آپ آف لائن ہیں۔ انٹرنیٹ سے جڑنے کے بعد کوشش کریں۔'
            : "You're offline. Reconnect to change password.",
      });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({
        type: 'error',
        text:
          t('settings.passwordTooShort') ||
          (language === 'ur'
            ? 'پاس ورڈ کم از کم 6 ہندسوں کا ہونا چاہیے'
            : 'Password must be at least 6 characters'),
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({
        type: 'error',
        text:
          t('settings.passwordsDoNotMatch') ||
          (language === 'ur' ? 'پاس ورڈ مماثل نہیں ہیں' : 'Passwords do not match'),
      });
      return;
    }

    setIsUpdating(true);
    const { error } = await onSubmit(newPassword);
    setIsUpdating(false);

    if (error) {
      setMessage({
        type: 'error',
        text:
          error.message ||
          (language === 'ur' ? 'پاس ورڈ تبدیل نہیں ہو سکا' : 'Failed to update password'),
      });
    } else {
      setMessage({
        type: 'success',
        text:
          language === 'ur'
            ? 'پاس ورڈ کامیابی سے تبدیل ہو گیا!'
            : 'Password updated successfully!',
      });
      setTimeout(() => {
        setNewPassword('');
        setConfirmPassword('');
        setMessage(null);
        onClose();
      }, 1500);
    }
  };

  return (
    <div
      id="change_password_modal_backdrop"
      onClick={() => !isUpdating && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        id="change_password_modal_container"
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-xl border border-surface-dim/80 space-y-4 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-surface-dim/50">
          <h3 className="text-base sm:text-lg font-bold text-on-surface font-['Plus_Jakarta_Sans']">
            {t('settings.changePassword') || (language === 'ur' ? 'پاس ورڈ تبدیل کریں' : 'Change Password')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-error-container/40 text-error border border-error/20'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-error" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* New Password */}
          <div className="space-y-1">
            <label
              htmlFor="modal_new_pwd_input"
              className="text-xs font-bold text-on-surface font-['Plus_Jakarta_Sans'] flex items-center gap-1.5"
            >
              <LockKeyhole className="w-3.5 h-3.5 text-primary" />
              <span>{t('settings.newPassword') || (language === 'ur' ? 'نیا پاس ورڈ' : 'New Password')}</span>
            </label>
            <div className="relative">
              <input
                id="modal_new_pwd_input"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isUpdating}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-surface border border-surface-dim/75 text-on-surface font-mono pe-10 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 end-3 flex items-center text-outline hover:text-on-surface cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label
              htmlFor="modal_confirm_pwd_input"
              className="text-xs font-bold text-on-surface font-['Plus_Jakarta_Sans'] flex items-center gap-1.5"
            >
              <LockKeyhole className="w-3.5 h-3.5 text-primary" />
              <span>{t('settings.confirmPassword') || (language === 'ur' ? 'پاس ورڈ کی تصدیق کریں' : 'Confirm Password')}</span>
            </label>
            <div className="relative">
              <input
                id="modal_confirm_pwd_input"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isUpdating}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-surface border border-surface-dim/75 text-on-surface font-mono pe-10 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 end-3 flex items-center text-outline hover:text-on-surface cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="px-4 py-2 text-xs font-semibold text-outline hover:text-on-surface bg-surface-container-low hover:bg-surface-container rounded-xl transition-colors cursor-pointer"
            >
              {t('settings.cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isUpdating || newPassword.length < 6 || newPassword !== confirmPassword}
              className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all disabled:opacity-50 active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t('settings.saving') || 'Saving...'}</span>
                </>
              ) : (
                <span>{t('settings.save') || (language === 'ur' ? 'محفوظ کریں' : 'Save Password')}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
