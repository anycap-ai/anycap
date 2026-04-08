// WebSocket: real-time sync, remote cursors, peers indicator.

import * as S from './state';
import { sessionId, resolveWsUrl } from './config';
import { render } from './canvas';
import { renderList } from './sidebar';
import { esc } from './ui';

let ws: WebSocket | null = null;
let lastCursorBroadcast = 0;
let wsReconnectTimer: ReturnType<typeof setTimeout> | null = null;

// --- Client UI init ---

export function initClientUI(): void {
  const nameInput = document.getElementById('client-name') as HTMLInputElement | null;
  const dot = document.getElementById('client-dot') as HTMLElement | null;
  if (nameInput) {
    nameInput.value = S.clientName;
    nameInput.addEventListener('input', function (this: HTMLInputElement) {
      S.setClientName(this.value || 'Anonymous');
      try { localStorage.setItem('anycap_annotate_name', S.clientName); } catch (_e) { /* ignore */ }
    });
  }
  if (dot) dot.style.background = S.clientColor;
}

// --- WebSocket connection ---

export function initWebSocket(): void {
  if (wsReconnectTimer) { clearTimeout(wsReconnectTimer); wsReconnectTimer = null; }
  const wsUrl = resolveWsUrl('/ws');
  try {
    ws = new WebSocket(wsUrl);
    ws.onopen = () => {
      ws!.send(JSON.stringify({
        type: 'join', clientId: S.clientId, name: S.clientName,
        color: S.clientColor, sessionId: sessionId(),
      }));
      if (S.annotations.length > 0) broadcastAnnotations();
    };
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.clientId === S.clientId) return;
        switch (msg.type) {
          case 'reload':
            location.reload();
            return;
          case 'sync':
            if (msg.annotations) {
              S.setAnnotations(msg.annotations);
              S.setNextId(
                S.annotations.length
                  ? Math.max(...S.annotations.map((a: S.Annotation) => a.id)) + 1
                  : 1,
              );
              S.setColorIndex(S.annotations.length);
              render();
              renderList();
            }
            break;
          case 'cursor':
            updateRemoteCursor(msg);
            break;
          case 'cursor_leave':
          case 'leave':
            removeRemoteCursor(msg.clientId);
            break;
          case 'submitted':
            showSubmittedOverlay();
            break;
        }
      } catch (_err) { /* ignore parse errors */ }
    };
    ws.onclose = () => {
      wsReconnectTimer = setTimeout(initWebSocket, 3000);
    };
    ws.onerror = () => { /* silently ignore */ };
  } catch (_err) { /* WebSocket not available */ }
}

// --- Content element helper ---
// Returns the element that represents the actual annotation content area.
// Cursor coordinates should be relative to this element for correct mapping
// across different screen sizes (the content may be centered within canvasWrap).
function getContentEl(): HTMLElement {
  return S.mediaContainer || S.canvas || S.canvasWrap!;
}

// --- Broadcast ---

export function broadcastAnnotations(): void {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  try {
    ws.send(JSON.stringify({
      type: 'sync',
      clientId: S.clientId,
      annotations: S.annotations.map((a) => {
        const o: Record<string, unknown> = { id: a.id, type: a.type, label: a.label, color: a.color };
        if (a.bounds) o.bounds = a.bounds;
        if (a.from) o.from = a.from;
        if (a.to) o.to = a.to;
        if (a.position) o.position = a.position;
        if (a.points) o.points = a.points;
        return o;
      }),
    }));
  } catch (_err) { /* ignore send errors */ }
}

export function broadcastCursor(e: MouseEvent): void {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  const now = Date.now();
  if (now - lastCursorBroadcast < 50) return;
  lastCursorBroadcast = now;
  const contentEl = getContentEl();
  const rect = contentEl.getBoundingClientRect();
  try {
    ws.send(JSON.stringify({
      type: 'cursor', clientId: S.clientId, name: S.clientName, color: S.clientColor,
      rx: (e.clientX - rect.left) / rect.width,
      ry: (e.clientY - rect.top) / rect.height,
    }));
  } catch (_err) { /* ignore */ }
}

