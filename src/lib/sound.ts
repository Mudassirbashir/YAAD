/**
 * YAAD Sound Engine
 * Provides crisp, gentle, high-fidelity audio feedback for shopping list completion.
 * Configured with persistent user preferences (Sound ON/OFF).
 */

const SOUND_STORAGE_KEY = 'yaad_sound_enabled';

export function isSoundEnabled(): boolean {
  try {
    const val = localStorage.getItem(SOUND_STORAGE_KEY);
    return val !== 'false'; // Defaults to true
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'true' : 'false');
  } catch {
    // Ignore storage issues
  }
}

let audioCtx: AudioContext | null = null;
let hasUserGestured = false;
let userGestureBound = false;

export function markUserGestured(): void {
  hasUserGestured = true;
}

export function initSoundGestureUnlock(): void {
  if (typeof window === 'undefined' || userGestureBound) return;
  userGestureBound = true;

  const unlockAudio = () => {
    hasUserGestured = true;
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };

  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
}

if (typeof window !== 'undefined') {
  initSoundGestureUnlock();
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!hasUserGestured) return null;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioCtx && AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

// Pentatonic scale for rising consecutive tick streaks (Clear's trick)
export const PENTATONIC_SCALE = [
  523.25,  // C5 (Tick 1)
  587.33,  // D5 (Tick 2)
  659.25,  // E5 (Tick 3)
  783.99,  // G5 (Tick 4)
  880.00,  // A5 (Tick 5 - rewarding high tone)
  1046.50, // C6 (Tick 6)
  1174.66, // D6 (Tick 7)
  1318.51, // E6 (Tick 8)
];

// Anti-fatigue micro-variations (10 variations of pitch, gain, and decay)
export const TICK_VARIATIONS = [
  { pitchMult: 0.985, gainMult: 0.95, snapDur: 0.088 },
  { pitchMult: 1.000, gainMult: 1.00, snapDur: 0.092 },
  { pitchMult: 1.012, gainMult: 1.03, snapDur: 0.095 },
  { pitchMult: 0.992, gainMult: 0.98, snapDur: 0.090 },
  { pitchMult: 1.018, gainMult: 1.02, snapDur: 0.094 },
  { pitchMult: 0.978, gainMult: 0.96, snapDur: 0.086 },
  { pitchMult: 1.006, gainMult: 1.01, snapDur: 0.091 },
  { pitchMult: 1.022, gainMult: 1.04, snapDur: 0.096 },
  { pitchMult: 0.996, gainMult: 0.99, snapDur: 0.093 },
  { pitchMult: 1.015, gainMult: 1.00, snapDur: 0.089 },
];

let tickStreak = 0;
let lastTickTimestamp = 0;
let lastCheckSoundTime = 0;
let lastPlayedFrequency = 0;
let lastUntickFrequency = 0;
const STREAK_WINDOW_MS = 2000;

export function getTickStreakCount(): number {
  if (typeof window === 'undefined') return tickStreak;
  const now = Date.now();
  if (now - lastTickTimestamp > STREAK_WINDOW_MS) {
    return 0;
  }
  return tickStreak;
}

export function resetTickStreak(): void {
  tickStreak = 0;
  lastTickTimestamp = 0;
  lastPlayedFrequency = 0;
  lastUntickFrequency = 0;
}

export function getLastTickFrequency(): number {
  return lastPlayedFrequency;
}

export function getLastUntickFrequency(): number {
  return lastUntickFrequency;
}

export function getTickStreakFrequency(streak: number): number {
  const noteIndex = Math.min(Math.max(streak - 1, 0), PENTATONIC_SCALE.length - 1);
  return PENTATONIC_SCALE[noteIndex];
}

/**
 * Plays a warm, percussive acoustic pop (~100ms) with rising pentatonic streak melody
 * and 10 anti-fatigue random variations.
 */
