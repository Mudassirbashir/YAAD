/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, ShoppingList, ShoppingItem, CategoryId, FrequentlyBoughtItem } from '../types';
import { generateUUID, isValidUUID } from './uuid';
import {
  getOfflineLists,
  saveOfflineList,
  saveOfflineListsBatch,
  deleteOfflineList,
  clearUserOfflineLists,
  enqueueOfflineOperation,
  getPendingOfflineOperations,
  removePendingOfflineOperation,
  updatePendingOperationStatus,
  clearUserOfflineQueue,
  purgeAllUserOfflineData,
  PendingOfflineOperation,
  saveOfflineProfile,
  getOfflineProfile,
} from './offlineDb';

const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};
const supabaseUrl = (env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'MY_SUPABASE_URL' &&
  !supabaseUrl.includes('placeholder') &&
  supabaseUrl.startsWith('http')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Offline Sync Queue Types & Constants
 */
export interface OfflineQueueItem {
  id: string;
  type: 'SAVE_LIST' | 'DELETE_LIST' | 'RECORD_PURCHASES';
  userId: string;
  payload: any;
  timestamp: number;
}

const getOfflineQueueKey = (userId: string) => `yaad_offline_queue_u_${userId}`;

/**
 * Retrieve pending offline actions (fallback to IndexedDB)
 */
export function getPendingOfflineChanges(userId: string): OfflineQueueItem[] {
  try {
    const raw = localStorage.getItem(getOfflineQueueKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Error reading offline queue:', e);
    return [];
  }
}

/**
 * Enqueue a pending offline action (persisted safely to IndexedDB & legacy mirror)
 */
export function enqueueOfflineChange(userId: string, change: Omit<OfflineQueueItem, 'id' | 'timestamp'>): void {
  try {
    // Also save to IndexedDB offline queue
    enqueueOfflineOperation({
      type: change.type as any,
      userId,
      listId: change.payload?.id || change.payload?.listId || generateUUID(),
      payload: change.payload,
    }).catch((e) => console.warn('IndexedDB enqueue notice:', e));

    const queue = getPendingOfflineChanges(userId);
    const item: OfflineQueueItem = {
      ...change,
      id: generateUUID(),
      timestamp: Date.now(),
    };

    if (item.type === 'SAVE_LIST' && item.payload?.id) {
      const filtered = queue.filter(
        (q) => !(q.type === 'SAVE_LIST' && q.payload?.id === item.payload.id)
      );
      filtered.push(item);
      localStorage.setItem(getOfflineQueueKey(userId), JSON.stringify(filtered));
      return;
    }

    if (item.type === 'DELETE_LIST' && item.payload?.listId) {
      const filtered = queue.filter(
        (q) => !(q.payload?.id === item.payload.listId || (q.type === 'DELETE_LIST' && q.payload?.listId === item.payload.listId))
      );
      filtered.push(item);
      localStorage.setItem(getOfflineQueueKey(userId), JSON.stringify(filtered));
      return;
    }

    queue.push(item);
    localStorage.setItem(getOfflineQueueKey(userId), JSON.stringify(queue));
  } catch (e) {
    console.warn('Error enqueuing offline change:', e);
  }
}

/**
 * Clear offline queue for a user across storage layers
 */
export function clearOfflineQueue(userId: string): void {
  try {
    localStorage.removeItem(getOfflineQueueKey(userId));
    clearUserOfflineQueue(userId).catch(() => {});
  } catch (e) {
    console.warn('Error clearing offline queue:', e);
  }
}

/**
 * Validates and safely returns the currently authenticated user's ID
 * from the active Supabase session to guarantee strict user ownership.
 */
export async function getVerifiedUserId(providedUserId?: string): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user?.id) {
      return null;
    }
    const sessionUserId = session.user.id;
    if (providedUserId && providedUserId !== sessionUserId) {
      console.warn('Security verification: provided userId did not match active session userId. Using verified session ID.');
    }
    return sessionUserId;
  } catch (err) {
    console.warn('Exception during getVerifiedUserId:', err);
    return null;
  }
}

/**
 * Helper to ensure an ID is a valid UUID for tables requiring UUID primary keys.
 */
export function ensureValidUUID(id?: string): string {
  if (id && isValidUUID(id)) {
    return id;
  }
  return generateUUID();
}

/**
 * Detects whether an error or environment is offline / network connectivity related.
 */
export function isNetworkOrOfflineError(error: unknown): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true;
  }
  if (!error) return false;
  if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Network'))) {
    return true;
  }
  const msg = typeof error === 'string' ? error : (error as any).message || String(error);
  return (
    /failed to fetch/i.test(msg) ||
    /network.*error/i.test(msg) ||
    /networkrequestfailed/i.test(msg) ||
    /err_internet_disconnected/i.test(msg) ||
    /err_connection/i.test(msg) ||
    /offline/i.test(msg) ||
    /aborted/i.test(msg)
  );
}

/**
 * Safely upsert a row into a Supabase table with automatic schema-mismatch recovery.
 * If Supabase PostgREST reports a missing column in the schema cache,
 * it dynamically strips the offending column and retries.
 */
