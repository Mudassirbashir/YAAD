import React from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { RecommendationCandidate } from '../lib/recommendations';
import { useLanguage } from '../context/LanguageContext';
import { BidiText } from '../utils/bidi';

interface RecommendationChipsBarProps {
  recommendations: RecommendationCandidate[];
  onSelectItem: (item: RecommendationCandidate) => void;
  className?: string;
  hasItemsInList?: boolean;
}

export const RecommendationChipsBar: React.FC<RecommendationChipsBarProps> = ({
  recommendations,
  onSelectItem,
  className = '',
  hasItemsInList = false,
}) => {
  const { t, language } = useLanguage();

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const getItemName = (item: RecommendationCandidate): string => {
    if (language === 'ur' && item.nameUrdu) {
      return item.nameUrdu;
    }
    if (language === 'roman-urdu' && item.nameRomanUrdu) {
      return item.nameRomanUrdu;
    }
    return item.displayName || item.canonicalName;
  };

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <div className="flex items-center gap-1.5 mb-1.5 px-0.5">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-semibold text-outline uppercase tracking-wider">
          {hasItemsInList
            ? t('recommendations.coPurchaseTitle')
            : t('recommendations.suggestedItems')}
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5">
        {recommendations.map((item) => {
          const localizedName = getItemName(item);
          const hasQty = !!item.suggestedQuantity;

          return (
            <button
              key={item.canonicalName}
              type="button"
              onClick={() => onSelectItem(item)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-surface-container-low border border-outline-variant/60 hover:border-primary hover:bg-primary/5 active:scale-95 transition-all text-on-surface whitespace-nowrap shadow-2xs"
            >
              <span className="text-sm leading-none">{item.emoji || '🛒'}</span>
              <span className="font-semibold text-primary">
                <BidiText text={localizedName} />
              </span>
              {hasQty && (
                <span className="text-[10px] text-outline bg-surface-container px-1.5 py-0.5 rounded-full">
                  {item.suggestedQuantity} {item.suggestedUnit || ''}
                </span>
              )}
              <Plus className="w-3.5 h-3.5 text-primary/70" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
