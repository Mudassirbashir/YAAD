import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Plus, Check, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  CURATED_HOUSEHOLD_ESSENTIALS,
  EssentialDisplayItem,
  getItemStatusInActiveList,
} from '../lib/recommendations/popularEssentials';
import { INITIAL_MASTER_CATALOG } from '../lib/catalog/items';
import { supabaseCatalog, useCatalogVersion } from '../lib/catalog/supabaseCatalog';
import { ShoppingList } from '../types';
import { FrequentEssentialVisual } from './home/FrequentEssentialsSection';
import { playItemAddSound, triggerHaptic } from '../lib/sound';

interface ViewAllEssentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lists: ShoppingList[];
  mostRecentActiveList?: ShoppingList | null;
  onAddItem: (item: EssentialDisplayItem) => void;
}

export const ViewAllEssentialsModal: React.FC<ViewAllEssentialsModalProps> = ({
  isOpen,
  onClose,
  lists,
  mostRecentActiveList,
  onAddItem,
}) => {
  const { t, language } = useLanguage();
  const catalogVersion = useCatalogVersion();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedItemsMap, setAddedItemsMap] = useState<Record<string, boolean>>({});
  const [addingItemId, setAddingItemId] = useState<string | null>(null);

  // Combine curated household essentials with rest of catalog staples
  const allEssentials = useMemo(() => {
    const seen = new Set<string>();
    const list: EssentialDisplayItem[] = [];

    // 1. Curated household staples first
    CURATED_HOUSEHOLD_ESSENTIALS.forEach((curated) => {
      const key = curated.canonicalName.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        list.push(curated);
      }
    });

    // 2. All other grocery catalog items
    const sourceItems = supabaseCatalog.getItems() || INITIAL_MASTER_CATALOG;
    sourceItems.forEach((catItem) => {
      const key = (catItem.canonical_name || catItem.english_name).toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        // Map to EssentialDisplayItem
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
  }, [catalogVersion]);

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

  /**
   * Format quantity and unit matching screenshot format:
   * e.g. "1 Litre", "1 Dozen", "1 kg"
   */
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('essentials.searchPlaceholder') || 'Search staples & essentials (Milk, Eggs, Atta)...'}
                aria-label="Search essentials"
                className="w-full h-11 ps-10 pe-4 bg-surface-container-lowest dark:bg-surface-container border border-surface-dim rounded-xl font-body text-sm text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="w-9 h-9 absolute end-1 top-1/2 -translate-y-1/2 flex items-center justify-center text-outline hover:text-on-surface cursor-pointer"
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

          {/* Grid of row cards */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-5">
            {filteredEssentials.length === 0 ? (
              <div className="text-center py-16 text-outline font-body text-sm">
                {t('common.noResults') || 'No essentials match your search.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredEssentials.map((item) => {
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
                      className="bg-white dark:bg-surface-container-low rounded-2xl p-3 sm:p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-surface-dim/40 flex items-center gap-3 cursor-pointer select-none hover:shadow-md transition-all active:scale-[0.99] min-h-[80px]"
                    >
                      {/* Left: 56x56 photo stage */}
                      <div className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-xl bg-white dark:bg-stone-900 border border-surface-dim/60 flex items-center justify-center overflow-hidden shrink-0">
                        <FrequentEssentialVisual item={item} />
                      </div>

                      {/* Middle: Name (line 1) + Quantity (line 2) */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center text-left rtl:text-right">
                        <h4 className="font-display text-[15px] font-bold text-[#1c2826] dark:text-white leading-tight truncate">
                          {item.displayName}
                        </h4>
                        <p className="font-body text-[13px] font-normal text-[#717974] dark:text-neutral-400 leading-tight mt-0.5 truncate">
                          {formatQuantity(item.quantity, item.unit)}
                        </p>
                      </div>

                      {/* Right: + Add pill button */}
                      <div className="relative shrink-0 flex items-center justify-center">
                        <button
                          type="button"
                          disabled={isAdding}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddClick(item);
                          }}
                          aria-label={`Add ${item.displayName} to shopping list`}
                          className={`h-8 px-3 rounded-full text-[13px] font-semibold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shadow-none select-none min-w-[68px] ${
                            isAdded
                              ? 'bg-emerald-600 text-white'
                              : activeStatus.inList
                              ? 'bg-[#0F3D2E] text-white opacity-90'
                              : 'bg-[#0F3D2E] hover:bg-[#0c3125] text-white'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>{t('home.essentials.added') || 'Added'}</span>
                            </>
                          ) : activeStatus.inList ? (
                            <>
                              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>{t('home.essentials.addMore') || 'Add'}</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>{t('home.essentials.add') || 'Add'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
