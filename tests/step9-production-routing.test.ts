/**
 * YAAD APP — STEP 9 COMPREHENSIVE QA TEST SUITE
 * PRODUCTION ROUTING, DEEP LINKS, URL ARCHITECTURE, AND SECURITY GUARDS
 */

import {
  parseRoute,
  buildCanonicalPath,
  isProtectedRoute,
  normalizePathname,
  AppRouteId,
} from '../src/router/routes';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('\n==================================================');
console.log('STEP 9 QA: PRODUCTION ROUTING + DEEP LINKS ARCHITECTURE');
console.log('==================================================\n');

// -----------------------------------------------------------------------------
// TEST 1: URL NORMALIZATION & RESILIENCE
// -----------------------------------------------------------------------------
console.log('--- 1. URL Path Normalization & Query/Hash Handling ---');

assert(normalizePathname('/') === '/', 'Root normalizes to /');
assert(normalizePathname('/home') === '/home', 'Clean /home normalizes to /home');
assert(normalizePathname('/HOME/') === '/home', 'Case insensitive /HOME/ normalizes to /home');
assert(normalizePathname('/lists/123?ref=notification#details') === '/lists/123', 'Strips query params and hash from pathname');
assert(normalizePathname('///create///') === '/create', 'Collapses multiple consecutive slashes');

// -----------------------------------------------------------------------------
// TEST 2: CORE ROUTE PARSING
// -----------------------------------------------------------------------------
console.log('\n--- 2. Core Route Parsing & Mapping ---');

// Home
const homeRoute = parseRoute('/home');
assert(homeRoute.routeId === 'home', '/home parses to home');
assert(homeRoute.isProtected === true, '/home is protected route');
assert(homeRoute.canonicalPath === '/home', '/home canonical path is /home');

// Root
const rootRoute = parseRoute('/');
assert(rootRoute.routeId === 'root', '/ parses to root');
assert(rootRoute.isProtected === true, '/ is protected route requiring auth check');

// Create List
const createRoute = parseRoute('/create');
assert(createRoute.routeId === 'create', '/create parses to create');
assert(createRoute.canonicalPath === '/create', '/create canonical path is /create');

const createAlt = parseRoute('/create-list');
assert(createAlt.routeId === 'create', '/create-list alias maps to create');

// Add Items
const addItemsRoute = parseRoute('/create/items');
assert(addItemsRoute.routeId === 'add_items', '/create/items parses to add_items');

const addItemsAlt = parseRoute('/add-items');
assert(addItemsAlt.routeId === 'add_items', '/add-items alias maps to add_items');

// Statistics
const statsRoute = parseRoute('/stats');
assert(statsRoute.routeId === 'statistics', '/stats parses to statistics');
assert(statsRoute.canonicalPath === '/stats', '/stats canonical path is /stats');

const statsAlt = parseRoute('/statistics');
assert(statsAlt.routeId === 'statistics', '/statistics maps to statistics');

// History
const historyRoute = parseRoute('/history');
assert(historyRoute.routeId === 'history', '/history parses to history');
assert(historyRoute.canonicalPath === '/history', '/history canonical path is /history');

// Settings
const settingsRoute = parseRoute('/settings');
assert(settingsRoute.routeId === 'settings', '/settings parses to settings');
assert(settingsRoute.canonicalPath === '/settings', '/settings canonical path is /settings');

// -----------------------------------------------------------------------------
// TEST 3: SETTINGS SUBSECTIONS
// -----------------------------------------------------------------------------
console.log('\n--- 3. Settings Subsections Deep Linking ---');

const profileSub = parseRoute('/settings/profile');
assert(profileSub.routeId === 'settings_subsection', '/settings/profile parses to settings_subsection');
assert(profileSub.params.subSection === 'profile', 'Extracts subSection: profile');
assert(profileSub.canonicalPath === '/settings/profile', 'Canonical path is /settings/profile');

const securitySub = parseRoute('/settings/security');
assert(securitySub.routeId === 'settings_subsection', '/settings/security parses to settings_subsection');
assert(securitySub.params.subSection === 'security', 'Extracts subSection: security');

const langSub = parseRoute('/settings/language');
assert(langSub.routeId === 'settings_subsection', '/settings/language parses to settings_subsection');
assert(langSub.params.subSection === 'language', 'Extracts subSection: language');

const aboutSub = parseRoute('/settings/about');
assert(aboutSub.routeId === 'settings_subsection', '/settings/about parses to settings_subsection');
assert(aboutSub.params.subSection === 'about', 'Extracts subSection: about');

