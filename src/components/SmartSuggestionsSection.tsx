import React, { useState } from 'react';
import { Plus, Check, X, Sparkles, Flame, ShoppingCart, Coffee, HeartPulse, Home, Cake, Info, Search, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { ShoppingItem, CategoryId } from '../types';
import { useRecommendations, RecommendationCandidate, isCandidateInList } from '../lib/recommendations';
import { useLanguage } from '../context/LanguageContext';
import { useAppTheme } from '../context/ThemeContext';
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
  const { theme, currentThemeConfig } = useAppTheme();
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
  const [showExplanationModal, setShowExplanationModal] = useState<RecommendationCandidate | null>(null);

  // User requirement: suggestions MUST NOT show automatically on load
  // User must click the search circle / button on the rectangular field to analyze & suggest
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const {
    recommendations,
    detectedContext,
    acceptRecommendation,
    dismissRecommendation,
  } = useRecommendations({
    listTitle,
    currentListItems: currentItems,
    limit: 8,
  });

  // Strictly exclude any candidate already present in the active list
  const activeSuggestions = (recommendations || []).filter(
    (candidate) =>
      !isCandidateInList(candidate, currentItems) &&
      !addedMap[candidate.canonicalName.toLowerCase()]
  );

  const circleBg = theme === 'default' ? '#000000' : currentThemeConfig?.primary || '#000000';

  const handleAnalyzeClick = () => {
    if (isAnalyzing) return;
    triggerHaptic(12);
    setIsAnalyzing(true);

    // Simulate smart recommendation analysis on the list context & habits
    setTimeout(() => {
      setIsAnalyzing(false);
      setIsExpanded(true);
      triggerHaptic(15);
    }, 700);
  };

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

  // If there are no recommendations available at all, return null
  if (activeSuggestions.length === 0 && isExpanded) {
    return null;
  }

  return (
    <section
      aria-label={t('recommendations.smartSuggestionsTitle') || 'Smart Suggestions'}
      className={`flex flex-col gap-2 select-none ${className}`}
    >
      {/* 
        User Requirement:
        "ایک چیز تو یہاں پر اسمارٹ سجیشن آٹو پر نہ شو ہو، اسمارٹ سجیشن یہاں آٹو پر نہ شو ہونی چاہیے۔
        ایک بٹن ہو اسمارٹ سجیشن اینڈ اس کے آگے سرچ کا۔
        اچھا بھئی، ایک ریکٹینگولر فیلڈ، ایک ریکٹینگولر شیپ ہو، اس کی سائیڈز راؤنڈڈ ہوں، اینڈ اس کے اندر رائٹ سائیڈ پر ایک سرکل ہو، اس کے اندر ایک سرچ کا آئیکن ہو۔
        اینڈ جیسے ہی وہ سرچ کے اوپر کلک کرے تو پھر وہ جو ہے نا، اینالائز کرے، اینڈ دین وہ آئٹم سجیسٹ کرے، سجیسٹڈ آئٹم ایسے ہی الریڈی یہاں نہ شو ہونے چاہئیں۔"
      */}
      {!isExpanded ? (
        <div
          role="button"
          tabIndex={0}
          onClick={handleAnalyzeClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleAnalyzeClick();
            }
          }}
          className="w-full bg-surface-container-lowest hover:bg-surface-container-low/70 border border-surface-container-high/80 rounded-2xl sm:rounded-full px-4 py-2.5 flex items-center justify-between gap-3 shadow-2xs transition-all cursor-pointer group active:scale-[0.99]"
        >
          {/* Left Side: Sparkles Badge + Smart Suggestions Title & Subtitle */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-primary leading-tight truncate">
                {language === 'ur'
                  ? 'اسمارٹ تجاویز'
                  : language === 'roman-urdu'
                  ? 'Smart Suggestions'
                  : t('recommendations.smartSuggestionsTitle') || 'Smart Suggestions'}
              </span>
              <span className="font-['Manrope'] text-[11px] text-on-surface-variant truncate">
                {isAnalyzing
                  ? language === 'ur'
                    ? 'لسٹ کا تجزیہ ہو رہا ہے...'
                    : 'Analyzing list & habits...'
                  : language === 'ur'
                  ? 'تجاویز کے لیے سرچ پر کلک کریں'
                  : 'Click search to analyze & suggest items'}
              </span>
            </div>
          </div>

          {/* Right Side: Circular Button with Search Icon */}
          <button
            type="button"
            aria-label="Analyze list and show suggestions"
            onClick={(e) => {
              e.stopPropagation();
              handleAnalyzeClick();
            }}
            disabled={isAnalyzing}
            style={{ backgroundColor: circleBg }}
            className="w-10 h-10 rounded-full text-white flex items-center justify-center shrink-0 hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Search className="w-4 h-4 stroke-[2.5] text-white" />
            )}
          </button>
        </div>
      ) : (
        /* Expanded state: Show analyzed suggestions */
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header bar */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="flex items-center gap-1 font-['Plus_Jakarta_Sans'] text-xs font-bold text-primary tracking-tight">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {language === 'ur'
                    ? 'اسمارٹ تجاویز (تجزیہ شدہ)'
                    : t('recommendations.smartSuggestionsTitle') || 'Smart Suggestions'}
                </span>
              </span>

              {/* Context indicator if list has a recognized theme */}
              {detectedContext.contextId !== 'general' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 shadow-2xs">
                  {getContextIcon()}
                  <span>{detectedContext.name}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="text-[11px] font-['Manrope'] text-outline hover:text-primary font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <span>{language === 'ur' ? 'چھپائیں' : 'Hide'}</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Horizontal scroll container */}
          <div className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8">
            {activeSuggestions.map((candidate) => {
              const key = candidate.canonicalName.toLowerCase();
              const isAdded = !!addedMap[key];

              const displayName =
                language === 'ur' && candidate.nameUrdu
                  ? candidate.nameUrdu
                  : language === 'roman-urdu' && candidate.nameRomanUrdu
                  ? candidate.nameRomanUrdu
                  : candidate.displayName;

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
                      className="w-5 h-5 rounded-full text-outline hover:text-error hover:bg-surface-container-high flex items-center justify-center transition-colors shrink-0 cursor-pointer"
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
                      style={{
                        backgroundColor: isAdded
                          ? '#059669'
                          : theme === 'default'
                          ? '#000000'
                          : circleBg,
                      }}
                      className="flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1 transition-all active:scale-95 select-none shadow-2xs cursor-pointer hover:opacity-90"
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
                      className="w-6 h-6 rounded-lg bg-surface-container-low hover:bg-surface-container text-outline flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                    >
                      <Info className="w-3 h-3 stroke-[2]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
                className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface cursor-pointer"
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
            </div>

            <button
              type="button"
              onClick={() => {
                handleAdd(showExplanationModal);
                setShowExplanationModal(null);
              }}
              style={{ backgroundColor: circleBg }}
              className="w-full py-2.5 rounded-xl text-white font-['Manrope'] text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
            >
              {t('recommendations.addToList') || 'Add to List'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
