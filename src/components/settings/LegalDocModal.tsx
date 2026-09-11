import React from 'react';
import { X, Shield, FileText, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface LegalDocModalProps {
  activeModal: 'privacy' | 'terms' | 'help' | null;
  onClose: () => void;
}

export const LegalDocModal: React.FC<LegalDocModalProps> = ({
  activeModal,
  onClose,
}) => {
  const { t, isRTL } = useLanguage();

  if (!activeModal) return null;

  const getTitle = () => {
    switch (activeModal) {
      case 'privacy':
        return t('settings.privacyPolicy') || 'Privacy Policy';
      case 'terms':
        return t('settings.termsOfService') || 'Terms of Service';
      case 'help':
        return t('settings.helpSupport') || 'Help & Support';
    }
  };

  const getIcon = () => {
    switch (activeModal) {
      case 'privacy':
        return <Shield className="w-5 h-5 text-primary" />;
      case 'terms':
        return <FileText className="w-5 h-5 text-primary" />;
      case 'help':
        return <HelpCircle className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div
      id="legal_doc_modal_backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        id="legal_doc_modal_container"
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-surface-dim space-y-4 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between pb-2 border-b border-surface-dim/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-fixed/40 text-primary flex items-center justify-center shrink-0 border border-primary/10 shadow-2xs">
              {getIcon()}
            </div>
            <h3 className="text-lg font-bold text-on-surface font-['Manrope'] tracking-tight">
              {getTitle()}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-sm text-on-surface-variant space-y-3.5 leading-relaxed max-h-80 overflow-y-auto pr-1">
          {activeModal === 'privacy' && (
            <>
              <p>
                At YAAD, your privacy is a foundational priority. We never sell
                or monetize your shopping lists, personal notes, or grocery
                routines.
              </p>
              <p>
                All synchronization is powered by encrypted database connections
                via Supabase. When using YAAD offline or as a PWA, your lists
                reside locally on your device storage.
              </p>
              <p>
                You remain in full control of your account credentials and
                personal details at all times.
              </p>
            </>
          )}

          {activeModal === 'terms' && (
            <>
              <p>
                Welcome to YAAD. By using this service, you agree to simple,
                fair terms designed to provide a pleasant, reliable shopping
                assistant.
              </p>
              <p>
                YAAD is provided for personal grocery and shopping list
                management. Content is preserved to help you plan and execute
                daily errands efficiently.
              </p>
              <p>
                We continually improve the application with new features and
                optimizations for bilingual shopping experiences in English,
                Roman Urdu, and Urdu.
              </p>
            </>
          )}

          {activeModal === 'help' && (
            <>
              <p>
                Have questions about YAAD, suggestions for new grocery items, or
                need assistance with your account?
              </p>
              <div className="p-3.5 bg-surface-container-low rounded-2xl border border-surface-dim/70 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-outline">
                  Direct Email Support
                </span>
                <a
                  id="settings_support_email_link"
                  href={`mailto:${t('settings.supportEmail') || 'useyaadapp@gmail.com'}`}
                  className="block text-primary font-bold hover:underline break-all"
                >
                  {t('settings.supportEmail') || 'useyaadapp@gmail.com'}
                </a>
              </div>
              <p className="text-xs text-outline">
                Our team typically responds within 24 hours. We welcome feedback
                on Urdu localization and Pakistani grocery staples!
              </p>
            </>
          )}
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] py-2.5 text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-2xl transition-all shadow-xs active:scale-98 cursor-pointer"
          >
            {t('settings.done') || 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
