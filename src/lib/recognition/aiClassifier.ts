import { AIClassificationResult, AIClassifierProvider } from './types';
import { CategoryId } from '../../types';
import { normalizeBaseText } from './normalizer';

const AI_CACHE_STORAGE_KEY = 'yaad_ai_classification_cache';

function getCachedClassifications(): Record<string, AIClassificationResult> {
  try {
    const raw = localStorage.getItem(AI_CACHE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCachedClassification(term: string, result: AIClassificationResult): void {
  try {
    const norm = normalizeBaseText(term);
    if (!norm) return;
    const cache = getCachedClassifications();
    cache[norm] = result;
    localStorage.setItem(AI_CACHE_STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Default AI Classifier calling the server-side `/api/categorize` endpoint.
 * Pluggable: Can be substituted with any other AI service by implementing `AIClassifierProvider`.
 */
export class ServerGeminiAIClassifier implements AIClassifierProvider {
  async classifyUnknownItem(input: string): Promise<AIClassificationResult> {
    const trimmed = input.trim();
    const normalizedKey = normalizeBaseText(trimmed);

    // 1. Check local persistent cache
    const cache = getCachedClassifications();
    if (cache[normalizedKey]) {
      return cache[normalizedKey];
    }

    // 2. Call Server API with timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch('/api/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: trimmed }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.categoryId) {
          const result: AIClassificationResult = {
            categoryId: data.categoryId as CategoryId,
            canonicalName: data.canonicalName,
            nameUrdu: data.nameUrdu,
            confidence: typeof data.confidence === 'number' ? data.confidence : 0.88,
            source: data.source || 'ai',
          };

          // Cache result
          saveCachedClassification(trimmed, result);
          return result;
        }
      }
    } catch {
      // Graceful offline/timeout fallback
    }

    return {
      categoryId: 'other',
      confidence: 0.25,
      source: 'unresolved_fallback',
    };
  }
}

// Global default AI provider instance
let activeAIClassifier: AIClassifierProvider = new ServerGeminiAIClassifier();

/**
 * Configure or swap the active AI provider.
 */
export function setAIClassifierProvider(provider: AIClassifierProvider): void {
  activeAIClassifier = provider;
}

/**
 * Core AI classification abstraction:
 * Called ONLY for unknown or low-confidence items.
 */
export async function classifyUnknownItem(input: string): Promise<AIClassificationResult> {
  return activeAIClassifier.classifyUnknownItem(input);
}
