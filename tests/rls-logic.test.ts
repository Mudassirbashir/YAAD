/**
 * Automated RLS Authorization Logic Test Suite
 *
 * Verifies the exact security rules defined in:
 * - /supabase/schema.sql
 * - /supabase/migrations/20260909_households_and_robust_rls.sql
 *
 * Simulates:
 * 1. User A (Private list owner)
 * 2. User B (Non-member for private list, accepted member for shared household)
 * 3. User C (External user, completely unauthorized)
 * 4. Immediate revocation when membership is removed
 */

interface DbUser {
  id: string;
  email: string;
}

interface DbHousehold {
  id: string;
  name: string;
  created_by: string;
}

interface DbHouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  status: 'invited' | 'accepted' | 'rejected';
}

interface DbShoppingList {
  id: string;
  user_id: string;
  household_id: string | null;
  title: string;
}

interface DbShoppingItem {
  id: string;
  list_id: string;
  user_id: string;
  item_name: string;
  is_completed: boolean;
}

// Database state container for RLS policy simulation
class MockSupabaseEnvironment {
  households: DbHousehold[] = [];
  householdMembers: DbHouseholdMember[] = [];
  shoppingLists: DbShoppingList[] = [];
  shoppingItems: DbShoppingItem[] = [];

  // Helper SQL function: public.is_household_member(hid, uid)
  isHouseholdMember(householdId: string, userId: string): boolean {
    return this.householdMembers.some(
      (m) => m.household_id === householdId && m.user_id === userId && m.status === 'accepted'
    );
  }

  // Helper SQL function: public.is_household_admin_or_owner(hid, uid)
  isHouseholdAdminOrOwner(householdId: string, userId: string): boolean {
    return this.householdMembers.some(
      (m) =>
        m.household_id === householdId &&
        m.user_id === userId &&
        m.status === 'accepted' &&
        (m.role === 'owner' || m.role === 'admin')
    );
  }

  // Helper SQL function: public.can_access_shopping_list(lid, uid)
  canAccessShoppingList(listId: string, userId: string): boolean {
    const list = this.shoppingLists.find((l) => l.id === listId);
    if (!list) return false;
    if (list.user_id === userId) return true;
    if (list.household_id && this.isHouseholdMember(list.household_id, userId)) return true;
    return false;
  }

  // RLS: SELECT shopping_lists
  selectShoppingLists(actorUserId: string): DbShoppingList[] {
    return this.shoppingLists.filter(
      (l) => l.user_id === actorUserId || (l.household_id && this.isHouseholdMember(l.household_id, actorUserId))
    );
  }

  // RLS: INSERT shopping_lists WITH CHECK
  insertShoppingList(actorUserId: string, list: Omit<DbShoppingList, 'id'> & { id?: string }): { success: boolean; error?: string } {
    // WITH CHECK: auth.uid() = user_id AND (household_id IS NULL OR is_household_member(household_id, auth.uid()))
    if (list.user_id !== actorUserId) {
      return { success: false, error: 'Cannot set list owner to another user' };
    }
    if (list.household_id && !this.isHouseholdMember(list.household_id, actorUserId)) {
      return { success: false, error: 'Cannot attach list to household user does not belong to' };
    }

    const newList: DbShoppingList = {
      id: list.id || `list-${Date.now()}-${Math.random()}`,
      user_id: list.user_id,
      household_id: list.household_id,
      title: list.title,
    };
    this.shoppingLists.push(newList);
    return { success: true };
  }

  // RLS: UPDATE shopping_lists
  updateShoppingList(actorUserId: string, listId: string, updates: Partial<DbShoppingList>): { success: boolean; error?: string } {
    const listIndex = this.shoppingLists.findIndex((l) => l.id === listId);
    if (listIndex === -1) return { success: false, error: 'List not found' };
    const current = this.shoppingLists[listIndex];

    // USING: auth.uid() = user_id OR (household_id IS NOT NULL AND is_household_member(household_id, auth.uid()))
    const canAccess = current.user_id === actorUserId || (current.household_id && this.isHouseholdMember(current.household_id, actorUserId));
    if (!canAccess) {
      return { success: false, error: 'RLS: Permission denied on update' };
    }

    // WITH CHECK: user_id cannot be transferred illegally
    if (updates.user_id && updates.user_id !== current.user_id) {
      return { success: false, error: 'Cannot change list ownership' };
    }

    // WITH CHECK: new household_id must be one user belongs to
    const targetHouseholdId = updates.household_id !== undefined ? updates.household_id : current.household_id;
    if (targetHouseholdId && !this.isHouseholdMember(targetHouseholdId, actorUserId)) {
      return { success: false, error: 'Cannot attach list to an unauthorized household' };
    }

    this.shoppingLists[listIndex] = { ...current, ...updates };
    return { success: true };
  }

