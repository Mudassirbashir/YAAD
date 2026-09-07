import { useState, useEffect, useCallback, useMemo } from 'react';
import { ShoppingItem } from '../../types';
import { RecommendationCandidate } from './types';
import { recommendationService } from './service';
import { detectListContext, DetectedContext } from './context';

interface UseRecommendationsOptions {
  listTitle?: string;
  currentListItems?: ShoppingItem[];
  limit?: number;
  forcePersonalOnly?: boolean;
}

export function useRecommendations(options?: UseRecommendationsOptions) {
  const [version, setVersion] = useState<number>(0);
  const [dismissedInSession, setDismissedInSession] = useState<Set<string>>(new Set());

  // Subscribe to service updates
  useEffect(() => {
    const unsubscribe = recommendationService.subscribe(() => {
      setVersion((v) => v + 1);
    });
    return unsubscribe;
  }, []);

  // Detect context from title and active items
  const detectedContext: DetectedContext = useMemo(() => {
    return detectListContext(options?.listTitle, options?.currentListItems || []);
  }, [options?.listTitle, options?.currentListItems]);

  // Compute recommendations based on current items and context
  const rawRecommendations = useMemo(() => {
    return recommendationService.getRecommendations({
      listTitle: options?.listTitle,
      currentListItems: options?.currentListItems,
      limit: (options?.limit || 6) + dismissedInSession.size,
      forcePersonalOnly: options?.forcePersonalOnly,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    options?.listTitle,
    options?.currentListItems,
    options?.limit,
    options?.forcePersonalOnly,
    version,
  ]);

  // Filter out any items dismissed during the active session for immediate UI responsiveness
  const recommendations = useMemo(() => {
    return rawRecommendations
      .filter((rec) => !dismissedInSession.has(rec.canonicalName.toLowerCase()))
      .slice(0, options?.limit || 6);
  }, [rawRecommendations, dismissedInSession, options?.limit]);

  const hasPersonalHistory = useMemo(() => {
    return recommendationService.hasPersonalHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const dismiss = useCallback(async (canonicalName: string) => {
    const key = canonicalName.toLowerCase();
    setDismissedInSession((prev) => new Set([...prev, key]));
    await recommendationService.dismissRecommendation(canonicalName, detectedContext.contextId);
  }, [detectedContext.contextId]);

  const accept = useCallback(async (candidate: RecommendationCandidate) => {
    await recommendationService.acceptRecommendation(candidate.canonicalName, detectedContext.contextId);
  }, [detectedContext.contextId]);

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  return {
    recommendations,
    detectedContext,
    hasPersonalHistory,
    acceptRecommendation: accept,
    dismissRecommendation: dismiss,
    refresh,
  };
}
