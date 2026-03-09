import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "@fontsource-variable/outfit"; // 자체 호스팅 폰트 (Google Fonts CDN 대체)
import "@fontsource-variable/inter";
import "@fontsource/noto-sans-kr";
import "@fontsource/noto-sans-jp";
import "@fontsource/nanum-gothic";
import "@fontsource/roboto";
import "@fontsource-variable/nunito";
import "./index.css";
import "./i18n/config"; // Initialize i18n

// 새로고침 시 lang 속성을 React 렌더 전에 미리 설정 (일본어 등 CJK break-keep 버그 방지)
// i18next initialized 이벤트가 .init() 도중 동기적으로 발생하여 리스너 등록 전에 이미 소비되므로,
// localStorage에서 직접 읽어 html[lang] 속성을 조기 적용한다.
const _storedLang = localStorage.getItem('i18nextLng');
if (_storedLang && ['ko', 'en', 'ja', 'pt', 'es'].includes(_storedLang)) {
  document.documentElement.lang = _storedLang;
}

// Capture beforeinstallprompt BEFORE React mounts so we never miss it
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as any).__pwaInstallPrompt = e;
  window.dispatchEvent(new Event('pwaInstallReady'));
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
