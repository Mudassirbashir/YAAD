import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useLanguage } from './context/LanguageContext';
import { ShoppingList, ShoppingItem, ScreenType, NavigationTab } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SplashView } from './components/SplashView';
import { HomeView } from './components/HomeView';
import { NotFoundView } from './components/NotFoundView';
import { ListNotFoundView } from './components/ListNotFoundView';
import { BottomNavBar } from './components/BottomNavBar';
import { AuthModal } from './components/AuthModal';
import { PhoneNumberReminderModal } from './components/PhoneNumberReminderModal';

// Code-split secondary views & heavy feature screens for fast initial rendering
const OnboardingView = React.lazy(() => import('./components/OnboardingView').then((m) => ({ default: m.OnboardingView })));
const AuthView = React.lazy(() => import('./components/AuthView').then((m) => ({ default: m.AuthView })));
const ProfileSetupView = React.lazy(() => import('./components/ProfileSetupView').then((m) => ({ default: m.ProfileSetupView })));
const ResetPasswordView = React.lazy(() => import('./components/ResetPasswordView').then((m) => ({ default: m.ResetPasswordView })));
const CreateListView = React.lazy(() => import('./components/CreateListView').then((m) => ({ default: m.CreateListView })));
const AddItemsView = React.lazy(() => import('./components/AddItemsView').then((m) => ({ default: m.AddItemsView })));
const ShoppingListView = React.lazy(() => import('./components/ShoppingListView').then((m) => ({ default: m.ShoppingListView })));
const CompletionView = React.lazy(() => import('./components/CompletionView').then((m) => ({ default: m.CompletionView })));
const ListHistoryView = React.lazy(() => import('./components/ListHistoryView').then((m) => ({ default: m.ListHistoryView })));
const ListDetailsView = React.lazy(() => import('./components/ListDetailsView').then((m) => ({ default: m.ListDetailsView })));
const EditListView = React.lazy(() => import('./components/EditListView').then((m) => ({ default: m.EditListView })));
const SettingsView = React.lazy(() => import('./components/SettingsView').then((m) => ({ default: m.SettingsView })));
const StatisticsView = React.lazy(() => import('./components/StatisticsView').then((m) => ({ default: m.StatisticsView })));
const NotificationsView = React.lazy(() => import('./components/NotificationsView').then((m) => ({ default: m.NotificationsView })));
import { usePhoneNumberReminder } from './hooks/usePhoneNumberReminder';
import { useAuth } from './context/AuthContext';
import { RouterProvider, useAppRouter } from './router/RouterContext';
import { AppRouteId, SettingsSubSection, buildCanonicalPath } from './router/routes';
import { generateUUID } from './lib/uuid';
import {
  loadUserShoppingLists,
  saveUserShoppingList,
  deleteUserShoppingList,
  deleteMultipleUserShoppingLists,
  clearAllUserShoppingLists,
  setupNetworkSyncListener,
  persistCompletedShoppingSession,
  fetchSingleShoppingList,
} from './lib/supabase';
import { subscribeToCrossDeviceSync } from './lib/realtimeSync';
import { NetworkStatusPill } from './components/NetworkStatusPill';
import { PWAUpdateNotification } from './components/PWAUpdateNotification';
import { useOnlineStatus } from './lib/useOnlineStatus';
import { getOfflineLists, saveOfflineListsBatch, purgeAllUserOfflineData } from './lib/offlineDb';
import { supabaseCatalog } from './lib/catalog';
import { Loader2 } from 'lucide-react';
import { recommendationService, RecommendationCandidate } from './lib/recommendations';
import { detectDuplicateItem, mergeQuantities } from './lib/recognition';
import { getFriendlyErrorMessage } from './utils/errorFormatting';
import type { LegalPageType } from './components/legal/legalContent';
import { LandingPageView } from './components/LandingPageView';
import { HeadManager } from './seo/HeadManager';
import { SuspendedAccountModal } from './components/SuspendedAccountModal';
import { MiloHost } from './pet/MiloHost';
import { triggerMiloEvent } from './pet/useMilo';

const LegalPageView = React.lazy(() => import('./components/legal/LegalPageView').then((m) => ({ default: m.LegalPageView })));
const BlogArticlePage = React.lazy(() => import('./components/legal/BlogArticlePage').then((m) => ({ default: m.BlogArticlePage })));
const RashanListPage = React.lazy(() => import('./components/rashan/RashanListPage').then((m) => ({ default: m.RashanListPage })));
const SharedListView = React.lazy(() => import('./components/SharedListView').then((m) => ({ default: m.SharedListView })));
const AdminApp = React.lazy(() => import('./admin/AdminApp').then((m) => ({ default: m.AdminApp })));

const STORAGE_ONBOARDED_KEY = 'yaad_has_onboarded_v2';
const STORAGE_PROFILE_SETUP_KEY = 'yaad_profile_setup_done';
const getStorageKey = (userId?: string | null) => {
  return userId ? `yaad_shopping_lists_u_${userId}` : 'yaad_shopping_lists_guest';
};

const LEGAL_SCREENS: ScreenType[] = ['terms', 'privacy', 'about', 'help', 'legal', 'blog', 'blog_article', 'features', 'how_it_works'];

