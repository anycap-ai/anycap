// URL (iframe) mode initialization.

import * as S from '../state';
import { render } from '../canvas';
import { mediaType, targetUrl } from '../config';

export function initUrl(): void {
  // Show browse button in URL mode.
  document.getElementById('browse-group')!.style.display = '';
  document.getElementById('browse-sep')!.style.display = '';

  document.getElementById('loading')!.style.display = 'none';

  const container = document.createElement('div');
  container.id = 'media-container';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.position = 'relative';

  const iframe = document.createElement('iframe');
  iframe.src = targetUrl();
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.style.background = '#fff';
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
  S.setIframeEl(iframe);

  const canvas = document.createElement('canvas');
  canvas.style.cursor = 'crosshair';
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';

  container.appendChild(iframe);
  container.appendChild(canvas);
  S.canvasWrap!.appendChild(container);
  S.setCanvas(canvas);
  S.setMediaContainer(container);

  updateUrlCanvasPassthrough();

  function sizeUrlCanvas(): void {
    const r = container.getBoundingClientRect();
    canvas.width = Math.round(r.width);
    canvas.height = Math.round(r.height);
    S.setDimensions(canvas.width, canvas.height, 1, 1, 0, 0);
    render();
  }
  sizeUrlCanvas();
  window.addEventListener('resize', sizeUrlCanvas);
}

export function updateUrlCanvasPassthrough(): void {
  if (!S.canvas || mediaType() !== 'url') return;
  if (S.currentTool) {
    S.canvas.classList.remove('passthrough');
    S.canvas.style.cursor = 'crosshair';
  } else {
    S.canvas.classList.add('passthrough');
    S.canvas.style.cursor = 'default';
  }
}
