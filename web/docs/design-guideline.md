# AnyCap Web Design Guideline

> Visual language reference for the AnyCap web properties (landing, dashboard, device auth).

---

## 1. Color System

AnyCap uses a nature-inspired olive/sage palette on warm off-white, with a dark navy counterpart for terminal and dark-mode contexts.

### Core Brand Colors

| Token | Hex | Role |
|-------|-----|------|
| **Navy** | `#1c1f17` | Primary dark — text on light, dark backgrounds, terminal |
| **Olive** | `#6b7d3a` | Primary accent — CTAs, links, highlights, brand identity |
| **Sage** | `#8fa34e` | Secondary accent — hover states, logo middle layer |
| **Light Sage** | `#b8cc6e` | Tertiary accent — terminal output, cursor |
| **Pale Sage** | `#c8d4a0` | Muted accent — strikethrough text, decorative |
| **Cream Yellow** | `#d4e0a4` | Light accent — logo outermost layer, terminal command text |

### Light Mode Backgrounds

| Token | Hex | Role |
|-------|-----|------|
| **Surface** | `#f4f5f0` | Primary page background (landing) |
| **Surface Dashboard** | `#f2f3ef` | Dashboard background (slightly cooler than landing) |
| **Surface Card** | `#ffffff` | Cards, panels, table containers on dashboard |
| **Surface Input** | `#fafbf8` | Input fields, secondary button backgrounds |
| **Surface Header** | `#f4f5f1` | Table header rows |
| **Surface Hover** | `#f0f2eb` | Secondary button hover, table row hover `#f9faf7` |

### Text Colors (on light)

| Token | Hex | Role |
|-------|-----|------|
| **Text Primary** | `#1c1f17` | Headings, primary content |
| **Text Body** | `#3a3e32` | Body copy, secondary button text |
| **Text Secondary** | `#4d5145` | Supporting text, section labels (semibold) |
| **Text Label** | `#6b7068` | Table header text, sidebar nav text |
| **Text Muted** | `#7a7e71` | Stat labels, section sub-labels, placeholder-like |
| **Text Neutral** | `#9a9e90` | Placeholders, decorative labels |
| **Text Disabled** | `#b0b4a8` | Disabled buttons, coming-soon labels |

### Borders (on light)

| Token | Hex | Role |
|-------|-----|------|
| **Border Card** | `#d8dcd0` | Cards, containers, table wrappers, modal panels |
| **Border Divider** | `#dce0d2` | Sidebar dividers, mobile header borders |
| **Border Input** | `#ccd1c3` | Input fields, secondary button borders |
| **Border Input Hover** | `#b8bdaf` | Secondary button hover border |
| **Border Table Row** | `#eceee7` | Table row separators (lighter than card border) |
| **Border Table Header** | `#e0e3da` | Table header bottom border |
| **Border Focus** | `#6b7d3a` | Focused input border |

### Dark Mode (Agent landing, terminal)

| Token | Hex | Role |
|-------|-----|------|
| **Dark BG** | `#0a0a0a` | Agent landing background |
| **Dark Surface** | `#111` | Code blocks |
| **Dark Elevated** | `#1a1a1a` | Dialogs |
| **Dark Border** | `#222` | Borders |
| **Dark Border Strong** | `#333` | Dialog borders |
| **Dark Text** | `#e0e0e0` | Primary text on dark |
| **Dark Text Muted** | `#888` | Secondary text on dark |

### Semantic

| Token | Hex | Role |
|-------|-----|------|
| **Error** | `#c4442d` | Validation errors, error status |
| **Error Hover** | `#a83a26` | Danger button hover |
| **Success** | `#6b7d3a` | Success status (reuses olive accent) |

---

## 2. Typography

### Font Stack

Three fonts, each with a clear role:

| Font | CSS Variable | Role |
|------|-------------|------|
| **GeistPixelSquare** | `--font-geist-pixel-square` | Display — headlines, bold statements, brand voice |
| **Inter** | `--font-mono` | Chrome — navigation, buttons, labels, dashboard UI |
| **Space Mono** | `--font-logo` | Logo wordmark and terminal demos |
| **System sans-serif** | `sans-serif` | Body — paragraphs, descriptions, readable prose |

### Type Scale — Landing (Responsive)

Headlines use `clamp()` for fluid sizing between mobile and desktop:

