import { useState, useEffect, useCallback, useMemo } from 'react';
import { ShoppingItem } from '../../types';
import { RecommendationCandidate } from './types';
import { recommendationService } from './service';
import { detectListContext, DetectedContext } from './context';
import { isCandidateInList } from './filter';

interface UseRecommendationsOptions {
  listTitle?: string;
  contextId?: string;
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

  // Detect context from title, active items, and selected context category
  const detectedContext: DetectedContext = useMemo(() => {
    return detectListContext(options?.listTitle, options?.currentListItems || [], options?.contextId);
  }, [options?.listTitle, options?.currentListItems, options?.contextId]);

  // Compute recommendations based on current items and context
  const rawRecommendations = useMemo(() => {
    return recommendationService.getRecommendations({
      listTitle: options?.listTitle,
      contextId: options?.contextId,
      currentListItems: options?.currentListItems,
      limit: (options?.limit || 8) + dismissedInSession.size,
      forcePersonalOnly: options?.forcePersonalOnly,
      includeAlreadyAdded: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    options?.listTitle,
    options?.contextId,
    options?.currentListItems,
    options?.limit,
    options?.forcePersonalOnly,
    version,
  ]);

  // Filter out any items dismissed during the active session
  const validCandidates = useMemo(() => {
    return rawRecommendations.filter(
      (rec) => !dismissedInSession.has(rec.canonicalName.toLowerCase())
    );
  }, [rawRecommendations, dismissedInSession]);

  // Active suggestions: strictly items NOT yet added to the current list
  const recommendations = useMemo(() => {
    const currentItems = options?.currentListItems || [];
    return validCandidates
      .filter((rec) => !rec.isAlreadyAdded && !isCandidateInList(rec, currentItems))
      .slice(0, options?.limit || 6);
  }, [validCandidates, options?.currentListItems, options?.limit]);

  // Items already added: for subtle disabled state if useful
  const alreadyAddedRecommendations = useMemo(() => {
    return validCandidates.filter((rec) => rec.isAlreadyAdded);
  }, [validCandidates]);

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
    alreadyAddedRecommendations,
    detectedContext,
    hasPersonalHistory,
    acceptRecommendation: accept,
    dismissRecommendation: dismiss,
    refresh,
  };
}
