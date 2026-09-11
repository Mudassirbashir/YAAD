import React, { useState, useRef, useEffect } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  LogIn,
  UserPlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Fingerprint,
  Globe,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { APP_IMAGES } from '../data/initialData';
import { formatAuthErrorMessage } from '../lib/supabase';
import { isPasskeySupported } from '../lib/passkey';
import { validatePhoneNumber } from '../utils/phone';

type AuthScreenMode = 'signin' | 'signup' | 'forgot_password' | 'reset_password';

interface AuthViewProps {
  initialMode?: 'signin' | 'signup';
  onSuccess?: () => void;
  onOpenLegalPage?: (page: 'terms' | 'privacy' | 'about' | 'help' | 'legal') => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'signin',
  onSuccess,
  onOpenLegalPage,
}) => {
  const { t } = useLanguage();
  const {
    signIn,
    signUp,
    signInWithGoogle,
    signInWithPasskey,
    oauthError,
    clearOauthError,
    isPasswordRecovery,
    clearPasswordRecovery,
    sendPasswordResetEmail,
    updatePassword,
  } = useAuth();

  // Primary mode state
  const [mode, setMode] = useState<AuthScreenMode>(
    isPasswordRecovery ? 'reset_password' : initialMode
  );

  // Email form visibility toggle in Sign In mode
  // If user opens sign-in, email flow can be expanded or visible
  const [showEmailForm, setShowEmailForm] = useState<boolean>(false);

  // Form input states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  // Feedback messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState<boolean>(false);

  // Synchronous hardware ref to prevent double submissions, duplicate clicks, or enter-key races
  const isSubmittingRef = useRef(false);

  const isAnyLoading = loading || googleLoading || passkeyLoading;

  // React to password recovery trigger from URL or AuthContext
  useEffect(() => {
    if (isPasswordRecovery) {
      setMode('reset_password');
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isPasswordRecovery]);

  // Handle Google OAuth
  const handleGoogleSignIn = async () => {
    if (isSubmittingRef.current || isAnyLoading) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    clearOauthError();

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setErrorMessage("You're offline. Please reconnect to continue.");
      return;
    }

    isSubmittingRef.current = true;
    setGoogleLoading(true);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMessage(formatAuthErrorMessage(error));
      }
    } catch (err: unknown) {
      setErrorMessage(formatAuthErrorMessage(err));
    } finally {
      isSubmittingRef.current = false;
      setGoogleLoading(false);
    }
  };

  // Handle Native Supabase Passkey
  const handlePasskeySignIn = async () => {
    if (isSubmittingRef.current || isAnyLoading) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    clearOauthError();

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setErrorMessage("You're offline. Please reconnect to continue.");
      return;
    }

    if (!isPasskeySupported()) {
      setErrorMessage(
        'Passkeys are not supported on this browser or device. Please continue with Email or Google.'
      );
      return;
    }

    isSubmittingRef.current = true;
    setPasskeyLoading(true);

    try {
      const { error } = await signInWithPasskey();
      if (error) {
        setErrorMessage(formatAuthErrorMessage(error));
        return;
      }

      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      setErrorMessage(formatAuthErrorMessage(err));
    } finally {
      isSubmittingRef.current = false;
      setPasskeyLoading(false);
    }
  };

  // Handle Email Sign In or Create Account
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || isAnyLoading) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setErrorMessage(
        mode === 'signup'
          ? "You're offline. Please reconnect to create your account."
          : "You're offline. Please reconnect to sign in."
      );
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = fullName.trim();
    const trimmedPhone = phoneNumber.trim();

    if (mode === 'signup') {
      if (!trimmedName) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (!trimmedEmail) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
      if (!trimmedPhone) {
        setErrorMessage('Please enter your phone number.');
        return;
      }
      const validation = validatePhoneNumber(trimmedPhone);
      if (!validation.valid) {
        setErrorMessage(
          validation.reason || 'Please enter a valid phone number (e.g. +92 300 1234567).'
        );
        return;
      }
      if (!password || password.length < 6) {
        setErrorMessage('Please choose a stronger password (at least 6 characters).');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify both password fields.');
        return;
      }
    } else if (mode === 'signin') {
      if (!trimmedEmail || !password) {
        setErrorMessage('Please enter your email and password.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
    }

    isSubmittingRef.current = true;
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await signUp(trimmedEmail, password, trimmedName, trimmedPhone);
        if (error) {
          setErrorMessage(formatAuthErrorMessage(error));
          return;
        }
        setSuccessMessage('Account created successfully!');
      } else {
        const { error } = await signIn(trimmedEmail, password);
        if (error) {
          setErrorMessage(formatAuthErrorMessage(error));
          return;
        }
        setSuccessMessage('Signed in successfully!');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      setErrorMessage(formatAuthErrorMessage(err));
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  // Handle Forgot Password submission
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || isAnyLoading) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address to reset your password.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);

    try {
      const { error } = await sendPasswordResetEmail(trimmedEmail);
      if (error) {
        setErrorMessage(formatAuthErrorMessage(error));
        return;
      }
      setResetEmailSent(true);
      setSuccessMessage(
        `Reset link sent! Please check your inbox at ${trimmedEmail} for instructions to choose a new password.`
      );
    } catch (err: unknown) {
      setErrorMessage(formatAuthErrorMessage(err));
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  // Handle Reset Password (setting new password after clicking email link)
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || isAnyLoading) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Please enter a new password of at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New passwords do not match. Please verify both fields.');
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);

    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        setErrorMessage(formatAuthErrorMessage(error));
        return;
      }
      clearPasswordRecovery();
      setSuccessMessage('Password updated successfully! Redirecting to your lists...');
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          setMode('signin');
          setShowEmailForm(true);
        }
      }, 1000);
    } catch (err: unknown) {
      setErrorMessage(formatAuthErrorMessage(err));
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  // Switch to Forgot Password
  const handleOpenForgotPassword = () => {
    setMode('forgot_password');
    setErrorMessage(null);
    setSuccessMessage(null);
    setResetEmailSent(false);
    clearOauthError();
  };

  // Return to Sign In
  const handleBackToSignIn = () => {
    setMode('signin');
    setErrorMessage(null);
    setSuccessMessage(null);
    clearOauthError();
    clearPasswordRecovery();
  };

  // Switch between Sign In and Create Account
  const handleSwitchTab = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
    clearOauthError();
    if (newMode === 'signin') {
      setShowEmailForm(false);
    }
  };

  // Display error message (combining local errorMessage and oauthError)
  const displayedError = errorMessage || oauthError;

  return (
    <main
      id="auth_screen_container"
      className="min-h-screen bg-background flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 select-none"
    >
      <div
        id="auth_card"
        className="w-full max-w-md md:max-w-lg lg:max-w-md bg-surface-container-lowest rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl border border-surface-dim space-y-6 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center mb-1">
            <img
              src={APP_IMAGES.logoTransparent}
              alt="YAAD Logo"
              className="w-14 h-14 object-contain drop-shadow-sm"
            />
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl text-primary tracking-tight">
            {mode === 'signin' && (t('auth.signInTitle') || 'Welcome to YAAD')}
            {mode === 'signup' && (t('auth.signUpTitle') || 'Create Account')}
            {mode === 'forgot_password' && 'Reset Password'}
            {mode === 'reset_password' && 'Set New Password'}
          </h1>
          <p className="font-['Manrope'] text-xs text-on-surface-variant leading-relaxed">
            {mode === 'signin' &&
              (t('auth.signInSubtitle') || 'Sign in to access and synchronize your shopping lists.')}
            {mode === 'signup' &&
              (t('auth.signUpSubtitle') || 'Join YAAD to keep your grocery lists organized and synchronized.')}
            {mode === 'forgot_password' &&
              'Enter your email address and we will send you a link to reset your password.'}
            {mode === 'reset_password' &&
              'Choose a secure new password for your YAAD account.'}
          </p>
        </div>

        {/* Mode Navigation Tabs (Sign In / Create Account) */}
        {(mode === 'signin' || mode === 'signup') && (
          <div className="grid grid-cols-2 p-1 bg-surface-container rounded-2xl border border-surface-dim">
            <button
              id="auth_tab_signin"
              type="button"
              onClick={() => handleSwitchTab('signin')}
              disabled={isAnyLoading}
              className={`py-2.5 rounded-xl font-['Manrope'] text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signin'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t('auth.switchSignIn') || 'Sign In'}</span>
            </button>
            <button
              id="auth_tab_signup"
              type="button"
              onClick={() => handleSwitchTab('signup')}
              disabled={isAnyLoading}
              className={`py-2.5 rounded-xl font-['Manrope'] text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('auth.switchSignUp') || 'Create Account'}</span>
            </button>
          </div>
        )}

        {/* User-friendly Error Alert */}
        {displayedError && (
          <div
            id="auth_error_alert"
            className="p-3.5 bg-error-container/30 border border-error/30 rounded-2xl text-xs text-error font-['Manrope'] flex items-start gap-2.5 animate-in fade-in duration-150"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-error mt-0.5" />
            <div className="flex-1 leading-snug space-y-1">
              <span>{displayedError}</span>
              {displayedError.includes('No passkey') && (
                <p className="text-[11px] text-on-surface-variant font-medium pt-1">
                  Tip: Choose <strong>Continue with Google</strong> or <strong>Continue with Email</strong> to proceed.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Friendly Success Alert */}
        {successMessage && (
          <div
            id="auth_success_alert"
            className="p-3.5 bg-primary/10 border border-primary/20 rounded-2xl text-xs text-primary font-['Manrope'] flex items-start gap-2.5 animate-in fade-in duration-150"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-primary mt-0.5" />
            <div className="flex-1 leading-snug">
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {/* ----------------- SIGN IN VIEW ----------------- */}
        {mode === 'signin' && (
          <div className="space-y-4">
            {/* Primary Options in Clean Hierarchy */}
            <div className="space-y-2.5">
              {/* Option 1: Continue with Google */}
              <button
                id="auth_google_btn"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isAnyLoading}
                className="w-full h-12 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface font-['Manrope'] text-xs font-bold transition-all flex items-center justify-center gap-2.5 shadow-2xs hover:shadow-xs active:scale-[0.99] disabled:opacity-60"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <Globe className="w-4 h-4 text-primary" />
                )}
                <span>1. {t('auth.googleBtn') || 'Continue with Google'}</span>
              </button>

              {/* Option 2: Continue with Passkey */}
              <button
                id="auth_passkey_btn"
                type="button"
                onClick={handlePasskeySignIn}
                disabled={isAnyLoading}
                className="w-full h-12 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface font-['Manrope'] text-xs font-bold transition-all flex items-center justify-center gap-2.5 shadow-2xs hover:shadow-xs active:scale-[0.99] disabled:opacity-60"
              >
                {passkeyLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <Fingerprint className="w-4 h-4 text-primary" />
                )}
                <span>2. {t('auth.passkeyBtn') || 'Continue with Passkey'}</span>
              </button>

              {/* Option 3: Continue with Email */}
              {!showEmailForm && (
                <button
                  id="auth_email_toggle_btn"
                  type="button"
                  onClick={() => {
                    setShowEmailForm(true);
                    setErrorMessage(null);
                  }}
                  disabled={isAnyLoading}
                  className="w-full h-12 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface font-['Manrope'] text-xs font-bold transition-all flex items-center justify-center gap-2.5 shadow-2xs hover:shadow-xs active:scale-[0.99] disabled:opacity-60"
                >
                  <Mail className="w-4 h-4 text-primary" />
                  <span>3. Continue with Email</span>
                </button>
              )}
            </div>

            {/* Email Flow (Expanded) */}
            {showEmailForm && (
              <div className="space-y-3.5 pt-2 animate-in fade-in duration-200">
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-surface-dim w-full" />
                  <span className="bg-surface-container-lowest px-3 text-[11px] font-['Manrope'] font-medium text-outline uppercase tracking-wider shrink-0">
                    Email Sign In
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Email Input */}
                  <div className="space-y-1">
                    <label
                      htmlFor="auth_input_email"
                      className="text-xs font-bold text-on-surface-variant block font-['Manrope']"
                    >
                      {t('auth.emailLabel') || 'Email Address'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-outline absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="auth_input_email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        disabled={isAnyLoading}
                        className="w-full h-11 bg-surface-container text-on-surface text-sm rounded-2xl ps-10 pe-3.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline font-['Manrope'] disabled:opacity-60"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input with Show/Hide & Forgot Password */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label
                        htmlFor="auth_input_password"
                        className="text-xs font-bold text-on-surface-variant block font-['Manrope']"
                      >
                        {t('auth.passwordLabel') || 'Password'}
                      </label>
                      <button
                        id="auth_forgot_password_link"
                        type="button"
                        onClick={handleOpenForgotPassword}
                        disabled={isAnyLoading}
                        className="text-xs font-semibold text-primary hover:underline transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-outline absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="auth_input_password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={isAnyLoading}
                        className="w-full h-11 bg-surface-container text-on-surface text-sm rounded-2xl ps-10 pe-11 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline font-['Manrope'] disabled:opacity-60"
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Sign In Primary Action */}
                  <button
                    id="auth_submit_btn"
                    type="submit"
                    disabled={isAnyLoading}
                    className="w-full h-12 rounded-full bg-primary text-on-primary font-['Manrope'] text-sm font-bold shadow-md hover:bg-primary-container hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.99] mt-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Sign In</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Quick Switcher to Create Account */}
            <div className="pt-2 text-center text-xs text-on-surface-variant font-['Manrope']">
              <span>Don't have an account? </span>
              <button
                type="button"
                onClick={() => handleSwitchTab('signup')}
                className="font-bold text-primary hover:underline"
              >
                Create account
              </button>
            </div>
          </div>
        )}

        {/* ----------------- CREATE ACCOUNT VIEW ----------------- */}
        {mode === 'signup' && (
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name Input */}
              <div className="space-y-1">
                <label
                  htmlFor="auth_input_fullname"
                  className="text-xs font-bold text-on-surface-variant block font-['Manrope']"
                >
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-outline absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="auth_input_fullname"
                    type="text"
                    dir="auto"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    disabled={isAnyLoading}
                    className="w-full h-11 bg-surface-container text-on-surface text-sm rounded-2xl ps-10 pe-3.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline font-['Manrope'] disabled:opacity-60"
                    required
                  />
                </div>
              </div>

              {/* Email Address Input */}
              <div className="space-y-1">
                <label
                  htmlFor="auth_input_email"
                  className="text-xs font-bold text-on-surface-variant block font-['Manrope']"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-outline absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="auth_input_email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={isAnyLoading}
                    className="w-full h-11 bg-surface-container text-on-surface text-sm rounded-2xl ps-10 pe-3.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline font-['Manrope'] disabled:opacity-60"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Phone Number Input */}
              <div className="space-y-1">
                <label
                  htmlFor="auth_input_phone"
                  className="text-xs font-bold text-on-surface-variant block font-['Manrope']"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-outline absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="auth_input_phone"
                    type="tel"
                    dir="ltr"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+92 300 1234567"
                    disabled={isAnyLoading}
                    className="w-full h-11 bg-surface-container text-on-surface text-sm rounded-2xl ps-10 pe-3.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline font-['Manrope'] disabled:opacity-60"
                    autoComplete="tel"
                    required
                  />
                </div>
              </div>

              {/* Password Input with Show/Hide & Validation */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="auth_input_password"
                    className="text-xs font-bold text-on-surface-variant block font-['Manrope']"
                  >
                    Password
                  </label>
                  {password.length >= 6 && (
                    <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                      <Check className="w-3 h-3" /> Valid length
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-outline absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="auth_input_password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    disabled={isAnyLoading}
                    className="w-full h-11 bg-surface-container text-on-surface text-sm rounded-2xl ps-10 pe-11 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline font-['Manrope'] disabled:opacity-60"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input with Match Validation */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="auth_input_confirm_password"
                    className="text-xs font-bold text-on-surface-variant block font-['Manrope']"
                  >
                    Confirm Password
                  </label>
                  {confirmPassword && password === confirmPassword && (
                    <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                      <Check className="w-3 h-3" /> Passwords match
                    </span>
                  )}
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-outline absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="auth_input_confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    disabled={isAnyLoading}
                    className={`w-full h-11 bg-surface-container text-on-surface text-sm rounded-2xl ps-10 pe-11 border focus:ring-2 outline-none transition-all placeholder:text-outline font-['Manrope'] disabled:opacity-60 ${
                      confirmPassword && password !== confirmPassword
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

              {/* Create Account Action */}
              <button
                id="auth_submit_btn"
                type="submit"
                disabled={isAnyLoading}
                className="w-full h-12 rounded-full bg-primary text-on-primary font-['Manrope'] text-sm font-bold shadow-md hover:bg-primary-container hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.99] mt-3"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Google sign-up alternative */}
            <div className="relative flex items-center justify-center pt-1">
              <div className="border-t border-surface-dim w-full" />
              <span className="bg-surface-container-lowest px-3 text-[11px] font-['Manrope'] font-medium text-outline uppercase tracking-wider shrink-0">
                or sign up with Google
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isAnyLoading}
              className="w-full h-11 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface font-['Manrope'] text-xs font-bold transition-all flex items-center justify-center gap-2.5 shadow-2xs hover:shadow-xs active:scale-[0.99] disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              ) : (
                <Globe className="w-4 h-4 text-primary" />
              )}
              <span>Continue with Google</span>
            </button>

            {/* Switch to Sign In */}
            <div className="pt-2 text-center text-xs text-on-surface-variant font-['Manrope']">
              <span>Already have an account? </span>
              <button
                type="button"
                onClick={() => handleSwitchTab('signin')}
                className="font-bold text-primary hover:underline"
              >
                Sign in
              </button>
            </div>
          </div>
        )}

        {/* ----------------- FORGOT PASSWORD VIEW ----------------- */}
        {mode === 'forgot_password' && (
          <div className="space-y-4">
            {!resetEmailSent ? (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label
                    htmlFor="auth_forgot_email"
                    className="text-xs font-bold text-on-surface-variant block font-['Manrope']"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-outline absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="auth_forgot_email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      disabled={isAnyLoading}
                      className="w-full h-11 bg-surface-container text-on-surface text-sm rounded-2xl ps-10 pe-3.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline font-['Manrope'] disabled:opacity-60"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <button
                  id="auth_send_reset_btn"
                  type="submit"
                  disabled={isAnyLoading}
                  className="w-full h-12 rounded-full bg-primary text-on-primary font-['Manrope'] text-sm font-bold shadow-md hover:bg-primary-container hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Send Reset Email</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="p-4 bg-surface-container rounded-2xl border border-surface-dim text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-primary">
                    Check your email
                  </h3>
                  <p className="font-['Manrope'] text-xs text-on-surface-variant leading-relaxed">
                    We sent a password reset link to <strong>{email.trim()}</strong>. Click the link
                    in the email to set your new password.
                  </p>
                </div>
              </div>
            )}

            <button
              id="auth_back_to_signin_btn"
              type="button"
              onClick={handleBackToSignIn}
              disabled={isAnyLoading}
              className="w-full h-10 rounded-2xl text-xs font-['Manrope'] font-semibold text-outline hover:text-on-surface flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        )}

        {/* ----------------- RESET PASSWORD VIEW ----------------- */}
        {mode === 'reset_password' && (
          <div className="space-y-4">
            <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
              {/* New Password */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="auth_input_new_password"
                    className="text-xs font-bold text-on-surface-variant block font-['Manrope']"
                  >
                    New Password
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
                    id="auth_input_new_password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    disabled={isAnyLoading}
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

              {/* Confirm New Password */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="auth_input_confirm_new_password"
                    className="text-xs font-bold text-on-surface-variant block font-['Manrope']"
                  >
                    Confirm New Password
                  </label>
                  {confirmNewPassword && newPassword === confirmNewPassword && (
                    <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                      <Check className="w-3 h-3" /> Passwords match
                    </span>
                  )}
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-outline absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="auth_input_confirm_new_password"
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    disabled={isAnyLoading}
                    className={`w-full h-11 bg-surface-container text-on-surface text-sm rounded-2xl ps-10 pe-11 border focus:ring-2 outline-none transition-all placeholder:text-outline font-['Manrope'] disabled:opacity-60 ${
                      confirmNewPassword && newPassword !== confirmNewPassword
                        ? 'border-error/60 focus:border-error focus:ring-error/20'
                        : 'border-outline-variant focus:border-primary focus:ring-primary/20'
                    }`}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    aria-label={showConfirmNewPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 transition-colors"
                  >
                    {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="auth_update_password_btn"
                type="submit"
                disabled={isAnyLoading}
                className="w-full h-12 rounded-full bg-primary text-on-primary font-['Manrope'] text-sm font-bold shadow-md hover:bg-primary-container hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.99] mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </form>

            <button
              type="button"
              onClick={handleBackToSignIn}
              disabled={isAnyLoading}
              className="w-full h-10 rounded-2xl text-xs font-['Manrope'] font-semibold text-outline hover:text-on-surface flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        )}

        {/* Security Assurance Footer */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-on-surface-variant font-['Manrope'] text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Secure authentication via Supabase.</span>
        </div>

        {/* Separate Legal Links */}
        <div className="pt-2 border-t border-surface-dim/60 text-center space-y-1.5 text-[11px] text-outline">
          <p>
            By continuing, you agree to YAAD's{' '}
            <button
              type="button"
              onClick={() => onOpenLegalPage?.('terms')}
              className="font-bold text-primary hover:underline inline"
            >
              Terms & Conditions
            </button>{' '}
            and{' '}
            <button
              type="button"
              onClick={() => onOpenLegalPage?.('privacy')}
              className="font-bold text-primary hover:underline inline"
            >
              Privacy Policy
            </button>
            .
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onOpenLegalPage?.('about')}
              className="hover:text-on-surface transition-colors hover:underline"
            >
              About YAAD (/about)
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onOpenLegalPage?.('help')}
              className="hover:text-on-surface transition-colors hover:underline"
            >
              Help & FAQ (/help)
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};
