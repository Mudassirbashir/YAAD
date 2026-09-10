import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  ShoppingBag,
  CheckCircle2,
  ListChecks,
  Sparkles,
  Calendar,
  Clock,
  ChevronRight,
  ChevronLeft,
  Plus,
  Compass,
  Award,
  Layers,
  BarChart3,
  Check,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { ShoppingList, CategoryId } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { CategoryIcon } from './CategoryIcon';
import { ItemVisualIcon } from './ItemVisualIcon';

interface StatisticsViewProps {
  lists: ShoppingList[];
  onBack: () => void;
  onCreateList?: () => void;
  onSelectList?: (list: ShoppingList) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  lists,
  onBack,
  onCreateList,
  onSelectList,
  isLoading = false,
  error = null,
  onRetry,
}) => {
  const { t, language, isRTL } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  // Chevron icon direction
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  // ---------------------------------------------------------------------------
  // DATA ENGINE: Derive 100% Real User Statistics
  // ---------------------------------------------------------------------------
  const analytics = useMemo(() => {
    const totalLists = lists.length;
    
    // Normalize completion flags for lists
    const completedLists = lists.filter((l) =>
      Boolean(l.isCompleted || l.completed || (l as any).is_completed)
    );
    const activeLists = lists.filter(
      (l) => !Boolean(l.isCompleted || l.completed || (l as any).is_completed)
    );

    // Track items across all lists
    let totalItemsPlanned = 0;
    let totalItemsPurchased = 0;
    const categoryCounts: Record<string, number> = {};
    const itemFrequencyMap: Record<string, { count: number; name: string; category: string }> = {};

    // 7-day activity tracking (Mon-Sun: index 0 to 6)
    // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
    const weekdayActivity = [
      { key: 'mon', count: 0, purchases: 0 },
      { key: 'tue', count: 0, purchases: 0 },
      { key: 'wed', count: 0, purchases: 0 },
      { key: 'thu', count: 0, purchases: 0 },
      { key: 'fri', count: 0, purchases: 0 },
      { key: 'sat', count: 0, purchases: 0 },
      { key: 'sun', count: 0, purchases: 0 },
    ];

    lists.forEach((list) => {
      // Determine day of week from timestamp or date
      let dateObj: Date | null = null;
      if (list.completedAt) {
        dateObj = new Date(list.completedAt);
      } else if (list.createdTimestamp) {
        dateObj = new Date(list.createdTimestamp);
      } else if (list.createdAt) {
        const parsed = Date.parse(list.createdAt);
        if (!isNaN(parsed)) dateObj = new Date(parsed);
      }

      if (dateObj && !isNaN(dateObj.getTime())) {
        // JS getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
        const jsDay = dateObj.getDay();
        const adjustedIdx = jsDay === 0 ? 6 : jsDay - 1; // 0=Mon ... 6=Sun
        weekdayActivity[adjustedIdx].count += 1;
      }

      const items = list.items || [];
      items.forEach((item) => {
        totalItemsPlanned += 1;
        const isBought = Boolean(item.completed || (item as any).is_completed);
        if (isBought) {
          totalItemsPurchased += 1;
          if (dateObj && !isNaN(dateObj.getTime())) {
            const jsDay = dateObj.getDay();
            const adjustedIdx = jsDay === 0 ? 6 : jsDay - 1;
            weekdayActivity[adjustedIdx].purchases += 1;
          }
        }

        // Category frequency (prefer completed items; fallback to planned items if no purchases yet)
        const cat = (item.categoryId || item.category || 'cooking_essentials') as CategoryId;
        categoryCounts[cat] = (categoryCounts[cat] || 0) + (isBought ? 2 : 1);

        // Item name frequency
        const itemName = (item.canonicalName || item.name || '').trim().toLowerCase();
        if (itemName) {
          if (!itemFrequencyMap[itemName]) {
            itemFrequencyMap[itemName] = {
              count: 0,
              name: item.name || item.canonicalName || itemName,
              category: cat,
            };
          }
          itemFrequencyMap[itemName].count += 1;
        }
      });
    });

    const completionRate =
      totalItemsPlanned > 0
        ? Math.round((totalItemsPurchased / totalItemsPlanned) * 100)
        : totalLists > 0 && completedLists.length > 0
        ? 100
        : 0;

    // Sort categories
    const sortedCategories = Object.entries(categoryCounts)
      .map(([catId, score]) => ({
        id: catId as CategoryId,
        score,
      }))
      .sort((a, b) => b.score - a.score);

    const topCategory = sortedCategories.length > 0 ? sortedCategories[0].id : null;

    // Peak shopping day
    let peakDayIdx = 0;
    let maxActivity = 0;
    weekdayActivity.forEach((d, idx) => {
      const metric = d.purchases + d.count * 2;
      if (metric > maxActivity) {
        maxActivity = metric;
        peakDayIdx = idx;
      }
    });

    // Top staple item
    const sortedItems = Object.values(itemFrequencyMap).sort((a, b) => b.count - a.count);
    const topStaple = sortedItems.length > 0 && sortedItems[0].count > 1 ? sortedItems[0] : null;

    // Recent lists (up to 4)
    const recentLists = [...lists]
      .sort((a, b) => {
        const timeA = a.createdTimestamp || (a.completedAt ? Date.parse(a.completedAt) : 0);
        const timeB = b.createdTimestamp || (b.completedAt ? Date.parse(b.completedAt) : 0);
        return timeB - timeA;
      })
      .slice(0, 4);

    return {
      totalLists,
      completedListsCount: completedLists.length,
      activeListsCount: activeLists.length,
      totalItemsPlanned,
      totalItemsPurchased,
      completionRate,
      topCategory,
      sortedCategories: sortedCategories.slice(0, 5),
      weekdayActivity,
      peakDayKey: weekdayActivity[peakDayIdx].key,
      hasActivity: maxActivity > 0,
      topStaple,
      topStaples: sortedItems.slice(0, 4),
      recentLists,
      hasData: totalLists > 0,
    };
  }, [lists]);

  // Max value for activity chart scaling
  const maxDayValue = useMemo(() => {
    const maxVal = Math.max(
      ...analytics.weekdayActivity.map((d) => Math.max(d.purchases, d.count, 1))
    );
    return maxVal;
  }, [analytics.weekdayActivity]);

  // Translated category label helper
  const getCategoryLabel = (catId: CategoryId | string): string => {
    const key = `categories.${catId}`;
    const translated = t(key);
    return translated !== key ? translated : catId.replace(/_/g, ' ');
  };

  // ---------------------------------------------------------------------------
  // SMART INSIGHT GENERATOR (Never fabricates, only states observed patterns)
  // ---------------------------------------------------------------------------
  const smartInsight = useMemo(() => {
    if (!analytics.hasData) return null;

    const insights: Array<{ title: string; description: string; icon: typeof Sparkles }> = [];

    // 1. Completion discipline
    if (analytics.completedListsCount > 0 && analytics.completionRate >= 75) {
      insights.push({
        title: language === 'ur' ? 'بہترین تکمیل کی شرح' : 'Consistent Trip Completion',
        description:
          language === 'ur'
            ? `آپ اپنی لسٹوں کے ${analytics.completionRate}٪ سامان کو کامیابی سے مکمل کرتے ہیں۔`
            : `You complete ${analytics.completionRate}% of the items on your lists, maintaining high shopping efficiency.`,
        icon: Award,
      });
    }

    // 2. Frequent staple item
    if (analytics.topStaple) {
      insights.push({
        title: language === 'ur' ? 'اکثر خریدی جانے والی چیز' : 'Frequent Household Staple',
        description:
          language === 'ur'
            ? `آپ نے "${analytics.topStaple.name}" کو ${analytics.topStaple.count} مختلف خریداری لسٹوں میں شامل کیا۔`
            : `"${analytics.topStaple.name}" appears across ${analytics.topStaple.count} shopping trips as a key staple.`,
        icon: ShoppingBag,
      });
    }

    // 3. Peak Day Pattern
    if (analytics.hasActivity) {
      const dayLabel = t(`statistics.${analytics.peakDayKey}`) || analytics.peakDayKey;
      insights.push({
        title: language === 'ur' ? 'خریداری کا پسندیدہ دن' : 'Primary Shopping Day',
        description:
          language === 'ur'
            ? `آپ کی خریداری کی سرگرمی کا سب سے زیادہ وقت عام طور پر ${dayLabel} کے دن ہوتا ہے۔`
            : `Your shopping routines are most active on ${dayLabel}s.`,
        icon: Calendar,
      });
    }

    // 4. Primary category focus
    if (analytics.topCategory && analytics.totalItemsPurchased > 2) {
      const catName = getCategoryLabel(analytics.topCategory);
      insights.push({
        title: language === 'ur' ? 'اہم خریداری کیٹیگری' : 'Core Shopping Category',
        description:
          language === 'ur'
            ? `آپ کی زیادہ تر خریداری "${catName}" کیٹیگری سے متعلق ہوتی ہے۔`
            : `The majority of your groceries belong to the ${catName} category.`,
        icon: Layers,
      });
    }

    // Pick top primary insight
    return insights.length > 0 ? insights[0] : null;
  }, [analytics, language, t]);

  return (
    <div
      id="statistics_screen_container"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-surface-container-lowest text-on-surface font-['Plus_Jakarta_Sans'] pb-28 selection:bg-[#0F3D2E]/10"
    >
      {/* ==================================================================== */}
      {/* 1. HEADER                                                            */}
      {/* ==================================================================== */}
      <header
        id="statistics_header"
        className="sticky top-0 z-30 bg-surface-container-lowest/90 backdrop-blur-md border-b border-surface-dim px-4 sm:px-6 lg:px-8 py-3.5 transition-colors"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              id="statistics_back_btn"
              type="button"
              onClick={onBack}
              aria-label="Go Back"
              className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors active:scale-95 cursor-pointer"
            >
              {isRTL ? (
                <ArrowRight className="w-5 h-5 text-on-surface" />
              ) : (
                <ArrowLeft className="w-5 h-5 text-on-surface" />
              )}
            </button>
            <div>
              <h1
                className={`text-xl font-bold text-on-surface tracking-tight leading-tight ${
                  language === 'ur' ? 'font-urdu text-2xl' : "font-['Manrope']"
                }`}
              >
                {t('statistics.title')}
              </h1>
              <p className="text-xs text-outline font-medium font-['Manrope']">
                {t('statistics.subtitle')}
              </p>
            </div>
          </div>

          <button
            id="statistics_done_btn"
            type="button"
            onClick={onBack}
            className="px-4 py-1.5 text-sm font-semibold text-[#0F3D2E] bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors active:scale-95 cursor-pointer"
          >
            {t('statistics.done')}
          </button>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* MAIN CONTAINER                                                       */}
      {/* ==================================================================== */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 sm:space-y-7">
        {/* Error Banner if fetch failed */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 flex items-center justify-between gap-3 text-rose-800 dark:text-rose-200 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <p className="text-xs sm:text-sm font-medium font-['Manrope']">{error}</p>
            </div>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/50 dark:hover:bg-rose-900/80 text-rose-900 dark:text-rose-100 text-xs font-semibold font-['Manrope'] transition-colors shrink-0 active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="space-y-6 animate-pulse" aria-label="Loading statistics...">
            {/* Top 4 Metrics Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-5 border border-surface-dim/60 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-2xl bg-surface-container-high/60" />
                    <div className="w-12 h-4 rounded-md bg-surface-container-high/40" />
                  </div>
                  <div className="w-16 h-7 rounded-lg bg-surface-container-high/70" />
                  <div className="w-24 h-3.5 rounded bg-surface-container-high/50" />
                </div>
              ))}
            </div>

            {/* Bento Grid Skeleton: Chart & Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-surface-dim/60 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-36 h-5 rounded bg-surface-container-high/60" />
                  <div className="w-20 h-4 rounded bg-surface-container-high/40" />
                </div>
                <div className="h-44 rounded-2xl bg-surface-container-low/50" />
              </div>
              <div className="bg-white rounded-3xl p-6 border border-surface-dim/60 shadow-2xs space-y-4">
                <div className="w-32 h-5 rounded bg-surface-container-high/60" />
                <div className="space-y-3 pt-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-surface-container-high/50" />
                        <div className="w-24 h-4 rounded bg-surface-container-high/50" />
                      </div>
                      <div className="w-10 h-4 rounded bg-surface-container-high/40" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : !analytics.hasData ? (
          <motion.div
            id="statistics_empty_state"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-white rounded-3xl p-8 sm:p-10 border border-surface-dim/70 shadow-xs text-center flex flex-col items-center justify-center space-y-5 my-6"
          >
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#0F3D2E] flex items-center justify-center shadow-xs border border-emerald-100/60">
              <TrendingUp className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div className="space-y-2 max-w-md">
              <h2
                className={`text-lg sm:text-xl font-bold text-on-surface ${
                  language === 'ur' ? 'font-urdu text-xl sm:text-2xl' : "font-['Manrope']"
                }`}
              >
                {t('statistics.emptyTitle')}
              </h2>
              <p className="text-sm text-outline leading-relaxed font-['Manrope']">
                {t('statistics.emptySubtitle')}
              </p>
            </div>

            {onCreateList && (
              <button
                id="statistics_empty_create_btn"
                type="button"
                onClick={onCreateList}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0F3D2E] hover:bg-[#145B3A] text-white text-sm font-bold shadow-[0_4px_16px_rgba(15,61,46,0.25)] hover:shadow-[0_6px_20px_rgba(15,61,46,0.35)] transition-all active:scale-95 cursor-pointer mt-2"
              >
                <Plus className="w-4 h-4 stroke-[2.6]" />
                <span>{t('statistics.createFirstList')}</span>
              </button>
            )}
          </motion.div>
        ) : (
          <>
            {/* ================================================================ */}
            {/* 2. OVERVIEW METRICS BENTO GRID                                    */}
            {/* ================================================================ */}
            <motion.section
              id="statistics_overview_section"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-50 text-[#0F3D2E] flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <h2
                    className={`text-base font-bold text-on-surface tracking-tight ${
                      language === 'ur' ? 'font-urdu text-lg' : "font-['Manrope']"
                    }`}
                  >
                    {t('statistics.overview')}
                  </h2>
                </div>

                <span className="text-xs font-semibold text-outline font-['Manrope']">
                  {analytics.totalLists} {analytics.totalLists === 1 ? 'list' : 'lists'}
                </span>
              </div>

              {/* 4-Card Balanced Bento Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Metric 1: Completed Trips */}
                <div
                  id="metric_card_completed_trips"
                  className="bg-white rounded-2xl p-4 sm:p-4.5 border border-surface-dim/70 shadow-xs flex flex-col justify-between transition-all hover:border-[#0F3D2E]/20"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-outline font-['Manrope']">
                      {t('statistics.completedLists')}
                    </span>
                    <div className="w-7 h-7 rounded-xl bg-emerald-50 text-[#0F3D2E] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#0F3D2E] font-['Plus_Jakarta_Sans'] leading-none">
                      {analytics.completedListsCount}
                    </div>
                    <div className="text-[11px] text-outline font-medium font-['Manrope'] mt-1">
                      {analytics.totalLists > 0
                        ? `${Math.round((analytics.completedListsCount / analytics.totalLists) * 100)}% of lists`
                        : '—'}
                    </div>
                  </div>
                </div>

                {/* Metric 2: Active Lists */}
                <div
                  id="metric_card_active_lists"
                  className="bg-white rounded-2xl p-4 sm:p-4.5 border border-surface-dim/70 shadow-xs flex flex-col justify-between transition-all hover:border-[#0F3D2E]/20"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-outline font-['Manrope']">
                      {t('statistics.activeLists')}
                    </span>
                    <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                      <ListChecks className="w-4 h-4 stroke-[2.2]" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-on-surface font-['Plus_Jakarta_Sans'] leading-none">
                      {analytics.activeListsCount}
                    </div>
                    <div className="text-[11px] text-outline font-medium font-['Manrope'] mt-1">
                      {analytics.activeListsCount > 0 ? 'Ready to shop' : 'All caught up'}
                    </div>
                  </div>
                </div>

                {/* Metric 3: Items Purchased */}
                <div
                  id="metric_card_items_purchased"
                  className="bg-white rounded-2xl p-4 sm:p-4.5 border border-surface-dim/70 shadow-xs flex flex-col justify-between transition-all hover:border-[#0F3D2E]/20"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-outline font-['Manrope']">
                      {t('statistics.itemsPurchased')}
                    </span>
                    <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-on-surface font-['Plus_Jakarta_Sans'] leading-none">
                      {analytics.totalItemsPurchased}
                    </div>
                    <div className="text-[11px] text-outline font-medium font-['Manrope'] mt-1">
                      {analytics.totalItemsPlanned > 0
                        ? `of ${analytics.totalItemsPlanned} planned`
                        : '—'}
                    </div>
                  </div>
                </div>

                {/* Metric 4: Completion Rate */}
                <div
                  id="metric_card_completion_rate"
                  className="bg-white rounded-2xl p-4 sm:p-4.5 border border-surface-dim/70 shadow-xs flex flex-col justify-between transition-all hover:border-[#0F3D2E]/20"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-outline font-['Manrope']">
                      {t('statistics.completionRate')}
                    </span>
                    <div className="w-7 h-7 rounded-xl bg-emerald-50 text-[#0F3D2E] flex items-center justify-center shrink-0">
                      <TrendingUp className="w-4 h-4 stroke-[2.2]" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#0F3D2E] font-['Plus_Jakarta_Sans'] leading-none">
                      {analytics.completionRate}%
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className="bg-[#0F3D2E] h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(5, analytics.completionRate))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* ================================================================ */}
            {/* 3. SMART INSIGHT (PERSONAL SHOPPING MEMORY HIGHLIGHT)             */}
            {/* ================================================================ */}
            {smartInsight && (
              <motion.section
                id="statistics_smart_insight"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.05, ease: 'easeOut' }}
                className="bg-emerald-50/90 border border-emerald-200/70 rounded-3xl p-4 sm:p-5 shadow-xs flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#0F3D2E] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Sparkles className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F3D2E]/80 font-['Manrope']">
                      {t('statistics.smartInsightsTitle')}
                    </span>
                  </div>
                  <h3
                    className={`text-sm sm:text-base font-bold text-emerald-950 ${
                      language === 'ur' ? 'font-urdu text-base sm:text-lg' : "font-['Manrope']"
                    }`}
                  >
                    {smartInsight.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-900/80 leading-relaxed font-['Manrope']">
                    {smartInsight.description}
                  </p>
                </div>
              </motion.section>
            )}

            {/* ================================================================ */}
            {/* 4. SHOPPING ACTIVITY & TOP CATEGORIES (2-Col on Tablet/Desktop)  */}
            {/* ================================================================ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {/* Activity Histogram Card */}
              <motion.section
                id="statistics_activity_card"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, delay: 0.08, ease: 'easeOut' }}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-surface-dim/70 shadow-xs flex flex-col justify-between space-y-5"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <h3
                      className={`text-base font-bold text-on-surface ${
                        language === 'ur' ? 'font-urdu text-lg' : "font-['Manrope']"
                      }`}
                    >
                      {t('statistics.activityTitle')}
                    </h3>
                    <p className="text-xs text-outline font-medium font-['Manrope']">
                      {t('statistics.activitySubtitle')}
                    </p>
                  </div>

                  {analytics.hasActivity && (
                    <span className="text-xs font-bold text-[#0F3D2E] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/80 font-['Manrope']">
                      {t('statistics.mostActiveDay', {
                        day: t(`statistics.${analytics.peakDayKey}`) || analytics.peakDayKey,
                      })}
                    </span>
                  )}
                </div>

                {/* 7-Day Activity Rhythm Bars */}
                <div className="pt-2 pb-1">
                  <div className="flex items-end justify-between gap-2 h-28 px-1">
                    {analytics.weekdayActivity.map((day, idx) => {
                      const totalDayScore = day.purchases + day.count;
                      const heightPercent =
                        totalDayScore > 0
                          ? Math.max(14, Math.round((totalDayScore / maxDayValue) * 100))
                          : 8;
                      const isPeak = day.key === analytics.peakDayKey && totalDayScore > 0;
                      const isSelected = selectedDayIndex === idx;

                      return (
                        <div
                          key={day.key}
                          onClick={() => setSelectedDayIndex(isSelected ? null : idx)}
                          className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                        >
                          {/* Tooltip on hover/select */}
                          <div
                            className={`text-[10px] font-bold py-0.5 px-1.5 rounded-md mb-1.5 transition-all duration-150 ${
                              isSelected || isPeak
                                ? 'bg-[#0F3D2E] text-white opacity-100 scale-100'
                                : 'text-outline opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            {day.purchases > 0 ? day.purchases : day.count > 0 ? `${day.count}L` : '0'}
                          </div>

                          {/* Bar Capsule */}
                          <div className="w-full max-w-[28px] bg-surface-container rounded-full h-full flex flex-col justify-end p-0.5">
                            <div
                              className={`w-full rounded-full transition-all duration-300 ${
                                isPeak
                                  ? 'bg-[#0F3D2E] shadow-[0_2px_8px_rgba(15,61,46,0.3)]'
                                  : totalDayScore > 0
                                  ? 'bg-[#145B3A] opacity-80 group-hover:opacity-100'
                                  : 'bg-surface-dim/40'
                              }`}
                              style={{ height: `${heightPercent}%` }}
                            />
                          </div>

                          {/* Day Label */}
                          <span
                            className={`text-[11px] font-['Manrope'] mt-2 transition-colors ${
                              isPeak || isSelected
                                ? 'font-bold text-[#0F3D2E]'
                                : 'font-medium text-outline'
                            }`}
                          >
                            {t(`statistics.${day.key}`)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="text-[11px] text-outline font-medium font-['Manrope'] pt-2 border-t border-surface-dim/50 flex items-center justify-between">
                  <span>{t('statistics.activityHint')}</span>
                  <span className="inline-flex items-center gap-1 text-[#0F3D2E] font-semibold">
                    <Clock className="w-3 h-3" />
                    <span>{analytics.totalLists} trips recorded</span>
                  </span>
                </div>
              </motion.section>

              {/* Top Categories Card */}
              <motion.section
                id="statistics_categories_card"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.26, delay: 0.1, ease: 'easeOut' }}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-surface-dim/70 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <h3
                      className={`text-base font-bold text-on-surface ${
                        language === 'ur' ? 'font-urdu text-lg' : "font-['Manrope']"
                      }`}
                    >
                      {t('statistics.topCategoriesTitle')}
                    </h3>
                    <p className="text-xs text-outline font-medium font-['Manrope']">
                      {t('statistics.topCategoriesSubtitle')}
                    </p>
                  </div>
                </div>

                {/* Categories List */}
                <div className="space-y-3 pt-1">
                  {analytics.sortedCategories.length > 0 ? (
                    analytics.sortedCategories.map((cat, idx) => {
                      const maxScore = analytics.sortedCategories[0]?.score || 1;
                      const percent = Math.max(12, Math.round((cat.score / maxScore) * 100));
                      const label = getCategoryLabel(cat.id);

                      return (
                        <div key={cat.id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-['Manrope']">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#0F3D2E] flex items-center justify-center shrink-0">
                                <CategoryIcon categoryId={cat.id} className="w-3.5 h-3.5 stroke-[2.2]" />
                              </div>
                              <span className="font-semibold text-on-surface truncate max-w-[150px] sm:max-w-[180px]">
                                {label}
                              </span>
                            </div>
                            <span className="text-outline font-medium">
                              {cat.score} {cat.score === 1 ? 'item' : 'items'}
                            </span>
                          </div>

                          <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all duration-400 ${
                                idx === 0
                                  ? 'bg-[#0F3D2E]'
                                  : idx === 1
                                  ? 'bg-[#145B3A]'
                                  : 'bg-[#145B3A]/60'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-xs text-outline font-['Manrope']">
                      {t('statistics.noData')}
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-outline font-medium font-['Manrope'] pt-2 border-t border-surface-dim/50">
                  {analytics.topCategory
                    ? `Top focus: ${getCategoryLabel(analytics.topCategory)}`
                    : t('statistics.noData')}
                </div>
              </motion.section>
            </div>

            {/* ================================================================ */}
            {/* 5. TOP HOUSEHOLD STAPLES                                          */}
            {/* ================================================================ */}
            {analytics.topStaples && analytics.topStaples.length > 0 && (
              <motion.section
                id="statistics_top_staples_section"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.26, delay: 0.11, ease: 'easeOut' }}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-surface-dim/70 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3
                      className={`text-base font-bold text-on-surface ${
                        language === 'ur' ? 'font-urdu text-lg' : "font-['Manrope']"
                      }`}
                    >
                      {language === 'ur' ? 'اہم گھریلو سودا سلف' : 'Top Household Staples'}
                    </h3>
                    <p className="text-xs text-outline font-medium font-['Manrope']">
                      {language === 'ur'
                        ? 'آپ کی لسٹوں میں سب سے زیادہ شامل کی گئی اشیاء'
                        : 'Most frequently added items across your shopping lists'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {analytics.topStaples.map((staple) => (
                    <div
                      key={staple.name}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low/70 border border-surface-dim/60"
                    >
                      <ItemVisualIcon
                        name={staple.name}
                        canonicalName={staple.name}
                        displayName={staple.name}
                        categoryId={staple.category}
                        size={40}
                        className="w-10 h-10 rounded-xl shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-['Manrope'] font-bold text-sm text-on-surface block truncate capitalize">
                          {staple.name}
                        </span>
                        <span className="text-xs text-outline font-['Manrope'] truncate block">
                          {getCategoryLabel(staple.category)}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#0F3D2E] bg-emerald-50 px-2.5 py-1 rounded-full shrink-0">
                        {staple.count}×
                      </span>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* ================================================================ */}
            {/* 6. RECENT SHOPPING LISTS                                          */}
            {/* ================================================================ */}
            {analytics.recentLists.length > 0 && (
              <motion.section
                id="statistics_recent_lists_section"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: 0.12, ease: 'easeOut' }}
                className="space-y-3 pt-2"
              >
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-50 text-[#0F3D2E] flex items-center justify-center">
                      <Clock className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <h2
                      className={`text-base font-bold text-on-surface tracking-tight ${
                        language === 'ur' ? 'font-urdu text-lg' : "font-['Manrope']"
                      }`}
                    >
                      {t('statistics.recentTripsTitle')}
                    </h2>
                  </div>
                  <span className="text-xs text-outline font-medium font-['Manrope']">
                    {t('statistics.recentTripsSubtitle')}
                  </span>
                </div>

                {/* List Cards */}
                <div className="space-y-2.5">
                  {analytics.recentLists.map((list) => {
                    const isDone = Boolean(list.isCompleted || list.completed || (list as any).is_completed);
                    const items = list.items || [];
                    const totalItems = items.length;
                    const boughtItems = items.filter((i) => i.completed || (i as any).is_completed).length;

                    return (
                      <div
                        key={list.id}
                        id={`recent_trip_${list.id}`}
                        onClick={() => onSelectList && onSelectList(list)}
                        className="bg-white rounded-2xl p-3.5 sm:p-4 border border-surface-dim/70 shadow-xs hover:border-[#0F3D2E]/30 transition-all flex items-center justify-between gap-3 active:scale-[0.99] cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                              isDone
                                ? 'bg-emerald-50 text-[#0F3D2E]'
                                : 'bg-surface-container text-outline'
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                            ) : (
                              <ShoppingBag className="w-5 h-5 stroke-[2]" />
                            )}
                          </div>

                          <div className="min-w-0 space-y-0.5">
                            <h4 className="text-sm font-bold text-on-surface font-['Manrope'] truncate group-hover:text-[#0F3D2E] transition-colors">
                              {list.title}
                            </h4>
                            <p className="text-xs text-outline font-['Manrope'] flex items-center gap-1.5">
                              <span>{list.createdAt || 'Recent trip'}</span>
                              <span>•</span>
                              <span>
                                {t('statistics.itemsCompleted', {
                                  done: boughtItems,
                                  total: totalItems,
                                })}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
                              isDone
                                ? 'bg-emerald-50 text-[#0F3D2E] border border-emerald-100'
                                : 'bg-amber-50 text-amber-800 border border-amber-100'
                            }`}
                          >
                            {isDone ? (
                              <>
                                <Check className="w-3 h-3 stroke-[2.5]" />
                                <span>{t('statistics.statusCompleted')}</span>
                              </>
                            ) : (
                              <span>{t('statistics.statusInProgress')}</span>
                            )}
                          </span>

                          <Chevron className="w-4 h-4 text-outline group-hover:text-on-surface transition-colors" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.section>
            )}
          </>
        )}
      </main>
    </div>
  );
};
