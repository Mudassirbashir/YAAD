import React, { useState, useId } from 'react';
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    signOut,
    passwordResetError,
    clearPasswordResetError,
  } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(passwordResetError);
  const [isSuccess, setIsSuccess] = useState(false);

  // Requirements checks
  const hasMinLength = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isValid = hasMinLength && hasLetter && hasNumber && passwordsMatch;

  const isExpiredOrInvalidLink = Boolean(
    passwordResetError &&
      (passwordResetError.toLowerCase().includes('expired') ||
        passwordResetError.toLowerCase().includes('invalid') ||
        passwordResetError.toLowerCase().includes('access_denied') ||
        passwordResetError.toLowerCase().includes('otp'))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !isValid) return;

    setIsLoading(true);
    setErrorMessage(null);
    clearPasswordResetError();

    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        setErrorMessage(error.message || 'Failed to update password. Please try again.');
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred while updating your password.');
      setIsLoading(false);
    }
  };

  const handleCancelAndSignOut = async () => {
    if (isLoading) return;
    setIsLoading(true);
    clearPasswordResetError();
    try {
      await signOut();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      id="reset_password_screen"
      className="min-h-screen bg-background text-on-background flex flex-col justify-center items-center p-4 sm:p-6"
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
              className="text-2xl font-bold font-['Plus_Jakarta_Sans'] text-on-surface tracking-tight"
            >
              {isExpiredOrInvalidLink ? 'Reset Link Expired' : 'Create Your New Password'}
            </h1>
            <p className="text-xs text-on-surface-variant font-['Manrope'] max-w-xs leading-relaxed">
              {isExpiredOrInvalidLink
                ? 'This password reset link is invalid or has already expired. For your security, reset links can only be used once.'
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

        {/* Error Alert */}
        {errorMessage && (
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
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto ring-8 ring-primary/5">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-lg text-primary">
                Password Updated Successfully
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
          /* Expired / Invalid Token State */
          <div className="space-y-3 pt-2">
            <button
              id="reset_password_request_new_btn"
              type="button"
              onClick={onRequestNewLink || handleCancelAndSignOut}
              disabled={isLoading}
              className="w-full h-12 rounded-full bg-primary text-on-primary font-['Manrope'] text-sm font-bold shadow-md hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Request New Reset Link</span>
            </button>

            <button
              id="reset_password_cancel_invalid_btn"
              type="button"
              onClick={handleCancelAndSignOut}
              disabled={isLoading}
              className="w-full h-10 rounded-2xl text-xs font-['Manrope'] font-semibold text-outline hover:text-on-surface flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Return to Sign In</span>
            </button>
          </div>
        ) : (
          /* Main Password Reset Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="reset_input_new_password"
                className="text-xs font-bold text-on-surface-variant block font-['Manrope']"
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-outline absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reset_input_new_password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters with letters & numbers"
                  disabled={isLoading}
                  className="w-full h-11 bg-surface-container text-on-surface text-sm rounded-2xl ps-10 pe-11 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline font-['Manrope'] disabled:opacity-60"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 transition-colors"
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
                Confirm New Password
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
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 transition-colors"
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
                    <span className="w-3.5 h-3.5 rounded-full border border-outline shrink-0 flex items-center justify-center text-[9px] text-outline">•</span>
                  )}
                  <span className={hasMinLength ? 'text-primary font-medium' : 'text-on-surface-variant'}>
                    At least 8 characters
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  {hasLetter && hasNumber ? (
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-outline shrink-0 flex items-center justify-center text-[9px] text-outline">•</span>
                  )}
                  <span className={hasLetter && hasNumber ? 'text-primary font-medium' : 'text-on-surface-variant'}>
                    Contains both letters and numbers
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  {passwordsMatch ? (
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-outline shrink-0 flex items-center justify-center text-[9px] text-outline">•</span>
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
              className="w-full h-12 rounded-full bg-primary text-on-primary font-['Manrope'] text-sm font-bold shadow-md hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.99] mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
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
              className="w-full h-10 rounded-2xl text-xs font-['Manrope'] font-semibold text-outline hover:text-error flex items-center justify-center gap-1.5 transition-colors"
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
