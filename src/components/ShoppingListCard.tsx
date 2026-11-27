import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MoreVertical,
  Trash2,
  RotateCcw,
  Eye,
  Check,
  Camera,
  Share2,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { ShoppingList } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { BidiText } from '../utils/bidi';
import { ListIcon } from './ListIcon';
import { formatExactDate, formatRelativeTimeAgo } from '../utils/dateFormatting';
import { triggerHaptic } from '../lib/sound';
import { resolveVisual } from '../lib/catalog/visualResolver';
import { useRemoteConfig } from '../hooks/useRemoteConfig';
import { useShouldAnimate } from '../lib/motionPreference';

export interface ShoppingListCardProps {
  list: ShoppingList;
  onSelectList: (list: ShoppingList) => void;
  onContinueShopping?: (list: ShoppingList) => void;
  onMarkComplete?: (list: ShoppingList) => void;
  onDeleteList?: (listId: string) => void;
  onReuseList?: (list: ShoppingList) => void;
  onShareList?: (list: ShoppingList) => void;
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
  onShareList,
  variant = 'home',
  selectable = false,
  selected = false,
  onToggleSelect,
  onLongPress,
}) => {
  const { t } = useLanguage();
  const { config: remoteConfig } = useRemoteConfig();
  const canAnimate = useShouldAnimate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const showMenuDetails = remoteConfig.home?.showListMenuDetails !== false;
  const showMenuShare = remoteConfig.home?.showListMenuShare !== false;
  const showMenuReuse = remoteConfig.home?.showListMenuReuse !== false;
  const showMenuDelete = remoteConfig.home?.showListMenuDelete !== false;

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
  const photoCount = (list.items || []).filter((i) => i.imageUrl).length;
  const firstItemWithPhoto = (list.items || []).find((i) => Boolean(i.imageUrl));
  const firstItem = (list.items || [])[0];
  const firstItemCatalogVisual = !firstItemWithPhoto && firstItem ? resolveVisual(firstItem, 'icon') : undefined;
  const isAllDone = list.isCompleted || (totalItems > 0 && completedItems === totalItems);
  const percentComplete = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Relevant timestamp: completed timestamp/date for completed lists, otherwise created timestamp/date
  const relevantTimestamp =
    (isAllDone && (list.completedTimestamp || list.completedAt)) ||
    list.createdTimestamp ||
    list.createdAt;
  const timeAgoStr = formatRelativeTimeAgo(relevantTimestamp);
  const dateChipStr = formatExactDate(relevantTimestamp, { fallback: 'Recent' });

  const itemCountLabel =
    totalItems === 1
      ? t('history.singleItem') || '1 item'
      : t('history.pluralItems', { count: totalItems }) || `${totalItems} items`;

  const percentBoughtLabel =
    t('history.percentBought', { percent: percentComplete }) || `${percentComplete}% bought`;

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

  const handleCardActivation = () => {
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
  };

  const renderOptionsMenu = (dropdownTopClass: string) => {
    const menuBody = (
      <>
        {showMenuDetails && (
          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(false);
              triggerHaptic(8);
              onSelectList(list);
            }}
            className="w-full px-3.5 py-2.5 min-h-[44px] text-start flex items-center gap-2 hover:bg-surface-container transition-colors cursor-pointer text-primary font-bold"
          >
            <Eye className="w-4 h-4 text-primary shrink-0" />
            <span>{t('viewDetails') || 'View Details'}</span>
          </button>
        )}

        {onShareList && showMenuShare && (
          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(false);
              triggerHaptic(8);
              onShareList(list);
            }}
            className="w-full px-3.5 py-2.5 min-h-[44px] text-start flex items-center gap-2 hover:bg-surface-container transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-outline shrink-0" />
            <span>{t('shareList') || 'Share List'}</span>
          </button>
        )}

        {onReuseList && showMenuReuse && (
          <button
            type="button"
            role="menuitem"
            onClick={handleReuseClick}
            className="w-full px-3.5 py-2.5 min-h-[44px] text-start flex items-center gap-2 hover:bg-surface-container transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-outline shrink-0" />
            <span>{t('history.reuseList') || 'Reuse List'}</span>
          </button>
        )}

        {onDeleteList && showMenuDelete && (
          <>
            <div className="my-1 border-t border-surface-dim/60" />
            <button
              type="button"
              role="menuitem"
              onClick={handleDeleteTrigger}
              className="w-full px-3.5 py-2.5 min-h-[44px] text-start flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              <span>{t('delete') || 'Delete List'}</span>
            </button>
          </>
        )}
      </>
    );

    if (!canAnimate) {
      return isMenuOpen ? (
        <div
          role="menu"
          className={`absolute end-0 ${dropdownTopClass} z-[60] w-48 bg-surface-container-lowest rounded-2xl shadow-xl border border-[color:var(--yaad-settings-card-border)] py-1.5 popover-menu text-xs font-body font-semibold text-on-surface`}
        >
          {menuBody}
        </div>
      ) : null;
    }

    return (
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.16, ease: [0.32, 0.72, 0, 1] } }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.14, ease: [0.36, 0, 0.66, 0] } }}
            className={`absolute end-0 ${dropdownTopClass} z-[60] w-48 bg-surface-container-lowest rounded-2xl shadow-xl border border-[color:var(--yaad-settings-card-border)] py-1.5 popover-menu text-xs font-body font-semibold text-on-surface`}
          >
            {menuBody}
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <>
      {variant === 'history' ? (
        <article
          id={`list_card_${list.id}`}
          data-variant="history"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              handleCardActivation();
            }
          }}
          onTouchStart={startLongPress}
          onTouchEnd={cancelLongPress}
          onTouchMove={cancelLongPress}
          onMouseDown={startLongPress}
          onMouseUp={cancelLongPress}
          onMouseLeave={cancelLongPress}
          onClick={handleCardActivation}
          className={`w-full rounded-2xl p-4 flex flex-col justify-between gap-3 border transition-[transform,background-color,border-color] duration-150 ease-out active:scale-[0.99] active:duration-75 relative select-none cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
            isMenuOpen ? 'z-50' : 'z-auto'
          } ${
            selectable && selected
              ? 'border-primary ring-2 ring-primary/25 bg-primary/[0.06] dark:bg-primary/16 shadow-xs'
              : 'bg-surface-container-lowest border-[color:var(--yaad-settings-card-border)] shadow-[var(--yaad-settings-card-shadow)] hover:border-primary/40'
          }`}
        >
          {/* TOP ROW: Leading Circular List Icon + Title & Relative Time + Open Chevron & Options */}
          <div className="flex items-start justify-between gap-2 w-full">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {selectable && (
                <div
                  role="checkbox"
                  aria-checked={selected}
                  aria-label={`Select ${list.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic(6);
                    onToggleSelect?.(list.id);
                  }}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-[transform,background-color,border-color,color] duration-150 cursor-pointer ${
                    selected
                      ? 'bg-primary border-primary text-on-primary shadow-2xs scale-105'
                      : 'bg-surface-container-low border-surface-dim text-transparent hover:border-primary/50'
                  }`}
                >
                  <Check
                    className={`w-3.5 h-3.5 stroke-[3] transition-transform ${
                      selected ? 'scale-100 text-on-primary' : 'scale-0'
                    }`}
                  />
                </div>
              )}

              <ListIcon
                title={list.title}
                explicitIcon={list.icon}
                items={list.items}
                size="md"
                className="!rounded-full shrink-0 shadow-2xs"
              />

              <div className="flex flex-col min-w-0 flex-1">
                <BidiText
                  as="h3"
                  className="font-display text-[15px] sm:text-base font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1 leading-snug"
                >
                  {list.title}
                </BidiText>
                {timeAgoStr && (
                  <span className="text-xs font-medium text-outline font-body mt-0.5 truncate">
                    {timeAgoStr}
                  </span>
                )}
              </div>
            </div>

            {!selectable && (
              <div className="flex items-center shrink-0 -mt-1.5 -me-2">
                <ChevronRight
                  aria-hidden="true"
                  className="w-4 h-4 text-outline/60 group-hover:text-primary rtl:rotate-180 shrink-0 transition-colors"
                />
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    id={`card_options_btn_${list.id}`}
                    aria-label="List options"
                    aria-expanded={isMenuOpen}
                    aria-haspopup="menu"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic(6);
                      setIsMenuOpen((prev) => !prev);
                    }}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-[transform,background-color,color] duration-150 ease-out active:duration-75 active:scale-95 cursor-pointer"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {renderOptionsMenu('top-10')}
                </div>
              </div>
            )}
          </div>

          {/* OPTIONAL MEDIA & IN-PROGRESS BAR ROW (Wraps cleanly on 320px without squeezing title or chips) */}
          {((!isAllDone && totalItems > 0) || photoCount > 0 || Boolean(firstItemCatalogVisual?.url)) && (
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              {!isAllDone && totalItems > 0 && (
                <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-500/12 border border-amber-500/25 px-2.5 py-0.5 rounded-full">
                  {percentBoughtLabel}
                </span>
              )}

              {photoCount > 0 ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  {firstItemWithPhoto?.imageUrl && (
                    <img
                      src={firstItemWithPhoto.imageUrl}
                      alt={firstItemWithPhoto.name || 'Item photo'}
                      className="w-8 h-8 rounded-lg object-cover border border-primary/20 shadow-2xs shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                  <span
                    className="text-[11px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full flex items-center gap-1"
                    title={`${photoCount} item photo${photoCount === 1 ? '' : 's'} attached`}
                  >
                    <Camera className="w-3 h-3 text-primary shrink-0" />
                    <span>{`${photoCount} ${photoCount === 1 ? 'photo' : 'photos'}`}</span>
                  </span>
                </div>
              ) : firstItemCatalogVisual?.url ? (
                <img
                  src={firstItemCatalogVisual.url}
                  alt={firstItem?.name || 'Catalog thumbnail'}
                  className="w-8 h-8 rounded-lg object-contain bg-white border border-surface-container-high/60 shadow-2xs shrink-0 p-0.5"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}
            </div>
          )}

          {/* BOTTOM METADATA ROW: Date Chip + Status Chip + Item Count */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-2.5 border-t border-surface-dim/55 dark:border-white/10 mt-auto w-full">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span
                data-testid="history-card-date"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-on-surface-variant bg-surface-container-low dark:bg-surface-container px-2.5 py-1 rounded-full max-w-full truncate"
              >
                <Calendar className="w-3 h-3 text-outline shrink-0" />
                <span className="truncate">{dateChipStr}</span>
              </span>

              <span
                data-testid="history-card-status"
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  isAllDone
                    ? 'bg-emerald-500/12 text-emerald-800 dark:text-emerald-300 border-emerald-500/25'
                    : 'bg-amber-500/12 text-amber-800 dark:text-amber-300 border-amber-500/25'
                }`}
              >
                {isAllDone ? (
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                ) : (
                  <Clock className="w-3 h-3 shrink-0" />
                )}
                <span>
                  {isAllDone
                    ? t('history.filterCompleted') || 'Completed'
                    : t('history.filterActive') || 'In Progress'}
                </span>
              </span>
            </div>

            <span
              data-testid="history-card-item-count"
              className="text-xs font-bold text-on-surface font-body bg-surface-container/80 dark:bg-surface-container px-2.5 py-1 rounded-full shrink-0"
            >
              {itemCountLabel}
            </span>
          </div>
        </article>
      ) : (
        <article
          id={`list_card_${list.id}`}
          data-variant="home"
          onTouchStart={startLongPress}
          onTouchEnd={cancelLongPress}
          onTouchMove={cancelLongPress}
          onMouseDown={startLongPress}
          onMouseUp={cancelLongPress}
          onMouseLeave={cancelLongPress}
          onClick={handleCardActivation}
          className={`w-full min-h-[78px] sm:min-h-[84px] bg-white dark:bg-surface-container-lowest rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between border shadow-2xs hover:shadow-xs active:scale-[0.99] transition-[transform,background-color,box-shadow] duration-150 ease-out active:duration-75 relative select-none cursor-pointer group ${
            isMenuOpen ? 'z-50' : 'z-auto'
          } ${
            selectable && selected
              ? 'border-primary ring-2 ring-primary/30 bg-primary/5 dark:bg-primary/10'
              : 'border-surface-dim/80 hover:border-primary/40'
          }`}
        >
          {/* TOP ROW: Icon + Title & Time + 3-Dots in Top Right Corner */}
          <div className="flex items-start justify-between gap-2.5 w-full">
            <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
              {selectable && (
                <div
                  role="checkbox"
                  aria-checked={selected}
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic(6);
                    onToggleSelect?.(list.id);
                  }}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-[transform,background-color,border-color,color] duration-150 cursor-pointer ${
                    selected
                      ? 'bg-primary border-primary text-white shadow-2xs scale-105'
                      : 'bg-surface-container-low border-surface-dim text-transparent hover:border-primary/50'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 stroke-[3] transition-transform ${selected ? 'scale-100 text-white' : 'scale-0'}`} />
                </div>
              )}

              <ListIcon
                title={list.title}
                explicitIcon={list.icon}
                items={list.items}
                size="md"
                className="shrink-0 shadow-2xs"
              />

              <div className="flex flex-col min-w-0 flex-1 -mt-0.5">
                <BidiText
                  as="h3"
                  className="font-display text-[0.9375rem] sm:text-base font-bold text-on-surface group-hover:text-primary transition-colors truncate leading-tight"
                >
                  {list.title}
                </BidiText>
                {timeAgoStr && (
                  <span className="text-[0.6875rem] sm:text-xs font-medium text-outline font-body mt-0.5 truncate">
                    {timeAgoStr}
                  </span>
                )}
              </div>
            </div>

            {!selectable && (
              <div className="relative shrink-0 -mt-2 -me-2" ref={menuRef}>
                <button
                  type="button"
                  id={`card_options_btn_${list.id}`}
                  aria-label="List options"
                  aria-expanded={isMenuOpen}
                  aria-haspopup="menu"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic(6);
                    setIsMenuOpen((prev) => !prev);
                  }}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-[transform,background-color,color] duration-150 ease-out active:duration-75 active:scale-95 cursor-pointer"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {renderOptionsMenu('top-8')}
              </div>
            )}
          </div>

          {/* BOTTOM ROW */}
          <div className="flex items-center justify-between mt-auto pt-2 w-full">
            <div className="flex items-center gap-1.5 flex-wrap">
              {!isAllDone && totalItems > 0 && (
                <span className="text-[0.65625rem] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 px-2 py-0.5 rounded-md">
                  {percentBoughtLabel}
                </span>
              )}
              {photoCount > 0 ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  {firstItemWithPhoto?.imageUrl && (
                    <img
                      src={firstItemWithPhoto.imageUrl}
                      alt={firstItemWithPhoto.name || 'Item photo'}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover border border-primary/20 shadow-2xs shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                  <span
                    className="text-[0.65625rem] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md flex items-center gap-1"
                    title={`${photoCount} item photo${photoCount === 1 ? '' : 's'} attached`}
                  >
                    <Camera className="w-3 h-3 text-primary shrink-0" />
                    <span>{`${photoCount} ${photoCount === 1 ? 'photo' : 'photos'}`}</span>
                  </span>
                </div>
              ) : firstItemCatalogVisual?.url ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <img
                    src={firstItemCatalogVisual.url}
                    alt={firstItem?.name || 'Catalog thumbnail'}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-contain bg-white border border-surface-container-high/60 shadow-2xs shrink-0 p-0.5"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : null}
            </div>

            <div className="text-[0.6875rem] sm:text-xs font-bold text-on-surface-variant font-body bg-surface-container/70 border border-surface-dim/60 px-2 py-0.5 rounded-md shrink-0">
              {itemCountLabel}
            </div>
          </div>
        </article>
      )}

      {/* Delete Confirmation Modal */}
      {(() => {
        const modalCard = (
          <>
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-900/60">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-display text-lg font-bold text-on-surface">
                {t('history.deleteConfirmTitle') || 'Delete this shopping list?'}
              </h3>
              <p className="font-body text-xs sm:text-sm text-outline leading-relaxed">
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
                className="h-11 rounded-full bg-surface-container text-on-surface font-body text-xs sm:text-sm font-semibold hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="h-11 rounded-full bg-rose-600 text-white font-body text-xs sm:text-sm font-semibold hover:bg-rose-700 transition-colors shadow-xs active:scale-95 cursor-pointer"
              >
                {t('delete') || 'Delete'}
              </button>
            </div>
          </>
        );

        if (!canAnimate) {
          return showDeleteConfirm ? (
            <div
              role="dialog"
              aria-modal="true"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(false);
              }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-surface-container-lowest rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[color:var(--yaad-settings-card-border)] space-y-4"
              >
                {modalCard}
              </div>
            </div>
          ) : null;
        }

        return (
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                role="dialog"
                aria-modal="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.16, ease: [0.32, 0.72, 0, 1] } }}
                exit={{ opacity: 0, transition: { duration: 0.14, ease: [0.36, 0, 0.66, 0] } }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1, transition: { duration: 0.18, ease: [0.32, 0.72, 0, 1] } }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.16, ease: [0.36, 0, 0.66, 0] } }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-surface-container-lowest rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[color:var(--yaad-settings-card-border)] space-y-4"
                >
                  {modalCard}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        );
      })()}
    </>
  );
};
