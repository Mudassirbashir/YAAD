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
import { useShouldAnimate } from '../../lib/motionPreference';

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
  const canAnimate = useShouldAnimate();

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
          t('settings.passwordMismatch') ||
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
      style={!canAnimate ? { animationDuration: '80ms' } : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 yaad-enter-fade"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change_password_modal_title"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        id="change_password_modal_container"
        onClick={(e) => e.stopPropagation()}
        style={!canAnimate ? { animationDuration: '80ms' } : undefined}
        className={`yaad-settings-card p-5 sm:p-6 max-w-sm w-full space-y-4 ${
          canAnimate ? 'yaad-enter-zoom' : 'yaad-enter-fade'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b yaad-settings-divider">
          <div className="flex items-center gap-3 min-w-0">
            <div className="yaad-settings-tile">
              <LockKeyhole className="w-5 h-5 stroke-[1.9]" aria-hidden="true" />
            </div>
            <h3
              id="change_password_modal_title"
              className="text-base sm:text-lg font-bold text-on-surface font-display truncate"
            >
              {t('settings.changePassword') || (language === 'ur' ? 'پاس ورڈ تبدیل کریں' : 'Change Password')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-low cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Close"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            role="status"
            className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
              canAnimate ? 'yaad-enter-state' : ''
            } ${
              message.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/50'
                : 'bg-error-container/40 text-error border border-error/25'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-error" aria-hidden="true" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="modal_new_pwd_input"
              className="text-xs font-semibold text-on-surface font-display flex items-center gap-1.5"
            >
              <LockKeyhole className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
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
                className="w-full px-3.5 py-2.5 text-sm rounded-2xl bg-surface border border-surface-dim/80 text-on-surface font-mono pe-12 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[48px]"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                aria-label={showNew ? 'Hide new password' : 'Show new password'}
                className="absolute inset-y-0 end-0 w-12 h-12 min-w-[48px] min-h-[48px] flex items-center justify-center text-outline hover:text-on-surface cursor-pointer rounded-e-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {showNew ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="modal_confirm_pwd_input"
              className="text-xs font-semibold text-on-surface font-display flex items-center gap-1.5"
            >
              <LockKeyhole className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
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
                className="w-full px-3.5 py-2.5 text-sm rounded-2xl bg-surface border border-surface-dim/80 text-on-surface font-mono pe-12 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[48px]"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                className="absolute inset-y-0 end-0 w-12 h-12 min-w-[48px] min-h-[48px] flex items-center justify-center text-outline hover:text-on-surface cursor-pointer rounded-e-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="px-4 py-2.5 min-h-[48px] text-xs sm:text-sm font-semibold text-on-surface-variant hover:text-on-surface bg-surface-container-low hover:bg-surface-container border border-surface-dim/60 rounded-2xl cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {t('settings.cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isUpdating || newPassword.length < 6 || newPassword !== confirmPassword}
              className={`px-5 py-2.5 min-h-[48px] text-xs sm:text-sm font-bold text-on-primary bg-primary hover:bg-primary/90 rounded-2xl disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                canAnimate ? 'transition-[transform,opacity] duration-150 yaad-ease-premium active:scale-[0.98]' : ''
              }`}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>{t('settings.saving') || 'Saving...'}</span>
                </>
              ) : (
                <span>{t('settings.save') || t('settings.saveName') || (language === 'ur' ? 'محفوظ کریں' : 'Save Password')}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
