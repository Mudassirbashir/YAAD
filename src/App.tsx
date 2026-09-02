import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingList, ShoppingItem, ScreenType, NavigationTab } from './types';
import { SplashView } from './components/SplashView';
import { OnboardingView } from './components/OnboardingView';
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

const STORAGE_ONBOARDED_KEY = 'yaad_has_onboarded_v2';
const getStorageKey = (userId?: string | null) => {
  return userId ? `yaad_shopping_lists_u_${userId}` : 'yaad_shopping_lists_guest';
};

export default function App() {
  const { user, isConfigured, deleteAccount, signOut } = useAuth();

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

  // Handle splash completion
  const handleSplashFinish = () => {
    const hasOnboarded = localStorage.getItem(STORAGE_ONBOARDED_KEY) === 'true';
    if (!hasOnboarded) {
      setCurrentScreen('onboarding');
    } else {
      setCurrentScreen('home');
    }
  };

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    localStorage.setItem(STORAGE_ONBOARDED_KEY, 'true');
    setCurrentScreen('home');
  };

  // Replay onboarding
  const handleResetOnboarding = () => {
    localStorage.removeItem(STORAGE_ONBOARDED_KEY);
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
      await deleteAccount();
    } catch (e) {
      console.error('Error during account deletion:', e);
    }
    // Wipe all local states immediately
    setLists([]);
    setActiveListId(null);
    setIsSettingsOpen(false);
    setIsProfileOpen(false);
    // Redirect to onboarding/auth screen so deleted user cannot access home
    setCurrentScreen('onboarding');
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
      title: tempNewListTitle || 'Shopping List',
      createdAt: 'Today',
      createdTimestamp: Date.now(),
      isCompleted: false,
      icon: 'shopping_basket',
      items,
    };

    setLists((prev) => [newList, ...prev]);
    setActiveListId(newList.id);
    setCurrentScreen('shopping_list');

    // Persist to Supabase if authenticated
    if (user && isConfigured) {
      const { error } = await saveUserShoppingList(user.id, newList);
      if (error) {
        console.error('Error saving shopping list to Supabase:', error);
      }
    }
  };

  // Open existing list into live Shopping Mode
  const handleOpenListInShoppingMode = (list: ShoppingList) => {
    setActiveListId(list.id);
    setCurrentScreen('shopping_list');
  };

  // Open list details breakdown
  const handleOpenListDetails = (list: ShoppingList) => {
    setActiveListId(list.id);
    setCurrentScreen('list_details');
  };

  // Update a list in state and Supabase
  const handleUpdateList = async (updatedList: ShoppingList) => {
    setLists((prev) =>
      prev.map((l) => (l.id === updatedList.id ? updatedList : l))
    );

    // Persist to Supabase if authenticated
    if (user && isConfigured) {
      const { error } = await saveUserShoppingList(user.id, updatedList);
      if (error) {
        console.error('Error updating shopping list in Supabase:', error);
      }
    }
  };

  // When all items are checked or trip completed
  const handleCompleteTrip = async (completedList: ShoppingList) => {
    const finalizedList: ShoppingList = {
      ...completedList,
      isCompleted: true,
      completedAt: 'Today',
    };
    await handleUpdateList(finalizedList);
    setActiveListId(finalizedList.id);
    setCurrentScreen('completion');
  };

  // Finishing from celebration completion screen
  const handleFinishCompletion = () => {
    setCurrentScreen('history');
    setActiveTab('lists');
  };

  // Reuse past list
  const handleReuseList = async (list: ShoppingList) => {
    const freshListId = generateUUID();
    const clonedItems: ShoppingItem[] = list.items.map((i) => ({
      ...i,
      id: generateUUID(),
      completed: false,
    }));

    const freshList: ShoppingList = {
      id: freshListId,
      userId: user?.id,
      title: list.title,
      createdAt: 'Today',
      createdTimestamp: Date.now(),
      isCompleted: false,
      icon: list.icon || 'shopping_basket',
      items: clonedItems,
    };

    setLists((prev) => [freshList, ...prev]);
    setActiveListId(freshList.id);
    setCurrentScreen('shopping_list');

    // Persist to Supabase if authenticated
    if (user && isConfigured) {
      const { error } = await saveUserShoppingList(user.id, freshList);
      if (error) {
        console.error('Error saving cloned shopping list to Supabase:', error);
      }
    }
  };

  // Delete list
  const handleDeleteList = async (listId: string) => {
    setLists((prev) => prev.filter((l) => l.id !== listId));
    setActiveListId(null);
    setCurrentScreen('history');
    setActiveTab('lists');

    // Delete in Supabase if authenticated
    if (user && isConfigured) {
      const { error } = await deleteUserShoppingList(user.id, listId);
      if (error) {
        console.error('Error deleting shopping list from Supabase:', error);
      }
    }
  };

  // Edit list
  const handleEditList = (list: ShoppingList) => {
    setActiveListId(list.id);
    setCurrentScreen('edit_list');
  };

  const handleSaveEditedList = async (updatedList: ShoppingList) => {
    await handleUpdateList(updatedList);
    setActiveListId(updatedList.id);
    setCurrentScreen('shopping_list');
  };

  // Bottom navigation tab switching
  const handleTabChange = (tab: NavigationTab) => {
    if (tab === 'home') {
      setActiveTab('home');
      setCurrentScreen('home');
    } else if (tab === 'create') {
      handleStartCreateList();
    } else if (tab === 'lists') {
      setActiveTab('lists');
      setCurrentScreen('history');
    } else if (tab === 'settings') {
      setIsSettingsOpen(true);
    }
  };

  // Currently active list object
  const currentActiveList = lists.find((l) => l.id === activeListId) || lists[0] || null;

  // Determine if bottom navigation bar should be visible
  const showBottomNav =
    currentScreen === 'home' ||
    currentScreen === 'history';

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col justify-between selection:bg-primary-container selection:text-on-primary-container">
      {/* Screen Routing */}
      {currentScreen === 'splash' && (
        <SplashView onFinish={handleSplashFinish} />
      )}

      {currentScreen === 'onboarding' && (
        <OnboardingView onComplete={handleOnboardingComplete} />
      )}

      {currentScreen === 'home' && (
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

      {currentScreen === 'create_list' && (
        <CreateListView
          onBack={() => setCurrentScreen('home')}
          onContinue={handleCreateListTitleSubmitted}
        />
      )}

      {currentScreen === 'add_items' && (
        <AddItemsView
          listTitle={tempNewListTitle || 'Shopping List'}
          onBack={() => setCurrentScreen('create_list')}
          onStartShopping={handleStartShoppingFromNewItems}
        />
      )}

      {currentScreen === 'shopping_list' && currentActiveList && (
        <ShoppingListView
          list={currentActiveList}
          onBack={() => setCurrentScreen('home')}
          onUpdateList={handleUpdateList}
          onCompleteTrip={handleCompleteTrip}
          onEditList={handleEditList}
          onOpenProfile={() => setIsProfileOpen(true)}
        />
      )}

      {currentScreen === 'completion' && currentActiveList && (
        <CompletionView
          list={currentActiveList}
          onCompleteTrip={handleFinishCompletion}
          onAddMoreItems={() => setCurrentScreen('shopping_list')}
          onOpenProfile={() => setIsProfileOpen(true)}
        />
      )}

      {currentScreen === 'history' && (
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

      {currentScreen === 'list_details' && currentActiveList && (
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

      {currentScreen === 'edit_list' && currentActiveList && (
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
