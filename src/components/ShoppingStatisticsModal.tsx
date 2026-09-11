import React from 'react';
import {
  X,
  CheckCircle2,
  ShoppingBag,
  ListChecks,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { ShoppingList } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ShoppingStatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lists: ShoppingList[];
  isLoading?: boolean;
  onViewFullStatistics?: () => void;
}

export const ShoppingStatisticsModal: React.FC<ShoppingStatisticsModalProps> = ({
  isOpen,
  onClose,
  lists,
  isLoading = false,
  onViewFullStatistics,
}) => {
  const { t, language, isRTL } = useLanguage();

  if (!isOpen) return null;

  const totalLists = lists.length;
  const completedTrips = lists.filter((l) =>
    Boolean(l.isCompleted || l.completed || (l as any).is_completed)
  ).length;
  const activeLists = lists.filter(
    (l) => !Boolean(l.isCompleted || l.completed || (l as any).is_completed)
  ).length;

  // Calculate items purchased across all lists
  let totalPurchasedItems = 0;
  let totalTrackedItems = 0;
  lists.forEach((list) => {
    (list.items || []).forEach((item) => {
      totalTrackedItems++;
      if (item.completed || (item as any).is_completed) totalPurchasedItems++;
    });
  });

  const completionRate =
    totalTrackedItems > 0
      ? Math.round((totalPurchasedItems / totalTrackedItems) * 100)
      : completedTrips > 0
      ? 100
      : 0;

  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl overflow-hidden transition-all duration-300 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-dim/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-primary flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3
                className={`text-lg font-bold text-on-surface leading-tight ${
                  language === 'ur' ? 'font-urdu text-xl' : "font-['Plus_Jakarta_Sans']"
                }`}
              >
                {t('statistics.title')}
              </h3>
              <p className="text-xs text-outline font-medium font-['Manrope']">
                {t('statistics.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          /* Loading Skeleton */
          <div className="grid grid-cols-2 gap-3 my-5 animate-pulse" aria-label="Loading statistics...">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-dim/60 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="w-8 h-8 rounded-xl bg-surface-container-high/60" />
                <div className="space-y-1.5">
                  <div className="w-12 h-6 rounded bg-surface-container-high/70" />
                  <div className="w-20 h-3 rounded bg-surface-container-high/40" />
                </div>
              </div>
            ))}
          </div>
        ) : totalLists === 0 ? (
          /* Clean Empty State */
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-primary flex items-center justify-center mx-auto">
              <ShoppingBag className="w-7 h-7 stroke-[2]" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-on-surface font-['Manrope']">
                {t('statistics.emptyTitle')}
              </h4>
              <p className="text-xs text-outline font-['Manrope'] max-w-xs mx-auto leading-relaxed">
                {t('statistics.emptySubtitle')}
              </p>
            </div>
          </div>
        ) : (
          /* Metric Cards Grid */
          <div className="grid grid-cols-2 gap-3 my-5">
            {/* Total Lists */}
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-dim/60 shadow-xs flex flex-col justify-between">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-2">
                <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-on-surface font-['Plus_Jakarta_Sans']">
                  {totalLists}
                </div>
                <div className="text-xs font-medium text-outline font-['Manrope']">
                  {t('statistics.totalLists')}
                </div>
              </div>
            </div>

            {/* Active Lists */}
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-dim/60 shadow-xs flex flex-col justify-between">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-2">
                <ListChecks className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-on-surface font-['Plus_Jakarta_Sans']">
                  {activeLists}
                </div>
                <div className="text-xs font-medium text-outline font-['Manrope']">
                  {t('statistics.activeLists')}
                </div>
              </div>
            </div>

            {/* Completed Trips */}
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-dim/60 shadow-xs flex flex-col justify-between">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-primary flex items-center justify-center mb-2">
                <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-primary font-['Plus_Jakarta_Sans']">
                  {completedTrips}
                </div>
                <div className="text-xs font-medium text-outline font-['Manrope']">
                  {t('statistics.completedLists')}
                </div>
              </div>
            </div>

            {/* Items Purchased */}
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-dim/60 shadow-xs flex flex-col justify-between">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-primary flex items-center justify-center mb-2">
                <Sparkles className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-on-surface font-['Plus_Jakarta_Sans']">
                  {totalPurchasedItems}
                </div>
                <div className="text-xs font-medium text-outline font-['Manrope']">
                  {t('statistics.itemsPurchased')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Offline & Security Guarantee */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
          </div>
          <p className="text-xs text-emerald-950 leading-relaxed font-['Manrope']">
            {completionRate}% completion rate. YAAD records and syncs your shopping habits securely.
          </p>
        </div>

        {/* Full Insights Screen CTA */}
        {onViewFullStatistics && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onViewFullStatistics();
            }}
            className="w-full mb-2.5 py-3 px-4 rounded-2xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
          >
            <span>{t('statistics.title')}</span>
            <Chevron className="w-4 h-4" />
          </button>
        )}

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-all active:scale-[0.99] cursor-pointer"
        >
          {t('statistics.done')}
        </button>
      </div>
    </div>
  );
};

