import { adminStore } from '../server/admin/store';

console.log('==================================================');
console.log('🧪 RUNNING YAAD ADMIN NOTIFICATIONS SYSTEM QA');
console.log('==================================================');

async function runNotificationsTests() {
  const superAdmin = {
    id: 'test_super_admin_1',
    name: 'Super Admin',
    email: 'super@yaad.app',
    role: 'super_admin' as const,
    totpSecret: 'ABCDEF',
    isTotpEnabled: true,
    status: 'active' as const,
    failedAttempts: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const supportAgent = {
    id: 'test_support_agent_1',
    name: 'Support Agent',
    email: 'support@yaad.app',
    role: 'support_agent' as const,
    totpSecret: 'ABCDEF',
    isTotpEnabled: true,
    status: 'active' as const,
    failedAttempts: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  let ticket: any = null;
  let accessReq: any = null;
  let campaign: any = null;

  try {
    // --- 1. Security Alert Generation & Notification Extraction ---
    console.log('--- 1. Testing Security Alert Notification Aggregation ---');
    const realAdmin = adminStore.getAllAdmins()[0];
    // Trigger 5 failed logins on actual admin account to generate lockout security alert
    for (let i = 0; i < 5; i++) {
      adminStore.recordFailedLogin(realAdmin.id, '192.168.1.100');
    }
    
    const superNotifs1 = adminStore.getAdminNotifications(superAdmin);
    console.log(`Super admin notifications count: ${superNotifs1.notifications.length}, unread: ${superNotifs1.unreadCount}`);
    const secNotif = superNotifs1.notifications.find((n) => n.type === 'security');
    if (!secNotif) {
      throw new Error('Expected security alert notification after account lockout');
    }
    console.log(`✅ PASSED: Super admin receives security alert notification: "${secNotif.title}"`);
    adminStore.resetFailedAttempts(realAdmin.id);

    // --- 2. Support Ticket Notification Aggregation ---
    console.log('--- 2. Testing Support Ticket Notification Aggregation ---');
    ticket = adminStore.createSupportTicket({
      userId: 'user_shopper_99',
      userName: 'Ayesha Khan',
      userEmail: 'ayesha@example.com',
      subject: 'Rashan List Missing Ghee Item',
      description: 'My weekend shopping list is missing Banaspati Ghee after synchronization.',
      category: 'lists',
      priority: 'urgent',
    });

    const supportNotifs = adminStore.getAdminNotifications(supportAgent);
    const ticketNotif = supportNotifs.notifications.find((n) => n.targetId === ticket.id);
    if (!ticketNotif) {
      throw new Error('Support agent should receive notification for urgent ticket');
    }
    if (ticketNotif.type !== 'ticket' || ticketNotif.severity !== 'urgent') {
      throw new Error(`Expected urgent ticket notification, got ${ticketNotif.type}/${ticketNotif.severity}`);
    }
    console.log(`✅ PASSED: Support ticket notification generated with urgent severity: ${ticketNotif.title}`);

    // --- 3. Staff Access Request Notification Aggregation ---
    console.log('--- 3. Testing Staff Access Request Notification Aggregation ---');
    accessReq = adminStore.createAccessRequest({
      name: 'Bilal Ahmed',
      email: 'bilal@yaad.app',
      phone: '03001234567',
      requestedRole: 'support_agent',
      department: 'Customer Success',
      reason: 'Handling customer queries during Ramadan peak.',
    });

    const superNotifs2 = adminStore.getAdminNotifications(superAdmin);
    const reqNotif = superNotifs2.notifications.find((n) => n.targetId === accessReq.id);
    if (!reqNotif) {
      throw new Error('Super admin should receive notification for pending staff access request');
    }
    console.log(`✅ PASSED: Staff access request notification received by Super Admin: ${reqNotif.title}`);

    // Ensure support agent does NOT see staff access request
    const supportNotifs2 = adminStore.getAdminNotifications(supportAgent);
    const leakedReqNotif = supportNotifs2.notifications.find((n) => n.targetId === accessReq.id);
    if (leakedReqNotif) {
      throw new Error('Support agent should not see staff access request notifications');
    }
    console.log('✅ PASSED: RBAC scoping verified: Support agents do not receive staff access requests');

    // --- 4. Notification Dismissal (Single) ---
    console.log('--- 4. Testing Notification Dismissal (Single) ---');
    const targetDismissId = ticketNotif.id;
    const dismissed = adminStore.dismissNotification(targetDismissId);
    if (!dismissed) {
      throw new Error('Dismiss notification should return true');
    }

    const supportNotifsAfter = adminStore.getAdminNotifications(supportAgent);
    if (supportNotifsAfter.notifications.some((n) => n.id === targetDismissId)) {
      throw new Error('Dismissed notification should no longer appear in active list');
    }
    console.log('✅ PASSED: Individual notification dismissed successfully');

    // --- 5. Dismiss All Notifications ---
    console.log('--- 5. Testing Dismiss All Notifications ---');
    adminStore.dismissAllNotifications();
    const superNotifsCleared = adminStore.getAdminNotifications(superAdmin);
    if (superNotifsCleared.unreadCount !== 0 || superNotifsCleared.notifications.length !== 0) {
      throw new Error(`Expected 0 notifications after dismissAll, got ${superNotifsCleared.unreadCount}`);
    }
    console.log('✅ PASSED: Dismiss all notifications successfully cleared active list');

    // --- 6. Push Broadcast Campaign Generation ---
    console.log('--- 6. Testing Push Notification Broadcast Campaign ---');
    campaign = adminStore.sendPushCampaign({
      titleEn: 'Weekend Sabzi Mandi Rates Updated 🥬',
      titleUr: 'ہفتہ وار سبزی منڈی کے نرخ اپ ڈیٹ ہو گئے',
      bodyEn: 'Fresh potatoes, onions and tomatoes prices are refreshed for this weekend.',
      bodyUr: 'تازہ سبزیوں کی قیمتیں چیک کریں اور اپنی پرچی بنائیں',
      targetAudience: 'all_active',
      createdBy: superAdmin.email,
    });

    const campaigns = adminStore.getPushCampaigns();
    const found = campaigns.find((c) => c.id === campaign.id);
    if (!found || found.status !== 'sent') {
      throw new Error('Broadcast campaign should be stored with status sent');
    }
    console.log(`✅ PASSED: Push campaign dispatched: "${found.titleEn}" to estimated ${found.estimatedRecipients} shoppers`);

    console.log('==================================================');
    console.log('🎉 ALL ADMIN NOTIFICATIONS SYSTEM QA TESTS PASSED!');
    console.log('==================================================');
  } finally {
    if (ticket) adminStore.deleteSupportTicket(ticket.id);
    if (accessReq) adminStore.deleteAccessRequest(accessReq.id);
    if (campaign) adminStore.deletePushCampaign(campaign.id);
    (adminStore as any).db.dismissedNotificationIds = [];
    (adminStore as any).save();
  }
}

runNotificationsTests().catch((err) => {
  console.error('❌ NOTIFICATIONS QA TEST FAILED:', err);
  process.exit(1);
});
