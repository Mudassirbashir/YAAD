import React from 'react';
import {
  SlidersHorizontal,
  Languages,
  Globe2,
  BookOpen,
  Sparkles,
  Volume2,
  VolumeX,
  Check,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../translations';

interface PreferencesSectionProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onLanguageSelect: (lang: Language) => Promise<void> | void;
}

export const PreferencesSection: React.FC<PreferencesSectionProps> = ({
  soundEnabled,
  onToggleSound,
  onLanguageSelect,
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
            <SlidersHorizontal className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
          </div>
          <h2
            className={`text-base sm:text-lg font-bold text-on-surface tracking-tight leading-tight ${
              language === 'ur' ? 'font-urdu text-lg sm:text-xl' : "font-['Manrope']"
            }`}
          >
            {t('settings.preferencesTitle') || (language === 'ur' ? 'ترجیحات' : 'Preferences')}
          </h2>
        </div>
      </div>

      {/* Preferences Card */}
      <div
        id="settings_preferences_card"
        className="bg-surface rounded-3xl p-5 sm:p-6 border border-surface-dim shadow-xs divide-y divide-surface-dim/70"
      >
        {/* 1. Language Selection */}
        <div className="pb-5 space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary-fixed/30 text-primary flex items-center justify-center shrink-0 shadow-2xs">
                <Languages className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-on-surface font-['Manrope']">
                  {t('settings.language') || (language === 'ur' ? 'زبان کا انتخاب' : 'Language')}
                </h3>
                <p className="text-xs text-outline">
                  {t('settings.languageSubtitle') ||
                    (language === 'ur'
                      ? 'اپنی پسندیدہ ڈسپلے زبان منتخب کریں'
                      : 'Choose your preferred display language')}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
            {/* 1. English Option */}
            <button
              id="lang_select_en"
              type="button"
              onClick={() => onLanguageSelect('en')}
              className={`min-h-[56px] p-3.5 rounded-2xl border text-start flex items-center justify-between transition-all cursor-pointer active:scale-[0.98] ${
                language === 'en'
                  ? 'border-primary bg-primary-fixed/25 ring-1 ring-primary/30 shadow-xs'
                  : 'border-surface-dim bg-surface-container-lowest hover:bg-surface-container-low/70'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pe-2">
                <div className="w-7 h-7 rounded-xl bg-surface-container flex items-center justify-center shrink-0 text-primary">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-on-surface font-['Manrope']">
                    {t('settings.languageEn') || 'English'}
                  </div>
                  <div className="text-[11px] text-outline truncate">
                    {t('settings.languageEnSub') || 'English (US)'}
                  </div>
                </div>
              </div>
              {language === 'en' && (
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              )}
            </button>

            {/* 2. Roman Urdu Option */}
            <button
              id="lang_select_roman_urdu"
              type="button"
              onClick={() => onLanguageSelect('roman-urdu')}
              className={`min-h-[56px] p-3.5 rounded-2xl border text-start flex items-center justify-between transition-all cursor-pointer active:scale-[0.98] ${
                language === 'roman-urdu'
                  ? 'border-primary bg-primary-fixed/25 ring-1 ring-primary/30 shadow-xs'
                  : 'border-surface-dim bg-surface-container-lowest hover:bg-surface-container-low/70'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pe-2">
                <div className="w-7 h-7 rounded-xl bg-surface-container flex items-center justify-center shrink-0 text-primary">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-on-surface font-['Manrope']">
                    {t('settings.languageRomanUrdu') || 'Roman Urdu'}
                  </div>
                  <div className="text-[11px] text-outline truncate">
                    {t('settings.languageRomanUrduSub') || 'Aasan Roman Urdu'}
                  </div>
                </div>
              </div>
              {language === 'roman-urdu' && (
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              )}
            </button>

            {/* 3. Urdu Option */}
            <button
              id="lang_select_ur"
              type="button"
              onClick={() => onLanguageSelect('ur')}
              className={`min-h-[56px] p-3.5 rounded-2xl border text-start flex items-center justify-between transition-all cursor-pointer active:scale-[0.98] ${
                language === 'ur'
                  ? 'border-primary bg-primary-fixed/25 ring-1 ring-primary/30 shadow-xs'
                  : 'border-surface-dim bg-surface-container-lowest hover:bg-surface-container-low/70'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pe-2">
                <div className="w-7 h-7 rounded-xl bg-surface-container flex items-center justify-center shrink-0 text-primary">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-on-surface font-urdu">
                    {t('settings.languageUrdu') || 'اردو'}
                  </div>
                  <div className="text-[11px] text-outline truncate">
                    {t('settings.languageUrduSub') || 'آسان نستعلیق'}
                  </div>
                </div>
              </div>
              {language === 'ur' && (
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* 2. Sound Effects Toggle */}
        <div className="pt-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-primary-fixed/30 text-primary flex items-center justify-center shrink-0 shadow-2xs">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-primary stroke-[2.2]" />
              ) : (
                <VolumeX className="w-5 h-5 text-outline stroke-[2]" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-on-surface font-['Manrope'] truncate">
                {t('settings.soundEffects') || (language === 'ur' ? 'صوتی اثرات (Sound)' : 'Sound Effects')}
              </h3>
              <p className="text-xs text-outline line-clamp-2">
                {t('settings.soundEffectsDesc') ||
                  (language === 'ur'
                    ? 'اشیاء چیک کرنے اور خریداری مکمل کرنے پر صوتی اثرات سنیں'
                    : 'Play audio feedback for item checks and completions')}
              </p>
            </div>
          </div>

          {/* Toggle switch */}
          <button
            id="toggle_sound_btn"
            type="button"
            role="switch"
            aria-checked={soundEnabled}
            onClick={onToggleSound}
            aria-label="Toggle Sound Effects"
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
      </div>
    </section>
  );
};
