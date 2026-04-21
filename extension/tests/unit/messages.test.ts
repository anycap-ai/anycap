import { describe, it, expect } from 'vitest';
import { isStartGeneration } from '../../src/lib/messages';

describe('message protocol', () => {
  it('narrows ANYCAP_START_GENERATION correctly', () => {
    const msg: unknown = {
      type: 'ANYCAP_START_GENERATION',
      image: { srcUrl: 'https://example.com/img.png', width: 300, height: 300 },
      pageUrl: 'https://example.com',
    };
    expect(isStartGeneration(msg)).toBe(true);
    if (isStartGeneration(msg)) {
      expect(msg.image.srcUrl).toBe('https://example.com/img.png');
    }
  });

  it('rejects malformed messages', () => {
    expect(isStartGeneration({ type: 'WRONG' })).toBe(false);
    expect(isStartGeneration(null)).toBe(false);
    expect(isStartGeneration({ type: 'ANYCAP_START_GENERATION' })).toBe(false);
    expect(isStartGeneration({
      type: 'ANYCAP_START_GENERATION',
      image: { srcUrl: 'x', width: 'not-a-number', height: 300 },
    })).toBe(false);
  });
});
