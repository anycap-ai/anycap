// Image mode initialization.

import * as S from '../state';
import { render } from '../canvas';

export function initImage(): void {
  const canvas = document.createElement('canvas');
  canvas.id = 'canvas';
  canvas.style.cursor = 'crosshair';
  canvas.style.boxShadow = '0 2px 8px rgba(0,0,0,.08)';
  S.canvasWrap!.appendChild(canvas);
  S.setCanvas(canvas);

  const img = new Image();
  img.onload = () => {
    document.getElementById('loading')!.style.display = 'none';
    fitCanvasImage();
    render();
  };
  img.onerror = () => {
    document.getElementById('loading')!.textContent = 'Failed to load image.';
  };
  img.src = '/image';
  S.setOriginalImage(img);

  window.addEventListener('resize', () => { fitCanvasImage(); render(); });
}

export function fitCanvasImage(): void {
  if (!S.originalImage || !S.canvasWrap || !S.canvas) return;
  const r = S.canvasWrap.getBoundingClientRect();
  const availW = r.width - 32;
  const availH = r.height - 32;
  const imgW = S.originalImage.naturalWidth;
  const imgH = S.originalImage.naturalHeight;
  const maxW = Math.max(availW - 2 * S.PAD, 60);
  const maxH = Math.max(availH - 2 * S.PAD, 60);
  const s = Math.min(maxW / imgW, maxH / imgH, 1);
  const dw = Math.round(imgW * s);
  const dh = Math.round(imgH * s);
  S.setImgDisplay(dw, dh);
  S.canvas.width = dw + 2 * S.PAD;
  S.canvas.height = dh + 2 * S.PAD;
  S.setDimensions(S.canvas.width, S.canvas.height, imgW / dw, imgH / dh, S.PAD, S.PAD);
}
