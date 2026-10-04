import React, { useEffect } from 'react';
import { useAppRouter } from '../router/RouterContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { SITE_CONFIG, getBaseSiteUrl, getAbsoluteCanonicalUrl } from '../config/siteConfig';
import { FAQS } from '../components/legal/legalContent';
import { RASHAN_FAQS } from '../components/rashan/rashanData';
import { BLOG_POSTS } from '../components/legal/blogArticlesData';

/**
 * Helper to get or create a tag in <head>
 */
function setMetaTag(name: string, content: string, isProperty: boolean = false) {
  const attribute = isProperty ? 'property' : 'name';
  let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function removeMetaTag(name: string, isProperty: boolean = false) {
  const attribute = isProperty ? 'property' : 'name';
  const element = document.querySelector(`meta[${attribute}="${name}"]`);
  if (element) {
    element.remove();
  }
}

function setCanonicalLink(href: string | null) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!href) {
    if (link) link.remove();
    return;
  }
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function updateHreflangLinks(baseUrl: string, canonicalPath: string) {
  // Remove existing dynamic hreflang links
  document.querySelectorAll('link[data-yaad-hreflang="true"]').forEach((el) => el.remove());

  const cleanPath = canonicalPath === '/' ? '' : canonicalPath;
  const alternates = [
    { lang: 'x-default', href: `${baseUrl}${cleanPath || '/'}` },
    { lang: 'en', href: `${baseUrl}${cleanPath || '/'}` },
    { lang: 'ur', href: `${baseUrl}${cleanPath || '/'}?lang=ur` },
    { lang: 'ur-PK', href: `${baseUrl}${cleanPath || '/'}?lang=ur` },
    { lang: 'ur-Latn', href: `${baseUrl}${cleanPath || '/'}?lang=roman-urdu` },
  ];

  alternates.forEach(({ lang, href }) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', lang);
    link.setAttribute('href', href);
    link.setAttribute('data-yaad-hreflang', 'true');
    document.head.appendChild(link);
  });
}

function removeHreflangLinks() {
  document.querySelectorAll('link[data-yaad-hreflang="true"]').forEach((el) => el.remove());
}

function setJsonLdScript(id: string, data: object | null) {
  const existingScript = document.getElementById(id);
  if (!data) {
    if (existingScript) existingScript.remove();
    return;
  }

  const jsonString = JSON.stringify(data);
  if (existingScript) {
    existingScript.textContent = jsonString;
  } else {
    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = jsonString;
    document.head.appendChild(script);
  }
}

