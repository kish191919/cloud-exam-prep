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
import ptCommon from './locales/pt/common.json';
import ptPages from './locales/pt/pages.json';
import ptExam from './locales/pt/exam.json';
import ptAuth from './locales/pt/auth.json';
import esCommon from './locales/es/common.json';
import esPages from './locales/es/pages.json';
import esExam from './locales/es/exam.json';
import esAuth from './locales/es/auth.json';
import jaCommon from './locales/ja/common.json';
import jaPages from './locales/ja/pages.json';
import jaExam from './locales/ja/exam.json';
import jaAuth from './locales/ja/auth.json';

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
  pt: {
    common: ptCommon,
    pages: ptPages,
    exam: ptExam,
    auth: ptAuth,
  },
  es: {
    common: esCommon,
    pages: esPages,
    exam: esExam,
    auth: esAuth,
  },
  ja: {
    common: jaCommon,
    pages: jaPages,
    exam: jaExam,
    auth: jaAuth,
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

// HTML lang 속성 동기화 — CSS :lang() 선택자 활성화
i18n.on('initialized', () => {
  document.documentElement.lang = i18n.language;
});
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;
