import React, { useState } from 'react';
import { KeyRound, Lock, AlertCircle, CheckCircle2, Loader2, ArrowRight, Check, X } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminToast } from '../components/AdminToasts';

interface AdminResetPasswordPageProps {
  token: string;
  onNavigate: (path: string) => void;
}

export const AdminResetPasswordPage: React.FC<AdminResetPasswordPageProps> = ({
  token,
  onNavigate,
}) => {
  const { completePasswordReset } = useAdminAuth();
  const toast = useAdminToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const passwordChecks = {
    length: password.length >= 12,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password),
    matchesConfirm: Boolean(password && confirmPassword && password === confirmPassword),
  };
  const isPasswordValid =
    passwordChecks.length &&
    passwordChecks.hasUpper &&
    passwordChecks.hasLower &&
    passwordChecks.hasNumber &&
    passwordChecks.hasSymbol;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Missing password reset token. Please request a new link.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password must meet complexity requirements (min 12 chars, upper/lower/number/symbol).');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await completePasswordReset(token, password);
      if (!res.success) {
        setError(res.error || 'Failed to reset password. Link may have expired.');
        toast.error('Reset Failed', res.error || 'Please request a fresh reset link.');
        return;
      }

      setIsSuccess(true);
      toast.success('Password Updated', 'Your password has been changed. You can now log in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF6E3]/35 flex flex-col justify-center items-center p-4 sm:p-6 text-neutral-900 font-['Plus_Jakarta_Sans',sans-serif] relative selection:bg-[#FCBC1F]/30">
      <div className="w-full max-w-md mb-6 text-center space-y-3">
        <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-white border border-neutral-200/80 shadow-xs mb-1">
          <img src="/logo.png" alt="YAAD" className="w-10 h-10 object-contain" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-[#003527] tracking-tight font-['Manrope']">
            Set New Staff Password
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Choose a secure, unique password for your YAAD staff access
          </p>
        </div>
      </div>

      <div className="w-full max-w-md bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {error && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        {isSuccess ? (
          <div className="text-center space-y-4 py-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-neutral-900">Password Reset Complete</h3>
              <p className="text-xs text-neutral-500">
                All existing sessions have been terminated. Please sign in with your new credentials and 2FA.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/admin/login')}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#003527] hover:bg-[#00271c] text-white font-bold text-sm shadow-xs transition-all cursor-pointer"
            >
              Go to Admin Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 block">New Password (Min 12 characters)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isLoading}
                  className="w-full bg-white border border-neutral-200 focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 block">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isLoading}
                  className="w-full bg-white border border-neutral-200 focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all"
                />
              </div>
            </div>

            {/* Live Password Complexity Checklist */}
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1.5">
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div className={`flex items-center gap-1.5 ${passwordChecks.length ? 'text-emerald-700 font-semibold' : 'text-neutral-400'}`}>
                  {passwordChecks.length ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>Min 12 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordChecks.hasUpper ? 'text-emerald-700 font-semibold' : 'text-neutral-400'}`}>
                  {passwordChecks.hasUpper ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>Uppercase (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordChecks.hasLower ? 'text-emerald-700 font-semibold' : 'text-neutral-400'}`}>
                  {passwordChecks.hasLower ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>Lowercase (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordChecks.hasNumber ? 'text-emerald-700 font-semibold' : 'text-neutral-400'}`}>
                  {passwordChecks.hasNumber ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>Number (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordChecks.hasSymbol ? 'text-emerald-700 font-semibold' : 'text-neutral-400'}`}>
                  {passwordChecks.hasSymbol ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>Symbol (!@#$...)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordChecks.matchesConfirm ? 'text-emerald-700 font-semibold' : 'text-neutral-400'}`}>
                  {passwordChecks.matchesConfirm ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>Passwords match</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isPasswordValid || password !== confirmPassword}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#003527] hover:bg-[#00271c] text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Save Password &amp; Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
