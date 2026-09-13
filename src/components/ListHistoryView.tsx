import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ShoppingBag,
  Clock,
  Plus,
  AlertCircle,
  RefreshCw,
  Search,
  CheckCircle2,
  WifiOff,
  Database,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';
import { ShoppingList } from '../types';
import { TopHeader } from './TopHeader';
import { useLanguage } from '../context/LanguageContext';
import { getFriendlyErrorMessage } from '../utils/errorFormatting';
import { ShoppingListCard } from './ShoppingListCard';
import { triggerHaptic } from '../lib/sound';

export interface ListHistoryViewProps {
  lists: ShoppingList[];
  onSelectList: (list: ShoppingList) => void;
  onCreateNewList: () => void;
  onContinueShopping?: (list: ShoppingList) => void;
  onMarkComplete?: (list: ShoppingList) => void;
  onDeleteList?: (listId: string) => void;
  onReuseList?: (list: ShoppingList) => void;
  onOpenProfile: () => void;
  onOpenMenu: () => void;
  onBack?: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  isOnline?: boolean;
}

type HistoryFilterTab = 'all' | 'completed' | 'active';

export const ListHistoryView: React.FC<ListHistoryViewProps> = ({
  lists,
  onSelectList,
  onCreateNewList,
  onContinueShopping,
  onMarkComplete,
  onDeleteList,
  onReuseList,
  onOpenProfile,
  onOpenMenu,
  onBack,
  isLoading = false,
  error = null,
  onRetry,
  isOnline = true,
}) => {
  const { t } = useLanguage();
  const [filterTab, setFilterTab] = useState<HistoryFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletedListToast, setDeletedListToast] = useState<{ list: ShoppingList; timeoutId: any } | null>(null);

  // 1. Sort latest first guaranteed
  const sortedLists = useMemo(() => {
    return [...lists].sort((a, b) => {
      const timeB = b.createdTimestamp || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      const timeA = a.createdTimestamp || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      return timeB - timeA;
    });
  }, [lists]);

  // 2. Compute filter counts
  const { completedCount, activeCount } = useMemo(() => {
    let completed = 0;
    let active = 0;
    for (const list of lists) {
      const isDone = list.isCompleted || (list.items.length > 0 && list.items.every((i) => i.completed));
      if (isDone) {
        completed++;
      } else {
        active++;
      }
    }
    return { completedCount: completed, activeCount: active };
  }, [lists]);

  // 3. Filtered items based on active tab and search query
  const displayedLists = useMemo(() => {
    return sortedLists.filter((list) => {
      const isDone = list.isCompleted || (list.items.length > 0 && list.items.every((i) => i.completed));

      // Tab filter
      if (filterTab === 'completed' && !isDone) return false;
      if (filterTab === 'active' && isDone) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = (list.title || '').toLowerCase().includes(query);
        const matchesItems = (list.items || []).some(
          (i) =>
            i.name.toLowerCase().includes(query) ||
            (i.nameUrdu && i.nameUrdu.includes(query)) ||
            (i.canonicalName && i.canonicalName.toLowerCase().includes(query))
        );
        return matchesTitle || matchesItems;
      }

      return true;
    });
  }, [sortedLists, filterTab, searchQuery]);

  // Handle delete list with toast
  const handleDelete = (listId: string) => {
    const listToDelete = lists.find((l) => l.id === listId);
    if (onDeleteList) {
      onDeleteList(listId);
    }
    if (listToDelete) {
      if (deletedListToast?.timeoutId) {
        clearTimeout(deletedListToast.timeoutId);
      }
      const timeoutId = setTimeout(() => {
        setDeletedListToast(null);
      }, 5000);
      setDeletedListToast({ list: listToDelete, timeoutId });
    }
  };

  const friendlyError = error ? getFriendlyErrorMessage(error) : null;

  return (
    <div className="w-full max-w-7xl mx-auto min-h-screen flex flex-col antialiased bg-background pb-28 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header */}
      <TopHeader
        title={t('appName')}
        showBack={Boolean(onBack)}
        onBack={onBack}
        onSettingsClick={onOpenMenu || onOpenProfile}
        onAvatarClick={onOpenProfile}
        onMenuClick={onOpenMenu}
        rightAction={
          onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="text-xs sm:text-sm font-semibold text-primary hover:bg-emerald-50 px-3 py-1.5 rounded-full transition-colors active:scale-95 cursor-pointer"
            >
              {t('history.backToHome') || 'Home'}
            </button>
          ) : undefined
        }
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-4 flex flex-col gap-5">
        {/* Header Title and Subtitle + Always-active Create List Action */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              {t('history.title')}
            </h1>
            <p className="font-['Manrope'] text-xs sm:text-sm text-outline mt-0.5">
              {t('history.subtitle')}
            </p>
          </div>

          {/* Primary Create List Button (Direct route to create_list) */}
          <button
            type="button"
            id="history_create_new_btn"
            onClick={() => {
              triggerHaptic(14);
              onCreateNewList();
            }}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.4]" />
            <span>{t('history.createListBtn')}</span>
          </button>
        </div>

        {/* Offline cached notice banner if offline */}
        {!isOnline && (
          <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs font-['Manrope'] text-amber-900 flex items-center gap-2 shadow-2xs">
            <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
            <div className="flex-1">
              <span className="font-bold">{t('history.cachedNotice')}</span>
              <span className="text-amber-800/80 block sm:inline sm:ms-1">
                (New changes will sync automatically once reconnected)
              </span>
            </div>
            <Database className="w-4 h-4 text-amber-600 shrink-0" />
          </div>
        )}

        {/* Error State Banner */}
        {friendlyError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-['Manrope'] text-rose-800 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{friendlyError}</span>
            </div>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="px-3 py-1 bg-white border border-rose-200 rounded-lg font-bold text-rose-700 hover:bg-rose-100/50 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}

        {/* Search & Filter Bar (Rendered whenever lists exist) */}
        {lists.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                id="history_search_input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('history.searchPlaceholder')}
                className="w-full h-11 pl-10 pr-4 bg-white border border-surface-dim/80 rounded-xl text-xs sm:text-sm font-['Manrope'] text-on-surface placeholder:text-outline/70 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-2xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-outline hover:text-on-surface cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center p-1 bg-surface-container rounded-xl gap-1 shrink-0 self-start sm:self-auto border border-surface-dim/60">
              <button
                type="button"
                id="history_filter_all"
                onClick={() => {
                  triggerHaptic(6);
                  setFilterTab('all');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-['Manrope'] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterTab === 'all'
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                <span>{t('history.filterAll')}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-surface-container-high text-on-surface-variant font-bold">
                  {lists.length}
                </span>
              </button>

              <button
                type="button"
                id="history_filter_completed"
                onClick={() => {
                  triggerHaptic(6);
                  setFilterTab('completed');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-['Manrope'] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterTab === 'completed'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                <span>{t('history.filterCompleted')}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-900 font-bold">
                  {completedCount}
                </span>
              </button>

              <button
                type="button"
                id="history_filter_active"
                onClick={() => {
                  triggerHaptic(6);
                  setFilterTab('active');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-['Manrope'] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterTab === 'active'
                    ? 'bg-white text-amber-900 shadow-xs'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                <span>{t('history.filterActive')}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-900 font-bold">
                  {activeCount}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Content State: Loading, Empty, No Results, or Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-full min-h-[116px] bg-white rounded-2xl p-4 sm:p-4.5 flex flex-col justify-between border border-surface-dim/70 shadow-2xs animate-pulse"
              >
                <div className="flex items-start gap-3.5 w-full">
                  <div className="w-12 h-12 rounded-xl bg-surface-container shrink-0" />
                  <div className="flex flex-col gap-2 flex-1 pt-1">
                    <div className="w-3/4 h-4 bg-surface-container rounded" />
                    <div className="w-1/2 h-3 bg-surface-container-low rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : lists.length === 0 ? (
          /* Clean Empty State (When no history exists) */
          <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 bg-white rounded-3xl border border-surface-dim/70 my-6 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-primary mb-4">
              <ShoppingBag className="w-8 h-8 text-primary stroke-[2]" />
            </div>
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-on-surface text-lg sm:text-xl">
              {t('history.emptyTitle')}
            </h3>
            <p className="font-['Manrope'] text-xs sm:text-sm text-outline mt-1.5 mb-6 max-w-sm leading-relaxed">
              {t('history.emptySubtitle')}
            </p>
            <button
              type="button"
              id="history_empty_create_btn"
              onClick={() => {
                triggerHaptic(14);
                onCreateNewList();
              }}
              className="bg-primary hover:bg-primary/90 text-white font-['Manrope'] text-xs sm:text-sm font-bold px-6 py-3 rounded-full shadow-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.4]" />
              <span>{t('history.createListBtn')}</span>
            </button>
          </div>
        ) : displayedLists.length === 0 ? (
          /* No search results */
          <div className="p-8 bg-white rounded-2xl border border-surface-dim/70 text-center shadow-xs flex flex-col items-center">
            <Search className="w-8 h-8 text-outline mb-2 opacity-50" />
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-on-surface text-sm">
              {t('history.noSearchResults')}
            </p>
            <p className="font-['Manrope'] text-xs text-outline mt-1 max-w-xs">
              Try searching for a different list title or item name, or create a brand new list.
            </p>
            <div className="flex items-center gap-2.5 mt-4">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilterTab('all');
                }}
                className="px-3.5 py-2 bg-surface-container rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(14);
                  onCreateNewList();
                }}
                className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New List</span>
              </button>
            </div>
          </div>
        ) : (
          /* Standardized Responsive Card Grid: 1 col on mobile, 2 col on tablet, 3-4 col on desktop */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {displayedLists.map((list) => (
              <ShoppingListCard
                key={list.id}
                list={list}
                onSelectList={onSelectList}
                onContinueShopping={onContinueShopping}
                onMarkComplete={onMarkComplete}
                onDeleteList={handleDelete}
                onReuseList={onReuseList}
                isOnline={isOnline}
                variant="history"
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Undo Toast on Deletion */}
      {deletedListToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-on-surface text-surface px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10 animate-slide-up text-xs font-['Manrope']">
          <span>Shopping list deleted</span>
          {onReuseList && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                onReuseList(deletedListToast.list);
                if (deletedListToast.timeoutId) clearTimeout(deletedListToast.timeoutId);
                setDeletedListToast(null);
              }}
              className="text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
