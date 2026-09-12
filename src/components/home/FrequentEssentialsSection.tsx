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

  return (
    <section
      id="home_essentials_section"
      aria-label={t('home.essentials.title') || t('home.popularEssentials') || 'Frequent Essentials'}
      className="flex flex-col gap-3 select-none"
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
              <span>
                {language === 'ur' ? 'آپ کی پسند' : language === 'roman-urdu' ? 'Aap ke liye' : 'For You'}
              </span>
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
        <div className="text-[11px] text-primary bg-primary/5 border border-primary/20 rounded-xl px-3 py-1.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-outline truncate">
              {language === 'ur' ? 'براہ راست شامل کریں:' : 'Adding directly to:'}{' '}
              <strong className="text-primary">{mostRecentActiveList.title}</strong>
            </span>
          </div>
          <span className="text-[10px] text-outline shrink-0 font-medium">
            {t('home.itemsCount', { count: (mostRecentActiveList.items || []).length })}
          </span>
        </div>
      )}

      {/* Category filter pills */}
      {availableCategories.length > 2 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {availableCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const label =
              cat === 'all'
                ? language === 'ur'
                  ? 'تمام'
                  : 'All'
                : getCategoryName(cat as CategoryId);

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-on-primary shadow-2xs'
                    : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-surface-dim/70 shadow-2xs'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Responsive Grid: 2 columns on mobile, 3-4 on tablet, 6 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {filteredEssentials.map((item) => {
          const isAdded = !!addedItemsMap[item.canonicalName];
          const isAdding = addingItemId === item.canonicalName;
          const displayName = getLocalizedName(item);
          const activeStatus = getItemStatusInActiveList(item.canonicalName, mostRecentActiveList);

          return (
            <div
              key={item.canonicalName}
              id={`essential_card_${item.canonicalName}`}
              className="rounded-2xl bg-surface-container-lowest border border-surface-dim/70 shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all p-3 flex flex-col justify-between gap-2.5 group"
            >
              <div className="flex items-start justify-between gap-2">
                <EssentialItemVisual
                  canonicalName={item.canonicalName}
                  displayName={displayName}
                  categoryId={item.category}
                  size={44}
                />
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] sm:text-[11px] font-semibold tracking-normal px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant max-w-[100px] truncate border border-surface-dim/60">
                    {getCategoryName(item.category)}
                  </span>
                  {activeStatus.inList && (
                    <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border border-primary/20">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                      <span>{t('home.essentials.inList')}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col min-w-0">
                <span className="font-['Plus_Jakarta_Sans'] text-sm sm:text-[15px] font-bold text-on-surface truncate leading-tight">
                  {displayName}
                </span>
                <span className="font-['Manrope'] text-xs text-outline font-medium mt-0.5 truncate">
                  {item.quantity} {item.unit}
                </span>
              </div>

              <button
                type="button"
                disabled={isAdding}
                onClick={() => handleAddClick(item)}
                aria-label={`Add ${displayName} ${item.quantity} ${item.unit} to shopping list`}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition-all duration-200 active:scale-95 cursor-pointer select-none ${
                  isAdded
                    ? 'bg-emerald-600 text-white shadow-xs scale-[1.02]'
                    : 'bg-primary hover:bg-primary-hover text-on-primary shadow-2xs hover:shadow-xs'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3] animate-in zoom-in duration-200" />
                    <span className="truncate">
                      {t('home.essentials.added') || t('recommendations.addedToList') || 'Added'}
                    </span>
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
