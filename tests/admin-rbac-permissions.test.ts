import { adminStore, SYSTEM_PERMISSIONS, AdminRole } from '../server/admin/store';

console.log('==================================================');
console.log('🧪 RUNNING YAAD ADMIN RBAC & PERMISSIONS QA');
console.log('==================================================');

async function runRbacTests() {
  // --- 1. System Permissions Definitions ---
  console.log('--- 1. Testing System Permission Definitions ---');
  if (!Array.isArray(SYSTEM_PERMISSIONS) || SYSTEM_PERMISSIONS.length < 9) {
    throw new Error('Expected at least 9 defined system permissions');
  }
  const requiredKeys = [
    'users.view',
    'users.suspend',
    'moderation.manage',
    'catalog.edit',
    'content.publish',
    'notifications.send',
    'reports.view',
    'tickets.manage',
    'settings.edit',
  ];
  for (const k of requiredKeys) {
    if (!SYSTEM_PERMISSIONS.some((p) => p.key === k)) {
      throw new Error(`Missing required system permission: ${k}`);
    }
  }
  console.log('✅ PASSED: All 9 system permissions are defined and valid');

  // --- 2. Default Role Matrix Permissions ---
  console.log('--- 2. Testing Default Role Matrix Permissions ---');
  // Super Admin must have all
  for (const k of requiredKeys) {
    if (!adminStore.hasPermission('super_admin', k)) {
      throw new Error(`super_admin must have '${k}' permission`);
    }
  }
  console.log('✅ PASSED: Super admin has 100% universal access across all modules');

  // Support Agent checks
  if (!adminStore.hasPermission('support_agent', 'tickets.manage')) {
    throw new Error('support_agent must have tickets.manage');
  }
  if (!adminStore.hasPermission('support_agent', 'users.view')) {
    throw new Error('support_agent must have users.view');
  }
  if (adminStore.hasPermission('support_agent', 'catalog.edit')) {
    throw new Error('support_agent must NOT have catalog.edit');
  }
  if (adminStore.hasPermission('support_agent', 'settings.edit')) {
    throw new Error('support_agent must NOT have settings.edit');
  }
  console.log('✅ PASSED: Support Agent role properly restricted to support desk & user view');

  // Content Editor checks
  if (!adminStore.hasPermission('content_editor', 'catalog.edit')) {
    throw new Error('content_editor must have catalog.edit');
  }
  if (!adminStore.hasPermission('content_editor', 'content.publish')) {
    throw new Error('content_editor must have content.publish');
  }
  if (adminStore.hasPermission('content_editor', 'users.suspend')) {
    throw new Error('content_editor must NOT have users.suspend');
  }
  console.log('✅ PASSED: Content Editor role properly restricted to catalog and CMS publishing');

  // Analyst checks
  if (!adminStore.hasPermission('analyst', 'reports.view')) {
    throw new Error('analyst must have reports.view');
  }
  if (adminStore.hasPermission('analyst', 'content.publish')) {
    throw new Error('analyst must NOT have content.publish');
  }
  if (adminStore.hasPermission('analyst', 'settings.edit')) {
    throw new Error('analyst must NOT have settings.edit');
  }
  console.log('✅ PASSED: Analyst role properly restricted to read-only metrics and reporting');

  // --- 3. Dynamic Permission Matrix Customization ---
  console.log('--- 3. Testing Dynamic Permission Matrix Customization ---');
  const matrix = adminStore.getPermissionMatrix();
  const originalVal = matrix['reports.view']?.content_editor;
  
  // Grant content_editor 'reports.view'
  matrix['reports.view'].content_editor = true;
  adminStore.updatePermissionMatrix(matrix);
  if (!adminStore.hasPermission('content_editor', 'reports.view')) {
    throw new Error('Dynamic permission change failed to take effect');
  }
  console.log('✅ PASSED: Dynamic permission matrix update reflects in hasPermission()');

  // Revert back
  matrix['reports.view'].content_editor = originalVal;
  adminStore.updatePermissionMatrix(matrix);

  // --- 4. List Moderation Actions ---
  console.log('--- 4. Testing Shopping List Moderation Operations ---');
  // Inject test moderation list
  const testList = {
    id: 'mod_list_qa_' + Date.now(),
    userId: 'user_mod_qa',
    userName: 'Zahid Hussain',
    userEmail: 'zahid@example.com',
    title: 'Weekend Grocery Parchi',
    status: 'flagged' as const,
    itemsCount: 2,
    flaggedItemsCount: 1,
    items: [
      {
        id: 'item_1',
        name: 'Basmati Rice 5kg',
        category: 'Grains',
        completed: false,
        isFlagged: false,
        moderationStatus: 'approved' as const,
      },
      {
        id: 'item_2',
        name: 'Inappropriate Spam Entry',
        category: 'Other',
        completed: false,
        isFlagged: true,
        flagReason: 'Spam keywords detected',
        moderationStatus: 'pending' as const,
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const db = (adminStore as any).db;
  if (!db.moderationLists) db.moderationLists = [];
  db.moderationLists.push(testList);

  // Moderate item: remove
  const itemModSuccess = adminStore.moderateListItem(testList.id, 'item_2', 'removed', 'Spam advertising');
  if (!itemModSuccess) {
    throw new Error('moderateListItem should succeed');
  }

  const updatedList = db.moderationLists.find((l: any) => l.id === testList.id);
  if (!updatedList || updatedList.status !== 'clean') {
    throw new Error(`Expected list status to become clean after item removal, got ${updatedList?.status}`);
  }
  console.log('✅ PASSED: Inappropriate item moderated and removed, list status updated to clean');

  // Update status directly
  const statusModSuccess = adminStore.updateModerationListStatus(testList.id, 'resolved');
  if (!statusModSuccess || updatedList.status !== 'resolved') {
    throw new Error('updateModerationListStatus failed');
  }
  console.log('✅ PASSED: List moderation status updated to resolved');

  // Delete moderation list
  const deleteSuccess = adminStore.deleteModerationList(testList.id);
  if (!deleteSuccess || db.moderationLists.some((l: any) => l.id === testList.id)) {
    throw new Error('deleteModerationList failed');
  }
  console.log('✅ PASSED: Moderation list deleted successfully');

  console.log('==================================================');
  console.log('🎉 ALL ADMIN RBAC & PERMISSIONS QA TESTS PASSED!');
  console.log('==================================================');
}

runRbacTests().catch((err) => {
  console.error('❌ RBAC QA TEST FAILED:', err);
  process.exit(1);
});
