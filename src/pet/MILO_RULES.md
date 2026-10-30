# MILO DESIGN LAWS & ARCHITECTURE (LOCKED — v6)

Milo is YAAD's interactive companion pet: a golden-yellow, always-circular, fully-furred creature.
Lightweight, pre-rendered bundled WebP images with 100% offline bundling, zero runtime network requests,
procedural WebAudio acoustic feedback, smooth animated emotion transitions, interactive gaze,
action reactions, dedicated "Meet Milo" intro, and visible per-tick micro-reaction satisfaction choreography.
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
  - "Meet Milo" Intro: 160px.
  - Celebration overlay: 240px.

---

## MILO-03: Animated Emotion Transitions (v4/v5 Engine)
Expression switches feel like a smooth, lively animated video moment rather than a static crossfade (~350ms total):
- **Outgoing Image (0–120ms)**:
  - Quick squash: `scaleY 1 → 0.82`, `scaleX 1 → 1.08` over 120ms with `ease-in` while fading to opacity 0.
- **Mid-Transition Blink Flash (100–200ms)**:
  - Flashes `blink.webp` for ~100ms bridging the squash and the pop.
- **Incoming Image (120–350ms)**:
  - Springy pop-in: `scale 0.88 → 1.06 → 1.0` with a subtle wiggle (`rotate -5° → 5° → 0°`) over 230ms.
  - Easing: `cubic-bezier(0.34, 1.56, 0.64, 1)` for organic spring overshoot.

---

## MILO-04: Per-Expression Idle Motion Engine
In addition to the base 4s breathing wobble (`scale 1 → 1.03 → 1`, `rotate -2° → 2°`), distinct emotional states feature unique additive physics:
- **laughing**: Continuous gentle shake — `rotate(-4° → 4°)` loop (0.6s).
- **excited**: Small bounce — `translateY(0 → -6% → 0)` loop (0.8s).
- **sleepy**: Slow deep breathing — `scale(1 → 1.05 → 1)` loop (6s).
- **sad**: Slow side sway — `rotate(-3° → 3°)` loop (3s).
- **hurrah**: One celebratory jump — `translateY(0 → -12% → 0)` with spring curve each time hurrah becomes active.
- **all other expressions**: Base 4s breathing wobble only.

---

## MILO-05: Real App Action Reactions (v5 System)
Milo actively reacts with dedicated expressions and WebAudio sounds to key actions across the app:
1. **New list created (success)** (`list_created`):
   - Expression: `hurrah` (+ celebration jump).
   - Sound: `hurrah` fanfare.
   - Wired in: `App.tsx` list creation flows.
2. **Item added / marked purchased** (`item_purchased`):
   - Expression: `happy`.
   - Sound: `happy` 3-note ascending arpeggio.
   - Wired in: `ShoppingListView.tsx` (completion check & add item) and `AddItemsView.tsx` (add item).
3. **Settings saved** (`settings_saved`):
   - Expression: `proud`.
   - Sound: `proud` warm harmonic two-note chord.
   - Wired in: `SettingsView.tsx` (profile save, avatar, language, theme, push, sound, and companion toggles).
4. **Tap elsewhere in app** (`tap_elsewhere`):
   - Expression: `curious` (only if currently `idle`; never interrupts active `hurrah`, `laughing`, or celebrations).
   - Sound: Soft `curious` quizzical blip (throttled to max 1 per 800ms).
   - Wired in: `MiloHost.tsx` global pointer listener.
5. **Onboarding / signup completed** (`onboarding_complete`):
   - Expression: `happy`.
   - Triggers: "Meet Milo" intro modal (if not seen yet).
   - Wired in: `App.tsx` onboarding and profile setup completion.

---

## MILO-06: Interactive Gaze & The No-Auto-Move Hard Rule (v5)
- **Gaze Directional Lean**:
  - When the user taps anywhere on screen (outside the Milo bubble), Milo calculates the unit vector toward the tap point.
  - Applies a temporary CSS transform on an inner wrapper: translates up to 6px toward the tap and rotates up to 6° in the tap direction.
  - Eased out over ~600ms via `cubic-bezier(0.25, 1, 0.5, 1)`, smoothly returning to rest.
  - Fires one blink (`blink.webp` flash for ~150ms) simultaneously with the lean.
- **HARD RULE (NON-NEGOTIABLE)**:
  - **Milo never changes its resting position on its own.**
  - No wandering, no auto-follow, no screen drift.
  - Only the user's manual drag moves Milo.
  - The gaze lean is strictly a temporary visual tilt on a wrapper div; stored `localStorage` position (`milo-bubble-pos`) is NEVER modified during gaze.

---

