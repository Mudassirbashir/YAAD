import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  ShoppingCart,
  RotateCcw,
  Trash2,
  Edit3,
  ArrowLeft,
  Check,
  Tag,
  ShoppingBag,
  ShieldCheck,
  Database,
} from 'lucide-react';
import { ShoppingList, CategoryId } from '../types';
import { TopHeader } from './TopHeader';
import { CategoryIcon } from './CategoryIcon';
import { useLanguage } from '../context/LanguageContext';
import { BidiText } from '../utils/bidi';
import { ListIcon } from './ListIcon';
import {
  formatExactDate,
  formatExactTime,
  formatSessionDateTime,
} from '../utils/dateFormatting';

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

  const totalItems = (list.items || []).length;
  const completedItemsCount = (list.items || []).filter((i) => i.completed).length;
  const isAllCompleted = list.isCompleted || (totalItems > 0 && completedItemsCount === totalItems);

  // Group items by categoryId
  const categoryIds: CategoryId[] = useMemo(() => {
    return Array.from(
      new Set(list.items.map((i) => (i.categoryId || 'other') as CategoryId))
    );
  }, [list.items]);

  // Date and time formatting
  const sessionTimes = useMemo(() => {
    return formatSessionDateTime(
      list.createdTimestamp || list.createdAt,
      list.completedTimestamp || list.completedAt
    );
  }, [list.createdTimestamp, list.createdAt, list.completedTimestamp, list.completedAt]);

  const percentComplete = totalItems > 0 ? Math.round((completedItemsCount / totalItems) * 100) : 0;

  return (
    <div className="w-full max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto min-h-screen flex flex-col antialiased bg-background pb-28 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header */}
      <TopHeader
        title={t('appName')}
        showBack={true}
        onBack={onBack}
        onAvatarClick={onOpenProfile}
        rightAction={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onEditList(list)}
              className="font-['Manrope'] text-xs sm:text-sm font-bold text-[#0F3D2E] hover:bg-emerald-50 px-3 py-1.5 rounded-full transition-colors active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t('edit')}</span>
            </button>
          </div>
        }
      />

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 md:px-8 pt-4 flex flex-col gap-6">
        {/* SHOPPING SESSION HERO CARD */}
        <section
          id="historical_session_card"
          aria-label={t('history.sessionLabel')}
          className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-surface-dim/80 flex flex-col gap-5"
        >
          {/* Eyebrow & Icon Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <ListIcon
                title={list.title}
                explicitIcon={list.icon}
                items={list.items}
                size="lg"
                className="shadow-2xs"
              />
              <div className="flex flex-col">
                <span className="font-['Manrope'] text-[11px] font-extrabold uppercase tracking-widest text-[#0F3D2E]/80">
                  {t('history.sessionLabel')}
                </span>
                <BidiText
                  as="h1"
                  className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight"
                >
                  {list.title}
                </BidiText>
              </div>
            </div>

            {/* Completed status badge */}
            <div className="shrink-0 pt-1">
              {isAllCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/70">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('home.completed')}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200/70">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t('home.inProgress') || 'In Progress'}</span>
                </span>
              )}
            </div>
          </div>

          {/* Structured Session Details Grid (Date, Time, Status) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-surface-container/50 rounded-2xl border border-surface-dim/60">
            {/* DATE */}
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0F3D2E] border border-surface-dim/70 shrink-0 shadow-2xs">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10.5px] font-extrabold font-['Manrope'] uppercase tracking-wider text-outline">
                  {t('history.dateLabel')}
                </span>
                <span className="font-['Manrope'] text-xs sm:text-sm font-bold text-on-surface">
                  {sessionTimes.fullDate}
                </span>
              </div>
            </div>

            {/* TIME */}
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0F3D2E] border border-surface-dim/70 shrink-0 shadow-2xs">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10.5px] font-extrabold font-['Manrope'] uppercase tracking-wider text-outline">
                  {t('history.timeLabel')}
                </span>
                <span className="font-['Manrope'] text-xs sm:text-sm font-bold text-on-surface">
                  {sessionTimes.time || 'Exact time logged'}
                </span>
              </div>
            </div>

            {/* COMPLETION TIME / STATUS */}
            <div className="flex items-start gap-2.5 sm:col-span-2 md:col-span-1">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0F3D2E] border border-surface-dim/70 shrink-0 shadow-2xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10.5px] font-extrabold font-['Manrope'] uppercase tracking-wider text-outline">
                  {t('history.statusLabel')}
                </span>
                <span className="font-['Manrope'] text-xs sm:text-sm font-bold text-on-surface">
                  {isAllCompleted
                    ? sessionTimes.completionTime
                      ? t('history.completedAt', { time: sessionTimes.completionTime })
                      : t('home.completed')
                    : t('home.inProgress') || 'In Progress'}
                </span>
              </div>
            </div>
          </div>

          {/* Progress / Items Summary */}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex justify-between items-center text-xs font-['Manrope']">
              <span className="font-bold text-on-surface">
                {t('history.itemsPurchased', {
                  completed: completedItemsCount,
                  total: totalItems,
                })}
              </span>
              <span className="font-extrabold text-[#0F3D2E]">{percentComplete}%</span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden shadow-inner">
              <div
                className="bg-[#0F3D2E] h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          {/* Historical integrity indicator */}
          <div className="flex items-center gap-2 text-[11px] font-['Manrope'] text-outline border-t border-surface-dim/60 pt-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>
              Historical session records are preserved. Editing a new trip will never alter this past record.
            </span>
          </div>
        </section>

        {/* ASSOCIATED ITEMS SECTION */}
        <section aria-label={t('history.itemsTitle')} className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-['Plus_Jakarta_Sans'] text-lg sm:text-xl font-bold text-on-surface">
              {t('history.itemsTitle')}
            </h2>
            <span className="font-['Manrope'] text-xs font-semibold text-outline">
              {t('history.itemsCount', { count: totalItems })}
            </span>
          </div>

          {/* Grouped Associated Items by Category */}
          <div className="flex flex-col gap-4">
            {categoryIds.map((catId) => {
              const categoryItems = list.items.filter(
                (i) => (i.categoryId || 'other') === catId
              );
              const categoryCompleted = categoryItems.filter((i) => i.completed).length;

              return (
                <div
                  key={catId}
                  className="bg-white rounded-2xl shadow-xs border border-surface-dim/80 overflow-hidden"
                >
                  {/* Category Header */}
                  <div className="px-4 py-2.5 bg-surface-container-low/60 border-b border-surface-dim/60 flex items-center justify-between">
                    <span className="font-['Manrope'] text-xs font-bold text-[#0F3D2E] uppercase tracking-wider flex items-center gap-2">
                      <CategoryIcon categoryId={catId} className="w-4 h-4 text-[#0F3D2E]" />
                      <span>{getCategoryName(catId)}</span>
                    </span>
                    <span className="font-['Manrope'] text-[11px] font-semibold text-outline">
                      {categoryCompleted}/{categoryItems.length}
                    </span>
                  </div>

                  {/* Category Items List */}
                  <ul className="flex flex-col divide-y divide-surface-dim/50">
                    {categoryItems.map((item) => {
                      const formattedQty = item.quantity
                        ? `${item.quantity}${item.unit ? ' ' + item.unit : ''}`
                        : item.note || null;

                      const itemTime = formatExactTime(item.createdAt || item.created_at);

                      return (
                        <li
                          key={item.id}
                          className={`flex items-center justify-between gap-3 p-3.5 sm:p-4 transition-colors ${
                            item.completed ? 'bg-surface-container-lowest/40' : 'bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Completion status icon */}
                            {item.completed ? (
                              <div
                                title="Item completed"
                                className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0 shadow-2xs border border-emerald-200/60"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                              </div>
                            ) : (
                              <div
                                title="Item not checked off"
                                className="w-6 h-6 rounded-full border-2 border-surface-dim flex items-center justify-center shrink-0"
                              >
                                <Circle className="w-2.5 h-2.5 text-outline/40" />
                              </div>
                            )}

                            {/* Item Name & Details */}
                            <div className="flex flex-col min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap" dir="auto">
                                <BidiText
                                  as="span"
                                  className={`font-['Manrope'] text-sm sm:text-base font-semibold truncate ${
                                    item.completed
                                      ? 'line-through text-outline'
                                      : 'text-on-surface'
                                  }`}
                                >
                                  {item.name}
                                </BidiText>

                                {item.nameUrdu && (
                                  <span
                                    className={`font-urdu text-xs ${
                                      item.completed
                                        ? 'text-outline/70'
                                        : 'text-on-surface-variant font-normal'
                                    }`}
                                  >
                                    ({item.nameUrdu})
                                  </span>
                                )}
                              </div>

                              {/* Associated metadata: Category, created time, status */}
                              <div className="flex items-center gap-2 text-[11px] font-['Manrope'] text-outline mt-0.5 flex-wrap">
                                <span className="inline-flex items-center gap-1">
                                  <Tag className="w-3 h-3 text-outline/70" />
                                  <span>{getCategoryName(item.categoryId || 'other')}</span>
                                </span>

                                {itemTime && (
                                  <>
                                    <span>•</span>
                                    <span>{t('history.itemAddedAt', { time: itemTime }) || `Added at ${itemTime}`}</span>
                                  </>
                                )}

                                <span>•</span>
                                <span
                                  className={`font-medium ${
                                    item.completed ? 'text-emerald-700' : 'text-amber-800'
                                  }`}
                                >
                                  {item.completed ? 'Purchased' : 'Not purchased'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Quantity & Unit */}
                          {formattedQty && (
                            <bdi
                              dir="ltr"
                              className="font-['Manrope'] tabular-nums text-xs font-bold text-on-surface bg-surface-container px-2.5 py-1 rounded-lg shrink-0 border border-surface-dim/60 shadow-2xs"
                            >
                              {formattedQty}
                            </bdi>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* PRIMARY ACTIONS */}
        <div className="mt-2 flex flex-col gap-3 pb-6">
          {/* Continue Shopping (if list is active / incomplete) */}
          {!isAllCompleted && (
            <button
              type="button"
              id="history_continue_shopping_btn"
              onClick={() => onContinueShopping(list)}
              className="w-full min-h-[52px] rounded-full bg-[#0F3D2E] hover:bg-[#145B3A] text-white font-['Manrope'] text-sm sm:text-base font-bold flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-all cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{t('history.continueShopping')}</span>
            </button>
          )}

          {/* Reuse as New List (Always preserves original historical list immutable) */}
          <button
            type="button"
            id="history_reuse_list_btn"
            onClick={() => onReuseList(list)}
            className="w-full min-h-[52px] rounded-full bg-emerald-50 text-[#0F3D2E] border border-emerald-200/80 hover:bg-emerald-100/70 font-['Manrope'] text-sm sm:text-base font-bold flex items-center justify-center gap-2 transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 text-[#0F3D2E]" />
            <span>{t('history.reuseList')}</span>
          </button>

          {/* Delete History Session */}
          <button
            type="button"
            id="history_delete_btn"
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full min-h-[46px] rounded-full bg-transparent text-rose-700 font-['Manrope'] text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-rose-50 transition-colors active:scale-95 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('history.deleteHistory')}</span>
          </button>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          onClick={() => setShowDeleteConfirm(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-surface-dim space-y-4 animate-scale-in"
          >
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-on-surface">
                {t('history.deleteConfirmTitle')}
              </h3>
              <p className="font-['Manrope'] text-xs sm:text-sm text-outline leading-relaxed">
                {t('history.deleteConfirmDesc', { title: list.title })}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="h-11 rounded-full bg-surface-container text-on-surface font-['Manrope'] text-xs sm:text-sm font-semibold hover:bg-surface-container-high transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeleteList(list.id);
                }}
                className="h-11 rounded-full bg-rose-600 text-white font-['Manrope'] text-xs sm:text-sm font-semibold hover:bg-rose-700 transition-colors shadow-xs active:scale-95"
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
