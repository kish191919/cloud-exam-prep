import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(
    // Pick up event captured before React mounted
    () => (window as any).__pwaInstallPrompt ?? null
  );
  const [isInstalled, setIsInstalled] = useState(
    () => window.matchMedia('(display-mode: standalone)').matches
  );

  useEffect(() => {
    if (isInstalled) return;

    const onReady = () => {
      const e = (window as any).__pwaInstallPrompt;
      if (e) setPromptEvent(e);
    };
    window.addEventListener('pwaInstallReady', onReady);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setPromptEvent(null);
    });
    return () => window.removeEventListener('pwaInstallReady', onReady);
  }, [isInstalled]);

  const install = async () => {
    if (!promptEvent) return false;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      setPromptEvent(null);
      setIsInstalled(true);
      (window as any).__pwaInstallPrompt = null;
      return true;
    }
    return false;
  };

  return {
    canInstall: !!promptEvent && !isInstalled,
    isInstalled,
    install,
  };
}
