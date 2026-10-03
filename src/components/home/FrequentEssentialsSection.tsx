import React, { useState, useMemo } from 'react';
import { Sparkles, Plus, Check, ShoppingBag } from 'lucide-react';
import { ShoppingList, CategoryId } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import {
  getRankedPopularEssentials,
  getItemStatusInActiveList,
  EssentialDisplayItem,
} from '../../lib/recommendations/popularEssentials';
import { PAKISTANI_GROCERY_ITEMS } from '../../data/pakistaniGroceryData';
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
  const { t, getCategoryName } = useLanguage();

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

  /**
   * Resolves the accurate Urdu name for an essential staple
   */
  const getUrduName = (item: EssentialDisplayItem): string => {
    if (item.nameUrdu) return item.nameUrdu;
    const canonicalNorm = (item.canonicalName || '').toLowerCase().trim();
    const displayNorm = (item.displayName || '').toLowerCase().trim();
    const match = PAKISTANI_GROCERY_ITEMS.find(
      (g) =>
        g.canonicalName.toLowerCase() === canonicalNorm ||
        g.id.toLowerCase() === canonicalNorm ||
        g.aliases.some(
          (a) => a.toLowerCase() === canonicalNorm || a.toLowerCase() === displayNorm
        )
    );
    return match?.nameUrdu || '';
  };

  /**
   * Resolves accurate, vibrant, hyper-realistic emojis for household staples
   */
  const getEssentialEmoji = (item: EssentialDisplayItem): string => {
    const norm = (item.canonicalName || item.displayName || '').toLowerCase().trim();

    if (norm.includes('milk') || norm.includes('doodh')) return '🥛';
    if (norm.includes('egg') || norm.includes('anda')) return '🥚';
    if (norm.includes('sugar') || norm.includes('cheeni')) return '🍬';
    if (norm.includes('potato') || norm.includes('aloo')) return '🥔';
    if (norm.includes('tomato') || norm.includes('tamatar')) return '🍅';
    if (norm.includes('rice') || norm.includes('chawal')) return '🍚';
    if (norm.includes('onion') || norm.includes('pyaz')) return '🧅';
    if (norm.includes('oil') || norm.includes('ghee') || norm.includes('tel')) return '🛢️';
    if (norm.includes('bread') || norm.includes('roti') || norm.includes('double')) return '🍞';
    if (norm.includes('tea') || norm.includes('chai') || norm.includes('patti')) return '☕';
    if (norm.includes('chicken') || norm.includes('murgh')) return '🍗';
    if (norm.includes('meat') || norm.includes('beef') || norm.includes('mutton') || norm.includes('gosht')) return '🥩';
    if (norm.includes('garlic') || norm.includes('lehsan')) return '🧄';
    if (norm.includes('ginger') || norm.includes('adrak')) return '🫚';
    if (norm.includes('salt') || norm.includes('namak')) return '🧂';
    if (norm.includes('daal') || norm.includes('lentil') || norm.includes('pulse')) return '🍲';
    if (norm.includes('yogurt') || norm.includes('dahi')) return '🥣';
    if (norm.includes('butter') || norm.includes('makhan')) return '🧈';
    if (norm.includes('cheese') || norm.includes('paneer')) return '🧀';
    if (norm.includes('apple') || norm.includes('saib')) return '🍎';
    if (norm.includes('banana') || norm.includes('kela')) return '🍌';
    if (norm.includes('orange') || norm.includes('malta') || norm.includes('kinnu')) return '🍊';
    if (norm.includes('lemon') || norm.includes('limo') || norm.includes('leemo')) return '🍋';
    if (norm.includes('chili') || norm.includes('mirch')) return '🌶️';
    if (norm.includes('coriander') || norm.includes('dhaniya') || norm.includes('mint') || norm.includes('podina')) return '🌿';
    if (norm.includes('soap') || norm.includes('sabun')) return '🧼';
    if (norm.includes('shampoo')) return '🧴';
    if (norm.includes('detergent') || norm.includes('surf')) return '🫧';
    if (norm.includes('flour') || norm.includes('atta') || norm.includes('maida')) return '🌾';
    if (norm.includes('fish') || norm.includes('machli')) return '🐟';
    if (norm.includes('biscuit') || norm.includes('cookie')) return '🍪';
    if (norm.includes('juice') || norm.includes('drink')) return '🧃';
    if (norm.includes('water') || norm.includes('pani')) return '💧';
    if (norm.includes('tissue')) return '🧻';

    switch (item.category) {
      case 'dairy': return '🥛';
      case 'poultry': return '🍗';
      case 'meat': return '🥩';
      case 'vegetables': return '🥬';
      case 'fruits': return '🍎';
      case 'bakery': return '🍞';
      case 'beverages': return '☕';
      case 'spices': return '🌶️';
      case 'household': return '🧼';
      case 'personal_care': return '🧴';
      case 'cooking_essentials': return '🧂';
      default: return '🛍️';
    }
  };

  return (
    <section
      id="home_essentials_section"
      aria-label={t('home.essentials.title') || t('home.popularEssentials') || 'Frequent Essentials'}
      className="flex flex-col gap-2 sm:gap-2.5 select-none"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <h3 className="font-['Plus_Jakarta_Sans'] text-xl sm:text-2xl font-black text-on-surface tracking-tight">
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
          const urduName = getUrduName(item);
          const activeStatus = getItemStatusInActiveList(item.canonicalName, mostRecentActiveList);

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
              className="rounded-2xl sm:rounded-3xl bg-surface-container-lowest dark:bg-surface-container-low border border-surface-dim/75 shadow-[0_2px_8px_rgba(15,61,46,0.04)] hover:shadow-[0_8px_20px_rgba(15,61,46,0.1)] hover:-translate-y-0.5 transition-all duration-200 p-2.5 sm:p-3 flex flex-col justify-between gap-2 group cursor-pointer relative overflow-hidden"
            >
              {/* 1. Hyper-realistic, accurate staple emoji showcase stage */}
              <div className="relative w-full h-22 sm:h-24 rounded-2xl bg-gradient-to-b from-surface-container/60 via-surface-container-low/40 to-surface-container-lowest/80 dark:from-stone-800 dark:via-stone-850 dark:to-stone-900 border border-surface-dim/60 flex items-center justify-center overflow-hidden group-hover:border-primary/30 transition-all">
                <span className="text-4xl sm:text-[46px] select-none filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)] group-hover:scale-115 transition-transform duration-300">
                  {getEssentialEmoji(item)}
                </span>

                {/* Top Right Corner: Packaging Quantity Badge (e.g. "1 kg", "1 dozen") */}
                <div className="absolute top-1.5 right-1.5 z-10 pointer-events-none">
                  <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-[10.5px] font-bold bg-black/70 backdrop-blur-md text-white border border-white/20 shadow-xs font-['Manrope'] tracking-tight">
                    {item.quantity} {item.unit}
                  </span>
                </div>

                {/* Top Left Corner: In-List Status Badge if already present in active list */}
                {activeStatus.inList && (
                  <div className="absolute top-1.5 left-1.5 z-10 pointer-events-none">
                    <span className="px-2 py-0.5 rounded-md text-[9px] sm:text-[9.5px] font-bold bg-emerald-600/90 backdrop-blur-md text-white border border-white/20 shadow-xs flex items-center gap-1">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                      <span>{t('home.essentials.inList')}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Item Details: English Name | Urdu Name on a single clean line */}
              <div className="flex items-center gap-1.5 min-w-0 px-0.5 pt-0.5">
                <span className="font-['Plus_Jakarta_Sans'] text-sm sm:text-[15px] font-bold text-on-surface truncate leading-tight group-hover:text-primary transition-colors">
                  {item.displayName}
                </span>
                {urduName && (
                  <>
                    <span
                      className="text-outline/40 text-xs font-light select-none shrink-0"
                      aria-hidden="true"
                    >
                      |
                    </span>
                    <span
                      className="font-urdu text-[13px] sm:text-[14px] font-bold text-primary shrink-0 leading-none"
                      dir="rtl"
                    >
                      {urduName}
                    </span>
                  </>
                )}
              </div>

              {/* 3. Action Button (Add / Added / Add More) */}
              <button
                type="button"
                disabled={isAdding}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddClick(item);
                }}
                aria-label={`Add ${item.displayName} ${item.quantity} ${item.unit} to shopping list`}
                className={`w-full py-1.5 sm:py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition-all duration-200 active:scale-95 cursor-pointer select-none shadow-2xs hover:shadow-xs mt-0.5 ${
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
                    <span className="truncate">
                      {t('home.essentials.addMore') || 'Add More'}
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
