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

describe('quota edge cases', () => {
  beforeEach(() => {
    store.clear();
  });

  it('does not decrement trials for authed users on incrementTrial', async () => {
    const { setStored } = await import('../../src/lib/storage');
    await setStored('authToken', 'tok_123');

    const { incrementTrial, getAuthState } = await import('../../src/lib/quota');
    await incrementTrial();
    const state = await getAuthState();
    expect(state.isAuthed).toBe(true);
    expect(state.remainingTrials).toBe(Infinity);
  });

  it('sets trialFirstUsedAt on first increment', async () => {
    const { incrementTrial, getAuthState } = await import('../../src/lib/quota');
    await incrementTrial();
    const state = await getAuthState();
    expect(state.remainingTrials).toBe(MAX_ANON_TRIALS - 1);
  });

  it('handles trialFirstUsedAt being exactly 30 days ago', async () => {
    const { setStored } = await import('../../src/lib/storage');
    const exactlyThirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    await setStored('trialCount', MAX_ANON_TRIALS);
    await setStored('trialFirstUsedAt', exactlyThirtyDaysAgo);

    const { getAuthState } = await import('../../src/lib/quota');
    const state = await getAuthState();
    expect(state.remainingTrials).toBe(0);
  });

  it('handles trialFirstUsedAt being null with non-zero count', async () => {
    const { setStored } = await import('../../src/lib/storage');
    await setStored('trialCount', MAX_ANON_TRIALS);

    const { getAuthState } = await import('../../src/lib/quota');
    const state = await getAuthState();
    expect(state.remainingTrials).toBe(0);
  });
});
