# Yigda Design System

Light theme, product register. Built around the Yigda seal.

## Color (OKLCH)

Color strategy: **Restrained**. One brand jade carries primary affordances; crimson and gold appear only on official moments (verification seals, danger states, hero accents).

### Surface

- `--surface-page`: `oklch(98.6% 0.006 95)` — warm ivory, the paper of the document.
- `--surface-panel`: `oklch(100% 0 0 / 1)` tinted by overlaying very light cream; near-white but never `#fff`.
- `--surface-sunken`: `oklch(96.5% 0.008 95)` — for inset panels, code wells, file drops.
- `--surface-inverse`: `oklch(20% 0.018 180)` — deep teal-ink, used very sparingly (footer ribbons, official seals).

### Ink

- `--ink-strong`: `oklch(22% 0.018 180)` — headings, body emphasis.
- `--ink-body`: `oklch(32% 0.012 180)` — paragraph.
- `--ink-muted`: `oklch(52% 0.010 180)` — secondary, hints.
- `--ink-soft`: `oklch(68% 0.008 180)` — placeholders, disabled.

### Brand

- `--jade`: `oklch(48% 0.085 195)` — primary, drawn from the logo's dominant teal.
- `--jade-deep`: `oklch(38% 0.085 195)` — hover/active.
- `--jade-soft`: `oklch(95% 0.018 195)` — selected, success tints.
- `--crimson`: `oklch(48% 0.140 27)` — emphasis, official seal, danger.
- `--crimson-soft`: `oklch(95% 0.020 27)` — error backgrounds.
- `--gold`: `oklch(70% 0.115 80)` — verification gold, hero accents.
- `--gold-soft`: `oklch(94% 0.040 85)` — verified badge backgrounds.

### State

- success → jade
- warning → gold
- danger → crimson
- info → a desaturated jade

### Lines

- `--line`: `oklch(90% 0.006 180)` — subtle hairlines.
- `--line-strong`: `oklch(82% 0.010 180)` — table dividers, focus rings on light controls.

## Typography

- **Sans (UI body):** Inter via `next/font`, fallback `system-ui`.
- **Serif (display, h1):** A high-contrast serif (Source Serif 4 via `next/font`, fallback `Georgia`) for landing h1 and the "official document" feel. Used sparingly — never on labels, buttons, table data.
- **Mono:** JetBrains Mono / `ui-monospace` for hashes, CIDs, transaction strings.

Scale (rem, ratio ~1.2):

- `--text-xs`: 0.75
- `--text-sm`: 0.875
- `--text-base`: 1
- `--text-md`: 1.0625
- `--text-lg`: 1.25
- `--text-xl`: 1.5
- `--text-2xl`: 1.875
- `--text-3xl`: 2.25
- `--text-display`: clamp(2.5rem, 4vw, 3.75rem) — landing h1 only.

Weights: 400 body, 500 ui-medium, 600 ui-strong, 700 headings.

## Spacing

8px base. Steps: 4, 8, 12, 16, 20, 24, 32, 40, 56, 80.

## Radii

- 6px for inputs/buttons.
- 10px for cards/panels.
- 14px for elevated surfaces.
- 999px for badges/pills.

## Elevation

- `--shadow-1`: subtle hairline shadow for static panels.
- `--shadow-2`: dropdown/popover.
- `--shadow-3`: modal.

## Motion

- 180ms cubic-bezier(0.2, 0.8, 0.2, 1) for hover/state transitions.
- 240ms for entering modals.
- Never animate layout properties.

## Components

- **Buttons**: primary (jade fill), secondary (line + ink), ghost (transparent + ink-muted), danger (crimson fill). Each with default / hover / focus-visible / active / disabled / loading states.
- **Inputs/selects/textareas**: 44px min-height, 1px line border, jade focus ring with 2px outline at 0.4 alpha.
- **Badges**: pill, semantic palette (success/warning/danger/info/neutral/gold).
- **Cards**: line border + ivory background. Never nested. Never stripe-bordered.
- **File drop**: sunken surface with dashed line; jade tint when dragging.
- **Tabs**: pill-style segmented control on sunken background.
- **Modal**: centered, 14px radius, shadow-3, backdrop 50% ink.

## Ornament

The logo (teal + crimson + gold seal) is the primary ornament. It appears as the favicon, brand mark, the landing hero accent, and the empty-state vault placeholder. No other illustrations, no SaaS isometrics.
