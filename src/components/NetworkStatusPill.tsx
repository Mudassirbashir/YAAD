import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, RefreshCw, Check, Cloud } from 'lucide-react';
import { SyncStatus } from '../lib/useOnlineStatus';
import { useLanguage } from '../context/LanguageContext';

interface NetworkStatusPillProps {
  isOnline: boolean;
  syncStatus: SyncStatus;
  pendingCount: number;
  onSyncClick?: () => void;
}

export const NetworkStatusPill: React.FC<NetworkStatusPillProps> = ({
  isOnline,
  syncStatus,
  pendingCount,
  onSyncClick,
}) => {
  const { language } = useLanguage();
  const isUrdu = language === 'ur';

  // Only render when offline, syncing, recently synced, or has pending operations
  const shouldShow =
    !isOnline ||
    syncStatus === 'offline' ||
    syncStatus === 'syncing' ||
    syncStatus === 'synced' ||
    pendingCount > 0;

  if (!shouldShow) return null;

  return (
    <div
      id="pwa_network_status_container"
      className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-4 w-full max-w-xs flex justify-center"
    >
      <AnimatePresence mode="wait">
        {/* State 1: Offline */}
        {!isOnline || syncStatus === 'offline' ? (
          <motion.div
            key="status-offline"
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1c190e]/90 text-white backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.18)] border border-white/10 text-xs font-medium"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <WifiOff className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-['Manrope']">
              {isUrdu ? 'آف لائن • تبدیلیاں محفوظ ہیں' : 'Offline • Changes saved'}
            </span>
            {pendingCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/30 text-amber-200">
                {pendingCount}
              </span>
            )}
          </motion.div>
        ) : syncStatus === 'syncing' ? (
          /* State 2: Back online & syncing */
          <motion.div
            key="status-syncing"
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/95 text-white backdrop-blur-md shadow-[0_4px_16px_rgba(0,30,21,0.25)] border border-white/15 text-xs font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5 text-primary-fixed animate-spin" />
            <span className="font-['Manrope']">
              {isUrdu ? 'آن لائن • ہم آہنگ ہو رہا ہے...' : 'Back online • Syncing...'}
            </span>
          </motion.div>
        ) : syncStatus === 'synced' ? (
          /* State 3: Synced confirmation */
          <motion.div
            key="status-synced"
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-900/90 text-white backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.15)] border border-emerald-500/30 text-xs font-medium"
          >
            <Check className="w-3.5 h-3.5 text-emerald-300 stroke-[2.5]" />
            <span className="font-['Manrope'] text-emerald-100">
              {isUrdu ? 'ہم آہنگ ہو گیا' : 'Synced'}
            </span>
          </motion.div>
        ) : pendingCount > 0 ? (
          /* State 4: Idle with pending changes */
          <motion.button
            key="status-pending"
            type="button"
            onClick={onSyncClick}
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high/95 text-on-surface backdrop-blur-md shadow-[0_4px_14px_rgba(0,0,0,0.08)] border border-surface-dim text-xs font-medium hover:bg-surface-container-highest active:scale-95 transition-all"
          >
            <Cloud className="w-3.5 h-3.5 text-primary" />
            <span className="font-['Manrope']">
              {pendingCount} {isUrdu ? 'غیر ہم آہنگ' : 'pending sync'}
            </span>
            <RefreshCw className="w-3 h-3 text-on-surface-variant ml-0.5" />
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