export async function resilientUpsert(
  table: string,
  payload: Record<string, unknown>,
  options?: { onConflict?: string }
): Promise<{ data: any; error: Error | null; isOffline?: boolean }> {
  if (!supabase) return { data: null, error: new Error('Supabase client not initialized') };

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { data: null, error: null, isOffline: true };
  }

  const mutablePayload = { ...payload };
  const maxRetries = 6;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const query = options?.onConflict
        ? supabase.from(table).upsert(mutablePayload, { onConflict: options.onConflict }).select()
        : supabase.from(table).upsert(mutablePayload).select();

      const { data, error } = await query;
      if (!error) {
        return { data, error: null };
      }

      // If network/offline error, do not retry repeatedly
      if (isNetworkOrOfflineError(error)) {
        return { data: null, error: null, isOffline: true };
      }

      // Check for column missing error pattern from PostgREST / Supabase
      const match =
        error.message.match(/Could not find the '([^']+)' column/i) ||
        error.message.match(/column "([^"]+)" of relation/i) ||
        error.message.match(/column '([^']+)' does not exist/i);

      if (match && match[1] && match[1] in mutablePayload) {
        const offendingColumn = match[1];
        console.warn(`Column '${offendingColumn}' not found in '${table}' schema cache. Retrying upsert without '${offendingColumn}'.`);
        delete mutablePayload[offendingColumn];
        continue;
      }

      return { data: null, error: new Error(error.message) };
    } catch (err: unknown) {
      if (isNetworkOrOfflineError(err)) {
        return { data: null, error: null, isOffline: true };
      }
      const msg = err instanceof Error ? err.message : 'Upsert query exception';
      return { data: null, error: new Error(msg) };
    }
  }

  return { data: null, error: new Error(`Failed to upsert to ${table} after schema adaptation retries.`) };
}

/**
 * ----------------------------------------------------------------------
 * 1. PROFILES OPERATIONS (CREATE, READ, UPDATE, DELETE)
 * ----------------------------------------------------------------------
 */

/**
 * Fetch profile from Supabase public.profiles table using authenticated user's ID
 */
export async function getProfile(userId: string): Promise<UserProfile | null> {
  const cached = await getOfflineProfile<UserProfile>(userId);
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return cached;
  }
  if (!supabase) return cached;
  try {
    const verifiedUserId = (await getVerifiedUserId(userId)) || userId;
    if (!verifiedUserId) {
      return cached;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', verifiedUserId)
      .maybeSingle();

    if (error) {
      if (!isNetworkOrOfflineError(error)) {
        console.warn('Error fetching profile from Supabase:', error.message);
      }
      return cached;
    }
    if (data) {
      await saveOfflineProfile(verifiedUserId, data);
      return data as UserProfile;
    }
    return cached;
  } catch (err) {
    if (!isNetworkOrOfflineError(err)) {
      console.warn('Exception fetching profile:', err);
    }
    return cached;
  }
}

/**
 * Update or insert user profile in Supabase public.profiles table
 */
export async function updateProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<{ data: UserProfile | null; error: Error | null }> {
  const verifiedUserId = (await getVerifiedUserId(userId)) || userId;

  // Retrieve existing profile from cache first so partial updates NEVER wipe existing fields
  const existingProfile = await getOfflineProfile<UserProfile>(verifiedUserId);

  const mergedProfile: UserProfile = {
    id: verifiedUserId,
    full_name: updates.full_name !== undefined ? (updates.full_name || null) : (existingProfile?.full_name ?? null),
    email: updates.email !== undefined ? (updates.email || null) : (existingProfile?.email ?? null),
    avatar_url: updates.avatar_url !== undefined ? (updates.avatar_url || null) : (existingProfile?.avatar_url ?? null),
    language: updates.language !== undefined ? updates.language : (existingProfile?.language ?? 'en'),
    usage_purpose: updates.usage_purpose !== undefined ? updates.usage_purpose : (existingProfile?.usage_purpose ?? null),
    referral_source: updates.referral_source !== undefined ? updates.referral_source : (existingProfile?.referral_source ?? null),
    has_completed_setup: updates.has_completed_setup !== undefined ? updates.has_completed_setup : (existingProfile?.has_completed_setup ?? true),
  };

  // Always save to offline IndexedDB immediately
  await saveOfflineProfile(verifiedUserId, mergedProfile);

  if (!supabase || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return { data: mergedProfile, error: null };
  }

  try {
    const payload: Record<string, unknown> = {
      ...mergedProfile,
      updated_at: new Date().toISOString(),
    };

    const { data: upsertData, error: upsertError, isOffline } = await resilientUpsert(
      'profiles',
      payload,
      { onConflict: 'id' }
    );

    if (isOffline || (upsertError && isNetworkOrOfflineError(upsertError))) {
      return { data: mergedProfile, error: null };
    }

    if (upsertError) {
      console.warn('Supabase updateProfile notice:', upsertError.message);
      return {
        data: mergedProfile,
        error: null,
      };
    }

    const savedProfile = Array.isArray(upsertData) ? upsertData[0] : upsertData;
    const finalProfile = (savedProfile ? { ...mergedProfile, ...savedProfile } : mergedProfile) as UserProfile;
    await saveOfflineProfile(verifiedUserId, finalProfile);
    return { data: finalProfile, error: null };
  } catch (err: unknown) {
    if (isNetworkOrOfflineError(err)) {
      return { data: mergedProfile, error: null };
    }
    const message = err instanceof Error ? err.message : 'Failed to update profile';
    console.warn('Exception during updateProfile:', message);
    return { data: mergedProfile, error: null };
  }
}

