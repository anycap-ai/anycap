#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

export const DEMO_OUTPUT = 'store-assets/demo.mp4';

export const DEMO_SCENES = [
  {
    title: 'Open AnyCap from the browser side panel',
    body: 'A focused workspace for image, video, music, search, crawl, history, and settings.',
    image: 'tests/e2e/feishu-shots/00-cold-vary-empty.png',
    duration: 8,
    capabilities: ['Vary'],
  },
  {
    title: 'Right-click an image to create a variation',
    body: 'The selected image lands in Vary with the prompt ready to edit.',
    image: 'tests/e2e/feishu-shots/02-vary-result.png',
    duration: 9,
    capabilities: ['Vary'],
    menus: ['vary-image'],
  },
  {
    title: 'Turn selected text into generated images',
    body: 'Use templates, aspect ratios, and model defaults without leaving the page.',
    image: 'tests/e2e/feishu-shots/03-image-result.png',
    duration: 9,
    capabilities: ['Image'],
    menus: ['image-from-text'],
  },
  {
    title: 'Create short videos and music from prompts',
    body: 'Video and Music tabs preview generated media directly in the side panel.',
    image: 'tests/e2e/feishu-shots/04-video-result.png',
    duration: 9,
    capabilities: ['Video', 'Music'],
    menus: ['video-from-text', 'music-from-text'],
  },
  {
    title: 'Search selected text with citations',
    body: 'Search returns source cards that are ready to copy into research notes or agent context.',
    image: 'tests/e2e/feishu-shots/06-search-results.png',
    duration: 9,
    capabilities: ['Search'],
    menus: ['search-selection'],
  },
  {
    title: 'Crawl the current page or a link',
    body: 'Extract clean Markdown from pages and links through two context-aware menu flows.',
    image: 'tests/e2e/feishu-shots/07-crawl-markdown.png',
    duration: 10,
    capabilities: ['Crawl'],
    menus: ['crawl-page', 'crawl-link'],
  },
  {
    title: 'Reuse templates, history, and settings',
    body: 'Prompt templates, local history, and free-tier settings keep repeated workflows fast.',
    image: 'tests/e2e/feishu-shots/10-settings.png',
    duration: 9,
    capabilities: ['Settings'],
  },
];

const currentFile = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(currentFile);
const defaultRoot = path.resolve(scriptDir, '..');
const frameWidth = 1280;
const frameHeight = 720;

export function browserLaunchOptions() {
  return { headless: true };
}

export function buildFFmpegArgs({ concatPath, outputPath }) {
  return [
    '-y',
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    concatPath,
    '-vf',
    'fps=30,format=yuv420p',
    '-movflags',
    '+faststart',
    outputPath,
  ];
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function concatFilePath(filePath) {
  return String(filePath).replace(/'/g, "'\\''");
}

function imageDataURL(filePath) {
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:image/png;base64,${data}`;
}

function frameHTML(scene, imageURL) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      width: ${frameWidth}px;
      height: ${frameHeight}px;
      background: #f5f0e6;
      color: #20251d;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .stage {
      width: ${frameWidth}px;
      height: ${frameHeight}px;
      display: grid;
      grid-template-columns: 455px 1fr;
      gap: 56px;
      padding: 58px 72px;
      align-items: center;
      background:
        radial-gradient(circle at 86% 10%, rgba(119, 138, 80, .12), transparent 30%),
        linear-gradient(135deg, #f7f2ea 0%, #efe7d9 100%);
    }
    .copy { max-width: 460px; }
    .eyebrow {
      font-size: 18px;
      font-weight: 700;
      color: #5c7c4f;
      margin-bottom: 24px;
      letter-spacing: 0;
    }
    h1 {
      margin: 0 0 22px;
      font-size: 48px;
      line-height: 1.06;
      letter-spacing: 0;
      max-width: 455px;
    }
    p {
      margin: 0;
      font-size: 23px;
      line-height: 1.42;
      color: #4b5148;
      max-width: 445px;
    }
    .panel {
      width: 430px;
      max-height: 610px;
      justify-self: center;
      border: 1px solid rgba(32, 37, 29, .16);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 22px 55px rgba(32, 37, 29, .22);
      background: #fffdf8;
    }
    .panel img {
      display: block;
      width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <main class="stage">
    <section class="copy">
      <div class="eyebrow">AnyCap for Chrome</div>
      <h1>${escapeHTML(scene.title)}</h1>
      <p>${escapeHTML(scene.body)}</p>
    </section>
    <section class="panel">
      <img src="${imageURL}" alt="" />
    </section>
  </main>
</body>
</html>`;
}

async function renderFrames({ rootDir, frameDir }) {
  fs.mkdirSync(frameDir, { recursive: true });
  const browser = await chromium.launch(browserLaunchOptions());
  const frames = [];

  try {
    const page = await browser.newPage({ viewport: { width: frameWidth, height: frameHeight } });
    for (let i = 0; i < DEMO_SCENES.length; i++) {
      const scene = DEMO_SCENES[i];
      const imagePath = path.resolve(rootDir, scene.image);
      await page.setContent(frameHTML(scene, imageDataURL(imagePath)), { waitUntil: 'load' });
      await page.locator('.panel img').waitFor({ state: 'visible', timeout: 5_000 });
      const framePath = path.join(frameDir, `${String(i + 1).padStart(2, '0')}.png`);
      await page.screenshot({ path: framePath, clip: { x: 0, y: 0, width: frameWidth, height: frameHeight } });
      frames.push({ path: framePath, duration: scene.duration });
      console.log(`render-demo-video: wrote ${path.relative(rootDir, framePath)}`);
    }
  } finally {
    await browser.close();
  }

  return frames;
}

function writeConcatFile({ frames, concatPath }) {
  const lines = [];
  for (const frame of frames) {
    lines.push(`file '${concatFilePath(frame.path)}'`);
    lines.push(`duration ${frame.duration}`);
  }
  lines.push(`file '${concatFilePath(frames[frames.length - 1].path)}'`);
  fs.writeFileSync(concatPath, `${lines.join('\n')}\n`);
}

export async function renderDemoVideo({ rootDir = defaultRoot } = {}) {
  const frameDir = path.join(rootDir, '.output/demo-video-frames');
  const concatPath = path.join(frameDir, 'concat.txt');
  const outputPath = path.join(rootDir, DEMO_OUTPUT);
  const frames = await renderFrames({ rootDir, frameDir });
  writeConcatFile({ frames, concatPath });
  execFileSync('ffmpeg', buildFFmpegArgs({ concatPath, outputPath }), { stdio: 'inherit' });
  console.log(`render-demo-video: wrote ${DEMO_OUTPUT}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  renderDemoVideo().catch((err) => {
    console.error(`render-demo-video: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  });
}
