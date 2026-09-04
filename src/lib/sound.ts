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

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
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

/**
 * Plays a crisp, subtle organic micro-pop when checking or toggling an item
 */
export function playItemCheckSound(): void {
  if (!isSoundEnabled()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    
    // Fundamental tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    
    // Warm harmonic overtone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    const masterFilter = ctx.createBiquadFilter();
    masterFilter.type = 'lowpass';
    masterFilter.frequency.setValueAtTime(3200, now);

    // Warm marimba-like acoustic pop
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(830.61, now); // G#5
    osc1.frequency.exponentialRampToValueAtTime(1244.51, now + 0.035); // D#6

    gain1.gain.setValueAtTime(0.0001, now);
    gain1.gain.exponentialRampToValueAtTime(0.12, now + 0.004);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    // Subtle gentle harmonic
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1661.22, now); // Overtone
    gain2.gain.setValueAtTime(0.0001, now);
    gain2.gain.exponentialRampToValueAtTime(0.03, now + 0.003);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(masterFilter);
    gain2.connect(masterFilter);
    masterFilter.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.09);
    osc2.stop(now + 0.09);

    triggerHaptic(12);
  } catch {
    // Non-blocking
  }
}

/**
 * Plays a gentle, subtle acoustic pop when an item is added to the list
 */
export function playItemAddSound(): void {
  if (!isSoundEnabled()) return;

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

    triggerHaptic([20, 40, 30]);
  } catch (e) {
    console.debug('Audio playback note:', e);
  }
}
