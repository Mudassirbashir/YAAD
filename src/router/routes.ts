/**
 * YAAD URL Architecture & Route Definitions
 * Step 9: Production Routing, Deep Links, and Route Guards
 */

export type AppRouteId =
  | 'root'
  | 'home'
  | 'create'
  | 'add_items'
  | 'history'
  | 'history_session'
  | 'shopping_list'
  | 'list_details'
  | 'edit_list'
  | 'settings'
  | 'settings_subsection'
  | 'statistics'
  | 'auth'
  | 'reset_password'
  | 'profile_setup'
  | 'onboarding'
  | 'terms'
  | 'privacy'
  | 'about'
  | 'help'
  | 'legal'
  | 'blog'
  | 'rashan_list'
  | 'not_found';

export type SettingsSubSection =
  | 'profile'
  | 'appearance'
  | 'security'
  | 'language'
  | 'preferences'
  | 'about';

export interface ParsedRoute {
  routeId: AppRouteId;
  pathname: string;
  params: Record<string, string>;
  isProtected: boolean;
  canonicalPath: string;
}

/**
 * Checks if a given route requires authentication
 */
export function isProtectedRoute(routeId: AppRouteId): boolean {
  switch (routeId) {
    case 'root':
    case 'terms':
    case 'privacy':
    case 'about':
    case 'help':
    case 'legal':
    case 'rashan_list':
    case 'auth':
    case 'reset_password':
    case 'not_found':
      return false;
    case 'home':
    case 'create':
    case 'add_items':
    case 'history':
    case 'history_session':
    case 'shopping_list':
    case 'list_details':
    case 'edit_list':
    case 'settings':
    case 'settings_subsection':
    case 'statistics':
    case 'profile_setup':
    case 'onboarding':
    default:
      return true;
  }
}

/**
 * Cleans and normalizes raw pathname strings
 */
export function normalizePathname(raw: string): string {
  if (!raw) return '/';
  let path = raw.trim();
  // Remove hash fragment if present
  if (path.includes('#')) {
    path = path.split('#')[0];
  }
  // Remove query params if present
  if (path.includes('?')) {
    path = path.split('?')[0];
  }
  // Normalize slashes
  path = path.replace(/\/+/g, '/');
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  return path.toLowerCase();
}

/**
 * Parses any incoming pathname into a structured ParsedRoute object
 */
