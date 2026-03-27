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

// Particle colors
const COLOR_BODY = '#9a9e90';
const COLOR_CAP = '#6b7d3a';
const COLOR_GLASSES = '#39ff14';
const COLOR_TOOLS = '#585b52';
const COLOR_GAUNTLET = '#c8a83a';

interface FrameState {
  shockProgress: number;
  shockSweep: number;
  agentCy: number;
  gauntletProgress: number;
  gems: Array<{ x: number; y: number; color: string }>;
}

function noise(x: number, y: number, t: number) {
  return Math.sin(x * 0.05 + t) * Math.cos(y * 0.05 + t * 0.8);
}

function drawSilhouette(off: CanvasRenderingContext2D, t: number): FrameState {
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

  // --- Shock effect (triggers when cap lands) ---
  let shockProgress = 0, shockSweep = 0;
  if (elapsed >= 1600 && elapsed < 2300) {
    const p = (elapsed - 1600) / 700;
    shockProgress = Math.pow(1 - p, 2);
    shockSweep = Math.min(1, (elapsed - 1600) / 350);
  }

  // --- Gauntlet progress ---
  let gauntletProgress = 0;
  if (elapsed >= 1800 && elapsed < 2100) {
    const p = (elapsed - 1800) / 300;
    const c1 = 1.70158, c3 = c1 + 1;
    gauntletProgress = 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
  } else if (elapsed >= 2100 && elapsed < 3400) {
    gauntletProgress = 1;
  } else if (elapsed >= 3400 && elapsed < 3600) {
    const p = (elapsed - 3400) / 200;
    gauntletProgress = 1 - (p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p);
  }

  // --- Tool timing ---
  const STAGGER = 80;
  const TANIM = 300;
  const toolsOn = elapsed >= 1600 && elapsed < 3500 + 4 * STAGGER + TANIM;

  // --- Sunglasses progress ---
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

  // ── Body (red channel) ──
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

  // ── Gauntlet (yellow channel) ──
  const gems: FrameState['gems'] = [];
  if (gauntletProgress > 0.01) {
    const gs = Math.max(0.001, gauntletProgress);
    const gCx = cx - 86, gCy = cy - 2;
    off.save();
    off.translate(gCx, gCy);
    off.scale(gs * 1.3, gs * 1.3);
    off.fillStyle = 'rgba(255,255,0,1)';
    off.fillRect(-8, 14, 22, 14);
    off.fillRect(-16, -12, 32, 28);
    off.fillRect(-16, -22, 7, 12);
    off.fillRect(-6, -26, 7, 16);
    off.fillRect(4, -26, 7, 16);
    off.fillRect(14, -22, 7, 12);
    off.fillRect(-26, -5, 12, 8);
    off.restore();

    gems.push(
      { x: gCx + (-11) * gs, y: gCy + (-7) * gs, color: '#a855f7' },
      { x: gCx,              y: gCy + (-9) * gs,  color: '#3b82f6' },
      { x: gCx + 11 * gs,    y: gCy + (-7) * gs,  color: '#ef4444' },
      { x: gCx + (-7) * gs,  y: gCy + 5 * gs,     color: '#f97316' },
      { x: gCx + 7 * gs,     y: gCy + 5 * gs,     color: '#22c55e' },
    );
  }

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

  // ── Cap (blue channel) ──
  off.fillStyle = 'rgba(0,0,255,1)';
  off.save();
  off.translate(hx - 15, hy - 15);
  off.rotate((1 - cap) * 0.4);
  off.fillRect(-30, -25, 60, 30);
  off.fillRect(-55, -5, 85, 12);
  off.restore();

  // ── Sunglasses (green channel) ──
  if (vr > 0.01) {
    const s = Math.max(0.001, vr);
    off.save();
    off.translate(cx, cy - 8);
    off.scale(s, s);
    off.fillStyle = 'rgba(0,255,0,1)';
    off.fillRect(-42, -14, 26, 22);
    off.fillRect(16, -14, 26, 22);
    off.fillRect(-16, -7, 32, 6);
    off.fillRect(-52, -8, 12, 7);
    off.fillRect(40, -8, 12, 7);
    off.restore();
  }

  // ── Tools (magenta channel) ──
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
      off.fillStyle = 'rgba(255,0,255,1)';

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

  return { shockProgress, shockSweep, agentCy: cy, gauntletProgress, gems };
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
      const state = drawSilhouette(offCtx!, time);
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
              ctx!.fillStyle = COLOR_GLASSES;
            } else if (r > 128 && b > 128) {
              ctx!.fillStyle = COLOR_TOOLS;
            } else if (r > 128 && g > 128) {
              ctx!.fillStyle = COLOR_GAUNTLET;
            } else if (r > 128) {
              ctx!.fillStyle = COLOR_BODY;
            } else if (b > 128) {
              ctx!.fillStyle = COLOR_CAP;
            } else {
              ctx!.fillStyle = '#FFFFFF';
            }

            const n = noise(x, y, ts * 1.5);
            let size = GRID * 0.7 + n * GRID * 0.2;

            // Shock jitter on body pixels
            let jitterX = 0;
            if (state.shockProgress > 0 && r > 128 && b < 128 && g < 128) {
              const bodyTop = state.agentCy - 70;
              const bodyBot = state.agentCy + 70;
              const invertY = 1 - Math.max(0, Math.min(1, (y - bodyTop) / (bodyBot - bodyTop)));

              const waveDist = Math.abs(invertY - state.shockSweep);
              if (waveDist < 0.15) {
                const wi = (1 - waveDist / 0.15) * state.shockProgress;
                if (wi > 0.2) {
                  ctx!.fillStyle = wi > 0.5 ? '#ffffff' : '#d0ffe0';
                  size *= 1 + wi * 0.4;
                }
              }

              const swept = invertY < state.shockSweep;
              const tremble = swept ? state.shockProgress : state.shockProgress * 0.2;
              jitterX = Math.sin(ts * 110 + y * 0.08) * tremble * 10;
            }

            const ox = x + n * 0.8 + glitch + jitterX;
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

      // Gem glow
      if (state.gems.length > 0 && state.gauntletProgress > 0.5) {
        ctx!.save();
        const gemAlpha = Math.min(1, (state.gauntletProgress - 0.5) * 2);
        state.gems.forEach(gem => {
          ctx!.fillStyle = gem.color;
          ctx!.shadowColor = gem.color;
          ctx!.shadowBlur = 12 + Math.sin(ts * 3) * 3;
          ctx!.globalAlpha = gemAlpha;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const px = gem.x + dx * (GRID * 0.8);
              const py = gem.y + dy * (GRID * 0.8);
              const gn = noise(px, py, ts * 2);
              const sz = GRID * 0.7 + gn * 0.3;
              ctx!.fillRect(px + gn * 0.5 - sz / 2, py - sz / 2, sz, sz);
            }
          }
        });
        ctx!.restore();
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
