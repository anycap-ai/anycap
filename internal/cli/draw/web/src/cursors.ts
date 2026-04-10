// Client identity, remote cursor rendering, and peers indicator
// for multi-user collaboration in the draw whiteboard.

const CURSOR_COLORS = [
  '#e03131', '#2f9e44', '#1971c2', '#f08c00', '#6741d9',
  '#0c8599', '#e8590c', '#9c36b5', '#3b5bdb', '#099268',
];

const ADJECTIVES = [
  'Swift', 'Calm', 'Bold', 'Warm', 'Keen',
  'Wise', 'Neat', 'Soft', 'Brave', 'Cool',
  'Bright', 'Quick', 'Sharp', 'Lucky', 'Gentle',
];

const ANIMALS = [
  'Fox', 'Owl', 'Bear', 'Wolf', 'Deer',
  'Hawk', 'Lynx', 'Otter', 'Crane', 'Robin',
  'Panda', 'Koala', 'Tiger', 'Eagle', 'Falcon',
];

function generateClientId(): string {
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

function pickColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

function generateName(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 37 + id.charCodeAt(i)) | 0;
  }
  const adj = ADJECTIVES[Math.abs(hash) % ADJECTIVES.length];
  const animal = ANIMALS[Math.abs(hash >> 8) % ANIMALS.length];
  return `${adj} ${animal}`;
}

// Each tab gets a unique clientId so same-browser tabs can sync.
// We no longer persist this in localStorage.
function loadOrCreateId(): string {
  return generateClientId();
}

function loadName(id: string): string {
  try {
    const stored = localStorage.getItem('anycap_draw_name');
    if (stored) return stored;
  } catch { /* ignore */ }
  return generateName(id);
}

function esc(s: string): string {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return s.replace(/[&<>"']/g, (c) => map[c] || c);
}

// --- Client identity (persisted across refreshes) ---

export const clientId = loadOrCreateId();
export let clientName = loadName(clientId);
export const clientColor = pickColor(clientId);

export function setClientName(name: string): void {
  clientName = name || generateName(clientId);
  try {
    if (name) {
      localStorage.setItem('anycap_draw_name', clientName);
    } else {
      localStorage.removeItem('anycap_draw_name');
    }
  } catch { /* ignore */ }
}

// --- Remote cursor data ---

export interface CursorData {
  clientId: string;
  name: string;
  color: string;
  sceneX: number;
  sceneY: number;
}

interface RemoteCursor {
  el: HTMLElement;
  name: string;
  color: string;
  sceneX: number;
  sceneY: number;
  timer: ReturnType<typeof setTimeout> | null;
}

export interface ViewState {
  scrollX: number;
  scrollY: number;
  zoom: { value: number };
}

const remoteCursors = new Map<string, RemoteCursor>();
const knownPeers = new Map<string, { name: string; color: string }>();
let cursorContainer: HTMLElement | null = null;
let peersCallback: ((peers: { name: string; color: string }[]) => void) | null = null;

export function setCursorContainer(el: HTMLElement): void {
  cursorContainer = el;
}

export function onPeersChange(cb: (peers: { name: string; color: string }[]) => void): void {
  peersCallback = cb;
}

/** Register a peer from a join message (even before they send cursor updates). */
export function addPeer(id: string, name: string, color: string): void {
  if (id === clientId) return;
  knownPeers.set(id, { name, color });
  notifyPeers();
}

/** Remove a peer entirely (on explicit leave or disconnect). */
export function removePeer(id: string): void {
  knownPeers.delete(id);
  removeRemoteCursor(id);
  notifyPeers();
}

/** Clear all remote state (called on reconnection). */
export function clearAllRemote(): void {
  for (const cursor of remoteCursors.values()) {
    if (cursor.timer) clearTimeout(cursor.timer);
    cursor.el.remove();
  }
  remoteCursors.clear();
  knownPeers.clear();
  notifyPeers();
}

// --- Cursor rendering ---

export function updateRemoteCursor(data: CursorData, viewState: ViewState): void {
  if (!cursorContainer) return;

  // Also track as known peer (so peers indicator persists even when cursor hides)
  knownPeers.set(data.clientId, { name: data.name, color: data.color });

  let cursor = remoteCursors.get(data.clientId);
  if (!cursor) {
    const el = document.createElement('div');
    el.style.cssText =
      'position:absolute;left:0;top:0;pointer-events:none;' +
      'transition:transform 0.08s linear;z-index:50;';
    el.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 20 20" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3))">' +
      '<path d="M3 2L3 16L7.5 12L12 18L14 17L9.5 11L15 10Z" fill="' +
      esc(data.color) + '" stroke="#fff" stroke-width="1.5"/></svg>' +
      '<span style="position:absolute;left:16px;top:14px;background:' +
      esc(data.color) + ';color:#fff;font-size:11px;padding:1px 6px;border-radius:3px;' +
      'white-space:nowrap;font-family:system-ui;pointer-events:none">' +
      esc(data.name) + '</span>';
    cursorContainer.appendChild(el);
    cursor = {
      el, name: data.name, color: data.color,
      sceneX: data.sceneX, sceneY: data.sceneY, timer: null,
    };
    remoteCursors.set(data.clientId, cursor);
  }

  cursor.sceneX = data.sceneX;
  cursor.sceneY = data.sceneY;

  // Update name label if changed
  if (data.name !== cursor.name) {
    cursor.name = data.name;
    const label = cursor.el.querySelector('span');
    if (label) label.textContent = data.name;
  }

  positionCursor(cursor, viewState);

  // Auto-remove after 5s of no updates
  if (cursor.timer) clearTimeout(cursor.timer);
  cursor.timer = setTimeout(() => removeRemoteCursor(data.clientId), 5000);

  notifyPeers();
}

function positionCursor(cursor: RemoteCursor, vs: ViewState): void {
  // Scene coords -> viewport pixels (relative to the Excalidraw container)
  const vx = (cursor.sceneX + vs.scrollX) * vs.zoom.value;
  const vy = (cursor.sceneY + vs.scrollY) * vs.zoom.value;
  cursor.el.style.transform = `translate(${Math.round(vx)}px, ${Math.round(vy)}px)`;
}

/** Reposition all remote cursors after local pan/zoom changes. */
export function repositionAllCursors(viewState: ViewState): void {
  for (const cursor of remoteCursors.values()) {
    positionCursor(cursor, viewState);
  }
}

export function removeRemoteCursor(clientId: string): void {
  const cursor = remoteCursors.get(clientId);
  if (!cursor) return;
  if (cursor.timer) clearTimeout(cursor.timer);
  cursor.el.remove();
  remoteCursors.delete(clientId);
  // Note: cursor timeout (5s idle) does not remove from known peers.
  // Only explicit leave/disconnect removes peers.
}

function notifyPeers(): void {
  if (!peersCallback) return;
  const peers = Array.from(knownPeers.values());
  peersCallback(peers);
}
