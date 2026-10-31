# MILO DESIGN LAWS & ARCHITECTURE (LOCKED — v7)

Milo is YAAD's interactive companion pet: a golden-yellow, always-circular, fully-furred creature.
Lightweight, pre-rendered bundled WebP images with 100% offline bundling, zero runtime network requests,
procedural WebAudio acoustic feedback, smooth animated emotion transitions, interactive gaze,
action reactions, dedicated "Meet Milo" intro, visible per-tick micro-reaction satisfaction choreography,
and gentle pending-list re-engagement reminders.
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

## MILO-03: Animated Emotion Transitions & Buttery Blink Crossfade (v7)
Expression switches feel like a smooth, lively animated video moment rather than a static crossfade (~350ms total):
- **Outgoing Image (0–120ms)**:
  - Quick squash: `scaleY 1 → 0.82`, `scaleX 1 → 1.08` over 120ms with `ease-in` while fading to opacity 0.
- **Mid-Transition Blink Flash (100–200ms)**:
  - Flashes `blink.webp` for ~100ms bridging the squash and the pop.
- **Incoming Image (120–350ms)**:
  - Springy pop-in: `scale 0.88 → 1.06 → 1.0` with a subtle wiggle (`rotate -5° → 5° → 0°`) over 230ms.
  - Easing: `cubic-bezier(0.34, 1.56, 0.64, 1)` for organic spring overshoot.
- **Buttery Blink Crossfade**:
  - `blink.webp` eyelid overlay applies an organic ~80ms opacity crossfade in and out (`transition: opacity 80ms ease-in-out`).
  - Completely eliminates harsh frame snapping for both periodic idle blinks and mid-transition blinks.
  - Under `prefers-reduced-motion`, instantly swaps (`transition: none`) without animation.

---

## MILO-04: Per-Expression Idle Motion Engine (v7)
In addition to the base 4s breathing wobble (`scale 1 → 1.03 → 1`, `rotate -2° → 2°`), distinct emotional states feature unique additive physics:
- **laughing**: Continuous softened gentle shake — `rotate(-3° → 3°)` loop (0.8s ease-in-out) — buttery and calm.
- **excited**: Small bounce — `translateY(0 → -6% → 0)` loop (0.8s).
- **sleepy**: Slow deep breathing — `scale(1 → 1.05 → 1)` loop (6s).
- **sad**: Slow side sway — `rotate(-3° → 3°)` loop (3s). Automatically returns to `idle` after 2s.
- **hurrah**: One celebratory jump — `translateY(0 → -12% → 0)` with spring curve each time hurrah becomes active.
- **all other expressions**: Base 4s breathing wobble only.

---

## MILO-05: Complete 12-Emotion Mapping (v7)
Every single one of Milo's 12 expressions maps to an authentic, verified moment in the YAAD lifecycle:

| Emotion | App Moment | Trigger / Behavior |
| :--- | :--- | :--- |
| `idle` | Resting state | Gentle 4s breathing wobble |
| `happy` | Daytime greeting / items | App open daytime (06:00–23:00); item purchased micro-reaction; onboarding complete |
| `laughing` | Direct Milo interaction | Tapping Milo bubble triggers softened giggle shake |
| `excited` | Adding content | Item added to list (`item_added`); list created (`list_created`) |
| `hurrah` | List completed | Full-screen celebration overlay + 50-particle confetti burst |
| `proud` | Milestone / settings | Settings saved (`settings_saved`); achievements |
| `curious` | Attention / focus | Tap elsewhere gaze lean (`tap_elsewhere`); push notification received |
| `alas` | Pending-list reminder | Gentle "still waiting" face when an incomplete list awaits |
| `listening` | Typing / adding items | Add-Items view opened (`add_items_opened`, user is about to type) |
| `sleepy` | Nighttime greeting | App opened at night (23:00–06:00 local time) |
| `sad` | List deleted | List deleted (`list_deleted`); empathetic soft face for 2s then back to idle |
| `blink` | Blinking overlay | Eyelid overlay with buttery 80ms opacity fade both ways |

---

