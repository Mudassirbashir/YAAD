import React from 'react';
import {
  Compass,
  Sparkles,
  ShieldCheck,
  ScrollText,
  Headphones,
  Cpu,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { APP_VERSION } from '../../version';

interface AboutSectionProps {
  onOpenModal: (type: 'privacy' | 'terms' | 'help' | 'about' | null) => void;
  onOpenLegalPage?: (
    page: 'terms' | 'privacy' | 'about' | 'help' | 'legal',
  ) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  onOpenModal,
  onOpenLegalPage,
}) => {
  const { t, language, isRTL } = useLanguage();
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  const handleOpenItem = (
    page: 'about' | 'help' | 'privacy' | 'terms',
  ) => {
    if (onOpenLegalPage) {
      onOpenLegalPage(page);
    } else {
      onOpenModal(page);
    }
  };

  return (
    <section id="settings_about_section" className="space-y-3 sm:space-y-3.5">
      {/* Section Header */}
      <div
        id="settings_about_header"
        className="flex items-center justify-between px-1 sm:px-1.5 pb-0.5"
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-primary-fixed/40 text-primary flex items-center justify-center shrink-0 border border-primary/10 shadow-2xs">
            <Compass className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
          </div>
          <h2
            className={`text-base sm:text-lg font-bold text-on-surface tracking-tight leading-tight ${
              language === 'ur' ? 'font-urdu text-lg sm:text-xl' : "font-['Manrope']"
            }`}
          >
            {t('settings.aboutTitle') || (language === 'ur' ? 'یاد کے بارے میں' : 'About YAAD')}
          </h2>
        </div>
      </div>

      {/* About Section Card */}
      <div
        id="settings_about_card"
        className="bg-surface rounded-3xl border border-surface-dim shadow-xs overflow-hidden divide-y divide-surface-dim/60"
      >
        {/* 1. About YAAD */}
        <button
          id="settings_link_about"
          type="button"
          onClick={() => handleOpenItem('about')}
          className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-start hover:bg-surface-container-lowest/80 transition-colors cursor-pointer group active:bg-surface-container-low"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-primary-fixed/30 text-primary flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-on-surface font-['Manrope'] truncate">
                {t('settings.aboutYaad') || (language === 'ur' ? 'یاد ایپ کا تعارف' : 'About YAAD')}
              </h3>
              <p className="text-xs text-outline truncate max-w-[240px] sm:max-w-md">
                {t('settings.aboutAppDesc') ||
                  t('settings.aboutYaadDesc') ||
                  (language === 'ur'
                    ? 'سمارٹ اور خودکار گروسری لسٹ اسسٹنٹ'
                    : 'Smart, minimalist grocery shopping memory.')}
              </p>
            </div>
          </div>
          <Chevron className="w-4 h-4 text-outline group-hover:text-primary group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all shrink-0" />
        </button>

        {/* 2. Help & Feedback */}
        <button
          id="settings_link_help"
          type="button"
          onClick={() => handleOpenItem('help')}
          className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-start hover:bg-surface-container-lowest/80 transition-colors cursor-pointer group active:bg-surface-container-low"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-primary-fixed/30 text-primary flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Headphones className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-on-surface font-['Manrope'] truncate">
                {t('settings.helpFeedback') ||
                  t('settings.helpSupport') ||
                  (language === 'ur' ? 'مدد اور رائے' : 'Help & Feedback')}
              </h3>
              <p className="text-xs text-outline truncate max-w-[240px] sm:max-w-md">
                {t('settings.helpFeedbackDesc') ||
                  t('settings.helpSupportDesc') ||
                  (language === 'ur'
                    ? 'کوئی سوال یا مشورہ؟ ہماری سپورٹ ٹیم سے رابطہ کریں'
                    : 'Need help or have suggestions? Reach out to our team.')}
              </p>
            </div>
          </div>
          <Chevron className="w-4 h-4 text-outline group-hover:text-primary group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all shrink-0" />
        </button>

        {/* 3. Privacy Policy */}
        <button
          id="settings_link_privacy"
          type="button"
          onClick={() => handleOpenItem('privacy')}
          className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-start hover:bg-surface-container-lowest/80 transition-colors cursor-pointer group active:bg-surface-container-low"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-primary-fixed/30 text-primary flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-on-surface font-['Manrope'] truncate">
                {t('settings.privacyPolicy') || (language === 'ur' ? 'پرائیویسی پالیسی' : 'Privacy Policy')}
              </h3>
              <p className="text-xs text-outline truncate max-w-[240px] sm:max-w-md">
                {t('settings.privacyPolicyDesc') ||
                  (language === 'ur'
                    ? 'آپ کا ذاتی گروسری ڈیٹا مکمل محفوظ اور انکرپٹڈ ہے'
                    : 'Your personal grocery data is securely protected.')}
              </p>
            </div>
          </div>
          <Chevron className="w-4 h-4 text-outline group-hover:text-primary group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all shrink-0" />
        </button>

        {/* 4. Terms of Service */}
        <button
          id="settings_link_terms"
          type="button"
          onClick={() => handleOpenItem('terms')}
          className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-start hover:bg-surface-container-lowest/80 transition-colors cursor-pointer group active:bg-surface-container-low"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-primary-fixed/30 text-primary flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <ScrollText className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-on-surface font-['Manrope'] truncate">
                {t('settings.termsOfService') || (language === 'ur' ? 'استعمال کی شرائط' : 'Terms of Service')}
              </h3>
              <p className="text-xs text-outline truncate max-w-[240px] sm:max-w-md">
                {t('settings.termsOfServiceDesc') ||
                  (language === 'ur'
                    ? 'یاد کے استعمال کی آسان اور شفاف شرائط'
                    : 'Simple, fair terms for using YAAD.')}
              </p>
            </div>
          </div>
          <Chevron className="w-4 h-4 text-outline group-hover:text-primary group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all shrink-0" />
        </button>

        {/* 5. Version */}
        <div
          id="settings_item_version"
          className="p-4 sm:p-5 flex items-center justify-between gap-3 text-start"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-surface-container text-primary flex items-center justify-center shrink-0 shadow-2xs">
              <Cpu className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-on-surface font-['Manrope'] truncate">
                {t('settings.versionTitle') || (language === 'ur' ? 'ایپ ورژن' : 'Version')}
              </h3>
              <p className="text-xs text-outline truncate max-w-[200px] sm:max-w-xs">
                {t('settings.versionDesc') || (language === 'ur' ? 'انسٹال شدہ ریلیز' : 'Installed application release')}
              </p>
            </div>
          </div>

          <div
            id="settings_version_badge"
            className="px-3 py-1 rounded-full bg-surface-container-high/80 text-xs font-mono font-bold text-on-surface-variant border border-surface-dim/80 shrink-0 shadow-2xs"
          >
            v{APP_VERSION}
          </div>
        </div>
      </div>

      {/* Footer Tagline & Version */}
      <footer className="pt-3 pb-1 text-center space-y-0.5 text-xs text-outline">
        <p className="font-bold text-on-surface-variant font-['Manrope']">
          {t('settings.footerTagline') || 'Simple Shopping Memory'}
        </p>
        <p className="text-[11px] text-outline/70">
          YAAD • v{APP_VERSION}
        </p>
      </footer>
    </section>
  );
};
