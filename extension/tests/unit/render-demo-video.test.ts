/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';

type DemoVideoModule = {
  DEMO_SCENES: Array<{
    title: string;
    image: string;
    duration: number;
    capabilities?: string[];
    menus?: string[];
  }>;
  DEMO_OUTPUT: string;
  browserLaunchOptions: () => { headless: boolean };
  buildFFmpegArgs: (opts: { concatPath: string; outputPath: string }) => string[];
};

async function loadRenderer(): Promise<DemoVideoModule> {
  // @ts-ignore JS CLI module is intentionally not part of the TS build.
  return import('../../scripts/render-demo-video.mjs');
}

describe('demo video renderer', () => {
  it('covers the full v0.2 capability and right-click menu surface', async () => {
    const { DEMO_SCENES } = await loadRenderer();
    const capabilities = new Set(DEMO_SCENES.flatMap((scene) => scene.capabilities ?? []));
    const menus = new Set(DEMO_SCENES.flatMap((scene) => scene.menus ?? []));

    expect([...capabilities].sort()).toEqual(['Crawl', 'Image', 'Music', 'Search', 'Settings', 'Vary', 'Video']);
    expect([...menus].sort()).toEqual([
      'crawl-link',
      'crawl-page',
      'image-from-text',
      'music-from-text',
      'search-selection',
      'vary-image',
      'video-from-text',
    ]);
  });

  it('uses headless Chromium and writes the local CWS demo MP4', async () => {
    const { DEMO_OUTPUT, browserLaunchOptions } = await loadRenderer();

    expect(browserLaunchOptions()).toMatchObject({ headless: true });
    expect(DEMO_OUTPUT).toBe('store-assets/demo.mp4');
  });

  it('targets a Chrome Web Store-friendly 60-120 second runtime', async () => {
    const { DEMO_SCENES } = await loadRenderer();
    const totalDuration = DEMO_SCENES.reduce((sum, scene) => sum + scene.duration, 0);

    expect(totalDuration).toBeGreaterThanOrEqual(60);
    expect(totalDuration).toBeLessThanOrEqual(120);
  });

  it('builds ffmpeg args for a browser-compatible silent slideshow video', async () => {
    const { buildFFmpegArgs } = await loadRenderer();

    expect(buildFFmpegArgs({ concatPath: '/tmp/demo.txt', outputPath: '/tmp/demo.mp4' })).toEqual([
      '-y',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      '/tmp/demo.txt',
      '-vf',
      'fps=30,format=yuv420p',
      '-movflags',
      '+faststart',
      '/tmp/demo.mp4',
    ]);
  });
});
