/**
 * YAAD Completion Experience Configuration
 * 
 * Centralized configuration architecture that defines all animation timings,
 * motion spring physics, sound synchronization offsets, and visual sequence parameters.
 * 
 * Designed so that a reference completion video (such as the official YAAD 3D logo
 * animation) can easily be referenced to tune timing, delays, spring curves, and styling.
 */

export interface CompletionTimingConfig {
  /** Delay in seconds before the hero badge scale-in begins */
  heroBadgeDelay: number;
  /** Duration of the hero badge entrance (seconds) */
  heroBadgeDuration: number;
  /** Spring physics for the central badge */
  badgeSpring: {
    stiffness: number;
    damping: number;
    mass: number;
  };
  /** Delay in seconds before the checkmark icon draws/scales in */
  checkMarkDelay: number;
  /** Spring physics for the checkmark */
  checkSpring: {
    stiffness: number;
    damping: number;
  };
  /** Delay in milliseconds before playing the completion chime sound */
  soundDelayMs: number;
  /** Delay in milliseconds for haptic feedback pulse */
  hapticDelayMs: number;
  /** Delay in seconds before metric cards fade up */
  metricsFadeDelay: number;
  /** Delay in seconds before bottom action buttons fade up */
  actionsFadeDelay: number;
  /** Total sequence duration before user interaction is fully idle (seconds) */
  totalSequenceDuration: number;
}

export interface CompletionMotionConfig {
  /** Initial scale of the hero badge */
  initialBadgeScale: number;
  /** Resting scale of the hero badge */
  restingBadgeScale: number;
  /** Halo expanding pulse scale range [min, peak, settle] */
  haloScaleRange: [number, number, number];
  /** Halo opacity range [start, peak, settle] */
  haloOpacityRange: [number, number, number];
  /** Ambient blur radius */
  ambientBlur: string;
}

export interface CompletionVisualConfig {
  /** Signature deep forest emerald color from YAAD brand video */
  brandEmeraldDeep: string;
  /** Rich brand emerald primary */
  brandEmerald: string;
  /** Signature golden-amber brand accent dot from the YAAD logo ('ن/د' dot) */
  brandAmberDot: string;
  /** Soft surface container tint */
  surfaceTint: string;
  /** Whether to render the YAAD brand typography watermark in the background */
  showBrandWatermark: boolean;
  /** Visual style: sleek, modern, minimal premium (no excessive confetti or cartoon clips) */
  style: 'minimal_premium';
}

export interface CompletionSoundConfig {
  /** Enable acoustic chime by default */
  soundEnabled: boolean;
  /** Haptic vibration pattern in ms [vibe, pause, vibe] */
  hapticPattern: number[];
}

export interface CompletionConfig {
  timing: CompletionTimingConfig;
  motion: CompletionMotionConfig;
  visual: CompletionVisualConfig;
  sound: CompletionSoundConfig;
}

export const YAAD_COMPLETION_CONFIG: CompletionConfig = {
  timing: {
    heroBadgeDelay: 0.05,
    heroBadgeDuration: 0.6,
    badgeSpring: {
      stiffness: 260,
      damping: 20,
      mass: 0.9,
    },
    checkMarkDelay: 0.22,
    checkSpring: {
      stiffness: 340,
      damping: 18,
    },
    // Synced with checkmark arrival at apex (~220ms)
    soundDelayMs: 200,
    hapticDelayMs: 210,
    metricsFadeDelay: 0.35,
    actionsFadeDelay: 0.48,
    totalSequenceDuration: 1.1,
  },
  motion: {
    initialBadgeScale: 0.55,
    restingBadgeScale: 1.0,
    haloScaleRange: [0.85, 1.28, 1.12],
    haloOpacityRange: [0, 0.45, 0.2],
    ambientBlur: 'blur-2xl',
  },
  visual: {
    brandEmeraldDeep: '#0A2E22',
    brandEmerald: '#0F3D2E',
    brandAmberDot: '#F59E0B',
    surfaceTint: '#0F3D2E0A',
    showBrandWatermark: true,
    style: 'minimal_premium',
  },
  sound: {
    soundEnabled: true,
    hapticPattern: [18, 35, 25],
  },
};
