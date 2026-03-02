import { useState, useEffect } from 'react';
import { X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';

const DISMISSED_UNTIL_KEY = 'pwa-banner-dismissed-until';
const DISMISS_DAYS = 7;

// iOS Safari에서만 true (Chrome iOS, Firefox iOS 제외)
function detectIOSSafari() {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  return isIOS && /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua);
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

  // 모든 상태를 동기적으로 초기화 → 첫 렌더부터 올바른 값
  const [dismissed, setDismissed] = useState(() => {
    const until = localStorage.getItem(DISMISSED_UNTIL_KEY);
    return until ? Date.now() < parseInt(until) : false;
  });
  const [isIOSSafari] = useState(() => detectIOSSafari());
  const [standalone] = useState(() => isRunningStandalone());
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  // 창 크기 변경 시 모바일 여부 재감지
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleDismiss = () => {
    const expiry = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISSED_UNTIL_KEY, String(expiry));
    setDismissed(true);
  };

  // 인라인 스타일: 모바일에서는 탭바(3.5rem) 위, 데스크톱은 bottom-0
  const bannerStyle: React.CSSProperties = {
    bottom: isMobile ? 'calc(3.5rem + env(safe-area-inset-bottom, 0px))' : 0,
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  };

  // 이미 설치됐거나, 닫혔거나, standalone 실행 중이면 숨김
  if (dismissed || isInstalled || standalone) return null;

  // iOS Safari: 수동 설치 안내 배너
  if (isIOSSafari) {
    return (
      <div
        className="fixed left-0 right-0 z-[9999] bg-card border-t border-border shadow-xl"
        style={bannerStyle}
      >
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
      <div
        className="fixed left-0 right-0 z-[9999] bg-card border-t border-border shadow-xl"
        style={bannerStyle}
      >
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