function AppContent() {
  const {
    user,
    profile,
    isLoading: isAuthLoading,
    isConfigured,
    isPasswordRecovery,
    isPasswordResetRequired,
    authState,
    deleteAccount,
    signOut,
  } = useAuth();

  const {
    currentPath,
    route,
    navigate,
    replace,
    goBack,
    saveIntendedDestination,
    getIntendedDestination,
    clearIntendedDestination,
  } = useAppRouter();

  const { isRTL } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const slideX = (isRTL || (typeof document !== 'undefined' && document.dir === 'rtl')) ? -24 : 24;

  const isPasswordResetRequiredActive = Boolean(
    isPasswordRecovery ||
    isPasswordResetRequired ||
    authState === 'PASSWORD_RESET_REQUIRED' ||
    user?.user_metadata?.password_reset_required === true ||
    (typeof window !== 'undefined' &&
      (sessionStorage.getItem('yaad_password_recovery_active') === 'true' ||
        localStorage.getItem('yaad_password_reset_required') === 'true'))
  );

  // Splash screen state: only show initially
  const [hasSplashFinished, setHasSplashFinished] = useState<boolean>(false);

  // Canonical production domain drift guard:
  // If the user lands on a deployment-specific URL or legacy domain (e.g. after Google OAuth redirect from Supabase),
  // immediately migrate the browser to the authoritative production domain while preserving the exact path, search params, and hash (tokens).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const host = (window.location.hostname || '').toLowerCase();
      const isLegacyOrDeployment =
        host === 'yaadapppk-mudassirbashir530-creators-projects.vercel.app' ||
        host === 'yaad-mudassirbashir530-creators-projects.vercel.app' ||
        host === 'yaad-three.vercel.app';
      if (isLegacyOrDeployment) {
        const canonicalTarget = `https://yaadapppk.vercel.app${window.location.pathname}${window.location.search}${window.location.hash}`;
        window.location.replace(canonicalTarget);
      }
    } catch {}
  }, []);

  // Active working list
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [tempNewListTitle, setTempNewListTitle] = useState<string>('');
  const [activeListContext, setActiveListContext] = useState<string | undefined>(undefined);

  // Deep link list fetch state
  const [isDeepLinkLoading, setIsDeepLinkLoading] = useState<boolean>(false);
  const [deepLinkNotFound, setDeepLinkNotFound] = useState<boolean>(false);
  const [deepLinkSessionNotFound, setDeepLinkSessionNotFound] = useState<boolean>(false);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  const handleOpenPhoneInSettings = useCallback(() => {
    navigate('/settings');
  }, [navigate]);

  const hasOnboardedFlag = typeof window !== 'undefined'
    ? localStorage.getItem(STORAGE_ONBOARDED_KEY) === 'true'
    : true;

  // Derive current screen from route
  const currentScreen: ScreenType = useMemo((): ScreenType => {
    // If user is already authenticated, they should NEVER see the public website landing page on root '/'
    if (route.routeId === 'root') {
      if (user) return 'home';
      return 'landing';
    }

    // Public rashan, blog, shared list, and legal pages render immediately without splash delay
    if (route.routeId === 'rashan_list') return 'rashan_list';
    if (route.routeId === 'blog_article') return 'blog_article';
    if (route.routeId === 'shared_list') return 'shared_list';
    if (LEGAL_SCREENS.includes(route.routeId as ScreenType)) return route.routeId as ScreenType;

    if (!hasSplashFinished) return 'splash';
    if (isPasswordResetRequiredActive) return 'reset_password';

    switch (route.routeId) {
      case 'home':
        return 'home';
      case 'create':
        return 'create_list';
      case 'add_items':
        return 'add_items';
      case 'history':
        return 'history';
      case 'history_session':
        return 'list_details';
      case 'shopping_list':
        return 'shopping_list';
      case 'list_details':
        return 'list_details';
      case 'edit_list':
        return 'edit_list';
      case 'settings':
      case 'settings_subsection':
        return 'settings';
      case 'notifications':
        return 'notifications';
      case 'statistics':
        return 'statistics';
      case 'auth':
        return user ? 'home' : 'auth';
      case 'reset_password':
        return 'reset_password';
      case 'profile_setup':
        return 'profile_setup';
      case 'onboarding':
        return 'onboarding';
      case 'not_found':
      default:
        return 'not_found';
    }
  }, [hasSplashFinished, isPasswordResetRequiredActive, route.routeId, user]);

  // Derive active navigation tab from route
  const activeTab: NavigationTab = useMemo(() => {
    switch (route.routeId) {
      case 'home':
      case 'root':
        return 'home';
      case 'create':
      case 'add_items':
        return 'create';
      case 'history':
      case 'history_session':
        return 'lists';
      case 'settings':
      case 'settings_subsection':
        return 'settings';
      default:
        return 'home';
    }
  }, [route.routeId]);

  // Smart Phone-Number Completion Reminder
  const {
    isOpen: isPhoneReminderOpen,
    handleDismiss: handleDismissPhoneReminder,
    handleAddNumber: handleAddNumberReminder,
  } = usePhoneNumberReminder({
    user,
    profile,
    currentScreen,
    isTourActive: false,
    isAuthModalOpen,
    hasOnboarded: hasOnboardedFlag,
    onOpenPhoneSettings: handleOpenPhoneInSettings,
  });

  // Loading & error state for shopping lists
  const [isLoadingLists, setIsLoadingLists] = useState<boolean>(false);
  const [listsFetchError, setListsFetchError] = useState<string | null>(null);
  const [isCompletingTrip, setIsCompletingTrip] = useState<boolean>(false);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const isCompletingTripRef = React.useRef<boolean>(false);

  // Shopping lists collection scoped by authenticated user
  const [lists, setLists] = useState<ShoppingList[]>([]);

  // Controls whether the auth success celebration screen is currently showing
  const [isAuthSuccessShowing, setIsAuthSuccessShowing] = useState<boolean>(false);

  // Track previous user to detect sign in / sign out / switch
  const [prevUserId, setPrevUserId] = useState<string | null | undefined>(user?.id);

  // Sync with Supabase & IndexedDB when user changes (login or logout)
  const fetchShoppingLists = useCallback(async (userId: string | null) => {
    if (!userId) {
      setLists([]);
      setIsLoadingLists(false);
      setListsFetchError(null);
      return;
    }

    setIsLoadingLists(true);
    setListsFetchError(null);

    // 1. Read from IndexedDB for immediate responsiveness
    try {
      const offlineLists = await getOfflineLists(userId);
      if (offlineLists && offlineLists.length > 0) {
        setLists(offlineLists);
      }
    } catch (e) {
      console.warn('Could not read offline lists from IndexedDB:', e);
    }

    // 2. Fetch and synchronize fresh data from backend
    try {
      const { lists: freshLists, error } = await loadUserShoppingLists(userId);
      if (error) {
        console.warn('Notice loading shopping lists:', error);
        setListsFetchError(getFriendlyErrorMessage(error));
      } else if (freshLists) {
        setLists(freshLists);
      }
    } catch (err: any) {
      console.warn('Error loading shopping lists:', err);
      setListsFetchError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoadingLists(false);
    }
  }, []);

  // Online / Offline status and automatic synchronization
  const { isOnline, syncStatus, pendingCount, triggerSync } = useOnlineStatus(
    useCallback(() => {
      if (user?.id) {
        fetchShoppingLists(user.id);
      }
    }, [user?.id, fetchShoppingLists])
  );

  // Authoritative retry handler that triggers pending sync & fresh lists fetch
  const handleRetrySyncAndFetch = useCallback(() => {
    triggerSync();
    if (user?.id) {
      fetchShoppingLists(user.id);
    }
  }, [triggerSync, fetchShoppingLists, user?.id]);

  useEffect(() => {
    const currentUserId = user?.id || null;
    const previousUserId = prevUserId || null;

    if (currentUserId !== previousUserId) {
      setPrevUserId(currentUserId);
      setActiveListId(null);
      fetchShoppingLists(currentUserId);
    }
  }, [user?.id, prevUserId, fetchShoppingLists]);

  // Real-time network sync listener when returning online
  useEffect(() => {
    if (!user?.id || !isConfigured) return;

    const cleanup = setupNetworkSyncListener(user.id, () => {
      fetchShoppingLists(user.id);
    });

    return cleanup;
  }, [user?.id, isConfigured, fetchShoppingLists]);

  // Re-fetch shopping lists whenever navigating to /home or /history to ensure fresh state
  useEffect(() => {
    if (user?.id && (route.routeId === 'home' || route.routeId === 'history')) {
      fetchShoppingLists(user.id);
    }
  }, [route.routeId, user?.id, fetchShoppingLists]);

  // Check for pending imported rashan list upon user sign-in
  useEffect(() => {
    if (!user?.id) return;
    try {
      const raw = localStorage.getItem('yaad_pending_imported_rashan_list');
      if (raw) {
        localStorage.removeItem('yaad_pending_imported_rashan_list');
        const imported = JSON.parse(raw);
        if (imported && imported.id) {
          const userList: ShoppingList = { ...imported, userId: user.id };
          setLists((prev) => [userList, ...prev.filter((l) => l.id !== userList.id)]);
          saveUserShoppingList(user.id, userList).catch((e) => console.warn(e));
        }
      }
    } catch {}
  }, [user?.id]);

  // Backward compatibility: redirect old /blog#<slug> hash links to /blog/<slug>
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const pathname = window.location.pathname;
      if (pathname.startsWith('/blog') && hash && hash.length > 1) {
        const cleanSlug = hash.replace(/^#/, '');
        if (cleanSlug) {
          navigate(`/blog/${cleanSlug}`);
        }
      }
    }
  }, [navigate, route.pathname]);

  // Cross-device realtime broadcast listener (instant cross-device sync)
  useEffect(() => {
    if (!user?.id || !isConfigured) return;

    const unsubscribe = subscribeToCrossDeviceSync(user.id, (event) => {
      if (event.type === 'LIST_UPSERT' && event.list) {
        setLists((prev) => {
          const index = prev.findIndex((l) => l.id === event.list!.id);
          if (index >= 0) {
            const next = [...prev];
            next[index] = event.list!;
            return next;
          }
          return [event.list!, ...prev];
        });
      } else if (event.type === 'LIST_DELETE' && event.listId) {
        setLists((prev) => prev.filter((l) => l.id !== event.listId));
        setActiveListId((prevActive) => (prevActive === event.listId ? null : prevActive));
      } else if (event.type === 'REFRESH_ALL') {
        fetchShoppingLists(user.id);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user?.id, isConfigured, fetchShoppingLists]);

  // Initialize Master Item Catalog:
  // On public landing page and legal pages, defer until idle so critical FCP/LCP is not delayed
  useEffect(() => {
    const isPublicLanding = currentScreen === 'landing' || LEGAL_SCREENS.includes(currentScreen);
    if (isPublicLanding) {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        const handle = (window as any).requestIdleCallback(
          () => {
            supabaseCatalog.initialize();
          },
          { timeout: 3000 }
        );
        return () => (window as any).cancelIdleCallback(handle);
      } else {
        const timer = setTimeout(() => {
          supabaseCatalog.initialize();
        }, 2000);
        return () => clearTimeout(timer);
      }
    } else {
      supabaseCatalog.initialize();
    }
  }, [currentScreen]);

  // Initialize personalized recommendation behavior model for user only when authenticated
  useEffect(() => {
    if (!user?.id) return;
    recommendationService.initialize(user.id);
  }, [user?.id]);

  // Save lists to IndexedDB whenever lists state changes
  useEffect(() => {
    if (!user?.id || lists.length === 0) return;
    saveOfflineListsBatch(user.id, lists).catch((e) => {
      console.warn('IndexedDB save batch notice:', e);
    });
  }, [lists, user?.id]);

  // Synchronize activeListId with route params (/lists/:listId, /lists/:listId/details, /lists/:listId/edit)
  useEffect(() => {
    if (!user) return;

    const routeListId = route.params?.listId;
    if (routeListId) {
      setActiveListId(routeListId);
      setDeepLinkNotFound(false);

      // Check if list is already present in in-memory state
      const foundInCache = lists.some((l) => l.id === routeListId);
      if (!foundInCache && !isLoadingLists) {
        setIsDeepLinkLoading(true);

        const resolveList = async () => {
          // 1. Check local IndexedDB store first before failing
          try {
            const offlineLists = await getOfflineLists(user.id);
            const localMatch = offlineLists.find((l) => l.id === routeListId);
            if (localMatch) {
              setLists((prev) => [localMatch, ...prev.filter((l) => l.id !== localMatch.id)]);
              setActiveListId(localMatch.id);
              setDeepLinkNotFound(false);
              setIsDeepLinkLoading(false);
              return;
            }
          } catch (e) {
            console.warn('[DeepLink] IndexedDB check notice:', e);
          }

          // 2. Check localStorage cache
          try {
            const localRaw = localStorage.getItem(getStorageKey(user.id));
            if (localRaw) {
              const parsed = JSON.parse(localRaw);
              if (Array.isArray(parsed)) {
                const storageMatch = parsed.find((l: any) => l.id === routeListId);
                if (storageMatch) {
                  setLists((prev) => [storageMatch, ...prev.filter((l) => l.id !== storageMatch.id)]);
                  setActiveListId(storageMatch.id);
                  setDeepLinkNotFound(false);
                  setIsDeepLinkLoading(false);
                  return;
                }
              }
            }
          } catch (e) {
            console.warn('[DeepLink] localStorage check notice:', e);
          }

          // 3. Fallback to cloud backend fetch only if local store misses
          try {
            const { list, error } = await fetchSingleShoppingList(user.id, routeListId);
            if (!error && list) {
              setLists((prev) => [list, ...prev.filter((l) => l.id !== list.id)]);
              setActiveListId(list.id);
              setDeepLinkNotFound(false);
            } else {
              setDeepLinkNotFound(true);
            }
          } catch {
            setDeepLinkNotFound(true);
          } finally {
            setIsDeepLinkLoading(false);
          }
        };

        resolveList();
      }
    } else {
      setDeepLinkNotFound(false);
    }

    // Handle /history/:sessionId
    const routeSessionId = route.params?.sessionId;
    if (routeSessionId) {
      setDeepLinkSessionNotFound(false);
      const sessionList = lists.find(
        (l) => l.completionSessionId === routeSessionId || l.id === routeSessionId
      );
      if (sessionList) {
        setActiveListId(sessionList.id);
      } else if (!isLoadingLists) {
        setIsDeepLinkLoading(true);

        const resolveSession = async () => {
          // Check local store first
          try {
            const offlineLists = await getOfflineLists(user.id);
            const localMatch = offlineLists.find(
              (l) => l.completionSessionId === routeSessionId || l.id === routeSessionId
            );
            if (localMatch) {
              setLists((prev) => [localMatch, ...prev.filter((l) => l.id !== localMatch.id)]);
              setActiveListId(localMatch.id);
              setDeepLinkSessionNotFound(false);
              setIsDeepLinkLoading(false);
              return;
            }
          } catch {}

          try {
            const { list, error } = await fetchSingleShoppingList(user.id, routeSessionId);
            if (!error && list) {
              setLists((prev) => [list, ...prev.filter((l) => l.id !== list.id)]);
              setActiveListId(list.id);
              setDeepLinkSessionNotFound(false);
            } else {
              setDeepLinkSessionNotFound(true);
            }
          } catch {
            setDeepLinkSessionNotFound(true);
          } finally {
            setIsDeepLinkLoading(false);
          }
        };

        resolveSession();
      }
    } else {
      setDeepLinkSessionNotFound(false);
    }
  }, [route.routeId, route.params?.listId, route.params?.sessionId, user, lists, isLoadingLists]);

  // Legacy /blog#slug hash compatibility (redirects /blog#<slug> to /blog/<slug>)
  useEffect(() => {
    const handleHashCheck = () => {
      const hash = window.location.hash;
      const pathname = window.location.pathname;
      if ((pathname === '/blog' || pathname === '/blog/') && hash && hash.length > 1) {
        const slug = hash.replace(/^#/, '').trim();
        if (slug) {
          navigate(`/blog/${slug}`);
        }
      }
    };
    handleHashCheck();
    window.addEventListener('hashchange', handleHashCheck);
    return () => window.removeEventListener('hashchange', handleHashCheck);
  }, [navigate]);

  // ===========================================================================
  // PRODUCTION ROUTE GUARDS & INTENDED DESTINATION ENGINE
  // ===========================================================================
  // Immediate auto-redirect for authenticated users landing on root '/' or '/auth'
  useEffect(() => {
    if (isAuthLoading) return;
    if (user && !isAuthSuccessShowing) {
      if (route.routeId === 'root' || route.routeId === 'auth') {
        const intended = getIntendedDestination();
        if (intended && intended !== '/auth' && intended !== '/profile-setup' && intended !== '/onboarding' && intended !== '/') {
          clearIntendedDestination();
          replace(intended);
        } else {
          replace('/home');
        }
      }
    }
  }, [user, isAuthLoading, isAuthSuccessShowing, route.routeId, getIntendedDestination, clearIntendedDestination, replace]);

  useEffect(() => {
    if (!hasSplashFinished || isAuthLoading) return;

    // 0. HIGHEST PRIORITY ROUTE GUARD: Password Reset
    if (isPasswordResetRequiredActive) {
      if (route.routeId !== 'reset_password') {
        replace('/reset-password');
      }
      return;
    }

    // 1. AUTHENTICATED USERS: If user is on /auth, /root, /profile-setup, or /onboarding, redirect straight to /home or intended
    if (user && !isAuthSuccessShowing) {
      if (route.routeId === 'auth' || route.routeId === 'root' || route.routeId === 'profile_setup' || route.routeId === 'onboarding') {
        const intended = getIntendedDestination();
        if (intended && intended !== '/auth' && intended !== '/profile-setup' && intended !== '/onboarding' && intended !== '/') {
          clearIntendedDestination();
          replace(intended);
        } else {
          replace('/home');
        }
        return;
      }
    }

    // 2. PUBLIC ROUTES (Always accessible without authentication)
    if (!route.isProtected) {
      return;
    }

    // 3. UNAUTHENTICATED USERS: Guard protected routes
    if (!user) {
      // Save intended destination so user is smoothly returned after sign in
      if (route.routeId !== 'auth' && route.routeId !== 'root') {
        saveIntendedDestination(currentPath);
      }
      replace('/auth');
      return;
    }

    // 3. AUTHENTICATED USERS: Check Profile Setup & Onboarding
    const hasSetupLocal = localStorage.getItem(STORAGE_PROFILE_SETUP_KEY) === 'true';
    const isSetupComplete =
      Boolean(profile?.has_completed_setup) ||
      Boolean(profile?.full_name?.trim()) ||
      Boolean(user.user_metadata?.has_completed_setup) ||
      Boolean(user.user_metadata?.full_name?.trim()) ||
      Boolean(user.user_metadata?.name?.trim()) ||
      hasSetupLocal;

    if (!isSetupComplete && (!profile?.full_name || profile.full_name.trim() === '')) {
      if (route.routeId !== 'profile_setup') {
        replace('/profile-setup');
      }
      return;
    }

    localStorage.setItem(STORAGE_PROFILE_SETUP_KEY, 'true');

    // 4. Check Onboarding
    const hasOnboardedLocal = localStorage.getItem(STORAGE_ONBOARDED_KEY) === 'true';
    const isExistingAccount =
      isSetupComplete ||
      Boolean(user.user_metadata?.has_completed_onboarding) ||
      Boolean(user.created_at && user.last_sign_in_at && user.created_at !== user.last_sign_in_at);

    if (!hasOnboardedLocal && !isExistingAccount) {
      if (route.routeId !== 'onboarding') {
        replace('/onboarding');
      }
      return;
    }

    localStorage.setItem(STORAGE_ONBOARDED_KEY, 'true');

    // 5. Intended Destination Fulfillment or Redirect from Auth/Setup/Root
    if (route.routeId === 'auth' || route.routeId === 'root' || route.routeId === 'profile_setup') {
      const intended = getIntendedDestination();
      if (intended) {
        clearIntendedDestination();
        replace(intended);
      } else {
        replace('/home');
      }
    }
  }, [
    hasSplashFinished,
    isAuthLoading,
    isPasswordResetRequiredActive,
    route.isProtected,
    route.routeId,
    user,
    profile,
    currentPath,
    saveIntendedDestination,
    getIntendedDestination,
    clearIntendedDestination,
    replace,
  ]);

  // Handle splash completion
  const handleSplashFinish = () => {
    setHasSplashFinished(true);

    if (isAuthLoading) {
      // Defer routing decisions until authentication session is fully resolved
      return;
    }

    if (isPasswordResetRequiredActive) {
      replace('/reset-password');
      return;
    }

    if (!user) {
      if (route.isProtected) {
        saveIntendedDestination(currentPath);
        replace('/auth');
      }
      return;
    }

    const isSetupComplete =
      Boolean(profile?.has_completed_setup) ||
      Boolean(profile?.full_name?.trim()) ||
      Boolean(user?.user_metadata?.has_completed_setup) ||
      Boolean(user?.user_metadata?.full_name?.trim()) ||
      Boolean(user?.user_metadata?.name?.trim()) ||
      localStorage.getItem(STORAGE_PROFILE_SETUP_KEY) === 'true';

    if (!isSetupComplete) {
      replace('/profile-setup');
      return;
    }

    localStorage.setItem(STORAGE_PROFILE_SETUP_KEY, 'true');
    localStorage.setItem(STORAGE_ONBOARDED_KEY, 'true');

    // If on root or auth, go to intended destination or home
    if (route.routeId === 'root' || route.routeId === 'auth') {
      const intended = getIntendedDestination();
      if (intended) {
        clearIntendedDestination();
        replace(intended);
      } else {
        replace('/home');
      }
    }
  };

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    localStorage.setItem(STORAGE_ONBOARDED_KEY, 'true');
    triggerMiloEvent('onboarding_complete');
    const intended = getIntendedDestination();
    if (intended) {
      clearIntendedDestination();
      replace(intended);
    } else {
      replace('/home');
    }
  };

  // Handle successful login/signup from AuthView
  const handleAuthSuccess = () => {
    const isSetupComplete =
      Boolean(profile?.has_completed_setup) ||
      Boolean(profile?.full_name?.trim()) ||
      Boolean(user?.user_metadata?.has_completed_setup) ||
      Boolean(user?.user_metadata?.full_name?.trim()) ||
      Boolean(user?.user_metadata?.name?.trim()) ||
      localStorage.getItem(STORAGE_PROFILE_SETUP_KEY) === 'true';

    if (!isSetupComplete) {
      replace('/profile-setup');
      return;
    }

    localStorage.setItem(STORAGE_PROFILE_SETUP_KEY, 'true');
    localStorage.setItem(STORAGE_ONBOARDED_KEY, 'true');

    const intended = getIntendedDestination();
    if (intended) {
      clearIntendedDestination();
      replace(intended);
    } else {
      replace('/home');
    }
  };

  // Handle profile setup completion
  const handleProfileSetupComplete = () => {
    localStorage.setItem(STORAGE_PROFILE_SETUP_KEY, 'true');
    const hasOnboarded = localStorage.getItem(STORAGE_ONBOARDED_KEY) === 'true';
    if (!hasOnboarded) {
      replace('/onboarding');
    } else {
      triggerMiloEvent('onboarding_complete');
      const intended = getIntendedDestination();
      if (intended) {
        clearIntendedDestination();
        replace(intended);
      } else {
        replace('/home');
      }
    }
  };

  // Replay onboarding
  const handleResetOnboarding = () => {
    localStorage.removeItem(STORAGE_ONBOARDED_KEY);
    localStorage.removeItem(STORAGE_PROFILE_SETUP_KEY);
    navigate('/onboarding');
  };

  // Complete Account Deletion Handler
  const handleDeleteAccount = async () => {
    try {
      if (user?.id) {
        const storageKey = getStorageKey(user.id);
        localStorage.removeItem(storageKey);
        await purgeAllUserOfflineData(user.id);
        await recommendationService.clearUserData(user.id);
      }
      localStorage.removeItem(STORAGE_ONBOARDED_KEY);
      localStorage.removeItem(STORAGE_PROFILE_SETUP_KEY);
      await deleteAccount();
    } catch (e) {
      console.error('Error during account deletion:', e);
    }
    setLists([]);
    setActiveListId(null);
    clearIntendedDestination();
    replace('/auth');
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    if (user?.id) {
      await purgeAllUserOfflineData(user.id);
      await recommendationService.clearUserData(user.id);
    }
    await signOut();
    setLists([]);
    setActiveListId(null);
    clearIntendedDestination();
    replace('/auth');
  };

  // Open Auth modal helper
  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Create list flow
  const handleStartCreateList = () => {
    if (!user) {
      saveIntendedDestination('/create');
      navigate('/auth');
      return;
    }
    navigate('/create');
  };

  const handleCreateListTitleSubmitted = async (title: string, icon?: string, contextId?: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const cleanTitle = title.trim() || 'Shopping List';
    setActiveListContext(contextId);
    const newListId = generateUUID();
    const newList: ShoppingList = {
      id: newListId,
      userId: user.id,
      title: cleanTitle,
      icon: icon || 'shopping_basket',
      createdAt: 'Today',
      createdTimestamp: Date.now(),
      isCompleted: false,
      items: [],
      contextId: contextId,
    };

    setLists((prev) => [newList, ...prev]);
    setActiveListId(newListId);
    setTempNewListTitle(cleanTitle);
    triggerMiloEvent('list_created');
    navigate('/create/items');

    if (isConfigured) {
      await saveUserShoppingList(user.id, newList);
    }
  };

  const handleStartShoppingFromNewItems = async (items: ShoppingItem[]) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const targetId = activeListId || generateUUID();
    const existingList = lists.find((l) => l.id === targetId);

    const updatedList: ShoppingList = {
      id: targetId,
      userId: user.id,
      title: existingList?.title || tempNewListTitle.trim() || 'Shopping List',
      icon: existingList?.icon || 'shopping_basket',
      createdAt: existingList?.createdAt || 'Today',
      createdTimestamp: existingList?.createdTimestamp || Date.now(),
      isCompleted: false,
      items: items.map((it) => ({
        ...it,
        id: it.id || generateUUID(),
        completed: it.completed ?? false,
      })),
      contextId: activeListContext || existingList?.contextId,
    };

    setLists((prev) => {
      const exists = prev.some((l) => l.id === targetId);
      if (exists) {
        return prev.map((l) => (l.id === targetId ? updatedList : l));
      }
      return [updatedList, ...prev];
    });
    setActiveListId(targetId);
    setTempNewListTitle('');
    navigate(`/lists/${targetId}`);

    if (isConfigured) {
      await saveUserShoppingList(user.id, updatedList);
    }
  };

  const handleItemsChangeInAddView = async (newItems: ShoppingItem[]) => {
    if (!user || !activeListId) return;
    setLists((prev) =>
      prev.map((l) => (l.id === activeListId ? { ...l, items: newItems } : l))
    );
    if (isConfigured) {
      const targetList = lists.find((l) => l.id === activeListId);
      if (targetList) {
        await saveUserShoppingList(user.id, { ...targetList, items: newItems });
      }
    }
  };

  // View / Edit / Complete actions with clean URL updates
  const handleOpenListInShoppingMode = (listOrId: ShoppingList | string) => {
    if (!user) {
      const targetId = typeof listOrId === 'string' ? listOrId : listOrId.id;
      saveIntendedDestination(`/lists/${targetId}`);
      navigate('/auth');
      return;
    }
    const targetId = typeof listOrId === 'string' ? listOrId : listOrId.id;
    setActiveListId(targetId);
    navigate(`/lists/${targetId}`);
  };

  // Pending lists for Milo companion reminder (Part C: incomplete lists with created timestamp)
  const getPendingLists = useCallback(() => {
    return lists
      .filter((l) => !l.isCompleted && !l.completed)
      .map((l) => {
        const ts = l.createdTimestamp || (l.createdAt ? new Date(l.createdAt).getTime() : 0);
        return {
          id: l.id,
          name: l.title || 'Untitled',
          createdAt: ts,
        };
      });
  }, [lists]);

  const handleOpenListDetails = (listOrId: ShoppingList | string) => {
    if (!user) {
      const targetId = typeof listOrId === 'string' ? listOrId : listOrId.id;
      saveIntendedDestination(`/lists/${targetId}/details`);
      navigate('/auth');
      return;
    }
    const targetId = typeof listOrId === 'string' ? listOrId : listOrId.id;
    setActiveListId(targetId);
    navigate(`/lists/${targetId}/details`);
  };

  const handleEditList = (listOrId: ShoppingList | string) => {
    if (!user) {
      const targetId = typeof listOrId === 'string' ? listOrId : listOrId.id;
      saveIntendedDestination(`/lists/${targetId}/edit`);
      navigate('/auth');
      return;
    }
    const targetId = typeof listOrId === 'string' ? listOrId : listOrId.id;
    setActiveListId(targetId);
    navigate(`/lists/${targetId}/edit`);
  };

  const handleUpdateList = async (updatedList: ShoppingList) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setLists((prev) =>
      prev.map((l) => (l.id === updatedList.id ? updatedList : l))
    );

    if (isConfigured) {
      await saveUserShoppingList(user.id, updatedList);
    }
  };

  const handleCompleteTrip = async (listOrId: ShoppingList | string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const targetId = typeof listOrId === 'string' ? listOrId : listOrId.id;
    const target = typeof listOrId === 'object' ? listOrId : lists.find((l) => l.id === targetId);
    if (!target) return;

    if (isCompletingTripRef.current) return;
    isCompletingTripRef.current = true;
    setIsCompletingTrip(true);
    setCompletionError(null);

    const nowTimestamp = Date.now();
    const stableSessionId = target.completionSessionId || generateUUID();
    const completedAtIso = target.completedAt || new Date(nowTimestamp).toISOString();

    const completedList: ShoppingList = {
      ...target,
      isCompleted: true,
      completedAt: completedAtIso,
      completedTimestamp: target.completedTimestamp || nowTimestamp,
      completionSessionId: stableSessionId,
    };

    try {
      await persistCompletedShoppingSession(user.id, completedList, stableSessionId);

      setLists((prev) => prev.map((l) => (l.id === targetId ? completedList : l)));
      setActiveListId(targetId);

      if (completedList.items && completedList.items.length > 0) {
        recommendationService.recordCompletedTrip(completedList.items).catch((err) => {
          console.warn('Error recording trip to recommendation engine:', err);
        });

        completedList.items
          .filter((it) => it.completed)
          .forEach((it) => {
            const itemId = it.canonicalName ? it.canonicalName.toLowerCase().replace(/\s+/g, '_') : it.name.toLowerCase().replace(/\s+/g, '_');
            supabaseCatalog.recordUserPurchase(user.id, itemId, it.quantity);
          });
      }

      // Trigger Milo celebration overlay on list completed
      triggerMiloEvent('list_completed');

      // Transition to completion view
      navigate(`/history/${stableSessionId}`);
    } catch (err: any) {
      console.warn('Notice completing trip, proceeding with local completion:', err);
      setLists((prev) => prev.map((l) => (l.id === targetId ? completedList : l)));
      setActiveListId(targetId);
      navigate(`/history/${stableSessionId}`);
    } finally {
      setIsCompletingTrip(false);
      isCompletingTripRef.current = false;
    }
  };

  const handleFinishCompletion = () => {
    setActiveListId(null);
    navigate('/history');
  };

  const handleReuseList = async (listOrId: ShoppingList | string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const targetId = typeof listOrId === 'string' ? listOrId : listOrId.id;
    const target = typeof listOrId === 'object' ? listOrId : lists.find((l) => l.id === targetId);
    if (!target) return;

    const duplicatedId = generateUUID();
    const duplicatedList: ShoppingList = {
      ...target,
      id: duplicatedId,
      userId: user.id,
      title: `${target.title} (Copy)`,
      createdAt: 'Today',
      createdTimestamp: Date.now(),
      isCompleted: false,
      completedAt: undefined,
      items: target.items.map((it) => ({
        ...it,
        id: generateUUID(),
        completed: false,
      })),
    };

    setLists((prev) => [duplicatedList, ...prev]);
    setActiveListId(duplicatedId);
    navigate(`/lists/${duplicatedId}`);

    if (isConfigured) {
      await saveUserShoppingList(user.id, duplicatedList);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setLists((prev) => prev.filter((l) => l.id !== listId));
    if (activeListId === listId) {
      setActiveListId(null);
    }
    if (route.routeId === 'list_details' || route.routeId === 'edit_list' || route.routeId === 'shopping_list') {
      navigate('/history');
    }

    triggerMiloEvent('list_deleted');
    await deleteUserShoppingList(user.id, listId);
  };

  const handleDeleteMultipleLists = async (listIds: string[]) => {
    if (!user || listIds.length === 0) return;
    const idSet = new Set(listIds);
    setLists((prev) => prev.filter((l) => !idSet.has(l.id)));
    if (activeListId && idSet.has(activeListId)) {
      setActiveListId(null);
    }
    triggerMiloEvent('list_deleted');
    await deleteMultipleUserShoppingLists(user.id, listIds);
  };

  const handleClearAllHistory = async () => {
    if (!user) return;
    setLists([]);
    setActiveListId(null);
    await clearAllUserShoppingLists(user.id);
  };

  const handleSaveEditedList = async (savedList: ShoppingList) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    await handleUpdateList(savedList);
    navigate(`/lists/${savedList.id}`);
  };

  // Quick add from recommendations
  const handleQuickAddRecommendation = async (
    candidate: RecommendationCandidate,
    targetListId?: string,
    openShoppingMode?: boolean
  ) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const displayName = candidate.displayName || candidate.canonicalName;
    const finalCategory = candidate.category || 'vegetables';

    if (targetListId) {
      const targetList = lists.find((l) => l.id === targetListId);
      if (targetList) {
        const existingItems = targetList.items || [];
        const duplicateCheck = detectDuplicateItem(existingItems, {
          canonicalName: candidate.canonicalName,
          englishName: displayName,
          nameUrdu: candidate.nameUrdu,
          nameRomanUrdu: candidate.nameRomanUrdu,
          categoryId: finalCategory,
          confidence: 1.0,
          isRecognized: true,
          unresolved: false,
          rawInput: displayName,
          matchedVia: 'exact_item',
          quantity: candidate.suggestedQuantity,
          unit: candidate.suggestedUnit,
        });

        let updatedItems: ShoppingItem[];
        if (duplicateCheck.isDuplicate && duplicateCheck.existingItem) {
          const merged = mergeQuantities(
            duplicateCheck.existingItem.quantity,
            duplicateCheck.existingItem.unit,
            candidate.suggestedQuantity,
            candidate.suggestedUnit
          );
          updatedItems = existingItems.map((it) =>
            it.id === duplicateCheck.existingItem!.id
              ? {
                  ...it,
                  quantity: merged.quantity,
                  unit: merged.unit,
                  planned_quantity: merged.quantity,
                  planned_unit: merged.unit,
                  completed: false,
                }
              : it
          );
        } else {
          const newItem: ShoppingItem = {
            id: generateUUID(),
            name: displayName,
            canonicalName: candidate.canonicalName,
            canonical_name: candidate.canonicalName,
            original_input: displayName,
            original_name: displayName,
            normalized_item: candidate.canonicalName,
            normalized_name: displayName.toLowerCase(),
            nameUrdu: candidate.nameUrdu,
            nameRomanUrdu: candidate.nameRomanUrdu,
            quantity: candidate.suggestedQuantity,
            unit: candidate.suggestedUnit,
            planned_quantity: candidate.suggestedQuantity,
            planned_unit: candidate.suggestedUnit,
            rawInput: `${candidate.suggestedQuantity ? candidate.suggestedQuantity + ' ' : ''}${candidate.suggestedUnit ? candidate.suggestedUnit + ' ' : ''}${displayName}`.trim(),
            categoryId: finalCategory,
            category: finalCategory,
            completed: false,
            confidence: 1.0,
            isRecognized: true,
            unresolved: false,
            emoji: candidate.emoji,
          };
          updatedItems = [newItem, ...existingItems];
        }

        const updatedList: ShoppingList = {
          ...targetList,
          items: updatedItems,
        };
        await handleUpdateList(updatedList);

        if (openShoppingMode) {
          setActiveListId(targetList.id);
          navigate(`/lists/${targetList.id}`);
        }
        return;
      }
    }

    // If no active list exists, create a fresh list
    const newListId = generateUUID();
    const newItem: ShoppingItem = {
      id: generateUUID(),
      name: displayName,
      canonicalName: candidate.canonicalName,
      canonical_name: candidate.canonicalName,
      original_input: displayName,
      original_name: displayName,
      normalized_item: candidate.canonicalName,
      normalized_name: displayName.toLowerCase(),
      nameUrdu: candidate.nameUrdu,
      nameRomanUrdu: candidate.nameRomanUrdu,
      quantity: candidate.suggestedQuantity,
      unit: candidate.suggestedUnit,
      planned_quantity: candidate.suggestedQuantity,
      planned_unit: candidate.suggestedUnit,
      rawInput: `${candidate.suggestedQuantity ? candidate.suggestedQuantity + ' ' : ''}${candidate.suggestedUnit ? candidate.suggestedUnit + ' ' : ''}${displayName}`.trim(),
      categoryId: finalCategory,
      category: finalCategory,
      completed: false,
      confidence: 1.0,
      isRecognized: true,
      unresolved: false,
      emoji: candidate.emoji,
    };

    const newList: ShoppingList = {
      id: newListId,
      userId: user.id,
      title: 'Shopping List',
      createdAt: 'Today',
      createdTimestamp: Date.now(),
      isCompleted: false,
      items: [newItem],
    };

    setLists((prev) => [newList, ...prev]);
    triggerMiloEvent('list_created');
    if (isConfigured) {
      await saveUserShoppingList(user.id, newList);
    }

    if (openShoppingMode) {
      setActiveListId(newListId);
      navigate(`/lists/${newListId}`);
    }
  };

  // Real Navigation Tab Switcher with Route Changes
  const handleTabChange = (tab: NavigationTab) => {
    if (!user) {
      saveIntendedDestination(`/${tab === 'lists' ? 'history' : tab}`);
      navigate('/auth');
      return;
    }

    if (tab === 'home') {
      navigate('/home');
    } else if (tab === 'create') {
      navigate('/create');
    } else if (tab === 'lists') {
      navigate('/history');
    } else if (tab === 'settings') {
      navigate('/settings');
    }
  };

  // Open Legal page with URL update
  const handleOpenLegalPage = (page: LegalPageType) => {
    navigate(buildCanonicalPath(page as AppRouteId));
  };

  const handleBackFromLegal = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      goBack();
    } else {
      navigate(user ? '/home' : '/auth');
    }
  };

  // Currently active list object
  const currentActiveList = useMemo(() => {
    if (!user) return null;
    const byParam = route.params?.listId ? lists.find((l) => l.id === route.params.listId) : null;
    if (byParam) return byParam;
    const bySessionParam = route.params?.sessionId
      ? lists.find((l) => l.completionSessionId === route.params.sessionId || l.id === route.params.sessionId)
      : null;
    if (bySessionParam) return bySessionParam;
    const byState = activeListId ? lists.find((l) => l.id === activeListId) : null;
    if (byState) return byState;
    return lists[0] || null;
  }, [user, route.params?.listId, route.params?.sessionId, lists, activeListId]);

  // Determine if bottom navigation bar should be visible
  const showBottomNav =
    (currentScreen === 'home' || currentScreen === 'history' || currentScreen === 'settings' || currentScreen === 'statistics') &&
    !!user &&
    !isPasswordResetRequiredActive;

  // Seamless launch & session restoration: show branded splash until session resolves
  if ((!hasSplashFinished || isAuthLoading) && currentScreen !== 'landing' && currentScreen !== 'rashan_list' && currentScreen !== 'shared_list' && !LEGAL_SCREENS.includes(currentScreen)) {
    return <SplashView onFinish={handleSplashFinish} isRestoringAuth={isAuthLoading && !user} />;
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col justify-between selection:bg-primary-container selection:text-on-primary-container">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentScreen}
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: slideX }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -slideX }}
          transition={
            shouldReduceMotion
              ? { duration: 0.15 }
              : { type: 'spring', stiffness: 520, damping: 40 }
          }
          className="flex-1 flex flex-col w-full"
        >
          <React.Suspense
            fallback={
              <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-[#005039] animate-spin" />
              </div>
            }
          >
            {(() => {
            if (currentScreen === 'landing') {
              return (
                <LandingPageView
                  user={user}
                  onGetStarted={() => {
                    if (user) {
                      navigate('/home');
                    } else {
                      saveIntendedDestination('/home');
                      navigate('/auth');
                    }
                  }}
                  onSignIn={() => {
                    saveIntendedDestination('/home');
                    navigate('/auth');
                  }}
                  onOpenLegalPage={handleOpenLegalPage}
                  onOpenRashanList={() => navigate('/rashan-list')}
                />
              );
            }

            if (currentScreen === 'blog_article') {
              return (
                <BlogArticlePage
                  slug={route.params?.slug}
                  onBack={() => navigate('/blog')}
                  onNavigate={(path) => navigate(path)}
                />
              );
            }

            if (currentScreen === 'shared_list') {
              return (
                <SharedListView
                  token={route.params?.token || ''}
                  onOpenApp={() => navigate(user ? '/home' : '/')}
                />
              );
            }

            if (LEGAL_SCREENS.includes(currentScreen)) {
              return (
                <LegalPageView
                  user={user}
                  initialPage={currentScreen as LegalPageType}
                  onBack={handleBackFromLegal}
                  onNavigate={handleOpenLegalPage}
                />
              );
            }

            if (currentScreen === 'rashan_list') {
              return (
                <RashanListPage
                  onBackToApp={() => {
                    navigate(user ? '/home' : '/');
                  }}
                  onOpenAppWithList={async (newList) => {
                    if (user) {
                      setLists((prev) => [newList, ...prev]);
                      triggerMiloEvent('list_created');
                      if (isConfigured) {
                        await saveUserShoppingList(user.id, newList);
                      }
                      setActiveListId(newList.id);
                      navigate(`/lists/${newList.id}`);
                    } else {
                      try {
                        localStorage.setItem('yaad_pending_imported_rashan_list', JSON.stringify(newList));
                      } catch {}
                      saveIntendedDestination(`/lists/${newList.id}`);
                      navigate('/auth');
                    }
                  }}
                  onNavigatePage={(path) => {
                    navigate(path);
                  }}
                />
              );
            }

            if (
              hasSplashFinished &&
              (isPasswordResetRequiredActive ||
                currentScreen === 'reset_password' ||
                route.routeId === 'reset_password')
            ) {
              return (
                <ResetPasswordView
                  onSuccess={() => {
                    replace('/home');
                  }}
                  onRequestNewLink={() => {
                    replace('/auth');
                  }}
                />
              );
            }

            if (
              hasSplashFinished &&
              !isPasswordResetRequiredActive &&
              currentScreen !== 'reset_password' &&
              route.routeId !== 'reset_password' &&
              (!user || isAuthSuccessShowing) &&
              !LEGAL_SCREENS.includes(currentScreen) &&
              currentScreen !== 'not_found'
            ) {
              return (
                <AuthView
                  onSuccess={() => {
                    setIsAuthSuccessShowing(false);
                    handleAuthSuccess();
                  }}
                  onSuccessDisplayChange={setIsAuthSuccessShowing}
                  onOpenLegalPage={handleOpenLegalPage}
                />
              );
            }

            if (hasSplashFinished && user && !isPasswordResetRequiredActive && currentScreen === 'profile_setup') {
              return <ProfileSetupView onComplete={handleProfileSetupComplete} />;
            }

            if (hasSplashFinished && user && !isPasswordResetRequiredActive && currentScreen === 'onboarding') {
              return <OnboardingView onComplete={handleOnboardingComplete} />;
            }

            if (hasSplashFinished && user && !isPasswordResetRequiredActive && currentScreen === 'home') {
              return (
                <HomeView
                  lists={lists}
                  isLoading={isLoadingLists}
                  error={listsFetchError}
                  onRetry={handleRetrySyncAndFetch}
                  onCreateList={handleStartCreateList}
                  onSelectList={handleOpenListInShoppingMode}
                  onContinueShopping={handleOpenListInShoppingMode}
                  onMarkComplete={handleCompleteTrip}
                  onReuseList={handleReuseList}
                  onOpenProfile={() => navigate('/settings')}
                  onOpenMenu={() => navigate('/settings')}
                  onOpenPhoneSettings={handleOpenPhoneInSettings}
                  onOpenHistory={() => navigate('/history')}
                  onEditList={handleEditList}
                  onDeleteList={handleDeleteList}
                  onQuickAddRecommendation={handleQuickAddRecommendation}
                  onOpenStatistics={() => navigate('/stats')}
                />
              );
            }

            if (hasSplashFinished && user && !isPasswordResetRequiredActive && currentScreen === 'create_list') {
              return (
                <CreateListView
                  onBack={() => navigate('/home')}
                  onCreateList={handleCreateListTitleSubmitted}
                  onContinue={handleCreateListTitleSubmitted}
                />
              );
            }

            if (hasSplashFinished && user && !isPasswordResetRequiredActive && currentScreen === 'add_items') {
              return (
                <AddItemsView
                  listTitle={tempNewListTitle || currentActiveList?.title || 'Shopping List'}
                  initialItems={currentActiveList?.items || []}
                  contextId={activeListContext || currentActiveList?.contextId}
                  onBack={() => {
                    if (typeof window !== 'undefined' && window.history.length > 1) {
                      goBack();
                    } else {
                      navigate('/create');
                    }
                  }}
                  onStartShopping={handleStartShoppingFromNewItems}
                  onItemsChange={handleItemsChangeInAddView}
                  onRenameList={(newTitle) => {
                    setTempNewListTitle(newTitle);
                    if (currentActiveList) {
                      handleUpdateList({
                        ...currentActiveList,
                        title: newTitle,
                      });
                    }
                  }}
                />
              );
            }

            if (hasSplashFinished && user && !isPasswordResetRequiredActive && isDeepLinkLoading) {
              return (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                  <p className="text-sm font-medium text-on-surface-variant">Loading shopping details...</p>
                </div>
              );
            }

            if (
              hasSplashFinished &&
              user &&
              !isPasswordResetRequiredActive &&
              !isDeepLinkLoading &&
              (deepLinkNotFound || deepLinkSessionNotFound)
            ) {
              return (
                <ListNotFoundView
                  type={deepLinkSessionNotFound ? 'session' : 'list'}
                  onGoHome={() => navigate('/home')}
                  onGoHistory={() => navigate('/history')}
                />
              );
            }

            if (
              hasSplashFinished &&
              user &&
              !isPasswordResetRequiredActive &&
              !isDeepLinkLoading &&
              !deepLinkNotFound &&
              currentScreen === 'shopping_list' &&
              currentActiveList
            ) {
              return (
                <ShoppingListView
                  list={currentActiveList}
                  onBack={() => navigate('/home')}
                  onUpdateList={handleUpdateList}
                  onCompleteTrip={handleCompleteTrip}
                  onEditList={handleEditList}
                  onDeleteList={handleDeleteList}
                  onOpenProfile={() => navigate('/settings')}
                  isCompletingTrip={isCompletingTrip}
                  completionError={completionError}
                  onClearCompletionError={() => setCompletionError(null)}
                />
              );
            }

            if (
              hasSplashFinished &&
              user &&
              !isPasswordResetRequiredActive &&
              currentScreen === 'completion' &&
              currentActiveList
            ) {
              return (
                <CompletionView
                  list={currentActiveList}
                  onReturnHome={() => {
                    setActiveListId(null);
                    navigate('/home');
                  }}
                  onViewHistory={handleFinishCompletion}
                  onAddMoreItems={() => navigate(`/lists/${currentActiveList.id}`)}
                  onOpenProfile={() => navigate('/settings')}
                  onStartNewList={handleStartCreateList}
                  onReviewTrip={() => navigate(`/lists/${currentActiveList.id}`)}
                />
              );
            }

            if (hasSplashFinished && user && !isPasswordResetRequiredActive && currentScreen === 'history') {
              return (
                <ListHistoryView
                  lists={lists}
                  isLoading={isLoadingLists}
                  error={listsFetchError}
                  onRetry={handleRetrySyncAndFetch}
                  onSelectList={handleOpenListDetails}
                  onCreateNewList={handleStartCreateList}
                  onContinueShopping={handleOpenListInShoppingMode}
                  onMarkComplete={handleCompleteTrip}
                  onDeleteList={handleDeleteList}
                  onDeleteMultipleLists={handleDeleteMultipleLists}
                  onClearAllHistory={handleClearAllHistory}
                  onReuseList={handleReuseList}
                  onOpenProfile={() => navigate('/settings')}
                  onOpenMenu={() => navigate('/settings')}
                  onBack={() => navigate('/home')}
                  isOnline={isOnline}
                />
              );
            }

            if (
              hasSplashFinished &&
              user &&
              !isPasswordResetRequiredActive &&
              !isDeepLinkLoading &&
              !deepLinkNotFound &&
              !deepLinkSessionNotFound &&
              currentScreen === 'list_details' &&
              currentActiveList
            ) {
              return (
                <ListDetailsView
                  list={currentActiveList}
                  onBack={() => navigate('/history')}
                  onReuseList={handleReuseList}
                  onContinueShopping={handleOpenListInShoppingMode}
                  onMarkComplete={handleCompleteTrip}
                  onEditList={handleEditList}
                  onDeleteList={handleDeleteList}
                  onOpenProfile={() => navigate('/settings')}
                />
              );
            }

            if (
              hasSplashFinished &&
              user &&
              !isPasswordResetRequiredActive &&
              !isDeepLinkLoading &&
              !deepLinkNotFound &&
              currentScreen === 'edit_list' &&
              currentActiveList
            ) {
              return (
                <EditListView
                  list={currentActiveList}
                  onBack={() => navigate(`/lists/${currentActiveList.id}`)}
                  onSave={handleSaveEditedList}
                  onDeleteList={handleDeleteList}
                  onOpenProfile={() => navigate('/settings')}
                />
              );
            }

            if (hasSplashFinished && user && !isPasswordResetRequiredActive && currentScreen === 'settings') {
              return (
                <SettingsView
                  subSection={route.params?.subSection as SettingsSubSection || null}
                  onSubSectionChange={(section) => navigate(`/settings/${section}`)}
                  onBack={() => navigate('/home')}
                  onSignOut={handleSignOut}
                  onDeleteAccount={handleDeleteAccount}
                  onOpenAuth={handleOpenAuth}
                  onReplayOnboarding={handleResetOnboarding}
                  onOpenLegalPage={handleOpenLegalPage}
                />
              );
            }

            if (hasSplashFinished && user && !isPasswordResetRequiredActive && currentScreen === 'statistics') {
              return (
                <StatisticsView
                  lists={lists}
                  isLoading={isLoadingLists}
                  error={listsFetchError}
                  onRetry={handleRetrySyncAndFetch}
                  onBack={() => navigate('/home')}
                  onCreateList={handleStartCreateList}
                  onSelectList={handleOpenListInShoppingMode}
                />
              );
            }

            if (hasSplashFinished && user && !isPasswordResetRequiredActive && currentScreen === 'notifications') {
              return <NotificationsView onBack={() => navigate('/home')} />;
            }

            if (hasSplashFinished && currentScreen === 'not_found') {
              return (
                <NotFoundView
                  attemptedPath={currentPath}
                  onGoHome={() => navigate(user ? '/home' : '/auth')}
                  onGoHistory={user ? () => navigate('/history') : undefined}
                  onGoBack={goBack}
                />
              );
            }

            return null;
          })()}
          </React.Suspense>
        </motion.div>
      </AnimatePresence>

      {/* Persistent Bottom Navigation */}
      {showBottomNav && (
        <BottomNavBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onCreateClick={handleStartCreateList}
        />
      )}

      {/* Floating Milo Companion Bubble (mini ~64px draggable over all screens) */}
      <MiloHost
        variant="mini"
        getPendingLists={getPendingLists}
        onOpenList={handleOpenListInShoppingMode}
      />

      {/* Smart Phone Number Completion Reminder Modal */}
      <PhoneNumberReminderModal
        isOpen={isPhoneReminderOpen && !isPasswordResetRequiredActive}
        onAddNumber={handleAddNumberReminder}
        onDismiss={handleDismissPhoneReminder}
      />

      {/* Auth Modal (Sign in / Sign up) */}
      <AuthModal
        isOpen={isAuthModalOpen && !isPasswordResetRequiredActive}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onOpenLegalPage={handleOpenLegalPage}
      />

      {/* Network Status Pill */}
      <NetworkStatusPill
        isOnline={isOnline}
        syncStatus={syncStatus}
        pendingCount={pendingCount}
        onSyncClick={triggerSync}
      />

      {/* Account Suspended Blocking Screen */}
      <SuspendedAccountModal
        isOpen={Boolean(user && profile?.is_suspended)}
        reason={profile?.suspend_reason}
        onSignOut={handleSignOut}
      />

      {/* PWA Update Notification */}
      <PWAUpdateNotification />
    </div>
  );
}

export default function App() {
  const [isAdminPath, setIsAdminPath] = useState(() => {
    return typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  });

  useEffect(() => {
    const handlePopState = () => {
      setIsAdminPath(typeof window !== 'undefined' && window.location.pathname.startsWith('/admin'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (isAdminPath) {
    return (
      <ErrorBoundary>
        <React.Suspense
          fallback={
            <div className="min-h-screen bg-[#1c2826] flex flex-col items-center justify-center p-8">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
              <p className="text-sm font-medium text-emerald-400">Loading YAAD Administration...</p>
            </div>
          }
        >
          <AdminApp />
        </React.Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <RouterProvider>
        <HeadManager />
        <AppContent />
      </RouterProvider>
    </ErrorBoundary>
  );
}
