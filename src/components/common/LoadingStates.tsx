import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Loading States (Notion: "Loading States" doc).
 *
 * Three patterns, chosen by what the wait actually needs:
 * - Skeleton — layout is already known (lists, cards, feeds), 1–10s wait.
 *   The skeleton MUST match the real layout's shape, or the jump feels broken.
 * - DelayedSpinner — someone just tapped something, small area, 2–10s wait.
 *   Appears only after `delay` ms so fast responses never flash a loader.
 * - ProgressBar — measurable work only (uploads, imports, batch jobs), 10s+.
 *   Never fake a bar; if progress can't be measured, use the spinner.
 */

// ---------------------------------------------------------------------------
// Skeleton — gray placeholder blocks that mimic the content's shape.
// ---------------------------------------------------------------------------
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div aria-hidden="true" className={`animate-pulse bg-surface-container-high rounded-lg ${className}`} />
);

/** Rows matching the add-items / list-item shape: 36px thumb + name + meta line. */
export const ListItemSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 5,
  className = '',
}) => (
  <div className={`space-y-2 ${className}`} aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl bg-surface-container-low border border-surface-dim/70"
      >
        <div className="w-9 h-9 rounded-xl bg-surface-container-high animate-pulse shrink-0" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="h-3.5 w-3/5 bg-surface-container-high rounded animate-pulse" />
          <div className="h-2.5 w-2/5 bg-surface-container-high/70 rounded animate-pulse" />
        </div>
        <div className="w-8 h-8 rounded-full bg-surface-container-high animate-pulse shrink-0" />
      </div>
    ))}
  </div>
);

/** Cards matching the Home "Popular Essentials" tile shape. */
export const TileSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 4,
  className = '',
}) => (
  <div className={`grid grid-cols-4 gap-2 ${className}`} aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-2xl bg-surface-container-low border border-surface-dim/70 p-2">
        <div className="w-10 h-10 mx-auto rounded-xl bg-surface-container-high animate-pulse" />
        <div className="h-2.5 w-4/5 mx-auto mt-2 bg-surface-container-high rounded animate-pulse" />
      </div>
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// DelayedSpinner — only appears after `delay` ms.
// Use for button taps and small areas. Never for sub-300ms waits (flicker),
// never to block a whole screen for more than a couple of seconds.
// ---------------------------------------------------------------------------
export const DelayedSpinner: React.FC<{
  delay?: number;
  className?: string;
  label?: string;
}> = ({ delay = 250, className = '', label = 'Loading' }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  if (!show) return null;
  return <Loader2 role="status" aria-label={label} className={`animate-spin ${className}`} />;
};

// ---------------------------------------------------------------------------
// ProgressBar — determinate progress for measurable work ONLY.
// value/max drive the fill; label names the job; percent is shown when known.
// ---------------------------------------------------------------------------
export const ProgressBar: React.FC<{
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  className?: string;
}> = ({ value, max = 100, label, showPercent = true, className = '' }) => {
  const pct = max > 0 ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : 0;
  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs text-on-surface-variant font-body mb-1.5">
          <span className="truncate">{label || ''}</span>
          {showPercent && <span className="shrink-0 font-bold text-primary">{pct}%</span>}
        </div>
      )}
      <div
        className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
