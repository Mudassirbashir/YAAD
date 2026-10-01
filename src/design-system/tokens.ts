/**
 * YAAD Global UX Design System - Centralized Design Tokens
 * 
 * Defines the single source of truth for colors, typography, spacing,
 * elevation, radii, motion, and interaction rules across the entire application.
 */

export const colors = {
  // Brand identity
  brand: {
    deepGreen: '#003527',
    primary: '#0F3D2E',
    primaryContainer: '#14523e',
    onPrimary: '#ffffff',
    yellow: '#FCBC1F',
    yellowLight: '#ffdea3',
    yellowDark: '#7a5900',
    cream: '#FDF6E3',
  },
  // Semantic palette
  semantic: {
    background: 'var(--color-background, #f7faf5)',
    surface: 'var(--color-surface, #f7faf5)',
    surfaceLowest: 'var(--color-surface-container-lowest, #ffffff)',
    surfaceLow: 'var(--color-surface-container-low, #f1f4f0)',
    surfaceContainer: 'var(--color-surface-container, #ecefea)',
    surfaceHigh: 'var(--color-surface-container-high, #e6e9e4)',
    surfaceHighest: 'var(--color-surface-container-highest, #e0e3df)',
    
    // Text tokens
    textPrimary: 'var(--color-on-surface, #191c1a)',
    textSecondary: 'var(--color-on-surface-variant, #404944)',
    textMuted: 'var(--color-outline, #717974)',
    textInverse: 'var(--color-inverse-on-surface, #eff2ed)',
    
    // Borders & dividers
    borderSubtle: 'var(--color-surface-dim, #d8dbd6)',
    borderMedium: 'var(--color-outline-variant, #c0c8c3)',
    borderStrong: 'var(--color-outline, #717974)',
    
    // Status
    success: '#16a34a',
    successContainer: '#dcfce7',
    onSuccess: '#ffffff',
    warning: '#d97706',
    warningContainer: '#fef3c7',
    onError: '#ffffff',
    error: 'var(--color-error, #ba1a1a)',
    errorContainer: 'var(--color-error-container, #ffdad6)',
    info: '#2563eb',
    infoContainer: '#dbeafe',
  },
} as const;

export const spacing = {
  '2xs': '2px',
  xs: '4px',
  sm: '8px',
  md: '12px',
  base: '16px',
  lg: '20px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '40px',
  '4xl': '48px',
  '5xl': '64px',
} as const;

export const radius = {
  none: '0px',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
} as const;

/**
 * Calculates nested inner radius so outer and inner curves remain concentric
 * Formula: r_inner = max(0, r_outer - padding)
 */
export function getNestedRadius(outerRadiusPx: number, paddingPx: number): number {
  return Math.max(0, outerRadiusPx - paddingPx);
}

export const typography = {
  fontFamily: {
    sans: 'var(--font-sans, "Plus Jakarta Sans", "Manrope", sans-serif)',
    display: 'var(--font-display, "Plus Jakarta Sans", "Manrope", sans-serif)',
    body: 'var(--font-body, "Manrope", "Plus Jakarta Sans", sans-serif)',
    urdu: 'var(--font-urdu, "Noto Nastaliq Urdu", "Noto Sans Arabic", sans-serif)',
  },
  scale: {
    // Large Screen / Page Hero Titles
    display: 'text-2xl sm:text-3xl font-extrabold tracking-tight',
    // Screen Main Headings (e.g. "Create List", "Settings")
    h1: 'text-xl sm:text-2xl font-bold tracking-tight',
    // Card & Section Headings
    h2: 'text-lg sm:text-xl font-bold tracking-tight',
    // Subsection Headings / Item Titles
    h3: 'text-base sm:text-lg font-semibold tracking-tight',
    // Primary Body Text
    body: 'text-sm sm:text-base font-normal leading-relaxed',
    // Compact Secondary Text
    bodySmall: 'text-xs sm:text-sm font-normal leading-normal',
    // Captions & Microcopy
    caption: 'text-[11px] sm:text-xs font-medium',
    // Action / Button Text
    button: 'text-sm font-semibold tracking-wide',
    // Form Input Text
    input: 'text-sm sm:text-base font-normal',
  },
} as const;

export const elevation = {
  // Flat subtle card
  flat: 'shadow-none border border-surface-dim/60',
  // Standard card elevation
  card: 'shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] border border-surface-dim/60',
  // Hover elevation for interactive cards
  cardHover: 'hover:shadow-[0_6px_16px_rgba(15,61,46,0.08)] hover:border-primary/25 transition-all duration-200',
  // Modals, dropdowns, and floating bottom sheets
  popover: 'shadow-[0_10px_30px_rgba(15,61,46,0.12)] border border-surface-dim/80',
  // Floating action modals & dialogs
  modal: 'shadow-[0_20px_50px_rgba(15,61,46,0.20)] border border-white/10',
} as const;

export const motionTokens = {
  fast: '150ms cubic-bezier(0.16, 1, 0.3, 1)',
  normal: '250ms cubic-bezier(0.16, 1, 0.3, 1)',
  slow: '350ms cubic-bezier(0.16, 1, 0.3, 1)',
  spring: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
  },
  pressScale: 'active:scale-[0.98] transition-transform duration-100',
  cardPressScale: 'active:scale-[0.99] transition-transform duration-150',
} as const;

export const accessibility = {
  // Mobile minimum touch target is 44px
  minTouchTarget: 'min-h-[44px] min-w-[44px]',
  // Visible accessible focus ring
  focusRing: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
} as const;
