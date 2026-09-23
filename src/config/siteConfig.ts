/**
 * YAAD Site & SEO Canonical Configuration
 * Single Source of Truth for Domain, Entity, and Metadata
 */

export interface PageSeoConfig {
  title: {
    en: string;
    romanUrdu: string;
    ur: string;
  };
  description: {
    en: string;
    romanUrdu: string;
    ur: string;
  };
  canonicalPath: string;
  isIndexable: boolean;
  priority?: number;
  changeFreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
}

// Authoritative Single Source of Truth for YAAD Production Domain
export const PRODUCTION_APP_URL = 'https://yaadapppk.vercel.app';

/**
 * Known legacy domains and Vercel deployment-specific hostnames.
 * These must NEVER be used as the production OAuth redirect URL.
 */
export const LEGACY_OR_DEPLOYMENT_HOSTS = [
  'yaadapppk-mudassirbashir530-creators-projects.vercel.app',
  'yaad-mudassirbashir530-creators-projects.vercel.app',
  'yaad-three.vercel.app',
] as const;

export const SITE_CONFIG = {
  // Brand & Entity
  name: 'YAAD',
  nameUrdu: 'یاد',
  brandTagline: 'Smart Shopping Memory',
  brandTaglineUrdu: 'سودا سلف یاد رکھنے کی آسان ایپ',
  brandTaglineRomanUrdu: 'Sauda salaf yaad rakhne ki aasan app',

  // Official Domains & URLs
  // Canonical production URL: Single Source of Truth
  defaultProductionUrl: PRODUCTION_APP_URL,
  
  // Brand Palette
  themeColor: '#005039',
  backgroundColor: '#fbf9f5',

  // Official Contact
  supportEmail: 'yaadapppk@gmail.com',

  // Supported Locales
  locales: [
    { code: 'en', name: 'English', hreflang: 'en', dir: 'ltr' as const },
    { code: 'roman-urdu', name: 'Roman Urdu', hreflang: 'ur-Latn', dir: 'ltr' as const },
    { code: 'ur', name: 'اردو', hreflang: 'ur', dir: 'rtl' as const },
  ],
  defaultLocale: 'en',

  // Social & Asset Previews
  ogImage: '/og-image.png',
  ogImageAlt: 'YAAD (یاد) — Smart Shopping Memory & Grocery Assistant',
  logo: '/logo.png',
  favicon: '/favicon.png',

  // Public SEO Pages Metadata
  pages: {
    home: {
      canonicalPath: '/',
      isIndexable: true,
      priority: 1.0,
      changeFreq: 'daily',
      title: {
        en: 'YAAD • Smart Shopping Memory & Grocery Reminder App',
        romanUrdu: 'YAAD • Sauda Salaf Yaad Rakhne Ki Aasan Grocery App',
        ur: 'یاد • سودا سلف اور خریداری یاد دہانی کی آسان ایپ',
      },
      description: {
        en: 'Never forget what you need to buy. YAAD (یاد) is a smart, bilingual shopping reminder that organizes grocery items automatically. Works offline in English, Urdu, and Roman Urdu.',
        romanUrdu: 'Shopping k waqt koi cheez na bhoolein. YAAD sauda salaf aur grocery yaad rakhne ki tez aur aasan app hai jo offline bhi kaam karti hai.',
        ur: 'خریداری کے دوران کوئی چیز مت بھولیں۔ یاد ایپ آپ کے سودا سلف کو خودکار طریقے سے ترتیب دیتی ہے اور بغیر انٹرنیٹ کے بھی کام کرتی ہے۔',
      },
    },
    about: {
      canonicalPath: '/about',
      isIndexable: true,
      priority: 0.9,
      changeFreq: 'weekly',
      title: {
        en: 'About YAAD • Bilingual Intelligence & Shopping Memory',
        romanUrdu: 'YAAD K Baaray Mein • Hamari Kahani Aur Maqsad',
        ur: 'یاد ایپ کے بارے میں • کہانی، مقصد اور خصوصیات',
      },
      description: {
        en: 'Discover how YAAD solves the universal problem of forgetting grocery items with native Pakistani grocery intelligence, trilingual support, and complete offline privacy.',
        romanUrdu: 'Janiye k YAAD kis tarah aapki grocery aur sauda salaf ko asaan banati hai. Trilingual support aur offline privacy k sath.',
        ur: 'جانیے کہ یاد ایپ کس طرح سودا سلف یاد رکھنے اور خریداری کے عمل کو آسان بناتی ہے۔ دو لسانی سمجھ بوجھ اور مکمل پرائیویسی کے ساتھ۔',
      },
    },
    help: {
      canonicalPath: '/help',
      isIndexable: true,
      priority: 0.8,
      changeFreq: 'weekly',
      title: {
        en: 'Help & FAQ • How to Use YAAD Shopping Reminder',
        romanUrdu: 'Madad Aur FAQ • YAAD App Istemal Karne Ka Tareeqa',
        ur: 'مدد اور سوالات • یاد ایپ استعمال کرنے کا طریقہ اور رہنمائی',
      },
      description: {
        en: 'Frequently asked questions about YAAD. Learn how to use offline mode, organize grocery items by aisle, log in with Passkeys, and add items in Urdu or Roman Urdu.',
        romanUrdu: 'YAAD k baray mein aam sawalat k jawabat. Offline mode, passkey login aur grocery items organize karne ka tareeqa seekhein.',
        ur: 'یاد ایپ سے متعلق اکثر پوچھے جانے والے سوالات کے جوابات۔ بغیر انٹرنیٹ لسٹیں بنانے، پاس کیز لاگ ان اور اشیاء کی ترتیب کا طریقہ۔',
      },
    },
    terms: {
      canonicalPath: '/terms',
      isIndexable: true,
      priority: 0.5,
      changeFreq: 'monthly',
      title: {
        en: 'Terms & Conditions • YAAD Smart Shopping Memory',
        romanUrdu: 'Terms & Conditions (Sharaait) • YAAD',
        ur: 'شرائط و ضوابط • یاد ایپ',
      },
      description: {
        en: 'Read the clear and transparent Terms and Conditions for using YAAD Smart Shopping Memory.',
        romanUrdu: 'YAAD smart shopping reminder istemal karne ki aasan aur wazeh sharaait.',
        ur: 'یاد اسمارٹ شاپنگ ایپ کے استعمال سے متعلق شفاف اور آسان شرائط و ضوابط۔',
      },
    },
    privacy: {
      canonicalPath: '/privacy',
      isIndexable: true,
      priority: 0.5,
      changeFreq: 'monthly',
      title: {
        en: 'Privacy Policy • Your Data Stays Yours • YAAD',
        romanUrdu: 'Privacy Policy (Raazdari) • YAAD',
        ur: 'پرائیویسی پالیسی • ذاتی ڈیٹا کا مکمل تحفظ • یاد',
      },
      description: {
        en: 'Your shopping lists and private notes belong solely to you. Learn how YAAD protects your data with Row Level Security, local encryption, and zero ad-tracking.',
        romanUrdu: 'Aapki shopping lists aur data hamesha mehfooz hain. Zero ad tracking aur local encryption ki policy parhein.',
        ur: 'آپ کی خریداری کی لسٹیں صرف آپ کی ملکیت ہیں۔ جانیے کہ یاد ایپ کس طرح راؤ لیول سیکیورٹی اور لوکل انکرپشن سے ڈیٹا محفوظ رکھتی ہے۔',
      },
    },
    legal: {
      canonicalPath: '/legal',
      isIndexable: true,
      priority: 0.4,
      changeFreq: 'monthly',
      title: {
        en: 'Legal Information & Disclosures • YAAD',
        romanUrdu: 'Qanooni Maloomat Aur Disclosures • YAAD',
        ur: 'قانونی معلومات اور اعلانات • یاد ایپ',
      },
      description: {
        en: 'Official legal disclosures, intellectual property notices, and compliance details for YAAD.',
        romanUrdu: 'YAAD app k qanooni notices aur compliance ki maloomat.',
        ur: 'یاد ایپ کے قانونی اعلانات، املاکِ دانش اور قواعد و ضوابط کی تفصیلات۔',
      },
    },
    rashanList: {
      canonicalPath: '/rashan-list',
      isIndexable: true,
      priority: 0.9,
      changeFreq: 'weekly',
      title: {
        en: 'Monthly Rashan List • Essential Pakistani Grocery & Pantry Checklist • YAAD',
        romanUrdu: 'Mahana Rashan List • Pakistan Grocery & Sauda Salaf Checklist • YAAD',
        ur: 'ماہانہ راشن لسٹ • پاکستانی گھریلو سودا سلف اور گروسری چیک لسٹ • یاد',
      },
      description: {
        en: 'The definitive monthly rashan checklist for Pakistani households. Includes chakki atta, basmati rice, daalein, ghee, traditional units (pao, darjan), storage tips, and instant 1-click import into YAAD.',
        romanUrdu: 'Pakistani gharon k liye mahana rashan ki mukammal fahreest. Atta, daalein, ghee, masalay, aur bazaar k riwayati paimanon k sath. YAAD mein foran load karein.',
        ur: 'پاکستانی گھرانوں کے لیے ماہانہ راشن کی مکمل فہرست۔ چکی کا آٹا، باسمتی چاول، دالیں، گھی، روایتی پیمانے (پاؤ، درجن) اور یاد ایپ پر براہ راست لسٹ بنانے کی سہولت۔',
      },
    },
    blog: {
      canonicalPath: '/blog',
      isIndexable: true,
      priority: 0.8,
      changeFreq: 'weekly',
      title: {
        en: 'YAAD Blog • Smart Grocery Budgeting & Rashan Guides',
        romanUrdu: 'YAAD Blog • Mahana Rashan & Smart Shopping Guides',
        ur: 'یاد بلاگ • گھریلو راشن اور سودا سلف کی خریداری کے رہنما مضامین',
      },
      description: {
        en: 'Actionable tips on monthly rashan planning, budget management, traditional Pakistani weights (pao, dharri), and clutter-free shopping habits.',
        romanUrdu: 'Mahana rashan ki planning, budget bachane k mashwaray, rawaiti paimany aur smart grocery shopping ki rehnumai.',
        ur: 'ماہانہ راشن کی منصوبہ بندی، بجٹ بچانے کی تجاویز، روایتی پیمانوں کی معلومات اور یاد ایپ کے استعمال سے متعلق معلوماتی مضامین۔',
      },
    },
  } as Record<string, PageSeoConfig>,
} as const;

