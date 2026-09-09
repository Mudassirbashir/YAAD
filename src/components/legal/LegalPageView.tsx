import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  FileText,
  Sparkles,
  HelpCircle,
  Share2,
  Check,
  ExternalLink,
  Mail,
  ChevronDown,
  ChevronUp,
  Globe,
  Search,
  BookOpen,
  Lock,
  WifiOff,
  Languages,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../translations';
import {
  LegalPageType,
  LEGAL_METADATA,
  TERMS_SECTIONS,
  PRIVACY_SECTIONS,
  ABOUT_HIGHLIGHTS,
  FAQS,
  FAQItem,
} from './legalContent';

interface LegalPageViewProps {
  initialPage: LegalPageType;
  onBack: () => void;
  onNavigate: (page: LegalPageType) => void;
}

export const LegalPageView: React.FC<LegalPageViewProps> = ({
  initialPage,
  onBack,
  onNavigate,
}) => {
  const { language, setLanguage, isRTL } = useLanguage();
  const [currentPage, setCurrentPage] = useState<LegalPageType>(initialPage);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>('all');
  const [openFaqIds, setOpenFaqIds] = useState<Set<string>>(new Set(['offline-how', 'language-switch']));

  // Sync internal state when prop changes
  useEffect(() => {
    setCurrentPage(initialPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [initialPage]);

  // Update browser document title according to current page
  useEffect(() => {
    const meta = LEGAL_METADATA[currentPage];
    const pageTitle = meta ? meta.title[language as 'en' | 'romanUrdu' | 'ur'] || meta.title.en : 'Legal';
    document.title = `${pageTitle} • YAAD`;
    return () => {
      document.title = 'YAAD';
    };
  }, [currentPage, language]);

  const handleTabClick = (page: LegalPageType) => {
    setCurrentPage(page);
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyPageLink = async (page: LegalPageType = currentPage) => {
    try {
      const meta = LEGAL_METADATA[page];
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const fullUrl = `${origin}${meta.path}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullUrl);
        setCopiedUrl(page);
        setTimeout(() => setCopiedUrl(null), 2500);
      }
    } catch (err) {
      console.warn('Could not copy link:', err);
    }
  };

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = selectedFaqCategory === 'all' || faq.category === selectedFaqCategory;
    if (!matchesCategory) return false;
    if (!faqSearchQuery.trim()) return true;
    const q = faqSearchQuery.toLowerCase();
    const questionText = `${faq.question.en} ${faq.question.romanUrdu} ${faq.question.ur}`.toLowerCase();
    const answerText = `${faq.answer.en} ${faq.answer.romanUrdu} ${faq.answer.ur}`.toLowerCase();
    return questionText.includes(q) || answerText.includes(q);
  });

  const meta = LEGAL_METADATA[currentPage] || LEGAL_METADATA.terms;
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const getLocalizedText = (obj: { en: string; romanUrdu: string; ur: string }) => {
    if (language === 'ur') return obj.ur;
    if (language === 'roman-urdu') return obj.romanUrdu;
    return obj.en;
  };

  return (
    <div
      id="legal_page_container"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-surface-container-lowest text-on-surface font-['Plus_Jakarta_Sans'] pb-24 selection:bg-primary-container selection:text-on-primary-container"
    >
      {/* ==================================================================== */}
      {/* 1. TOP STICKY APP BAR */}
      {/* ==================================================================== */}
      <header
        id="legal_page_header"
        className="sticky top-0 z-40 bg-surface-container-lowest/90 backdrop-blur-md border-b border-surface-dim px-4 sm:px-6 lg:px-8 py-3.5 transition-colors"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Back Button & Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              id="legal_back_btn"
              type="button"
              onClick={onBack}
              aria-label="Back to YAAD"
              className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors active:scale-95 shrink-0"
            >
              <BackIcon className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold font-['Manrope'] text-on-surface tracking-tight truncate">
                  YAAD
                </span>
                <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary-fixed/40 text-primary">
                  {meta.badge}
                </span>
              </div>
              <p className="text-xs text-outline font-medium truncate">
                {getLocalizedText(meta.title)}
              </p>
            </div>
          </div>

          {/* Right Actions: Language Selector & Copy Direct Link */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Language Switcher */}
            <div className="flex items-center bg-surface-container rounded-full p-1 border border-surface-dim text-xs">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-full font-semibold transition-all ${
                  language === 'en'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('roman-urdu')}
                className={`px-2.5 py-1 rounded-full font-semibold transition-all ${
                  language === 'roman-urdu'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Roman
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ur')}
                className={`px-2.5 py-1 rounded-full font-semibold transition-all font-urdu ${
                  language === 'ur'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                اردو
              </button>
            </div>

            {/* Share / Copy Link Button */}
            <button
              id="legal_copy_link_btn"
              type="button"
              onClick={() => handleCopyPageLink(currentPage)}
              title="Copy link to this page"
              className="h-9 px-3 rounded-full flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary-fixed/40 hover:bg-primary-fixed/60 transition-all active:scale-95 border border-primary/15"
            >
              {copiedUrl === currentPage ? (
                <>
                  <Check className="w-3.5 h-3.5 text-primary" />
                  <span className="hidden xs:inline">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. SECONDARY LINK TABS (Dedicated Link Navigation) */}
      {/* ==================================================================== */}
      <div
        id="legal_nav_tabs"
        className="sticky top-[61px] z-30 bg-surface/95 backdrop-blur-md border-b border-surface-dim shadow-2xs"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Legal and About Pages"
            className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar"
          >
            {/* Terms & Conditions Link */}
            <a
              id="legal_tab_terms"
              href="/terms"
              onClick={(e) => {
                e.preventDefault();
                handleTabClick('terms');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                currentPage === 'terms'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>{getLocalizedText(LEGAL_METADATA.terms.title)}</span>
            </a>

            {/* Privacy Policy Link */}
            <a
              id="legal_tab_privacy"
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                handleTabClick('privacy');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                currentPage === 'privacy'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span>{getLocalizedText(LEGAL_METADATA.privacy.title)}</span>
            </a>

            {/* About YAAD Link */}
            <a
              id="legal_tab_about"
              href="/about"
              onClick={(e) => {
                e.preventDefault();
                handleTabClick('about');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                currentPage === 'about'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{getLocalizedText(LEGAL_METADATA.about.title)}</span>
            </a>

            {/* Help & Support Link */}
            <a
              id="legal_tab_help"
              href="/help"
              onClick={(e) => {
                e.preventDefault();
                handleTabClick('help');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                currentPage === 'help'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{getLocalizedText(LEGAL_METADATA.help.title)}</span>
            </a>

            {/* Hub Link */}
            <a
              id="legal_tab_legal"
              href="/legal"
              onClick={(e) => {
                e.preventDefault();
                handleTabClick('legal');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                currentPage === 'legal'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>{getLocalizedText(LEGAL_METADATA.legal.title)}</span>
            </a>
          </nav>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. HERO / PAGE TITLE BANNER */}
      {/* ==================================================================== */}
      <section className="bg-surface border-b border-surface-dim px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-fixed/50 text-primary border border-primary/10">
              {currentPage === 'terms' && <FileText className="w-3.5 h-3.5" />}
              {currentPage === 'privacy' && <Shield className="w-3.5 h-3.5" />}
              {currentPage === 'about' && <Sparkles className="w-3.5 h-3.5" />}
              {currentPage === 'help' && <HelpCircle className="w-3.5 h-3.5" />}
              {currentPage === 'legal' && <BookOpen className="w-3.5 h-3.5" />}
              {meta.badge}
            </span>

            <span className="text-xs text-outline font-medium">
              Direct Link: <code className="bg-surface-container px-1.5 py-0.5 rounded font-mono text-on-surface">{meta.path}</code>
            </span>
          </div>

          <h1
            className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight ${
              language === 'ur' ? 'font-urdu leading-relaxed' : "font-['Manrope']"
            }`}
          >
            {getLocalizedText(meta.title)}
          </h1>

          <p className="text-sm sm:text-base text-outline max-w-2xl leading-relaxed">
            {getLocalizedText(meta.subtitle)}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-outline">
            <span>Last Updated: <strong className="text-on-surface">{meta.lastUpdated}</strong></span>
            <span>•</span>
            <span>Platform: <strong className="text-on-surface">YAAD PWA & Web</strong></span>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleCopyPageLink(currentPage)}
              className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
            >
              <Share2 className="w-3 h-3" />
              Copy Direct URL
            </button>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. MAIN PAGE CONTENT BODY */}
      {/* ==================================================================== */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
        {/* ================================================================ */}
        {/* VIEW A: TERMS & CONDITIONS */}
        {/* ================================================================ */}
        {currentPage === 'terms' && (
          <div className="space-y-8">
            {/* Quick Table of Contents Jump Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-surface-dim space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-outline block font-['Manrope']">
                Table of Contents
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {TERMS_SECTIONS.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="p-2 rounded-xl bg-surface-container-lowest hover:bg-primary-fixed/30 hover:text-primary transition-colors text-on-surface truncate block"
                  >
                    {getLocalizedText(sec.title)}
                  </a>
                ))}
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-8 divide-y divide-surface-dim">
              {TERMS_SECTIONS.map((section, idx) => (
                <section
                  key={section.id}
                  id={section.id}
                  className={`space-y-3.5 ${idx > 0 ? 'pt-8' : ''}`}
                >
                  <h2
                    className={`text-lg sm:text-xl font-bold text-on-surface tracking-tight ${
                      language === 'ur' ? 'font-urdu text-xl sm:text-2xl' : "font-['Manrope']"
                    }`}
                  >
                    {getLocalizedText(section.title)}
                  </h2>

                  <div className="space-y-3 text-sm sm:text-base text-on-surface-variant leading-relaxed font-normal">
                    {(language === 'ur'
                      ? section.content.ur
                      : language === 'roman-urdu'
                      ? section.content.romanUrdu
                      : section.content.en
                    ).map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* VIEW B: PRIVACY POLICY */}
        {/* ================================================================ */}
        {currentPage === 'privacy' && (
          <div className="space-y-8">
            {/* Privacy Highlights Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-surface border border-surface-dim space-y-1">
                <div className="w-8 h-8 rounded-xl bg-primary-fixed/40 text-primary flex items-center justify-center mb-2">
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-on-surface font-['Manrope']">Zero Ad Tracking</h3>
                <p className="text-xs text-outline leading-relaxed">
                  We never sell or broker your grocery lists to third-party ad networks.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface border border-surface-dim space-y-1">
                <div className="w-8 h-8 rounded-xl bg-secondary-fixed/50 text-secondary flex items-center justify-center mb-2">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-on-surface font-['Manrope']">Full Encryption</h3>
                <p className="text-xs text-outline leading-relaxed">
                  Row Level Security (RLS) on Supabase PostgreSQL protects personal records.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface border border-surface-dim space-y-1">
                <div className="w-8 h-8 rounded-xl bg-primary-fixed/40 text-primary flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-on-surface font-['Manrope']">Instant Data Purge</h3>
                <p className="text-xs text-outline leading-relaxed">
                  One-tap permanent account deletion immediately erases all data.
                </p>
              </div>
            </div>

            {/* Privacy Sections */}
            <div className="space-y-8 divide-y divide-surface-dim">
              {PRIVACY_SECTIONS.map((section, idx) => (
                <section
                  key={section.id}
                  id={section.id}
                  className={`space-y-3.5 ${idx > 0 ? 'pt-8' : ''}`}
                >
                  <h2
                    className={`text-lg sm:text-xl font-bold text-on-surface tracking-tight ${
                      language === 'ur' ? 'font-urdu text-xl sm:text-2xl' : "font-['Manrope']"
                    }`}
                  >
                    {getLocalizedText(section.title)}
                  </h2>

                  <div className="space-y-3 text-sm sm:text-base text-on-surface-variant leading-relaxed">
                    {(language === 'ur'
                      ? section.content.ur
                      : language === 'roman-urdu'
                      ? section.content.romanUrdu
                      : section.content.en
                    ).map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* VIEW C: ABOUT YAAD */}
        {/* ================================================================ */}
        {currentPage === 'about' && (
          <div className="space-y-10">
            {/* Story Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-surface-dim space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Our Purpose
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-on-surface font-['Manrope']">
                Built to solve the real chaos of grocery shopping.
              </h2>
              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                Most shopping list applications are built for Western supermarkets. They don't understand that
                Pakistani and South Asian kitchens buy in kilograms, need fresh coriander ("hara dhaniya"), cook
                with specialty lentils ("daal mash", "daal chana"), and prepare for weekend family gatherings.
              </p>
              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                YAAD was crafted from the ground up to bring thoughtful, respectful intelligence to shopping.
                Whether you type in English, fast Roman Urdu, or authentic Nastaliq Urdu script, YAAD understands
                your items instantly.
              </p>
            </div>

            {/* Core Highlights Grid */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-on-surface font-['Manrope']">
                What Makes YAAD Different
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ABOUT_HIGHLIGHTS.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-surface border border-surface-dim space-y-2.5 hover:border-primary/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-primary-fixed/40 text-primary flex items-center justify-center">
                      {item.icon === 'languages' && <Languages className="w-5 h-5" />}
                      {item.icon === 'wifi-off' && <WifiOff className="w-5 h-5" />}
                      {item.icon === 'shield-check' && <Shield className="w-5 h-5" />}
                      {item.icon === 'sparkles' && <Sparkles className="w-5 h-5" />}
                    </div>
                    <h4 className="text-base font-bold text-on-surface font-['Manrope']">
                      {getLocalizedText(item.title)}
                    </h4>
                    <p className="text-xs sm:text-sm text-outline leading-relaxed">
                      {getLocalizedText(item.desc)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cultural Nuance Showcase */}
            <div className="p-6 rounded-3xl bg-secondary-fixed/20 border border-secondary-fixed/40 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-bold text-on-surface font-['Manrope']">
                  Deep Urdu & Pakistani Kitchen Catalog
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                YAAD recognizes staples including <strong>Aloo</strong>, <strong>Pyaz</strong>, <strong>Tamatar</strong>,{' '}
                <strong>Doodh</strong>, <strong>Chai Patti</strong>, <strong>Shan Masala</strong>,{' '}
                <strong>Ghee</strong>, <strong>Atta</strong>, <strong>Basmati Chawal</strong>, and over 2,000 localized food items!
              </p>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* VIEW D: HELP & FAQ */}
        {/* ================================================================ */}
        {currentPage === 'help' && (
          <div className="space-y-8">
            {/* Search & Category Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-outline absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={faqSearchQuery}
                  onChange={(e) => setFaqSearchQuery(e.target.value)}
                  placeholder="Search questions (e.g. offline, passkey, urdu)..."
                  className="w-full h-11 bg-surface rounded-2xl ps-10 pe-4 text-sm border border-surface-dim focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-on-surface placeholder:text-outline"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {(['all', 'offline', 'security', 'language', 'general'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedFaqCategory(cat)}
                    className={`px-3 py-1 rounded-full font-semibold capitalize transition-all ${
                      selectedFaqCategory === cat
                        ? 'bg-primary text-on-primary shadow-2xs'
                        : 'bg-surface text-outline hover:text-on-surface border border-surface-dim'
                    }`}
                  >
                    {cat === 'all' ? 'All Questions' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Accordion List */}
            <div className="space-y-3">
              {filteredFaqs.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-surface border border-surface-dim text-outline space-y-1">
                  <p className="font-semibold text-sm">No matching questions found</p>
                  <p className="text-xs">Try searching for different keywords or email our team directly.</p>
                </div>
              ) : (
                filteredFaqs.map((faq) => {
                  const isOpen = openFaqIds.has(faq.id);
                  return (
                    <div
                      key={faq.id}
                      className="rounded-2xl bg-surface border border-surface-dim overflow-hidden transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full p-4 sm:p-5 flex items-center justify-between text-start gap-4 hover:bg-surface-container-lowest/60 transition-colors"
                      >
                        <span
                          className={`text-sm sm:text-base font-bold text-on-surface leading-snug ${
                            language === 'ur' ? 'font-urdu' : "font-['Manrope']"
                          }`}
                        >
                          {getLocalizedText(faq.question)}
                        </span>
                        <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center shrink-0 text-outline">
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-on-surface-variant leading-relaxed border-t border-surface-dim/40 bg-surface-container-lowest/30">
                          <p>{getLocalizedText(faq.answer)}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Direct Contact Card */}
            <div className="p-6 rounded-3xl bg-surface border border-surface-dim space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-fixed/40 text-primary flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface font-['Manrope']">
                    Still need help or have a suggestion?
                  </h3>
                  <p className="text-xs text-outline">
                    Our engineering and customer care team responds to all inquiries within 24 hours.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-dim flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase text-outline block">
                    Direct Support Email
                  </span>
                  <a
                    href="mailto:useyaadapp@gmail.com"
                    className="text-sm font-bold text-primary hover:underline break-all"
                  >
                    useyaadapp@gmail.com
                  </a>
                </div>

                <a
                  href="mailto:useyaadapp@gmail.com?subject=YAAD%20Support%20Request"
                  className="px-4 py-2 rounded-full text-xs font-bold bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-xs"
                >
                  Send Email
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* VIEW E: LEGAL & INFORMATION DIRECTORY HUB */}
        {/* ================================================================ */}
        {currentPage === 'legal' && (
          <div className="space-y-6">
            <p className="text-sm text-outline">
              Below are all individual public links for YAAD. Each page is independently accessible via its own dedicated URL link:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Terms Card */}
              <div className="p-5 rounded-3xl bg-surface border border-surface-dim flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-primary-fixed/40 text-primary flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-on-surface font-['Manrope']">
                    Terms & Conditions
                  </h3>
                  <p className="text-xs text-outline leading-relaxed">
                    User agreement, service terms, offline functionality guidelines, and liability terms.
                  </p>
                  <code className="text-xs text-primary font-mono block">/terms</code>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-surface-dim">
                  <button
                    type="button"
                    onClick={() => handleTabClick('terms')}
                    className="flex-1 py-2 text-xs font-bold text-center bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    Open Terms
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyPageLink('terms')}
                    title="Copy /terms link"
                    className="p-2 rounded-xl bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    {copiedUrl === 'terms' ? <Check className="w-4 h-4 text-primary" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Privacy Card */}
              <div className="p-5 rounded-3xl bg-surface border border-surface-dim flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-secondary-fixed/50 text-secondary flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-on-surface font-['Manrope']">
                    Privacy Policy
                  </h3>
                  <p className="text-xs text-outline leading-relaxed">
                    Zero ad selling guarantee, Supabase database isolation, passkeys, and account deletion.
                  </p>
                  <code className="text-xs text-primary font-mono block">/privacy</code>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-surface-dim">
                  <button
                    type="button"
                    onClick={() => handleTabClick('privacy')}
                    className="flex-1 py-2 text-xs font-bold text-center bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    Open Privacy
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyPageLink('privacy')}
                    title="Copy /privacy link"
                    className="p-2 rounded-xl bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    {copiedUrl === 'privacy' ? <Check className="w-4 h-4 text-primary" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* About YAAD Card */}
              <div className="p-5 rounded-3xl bg-surface border border-surface-dim flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-primary-fixed/40 text-primary flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-on-surface font-['Manrope']">
                    About YAAD
                  </h3>
                  <p className="text-xs text-outline leading-relaxed">
                    The vision, Pakistani kitchen catalog, bilingual recognition, and craft behind the app.
                  </p>
                  <code className="text-xs text-primary font-mono block">/about</code>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-surface-dim">
                  <button
                    type="button"
                    onClick={() => handleTabClick('about')}
                    className="flex-1 py-2 text-xs font-bold text-center bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    Open About
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyPageLink('about')}
                    title="Copy /about link"
                    className="p-2 rounded-xl bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    {copiedUrl === 'about' ? <Check className="w-4 h-4 text-primary" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Help & Support Card */}
              <div className="p-5 rounded-3xl bg-surface border border-surface-dim flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-surface-container text-outline flex items-center justify-center">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-on-surface font-['Manrope']">
                    Help & Support
                  </h3>
                  <p className="text-xs text-outline leading-relaxed">
                    Interactive FAQ, PWA installation, language guide, and direct email contacts.
                  </p>
                  <code className="text-xs text-primary font-mono block">/help</code>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-surface-dim">
                  <button
                    type="button"
                    onClick={() => handleTabClick('help')}
                    className="flex-1 py-2 text-xs font-bold text-center bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    Open Help
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyPageLink('help')}
                    title="Copy /help link"
                    className="p-2 rounded-xl bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    {copiedUrl === 'help' ? <Check className="w-4 h-4 text-primary" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* 5. UNIFIED LEGAL FOOTER WITH DIRECT LINK DIRECTORY */}
        {/* ================================================================ */}
        <footer className="pt-10 border-t border-surface-dim space-y-6 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold">
            <a
              href="/terms"
              onClick={(e) => {
                e.preventDefault();
                handleTabClick('terms');
              }}
              className={`transition-colors ${currentPage === 'terms' ? 'text-primary font-bold' : 'text-outline hover:text-on-surface'}`}
            >
              Terms & Conditions (/terms)
            </a>
            <span className="text-surface-dim">•</span>
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                handleTabClick('privacy');
              }}
              className={`transition-colors ${currentPage === 'privacy' ? 'text-primary font-bold' : 'text-outline hover:text-on-surface'}`}
            >
              Privacy Policy (/privacy)
            </a>
            <span className="text-surface-dim">•</span>
            <a
              href="/about"
              onClick={(e) => {
                e.preventDefault();
                handleTabClick('about');
              }}
              className={`transition-colors ${currentPage === 'about' ? 'text-primary font-bold' : 'text-outline hover:text-on-surface'}`}
            >
              About YAAD (/about)
            </a>
            <span className="text-surface-dim">•</span>
            <a
              href="/help"
              onClick={(e) => {
                e.preventDefault();
                handleTabClick('help');
              }}
              className={`transition-colors ${currentPage === 'help' ? 'text-primary font-bold' : 'text-outline hover:text-on-surface'}`}
            >
              Help & FAQ (/help)
            </a>
          </div>

          <div className="space-y-1 text-xs text-outline">
            <p className="font-semibold text-on-surface font-['Manrope']">
              YAAD • The Thoughtful Shopping Memory
            </p>
            <p>© {new Date().getFullYear()} YAAD. All rights reserved.</p>
          </div>

          <div>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-primary bg-primary-fixed/40 hover:bg-primary-fixed/60 transition-colors active:scale-95"
            >
              <BackIcon className="w-3.5 h-3.5" />
              Return to Shopping
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};
