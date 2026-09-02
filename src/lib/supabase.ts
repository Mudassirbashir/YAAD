/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, ShoppingList, ShoppingItem, CategoryId } from '../types';
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
 * Validates and safely returns the currently authenticated user's ID
 * to guarantee we never trust an unauthenticated or spoofed user_id from the UI.
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
      console.warn('Security alert: provided userId does not match session userId. Using session ID.');
    }
    return sessionUserId;
  } catch {
    return null;
  }
}

/**
 * Fetch profile from Supabase public.profiles table using authenticated user's ID
 */
export async function getProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // If profile does not exist yet (e.g. trigger didn't run or network delay), return minimal fallback
      if (error.code === 'PGRST116') {
        return {
          id: userId,
          full_name: null,
          email: null,
          avatar_url: null,
        };
      }
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
 * Update user profile in Supabase public.profiles table
 */
export async function updateProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<{ data: UserProfile | null; error: Error | null }> {
  if (!supabase) {
    return { data: null, error: new Error('Supabase is not configured yet.') };
  }

  try {
    const verifiedUserId = await getVerifiedUserId(userId) || userId;
    const payload = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: verifiedUserId, ...payload })
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }
    return { data: data as UserProfile, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update profile';
    return { data: null, error: new Error(message) };
  }
}

/**
 * Helper to ensure an ID is a valid UUID for databases using UUID primary keys.
 */
export function ensureValidUUID(id?: string): string {
  if (id && isValidUUID(id)) {
    return id;
  }
  return generateUUID();
}

/**
 * Load shopping lists and items from Supabase for authenticated user
 * Queries public.shopping_lists and public.shopping_items with strict user_id scoping
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
    // Attempt standard created_at ordering; fallback gracefully if custom ordering isn't available
    let listsData: any[] | null = null;
    const { data: orderedData, error: listsError } = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('user_id', verifiedUserId)
      .order('created_at', { ascending: false });

    if (listsError) {
      // Fallback query without specific column ordering in case created_at column name differs
      console.warn('Note on ordered query, retrying standard select:', listsError.message);
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', verifiedUserId);

      if (fallbackError) {
        console.warn('Error loading shopping lists from Supabase:', fallbackError.message);
        return { lists: [], error: new Error(fallbackError.message) };
      }
      listsData = fallbackData;
    } else {
      listsData = orderedData;
    }

    if (!listsData || listsData.length === 0) {
      return { lists: [], error: null };
    }

    // 2. Query public.shopping_items with list_id and user_id scoping
    const listIds = listsData.map((l) => l.id);
    const { data: itemsData, error: itemsError } = await supabase
      .from('shopping_items')
      .select('*')
      .in('list_id', listIds)
      .eq('user_id', verifiedUserId);

    if (itemsError) {
      console.warn('Note loading shopping items from Supabase:', itemsError.message);
    }

    const itemsByListId = new Map<string, ShoppingItem[]>();
    if (itemsData && itemsData.length > 0) {
      itemsData.forEach((row) => {
        const item: ShoppingItem = {
          id: row.id,
          name: row.item_name || row.name || '',
          categoryId: (row.category || 'other') as CategoryId,
          category: row.category,
          quantity: row.quantity || '1',
          completed: Boolean(row.is_completed ?? row.is_checked),
          note: row.unit || undefined,
        };
        const existing = itemsByListId.get(row.list_id) || [];
        existing.push(item);
        itemsByListId.set(row.list_id, existing);
      });
    }

    const mappedLists: ShoppingList[] = listsData.map((row) => {
      const relationalItems = itemsByListId.get(row.id) || [];
      const fallbackItems = Array.isArray(row.items) ? row.items : [];
      const allItems = relationalItems.length > 0 ? relationalItems : fallbackItems;
      const isCompleted = allItems.length > 0 
        ? allItems.every((i) => i.completed) 
        : Boolean(row.is_completed);

      const createdTime = row.created_at 
        ? new Date(row.created_at).getTime() 
        : (Number(row.created_timestamp) || Date.now());

      const createdAtFormatted = row.created_at
        ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : (row.created_at_label || 'Today');

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
      };
    });

    // Client-side sort by createdTimestamp descending
    mappedLists.sort((a, b) => (b.createdTimestamp || 0) - (a.createdTimestamp || 0));

    return { lists: mappedLists, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to load shopping lists';
    return { lists: [], error: new Error(msg) };
  }
}

/**
 * Save / sync shopping list and its relational items to Supabase
 * Upserts to public.shopping_lists and public.shopping_items using verified columns
 */
