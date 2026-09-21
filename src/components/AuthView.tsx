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
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useAppRouter } from '../router/RouterContext';
import { APP_IMAGES } from '../data/initialData';
import { formatAuthErrorMessage } from '../lib/supabase';
import { validatePhoneNumber } from '../utils/phone';

// Official multi-color Google 'G' icon component
const GoogleOfficialIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5 shrink-0' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

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
  const { language, t } = useLanguage();
  const { navigate } = useAppRouter();
  const {
    signIn,
    signUp,
    startOfflineOnboarding,
    signInWithGoogle,
    oauthError,
    clearOauthError,
    isPasswordRecovery,
    passwordResetError,
    clearPasswordResetError,
    clearPasswordRecovery,
    sendPasswordResetEmail,
    updatePassword,
  } = useAuth();

  // Primary mode state: 'signin' | 'signup' | 'forgot_password' | 'reset_password'
  const [mode, setMode] = useState<AuthScreenMode>(
    isPasswordRecovery ? 'reset_password' : initialMode
  );

  // Form input states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Feedback messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  // Synchronous hardware ref to prevent double submissions or enter-key races
  const isSubmittingRef = useRef(false);
  const isAnyLoading = loading || googleLoading;

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
      setErrorMessage(
        language === 'ur'
          ? 'انٹرنیٹ کنکشن نہیں ہے۔ براہ کرم انٹرنیٹ بحال کر کے دوبارہ کوشش کریں۔'
          : language === 'roman-urdu'
          ? 'Internet connection nahi hai. Barah-e-karam internet connect karein.'
          : "You're offline. Please reconnect to continue."
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
    } catch (err: unknown) {
      setErrorMessage(formatAuthErrorMessage(err));
    } finally {
      isSubmittingRef.current = false;
      setGoogleLoading(false);
    }
  };

  // Handle Email Sign In or Create Account
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || isAnyLoading) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = fullName.trim();
    const trimmedPhone = phoneNumber.trim();

    // Offline detection
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (mode === 'signup') {
        if (!trimmedName) {
          setErrorMessage(language === 'ur' ? 'براہ کرم اپنا نام درج کریں۔' : 'Please enter your full name.');
          return;
        }
        if (!trimmedPhone) {
          setErrorMessage(language === 'ur' ? 'براہ کرم فون نمبر درج کریں۔' : 'Please enter your phone number.');
          return;
        }
        const validation = validatePhoneNumber(trimmedPhone);
        if (!validation.valid) {
          setErrorMessage(validation.reason || 'Please enter a valid phone number (e.g. +92 300 1234567).');
          return;
        }

        isSubmittingRef.current = true;
        setLoading(true);
        try {
          await startOfflineOnboarding({
            fullName: trimmedName,
            phoneNumber: trimmedPhone,
            language,
          });
          setSuccessMessage('Profile saved locally. Your shopping lists will sync automatically.');
          if (onSuccess) {
            onSuccess();
          }
          return;
        } catch (offlineErr) {
          setErrorMessage('Could not save local profile. Please try again.');
          return;
        } finally {
          isSubmittingRef.current = false;
          setLoading(false);
        }
      }

      setErrorMessage(
        language === 'ur'
          ? 'انٹرنیٹ کنکشن نہیں ہے۔ لاگ ان کے لیے انٹرنیٹ درکار ہے۔'
          : "You're offline. Please reconnect to sign in."
      );
      return;
    }

    // Sign Up Validation
    if (mode === 'signup') {
      if (!trimmedName) {
        setErrorMessage(language === 'ur' ? 'براہ کرم اپنا پورا نام درج کریں۔' : 'Please enter your full name.');
        return;
      }
      if (!trimmedPhone) {
        setErrorMessage(language === 'ur' ? 'براہ کرم فون نمبر درج کریں۔' : 'Please enter your phone number.');
        return;
      }
      const validation = validatePhoneNumber(trimmedPhone);
      if (!validation.valid) {
        setErrorMessage(validation.reason || 'Please enter a valid phone number (e.g. +92 300 1234567).');
        return;
      }
      if (!trimmedEmail) {
        setErrorMessage(language === 'ur' ? 'براہ کرم ای میل درج کریں۔' : 'Please enter your email address.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
      if (!password || password.length < 6) {
        setErrorMessage(
          language === 'ur'
            ? 'پاس ورڈ کم از کم 6 حروف پر مشتمل ہونا چاہیے۔'
            : 'Password must be at least 6 characters.'
        );
        return;
      }
    } else if (mode === 'signin') {
      if (!trimmedEmail || !password) {
        setErrorMessage(
          language === 'ur'
            ? 'براہ کرم ای میل اور پاس ورڈ درج کریں۔'
            : 'Please enter your email and password.'
        );
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
      setSuccessMessage(`Reset link sent! Please check ${trimmedEmail} for instructions.`);
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
      setResetSuccess(true);
      setSuccessMessage('Your password has been successfully changed.');
      setTimeout(() => {
        clearPasswordRecovery();
        if (onSuccess) {
          onSuccess();
        } else {
          setMode('signin');
        }
      }, 1200);
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
    clearPasswordResetError?.();
  };

  // Return to Sign In
  const handleBackToSignIn = () => {
    setMode('signin');
    setErrorMessage(null);
    setSuccessMessage(null);
    clearOauthError();
    clearPasswordResetError?.();
    clearPasswordRecovery();
  };

  // Switch between Sign In and Create Account
  const handleSwitchTab = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
    clearOauthError();
    clearPasswordResetError?.();
  };

  const displayedError = errorMessage || oauthError || passwordResetError;

  return (
    <main
      id="auth_screen_container"
      className="min-h-screen bg-background flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 select-none"
    >
      <div
        id="auth_card"
        className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-xl border border-surface-dim space-y-6 animate-in fade-in zoom-in-95 duration-200"
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
            YAAD | یاد
          </h1>
          <p className="font-['Manrope'] text-xs text-on-surface-variant">
            {mode === 'signin' && (
              language === 'ur'
                ? 'اپنے شاپنگ لسٹ تک رسائی کے لیے لاگ ان کریں'
                : language === 'roman-urdu'
                ? 'Apni shopping list ke liye Sign In karein'
                : 'Sign in to access and sync your shopping lists'
            )}
            {mode === 'signup' && (
              language === 'ur'
                ? 'شاپنگ لسٹ محفوظ رکھنے کے لیے نیا اکاؤنٹ بنائیں'
                : language === 'roman-urdu'
                ? 'Shopping list mehfooz karne ke liye naya account banayein'
                : 'Create an account to keep your lists organized'
            )}
            {mode === 'forgot_password' && (
              language === 'ur'
                ? 'پاس ورڈ ری سیٹ کے لیے اپنا ای میل درج کریں'
                : 'Enter your email to receive a password reset link'
            )}
            {mode === 'reset_password' && (
              language === 'ur'
                ? 'اپنا نیا پاس ورڈ منتخب کریں'
                : 'Enter your new password below'
            )}
          </p>
        </div>

        {/* Clean Mode Switcher Tabs (Sign In vs Create Account) */}
        {(mode === 'signin' || mode === 'signup') && (
          <div className="flex bg-surface-container p-1 rounded-2xl border border-surface-dim">
            <button
              id="auth_tab_signin"
              type="button"
              onClick={() => handleSwitchTab('signin')}
              className={`flex-1 py-2.5 text-xs font-['Manrope'] font-bold rounded-xl transition-all ${
                mode === 'signin'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              {language === 'ur' ? 'سائن ان' : 'Sign In'}
            </button>
            <button
              id="auth_tab_signup"
              type="button"
              onClick={() => handleSwitchTab('signup')}
              className={`flex-1 py-2.5 text-xs font-['Manrope'] font-bold rounded-xl transition-all ${
                mode === 'signup'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              {language === 'ur' ? 'نیا اکاؤنٹ' : 'Create Account'}
            </button>
          </div>
        )}

        {/* Concise Error Alert */}
        {displayedError && (
          <div
            role="alert"
            className="p-3.5 bg-error-container/80 text-on-error-container text-xs rounded-2xl flex items-center gap-2.5 border border-error/30 animate-in fade-in"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-error" />
            <span className="flex-1 font-['Manrope'] font-medium">{displayedError}</span>
          </div>
        )}

        {/* Concise Success Alert */}
        {successMessage && (
          <div
            role="status"
            className="p-3.5 bg-primary-container/80 text-on-primary-container text-xs rounded-2xl flex items-center gap-2.5 border border-primary/30 animate-in fade-in"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />
            <span className="flex-1 font-['Manrope'] font-medium">{successMessage}</span>
          </div>
        )}

        {/* ----------------- SIGN IN VIEW ----------------- */}
        {mode === 'signin' && (
          <div className="space-y-4">
            {/* 1-Tap Google Sign In with Official Logo */}
            <button
              id="auth_google_btn"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isAnyLoading}
              className="w-full h-12 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface font-['Manrope'] text-xs font-bold transition-all flex items-center justify-center gap-2.5 shadow-2xs hover:shadow-xs active:scale-[0.99] disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              ) : (
                <GoogleOfficialIcon className="w-5 h-5" />
              )}
              <span>
                {language === 'ur'
                  ? 'گوگل سے لاگ ان کریں'
                  : language === 'roman-urdu'
                  ? 'Google se Sign In karein'
                  : 'Continue with Google'}
              </span>
            </button>

            {/* Clean Divider */}
            <div className="relative flex items-center justify-center py-1">
              <div className="border-t border-surface-dim w-full" />
              <span className="bg-surface-container-lowest px-3 text-[11px] font-['Manrope'] font-medium text-outline uppercase tracking-wider shrink-0">
                {language === 'ur' ? 'یا ای میل سے' : 'or with email'}
              </span>
            </div>

            {/* Direct Email & Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label
                  htmlFor="auth_input_email"
                  className="text-xs font-bold text-on-surface-variant block font-['Manrope']"
                >
                  {language === 'ur' ? 'ای میل ایڈریس' : 'Email Address'}
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

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="auth_input_password"
                    className="text-xs font-bold text-on-surface-variant block font-['Manrope']"
                  >
                    {language === 'ur' ? 'پاس ورڈ' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={handleOpenForgotPassword}
                    className="text-xs text-primary font-bold hover:underline font-['Manrope']"
                  >
                    {language === 'ur' ? 'پاس ورڈ بھول گئے؟' : 'Forgot password?'}
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
                    <span>{language === 'ur' ? 'سائن ان کریں' : 'Sign In'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Switch to Sign Up */}
            <div className="pt-2 text-center text-xs text-on-surface-variant font-['Manrope']">
              <span>{language === 'ur' ? 'اکاؤنٹ نہیں ہے؟ ' : "Don't have an account? "}</span>
              <button
                type="button"
                onClick={() => handleSwitchTab('signup')}
                className="font-bold text-primary hover:underline"
              >
                {language === 'ur' ? 'نیا اکاؤنٹ بنائیں' : 'Create account'}
              </button>
            </div>
          </div>
        )}

        {/* ----------------- SIGN UP VIEW ----------------- */}
        {mode === 'signup' && (
          <div className="space-y-4">
            {/* 1-Tap Google Sign Up with Official Logo */}
            <button
              id="signup_google_btn"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isAnyLoading}
              className="w-full h-12 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface font-['Manrope'] text-xs font-bold transition-all flex items-center justify-center gap-2.5 shadow-2xs hover:shadow-xs active:scale-[0.99] disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              ) : (
                <GoogleOfficialIcon className="w-5 h-5" />
              )}
              <span>
                {language === 'ur'
                  ? 'گوگل سے اکاؤنٹ بنائیں'
                  : language === 'roman-urdu'
                  ? 'Google se Account banayein'
                  : 'Sign up with Google'}
              </span>
            </button>

            {/* Clean Divider */}
            <div className="relative flex items-center justify-center py-1">
              <div className="border-t border-surface-dim w-full" />
              <span className="bg-surface-container-lowest px-3 text-[11px] font-['Manrope'] font-medium text-outline uppercase tracking-wider shrink-0">
                {language === 'ur' ? 'یا ای میل سے' : 'or with email'}
              </span>
            </div>

            {/* Streamlined Sign Up Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Full Name */}
              <div className="space-y-1">
                <label
                  htmlFor="auth_input_name"
                  className="text-xs font-bold text-on-surface-variant block font-['Manrope']"
                >
                  {language === 'ur' ? 'پورا نام' : 'Full Name'}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-outline absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="auth_input_name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={language === 'ur' ? 'آپ کا نام' : 'Your Name'}
                    disabled={isAnyLoading}
                    className="w-full h-11 bg-surface-container text-on-surface text-sm rounded-2xl ps-10 pe-3.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline font-['Manrope'] disabled:opacity-60"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label
                  htmlFor="auth_input_phone"
                  className="text-xs font-bold text-on-surface-variant block font-['Manrope']"
                >
                  {language === 'ur' ? 'فون نمبر' : 'Phone Number'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-outline absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="auth_input_phone"
                    type="tel"
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

              {/* Email */}
              <div className="space-y-1">
                <label
                  htmlFor="auth_input_email_signup"
                  className="text-xs font-bold text-on-surface-variant block font-['Manrope']"
                >
                  {language === 'ur' ? 'ای میل ایڈریس' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-outline absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="auth_input_email_signup"
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

              {/* Password */}
              <div className="space-y-1">
                <label
                  htmlFor="auth_input_password_signup"
                  className="text-xs font-bold text-on-surface-variant block font-['Manrope']"
                >
                  {language === 'ur' ? 'پاس ورڈ (کم از کم 6 حروف)' : 'Password (min. 6 characters)'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-outline absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="auth_input_password_signup"
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

              {/* Submit Button */}
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
                    <span>{language === 'ur' ? 'اکاؤنٹ بنائیں' : 'Create Account'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Switch to Sign In */}
            <div className="pt-2 text-center text-xs text-on-surface-variant font-['Manrope']">
              <span>{language === 'ur' ? 'پہلے سے اکاؤنٹ موجود ہے؟ ' : 'Already have an account? '}</span>
              <button
                type="button"
                onClick={() => handleSwitchTab('signin')}
                className="font-bold text-primary hover:underline"
              >
                {language === 'ur' ? 'سائن ان کریں' : 'Sign in'}
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
                    {language === 'ur' ? 'ای میل ایڈریس' : 'Email Address'}
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
                  id="auth_forgot_submit_btn"
                  type="submit"
                  disabled={isAnyLoading}
                  className="w-full h-12 rounded-full bg-primary text-on-primary font-['Manrope'] text-sm font-bold shadow-md hover:bg-primary-container hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{language === 'ur' ? 'ری سیٹ لنک بھیجیں' : 'Send Reset Link'}</span>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-4 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
                <p className="font-['Manrope'] text-xs text-on-surface">
                  {language === 'ur'
                    ? 'ری سیٹ ای میل بھیج دی گئی ہے۔ براہ کرم اپنا ان باکس چیک کریں۔'
                    : 'A password reset link has been sent to your email.'}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleBackToSignIn}
              disabled={isAnyLoading}
              className="w-full h-10 rounded-2xl text-xs font-['Manrope'] font-semibold text-outline hover:text-on-surface flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'ur' ? 'سائن ان پر واپس جائیں' : 'Back to Sign In'}</span>
            </button>
          </div>
        )}

        {/* ----------------- RESET PASSWORD VIEW ----------------- */}
        {mode === 'reset_password' && (
          <div className="space-y-4">
            {!resetSuccess ? (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label
                    htmlFor="auth_input_new_password"
                    className="text-xs font-bold text-on-surface-variant block font-['Manrope']"
                  >
                    {language === 'ur' ? 'نیا پاس ورڈ' : 'New Password'}
                  </label>
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
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="auth_input_confirm_new_password"
                    className="text-xs font-bold text-on-surface-variant block font-['Manrope']"
                  >
                    {language === 'ur' ? 'پاس ورڈ کی تصدیق کریں' : 'Confirm New Password'}
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-outline absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="auth_input_confirm_new_password"
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      disabled={isAnyLoading}
                      className="w-full h-11 bg-surface-container text-on-surface text-sm rounded-2xl ps-10 pe-11 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline font-['Manrope'] disabled:opacity-60"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      aria-label={showConfirmNewPassword ? 'Hide password' : 'Show password'}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 transition-colors"
                    >
                      {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="auth_update_password_btn"
                  type="submit"
                  disabled={isAnyLoading || newPassword.length < 6 || newPassword !== confirmNewPassword}
                  className="w-full h-12 rounded-full bg-primary text-on-primary font-['Manrope'] text-sm font-bold shadow-md hover:bg-primary-container hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.99] mt-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>{language === 'ur' ? 'نیا پاس ورڈ محفوظ کریں' : 'Save New Password'}</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-4 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
                <p className="font-['Manrope'] text-xs text-on-surface">
                  {language === 'ur' ? 'پاس ورڈ کامیابی سے تبدیل ہو گیا ہے۔' : 'Password updated successfully!'}
                </p>
              </div>
            )}

            {!resetSuccess && (
              <button
                type="button"
                onClick={handleBackToSignIn}
                disabled={isAnyLoading}
                className="w-full h-10 rounded-2xl text-xs font-['Manrope'] font-semibold text-outline hover:text-on-surface flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{language === 'ur' ? 'سائن ان پر واپس جائیں' : 'Back to Sign In'}</span>
              </button>
            )}
          </div>
        )}

        {/* Clean Legal & Information Footer */}
        <div className="pt-2 border-t border-surface-dim/60 text-center space-y-1.5 text-[11px] text-outline font-['Manrope']">
          <p>
            By continuing, you agree to YAAD's{' '}
            <button
              type="button"
              onClick={() => onOpenLegalPage?.('terms')}
              className="font-bold text-primary hover:underline inline"
            >
              Terms
            </button>{' '}
            &{' '}
            <button
              type="button"
              onClick={() => onOpenLegalPage?.('privacy')}
              className="font-bold text-primary hover:underline inline"
            >
              Privacy
            </button>
            .
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <button
              type="button"
              onClick={() => onOpenLegalPage?.('help')}
              className="hover:text-on-surface transition-colors hover:underline"
            >
              Help & FAQ
            </button>
            <span>•</span>
            <a
              id="auth_footer_rashan_link"
              href={
                language === 'ur'
                  ? '/rashan-list?lang=ur'
                  : language === 'roman-urdu'
                  ? '/rashan-list?lang=roman-urdu'
                  : '/rashan-list'
              }
              onClick={(e) => {
                e.preventDefault();
                navigate(
                  language === 'ur'
                    ? '/rashan-list?lang=ur'
                    : language === 'roman-urdu'
                    ? '/rashan-list?lang=roman-urdu'
                    : '/rashan-list'
                );
              }}
              className="hover:text-on-surface transition-colors hover:underline"
            >
              {language === 'ur'
                ? 'ماہانہ راشن لسٹ'
                : language === 'roman-urdu'
                ? 'Mahana Rashan List'
                : 'Monthly Rashan List'}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
};
