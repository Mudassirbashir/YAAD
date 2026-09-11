import React from 'react';
import {
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  Fingerprint,
  Smartphone,
  Laptop,
  Plus,
  Trash2,
  Loader2,
  LogOut,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { isPasskeySupported } from '../../lib/passkey';
import { PasskeyCredentialInfo } from '../../types';

interface SecuritySectionProps {
  // Password State
  isChangingPassword: boolean;
  setIsChangingPassword: (val: boolean) => void;
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

  // Passkey State
  passkeys: PasskeyCredentialInfo[];
  loadingPasskeys: boolean;
  isRegisteringPasskey: boolean;
  confirmDeletePasskeyId: string | null;
  setConfirmDeletePasskeyId: (id: string | null) => void;
  isDeletingPasskey: boolean;
  passkeyMessage: { type: 'success' | 'error'; text: string } | null;
  onRegisterPasskey: () => void;
  onRemovePasskey: (id: string) => void;

  // Sign Out Trigger
  onRequestSignOut: () => void;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({
  isChangingPassword,
  setIsChangingPassword,
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
  passkeys,
  loadingPasskeys,
  isRegisteringPasskey,
  confirmDeletePasskeyId,
  setConfirmDeletePasskeyId,
  isDeletingPasskey,
  passkeyMessage,
  onRegisterPasskey,
  onRemovePasskey,
  onRequestSignOut,
}) => {
  const { t, language } = useLanguage();

  const getPasskeyIcon = (name?: string) => {
    const lower = (name || '').toLowerCase();
    if (
      lower.includes('iphone') ||
      lower.includes('android') ||
      lower.includes('phone')
    ) {
      return <Smartphone className="w-4 h-4 text-primary" />;
    }
    if (
      lower.includes('mac') ||
      lower.includes('windows') ||
      lower.includes('laptop') ||
      lower.includes('pc') ||
      lower.includes('desktop')
    ) {
      return <Laptop className="w-4 h-4 text-primary" />;
    }
    return <Fingerprint className="w-4 h-4 text-primary" />;
  };

  const formatPasskeyDate = (isoString?: string) => {
    if (!isoString) return 'Recently';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return 'Recently';
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <section id="settings_security_section" className="space-y-3 sm:space-y-3.5">
      {/* Section Header */}
      <div
        id="settings_security_header"
        className="flex items-center justify-between px-1 sm:px-1.5 pb-0.5"
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-primary-fixed/40 text-primary flex items-center justify-center shrink-0 border border-primary/10 shadow-2xs">
            <Shield className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
          </div>
          <h2
            className={`text-base sm:text-lg font-bold text-on-surface tracking-tight leading-tight ${
              language === 'ur' ? 'font-urdu text-lg sm:text-xl' : "font-['Manrope']"
            }`}
          >
            {t('settings.securityTitle') || 'Security & Sign In'}
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
                <KeyRound className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-on-surface font-['Manrope'] truncate">
                  {t('settings.changePassword') || 'Change Password'}
                </h3>
                <p className="text-xs text-outline line-clamp-1">
                  {isChangingPassword
                    ? t('settings.newPasswordPlaceholder') ||
                      'Enter new password (min 6 chars)'
                    : t('settings.changePasswordDesc') ||
                      'Update your YAAD account password'}
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
                : t('settings.changePassword') || 'Change'}
            </button>
          </div>

          {/* Inline Change Password Form */}
          {isChangingPassword && (
            <form
              onSubmit={onUpdatePassword}
              className="p-4 sm:p-4.5 bg-surface-container-lowest rounded-2xl border border-primary/20 space-y-3.5 animate-in fade-in duration-200"
            >
              {passwordMessage && (
                <div
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

              <div className="space-y-1">
                <label
                  htmlFor="settings_new_password"
                  className="text-xs font-bold text-on-surface-variant"
                >
                  {t('settings.newPassword') || 'New Password'}
                </label>
                <div className="relative">
                  <input
                    id="settings_new_password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={
                      t('settings.newPasswordPlaceholder') ||
                      'Enter new password (min 6 chars)'
                    }
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-surface border border-surface-dim focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 pe-10 font-mono transition-all"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 end-3 flex items-center text-outline hover:text-on-surface cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="settings_confirm_password"
                  className="text-xs font-bold text-on-surface-variant"
                >
                  {t('settings.confirmPassword') || 'Confirm Password'}
                </label>
                <input
                  id="settings_confirm_password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={
                    t('settings.confirmPasswordPlaceholder') ||
                    'Re-enter new password'
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-surface border border-surface-dim focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 font-mono transition-all"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  disabled={isUpdatingPassword}
                  className="px-4 py-2 text-xs font-semibold text-outline hover:text-on-surface bg-surface-container rounded-xl transition-colors cursor-pointer"
                >
                  {t('settings.cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all disabled:opacity-50 active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{t('settings.saving') || 'Saving...'}</span>
                    </>
                  ) : (
                    <span>
                      {t('settings.updatePasswordBtn') || 'Update Password'}
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 2. Passkeys & Biometrics Section */}
        <div id="settings_passkeys_section" className="py-5 space-y-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-secondary-fixed/40 text-primary flex items-center justify-center shrink-0 shadow-2xs">
                <Fingerprint className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-on-surface font-['Manrope'] truncate">
                    Passkeys & Biometrics
                  </h3>
                  {passkeys.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary shrink-0">
                      {passkeys.length} active
                    </span>
                  )}
                </div>
                <p className="text-xs text-outline line-clamp-1">
                  Touch ID, Face ID, or Windows Hello
                </p>
              </div>
            </div>

            {isPasskeySupported() && (
              <button
                id="settings_register_passkey_btn"
                type="button"
                disabled={isRegisteringPasskey}
                onClick={onRegisterPasskey}
                className="min-h-[38px] px-3.5 py-1.5 text-xs font-bold text-primary bg-primary-fixed/30 hover:bg-primary-fixed/50 rounded-xl transition-all active:scale-95 shrink-0 flex items-center gap-1.5 disabled:opacity-50 shadow-2xs cursor-pointer"
              >
                {isRegisteringPasskey ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Setting up...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add Passkey</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Explainer Callout */}
          <div className="p-3 bg-surface-container-low border border-outline-variant/60 rounded-2xl text-xs text-on-surface-variant flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Passkeys allow you to sign in quickly and securely using biometrics or screen lock without typing a password.
            </p>
          </div>

          {/* Feedback Banner */}
          {passkeyMessage && (
            <div
              id="settings_passkey_message_alert"
              className={`p-3 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in duration-150 ${
                passkeyMessage.type === 'success'
                  ? 'bg-secondary-fixed/50 text-primary font-bold border border-primary/20'
                  : 'bg-error-container/40 text-error border border-error/20'
              }`}
            >
              {passkeyMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-error" />
              )}
              <span>{passkeyMessage.text}</span>
            </div>
          )}

          {/* Passkey List or Empty State */}
          {!isPasskeySupported() ? (
            <div className="p-3 bg-surface-container-low border border-outline-variant/50 rounded-2xl text-xs text-outline flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-outline shrink-0" />
              <span>Passkeys are not supported on this device or browser.</span>
            </div>
          ) : loadingPasskeys ? (
            <div className="p-4 bg-surface-container-low rounded-2xl flex items-center justify-center gap-2 text-xs text-outline">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Loading registered passkeys...</span>
            </div>
          ) : passkeys.length === 0 ? (
            <div className="p-4 bg-surface-container-low border border-dashed border-outline-variant/80 rounded-2xl text-center space-y-1.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <Fingerprint className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-on-surface">No passkeys registered yet</p>
              <p className="text-[11px] text-outline max-w-xs mx-auto">
                Set up a passkey on this device to sign in instantly with Touch ID, Face ID, or your device lock.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {passkeys.map((pk) => {
                const deviceTitle =
                  pk.deviceName || pk.device_name || 'Passkey Device';
                const isConfirming = confirmDeletePasskeyId === pk.id;

                return (
                  <div
                    key={pk.id}
                    className="p-3 bg-surface-container-low hover:bg-surface-container border border-outline-variant/50 rounded-2xl transition-all"
                  >
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-surface-container text-primary flex items-center justify-center shrink-0 border border-outline-variant/40">
                          {getPasskeyIcon(deviceTitle)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-on-surface truncate">
                            {deviceTitle}
                          </h4>
                          <p className="text-[11px] text-outline truncate">
                            Added {formatPasskeyDate(pk.createdAt)} • Last used{' '}
                            {formatPasskeyDate(pk.lastUsedAt)}
                          </p>
                        </div>
                      </div>

                      {isConfirming ? (
                        <div className="flex items-center gap-1.5 shrink-0 animate-in fade-in duration-150">
                          <span className="text-[11px] font-bold text-error">Remove?</span>
                          <button
                            type="button"
                            disabled={isDeletingPasskey}
                            onClick={() => onRemovePasskey(pk.id)}
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-error hover:bg-error/90 rounded-lg transition-colors disabled:opacity-50 shadow-2xs cursor-pointer"
                          >
                            {isDeletingPasskey ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              'Yes'
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={isDeletingPasskey}
                            onClick={() => setConfirmDeletePasskeyId(null)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeletePasskeyId(pk.id)}
                          className="p-2 text-outline hover:text-error hover:bg-error/10 rounded-xl transition-colors shrink-0 cursor-pointer"
                          title="Remove Passkey"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Sign Out Row (Calm, Restrained Styling) */}
        <div className="pt-5 flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Neutral, calm icon styling */}
            <div className="w-10 h-10 rounded-2xl bg-surface-container text-on-surface-variant flex items-center justify-center shrink-0 shadow-2xs border border-surface-dim/60">
              <LogOut className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-bold text-on-surface truncate font-['Manrope']">
                {t('settings.signOut') || 'Sign Out'}
              </h3>
              <p className="text-xs text-outline truncate">
                {t('settings.signOutDeviceDesc') || 'Sign out of this device'}
              </p>
            </div>
          </div>

          <button
            id="settings_sign_out_trigger_btn"
            type="button"
            onClick={onRequestSignOut}
            className="min-h-[40px] px-4 py-2 text-xs sm:text-sm font-bold text-on-surface-variant hover:text-on-surface bg-surface-container-low hover:bg-surface-container border border-surface-dim rounded-xl transition-colors active:scale-95 shrink-0 cursor-pointer"
          >
            {t('settings.signOut') || 'Sign Out'}
          </button>
        </div>
      </div>
    </section>
  );
};
