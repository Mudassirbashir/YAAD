import { en } from './en';

/**
 * Urdu translation dictionary extending English base with localized keys.
 */
export const ur = {
  ...en,
  settings: {
    ...en.settings,
    languageUrdu: 'اردو',
    languageUrduSub: 'آسان اردو',
  },
  appUpdate: {
    ...en.appUpdate,
    title: 'یاد ایپ کی نئی اپ ڈیٹ',
    description: 'تازہ ترین بہتریوں اور تبدیلیوں کے لیے ابھی اپ ڈیٹ کریں۔',
    updateNow: 'ابھی اپ ڈیٹ کریں',
    later: 'بعد میں',
    offlineNotice: 'آپ آف لائن ہیں۔ یاد اپ ڈیٹ کرنے کے لیے انٹرنیٹ سے کنیکٹ کریں۔',
  },
};

