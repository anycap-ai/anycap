/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';

type RenderCWSAssetsModule = {
  CWS_SHOTS: Array<{ html: string; out: string; width: number; height: number }>;
  browserLaunchOptions: () => { headless: boolean };
};

async function loadRenderer(): Promise<RenderCWSAssetsModule> {
  // @ts-ignore JS CLI module is intentionally not part of the TS build.
  return import('../../scripts/render-cws-assets.mjs');
}

describe('CWS asset renderer', () => {
  it('renders all Chrome Web Store assets with required dimensions', async () => {
    const { CWS_SHOTS } = await loadRenderer();

    expect(CWS_SHOTS).toEqual([
      { html: '01-hero.html', out: '01-hero-1280x800.png', width: 1280, height: 800 },
      { html: '02-rightclick.html', out: '02-rightclick-1280x800.png', width: 1280, height: 800 },
      { html: '03-templates.html', out: '03-templates-1280x800.png', width: 1280, height: 800 },
      { html: '04-history.html', out: '04-history-1280x800.png', width: 1280, height: 800 },
      { html: '05-marquee.html', out: '05-marquee-1400x560.png', width: 1400, height: 560 },
      { html: '06-promo.html', out: '06-promo-440x280.png', width: 440, height: 280 },
    ]);
  });

  it('uses headless Chromium so CWS rendering does not open a browser window', async () => {
    const { browserLaunchOptions } = await loadRenderer();

    expect(browserLaunchOptions()).toMatchObject({ headless: true });
  });
});
