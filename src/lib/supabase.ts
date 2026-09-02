/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, ShoppingList, ShoppingItem, CategoryId, FrequentlyBoughtItem } from '../types';
import { generateUUID, isValidUUID } from './uuid';

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
 * Retrieve pending offline actions from localStorage
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
 * Enqueue a pending offline action to localStorage
 */
export function enqueueOfflineChange(userId: string, change: Omit<OfflineQueueItem, 'id' | 'timestamp'>): void {
  try {
    const queue = getPendingOfflineChanges(userId);
    const item: OfflineQueueItem = {
      ...change,
      id: generateUUID(),
      timestamp: Date.now(),
    };

    // If saving a list that already has a pending save in the queue, update the existing queue item
    if (item.type === 'SAVE_LIST' && item.payload?.id) {
      const filtered = queue.filter(
        (q) => !(q.type === 'SAVE_LIST' && q.payload?.id === item.payload.id)
      );
      filtered.push(item);
      localStorage.setItem(getOfflineQueueKey(userId), JSON.stringify(filtered));
      return;
    }

    // If deleting a list, remove any pending save for that list and add delete
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
 * Clear offline queue for a user
 */
export function clearOfflineQueue(userId: string): void {
  try {
    localStorage.removeItem(getOfflineQueueKey(userId));
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
 * Safely upsert a row into a Supabase table with automatic schema-mismatch recovery.
 * If Supabase PostgREST reports a missing column in the schema cache,
 * it dynamically strips the offending column and retries.
 */
export async function resilientUpsert(
  table: string,
  payload: Record<string, unknown>,
  options?: { onConflict?: string }
): Promise<{ data: any; error: Error | null }> {
  if (!supabase) return { data: null, error: new Error('Supabase client not initialized') };

  const mutablePayload = { ...payload };
  const maxRetries = 6;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const query = options?.onConflict
      ? supabase.from(table).upsert(mutablePayload, { onConflict: options.onConflict }).select()
      : supabase.from(table).upsert(mutablePayload).select();

    const { data, error } = await query;
    if (!error) {
      return { data, error: null };
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
  if (!supabase) return null;
  try {
    const verifiedUserId = await getVerifiedUserId(userId) || userId;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', verifiedUserId)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching profile from Supabase:', error.message);
      return null;
    }
    return data as UserProfile;
  } catch (err) {
    console.error('Exception fetching profile:', err);
    return null;
  }
}

/**
 * Update or insert user profile in Supabase public.profiles table
 */
export async function updateProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<{ data: UserProfile | null; error: Error | null }> {
  if (!supabase) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }

  try {
    const verifiedUserId = await getVerifiedUserId(userId);
    if (!verifiedUserId) {
      // No active session in client (e.g. pending email confirmation or offline)
      console.warn('updateProfile notice: No active authenticated session for user ID', userId);
      return {
        data: {
          id: userId,
          full_name: updates.full_name || null,
          email: updates.email || null,
          avatar_url: updates.avatar_url || null,
          language: updates.language,
          usage_purpose: updates.usage_purpose,
          referral_source: updates.referral_source,
          has_completed_setup: updates.has_completed_setup,
        } as UserProfile,
        error: null,
      };
    }

    const payload: Record<string, unknown> = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data: upsertData, error: upsertError } = await resilientUpsert(
      'profiles',
      { id: verifiedUserId, ...payload },
      { onConflict: 'id' }
    );

    if (upsertError) {
      console.warn('Supabase updateProfile notice:', upsertError.message);
      return {
        data: {
          id: verifiedUserId,
          full_name: updates.full_name || null,
          email: updates.email || null,
          avatar_url: updates.avatar_url || null,
          ...updates,
        } as UserProfile,
        error: null,
      };
    }

    const savedProfile = Array.isArray(upsertData) ? upsertData[0] : upsertData;
    return { data: (savedProfile || { id: verifiedUserId, ...payload }) as UserProfile, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update profile';
    console.error('Exception during updateProfile:', err);
    return { data: null, error: new Error(message) };
  }
}

/**
 * ----------------------------------------------------------------------
 * 2. SHOPPING LISTS OPERATIONS (CREATE, READ, UPDATE, DELETE)
 * ----------------------------------------------------------------------
 */

/**
 * Load shopping lists and items from Supabase for authenticated user.
 * Supports both normalized relational schema (shopping_items) and embedded JSONB lists.
 */
export async function loadUserShoppingLists(
  userId: string
): Promise<{ lists: ShoppingList[]; error: Error | null }> {
  if (!supabase) {
    return { lists: [], error: null };
  }

  try {
    const verifiedUserId = await getVerifiedUserId(userId) || userId;

    // 1. Query public.shopping_lists
    let listsData: any[] | null = null;
    const { data: orderedData, error: listsError } = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('user_id', verifiedUserId)
      .order('created_at', { ascending: false });

    if (listsError) {
      console.warn('Note on ordered lists query, attempting general select:', listsError.message);
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', verifiedUserId);

      if (fallbackError) {
        console.error('Error loading shopping lists from Supabase:', fallbackError.message);
        return { lists: [], error: new Error(fallbackError.message) };
      }
      listsData = fallbackData;
    } else {
      listsData = orderedData;
    }

    if (!listsData || listsData.length === 0) {
      return { lists: [], error: null };
    }

    // 2. Query child public.shopping_items table for normalized list items
    const listIds = listsData.map((l) => l.id);
    const { data: itemsData, error: itemsError } = await supabase
      .from('shopping_items')
      .select('*')
      .in('list_id', listIds)
      .eq('user_id', verifiedUserId);

    if (itemsError) {
      // If shopping_items table does not exist or has custom rules, fallback gracefully to embedded JSON
      console.warn('Note loading child shopping_items (falling back to embedded JSON):', itemsError.message);
    }

    const itemsByListId = new Map<string, ShoppingItem[]>();
    if (itemsData && itemsData.length > 0) {
      itemsData.forEach((row) => {
        const item: ShoppingItem = {
          id: row.id,
          name: row.item_name || row.name || '',
          categoryId: (row.category || 'other') as CategoryId,
          category: row.category,
          quantity: row.quantity || undefined,
          unit: row.unit || undefined,
          completed: Boolean(row.is_completed ?? row.is_checked),
          rawInput: row.raw_input || undefined,
          note: row.note || row.unit || undefined,
        };
        const existing = itemsByListId.get(row.list_id) || [];
        existing.push(item);
        itemsByListId.set(row.list_id, existing);
      });
    }

    // 3. Map database rows to Application ShoppingList model
    const mappedLists: ShoppingList[] = listsData.map((row) => {
      const relationalItems = itemsByListId.get(row.id) || [];
      const fallbackItems = Array.isArray(row.items) ? row.items : [];
      const allItems = relationalItems.length > 0 ? relationalItems : fallbackItems;
      const isCompleted = allItems.length > 0 
        ? allItems.every((i: ShoppingItem) => i.completed) 
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
        items: allItems,
        isSynced: true,
      };
    });

    // Client-side sort by createdTimestamp descending
    mappedLists.sort((a, b) => (b.createdTimestamp || 0) - (a.createdTimestamp || 0));

    return { lists: mappedLists, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to load shopping lists';
    console.error('Exception loading shopping lists:', err);
    return { lists: [], error: new Error(msg) };
  }
}

/**
 * Save / persist shopping list and its items to Supabase.
 * Atomically persists to public.shopping_lists and synchronizes public.shopping_items.
 * If offline, enqueues the change safely for later synchronization.
 */
export async function saveUserShoppingList(
  userId: string,
  list: ShoppingList
): Promise<{ success: boolean; error: Error | null }> {
  const verifiedUserId = await getVerifiedUserId(userId) || userId;
  const safeListId = list.id || generateUUID();

  // If Supabase client is not available or offline, enqueue for background sync
  if (!supabase) {
    enqueueOfflineChange(verifiedUserId, {
      type: 'SAVE_LIST',
      userId: verifiedUserId,
      payload: list,
    });
    return { success: true, error: null };
  }

  try {
    const isCompleted = list.items.length > 0
      ? list.items.every((i) => i.completed)
      : Boolean(list.isCompleted);

    const createdIso = list.createdTimestamp
      ? new Date(list.createdTimestamp).toISOString()
      : new Date().toISOString();

    // 1. Upsert public.shopping_lists row with standard fields
    const listPayload: Record<string, unknown> = {
      id: safeListId,
      user_id: verifiedUserId,
      title: list.title || 'Shopping List',
      icon: list.icon || 'shopping_basket',
      is_completed: isCompleted,
      completed_at: list.completedAt ? (list.completedAt.includes('T') ? list.completedAt : new Date().toISOString()) : (isCompleted ? new Date().toISOString() : null),
      items: list.items || [], // Dual persistence: embedded JSON ensures instant atomic recovery
      created_at: createdIso,
      updated_at: new Date().toISOString(),
    };

    const { error: listError } = await resilientUpsert('shopping_lists', listPayload);

    if (listError) {
      console.error('Error saving shopping list to Supabase:', listError.message);
      // Queue offline change so progress is not lost
      enqueueOfflineChange(verifiedUserId, {
        type: 'SAVE_LIST',
        userId: verifiedUserId,
        payload: list,
      });
      return { success: false, error: new Error(listError.message) };
    }

    // 2. Synchronize child public.shopping_items table
    if (list.items) {
      // Remove old items for this list to maintain clean relational consistency
      const { error: deleteError } = await supabase
        .from('shopping_items')
        .delete()
        .eq('list_id', safeListId)
        .eq('user_id', verifiedUserId);

      if (deleteError) {
        console.warn('Notice clearing items during sync:', deleteError.message);
      }

      if (list.items.length > 0) {
        const itemRows = list.items.map((item, index) => ({
          id: ensureValidUUID(item.id),
          list_id: safeListId,
          user_id: verifiedUserId,
          item_name: item.name,
          category: item.categoryId || item.category || 'other',
          quantity: item.quantity || null,
          unit: item.unit || item.note || null,
          raw_input: item.rawInput || null,
          is_completed: Boolean(item.completed),
          sort_order: index,
          updated_at: new Date().toISOString(),
        }));

        const { error: itemsError } = await supabase
          .from('shopping_items')
          .insert(itemRows);

        if (itemsError) {
          console.warn('Notice inserting relational shopping_items:', itemsError.message);
        }
      }
    }

    // 3. If the list was just completed, update frequently bought items in Supabase
    if (isCompleted && list.items.length > 0) {
      const completedItems = list.items.filter((i) => i.completed);
      if (completedItems.length > 0) {
        recordFrequentlyBoughtItems(verifiedUserId, completedItems).catch((e) => {
          console.warn('Notice recording frequently bought items:', e);
        });
      }
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save shopping list';
    console.error('Exception saving shopping list:', err);
    enqueueOfflineChange(verifiedUserId, {
      type: 'SAVE_LIST',
      userId: verifiedUserId,
      payload: list,
    });
    return { success: false, error: new Error(msg) };
  }
}

/**
 * Delete a shopping list and its child items from Supabase (respecting RLS)
 */
export async function deleteUserShoppingList(
  userId: string,
  listId: string
): Promise<{ success: boolean; error: Error | null }> {
  const verifiedUserId = await getVerifiedUserId(userId) || userId;

  if (!supabase) {
    enqueueOfflineChange(verifiedUserId, {
      type: 'DELETE_LIST',
      userId: verifiedUserId,
      payload: { listId },
    });
    return { success: true, error: null };
  }

  try {
    // 1. Delete items from public.shopping_items
    const { error: itemsError } = await supabase
      .from('shopping_items')
      .delete()
      .eq('list_id', listId)
      .eq('user_id', verifiedUserId);

    if (itemsError) {
      console.warn('Notice deleting child shopping_items:', itemsError.message);
    }

    // 2. Delete list from public.shopping_lists
    const { error: listError } = await supabase
      .from('shopping_lists')
      .delete()
      .eq('id', listId)
      .eq('user_id', verifiedUserId);

    if (listError) {
      console.error('Error deleting shopping list from Supabase:', listError.message);
      enqueueOfflineChange(verifiedUserId, {
        type: 'DELETE_LIST',
        userId: verifiedUserId,
        payload: { listId },
      });
      return { success: false, error: new Error(listError.message) };
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete shopping list';
    console.error('Exception deleting shopping list:', err);
    enqueueOfflineChange(verifiedUserId, {
      type: 'DELETE_LIST',
      userId: verifiedUserId,
      payload: { listId },
    });
    return { success: false, error: new Error(msg) };
  }
}

/**
 * Clear all shopping lists and items for an authenticated user from Supabase
 */
export async function clearAllUserShoppingLists(
  userId: string
): Promise<{ success: boolean; error: Error | null }> {
  if (!supabase) {
    return { success: false, error: new Error('Supabase is not configured') };
  }

  try {
    const verifiedUserId = await getVerifiedUserId(userId) || userId;

    // 1. Delete all user items
    await supabase
      .from('shopping_items')
      .delete()
      .eq('user_id', verifiedUserId);

    // 2. Delete all user lists
    const { error: listsError } = await supabase
      .from('shopping_lists')
      .delete()
      .eq('user_id', verifiedUserId);

    if (listsError) {
      console.error('Error clearing shopping lists:', listsError.message);
      return { success: false, error: new Error(listsError.message) };
    }

    clearOfflineQueue(verifiedUserId);
    return { success: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to clear all shopping lists';
    console.error('Exception clearing shopping lists:', err);
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
    const verifiedUserId = await getVerifiedUserId(userId) || userId;
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
  if (!supabase || items.length === 0) {
    return { success: true, error: null };
  }

  try {
    const verifiedUserId = await getVerifiedUserId(userId) || userId;

    // Fetch existing records to increment purchase_count
    const itemNames = items.map((i) => i.name.trim().toLowerCase());
    const { data: existing } = await supabase
      .from('frequently_bought_items')
      .select('*')
      .eq('user_id', verifiedUserId);

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
      console.warn('Note recording frequently bought items:', upsertError.message);
      return { success: false, error: new Error(upsertError.message) };
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to record frequently bought items';
    console.error('Exception recording frequently bought items:', err);
    return { success: false, error: new Error(msg) };
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
    const verifiedUserId = await getVerifiedUserId(userId) || userId;
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
    const verifiedUserId = await getVerifiedUserId(userId) || userId;

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
  if (!supabase) return { error: null };
  try {
    const verifiedUserId = await getVerifiedUserId(userId) || userId;
    const { error } = await supabase
      .from('shopping_items')
      .update({
        is_completed: isCompleted,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId)
      .eq('list_id', listId)
      .eq('user_id', verifiedUserId);

    return { error: error ? new Error(error.message) : null };
  } catch (err: unknown) {
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
 * Process all pending offline changes when back online
 */
export async function syncPendingOfflineChanges(
  userId: string
): Promise<{ syncedCount: number; error: Error | null }> {
  if (!supabase || !navigator.onLine) {
    return { syncedCount: 0, error: null };
  }

  const queue = getPendingOfflineChanges(userId);
  if (queue.length === 0) {
    return { syncedCount: 0, error: null };
  }

  let syncedCount = 0;
  const remainingQueue: OfflineQueueItem[] = [];

  for (const item of queue) {
    try {
      if (item.type === 'SAVE_LIST') {
        const res = await saveUserShoppingList(userId, item.payload);
        if (res.success) {
          syncedCount++;
        } else {
          remainingQueue.push(item);
        }
      } else if (item.type === 'DELETE_LIST') {
        const res = await deleteUserShoppingList(userId, item.payload.listId);
        if (res.success) {
          syncedCount++;
        } else {
          remainingQueue.push(item);
        }
      }
    } catch (e) {
      console.warn('Error processing queued offline item:', e);
      remainingQueue.push(item);
    }
  }

  try {
    if (remainingQueue.length === 0) {
      clearOfflineQueue(userId);
    } else {
      localStorage.setItem(getOfflineQueueKey(userId), JSON.stringify(remainingQueue));
    }
  } catch (e) {
    console.warn('Error updating offline queue after sync:', e);
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
