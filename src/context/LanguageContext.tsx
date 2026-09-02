import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Language, translations } from '../translations';
import { CategoryId, CATEGORIES_LIST, CATEGORY_MAP } from '../types';
import { useAuth } from './AuthContext';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  getCategoryName: (categoryId: CategoryId | string) => string;
  getCategoryIcon: (categoryId: CategoryId | string) => string;
  isRTL: boolean;
  dir: 'rtl' | 'ltr';
}

const LANGUAGE_STORAGE_KEY = 'yaad_user_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { profile, updateUserProfile, user } = useAuth();

  const [language, setLanguageState] = useState<Language>(() => {
    // Check localStorage first
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
    if (saved && (saved === 'en' || saved === 'roman-urdu' || saved === 'ur')) {
      return saved;
    }
    return 'en';
  });

  // Sync with profile if available
  useEffect(() => {
    if (profile?.language && profile.language !== language) {
      setLanguageState(profile.language);
      localStorage.setItem(LANGUAGE_STORAGE_KEY, profile.language);
    }
  }, [profile?.language]);

  // Apply direction and language attributes to document HTML
  useEffect(() => {
    const isUrdu = language === 'ur';
    document.documentElement.lang = isUrdu ? 'ur' : language === 'roman-urdu' ? 'ur-Latn' : 'en';
    document.documentElement.dir = isUrdu ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);

    // If logged in, update remote profile asynchronously
    if (user) {
      updateUserProfile({ language: lang }).catch(() => {
        // silent fail on network/guest mode
      });
    }
  };

  const isRTL = language === 'ur';
  const dir = isRTL ? 'rtl' : 'ltr';

  // Nested translation resolver with param substitution
  const t = (path: string, params?: Record<string, string | number>): string => {
    const currentDict = translations[language] || translations.en;
    const parts = path.split('.');

    let current: any = currentDict;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        // Fallback to English
        let fallback: any = translations.en;
        for (const p of parts) {
          if (fallback && typeof fallback === 'object' && p in fallback) {
            fallback = fallback[p];
          } else {
            fallback = undefined;
            break;
          }
        }
        current = fallback || path;
        break;
      }
    }

    let result: string;
    if (typeof current === 'string') {
      result = current;
    } else {
      // Fallback: humanize the last token so raw keys like "home.yourListsTitle" never show
      const lastKey = parts[parts.length - 1] || path;
      result = lastKey
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
    }

    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
      });
    }

    return result;
  };

  const getCategoryName = (categoryId: CategoryId | string): string => {
    if (!categoryId) return t('categories.other');

    // Check if categoryId is in categories list
    const validCategory = CATEGORIES_LIST.find((c) => c.id === categoryId);
    if (validCategory) {
      return t(`categories.${validCategory.id}`);
    }

    // Handle legacy English category strings like "Produce", "Dairy", etc.
    const legacyLower = categoryId.toLowerCase();
    if (legacyLower.includes('produce') || legacyLower.includes('vegetable')) {
      return t('categories.vegetables');
    }
    if (legacyLower.includes('fruit')) {
      return t('categories.fruits');
    }
    if (legacyLower.includes('dairy') || legacyLower.includes('egg')) {
      return t('categories.dairy');
    }
    if (legacyLower.includes('meat') || legacyLower.includes('seafood') || legacyLower.includes('gosht')) {
      return t('categories.meat');
    }
    if (legacyLower.includes('bakery') || legacyLower.includes('bread')) {
      return t('categories.bakery');
    }
    if (legacyLower.includes('pantry') || legacyLower.includes('grain') || legacyLower.includes('staple')) {
      return t('categories.grains_staples');
    }
    if (legacyLower.includes('beverage') || legacyLower.includes('drink')) {
      return t('categories.beverages');
    }
    if (legacyLower.includes('snack')) {
      return t('categories.snacks');
    }
    if (legacyLower.includes('clean') || legacyLower.includes('household')) {
      return t('categories.household');
    }
    if (legacyLower.includes('personal') || legacyLower.includes('soap')) {
      return t('categories.personal_care');
    }

    return categoryId;
  };

  const getCategoryIcon = (categoryId: CategoryId | string): string => {
    const valid = CATEGORY_MAP[categoryId as CategoryId];
    if (valid) return valid.icon;

    const lower = (categoryId || '').toLowerCase();
    if (lower.includes('veg') || lower.includes('produce') || lower.includes('sabzi')) return 'eco';
    if (lower.includes('fruit') || lower.includes('phal')) return 'nutrition';
    if (lower.includes('dairy') || lower.includes('milk') || lower.includes('egg') || lower.includes('doodh')) return 'egg';
    if (lower.includes('meat') || lower.includes('gosht') || lower.includes('fish') || lower.includes('chicken')) return 'set_meal';
    if (lower.includes('bakery') || lower.includes('bread') || lower.includes('roti')) return 'bakery_dining';
    if (lower.includes('grain') || lower.includes('pantry') || lower.includes('rice') || lower.includes('chawal')) return 'inventory_2';
    if (lower.includes('drink') || lower.includes('tea') || lower.includes('chai') || lower.includes('beverage')) return 'local_cafe';
    if (lower.includes('snack') || lower.includes('biscuit') || lower.includes('chips')) return 'cookie';
    if (lower.includes('clean') || lower.includes('safai')) return 'cleaning_services';
    if (lower.includes('care') || lower.includes('soap') || lower.includes('sabun')) return 'soap';
    if (lower.includes('medic') || lower.includes('dawa')) return 'medication';

    return 'category';
  };

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      getCategoryName,
      getCategoryIcon,
      isRTL,
      dir,
    }),
    [language, isRTL, dir]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
