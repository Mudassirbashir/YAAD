import React from 'react';
import {
  ShoppingBag,
  Plus,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { ShoppingList } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { isNetworkOrOfflineError } from '../../lib/supabase';
import { ShoppingListCard } from '../ShoppingListCard';

interface HomeListsSectionProps {
  lists: ShoppingList[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onCreateList: () => void;
  onSelectList: (list: ShoppingList) => void;
  onContinueShopping?: (list: ShoppingList) => void;
  onMarkComplete?: (list: ShoppingList) => void;
  onOpenHistory?: () => void;
  onDeleteList?: (listId: string) => void;
  onReuseList?: (list: ShoppingList) => void;
  isOnline?: boolean;
}

export const HomeListsSection: React.FC<HomeListsSectionProps> = ({
  lists,
  isLoading = false,
  error = null,
  onRetry,
  onCreateList,
  onSelectList,
  onContinueShopping,
  onMarkComplete,
  onOpenHistory,
  onDeleteList,
  onReuseList,
  isOnline = true,
}) => {
  const { t, language } = useLanguage();

  return (
    <section
      id="home_lists_section"
      aria-label={t('home.yourListsTitle') || 'Your Shopping Lists'}
      className="flex flex-col gap-3 select-none"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between px-0.5">
        <h3 className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-bold text-on-surface">
          {t('home.yourListsTitle') || 'Your Lists'}
        </h3>
        {lists.length > 0 && onOpenHistory && (
          <button
            type="button"
            id="see_all_lists_btn"
            onClick={onOpenHistory}
            className="text-xs sm:text-sm font-semibold text-primary hover:underline cursor-pointer"
          >
            {t('home.seeAll') || 'See All'}
          </button>
        )}
      </div>

      {/* Network / General Error Notice */}
      {error && !isNetworkOrOfflineError(error) && (
        <div className="p-3.5 bg-error-container/30 border border-error/20 rounded-2xl text-xs font-['Manrope'] text-error flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-2.5 py-1 bg-surface-container rounded-lg font-bold text-primary hover:bg-surface-container-high transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-full min-h-[116px] bg-white rounded-2xl p-4 sm:p-4.5 flex flex-col justify-between border border-surface-dim/70 shadow-2xs animate-pulse"
            >
              <div className="flex items-start gap-3.5 w-full">
                <div className="w-12 h-12 rounded-xl bg-surface-container shrink-0" />
                <div className="flex flex-col gap-2 flex-1 pt-1">
                  <div className="w-3/4 h-4 bg-surface-container rounded" />
                  <div className="w-1/2 h-3 bg-surface-container-low rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : lists.length === 0 ? (
        /* Empty State: Prompt to create list */
        <div className="p-6 sm:p-8 bg-surface-container-lowest rounded-2xl border border-dashed border-surface-dim flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-primary flex items-center justify-center mb-3">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm sm:text-base text-on-surface">
            No Shopping Lists Yet
          </h4>
          <p className="font-['Manrope'] text-xs text-outline mt-1 max-w-xs leading-relaxed">
            Create your first shopping list to remember what to buy.
          </p>
          <button
            type="button"
            id="home_empty_create_btn"
            onClick={onCreateList}
            className="mt-4 px-5 py-2.5 rounded-full bg-primary hover:bg-primary-container active:scale-95 text-on-primary font-['Manrope'] text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.4]" />
            <span>Create List</span>
          </button>
        </div>
      ) : (
        /* Populated Lists Grid using unified ShoppingListCard */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {lists.slice(0, 8).map((list) => (
            <ShoppingListCard
              key={list.id}
              list={list}
              onSelectList={onSelectList}
              onContinueShopping={onContinueShopping}
              onMarkComplete={onMarkComplete}
              onDeleteList={onDeleteList}
              onReuseList={onReuseList}
              isOnline={isOnline}
              variant="home"
            />
          ))}
        </div>
      )}
    </section>
  );
};
