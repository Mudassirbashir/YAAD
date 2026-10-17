import React from 'react';
import { LogOut, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
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
  const { t, language, isRTL } = useLanguage();

  if (!isOpen) return null;

  return (
    <div
      id="sign_out_modal_backdrop"
      onClick={() => !isSigningOut && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sign_out_modal_title"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        id="sign_out_modal_container"
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest rounded-3xl p-6 sm:p-7 max-w-sm sm:max-w-md w-full shadow-2xl border border-surface-dim/80 space-y-5 text-center animate-zoom-in-95"
      >
        {/* Visual Badge */}
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20 shadow-xs">
          <LogOut className="w-7 h-7 stroke-[2.2] rtl:rotate-180" />
        </div>

        {/* Clear Headings & Copy */}
        <div className="space-y-2">
          <h3
            id="sign_out_modal_title"
            className={`text-lg sm:text-xl font-extrabold text-on-surface tracking-tight ${
              language === 'ur' ? 'font-urdu' : "font-['Plus_Jakarta_Sans']"
            }`}
          >
            {language === 'ur' ? 'کیا آپ واقعی سائن آؤٹ کرنا چاہتے ہیں؟' : 'Sign Out of Your Account?'}
          </h3>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed px-1">
            {language === 'ur'
              ? 'آپ کی تمام لسٹیں، خریدی گئی اشیاء اور تصاویر کلاؤڈ میں محفوظ رہیں گی۔ آپ کسی بھی وقت دوبارہ سائن اِن کر سکتے ہیں۔'
              : 'Your saved shopping lists, custom photos, and history remain safely stored in the cloud. You can sign back in anytime.'}
          </p>
        </div>

        {/* Reassurance pill */}
        <div className="flex items-center justify-center gap-2 py-2 px-3.5 rounded-2xl bg-surface-container-low border border-surface-dim/70 text-[11px] text-on-surface-variant font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            {language === 'ur' ? 'ڈیٹا مکمل محفوظ اور سنک ہے' : 'Your grocery data remains safe & synced'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row-reverse gap-2.5 pt-1">
          {/* Sign Out Button */}
          <button
            id="confirm_sign_out_btn"
            type="button"
            onClick={onConfirm}
            disabled={isSigningOut}
            className="flex-1 min-h-[46px] py-2.5 px-4 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-2xl transition-all shadow-xs disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSigningOut ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{language === 'ur' ? 'سائن آؤٹ ہو رہا ہے...' : 'Signing out...'}</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4 stroke-[2.2] rtl:rotate-180" />
                <span>{language === 'ur' ? 'ہاں، سائن آؤٹ کریں' : 'Yes, Sign Out'}</span>
              </>
            )}
          </button>

          {/* Cancel button */}
          <button
            type="button"
            id="sign_out_cancel_btn"
            onClick={onClose}
            disabled={isSigningOut}
            className="flex-1 min-h-[46px] py-2.5 px-4 text-xs sm:text-sm font-bold text-on-surface bg-surface-container hover:bg-surface-container-high rounded-2xl transition-colors disabled:opacity-50 active:scale-95 cursor-pointer border border-surface-dim/60"
          >
            {language === 'ur' ? 'نہیں، سائن اِن رہیں' : 'Keep Me Signed In'}
          </button>
        </div>
      </div>
    </div>
  );
};
