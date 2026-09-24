import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  ShieldCheck,
  FileText,
  Sparkles,
  HelpCircle,
  Share2,
  Check,
  Mail,
  ChevronDown,
  ChevronUp,
  Search,
  BookOpen,
  Lock,
  WifiOff,
  Languages,
  CheckCircle2,
  ShoppingBag,
  Newspaper,
  UserCheck,
  ShieldAlert,
  Award,
  Scale,
  Database,
  Trash2,
  RotateCcw,
  UtensilsCrossed,
  Layers,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useAppRouter } from '../../router/RouterContext';
import {
  LegalPageType,
  LEGAL_METADATA,
  TERMS_SECTIONS,
  PRIVACY_SECTIONS,
  ABOUT_HIGHLIGHTS,
  FAQS,
  BLOG_POSTS,
} from './legalContent';
import { AppPublicHeader } from '../common/AppPublicHeader';
import { AppPublicFooter } from '../common/AppPublicFooter';

interface LegalPageViewProps {
  initialPage: LegalPageType;
  onBack: () => void;
  onNavigate: (page: LegalPageType) => void;
  user?: any;
}

export const LegalPageView: React.FC<LegalPageViewProps> = ({
  initialPage,
  onBack,
  onNavigate,
  user: propUser,
}) => {
  const { language, isRTL } = useLanguage();
  const { user: authUser } = useAuth();
  const { navigate } = useAppRouter();
  const [currentPage, setCurrentPage] = useState<LegalPageType>(initialPage);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>('all');
  const [openFaqIds, setOpenFaqIds] = useState<Set<string>>(new Set(['offline-how', 'language-switch']));

  const activeUser = propUser !== undefined ? propUser : authUser;

  const rashanListPath =
    language === 'ur'
      ? '/rashan-list?lang=ur'
      : language === 'roman-urdu'
      ? '/rashan-list?lang=roman-urdu'
      : '/rashan-list';

  const rashanListLabel =
    language === 'roman-urdu'
      ? 'Mahana Rashan List'
      : 'Monthly Rashan List';

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

  const getLocalizedText = (obj: { en: string; romanUrdu: string; ur: string }) => {
    return obj.en || obj.romanUrdu || obj.ur;
  };

  // Dedicated icons mapping for Terms sections
  const getTermsIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <CheckCircle2 className="w-5 h-5 text-[#005039]" />;
      case 1:
        return <WifiOff className="w-5 h-5 text-[#005039]" />;
      case 2:
        return <UserCheck className="w-5 h-5 text-[#005039]" />;
      case 3:
        return <ShieldAlert className="w-5 h-5 text-[#005039]" />;
      case 4:
        return <Award className="w-5 h-5 text-[#005039]" />;
      case 5:
        return <Scale className="w-5 h-5 text-[#005039]" />;
      case 6:
      default:
        return <Mail className="w-5 h-5 text-[#005039]" />;
    }
  };

  // Dedicated icons mapping for Privacy sections
  const getPrivacyIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <ShieldCheck className="w-5 h-5 text-[#005039]" />;
      case 1:
        return <Database className="w-5 h-5 text-[#005039]" />;
      case 2:
        return <Sparkles className="w-5 h-5 text-[#005039]" />;
      case 3:
        return <Lock className="w-5 h-5 text-[#005039]" />;
      case 4:
        return <Trash2 className="w-5 h-5 text-[#005039]" />;
      case 5:
      default:
        return <Mail className="w-5 h-5 text-[#005039]" />;
    }
  };

  return (
    <div
      id="legal_page_container"
      dir="ltr"
      className="min-h-screen bg-[#faf8f5] text-[#1c2826] font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#005039]/15 flex flex-col justify-between"
    >
      {/* 1. Global Public Header with Screen-Centered Title and Smooth Sign In */}
      <AppPublicHeader
        user={activeUser}
        showBack={true}
        onBack={onBack}
        onSignIn={onBack}
        title="YAAD"
        onGoHome={onBack}
      />

      {/* ==================================================================== */}
      {/* 2. SECONDARY LINK TABS (Dedicated Link Navigation) */}
      {/* ==================================================================== */}
      <div
        id="legal_nav_tabs"
        className="pt-16 sm:pt-20 bg-white border-b border-[#e5e1d8]"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Legal and About Pages"
            className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar"
          >
            {/* Terms & Conditions Link */}
            <a
              id="legal_tab_terms"
              href="/terms"
              onClick={(e) => {
                e.preventDefault();
                handleTabClick('terms');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                currentPage === 'terms'
                  ? 'bg-[#005039] text-white shadow-xs'
                  : 'bg-[#faf8f5] text-[#556960] hover:text-[#1c2826] hover:bg-[#f0ebe1] border border-[#e5e1d8]'
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
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                currentPage === 'privacy'
                  ? 'bg-[#005039] text-white shadow-xs'
                  : 'bg-[#faf8f5] text-[#556960] hover:text-[#1c2826] hover:bg-[#f0ebe1] border border-[#e5e1d8]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
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
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                currentPage === 'about'
                  ? 'bg-[#005039] text-white shadow-xs'
                  : 'bg-[#faf8f5] text-[#556960] hover:text-[#1c2826] hover:bg-[#f0ebe1] border border-[#e5e1d8]'
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
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                currentPage === 'help'
                  ? 'bg-[#005039] text-white shadow-xs'
                  : 'bg-[#faf8f5] text-[#556960] hover:text-[#1c2826] hover:bg-[#f0ebe1] border border-[#e5e1d8]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{getLocalizedText(LEGAL_METADATA.help.title)}</span>
            </a>

            {/* Monthly Rashan List Guide */}
            <a
              id="legal_tab_rashan"
              href={rashanListPath}
              onClick={(e) => {
                e.preventDefault();
                navigate(rashanListPath);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all bg-[#faf8f5] text-[#556960] hover:text-[#1c2826] hover:bg-[#f0ebe1] border border-[#e5e1d8] cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0 text-[#005039]" />
              <span>{rashanListLabel}</span>
            </a>

            {/* Hub Link */}
            <a
              id="legal_tab_legal"
              href="/legal"
              onClick={(e) => {
                e.preventDefault();
                handleTabClick('legal');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                currentPage === 'legal'
                  ? 'bg-[#005039] text-white shadow-xs'
                  : 'bg-[#faf8f5] text-[#556960] hover:text-[#1c2826] hover:bg-[#f0ebe1] border border-[#e5e1d8]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>{getLocalizedText(LEGAL_METADATA.legal.title)}</span>
            </a>

            {/* Blog & Articles Link */}
            <a
              id="legal_tab_blog"
              href="/blog"
              onClick={(e) => {
                e.preventDefault();
                handleTabClick('blog');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                currentPage === 'blog'
                  ? 'bg-[#005039] text-white shadow-xs'
                  : 'bg-[#faf8f5] text-[#556960] hover:text-[#1c2826] hover:bg-[#f0ebe1] border border-[#e5e1d8]'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5 shrink-0" />
              <span>{language === 'roman-urdu' ? 'Blog & Guides' : 'Blog'}</span>
            </a>
          </nav>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. HERO / PAGE TITLE BANNER */}
      {/* ==================================================================== */}
      <section className="bg-white border-b border-[#e5e1d8] px-4 sm:px-6 lg:px-8 py-8 sm:py-10 shadow-2xs">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#005039]/10 text-[#005039] border border-[#005039]/20">
              {currentPage === 'terms' && <FileText className="w-3.5 h-3.5" />}
              {currentPage === 'privacy' && <ShieldCheck className="w-3.5 h-3.5" />}
              {currentPage === 'about' && <Sparkles className="w-3.5 h-3.5" />}
              {currentPage === 'help' && <HelpCircle className="w-3.5 h-3.5" />}
              {currentPage === 'legal' && <BookOpen className="w-3.5 h-3.5" />}
              {currentPage === 'blog' && <Newspaper className="w-3.5 h-3.5" />}
              <span>{meta.badge}</span>
            </span>

            <span className="text-xs text-[#788880] font-medium">
              Direct Link: <code className="bg-[#faf8f5] px-2 py-0.5 rounded border border-[#e5e1d8] font-mono text-[#1c2826]">{meta.path}</code>
            </span>
          </div>

          <h1
            className={`text-2xl sm:text-3xl lg:text-4xl font-black text-[#1c2826] tracking-tight ${
              language === 'ur' ? 'font-urdu leading-relaxed' : "font-['Plus_Jakarta_Sans',sans-serif]"
            }`}
          >
            {getLocalizedText(meta.title)}
          </h1>

          <p className="text-sm sm:text-base text-[#556960] max-w-2xl leading-relaxed">
            {getLocalizedText(meta.subtitle)}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#788880]">
            <span>Last Updated: <strong className="text-[#1c2826]">{meta.lastUpdated}</strong></span>
            <span>•</span>
            <span>Platform: <strong className="text-[#1c2826]">YAAD PWA &amp; Web</strong></span>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleCopyPageLink(currentPage)}
              className="text-[#005039] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Share2 className="w-3 h-3" />
              <span>{copiedUrl === currentPage ? 'Link Copied!' : 'Copy Direct URL'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. MAIN PAGE CONTENT BODY */}
      {/* ==================================================================== */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 flex-1">
        {/* ================================================================ */}
        {/* VIEW A: TERMS & CONDITIONS */}
        {/* ================================================================ */}
        {currentPage === 'terms' && (
          <div className="space-y-8">
            {/* Quick Table of Contents Jump Box */}
            <div className="p-5 rounded-3xl bg-white border border-[#e5e1d8] shadow-2xs space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#005039] block">
                Table of Contents
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {TERMS_SECTIONS.map((sec, idx) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="p-2.5 rounded-xl bg-[#faf8f5] hover:bg-[#005039]/10 hover:text-[#005039] transition-colors text-[#1c2826] font-medium truncate block border border-[#e5e1d8]/50"
                  >
                    {idx + 1}. {getLocalizedText(sec.title).replace(/^\d+\.\s*/, '')}
                  </a>
                ))}
              </div>
            </div>

            {/* Terms Sections with Specific Icons */}
            <div className="space-y-6">
              {TERMS_SECTIONS.map((section, idx) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="bg-white border border-[#e5e1d8] rounded-3xl p-6 sm:p-7 shadow-2xs space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#005039]/10 text-[#005039] flex items-center justify-center shrink-0">
                      {getTermsIcon(idx)}
                    </div>
                    <h2
                      className={`text-lg sm:text-xl font-black text-[#1c2826] tracking-tight ${
                        language === 'ur' ? 'font-urdu text-xl sm:text-2xl' : ''
                      }`}
                    >
                      {getLocalizedText(section.title)}
                    </h2>
                  </div>

                  <div className="space-y-3 text-sm sm:text-base text-[#556960] leading-relaxed font-normal">
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-white border border-[#e5e1d8] shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-[#005039]/10 text-[#005039] flex items-center justify-center mb-2">
                  <ShieldCheck className="w-5 h-5 text-[#005039]" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#1c2826]">Zero Ad Tracking</h3>
                <p className="text-xs text-[#556960] leading-relaxed">
                  We never sell, rent, or broker your grocery lists to third-party ad networks or brokers.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[#e5e1d8] shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-[#005039]/10 text-[#005039] flex items-center justify-center mb-2">
                  <Lock className="w-5 h-5 text-[#005039]" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#1c2826]">Strict Isolation</h3>
                <p className="text-xs text-[#556960] leading-relaxed">
                  Enterprise Row Level Security (RLS) ensures only authenticated household members can read lists.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[#e5e1d8] shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-[#005039]/10 text-[#005039] flex items-center justify-center mb-2">
                  <Trash2 className="w-5 h-5 text-[#005039]" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#1c2826]">Permanent Data Purge</h3>
                <p className="text-xs text-[#556960] leading-relaxed">
                  One-tap permanent account deletion immediately purges all lists, histories, and credentials.
                </p>
              </div>
            </div>

            {/* Privacy Sections with Specific Icons */}
            <div className="space-y-6">
              {PRIVACY_SECTIONS.map((section, idx) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="bg-white border border-[#e5e1d8] rounded-3xl p-6 sm:p-7 shadow-2xs space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#005039]/10 text-[#005039] flex items-center justify-center shrink-0">
                      {getPrivacyIcon(idx)}
                    </div>
                    <h2
                      className={`text-lg sm:text-xl font-black text-[#1c2826] tracking-tight ${
                        language === 'ur' ? 'font-urdu text-xl sm:text-2xl' : ''
                      }`}
                    >
                      {getLocalizedText(section.title)}
                    </h2>
                  </div>

                  <div className="space-y-3 text-sm sm:text-base text-[#556960] leading-relaxed">
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
        {/* VIEW C: ABOUT YAAD (Polished Layout, Form, Spacing & Specific Icons) */}
        {/* ================================================================ */}
        {currentPage === 'about' && (
          <div className="space-y-10">
            {/* 1. Main Editorial Story Banner */}
            <div className="p-7 sm:p-9 rounded-3xl bg-white border border-[#e5e1d8] shadow-xs space-y-4 relative overflow-hidden">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#005039]/10 text-[#005039] text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Our Craft &amp; Purpose</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1c2826] tracking-tight leading-snug">
                Built to solve the real chaos of grocery shopping.
              </h2>
              <p className="text-sm sm:text-base text-[#556960] leading-relaxed">
                Most shopping list applications are built for Western supermarkets. They don&apos;t understand that
                Pakistani and South Asian kitchens buy in kilograms, need fresh coriander (&ldquo;hara dhaniya&rdquo;), cook
                with specialty lentils (&ldquo;daal mash&rdquo;, &ldquo;daal chana&rdquo;), and prepare for weekend family gatherings.
              </p>
              <p className="text-sm sm:text-base text-[#556960] leading-relaxed">
                YAAD was crafted from the ground up to bring thoughtful, respectful intelligence to daily shopping.
                Whether you type in English, fast Roman Urdu, or authentic Nastaliq Urdu script, YAAD understands
                your items instantly.
              </p>
            </div>

            {/* 2. Four Pillars Grid with Specific, Elevated Lucide Icons */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-black text-[#1c2826] tracking-tight">
                  What Makes YAAD Different
                </h3>
                <span className="text-xs font-semibold text-[#005039]">4 Core Pillars</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Pillar 1: Native Bilingual Intelligence */}
                <div className="p-6 rounded-3xl bg-white border border-[#e5e1d8] space-y-3.5 shadow-2xs hover:border-[#005039]/40 hover:shadow-xs transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[#005039]/10 text-[#005039] flex items-center justify-center mb-3">
                      <Languages className="w-6 h-6 text-[#005039]" />
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-[#1c2826] tracking-tight">
                      Native Bilingual Intelligence
                    </h4>
                    <p className="text-xs sm:text-sm text-[#556960] leading-relaxed mt-1.5">
                      Type in English, Roman Urdu (&ldquo;doodh, aloo, pyaz&rdquo;), or everyday words. YAAD recognizes Pakistani kitchen staples and categorizes them automatically.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#f2efe9] text-xs font-bold text-[#005039]">
                    Auto categorizer
                  </div>
                </div>

                {/* Pillar 2: Unstoppable Offline First */}
                <div className="p-6 rounded-3xl bg-white border border-[#e5e1d8] space-y-3.5 shadow-2xs hover:border-[#005039]/40 hover:shadow-xs transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[#005039]/10 text-[#005039] flex items-center justify-center mb-3">
                      <WifiOff className="w-6 h-6 text-[#005039]" />
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-[#1c2826] tracking-tight">
                      Unstoppable Offline First
                    </h4>
                    <p className="text-xs sm:text-sm text-[#556960] leading-relaxed mt-1.5">
                      Supermarkets and basement bazaars are notorious for dead zones. YAAD works completely offline, letting you check off items and create lists anywhere, syncing when reconnected.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#f2efe9] text-xs font-bold text-[#005039]">
                    100% offline ready
                  </div>
                </div>

                {/* Pillar 3: Zero Ad Tracking & Absolute Privacy */}
                <div className="p-6 rounded-3xl bg-white border border-[#e5e1d8] space-y-3.5 shadow-2xs hover:border-[#005039]/40 hover:shadow-xs transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[#005039]/10 text-[#005039] flex items-center justify-center mb-3">
                      <ShieldCheck className="w-6 h-6 text-[#005039]" />
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-[#1c2826] tracking-tight">
                      Zero Ad Tracking &amp; Absolute Privacy
                    </h4>
                    <p className="text-xs sm:text-sm text-[#556960] leading-relaxed mt-1.5">
                      No intrusive banner ads, no popups, and no tracking cookies. Your grocery spending habits are never sold to advertisers or marketing aggregators.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#f2efe9] text-xs font-bold text-[#005039]">
                    Zero telemetry
                  </div>
                </div>

                {/* Pillar 4: Smart Restock Memory */}
                <div className="p-6 rounded-3xl bg-white border border-[#e5e1d8] space-y-3.5 shadow-2xs hover:border-[#005039]/40 hover:shadow-xs transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[#005039]/10 text-[#005039] flex items-center justify-center mb-3">
                      <RotateCcw className="w-6 h-6 text-[#005039]" />
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-[#1c2826] tracking-tight">
                      Smart Restock Memory
                    </h4>
                    <p className="text-xs sm:text-sm text-[#556960] leading-relaxed mt-1.5">
                      YAAD gently remembers how often you purchase essentials like milk, cooking oil, and tea, offering one-tap restock chips right when you need them.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#f2efe9] text-xs font-bold text-[#005039]">
                    Smart cadence
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Cultural Nuance & Pakistani Kitchen Catalog Showcase */}
            <div className="p-7 sm:p-8 rounded-3xl bg-white border-2 border-[#005039]/25 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#005039] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#1c2826] tracking-tight">
                    Deep Urdu &amp; Pakistani Kitchen Catalog
                  </h4>
                  <p className="text-xs text-[#556960]">
                    Trained specifically on everyday South Asian groceries and traditional weights
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#556960] leading-relaxed">
                YAAD recognizes staples including <strong>Aloo</strong>, <strong>Pyaz</strong>, <strong>Tamatar</strong>,{' '}
                <strong>Doodh</strong>, <strong>Chai Patti</strong>, <strong>Shan Masala</strong>,{' '}
                <strong>Ghee</strong>, <strong>Chakki Atta</strong>, <strong>Basmati Chawal</strong>, and over 2,000 localized food items!
              </p>

              <div className="pt-2">
                <a
                  id="about_rashan_checklist_link"
                  href={rashanListPath}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(rashanListPath);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#005039] hover:bg-[#003d2b] shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  <span>
                    {language === 'roman-urdu'
                      ? 'Monthly Rashan List Guide & Pantry Checklist Dekhein →'
                      : 'Explore the Monthly Rashan List Guide & Household Checklist →'}
                  </span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* VIEW D: HELP & FAQ */}
        {/* ================================================================ */}
        {currentPage === 'help' && (
          <div className="space-y-8">
            {/* Search & Category Filter */}
            <div className="space-y-3.5">
              <div className="relative">
                <Search className="w-4 h-4 text-[#788880] absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={faqSearchQuery}
                  onChange={(e) => setFaqSearchQuery(e.target.value)}
                  placeholder="Search questions (e.g. offline, passkey, urdu)..."
                  className="w-full h-11 bg-white rounded-2xl ps-10 pe-4 text-sm border border-[#e5e1d8] focus:border-[#005039] focus:ring-2 focus:ring-[#005039]/20 outline-none text-[#1c2826] placeholder:text-[#788880] shadow-2xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {(['all', 'offline', 'security', 'language', 'general'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedFaqCategory(cat)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold capitalize transition-all cursor-pointer ${
                      selectedFaqCategory === cat
                        ? 'bg-[#005039] text-white shadow-xs'
                        : 'bg-white text-[#556960] hover:text-[#1c2826] border border-[#e5e1d8]'
                    }`}
                  >
                    {cat === 'offline' && <WifiOff className="w-3.5 h-3.5" />}
                    {cat === 'security' && <Lock className="w-3.5 h-3.5" />}
                    {cat === 'language' && <Languages className="w-3.5 h-3.5" />}
                    {cat === 'general' && <Sparkles className="w-3.5 h-3.5" />}
                    {cat === 'all' && <HelpCircle className="w-3.5 h-3.5" />}
                    <span>{cat === 'all' ? 'All Questions' : cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accordion List */}
            <div className="space-y-3">
              {filteredFaqs.length === 0 ? (
                <div className="p-8 text-center rounded-3xl bg-white border border-[#e5e1d8] text-[#788880] space-y-1 shadow-2xs">
                  <p className="font-bold text-sm text-[#1c2826]">No matching questions found</p>
                  <p className="text-xs">Try searching for different keywords or email our team directly.</p>
                </div>
              ) : (
                filteredFaqs.map((faq) => {
                  const isOpen = openFaqIds.has(faq.id);
                  return (
                    <div
                      key={faq.id}
                      className="rounded-3xl bg-white border border-[#e5e1d8] overflow-hidden transition-all shadow-2xs"
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full p-5 flex items-center justify-between text-start gap-4 hover:bg-[#faf8f5] transition-colors cursor-pointer"
                      >
                        <span
                          className={`text-sm sm:text-base font-bold text-[#1c2826] leading-snug ${
                            language === 'ur' ? 'font-urdu' : ''
                          }`}
                        >
                          {getLocalizedText(faq.question)}
                        </span>
                        <div className="w-7 h-7 rounded-full bg-[#faf8f5] border border-[#e5e1d8] flex items-center justify-center shrink-0 text-[#005039]">
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#556960] leading-relaxed border-t border-[#f2efe9] bg-[#faf8f5]/60">
                          <p>{getLocalizedText(faq.answer)}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Direct Contact Card */}
            <div className="p-7 rounded-3xl bg-white border border-[#e5e1d8] shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#005039]/10 text-[#005039] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[#005039]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1c2826]">
                    Still need help or have a suggestion?
                  </h3>
                  <p className="text-xs text-[#556960]">
                    Our engineering and customer care team responds to all inquiries within 24 hours.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase text-[#788880] block">
                    Direct Support Email
                  </span>
                  <a
                    href="mailto:yaadapppk@gmail.com"
                    className="text-sm font-bold text-[#005039] hover:underline break-all"
                  >
                    yaadapppk@gmail.com
                  </a>
                </div>

                <a
                  href="mailto:yaadapppk@gmail.com?subject=YAAD%20Support%20Request"
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#005039] text-white hover:bg-[#003d2b] transition-colors shadow-xs"
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
            <p className="text-sm text-[#556960]">
              Below are all individual public links for YAAD. Each page is independently accessible via its own dedicated URL link:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Terms Card */}
              <div className="p-6 rounded-3xl bg-white border border-[#e5e1d8] flex flex-col justify-between space-y-4 shadow-2xs">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#005039]/10 text-[#005039] flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#005039]" />
                  </div>
                  <h3 className="text-base font-bold text-[#1c2826]">
                    Terms &amp; Conditions
                  </h3>
                  <p className="text-xs text-[#556960] leading-relaxed">
                    User agreement, service terms, offline functionality guidelines, and liability terms.
                  </p>
                  <code className="text-xs text-[#005039] font-mono block">/terms</code>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-[#f2efe9]">
                  <button
                    type="button"
                    onClick={() => handleTabClick('terms')}
                    className="flex-1 py-2 text-xs font-bold text-center bg-[#005039] text-white rounded-xl hover:bg-[#003d2b] transition-colors cursor-pointer"
                  >
                    Open Terms
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyPageLink('terms')}
                    title="Copy /terms link"
                    className="p-2 rounded-xl bg-[#faf8f5] border border-[#e5e1d8] text-[#556960] hover:text-[#1c2826] transition-colors cursor-pointer"
                  >
                    {copiedUrl === 'terms' ? <Check className="w-4 h-4 text-[#005039]" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Privacy Card */}
              <div className="p-6 rounded-3xl bg-white border border-[#e5e1d8] flex flex-col justify-between space-y-4 shadow-2xs">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#005039]/10 text-[#005039] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-[#005039]" />
                  </div>
                  <h3 className="text-base font-bold text-[#1c2826]">
                    Privacy Policy
                  </h3>
                  <p className="text-xs text-[#556960] leading-relaxed">
                    Zero ad selling guarantee, database isolation, passkeys, and account deletion.
                  </p>
                  <code className="text-xs text-[#005039] font-mono block">/privacy</code>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-[#f2efe9]">
                  <button
                    type="button"
                    onClick={() => handleTabClick('privacy')}
                    className="flex-1 py-2 text-xs font-bold text-center bg-[#005039] text-white rounded-xl hover:bg-[#003d2b] transition-colors cursor-pointer"
                  >
                    Open Privacy
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyPageLink('privacy')}
                    title="Copy /privacy link"
                    className="p-2 rounded-xl bg-[#faf8f5] border border-[#e5e1d8] text-[#556960] hover:text-[#1c2826] transition-colors cursor-pointer"
                  >
                    {copiedUrl === 'privacy' ? <Check className="w-4 h-4 text-[#005039]" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* About YAAD Card */}
              <div className="p-6 rounded-3xl bg-white border border-[#e5e1d8] flex flex-col justify-between space-y-4 shadow-2xs">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#005039]/10 text-[#005039] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#005039]" />
                  </div>
                  <h3 className="text-base font-bold text-[#1c2826]">
                    About YAAD
                  </h3>
                  <p className="text-xs text-[#556960] leading-relaxed">
                    The vision, Pakistani kitchen catalog, bilingual recognition, and craft behind the app.
                  </p>
                  <code className="text-xs text-[#005039] font-mono block">/about</code>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-[#f2efe9]">
                  <button
                    type="button"
                    onClick={() => handleTabClick('about')}
                    className="flex-1 py-2 text-xs font-bold text-center bg-[#005039] text-white rounded-xl hover:bg-[#003d2b] transition-colors cursor-pointer"
                  >
                    Open About
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyPageLink('about')}
                    title="Copy /about link"
                    className="p-2 rounded-xl bg-[#faf8f5] border border-[#e5e1d8] text-[#556960] hover:text-[#1c2826] transition-colors cursor-pointer"
                  >
                    {copiedUrl === 'about' ? <Check className="w-4 h-4 text-[#005039]" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Help & Support Card */}
              <div className="p-6 rounded-3xl bg-white border border-[#e5e1d8] flex flex-col justify-between space-y-4 shadow-2xs">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#005039]/10 text-[#005039] flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-[#005039]" />
                  </div>
                  <h3 className="text-base font-bold text-[#1c2826]">
                    Help &amp; Support
                  </h3>
                  <p className="text-xs text-[#556960] leading-relaxed">
                    Interactive FAQ, PWA installation, language guide, and direct email contacts.
                  </p>
                  <code className="text-xs text-[#005039] font-mono block">/help</code>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-[#f2efe9]">
                  <button
                    type="button"
                    onClick={() => handleTabClick('help')}
                    className="flex-1 py-2 text-xs font-bold text-center bg-[#005039] text-white rounded-xl hover:bg-[#003d2b] transition-colors cursor-pointer"
                  >
                    Open Help
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyPageLink('help')}
                    title="Copy /help link"
                    className="p-2 rounded-xl bg-[#faf8f5] border border-[#e5e1d8] text-[#556960] hover:text-[#1c2826] transition-colors cursor-pointer"
                  >
                    {copiedUrl === 'help' ? <Check className="w-4 h-4 text-[#005039]" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* VIEW F: YAAD BLOG & GUIDES (User-Requested Editorial Articles) */}
        {/* ================================================================ */}
        {currentPage === 'blog' && (
          <div className="space-y-8">
            {/* Header intro banner */}
            <div className="p-7 sm:p-9 rounded-3xl bg-white border border-[#e5e1d8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#005039]">
                  YAAD Editorial &amp; Guides
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#1c2826] tracking-tight">
                  Smart Grocery &amp; Household Shopping Guides
                </h2>
                <p className="text-xs sm:text-sm text-[#556960] max-w-2xl">
                  Practical articles crafted for Pakistani households to save money, avoid forgotten items, and master local grocery shopping.
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#005039]/10 flex items-center justify-center text-[#005039] shrink-0">
                <Newspaper className="w-6 h-6" />
              </div>
            </div>

            {/* Articles List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {BLOG_POSTS.map((post) => {
                const title = getLocalizedText(post.title);
                const summary = getLocalizedText(post.summary);
                const category = getLocalizedText(post.category);
                const paragraphs =
                  language === 'ur'
                    ? post.content.ur
                    : language === 'roman-urdu'
                    ? post.content.romanUrdu
                    : post.content.en;

                return (
                  <article
                    key={post.id}
                    id={post.id}
                    className="p-6 rounded-3xl bg-white border border-[#e5e1d8] hover:border-[#005039]/30 transition-all flex flex-col justify-between space-y-4 shadow-2xs"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="px-2.5 py-1 rounded-full bg-[#005039]/10 text-[#005039] font-bold">
                          {category}
                        </span>
                        <span className="text-[#788880] font-medium">{post.readTime}</span>
                      </div>

                      <h3
                        className={`text-base sm:text-lg font-bold text-[#1c2826] leading-snug ${
                          language === 'ur' ? 'font-urdu text-lg sm:text-xl' : ''
                        }`}
                      >
                        {title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#556960] leading-relaxed line-clamp-3">
                        {summary}
                      </p>

                      <div className="pt-2 border-t border-[#f2efe9] space-y-2 text-xs text-[#556960] leading-relaxed">
                        {paragraphs.slice(0, 2).map((p, idx) => (
                          <p key={idx}>{p}</p>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 text-xs text-[#788880] font-medium flex items-center justify-between">
                      <span>{post.publishDate}</span>
                      <span className="text-[#005039] font-bold">YAAD Editorial</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. Clean Return to Home Button */}
        <div className="pt-6 text-center">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-[#005039] bg-white border border-[#e5e1d8] hover:bg-[#faf8f5] shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Shopping</span>
          </button>
        </div>
      </main>

      {/* Global Unified Public Footer */}
      <AppPublicFooter
        onOpenShopping={onBack}
        onOpenRashan={() => {
          navigate(rashanListPath);
        }}
        onOpenLegal={(page) => handleTabClick(page as LegalPageType)}
      />
    </div>
  );
};