export const HeadManager: React.FC = () => {
  const { route } = useAppRouter();
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    const baseUrl = getBaseSiteUrl();
    const routeId = route.routeId;
    const currentLangKey = (language === 'ur' ? 'ur' : language === 'roman-urdu' ? 'romanUrdu' : 'en') as 'en' | 'romanUrdu' | 'ur';

    // 0. Staging domain guard: Staging deployments (e.g. yaad-three.vercel.app) must NEVER be indexed
    const host = typeof window !== 'undefined' ? (window.location.hostname || '').toLowerCase() : '';
    const isStagingDeployment = host === 'yaad-three.vercel.app' || (host.endsWith('.vercel.app') && host !== 'yaadapppk.vercel.app');
    if (isStagingDeployment) {
      setMetaTag('robots', 'noindex, nofollow, noarchive');
    }

    // 1. Sync <html> attributes (lang & dir)
    const htmlElement = document.documentElement;
    if (htmlElement) {
      const htmlLang = language === 'ur' ? 'ur-PK' : language === 'roman-urdu' ? 'ur-Latn' : 'en';
      htmlElement.setAttribute('lang', htmlLang);
      htmlElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    }

    // 2. Identify if route is public indexable:
    // Public indexable routes are strictly:
    // - Public landing / home page (Canonical: https://yaadapppk.vercel.app/home)
    // - public editorial routes: 'about', 'help', 'terms', 'privacy', 'legal', 'rashan_list', 'blog', 'features', 'how_it_works'
    // Private user shopping lists when authenticated on /home remain strictly protected
    const isPublicEditorial = [
      'about',
      'help',
      'terms',
      'privacy',
      'legal',
      'rashan_list',
      'blog',
      'features',
      'how_it_works',
    ].includes(routeId);
    const isPublicLanding = routeId === 'root' || (routeId === 'home' && !user);
    const isIndexablePublicRoute = isPublicLanding || isPublicEditorial;

    if (!isIndexablePublicRoute) {
      // -------------------------------------------------------------
      // PRIVATE / AUTH / UTILITY ROUTE: Strictly prevent indexing
      // -------------------------------------------------------------
      setMetaTag('robots', 'noindex, nofollow, noarchive');
      setCanonicalLink(null);
      removeHreflangLinks();
      setJsonLdScript('schema-org-data', null);

      // Clean, unbranded internal title for protected screens
      switch (routeId) {
        case 'home':
          document.title = 'Shopping Lists • YAAD';
          break;
        case 'create':
        case 'add_items':
          document.title = 'New Shopping List • YAAD';
          break;
        case 'shopping_list':
        case 'list_details':
        case 'edit_list':
          document.title = 'Shopping List • YAAD';
          break;
        case 'history':
        case 'history_session':
          document.title = 'Purchase History • YAAD';
          break;
        case 'statistics':
          document.title = 'Shopping Statistics • YAAD';
          break;
        case 'settings':
        case 'settings_subsection':
          document.title = 'Settings • YAAD';
          break;
        case 'auth':
          document.title = 'Sign In • YAAD';
          break;
        case 'reset_password':
          document.title = 'Reset Password • YAAD';
          break;
        default:
          document.title = 'YAAD';
          break;
      }
      return;
    }

    // -------------------------------------------------------------
    // PUBLIC INDEXABLE ROUTE: Full SEO, Social, & Schema Enrichment
    // -------------------------------------------------------------
    setMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // Retrieve configured page metadata
    let pageKey = 'home';
    if (routeId === 'about') pageKey = 'about';
    else if (routeId === 'help') pageKey = 'help';
    else if (routeId === 'features') pageKey = 'features';
    else if (routeId === 'how_it_works') pageKey = 'howItWorks';
    else if (routeId === 'terms') pageKey = 'terms';
    else if (routeId === 'privacy') pageKey = 'privacy';
    else if (routeId === 'legal') pageKey = 'legal';
    else if (routeId === 'rashan_list') pageKey = 'rashanList';
    else if (routeId === 'blog') pageKey = 'blog';

    const pageConfig = SITE_CONFIG.pages[pageKey] || SITE_CONFIG.pages.home;

    const pageTitle = pageConfig.title[currentLangKey] || pageConfig.title.en;
    const pageDescription = pageConfig.description[currentLangKey] || pageConfig.description.en;
    const canonicalPath = pageConfig.canonicalPath;
    
    // Canonical calculation with language parameter support
    const baseCanonical = getAbsoluteCanonicalUrl(canonicalPath);
    let absoluteCanonical = baseCanonical;
    if (language === 'ur') {
      absoluteCanonical = `${baseCanonical}${baseCanonical.endsWith('/') ? '' : '/'}?lang=ur`;
    } else if (language === 'roman-urdu') {
      absoluteCanonical = `${baseCanonical}${baseCanonical.endsWith('/') ? '' : '/'}?lang=roman-urdu`;
    }

    const ogImageUrl = `${baseUrl}${SITE_CONFIG.ogImage}`;

    // Apply Document Title & Canonical
    document.title = pageTitle;
    setCanonicalLink(absoluteCanonical);

    // Apply Reciprocal Hreflang Links
    updateHreflangLinks(baseUrl, canonicalPath);

    // Primary Meta Description
    setMetaTag('description', pageDescription);

    // Open Graph Metadata
    setMetaTag('og:title', pageTitle, true);
    setMetaTag('og:description', pageDescription, true);
    setMetaTag('og:url', absoluteCanonical, true);
    setMetaTag('og:site_name', 'YAAD', true);
    setMetaTag('og:type', 'website', true);
    setMetaTag('og:image', ogImageUrl, true);
    setMetaTag('og:image:width', '1200', true);
    setMetaTag('og:image:height', '630', true);
    setMetaTag('og:image:type', 'image/png', true);
    setMetaTag('og:image:alt', SITE_CONFIG.ogImageAlt, true);
    setMetaTag('og:locale', language === 'ur' ? 'ur_PK' : 'en_US', true);
    if (language !== 'ur') {
      setMetaTag('og:locale:alternate', 'ur_PK', true);
    } else {
      setMetaTag('og:locale:alternate', 'en_US', true);
    }

    // Twitter Card Metadata
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', pageTitle);
    setMetaTag('twitter:description', pageDescription);
    setMetaTag('twitter:image', ogImageUrl);
    setMetaTag('twitter:image:alt', SITE_CONFIG.ogImageAlt);

    // -------------------------------------------------------------
    // Structured Data (JSON-LD)
    // -------------------------------------------------------------
    const authorPersonSchema = {
      '@type': 'Person',
      '@id': `${baseUrl}/#author`,
      name: 'Mudassir Bashir',
      jobTitle: 'Software Engineer & Creator',
      email: SITE_CONFIG.supportEmail,
      url: `${baseUrl}/about`,
    };

    const organizationSchema = {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'YAAD',
      alternateName: ['yaadapppk', 'YAAD App'],
      url: `${baseUrl}/`,
      logo: `${baseUrl}/logo.png`,
      email: SITE_CONFIG.supportEmail,
      founder: authorPersonSchema,
      sameAs: [
        'https://www.tiktok.com/@yaadapp',
        'https://www.facebook.com/yaadapp',
        'https://www.instagram.com/yaadapp',
        'https://www.linkedin.com/company/yaadapp',
      ],
    };

    let structuredData: object;

    if (pageKey === 'home') {
      structuredData = {
        '@context': 'https://schema.org',
        '@graph': [
          organizationSchema,
          {
            '@type': 'SoftwareApplication',
            '@id': `${baseUrl}/#softwareapplication`,
            name: 'YAAD',
            alternateName: ['yaadapppk', 'YAAD App'],
            url: `${baseUrl}/`,
            description: 'YAAD (yaadapppk) is a simple shopping memory assistant — never forget what you came to buy. Made for everyday shopping in Pakistan.',
            applicationCategory: 'ShoppingApplication',
            operatingSystem: 'All (iOS, Android, Windows, macOS, Linux, ChromeOS)',
            browserRequirements: 'Requires modern web browser with HTML5 and IndexedDB support',
            publisher: {
              '@id': `${baseUrl}/#organization`,
            },
            creator: {
              '@id': `${baseUrl}/#organization`,
            },
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            featureList: [
              'Bilingual English and Urdu item categorizer',
              'Roman Urdu natural kitchen item input',
              'Offline-first shopping list with local IndexedDB storage',
              'Pakistani units (kg, grams, pao, darjan)',
              'Secure Google OAuth and password sign-in',
              'Zero ad tracking and private data security',
            ],
          },
          {
            '@type': 'WebPage',
            '@id': `${baseUrl}/#webpage`,
            url: `${baseUrl}/`,
            name: pageTitle,
            description: pageDescription,
            isPartOf: {
              '@type': 'WebSite',
              '@id': `${baseUrl}/#website`,
              name: 'YAAD',
              alternateName: ['yaadapppk', 'YAAD App'],
              url: `${baseUrl}/`,
              description: SITE_CONFIG.pages.home.description.en,
              inLanguage: ['en', 'ur'],
            },
            about: {
              '@id': `${baseUrl}/#softwareapplication`,
            },
            publisher: {
              '@id': `${baseUrl}/#organization`,
            },
            inLanguage: language === 'ur' ? 'ur' : 'en',
          },
        ],
      };
    } else if (pageKey === 'help') {
      // FAQPage Schema using genuine visible FAQs
      const faqEntities = FAQS.map((faq) => ({
        '@type': 'Question',
        name: faq.question[currentLangKey] || faq.question.en,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer[currentLangKey] || faq.answer.en,
        },
      }));

      structuredData = {
        '@context': 'https://schema.org',
        '@graph': [
          organizationSchema,
          {
            '@type': 'BreadcrumbList',
            '@id': `${absoluteCanonical}#breadcrumb`,
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: `${baseUrl}/home`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'FAQ',
                item: absoluteCanonical,
              },
            ],
          },
          {
            '@type': 'FAQPage',
            '@id': `${absoluteCanonical}#faq`,
            mainEntity: faqEntities,
          },
          {
            '@type': 'WebPage',
            '@id': `${absoluteCanonical}#webpage`,
            name: pageTitle,
            description: pageDescription,
            url: absoluteCanonical,
            breadcrumb: {
              '@id': `${absoluteCanonical}#breadcrumb`,
            },
            mainEntity: {
              '@id': `${absoluteCanonical}#faq`,
            },
            isPartOf: {
              '@type': 'WebSite',
              '@id': `${baseUrl}/#website`,
              name: 'YAAD',
              url: `${baseUrl}/`,
            },
            publisher: {
              '@id': `${baseUrl}/#organization`,
            },
            inLanguage: language === 'ur' ? 'ur' : 'en',
          },
        ],
      };
    } else if (pageKey === 'rashanList') {
      const faqEntities = RASHAN_FAQS.map((faq) => ({
        '@type': 'Question',
        name: faq.question[currentLangKey] || faq.question.en,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer[currentLangKey] || faq.answer.en,
        },
      }));

      structuredData = {
        '@context': 'https://schema.org',
        '@graph': [
          organizationSchema,
          {
            '@type': 'BreadcrumbList',
            '@id': `${absoluteCanonical}#breadcrumb`,
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: `${baseUrl}/home`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Monthly Rashan Guide',
                item: absoluteCanonical,
              },
            ],
          },
          {
            '@type': 'FAQPage',
            '@id': `${absoluteCanonical}#faq`,
            mainEntity: faqEntities,
          },
          {
            '@type': 'ItemPage',
            '@id': `${absoluteCanonical}#itempage`,
            name: pageTitle,
            description: pageDescription,
            url: absoluteCanonical,
            breadcrumb: {
              '@id': `${absoluteCanonical}#breadcrumb`,
            },
            isPartOf: {
              '@type': 'WebSite',
              '@id': `${baseUrl}/#website`,
              name: 'YAAD',
              url: `${baseUrl}/`,
            },
            publisher: {
              '@id': `${baseUrl}/#organization`,
            },
            inLanguage: 'en',
          },
        ],
      };
    } else if (pageKey === 'blog') {
      const blogPostingEntities = BLOG_POSTS.map((post) => ({
        '@type': 'BlogPosting',
        '@id': `${baseUrl}/blog#${post.id}`,
        headline: post.title.en,
        name: post.title.en,
        description: post.summary.en,
        articleBody: post.directAnswer?.en || post.summary.en,
        url: `${baseUrl}/blog#${post.id}`,
        datePublished: '2026-10-01',
        inLanguage: language === 'ur' ? 'ur' : 'en',
        author: {
          '@type': 'Organization',
          name: 'YAAD Editorial Team',
          url: `${baseUrl}/about`,
        },
        publisher: {
          '@id': `${baseUrl}/#organization`,
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${absoluteCanonical}#webpage`,
        },
      }));

      structuredData = {
        '@context': 'https://schema.org',
        '@graph': [
          organizationSchema,
          {
            '@type': 'BreadcrumbList',
            '@id': `${absoluteCanonical}#breadcrumb`,
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: `${baseUrl}/home`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: absoluteCanonical,
              },
            ],
          },
          {
            '@type': 'Blog',
            '@id': `${absoluteCanonical}#blog`,
            name: 'YAAD Editorial & Shopping Guides',
            description: 'Practical grocery and household shopping knowledge, cognitive memory insights, and list organization guides.',
            url: absoluteCanonical,
            publisher: {
              '@id': `${baseUrl}/#organization`,
            },
            blogPost: blogPostingEntities,
          },
          {
            '@type': 'WebPage',
            '@id': `${absoluteCanonical}#webpage`,
            name: pageTitle,
            description: pageDescription,
            url: absoluteCanonical,
            breadcrumb: {
              '@id': `${absoluteCanonical}#breadcrumb`,
            },
            mainEntity: {
              '@id': `${absoluteCanonical}#blog`,
            },
            isPartOf: {
              '@type': 'WebSite',
              '@id': `${baseUrl}/#website`,
              name: 'YAAD',
              url: `${baseUrl}/`,
            },
            publisher: {
              '@id': `${baseUrl}/#organization`,
            },
            inLanguage: language === 'ur' ? 'ur' : 'en',
          },
        ],
      };
    } else if (pageKey === 'about') {
      structuredData = {
        '@context': 'https://schema.org',
        '@graph': [
          organizationSchema,
          authorPersonSchema,
          {
            '@type': 'SoftwareApplication',
            '@id': `${baseUrl}/#softwareapplication`,
            name: 'YAAD',
            url: `${baseUrl}/`,
            description: 'YAAD is a shopping list and reminder app that helps people remember the things they need to buy before and during shopping.',
            applicationCategory: 'ShoppingApplication',
            operatingSystem: 'All (iOS, Android, Windows, macOS, Linux, ChromeOS)',
            browserRequirements: 'Requires modern web browser with HTML5 and IndexedDB support',
            author: {
              '@id': `${baseUrl}/#author`,
            },
            creator: {
              '@id': `${baseUrl}/#author`,
            },
            publisher: {
              '@id': `${baseUrl}/#organization`,
            },
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          },
          {
            '@type': 'BreadcrumbList',
            '@id': `${absoluteCanonical}#breadcrumb`,
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: `${baseUrl}/home`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'About',
                item: absoluteCanonical,
              },
            ],
          },
          {
            '@type': 'AboutPage',
            '@id': `${absoluteCanonical}#aboutpage`,
            name: pageTitle,
            description: pageDescription,
            url: absoluteCanonical,
            breadcrumb: {
              '@id': `${absoluteCanonical}#breadcrumb`,
            },
            mainEntity: {
              '@id': `${baseUrl}/#softwareapplication`,
            },
            about: {
              '@id': `${baseUrl}/#softwareapplication`,
            },
            author: {
              '@id': `${baseUrl}/#author`,
            },
            publisher: {
              '@id': `${baseUrl}/#organization`,
            },
            isPartOf: {
              '@type': 'WebSite',
              '@id': `${baseUrl}/#website`,
              name: 'YAAD',
              url: `${baseUrl}/`,
            },
            inLanguage: language === 'ur' ? 'ur' : 'en',
          },
        ],
      };
    } else {
      // General Editorial / Legal Page Schema
      let breadcrumbName = pageTitle.split('•')[0].split('|')[0].trim();
      if (pageKey === 'about') breadcrumbName = 'About';
      else if (pageKey === 'features') breadcrumbName = 'Features';
      else if (pageKey === 'howItWorks') breadcrumbName = 'How It Works';
      else if (pageKey === 'terms') breadcrumbName = 'Terms of Service';
      else if (pageKey === 'privacy') breadcrumbName = 'Privacy Policy';
      else if (pageKey === 'blog') breadcrumbName = 'Blog';
      else if (pageKey === 'legal') breadcrumbName = 'Legal Hub';

      structuredData = {
        '@context': 'https://schema.org',
        '@graph': [
          organizationSchema,
          {
            '@type': 'BreadcrumbList',
            '@id': `${absoluteCanonical}#breadcrumb`,
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: `${baseUrl}/home`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: breadcrumbName,
                item: absoluteCanonical,
              },
            ],
          },
          {
            '@type': 'WebPage',
            '@id': `${absoluteCanonical}#webpage`,
            name: pageTitle,
            description: pageDescription,
            url: absoluteCanonical,
            breadcrumb: {
              '@id': `${absoluteCanonical}#breadcrumb`,
            },
            isPartOf: {
              '@type': 'WebSite',
              '@id': `${baseUrl}/#website`,
              name: 'YAAD',
              url: `${baseUrl}/`,
            },
            publisher: {
              '@id': `${baseUrl}/#organization`,
            },
            inLanguage: language === 'ur' ? 'ur' : 'en',
          },
        ],
      };
    }

    setJsonLdScript('schema-org-data', structuredData);
  }, [route, language, isRTL, user]);

  return null;
};
