# Main-site-aligned documentation theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the Starlight documentation site's typography and light/dark color system with the AnyCap main site's visual language.

**Architecture:** The docs site retains Starlight and implements its own visual system in `custom.css`. A small Node contract test prevents font roles and primary palette values from drifting, while Starlight CSS variables map those tokens to the existing documentation UI.

**Tech Stack:** Astro 7, Starlight 0.41, CSS custom properties, Node.js built-in test runner, Geist package.

## Global Constraints

- Preserve documentation content, routes, metadata, sitemap behavior, and deployment configuration.
- Use the main site at `/Users/tyluo/go/src/engineering/anycap/web` only as the typography and palette source of truth.
- Use Inter for body/UI, Geist Pixel Square for branded headings, and Space Mono for code.
- Keep both Starlight light and dark modes selectable and accessible.
- User-facing documentation remains English.

---

### Task 1: Add a theme contract test

**Files:**

- Create: `docs/scripts/theme-contract.test.mjs`
- Test: `docs/scripts/theme-contract.test.mjs`

**Interfaces:**

- Consumes: `docs/src/styles/custom.css` as UTF-8 text.
- Produces: a Node test command that exits non-zero when required theme declarations drift.

- [x] **Step 1: Write the failing test**

Create `docs/scripts/theme-contract.test.mjs` with the following test. It intentionally fails until the new theme declarations exist.

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const stylesheet = await readFile(new URL('../src/styles/custom.css', import.meta.url), 'utf8');

test('uses the main-site typography roles', () => {
  assert.match(stylesheet, /--sl-font:\s*Inter,/);
  assert.match(stylesheet, /--sl-font-heading:\s*"Geist Pixel Square"/);
  assert.match(stylesheet, /--sl-font-mono:\s*"Space Mono"/);
  assert.match(stylesheet, /h1,[\s\S]*font-family:\s*var\(--sl-font-heading\)/);
});

test('maps the main-site light palette and an olive-charcoal dark palette', () => {
  for (const declaration of [
    '--ac-page: #f9faf5', '--ac-surface: #f4f5f0', '--ac-raised: #fbfcf8',
    '--ac-ink: #1c1f17', '--ac-muted: #4d5145', '--ac-accent: #6b7d3a',
    '--ac-border: #d4dbb8',
  ]) assert.ok(stylesheet.includes(declaration), `missing light token: ${declaration}`);
  assert.match(stylesheet, /:root\[data-theme='dark'\][\s\S]*--ac-page: #12150f/);
  assert.match(stylesheet, /:root\[data-theme='dark'\][\s\S]*--ac-accent: #a8bc62/);
});
```

- [x] **Step 2: Run the test to verify it fails**

Run: `node --test docs/scripts/theme-contract.test.mjs`

Expected: FAIL because `custom.css` does not yet define `--sl-font-heading` or the required `--ac-*` tokens.

- [x] **Step 3: Commit the test scaffold**

```bash
git add docs/scripts/theme-contract.test.mjs
git commit -m "test(docs): define main-site theme contract"
```

### Task 2: Add the display-font dependency and map theme tokens

**Files:**

- Modify: `docs/package.json`
- Modify: `docs/package-lock.json`
- Modify: `docs/src/styles/custom.css`

**Interfaces:**

- Consumes: main-site palette and typography roles from the approved design spec.
- Produces: font faces and `--ac-*`, `--sl-*` mappings consumed by Starlight and Task 3.

- [x] **Step 1: Add the dependency**

Run from `docs/`:

```bash
npm install --save geist@1.7.0
```

Expected: `docs/package.json` contains `"geist": "1.7.0"` and the lockfile records the resolved package.

- [x] **Step 2: Replace root theme declarations with the token map**

In `docs/src/styles/custom.css`, import Geist Pixel Square and define font roles and light tokens before mapping them to Starlight:

```css
@import "geist/font/pixel";

:root[data-theme='light'] {
  --ac-page: #f9faf5;
  --ac-surface: #f4f5f0;
  --ac-raised: #fbfcf8;
  --ac-ink: #1c1f17;
  --ac-muted: #4d5145;
  --ac-accent: #6b7d3a;
  --ac-border: #d4dbb8;
}

:root[data-theme='dark'] {
  --ac-page: #12150f;
  --ac-surface: #191d14;
  --ac-raised: #22271c;
  --ac-ink: #f4f5e9;
  --ac-muted: #c9d0b9;
  --ac-accent: #a8bc62;
  --ac-border: #3c4730;
}

:root {
  --sl-font: Inter, ui-sans-serif, system-ui, sans-serif;
  --sl-font-heading: "Geist Pixel Square", ui-monospace, monospace;
  --sl-font-mono: "Space Mono", "SFMono-Regular", Consolas, monospace;
  --sl-color-bg: var(--ac-page);
  --sl-color-bg-nav: color-mix(in srgb, var(--ac-page) 92%, transparent);
  --sl-color-bg-sidebar: var(--ac-surface);
  --sl-color-white: var(--ac-ink);
  --sl-color-gray-1: var(--ac-ink);
  --sl-color-gray-2: var(--ac-muted);
  --sl-color-accent: var(--ac-accent);
  --sl-color-hairline: var(--ac-border);
}
```

- [x] **Step 3: Run the theme contract test**

Run: `node --test docs/scripts/theme-contract.test.mjs`

Expected: PASS with 2 passing tests.

- [x] **Step 4: Commit the dependency and token map**

```bash
git add docs/package.json docs/package-lock.json docs/src/styles/custom.css
git commit -m "feat(docs): align theme tokens with main site"
```

### Task 3: Apply component treatment and validate the build

**Files:**

- Modify: `docs/src/styles/custom.css`
- Test: `docs/scripts/theme-contract.test.mjs`

**Interfaces:**

- Consumes: the `--ac-*` tokens and `--sl-font-heading` from Task 2.
- Produces: styled Starlight chrome, prose, cards, controls, code, tables, and accessible interactions.

- [x] **Step 1: Apply typography and interaction rules**

Add these focused rules after the token mapping:

```css
body { background: var(--ac-page); color: var(--ac-ink); letter-spacing: -0.01em; }
h1, h2, h3, h4, .site-title { font-family: var(--sl-font-heading); letter-spacing: -0.035em; }
a:focus-visible, button:focus-visible, summary:focus-visible { outline: 2px solid var(--ac-accent); outline-offset: 3px; }
.sl-link-card, .card { border-color: var(--ac-border); background: var(--ac-raised); border-radius: 0.75rem; }
.sl-link-card:hover { border-color: var(--ac-accent); box-shadow: 0 10px 24px color-mix(in srgb, var(--ac-ink) 8%, transparent); transform: translateY(-2px); }
```

Retain the existing reduced-motion override and table overflow behavior. Update header,
sidebar, button, code, table, and hero declarations to consume `--ac-*` tokens instead of
hard-coded legacy values.

- [x] **Step 2: Run diagnostics**

Run:

```bash
node --test docs/scripts/theme-contract.test.mjs
make docs-check
```

Expected: 3 passing theme tests; Astro reports 0 errors, 0 warnings, and 0 hints.

- [x] **Step 3: Build and audit the release artifact**

Run:

```bash
make docs-audit
git diff --check
```

Expected: the SEO audit reports 28 indexable pages and 8 release artifacts; `git diff --check` prints no whitespace errors.

- [x] **Step 4: Commit the component treatment**

```bash
git add docs/src/styles/custom.css docs/scripts/theme-contract.test.mjs
git commit -m "feat(docs): apply main-site visual treatment"
```
