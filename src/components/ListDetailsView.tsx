import React, { useState, useEffect } from 'react';
import { History, Check, ShoppingCart, RotateCcw, Trash2, Edit3 } from 'lucide-react';
import { ShoppingList, CategoryId } from '../types';
import { TopHeader } from './TopHeader';
import { CategoryIcon } from './CategoryIcon';
import { useLanguage } from '../context/LanguageContext';

interface ListDetailsViewProps {
  list: ShoppingList;
  onBack: () => void;
  onReuseList: (list: ShoppingList) => void;
  onContinueShopping: (list: ShoppingList) => void;
  onEditList: (list: ShoppingList) => void;
  onDeleteList: (listId: string) => void;
  onOpenProfile: () => void;
}

export const ListDetailsView: React.FC<ListDetailsViewProps> = ({
  list,
  onBack,
  onReuseList,
  onContinueShopping,
  onEditList,
  onDeleteList,
  onOpenProfile,
}) => {
  const { t, getCategoryName } = useLanguage();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Close modal when pressing Escape key
  useEffect(() => {
    if (!showDeleteConfirm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDeleteConfirm(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDeleteConfirm]);

  // Group items by categoryId
  const categoryIds: CategoryId[] = Array.from(
    new Set(list.items.map((i) => (i.categoryId || 'other') as CategoryId))
  );

  const isAllCompleted = list.items.length > 0 && list.items.every((i) => i.completed);

  return (
    <div className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto min-h-screen flex flex-col antialiased bg-background pb-28 selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* TopAppBar */}
      <TopHeader
        title={t('appName')}
        showBack={true}
        onBack={onBack}
        onAvatarClick={onOpenProfile}
        rightAction={
          <button
            onClick={() => onEditList(list)}
            className="font-['Manrope'] text-sm font-bold text-primary hover:bg-surface-container-low px-3 py-1.5 rounded-full transition-colors active:scale-95 flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{t('edit')}</span>
          </button>
        }
      />

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 md:px-8 pt-4 flex flex-col gap-5">
        {/* Header Section */}
        <section className="flex flex-col gap-1">
          <h2 className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold text-primary tracking-tight">
            {list.title}
          </h2>
          <p className="font-['Manrope'] text-sm text-on-surface-variant flex items-center gap-1.5">
            <History className="w-4 h-4 text-outline" />
            <span>{list.createdAt}</span>
            <span className="w-1 h-1 rounded-full bg-outline-variant mx-1" />
            <span>{t('home.itemsCount', { count: list.items.length })}</span>
          </p>
        </section>

        {/* Categorized List Views */}
        <div className="flex flex-col gap-4">
          {categoryIds.map((catId) => {
            const categoryItems = list.items.filter(
              (i) => (i.categoryId || 'other') === catId
            );
            const categoryCompletedCount = categoryItems.filter((i) => i.completed).length;

            return (
              <section
                key={catId}
                className="bg-surface-container-lowest rounded-3xl shadow-[0px_4px_20px_rgba(0,30,21,0.03)] border border-surface-container-high/60 overflow-hidden"
              >
                <div className="px-4 py-3 bg-surface-container-low/40 border-b border-surface-container flex items-center justify-between">
                  <span className="font-['Manrope'] text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                    <CategoryIcon categoryId={catId} className="w-4 h-4 text-primary/70" />
                    <span>{getCategoryName(catId)}</span>
                  </span>
                  <span className="font-['Manrope'] text-xs font-semibold text-outline">
                    {categoryCompletedCount}/{categoryItems.length}
                  </span>
                </div>

                <ul className="flex flex-col divide-y divide-surface-container/60">
                  {categoryItems.map((item) => {
                    const formattedQty = item.quantity
                      ? `${item.quantity}${item.unit ? ' ' + item.unit : ''}`
                      : item.note || null;

                    return (
                      <li
                        key={item.id}
                        className={`flex items-center justify-between gap-3.5 p-4 transition-colors ${
                          item.completed
                            ? 'opacity-75 bg-surface-container-lowest'
                            : 'bg-surface-container-lowest'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          {item.completed ? (
                            <div className="w-6 h-6 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary shrink-0 shadow-xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-outline flex items-center justify-center shrink-0" />
                          )}

                          <div className="flex items-center gap-1.5 min-w-0 flex-1 flex-wrap">
                            <span
                              className={`font-['Manrope'] text-base truncate ${
                                item.completed
                                  ? 'line-through text-outline'
                                  : 'text-on-surface font-medium'
                              }`}
                            >
                              {item.name}
                            </span>
                            {item.nameUrdu && (
                              <span
                                className={`font-['Noto_Nastaliq_Urdu','Jameel_Noori_Nastaleeq',serif] text-xs ${
                                  item.completed ? 'text-outline/70' : 'text-on-surface-variant font-normal'
                                }`}
                              >
                                ({item.nameUrdu})
                              </span>
                            )}
                          </div>
                        </div>

                        {formattedQty && (
                          <span className="font-['Manrope'] text-xs text-outline bg-surface-container-low px-2.5 py-1 rounded-md shrink-0 font-medium">
                            {formattedQty}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-col gap-3 pb-6">
          {!isAllCompleted && (
            <button
              onClick={() => onContinueShopping(list)}
              className="w-full min-h-[56px] rounded-full bg-primary text-on-primary font-['Manrope'] text-base font-bold flex items-center justify-center gap-2 hover:bg-primary-container shadow-[0px_8px_20px_rgba(0,30,21,0.15)] active:scale-[0.98] transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{t('history.continueShopping')}</span>
            </button>
          )}

          <button
            onClick={() => onReuseList(list)}
            className="w-full min-h-[56px] rounded-full bg-secondary-fixed text-secondary font-['Manrope'] text-base font-bold flex items-center justify-center gap-2 hover:bg-secondary-fixed-dim transition-colors shadow-[0px_4px_16px_rgba(255,222,163,0.3)] active:scale-[0.98]"
          >
            <RotateCcw className="w-5 h-5" />
            <span>{t('history.reuseList')}</span>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full min-h-[50px] rounded-full bg-transparent text-error font-['Manrope'] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-error-container/20 transition-colors active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('history.deleteHistory')}</span>
          </button>
        </div>
      </main>

      {/* Delete Confirmation Modal with backdrop click dismissal */}
      {showDeleteConfirm && (
        <div
          onClick={() => setShowDeleteConfirm(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-surface-dim space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="w-12 h-12 rounded-full bg-error-container/40 text-error flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-primary">
                {t('history.deleteConfirmTitle')}
              </h3>
              <p className="font-['Manrope'] text-sm text-on-surface-variant">
                {t('history.deleteConfirmDesc', { title: list.title })}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="h-12 rounded-full bg-surface-container text-primary font-['Manrope'] text-sm font-semibold hover:bg-surface-container-high transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeleteList(list.id);
                }}
                className="h-12 rounded-full bg-error text-on-error font-['Manrope'] text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

