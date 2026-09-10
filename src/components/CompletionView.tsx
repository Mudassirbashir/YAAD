import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, CheckCircle2, Home, History, Plus, Clock, ShoppingBag } from 'lucide-react';
import { ShoppingList, CategoryId } from '../types';
import { TopHeader } from './TopHeader';
import { CategoryIcon } from './CategoryIcon';
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
}

export const CompletionView: React.FC<CompletionViewProps> = ({
  list,
  onReturnHome,
  onViewHistory,
  onAddMoreItems,
  onOpenProfile,
}) => {
  const { t, getCategoryName, language } = useLanguage();
  const isUrdu = language === 'ur';

  // Synchronized Sound & Haptic Playback based on tuned config timings
  useEffect(() => {
    const soundTimer = setTimeout(() => {
      playCompletionSound();
    }, YAAD_COMPLETION_CONFIG.timing.soundDelayMs);

    const hapticTimer = setTimeout(() => {
      triggerHaptic(YAAD_COMPLETION_CONFIG.sound.hapticPattern);
    }, YAAD_COMPLETION_CONFIG.timing.hapticDelayMs);

    return () => {
      clearTimeout(soundTimer);
      clearTimeout(hapticTimer);
    };
  }, []);

  // Compute real session metrics
  const totalItemsCount = list.items ? list.items.length : 0;
  const purchasedItems = list.items ? list.items.filter((i) => i.completed) : [];
  const purchasedCount = purchasedItems.length;
  const isAllPurchased = totalItemsCount > 0 && purchasedCount === totalItemsCount;

  // Real completion timestamp from Supabase / list session
  const completedDateObj = list.completedAt
    ? new Date(list.completedAt)
    : list.completedTimestamp
    ? new Date(list.completedTimestamp)
    : new Date();

  const formattedDate = formatExactDate(completedDateObj, { includeWeekday: true });
  const formattedTime = formatExactTime(completedDateObj);

  // Group purchased items by Category for clean summary
  const purchasedCategoryIds: CategoryId[] = Array.from(
    new Set(purchasedItems.map((i) => (i.categoryId || 'other') as CategoryId))
  );

  return (
    <div className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto min-h-screen flex flex-col antialiased bg-background pb-24 selection:bg-primary-container selection:text-on-primary-container">
      {/* TopAppBar */}
      <TopHeader
        title={t('appName')}
        onSettingsClick={onOpenProfile}
        onAvatarClick={onOpenProfile}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 md:px-8 space-y-6 pt-2">
        {/* Polished Completion Moment Header */}
        <section className="text-center py-4 space-y-3 flex flex-col items-center select-none">
          {/* Animated Hero Badge Container */}
          <div className="relative mb-1 flex items-center justify-center">
            {/* Subtle Expanding Ambient Halo (Subtle, non-childish luxury aura) */}
            <motion.div
              initial={{ scale: YAAD_COMPLETION_CONFIG.motion.haloScaleRange[0], opacity: 0 }}
              animate={{
                scale: [
                  YAAD_COMPLETION_CONFIG.motion.haloScaleRange[0],
                  YAAD_COMPLETION_CONFIG.motion.haloScaleRange[1],
                  YAAD_COMPLETION_CONFIG.motion.haloScaleRange[2],
                ],
                opacity: [
                  YAAD_COMPLETION_CONFIG.motion.haloOpacityRange[0],
                  YAAD_COMPLETION_CONFIG.motion.haloOpacityRange[1],
                  YAAD_COMPLETION_CONFIG.motion.haloOpacityRange[2],
                ],
              }}
              transition={{
                duration: YAAD_COMPLETION_CONFIG.timing.heroBadgeDuration * 1.5,
                ease: 'easeOut',
              }}
              className="absolute -inset-5 rounded-full blur-2xl pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${YAAD_COMPLETION_CONFIG.visual.brandEmerald}55 0%, ${YAAD_COMPLETION_CONFIG.visual.brandAmberDot}25 60%, transparent 80%)`,
              }}
            />

            {/* Central Luxury Emerald Brand Badge */}
            <motion.div
              initial={{
                scale: YAAD_COMPLETION_CONFIG.motion.initialBadgeScale,
                opacity: 0,
                y: 12,
              }}
              animate={{
                scale: YAAD_COMPLETION_CONFIG.motion.restingBadgeScale,
                opacity: 1,
                y: 0,
              }}
              transition={{
                type: 'spring',
                stiffness: YAAD_COMPLETION_CONFIG.timing.badgeSpring.stiffness,
                damping: YAAD_COMPLETION_CONFIG.timing.badgeSpring.damping,
                mass: YAAD_COMPLETION_CONFIG.timing.badgeSpring.mass,
                delay: YAAD_COMPLETION_CONFIG.timing.heroBadgeDelay,
              }}
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center shadow-[0px_16px_36px_rgba(10,46,34,0.32)] border border-emerald-500/20 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${YAAD_COMPLETION_CONFIG.visual.brandEmerald} 0%, ${YAAD_COMPLETION_CONFIG.visual.brandEmeraldDeep} 100%)`,
              }}
            >
              {/* Authentic Urdu Brand Script Watermark ("یاد" with signature Amber Dot) */}
              {YAAD_COMPLETION_CONFIG.visual.showBrandWatermark && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 select-none"
                  aria-hidden="true"
                >
                  <span
                    className={`font-urdu-brand text-3xl sm:text-4xl text-emerald-200 tracking-wider font-bold ${
                      isUrdu ? 'scale-110' : ''
                    }`}
                  >
                    یاد
                  </span>
                </div>
              )}

              {/* Animated Stroke Checkmark */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: YAAD_COMPLETION_CONFIG.timing.checkSpring.stiffness,
                  damping: YAAD_COMPLETION_CONFIG.timing.checkSpring.damping,
                  delay: YAAD_COMPLETION_CONFIG.timing.checkMarkDelay,
                }}
                className="relative z-10"
              >
                <svg
                  className="w-12 h-12 sm:w-14 sm:h-14 text-emerald-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path
                    d="M20 6L9 17l-5-5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: 0.38,
                      ease: 'easeInOut',
                      delay: YAAD_COMPLETION_CONFIG.timing.checkMarkDelay + 0.05,
                    }}
                  />
                </svg>
              </motion.div>

              {/* Signature YAAD Golden Accent Dot (Subtle homage to the YAAD brand dot) */}
              <div
                className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full shadow-sm"
                style={{ backgroundColor: YAAD_COMPLETION_CONFIG.visual.brandAmberDot }}
              />
            </motion.div>
          </div>

          {/* Clear "Shopping Complete" Status Pill */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: YAAD_COMPLETION_CONFIG.timing.metricsFadeDelay - 0.1,
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-['Manrope'] font-bold tracking-tight shadow-2xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            <span>{t('completion.badgeCompleted')}</span>
          </motion.div>

          {/* Primary Clear Heading: "Shopping Complete" */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.38,
              delay: YAAD_COMPLETION_CONFIG.timing.metricsFadeDelay,
            }}
            className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-extrabold text-primary tracking-tight leading-tight"
          >
            {t('completion.title')}
          </motion.h2>

          {/* Clear Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.38,
              delay: YAAD_COMPLETION_CONFIG.timing.metricsFadeDelay + 0.06,
            }}
            className="font-['Manrope'] text-sm sm:text-base text-on-surface-variant max-w-sm mx-auto leading-relaxed"
          >
            {t('completion.subtitle')}
          </motion.p>
        </section>

        {/* Real Session Data Summary Card */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            delay: YAAD_COMPLETION_CONFIG.timing.metricsFadeDelay + 0.12,
          }}
          className="bg-surface-container-lowest rounded-3xl shadow-[0px_6px_24px_rgba(10,46,34,0.06)] border border-surface-container-high/80 p-5 space-y-4"
        >
          {/* Header Row: Real List Name & Item Count Badge */}
          <div className="flex justify-between items-center border-b border-surface-dim/60 pb-3">
            <div className="min-w-0 pe-2">
              <span className="text-[11px] uppercase tracking-wider font-['Manrope'] font-bold text-outline">
                {t('completion.sessionDetails')}
              </span>
              <BidiText as="h3" className="font-['Plus_Jakarta_Sans'] text-lg sm:text-xl font-bold text-primary truncate">
                {list.title}
              </BidiText>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 shrink-0">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
              <span className="font-['Manrope'] text-xs font-bold">
                {purchasedCount} / {totalItemsCount}
              </span>
            </div>
          </div>

          {/* Progress & Timestamp Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
            {/* Real Purchased Ratio */}
            <div className="p-3 bg-surface-container-low rounded-2xl border border-surface-dim/50 flex flex-col justify-between">
              <span className="text-xs font-['Manrope'] text-on-surface-variant font-medium">
                {t('completion.purchasedSummary', { bought: purchasedCount, total: totalItemsCount })}
              </span>
              <div className="mt-2 w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: totalItemsCount > 0 ? `${(purchasedCount / totalItemsCount) * 100}%` : '100%',
                  }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>

            {/* Real Completion Timestamp */}
            <div className="p-3 bg-surface-container-low rounded-2xl border border-surface-dim/50 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center shrink-0 text-primary">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-['Manrope'] text-on-surface-variant font-medium">
                  {formattedDate}
                </div>
                <div className="text-xs font-['Manrope'] font-bold text-primary tabular-nums">
                  {formattedTime}
                </div>
              </div>
            </div>
          </div>

          {/* Purchased Items Breakdown */}
          {purchasedItems.length > 0 && (
            <div className="pt-2 space-y-3">
              <span className="text-xs font-['Manrope'] font-bold text-primary">
                {t('completion.itemsPurchasedHeading')}
              </span>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pe-1">
                {purchasedCategoryIds.map((catId) => {
                  const categoryItems = purchasedItems.filter(
                    (i) => (i.categoryId || 'other') === catId
                  );
                  if (categoryItems.length === 0) return null;

                  return (
                    <div key={catId} className="space-y-1.5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-outline-variant/50 bg-surface-bright">
                        <CategoryIcon categoryId={catId} className="w-3.5 h-3.5 text-primary/70" />
                        <span className="font-['Manrope'] text-[11px] font-semibold text-primary">
                          {getCategoryName(catId)}
                        </span>
                      </div>

                      {categoryItems.map((item) => {
                        const formattedQty = item.quantity
                          ? `${item.quantity}${item.unit ? ' ' + item.unit : ''}`
                          : item.note || null;

                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 p-2.5 bg-surface-bright rounded-2xl border border-surface-dim/40"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1" dir="auto">
                              <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-800 border border-emerald-300/60">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                              <BidiText className="font-['Manrope'] text-xs sm:text-sm text-outline line-through truncate font-medium">
                                {item.name}
                              </BidiText>
                            </div>

                            {formattedQty && (
                              <bdi
                                dir="ltr"
                                className="font-['Manrope'] tabular-nums text-xs text-outline bg-surface-container-low px-2 py-0.5 rounded-md shrink-0 font-medium"
                              >
                                {formattedQty}
                              </bdi>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.section>

        {/* Action Buttons: Return to Home smoothly or view history */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            delay: YAAD_COMPLETION_CONFIG.timing.actionsFadeDelay,
          }}
          className="flex flex-col gap-3 pt-1 pb-4"
        >
          {/* Primary Action: Smooth return to Home */}
          <button
            id="completion_return_home_btn"
            onClick={onReturnHome}
            className="w-full h-[54px] rounded-full bg-primary text-on-primary font-['Manrope'] text-base font-bold shadow-[0px_8px_20px_rgba(10,46,34,0.18)] hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>{t('completion.completeTripBtn')}</span>
          </button>

          {/* Secondary Actions: View in History & Continue / Add More */}
          <div className="grid grid-cols-2 gap-3">
            <button
              id="completion_view_history_btn"
              onClick={onViewHistory}
              className="h-[50px] rounded-full bg-surface-container text-primary font-['Manrope'] text-sm font-bold hover:bg-surface-container-high active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-surface-dim cursor-pointer"
            >
              <History className="w-4 h-4" />
              <span>{t('completion.viewHistoryBtn')}</span>
            </button>

            <button
              id="completion_add_more_btn"
              onClick={onAddMoreItems}
              className="h-[50px] rounded-full bg-surface-container-low text-primary font-['Manrope'] text-sm font-bold hover:bg-surface-container-highest active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-surface-dim cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('completion.addMoreBtn')}</span>
            </button>
          </div>
        </motion.section>
      </main>
    </div>
  );
};
