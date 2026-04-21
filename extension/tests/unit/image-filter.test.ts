import { describe, it, expect } from 'vitest';
import { shouldShowMenu, type ImageInfo } from '@/src/lib/image-filter';

function img(partial: Partial<ImageInfo> & { src: string }): ImageInfo {
  return {
    naturalWidth: 512,
    naturalHeight: 512,
    ...partial,
  };
}

describe('shouldShowMenu', () => {
  it('rejects images smaller than 256px', () => {
    expect(
      shouldShowMenu(img({ src: 'https://example.com/a.png', naturalWidth: 255, naturalHeight: 512 }))
    ).toBe(false);
    expect(
      shouldShowMenu(img({ src: 'https://example.com/a.png', naturalWidth: 512, naturalHeight: 255 }))
    ).toBe(false);
    expect(
      shouldShowMenu(img({ src: 'https://example.com/a.png', naturalWidth: 256, naturalHeight: 256 }))
    ).toBe(true);
  });

  it('rejects SVG', () => {
    expect(shouldShowMenu(img({ src: 'https://example.com/a.svg' }))).toBe(false);
  });

  it('rejects file:// URLs', () => {
    expect(shouldShowMenu(img({ src: 'file:///Users/me/a.png' }))).toBe(false);
  });

  it('accepts PNG, JPG, JPEG, WEBP >= 256px', () => {
    expect(shouldShowMenu(img({ src: 'https://example.com/a.png' }))).toBe(true);
    expect(shouldShowMenu(img({ src: 'https://example.com/a.jpg' }))).toBe(true);
    expect(shouldShowMenu(img({ src: 'https://example.com/a.jpeg' }))).toBe(true);
    expect(shouldShowMenu(img({ src: 'https://example.com/a.webp' }))).toBe(true);
  });

  it('accepts data: URLs for png, jpeg', () => {
    expect(
      shouldShowMenu(img({ src: 'data:image/png;base64,abc123' }))
    ).toBe(true);
    expect(
      shouldShowMenu(img({ src: 'data:image/jpeg;base64,abc123' }))
    ).toBe(true);
    expect(
      shouldShowMenu(img({ src: 'data:image/webp;base64,abc123' }))
    ).toBe(true);
  });

  it('rejects data: URLs for unsupported types', () => {
    expect(
      shouldShowMenu(img({ src: 'data:image/svg+xml;base64,abc123' }))
    ).toBe(false);
    expect(
      shouldShowMenu(img({ src: 'data:text/plain;base64,abc123' }))
    ).toBe(false);
  });
});
