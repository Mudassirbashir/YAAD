import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  ChevronRight,
  MoreVertical,
  ShoppingCart,
  Check,
  Trash2,
  RotateCcw,
  Eye,
  Calendar,
  ShoppingBag,
} from 'lucide-react';
import { ShoppingList } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { BidiText } from '../utils/bidi';
import { ListIcon } from './ListIcon';
import { formatExactDate, formatExactTime } from '../utils/dateFormatting';
import { triggerHaptic } from '../lib/sound';

export interface ShoppingListCardProps {
  list: ShoppingList;
  onSelectList: (list: ShoppingList) => void;
  onContinueShopping?: (list: ShoppingList) => void;
  onMarkComplete?: (list: ShoppingList) => void;
  onDeleteList?: (listId: string) => void;
  onReuseList?: (list: ShoppingList) => void;
  isOnline?: boolean;
  variant?: 'history' | 'home';
}

export const ShoppingListCard: React.FC<ShoppingListCardProps> = ({
  list,
  onSelectList,
  onContinueShopping,
  onMarkComplete,
  onDeleteList,
  onReuseList,
  variant = 'history',
}) => {
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside or Escape
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const totalItems = (list.items || []).length;
  const completedItems = (list.items || []).filter((i) => i.completed).length;
  const isAllDone = list.isCompleted || (totalItems > 0 && completedItems === totalItems);
  const percentComplete = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const exactDateStr = formatExactDate(list.createdTimestamp || list.createdAt, {
    includeWeekday: variant === 'history',
  });
  const exactTimeStr = formatExactTime(list.createdTimestamp || list.createdAt);
  const completionTimeStr =
    isAllDone && (list.completedTimestamp || list.completedAt)
      ? formatExactTime(list.completedTimestamp || list.completedAt)
      : null;

  const handleCardClick = () => {
    triggerHaptic(8);
    onSelectList(list);
  };

  const handleContinueClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(12);
    if (onContinueShopping) {
      onContinueShopping(list);
    } else {
      onSelectList(list);
    }
  };

  const handleMarkCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    triggerHaptic(16);
    if (onMarkComplete) {
      onMarkComplete(list);
    }
  };

  const handleReuseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    triggerHaptic(10);
    if (onReuseList) {
      onReuseList(list);
    }
  };

  const handleDeleteTrigger = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
    triggerHaptic(18);
    if (onDeleteList) {
      onDeleteList(list.id);
    }
  };

  return (
    <>
      <article
        id={`list_card_${list.id}`}
        onClick={handleCardClick}
        className="w-full min-h-[116px] sm:min-h-[120px] bg-white rounded-2xl p-4 sm:p-4.5 flex flex-col justify-between border border-surface-dim/80 hover:border-primary/40 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(15,61,46,0.08),0_1px_3px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.99] group select-none cursor-pointer relative"
      >
        {/* TOP ROW: Icon + Title + Status Badges + Menu Button */}
        <div className="flex items-start justify-between gap-3 w-full">
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            {/* Standardized Icon Area (w-11 h-11 sm:w-12 sm:h-12) */}
            <ListIcon
              title={list.title}
              explicitIcon={list.icon}
              items={list.items}
              size="md"
              className="shrink-0 shadow-2xs"
            />

            {/* Title & Status Pills */}
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <BidiText
                  as="h3"
                  className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-bold text-on-surface group-hover:text-primary transition-colors truncate"
                >
                  {list.title}
                </BidiText>

                {/* Status Badges */}
                {isAllDone ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10.5px] font-bold border border-emerald-200/70 shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 stroke-[2.4]" />
                    <span>{t('home.completed') || 'Completed'}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 text-[10.5px] font-bold border border-amber-200/70 shrink-0">
                    <Clock className="w-3 h-3 text-amber-600 stroke-[2.4]" />
                    <span>{t('home.inProgress') || 'In Progress'}</span>
                  </span>
                )}

                {list.isSynced === false && (
                  <span
                    title="Stored in local offline cache"
                    className="inline-flex items-center px-2 py-0.5 rounded text-[9.5px] font-medium bg-surface-container text-outline"
                  >
                    Cached
                  </span>
                )}
              </div>

              {/* Metadata Sub-Row: Date, Exact Time, Item Count, Completion Time */}
              <div className="flex items-center gap-2 text-xs font-['Manrope'] text-outline mt-0.5 flex-wrap">
                <span className="flex items-center gap-1 text-on-surface-variant font-medium">
                  <Calendar className="w-3.5 h-3.5 text-outline shrink-0" />
                  <span>{exactDateStr}</span>
                </span>

                {exactTimeStr && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-outline shrink-0" />
                      <span>{exactTimeStr}</span>
                    </span>
                  </>
                )}

                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-outline shrink-0" />
                  <span>
                    {!isAllDone && totalItems > 0
                      ? `${completedItems}/${totalItems} items`
                      : t('home.itemsCount', { count: totalItems })}
                  </span>
                </span>

                {completionTimeStr && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-800 font-medium">
                      {t('history.completedAt', { time: completionTimeStr }) || `Done at ${completionTimeStr}`}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Area: In-Progress Quick Action & Three-Dot Menu */}
          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
            {/* If In-Progress: Direct 1-tap "Continue Shopping" button */}
            {!isAllDone && onContinueShopping && (
              <button
                type="button"
                onClick={handleContinueClick}
                aria-label={t('history.continueShopping') || 'Continue Shopping'}
                title={t('history.continueShopping') || 'Continue Shopping'}
                className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-white font-['Manrope'] text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Continue</span>
              </button>
            )}

            {/* Context Options Menu Button */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                id={`card_options_btn_${list.id}`}
                aria-label="List options"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic(6);
                  setIsMenuOpen((prev) => !prev);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-all active:scale-95 cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 rtl:right-auto rtl:left-0 top-9 z-30 w-48 bg-white rounded-2xl shadow-xl border border-surface-dim/80 py-1.5 animate-scale-in text-xs font-['Manrope'] font-semibold text-on-surface"
                >
                  {/* View Details */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onSelectList(list);
                    }}
                    className="w-full px-3.5 py-2.5 text-left rtl:text-right flex items-center gap-2 hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-outline" />
                    <span>View Details</span>
                  </button>

                  {/* In-Progress Actions: Continue & Mark Complete */}
                  {!isAllDone && (
                    <>
                      {onContinueShopping && (
                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleContinueClick}
                          className="w-full px-3.5 py-2.5 text-left rtl:text-right flex items-center gap-2 hover:bg-surface-container transition-colors text-primary font-bold cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>{t('history.continueShopping') || 'Continue Shopping'}</span>
                        </button>
                      )}

                      {onMarkComplete && (
                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleMarkCompleteClick}
                          className="w-full px-3.5 py-2.5 text-left rtl:text-right flex items-center gap-2 hover:bg-surface-container transition-colors text-emerald-800 font-bold cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                          <span>Mark as Complete</span>
                        </button>
                      )}
                    </>
                  )}

                  {/* Reuse as New List */}
                  {onReuseList && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleReuseClick}
                      className="w-full px-3.5 py-2.5 text-left rtl:text-right flex items-center gap-2 hover:bg-surface-container transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-outline" />
                      <span>{t('history.reuseList') || 'Reuse as New List'}</span>
                    </button>
                  )}

                  {/* Delete List */}
                  {onDeleteList && (
                    <>
                      <div className="my-1 border-t border-surface-dim/60" />
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleDeleteTrigger}
                        className="w-full px-3.5 py-2.5 text-left rtl:text-right flex items-center gap-2 hover:bg-rose-50 text-rose-700 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t('delete') || 'Delete List'}</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Chevron Right Indicator */}
            <div className="w-7 h-7 rounded-full bg-surface-container-low border border-surface-dim/50 flex items-center justify-center text-outline group-hover:text-primary group-hover:bg-emerald-50 group-hover:border-emerald-200/60 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all shrink-0 rtl:rotate-180">
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* BOTTOM PROGRESS ROW (For in-progress lists with items) */}
        {!isAllDone && totalItems > 0 && (
          <div className="w-full mt-3 pt-2 border-t border-surface-dim/50 flex items-center gap-3">
            <div className="flex-1 bg-surface-container rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-on-surface-variant font-['Manrope'] tabular-nums shrink-0">
              {percentComplete}% bought
            </span>
          </div>
        )}
      </article>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(false);
          }}
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
                {t('history.deleteConfirmTitle') || 'Delete this shopping list?'}
              </h3>
              <p className="font-['Manrope'] text-xs sm:text-sm text-outline leading-relaxed">
                {t('history.deleteConfirmDesc', { title: list.title }) ||
                  `"${list.title}" and its ${totalItems} associated items will be removed.`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="h-11 rounded-full bg-surface-container text-on-surface font-['Manrope'] text-xs sm:text-sm font-semibold hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="h-11 rounded-full bg-rose-600 text-white font-['Manrope'] text-xs sm:text-sm font-semibold hover:bg-rose-700 transition-colors shadow-xs active:scale-95 cursor-pointer"
              >
                {t('delete') || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
