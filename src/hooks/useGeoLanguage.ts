import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const GEO_CACHE_KEY = 'geo_lang_detected';

const SUPPORTED_LANGS = ['ko', 'en', 'pt', 'es'];

const COUNTRY_LANG: Record<string, string> = {
  KR: 'ko',
  // Portuguese-speaking countries
  BR: 'pt', PT: 'pt', AO: 'pt', MZ: 'pt', CV: 'pt', GW: 'pt', ST: 'pt', TL: 'pt',
  // Spanish-speaking countries
  MX: 'es', ES: 'es', AR: 'es', CO: 'es', CL: 'es',
  PE: 'es', VE: 'es', EC: 'es', UY: 'es', PY: 'es',
  BO: 'es', DO: 'es', HN: 'es', SV: 'es', GT: 'es',
  NI: 'es', CR: 'es', PA: 'es', CU: 'es', GQ: 'es',
};

function detectBrowserLang(lang: string): string | null {
  if (!lang) return null;
  if (lang.startsWith('ko')) return 'ko';
  if (lang.startsWith('pt')) return 'pt';
  if (lang.startsWith('es')) return 'es';
  return 'en';
}

/**
 * 첫 방문 시 브라우저 언어 또는 IP 국가 기반으로 언어를 자동 설정.
 * 우선순위: 1) localStorage 저장값 → 2) 브라우저 언어 → 3) IP 국가 감지
 * 사용자가 LanguageSwitcher로 직접 전환하면 그 선택이 localStorage에 저장되어
 * 이 훅은 두 번째 방문부터 실행되지 않음.
 */
export function useGeoLanguage() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // 이미 geo 감지를 완료한 적 있으면 스킵
    if (localStorage.getItem(GEO_CACHE_KEY)) return;

    // localStorage에 사용자가 직접 선택한 언어가 있으면 스킵
    const savedLang = localStorage.getItem('i18nextLng');
    if (savedLang && SUPPORTED_LANGS.includes(savedLang)) {
      localStorage.setItem(GEO_CACHE_KEY, 'cached');
      return;
    }

    // 브라우저 언어로 감지
    const browserLang = navigator.language || '';
    const detected = detectBrowserLang(browserLang);
    if (detected) {
      i18n.changeLanguage(detected);
      localStorage.setItem(GEO_CACHE_KEY, 'browser');
      return;
    }

    // 브라우저 언어를 확인할 수 없는 경우에만 IP 국가 감지
    fetch('https://api.country.is/')
      .then(r => r.json())
      .then((data: { country?: string }) => {
        const lang = data.country ? (COUNTRY_LANG[data.country] ?? 'en') : 'en';
        i18n.changeLanguage(lang);
        localStorage.setItem(GEO_CACHE_KEY, 'geo');
      })
      .catch(() => {
        // API 실패 시 폴백: fallbackLng('ko') 유지
        localStorage.setItem(GEO_CACHE_KEY, 'fallback');
      });
  }, [i18n]);
}

export const GEO_LANG_CACHE_KEY = GEO_CACHE_KEY;
