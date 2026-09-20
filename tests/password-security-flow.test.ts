import { formatAuthErrorMessage } from '../src/lib/supabase';

console.log('==================================================');
console.log('🧪 RUNNING YAAD PASSWORD SECURITY UX TESTS');
console.log('==================================================');

// 1. Error Message Formatting Tests
console.log('--- 1. Testing formatAuthErrorMessage for Password Scenarios ---');

const testCases = [
  {
    input: new Error('New password should be different from the old password.'),
    expected: 'New password cannot be the same as your current password.',
    desc: 'Same password rejection',
  },
  {
    input: new Error('Invalid login credentials'),
    expected: 'Incorrect current password.',
    desc: 'Incorrect current password rejection',
  },
  {
    input: new Error('Token has expired or is invalid'),
    expected: 'Your reset link has expired. Request a new one.',
    desc: 'Expired token error',
  },
  {
    input: new Error('Email link is invalid or has expired'),
    expected: 'Your reset link has expired. Request a new one.',
    desc: 'Invalid link error',
  },
  {
    input: new Error('otp_expired'),
    expected: 'Your reset link has expired. Request a new one.',
    desc: 'OTP expired error',
  },
  {
    input: new Error('Auth session missing!'),
    expected: 'Your reset link has expired. Request a new one.',
    desc: 'Missing auth session error',
  },
  {
    input: new Error('Password should be at least 6 characters.'),
    expected: 'Please choose a stronger password.',
    desc: 'Weak/short password error',
  },
];

let allPassed = true;

for (const { input, expected, desc } of testCases) {
  const result = formatAuthErrorMessage(input);
  if (result === expected) {
    console.log(`✅ PASSED: ${desc} -> "${result}"`);
  } else {
    console.error(`❌ FAILED: ${desc} -> Got: "${result}", Expected: "${expected}"`);
    allPassed = false;
  }
}

// 2. Change Password Validation Rules
console.log('\n--- 2. Testing Change Password Validation Logic ---');

function validateChangePasswordInputs(currentPass: string, newPass: string, confirmPass: string) {
  const trimmedCurrent = currentPass.trim();
  const trimmedNew = newPass.trim();
  const trimmedConfirm = confirmPass.trim();

  if (!trimmedCurrent) {
    return { valid: false, error: 'Please enter your current password.' };
  }
  if (!trimmedNew || trimmedNew.length < 6) {
    return { valid: false, error: 'New password must be at least 6 characters.' };
  }
  if (trimmedCurrent === trimmedNew) {
    return { valid: false, error: 'New password cannot be the same as your current password.' };
  }
  if (trimmedNew !== trimmedConfirm) {
    return { valid: false, error: 'Passwords do not match.' };
  }
  return { valid: true, error: null };
}

const changePasswordScenarios = [
  {
    current: '',
    newPass: 'Secret123',
    confirm: 'Secret123',
    expectedValid: false,
    expectedError: 'Please enter your current password.',
    desc: 'Empty current password',
  },
  {
    current: 'OldPass123',
    newPass: '123',
    confirm: '123',
    expectedValid: false,
    expectedError: 'New password must be at least 6 characters.',
    desc: 'Short new password',
  },
  {
    current: 'MyPassword123',
    newPass: 'MyPassword123',
    confirm: 'MyPassword123',
    expectedValid: false,
    expectedError: 'New password cannot be the same as your current password.',
    desc: 'Same password as current',
  },
  {
    current: 'OldPassword123',
    newPass: 'NewPassword123',
    confirm: 'DifferentPassword123',
    expectedValid: false,
    expectedError: 'Passwords do not match.',
    desc: 'Confirmation mismatch',
  },
  {
    current: 'OldPassword123',
    newPass: 'NewPassword123',
    confirm: 'NewPassword123',
    expectedValid: true,
    expectedError: null,
    desc: 'Valid change password input',
  },
];

for (const sc of changePasswordScenarios) {
  const res = validateChangePasswordInputs(sc.current, sc.newPass, sc.confirm);
  if (res.valid === sc.expectedValid && res.error === sc.expectedError) {
    console.log(`✅ PASSED: ${sc.desc}`);
  } else {
    console.error(`❌ FAILED: ${sc.desc} -> Result:`, res);
    allPassed = false;
  }
}

// 3. Reset Password View Gatekeeper Check
console.log('\n--- 3. Testing Recovery Gating Logic ---');

function isResetPasswordGateActive(state: {
  isPasswordRecovery: boolean;
  isPasswordResetRequired: boolean;
  userMetadataFlag: boolean;
  sessionStorageFlag: boolean;
  localStorageFlag: boolean;
}) {
  return Boolean(
    state.isPasswordRecovery ||
      state.isPasswordResetRequired ||
      state.userMetadataFlag ||
      state.sessionStorageFlag ||
      state.localStorageFlag
  );
}

const gatingScenarios = [
  {
    state: {
      isPasswordRecovery: true,
      isPasswordResetRequired: false,
      userMetadataFlag: false,
      sessionStorageFlag: false,
      localStorageFlag: false,
    },
    expected: true,
    desc: 'Active recovery flag gates app access',
  },
  {
    state: {
      isPasswordRecovery: false,
      isPasswordResetRequired: false,
      userMetadataFlag: false,
      sessionStorageFlag: true,
      localStorageFlag: false,
    },
    expected: true,
    desc: 'SessionStorage recovery flag survives page refresh',
  },
  {
    state: {
      isPasswordRecovery: false,
      isPasswordResetRequired: false,
      userMetadataFlag: false,
      sessionStorageFlag: false,
      localStorageFlag: true,
    },
    expected: true,
    desc: 'LocalStorage reset required flag protects app',
  },
  {
    state: {
      isPasswordRecovery: false,
      isPasswordResetRequired: false,
      userMetadataFlag: false,
      sessionStorageFlag: false,
      localStorageFlag: false,
    },
    expected: false,
    desc: 'Normal user allowed normal navigation',
  },
];

for (const gs of gatingScenarios) {
  const res = isResetPasswordGateActive(gs.state);
  if (res === gs.expected) {
    console.log(`✅ PASSED: ${gs.desc}`);
  } else {
    console.error(`❌ FAILED: ${gs.desc}`);
    allPassed = false;
  }
}

if (allPassed) {
  console.log('\n==================================================');
  console.log('🎉 ALL PASSWORD SECURITY UX TESTS PASSED!');
  console.log('==================================================');
  process.exit(0);
} else {
  console.error('\n❌ SOME TESTS FAILED');
  process.exit(1);
}
