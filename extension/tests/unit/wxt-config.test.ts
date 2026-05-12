import { describe, expect, it, vi, afterEach } from 'vitest';

async function loadConfig(env: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) {
      vi.stubEnv(key, '');
    } else {
      vi.stubEnv(key, value);
    }
  }
  const mod = await import('../../wxt.config');
  return mod.default as { manifest?: { host_permissions?: string[] } };
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('wxt config', () => {
  it('allows the WXT_API_BASE origin in non-release builds', async () => {
    const config = await loadConfig({
      WXT_RELEASE: undefined,
      WXT_API_BASE: 'https://api-staging.anycap.ai',
    });

    expect(config.manifest?.host_permissions).toContain('https://api-staging.anycap.ai/*');
  }, 15000);

  it('keeps release host permissions limited to production origins', async () => {
    const config = await loadConfig({
      WXT_RELEASE: 'true',
      WXT_API_BASE: 'https://api-staging.anycap.ai',
    });

    expect(config.manifest?.host_permissions).toEqual([
      'https://api.anycap.ai/*',
      'https://anycap.ai/*',
    ]);
  }, 15000);
});
