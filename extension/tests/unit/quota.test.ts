import { describe, it, expect, beforeEach } from 'vitest';
import { MAX_ANON_TRIALS } from '../../src/lib/constants';

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

describe('quota', () => {
  beforeEach(() => {
    store.clear();
  });

  it('authed user has infinite remaining trials', async () => {
    const { setStored } = await import('../../src/lib/storage');
    await setStored('authToken', 'tok_123');

    const { getAuthState, canGenerate } = await import('../../src/lib/quota');
    const state = await getAuthState();
    expect(state.isAuthed).toBe(true);
    expect(state.remainingTrials).toBe(Infinity);
    expect(await canGenerate()).toBe(true);
  });

  it('anonymous user starts with full trials', async () => {
    const { getAuthState, canGenerate } = await import('../../src/lib/quota');
    const state = await getAuthState();
    expect(state.isAuthed).toBe(false);
    expect(state.remainingTrials).toBe(MAX_ANON_TRIALS);
    expect(await canGenerate()).toBe(true);
  });

  it('decrements remaining trials after increment', async () => {
    const { incrementTrial, getAuthState } = await import('../../src/lib/quota');
    await incrementTrial();
    const state = await getAuthState();
    expect(state.remainingTrials).toBe(MAX_ANON_TRIALS - 1);
  });

  it('blocks generation when trials exhausted', async () => {
    const { incrementTrial, canGenerate } = await import('../../src/lib/quota');
    for (let i = 0; i < MAX_ANON_TRIALS; i++) {
      await incrementTrial();
    }
    expect(await canGenerate()).toBe(false);
  });

  it('resets trials after 30 days', async () => {
    const { setStored } = await import('../../src/lib/storage');
    const thirtyOneDaysAgo = Date.now() - 31 * 24 * 60 * 60 * 1000;
    await setStored('trialCount', MAX_ANON_TRIALS);
    await setStored('trialFirstUsedAt', thirtyOneDaysAgo);

    const { getAuthState } = await import('../../src/lib/quota');
    const state = await getAuthState();
    expect(state.remainingTrials).toBe(MAX_ANON_TRIALS);
  });
});
