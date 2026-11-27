import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Plus,
  AlertCircle,
  RefreshCw,
  Search,
  WifiOff,
  Database,
  RotateCcw,
  ClipboardList,
  CheckSquare,
  Trash2,
  X,
  Check,
  ArrowRight,
} from 'lucide-react';
import { ShoppingList } from '../types';
import { TopHeader } from './TopHeader';
import { useLanguage } from '../context/LanguageContext';
import { getFriendlyErrorMessage } from '../utils/errorFormatting';
import { ShoppingListCard } from './ShoppingListCard';
import { ShareListModal } from './ShareListModal';
import { triggerHaptic } from '../lib/sound';
import { useShouldAnimate } from '../lib/motionPreference';

export interface ListHistoryViewProps {
  lists: ShoppingList[];
  onSelectList: (list: ShoppingList) => void;
  onCreateNewList: () => void;
  onContinueShopping?: (list: ShoppingList) => void;
  onMarkComplete?: (list: ShoppingList) => void;
  onDeleteList?: (listId: string) => void;
  onDeleteMultipleLists?: (listIds: string[]) => Promise<void> | void;
  onClearAllHistory?: () => Promise<void> | void;
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
  onDeleteMultipleLists,
  onClearAllHistory,
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
  const canAnimate = useShouldAnimate();
  const [filterTab, setFilterTab] = useState<HistoryFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [shareModalList, setShareModalList] = useState<ShoppingList | null>(null);
  const [deletedListToast, setDeletedListToast] = useState<{
    list: ShoppingList;
    timeoutId: ReturnType<typeof setTimeout>;
  } | null>(null);

  // Bulk selection mode state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Sort latest first guaranteed
  const sortedLists = useMemo(() => {
    return [...lists].sort((a, b) => {
      const timeB = b.createdTimestamp || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      const timeA = a.createdTimestamp || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      return timeB - timeA;
    });
  }, [lists]);

  // 2. Compute real filter counts from all lists
  const { completedCount, activeCount } = useMemo(() => {
    let completed = 0;
    let active = 0;
    for (const list of lists) {
      const isDone =
        list.isCompleted || (list.items.length > 0 && list.items.every((i) => i.completed));
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
      const isDone =
        list.isCompleted || (list.items.length > 0 && list.items.every((i) => i.completed));

      // Tab filter
      if (filterTab === 'completed' && !isDone) return false;
      if (filterTab === 'active' && isDone) return false;

      // Search filter (matches title and item names including Urdu/canonical)
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

  // Handle delete list with undo restore toast
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

  // Toggle selection for a single list
  const handleToggleSelectOne = (listId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(listId)) {
        next.delete(listId);
      } else {
        next.add(listId);
      }
      return next;
    });
  };

