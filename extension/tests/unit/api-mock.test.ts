import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  generateImageMock,
  generateVideoMock,
  generateMusicMock,
  searchWebMock,
  crawlPageMock,
  generateVariationMock,
  fetchExtensionConfigMock,
} from '../../src/lib/api-mock';

async function resolveDelayed<T>(promise: Promise<T>): Promise<T> {
  await vi.runAllTimersAsync();
  return promise;
}

describe('api-mock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('generateVariationMock returns image output', async () => {
    const r = await resolveDelayed(generateVariationMock({ prompt: 'a', model: 'm', images: [] }));
    expect(r.outputs[0].type).toBe('image');
    expect(r.outputs[0].url).toMatch(/^https:\/\/picsum\.photos\//);
  });

  it('generateImageMock returns image output', async () => {
    const r = await resolveDelayed(generateImageMock({ prompt: 'cat', model: 'nano-banana-2', aspectRatio: '1:1' }));
    expect(r.outputs[0].type).toBe('image');
    expect(r.outputs[0].url).toMatch(/^https:\/\/picsum\.photos\//);
  });

  it('generateVideoMock returns video with poster', async () => {
    const r = await resolveDelayed(generateVideoMock({ prompt: 'sea', model: 'veo-3-1', durationSeconds: 5 }));
    expect(r.outputs[0].type).toBe('video');
    expect(r.outputs[0].url).toMatch(/\.mp4$/);
    expect(r.outputs[0].poster).toMatch(/^https:\/\/picsum/);
  }, 10_000);

  it('generateMusicMock returns audio with duration', async () => {
    const r = await resolveDelayed(generateMusicMock({ prompt: 'jazz', model: 'lyria-2', durationSeconds: 30 }));
    expect(r.outputs[0].type).toBe('audio');
    expect(r.outputs[0].url).toMatch(/^https?:/);
    expect(r.outputs[0].duration_seconds).toBe(30);
  });

  it('searchWebMock returns ≥4 result objects with url+title+snippet', async () => {
    const r = await resolveDelayed(searchWebMock({ query: 'agent capability runtime' }));
    expect(r.results.length).toBeGreaterThanOrEqual(4);
    for (const item of r.results) {
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.url).toMatch(/^https?:/);
      expect(item.snippet.length).toBeGreaterThan(20);
    }
  });

  it('crawlPageMock extracts host into title and produces markdown', async () => {
    const r = await resolveDelayed(crawlPageMock({ url: 'https://example.org/foo' }));
    expect(r.title).toContain('example.org');
    expect(r.markdown).toContain('# ');
    expect(r.word_count).toBeGreaterThan(1000);
    expect(r.language).toBe('en');
  });

  it('fetchExtensionConfigMock returns sane defaults', async () => {
    const r = await resolveDelayed(fetchExtensionConfigMock());
    expect(r.default_model).toMatch(/.+/);
    expect(r.min_image_dim).toBe(256);
  });
});
