import React, { useState } from 'react';
import { Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminToast } from '../components/AdminToasts';

interface AdminForgotPasswordPageProps {
  onNavigate: (path: string) => void;
}

export const AdminForgotPasswordPage: React.FC<AdminForgotPasswordPageProps> = ({ onNavigate }) => {
  const { requestPasswordReset } = useAdminAuth();
  const toast = useAdminToast();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ message: string; devResetLink?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please provide a valid staff email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestPasswordReset(email.trim());
      if (res.error) {
        setError(res.error);
        toast.error('Request Failed', res.error);
        return;
      }

      setSuccessResult({
        message: res.message || 'Password reset link has been dispatched if account exists.',
        devResetLink: res.devResetLink,
      });
      toast.success('Reset Dispatched', 'Check your staff email or console for the reset link.');
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
            Password Recovery
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Request a secure password reset link for your admin staff account
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

        {successResult ? (
          <div className="space-y-5 text-center py-2 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-neutral-900">Reset Link Dispatched</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {successResult.message}
              </p>
            </div>

            {successResult.devResetLink && (
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-left space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                  Development Quick Link
                </span>
                <p className="text-xs text-neutral-800 break-all font-mono">
                  {successResult.devResetLink}
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate(successResult.devResetLink!)}
                  className="mt-2 text-xs font-bold text-[#003527] underline hover:text-emerald-700 cursor-pointer block"
                >
                  Click to open reset screen directly &rarr;
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => onNavigate('/admin/login')}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs transition-all cursor-pointer"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 block">Registered Staff Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yaad.app"
                  disabled={isLoading}
                  className="w-full bg-white border border-neutral-200 focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#003527] hover:bg-[#00271c] text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Send Recovery Link</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/admin/login')}
              disabled={isLoading}
              className="w-full py-2 text-xs text-neutral-500 hover:text-neutral-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin Login</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