## MILO-06: Interactive Gaze & The No-Auto-Move Hard Rule
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

## MILO-07: "Meet Milo" Onboarding Intro
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

## MILO-08: WebAudio Sound Synthesis & Idle Signature
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
- Milo stays alive continuously while the app is open (blinking every 2.5–5s, per-expression motions, return-to-idle timer: 2s for sad, 10s for other emotions). No "sleep" or "away" state exists.
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

## MILO-12: Tick Satisfaction Upgrade & Micro-Reactions
- **Clean Tick Choreography (No Per-Tick Confetti Burst)**:
  - Routine item ticks are clean, tactile, and fast (150–300ms total):
    1. Press down (0ms): tactile scale `0.95x` (150ms) with zero-latency audio dispatch.
    2. Checkmark draw (300ms): smooth SVG `stroke-dashoffset` / `pathLength` draw (`cubic-bezier(0.650, 0, 0.450, 1)`).
    3. Impact pop (0.3s): scale punch `[1, 0.95, 1.12, 1]` with organic spring overshoot (`cubic-bezier(0.34, 1.56, 0.64, 1)`).
    4. Shockwave ripple: subtle outer glow ring expanding around the checkbox.
    5. Rising melody (Clear's trick): consecutive ticks within 2000ms advance along the pentatonic scale with anti-fatigue micro-variations.
    6. Untick sound: softer downward-pitched blip (undo).
  - **Deliberate Design Law**: **Zero per-tick confetti particles.** Confetti on every routine tick produces visual noise and animation fatigue. The tick interaction is kept focused and satisfying.
- **List-Complete Milestone Spectacle**:
  - Full-screen celebration overlay features the 50-particle radial celebratory confetti burst.
  - Multi-tone rising acoustic chime (`playCompletionSound()`, 400–600ms) with coordinated haptic pulse `[40, 50, 70]`.
  - Synced to Milo's 240px `hurrah` celebratory jump.
- **Visible Micro-Reaction Hop on `item_purchased`**:
  - Milo hops vertically: `translateY(0 -> -8% -> 0)` over 400ms (`cubic-bezier(0.25, 1, 0.5, 1)`).
  - Fires an intentional eyelid blink (`blink.webp` flash) + cheerful short chirp sound (`playMiloSound('excited')`).
  - Streak throttle: maximum 1 hop per 600ms during fast multi-tick streaks.
  - No-auto-move hard rule preserved.

---

## MILO-13: Gentle Pending-List Reminder (v7 Law)
- **Purpose**: Drives gentle re-engagement and session duration by softly nudging users back to unfinished lists without guilt.
- **Trigger Conditions**:
  - Scheduled after a ~5s settle delay upon app mount.
  - **Age Threshold**: At least one incomplete list created more than 3 hours ago (`Date.now() - createdAt >= 3 * 3600 * 1000`).
  - **Frequency Cap**: Maximum once per calendar day (`localStorage.getItem('milo-pending-reminder-date') !== YYYY-MM-DD`).
  - **Conflict Guards**: Never triggers if celebration or onboarding intro is active (`!isCelebrationActive && !isIntroActive`) or if Milo is disabled.
  - **Priority**: Oldest pending list wins (sorted ascending by `createdAt`).
- **Visual Presentation**:
  - Milo switches to `alas` expression (gentle "still waiting" face) and synthesizes the soft `alas` downward sigh blip.
  - A small, elevated speech bubble anchors above Milo's mini bubble (or below if positioned near top screen margin).
  - Copy: `Psst… your "X" list is still waiting 🙂` (title truncated to 24 chars).
  - Includes a quick "X" dismiss button in the bubble header.
- **Interaction & Dismissal**:
  - Tapping the speech bubble OR tapping Milo's bubble navigates directly to that list in shopping mode (`onOpenList(id)`) and dismisses the reminder.
  - Tapping "X" dismisses the speech bubble immediately and returns Milo to idle.
  - Automatically dismisses after 8 seconds of inactivity.
  - Date stamp is recorded (`localStorage.setItem('milo-pending-reminder-date', today)`), guaranteeing no repetition that day.
