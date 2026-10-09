import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

export type AppThemeId =
  | 'default'
  | 'midnight'
  | 'sapphire'
  | 'terracotta'
  | 'amethyst'
  | 'rose'
  | 'custom';

export interface AppThemeOption {
  id: AppThemeId;
  name: string;
  nameUrdu: string;
  nameRomanUrdu: string;
  desc: string;
  descUrdu: string;
  descRomanUrdu: string;
  primary: string;
  accent: string;
  surface: string;
  badgeBg: string;
  badgeText: string;
  isDark?: boolean;
}

export interface CustomColorPalette {
  id: string;
  name: string;
  nameUrdu: string;
  nameRomanUrdu: string;
  primary: string;
  accent: string;
  surface: string;
}

export const CUSTOM_PALETTES: CustomColorPalette[] = [
  {
    id: 'teal',
    name: 'Mint Teal',
    nameUrdu: 'تازہ فیروزی',
    nameRomanUrdu: 'Mint Teal',
    primary: '#0d9488',
    accent: '#ccfbf1',
    surface: '#f0fdfa',
  },
  {
    id: 'indigo',
    name: 'Indigo Blue',
    nameUrdu: 'گہرا انڈیگو',
    nameRomanUrdu: 'Indigo Blue',
    primary: '#4338ca',
    accent: '#e0e7ff',
    surface: '#eef2ff',
  },
  {
    id: 'crimson',
    name: 'Ruby Crimson',
    nameUrdu: 'روبی سرخ',
    nameRomanUrdu: 'Ruby Crimson',
    primary: '#be123c',
    accent: '#ffe4e6',
    surface: '#fff1f2',
  },
  {
    id: 'amber',
    name: 'Golden Amber',
    nameUrdu: 'سنہری عنبر',
    nameRomanUrdu: 'Golden Amber',
    primary: '#b45309',
    accent: '#fef3c7',
    surface: '#fffbeb',
  },
];

export const PREINSTALLED_THEMES: AppThemeOption[] = [
  {
    id: 'default',
    name: 'Classic Green',
    nameUrdu: 'کلاسک ہرا',
    nameRomanUrdu: 'Classic Green',
    desc: 'Original YAAD evergreen palette',
    descUrdu: 'یاد کا اصل کلاسک ہرا رنگ',
    descRomanUrdu: 'YAAD ka asal classic sabz rang',
    primary: '#0F3D2E',
    accent: '#bcedd8',
    surface: '#f7faf5',
    badgeBg: '#bcedd8',
    badgeText: '#002117',
    isDark: false,
  },
  {
    id: 'midnight',
    name: 'Dark Mode',
    nameUrdu: 'ڈارک موڈ',
    nameRomanUrdu: 'Dark Mode',
    desc: 'High contrast night theme for easy reading',
    descUrdu: 'رات کے وقت آنکھوں کے لیے پرسکون ڈارک موڈ',
    descRomanUrdu: 'Raat k liye aasan dark mode',
    primary: '#10b981',
    accent: '#065f46',
    surface: '#0f172a',
    badgeBg: '#065f46',
    badgeText: '#d1fae5',
    isDark: true,
  },
  {
    id: 'sapphire',
    name: 'Ocean Blue',
    nameUrdu: 'سمندری نیلا',
    nameRomanUrdu: 'Ocean Blue',
    desc: 'Vibrant clean navy and sky blue',
    descUrdu: 'خوبصورت سمندری نیلا رنگ',
    descRomanUrdu: 'Khoobsurat samandari neela rang',
    primary: '#1d4ed8',
    accent: '#dbeafe',
    surface: '#f4f7fc',
    badgeBg: '#dbeafe',
    badgeText: '#172554',
    isDark: false,
  },
  {
    id: 'terracotta',
    name: 'Amber Orange',
    nameUrdu: 'عنبر نارنجی',
    nameRomanUrdu: 'Amber Orange',
    desc: 'Warm terracotta and golden spice',
    descUrdu: 'گرم نارنجی اور عنبر رنگ',
    descRomanUrdu: 'Garam narangi aur amber rang',
    primary: '#9a3412',
    accent: '#ffedd5',
    surface: '#fdfaf6',
    badgeBg: '#ffedd5',
    badgeText: '#431407',
    isDark: false,
  },
  {
    id: 'amethyst',
    name: 'Royal Purple',
    nameUrdu: 'جامنی',
    nameRomanUrdu: 'Royal Purple',
    desc: 'Regal velvet violet and soft lavender',
    descUrdu: 'شاندار شاہی جامنی رنگ',
    descRomanUrdu: 'Shaandar royal jamni rang',
    primary: '#6b21a8',
    accent: '#f3e8ff',
    surface: '#faf7fd',
    badgeBg: '#f3e8ff',
    badgeText: '#3b0764',
    isDark: false,
  },
  {
    id: 'rose',
    name: 'Rose Pink',
    nameUrdu: 'گلابی',
    nameRomanUrdu: 'Rose Pink',
    desc: 'Soft blossom petals and soothing rose',
    descUrdu: 'تازہ گلاب کا پیارا رنگ',
    descRomanUrdu: 'Taza gulab ka pyara rang',
    primary: '#9f1239',
    accent: '#ffe4e6',
    surface: '#fff7f8',
    badgeBg: '#ffe4e6',
    badgeText: '#4c0519',
    isDark: false,
  },
];

