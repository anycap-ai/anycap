/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';

type SmokeModule = {
  runServerSmoke: (opts: {
    baseUrl: string;
    installId: string;
    includeImage?: boolean;
    includeMedia?: boolean;
    fetchImpl: typeof fetch;
    nowImpl?: () => number;
  }) => Promise<{
    ok: boolean;
    target?: { baseUrl: string; installId: string };
    results: Array<{ name: string; ok: boolean; status: number; code?: string; message?: string; duration_ms?: number }>;
  }>;
  formatServerSmokeResult: (result: {
    target: { baseUrl: string; installId: string };
    results: Array<{
      name: string;
      ok: boolean;
      status: number;
      code?: string;
      message?: string;
      hint?: string;
      duration_ms?: number;
    }>;
  }) => { stdout: string[]; stderr: string[] };
};

const requiredFeatures = {
  'image.generate': true,
  'video.generate': true,
  'music.generate': true,
  'web.search': true,
  'web.crawl': true,
};

async function loadSmoke(): Promise<SmokeModule> {
  // @ts-ignore JS CLI module is intentionally not part of the TS build.
  return import('../../scripts/smoke-server.mjs');
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('server smoke script', () => {
  it('returns normalized target context for traceable smoke logs', async () => {
    const { runServerSmoke } = await loadSmoke();
    const fetchImpl = async (url: URL | RequestInfo) => {
      const rawUrl = String(url);
      if (rawUrl.endsWith('/v1/features')) {
        return jsonResponse(200, { status: 'success', data: { features: requiredFeatures } });
      }
      if (rawUrl.endsWith('/v1/extension/config')) {
        return jsonResponse(200, {
          status: 'success',
          data: { default_prompt: 'prompt', default_model: 'nano-banana-2', min_image_dim: 256 },
        });
      }
      if (rawUrl.endsWith('/v1/web/search')) {
        return jsonResponse(200, { status: 'success', data: { query: 'AnyCap', results: [] } });
      }
      return jsonResponse(200, {
        status: 'success',
        data: { url: 'https://example.com/', title: 'Example Domain', markdown: '# Example Domain' },
      });
    };

    const result = await runServerSmoke({
      baseUrl: 'https://api-staging.anycap.ai/',
      installId: 'smoke-trace',
      fetchImpl: fetchImpl as typeof fetch,
    });

    expect(result.target).toEqual({
      baseUrl: 'https://api-staging.anycap.ai',
      installId: 'smoke-trace',
    });
  });

  it('retries transient network failures once before recording a failed check', async () => {
    const { runServerSmoke } = await loadSmoke();
    let extensionConfigCalls = 0;
    const fetchImpl = async (url: URL | RequestInfo) => {
      const rawUrl = String(url);
      if (rawUrl.endsWith('/v1/features')) {
        return jsonResponse(200, { status: 'success', data: { features: requiredFeatures } });
      }
      if (rawUrl.endsWith('/v1/extension/config')) {
        extensionConfigCalls += 1;
        if (extensionConfigCalls === 1) throw new TypeError('fetch failed');
        return jsonResponse(200, {
          status: 'success',
          data: { default_prompt: 'prompt', default_model: 'nano-banana-2', min_image_dim: 256 },
        });
      }
      if (rawUrl.endsWith('/v1/web/search')) {
        return jsonResponse(200, { status: 'success', data: { query: 'AnyCap', results: [] } });
      }
      return jsonResponse(200, {
        status: 'success',
        data: { url: 'https://example.com/', title: 'Example Domain', markdown: '# Example Domain' },
      });
    };

    const result = await runServerSmoke({
      baseUrl: 'https://api-staging.anycap.ai',
      installId: 'smoke-install',
      fetchImpl: fetchImpl as typeof fetch,
    });

    expect(result.ok).toBe(true);
    expect(extensionConfigCalls).toBe(2);
  });

  it('checks required features, anonymous extension config, search, and crawl with extension headers', async () => {
    const { runServerSmoke } = await loadSmoke();
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const fetchImpl = async (url: URL | RequestInfo, init?: RequestInit) => {
      const rawUrl = String(url);
      calls.push({ url: rawUrl, init });
      if (rawUrl.endsWith('/v1/features')) {
        return jsonResponse(200, { status: 'success', data: { features: requiredFeatures } });
      }
      if (rawUrl.endsWith('/v1/extension/config')) {
        return jsonResponse(200, {
          status: 'success',
          data: {
            default_prompt: 'create a stylistic variation of this image',
            default_model: 'nano-banana-2',
            min_image_dim: 256,
          },
        });
      }
      if (rawUrl.endsWith('/v1/web/search')) {
        return jsonResponse(200, {
          status: 'success',
          data: { query: 'AnyCap', results: [{ title: 'AnyCap', url: 'https://anycap.ai', description: 'AI runtime' }] },
        });
      }
      return jsonResponse(200, {
        status: 'success',
        data: { url: 'https://example.com/', title: 'Example Domain', markdown: '# Example Domain' },
      });
    };

    const result = await runServerSmoke({
      baseUrl: 'https://api-staging.anycap.ai',
      installId: 'smoke-install',
      fetchImpl: fetchImpl as typeof fetch,
    });

    expect(result.ok).toBe(true);
    expect(calls.map((c) => c.url)).toEqual([
      'https://api-staging.anycap.ai/v1/features',
      'https://api-staging.anycap.ai/v1/extension/config',
      'https://api-staging.anycap.ai/v1/web/search',
      'https://api-staging.anycap.ai/v1/web/crawl',
    ]);
    for (const call of calls) {
      expect((call.init?.headers as Record<string, string>)['X-Anycap-Source']).toBe('chrome-extension');
      expect((call.init?.headers as Record<string, string>)['X-Anycap-Install-Id']).toBe('smoke-install');
    }
    expect(calls[2].init?.method).toBe('POST');
    expect(JSON.parse(String(calls[2].init?.body))).toEqual({ query: 'AnyCap', max_results: 4, crawl_results: 0 });
    expect(JSON.parse(String(calls[3].init?.body))).toEqual({ url: 'https://example.com/' });
  });

  it('records per-check durations for browser-free latency evidence', async () => {
    const { runServerSmoke } = await loadSmoke();
    let now = 1000;
    const fetchImpl = async (url: URL | RequestInfo) => {
      const rawUrl = String(url);
      if (rawUrl.endsWith('/v1/features')) {
        return jsonResponse(200, { status: 'success', data: { features: requiredFeatures } });
      }
      if (rawUrl.endsWith('/v1/extension/config')) {
        return jsonResponse(200, {
          status: 'success',
          data: { default_prompt: 'prompt', default_model: 'nano-banana-2', min_image_dim: 256 },
        });
      }
      if (rawUrl.endsWith('/v1/web/search')) {
        return jsonResponse(200, { status: 'success', data: { query: 'AnyCap', results: [] } });
      }
      return jsonResponse(200, {
        status: 'success',
        data: { url: 'https://example.com/', title: 'Example Domain', markdown: '# Example Domain' },
      });
    };

    const result = await runServerSmoke({
      baseUrl: 'https://api-staging.anycap.ai',
      installId: 'smoke-install',
      fetchImpl: fetchImpl as typeof fetch,
      nowImpl: () => {
        now += 25;
        return now;
      },
    });

    expect(result.results.map((item) => item.duration_ms)).toEqual([25, 25, 25, 25]);
  });

  it('formats CLI smoke output with per-check durations for success and failure lines', async () => {
    const { formatServerSmokeResult } = await loadSmoke();

    expect(
      formatServerSmokeResult({
        target: { baseUrl: 'https://api.anycap.ai', installId: 'smoke-install' },
        results: [
          { name: 'required features', ok: true, status: 200, duration_ms: 17 },
          {
            name: 'web search',
            ok: false,
            status: 401,
            duration_ms: 23,
            code: 'AUTH_INVALID',
            message: 'missing or invalid bearer token',
          },
        ],
      }),
    ).toEqual({
      stdout: [
        'server smoke: ok target - base-url=https://api.anycap.ai install-id=smoke-install',
        'server smoke: ok required features (200) in 17ms',
      ],
      stderr: ['server smoke: fail web search (401) in 23ms AUTH_INVALID - missing or invalid bearer token'],
    });
  });

  it('fails when required Chrome extension features are missing or disabled', async () => {
    const { runServerSmoke } = await loadSmoke();
    const fetchImpl = async (url: URL | RequestInfo) => {
      if (String(url).endsWith('/v1/features')) {
        return jsonResponse(200, {
          status: 'success',
          data: {
            features: {
              ...requiredFeatures,
              'web.crawl': false,
            },
          },
        });
      }
      return jsonResponse(200, { status: 'success', data: {} });
    };

    const result = await runServerSmoke({
      baseUrl: 'https://api-staging.anycap.ai',
      installId: 'smoke-install',
      fetchImpl: fetchImpl as typeof fetch,
    });

    expect(result.ok).toBe(false);
    expect(result.results[0]).toMatchObject({
      name: 'required features',
      ok: false,
      status: 200,
      code: 'FEATURES_MISSING',
      message: 'disabled or missing features: web.crawl',
    });
  });

  it('fails when smoke endpoints return success envelopes with malformed data', async () => {
    const { runServerSmoke } = await loadSmoke();
    const fetchImpl = async (url: URL | RequestInfo) => {
      if (String(url).endsWith('/v1/features')) {
        return jsonResponse(200, { status: 'success', data: { features: requiredFeatures } });
      }
      return jsonResponse(200, { status: 'success', data: {} });
    };

    const result = await runServerSmoke({
      baseUrl: 'https://api-staging.anycap.ai',
      installId: 'smoke-install',
      fetchImpl: fetchImpl as typeof fetch,
    });

    expect(result.ok).toBe(false);
    expect(result.results[1]).toMatchObject({
      name: 'extension config',
      ok: false,
      status: 200,
      code: 'EXTENSION_CONFIG_INVALID',
    });
    expect(result.results[2]).toMatchObject({
      name: 'web search',
      ok: false,
      status: 200,
      code: 'WEB_SEARCH_INVALID',
    });
    expect(result.results[3]).toMatchObject({
      name: 'web crawl',
      ok: false,
      status: 200,
      code: 'WEB_CRAWL_INVALID',
    });
  });

  it('runs image generation only when explicitly requested', async () => {
    const { runServerSmoke } = await loadSmoke();
    const calls: string[] = [];
    const fetchImpl = async (url: URL | RequestInfo) => {
      calls.push(String(url));
      return jsonResponse(200, { status: 'success', data: { outputs: [{ url: 'https://example.com/out.png' }] } });
    };

    await runServerSmoke({
      baseUrl: 'https://api-staging.anycap.ai',
      installId: 'smoke-install',
      includeImage: true,
      fetchImpl: fetchImpl as typeof fetch,
    });

    expect(calls).toContain('https://api-staging.anycap.ai/v1/image/generate');
  });

  it('runs image, video, and music generation only when media checks are explicitly requested', async () => {
    const { runServerSmoke } = await loadSmoke();
    const calls: Array<{ url: string; body: unknown }> = [];
    const fetchImpl = async (url: URL | RequestInfo, init?: RequestInit) => {
      calls.push({ url: String(url), body: init?.body ? JSON.parse(String(init.body)) : null });
      return jsonResponse(200, { status: 'success', data: { outputs: [{ url: 'https://example.com/out' }] } });
    };

    await runServerSmoke({
      baseUrl: 'https://api-staging.anycap.ai',
      installId: 'smoke-install',
      includeMedia: true,
      fetchImpl: fetchImpl as typeof fetch,
    });

    expect(calls.map((call) => call.url)).toEqual([
      'https://api-staging.anycap.ai/v1/features',
      'https://api-staging.anycap.ai/v1/extension/config',
      'https://api-staging.anycap.ai/v1/image/generate',
      'https://api-staging.anycap.ai/v1/video/generate',
      'https://api-staging.anycap.ai/v1/music/generate',
    ]);
    expect(calls[3].body).toMatchObject({ model: 'veo-3.1-fast' });
    expect(calls[4].body).toMatchObject({ model: 'music-1.5' });
  });

  it('returns a failed summary with server error details', async () => {
    const { runServerSmoke } = await loadSmoke();
    const fetchImpl = async (url: URL | RequestInfo) => {
      if (String(url).endsWith('/v1/features')) {
        return jsonResponse(200, { status: 'success', data: { features: requiredFeatures } });
      }
      return jsonResponse(403, {
        status: 'error',
        error: { code: 'FEATURE_NOT_ALLOWED', message: 'not rolled out' },
      });
    };

    const result = await runServerSmoke({
      baseUrl: 'https://api-staging.anycap.ai',
      installId: 'smoke-install',
      fetchImpl: fetchImpl as typeof fetch,
    });

    expect(result.ok).toBe(false);
    expect(result.results[1]).toMatchObject({
      name: 'extension config',
      ok: false,
      status: 403,
      code: 'FEATURE_NOT_ALLOWED',
    });
  });
});
