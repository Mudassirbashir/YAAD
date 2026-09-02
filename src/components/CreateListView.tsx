import React, { useState } from 'react';
import { ArrowLeft, AlertCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CreateListViewProps {
  onBack: () => void;
  onContinue: (title: string) => void;
}

export const CreateListView: React.FC<CreateListViewProps> = ({
  onBack,
  onContinue,
}) => {
  const { t } = useLanguage();
  const [listName, setListName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = listName.trim();
    if (!trimmed) {
      setErrorMsg(t('createList.errorEmpty'));
      return;
    }
    setErrorMsg('');
    onContinue(trimmed);
  };

  const suggestions: string[] = [
    t('createList.suggestions.0'),
    t('createList.suggestions.1'),
    t('createList.suggestions.2'),
    t('createList.suggestions.3'),
    t('createList.suggestions.4'),
  ];

  return (
    <div className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto min-h-screen flex flex-col antialiased bg-background">
      {/* Header */}
      <header className="flex items-center px-4 sm:px-6 md:px-8 h-14 w-full pt-2">
        <button
          onClick={onBack}
          aria-label="Go back"
          className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-surface-container-low transition-colors text-primary active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 md:px-8 pt-6 pb-24 flex flex-col justify-between">
        <div>
          <h1 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-4xl font-extrabold text-primary mb-8 tracking-tight">
            {t('createList.title')}
          </h1>

          <form onSubmit={handleSubmit} className="relative w-full">
            <input
              autoFocus
              value={listName}
              onChange={(e) => {
                setListName(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              className={`w-full bg-surface-container-lowest text-on-surface font-['Manrope'] text-lg rounded-2xl px-5 py-4 border transition-all duration-200 outline-none shadow-[0px_4px_20px_rgba(0,30,21,0.03)] placeholder:text-outline ${
                errorMsg
                  ? 'border-error focus:ring-2 focus:ring-error/30'
                  : 'border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20'
              }`}
              placeholder={t('createList.placeholder')}
              type="text"
            />

            {errorMsg && (
              <p className="font-['Manrope'] text-sm text-error mt-2.5 flex items-center gap-1.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </p>
            )}

            {/* Suggested quick list names */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-xs text-outline font-semibold uppercase tracking-wider py-1">
                {t('createList.suggestionsLabel')}
              </span>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setListName(suggestion);
                    if (errorMsg) setErrorMsg('');
                  }}
                  className="text-xs font-semibold text-primary bg-surface-container hover:bg-surface-container-high px-3 py-1.5 rounded-full transition-colors border border-surface-dim active:scale-95"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* Primary Action Button */}
        <div className="mt-8 mb-4">
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="w-full h-[56px] bg-primary text-on-primary font-['Manrope'] text-base font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-primary-container transition-all shadow-[0px_8px_24px_rgba(0,30,21,0.15)] active:scale-[0.98]"
          >
            <span>{t('createList.submitBtn')}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  );
};

