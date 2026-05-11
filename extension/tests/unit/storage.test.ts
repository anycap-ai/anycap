import { describe, it, expect, beforeEach, vi } from 'vitest';

const store = new Map<string, any>();

(globalThis as any).chrome = {
  storage: {
    local: {
      get: vi.fn(async (keys: string[]) =>
        Object.fromEntries(keys.map((k) => [k, store.get(k)]))
      ),
      set: vi.fn(async (items: Record<string, any>) => {
        Object.entries(items).forEach(([k, v]) => store.set(k, v));
      }),
      remove: vi.fn(async (key: string) => {
        store.delete(key);
      }),
    },
  },
};

describe('storage', () => {
  beforeEach(() => {
    store.clear();
  });

  it('reads/writes typed values', async () => {
    const { setStored, getStored } = await import('../../src/lib/storage');
    await setStored('trialCount', 2);
    expect(await getStored('trialCount')).toBe(2);
  });

  it('returns default for missing key', async () => {
    const { getStored } = await import('../../src/lib/storage');
    expect(await getStored('trialCount')).toBe(0);
    expect(await getStored('authToken')).toBeNull();
    expect(await getStored('onboardingCompleted')).toBe(false);
  });

  it('removes a key', async () => {
    const { setStored, removeStored, getStored } = await import(
      '../../src/lib/storage'
    );
    await setStored('apiKey', 'secret');
    expect(await getStored('apiKey')).toBe('secret');
    await removeStored('apiKey');
    expect(await getStored('apiKey')).toBeNull();
  });
});