## MILO-07: "Meet Milo" Onboarding Intro (v5)
- **Component**: `src/pet/MiloIntro.tsx`.
- **Trigger**: Shown when `onboarding_complete` fires AND `localStorage.getItem('milo-intro-seen') !== '1'`.
- **Design**:
  - Centered modal dialog matching YAAD design language.
  - Milo at 160px with `happy` expression, normal blinking, and gentle 4s breathing (calm and authentic).
  - Heading: `"Hi, I'm Milo!"`.
  - Subtext: `"Your little shopping buddy. I'll cheer you on."`.
  - Action button: `"Let's go"`.
- **Lifecycle**: Dismissing sets `milo-intro-seen = '1'`. Never shows again.
- **Z-Order**: Positioned above app content (`z-[48]`), underneath the celebration overlay (`z-50`).
- **Accessibility**: Respects `prefers-reduced-motion` (instant static presentation, no pop keyframes).

---

## MILO-08: WebAudio Sound Synthesis & Idle Signature (v5 Audit)
- Lazy, safe `AudioContext` initializing strictly after the first user gesture (`hasUserGestured` guard). No startup warnings.
- **Distinct Recipes per Emotion**:
  - `happy`: 523 -> 659 -> 784 rising arpeggio (C5-E5-G5).
  - `laughing`: 700->920->700 dual-bump triangle giggle.
  - `sad`: 392 -> 330 -> 294 descending step (G4-E4-D4).
  - `alas`: 300 -> 175 long continuous pitch glide down (sigh).
  - `hurrah`: 523 -> 659 -> 784 -> 1047 fanfare with octave leap.
  - `excited`: 659->880 and 880->1174 rapid double-chirp flutter.
  - `listening`: 880Hz resonant pure bell ping.
  - `sleepy`: 330 -> 262 slow warm descend.
  - `proud`: 392Hz + 523Hz simultaneous harmonic major chord.
  - `curious`: 480 -> 720 soft quizzical upward slide.
  - `idle` (signature blip): Ultra-soft short low settling blip (~220Hz -> 180Hz, gain 0.035, 0.07s). Played **only** when transitioning INTO idle from another emotion. Never looped or spammed.
- Respects user sound preference and settings toggle.

---

## MILO-09: Always Alive, Even When Idle / Battery-Friendly Lifecycle
- Milo stays alive continuously while the app is open (blinking every 2.5–5s, per-expression motions, 10s return-to-idle). No "sleep" or "away" state exists.
- **Battery Optimization**:
  - When `document.hidden` (tab backgrounded), idle blink loops and return-to-idle countdowns are paused.
  - Resumed automatically on `visibilitychange`. This is the only pause permitted.
- **Offline Reliability**: 100% offline. Zero network requests, zero fetch calls. Works identically in airplane mode.

---

## MILO-10: Placement & Drag Bounds
- **Floating Mini Bubble**:
  - Size: 64px, draggable anywhere on screen with 1:1 instantaneous pointer tracking.
  - Bounds: Clamped to layout viewport (`document.documentElement.clientWidth/clientHeight`) and above the bottom nav bar.
  - Persistence: Position saved in `localStorage` under `milo-bubble-pos`.
- **Celebration Overlay**:
  - Triggered on `list_completed` with 240px `hurrah` Milo, fanfare sound, and celebration message. Auto-dismisses after 2.5s or on tap.

---

## MILO-11: Personality & Tone of Voice
- **Soft, caring friend**: Always supportive, cheerful, and calm.
- **Simple, warm words**: Communicates with gentle visual and acoustic cues.
- **Zero Guilt**: Never scolds, never shames, never guilt-trips the user for forgotten items or abandoned lists — only gently reminds.

---

## MILO-12: Tick Satisfaction Upgrade & Micro-Reactions (v6)
- **Visible Micro-Reaction Hop on `item_purchased`**:
  - Milo hops vertically: `translateY(0 -> -8% -> 0)` over 400ms (`cubic-bezier(0.25, 1, 0.5, 1)`).
  - Fires an intentional eyelid blink (`blink.webp` flash) + cheerful short chirp sound (`playMiloSound('excited')`).
  - Completely visible even if Milo already idles at `happy`.
  - **Streak Throttle**: Capped to maximum 1 hop per 600ms during fast multi-tick streaks (the per-tick sound still plays).
  - **No-Auto-Move Hard Rule Preserved**: The hop occurs strictly within an inner visual layer; Milo's resting coordinates (`milo-bubble-pos`) never change.
- **List-Complete Milestone Spectacle**:
  - Full-screen celebration overlay upgraded with a 50-particle radial celebratory confetti burst.
  - Multi-tone rising acoustic chime (`playCompletionSound()`, 400–600ms) with coordinated haptic pulse `[40, 50, 70]`.
  - Synced to Milo's 240px `hurrah` celebratory jump. Spectacle is reserved for list-complete.
- **Decoupled from Lottie**:
  - Checkbox SVG draw, scale pop, ripple, and confetti execute independently in SVG/CSS/Motion, completely unblocked by Lottie.
  - Untick triggers a softer, downward-pitched reverse blip (`playItemUncheckSound()`).
