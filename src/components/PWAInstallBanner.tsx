import { useState, useEffect } from 'react';
import { X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';

const DISMISSED_KEY = 'pwa-banner-dismissed';

// iOS Safari에서만 true (Chrome iOS, Firefox iOS 제외)
function detectIOSSafari() {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isIOSSafari = isIOS && /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua);
  return isIOSSafari;
}

// 이미 홈 화면에서 실행 중인지 감지
function isRunningStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

export default function PWAInstallBanner() {
  const { canInstall, install, isInstalled } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [isIOSSafari, setIsIOSSafari] = useState(false);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISSED_KEY) === '1');
    setIsIOSSafari(detectIOSSafari());
    setStandalone(isRunningStandalone());
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  // 이미 설치됐거나, 닫혔거나, standalone 실행 중이면 숨김
  if (dismissed || isInstalled || standalone) return null;

  // iOS Safari: 수동 설치 안내 배너
  if (isIOSSafari) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-xl safe-area-bottom">
        <div className="flex items-start gap-3 px-4 py-3 max-w-lg mx-auto">
          <Smartphone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">앱처럼 빠르게 접속하세요</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              하단 <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
                <svg className="inline h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                공유
              </span>{' '}
              버튼 → <strong className="text-foreground">"홈 화면에 추가"</strong> 탭
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Chrome/Edge/Samsung Internet: 설치 버튼 배너
  if (canInstall) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-xl">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <Smartphone className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">앱처럼 빠르게 접속하세요</p>
            <p className="text-xs text-muted-foreground">홈 화면에 추가하면 더 빠르게 이용할 수 있어요</p>
          </div>
          <Button size="sm" onClick={install} className="shrink-0">
            설치
          </Button>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
