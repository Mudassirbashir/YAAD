import { supabase, isSupabaseConfigured } from './supabase';
import { Household, HouseholdMember } from '../types';

/**
 * Fetch all households that the current user belongs to (with status = 'accepted').
 */
export async function getUserHouseholds(userId: string): Promise<{ households: Household[]; error: Error | null }> {
  if (!isSupabaseConfigured || !supabase || !userId) {
    return { households: [], error: null };
  }

  try {
    // 1. Get household IDs where user is an accepted member
    const { data: memberRows, error: memberErr } = await supabase
      .from('household_members')
      .select('household_id, role')
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (memberErr) {
      console.warn('Error fetching user households:', memberErr.message);
      return { households: [], error: new Error(memberErr.message) };
    }

    if (!memberRows || memberRows.length === 0) {
      return { households: [], error: null };
    }

    const householdIds = memberRows.map((m) => m.household_id);

    // 2. Fetch the households
    const { data: householdRows, error: hhErr } = await supabase
      .from('households')
      .select('*')
      .in('id', householdIds)
      .order('created_at', { ascending: false });

    if (hhErr) {
      console.warn('Error fetching household details:', hhErr.message);
      return { households: [], error: new Error(hhErr.message) };
    }

    const households: Household[] = (householdRows || []).map((row) => ({
      id: row.id,
      name: row.name,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { households, error: null };
  } catch (err) {
    return { households: [], error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Create a new household. The creator is automatically added as 'owner' with status 'accepted'.
 */
export async function createHousehold(
  userId: string,
  name: string
): Promise<{ household: Household | null; error: Error | null }> {
  if (!isSupabaseConfigured || !supabase || !userId) {
    return { household: null, error: new Error('Supabase is not configured or user is not logged in') };
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    return { household: null, error: new Error('Household name cannot be empty') };
  }

  try {
    // 1. Insert household row
    const { data: hhData, error: hhErr } = await supabase
      .from('households')
      .insert({
        name: trimmedName,
        created_by: userId,
      })
      .select()
      .single();

    if (hhErr || !hhData) {
      return { household: null, error: new Error(hhErr?.message || 'Failed to create household') };
    }

    // 2. Add creator as owner member
    const { error: memberErr } = await supabase
      .from('household_members')
      .insert({
        household_id: hhData.id,
        user_id: userId,
        role: 'owner',
        status: 'accepted',
      });

    if (memberErr) {
      console.warn('Error adding creator as member:', memberErr.message);
    }

    const household: Household = {
      id: hhData.id,
      name: hhData.name,
      createdBy: hhData.created_by,
      createdAt: hhData.created_at,
      updatedAt: hhData.updated_at,
    };

    return { household, error: null };
  } catch (err) {
    return { household: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Fetch all members of a household.
 */
export async function getHouseholdMembers(
  householdId: string
): Promise<{ members: HouseholdMember[]; error: Error | null }> {
  if (!isSupabaseConfigured || !supabase || !householdId) {
    return { members: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('household_members')
      .select('*')
      .eq('household_id', householdId);

    if (error) {
      return { members: [], error: new Error(error.message) };
    }

    const members: HouseholdMember[] = (data || []).map((row) => ({
      id: row.id,
      householdId: row.household_id,
      userId: row.user_id,
      role: row.role as 'owner' | 'admin' | 'member',
      status: row.status as 'invited' | 'accepted' | 'rejected',
      createdAt: row.created_at,
    }));

    return { members, error: null };
  } catch (err) {
    return { members: [], error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Add or invite a user to a household.
 */
export async function addHouseholdMember(
  householdId: string,
  targetUserId: string,
  role: 'admin' | 'member' = 'member',
  status: 'accepted' | 'invited' = 'accepted'
): Promise<{ success: boolean; error: Error | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: new Error('Supabase not configured') };
  }

  try {
    const { error } = await supabase
      .from('household_members')
      .upsert(
        {
          household_id: householdId,
          user_id: targetUserId,
          role,
          status,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'household_id,user_id' }
      );

    if (error) {
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Remove a member from a household (or leave a household).
 */
export async function removeHouseholdMember(
  householdId: string,
  targetUserId: string
): Promise<{ success: boolean; error: Error | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: new Error('Supabase not configured') };
  }

  try {
    const { error } = await supabase
      .from('household_members')
      .delete()
      .eq('household_id', householdId)
      .eq('user_id', targetUserId);

    if (error) {
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Attach or detach a shopping list to a household.
 */
export async function updateListHousehold(
  listId: string,
  householdId: string | null
): Promise<{ success: boolean; error: Error | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: new Error('Supabase not configured') };
  }

  try {
    const { error } = await supabase
      .from('shopping_lists')
      .update({
        household_id: householdId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listId);

    if (error) {
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
  }
}
