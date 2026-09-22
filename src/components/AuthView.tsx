import React, { useState, useRef, useEffect } from 'react';
import {
  Lock,
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
  const { language, setLanguage } = useLanguage();
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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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
    const resolvedName = (fullName.trim() || `${firstName.trim()} ${lastName.trim()}`).trim();
    const trimmedPhone = phoneNumber.trim();

    // Offline detection
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (mode === 'signup') {
        if (!resolvedName) {
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
            fullName: resolvedName,
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
      if (!resolvedName) {
        setErrorMessage(language === 'ur' ? 'براہ کرم اپنا پورا نام درج کریں۔' : 'Please enter your name.');
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
        const { error } = await signUp(trimmedEmail, password, resolvedName, trimmedPhone);
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
      className="min-h-screen bg-[#e8eef2] flex flex-col justify-center items-center p-0 sm:p-4 md:p-6 select-none relative overflow-x-hidden"
    >
      {/* Ambient background blur spots for studio aesthetic on desktop/tablets */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#cbe3db]/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#fed7aa]/35 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Authenticated Frame: mimics modern mobile phone card */}
      <div
        id="auth_card"
        className="w-full sm:max-w-[420px] min-h-screen sm:min-h-0 bg-white sm:rounded-[40px] shadow-2xl overflow-hidden border border-white/70 relative flex flex-col transition-all duration-300"
      >
        {/* ============================================================== */}
        {/* 1. TOP HEADER BANNER (Organic artistic curves & display title) */}
        {/* ============================================================== */}
        <div className="relative w-full pt-8 pb-12 px-6 overflow-hidden bg-gradient-to-br from-[#E26A4F] via-[#DE6346] to-[#D05438]">
          {/* Golden-ochre organic orb on top-left */}
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-[#E5A83B] opacity-95 blur-[0.5px]" />
          
          {/* Sea-green/mint organic shape on bottom-right */}
          <div className="absolute -bottom-8 -right-8 w-44 h-44 rounded-full bg-[#48B89F] opacity-95 blur-[0.5px]" />

          {/* Deep green ambient shade for depth */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#0F3D2E]/10 pointer-events-none blur-xl" />

          {/* Subtle artistic paper texture dots */}
          <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:14px_14px]" />

          {/* Top Bar with YAAD Logo & Language Switcher */}
          <div className="relative z-10 flex items-center justify-between mb-5">
            {/* YAAD Logo Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xs">
              <img
                src={APP_IMAGES.logoTransparent}
                alt="YAAD"
                className="w-5 h-5 object-contain drop-shadow-xs"
              />
              <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-xs tracking-wider uppercase">
                YAAD | یاد
              </span>
            </div>

            {/* Language Selector */}
            <div className="inline-flex items-center bg-black/25 backdrop-blur-md rounded-full p-0.5 border border-white/20 text-[10px] font-['Manrope'] font-bold text-white">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded-full transition-all ${
                  language === 'en' ? 'bg-white text-neutral-900 shadow-xs' : 'hover:text-white/80'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ur')}
                className={`px-2 py-0.5 rounded-full transition-all font-urdu ${
                  language === 'ur' ? 'bg-white text-neutral-900 shadow-xs' : 'hover:text-white/80'
                }`}
              >
                اردو
              </button>
              <button
                type="button"
                onClick={() => setLanguage('roman-urdu')}
                className={`px-2 py-0.5 rounded-full transition-all ${
                  language === 'roman-urdu' ? 'bg-white text-neutral-900 shadow-xs' : 'hover:text-white/80'
                }`}
              >
                ROM
              </button>
            </div>
          </div>

          {/* Main Title Heading */}
          <div className="relative z-10 text-center px-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans'] drop-shadow-xs">
              {mode === 'signup' && (
                language === 'ur' ? 'نیا اکاؤنٹ بنائیں' : language === 'roman-urdu' ? 'Naya Account Banayein' : 'Create an account'
              )}
              {mode === 'signin' && (
                language === 'ur' ? 'خوش آمدید' : language === 'roman-urdu' ? 'Welcome Back' : 'Welcome back'
              )}
              {mode === 'forgot_password' && (
                language === 'ur' ? 'پاس ورڈ ری سیٹ کریں' : language === 'roman-urdu' ? 'Password Reset Karein' : 'Reset password'
              )}
              {mode === 'reset_password' && (
                language === 'ur' ? 'نیا پاس ورڈ درج کریں' : language === 'roman-urdu' ? 'Naya Password Likhein' : 'Set new password'
              )}
            </h1>
            <p className="text-white/90 text-xs font-['Manrope'] mt-1.5 font-medium max-w-xs mx-auto">
              {mode === 'signup' && (
                language === 'ur'
                  ? 'گھر کے راشن اور سمارٹ خریداری کے لیے ابھی شامل ہوں'
                  : 'Organize grocery lists and sync easily with family'
              )}
              {mode === 'signin' && (
                language === 'ur'
                  ? 'اپنی محفوظ کردہ لسٹ تک رسائی کے لیے سائن ان کریں'
                  : 'Sign in to access and sync your grocery lists'
              )}
              {mode === 'forgot_password' && (
                language === 'ur'
                  ? 'اپنا ای میل درج کریں، ہم ری سیٹ لنک ارسال کریں گے'
                  : 'Enter your email to receive recovery instructions'
              )}
              {mode === 'reset_password' && (
                language === 'ur'
                  ? 'اپنے اکاؤنٹ کے لیے نیا پاس ورڈ منتخب کریں'
                  : 'Choose a strong password to secure your account'
              )}
            </p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. ELEVATED WHITE CARD (Forms, Inputs, Google, Legal)          */}
        {/* ============================================================== */}
        <div className="-mt-6 relative z-10 bg-white rounded-t-[32px] sm:rounded-t-[36px] px-6 sm:px-7 pt-7 pb-8 space-y-4 flex-1 shadow-lg flex flex-col justify-between">
          <div className="space-y-4">
            {/* Feedback Notifications */}
            {displayedError && (
              <div
                role="alert"
                className="p-3 bg-red-50 text-red-700 text-xs rounded-2xl flex items-center gap-2.5 border border-red-200 animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span className="flex-1 font-['Manrope'] font-medium">{displayedError}</span>
              </div>
            )}

            {successMessage && (
              <div
                role="status"
                className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-2xl flex items-center gap-2.5 border border-emerald-200 animate-in fade-in"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="flex-1 font-['Manrope'] font-medium">{successMessage}</span>
              </div>
            )}

            {/* Google 1-Tap Sign In Pill Button (shown on signin and signup) */}
            {(mode === 'signin' || mode === 'signup') && (
              <>
                <button
                  id={mode === 'signup' ? 'signup_google_btn' : 'auth_google_btn'}
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isAnyLoading}
                  className="w-full h-12 rounded-full border border-neutral-200/90 bg-white hover:bg-neutral-50/80 text-neutral-800 font-['Manrope'] text-sm font-semibold transition-all flex items-center justify-center gap-3 shadow-2xs hover:shadow-xs active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {googleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-neutral-800" />
                  ) : (
                    <GoogleOfficialIcon className="w-5 h-5" />
                  )}
                  <span>
                    {language === 'ur'
                      ? 'گوگل کے ساتھ جاری رکھیں'
                      : language === 'roman-urdu'
                      ? 'Google se continue karein'
                      : 'Sign in with Google'}
                  </span>
                </button>

                {/* Subtle 'or' divider */}
                <div className="relative flex items-center justify-center py-0.5">
                  <div className="border-t border-neutral-200/90 w-full" />
                  <span className="bg-white px-3 text-xs font-medium text-neutral-400 font-['Manrope']">
                    {language === 'ur' ? 'یا' : 'or'}
                  </span>
                </div>
              </>
            )}

            {/* ----------------- SIGN UP FORM ----------------- */}
            {mode === 'signup' && (
              <form onSubmit={handleSubmit} className="space-y-3 font-['Manrope']">
                {/* First Name & Last Name (side by side, as in screenshot) */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <input
                      id="auth_input_first_name"
                      type="text"
                      value={firstName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFirstName(val);
                        setFullName(`${val} ${lastName}`.trim());
                      }}
                      placeholder={language === 'ur' ? 'پہلا نام' : 'First Name'}
                      disabled={isAnyLoading}
                      className="w-full h-12 bg-[#f3f4f6] text-neutral-800 text-sm font-medium rounded-2xl px-4 border border-transparent focus:bg-white focus:border-neutral-300 focus:ring-2 focus:ring-neutral-900/10 outline-none transition-all placeholder:text-neutral-400 disabled:opacity-60"
                      autoComplete="given-name"
                      required
                    />
                  </div>
                  <div>
                    <input
                      id="auth_input_last_name"
                      type="text"
                      value={lastName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLastName(val);
                        setFullName(`${firstName} ${val}`.trim());
                      }}
                      placeholder={language === 'ur' ? 'آخری نام' : 'Last Name'}
                      disabled={isAnyLoading}
                      className="w-full h-12 bg-[#f3f4f6] text-neutral-800 text-sm font-medium rounded-2xl px-4 border border-transparent focus:bg-white focus:border-neutral-300 focus:ring-2 focus:ring-neutral-900/10 outline-none transition-all placeholder:text-neutral-400 disabled:opacity-60"
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                {/* Phone Number (crucial for Pakistani shopping & WhatsApp sharing) */}
                <div>
                  <input
                    id="auth_input_phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={language === 'ur' ? 'فون نمبر (+92 300 1234567)' : 'Phone Number (+92 300 1234567)'}
                    disabled={isAnyLoading}
                    className="w-full h-12 bg-[#f3f4f6] text-neutral-800 text-sm font-medium rounded-2xl px-4 border border-transparent focus:bg-white focus:border-neutral-300 focus:ring-2 focus:ring-neutral-900/10 outline-none transition-all placeholder:text-neutral-400 disabled:opacity-60"
                    autoComplete="tel"
                    required
                  />
                </div>

                {/* Email Address */}
                <div>
                  <input
                    id="auth_input_email_signup"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={language === 'ur' ? 'ای میل ایڈریس' : 'Email'}
                    disabled={isAnyLoading}
                    className="w-full h-12 bg-[#f3f4f6] text-neutral-800 text-sm font-medium rounded-2xl px-4 border border-transparent focus:bg-white focus:border-neutral-300 focus:ring-2 focus:ring-neutral-900/10 outline-none transition-all placeholder:text-neutral-400 disabled:opacity-60"
                    autoComplete="email"
                    required
                  />
                </div>

                {/* Password with Eye Toggle */}
                <div className="relative">
                  <input
                    id="auth_input_password_signup"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={language === 'ur' ? 'پاس ورڈ (کم از کم 6 حروف)' : 'Password'}
                    disabled={isAnyLoading}
                    className="w-full h-12 bg-[#f3f4f6] text-neutral-800 text-sm font-medium rounded-2xl ps-4 pe-11 border border-transparent focus:bg-white focus:border-neutral-300 focus:ring-2 focus:ring-neutral-900/10 outline-none transition-all placeholder:text-neutral-400 disabled:opacity-60"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1.5 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Primary Action Button (Solid Black Pill) */}
                <button
                  id="auth_submit_btn"
                  type="submit"
                  disabled={isAnyLoading}
                  className="w-full h-12 rounded-full bg-neutral-900 hover:bg-black text-white font-['Manrope'] text-sm font-bold tracking-tight shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.99] mt-3 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <span>{language === 'ur' ? 'اکاؤنٹ بنائیں' : 'Create account'}</span>
                  )}
                </button>
              </form>
            )}

            {/* ----------------- SIGN IN FORM ----------------- */}
            {mode === 'signin' && (
              <form onSubmit={handleSubmit} className="space-y-3 font-['Manrope']">
                {/* Email Address */}
                <div>
                  <input
                    id="auth_input_email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={language === 'ur' ? 'ای میل ایڈریس' : 'Email'}
                    disabled={isAnyLoading}
                    className="w-full h-12 bg-[#f3f4f6] text-neutral-800 text-sm font-medium rounded-2xl px-4 border border-transparent focus:bg-white focus:border-neutral-300 focus:ring-2 focus:ring-neutral-900/10 outline-none transition-all placeholder:text-neutral-400 disabled:opacity-60"
                    autoComplete="email"
                    required
                  />
                </div>

                {/* Password with Eye Toggle */}
                <div className="relative">
                  <input
                    id="auth_input_password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={language === 'ur' ? 'پاس ورڈ' : 'Password'}
                    disabled={isAnyLoading}
                    className="w-full h-12 bg-[#f3f4f6] text-neutral-800 text-sm font-medium rounded-2xl ps-4 pe-11 border border-transparent focus:bg-white focus:border-neutral-300 focus:ring-2 focus:ring-neutral-900/10 outline-none transition-all placeholder:text-neutral-400 disabled:opacity-60"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1.5 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Forgot Password link (placed right below password) */}
                <div className="flex justify-end pt-0.5">
                  <button
                    id="auth_forgot_password_btn"
                    type="button"
                    onClick={handleOpenForgotPassword}
                    className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 hover:underline font-['Manrope'] transition-colors cursor-pointer"
                  >
                    {language === 'ur'
                      ? 'پاس ورڈ بھول گئے؟'
                      : language === 'roman-urdu'
                      ? 'Password bhool gaye?'
                      : 'Forgot password?'}
                  </button>
                </div>

                {/* Primary Action Button (Solid Black Pill) */}
                <button
                  id="auth_submit_btn"
                  type="submit"
                  disabled={isAnyLoading}
                  className="w-full h-12 rounded-full bg-neutral-900 hover:bg-black text-white font-['Manrope'] text-sm font-bold tracking-tight shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.99] mt-3 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <span>{language === 'ur' ? 'سائن ان کریں' : 'Sign in'}</span>
                  )}
                </button>
              </form>
            )}

            {/* ----------------- FORGOT PASSWORD FORM ----------------- */}
            {mode === 'forgot_password' && (
              <div className="space-y-4 font-['Manrope']">
                {!resetEmailSent ? (
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-3.5">
                    <div>
                      <input
                        id="auth_forgot_email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={language === 'ur' ? 'ای میل ایڈریس' : 'Email Address'}
                        disabled={isAnyLoading}
                        className="w-full h-12 bg-[#f3f4f6] text-neutral-800 text-sm font-medium rounded-2xl px-4 border border-transparent focus:bg-white focus:border-neutral-300 focus:ring-2 focus:ring-neutral-900/10 outline-none transition-all placeholder:text-neutral-400 disabled:opacity-60"
                        autoComplete="email"
                        required
                      />
                    </div>

                    <button
                      id="auth_forgot_submit_btn"
                      type="submit"
                      disabled={isAnyLoading}
                      className="w-full h-12 rounded-full bg-neutral-900 hover:bg-black text-white font-['Manrope'] text-sm font-bold tracking-tight shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <span>{language === 'ur' ? 'ری سیٹ لنک بھیجیں' : 'Send reset link'}</span>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-4 space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <p className="font-['Manrope'] text-xs text-neutral-700">
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
                  className="w-full h-10 rounded-2xl text-xs font-['Manrope'] font-semibold text-neutral-500 hover:text-neutral-900 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{language === 'ur' ? 'سائن ان پر واپس جائیں' : 'Back to sign in'}</span>
                </button>
              </div>
            )}

            {/* ----------------- RESET PASSWORD FORM ----------------- */}
            {mode === 'reset_password' && (
              <div className="space-y-4 font-['Manrope']">
                {!resetSuccess ? (
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                    <div className="relative">
                      <input
                        id="auth_input_new_password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={language === 'ur' ? 'نیا پاس ورڈ (کم از کم 6 حروف)' : 'New password (min. 6 characters)'}
                        disabled={isAnyLoading}
                        className="w-full h-12 bg-[#f3f4f6] text-neutral-800 text-sm font-medium rounded-2xl ps-4 pe-11 border border-transparent focus:bg-white focus:border-neutral-300 focus:ring-2 focus:ring-neutral-900/10 outline-none transition-all placeholder:text-neutral-400 disabled:opacity-60"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1.5 transition-colors cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        id="auth_input_confirm_new_password"
                        type={showConfirmNewPassword ? 'text' : 'password'}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder={language === 'ur' ? 'پاس ورڈ کی تصدیق کریں' : 'Confirm new password'}
                        disabled={isAnyLoading}
                        className="w-full h-12 bg-[#f3f4f6] text-neutral-800 text-sm font-medium rounded-2xl ps-4 pe-11 border border-transparent focus:bg-white focus:border-neutral-300 focus:ring-2 focus:ring-neutral-900/10 outline-none transition-all placeholder:text-neutral-400 disabled:opacity-60"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        aria-label={showConfirmNewPassword ? 'Hide password' : 'Show password'}
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1.5 transition-colors cursor-pointer"
                      >
                        {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <button
                      id="auth_update_password_btn"
                      type="submit"
                      disabled={isAnyLoading || newPassword.length < 6 || newPassword !== confirmNewPassword}
                      className="w-full h-12 rounded-full bg-neutral-900 hover:bg-black text-white font-['Manrope'] text-sm font-bold tracking-tight shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.99] mt-2 cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <span>{language === 'ur' ? 'نیا پاس ورڈ محفوظ کریں' : 'Save new password'}</span>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-4 space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <p className="font-['Manrope'] text-xs text-neutral-700">
                      {language === 'ur' ? 'پاس ورڈ کامیابی سے تبدیل ہو گیا ہے۔' : 'Password updated successfully!'}
                    </p>
                  </div>
                )}

                {!resetSuccess && (
                  <button
                    type="button"
                    onClick={handleBackToSignIn}
                    disabled={isAnyLoading}
                    className="w-full h-10 rounded-2xl text-xs font-['Manrope'] font-semibold text-neutral-500 hover:text-neutral-900 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{language === 'ur' ? 'سائن ان پر واپس جائیں' : 'Back to sign in'}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* 3. LEGAL & BOTTOM SWITCHER (Terms & Privacy + Log In Switch)   */}
          {/* ============================================================== */}
          <div className="pt-5 space-y-3 font-['Manrope']">
            {/* Legal note matching the screenshot style */}
            <p className="text-center text-[11px] sm:text-xs text-neutral-500 font-normal leading-relaxed">
              {language === 'ur' ? (
                <>
                  اکاؤنٹ بنا کر آپ YAAD کے{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegalPage?.('privacy')}
                    className="font-medium text-neutral-800 underline hover:text-black cursor-pointer"
                  >
                    پرائیویسی پالیسی
                  </button>{' '}
                  اور{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegalPage?.('terms')}
                    className="font-medium text-neutral-800 underline hover:text-black cursor-pointer"
                  >
                    شرائط
                  </button>{' '}
                  سے اتفاق کرتے ہیں۔
                </>
              ) : (
                <>
                  Signing up for a YAAD account means you agree to the{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegalPage?.('privacy')}
                    className="font-medium text-neutral-800 underline hover:text-black cursor-pointer"
                  >
                    Privacy Policy
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegalPage?.('terms')}
                    className="font-medium text-neutral-800 underline hover:text-black cursor-pointer"
                  >
                    Terms of Service
                  </button>
                  .
                </>
              )}
            </p>

            {/* Bottom Switcher: "Have an account? Log in here" or "Don't have an account? Sign up" */}
            <div className="text-center text-xs text-neutral-600 font-medium">
              {mode === 'signup' ? (
                <>
                  <span>{language === 'ur' ? 'پہلے سے اکاؤنٹ ہے؟ ' : 'Have an account? '}</span>
                  <button
                    type="button"
                    onClick={() => handleSwitchTab('signin')}
                    className="font-bold text-neutral-900 underline hover:text-black cursor-pointer"
                  >
                    {language === 'ur' ? 'یہاں لاگ ان کریں' : 'Log in here'}
                  </button>
                </>
              ) : (
                <>
                  <span>{language === 'ur' ? 'اکاؤنٹ نہیں ہے؟ ' : "Don't have an account? "}</span>
                  <button
                    type="button"
                    onClick={() => handleSwitchTab('signup')}
                    className="font-bold text-neutral-900 underline hover:text-black cursor-pointer"
                  >
                    {language === 'ur' ? 'نیا اکاؤنٹ بنائیں' : 'Sign up'}
                  </button>
                </>
              )}
            </div>

            {/* Secondary footer link to Rashan list */}
            <div className="pt-1 flex items-center justify-center gap-3 text-[11px] text-neutral-400">
              <button
                type="button"
                onClick={() => onOpenLegalPage?.('help')}
                className="hover:text-neutral-700 transition-colors cursor-pointer"
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
                className="hover:text-neutral-700 transition-colors cursor-pointer"
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
      </div>
    </main>
  );
};

