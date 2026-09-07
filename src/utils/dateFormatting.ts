/**
 * YAAD Date & Time Formatting Utilities
 * Provides consistent, localized, and resilient formatting for shopping sessions and items.
 */

export function parseDateSafe(input?: string | number | Date | null): Date | null {
  if (!input) return null;
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }
  if (typeof input === 'number') {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof input === 'string') {
    // If it's already a numeric timestamp string
    if (/^\d{10,13}$/.test(input.trim())) {
      const d = new Date(Number(input.trim()));
      if (!isNaN(d.getTime())) return d;
    }
    // Attempt standard ISO or date string parse
    const parsed = new Date(input);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

/**
 * Format an exact date (e.g., "Sep 6, 2026" or "Sunday, Sep 6, 2026")
 */
export function formatExactDate(
  input?: string | number | Date | null,
  options: { includeWeekday?: boolean; fallback?: string } = {}
): string {
  const { includeWeekday = false, fallback = 'Recent' } = options;
  const date = parseDateSafe(input);
  if (!date) {
    if (typeof input === 'string' && input.trim() && !input.includes('T')) {
      return input.trim();
    }
    return fallback;
  }

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const timeStr = formatExactTime(date);

  if (isToday) {
    return includeWeekday ? `Today (${timeStr})` : 'Today';
  }
  if (isYesterday) {
    return includeWeekday ? `Yesterday (${timeStr})` : 'Yesterday';
  }

  const formatOptions: Intl.DateTimeFormatOptions = includeWeekday
    ? { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
    : { month: 'short', day: 'numeric', year: 'numeric' };

  try {
    return new Intl.DateTimeFormat('en-US', formatOptions).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

/**
 * Format an exact time (e.g., "10:30 AM")
 */
export function formatExactTime(input?: string | number | Date | null): string {
  const date = parseDateSafe(input);
  if (!date) return '';

  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

/**
 * Returns formatted session date and time
 */
export function formatSessionDateTime(
  createdInput?: string | number | Date | null,
  completedInput?: string | number | Date | null
): {
  date: string;
  time: string;
  completionTime: string | null;
  fullDate: string;
} {
  const createdDate = parseDateSafe(createdInput);
  const completedDate = parseDateSafe(completedInput);

  const date = formatExactDate(createdDate || createdInput, { includeWeekday: false });
  const fullDate = createdDate
    ? new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(createdDate)
    : formatExactDate(createdInput);

  const time = createdDate ? formatExactTime(createdDate) : '';
  const completionTime = completedDate ? formatExactTime(completedDate) : null;

  return {
    date,
    time,
    completionTime,
    fullDate,
  };
}

/**
 * Extract time from item creation timestamp
 */
export function formatItemCreatedTime(createdInput?: string | number | Date | null): string | null {
  const date = parseDateSafe(createdInput);
  if (!date) return null;
  return formatExactTime(date);
}
