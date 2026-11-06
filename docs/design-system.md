# YAAD Design System

Source: the 5 Notion design documents (Loading States, UI Input Elements, Badges, Responsive Web Design, Design Systems).
Reference: `https://plum-ring-c37.notion.site/Documents-3a2681932c3480e78468e64174e33ee8`

This document maps all 5 specifications directly to their implementation in the YAAD codebase so any future addition or refactor adheres to identical principles.

---

## Document 1: Loading States — Picking the Right Pattern for the Wait

The system defines three distinct loading mechanisms. Each serves a specific temporal and cognitive purpose:

### 1. Skeleton Loaders (`src/components/common/LoadingStates.tsx`)
* **When to use**: The layout structure is known beforehand (feeds, list cards, item rows, dashboard grids); expected wait is 1–10 seconds; you want users to perceive structure rather than blank whitespace.
* **When NOT to use**: Direct feedback to user actions (submitting a form, completing a transaction); when layout geometry cannot be predicted; when the response is instantaneous (<300ms) or painfully long (>10s).
* **Core Rule**: A skeleton is a promise about layout geometry, not duration. If a skeleton renders 3 cards and 12 appear, the UI feels broken. The skeleton must mirror the exact dimensions and spatial cadence of the real content.
* **Available Components**:
  - `Skeleton`: Base atomic placeholder with pulse animation.
  - `ListItemSkeleton`: Standard shopping list row (avatar/checkbox placeholder, title, meta line).
  - `TileSkeleton`: Square grid catalog tile (catalog grid items).
  - `ListCardSkeleton`: Home screen shopping list card skeleton with exact `min-h-[116px]` card proportions, icon placeholder, title, subtitle, and chevron placeholder.
* **In-app Implementations**:
  - `HomeListsSection.tsx`: Renders 3 `ListCardSkeleton` elements while lists are loading.
  - Catalog and item browser screens.

### 2. Spinners & Delayed Loading (`DelayedSpinner`)
* **When to use**: Action feedback immediately after a button tap; localized status in small areas (inside a button, chip, badge, or card); unknown duration between 2–10 seconds.
* **When NOT to use**: Sub-300ms operations (causes jarring visual flash/flicker); long-running operations (>10s); full-screen blocking modals.
* **The 250ms Delay Pattern**: `DelayedSpinner` delays rendering its spinner by 250ms (configurable via `delayMs`). If the network or compute response resolves under 250ms, the loader never renders at all. Fast interactions feel instant.
* **In-app Implementations**:
  - `AddItemsView.tsx`: Smart AI list input analysis indicator.
  - `ShoppingListView.tsx`: Finish trip button submission.
  - `AuthModal.tsx` & `ChangePasswordModal.tsx`: Async save/submit buttons.

