import { formatAuthErrorMessage, cleanAuthUrlParams } from '../src/lib/supabase';

console.log('====================================================');
console.log('🧪 VERIFYING SUPABASE PASSWORD RESET & RECOVERY FLOW');
console.log('====================================================');

let allPassed = true;

function assert(condition: boolean, description: string) {
  if (condition) {
    console.log(`✅ PASSED: ${description}`);
  } else {
    console.error(`❌ FAILED: ${description}`);
    allPassed = false;
  }
}

// 1. Verify Error Formatting for Password Reset Context
console.log('\n--- 1. Testing formatAuthErrorMessage with password_reset context ---');

// Generic error should NOT say "while signing you in"
const genericErrResult = formatAuthErrorMessage(new Error('Unknown backend error'), 'password_reset');
assert(
  !genericErrResult.includes('signing you in'),
  `Generic error does not produce "while signing you in": "${genericErrResult}"`
);

// Database / PGRST error
const dbErrResult = formatAuthErrorMessage(new Error('Database error saving new password'), 'password_reset');
assert(
  !dbErrResult.includes('signing you in') && dbErrResult.includes('Failed to update password'),
  `Database error produces clean reset message: "${dbErrResult}"`
);

// Auth session missing
const sessionMissingResult = formatAuthErrorMessage(new Error('Auth session missing!'), 'password_reset');
assert(
  sessionMissingResult === 'Your reset link has expired. Request a new one.',
  `Missing session mapped to expired link: "${sessionMissingResult}"`
);

// Bearer token requirement error
const bearerTokenResult = formatAuthErrorMessage(new Error('This endpoint requires a Bearer token'), 'password_reset');
assert(
  bearerTokenResult === 'Your reset link has expired. Request a new one.',
  `Bearer token error mapped to expired link: "${bearerTokenResult}"`
);

// Same password error
const samePassResult = formatAuthErrorMessage(new Error('New password should be different from the old password.'), 'password_reset');
assert(
  samePassResult === 'New password cannot be the same as your current password.',
  `Same password error mapped correctly: "${samePassResult}"`
);

// Weak / short password
const weakPassResult = formatAuthErrorMessage(new Error('Password should be at least 6 characters'), 'password_reset');
assert(
  weakPassResult === 'Please choose a stronger password.',
  `Weak password error mapped correctly: "${weakPassResult}"`
);

// 2. Verify Password Validation Rules
console.log('\n--- 2. Testing Password Validation Requirements ---');

function validatePasswordInput(pwd: string, confirm: string) {
  const hasMinLength = pwd.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const passwordsMatch = pwd.length > 0 && pwd === confirm;
  const isValid = hasMinLength && hasLetter && hasNumber && passwordsMatch;

  let error: string | null = null;
  if (!hasMinLength) error = 'Password must be at least 6 characters.';
  else if (!hasLetter || !hasNumber) error = 'Password must contain both letters and numbers.';
  else if (!passwordsMatch) error = 'Passwords do not match.';

  return { isValid, error };
}

assert(validatePasswordInput('12345', '12345').isValid === false, 'Rejects password shorter than 6 characters');
assert(validatePasswordInput('abcdef', 'abcdef').isValid === false, 'Rejects letters-only password');
assert(validatePasswordInput('123456', '123456').isValid === false, 'Rejects numbers-only password');
assert(validatePasswordInput('Alpha123', 'Alpha456').isValid === false, 'Rejects non-matching passwords');
assert(validatePasswordInput('Secret123', 'Secret123').isValid === true, 'Accepts valid password with letters, numbers, and match');

// 3. Verify cleanAuthUrlParams Protection Logic
console.log('\n--- 3. Testing URL Cleanup Guard during Recovery ---');

// Mock browser window environment
const mockStorage: Record<string, string> = {};
(global as any).sessionStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => { mockStorage[key] = val; },
  removeItem: (key: string) => { delete mockStorage[key]; },
};

let currentHref = 'https://yaadapppk.vercel.app/#access_token=test_token&refresh_token=test_ref&type=recovery';
let currentHash = '#access_token=test_token&refresh_token=test_ref&type=recovery';

(global as any).window = {
  location: {
    get href() { return currentHref; },
    get hash() { return currentHash; },
    search: '',
    pathname: '/',
  },
  history: {
    replaceState: (_state: any, _title: string, newUrl: string) => {
      currentHref = `https://yaadapppk.vercel.app${newUrl}`;
      const hashIdx = newUrl.indexOf('#');
      currentHash = hashIdx !== -1 ? newUrl.substring(hashIdx) : '';
    },
  },
};
(global as any).document = { title: 'YAAD' };

// When recovery flag is set: cleanAuthUrlParams(false) must NOT strip the hash!
mockStorage['yaad_password_recovery_active'] = 'true';
cleanAuthUrlParams(false);
assert(
  currentHash.includes('access_token'),
  `URL recovery tokens preserved during recovery session: "${currentHash}"`
);

// Forced cleanup (cleanAuthUrlParams(true)): MUST strip tokens after password update or cancel
cleanAuthUrlParams(true);
assert(
  !currentHash.includes('access_token'),
  `Forced URL cleanup strips tokens when recovery is completed/cancelled: "${currentHash}"`
);

console.log('\n====================================================');
if (allPassed) {
  console.log('🎉 ALL RECOVERY FLOW VALIDATION TESTS PASSED!');
  console.log('====================================================');
  process.exit(0);
} else {
  console.error('❌ SOME RECOVERY FLOW TESTS FAILED');
  console.log('====================================================');
  process.exit(1);
}
