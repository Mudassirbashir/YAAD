import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  LogIn,
  UserPlus,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { APP_IMAGES } from '../data/initialData';

interface AuthViewProps {
  initialMode?: 'signin' | 'signup';
  onSuccess?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'signin',
  onSuccess,
}) => {
  const { t } = useLanguage();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage(t('auth.fillAllFields') || 'Please fill in all required fields.');
      return;
    }

    if (mode === 'signup' && !fullName.trim()) {
      setErrorMessage(t('profileSetup.nameRequired') || 'Please enter your full name.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage(t('auth.passwordLength') || 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await signUp(trimmedEmail, password, fullName.trim());
        if (error) {
          // Format user-friendly error message
          let friendly = error.message;
          if (friendly.toLowerCase().includes('already registered')) {
            friendly = 'An account with this email already exists. Please sign in instead.';
          }
          setErrorMessage(friendly);
          setLoading(false);
          return;
        }
      } else {
        const { error } = await signIn(trimmedEmail, password);
        if (error) {
          let friendly = error.message;
          if (friendly.toLowerCase().includes('invalid login credentials')) {
            friendly = 'Incorrect email or password. Please check your credentials and try again.';
          }
          setErrorMessage(friendly);
          setLoading(false);
          return;
        }
      }

      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      setErrorMessage(msg);
    } finally {
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
              ? t('auth.signInSubtitle') || 'Sign in with your email to access and sync your shopping lists.'
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
        {errorMessage && (
          <div
            id="auth_error_alert"
            className="p-3 bg-error-container/40 border border-error/30 rounded-2xl text-xs text-error font-['Manrope'] flex items-center gap-2 animate-in fade-in duration-150"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-error" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

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
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('auth.fullNamePlaceholder') || 'Your full name'}
                  className="w-full h-11 bg-surface-container text-on-surface text-sm rounded-2xl ps-10 pe-3.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline font-['Manrope']"
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
                className="w-full h-11 bg-surface-container text-on-surface text-sm rounded-2xl ps-10 pe-3.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline font-['Manrope']"
                autoComplete="email"
                required
              />
            </div>
          </div>

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
                className="w-full h-11 bg-surface-container text-on-surface text-sm rounded-2xl ps-10 pe-3.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline font-['Manrope']"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
              />
            </div>
          </div>

          <button
            id="auth_submit_btn"
            type="submit"
            disabled={loading}
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
