import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, AlertCircle, X } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useAuth } from '../context/AuthContext';
import { getPendingOperationsCount } from '../lib/offlineDb';
import { syncPendingOfflineChanges } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';

export const PWAUpdateNotification: React.FC = () => {
  const { user, isConfigured } = useAuth();
  const { language } = useLanguage();
  const isUrdu = language === 'ur';

  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Periodically check for updates every 60 minutes
        setInterval(() => {
          r.update().catch(() => {});
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.warn('SW registration notice:', error);
    },
  });

  const handleUpdate = async () => {
    setIsUpdating(true);

    try {
      // 1. Check if there are pending offline operations before updating
      if (user?.id) {
        const pendingCount = await getPendingOperationsCount(user.id);
        if (pendingCount > 0) {
          if (navigator.onLine && isConfigured) {
            setUpdateMessage(
              isUrdu
                ? 'اپ ڈیٹ سے قبل تبدیلیاں محفوظ کی جا رہی ہیں...'
                : 'Syncing your offline changes before updating...'
            );
            await syncPendingOfflineChanges(user.id);
          } else {
            // Cannot sync right now because device is offline
            alert(
              isUrdu
                ? 'آپ کے پاس غیر محفوظ شدہ تبدیلیاں موجود ہیں۔ براہ کرم اپ ڈیٹ کرنے سے پہلے انٹرنیٹ سے منسلک ہوں۔'
                : 'You have unsynced changes. Please connect to the internet to sync before updating.'
            );
            setIsUpdating(false);
            setUpdateMessage(null);
            return;
          }
        }
      }

      // 2. Safely activate the new service worker and refresh
      setUpdateMessage(isUrdu ? 'ایپ اپ ڈیٹ ہو رہی ہے...' : 'Updating YAAD...');
      await updateServiceWorker(true);
    } catch (err) {
      console.warn('Error during SW update:', err);
      setIsUpdating(false);
      setUpdateMessage(null);
    }
  };

  if (!needRefresh) return null;

  return (
    <div
      id="pwa_update_notification_container"
      className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-4 w-full max-w-sm"
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="pointer-events-auto rounded-2xl bg-primary text-on-primary p-3.5 shadow-[0_8px_30px_rgba(0,30,21,0.3)] border border-primary-fixed-dim/30 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary-fixed" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold font-['Plus_Jakarta_Sans'] leading-tight truncate">
                {isUrdu ? 'نیا ورژن دستیاب ہے' : 'New version available'}
              </p>
              <p className="text-[11px] text-on-primary/80 font-['Manrope'] leading-tight truncate">
                {updateMessage || (isUrdu ? 'تازہ ترین ورژن پر اپ ڈیٹ کریں' : 'Update YAAD now')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleUpdate}
              disabled={isUpdating}
              className="px-3 py-1.5 rounded-xl bg-white text-primary text-xs font-bold hover:bg-white/90 active:scale-95 transition-all shadow-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>{isUrdu ? 'اپ ڈیٹ' : 'Update'}</span>
            </button>
            <button
              type="button"
              onClick={() => setNeedRefresh(false)}
              aria-label="Close update notice"
              className="p-1 rounded-full text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
