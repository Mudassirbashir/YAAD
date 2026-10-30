/**
 * Milo Procedural WebAudio Sound Synthesizer
 * Zero audio files - 100% synthesized soft acoustic feedback
 */

import { MiloExpression } from './miloExpressions';

const STORAGE_SOUND_KEY = 'yaad_milo_sound';

let audioCtx: AudioContext | null = null;
let userGestureBound = false;
let hasUserGestured = false;

/**
 * Returns whether Milo sound effects are enabled in user settings.
 */
export function isMiloSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const storage = window.localStorage || localStorage;
    return storage.getItem(STORAGE_SOUND_KEY) !== 'false';
  } catch {
    return true;
  }
}

/**
 * Update sound preference
 */
export function setMiloSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    const storage = window.localStorage || localStorage;
    storage.setItem(STORAGE_SOUND_KEY, enabled ? 'true' : 'false');
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

/**
 * Ensure AudioContext is instantiated and resumed on user gesture
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!hasUserGestured) return null;

  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (AudioContextClass) {
      try {
        audioCtx = new AudioContextClass();
      } catch (err) {
        console.warn('[MiloSounds] AudioContext init error:', err);
      }
    }
  }

  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  return audioCtx;
}

/**
 * Attach global gesture listeners to awaken AudioContext on first interaction
 */
export function initAudioContextOnGesture(): void {
  if (typeof window === 'undefined' || userGestureBound) return;
  userGestureBound = true;

  const unlockAudio = () => {
    hasUserGestured = true;
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'running') {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    }
  };

  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
}

// Auto-register gesture unlocks in browser
if (typeof window !== 'undefined') {
  initAudioContextOnGesture();
}

/**
 * Plays the procedural WebAudio recipe for a given expression
 */
export function playMiloSound(expression: MiloExpression): void {
  if (!isMiloSoundEnabled()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.14, now);
  masterGain.connect(ctx.destination);

  switch (expression) {
    case 'happy': {
      // 523 -> 659 -> 784 arpeggio (sine)
      const freqs = [523, 659, 784];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        const start = now + idx * 0.08;
        const dur = idx === freqs.length - 1 ? 0.16 : 0.09;

        noteGain.gain.setValueAtTime(0.001, start);
        noteGain.gain.linearRampToValueAtTime(0.7, start + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(start);
        osc.stop(start + dur);
        osc.onended = () => {
          osc.disconnect();
          noteGain.disconnect();
        };
      });
      break;
    }

    case 'laughing': {
      // triangle 700->920, 920->700 (giggle)
      const chuckleCount = 2;
      for (let i = 0; i < chuckleCount; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';

        const start = now + i * 0.11;
        const mid = start + 0.05;
        const end = start + 0.1;

        osc.frequency.setValueAtTime(700 + i * 40, start);
        osc.frequency.linearRampToValueAtTime(920 + i * 40, mid);
        osc.frequency.linearRampToValueAtTime(700 + i * 40, end);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.8, mid);
        gain.gain.exponentialRampToValueAtTime(0.001, end);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(start);
        osc.stop(end);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
      }
      break;
    }

    case 'sad': {
      // 392 -> 330 -> 294 descending (sine)
      const notes = [
        { f: 392, d: 0.12 },
        { f: 330, d: 0.12 },
        { f: 294, d: 0.22 },
      ];
      let offset = 0;
      notes.forEach(({ f, d }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + offset);

        const start = now + offset;
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.6, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + d);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(start);
        osc.stop(start + d);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };

        offset += d * 0.85;
      });
      break;
    }

    case 'alas': {
      // 300->175 glide, 0.5s (sigh)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(175, now + 0.5);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.55, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.5);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
      break;
    }

    case 'hurrah': {
      // 523 -> 659 -> 784 -> 1047 rising fanfare
      const notes = [
        { f: 523, d: 0.07 },
        { f: 659, d: 0.07 },
        { f: 784, d: 0.08 },
        { f: 1047, d: 0.28 },
      ];
      let offset = 0;
      notes.forEach(({ f, d }, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === notes.length - 1 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(f, now + offset);

        const start = now + offset;
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.75, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + d);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(start);
        osc.stop(start + d);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };

        offset += idx === notes.length - 1 ? d : 0.07;
      });
      break;
    }

    case 'excited': {
      // Energetic double-chirp flutter (659->880 then 880->1174)
      const chirps = [
        { startF: 659, endF: 880, startT: now, dur: 0.06 },
        { startF: 880, endF: 1174, startT: now + 0.065, dur: 0.07 },
      ];
      chirps.forEach(({ startF, endF, startT, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(startF, startT);
        osc.frequency.exponentialRampToValueAtTime(endF, startT + dur);

        gain.gain.setValueAtTime(0.001, startT);
        gain.gain.linearRampToValueAtTime(0.7, startT + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, startT + dur);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(startT);
        osc.stop(startT + dur);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
      });
      break;
    }

    case 'listening': {
      // soft 880 ping
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.5, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.22);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
      break;
    }

    case 'sleepy': {
      // 330->262 slow descend
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.exponentialRampToValueAtTime(262, now + 0.45);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.45);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
      break;
    }

    case 'proud': {
      // 392 + 523 soft (two simultaneous oscillators)
      const freqs = [392, 523];
      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.45, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.32);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
      });
      break;
    }

    case 'curious': {
      // Soft quizzical upward slide (480->720, gentle gain)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.12);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.32, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.12);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
      break;
    }

    case 'idle': {
      // Ultra-soft, short low settling blip (~220Hz -> 180Hz) on return to rest
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.07);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.035, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.07);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
      break;
    }

    default:
      break;
  }
}
