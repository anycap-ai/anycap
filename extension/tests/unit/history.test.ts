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

  it('caps history at 10 items', async () => {
    const { addGeneration, getRecentGenerations } = await import(
      '../../src/lib/history'
    );
    for (let i = 0; i < 15; i++) {
      await addGeneration({ resultUrl: `${i}`, srcUrl: 's', ts: i });
    }
    const history = await getRecentGenerations();
    expect(history).toHaveLength(10);
    expect(history[0].resultUrl).toBe('14');
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
