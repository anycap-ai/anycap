import { describe, it, expect, beforeEach, vi } from 'vitest';

const sentMessages: any[] = [];
const messageListeners: Array<(msg: any) => void> = [];

(globalThis as any).chrome = {
  runtime: {
    sendMessage: vi.fn((msg: any) => {
      sentMessages.push(msg);
      return Promise.resolve();
    }),
    onMessage: {
      addListener: vi.fn((fn: any) => {
        messageListeners.push(fn);
      }),
    },
  },
};

// Mock WXT's defineContentScript to execute main immediately
vi.mock('wxt/utils/define-content-script', () => ({
  defineContentScript: ({ main }: { main: () => void }) => {
    main();
    return {};
  },
}));

describe('content script', () => {
  beforeEach(() => {
    sentMessages.length = 0;
    messageListeners.length = 0;
    vi.clearAllMocks();
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('sends ANYCAP_START_GENERATION when invoked with a valid image', async () => {
    await import('../../entrypoints/content');

    const img = document.createElement('img');
    img.src = 'https://example.com/photo.jpg';
    Object.defineProperty(img, 'naturalWidth', { value: 800 });
    Object.defineProperty(img, 'naturalHeight', { value: 600 });
    document.body.appendChild(img);

    const contextEvent = new MouseEvent('contextmenu', { bubbles: true });
    img.dispatchEvent(contextEvent);

    expect(messageListeners.length).toBeGreaterThan(0);
    messageListeners[0]({ type: 'ANYCAP_INVOKE_VARIATION' });

    expect(sentMessages).toHaveLength(1);
    expect(sentMessages[0].type).toBe('ANYCAP_START_GENERATION');
    expect(sentMessages[0].image.srcUrl).toBe('https://example.com/photo.jpg');
    expect(sentMessages[0].image.width).toBe(800);
    expect(sentMessages[0].image.height).toBe(600);
  });

  it('ignores images that are too small', async () => {
    await import('../../entrypoints/content');

    const img = document.createElement('img');
    img.src = 'https://example.com/tiny.jpg';
    Object.defineProperty(img, 'naturalWidth', { value: 100 });
    Object.defineProperty(img, 'naturalHeight', { value: 100 });
    document.body.appendChild(img);

    const contextEvent = new MouseEvent('contextmenu', { bubbles: true });
    img.dispatchEvent(contextEvent);

    if (messageListeners.length > 0) {
      messageListeners[0]({ type: 'ANYCAP_INVOKE_VARIATION' });
    }

    expect(sentMessages).toHaveLength(0);
  });

  it('ignores non-image elements', async () => {
    await import('../../entrypoints/content');

    const div = document.createElement('div');
    div.style.width = '800px';
    div.style.height = '600px';
    document.body.appendChild(div);

    const contextEvent = new MouseEvent('contextmenu', { bubbles: true });
    div.dispatchEvent(contextEvent);

    if (messageListeners.length > 0) {
      messageListeners[0]({ type: 'ANYCAP_INVOKE_VARIATION' });
    }

    expect(sentMessages).toHaveLength(0);
  });
});
