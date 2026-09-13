import React from 'react';
import { Compass, ArrowLeft, Home, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface NotFoundViewProps {
  onGoHome: () => void;
  onGoHistory?: () => void;
  onGoBack?: () => void;
  attemptedPath?: string;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  onGoHome,
  onGoHistory,
  onGoBack,
  attemptedPath,
}) => {
  const { t, isRTL } = useLanguage();

  return (
    <div
      id="not_found_screen"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-surface-container-lowest text-on-surface font-['Plus_Jakarta_Sans'] flex flex-col justify-between"
    >
      {/* Top minimal header */}
      <header className="px-4 sm:px-6 py-4 border-b border-surface-dim/60">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            id="not_found_back_btn"
            onClick={onGoBack || onGoHome}
            aria-label="Go Back"
            className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors py-1 px-2.5 rounded-lg hover:bg-surface-container-low active:scale-95 cursor-pointer"
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            <span>{t('common.back') || 'Back'}</span>
          </button>

          <span className="text-xs font-bold font-mono text-outline tracking-wider uppercase px-2 py-0.5 rounded bg-surface-container-low">
            404
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 text-center max-w-lg mx-auto">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-surface-container flex items-center justify-center mb-6 shadow-sm border border-surface-dim text-primary">
          <Compass className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold font-['Manrope'] text-on-surface tracking-tight mb-2">
          {t('errors.pageNotFound') || 'Page Not Found'}
        </h1>

        <p className="text-sm sm:text-base text-on-surface-variant max-w-sm mb-3 leading-relaxed">
          {t('errors.pageNotFoundDesc') ||
            "The link you followed doesn't exist, may have been moved, or requires a different account."}
        </p>

        {attemptedPath && (
          <p className="text-xs font-mono text-outline bg-surface-container-low px-3 py-1 rounded-md mb-8 max-w-xs truncate border border-surface-dim">
            {attemptedPath}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
          <button
            id="not_found_home_btn"
            onClick={onGoHome}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-sm hover:bg-primary/95 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>{t('nav.home') || 'Go to Home'}</span>
          </button>

          {onGoHistory && (
            <button
              id="not_found_history_btn"
              onClick={onGoHistory}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-surface-container text-on-surface font-semibold text-sm hover:bg-surface-container-high active:scale-[0.98] transition-all border border-surface-dim cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>{t('nav.history') || 'View Lists'}</span>
            </button>
          )}
        </div>
      </main>

      {/* Footer minimal info */}
      <footer className="py-4 text-center text-xs text-outline border-t border-surface-dim/40">
        YAAD &bull; Smart Shopping Assistant
      </footer>
    </div>
  );
};
