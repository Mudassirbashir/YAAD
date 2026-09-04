import React, { useState } from 'react';
import { Plus, Check, X, Sparkles, ShoppingBag } from 'lucide-react';
import { RecommendationCandidate } from '../lib/recommendations';
import { useLanguage } from '../context/LanguageContext';
import { BidiText } from '../utils/bidi';
import { CategoryIcon } from './CategoryIcon';

interface RecommendationsSectionProps {
  recommendations: RecommendationCandidate[];
  hasPersonalHistory: boolean;
  onAddItem: (item: RecommendationCandidate) => void;
  onDismissItem?: (canonicalName: string) => void;
  activeListTitle?: string;
  className?: string;
}

export const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  recommendations,
  hasPersonalHistory,
  onAddItem,
  onDismissItem,
  activeListTitle,
  className = '',
}) => {
  const { t, language } = useLanguage();
  const [addedItemNames, setAddedItemNames] = useState<Set<string>>(new Set());

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const handleAdd = (item: RecommendationCandidate) => {
    onAddItem(item);
    setAddedItemNames((prev) => new Set(prev).add(item.canonicalName));
    setTimeout(() => {
      setAddedItemNames((prev) => {
        const next = new Set(prev);
        next.delete(item.canonicalName);
        return next;
      });
    }, 1800);
  };

  // Get localized item name based on current language
  const getItemName = (item: RecommendationCandidate): string => {
    if (language === 'ur' && item.nameUrdu) {
      return item.nameUrdu;
    }
    if (language === 'roman-urdu' && item.nameRomanUrdu) {
      return item.nameRomanUrdu;
    }
    return item.displayName || item.canonicalName;
  };

  // Format explanation reason
  const getExplanationText = (item: RecommendationCandidate): string => {
    const exp = item.explanation;
    if (!exp) return '';

    if (exp.type === 'co_purchase' && exp.params?.item) {
      return t('recommendations.reasons.copurchase', { item: String(exp.params.item) });
    }
    if (exp.type === 'recent_repeat' && exp.params?.count) {
      return t('recommendations.reasons.frequent', { count: String(exp.params.count) });
    }
    if (exp.type === 'frequency_cycle') {
      if (exp.textKey.includes('weekly')) return t('recommendations.reasons.weekly');
      if (exp.textKey.includes('biweekly')) return t('recommendations.reasons.biweekly');
      if (exp.textKey.includes('monthly')) return t('recommendations.reasons.monthly');
    }
    if (exp.type === 'due_date') {
      return t('recommendations.reasons.dueSoon');
    }
    if (exp.type === 'popular_starter') {
      return t('recommendations.reasons.starter');
    }
    return t(exp.textKey) || '';
  };

  const isColdStart = !hasPersonalHistory && recommendations.every((r) => r.isStarterCatalog);

  return (
    <section className={`w-full ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-on-surface leading-tight font-['Plus_Jakarta_Sans']">
              {isColdStart
                ? t('recommendations.coldStartTitle')
                : t('recommendations.title')}
            </h2>
            <p className="text-xs text-outline leading-none mt-0.5 font-['Manrope']">
              {isColdStart
                ? t('recommendations.coldStartSubtitle')
                : t('recommendations.subtitle')}
            </p>
          </div>
        </div>

        {activeListTitle && (
          <span className="text-[11px] font-medium text-primary/80 bg-primary/5 px-2.5 py-1 rounded-full border border-primary/15 flex items-center gap-1">
            <ShoppingBag className="w-3 h-3" />
            <span className="truncate max-w-[110px]">{activeListTitle}</span>
          </span>
        )}
      </div>

      {/* Recommendations Cards Grid / Carousel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {recommendations.map((item) => {
          const isAdded = addedItemNames.has(item.canonicalName);
          const localizedName = getItemName(item);
          const explanation = getExplanationText(item);
          const hasQuantity = !!item.suggestedQuantity;

          return (
            <div
              key={item.canonicalName}
              className="relative group bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3 flex flex-col justify-between hover:border-primary/40 hover:shadow-[0px_4px_16px_rgba(0,30,21,0.06)] transition-all duration-200"
            >
              {/* Dismiss button */}
              {onDismissItem && !item.isStarterCatalog && (
                <button
                  type="button"
                  onClick={() => onDismissItem(item.canonicalName)}
                  title={t('recommendations.dismiss')}
                  aria-label={t('recommendations.dismiss')}
                  className="absolute top-2 end-2 text-outline/40 hover:text-outline hover:bg-surface-container-high rounded-full w-5 h-5 flex items-center justify-center transition-colors opacity-70 group-hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              {/* Item Info */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xl leading-none select-none">
                    {item.emoji || <CategoryIcon categoryId={item.category} className="w-4 h-4 text-primary" />}
                  </span>
                  {hasQuantity && (
                    <span className="text-[11px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      {item.suggestedQuantity} {item.suggestedUnit || ''}
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-sm text-on-surface leading-snug line-clamp-1">
                  <BidiText text={localizedName} />
                </h3>

                {explanation && (
                  <p className="text-[11px] text-outline line-clamp-1 mt-0.5">
                    {explanation}
                  </p>
                )}
              </div>

              {/* Add Action Button */}
              <div className="mt-3 pt-2 border-t border-outline-variant/40 flex items-center justify-between">
                <span className="text-[10px] text-outline font-medium uppercase tracking-wider">
                  {item.isStarterCatalog ? t('recommendations.reasons.starter') : 'Suggested'}
                </span>

                <button
                  type="button"
                  onClick={() => handleAdd(item)}
                  disabled={isAdded}
                  className={`flex items-center justify-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all duration-200 ${
                    isAdded
                      ? 'bg-secondary text-on-secondary cursor-default'
                      : 'bg-primary text-on-primary hover:bg-primary/90 active:scale-95 shadow-sm'
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
            </div>
          );
        })}
      </div>
    </section>
  );
};