/**
 * ----------------------------------------------------------------------
 * 2. SHOPPING LISTS OPERATIONS (CREATE, READ, UPDATE, DELETE)
 * ----------------------------------------------------------------------
 */

/**
 * Load shopping lists and items from Supabase for authenticated user.
 * Combines instant local IndexedDB serving with cloud synchronization.
 */
export async function loadUserShoppingLists(
  userId: string
): Promise<{ lists: ShoppingList[]; error: Error | null; isOffline?: boolean }> {
  const verifiedUserId = (await getVerifiedUserId(userId)) || userId;

  // 1. Instantly read from local IndexedDB
  const cachedOfflineLists = await getOfflineLists(verifiedUserId);

  if (!supabase || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return { lists: cachedOfflineLists, error: null, isOffline: true };
  }

  try {
    // 2. Query public.shopping_lists
    let listsData: any[] | null = null;
    const { data: orderedData, error: listsError } = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('user_id', verifiedUserId)
      .order('created_at', { ascending: false });

    if (listsError) {
      if (isNetworkOrOfflineError(listsError)) {
        return { lists: cachedOfflineLists, error: null, isOffline: true };
      }
      console.warn('Note on ordered lists query, attempting general select:', listsError.message);
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', verifiedUserId);

      if (fallbackError) {
        if (!isNetworkOrOfflineError(fallbackError)) {
          console.error('Error loading shopping lists from Supabase:', fallbackError.message);
        }
        return { lists: cachedOfflineLists, error: null, isOffline: true };
      }
      listsData = fallbackData;
    } else {
      listsData = orderedData;
    }

    if (!listsData || listsData.length === 0) {
      // Check if user has offline-created lists that are pending sync
      const pendingOps = await getPendingOfflineOperations(verifiedUserId);
      if (pendingOps.length > 0) {
        return { lists: cachedOfflineLists, error: null };
      }
      return { lists: [], error: null };
    }

    // 3. Query child public.shopping_items table for normalized list items
    const listIds = listsData.map((l) => l.id);
    const { data: itemsData, error: itemsError } = await supabase
      .from('shopping_items')
      .select('*')
      .in('list_id', listIds)
      .eq('user_id', verifiedUserId);

    if (itemsError) {
      console.warn('Note loading child shopping_items (falling back to embedded JSON):', itemsError.message);
    }

    const itemsByListId = new Map<string, ShoppingItem[]>();
    if (itemsData && itemsData.length > 0) {
      itemsData.forEach((row) => {
        const item: ShoppingItem = {
          id: row.id,
          name: row.item_name || row.name || '',
          canonicalName: row.canonical_name || undefined,
          nameUrdu: row.name_urdu || undefined,
          nameRomanUrdu: row.name_roman_urdu || undefined,
          emoji: row.emoji || undefined,
          categoryId: (row.category || 'other') as CategoryId,
          category: row.category,
          quantity: row.quantity || undefined,
          unit: row.unit || undefined,
          completed: Boolean(row.is_completed ?? row.is_checked),
          rawInput: row.raw_input || undefined,
          note: row.note || row.unit || undefined,
          isRecognized: Boolean(row.is_recognized),
        };
        const existing = itemsByListId.get(row.list_id) || [];
        existing.push(item);
        itemsByListId.set(row.list_id, existing);
      });
    }

    // 4. Map database rows to Application ShoppingList model
    const remoteLists: ShoppingList[] = listsData.map((row) => {
      const relationalItems = itemsByListId.get(row.id) || [];
      const fallbackItems: ShoppingItem[] = Array.isArray(row.items) ? row.items : [];

      let finalItems: ShoppingItem[] = relationalItems;
      if (relationalItems.length > 0 && fallbackItems.length > 0) {
        finalItems = relationalItems.map((rItem) => {
          const fItem = fallbackItems.find((f) => f.id === rItem.id);
          if (!fItem) return rItem;
          return {
            ...rItem,
            canonicalName: rItem.canonicalName || fItem.canonicalName,
            nameUrdu: rItem.nameUrdu || fItem.nameUrdu,
            nameRomanUrdu: rItem.nameRomanUrdu || fItem.nameRomanUrdu,
            emoji: rItem.emoji || fItem.emoji,
            isRecognized: rItem.isRecognized ?? fItem.isRecognized,
          };
        });
      } else if (relationalItems.length === 0) {
        finalItems = fallbackItems;
      }

      const isCompleted = finalItems.length > 0 
        ? finalItems.every((i: ShoppingItem) => i.completed) 
        : Boolean(row.is_completed);

      const createdTime = row.created_at 
        ? new Date(row.created_at).getTime() 
        : (Number(row.created_timestamp) || Date.now());

      const createdAtFormatted = row.created_at_label || (row.created_at
        ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'Today');

      return {
        id: row.id,
        userId: row.user_id,
        title: row.title || 'Shopping List',
        createdAt: createdAtFormatted,
        createdTimestamp: createdTime,
        completedAt: row.completed_at || (isCompleted ? 'Completed' : undefined),
        isCompleted,
        icon: row.icon || 'shopping_basket',
        items: finalItems,
        isSynced: true,
      };
    });

    // 5. Conflict-Safe Merge with Pending Offline Changes
    const pendingOps = await getPendingOfflineOperations(verifiedUserId);
    const pendingListIds = new Set(pendingOps.map((op) => op.listId));

    const mergedLists: ShoppingList[] = remoteLists.map((remoteList) => {
      if (pendingListIds.has(remoteList.id)) {
        const localVersion = cachedOfflineLists.find((cl) => cl.id === remoteList.id);
        if (localVersion) {
          return { ...localVersion, isSynced: false };
        }
      }
      return remoteList;
    });

    // Include any locally-created lists that have not yet reached Supabase
    cachedOfflineLists.forEach((localList) => {
      if (!remoteLists.some((rl) => rl.id === localList.id)) {
        mergedLists.push({ ...localList, isSynced: false });
      }
    });

    // Sort descending by createdTimestamp
    mergedLists.sort((a, b) => (b.createdTimestamp || 0) - (a.createdTimestamp || 0));

    // 6. Update local IndexedDB cache with verified data
    await saveOfflineListsBatch(verifiedUserId, mergedLists);

    return { lists: mergedLists, error: null };
  } catch (err: unknown) {
    console.warn('Exception loading shopping lists from Supabase, serving offline cache:', err);
    return { lists: cachedOfflineLists, error: null, isOffline: true };
  }
}

