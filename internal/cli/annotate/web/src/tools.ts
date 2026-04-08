// Tool selection, mouse/touch handlers, canvas event binding.

import * as S from './state';
import { render, toOrig, drawLine, drawArrowhead } from './canvas';
import { renderList, focusLastLabel } from './sidebar';
import { updateUrlCanvasPassthrough } from './media/url';

// Callback for annotation sync (set by main.ts).
let _onSync: (() => void) | null = null;

export function onToolSync(cb: () => void): void {
  _onSync = cb;
}

// --- Tool selection ---

export function setTool(tool: string | null): void {
  // Toggle: clicking the active tool deselects it.
  if (tool && tool === S.currentTool) {
    tool = null;
  }
  S.setCurrentTool(tool);
  document.querySelectorAll<HTMLElement>('.tool-btn[data-tool]').forEach((b) => {
    const match = (b.dataset.tool === tool) || (b.dataset.tool === 'browse' && !tool);
    b.classList.toggle('active', match);
  });
  if (S.canvas) {
    S.canvas.style.cursor = tool ? 'crosshair' : 'default';
  }
  if (document.activeElement instanceof HTMLElement && document.activeElement.tagName === 'BUTTON') {
    document.activeElement.blur();
  }
  updateUrlCanvasPassthrough();
}

// --- Mouse handlers ---

function onMouseDown(e: MouseEvent | { clientX: number; clientY: number }): void {
  if (!S.currentTool) return;
  const cr = S.canvas!.getBoundingClientRect();
  const dx = e.clientX - cr.left;
  const dy = e.clientY - cr.top;

  if (S.currentTool === 'point') {
    S.pushUndo();
    S.annotations.push({
      id: S.nextId,
      type: 'point',
      position: toOrig(dx, dy),
      label: '',
      color: S.nextColor(),
    });
    S.setNextId(S.nextId + 1);
    render();
    renderList();
    focusLastLabel();
    _onSync?.();
    return;
  }
  S.setIsDrawing(true);
  S.setDrawStart({ x: dx, y: dy });
  if (S.currentTool === 'freehand') S.setCurrentPath([{ x: dx, y: dy }]);
}

function onMouseMove(e: MouseEvent | { clientX: number; clientY: number }): void {
  if (!S.isDrawing) return;
  const cr = S.canvas!.getBoundingClientRect();
  const dx = e.clientX - cr.left;
  const dy = e.clientY - cr.top;
  if (S.currentTool === 'freehand') S.currentPath.push({ x: dx, y: dy });

  render();
  const pc = S.COLORS[S.colorIndex % S.COLORS.length];
  const c = S.ctx!;
  c.save();
  c.strokeStyle = pc;
  c.lineWidth = 2;
  c.setLineDash([6, 3]);

  if (S.currentTool === 'rect' && S.drawStart) {
    const x = Math.min(S.drawStart.x, dx);
    const y = Math.min(S.drawStart.y, dy);
    const w = Math.abs(dx - S.drawStart.x);
    const h = Math.abs(dy - S.drawStart.y);
    c.fillStyle = pc + '22';
    c.fillRect(x, y, w, h);
    c.strokeRect(x, y, w, h);
  } else if (S.currentTool === 'arrow' && S.drawStart) {
    drawLine(c, S.drawStart.x, S.drawStart.y, dx, dy);
    drawArrowhead(c, S.drawStart.x, S.drawStart.y, dx, dy, pc, 1);
  } else if (S.currentTool === 'freehand' && S.currentPath.length > 1) {
    c.beginPath();
    c.moveTo(S.currentPath[0].x, S.currentPath[0].y);
    for (let i = 1; i < S.currentPath.length; i++) c.lineTo(S.currentPath[i].x, S.currentPath[i].y);
    c.stroke();
  }
  c.restore();
}

