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
import { BottomNavBar } from './components/BottomNavBar';
import { SettingsModal } from './components/SettingsModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import { generateUUID } from './lib/uuid';
import {
  loadUserShoppingLists,
  saveUserShoppingList,
  deleteUserShoppingList,
  clearAllUserShoppingLists,
} from './lib/supabase';
import { Loader2 } from 'lucide-react';

const STORAGE_ONBOARDED_KEY = 'yaad_has_onboarded_v2';
const STORAGE_PROFILE_SETUP_KEY = 'yaad_profile_setup_done';
const getStorageKey = (userId?: string | null) => {
  return userId ? `yaad_shopping_lists_u_${userId}` : 'yaad_shopping_lists_guest';
};

export default function App() {
  const { user, profile, isLoading: isAuthLoading, isConfigured, deleteAccount, signOut } = useAuth();

  // Screen and navigation state
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('splash');
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');

  // Active working list
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [tempNewListTitle, setTempNewListTitle] = useState<string>('');

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  // Loading & error state for shopping lists
  const [isLoadingLists, setIsLoadingLists] = useState<boolean>(false);
  const [listsFetchError, setListsFetchError] = useState<string | null>(null);

  // Shopping lists collection scoped by authenticated user
  const [lists, setLists] = useState<ShoppingList[]>(() => {
    try {
      const storageKey = getStorageKey(user?.id);
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load lists from localStorage', e);
    }
    return [];
  });

  // Track previous user to detect sign in / sign out / switch
  const [prevUserId, setPrevUserId] = useState<string | null | undefined>(user?.id);

  // Sync with Supabase & localStorage when user changes (login or logout)
  const fetchShoppingLists = useCallback(async (userId: string | null) => {
    if (!userId) {
      setLists([]);
      setIsLoadingLists(false);
      setListsFetchError(null);
      return;
    }

    setIsLoadingLists(true);
    setListsFetchError(null);

    // 1. Read cached local state for instant responsiveness
    try {
      const cached = localStorage.getItem(getStorageKey(userId));
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setLists(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not read cached lists:', e);
    }

    // 2. Fetch fresh data from Supabase backend
    if (isConfigured) {
      const { lists: cloudLists, error } = await loadUserShoppingLists(userId);
      if (error) {
        console.error('Error fetching shopping lists from Supabase:', error);
        setListsFetchError(error.message);
      } else if (cloudLists) {
        setLists(cloudLists);
      }
    }
    setIsLoadingLists(false);
  }, [isConfigured]);

  useEffect(() => {
    const currentUserId = user?.id || null;
    const previousUserId = prevUserId || null;

    if (currentUserId !== previousUserId) {
      setPrevUserId(currentUserId);
      setActiveListId(null);
      fetchShoppingLists(currentUserId);
    }
  }, [user?.id, prevUserId, fetchShoppingLists]);

  // Save lists to user-scoped localStorage whenever lists state changes
  useEffect(() => {
    try {
      const storageKey = getStorageKey(user?.id);
      localStorage.setItem(storageKey, JSON.stringify(lists));
    } catch (e) {
      console.error('Failed to save lists to localStorage', e);
    }
  }, [lists, user?.id]);

  // Authentication Gate Router: Enforce protected screen flow
  useEffect(() => {
    if (isAuthLoading) return; // Wait until auth state is resolved to avoid flicker

    if (currentScreen === 'splash') return;

    const hasOnboarded = localStorage.getItem(STORAGE_ONBOARDED_KEY) === 'true';

    // 1. If user hasn't onboarded yet, show onboarding
    if (!hasOnboarded) {
      if (currentScreen !== 'onboarding') {
        setCurrentScreen('onboarding');
      }
      return;
    }

    // 2. If user is NOT authenticated, redirect to auth screen
    if (!user) {
      if (currentScreen !== 'auth' && currentScreen !== 'onboarding') {
        setCurrentScreen('auth');
      }
      return;
    }

    // 3. User is authenticated -> check first-time profile setup
    const hasSetupLocal = localStorage.getItem(STORAGE_PROFILE_SETUP_KEY) === 'true';
    const isSetupComplete = profile?.has_completed_setup || (hasSetupLocal && !!profile?.full_name);

    if (!isSetupComplete && (!profile?.full_name || profile.full_name.trim() === '')) {
      if (currentScreen !== 'profile_setup') {
        setCurrentScreen('profile_setup');
      }
      return;
    }

    // 4. Authenticated & setup completed -> if currently on auth/onboarding/profile_setup, go to home
    if (currentScreen === 'auth' || currentScreen === 'onboarding' || currentScreen === 'profile_setup') {
      setCurrentScreen('home');
    }
  }, [user, profile, isAuthLoading, currentScreen]);

  // Handle splash completion
  const handleSplashFinish = () => {
    const hasOnboarded = localStorage.getItem(STORAGE_ONBOARDED_KEY) === 'true';
    if (!hasOnboarded) {
      setCurrentScreen('onboarding');
    } else if (!user) {
      setCurrentScreen('auth');
    } else {
      const hasSetup = profile?.has_completed_setup || localStorage.getItem(STORAGE_PROFILE_SETUP_KEY) === 'true';
      if (!hasSetup && (!profile?.full_name || profile.full_name.trim() === '')) {
        setCurrentScreen('profile_setup');
      } else {
        setCurrentScreen('home');
      }
    }
  };

  // Handle onboarding completion -> navigate to Auth Gate
  const handleOnboardingComplete = () => {
    localStorage.setItem(STORAGE_ONBOARDED_KEY, 'true');
    if (!user) {
      setCurrentScreen('auth');
    } else {
      setCurrentScreen('home');
    }
  };

  // Handle successful login/signup from AuthView
  const handleAuthSuccess = () => {
    const hasSetup = profile?.has_completed_setup || localStorage.getItem(STORAGE_PROFILE_SETUP_KEY) === 'true';
    if (!hasSetup && (!profile?.full_name || profile.full_name.trim() === '')) {
      setCurrentScreen('profile_setup');
    } else {
      setCurrentScreen('home');
    }
  };

  // Handle profile setup completion
  const handleProfileSetupComplete = () => {
    localStorage.setItem(STORAGE_PROFILE_SETUP_KEY, 'true');
    setCurrentScreen('home');
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
    setIsSettingsOpen(false);
    setIsProfileOpen(false);
    // Redirect to auth screen so unauthenticated user cannot access home
    setCurrentScreen('auth');
    setActiveTab('home');
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    await signOut();
    setLists([]);
    setActiveListId(null);
    setIsSettingsOpen(false);
    setIsProfileOpen(false);
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
    setCurrentScreen('create_list');
  };

  const handleCreateListTitleSubmitted = (title: string) => {
    setTempNewListTitle(title);
    setCurrentScreen('add_items');
  };

  const handleStartShoppingFromNewItems = async (items: ShoppingItem[]) => {
    const newListId = generateUUID();
    const newList: ShoppingList = {
      id: newListId,
      userId: user?.id,
      title: tempNewListTitle.trim() || 'Shopping List',
      createdAt: 'Today',
      createdTimestamp: Date.now(),
      isCompleted: false,
      items: items.map((it) => ({
        ...it,
        id: it.id || generateUUID(),
        completed: it.completed ?? false,
      })),
    };

    // Update local state immediately
    setLists((prev) => [newList, ...prev]);
    setActiveListId(newListId);
    setTempNewListTitle('');
    setCurrentScreen('shopping_list');

    // Persist to Supabase if authenticated
    if (user && isConfigured) {
      await saveUserShoppingList(user.id, newList);
    }
  };

  // View / Edit / Complete actions
  const handleOpenListInShoppingMode = (listId: string) => {
    setActiveListId(listId);
    setCurrentScreen('shopping_list');
  };

  const handleOpenListDetails = (listId: string) => {
    setActiveListId(listId);
    setCurrentScreen('list_details');
  };

  const handleEditList = (listId: string) => {
    setActiveListId(listId);
    setCurrentScreen('edit_list');
  };

  const handleUpdateList = async (updatedList: ShoppingList) => {
    setLists((prev) =>
      prev.map((l) => (l.id === updatedList.id ? updatedList : l))
    );

    if (user && isConfigured) {
      await saveUserShoppingList(user.id, updatedList);
    }
  };

  const handleCompleteTrip = async (listId: string) => {
    const target = lists.find((l) => l.id === listId);
    if (!target) return;

    const completedList: ShoppingList = {
      ...target,
      isCompleted: true,
      completedAt: 'Today',
    };

    setLists((prev) => prev.map((l) => (l.id === listId ? completedList : l)));
    setActiveListId(listId);
    setCurrentScreen('completion');

    if (user && isConfigured) {
      await saveUserShoppingList(user.id, completedList);
    }
  };

  const handleFinishCompletion = () => {
    setActiveListId(null);
    setCurrentScreen('history');
    setActiveTab('lists');
  };

  const handleReuseList = async (listId: string) => {
    const target = lists.find((l) => l.id === listId);
    if (!target) return;

    const duplicatedId = generateUUID();
    const duplicatedList: ShoppingList = {
      ...target,
      id: duplicatedId,
      userId: user?.id,
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

    if (user && isConfigured) {
      await saveUserShoppingList(user.id, duplicatedList);
    }
  };

  const handleDeleteList = async (listId: string) => {
    setLists((prev) => prev.filter((l) => l.id !== listId));
    if (activeListId === listId) {
      setActiveListId(null);
    }
    setCurrentScreen('history');

    if (user && isConfigured) {
      await deleteUserShoppingList(user.id, listId);
    }
  };

  const handleSaveEditedList = async (savedList: ShoppingList) => {
    await handleUpdateList(savedList);
    setCurrentScreen('shopping_list');
  };

  // Navigation tab switcher
  const handleTabChange = (tab: NavigationTab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      setCurrentScreen('home');
    } else if (tab === 'create') {
      handleStartCreateList();
    } else if (tab === 'lists') {
      setCurrentScreen('history');
    } else if (tab === 'settings') {
      setIsSettingsOpen(true);
    }
  };


  // Currently active list object
  const currentActiveList = lists.find((l) => l.id === activeListId) || lists[0] || null;

  // Determine if bottom navigation bar should be visible
  const showBottomNav =
    (currentScreen === 'home' || currentScreen === 'history') && !!user;

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
      {/* Screen Routing */}
      {currentScreen === 'splash' && (
        <SplashView onFinish={handleSplashFinish} />
      )}

      {currentScreen === 'onboarding' && (
        <OnboardingView onComplete={handleOnboardingComplete} />
      )}

      {currentScreen === 'auth' && (
        <AuthView onSuccess={handleAuthSuccess} />
      )}

      {currentScreen === 'profile_setup' && (
        <ProfileSetupView onComplete={handleProfileSetupComplete} />
      )}

      {currentScreen === 'home' && user && (
        <HomeView
          lists={lists}
          isLoading={isLoadingLists}
          error={listsFetchError}
          onRetry={() => fetchShoppingLists(user?.id || null)}
          onCreateList={handleStartCreateList}
          onSelectList={handleOpenListInShoppingMode}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenMenu={() => setIsSettingsOpen(true)}
        />
      )}

      {currentScreen === 'create_list' && user && (
        <CreateListView
          onBack={() => setCurrentScreen('home')}
          onContinue={handleCreateListTitleSubmitted}
        />
      )}

      {currentScreen === 'add_items' && user && (
        <AddItemsView
          listTitle={tempNewListTitle || 'Shopping List'}
          onBack={() => setCurrentScreen('create_list')}
          onStartShopping={handleStartShoppingFromNewItems}
        />
      )}

      {currentScreen === 'shopping_list' && user && currentActiveList && (
        <ShoppingListView
          list={currentActiveList}
          onBack={() => setCurrentScreen('home')}
          onUpdateList={handleUpdateList}
          onCompleteTrip={handleCompleteTrip}
          onEditList={handleEditList}
          onOpenProfile={() => setIsProfileOpen(true)}
        />
      )}

      {currentScreen === 'completion' && user && currentActiveList && (
        <CompletionView
          list={currentActiveList}
          onCompleteTrip={handleFinishCompletion}
          onAddMoreItems={() => setCurrentScreen('shopping_list')}
          onOpenProfile={() => setIsProfileOpen(true)}
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
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenMenu={() => setIsSettingsOpen(true)}
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
          onOpenProfile={() => setIsProfileOpen(true)}
        />
      )}

      {currentScreen === 'edit_list' && user && currentActiveList && (
        <EditListView
          list={currentActiveList}
          onBack={() => setCurrentScreen('shopping_list')}
          onSave={handleSaveEditedList}
          onOpenProfile={() => setIsProfileOpen(true)}
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

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          if (activeTab === 'settings') {
            setActiveTab('home');
          }
        }}
        onResetOnboarding={handleResetOnboarding}
        onClearAllData={handleClearAllData}
        onDeleteAccount={handleDeleteAccount}
        onOpenAuth={handleOpenAuth}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenAuth={handleOpenAuth}
        onDeleteAccount={handleDeleteAccount}
      />

      {/* Auth Modal (Sign in / Sign up) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}
