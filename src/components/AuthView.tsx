import React, { useState, useRef, useEffect } from 'react';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft,
  X,
  ArrowRight,
  Sparkles,
  Users,
  WifiOff,
  Mic,
  ShoppingBag,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useAppRouter } from '../router/RouterContext';
import { APP_IMAGES } from '../data/initialData';
import { formatAuthErrorMessage } from '../lib/supabase';
import { validatePhoneNumber } from '../utils/phone';
import { LuminousRing } from './auth/LuminousRing';

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

  // Controls bottom sheet pop-up visibility (starts closed unless password recovery)
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(isPasswordRecovery || false);

  // Dynamic responsive ring size based on viewport
  const [ringSize, setRingSize] = useState<number>(360);

  // Synchronous hardware ref to prevent double submissions or enter-key races
  const isSubmittingRef = useRef(false);
  const isAnyLoading = loading || googleLoading;

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w < 380 || h < 600) {
        setRingSize(270);
      } else if (w < 640 || h < 700) {
        setRingSize(310);
      } else if (w < 1024) {
        setRingSize(360);
      } else {
        setRingSize(400);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          ? 'انٹرنیٹ کنکشن نہیں ہے۔ لاگ ان کے لیے انٹرنیٹ درکار ہے۔'
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
    const resolvedName = `${firstName.trim()} ${lastName.trim()}`.trim();
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
        } catch {
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
      setSuccessMessage('Your password has been reset successfully. You can now sign in.');
      setMode('signin');
      setPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: unknown) {
      setErrorMessage(formatAuthErrorMessage(err));
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  const handleOpenForgotPassword = () => {
    setMode('forgot_password');
    setErrorMessage(null);
    setSuccessMessage(null);
    clearOauthError();
    clearPasswordResetError?.();
  };

  const handleBackToSignIn = () => {
    setMode('signin');
    setErrorMessage(null);
    setSuccessMessage(null);
    clearOauthError();
    clearPasswordResetError?.();
  };

  const handleSwitchTab = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
    clearOauthError();
    clearPasswordResetError?.();
  };

  const displayedError = errorMessage || oauthError || passwordResetError;
  const isUrdu = language === 'ur';

  return (
    <main
      id="auth_screen_container"
      className="min-h-screen bg-[#05060A] text-white flex flex-col justify-between items-center px-4 py-6 sm:py-8 select-none relative overflow-hidden"
    >
      {/* Ambient chromatic nebula glow points matching the video */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-600/10 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-600/10 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-indigo-900/10 blur-[150px] pointer-events-none -z-10" />

      {/* Subtle obsidian dot pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:28px_28px]" />

      {/* Top Header Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between z-10 pt-1">
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white shadow-2xs hover:bg-white/10 transition-colors">
          <img
            src={APP_IMAGES.logoTransparent}
            alt="YAAD"
            className="w-5 h-5 object-contain drop-shadow-md"
          />
          <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-xs tracking-wider uppercase text-neutral-200">
            YAAD | یاد
          </span>
        </div>

        {/* Language Selector */}
        <div className="inline-flex items-center bg-white/5 backdrop-blur-md rounded-full p-1 border border-white/10 text-[11px] font-['Manrope'] font-bold text-neutral-400 shadow-2xs">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
              language === 'en' ? 'bg-white text-black font-extrabold shadow-xs' : 'hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ur')}
            className={`px-2.5 py-0.5 rounded-full transition-all font-urdu cursor-pointer ${
              language === 'ur' ? 'bg-white text-black font-extrabold shadow-xs' : 'hover:text-white'
            }`}
          >
            اردو
          </button>
          <button
            type="button"
            onClick={() => setLanguage('roman-urdu')}
            className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
              language === 'roman-urdu' ? 'bg-white text-black font-extrabold shadow-xs' : 'hover:text-white'
            }`}
          >
            ROM
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* CENTER STAGE: The Authentic Luminous Ring from Video          */}
      {/* ============================================================== */}
      <section className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center py-4 sm:py-6 text-center z-10">
        {/* Title & Tagline */}
        <div className="space-y-1 mb-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            {isUrdu ? 'یاد میں خوش آمدید' : 'Welcome to YAAD'}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-neutral-400 font-['Manrope'] max-w-sm mx-auto">
            {isUrdu
              ? 'گھر کے راشن اور سمارٹ خریداری کے لیے ایک پرسکون اور آسان شروعات'
              : 'Smart grocery planning & real-time family rashan sync'}
          </p>
        </div>

        {/* 60 FPS HTML5 Canvas Luminous Ring Component */}
        <div className="my-4 sm:my-6 relative flex items-center justify-center">
          <LuminousRing
            size={ringSize}
            onClick={handleOpenSignInSheet}
            label={isUrdu ? 'سائن ان' : 'Sign In'}
            subLabel={isUrdu ? 'شروع کرنے کے لیے کلک کریں' : 'Tap to continue'}
            isUrdu={isUrdu}
            logoSrc={APP_IMAGES.logoTransparent}
          />
        </div>

        {/* Secondary Action: Create Account Pill */}
        <div className="flex flex-col items-center gap-2 mt-1">
          <button
            id="auth_open_signup_btn"
            type="button"
            onClick={handleOpenSignUpSheet}
            className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-neutral-200 hover:text-white font-['Manrope'] text-xs sm:text-sm font-semibold border border-white/15 backdrop-blur-md shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <span>{isUrdu ? 'نیا اکاؤنٹ بنائیں (رجسٹر)' : 'New to YAAD? Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
          </button>
        </div>
      </section>

      {/* Bottom Footer Info */}
      <footer className="w-full max-w-5xl flex flex-col items-center gap-2 pt-2 pb-1 z-10 font-['Manrope']">
        <div className="flex items-center justify-center gap-3 text-xs text-neutral-400">
          <a
            id="auth_footer_rashan_link_main"
            href="/rashan-list"
            onClick={(e) => {
              e.preventDefault();
              navigate(language === 'ur' ? '/rashan-list?lang=ur' : '/rashan-list');
            }}
            className="font-medium text-neutral-300 hover:text-white transition-colors underline cursor-pointer"
          >
            {language === 'ur' ? 'ماہانہ راشن لسٹ' : 'Monthly Rashan List'}
          </a>
          <span>•</span>
          <button
            type="button"
            onClick={() => onOpenLegalPage?.('privacy')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Privacy
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => onOpenLegalPage?.('terms')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Terms
          </button>
        </div>
      </footer>

      {/* ============================================================== */}
      {/* POP-UP / MODAL (Truly Responsive for Mobile, Tablet & PC)      */}
      {/* ============================================================== */}
      {isSheetOpen && (
        <div
          id="auth_sheet_backdrop"
          onClick={() => setIsSheetOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200"
        >
          {/* Main Dialog Container */}
          <div
            id="auth_card"
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md lg:max-w-3xl max-h-[92vh] sm:max-h-[88vh] bg-[#0C0E15] text-white rounded-t-[32px] sm:rounded-[28px] lg:rounded-[32px] shadow-[0_25px_80px_rgba(0,0,0,0.95)] border-t sm:border border-white/15 relative flex flex-col lg:grid lg:grid-cols-12 overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 ease-out"
          >
            {/* Top Close (X) button */}
            <button
              id="auth_sheet_close_btn"
              type="button"
              onClick={() => setIsSheetOpen(false)}
              className="absolute top-3.5 end-4 z-30 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90"
              aria-label="Close"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Mobile Drag Handle */}
            <div
              className="sm:hidden w-full pt-2.5 pb-1 flex justify-center cursor-pointer relative z-20"
              onClick={() => setIsSheetOpen(false)}
            >
              <div className="w-12 h-1.5 bg-white/20 hover:bg-white/40 rounded-full transition-colors" />
            </div>

            {/* ---------------------------------------------------------- */}
            {/* DESKTOP / PC BRAND SIDEBAR (Left 5 Columns on wide screen) */}
            {/* ---------------------------------------------------------- */}
            <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 bg-gradient-to-b from-[#131624] via-[#0E101B] to-[#0A0C13] border-r border-white/10 relative overflow-hidden">
              {/* Subtle ambient chromatic orb */}
              <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

              {/* Brand Top */}
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white text-xs font-['Plus_Jakarta_Sans'] font-extrabold uppercase mb-4 shadow-xs">
                  <img
                    src={APP_IMAGES.logoTransparent}
                    alt="YAAD"
                    className="w-4 h-4 object-contain"
                  />
                  <span>YAAD | یاد</span>
                </div>
                <h3 className="text-xl font-extrabold text-white font-['Plus_Jakarta_Sans'] tracking-tight">
                  {isUrdu ? 'سمارٹ راشن اور خریداری' : 'Next-Gen Grocery Planning'}
                </h3>
                <p className="text-xs text-neutral-400 font-['Manrope'] mt-1 leading-relaxed">
                  {isUrdu
                    ? 'گھر کے تمام افراد کے لیے مربوط لسٹ، آف لائن سپورٹ اور ماہانہ راشن پلاننگ۔'
                    : 'Real-time family list sharing, voice items, and offline synchronization.'}
                </p>
              </div>

              {/* Value proposition badges */}
              <div className="space-y-3.5 my-6 relative z-10">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-['Manrope']">
                      {isUrdu ? 'فیملی لائیو شیئرنگ' : 'Live Family Syncing'}
                    </h4>
                    <p className="text-[11px] text-neutral-400 font-['Manrope'] leading-tight mt-0.5">
                      {isUrdu ? 'سب گھر والے ایک ساتھ آئٹمز شامل کر سکتے ہیں' : 'Collaborate together on a single active shopping list'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                    <WifiOff className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-['Manrope']">
                      {isUrdu ? 'آف لائن کام کرتا ہے' : '100% Offline-Ready'}
                    </h4>
                    <p className="text-[11px] text-neutral-400 font-['Manrope'] leading-tight mt-0.5">
                      {isUrdu ? 'مارکیٹ میں بغیر سگنل بھی لسٹ دیکھ سکتے ہیں' : 'Access and check items even with zero internet signal'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-['Manrope']">
                      {isUrdu ? 'ماہانہ راشن لسٹ' : 'Monthly Rashan Guide'}
                    </h4>
                    <p className="text-[11px] text-neutral-400 font-['Manrope'] leading-tight mt-0.5">
                      {isUrdu ? '40 سے زائد ضروری راشن آئٹمز تیار ہیں' : 'Curated Pakistani household pantry essentials'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Security Note */}
              <div className="relative z-10 flex items-center gap-2 text-[11px] text-neutral-500 font-['Manrope']">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Encrypted & secure authentication</span>
              </div>
            </div>

            {/* ---------------------------------------------------------- */}
            {/* RIGHT SIDE / MAIN FORM PANEL (7 cols on Desktop, 100% else)*/}
            {/* ---------------------------------------------------------- */}
            <div className="lg:col-span-7 p-6 sm:p-7 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[85vh]">
              <div>
                {/* Header Title on Mobile / Tablet / PC */}
                <div className="text-start mb-5 pe-8">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                    {mode === 'signup' && (isUrdu ? 'نیا اکاؤنٹ بنائیں' : 'Create an account')}
                    {mode === 'signin' && (isUrdu ? 'اپنے اکاؤنٹ میں سائن ان کریں' : 'Sign in to your account')}
                    {mode === 'forgot_password' && (isUrdu ? 'پاس ورڈ ری سیٹ کریں' : 'Reset your password')}
                    {mode === 'reset_password' && (isUrdu ? 'نیا پاس ورڈ درج کریں' : 'Set a new password')}
                  </h2>
                  <p className="text-neutral-400 text-xs font-['Manrope'] mt-1 font-medium">
                    {mode === 'signup' && (isUrdu ? 'گروسری اور راشن لسٹ سنک کرنے کے لیے چند سیکنڈ میں رجسٹر ہوں' : 'Enter your details below to get started with YAAD')}
                    {mode === 'signin' && (isUrdu ? 'اپنی محفوظ کردہ لسٹ اور فیملی آئٹمز دیکھنے کے لیے لاگ ان کریں' : 'Welcome back! Choose how you would like to sign in')}
                    {mode === 'forgot_password' && (isUrdu ? 'اپنا ای میل لکھیں، ہم ریکوری لنک بھیجیں گے' : 'Enter your registered email to receive password reset link')}
                    {mode === 'reset_password' && (isUrdu ? 'اپنے اکاؤنٹ کے لیے نیا پاس ورڈ منتخب کریں' : 'Choose a strong password to secure your account')}
                  </p>
                </div>

                {/* Notifications / Alerts */}
                {displayedError && (
                  <div
                    role="alert"
                    className="p-3 mb-4 bg-red-950/60 border border-red-500/30 text-red-200 text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span className="flex-1 font-['Manrope'] font-medium">{displayedError}</span>
                  </div>
                )}

                {successMessage && (
                  <div
                    role="status"
                    className="p-3 mb-4 bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span className="flex-1 font-['Manrope'] font-medium">{successMessage}</span>
                  </div>
                )}

                {/* Segmented Mode Switcher Pill (Sign In / Create Account) */}
                {(mode === 'signin' || mode === 'signup') && (
                  <div className="flex bg-white/5 p-1 rounded-full border border-white/10 font-['Manrope'] mb-4">
                    <button
                      type="button"
                      onClick={() => handleSwitchTab('signin')}
                      className={`flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                        mode === 'signin'
                          ? 'bg-white text-black shadow-xs'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {isUrdu ? 'سائن ان' : 'Sign In'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchTab('signup')}
                      className={`flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                        mode === 'signup'
                          ? 'bg-white text-black shadow-xs'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {isUrdu ? 'نیا اکاؤنٹ' : 'Create Account'}
                    </button>
                  </div>
                )}

                {/* Google 1-Tap Sign In Pill Button */}
                {(mode === 'signin' || mode === 'signup') && (
                  <>
                    <button
                      id={mode === 'signup' ? 'signup_google_btn' : 'auth_google_btn'}
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isAnyLoading}
                      className="w-full h-11 sm:h-12 rounded-full bg-white hover:bg-neutral-100 text-neutral-900 font-['Manrope'] text-sm font-bold transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                    >
                      {googleLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-neutral-900" />
                      ) : (
                        <GoogleOfficialIcon className="w-5 h-5" />
                      )}
                      <span>
                        {mode === 'signup'
                          ? isUrdu
                            ? 'گوگل کے ساتھ سائن اپ کریں'
                            : 'Sign up with Google'
                          : isUrdu
                          ? 'گوگل کے ساتھ لاگ ان کریں'
                          : 'Continue with Google'}
                      </span>
                    </button>

                    {/* Divider */}
                    <div className="relative flex items-center justify-center my-4">
                      <div className="border-t border-white/10 w-full" />
                      <span className="bg-[#0C0E15] px-3 text-[11px] font-['Manrope'] uppercase tracking-wider text-neutral-500 font-bold">
                        {isUrdu ? 'یا ای میل کے ساتھ' : 'or continue with email'}
                      </span>
                      <div className="border-t border-white/10 w-full" />
                    </div>
                  </>
                )}

                {/* ------------------------------------------------------ */}
                {/* MODE A: SIGN IN FORM                                    */}
                {/* ------------------------------------------------------ */}
                {mode === 'signin' && (
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1 font-['Manrope']">
                        {isUrdu ? 'ای میل ایڈریس' : 'Email address'}
                      </label>
                      <input
                        id="auth_email_input"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full h-11 px-4 rounded-xl border border-white/15 bg-white/5 text-white text-sm font-['Manrope'] placeholder:text-neutral-500 focus:outline-hidden focus:border-purple-400 focus:bg-white/10 transition-all"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-neutral-300 font-['Manrope']">
                          {isUrdu ? 'پاس ورڈ' : 'Password'}
                        </label>
                        <button
                          type="button"
                          onClick={handleOpenForgotPassword}
                          className="text-xs text-neutral-400 hover:text-white font-['Manrope'] font-medium transition-colors cursor-pointer"
                        >
                          {isUrdu ? 'پاس ورڈ بھول گئے؟' : 'Forgot password?'}
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
                          className="w-full h-11 px-4 pe-11 rounded-xl border border-white/15 bg-white/5 text-white text-sm font-['Manrope'] placeholder:text-neutral-500 focus:outline-hidden focus:border-purple-400 focus:bg-white/10 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute end-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 cursor-pointer transition-colors"
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
                      className="w-full h-11 sm:h-12 mt-2 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-['Manrope'] text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                      ) : (
                        <span>{isUrdu ? 'سائن ان کریں' : 'Sign in'}</span>
                      )}
                    </button>
                  </form>
                )}

                {/* ------------------------------------------------------ */}
                {/* MODE B: SIGN UP FORM                                    */}
                {/* ------------------------------------------------------ */}
                {mode === 'signup' && (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1 font-['Manrope']">
                          {isUrdu ? 'پہلا نام' : 'First Name'}
                        </label>
                        <input
                          id="signup_first_name_input"
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Ali"
                          className="w-full h-10 px-3.5 rounded-xl border border-white/15 bg-white/5 text-white text-sm font-['Manrope'] placeholder:text-neutral-500 focus:outline-hidden focus:border-purple-400 focus:bg-white/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1 font-['Manrope']">
                          {isUrdu ? 'آخری نام' : 'Last Name'}
                        </label>
                        <input
                          id="signup_last_name_input"
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Khan"
                          className="w-full h-10 px-3.5 rounded-xl border border-white/15 bg-white/5 text-white text-sm font-['Manrope'] placeholder:text-neutral-500 focus:outline-hidden focus:border-purple-400 focus:bg-white/10 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1 font-['Manrope']">
                        {isUrdu ? 'فون نمبر' : 'Phone Number'}
                      </label>
                      <input
                        id="signup_phone_input"
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="0300 1234567"
                        className="w-full h-10 px-3.5 rounded-xl border border-white/15 bg-white/5 text-white text-sm font-['Manrope'] placeholder:text-neutral-500 focus:outline-hidden focus:border-purple-400 focus:bg-white/10 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1 font-['Manrope']">
                        {isUrdu ? 'ای میل ایڈریس' : 'Email'}
                      </label>
                      <input
                        id="signup_email_input"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full h-10 px-3.5 rounded-xl border border-white/15 bg-white/5 text-white text-sm font-['Manrope'] placeholder:text-neutral-500 focus:outline-hidden focus:border-purple-400 focus:bg-white/10 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1 font-['Manrope']">
                        {isUrdu ? 'پاس ورڈ (کم از کم 6 حروف)' : 'Password (min. 6 chars)'}
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
                          className="w-full h-10 px-3.5 pe-11 rounded-xl border border-white/15 bg-white/5 text-white text-sm font-['Manrope'] placeholder:text-neutral-500 focus:outline-hidden focus:border-purple-400 focus:bg-white/10 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute end-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 cursor-pointer transition-colors"
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
                      className="w-full h-11 sm:h-12 mt-1 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-['Manrope'] text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                      ) : (
                        <span>{isUrdu ? 'اکاؤنٹ بنائیں' : 'Create account'}</span>
                      )}
                    </button>
                  </form>
                )}

                {/* ------------------------------------------------------ */}
                {/* MODE C: FORGOT PASSWORD FORM                            */}
                {/* ------------------------------------------------------ */}
                {mode === 'forgot_password' && (
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1 font-['Manrope']">
                        {isUrdu ? 'اپنا ای میل ایڈریس درج کریں' : 'Your Email Address'}
                      </label>
                      <input
                        id="forgot_email_input"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full h-11 px-4 rounded-xl border border-white/15 bg-white/5 text-white text-sm font-['Manrope'] placeholder:text-neutral-500 focus:outline-hidden focus:border-purple-400 focus:bg-white/10 transition-all"
                      />
                    </div>

                    <button
                      id="forgot_submit_btn"
                      type="submit"
                      disabled={isAnyLoading}
                      className="w-full h-11 sm:h-12 rounded-full bg-white hover:bg-neutral-100 text-black font-['Manrope'] text-sm font-bold shadow-md active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-black" />
                      ) : (
                        <span>{isUrdu ? 'ری سیٹ لنک بھیجیں' : 'Send reset link'}</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleBackToSignIn}
                      className="w-full py-2 text-xs font-bold text-neutral-400 hover:text-white font-['Manrope'] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{isUrdu ? 'سائن ان پر واپس جائیں' : 'Back to sign in'}</span>
                    </button>
                  </form>
                )}

                {/* ------------------------------------------------------ */}
                {/* MODE D: RESET PASSWORD FORM                             */}
                {/* ------------------------------------------------------ */}
                {mode === 'reset_password' && (
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1 font-['Manrope']">
                        {isUrdu ? 'نیا پاس ورڈ' : 'New Password'}
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
                          className="w-full h-11 px-4 pe-11 rounded-xl border border-white/15 bg-white/5 text-white text-sm font-['Manrope'] placeholder:text-neutral-500 focus:outline-hidden focus:border-purple-400 focus:bg-white/10 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute end-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 cursor-pointer transition-colors"
                          aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1 font-['Manrope']">
                        {isUrdu ? 'پاس ورڈ کی تصدیق کریں' : 'Confirm Password'}
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
                          className="w-full h-11 px-4 pe-11 rounded-xl border border-white/15 bg-white/5 text-white text-sm font-['Manrope'] placeholder:text-neutral-500 focus:outline-hidden focus:border-purple-400 focus:bg-white/10 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                          className="absolute end-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 cursor-pointer transition-colors"
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
                      className="w-full h-11 sm:h-12 mt-2 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-['Manrope'] text-sm font-bold shadow-md active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                      ) : (
                        <span>{isUrdu ? 'نیا پاس ورڈ محفوظ کریں' : 'Save new password'}</span>
                      )}
                    </button>
                  </form>
                )}

                {/* Terms and Privacy Disclaimer */}
                <div className="pt-3 text-center">
                  <p className="text-[11px] text-neutral-400 font-['Manrope'] leading-relaxed">
                    {isUrdu ? (
                      <>
                        جاری رکھ کر، آپ ہماری{' '}
                        <button
                          type="button"
                          onClick={() => onOpenLegalPage?.('terms')}
                          className="text-neutral-200 font-semibold underline hover:text-white cursor-pointer"
                        >
                          شرائط
                        </button>{' '}
                        اور{' '}
                        <button
                          type="button"
                          onClick={() => onOpenLegalPage?.('privacy')}
                          className="text-neutral-200 font-semibold underline hover:text-white cursor-pointer"
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
                          className="text-neutral-200 font-semibold underline hover:text-white cursor-pointer"
                        >
                          Terms
                        </button>{' '}
                        and{' '}
                        <button
                          type="button"
                          onClick={() => onOpenLegalPage?.('privacy')}
                          className="text-neutral-200 font-semibold underline hover:text-white cursor-pointer"
                        >
                          Privacy Policy
                        </button>
                        .
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Bottom switch & links */}
              <div className="pt-4 mt-2 border-t border-white/10 flex flex-col items-center gap-2 text-xs text-neutral-400 font-['Manrope']">
                <div className="flex items-center gap-1.5">
                  {mode === 'signup' ? (
                    <>
                      <span>{isUrdu ? 'پہلے سے اکاؤنٹ موجود ہے؟' : 'Already have an account?'}</span>
                      <button
                        type="button"
                        onClick={() => handleSwitchTab('signin')}
                        className="font-bold text-white underline hover:text-purple-300 cursor-pointer"
                      >
                        {isUrdu ? 'سائن ان کریں' : 'Log in'}
                      </button>
                    </>
                  ) : (
                    <>
                      <span>{isUrdu ? 'اکاؤنٹ نہیں ہے؟' : "Don't have an account?"}</span>
                      <button
                        type="button"
                        onClick={() => handleSwitchTab('signup')}
                        className="font-bold text-white underline hover:text-purple-300 cursor-pointer"
                      >
                        {isUrdu ? 'نیا اکاؤنٹ بنائیں' : 'Sign up'}
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-center gap-3 text-[11px] text-neutral-500">
                  <button
                    type="button"
                    onClick={() => onOpenLegalPage?.('help')}
                    className="hover:text-neutral-300 transition-colors cursor-pointer"
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
                    className="hover:text-neutral-300 transition-colors cursor-pointer"
                  >
                    {isUrdu ? 'ماہانہ راشن لسٹ' : 'Monthly Rashan List'}
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
