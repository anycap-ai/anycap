// Audio mode initialization.

import * as S from '../state';
import { resolveUrl } from '../config';
import { render } from '../canvas';

export function initAudio(): void {
  document.getElementById('loading')!.style.display = 'none';

  const canvas = document.createElement('canvas');
  canvas.id = 'canvas';
  canvas.style.cursor = 'crosshair';
  canvas.style.boxShadow = '0 2px 8px rgba(0,0,0,.08)';
  canvas.style.background = '#fff';
  S.canvasWrap!.appendChild(canvas);
  S.setCanvas(canvas);

  const audio = document.createElement('audio');
  audio.controls = true;
  audio.src = resolveUrl('/media');
  S.setAudioEl(audio);

  const playerBar = document.createElement('div');
  playerBar.id = 'audio-player';
  playerBar.appendChild(audio);
  S.canvasWrap!.appendChild(playerBar);

  function sizeAudioCanvas(): void {
    const r = S.canvasWrap!.getBoundingClientRect();
    canvas.width = Math.round(r.width - 64);
    canvas.height = Math.round(r.height - 100);
    S.setDimensions(canvas.width, canvas.height, 1, 1, 0, 0);
    render();
  }
  sizeAudioCanvas();
  window.addEventListener('resize', sizeAudioCanvas);
}
