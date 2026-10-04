import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, KeyRound, AlertCircle, ArrowRight, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminToast } from '../components/AdminToasts';

interface AdminLoginPageProps {
  onNavigate: (path: string) => void;
  onRequires2faSetup: (tempToken: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onNavigate,
  onRequires2faSetup,
}) => {
  const { loginStep1, verify2fa } = useAdminAuth();
  const toast = useAdminToast();

  // Step 1: credentials, Step 2: TOTP code
  const [step, setStep] = useState<'credentials' | 'totp'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [tempToken, setTempToken] = useState<string | null>(null);

  // Errors & Loading
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; code?: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Validate Step 1
  const validateStep1 = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = 'Staff email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please provide a valid email format.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    if (!validateStep1() || isLoading) return;

    setIsLoading(true);
    try {
      const result = await loginStep1(email, password);
      if (result.error) {
        setGeneralError(result.error);
        toast.error('Authentication Failed', result.error);
        return;
      }

      if (result.requires2faSetup && result.tempToken) {
        toast.info('2FA Setup Required', 'Enforcing mandatory TOTP setup before first entry.');
        onRequires2faSetup(result.tempToken);
        return;
      }

      if (result.requires2faVerify && result.tempToken) {
        setTempToken(result.tempToken);
        setStep('totp');
        toast.info('Credentials Verified', 'Please enter your 6-digit authenticator code.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    if (!totpCode.trim() || !tempToken || isLoading) {
      setFieldErrors({ code: 'Please enter your 6-digit code.' });
      return;
    }

    if (!/^\d{6}$/.test(totpCode.trim())) {
      setFieldErrors({ code: 'Code must consist of exactly 6 digits.' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await verify2fa(tempToken, totpCode.trim());
      if (!res.success) {
        setGeneralError(res.error || 'Invalid 2FA code. Please check your app.');
        toast.error('2FA Verification Failed', res.error || 'Code was rejected.');
        return;
      }

      toast.success('Welcome Back', 'Admin session established securely.');
      onNavigate('/admin');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Brand Header */}
      <div className="w-full max-w-md mb-6 text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-extrabold text-xl shadow-lg mb-1">
          Y
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight font-['Manrope']">
          YAAD Admin Portal
        </h1>
        <p className="text-xs text-slate-400">
          Internal management console &amp; operations gateway
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative">
        {/* Security Banner */}
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-2 font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Staff Authorization</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
            TOTP 2FA
          </span>
        </div>

        {generalError && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1 leading-relaxed">{generalError}</div>
          </div>
        )}

        {step === 'credentials' ? (
          <form onSubmit={handleStep1Submit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Staff Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                  }}
                  placeholder="admin@yaad.app"
                  disabled={isLoading}
                  className={`w-full bg-slate-950 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-all ${
                    fieldErrors.email
                      ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                      : 'border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                  }`}
                  autoFocus
                />
              </div>
              {fieldErrors.email && <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 block">Password</label>
                <button
                  type="button"
                  onClick={() => onNavigate('/admin/forgot-password')}
                  className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                  }}
                  placeholder="••••••••••••"
                  disabled={isLoading}
                  className={`w-full bg-slate-950 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-all ${
                    fieldErrors.password
                      ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                      : 'border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                  }`}
                />
              </div>
              {fieldErrors.password && <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Verify Credentials</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleStep2Submit} className="space-y-5 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-center">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Two-Factor Authentication</h3>
              <p className="text-xs text-slate-400">
                Enter the 6-digit code generated by your Google Authenticator or 2FA app for{' '}
                <span className="text-slate-200 font-semibold">{email}</span>.
              </p>
            </div>

            <div className="space-y-2 text-center">
              <label className="text-xs font-bold text-slate-300 block">6-Digit TOTP Token</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={totpCode}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '');
                  setTotpCode(cleaned);
                  if (fieldErrors.code) setFieldErrors({ ...fieldErrors, code: undefined });
                }}
                placeholder="123456"
                disabled={isLoading}
                className="w-48 mx-auto bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-center text-2xl tracking-[0.4em] font-mono text-white rounded-xl py-2.5 outline-none font-bold"
                autoFocus
              />
              {fieldErrors.code && <p className="text-[11px] text-rose-400">{fieldErrors.code}</p>}
            </div>

            <div className="space-y-2">
              <button
                type="submit"
                disabled={isLoading || totpCode.length !== 6}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Authorize Admin Session</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('credentials');
                  setTotpCode('');
                  setGeneralError(null);
                }}
                disabled={isLoading}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to email and password</span>
              </button>
            </div>
          </form>
        )}

        {/* Demo Seed Credentials Notice in Dev */}
        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          <p>
            Default Dev Super Admin: <span className="font-mono text-slate-400">admin@yaad.app</span>
          </p>
          <p className="mt-0.5">Password: <span className="font-mono text-slate-400">YaadAdmin2026!</span></p>
        </div>
      </div>
    </div>
  );
};
