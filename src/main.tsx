import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config"; // Initialize i18n

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

createRoot(document.getElementById("root")!).render(<App />);
