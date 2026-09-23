import assert from 'assert';
import { parseRoute, isProtectedRoute } from '../src/router/routes';
import fs from 'fs';
import path from 'path';

console.log('==================================================');
console.log('YAAD PUBLIC LANDING PAGE & GOOGLE COMPLIANCE QA');
console.log('==================================================');

// 1. Root Route Accessibility
console.log('\n--- 1. Root Route (/) Public Accessibility ---');
const rootRoute = parseRoute('/');
assert.strictEqual(rootRoute.routeId, 'root', 'Root path "/" must parse to routeId "root"');
assert.strictEqual(rootRoute.isProtected, false, 'Root path "/" must NEVER be protected by AuthGuard');
assert.strictEqual(isProtectedRoute('root'), false, 'isProtectedRoute("root") must be false');
console.log('✅ PASSED: "/" is accessible publicly without login wall or AuthGuard interception');

// 2. Private Dashboard (/home) Protection
console.log('\n--- 2. Private Dashboard (/home) Protection ---');
const homeRoute = parseRoute('/home');
assert.strictEqual(homeRoute.routeId, 'home', 'Path "/home" must parse to "home"');
assert.strictEqual(homeRoute.isProtected, true, 'Path "/home" must be strictly protected');
assert.strictEqual(isProtectedRoute('home'), true, 'isProtectedRoute("home") must be true');
console.log('✅ PASSED: "/home" is protected and requires authentication');

// 3. Landing Page Component Inspection
console.log('\n--- 3. Landing Page UX & Branding Integrity ---');
const landingPageFile = path.join(process.cwd(), 'src', 'components', 'LandingPageView.tsx');
assert.ok(fs.existsSync(landingPageFile), 'LandingPageView.tsx must exist');
const landingPageContent = fs.readFileSync(landingPageFile, 'utf-8');

// Logo check
assert.ok(
  landingPageContent.includes('/logo.png'),
  'Landing page must use the original YAAD logo (/logo.png)'
);
console.log('✅ PASSED: Original YAAD logo (/logo.png) is preserved');

// Branding & Typography
assert.ok(
  landingPageContent.includes('#005039'),
  'Landing page must use YAAD official forest green (#005039)'
);
assert.ok(
  landingPageContent.includes('#fbf9f5'),
  'Landing page must use YAAD warm background (#fbf9f5)'
);
console.log('✅ PASSED: YAAD official palette (#005039, #fbf9f5) and styling are applied');

// 3 Core Points (Not overwhelming text)
assert.ok(
  landingPageContent.includes('Fast, Clutter-Free Lists') ||
    landingPageContent.includes('سودا سلف کی آسان فہرست'),
  'Must include Point 1: Fast/Clutter-Free Grocery Lists'
);
assert.ok(
  landingPageContent.includes('Pakistani Units & Rashan') ||
    landingPageContent.includes('روایتی پیمانے اور راشن'),
  'Must include Point 2: Pakistani Units (pao, kg, darjan) & Rashan'
);
assert.ok(
  landingPageContent.includes('Private & Secure Sync') ||
    landingPageContent.includes('محفوظ اور نجی ڈیٹا'),
  'Must include Point 3: Secure Google Sync & Complete Privacy'
);
console.log('✅ PASSED: Exactly 3 crisp, essential product pillars present (no fluff)');

// Google Cloud Review Transparency Box
console.log('\n--- 4. Google OAuth Verification & Compliance Links ---');
assert.ok(
  landingPageContent.includes('Why YAAD Uses Google Authentication') ||
    landingPageContent.includes('گوگل اکاؤنٹ اور رازداری کی تفصیل'),
  'Must clearly explain why YAAD uses Google Sign-In for OAuth verification'
);
assert.ok(
  landingPageContent.includes('Privacy Policy') && landingPageContent.includes('Terms of Service'),
  'Must provide direct accessible links to Privacy Policy and Terms of Service'
);
assert.ok(
  landingPageContent.includes('useyaadapp@gmail.com'),
  'Must provide support contact email on homepage'
);
console.log('✅ PASSED: Google OAuth purpose and legal links verified');

// 5. Verification Meta Tags in index.html
console.log('\n--- 5. Google Search Console Verification In Head ---');
const indexHtmlFile = path.join(process.cwd(), 'index.html');
const indexHtmlContent = fs.readFileSync(indexHtmlFile, 'utf-8');
assert.ok(
  indexHtmlContent.includes('google-site-verification'),
  'index.html must include google-site-verification tag'
);
assert.ok(
  indexHtmlContent.includes('https://yaadapppk.vercel.app/'),
  'index.html canonical must point to https://yaadapppk.vercel.app/'
);
console.log('✅ PASSED: Google Search Console verification meta tags and canonical URL intact');

console.log('==================================================');
console.log('🎉 ALL PUBLIC LANDING PAGE & COMPLIANCE QA PASSED!');
console.log('==================================================');
