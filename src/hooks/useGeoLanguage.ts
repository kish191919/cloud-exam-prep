import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const GEO_CACHE_KEY = 'geo_lang_detected';

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
    if (savedLang === 'ko' || savedLang === 'en') {
      localStorage.setItem(GEO_CACHE_KEY, 'cached');
      return;
    }

    // 브라우저 언어가 명확히 한국어면 바로 적용
    const browserLang = navigator.language || '';
    if (browserLang.startsWith('ko')) {
      i18n.changeLanguage('ko');
      localStorage.setItem(GEO_CACHE_KEY, 'browser');
      return;
    }

    // 브라우저 언어가 명확히 다른 언어면 영어로 적용
    // (단, 브라우저 언어가 없거나 불분명한 경우 geo-IP로 최종 판단)
    if (browserLang && !browserLang.startsWith('ko')) {
      i18n.changeLanguage('en');
      localStorage.setItem(GEO_CACHE_KEY, 'browser');
      return;
    }

    // 브라우저 언어를 확인할 수 없는 경우에만 IP 국가 감지
    fetch('https://api.country.is/')
      .then(r => r.json())
      .then((data: { country?: string }) => {
        const lang = data.country === 'KR' ? 'ko' : 'en';
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
