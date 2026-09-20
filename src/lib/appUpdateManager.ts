/**
 * YAAD Application Update Manager & Resilience Helper
 * 
 * Provides robust state management, offline safety, duplicate click prevention,
 * update loop protection, and smooth recovery for the PWA update experience.
 */

export const SNOOZE_SESSION_KEY = 'yaad_pwa_update_snoozed_session';
export const LAST_UPDATE_ATTEMPT_KEY = 'yaad_pwa_last_update_ts';
export const UPDATE_LOOP_COOLDOWN_MS = 15_000; // 15 seconds cooldown

export interface UpdateFlowResult {
  success: boolean;
  action: 'synced_and_updated' | 'offline_blocked' | 'sync_failed' | 'sw_error' | 'already_updating' | 'dismissed';
  message?: string;
  error?: unknown;
}

/**
 * Checks if the browser currently reports an active internet connection.
 */
export function isDeviceOnline(): boolean {
  if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
    return navigator.onLine;
  }
  return true;
}

/**
 * Checks if the user previously dismissed ("Later") the update notice in this session.
 */
export function isUpdateSnoozedInSession(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  try {
    return sessionStorage.getItem(SNOOZE_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Snoozes the update notice for the current active browser session.
 */
export function setUpdateSnoozedInSession(snoozed = true): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    if (snoozed) {
      sessionStorage.setItem(SNOOZE_SESSION_KEY, 'true');
    } else {
      sessionStorage.removeItem(SNOOZE_SESSION_KEY);
    }
  } catch {}
}

/**
 * Checks if an update attempt was made very recently to prevent rapid infinite reload loops.
 */
export function hasRecentUpdateAttempt(cooldownMs = UPDATE_LOOP_COOLDOWN_MS): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  try {
    const raw = sessionStorage.getItem(LAST_UPDATE_ATTEMPT_KEY);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    return Number.isFinite(ts) && Date.now() - ts < cooldownMs;
  } catch {
    return false;
  }
}

/**
 * Records an update execution attempt timestamp.
 */
export function recordUpdateAttempt(): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(LAST_UPDATE_ATTEMPT_KEY, String(Date.now()));
  } catch {}
}

/**
 * Core orchestration logic for safely updating the application.
 * Executes offline verification, pending operation synchronization,
 * and service worker activation.
 */
export async function executeUpdateFlow({
  isOnline = isDeviceOnline(),
  pendingOperationsCount = 0,
  onSyncPending,
  onActivateSW,
  onStatusChange,
}: {
  isOnline?: boolean;
  pendingOperationsCount?: number;
  onSyncPending?: () => Promise<void>;
  onActivateSW: () => Promise<void>;
  onStatusChange?: (status: 'syncing' | 'updating' | 'error' | 'offline' | null, message?: string) => void;
}): Promise<UpdateFlowResult> {
  // 1. Connectivity Check: If offline, do NOT pretend an update occurred.
  if (!isOnline) {
    onStatusChange?.('offline', "You're offline. Connect to the internet to update YAAD.");
    return {
      success: false,
      action: 'offline_blocked',
      message: "You're offline. Connect to the internet to update YAAD.",
    };
  }

  // 2. Offline Sync Safety: If there are unsaved local mutations, sync them first.
  if (pendingOperationsCount > 0 && onSyncPending) {
    onStatusChange?.('syncing', 'Syncing your offline changes before updating...');
    try {
      await onSyncPending();
    } catch (syncError) {
      console.warn('[YAAD Update] Pending changes sync failed before update:', syncError);
      onStatusChange?.('offline', 'Could not sync offline changes. Please check your connection and try again.');
      return {
        success: false,
        action: 'sync_failed',
        message: 'Could not sync offline changes. Please check your connection and try again.',
        error: syncError,
      };
    }
  }

  // 3. Service Worker Activation: Safely invoke skipWaiting and reload.
  onStatusChange?.('updating', 'Updating YAAD...');
  recordUpdateAttempt();

  try {
    await onActivateSW();
    return {
      success: true,
      action: 'synced_and_updated',
      message: 'Updating YAAD...',
    };
  } catch (swError) {
    console.warn('[YAAD Update] Service worker update call failed:', swError);
    onStatusChange?.('error', 'Update could not be completed. Please try again.');
    return {
      success: false,
      action: 'sw_error',
      message: 'Update could not be completed. Please try again.',
      error: swError,
    };
  }
}
