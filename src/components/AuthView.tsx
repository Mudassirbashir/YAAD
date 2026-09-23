import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useAppRouter } from '../router/RouterContext';
import { APP_IMAGES } from '../data/initialData';
import { formatAuthErrorMessage } from '../lib/supabase';
import { validatePhoneNumber } from '../utils/phone';

// Official multi-color Google 'G' icon
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

type AuthScreenMode = 'signin' | 'signup' | 'forgot_password' | 'reset_password' | 'success';

interface AuthViewProps {
  initialMode?: 'signin' | 'signup';
  onSuccess?: () => void;
  onSuccessDisplayChange?: (isShowing: boolean) => void;
  onOpenLegalPage?: (page: 'terms' | 'privacy' | 'about' | 'help' | 'legal') => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'signin',
  onSuccess,
  onSuccessDisplayChange,
  onOpenLegalPage,
}) => {
  const { language, setLanguage } = useLanguage();
  const { navigate } = useAppRouter();
  const {
    user,
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

  const isUrdu = language === 'ur';

  // Mode state
  const [mode, setMode] = useState<AuthScreenMode>(
    isPasswordRecovery ? 'reset_password' : initialMode
  );

  // Success screen state
  const [successType, setSuccessType] = useState<'signin' | 'signup'>('signin');
  const [checkmarkDrawn, setCheckmarkDrawn] = useState(false);
  const [particlesActive, setParticlesActive] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  // Form input states
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Reset password states
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Submission & feedback states
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Prevent double submissions
  const isSubmittingRef = useRef(false);
  const isAnyLoading = loading || googleLoading;

  // React to password recovery trigger
  useEffect(() => {
    if (isPasswordRecovery) {
      setMode('reset_password');
      setErrorMessage(null);
      setInfoMessage(null);
    }
  }, [isPasswordRecovery]);

  // Synchronize oauth or password recovery errors
  useEffect(() => {
    if (oauthError) {
      setErrorMessage(oauthError);
      clearOauthError();
    }
  }, [oauthError, clearOauthError]);

  useEffect(() => {
    if (passwordResetError) {
      setErrorMessage(passwordResetError);
      clearPasswordResetError();
    }
  }, [passwordResetError, clearPasswordResetError]);

  // Notify parent of success display state
  useEffect(() => {
    onSuccessDisplayChange?.(mode === 'success');
  }, [mode, onSuccessDisplayChange]);

  // Trigger success screen animation sequence
  useEffect(() => {
    if (mode === 'success') {
      const t1 = setTimeout(() => setParticlesActive(true), 150);
      const t2 = setTimeout(() => setCheckmarkDrawn(true), 250);
      const t3 = setTimeout(() => setContentVisible(true), 400);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      setCheckmarkDrawn(false);
      setParticlesActive(false);
      setContentVisible(false);
    }
  }, [mode]);

  // Trigger success screen on successful auth
  const triggerSuccessState = (type: 'signin' | 'signup') => {
    setSuccessType(type);
    setErrorMessage(null);
    setInfoMessage(null);
    setMode('success');
  };

  // Back button handler
  const handleBack = () => {
    if (isAnyLoading) return;
    if (mode === 'signup' || mode === 'forgot_password') {
      setMode('signin');
      setErrorMessage(null);
      setInfoMessage(null);
      return;
    }
    if (mode === 'reset_password') {
      setMode('signin');
      setErrorMessage(null);
      setInfoMessage(null);
      return;
    }
    // In signin mode: navigate back if history exists, or to catalog
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/rashan-list');
    }
  };

  // 1. Google OAuth
  const handleGoogleSignIn = async () => {
    if (isSubmittingRef.current || isAnyLoading) return;
    setErrorMessage(null);
    setInfoMessage(null);
    setGoogleLoading(true);
    isSubmittingRef.current = true;

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('cancel') || msg.includes('abort') || msg.includes('closed')) {
          setErrorMessage('Google sign-in was cancelled.');
        } else if (msg.includes('offline') || !navigator.onLine) {
          setErrorMessage("You're offline. Connect to the internet and try again.");
        } else {
          setErrorMessage(formatAuthErrorMessage(error));
        }
      }
      // Note: In case of redirect, browser handles redirect. If popup returns smoothly:
      // triggerSuccessState('signin');
    } catch (err) {
      setErrorMessage(formatAuthErrorMessage(err));
    } finally {
      isSubmittingRef.current = false;
      setGoogleLoading(false);
    }
  };

  // 2. Email Sign In
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || isAnyLoading) return;

    setErrorMessage(null);
    setInfoMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!trimmedPass) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setErrorMessage("You're offline. Connect to the internet and try again.");
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);

    try {
      const { error } = await signIn(trimmedEmail, trimmedPass);
      if (error) {
        const lower = error.message.toLowerCase();
        if (
          lower.includes('invalid login credentials') ||
          lower.includes('invalid_grant') ||
          lower.includes('incorrect password') ||
          lower.includes('invalid credentials')
        ) {
          setErrorMessage('Incorrect email or password. Please try again.');
        } else if (
          lower.includes('user not found') ||
          lower.includes('unregistered') ||
          lower.includes('no user')
        ) {
          setErrorMessage("That email isn't registered yet. Create an account to continue.");
        } else if (lower.includes('email not confirmed')) {
          setErrorMessage('Please check your inbox to confirm your email before signing in.');
        } else {
          setErrorMessage(formatAuthErrorMessage(error));
        }
        return;
      }

      // Successful Sign In
      triggerSuccessState('signin');
    } catch (err) {
      setErrorMessage(formatAuthErrorMessage(err));
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  // 3. Email Sign Up
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || isAnyLoading) return;

    setErrorMessage(null);
    setInfoMessage(null);

    const trimmedName = fullName.trim();
    const trimmedPhone = phoneNumber.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedName) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!trimmedPhone) {
      setErrorMessage('Please enter your phone number.');
      return;
    }
    const phoneValidation = validatePhoneNumber(trimmedPhone);
    if (!phoneValidation.valid) {
      setErrorMessage(phoneValidation.reason || 'Please enter a valid phone number (e.g. 0300 1234567).');
      return;
    }
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!trimmedPass) {
      setErrorMessage('Please enter a password.');
      return;
    }
    if (trimmedPass.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (trimmedPass !== trimmedConfirm) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }
    if (!agreedToTerms) {
      setErrorMessage('Please agree to the Terms & Privacy Policy to create your account.');
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);

    try {
      // Offline fallback: create local user account
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        await startOfflineOnboarding({
          fullName: trimmedName,
          phoneNumber: phoneValidation.cleaned || trimmedPhone,
          language: language as any,
        });
        triggerSuccessState('signup');
        return;
      }

      const { error } = await signUp(
        trimmedEmail,
        trimmedPass,
        trimmedName,
        phoneValidation.cleaned || trimmedPhone
      );

      if (error) {
        const lower = error.message.toLowerCase();
        if (
          lower.includes('user already registered') ||
          lower.includes('already registered') ||
          lower.includes('email already in use') ||
          lower.includes('already exists')
        ) {
          setErrorMessage('This email is already registered. Please sign in instead.');
        } else if (lower.includes('password') && lower.includes('weak')) {
          setErrorMessage('Please choose a stronger password.');
        } else {
          setErrorMessage(formatAuthErrorMessage(error));
        }
        return;
      }

      // Successful Sign Up
      triggerSuccessState('signup');
    } catch (err) {
      setErrorMessage(formatAuthErrorMessage(err));
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  // 4. Forgot Password Submit
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || isAnyLoading) return;

    setErrorMessage(null);
    setInfoMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setErrorMessage("You're offline. Connect to the internet and try again.");
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);

    try {
      const { error } = await sendPasswordResetEmail(trimmedEmail);
      if (error) {
        setErrorMessage(formatAuthErrorMessage(error));
      } else {
        setInfoMessage('Password reset link sent! Please check your email inbox.');
      }
    } catch (err) {
      setErrorMessage(formatAuthErrorMessage(err));
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  // 5. Reset Password (New Password Save)
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || isAnyLoading) return;

    setErrorMessage(null);
    setInfoMessage(null);

    const trimmedPass = newPassword.trim();
    const trimmedConfirm = confirmNewPassword.trim();

    if (!trimmedPass) {
      setErrorMessage('Please enter a new password.');
      return;
    }
    if (trimmedPass.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }
    if (trimmedPass !== trimmedConfirm) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);

    try {
      const { error } = await updatePassword(trimmedPass);
      if (error) {
        setErrorMessage(formatAuthErrorMessage(error));
      } else {
        triggerSuccessState('signin');
      }
    } catch (err) {
      setErrorMessage(formatAuthErrorMessage(err));
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  // Confetti/particle dots around success badge
  const particles = useMemo(() => [
    { tx: 0, ty: -70, color: '#FCBC1F', size: 6 },
    { tx: 54, ty: -52, color: '#10B981', size: 5 },
    { tx: 72, ty: -4, color: '#FCBC1F', size: 6 },
    { tx: 52, ty: 50, color: '#047857', size: 5 },
    { tx: 4, ty: 70, color: '#FCBC1F', size: 5 },
    { tx: -54, ty: 48, color: '#10B981', size: 6 },
    { tx: -72, ty: -6, color: '#F97316', size: 5 },
    { tx: -50, ty: -54, color: '#003527', size: 5 },
    { tx: 30, ty: -64, color: '#A7F3D0', size: 4 },
    { tx: -34, ty: 60, color: '#FDE68A', size: 4 },
  ], []);

  // Browse Home button click on Success screen
  const handleBrowseHome = () => {
    onSuccess?.();
  };

  return (
    <div className="min-h-screen bg-[#F7FAF5] flex flex-col justify-between items-center px-4 py-6 sm:py-10 text-neutral-900 font-['Manrope'] selection:bg-[#003527] selection:text-white">
      {/* Centered Application Card Frame */}
      <div className="w-full max-w-[440px] mx-auto flex flex-col justify-between flex-1 bg-white sm:rounded-3xl sm:border sm:border-neutral-200/80 sm:shadow-sm px-5 py-6 sm:px-8 sm:py-9">

        {/* ─── TOP BAR ─── */}
        <div className="flex items-center justify-between w-full mb-6">
          {mode !== 'success' ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isAnyLoading}
              aria-label="Go back"
              className="w-10 h-10 rounded-full border border-neutral-200/90 bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-700 transition-colors shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-700" />
            </button>
          ) : (
            <div className="w-10 h-10" />
          )}

          {/* YAAD Logo */}
          <div className="flex items-center gap-2">
            <img
              src={APP_IMAGES.logoTransparent}
              alt="YAAD"
              className="w-8 h-8 object-contain"
            />
            <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-lg tracking-tight text-[#003527]">
              YAAD
            </span>
          </div>

          {/* Language Switch */}
          <div className="flex items-center bg-neutral-100/80 rounded-full p-0.5 border border-neutral-200/60 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-white text-[#003527] shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ur')}
              className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                language === 'ur'
                  ? 'bg-[#003527] text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              اردو
            </button>
          </div>
        </div>

        {/* ─── ERROR & INFO NOTIFICATIONS ─── */}
        {errorMessage && mode !== 'success' && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-800 text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-fadeIn"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-snug flex-1">{errorMessage}</span>
          </div>
        )}

        {infoMessage && mode !== 'success' && (
          <div
            role="status"
            className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-fadeIn"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-snug flex-1">{infoMessage}</span>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* ─── STATE 1: SIGN IN ─────────────────────────────────────── */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {mode === 'signin' && (
          <div className="flex-1 flex flex-col justify-center">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-['Plus_Jakarta_Sans'] tracking-tight">
                {isUrdu ? 'خوش آمدید' : 'Welcome Back'}
              </h1>
              <p className="text-neutral-500 text-xs sm:text-sm mt-1.5 font-normal leading-relaxed">
                {isUrdu
                  ? 'اپنے اکاؤنٹ تک رسائی کے لیے اپنے ای میل اور پاس ورڈ سے سائن ان کریں۔'
                  : 'Stay connected by signing in with your email and password to access your account.'}
              </p>
            </div>

            {/* Google Authentication Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isAnyLoading}
              className="w-full h-12 rounded-full border border-neutral-300/90 bg-white hover:bg-neutral-50 text-neutral-800 text-sm font-semibold font-['Manrope'] shadow-2xs flex items-center justify-center gap-3 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60 mb-5"
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-neutral-600" />
              ) : (
                <GoogleOfficialIcon className="w-5 h-5" />
              )}
              <span>{isUrdu ? 'گوگل کے ساتھ جاری رکھیں' : 'Continue with Google'}</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-5">
              <div className="border-t border-neutral-200 w-full" />
              <span className="bg-white px-3 text-xs font-['Manrope'] text-neutral-400 font-medium">
                or
              </span>
              <div className="border-t border-neutral-200 w-full" />
            </div>

            {/* Sign In Form */}
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              {/* Email Address */}
              <div>
                <label
                  htmlFor="signin_email"
                  className="block text-xs font-semibold text-neutral-700 mb-1.5"
                >
                  {isUrdu ? 'ای میل ایڈریس' : 'Email Address'}
                </label>
                <input
                  id="signin_email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={isAnyLoading}
                  className="w-full h-12 px-4 rounded-2xl border border-neutral-200/90 bg-neutral-50/60 text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/10 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="signin_password"
                  className="block text-xs font-semibold text-neutral-700 mb-1.5"
                >
                  {isUrdu ? 'پاس ورڈ' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    id="signin_password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isAnyLoading}
                    className="w-full h-12 px-4 pr-12 rounded-2xl border border-neutral-200/90 bg-neutral-50/60 text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/10 focus:bg-white transition-all disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot_password');
                    setErrorMessage(null);
                    setInfoMessage(null);
                  }}
                  className="text-xs font-medium text-neutral-500 hover:text-[#003527] transition-colors cursor-pointer"
                >
                  {isUrdu ? 'پاس ورڈ بھول گئے؟' : 'Forgot Password?'}
                </button>
              </div>

              {/* Primary CTA: Sign In */}
              <button
                type="submit"
                disabled={isAnyLoading}
                className="w-full h-12 rounded-full bg-[#003527] hover:bg-[#00271c] active:bg-[#001f16] text-white font-['Manrope'] text-sm font-bold shadow-sm hover:shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <span>{isUrdu ? 'سائن ان کریں' : 'Sign In'}</span>
                )}
              </button>
            </form>

            {/* Bottom Navigation */}
            <div className="text-center mt-7 text-xs sm:text-sm text-neutral-500 font-medium">
              <span>{isUrdu ? 'اکاؤنٹ نہیں ہے؟ ' : "Don't have an account? "}</span>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                  setInfoMessage(null);
                }}
                className="text-[#003527] font-bold hover:underline cursor-pointer ml-1"
              >
                {isUrdu ? 'اکاؤنٹ بنائیں' : 'Sign Up'}
              </button>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* ─── STATE 2: CREATE YOUR ACCOUNT / SIGN UP ─────────────────── */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {mode === 'signup' && (
          <div className="flex-1 flex flex-col justify-center">
            {/* Header */}
            <div className="mb-5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-['Plus_Jakarta_Sans'] tracking-tight">
                {isUrdu ? 'اپنا اکاؤنٹ بنائیں' : 'Create your account'}
              </h1>
              <p className="text-neutral-500 text-xs sm:text-sm mt-1.5 font-normal leading-relaxed">
                {isUrdu
                  ? 'اکاؤنٹ بنانے اور شروع کرنے کے لیے اپنا نام، موبائل نمبر، ای میل اور پاس ورڈ درج کریں۔'
                  : 'Provide your full name, email, and password to create your account and get started.'}
              </p>
            </div>

            {/* Google Authentication Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isAnyLoading}
              className="w-full h-12 rounded-full border border-neutral-300/90 bg-white hover:bg-neutral-50 text-neutral-800 text-sm font-semibold font-['Manrope'] shadow-2xs flex items-center justify-center gap-3 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60 mb-5"
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-neutral-600" />
              ) : (
                <GoogleOfficialIcon className="w-5 h-5" />
              )}
              <span>{isUrdu ? 'گوگل کے ساتھ جاری رکھیں' : 'Continue with Google'}</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-4">
              <div className="border-t border-neutral-200 w-full" />
              <span className="bg-white px-3 text-xs font-['Manrope'] text-neutral-400 font-medium">
                or
              </span>
              <div className="border-t border-neutral-200 w-full" />
            </div>

            {/* Sign Up Form */}
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="signup_name"
                  className="block text-xs font-semibold text-neutral-700 mb-1"
                >
                  {isUrdu ? 'مکمل نام' : 'Full Name'}
                </label>
                <input
                  id="signup_name"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ali Khan"
                  disabled={isAnyLoading}
                  className="w-full h-11 px-4 rounded-2xl border border-neutral-200/90 bg-neutral-50/60 text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/10 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label
                  htmlFor="signup_phone"
                  className="block text-xs font-semibold text-neutral-700 mb-1"
                >
                  {isUrdu ? 'فون نمبر' : 'Phone Number'}
                </label>
                <input
                  id="signup_phone"
                  type="tel"
                  autoComplete="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0300 1234567"
                  disabled={isAnyLoading}
                  className="w-full h-11 px-4 rounded-2xl border border-neutral-200/90 bg-neutral-50/60 text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/10 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="signup_email"
                  className="block text-xs font-semibold text-neutral-700 mb-1"
                >
                  {isUrdu ? 'ای میل ایڈریس' : 'Email Address'}
                </label>
                <input
                  id="signup_email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={isAnyLoading}
                  className="w-full h-11 px-4 rounded-2xl border border-neutral-200/90 bg-neutral-50/60 text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/10 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="signup_password"
                  className="block text-xs font-semibold text-neutral-700 mb-1"
                >
                  {isUrdu ? 'پاس ورڈ' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    id="signup_password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isAnyLoading}
                    className="w-full h-11 px-4 pr-12 rounded-2xl border border-neutral-200/90 bg-neutral-50/60 text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/10 focus:bg-white transition-all disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="signup_confirm_password"
                  className="block text-xs font-semibold text-neutral-700 mb-1"
                >
                  {isUrdu ? 'پاس ورڈ کی تصدیق کریں' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <input
                    id="signup_confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isAnyLoading}
                    className="w-full h-11 px-4 pr-12 rounded-2xl border border-neutral-200/90 bg-neutral-50/60 text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/10 focus:bg-white transition-all disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms & Privacy Agreement */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-neutral-600 font-['Manrope']">
                  <input
                    id="signup_terms_checkbox"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-[#003527] focus:ring-[#003527] accent-[#003527] cursor-pointer"
                  />
                  <span className="leading-tight">
                    {isUrdu ? (
                      <>
                        میں{' '}
                        <button
                          type="button"
                          onClick={() => onOpenLegalPage?.('terms')}
                          className="font-bold text-[#003527] underline hover:text-black cursor-pointer"
                        >
                          شرائط
                        </button>{' '}
                        اور{' '}
                        <button
                          type="button"
                          onClick={() => onOpenLegalPage?.('privacy')}
                          className="font-bold text-[#003527] underline hover:text-black cursor-pointer"
                        >
                          پرائیویسی پالیسی
                        </button>{' '}
                        سے متفق ہوں۔
                      </>
                    ) : (
                      <>
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={() => onOpenLegalPage?.('terms')}
                          className="font-bold text-[#003527] underline hover:text-black cursor-pointer"
                        >
                          Terms
                        </button>{' '}
                        &{' '}
                        <button
                          type="button"
                          onClick={() => onOpenLegalPage?.('privacy')}
                          className="font-bold text-[#003527] underline hover:text-black cursor-pointer"
                        >
                          Privacy Policy
                        </button>
                      </>
                    )}
                  </span>
                </label>
              </div>

              {/* Primary CTA: Sign Up */}
              <button
                type="submit"
                disabled={!agreedToTerms || isAnyLoading}
                className="w-full h-12 rounded-full bg-[#003527] hover:bg-[#00271c] active:bg-[#001f16] text-white font-['Manrope'] text-sm font-bold shadow-sm hover:shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-3"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <span>{isUrdu ? 'اکاؤنٹ بنائیں' : 'Sign Up'}</span>
                )}
              </button>
            </form>

            {/* Bottom Navigation */}
            <div className="text-center mt-6 text-xs sm:text-sm text-neutral-500 font-medium">
              <span>{isUrdu ? 'پہلے سے اکاؤنٹ ہے؟ ' : 'Already have an account? '}</span>
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                  setInfoMessage(null);
                }}
                className="text-[#003527] font-bold hover:underline cursor-pointer ml-1"
              >
                {isUrdu ? 'سائن ان کریں' : 'Sign In'}
              </button>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* ─── STATE 3: SUCCESSFUL AUTHENTICATION / ACCOUNT CREATED ─── */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {mode === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center py-6 text-center animate-fadeIn">
            {/* Animated Circular Success Badge */}
            <div className="relative flex items-center justify-center my-6">
              {/* Central Circle with YAAD Deep Green gradient */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#003527] to-[#047857] flex items-center justify-center shadow-[0_12px_36px_rgba(0,53,39,0.25)] transition-transform duration-500 ease-out transform scale-100">
                <svg
                  className="w-12 h-12 sm:w-14 sm:h-14 text-white"
                  viewBox="0 0 52 52"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle
                    cx="26"
                    cy="26"
                    r="23"
                    fill="none"
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth="2"
                  />
                  <path
                    d="M15 27 L23 35 L37 18"
                    fill="none"
                    stroke="white"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      strokeDasharray: 50,
                      strokeDashoffset: checkmarkDrawn ? 0 : 50,
                      transition: 'stroke-dashoffset 0.5s cubic-bezier(0.65, 0, 0.45, 1) 0.15s',
                    }}
                  />
                </svg>
              </div>

              {/* Celebratory Particles / Confetti Dots */}
              {particles.map((p, idx) => (
                <span
                  key={idx}
                  className="absolute rounded-full pointer-events-none transition-all duration-700 ease-out"
                  style={{
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    backgroundColor: p.color,
                    transform: particlesActive
                      ? `translate(${p.tx}px, ${p.ty}px) scale(1)`
                      : 'translate(0, 0) scale(0)',
                    opacity: particlesActive ? 0.85 : 0,
                  }}
                />
              ))}
            </div>

            {/* Success Copy */}
            <div
              className={`transition-all duration-500 ease-out ${
                contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-['Plus_Jakarta_Sans'] tracking-tight">
                {isUrdu ? 'کامیاب!' : 'Successful!'}
              </h2>
              <p className="text-neutral-500 text-xs sm:text-sm mt-2 max-w-xs mx-auto leading-relaxed">
                {successType === 'signup'
                  ? isUrdu
                    ? 'آپ کا اکاؤنٹ کامیابی سے بن چکا ہے اور اب تیار ہے۔'
                    : 'Your account is created successfully and ready now.'
                  : isUrdu
                  ? 'آپ کامیابی سے سائن ان ہو چکے ہیں۔ یاد میں خوش آمدید۔'
                  : 'You have signed in successfully. Welcome back to YAAD.'}
              </p>
            </div>

            {/* Action CTA: Browse Home */}
            <div
              className={`w-full mt-8 transition-all duration-500 ease-out ${
                contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              <button
                type="button"
                onClick={handleBrowseHome}
                className="w-full h-12 rounded-full bg-[#003527] hover:bg-[#00271c] active:bg-[#001f16] text-white font-['Manrope'] text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isUrdu ? 'ہوم اسکرین پر جائیں' : 'Browse Home'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* ─── STATE 4: FORGOT PASSWORD ─────────────────────────────── */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {mode === 'forgot_password' && (
          <div className="flex-1 flex flex-col justify-center">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-['Plus_Jakarta_Sans'] tracking-tight">
                {isUrdu ? 'پاس ورڈ ری سیٹ کریں' : 'Forgot Password'}
              </h1>
              <p className="text-neutral-500 text-xs sm:text-sm mt-1.5 font-normal leading-relaxed">
                {isUrdu
                  ? 'پاس ورڈ ری سیٹ کرنے کی ہدایات حاصل کرنے کے لیے اپنا رجسٹرڈ ای میل درج کریں۔'
                  : 'Enter your registered email address to receive password reset instructions.'}
              </p>
            </div>

            {/* Forgot Password Form */}
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="forgot_email"
                  className="block text-xs font-semibold text-neutral-700 mb-1.5"
                >
                  {isUrdu ? 'ای میل ایڈریس' : 'Email Address'}
                </label>
                <input
                  id="forgot_email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={isAnyLoading}
                  className="w-full h-12 px-4 rounded-2xl border border-neutral-200/90 bg-neutral-50/60 text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/10 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>

              {/* Primary CTA */}
              <button
                type="submit"
                disabled={isAnyLoading}
                className="w-full h-12 rounded-full bg-[#003527] hover:bg-[#00271c] active:bg-[#001f16] text-white font-['Manrope'] text-sm font-bold shadow-sm hover:shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-3"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <span>{isUrdu ? 'ری سیٹ لنک بھیجیں' : 'Send Reset Link'}</span>
                )}
              </button>
            </form>

            {/* Bottom Navigation */}
            <div className="text-center mt-7 text-xs sm:text-sm text-neutral-500 font-medium">
              <span>{isUrdu ? 'پاس ورڈ یاد آ گیا؟ ' : 'Remember your password? '}</span>
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                  setInfoMessage(null);
                }}
                className="text-[#003527] font-bold hover:underline cursor-pointer ml-1"
              >
                {isUrdu ? 'سائن ان کریں' : 'Sign In'}
              </button>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* ─── STATE 5: RESET PASSWORD (NEW PASSWORD) ───────────────── */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {mode === 'reset_password' && (
          <div className="flex-1 flex flex-col justify-center">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-['Plus_Jakarta_Sans'] tracking-tight">
                {isUrdu ? 'نیا پاس ورڈ درج کریں' : 'Set New Password'}
              </h1>
              <p className="text-neutral-500 text-xs sm:text-sm mt-1.5 font-normal leading-relaxed">
                {isUrdu
                  ? 'اپنے یاد اکاؤنٹ کے لیے کم از کم 6 ہندسوں کا نیا اور محفوظ پاس ورڈ درج کریں۔'
                  : 'Choose a new strong password for your YAAD account.'}
              </p>
            </div>

            {/* Reset Form */}
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="reset_new_password"
                  className="block text-xs font-semibold text-neutral-700 mb-1.5"
                >
                  {isUrdu ? 'نیا پاس ورڈ' : 'New Password'}
                </label>
                <div className="relative">
                  <input
                    id="reset_new_password"
                    type={showNewPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isAnyLoading}
                    className="w-full h-12 px-4 pr-12 rounded-2xl border border-neutral-200/90 bg-neutral-50/60 text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/10 focus:bg-white transition-all disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 transition-colors cursor-pointer"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="reset_confirm_password"
                  className="block text-xs font-semibold text-neutral-700 mb-1.5"
                >
                  {isUrdu ? 'نئے پاس ورڈ کی تصدیق کریں' : 'Confirm New Password'}
                </label>
                <div className="relative">
                  <input
                    id="reset_confirm_password"
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isAnyLoading}
                    className="w-full h-12 px-4 pr-12 rounded-2xl border border-neutral-200/90 bg-neutral-50/60 text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/10 focus:bg-white transition-all disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    aria-label={showConfirmNewPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 transition-colors cursor-pointer"
                  >
                    {showConfirmNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Primary CTA */}
              <button
                type="submit"
                disabled={isAnyLoading}
                className="w-full h-12 rounded-full bg-[#003527] hover:bg-[#00271c] active:bg-[#001f16] text-white font-['Manrope'] text-sm font-bold shadow-sm hover:shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-3"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <span>{isUrdu ? 'نیا پاس ورڈ محفوظ کریں' : 'Save New Password'}</span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
