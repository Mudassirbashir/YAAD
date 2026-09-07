import React, { useState } from 'react';
import { Plus, Check, X, Sparkles, Flame, ShoppingCart, Coffee, HeartPulse, Home, Cake, Info } from 'lucide-react';
import { ShoppingItem, CategoryId } from '../types';
import { useRecommendations, RecommendationCandidate } from '../lib/recommendations';
import { useLanguage } from '../context/LanguageContext';
import { CategoryIcon } from './CategoryIcon';
import { BidiText, MixedQuantityBadge } from '../utils/bidi';
import { playItemCheckSound, triggerHaptic } from '../lib/sound';

interface SmartSuggestionsSectionProps {
  listTitle?: string;
  currentItems: ShoppingItem[];
  onAddItem: (itemData: {
    name: string;
    canonicalName?: string;
    categoryId: CategoryId;
    quantity?: string;
    unit?: string;
    emoji?: string;
    nameUrdu?: string;
    nameRomanUrdu?: string;
  }) => void;
  className?: string;
}

export const SmartSuggestionsSection: React.FC<SmartSuggestionsSectionProps> = ({
  listTitle,
  currentItems,
  onAddItem,
  className = '',
}) => {
  const { t, language, getCategoryName } = useLanguage();
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
  const [showExplanationModal, setShowExplanationModal] = useState<RecommendationCandidate | null>(null);

  const {
    recommendations,
    detectedContext,
    acceptRecommendation,
    dismissRecommendation,
  } = useRecommendations({
    listTitle,
    currentListItems: currentItems,
    limit: 6,
  });

  // If there are no recommendations available for this context, do not clutter screen
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const handleAdd = async (candidate: RecommendationCandidate) => {
    const key = candidate.canonicalName.toLowerCase();
    if (addedMap[key]) return;

    // 1. Mark added in UI
    setAddedMap((prev) => ({ ...prev, [key]: true }));

    // 2. Play subtle feedback
    playItemCheckSound();
    triggerHaptic();

    // 3. Reinforce learning model
    await acceptRecommendation(candidate);

    // 4. Dispatch add to parent
    const displayName =
      language === 'ur' && candidate.nameUrdu
        ? candidate.nameUrdu
        : language === 'roman-urdu' && candidate.nameRomanUrdu
        ? candidate.nameRomanUrdu
        : candidate.displayName;

    onAddItem({
      name: displayName,
      canonicalName: candidate.canonicalName,
      categoryId: candidate.category,
      quantity: candidate.suggestedQuantity,
      unit: candidate.suggestedUnit,
      emoji: candidate.emoji,
      nameUrdu: candidate.nameUrdu,
      nameRomanUrdu: candidate.nameRomanUrdu,
    });

    // Reset checkmark state after 2 seconds
    setTimeout(() => {
      setAddedMap((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, 2000);
  };

  const handleDismiss = async (candidate: RecommendationCandidate) => {
    triggerHaptic();
    await dismissRecommendation(candidate.canonicalName);
  };

  // Select appropriate context badge icon
  const getContextIcon = () => {
    switch (detectedContext.contextId) {
      case 'bbq':
        return <Flame className="w-3.5 h-3.5 text-amber-600" />;
      case 'supermarket':
        return <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />;
      case 'breakfast':
        return <Coffee className="w-3.5 h-3.5 text-orange-500" />;
      case 'pharmacy':
        return <HeartPulse className="w-3.5 h-3.5 text-red-500" />;
      case 'household':
        return <Home className="w-3.5 h-3.5 text-blue-500" />;
      case 'baking':
        return <Cake className="w-3.5 h-3.5 text-pink-500" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <section
      aria-label={t('recommendations.smartSuggestionsTitle') || 'Smart Suggestions'}
      className={`flex flex-col gap-2 select-none ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="flex items-center gap-1 font-['Plus_Jakarta_Sans'] text-xs font-bold text-primary tracking-tight">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('recommendations.smartSuggestionsTitle') || 'Smart Suggestions'}</span>
          </span>

          {/* Context indicator if list has a recognized theme */}
          {detectedContext.contextId !== 'general' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 shadow-2xs">
              {getContextIcon()}
              <span>{detectedContext.name}</span>
            </span>
          )}
        </div>

        <span className="text-[10px] font-['Manrope'] text-outline font-medium">
          {t('recommendations.smartSuggestionsSubtitle') || 'Based on habits & context'}
        </span>
      </div>

      {/* Horizontal scroll container */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8">
        {recommendations.map((candidate) => {
          const key = candidate.canonicalName.toLowerCase();
          const isAdded = !!addedMap[key];

          const displayName =
            language === 'ur' && candidate.nameUrdu
              ? candidate.nameUrdu
              : language === 'roman-urdu' && candidate.nameRomanUrdu
              ? candidate.nameRomanUrdu
              : candidate.displayName;

          // Localized or fallback explanation text
          const explanationText = candidate.explanation.displayReason || 'Suggested for you';

          return (
            <div
              key={candidate.canonicalName}
              id={`smart_suggestion_${candidate.canonicalName}`}
              className="relative flex-shrink-0 w-44 sm:w-48 rounded-2xl bg-surface-container-lowest border border-surface-container-high/80 p-2.5 flex flex-col justify-between gap-2 shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all group"
            >
              {/* Top row: Category icon, reason tag, dismiss button */}
              <div className="flex items-start justify-between gap-1.5">
                <div className="w-7 h-7 rounded-xl bg-surface-container-low text-primary flex items-center justify-center text-sm shrink-0">
                  <CategoryIcon categoryId={candidate.category} className="w-3.5 h-3.5 text-primary" />
                </div>

                <span
                  title={explanationText}
                  className="flex-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50/80 px-1.5 py-0.5 rounded-md truncate text-center border border-emerald-100"
                >
                  {explanationText}
                </span>

                {/* Dismiss button */}
                <button
                  type="button"
                  onClick={() => handleDismiss(candidate)}
                  title={t('recommendations.dismiss') || 'Dismiss suggestion'}
                  aria-label={`Dismiss ${displayName} suggestion`}
                  className="w-5 h-5 rounded-full text-outline hover:text-error hover:bg-surface-container-high flex items-center justify-center transition-colors shrink-0"
                >
                  <X className="w-3 h-3 stroke-[2.5]" />
                </button>
              </div>

              {/* Middle row: Name & suggested quantity */}
              <div className="flex flex-col min-w-0">
                <BidiText className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-on-surface truncate leading-tight">
                  {displayName}
                </BidiText>

                <div className="flex items-center gap-1.5 mt-0.5">
                  {candidate.suggestedQuantity && (
                    <MixedQuantityBadge
                      quantity={candidate.suggestedQuantity}
                      unit={candidate.suggestedUnit}
                      className="text-[10px] font-semibold text-outline"
                    />
                  )}
                  <span className="text-[10px] text-outline/80 font-['Manrope'] truncate">
                    • {getCategoryName(candidate.category)}
                  </span>
                </div>
              </div>

              {/* Bottom row: Add button and Explain Info button */}
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleAdd(candidate)}
                  disabled={isAdded}
                  aria-label={`Add ${displayName} to list`}
                  className={`flex-1 py-1 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-95 select-none ${
                    isAdded
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-primary text-on-primary hover:bg-[#145B3A] shadow-2xs'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span className="truncate">{t('recommendations.addedToList') || 'Added'}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3 stroke-[3]" />
                      <span className="truncate">{t('recommendations.addToList') || 'Add'}</span>
                    </>
                  )}
                </button>

                {/* Explainability / Breakdown button */}
                <button
                  type="button"
                  onClick={() => setShowExplanationModal(candidate)}
                  title="View explainable scoring factors"
                  aria-label="View explainable score"
                  className="w-6 h-6 rounded-lg bg-surface-container-low hover:bg-surface-container text-outline flex items-center justify-center shrink-0 transition-colors"
                >
                  <Info className="w-3 h-3 stroke-[2]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Explainable Factor Breakdown Dialog */}
      {showExplanationModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowExplanationModal(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-xl border border-surface-container-high flex flex-col gap-4 text-on-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-primary">
                    {showExplanationModal.displayName}
                  </h4>
                  <span className="text-[11px] text-outline font-['Manrope']">
                    {showExplanationModal.explanation.displayReason}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowExplanationModal(null)}
                className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-['Manrope'] bg-surface-container-lowest p-3 rounded-2xl border border-surface-container-high/60">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-outline">Total Recommendation Score:</span>
                <span className="font-bold text-primary font-mono">
                  {Math.round(showExplanationModal.scoringFactors.totalScore * 100)}%
                </span>
              </div>
              <div className="h-px bg-surface-container-high my-1" />

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-outline">Purchase Interval (Replenishment):</span>
                <span className="font-semibold text-emerald-700 font-mono">
                  {Math.round(showExplanationModal.scoringFactors.intervalScore * 100)}%
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-outline">Purchase Frequency:</span>
                <span className="font-semibold text-primary font-mono">
                  {Math.round(showExplanationModal.scoringFactors.frequencyScore * 100)}%
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-outline">Recency:</span>
                <span className="font-semibold text-primary font-mono">
                  {Math.round(showExplanationModal.scoringFactors.recencyScore * 100)}%
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-outline">Context Match ({detectedContext.name}):</span>
                <span className="font-semibold text-emerald-700 font-mono">
                  {Math.round(showExplanationModal.scoringFactors.contextScore * 100)}%
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-outline">Category Affinity:</span>
                <span className="font-semibold text-primary font-mono">
                  {Math.round(showExplanationModal.scoringFactors.categoryScore * 100)}%
                </span>
              </div>

              {showExplanationModal.scoringFactors.dismissalPenalty < 1.0 && (
                <div className="flex justify-between items-center text-[11px] text-amber-700">
                  <span>Dismissal Feedback Dampener:</span>
                  <span className="font-mono">
                    {Math.round(showExplanationModal.scoringFactors.dismissalPenalty * 100)}%
                  </span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-outline font-['Manrope'] leading-relaxed">
              This score is computed deterministically from your previous purchases, shopping cycles, and list title context. It never shares your data or makes external AI API calls.
            </p>

            <button
              type="button"
              onClick={() => {
                handleAdd(showExplanationModal);
                setShowExplanationModal(null);
              }}
              className="w-full py-2 rounded-xl bg-primary text-on-primary font-['Manrope'] text-xs font-bold hover:bg-[#145B3A] transition-colors"
            >
              {t('recommendations.addToList') || 'Add to List'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
