# YAAD Design System

Source: the 5 Notion docs (Loading States, UI Input Elements, Badges,
Responsive Web Design, Design Systems). This file maps each doc to what
the app actually does — so the next change follows the same rules.

## 1. Foundations (Design Systems doc)

Tokens live in `src/index.css` `@theme`. One decision per job.

| Foundation | Tokens | Rule |
|---|---|---|
| Colors | `--color-primary` `#0F3D2E`, `--color-secondary-container` `#ffbf23`, surface/on-surface/error scales, 6 app themes (`html[data-app-theme]`) | Never hardcode a hex in a component; use the token. |
| Typography | `--font-sans` Plus Jakarta Sans, `--font-urdu` Noto Nastaliq Urdu | Fluid sizes: `text-display` (clamp 28–40px), `text-headline` (20–28px), `text-title` (16–20px). Body stays `text-sm`/`text-base`. Ask: "does this feel good to read?" — not just "does it fit?" |
| Spacing | Tailwind 4px scale (`gap-2`, `p-4`…) | Standard rhythm 4 / 8 / 12 / 16 / 24px. |
| Radius | `--radius-card` 1rem, `--radius-control` 0.75rem, `--radius-pill` 9999px | Cards → `rounded-card`, controls → `rounded-control`, pills/chips → `rounded-pill`. No new radii inline. |
| Icons | lucide-react, `stroke-[2]`, `w-4 h-4` / `w-5 h-5` | One icon set only. |

## 2. Components & patterns (Design Systems doc)

Built from the foundations above. Shared components live in
`src/components/common/`.

### Loading states (`LoadingStates.tsx`)
| Pattern | When | Component |
|---|---|---|
| Skeleton | Layout known, 1–10s wait (lists, cards, feeds) | `Skeleton`, `ListItemSkeleton`, `TileSkeleton` — shape MUST match the real layout, or the jump feels broken. |
| Spinner | Button tap, small area, 2–10s wait | `DelayedSpinner` (appears after 250ms — fast responses never flash a loader). Never for sub-300ms waits; never block a whole screen >2s. |
| Progress bar | Measurable work only (uploads, imports, batch jobs), 10s+ | `ProgressBar` (determinate, value/max + %). Never fake a bar. |

Used in: `AddItemsView` (analysis), `ShoppingListView` (finish trip),
`AdminCatalogPage` (Seed Aliases progress), `HomeListsSection` (list skeletons).

### Input elements
- **Buttons**: clear labels ("Save changes", not "OK"); hierarchy
  primary (bg-primary) → secondary (bordered) → tertiary (text-only);
  hover/active/disabled states on every button; **min 44×44px on mobile**
  (AddItemsView row actions, AppPublicHeader back/profile, search submit).
- **Text & password fields**: every input has an accessible label
  (`aria-label` at minimum; visible `<label>` where the form has room);
  inline error messages next to the field (`AuthModal` error banner);
  correct input types (email/tel/password); password fields have a
  show/hide toggle (`AuthModal`, `ChangePasswordModal`).
- **Checkboxes**: the item tick (`CelebrationCheckbox`) is the app's
  signature interaction — checking an item must feel like an achievement.

### Badges (`Badge.tsx`)
| Type | Use | Example |
|---|---|---|
| Dot | Presence/change, no number | Unread notifications (bell, top-right, amber, pulsing) |
| Numeric | A count | Pending sync count (99+ cap) |
| Text | Label/category | "New", "Beta" |
| Icon | A symbol | Verified, warning |
| Combined | Text + icon/number | Count + "pending sync" label |

Anatomy: container (circle/pill/rounded rect) + content + position.
Placement: **top-right / trailing edge** of the host (`BadgeAnchor`).
A badge supports its parent — it never competes with it.

## 3. Responsive (the 3 checks)
1. **Typography** — fluid `text-display`/`text-headline`/`text-title`
   (clamp). Check it reads comfortably, not just that it fits.
2. **Touch targets** — every tappable control ≥ 44×44px on mobile.
3. **Layout** — `overflow-x: hidden` on html/body; no horizontal scroll
   at 360px wide. Verify on a real phone width after any layout change.

## 4. What is NOT in the system (yet)
- Visible `<label>` elements on auth inputs (aria-labels only, for now).
- A skeleton for the notifications list (loads from cache instantly).