| Level | clamp() | Usage |
|-------|---------|-------|
| **Hero** | `clamp(36px, 5.5vw, 76px)` | Main hero headline |
| **Display** | `clamp(36px, 7vw, 96px)` | Capability list items |
| **H1** | `clamp(32px, 6vw, 72px)` | Section closers |
| **H2** | `clamp(28px, 4.5vw, 60px)` | Section openers ("We believe...") |
| **H3** | `clamp(22px, 3.5vw, 40px)` | Philosophy quotes |
| **Subhead** | `clamp(14px, 2.2vw, 24px)` | Anti-pattern section |

### Type Scale — Dashboard (Fixed)

| Size | Weight | Usage |
|------|--------|-------|
| 28px | 600 (semibold) | Page titles (tracking-tight) |
| 17px | 500 (medium) | Stat card detail values |
| 15px | 500 / 400 | Table body text, section labels, nav items |
| 14px | 500 / 400 | Card labels, info text, sub-values |
| 13.5px | 500 | Table header text |
| 13px | 500 | Button text, input labels, modal text |
| 40px | 700 (bold) | Stat card primary number (balance) |

### Fixed Sizes — Landing

| Size | Font | Usage |
|------|------|-------|
| 22-24px | Pixel / Sans | Secondary headings, pull quote punchline |
| 18-20px | Sans | Body paragraphs |
| 16px | Sans | Base body text |
| 14px | Mono | Navigation, terminal header, CTA buttons |
| 13px | Mono | Terminal content |
| 10px | Mono | Footer smallest labels |

### Line Height

| Value | Context |
|-------|---------|
| `0.92` | Hero headlines (very tight) |
| `1.1` | Section headings |
| `1.3` | Mid-size statements |
| `1.65` | Pull quotes |
| `1.7` | Body text |

### Letter Spacing

| Range | Context |
|-------|---------|
| `-0.03em` to `-0.02em` | Large headlines (negative for tightness) |
| `tracking-tight` | Dashboard page titles (28px) |
| `0.3px` | Navigation, buttons, labels |
| `0.8px` | CTA buttons, small labels |
| `1px` | Decorative sections (anti-pattern) |

### Casing

- **Sentence case everywhere.** No uppercase transforms on navigation, buttons, labels, or footer text.
- Content that is inherently uppercase (e.g. "SDK", "DOCS") stays as-is in the source text.

### Rules

- Headlines: **pixel font**, negative tracking, tight leading
- UI chrome: **Inter**, sentence case, 13-15px
- Body: **sans-serif**, natural tracking, relaxed leading (1.7)
- Font weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

---

## 3. Spacing

### Responsive Page Padding — Landing

| Breakpoint | Horizontal | Vertical (sections) |
|------------|-----------|-------------------|
| Mobile | `px-8` (32px) | `py-20` (80px) |
| Tablet (`md:`) | `px-16` (64px) | `py-24` to `py-32` |
| Desktop (`lg:`) | `px-24` (96px) | `py-32` to `py-40` |

### Dashboard Content Padding

| Breakpoint | Horizontal | Vertical |
|------------|-----------|----------|
| Mobile | `px-10` (40px) | `py-14` (56px) |
| Tablet (`md:`) | `px-16` (64px) | `py-14` (56px) |

Max content width: `1200px`.

### Dashboard Sidebar

- Width: `280px`
- Logo area: `px-7 py-8`
- Nav items: `px-4 py-3`, rounded-[10px], mb-0.5
- Nav dividers: `my-4 mx-3`
- User area: `px-7 py-6`

### Section Rhythm

- **Between sections**: `mt-16` (64px) to `mt-36` (144px), responsive
- **Within sections**: `mt-6` to `mt-12` for element spacing
- **Dashboard sections**: `mt-14` between card grid and activity table
- **Paragraph gap**: `mt-5` to `mt-6`
- **Label to content**: `mt-4` (16px)
- **Divider `<hr>`**: Placed with matching horizontal padding, `border-[#dce0d2]`

### Container Max-Widths

| Width | Usage |
|-------|-------|
| `1200px` | Dashboard main content |
| `800px` | Terminal demo |
| `700px` | Body text blocks, hero description |
| `520px` | Pull quotes |

---

## 4. Backgrounds & Textures

### Grain Overlay

A canvas-generated noise texture applied to all light-mode pages:

- **Size**: 200x200px tiled
- **Opacity**: `0.07`
- **Blend mode**: `multiply`
- **Position**: `fixed`, full viewport, `z-50`, `pointer-events-none`
- **Effect**: Subtle analog/printed paper feel

### Surface Treatments

