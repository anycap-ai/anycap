// Entry point: init, platform detection, toolbar wiring, event delegation.

import './style.css';

import * as S from './state';
import { mediaType } from './config';
import { initSidebar, onAnnotationSync } from './sidebar';
import { setTool, bindCanvasEvents, undo, clearAll, initKeyboard } from './tools';
import { onToolSync } from './tools';
import { toggleRecording } from './recording';
import { initClientUI, initWebSocket, broadcastAnnotations, broadcastCursor, broadcastCursorLeave, broadcastLeave } from './websocket';
import { submitAll } from './submit';
import { initImage } from './media/image';
import { initUrl } from './media/url';
import { initVideo } from './media/video';
import { initAudio } from './media/audio';
import { showTutorial } from './tutorial';

// --- Platform detection ---
const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
const MOD_SYMBOL = isMac ? '\u2318' : 'Ctrl+';
const MOD_LABEL = isMac ? '\u2318' : 'Ctrl';

// Update modifier key labels in toolbar
document.querySelectorAll<HTMLElement>('kbd[data-mod]').forEach((el) => {
  el.textContent = MOD_SYMBOL + el.dataset.mod;
});

// Populate shortcuts reference
const mt = mediaType();
document.getElementById('shortcuts')!.innerHTML =
  (mt === 'url' ? '<kbd>B</kbd> Browse  ' : '') +
  '<kbd>R</kbd> Rect  ' +
  '<kbd>A</kbd> Arrow  ' +
  '<kbd>P</kbd> Point  ' +
  '<kbd>F</kbd> Free<br>' +
  '<kbd>' + MOD_LABEL + '+Z</kbd> Undo  ' +
  '<kbd>Esc</kbd> Cancel  ' +
  '<kbd>\u232B</kbd> Delete last';

// --- Set initial tool ---
if (mt === 'url') {
  S.setCurrentTool(null);
} else {
  S.setCurrentTool('rect');
}

// --- Wire up sync callbacks (breaks circular deps) ---
onAnnotationSync(() => broadcastAnnotations());
onToolSync(() => broadcastAnnotations());

// --- Init canvas wrap ref ---
S.setCanvasWrap(document.getElementById('canvas-wrap')!);

// --- Initialize sidebar event delegation ---
initSidebar();

// --- Initialize based on media type ---
function init(): void {
  switch (mt) {
    case 'image': initImage(); break;
    case 'url': initUrl(); break;
    case 'video': initVideo(); break;
    case 'audio': initAudio(); break;
    default: initImage(); break;
  }

  // Bind canvas events after media init created the canvas
  if (S.canvas) {
    bindCanvasEvents(S.canvas);
  }

  // Mark initial active tool in toolbar
  setTool(S.currentTool);

  initWebSocket();
}

// --- Toolbar event delegation ---
document.getElementById('toolbar')!.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest('.tool-btn') as HTMLElement | null;
  if (!btn) return;

  // Tool buttons
  if (btn.dataset.tool !== undefined) {
    setTool(btn.dataset.tool === 'browse' ? null : btn.dataset.tool);
    return;
  }

  // Action buttons
  switch (btn.dataset.action) {
    case 'undo': undo(); break;
    case 'clear': clearAll(); break;
    case 'rec': toggleRecording(); break;
    case 'submit': submitAll(); break;
  }
});

// --- Keyboard shortcuts ---
initKeyboard();

// --- Client UI and WebSocket ---
initClientUI();

// --- Cursor broadcast ---
S.canvasWrap!.addEventListener('mousemove', broadcastCursor);
S.canvasWrap!.addEventListener('mouseleave', () => broadcastCursorLeave());

window.addEventListener('beforeunload', () => broadcastLeave());

// --- Start ---
init();

// --- Show tutorial for URL/video modes ---
showTutorial();
