import React from 'react';
import {
  Palette,
  Sparkles,
  Moon,
  Gem,
  Flame,
  Crown,
  Heart,
  Check,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAppTheme, AppThemeId } from '../../context/ThemeContext';

export const AppearanceSection: React.FC = () => {
  const { t, language } = useLanguage();
  const { theme, setTheme, themes } = useAppTheme();

  const getThemeIcon = (id: AppThemeId) => {
    switch (id) {
      case 'default':
        return <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'midnight':
        return <Moon className="w-5 h-5 text-emerald-400" />;
      case 'sapphire':
        return <Gem className="w-5 h-5 text-blue-600" />;
      case 'terracotta':
        return <Flame className="w-5 h-5 text-amber-700" />;
      case 'amethyst':
        return <Crown className="w-5 h-5 text-purple-600" />;
      case 'rose':
        return <Heart className="w-5 h-5 text-rose-600" />;
    }
  };

  const getThemeLocalizedName = (themeItem: (typeof themes)[0]) => {
    if (language === 'ur') return themeItem.nameUrdu;
    if (language === 'roman-urdu') return themeItem.nameRomanUrdu;
    return themeItem.name;
  };

  const getThemeLocalizedDesc = (themeItem: (typeof themes)[0]) => {
    if (language === 'ur') return themeItem.descUrdu;
    if (language === 'roman-urdu') return themeItem.descRomanUrdu;
    return themeItem.desc;
  };

  return (
    <section id="settings_appearance_section" className="space-y-3 sm:space-y-3.5">
      {/* Section Header */}
      <div
        id="settings_appearance_header"
        className="flex items-center justify-between px-1 sm:px-1.5 pb-0.5"
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-primary-fixed/40 text-primary flex items-center justify-center shrink-0 border border-primary/10 shadow-2xs">
            <Palette className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
          </div>
          <h2
            className={`text-base sm:text-lg font-bold text-on-surface tracking-tight leading-tight ${
              language === 'ur' ? 'font-urdu text-lg sm:text-xl' : "font-['Manrope']"
            }`}
          >
            {t('settings.appearanceTitle') ||
              (language === 'ur'
                ? 'اپیرنس اور تھیم'
                : language === 'roman-urdu'
                ? 'Appearance & Theme'
                : 'Appearance & Themes')}
          </h2>
        </div>

        <span className="text-[11px] font-bold text-primary bg-primary-fixed/40 px-2.5 py-1 rounded-full">
          {themes.length} {language === 'ur' ? 'تھیمز' : 'Themes'}
        </span>
      </div>

      {/* Main Appearance Card */}
      <div
        id="settings_appearance_card"
        className="bg-surface rounded-3xl p-5 sm:p-6 border border-surface-dim shadow-xs space-y-5"
      >
        {/* Subtitle / Explainer */}
        <div className="flex items-center justify-between gap-3 pb-1 border-b border-surface-dim/60">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-on-surface font-['Manrope']">
              {language === 'ur'
                ? 'پری انسٹالڈ خوبصورت تھیمز'
                : language === 'roman-urdu'
                ? 'Pre-installed Colors & Themes'
                : 'Pre-Installed Color Themes'}
            </h3>
            <p className="text-xs text-outline">
              {language === 'ur'
                ? 'اپنی پسند کی تھیم منتخب کریں، ایپ کا پورا رنگ و انداز فورا تبدیل ہو جائے گا'
                : language === 'roman-urdu'
                ? 'Apni pasandeeda theme chunein, poori app ka rang foran badal jaye ga'
                : 'Select your preferred theme. Applied instantly across the entire app.'}
            </p>
          </div>
        </div>

        {/* 6 Theme Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {themes.map((item) => {
            const isActive = theme === item.id;
            return (
              <button
                key={item.id}
                id={`theme_select_btn_${item.id}`}
                type="button"
                onClick={() => setTheme(item.id)}
                className={`relative p-4 rounded-2xl border text-start transition-all cursor-pointer active:scale-[0.98] flex flex-col justify-between gap-3 group ${
                  isActive
                    ? 'border-primary bg-primary-fixed/20 ring-2 ring-primary/40 shadow-sm'
                    : 'border-surface-dim bg-surface-container-lowest hover:bg-surface-container-low/70 hover:border-surface-dim/80'
                }`}
              >
                {/* Header row inside card */}
                <div className="flex items-start justify-between gap-2 w-full">
                  <div className="flex items-center gap-2.5">
                    {/* Theme Swatch Circle */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs border border-black/10"
                      style={{ backgroundColor: item.primary }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.accent }}
                      />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-on-surface leading-tight font-['Manrope']">
                        {getThemeLocalizedName(item)}
                      </div>
                      <div className="text-[10px] text-outline mt-0.5">
                        {item.isDark
                          ? language === 'ur'
                            ? 'ڈارک نائٹ موڈ'
                            : 'Dark Mode'
                          : language === 'ur'
                          ? 'لائٹ موڈ'
                          : 'Light Mode'}
                      </div>
                    </div>
                  </div>

                  {/* Active Check Badge */}
                  {isActive ? (
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-surface-dim bg-surface-container-low/40 group-hover:border-primary/40 transition-colors" />
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-outline line-clamp-2 leading-relaxed">
                  {getThemeLocalizedDesc(item)}
                </p>

                {/* Visual Palette Pill bar */}
                <div className="flex items-center gap-1.5 pt-1">
                  <div
                    className="h-3 flex-1 rounded-full border border-black/5"
                    style={{ backgroundColor: item.primary }}
                    title="Primary"
                  />
                  <div
                    className="h-3 flex-1 rounded-full border border-black/5"
                    style={{ backgroundColor: item.accent }}
                    title="Accent"
                  />
                  <div
                    className="h-3 flex-1 rounded-full border border-black/5"
                    style={{ backgroundColor: item.surface }}
                    title="Surface"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
