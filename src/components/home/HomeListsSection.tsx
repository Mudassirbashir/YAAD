import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  MoreVertical,
  CheckCircle2,
  Clock,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Edit2,
  Trash2,
} from 'lucide-react';
import { ShoppingList } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { BidiText } from '../../utils/bidi';
import { ListIcon } from '../ListIcon';
import { formatExactDate, formatExactTime } from '../../utils/dateFormatting';
import { isNetworkOrOfflineError } from '../../lib/supabase';

interface HomeListsSectionProps {
  lists: ShoppingList[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onCreateList: () => void;
  onSelectList: (list: ShoppingList) => void;
  onOpenHistory?: () => void;
  onEditList?: (listId: string) => void;
  onDeleteList?: (listId: string) => void;
}

export const HomeListsSection: React.FC<HomeListsSectionProps> = ({
  lists,
  isLoading = false,
  error = null,
  onRetry,
  onCreateList,
  onSelectList,
  onOpenHistory,
  onEditList,
  onDeleteList,
}) => {
  const { t } = useLanguage();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  return (
    <section
      id="home_lists_section"
      aria-label={t('home.yourListsTitle') || 'Your Shopping Lists'}
      className="flex flex-col gap-3 select-none"
      onClick={() => setActiveMenuId(null)}
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
              <span>{t('common.retry') || 'Retry'}</span>
            </button>
          )}
        </div>
      )}

      {/* Skeletons Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-stone-900 rounded-2xl p-4 flex items-center justify-between shadow-2xs border border-surface-dim/70 animate-pulse"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-surface-container shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <div className="w-32 h-4 bg-surface-container rounded-md" />
                  <div className="w-20 h-3 bg-surface-container-low rounded-md" />
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-surface-container-low shrink-0" />
            </div>
          ))}
        </div>
      ) : lists.length === 0 ? (
        /* Friendly Empty State */
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-2xs border border-surface-dim/70 my-1">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3 border border-primary/20">
            <ShoppingBag className="w-7 h-7 text-primary stroke-[1.8]" />
          </div>
          <h4 className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-bold text-on-surface">
            {t('home.emptyTitle') || 'No shopping lists yet'}
          </h4>
          <p className="font-['Manrope'] text-xs sm:text-sm text-outline max-w-xs mt-1 leading-relaxed">
            {t('home.emptyDesc') || 'Create your first list or tap an essential item above to get started instantly.'}
          </p>
          <button
            type="button"
            id="home_empty_create_btn"
            onClick={onCreateList}
            className="mt-4 px-5 py-2.5 rounded-full bg-primary hover:bg-primary-container active:scale-95 text-on-primary font-['Manrope'] text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.4]" />
            <span>{t('home.createFirstList') || 'Create First List'}</span>
          </button>
        </div>
      ) : (
        /* Populated Lists Grid: 1 col mobile, 2 col tablet, 3-4 col desktop */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5">
          {lists.slice(0, 8).map((list) => {
            const totalItems = (list.items || []).length;
            const completedItems = (list.items || []).filter((i) => i.completed).length;
            const isAllDone = list.isCompleted || (totalItems > 0 && completedItems === totalItems);
            const isMenuOpen = activeMenuId === list.id;

            const exactDateStr = formatExactDate(list.createdTimestamp || list.createdAt);
            const completionTimeStr =
              isAllDone && (list.completedTimestamp || list.completedAt)
                ? formatExactTime(list.completedTimestamp || list.completedAt)
                : null;

            return (
              <article
                key={list.id}
                id={`home_list_card_${list.id}`}
                onClick={() => onSelectList(list)}
                className="bg-white dark:bg-stone-900 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between shadow-2xs border border-surface-dim/70 hover:border-primary/30 hover:shadow-xs transition-all active:scale-[0.99] group select-none cursor-pointer relative"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 pe-2">
                  <ListIcon
                    title={list.title}
                    explicitIcon={list.icon}
                    items={list.items}
                    size="md"
                  />

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <BidiText
                        as="h4"
                        className="font-['Plus_Jakarta_Sans'] text-sm sm:text-[15px] font-bold text-on-surface truncate group-hover:text-primary transition-colors"
                      >
                        {list.title}
                      </BidiText>

                      {isAllDone ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200/50 shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{t('home.completed') || 'Completed'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200/50 shrink-0">
                          <Clock className="w-3 h-3" />
                          <span>{t('home.inProgress') || 'In Progress'}</span>
                        </span>
                      )}

                      {list.isSynced === false && (
                        <span
                          title="Offline cached"
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-surface-container text-outline"
                        >
                          Cached
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-['Manrope'] text-outline mt-0.5 flex-wrap">
                      <span className="text-on-surface-variant font-medium">{exactDateStr}</span>
                      <span>•</span>
                      <span>{t('home.itemsCount', { count: totalItems })}</span>
                      {completionTimeStr && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-700/90 font-medium">
                            {t('history.completedAt', { time: completionTimeStr }) || `Done ${completionTimeStr}`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Options Menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(isMenuOpen ? null : list.id);
                      }}
                      aria-label="List options"
                      className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container active:scale-95 transition-all cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                      <div
                        className="absolute right-0 top-9 z-30 w-40 rounded-xl bg-white dark:bg-stone-900 border border-surface-dim shadow-lg p-1 animate-in fade-in text-xs font-['Manrope']"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onSelectList(list);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-surface-container flex items-center gap-2 text-on-surface font-medium cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                          <span>{t('home.openShoppingMode') || 'Shopping Mode'}</span>
                        </button>
                        {onEditList && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onEditList(list.id);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-surface-container flex items-center gap-2 text-on-surface font-medium cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-outline" />
                            <span>{t('home.editList') || 'Edit List'}</span>
                          </button>
                        )}
                        {onDeleteList && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onDeleteList(list.id);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 text-rose-600 font-medium cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{t('home.deleteList') || 'Delete List'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-outline group-hover:text-primary group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all rtl:rotate-180">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