// Mutex queues per list to serialize rapid concurrent updates and prevent race conditions
const listSaveQueues = new Map<string, Promise<{ success: boolean; error: Error | null; isOffline?: boolean }>>();

/**
 * Save / persist shopping list and its items.
 * Uses per-list serialization to guarantee strict sequential execution and zero race conditions.
 * Immediately saves to IndexedDB for offline capability, and syncs to Supabase.
 */
export async function saveUserShoppingList(
  userId: string,
  list: ShoppingList
): Promise<{ success: boolean; error: Error | null; isOffline?: boolean }> {
  const safeListId = list.id || generateUUID();
  const prevQueue = listSaveQueues.get(safeListId) || Promise.resolve({ success: true, error: null });

  const currentTask = prevQueue.then(
    () => executeInternalSaveUserShoppingList(userId, { ...list, id: safeListId }),
    () => executeInternalSaveUserShoppingList(userId, { ...list, id: safeListId })
  );

  listSaveQueues.set(safeListId, currentTask);
  return currentTask;
}

async function executeInternalSaveUserShoppingList(
  userId: string,
  list: ShoppingList
): Promise<{ success: boolean; error: Error | null; isOffline?: boolean }> {
  const verifiedUserId = (await getVerifiedUserId(userId)) || userId;
  const safeListId = list.id || generateUUID();
  const listToSave: ShoppingList = {
    ...list,
    id: safeListId,
    userId: verifiedUserId,
    isSynced: false,
  };

  // 1. Immediately persist to IndexedDB (Instant optimistic write)
  await saveOfflineList(verifiedUserId, listToSave);

  // 2. If offline or Supabase not available, queue for background sync
  const isCurrentlyOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  if (!supabase || isCurrentlyOffline) {
    await enqueueOfflineOperation({
      type: 'SAVE_LIST',
      userId: verifiedUserId,
      listId: safeListId,
      payload: listToSave,
    });
    return { success: true, error: null, isOffline: true };
  }

  try {
    const isCompleted = list.items.length > 0
      ? list.items.every((i) => i.completed)
      : Boolean(list.isCompleted);

    const createdIso = list.createdTimestamp
      ? new Date(list.createdTimestamp).toISOString()
      : new Date().toISOString();

    const listPayload: Record<string, unknown> = {
      id: safeListId,
      user_id: verifiedUserId,
      title: list.title || 'Shopping List',
      icon: list.icon || 'shopping_basket',
      is_completed: isCompleted,
      completed_at: list.completedAt ? (list.completedAt.includes('T') ? list.completedAt : new Date().toISOString()) : (isCompleted ? new Date().toISOString() : null),
      items: list.items || [],
      created_at: createdIso,
      updated_at: new Date().toISOString(),
    };

    const { error: listError } = await resilientUpsert('shopping_lists', listPayload);

    if (listError) {
      console.warn('Error saving list to Supabase, queuing offline mutation:', listError.message);
      await enqueueOfflineOperation({
        type: 'SAVE_LIST',
        userId: verifiedUserId,
        listId: safeListId,
        payload: listToSave,
      });
      return { success: true, error: null, isOffline: true };
    }

    // 3. Synchronize child public.shopping_items table
    if (list.items) {
      try {
        if (list.items.length === 0) {
          // List has no items, clear any existing rows
          await supabase
            .from('shopping_items')
            .delete()
            .eq('list_id', safeListId)
            .eq('user_id', verifiedUserId);
        } else {
          const itemRows = list.items.map((item, index) => ({
            id: ensureValidUUID(item.id),
            list_id: safeListId,
            user_id: verifiedUserId,
            item_name: item.name,
            canonical_name: item.canonicalName || item.name,
            name_urdu: item.nameUrdu || null,
            name_roman_urdu: item.nameRomanUrdu || null,
            emoji: item.emoji || null,
            category: item.categoryId || item.category || 'other',
            quantity: item.quantity || null,
            unit: item.unit || item.note || null,
            raw_input: item.rawInput || null,
            is_completed: Boolean(item.completed),
            is_recognized: Boolean(item.isRecognized),
            sort_order: index,
            updated_at: new Date().toISOString(),
          }));

          const currentItemIds = itemRows.map((r) => r.id);

          // Delete rows that were removed from the list
          await supabase
            .from('shopping_items')
            .delete()
            .eq('list_id', safeListId)
            .eq('user_id', verifiedUserId)
            .not('id', 'in', `(${currentItemIds.join(',')})`);

          // Upsert current items using onConflict on primary key 'id'
          let { error: upsertErr } = await supabase
            .from('shopping_items')
            .upsert(itemRows, { onConflict: 'id' });

          // Schema backward compatibility: if newer columns (canonical_name, etc.) aren't present yet, fallback to base schema
          if (upsertErr && (
            upsertErr.message.includes('column') ||
            upsertErr.message.includes('canonical_name') ||
            upsertErr.message.includes('emoji')
          )) {
            const basicRows = itemRows.map((r) => ({
              id: r.id,
              list_id: r.list_id,
              user_id: r.user_id,
              item_name: r.item_name,
              category: r.category,
              quantity: r.quantity,
              unit: r.unit,
              raw_input: r.raw_input,
              is_completed: r.is_completed,
              sort_order: r.sort_order,
              updated_at: r.updated_at,
            }));
            const retry = await supabase.from('shopping_items').upsert(basicRows, { onConflict: 'id' });
            upsertErr = retry.error;
          }

          if (upsertErr && isNetworkOrOfflineError(upsertErr)) {
            await enqueueOfflineOperation({
              type: 'SAVE_LIST',
              userId: verifiedUserId,
              listId: safeListId,
              payload: listToSave,
            });
            return { success: true, error: null, isOffline: true };
          }
        }
      } catch (childErr) {
        if (isNetworkOrOfflineError(childErr)) {
          await enqueueOfflineOperation({
            type: 'SAVE_LIST',
            userId: verifiedUserId,
            listId: safeListId,
            payload: listToSave,
          });
          return { success: true, error: null, isOffline: true };
        }
      }
    }

    // Mark list as synced in IndexedDB
    await saveOfflineList(verifiedUserId, { ...listToSave, isSynced: true });

    // Clean up any pending offline queue items for this list
    const pending = await getPendingOfflineOperations(verifiedUserId);
    for (const op of pending) {
      if (op.listId === safeListId && (op.type === 'SAVE_LIST' || op.type === 'UPDATE_LIST')) {
        await removePendingOfflineOperation(op.id);
      }
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    if (isNetworkOrOfflineError(err)) {
      await enqueueOfflineOperation({
        type: 'SAVE_LIST',
        userId: verifiedUserId,
        listId: safeListId,
        payload: listToSave,
      });
      return { success: true, error: null, isOffline: true };
    }
    console.warn('Network exception saving list, queuing offline:', err);
    await enqueueOfflineOperation({
      type: 'SAVE_LIST',
      userId: verifiedUserId,
      listId: safeListId,
      payload: listToSave,
    });
    return { success: true, error: null, isOffline: true };
  }
}

/**
 * Delete a shopping list and its child items from Supabase and IndexedDB.
 */
export async function deleteUserShoppingList(
  userId: string,
  listId: string
): Promise<{ success: boolean; error: Error | null; isOffline?: boolean }> {
  const verifiedUserId = (await getVerifiedUserId(userId)) || userId;
  if (!verifiedUserId) {
    return { success: false, error: new Error('Authentication required to delete list') };
  }

  // 1. Immediately delete from IndexedDB
  await deleteOfflineList(verifiedUserId, listId);

  // 2. If offline or no supabase, enqueue DELETE_LIST
  const isCurrentlyOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  if (!supabase || isCurrentlyOffline) {
    await enqueueOfflineOperation({
      type: 'DELETE_LIST',
      userId: verifiedUserId,
      listId,
      payload: { listId },
    });
    return { success: true, error: null, isOffline: true };
  }

  try {
    const { error: itemsError } = await supabase
      .from('shopping_items')
      .delete()
      .eq('list_id', listId)
      .eq('user_id', verifiedUserId);

    if (itemsError && isNetworkOrOfflineError(itemsError)) {
      await enqueueOfflineOperation({
        type: 'DELETE_LIST',
        userId: verifiedUserId,
        listId,
        payload: { listId },
      });
      return { success: true, error: null, isOffline: true };
    }

    const { error: listError } = await supabase
      .from('shopping_lists')
      .delete()
      .eq('id', listId)
      .eq('user_id', verifiedUserId);

    if (listError) {
      if (isNetworkOrOfflineError(listError)) {
        await enqueueOfflineOperation({
          type: 'DELETE_LIST',
          userId: verifiedUserId,
          listId,
          payload: { listId },
        });
        return { success: true, error: null, isOffline: true };
      }
      console.warn('Error deleting from Supabase, queuing offline mutation:', listError.message);
      await enqueueOfflineOperation({
        type: 'DELETE_LIST',
        userId: verifiedUserId,
        listId,
        payload: { listId },
      });
    }

    return { success: true, error: null };
  } catch (err) {
    if (isNetworkOrOfflineError(err)) {
      await enqueueOfflineOperation({
        type: 'DELETE_LIST',
        userId: verifiedUserId,
        listId,
        payload: { listId },
      });
      return { success: true, error: null, isOffline: true };
    }
    console.warn('Exception deleting from Supabase, queuing offline:', err);
    await enqueueOfflineOperation({
      type: 'DELETE_LIST',
      userId: verifiedUserId,
      listId,
      payload: { listId },
    });
    return { success: true, error: null, isOffline: true };
  }
}

/**
 * Clear all shopping lists and items for an authenticated user from Supabase and IndexedDB
 */
export async function clearAllUserShoppingLists(
  userId: string
): Promise<{ success: boolean; error: Error | null }> {
  const verifiedUserId = await getVerifiedUserId(userId);
  if (!verifiedUserId) {
    return { success: false, error: new Error('Authentication required to clear shopping lists') };
  }

  // Clear local IndexedDB first
  await clearUserOfflineLists(verifiedUserId);
  clearOfflineQueue(verifiedUserId);

  if (!supabase) {
    return { success: true, error: null };
  }

  try {
    await supabase
      .from('shopping_items')
      .delete()
      .eq('user_id', verifiedUserId);

    const { error: listsError } = await supabase
      .from('shopping_lists')
      .delete()
      .eq('user_id', verifiedUserId);

    if (listsError) {
      console.error('Error clearing shopping lists:', listsError.message);
      return { success: false, error: new Error(listsError.message) };
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to clear all shopping lists';
    return { success: false, error: new Error(msg) };
  }
}

/**
 * ----------------------------------------------------------------------
 * 3. FREQUENTLY BOUGHT ITEMS OPERATIONS (CREATE, READ, UPDATE, DELETE)
 * ----------------------------------------------------------------------
 */

/**
 * Fetch frequently bought items for the authenticated user
 */
export async function getFrequentlyBoughtItems(
  userId: string
): Promise<{ items: FrequentlyBoughtItem[]; error: Error | null }> {
  if (!supabase) {
    return { items: [], error: null };
  }

  try {
    const verifiedUserId = await getVerifiedUserId(userId);
    if (!verifiedUserId) {
      return { items: [], error: null };
    }
    const { data, error } = await supabase
      .from('frequently_bought_items')
      .select('*')
      .eq('user_id', verifiedUserId)
      .order('purchase_count', { ascending: false })
      .order('last_purchased_at', { ascending: false })
      .limit(30);

    if (error) {
      console.warn('Error fetching frequently bought items:', error.message);
      return { items: [], error: new Error(error.message) };
    }

    const mapped: FrequentlyBoughtItem[] = (data || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      name: row.item_name || row.name,
      category: row.category || 'other',
      purchaseCount: row.purchase_count || 1,
      lastPurchasedAt: row.last_purchased_at || row.updated_at || new Date().toISOString(),
    }));

    return { items: mapped, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to get frequently bought items';
    console.error('Exception in getFrequentlyBoughtItems:', err);
    return { items: [], error: new Error(msg) };
  }
}

/**
 * Record or increment purchase counts for completed items in frequently_bought_items
 */
export async function recordFrequentlyBoughtItems(
  userId: string,
  items: ShoppingItem[]
): Promise<{ success: boolean; error: Error | null }> {
  if (!supabase || items.length === 0 || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return { success: true, error: null };
  }

  try {
    const verifiedUserId = (await getVerifiedUserId(userId)) || userId;
    if (!verifiedUserId) {
      return { success: true, error: null };
    }

    // Fetch existing records to increment purchase_count
    const itemNames = items.map((i) => i.name.trim().toLowerCase());
    const { data: existing, error: fetchError } = await supabase
      .from('frequently_bought_items')
      .select('*')
      .eq('user_id', verifiedUserId);

    if (fetchError && isNetworkOrOfflineError(fetchError)) {
      return { success: true, error: null };
    }

    const existingMap = new Map<string, { id: string; count: number }>();
    if (existing) {
      existing.forEach((row) => {
        existingMap.set(row.item_name.trim().toLowerCase(), {
          id: row.id,
          count: row.purchase_count || 1,
        });
      });
    }

    const upsertRows = items.map((item) => {
      const lowerName = item.name.trim().toLowerCase();
      const existingMatch = existingMap.get(lowerName);
      const rowId = existingMatch ? existingMatch.id : generateUUID();
      const currentCount = existingMatch ? existingMatch.count + 1 : 1;

      return {
        id: rowId,
        user_id: verifiedUserId,
        item_name: item.name.trim(),
        category: item.categoryId || item.category || 'other',
        purchase_count: currentCount,
        last_purchased_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });

    const { error: upsertError } = await supabase
      .from('frequently_bought_items')
      .upsert(upsertRows, { onConflict: 'user_id,item_name' });

    if (upsertError) {
      if (isNetworkOrOfflineError(upsertError)) {
        return { success: true, error: null };
      }
      console.warn('Note recording frequently bought items:', upsertError.message);
      return { success: true, error: null };
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    if (isNetworkOrOfflineError(err)) {
      return { success: true, error: null };
    }
    console.warn('Notice recording frequently bought items:', err);
    return { success: true, error: null };
  }
}

/**
 * Delete a single item from frequently bought items
 */
export async function deleteFrequentlyBoughtItem(
  userId: string,
  itemId: string
): Promise<{ success: boolean; error: Error | null }> {
  if (!supabase) return { success: false, error: new Error('Supabase not configured') };

  try {
    const verifiedUserId = await getVerifiedUserId(userId);
    if (!verifiedUserId) {
      return { success: false, error: new Error('Authentication required to delete frequently bought item') };
    }
    const { error } = await supabase
      .from('frequently_bought_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', verifiedUserId);

    if (error) {
      console.error('Error deleting frequently bought item:', error.message);
      return { success: false, error: new Error(error.message) };
    }
    return { success: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete frequently bought item';
    return { success: false, error: new Error(msg) };
  }
}

/**
 * ----------------------------------------------------------------------
 * 4. ACCOUNT DELETION & FULL DATA PURGE
 * ----------------------------------------------------------------------
 */

/**
 * Permanently delete all user records from Supabase tables (shopping_items, shopping_lists, frequently_bought_items, profiles)
 */
export async function deleteUserAccountData(
  userId: string
): Promise<{ success: boolean; error: Error | null }> {
  if (!supabase) {
    return { success: true, error: null };
  }

  try {
    const verifiedUserId = await getVerifiedUserId(userId);
    if (!verifiedUserId) {
      return { success: false, error: new Error('Authentication required to delete account data') };
    }

    // 1. Delete all user items from public.shopping_items
    const { error: itemsError } = await supabase
      .from('shopping_items')
      .delete()
      .eq('user_id', verifiedUserId);

    if (itemsError) {
      console.warn('Note deleting items during account deletion:', itemsError.message);
    }

    // 2. Delete all frequently bought items
    const { error: freqError } = await supabase
      .from('frequently_bought_items')
      .delete()
      .eq('user_id', verifiedUserId);

    if (freqError) {
      console.warn('Note deleting frequently bought items during account deletion:', freqError.message);
    }

    // 3. Delete all user shopping lists from public.shopping_lists
    const { error: listsError } = await supabase
      .from('shopping_lists')
      .delete()
      .eq('user_id', verifiedUserId);

    if (listsError) {
      console.warn('Note deleting lists during account deletion:', listsError.message);
    }

    // 4. Delete user profile record from public.profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', verifiedUserId);

    if (profileError) {
      console.warn('Note deleting profile during account deletion:', profileError.message);
    }

    clearOfflineQueue(verifiedUserId);
    await purgeAllUserOfflineData(verifiedUserId);
    return { success: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete account data';
    console.error('Exception deleting account data:', err);
    return { success: false, error: new Error(msg) };
  }
}

/**
 * ----------------------------------------------------------------------
 * 5. GRANULAR ITEM CONTROLS & OAUTH
 * ----------------------------------------------------------------------
 */

/**
 * Granular item status toggle
 */
export async function toggleShoppingItemStatus(
  userId: string,
  listId: string,
  itemId: string,
  isCompleted: boolean
): Promise<{ error: Error | null }> {
  if (!supabase || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return { error: null };
  }
  try {
    const verifiedUserId = (await getVerifiedUserId(userId)) || userId;
    if (!verifiedUserId) {
      return { error: null };
    }
    const { error } = await supabase
      .from('shopping_items')
      .update({
        is_completed: isCompleted,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId)
      .eq('list_id', listId)
      .eq('user_id', verifiedUserId);

    if (error && isNetworkOrOfflineError(error)) {
      return { error: null };
    }

    return { error: error ? new Error(error.message) : null };
  } catch (err: unknown) {
    if (isNetworkOrOfflineError(err)) {
      return { error: null };
    }
    const msg = err instanceof Error ? err.message : 'Failed to toggle item';
    return { error: new Error(msg) };
  }
}

/**
 * ----------------------------------------------------------------------
 * 6. OFFLINE SYNC PROCESSING & AUTO NETWORK RECOVERY
 * ----------------------------------------------------------------------
 */

/**
 * Process all pending offline changes from IndexedDB when back online
 */
export async function syncPendingOfflineChanges(
  userId: string
): Promise<{ syncedCount: number; error: Error | null }> {
  if (!supabase || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return { syncedCount: 0, error: null };
  }

  const verifiedUserId = (await getVerifiedUserId(userId)) || userId;
  const queue = await getPendingOfflineOperations(verifiedUserId);
  if (queue.length === 0) {
    return { syncedCount: 0, error: null };
  }

  let syncedCount = 0;

  for (const item of queue) {
    // If connection dropped during sync loop, abort gracefully
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      break;
    }

    try {
      if (item.type === 'SAVE_LIST' || item.type === 'UPDATE_LIST' || item.type === 'CREATE_LIST') {
        const list = item.payload;
        if (list && list.id) {
          const isCompleted = list.items?.length > 0
            ? list.items.every((i: ShoppingItem) => i.completed)
            : Boolean(list.isCompleted);

          const listPayload: Record<string, unknown> = {
            id: list.id,
            user_id: verifiedUserId,
            title: list.title || 'Shopping List',
            icon: list.icon || 'shopping_basket',
            is_completed: isCompleted,
            completed_at: list.completedAt ? (list.completedAt.includes('T') ? list.completedAt : new Date().toISOString()) : (isCompleted ? new Date().toISOString() : null),
            items: list.items || [],
            created_at: list.createdTimestamp ? new Date(list.createdTimestamp).toISOString() : new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { error: listErr, isOffline } = await resilientUpsert('shopping_lists', listPayload);
          if (isOffline || (listErr && isNetworkOrOfflineError(listErr))) {
            // Network failure mid-sync, pause queue processing
            break;
          }

          if (!listErr) {
            if (list.items) {
              await supabase
                .from('shopping_items')
                .delete()
                .eq('list_id', list.id)
                .eq('user_id', verifiedUserId);

              if (list.items.length > 0) {
                const itemRows = list.items.map((it: ShoppingItem, idx: number) => ({
                  id: ensureValidUUID(it.id),
                  list_id: list.id,
                  user_id: verifiedUserId,
                  item_name: it.name,
                  category: it.categoryId || it.category || 'other',
                  quantity: it.quantity || null,
                  unit: it.unit || it.note || null,
                  raw_input: it.rawInput || null,
                  is_completed: Boolean(it.completed),
                  sort_order: idx,
                  updated_at: new Date().toISOString(),
                }));
                await supabase.from('shopping_items').insert(itemRows);
              }
            }

            await saveOfflineList(verifiedUserId, { ...list, isSynced: true });
            await removePendingOfflineOperation(item.id);
            syncedCount++;
          } else {
            await updatePendingOperationStatus(item.id, {
              retryCount: item.retryCount + 1,
              lastError: listErr.message,
              syncStatus: 'failed',
            });
          }
        }
      } else if (item.type === 'DELETE_LIST') {
        const listId = item.payload?.listId || item.listId;
        if (listId) {
          await supabase
            .from('shopping_items')
            .delete()
            .eq('list_id', listId)
            .eq('user_id', verifiedUserId);

          const { error: delErr } = await supabase
            .from('shopping_lists')
            .delete()
            .eq('id', listId)
            .eq('user_id', verifiedUserId);

          if (delErr && isNetworkOrOfflineError(delErr)) {
            break;
          }

          if (!delErr) {
            await removePendingOfflineOperation(item.id);
            syncedCount++;
          } else {
            await updatePendingOperationStatus(item.id, {
              retryCount: item.retryCount + 1,
              lastError: delErr.message,
              syncStatus: 'failed',
            });
          }
        }
      }
    } catch (e: any) {
      if (isNetworkOrOfflineError(e)) {
        break;
      }
      console.warn('Error processing queued offline item:', e);
      await updatePendingOperationStatus(item.id, {
        retryCount: item.retryCount + 1,
        lastError: e?.message || 'Unknown sync error',
        syncStatus: 'failed',
      });
    }
  }

  return { syncedCount, error: null };
}

/**
 * Setup listener for online network state to automatically trigger sync
 */
export function setupNetworkSyncListener(
  userId: string,
  onSyncComplete?: () => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = async () => {
    console.log('Network connection restored. Synchronizing offline changes with Supabase...');
    const result = await syncPendingOfflineChanges(userId);
    if (result.syncedCount > 0 && onSyncComplete) {
      onSyncComplete();
    }
  };

  window.addEventListener('online', handleOnline);
  return () => {
    window.removeEventListener('online', handleOnline);
  };
}

/**
 * Translates technical Supabase authentication errors, rate limits, and network
 * failures into clean, friendly, reassuring messages for end users.
 */
export function formatAuthErrorMessage(error: unknown): string {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const rawMsg = (error instanceof Error ? error.message : String(error)).trim();
  const lower = rawMsg.toLowerCase();

  // Rate limit / security throttle detection
  if (
    lower.includes('security purposes') ||
    lower.includes('rate limit') ||
    lower.includes('too many requests') ||
    lower.includes('over_email_send_rate_limit')
  ) {
    const secondsMatch = rawMsg.match(/(\d+)\s*seconds?/i);
    if (secondsMatch) {
      return `Please wait ${secondsMatch[1]} seconds before trying again.`;
    }
    return 'Too many attempts. Please wait a moment before trying again.';
  }

  // Timeout or abort detection
  if (lower.includes('timed out') || lower.includes('timeout') || lower.includes('aborted') || lower.includes('aborterror')) {
    return 'The connection timed out. Please check your internet connection and try again.';
  }

  // Network / fetch failure detection
  if (
    lower.includes('failed to fetch') ||
    lower.includes('network error') ||
    lower.includes('networkrequestfailed') ||
    lower.includes('err_internet_disconnected') ||
    lower.includes('err_connection')
  ) {
    return 'Unable to reach the server. Please check your internet connection and try again.';
  }

  // Invalid credentials
  if (
    lower.includes('invalid login credentials') ||
    lower.includes('invalid email or password') ||
    lower.includes('invalid_grant')
  ) {
    return 'Incorrect email or password. Please check your credentials and try again.';
  }

  // Duplicate user signup
  if (
    lower.includes('user already registered') ||
    lower.includes('already registered') ||
    lower.includes('already exists') ||
    lower.includes('email already in use')
  ) {
    return 'An account with this email already exists. Please sign in instead.';
  }

  // Password constraints
  if (lower.includes('password should be at least') || lower.includes('password is too short')) {
    return 'Password must be at least 6 characters long.';
  }

  // Invalid email
  if (lower.includes('invalid email') || lower.includes('email is invalid') || lower.includes('unable to validate email')) {
    return 'Please enter a valid email address.';
  }

  if (lower.includes('signup requires a valid password')) {
    return 'Please provide a valid password.';
  }

  // Clean fallback without technical jargon
  if (lower.includes('database error') || lower.includes('postgres') || lower.includes('postgrest') || lower.includes('500')) {
    return 'A temporary service issue occurred. Please try again shortly.';
  }

  return rawMsg || 'Authentication failed. Please try again.';
}

