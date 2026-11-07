import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Plus, Check, ArrowLeft, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  CURATED_HOUSEHOLD_ESSENTIALS,
  EssentialDisplayItem,
  getItemStatusInActiveList,
} from '../lib/recommendations/popularEssentials';
import { INITIAL_MASTER_CATALOG } from '../lib/catalog/items';
import { supabaseCatalog, useCatalogVersion } from '../lib/catalog/supabaseCatalog';
import { ShoppingList } from '../types';
import { FrequentEssentialVisual, FIXED_HOME_ESSENTIALS } from './home/FrequentEssentialsSection';
import { playItemAddSound, triggerHaptic } from '../lib/sound';

interface ViewAllEssentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lists: ShoppingList[];
  mostRecentActiveList?: ShoppingList | null;
  onAddItem: (item: EssentialDisplayItem) => void;
}

const PAGE_SIZE = 40;

export const ViewAllEssentialsModal: React.FC<ViewAllEssentialsModalProps> = ({
  isOpen,
  onClose,
  lists,
  mostRecentActiveList,
  onAddItem,
}) => {
  const { t } = useLanguage();
  const catalogVersion = useCatalogVersion();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedItemsMap, setAddedItemsMap] = useState<Record<string, boolean>>({});
  const [addingItemId, setAddingItemId] = useState<string | null>(null);

  // Pagination limit to ensure instant sub-second opening without UI freezing
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset search and pagination when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setVisibleCount(PAGE_SIZE);
      setSearchQuery('');
    }
  }, [isOpen]);

  // Combine fixed home staples first, then other curated household essentials, then rest of grocery catalog
  const allEssentials = useMemo(() => {
    if (!isOpen) return []; // Don't compute heavy catalog arrays when closed!

    const seen = new Set<string>();
    const list: EssentialDisplayItem[] = [];

    // 1. The 8 fixed essentials first in exact order
    FIXED_HOME_ESSENTIALS.forEach((item) => {
      const key = item.canonicalName.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        list.push(item);
      }
    });

    // 2. Any additional curated staples
    CURATED_HOUSEHOLD_ESSENTIALS.forEach((curated) => {
      const key = curated.canonicalName.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        list.push(curated);
      }
    });

    // 3. All other grocery catalog items
    const sourceItems = supabaseCatalog.getItems() || INITIAL_MASTER_CATALOG;
    sourceItems.forEach((catItem) => {
      const key = (catItem.canonical_name || catItem.english_name).toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        const unit = catItem.default_unit || 'piece';
        const formattedUnit =
          unit.toLowerCase() === 'litre' || unit.toLowerCase() === 'liter'
            ? 'Litre'
            : unit.toLowerCase() === 'dozen'
            ? 'Dozen'
            : unit.toLowerCase() === 'kg'
            ? 'kg'
            : unit;

        list.push({
          canonicalName: catItem.canonical_name,
          displayName: catItem.english_name,
          nameUrdu: catItem.urdu_name,
          nameRomanUrdu: catItem.roman_urdu_names?.[0],
          category: catItem.category_id,
          quantity: '1',
          unit: formattedUnit,
          isPersonalized: false,
        });
      }
    });

    return list;
  }, [isOpen, catalogVersion]);

  // Filtered by search query
  const filteredEssentials = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return allEssentials;
    return allEssentials.filter((item) => {
      return (
        item.displayName.toLowerCase().includes(q) ||
        item.canonicalName.toLowerCase().includes(q) ||
        item.nameUrdu?.includes(q) ||
        item.nameRomanUrdu?.toLowerCase().includes(q)
      );
    });
  }, [allEssentials, searchQuery]);

  // Paginated slice for buttery-smooth rendering
  const paginatedEssentials = useMemo(() => {
    return filteredEssentials.slice(0, visibleCount);
  }, [filteredEssentials, visibleCount]);

  // Infinite scroll listener
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 250) {
      setVisibleCount((prev) => {
        if (prev < filteredEssentials.length) {
          return prev + PAGE_SIZE;
        }
        return prev;
      });
    }
  }, [filteredEssentials.length]);

  const handleAddClick = (item: EssentialDisplayItem) => {
    if (addingItemId === item.canonicalName) return;

    setAddingItemId(item.canonicalName);
    playItemAddSound();
    triggerHaptic(12);

    onAddItem(item);

    setAddedItemsMap((prev) => ({ ...prev, [item.canonicalName]: true }));
    setTimeout(() => {
      setAddedItemsMap((prev) => ({ ...prev, [item.canonicalName]: false }));
      setAddingItemId(null);
    }, 1600);
  };

  const formatQuantity = (qty: string, unitStr: string): string => {
    const rawUnit = (unitStr || '').trim();
    const cleanQty = (qty || '1').trim();
    let formattedUnit = rawUnit;
    const lower = rawUnit.toLowerCase();
    if (lower === 'litre' || lower === 'liter') {
      formattedUnit = 'Litre';
    } else if (lower === 'dozen') {
      formattedUnit = 'Dozen';
    } else if (lower === 'kg') {
      formattedUnit = 'kg';
    } else if (lower === 'g' || lower === 'gram' || lower === 'grams') {
      formattedUnit = 'g';
    } else if (lower === 'piece' || lower === 'pieces') {
      formattedUnit = 'piece';
    }
    return `${cleanQty} ${formattedUnit}`.trim();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 12 }}
          className="bg-[#FAFAFA] dark:bg-surface-container-lowest w-full max-w-2xl h-full sm:h-[88vh] sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl border border-surface-dim/70"
        >
          {/* Header */}
          <div className="bg-white dark:bg-surface-container-low px-4 sm:px-6 py-3.5 border-b border-surface-dim/70 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                aria-label="Back to home"
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
              </button>
              <div>
                <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#1c2826] dark:text-white tracking-tight">
                  {t('home.essentials.title') || 'Frequent Essentials'}
                </h2>
                <p className="font-body text-xs text-[#717974] dark:text-outline font-medium">
                  {filteredEssentials.length} {t('essentials.itemsAvailable') || 'staples & essentials'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search bar */}
          <div className="p-3.5 sm:p-4 bg-white dark:bg-surface-container-low border-b border-surface-dim/50 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-outline absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                placeholder={t('essentials.searchPlaceholder') || 'Search staples & essentials (Milk, Eggs, Atta)...'}
                aria-label="Search essentials"
                className="w-full h-11 ps-10 pe-10 bg-surface-container-lowest dark:bg-surface-container border border-surface-dim rounded-xl font-body text-sm text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="w-10 h-10 absolute end-0.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-outline hover:text-on-surface cursor-pointer rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Active list indicator */}
          {mostRecentActiveList && (
            <div className="bg-primary/5 border-b border-primary/15 px-4 py-2 flex items-center justify-between text-xs font-body text-primary shrink-0">
              <span className="truncate">
                {t('home.addingTo') || 'Adding directly to:'}{' '}
                <strong className="font-bold">{mostRecentActiveList.title}</strong>
              </span>
              <span className="text-[11px] text-outline font-medium shrink-0">
                {(mostRecentActiveList.items || []).length} items
              </span>
            </div>
          )}

          {/* Grid of row cards with smooth infinite scroll */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-3.5 sm:p-5"
          >
            {filteredEssentials.length === 0 ? (
              <div className="text-center py-16 text-outline font-body text-sm">
                {t('common.noResults') || 'No essentials match your search.'}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paginatedEssentials.map((item) => {
                    const isAdded = !!addedItemsMap[item.canonicalName];
                    const isAdding = addingItemId === item.canonicalName;
                    const activeStatus = getItemStatusInActiveList(
                      item.canonicalName,
                      mostRecentActiveList
                    );

                    return (
                      <div
                        key={item.canonicalName}
                        id={`view_all_card_${item.canonicalName}`}
                        onClick={() => handleAddClick(item)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleAddClick(item);
                          }
                        }}
                        style={{ borderRadius: '1rem' }}
                        className="bg-white dark:bg-surface-container-low rounded-2xl p-2.5 xs:p-3 sm:p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-surface-dim/40 flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none hover:shadow-md transition-all active:scale-[0.99] min-h-[80px] w-full overflow-hidden"
                      >
                        {/* Left: 56x56 circular photo stage */}
                        <div className="w-13 h-13 sm:w-14 sm:h-14 min-w-[52px] min-h-[52px] sm:min-w-[56px] sm:min-h-[56px] rounded-full bg-white dark:bg-stone-900 border border-surface-dim/60 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                          <FrequentEssentialVisual item={item} />
                        </div>

                        {/* Middle: Name (line 1) + Quantity (line 2) - NEVER COLLAPSES */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center text-left rtl:text-right overflow-hidden">
                          <h4 className="font-display text-[14px] sm:text-[15px] font-bold text-[#1c2826] dark:text-white leading-tight truncate">
                            {item.displayName}
                          </h4>
                          <p className="font-body text-[12px] sm:text-[13px] font-normal text-[#717974] dark:text-neutral-400 leading-tight mt-0.5 truncate">
                            {formatQuantity(item.quantity, item.unit)}
                          </p>
                        </div>

                        {/* Right: Small Green Circle Button with Animated White Plus -> Check Tick */}
                        <div className="relative shrink-0 flex items-center justify-center">
                          <button
                            type="button"
                            disabled={isAdding}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddClick(item);
                            }}
                            aria-label={`Add ${item.displayName} to shopping list`}
                            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                          >
                            <motion.div
                              animate={
                                isAdded
                                  ? { scale: [1, 1.25, 1], backgroundColor: '#16a34a' }
                                  : { scale: 1, backgroundColor: '#0F3D2E' }
                              }
                              transition={{ duration: 0.28, ease: 'easeOut' }}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white shadow-xs"
                            >
                              <AnimatePresence mode="wait" initial={false}>
                                {isAdded ? (
                                  <motion.div
                                    key="checked"
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                  >
                                    <Check className="w-4 h-4 stroke-[3]" />
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="plus"
                                    initial={{ scale: 0, rotate: 45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                  >
                                    <Plus className="w-4 h-4 stroke-[2.8]" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Infinite scroll loader */}
                {visibleCount < filteredEssentials.length && (
                  <div className="py-6 flex justify-center items-center">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