- Landing pages: flat `#f4f5f0` + grain overlay
- Dashboard: `#f2f3ef` for sidebar and main content, `#ffffff` for cards/tables
- Terminal card: `#1c1f17` rounded card embedded in hero section
- Device auth: subtle `linear-gradient(to bottom, rgba(255,255,255,0.45), rgba(255,255,255,0.08))` glass effect

---

## 5. Borders & Dividers

- **Section dividers**: 1px `border-t border-[#dce0d2]` with matching page padding
- **Left accent border**: 3px solid `#6b7d3a` (philosophy / active nav indicator)
- **Card borders**: 1px `#d8dcd0` — solid, visible, gives cards weight
- **Table row borders**: 1px `#eceee7` — lighter than card border
- **Table header border**: 1px `#e0e3da`
- **Input borders**: 1px `#ccd1c3`, focus: `#6b7d3a`
- **Sidebar divider**: 1px `#dce0d2`
- **Border radius**:
  - `rounded-2xl` (16px) for dashboard cards, containers, panels, and table wrappers
  - `rounded-xl` (12px) for landing page cards, buttons, inputs, dropdowns
  - `rounded-[10px]` for dashboard nav items
  - `rounded-lg` (8px) for landing buttons, close buttons
  - `rounded-full` for avatars and profile images
- **Table containers**: use `rounded-2xl overflow-hidden` so inner table rows clip to rounded corners

---

## 6. Effects

### Shadows

| Context | Shadow |
|---------|--------|
| **Card / table (dashboard)** | `0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)` |
| **Card hover (dashboard)** | `0 3px 12px rgba(0,0,0,0.08)` |
| **Primary button** | `0 1px 2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.12)` |
| **Secondary button** | `0 1px 2px rgba(0,0,0,0.06)` |
| **Input field (inset)** | `inset 0 1px 2px rgba(0,0,0,0.04)` |
| **Modal panel** | `0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08)` |
| **Button hover (landing)** | `0 14px 40px rgba(28,31,23,0.16)` |
| **Device card** | `0 18px 50px rgba(28,31,23,0.06)` |
| **Input focus ring** | `0 0 0 4px rgba(107,125,58,0.15)` |

### Transitions

- **Color transitions**: `transition-colors` or `transition-all` on all interactive elements
- **Duration**: 150-200ms for micro-interactions
- **Timing**: `ease` or `ease-out`
- **Hover patterns**: text color shifts toward `#6b7d3a` (olive), backgrounds darken

### Animations

| Animation | Duration | Trigger |
|-----------|----------|---------|
| **Blink cursor** | 1s, step-end, infinite | Terminal cursor |
| **Fade-in** | 0.4s ease-out | Terminal header appear |
| **Scroll reveal** | 700ms ease-out | `FadeIn` on viewport intersection (15% threshold) |
| **ScrambleText** | 20-30ms/char | On viewport entry — characters cycle randomly before locking |
| **Terminal lines** | Sequential delays | All lines pre-rendered as `invisible` for stable height; animation toggles visibility — no layout shift |
| **Modal enter/exit** | 250ms ease-out | Backdrop fade + content `scale(0.95)->1` + `translateY(12px)->0`; reverse on close, unmount after animation completes |

### FadeIn Directions

- **Default (bottom)**: `translate-y-6` -> origin
- **From left**: `-translate-x-6` -> origin
- **From right**: `translate-x-6` -> origin

---

## 7. Component Patterns

### Logo (AnycapLogo)

A single component combining mark + wordmark. The `size` prop controls the mark icon size; font size and gap scale proportionally (`fontSize = size * 0.71`, `gap = size * 0.43`).

#### Mark layers

1. Outermost: `#d4e0a4` at `0.18` opacity, `rx=8`, rotated `-5deg`
2. Middle: `#8fa34e` at `0.42` opacity, `rx=5`, rotated `-3deg`
3. Inner: `#6b7d3a`, `rx=3`
4. Center dot: `#f4f5f0`, `rx=2`

#### Wordmark

- Primary: "any" in `#1c1f17`, "cap" in `#6b7d3a`
- Alternate: "any" in `#6b7d3a`, "cap" in `#8fa34e`
- Font: mono, bold, `letter-spacing: -0.5px`

#### Sizes in use

| Context | size |
|---------|------|
| Header (landing) | 36 |
| Dashboard desktop sidebar | 28 |
| Dashboard mobile header | 24 |
| Footer | 16 |

### Buttons — Dashboard

