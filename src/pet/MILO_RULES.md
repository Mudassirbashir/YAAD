# MILO DESIGN LAWS & ARCHITECTURE (LOCKED)

Milo is YAAD's interactive companion pet: a golden-yellow, always-circular, fully-furred creature.
Procedural, lightweight, zero asset dependencies, and 100% rendered in code.

---

## 1. Zero External Assets & Dependencies
- **No image files** (.png, .svg, .jpg, .webp).
- **No video files** (.mp4, .webm).
- **No audio files** (.mp3, .wav, .ogg).
- **No network calls** (Milo functions 100% offline).
- **No new npm dependencies** (uses existing React 19, standard HTML5 `<canvas>`, and WebAudio API).

---

## 2. Geometry & Body Structure
- **Always circular**: Base body is an exact circle.
- **Squash and Stretch**:
  - Vertical bounce offset: `yOff = |sin(t * bounceF * π)| * bounceA`
  - Vertical squash: `scaleY = 1 - 0.05 * (yOff / bounceA)`
  - No non-circular distortion or arbitrary shape transformations.
- **Palette**:
  - Body: Radial gradient `#ffd968` → `#f7b91f` → `#e89b0c`.
  - Fur strands: Golden gradient `#ebb62d` → `#fa5f` / `#ffaa55`.
  - Eyes: `#3a2410` ellipses with `#ffffff` glint.
  - Eyelid: `#f2b41c` (fur-colored lid clipped to eye ellipse).
  - Open Mouth: `#7a2d12` cavity with `#3a2410` contour.

---

## 3. Parametric Expression Engine
Milo is driven solely by numeric interpolation across 11 locked presets:
- `idle`: Calm resting state, gentle sway.
- `happy`: Warm greeting, playful bounce.
- `laughing`: Triggered on tap, giggling bounce and wide open expression.
- `sad`: Droopy, sympathetic (used for reminders/forgotten items, never guilt).
- `alas`: Sighing, subtle tilt.
- `hurrah`: Celebration, maximum fur energy and orbiting star sparkles.
- `excited`: High frequency, wide smile.
- `listening`: Alert, wide eyes, minimal bounce.
- `sleepy`: Heavy eyelids, gentle slow breathing.
- `proud`: Confident posture.
- `curious`: Inquisitive tilt, round 'o' mouth.

Transitions:
- Numeric parameters smoothly lerp over 0.35s with `easeOutCubic`.
- Mouth type switches instantly at the start of transition.
- Every expression transition triggers an eyelid blink.

---

## 4. Physics & Simulation
- **Fur**: ~110 strands evenly distributed radially around the perimeter.
  - Per-strand base length: `R * (0.10 + rand * 0.09)`.
  - Target bend: `idleSway + tiltPull + impulse`.
  - Never freezes at idle (`sin(t * 2.2 + angle * 4) * 0.35 * furEnergy`).
  - Device tilt / pointer tracking reactive pull.
  - Exponential smoothing: `bend += (target - bend) * min(1, dt * 7)`.
- **Eyelids (MILO-03)**:
  - Realistic blinking covering from top of eye ellipse downwards.
  - Blink loop interval: 2.5s – 5.0s (duration 0.22s).
  - Permanent droop parameter blended with transient blink progress.
- **Sparkles (Hurrah)**:
  - Procedural 4-point stars orbiting Milo with sinusoidal alpha pulsing.

---

## 5. WebAudio Sound Synthesis
- Lazy, safe `AudioContext` initializing on first user interaction.
- Silent in `idle` state.
- Pure synthesizers (sine / triangle waves, exponential and linear ramps, zero clicks).
- Respects user sound preference and settings toggle.

---

## 6. Accessibility & Calm Mode
- `prefers-reduced-motion`:
  - Bounce amplitude reduced by ×0.25.
  - Fur sway reduced by ×0.4.
  - Particle sparkles disabled.
  - Calm blinking and gentle breathing preserved.
- Loop throttled/paused when canvas is off-screen or page is hidden (`IntersectionObserver` + `visibilitychange`).

