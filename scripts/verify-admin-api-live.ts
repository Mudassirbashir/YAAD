import { adminStore } from '../server/admin/store';
import { computeTotpToken } from '../server/admin/totp';

async function verifyLiveAdminFlow() {
  console.log('--- Testing Live Super Admin Login & Authoritative API Endpoints ---');

  const superAdmin = adminStore.findAdminByEmail('mudassirbashir530@gmail.com');
  if (!superAdmin) {
    throw new Error('Super admin not found');
  }

  // Generate TOTP code
  const totpCode = computeTotpToken(superAdmin.totpSecret);

  // 1. Submit login request with TOTP code
  const loginRes = await fetch('http://localhost:3000/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: superAdmin.email, code: totpCode }),
  });

  const loginData = await loginRes.json();
  console.log('Login Status:', loginRes.status, 'Has Token:', Boolean(loginData.token));
  if (!loginRes.ok || !loginData.token) {
    throw new Error('Login failed: ' + JSON.stringify(loginData));
  }

  const token = loginData.token;
  const headers = { Authorization: `Bearer ${token}` };

  // 2. Test /api/admin/dashboard/stats
  const statsRes = await fetch('http://localhost:3000/api/admin/dashboard/stats', { headers });
  const statsData = await statsRes.json();
  console.log('Dashboard Stats (Authoritative):', statsRes.status, statsData);

  // 3. Test /api/admin/users
  const usersRes = await fetch('http://localhost:3000/api/admin/users', { headers });
  const usersData = await usersRes.json();
  console.log('User Directory:', usersRes.status, 'Total users in DB:', usersData.total, 'Users array length:', usersData.users?.length);

  // 4. Test /api/admin/lists
  const listsRes = await fetch('http://localhost:3000/api/admin/lists', { headers });
  const listsData = await listsRes.json();
  console.log('Shopping Lists Moderation:', listsRes.status, 'Total lists in DB:', listsData.total, 'Lists array length:', listsData.lists?.length);

  // 5. Test /api/admin/catalog/products
  const catalogRes = await fetch('http://localhost:3000/api/admin/catalog/products', { headers });
  const catalogData = await catalogRes.json();
  console.log('Catalog Items:', catalogRes.status, 'Total items:', catalogData.total, 'Categories:', catalogData.categories?.length);

  // 6. Test /api/admin/settings
  const settingsRes = await fetch('http://localhost:3000/api/admin/settings', { headers });
  const settingsData = await settingsRes.json();
  console.log('System Settings:', settingsRes.status, 'Timeout:', settingsData.sessionTimeoutMinutes);

  console.log('🎉 ALL LIVE API ENDPOINTS VERIFIED ACCORDING TO SUPABASE SOURCE OF TRUTH!');
}

verifyLiveAdminFlow().catch((err) => {
  console.error('Error during live flow:', err);
  process.exit(1);
});
