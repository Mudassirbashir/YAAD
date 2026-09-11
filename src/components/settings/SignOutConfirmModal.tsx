import React from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface SignOutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isSigningOut: boolean;
}

export const SignOutConfirmModal: React.FC<SignOutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSigningOut,
}) => {
  const { t, isRTL } = useLanguage();

  if (!isOpen) return null;

  return (
    <div
      id="sign_out_modal_backdrop"
      onClick={() => !isSigningOut && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sign_out_modal_title"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        id="sign_out_modal_container"
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-surface-dim space-y-4 text-center animate-in zoom-in-95 duration-200"
      >
        {/* Restrained, calm icon container */}
        <div className="w-12 h-12 rounded-2xl bg-surface-container text-on-surface-variant flex items-center justify-center mx-auto border border-surface-dim/70 shadow-2xs">
          <LogOut className="w-5 h-5 stroke-[2.2]" />
        </div>

        <div className="space-y-1.5">
          <h3
            id="sign_out_modal_title"
            className="text-lg sm:text-xl font-bold text-on-surface font-['Manrope'] tracking-tight"
          >
            {t('settings.signOutPrompt') || 'Sign out of YAAD?'}
          </h3>
          <p className="text-xs sm:text-sm text-outline leading-relaxed px-1">
            {t('settings.signOutSubtitle') ||
              'Your shopping data will remain safely connected to your account.'}
          </p>
        </div>

        <div className="flex gap-2.5 pt-2">
          {/* Cancel button (neutral) */}
          <button
            type="button"
            id="sign_out_cancel_btn"
            onClick={onClose}
            disabled={isSigningOut}
            className="flex-1 min-h-[44px] py-2.5 px-4 text-xs sm:text-sm font-bold text-on-surface-variant bg-surface-container-low hover:bg-surface-container rounded-2xl transition-colors disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            {t('settings.cancel') || 'Cancel'}
          </button>

          {/* Sign Out button (primary) */}
          <button
            id="confirm_sign_out_btn"
            type="button"
            onClick={onConfirm}
            disabled={isSigningOut}
            className="flex-1 min-h-[44px] py-2.5 px-4 text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-2xl transition-all shadow-xs disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSigningOut ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{t('settings.saving') || 'Signing out...'}</span>
              </>
            ) : (
              <span>{t('settings.signOut') || 'Sign Out'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