export function parseRoute(rawPathname: string): ParsedRoute {
  const norm = normalizePathname(rawPathname);

  // 1. Root
  if (norm === '' || norm === '/') {
    return {
      routeId: 'root',
      pathname: '/',
      params: {},
      isProtected: false,
      canonicalPath: '/',
    };
  }

  // 2. Home
  if (norm === '/home') {
    return {
      routeId: 'home',
      pathname: '/home',
      params: {},
      isProtected: true,
      canonicalPath: '/home',
    };
  }

  // 3. Create List
  if (norm === '/create' || norm === '/create-list') {
    return {
      routeId: 'create',
      pathname: '/create',
      params: {},
      isProtected: true,
      canonicalPath: '/create',
    };
  }

  if (norm === '/create/items' || norm === '/add-items') {
    return {
      routeId: 'add_items',
      pathname: '/create/items',
      params: {},
      isProtected: true,
      canonicalPath: '/create/items',
    };
  }

  // 4. Statistics / Stats
  if (norm === '/stats' || norm === '/statistics') {
    return {
      routeId: 'statistics',
      pathname: '/stats',
      params: {},
      isProtected: true,
      canonicalPath: '/stats',
    };
  }

  // 5. History & Completed Sessions
  if (norm === '/history') {
    return {
      routeId: 'history',
      pathname: '/history',
      params: {},
      isProtected: true,
      canonicalPath: '/history',
    };
  }

  const historySessionMatch = norm.match(/^\/history\/([^/]+)$/);
  if (historySessionMatch) {
    const rawSessionId = historySessionMatch[1];
    return {
      routeId: 'history_session',
      pathname: norm,
      params: { sessionId: rawSessionId },
      isProtected: true,
      canonicalPath: `/history/${rawSessionId}`,
    };
  }

  // 6. Shopping Lists (Deep Links & Sub-Actions)
  const listDetailsMatch = norm.match(/^\/lists\/([^/]+)\/details$/);
  if (listDetailsMatch) {
    const listId = listDetailsMatch[1];
    return {
      routeId: 'list_details',
      pathname: norm,
      params: { listId },
      isProtected: true,
      canonicalPath: `/lists/${listId}/details`,
    };
  }

  const listEditMatch = norm.match(/^\/lists\/([^/]+)\/edit$/);
  if (listEditMatch) {
    const listId = listEditMatch[1];
    return {
      routeId: 'edit_list',
      pathname: norm,
      params: { listId },
      isProtected: true,
      canonicalPath: `/lists/${listId}/edit`,
    };
  }

  const listMatch = norm.match(/^\/lists\/([^/]+)$/);
  if (listMatch) {
    const listId = listMatch[1];
    return {
      routeId: 'shopping_list',
      pathname: norm,
      params: { listId },
      isProtected: true,
      canonicalPath: `/lists/${listId}`,
    };
  }

  // 7. Settings & Subsections
  if (norm === '/settings') {
    return {
      routeId: 'settings',
      pathname: '/settings',
      params: {},
      isProtected: true,
      canonicalPath: '/settings',
    };
  }

  const settingsSubMatch = norm.match(/^\/settings\/([^/]+)$/);
  if (settingsSubMatch) {
    const sub = settingsSubMatch[1];
    if (['profile', 'security', 'language', 'preferences', 'about'].includes(sub)) {
      return {
        routeId: 'settings_subsection',
        pathname: norm,
        params: { subSection: sub },
        isProtected: true,
        canonicalPath: `/settings/${sub}`,
      };
    }
  }

  // 8. Authentication & Auth Gates
  if (norm === '/auth' || norm === '/login' || norm === '/signin' || norm === '/signup') {
    return {
      routeId: 'auth',
      pathname: '/auth',
      params: {},
      isProtected: false,
      canonicalPath: '/auth',
    };
  }

  if (norm === '/reset-password' || norm === '/reset_password') {
    return {
      routeId: 'reset_password',
      pathname: '/reset-password',
      params: {},
      isProtected: false,
      canonicalPath: '/reset-password',
    };
  }

  if (norm === '/profile-setup') {
    return {
      routeId: 'profile_setup',
      pathname: '/profile-setup',
      params: {},
      isProtected: true,
      canonicalPath: '/profile-setup',
    };
  }

  if (norm === '/onboarding') {
    return {
      routeId: 'onboarding',
      pathname: '/onboarding',
      params: {},
      isProtected: true,
      canonicalPath: '/onboarding',
    };
  }

  // 9. Dedicated Public Legal & Info Pages
  if (norm === '/terms' || norm === '/terms-and-conditions') {
    return {
      routeId: 'terms',
      pathname: '/terms',
      params: {},
      isProtected: false,
      canonicalPath: '/terms',
    };
  }

  if (norm === '/privacy' || norm === '/privacy-policy') {
    return {
      routeId: 'privacy',
      pathname: '/privacy',
      params: {},
      isProtected: false,
      canonicalPath: '/privacy',
    };
  }

  if (norm === '/about' || norm === '/about-us') {
    return {
      routeId: 'about',
      pathname: '/about',
      params: {},
      isProtected: false,
      canonicalPath: '/about',
    };
  }

  if (norm === '/help' || norm === '/support' || norm === '/contact') {
    return {
      routeId: 'help',
      pathname: '/help',
      params: {},
      isProtected: false,
      canonicalPath: '/help',
    };
  }

  if (norm === '/legal') {
    return {
      routeId: 'legal',
      pathname: '/legal',
      params: {},
      isProtected: false,
      canonicalPath: '/legal',
    };
  }

  if (norm === '/blog' || norm === '/blogs' || norm === '/articles') {
    return {
      routeId: 'blog',
      pathname: '/blog',
      params: {},
      isProtected: false,
      canonicalPath: '/blog',
    };
  }

  // 10. Dedicated Public Editorial & Rashan Guide
  if (norm === '/rashan-list' || norm === '/rashan' || norm === '/rashan-ki-list' || norm === '/monthly-rashan') {
    return {
      routeId: 'rashan_list',
      pathname: '/rashan-list',
      params: {},
      isProtected: false,
      canonicalPath: '/rashan-list',
    };
  }

  // 11. Unmatched / 404
  return {
    routeId: 'not_found',
    pathname: norm,
    params: {},
    isProtected: false,
    canonicalPath: norm,
  };
}

/**
 * Builds canonical path string from routeId and params
 */
export function buildCanonicalPath(
  routeId: AppRouteId,
  params?: Record<string, string>
): string {
  switch (routeId) {
    case 'root':
      return '/';
    case 'home':
      return '/home';
    case 'create':
      return '/create';
    case 'add_items':
      return '/create/items';
    case 'history':
      return '/history';
    case 'history_session':
      return `/history/${params?.sessionId || ''}`;
    case 'shopping_list':
      return `/lists/${params?.listId || ''}`;
    case 'list_details':
      return `/lists/${params?.listId || ''}/details`;
    case 'edit_list':
      return `/lists/${params?.listId || ''}/edit`;
    case 'settings':
      return '/settings';
    case 'settings_subsection':
      return `/settings/${params?.subSection || 'profile'}`;
    case 'statistics':
      return '/stats';
    case 'auth':
      return '/auth';
    case 'reset_password':
      return '/reset-password';
    case 'profile_setup':
      return '/profile-setup';
    case 'onboarding':
      return '/onboarding';
    case 'terms':
      return '/terms';
    case 'privacy':
      return '/privacy';
    case 'about':
      return '/about';
    case 'help':
      return '/help';
    case 'legal':
      return '/legal';
    case 'blog':
      return '/blog';
    case 'rashan_list':
      return '/rashan-list';
    case 'not_found':
    default:
      return '/404';
  }
}
