import React, { useState } from 'react';
import {
  Info,
  Sparkles,
  Shield,
  FileText,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Share2,
  Check,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface AboutSectionProps {
  onOpenModal: (type: 'privacy' | 'terms' | 'help' | null) => void;
  onOpenLegalPage?: (
    page: 'terms' | 'privacy' | 'about' | 'help' | 'legal',
  ) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  onOpenModal,
  onOpenLegalPage,
}) => {
  const { t, language, isRTL } = useLanguage();
  const [copiedLegalPath, setCopiedLegalPath] = useState<string | null>(null);

  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  const handleCopyPath = async (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    try {
      const origin =
        typeof window !== 'undefined' ? window.location.origin : '';
      const fullUrl = `${origin}${path}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullUrl);
        setCopiedLegalPath(path);
        setTimeout(() => setCopiedLegalPath(null), 2500);
      }
    } catch (err) {
      console.warn('Failed to copy URL:', err);
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
            <Info className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
          </div>
          <h2
            className={`text-base sm:text-lg font-bold text-on-surface tracking-tight leading-tight ${
              language === 'ur' ? 'font-urdu text-lg sm:text-xl' : "font-['Manrope']"
            }`}
          >
            {t('settings.aboutTitle') || 'About YAAD'}
          </h2>
        </div>
      </div>

      {/* About List Container (Clean, lighter visual feel) */}
      <div
        id="settings_about_card"
        className="bg-surface rounded-3xl border border-surface-dim shadow-xs overflow-hidden divide-y divide-surface-dim/70"
      >
        {/* 1. About YAAD */}
        <div
          id="settings_link_about"
          onClick={() => {
            if (onOpenLegalPage) onOpenLegalPage('about');
          }}
          className="p-4 sm:p-5 flex items-center justify-between gap-3 text-start hover:bg-surface-container-lowest/70 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-primary-fixed/30 text-primary flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-on-surface font-['Manrope'] truncate">
                  {t('settings.aboutApp') || 'About YAAD'}
                </h3>
                <code className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-primary font-mono font-medium">
                  /about
                </code>
              </div>
              <p className="text-xs text-outline truncate max-w-[220px] sm:max-w-xs md:max-w-sm">
                {t('settings.aboutAppDesc') ||
                  'Minimalist shopping memory app built for effortless organization.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => handleCopyPath(e, '/about')}
              title="Copy link to /about"
              className="p-2 rounded-xl text-outline hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
            >
              {copiedLegalPath === '/about' ? (
                <Check className="w-4 h-4 text-primary" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>
            <Chevron className="w-4 h-4 text-outline group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* 2. Privacy Policy */}
        <div
          id="settings_link_privacy"
          onClick={() => {
            if (onOpenLegalPage) onOpenLegalPage('privacy');
            else onOpenModal('privacy');
          }}
          className="p-4 sm:p-5 flex items-center justify-between gap-3 text-start hover:bg-surface-container-lowest/70 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-secondary-fixed/40 text-primary flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-on-surface font-['Manrope'] truncate">
                  {t('settings.privacyPolicy') || 'Privacy Policy'}
                </h3>
                <code className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-primary font-mono font-medium">
                  /privacy
                </code>
              </div>
              <p className="text-xs text-outline truncate max-w-[220px] sm:max-w-xs md:max-w-sm">
                {t('settings.privacyPolicyDesc') ||
                  'Your personal list data is securely encrypted.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => handleCopyPath(e, '/privacy')}
              title="Copy link to /privacy"
              className="p-2 rounded-xl text-outline hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
            >
              {copiedLegalPath === '/privacy' ? (
                <Check className="w-4 h-4 text-primary" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>
            <Chevron className="w-4 h-4 text-outline group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* 3. Terms of Service */}
        <div
          id="settings_link_terms"
          onClick={() => {
            if (onOpenLegalPage) onOpenLegalPage('terms');
            else onOpenModal('terms');
          }}
          className="p-4 sm:p-5 flex items-center justify-between gap-3 text-start hover:bg-surface-container-lowest/70 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-surface-container text-primary flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-on-surface font-['Manrope'] truncate">
                  {t('settings.termsOfService') || 'Terms of Service'}
                </h3>
                <code className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-primary font-mono font-medium">
                  /terms
                </code>
              </div>
              <p className="text-xs text-outline truncate max-w-[220px] sm:max-w-xs md:max-w-sm">
                {t('settings.termsOfServiceDesc') ||
                  'Simple, fair terms to help you organize shopping safely.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => handleCopyPath(e, '/terms')}
              title="Copy link to /terms"
              className="p-2 rounded-xl text-outline hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
            >
              {copiedLegalPath === '/terms' ? (
                <Check className="w-4 h-4 text-primary" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>
            <Chevron className="w-4 h-4 text-outline group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* 4. Help & Support */}
        <div
          id="settings_link_help"
          onClick={() => {
            if (onOpenLegalPage) onOpenLegalPage('help');
            else onOpenModal('help');
          }}
          className="p-4 sm:p-5 flex items-center justify-between gap-3 text-start hover:bg-surface-container-lowest/70 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-surface-container text-primary flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-on-surface font-['Manrope'] truncate">
                  {t('settings.helpSupport') || 'Help & Support'}
                </h3>
                <code className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-primary font-mono font-medium">
                  /help
                </code>
              </div>
              <p className="text-xs text-outline truncate max-w-[220px] sm:max-w-xs md:max-w-sm">
                {t('settings.helpSupportDesc') ||
                  'Need help or have suggestions? Reach out to our team anytime.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => handleCopyPath(e, '/help')}
              title="Copy link to /help"
              className="p-2 rounded-xl text-outline hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
            >
              {copiedLegalPath === '/help' ? (
                <Check className="w-4 h-4 text-primary" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>
            <Chevron className="w-4 h-4 text-outline group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* 5. All Legal Pages Hub */}
        <div
          id="settings_link_all_hub"
          onClick={() => {
            if (onOpenLegalPage) onOpenLegalPage('legal');
          }}
          className="p-3.5 sm:p-4 bg-surface-container-lowest/40 flex items-center justify-between gap-3 text-start hover:bg-surface-container-lowest transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 text-xs text-outline group-hover:text-on-surface transition-colors">
            <ExternalLink className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>View All Separate Legal & Info Pages</span>
            <code className="text-[10px] px-1 rounded bg-surface-container text-outline font-mono">
              /legal
            </code>
          </div>
          <Chevron className="w-3.5 h-3.5 text-outline group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform shrink-0" />
        </div>
      </div>

      {/* Footer: Version & Brand Tagline */}
      <footer className="pt-3 pb-1 text-center space-y-1 text-xs text-outline">
        <p className="font-bold text-on-surface-variant font-['Manrope']">
          {t('settings.footerTagline') || 'Simple Shopping Memory'}
        </p>
        <p className="text-outline/70">
          YAAD v1.0.0
        </p>
      </footer>
    </section>
  );
};
