import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { InstallAppModal } from './InstallAppModal';

interface InstallPromptBannerProps {
  onOpenModal?: () => void;
  externalPrompt?: any;
}

export const InstallPromptBanner: React.FC<InstallPromptBannerProps> = ({
  onOpenModal
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      return; // Already running as an installed standalone app
    }

    // Check iOS or Android or Desktop
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isMobile = /iphone|ipad|ipod|android/.test(userAgent);

    // Listen for beforeinstallprompt (Android / Chrome / Edge)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!sessionStorage.getItem('dismiss_install')) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Show banner on mobile devices if not dismissed
    if (isMobile && !sessionStorage.getItem('dismiss_install')) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setShowBanner(false);
          setDeferredPrompt(null);
          return;
        }
      } catch (err) {
        console.warn('Native prompt failed:', err);
      }
    }
    // Fallback: Show interactive multi-platform install guide
    if (onOpenModal) {
      onOpenModal();
    } else {
      setShowModal(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('dismiss_install', 'true');
  };

  return (
    <>
      {showBanner && (
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white px-4 py-2 text-xs flex items-center justify-between shadow-md sticky top-0 z-50">
          <div className="flex items-center space-x-2.5 min-w-0 pr-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-extrabold truncate tracking-tight">Install ScanGuard AI App</p>
              <p className="text-[10px] text-blue-100 truncate">
                Install on your phone or PC for fullscreen camera checkout
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-lg bg-white text-blue-700 font-extrabold text-xs shadow-sm hover:bg-blue-50 transition active:scale-95 flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg hover:bg-blue-800 text-blue-200 hover:text-white transition"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Embedded Modal fallback */}
      <InstallAppModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        deferredPrompt={deferredPrompt}
        onNativePromptSuccess={() => {
          setShowBanner(false);
          setDeferredPrompt(null);
        }}
      />
    </>
  );
};
