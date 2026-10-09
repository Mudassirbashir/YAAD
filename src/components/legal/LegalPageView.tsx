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
  Code,
  CheckSquare,
  Terminal,
  ChevronRight,
  MessageSquare,
  Send,
  Clock,
  User,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useAppRouter } from '../../router/RouterContext';
import { APP_IMAGES } from '../../data/initialData';
import { BlueTickCheckCircle } from '../BlueTickCheckCircle';
import {
  LegalPageType,
  LEGAL_METADATA,
  TERMS_SECTIONS,
  PRIVACY_SECTIONS,
  ABOUT_HIGHLIGHTS,
  FAQS,
  BLOG_POSTS,
  FEATURES_DATA,
  HOW_IT_WORKS_DATA,
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
  const [openFaqIds, setOpenFaqIds] = useState<Set<string>>(new Set(['what-is-yaad', 'offline-how', 'language-switch']));
  const [expandedBlogPostId, setExpandedBlogPostId] = useState<string | null>(null);

  // Dynamic CMS articles state & comments state
  const [cmsArticles, setCmsArticles] = useState<any[]>([]);
  const [commentInputs, setCommentInputs] = useState<Record<string, { name: string; email: string; content: string }>>({});
  const [isSubmittingComment, setIsSubmittingComment] = useState<Record<string, boolean>>({});
  const [commentSuccessMsg, setCommentSuccessMsg] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    fetch('/api/blog/articles')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.articles) {
          setCmsArticles(data.articles);
        }
      })
      .catch((err) => console.error('Failed to fetch CMS articles:', err));
    return () => {
      isMounted = false;
    };
  }, []);

  const handlePostComment = async (articleId: string) => {
    const input = commentInputs[articleId] || { name: '', email: '', content: '' };
    if (!input.content?.trim()) return;

    setIsSubmittingComment((prev) => ({ ...prev, [articleId]: true }));
    try {
      const res = await fetch(`/api/blog/articles/${articleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: input.name.trim() || 'Reader',
          email: input.email.trim() || undefined,
          content: input.content.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.comment) {
        setCmsArticles((prev) =>
          prev.map((art) => {
            if (art.id === articleId || art.slug === articleId) {
              const existing = art.comments || [];
              return {
                ...art,
                comments: [data.comment, ...existing],
                commentsCount: (art.commentsCount || existing.length) + 1,
              };
            }
            return art;
          })
        );
        setCommentInputs((prev) => ({ ...prev, [articleId]: { name: '', email: '', content: '' } }));
        setCommentSuccessMsg((prev) => ({ ...prev, [articleId]: 'Comment posted successfully!' }));
        setTimeout(() => {
          setCommentSuccessMsg((prev) => ({ ...prev, [articleId]: '' }));
        }, 3000);
      }
    } catch (e) {
      console.error('Failed to post comment', e);
    } finally {
      setIsSubmittingComment((prev) => ({ ...prev, [articleId]: false }));
    }
  };

  // Authentic First-Party Example Shopping List State (derived from real catalog & rashan data)
  const [exampleListItems, setExampleListItems] = useState([
    { id: 'ex-1', category: 'Produce', name: 'Pyaz (Onions)', quantity: '2 kg', completed: true },
    { id: 'ex-2', category: 'Produce', name: 'Aloo (Potatoes)', quantity: '1 Dharri (5kg)', completed: false },
    { id: 'ex-3', category: 'Produce', name: 'Tamatar (Tomatoes)', quantity: '1 kg', completed: false },
    { id: 'ex-4', category: 'Produce', name: 'Adrak (Ginger)', quantity: '1 Pao (250g)', completed: true },
    { id: 'ex-5', category: 'Dairy & Breakfast', name: 'Fresh Milk (Doodh)', quantity: '2 Litres', completed: true },
    { id: 'ex-6', category: 'Dairy & Breakfast', name: 'Desi Eggs', quantity: '1 Dozen', completed: false },
    { id: 'ex-7', category: 'Dairy & Breakfast', name: 'Chai Patti', quantity: '450 g', completed: false },
    { id: 'ex-8', category: 'Pantry & Grains', name: 'Chakki Atta', quantity: '10 kg', completed: false },
    { id: 'ex-9', category: 'Pantry & Grains', name: 'Basmati Rice', quantity: '5 kg', completed: true },
    { id: 'ex-10', category: 'Pantry & Grains', name: 'Cooking Oil', quantity: '5 Litres', completed: false },
    { id: 'ex-11', category: 'Spices & Seasoning', name: 'Haldi (Turmeric)', quantity: '100 g', completed: true },
    { id: 'ex-12', category: 'Household', name: 'Dishwashing Bar', quantity: '1 Pack', completed: false },
  ]);

  const toggleExampleItem = (id: string) => {
    setExampleListItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const activeUser = propUser !== undefined ? propUser : authUser;

  const langSuffix = language === 'ur' ? '?lang=ur' : language === 'roman-urdu' ? '?lang=roman-urdu' : '';
  const rashanListPath = `/rashan-list${langSuffix}`;
  const howItWorksPath = `/how-it-works${langSuffix}`;
  const featuresPath = `/features${langSuffix}`;
  const blogPath = `/blog${langSuffix}`;
  const helpPath = `/help${langSuffix}`;
  const aboutPath = `/about${langSuffix}`;

  const rashanListLabel =
    language === 'roman-urdu'
      ? 'Mahana Rashan List'
      : 'Monthly Rashan List';

  // Sync internal state when prop changes
  useEffect(() => {
    setCurrentPage(initialPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [initialPage]);

  // Auto-expand blog article if URL has matching hash (static or dynamic CMS)
  useEffect(() => {
    if (currentPage === 'blog' && typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const isStatic = BLOG_POSTS.some((p) => p.id === hash);
        const isCms = cmsArticles.some((a) => a.slug === hash || a.id === hash);
        if (isStatic || isCms) {
          setExpandedBlogPostId(hash);
          setTimeout(() => {
            const el = document.getElementById(hash);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 150);
        }
      }
    }
  }, [currentPage, cmsArticles]);

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
            aria-label="Public Information and Architecture Navigation"
            className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar"
          >
            {/* 1. Features Link */}
            <a
              id="legal_tab_features"
              href="/features"
              onClick={(e) => {
                e.preventDefault();
                handleTabClick('features');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                currentPage === 'features'
                  ? 'bg-[#005039] text-white shadow-xs'
                  : 'bg-[#faf8f5] text-[#556960] hover:text-[#1c2826] hover:bg-[#f0ebe1] border border-[#e5e1d8]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{getLocalizedText(LEGAL_METADATA.features.title)}</span>
            </a>

            {/* 2. How It Works Link */}
            <a
              id="legal_tab_how_it_works"
              href="/how-it-works"
              onClick={(e) => {
                e.preventDefault();
                handleTabClick('how_it_works');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                currentPage === 'how_it_works'
                  ? 'bg-[#005039] text-white shadow-xs'
                  : 'bg-[#faf8f5] text-[#556960] hover:text-[#1c2826] hover:bg-[#f0ebe1] border border-[#e5e1d8]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{getLocalizedText(LEGAL_METADATA.how_it_works.title)}</span>
            </a>

            {/* 3. Help & FAQ Link */}
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
              <span>{language === 'roman-urdu' ? 'FAQ & Madad' : 'FAQ & Help'}</span>
            </a>

            {/* 4. About YAAD Link */}
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
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <span>{getLocalizedText(LEGAL_METADATA.about.title)}</span>
            </a>

            {/* 5. Blog & Articles Link */}
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

            {/* 6. Monthly Rashan List Guide */}
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

            {/* 7. Privacy Policy Link */}
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

            {/* 8. Terms & Conditions Link */}
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

            {/* 9. Hub Link */}
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
        {/* VIEW C: ABOUT YAAD (Ownership, Purpose, Problem & Verified Craft) */}
        {/* ================================================================ */}
        {currentPage === 'about' && (
          <div className="space-y-10">
            {/* 1. Main Editorial Story Banner: What YAAD Is & Why It Exists */}
            <div className="p-7 sm:p-9 rounded-3xl bg-white border border-[#e5e1d8] shadow-xs space-y-5 relative overflow-hidden">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#005039]/10 text-[#005039] text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Our Purpose &amp; Craft</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-[#1c2826] tracking-tight leading-snug">
                  {language === 'ur'
                    ? 'خریداری کے دوران ضروری اشیاء یاد رکھنے کے لیے ایک قابلِ اعتماد ساتھی'
                    : language === 'roman-urdu'
                    ? 'Shopping k waqt zaroori sauda salaf yaad rakhne ka aasan aur mustahkam zariya'
                    : 'A calm, dependable tool built to help you remember what you need to buy.'}
                </h2>
                <p className="text-sm sm:text-base text-[#556960] leading-relaxed">
                  YAAD is a shopping list and reminder app that helps people remember the things they need to buy before and during shopping.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* What YAAD Is */}
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#005039]">1. What YAAD Is</span>
                  <p className="text-xs sm:text-sm text-[#556960] leading-relaxed">
                    A focused shopping list and reminder utility designed for households, home cooks, and shoppers who need a dependable, ad-free tool to organize grocery items.
                  </p>
                </div>

                {/* Why YAAD Exists */}
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#005039]">2. Why YAAD Exists</span>
                  <p className="text-xs sm:text-sm text-[#556960] leading-relaxed">
                    Built to offer a quiet, practical alternative to generic list apps that freeze when internet signals drop inside basement supermarkets and ignore local grocery languages.
                  </p>
                </div>

                {/* The Problem It Solves */}
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#005039]">3. The Problem Solved</span>
                  <p className="text-xs sm:text-sm text-[#556960] leading-relaxed">
                    Forgetting essential groceries causes interrupted meal preparation, repeated trips to the store, and unnecessary household stress. YAAD eliminates reliance on working memory alone.
                  </p>
                </div>

                {/* Who It Is For */}
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#005039]">4. Who It Is For</span>
                  <p className="text-xs sm:text-sm text-[#556960] leading-relaxed">
                    Families, individuals, roommates, and household shoppers who value fast entry, natural language support (English, Roman Urdu, Urdu), and complete data privacy.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Ownership, Authorship & Independent Maintainer Information */}
            <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[#e5e1d8] shadow-xs space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#005039]/10 text-[#005039] flex items-center justify-center shrink-0">
                  <UserCheck className="w-6 h-6 text-[#005039]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#1c2826] tracking-tight">
                    Ownership, Authorship &amp; Engineering
                  </h3>
                  <p className="text-xs text-[#556960]">
                    Created and maintained independently by software engineer Mudassir Bashir
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-[#556960] leading-relaxed">
                <p>
                  YAAD is an independent software project created, designed, and actively maintained by software engineer <strong>Mudassir Bashir</strong>.
                </p>
                <p>
                  The project was started to address real daily friction in Pakistani and bilingual households: conventional shopping applications are rarely optimized for regional pantry items (such as <em>chakki atta</em>, <em>daal mash</em>, or <em>Shan masalas</em>), stop functioning when phone signals vanish in supermarket basements, and compromise user experience with third-party tracking scripts and intrusive ads.
                </p>
                <p>
                  YAAD is engineered with a strict local-first architecture using modern web technologies (React 19, TypeScript, Tailwind CSS, IndexedDB client storage). Direct contact with the author and maintainer is available via email at{' '}
                  <a href="mailto:yaadapppk@gmail.com" className="text-[#005039] font-bold underline">
                    yaadapppk@gmail.com
                  </a>.
                </p>
              </div>

              {/* Author & Entity Summary Card */}
              <div className="p-5 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="font-bold text-[#1c2826] block">Project Creator &amp; Maintainer</span>
                  <span className="text-[#556960]">Mudassir Bashir</span>
                </div>
                <div>
                  <span className="font-bold text-[#1c2826] block">Organization Entity</span>
                  <span className="text-[#556960]">YAAD (https://yaadapppk.vercel.app)</span>
                </div>
                <div>
                  <span className="font-bold text-[#1c2826] block">Official Contact</span>
                  <a href="mailto:yaadapppk@gmail.com" className="text-[#005039] font-semibold hover:underline">
                    yaadapppk@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* 3. Four Core Pillars */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-black text-[#1c2826] tracking-tight">
                  Core Engineering Principles
                </h3>
                <span className="text-xs font-semibold text-[#005039]">4 Pillars</span>
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

            {/* 4. Cultural Nuance & Pakistani Kitchen Catalog Showcase */}
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

            {/* 5. Where Users Can Learn More (Comprehensive Exploration Hub) */}
            <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[#e5e1d8] shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#1c2826] tracking-tight">
                    Where to Learn More
                  </h3>
                  <p className="text-xs text-[#556960]">
                    Explore interactive walkthroughs, technical guides, checklists, and direct assistance
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Link 1: How It Works */}
                <a
                  href={howItWorksPath}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(howItWorksPath);
                  }}
                  className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] hover:border-[#005039]/40 hover:bg-white transition-all space-y-1.5 group cursor-pointer block"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#005039] uppercase tracking-wider">Interactive Guide</span>
                    <ChevronRight className="w-4 h-4 text-[#005039] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <h4 className="text-sm font-bold text-[#1c2826]">See How YAAD Works</h4>
                  <p className="text-xs text-[#556960] leading-relaxed">
                    Step-by-step interactive walkthrough of creating lists, auto-categorizing items, and checking off groceries.
                  </p>
                </a>

                {/* Link 2: Features */}
                <a
                  href={featuresPath}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(featuresPath);
                  }}
                  className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] hover:border-[#005039]/40 hover:bg-white transition-all space-y-1.5 group cursor-pointer block"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#005039] uppercase tracking-wider">Features</span>
                    <ChevronRight className="w-4 h-4 text-[#005039] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <h4 className="text-sm font-bold text-[#1c2826]">Explore Feature Suite</h4>
                  <p className="text-xs text-[#556960] leading-relaxed">
                    Bilingual intelligence, offline IndexedDB storage, Pakistani unit converters, and secure cloud sync.
                  </p>
                </a>

                {/* Link 3: Monthly Rashan List */}
                <a
                  href={rashanListPath}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(rashanListPath);
                  }}
                  className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] hover:border-[#005039]/40 hover:bg-white transition-all space-y-1.5 group cursor-pointer block"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#005039] uppercase tracking-wider">Pantry Checklist</span>
                    <ChevronRight className="w-4 h-4 text-[#005039] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <h4 className="text-sm font-bold text-[#1c2826]">Monthly Rashan Guide</h4>
                  <p className="text-xs text-[#556960] leading-relaxed">
                    Pre-curated monthly grocery checklists tailored for Pakistani households with 1-click list import.
                  </p>
                </a>

                {/* Link 4: Blog */}
                <a
                  href={blogPath}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(blogPath);
                  }}
                  className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] hover:border-[#005039]/40 hover:bg-white transition-all space-y-1.5 group cursor-pointer block"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#005039] uppercase tracking-wider">Knowledge Hub</span>
                    <ChevronRight className="w-4 h-4 text-[#005039] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <h4 className="text-sm font-bold text-[#1c2826]">Shopping Knowledge &amp; Blog</h4>
                  <p className="text-xs text-[#556960] leading-relaxed">
                    In-depth articles on shopping psychology, memory limitations, budget planning, and kitchen organization.
                  </p>
                </a>

                {/* Link 5: Help & FAQ */}
                <a
                  href={helpPath}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(helpPath);
                  }}
                  className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] hover:border-[#005039]/40 hover:bg-white transition-all space-y-1.5 group cursor-pointer block"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#005039] uppercase tracking-wider">Help Center</span>
                    <ChevronRight className="w-4 h-4 text-[#005039] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <h4 className="text-sm font-bold text-[#1c2826]">Help &amp; Frequently Asked Questions</h4>
                  <p className="text-xs text-[#556960] leading-relaxed">
                    Answers regarding offline functionality, account security, Urdu typing, and device synchronization.
                  </p>
                </a>

                {/* Link 6: Contact Maintainer */}
                <a
                  href="mailto:yaadapppk@gmail.com"
                  className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] hover:border-[#005039]/40 hover:bg-white transition-all space-y-1.5 group cursor-pointer block"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#005039] uppercase tracking-wider">Direct Support</span>
                    <ChevronRight className="w-4 h-4 text-[#005039] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <h4 className="text-sm font-bold text-[#1c2826]">Contact Maintainer</h4>
                  <p className="text-xs text-[#556960] leading-relaxed">
                    Have questions or feedback? Email the engineer directly at yaadapppk@gmail.com.
                  </p>
                </a>
              </div>
            </div>

            {/* 6. Early Testing & Automated Technical Verification */}
            <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[#e5e1d8] shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#005039]/10 text-[#005039] flex items-center justify-center shrink-0">
                  <Terminal className="w-6 h-6 text-[#005039]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#1c2826] tracking-tight">
                    Early Testing &amp; Technical Verification
                  </h3>
                  <p className="text-xs text-[#556960]">
                    Verified through automated regression test suites covering recognition, offline sync, and data isolation
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#556960] leading-relaxed">
                Prior to public release, YAAD undergoes automated regression testing across key functional layers to ensure complete offline reliability and zero data loss in supermarket aisles:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#005039] shrink-0" />
                    <span className="text-xs font-bold text-[#1c2826]">Bilingual Recognition Test Suite</span>
                  </div>
                  <p className="text-xs text-[#556960]">
                    Validated across 2,000+ localized Pakistani kitchen staples in English, Roman Urdu, and Nastaliq Urdu (tests/recognition.test.ts).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#005039] shrink-0" />
                    <span className="text-xs font-bold text-[#1c2826]">Pakistani Units Parser</span>
                  </div>
                  <p className="text-xs text-[#556960]">
                    Validated extraction and conversion of pao (250g), dharri (5kg), darjan (12), and chattak (tests/pakistani-units.test.ts).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#005039] shrink-0" />
                    <span className="text-xs font-bold text-[#1c2826]">Offline Mutation Queue</span>
                  </div>
                  <p className="text-xs text-[#556960]">
                    Validated uninterrupted local IndexedDB storage and offline list mutations without cellular signal (tests/offline-queue.test.ts).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#005039] shrink-0" />
                    <span className="text-xs font-bold text-[#1c2826]">Row-Level Data Security</span>
                  </div>
                  <p className="text-xs text-[#556960]">
                    Validated strict user data isolation preventing cross-account list leakage (tests/rls-logic.test.ts).
                  </p>
                </div>
              </div>
            </div>

            {/* 7. Early Feedback Status & Integrity Notice */}
            <div className="p-6 rounded-3xl bg-[#faf8f5] border border-[#e5e1d8] space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#005039] shrink-0" />
                <h4 className="text-xs font-bold text-[#005039] uppercase tracking-wider">
                  Early Feedback &amp; Review Policy
                </h4>
              </div>
              <p className="text-xs text-[#556960] leading-relaxed">
                YAAD values transparency above all. Verified household tester feedback and community reviews will be published as formal submissions are gathered. No customer counts, review quotes, or star ratings are fabricated. To share feedback or report a bug, email <a href="mailto:yaadapppk@gmail.com" className="text-[#005039] underline font-bold">yaadapppk@gmail.com</a>.
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
            <div className="space-y-3.5">
              <div className="relative">
                <Search className="w-4 h-4 text-[#788880] absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={faqSearchQuery}
                  onChange={(e) => setFaqSearchQuery(e.target.value)}
                  placeholder="Search questions (e.g. offline, sync, urdu)..."
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
                    Zero ad selling guarantee, database isolation, secure authentication, and account deletion.
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
                  YAAD Editorial &amp; Shopping Guides
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#1c2826] tracking-tight">
                  Practical Grocery &amp; Household Shopping Knowledge
                </h2>
                <p className="text-xs sm:text-sm text-[#556960] max-w-2xl">
                  Real, actionable advice on monthly rashan budgeting, local bazaar measurements, kitchen pantry audits, and stress-free shopping trips.
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#005039]/10 flex items-center justify-center text-[#005039] shrink-0">
                <Newspaper className="w-6 h-6" />
              </div>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dynamic Published CMS Articles */}
              {cmsArticles.map((art) => {
                const isExpanded = expandedBlogPostId === art.id || expandedBlogPostId === art.slug;
                return (
                  <article
                    key={art.id}
                    id={art.slug || art.id}
                    className={`p-6 sm:p-7 rounded-3xl bg-white border transition-all flex flex-col justify-between space-y-4 shadow-2xs ${
                      isExpanded
                        ? 'border-[#005039] ring-2 ring-[#005039]/10 md:col-span-2'
                        : 'border-[#e5e1d8] hover:border-[#005039]/30'
                    }`}
                  >
                    {/* Cover Image */}
                    {art.coverImageUrl && (
                      <div className="w-full h-44 sm:h-56 rounded-2xl overflow-hidden bg-neutral-100">
                        <img
                          src={art.coverImageUrl}
                          alt={art.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="px-2.5 py-1 rounded-full bg-[#005039]/10 text-[#005039] font-bold">
                          {art.category || 'Grocery Guide'}
                        </span>
                        <span className="text-[#788880] font-medium">
                          {art.readTimeMinutes || 3} min read
                        </span>
                      </div>

                      {art.headingSize === 'h1' ? (
                        <h2 className="text-lg sm:text-xl font-black text-[#1c2826] leading-snug">
                          {art.title}
                        </h2>
                      ) : art.headingSize === 'h3' ? (
                        <h4 className="text-sm sm:text-base font-bold text-[#1c2826] leading-snug">
                          {art.title}
                        </h4>
                      ) : (
                        <h3 className="text-base sm:text-lg font-bold text-[#1c2826] leading-snug">
                          {art.title}
                        </h3>
                      )}

                      {art.excerpt && (
                        <p className="text-xs sm:text-sm text-[#556960] leading-relaxed">
                          {art.excerpt}
                        </p>
                      )}

                      {isExpanded ? (
                        <div className="pt-4 border-t border-[#f2efe9] space-y-6 text-xs sm:text-sm text-[#1c2826] leading-relaxed">
                          {/* Formatted Body */}
                          <div className="space-y-3">
                            {art.body.split('\n\n').map((para: string, pIdx: number) => {
                              const trimmed = para.trim();
                              if (trimmed.startsWith('### ')) {
                                return (
                                  <h5 key={pIdx} className="text-sm font-bold text-[#1c2826] border-b border-[#f2efe9] pb-1 pt-2">
                                    {trimmed.replace('### ', '')}
                                  </h5>
                                );
                              }
                              if (trimmed.startsWith('## ')) {
                                return (
                                  <h4 key={pIdx} className="text-base font-bold text-[#1c2826] border-b border-[#f2efe9] pb-1.5 pt-3">
                                    {trimmed.replace('## ', '')}
                                  </h4>
                                );
                              }
                              if (trimmed.startsWith('# ')) {
                                return (
                                  <h3 key={pIdx} className="text-lg font-black text-[#1c2826] border-b border-[#f2efe9] pb-2 pt-4">
                                    {trimmed.replace('# ', '')}
                                  </h3>
                                );
                              }
                              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                                const items = trimmed.split('\n');
                                return (
                                  <ul key={pIdx} className="space-y-1.5 pl-2">
                                    {items.map((it: string, itIdx: number) => (
                                      <li key={itIdx} className="flex items-start gap-2 text-xs sm:text-sm text-[#556960]">
                                        <span className="text-[#005039] font-bold mt-0.5">•</span>
                                        <span>{it.replace(/^[-*]\s+/, '')}</span>
                                      </li>
                                    ))}
                                  </ul>
                                );
                              }
                              return (
                                <p key={pIdx} className="text-[#556960] leading-relaxed">
                                  {trimmed}
                                </p>
                              );
                            })}
                          </div>

                          {/* Author Credit */}
                          <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-neutral-700 font-medium">
                              <User className="w-4 h-4 text-[#005039]" />
                              <span>Author: <strong>{art.authorName || 'YAAD Editorial'}</strong></span>
                              {art.authorEmail && <span className="text-neutral-400">({art.authorEmail})</span>}
                            </div>
                            <span className="text-neutral-400">
                              {art.publishedAt ? new Date(art.publishedAt).toLocaleDateString() : 'Live'}
                            </span>
                          </div>

                          {/* Official Social Media Channels */}
                          {art.socialLinks && Object.values(art.socialLinks).some(Boolean) && (
                            <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] space-y-2.5">
                              <span className="text-xs font-bold text-[#005039] uppercase tracking-wider block">
                                Official YAAD Social Channels &amp; Community
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {art.socialLinks.facebook && (
                                  <a
                                    href={art.socialLinks.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all text-xs font-bold shadow-2xs"
                                  >
                                    <span>Facebook</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                                {art.socialLinks.instagram && (
                                  <a
                                    href={art.socialLinks.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E4405F]/10 text-[#E4405F] hover:bg-[#E4405F] hover:text-white transition-all text-xs font-bold shadow-2xs"
                                  >
                                    <span>Instagram</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                                {art.socialLinks.youtube && (
                                  <a
                                    href={art.socialLinks.youtube}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF0000]/10 text-[#FF0000] hover:bg-[#FF0000] hover:text-white transition-all text-xs font-bold shadow-2xs"
                                  >
                                    <span>YouTube</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                                {art.socialLinks.linkedin && (
                                  <a
                                    href={art.socialLinks.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-all text-xs font-bold shadow-2xs"
                                  >
                                    <span>LinkedIn</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                                {art.socialLinks.tiktok && (
                                  <a
                                    href={art.socialLinks.tiktok}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800/10 text-neutral-800 hover:bg-neutral-800 hover:text-white transition-all text-xs font-bold shadow-2xs"
                                  >
                                    <span>TikTok</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                                {art.socialLinks.twitter && (
                                  <a
                                    href={art.socialLinks.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/10 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-all text-xs font-bold shadow-2xs"
                                  >
                                    <span>X / Twitter</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Public Comments Section */}
                          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e5e1d8] space-y-4 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-[#005039]" />
                                <h4 className="text-sm font-bold text-[#1c2826]">
                                  Reader Advice &amp; Comments ({art.commentsCount ?? art.comments?.length ?? 0})
                                </h4>
                              </div>
                              <span className="text-[11px] text-[#788880]">Public discussion • No login required</span>
                            </div>

                            {/* Existing Comments */}
                            {art.comments && art.comments.length > 0 ? (
                              <div className="space-y-3 divide-y divide-[#f2efe9]">
                                {art.comments.map((cmt: any) => (
                                  <div key={cmt.id} className="pt-3 first:pt-0 space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="font-bold text-[#1c2826]">{cmt.name}</span>
                                      <span className="text-[#788880] text-[10.5px]">
                                        {new Date(cmt.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-xs text-[#556960] leading-relaxed bg-[#faf8f5] p-2.5 rounded-xl border border-[#f2efe9]">
                                      {cmt.content}
                                    </p>
                                    {cmt.reply && (
                                      <div className="ml-3 p-2.5 rounded-xl bg-emerald-50/70 border-l-2 border-[#005039] space-y-1">
                                        <span className="text-[10px] font-bold text-[#005039] block">
                                          Official Response from {cmt.repliedBy || 'YAAD Support'}
                                        </span>
                                        <p className="text-xs text-[#1c2826]">{cmt.reply}</p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-[#788880] italic">
                                No comments posted yet. Be the first to share your shopping tip or question!
                              </p>
                            )}

                            {/* Comment Input Form */}
                            <div className="pt-3 border-t border-[#f2efe9] space-y-2.5">
                              <span className="text-xs font-bold text-[#1c2826] block">
                                Leave a Tip or Comment
                              </span>
                              {commentSuccessMsg[art.id] && (
                                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                                  {commentSuccessMsg[art.id]}
                                </div>
                              )}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={commentInputs[art.id]?.name || ''}
                                  onChange={(e) =>
                                    setCommentInputs((prev) => ({
                                      ...prev,
                                      [art.id]: { ...(prev[art.id] || { email: '', content: '' }), name: e.target.value },
                                    }))
                                  }
                                  placeholder="Your Name (e.g. Ayesha, Bilal)"
                                  className="px-3 py-1.5 rounded-xl border border-[#e5e1d8] text-xs bg-white text-[#1c2826] focus:outline-none focus:border-[#005039]"
                                />
                                <input
                                  type="email"
                                  value={commentInputs[art.id]?.email || ''}
                                  onChange={(e) =>
                                    setCommentInputs((prev) => ({
                                      ...prev,
                                      [art.id]: { ...(prev[art.id] || { name: '', content: '' }), email: e.target.value },
                                    }))
                                  }
                                  placeholder="Email (optional, kept private)"
                                  className="px-3 py-1.5 rounded-xl border border-[#e5e1d8] text-xs bg-white text-[#1c2826] focus:outline-none focus:border-[#005039]"
                                />
                              </div>
                              <textarea
                                rows={2}
                                value={commentInputs[art.id]?.content || ''}
                                onChange={(e) =>
                                  setCommentInputs((prev) => ({
                                    ...prev,
                                    [art.id]: { ...(prev[art.id] || { name: '', email: '' }), content: e.target.value },
                                  }))
                                }
                                placeholder="Share your shopping experience, recipe tip, or question here..."
                                className="w-full px-3 py-2 rounded-xl border border-[#e5e1d8] text-xs bg-white text-[#1c2826] focus:outline-none focus:border-[#005039]"
                              />
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  disabled={isSubmittingComment[art.id] || !commentInputs[art.id]?.content?.trim()}
                                  onClick={() => handlePostComment(art.id)}
                                  className="px-4 py-1.5 rounded-xl bg-[#005039] text-white font-bold text-xs hover:bg-[#003d2b] disabled:opacity-40 cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>{isSubmittingComment[art.id] ? 'Posting...' : 'Post Comment'}</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-[#f2efe9] flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setExpandedBlogPostId(null)}
                              className="text-xs font-bold text-[#005039] hover:underline cursor-pointer"
                            >
                              ↑ Collapse Guide
                            </button>
                            <span className="text-xs text-[#788880] font-medium">Published by {art.authorName || 'YAAD Editorial'}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-[#f2efe9] flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setExpandedBlogPostId(art.slug || art.id)}
                            className="text-xs font-bold text-[#005039] hover:text-[#003d2b] flex items-center gap-1 cursor-pointer"
                          >
                            <span>Read Complete Guide</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs text-[#788880]">
                            {art.publishedAt ? new Date(art.publishedAt).toLocaleDateString() : 'Live'}
                          </span>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}

              {BLOG_POSTS.map((post) => {
                const title = getLocalizedText(post.title);
                const summary = getLocalizedText(post.summary);
                const category = getLocalizedText(post.category);
                const isExpanded = expandedBlogPostId === post.id;
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
                    className={`p-6 sm:p-7 rounded-3xl bg-white border transition-all flex flex-col justify-between space-y-4 shadow-2xs ${
                      isExpanded ? 'border-[#005039] ring-2 ring-[#005039]/10 md:col-span-2' : 'border-[#e5e1d8] hover:border-[#005039]/30'
                    }`}
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

                      <p className="text-xs sm:text-sm text-[#556960] leading-relaxed">
                        {summary}
                      </p>

                      {isExpanded ? (
                        <div className="pt-4 border-t border-[#f2efe9] space-y-6 text-xs sm:text-sm text-[#1c2826] leading-relaxed">
                          {/* Short Direct Answer Near Beginning */}
                          {post.directAnswer && (
                            <div className="p-4 sm:p-5 rounded-2xl bg-[#005039]/5 border border-[#005039]/20 space-y-1.5">
                              <span className="text-xs font-bold uppercase tracking-wider text-[#005039] block">
                                Quick Direct Answer
                              </span>
                              <p className="text-xs sm:text-sm text-[#1c2826] font-medium leading-relaxed">
                                {getLocalizedText(post.directAnswer)}
                              </p>
                            </div>
                          )}

                          {/* Logical H2/H3 Structured Sections */}
                          {post.sections && post.sections.length > 0 ? (
                            <div className="space-y-6">
                              {post.sections.map((sec, sIdx) => (
                                <section key={sIdx} className="space-y-3">
                                  <h4 className="text-sm sm:text-base font-bold text-[#1c2826] tracking-tight border-b border-[#f2efe9] pb-1.5">
                                    {getLocalizedText(sec.heading)}
                                  </h4>
                                  <div className="space-y-2.5">
                                    {(language === 'ur'
                                      ? sec.paragraphs.ur
                                      : language === 'roman-urdu'
                                      ? sec.paragraphs.romanUrdu
                                      : sec.paragraphs.en
                                    ).map((p, pIdx) => (
                                      <p key={pIdx} className="text-[#556960] leading-relaxed">
                                        {p}
                                      </p>
                                    ))}
                                  </div>

                                  {sec.bullets && (
                                    <ul className="space-y-2 pt-1 pl-1">
                                      {(language === 'ur'
                                        ? sec.bullets.ur
                                        : language === 'roman-urdu'
                                        ? sec.bullets.romanUrdu
                                        : sec.bullets.en
                                      ).map((b, bIdx) => (
                                        <li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#556960]">
                                          <span className="text-[#005039] font-bold mt-0.5">•</span>
                                          <span className="leading-relaxed">{b}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </section>
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {paragraphs.map((p, idx) => (
                                <p key={idx} className="text-[#556960]">{p}</p>
                              ))}
                            </div>
                          )}

                          {/* Internal Links to Relevant YAAD Pages */}
                          {post.internalLinks && post.internalLinks.length > 0 && (
                            <div className="p-4 sm:p-5 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] space-y-2.5">
                              <span className="text-xs font-bold text-[#005039] uppercase tracking-wider block">
                                Related YAAD Tools &amp; Guides
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {post.internalLinks.map((link, lIdx) => (
                                  <a
                                    key={lIdx}
                                    href={link.path}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (link.path.startsWith('/blog#')) {
                                        const targetId = link.path.replace('/blog#', '');
                                        setExpandedBlogPostId(targetId);
                                        const el = document.getElementById(targetId);
                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                      } else if (link.path === '/features') {
                                        handleTabClick('features');
                                      } else if (link.path === '/how-it-works') {
                                        handleTabClick('how_it_works');
                                      } else if (link.path === '/faq' || link.path === '/help') {
                                        handleTabClick('help');
                                      } else if (link.path === '/about') {
                                        handleTabClick('about');
                                      } else if (link.path === '/rashan-list') {
                                        navigate(rashanListPath);
                                      } else {
                                        navigate(link.path);
                                      }
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e5e1d8] text-xs font-bold text-[#005039] hover:bg-[#005039] hover:text-white transition-all cursor-pointer shadow-2xs"
                                  >
                                    <span>{link.label}</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Credible Sources & Authoritative Research Foundations */}
                          {post.citations && post.citations.length > 0 && (
                            <div className="p-4 sm:p-5 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] space-y-2.5">
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-[#005039]" />
                                <span className="text-xs font-bold text-[#005039] uppercase tracking-wider block">
                                  Credible Sources &amp; Research Foundations
                                </span>
                              </div>
                              <ul className="space-y-2.5 text-xs text-[#556960] divide-y divide-[#e5e1d8]/60">
                                {post.citations.map((cite, cIdx) => (
                                  <li key={cIdx} className={`${cIdx > 0 ? 'pt-2' : ''} space-y-0.5`}>
                                    <p className="font-semibold text-[#1c2826]">{cite.claim}</p>
                                    <p className="text-[#788880]">
                                      Source:{' '}
                                      {cite.sourceUrl ? (
                                        <a
                                          href={cite.sourceUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[#005039] underline font-medium hover:text-[#003d2b]"
                                        >
                                          {cite.sourceTitle}
                                        </a>
                                      ) : (
                                        <span className="font-medium text-[#1c2826]">{cite.sourceTitle}</span>
                                      )}{' '}
                                      — {cite.sourcePublisher} {cite.citationYear ? `(${cite.citationYear})` : ''}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Short Conclusion */}
                          {post.conclusion && (
                            <div className="p-4 sm:p-5 rounded-2xl bg-white border-l-4 border-l-[#005039] border border-[#e5e1d8] shadow-2xs space-y-1">
                              <span className="text-xs font-bold text-[#005039] uppercase tracking-wider block">
                                Key Takeaway
                              </span>
                              <p className="text-xs sm:text-sm text-[#556960] leading-relaxed">
                                {getLocalizedText(post.conclusion)}
                              </p>
                            </div>
                          )}

                          <div className="pt-3 border-t border-[#f2efe9] flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setExpandedBlogPostId(null)}
                              className="text-xs font-bold text-[#005039] hover:underline cursor-pointer"
                            >
                              ↑ Collapse Guide
                            </button>
                            <span className="text-xs text-[#788880] font-medium">Published {post.publishDate} • YAAD Editorial</span>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-[#f2efe9] flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setExpandedBlogPostId(post.id)}
                            className="text-xs font-bold text-[#005039] hover:text-[#003d2b] flex items-center gap-1 cursor-pointer"
                          >
                            <span>Read Complete Guide</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs text-[#788880]">{post.publishDate}</span>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Rashan Guide Cross-Link */}
            <div className="p-6 rounded-3xl bg-[#faf8f5] border border-[#e5e1d8] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-start">
                <h4 className="text-sm sm:text-base font-bold text-[#1c2826]">
                  Looking for the definitive household pantry checklist?
                </h4>
                <p className="text-xs text-[#556960]">
                  Explore our comprehensive monthly rashan guide with traditional Pakistani measurements.
                </p>
              </div>
              <a
                href={rashanListPath}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(rashanListPath);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#005039] hover:bg-[#003d2b] shadow-xs shrink-0 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Open Rashan Checklist</span>
              </a>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* VIEW G: YAAD FEATURES */}
        {/* ================================================================ */}
        {currentPage === 'features' && (
          <div className="space-y-10">
            {/* 1. Header intro banner */}
            <div className="p-7 sm:p-9 rounded-3xl bg-white border border-[#e5e1d8] shadow-xs space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#005039]/10 text-[#005039] text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{LEGAL_METADATA.features.badge}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1c2826] tracking-tight leading-snug">
                {getLocalizedText(LEGAL_METADATA.features.title)}
              </h2>
              <p className="text-xs sm:text-sm text-[#556960] max-w-2xl leading-relaxed">
                {getLocalizedText(LEGAL_METADATA.features.subtitle)}
              </p>

              {/* What / Problem / Solution / Audience Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#005039]">What YAAD Does</span>
                  <p className="text-xs sm:text-sm text-[#556960] leading-relaxed">
                    Provides an offline-ready shopping list and reminder workspace that keeps all your household grocery items organized and accessible.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#005039]">The Core Problem</span>
                  <p className="text-xs sm:text-sm text-[#556960] leading-relaxed">
                    Shoppers frequently forget items they intended to buy, wander back and forth across store aisles, and struggle with signal dead zones.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#005039]">The Solution</span>
                  <p className="text-xs sm:text-sm text-[#556960] leading-relaxed">
                    Bilingual natural language entry (English, Roman Urdu, Urdu), automatic aisle sorting, and instant 1-tap item check-off that works 100% offline.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#005039]">Target Audience</span>
                  <p className="text-xs sm:text-sm text-[#556960] leading-relaxed">
                    Everyday households, busy parents, home cooks, and anyone who shops for groceries and wants a calm, reliable checklist.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Core Features Deep Dive */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-black text-[#1c2826] tracking-tight">
                  Verified Core Features
                </h3>
                <span className="text-xs font-semibold text-[#005039]">Built for Real Market Trips</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {FEATURES_DATA.map((feat) => {
                  const title = getLocalizedText(feat.title);
                  const desc = getLocalizedText(feat.description);
                  const badge = getLocalizedText(feat.badge);

                  return (
                    <div
                      key={feat.id}
                      id={feat.id}
                      className="p-6 rounded-3xl bg-white border border-[#e5e1d8] hover:border-[#005039]/30 transition-all flex flex-col justify-between space-y-4 shadow-2xs"
                    >
                      <div className="space-y-3">
                        <span className="inline-flex px-2.5 py-1 rounded-full bg-[#005039]/10 text-[#005039] text-xs font-bold">
                          {badge}
                        </span>
                        <h4 className="text-base sm:text-lg font-bold text-[#1c2826] leading-snug">
                          {title}
                        </h4>
                        <p className="text-xs sm:text-sm text-[#556960] leading-relaxed">
                          {desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Comparison with Generic Notes Apps */}
            <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[#e5e1d8] shadow-xs space-y-5">
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-black text-[#1c2826] tracking-tight">
                  How YAAD Compares with Generic Notepad Apps
                </h3>
                <p className="text-xs sm:text-sm text-[#556960]">
                  Why a purpose-built grocery assistant creates a calmer store trip than generic phone notes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] space-y-1.5">
                  <div className="text-xs font-bold text-[#005039] uppercase">100% Offline Database</div>
                  <p className="text-xs text-[#556960] leading-relaxed">
                    Generic cloud notes spin endlessly in basement markets. YAAD stores your list directly in device IndexedDB, never locking you out.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] space-y-1.5">
                  <div className="text-xs font-bold text-[#005039] uppercase">Aisle Department Sorting</div>
                  <p className="text-xs text-[#556960] leading-relaxed">
                    Notes apps force you to read randomly scrambled items. YAAD automatically groups items into Produce, Dairy, and Pantry sections.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] space-y-1.5">
                  <div className="text-xs font-bold text-[#005039] uppercase">Urdu &amp; Local Weights</div>
                  <p className="text-xs text-[#556960] leading-relaxed">
                    Understands authentic grocery terms (&ldquo;doodh, aloo, daal&rdquo;) and local Pakistani units (pao, darjan, kg) natively.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Action Banner */}
            <div className="p-6 rounded-3xl bg-[#005039] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1 text-center sm:text-start">
                <h4 className="text-base sm:text-lg font-bold">Ready to make grocery shopping simpler?</h4>
                <p className="text-xs sm:text-sm text-emerald-100">Create your first organized shopping list in seconds. Works offline.</p>
              </div>
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-2.5 rounded-full bg-white text-[#005039] font-bold text-xs sm:text-sm shadow-xs hover:bg-[#faf8f5] transition-all cursor-pointer shrink-0"
              >
                Make First List Now
              </button>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* VIEW H: SEE HOW YAAD WORKS */}
        {/* ================================================================ */}
        {currentPage === 'how_it_works' && (
          <div className="space-y-10">
            {/* 1. Header intro banner */}
            <div className="p-7 sm:p-9 rounded-3xl bg-white border border-[#e5e1d8] shadow-xs space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#005039]/10 text-[#005039] text-xs font-bold tracking-wide">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{LEGAL_METADATA.how_it_works.badge}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1c2826] tracking-tight leading-snug">
                {getLocalizedText(LEGAL_METADATA.how_it_works.title)}
              </h2>
              <p className="text-xs sm:text-sm text-[#556960] max-w-2xl leading-relaxed">
                {getLocalizedText(LEGAL_METADATA.how_it_works.subtitle)}
              </p>

              {/* 3-Phase Workflow Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] space-y-1">
                  <span className="text-xs font-bold text-[#005039]">Phase 1: At Home</span>
                  <p className="text-xs text-[#556960]">Create a list, quick-capture items in English or Urdu, and tap suggested staples.</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] space-y-1">
                  <span className="text-xs font-bold text-[#005039]">Phase 2: In the Store</span>
                  <p className="text-xs text-[#556960]">Walk store aisles with an offline checklist. Tap items off as they enter your basket.</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] space-y-1">
                  <span className="text-xs font-bold text-[#005039]">Phase 3: After Shopping</span>
                  <p className="text-xs text-[#556960]">Complete the trip to archive items in your history and track restock cadence.</p>
                </div>
              </div>
            </div>

            {/* 2. Step-by-Step Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-black text-[#1c2826] tracking-tight">
                  Step-by-Step Walkthrough
                </h3>
                <span className="text-xs font-semibold text-[#005039]">Simple &amp; Repeatable</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {HOW_IT_WORKS_DATA.map((step) => {
                  const title = getLocalizedText(step.title);
                  const desc = getLocalizedText(step.description);
                  const badge = getLocalizedText(step.badge);
                  const bullets =
                    language === 'ur'
                      ? step.details.ur
                      : language === 'roman-urdu'
                      ? step.details.romanUrdu
                      : step.details.en;

                  return (
                    <div
                      key={step.step}
                      className="p-6 sm:p-7 rounded-3xl bg-white border border-[#e5e1d8] hover:border-[#005039]/30 transition-all flex flex-col justify-between space-y-4 shadow-2xs"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 rounded-full bg-[#005039]/10 text-[#005039] text-xs font-bold">
                            {badge}
                          </span>
                          <span className="w-7 h-7 rounded-full bg-[#005039] text-white flex items-center justify-center text-xs font-black">
                            {step.step}
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-[#1c2826] leading-snug">
                          {title}
                        </h4>
                        <p className="text-xs sm:text-sm text-[#556960] leading-relaxed">
                          {desc}
                        </p>
                        <ul className="pt-2 border-t border-[#f2efe9] space-y-1.5 text-xs text-[#556960]">
                          {bullets.map((b, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-2">
                              <span className="text-[#005039] font-bold">✓</span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Inside YAAD: Genuine Visual Walkthrough */}
            <div className="p-7 sm:p-9 rounded-3xl bg-white border border-[#e5e1d8] shadow-xs space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#005039]">
                  Inside YAAD
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#1c2826] tracking-tight">
                  Real Visuals of the In-Store Shopping Experience
                </h3>
                <p className="text-xs sm:text-sm text-[#556960] max-w-2xl leading-relaxed">
                  Engineered with large touch targets, high contrast text for bright supermarket lighting, and instantaneous 1-tap item completion.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Visual 1: Aisle Navigation */}
                <div className="p-5 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] flex flex-col items-center text-center space-y-3">
                  <div className="w-full h-44 rounded-xl bg-white border border-[#e5e1d8]/80 overflow-hidden flex items-center justify-center p-3">
                    <img
                      src={APP_IMAGES.onboarding1}
                      alt="YAAD onboarding illustration showing shopper checking digital items in store aisle"
                      className="max-h-full max-w-full object-contain rounded-lg"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-[#1c2826]">1. In-Store Navigation</h4>
                    <p className="text-xs text-[#556960]">
                      Items remain accessible 100% offline in basement grocery dead zones.
                    </p>
                  </div>
                </div>

                {/* Visual 2: 1-Tap Checkoff */}
                <div className="p-5 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] flex flex-col items-center text-center space-y-3">
                  <div className="w-full h-44 rounded-xl bg-white border border-[#e5e1d8]/80 overflow-hidden flex items-center justify-center p-3">
                    <img
                      src={APP_IMAGES.onboarding2}
                      alt="YAAD shopping list interface showing interactive 1-tap item completion and real-time counter"
                      className="max-h-full max-w-full object-contain rounded-lg"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-[#1c2826]">2. Fast 1-Tap Checkoff</h4>
                    <p className="text-xs text-[#556960]">
                      Tap items into the basket; completed items fade to prevent repeat buying.
                    </p>
                  </div>
                </div>

                {/* Visual 3: Trip Completion */}
                <div className="p-5 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] flex flex-col items-center text-center space-y-3">
                  <div className="w-full h-44 rounded-xl bg-white border border-[#e5e1d8]/80 overflow-hidden flex items-center justify-center p-3">
                    <img
                      src={APP_IMAGES.onboarding3}
                      alt="YAAD shopper with fresh grocery bag after completing an organized shopping trip"
                      className="max-h-full max-w-full object-contain rounded-lg"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-[#1c2826]">3. Trip Archive &amp; Restock</h4>
                    <p className="text-xs text-[#556960]">
                      Saves shopping records to calculate restock cadence for household staples.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Example Shopping List: Real Categorized Pakistani Household Checklist */}
            <div className="p-7 sm:p-9 rounded-3xl bg-white border border-[#e5e1d8] shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#005039]">
                    Example Shopping List
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#1c2826] tracking-tight">
                    Authentic Household Grocery Checklist
                  </h3>
                  <p className="text-xs sm:text-sm text-[#556960]">
                    Interactive demonstration of auto-categorization and native Pakistani units (kg, pao, dharri, darjan). Tap items to try checking off:
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#005039]/10 text-[#005039] text-xs font-bold shrink-0 self-start sm:self-auto">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{exampleListItems.filter((i) => i.completed).length} of {exampleListItems.length} Purchased</span>
                </div>
              </div>

              {/* Categorized List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Produce', 'Dairy & Breakfast', 'Pantry & Grains', 'Spices & Seasoning', 'Household'].map((catName) => {
                  const catItems = exampleListItems.filter((i) => i.category === catName);
                  if (catItems.length === 0) return null;

                  return (
                    <div key={catName} className="p-4 sm:p-5 rounded-2xl bg-[#faf8f5] border border-[#e5e1d8] space-y-3">
                      <div className="flex items-center justify-between border-b border-[#e5e1d8]/70 pb-2">
                        <span className="text-xs font-bold text-[#1c2826] uppercase tracking-wide">
                          {catName}
                        </span>
                        <span className="text-[11px] font-semibold text-[#788880]">
                          {catItems.filter((i) => i.completed).length}/{catItems.length} Done
                        </span>
                      </div>

                      <div className="space-y-2">
                        {catItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => toggleExampleItem(item.id)}
                            className={`p-2.5 rounded-xl bg-white border border-[#e5e1d8]/80 flex items-center justify-between gap-2.5 transition-all select-none cursor-pointer ${
                              item.completed ? 'opacity-60 bg-[#f9f7f2]' : 'hover:border-[#005039]/40 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <BlueTickCheckCircle
                                isChecked={item.completed}
                                size={20}
                                className="shrink-0"
                              />
                              <span
                                className={`text-xs sm:text-sm font-semibold truncate ${
                                  item.completed ? 'line-through text-[#788880]' : 'text-[#1c2826]'
                                }`}
                              >
                                {item.name}
                              </span>
                            </div>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#f3efe6] text-[#3d5046] shrink-0">
                              {item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Action Banner */}
            <div className="p-6 rounded-3xl bg-[#faf8f5] border border-[#e5e1d8] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-start">
                <h4 className="text-sm sm:text-base font-bold text-[#1c2826]">
                  Have questions about offline mode or syncing?
                </h4>
                <p className="text-xs text-[#556960]">
                  Read our interactive Frequently Asked Questions for direct, transparent answers.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleTabClick('help')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#005039] bg-white border border-[#e5e1d8] hover:bg-[#f0ebe1] shadow-2xs transition-all cursor-pointer shrink-0"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Browse FAQ Hub</span>
              </button>
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
