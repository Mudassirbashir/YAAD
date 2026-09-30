import React, { useState, useMemo } from 'react';
import { Sparkles, Plus, Check } from 'lucide-react';
import { ShoppingList, CategoryId } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { EssentialItemVisual } from '../EssentialItemVisual';
import {
  getRankedPopularEssentials,
  getItemStatusInActiveList,
  EssentialDisplayItem,
} from '../../lib/recommendations/popularEssentials';
import { playItemAddSound, triggerHaptic } from '../../lib/sound';

interface FrequentEssentialsSectionProps {
  lists: ShoppingList[];
  mostRecentActiveList?: ShoppingList | null;
  onAddItem: (item: EssentialDisplayItem) => void;
  onViewAllCategories: () => void;
}

export const FrequentEssentialsSection: React.FC<FrequentEssentialsSectionProps> = ({
  lists,
  mostRecentActiveList,
  onAddItem,
  onViewAllCategories,
}) => {
  const { t, language, getCategoryName } = useLanguage();

  // Added items micro-feedback tracker: canonicalName -> boolean
  const [addedItemsMap, setAddedItemsMap] = useState<Record<string, boolean>>({});
  const [addingItemId, setAddingItemId] = useState<string | null>(null);

  // Selected category for filtering essentials
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Ranked popular essentials: personalized from actual user lists, or curated staples (up to 12 items)
  const { items: rankedEssentials, hasPersonalized } = useMemo(() => {
    return getRankedPopularEssentials(lists, 12);
  }, [lists]);

  // Available categories in the essentials pool
  const availableCategories = useMemo(() => {
    const cats = Array.from(new Set(rankedEssentials.map((i) => i.category)));
    return ['all', ...cats];
  }, [rankedEssentials]);

  // Filtered list
  const filteredEssentials = useMemo(() => {
    if (selectedCategory === 'all') return rankedEssentials;
    return rankedEssentials.filter((i) => i.category === selectedCategory);
  }, [rankedEssentials, selectedCategory]);

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

  const getLocalizedName = (item: EssentialDisplayItem) => {
    if (language === 'ur' && item.nameUrdu) return item.nameUrdu;
    if (language === 'roman-urdu' && item.nameRomanUrdu) return item.nameRomanUrdu;
    return item.displayName;
  };

  const getLocalizedSubtitle = (item: EssentialDisplayItem) => {
    if (language === 'ur') {
      return {
        primarySub: item.displayName,
        secondarySub: item.nameRomanUrdu,
      };
    }
    return {
      primarySub: item.nameUrdu,
      secondarySub: item.nameRomanUrdu,
    };
  };

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'vegetables':
        return {
          aura: 'from-emerald-500/12 via-green-500/5 to-transparent',
          border: 'group-hover:border-emerald-500/40',
          badge: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20',
        };
      case 'dairy':
        return {
          aura: 'from-sky-500/12 via-blue-500/5 to-transparent',
          border: 'group-hover:border-sky-500/40',
          badge: 'bg-sky-500/10 text-sky-800 dark:text-sky-300 border-sky-500/20',
        };
      case 'poultry':
      case 'meat':
        return {
          aura: 'from-rose-500/12 via-amber-500/5 to-transparent',
          border: 'group-hover:border-rose-500/40',
          badge: 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/20',
        };
      case 'fruits':
        return {
          aura: 'from-amber-500/12 via-orange-500/5 to-transparent',
          border: 'group-hover:border-amber-500/40',
          badge: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20',
        };
      case 'cooking_essentials':
      case 'rice':
      case 'spices':
        return {
          aura: 'from-yellow-500/12 via-amber-500/5 to-transparent',
          border: 'group-hover:border-yellow-500/40',
          badge: 'bg-yellow-500/10 text-yellow-900 dark:text-yellow-200 border-yellow-500/25',
        };
      case 'bakery':
        return {
          aura: 'from-orange-500/12 via-stone-500/5 to-transparent',
          border: 'group-hover:border-orange-500/40',
          badge: 'bg-orange-500/10 text-orange-800 dark:text-orange-300 border-orange-500/20',
        };
      default:
        return {
          aura: 'from-primary/10 via-surface-container/20 to-transparent',
          border: 'group-hover:border-primary/40',
          badge: 'bg-primary/10 text-primary dark:text-primary-fixed border-primary/20',
        };
    }
  };

  return (
    <section
      id="home_essentials_section"
      aria-label={t('home.essentials.title') || t('home.popularEssentials') || 'Frequent Essentials'}
      className="flex flex-col gap-2.5 sm:gap-3.5 select-none"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <h3 className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-bold text-on-surface">
            {hasPersonalized
              ? t('home.essentials.personalizedTitle') || 'Frequently Bought'
              : t('home.essentials.title') || 'Frequent Essentials'}
          </h3>
          {hasPersonalized && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
              <Sparkles className="w-3 h-3 text-primary stroke-[2]" />
              <span>For You</span>
            </span>
          )}
        </div>

        <button
          type="button"
          id="essentials_view_all_btn"
          onClick={onViewAllCategories}
          className="text-xs sm:text-sm font-semibold text-primary hover:underline cursor-pointer"
        >
          {t('home.essentials.viewAll') || t('home.viewAll') || 'View All'}
        </button>
      </div>

      {/* Target Active List notification chip */}
      {mostRecentActiveList && (
        <div className="text-[11px] text-primary bg-primary/5 border border-primary/20 rounded-xl px-3 py-1.5 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            <span className="text-outline truncate">
              Adding directly to:{' '}
              <strong className="text-primary font-bold">{mostRecentActiveList.title}</strong>
            </span>
          </div>
          <span className="text-[10px] text-outline shrink-0 font-medium bg-primary/10 px-2 py-0.5 rounded-md">
            {t('home.itemsCount', { count: (mostRecentActiveList.items || []).length })}
          </span>
        </div>
      )}

      {/* Category filter pills */}
      {availableCategories.length > 2 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {availableCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const label =
              cat === 'all'
                ? 'All'
                : getCategoryName(cat as CategoryId);

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-surface-dim/75 shadow-2xs'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Responsive Grid: 2 columns on mobile, 3 on small tablet, 4 on tablet, 6 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
        {filteredEssentials.map((item) => {
          const isAdded = !!addedItemsMap[item.canonicalName];
          const isAdding = addingItemId === item.canonicalName;
          const displayName = getLocalizedName(item);
          const subtitle = getLocalizedSubtitle(item);
          const activeStatus = getItemStatusInActiveList(item.canonicalName, mostRecentActiveList);
          const theme = getCategoryTheme(item.category);

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
              className={`rounded-2xl sm:rounded-3xl bg-surface-container-lowest dark:bg-surface-container-low border border-surface-dim/75 shadow-[0_2px_10px_rgba(15,61,46,0.05)] hover:shadow-[0_8px_24px_rgba(15,61,46,0.12)] hover:-translate-y-1 transition-all duration-200 p-2.5 sm:p-3 flex flex-col justify-between gap-2 group cursor-pointer relative overflow-hidden ${theme.border}`}
            >
              {/* 1. Dedicated Illustration Showcase Stage */}
              <div
                className={`relative w-full h-24 sm:h-28 rounded-xl sm:rounded-2xl bg-gradient-to-b ${theme.aura} flex items-center justify-center overflow-hidden border border-black/[0.04] dark:border-white/[0.05] transition-all`}
              >
                {/* Category chip on top left */}
                <div className="absolute top-1.5 left-1.5 z-10">
                  <span
                    className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-2xs ${theme.badge}`}
                  >
                    {getCategoryName(item.category as CategoryId)}
                  </span>
                </div>

                {/* In List indicator / staple badge on top right */}
                <div className="absolute top-1.5 right-1.5 z-10">
                  {activeStatus.inList ? (
                    <span className="px-2 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-bold bg-emerald-600 text-white shadow-2xs flex items-center gap-1">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                      <span>{t('home.essentials.inList')}</span>
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold text-outline-variant bg-white/70 dark:bg-black/40 backdrop-blur-xs border border-black/5 dark:border-white/10">
                      Staple
                    </span>
                  )}
                </div>

                {/* Centered Large Vector Illustration with hover scale */}
                <div className="transform group-hover:scale-110 transition-transform duration-300 drop-shadow-xs">
                  <EssentialItemVisual
                    canonicalName={item.canonicalName}
                    displayName={displayName}
                    categoryId={item.category}
                    size={54}
                  />
                </div>
              </div>

              {/* 2. Item Details & Pakistani Bilingual Subtitle */}
              <div className="flex flex-col min-w-0 mt-0.5 px-0.5">
                <span className="font-['Plus_Jakarta_Sans'] text-sm sm:text-[15px] font-bold text-on-surface truncate leading-tight group-hover:text-primary transition-colors">
                  {displayName}
                </span>

                {/* Urdu Nastaliq & Roman Urdu subtitle */}
                <div className="flex items-center gap-1.5 text-xs text-outline font-medium mt-0.5 truncate">
                  {subtitle.primarySub && (
                    <span className="font-urdu text-[12px] sm:text-[13px] text-primary/85 font-bold leading-none shrink-0">
                      {subtitle.primarySub}
                    </span>
                  )}
                  {subtitle.primarySub && subtitle.secondarySub && (
                    <span className="text-outline/40">·</span>
                  )}
                  {subtitle.secondarySub && (
                    <span className="text-[11px] truncate">{subtitle.secondarySub}</span>
                  )}
                </div>

                {/* Packaging Quantity indicator */}
                <span className="inline-flex items-center text-[10.5px] font-semibold text-on-surface-variant font-['Manrope'] bg-surface-container/70 border border-surface-dim/60 px-2 py-0.5 rounded-md w-fit mt-1.5">
                  {item.quantity} {item.unit}
                </span>
              </div>

              {/* 3. Action Button (Add / Added / Add More) */}
              <button
                type="button"
                disabled={isAdding}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddClick(item);
                }}
                aria-label={`Add ${displayName} ${item.quantity} ${item.unit} to shopping list`}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition-all duration-200 active:scale-95 cursor-pointer select-none shadow-2xs hover:shadow-xs mt-1 ${
                  isAdded
                    ? 'bg-emerald-600 text-white shadow-xs scale-[1.02]'
                    : activeStatus.inList
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-100'
                    : 'bg-primary hover:bg-primary-hover text-on-primary'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3] animate-in zoom-in duration-200" />
                    <span className="truncate">
                      {t('home.essentials.added') || t('recommendations.addedToList') || 'Added'}
                    </span>
                  </>
                ) : activeStatus.inList ? (
                  <>
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span className="truncate">Add More</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span className="truncate">
                      {t('home.essentials.add') || t('recommendations.addToList') || 'Add'}
                    </span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
