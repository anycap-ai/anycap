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
| **Surface** | `#f4f5f0` | Primary page background |
| **Surface Raised** | `#f9faf5` | Sidebar, secondary panels |
| **Surface Input** | `#fbfcf7` | Form containers |
| **Surface Field** | `#fcfdf8` | Input fields |
| **Surface Hover** | `#eef2df` | Interactive hover state |

### Text Colors (on light)

| Token | Hex | Role |
|-------|-----|------|
| **Text Primary** | `#1c1f17` | Headings, primary content |
| **Text Body** | `#3a3e32` | Body copy |
| **Text Secondary** | `#4d5145` | Supporting text |
| **Text Label** | `#707468` | Labels, captions |
| **Text Muted** | `#7a7e71` | Email, subtle info |
| **Text Neutral** | `#9a9e90` | Placeholders, decorative labels |

### Borders (on light)

| Token | Hex | Role |
|-------|-----|------|
| **Border Default** | `#d4dbb8` | Cards, section dividers, dashboard |
| **Border Soft** | `#d1d8b7` | Device page borders |
| **Border Input** | `#c7cfad` | Form input borders |
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
| **Error** | `#a83f32` | Validation errors |

---

## 2. Typography

### Font Stack

Three fonts, each with a clear role:

| Font | CSS Variable | Role |
|------|-------------|------|
| **GeistPixelSquare** | `--font-geist-pixel-square` | Display — headlines, bold statements, brand voice |
| **Space Mono** | `--font-mono` | Chrome — navigation, buttons, labels, code, terminal |
| **System sans-serif** | `sans-serif` | Body — paragraphs, descriptions, readable prose |

### Type Scale (Responsive)

Headlines use `clamp()` for fluid sizing between mobile and desktop:

| Level | clamp() | Usage |
|-------|---------|-------|
| **Hero** | `clamp(36px, 5.5vw, 76px)` | Main hero headline |
| **Display** | `clamp(36px, 7vw, 96px)` | Capability list items |
| **H1** | `clamp(32px, 6vw, 72px)` | Section closers |
| **H2** | `clamp(28px, 4.5vw, 60px)` | Section openers ("We believe...") |
| **H3** | `clamp(22px, 3.5vw, 40px)` | Philosophy quotes |
| **Subhead** | `clamp(14px, 2.2vw, 24px)` | Anti-pattern section |

### Fixed Sizes

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
| `0.3px` | Navigation, buttons, labels |
| `0.8px` | CTA buttons, small labels |
| `1px` | Decorative sections (anti-pattern) |

### Casing

- **Sentence case everywhere.** No uppercase transforms on navigation, buttons, labels, or footer text.
- Content that is inherently uppercase (e.g. "SDK", "DOCS") stays as-is in the source text.

### Rules

- Headlines: **pixel font**, negative tracking, tight leading
- UI chrome: **mono**, sentence case, tight tracking (0.3px), 14px
- Body: **sans-serif**, natural tracking, relaxed leading (1.7)
- Font weights: 400 (regular) and 700 (bold) only

---

## 3. Spacing

### Responsive Page Padding

| Breakpoint | Horizontal | Vertical (sections) |
|------------|-----------|-------------------|
| Mobile | `px-8` (32px) | `py-20` (80px) |
| Tablet (`md:`) | `px-16` (64px) | `py-24` to `py-32` |
| Desktop (`lg:`) | `px-24` (96px) | `py-32` to `py-40` |

### Section Rhythm

- **Between sections**: `mt-16` (64px) to `mt-36` (144px), responsive
- **Within sections**: `mt-6` to `mt-12` for element spacing
- **Paragraph gap**: `mt-5` to `mt-6`
- **Label to content**: `mt-4` (16px)
- **Divider `<hr>`**: Placed with matching horizontal padding, `border-[#d4dbb8]`

### Container Max-Widths

| Width | Usage |
|-------|-------|
| `800px` | Terminal demo |
| `700px` | Body text blocks, hero description |
| `520px` | Pull quotes |

No global max-width on page containers — content stretches with padding.

---

## 4. Backgrounds & Textures

### Grain Overlay

A canvas-generated noise texture applied to all light-mode pages:

- **Size**: 200x200px tiled
- **Opacity**: `0.18`
- **Blend mode**: `multiply`
- **Position**: `fixed`, full viewport, `z-50`, `pointer-events-none`
- **Effect**: Analog/printed paper feel

### Surface Treatments

- Light pages: flat `#f4f5f0` + grain overlay
- Terminal card: `#1c1f17` rounded card embedded in hero section
- Device auth: subtle `linear-gradient(to bottom, rgba(255,255,255,0.45), rgba(255,255,255,0.08))` glass effect
- Dashboard: `#f9faf5` sidebar against `#f4f5f0` main content

