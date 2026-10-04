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
  nameUrdu: 'YAAD',
  brandTagline: 'Smart Shopping Memory',
  brandTaglineUrdu: 'Smart Shopping Memory',
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
    { code: 'ur', name: 'Urdu', hreflang: 'ur', dir: 'rtl' as const },
  ],
  defaultLocale: 'en',

  // Social & Asset Previews
  ogImage: '/og-image.png',
  ogImageAlt: 'YAAD — Smart Shopping Memory & Grocery Assistant',
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
        en: 'YAAD (yaadapppk) | Smart Shopping List & Reminder App',
        romanUrdu: 'YAAD (yaadapppk) | Sauda Salaf Yaad Rakhne Ki Aasan Grocery App',
        ur: 'YAAD (yaadapppk) | Smart Shopping List & Reminder App',
      },
      description: {
        en: 'YAAD (yaadapppk) is a simple shopping memory assistant — never forget what you came to buy. Made for everyday shopping in Pakistan. Works offline.',
        romanUrdu: 'YAAD (yaadapppk) grocery aur sauda salaf yaad rakhne ki tez aur aasan app hai jo offline bhi kaam karti hai. Kabhi koi cheez na bhoolein.',
        ur: 'YAAD (yaadapppk) خریداری کی یاد دہانی اور سودا سلف کی ایپ ہے — تاکہ آپ خریداری کے وقت کوئی چیز نہ بھولیں۔ پاکستان کے روزمرہ سودا سلف کے لیے تیار کردہ۔',
      },
    },
    about: {
      canonicalPath: '/about',
      isIndexable: true,
      priority: 0.9,
      changeFreq: 'weekly',
      title: {
        en: 'About YAAD • Bilingual Intelligence & Shopping Memory', romanUrdu: 'YAAD K Baaray Mein • Hamari Kahani Aur Maqsad', ur: 'About YAAD • Bilingual Intelligence & Shopping Memory',
      },
      description: {
        en: 'Discover how YAAD solves the universal problem of forgetting grocery items with native Pakistani grocery intelligence, trilingual support, and complete offline privacy.', romanUrdu: 'Janiye k YAAD kis tarah aapki grocery aur sauda salaf ko asaan banati hai. Trilingual support aur offline privacy k sath.', ur: 'Discover how YAAD solves the universal problem of forgetting grocery items with native Pakistani grocery intelligence, trilingual support, and complete offline privacy.',
      },
    },
    features: {
      canonicalPath: '/features',
      isIndexable: true,
      priority: 0.8,
      changeFreq: 'weekly',
      title: {
        en: 'YAAD Features • Bilingual Grocery Lists & Offline Memory',
        romanUrdu: 'YAAD Features • Grocery List Aur Offline Memory',
        ur: 'YAAD Features • Bilingual Grocery Lists & Offline Memory',
      },
      description: {
        en: 'Explore YAAD features: bilingual Urdu and English grocery intelligence, 100% offline lists, Pakistani units, and cross-device sync.',
        romanUrdu: 'YAAD ki tamam features: bilingual grocery lists, offline memory aur Pakistani units k sath.',
        ur: 'Explore YAAD features: bilingual Urdu and English grocery intelligence, 100% offline lists, Pakistani units, and cross-device sync.',
      },
    },
    howItWorks: {
      canonicalPath: '/how-it-works',
      isIndexable: true,
      priority: 0.8,
      changeFreq: 'weekly',
      title: {
        en: 'See How YAAD Works • Easy Grocery Planning & Offline Checklist',
        romanUrdu: 'YAAD Kaise Kaam Karti Hai • Step by Step Guide',
        ur: 'See How YAAD Works • Easy Grocery Planning & Offline Checklist',
      },
      description: {
        en: 'Learn how YAAD works in 4 easy steps: create your list, add groceries in English or Urdu, shop offline in the market, and save your trip history.',
        romanUrdu: 'YAAD istemal karne ka asan tareeqa: list banayein, grocery items likhein, aur offline check off karein.',
        ur: 'Learn how YAAD works in 4 easy steps: create your list, add groceries in English or Urdu, shop offline in the market, and save your trip history.',
      },
    },
    help: {
      canonicalPath: '/help',
      isIndexable: true,
      priority: 0.8,
      changeFreq: 'weekly',
      title: {
        en: 'Help & FAQ • How to Use YAAD Shopping Reminder', romanUrdu: 'Madad Aur FAQ • YAAD App Istemal Karne Ka Tareeqa', ur: 'Help & FAQ • How to Use YAAD Shopping Reminder',
      },
      description: {
        en: 'Frequently asked questions about YAAD. Learn how to use offline mode, organize grocery items by aisle, sync household lists, and add items in Urdu or Roman Urdu.', romanUrdu: 'YAAD k baray mein aam sawalat k jawabat. Offline mode, sync aur grocery items organize karne ka tareeqa seekhein.', ur: 'Frequently asked questions about YAAD. Learn how to use offline mode, organize grocery items by aisle, sync household lists, and add items in Urdu or Roman Urdu.',
      },
    },
    terms: {
      canonicalPath: '/terms',
      isIndexable: true,
      priority: 0.5,
      changeFreq: 'monthly',
      title: {
        en: 'Terms & Conditions • YAAD Smart Shopping Memory', romanUrdu: 'Terms & Conditions (Sharaait) • YAAD', ur: 'Terms & Conditions • YAAD Smart Shopping Memory',
      },
      description: {
        en: 'Read the clear and transparent Terms and Conditions for using YAAD Smart Shopping Memory.', romanUrdu: 'YAAD smart shopping reminder istemal karne ki aasan aur wazeh sharaait.', ur: 'Read the clear and transparent Terms and Conditions for using YAAD Smart Shopping Memory.',
      },
    },
    privacy: {
      canonicalPath: '/privacy',
      isIndexable: true,
      priority: 0.5,
      changeFreq: 'monthly',
      title: {
        en: 'Privacy Policy • Your Data Stays Yours • YAAD', romanUrdu: 'Privacy Policy (Raazdari) • YAAD', ur: 'Privacy Policy • Your Data Stays Yours • YAAD',
      },
      description: {
        en: 'Your shopping lists and private notes belong solely to you. Learn how YAAD protects your data with Row Level Security, local encryption, and zero ad-tracking.', romanUrdu: 'Aapki shopping lists aur data hamesha mehfooz hain. Zero ad tracking aur local encryption ki policy parhein.', ur: 'Your shopping lists and private notes belong solely to you. Learn how YAAD protects your data with Row Level Security, local encryption, and zero ad-tracking.',
      },
    },
    legal: {
      canonicalPath: '/legal',
      isIndexable: true,
      priority: 0.4,
      changeFreq: 'monthly',
      title: {
        en: 'Legal Information & Disclosures • YAAD', romanUrdu: 'Qanooni Maloomat Aur Disclosures • YAAD', ur: 'Legal Information & Disclosures • YAAD',
      },
      description: {
        en: 'Official legal disclosures, intellectual property notices, and compliance details for YAAD.', romanUrdu: 'YAAD app k qanooni notices aur compliance ki maloomat.', ur: 'Official legal disclosures, intellectual property notices, and compliance details for YAAD.',
      },
    },
    rashanList: {
      canonicalPath: '/rashan-list',
      isIndexable: true,
      priority: 0.9,
      changeFreq: 'weekly',
      title: {
        en: 'Monthly Rashan List • Essential Pakistani Grocery & Pantry Checklist • YAAD', romanUrdu: 'Mahana Rashan List • Pakistan Grocery & Sauda Salaf Checklist • YAAD', ur: 'ماہانہ راشن لسٹ • پاکستانی گھریلو سودا سلف اور گروسری چیک لسٹ • یاد',
      },
      description: {
        en: 'The definitive monthly rashan checklist for Pakistani households. Includes chakki atta, basmati rice, daalein, ghee, traditional units (pao, darjan), storage tips, and instant 1-click import into YAAD.', romanUrdu: 'Pakistani gharon k liye mahana rashan ki mukammal fahreest. Atta, daalein, ghee, masalay, aur bazaar k riwayati paimanon k sath. YAAD mein foran load karein.', ur: 'The definitive monthly rashan checklist for Pakistani households. Includes chakki atta, basmati rice, daalein, ghee, traditional units (pao, darjan), storage tips, and instant 1-click import into YAAD.',
      },
    },
    blog: {
      canonicalPath: '/blog',
      isIndexable: true,
      priority: 0.8,
      changeFreq: 'weekly',
      title: {
        en: 'YAAD Blog • Smart Grocery Budgeting & Rashan Guides', romanUrdu: 'YAAD Blog • Mahana Rashan & Smart Shopping Guides', ur: 'YAAD Blog • Smart Grocery Budgeting & Rashan Guides',
      },
      description: {
        en: 'Actionable tips on monthly rashan planning, budget management, traditional Pakistani weights (pao, dharri), and clutter-free shopping habits.', romanUrdu: 'Mahana rashan ki planning, budget bachane k mashwaray, rawaiti paimany aur smart grocery shopping ki rehnumai.', ur: 'Actionable tips on monthly rashan planning, budget management, traditional Pakistani weights (pao, dharri), and clutter-free shopping habits.',
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
