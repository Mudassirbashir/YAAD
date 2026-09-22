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
  X,
  ArrowRight,
  Sparkles,
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

  // Controls bottom sheet pop-up visibility (starts closed unless password recovery)
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(isPasswordRecovery || false);

  // Synchronous hardware ref to prevent double submissions or enter-key races
  const isSubmittingRef = useRef(false);
  const isAnyLoading = loading || googleLoading;

  // React to password recovery trigger from URL or AuthContext
  useEffect(() => {
    if (isPasswordRecovery) {
      setMode('reset_password');
      setIsSheetOpen(true);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isPasswordRecovery]);

  const handleOpenSignInSheet = () => {
    setMode('signin');
    setErrorMessage(null);
    setSuccessMessage(null);
    clearOauthError();
    setIsSheetOpen(true);
  };

  const handleOpenSignUpSheet = () => {
    setMode('signup');
    setErrorMessage(null);
    setSuccessMessage(null);
    clearOauthError();
    setIsSheetOpen(true);
  };

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
      className="min-h-screen bg-[#F4F6F8] flex flex-col justify-between items-center px-4 py-6 sm:py-8 select-none relative overflow-hidden"
    >
      {/* Ambient background blur spots for studio aesthetic */}
      <div className="absolute top-0 left-10 w-96 h-96 bg-[#cbe3db]/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-[#fed7aa]/35 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#DE6346]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Top Bar with YAAD Logo & Language Switcher */}
      <header className="w-full max-w-md flex items-center justify-between z-10 pt-1">
        {/* YAAD Logo Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-neutral-200/80 text-neutral-900 shadow-2xs">
          <img
            src={APP_IMAGES.logoTransparent}
            alt="YAAD"
            className="w-5 h-5 object-contain drop-shadow-xs"
          />
          <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-xs tracking-wider uppercase text-neutral-800">
            YAAD | یاد
          </span>
        </div>

        {/* Language Selector */}
        <div className="inline-flex items-center bg-white/80 backdrop-blur-md rounded-full p-0.5 border border-neutral-200/80 text-[10px] font-['Manrope'] font-bold text-neutral-600 shadow-2xs">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
              language === 'en' ? 'bg-neutral-900 text-white shadow-xs' : 'hover:text-neutral-900'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ur')}
            className={`px-2 py-0.5 rounded-full transition-all font-urdu cursor-pointer ${
              language === 'ur' ? 'bg-neutral-900 text-white shadow-xs' : 'hover:text-neutral-900'
            }`}
          >
            اردو
          </button>
          <button
            type="button"
            onClick={() => setLanguage('roman-urdu')}
            className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
              language === 'roman-urdu' ? 'bg-neutral-900 text-white shadow-xs' : 'hover:text-neutral-900'
            }`}
          >
            ROM
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* CENTER STAGE: Clean Minimalist Entry with Animated Circle      */}
      {/* ============================================================== */}
      <section className="flex-1 w-full max-w-md flex flex-col items-center justify-center py-6 text-center z-10">
        {/* Title & Subtitle */}
        <div className="space-y-1.5 mb-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight font-['Plus_Jakarta_Sans']">
            {language === 'ur' ? 'یاد میں خوش آمدید' : 'Welcome to YAAD'}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-neutral-500 font-['Manrope'] max-w-xs mx-auto">
            {language === 'ur'
              ? 'گھر کے راشن اور سمارٹ خریداری لسٹ کے لیے سائن ان کریں'
              : 'Organize your grocery lists and sync easily with family'}
          </p>
        </div>

        {/* Animated Pulsing Circle Sign-In Button */}
        <div className="relative flex items-center justify-center my-7 sm:my-9">
          {/* Animated concentric ripples */}
          <div className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-neutral-900/10 animate-ping opacity-25 pointer-events-none" />
          <div className="absolute w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 border-neutral-900/15 animate-pulse pointer-events-none" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#DE6346]/20 via-[#48B89F]/20 to-[#E5A83B]/20 blur-2xl opacity-60 pointer-events-none" />

          {/* Core Interactive Circle Button */}
          <button
            id="auth_animated_circle_btn"
            type="button"
            onClick={handleOpenSignInSheet}
            className="relative z-10 w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-neutral-900 hover:bg-black text-white shadow-[0_20px_50px_rgba(0,0,0,0.22)] border-4 border-white flex flex-col items-center justify-center p-4 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer group"
          >
            <img
              src={APP_IMAGES.logoTransparent}
              alt="YAAD"
              className="w-10 h-10 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
            />
            <span
              className={`mt-2 text-lg sm:text-xl font-extrabold tracking-tight group-hover:text-amber-200 transition-colors ${
                language === 'ur' ? 'font-urdu text-xl sm:text-2xl' : "font-['Plus_Jakarta_Sans']"
              }`}
            >
              {language === 'ur' ? 'سائن ان' : 'Sign In'}
            </span>
            <span className="mt-1 text-[11px] text-neutral-300 group-hover:text-white flex items-center gap-1 font-['Manrope'] font-medium transition-colors">
              <span>{language === 'ur' ? 'ٹیپ کریں' : 'Tap to start'}</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>

        {/* Secondary Action: Create Account */}
        <div className="flex flex-col items-center gap-2">
          <button
            id="auth_open_signup_btn"
            type="button"
            onClick={handleOpenSignUpSheet}
            className="px-5 py-2.5 rounded-full bg-white hover:bg-neutral-50 text-neutral-800 font-['Manrope'] text-xs sm:text-sm font-semibold border border-neutral-200/90 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>{language === 'ur' ? 'نیا اکاؤنٹ بنائیں (رجسٹر)' : 'New to YAAD? Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
          </button>
        </div>
      </section>

      {/* Bottom Footer Info */}
      <footer className="w-full max-w-md flex flex-col items-center gap-2 pt-2 pb-1 z-10 font-['Manrope']">
        <div className="flex items-center justify-center gap-3 text-xs text-neutral-500">
          <a
            id="auth_footer_rashan_link_main"
            href="/rashan-list"
            onClick={(e) => {
              e.preventDefault();
              navigate(language === 'ur' ? '/rashan-list?lang=ur' : '/rashan-list');
            }}
            className="font-medium text-neutral-700 hover:text-black transition-colors underline cursor-pointer"
          >
            {language === 'ur' ? 'ماہانہ راشن لسٹ' : 'Monthly Rashan List'}
          </a>
          <span>•</span>
          <button
            type="button"
            onClick={() => onOpenLegalPage?.('privacy')}
            className="hover:text-black transition-colors cursor-pointer"
          >
            Privacy
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => onOpenLegalPage?.('terms')}
            className="hover:text-black transition-colors cursor-pointer"
          >
            Terms
          </button>
        </div>
      </footer>

      {/* ============================================================== */}
      {/* POP-UP / BOTTOM SHEET MODAL (Slides up when circle is tapped)  */}
      {/* ============================================================== */}
      {isSheetOpen && (
        <div
          id="auth_sheet_backdrop"
          onClick={() => setIsSheetOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 animate-in fade-in duration-200"
        >
          <div
            id="auth_card"
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-[420px] max-h-[92vh] sm:max-h-[88vh] bg-white rounded-t-[36px] sm:rounded-[36px] shadow-2xl overflow-y-auto border border-neutral-100 relative flex flex-col animate-in slide-in-from-bottom duration-300 ease-out transition-all"
          >
            {/* Top Close (X) button */}
            <button
              id="auth_sheet_close_btn"
              type="button"
              onClick={() => setIsSheetOpen(false)}
              className="absolute top-3 end-3.5 z-20 w-8 h-8 rounded-full bg-black/25 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs active:scale-90"
              aria-label="Close"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Top Drag Handle (tapping closes sheet) */}
            <div
              className="w-full pt-2.5 pb-1 flex justify-center cursor-pointer relative z-10"
              onClick={() => setIsSheetOpen(false)}
            >
              <div className="w-11 h-1.5 bg-white/60 hover:bg-white rounded-full transition-colors" />
            </div>

            {/* 1. TOP HEADER BANNER (Organic artistic curves & display title) */}
            <div className="relative w-full pt-4 pb-10 px-6 overflow-hidden bg-gradient-to-br from-[#E26A4F] via-[#DE6346] to-[#D05438]">
              {/* Golden-ochre organic orb on top-left */}
              <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-[#E5A83B] opacity-95 blur-[0.5px]" />
              
              {/* Sea-green/mint organic shape on bottom-right */}
              <div className="absolute -bottom-8 -right-8 w-44 h-44 rounded-full bg-[#48B89F] opacity-95 blur-[0.5px]" />

              {/* Deep green ambient shade for depth */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#0F3D2E]/10 pointer-events-none blur-xl" />

              {/* Subtle artistic paper texture dots */}
              <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:14px_14px]" />

              {/* Top Title & Logo */}
              <div className="relative z-10 text-center px-1 pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[11px] font-['Plus_Jakarta_Sans'] font-extrabold tracking-wider uppercase mb-2 shadow-xs">
                  <img
                    src={APP_IMAGES.logoTransparent}
                    alt="YAAD"
                    className="w-4 h-4 object-contain drop-shadow-xs"
                  />
                  <span>YAAD | یاد</span>
                </div>

                <h2 className="text-2xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans'] drop-shadow-xs">
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
                </h2>
                <p className="text-white/90 text-xs font-['Manrope'] mt-1 font-medium max-w-xs mx-auto">
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

            {/* 2. ELEVATED WHITE CARD (Forms, Inputs, Google, Legal) */}
            <div className="-mt-6 relative z-10 bg-white rounded-t-[32px] sm:rounded-t-[36px] px-6 sm:px-7 pt-6 pb-8 space-y-4 flex-1 shadow-lg flex flex-col justify-between">
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
                        {mode === 'signup'
                          ? language === 'ur'
                            ? 'گوگل کے ساتھ سائن اپ کریں'
                            : language === 'roman-urdu'
                            ? 'Google ke sath signup karein'
                            : 'Sign up with Google'
                          : language === 'ur'
                          ? 'گوگل کے ساتھ لاگ ان کریں'
                          : language === 'roman-urdu'
                          ? 'Google ke sath login karein'
                          : 'Continue with Google'}
                      </span>
                    </button>

                    {/* Clean Minimal 'or' divider */}
                    <div className="relative flex items-center justify-center my-2">
                      <div className="border-t border-neutral-200/80 w-full" />
                      <span className="bg-white px-3 text-[11px] font-['Manrope'] uppercase tracking-wider text-neutral-400 font-bold">
                        {language === 'ur' ? 'یا' : 'or'}
                      </span>
                      <div className="border-t border-neutral-200/80 w-full" />
                    </div>
                  </>
                )}

                {/* Segmented Mode Switcher Pill (Sign In / Create Account) */}
                {(mode === 'signin' || mode === 'signup') && (
                  <div className="flex bg-neutral-100 p-1 rounded-full border border-neutral-200/60 font-['Manrope']">
                    <button
                      type="button"
                      onClick={() => handleSwitchTab('signin')}
                      className={`flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                        mode === 'signin'
                          ? 'bg-white text-neutral-900 shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      {language === 'ur' ? 'سائن ان' : 'Sign In'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchTab('signup')}
                      className={`flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                        mode === 'signup'
                          ? 'bg-white text-neutral-900 shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      {language === 'ur' ? 'نیا اکاؤنٹ' : 'Create Account'}
                    </button>
                  </div>
                )}

                {/* 3. AUTH FORMS */}
                {/* -------------------------------------------------------- */}
                {/* MODE A: SIGN IN FORM                                      */}
                {/* -------------------------------------------------------- */}
                {mode === 'signin' && (
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1 font-['Manrope']">
                        {language === 'ur' ? 'ای میل ایڈریس' : 'Email'}
                      </label>
                      <input
                        id="auth_email_input"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full h-11 px-4 rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-900 text-sm font-['Manrope'] placeholder:text-neutral-400 focus:outline-hidden focus:border-neutral-900 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-neutral-700 font-['Manrope']">
                          {language === 'ur' ? 'پاس ورڈ' : 'Password'}
                        </label>
                        <button
                          type="button"
                          onClick={handleOpenForgotPassword}
                          className="text-xs text-neutral-500 hover:text-neutral-900 font-['Manrope'] font-medium transition-colors cursor-pointer"
                        >
                          {language === 'ur' ? 'پاس ورڈ بھول گئے؟' : 'Forgot password?'}
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          id="auth_password_input"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-11 px-4 pe-11 rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-900 text-sm font-['Manrope'] placeholder:text-neutral-400 focus:outline-hidden focus:border-neutral-900 focus:bg-white transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute end-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer transition-colors"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      id="auth_submit_btn"
                      type="submit"
                      disabled={isAnyLoading}
                      className="w-full h-12 mt-2 rounded-full bg-neutral-900 hover:bg-black text-white font-['Manrope'] text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                      ) : (
                        <span>{language === 'ur' ? 'سائن ان کریں' : 'Sign in'}</span>
                      )}
                    </button>
                  </form>
                )}

                {/* -------------------------------------------------------- */}
                {/* MODE B: SIGN UP FORM                                      */}
                {/* -------------------------------------------------------- */}
                {mode === 'signup' && (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1 font-['Manrope']">
                          {language === 'ur' ? 'پہلا نام' : 'First Name'}
                        </label>
                        <input
                          id="signup_first_name_input"
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-900 text-sm font-['Manrope'] placeholder:text-neutral-400 focus:outline-hidden focus:border-neutral-900 focus:bg-white transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1 font-['Manrope']">
                          {language === 'ur' ? 'آخری نام' : 'Last Name'}
                        </label>
                        <input
                          id="signup_last_name_input"
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Doe"
                          className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-900 text-sm font-['Manrope'] placeholder:text-neutral-400 focus:outline-hidden focus:border-neutral-900 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1 font-['Manrope']">
                        {language === 'ur' ? 'فون نمبر' : 'Phone Number'}
                      </label>
                      <input
                        id="signup_phone_input"
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="0300 1234567"
                        className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-900 text-sm font-['Manrope'] placeholder:text-neutral-400 focus:outline-hidden focus:border-neutral-900 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1 font-['Manrope']">
                        {language === 'ur' ? 'ای میل ایڈریس' : 'Email'}
                      </label>
                      <input
                        id="signup_email_input"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-900 text-sm font-['Manrope'] placeholder:text-neutral-400 focus:outline-hidden focus:border-neutral-900 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1 font-['Manrope']">
                        {language === 'ur' ? 'پاس ورڈ (کم از کم 6 حروف)' : 'Password (min. 6 chars)'}
                      </label>
                      <div className="relative">
                        <input
                          id="signup_password_input"
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-10 px-3.5 pe-11 rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-900 text-sm font-['Manrope'] placeholder:text-neutral-400 focus:outline-hidden focus:border-neutral-900 focus:bg-white transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute end-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer transition-colors"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      id="signup_submit_btn"
                      type="submit"
                      disabled={isAnyLoading}
                      className="w-full h-12 mt-1 rounded-full bg-neutral-900 hover:bg-black text-white font-['Manrope'] text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                      ) : (
                        <span>{language === 'ur' ? 'اکاؤنٹ بنائیں' : 'Create account'}</span>
                      )}
                    </button>
                  </form>
                )}

                {/* -------------------------------------------------------- */}
                {/* MODE C: FORGOT PASSWORD FORM                              */}
                {/* -------------------------------------------------------- */}
                {mode === 'forgot_password' && (
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1 font-['Manrope']">
                        {language === 'ur' ? 'اپنا ای میل ایڈریس درج کریں' : 'Your Email Address'}
                      </label>
                      <input
                        id="forgot_email_input"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full h-11 px-4 rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-900 text-sm font-['Manrope'] placeholder:text-neutral-400 focus:outline-hidden focus:border-neutral-900 focus:bg-white transition-all"
                      />
                    </div>

                    <button
                      id="forgot_submit_btn"
                      type="submit"
                      disabled={isAnyLoading}
                      className="w-full h-12 rounded-full bg-neutral-900 hover:bg-black text-white font-['Manrope'] text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                      ) : (
                        <span>{language === 'ur' ? 'ری سیٹ لنک بھیجیں' : 'Send reset link'}</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleBackToSignIn}
                      className="w-full py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 font-['Manrope'] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{language === 'ur' ? 'سائن ان پر واپس جائیں' : 'Back to sign in'}</span>
                    </button>
                  </form>
                )}

                {/* -------------------------------------------------------- */}
                {/* MODE D: RESET PASSWORD FORM                               */}
                {/* -------------------------------------------------------- */}
                {mode === 'reset_password' && (
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1 font-['Manrope']">
                        {language === 'ur' ? 'نیا پاس ورڈ' : 'New Password'}
                      </label>
                      <div className="relative">
                        <input
                          id="reset_new_password_input"
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-11 px-4 pe-11 rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-900 text-sm font-['Manrope'] placeholder:text-neutral-400 focus:outline-hidden focus:border-neutral-900 focus:bg-white transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute end-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer transition-colors"
                          aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1 font-['Manrope']">
                        {language === 'ur' ? 'پاس ورڈ کی تصدیق کریں' : 'Confirm Password'}
                      </label>
                      <div className="relative">
                        <input
                          id="reset_confirm_password_input"
                          type={showConfirmNewPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-11 px-4 pe-11 rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-900 text-sm font-['Manrope'] placeholder:text-neutral-400 focus:outline-hidden focus:border-neutral-900 focus:bg-white transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                          className="absolute end-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer transition-colors"
                          aria-label={showConfirmNewPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      id="reset_submit_btn"
                      type="submit"
                      disabled={isAnyLoading}
                      className="w-full h-12 mt-2 rounded-full bg-neutral-900 hover:bg-black text-white font-['Manrope'] text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                      ) : (
                        <span>{language === 'ur' ? 'نیا پاس ورڈ محفوظ کریں' : 'Save new password'}</span>
                      )}
                    </button>
                  </form>
                )}

                {/* Terms of Service & Privacy Notice */}
                <div className="pt-2 text-center">
                  <p className="text-[11px] text-neutral-500 font-['Manrope'] leading-relaxed max-w-xs mx-auto">
                    {language === 'ur' ? (
                      <>
                        جاری رکھ کر، آپ ہماری{' '}
                        <button
                          type="button"
                          onClick={() => onOpenLegalPage?.('terms')}
                          className="text-neutral-800 font-semibold underline hover:text-black cursor-pointer"
                        >
                          شرائط
                        </button>{' '}
                        اور{' '}
                        <button
                          type="button"
                          onClick={() => onOpenLegalPage?.('privacy')}
                          className="text-neutral-800 font-semibold underline hover:text-black cursor-pointer"
                        >
                          رازداری کی پالیسی
                        </button>{' '}
                        سے اتفاق کرتے ہیں۔
                      </>
                    ) : (
                      <>
                        By continuing, you agree to our{' '}
                        <button
                          type="button"
                          onClick={() => onOpenLegalPage?.('terms')}
                          className="text-neutral-800 font-semibold underline hover:text-black cursor-pointer"
                        >
                          Terms
                        </button>{' '}
                        and{' '}
                        <button
                          type="button"
                          onClick={() => onOpenLegalPage?.('privacy')}
                          className="text-neutral-800 font-semibold underline hover:text-black cursor-pointer"
                        >
                          Privacy Policy
                        </button>
                        .
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Mode switch helper in bottom */}
              <div className="pt-4 border-t border-neutral-100 flex flex-col items-center gap-2 text-xs text-neutral-500 font-['Manrope']">
                <div className="flex items-center gap-1.5">
                  {mode === 'signup' ? (
                    <>
                      <span>{language === 'ur' ? 'پہلے سے اکاؤنٹ موجود ہے؟' : 'Already have an account?'}</span>
                      <button
                        type="button"
                        onClick={() => handleSwitchTab('signin')}
                        className="font-bold text-neutral-900 underline hover:text-black cursor-pointer"
                      >
                        {language === 'ur' ? 'سائن ان کریں' : 'Log in'}
                      </button>
                    </>
                  ) : (
                    <>
                      <span>{language === 'ur' ? 'اکاؤنٹ نہیں ہے؟' : "Don't have an account?"}</span>
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
        </div>
      )}
    </main>
  );
};