### 3. Progress Bars (`ProgressBar`)
* **When to use**: Long-running, measurable batch operations (uploads, imports, bulk data sync) where completion percentage or progress count is genuinely known.
* **When NOT to use**: When progress cannot be calculated (a fake progress bar destroys user trust; use an honest spinner instead); operations finishing under 2 seconds.
* **Available Component**:
  - `ProgressBar`: Determinate bar with numeric percentage, accessible ARIA attributes (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`), and optional value/max label.

---

## Document 2: UI Input Elements

### 1. Buttons
* **Hierarchy**:
  - **Primary**: Deep Forest Green (`bg-primary` `#0F3D2E`, text-white, pill radius `rounded-pill` or `rounded-full`).
  - **Secondary**: Elevated neutral surface (`bg-surface-container`, `border-surface-dim`, text-on-surface).
  - **Tertiary / Ghost**: Transparent background with hover fill (`hover:bg-surface-container-low`, text-outline to text-on-surface).
  - **Destructive**: Rose / Error tone (`bg-rose-600` or `text-rose-700 hover:bg-rose-50`).
* **Clear Labels**: Every button features explicit intent verbs ("Save changes", "Create List", "Add item", "Delete List", not generic "OK").
* **States**: Explicit visual treatments for hover (`hover:bg-...`), active press scale (`active:scale-95` with `transition-transform`), and disabled (`disabled:opacity-50 disabled:pointer-events-none`).
* **Touch Target Standard**: **Minimum 44×44px** hit area on mobile viewports for all interactive controls (headers, navigation, list cards, row actions, plus buttons, icon toggles).

### 2. Text & Password Fields
* **Labels**: Visible labels or accessible `aria-label` attributes on every single `<input>`, `<textarea>`, and `<select>` element.
* **Input Types**: Semantically matched input types (`type="email"` with `autoComplete="email"`, `type="tel"` with `autoComplete="tel"`, `type="password"`, `type="text"`).
* **Validation & Errors**: Clear inline error messages positioned adjacent to fields (`errorMsg` with `role="alert"` and red border accent).
* **Password Show/Hide**: All password inputs (`AuthModal.tsx`, `ChangePasswordModal.tsx`) include a toggle button with an accessible label (`aria-label="Show password"` / `"Hide password"`) and at least 44×44px touch target.

### 3. Checkboxes & Signature Interactions
* **The Item Tick (`CelebrationCheckbox`)**: The check/tick interaction in YAAD is the signature emotional interaction of the application. Checking an item triggers an animated completion with celebratory feedback and micro-haptics. This interaction behavior is strictly preserved across all updates.

---

## Document 3: Badges (`src/components/common/Badge.tsx`)

A badge is a compact visual marker positioned on top of or adjacent to an element (icon, tab, avatar, card) to communicate status, count, or notification without overwhelming the parent element.

### Anatomy:
1. **Container**: Circle, pill, or rounded rectangle (`rounded-full` or `rounded-md`).
2. **Content**: Dot (empty), count (number), short text label, icon, or combination.
3. **Position**: Anchored to the top-right / trailing edge of the host component using `BadgeAnchor`.

### The 5 Badge Types:
| Type | Purpose | Implementation Example |
|---|---|---|
| `dot` | Signals presence or status change without numbers | Unread notification bell indicator (`TopHeader.tsx`), pulsing amber dot. |
| `numeric` | Shows quantity or count (auto-caps at `max={99}` e.g. "99+") | Pending sync item counter (`NetworkStatusPill.tsx`), cart/list count. |
| `text` | Labels or categorizes content | "New", "Urgent", "Special" badges. |
| `icon` | Conveys state through iconography | Verified badge, warning indicator. |
| `combined` | Mixes icon/text or number/text | Status indicator with icon + count label. |

### The 5 Tones:
* `default`: Primary brand green tint (`bg-primary/10 text-primary border-primary/20`).
* `success`: Emerald green status (`bg-emerald-500/10 text-emerald-700 border-emerald-500/20`).
* `warning`: Warm yellow/amber accent (`bg-amber-500 text-amber-950` or `bg-amber-400 text-slate-900`).
* `error`: Rose/red alert tone (`bg-rose-500/15 text-rose-700 border-rose-500/25`).
* `info`: Calm blue tone (`bg-sky-500/10 text-sky-700 border-sky-500/20`).

---

## Document 4: Responsive Web Design

The application adheres to three universal responsive checks:

1. **Fluid Typography**:
   - Rather than jumping between rigid breakpoint font sizes, key titles use CSS `clamp()` tokens defined in `src/index.css`:
     - `--text-display`: `clamp(1.75rem, 5vw + 1rem, 2.5rem)` (28px → 40px)
     - `--text-headline`: `clamp(1.25rem, 3vw + 0.75rem, 1.75rem)` (20px → 28px)
     - `--text-title`: `clamp(1rem, 2vw + 0.625rem, 1.25rem)` (16px → 20px)
   - Readability check: Headings and copy are evaluated for reading comfort across 360px–1024px, not merely fitting inside containers.

2. **Touch Targets (>= 44×44px)**:
   - All interactive controls on mobile have a minimum touch target of 44×44px (`min-w-[44px] min-h-[44px]` or `w-11 h-11`).
   - Verified across:
     - `TopHeader`: Back button (`w-11 h-11`), Notification bell (`w-11 h-11`), Settings gear (`w-11 h-11`).
     - `ShoppingListCard`: 3-dot options menu button (`w-11 h-11`), dropdown menu items (`min-h-[44px]`).
     - `CreateListView`: Back button (`w-11 h-11`), submit arrow button (`w-11 h-11`).
     - `EditListView`: Add item button (`w-11 h-11`), category chips (`min-h-[44px]`), row delete buttons (`w-11 h-11`).
     - `ShoppingListView`: Add item button (`w-11 h-11`), undo action button (`min-h-[44px]`), category filter chips (`min-h-[44px]`), delete list button (`w-11 h-11`).
     - `AuthModal` & `ChangePasswordModal`: Close buttons (`w-11 h-11`), password show/hide eye toggles (`w-11 h-11`), action buttons (`min-h-[44px]`).

3. **Layout & Overflow Discipline**:
   - `html, body` enforce `overflow-x: hidden` and `max-w-full`.
   - Zero horizontal page scrolling at narrow 360px viewport widths.
   - Horizontal scroll containers (e.g., category chips) explicitly feature `no-scrollbar` and bleed padding with `-mx-4 px-4` to preserve edge-to-edge swipeability without body scroll leakage.

---

## Document 5: Design Systems (Layering & Tokens)

The system is organized into three distinct layers:

### Layer 1: Foundations (`src/index.css` `@theme`)
* **Tokens**:
  - Brand Palette: Primary deep green `#0F3D2E` (`--color-primary`), secondary accent yellow `#FCBC1F` (`--color-secondary-container`).
  - Themes: 6 distinct app themes supported through `html[data-app-theme]` (Forest, Olive, Lavender, Sunset, Rose, Sand).
  - Radii Tokens:
    - `--radius-card`: `1rem` (16px) — for cards, modals, sheets.
    - `--radius-control`: `0.75rem` (12px) — for inputs, buttons, segmented controls.
    - `--radius-pill`: `9999px` — for chips, floating action buttons, badges.
  - Fonts: Plus Jakarta Sans for English/Latin (`--font-sans`), Noto Nastaliq Urdu for Urdu typography (`--font-urdu`).

### Layer 2: Components (`src/components/common/`)
* Atomic, highly reusable UI blocks built strictly from tokens:
  - `Badge` & `BadgeAnchor`: Multi-type status indicators.
  - `LoadingStates`: `Skeleton`, `ListItemSkeleton`, `TileSkeleton`, `ListCardSkeleton`, `DelayedSpinner`, `ProgressBar`.
  - `CelebrationCheckbox`: The signature list item checkmark.
  - `BidiText`: Bi-directional text renderer handling RTL Urdu and LTR English seamlessly.

### Layer 3: Views & App Patterns (`src/components/*`)
* Domain-specific flows composed of Layer 2 components and Layer 1 tokens:
  - `HomeListsSection`: List collection with skeletons and responsive cards.
  - `FrequentEssentialsSection`: Filterable quick catalog additions.
  - `ShoppingListView`: Active in-store shopping run with categorized items, quick add, and undo toast.
  - `CreateListView` & `EditListView`: List creation and item editing with 44px touch targets.
  - `AuthModal` & `ChangePasswordModal`: Accessible, secure credential management with password visibility toggles.

---

## Admin Panel Boundary (Strict Rule)
Per project architectural constraints, **all admin code (`src/admin/**`, `server/admin/**`, any file with `Admin` in its name, and `supabase/migrations/**`) is strictly isolated and unmodified**. Any design system updates or refactors apply exclusively to user-facing app views and public components.