interface ThemeContextType {
  theme: AppThemeId;
  currentThemeConfig: AppThemeOption;
  setTheme: (themeId: AppThemeId) => void;
  themes: AppThemeOption[];
  customPalettes: CustomColorPalette[];
  selectedCustomPalette: CustomColorPalette;
  setSelectedCustomPalette: (paletteId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'yaad_app_theme';
const CUSTOM_PALETTE_STORAGE_KEY = 'yaad_custom_palette';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<AppThemeId>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (
        stored === 'default' ||
        stored === 'midnight' ||
        stored === 'sapphire' ||
        stored === 'terracotta' ||
        stored === 'amethyst' ||
        stored === 'rose' ||
        stored === 'custom'
      ) {
        return stored;
      }
    } catch {
      // ignore
    }
    return 'default';
  });

  const [customPaletteId, setCustomPaletteIdState] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(CUSTOM_PALETTE_STORAGE_KEY);
      if (CUSTOM_PALETTES.some((p) => p.id === stored)) {
        return stored!;
      }
    } catch {
      // ignore
    }
    return 'teal';
  });

  const selectedCustomPalette =
    CUSTOM_PALETTES.find((p) => p.id === customPaletteId) || CUSTOM_PALETTES[0];

  const currentThemeConfig: AppThemeOption =
    theme === 'custom'
      ? {
          id: 'custom',
          name: `Custom (${selectedCustomPalette.name})`,
          nameUrdu: `کسٹم (${selectedCustomPalette.nameUrdu})`,
          nameRomanUrdu: `Custom (${selectedCustomPalette.nameRomanUrdu})`,
          desc: 'Personalized color palette',
          descUrdu: 'آپ کی پسندیدہ کسٹم تھیم',
          descRomanUrdu: 'Aapki pasandida custom theme',
          primary: selectedCustomPalette.primary,
          accent: selectedCustomPalette.accent,
          surface: selectedCustomPalette.surface,
          badgeBg: selectedCustomPalette.accent,
          badgeText: '#0f172a',
          isDark: false,
        }
      : PREINSTALLED_THEMES.find((t) => t.id === theme) || PREINSTALLED_THEMES[0];

  // Apply theme attribute, CSS vars, and meta theme-color to document
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-app-theme', theme);
      if (currentThemeConfig.isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      if (theme === 'custom') {
        document.documentElement.style.setProperty('--color-primary', selectedCustomPalette.primary);
        document.documentElement.style.setProperty('--color-primary-container', selectedCustomPalette.primary);
        document.documentElement.style.setProperty('--color-primary-fixed', selectedCustomPalette.accent);
        document.documentElement.style.setProperty('--color-surface-tint', selectedCustomPalette.primary);
        document.documentElement.style.setProperty('--color-background', selectedCustomPalette.surface);
        document.documentElement.style.setProperty('--color-surface', selectedCustomPalette.surface);
      } else {
        document.documentElement.style.removeProperty('--color-primary');
        document.documentElement.style.removeProperty('--color-primary-container');
        document.documentElement.style.removeProperty('--color-primary-fixed');
        document.documentElement.style.removeProperty('--color-surface-tint');
        document.documentElement.style.removeProperty('--color-background');
        document.documentElement.style.removeProperty('--color-surface');
      }

      // Update mobile browser status bar color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          'content',
          currentThemeConfig.isDark ? '#090d16' : currentThemeConfig.primary,
        );
      }
    } catch (e) {
      console.warn('Could not apply theme to document:', e);
    }
  }, [theme, currentThemeConfig, selectedCustomPalette]);

  const setTheme = useCallback((themeId: AppThemeId) => {
    setThemeState(themeId);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    } catch (e) {
      console.warn('Could not persist theme:', e);
    }
  }, []);

  const setSelectedCustomPalette = useCallback((paletteId: string) => {
    setCustomPaletteIdState(paletteId);
    try {
      localStorage.setItem(CUSTOM_PALETTE_STORAGE_KEY, paletteId);
    } catch (e) {
      console.warn('Could not persist custom palette:', e);
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        currentThemeConfig,
        setTheme,
        themes: PREINSTALLED_THEMES,
        customPalettes: CUSTOM_PALETTES,
        selectedCustomPalette,
        setSelectedCustomPalette,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};
