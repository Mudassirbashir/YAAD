import React from 'react';

/**
 * Badge (Notion: "Badges" doc).
 *
 * A compact marker that supports its parent element, never competes with it.
 *
 * Types:
 * - dot      — presence/change with no number (online, new activity)
 * - numeric  — a count (3 unread)
 * - text     — a label/category (New, Beta, Sale)
 * - icon     — a symbol (verified, warning)
 * - combined — text + icon/number
 *
 * Anatomy: container (circle/pill/rounded rect) + content + position.
 * Placement: anchored to the TOP-RIGHT / trailing edge of the host
 * (icon corner, avatar edge, tab/nav item, list item/card).
 */

export type BadgeTone = 'default' | 'success' | 'warning' | 'error' | 'info';

const TONE_CLASSES: Record<BadgeTone, string> = {
  default: 'bg-surface-container-highest text-on-surface',
  success: 'bg-primary text-on-primary',
  warning: 'bg-amber-500 text-white',
  error: 'bg-error text-on-error',
  info: 'bg-secondary-container text-on-secondary-container',
};

const DOT_TONE_CLASSES: Record<BadgeTone, string> = {
  default: 'bg-outline',
  success: 'bg-primary',
  warning: 'bg-amber-500',
  error: 'bg-error',
  info: 'bg-secondary-container',
};

export const Badge: React.FC<{
  /** Numeric count — renders "99+" above 99. */
  count?: number;
  /** Short label — "New", "Beta", "Sale". */
  text?: string;
  /** Optional icon element (lucide, w-3 h-3). */
  icon?: React.ReactNode;
  tone?: BadgeTone;
  /** Small dot with no content. */
  dot?: boolean;
  /** Pulse animation for "new activity" dots. */
  pulse?: boolean;
  className?: string;
}> = ({ count, text, icon, tone = 'error', dot = false, pulse = false, className = '' }) => {
  if (dot) {
    return (
      <span
        aria-hidden="true"
        className={`inline-block w-2.5 h-2.5 rounded-full border-2 border-white ${DOT_TONE_CLASSES[tone]} ${pulse ? 'animate-pulse' : ''} ${className}`}
      />
    );
  }
  const shown = count !== undefined ? (count > 99 ? '99+' : String(count)) : text;
  if (shown === undefined && !icon) return null;
  return (
    <span
      className={`inline-flex items-center justify-center gap-0.5 min-w-[18px] h-[18px] px-1.5 rounded-full text-[11px] leading-none font-bold font-body shadow-sm ${TONE_CLASSES[tone]} ${className}`}
    >
      {icon}
      {shown}
    </span>
  );
};

/**
 * Anchors a badge to the top-right corner of its parent.
 * Wrap the host element; the badge floats at the trailing edge.
 */
export const BadgeAnchor: React.FC<{
  children: React.ReactNode;
  badge: React.ReactNode;
  className?: string;
}> = ({ children, badge, className = '' }) => (
  <span className={`relative inline-flex ${className}`}>
    {children}
    <span className="absolute -top-1 -right-1 rtl:-right-auto rtl:-left-1 z-10 flex">{badge}</span>
  </span>
);
