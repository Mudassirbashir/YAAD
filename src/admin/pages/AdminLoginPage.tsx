import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, KeyRound, AlertCircle, ArrowRight, Loader2, Key, HelpCircle } from 'lucide-react';
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
  const { loginPasswordless } = useAdminAuth();
  const toast = useAdminToast();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);

  // Errors & Loading
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; code?: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errors: { email?: string; code?: string } = {};
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      errors.email = 'Staff email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errors.email = 'Please provide a valid email format.';
    }

    const cleanCode = code.trim();
    if (!cleanCode) {
      errors.code = useRecoveryCode ? 'Emergency recovery code is required.' : '6-digit authenticator code is required.';
    } else if (!useRecoveryCode && !/^\d{6}$/.test(cleanCode)) {
      errors.code = 'Authenticator code must consist of exactly 6 digits.';
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
      onNavigate('/admin');
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
      <div className="w-full max-w-md bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative">
        {/* Security Badge */}
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-50/80 border border-emerald-100 text-xs text-[#003527]">
          <div className="flex items-center gap-2 font-medium">
            <Lock className="w-3.5 h-3.5 text-[#003527]" />
            <span>Passwordless Staff Security</span>
          </div>
          <span className="font-mono text-[10px] text-[#003527] bg-[#FCBC1F]/20 px-2 py-0.5 rounded border border-[#FCBC1F]/40 font-bold">
            TOTP 2FA
          </span>
        </div>

        {generalError && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1 leading-relaxed">{generalError}</div>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700 block">
              Staff Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="staff@yaadapp.pk"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                }}
                className={`w-full pl-10 pr-4 py-3 bg-neutral-50 border rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#003527] focus:bg-white transition-all ${
                  fieldErrors.email ? 'border-rose-400 focus:ring-rose-400' : 'border-neutral-200'
                }`}
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
            {fieldErrors.email && (
              <p className="text-[11px] text-rose-600 font-medium pl-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Authenticator Code / Recovery Code Field (NO PASSWORD FIELD) */}
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
                className="text-[11px] font-semibold text-[#003527] hover:underline"
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
                maxLength={useRecoveryCode ? 10 : 6}
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
                  ? 'Enter one of your 10 single-use emergency backup codes.'
                  : 'Open Google Authenticator or your 2FA app to view current code.'}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#003527] hover:bg-[#004734] active:bg-[#00251b] text-white font-bold text-xs shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Authorization...</span>
              </>
            ) : (
              <>
                <span>Sign In to Admin Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Informative Footer */}
        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#003527]" />
            Strict Invite-Only Access
          </span>
          <button
            type="button"
            onClick={() => onNavigate('/admin/signup')}
            className="text-neutral-500 hover:text-[#003527] hover:underline cursor-pointer"
          >
            Need an account?
          </button>
        </div>
      </div>

      {/* Page Footer */}
      <div className="mt-8 text-center text-xs text-neutral-400">
        &copy; 2026 YAAD (yaadapppk) &bull; Internal Security Standard
      </div>
    </div>
  );
};
