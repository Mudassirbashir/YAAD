import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check } from 'lucide-react';
import { ShoppingList } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import {
  getItemStatusInActiveList,
  EssentialDisplayItem,
} from '../../lib/recommendations/popularEssentials';
import { playItemAddSound, triggerHaptic } from '../../lib/sound';
import { resolveVisual } from '../../lib/catalog/visualResolver';
import { useCatalogVersion } from '../../lib/catalog/supabaseCatalog';
import { useRemoteConfig } from '../../hooks/useRemoteConfig';

interface FrequentEssentialsSectionProps {
  lists: ShoppingList[];
  mostRecentActiveList?: ShoppingList | null;
  onAddItem: (item: EssentialDisplayItem) => void;
  onViewAll?: () => void;
}

/**
 * Fixed list of exactly 8 items for the home screen (4 rows × 2 columns).
 * Hardcoded, identical order for EVERY user:
 * 1. Milk — 1 Litre
 * 2. Eggs — 1 Dozen
 * 3. Potatoes — 1 kg
 * 4. Tomatoes — 1 kg
 * 5. Rice — 1 kg
 * 6. Sugar — 1 kg
 * 7. Onions — 1 kg
 * 8. Cooking Oil — 1 Litre
 */
export const FIXED_HOME_ESSENTIALS: EssentialDisplayItem[] = [
  {
    canonicalName: 'milk',
    displayName: 'Milk',
    nameUrdu: 'دودھ',
    nameRomanUrdu: 'Doodh',
    category: 'dairy',
    quantity: '1',
    unit: 'Litre',
    isPersonalized: false,
  },
  {
    canonicalName: 'eggs',
    displayName: 'Eggs',
    nameUrdu: 'انڈے',
    nameRomanUrdu: 'Anday',
    category: 'poultry',
    quantity: '1',
    unit: 'Dozen',
    isPersonalized: false,
  },
  {
    canonicalName: 'potatoes',
    displayName: 'Potatoes',
    nameUrdu: 'آلو',
    nameRomanUrdu: 'Aloo',
    category: 'vegetables',
    quantity: '1',
    unit: 'kg',
    isPersonalized: false,
  },
  {
    canonicalName: 'tomatoes',
    displayName: 'Tomatoes',
    nameUrdu: 'ٹماٹر',
    nameRomanUrdu: 'Tamatar',
    category: 'vegetables',
    quantity: '1',
    unit: 'kg',
    isPersonalized: false,
  },
  {
    canonicalName: 'rice',
    displayName: 'Rice',
    nameUrdu: 'چاول',
    nameRomanUrdu: 'Chawal',
    category: 'rice',
    quantity: '1',
    unit: 'kg',
    isPersonalized: false,
  },
  {
    canonicalName: 'sugar',
    displayName: 'Sugar',
    nameUrdu: 'چینی',
    nameRomanUrdu: 'Cheeni',
    category: 'cooking_essentials',
    quantity: '1',
    unit: 'kg',
    isPersonalized: false,
  },
  {
    canonicalName: 'onions',
    displayName: 'Onions',
    nameUrdu: 'پیاز',
    nameRomanUrdu: 'Pyaz',
    category: 'vegetables',
    quantity: '1',
    unit: 'kg',
    isPersonalized: false,
  },
  {
    canonicalName: 'cooking_oil',
    displayName: 'Cooking Oil',
    nameUrdu: 'کوکنگ آئل',
    nameRomanUrdu: 'Cooking Oil',
    category: 'cooking_essentials',
    quantity: '1',
    unit: 'Litre',
    isPersonalized: false,
  },
];

/**
 * Hyper-accurate staple visual renderer:
 * Product photo sits in a fixed-size circle (rounded-full, ~56px, w-14 h-14),
 * centered, object-cover. Uses existing Cloudinary catalog photos through resolveVisual.
 */
export const FrequentEssentialVisual: React.FC<{
  item: EssentialDisplayItem;
}> = ({ item }) => {
  const [hasImgError, setHasImgError] = useState(false);
  const visual = resolveVisual({
    canonicalName: item.canonicalName,
    canonical_name: item.canonicalName,
    name: item.displayName,
    displayName: item.displayName,
    category: item.category,
    categoryId: item.category,
  });

  const showPhoto = !hasImgError && visual.type !== 'emoji' && Boolean(visual.url);

  if (showPhoto) {
    return (
      <img
        src={visual.url}
        alt={item.displayName}
        crossOrigin="anonymous"
        onError={() => setHasImgError(true)}
        loading="lazy"
        className="w-full h-full object-cover object-center rounded-full"
      />
    );
  }

  // Accurate emoji fallback
  const getFallbackEmoji = (norm: string): string => {
    if (norm.includes('milk') || norm.includes('doodh')) return '🥛';
    if (norm.includes('egg') || norm.includes('anda')) return '🥚';
    if (norm.includes('potato') || norm.includes('aloo')) return '🥔';
    if (norm.includes('tomato') || norm.includes('tamatar')) return '🍅';
    if (norm.includes('rice') || norm.includes('chawal')) return '🍚';
    if (norm.includes('sugar') || norm.includes('cheeni')) return '🍬';
    if (norm.includes('onion') || norm.includes('pyaz')) return '🧅';
    if (norm.includes('oil') || norm.includes('ghee')) return '🛢️';
    if (norm.includes('bread') || norm.includes('roti')) return '🍞';
    if (norm.includes('tea') || norm.includes('chai')) return '☕';
    return '🛒';
  };

  const norm = (item.canonicalName || item.displayName || '').toLowerCase().trim();
  return (
    <span className="text-2xl select-none filter drop-shadow-xs">
      {getFallbackEmoji(norm)}
    </span>
  );
};