function onMouseUp(e: MouseEvent | { clientX: number; clientY: number }): void {
  if (!S.isDrawing) return;
  S.setIsDrawing(false);
  const cr = S.canvas!.getBoundingClientRect();
  const dx = e.clientX - cr.left;
  const dy = e.clientY - cr.top;
  let newAnn: S.Annotation | null = null;

  if (S.currentTool === 'rect' && S.drawStart) {
    const w = Math.abs(dx - S.drawStart.x);
    const h = Math.abs(dy - S.drawStart.y);
    if (w < 3 && h < 3) { render(); return; }
    const x1 = Math.min(S.drawStart.x, dx);
    const y1 = Math.min(S.drawStart.y, dy);
    const o1 = toOrig(x1, y1);
    const o2 = toOrig(x1 + w, y1 + h);
    newAnn = {
      id: S.nextId, type: 'rect',
      bounds: { x: o1.x, y: o1.y, width: o2.x - o1.x, height: o2.y - o1.y },
      label: '', color: S.nextColor(),
    };
  } else if (S.currentTool === 'arrow' && S.drawStart) {
    if (Math.hypot(dx - S.drawStart.x, dy - S.drawStart.y) < 5) { render(); return; }
    newAnn = {
      id: S.nextId, type: 'arrow',
      from: toOrig(S.drawStart.x, S.drawStart.y), to: toOrig(dx, dy),
      label: '', color: S.nextColor(),
    };
  } else if (S.currentTool === 'freehand') {
    if (S.currentPath.length < 3) { S.setCurrentPath([]); render(); return; }
    newAnn = {
      id: S.nextId, type: 'freehand',
      points: S.currentPath.map((p) => toOrig(p.x, p.y)),
      label: '', color: S.nextColor(),
    };
    S.setCurrentPath([]);
  }

  if (newAnn) {
    S.pushUndo();
    S.annotations.push(newAnn);
    S.setNextId(S.nextId + 1);
    render();
    renderList();
    focusLastLabel();
    _onSync?.();
  }
}

// --- Canvas event binding ---

export function bindCanvasEvents(c: HTMLCanvasElement): void {
  c.addEventListener('mousedown', onMouseDown);
  c.addEventListener('mousemove', onMouseMove);
  c.addEventListener('mouseup', onMouseUp);
  c.addEventListener('contextmenu', (e) => e.preventDefault());

  // Touch support
  c.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    onMouseDown({ clientX: t.clientX, clientY: t.clientY });
  });
  c.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    onMouseMove({ clientX: t.clientX, clientY: t.clientY });
  });
  c.addEventListener('touchend', (e) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    onMouseUp({ clientX: t.clientX, clientY: t.clientY });
  });
}

// --- Undo / Clear ---

export function undo(): void {
  if (!S.hasUndo()) return;
  const prev = S.popUndo()!;
  S.setAnnotations(prev);
  S.setNextId(prev.length ? Math.max(...prev.map((a) => a.id)) + 1 : 1);
  render();
  renderList();
  _onSync?.();
}

export function clearAll(): void {
  if (!S.annotations.length) return;
  S.pushUndo();
  S.setAnnotations([]);
  S.setNextId(1);
  S.setColorIndex(0);
  render();
  renderList();
  _onSync?.();
}

// --- Keyboard shortcuts ---

export function initKeyboard(): void {
  document.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      if (e.key === 'Escape') (e.target as HTMLElement).blur();
      return;
    }

    const kl = e.key.toLowerCase();
    const mod = e.metaKey || e.ctrlKey;

    if (mod && kl === 'z') { e.preventDefault(); undo(); return; }
    if (mod || e.altKey) return;

    switch (kl) {
      case 'r': setTool('rect'); break;
      case 'a': setTool('arrow'); break;
      case 'p': setTool('point'); break;
      case 'f': setTool('freehand'); break;
      case 'b': setTool(null); break;
      case 'escape':
        if (S.isDrawing) { S.setIsDrawing(false); S.setCurrentPath([]); render(); }
        break;
      case 'delete':
      case 'backspace':
        e.preventDefault();
        if (S.annotations.length) {
          S.pushUndo();
          S.annotations.pop();
          render();
          renderList();
          _onSync?.();
        }
        break;
    }
  });
}
