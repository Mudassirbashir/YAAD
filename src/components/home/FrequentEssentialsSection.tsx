import React, { useState, useMemo } from 'react';
import { Plus, Check } from 'lucide-react';
import { ShoppingList } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import {
  getRankedPopularEssentials,
  getItemStatusInActiveList,
  EssentialDisplayItem,
} from '../../lib/recommendations/popularEssentials';
import { playItemAddSound, triggerHaptic } from '../../lib/sound';
import { resolveVisual } from '../../lib/catalog/visualResolver';
import { useCatalogVersion } from '../../lib/catalog/supabaseCatalog';

interface FrequentEssentialsSectionProps {
  lists: ShoppingList[];
  mostRecentActiveList?: ShoppingList | null;
  onAddItem: (item: EssentialDisplayItem) => void;
  onViewAll?: () => void;
}

/**
 * Hyper-accurate staple visual renderer:
 * 1. Checks existing Cloudinary catalog image via resolveVisual
 * 2. Falls back to emoji if no photo or on error
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
        className="w-full h-full object-contain p-1"
      />
    );
  }

  // Accurate emoji fallback
  const getFallbackEmoji = (norm: string): string => {
    if (norm.includes('milk') || norm.includes('doodh')) return '🥛';
    if (norm.includes('egg') || norm.includes('anda')) return '🥚';
    if (norm.includes('potato') || norm.includes('aloo')) return '🥔';
    if (norm.includes('rice') || norm.includes('chawal')) return '🍚';
    if (norm.includes('sugar') || norm.includes('cheeni')) return '🍬';
    if (norm.includes('onion') || norm.includes('pyaz')) return '🧅';
    if (norm.includes('tomato') || norm.includes('tamatar')) return '🍅';
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

  // Added items micro-feedback tracker: canonicalName -> boolean
  const [addedItemsMap, setAddedItemsMap] = useState<Record<string, boolean>>({});
  const [addingItemId, setAddingItemId] = useState<string | null>(null);

  // Home screen shows exactly 6 items: 3 rows × 2 columns
  const { items: rankedEssentials } = useMemo(() => {
    return getRankedPopularEssentials(lists, 6);
  }, [lists]);

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
      className="flex flex-col gap-3 select-none pt-1"
    >
      {/* A1. Section Header: Title "Frequent Essentials" (left) + "View All" link (right) */}
      <div className="flex items-baseline justify-between px-0.5">
        <h3 className="font-display text-[19px] sm:text-[20px] font-extrabold text-[#1c2826] dark:text-white tracking-tight leading-tight">
          {t('home.essentials.title') || 'Frequent Essentials'}
        </h3>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="font-body text-[14px] font-semibold text-[#0F3D2E] dark:text-emerald-400 underline underline-offset-2 hover:opacity-80 active:scale-95 transition-all cursor-pointer p-1 -m-1"
          >
            {t('home.viewAll') || 'View All'}
          </button>
        )}
      </div>

      {/* A2. Grid: 2 columns on mobile (gap ~12px), 6 items visible = 3 rows × 2 columns */}
      <div className="grid grid-cols-2 gap-3">
        {rankedEssentials.map((item) => {
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
              className="bg-white dark:bg-surface-container-low rounded-2xl p-3 sm:p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-surface-dim/40 flex items-center gap-3 cursor-pointer select-none hover:shadow-md transition-all active:scale-[0.99] min-h-[80px] sm:min-h-[84px]"
            >
              {/* Image (left): ~56×56px (w-14 h-14), object-contain, white background */}
              <div className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-xl bg-white dark:bg-stone-900 border border-surface-dim/60 flex items-center justify-center overflow-hidden shrink-0">
                <FrequentEssentialVisual item={item} />
              </div>

              {/* Text (middle, flex-1, two lines, left-aligned) */}
              <div className="flex-1 min-w-0 flex flex-col justify-center text-left rtl:text-right">
                {/* Line 1 — item name: ~15px, weight 700, near-black */}
                <h4 className="font-display text-[15px] font-bold text-[#1c2826] dark:text-white leading-tight truncate">
                  {item.displayName}
                </h4>
                {/* Line 2 — quantity: ~13px, weight 400-500, medium gray #717974 */}
                <p className="font-body text-[13px] font-normal text-[#717974] dark:text-neutral-400 leading-tight mt-0.5 truncate">
                  {quantityLabel}
                </p>
              </div>

              {/* "+ Add" button (right): dark green #0F3D2E, white text ~13px weight 600, "+" icon + "Add" text */}
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
    </section>
  );
};
