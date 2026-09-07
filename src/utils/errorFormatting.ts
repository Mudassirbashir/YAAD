/**
 * YAAD Friendly Error Formatting Utility
 * Translates low-level runtime errors, Supabase errors, and network issues
 * into graceful, friendly user messages.
 */

export function getFriendlyErrorMessage(
  error: unknown,
  fallbackMessage: string = 'Unable to sync with the server. Please check your connection and try again.'
): string {
  if (!error) return fallbackMessage;

  const rawMsg =
    typeof error === 'string'
      ? error
      : error instanceof Error
      ? error.message
      : String(error);

  const lower = rawMsg.toLowerCase();

  // Network / Fetch errors
  if (
    lower.includes('failed to fetch') ||
    lower.includes('network') ||
    lower.includes('typeerror') ||
    lower.includes('offline') ||
    lower.includes('abort') ||
    lower.includes('connection')
  ) {
    return 'Network connection issue. Showing available cached lists.';
  }

  // Supabase / PostgREST schema errors
  if (
    lower.includes('schema') ||
    lower.includes('column') ||
    lower.includes('relation') ||
    lower.includes('permission') ||
    lower.includes('jwt')
  ) {
    return 'Could not retrieve recent lists right now. Please try again.';
  }

  // Rate limiting or service unavailable
  if (lower.includes('rate limit') || lower.includes('503') || lower.includes('500')) {
    return 'Server is temporarily busy. Please retry in a few moments.';
  }

  return fallbackMessage;
}
