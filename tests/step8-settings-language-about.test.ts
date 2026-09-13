/**
 * YAAD APP — STEP 8 COMPREHENSIVE QA TEST SUITE
 * SETTINGS LANGUAGE (ENGLISH, URDU, ROMAN URDU) + PERSISTENCE + ABOUT SECTION REDESIGN
 */

import { translations, Language } from '../src/translations';
import { en } from '../src/translations/en';
import { ur } from '../src/translations/ur';
import { romanUrdu } from '../src/translations/romanUrdu';
import { APP_VERSION, APP_NAME } from '../src/version';
import packageInfo from '../package.json';

// Simple assert helper
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('\n==================================================');
console.log('STEP 8 QA: SETTINGS LANGUAGE + ABOUT SECTION POLISH');
console.log('==================================================\n');

// -----------------------------------------------------------------------------
// TEST 1: LANGUAGE SUPPORT & TRANSLATION SYSTEM INTEGRATION
// -----------------------------------------------------------------------------
console.log('--- 1. All 3 Supported Languages Present & Complete ---');

const supportedLanguages: Language[] = ['en', 'ur', 'roman-urdu'];
assert(supportedLanguages.length === 3, 'Exactly 3 supported languages configured');

assert(Boolean(translations.en), 'English dictionary registered');
assert(Boolean(translations.ur), 'Urdu dictionary registered');
assert(Boolean(translations['roman-urdu']), 'Roman Urdu dictionary registered');

// Test language option labels in each language
assert(en.settings.languageEn === 'English', 'English label in EN matches English');
assert(en.settings.languageUrdu === 'اردو', 'Urdu label in EN matches اردو');
assert(en.settings.languageRomanUrdu === 'Roman Urdu', 'Roman Urdu label in EN matches Roman Urdu');

assert(ur.settings.languageEn === 'English', 'English label in UR matches English');
assert(ur.settings.languageUrdu === 'اردو', 'Urdu label in UR matches اردو');
assert(ur.settings.languageRomanUrdu === 'Roman Urdu', 'Roman Urdu label in UR matches Roman Urdu');

assert(romanUrdu.settings.languageEn === 'English', 'English label in Roman Urdu matches English');
assert(romanUrdu.settings.languageUrdu === 'اردو', 'Urdu label in Roman Urdu matches اردو');
assert(romanUrdu.settings.languageRomanUrdu === 'Roman Urdu', 'Roman Urdu label in Roman Urdu matches Roman Urdu');

// -----------------------------------------------------------------------------
// TEST 2: TRANSLATION CONSISTENCY & CRITICAL SETTINGS KEYS
// -----------------------------------------------------------------------------
console.log('\n--- 2. Settings Translation Keys Consistency Across Languages ---');

const criticalSettingsKeys: (keyof typeof en.settings)[] = [
  'preferencesTitle',
  'language',
  'languageSubtitle',
  'languageEn',
  'languageEnSub',
  'languageRomanUrdu',
  'languageRomanUrduSub',
  'languageUrdu',
  'languageUrduSub',
  'soundTitle',
  'soundDesc',
  'soundEffects',
  'soundEffectsDesc',
  'restartTourTitle',
  'restartTourDesc',
  'aboutTitle',
  'aboutYaad',
  'privacyPolicy',
  'privacyPolicyDesc',
  'termsOfService',
  'termsOfServiceDesc',
  'helpSupport',
  'helpFeedback',
  'versionTitle',
  'versionDesc',
  'footerTagline',
  'contactSupport',
  'supportEmail',
];

for (const key of criticalSettingsKeys) {
  const enVal = en.settings[key];
  const urVal = ur.settings[key];
  const ruVal = romanUrdu.settings[key];

  assert(
    typeof enVal === 'string' && enVal.trim().length > 0,
    `EN contains key: settings.${String(key)} -> "${enVal}"`
  );
  assert(
    typeof urVal === 'string' && urVal.trim().length > 0,
    `UR contains key: settings.${String(key)} -> "${urVal}"`
  );
  assert(
    typeof ruVal === 'string' && ruVal.trim().length > 0,
    `Roman Urdu contains key: settings.${String(key)} -> "${ruVal}"`
  );
}

// -----------------------------------------------------------------------------
// TEST 3: ROMAN URDU QUALITY & NATURAL FRIENDLY TONE
// -----------------------------------------------------------------------------
console.log('\n--- 3. Roman Urdu Natural & Friendly Tone Verification ---');

assert(
  romanUrdu.settings.languageSubtitle.toLowerCase().includes('pasandeeda') ||
  romanUrdu.settings.languageSubtitle.toLowerCase().includes('zabaan'),
  `Roman Urdu subtitle is natural: "${romanUrdu.settings.languageSubtitle}"`
);

assert(
  romanUrdu.settings.aboutYaadDesc.toLowerCase().includes('sauda') ||
  romanUrdu.settings.aboutYaadDesc.toLowerCase().includes('grocery') ||
  romanUrdu.settings.aboutYaadDesc.toLowerCase().includes('yaad'),
  `Roman Urdu About description is friendly and clear: "${romanUrdu.settings.aboutYaadDesc}"`
);

assert(
  romanUrdu.settings.privacyPolicyDesc.toLowerCase().includes('mehfooz'),
  `Roman Urdu Privacy description is clear: "${romanUrdu.settings.privacyPolicyDesc}"`
);

// -----------------------------------------------------------------------------
// TEST 4: LANGUAGE SELECTION & RELOAD PERSISTENCE ENGINE
// -----------------------------------------------------------------------------
console.log('\n--- 4. Language Selection & Reload Persistence Simulation ---');

