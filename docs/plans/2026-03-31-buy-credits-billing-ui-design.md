# Buy Credits and Billing UI Design Draft

Date: 2026-03-31

## Visual Direction

The UI should feel like an extension of the existing AnyCap dashboard, not a separate marketing property. The target aesthetic is:

- calm
- precise
- utilitarian
- slightly elevated for commerce moments

The reference mood is "dashboard-native with gentle purchase emphasis". The page may feel more intentional than the current Billing page, but it must not introduce a second visual language.

## Source of Truth

This draft inherits its base language from:

- `web/docs/design-guideline.md`
- `web/src/components/dashboard/DashboardShell.tsx`
- `web/src/app/dashboard/billing/page.tsx`

## Design Principles

### P1: Keep the dashboard palette intact

Use the existing dashboard color system only:

- background: `#f2f3ef`
- card: `#ffffff`
- primary text: `#1c1f17`
- support text: `#4d5145`, `#7a7e71`
- accent: `#6b7d3a`
- border: `#d8dcd0`

Do not add a second accent family for commerce. Tags, buttons, focus states, and featured cards should all derive from the same olive/sage system.

### P2: Differentiate by hierarchy, not by theme switch

`Buy credits` should have a stronger commercial hierarchy than Billing, but the difference should come from:

- card grouping
- price scale
- CTA weight
- featured-state treatment

It should not come from:

- dark theme sections
- heavy gradients
- highly saturated ribbons
- landing-page hero compositions

### P3: Keep commerce state easy to scan

Commerce pages should answer these questions quickly:

1. how many credits do I have now
2. what pack options are available
3. which option is recommended
4. what happens after I click buy

## Page: Buy credits

### Layout

Desktop structure:

1. header row
2. balance summary strip
3. credit pack grid
4. credits-explainer block

Mobile structure:

1. title
2. balance summary
3. pack cards stacked vertically
4. explainer block

### Header row

Left:

- title: `Buy credits`
- short explanation: `Purchase credits as needed. No automatic renewal.`

Right:

- compact balance card or balance summary pill

Spacing:

- `mb-9` beneath page title block
- maintain dashboard content width `max-w-[1200px]`

### Balance summary strip

Purpose: connect purchase intent to current account state.

Visual:

- white card
- light border
- rounded-2xl
- standard dashboard shadow

Content:

- label: `Current balance`
- large number using existing balance treatment
- optional muted note: `Use credits across supported AnyCap capabilities`

### Credit pack grid

Recommended desktop layout:

- 3 columns for the default case
- 4 columns only if each card remains readable without shrinking the CTA

Each card includes:

- pack name
- credits quantity
- price
- compact description
- optional badge
- CTA button

Recommended information order:

1. badge or eyebrow
2. credits quantity
3. price
4. short description
5. CTA

### Credit pack card treatment

Base card:

- `bg-white`
- `border border-[#d8dcd0]`
- `rounded-2xl`
- dashboard card shadow
- generous padding similar to existing Billing card rhythm

Text hierarchy:

- eyebrow/badge: `13px` medium
- credits quantity: large, bold, visually primary
- price: secondary but prominent
- description: `14px`, muted

Featured card:

- same structure as base
- slightly darker border or olive-tinted border
- subtle olive background tint, not more than a light wash
- one badge such as `Best value`

Avoid:

- black top bars
- multiple promo badges on one card
- crossed-out price plus multiple discount chips unless the pricing strategy requires it

### CTA buttons

Featured pack:

- solid olive background
- dark or cream text depending on contrast validation
- minimum touch target `44px`

Default pack:

- white or input-surface background
- olive border
- darker text

Interaction states:

- hover: darker border and slight shadow lift
- focus: visible olive focus ring
- loading: disabled + spinner/text change
- disabled: muted border and text

### Credits explainer block

Purpose: replace long feature lists with operational clarity.

Recommended format:

- white container card
- 3 to 4 short rows or tiles

Suggested content:

- `One-time purchase`
- `No automatic renewal`
- `Credits apply to supported capabilities`
- `Balance updates after payment completes`

This section should feel like product help, not marketing FAQ.

## Page: Billing

### Layout

Billing should remain information-first. Recommended structure:

1. page title
2. optional return-state banner
3. summary card row
4. transactions table

### Return-state banner

Placement:

- directly under page title

Variants:

- success
- canceled
- failed

Visual treatment:

- card-like banner with rounded-xl or rounded-2xl
- subtle background tint
- no alert-red full-width strip

Color guidance:

- success: pale olive tint with olive text accent
- canceled: neutral card tint
- failed: warm light error tint with `#c4442d` text accents

### Summary card row

Recommended cards:

1. `Current balance`
2. `Recent purchase status` or `Latest activity`
3. `Actions`

Desktop:

- 3-column row when enough data exists

Tablet/mobile:

- stack cards vertically

### Actions card

Keep actions short and obvious:

- `Buy more credits`
- `View credit packs`

Later additions:

- `View receipts`
- `Manage billing`

Buttons should use the same styling system as the Buy credits page to avoid drift.

### Transactions table

Retain the current dashboard table language:

- muted header background
- light row separators
- hover row state
- tabular numeric alignment for amounts

Preferred future columns:

- time
- type
- description
- amount
- status or receipt action when backend data is available

## Responsive Behavior

### Buy credits

Desktop:

- 3-card layout
- summary strip and explainer block use full content width

Tablet:

- cards may switch to 2 columns if widths become cramped

Mobile:

- cards stack to 1 column
- CTA remains full width
- avoid horizontal scrolling in card content

### Billing

Desktop:

- summary cards in row
- full-width transactions table

Mobile:

- summary cards stack
- transaction table may remain scrollable horizontally if needed, but prefer reducing columns before forcing scroll

## Accessibility Requirements

- all CTA buttons must meet minimum `44x44px`
- visible keyboard focus on cards, toggles, and buttons
- text contrast minimum 4.5:1 for normal text
- color alone must not communicate featured state or error state
- loading buttons should be disabled during async checkout creation
- banners must use semantic live-region behavior where appropriate

## Acceptance Checklist

- the page looks like part of the current dashboard at a glance
- the featured pack is visually distinct without looking like a landing-page promo
- Billing and Buy credits feel related but not redundant
- mobile layout is readable and tap-friendly
- success/failure/cancel states are calm and understandable
- no subscription-related language appears in the first release
