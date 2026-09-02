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
 * Plays a crisp, subtle micro-tap sound when checking an item
 */
export function playItemCheckSound(): void {
  if (!isSoundEnabled()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now); // A5 note
    osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.04); // D6 pop

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.08, now + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  } catch {
    // Non-blocking
  }
}

/**
 * Triggers light haptic feedback where supported by device/browser
 */
export function triggerHaptic(duration = 15): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
      navigator.vibrate(duration);
    }
  } catch {
    // Ignore unsupported environments
  }
}

/**
 * Plays a smooth, satisfying completion chime (Apple/iOS-style gentle rising chord)
 */
export function playCompletionSound(): void {
  if (!isSoundEnabled()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Chime note sequence: C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz), C6 (1046.5Hz)
    const notes = [
      { freq: 523.25, time: 0.0, dur: 0.28, gain: 0.14 },
      { freq: 659.25, time: 0.08, dur: 0.32, gain: 0.16 },
      { freq: 783.99, time: 0.16, dur: 0.40, gain: 0.18 },
      { freq: 1046.5, time: 0.24, dur: 0.55, gain: 0.22 },
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Soft bell tone using sine wave
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      // Warm low-pass filter for smooth organic warmth
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, now + note.time);

      // Exponential decay envelope
      gainNode.gain.setValueAtTime(0.0001, now + note.time);
      gainNode.gain.exponentialRampToValueAtTime(note.gain, now + note.time + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.dur);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur + 0.05);
    });
  } catch (e) {
    // Non-blocking audio fallback
    console.debug('Audio playback note:', e);
  }
}
