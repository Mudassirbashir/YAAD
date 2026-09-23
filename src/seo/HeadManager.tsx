import React, { useEffect } from 'react';
import { useAppRouter } from '../router/RouterContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { SITE_CONFIG, getBaseSiteUrl, getAbsoluteCanonicalUrl } from '../config/siteConfig';
import { FAQS } from '../components/legal/legalContent';
import { RASHAN_FAQS } from '../components/rashan/rashanData';

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

    // 1. Sync <html> attributes (lang & dir)
    const htmlElement = document.documentElement;
    if (htmlElement) {
      const htmlLang = language === 'ur' ? 'ur-PK' : language === 'roman-urdu' ? 'ur-Latn' : 'en';
      htmlElement.setAttribute('lang', htmlLang);
      htmlElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    }

    // 2. Identify if route is public indexable:
    // Public indexable routes are strictly:
    // - root '/' (Public YAAD Product Landing Page)
    // - public editorial routes: 'about', 'help', 'terms', 'privacy', 'legal', 'rashan_list'
    // /home is NEVER indexable (it is the user's private shopping dashboard)
    const isPublicEditorial = ['about', 'help', 'terms', 'privacy', 'legal', 'rashan_list'].includes(routeId);
    const isPublicLanding = routeId === 'root';
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
    else if (routeId === 'terms') pageKey = 'terms';
    else if (routeId === 'privacy') pageKey = 'privacy';
    else if (routeId === 'legal') pageKey = 'legal';
    else if (routeId === 'rashan_list') pageKey = 'rashanList';

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
    const organizationSchema = {
      '@type': 'Organization',
      name: 'YAAD',
      alternateName: 'یاد',
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      email: SITE_CONFIG.supportEmail,
    };

    let structuredData: object;

    if (pageKey === 'home') {
      structuredData = {
        '@context': 'https://schema.org',
        '@graph': [
          organizationSchema,
          {
            '@type': 'WebSite',
            name: 'YAAD',
            alternateName: 'یاد',
            url: baseUrl,
            description: SITE_CONFIG.pages.home.description.en,
            inLanguage: ['en', 'ur'],
          },
          {
            '@type': 'WebApplication',
            name: 'YAAD',
            alternateName: 'یاد',
            url: baseUrl,
            description: SITE_CONFIG.pages.home.description.en,
            applicationCategory: 'ShoppingApplication',
            operatingSystem: 'All (iOS, Android, Windows, macOS, Linux, ChromeOS)',
            browserRequirements: 'Requires modern web browser with HTML5 and IndexedDB support',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            featureList: [
              'Bilingual English and Urdu item categorizer',
              'Roman Urdu natural kitchen item input',
              'Offline-first shopping list with local IndexedDB storage',
              'Passkey biometric authentication',
              'Zero ad tracking and private data security',
            ],
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
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: baseUrl,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Help & FAQ',
                item: absoluteCanonical,
              },
            ],
          },
          {
            '@type': 'FAQPage',
            mainEntity: faqEntities,
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
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: baseUrl,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: language === 'ur' ? 'ماہانہ راشن لسٹ' : 'Monthly Rashan List',
                item: absoluteCanonical,
              },
            ],
          },
          {
            '@type': 'ItemPage',
            name: pageTitle,
            description: pageDescription,
            url: absoluteCanonical,
            inLanguage: language === 'ur' ? 'ur' : 'en',
          },
          {
            '@type': 'FAQPage',
            mainEntity: faqEntities,
          },
        ],
      };
    } else {
      // General Editorial / Legal Page Schema
      structuredData = {
        '@context': 'https://schema.org',
        '@graph': [
          organizationSchema,
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: baseUrl,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: pageTitle.split('•')[0].trim(),
                item: absoluteCanonical,
              },
            ],
          },
          {
            '@type': 'WebPage',
            name: pageTitle,
            description: pageDescription,
            url: absoluteCanonical,
            inLanguage: language === 'ur' ? 'ur' : 'en',
          },
        ],
      };
    }

    setJsonLdScript('schema-org-data', structuredData);
  }, [route, language, isRTL, user]);

  return null;
};
