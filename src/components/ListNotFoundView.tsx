import React from 'react';
import { ShieldAlert, Home, Clock, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ListNotFoundViewProps {
  onGoHome: () => void;
  onGoHistory: () => void;
  type?: 'list' | 'session';
}

export const ListNotFoundView: React.FC<ListNotFoundViewProps> = ({
  onGoHome,
  onGoHistory,
  type = 'list',
}) => {
  const { t, isRTL } = useLanguage();

  const title = type === 'session'
    ? (t('errors.sessionUnavailable') || 'Shopping Session Unavailable')
    : (t('errors.listUnavailable') || 'Shopping List Unavailable');

  const description = type === 'session'
    ? (t('errors.sessionUnavailableDesc') ||
        'This shopping session could not be found or you do not have permission to view it.')
    : (t('errors.listUnavailableDesc') ||
        'This shopping list is either private, has been removed, or you do not have permission to view it.');

  return (
    <div
      id="list_access_error_screen"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-surface-container-lowest text-on-surface font-['Plus_Jakarta_Sans'] flex flex-col justify-between"
    >
      <header className="px-4 sm:px-6 py-4 border-b border-surface-dim/60">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            id="list_not_found_back_btn"
            onClick={onGoHistory}
            aria-label="Go Back"
            className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors py-1 px-2.5 rounded-lg hover:bg-surface-container-low active:scale-95 cursor-pointer"
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            <span>{t('common.back') || 'Back'}</span>
          </button>
          <span className="text-xs font-bold text-outline uppercase px-2 py-0.5 rounded bg-surface-container-low">
            Protected
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 text-center max-w-md mx-auto">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-6 border border-amber-500/20 shadow-xs">
          <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold font-['Manrope'] text-on-surface tracking-tight mb-2">
          {title}
        </h1>

        <p className="text-sm text-on-surface-variant max-w-sm mb-8 leading-relaxed">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
          <button
            id="list_not_found_history_btn"
            onClick={onGoHistory}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-sm hover:bg-primary/95 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>{t('nav.history') || 'View My Lists'}</span>
          </button>

          <button
            id="list_not_found_home_btn"
            onClick={onGoHome}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-surface-container text-on-surface font-semibold text-sm hover:bg-surface-container-high active:scale-[0.98] transition-all border border-surface-dim cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>{t('nav.home') || 'Go to Home'}</span>
          </button>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-outline border-t border-surface-dim/40">
        YAAD &bull; End-to-End Privacy & Security
      </footer>
    </div>
  );
};
