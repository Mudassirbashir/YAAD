import React from 'react';
import { Calendar, ShoppingBag, ChevronRight, Clock, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { ShoppingList } from '../types';
import { TopHeader } from './TopHeader';
import { useLanguage } from '../context/LanguageContext';

interface ListHistoryViewProps {
  lists: ShoppingList[];
  onSelectList: (list: ShoppingList) => void;
  onCreateNewList: () => void;
  onOpenProfile: () => void;
  onOpenMenu: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const ListHistoryView: React.FC<ListHistoryViewProps> = ({
  lists,
  onSelectList,
  onCreateNewList,
  onOpenProfile,
  onOpenMenu,
  isLoading = false,
  error = null,
  onRetry,
}) => {
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto min-h-screen flex flex-col antialiased bg-background pb-28">
      {/* TopAppBar */}
      <TopHeader
        title={t('appName')}
        onAvatarClick={onOpenProfile}
        onMenuClick={onOpenMenu}
      />

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 md:px-8 pt-4 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold text-primary tracking-tight">
            {t('history.title')}
          </h2>
          <p className="font-['Manrope'] text-sm text-on-surface-variant">
            {t('history.subtitle')}
          </p>
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
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-surface-container-lowest rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-[0px_4px_20px_rgba(0,30,21,0.04)] border border-surface-dim/70 animate-pulse"
              >
                <div className="flex flex-col gap-2">
                  <div className="w-20 h-4 bg-surface-container rounded-full" />
                  <div className="w-40 h-5 bg-surface-container rounded-lg" />
                  <div className="w-32 h-3.5 bg-surface-container-low rounded" />
                </div>
                <div className="w-10 h-10 rounded-full bg-surface-container shrink-0" />
              </div>
            ))}
          </div>
        ) : lists.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-surface-container-lowest rounded-3xl border border-surface-dim my-6 text-center">
            <Clock className="w-10 h-10 text-outline mb-2" />
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-primary text-lg">
              {t('history.emptyTitle')}
            </p>
            <p className="font-['Manrope'] text-sm text-on-surface-variant mt-1 mb-4">
              {t('history.emptySubtitle')}
            </p>
            <button
              onClick={onCreateNewList}
              className="bg-primary text-on-primary font-['Manrope'] text-sm font-semibold px-5 py-2.5 rounded-full shadow-sm hover:bg-primary-container transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{t('history.createListBtn')}</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {lists.map((list) => {
              const isCompleted = list.isCompleted;
              return (
                <article
                  key={list.id}
                  onClick={() => onSelectList(list)}
                  className="bg-surface-container-lowest rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-[0px_4px_20px_rgba(0,30,21,0.04)] border border-surface-dim/70 cursor-pointer hover:bg-surface-container-low transition-all active:scale-[0.99] group"
                >
                  <div className="flex flex-col gap-1.5">
                    {isCompleted && (
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="bg-secondary-fixed text-on-secondary-fixed font-['Manrope'] text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
                          {t('home.completed')}
                        </span>
                      </div>
                    )}

                    <h3 className="font-['Plus_Jakarta_Sans'] text-lg sm:text-xl text-primary font-bold group-hover:text-primary-container transition-colors">
                      {list.title}
                    </h3>

                    <div className="flex items-center gap-3 text-on-surface-variant font-['Manrope'] text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-outline" />
                        <span>{list.createdAt}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-outline" />
                        <span>{t('home.itemsCount', { count: list.items.length })}</span>
                      </span>
                    </div>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary shadow-xs shrink-0 group-hover:bg-surface-variant transition-colors">
                    <ChevronRight className="w-5 h-5 text-primary" />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
