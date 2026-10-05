import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  AlertCircle,
  ArrowRight,
  Loader2,
  Key,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminToast } from '../components/AdminToasts';

interface AdminLoginPageProps {
  intendedDestination?: string;
  onNavigate: (path: string) => void;
  onRequires2faSetup: (tempToken: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  intendedDestination = '/admin',
  onNavigate,
  onRequires2faSetup,
}) => {
  const { loginPasswordless, loginStep1, verify2fa } = useAdminAuth();
  const toast = useAdminToast();

  // Mode: 'totp' (passwordless 2FA code) | 'password' (email + password)
  const [authMode, setAuthMode] = useState<'totp' | 'password'>('totp');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);

  // Step 2 2FA State (when password was entered first)
  const [step2TempToken, setStep2TempToken] = useState<string | null>(null);
  const [step2AdminInfo, setStep2AdminInfo] = useState<{ name?: string; role?: string } | null>(null);

  // Errors & Loading
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; code?: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errors: { email?: string; password?: string; code?: string } = {};
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      errors.email = 'Staff email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errors.email = 'Please provide a valid email format.';
    }

    if (step2TempToken) {
      const cleanCode = code.trim();
      if (!cleanCode) {
        errors.code = useRecoveryCode ? 'Emergency recovery code is required.' : '6-digit authenticator code is required.';
      } else if (!useRecoveryCode && !/^\d{6}$/.test(cleanCode)) {
        errors.code = 'Authenticator code must consist of exactly 6 digits.';
      }
    } else if (authMode === 'password') {
      if (!password) {
        errors.password = 'Staff password is required.';
      }
    } else {
      const cleanCode = code.trim();
      if (!cleanCode) {
        errors.code = useRecoveryCode ? 'Emergency recovery code is required.' : '6-digit authenticator code is required.';
      } else if (!useRecoveryCode && !/^\d{6}$/.test(cleanCode)) {
        errors.code = 'Authenticator code must consist of exactly 6 digits.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    if (!validate() || isLoading) return;

    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanCode = code.trim().toUpperCase();

      // Step 2 verification (after password)
      if (step2TempToken) {
        const result = await verify2fa(step2TempToken, cleanCode);
        if (!result.success) {
          const errMsg = result.error || 'Invalid 2FA code. Please try again.';
          setGeneralError(errMsg);
          toast.error('2FA Verification Failed', errMsg);
          return;
        }

        toast.success('Welcome Back', 'Staff session authenticated successfully.');
        onNavigate(intendedDestination);
        return;
      }

      // Password Authentication
      if (authMode === 'password') {
        const res = await loginStep1(cleanEmail, password);

        if (res.error) {
          setGeneralError(res.error);
          toast.error('Sign In Failed', res.error);
          return;
        }

        if (res.requires2faSetup && res.tempToken) {
          toast.info('2FA Enrollment Required', 'Please set up mandatory TOTP authenticator.');
          onRequires2faSetup(res.tempToken);
          return;
        }

        if (res.requires2faVerify && res.tempToken) {
          setStep2TempToken(res.tempToken);
          setStep2AdminInfo(res.admin || null);
          setCode('');
          toast.info('2FA Verification', 'Please enter your 6-digit authenticator code.');
          return;
        }

        // Direct login success
        toast.success('Welcome Back', 'Staff session authenticated successfully.');
        onNavigate(intendedDestination);
        return;
      }

      // Passwordless Authentication with TOTP / Recovery Code
      const result = await loginPasswordless(cleanEmail, cleanCode);

      if (result.requires2faSetup && result.tempToken) {
        toast.info('2FA Enrollment Required', 'Please set up mandatory TOTP authenticator.');
        onRequires2faSetup(result.tempToken);
        return;
      }

      if (!result.success) {
        const errMsg = result.error || 'Authentication failed. Please verify your code.';
        setGeneralError(errMsg);
        toast.error('Sign In Failed', errMsg);
        return;
      }

      toast.success('Welcome Back', 'Staff session authenticated successfully.');
      onNavigate(intendedDestination);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF6E3]/30 flex flex-col justify-center items-center p-4 sm:p-6 text-neutral-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Brand Header */}
      <div className="w-full max-w-md mb-6 text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-emerald-900/10 shadow-md p-2">
          <img src="/logo.png" alt="YAAD Official Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-[#003527] tracking-tight font-['Manrope']">
            YAAD Admin Portal
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Internal Operations &amp; Management Gateway
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 relative">
        {/* Security Badge */}
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-50/80 border border-emerald-100 text-xs text-[#003527]">
          <div className="flex items-center gap-2 font-medium">
            <Lock className="w-3.5 h-3.5 text-[#003527]" />
            <span>Staff Security Standard</span>
          </div>
          <span className="font-mono text-[10px] text-[#003527] bg-[#FCBC1F]/20 px-2 py-0.5 rounded border border-[#FCBC1F]/40 font-bold">
            TOTP 2FA
          </span>
        </div>

        {/* Authentication Mode Switcher (Hidden when in Step 2 2FA) */}
        {!step2TempToken && (
          <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('totp');
                setGeneralError(null);
                setFieldErrors({});
              }}
              className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'totp'
                  ? 'bg-white text-[#003527] shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Authenticator / 2FA</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setGeneralError(null);
                setFieldErrors({});
              }}
              className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'password'
                  ? 'bg-white text-[#003527] shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Password + 2FA</span>
            </button>
          </div>
        )}

        {generalError && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1 leading-relaxed">{generalError}</div>
          </div>
        )}

        {step2TempToken && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-[#003527]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Password Verified &bull; Step 2 Required</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep2TempToken(null);
                setStep2AdminInfo(null);
                setCode('');
              }}
              className="text-[11px] font-bold underline hover:opacity-80 cursor-pointer"
            >
              Change
            </button>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* Email Field (Disabled in Step 2) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700 block">
              Staff Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                disabled={Boolean(step2TempToken)}
                autoComplete="email"
                placeholder="staff@yaadapp.pk"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                }}
                className={`w-full pl-10 pr-4 py-3 bg-neutral-50 border rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#003527] focus:bg-white transition-all disabled:opacity-70 disabled:bg-neutral-100 ${
                  fieldErrors.email ? 'border-rose-400 focus:ring-rose-400' : 'border-neutral-200'
                }`}
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
            {fieldErrors.email && (
              <p className="text-[11px] text-rose-600 font-medium pl-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password Field (Only when in Password mode and NOT yet in step 2) */}
          {authMode === 'password' && !step2TempToken && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-700 block">
                  Staff Password
                </label>
                <button
                  type="button"
                  onClick={() => onNavigate('/admin/forgot-password')}
                  className="text-[11px] font-semibold text-[#003527] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                  }}
                  className={`w-full pl-10 pr-4 py-3 bg-neutral-50 border rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#003527] focus:bg-white transition-all ${
                    fieldErrors.password ? 'border-rose-400 focus:ring-rose-400' : 'border-neutral-200'
                  }`}
                />
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-rose-600 font-medium pl-1">{fieldErrors.password}</p>
              )}
            </div>
          )}

          {/* Authenticator Code / Recovery Code Field (When in TOTP mode OR Step 2) */}
          {(authMode === 'totp' || step2TempToken) && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-700 block">
                  {useRecoveryCode ? 'Emergency Recovery Code' : '6-Digit Authenticator Code'}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setUseRecoveryCode(!useRecoveryCode);
                    setCode('');
                    setFieldErrors({});
                  }}
                  className="text-[11px] font-semibold text-[#003527] hover:underline cursor-pointer"
                >
                  {useRecoveryCode ? 'Use 6-digit TOTP' : 'Use recovery code'}
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  autoComplete="one-time-code"
                  inputMode={useRecoveryCode ? 'text' : 'numeric'}
                  maxLength={useRecoveryCode ? 12 : 6}
                  placeholder={useRecoveryCode ? 'ABCD-EFGH' : '123456'}
                  value={code}
                  onChange={(e) => {
                    const val = useRecoveryCode
                      ? e.target.value.toUpperCase()
                      : e.target.value.replace(/\D/g, '');
                    setCode(val);
                    if (fieldErrors.code) setFieldErrors({ ...fieldErrors, code: undefined });
                  }}
                  className={`w-full pl-10 pr-4 py-3 bg-neutral-50 border rounded-xl font-mono text-center tracking-widest text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#003527] focus:bg-white transition-all ${
                    fieldErrors.code ? 'border-rose-400 focus:ring-rose-400' : 'border-neutral-200'
                  }`}
                />
                {useRecoveryCode ? (
                  <Key className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5 pointer-events-none" />
                ) : (
                  <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5 pointer-events-none" />
                )}
              </div>
              {fieldErrors.code ? (
                <p className="text-[11px] text-rose-600 font-medium pl-1">{fieldErrors.code}</p>
              ) : (
                <p className="text-[10px] text-neutral-400 pl-1">
                  {useRecoveryCode
                    ? 'Enter one of your 10 single-use emergency backup codes (e.g. ABCD-EFGH).'
                    : 'Open Google Authenticator or your 2FA app to view current 6-digit code.'}
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#003527] hover:bg-[#004734] active:bg-[#00251b] text-white font-bold text-xs shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Staff Credentials...</span>
              </>
            ) : (
              <>
                <span>
                  {step2TempToken
                    ? 'Complete 2FA Verification'
                    : authMode === 'password'
                    ? 'Verify Password'
                    : 'Sign In to Admin Workspace'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Informative Footer */}
        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#003527]" />
            Strict Invite-Only
          </span>
          <button
            type="button"
            onClick={() => onNavigate('/admin/forgot-password')}
            className="text-neutral-500 hover:text-[#003527] hover:underline cursor-pointer"
          >
            Account recovery help
          </button>
        </div>
      </div>

      {/* Page Footer */}
      <div className="mt-8 text-center text-xs text-neutral-400">
        &copy; 2026 YAAD (yaadapppk) &bull; Internal Operations Standard
      </div>
    </div>
  );
};
