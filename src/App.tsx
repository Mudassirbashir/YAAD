import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ShoppingList, ShoppingItem, ScreenType, NavigationTab } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SplashView } from './components/SplashView';
import { OnboardingView } from './components/OnboardingView';
import { AuthView } from './components/AuthView';
import { ProfileSetupView } from './components/ProfileSetupView';
import { ResetPasswordView } from './components/ResetPasswordView';
import { HomeView } from './components/HomeView';
import { CreateListView } from './components/CreateListView';
import { AddItemsView } from './components/AddItemsView';
import { ShoppingListView } from './components/ShoppingListView';
import { CompletionView } from './components/CompletionView';
import { ListHistoryView } from './components/ListHistoryView';
import { ListDetailsView } from './components/ListDetailsView';
import { EditListView } from './components/EditListView';
import { SettingsView } from './components/SettingsView';
import { StatisticsView } from './components/StatisticsView';
import { NotFoundView } from './components/NotFoundView';
import { ListNotFoundView } from './components/ListNotFoundView';
import { BottomNavBar } from './components/BottomNavBar';
import { AuthModal } from './components/AuthModal';
import { ProductTour } from './components/ProductTour';
import { PhoneNumberReminderModal } from './components/PhoneNumberReminderModal';
import { usePhoneNumberReminder } from './hooks/usePhoneNumberReminder';
import { useAuth } from './context/AuthContext';
import { RouterProvider, useAppRouter } from './router/RouterContext';
import { AppRouteId, SettingsSubSection } from './router/routes';
import { generateUUID } from './lib/uuid';
import {
  loadUserShoppingLists,
  saveUserShoppingList,
  deleteUserShoppingList,
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
import { LegalPageView } from './components/legal/LegalPageView';
import { LegalPageType } from './components/legal/legalContent';
import { RashanListPage } from './components/rashan/RashanListPage';
import { HeadManager } from './seo/HeadManager';

const STORAGE_ONBOARDED_KEY = 'yaad_has_onboarded_v2';
const STORAGE_PROFILE_SETUP_KEY = 'yaad_profile_setup_done';
const STORAGE_TOUR_KEY = 'yaad_tour_completed_v2';
const getStorageKey = (userId?: string | null) => {
  return userId ? `yaad_shopping_lists_u_${userId}` : 'yaad_shopping_lists_guest';
};

const LEGAL_SCREENS: ScreenType[] = ['terms', 'privacy', 'about', 'help', 'legal'];

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

  // Interactive Product Tour state
  const [isTourActive, setIsTourActive] = useState<boolean>(false);

  // Phone Number reminder state (auto-navigate to Settings with phone input open)
  const [focusPhoneInSettings, setFocusPhoneInSettings] = useState<boolean>(false);

  const handleOpenPhoneInSettings = useCallback(() => {
    setFocusPhoneInSettings(true);
    navigate('/settings/profile');
  }, [navigate]);

  const hasOnboardedFlag = typeof window !== 'undefined'
    ? localStorage.getItem(STORAGE_ONBOARDED_KEY) === 'true'
    : true;

  // Derive current screen from route
  const currentScreen: ScreenType = useMemo((): ScreenType => {
    if (!hasSplashFinished) return 'splash';
    if (isPasswordResetRequiredActive) return 'reset_password';

    switch (route.routeId) {
      case 'root':
        return user ? 'home' : 'auth';
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
      case 'terms':
        return 'terms';
      case 'privacy':
        return 'privacy';
      case 'about':
        return 'about';
      case 'help':
        return 'help';
      case 'legal':
        return 'legal';
      case 'rashan_list':
        return 'rashan_list';
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
    isTourActive,
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

  // Initialize Master Item Catalog on startup
  useEffect(() => {
    supabaseCatalog.initialize();
  }, []);

  // Initialize personalized recommendation behavior model for user
  useEffect(() => {
    recommendationService.initialize(user?.id || 'guest');
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

      // Check if list is already present in loaded lists
      const foundInCache = lists.some((l) => l.id === routeListId);
      if (!foundInCache && !isLoadingLists) {
        setIsDeepLinkLoading(true);
        fetchSingleShoppingList(user.id, routeListId)
          .then(({ list, error }) => {
            if (error || !list) {
              setDeepLinkNotFound(true);
            } else {
              setLists((prev) => [list, ...prev.filter((l) => l.id !== list.id)]);
              setDeepLinkNotFound(false);
            }
          })
          .catch(() => {
            setDeepLinkNotFound(true);
          })
          .finally(() => {
            setIsDeepLinkLoading(false);
          });
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
        // Attempt load
        setIsDeepLinkLoading(true);
        fetchSingleShoppingList(user.id, routeSessionId)
          .then(({ list, error }) => {
            if (error || !list) {
              setDeepLinkSessionNotFound(true);
            } else {
              setLists((prev) => [list, ...prev.filter((l) => l.id !== list.id)]);
              setActiveListId(list.id);
              setDeepLinkSessionNotFound(false);
            }
          })
          .catch(() => {
            setDeepLinkSessionNotFound(true);
          })
          .finally(() => {
            setIsDeepLinkLoading(false);
          });
      }
    } else {
      setDeepLinkSessionNotFound(false);
    }
  }, [route.routeId, route.params?.listId, route.params?.sessionId, user, lists, isLoadingLists]);

  // ===========================================================================
  // PRODUCTION ROUTE GUARDS & INTENDED DESTINATION ENGINE
  // ===========================================================================
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
    if (user) {
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

      // Check if product tour should start
      const tourDone = localStorage.getItem(STORAGE_TOUR_KEY) === 'true';
      if (!tourDone && !isExistingAccount) {
        setIsTourActive(true);
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

    const tourDone = localStorage.getItem(STORAGE_TOUR_KEY) === 'true';
    if (!tourDone) {
      setIsTourActive(true);
    }
  };

  // Handle onboarding completion
  const handleOnboardingComplete = (startTour?: boolean) => {
    localStorage.setItem(STORAGE_ONBOARDED_KEY, 'true');
    const intended = getIntendedDestination();
    if (intended) {
      clearIntendedDestination();
      replace(intended);
    } else {
      replace('/home');
    }

    if (startTour !== false) {
      const tourDone = localStorage.getItem(STORAGE_TOUR_KEY) === 'true';
      if (!tourDone || startTour === true) {
        setIsTourActive(true);
      }
    }
  };

  // Handle tour completion / skip
  const handleTourComplete = () => {
    localStorage.setItem(STORAGE_TOUR_KEY, 'true');
    setIsTourActive(false);
  };

  const handleTourSkip = () => {
    localStorage.setItem(STORAGE_TOUR_KEY, 'true');
    setIsTourActive(false);
  };

  // Replay tour from Settings
  const handleRestartTour = () => {
    localStorage.removeItem(STORAGE_TOUR_KEY);
    setIsTourActive(true);
    navigate('/home');
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
      const intended = getIntendedDestination();
      if (intended) {
        clearIntendedDestination();
        replace(intended);
      } else {
        replace('/home');
      }
      const tourDone = localStorage.getItem(STORAGE_TOUR_KEY) === 'true';
      if (!tourDone) {
        setIsTourActive(true);
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
      const persistResult = await persistCompletedShoppingSession(user.id, completedList, stableSessionId);

      if (!persistResult.success) {
        console.error('Failed to persist completed shopping session to Supabase:', persistResult.error);
        setCompletionError(
          persistResult.error?.message || 'Unable to save completed shopping session. Please check your connection and try again.'
        );
        return;
      }

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

      // Transition to completion view
      navigate(`/history/${stableSessionId}`);
    } catch (err: any) {
      console.error('Exception completing trip:', err);
      setCompletionError(
        err?.message || 'Unable to save completed shopping session. Please check your connection and try again.'
      );
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

    if (isConfigured) {
      await deleteUserShoppingList(user.id, listId);
    }
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
      setFocusPhoneInSettings(false);
      navigate('/settings');
    }
  };

  // Open Legal page with URL update
  const handleOpenLegalPage = (page: LegalPageType) => {
    navigate(`/${page}`);
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
  if ((!hasSplashFinished || isAuthLoading) && currentScreen !== 'rashan_list' && !LEGAL_SCREENS.includes(currentScreen)) {
    return <SplashView onFinish={handleSplashFinish} isRestoringAuth={isAuthLoading && !user} />;
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col justify-between selection:bg-primary-container selection:text-on-primary-container">
      {/* 1. Public Dedicated Legal & Information Pages */}
      {LEGAL_SCREENS.includes(currentScreen) && (
        <LegalPageView
          initialPage={currentScreen as LegalPageType}
          onBack={handleBackFromLegal}
          onNavigate={handleOpenLegalPage}
        />
      )}

      {/* 1b. Public Dedicated Monthly Rashan List Page */}
      {currentScreen === 'rashan_list' && (
        <RashanListPage
          onBackToApp={() => {
            navigate(user ? '/home' : '/');
          }}
          onOpenAppWithList={async (newList) => {
            setLists((prev) => [newList, ...prev]);
            if (user && isConfigured) {
              await saveUserShoppingList(user.id, newList);
            }
            setActiveListId(newList.id);
            navigate(`/lists/${newList.id}`);
          }}
          onNavigatePage={(path) => {
            navigate(path);
          }}
        />
      )}

      {/* 2. Splash Screen on Launch */}
      {!hasSplashFinished && currentScreen !== 'rashan_list' && (
        <SplashView onFinish={handleSplashFinish} />
      )}

      {/* 3. Password Reset Screen - Strict Gate */}
      {hasSplashFinished &&
        (isPasswordResetRequiredActive ||
          currentScreen === 'reset_password' ||
          route.routeId === 'reset_password') && (
          <ResetPasswordView
            onSuccess={() => {
              replace('/home');
            }}
            onRequestNewLink={() => {
              replace('/auth');
            }}
          />
        )}

      {/* 4. Public Unauthenticated View */}
      {hasSplashFinished &&
        !isPasswordResetRequiredActive &&
        currentScreen !== 'reset_password' &&
        route.routeId !== 'reset_password' &&
        !user &&
        !LEGAL_SCREENS.includes(currentScreen) &&
        currentScreen !== 'not_found' &&
        currentScreen !== 'rashan_list' && (
          <AuthView
            onSuccess={handleAuthSuccess}
            onOpenLegalPage={handleOpenLegalPage}
          />
        )}

      {/* 5. Profile Setup */}
      {hasSplashFinished && user && !isPasswordResetRequiredActive && currentScreen === 'profile_setup' && (
        <ProfileSetupView onComplete={handleProfileSetupComplete} />
      )}

      {/* 6. Onboarding */}
      {hasSplashFinished && user && !isPasswordResetRequiredActive && currentScreen === 'onboarding' && (
        <OnboardingView onComplete={handleOnboardingComplete} />
      )}

      {/* 7. Home View */}
      {hasSplashFinished && user && !isPasswordResetRequiredActive && currentScreen === 'home' && (
        <HomeView
          lists={lists}
          isLoading={isLoadingLists}
          error={listsFetchError}
          onRetry={() => fetchShoppingLists(user?.id || null)}
          onCreateList={handleStartCreateList}
          onSelectList={handleOpenListInShoppingMode}
          onContinueShopping={handleOpenListInShoppingMode}
          onMarkComplete={handleCompleteTrip}
          onReuseList={handleReuseList}
          onOpenProfile={() => navigate('/settings/profile')}
          onOpenMenu={() => navigate('/settings')}
          onOpenPhoneSettings={handleOpenPhoneInSettings}
          onOpenHistory={() => navigate('/history')}
          onEditList={handleEditList}
          onDeleteList={handleDeleteList}
          onQuickAddRecommendation={handleQuickAddRecommendation}
          onOpenStatistics={() => navigate('/stats')}
        />
      )}

      {/* 8. Create List View */}
      {hasSplashFinished && user && !isPasswordResetRequiredActive && currentScreen === 'create_list' && (
        <CreateListView
          onBack={() => navigate('/home')}
          onCreateList={handleCreateListTitleSubmitted}
          onContinue={handleCreateListTitleSubmitted}
        />
      )}

      {/* 9. Add Items View */}
      {hasSplashFinished && user && !isPasswordResetRequiredActive && currentScreen === 'add_items' && (
        <AddItemsView
          listTitle={tempNewListTitle || currentActiveList?.title || 'Shopping List'}
          initialItems={currentActiveList?.items || []}
          contextId={activeListContext || currentActiveList?.contextId}
          onBack={() => navigate('/home')}
          onStartShopping={handleStartShoppingFromNewItems}
          onItemsChange={handleItemsChangeInAddView}
        />
      )}

      {/* 10. Deep Link Loading State */}
      {hasSplashFinished && user && !isPasswordResetRequiredActive && isDeepLinkLoading && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-sm font-medium text-on-surface-variant">Loading shopping details...</p>
        </div>
      )}

      {/* 11. Deep Link Not Found / Private List Protected Screen */}
      {hasSplashFinished && user && !isPasswordResetRequiredActive && !isDeepLinkLoading && (deepLinkNotFound || deepLinkSessionNotFound) && (
        <ListNotFoundView
          type={deepLinkSessionNotFound ? 'session' : 'list'}
          onGoHome={() => navigate('/home')}
          onGoHistory={() => navigate('/history')}
        />
      )}

      {/* 12. Shopping List View (Active shopping mode) */}
      {hasSplashFinished && user && !isPasswordResetRequiredActive && !isDeepLinkLoading && !deepLinkNotFound && currentScreen === 'shopping_list' && currentActiveList && (
        <ShoppingListView
          list={currentActiveList}
          onBack={() => navigate('/home')}
          onUpdateList={handleUpdateList}
          onCompleteTrip={handleCompleteTrip}
          onEditList={handleEditList}
          onOpenProfile={() => navigate('/settings/profile')}
          isCompletingTrip={isCompletingTrip}
          completionError={completionError}
          onClearCompletionError={() => setCompletionError(null)}
        />
      )}

      {/* 13. Completion View */}
      {hasSplashFinished && user && !isPasswordResetRequiredActive && currentScreen === 'completion' && currentActiveList && (
        <CompletionView
          list={currentActiveList}
          onReturnHome={() => {
            setActiveListId(null);
            navigate('/home');
          }}
          onViewHistory={handleFinishCompletion}
          onAddMoreItems={() => navigate(`/lists/${currentActiveList.id}`)}
          onOpenProfile={() => navigate('/settings/profile')}
          onStartNewList={handleStartCreateList}
          onReviewTrip={() => navigate(`/lists/${currentActiveList.id}`)}
        />
      )}

      {/* 14. History View */}
      {hasSplashFinished && user && !isPasswordResetRequiredActive && currentScreen === 'history' && (
        <ListHistoryView
          lists={lists}
          isLoading={isLoadingLists}
          error={listsFetchError}
          onRetry={() => fetchShoppingLists(user?.id || null)}
          onSelectList={handleOpenListDetails}
          onCreateNewList={handleStartCreateList}
          onContinueShopping={handleOpenListInShoppingMode}
          onMarkComplete={handleCompleteTrip}
          onDeleteList={handleDeleteList}
          onReuseList={handleReuseList}
          onOpenProfile={() => navigate('/settings/profile')}
          onOpenMenu={() => navigate('/settings')}
          onBack={() => navigate('/home')}
          isOnline={isOnline}
        />
      )}

      {/* 15. List Details View (or History Session View) */}
      {hasSplashFinished && user && !isPasswordResetRequiredActive && !isDeepLinkLoading && !deepLinkNotFound && !deepLinkSessionNotFound && currentScreen === 'list_details' && currentActiveList && (
        <ListDetailsView
          list={currentActiveList}
          onBack={() => navigate('/history')}
          onReuseList={handleReuseList}
          onContinueShopping={handleOpenListInShoppingMode}
          onMarkComplete={handleCompleteTrip}
          onEditList={handleEditList}
          onDeleteList={handleDeleteList}
          onOpenProfile={() => navigate('/settings/profile')}
        />
      )}

      {/* 16. Edit List View */}
      {hasSplashFinished && user && !isPasswordResetRequiredActive && !isDeepLinkLoading && !deepLinkNotFound && currentScreen === 'edit_list' && currentActiveList && (
        <EditListView
          list={currentActiveList}
          onBack={() => navigate(`/lists/${currentActiveList.id}`)}
          onSave={handleSaveEditedList}
          onOpenProfile={() => navigate('/settings/profile')}
        />
      )}

      {/* 17. Settings View (with direct SubSection navigation) */}
      {hasSplashFinished && user && !isPasswordResetRequiredActive && currentScreen === 'settings' && (
        <SettingsView
          initialEditPhone={focusPhoneInSettings || route.params?.subSection === 'profile'}
          subSection={route.params?.subSection as SettingsSubSection || null}
          onSubSectionChange={(section) => navigate(`/settings/${section}`)}
          onBack={() => {
            setFocusPhoneInSettings(false);
            navigate('/home');
          }}
          onSignOut={handleSignOut}
          onDeleteAccount={handleDeleteAccount}
          onOpenAuth={handleOpenAuth}
          onRestartTour={handleRestartTour}
          onReplayOnboarding={handleResetOnboarding}
          onOpenLegalPage={handleOpenLegalPage}
        />
      )}

      {/* 18. Statistics View */}
      {hasSplashFinished && user && !isPasswordResetRequiredActive && currentScreen === 'statistics' && (
        <StatisticsView
          lists={lists}
          isLoading={isLoadingLists}
          error={listsFetchError}
          onRetry={() => fetchShoppingLists(user?.id || null)}
          onBack={() => navigate('/home')}
          onCreateList={handleStartCreateList}
          onSelectList={handleOpenListInShoppingMode}
        />
      )}

      {/* 19. 404 Page Not Found View */}
      {hasSplashFinished && currentScreen === 'not_found' && (
        <NotFoundView
          attemptedPath={currentPath}
          onGoHome={() => navigate(user ? '/home' : '/auth')}
          onGoHistory={user ? () => navigate('/history') : undefined}
          onGoBack={goBack}
        />
      )}

      {/* Persistent Bottom Navigation */}
      {showBottomNav && (
        <BottomNavBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onCreateClick={handleStartCreateList}
        />
      )}

      {/* Interactive Product Tour */}
      <ProductTour
        isActive={isTourActive && currentScreen === 'home' && !isPasswordResetRequiredActive}
        onComplete={handleTourComplete}
        onSkip={handleTourSkip}
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

      {/* PWA Update Notification */}
      <PWAUpdateNotification />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <RouterProvider>
        <HeadManager />
        <AppContent />
      </RouterProvider>
    </ErrorBoundary>
  );
}
