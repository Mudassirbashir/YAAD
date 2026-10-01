import React, { useMemo } from 'react';
import { Clock, Heart, Grid, TrendingUp } from 'lucide-react';
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
  const { t, language } = useLanguage();

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

  return (
    <section id="home_quick_actions" aria-label={t('home.quickActions.title') || 'Quick Actions'}>
      <div className="grid grid-cols-4 gap-1.5 sm:gap-3 select-none">
        {/* Recent Lists */}
        <button
          type="button"
          id="quick_action_recent_lists"
          onClick={onOpenRecentLists}
          className="min-h-[74px] sm:min-h-[88px] rounded-2xl bg-surface-container-lowest border border-surface-dim/75 shadow-2xs hover:border-emerald-500/40 hover:shadow-xs active:scale-[0.96] transition-all flex flex-col items-center justify-center p-1.5 sm:p-2.5 gap-0.5 sm:gap-1 group cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all shrink-0 group-hover:scale-105">
            <Clock className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-on-surface font-['Plus_Jakarta_Sans'] truncate max-w-[96%] leading-tight text-center">
            {t('home.quickActions.recentLists')}
          </span>
          <span className="text-[9.5px] sm:text-[10.5px] font-medium text-outline font-['Manrope'] truncate max-w-[96%] text-center">
            {stats.activeLists > 0
              ? `${stats.activeLists} ${t('home.active') || 'Active'}`
              : `${stats.totalLists} ${t('nav.lists') || 'Lists'}`}
          </span>
        </button>

        {/* Favorites */}
        <button
          type="button"
          id="quick_action_favorites"
          onClick={onOpenFavorites}
          className="min-h-[74px] sm:min-h-[88px] rounded-2xl bg-surface-container-lowest border border-surface-dim/75 shadow-2xs hover:border-rose-500/40 hover:shadow-xs active:scale-[0.96] transition-all flex flex-col items-center justify-center p-1.5 sm:p-2.5 gap-0.5 sm:gap-1 group cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center group-hover:bg-rose-500/20 transition-all shrink-0 group-hover:scale-105">
            <Heart className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-rose-500/20 stroke-[2.2]" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-on-surface font-['Plus_Jakarta_Sans'] truncate max-w-[96%] leading-tight text-center">
            {t('home.quickActions.favorites')}
          </span>
          <span className="text-[9.5px] sm:text-[10.5px] font-medium text-outline font-['Manrope'] truncate max-w-[96%] text-center">
            {t('home.quickAdd') || 'Quick Add'}
          </span>
        </button>

        {/* Categories */}
        <button
          type="button"
          id="quick_action_categories"
          onClick={onOpenCategories}
          className="min-h-[74px] sm:min-h-[88px] rounded-2xl bg-surface-container-lowest border border-surface-dim/75 shadow-2xs hover:border-blue-500/40 hover:shadow-xs active:scale-[0.96] transition-all flex flex-col items-center justify-center p-1.5 sm:p-2.5 gap-0.5 sm:gap-1 group cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-all shrink-0 group-hover:scale-105">
            <Grid className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-on-surface font-['Plus_Jakarta_Sans'] truncate max-w-[96%] leading-tight text-center">
            {t('home.quickActions.categories')}
          </span>
          <span className="text-[9.5px] sm:text-[10.5px] font-medium text-outline font-['Manrope'] truncate max-w-[96%] text-center">
            {t('home.browseAll') || 'Browse All'}
          </span>
        </button>

        {/* Statistics */}
        <button
          type="button"
          id="quick_action_statistics"
          onClick={onOpenStatistics}
          className="min-h-[74px] sm:min-h-[88px] rounded-2xl bg-surface-container-lowest border border-surface-dim/75 shadow-2xs hover:border-amber-500/40 hover:shadow-xs active:scale-[0.96] transition-all flex flex-col items-center justify-center p-1.5 sm:p-2.5 gap-0.5 sm:gap-1 group cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/20 transition-all shrink-0 group-hover:scale-105">
            <TrendingUp className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-on-surface font-['Plus_Jakarta_Sans'] truncate max-w-[96%] leading-tight text-center">
            {t('home.quickActions.statistics')}
          </span>
          <span className="text-[9.5px] sm:text-[10.5px] font-medium text-outline font-['Manrope'] truncate max-w-[96%] text-center">
            {stats.completionRate > 0
              ? `${stats.completionRate}% ${t('done') || 'Done'}`
              : `${stats.totalItems} ${t('nav.lists') ? 'Items' : 'Items'}`}
          </span>
        </button>
      </div>
    </section>
  );
};
