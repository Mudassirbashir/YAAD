import { supabase } from './supabase';
import { ShoppingList, UserProfile } from '../types';

export function getClientDeviceId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    let id = sessionStorage.getItem('yaad_client_device_id');
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      sessionStorage.setItem('yaad_client_device_id', id);
    }
    return id;
  } catch {
    return 'dev_' + Date.now();
  }
}

export type RealtimeSyncBroadcastPayload =
  | { type: 'LIST_UPSERT'; list: ShoppingList }
  | { type: 'LIST_DELETE'; listId: string }
  | { type: 'ITEM_DELETE'; listId: string; itemId: string }
  | { type: 'PROFILE_UPDATE'; profile: Partial<UserProfile> }
  | { type: 'SYNC_REQUIRED' }
  | { type: 'REFRESH_ALL' };

export type RealtimeSyncPayload = RealtimeSyncBroadcastPayload & {
  senderDeviceId: string;
  timestamp: number;
};

export interface CrossDeviceSyncCallbacks {
  onListUpsert?: (list: ShoppingList) => void;
  onListDelete?: (listId: string) => void;
  onItemDelete?: (listId: string, itemId: string) => void;
  onProfileUpdate?: (profile: Partial<UserProfile>) => void;
  onSyncRequired?: () => void;
}

// Active channels cache
const activeSyncChannels = new Map<string, any>();

/**
 * Broadcast an event to other active devices logged into the same user account
 */
export async function broadcastCrossDeviceSync(
  userId: string,
  payload: RealtimeSyncBroadcastPayload
): Promise<void> {
  if (!supabase || !userId) return;
  const channelName = `yaad_user_sync_${userId}`;
  const senderDeviceId = getClientDeviceId();
  const fullPayload: RealtimeSyncPayload = {
    ...payload,
    senderDeviceId,
    timestamp: Date.now(),
  };

  try {
    let channel = activeSyncChannels.get(channelName);
    if (!channel) {
      channel = supabase.channel(channelName);
      activeSyncChannels.set(channelName, channel);
      await new Promise<void>((resolve) => {
        channel.subscribe((status: string) => {
          if (status === 'SUBSCRIBED') resolve();
        });
        setTimeout(resolve, 1500); // safety timeout
      });
    }

    await channel.send({
      type: 'broadcast',
      event: 'cross_device_sync',
      payload: fullPayload,
    });
  } catch (err) {
    console.warn('Notice sending cross-device sync broadcast:', err);
  }
}

/**
 * Subscribe to realtime cross-device changes (both Supabase Broadcast and Postgres Changes)
 */
export function subscribeToCrossDeviceSync(
  userId: string,
  callbacksOrHandler: CrossDeviceSyncCallbacks | ((event: RealtimeSyncBroadcastPayload) => void)
): () => void {
  if (!supabase || !userId || typeof window === 'undefined') {
    return () => {};
  }

  const isFunctionalHandler = typeof callbacksOrHandler === 'function';
  const callbacks = isFunctionalHandler ? {} : callbacksOrHandler;

  const channelName = `yaad_user_sync_${userId}`;
  const localDeviceId = getClientDeviceId();

  let debounceTimer: any = null;
  const triggerDebouncedSync = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (isFunctionalHandler) {
        (callbacksOrHandler as (event: RealtimeSyncBroadcastPayload) => void)({ type: 'REFRESH_ALL' });
      } else {
        callbacks.onSyncRequired?.();
      }
    }, 400);
  };

  const channel = supabase
    .channel(channelName)
    // 1. Listen for instant peer-to-peer broadcasts
    .on('broadcast', { event: 'cross_device_sync' }, (data: { payload: RealtimeSyncPayload }) => {
      const payload = data?.payload;
      if (!payload) return;

      // Ignore echoes from this exact browser tab/device
      if (payload.senderDeviceId === localDeviceId) {
        return;
      }

      if (isFunctionalHandler) {
        (callbacksOrHandler as (event: RealtimeSyncBroadcastPayload) => void)(payload);
      } else {
        if (payload.type === 'LIST_UPSERT' && payload.list) {
          callbacks.onListUpsert?.(payload.list);
        } else if (payload.type === 'LIST_DELETE' && payload.listId) {
          callbacks.onListDelete?.(payload.listId);
        } else if (payload.type === 'ITEM_DELETE' && payload.listId && payload.itemId) {
          callbacks.onItemDelete?.(payload.listId, payload.itemId);
        } else if (payload.type === 'PROFILE_UPDATE' && payload.profile) {
          callbacks.onProfileUpdate?.(payload.profile);
        } else if (payload.type === 'SYNC_REQUIRED' || payload.type === 'REFRESH_ALL') {
          callbacks.onSyncRequired?.();
        }
      }
    })
    // 2. Listen to PostgreSQL shopping_lists table changes
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'shopping_lists', filter: `user_id=eq.${userId}` },
      () => {
        triggerDebouncedSync();
      }
    )
    // 3. Listen to PostgreSQL shopping_items table changes
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'shopping_items', filter: `user_id=eq.${userId}` },
      () => {
        triggerDebouncedSync();
      }
    )
    .subscribe((status: string, err: any) => {
      if (err) {
        console.warn('Realtime subscription notice for user sync:', err?.message || err);
      }
    });

  activeSyncChannels.set(channelName, channel);

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    activeSyncChannels.delete(channelName);
    try {
      supabase.removeChannel(channel);
    } catch {}
  };
}
