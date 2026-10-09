import React from 'react';
import { ShieldAlert, Mail, LogOut } from 'lucide-react';

interface SuspendedAccountModalProps {
  isOpen: boolean;
  reason?: string;
  onSignOut: () => void;
}

export const SuspendedAccountModal: React.FC<SuspendedAccountModalProps> = ({
  isOpen,
  reason,
  onSignOut,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="account_suspended_modal_backdrop"
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none"
    >
      <div className="bg-surface-container-lowest max-w-md w-full rounded-3xl p-6 sm:p-8 border border-red-500/30 shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Warning Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto ring-8 ring-red-500/10 shadow-xs">
          <ShieldAlert className="w-8 h-8 stroke-[2.2]" />
        </div>

        {/* Headings */}
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-on-surface font-['Plus_Jakarta_Sans'] tracking-tight">
            Account Suspended
          </h2>
          <p className="text-sm font-urdu font-bold text-red-600 dark:text-red-400">
            آپ کا اکاؤنٹ معطل کر دیا گیا ہے
          </p>
        </div>

        {/* Informational Notice */}
        <div className="bg-surface-container-low rounded-2xl p-4 border border-surface-dim/80 text-start space-y-2">
          <p className="text-xs text-outline font-['Manrope'] leading-relaxed">
            Your access to YAAD grocery lists and synced features has been temporarily suspended by YAAD administration.
          </p>
          <div className="pt-2 border-t border-surface-dim/60">
            <span className="text-[10px] uppercase font-bold tracking-wider text-outline block">
              Reason / معطلی کی وجہ:
            </span>
            <p className="text-xs font-semibold text-on-surface mt-0.5">
              {reason || 'Violation of community guidelines or security protocol.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-1">
          <a
            href={`mailto:support@yaad.app?subject=Account%20Suspension%20Appeal&body=Reason:%20${encodeURIComponent(reason || 'N/A')}`}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98] transition-all"
          >
            <Mail className="w-4 h-4" />
            <span>Contact Support / رابطہ کریں</span>
          </a>

          <button
            type="button"
            onClick={onSignOut}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-red-600 hover:bg-red-500/10 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out / لاگ آؤٹ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
