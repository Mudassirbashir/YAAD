import dotenv from 'dotenv';
dotenv.config();
import { adminStore } from '../server/admin/store';
import { computeTotpToken } from '../server/admin/totp';

async function runVerification() {
  console.log('--- STARTING COMPREHENSIVE ISSUE VERIFICATION ---');
  const baseUrl = 'http://localhost:3000';

  // 1. Verify Super Admin Login
  console.log('\n[TEST 1] Logging into Super Admin...');
  const superAdmin = adminStore.findAdminByEmail('mudassirbashir530@gmail.com');
  if (!superAdmin) {
    throw new Error('Super admin not found');
  }
  const totpCode = computeTotpToken(superAdmin.totpSecret);

  const loginRes = await fetch(`${baseUrl}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: superAdmin.email,
      code: totpCode,
    }),
  });

  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.token) {
    console.error('Failed to log in:', loginData);
    process.exit(1);
  }
  const token = loginData.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  console.log('✓ Super Admin authenticated successfully.');

  // 2. Issue 1: Staff Invitation Link (Stateless Signed Token)
  console.log('\n[TEST 2] Verifying Staff Invite Creation & Stateless Verification...');
  const inviteRes = await fetch(`${baseUrl}/api/admin/invites`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      email: `test_writer_${Date.now()}@example.com`,
      name: 'Content Writer Test',
      role: 'content_editor',
    }),
  });
  const inviteText = await inviteRes.text();
  console.log('Invite Response Status:', inviteRes.status);
  let inviteData: any;
  try {
    inviteData = JSON.parse(inviteText);
  } catch {
    console.error('Invite Response is not JSON:', inviteText.slice(0, 300));
    process.exit(1);
  }
  if (!inviteRes.ok || !inviteData.invite?.token) {
    console.error('Failed to generate invite:', inviteData);
    process.exit(1);
  }
  const inviteToken = inviteData.invite.token;
  console.log('✓ Invite created with token length:', inviteToken.length);

  // Verify the invite token statelessly from an independent client (no session headers)
  const verifyInviteRes = await fetch(`${baseUrl}/api/admin/invites/verify?token=${encodeURIComponent(inviteToken)}`);
  const verifyInviteData = await verifyInviteRes.json();
  if (!verifyInviteRes.ok || !verifyInviteData.email) {
    console.error('Stateless token verification failed:', verifyInviteData);
    process.exit(1);
  }
  console.log('✓ Stateless invite verification succeeded across separate browser/client context!');
  console.log('  Invited email:', verifyInviteData.email);
  console.log('  Role:', verifyInviteData.role);

  // 3. Issue 2: Access Requests & Email Allowlist
  console.log('\n[TEST 3] Verifying Access Requests & Email Allowlist...');
  const reqEmail = `applicant_${Date.now()}@example.com`;
  const accessApplyRes = await fetch(`${baseUrl}/api/admin/access-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Usman Marketing',
      email: reqEmail,
      phone: '03001234567',
      requestedRole: 'content_editor',
      department: 'Marketing & Content',
      reason: 'Need access to publish weekly sabzi mandi guides',
    }),
  });
  const accessApplyData = await accessApplyRes.json();
  if (!accessApplyRes.ok || !accessApplyData.request) {
    console.error('Failed to submit access request:', accessApplyData);
    process.exit(1);
  }
  const requestId = accessApplyData.request.id;
  console.log('✓ Public access request submitted successfully. Request ID:', requestId);

  // Super Admin retrieves access requests
  const listRequestsRes = await fetch(`${baseUrl}/api/admin/access-requests`, {
    headers: authHeaders,
  });
  const listRequestsData = await listRequestsRes.json();
  const foundRequest = (listRequestsData.requests || []).find((r: any) => r.id === requestId);
  if (!foundRequest) {
    console.error('Submitted request not found in admin list:', listRequestsData);
    process.exit(1);
  }
  console.log('✓ Super Admin successfully fetched pending access request from list!');

  // Super Admin updates status (approve)
  const updateReqRes = await fetch(`${baseUrl}/api/admin/access-requests/${requestId}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ status: 'approved' }),
  });
  const updateReqData = await updateReqRes.json();
  if (!updateReqRes.ok || updateReqData.request?.status !== 'approved') {
    console.error('Failed to approve request:', updateReqData);
    process.exit(1);
  }
  console.log('✓ Access request approved successfully.');

  // Email Allowlist fetch & save
  const allowlistGetRes = await fetch(`${baseUrl}/api/admin/settings/allowlist`, {
    headers: authHeaders,
  });
  const allowlistGetData = await allowlistGetRes.json();
  console.log('✓ Allowlist fetched:', allowlistGetData.allowlist);

  const allowlistPostRes = await fetch(`${baseUrl}/api/admin/settings/allowlist`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ allowlist: [...(allowlistGetData.allowlist || []), reqEmail] }),
  });
  const allowlistPostData = await allowlistPostRes.json();
  if (!allowlistPostRes.ok) {
    console.error('Failed to update allowlist:', allowlistPostData);
    process.exit(1);
  }
  console.log('✓ Allowlist updated and persisted successfully.');

  // 4. Issue 5: Support Desk (Shopper Inquiry & Admin Reply via Notifications)
  console.log('\n[TEST 4] Verifying Support Desk Ticket & Admin In-App Reply...');
  const ticketRes = await fetch(`${baseUrl}/api/support/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Ahmed Shopper',
      email: 'ahmed.shopper@example.com',
      phone: '03129876543',
      subject: 'Question about Mandi Rate Accuracy',
      message: 'Are tomato prices updated daily at 7 AM?',
      priority: 'normal',
    }),
  });
  const ticketData = await ticketRes.json();
  if (!ticketRes.ok || !ticketData.ticket?.id) {
    console.error('Failed to create support ticket:', ticketData);
    process.exit(1);
  }
  const ticketId = ticketData.ticket.id;
  console.log('✓ Shopper support ticket submitted successfully. ID:', ticketId);

  // Admin replies to ticket
  const adminReplyRes = await fetch(`${baseUrl}/api/admin/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      status: 'resolved',
      replyMessage: 'Yes! Rates are synced directly from the wholesale market every morning at 7:00 AM.',
    }),
  });
  const adminReplyData = await adminReplyRes.json();
  if (!adminReplyRes.ok) {
    console.error('Admin reply to ticket failed:', adminReplyData);
    process.exit(1);
  }
  console.log('✓ Admin successfully replied to support ticket and resolved it.');

  // 5. Issue 6: Push Notifications, Pakistani Templates, Open Rate & Refresh
  console.log('\n[TEST 5] Verifying Push Templates & Delivery/Open Metrics...');
  const templatesRes = await fetch(`${baseUrl}/api/admin/push/templates`, {
    headers: authHeaders,
  });
  const templatesData = await templatesRes.json();
  if (!templatesRes.ok || !Array.isArray(templatesData.templates)) {
    console.error('Failed to fetch push templates:', templatesData);
    process.exit(1);
  }
  console.log(`✓ Retrieved ${templatesData.templates.length} pre-written push templates.`);
  const mandiTemplate = templatesData.templates.find((t: any) => t.category === 'mandi');
  console.log('  Sample Template:', mandiTemplate?.titleEn, '->', mandiTemplate?.titleUr);

  // Send Push Broadcast
  const broadcastRes = await fetch(`${baseUrl}/api/admin/push/campaigns`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title_en: mandiTemplate?.titleEn || 'Sabzi Mandi Rates 🛒',
      title_ur: mandiTemplate?.titleUr || 'سبزی منڈی ریٹ اپڈیٹ',
      body_en: mandiTemplate?.bodyEn || 'Fresh tomatoes and onions at wholesale rates.',
      body_ur: mandiTemplate?.bodyUr || 'تازہ سبزیاں منڈی ریٹ پر۔',
      target_audience: 'all_active',
    }),
  });
  const broadcastData = await broadcastRes.json();
  if (!broadcastRes.ok || !broadcastData.campaign) {
    console.error('Failed to send broadcast:', broadcastData);
    process.exit(1);
  }
  const campaign = broadcastData.campaign;
  console.log('✓ Push broadcast sent successfully. ID:', campaign.id);
  console.log('  Delivered count:', campaign.deliveredCount);
  console.log('  Initial opened count:', campaign.openedCount);

  if (campaign.deliveredCount < 1) {
    console.error('Delivered count is 0! Expected >= 1');
    process.exit(1);
  }

  // Simulate shopper opening the notification in app
  const openRes = await fetch(`${baseUrl}/api/notifications/open`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notificationId: campaign.id }),
  });
  const openData = await openRes.json();
  if (!openRes.ok) {
    console.error('Failed to record notification open:', openData);
    process.exit(1);
  }
  console.log('✓ Shopper opened notification recorded.');

  // Fetch campaigns again to verify updated opened count & open rate
  const campaignsListRes = await fetch(`${baseUrl}/api/admin/push/campaigns`, {
    headers: authHeaders,
  });
  const campaignsListData = await campaignsListRes.json();
  const refreshedCampaign = (campaignsListData.campaigns || []).find((c: any) => c.id === campaign.id);
  console.log('✓ Refreshed campaign stats:');
  console.log('  Delivered:', refreshedCampaign?.deliveredCount);
  console.log('  Opened:', refreshedCampaign?.openedCount);
  const openRate = refreshedCampaign?.deliveredCount > 0
    ? Math.round((refreshedCampaign.openedCount / refreshedCampaign.deliveredCount) * 100)
    : 0;
  console.log('  Computed Open Rate:', openRate + '%');

  // 6. Issue 7: Account Deletion Endpoint
  console.log('\n[TEST 6] Verifying Account Deletion Endpoint...');
  const deleteRes = await fetch(`${baseUrl}/api/account/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'test_ephemeral_user_123' }),
  });
  const deleteData = await deleteRes.json();
  if (!deleteRes.ok || !deleteData.success) {
    console.error('Account deletion endpoint returned failure:', deleteData);
    process.exit(1);
  }
  console.log('✓ Account deletion endpoint successfully executed permanent purge response.');

  console.log('\n======================================================');
  console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
  console.log('======================================================');
}

runVerification().catch((err) => {
  console.error('Unhandled error in verification:', err);
  process.exit(1);
});
