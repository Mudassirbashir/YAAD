# MILO DESIGN LAWS & ARCHITECTURE (LOCKED — v3)

Milo is YAAD's interactive companion pet: a golden-yellow, always-circular, fully-furred creature.
Lightweight, pre-rendered bundled WebP images with 100% offline bundling, zero runtime network requests,
and procedural WebAudio acoustic feedback.
Modeled after the approved "Soft Pro" reference: a touchable, soft, premium pom-pom plush ball.

---

## MILO-01: Bundled Assets & Zero Runtime Network (v3 Update)
- **Pre-rendered WebP images**: Milo uses 12 bundled WebP images in `public/milo/` (transparent backgrounds, ~512px source):
  - `idle.webp`, `happy.webp`, `laughing.webp`, `sad.webp`, `alas.webp`, `hurrah.webp`, `excited.webp`, `listening.webp`, `sleepy.webp`, `proud.webp`, `curious.webp`, and `blink.webp`.
- **Zero runtime network calls**: All assets are served locally by Vite and cached by the PWA service worker for full offline functionality.
- **MILO-07 "No Assets" Rule Retired**: Officially retired by the owner on 2026-10-29 for Milo only. Pre-rendered WebP assets replace the canvas drawing layer to ensure reference-perfect fluff and facial expression fidelity at both 64px and 240px.
- **Zero new npm dependencies**: Implemented using React 19 standard `<img>` elements, CSS keyframes, and WebAudio API.

---

## MILO-02: Geometry & Pom-Pom Visual Identity
- **Always circular**: Milo's silhouette remains an exact circle matching the approved reference.
- **Look**: Soft golden-yellow pom-pom plush ball with warm, deep brown expressive eyes, subtle eyelid hooding, dual white highlights, and a sweet curved smile.
- **Rendering Layer (`MiloImage.tsx`)**:
  - Mini floating bubble: 64px.
  - Celebration overlay: 240px.
  - Two-layer crossfade on expression change (~200ms opacity transition).

---

## MILO-03: Eyelids & Blink Engine
- **Eyelids & Blink**:
  - Dedicated `blink.webp` eyelid frame.
  - Idle blink interval: Every 2.5s – 5.0s, briefly swapping to `blink.webp` for ~150ms, then back.
  - Immediate blink fired on every expression transition to convey organic aliveness.

---

## MILO-04: Idle Aliveness ("Breathing")
- **Idle Motion**: Subtle CSS keyframe breathing — slow scale 1 → 1.03 → 1 plus gentle rotation −2° → 2° on a 4-second continuous loop.
- **Performance**: Runs smoothly via GPU compositing, zero per-frame CPU canvas recalculation.

---

## MILO-05: Expression Model
Milo is driven by 11 locked emotional states mapped to bundled WebP files:
- `idle`: Calm resting state, gentle breathing, closed-lip smile.
- `happy`: Warm greeting, playful energy.
- `laughing`: Triggered on tap, giggling joyful expression.
- `sad`: Droopy, sympathetic (used for reminders/forgotten items, never guilt).
- `alas`: Sighing, gentle tilt.
- `hurrah`: Celebration, maximum joy and fanfare.
- `excited`: High energy, wide smile.
- `listening`: Alert, wide eyes.
- `sleepy`: Heavy eyelids, resting expression.
- `proud`: Confident posture.
- `curious`: Inquisitive round-eyed look.

---

## MILO-06: WebAudio Sound Synthesis
- Lazy, safe `AudioContext` initializing strictly after the first user gesture (`pointerdown`, `keydown`, `touchstart`).
- Silent in `idle` state.
- Pure WebAudio synthesizers (sine / triangle waves, exponential and linear ramps, zero audio files).
- Respects user sound preference and settings toggle.

---

## MILO-07: Accessibility & Calm Mode
- `prefers-reduced-motion`:
  - Breathing keyframe animation disabled (`animation: none !important`).
  - Calm blinking and instant expression transitions preserved.
- Loop throttled/paused when off-screen or page is hidden.

---

## MILO-08: Placement & Lifecycle (Floating Bubble + Celebration Overlay)
- **Permanent Hero Section**: REMOVED from the Home screen.
- **Floating Mini Bubble**:
  - Rendered at app root level (`MiloHost` with `variant="mini"`).
  - Floats above all screens: Home, list screens, shopping screens, history, settings.
  - Size: ~64px mini bubble. Small enough to never block content.
  - Movable: 1:1 instantaneous drag tracking with mouse and touch without transition lag.
  - Drag Bounds: Clamped so it never covers the bottom navigation bar or clips at viewport edges (`document.documentElement.clientWidth/clientHeight`).
  - Persistence: Position saved in `localStorage` under key `milo-bubble-pos` and restored on reload.
  - Touch isolation: Never intercepts scrolls or blocks taps on underlying content except on the bubble itself.
- **Celebration Overlay (List Complete)**:
  - Full-screen celebration overlay triggered on `list_completed`.
  - Large celebration Milo (`variant="celebration"`, 240px) with `hurrah.webp` and sound fanfare.
  - Auto-dismisses after ~2.5 seconds or on tap.

---

## MILO-09: Personality & Tone of Voice
- **Soft, caring friend**: Always supportive, cheerful, and calm.
- **Simple, warm words**: Communicates with gentle visual and acoustic cues.
- **Zero Guilt**: Never scolds, never shames, never guilt-trips the user for forgotten items or abandoned lists — only gently reminds.
