import React, { useState, useMemo } from 'react';
import { X, Search, Plus, Check, Grid, Tag } from 'lucide-react';
import { CategoryId, CATEGORIES_LIST } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { CategoryIcon } from './CategoryIcon';
import { EssentialProductVisual } from './EssentialProductVisual';
import { INITIAL_MASTER_CATALOG } from '../lib/catalog/items';
import { RecommendationCandidate } from '../lib/recommendations';

interface CategoryBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: RecommendationCandidate) => void;
  activeListTitle?: string;
}

export const CategoryBrowserModal: React.FC<CategoryBrowserModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
  activeListTitle,
}) => {
  const { t, language, getCategoryName } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedItemNames, setAddedItemNames] = useState<Set<string>>(new Set());

  // Filter items based on category and search query (Hooks must always run unconditionally)
  const filteredItems = useMemo(() => {
    if (!isOpen) return [];
    let result = INITIAL_MASTER_CATALOG.slice(0, 150); // limit for fast snappy performance

    if (selectedCategory !== 'all') {
      result = result.filter((item) => item.category_id === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.english_name.toLowerCase().includes(q) ||
          item.urdu_name?.includes(q) ||
          item.roman_urdu_names?.some((r) => r.toLowerCase().includes(q)) ||
          item.canonical_name.toLowerCase().includes(q)
      );
    }

    return result;
  }, [isOpen, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const handleAdd = (item: typeof INITIAL_MASTER_CATALOG[0]) => {
    const candidate: RecommendationCandidate = {
      profile: {
        id: `cat_${item.id}`,
        userId: '',
        canonicalName: item.canonical_name,
        displayName: item.english_name,
        nameUrdu: item.urdu_name,
        nameRomanUrdu: item.roman_urdu_names?.[0] || item.english_name,
        category: item.category_id,
        emoji: item.emoji || '🛒',
        purchaseCount: 1,
        firstPurchasedAt: new Date().toISOString(),
        lastPurchasedAt: new Date().toISOString(),
        purchaseHistory: [],
        averageIntervalDays: 7,
        intervalStdDevDays: 0,
        purchaseFrequency: 'weekly',
        preferredQuantity: '1',
        preferredUnit: item.default_unit || 'piece',
        quantityFrequencies: { '1': 1 },
        unitFrequencies: { [item.default_unit || 'piece']: 1 },
        weekdayDistribution: [0, 0, 0, 0, 0, 0, 0],
        dismissalCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      canonicalName: item.canonical_name,
      displayName: item.english_name,
      nameUrdu: item.urdu_name,
      nameRomanUrdu: item.roman_urdu_names?.[0] || item.english_name,
      category: item.category_id,
      emoji: item.emoji || '🛒',
      suggestedQuantity: '1',
      suggestedUnit: item.default_unit || 'piece',
      score: 1.0,
      confidence: 1.0,
      explanation: {
        type: 'popular_starter',
        textKey: 'recommendations.reasons.frequentStaple',
      },
      isStarterCatalog: true,
      scoringFactors: {
        frequencyScore: 1,
        cycleUrgencyScore: 1,
        regularityScore: 1,
        coPurchaseScore: 0,
        weekdayScore: 0,
        dismissalPenalty: 1,
        confidence: 1,
        totalScore: 1,
      },
    };

    onAddItem(candidate);
    setAddedItemNames((prev) => new Set(prev).add(item.canonical_name));
    setTimeout(() => {
      setAddedItemNames((prev) => {
        const next = new Set(prev);
        next.delete(item.canonical_name);
        return next;
      });
    }, 1800);
  };

  const getItemDisplayName = (item: typeof INITIAL_MASTER_CATALOG[0]): string => {
    if (language === 'ur' && item.urdu_name) return item.urdu_name;
    if (language === 'roman-urdu' && item.roman_urdu_names?.[0]) return item.roman_urdu_names[0];
    return item.english_name;
  };

  // Primary categories to show in pill list
  const primaryCategories = CATEGORIES_LIST.slice(0, 16);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl sm:max-w-2xl lg:max-w-3xl bg-white rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl overflow-hidden transition-all duration-300 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-dim/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-on-surface font-['Plus_Jakarta_Sans'] leading-tight">
                {t('home.categoriesModal.title')}
              </h3>
              <p className="text-xs text-outline font-['Manrope']">
                {activeListTitle 
                  ? t('recommendations.addToListPrompt', { title: activeListTitle }) 
                  : t('home.categoriesModal.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="relative mt-3 shrink-0">
          <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('home.categoriesModal.searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface-container-lowest border border-surface-dim text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all font-['Manrope']"
          />
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto py-3 shrink-0 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#0F3D2E] text-white shadow-xs'
                : 'bg-surface-container text-outline hover:text-on-surface'
            }`}
          >
            {t('home.categoriesModal.allItems')}
          </button>
          {primaryCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#0F3D2E] text-white shadow-xs'
                  : 'bg-surface-container text-outline hover:text-on-surface'
              }`}
            >
              <CategoryIcon categoryId={cat.id} size="sm" />
              <span>{getCategoryName(cat.id)}</span>
            </button>
          ))}
        </div>

        {/* Filtered Items Grid (Responsive 1-col on mobile, 2-col on tablet, 3-col on desktop) */}
        <div className="overflow-y-auto py-2 flex-1 pr-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredItems.map((item) => {
            const isAdded = addedItemNames.has(item.canonical_name);
            const localizedName = getItemDisplayName(item);

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-lowest border border-surface-dim/60 shadow-xs hover:border-primary/25 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <EssentialProductVisual
                    canonicalName={item.canonical_name}
                    displayName={localizedName}
                    categoryId={item.category_id}
                    size={42}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-on-surface font-['Plus_Jakarta_Sans'] truncate">
                      {localizedName}
                    </div>
                    <div className="text-[11px] text-outline font-['Manrope']">
                      1 {item.default_unit || 'piece'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAdd(item)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shrink-0 transition-all duration-200 active:scale-95 ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#0F3D2E] hover:bg-[#145B3A] text-white'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>{t('recommendations.addedToList')}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      <span>{t('recommendations.addToList')}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-surface-dim/40 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0F3D2E] hover:bg-[#145B3A] text-white text-sm font-semibold transition-all shadow-sm active:scale-[0.99]"
          >
            {t('home.categoriesModal.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