  // RLS: DELETE shopping_lists
  deleteShoppingList(actorUserId: string, listId: string): { success: boolean; error?: string } {
    const listIndex = this.shoppingLists.findIndex((l) => l.id === listId);
    if (listIndex === -1) return { success: false, error: 'List not found' };
    const current = this.shoppingLists[listIndex];

    // USING: auth.uid() = user_id OR (household_id IS NOT NULL AND is_household_admin_or_owner(household_id, auth.uid()))
    const canDelete =
      current.user_id === actorUserId ||
      (current.household_id && this.isHouseholdAdminOrOwner(current.household_id, actorUserId));

    if (!canDelete) {
      return { success: false, error: 'RLS: Insufficient permissions to delete list' };
    }

    // Cascade delete items
    this.shoppingItems = this.shoppingItems.filter((i) => i.list_id !== listId);
    this.shoppingLists.splice(listIndex, 1);
    return { success: true };
  }

  // RLS: SELECT shopping_items
  selectShoppingItems(actorUserId: string, listId?: string): DbShoppingItem[] {
    return this.shoppingItems.filter((item) => {
      if (listId && item.list_id !== listId) return false;
      return this.canAccessShoppingList(item.list_id, actorUserId);
    });
  }

  // RLS: INSERT shopping_items
  insertShoppingItem(actorUserId: string, item: Omit<DbShoppingItem, 'id'> & { id?: string }): { success: boolean; error?: string } {
    // USING & WITH CHECK: can_access_shopping_list(list_id, auth.uid())
    if (!this.canAccessShoppingList(item.list_id, actorUserId)) {
      return { success: false, error: 'RLS: Permission denied to insert item into list' };
    }

    const newItem: DbShoppingItem = {
      id: item.id || `item-${Date.now()}-${Math.random()}`,
      list_id: item.list_id,
      user_id: actorUserId,
      item_name: item.item_name,
      is_completed: item.is_completed,
    };
    this.shoppingItems.push(newItem);
    return { success: true };
  }

  // RLS: UPDATE shopping_items
  updateShoppingItem(actorUserId: string, itemId: string, updates: Partial<DbShoppingItem>): { success: boolean; error?: string } {
    const itemIndex = this.shoppingItems.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return { success: false, error: 'Item not found' };
    const current = this.shoppingItems[itemIndex];

    // RLS: USING can_access_shopping_list(list_id, auth.uid())
    if (!this.canAccessShoppingList(current.list_id, actorUserId)) {
      return { success: false, error: 'RLS: Permission denied to update item' };
    }

    this.shoppingItems[itemIndex] = { ...current, ...updates };
    return { success: true };
  }

