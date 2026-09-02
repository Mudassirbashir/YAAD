import { en } from './en';
import { romanUrdu } from './romanUrdu';
import { ur } from './ur';

export type Language = 'en' | 'roman-urdu' | 'ur';

export const translations = {
  en,
  'roman-urdu': romanUrdu,
  ur,
};

export { en, romanUrdu, ur };
