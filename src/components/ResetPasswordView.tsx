import React, { useState, useRef, useEffect } from 'react';
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  LogOut,
  RefreshCw,
  Mail,
  Send,
  WifiOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface ResetPasswordViewProps {
  onSuccess?: () => void;
  onRequestNewLink?: () => void;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({
  onSuccess,
  onRequestNewLink,
}) => {
  const {
    user,
    updatePassword,
    sendPasswordResetEmail,
    signOut,
    passwordResetError,
    clearPasswordResetError,
    clearPasswordRecovery,
    isPasswordRecovery,
    isPasswordResetRequired,
    isLoading: isAuthLoading,
  } = useAuth();

  const { t, language } = useLanguage();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(passwordResetError);
  const [isSuccess, setIsSuccess] = useState(false);

  // Expired / missing recovery session handling with inline request option
  const [showInlineRequestForm, setShowInlineRequestForm] = useState(false);
  const [inlineEmail, setInlineEmail] = useState('');
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);
  const [resetEmailSuccess, setResetEmailSuccess] = useState<string | null>(null);
  const [resetEmailError, setResetEmailError] = useState<string | null>(null);

  // Anti-duplicate submission guard
  const isSubmittingRef = useRef<boolean>(false);

  // Sync incoming context error if any
  useEffect(() => {
    if (passwordResetError) {
      setErrorMessage(passwordResetError);
    }
  }, [passwordResetError]);

  // Requirements checks consistent with YAAD authentication policy (min 6 chars, letters and numbers, matching)
  const hasMinLength = newPassword.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isValid = hasMinLength && hasLetter && hasNumber && passwordsMatch;

  // Determine if the recovery link is expired, invalid, or missing
  const isExpiredOrInvalidLink = Boolean(
    passwordResetError ||
      (!isAuthLoading &&
        !user &&
        !isPasswordRecovery &&
        !isPasswordResetRequired &&
        typeof window !== 'undefined' &&
        sessionStorage.getItem('yaad_password_recovery_active') !== 'true' &&
        localStorage.getItem('yaad_password_reset_required') !== 'true')
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || isLoading) return;

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setErrorMessage("You're offline. Please reconnect to update your password.");
      return;
    }

    if (!hasMinLength) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (!hasLetter || !hasNumber) {
      setErrorMessage('Password must contain both letters and numbers.');
      return;
    }
    if (!passwordsMatch) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);
    setErrorMessage(null);
    clearPasswordResetError();

    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        setErrorMessage(error.message || 'Failed to update password. Please try again.');
        setIsLoading(false);
        isSubmittingRef.current = false;
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 1200);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while updating your password.';
      setErrorMessage(errorMsg);
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleSendInlineResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inlineEmail.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setResetEmailError('Please enter a valid email address.');
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setResetEmailError("You're offline. Please reconnect to send reset link.");
      return;
    }

    setIsSendingResetEmail(true);
    setResetEmailError(null);
    setResetEmailSuccess(null);

    try {
      const { error } = await sendPasswordResetEmail(trimmed);
      if (error) {
        setResetEmailError(error.message || 'Failed to send reset link. Please try again.');
      } else {
        setResetEmailSuccess(
          `A fresh reset link has been sent to ${trimmed}. Please check your email inbox.`
        );
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Unable to send reset link. Please try again.';
      setResetEmailError(errorMsg);
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  const handleCancelAndSignOut = async () => {
    if (isLoading) return;
    setIsLoading(true);
    clearPasswordResetError();
    clearPasswordRecovery();
    try {
      await signOut();
    } catch (err) {
      console.warn('Notice during cancel & sign out:', err);
    } finally {
      setIsLoading(false);
      if (onRequestNewLink) {
        onRequestNewLink();
      }
    }
  };

  // 1. Initial Loading Verification State (e.g. while resolving session or tokens)
  if (isAuthLoading && !user && !passwordResetError) {
    return (
      <main
        id="reset_password_loading_screen"
        className="min-h-screen bg-background text-on-background flex flex-col justify-center items-center p-4 sm:p-6"
      >
        <div className="w-full max-w-md bg-surface border border-outline-variant/60 rounded-3xl p-8 shadow-sm text-center space-y-4 animate-in fade-in duration-200">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto ring-8 ring-primary/5">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold font-['Plus_Jakarta_Sans'] text-on-surface">
              Verifying Recovery Session
            </h2>
            <p className="text-xs text-on-surface-variant font-['Manrope']">
              Please wait while YAAD securely verifies your password reset link...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      id="reset_password_screen"
      className="min-h-screen bg-background text-on-background flex flex-col justify-center items-center p-4 sm:p-6"
      dir={language === 'ur' ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-md bg-surface border border-outline-variant/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-['Plus_Jakarta_Sans'] font-extrabold text-xl shadow-md">
            Y
          </div>
          <div className="space-y-1">
            <h1
              id="reset_password_title"
              className={`text-2xl font-bold text-on-surface tracking-tight ${
                language === 'ur' ? 'font-urdu text-2xl' : "font-['Plus_Jakarta_Sans']"
              }`}
            >
              {isExpiredOrInvalidLink
                ? t('settings.resetLinkExpired') || 'Your reset link has expired. Request a new one.'
                : t('settings.createYourNewPassword') || 'Create Your New Password'}
            </h1>
            <p
              className={`text-xs text-on-surface-variant max-w-xs leading-relaxed ${
                language === 'ur' ? 'font-urdu' : "font-['Manrope']"
              }`}
            >
              {isExpiredOrInvalidLink
                ? 'This password reset link is invalid, expired, or has already been used. For your security, reset links can only be used once.'
                : 'Choose a strong new password to protect your YAAD account.'}
            </p>
          </div>

          {/* User Email Indicator Badge */}
          {user?.email && !isExpiredOrInvalidLink && (
            <div
              id="reset_password_user_badge"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-full text-xs font-semibold text-primary border border-surface-dim"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{user.email}</span>
            </div>
          )}
        </div>

        {/* Security Warning Notice */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 font-['Manrope']">
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-snug">
            {isExpiredOrInvalidLink
              ? 'Password reset required. You cannot access application lists or settings until a valid password reset is completed.'
              : 'Password reset in progress. You must create a new password before accessing your YAAD lists and settings.'}
          </p>
        </div>

        {/* Offline Status Warning */}
        {typeof navigator !== 'undefined' && !navigator.onLine && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200 font-['Manrope']">
            <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>You're offline. Reconnect to complete your password update.</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && !isExpiredOrInvalidLink && (
          <div
            id="reset_password_error_alert"
            role="alert"
            className="p-3.5 bg-error-container/80 border border-error/20 text-on-error-container rounded-2xl flex items-start gap-2.5 text-xs font-['Manrope'] animate-in fade-in duration-200"
          >
            <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">Password Reset Notice</span>
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Success Screen */}
        {isSuccess ? (
          <div
            id="reset_password_success_card"
            className="p-6 bg-surface-container rounded-3xl border border-surface-dim text-center space-y-4 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto ring-8 ring-primary/5 animate-pulse">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-lg text-primary">
                {t('settings.passwordUpdated') || 'Password Updated Successfully'}
              </h2>
              <p className="font-['Manrope'] text-xs text-on-surface-variant leading-relaxed">
                Your password has been changed. Preparing your YAAD dashboard...
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-primary font-['Manrope'] pt-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Entering YAAD...</span>
            </div>
          </div>
        ) : isExpiredOrInvalidLink ? (
          /* ================= Expired / Invalid Link State ================= */
          <div className="space-y-4 pt-1 animate-in fade-in duration-200">
            {/* Inline Request New Link Form */}
            {showInlineRequestForm ? (
              <form onSubmit={handleSendInlineResetEmail} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="reset_inline_email_input"
                    className="text-xs font-bold text-on-surface-variant block font-['Manrope']"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-outline absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="reset_inline_email_input"
                      type="email"
                      value={inlineEmail}
                      onChange={(e) => setInlineEmail(e.target.value)}
                      placeholder="name@example.com"
                      disabled={isSendingResetEmail}
                      className="w-full h-11 bg-surface-container text-on-surface text-sm rounded-2xl ps-10 pe-4 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline font-['Manrope'] disabled:opacity-60"
                      required
                    />
                  </div>
                </div>

                {resetEmailSuccess && (
                  <div className="p-3 bg-primary-fixed/20 border border-primary/20 text-primary rounded-2xl text-xs font-['Manrope'] flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{resetEmailSuccess}</span>
                  </div>
                )}

                {resetEmailError && (
                  <div className="p-3 bg-error-container/80 border border-error/20 text-on-error-container rounded-2xl text-xs font-['Manrope'] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                    <span>{resetEmailError}</span>
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  <button
                    id="reset_send_new_link_submit_btn"
                    type="submit"
                    disabled={isSendingResetEmail || !inlineEmail.trim()}
                    className="w-full h-12 rounded-full bg-primary text-on-primary font-['Manrope'] text-sm font-bold shadow-md hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSendingResetEmail ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Fresh Reset Link</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowInlineRequestForm(false)}
                    disabled={isSendingResetEmail}
                    className="w-full h-10 rounded-2xl text-xs font-['Manrope'] font-semibold text-outline hover:text-on-surface transition-colors cursor-pointer"
                  >
                    Back to options
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <button
                  id="reset_password_request_new_btn"
                  type="button"
                  onClick={() => setShowInlineRequestForm(true)}
                  disabled={isLoading}
                  className="w-full h-12 rounded-full bg-primary text-on-primary font-['Manrope'] text-sm font-bold shadow-md hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{t('settings.requestNewLink') || 'Request New Link'}</span>
                </button>

                <button
                  id="reset_password_cancel_invalid_btn"
                  type="button"
                  onClick={handleCancelAndSignOut}
                  disabled={isLoading}
                  className="w-full h-10 rounded-2xl text-xs font-['Manrope'] font-semibold text-outline hover:text-on-surface flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ================= Main Password Creation Form ================= */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="reset_input_new_password"
                  className="text-xs font-bold text-on-surface-variant block font-['Manrope']"
                >
                  {t('settings.newPassword') || 'New Password'}
                </label>
                {newPassword.length >= 6 && (
                  <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                    <Check className="w-3 h-3" /> Valid length
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-outline absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reset_input_new_password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  disabled={isLoading}
                  className="w-full h-11 bg-surface-container text-on-surface text-sm rounded-2xl ps-10 pe-11 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline font-['Manrope'] disabled:opacity-60"
                  autoComplete="new-password"
                  required
                />
                <button
                  id="reset_toggle_new_password"
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 transition-colors cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="reset_input_confirm_password"
                className="text-xs font-bold text-on-surface-variant block font-['Manrope']"
              >
                {t('settings.confirmPassword') || 'Confirm Password'}
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-outline absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reset_input_confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  disabled={isLoading}
                  className={`w-full h-11 bg-surface-container text-on-surface text-sm rounded-2xl ps-10 pe-11 border focus:ring-2 outline-none transition-all placeholder:text-outline font-['Manrope'] disabled:opacity-60 ${
                    confirmPassword && !passwordsMatch
                      ? 'border-error/60 focus:border-error focus:ring-error/20'
                      : 'border-outline-variant focus:border-primary focus:ring-primary/20'
                  }`}
                  autoComplete="new-password"
                  required
                />
                <button
                  id="reset_toggle_confirm_password"
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Live Requirements Checklist */}
            <div className="p-3 bg-surface-container/60 rounded-2xl border border-surface-dim space-y-2 text-xs font-['Manrope']">
              <div className="font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider">
                Password Requirements
              </div>
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2">
                  {hasMinLength ? (
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-outline shrink-0 flex items-center justify-center text-[9px] text-outline">
                      •
                    </span>
                  )}
                  <span className={hasMinLength ? 'text-primary font-medium' : 'text-on-surface-variant'}>
                    At least 6 characters
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  {hasLetter && hasNumber ? (
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-outline shrink-0 flex items-center justify-center text-[9px] text-outline">
                      •
                    </span>
                  )}
                  <span className={hasLetter && hasNumber ? 'text-primary font-medium' : 'text-on-surface-variant'}>
                    Contains both letters and numbers
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  {passwordsMatch ? (
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-outline shrink-0 flex items-center justify-center text-[9px] text-outline">
                      •
                    </span>
                  )}
                  <span className={passwordsMatch ? 'text-primary font-medium' : 'text-on-surface-variant'}>
                    Passwords match
                  </span>
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              id="reset_password_submit_btn"
              type="submit"
              disabled={isLoading || !isValid}
              className="w-full h-12 rounded-full bg-primary text-on-primary font-['Manrope'] text-sm font-bold shadow-md hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.99] mt-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Update Password & Continue</span>
                </>
              )}
            </button>

            {/* Cancel & Sign Out */}
            <button
              id="reset_password_cancel_btn"
              type="button"
              onClick={handleCancelAndSignOut}
              disabled={isLoading}
              className="w-full h-10 rounded-2xl text-xs font-['Manrope'] font-semibold text-outline hover:text-error flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cancel & Sign Out</span>
            </button>
          </form>
        )}
      </div>
    </main>
  );
};
