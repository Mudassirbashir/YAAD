import React from 'react';
import { Clock, Heart, Grid, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface QuickActionsGridProps {
  onOpenRecentLists: () => void;
  onOpenFavorites: () => void;
  onOpenCategories: () => void;
  onOpenStatistics: () => void;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  onOpenRecentLists,
  onOpenFavorites,
  onOpenCategories,
  onOpenStatistics,
}) => {
  const { t } = useLanguage();

  return (
    <section id="home_quick_actions" aria-label={t('home.quickActions.title') || 'Quick Actions'}>
      <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 select-none">
        {/* 1. Recent Lists */}
        <button
          type="button"
          id="quick_action_recent_lists"
          onClick={onOpenRecentLists}
          className="h-[76px] sm:h-[84px] md:h-[92px] rounded-2xl sm:rounded-3xl bg-white dark:bg-stone-900 border border-surface-dim/70 shadow-2xs hover:border-primary/30 hover:shadow-xs active:scale-95 transition-all flex flex-col items-center justify-center p-1.5 sm:p-2 gap-1 sm:gap-1.5 group cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/15 transition-colors">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </div>
          <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-on-surface font-['Manrope'] truncate max-w-[95%]">
            {t('home.quickActions.recentLists')}
          </span>
        </button>

        {/* 2. Favorites */}
        <button
          type="button"
          id="quick_action_favorites"
          onClick={onOpenFavorites}
          className="h-[76px] sm:h-[84px] md:h-[92px] rounded-2xl sm:rounded-3xl bg-white dark:bg-stone-900 border border-surface-dim/70 shadow-2xs hover:border-primary/30 hover:shadow-xs active:scale-95 transition-all flex flex-col items-center justify-center p-1.5 sm:p-2 gap-1 sm:gap-1.5 group cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/15 transition-colors">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-primary/15 stroke-[2.2]" />
          </div>
          <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-on-surface font-['Manrope'] truncate max-w-[95%]">
            {t('home.quickActions.favorites')}
          </span>
        </button>

        {/* 3. Categories */}
        <button
          type="button"
          id="quick_action_categories"
          onClick={onOpenCategories}
          className="h-[76px] sm:h-[84px] md:h-[92px] rounded-2xl sm:rounded-3xl bg-white dark:bg-stone-900 border border-surface-dim/70 shadow-2xs hover:border-primary/30 hover:shadow-xs active:scale-95 transition-all flex flex-col items-center justify-center p-1.5 sm:p-2 gap-1 sm:gap-1.5 group cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/15 transition-colors">
            <Grid className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </div>
          <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-on-surface font-['Manrope'] truncate max-w-[95%]">
            {t('home.quickActions.categories')}
          </span>
        </button>

        {/* 4. Statistics */}
        <button
          type="button"
          id="quick_action_statistics"
          onClick={onOpenStatistics}
          className="h-[76px] sm:h-[84px] md:h-[92px] rounded-2xl sm:rounded-3xl bg-white dark:bg-stone-900 border border-surface-dim/70 shadow-2xs hover:border-primary/30 hover:shadow-xs active:scale-95 transition-all flex flex-col items-center justify-center p-1.5 sm:p-2 gap-1 sm:gap-1.5 group cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/15 transition-colors">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </div>
          <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-on-surface font-['Manrope'] truncate max-w-[95%]">
            {t('home.quickActions.statistics')}
          </span>
        </button>
      </div>
    </section>
  );
};