Two tiers with strong visual weight:

**Primary (olive filled)**:
- `bg-[#6b7d3a]`, text `white`, 13px, `font-medium`, `rounded-xl`
- Hover: `bg-[#5c6c31]`, Active: `bg-[#4f5d2a]`
- Shadow: `0 1px 2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.12)`
- Disabled: `bg-[#c5ccb8] text-white/70`, no shadow, `cursor-not-allowed`
- Usage: Save, Publish, Rename, Move, primary actions

**Secondary (bordered)**:
- `border-[#ccd1c3] bg-[#fafbf8] text-[#3a3e32]`, 13px, `font-medium`, `rounded-xl`
- Hover: `bg-[#f0f2eb] border-[#b8bdaf]`
- Shadow: `0 1px 2px rgba(0,0,0,0.06)`
- Disabled: `border-[#e5e8df] bg-[#f5f6f3] text-[#b0b4a8]`, no shadow, `cursor-not-allowed`
- Usage: Cancel, Unpublish, Upload, New Folder, secondary actions

**Danger (red filled)**:
- `bg-[#c4442d]`, text `white`, same shadow as primary
- Hover: `bg-[#a83a26]`
- Usage: Delete confirmations

### Buttons — Landing

**Primary (olive)**:
- `bg-[#6b7d3a]`, text `#f4f5f0`, 14px mono, sentence case, tracking `0.8px`
- Hover: `bg-[#1c1f17]`
- Border radius: `rounded-lg` (8px)

**Cursor**: all clickable elements (`button`, `a`, `[role="button"]`) use `cursor: pointer` globally via CSS reset.

### Navigation Links — Dashboard Sidebar

- 15px Inter, sentence case, `rounded-[10px]`
- Color: `#6b7068` -> hover `#3a3e32`, hover bg `rgba(107,125,58,0.07)`
- Active: `#1c1f17`, `font-medium`, bg `rgba(107,125,58,0.10)`, left accent bar 3px `#6b7d3a`
- `transition-all duration-150`

### Navigation Links — Landing

- 14px mono, sentence case, tracking `0.3px`
- Color: `#3f4437` -> hover `#1c1f17`
- Hover background: `rgba(107,125,58,0.08)`
- `transition-all duration-200 ease-out`

### Terminal Demo

- Embedded as a rounded card (`rounded-lg`) in the hero section, not a full-width band
- Header: icon (`#8fa34e`) + title "agent with anycap" (`#9a9e90`, 14px) + optional slot for ParticleAgent animation
- Prompt symbol: `#6b7d3a`, command text: `#d4e0a4`
- Output: `#b8cc6e`, comments: `#6b7d3a`
- Blinking block cursor: `#b8cc6e`, 7x14px
- All lines pre-rendered as `invisible` — animation only toggles visibility for stable container height

### Form Inputs — Dashboard

- Background: `#fafbf8`, border: `#ccd1c3`
- Shadow: `inset 0 1px 2px rgba(0,0,0,0.04)`
- Focus: border `#6b7d3a` + ring `rgba(107,125,58,0.15)` (2px ring)
- Border radius: `rounded-xl` (12px)
- Text: 14px, `text-[#1c1f17]`, padding `px-4 py-2.5`
- Disabled: `opacity-45`

### Form Inputs — Landing / Device Auth

- Background: `#fcfdf8`, border: `#c7cfad`
- Focus: border `#6b7d3a` + ring `rgba(107,125,58,0.12)`
- Border radius: `rounded-lg` (8px)
- Large text (26-34px), mono font, center-aligned

### Stat Cards (Dashboard Overview)

- White background, border `#d8dcd0`, `rounded-2xl`
- Shadow: `0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)`
- Hover shadow: `0 3px 12px rgba(0,0,0,0.08)`
- Padding: `px-8 py-7`, min-height `152px`
- Label: 14px medium `#7a7e71`, mb-5
- Primary value: 40px bold `#1c1f17` tracking-tight
- Detail value: 17px medium `#1c1f17`
- Sub text: 15px `#4d5145`

### Tables (Dashboard)

- Container: white bg, border `#d8dcd0`, `rounded-2xl overflow-hidden`, card shadow
- Header row: bg `#f4f5f1`, border-bottom `#e0e3da`
- Header text: 13.5px medium `#7a7e71` (overview) or 13px medium `#6b7068` (detail pages)
- Body text: 15px (overview) or 14px (detail pages)
- Row border: `#eceee7`
- Row hover: `bg-[#f9faf7]`
- Cell padding: `py-4 px-6` (overview) or `py-[15px] px-5` (detail pages)