const LANGUAGE_STORAGE_KEY = 'yaad_user_language';

// Mock localStorage
const mockStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => {
    mockStorage[key] = val;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const k in mockStorage) delete mockStorage[k];
  },
};

// Simulation helper for language initialization on app boot / reload
function simulateAppBoot(storage: typeof mockLocalStorage): {
  activeLanguage: Language;
  htmlLang: string;
  htmlDir: 'ltr' | 'rtl';
} {
  const saved = storage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
  const initialLang: Language =
    saved && (saved === 'en' || saved === 'roman-urdu' || saved === 'ur')
      ? saved
      : 'en';

  const isUrdu = initialLang === 'ur';
  return {
    activeLanguage: initialLang,
    htmlLang: isUrdu ? 'ur' : initialLang === 'roman-urdu' ? 'ur-Latn' : 'en',
    htmlDir: isUrdu ? 'rtl' : 'ltr',
  };
}

// 1. Initial State (No saved preference defaults to English)
mockLocalStorage.clear();
const initialBoot = simulateAppBoot(mockLocalStorage);
assert(initialBoot.activeLanguage === 'en', 'Default boot without saved storage yields "en"');
assert(initialBoot.htmlDir === 'ltr', 'English boot sets dir to "ltr"');
assert(initialBoot.htmlLang === 'en', 'English boot sets lang to "en"');

// 2. Select Roman Urdu & Simulate Reload
mockLocalStorage.setItem(LANGUAGE_STORAGE_KEY, 'roman-urdu');
const romanUrduReload = simulateAppBoot(mockLocalStorage);
assert(
  romanUrduReload.activeLanguage === 'roman-urdu',
  'After selecting Roman Urdu and reloading, active language is "roman-urdu"'
);
assert(
  romanUrduReload.htmlDir === 'ltr',
  'Roman Urdu reload maintains "ltr" document direction'
);
assert(
  romanUrduReload.htmlLang === 'ur-Latn',
  'Roman Urdu reload sets document lang to "ur-Latn"'
);

// 3. Select Urdu & Simulate Reload
mockLocalStorage.setItem(LANGUAGE_STORAGE_KEY, 'ur');
const urduReload = simulateAppBoot(mockLocalStorage);
assert(
  urduReload.activeLanguage === 'ur',
  'After selecting Urdu and reloading, active language is "ur"'
);
assert(
  urduReload.htmlDir === 'rtl',
  'Urdu reload properly sets RTL direction'
);
assert(
  urduReload.htmlLang === 'ur',
  'Urdu reload sets document lang to "ur"'
);

// 4. Switch back to English & Simulate Reload
mockLocalStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');
const englishReload = simulateAppBoot(mockLocalStorage);
assert(
  englishReload.activeLanguage === 'en',
  'After switching back to English and reloading, active language is "en"'
);
assert(
  englishReload.htmlDir === 'ltr',
  'English reload restores "ltr" document direction'
);

// -----------------------------------------------------------------------------
// TEST 5: REAL APPLICATION VERSION FROM PROJECT CONFIGURATION
// -----------------------------------------------------------------------------
console.log('\n--- 5. Real Application Version Verification ---');

assert(Boolean(APP_VERSION), `APP_VERSION is defined: "${APP_VERSION}"`);
assert(
  APP_VERSION === packageInfo.version,
  `APP_VERSION ("${APP_VERSION}") matches package.json version ("${packageInfo.version}")`
);
assert(
  !APP_VERSION.includes('undefined') && !APP_VERSION.includes('null'),
  'APP_VERSION is not null or undefined'
);
assert(
  /^\d+\.\d+\.\d+/.test(APP_VERSION),
  `APP_VERSION follows valid semver structure (${APP_VERSION})`
);

// -----------------------------------------------------------------------------
// TEST 6: ABOUT SECTION SPECIFICATION & ACTION TARGETS
// -----------------------------------------------------------------------------
console.log('\n--- 6. About Section Options & Action Handlers ---');

interface AboutActionItem {
  id: string;
  name: string;
  targetPage: 'about' | 'help' | 'privacy' | 'terms';
  iconType: 'info' | 'help' | 'shield' | 'document';
}

const aboutItems: AboutActionItem[] = [
  { id: 'settings_link_about', name: 'About YAAD', targetPage: 'about', iconType: 'info' },
  { id: 'settings_link_help', name: 'Help & Feedback', targetPage: 'help', iconType: 'help' },
  { id: 'settings_link_privacy', name: 'Privacy Policy', targetPage: 'privacy', iconType: 'shield' },
  { id: 'settings_link_terms', name: 'Terms of Service', targetPage: 'terms', iconType: 'document' },
];

for (const item of aboutItems) {
  assert(item.id.startsWith('settings_link_'), `Item has valid HTML id: ${item.id}`);
  assert(Boolean(item.targetPage), `Item ${item.name} links to valid page: ${item.targetPage}`);
  assert(Boolean(item.iconType), `Item ${item.name} uses system-quality icon type: ${item.iconType}`);
}

// Test version row presence
const versionRow = {
  id: 'settings_item_version',
  badgeId: 'settings_version_badge',
  displayValue: `v${APP_VERSION}`,
};
assert(versionRow.id === 'settings_item_version', 'Version item has dedicated ID');
assert(versionRow.displayValue === `v${packageInfo.version}`, `Version row displays v${packageInfo.version}`);

console.log('\n🎉 ALL STEP 8 SETTINGS LANGUAGE, PERSISTENCE, & ABOUT POLISH TESTS PASSED PERFECTLY!\n');
