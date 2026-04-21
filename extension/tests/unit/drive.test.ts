import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { saveToDrive } from '../../src/lib/drive';
import { API_BASE } from '../../src/lib/constants';

const server = setupServer();

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

describe('saveToDrive', () => {
  beforeEach(() => {
    store.clear();
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
    server.close();
  });

  it('throws when not signed in', async () => {
    await expect(saveToDrive('https://cdn.anycap.ai/1.png')).rejects.toThrow(
      'Sign in required',
    );
  });

  it('presigns, uploads, and completes', async () => {
    const { setStored } = await import('../../src/lib/storage');
    await setStored('authToken', 'tok_123');

    let presignCalled = false;
    let uploadCalled = false;
    let completeCalled = false;

    // Mock the generated image fetch
    server.use(
      http.get('https://cdn.anycap.ai/1.png', () => {
        return new HttpResponse(new Blob(['fake-image'], { type: 'image/png' }), {
          headers: { 'content-type': 'image/png' },
        });
      }),
    );

    // Mock presign
    server.use(
      http.post(`${API_BASE}/v1/drive/files/presign`, async ({ request }) => {
        const body = (await request.json()) as any;
        expect(body.name).toMatch(/^anycap-\d+\.png$/);
        expect(body.content_type).toBe('image/png');
        presignCalled = true;
        return HttpResponse.json({
          data: {
            upload_session_id: 'upl_abc',
            file_id: 'dn_123',
            upload_url: 'https://storage.anycap.cloud/upload/xyz',
            object_url: 'https://drive.anycap.cloud/s/dn_123',
            expires_in: 300,
          },
        });
      }),
    );

    // Mock upload to presigned URL
    server.use(
      http.put('https://storage.anycap.cloud/upload/xyz', async ({ request }) => {
        uploadCalled = true;
        const blob = await request.blob();
        expect(blob.size).toBeGreaterThan(0);
        return new HttpResponse(null, { status: 200 });
      }),
    );

    // Mock complete
    server.use(
      http.post(`${API_BASE}/v1/drive/files/complete`, async ({ request }) => {
        const body = (await request.json()) as any;
        expect(body.upload_session_id).toBe('upl_abc');
        expect(body.file_id).toBe('dn_123');
        completeCalled = true;
        return HttpResponse.json({ data: { id: 'dn_123' } });
      }),
    );

    const result = await saveToDrive('https://cdn.anycap.ai/1.png');
    expect(result.nodeId).toBe('dn_123');
    expect(result.objectUrl).toBe('https://drive.anycap.cloud/s/dn_123');
    expect(presignCalled).toBe(true);
    expect(uploadCalled).toBe(true);
    expect(completeCalled).toBe(true);
  });

  it('throws on presign failure', async () => {
    const { setStored } = await import('../../src/lib/storage');
    await setStored('authToken', 'tok_123');

    server.use(
      http.get('https://cdn.anycap.ai/2.png', () => {
        return new HttpResponse(new Blob(['x'], { type: 'image/png' }), {
          headers: { 'content-type': 'image/png' },
        });
      }),
      http.post(`${API_BASE}/v1/drive/files/presign`, () => {
        return new HttpResponse(null, { status: 403 });
      }),
    );

    await expect(saveToDrive('https://cdn.anycap.ai/2.png')).rejects.toMatchObject({
      status: 403,
    });
  });
});
