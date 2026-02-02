'use client';

import { useEffect, useState, useCallback } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice?: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const STORAGE_KEY = 'acclownting-pwa-install-dismissed-v1';

function isIOSSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent || '';
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const webkit = /WebKit/.test(ua);
  return iOS && webkit && !/(CriOS|FxiOS|OPiOS|mercury)/.test(ua);
}

function getIsStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const dm = window.matchMedia?.('(display-mode: standalone)').matches;
    const navStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    return !!dm || !!navStandalone;
  } catch {
    return false;
  }
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    setIsIOS(isIOSSafari());
    setIsInstalled(getIsStandalone());

    if (dismissed || getIsStandalone()) return;

    if (isIOSSafari()) {
      setShowBanner(true);
      return;
    }

    function onBeforeInstallPrompt(e: Event) {
      try {
        (e as BeforeInstallPromptEvent).preventDefault?.();
      } catch {
        // ignore
      }
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    }

    function onAppInstalled() {
      setIsInstalled(true);
      setShowBanner(false);
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
    setDismissed(true);
    setShowBanner(false);
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
    } catch {
      // ignore
    } finally {
      setShowBanner(false);
    }
  }, [deferredPrompt]);

  if (dismissed || isInstalled || !showBanner) return null;

  if (isIOS) {
    return (
      <div className="fixed bottom-4 inset-x-4 z-50 animate-slide-up">
        <div className="mx-auto max-w-lg rounded-2xl bg-card border border-border shadow-modal p-4 flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-foreground text-sm">Install Acclownting</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Tap <ShareIcon className="w-4 h-4 inline-block mx-0.5 text-primary" /> then{' '}
              <strong className="text-foreground">&quot;Add to Home Screen&quot;</strong>
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Use Safari (not private browsing) for best results
            </p>
          </div>
          <button
            aria-label="Dismiss install banner"
            onClick={handleDismiss}
            className="shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <XIcon className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 inset-x-4 z-50 animate-slide-up">
      <div className="mx-auto max-w-md rounded-2xl bg-card border border-border shadow-modal p-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground text-sm">Install Acclownting</div>
          <p className="text-xs text-muted-foreground">Get the full app experience</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            disabled={!deferredPrompt}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <DownloadIcon className="w-4 h-4" />
            Install
          </button>
          <button
            aria-label="Dismiss install banner"
            onClick={handleDismiss}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <XIcon className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PWAInstallBanner;