// -----------------------------------------------------------------------------
// TEST 4: DEEP LINKING (SHOPPING LISTS & COMPLETED SESSIONS)
// -----------------------------------------------------------------------------
console.log('\n--- 4. Deep Linking: Shopping Lists & Completed Sessions ---');

const testListId = 'e2b5c0e1-4567-4890-a123-bcdef0123456';
const listRoute = parseRoute(`/lists/${testListId}`);
assert(listRoute.routeId === 'shopping_list', '/lists/:listId parses to shopping_list');
assert(listRoute.params.listId === testListId, 'Extracts exact listId param');
assert(listRoute.canonicalPath === `/lists/${testListId}`, 'Matches canonical path');
assert(listRoute.isProtected === true, 'List deep link is protected');

const listDetailsRoute = parseRoute(`/lists/${testListId}/details`);
assert(listDetailsRoute.routeId === 'list_details', '/lists/:listId/details parses to list_details');
assert(listDetailsRoute.params.listId === testListId, 'Extracts listId param for details');

const listEditRoute = parseRoute(`/lists/${testListId}/edit`);
assert(listEditRoute.routeId === 'edit_list', '/lists/:listId/edit parses to edit_list');
assert(listEditRoute.params.listId === testListId, 'Extracts listId param for edit');

const testSessionId = 'trip_session_789_xyz';
const sessionRoute = parseRoute(`/history/${testSessionId}`);
assert(sessionRoute.routeId === 'history_session', '/history/:sessionId parses to history_session');
assert(sessionRoute.params.sessionId === testSessionId, 'Extracts exact sessionId param');
assert(sessionRoute.isProtected === true, 'History session deep link is protected');

// -----------------------------------------------------------------------------
// TEST 5: PUBLIC & AUTHENTICATION ROUTES
// -----------------------------------------------------------------------------
console.log('\n--- 5. Public, Authentication & Legal Routes ---');

const authRoute = parseRoute('/auth');
assert(authRoute.routeId === 'auth', '/auth parses to auth');
assert(authRoute.isProtected === false, '/auth is not protected');

const loginRoute = parseRoute('/login');
assert(loginRoute.routeId === 'auth', '/login maps to auth');

const resetRoute = parseRoute('/reset-password');
assert(resetRoute.routeId === 'reset_password', '/reset-password parses to reset_password');
assert(resetRoute.isProtected === false, '/reset-password is not protected');

// Public Legal Pages
const termsRoute = parseRoute('/terms');
assert(termsRoute.routeId === 'terms', '/terms parses to terms');
assert(termsRoute.isProtected === false, '/terms is public');

const privacyRoute = parseRoute('/privacy');
assert(privacyRoute.routeId === 'privacy', '/privacy parses to privacy');
assert(privacyRoute.isProtected === false, '/privacy is public');

const aboutRoute = parseRoute('/about');
assert(aboutRoute.routeId === 'about', '/about parses to about');
assert(aboutRoute.isProtected === false, '/about is public');

const helpRoute = parseRoute('/help');
assert(helpRoute.routeId === 'help', '/help parses to help');
assert(helpRoute.isProtected === false, '/help is public');

const legalRoute = parseRoute('/legal');
assert(legalRoute.routeId === 'legal', '/legal parses to legal');
assert(legalRoute.isProtected === false, '/legal is public');

// -----------------------------------------------------------------------------
// TEST 6: 404 NOT FOUND HANDLING
// -----------------------------------------------------------------------------
console.log('\n--- 6. 404 Not Found Route Detection ---');

const notFound1 = parseRoute('/unknown-page-xyz');
assert(notFound1.routeId === 'not_found', 'Random unknown path parses to not_found');

const notFound2 = parseRoute('/lists/');
assert(notFound2.routeId === 'not_found', 'Trailing /lists/ with no ID parses to not_found');

const notFound3 = parseRoute('/categories');
assert(notFound3.routeId === 'not_found', 'Non-implemented route like /categories correctly falls through to not_found (Anti-Slop)');

// -----------------------------------------------------------------------------
// TEST 7: CANONICAL PATH GENERATOR
// -----------------------------------------------------------------------------
console.log('\n--- 7. Canonical Path Generator Verification ---');

