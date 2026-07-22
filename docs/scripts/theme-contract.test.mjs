import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const stylesheet = await readFile(new URL('../src/styles/custom.css', import.meta.url), 'utf8');
const assetPreparation = await readFile(new URL('./prepare-assets.mjs', import.meta.url), 'utf8');
const homepage = await readFile(new URL('../src/content/docs/index.mdx', import.meta.url), 'utf8');
const logo = await readFile(new URL('../src/assets/anycap-logo.svg', import.meta.url), 'utf8');
const docsConfig = await readFile(new URL('../astro.config.mjs', import.meta.url), 'utf8');
const modelsPage = await readFile(new URL('../src/content/docs/capabilities/models.mdx', import.meta.url), 'utf8').catch(
  () => '',
);

test('uses the main-site typography roles', () => {
  assert.match(stylesheet, /--sl-font:\s*Inter,/);
  assert.match(stylesheet, /--sl-font-heading:\s*"Geist Pixel Square"/);
  assert.match(stylesheet, /--sl-font-mono:\s*Inter,/);
  assert.match(stylesheet, /h1,[\s\S]*font-family:\s*var\(--sl-font-heading\)/);
});

test('maps the main-site light palette and an olive-charcoal dark palette', () => {
  for (const declaration of [
    '--ac-page: #f4f5f0',
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
  assert.match(logo, /<tspan fill="#1c1f17">any<\/tspan><tspan fill="#6b7d3a">cap<\/tspan>/);
});

test('uses the same off-white page canvas as the main site', () => {
  assert.match(stylesheet, /:root\[data-theme='light'\][\s\S]*--ac-page: #f4f5f0/);
  assert.match(stylesheet, /--sl-color-bg: var\(--ac-page\)/);
  assert.match(docsConfig, /theme-color', content: '#f4f5f0'/);
  assert.match(stylesheet, /body::before/);
  assert.match(stylesheet, /url\("\/assets\/grain\.png"\)/);
  assert.match(stylesheet, /opacity: 0\.07/);
  assert.match(assetPreparation, /grain\.png/);
});

test('uses rendered icons and styled documentation footer controls', () => {
  assert.match(homepage, /<Card title="Understand" icon="document">/);
  assert.match(stylesheet, /footer\.sl-flex/);
  assert.match(stylesheet, /\.pagination-links/);
  assert.doesNotMatch(docsConfig, /editLink:/);
  assert.match(stylesheet, /footer\.sl-flex \.pagination-links a \{[\s\S]*border: 0;/);
  assert.match(stylesheet, /footer\.sl-flex \.pagination-links a \{[\s\S]*border-radius: 0;/);
});

test('routes model discovery to the live catalog instead of duplicating availability claims', () => {
  assert.match(docsConfig, /\{ label: 'Models', link: '\/capabilities\/models\/' \}/);
  assert.match(modelsPage, /https:\/\/anycap\.ai\/models/);
  assert.match(modelsPage, /anycap image models/);
  assert.match(modelsPage, /anycap video models/);
  assert.match(modelsPage, /anycap music models/);
  assert.match(modelsPage, /anycap audio models/);
  assert.match(modelsPage, /not duplicated in this documentation site/);
});

test('shows direct CLI and MCP integration paths in the homepage hero', () => {
  assert.match(homepage, /text: Start in 30 seconds[\s\S]*link: \/getting-started\//);
  assert.match(homepage, /text: Install the CLI[\s\S]*link: \/getting-started\/install\//);
  assert.match(homepage, /text: Connect through MCP[\s\S]*link: \/getting-started\/mcp\//);
  assert.equal((homepage.match(/icon: external/g) ?? []).length, 3);
  assert.match(homepage, /title="CLI"[\s\S]*href="\/getting-started\/install\/"/);
  assert.match(homepage, /title="Local MCP server"[\s\S]*href="\/getting-started\/mcp\/"/);
});