---

## 5. Borders & Dividers

- **Section dividers**: 1px `border-t border-[#d4dbb8]` with matching page padding
- **Left accent border**: 3px solid `#6b7d3a` (philosophy) or `#1c1f17` (pull quote)
- **Card borders**: 1px `#d4dbb8` on light, `#2a2e22` on dark
- **Input borders**: 1px `#c7cfad`, focus: `#6b7d3a`
- **Border radius**: `rounded-lg` (8px) for buttons, cards, dialogs, and nav links

---

## 6. Effects

### Shadows

| Context | Shadow |
|---------|--------|
| Button hover | `0 14px 40px rgba(28,31,23,0.16)` |
| Device card | `0 18px 50px rgba(28,31,23,0.06)` |
| Input focus ring | `0 0 0 4px rgba(107,125,58,0.12)` |
| Deep panel | `shadow-2xl shadow-black/30` |

### Transitions

- **Color transitions**: `transition-colors` on all interactive elements
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
| **Modal enter/exit** | 250ms ease-out | Backdrop fade + content `scale(0.95)→1` + `translateY(12px)→0`; reverse on close, unmount after animation completes |

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
| Header | 36 |
| Dashboard desktop sidebar | 24 |
| Dashboard mobile header | 22 |
| Footer | 16 |

### Buttons

**Primary (olive)**:
- `bg-[#6b7d3a]`, text `#f4f5f0`, 14px mono, sentence case, tracking `0.8px`
- Hover: `bg-[#1c1f17]`
- Border radius: `rounded-lg` (8px)

**Cursor**: all clickable elements (`button`, `a`, `[role="button"]`) use `cursor: pointer` globally via CSS reset.

### Navigation Links

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

### Form Inputs

- Background: `#fcfdf8`, border: `#c7cfad`
- Focus: border `#6b7d3a` + ring `rgba(107,125,58,0.12)`
- Large text (26-34px), mono font, center-aligned

---

## 8. Layout Principles

- **Hero fills viewport**: on desktop, the hero section occupies `100dvh - header` so the first screen shows headline + terminal demo with no content leaking below
- **Hero two-column**: left side is text (headline, description, CTA), right side is terminal card with embedded ParticleAgent — user sees how AnyCap works at first glance
- **Header alignment**: header uses the same horizontal padding as body sections (`px-8 md:px-16 lg:px-24`) with no max-width constraint, so edges align on all screen sizes
- **Alignment**: left-aligned by default, occasional right-aligned pull quotes for contrast
- **Breakpoints**: mobile-first, `md:` (768px), `lg:` (1024px)
- **Content width**: prose capped at `700px`, terminal at `800px`
- **Rhythm**: alternating text sections with horizontal dividers
- **Z-index**: `30` for dropdowns, `50` for grain overlay and modals

---

## 9. Design Principles

1. **Analog warmth on digital**: grain overlay + warm palette creates printed/tactile feel
2. **Pixel font as voice**: GeistPixelSquare gives a technical-yet-playful brand voice
3. **Restraint in color**: olive green is the only accent — everything else is neutral
4. **Hero as product demo**: the first screen shows what AnyCap does — terminal animation embedded alongside the headline
5. **Sentence case**: all UI text uses natural sentence casing — no uppercase transforms
6. **Soft rounded edges**: all buttons and interactive elements use `rounded-lg` (8px) for approachable feel
7. **Minimal decoration**: no icons (except logo), no illustrations, no gradients on light mode
8. **Scroll-triggered reveals**: content fades in directionally as user scrolls
9. **Stable animations**: animated content pre-renders at final size to prevent layout shift

---

## 10. Do / Don't

| Do | Don't |
|----|-------|
| Use olive `#6b7d3a` as the sole accent | Introduce additional accent colors |
| Keep body text in system sans-serif | Add more font families |
| Use pixel font only for headlines/statements | Use pixel font for body copy or small text |
| Use grain overlay on all light-mode pages | Apply grain to dark backgrounds |
| Use `rounded-lg` (8px) on all buttons | Use sharp-edged (no radius) buttons |
| Use sentence case for all UI text | Apply uppercase transforms to navigation or labels |
| Use tight tracking (0.3px) for UI chrome | Use wide letter-spacing on navigation or buttons |
| Embed terminal demo in the hero | Separate the terminal into its own full-width section |
| Let hero fill the viewport on desktop | Let content below the hero leak into the first screen |
| Align header padding with body sections | Give header different padding or max-width constraints |
| Fade content in on scroll | Use flashy entrance animations |
| Pre-render animated content at final size | Let animations cause layout shifts |
| Animate modals in/out (fade + scale + translate) | Show/hide modals without transition |
| Use `cursor: pointer` on all clickable elements | Leave default cursor on buttons or links |
