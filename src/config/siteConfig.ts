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

export const SITE_CONFIG = {
  // Brand & Entity
  name: 'YAAD',
  nameUrdu: 'یاد',
  brandTagline: 'Smart Shopping Memory',
  brandTaglineUrdu: 'سودا سلف یاد رکھنے کی آسان ایپ',
  brandTaglineRomanUrdu: 'Sauda salaf yaad rakhne ki aasan app',

  // Official Domains & URLs
  // Default canonical production URL: easily configurable via environment variable or default
  defaultProductionUrl: 'https://yaadapppk.vercel.app',
  
  // Brand Palette
  themeColor: '#005039',
  backgroundColor: '#fbf9f5',

  // Official Contact
  supportEmail: 'useyaadapp@gmail.com',

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
  } as Record<string, PageSeoConfig>,
} as const;

/**
 * Returns the authoritative canonical production site URL.
 * Strictly avoids leaking localhost, dev containers, staging, or preview domains into canonical tags.
 * Overridable via VITE_SITE_URL or SITE_URL environment variables in production.
 */
export function getBaseSiteUrl(): string {
  // 1. Explicit production environment variable override (e.g. custom domain rollout)
  if (typeof process !== 'undefined') {
    const envUrl = process.env?.VITE_SITE_URL || process.env?.SITE_URL;
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('run.app')) {
      return envUrl.replace(/\/+$/, '');
    }
  }
  if (typeof import.meta !== 'undefined') {
    const envUrl = (import.meta as any).env?.VITE_SITE_URL;
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('run.app')) {
      return envUrl.replace(/\/+$/, '');
    }
  }
  // 2. Fixed authoritative production domain (Single Source of Truth)
  return SITE_CONFIG.defaultProductionUrl;
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
 * Resolves the appropriate redirect URL for authentication flows (OAuth, magic links, password resets).
 * In production or remote environments, always targets the authoritative production domain (https://yaadapppk.vercel.app).
 * In local/container preview environments, preserves the local origin for active developer testing.
 */
export function getAuthRedirectUrl(path: string = '/'): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin;
    // Allow local development and AI Studio preview containers to handle their own redirects
    if (
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.includes('run.app')
    ) {
      return `${origin}${cleanPath}`;
    }
  }
  const base = getBaseSiteUrl();
  return `${base}${cleanPath}`;
}