/**
 * Format quantity and unit matching screenshot format:
 * e.g. "1 Litre", "1 Dozen", "1 kg"
 * Capitalizes Litre, Dozen; keeps "kg" lowercase.
 */
export const formatEssentialQuantity = (qty: string, unitStr: string): string => {
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

export const FrequentEssentialsSection: React.FC<FrequentEssentialsSectionProps> = ({
  lists,
  mostRecentActiveList,
  onAddItem,
  onViewAll,
}) => {
  const { t } = useLanguage();
  useCatalogVersion();
  const { config: remoteConfig } = useRemoteConfig();

  // Added items micro-feedback tracker: canonicalName -> boolean
  const [addedItemsMap, setAddedItemsMap] = useState<Record<string, boolean>>({});
  const [addingItemId, setAddingItemId] = useState<string | null>(null);

  // Authoritative fixed essentials list: remoteConfig overrides if provided, otherwise default FIXED_HOME_ESSENTIALS
  const configuredList = (remoteConfig.essentials?.fixedList && remoteConfig.essentials.fixedList.length > 0)
    ? remoteConfig.essentials.fixedList
    : FIXED_HOME_ESSENTIALS;
  const count = remoteConfig.home?.essentialsCount || 8;
  const essentials = configuredList.slice(0, count);

  const showViewAll = remoteConfig.home?.showEssentialsViewAll !== false && !!onViewAll;

  const handleAddClick = (item: EssentialDisplayItem) => {
    if (addingItemId === item.canonicalName) return;

    setAddingItemId(item.canonicalName);
    playItemAddSound();
    triggerHaptic(12);

    onAddItem(item);

    // Immediate tactile feedback state
    setAddedItemsMap((prev) => ({ ...prev, [item.canonicalName]: true }));
    setTimeout(() => {
      setAddedItemsMap((prev) => ({ ...prev, [item.canonicalName]: false }));
      setAddingItemId(null);
    }, 1600);
  };

  return (
    <section
      id="home_essentials_section"
      aria-label="Frequent Essentials"
      className="flex flex-col gap-3 select-none pt-1 w-full"
    >
      {/* Section Header: Title "Frequent Essentials" (left) + "View All" link (right) */}
      <div className="flex items-baseline justify-between px-0.5">
        <h3 className="font-display text-[19px] sm:text-[20px] font-extrabold text-[#1c2826] dark:text-white tracking-tight leading-tight">
          {t('home.essentials.title') || 'Frequent Essentials'}
        </h3>
        {showViewAll && (
          <button
            type="button"
            id="view_all_essentials_btn"
            onClick={onViewAll}
            className="font-body text-[14px] font-semibold text-[#0F3D2E] dark:text-emerald-400 underline underline-offset-2 hover:opacity-80 active:scale-95 transition-all cursor-pointer p-1.5 -m-1.5 min-h-[44px] inline-flex items-center"
          >
            {t('home.viewAll') || 'View All'}
          </button>
        )}
      </div>

      {/* Grid: 2 columns on mobile (gap ~10-12px), 8 items visible = 4 rows × 2 columns */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full">
        {essentials.map((item) => {
          const isAdded = !!addedItemsMap[item.canonicalName];
          const isAdding = addingItemId === item.canonicalName;
          const activeStatus = getItemStatusInActiveList(item.canonicalName, mostRecentActiveList);
          const quantityLabel = formatEssentialQuantity(item.quantity, item.unit);

          return (
            <div
              key={item.canonicalName}
              id={`essential_card_${item.canonicalName}`}
              onClick={() => handleAddClick(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleAddClick(item);
                }
              }}
              className="bg-white dark:bg-surface-container-low rounded-2xl py-1.5 px-2 xs:py-2 xs:px-2.5 sm:py-2 sm:px-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-surface-dim/40 flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 cursor-pointer select-none hover:shadow-md transition-all active:scale-[0.99] min-h-[58px] xs:min-h-[62px] sm:min-h-[64px] w-full overflow-hidden"
            >
              {/* Image (left): Circular photo, compact object-cover centered */}
              <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 rounded-full bg-white dark:bg-stone-900 border border-surface-dim/60 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                <FrequentEssentialVisual item={item} />
              </div>

              {/* Text (middle, flex-1, two lines, left-aligned): Compact fonts, reduced whitespace */}
              <div className="flex-1 min-w-0 flex flex-col justify-center text-left rtl:text-right overflow-hidden pr-0.5">
                {/* Line 1 — item name: ~13px, weight 700, near-black */}
                <h4 className="font-display text-[12.5px] xs:text-[13px] sm:text-[13.5px] font-bold text-[#1c2826] dark:text-white leading-tight truncate">
                  {item.displayName}
                </h4>
                {/* Line 2 — quantity: ~11px, weight 400, medium gray #717974 */}
                <p className="font-body text-[10.5px] xs:text-[11px] sm:text-[11.5px] font-normal text-[#717974] dark:text-neutral-400 leading-tight mt-0.5 truncate">
                  {quantityLabel}
                </p>
              </div>

              {/* Small Green Circle Button with Animated White Plus -> Check Tick (Size preserved: w-7 h-7 / w-8 h-8) */}
              <div className="relative shrink-0 flex items-center justify-center">
                <button
                  type="button"
                  disabled={isAdding}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddClick(item);
                  }}
                  aria-label={`Add ${item.displayName} to shopping list`}
                  className="w-8 h-8 xs:w-9 xs:h-9 flex items-center justify-center cursor-pointer transition-transform active:scale-90"
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
    </section>
  );
};
