import React from 'react';
import {
  ShieldAlert,
  KeyRound,
  LockKeyhole,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface SecuritySectionProps {
  // Password State
  isChangingPassword: boolean;
  setIsChangingPassword: (val: boolean) => void;
  currentPassword?: string;
  setCurrentPassword?: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  isUpdatingPassword: boolean;
  passwordMessage: { type: 'success' | 'error'; text: string } | null;
  setPasswordMessage: (val: { type: 'success' | 'error'; text: string } | null) => void;
  onUpdatePassword: (e: React.FormEvent) => void;

  // Sign Out Trigger
  onRequestSignOut: () => void;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({
  isChangingPassword,
  setIsChangingPassword,
  currentPassword = '',
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  isUpdatingPassword,
  passwordMessage,
  setPasswordMessage,
  onUpdatePassword,
  onRequestSignOut,
}) => {
  const { t, language } = useLanguage();

  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isNewDifferent = !currentPassword || (newPassword.length > 0 && currentPassword !== newPassword);
  const isNewValidLength = newPassword.length >= 6;
  const canSubmit =
    Boolean(currentPassword.trim()) &&
    isNewValidLength &&
    passwordsMatch &&
    isNewDifferent &&
    !isUpdatingPassword;

  return (
    <section id="settings_security_section" className="space-y-3 sm:space-y-3.5">
      {/* Section Header */}
      <div
        id="settings_security_header"
        className="flex items-center justify-between px-1 sm:px-1.5 pb-0.5"
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-primary-fixed/40 text-primary flex items-center justify-center shrink-0 border border-primary/10 shadow-2xs">
            <ShieldAlert className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
          </div>
          <h2
            className={`text-base sm:text-lg font-bold text-on-surface tracking-tight leading-tight ${
              language === 'ur' ? 'font-urdu text-lg sm:text-xl' : "font-['Manrope']"
            }`}
          >
            {t('settings.securityTitle') || (language === 'ur' ? 'سیکیورٹی اور سائن آؤٹ' : 'Security & Sign Out')}
          </h2>
        </div>
      </div>

      {/* Security Card */}
      <div
        id="settings_security_card"
        className="bg-surface rounded-3xl p-5 sm:p-6 border border-surface-dim shadow-xs divide-y divide-surface-dim/70"
      >
        {/* 1. Change Password Row & Form */}
        <div className="pb-5 space-y-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-primary-fixed/30 text-primary flex items-center justify-center shrink-0 shadow-2xs">
                <KeyRound className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-on-surface font-['Manrope'] truncate">
                  {t('settings.changePassword') || (language === 'ur' ? 'پاس ورڈ تبدیل کریں' : 'Change Password')}
                </h3>
                <p className="text-xs text-outline line-clamp-1">
                  {isChangingPassword
                    ? t('settings.newPasswordPlaceholder') ||
                      (language === 'ur' ? 'نیا پاس ورڈ درج کریں (کم از کم 6 ہندسے)' : 'Enter new password (min 6 chars)')
                    : t('settings.changePasswordDesc') ||
                      (language === 'ur' ? 'اپنے یاد اکاؤنٹ کا خفیہ پاس ورڈ تبدیل کریں' : 'Update your YAAD account password')}
                </p>
              </div>
            </div>

            <button
              id="toggle_change_password_btn"
              type="button"
              onClick={() => {
                setIsChangingPassword(!isChangingPassword);
                setPasswordMessage(null);
              }}
              className="min-h-[38px] px-4 py-1.5 text-xs font-bold text-primary bg-primary-fixed/30 hover:bg-primary-fixed/50 rounded-xl transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              {isChangingPassword
                ? t('settings.cancel') || 'Cancel'
                : t('settings.changePassword') || (language === 'ur' ? 'تبدیل کریں' : 'Change')}
            </button>
          </div>

          {/* Inline Change Password Form */}
          {isChangingPassword && (
            <form
              onSubmit={onUpdatePassword}
              className="p-4 sm:p-5 bg-surface-container-lowest rounded-2xl border border-primary/20 space-y-4 animate-in fade-in duration-200"
            >
              {passwordMessage && (
                <div
                  role="alert"
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    passwordMessage.type === 'success'
                      ? 'bg-secondary-fixed/50 text-primary font-bold border border-primary/20'
                      : 'bg-error-container text-on-error-container border border-error/20'
                  }`}
                >
                  {passwordMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-error" />
                  )}
                  <span>{passwordMessage.text}</span>
                </div>
              )}

              {/* 1. Current Password Field */}
              <div className="space-y-1">
                <label
                  htmlFor="settings_current_password"
                  className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5 font-['Manrope']"
                >
                  <LockKeyhole className="w-3.5 h-3.5 text-outline" />
                  <span>{t('settings.currentPassword') || (language === 'ur' ? 'موجودہ پاس ورڈ' : 'Current Password')}</span>
                </label>
                <div className="relative">
                  <input
                    id="settings_current_password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword && setCurrentPassword(e.target.value)}
                    placeholder={
                      t('settings.currentPasswordPlaceholder') ||
                      (language === 'ur' ? 'اپنا موجودہ پاس ورڈ درج کریں' : 'Enter your current password')
                    }
                    disabled={isUpdatingPassword}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-surface border border-surface-dim focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 pe-10 font-mono transition-all disabled:opacity-60"
                    autoFocus
                    required
                  />
                  <button
                    id="settings_toggle_current_password"
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                    className="absolute inset-y-0 end-3 flex items-center text-outline hover:text-on-surface cursor-pointer"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* 2. New Password Field */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="settings_new_password"
                    className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5 font-['Manrope']"
                  >
                    <LockKeyhole className="w-3.5 h-3.5 text-outline" />
                    <span>{t('settings.newPassword') || (language === 'ur' ? 'نیا پاس ورڈ' : 'New Password')}</span>
                  </label>
                  {isNewValidLength && (
                    <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{language === 'ur' ? '6 ہندسے مکمل' : 'Min 6 chars'}</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="settings_new_password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={
                      t('settings.newPasswordPlaceholder') ||
                      (language === 'ur' ? 'نیا پاس ورڈ (کم از کم 6 ہندسے)' : 'Enter new password (min 6 chars)')
                    }
                    disabled={isUpdatingPassword}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-surface border focus:outline-hidden focus:ring-2 pe-10 font-mono transition-all disabled:opacity-60 ${
                      newPassword && currentPassword && newPassword === currentPassword
                        ? 'border-error focus:border-error focus:ring-error/20'
                        : 'border-surface-dim focus:border-primary focus:ring-primary/20'
                    }`}
                    required
                  />
                  <button
                    id="settings_toggle_new_password"
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                    className="absolute inset-y-0 end-3 flex items-center text-outline hover:text-on-surface cursor-pointer"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {newPassword && currentPassword && newPassword === currentPassword && (
                  <p className="text-[11px] text-error font-medium">
                    {t('settings.samePasswordError') ||
                      (language === 'ur' ? 'نیا پاس ورڈ پرانے سے مختلف ہونا چاہیے' : 'New password cannot be the same as your current password.')}
                  </p>
                )}
              </div>

              {/* 3. Confirm Password Field */}
              <div className="space-y-1">
                <label
                  htmlFor="settings_confirm_password"
                  className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5 font-['Manrope']"
                >
                  <LockKeyhole className="w-3.5 h-3.5 text-outline" />
                  <span>{t('settings.confirmPassword') || (language === 'ur' ? 'نئے پاس ورڈ کی تصدیق' : 'Confirm Password')}</span>
                </label>
                <div className="relative">
                  <input
                    id="settings_confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={
                      t('settings.confirmPasswordPlaceholder') ||
                      (language === 'ur' ? 'نیا پاس ورڈ دوبارہ درج کریں' : 'Re-enter new password')
                    }
                    disabled={isUpdatingPassword}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-surface border focus:outline-hidden focus:ring-2 pe-10 font-mono transition-all disabled:opacity-60 ${
                      confirmPassword && !passwordsMatch
                        ? 'border-error focus:border-error focus:ring-error/20'
                        : 'border-surface-dim focus:border-primary focus:ring-primary/20'
                    }`}
                    required
                  />
                  <button
                    id="settings_toggle_confirm_password"
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute inset-y-0 end-3 flex items-center text-outline hover:text-on-surface cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-[11px] text-error font-medium">
                    {t('settings.passwordMismatch') ||
                      (language === 'ur' ? 'پاس ورڈ ایک دوسرے سے میل نہیں کھاتے' : 'Passwords do not match.')}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    if (setCurrentPassword) setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordMessage(null);
                  }}
                  disabled={isUpdatingPassword}
                  className="px-4 py-2 text-xs font-semibold text-outline hover:text-on-surface bg-surface-container rounded-xl transition-colors cursor-pointer"
                >
                  {t('settings.cancel') || 'Cancel'}
                </button>
                <button
                  id="settings_submit_password_btn"
                  type="submit"
                  disabled={!canSubmit}
                  className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all disabled:opacity-50 active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{t('settings.saving') || 'Saving...'}</span>
                    </>
                  ) : (
                    <span>
                      {t('settings.updatePasswordBtn') || (language === 'ur' ? 'پاس ورڈ اپ ڈیٹ کریں' : 'Update Password')}
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 2. Sign Out Row (Prominent at the very bottom) */}
        <div className="pt-5 flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-2xl bg-error/10 text-error flex items-center justify-center shrink-0 shadow-2xs border border-error/20">
              <LogOut className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-bold text-on-surface truncate font-['Manrope']">
                {t('settings.signOut') || (language === 'ur' ? 'اکاؤنٹ سے لاگ آؤٹ' : 'Sign Out')}
              </h3>
              <p className="text-xs text-outline truncate">
                {t('settings.signOutDeviceDesc') ||
                  (language === 'ur' ? 'اس ڈیوائس پر اکاؤنٹ سیشن بند کریں' : 'Sign out of your account on this device')}
              </p>
            </div>
          </div>

          <button
            id="settings_sign_out_trigger_btn"
            type="button"
            onClick={onRequestSignOut}
            className="min-h-[40px] px-4 py-2 text-xs sm:text-sm font-bold text-error hover:text-white bg-error/10 hover:bg-error border border-error/30 rounded-xl transition-all active:scale-95 shrink-0 flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <LogOut className="w-4 h-4 stroke-[2.2]" />
            <span>{t('settings.signOut') || (language === 'ur' ? 'لاگ آؤٹ' : 'Sign Out')}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
