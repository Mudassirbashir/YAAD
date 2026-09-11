import React from 'react';
import { Globe, Volume2, VolumeX, Compass, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../translations';

interface PreferencesSectionProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onLanguageSelect: (lang: Language) => Promise<void> | void;
  onRestartTour?: () => void;
}

export const PreferencesSection: React.FC<PreferencesSectionProps> = ({
  soundEnabled,
  onToggleSound,
  onLanguageSelect,
  onRestartTour,
}) => {
  const { t, language, isRTL } = useLanguage();

  return (
    <section id="settings_preferences_section" className="space-y-3 sm:space-y-3.5">
      {/* Section Header */}
      <div
        id="settings_preferences_header"
        className="flex items-center justify-between px-1 sm:px-1.5 pb-0.5"
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-primary-fixed/40 text-primary flex items-center justify-center shrink-0 border border-primary/10 shadow-2xs">
            <Globe className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
          </div>
          <h2
            className={`text-base sm:text-lg font-bold text-on-surface tracking-tight leading-tight ${
              language === 'ur' ? 'font-urdu text-lg sm:text-xl' : "font-['Manrope']"
            }`}
          >
            {t('settings.preferencesTitle') || 'Preferences'}
          </h2>
        </div>
      </div>

      {/* Preferences Card */}
      <div
        id="settings_preferences_card"
        className="bg-surface rounded-3xl p-5 sm:p-6 border border-surface-dim shadow-xs divide-y divide-surface-dim/70"
      >
        {/* 1. Language Selection */}
        <div className="pb-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-secondary-fixed/40 text-primary flex items-center justify-center shrink-0 shadow-2xs">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-on-surface font-['Manrope']">
                  {t('settings.language') || 'Language'}
                </h3>
                <p className="text-xs text-outline">
                  {t('settings.languageSubtitle') ||
                    'Choose your preferred display language'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {/* English Option */}
            <button
              id="lang_select_en"
              type="button"
              onClick={() => onLanguageSelect('en')}
              className={`min-h-[48px] p-3 rounded-2xl border text-start flex items-center justify-between transition-all cursor-pointer active:scale-98 ${
                language === 'en'
                  ? 'border-primary bg-primary-fixed/20 shadow-xs'
                  : 'border-surface-dim bg-surface-container-lowest hover:bg-surface-container-low'
              }`}
            >
              <div className="min-w-0 pe-2">
                <div className="font-bold text-sm text-on-surface">English</div>
                <div className="text-[11px] text-outline truncate">English (US)</div>
              </div>
              {language === 'en' && (
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              )}
            </button>

            {/* Urdu Option */}
            <button
              id="lang_select_ur"
              type="button"
              onClick={() => onLanguageSelect('ur')}
              className={`min-h-[48px] p-3 rounded-2xl border text-start flex items-center justify-between transition-all cursor-pointer active:scale-98 ${
                language === 'ur'
                  ? 'border-primary bg-primary-fixed/20 shadow-xs'
                  : 'border-surface-dim bg-surface-container-lowest hover:bg-surface-container-low'
              }`}
            >
              <div className="min-w-0 pe-2">
                <div className="font-bold text-sm text-on-surface font-urdu">اردو</div>
                <div className="text-[11px] text-outline truncate">Urdu (Pakistan)</div>
              </div>
              {language === 'ur' && (
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* 2. Sound Effects Toggle */}
        <div className="py-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-secondary-fixed/40 text-primary flex items-center justify-center shrink-0 shadow-2xs">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-primary" />
              ) : (
                <VolumeX className="w-5 h-5 text-outline" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-on-surface font-['Manrope'] truncate">
                {t('settings.soundEffects') || 'Sound Effects'}
              </h3>
              <p className="text-xs text-outline line-clamp-2">
                {t('settings.soundEffectsDesc') ||
                  'Play audio feedback for item checks and completions'}
              </p>
            </div>
          </div>

          {/* iOS-style toggle switch */}
          <button
            id="toggle_sound_btn"
            type="button"
            role="switch"
            aria-checked={soundEnabled}
            onClick={onToggleSound}
            className={`w-13 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-primary/20 shrink-0 cursor-pointer ${
              soundEnabled ? 'bg-primary' : 'bg-surface-container-high'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                soundEnabled
                  ? isRTL
                    ? '-translate-x-6'
                    : 'translate-x-6'
                  : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 3. Product Tour Replay */}
        {onRestartTour && (
          <div className="pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-secondary-fixed/40 text-primary flex items-center justify-center shrink-0 shadow-2xs">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-on-surface font-['Manrope']">
                  {t('settings.restartTourTitle') ||
                    t('tour.replayTour') ||
                    'Restart Product Tour'}
                </h3>
                <p className="text-xs text-outline">
                  {t('settings.restartTourDesc') ||
                    t('tour.replayTourDesc') ||
                    'Replay the interactive walkthrough for all features'}
                </p>
              </div>
            </div>

            <button
              id="settings_restart_tour_btn"
              type="button"
              onClick={onRestartTour}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-surface-container text-primary hover:bg-surface-container-high font-['Manrope'] text-xs font-bold transition-all border border-surface-dim active:scale-95 flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-center cursor-pointer shadow-2xs"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>
                {t('settings.restartTourBtn') ||
                  t('tour.replayTour') ||
                  'Start Tour'}
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
