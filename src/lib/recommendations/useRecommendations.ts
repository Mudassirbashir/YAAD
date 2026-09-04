import { useState, useEffect, useCallback, useMemo } from 'react';
import { ShoppingItem } from '../../types';
import { RecommendationCandidate } from './types';
import { recommendationService } from './service';

interface UseRecommendationsOptions {
  currentListItems?: ShoppingItem[];
  limit?: number;
  forcePersonalOnly?: boolean;
}

export function useRecommendations(options?: UseRecommendationsOptions) {
  const [version, setVersion] = useState<number>(0);

  // Subscribe to service updates
  useEffect(() => {
    const unsubscribe = recommendationService.subscribe(() => {
      setVersion((v) => v + 1);
    });
    return unsubscribe;
  }, []);

  // Compute recommendations based on current items
  const recommendations = useMemo(() => {
    return recommendationService.getRecommendations({
      currentListItems: options?.currentListItems,
      limit: options?.limit,
      forcePersonalOnly: options?.forcePersonalOnly,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.currentListItems, options?.limit, options?.forcePersonalOnly, version]);

  const hasPersonalHistory = useMemo(() => {
    return recommendationService.hasPersonalHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const dismiss = useCallback(async (canonicalName: string) => {
    await recommendationService.dismissRecommendation(canonicalName);
  }, []);

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  return {
    recommendations,
    hasPersonalHistory,
    dismissRecommendation: dismiss,
    refresh,
  };
}