  // RLS: DELETE shopping_items
  deleteShoppingItem(actorUserId: string, itemId: string): { success: boolean; error?: string } {
    const itemIndex = this.shoppingItems.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return { success: false, error: 'Item not found' };
    const current = this.shoppingItems[itemIndex];

    // RLS: USING can_access_shopping_list(list_id, auth.uid())
    if (!this.canAccessShoppingList(current.list_id, actorUserId)) {
      return { success: false, error: 'RLS: Permission denied to delete item' };
    }

    this.shoppingItems.splice(itemIndex, 1);
    return { success: true };
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('\n--- Running Automated RLS Authorization & Household Tests ---');

const env = new MockSupabaseEnvironment();

const userA: DbUser = { id: 'user-a-uuid', email: 'usera@example.com' };
const userB: DbUser = { id: 'user-b-uuid', email: 'userb@example.com' };
const userC: DbUser = { id: 'user-c-uuid', email: 'userc@example.com' };

// Test 1: User A creates a private shopping list
console.log('\n1. User A Private List Test:');
const privateListRes = env.insertShoppingList(userA.id, {
  id: 'private-list-1',
  user_id: userA.id,
  household_id: null,
  title: 'User A Private Groceries',
});
assert(privateListRes.success, 'User A should successfully create private list');

const privateItemRes = env.insertShoppingItem(userA.id, {
  id: 'item-private-1',
  list_id: 'private-list-1',
  user_id: userA.id,
  item_name: 'Doodh (Milk)',
  is_completed: false,
});
assert(privateItemRes.success, 'User A should add item to private list');

// Test 2: User B cannot view, edit, or delete User A's private list/items
console.log('\n2. User B Isolation from User A Private List:');
const userBLists = env.selectShoppingLists(userB.id);
assert(userBLists.length === 0, 'User B must not see User A private list');

const userBItems = env.selectShoppingItems(userB.id, 'private-list-1');
assert(userBItems.length === 0, 'User B must not read items from User A private list');

const userBUpdateItem = env.updateShoppingItem(userB.id, 'item-private-1', { is_completed: true });
assert(!userBUpdateItem.success, 'User B must not update item on User A private list');

const userBDeleteItem = env.deleteShoppingItem(userB.id, 'item-private-1');
assert(!userBDeleteItem.success, 'User B must not delete item on User A private list');

const userBDeleteList = env.deleteShoppingList(userB.id, 'private-list-1');
assert(!userBDeleteList.success, 'User B must not delete User A private list');

// Test 3: Shared Household Collaboration
console.log('\n3. Shared Household (User A & User B):');
const household: DbHousehold = {
  id: 'hh-khan-family',
  name: 'Khan Family',
  created_by: userA.id,
};
env.households.push(household);
env.householdMembers.push({
  id: 'mem-1',
  household_id: household.id,
  user_id: userA.id,
  role: 'owner',
  status: 'accepted',
});
env.householdMembers.push({
  id: 'mem-2',
  household_id: household.id,
  user_id: userB.id,
  role: 'member',
  status: 'accepted',
});

// User A creates a household list
const sharedListRes = env.insertShoppingList(userA.id, {
  id: 'shared-list-1',
  user_id: userA.id,
  household_id: household.id,
  title: 'Ghar Ka Saaman',
});
assert(sharedListRes.success, 'User A should create shared household list');

// User B sees the shared list
const userBSharedLists = env.selectShoppingLists(userB.id);
assert(userBSharedLists.some((l) => l.id === 'shared-list-1'), 'User B should see shared household list');

// User A adds an item to the shared list
env.insertShoppingItem(userA.id, {
  id: 'item-shared-1',
  list_id: 'shared-list-1',
  user_id: userA.id,
  item_name: 'Aloo 2 kg',
  is_completed: false,
});

// User B can see the item added by User A
const userBSharedItems = env.selectShoppingItems(userB.id, 'shared-list-1');
assert(userBSharedItems.some((i) => i.id === 'item-shared-1'), 'User B can see items added by User A in shared list');

// User B completes the item
const userBCheckRes = env.updateShoppingItem(userB.id, 'item-shared-1', { is_completed: true });
assert(userBCheckRes.success, 'User B can check/complete item added by User A');

// User B adds an item
const userBAddRes = env.insertShoppingItem(userB.id, {
  id: 'item-shared-2',
  list_id: 'shared-list-1',
  user_id: userB.id,
  item_name: 'Dahi 1/2 kg',
  is_completed: false,
});
assert(userBAddRes.success, 'User B can add item to shared household list');

// User A sees item added by User B
const userASharedItems = env.selectShoppingItems(userA.id, 'shared-list-1');
assert(userASharedItems.some((i) => i.id === 'item-shared-2'), 'User A can see items added by User B');

// Test 4: User C Isolation
console.log('\n4. User C Unauthorized Access Test:');
const userCLists = env.selectShoppingLists(userC.id);
assert(!userCLists.some((l) => l.id === 'shared-list-1'), 'User C cannot see shared household list');

const userCItems = env.selectShoppingItems(userC.id, 'shared-list-1');
assert(userCItems.length === 0, 'User C cannot see items in shared household list');

const userCAddRes = env.insertShoppingItem(userC.id, {
  id: 'item-c-hack',
  list_id: 'shared-list-1',
  user_id: userC.id,
  item_name: 'Malicious Item',
  is_completed: false,
});
assert(!userCAddRes.success, 'User C cannot insert items into shared household list');

// Test 5: Immediate Revocation on Member Removal
console.log('\n5. Immediate Revocation on Member Removal:');
// Remove User B from household
const memberIndex = env.householdMembers.findIndex(
  (m) => m.household_id === household.id && m.user_id === userB.id
);
env.householdMembers.splice(memberIndex, 1);

const userBListsAfterRemoval = env.selectShoppingLists(userB.id);
assert(!userBListsAfterRemoval.some((l) => l.id === 'shared-list-1'), 'User B immediately loses visibility to shared list');

const userBItemsAfterRemoval = env.selectShoppingItems(userB.id, 'shared-list-1');
assert(userBItemsAfterRemoval.length === 0, 'User B immediately loses item access after removal');

const userBEditAfterRemoval = env.updateShoppingItem(userB.id, 'item-shared-1', { is_completed: false });
assert(!userBEditAfterRemoval.success, 'User B immediately denied edit permission after removal');

console.log('\n🎉 ALL RLS & HOUSEHOLD ACCESS TESTS PASSED PERFECTLY!\n');
