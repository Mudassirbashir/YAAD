# MILO DESIGN LAWS & ARCHITECTURE (LOCKED — v4)

Milo is YAAD's interactive companion pet: a golden-yellow, always-circular, fully-furred creature.
Lightweight, pre-rendered bundled WebP images with 100% offline bundling, zero runtime network requests,
procedural WebAudio acoustic feedback, and smooth animated emotion transitions.
Modeled after the approved "Soft Pro" reference: a touchable, soft, premium pom-pom plush ball.

---

## MILO-01: Bundled Assets & Zero Runtime Network
- **Pre-rendered WebP images**: Milo uses 12 bundled WebP images in `public/milo/` (transparent backgrounds, ~512px source):
  - `idle.webp`, `happy.webp`, `laughing.webp`, `sad.webp`, `alas.webp`, `hurrah.webp`, `excited.webp`, `listening.webp`, `sleepy.webp`, `proud.webp`, `curious.webp`, and `blink.webp`.
- **Zero runtime network calls**: All assets are served locally by Vite and cached by the PWA service worker for full offline functionality.
- **Zero new npm dependencies**: Implemented using React 19 standard `<img>` elements, CSS keyframes, and WebAudio API.

---

## MILO-02: Geometry & Visual Identity
- **Always circular**: Milo's silhouette remains an exact circle matching the approved reference.
- **Look**: Soft golden-yellow pom-pom plush ball with warm, deep brown expressive eyes, subtle eyelid hooding, dual white highlights, and a sweet curved smile.
- **Rendering Layer (`MiloImage.tsx`)**:
  - Mini floating bubble: 64px.
  - Celebration overlay: 240px.

---

## MILO-03: Animated Emotion Transitions (v4 Engine)
Expression switches feel like a smooth, lively animated video moment rather than a static crossfade (~350ms total):
- **Outgoing Image (0–120ms)**:
  - Quick squash: `scaleY 1 → 0.82`, `scaleX 1 → 1.08` over 120ms with `ease-in` while fading to opacity 0.
- **Mid-Transition Blink Flash (100–200ms)**:
  - Flashes `blink.webp` for ~100ms bridging the squash and the pop.
- **Incoming Image (120–350ms)**:
  - Springy pop-in: `scale 0.88 → 1.06 → 1.0` with a subtle wiggle (`rotate -5° → 5° → 0°`) over 230ms.
  - Easing: `cubic-bezier(0.34, 1.56, 0.64, 1)` for organic spring overshoot.

---

## MILO-04: Per-Expression Idle Motion Engine (v4 Additive System)
In addition to the base 4s breathing wobble (`scale 1 → 1.03 → 1`, `rotate -2° → 2°`), distinct emotional states feature unique additive physics:
- **laughing**: Continuous gentle shake — `rotate(-4° → 4°)` loop (0.6s).
- **excited**: Small bounce — `translateY(0 → -6% → 0)` loop (0.8s).
- **sleepy**: Slow deep breathing — `scale(1 → 1.05 → 1)` loop (6s).
- **sad**: Slow side sway — `rotate(-3° → 3°)` loop (3s).
- **hurrah**: One celebratory jump — `translateY(0 → -12% → 0)` with spring curve each time hurrah becomes active.
- **all other expressions**: Base 4s breathing wobble only.

---

## MILO-05: Eyelids & Blink Engine
- **Eyelids & Blink**:
  - Dedicated `blink.webp` eyelid frame.
  - Idle blink interval: Every 2.5s – 5.0s, briefly swapping to `blink.webp` for ~150ms, then back.
  - Mid-transition blink: Automatically triggered during every expression change.

---

## MILO-06: WebAudio Sound Synthesis
- Lazy, safe `AudioContext` initializing strictly after the first user gesture (`pointerdown`, `keydown`, `touchstart`).
- Silent in `idle` state.
- Pure WebAudio synthesizers (sine / triangle waves, exponential and linear ramps, zero audio files).
- Respects user sound preference and settings toggle.

---

## MILO-07: Accessibility & Calm Mode
- `prefers-reduced-motion`:
  - Disables ALL motion (breathing, shake, bounce, pop, squash, wiggle).
  - Instant expression swap with calm blinking only (`animation: none !important`).
- Throttled/paused when off-screen or page is hidden.

---

## MILO-08: Placement & Lifecycle (Floating Bubble + Celebration Overlay)
- **Floating Mini Bubble**:
  - Rendered at app root level (`MiloHost` with `variant="mini"`).
  - Floats above all screens; size ~64px.
  - 1:1 instantaneous drag tracking with mouse and touch without transition lag.
  - Clamped so it never covers the bottom navigation bar or clips at layout viewport edges (`document.documentElement.clientWidth/clientHeight`).
  - Position saved in `localStorage` under key `milo-bubble-pos` and restored on reload.
- **Celebration Overlay (List Complete)**:
  - Full-screen celebration overlay triggered on `list_completed`.
  - Large celebration Milo (`variant="celebration"`, 240px) with `hurrah.webp` and sound fanfare.
  - Auto-dismisses after ~2.5 seconds or on tap.

---

## MILO-09: Personality & Tone of Voice
- **Soft, caring friend**: Always supportive, cheerful, and calm.
- **Simple, warm words**: Communicates with gentle visual and acoustic cues.
- **Zero Guilt**: Never scolds, never shames, never guilt-trips the user for forgotten items or abandoned lists — only gently reminds.
