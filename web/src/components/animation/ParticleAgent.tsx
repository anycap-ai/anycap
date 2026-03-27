'use client';

import { useRef, useEffect } from 'react';

interface ParticleAgentProps {
  /** Display scale factor (1 = 500×440 px) */
  scale?: number;
  /** Canvas background color (default: transparent) */
  bg?: string;
  className?: string;
}

const W = 500;
const H = 440;
const GRID = 4;

// Particle colors (AnyCap palette)
const COLOR_BODY = '#9a9e90';
const COLOR_ACCENT = '#6b7d3a';
const COLOR_HIGHLIGHT = '#b8cc6e';

function noise(x: number, y: number, t: number) {
  return Math.sin(x * 0.05 + t) * Math.cos(y * 0.05 + t * 0.8);
}

function drawSilhouette(off: CanvasRenderingContext2D, t: number) {
  off.clearRect(0, 0, W, H);

  const cx = W / 2;
  const cy = H / 2 + 30;
  const CYCLE = 5100;
  const elapsed = t % CYCLE;

  // --- Cap lift progress ---
  let cap = 0;
  if (elapsed >= 800 && elapsed < 1600) {
    const p = (elapsed - 800) / 800;
    cap = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
  } else if (elapsed >= 1600 && elapsed < 3500) {
    cap = 1;
  } else if (elapsed >= 3500 && elapsed < 4300) {
    const p = (elapsed - 3500) / 800;
    cap = 1 - (p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p);
  }

  // --- Tool timing ---
  const STAGGER = 80;
  const TANIM = 300;
  const toolsOn = elapsed >= 1600 && elapsed < 3500 + 4 * STAGGER + TANIM;

  // --- VR glasses ---
  let vr = 0;
  if (elapsed >= 2200 && elapsed < 2400) {
    const p = (elapsed - 2200) / 200;
    const c1 = 1.70158, c3 = c1 + 1;
    vr = 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
  } else if (elapsed >= 2400 && elapsed < 3300) {
    vr = 1;
  } else if (elapsed >= 3300 && elapsed < 3500) {
    const p = (elapsed - 3300) / 200;
    vr = 1 - (p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p);
  }

  // ── Body (red channel → body color) ──
  off.fillStyle = 'rgba(255,0,0,1)';
  off.fillRect(cx - 70, cy - 45, 140, 90);
  off.fillRect(cx - 100, cy - 15, 30, 25);
  off.fillRect(cx - 55, cy + 45, 15, 25);
  off.fillRect(cx - 20, cy + 45, 15, 25);
  off.fillRect(cx + 5, cy + 45, 15, 25);
  off.fillRect(cx + 40, cy + 45, 15, 25);

  // Eyes (negative space)
  off.globalCompositeOperation = 'destination-out';
  off.fillRect(cx - 35, cy - 20, 15, 25);
  off.fillRect(cx + 20, cy - 20, 15, 25);
  off.globalCompositeOperation = 'source-over';

  // ── Active arm ──
  const hx = cx + 110 + (cx + 20 - cx - 110) * cap;
  const hy = cy - 5 + (cy - 55 - cy + 5) * cap;
  off.beginPath();
  off.lineCap = 'butt';
  off.lineJoin = 'bevel';
  off.lineWidth = 25;
  off.strokeStyle = 'rgba(255,0,0,1)';
  off.moveTo(cx + 70, cy - 2);
  off.lineTo(cx + 110 - 40 * cap, cy + 30 - 60 * cap);
  off.lineTo(hx, hy);
  off.stroke();

  // ── Cap (blue channel → accent color) ──
  off.fillStyle = 'rgba(0,0,255,1)';
  off.save();
  off.translate(hx - 15, hy - 15);
  off.rotate((1 - cap) * 0.4);
  off.fillRect(-30, -25, 60, 30);
  off.fillRect(-55, -5, 85, 12);
  off.restore();

  // ── VR glasses (green channel → highlight color) ──
  if (vr > 0.01) {
    const s = Math.max(0.001, vr);
    off.save();
    off.translate(cx, cy - 8);
    off.scale(s, s);
    off.fillStyle = 'rgba(0,255,0,1)';
    off.fillRect(-54, -18, 108, 34);
    off.fillRect(-64, -12, 12, 22);
    off.fillRect(52, -12, 12, 22);
    off.fillRect(-16, -26, 32, 10);
    off.restore();
  }

  // ── Surrounding tools (blue channel → accent color) ──
  if (toolsOn) {
    const ts = t * 0.001;
    const tools = [
      { fx: -170, fy: -105 },
      { fx: -165, fy: 65 },
      { fx: 0, fy: -155 },
      { fx: 165, fy: 65 },
      { fx: 170, fy: -105 },
    ];

    tools.forEach((cfg, idx) => {
      const appear = 1600 + idx * STAGGER;
      const disappear = 3500 + (4 - idx) * STAGGER;
      let tp = 0;
      if (elapsed >= appear && elapsed < appear + TANIM) {
        const p = (elapsed - appear) / TANIM;
        const c1 = 1.70158, c3 = c1 + 1;
        tp = 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
      } else if (elapsed >= appear + TANIM && elapsed < disappear) {
        tp = 1;
      } else if (elapsed >= disappear && elapsed < disappear + TANIM) {
        const p = (elapsed - disappear) / TANIM;
        tp = 1 - (p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p);
      }
      if (tp < 0.01) return;

      const px = cx + cfg.fx;
      const py = cy + cfg.fy;
      const bob = tp > 0.95 ? Math.sin(ts * 2.5 + idx * 1.3) * 5 : 0;
      const sc = Math.max(0.001, tp);

      off.save();
      off.translate(px, py + bob);
      off.scale(sc, sc);
      off.fillStyle = 'rgba(0,0,255,1)';

      switch (idx) {
        case 0: // Browser
          off.fillRect(-14, -38, 28, 12);
          off.fillRect(-40, -26, 80, 16);
          off.fillRect(-40, -6, 80, 44);
          break;
        case 1: // Paintbrush
          off.save();
          off.rotate(-0.55);
          off.fillRect(-4, -36, 8, 44);
          off.fillRect(-9, -38, 18, 9);
          off.fillRect(-13, 8, 26, 12);
          off.beginPath();
          off.moveTo(-15, 20);
          off.lineTo(15, 20);
          off.lineTo(0, 38);
          off.fill();
          off.restore();
          break;
        case 2: // Video camera
          off.fillRect(-26, -20, 46, 40);
          off.beginPath();
          off.moveTo(20, -16);
          off.lineTo(38, -6);
          off.lineTo(38, 6);
          off.lineTo(20, 16);
          off.closePath();
          off.fill();
          off.fillRect(-18, -34, 24, 16);
          break;
        case 3: // Microphone
          off.beginPath();
          off.ellipse(0, -20, 18, 24, 0, 0, Math.PI * 2);
          off.fill();
          off.fillRect(-5, 4, 10, 24);
          off.beginPath();
          off.arc(0, 4, 14, 0, Math.PI);
          off.fill();
          off.fillRect(-18, 26, 36, 8);
          break;
        case 4: // Keyboard
          off.fillRect(-44, -20, 88, 10);
          off.fillRect(-44, -6, 88, 10);
          off.fillRect(-44, 8, 88, 10);
          off.fillRect(-26, 24, 52, 9);
          break;
      }

      off.restore();
    });
  }
}

