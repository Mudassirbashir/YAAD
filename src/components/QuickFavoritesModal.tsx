import React, { useState } from 'react';
import { X, Heart, Plus, Check, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { EssentialProductVisual } from './EssentialProductVisual';
import { STARTER_POPULAR_ESSENTIALS, StarterCatalogItem } from '../lib/recommendations/starterCatalog';
import { RecommendationCandidate } from '../lib/recommendations';

interface QuickFavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: RecommendationCandidate) => void;
  activeListTitle?: string;
}

export const QuickFavoritesModal: React.FC<QuickFavoritesModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
  activeListTitle,
}) => {
  const { t, language } = useLanguage();
  const [addedItemNames, setAddedItemNames] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleAdd = (item: StarterCatalogItem) => {
    const candidate: RecommendationCandidate = {
      profile: {
        id: `fav_${item.canonicalName}`,
        userId: '',
        canonicalName: item.canonicalName,
        displayName: item.displayName,
        nameUrdu: item.nameUrdu,
        nameRomanUrdu: item.nameRomanUrdu,
        category: item.category,
        emoji: item.emoji,
        purchaseCount: 1,
        firstPurchasedAt: new Date().toISOString(),
        lastPurchasedAt: new Date().toISOString(),
        purchaseHistory: [],
        averageIntervalDays: 7,
        intervalStdDevDays: 0,
        purchaseFrequency: 'weekly',
        preferredQuantity: item.defaultQuantity,
        preferredUnit: item.defaultUnit,
        quantityFrequencies: { [item.defaultQuantity]: 1 },
        unitFrequencies: { [item.defaultUnit]: 1 },
        weekdayDistribution: [0, 0, 0, 0, 0, 0, 0],
        dismissalCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      canonicalName: item.canonicalName,
      displayName: item.displayName,
      nameUrdu: item.nameUrdu,
      nameRomanUrdu: item.nameRomanUrdu,
      category: item.category,
      emoji: item.emoji,
      suggestedQuantity: item.defaultQuantity,
      suggestedUnit: item.defaultUnit,
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
    setAddedItemNames((prev) => new Set(prev).add(item.canonicalName));
    setTimeout(() => {
      setAddedItemNames((prev) => {
        const next = new Set(prev);
        next.delete(item.canonicalName);
        return next;
      });
    }, 1800);
  };

  const getLocalizedName = (item: StarterCatalogItem): string => {
    if (language === 'ur' && item.nameUrdu) return item.nameUrdu;
    if (language === 'roman-urdu' && item.nameRomanUrdu) return item.nameRomanUrdu;
    return item.displayName;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg sm:max-w-xl md:max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl overflow-hidden transition-all duration-300 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-dim/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-on-surface font-['Plus_Jakarta_Sans'] leading-tight">
                {t('home.favoritesModal.title')}
              </h3>
              <p className="text-xs text-outline font-['Manrope']">
                {activeListTitle 
                  ? t('recommendations.addToListPrompt', { title: activeListTitle }) 
                  : t('home.favoritesModal.subtitle')}
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

        {/* Favorite Items List (Responsive 1-col on mobile, 2-col on tablet/desktop) */}
        <div className="overflow-y-auto py-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1 pr-1">
          {STARTER_POPULAR_ESSENTIALS.map((item) => {
            const isAdded = addedItemNames.has(item.canonicalName);
            const localizedName = getLocalizedName(item);

            return (
              <div
                key={item.canonicalName}
                className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-lowest border border-surface-dim/60 shadow-xs hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <EssentialProductVisual
                    canonicalName={item.canonicalName}
                    displayName={localizedName}
                    categoryId={item.category}
                    size={42}
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-on-surface font-['Plus_Jakarta_Sans'] truncate">
                      {localizedName}
                    </h4>
                    <span className="text-xs text-outline font-['Manrope']">
                      {item.defaultQuantity} {item.defaultUnit}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAdd(item)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all duration-200 active:scale-95 ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#0F3D2E] hover:bg-[#145B3A] text-white'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{t('recommendations.addedToList')}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('recommendations.addToList')}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Button */}
        <div className="pt-3 border-t border-surface-dim/40 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-[#0F3D2E] hover:bg-[#145B3A] text-white text-sm font-semibold transition-all shadow-sm active:scale-[0.99]"
          >
            {t('home.favoritesModal.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
