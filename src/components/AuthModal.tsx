import React, { useState, useEffect } from 'react';
import {
  X,
  Info,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  UserPlus,
  Loader2,
  Phone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { APP_IMAGES } from '../data/initialData';
import { formatAuthErrorMessage } from '../lib/supabase';
import { validatePhoneNumber } from '../utils/phone';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const { signIn, signUp, isConfigured } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = React.useRef(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || isSubmitting) return;

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
      if (!trimmedEmail) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setErrorMsg('Please enter a valid email address.');
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
      if (!password || password.length < 6) {
        setErrorMsg('Please choose a stronger password.');
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-surface-dim space-y-5 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-surface-dim/60 pb-3">
          <div className="flex items-center gap-2.5">
            <img
              src={APP_IMAGES.logoTransparent}
              alt="YAAD"
              className="w-8 h-8 object-contain"
            />
            <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-primary">
              {mode === 'signin' ? 'Sign In to YAAD' : 'Create an Account'}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:bg-surface-container-low transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isConfigured && (
          <div className="p-3 bg-secondary-fixed/20 border border-secondary/20 rounded-2xl text-xs font-['Manrope'] text-on-surface-variant flex items-start gap-2">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p>
              Supabase credentials not configured in environment variables yet (<code className="text-primary font-mono font-semibold">VITE_SUPABASE_URL</code>). You can still test offline or supply credentials in your environment.
            </p>
          </div>
        )}

        {/* Tab Toggle */}
        <div className="flex p-1 bg-surface-container rounded-full text-xs font-['Manrope'] font-bold text-on-surface-variant">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-full transition-all ${
              mode === 'signin'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'hover:text-primary'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-full transition-all ${
              mode === 'signup'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'hover:text-primary'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error and Success alerts */}
        {errorMsg && (
          <div className="p-3 bg-error-container/30 border border-error/20 rounded-2xl text-xs font-['Manrope'] text-error flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-secondary-fixed/40 border border-secondary/30 rounded-2xl text-xs font-['Manrope'] text-primary font-bold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-['Manrope']">
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Elena Vance"
                disabled={isSubmitting}
                className="w-full h-12 bg-surface-container-lowest text-on-surface rounded-2xl px-4 text-sm border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline disabled:opacity-60"
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isSubmitting}
              className="w-full h-12 bg-surface-container-lowest text-on-surface rounded-2xl px-4 text-sm border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline disabled:opacity-60"
              required
            />
          </div>

          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-outline absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  dir="ltr"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+92 300 1234567"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-surface-container-lowest text-on-surface rounded-2xl ps-10 pe-4 text-sm border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline disabled:opacity-60"
                  autoComplete="tel"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isSubmitting}
              className="w-full h-12 bg-surface-container-lowest text-on-surface rounded-2xl px-4 text-sm border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline disabled:opacity-60"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 mt-2 rounded-full bg-primary text-on-primary font-['Manrope'] text-sm font-bold shadow-sm hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Please wait...</span>
              </>
            ) : mode === 'signin' ? (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Create Account</span>
                <UserPlus className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-on-surface-variant">
          {mode === 'signin' ? (
            <>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                }}
                className="font-bold text-primary hover:underline ml-1"
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
                }}
                className="font-bold text-primary hover:underline ml-1"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

