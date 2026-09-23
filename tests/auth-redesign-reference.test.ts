import fs from 'fs';
import path from 'path';

console.log('==================================================');
console.log('🧪 RUNNING YAAD AUTH REDESIGN REFERENCE TESTS');
console.log('==================================================');

const authViewPath = path.join(process.cwd(), 'src/components/AuthView.tsx');
const authViewContent = fs.readFileSync(authViewPath, 'utf8');

let allPassed = true;

function testAssertion(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`✅ PASSED: ${testName}`);
  } else {
    console.error(`❌ FAILED: ${testName}${detail ? ` -> ${detail}` : ''}`);
    allPassed = false;
  }
}

// 1. Apple Sign In is completely removed
console.log('\n--- 1. Social Provider Compliance (Google Only, No Apple) ---');
testAssertion(
  !authViewContent.includes('Continue with Apple'),
  'No "Continue with Apple" text anywhere in AuthView'
);
testAssertion(
  !authViewContent.toLowerCase().includes('apple'),
  'No Apple provider, icon, or mentions in AuthView'
);
testAssertion(
  authViewContent.includes('Continue with Google'),
  'Contains "Continue with Google"'
);
testAssertion(
  authViewContent.includes('GoogleOfficialIcon'),
  'Uses official Google icon'
);

// 2. Sign In Screen Structure
console.log('\n--- 2. Sign In Screen Hierarchy & Copy ---');
testAssertion(
  authViewContent.includes('Welcome Back'),
  'Sign in heading is "Welcome Back"'
);
testAssertion(
  authViewContent.includes('Stay connected by signing in with your email and password to access your account.'),
  'Supporting text matches reference exactly'
);
testAssertion(
  authViewContent.includes('Forgot Password?'),
  'Contains "Forgot Password?"'
);
testAssertion(
  authViewContent.includes("Don't have an account?"),
  'Contains "Don\'t have an account?" prompt'
);
testAssertion(
  authViewContent.includes('Sign Up'),
  'Contains interactive "Sign Up" switch'
);

// 3. Create Account (Sign Up) Screen
console.log('\n--- 3. Sign Up Screen Hierarchy & Fields ---');
testAssertion(
  authViewContent.includes('Create your account'),
  'Sign up heading is "Create your account"'
);
testAssertion(
  authViewContent.includes('Provide your full name, email, and password to create your account and get started.'),
  'Supporting text matches reference exactly'
);
testAssertion(
  authViewContent.includes('Full Name') && authViewContent.includes('signup_name'),
  'Contains Full Name field'
);
testAssertion(
  authViewContent.includes('Phone Number') && authViewContent.includes('signup_phone'),
  'Contains Phone Number field (YAAD requirement)'
);
testAssertion(
  authViewContent.includes('Email Address') && authViewContent.includes('signup_email'),
  'Contains Email Address field'
);
testAssertion(
  authViewContent.includes('Password') && authViewContent.includes('signup_password'),
  'Contains Password field'
);
testAssertion(
  authViewContent.includes('Confirm Password') && authViewContent.includes('signup_confirm_password'),
  'Contains Confirm Password field'
);
testAssertion(
  authViewContent.includes('Terms') && authViewContent.includes('Privacy Policy'),
  'Contains Terms & Privacy Policy clickable agreement'
);
testAssertion(
  authViewContent.includes('Already have an account?'),
  'Contains "Already have an account?" prompt'
);

// 4. Success Screen Implementation
console.log('\n--- 4. Success Screen Visual Hierarchy & Action ---');
testAssertion(
  authViewContent.includes('Successful!'),
  'Heading contains "Successful!"'
);
testAssertion(
  authViewContent.includes('Your account is created successfully and ready now.'),
  'Sign up success message matches reference specification'
);
testAssertion(
  authViewContent.includes('You have signed in successfully. Welcome back to YAAD.'),
  'Sign in success message matches reference specification'
);
testAssertion(
  authViewContent.includes('Browse Home'),
  'Contains primary action CTA "Browse Home"'
);
testAssertion(
  authViewContent.includes('particles') && authViewContent.includes('checkmarkDrawn'),
  'Includes checkmark draw animation and celebratory confetti particles'
);

// 5. Friendly Error Handling (No raw leaks)
console.log('\n--- 5. Friendly Error Handling ---');
testAssertion(
  authViewContent.includes('Incorrect email or password. Please try again.'),
  'Friendly credential error'
);
testAssertion(
  authViewContent.includes("That email isn't registered yet. Create an account to continue."),
  'Friendly unregistered email error'
);
testAssertion(
  authViewContent.includes('This email is already registered. Please sign in instead.'),
  'Friendly duplicate registration error'
);
testAssertion(
  authViewContent.includes('Google sign-in was cancelled.'),
  'Friendly Google cancellation error'
);
testAssertion(
  authViewContent.includes("You're offline. Connect to the internet and try again."),
  'Friendly offline error'
);

// 6. Responsive and Clean Structure
console.log('\n--- 6. Responsive Layout & Clean Card ---');
testAssertion(
  authViewContent.includes('max-w-[440px]'),
  'Constrained responsive card width for mobile/tablet/desktop'
);
testAssertion(
  authViewContent.includes('ArrowLeft'),
  'Clean back button using ArrowLeft'
);

console.log('==================================================');
if (allPassed) {
  console.log('🎉 ALL YAAD AUTH REDESIGN REFERENCE TESTS PASSED!');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED');
  process.exit(1);
}
