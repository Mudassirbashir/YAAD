/**
 * YAAD GOOGLE OAUTH PRODUCTION DOMAIN VERIFICATION TEST SUITE
 * Verifies that:
 * 1. The canonical production domain is https://yaadapppk.vercel.app
 * 2. Google OAuth redirectTo strictly targets https://yaadapppk.vercel.app/home in production
 * 3. Deployment-specific Vercel URLs (yaadapppk-mudassirbashir530-creators-projects.vercel.app)
 *    and legacy URLs (yaad-three.vercel.app) NEVER override the production redirect
 * 4. Preview branch deployments (-git-) and localhost environments are correctly supported
 * 5. Sensitive OAuth parameters are cleaned after callback
 * 6. User-facing auth error messages are human-friendly and free of raw Supabase/OAuth leaks
 */

import {
  PRODUCTION_APP_URL,
  LEGACY_OR_DEPLOYMENT_HOSTS,
  SITE_CONFIG,
  getBaseSiteUrl,
  getAuthRedirectUrl,
  isLocalOrDevHost,
  isPreviewDeploymentHost,
} from '../src/config/siteConfig';
import { formatAuthErrorMessage, cleanAuthUrlParams } from '../src/lib/supabase';
import { PRODUCTION_PASSKEY_RP_ID } from '../src/lib/passkey';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('\n==================================================');
console.log('GOOGLE OAUTH PRODUCTION DOMAIN & REDIRECT QA SUITE');
console.log('==================================================\n');

// -----------------------------------------------------------------------------
// 1. PRODUCTION URL SOURCE OF TRUTH
// -----------------------------------------------------------------------------
console.log('--- 1. Production URL Source of Truth ---');
assert(PRODUCTION_APP_URL === 'https://yaadapppk.vercel.app', 'PRODUCTION_APP_URL is https://yaadapppk.vercel.app');
assert(SITE_CONFIG.defaultProductionUrl === 'https://yaadapppk.vercel.app', 'SITE_CONFIG.defaultProductionUrl is https://yaadapppk.vercel.app');
assert(getBaseSiteUrl() === 'https://yaadapppk.vercel.app', 'getBaseSiteUrl() resolves to https://yaadapppk.vercel.app');
assert(PRODUCTION_PASSKEY_RP_ID === 'yaadapppk.vercel.app', 'Passkey RP ID is configured to yaadapppk.vercel.app');

// -----------------------------------------------------------------------------
// 2. PRODUCTION OAUTH REDIRECT RESOLUTION
// -----------------------------------------------------------------------------
console.log('\n--- 2. Production OAuth Redirect Resolution ---');

// Default SSR / Headless invocation
const defaultRedirect = getAuthRedirectUrl('/home');
assert(
  defaultRedirect === 'https://yaadapppk.vercel.app/home',
  `getAuthRedirectUrl('/home') returns ${defaultRedirect} (expected: https://yaadapppk.vercel.app/home)`
);

// Password reset redirect
const resetRedirect = getAuthRedirectUrl('/reset-password');
assert(
  resetRedirect === 'https://yaadapppk.vercel.app/reset-password',
  `getAuthRedirectUrl('/reset-password') returns ${resetRedirect}`
);

// -----------------------------------------------------------------------------
// 3. SIMULATE BROWSER HOST CONTEXTS & ENVIRONMENT DRIFT PREVENTION
// -----------------------------------------------------------------------------
console.log('\n--- 3. Browser Host Isolation & Drift Prevention ---');

// Simulate Global Window Object
const originalWindow = (globalThis as any).window;