  // Tap & Hold / Long Press on card to trigger selection mode
  const handleLongPressCard = (listId: string) => {
    triggerHaptic(25);
    setIsSelectionMode(true);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.add(listId);
      return next;
    });
  };

  // Toggle select all currently displayed lists
  const handleToggleSelectAll = () => {
    triggerHaptic(6);
    if (selectedIds.size === displayedLists.length && displayedLists.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayedLists.map((l) => l.id)));
    }
  };

  // Confirm and execute bulk deletion
  const handleConfirmBulkDelete = async () => {
    if (selectedIds.size === 0 || isDeleting) return;
    setIsDeleting(true);
    triggerHaptic(18);
    const idsToDelete = Array.from(selectedIds);
    try {
      if (onDeleteMultipleLists) {
        await onDeleteMultipleLists(idsToDelete);
      } else if (onDeleteList) {
        for (const id of idsToDelete) {
          onDeleteList(id);
        }
      }
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      setShowBulkDeleteModal(false);
    } catch (err) {
      console.error('Error during bulk deletion:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Confirm and execute clear all history
  const handleConfirmClearAll = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    triggerHaptic(20);
    try {
      if (onClearAllHistory) {
        await onClearAllHistory();
      } else if (onDeleteMultipleLists) {
        await onDeleteMultipleLists(lists.map((l) => l.id));
      } else if (onDeleteList) {
        for (const l of lists) {
          onDeleteList(l.id);
        }
      }
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      setShowClearAllModal(false);
    } catch (err) {
      console.error('Error clearing all history:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const friendlyError = error ? getFriendlyErrorMessage(error) : null;

  return (
    <div className="w-full max-w-7xl mx-auto min-h-screen flex flex-col antialiased bg-background text-on-surface pb-[calc(env(safe-area-inset-bottom,0px)+116px)] selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header */}
      <TopHeader
        title="YAAD"
        showBack={true}
        onBack={onBack}
        onSettingsClick={onOpenMenu || onOpenProfile}
        onAvatarClick={onOpenProfile}
        onMenuClick={onOpenMenu}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 flex flex-col gap-4">
        {/* Compact YAAD Hero Header + Manage Toggle */}
        <section className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              aria-hidden="true"
              className="relative w-11 h-11 rounded-2xl bg-primary/10 dark:bg-primary/20 border border-primary/15 text-primary flex items-center justify-center shrink-0"
            >
              <ShoppingBag className="w-5 h-5 stroke-[2.15]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FCBC1F] ring-2 ring-background absolute -top-0.5 -end-0.5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-[28px] sm:text-[34px] leading-[1.15] font-black text-on-surface tracking-tight">
                {t('history.title') || 'Shopping History'}
              </h1>
              <p className="font-body text-sm text-outline leading-snug mt-0.5">
                {t('history.subtitle') ||
                  'Track past shopping trips and reuse your favourite items.'}
              </p>
            </div>
          </div>

          {lists.length > 0 && (
            <button
              type="button"
              id="history_manage_toggle_btn"
              aria-pressed={isSelectionMode}
              onClick={() => {
                triggerHaptic(8);
                setIsSelectionMode((prev) => {
                  if (prev) setSelectedIds(new Set());
                  return !prev;
                });
              }}
              className={`min-h-[44px] px-3.5 py-2 rounded-full text-xs font-display font-bold border transition-[background-color,border-color,color,transform] duration-150 active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0 ${
                isSelectionMode
                  ? 'bg-primary text-on-primary border-primary shadow-xs'
                  : 'bg-surface-container-lowest text-on-surface border-[color:var(--yaad-settings-card-border)] hover:border-primary/45 shadow-[var(--yaad-settings-card-shadow)]'
              }`}
            >
              {isSelectionMode ? (
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <CheckSquare className="w-3.5 h-3.5" />
              )}
              <span>
                {isSelectionMode
                  ? t('history.doneBtn') || 'Done'
                  : t('history.manageBtn') || 'Manage'}
              </span>
            </button>
          )}
        </section>

        {/* Bulk Selection Action Bar (when in Manage selection mode) */}
        {isSelectionMode && lists.length > 0 && (
          <div
            className={`p-3 bg-surface-container-high/90 dark:bg-surface-container rounded-2xl border border-[color:var(--yaad-settings-card-border)] flex flex-wrap items-center justify-between gap-2.5 shadow-2xs ${
              canAnimate ? 'yaad-enter-state' : ''
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                type="button"
                id="history_select_all_btn"
                onClick={handleToggleSelectAll}
                className="min-h-[40px] px-3 py-1.5 bg-surface-container-lowest border border-[color:var(--yaad-settings-card-border)] rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {selectedIds.size === displayedLists.length && displayedLists.length > 0 ? (
                  <>
                    <X className="w-3.5 h-3.5 text-outline" />
                    <span>{t('history.deselectAll') || 'Deselect All'}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-primary" />
                    <span>
                      {t('history.selectAllCount', { count: displayedLists.length }) ||
                        `Select All (${displayedLists.length})`}
                    </span>
                  </>
                )}
              </button>
              <span className="text-xs font-bold text-on-surface font-body">
                {t('history.selectedOfTotal', {
                  selected: selectedIds.size,
                  total: lists.length,
                }) || `${selectedIds.size} of ${lists.length} selected`}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                id="history_delete_selected_btn"
                disabled={selectedIds.size === 0 || isDeleting}
                onClick={() => {
                  triggerHaptic(10);
                  setShowBulkDeleteModal(true);
                }}
                className="min-h-[40px] px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-2xs transition-[background-color,opacity] duration-150 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {t('history.deleteSelectedCount', { count: selectedIds.size }) ||
                    `Delete Selected (${selectedIds.size})`}
                </span>
              </button>

              <button
                type="button"
                id="history_clear_all_open_btn"
                disabled={isDeleting}
                onClick={() => {
                  triggerHaptic(10);
                  setShowClearAllModal(true);
                }}
                className="min-h-[40px] px-3.5 py-1.5 bg-surface-container-lowest border border-rose-300 dark:border-rose-800/70 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl text-xs font-bold transition-colors duration-150 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('history.clearAllBtn') || 'Clear All'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Offline cached notice banner if offline */}
        {!isOnline && (
          <div className="p-3 bg-[var(--yaad-settings-warm-bg)] border border-[color:var(--yaad-settings-warm-border)] rounded-2xl text-xs font-body text-on-surface flex items-center gap-2.5">
            <WifiOff className="w-4 h-4 text-[var(--yaad-settings-warm-fg)] shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-bold">{t('history.cachedNotice')}</span>
              <span className="text-on-surface-variant block sm:inline sm:ms-1">
                ({t('history.cachedSyncNote') || 'New changes will sync automatically once reconnected'})
              </span>
            </div>
            <Database className="w-4 h-4 text-[var(--yaad-settings-warm-fg)] shrink-0" />
          </div>
        )}

        {/* Error State Banner */}
        {friendlyError && (
          <div
            role="alert"
            className="p-3.5 bg-rose-50 dark:bg-rose-950/35 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-xs font-body text-rose-800 dark:text-rose-200 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="break-words">{friendlyError}</span>
            </div>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="min-h-[36px] px-3 py-1 bg-surface-container-lowest border border-rose-200 dark:border-rose-800 rounded-xl font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100/50 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t('history.retryBtn') || 'Retry'}</span>
              </button>
            )}
          </div>
        )}

        {/* Search & Filter Controls (Rendered whenever lists exist) */}
        {lists.length > 0 && (
          <div className="flex flex-col gap-3">
            {/* Search Pill Input */}
            <div className="relative flex items-center w-full">
              <Search
                aria-hidden="true"
                className="w-4 h-4 text-outline absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <input
                type="text"
                dir="auto"
                id="history_search_input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('history.searchPlaceholder') || 'Search lists or items...'}
                aria-label={t('history.searchPlaceholder') || 'Search lists or items...'}
                className="w-full h-12 ps-11 pe-12 bg-surface-container-lowest border border-[color:var(--yaad-settings-card-border)] rounded-full text-base sm:text-sm font-body text-on-surface placeholder:text-outline/75 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-[var(--yaad-settings-card-shadow)] transition-[border-color] duration-150"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label={t('history.clearSearchLabel') || 'Clear search'}
                  className="absolute end-1.5 top-1/2 -translate-y-1/2 w-10 h-10 min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Pills Row (Selected state distinguished with solid fill + Check icon + aria-pressed) */}
            <div
              role="group"
              aria-label="Filter shopping lists"
              className="flex items-center gap-2 flex-wrap"
            >
              <button
                type="button"
                id="history_filter_all"
                aria-pressed={filterTab === 'all'}
                onClick={() => {
                  triggerHaptic(6);
                  setFilterTab('all');
                }}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-display font-bold border transition-[background-color,border-color,color,transform] duration-150 active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                  filterTab === 'all'
                    ? 'bg-primary text-on-primary border-primary shadow-xs'
                    : 'bg-surface-container-lowest text-on-surface-variant border-[color:var(--yaad-settings-card-border)] hover:border-primary/40'
                }`}
              >
                {filterTab === 'all' && <Check className="w-3.5 h-3.5 stroke-[2.6]" />}
                <span>{t('history.filterAll') || 'All Lists'}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold leading-none ${
                    filterTab === 'all'
                      ? 'bg-white/20 text-on-primary'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {lists.length}
                </span>
              </button>

              <button
                type="button"
                id="history_filter_completed"
                aria-pressed={filterTab === 'completed'}
                onClick={() => {
                  triggerHaptic(6);
                  setFilterTab('completed');
                }}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-display font-bold border transition-[background-color,border-color,color,transform] duration-150 active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                  filterTab === 'completed'
                    ? 'bg-primary text-on-primary border-primary shadow-xs'
                    : 'bg-surface-container-lowest text-on-surface-variant border-[color:var(--yaad-settings-card-border)] hover:border-primary/40'
                }`}
              >
                {filterTab === 'completed' && <Check className="w-3.5 h-3.5 stroke-[2.6]" />}
                <span>{t('history.filterCompleted') || 'Completed'}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold leading-none ${
                    filterTab === 'completed'
                      ? 'bg-white/20 text-on-primary'
                      : 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
                  }`}
                >
                  {completedCount}
                </span>
              </button>

              <button
                type="button"
                id="history_filter_active"
                aria-pressed={filterTab === 'active'}
                onClick={() => {
                  triggerHaptic(6);
                  setFilterTab('active');
                }}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-display font-bold border transition-[background-color,border-color,color,transform] duration-150 active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                  filterTab === 'active'
                    ? 'bg-primary text-on-primary border-primary shadow-xs'
                    : 'bg-surface-container-lowest text-on-surface-variant border-[color:var(--yaad-settings-card-border)] hover:border-primary/40'
                }`}
              >
                {filterTab === 'active' && <Check className="w-3.5 h-3.5 stroke-[2.6]" />}
                <span>{t('history.filterActive') || 'In Progress'}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold leading-none ${
                    filterTab === 'active'
                      ? 'bg-white/20 text-on-primary'
                      : 'bg-amber-500/15 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  {activeCount}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Content State: Loading, Empty, No Results, or Cards Grid */}
        {isLoading ? (
          <div
            aria-busy="true"
            aria-label="Loading shopping history"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-full min-h-[132px] bg-surface-container-lowest rounded-2xl p-4 flex flex-col justify-between border border-[color:var(--yaad-settings-card-border)] shadow-[var(--yaad-settings-card-shadow)]"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-full bg-surface-container shrink-0" />
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="w-3/4 h-4 bg-surface-container rounded-md" />
                    <div className="w-1/2 h-3 bg-surface-container-low rounded-md" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-surface-dim/40">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-6 bg-surface-container-low rounded-full" />
                    <div className="w-20 h-6 bg-surface-container-low rounded-full" />
                  </div>
                  <div className="w-14 h-6 bg-surface-container rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : lists.length === 0 ? (
          /* Clean Empty State (When no history exists) */
          <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 bg-surface-container-lowest rounded-3xl border border-[color:var(--yaad-settings-card-border)] my-4 text-center shadow-[var(--yaad-settings-card-shadow)]">
            <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 flex items-center justify-center text-primary mb-4">
              <ClipboardList className="w-8 h-8 text-primary stroke-[2.2]" />
            </div>
            <h3 className="font-display font-bold text-on-surface text-lg sm:text-xl">
              {t('history.emptyTitle') || 'No shopping history yet'}
            </h3>
            <p className="font-body text-xs sm:text-sm text-outline mt-1.5 mb-6 max-w-sm leading-relaxed">
              {t('history.emptySubtitle') ||
                'Your completed trips and active shopping sessions will be stored here.'}
            </p>
            <button
              type="button"
              id="history_empty_create_btn"
              onClick={() => {
                triggerHaptic(14);
                onCreateNewList();
              }}
              className="min-h-[48px] bg-primary hover:bg-[#003527] text-on-primary font-display text-sm sm:text-base font-bold px-7 py-3 rounded-full shadow-sm transition-[transform,background-color] duration-150 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[2.4]" />
              <span>{t('history.createListBtn') || 'Create New List'}</span>
            </button>
          </div>
        ) : displayedLists.length === 0 ? (
          /* No Search / Filter Results State */
          <div className="p-8 bg-surface-container-lowest rounded-3xl border border-[color:var(--yaad-settings-card-border)] text-center shadow-[var(--yaad-settings-card-shadow)] flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-3">
              <Search className="w-5 h-5 text-outline" />
            </div>
            <h3 className="font-display font-bold text-on-surface text-base">
              {t('history.noSearchResults') || 'No matching shopping sessions'}
            </h3>
            <p className="font-body text-xs sm:text-sm text-outline mt-1 max-w-xs leading-relaxed">
              {t('history.noSearchResultsDesc') ||
                'Try searching for a different list title or item name, or create a brand new list.'}
            </p>
            <div className="flex items-center justify-center gap-2.5 flex-wrap mt-5">
              <button
                type="button"
                id="history_reset_filters_btn"
                onClick={() => {
                  triggerHaptic(8);
                  setSearchQuery('');
                  setFilterTab('all');
                }}
                className="min-h-[44px] px-4 py-2 bg-surface-container rounded-full text-xs font-display font-bold text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                {t('history.resetFilters') || 'Reset Filters'}
              </button>
              <button
                type="button"
                id="history_no_results_create_btn"
                onClick={() => {
                  triggerHaptic(14);
                  onCreateNewList();
                }}
                className="min-h-[44px] px-5 py-2 bg-primary hover:bg-[#003527] text-on-primary rounded-full text-xs font-display font-bold transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('history.createListBtn') || 'Create New List'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Populated Responsive Cards Grid + Create New List CTA */
          <div className="flex flex-col gap-5">
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
                  onShareList={(l) => setShareModalList(l)}
                  isOnline={isOnline}
                  variant="history"
                  selectable={isSelectionMode}
                  selected={selectedIds.has(list.id)}
                  onToggleSelect={handleToggleSelectOne}
                  onLongPress={handleLongPressCard}
                />
              ))}
            </div>

            {/* Clear Create New List CTA clearing bottom nav + safe area */}
            <div className="pt-1 flex justify-center">
              <button
                type="button"
                id="history_create_list_cta"
                onClick={() => {
                  triggerHaptic(14);
                  onCreateNewList();
                }}
                className="w-full sm:w-auto sm:min-w-[260px] min-h-[50px] px-6 py-3 rounded-2xl bg-primary hover:bg-[#003527] text-on-primary font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.98] transition-[transform,background-color,opacity] duration-150 cursor-pointer"
              >
                <Plus className="w-5 h-5 stroke-[2.4]" />
                <span>{t('history.createListBtn') || 'Create New List'}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 ${
            canAnimate ? 'animate-fade-in' : ''
          }`}
          onClick={() => !isDeleting && setShowBulkDeleteModal(false)}
        >
          <div
            className={`bg-surface-container-lowest rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[color:var(--yaad-settings-card-border)] space-y-4 ${
              canAnimate ? 'animate-scale-in' : ''
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900/60">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-extrabold text-on-surface">
                Delete {selectedIds.size} shopping list{selectedIds.size > 1 ? 's' : ''}?
              </h3>
              <p className="font-body text-xs sm:text-sm text-outline mt-1 leading-relaxed">
                These selected shopping lists and their items will be permanently removed. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowBulkDeleteModal(false)}
                className="flex-1 min-h-[44px] py-2.5 rounded-full bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-50"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                type="button"
                id="confirm_bulk_delete_btn"
                disabled={isDeleting}
                onClick={handleConfirmBulkDelete}
                className="flex-1 min-h-[44px] py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-[background-color,opacity] duration-150 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Delete {selectedIds.size}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearAllModal && (
        <div
          role="dialog"
          aria-modal="true"
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 ${
            canAnimate ? 'animate-fade-in' : ''
          }`}
          onClick={() => !isDeleting && setShowClearAllModal(false)}
        >
          <div
            className={`bg-surface-container-lowest rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[color:var(--yaad-settings-card-border)] space-y-4 ${
              canAnimate ? 'animate-scale-in' : ''
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900/60">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-extrabold text-on-surface">
                Clear all shopping history?
              </h3>
              <p className="font-body text-xs sm:text-sm text-outline mt-1 leading-relaxed">
                All {lists.length} shopping lists will be permanently deleted from your account. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowClearAllModal(false)}
                className="flex-1 min-h-[44px] py-2.5 rounded-full bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-50"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                type="button"
                id="confirm_clear_all_btn"
                disabled={isDeleting}
                onClick={handleConfirmClearAll}
                className="flex-1 min-h-[44px] py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-[background-color,opacity] duration-150 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Clear All ({lists.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Undo Toast on Deletion (clears floating BottomNavBar + safe area) */}
      {deletedListToast && (
        <div
          role="status"
          className={`fixed bottom-[calc(env(safe-area-inset-bottom,0px)+96px)] left-1/2 -translate-x-1/2 z-50 bg-on-surface text-surface px-4 py-2.5 rounded-full shadow-xl flex items-center gap-3 border border-white/10 text-xs font-body ${
            canAnimate ? 'yaad-enter-state' : ''
          }`}
        >
          <span>{t('history.listDeletedToast') || 'Shopping list deleted'}</span>
          {onReuseList && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                onReuseList(deletedListToast.list);
                if (deletedListToast.timeoutId) clearTimeout(deletedListToast.timeoutId);
                setDeletedListToast(null);
              }}
              className="text-[#FCBC1F] font-bold hover:underline flex items-center gap-1 cursor-pointer min-h-[32px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('history.restoreBtn') || 'Restore'}</span>
            </button>
          )}
        </div>
      )}

      {/* Share List Modal */}
      <ShareListModal
        isOpen={Boolean(shareModalList)}
        list={shareModalList}
        onClose={() => setShareModalList(null)}
      />
    </div>
  );
};
