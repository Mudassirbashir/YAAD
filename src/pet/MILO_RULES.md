# MILO DESIGN LAWS & ARCHITECTURE (LOCKED)

Milo is YAAD's interactive companion pet: a golden-yellow, always-circular, fully-furred creature.
Procedural, lightweight, zero asset dependencies, and 100% rendered in code.
Modeled after the approved "Soft Pro" reference: a touchable, soft, premium pom-pom plush ball.

---

## MILO-01: Zero External Assets & Dependencies
- **No image files** (.png, .svg, .jpg, .webp).
- **No video files** (.mp4, .webm).
- **No audio files** (.mp3, .wav, .ogg).
- **No network calls** (Milo functions 100% offline).
- **No new npm dependencies** (uses existing React 19, standard HTML5 `<canvas>`, and WebAudio API).

---

## MILO-02: Geometry & Pom-Pom Body Structure
- **Always circular**: Base body is an exact circle.
- **Squash and Stretch**:
  - Vertical bounce offset: `yOff = |sin(t * bounceF * π)| * bounceA`
  - Vertical squash: `scaleY = 1 - 0.05 * (yOff / bounceA)`, with volume preservation `scaleX = 1 / sqrt(scaleY)`.
  - No non-circular distortion or arbitrary shape transformations.
- **Palette ("Soft Pro")**:
  - Body: Soft radial gradient `#fff4b8` (center light highlight) → `#fed762` → `#fcbc1f` (brand yellow) → `#f1a418` → `#de8c0e`. Gentle transition, no harsh dark rim.
  - Fur strands: Warm golden root `#f5af1f` to soft sunny cream tip `#fff1b4`.
  - Eyes: Deep espresso / dark chocolate `#201005` with dual white glossy catchlights.
  - Eyelid: `#f4b620` (fur-colored lid clipped to eye ellipse from top).
  - Open Mouth: `#6f240f` cavity with `#ea6661` tongue and `#422312` contour.

---

## MILO-03: Eyelids & Facial Proportions
- **Eyes**: Large, round, and warm (eye radius `~0.19` of body radius).
- **Upper Lash Hood**: Soft dark curved contour line above each eye with tapered wings.
- **Mouth**: Small, gentle, closed-lip smile centered just beneath the eyes (`y ~ 0.20 R`).
- **Blink**:
  - Realistic eyelid covering from top of eye ellipse downwards.
  - Blink loop interval: 2.5s – 5.0s (duration 0.22s).
  - Permanent droop parameter blended with transient blink progress.
  - Immediate blink fired on every expression transition.

---

## MILO-04: Parametric Expression Engine
Milo is driven solely by numeric interpolation across 11 locked presets:
- `idle`: Calm resting state, gentle sway, closed-lip smile.
- `happy`: Warm greeting, playful bounce.
- `laughing`: Triggered on tap, giggling bounce and joyful open smile.
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

## MILO-05: Fur Physics & Density
- **Strand Density**: ~156 perimeter strands for dense, touchable pom-pom fluff (retaining 60fps).
- **Strand Length**: Short pom-pom tufts (`~5-10%` of body radius), never spiky or thorny.
- **Surface Fleece**: Multi-layered micro-tufts across the body face for 3D pom-pom fleece depth.
- **Physics**:
  - Target bend: `idleSway + tiltPull + impulse`.
  - Never freezes at idle (`sin(t * 2.2 + angle * 4) * 0.28 * furEnergy`).
  - Device tilt / pointer tracking reactive pull.
  - Exponential smoothing: `bend += (target - bend) * min(1, dt * 7)`.
  - Tap impulse: Decays smoothly with time.

---

## MILO-06: Hurrah Sparkles
- Procedural 16 4-point golden star particles orbiting Milo with sinusoidal alpha pulsing.

---

## MILO-07: WebAudio Sound Synthesis
- Lazy, safe `AudioContext` initializing on first user interaction.
- Silent in `idle` state.
- Pure synthesizers (sine / triangle waves, exponential and linear ramps, zero clicks).
- Respects user sound preference and settings toggle.

---

## MILO-08: Accessibility & Calm Mode
- `prefers-reduced-motion`:
  - Bounce amplitude reduced by ×0.25.
  - Fur sway reduced by ×0.4.
  - Particle sparkles disabled.
  - Calm blinking and gentle breathing preserved.
- Loop throttled/paused when canvas is off-screen or page is hidden (`IntersectionObserver` + `visibilitychange`).

---

## MILO-09: Placement & Lifecycle (Floating Bubble + Celebration Overlay)
- **Permanent Hero Section**: REMOVED from the Home screen. Home screen remains clean and unblocked.
- **Floating Mini Bubble**:
  - Rendered at app root level (`MiloHost` with `variant="mini"`).
  - Floats above all screens: Home, list screens, shopping screens, history, settings.
  - Size: ~64px mini bubble. Small enough to never block content.
  - Movable: Draggable with pointer/touch to ANYWHERE on screen.
  - Drag Bounds: Clamped so it never covers the bottom navigation bar or leaves viewport (`maxY = winH - 64 - 88`).
  - Persistence: Position saved in `localStorage` under key `milo-bubble-pos` and restored on reload. Default: bottom-right above bottom nav.
  - Touch isolation: Never intercepts scrolls or blocks taps on underlying content except on the bubble itself.
- **Celebration Overlay (List Complete)**:
  - Full-screen celebration overlay triggered on `list_completed`.
  - Large celebration Milo (`variant="celebration"`, 240px) with `hurrah` expression, sparkles, and fanfare.
  - Auto-dismisses after ~2.5 seconds or on tap.

---

## MILO-10: Personality & Tone of Voice
- **Soft, caring friend**: Always supportive, cheerful, and calm.
- **Simple, warm words**: Communicates with gentle visual and acoustic cues.
- **Zero Guilt**: Never scolds, never shames, never guilt-trips the user for forgotten items or abandoned lists — only gently reminds.
