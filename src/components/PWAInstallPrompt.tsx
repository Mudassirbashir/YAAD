import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Share, PlusSquare, Smartphone, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../lib/usePWAInstall';
import { useLanguage } from '../context/LanguageContext';
import { APP_IMAGES } from '../data/initialData';

interface PWAInstallPromptProps {
  mode?: 'banner' | 'settings_card' | 'inline';
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ mode = 'banner' }) => {
  const { isInstalled, isIOS, canPrompt, showBanner, promptInstall, dismissBanner } = usePWAInstall();
  const { language } = useLanguage();
  const isUrdu = language === 'ur';
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);

  const handleInstallClick = async () => {
    if (canPrompt) {
      setIsInstalling(true);
      try {
        await promptInstall();
      } finally {
        setIsInstalling(false);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  // Settings Card Mode: Always accessible inside Settings view
  if (mode === 'settings_card') {
    return (
      <div id="pwa_settings_install_row" className="bg-surface-container-lowest border border-surface-dim/70 rounded-2xl p-4 transition-all">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-on-surface font-['Plus_Jakarta_Sans']">
                {isUrdu ? 'ایپ انسٹالیشن (PWA)' : 'PWA App Installation'}
              </h4>
              <p className="text-xs text-on-surface-variant font-['Manrope']">
                {isInstalled
                  ? isUrdu
                    ? 'ایپ کامیابی کے ساتھ آپ کے آلے پر انسٹال ہے'
                    : 'YAAD is installed and running natively'
                  : isUrdu
                  ? 'ہوم اسکرین پر شامل کریں اور آف لائن استعمال کریں'
                  : 'Install to home screen for offline access'}
              </p>
            </div>
          </div>

          <div>
            {isInstalled ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isUrdu ? 'انسٹال شدہ' : 'Installed'}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container active:scale-95 transition-all shadow-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                {isUrdu ? 'انسٹال کریں' : 'Install App'}
              </button>
            )}
          </div>
        </div>

        {/* iOS Safari Guide Modal */}
        <AnimatePresence>
          {showIOSModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface-container-lowest border border-surface-dim rounded-2xl p-6 max-w-sm w-full shadow-xl"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-base text-primary font-['Plus_Jakarta_Sans']">
                    {isUrdu ? 'آئی فون پر انسٹال کریں' : 'Install on iPhone / iPad'}
                  </h3>
                  <button
                    onClick={() => setShowIOSModal(false)}
                    className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container-low"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs text-on-surface font-['Manrope']">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-container-low">
                    <Share className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>
                      {isUrdu
                        ? '1. نیچے سفاری میں شیئر بٹن (Share) پر ٹیپ کریں۔'
                        : '1. Tap the Share button at the bottom of Safari.'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-container-low">
                    <PlusSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>
                      {isUrdu
                        ? '2. نیچے اسکرول کر کے "Add to Home Screen" منتخب کریں۔'
                        : '2. Scroll down and tap "Add to Home Screen".'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowIOSModal(false)}
                  className="mt-5 w-full py-2.5 bg-primary text-on-primary rounded-xl font-bold text-xs"
                >
                  {isUrdu ? 'سمجھ گیا' : 'Got it'}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Banner Mode (displayed on Home screen when installable and not dismissed)
  if (!showBanner) return null;

  return (
    <>
      <div id="pwa_install_banner" className="mb-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-container via-[#003527] to-primary p-3.5 sm:p-4 text-white shadow-[0_6px_20px_rgba(0,30,21,0.12)] border border-primary/20">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/10 p-1.5 shrink-0 flex items-center justify-center border border-white/10 backdrop-blur-xs">
                <img
                  src={APP_IMAGES.logoTransparent}
                  alt="YAAD"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold font-['Plus_Jakarta_Sans'] leading-tight truncate">
                  {isUrdu ? 'یاد (YAAD) ایپ انسٹال کریں' : 'Install YAAD App'}
                </h4>
                <p className="text-[11px] text-white/80 font-['Manrope'] leading-tight mt-0.5 truncate">
                  {isUrdu
                    ? 'ہوم اسکرین پر شامل کریں اور تیز رفتار آف لائن استعمال کریں'
                    : 'Add to home screen for faster, offline access'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="px-3 py-1.5 rounded-xl bg-white text-primary text-xs font-bold hover:bg-white/90 active:scale-95 transition-all shadow-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'انسٹال' : 'Install'}</span>
              </button>
              <button
                type="button"
                onClick={dismissBanner}
                aria-label="Dismiss install banner"
                className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* iOS Safari Guide Modal */}
      <AnimatePresence>
        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest border border-surface-dim rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-base text-primary font-['Plus_Jakarta_Sans']">
                    {isUrdu ? 'آئی فون پر انسٹال کریں' : 'Install on iPhone / iPad'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSModal(false)}
                  className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container-low"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-on-surface font-['Manrope']">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-low">
                  <Share className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>
                    {isUrdu
                      ? '1. سفاری کے نیچے موجود شیئر بٹن (Share) پر ٹیپ کریں۔'
                      : '1. Tap the Share button at the bottom bar of Safari.'}
                  </span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-low">
                  <PlusSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>
                    {isUrdu
                      ? '2. مینو میں نیچے اسکرول کر کے "Add to Home Screen" منتخب کریں۔'
                      : '2. Scroll down the menu and choose "Add to Home Screen".'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="mt-5 w-full py-2.5 bg-primary text-on-primary rounded-xl font-bold text-xs"
              >
                {isUrdu ? 'سمجھ گیا' : 'Got it'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
