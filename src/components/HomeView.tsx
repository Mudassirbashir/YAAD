import React from 'react';
import { Plus, ChevronRight, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { ShoppingList } from '../types';
import { TopHeader } from './TopHeader';
import { APP_IMAGES } from '../data/initialData';
import { useLanguage } from '../context/LanguageContext';

interface HomeViewProps {
  lists: ShoppingList[];
  onCreateList: () => void;
  onSelectList: (list: ShoppingList) => void;
  onOpenProfile: () => void;
  onOpenMenu: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  lists,
  onCreateList,
  onSelectList,
  onOpenProfile,
  onOpenMenu,
  isLoading = false,
  error = null,
  onRetry,
}) => {
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto min-h-screen flex flex-col antialiased bg-background pb-32">
      {/* TopAppBar */}
      <TopHeader
        title={t('appName')}
        onAvatarClick={onOpenProfile}
        onMenuClick={onOpenMenu}
      />

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 md:px-8 pt-4 flex flex-col gap-6">
        {/* Header Greeting / Hero */}
        <div className="flex flex-col gap-1">
          <h1 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
            {t('home.greeting')}
          </h1>
          <p className="font-['Manrope'] text-sm sm:text-base text-on-surface-variant font-medium">
            {t('home.subtitle')}
          </p>
        </div>

        {/* Create List Hero Button / Card */}
        <div
          onClick={onCreateList}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onCreateList();
            }
          }}
          className="bg-primary text-on-primary rounded-3xl p-6 sm:p-7 shadow-[0px_8px_24px_rgba(0,30,21,0.18)] cursor-pointer relative overflow-hidden transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] group select-none border border-primary-container"
        >
          <div className="relative z-10 flex flex-col justify-between h-full gap-5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/15 shadow-inner">
              <Plus className="w-6 h-6 text-primary-fixed stroke-[2.5] group-hover:rotate-90 transition-transform duration-300" />
            </div>

            <div>
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-[26px] font-bold tracking-tight text-white leading-snug">
                {t('home.createListTitle')}
              </h2>
              <p className="font-['Manrope'] text-sm sm:text-base text-primary-fixed-dim/90 mt-1.5 font-medium leading-relaxed">
                {t('home.createListDesc')}
              </p>
            </div>
          </div>

          {/* Subtle Decorative Background Glow */}
          <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-primary-container/80 rounded-full blur-2xl opacity-60 pointer-events-none group-hover:scale-125 transition-transform duration-500" />
        </div>

        {/* Active & Recent Lists Section */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-primary">
              {t('home.yourListsTitle')}
            </h3>
            {!isLoading && lists.length > 0 && (
              <span className="font-['Manrope'] text-xs text-on-surface-variant font-semibold">
                {lists.length === 1 ? t('home.listsTotalOne') : t('home.listsTotal', { count: lists.length })}
              </span>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-error-container/30 border border-error/20 rounded-2xl text-xs font-['Manrope'] text-error flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-2.5 py-1 bg-surface-container rounded-lg font-bold text-primary hover:bg-surface-container-high transition-colors flex items-center gap-1 shrink-0"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-surface-container-lowest rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-[0px_4px_20px_rgba(0,30,21,0.03)] border border-surface-dim/70 animate-pulse"
                >
                  <div className="flex flex-col gap-2 flex-1 min-w-0 pr-2">
                    <div className="w-20 h-4 bg-surface-container rounded-full" />
                    <div className="w-36 h-5 bg-surface-container rounded-lg" />
                    <div className="w-28 h-3.5 bg-surface-container-low rounded" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-surface-container shrink-0" />
                </div>
              ))}
            </div>
          ) : lists.length === 0 ? (
            /* Empty State */
            <div className="bg-surface-container-lowest rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-[0px_4px_20px_rgba(0,30,21,0.03)] border border-surface-dim/70 my-2">
              <img
                src={APP_IMAGES.emptyStateNotepad}
                alt="Empty Notepad"
                className="w-28 h-28 object-contain mb-3 opacity-90"
              />
              <h4 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-primary">
                {t('home.emptyTitle')}
              </h4>
              <p className="font-['Manrope'] text-sm text-on-surface-variant max-w-xs mt-1 leading-relaxed">
                {t('home.emptyDesc')}
              </p>
              <button
                onClick={onCreateList}
                className="mt-5 px-6 py-2.5 rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-['Manrope'] text-sm font-bold transition-all active:scale-95 border border-surface-dim flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{t('home.createFirstList')}</span>
              </button>
            </div>
          ) : (
            /* Populated Lists */
            <div className="flex flex-col gap-3">
              {lists.map((list) => {
                const totalItems = list.items.length;
                const completedItems = list.items.filter((i) => i.completed).length;
                const isAllDone = list.isCompleted;

                return (
                  <article
                    key={list.id}
                    onClick={() => onSelectList(list)}
                    className="bg-surface-container-lowest rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-[0px_4px_20px_rgba(0,30,21,0.03)] border border-surface-dim/70 cursor-pointer hover:bg-surface-container-low transition-all active:scale-[0.99] group select-none"
                  >
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-['Manrope'] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isAllDone
                              ? 'bg-secondary-fixed text-on-secondary-fixed'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {isAllDone ? t('home.completed') : t('home.active')}
                        </span>
                        <span className="font-['Manrope'] text-xs text-outline flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{list.createdAt}</span>
                        </span>
                      </div>

                      <h4 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-primary truncate group-hover:text-primary-container transition-colors">
                        {list.title}
                      </h4>

                      <div className="flex items-center gap-3 text-xs font-['Manrope'] text-on-surface-variant">
                        <span>{t('home.itemsCount', { count: totalItems })}</span>
                        <span>•</span>
                        <span>
                          {isAllDone
                            ? t('home.allBought')
                            : t('home.boughtCount', { done: completedItems, total: totalItems })}
                        </span>
                      </div>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0 group-hover:bg-surface-variant transition-colors">
                      <ChevronRight className="w-5 h-5 text-primary" />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
