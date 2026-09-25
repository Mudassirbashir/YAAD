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
  | 'rose';

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

export const PREINSTALLED_THEMES: AppThemeOption[] = [
  {
    id: 'default',
    name: 'Classic Emerald (Default)',
    nameUrdu: 'کلاسک زمرد (اصل یاد)',
    nameRomanUrdu: 'Classic Emerald (Asal YAAD)',
    desc: 'Original YAAD evergreen palette with organic mint accents',
    descUrdu: 'یاد ایپ کا اصل کلاسک سبز اور پرسکون نیچرل انداز',
    descRomanUrdu: 'Asal YAAD classic sabz aur organic mint look',
    primary: '#0F3D2E',
    accent: '#bcedd8',
    surface: '#f7faf5',
    badgeBg: '#bcedd8',
    badgeText: '#002117',
    isDark: false,
  },
  {
    id: 'midnight',
    name: 'Midnight Slate (Night Mode)',
    nameUrdu: 'نائٹ موڈ (گہرا سلیٹ)',
    nameRomanUrdu: 'Midnight Slate (Night Mode)',
    desc: 'Deep obsidian night theme with luminous emerald glow',
    descUrdu: 'رات کے وقت آنکھوں کے لیے پرسکون گہرا اور دیدہ زیب موڈ',
    descRomanUrdu: 'Raat k liye behtareen dark slate aur glowing mint',
    primary: '#10b981',
    accent: '#065f46',
    surface: '#0f172a',
    badgeBg: '#065f46',
    badgeText: '#d1fae5',
    isDark: true,
  },
  {
    id: 'sapphire',
    name: 'Royal Sapphire',
    nameUrdu: 'شاہی نیلا (انڈیگو)',
    nameRomanUrdu: 'Royal Sapphire (Indigo)',
    desc: 'Prestigious deep navy blue with sky azure highlights',
    descUrdu: 'خوبصورت شاہی نیلا رنگ اور جدید سمندری چمک',
    descRomanUrdu: 'Khoobsurat royal navy aur fresh sky blue',
    primary: '#1d4ed8',
    accent: '#dbeafe',
    surface: '#f4f7fc',
    badgeBg: '#dbeafe',
    badgeText: '#172554',
    isDark: false,
  },
  {
    id: 'terracotta',
    name: 'Warm Terracotta',
    nameUrdu: 'گرم مٹی و عنبر (زعفرانی)',
    nameRomanUrdu: 'Warm Terracotta (Zafrani)',
    desc: 'Artisanal clay and desert spice with warm amber accents',
    descUrdu: 'دیسی مٹی، زعفران اور گرم مصالحہ جات کا روایتی خوبصورت رنگ',
    descRomanUrdu: 'Desi clay, amber aur garam zafrani touch',
    primary: '#9a3412',
    accent: '#ffedd5',
    surface: '#fdfaf6',
    badgeBg: '#ffedd5',
    badgeText: '#431407',
    isDark: false,
  },
  {
    id: 'amethyst',
    name: 'Amethyst Violet',
    nameUrdu: 'شاہی ارغوانی (جامنی)',
    nameRomanUrdu: 'Royal Amethyst (Jamni)',
    desc: 'Regal velvet violet paired with delicate lavender notes',
    descUrdu: 'شاندار شاہی جامنی اور نزاکت بھرا لیونڈر انداز',
    descRomanUrdu: 'Shaandar royal violet aur soft lavender',
    primary: '#6b21a8',
    accent: '#f3e8ff',
    surface: '#faf7fd',
    badgeBg: '#f3e8ff',
    badgeText: '#3b0764',
    isDark: false,
  },
  {
    id: 'rose',
    name: 'Rose Coral',
    nameUrdu: 'گلابی عقیق (مرجان)',
    nameRomanUrdu: 'Rose Coral (Gulabi)',
    desc: 'Vibrant blossom petals and soothing rose quartz tones',
    descUrdu: 'تازہ گلاب کی پتیوں جیسا خوبصورت اور نکھرا ہوا انداز',
    descRomanUrdu: 'Taza gulab aur warm coral ka pyaara look',
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
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'yaad_app_theme';

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
        stored === 'rose'
      ) {
        return stored;
      }
    } catch {
      // ignore
    }
    return 'default';
  });

  const currentThemeConfig =
    PREINSTALLED_THEMES.find((t) => t.id === theme) || PREINSTALLED_THEMES[0];

  // Apply theme attribute and meta theme-color to document
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-app-theme', theme);
      if (currentThemeConfig.isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
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
  }, [theme, currentThemeConfig]);

  const setTheme = useCallback((themeId: AppThemeId) => {
    setThemeState(themeId);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    } catch (e) {
      console.warn('Could not persist theme:', e);
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        currentThemeConfig,
        setTheme,
        themes: PREINSTALLED_THEMES,
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
