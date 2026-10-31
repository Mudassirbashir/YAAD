import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Copy,
  Check,
  Tag,
  ChevronDown,
  ShoppingBag,
  ArrowRight,
  ExternalLink,
  BookOpen,
  CheckSquare,
  Square,
  ListChecks,
} from 'lucide-react';
import { useAppRouter } from '../../router/RouterContext';
import { ArticleBodyRenderer, slugifyHeading } from './ArticleBodyRenderer';
import { FollowYaadBlock } from './FollowYaadBlock';

export interface CmsListItem {
  name: string;
  qty?: string;
  unit?: string;
  group?: string;
}

interface CmsArticleDetail {
  id: string;
  slug: string;
  title: string;
  titleUr?: string;
  titleRomanUrdu?: string;
  excerpt: string;
  body: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  authorName: string;
  authorEmail?: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  publishedAt?: number;
  scheduledFor?: number;
  readTimeMinutes: number;
  viewsCount: number;
  seoTitle?: string;
  seoDescription?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  focusKeyword?: string;
  searchIntent?: 'informational' | 'list' | 'comparison' | 'template';
  templateKind?: 'list_template' | null;
  listItems?: CmsListItem[];
  cluster?: string;
  quickAnswer?: string;
  keyTakeaways?: string[];
  faqs?: { q: string; a: string }[];
  hashtags?: string[];
  relatedSlugs?: string[];
  createdAt: number;
  updatedAt: number;
}

interface BlogArticlePageProps {
  slug: string;
  initialArticle?: CmsArticleDetail | null;
  onNavigatePage?: (path: string) => void;
  onNavigate?: (path: string) => void;
  onBack?: () => void;
}

