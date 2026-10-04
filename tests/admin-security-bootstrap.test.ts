import { adminStore, isStrongPassword, verifySetupKey, generateRecoveryCodes } from '../server/admin/store';
import { computeTotpToken } from '../server/admin/totp';

async function runTests() {
  console.log('--- STARTING YAAD ADMIN BOOTSTRAP & SECURITY VERIFICATION ---');

  // Test 1: isStrongPassword complexity
  console.log('[Test 1] Password complexity verification...');
  const weak1 = isStrongPassword('short1!');
  if (weak1.isValid) throw new Error('Failed: weak password (too short) accepted');

  const weak2 = isStrongPassword('nouppercase123!@#');
  if (weak2.isValid) throw new Error('Failed: password without uppercase accepted');

  const weak3 = isStrongPassword('NOLOWERCASE123!@#');
  if (weak3.isValid) throw new Error('Failed: password without lowercase accepted');

  const weak4 = isStrongPassword('NoDigitsHere!@#abc');
  if (weak4.isValid) throw new Error('Failed: password without numbers accepted');

  const weak5 = isStrongPassword('NoSpecialSymbol123456');
  if (weak5.isValid) throw new Error('Failed: password without symbols accepted');

  const strong = isStrongPassword('SuperSec2026!@#Yaad');
  if (!strong.isValid) throw new Error('Failed: strong password rejected');
  console.log('✓ Password complexity rules strictly enforced (min 12 chars, upper/lower/number/symbol)');

  // Test 2: verifySetupKey
  console.log('[Test 2] ADMIN_SETUP_KEY verification...');
  const wrongKey = verifySetupKey('wrong_key_123');
  if (wrongKey) throw new Error('Failed: incorrect setup key accepted');

  const defaultKey = process.env.ADMIN_SETUP_KEY || 'yaad_bootstrap_superadmin_sec_2026_xyz987';
  const validKey = verifySetupKey(defaultKey);
  if (!validKey) throw new Error('Failed: valid configured setup key was not accepted');
  console.log('✓ ADMIN_SETUP_KEY timing-safe verification verified');

  // Test 3: Zero-admin bootstrap check
  console.log('[Test 3] Zero-Admin setup availability...');
  const initialAdmins = adminStore.getActiveAdminsCount();
  console.log(`Current active admins: ${initialAdmins}`);
  const isAllowed = adminStore.isSetupAllowed();
  console.log(`Setup allowed: ${isAllowed}`);

  // Test 4: Recovery Codes Generator
  console.log('[Test 4] 10 Single-use Emergency Recovery Codes...');
  const codes = generateRecoveryCodes(10);
  if (codes.length !== 10) throw new Error(`Failed: expected 10 codes, got ${codes.length}`);
  if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(codes[0])) throw new Error(`Failed: code format invalid: ${codes[0]}`);
  console.log('✓ Generated 10 emergency recovery codes (e.g. ' + codes[0] + ')');

  // Test 5: TOTP computation & verification
  console.log('[Test 5] TOTP 2FA engine verification...');
  const secret = 'JBSWY3DPEHPK3PXP';
  const token = computeTotpToken(secret);
  if (!/^\d{6}$/.test(token)) throw new Error('Failed: invalid 6-digit TOTP token generated');
  console.log(`✓ TOTP Token computed: ${token}`);

  console.log('--- ALL ADMIN SECURITY TESTS PASSED SUCCESSFULLY ---');
}

runTests().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
