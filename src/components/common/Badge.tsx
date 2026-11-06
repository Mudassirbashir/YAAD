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

export type BadgeType = 'dot' | 'numeric' | 'text' | 'icon' | 'combined';
export type BadgeTone = 'default' | 'success' | 'warning' | 'error' | 'info';

const TONE_CLASSES: Record<BadgeTone, string> = {
  default: 'bg-surface-container-highest text-on-surface border border-surface-dim/60',
  success: 'bg-emerald-600 text-white border border-emerald-500/30',
  warning: 'bg-amber-500 text-white border border-amber-400/30',
  error: 'bg-error text-on-error border border-error/30',
  info: 'bg-sky-600 text-white border border-sky-500/30',
};

const DOT_TONE_CLASSES: Record<BadgeTone, string> = {
  default: 'bg-outline',
  success: 'bg-emerald-600',
  warning: 'bg-amber-500',
  error: 'bg-error',
  info: 'bg-sky-500',
};

export interface BadgeProps {
  type?: BadgeType;
  /** Numeric count — renders "99+" above 99. */
  count?: number;
  /** Short label — "New", "Beta", "Sale". */
  text?: string;
  /** Optional icon element (lucide or SVG). */
  icon?: React.ReactNode;
  tone?: BadgeTone;
  /** Small dot with no content (type="dot"). */
  dot?: boolean;
  /** Pulse animation for "new activity" dots. */
  pulse?: boolean;
  className?: string;
  ariaLabel?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  type,
  count,
  text,
  icon,
  tone = 'error',
  dot = false,
  pulse = false,
  className = '',
  ariaLabel,
}) => {
  // Resolve badge type
  const resolvedType: BadgeType =
    type ||
    (dot
      ? 'dot'
      : icon && (text || count !== undefined)
      ? 'combined'
      : icon
      ? 'icon'
      : count !== undefined
      ? 'numeric'
      : text
      ? 'text'
      : 'dot');

  // 1. Dot badge
  if (resolvedType === 'dot') {
    return (
      <span
        role="status"
        aria-label={ariaLabel || 'Status alert'}
        className={`inline-block w-2.5 h-2.5 rounded-full border-2 border-white dark:border-stone-900 ${DOT_TONE_CLASSES[tone]} ${
          pulse ? 'animate-pulse' : ''
        } ${className}`}
      />
    );
  }

  // 2. Format content for numeric, text, icon, or combined badge
  const shown = count !== undefined ? (count > 99 ? '99+' : String(count)) : text;
  if (shown === undefined && !icon) return null;

  return (
    <span
      role="status"
      aria-label={ariaLabel || (typeof shown === 'string' ? shown : undefined)}
      className={`inline-flex items-center justify-center gap-1 min-w-[18px] h-[18px] px-1.5 rounded-full text-[11px] leading-none font-bold font-body shadow-xs tabular-nums select-none ${TONE_CLASSES[tone]} ${className}`}
    >
      {icon && <span className="shrink-0 flex items-center justify-center">{icon}</span>}
      {shown && <span>{shown}</span>}
    </span>
  );
};

/**
 * Anchors a badge to the top-right / trailing edge of its parent.
 * Wrap the host element (e.g. icon or avatar); the badge floats at the corner.
 */
export const BadgeAnchor: React.FC<{
  children: React.ReactNode;
  badge: React.ReactNode;
  className?: string;
  placement?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}> = ({ children, badge, className = '', placement = 'top-right' }) => {
  if (!badge) return <>{children}</>;

  const placementClass =
    placement === 'top-right'
      ? '-top-1 -right-1 rtl:-right-auto rtl:-left-1'
      : placement === 'top-left'
      ? '-top-1 -left-1 rtl:-left-auto rtl:-right-1'
      : placement === 'bottom-right'
      ? '-bottom-1 -right-1 rtl:-right-auto rtl:-left-1'
      : '-bottom-1 -left-1 rtl:-left-auto rtl:-right-1';

  return (
    <span className={`relative inline-flex items-center justify-center ${className}`}>
      {children}
      <span className={`absolute ${placementClass} z-10 flex pointer-events-none`}>
        {badge}
      </span>
    </span>
  );
};
