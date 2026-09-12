/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, ShoppingList, ShoppingItem, CategoryId, FrequentlyBoughtItem } from '../types';
import { generateUUID, isValidUUID, generateDeterministicUUID } from './uuid';
import { broadcastCrossDeviceSync } from './realtimeSync';
import { defaultItemCatalog } from './recognition/catalog';
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
        experimental: {
          passkey: true,
        },
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
 * Safely parse any input quantity into a PostgreSQL NUMERIC compatible float/int or null.
 * Correctly handles fractional quantities like '1/2' or decimals like '1.5'.
 */
export function parseNumericQuantity(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw : null;
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    if (trimmed.includes('/')) {
      const parts = trimmed.split('/');
      if (parts.length === 2) {
        const num = parseFloat(parts[0]);
        const den = parseFloat(parts[1]);
        if (!isNaN(num) && !isNaN(den) && den !== 0) {
          return Number((num / den).toFixed(3));
        }
      }
    }
    const match = trimmed.match(/^[\d.]+/);
    if (match) {
      const parsed = parseFloat(match[0]);
      if (!isNaN(parsed) && Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return null;
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

    // Retrieve user_metadata from Supabase Auth to merge phone_number & setup flags
    let userMeta: Record<string, any> = {};
    try {
      const { data: authUserData } = await supabase.auth.getUser();
      if (authUserData?.user?.id === verifiedUserId) {
        userMeta = authUserData.user.user_metadata || {};
      }
    } catch {}

    const fullProfile: UserProfile = {
      id: verifiedUserId,
      full_name: data?.full_name ?? userMeta.full_name ?? cached?.full_name ?? null,
      email: data?.email ?? userMeta.email ?? cached?.email ?? null,
      phone_number: userMeta.phone_number ?? userMeta.phone ?? cached?.phone_number ?? null,
      avatar_url: data?.avatar_url ?? userMeta.avatar_url ?? cached?.avatar_url ?? null,
      language: data?.language ?? userMeta.language ?? cached?.language ?? 'en',
      usage_purpose: userMeta.usage_purpose ?? cached?.usage_purpose ?? null,
      referral_source: userMeta.referral_source ?? cached?.referral_source ?? null,
      has_completed_setup: userMeta.has_completed_setup ?? cached?.has_completed_setup ?? true,
      created_at: data?.created_at ?? cached?.created_at,
      updated_at: data?.updated_at ?? cached?.updated_at,
    };

    await saveOfflineProfile(verifiedUserId, fullProfile);
    return fullProfile;
  } catch (err) {
    if (!isNetworkOrOfflineError(err)) {
      console.warn('Exception fetching profile:', err);
    }
    return cached;
  }
}

/**
 * Update or insert user profile in Supabase public.profiles table
 * Live database schema constraint:
 * public.profiles contains ONLY: id, full_name, email, avatar_url, language, created_at, updated_at
 * Additional user attributes (phone_number, has_completed_setup, usage_purpose, referral_source)
 * are persisted safely via Supabase Auth user_metadata to avoid PGRST204 errors.
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
    phone_number: updates.phone_number !== undefined ? (updates.phone_number || null) : (existingProfile?.phone_number ?? null),
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
    // 1. Send ONLY valid columns supported by public.profiles:
    // id, full_name, email, avatar_url, language, updated_at
    const validProfilePayload = {
      full_name: mergedProfile.full_name,
      email: mergedProfile.email,
      avatar_url: mergedProfile.avatar_url,
      language: mergedProfile.language,
      updated_at: new Date().toISOString(),
    };

    let upsertData: any = null;
    const { data: updateData, error: updateErr } = await supabase
      .from('profiles')
      .update(validProfilePayload)
      .eq('id', verifiedUserId)
      .select();

    if (!updateErr && updateData && updateData.length > 0) {
      upsertData = updateData;
    } else {
      // Fallback: If row doesn't exist yet, attempt resilientUpsert
      const fallbackResult = await resilientUpsert(
        'profiles',
        { id: verifiedUserId, ...validProfilePayload },
        { onConflict: 'id' }
      );
      upsertData = fallbackResult.data;
    }

    // Broadcast profile update across active devices
    broadcastCrossDeviceSync(verifiedUserId, {
      type: 'PROFILE_UPDATE',
      profile: mergedProfile,
    }).catch(() => {});

    // 2. Persist additional user attributes into Supabase Auth user_metadata
    try {
      const { data: authUserData } = await supabase.auth.getUser();
      if (authUserData?.user) {
        const currentMeta = authUserData.user.user_metadata || {};
        const metaUpdates: Record<string, unknown> = {};

        if (updates.phone_number !== undefined) {
          metaUpdates.phone_number = updates.phone_number;
          metaUpdates.phone = updates.phone_number;
        }
        if (updates.has_completed_setup !== undefined) {
          metaUpdates.has_completed_setup = updates.has_completed_setup;
        }
        if (updates.usage_purpose !== undefined) {
          metaUpdates.usage_purpose = updates.usage_purpose;
        }
        if (updates.referral_source !== undefined) {
          metaUpdates.referral_source = updates.referral_source;
        }
        if (updates.full_name !== undefined) {
          metaUpdates.full_name = updates.full_name;
        }
        if (updates.avatar_url !== undefined) {
          metaUpdates.avatar_url = updates.avatar_url;
        }

        if (Object.keys(metaUpdates).length > 0) {
          await supabase.auth.updateUser({
            data: {
              ...currentMeta,
              ...metaUpdates,
            },
          });
        }
      }
    } catch (metaErr) {
      console.warn('Notice syncing user_metadata in Supabase Auth:', metaErr);
    }

    const savedRow = Array.isArray(upsertData) ? upsertData[0] : upsertData;
    const finalProfile: UserProfile = {
      ...mergedProfile,
      ...(savedRow || {}),
      phone_number: mergedProfile.phone_number,
      has_completed_setup: mergedProfile.has_completed_setup,
      usage_purpose: mergedProfile.usage_purpose,
      referral_source: mergedProfile.referral_source,
    };

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
    // 2. Query public.shopping_lists (RLS server-side authorization returns personal + shared household lists)
    let listsData: any[] | null = null;
    const { data: orderedData, error: listsError } = await supabase
      .from('shopping_lists')
      .select('*')
      .order('created_at', { ascending: false });

    if (listsError) {
      if (isNetworkOrOfflineError(listsError)) {
        return { lists: cachedOfflineLists, error: null, isOffline: true };
      }
      console.warn('Note on ordered lists query, attempting general select:', listsError.message);
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('shopping_lists')
        .select('*');

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
      // If user has 0 lists on remote Supabase and no pending offline ops, synchronize local IndexedDB
      await saveOfflineListsBatch(verifiedUserId, []);
      return { lists: [], error: null };
    }

    // 3. Query child public.shopping_items table for normalized list items
    // RLS authorizes access based on parent list membership
    const listIds = listsData.map((l) => l.id);
    const { data: itemsData, error: itemsError } = await supabase
      .from('shopping_items')
      .select('*')
      .in('list_id', listIds);

    if (itemsError) {
      console.warn('Note loading child shopping_items (falling back to embedded JSON):', itemsError.message);
    }

    const itemsByListId = new Map<string, ShoppingItem[]>();
    if (itemsData && itemsData.length > 0) {
      itemsData.forEach((row) => {
        const itemCreatedAt = row.created_at ? new Date(row.created_at).getTime() : undefined;
        const recognized = defaultItemCatalog.findItemByName(row.item_name);

        const item: ShoppingItem = {
          id: row.id,
          name: row.item_name || row.name || '',
          canonicalName: row.canonical_name || recognized?.canonicalName || row.item_name,
          nameUrdu: row.name_urdu || recognized?.nameUrdu || recognized?.urdu_name || undefined,
          nameRomanUrdu: row.name_roman_urdu || recognized?.nameRomanUrdu || recognized?.roman_urdu_names?.[0] || undefined,
          emoji: row.emoji || recognized?.emoji || undefined,
          categoryId: (row.category || recognized?.categoryId || 'other') as CategoryId,
          category: row.category || recognized?.category || 'other',
          quantity: row.quantity !== null && row.quantity !== undefined ? String(row.quantity) : undefined,
          unit: row.unit || recognized?.defaultUnit || undefined,
          completed: Boolean(row.is_completed ?? row.is_checked),
          rawInput: row.raw_input || row.item_name,
          note: row.note || undefined,
          isRecognized: Boolean(row.is_recognized || recognized),
          createdAt: itemCreatedAt,
          created_at: row.created_at || undefined,
          updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : undefined,
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
            createdAt: rItem.createdAt || (fItem.createdAt ?? (fItem.created_at ? new Date(fItem.created_at).getTime() : undefined)),
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

      const completedTimestamp = row.completed_at
        ? new Date(row.completed_at).getTime()
        : undefined;

      return {
        id: row.id,
        userId: row.user_id,
        householdId: row.household_id || null,
        household_id: row.household_id || null,
        title: row.title || 'Shopping List',
        createdAt: createdAtFormatted,
        createdTimestamp: createdTime,
        completedAt: row.completed_at || (isCompleted ? 'Completed' : undefined),
        completedTimestamp,
        isCompleted,
        icon: row.icon || 'shopping_basket',
        items: finalItems,
        isSynced: true,
      };
    });

    // 5. Conflict-Safe Merge with Pending Offline Changes
    const pendingOps = await getPendingOfflineOperations(verifiedUserId);
    const pendingDeleteListIds = new Set(
      pendingOps.filter((op) => op.type === 'DELETE_LIST').map((op) => op.listId)
    );
    const pendingSaveOps = pendingOps.filter((op) => op.type !== 'DELETE_LIST');
    const pendingSaveListIds = new Set(pendingSaveOps.map((op) => op.listId));

    // Filter out lists that were deleted locally while offline so they aren't resurrected
    const activeRemoteLists = remoteLists.filter((rl) => !pendingDeleteListIds.has(rl.id));

    const mergedLists: ShoppingList[] = activeRemoteLists.map((remoteList) => {
      if (pendingSaveListIds.has(remoteList.id)) {
        const localVersion = cachedOfflineLists.find((cl) => cl.id === remoteList.id);
        if (localVersion) {
          // Merge local modifications with remote so local edits are preserved without losing remote additions
          const localItemIds = new Set(localVersion.items.map((i) => i.id));
          const nonConflictingRemoteItems = remoteList.items.filter((ri) => !localItemIds.has(ri.id));
          return {
            ...localVersion,
            items: [...localVersion.items, ...nonConflictingRemoteItems],
            isSynced: false,
          };
        }
      }
      return remoteList;
    });

    // Include only genuinely new, unsynced local drafts that have not yet reached Supabase
    // If a list was previously synced (isSynced !== false) and is missing from activeRemoteLists,
    // it was deleted from Supabase and must NOT be resurrected as a ghost card!
    cachedOfflineLists.forEach((localList) => {
      const isPendingSave = pendingSaveListIds.has(localList.id);
      const isUnsyncedDraft = localList.isSynced === false;
      if (
        !pendingDeleteListIds.has(localList.id) &&
        !activeRemoteLists.some((rl) => rl.id === localList.id) &&
        (isPendingSave || isUnsyncedDraft)
      ) {
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
    const isCompleted = Boolean(list.isCompleted) || (list.items.length > 0 && list.items.every((i) => i.completed));

    const createdIso = list.createdTimestamp
      ? new Date(list.createdTimestamp).toISOString()
      : new Date().toISOString();

    const listPayload: Record<string, unknown> = {
      id: safeListId,
      user_id: list.userId || verifiedUserId,
      household_id: list.householdId || list.household_id || null,
      title: list.title || 'Shopping List',
      icon: list.icon || 'shopping_basket',
      is_completed: isCompleted,
      completed_at: list.completedAt ? (list.completedAt.includes('T') ? list.completedAt : new Date().toISOString()) : (isCompleted ? new Date().toISOString() : null),
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
          // List has no items, clear any existing rows (RLS verifies list access)
          await supabase
            .from('shopping_items')
            .delete()
            .eq('list_id', safeListId);
        } else {
          const itemRows = list.items.map((item) => {
            const numericQty = parseNumericQuantity(item.quantity);
            let unitValue = item.unit || item.note || null;
            if (numericQty === null && item.quantity && typeof item.quantity === 'string' && item.quantity.trim()) {
              unitValue = unitValue ? `${item.quantity.trim()} ${unitValue}` : item.quantity.trim();
            }

            return {
              id: ensureValidUUID(item.id),
              list_id: safeListId,
              user_id: verifiedUserId,
              item_name: item.name,
              category: item.categoryId || item.category || 'other',
              quantity: numericQty,
              unit: unitValue,
              is_completed: Boolean(item.completed),
              updated_at: new Date().toISOString(),
            };
          });

          const currentItemIds = itemRows.map((r) => r.id);

          // Delete rows that were removed from the list (RLS verifies list access)
          await supabase
            .from('shopping_items')
            .delete()
            .eq('list_id', safeListId)
            .not('id', 'in', `(${currentItemIds.join(',')})`);

          // Upsert current items using onConflict on primary key 'id'
          const { error: upsertErr } = await supabase
            .from('shopping_items')
            .upsert(itemRows, { onConflict: 'id' });

          if (upsertErr) {
            console.warn('Note upserting shopping_items:', upsertErr.message);
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

    // Broadcast cross-device sync event
    broadcastCrossDeviceSync(verifiedUserId, {
      type: 'LIST_UPSERT',
      list: { ...listToSave, isSynced: true },
    }).catch(() => {});

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
 * Updates an individual shopping item's completion status in Supabase and IndexedDB.
 * Sets is_completed = true/false and updated_at = current timestamp in public.shopping_items,
 * syncs the parent shopping_list, broadcasts real-time cross-device event,
 * and gracefully queues offline changes if disconnected.
 */
export async function updateShoppingItemCompletionStatus(
  userId: string,
  listId: string,
  itemId: string,
  isCompleted: boolean,
  updatedList: ShoppingList
): Promise<{ success: boolean; error: Error | null; isOffline?: boolean }> {
  const verifiedUserId = ensureValidUUID(userId);
  const safeListId = ensureValidUUID(listId);
  const safeItemId = ensureValidUUID(itemId);
  const nowIso = new Date().toISOString();

  const isCurrentlyOffline =
    !isSupabaseConfigured ||
    !supabase ||
    (typeof navigator !== 'undefined' && !navigator.onLine);

  if (isCurrentlyOffline) {
    // 1. Persist to local IndexedDB
    await saveOfflineList(verifiedUserId, { ...updatedList, isSynced: false });
    // 2. Queue offline mutation
    await enqueueOfflineOperation({
      type: 'SAVE_LIST',
      userId: verifiedUserId,
      listId: safeListId,
      payload: updatedList,
    });
    return { success: true, error: null, isOffline: true };
  }

  try {
    // 1. Direct targeted atomic update on public.shopping_items table (RLS authorizes based on parent list)
    const { error: itemUpdateErr } = await supabase
      .from('shopping_items')
      .update({
        is_completed: isCompleted,
        updated_at: nowIso,
      })
      .eq('id', safeItemId);

    if (itemUpdateErr) {
      console.warn('Notice updating individual shopping_item, attempting fallback update:', itemUpdateErr.message);
    }

    // 2. Update the parent shopping_list row (completion flag and updated_at)
    await supabase
      .from('shopping_lists')
      .update({
        is_completed: Boolean(updatedList.isCompleted),
        completed_at: updatedList.isCompleted ? (updatedList.completedAt || nowIso) : null,
        updated_at: nowIso,
      })
      .eq('id', safeListId);

    // 3. Keep local cache in IndexedDB in sync
    await saveOfflineList(verifiedUserId, { ...updatedList, isSynced: true });

    // 4. Real-time broadcast to other active devices
    broadcastCrossDeviceSync(verifiedUserId, {
      type: 'LIST_UPSERT',
      list: { ...updatedList, isSynced: true },
    }).catch(() => {});

    return { success: true, error: null, isOffline: false };
  } catch (err: unknown) {
    if (isNetworkOrOfflineError(err)) {
      await saveOfflineList(verifiedUserId, { ...updatedList, isSynced: false });
      await enqueueOfflineOperation({
        type: 'SAVE_LIST',
        userId: verifiedUserId,
        listId: safeListId,
        payload: updatedList,
      });
      return { success: true, error: null, isOffline: true };
    }
    return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Delete a single shopping item from Supabase and IndexedDB.
 */
export async function deleteShoppingListItem(
  userId: string,
  listId: string,
  itemId: string
): Promise<{ success: boolean; error: Error | null; isOffline?: boolean }> {
  const verifiedUserId = (await getVerifiedUserId(userId)) || userId;
  if (!verifiedUserId) {
    return { success: false, error: new Error('Authentication required to delete item') };
  }

  const safeListId = ensureValidUUID(listId);
  const safeItemId = ensureValidUUID(itemId);

  // 1. Immediately update IndexedDB cached list
  try {
    const cachedLists = await getOfflineLists(verifiedUserId);
    const target = cachedLists.find((l) => l.id === safeListId);
    if (target) {
      const remainingItems = target.items.filter((i) => i.id !== safeItemId);
      const isCompleted = remainingItems.length > 0 && remainingItems.every((i) => i.completed);
      await saveOfflineList(verifiedUserId, {
        ...target,
        items: remainingItems,
        isCompleted,
        isSynced: false,
      });
    }
  } catch (e) {
    console.warn('Notice updating local item in IndexedDB:', e);
  }

  // 2. If offline, enqueue DELETE_ITEM
  const isCurrentlyOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  if (!supabase || isCurrentlyOffline) {
    await enqueueOfflineOperation({
      type: 'DELETE_ITEM',
      userId: verifiedUserId,
      listId: safeListId,
      itemId: safeItemId,
      payload: { itemId: safeItemId, listId: safeListId },
    });
    return { success: true, error: null, isOffline: true };
  }

  // 3. Perform database deletion on public.shopping_items (RLS verifies access)
  try {
    const { error } = await supabase
      .from('shopping_items')
      .delete()
      .eq('id', safeItemId)
      .eq('list_id', safeListId);

    if (error) {
      if (isNetworkOrOfflineError(error)) {
        await enqueueOfflineOperation({
          type: 'DELETE_ITEM',
          userId: verifiedUserId,
          listId: safeListId,
          itemId: safeItemId,
          payload: { itemId: safeItemId, listId: safeListId },
        });
        return { success: true, error: null, isOffline: true };
      }
      console.warn('Error deleting item from Supabase:', error.message);
      return { success: false, error: new Error(error.message) };
    }

    // Broadcast cross-device update
    broadcastCrossDeviceSync(verifiedUserId, {
      type: 'ITEM_DELETE',
      listId: safeListId,
      itemId: safeItemId,
    }).catch(() => {});

    return { success: true, error: null };
  } catch (err: unknown) {
    if (isNetworkOrOfflineError(err)) {
      await enqueueOfflineOperation({
        type: 'DELETE_ITEM',
        userId: verifiedUserId,
        listId: safeListId,
        itemId: safeItemId,
        payload: { itemId: safeItemId, listId: safeListId },
      });
      return { success: true, error: null, isOffline: true };
    }
    return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
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
      .eq('list_id', listId);

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
      .eq('id', listId);

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

    // Broadcast delete to other devices
    broadcastCrossDeviceSync(verifiedUserId, {
      type: 'LIST_DELETE',
      listId,
    }).catch(() => {});

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
  const verifiedUserId = (await getVerifiedUserId(userId)) || userId;
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
    const verifiedUserId = (await getVerifiedUserId(userId)) || userId;
    if (!verifiedUserId) {
      return { items: [], error: null };
    }
    const { data, error } = await supabase
      .from('shopping_history')
      .select('*')
      .eq('user_id', verifiedUserId)
      .order('purchased_at', { ascending: false })
      .limit(100);

    if (error) {
      console.warn('Error fetching shopping_history:', error.message);
      return { items: [], error: null };
    }

    const countMap = new Map<string, { count: number; lastPurchasedAt: string; category: string; id: string }>();
    (data || []).forEach((row) => {
      const name = (row.item_name || '').trim();
      if (!name) return;
      const key = name.toLowerCase();
      const existing = countMap.get(key);
      if (existing) {
        existing.count += 1;
        if (new Date(row.purchased_at).getTime() > new Date(existing.lastPurchasedAt).getTime()) {
          existing.lastPurchasedAt = row.purchased_at;
        }
      } else {
        countMap.set(key, {
          id: row.id,
          count: 1,
          lastPurchasedAt: row.purchased_at || new Date().toISOString(),
          category: 'other',
        });
      }
    });

    const mapped: FrequentlyBoughtItem[] = Array.from(countMap.entries()).map(([key, val]) => ({
      id: val.id,
      userId: verifiedUserId,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      category: val.category,
      purchaseCount: val.count,
      lastPurchasedAt: val.lastPurchasedAt,
    }));

    mapped.sort((a, b) => b.purchaseCount - a.purchaseCount);

    return { items: mapped.slice(0, 30), error: null };
  } catch (err: unknown) {
    return { items: [], error: null };
  }
}

/**
 * Record a completed shopping list session and its completed items into shopping_history.
 * Uses deterministic UUIDs based on listId, sessionId, and itemId so repeated calls
 * will NEVER insert duplicate rows into shopping_history.
 */
export async function recordCompletedShoppingTrip(
  userId: string,
  list: ShoppingList,
  sessionId?: string
): Promise<void> {
  if (!supabase || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
  const verifiedUserId = (await getVerifiedUserId(userId)) || userId;
  if (!verifiedUserId || !list.items || list.items.length === 0) return;

  const completedItems = list.items.filter((it) => it.completed);
  if (completedItems.length === 0) return;

  const stableSessionId = sessionId || list.completionSessionId || list.id;
  const purchaseTimeIso = list.completedAt || new Date().toISOString();

  try {
    const historyRows = completedItems.map((it) => {
      const numericQty = parseNumericQuantity(it.quantity);
      let unitValue = it.unit || it.note || null;
      if (numericQty === null && it.quantity && typeof it.quantity === 'string' && it.quantity.trim()) {
        unitValue = unitValue ? `${it.quantity.trim()} ${unitValue}` : it.quantity.trim();
      }

      // Stable deterministic UUID prevents duplicate rows if called repeatedly
      const deterministicId = generateDeterministicUUID(`${list.id}_${stableSessionId}_${it.id}`);

      return {
        id: deterministicId,
        user_id: verifiedUserId,
        item_name: it.name.trim(),
        canonical_name: it.canonicalName || it.name.trim(),
        quantity: numericQty,
        unit: unitValue,
        purchased_at: purchaseTimeIso,
        source_list_id: ensureValidUUID(list.id),
        created_at: purchaseTimeIso,
      };
    });

    // Idempotent upsert on primary key 'id' completely prevents duplicates
    const { error } = await supabase
      .from('shopping_history')
      .upsert(historyRows, { onConflict: 'id' });

    if (error) {
      console.warn('Note recording to shopping_history:', error.message);
    }
  } catch (err) {
    console.warn('Exception recording completed shopping trip:', err);
  }
}

/**
 * Persists a completed shopping list session to Supabase and marks it permanently completed.
 * 
 * Strict Database Guarantees:
 * - Real database write must succeed before UI confirms permanent completion.
 * - If Supabase returns an error, returns { success: false, error } so UI does NOT falsely show completion.
 * - Uses stable completion session ID to prevent duplicate history records even if animation or request runs twice.
 * - Idempotently upserts items with deterministic UUIDs into shopping_history.
 * - Broadcasts real-time sync event so second devices update immediately.
 */
export async function persistCompletedShoppingSession(
  userId: string,
  list: ShoppingList,
  completionSessionId?: string
): Promise<{ success: boolean; error: Error | null; isOffline?: boolean }> {
  const verifiedUserId = (await getVerifiedUserId(userId)) || userId;
  if (!verifiedUserId) {
    return { success: false, error: new Error('User authentication required') };
  }

  const safeListId = list.id || generateUUID();
  const sessionId = list.completionSessionId || completionSessionId || generateUUID();
  const nowIso = list.completedAt || new Date().toISOString();

  const completedList: ShoppingList = {
    ...list,
    id: safeListId,
    userId: verifiedUserId,
    isCompleted: true,
    completedAt: nowIso,
    completedTimestamp: list.completedTimestamp || new Date(nowIso).getTime(),
    completionSessionId: sessionId,
    isSynced: false,
  };

  // 1. Persist to local IndexedDB (instant offline safety)
  await saveOfflineList(verifiedUserId, completedList);

  const isCurrentlyOffline = typeof navigator !== 'undefined' && !navigator.onLine;

  if (!supabase || isCurrentlyOffline) {
    // Graceful offline completion: queued for background sync
    await enqueueOfflineOperation({
      type: 'SAVE_LIST',
      userId: verifiedUserId,
      listId: safeListId,
      payload: completedList,
    });
    return { success: true, error: null, isOffline: true };
  }

  try {
    // 2. Persist to Supabase public.shopping_lists
    const listPayload: Record<string, unknown> = {
      id: safeListId,
      user_id: verifiedUserId,
      title: completedList.title || 'Shopping List',
      icon: completedList.icon || 'shopping_basket',
      is_completed: true,
      completed_at: nowIso,
      updated_at: new Date().toISOString(),
    };

    const { error: listError } = await resilientUpsert('shopping_lists', listPayload);
    if (listError) {
      console.error('Database write failed for shopping list completion:', listError);
      return { success: false, error: listError };
    }

    // 3. Persist child public.shopping_items with completed states
    if (completedList.items && completedList.items.length > 0) {
      const itemRows = completedList.items.map((item) => {
        const numericQty = parseNumericQuantity(item.quantity);
        let unitValue = item.unit || item.note || null;
        if (numericQty === null && item.quantity && typeof item.quantity === 'string' && item.quantity.trim()) {
          unitValue = unitValue ? `${item.quantity.trim()} ${unitValue}` : item.quantity.trim();
        }

        return {
          id: ensureValidUUID(item.id),
          list_id: safeListId,
          user_id: verifiedUserId,
          item_name: item.name,
          category: item.categoryId || item.category || 'other',
          quantity: numericQty,
          unit: unitValue,
          is_completed: Boolean(item.completed),
          updated_at: new Date().toISOString(),
        };
      });

      const { error: itemsErr } = await supabase
        .from('shopping_items')
        .upsert(itemRows, { onConflict: 'id' });

      if (itemsErr) {
        console.warn('Note updating shopping_items during completion:', itemsErr.message);
      }
    }

    // 4. Idempotently record purchased items in shopping_history (stable deterministic UUIDs)
    await recordCompletedShoppingTrip(verifiedUserId, completedList, sessionId);

    // 5. Update local cache to marked as synced
    await saveOfflineList(verifiedUserId, { ...completedList, isSynced: true });

    // 6. Realtime Cross-Device Broadcast
    broadcastCrossDeviceSync(verifiedUserId, {
      type: 'LIST_UPSERT',
      list: { ...completedList, isSynced: true },
    });

    return { success: true, error: null };
  } catch (err: any) {
    console.error('Exception persisting completed shopping session:', err);
    return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Record or increment purchase counts for completed items in shopping_history
 */
export async function recordFrequentlyBoughtItems(
  userId: string,
  items: ShoppingItem[],
  listId?: string
): Promise<{ success: boolean; error: Error | null }> {
  if (!supabase || items.length === 0 || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return { success: true, error: null };
  }

  try {
    const verifiedUserId = (await getVerifiedUserId(userId)) || userId;
    if (!verifiedUserId) {
      return { success: true, error: null };
    }

    const rows = items.map((item) => {
      const numericQty = parseNumericQuantity(item.quantity);
      let unitValue = item.unit || item.note || null;
      if (numericQty === null && item.quantity && typeof item.quantity === 'string' && item.quantity.trim()) {
        unitValue = unitValue ? `${item.quantity.trim()} ${unitValue}` : item.quantity.trim();
      }

      return {
        id: generateUUID(),
        user_id: verifiedUserId,
        item_name: item.name.trim(),
        canonical_name: item.canonicalName || item.name.trim(),
        quantity: numericQty,
        unit: unitValue,
        purchased_at: new Date().toISOString(),
        source_list_id: listId ? ensureValidUUID(listId) : null,
        created_at: new Date().toISOString(),
      };
    });

    const { error: insertError } = await supabase
      .from('shopping_history')
      .insert(rows);

    if (insertError) {
      console.warn('Note recording shopping_history:', insertError.message);
    }
    return { success: true, error: null };
  } catch (err: unknown) {
    console.warn('Notice recording shopping_history:', err);
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
    const verifiedUserId = (await getVerifiedUserId(userId)) || userId;
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
    const verifiedUserId = (await getVerifiedUserId(userId)) || userId;
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

    // 2. Delete all shopping history
    const { error: histError } = await supabase
      .from('shopping_history')
      .delete()
      .eq('user_id', verifiedUserId);

    if (histError) {
      console.warn('Note deleting shopping history during account deletion:', histError.message);
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
            user_id: list.userId || verifiedUserId,
            household_id: list.householdId || list.household_id || null,
            title: list.title || 'Shopping List',
            icon: list.icon || 'shopping_basket',
            is_completed: isCompleted,
            completed_at: list.completedAt ? (list.completedAt.includes('T') ? list.completedAt : new Date().toISOString()) : (isCompleted ? new Date().toISOString() : null),
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
                .eq('list_id', list.id);

              if (list.items.length > 0) {
                const itemRows = list.items.map((it: ShoppingItem) => {
                  const numericQty = parseNumericQuantity(it.quantity);
                  let unitValue = it.unit || it.note || null;
                  if (numericQty === null && it.quantity && typeof it.quantity === 'string' && it.quantity.trim()) {
                    unitValue = unitValue ? `${it.quantity.trim()} ${unitValue}` : it.quantity.trim();
                  }

                  return {
                    id: ensureValidUUID(it.id),
                    list_id: list.id,
                    user_id: verifiedUserId,
                    item_name: it.name,
                    category: it.categoryId || it.category || 'other',
                    quantity: numericQty,
                    unit: unitValue,
                    is_completed: Boolean(it.completed),
                    updated_at: new Date().toISOString(),
                  };
                });
                await supabase.from('shopping_items').upsert(itemRows, { onConflict: 'id' });
              }
            }

            await saveOfflineList(verifiedUserId, { ...list, isSynced: true });
            await removePendingOfflineOperation(item.id);
            syncedCount++;
          } else {
            const errCode = (listErr as any)?.code;
            const isTerminalError = item.retryCount >= 5 || errCode === '23503' || errCode === '42501';
            if (isTerminalError) {
              console.warn('Terminal error syncing list mutation, dropping from queue:', listErr.message);
              await removePendingOfflineOperation(item.id);
            } else {
              await updatePendingOperationStatus(item.id, {
                retryCount: item.retryCount + 1,
                lastError: listErr.message,
                syncStatus: 'failed',
              });
            }
          }
        }
      } else if (item.type === 'DELETE_LIST') {
        const listId = item.payload?.listId || item.listId;
        if (listId) {
          await supabase
            .from('shopping_items')
            .delete()
            .eq('list_id', listId);

          const { error: delErr } = await supabase
            .from('shopping_lists')
            .delete()
            .eq('id', listId);

          if (delErr && isNetworkOrOfflineError(delErr)) {
            break;
          }

          if (!delErr) {
            await removePendingOfflineOperation(item.id);
            syncedCount++;
          } else {
            const isTerminalError = item.retryCount >= 5 || delErr.code === '42501';
            if (isTerminalError) {
              await removePendingOfflineOperation(item.id);
            } else {
              await updatePendingOperationStatus(item.id, {
                retryCount: item.retryCount + 1,
                lastError: delErr.message,
                syncStatus: 'failed',
              });
            }
          }
        }
      } else if (item.type === 'DELETE_ITEM') {
        const itemId = item.payload?.itemId || item.itemId;
        if (itemId) {
          const { error: delItemErr } = await supabase
            .from('shopping_items')
            .delete()
            .eq('id', itemId);

          if (delItemErr && isNetworkOrOfflineError(delItemErr)) {
            break;
          }

          if (!delItemErr) {
            await removePendingOfflineOperation(item.id);
            syncedCount++;
          } else {
            const isTerminalError = item.retryCount >= 5 || delItemErr.code === '42501';
            if (isTerminalError) {
              await removePendingOfflineOperation(item.id);
            } else {
              await updatePendingOperationStatus(item.id, {
                retryCount: item.retryCount + 1,
                lastError: delItemErr.message,
                syncStatus: 'failed',
              });
            }
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
  if (!error) return 'Something went wrong while creating your account. Please try again.';

  // Log the raw technical error to developer console in development mode
  if (typeof window !== 'undefined' && (import.meta.env?.DEV || process.env.NODE_ENV !== 'production')) {
    console.error('[Auth Error Technical Log]:', error);
  }

  let rawMsg = '';
  if (error instanceof Error) {
    rawMsg = error.message;
  } else if (typeof error === 'object' && error !== null) {
    const errObj = error as Record<string, any>;
    rawMsg =
      errObj.msg ||
      errObj.message ||
      errObj.error_description ||
      (typeof errObj.toString === 'function' && errObj.toString() !== '[object Object]'
        ? errObj.toString()
        : JSON.stringify(error));
  } else {
    rawMsg = String(error || '');
  }
  rawMsg = rawMsg.trim();
  const lower = rawMsg.toLowerCase();

  // 1. NETWORK ERROR
  if (
    (typeof navigator !== 'undefined' && !navigator.onLine) ||
    lower.includes('failed to fetch') ||
    lower.includes('fetch failed') ||
    lower.includes('network error') ||
    lower.includes('networkrequestfailed') ||
    lower.includes('err_internet_disconnected') ||
    lower.includes('err_connection') ||
    lower.includes('timed out') ||
    lower.includes('timeout') ||
    lower.includes('aborterror') ||
    lower.includes('abort')
  ) {
    return "You're offline. Please reconnect to continue.";
  }

  // 2. EMAIL ALREADY REGISTERED
  if (
    lower.includes('user already registered') ||
    lower.includes('already registered') ||
    lower.includes('already exists') ||
    lower.includes('email already in use') ||
    lower.includes('email_exists')
  ) {
    return 'This email is already registered.';
  }

  // 2b. PASSWORD RESET TOKEN / LINK ERRORS
  if (
    lower.includes('otp_expired') ||
    lower.includes('token_expired') ||
    lower.includes('token has expired') ||
    lower.includes('email link is invalid') ||
    (lower.includes('recovery link') && lower.includes('expired')) ||
    (lower.includes('invalid') && (lower.includes('token') || lower.includes('otp') || lower.includes('recovery')))
  ) {
    return 'This password reset link is invalid or has expired. Please request a new one.';
  }

  // 3. INVALID EMAIL
  if (
    lower.includes('invalid email') ||
    lower.includes('email is invalid') ||
    lower.includes('unable to validate email') ||
    lower.includes('email_address_invalid')
  ) {
    return 'Please enter a valid email address.';
  }

  // 4. WEAK PASSWORD
  if (
    lower.includes('password should be at least') ||
    lower.includes('password is too short') ||
    lower.includes('weak_password') ||
    lower.includes('signup requires a valid password')
  ) {
    return 'Please choose a stronger password.';
  }

  // 5. RATE LIMIT
  if (
    lower.includes('security purposes') ||
    lower.includes('rate limit') ||
    lower.includes('too many requests') ||
    lower.includes('over_email_send_rate_limit') ||
    lower.includes('429')
  ) {
    return 'Please wait a moment and try again.';
  }

  // 6. INVALID CREDENTIALS (for sign-in)
  if (
    lower.includes('invalid login credentials') ||
    lower.includes('invalid email or password') ||
    lower.includes('invalid_grant')
  ) {
    return 'Incorrect email or password. Please check your credentials and try again.';
  }

  // 7. WEBAUTHN / PASSKEY ERRORS
  if (
    lower.includes('notallowederror') ||
    lower.includes('operation either timed out or was not allowed') ||
    lower.includes('user cancelled') ||
    lower.includes('user canceled') ||
    lower.includes('passkey request was cancelled') ||
    lower.includes('ceremony was cancelled')
  ) {
    return 'Passkey sign-in was cancelled.';
  }

  if (
    lower.includes('notsupportederror') ||
    lower.includes('does not support webauthn') ||
    lower.includes('passkeys are not supported') ||
    lower.includes('authenticator is not available')
  ) {
    return 'Passkeys are not supported on this browser or device. Please continue with Email or Google.';
  }

  if (
    lower.includes('no passkey') ||
    lower.includes('no credentials') ||
    lower.includes('not found on this account') ||
    lower.includes('passkey was not found') ||
    lower.includes('failed to find')
  ) {
    return 'No passkey found for this account/device. Use Email or Google to sign in.';
  }

  if (
    lower.includes('securityerror') ||
    lower.includes('relying party id') ||
    lower.includes('rp id') ||
    lower.includes('not a valid domain string') ||
    lower.includes('domain-bound') ||
    lower.includes('yaad-mudassirbashir530-creators-projects.vercel.app')
  ) {
    return 'Passkey authentication is domain-bound to production (yaad-mudassirbashir530-creators-projects.vercel.app). On this preview environment, please continue with Email or Google.';
  }

  // 8. OAUTH PROVIDER, CANCELLATION & ERRORS
  if (
    lower.includes('unsupported provider') ||
    lower.includes('provider is not enabled') ||
    lower.includes('provider_not_enabled') ||
    lower.includes('validation_failed') ||
    (lower.includes('provider') && lower.includes('not enabled'))
  ) {
    return 'Google sign-in is not enabled in your Supabase project. Please enable Google in your Supabase Dashboard (Authentication → Providers → Google) or sign in with Email.';
  }

  if (
    lower.includes('redirect_uri_mismatch') ||
    lower.includes('redirect uri') ||
    lower.includes('redirect_uri')
  ) {
    return 'Google OAuth redirect URI mismatch. Please ensure your site URL and redirect URLs are configured in your Supabase Dashboard (Authentication → URL Configuration).';
  }

  if (
    lower.includes('invalid_client') ||
    lower.includes('client secret') ||
    lower.includes('bad_client_id')
  ) {
    return 'Google OAuth credentials are invalid. Please check your Google Client ID and Secret in your Supabase Dashboard (Authentication → Providers → Google).';
  }

  if (
    lower.includes('access_denied') ||
    lower.includes('oauth cancelled') ||
    lower.includes('user denied access') ||
    lower.includes('flow was cancelled') ||
    lower.includes('cancelled')
  ) {
    return 'Google sign-in was cancelled. You can try again or continue with another sign-in method.';
  }

  if (lower.includes('oauth') && (lower.includes('error') || lower.includes('failed'))) {
    return 'Google sign-in could not be completed. Please try again or sign in with Email.';
  }

  // 9. TECHNICAL / DATABASE / UNKNOWN JARGON
  // Strictly filter out any technical jargon: PGRST, PostgREST, Supabase, JWT, WebAuthn, stack traces
  if (
    lower.includes('pgrst') ||
    lower.includes('postgrest') ||
    lower.includes('supabase') ||
    lower.includes('jwt') ||
    lower.includes('webauthn') ||
    lower.includes('authapierror') ||
    lower.includes('schema cache') ||
    lower.includes('relation does not exist') ||
    lower.includes('database error') ||
    lower.includes('postgres') ||
    lower.includes('column') ||
    lower.includes('relation') ||
    lower.includes('syntax') ||
    lower.includes('violates') ||
    lower.includes('constraint') ||
    lower.includes('500') ||
    lower.includes('502') ||
    lower.includes('503') ||
    lower.includes('error:') ||
    lower.includes('at ') ||
    lower.includes('uncaught') ||
    lower.includes('stack') ||
    lower.includes('trace') ||
    lower.includes('typeerror') ||
    lower.includes('referenceerror') ||
    lower.includes('object')
  ) {
    if (lower.includes('jwt')) {
      return 'Your authentication session has expired. Please sign in again.';
    }
    if (lower.includes('webauthn')) {
      return 'Passkey authentication could not be completed on this device. Please continue with Email or Google.';
    }
    return 'Something went wrong while completing authentication. Please try again.';
  }

  // 10. PASSWORD RESET RATE LIMITS & FEEDBACK
  if (lower.includes('for security purposes') || lower.includes('over_email_send_rate_limit')) {
    return 'For security purposes, please wait a moment before requesting another password reset email.';
  }

  // If the message is already clean user text (e.g. from local validation), return it
  if (rawMsg && !rawMsg.includes('{') && !rawMsg.includes(';') && !rawMsg.includes('\n') && rawMsg.length < 120) {
    return rawMsg;
  }

  return 'Something went wrong while completing authentication. Please try again.';
}

/**
 * Clean OAuth callback tokens, code, and error parameters from URL bar
 * without reloading the page.
 */
export function cleanAuthUrlParams(): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    let modified = false;

    // Parameters to remove from search query
    const searchKeysToRemove = ['code', 'state', 'error', 'error_description', 'error_code'];
    for (const key of searchKeysToRemove) {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        modified = true;
      }
    }

    // Parameters in URL hash (fragment)
    if (url.hash) {
      const hashContent = url.hash.startsWith('#') ? url.hash.substring(1) : url.hash;
      if (
        hashContent.includes('access_token') ||
        hashContent.includes('refresh_token') ||
        hashContent.includes('error') ||
        hashContent.includes('type=') ||
        hashContent === '' ||
        hashContent === '/' ||
        hashContent === '_=_'
      ) {
        url.hash = '';
        modified = true;
      }
    }

    if (modified) {
      const cleanPath = url.pathname + (url.search ? url.search : '') + (url.hash ? url.hash : '');
      window.history.replaceState({}, document.title, cleanPath || '/');
    }
  } catch (e) {
    console.warn('Notice cleaning auth URL parameters:', e);
  }
}

/**
 * Send password reset email via Supabase Auth
 */
export async function sendPasswordResetEmail(email: string): Promise<{ error: Error | null }> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { error: new Error("You're offline. Please reconnect to reset your password.") };
  }
  if (!supabase) {
    return { error: new Error('Backend service is not configured.') };
  }

  try {
    const trimmedEmail = email.trim().toLowerCase();
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: redirectUrl,
    });

    if (error) {
      return { error: new Error(formatAuthErrorMessage(error)) };
    }

    return { error: null };
  } catch (err: unknown) {
    return { error: new Error(formatAuthErrorMessage(err)) };
  }
}