export function playItemCheckSound(): number {
  if (!isSoundEnabled()) return 0;
  markUserGestured();

  const nowMs = Date.now();
  // Debounce duplicate sound calls for the same tick (e.g. pointerdown followed immediately by click)
  if (nowMs - lastCheckSoundTime < 45) {
    return lastPlayedFrequency;
  }
  lastCheckSoundTime = nowMs;

  if (nowMs - lastTickTimestamp > STREAK_WINDOW_MS) {
    tickStreak = 1;
  } else {
    tickStreak++;
  }
  lastTickTimestamp = nowMs;

  const noteIndex = Math.min(tickStreak - 1, PENTATONIC_SCALE.length - 1);
  const baseFreq = PENTATONIC_SCALE[noteIndex];
  const variation = TICK_VARIATIONS[Math.floor(Math.random() * TICK_VARIATIONS.length)];
  const finalFreq = baseFreq * variation.pitchMult;
  lastPlayedFrequency = finalFreq;

  const ctx = getAudioContext();
  if (!ctx) return finalFreq;

  try {
    const now = ctx.currentTime;
    const popDur = variation.snapDur;

    // Transient attack osc: quick pitch envelope down to finalFreq gives acoustic woodblock/pop snap
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    // Body/harmonic osc
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2800, now);

    // Warm organic percussive pop
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(finalFreq * 1.35, now);
    osc1.frequency.exponentialRampToValueAtTime(finalFreq, now + 0.012);

    const peakGain = 0.13 * variation.gainMult;
    gain1.gain.setValueAtTime(0.0001, now);
    gain1.gain.linearRampToValueAtTime(peakGain, now + 0.003);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + popDur);

    // Subtle snappy overtone for texture
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(finalFreq * 2.02, now);
    gain2.gain.setValueAtTime(0.0001, now);
    gain2.gain.linearRampToValueAtTime(peakGain * 0.25, now + 0.002);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + (popDur * 0.4));

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(filter);
    gain2.connect(filter);
    filter.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + popDur + 0.01);
    osc2.stop(now + popDur + 0.01);

    triggerHaptic(14);
  } catch {
    // Non-blocking
  }

  return finalFreq;
}

/**
 * Plays a softer, downward-pitched reverse blip when an item is unchecked (undo)
 */
export function playItemUncheckSound(): void {
  if (!isSoundEnabled()) return;
  markUserGestured();

  // Reset or decrement tick streak on untick
  if (tickStreak > 0) {
    tickStreak = Math.max(0, tickStreak - 1);
  }

  const ctx = getAudioContext();
  lastUntickFrequency = 320; // downward pitch ending freq
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const dur = 0.085; // 85ms

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, now);

    // Downward pitch sweep: starts at 480Hz and sweeps down to 320Hz (reverse blip)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + dur);

    // Softer volume than check
    const peakGain = 0.06;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(gain);
    gain.connect(filter);
    filter.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + dur + 0.01);

    triggerHaptic(8);
  } catch {
    // Non-blocking
  }
}

/**
 * Plays a gentle, subtle acoustic pop when an item is added to the list
 */
export function playItemAddSound(): void {
  if (!isSoundEnabled()) return;
  markUserGestured();

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.04); // A5

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);

    triggerHaptic(8);
  } catch {
    // Non-blocking
  }
}

/**
 * Triggers light haptic feedback where supported by device/browser
 */
export function triggerHaptic(duration: number | number[] = 15): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
      navigator.vibrate(duration as VibratePattern);
    }
  } catch {
    // Ignore unsupported environments
  }
}

/**
 * Plays a smooth, satisfying completion chime (Premium acoustic bell chord with warm harmonics)
 */
export function playCompletionSound(): void {
  if (!isSoundEnabled()) return;
  markUserGestured();

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Harmonious major-9th ascending chime:
    // C5 (523.25Hz), G5 (783.99Hz), D6 (1174.66Hz), G6 (1567.98Hz)
    const chord = [
      { freq: 523.25, time: 0.00, dur: 0.45, gain: 0.12 },
      { freq: 783.99, time: 0.07, dur: 0.50, gain: 0.14 },
      { freq: 1174.66, time: 0.14, dur: 0.60, gain: 0.15 },
      { freq: 1567.98, time: 0.22, dur: 0.85, gain: 0.16 },
    ];

    chord.forEach((note) => {
      // Primary bell tone
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();

      // Natural overtone for acoustic bell richness
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2800, now + note.time);

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(note.freq, now + note.time);

      osc2.type = 'sine';
      // Acoustic bell overtone ratio (~2.76x)
      osc2.frequency.setValueAtTime(note.freq * 2.756, now + note.time);

      // Primary envelope
      gain1.gain.setValueAtTime(0.0001, now + note.time);
      gain1.gain.exponentialRampToValueAtTime(note.gain, now + note.time + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.dur);

      // Shorter decay for bell sparkle overtone
      gain2.gain.setValueAtTime(0.0001, now + note.time);
      gain2.gain.exponentialRampToValueAtTime(note.gain * 0.25, now + note.time + 0.01);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + note.time + (note.dur * 0.4));

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain1);
      filter.connect(gain2);
      gain1.connect(ctx.destination);
      gain2.connect(ctx.destination);

      osc1.start(now + note.time);
      osc2.start(now + note.time);
      osc1.stop(now + note.time + note.dur + 0.05);
      osc2.stop(now + note.time + note.dur + 0.05);
    });

    triggerHaptic([30, 40, 50]);
  } catch (e) {
    console.debug('Audio playback note:', e);
  }
}