export const BlogArticlePage: React.FC<BlogArticlePageProps> = ({
  slug,
  initialArticle,
  onNavigatePage,
  onNavigate,
  onBack,
}) => {
  const { navigate } = useAppRouter();
  const [article, setArticle] = useState<CmsArticleDetail | null>(initialArticle || null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialArticle);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedList, setCopiedList] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [openFaqIndices, setOpenFaqIndices] = useState<Set<number>>(new Set([0]));
  const [relatedArticles, setRelatedArticles] = useState<Array<{ title: string; slug: string; excerpt?: string; category?: string }>>([]);

  const handleNav = (targetPath: string) => {
    if (onNavigatePage) {
      onNavigatePage(targetPath);
    } else if (onNavigate) {
      onNavigate(targetPath);
    } else {
      navigate(targetPath);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      handleNav('/blog');
    }
  };

  useEffect(() => {
    if (initialArticle && initialArticle.slug === slug) {
      if (initialArticle.status && initialArticle.status !== 'published') {
        setError('Article not found');
        setIsLoading(false);
        return;
      }
      setArticle(initialArticle);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetch(`/api/blog/articles/${slug}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Article not found');
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted && data.article) {
          if (data.article.status && data.article.status !== 'published') {
            setError('Article not found');
            return;
          }
          setArticle(data.article);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load article');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug, initialArticle]);

  // Fetch sibling / related articles for recommendation cards
  useEffect(() => {
    fetch('/api/blog/articles')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.articles && Array.isArray(data.articles)) {
          const others = data.articles.filter((a: any) => a.slug !== slug && a.status === 'published');
          setRelatedArticles(others.slice(0, 6));
        }
      })
      .catch(() => {});
  }, [slug]);

  // Sync client-side title and ItemList JSON-LD
  useEffect(() => {
    if (article) {
      document.title = `${article.seoTitle || article.title} • YAAD`;

      if (article.templateKind === 'list_template' && article.listItems && article.listItems.length > 0) {
        let script = document.getElementById('template-itemlist-jsonld') as HTMLScriptElement | null;
        if (!script) {
          script = document.createElement('script');
          script.id = 'template-itemlist-jsonld';
          script.type = 'application/ld+json';
          document.head.appendChild(script);
        }
        script.textContent = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `${article.title} Checklist`,
          description: article.excerpt || article.title,
          numberOfItems: article.listItems.length,
          itemListElement: article.listItems.map((item, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: `${item.name}${item.qty ? ` — ${item.qty}${item.unit ? ` ${item.unit}` : ''}` : ''}`,
          })),
        });
      }
    }
  }, [article]);

  const handleCopyList = () => {
    if (!article?.listItems || article.listItems.length === 0) return;
    const lines = article.listItems.map((item) => {
      const parts = [item.name];
      if (item.qty) {
        parts.push(`— ${item.qty}${item.unit ? ` ${item.unit}` : ''}`);
      }
      return parts.join(' ');
    });
    try {
      navigator.clipboard.writeText(lines.join('\n'));
      setCopiedList(true);
      setToastMessage('List copied to clipboard!');
      setTimeout(() => {
        setCopiedList(false);
        setToastMessage(null);
      }, 2500);
    } catch {}
  };

  const handleOpenInYaad = () => {
    handleNav('/create');
  };

  const toggleItemCheck = (idx) => {
    setCheckedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const groupedItems = useMemo(() => {
    if (!article?.listItems) return [];
    const groups = [];
    const groupMap = new Map();

    article.listItems.forEach((item, idx) => {
      const groupName = item.group?.trim() || 'Checklist Items';
      if (!groupMap.has(groupName)) {
        groupMap.set(groupName, []);
      }
      groupMap.get(groupName).push({ item, globalIdx: idx });
    });

    groupMap.forEach((items, name) => {
      groups.push({ name, items });
    });
    return groups;
  }, [article?.listItems]);

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {}
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDF6E3] py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-4 bg-[#e7e1ce] rounded-full w-48 mb-8" />
          <div className="h-10 bg-[#e7e1ce] rounded-2xl w-3/4" />
          <div className="h-4 bg-[#e7e1ce] rounded-full w-64" />
          <div className="h-72 bg-[#e7e1ce] rounded-3xl w-full" />
          <div className="h-28 bg-[#e7e1ce] rounded-2xl w-full" />
          <div className="space-y-3">
            <div className="h-4 bg-[#e7e1ce] rounded-full w-full" />
            <div className="h-4 bg-[#e7e1ce] rounded-full w-5/6" />
            <div className="h-4 bg-[#e7e1ce] rounded-full w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#FDF6E3] py-20 px-4 text-center">
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-white border border-[#e5e1d8] shadow-sm space-y-4">
          <BookOpen className="w-12 h-12 text-[#003527] mx-auto opacity-70" />
          <h1 className="text-xl font-bold text-[#1c2826]">Article Not Found</h1>
          <p className="text-sm text-[#4a5c53]">
            The article you are looking for may have been moved or updated.
          </p>
          <button
            type="button"
            onClick={() => handleNav('/blog')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#003527] text-white hover:bg-[#0a4d38] font-bold text-sm cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Articles</span>
          </button>
        </div>
      </div>
    );
  }

  // Extract H2 headings for Table of Contents
  const h2Matches = (article.body || '')
    .split('\n')
    .filter((l) => /^##\s+/i.test(l.trim()) && !/^##\s+CTA/i.test(l.trim()))
    .map((l) => l.replace(/^##\s+/, '').trim());

  const publishedDateStr = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date(article.createdAt).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  const updatedDateStr = article.updatedAt
    ? new Date(article.updatedAt).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : publishedDateStr;

  return (
    <article className="min-h-screen bg-[#FDF6E3] text-[#1c2826] font-sans antialiased pb-20">
      {/* Top Breadcrumb Nav Bar */}
      <header className="border-b border-[#e5dfce] bg-[#fffdf6]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 text-xs sm:text-sm">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[#51614f] overflow-x-auto whitespace-nowrap">
            <button
              type="button"
              onClick={() => handleNav('/')}
              className="hover:text-[#003527] font-semibold transition-colors cursor-pointer"
            >
              Home
            </button>
            <span className="text-[#a5b2a3]">›</span>
            <button
              type="button"
              onClick={() => handleNav('/blog')}
              className="hover:text-[#003527] font-semibold transition-colors cursor-pointer"
            >
              Blog
            </button>
            <span className="text-[#a5b2a3]">›</span>
            <span className="text-[#003527] font-bold truncate max-w-[200px] sm:max-w-[280px]">
              {article.cluster || article.category || 'Article'}
            </span>
          </nav>
          <button
            type="button"
            onClick={handleCopyLink}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#ddd7c3] hover:border-[#003527] text-[#003527] text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied' : 'Share'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        {/* Category Label */}
        <div className="mb-3 flex items-center gap-2">
          {article.templateKind === 'list_template' ? (
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 border border-amber-300 text-amber-900 text-xs font-extrabold uppercase tracking-wider">
              List Template
            </span>
          ) : (
            <span className="inline-block px-3 py-1 rounded-full bg-[#003527]/10 text-[#003527] text-xs font-extrabold uppercase tracking-wider">
              {article.cluster || article.category || 'Grocery Guide'}
            </span>
          )}
          {article.templateKind === 'list_template' && (article.cluster || article.category) && (
            <span className="inline-block px-2.5 py-1 rounded-full bg-[#003527]/5 text-[#51614f] text-[11px] font-bold">
              {article.cluster || article.category}
            </span>
          )}
        </div>

        {/* H1 Title: Benefit-led, contains focus keyword */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#003527] tracking-tight leading-tight mb-5">
          {article.title}
        </h1>

        {/* Byline Row */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pb-6 border-b border-[#e5dfce] text-xs sm:text-sm text-[#51614f]">
          <div className="flex items-center gap-2 font-bold text-[#1c2826]">
            <div className="w-7 h-7 rounded-full bg-[#003527] text-[#FCBC1F] flex items-center justify-center font-bold text-xs">
              {article.authorName ? article.authorName.charAt(0).toUpperCase() : 'M'}
            </div>
            <span>{article.authorName || 'Mudassir Bashir'}</span>
          </div>
          <span className="text-[#a5b2a3] hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#003527]" />
            <span>Published: <strong>{publishedDateStr}</strong></span>
          </div>
          {updatedDateStr !== publishedDateStr && (
            <>
              <span className="text-[#a5b2a3] hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5 text-[#71806f]">
                <span>Updated: {updatedDateStr}</span>
              </div>
            </>
          )}
          <span className="text-[#a5b2a3] hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#003527]" />
            <span>{article.readTimeMinutes || 3} min read</span>
          </div>
        </div>

        {/* Hero / Cover Image */}
        <figure className="my-8">
          {article.coverImageUrl ? (
            <div className="w-full relative">
              <img
                src={article.coverImageUrl}
                alt={article.coverImageAlt || article.title}
                className="w-full h-auto max-h-[460px] object-cover rounded-3xl shadow-md border border-[#e5dfce]"
                loading="eager"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                  const fb = (e.currentTarget.parentElement?.querySelector('.branded-hero-fallback') as HTMLElement);
                  if (fb) fb.style.display = 'flex';
                }}
              />
              <div className="branded-hero-fallback hidden w-full h-48 sm:h-64 rounded-3xl bg-gradient-to-br from-[#003527] to-[#0a4d38] text-white flex-col items-center justify-center p-6 text-center border border-[#0a4d38] shadow-md">
                <ShoppingBag className="w-12 h-12 text-[#FCBC1F] mb-3 opacity-90" />
                <p className="text-xl sm:text-2xl font-black text-white max-w-lg mb-2">
                  {article.title}
                </p>
                <p className="text-xs uppercase font-extrabold tracking-widest text-[#FCBC1F]">
                  YAAD Official Grocery &amp; Rashan Guide
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full h-48 sm:h-64 rounded-3xl bg-gradient-to-br from-[#003527] to-[#0a4d38] text-white flex flex-col items-center justify-center p-6 text-center border border-[#0a4d38] shadow-md">
              <ShoppingBag className="w-12 h-12 text-[#FCBC1F] mb-3 opacity-90" />
              <p className="text-xl sm:text-2xl font-black text-white max-w-lg mb-2">
                {article.title}
              </p>
              <p className="text-xs uppercase font-extrabold tracking-widest text-[#FCBC1F]">
                YAAD Official Grocery & Rashan Guide
              </p>
            </div>
          )}
          {article.coverImageAlt && (
            <figcaption className="mt-2.5 text-center text-xs text-[#71806f] italic">
              {article.coverImageAlt}
            </figcaption>
          )}
        </figure>

        {/* Quick Answer Box */}
        {article.quickAnswer && (
          <aside className="my-8 p-6 sm:p-7 rounded-2xl bg-[#fdf0cd] border-2 border-[#FCBC1F] shadow-xs">
            <div className="flex items-center gap-2 mb-2 text-[#6d5200] font-black text-xs uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FCBC1F]" />
              <span>Quick Answer</span>
            </div>
            <p className="text-base sm:text-lg text-[#1c2826] font-medium leading-relaxed">
              {article.quickAnswer}
            </p>
          </aside>
        )}

        {/* Key Takeaways Bullets */}
        {article.keyTakeaways && article.keyTakeaways.length > 0 && (
          <div className="my-7 p-6 rounded-2xl bg-white border border-[#ddd7c3] shadow-xs">
            <h3 className="text-sm uppercase font-extrabold tracking-wider text-[#003527] mb-3">
              Key Takeaways
            </h3>
            <ul className="space-y-2.5">
              {article.keyTakeaways.map((point, pIdx) => (
                <li key={pIdx} className="flex items-start gap-3 text-sm sm:text-base text-[#374740]">
                  <span className="w-5 h-5 rounded-full bg-[#003527]/10 text-[#003527] flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Interactive Checklist Card */}
        {article.templateKind === 'list_template' && article.listItems && article.listItems.length > 0 && (
          <section className="my-10 p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#003527]/20 shadow-md">
            {/* Top Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e5dfce]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#003527] text-[#FCBC1F] flex items-center justify-center font-bold">
                  <ListChecks className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#003527]">
                    Interactive Shopping Checklist
                  </h2>
                  <p className="text-xs text-[#51614f]">
                    {article.listItems.length} items • Tap any item to check off as you shop
                  </p>
                </div>
              </div>

              {/* Action Buttons (Top) */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyList}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#003527] bg-[#fffdf6] hover:bg-[#003527]/5 text-[#003527] font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-2xs"
                >
                  {copiedList ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedList ? 'Copied!' : 'Copy list'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenInYaad}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#003527] hover:bg-[#0a4d38] text-white font-extrabold text-xs sm:text-sm transition-transform active:scale-95 cursor-pointer shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4 text-[#FCBC1F]" />
                  <span>Open in YAAD</span>
                </button>
              </div>
            </div>

            {/* Checklist Groups */}
            <div className="py-6 space-y-6">
              {groupedItems.map((grp, gIdx) => (
                <div key={gIdx} className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#003527]/80 bg-[#003527]/5 px-3 py-1.5 rounded-lg inline-block">
                    {grp.name}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {grp.items.map(({ item, globalIdx }) => {
                      const isChecked = Boolean(checkedItems[globalIdx]);
                      return (
                        <div
                          key={globalIdx}
                          onClick={() => toggleItemCheck(globalIdx)}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                            isChecked
                              ? 'bg-[#f4f2ea]/60 border-[#e0dcce] text-neutral-400 opacity-60'
                              : 'bg-[#faf9f5] border-[#e7e1ce] hover:border-[#003527] text-[#1c2826] shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="shrink-0 text-[#003527]">
                              {isChecked ? (
                                <CheckSquare className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <Square className="w-5 h-5 text-[#88998d]" />
                              )}
                            </span>
                            <span
                              className={`text-sm font-semibold truncate ${
                                isChecked ? 'line-through text-neutral-400' : 'text-[#1c2826]'
                              }`}
                            >
                              {item.name}
                            </span>
                          </div>
                          {(item.qty || item.unit) && (
                            <span
                              className={`shrink-0 text-xs px-2.5 py-1 rounded-lg ml-2 font-mono ${
                                isChecked
                                  ? 'bg-neutral-200 text-neutral-400 line-through'
                                  : 'bg-[#003527]/10 text-[#003527] font-bold'
                              }`}
                            >
                              {item.qty}{item.unit ? ` ${item.unit}` : ''}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-[#e5dfce]">
              <div className="text-xs text-[#51614f] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>YAAD helps you keep shopping needs in one place.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyList}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#003527] bg-[#fffdf6] hover:bg-[#003527]/5 text-[#003527] font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-2xs"
                >
                  {copiedList ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedList ? 'Copied!' : 'Copy list'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenInYaad}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#003527] hover:bg-[#0a4d38] text-white font-extrabold text-xs sm:text-sm transition-transform active:scale-95 cursor-pointer shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4 text-[#FCBC1F]" />
                  <span>Open in YAAD</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Table of Contents */}
        {h2Matches.length >= 3 && (
          <nav aria-label="Table of Contents" className="my-8 p-6 rounded-2xl bg-[#efece0] border border-[#ddd7c3]">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#003527] mb-3">
              Table of Contents
            </h3>
            <ol className="space-y-2 text-xs sm:text-sm">
              {h2Matches.map((h2Text, hIdx) => {
                const anchorId = slugifyHeading(h2Text);
                return (
                  <li key={hIdx}>
                    <a
                      href={`#${anchorId}`}
                      className="text-[#005039] font-medium hover:underline hover:text-[#003527] flex items-center gap-2"
                    >
                      <span className="text-[#a5b2a3] font-mono text-xs">{hIdx + 1}.</span>
                      <span>{h2Text}</span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        {/* Body Content with H2, H3, Tables, CTAs */}
        <section className="my-10">
          <ArticleBodyRenderer
            body={article.body}
            isStandalonePage={true}
            onOpenAppAction={() => handleNav('/')}
          />
        </section>

        {/* Visible FAQ Section */}
        {article.faqs && article.faqs.length > 0 && (
          <section className="my-12 pt-8 border-t border-[#ddd7c3]">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003527] mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {article.faqs.map((faqItem, fIdx) => {
                const isOpen = openFaqIndices.has(fIdx);
                return (
                  <div
                    key={fIdx}
                    className="border border-[#ddd7c3] rounded-2xl bg-white overflow-hidden transition-all shadow-2xs"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(fIdx)}
                      className="w-full p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-[#1c2826] flex items-center justify-between gap-4 cursor-pointer hover:bg-[#faf9f5]"
                    >
                      <span>{faqItem.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-[#003527] transition-transform duration-200 shrink-0 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#4a5c53] leading-relaxed border-t border-[#f2efe9]">
                        <p>{faqItem.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Hashtags & Sharing Row */}
        {article.hashtags && article.hashtags.length > 0 && (
          <div className="my-8 pt-6 border-t border-[#ddd7c3] flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {article.hashtags.map((tag, tIdx) => {
                const cleanTag = tag.replace(/^#/, '');
                return (
                  <span
                    key={tIdx}
                    className="px-3 py-1 rounded-full bg-[#eceadf] text-[#005039] text-xs font-semibold"
                  >
                    #{cleanTag}
                  </span>
                );
              })}
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#ddd7c3] hover:border-[#003527] text-[#003527] font-bold text-xs shadow-2xs cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Copied' : 'Copy Article Link'}</span>
            </button>
          </div>
        )}

        {/* Follow YAAD Community & Social Profiles Block */}
        <FollowYaadBlock className="my-10" />

        {/* Related Guides Section */}
        {relatedArticles.length > 0 && (
          <section className="my-14 pt-8 border-t border-[#ddd7c3]">
            <h2 className="text-2xl font-extrabold text-[#003527] mb-6">
              Related Guides & Resources
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {relatedArticles.map((rel, rIdx) => (
                <a
                  key={rIdx}
                  href={`/blog/${rel.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav(`/blog/${rel.slug}`);
                  }}
                  className="p-5 rounded-2xl bg-white border border-[#ddd7c3] hover:border-[#003527] hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div className="space-y-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#005039]">
                      {rel.category || 'Guide'}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-[#1c2826] group-hover:text-[#005039] transition-colors leading-snug">
                      {rel.title}
                    </h3>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#f2efe9] flex items-center justify-between text-xs font-bold text-[#005039]">
                    <span>Read Guide</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Final CTA Banner */}
        <section className="my-14 p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#003527] to-[#0a4d38] text-white shadow-xl text-center border border-[#0a4d38]">
          <div className="w-14 h-14 rounded-2xl bg-[#FCBC1F] text-[#003527] flex items-center justify-center font-bold mx-auto mb-4">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
            Make Shopping Simple with YAAD
          </h2>
          <p className="text-sm sm:text-base text-emerald-100 max-w-lg mx-auto mb-6 leading-relaxed">
            Create fast shopping lists in English, Roman Urdu or Urdu script. Works completely offline in the store. 100% free with no ads.
          </p>
          <button
            type="button"
            onClick={() => handleNav('/')}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#FCBC1F] text-[#003527] hover:bg-[#ebd056] font-extrabold text-sm sm:text-base shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            <span>Open YAAD Free</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </section>
      </main>
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-[#003527] text-white shadow-xl text-sm font-bold flex items-center gap-2 animate-fade-in pointer-events-none">
          <Check className="w-4 h-4 text-[#FCBC1F]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </article>
  );
};
