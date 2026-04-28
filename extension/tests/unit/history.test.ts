import { describe, it, expect, beforeEach } from 'vitest';

const store = new Map<string, any>();

(globalThis as any).chrome = {
  storage: {
    local: {
      get: async (keys: string[]) =>
        Object.fromEntries(keys.map((k) => [k, store.get(k)])),
      set: async (items: Record<string, any>) => {
        Object.entries(items).forEach(([k, v]) => store.set(k, v));
      },
    },
  },
};

describe('history', () => {
  beforeEach(() => {
    store.clear();
  });

  it('adds generation to history', async () => {
    const { addGeneration, getRecentGenerations } = await import(
      '../../src/lib/history'
    );
    await addGeneration({
      resultUrl: 'https://cdn.anycap.ai/1.png',
      srcUrl: 'https://example.com/img.png',
      ts: 1000,
    });
    const history = await getRecentGenerations();
    expect(history).toHaveLength(1);
    expect(history[0].resultUrl).toBe('https://cdn.anycap.ai/1.png');
  });

  it('prepends new generations', async () => {
    const { addGeneration, getRecentGenerations } = await import(
      '../../src/lib/history'
    );
    await addGeneration({ resultUrl: 'a', srcUrl: 's', ts: 1 });
    await addGeneration({ resultUrl: 'b', srcUrl: 's', ts: 2 });
    const history = await getRecentGenerations();
    expect(history[0].resultUrl).toBe('b');
    expect(history[1].resultUrl).toBe('a');
  });

  it('caps history at 30 items', async () => {
    const { addGeneration, getRecentGenerations } = await import(
      '../../src/lib/history'
    );
    for (let i = 0; i < 35; i++) {
      await addGeneration({ resultUrl: `${i}`, srcUrl: 's', ts: i });
    }
    const history = await getRecentGenerations();
    expect(history).toHaveLength(30);
    expect(history[0].resultUrl).toBe('34');
  });

  it('filters by kind via getRecentByKind', async () => {
    const { addGeneration, getRecentByKind } = await import(
      '../../src/lib/history'
    );
    await addGeneration({ kind: 'image', resultUrl: 'img', srcUrl: '', prompt: 'cat', ts: 1 });
    await addGeneration({ kind: 'video', resultUrl: 'vid', srcUrl: '', prompt: 'sea', ts: 2 });
    await addGeneration({ kind: 'image', resultUrl: 'img2', srcUrl: '', prompt: 'dog', ts: 3 });

    const images = await getRecentByKind('image');
    expect(images).toHaveLength(2);
    expect(images.map((r) => r.resultUrl)).toEqual(['img2', 'img']);

    const videos = await getRecentByKind('video');
    expect(videos).toHaveLength(1);
  });

  it('clearHistoryByKind preserves other kinds', async () => {
    const { addGeneration, getRecentByKind, clearHistoryByKind } = await import(
      '../../src/lib/history'
    );
    await addGeneration({ kind: 'image', resultUrl: 'img', srcUrl: '', ts: 1 });
    await addGeneration({ kind: 'video', resultUrl: 'vid', srcUrl: '', ts: 2 });
    await clearHistoryByKind('image');
    expect(await getRecentByKind('image')).toHaveLength(0);
    expect(await getRecentByKind('video')).toHaveLength(1);
  });

  it('clears history', async () => {
    const { addGeneration, clearHistory, getRecentGenerations } = await import(
      '../../src/lib/history'
    );
    await addGeneration({ resultUrl: 'a', srcUrl: 's', ts: 1 });
    await clearHistory();
    const history = await getRecentGenerations();
    expect(history).toHaveLength(0);
  });
});
