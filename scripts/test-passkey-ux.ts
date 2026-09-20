/**
 * YAAD Passkey UX & Single Source of Truth Validation Test Suite
 */
import { formatAuthErrorMessage } from '../src/lib/supabase';
import { formatPasskeyError } from '../src/lib/passkey';
import { PasskeyCredentialInfo } from '../src/types';
import { checkIsMobileDevice } from '../src/hooks/useIsMobileDevice';
import { checkUserHasPhone } from '../src/hooks/usePhoneNumberReminder';

let failures = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✅ PASSED: ${testName}`);
  } else {
    console.error(`❌ FAILED: ${testName}`);
    failures++;
  }
}

console.log('==================================================');
console.log('🧪 RUNNING YAAD PASSKEY UX & REAL-TIME STATE TESTS');
console.log('==================================================');

// --- 1. Single Source of Truth & Error Normalization ---
console.log('\n--- 1. Testing Passkey Error Handling & Format ---');

assert(
  formatAuthErrorMessage(new Error('Passkey not found on this device.')) ===
    'Passkey not found on this device.',
  'formatAuthErrorMessage preserves passkey not found message'
);

assert(
  formatPasskeyError(new Error('The operation either timed out or was not allowed.')).includes('cancelled') ||
  formatPasskeyError(new Error('The operation either timed out or was not allowed.')).includes('prompt'),
  'formatPasskeyError formats cancellation gracefully'
);

assert(
  formatPasskeyError(new Error('No credentials available for authentication.')).includes('not found') ||
  formatPasskeyError(new Error('No credentials available for authentication.')).includes('registered'),
  'formatPasskeyError formats missing credential clearly'
);

// --- 2. Mobile Detection Logic ---
console.log('\n--- 2. Testing Mobile Device Detection Logic ---');

// Mock window dimensions safely in Node.js environment
if (typeof (global as any).window === 'undefined') {
  (global as any).window = { innerWidth: 1024, matchMedia: () => ({ matches: false }) };
}
if (typeof (global as any).navigator === 'undefined') {
  (global as any).navigator = { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' };
}

// Desktop (e.g. 1280px wide)
(global as any).window.innerWidth = 1280;
assert(!checkIsMobileDevice(), 'checkIsMobileDevice() returns false for desktop width (1280px)');

// Tablet / iPad (e.g. 820px wide or iPad UA)
(global as any).window.innerWidth = 820;
assert(!checkIsMobileDevice(), 'checkIsMobileDevice() returns false for iPad/tablet width (820px)');

// Handset phone (e.g. 390px iPhone or Android phone)
(global as any).window.innerWidth = 390;
assert(checkIsMobileDevice(), 'checkIsMobileDevice() returns true for phone handset (390px)');

// --- 3. Phone & Passkey Prompt Gating ---
console.log('\n--- 3. Testing Phone & Passkey Presence Logic ---');

const userWithoutPhone = {
  id: 'usr_test_1',
  phone: undefined,
  user_metadata: {},
} as any;

const profileWithoutPhone = {
  id: 'usr_test_1',
  phone_number: '',
} as any;

const userWithPhone = {
  id: 'usr_test_2',
  phone: '+923001234567',
  user_metadata: { phone: '+923001234567' },
} as any;

const profileWithPhone = {
  id: 'usr_test_2',
  phone_number: '+923001234567',
} as any;

assert(
  !checkUserHasPhone(profileWithoutPhone, userWithoutPhone),
  'checkUserHasPhone returns false when user has no phone'
);

assert(
  checkUserHasPhone(profileWithPhone, userWithoutPhone),
  'checkUserHasPhone returns true when profile has phone'
);

assert(
  checkUserHasPhone(profileWithoutPhone, userWithPhone),
  'checkUserHasPhone returns true when user metadata has phone'
);

// --- 4. Passkey State Contract ---
console.log('\n--- 4. Testing Passkey State Representation ---');

const mockPasskey: PasskeyCredentialInfo = {
  id: 'cred_abc123',
  deviceName: 'iPhone 15 Pro',
  createdAt: new Date().toISOString(),
  lastUsedAt: new Date().toISOString(),
};

const emptyPasskeys: PasskeyCredentialInfo[] = [];
const activePasskeys: PasskeyCredentialInfo[] = [mockPasskey];

const hasPasskeyFromList = (list: PasskeyCredentialInfo[]) => list.length > 0;

assert(!hasPasskeyFromList(emptyPasskeys), 'Empty passkey list translates to hasPasskey: false');
assert(hasPasskeyFromList(activePasskeys), 'Non-empty passkey list translates to hasPasskey: true');

console.log('==================================================');
if (failures === 0) {
  console.log('🎉 ALL PASSKEY UX & STATE TESTS PASSED!');
  console.log('==================================================');
  process.exit(0);
} else {
  console.error(`💥 ${failures} test(s) failed.`);
  console.log('==================================================');
  process.exit(1);
}
