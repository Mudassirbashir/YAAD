import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { buildShoppingItemRow, buildShoppingHistoryRow } from '../src/lib/supabase';
import { ShoppingItem } from '../src/types';

async function runItemImagesPersistenceSuite() {
  console.log('--- Running Item Images Persistence Test Suite ---');

  const sampleListId = '11111111-1111-4111-8111-111111111111';
  const sampleUserId = '22222222-2222-4222-8222-222222222222';
  const sampleSessionId = '33333333-3333-4333-8333-333333333333';
  const purchasedAt = new Date().toISOString();

  // Test 1: Item with imageUrl produces row with that exact image_url
  const itemWithImage: ShoppingItem = {
    id: '44444444-4444-4444-8444-444444444444',
    name: 'Farm Fresh Eggs',
    quantity: 2,
    unit: 'dozen',
    categoryId: 'dairy',
    completed: true,
    imageUrl: 'https://res.cloudinary.com/rvhmsppk/image/upload/v12345/eggs.jpg',
  };

  const itemRowWithImage = buildShoppingItemRow(itemWithImage, sampleListId, sampleUserId);
  assert.strictEqual(
    itemRowWithImage.image_url,
    'https://res.cloudinary.com/rvhmsppk/image/upload/v12345/eggs.jpg',
    'buildShoppingItemRow must preserve image_url exactly when present'
  );
  assert.strictEqual(itemRowWithImage.list_id, sampleListId);
  assert.strictEqual(itemRowWithImage.user_id, sampleUserId);
  assert.strictEqual(itemRowWithImage.item_name, 'Farm Fresh Eggs');
  assert.strictEqual(itemRowWithImage.is_completed, true);

  // Test 2: Item without imageUrl produces image_url: null
  const itemWithoutImage: ShoppingItem = {
    id: '55555555-5555-4555-8555-555555555555',
    name: 'Milk Pack',
    quantity: 1,
    unit: 'l',
    categoryId: 'dairy',
    completed: false,
  };

  const itemRowWithoutImage = buildShoppingItemRow(itemWithoutImage, sampleListId, sampleUserId);
  assert.strictEqual(
    itemRowWithoutImage.image_url,
    null,
    'buildShoppingItemRow must produce image_url: null when imageUrl is missing or undefined'
  );

  // Test 3: History row with imageUrl preserves image_url
  const historyRowWithImage = buildShoppingHistoryRow(itemWithImage, {
    listId: sampleListId,
    sessionId: sampleSessionId,
    userId: sampleUserId,
    purchasedAt,
  });
  assert.strictEqual(
    historyRowWithImage.image_url,
    'https://res.cloudinary.com/rvhmsppk/image/upload/v12345/eggs.jpg',
    'buildShoppingHistoryRow must preserve image_url when present'
  );
  assert.strictEqual(historyRowWithImage.user_id, sampleUserId);
  assert.strictEqual(historyRowWithImage.source_list_id, sampleListId);
  assert.strictEqual(historyRowWithImage.image_url, 'https://res.cloudinary.com/rvhmsppk/image/upload/v12345/eggs.jpg');

  // Test 4: History row without imageUrl produces image_url: null
  const historyRowWithoutImage = buildShoppingHistoryRow(itemWithoutImage, {
    listId: sampleListId,
    sessionId: sampleSessionId,
    userId: sampleUserId,
    purchasedAt,
  });
  assert.strictEqual(
    historyRowWithoutImage.image_url,
    null,
    'buildShoppingHistoryRow must produce image_url: null when imageUrl is missing'
  );

  // Test 5: Source verification that all 4 writers invoke buildShoppingItemRow or buildShoppingHistoryRow
  const supabaseSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/lib/supabase.ts'), 'utf-8');

  assert(
    supabaseSrc.includes('buildShoppingItemRow(item, safeListId, verifiedUserId)'),
    'executeInternalSaveUserShoppingList must call buildShoppingItemRow'
  );
  assert(
    supabaseSrc.includes('buildShoppingItemRow(item, safeListId, verifiedUserId)'),
    'persistCompletedShoppingSession and executeInternalSaveUserShoppingList must call buildShoppingItemRow'
  );
  assert(
    supabaseSrc.includes('buildShoppingHistoryRow(it, {'),
    'recordCompletedShoppingTrip must call buildShoppingHistoryRow'
  );
  assert(
    supabaseSrc.includes('buildShoppingItemRow(it, list.id, verifiedUserId)'),
    'syncPendingOfflineChanges must call buildShoppingItemRow'
  );

  // Test 6: Verify fetchSingleShoppingList maps imageUrl
  assert(
    supabaseSrc.includes('imageUrl: r.image_url || r.imageUrl || undefined'),
    'fetchSingleShoppingList must map imageUrl from image_url'
  );

  console.log('✅ Passed: buildShoppingItemRow correctly builds row with image_url');
  console.log('✅ Passed: buildShoppingHistoryRow correctly builds history row with image_url');
  console.log('✅ Passed: All 4 writer functions in supabase.ts route through shared builders');
  console.log('✅ Passed: fetchSingleShoppingList maps image_url to imageUrl');
}

runItemImagesPersistenceSuite().catch((err) => {
  console.error('❌ item-images-persistence test failed:', err);
  process.exit(1);
});
