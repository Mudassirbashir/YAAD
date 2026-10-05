import { adminStore, generateRecoveryCodes } from '../server/admin/store';
import { generateTotpSecret, computeTotpToken, verifyTotpToken } from '../server/admin/totp';
import {
  saveSharedTempToken,
  validateSharedTempToken,
  deleteSharedTempToken,
  persistSharedSession,
  getSharedSessionFromDb,
} from '../server/admin/supabaseAdmin';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runServerlessAuthTests() {
  console.log('==================================================');
  console.log('🧪 RUNNING YAAD ADMIN SERVERLESS AUTH & SECURITY QA');
  console.log('==================================================');

  // --- 1. Compromised Secret Invalidation ---
  console.log('--- 1. Testing Compromised Secret Invalidation ---');
  const superAdmin = adminStore.findAdminByEmail('mudassirbashir530@gmail.com');
  assert(Boolean(superAdmin), 'Super admin account exists');
  const burnedSecret = 'WN3L5VHPJLOR7GCBNJWZVTXCVKZPK7IO';
  assert(superAdmin!.totpSecret !== burnedSecret, 'Leaked TOTP secret is not active on super admin');
  console.log('✅ PASSED: Leaked TOTP secret is permanently invalidated');

  // --- 2. Fresh TOTP Key Generation & RFC 6238 Verification ---
  console.log('--- 2. Testing Fresh TOTP Key Generation ---');
  const freshSecret = generateTotpSecret();
  assert(freshSecret.length >= 32, 'Generated secret has sufficient entropy');
  const code = computeTotpToken(freshSecret);
  assert(/^\d{6}$/.test(code), 'Generated TOTP code is 6 digits');
  assert(verifyTotpToken(freshSecret, code), 'Computed TOTP code is valid');
  assert(!verifyTotpToken(freshSecret, '000000'), 'Arbitrary 6-digit code is rejected');
  console.log('✅ PASSED: Fresh TOTP generation and timing-safe RFC 6238 verification works');

  // --- 3. Super Admin Re-Enrollment & 2FA Activation ---
  console.log('--- 3. Testing 2FA Activation & Recovery Codes ---');
  adminStore.enableTotp(superAdmin!.id, freshSecret);
  const recoveryCodes = generateRecoveryCodes(10);
  assert(recoveryCodes.length === 10, '10 recovery codes generated');
  adminStore.setRecoveryCodes(superAdmin!.id, recoveryCodes);

  const updatedAdmin = adminStore.findAdminById(superAdmin!.id);
  assert(Boolean(updatedAdmin?.isTotpEnabled), 'Super Admin isTotpEnabled is true');
  assert(updatedAdmin?.totpSecret === freshSecret, 'Super Admin active secret matches fresh secret');
  console.log('✅ PASSED: 2FA enrollment activation and recovery codes setup');

  // --- 4. Passwordless Login with New TOTP ---
  console.log('--- 4. Testing Passwordless Login with Fresh TOTP ---');
  const validCode = computeTotpToken(freshSecret);
  assert(verifyTotpToken(updatedAdmin!.totpSecret, validCode), 'Valid code verified against updated admin');
  const session = adminStore.createSession(updatedAdmin!, '127.0.0.1', 'Node-Test-Runner');
  assert(Boolean(session.token), 'Session token generated');

  const sessionValidation = await adminStore.validateSessionAsync(session.token);
  assert(Boolean(sessionValidation.session), 'Session validates asynchronously');
  assert(sessionValidation.admin?.email === 'mudassirbashir530@gmail.com', 'Session matches super admin');
  console.log('✅ PASSED: Passwordless login and asynchronous session validation');

  // --- 5. Shared Temporary Token Persistence ---
  console.log('--- 5. Testing Shared Temp Token Storage ---');
  const tempToken = 'test_token_' + Date.now();
  await saveSharedTempToken(tempToken, updatedAdmin!.id, updatedAdmin!.email, 'login', 60000);
  const retrieved = await validateSharedTempToken(tempToken, 'login');
  assert(Boolean(retrieved), 'Temporary token retrieved successfully');
  assert(retrieved?.adminId === updatedAdmin!.id, 'Temp token admin ID matches');
  await deleteSharedTempToken(tempToken);
  const afterDelete = await validateSharedTempToken(tempToken, 'login');
  assert(afterDelete === null, 'Temp token deleted after single-use');
  console.log('✅ PASSED: Single-use temp token lifecycle across instances');

  // --- 6. New Staff Invitation & Acceptance Lifecycle ---
  console.log('--- 6. Testing New Staff Invitation Lifecycle ---');
  const inviteEmail = `staff_${Date.now()}@yaad.app`;
  const invite = adminStore.createInvite({
    email: inviteEmail,
    name: 'Support Agent',
    role: 'support_agent',
    invitedBy: {
      id: updatedAdmin!.id,
      email: updatedAdmin!.email,
      name: updatedAdmin!.name,
    },
  });
  assert(Boolean(invite.token), 'Invite token created');

  const foundInvite = await adminStore.findInviteByTokenAsync(invite.token);
  assert(Boolean(foundInvite), 'Invite found via findInviteByTokenAsync');

  const staffSecret = generateTotpSecret();
  const staffCode = computeTotpToken(staffSecret);
  assert(verifyTotpToken(staffSecret, staffCode), 'Staff TOTP code valid');

  const newStaff = adminStore.acceptInvite(foundInvite!, 'MockPass123!@#', staffSecret);
  assert(Boolean(newStaff), 'Staff account created upon accepting invite');
  assert(newStaff.role === 'support_agent', 'Staff has correct assigned role');
  assert(newStaff.isTotpEnabled, 'Staff 2FA is active');

  const staffSession = adminStore.createSession(newStaff, '127.0.0.1', 'Staff-Client');
  const staffValidation = await adminStore.validateSessionAsync(staffSession.token);
  assert(staffValidation.admin?.id === newStaff.id, 'Staff session validates');
  console.log('✅ PASSED: New staff invitation, 2FA enrollment, and session authorization');

  // --- 7. Setup Route Gating ---
  console.log('--- 7. Testing Setup Route Disabled Gating ---');
  assert(!adminStore.isSetupAllowed(), 'isSetupAllowed() returns false when active admins exist');
  console.log('✅ PASSED: Setup route permanently disabled once super admin exists');

  // --- 8. Emergency Recovery Code Consumption ---
  console.log('--- 8. Testing Emergency Recovery Code Consumption ---');
  const testRecoveryCode = recoveryCodes[0];
  const consumed = adminStore.consumeRecoveryCode(updatedAdmin!.id, testRecoveryCode);
  assert(consumed, 'Emergency recovery code consumed successfully');
  const secondConsume = adminStore.consumeRecoveryCode(updatedAdmin!.id, testRecoveryCode);
  assert(!secondConsume, 'Single-use recovery code cannot be reused');
  console.log('✅ PASSED: Single-use emergency recovery code security');

  console.log('==================================================');
  console.log('🎉 ALL ADMIN SERVERLESS AUTH QA TESTS PASSED!');
  console.log('==================================================');
}

runServerlessAuthTests().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