/**
 * Determines whether a given hostname is a local or development environment.
 */
export function isLocalOrDevHost(hostname: string): boolean {
  const lower = (hostname || '').toLowerCase().trim();
  return (
    lower === 'localhost' ||
    lower === '127.0.0.1' ||
    lower === '0.0.0.0' ||
    lower.endsWith('.local') ||
    lower.endsWith('.run.app')
  );
}

/**
 * Determines whether a given hostname is a dedicated preview deployment (e.g. branch or PR preview on Vercel).
 * Note: Permanent project deployment URLs (like yaadapppk-mudassirbashir530-creators-projects.vercel.app)
 * and legacy domains are production aliases, not preview environments.
 */
export function isPreviewDeploymentHost(hostname: string): boolean {
  const lower = (hostname || '').toLowerCase().trim();
  if (!lower) return false;
  if (isLocalOrDevHost(lower)) return false;
  if (lower === 'yaadapppk.vercel.app') return false;
  if (LEGACY_OR_DEPLOYMENT_HOSTS.some((legacyHost) => lower === legacyHost || lower.includes(legacyHost))) {
    return false;
  }

  // Dedicated Vercel branch / PR preview deployments typically contain '-git-'
  return lower.endsWith('.vercel.app') && lower.includes('-git-');
}

