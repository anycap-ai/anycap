import { describe, it, expect, beforeEach, vi } from 'vitest';

const store = new Map<string, any>();

(globalThis as any).chrome = {
  storage: {
    local: {
      get: async (keys: string[]) =>
        Object.fromEntries(keys.map((k) => [k, store.get(k)])),
      set: async (items: Record<string, any>) => {
        Object.entries(items).forEach(([k, v]) => store.set(k, v));
      },
      remove: async (key: string) => {
        store.delete(key);
      },
    },
  },
  identity: {
    getRedirectURL: vi.fn(() => 'https://abc123.chromiumapp.org/'),
    launchWebAuthFlow: vi.fn(),
  },
};

describe('auth', () => {
  beforeEach(() => {
    store.clear();
    vi.clearAllMocks();
  });

  it('stores token on successful OAuth callback', async () => {
    const launchWebAuthFlow = (globalThis as any).chrome.identity.launchWebAuthFlow;
    launchWebAuthFlow.mockResolvedValue(
      'https://abc123.chromiumapp.org/#access_token=tok_abc&token_type=Bearer'
    );

    const { signIn } = await import('../../src/lib/auth');
    const token = await signIn();

    expect(token).toBe('tok_abc');
    expect(store.get('authToken')).toBe('tok_abc');
  });

  it('returns null when user cancels flow', async () => {
    const launchWebAuthFlow = (globalThis as any).chrome.identity.launchWebAuthFlow;
    launchWebAuthFlow.mockResolvedValue(undefined);

    const { signIn } = await import('../../src/lib/auth');
    const token = await signIn();

    expect(token).toBeNull();
    expect(store.has('authToken')).toBe(false);
  });

  it('removes token on sign out', async () => {
    store.set('authToken', 'tok_old');

    const { signOut } = await import('../../src/lib/auth');
    await signOut();

    expect(store.has('authToken')).toBe(false);
  });
});
