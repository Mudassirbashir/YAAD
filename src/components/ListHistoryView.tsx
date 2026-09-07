import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ShoppingBag,
  ChevronRight,
  Clock,
  Plus,
  AlertCircle,
  RefreshCw,
  Search,
  CheckCircle2,
  WifiOff,
  Database,
  ArrowLeft,
} from 'lucide-react';
import { ShoppingList } from '../types';
import { TopHeader } from './TopHeader';
import { useLanguage } from '../context/LanguageContext';
import { BidiText } from '../utils/bidi';
import { ListIcon } from './ListIcon';
import { formatExactDate, formatExactTime } from '../utils/dateFormatting';
import { getFriendlyErrorMessage } from '../utils/errorFormatting';

interface ListHistoryViewProps {
  lists: ShoppingList[];
  onSelectList: (list: ShoppingList | string) => void;
  onCreateNewList: () => void;
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
        const matchesItems = list.items.some(
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
              className="text-xs sm:text-sm font-semibold text-[#0F3D2E] hover:bg-emerald-50 px-3 py-1.5 rounded-full transition-colors active:scale-95"
            >
              {t('history.backToHome')}
            </button>
          ) : undefined
        }
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-4 flex flex-col gap-5">
        {/* Header Title and Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              {t('history.title')}
            </h1>
            <p className="font-['Manrope'] text-xs sm:text-sm text-outline mt-0.5">
              {t('history.subtitle')}
            </p>
          </div>

          {lists.length > 0 && (
            <button
              type="button"
              id="history_create_new_btn"
              onClick={onCreateNewList}
              className="self-start sm:self-auto px-4 py-2 rounded-full bg-[#0F3D2E] hover:bg-[#145B3A] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.4]" />
              <span>{t('history.createListBtn')}</span>
            </button>
          )}
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
                className="px-3 py-1 bg-white border border-rose-200 rounded-lg font-bold text-rose-700 hover:bg-rose-100/50 transition-colors flex items-center gap-1 shrink-0"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}

        {/* Search & Filter Bar (Only if lists exist) */}
        {lists.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('history.searchPlaceholder')}
                className="w-full h-11 pl-10 pr-4 bg-white border border-surface-dim/80 rounded-xl text-xs sm:text-sm font-['Manrope'] text-on-surface placeholder:text-outline/70 focus:outline-none focus:border-[#0F3D2E] focus:ring-1 focus:ring-[#0F3D2E] shadow-2xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-outline hover:text-on-surface"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center p-1 bg-surface-container rounded-xl gap-1 shrink-0 self-start sm:self-auto border border-surface-dim/60">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-['Manrope'] font-semibold transition-all flex items-center gap-1.5 ${
                  filterTab === 'all'
                    ? 'bg-white text-[#0F3D2E] shadow-xs'
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
                onClick={() => setFilterTab('completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-['Manrope'] font-semibold transition-all flex items-center gap-1.5 ${
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
                onClick={() => setFilterTab('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-['Manrope'] font-semibold transition-all flex items-center gap-1.5 ${
                  filterTab === 'active'
                    ? 'bg-white text-amber-800 shadow-xs'
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

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs border border-surface-dim/60 animate-pulse"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-surface-container shrink-0" />
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="w-48 h-4 bg-surface-container rounded" />
                    <div className="w-32 h-3 bg-surface-container-low rounded" />
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-surface-container shrink-0" />
              </div>
            ))}
          </div>
        ) : lists.length === 0 ? (
          /* Clean Empty State (When no history exists) */
          <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 bg-white rounded-3xl border border-surface-dim/70 my-6 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0F3D2E] mb-4">
              <ShoppingBag className="w-8 h-8 text-[#0F3D2E] stroke-[2]" />
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
              onClick={onCreateNewList}
              className="bg-[#0F3D2E] hover:bg-[#145B3A] text-white font-['Manrope'] text-xs sm:text-sm font-semibold px-6 py-3 rounded-full shadow-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.4]" />
              <span>{t('history.createListBtn')}</span>
            </button>
          </div>
        ) : displayedLists.length === 0 ? (
          /* No search results */
          <div className="p-8 bg-white rounded-2xl border border-surface-dim/70 text-center shadow-xs">
            <Search className="w-8 h-8 text-outline mx-auto mb-2 opacity-50" />
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-on-surface text-sm">
              {t('history.noSearchResults')}
            </p>
            <p className="font-['Manrope'] text-xs text-outline mt-1">
              Try searching for a different title or item name.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterTab('all');
              }}
              className="mt-3 px-3 py-1.5 bg-surface-container rounded-lg text-xs font-semibold text-[#0F3D2E] hover:bg-surface-container-high transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Historical Shopping List Cards (Responsive: 1 col on mobile, 2 on tablet, 3-4 on desktop) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5">
            {displayedLists.map((list) => {
              const totalItems = (list.items || []).length;
              const completedItems = (list.items || []).filter((i) => i.completed).length;
              const isAllDone = list.isCompleted || (totalItems > 0 && completedItems === totalItems);

              const exactDateStr = formatExactDate(list.createdTimestamp || list.createdAt, {
                includeWeekday: true,
              });
              const exactTimeStr = formatExactTime(list.createdTimestamp || list.createdAt);
              const completionTimeStr = (isAllDone && (list.completedTimestamp || list.completedAt))
                ? formatExactTime(list.completedTimestamp || list.completedAt)
                : null;

              return (
                <article
                  key={list.id}
                  id={`history_card_${list.id}`}
                  onClick={() => onSelectList(list)}
                  className="bg-white rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs border border-surface-dim/70 hover:border-[#0F3D2E]/40 hover:shadow-sm cursor-pointer transition-all active:scale-[0.99] group select-none"
                >
                  <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0 pe-3">
                    {/* List Icon */}
                    <ListIcon
                      title={list.title}
                      explicitIcon={list.icon}
                      items={list.items}
                      size="lg"
                      className="shadow-2xs"
                    />

                    {/* Information */}
                    <div className="flex flex-col min-w-0 flex-1">
                      {/* Title & Status Badges */}
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <BidiText
                          as="h3"
                          className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg text-on-surface font-bold group-hover:text-[#0F3D2E] transition-colors truncate"
                        >
                          {list.title}
                        </BidiText>

                        {/* Completed / Incomplete status pill */}
                        {isAllDone ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10.5px] font-bold border border-emerald-200/60 shrink-0">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{t('home.completed')}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10.5px] font-bold border border-amber-200/60 shrink-0">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>{t('home.inProgress') || 'In Progress'}</span>
                          </span>
                        )}

                        {list.isSynced === false && (
                          <span
                            title="Stored in offline cache"
                            className="inline-flex items-center px-2 py-0.5 rounded text-[9.5px] font-medium bg-surface-container text-outline"
                          >
                            Cached
                          </span>
                        )}
                      </div>

                      {/* Date, exact time, and item count */}
                      <div className="flex items-center gap-2.5 text-xs font-['Manrope'] text-outline mt-0.5 flex-wrap">
                        {/* Exact Date */}
                        <span className="flex items-center gap-1 text-on-surface-variant font-medium">
                          <Calendar className="w-3.5 h-3.5 text-outline shrink-0" />
                          <span>{exactDateStr}</span>
                        </span>

                        {/* Exact Time when available */}
                        {exactTimeStr && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-outline shrink-0" />
                              <span>{exactTimeStr}</span>
                            </span>
                          </>
                        )}

                        <span>•</span>

                        {/* Item Count */}
                        <span className="flex items-center gap-1">
                          <ShoppingBag className="w-3.5 h-3.5 text-outline shrink-0" />
                          <span>{t('home.itemsCount', { count: totalItems })}</span>
                        </span>

                        {/* Completion time when available */}
                        {completionTimeStr && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 font-medium">
                              {t('history.completedAt', { time: completionTimeStr }) || `Done at ${completionTimeStr}`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Navigation Arrow */}
                  <div className="w-9 h-9 rounded-full bg-surface-container-low border border-surface-dim/60 flex items-center justify-center text-outline group-hover:text-[#0F3D2E] group-hover:bg-emerald-50 group-hover:border-emerald-200/60 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all shrink-0 rtl:rotate-180">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
