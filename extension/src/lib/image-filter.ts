import { MIN_IMAGE_DIMENSION } from './constants';

export type ImageInfo = { naturalWidth: number; naturalHeight: number; src: string };

const ALLOWED_EXT = /\.(jpe?g|png|webp)$/i;
const ALLOWED_DATA = /^data:image\/(jpeg|png|webp);/i;

export function shouldShowMenu(img: ImageInfo): boolean {
  if (img.src.startsWith('file://')) return false;
  if (Math.min(img.naturalWidth, img.naturalHeight) < MIN_IMAGE_DIMENSION) return false;
  if (img.src.startsWith('data:')) return ALLOWED_DATA.test(img.src);
  try {
    const u = new URL(img.src);
    return ALLOWED_EXT.test(u.pathname);
  } catch {
    return false;
  }
}
