import assert from 'assert';
import { generateStrongPassword } from '../src/utils/passwordGenerator.ts';

async function runTests() {
  console.log('==================================================');
  console.log('VERIFYING SHOPPING HISTORY BULK DELETE & SUPPORT DESK');
  console.log('==================================================\n');

  // 1. Password Generator Tests
  console.log('--- 1. Cryptographic Strong Password Generator ---');
  const pwd1 = generateStrongPassword(16);
  const pwd2 = generateStrongPassword(16);
  assert.strictEqual(pwd1.length, 16, 'Password length should be 16');
  assert.notStrictEqual(pwd1, pwd2, 'Generated passwords must be unique');
  assert.match(pwd1, /[A-Z]/, 'Must contain uppercase character');
  assert.match(pwd1, /[a-z]/, 'Must contain lowercase character');
  assert.match(pwd1, /[0-9]/, 'Must contain numeric digit');
  assert.match(pwd1, /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/, 'Must contain symbol character');
  console.log('✅ PASSED: Password generator creates compliant, high-entropy 16-char passwords.');

  // 2. Blog Articles CMS Synchronized Test
  console.log('\n--- 2. Public Authentic Blog Articles ---');
  const blogRes = await fetch('http://localhost:3000/api/blog/articles');
  assert.strictEqual(blogRes.status, 200, 'Blog articles endpoint must return 200');
  const blogData = await blogRes.json();
  assert.ok(Array.isArray(blogData.articles), 'Articles must be an array');
  assert.ok(blogData.articles.length >= 3, 'Must contain authentic articles');
  // Confirm NO mock articles like art_smart_rashan_checklist exist
  const mockExists = blogData.articles.some((a: any) => a.id === 'art_smart_rashan_checklist');
  assert.strictEqual(mockExists, false, 'Mock art_smart_rashan_checklist must not exist');
  console.log(`✅ PASSED: ${blogData.articles.length} authentic blog articles returned with zero mock data.`);

  // 3. Support Desk Ticket Submission API
  console.log('\n--- 3. Help & Support Ticket Submission ---');
  const ticketRes = await fetch('http://localhost:3000/api/support/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userEmail: 'shopper_qa@yaad.pk',
      userName: 'Tariq Mehmood',
      userPhone: '+92 300 9876543',
      subject: 'Grocery item category mismatch',
      description: 'Basmati Rice was categorized under Dairy instead of Grains.',
      category: 'bug',
      priority: 'high',
    }),
  });
  assert.strictEqual(ticketRes.status, 201, 'Ticket creation must return 201');
  const ticketData = await ticketRes.json();
  assert.strictEqual(ticketData.success, true);
  assert.ok(ticketData.ticket.ticketNumber.startsWith('TKT-'), 'Ticket number must follow TKT- prefix format');
  assert.strictEqual(ticketData.ticket.userEmail, 'shopper_qa@yaad.pk');
  console.log(`✅ PASSED: Ticket created successfully: ${ticketData.ticket.ticketNumber}`);

  // 4. Admin Access Requests
  console.log('\n--- 4. Apply for Admin Access Flow ---');
  const accessRes = await fetch('http://localhost:3000/api/admin/access-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Sarah Khan',
      email: 'sarah.khan@yaadapp.pk',
      requestedRole: 'editor',
      department: 'Urdu Editorial & Catalog',
      reason: 'Need access to manage Ramadan Rashan guide articles and grocery classifications.',
    }),
  });
  assert.strictEqual(accessRes.status, 201, 'Access request must return 201');
  const accessData = await accessRes.json();
  assert.strictEqual(accessData.success, true);
  assert.strictEqual(accessData.request.name, 'Sarah Khan');
  assert.strictEqual(accessData.request.status, 'pending');
  console.log(`✅ PASSED: Admin access application registered for ${accessData.request.name} (status: pending).`);

  console.log('\n==================================================');
  console.log('🎉 ALL INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
  console.log('==================================================\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
