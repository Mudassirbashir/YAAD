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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-md mb-6 text-center space-y-2">
        <h1 className="text-2xl font-black text-white tracking-tight font-['Manrope']">
          Password Recovery
        </h1>
        <p className="text-xs text-slate-400">
          Request a secure password reset link for your admin staff account
        </p>
      </div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {error && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        {successResult ? (
          <div className="space-y-5 text-center py-2 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-white">Reset Link Dispatched</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {successResult.message}
              </p>
            </div>

            {successResult.devResetLink && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Development Quick Link
                </span>
                <p className="text-xs text-slate-300 break-all font-mono">
                  {successResult.devResetLink}
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate(successResult.devResetLink!)}
                  className="mt-2 text-xs font-bold text-emerald-400 underline hover:text-emerald-300 cursor-pointer block"
                >
                  Click to open reset screen directly &rarr;
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => onNavigate('/admin/login')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Registered Staff Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yaad.app"
                  disabled={isLoading}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Send Recovery Link</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/admin/login')}
              disabled={isLoading}
              className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
