import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { API_BASE } from '../../src/lib/constants';

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

const server = setupServer();

describe('api', () => {
  beforeEach(() => {
    store.clear();
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
    server.close();
  });

  it('generateVariation sends install-id header when anonymous', async () => {
    let capturedHeaders: Headers | null = null;
    server.use(
      http.post(`${API_BASE}/v1/image/generate`, async ({ request }) => {
        capturedHeaders = request.headers;
        return HttpResponse.json({
          id: 'req_1',
          status: 'success',
          data: {
            id: 'gen_1',
            status: 'completed',
            model: 'nano-banana-2',
            outputs: [{ type: 'image', url: 'https://cdn.anycap.ai/1.png', mime_type: 'image/png' }],
          },
        });
      })
    );

    const { generateVariation } = await import('../../src/lib/api');
    const result = await generateVariation({
      prompt: 'test',
      model: 'nano-banana-2',
      images: ['https://example.com/img.png'],
    });

    expect(capturedHeaders!.get('X-Anycap-Install-Id')).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
    expect(result.outputs[0].url).toBe('https://cdn.anycap.ai/1.png');
  });

  it('generateVariation sends Authorization header when authed', async () => {
    let capturedHeaders: Headers | null = null;
    server.use(
      http.post(`${API_BASE}/v1/image/generate`, async ({ request }) => {
        capturedHeaders = request.headers;
        return HttpResponse.json({
          id: 'req_2',
          status: 'success',
          data: {
            id: 'gen_2',
            status: 'completed',
            model: 'nano-banana-2',
            outputs: [],
          },
        });
      })
    );

    store.set('authToken', 'tok_abc');
    const { generateVariation } = await import('../../src/lib/api');
    await generateVariation({ prompt: 'test', model: 'm', images: [] });

    expect(capturedHeaders!.get('Authorization')).toBe('Bearer tok_abc');
    expect(capturedHeaders!.get('X-Anycap-Install-Id')).toBeNull();
  });

  it('throws TRIAL_EXHAUSTED on 429', async () => {
    server.use(
      http.post(`${API_BASE}/v1/image/generate`, () =>
        HttpResponse.json(
          {
            id: 'req_3',
            status: 'error',
            error: { code: 'RATE_LIMITED', message: 'Trial exhausted' },
          },
          { status: 429 }
        )
      )
    );

    const { generateVariation } = await import('../../src/lib/api');
    await expect(
      generateVariation({ prompt: 'test', model: 'm', images: [] })
    ).rejects.toMatchObject({ code: 'TRIAL_EXHAUSTED' });
  });

  it('throws SERVER_ERROR on 500', async () => {
    server.use(
      http.post(`${API_BASE}/v1/image/generate`, () =>
        HttpResponse.json(
          {
            id: 'req_4',
            status: 'error',
            error: { code: 'INTERNAL', message: 'boom' },
          },
          { status: 500 }
        )
      )
    );

    const { generateVariation } = await import('../../src/lib/api');
    await expect(
      generateVariation({ prompt: 'test', model: 'm', images: [] })
    ).rejects.toMatchObject({ code: 'SERVER_ERROR' });
  });

  it('fetches extension config', async () => {
    server.use(
      http.get(`${API_BASE}/v1/extension/config`, () =>
        HttpResponse.json({
          id: 'req_5',
          status: 'success',
          data: { default_prompt: 'hello', default_model: 'm1', min_image_dim: 128 },
        })
      )
    );

    const { fetchExtensionConfig } = await import('../../src/lib/api');
    const cfg = await fetchExtensionConfig();
    expect(cfg.default_model).toBe('m1');
    expect(cfg.min_image_dim).toBe(128);
  });
});
