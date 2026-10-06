import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Trash2,
  RotateCcw,
  Eye,
  Check,
} from 'lucide-react';
import { ShoppingList } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { BidiText } from '../utils/bidi';
import { ListIcon } from './ListIcon';
import { formatRelativeTimeAgo } from '../utils/dateFormatting';
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
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (listId: string) => void;
  onLongPress?: (listId: string) => void;
}

export const ShoppingListCard: React.FC<ShoppingListCardProps> = ({
  list,
  onSelectList,
  onDeleteList,
  onReuseList,
  selectable = false,
  selected = false,
  onToggleSelect,
  onLongPress,
}) => {
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  const startLongPress = () => {
    isLongPressTriggeredRef.current = false;
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      triggerHaptic(20);
      if (onLongPress) {
        onLongPress(list.id);
      }
    }, 450);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

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

  // Relative elapsed time formatting (e.g. "4 minutes ago", "1 hour 5 mins ago", "2 days ago")
  const relevantTimestamp =
    (isAllDone && (list.completedTimestamp || list.completedAt)) ||
    list.createdTimestamp ||
    list.createdAt;
  const timeAgoStr = formatRelativeTimeAgo(relevantTimestamp);

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
        onTouchStart={startLongPress}
        onTouchEnd={cancelLongPress}
        onTouchMove={cancelLongPress}
        onMouseDown={startLongPress}
        onMouseUp={cancelLongPress}
        onMouseLeave={cancelLongPress}
        onClick={() => {
          if (isLongPressTriggeredRef.current) {
            isLongPressTriggeredRef.current = false;
            return;
          }
          if (selectable && onToggleSelect) {
            triggerHaptic(6);
            onToggleSelect(list.id);
            return;
          }
          triggerHaptic(8);
          onSelectList(list);
        }}
        className={`w-full min-h-[78px] sm:min-h-[84px] bg-white dark:bg-surface-container-lowest rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between border shadow-2xs hover:shadow-xs active:scale-[0.99] transition-all relative select-none cursor-pointer group ${
          selectable && selected
            ? 'border-primary ring-2 ring-primary/30 bg-primary/5 dark:bg-primary/10'
            : 'border-surface-dim/80 hover:border-primary/40'
        }`}
      >
        {/* TOP ROW: Icon + Title & Time + 3-Dots in Top Right Corner (Arrow removed) */}
        <div className="flex items-start justify-between gap-2.5 w-full">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
            {/* Bulk Selection Checkbox */}
            {selectable && (
              <div
                role="checkbox"
                aria-checked={selected}
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic(6);
                  onToggleSelect?.(list.id);
                }}
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                  selected
                    ? 'bg-primary border-primary text-white shadow-2xs scale-105'
                    : 'bg-surface-container-low border-surface-dim text-transparent hover:border-primary/50'
                }`}
              >
                <Check className={`w-3.5 h-3.5 stroke-[3] transition-transform ${selected ? 'scale-100 text-white' : 'scale-0'}`} />
              </div>
            )}

            {/* Standardized Icon Area */}
            <ListIcon
              title={list.title}
              explicitIcon={list.icon}
              items={list.items}
              size="md"
              className="shrink-0 shadow-2xs"
            />

            {/* Title & Elapsed Relative Time (shifted up) */}
            <div className="flex flex-col min-w-0 flex-1 -mt-0.5">
              <BidiText
                as="h3"
                className="font-['Plus_Jakarta_Sans'] text-[15px] sm:text-base font-bold text-on-surface group-hover:text-primary transition-colors truncate leading-tight"
              >
                {list.title}
              </BidiText>
              {timeAgoStr && (
                <span className="text-[11px] sm:text-xs font-medium text-outline font-['Manrope'] mt-0.5 truncate">
                  {timeAgoStr}
                </span>
              )}
            </div>
          </div>

          {/* Three-Dot Menu Button in Top-Right Corner (Hidden in selection mode) */}
          {!selectable && (
            <div className="relative shrink-0 -mt-1 -mr-1" ref={menuRef}>
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

            {/* Dropdown Menu: View Details + Reuse List + Delete List */}
            {isMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 rtl:right-auto rtl:left-0 top-8 z-30 w-44 bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-surface-dim/80 py-1.5 animate-scale-in text-xs font-['Manrope'] font-semibold text-on-surface"
              >
                {/* 1. View Details (Open Details) */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    triggerHaptic(8);
                    onSelectList(list);
                  }}
                  className="w-full px-3.5 py-2 text-left rtl:text-right flex items-center gap-2 hover:bg-surface-container transition-colors cursor-pointer text-primary font-bold"
                >
                  <Eye className="w-3.5 h-3.5 text-primary" />
                  <span>{t('viewDetails') || 'View Details'}</span>
                </button>

                {/* 2. Reuse as New List */}
                {onReuseList && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleReuseClick}
                    className="w-full px-3.5 py-2 text-left rtl:text-right flex items-center gap-2 hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-outline" />
                    <span>{t('history.reuseList') || 'Reuse List'}</span>
                  </button>
                )}

                {/* 3. Delete List */}
                {onDeleteList && (
                  <>
                    <div className="my-1 border-t border-surface-dim/60" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleDeleteTrigger}
                      className="w-full px-3.5 py-2 text-left rtl:text-right flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t('delete') || 'Delete List'}</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

        {/* BOTTOM ROW: Shifted up automatically with compact card height */}
        <div className="flex items-center justify-between mt-auto pt-2 w-full">
          <div>
            {!isAllDone && totalItems > 0 && (
              <span className="text-[10.5px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 px-2 py-0.5 rounded-md">
                {percentComplete}% bought
              </span>
            )}
          </div>

          {/* Item count clearly positioned on bottom-right side */}
          <div className="text-[11px] sm:text-xs font-bold text-on-surface-variant font-['Manrope'] bg-surface-container/70 border border-surface-dim/60 px-2 py-0.5 rounded-md shrink-0">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </div>
        </div>
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
            className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-surface-dim space-y-4 animate-scale-in"
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
