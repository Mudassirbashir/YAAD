import React from 'react';
import { LogOut, Loader2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useShouldAnimate } from '../../lib/motionPreference';

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
  const { language, isRTL } = useLanguage();
  const canAnimate = useShouldAnimate();

  if (!isOpen) return null;

  return (
    <div
      id="sign_out_modal_backdrop"
      onClick={() => !isSigningOut && onClose()}
      style={!canAnimate ? { animationDuration: '80ms' } : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 yaad-enter-fade"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sign_out_modal_title"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        id="sign_out_modal_container"
        onClick={(e) => e.stopPropagation()}
        style={!canAnimate ? { animationDuration: '80ms' } : undefined}
        className={`yaad-settings-card p-6 sm:p-7 max-w-sm sm:max-w-md w-full space-y-5 text-center ${
          canAnimate ? 'yaad-enter-zoom' : 'yaad-enter-fade'
        }`}
      >
        {/* Visual Badge */}
        <div className="w-14 h-14 rounded-2xl bg-rose-500/12 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
          <LogOut className="w-7 h-7 stroke-[2] rtl:rotate-180" aria-hidden="true" />
        </div>

        {/* Clear Headings & Copy */}
        <div className="space-y-2">
          <h3
            id="sign_out_modal_title"
            className={`text-lg sm:text-xl font-bold text-on-surface tracking-tight ${
              language === 'ur' ? 'font-urdu' : 'font-display'
            }`}
          >
            {language === 'ur' ? 'کیا آپ واقعی سائن آؤٹ کرنا چاہتے ہیں؟' : 'Sign Out of Your Account?'}
          </h3>
          <p className="text-[13px] sm:text-sm text-on-surface-variant leading-relaxed px-1">
            {language === 'ur'
              ? 'آپ کی تمام لسٹیں، خریدی گئی اشیاء اور تصاویر کلاؤڈ میں محفوظ رہیں گی۔ آپ کسی بھی وقت دوبارہ سائن اِن کر سکتے ہیں۔'
              : 'Your saved shopping lists, custom photos, and history remain safely stored in the cloud. You can sign back in anytime.'}
          </p>
        </div>

        {/* Reassurance row */}
        <div className="flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-2xl bg-surface-container-low border border-surface-dim/65 text-xs text-on-surface-variant font-medium">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
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
            className={`flex-1 min-h-[48px] py-2.5 px-4 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 ${
              canAnimate ? 'transition-transform duration-150 yaad-ease-premium active:scale-[0.98]' : ''
            }`}
          >
            {isSigningOut ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" aria-hidden="true" />
                <span>{language === 'ur' ? 'سائن آؤٹ ہو رہا ہے...' : 'Signing out...'}</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4 stroke-[2.1] rtl:rotate-180" aria-hidden="true" />
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
            className={`flex-1 min-h-[48px] py-2.5 px-4 text-xs sm:text-sm font-semibold text-on-surface bg-surface-container-low hover:bg-surface-container rounded-2xl disabled:opacity-50 cursor-pointer border border-surface-dim/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              canAnimate ? 'transition-transform duration-150 yaad-ease-premium active:scale-[0.98]' : ''
            }`}
          >
            {language === 'ur' ? 'نہیں، سائن اِن رہیں' : 'Keep Me Signed In'}
          </button>
        </div>
      </div>
    </div>
  );
};
