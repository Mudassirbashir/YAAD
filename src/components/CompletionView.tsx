import React, { useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  CheckCircle2,
  Home,
  PlusCircle,
  FileEdit,
  Clock,
  ShoppingBag,
  Layers,
  History,
} from 'lucide-react';
import { ShoppingList, CategoryId } from '../types';
import { TopHeader } from './TopHeader';
import { CategoryIcon } from './CategoryIcon';
import { ItemVisualIcon } from './ItemVisualIcon';
import { useLanguage } from '../context/LanguageContext';
import { playCompletionSound, triggerHaptic } from '../lib/sound';
import { BidiText } from '../utils/bidi';
import { formatExactDate, formatExactTime } from '../utils/dateFormatting';
import { YAAD_COMPLETION_CONFIG } from '../lib/completionConfig';

interface CompletionViewProps {
  list: ShoppingList;
  onReturnHome: () => void;
  onViewHistory: () => void;
  onAddMoreItems: () => void;
  onOpenProfile: () => void;
  onStartNewList?: () => void;
  onReviewTrip?: () => void;
}

export const CompletionView: React.FC<CompletionViewProps> = ({
  list,
  onReturnHome,
  onViewHistory,
  onAddMoreItems,
  onOpenProfile,
  onStartNewList,
  onReviewTrip,
}) => {
  const { t, getCategoryName, language } = useLanguage();
  const isUrdu = language === 'ur';

  // Sound and gentle haptic feedback on entrance
  useEffect(() => {
    const soundTimer = setTimeout(() => {
      playCompletionSound();
    }, 120);

    const hapticTimer = setTimeout(() => {
      triggerHaptic(20);
    }, 150);

    return () => {
      clearTimeout(soundTimer);
      clearTimeout(hapticTimer);
    };
  }, []);

  // Compute session metrics
  const totalItemsCount = list.items ? list.items.length : 0;
  const purchasedItems = useMemo(
    () => (list.items ? list.items.filter((i) => i.completed) : []),
    [list.items]
  );
  const purchasedCount = purchasedItems.length;

  // Real completion timestamp
  const completedDateObj = useMemo(() => {
    if (list.completedAt) return new Date(list.completedAt);
    if (list.completedTimestamp) return new Date(list.completedTimestamp);
    return new Date();
  }, [list.completedAt, list.completedTimestamp]);

  const formattedDate = formatExactDate(completedDateObj, { includeWeekday: true });
  const formattedTime = formatExactTime(completedDateObj);

  // Trip duration calculation
  const tripDurationText = useMemo(() => {
    const startMs = list.createdTimestamp;
    const endMs = list.completedTimestamp || completedDateObj.getTime();
    if (startMs && endMs > startMs) {
      const minutes = Math.round((endMs - startMs) / (1000 * 60));
      if (minutes <= 1) return '< 1 min';
      if (minutes < 60) return `${minutes} mins`;
      const hours = Math.floor(minutes / 60);
      const remainingMins = minutes % 60;
      return `${hours}h ${remainingMins}m`;
    }
    return 'Fast trip';
  }, [list.createdTimestamp, list.completedTimestamp, completedDateObj]);

  // Unique categories in purchased items
  const purchasedCategoryIds: CategoryId[] = useMemo(() => {
    return Array.from(
      new Set(purchasedItems.map((i) => (i.categoryId || 'uncategorized') as CategoryId))
    );
  }, [purchasedItems]);

  const handleReviewTrip = () => {
    if (onReviewTrip) {
      onReviewTrip();
    } else {
      onAddMoreItems();
    }
  };

  const handleStartNewList = () => {
    if (onStartNewList) {
      onStartNewList();
    } else {
      onReturnHome();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto min-h-screen flex flex-col antialiased bg-background pb-12 selection:bg-primary-container selection:text-on-primary-container">
      {/* Top Header */}
      <TopHeader
        title={t('appName')}
        onSettingsClick={onOpenProfile}
        onAvatarClick={onOpenProfile}
      />

      {/* Main Container */}
      <main className="flex-1 px-4 sm:px-6 md:px-8 space-y-5 pt-2">
        {/* Compact, Calm Brand Moment */}
        <section className="text-center py-2 flex flex-col items-center select-none">
          {/* Brand Emerald Badge */}
          <div className="relative my-2 flex items-center justify-center">
            {/* Subtle atmospheric glow */}
            <div
              className="absolute -inset-4 rounded-full blur-xl opacity-30 pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${YAAD_COMPLETION_CONFIG.visual.brandEmerald} 0%, transparent 70%)`,
              }}
            />

            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-[0px_12px_30px_rgba(10,46,34,0.25)] border border-emerald-500/25 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${YAAD_COMPLETION_CONFIG.visual.brandEmerald} 0%, ${YAAD_COMPLETION_CONFIG.visual.brandEmeraldDeep} 100%)`,
              }}
            >
              {/* Animated Stroke Checkmark */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 450, damping: 26, delay: 0.12 }}
                className="relative z-10"
              >
                <Check className="w-9 h-9 sm:w-10 sm:h-10 text-emerald-100 stroke-[3.2] drop-shadow-xs" />
              </motion.div>

              {/* Signature YAAD Golden Accent Dot */}
              <div
                className="absolute top-2 right-2 w-2 h-2 rounded-full shadow-xs"
                style={{ backgroundColor: YAAD_COMPLETION_CONFIG.visual.brandAmberDot }}
              />
            </motion.div>
          </div>

          {/* Heading & Subtitle with Newsreader and Manrope Typography */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.15 }}
            className="space-y-1 mt-1"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs font-['Manrope'] font-bold tracking-tight">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Shopping Completed</span>
            </div>

            <h1 className="font-['Newsreader'] text-2xl sm:text-3xl font-bold text-primary tracking-tight">
              {list.title}
            </h1>

            <p className="font-['Manrope'] text-xs sm:text-sm text-on-surface-variant max-w-xs sm:max-w-sm mx-auto">
              All marked items collected. Your trip is saved.
            </p>
          </motion.div>
        </section>

        {/* Clear Summary Metrics Grid */}
        <section className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {/* 1. Items Completed */}
          <div className="bg-surface-container-lowest rounded-2xl p-3 sm:p-3.5 border border-surface-container-high/80 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-outline text-[11px] font-['Manrope'] font-semibold">
              <ShoppingBag className="w-3.5 h-3.5 text-primary" />
              <span className="truncate">Items</span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="font-['Newsreader'] text-xl sm:text-2xl font-bold text-primary tabular-nums">
                {purchasedCount}
              </span>
              <span className="text-[11px] text-outline font-['Manrope'] font-medium">
                /{totalItemsCount}
              </span>
            </div>
          </div>

          {/* 2. Trip Duration & Time */}
          <div className="bg-surface-container-lowest rounded-2xl p-3 sm:p-3.5 border border-surface-container-high/80 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-outline text-[11px] font-['Manrope'] font-semibold">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span className="truncate">Duration</span>
            </div>
            <div className="mt-1.5">
              <span className="font-['Newsreader'] text-lg sm:text-xl font-bold text-primary tabular-nums">
                {tripDurationText}
              </span>
            </div>
          </div>

          {/* 3. Categories Covered */}
          <div className="bg-surface-container-lowest rounded-2xl p-3 sm:p-3.5 border border-surface-container-high/80 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-outline text-[11px] font-['Manrope'] font-semibold">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span className="truncate">Categories</span>
            </div>
            <div className="mt-1.5">
              <span className="font-['Newsreader'] text-xl sm:text-2xl font-bold text-primary tabular-nums">
                {purchasedCategoryIds.length}
              </span>
            </div>
          </div>
        </section>

        {/* Completed Items Preview (Compact, responsive, space-efficient) */}
        {purchasedItems.length > 0 && (
          <section className="bg-surface-container-lowest rounded-3xl p-4 sm:p-5 border border-surface-container-high/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-surface-dim/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-['Manrope'] text-xs font-bold text-primary uppercase tracking-wider">
                  Purchased Items
                </span>
                <span className="text-[11px] font-['Manrope'] px-2 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-800/40">
                  {purchasedCount}
                </span>
              </div>
              <span className="text-[11px] font-['Manrope'] text-outline">
                {formattedTime}
              </span>
            </div>

            {/* Clean compact list / 2-column grid on wider screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pe-1">
              {purchasedItems.map((item) => {
                const formattedQty = item.planned_quantity || item.quantity
                  ? `${item.planned_quantity || item.quantity}${
                      item.planned_unit || item.unit ? ' ' + (item.planned_unit || item.unit) : ''
                    }`
                  : item.note || null;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-surface-bright border border-surface-dim/40 shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-5 h-5 rounded-full bg-[#0F3D2E] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <ItemVisualIcon
                        name={item.name}
                        canonicalName={item.canonicalName || item.canonical_name}
                        displayName={item.name}
                        categoryId={item.categoryId}
                        size={28}
                        className="w-7 h-7 rounded-lg shrink-0 opacity-80"
                      />
                      <BidiText className="font-['Newsreader'] text-sm text-on-surface font-medium truncate">
                        {item.name}
                      </BidiText>
                    </div>

                    {formattedQty && (
                      <bdi
                        dir="ltr"
                        className="font-['Manrope'] tabular-nums text-[11px] font-bold text-primary bg-surface-container-high px-2 py-0.5 rounded-md shrink-0"
                      >
                        {formattedQty}
                      </bdi>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Working Actions: Done / Return Home, Start New List, Review / Edit Trip */}
        <section className="space-y-2.5 pt-1">
          {/* Primary Action: Done / Return Home */}
          <button
            id="completion_return_home_btn"
            type="button"
            onClick={onReturnHome}
            className="w-full h-[50px] rounded-2xl bg-primary text-on-primary font-['Manrope'] text-sm font-bold shadow-sm hover:bg-primary/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Done • Go Home</span>
          </button>

          {/* Secondary Actions Row: Start New List + Review / Edit Trip */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              id="completion_start_new_list_btn"
              type="button"
              onClick={handleStartNewList}
              className="h-[46px] rounded-2xl bg-surface-container hover:bg-surface-container-high text-primary font-['Manrope'] text-xs sm:text-sm font-bold border border-surface-dim/80 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <PlusCircle className="w-4 h-4 text-primary" />
              <span>Start New List</span>
            </button>

            <button
              id="completion_review_trip_btn"
              type="button"
              onClick={handleReviewTrip}
              className="h-[46px] rounded-2xl bg-surface-container-low hover:bg-surface-container text-primary font-['Manrope'] text-xs sm:text-sm font-bold border border-surface-dim/80 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <FileEdit className="w-4 h-4 text-primary" />
              <span>Review Trip</span>
            </button>
          </div>

          {/* View in History Link */}
          <div className="text-center pt-1">
            <button
              id="completion_view_history_link"
              type="button"
              onClick={onViewHistory}
              className="inline-flex items-center gap-1.5 text-xs font-['Manrope'] font-semibold text-outline hover:text-primary transition-colors cursor-pointer py-1"
            >
              <History className="w-3.5 h-3.5" />
              <span>View in History</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
