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
    },
  },
};

describe('install-id', () => {
  beforeEach(() => {
    store.clear();
    vi.resetModules();
  });

  it('generates a UUID on first call and returns the same one subsequently', async () => {
    const { getOrCreateInstallId } = await import('../../src/lib/install-id');
    const first = await getOrCreateInstallId();
    expect(first).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
    const second = await getOrCreateInstallId();
    expect(second).toBe(first);
  });
});
