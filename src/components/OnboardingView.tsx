import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, UserPlus, LogIn, Loader2, AlertCircle, CheckCircle2, User, Mail, Lock } from 'lucide-react';
import { APP_IMAGES } from '../data/initialData';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface OnboardingViewProps {
  onComplete: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const { t } = useLanguage();
  const { signUp, signIn } = useAuth();
  const [step, setStep] = useState<number>(1);

  // Step 3 Auth Form States
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    if (authMode === 'signup' && !fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (authMode === 'signup') {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Account created successfully!');
          setTimeout(() => {
            onComplete();
          }, 600);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Signed in successfully!');
          setTimeout(() => {
            onComplete();
          }, 500);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during authentication';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto min-h-screen flex flex-col justify-between px-4 sm:px-6 md:px-8 py-5 sm:py-8 bg-background relative overflow-hidden">
      {/* Background ambient blobs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-primary-fixed/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-10 left-0 -ml-20 w-80 h-80 bg-secondary-fixed/20 rounded-full blur-3xl opacity-40 pointer-events-none" />

      {/* Top Header: Back & Skip */}
      <div className="w-full flex items-center justify-between z-10 h-10">
        {step > 1 ? (
          <button
            onClick={handleBack}
            className="text-primary hover:bg-surface-container-low p-2 rounded-full transition-colors flex items-center justify-center active:scale-95"
            aria-label="Previous step"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-8" />
        )}

        {step < 3 ? (
          <button
            onClick={onComplete}
            className="text-on-surface-variant font-['Manrope'] text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-surface-container-low transition-colors"
          >
            {t('onboarding.skip')}
          </button>
        ) : (
          <button
            onClick={onComplete}
            className="text-on-surface-variant font-['Manrope'] text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-surface-container-low transition-colors"
          >
            {t('onboarding.continueAsGuest')}
          </button>
        )}
      </div>

      {/* Main Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center z-10 w-full my-2">
        {step === 1 && (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-300 w-full">
            {/* Visual Box */}
            <div className="w-full max-w-sm aspect-square bg-surface-container-lowest rounded-3xl shadow-[0px_8px_30px_rgba(0,30,21,0.06)] overflow-hidden border border-surface-variant flex items-center justify-center p-6 mb-6 group hover:scale-[1.01] transition-transform">
              <img
                src={APP_IMAGES.onboarding1}
                alt="Shopper remembering items in grocery aisle"
                className="object-contain w-full h-full drop-shadow-lg"
              />
            </div>

            {/* Typography */}
            <div className="max-w-[360px] space-y-2">
              <h1 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-bold text-primary tracking-tight leading-snug">
                {t('onboarding.step1Title')}
              </h1>
              <p className="font-['Manrope'] text-sm sm:text-base text-on-surface-variant leading-relaxed">
                {t('onboarding.step1Subtitle')}
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-300 w-full">
            {/* Visual Box */}
            <div className="w-full max-w-sm aspect-square bg-surface-container-lowest rounded-3xl shadow-[0px_8px_30px_rgba(0,30,21,0.06)] overflow-hidden border border-surface-variant flex items-center justify-center p-6 mb-6 group hover:scale-[1.01] transition-transform">
              <img
                src={APP_IMAGES.onboarding2}
                alt="Hand tapping mobile list interface"
                className="object-contain w-full h-full drop-shadow-lg"
              />
            </div>

            {/* Typography */}
            <div className="max-w-[360px] space-y-2">
              <h1 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-bold text-primary tracking-tight leading-snug">
                {t('onboarding.step2Title')}
              </h1>
              <p className="font-['Manrope'] text-sm sm:text-base text-on-surface-variant leading-relaxed">
                {t('onboarding.step2Subtitle')}
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300 w-full max-w-sm">
            {/* App Brand Header */}
            <div className="flex items-center gap-2 mb-2">
              <img
                src={APP_IMAGES.logoSmall}
                alt="YAAD Logo"
                className="h-9 w-auto object-contain"
              />
              <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-primary">
                YAAD | <span className="font-urdu-brand text-2xl font-bold">یاد</span>
              </span>
            </div>

            <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-primary tracking-tight">
              {authMode === 'signup'
                ? t('onboarding.step3AuthTitle')
                : t('onboarding.signInBtn')}
            </h1>
            <p className="font-['Manrope'] text-xs sm:text-sm text-on-surface-variant mt-1 mb-4 max-w-xs">
              {t('onboarding.step3AuthSubtitle')}
            </p>

            {/* Mode Switcher Pills */}
            <div className="w-full flex p-1 bg-surface-container rounded-full text-xs font-['Manrope'] font-bold text-on-surface-variant mb-4">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-1.5 rounded-full transition-all flex items-center justify-center gap-1.5 ${
                  authMode === 'signup'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'hover:text-primary'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t('auth.signUpBtn')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-1.5 rounded-full transition-all flex items-center justify-center gap-1.5 ${
                  authMode === 'signin'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'hover:text-primary'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('auth.signInBtn')}</span>
              </button>
            </div>

            {/* Error & Success Messages */}
            {errorMsg && (
              <div className="w-full p-2.5 mb-3 bg-error-container/30 border border-error/20 rounded-2xl text-xs font-['Manrope'] text-error flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="w-full p-2.5 mb-3 bg-secondary-fixed/40 border border-secondary/30 rounded-2xl text-xs font-['Manrope'] text-primary font-bold flex items-center gap-2 text-left">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="w-full space-y-3 text-left">
              {authMode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant block px-1">
                    {t('onboarding.fullNameLabel')}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t('onboarding.fullNamePlaceholder')}
                      className="w-full h-11 bg-surface-container-lowest text-on-surface rounded-2xl pl-10 pr-3 text-sm border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline"
                      required={authMode === 'signup'}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant block px-1">
                  {t('onboarding.emailLabel')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('onboarding.emailPlaceholder')}
                    className="w-full h-11 bg-surface-container-lowest text-on-surface rounded-2xl pl-10 pr-3 text-sm border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant block px-1">
                  {t('onboarding.passwordLabel')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('onboarding.passwordPlaceholder')}
                    className="w-full h-11 bg-surface-container-lowest text-on-surface rounded-2xl pl-10 pr-3 text-sm border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 mt-3 rounded-full bg-primary text-on-primary font-['Manrope'] text-sm font-bold shadow-sm hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('loading')}</span>
                  </>
                ) : authMode === 'signup' ? (
                  <>
                    <span>{t('onboarding.createAccountBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>{t('onboarding.signInBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Controls (for Step 1 and Step 2) */}
      <div className="w-full flex flex-col items-center z-10 gap-4 mt-2 pb-1">
        {/* Progress Dots */}
        <div className="flex items-center gap-2">
          <div
            className={`transition-all duration-300 rounded-full ${
              step === 1
                ? 'w-6 h-2 bg-primary shadow-sm'
                : 'w-2 h-2 bg-surface-dim'
            }`}
          />
          <div
            className={`transition-all duration-300 rounded-full ${
              step === 2
                ? 'w-6 h-2 bg-secondary-container shadow-sm'
                : 'w-2 h-2 bg-surface-dim'
            }`}
          />
          <div
            className={`transition-all duration-300 rounded-full ${
              step === 3
                ? 'w-8 h-2 bg-primary shadow-sm'
                : 'w-2 h-2 bg-surface-dim'
            }`}
          />
        </div>

        {/* Action Button for Step 1 & 2 */}
        {step < 3 ? (
          <button
            onClick={handleNext}
            className="w-full max-w-md h-[54px] rounded-full bg-primary text-on-primary font-['Manrope'] text-base font-semibold flex items-center justify-center gap-2 shadow-[0px_8px_20px_rgba(0,30,21,0.15)] hover:bg-primary-container active:scale-[0.98] transition-all"
          >
            <span>{t('onboarding.next')}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onComplete}
            className="text-xs font-['Manrope'] font-semibold text-outline hover:text-primary transition-colors py-1"
          >
            {t('onboarding.continueAsGuest')}
          </button>
        )}
      </div>
    </main>
  );
};
