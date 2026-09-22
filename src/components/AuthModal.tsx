import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  UserPlus,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  onOpenLegalPage?: (page: 'terms' | 'privacy' | 'about' | 'help' | 'legal') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onOpenLegalPage,
}) => {
  const { signIn, signUp, signInWithGoogle, sendPasswordResetEmail } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot_password'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const isSubmittingRef = useRef(false);

  // Synchronize initialMode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setSuccessMsg(null);
      setResetEmailSent(false);
    }
  }, [isOpen, initialMode]);

  // Close modal when pressing Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    if (isSubmittingRef.current || isSubmitting || googleLoading) return;
    setErrorMsg(null);
    setGoogleLoading(true);
    isSubmittingRef.current = true;
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMsg(formatAuthErrorMessage(error));
      } else {
        onClose();
      }
    } catch (err) {
      setErrorMsg(formatAuthErrorMessage(err));
    } finally {
      isSubmittingRef.current = false;
      setGoogleLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || isSubmitting) return;

    setErrorMsg(null);
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      const { error } = await sendPasswordResetEmail(trimmedEmail);
      if (error) {
        setErrorMsg(formatAuthErrorMessage(error));
      } else {
        setResetEmailSent(true);
      }
    } catch (err) {
      setErrorMsg(formatAuthErrorMessage(err));
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || isSubmitting || googleLoading) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = fullName.trim();
    const trimmedPhone = phoneNumber.trim();

    if (mode === 'signup') {
      if (!trimmedName) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (!trimmedPhone) {
        setErrorMsg('Please enter your phone number.');
        return;
      }
      const validation = validatePhoneNumber(trimmedPhone);
      if (!validation.valid) {
        setErrorMsg(validation.reason || 'Please enter a valid phone number (e.g. +92 300 1234567).');
        return;
      }
      if (!trimmedEmail) {
        setErrorMsg('Please enter your email address.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
      if (!password || password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
    } else {
      if (!trimmedEmail || !password) {
        setErrorMsg('Please enter your email and password.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        const { error } = await signUp(trimmedEmail, password, trimmedName, trimmedPhone);
        if (error) {
          setErrorMsg(formatAuthErrorMessage(error));
        } else {
          setSuccessMsg('Account created successfully!');
          setTimeout(() => {
            onClose();
          }, 400);
        }
      } else {
        const { error } = await signIn(trimmedEmail, password);
        if (error) {
          setErrorMsg(formatAuthErrorMessage(error));
        } else {
          setSuccessMsg('Signed in successfully!');
          setTimeout(() => {
            onClose();
          }, 300);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(formatAuthErrorMessage(err));
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 max-w-[430px] w-full shadow-2xl border border-neutral-100 space-y-4 animate-in zoom-in-95 duration-200 font-['Manrope']"
      >
        {/* Header with Logo and Close */}
        <div className="flex justify-between items-center pb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white shadow-xs border border-neutral-200/80 flex items-center justify-center p-1">
              <img
                src={APP_IMAGES.logoTransparent}
                alt="YAAD"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-neutral-900 tracking-tight leading-none">
                {mode === 'forgot_password'
                  ? 'Reset Password'
                  : mode === 'signup'
                  ? 'Create an account'
                  : 'Welcome back'}
              </h2>
              <p className="text-[11px] text-neutral-500 font-normal mt-0.5">
                {mode === 'forgot_password'
                  ? "We'll send you an email with reset instructions"
                  : mode === 'signup'
                  ? 'Sign up to sync your shopping lists'
                  : 'Log in to continue with YAAD'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle (Only for signin / signup) */}
        {mode !== 'forgot_password' && (
          <div className="flex p-1 bg-[#f3f4f6] rounded-full text-xs font-semibold text-neutral-600">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-full transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-neutral-900 font-bold shadow-xs'
                  : 'hover:text-neutral-900 text-neutral-500'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-full transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-neutral-900 font-bold shadow-xs'
                  : 'hover:text-neutral-900 text-neutral-500'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* 1-Tap Google Sign In with Official Logo (Only for signin / signup) */}
        {mode !== 'forgot_password' && (
          <>
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isSubmitting || googleLoading}
              className="w-full h-12 rounded-full bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 text-sm font-semibold transition-all flex items-center justify-center gap-3 shadow-2xs hover:shadow-xs active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-neutral-800" />
              ) : (
                <GoogleOfficialIcon className="w-4 h-4" />
              )}
              <span>{mode === 'signin' ? 'Continue with Google' : 'Sign up with Google'}</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center py-0.5">
              <div className="border-t border-neutral-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-medium text-neutral-400 shrink-0">
                or with email
              </span>
            </div>
          </>
        )}

        {/* Error and Success alerts */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span className="flex-1 font-medium">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ----------------- FORGOT PASSWORD VIEW ----------------- */}
        {mode === 'forgot_password' ? (
          <div className="space-y-4">
            {!resetEmailSent ? (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3.5">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-[#f3f4f6] text-neutral-800 text-sm font-medium rounded-2xl px-4 border border-transparent focus:bg-white focus:border-neutral-300 focus:ring-2 focus:ring-neutral-900/10 outline-none transition-all placeholder:text-neutral-400 disabled:opacity-60"
                    autoComplete="email"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-full bg-neutral-900 hover:bg-black text-white text-sm font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <span>Send reset link</span>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-4 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="text-xs text-neutral-700">
                  A password reset link has been sent to your email. Please check your inbox.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
              }}
              disabled={isSubmitting}
              className="w-full h-10 rounded-2xl text-xs font-semibold text-neutral-500 hover:text-neutral-900 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to sign in</span>
            </button>
          </div>
        ) : (
          /* ----------------- SIGN IN / SIGN UP FORM ----------------- */
          <form onSubmit={handleSubmit} className="space-y-3 font-['Manrope']">
            {mode === 'signup' && (
              <>
                <div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full name"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-[#f3f4f6] text-neutral-800 text-sm font-medium rounded-2xl px-4 border border-transparent focus:bg-white focus:border-neutral-300 focus:ring-2 focus:ring-neutral-900/10 outline-none transition-all placeholder:text-neutral-400 disabled:opacity-60"
                    required
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Phone number (+92 300 1234567)"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-[#f3f4f6] text-neutral-800 text-sm font-medium rounded-2xl px-4 border border-transparent focus:bg-white focus:border-neutral-300 focus:ring-2 focus:ring-neutral-900/10 outline-none transition-all placeholder:text-neutral-400 disabled:opacity-60"
                    autoComplete="tel"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                disabled={isSubmitting}
                className="w-full h-12 bg-[#f3f4f6] text-neutral-800 text-sm font-medium rounded-2xl px-4 border border-transparent focus:bg-white focus:border-neutral-300 focus:ring-2 focus:ring-neutral-900/10 outline-none transition-all placeholder:text-neutral-400 disabled:opacity-60"
                autoComplete="email"
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                disabled={isSubmitting}
                className="w-full h-12 bg-[#f3f4f6] text-neutral-800 text-sm font-medium rounded-2xl ps-4 pe-11 border border-transparent focus:bg-white focus:border-neutral-300 focus:ring-2 focus:ring-neutral-900/10 outline-none transition-all placeholder:text-neutral-400 disabled:opacity-60"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
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

            {/* Forgot Password link (in sign in mode) */}
            {mode === 'signin' && (
              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot_password');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 hover:underline transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Primary Action Button (Solid Black Pill) */}
            <button
              type="submit"
              disabled={isSubmitting || googleLoading}
              className="w-full h-12 rounded-full bg-neutral-900 hover:bg-black text-white text-sm font-bold tracking-tight shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.99] mt-2 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : mode === 'signin' ? (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Create account</span>
                  <UserPlus className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer & Terms */}
        <div className="pt-2 text-center text-xs text-neutral-500 space-y-2">
          {mode !== 'forgot_password' && (
            <p className="text-neutral-600">
              {mode === 'signin' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="font-bold text-neutral-900 underline hover:text-black ml-1 cursor-pointer"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="font-bold text-neutral-900 underline hover:text-black ml-1 cursor-pointer"
                  >
                    Log in here
                  </button>
                </>
              )}
            </p>
          )}

          <div className="text-[11px] text-neutral-400 space-x-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLegalPage?.('terms');
              }}
              className="hover:text-neutral-700 hover:underline cursor-pointer"
            >
              Terms
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLegalPage?.('privacy');
              }}
              className="hover:text-neutral-700 hover:underline cursor-pointer"
            >
              Privacy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLegalPage?.('about');
              }}
              className="hover:text-neutral-700 hover:underline cursor-pointer"
            >
              About
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

