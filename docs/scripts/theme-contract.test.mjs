import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const stylesheet = await readFile(new URL('../src/styles/custom.css', import.meta.url), 'utf8');
const assetPreparation = await readFile(new URL('./prepare-assets.mjs', import.meta.url), 'utf8');
const homepage = await readFile(new URL('../src/content/docs/index.mdx', import.meta.url), 'utf8');
const logo = await readFile(new URL('../src/assets/anycap-logo.svg', import.meta.url), 'utf8');

test('uses the main-site typography roles', () => {
  assert.match(stylesheet, /--sl-font:\s*Inter,/);
  assert.match(stylesheet, /--sl-font-heading:\s*"Geist Pixel Square"/);
  assert.match(stylesheet, /--sl-font-mono:\s*Inter,/);
  assert.match(stylesheet, /h1,[\s\S]*font-family:\s*var\(--sl-font-heading\)/);
});

test('maps the main-site light palette and an olive-charcoal dark palette', () => {
  for (const declaration of [
    '--ac-page: #f9faf5',
    '--ac-surface: #f4f5f0',
    '--ac-raised: #fbfcf8',
    '--ac-ink: #1c1f17',
    '--ac-muted: #4d5145',
    '--ac-accent: #6b7d3a',
    '--ac-border: #d4dbb8',
  ]) {
    assert.ok(stylesheet.includes(declaration), `missing light token: ${declaration}`);
  }

  assert.match(stylesheet, /:root\[data-theme='dark'\][\s\S]*--ac-page: #12150f/);
  assert.match(stylesheet, /:root\[data-theme='dark'\][\s\S]*--ac-accent: #a8bc62/);
});

test('publishes the shared display font as a documentation asset', () => {
  assert.match(stylesheet, /url\("\/assets\/geist-pixel-square\.woff2"\)/);
});

test('bundles the main-site Inter and Space Mono font roles', () => {
  assert.match(stylesheet, /font-family: "Inter"/);
  assert.match(stylesheet, /--sl-font-mono: Inter,/);
  assert.match(assetPreparation, /inter-latin-wght-normal\.woff2/);
  assert.match(assetPreparation, /space-mono-latin-700-normal\.woff2/);
  assert.match(logo, /space-mono-700\.woff2/);
});

test('uses the main-site brand mark without duplicating it in the homepage hero', () => {
  assert.doesNotMatch(homepage, /hero:[\s\S]*?image:/);
  assert.match(logo, /fill="#6b7d3a"/);
  assert.match(logo, /rotate\(-5 100 100\)/);
});

test('uses rendered icons and styled documentation footer controls', () => {
  assert.match(homepage, /<Card title="Understand" icon="document">/);
  assert.match(stylesheet, /footer\.sl-flex/);
  assert.match(stylesheet, /\.pagination-links/);
});
