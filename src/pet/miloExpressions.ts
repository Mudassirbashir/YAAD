/**
 * Milo Parametric Expression Model
 * YAAD Companion Pet - Procedural Engine
 */

export type MiloExpression =
  | 'idle'
  | 'happy'
  | 'laughing'
  | 'sad'
  | 'alas'
  | 'hurrah'
  | 'excited'
  | 'listening'
  | 'sleepy'
  | 'proud'
  | 'curious';

export interface MiloParams {
  eye: number;    // eye scale (1 = normal)
  droop: number;  // eyelid droop 0..1 (sad = 0.5)
  mouth: 'smile' | 'frown' | 'flat' | 'open' | 'o';
  mOpen: number;  // mouth openness 0..1
  bounceA: number;// bounce amplitude px
  bounceF: number;// bounce frequency Hz
  fur: number;    // fur energy 0..1
  tilt: number;   // whole-body tilt radians
}

export const MILO_EXPRESSIONS: Record<MiloExpression, MiloParams> = {
  idle:     { eye: 1.00, droop: 0.00, mouth: 'smile', mOpen: 0.25, bounceA: 2,   bounceF: 1.2, fur: 0.35, tilt: 0     },
  happy:    { eye: 1.05, droop: 0.00, mouth: 'smile', mOpen: 0.55, bounceA: 5,   bounceF: 2.4, fur: 0.65, tilt: 0     },
  laughing: { eye: 0.80, droop: 0.10, mouth: 'open',  mOpen: 0.80, bounceA: 7,   bounceF: 3.0, fur: 0.80, tilt: 0     },
  sad:      { eye: 0.62, droop: 0.50, mouth: 'frown', mOpen: 0.35, bounceA: 1.2, bounceF: 0.8, fur: 0.20, tilt: 0     },
  alas:     { eye: 0.66, droop: 0.35, mouth: 'flat',  mOpen: 0.20, bounceA: 1.5, bounceF: 1.0, fur: 0.30, tilt: 0.09  },
  hurrah:   { eye: 1.15, droop: 0.00, mouth: 'open',  mOpen: 1.00, bounceA: 11,  bounceF: 3.4, fur: 1.00, tilt: 0     },
  excited:  { eye: 1.10, droop: 0.00, mouth: 'smile', mOpen: 0.70, bounceA: 7,   bounceF: 2.8, fur: 0.80, tilt: 0     },
  listening:{ eye: 1.10, droop: 0.00, mouth: 'flat',  mOpen: 0.15, bounceA: 1.5, bounceF: 1.5, fur: 0.50, tilt: 0     },
  sleepy:   { eye: 0.40, droop: 0.70, mouth: 'flat',  mOpen: 0.15, bounceA: 1,   bounceF: 0.6, fur: 0.25, tilt: 0     },
  proud:    { eye: 1.00, droop: 0.00, mouth: 'smile', mOpen: 0.60, bounceA: 3,   bounceF: 1.6, fur: 0.50, tilt: 0     },
  curious:  { eye: 1.15, droop: 0.00, mouth: 'o',     mOpen: 0.40, bounceA: 2,   bounceF: 1.8, fur: 0.55, tilt: 0.06  },
};

export type MiloTriggerEvent =
  | 'app_open'
  | 'item_added'
  | 'list_completed'
  | 'reminder'
  | 'notification'
  | 'tap'
  | 'inactivity';

export const EVENT_EXPRESSION_MAP: Record<MiloTriggerEvent, MiloExpression> = {
  app_open: 'happy',
  item_added: 'excited',
  list_completed: 'hurrah',
  reminder: 'sad',
  notification: 'curious',
  tap: 'laughing',
  inactivity: 'idle',
};

/**
 * Fast start, smooth landing cubic easing
 */
export function easeOutCubic(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  const p = 1 - clamped;
  return 1 - p * p * p;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Smooth parameter interpolation
 * Numeric params lerp with easeOutCubic; mouth type switches instantly at start.
 */
export function interpolateMiloParams(
  from: MiloParams,
  to: MiloParams,
  progress: number
): MiloParams {
  const t = easeOutCubic(progress);
  return {
    eye: lerp(from.eye, to.eye, t),
    droop: lerp(from.droop, to.droop, t),
    mouth: to.mouth,
    mOpen: lerp(from.mOpen, to.mOpen, t),
    bounceA: lerp(from.bounceA, to.bounceA, t),
    bounceF: lerp(from.bounceF, to.bounceF, t),
    fur: lerp(from.fur, to.fur, t),
    tilt: lerp(from.tilt, to.tilt, t),
  };
}