### Modals

- Backdrop: black at 30% opacity, fade in/out
- Panel: white bg, border `#d8dcd0`, `rounded-2xl`
- Shadow: `0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08)`
- Max width: `420px`
- Header: `px-6 py-4`, border-bottom `#d8dcd0`, title 15px semibold `#1c1f17`
- Body: `px-6 py-5`
- Actions: flex right-aligned, gap-2, mt-5
- Animation: `scale(0.95)->1` + `translateY(12px)->0`, 250ms ease-out

---

## 8. Layout Principles

- **Hero fills viewport**: on desktop, the hero section occupies `100dvh - header` so the first screen shows headline + terminal demo with no content leaking below
- **Hero two-column**: left side is text (headline, description, CTA), right side is terminal card with embedded ParticleAgent — user sees how AnyCap works at first glance
- **Header alignment**: header uses the same horizontal padding as body sections (`px-8 md:px-16 lg:px-24`) with no max-width constraint, so edges align on all screen sizes
- **Dashboard layout**: sidebar (280px, sticky) + scrollable main content, same background color
- **Alignment**: left-aligned by default, occasional right-aligned pull quotes for contrast
- **Breakpoints**: mobile-first, `md:` (768px), `lg:` (1024px)
- **Content width**: prose capped at `700px`, terminal at `800px`, dashboard at `1200px`
- **Rhythm**: alternating text sections with horizontal dividers
- **Z-index**: `30` for dropdowns, `50` for grain overlay and modals

---

## 9. Design Principles

1. **Analog warmth on digital**: grain overlay + warm palette creates printed/tactile feel
2. **Pixel font as voice**: GeistPixelSquare gives a technical-yet-playful brand voice
3. **Restraint in color**: olive green is the only accent — everything else is neutral
4. **Hero as product demo**: the first screen shows what AnyCap does — terminal animation embedded alongside the headline
5. **Sentence case**: all UI text uses natural sentence casing — no uppercase transforms
6. **Soft rounded edges**: cards and containers use `rounded-2xl` (16px) on dashboard / `rounded-xl` (12px) on landing, buttons use `rounded-xl` / `rounded-lg`, avatars use `rounded-full`
7. **Visual weight**: buttons have shadows (inset highlight + drop shadow) so they feel pressable; cards have visible borders + shadow; inputs have inset shadow for depth
8. **Minimal decoration**: no icons (except logo), no illustrations, no gradients on light mode
9. **Scroll-triggered reveals**: content fades in directionally as user scrolls (landing only)
10. **Stable animations**: animated content pre-renders at final size to prevent layout shift

---

## 10. Do / Don't

| Do | Don't |
|----|-------|
| Use olive `#6b7d3a` as the sole accent | Introduce additional accent colors |
| Keep body text in system sans-serif / Inter | Add more font families |
| Use pixel font only for headlines/statements | Use pixel font for body copy or small text |
| Use grain overlay on all light-mode pages | Apply grain to dark backgrounds |
| Use `rounded-2xl` (16px) on dashboard cards | Use sharp-edged (no radius) containers |
| Use `rounded-xl` (12px) on dashboard buttons and inputs | Use `rounded-sm` or no radius on interactive elements |
| Use `rounded-full` on avatars | Use square or sharp-cornered avatars |
| Give buttons shadow + weight (inset highlight, drop shadow) | Make buttons look like plain text with a border |
| Give cards solid borders `#d8dcd0` + shadow | Use faint/transparent borders that disappear |
| Use `cursor-not-allowed` + muted colors for disabled states | Only reduce opacity for disabled states |
| Use sentence case for all UI text | Apply uppercase transforms to navigation or labels |
| Embed terminal demo in the hero | Separate the terminal into its own full-width section |
| Let hero fill the viewport on desktop | Let content below the hero leak into the first screen |
| Align header padding with body sections | Give header different padding or max-width constraints |
| Fade content in on scroll | Use flashy entrance animations |
| Pre-render animated content at final size | Let animations cause layout shifts |
| Animate modals in/out (fade + scale + translate) | Show/hide modals without transition |
| Use `cursor: pointer` on all clickable elements | Leave default cursor on buttons or links |
| Use filled primary buttons for main actions | Use outline-only buttons for primary actions |
| Use `#f2f3ef` for dashboard background | Use `#f4f5f0` (too warm for dashboard context) |
