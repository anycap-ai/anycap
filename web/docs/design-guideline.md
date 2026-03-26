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
| **Text Neutral** | `#9a9e90` | Navigation, footer, placeholders |

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
| **Hero** | `clamp(42px, 8vw, 108px)` | Main hero headline |
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
| 13px | Mono | Terminal content, button labels |
| 11px | Mono | Navigation, CTA buttons, uppercase labels |
| 10px | Mono | Footer, smallest labels |

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
| `1px` to `3px` | Uppercase labels, buttons, navigation |
| `6px` to `10px` | Dramatic uppercase sections (anti-pattern) |

### Rules

- Headlines: **pixel font**, negative tracking, tight leading
- UI chrome: **mono**, uppercase, wide tracking (2-3px), 10-11px
- Body: **sans-serif**, natural tracking, relaxed leading (1.7)
- Font weights: 400 (regular) and 700 (bold) only

---

## 3. Spacing

### Responsive Page Padding

| Breakpoint | Horizontal | Vertical (sections) |
|------------|-----------|-------------------|
| Mobile | `px-6` (24px) or `px-8` (32px) | `py-20` (80px) |
| Tablet (`md:`) | `px-12` (48px) or `px-16` (64px) | `py-24` to `py-32` |
| Desktop (`lg:`) | `px-20` (80px) or `px-24` (96px) | `py-32` to `py-40` |

### Section Rhythm

- **Between sections**: `mt-16` (64px) to `mt-36` (144px), responsive
- **Within sections**: `mt-6` to `mt-12` for element spacing
- **Paragraph gap**: `mt-5` to `mt-6`
- **Label to content**: `mt-4` (16px)
- **Divider `<hr>`**: Placed with matching horizontal padding, `border-[#d4dbb8]`

### Container Max-Widths

| Width | Usage |
|-------|-------|
| `1280px` | Page-level max container |
| `1080px` | Hero content area |
| `800px` | Terminal demo |
| `700px` | Body text blocks, hero description |
| `520px` | Pull quotes |

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
- Terminal band: full-width `#1c1f17` dark band breaking light page flow
- Device auth: subtle `linear-gradient(to bottom, rgba(255,255,255,0.45), rgba(255,255,255,0.08))` glass effect
- Dashboard: `#f9faf5` sidebar against `#f4f5f0` main content

---

## 5. Borders & Dividers

- **Section dividers**: 1px `border-t border-[#d4dbb8]` with matching page padding
- **Left accent border**: 3px solid `#6b7d3a` (philosophy) or `#1c1f17` (pull quote)
- **Card borders**: 1px `#d4dbb8` on light, `#2a2e22` on dark
- **Input borders**: 1px `#c7cfad`, focus: `#6b7d3a`
- **Border radius**: minimal — `rounded` (4px) for buttons, `rounded-lg` (8px) for dialogs

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

### FadeIn Directions

- **Default (bottom)**: `translate-y-6` -> origin
- **From left**: `-translate-x-6` -> origin
- **From right**: `translate-x-6` -> origin

---

## 7. Component Patterns

### Logo (AnycapMark)

Nested rounded squares with rotation and opacity layers:

1. Outermost: `#d4e0a4` at `0.18` opacity, `rx=8`, rotated `-5deg`
2. Middle: `#8fa34e` at `0.42` opacity, `rx=5`, rotated `-3deg`
3. Inner: `#6b7d3a`, `rx=3`
4. Center dot: `#f4f5f0`, `rx=2`

### Wordmark (AnycapWordmark)

- Primary: "any" in `#1c1f17`, "cap" in `#6b7d3a`
- Alternate: "any" in `#6b7d3a`, "cap" in `#8fa34e`
- Font: mono, bold, `letter-spacing: -0.5px`

### Buttons

**Primary (olive)**:
- `bg-[#6b7d3a]`, text `#f4f5f0`, 11px mono, uppercase, tracking `3px`
- Hover: `bg-[#1c1f17]`

**No rounded corners on primary CTAs** — sharp rectangular shape.

### Navigation Links

- 11px mono, uppercase, tracking `2px`
- Color: `#9a9e90` -> hover `#6b7d3a`
- `transition-colors`

### Terminal Demo

- Dark band (`#1c1f17`) breaking full-width across light page
- Header: icon (`#8fa34e`) + title (`#9a9e90`)
- Prompt symbol: `#6b7d3a`, command text: `#d4e0a4`
- Output: `#b8cc6e`, comments: `#6b7d3a`
- Blinking block cursor: `#b8cc6e`, 7x14px

### Form Inputs

- Background: `#fcfdf8`, border: `#c7cfad`
- Focus: border `#6b7d3a` + ring `rgba(107,125,58,0.12)`
- Large text (26-34px), mono font, center-aligned

---

## 8. Layout Principles

- **Alignment**: left-aligned by default, occasional right-aligned pull quotes for contrast
- **Breakpoints**: mobile-first, `md:` (768px), `lg:` (1024px)
- **Content width**: capped at `1280px`, prose capped at `700px`
- **Rhythm**: alternating text sections with full-width dark bands and horizontal dividers
- **Z-index**: `30` for dropdowns, `50` for grain overlay and modals

---

## 9. Design Principles

1. **Analog warmth on digital**: grain overlay + warm palette creates printed/tactile feel
2. **Pixel font as voice**: GeistPixelSquare gives a technical-yet-playful brand voice
3. **Restraint in color**: olive green is the only accent — everything else is neutral
4. **Full-width breaks**: terminal demo and dark bands disrupt the light page flow intentionally
5. **Uppercase labels**: all UI chrome (nav, buttons, footer) is uppercase mono with wide tracking
6. **Sharp edges**: primary CTAs have no border-radius — deliberate sharpness
7. **Minimal decoration**: no icons (except logo), no illustrations, no gradients on light mode
8. **Scroll-triggered reveals**: content fades in directionally as user scrolls

---

## 10. Do / Don't

| Do | Don't |
|----|-------|
| Use olive `#6b7d3a` as the sole accent | Introduce additional accent colors |
| Keep body text in system sans-serif | Add more font families |
| Use pixel font only for headlines/statements | Use pixel font for body copy or small text |
| Use grain overlay on all light-mode pages | Apply grain to dark backgrounds |
| Keep CTAs sharp-edged (no rounded corners) | Round primary action buttons |
| Use uppercase + wide tracking for UI chrome | Mix casing in navigation/labels |
| Let sections breathe with generous vertical spacing | Compress sections together |
| Fade content in on scroll | Use flashy entrance animations |
