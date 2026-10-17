import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Monitor, 
  Download, 
  Share2, 
  PlusSquare, 
  MoreVertical, 
  CheckCircle, 
  Camera, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
  onNativePromptSuccess?: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onNativePromptSuccess
}) => {
  // Detect platform
  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent.toLowerCase() : '';
  const isApple = /iphone|ipad|ipod|macintosh/.test(userAgent) && !/windows/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const initialPlatform: 'android' | 'ios' | 'desktop' = isApple ? 'ios' : isAndroid ? 'android' : 'desktop';

  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>(initialPlatform);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          onNativePromptSuccess?.();
          onClose();
        }
      } catch (err) {
        console.warn('Native prompt error:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Install ScanGuard AI</h2>
              <p className="text-xs text-blue-100">Standalone App & Fullscreen Barcode Scanner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {/* Quick Native Install Button (if browser event supported) */}
          {deferredPrompt && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div className="space-y-0.5 pr-2">
                <p className="text-xs font-bold text-blue-900">Direct 1-Click Install Available</p>
                <p className="text-[11px] text-blue-700">Your browser supports one-click native installation.</p>
              </div>
              <button
                onClick={handleNativeInstall}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition active:scale-95 flex items-center gap-1.5 shrink-0 shadow-md shadow-blue-500/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install Now</span>
              </button>
            </div>
          )}

          {/* Platform Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveTab('android')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition ${
                activeTab === 'android' ? 'bg-white text-blue-700 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android</span>
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition ${
                activeTab === 'ios' ? 'bg-white text-blue-700 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>iOS / Safari</span>
            </button>
            <button
              onClick={() => setActiveTab('desktop')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition ${
                activeTab === 'desktop' ? 'bg-white text-blue-700 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>PC / Mac</span>
            </button>
          </div>

          {/* Tab 1: Android Instructions */}
          {activeTab === 'android' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-medium">Follow these 3 quick steps in Google Chrome or Edge:</p>
              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    Tap the <strong>three dots menu</strong> <MoreVertical className="w-3.5 h-3.5 inline text-blue-600" /> in the top-right corner of Chrome.
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong> from the menu list.
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    Tap <strong>"Install"</strong> in the popup. ScanGuard AI will be added to your home screen and app drawer!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: iOS Instructions */}
          {activeTab === 'ios' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-medium">Follow these steps in Apple Safari on your iPhone or iPad:</p>
              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    Tap the <strong>Share</strong> button <Share2 className="w-3.5 h-3.5 inline text-blue-600" /> in Safari's bottom toolbar.
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    Scroll down through the share options and tap <strong>"Add to Home Screen"</strong> <PlusSquare className="w-3.5 h-3.5 inline text-blue-600" />.
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    Tap <strong>"Add"</strong> in the top-right corner. The ScanGuard icon will appear directly on your home screen!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Desktop Instructions */}
          {activeTab === 'desktop' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-medium">Install as a native desktop application in Chrome, Edge, or Brave:</p>
              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    Click the <strong>Install App icon</strong> (a computer screen with arrow or <Download className="w-3.5 h-3.5 inline text-blue-600" />) on the right side of your browser address bar.
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    Or click browser menu <MoreVertical className="w-3.5 h-3.5 inline text-blue-600" /> &gt; <strong>Save and share</strong> &gt; <strong>Install ScanGuard AI</strong>.
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    Click <strong>Install</strong>. The app launches in a clean, standalone window without URL bars!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* App Advantages */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Why Install as an App?</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-1">
                <Camera className="w-4 h-4 text-blue-600 mx-auto" />
                <p className="text-[10px] font-bold text-slate-800">Fullscreen</p>
                <p className="text-[9px] text-slate-500 leading-tight">No browser bars blocking camera</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-1">
                <Zap className="w-4 h-4 text-amber-500 mx-auto" />
                <p className="text-[10px] font-bold text-slate-800">Instant Launch</p>
                <p className="text-[9px] text-slate-500 leading-tight">Cached assets load immediately</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-1">
                <CheckCircle className="w-4 h-4 text-emerald-600 mx-auto" />
                <p className="text-[10px] font-bold text-slate-800">Auto Sync</p>
                <p className="text-[9px] text-slate-500 leading-tight">Keeps your cart session alive</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">PWA v1.0 • HTTPS Verified</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
