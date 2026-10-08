import assert from 'node:assert';
import { adminStore } from '../server/admin/store';

console.log('==================================================');
console.log('🧪 LIVE HTTP ENDPOINT QA FOR ADMIN SYSTEM');
console.log('==================================================');

async function testLiveEndpoints() {
  const BASE_URL = 'http://localhost:3000';
  const superAdmin = adminStore.getAllAdmins().find((a) => a.role === 'super_admin');
  if (!superAdmin) throw new Error('No super admin found in store');

  // Create temporary session
  const session = adminStore.createSession(superAdmin.id, '127.0.0.1', 'IntegrationTester');
  const token = session.token;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  let testList: any = null;

  try {
    // 1. Verify /admin static HTML serving
    console.log('--- 1. Testing GET /admin ---');
    const pageRes = await fetch(`${BASE_URL}/admin`);
    assert.strictEqual(pageRes.status, 200, 'GET /admin returns 200 OK');
    const html = await pageRes.text();
    assert(html.includes('<div id="root">') || html.includes('<!DOCTYPE html>'), 'HTML shell served');
    console.log('✅ PASSED: /admin HTML shell successfully served');

    // 2. Notifications Endpoint
    console.log('--- 2. Testing GET /api/admin/notifications ---');
    const notifsRes = await fetch(`${BASE_URL}/api/admin/notifications`, { headers });
    assert.strictEqual(notifsRes.status, 200, 'GET /api/admin/notifications returns 200');
    const notifsData = await notifsRes.json();
    assert(Array.isArray(notifsData.notifications), 'notifications is array');
    assert(typeof notifsData.unreadCount === 'number', 'unreadCount is number');
    console.log(`✅ PASSED: Notifications endpoint returned ${notifsData.notifications.length} alerts (unread: ${notifsData.unreadCount})`);

    // 3. Notification Dismiss-All
    console.log('--- 3. Testing POST /api/admin/notifications/dismiss-all ---');
    const dismissAllRes = await fetch(`${BASE_URL}/api/admin/notifications/dismiss-all`, {
      method: 'POST',
      headers,
    });
    assert.strictEqual(dismissAllRes.status, 200, 'POST dismiss-all returns 200');
    const dismissAllData = await dismissAllRes.json();
    assert.strictEqual(dismissAllData.success, true);
    console.log('✅ PASSED: Notifications dismiss-all succeeded');

    // 4. Shopping Lists & Moderation Endpoints
    console.log('--- 4. Testing GET /api/admin/lists ---');
    const listsRes = await fetch(`${BASE_URL}/api/admin/lists?page=1&limit=10`, { headers });
    assert.strictEqual(listsRes.status, 200, 'GET /api/admin/lists returns 200');
    const listsData = await listsRes.json();
    assert(Array.isArray(listsData.lists), 'listsData.lists is array');
    console.log(`✅ PASSED: Shopping lists endpoint returned ${listsData.lists.length} lists`);

    // Create a temporary moderation list for live endpoint validation
    testList = {
      id: 'live_test_list_' + Date.now(),
      userId: 'shopper_live_test',
      userName: 'Live Tester',
      title: 'Weekend Mandi Test List',
      status: 'clean' as const,
      itemsCount: 1,
      flaggedItemsCount: 0,
      items: [
        {
          id: 'item_live_1',
          name: 'Tomato 1kg',
          category: 'Vegetables',
          completed: false,
          isFlagged: false,
          moderationStatus: 'approved' as const,
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    (adminStore as any).db.moderationLists = (adminStore as any).db.moderationLists || [];
    (adminStore as any).db.moderationLists.push(testList);
    (adminStore as any).save();

    // 5. Test Status Update
    console.log('--- 5. Testing POST /api/admin/lists/:id/status ---');
    const updateStatusRes = await fetch(`${BASE_URL}/api/admin/lists/${testList.id}/status`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ status: 'flagged' }),
    });
    assert.strictEqual(updateStatusRes.status, 200, 'POST list status returns 200');
    const updatedStatusData = await updateStatusRes.json();
    assert.strictEqual(updatedStatusData.success, true);
    console.log('✅ PASSED: Moderation list status successfully updated to flagged');

    // 6. Test Item Moderation
    console.log('--- 6. Testing POST /api/admin/lists/:id/items/:itemId/moderate ---');
    const itemModRes = await fetch(`${BASE_URL}/api/admin/lists/${testList.id}/items/item_live_1/moderate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'removed', reason: 'Abusive term' }),
    });
    assert.strictEqual(itemModRes.status, 200, 'POST moderate item returns 200');
    const itemModData = await itemModRes.json();
    assert.strictEqual(itemModData.success, true);
    console.log('✅ PASSED: Shopping list item moderation executed successfully');

    // 7. Test List Deletion
    console.log('--- 7. Testing DELETE /api/admin/lists/:id ---');
    const deleteListRes = await fetch(`${BASE_URL}/api/admin/lists/${testList.id}`, {
      method: 'DELETE',
      headers,
    });
    assert.strictEqual(deleteListRes.status, 200, 'DELETE list returns 200');
    const deleteListData = await deleteListRes.json();
    assert.strictEqual(deleteListData.success, true);
    console.log('✅ PASSED: Shopping list deleted successfully');

    // 8. Settings & Dynamic RBAC
    console.log('--- 8. Testing GET /api/admin/settings & /api/admin/role-matrix ---');
    const settingsRes = await fetch(`${BASE_URL}/api/admin/settings`, { headers });
    assert.strictEqual(settingsRes.status, 200, 'GET /api/admin/settings returns 200');
    const settingsData = await settingsRes.json();
    assert(settingsData.featureFlags, 'featureFlags exist in settings');

    const matrixRes = await fetch(`${BASE_URL}/api/admin/role-matrix`, { headers });
    assert.strictEqual(matrixRes.status, 200, 'GET /api/admin/role-matrix returns 200');
    const matrixData = await matrixRes.json();
    assert(matrixData['users.view'], 'users.view permission defined in role-matrix');
    console.log('✅ PASSED: Admin settings and dynamic permission matrix verified');

    // 9. Method Not Allowed Guard verification
    console.log('--- 9. Testing 405 Method Not Allowed Guards ---');
    const methodGuardRes = await fetch(`${BASE_URL}/api/admin/auth/login`, { method: 'GET' });
    assert.strictEqual(methodGuardRes.status, 405, 'GET /auth/login returns 405');
    console.log('✅ PASSED: Method Not Allowed security guard verified');

    console.log('==================================================');
    console.log('🎉 ALL LIVE HTTP ENDPOINTS PASSED SUCCESSFULLY!');
    console.log('==================================================');
  } finally {
    // Clean up temporary session, test list & reset dismissed notifications
    (adminStore as any).db.moderationLists = ((adminStore as any).db.moderationLists || []).filter(
      (l: any) => l.id !== testList.id
    );
    (adminStore as any).db.sessions = ((adminStore as any).db.sessions || []).filter(
      (s: any) => s.token !== token
    );
    (adminStore as any).db.dismissedNotificationIds = [];
    (adminStore as any).save();
  }
}

testLiveEndpoints().catch((err) => {
  console.error('❌ LIVE ENDPOINTS QA FAILED:', err);
  process.exit(1);
});