export function ParticleAgent({ scale = 1, bg, className }: ParticleAgentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: !bg });
    if (!ctx) return;

    const offCanvas = document.createElement('canvas');
    const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return;

    canvas.width = W;
    canvas.height = H;
    offCanvas.width = W;
    offCanvas.height = H;

    let raf = 0;

    function render(time: number) {
      drawSilhouette(offCtx!, time);
      const img = offCtx!.getImageData(0, 0, W, H).data;

      if (bg) {
        ctx!.fillStyle = bg;
        ctx!.fillRect(0, 0, W, H);
      } else {
        ctx!.clearRect(0, 0, W, H);
      }

      const ts = time * 0.001;

      for (let y = 0; y < H; y += GRID) {
        const glitch = Math.random() > 0.99 ? (Math.random() - 0.5) * 8 : 0;

        for (let x = 0; x < W; x += GRID) {
          const i = (y * W + x) * 4;
          const r = img[i], g = img[i + 1], b = img[i + 2], a = img[i + 3];

          if (a > 128) {
            if (g > 128 && r < 128 && b < 128) {
              ctx!.fillStyle = COLOR_HIGHLIGHT;
            } else if (r > 128) {
              ctx!.fillStyle = COLOR_BODY;
            } else if (b > 128) {
              ctx!.fillStyle = COLOR_ACCENT;
            } else {
              ctx!.fillStyle = '#FFFFFF';
            }

            const n = noise(x, y, ts * 1.5);
            const size = GRID * 0.7 + n * GRID * 0.2;
            const ox = x + n * 0.8 + glitch;
            const oy = y + noise(x + 100, y + 100, ts * 1.5) * 0.8;

            if (Math.sin(ts * 6 + x * 0.4 + y * 0.6) > 0) {
              ctx!.fillRect(ox - size / 2, oy - size / 2, size, size);
            } else {
              ctx!.beginPath();
              ctx!.arc(ox, oy, size / 2, 0, Math.PI * 2);
              ctx!.fill();
            }
          }
        }
      }

      raf = requestAnimationFrame(render);
    }

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [bg]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: W * scale, height: H * scale }}
    />
  );
}
