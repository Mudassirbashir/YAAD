import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPendingOperationsCount } from './offlineDb';
import { syncPendingOfflineChanges } from './supabase';

export type SyncStatus = 'idle' | 'offline' | 'syncing' | 'synced';

export interface UseOnlineStatusReturn {
  isOnline: boolean;
  syncStatus: SyncStatus;
  pendingCount: number;
  triggerSync: () => Promise<number>;
}

export function useOnlineStatus(onSyncSuccess?: () => void): UseOnlineStatusReturn {
  const { user, isConfigured } = useAuth();
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'idle'
  );
  const [pendingCount, setPendingCount] = useState<number>(0);

  // Refresh count of pending changes from IndexedDB
  const refreshPendingCount = useCallback(async () => {
    if (!user?.id) {
      setPendingCount(0);
      return;
    }
    try {
      const count = await getPendingOperationsCount(user.id);
      setPendingCount(count);
    } catch {
      setPendingCount(0);
    }
  }, [user?.id]);

  // Trigger sync of pending changes
  const triggerSync = useCallback(async (): Promise<number> => {
    if (!user?.id || !navigator.onLine || !isConfigured) {
      return 0;
    }

    setSyncStatus('syncing');
    try {
      const result = await syncPendingOfflineChanges(user.id);
      await refreshPendingCount();

      if (result.syncedCount > 0) {
        setSyncStatus('synced');
        if (onSyncSuccess) {
          onSyncSuccess();
        }
        // Auto fade out after 3 seconds
        setTimeout(() => {
          setSyncStatus((prev) => (prev === 'synced' ? 'idle' : prev));
        }, 3000);
      } else {
        setSyncStatus('idle');
      }
      return result.syncedCount;
    } catch (err) {
      console.warn('Sync attempt failed:', err);
      setSyncStatus('idle');
      return 0;
    }
  }, [user?.id, isConfigured, refreshPendingCount, onSyncSuccess]);

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = async () => {
      setIsOnline(true);
      setSyncStatus('syncing');

      if (user?.id && isConfigured) {
        try {
          const result = await syncPendingOfflineChanges(user.id);
          await refreshPendingCount();
          setSyncStatus('synced');
          if (onSyncSuccess) {
            onSyncSuccess();
          }
          setTimeout(() => {
            setSyncStatus((prev) => (prev === 'synced' ? 'idle' : prev));
          }, 3200);
        } catch (e) {
          console.warn('Error during auto reconnection sync:', e);
          setSyncStatus('idle');
        }
      } else {
        setSyncStatus('idle');
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
      refreshPendingCount();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      setSyncStatus('offline');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user?.id, isConfigured, refreshPendingCount, onSyncSuccess]);

  return {
    isOnline,
    syncStatus,
    pendingCount,
    triggerSync,
  };
}