export async function saveUserShoppingList(
  userId: string,
  list: ShoppingList
): Promise<{ success: boolean; error: Error | null }> {
  if (!supabase) {
    return { success: false, error: new Error('Supabase is not configured') };
  }

  try {
    const verifiedUserId = await getVerifiedUserId(userId) || userId;
    const safeListId = ensureValidUUID(list.id);

    // 1. Upsert public.shopping_lists row with schema-conforming fields
    const listPayload: Record<string, unknown> = {
      id: safeListId,
      user_id: verifiedUserId,
      title: list.title || 'Shopping List',
    };

    const { error: listError } = await supabase
      .from('shopping_lists')
      .upsert(listPayload);

    if (listError) {
      console.warn('Error saving shopping list to Supabase:', listError.message);
      return { success: false, error: new Error(listError.message) };
    }

    // 2. Sync public.shopping_items table
    if (list.items) {
      // Remove previous items for this list to maintain clean relational integrity
      const { error: deleteError } = await supabase
        .from('shopping_items')
        .delete()
        .eq('list_id', safeListId)
        .eq('user_id', verifiedUserId);

      if (deleteError) {
        console.warn('Note deleting existing items for list sync:', deleteError.message);
      }

      if (list.items.length > 0) {
        const itemRows = list.items.map((item) => ({
          id: ensureValidUUID(item.id),
          list_id: safeListId,
          user_id: verifiedUserId,
          item_name: item.name,
          category: item.categoryId || item.category || 'other',
          quantity: item.quantity || '1',
          unit: item.note || null,
          is_completed: Boolean(item.completed),
        }));

        const { error: itemsError } = await supabase
          .from('shopping_items')
          .insert(itemRows);

        if (itemsError) {
          console.warn('Error inserting relational shopping items:', itemsError.message);
          return { success: false, error: new Error(itemsError.message) };
        }
      }
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save shopping list';
    return { success: false, error: new Error(msg) };
  }
}

/**
 * Delete a shopping list and its items from Supabase (respecting RLS)
 */
export async function deleteUserShoppingList(
  userId: string,
  listId: string
): Promise<{ success: boolean; error: Error | null }> {
  if (!supabase) {
    return { success: false, error: new Error('Supabase is not configured') };
  }

  try {
    const verifiedUserId = await getVerifiedUserId(userId) || userId;

    // 1. Delete items from public.shopping_items
    await supabase
      .from('shopping_items')
      .delete()
      .eq('list_id', listId)
      .eq('user_id', verifiedUserId);

    // 2. Delete list from public.shopping_lists
    const { error: listError } = await supabase
      .from('shopping_lists')
      .delete()
      .eq('id', listId)
      .eq('user_id', verifiedUserId);

    if (listError) {
      console.warn('Error deleting shopping list from Supabase:', listError.message);
      return { success: false, error: new Error(listError.message) };
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete shopping list';
    return { success: false, error: new Error(msg) };
  }
}

/**
 * Clear all shopping lists and items for a user from Supabase
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
      console.warn('Error clearing shopping lists:', listsError.message);
      return { success: false, error: new Error(listsError.message) };
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to clear all shopping lists';
    return { success: false, error: new Error(msg) };
  }
}

/**
 * Permanently delete all user records from Supabase tables (shopping_items, shopping_lists, profiles)
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

    // 2. Delete all user shopping lists from public.shopping_lists
    const { error: listsError } = await supabase
      .from('shopping_lists')
      .delete()
      .eq('user_id', verifiedUserId);

    if (listsError) {
      console.warn('Note deleting lists during account deletion:', listsError.message);
    }

    // 3. Delete user profile record from public.profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', verifiedUserId);

    if (profileError) {
      console.warn('Note deleting profile during account deletion:', profileError.message);
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete account data';
    return { success: false, error: new Error(msg) };
  }
}

/**
 * Single item operations for granular Supabase updates
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
 * Prepare Google OAuth login
 */
export async function signInWithGoogleOAuth(): Promise<{ error: Error | null }> {
  if (!supabase) {
    return { error: new Error('Supabase is not configured yet.') };
  }
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });
    return { error: error ? new Error(error.message) : null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to initiate Google OAuth';
    return { error: new Error(msg) };
  }
}