export function broadcastLeave(): void {
  if (ws && ws.readyState === WebSocket.OPEN) {
    try { ws.send(JSON.stringify({ type: 'leave', clientId: S.clientId })); } catch (_e) { /* ignore */ }
  }
}

export function broadcastCursorLeave(): void {
  if (ws && ws.readyState === WebSocket.OPEN) {
    try { ws.send(JSON.stringify({ type: 'cursor_leave', clientId: S.clientId })); } catch (_e) { /* ignore */ }
  }
}

// --- Remote cursors ---

const remoteCursors: Record<string, S.RemoteCursor> = {};

function updateRemoteCursor(data: {
  clientId: string; name?: string; color?: string; rx: number; ry: number;
}): void {
  let cursor = remoteCursors[data.clientId];
  if (!cursor) {
    const el = document.createElement('div');
    el.className = 'remote-cursor';
    el.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 20 20">' +
      '<path d="M3 2L3 16L7.5 12L12 18L14 17L9.5 11L15 10Z" fill="' +
      (data.color || '#999') + '" stroke="#fff" stroke-width="1.5"/>' +
      '</svg><span class="cursor-name" style="background:' +
      (data.color || '#999') + '">' + esc(data.name || '?') + '</span>';
    S.canvasWrap!.appendChild(el);
    cursor = { el, name: data.name || '?', color: data.color || '#999', timer: null };
    remoteCursors[data.clientId] = cursor;
  }
  // Position relative to the content element, then offset within canvasWrap.
  const contentEl = getContentEl();
  const contentRect = contentEl.getBoundingClientRect();
  const wrapRect = S.canvasWrap!.getBoundingClientRect();
  const offsetX = contentRect.left - wrapRect.left;
  const offsetY = contentRect.top - wrapRect.top;
  cursor.el.style.transform =
    'translate(' + Math.round(offsetX + data.rx * contentRect.width) + 'px,' +
    Math.round(offsetY + data.ry * contentRect.height) + 'px)';
  if (data.name && data.name !== cursor.name) {
    cursor.name = data.name;
    const label = cursor.el.querySelector('.cursor-name') as HTMLElement | null;
    if (label) label.textContent = data.name;
  }
  if (cursor.timer) clearTimeout(cursor.timer);
  cursor.timer = setTimeout(() => removeRemoteCursor(data.clientId), 5000);
  updatePeersUI();
}

function removeRemoteCursor(cid: string): void {
  const cursor = remoteCursors[cid];
  if (!cursor) return;
  if (cursor.timer) clearTimeout(cursor.timer);
  cursor.el.remove();
  delete remoteCursors[cid];
  updatePeersUI();
}

function updatePeersUI(): void {
  const ids = Object.keys(remoteCursors);
  const indicator = document.getElementById('peers-indicator');
  if (!indicator) return;
  if (!ids.length) { indicator.style.display = 'none'; return; }
  indicator.style.display = '';
  document.getElementById('peers-dots')!.innerHTML = ids
    .map((id) => {
      const c = remoteCursors[id];
      return '<span class="peers-dot" style="background:' + (c.color || '#999') +
        '" title="' + esc(c.name || id) + '"></span>';
    })
    .join('');
  document.getElementById('peers-count')!.textContent =
    ids.length + (ids.length === 1 ? ' peer' : ' peers');
}

// --- Submitted overlay ---
// Shown on OTHER clients when someone submits feedback.

function showSubmittedOverlay(): void {
  // Don't show if the page was already replaced by the submitter's own handler.
  if (document.getElementById('submitted-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'submitted-overlay';
  overlay.innerHTML =
    '<div class="submitted-overlay-content">' +
    '<div class="submitted-overlay-icon">' +
    '<svg width="48" height="48" viewBox="0 0 48 48" fill="none">' +
    '<circle cx="24" cy="24" r="22" stroke="#6b7d3a" stroke-width="3" fill="none"/>' +
    '<path d="M14 24L21 31L34 18" stroke="#6b7d3a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg></div>' +
    '<div class="submitted-overlay-title">Feedback Submitted</div>' +
    '<div class="submitted-overlay-sub">Another collaborator has submitted the feedback for this session.</div>' +
    '<div class="submitted-overlay-hint">You can close this tab.</div>' +
    '</div>';
  document.body.appendChild(overlay);
}