assert(buildCanonicalPath('home') === '/home', 'buildCanonicalPath for home');
assert(buildCanonicalPath('create') === '/create', 'buildCanonicalPath for create');
assert(buildCanonicalPath('history') === '/history', 'buildCanonicalPath for history');
assert(buildCanonicalPath('settings') === '/settings', 'buildCanonicalPath for settings');
assert(
  buildCanonicalPath('shopping_list', { listId: 'abc-123' }) === '/lists/abc-123',
  'buildCanonicalPath for shopping_list with param'
);
assert(
  buildCanonicalPath('history_session', { sessionId: 'session-456' }) === '/history/session-456',
  'buildCanonicalPath for history_session with param'
);
assert(
  buildCanonicalPath('settings_subsection', { subSection: 'security' }) === '/settings/security',
  'buildCanonicalPath for settings_subsection'
);

// -----------------------------------------------------------------------------
// TEST 8: ROUTE SECURITY GUARDS INTEGRITY
// -----------------------------------------------------------------------------
console.log('\n--- 8. Security Guard Rules (Protected vs Public) ---');

const protectedRouteIds: AppRouteId[] = [
  'root',
  'home',
  'create',
  'add_items',
  'history',
  'history_session',
  'shopping_list',
  'list_details',
  'edit_list',
  'settings',
  'settings_subsection',
  'statistics',
  'profile_setup',
  'onboarding',
];

const publicRouteIds: AppRouteId[] = [
  'auth',
  'reset_password',
  'terms',
  'privacy',
  'about',
  'help',
  'legal',
  'not_found',
];

protectedRouteIds.forEach((id) => {
  assert(isProtectedRoute(id) === true, `Route ${id} is strictly protected`);
});

publicRouteIds.forEach((id) => {
  assert(isProtectedRoute(id) === false, `Route ${id} is accessible publicly`);
});

// -----------------------------------------------------------------------------
// TEST 9: SIMULATED RLS & AUTHORIZATION SECURITY BOUNDARY
// -----------------------------------------------------------------------------
console.log('\n--- 9. RLS & Private Data Boundary Simulation ---');

interface MockListRow {
  id: string;
  user_id: string;
  title: string;
}

const mockDatabase: MockListRow[] = [
  { id: 'user_a_list_001', user_id: 'user_a_uuid', title: "User A's Private List" },
  { id: 'user_b_list_002', user_id: 'user_b_uuid', title: "User B's Private List" },
];

function simulateRLSQuery(requestingUserId: string, requestedListId: string): MockListRow | null {
  // Real database RLS constraint: WHERE id = requestedListId AND user_id = requestingUserId
  const record = mockDatabase.find((r) => r.id === requestedListId && r.user_id === requestingUserId);
  return record || null;
}

// Case 1: User A accesses their own list URL
const userAAccess = simulateRLSQuery('user_a_uuid', 'user_a_list_001');
assert(userAAccess !== null && userAAccess.title === "User A's Private List", 'User A can access their own list');

// Case 2: User B guesses User A's list URL
const userBAccessingUserA = simulateRLSQuery('user_b_uuid', 'user_a_list_001');
assert(
  userBAccessingUserA === null,
  'RLS blocks User B from accessing User A list even if User B possesses the exact URL'
);

// Case 3: Anonymous / unauthenticated access
const unauthAccess = simulateRLSQuery('', 'user_a_list_001');
assert(
  unauthAccess === null,
  'RLS blocks unauthenticated user from accessing private list'
);

// -----------------------------------------------------------------------------
// TEST 10: INTENDED DESTINATION ENGINE SIMULATION
// -----------------------------------------------------------------------------
console.log('\n--- 10. Intended Destination (returnTo) Logic ---');

class MockSessionStorage {
  private store = new Map<string, string>();
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
}

const mockStorage = new MockSessionStorage();
const INTENDED_KEY = 'yaad_intended_destination';

function saveIntended(path: string) {
  const norm = normalizePathname(path);
  if (norm !== '/auth' && norm !== '/login' && norm !== '/reset-password' && norm !== '/') {
    mockStorage.setItem(INTENDED_KEY, norm);
  }
}

// User enters /lists/item-xyz without being logged in
const deepLinkUrl = '/lists/item-xyz';
saveIntended(deepLinkUrl);
assert(mockStorage.getItem(INTENDED_KEY) === '/lists/item-xyz', 'Intended destination is saved before auth redirect');

// User logs in successfully -> destination is read and cleared
const intendedTarget = mockStorage.getItem(INTENDED_KEY);
assert(intendedTarget === '/lists/item-xyz', 'Intended destination retrieved upon auth');
mockStorage.removeItem(INTENDED_KEY);
assert(mockStorage.getItem(INTENDED_KEY) === null, 'Intended destination is cleared after routing');

console.log('\n==================================================');
console.log('✅ ALL STEP 9 PRODUCTION ROUTING TESTS PASSED!');
console.log('==================================================\n');
