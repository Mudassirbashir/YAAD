import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingList, ShoppingItem, ScreenType, NavigationTab } from './types';
import { SplashView } from './components/SplashView';
import { OnboardingView } from './components/OnboardingView';
import { AuthView } from './components/AuthView';
import { ProfileSetupView } from './components/ProfileSetupView';
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
import { BottomNavBar } from './components/BottomNavBar';
import { AuthModal } from './components/AuthModal';
import { ProductTour } from './components/ProductTour';
import { PhoneNumberReminderModal } from './components/PhoneNumberReminderModal';
import { usePhoneNumberReminder } from './hooks/usePhoneNumberReminder';
import { useAuth } from './context/AuthContext';
import { generateUUID } from './lib/uuid';
import {
  loadUserShoppingLists,
  saveUserShoppingList,
  deleteUserShoppingList,
  clearAllUserShoppingLists,
  setupNetworkSyncListener,
  recordCompletedShoppingTrip,
  persistCompletedShoppingSession,
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

const STORAGE_ONBOARDED_KEY = 'yaad_has_onboarded_v2';
const STORAGE_PROFILE_SETUP_KEY = 'yaad_profile_setup_done';
const STORAGE_TOUR_KEY = 'yaad_tour_completed_v2';
const getStorageKey = (userId?: string | null) => {
  return userId ? `yaad_shopping_lists_u_${userId}` : 'yaad_shopping_lists_guest';
};

const LEGAL_SCREENS: ScreenType[] = ['terms', 'privacy', 'about', 'help', 'legal'];

function parseScreenFromUrl(): ScreenType | null {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  if (path === '/terms' || path === '/terms-and-conditions' || hash === '#terms' || hash === '#/terms') return 'terms';
  if (path === '/privacy' || path === '/privacy-policy' || hash === '#privacy' || hash === '#/privacy') return 'privacy';
  if (path === '/about' || path === '/about-us' || hash === '#about' || hash === '#/about') return 'about';
  if (path === '/help' || path === '/support' || path === '/contact' || hash === '#help' || hash === '#/help') return 'help';
  if (path === '/legal' || hash === '#legal' || hash === '#/legal') return 'legal';
  return null;
}

export default function App() {
  const { user, profile, isLoading: isAuthLoading, isConfigured, deleteAccount, signOut } = useAuth();

  // Screen and navigation state
  const initialUrlScreen = parseScreenFromUrl();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(initialUrlScreen || 'splash');
  const [previousScreenBeforeLegal, setPreviousScreenBeforeLegal] = useState<ScreenType>('home');
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');

  // Active working list
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [tempNewListTitle, setTempNewListTitle] = useState<string>('');

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  // Interactive Product Tour state
  const [isTourActive, setIsTourActive] = useState<boolean>(false);

  // Phone Number reminder state (auto-navigate to Settings with phone input open)
  const [focusPhoneInSettings, setFocusPhoneInSettings] = useState<boolean>(false);

  const handleOpenPhoneInSettings = useCallback(() => {
    setFocusPhoneInSettings(true);
    setCurrentScreen('settings');
    setActiveTab('settings');
  }, []);

  const hasOnboardedFlag = typeof window !== 'undefined'
    ? localStorage.getItem(STORAGE_ONBOARDED_KEY) === 'true'
    : true;

  // Smart Phone-Number Completion Reminder (intelligently reminds email users without phone)
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

  // Synchronize browser URL bar and back/forward history for legal pages
  useEffect(() => {
    const handleUrlChange = () => {
      const urlScreen = parseScreenFromUrl();
      if (urlScreen) {
        setCurrentScreen(urlScreen);
      } else if (LEGAL_SCREENS.includes(currentScreen)) {
        setCurrentScreen(user ? 'home' : 'auth');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [user, currentScreen]);

  const handleOpenLegalPage = useCallback((page: LegalPageType) => {
    if (!LEGAL_SCREENS.includes(currentScreen)) {
      setPreviousScreenBeforeLegal(currentScreen);
    }
    setCurrentScreen(page);
    try {
      window.history.pushState({ page }, '', `/${page}`);
    } catch {
      window.location.hash = `#/${page}`;
    }
  }, [currentScreen]);

  const handleBackFromLegal = useCallback(() => {
    if (previousScreenBeforeLegal && !LEGAL_SCREENS.includes(previousScreenBeforeLegal)) {
      setCurrentScreen(previousScreenBeforeLegal);
    } else {
      setCurrentScreen(user ? 'home' : 'auth');
    }
    try {
      window.history.pushState(null, '', '/');
    } catch {
      window.location.hash = '';
    }
  }, [previousScreenBeforeLegal, user]);

  // Authentication Gate Router: Enforce protected screen flow
  useEffect(() => {
    if (isAuthLoading) return; // Wait until auth state is resolved to avoid flicker

    if (currentScreen === 'splash') return;

    // Public legal & information pages are always accessible without auth!
    if (LEGAL_SCREENS.includes(currentScreen)) return;

    // 1. If user is NOT authenticated, redirect to auth screen
    if (!user) {
      if (currentScreen !== 'auth') {
        setCurrentScreen('auth');
      }
      return;
    }

    // 2. User is authenticated -> check first-time profile setup
    const hasSetupLocal = localStorage.getItem(STORAGE_PROFILE_SETUP_KEY) === 'true';
    const isSetupComplete = profile?.has_completed_setup || (hasSetupLocal && !!profile?.full_name);

    if (!isSetupComplete && (!profile?.full_name || profile.full_name.trim() === '')) {
      if (currentScreen !== 'profile_setup') {
        setCurrentScreen('profile_setup');
      }
      return;
    }

    // 3. User is authenticated & profile setup complete -> Check First-Time Onboarding
    const hasOnboarded = localStorage.getItem(STORAGE_ONBOARDED_KEY) === 'true';
    if (!hasOnboarded) {
      if (currentScreen !== 'onboarding') {
        setCurrentScreen('onboarding');
      }
      return;
    }

    // 4. Authenticated, profile set up & onboarded -> if currently on auth/onboarding/profile_setup, go to home
    if (currentScreen === 'auth' || currentScreen === 'onboarding' || currentScreen === 'profile_setup') {
      setCurrentScreen('home');
      setActiveTab('home');

      // Check if product tour has been completed before
      const tourDone = localStorage.getItem(STORAGE_TOUR_KEY) === 'true';
      if (!tourDone) {
        setIsTourActive(true);
      }
    }
  }, [user, profile, isAuthLoading, currentScreen]);

  // Handle splash completion
  const handleSplashFinish = () => {
    const urlScreen = parseScreenFromUrl();
    if (urlScreen) {
      setCurrentScreen(urlScreen);
      return;
    }

    if (!user) {
      setCurrentScreen('auth');
      return;
    }
    const hasSetup = profile?.has_completed_setup || localStorage.getItem(STORAGE_PROFILE_SETUP_KEY) === 'true';
    if (!hasSetup && (!profile?.full_name || profile.full_name.trim() === '')) {
      setCurrentScreen('profile_setup');
      return;
    }
    const hasOnboarded = localStorage.getItem(STORAGE_ONBOARDED_KEY) === 'true';
    if (!hasOnboarded) {
      setCurrentScreen('onboarding');
      return;
    }
    setCurrentScreen('home');
    const tourDone = localStorage.getItem(STORAGE_TOUR_KEY) === 'true';
    if (!tourDone) {
      setIsTourActive(true);
    }
  };

  // Handle onboarding completion
  const handleOnboardingComplete = (startTour?: boolean) => {
    localStorage.setItem(STORAGE_ONBOARDED_KEY, 'true');
    setCurrentScreen('home');
    setActiveTab('home');
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
    setCurrentScreen('home');
    setActiveTab('home');
  };

  // Handle successful login/signup from AuthView
  const handleAuthSuccess = () => {
    const hasSetup = profile?.has_completed_setup || localStorage.getItem(STORAGE_PROFILE_SETUP_KEY) === 'true';
    if (!hasSetup && (!profile?.full_name || profile.full_name.trim() === '')) {
      setCurrentScreen('profile_setup');
      return;
    }
    const hasOnboarded = localStorage.getItem(STORAGE_ONBOARDED_KEY) === 'true';
    if (!hasOnboarded) {
      setCurrentScreen('onboarding');
      return;
    }
    setCurrentScreen('home');
  };

  // Handle profile setup completion
  const handleProfileSetupComplete = () => {
    localStorage.setItem(STORAGE_PROFILE_SETUP_KEY, 'true');
    const hasOnboarded = localStorage.getItem(STORAGE_ONBOARDED_KEY) === 'true';
    if (!hasOnboarded) {
      setCurrentScreen('onboarding');
    } else {
      setCurrentScreen('home');
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
    setCurrentScreen('onboarding');
  };

  // Clear all data (for testing empty state or user data deletion)
  const handleClearAllData = async () => {
    try {
      const storageKey = getStorageKey(user?.id);
      localStorage.removeItem(storageKey);
      if (user && isConfigured) {
        await clearAllUserShoppingLists(user.id);
      }
      await recommendationService.clearUserData(user?.id);
    } catch (e) {
      console.error('Error clearing data:', e);
    }
    setLists([]);
    setActiveListId(null);
    setCurrentScreen('home');
    setActiveTab('home');
  };

  // Complete Account Deletion Handler with immediate session termination and redirection
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
    // Wipe all local states immediately
    setLists([]);
    setActiveListId(null);
    // Redirect to auth screen so unauthenticated user cannot access home
    setCurrentScreen('auth');
    setActiveTab('home');
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
    setCurrentScreen('auth');
    setActiveTab('home');
  };

  // Open Auth modal helper
  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Create list flow
  const handleStartCreateList = () => {
    if (!user) {
      setCurrentScreen('auth');
      return;
    }
    setCurrentScreen('create_list');
  };

  const handleCreateListTitleSubmitted = async (title: string, icon?: string) => {
    if (!user) {
      setCurrentScreen('auth');
      return;
    }
    const cleanTitle = title.trim() || 'Shopping List';
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
    };

    // Update local state immediately
    setLists((prev) => [newList, ...prev]);
    setActiveListId(newListId);
    setTempNewListTitle(cleanTitle);
    setCurrentScreen('add_items');

    // Persist to Supabase immediately through existing persistence architecture
    if (isConfigured) {
      await saveUserShoppingList(user.id, newList);
    }
  };

  const handleStartShoppingFromNewItems = async (items: ShoppingItem[]) => {
    if (!user) {
      setCurrentScreen('auth');
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
    };

    // Update local state immediately
    setLists((prev) => {
      const exists = prev.some((l) => l.id === targetId);
      if (exists) {
        return prev.map((l) => (l.id === targetId ? updatedList : l));
      }
      return [updatedList, ...prev];
    });
    setActiveListId(targetId);
    setTempNewListTitle('');
    setCurrentScreen('shopping_list');

    // Persist to Supabase if authenticated
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

  // View / Edit / Complete actions
  const handleOpenListInShoppingMode = (listOrId: ShoppingList | string) => {
    if (!user) {
      setCurrentScreen('auth');
      return;
    }
    const targetId = typeof listOrId === 'string' ? listOrId : listOrId.id;
    setActiveListId(targetId);
    setCurrentScreen('shopping_list');
  };

  const handleOpenListDetails = (listOrId: ShoppingList | string) => {
    if (!user) {
      setCurrentScreen('auth');
      return;
    }
    const targetId = typeof listOrId === 'string' ? listOrId : listOrId.id;
    setActiveListId(targetId);
    setCurrentScreen('list_details');
  };

  const handleEditList = (listOrId: ShoppingList | string) => {
    if (!user) {
      setCurrentScreen('auth');
      return;
    }
    const targetId = typeof listOrId === 'string' ? listOrId : listOrId.id;
    setActiveListId(targetId);
    setCurrentScreen('edit_list');
  };

  const handleUpdateList = async (updatedList: ShoppingList) => {
    if (!user) {
      setCurrentScreen('auth');
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
      setCurrentScreen('auth');
      return;
    }
    const targetId = typeof listOrId === 'string' ? listOrId : listOrId.id;
    const target = typeof listOrId === 'object' ? listOrId : lists.find((l) => l.id === targetId);
    if (!target) return;

    // Prevent duplicate triggers if animation or tap occurs twice
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
      // 1. CRITICAL: Persist to Supabase BEFORE treating as permanently completed
      const persistResult = await persistCompletedShoppingSession(user.id, completedList, stableSessionId);

      if (!persistResult.success) {
        // If database write fails: DO NOT falsely show successful completion!
        console.error('Failed to persist completed shopping session to Supabase:', persistResult.error);
        setCompletionError(
          persistResult.error?.message || 'Unable to save completed shopping session. Please check your connection and try again.'
        );
        return;
      }

      // 2. Database write succeeded! Update state with real persisted data
      setLists((prev) => prev.map((l) => (l.id === targetId ? completedList : l)));
      setActiveListId(targetId);

      // Strong Purchase Signal: Record completed items in personal recommendation engine
      if (completedList.items && completedList.items.length > 0) {
        recommendationService.recordCompletedTrip(completedList.items).catch((err) => {
          console.warn('Error recording trip to recommendation engine:', err);
        });

        // Asynchronously record items to user_item_history for future personalization
        completedList.items
          .filter((it) => it.completed)
          .forEach((it) => {
            const itemId = it.canonicalName ? it.canonicalName.toLowerCase().replace(/\s+/g, '_') : it.name.toLowerCase().replace(/\s+/g, '_');
            supabaseCatalog.recordUserPurchase(user.id, itemId, it.quantity);
          });
      }

      // 3. Smoothly transition to the completion screen
      setCurrentScreen('completion');
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
    if (!user) {
      setCurrentScreen('auth');
      return;
    }
    setActiveListId(null);
    setCurrentScreen('history');
    setActiveTab('lists');
  };

  const handleReuseList = async (listOrId: ShoppingList | string) => {
    if (!user) {
      setCurrentScreen('auth');
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
    setCurrentScreen('shopping_list');

    if (isConfigured) {
      await saveUserShoppingList(user.id, duplicatedList);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!user) {
      setCurrentScreen('auth');
      return;
    }
    setLists((prev) => prev.filter((l) => l.id !== listId));
    if (activeListId === listId) {
      setActiveListId(null);
    }
    setCurrentScreen('history');

    if (isConfigured) {
      await deleteUserShoppingList(user.id, listId);
    }
  };

  const handleSaveEditedList = async (savedList: ShoppingList) => {
    if (!user) {
      setCurrentScreen('auth');
      return;
    }
    await handleUpdateList(savedList);
    setCurrentScreen('shopping_list');
  };

  // One-tap quick add from Personal Recommendations on Home Screen
  const handleQuickAddRecommendation = async (
    candidate: RecommendationCandidate,
    targetListId?: string
  ) => {
    if (!user) {
      setCurrentScreen('auth');
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
        return;
      }
    }

    // If no active list exists, create a fresh list containing this item
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
  };

  // Navigation tab switcher
  const handleTabChange = (tab: NavigationTab) => {
    if (!user) {
      setCurrentScreen('auth');
      return;
    }
    setActiveTab(tab);
    if (tab === 'home') {
      setCurrentScreen('home');
      setFocusPhoneInSettings(false);
    } else if (tab === 'create') {
      handleStartCreateList();
    } else if (tab === 'lists') {
      setCurrentScreen('history');
      setFocusPhoneInSettings(false);
    } else if (tab === 'settings') {
      setFocusPhoneInSettings(false);
      setCurrentScreen('settings');
    }
  };

  const handleOpenSettingsScreen = () => {
    if (!user) {
      setCurrentScreen('auth');
      return;
    }
    setFocusPhoneInSettings(false);
    setCurrentScreen('settings');
    setActiveTab('settings');
  };

  // Currently active list object (only available for authenticated users)
  const currentActiveList = user ? (lists.find((l) => l.id === activeListId) || lists[0] || null) : null;

  // Fallback if user is currently on a list-dependent screen but the list is missing/empty
  useEffect(() => {
    if (
      ['shopping_list', 'completion', 'list_details', 'edit_list'].includes(currentScreen) &&
      !isLoadingLists &&
      !currentActiveList
    ) {
      setCurrentScreen('home');
      setActiveTab('home');
    }
  }, [currentScreen, isLoadingLists, currentActiveList]);

  // Determine if bottom navigation bar should be visible
  const showBottomNav =
    (currentScreen === 'home' || currentScreen === 'history' || currentScreen === 'settings' || currentScreen === 'statistics') && !!user;

  // Loading state while auth is being resolved on launch
  if (isAuthLoading && currentScreen !== 'splash') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-['Plus_Jakarta_Sans'] font-extrabold text-xl shadow-md">
            Y
          </div>
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col justify-between selection:bg-primary-container selection:text-on-primary-container">
      {/* Public Dedicated Legal & Information Pages (Terms, Privacy, About, Help, Legal Hub) */}
      {LEGAL_SCREENS.includes(currentScreen) && (
        <LegalPageView
          initialPage={currentScreen as LegalPageType}
          onBack={handleBackFromLegal}
          onNavigate={handleOpenLegalPage}
        />
      )}

      {/* Screen Routing: Gated strictly by authentication status */}
      {currentScreen === 'splash' && !LEGAL_SCREENS.includes(currentScreen) && (
        <SplashView onFinish={handleSplashFinish} />
      )}

      {!user && currentScreen !== 'splash' && !LEGAL_SCREENS.includes(currentScreen) && (
        <AuthView
          onSuccess={handleAuthSuccess}
          onOpenLegalPage={handleOpenLegalPage}
        />
      )}

      {user && currentScreen === 'profile_setup' && !LEGAL_SCREENS.includes(currentScreen) && (
        <ProfileSetupView onComplete={handleProfileSetupComplete} />
      )}

      {user && currentScreen === 'onboarding' && !LEGAL_SCREENS.includes(currentScreen) && (
        <OnboardingView onComplete={handleOnboardingComplete} />
      )}

      {currentScreen === 'home' && user && (
        <HomeView
          lists={lists}
          isLoading={isLoadingLists}
          error={listsFetchError}
          onRetry={() => fetchShoppingLists(user?.id || null)}
          onCreateList={handleStartCreateList}
          onSelectList={handleOpenListInShoppingMode}
          onOpenProfile={handleOpenSettingsScreen}
          onOpenMenu={handleOpenSettingsScreen}
          onOpenHistory={() => {
            setCurrentScreen('history');
            setActiveTab('lists');
          }}
          onEditList={handleEditList}
          onDeleteList={handleDeleteList}
          onQuickAddRecommendation={handleQuickAddRecommendation}
          onOpenStatistics={() => setCurrentScreen('statistics')}
        />
      )}

      {currentScreen === 'create_list' && user && (
        <CreateListView
          onBack={() => setCurrentScreen('home')}
          onCreateList={handleCreateListTitleSubmitted}
          onContinue={handleCreateListTitleSubmitted}
        />
      )}

      {currentScreen === 'add_items' && user && (
        <AddItemsView
          listTitle={tempNewListTitle || currentActiveList?.title || 'Shopping List'}
          initialItems={currentActiveList?.items || []}
          onBack={() => setCurrentScreen('home')}
          onStartShopping={handleStartShoppingFromNewItems}
          onItemsChange={handleItemsChangeInAddView}
        />
      )}

      {currentScreen === 'shopping_list' && user && currentActiveList && (
        <ShoppingListView
          list={currentActiveList}
          onBack={() => setCurrentScreen('home')}
          onUpdateList={handleUpdateList}
          onCompleteTrip={handleCompleteTrip}
          onEditList={handleEditList}
          onOpenProfile={handleOpenSettingsScreen}
          isCompletingTrip={isCompletingTrip}
          completionError={completionError}
          onClearCompletionError={() => setCompletionError(null)}
        />
      )}

      {currentScreen === 'completion' && user && currentActiveList && (
        <CompletionView
          list={currentActiveList}
          onReturnHome={() => {
            setActiveListId(null);
            setCurrentScreen('home');
            setActiveTab('home');
          }}
          onViewHistory={handleFinishCompletion}
          onAddMoreItems={() => setCurrentScreen('shopping_list')}
          onOpenProfile={handleOpenSettingsScreen}
        />
      )}

      {currentScreen === 'history' && user && (
        <ListHistoryView
          lists={lists}
          isLoading={isLoadingLists}
          error={listsFetchError}
          onRetry={() => fetchShoppingLists(user?.id || null)}
          onSelectList={handleOpenListDetails}
          onCreateNewList={handleStartCreateList}
          onOpenProfile={handleOpenSettingsScreen}
          onOpenMenu={handleOpenSettingsScreen}
          onBack={() => {
            setCurrentScreen('home');
            setActiveTab('home');
          }}
          isOnline={isOnline}
        />
      )}

      {currentScreen === 'list_details' && user && currentActiveList && (
        <ListDetailsView
          list={currentActiveList}
          onBack={() => setCurrentScreen('history')}
          onReuseList={handleReuseList}
          onContinueShopping={handleOpenListInShoppingMode}
          onEditList={handleEditList}
          onDeleteList={handleDeleteList}
          onOpenProfile={handleOpenSettingsScreen}
        />
      )}

      {currentScreen === 'edit_list' && user && currentActiveList && (
        <EditListView
          list={currentActiveList}
          onBack={() => setCurrentScreen('shopping_list')}
          onSave={handleSaveEditedList}
          onOpenProfile={handleOpenSettingsScreen}
        />
      )}

      {currentScreen === 'settings' && user && (
        <SettingsView
          initialEditPhone={focusPhoneInSettings}
          onBack={() => {
            setFocusPhoneInSettings(false);
            setCurrentScreen('home');
            setActiveTab('home');
          }}
          onSignOut={handleSignOut}
          onDeleteAccount={handleDeleteAccount}
          onOpenAuth={handleOpenAuth}
          onRestartTour={handleRestartTour}
          onReplayOnboarding={handleResetOnboarding}
          onOpenLegalPage={handleOpenLegalPage}
        />
      )}

      {currentScreen === 'statistics' && user && (
        <StatisticsView
          lists={lists}
          isLoading={isLoadingLists}
          error={listsFetchError}
          onRetry={() => fetchShoppingLists(user?.id || null)}
          onBack={() => {
            setCurrentScreen('home');
            setActiveTab('home');
          }}
          onCreateList={handleStartCreateList}
          onSelectList={handleOpenListInShoppingMode}
        />
      )}

      {/* Persistent Bottom Navigation for Primary Views */}
      {showBottomNav && (
        <BottomNavBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onCreateClick={handleStartCreateList}
        />
      )}

      {/* Interactive Product Tour (Spotlight on Home view) */}
      <ProductTour
        isActive={isTourActive && currentScreen === 'home'}
        onComplete={handleTourComplete}
        onSkip={handleTourSkip}
      />

      {/* Smart Phone Number Completion Reminder Modal */}
      <PhoneNumberReminderModal
        isOpen={isPhoneReminderOpen}
        onAddNumber={handleAddNumberReminder}
        onDismiss={handleDismissPhoneReminder}
      />

      {/* Auth Modal (Sign in / Sign up) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onOpenLegalPage={handleOpenLegalPage}
      />

      {/* Apple-style Network Status Pill */}
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
