import React, { useMemo } from 'react';
import { ListChecks, Bookmark, LayoutGrid, BarChart3 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ShoppingList } from '../../types';

interface QuickActionsGridProps {
  lists?: ShoppingList[];
  onOpenRecentLists: () => void;
  onOpenFavorites: () => void;
  onOpenCategories: () => void;
  onOpenStatistics: () => void;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  lists = [],
  onOpenRecentLists,
  onOpenFavorites,
  onOpenCategories,
  onOpenStatistics,
}) => {
  const { t } = useLanguage();

  // Compute real statistics from Supabase lists
  const stats = useMemo(() => {
    const totalLists = lists.length;
    const activeLists = lists.filter((l) => !l.isCompleted).length;
    const totalItems = lists.reduce((acc, l) => acc + (l.items?.length || 0), 0);
    const completedItems = lists.reduce(
      (acc, l) => acc + (l.items?.filter((i) => i.completed).length || 0),
      0
    );
    const completionRate =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return { totalLists, activeLists, totalItems, completedItems, completionRate };
  }, [lists]);

  const recentListsSubtitle = useMemo(() => {
    if (stats.totalLists === 0) {
      return t('home.listsAvailableZero') || '0 Lists Available';
    }
    if (stats.totalLists === 1) {
      return t('home.listsAvailableOne') || '1 List Available';
    }
    return t('home.listsAvailable', { count: stats.totalLists }) || `${stats.totalLists} Lists Available`;
  }, [stats.totalLists, t]);

  return (
    <section id="home_quick_actions" aria-label={t('home.quickActions.title') || 'Quick Actions'}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 select-none">
        {/* 1. Recent Lists */}
        <button
          type="button"
          id="quick_action_recent_lists"
          onClick={onOpenRecentLists}
          className="h-12 sm:h-13 rounded-xl sm:rounded-2xl bg-surface-container-lowest border border-surface-dim/75 shadow-2xs hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-xs active:scale-[0.98] transition-all flex items-center px-2.5 py-1.5 sm:px-3 sm:py-2 gap-2 group cursor-pointer text-start"
        >
          <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ListChecks className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-[13px] font-bold text-on-surface font-['Plus_Jakarta_Sans'] truncate leading-tight group-hover:text-primary transition-colors">
              {t('home.quickActions.recentLists')}
            </span>
            <span className="text-[9.5px] sm:text-[10px] font-medium text-outline font-['Manrope'] truncate mt-0.5">
              {recentListsSubtitle}
            </span>
          </div>
        </button>

        {/* 2. Favorites */}
        <button
          type="button"
          id="quick_action_favorites"
          onClick={onOpenFavorites}
          className="h-12 sm:h-13 rounded-xl sm:rounded-2xl bg-surface-container-lowest border border-surface-dim/75 shadow-2xs hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-xs active:scale-[0.98] transition-all flex items-center px-2.5 py-1.5 sm:px-3 sm:py-2 gap-2 group cursor-pointer text-start"
        >
          <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Bookmark className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-[13px] font-bold text-on-surface font-['Plus_Jakarta_Sans'] truncate leading-tight group-hover:text-primary transition-colors">
              {t('home.quickActions.favorites')}
            </span>
            <span className="text-[9.5px] sm:text-[10px] font-medium text-outline font-['Manrope'] truncate mt-0.5">
              {stats.totalItems > 0
                ? `${stats.totalItems} ${t('nav.lists') ? 'Items' : 'Items'}`
                : t('home.quickAdd') || 'Quick Add'}
            </span>
          </div>
        </button>

        {/* 3. Categories */}
        <button
          type="button"
          id="quick_action_categories"
          onClick={onOpenCategories}
          className="h-12 sm:h-13 rounded-xl sm:rounded-2xl bg-surface-container-lowest border border-surface-dim/75 shadow-2xs hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-xs active:scale-[0.98] transition-all flex items-center px-2.5 py-1.5 sm:px-3 sm:py-2 gap-2 group cursor-pointer text-start"
        >
          <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <LayoutGrid className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-[13px] font-bold text-on-surface font-['Plus_Jakarta_Sans'] truncate leading-tight group-hover:text-primary transition-colors">
              {t('home.quickActions.categories')}
            </span>
            <span className="text-[9.5px] sm:text-[10px] font-medium text-outline font-['Manrope'] truncate mt-0.5">
              {t('home.browseAll') || 'Browse All'}
            </span>
          </div>
        </button>

        {/* 4. Statistics */}
        <button
          type="button"
          id="quick_action_statistics"
          onClick={onOpenStatistics}
          className="h-12 sm:h-13 rounded-xl sm:rounded-2xl bg-surface-container-lowest border border-surface-dim/75 shadow-2xs hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-xs active:scale-[0.98] transition-all flex items-center px-2.5 py-1.5 sm:px-3 sm:py-2 gap-2 group cursor-pointer text-start"
        >
          <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <BarChart3 className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-[13px] font-bold text-on-surface font-['Plus_Jakarta_Sans'] truncate leading-tight group-hover:text-primary transition-colors">
              {t('home.quickActions.statistics')}
            </span>
            <span className="text-[9.5px] sm:text-[10px] font-medium text-outline font-['Manrope'] truncate mt-0.5">
              {stats.completionRate > 0
                ? `${stats.completionRate}% ${t('done') || 'Done'}`
                : `${stats.totalItems} Items`}
            </span>
          </div>
        </button>
      </div>
    </section>
  );
};