try {
  // A. Primary Production Domain (yaadapppk.vercel.app)
  (globalThis as any).window = {
    location: {
      origin: 'https://yaadapppk.vercel.app',
      hostname: 'yaadapppk.vercel.app',
      pathname: '/auth',
      search: '',
      hash: '',
    },
  };
  assert(
    getAuthRedirectUrl('/home') === 'https://yaadapppk.vercel.app/home',
    'When browsing on yaadapppk.vercel.app, redirect targets https://yaadapppk.vercel.app/home'
  );

  // B. Deployment-Specific URL (yaadapppk-mudassirbashir530-creators-projects.vercel.app)
  // MUST NEVER return the deployment URL!
  (globalThis as any).window = {
    location: {
      origin: 'https://yaadapppk-mudassirbashir530-creators-projects.vercel.app',
      hostname: 'yaadapppk-mudassirbashir530-creators-projects.vercel.app',
      pathname: '/auth',
      search: '',
      hash: '',
    },
  };
  const redirectFromDeployment = getAuthRedirectUrl('/home');
  assert(
    redirectFromDeployment === 'https://yaadapppk.vercel.app/home',
    `When on deployment URL, redirect strictly targets ${redirectFromDeployment} (NOT deployment URL)`
  );
  assert(
    !redirectFromDeployment.includes('mudassirbashir530'),
    'Redirect URL contains no deployment or creator specific slug'
  );

  // C. Legacy Production URL (yaad-three.vercel.app)
  (globalThis as any).window = {
    location: {
      origin: 'https://yaad-three.vercel.app',
      hostname: 'yaad-three.vercel.app',
      pathname: '/auth',
      search: '',
      hash: '',
    },
  };
  assert(
    getAuthRedirectUrl('/home') === 'https://yaadapppk.vercel.app/home',
    'When on legacy yaad-three.vercel.app, redirect strictly targets https://yaadapppk.vercel.app/home'
  );

  // D. Local Development (localhost:3000)
  (globalThis as any).window = {
    location: {
      origin: 'http://localhost:3000',
      hostname: 'localhost',
      pathname: '/auth',
      search: '',
      hash: '',
    },
  };
  assert(
    getAuthRedirectUrl('/home') === 'http://localhost:3000/home',
    'Localhost environment retains local developer redirect origin (http://localhost:3000/home)'
  );

  // E. Dedicated Vercel Git Branch Preview (e.g. yaadapppk-git-feature-new-auth.vercel.app)
  (globalThis as any).window = {
    location: {
      origin: 'https://yaadapppk-git-feature-new-auth.vercel.app',
      hostname: 'yaadapppk-git-feature-new-auth.vercel.app',
      pathname: '/auth',
      search: '',
      hash: '',
    },
  };
  assert(
    getAuthRedirectUrl('/home') === 'https://yaadapppk-git-feature-new-auth.vercel.app/home',
    'Vercel git branch preview retains preview deployment redirect origin'
  );

  // F. Environment variable contamination check:
  // Even if VITE_SITE_URL was set to the deployment URL by mistake, getBaseSiteUrl ignores it
  process.env.VITE_SITE_URL = 'https://yaadapppk-mudassirbashir530-creators-projects.vercel.app';
  assert(
    getBaseSiteUrl() === 'https://yaadapppk.vercel.app',
    'getBaseSiteUrl() ignores accidental deployment URL in VITE_SITE_URL'
  );
  delete process.env.VITE_SITE_URL;

} finally {
  (globalThis as any).window = originalWindow;
}

// -----------------------------------------------------------------------------
// 4. URL CLEANUP AFTER OAUTH
// -----------------------------------------------------------------------------
console.log('\n--- 4. URL Token Cleanup ---');

let replacedState = { url: '', title: '' };
(globalThis as any).window = {
  location: {
    href: 'https://yaadapppk.vercel.app/home#access_token=secret123&refresh_token=ref456&type=bearer',
    pathname: '/home',
    search: '',
    hash: '#access_token=secret123&refresh_token=ref456&type=bearer',
  },
  history: {
    replaceState: (_data: any, title: string, url: string) => {
      replacedState = { url, title };
    },
  },
  document: { title: 'YAAD • Smart Shopping Memory' },
};

cleanAuthUrlParams();
assert(
  replacedState.url === '/home',
  `cleanAuthUrlParams safely scrubs sensitive OAuth access tokens (URL now: ${replacedState.url})`
);

// -----------------------------------------------------------------------------
// 5. HUMAN-FRIENDLY ERROR MESSAGES
// -----------------------------------------------------------------------------
console.log('\n--- 5. Human-Friendly OAuth Error Formatting ---');

const cancellationMsg = formatAuthErrorMessage(new Error('User cancelled access_denied'));
assert(
  cancellationMsg.includes('cancelled'),
  `Cancellation message is human-friendly: "${cancellationMsg}"`
);

const genericMsg = formatAuthErrorMessage(new Error('PGRST301 Database syntax error'));
assert(
  genericMsg === 'Something went wrong while signing you in. Please try again.',
  `Raw DB error formatted to safe message: "${genericMsg}"`
);
assert(!genericMsg.includes('PGRST') && !genericMsg.includes('Database'), 'No technical leaks in user message');

console.log('\n==================================================');
console.log('✅ ALL GOOGLE OAUTH PRODUCTION DOMAIN TESTS PASSED!');
console.log('==================================================\n');
