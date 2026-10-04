import React from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

interface AdminNotFoundPageProps {
  onNavigate: (path: string) => void;
  message?: string;
  isSetupDisabled?: boolean;
}

export const AdminNotFoundPage: React.FC<AdminNotFoundPageProps> = ({
  onNavigate,
  message,
  isSetupDisabled,
}) => {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const isRegistrationAttempt = currentPath.includes('signup') || currentPath.includes('register') || currentPath.includes('join');

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Head robot guard */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
          {isRegistrationAttempt ? <Lock className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-rose-400 font-bold bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
            HTTP 404 • Not Found
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight font-['Manrope'] pt-1">
            {isRegistrationAttempt
              ? 'Registration Closed'
              : isSetupDisabled
              ? 'Setup Route Disabled'
              : 'Resource Not Found'}
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            {message ||
              (isRegistrationAttempt
                ? 'Public registration does not exist. YAAD Admin panel access is strictly invite-only by existing Super Admins.'
                : isSetupDisabled
                ? 'Initial Super Admin bootstrap is permanently closed because an admin account already exists.'
                : 'The admin resource or route you requested does not exist or has expired.')}
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => onNavigate('/admin/login')}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Admin Login</span>
          </button>
        </div>

        <div className="border-t border-slate-800/80 pt-4 text-[11px] text-slate-500 font-mono">
          Security policy: noindex, nofollow, invite-only
        </div>
      </div>
    </div>
  );
};
