import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, WifiOff, AlertCircle, X, ArrowUpCircle } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useAuth } from '../context/AuthContext';
import { getPendingOperationsCount } from '../lib/offlineDb';
import { syncPendingOfflineChanges } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import {
  isDeviceOnline,
  isUpdateSnoozedInSession,
  setUpdateSnoozedInSession,
  hasRecentUpdateAttempt,
  executeUpdateFlow,
} from '../lib/appUpdateManager';

export interface PWAUpdateNotificationProps {
  /** Optional override for automated testing or UI simulation */
  forceVisible?: boolean;
  /** Optional mock offline state for testing */
  mockIsOffline?: boolean;
  /** Optional mock update callback for testing */
  onMockUpdate?: () => Promise<void>;
  /** Optional mock dismiss callback for testing */
  onMockDismiss?: () => void;
}

export const PWAUpdateNotification: React.FC<PWAUpdateNotificationProps> = ({
  forceVisible = false,
  mockIsOffline,
  onMockUpdate,
  onMockDismiss,
}) => {
  const { user, isConfigured } = useAuth();
  const { language, t, isRTL } = useLanguage();

  // Primary update states
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isSnoozed, setIsSnoozed] = useState<boolean>(() => isUpdateSnoozedInSession());

  // Prevent duplicate concurrent clicks
  const isUpdatingRef = useRef<boolean>(false);
  const primaryButtonRef = useRef<HTMLButtonElement | null>(null);

  // Real Service Worker registration hook
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
      console.warn('[YAAD PWA] Service worker registration notice:', error);
    },
  });

  // Determine if notification should be rendered
  const isAvailable = (needRefresh || forceVisible) && !isSnoozed;

  // Real-time online/offline listener to clear or warn smoothly
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      // Clear offline notice once connection is restored
      setOfflineNotice(null);
    };

    const handleOffline = () => {
      // If currently updating when network dropped, alert gracefully
      if (isUpdatingRef.current) {
        setIsUpdating(false);
        isUpdatingRef.current = false;
        setStatusMessage(null);
        setOfflineNotice(
          t('appUpdate.offlineNotice') || "You're offline. Connect to the internet to update YAAD."
        );
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [t]);

  // Keyboard accessibility: Escape to dismiss (Later)
  useEffect(() => {
    if (!isAvailable) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleLater();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAvailable]);

  // Safe dismiss ("Later") handler
  const handleLater = useCallback(() => {
    if (isUpdatingRef.current) return; // Prevent dismiss while actively updating

    setIsSnoozed(true);
    setUpdateSnoozedInSession(true);
    setNeedRefresh(false);
    onMockDismiss?.();
  }, [setNeedRefresh, onMockDismiss]);

  // Safe "Update Now" execution handler
  const handleUpdate = async () => {
    // 1. Prevent duplicate or simultaneous clicks
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    setIsUpdating(true);
    setHasError(false);
    setOfflineNotice(null);

    // 2. Prevent update loop if reloaded very recently
    if (hasRecentUpdateAttempt()) {
      console.info('[YAAD Update] Recent update attempt detected, waiting for worker activation.');
    }

    // Determine online status (with test override support)
    const online = mockIsOffline !== undefined ? !mockIsOffline : isDeviceOnline();

    // 3. Offline Check: Do NOT pretend an update happened
    if (!online) {
      isUpdatingRef.current = false;
      setIsUpdating(false);
      setOfflineNotice(
        t('appUpdate.offlineNotice') || "You're offline. Connect to the internet to update YAAD."
      );
      return;
    }

    try {
      // 4. Pending offline operations check: Preserve offline mutations
      let pendingCount = 0;
      if (user?.id) {
        try {
          pendingCount = await getPendingOperationsCount(user.id);
        } catch {
          pendingCount = 0;
        }
      }

      // Execute orchestrated update flow
      const result = await executeUpdateFlow({
        isOnline: online,
        pendingOperationsCount: pendingCount,
        onSyncPending: async () => {
          if (user?.id && isConfigured) {
            setStatusMessage(
              t('appUpdate.syncingChanges') || 'Syncing your offline changes before updating...'
            );
            await syncPendingOfflineChanges(user.id);
          }
        },
        onActivateSW: async () => {
          setStatusMessage(t('appUpdate.updating') || 'Updating YAAD...');
          if (onMockUpdate) {
            await onMockUpdate();
          } else {
            // Safety timeout: If browser does not reload within 10 seconds, reset state
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Update reload timed out')), 10000);
            });

            await Promise.race([updateServiceWorker(true), timeoutPromise]);
          }
        },
        onStatusChange: (status, msg) => {
          if (status === 'offline') {
            setOfflineNotice(msg || t('appUpdate.offlineNotice') || "You're offline. Connect to the internet to update YAAD.");
          } else if (status === 'error') {
            setHasError(true);
            setStatusMessage(null);
          } else if (msg) {
            setStatusMessage(msg);
          }
        },
      });

      if (!result.success) {
        isUpdatingRef.current = false;
        setIsUpdating(false);
        if (result.action === 'offline_blocked' || result.action === 'sync_failed') {
          setOfflineNotice(
            t('appUpdate.offlineNotice') || "You're offline. Connect to the internet to update YAAD."
          );
        } else {
          setHasError(true);
        }
      }
    } catch (err) {
      console.warn('[YAAD Update] Unexpected error during update:', err);
      isUpdatingRef.current = false;
      setIsUpdating(false);
      setStatusMessage(null);
      setHasError(true);
    }
  };

  // If the app is already current and not forced visible, do not show the notification
  if (!isAvailable) return null;

  // Localized text helpers with safe fallbacks
  const titleText = t('appUpdate.title') || 'YAAD has a new update';
  const descText = t('appUpdate.description') || 'Update now to get the latest improvements and fixes.';
  const updateNowText = t('appUpdate.updateNow') || 'Update Now';
  const laterText = t('appUpdate.later') || 'Later';
  const retryText = t('appUpdate.retry') || 'Try Again';
  const badgeText = t('appUpdate.badge') || 'New Update';
  const errorText = t('appUpdate.updateFailed') || 'Update could not be completed. Please try again.';
  const escHint = t('appUpdate.escHint') || 'Esc to dismiss';

  return (
    <div
      id="yaad_update_notification_wrapper"
      className={`fixed z-50 pointer-events-none transition-all duration-300
        /* Small mobile screens (< 380px) */
        bottom-20 inset-x-2 flex justify-center
        /* Normal mobile phones (380px - 640px) */
        xs:inset-x-3 sm:inset-x-auto
        /* Tablets (640px - 1024px) - docked neatly in bottom-right corner */
        sm:bottom-6 sm:end-6 sm:max-w-[400px] sm:w-full
        /* Desktop (> 1024px) */
        lg:bottom-8 lg:end-8 lg:max-w-[430px]
      `}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <AnimatePresence>
        <motion.section
          id="yaad_update_notification_card"
          role="region"
          aria-live="polite"
          aria-labelledby="yaad_update_card_title"
          aria-describedby="yaad_update_card_desc"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={`pointer-events-auto w-full max-w-[390px] sm:max-w-[400px] lg:max-w-[430px]
            rounded-2xl sm:rounded-3xl
            bg-surface-container-lowest dark:bg-[#1a211e]
            text-on-surface dark:text-[#eff2ed]
            p-3.5 xs:p-4 sm:p-5
            shadow-[0_12px_40px_rgba(0,30,21,0.14),0_2px_10px_rgba(0,30,21,0.06)]
            dark:shadow-[0_16px_40px_rgba(0,0,0,0.55)]
            border border-outline-variant/60 dark:border-white/10
            backdrop-blur-sm
            relative overflow-hidden select-none
          `}
        >
          {/* Subtle brand ambient glow in top corner */}
          <div
            aria-hidden="true"
            className="absolute -top-12 -start-12 w-32 h-32 bg-primary/8 dark:bg-primary-fixed-dim/10 rounded-full blur-2xl pointer-events-none"
          />

          {/* Header Row: Brand Icon + Pill Badge + Dismiss Button */}
          <div className="flex items-center justify-between gap-2.5 relative z-10">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* YAAD Brand Update Emblem */}
              <div
                id="yaad_update_icon_container"
                className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/10 dark:bg-primary-fixed-dim/20 text-primary dark:text-primary-fixed flex items-center justify-center shrink-0 ring-1 ring-primary/15"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary dark:text-primary-fixed" />
                {/* Active live indicator dot */}
                <span className="absolute -top-1 -end-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-[#1a211e]" />
                </span>
              </div>

              {/* Product Badge */}
              <span
                id="yaad_update_badge"
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-primary/10 dark:bg-primary-fixed/15 text-primary dark:text-primary-fixed font-['Plus_Jakarta_Sans'] shrink-0"
              >
                {badgeText}
              </span>
            </div>

            {/* Accessible Dismiss ("Later") Icon Button */}
            <button
              type="button"
              id="yaad_update_close_btn"
              onClick={handleLater}
              disabled={isUpdating}
              aria-label={laterText}
              title={escHint}
              className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-on-surface-variant/70 hover:text-on-surface dark:text-[#a0a8a3] dark:hover:text-white hover:bg-surface-container active:scale-95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Copy Area: Title & Description */}
          <div className="mt-2.5 sm:mt-3 relative z-10">
            <h2
              id="yaad_update_card_title"
              className="text-sm sm:text-base font-bold text-on-surface dark:text-white font-['Plus_Jakarta_Sans'] leading-tight tracking-tight"
            >
              {titleText}
            </h2>
            <p
              id="yaad_update_card_desc"
              className="text-xs sm:text-[13px] text-on-surface-variant dark:text-[#a0a8a3] font-['Manrope'] mt-1 leading-relaxed"
            >
              {descText}
            </p>
          </div>

          {/* Informational Status Notices */}
          {/* 1. Offline Notice (Non-aggressive, calm warm amber) */}
          {offlineNotice && (
            <div
              id="yaad_update_offline_notice"
              role="status"
              className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5 animate-fadeIn"
            >
              <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span className="font-medium leading-snug">{offlineNotice}</span>
            </div>
          )}

          {/* 2. Error Notice with Safe Retry */}
          {hasError && (
            <div
              id="yaad_update_error_notice"
              role="alert"
              className="mt-3 p-2.5 rounded-xl bg-secondary/10 border border-secondary/20 text-on-surface dark:text-stone-200 text-xs flex items-start gap-2.5 animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 text-secondary dark:text-secondary-fixed-dim shrink-0 mt-0.5" />
              <span className="font-medium leading-snug">{errorText}</span>
            </div>
          )}

          {/* 3. Progress State (Syncing or Worker Updating) */}
          {isUpdating && statusMessage && (
            <div
              id="yaad_update_progress_notice"
              role="status"
              className="mt-3 p-2.5 rounded-xl bg-primary/8 dark:bg-primary-fixed/10 border border-primary/15 text-primary dark:text-primary-fixed text-xs flex items-center gap-2.5 animate-fadeIn"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0 text-primary dark:text-primary-fixed" />
              <span className="font-medium leading-snug">{statusMessage}</span>
            </div>
          )}

          {/* Action Row: Secondary ("Later") & Primary ("Update Now") */}
          <div className="mt-3.5 sm:mt-4 flex items-center justify-between gap-2 relative z-10">
            {/* Subtle desktop keyboard hint */}
            <span className="hidden lg:inline-block text-[11px] text-on-surface-variant/50 dark:text-white/40 font-['Manrope']">
              {escHint}
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {/* Secondary Action: "Later" */}
              <button
                type="button"
                id="yaad_update_later_btn"
                onClick={handleLater}
                disabled={isUpdating}
                className="flex-1 sm:flex-initial min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-on-surface-variant hover:text-on-surface dark:text-[#c0c8c3] dark:hover:text-white bg-surface-container hover:bg-surface-container-high dark:bg-white/5 dark:hover:bg-white/10 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40 cursor-pointer text-center"
              >
                {laterText}
              </button>

              {/* Primary Action: "Update Now" / "Try Again" */}
              <button
                ref={primaryButtonRef}
                type="button"
                id="yaad_update_now_btn"
                onClick={handleUpdate}
                disabled={isUpdating}
                aria-busy={isUpdating}
                className={`flex-1 sm:flex-initial min-h-[44px] px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary-container dark:bg-primary-fixed dark:text-on-primary-fixed dark:hover:bg-primary-fixed-dim active:scale-[0.98] transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer text-center`}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isUpdating ? 'animate-spin' : ''}`}
                />
                <span>{hasError ? retryText : updateNowText}</span>
              </button>
            </div>
          </div>
        </motion.section>
      </AnimatePresence>
    </div>
  );
};
