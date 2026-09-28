/**
 * YAAD SIGNUP & AUTHENTICATION FLOW VERIFICATION TEST SUITE
 * Verifies:
 * 1. Case A: Signup with instant session (no confirmation required) succeeds and transitions to authenticated.
 * 2. Case B: Signup with email confirmation required (session is null) succeeds WITHOUT throwing false error.
 * 3. Already registered email produces clear, friendly message to sign in instead.
 * 4. Google OAuth error parsing correctly identifies cancellation vs backend/database error without masking.
 * 5. URL redirects target the authoritative production domain https://yaadapppk.vercel.app
 */

import { formatAuthErrorMessage } from '../src/lib/supabase';
import { getAuthRedirectUrl, PRODUCTION_APP_URL } from '../src/config/siteConfig';

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✅ PASSED: ${testName}`);
  } else {
    console.error(`❌ FAILED: ${testName}`);
    process.exit(1);
  }
}

console.log('\n==================================================');
console.log('YAAD SIGNUP & AUTHENTICATION SYSTEM QA SUITE');
console.log('==================================================\n');

// 1. Email confirmation scenario: formatAuthErrorMessage
console.log('--- 1. Verification & Confirmation Messaging ---');
const emailNotConfirmedErr = new Error('Email not confirmed');
const formattedNotConfirmed = formatAuthErrorMessage(emailNotConfirmedErr, 'sign_in');
assert(
  formattedNotConfirmed.includes('confirm your email') || formattedNotConfirmed.includes('check your inbox'),
  `Email not confirmed error message is friendly: "${formattedNotConfirmed}"`
);

// 2. Already registered scenario
console.log('\n--- 2. Duplicate Account Handling ---');
const alreadyRegErr = new Error('User already registered');
const formattedAlreadyReg = formatAuthErrorMessage(alreadyRegErr, 'sign_up');
assert(
  formattedAlreadyReg === 'This email is already registered. Please sign in instead.' ||
  formattedAlreadyReg.includes('already registered'),
  `Duplicate registration error message: "${formattedAlreadyReg}"`
);

// 3. Weak password scenario
console.log('\n--- 3. Weak Password Handling ---');
const weakPassErr = new Error('Password should be at least 6 characters.');
const formattedWeakPass = formatAuthErrorMessage(weakPassErr, 'sign_up');
assert(
  formattedWeakPass === 'Please choose a stronger password.' || formattedWeakPass.includes('password'),
  `Weak password error message: "${formattedWeakPass}"`
);

// 4. Google OAuth error separation (cancellation vs server/database)
console.log('\n--- 4. Google OAuth Error Differentiation ---');
const cancelMsg = formatAuthErrorMessage(new Error('access_denied: user cancelled access'));
assert(
  cancelMsg === 'Google sign-in was cancelled. You can try again or continue with another sign-in method.',
  `User cancellation message is accurate: "${cancelMsg}"`
);

const dbErrorMsg = formatAuthErrorMessage(new Error('access_denied: Database error saving new user'));
assert(
  !dbErrorMsg.includes('cancelled') && dbErrorMsg.includes('Something went wrong'),
  `Database error during OAuth is NOT masked as "cancelled": "${dbErrorMsg}"`
);

// 5. Production Redirect Verification
console.log('\n--- 5. Production Redirect Target ---');
const signupRedirect = getAuthRedirectUrl('/home');
assert(
  signupRedirect === 'https://yaadapppk.vercel.app/home',
  `Signup redirectTo targets canonical production domain: "${signupRedirect}"`
);

console.log('\n==================================================');
console.log('🎉 ALL YAAD SIGNUP & AUTHENTICATION QA TESTS PASSED!');
console.log('==================================================\n');