/**
 * Returns the authoritative canonical production site URL.
 * Strictly avoids leaking localhost, dev containers, staging, or deployment/preview domains into canonical tags.
 * Falls back safely to PRODUCTION_APP_URL.
 */
export function getBaseSiteUrl(): string {
  // 1. Explicit production environment variable override (if valid and not a legacy/deployment URL)
  const candidateUrl =
    (typeof process !== 'undefined' ? process.env?.VITE_SITE_URL || process.env?.SITE_URL : undefined) ||
    (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_SITE_URL : undefined);

  if (candidateUrl && typeof candidateUrl === 'string') {
    const trimmed = candidateUrl.trim().replace(/\/+$/, '');
    const isExcluded =
      trimmed.includes('localhost') ||
      trimmed.includes('run.app') ||
      LEGACY_OR_DEPLOYMENT_HOSTS.some((h) => trimmed.includes(h));

    if (!isExcluded && (trimmed.startsWith('https://') || trimmed.startsWith('http://'))) {
      return trimmed;
    }
  }

  // 2. Fixed authoritative production domain (Single Source of Truth)
  return PRODUCTION_APP_URL;
}

/**
 * Returns absolute canonical URL for a path
 */
export function getAbsoluteCanonicalUrl(path: string = '/'): string {
  const base = getBaseSiteUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath === '/') return `${base}/`;
  return `${base}${cleanPath}`;
}

/**
 * Resolves the appropriate redirect URL for authentication flows (Google OAuth, magic links, password resets).
 *
 * Rules:
 * 1. LOCALHOST / DEV: Preserves local origin (http://localhost:3000, AI Studio containers) for active developer testing.
 * 2. PREVIEW DEPLOYMENTS: Preserves preview branch origin (e.g. https://yaadapppk-git-*.vercel.app) for PR reviewers.
 * 3. PRODUCTION & DEPLOYMENT URLS: Always returns the authoritative production domain (https://yaadapppk.vercel.app).
 *    Under NO circumstances will deployment URLs (yaadapppk-mudassirbashir530-creators-projects.vercel.app) or legacy
 *    domains be returned as the production OAuth redirect URL.
 */
export function getAuthRedirectUrl(path: string = '/home'): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (typeof window !== 'undefined' && window.location?.hostname) {
    const host = window.location.hostname.toLowerCase();

    // Local development
    if (isLocalOrDevHost(host)) {
      const origin = window.location.origin;
      if (origin && !origin.startsWith('file:') && origin !== 'null') {
        return `${origin}${cleanPath}`;
      }
    }

    // Dedicated Vercel branch / PR preview deployments
    if (isPreviewDeploymentHost(host)) {
      const origin = window.location.origin;
      if (origin && !origin.startsWith('file:') && origin !== 'null') {
        return `${origin}${cleanPath}`;
      }
    }
  }

  // Authoritative Production Domain (Single Source of Truth)
  return `${PRODUCTION_APP_URL}${cleanPath}`;
}
