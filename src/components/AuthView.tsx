import React, { useState, useRef } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  LogIn,
  UserPlus,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Fingerprint,
  Globe,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { APP_IMAGES } from '../data/initialData';
import { formatAuthErrorMessage } from '../lib/supabase';
import { isPasskeySupported } from '../lib/passkey';
import { validatePhoneNumber } from '../utils/phone';

interface AuthViewProps {
  initialMode?: 'signin' | 'signup';
  onSuccess?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'signin',
  onSuccess,
}) => {
  const { t } = useLanguage();
  const { signIn, signUp, signInWithGoogle, signInWithPasskey, oauthError, clearOauthError } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);

  const isAnyLoading = loading || googleLoading || passkeyLoading;

  const handleGoogleSignIn = async () => {
    if (isSubmittingRef.current || isAnyLoading) return;
    setErrorMessage(null);
    clearOauthError();

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setErrorMessage(
        mode === 'signup'
          ? "You're offline. Please reconnect to create your account."
          : "You're offline. Please reconnect to sign in."
      );
      return;
    }

    isSubmittingRef.current = true;
    setGoogleLoading(true);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMessage(formatAuthErrorMessage(error));
      }
      // Note: In browser, OAuth redirects the page to Google auth endpoint
    } catch (err: unknown) {
      setErrorMessage(formatAuthErrorMessage(err));
    } finally {
      isSubmittingRef.current = false;
      setGoogleLoading(false);
    }
  };

  const handlePasskeySignIn = async () => {
    if (isSubmittingRef.current || isAnyLoading) return;
    setErrorMessage(null);
    clearOauthError();

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setErrorMessage(
        mode === 'signup'
          ? "You're offline. Please reconnect to create your account."
          : "You're offline. Please reconnect to sign in."
      );
      return;
    }

    if (!isPasskeySupported()) {
      setErrorMessage(
        t('auth.passkeyNotSupported') ||
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Hardware/ref lock to strictly prevent duplicate rapid submissions or Enter key double-firing
    if (isSubmittingRef.current || isAnyLoading) return;

    setErrorMessage(null);

    // Pre-flight offline verification
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
        setErrorMessage(t('profileSetup.nameRequired') || 'Please enter your full name.');
        return;
      }
      if (!trimmedEmail) {
        setErrorMessage(t('auth.invalidEmail') || 'Please enter a valid email address.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setErrorMessage(t('auth.invalidEmail') || 'Please enter a valid email address.');
        return;
      }
      if (!trimmedPhone) {
        setErrorMessage(t('auth.phoneRequired') || 'Please enter your phone number.');
        return;
      }
      const validation = validatePhoneNumber(trimmedPhone);
      if (!validation.valid) {
        setErrorMessage(validation.reason || t('auth.invalidPhone') || 'Please enter a valid phone number (e.g. +92 300 1234567).');
        return;
      }
      if (!password || password.length < 6) {
        setErrorMessage(t('auth.weakPassword') || 'Please choose a stronger password (at least 6 characters).');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify both password fields.');
        return;
      }
    } else {
      if (!trimmedEmail || !password) {
        setErrorMessage(t('auth.fillAllFields') || 'Please fill in all required fields.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setErrorMessage(t('auth.invalidEmail') || 'Please enter a valid email address.');
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
      } else {
        const { error } = await signIn(trimmedEmail, password);
        if (error) {
          setErrorMessage(formatAuthErrorMessage(error));
          return;
        }
      }

      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      setErrorMessage(formatAuthErrorMessage(err));
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <main
      id="auth_screen_container"
      className="min-h-screen bg-background flex flex-col justify-center items-center p-4 py-8 select-none"
    >
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-xl border border-surface-dim space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Logo & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center mb-1">
            <img
              src={APP_IMAGES.logoTransparent}
              alt="YAAD Logo"
              className="w-14 h-14 object-contain drop-shadow-sm"
            />
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl text-primary tracking-tight">
            {mode === 'signin'
              ? t('auth.signInTitle') || 'Welcome Back'
              : t('auth.signUpTitle') || 'Create Account'}
          </h1>
          <p className="font-['Manrope'] text-xs text-on-surface-variant leading-relaxed">
            {mode === 'signin'
              ? t('auth.signInSubtitle') || 'Sign in to access and sync your shopping lists.'
              : t('auth.signUpSubtitle') || 'Join YAAD to keep your grocery lists organized and synchronized.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-surface-container rounded-2xl border border-surface-dim">
          <button
            id="auth_tab_signin"
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage(null);
              clearOauthError();
            }}
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
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
              clearOauthError();
            }}
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

        {/* User-friendly Error Alert */}
        {(errorMessage || oauthError) && (
          <div
            id="auth_error_alert"
            className="p-3 bg-error-container/40 border border-error/30 rounded-2xl text-xs text-error font-['Manrope'] flex items-start gap-2.5 animate-in fade-in duration-150"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-error mt-0.5" />
            <div className="flex-1 leading-snug space-y-1">
              <span>{errorMessage || oauthError}</span>
              {(errorMessage || oauthError)?.includes('No passkey was found') && (
                <p className="text-[11px] text-on-surface-variant pt-0.5">
                  Choose <strong>Continue with Google</strong> or enter your email below.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Quick Auth Providers (Google & Passkey) */}
        <div className="space-y-2.5">
          {/* Continue with Google */}
          <button
            id="auth_google_btn"
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
            <span>{t('auth.googleBtn') || 'Continue with Google'}</span>
          </button>

          {/* Continue with Passkey */}
          <button
            id="auth_passkey_btn"
            type="button"
            onClick={handlePasskeySignIn}
            disabled={isAnyLoading}
            className="w-full h-11 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface font-['Manrope'] text-xs font-bold transition-all flex items-center justify-center gap-2.5 shadow-2xs hover:shadow-xs active:scale-[0.99] disabled:opacity-60"
          >
            {passkeyLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <Fingerprint className="w-4 h-4 text-primary" />
            )}
            <span>{t('auth.passkeyBtn') || 'Continue with Passkey'}</span>
          </button>
        </div>

        {/* Visual Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-surface-dim w-full" />
          <span className="bg-surface-container-lowest px-3 text-[11px] font-['Manrope'] font-medium text-outline uppercase tracking-wider shrink-0">
            {t('auth.orDivider') || 'or continue with email'}
          </span>
        </div>

        {/* Email & Password Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant block font-['Manrope']">
                {t('auth.fullNameLabel') || 'Full Name'}
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-outline absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="auth_input_fullname"
                  type="text"
                  dir="auto"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('auth.fullNamePlaceholder') || 'Your full name'}
                  disabled={isAnyLoading}
                  className="w-full h-11 bg-surface-container text-on-surface text-sm rounded-2xl ps-10 pe-3.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline font-['Manrope'] disabled:opacity-60"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant block font-['Manrope']">
              {t('auth.emailLabel') || 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-outline absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="auth_input_email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder') || 'you@example.com'}
                disabled={isAnyLoading}
                className="w-full h-11 bg-surface-container text-on-surface text-sm rounded-2xl ps-10 pe-3.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline font-['Manrope'] disabled:opacity-60"
                autoComplete="email"
                required
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant block font-['Manrope']">
                {t('auth.phoneLabel') || 'Phone Number'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-outline absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="auth_input_phone"
                  type="tel"
                  dir="ltr"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={t('auth.phonePlaceholder') || '+92 300 1234567'}
                  disabled={isAnyLoading}
                  className="w-full h-11 bg-surface-container text-on-surface text-sm rounded-2xl ps-10 pe-3.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline font-['Manrope'] disabled:opacity-60"
                  autoComplete="tel"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant block font-['Manrope']">
              {t('auth.passwordLabel') || 'Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-outline absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="auth_input_password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder') || '••••••••'}
                disabled={isAnyLoading}
                className="w-full h-11 bg-surface-container text-on-surface text-sm rounded-2xl ps-10 pe-3.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline font-['Manrope'] disabled:opacity-60"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant block font-['Manrope']">
                Confirm Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-outline absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="auth_input_confirm_password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  disabled={isAnyLoading}
                  className="w-full h-11 bg-surface-container text-on-surface text-sm rounded-2xl ps-10 pe-3.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline font-['Manrope'] disabled:opacity-60"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
          )}

          <button
            id="auth_submit_btn"
            type="submit"
            disabled={isAnyLoading}
            className="w-full h-12 rounded-full bg-primary text-on-primary font-['Manrope'] text-sm font-bold shadow-md hover:bg-primary-container hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.99] mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'signin' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>{t('auth.signInBtn') || 'Sign In'}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>{t('auth.signUpBtn') || 'Create Account'}</span>
              </>
            )}
          </button>
        </form>

        {/* Security Assurance Footer */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-on-surface-variant font-['Manrope'] text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>{t('auth.secureNote') || 'Securely authenticated via Supabase.'}</span>
        </div>
      </div>
    </main>
  );
};

