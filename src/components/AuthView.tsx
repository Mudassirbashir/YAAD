import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  LogIn,
  UserPlus,
  Loader2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Fingerprint,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { checkPasskeySupport, PasskeySupportStatus } from '../lib/passkey';

interface AuthViewProps {
  initialMode?: 'signin' | 'signup';
  onSuccess?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'signin',
  onSuccess,
}) => {
  const { t } = useLanguage();
  const {
    signIn,
    signUp,
    signInWithGoogle,
    signInWithPasskeyAuth,
    registerDevicePasskey,
    hasPasskey,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [passkeyStatus, setPasskeyStatus] = useState<PasskeySupportStatus>({
    isSupported: false,
    hasPlatformAuthenticator: false,
  });

  useEffect(() => {
    checkPasskeySupport().then(setPasskeyStatus);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (mode === 'signup' && !fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await signUp(trimmedEmail, password, fullName.trim());
        if (error) {
          setErrorMessage(error.message);
          setLoading(false);
          return;
        }
      } else {
        const { error } = await signIn(trimmedEmail, password);
        if (error) {
          setErrorMessage(error.message);
          setLoading(false);
          return;
        }
      }

      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setOauthLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMessage(error.message);
        setOauthLoading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign in failed';
      setErrorMessage(msg);
      setOauthLoading(false);
    }
  };

  const handlePasskeySignIn = async () => {
    if (!passkeyStatus.isSupported) {
      setErrorMessage(t('auth.passkeyNotSupported') || 'Passkeys are not supported on this browser.');
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email to use Passkey sign-in.');
      return;
    }

    setErrorMessage(null);
    setPasskeyLoading(true);

    try {
      const userHasPasskey = hasPasskey(trimmedEmail);
      if (userHasPasskey) {
        const { error } = await signInWithPasskeyAuth(trimmedEmail);
        if (error) {
          setErrorMessage(error.message);
        } else if (onSuccess) {
          onSuccess();
        }
      } else {
        // Register passkey for this device
        const { error } = await registerDevicePasskey(trimmedEmail, fullName.trim() || trimmedEmail.split('@')[0]);
        if (error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(null);
          // Now proceed to passkey auth
          const authRes = await signInWithPasskeyAuth(trimmedEmail);
          if (authRes.error) {
            setErrorMessage(authRes.error.message);
          } else if (onSuccess) {
            onSuccess();
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Passkey operation failed';
      setErrorMessage(msg);
    } finally {
      setPasskeyLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 py-8">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-xl border border-surface-dim space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-on-primary font-['Plus_Jakarta_Sans'] font-extrabold text-xl shadow-md mb-1">
            Y
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl text-primary tracking-tight">
            {mode === 'signin'
              ? t('auth.signInTitle') || 'Welcome Back'
              : t('auth.signUpTitle') || 'Create Account'}
          </h1>
          <p className="font-['Manrope'] text-xs text-on-surface-variant leading-relaxed">
            {mode === 'signin'
              ? t('auth.signInSubtitle') || 'Sign in to access and sync your shopping lists anywhere.'
              : t('auth.signUpSubtitle') || 'Join YAAD to keep your shopping lists securely synced.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-surface-container rounded-2xl border border-surface-dim">
          <button
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

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-error-container/30 border border-error/30 rounded-2xl text-xs text-error font-['Manrope'] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface-variant block">
                {t('auth.fullNameLabel') || 'Full Name'}
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('auth.fullNamePlaceholder') || 'Your name'}
                  className="w-full h-11 bg-surface-container text-on-surface text-sm rounded-2xl pl-10 pr-3.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant block">
              {t('auth.emailLabel') || 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder') || 'you@example.com'}
                className="w-full h-11 bg-surface-container text-on-surface text-sm rounded-2xl pl-10 pr-3.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant block">
              {t('auth.passwordLabel') || 'Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder') || 'Enter your password (min 6 chars)'}
                className="w-full h-11 bg-surface-container text-on-surface text-sm rounded-2xl pl-10 pr-3.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || oauthLoading || passkeyLoading}
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

        {/* Divider */}
        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-outline-variant w-full" />
          <span className="bg-surface-container-lowest px-3 font-['Manrope'] text-[11px] text-outline uppercase tracking-wider">
            {t('auth.orDivider') || 'or continue with'}
          </span>
          <div className="border-t border-outline-variant w-full" />
        </div>

        {/* Alternative Auth Buttons */}
        <div className="space-y-2.5">
          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || oauthLoading || passkeyLoading}
            className="w-full h-11 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/60 text-on-surface font-['Manrope'] text-xs font-semibold transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 active:scale-[0.99]"
          >
            {oauthLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{t('auth.googleBtn') || 'Continue with Google'}</span>
              </>
            )}
          </button>

          {/* Passkey / WebAuthn Sign In */}
          {passkeyStatus.isSupported && (
            <button
              type="button"
              onClick={handlePasskeySignIn}
              disabled={loading || oauthLoading || passkeyLoading}
              className="w-full h-11 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/60 text-on-surface font-['Manrope'] text-xs font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
            >
              {passkeyLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Fingerprint className="w-4 h-4 text-primary" />
                  <span>{t('auth.passkeyBtn') || 'Sign in with Passkey / Biometrics'}</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Security Assurance Badge */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-on-surface-variant font-['Manrope'] text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>{t('auth.secureNote') || 'Encrypted & synced securely to Supabase Cloud.'}</span>
        </div>
      </div>
    </div>
  );
};
