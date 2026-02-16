import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import koCommon from './locales/ko/common.json';
import koPages from './locales/ko/pages.json';
import koExam from './locales/ko/exam.json';
import koAuth from './locales/ko/auth.json';
import enCommon from './locales/en/common.json';
import enPages from './locales/en/pages.json';
import enExam from './locales/en/exam.json';
import enAuth from './locales/en/auth.json';

export const resources = {
  ko: {
    common: koCommon,
    pages: koPages,
    exam: koExam,
    auth: koAuth,
  },
  en: {
    common: enCommon,
    pages: enPages,
    exam: enExam,
    auth: enAuth,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: 'common',
    ns: ['common', 'pages', 'exam', 'auth'],
    fallbackLng: 'ko',
    lng: 'ko',

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
