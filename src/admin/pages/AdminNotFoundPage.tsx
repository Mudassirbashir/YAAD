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
    <div className="min-h-screen bg-[#FDF6E3]/30 flex flex-col justify-center items-center p-4 sm:p-6 text-neutral-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Brand Header */}
      <div className="w-full max-w-md mb-6 text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-emerald-900/10 shadow-md p-2 mx-auto">
          <img src="/logo.png" alt="YAAD Logo" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
          {isRegistrationAttempt ? <Lock className="w-7 h-7 text-[#003527]" /> : <ShieldAlert className="w-7 h-7 text-amber-700" />}
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-[#003527] font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {isRegistrationAttempt ? 'Access Restricted' : 'HTTP 404 • Not Found'}
          </span>
          <h1 className="text-2xl font-black text-[#003527] tracking-tight font-['Manrope'] pt-2">
            {isRegistrationAttempt
              ? 'Registration Closed'
              : isSetupDisabled
              ? 'Setup Route Disabled'
              : 'Resource Not Found'}
          </h1>
          <p className="text-xs text-neutral-600 leading-relaxed max-w-sm mx-auto">
            {message ||
              (isRegistrationAttempt
                ? 'Public self-registration is permanently disabled. YAAD Admin panel access is strictly invite-only, provisioned by the Super Admin.'
                : isSetupDisabled
                ? 'Initial Super Admin bootstrap is permanently closed because an admin account already exists.'
                : 'The admin resource or route you requested does not exist or has expired.')}
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => onNavigate('/admin/login')}
            className="w-full py-3.5 px-4 rounded-xl bg-[#003527] hover:bg-[#004734] active:bg-[#00251b] text-white font-bold text-xs shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Admin Login</span>
          </button>
        </div>

        <div className="border-t border-neutral-100 pt-4 text-[11px] text-neutral-400 font-mono">
          Security policy: noindex, nofollow, invite-only
        </div>
      </div>
    </div>
  );
};
