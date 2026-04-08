// Video mode initialization.

import * as S from '../state';
import { render } from '../canvas';

export function initVideo(): void {
  document.getElementById('loading')!.style.display = 'none';

  const container = document.createElement('div');
  container.id = 'media-container';
  container.style.position = 'relative';
  container.style.maxWidth = '100%';
  container.style.maxHeight = '100%';

  const video = document.createElement('video');
  video.controls = true;
  video.style.maxWidth = '100%';
  video.style.maxHeight = '100%';
  video.style.display = 'block';
  video.style.background = '#000';
  video.src = '/media';
  S.setVideoEl(video);

  const canvas = document.createElement('canvas');
  canvas.style.cursor = 'crosshair';
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';

  container.appendChild(video);
  container.appendChild(canvas);
  S.canvasWrap!.appendChild(container);
  S.setCanvas(canvas);
  S.setMediaContainer(container);

  function sizeVideoCanvas(): void {
    const vw = video.clientWidth || video.videoWidth || 640;
    const vh = video.clientHeight || video.videoHeight || 360;
    canvas.width = vw;
    canvas.height = vh;
    canvas.style.width = vw + 'px';
    canvas.style.height = vh + 'px';
    S.setDimensions(vw, vh, (video.videoWidth || vw) / vw, (video.videoHeight || vh) / vh, 0, 0);
    render();
  }

  video.addEventListener('loadedmetadata', sizeVideoCanvas);
  video.addEventListener('resize', sizeVideoCanvas);
  video.addEventListener('play', () => canvas.classList.add('playing-dim'));
  video.addEventListener('pause', () => canvas.classList.remove('playing-dim'));
  window.addEventListener('resize', sizeVideoCanvas);
}
