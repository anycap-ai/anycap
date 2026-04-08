// Canvas rendering: render all annotations, draw helpers, coordinate conversion.

import * as S from './state';
import { mediaType } from './config';

// --- Coordinate conversion ---

export function toOrig(dx: number, dy: number): S.Point {
  return { x: Math.round((dx - S.imgOffX) * S.scaleX), y: Math.round((dy - S.imgOffY) * S.scaleY) };
}

export function toDisp(ox: number, oy: number): S.Point {
  return { x: ox / S.scaleX + S.imgOffX, y: oy / S.scaleY + S.imgOffY };
}

// --- Drawing helpers ---

export function drawLine(c: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
  c.beginPath();
  c.moveTo(x1, y1);
  c.lineTo(x2, y2);
  c.stroke();
}

export function drawArrowhead(c: CanvasRenderingContext2D, fx: number, fy: number, tx: number, ty: number, color: string, m: number): void {
  const angle = Math.atan2(ty - fy, tx - fx);
  const len = 14 * m;
  c.save();
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(tx, ty);
  c.lineTo(tx - len * Math.cos(angle - 0.4), ty - len * Math.sin(angle - 0.4));
  c.lineTo(tx - len * Math.cos(angle + 0.4), ty - len * Math.sin(angle + 0.4));
  c.closePath();
  c.fill();
  c.restore();
}

function drawNumLabel(c: CanvasRenderingContext2D, num: number, x: number, y: number, color: string, fs: number): void {
  const r = fs * 0.75;
  c.save();
  c.fillStyle = color;
  c.beginPath();
  c.arc(x, y - r, r, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#fff';
  c.font = 'bold ' + Math.round(r * 0.9) + 'px sans-serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(String(num), x, y - r + 1);
  c.restore();
}

// --- Render a single annotation ---

export function renderAnnotation(c: CanvasRenderingContext2D, ann: S.Annotation, exp: boolean): void {
  const m = exp ? Math.max(S.scaleX, S.scaleY) : 1;
  const lw = 2.5 * m;
  const fs = 14 * m;
  c.save();
  c.strokeStyle = ann.color;
  c.lineWidth = lw;
  c.setLineDash([]);

  if (ann.type === 'rect' && ann.bounds) {
    let dx: number, dy: number, dw: number, dh: number;
    if (exp) {
      dx = ann.bounds.x; dy = ann.bounds.y; dw = ann.bounds.width; dh = ann.bounds.height;
    } else {
      const tl = toDisp(ann.bounds.x, ann.bounds.y);
      const br = toDisp(ann.bounds.x + ann.bounds.width, ann.bounds.y + ann.bounds.height);
      dx = tl.x; dy = tl.y; dw = br.x - tl.x; dh = br.y - tl.y;
    }
    c.fillStyle = ann.color + '22';
    c.fillRect(dx, dy, dw, dh);
    c.strokeRect(dx, dy, dw, dh);
    drawNumLabel(c, ann.id, dx + 2, dy - 2, ann.color, fs);
  } else if (ann.type === 'arrow' && ann.from && ann.to) {
    let fx: number, fy: number, tx: number, ty: number;
    if (exp) {
      fx = ann.from.x; fy = ann.from.y; tx = ann.to.x; ty = ann.to.y;
    } else {
      const f = toDisp(ann.from.x, ann.from.y);
      const t = toDisp(ann.to.x, ann.to.y);
      fx = f.x; fy = f.y; tx = t.x; ty = t.y;
    }
    drawLine(c, fx, fy, tx, ty);
    drawArrowhead(c, fx, fy, tx, ty, ann.color, m);
    drawNumLabel(c, ann.id, fx, fy - 4 * m, ann.color, fs);
  } else if (ann.type === 'point' && ann.position) {
    let px: number, py: number;
    if (exp) {
      px = ann.position.x; py = ann.position.y;
    } else {
      const p = toDisp(ann.position.x, ann.position.y);
      px = p.x; py = p.y;
    }
    const r = 14 * m;
    c.beginPath();
    c.arc(px, py, r, 0, Math.PI * 2);
    c.fillStyle = ann.color;
    c.fill();
    c.strokeStyle = '#fff';
    c.lineWidth = 2 * m;
    c.stroke();
    c.fillStyle = '#fff';
    c.font = 'bold ' + Math.round(r) + 'px sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(String(ann.id), px, py + 1);
  } else if (ann.type === 'freehand' && ann.points && ann.points.length > 1) {
    const pts = exp ? ann.points : ann.points.map((pt) => toDisp(pt.x, pt.y));
    c.beginPath();
    c.moveTo(pts[0].x, pts[0].y);
    for (let j = 1; j < pts.length; j++) c.lineTo(pts[j].x, pts[j].y);
    c.stroke();
    drawNumLabel(c, ann.id, pts[0].x, pts[0].y - 4 * m, ann.color, fs);
  }
  c.restore();
}

// --- Full canvas render ---

export function render(): void {
  if (!S.ctx) return;
  const c = S.ctx;
  c.clearRect(0, 0, S.canvas!.width, S.canvas!.height);

  const mt = mediaType();

  if (mt === 'image' && S.originalImage && S.originalImage.complete && S.originalImage.naturalWidth) {
    c.fillStyle = '#e5e5e5';
    c.fillRect(0, 0, S.canvas!.width, S.canvas!.height);
    c.save();
    c.shadowColor = 'rgba(0,0,0,.12)';
    c.shadowBlur = 8;
    c.shadowOffsetY = 2;
    c.fillStyle = '#fff';
    c.fillRect(S.imgOffX, S.imgOffY, S.imgDisplayW, S.imgDisplayH);
    c.restore();
    c.drawImage(S.originalImage, S.imgOffX, S.imgOffY, S.imgDisplayW, S.imgDisplayH);
  } else if (mt === 'audio') {
    c.fillStyle = '#fafbf8';
    c.fillRect(0, 0, S.canvas!.width, S.canvas!.height);
    c.strokeStyle = '#eee';
    c.lineWidth = 0.5;
    for (let gx = 0; gx < S.canvas!.width; gx += 40) {
      c.beginPath(); c.moveTo(gx, 0); c.lineTo(gx, S.canvas!.height); c.stroke();
    }
    for (let gy = 0; gy < S.canvas!.height; gy += 40) {
      c.beginPath(); c.moveTo(0, gy); c.lineTo(S.canvas!.width, gy); c.stroke();
    }
  }
  // URL and video modes: canvas is transparent overlay, no background fill

  for (let i = 0; i < S.annotations.length; i++) {
    renderAnnotation(c, S.annotations[i], false);
  }
}
