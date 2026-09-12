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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 select-none">
        {/* Recent Lists */}
        <button
          type="button"
          id="quick_action_recent_lists"
          onClick={onOpenRecentLists}
          className="min-h-[82px] sm:min-h-[92px] rounded-2xl bg-surface-container-lowest border border-surface-dim/70 shadow-2xs hover:border-primary/40 hover:shadow-xs active:scale-[0.98] transition-all flex flex-col items-center justify-center p-2.5 sm:p-3 gap-1 group cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 text-primary border border-primary/15 flex items-center justify-center group-hover:bg-primary/15 transition-colors shrink-0">
            <Clock className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
          </div>
          <span className="text-xs sm:text-[13px] font-bold text-on-surface font-['Plus_Jakarta_Sans'] truncate max-w-[95%] leading-tight">
            {t('home.quickActions.recentLists')}
          </span>
          <span className="text-[10px] sm:text-[11px] font-medium text-outline font-['Manrope'] truncate max-w-[95%]">
            {stats.activeLists > 0
              ? `${stats.activeLists} ${language === 'ur' ? 'فعال' : 'Active'}`
              : `${stats.totalLists} ${language === 'ur' ? 'فہرستیں' : 'Lists'}`}
          </span>
        </button>

        {/* Favorites */}
        <button
          type="button"
          id="quick_action_favorites"
          onClick={onOpenFavorites}
          className="min-h-[82px] sm:min-h-[92px] rounded-2xl bg-surface-container-lowest border border-surface-dim/70 shadow-2xs hover:border-primary/40 hover:shadow-xs active:scale-[0.98] transition-all flex flex-col items-center justify-center p-2.5 sm:p-3 gap-1 group cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 text-primary border border-primary/15 flex items-center justify-center group-hover:bg-primary/15 transition-colors shrink-0">
            <Heart className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-primary/15 stroke-[2.2]" />
          </div>
          <span className="text-xs sm:text-[13px] font-bold text-on-surface font-['Plus_Jakarta_Sans'] truncate max-w-[95%] leading-tight">
            {t('home.quickActions.favorites')}
          </span>
          <span className="text-[10px] sm:text-[11px] font-medium text-outline font-['Manrope'] truncate max-w-[95%]">
            {language === 'ur' ? 'فوری شامل کریں' : 'Quick Add'}
          </span>
        </button>

        {/* Categories */}
        <button
          type="button"
          id="quick_action_categories"
          onClick={onOpenCategories}
          className="min-h-[82px] sm:min-h-[92px] rounded-2xl bg-surface-container-lowest border border-surface-dim/70 shadow-2xs hover:border-primary/40 hover:shadow-xs active:scale-[0.98] transition-all flex flex-col items-center justify-center p-2.5 sm:p-3 gap-1 group cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 text-primary border border-primary/15 flex items-center justify-center group-hover:bg-primary/15 transition-colors shrink-0">
            <Grid className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
          </div>
          <span className="text-xs sm:text-[13px] font-bold text-on-surface font-['Plus_Jakarta_Sans'] truncate max-w-[95%] leading-tight">
            {t('home.quickActions.categories')}
          </span>
          <span className="text-[10px] sm:text-[11px] font-medium text-outline font-['Manrope'] truncate max-w-[95%]">
            {language === 'ur' ? 'تمام اقسام' : 'Browse All'}
          </span>
        </button>

        {/* Statistics */}
        <button
          type="button"
          id="quick_action_statistics"
          onClick={onOpenStatistics}
          className="min-h-[82px] sm:min-h-[92px] rounded-2xl bg-surface-container-lowest border border-surface-dim/70 shadow-2xs hover:border-primary/40 hover:shadow-xs active:scale-[0.98] transition-all flex flex-col items-center justify-center p-2.5 sm:p-3 gap-1 group cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 text-primary border border-primary/15 flex items-center justify-center group-hover:bg-primary/15 transition-colors shrink-0">
            <TrendingUp className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
          </div>
          <span className="text-xs sm:text-[13px] font-bold text-on-surface font-['Plus_Jakarta_Sans'] truncate max-w-[95%] leading-tight">
            {t('home.quickActions.statistics')}
          </span>
          <span className="text-[10px] sm:text-[11px] font-medium text-outline font-['Manrope'] truncate max-w-[95%]">
            {stats.completionRate > 0
              ? `${stats.completionRate}% ${language === 'ur' ? 'مکمل' : 'Done'}`
              : `${stats.totalItems} ${language === 'ur' ? 'اشیاء' : 'Items'}`}
          </span>
        </button>
      </div>
    </section>
  );
};
